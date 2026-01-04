// showcase.cjs
import express from 'express';
import fs from 'fs';
import path from 'path';
import cors from 'cors';
import multer from 'multer';
import sharp from 'sharp';
import { v4 as uuidv4 } from 'uuid';

const app = express();
const PORT = process.env.PORT || 49624;

// Pfade
const SHOWCASE_DB = path.join(__dirname, 'showcase.json');
const UPLOADS_DIR = path.join(__dirname, 'uploads');

// Middleware
app.use(cors());
app.use(express.json());
app.use('/uploads', express.static(UPLOADS_DIR));

// Initialisierung
if (!fs.existsSync(SHOWCASE_DB)) fs.writeFileSync(SHOWCASE_DB, '[]');
if (!fs.existsSync(UPLOADS_DIR)) fs.mkdirSync(UPLOADS_DIR);

// Multer für Logo-Upload
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 }, // max 5MB
  fileFilter(req, file, cb) {
    const ok = ['image/png','image/jpeg','image/webp'].includes(file.mimetype);
    cb(null, ok);
  }
});

// GET Showcase-Einträge
app.get('/api/showcase', (req, res) => {
  try {
    const data = JSON.parse(fs.readFileSync(SHOWCASE_DB, 'utf8'));
    res.json(data);
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: 'Fehler beim Laden des Showcase' });
  }
});

// POST neuer Showcase-Eintrag
app.post('/api/showcase', upload.single('logo'), async (req, res) => {
  try {
    const { name, description, inviteLink, category, tags } = req.body;
    const errs = {};
    if (!name?.trim()) errs.name = 'Name ist Pflicht';
    if (!description?.trim()) errs.description = 'Beschreibung ist Pflicht';
    if (!inviteLink?.trim() || !/^dcs\.lol\/[A-Za-z0-9_-]+$/.test(inviteLink)) {
      errs.inviteLink = 'Nur dcs.lol Links erlaubt';
    }
    if (!category) errs.category = 'Kategorie ist Pflicht';
    let tagArray = [];
    if (tags) {
      try { tagArray = JSON.parse(tags); }
      catch { tagArray = tags.split(',').map(t => t.trim()).filter(t => t); }
    }
    if (tagArray.length > 5) errs.tags = 'Maximal 5 Tags erlaubt';
    if (!req.file) errs.logo = 'Logo ist Pflicht';
    if (Object.keys(errs).length) return res.status(400).json({ error: errs });

    const id = uuidv4();
    const filename = `${id}.webp`;
    const outPath = path.join(UPLOADS_DIR, filename);
    await sharp(req.file.buffer)
      .resize(512, 512, { fit: 'cover' })
      .webp({ quality: 80 })
      .toFile(outPath);

    const entry = {
      id,
      name,
      description,
      inviteLink,
      category,
      tags: tagArray,
      logoUrl: `/uploads/${filename}`,
      createdAt: new Date().toISOString()
    };

    const arr = JSON.parse(fs.readFileSync(SHOWCASE_DB, 'utf8'));
    arr.unshift(entry);
    fs.writeFileSync(SHOWCASE_DB, JSON.stringify(arr, null, 2));

    res.status(201).json(entry);
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: 'Server-Fehler beim Upload' });
  }
});

app.listen(PORT, () => console.log(`✅ Showcase Backend läuft auf http://localhost:${PORT}`));
