const express = require("express");
const fs = require("fs");
const path = require("path");
const multer = require("multer");
const sharp = require("sharp");
const { v4: uuidv4 } = require("uuid");
const rateLimit = require("express-rate-limit");
const mysql = require("mysql2/promise");
require("dotenv").config({ path: path.join(__dirname, "..", ".env") });

// Paths
const SHOWCASE_JSON = path.join(__dirname, "showcase.json");
const UPLOADS_DIR = path.join(__dirname, "uploads");

// Ensure storage exists
if (!fs.existsSync(UPLOADS_DIR)) fs.mkdirSync(UPLOADS_DIR, { recursive: true });
if (!fs.existsSync(SHOWCASE_JSON)) fs.writeFileSync(SHOWCASE_JSON, "[]");

// DB pool (separate from links pool for minimal coupling)
const pool = mysql.createPool({
  host: process.env.MYSQL_HOST || "127.0.0.1",
  port: Number(process.env.MYSQL_PORT) || 3306,
  user: process.env.MYSQL_USER || "root",
  password: process.env.MYSQL_PASSWORD || "",
  database: process.env.MYSQL_DATABASE || "dcs",
  waitForConnections: true,
  connectionLimit: Number(process.env.MYSQL_CONN_LIMIT) || 10,
  queueLimit: 0,
});

async function ensureShowcaseSchema() {
  const sql = `
    CREATE TABLE IF NOT EXISTS showcase (
      id VARCHAR(64) PRIMARY KEY,
      name VARCHAR(255) NOT NULL,
      description TEXT NOT NULL,
      invite_link VARCHAR(512) NOT NULL,
      category VARCHAR(64) NOT NULL,
      tags TEXT NOT NULL,
      logo_url VARCHAR(512) NOT NULL,
      featured TINYINT(1) NOT NULL DEFAULT 0,
      verified TINYINT(1) NOT NULL DEFAULT 0,
      created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
  `;
  await pool.query(sql);
}

async function maybeImportLegacyIfEmpty() {
  try {
    const [rows] = await pool.query("SELECT COUNT(*) AS cnt FROM showcase");
    const cnt = rows && rows[0] ? Number(rows[0].cnt) : 0;
    if (cnt === 0 && fs.existsSync(SHOWCASE_JSON)) {
      let list = [];
      try { list = JSON.parse(fs.readFileSync(SHOWCASE_JSON, "utf8")); } catch {}
      if (Array.isArray(list) && list.length) {
        if (Array.isArray(list[0])) {
          try { list = list.flat(1); } catch { list = [].concat(...list); }
        }
        const values = list.map((x) => [
          String(x.id || uuidv4()),
          String(x.name || ""),
          String(typeof x.description === 'string' ? x.description : ''),
          String(x.inviteLink || ''),
          String(x.category || ''),
          JSON.stringify(Array.isArray(x.tags) ? x.tags : []),
          normalizeLogoUrl(String(x.logoUrl || '')),
          Number(x.featured ? 1 : 0),
          Number(x.verified ? 1 : 0),
          new Date(x.createdAt || Date.now())
        ]);
        await pool.query(
          "INSERT INTO showcase (id, name, description, invite_link, category, tags, logo_url, featured, verified, created_at) VALUES ?",
          [values]
        );
      }
    }
  } catch (e) {
    // ignore
  }
}

function normalizeLogoUrl(url) {
  if (!url) return "";
  // Map legacy paths
  if (url.startsWith("/backend/uploads/")) return url; // served by index
  if (url.startsWith("/uploads/")) return url;
  if (url.startsWith("uploads/")) return "/uploads/" + url.replace(/^uploads\//, "");
  if (url.startsWith("backend/uploads/")) return "/backend/" + url; // "/backend/uploads/..."
  return url;
}

// Multer (memory)
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
  fileFilter: (req, file, cb) => {
    const ok = ["image/png", "image/jpeg", "image/webp"].includes(file.mimetype);
    cb(null, ok);
  },
});

// Per-route tighter rate limit
const showcaseLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100, // a bit tighter than global
  standardHeaders: true,
  legacyHeaders: false,
});

const router = express.Router();
router.use(showcaseLimiter);

function loadShowcaseJSON() {
  try {
    return JSON.parse(fs.readFileSync(SHOWCASE_JSON, "utf8"));
  } catch (e) {
    return [];
  }
}

function saveShowcaseJSON(arr) {
  fs.writeFileSync(SHOWCASE_JSON, JSON.stringify(arr, null, 2));
}

// Initialize schema and optional legacy import (non-blocking)
ensureShowcaseSchema().then(maybeImportLegacyIfEmpty).catch(() => {});

// GET /api/showcase
router.get("/showcase", async (req, res) => {
  try {
    const [rows] = await pool.query(
      "SELECT id, name, description, invite_link, category, tags, logo_url, featured, verified, created_at FROM showcase ORDER BY created_at DESC"
    );
    const list = (rows || []).map((r) => ({
      id: String(r.id),
      name: r.name,
      description: r.description,
      inviteLink: r.invite_link,
      category: r.category,
      tags: (() => { try { return JSON.parse(r.tags || '[]'); } catch { return []; } })(),
      logoUrl: normalizeLogoUrl(r.logo_url || ''),
      createdAt: new Date(r.created_at).toISOString(),
      featured: Boolean(r.featured),
      verified: Boolean(r.verified),
    }));
    if (list.length === 0) {
      // Fall back to JSON if table empty
      let raw = loadShowcaseJSON();
      if (raw.length > 0 && Array.isArray(raw[0])) {
        try { raw = raw.flat(1); } catch { raw = [].concat(...raw); }
      }
      const normalized = (raw || []).map((x) => ({
        id: String(x.id || ''),
        name: String(x.name || ''),
        description: typeof x.description === 'string' ? x.description : '',
        inviteLink: String(x.inviteLink || ''),
        category: String(x.category || ''),
        tags: Array.isArray(x.tags) ? x.tags : [],
        logoUrl: normalizeLogoUrl(String(x.logoUrl || '')),
        createdAt: x.createdAt ? new Date(x.createdAt).toISOString() : new Date().toISOString(),
        featured: Boolean(x.featured),
        verified: Boolean(x.verified),
      }));
      return res.json(normalized);
    }
    res.json(list);
  } catch (e) {
    // On DB error, try JSON
    try {
      let raw = loadShowcaseJSON();
      if (raw.length > 0 && Array.isArray(raw[0])) {
        try { raw = raw.flat(1); } catch { raw = [].concat(...raw); }
      }
      const normalized = (raw || []).map((x) => ({
        id: String(x.id || ''),
        name: String(x.name || ''),
        description: typeof x.description === 'string' ? x.description : '',
        inviteLink: String(x.inviteLink || ''),
        category: String(x.category || ''),
        tags: Array.isArray(x.tags) ? x.tags : [],
        logoUrl: normalizeLogoUrl(String(x.logoUrl || '')),
        createdAt: x.createdAt ? new Date(x.createdAt).toISOString() : new Date().toISOString(),
        featured: Boolean(x.featured),
        verified: Boolean(x.verified),
      }));
      res.json(normalized);
    } catch {
      res.status(500).json({ error: "Fehler beim Laden des Showcase" });
    }
  }
});

// POST /api/showcase
router.post("/showcase", upload.single("logo"), async (req, res) => {
  try {
    const { name, description, inviteLink, category, tags } = req.body || {};

    const errors = {};
    if (!name || !name.trim()) errors.name = "Name ist Pflicht";
    if (!description || !description.trim()) errors.description = "Beschreibung ist Pflicht";
    if (!inviteLink || !/^dcs\.lol\/[A-Za-z0-9_-]{3,64}$/.test(inviteLink)) {
      errors.inviteLink = "Nur dcs.lol/<id> Links erlaubt";
    }
    if (!category || !category.trim()) errors.category = "Kategorie ist Pflicht";
    if (!req.file) errors.logo = "Logo ist Pflicht";

    let tagArray = [];
    if (tags) {
      try {
        const parsed = typeof tags === "string" ? JSON.parse(tags) : tags;
        tagArray = Array.isArray(parsed) ? parsed : [];
      } catch {
        tagArray = tags
          .toString()
          .split(",")
          .map((t) => t.trim())
          .filter(Boolean);
      }
    }
    if (tagArray.length > 5) errors.tags = "Maximal 5 Tags erlaubt";

    if (Object.keys(errors).length) return res.status(400).json({ error: errors });

    const id = uuidv4();
    const filename = `${id}.webp`;
    const outPath = path.join(UPLOADS_DIR, filename);

    await sharp(req.file.buffer)
      .resize(512, 512, { fit: "cover" })
      .webp({ quality: 80 })
      .toFile(outPath);

    const logoUrl = `/uploads/${filename}`;

    // Persist to DB
    await ensureShowcaseSchema();
    await pool.query(
      "INSERT INTO showcase (id, name, description, invite_link, category, tags, logo_url, featured, verified) VALUES (?, ?, ?, ?, ?, ?, ?, 0, 0)",
      [id, name.trim(), description.trim(), inviteLink.trim(), category.trim(), JSON.stringify(tagArray), logoUrl]
    );

    const entry = {
      id,
      name: name.trim(),
      description: description.trim(),
      inviteLink: inviteLink.trim(),
      category: category.trim(),
      tags: tagArray,
      logoUrl,
      createdAt: new Date().toISOString(),
      featured: false,
      verified: false,
    };

    // Also append to JSON for simple human backup (best-effort)
    try {
      const data = loadShowcaseJSON();
      data.unshift(entry);
      saveShowcaseJSON(data);
    } catch {}

    res.status(201).json(entry);
  } catch (e) {
    console.error("Showcase upload error:", e);
    res.status(500).json({ error: "Server-Fehler beim Upload" });
  }
});

module.exports = { router, UPLOADS_DIR };
