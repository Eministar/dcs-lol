const express = require("express");
const fs = require("fs");
const path = require("path");
const multer = require("multer");
const sharp = require("sharp");
const {v4: uuidv4} = require("uuid");
const rateLimit = require("express-rate-limit");
const mysql = require("mysql2/promise");
require("dotenv").config({path: path.join(__dirname, "..", ".env")});

// Paths
const SHOWCASE_JSON = path.join(__dirname, "showcase.json");
const UPLOADS_DIR = path.join(__dirname, "uploads");

// Ensure storage exists
if (!fs.existsSync(UPLOADS_DIR)) fs.mkdirSync(UPLOADS_DIR, {recursive: true});
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
        CREATE TABLE IF NOT EXISTS showcase
        (
            id
            VARCHAR
        (
            64
        ) PRIMARY KEY,
            name VARCHAR
        (
            255
        ) NOT NULL,
            description TEXT NOT NULL,
            invite_link VARCHAR
        (
            512
        ) NOT NULL,
            category VARCHAR
        (
            64
        ) NOT NULL,
            tags TEXT NOT NULL,
            logo_url VARCHAR
        (
            512
        ) NOT NULL,
            featured TINYINT
        (
            1
        ) NOT NULL DEFAULT 0,
            verified TINYINT
        (
            1
        ) NOT NULL DEFAULT 0,
            owner_id VARCHAR
        (
            64
        ) DEFAULT NULL,
            member_count INT DEFAULT 0,
            views INT DEFAULT 0,
            created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
            ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
    `;
    await pool.query(sql);

    // Ratings table for server reviews
    const ratingsSql = `
        CREATE TABLE IF NOT EXISTS showcase_ratings
        (
            id
            BIGINT
            AUTO_INCREMENT
            PRIMARY
            KEY,
            showcase_id
            VARCHAR
        (
            64
        ) NOT NULL,
            user_id BIGINT NOT NULL,
            rating TINYINT NOT NULL CHECK
        (
            rating
            >=
            1
            AND
            rating
            <=
            5
        ),
            review TEXT,
            created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
            updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
            UNIQUE KEY unique_user_showcase
        (
            showcase_id,
            user_id
        ),
            FOREIGN KEY
        (
            showcase_id
        ) REFERENCES showcase
        (
            id
        )
                                                                   ON DELETE CASCADE
            ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
    `;
    await pool.query(ratingsSql);

    // Favorites table for users to save servers
    const favoritesSql = `
        CREATE TABLE IF NOT EXISTS showcase_favorites
        (
            id
            BIGINT
            AUTO_INCREMENT
            PRIMARY
            KEY,
            showcase_id
            VARCHAR
        (
            64
        ) NOT NULL,
            user_id BIGINT NOT NULL,
            created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
            UNIQUE KEY unique_user_fav
        (
            showcase_id,
            user_id
        ),
            FOREIGN KEY
        (
            showcase_id
        ) REFERENCES showcase
        (
            id
        ) ON DELETE CASCADE
            ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
    `;
    await pool.query(favoritesSql);

    // Reports table for flagging inappropriate content
    const reportsSql = `
        CREATE TABLE IF NOT EXISTS showcase_reports
        (
            id
            BIGINT
            AUTO_INCREMENT
            PRIMARY
            KEY,
            showcase_id
            VARCHAR
        (
            64
        ) NOT NULL,
            user_id BIGINT NOT NULL,
            reason VARCHAR
        (
            64
        ) NOT NULL,
            details TEXT,
            status ENUM
        (
            'pending',
            'reviewed',
            'resolved'
        ) DEFAULT 'pending',
            created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY
        (
            showcase_id
        ) REFERENCES showcase
        (
            id
        ) ON DELETE CASCADE
            ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
    `;
    await pool.query(reportsSql);

    // Add new columns if they don't exist (for migration)
    const columnsToAdd = [
        "ALTER TABLE showcase ADD COLUMN owner_id VARCHAR(64) DEFAULT NULL",
        "ALTER TABLE showcase ADD COLUMN member_count INT DEFAULT 0",
        "ALTER TABLE showcase ADD COLUMN views INT DEFAULT 0"
    ];
    for (const sql of columnsToAdd) {
        try {
            await pool.query(sql);
        } catch (e) {
            // Column already exists, ignore
        }
    }
}

async function maybeImportLegacyIfEmpty() {
    try {
        const [rows] = await pool.query("SELECT COUNT(*) AS cnt FROM showcase");
        const cnt = rows && rows[0] ? Number(rows[0].cnt) : 0;
        if (cnt === 0 && fs.existsSync(SHOWCASE_JSON)) {
            let list = [];
            try {
                list = JSON.parse(fs.readFileSync(SHOWCASE_JSON, "utf8"));
            } catch {
            }
            if (Array.isArray(list) && list.length) {
                if (Array.isArray(list[0])) {
                    try {
                        list = list.flat(1);
                    } catch {
                        list = [].concat(...list);
                    }
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
    limits: {fileSize: 5 * 1024 * 1024}, // 5MB
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
ensureShowcaseSchema().then(maybeImportLegacyIfEmpty).catch(() => {
});

// GET /api/showcase
router.get("/showcase", async (req, res) => {
    try {
        const [rows] = await pool.query(`
            SELECT s.id,
                   s.name,
                   s.description,
                   s.invite_link,
                   s.category,
                   s.tags,
                   s.logo_url,
                   s.featured,
                   s.verified,
                   s.created_at,
                   s.member_count,
                   s.views,
                   COALESCE(AVG(r.rating), 0) as avg_rating,
                   COUNT(DISTINCT r.id)       as rating_count,
                   COUNT(DISTINCT f.id)       as favorite_count
            FROM showcase s
                     LEFT JOIN showcase_ratings r ON s.id = r.showcase_id
                     LEFT JOIN showcase_favorites f ON s.id = f.showcase_id
            GROUP BY s.id
            ORDER BY s.featured DESC, s.created_at DESC
        `);
        const list = (rows || []).map((r) => ({
            id: String(r.id),
            name: r.name,
            description: r.description,
            inviteLink: r.invite_link,
            category: r.category,
            tags: (() => {
                try {
                    return JSON.parse(r.tags || '[]');
                } catch {
                    return [];
                }
            })(),
            logoUrl: normalizeLogoUrl(r.logo_url || ''),
            createdAt: new Date(r.created_at).toISOString(),
            featured: Boolean(r.featured),
            verified: Boolean(r.verified),
            memberCount: Number(r.member_count) || 0,
            views: Number(r.views) || 0,
            avgRating: Math.round((Number(r.avg_rating) || 0) * 10) / 10,
            ratingCount: Number(r.rating_count) || 0,
            favoriteCount: Number(r.favorite_count) || 0,
        }));
        if (list.length === 0) {
            // Fall back to JSON if table empty
            let raw = loadShowcaseJSON();
            if (raw.length > 0 && Array.isArray(raw[0])) {
                try {
                    raw = raw.flat(1);
                } catch {
                    raw = [].concat(...raw);
                }
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
                try {
                    raw = raw.flat(1);
                } catch {
                    raw = [].concat(...raw);
                }
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
            res.status(500).json({error: "Fehler beim Laden des Showcase"});
        }
    }
});

// POST /api/showcase
router.post("/showcase", upload.single("logo"), async (req, res) => {
    try {
        const {name, description, inviteLink, category, tags} = req.body || {};

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

        if (Object.keys(errors).length) return res.status(400).json({error: errors});

        const id = uuidv4();
        const filename = `${id}.webp`;
        const outPath = path.join(UPLOADS_DIR, filename);

        await sharp(req.file.buffer)
            .resize(512, 512, {fit: "cover"})
            .webp({quality: 80})
            .toFile(outPath);

        const logoUrl = `/uploads/${filename}`;

        // Get owner_id from user if logged in
        const ownerId = req.user?.id || null;

        // Persist to DB
        await ensureShowcaseSchema();
        await pool.query(
            "INSERT INTO showcase (id, name, description, invite_link, category, tags, logo_url, featured, verified, owner_id) VALUES (?, ?, ?, ?, ?, ?, ?, 0, 0, ?)",
            [id, name.trim(), description.trim(), inviteLink.trim(), category.trim(), JSON.stringify(tagArray), logoUrl, ownerId]
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
        } catch {
        }

        res.status(201).json(entry);
    } catch (e) {
        console.error("Showcase upload error:", e);
        res.status(500).json({error: "Server-Fehler beim Upload"});
    }
});

// GET /api/showcase/my - Get user's own showcase entries
router.get("/showcase/my", async (req, res) => {
    if (!req.user?.id) {
        return res.status(401).json({error: "Nicht eingeloggt"});
    }

    try {
        const [rows] = await pool.query(
            "SELECT id, name, description, invite_link, category, tags, logo_url, featured, verified, created_at, owner_id FROM showcase WHERE owner_id = ? ORDER BY created_at DESC",
            [req.user.id]
        );
        const list = (rows || []).map((r) => ({
            id: String(r.id),
            name: r.name,
            description: r.description,
            inviteLink: r.invite_link,
            category: r.category,
            tags: (() => {
                try {
                    return JSON.parse(r.tags || '[]');
                } catch {
                    return [];
                }
            })(),
            logoUrl: normalizeLogoUrl(r.logo_url || ''),
            createdAt: new Date(r.created_at).toISOString(),
            featured: Boolean(r.featured),
            verified: Boolean(r.verified),
        }));
        res.json(list);
    } catch (e) {
        console.error("Showcase my error:", e);
        res.status(500).json({error: "Fehler beim Laden"});
    }
});

// PUT /api/showcase/:id - Update a showcase entry
router.put("/showcase/:id", upload.single("logo"), async (req, res) => {
    if (!req.user?.id) {
        return res.status(401).json({error: "Nicht eingeloggt"});
    }

    const {id} = req.params;
    const {name, description, inviteLink, category, tags} = req.body || {};

    try {
        // Check ownership
        const [rows] = await pool.query("SELECT owner_id FROM showcase WHERE id = ?", [id]);
        if (!rows || rows.length === 0) {
            return res.status(404).json({error: "Eintrag nicht gefunden"});
        }
        if (rows[0].owner_id && rows[0].owner_id !== req.user.id) {
            return res.status(403).json({error: "Keine Berechtigung"});
        }

        const errors = {};
        if (name !== undefined && !name.trim()) errors.name = "Name ist Pflicht";
        if (description !== undefined && !description.trim()) errors.description = "Beschreibung ist Pflicht";
        if (inviteLink !== undefined && !/^dcs\.lol\/[A-Za-z0-9_-]{3,64}$/.test(inviteLink)) {
            errors.inviteLink = "Nur dcs.lol/<id> Links erlaubt";
        }
        if (category !== undefined && !category.trim()) errors.category = "Kategorie ist Pflicht";

        let tagArray;
        if (tags !== undefined) {
            try {
                const parsed = typeof tags === "string" ? JSON.parse(tags) : tags;
                tagArray = Array.isArray(parsed) ? parsed : [];
            } catch {
                tagArray = tags.toString().split(",").map((t) => t.trim()).filter(Boolean);
            }
            if (tagArray.length > 5) errors.tags = "Maximal 5 Tags erlaubt";
        }

        if (Object.keys(errors).length) return res.status(400).json({error: errors});

        let logoUrl;
        if (req.file) {
            const filename = `${id}.webp`;
            const outPath = path.join(UPLOADS_DIR, filename);
            await sharp(req.file.buffer)
                .resize(512, 512, {fit: "cover"})
                .webp({quality: 80})
                .toFile(outPath);
            logoUrl = `/uploads/${filename}`;
        }

        // Build update query
        const updates = [];
        const values = [];

        if (name !== undefined) {
            updates.push("name = ?");
            values.push(name.trim());
        }
        if (description !== undefined) {
            updates.push("description = ?");
            values.push(description.trim());
        }
        if (inviteLink !== undefined) {
            updates.push("invite_link = ?");
            values.push(inviteLink.trim());
        }
        if (category !== undefined) {
            updates.push("category = ?");
            values.push(category.trim());
        }
        if (tagArray !== undefined) {
            updates.push("tags = ?");
            values.push(JSON.stringify(tagArray));
        }
        if (logoUrl) {
            updates.push("logo_url = ?");
            values.push(logoUrl);
        }

        if (updates.length > 0) {
            values.push(id);
            await pool.query(`UPDATE showcase
                              SET ${updates.join(", ")}
                              WHERE id = ?`, values);
        }

        // Fetch updated entry
        const [updated] = await pool.query(
            "SELECT id, name, description, invite_link, category, tags, logo_url, featured, verified, created_at FROM showcase WHERE id = ?",
            [id]
        );

        if (updated && updated.length > 0) {
            const r = updated[0];
            res.json({
                id: String(r.id),
                name: r.name,
                description: r.description,
                inviteLink: r.invite_link,
                category: r.category,
                tags: (() => {
                    try {
                        return JSON.parse(r.tags || '[]');
                    } catch {
                        return [];
                    }
                })(),
                logoUrl: normalizeLogoUrl(r.logo_url || ''),
                createdAt: new Date(r.created_at).toISOString(),
                featured: Boolean(r.featured),
                verified: Boolean(r.verified),
            });
        } else {
            res.json({success: true});
        }
    } catch (e) {
        console.error("Showcase update error:", e);
        res.status(500).json({error: "Server-Fehler beim Update"});
    }
});

// DELETE /api/showcase/:id - Delete a showcase entry
router.delete("/showcase/:id", async (req, res) => {
    if (!req.user?.id) {
        return res.status(401).json({error: "Nicht eingeloggt"});
    }

    const {id} = req.params;

    try {
        // Check ownership
        const [rows] = await pool.query("SELECT owner_id, logo_url FROM showcase WHERE id = ?", [id]);
        if (!rows || rows.length === 0) {
            return res.status(404).json({error: "Eintrag nicht gefunden"});
        }
        if (rows[0].owner_id && rows[0].owner_id !== req.user.id) {
            return res.status(403).json({error: "Keine Berechtigung"});
        }

        // Delete logo file if exists
        const logoUrl = rows[0].logo_url;
        if (logoUrl && logoUrl.startsWith("/uploads/")) {
            const filename = logoUrl.replace("/uploads/", "");
            const filepath = path.join(UPLOADS_DIR, filename);
            if (fs.existsSync(filepath)) {
                fs.unlinkSync(filepath);
            }
        }

        // Delete from DB
        await pool.query("DELETE FROM showcase WHERE id = ?", [id]);

        // Also remove from JSON backup
        try {
            const data = loadShowcaseJSON();
            const filtered = data.filter(entry => entry.id !== id);
            saveShowcaseJSON(filtered);
        } catch {
        }

        res.json({success: true});
    } catch (e) {
        console.error("Showcase delete error:", e);
        res.status(500).json({error: "Server-Fehler beim Löschen"});
    }
});

// GET /api/showcase/:id - Get single server with all details
router.get("/showcase/:id", async (req, res) => {
    const {id} = req.params;
    try {
        // Increment view count
        await pool.query("UPDATE showcase SET views = views + 1 WHERE id = ?", [id]);

        const [rows] = await pool.query(`
            SELECT s.id,
                   s.name,
                   s.description,
                   s.invite_link,
                   s.category,
                   s.tags,
                   s.logo_url,
                   s.featured,
                   s.verified,
                   s.created_at,
                   s.member_count,
                   s.views,
                   COALESCE(AVG(r.rating), 0) as avg_rating,
                   COUNT(DISTINCT r.id)       as rating_count,
                   COUNT(DISTINCT f.id)       as favorite_count
            FROM showcase s
                     LEFT JOIN showcase_ratings r ON s.id = r.showcase_id
                     LEFT JOIN showcase_favorites f ON s.id = f.showcase_id
            WHERE s.id = ?
            GROUP BY s.id
        `, [id]);

        if (!rows || rows.length === 0) {
            return res.status(404).json({error: "Server nicht gefunden"});
        }

        const r = rows[0];
        const server = {
            id: String(r.id),
            name: r.name,
            description: r.description,
            inviteLink: r.invite_link,
            category: r.category,
            tags: (() => {
                try {
                    return JSON.parse(r.tags || '[]');
                } catch {
                    return [];
                }
            })(),
            logoUrl: normalizeLogoUrl(r.logo_url || ''),
            createdAt: new Date(r.created_at).toISOString(),
            featured: Boolean(r.featured),
            verified: Boolean(r.verified),
            memberCount: Number(r.member_count) || 0,
            views: Number(r.views) || 0,
            avgRating: Math.round((Number(r.avg_rating) || 0) * 10) / 10,
            ratingCount: Number(r.rating_count) || 0,
            favoriteCount: Number(r.favorite_count) || 0,
        };

        // Get recent reviews
        const [reviews] = await pool.query(`
            SELECT r.*, u.username, u.avatar
            FROM showcase_ratings r
                     LEFT JOIN users u ON r.user_id = u.id
            WHERE r.showcase_id = ?
            ORDER BY r.created_at DESC LIMIT 20
        `, [id]);

        server.reviews = (reviews || []).map(rev => ({
            id: rev.id,
            rating: rev.rating,
            review: rev.review,
            username: rev.username || 'Anonym',
            avatar: rev.avatar,
            createdAt: new Date(rev.created_at).toISOString()
        }));

        // Check if current user has rated/favorited
        if (req.user?.id) {
            const [userRating] = await pool.query(
                "SELECT rating, review FROM showcase_ratings WHERE showcase_id = ? AND user_id = ?",
                [id, req.user.id]
            );
            server.userRating = userRating && userRating[0] ? userRating[0] : null;

            const [userFav] = await pool.query(
                "SELECT id FROM showcase_favorites WHERE showcase_id = ? AND user_id = ?",
                [id, req.user.id]
            );
            server.userFavorited = userFav && userFav.length > 0;
        }

        res.json(server);
    } catch (e) {
        console.error("Showcase get error:", e);
        res.status(500).json({error: "Fehler beim Laden"});
    }
});

// POST /api/showcase/:id/rate - Rate a server (1-5 stars)
router.post("/showcase/:id/rate", async (req, res) => {
    if (!req.user?.id) {
        return res.status(401).json({error: "Bitte einloggen um zu bewerten"});
    }

    const {id} = req.params;
    const {rating, review} = req.body;

    if (!rating || rating < 1 || rating > 5) {
        return res.status(400).json({error: "Bewertung muss zwischen 1 und 5 sein"});
    }

    try {
        // Check if server exists
        const [server] = await pool.query("SELECT id, owner_id FROM showcase WHERE id = ?", [id]);
        if (!server || server.length === 0) {
            return res.status(404).json({error: "Server nicht gefunden"});
        }

        // Prevent self-rating
        if (server[0].owner_id === req.user.id) {
            return res.status(400).json({error: "Du kannst deinen eigenen Server nicht bewerten"});
        }

        // Upsert rating
        await pool.query(`
            INSERT INTO showcase_ratings (showcase_id, user_id, rating, review)
            VALUES (?, ?, ?, ?) ON DUPLICATE KEY
            UPDATE rating =
            VALUES (rating), review =
            VALUES (review), updated_at = NOW()
        `, [id, req.user.id, rating, review || null]);

        // Get new average
        const [avg] = await pool.query(
            "SELECT AVG(rating) as avg, COUNT(*) as count FROM showcase_ratings WHERE showcase_id = ?",
            [id]
        );

        res.json({
            success: true,
            avgRating: Math.round((Number(avg[0]?.avg) || 0) * 10) / 10,
            ratingCount: Number(avg[0]?.count) || 0
        });
    } catch (e) {
        console.error("Rating error:", e);
        res.status(500).json({error: "Fehler beim Bewerten"});
    }
});

// DELETE /api/showcase/:id/rate - Remove own rating
router.delete("/showcase/:id/rate", async (req, res) => {
    if (!req.user?.id) {
        return res.status(401).json({error: "Nicht eingeloggt"});
    }

    const {id} = req.params;

    try {
        await pool.query(
            "DELETE FROM showcase_ratings WHERE showcase_id = ? AND user_id = ?",
            [id, req.user.id]
        );
        res.json({success: true});
    } catch (e) {
        console.error("Delete rating error:", e);
        res.status(500).json({error: "Fehler beim Löschen"});
    }
});

// GET /api/showcase/:id/reviews - Get all reviews for a server
router.get("/showcase/:id/reviews", async (req, res) => {
    const {id} = req.params;
    const page = parseInt(req.query.page) || 1;
    const limit = Math.min(parseInt(req.query.limit) || 20, 100);
    const offset = (page - 1) * limit;

    try {
        const [reviews] = await pool.query(`
            SELECT r.*, u.username, u.avatar
            FROM showcase_ratings r
                     LEFT JOIN users u ON r.user_id = u.id
            WHERE r.showcase_id = ?
            ORDER BY r.created_at DESC LIMIT ?
            OFFSET ?
        `, [id, limit, offset]);

        const [countResult] = await pool.query(
            "SELECT COUNT(*) as total FROM showcase_ratings WHERE showcase_id = ?",
            [id]
        );

        res.json({
            reviews: (reviews || []).map(rev => ({
                id: rev.id,
                rating: rev.rating,
                review: rev.review,
                username: rev.username || 'Anonym',
                avatar: rev.avatar,
                createdAt: new Date(rev.created_at).toISOString()
            })),
            total: countResult[0]?.total || 0,
            page,
            limit
        });
    } catch (e) {
        console.error("Get reviews error:", e);
        res.status(500).json({error: "Fehler beim Laden"});
    }
});

// POST /api/showcase/:id/favorite - Toggle favorite
router.post("/showcase/:id/favorite", async (req, res) => {
    if (!req.user?.id) {
        return res.status(401).json({error: "Bitte einloggen um zu favorisieren"});
    }

    const {id} = req.params;

    try {
        // Check if already favorited
        const [existing] = await pool.query(
            "SELECT id FROM showcase_favorites WHERE showcase_id = ? AND user_id = ?",
            [id, req.user.id]
        );

        if (existing && existing.length > 0) {
            // Remove favorite
            await pool.query(
                "DELETE FROM showcase_favorites WHERE showcase_id = ? AND user_id = ?",
                [id, req.user.id]
            );
            res.json({favorited: false});
        } else {
            // Add favorite
            await pool.query(
                "INSERT INTO showcase_favorites (showcase_id, user_id) VALUES (?, ?)",
                [id, req.user.id]
            );
            res.json({favorited: true});
        }
    } catch (e) {
        console.error("Favorite error:", e);
        res.status(500).json({error: "Fehler"});
    }
});

// GET /api/showcase/favorites - Get user's favorited servers
router.get("/favorites", async (req, res) => {
    if (!req.user?.id) {
        return res.status(401).json({error: "Nicht eingeloggt"});
    }

    try {
        const [rows] = await pool.query(`
            SELECT s.id,
                   s.name,
                   s.description,
                   s.invite_link,
                   s.category,
                   s.tags,
                   s.logo_url,
                   s.featured,
                   s.verified,
                   s.created_at,
                   s.member_count,
                   s.views,
                   COALESCE(AVG(r.rating), 0) as avg_rating,
                   COUNT(DISTINCT r.id)       as rating_count
            FROM showcase s
                     INNER JOIN showcase_favorites f ON s.id = f.showcase_id
                     LEFT JOIN showcase_ratings r ON s.id = r.showcase_id
            WHERE f.user_id = ?
            GROUP BY s.id
            ORDER BY f.created_at DESC
        `, [req.user.id]);

        const list = (rows || []).map((r) => ({
            id: String(r.id),
            name: r.name,
            description: r.description,
            inviteLink: r.invite_link,
            category: r.category,
            tags: (() => {
                try {
                    return JSON.parse(r.tags || '[]');
                } catch {
                    return [];
                }
            })(),
            logoUrl: normalizeLogoUrl(r.logo_url || ''),
            createdAt: new Date(r.created_at).toISOString(),
            featured: Boolean(r.featured),
            verified: Boolean(r.verified),
            memberCount: Number(r.member_count) || 0,
            views: Number(r.views) || 0,
            avgRating: Math.round((Number(r.avg_rating) || 0) * 10) / 10,
            ratingCount: Number(r.rating_count) || 0,
        }));
        res.json(list);
    } catch (e) {
        console.error("Favorites error:", e);
        res.status(500).json({error: "Fehler beim Laden"});
    }
});

// POST /api/showcase/:id/report - Report inappropriate content
router.post("/showcase/:id/report", async (req, res) => {
    if (!req.user?.id) {
        return res.status(401).json({error: "Bitte einloggen um zu melden"});
    }

    const {id} = req.params;
    const {reason, details} = req.body;

    const validReasons = ['spam', 'inappropriate', 'scam', 'copyright', 'other'];
    if (!reason || !validReasons.includes(reason)) {
        return res.status(400).json({error: "Ungültiger Meldegrund"});
    }

    try {
        await pool.query(
            "INSERT INTO showcase_reports (showcase_id, user_id, reason, details) VALUES (?, ?, ?, ?)",
            [id, req.user.id, reason, details || null]
        );
        res.json({success: true, message: "Danke für deine Meldung!"});
    } catch (e) {
        console.error("Report error:", e);
        res.status(500).json({error: "Fehler beim Melden"});
    }
});

// GET /api/showcase/search - Search servers
router.get("/search", async (req, res) => {
    const {q, category, tag, sort} = req.query;
    const page = parseInt(req.query.page) || 1;
    const limit = Math.min(parseInt(req.query.limit) || 20, 50);
    const offset = (page - 1) * limit;

    try {
        let whereClause = "1=1";
        const params = [];

        if (q) {
            whereClause += " AND (s.name LIKE ? OR s.description LIKE ?)";
            const searchTerm = `%${q}%`;
            params.push(searchTerm, searchTerm);
        }

        if (category) {
            whereClause += " AND s.category = ?";
            params.push(category);
        }

        if (tag) {
            whereClause += " AND s.tags LIKE ?";
            params.push(`%"${tag}"%`);
        }

        let orderBy = "s.featured DESC, s.created_at DESC";
        if (sort === 'rating') {
            orderBy = "avg_rating DESC, rating_count DESC";
        } else if (sort === 'views') {
            orderBy = "s.views DESC";
        } else if (sort === 'favorites') {
            orderBy = "favorite_count DESC";
        } else if (sort === 'newest') {
            orderBy = "s.created_at DESC";
        }

        const [rows] = await pool.query(`
            SELECT s.id,
                   s.name,
                   s.description,
                   s.invite_link,
                   s.category,
                   s.tags,
                   s.logo_url,
                   s.featured,
                   s.verified,
                   s.created_at,
                   s.member_count,
                   s.views,
                   COALESCE(AVG(r.rating), 0) as avg_rating,
                   COUNT(DISTINCT r.id)       as rating_count,
                   COUNT(DISTINCT f.id)       as favorite_count
            FROM showcase s
                     LEFT JOIN showcase_ratings r ON s.id = r.showcase_id
                     LEFT JOIN showcase_favorites f ON s.id = f.showcase_id
            WHERE ${whereClause}
            GROUP BY s.id
            ORDER BY ${orderBy} LIMIT ?
            OFFSET ?
        `, [...params, limit, offset]);

        const list = (rows || []).map((r) => ({
            id: String(r.id),
            name: r.name,
            description: r.description,
            inviteLink: r.invite_link,
            category: r.category,
            tags: (() => {
                try {
                    return JSON.parse(r.tags || '[]');
                } catch {
                    return [];
                }
            })(),
            logoUrl: normalizeLogoUrl(r.logo_url || ''),
            createdAt: new Date(r.created_at).toISOString(),
            featured: Boolean(r.featured),
            verified: Boolean(r.verified),
            memberCount: Number(r.member_count) || 0,
            views: Number(r.views) || 0,
            avgRating: Math.round((Number(r.avg_rating) || 0) * 10) / 10,
            ratingCount: Number(r.rating_count) || 0,
            favoriteCount: Number(r.favorite_count) || 0,
        }));

        res.json({servers: list, page, limit});
    } catch (e) {
        console.error("Search error:", e);
        res.status(500).json({error: "Fehler bei der Suche"});
    }
});

// GET /api/showcase/top - Get top rated servers
router.get("/top", async (req, res) => {
    const limit = Math.min(parseInt(req.query.limit) || 10, 50);

    try {
        const [rows] = await pool.query(`
            SELECT s.id,
                   s.name,
                   s.description,
                   s.invite_link,
                   s.category,
                   s.tags,
                   s.logo_url,
                   s.featured,
                   s.verified,
                   s.created_at,
                   s.member_count,
                   s.views,
                   COALESCE(AVG(r.rating), 0) as avg_rating,
                   COUNT(DISTINCT r.id)       as rating_count,
                   COUNT(DISTINCT f.id)       as favorite_count
            FROM showcase s
                     LEFT JOIN showcase_ratings r ON s.id = r.showcase_id
                     LEFT JOIN showcase_favorites f ON s.id = f.showcase_id
            GROUP BY s.id
            HAVING rating_count >= 1
            ORDER BY avg_rating DESC, rating_count DESC LIMIT ?
        `, [limit]);

        const list = (rows || []).map((r) => ({
            id: String(r.id),
            name: r.name,
            description: r.description,
            inviteLink: r.invite_link,
            category: r.category,
            tags: (() => {
                try {
                    return JSON.parse(r.tags || '[]');
                } catch {
                    return [];
                }
            })(),
            logoUrl: normalizeLogoUrl(r.logo_url || ''),
            createdAt: new Date(r.created_at).toISOString(),
            featured: Boolean(r.featured),
            verified: Boolean(r.verified),
            memberCount: Number(r.member_count) || 0,
            views: Number(r.views) || 0,
            avgRating: Math.round((Number(r.avg_rating) || 0) * 10) / 10,
            ratingCount: Number(r.rating_count) || 0,
            favoriteCount: Number(r.favorite_count) || 0,
        }));

        res.json(list);
    } catch (e) {
        console.error("Top servers error:", e);
        res.status(500).json({error: "Fehler"});
    }
});

// GET /api/showcase/stats - Get showcase statistics
router.get("/showcase-stats", async (req, res) => {
    try {
        const [serverCount] = await pool.query("SELECT COUNT(*) as total FROM showcase");
        const [ratingCount] = await pool.query("SELECT COUNT(*) as total FROM showcase_ratings");
        const [favCount] = await pool.query("SELECT COUNT(*) as total FROM showcase_favorites");
        const [viewsSum] = await pool.query("SELECT COALESCE(SUM(views), 0) as total FROM showcase");
        const [avgRating] = await pool.query("SELECT AVG(rating) as avg FROM showcase_ratings");
        const [categories] = await pool.query(
            "SELECT category, COUNT(*) as count FROM showcase GROUP BY category ORDER BY count DESC"
        );

        res.json({
            totalServers: serverCount[0]?.total || 0,
            totalRatings: ratingCount[0]?.total || 0,
            totalFavorites: favCount[0]?.total || 0,
            totalViews: viewsSum[0]?.total || 0,
            averageRating: Math.round((Number(avgRating[0]?.avg) || 0) * 10) / 10,
            categories: categories || []
        });
    } catch (e) {
        console.error("Stats error:", e);
        res.status(500).json({error: "Fehler"});
    }
});

module.exports = {router, UPLOADS_DIR};
