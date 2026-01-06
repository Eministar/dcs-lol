const express = require("express");
const fs = require("fs");
const path = require("path");
const cors = require("cors");
const axios = require("axios");
axios.defaults.timeout = 7000;
const helmet = require("helmet");
const rateLimit = require("express-rate-limit");
const compression = require("compression");
const morgan = require("morgan");
const mysql = require("mysql2/promise");
const crypto = require("crypto");
require("dotenv").config({path: path.join(__dirname, "..", ".env")});
const {router: showcaseRouter, UPLOADS_DIR} = require("./showcaseRouter.cjs");
const app = express();
const PORT = process.env.PORT || 49623;
const WEBHOOK_PATH = path.join(__dirname, "webhooks.json");

// MySQL Verbindungspool
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

console.log("DB-CONFIG", {
    host: process.env.MYSQL_HOST,
    port: process.env.MYSQL_PORT,
    user: process.env.MYSQL_USER,
    db: process.env.MYSQL_DATABASE,
    pwSet: !!process.env.MYSQL_PASSWORD,
});


const LEGACY_DB_FILE = path.join(__dirname, "links.json");
const SHOWCASE_DB_FILE = path.join(__dirname, "showcase.json");

async function ensureSchema() {
    // Links table
    const createLinksSql = `
        CREATE TABLE IF NOT EXISTS links
        (
            id
            BIGINT
            AUTO_INCREMENT
            PRIMARY
            KEY,
            custom_id
            VARCHAR
        (
            64
        ) NOT NULL UNIQUE,
            original_url VARCHAR
        (
            2048
        ) NOT NULL,
            clicks BIGINT NOT NULL DEFAULT 0,
            created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
            ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
    `;
    await pool.query(createLinksSql);

    // Users table for Discord auth
    const createUsersSql = `
        CREATE TABLE IF NOT EXISTS users
        (
            id
            BIGINT
            AUTO_INCREMENT
            PRIMARY
            KEY,
            discord_id
            VARCHAR
        (
            64
        ) NOT NULL UNIQUE,
            username VARCHAR
        (
            128
        ) NOT NULL,
            avatar VARCHAR
        (
            256
        ) NULL,
            created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
            ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
    `;
    await pool.query(createUsersSql);

    // Add user_id column to links if missing
    try {
        await pool.query("ALTER TABLE links ADD COLUMN user_id BIGINT NULL");
    } catch (e) {
        // ignore if exists
    }
    try {
        await pool.query("CREATE INDEX idx_links_user_id ON links(user_id)");
    } catch (e) {
        // ignore if exists
    }

    // Optional: Import aus alter JSON-Datei, falls Tabelle leer
    try {
        const [rows] = await pool.query("SELECT COUNT(*) AS cnt FROM links");
        const count = rows && rows[0] ? rows[0].cnt : 0;
        if (count === 0 && fs.existsSync(LEGACY_DB_FILE)) {
            const json = JSON.parse(fs.readFileSync(LEGACY_DB_FILE, "utf8"));
            if (Array.isArray(json) && json.length > 0) {
                const values = json.map((l) => [
                    l.customId,
                    l.originalUrl,
                    Number(l.clicks || 0),
                    new Date(l.createdAt || Date.now()),
                ]);
                // Bulk insert
                await pool.query(
                    "INSERT INTO links (custom_id, original_url, clicks, created_at) VALUES ?",
                    [values]
                );
                if (process.env.NODE_ENV !== "production") {
                    console.log(`Imported ${values.length} legacy links from JSON.`);
                }
            }
        }
    } catch (e) {
        console.warn("Legacy import skipped:", e?.message || e);
    }
}

ensureSchema().catch((e) => {
    console.error("DB init error:", e);
});

app.set("trust proxy", 1);
app.disable("x-powered-by");
app.use(helmet({
    crossOriginResourcePolicy: {policy: "cross-origin"},
    contentSecurityPolicy: {
        directives: {
            defaultSrc: ["'self'"],
            scriptSrc: ["'self'", "'unsafe-inline'"],
            styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com", "https://api.fontshare.com"],
            fontSrc: ["'self'", "https://fonts.gstatic.com", "https://cdn.fontshare.com", "data:"],
            imgSrc: ["'self'", "data:", "blob:", "https://cdn.discordapp.com"],
            connectSrc: ["'self'", "https://discord.com"],
            frameSrc: ["'none'"],
            objectSrc: ["'none'"],
        }
    }
}));
app.use(compression());
app.use(cors({credentials: true, origin: true}));
app.use(morgan(process.env.NODE_ENV === "production" ? "combined" : "dev"));
app.use(express.json({limit: "1mb"}));

// Minimal cookie utils
function parseCookies(header) {
    const list = {};
    if (!header) return list;
    header.split(';').forEach(cookie => {
        const parts = cookie.split('=');
        const key = decodeURIComponent(parts.shift().trim());
        const value = decodeURIComponent(parts.join('=').trim());
        if (key) list[key] = value;
    });
    return list;
}

function base64url(input) {
    return Buffer.from(input).toString('base64').replace(/=/g, '').replace(/\+/g, '-').replace(/\//g, '_');
}

const SESSION_SECRET = process.env.SESSION_SECRET || 'change_me_dev_secret';

function signSession(payload) {
    const data = JSON.stringify(payload);
    const sig = crypto.createHmac('sha256', SESSION_SECRET).update(data).digest('base64');
    return base64url(data) + '.' + base64url(sig);
}

function verifySession(token) {
    if (!token || token.indexOf('.') === -1) return null;
    const [dataB64, sigB64] = token.split('.');
    try {
        const data = Buffer.from(dataB64.replace(/-/g, '+').replace(/_/g, '/'), 'base64').toString('utf8');
        const expectedSig = crypto.createHmac('sha256', SESSION_SECRET).update(data).digest('base64');
        const givenSig = Buffer.from(sigB64.replace(/-/g, '+').replace(/_/g, '/'), 'base64').toString('utf8');
        if (expectedSig !== givenSig) return null;
        return JSON.parse(data);
    } catch (e) {
        return null;
    }
}

function setCookie(res, name, value, options = {}) {
    const parts = [`${name}=${encodeURIComponent(value)}`];
    if (options.maxAge != null) parts.push(`Max-Age=${Math.floor(options.maxAge)}`);
    if (options.httpOnly !== false) parts.push('HttpOnly');
    if (options.sameSite) parts.push(`SameSite=${options.sameSite}`); else parts.push('SameSite=Lax');
    if (options.secure || process.env.NODE_ENV === 'production') parts.push('Secure');
    parts.push('Path=/');
    const cookieStr = parts.join('; ');
    const prev = res.getHeader('Set-Cookie');
    if (!prev) {
        res.setHeader('Set-Cookie', cookieStr);
    } else if (Array.isArray(prev)) {
        res.setHeader('Set-Cookie', [...prev, cookieStr]);
    } else {
        res.setHeader('Set-Cookie', [prev, cookieStr]);
    }
}

// attach auth to req
app.use((req, res, next) => {
    try {
        const cookies = parseCookies(req.headers.cookie || '');
        const session = verifySession(cookies.session);
        if (session && session.userId) {
            req.user = {id: session.userId, username: session.username, avatar: session.avatar};
        }
    } catch (e) {
    }
    next();
});

// Serve static files (prefer built assets from /dist in production)
const DIST_DIR = path.join(__dirname, "..", "dist");
const PUBLIC_DIR = fs.existsSync(DIST_DIR) ? DIST_DIR : path.join(__dirname, "..");
app.use("/uploads", express.static(UPLOADS_DIR));
// Backward-compat: old entries stored logoUrl starting with /backend/uploads
app.use("/backend/uploads", express.static(UPLOADS_DIR));
app.use(express.static(PUBLIC_DIR));

// Proxy for Discord guild icons to satisfy strict CSP (img-src 'self' data:)
app.get('/proxy/discord/icons/:guildId/:icon', async (req, res) => {
    try {
        const {guildId, icon} = req.params;
        const size = Math.min(256, Math.max(16, parseInt(req.query.size) || 128));
        const isAnimated = String(icon || '').startsWith('a_');
        const ext = isAnimated ? 'gif' : 'png';
        const target = `https://cdn.discordapp.com/icons/${encodeURIComponent(guildId)}/${encodeURIComponent(icon)}.${ext}?size=${size}`;
        const upstream = await axios.get(target, {responseType: 'stream'});
        res.setHeader('Content-Type', isAnimated ? 'image/gif' : 'image/png');
        res.setHeader('Cache-Control', 'public, max-age=86400, s-maxage=86400');
        upstream.data.pipe(res);
    } catch (e) {
        // Fallback: lightweight SVG placeholder to avoid broken image
        const svg = "<svg xmlns='http://www.w3.org/2000/svg' width='128' height='128'><rect width='100%' height='100%' fill='%235b21b6'/><text x='50%' y='55%' dominant-baseline='middle' text-anchor='middle' font-family='Arial' font-size='42' fill='white'>DC</text></svg>";
        res.setHeader('Content-Type', 'image/svg+xml');
        res.setHeader('Cache-Control', 'public, max-age=300');
        res.status(200).send(svg);
    }
});

// Basic rate limit for all API routes
const apiLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 1000,
    standardHeaders: true,
    legacyHeaders: false,
});
app.use("/api", apiLimiter);
app.use("/api", showcaseRouter);

// Strengeres Rate-Limit für kritische Endpunkte
const tightLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 50,
    standardHeaders: true,
    legacyHeaders: false,
});

// Healthcheck
app.get("/health", (req, res) => res.json({status: "ok"}));

// Auth endpoints (Discord OAuth)
function requireAuth(req, res, next) {
    if (!req.user) return res.status(401).json({error: 'Nicht eingeloggt'});
    next();
}

function getRedirectUri(req) {
    const envCb = process.env.DISCORD_REDIRECT_URI;
    if (envCb && envCb.trim()) return envCb.trim();
    return getBaseUrl(req) + '/api/auth/discord/callback';
}

// Helper: returns the exact redirect_uri this server will use
app.get('/api/auth/discord/redirect-uri', (req, res) => {
    try {
        res.json({redirectUri: getRedirectUri(req)});
    } catch (e) {
        res.status(500).json({error: 'failed', message: e?.message || String(e)});
    }
});

app.get('/api/auth/discord/login', (req, res) => {
    const clientId = process.env.DISCORD_CLIENT_ID;
    if (!clientId) return res.status(500).json({error: 'Discord OAuth nicht konfiguriert'});

    const stateRaw = JSON.stringify({t: Date.now(), nonce: Math.random().toString(36).slice(2)});
    const state = base64url(stateRaw);
    setCookie(res, 'oauth_state', state, {httpOnly: true, sameSite: 'Lax', maxAge: 600});

    const redirectUri = getRedirectUri(req);
    const params = new URLSearchParams({
        client_id: clientId,
        redirect_uri: redirectUri,
        response_type: 'code',
        scope: 'identify',
        state
    });
    const url = `https://discord.com/oauth2/authorize?${params.toString()}`;
    res.redirect(url);
});

app.get('/api/auth/discord/callback', async (req, res) => {
    try {
        const {code, state, error: oauthError} = req.query;
        const cookies = parseCookies(req.headers.cookie || '');

        // If Discord returned an explicit error (e.g., access_denied, interaction_required)
        if (oauthError) {
            setCookie(res, 'oauth_state', '', {httpOnly: true, sameSite: 'Lax', maxAge: 1});
            return res.redirect('/login?error=oauth_' + encodeURIComponent(String(oauthError)));
        }

        if (!state || cookies.oauth_state !== state) {
            setCookie(res, 'oauth_state', '', {httpOnly: true, sameSite: 'Lax', maxAge: 1});
            return res.redirect('/login?error=oauth_state');
        }

        if (!code) {
            setCookie(res, 'oauth_state', '', {httpOnly: true, sameSite: 'Lax', maxAge: 1});
            return res.redirect('/login?error=oauth_missing_code');
        }

        const clientId = process.env.DISCORD_CLIENT_ID;
        const clientSecret = process.env.DISCORD_CLIENT_SECRET;
        const redirectUri = getRedirectUri(req);
        if (!clientId || !clientSecret) {
            setCookie(res, 'oauth_state', '', {httpOnly: true, sameSite: 'Lax', maxAge: 1});
            return res.redirect('/login?error=oauth_not_configured');
        }

        // Exchange code for token
        const body = new URLSearchParams({
            client_id: clientId,
            client_secret: clientSecret,
            grant_type: 'authorization_code',
            code: String(code),
            redirect_uri: redirectUri
        });
        const tokenResp = await axios.post('https://discord.com/api/v10/oauth2/token', body.toString(), {
            headers: {'Content-Type': 'application/x-www-form-urlencoded'}
        });
        const accessToken = tokenResp.data && tokenResp.data.access_token;
        if (!accessToken) {
            setCookie(res, 'oauth_state', '', {httpOnly: true, sameSite: 'Lax', maxAge: 1});
            return res.redirect('/login?error=oauth_token');
        }

        // Fetch user
        const meResp = await axios.get('https://discord.com/api/v10/users/@me', {
            headers: {Authorization: `Bearer ${accessToken}`}
        });
        const du = meResp.data || {};
        const discordId = du.id;
        const username = du.global_name || du.username || 'Discord User';
        // Build correct Discord avatar URL (gif for animated avatars), include size for consistency
        let avatar = null;
        if (du.avatar) {
            const isAnimated = String(du.avatar).startsWith('a_');
            const ext = isAnimated ? 'gif' : 'png';
            avatar = `https://cdn.discordapp.com/avatars/${du.id}/${du.avatar}.${ext}?size=128`;
        } else {
            // Fallback to a default embed avatar
            avatar = 'https://cdn.discordapp.com/embed/avatars/0.png';
        }
        if (!discordId) {
            setCookie(res, 'oauth_state', '', {httpOnly: true, sameSite: 'Lax', maxAge: 1});
            return res.redirect('/login?error=oauth_user');
        }

        // Upsert user
        const [rows] = await pool.query('SELECT id FROM users WHERE discord_id = ? LIMIT 1', [discordId]);
        let userId;
        if (Array.isArray(rows) && rows.length > 0) {
            userId = rows[0].id;
            await pool.query('UPDATE users SET username = ?, avatar = ? WHERE id = ?', [username, avatar, userId]);
        } else {
            const [resIns] = await pool.query('INSERT INTO users (discord_id, username, avatar) VALUES (?, ?, ?)', [discordId, username, avatar]);
            userId = resIns.insertId;
        }

        const token = signSession({userId, username, avatar});
        setCookie(res, 'session', token, {httpOnly: true, sameSite: 'Lax', maxAge: 30 * 24 * 60 * 60});
        // clear state
        setCookie(res, 'oauth_state', '', {httpOnly: true, sameSite: 'Lax', maxAge: 1});

        // Redirect to dashboard
        res.redirect('/edit');
    } catch (e) {
        console.error('discord callback error:', e?.response?.data || e?.message || e);
        // Best-effort cleanup and redirect to login with generic error
        try {
            setCookie(res, 'oauth_state', '', {httpOnly: true, sameSite: 'Lax', maxAge: 1});
        } catch {
        }
        res.redirect('/login?error=login_failed');
    }
});

app.get('/api/me', (req, res) => {
    if (!req.user) return res.json({user: null});
    res.json({user: req.user});
});

app.post('/api/logout', (req, res) => {
    setCookie(res, 'session', '', {httpOnly: true, sameSite: 'Lax', maxAge: 1});
    res.json({ok: true});
});

// Klick-Tracking (Client-seitig ausgelöst)
app.post("/api/click/:id", async (req, res) => {
    try {
        const id = req.params.id;
        const [result] = await pool.query("UPDATE links SET clicks = clicks + 1 WHERE custom_id = ?", [id]);
        if (result.affectedRows === 0) return res.status(404).json({error: "Nicht gefunden"});
        // Webhook best-effort
        try {
            sendWebhookEvent('link.clicked', {id, at: new Date().toISOString()});
        } catch (e) {
        }
        res.json({ok: true});
    } catch (e) {
        res.status(500).json({error: "Serverfehler"});
    }
});

// Hilfsfunktionen
function getBaseUrl(req) {
    const proto = req.headers["x-forwarded-proto"] || req.protocol || "http";
    const host = req.get("host");
    return `${proto}://${host}`;
}

// POST: Link kürzen
app.post("/api/shorten", tightLimiter, async (req, res) => {
    try {
        let {originalUrl, customId} = req.body || {};
        const ownerId = req.user?.id || null;

        // Normalize Discord invite URLs
        if (typeof originalUrl === "string") {
            originalUrl = originalUrl.trim();
            originalUrl = originalUrl.replace(/^http:\/\//, "https://");
            originalUrl = originalUrl.replace(
                /^https:\/\/discord\.com\/invite\//,
                "https://discord.gg/"
            );
        }

        const isValid =
            typeof originalUrl === "string" &&
            (/^https:\/\/discord\.gg\/[a-zA-Z0-9]+$/.test(originalUrl) ||
                /^https:\/\/discord\.com\/invite\/[a-zA-Z0-9]+$/.test(originalUrl));

        if (!isValid) {
            return res.status(400).json({error: "Ungültiger Discord-Link"});
        }

        if (!customId || !/^[a-zA-Z0-9_-]{3,32}$/.test(customId)) {
            return res.status(400).json({error: "Ungültige ID"});
        }

        // Conflict check
        const [rows] = await pool.query("SELECT 1 FROM links WHERE custom_id = ? LIMIT 1", [customId]);
        if (Array.isArray(rows) && rows.length > 0) {
            return res.status(409).json({error: "Diese ID existiert bereits"});
        }

        // Insert
        await pool.query(
            "INSERT INTO links (custom_id, original_url, clicks, user_id) VALUES (?, ?, 0, ?)",
            [customId, originalUrl, ownerId]
        );

        const base = getBaseUrl(req);
        // Fire webhook (non-blocking)
        try {
            sendWebhookEvent('link.created', {
                id: customId,
                originalUrl,
                shortUrl: `${base}/${customId}`,
                clicks: 0,
                createdAt: new Date().toISOString(),
            });
        } catch (e) {
        }

        res.json({short: `${base}/${customId}`});
    } catch (e) {
        console.error("shorten error:", e);
        res.status(500).json({error: "Serverfehler"});
    }
});

app.get("/api/info/:id", async (req, res) => {
    try {
        const id = req.params.id;
        const [rows] = await pool.query(
            "SELECT custom_id, original_url FROM links WHERE custom_id = ? LIMIT 1",
            [id]
        );
        const link = Array.isArray(rows) && rows[0];
        if (!link) return res.status(404).json({error: "Nicht gefunden"});

        // Invite-Code aus dem Discord-Link extrahieren (unterstützt discord.gg und discord.com/invite)
        const inviteMatch = link.original_url.match(/(?:discord\.gg\/|discord\.com\/invite\/)([A-Za-z0-9-_]+)/);
        const inviteCode = inviteMatch ? inviteMatch[1] : null;

        if (!inviteCode) {
            return res.status(400).json({error: "Kein gültiger Invite-Code"});
        }

        const response = await axios.get(
            `https://discord.com/api/v10/invites/${inviteCode}?with_counts=true&with_expiration=true`
        );
        const data = response.data || {};

        const guild = data.guild || {};
        const serverName = guild.name || "Unbekannter Server";
        // Same‑origin proxy (CSP friendly). Fallback is an inline data URL (allowed by img-src 'self' data:)
        const base = getBaseUrl(req);
        let serverIcon = "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='128' height='128'><rect width='100%' height='100%' fill='%235b21b6'/><text x='50%' y='55%' dominant-baseline='middle' text-anchor='middle' font-family='Arial' font-size='42' fill='white'>DC</text></svg>";
        if (guild.icon && guild.id) {
            const size = 128;
            serverIcon = `${base}/proxy/discord/icons/${guild.id}/${guild.icon}?size=${size}`;
        }

        res.json({
            name: serverName,
            icon: serverIcon,
            inviteCode: link.custom_id,
            originalUrl: link.original_url,
        });
    } catch (err) {
        console.error("/api/info error:", err?.message || err);
        return res.status(500).json({error: "Discord-Daten konnten nicht geladen werden"});
    }
});


function loadWebhooks() {
    if (!fs.existsSync(WEBHOOK_PATH)) return [];
    return JSON.parse(fs.readFileSync(WEBHOOK_PATH));
}

function saveWebhooks(webhooks) {
    fs.writeFileSync(WEBHOOK_PATH, JSON.stringify(webhooks, null, 2));
}

// Send webhooks (fire-and-forget) for events like link.created / link.clicked
function sendWebhookEvent(type, payload) {
    try {
        const webhooks = loadWebhooks();
        if (!Array.isArray(webhooks) || webhooks.length === 0) return;
        const body = {type, timestamp: new Date().toISOString(), payload};
        webhooks.forEach(async (hook) => {
            try {
                if (!hook || !hook.url) return;
                await axios.post(hook.url, body, {headers: {'Content-Type': 'application/json'}});
                // Update counters best-effort
                hook.totalCalls = (hook.totalCalls || 0) + 1;
                hook.lastTriggered = new Date().toISOString();
                saveWebhooks(webhooks);
            } catch (e) {
                if (process.env.NODE_ENV !== 'production') {
                    console.warn('Webhook send failed:', e?.message || e);
                }
            }
        });
    } catch (e) {
        // ignore
    }
}

app.get("/api/webhooks", (req, res) => {
    res.json(loadWebhooks());
});

// Add webhook
app.post("/api/webhooks", tightLimiter, (req, res) => {
    const webhooks = loadWebhooks();
    const newHook = {...req.body, id: Date.now().toString(), totalCalls: 0};
    webhooks.push(newHook);
    saveWebhooks(webhooks);
    res.json(newHook);
});

// Update webhook
app.put("/api/webhooks/:id", (req, res) => {
    let webhooks = loadWebhooks();
    webhooks = webhooks.map((w) =>
        w.id === req.params.id ? {...w, ...req.body} : w
    );
    saveWebhooks(webhooks);
    res.sendStatus(200);
});

// Delete webhook
app.delete("/api/webhooks/:id", (req, res) => {
    let webhooks = loadWebhooks();
    webhooks = webhooks.filter((w) => w.id !== req.params.id);
    saveWebhooks(webhooks);
    res.sendStatus(200);
});

// Test webhook
app.post("/api/webhooks/:id/test", tightLimiter, async (req, res) => {
    const webhooks = loadWebhooks();
    const hook = webhooks.find((w) => w.id === req.params.id);
    if (!hook) return res.status(404).json({error: "Webhook nicht gefunden"});

    try {
        const result = await axios.post(hook.url, {
            content: `🔔 Testnachricht vom Webhook "${hook.name}"`,
        });

        hook.totalCalls += 1;
        hook.lastTriggered = new Date().toISOString();
        saveWebhooks(webhooks);
        res.json({success: true, status: result.status});
    } catch (e) {
        res.status(500).json({error: "Fehler beim Senden des Webhooks"});
    }
});

// GET: Aktuelle Links für Frontend
app.get("/api/recents", async (req, res) => {
    try {
        const base = getBaseUrl(req);
        const limit = Math.min(100, Math.max(1, parseInt(req.query.limit) || 9));
        const [rows] = await pool.query(
            "SELECT custom_id, original_url, clicks, created_at FROM links ORDER BY created_at DESC LIMIT ?",
            [limit]
        );
        const recentLinks = (rows || []).map((link) => ({
            id: link.custom_id,
            originalUrl: link.original_url,
            shortUrl: `${base}/${link.custom_id}`,
            clicks: Number(link.clicks || 0),
            createdAt: new Date(link.created_at).toISOString(),
        }));
        res.json(recentLinks);
    } catch (e) {
        console.error("/api/recents error:", e?.message || e);
        res.status(500).json([]);
    }
});

// Meine Links APIs (require auth)
app.get('/api/my/links', requireAuth, async (req, res) => {
    try {
        const base = getBaseUrl(req);
        const [rows] = await pool.query(
            'SELECT custom_id, original_url, clicks, created_at FROM links WHERE user_id = ? ORDER BY created_at DESC',
            [req.user.id]
        );
        const items = (rows || []).map(l => ({
            id: l.custom_id,
            originalUrl: l.original_url,
            shortUrl: `${base}/${l.custom_id}`,
            clicks: Number(l.clicks || 0),
            createdAt: new Date(l.created_at).toISOString(),
        }));
        res.json({items});
    } catch (e) {
        console.error('/api/my/links error:', e?.message || e);
        res.status(500).json({items: []});
    }
});

app.patch('/api/my/links/:id', requireAuth, async (req, res) => {
    try {
        const id = req.params.id;
        const {originalUrl, newCustomId} = req.body || {};

        // Check ownership
        const [rows] = await pool.query('SELECT id, custom_id, original_url, user_id FROM links WHERE custom_id = ? LIMIT 1', [id]);
        const link = Array.isArray(rows) && rows[0];
        if (!link) return res.status(404).json({error: 'Link nicht gefunden'});
        if (!link.user_id || link.user_id !== req.user.id) return res.status(403).json({error: 'Kein Zugriff'});

        const updates = [];
        const params = [];
        if (typeof originalUrl === 'string' && originalUrl.trim()) {
            let url = originalUrl.trim().replace(/^http:\/\//, 'https://');
            url = url.replace(/^https:\/\/discord\.com\/invite\//, 'https://discord.gg/');
            if (!/^https:\/\/discord\.(gg|com\/invite)\/[a-zA-Z0-9]+$/.test(url)) {
                return res.status(400).json({error: 'Ungültiger Discord-Link'});
            }
            updates.push('original_url = ?');
            params.push(url);
        }
        if (typeof newCustomId === 'string' && newCustomId.trim()) {
            const slug = newCustomId.trim();
            if (!/^[a-zA-Z0-9_-]{3,32}$/.test(slug)) return res.status(400).json({error: 'Ungültige ID'});
            // check conflict
            const [conf] = await pool.query('SELECT 1 FROM links WHERE custom_id = ? LIMIT 1', [slug]);
            if (Array.isArray(conf) && conf.length > 0) return res.status(409).json({error: 'Diese ID existiert bereits'});
            updates.push('custom_id = ?');
            params.push(slug);
        }
        if (updates.length === 0) return res.json({ok: true});
        params.push(id);
        await pool.query(`UPDATE links
                          SET ${updates.join(', ')}
                          WHERE custom_id = ?`, params);
        res.json({ok: true});
    } catch (e) {
        console.error('patch /api/my/links error:', e?.message || e);
        res.status(500).json({error: 'Serverfehler'});
    }
});

app.delete('/api/my/links/:id', requireAuth, async (req, res) => {
    try {
        const id = req.params.id;
        const [rows] = await pool.query('SELECT user_id FROM links WHERE custom_id = ? LIMIT 1', [id]);
        const link = Array.isArray(rows) && rows[0];
        if (!link) return res.status(404).json({error: 'Link nicht gefunden'});
        if (!link.user_id || link.user_id !== req.user.id) return res.status(403).json({error: 'Kein Zugriff'});
        await pool.query('DELETE FROM links WHERE custom_id = ?', [id]);
        res.json({ok: true});
    } catch (e) {
        console.error('delete /api/my/links error:', e?.message || e);
        res.status(500).json({error: 'Serverfehler'});
    }
});

// GET: Liste aller Links (paginierte API)
app.get('/api/links', async (req, res) => {
    try {
        const base = getBaseUrl(req);
        const all = String(req.query.all || '').toLowerCase() === 'true';
        const page = all ? 1 : Math.max(1, parseInt(req.query.page) || 1);
        const limit = all ? 100000 : Math.min(100, Math.max(1, parseInt(req.query.limit) || 20));
        const q = (req.query.q || '').toString();
        const sortByParam = (req.query.sortBy || 'createdAt').toString();
        const orderParam = (req.query.order || 'desc').toString();

        const sortMap = {clicks: 'clicks', id: 'custom_id', createdAt: 'created_at'};
        const sortBy = sortMap[sortByParam] || 'created_at';
        const order = orderParam.toLowerCase() === 'asc' ? 'ASC' : 'DESC';

        const where = q ? "WHERE custom_id LIKE ? OR original_url LIKE ?" : "";
        const params = q ? [`%${q}%`, `%${q}%`] : [];

        // total count
        const [countRows] = await pool.query(`SELECT COUNT(*) AS cnt
                                              FROM links ${where}`, params);
        const total = (countRows && countRows[0] && countRows[0].cnt) || 0;

        // data
        let rows;
        if (all) {
            [rows] = await pool.query(
                `SELECT custom_id, original_url, clicks, created_at
                 FROM links ${where}
                 ORDER BY ${sortBy} ${order}`,
                params
            );
        } else {
            const offset = (page - 1) * limit;
            [rows] = await pool.query(
                `SELECT custom_id, original_url, clicks, created_at
                 FROM links ${where}
                 ORDER BY ${sortBy} ${order} LIMIT ?
                 OFFSET ?`,
                [...params, limit, offset]
            );
        }

        const items = (rows || []).map((l) => ({
            id: l.custom_id,
            originalUrl: l.original_url,
            shortUrl: `${base}/${l.custom_id}`,
            clicks: Number(l.clicks || 0),
            createdAt: new Date(l.created_at).toISOString(),
        }));

        const totalPages = all ? 1 : Math.ceil(total / limit);
        const respLimit = all ? items.length : limit;
        res.json({items, page, limit: respLimit, total, totalPages});
    } catch (e) {
        console.error('/api/links error:', e?.message || e);
        res.status(500).json({items: [], page: 1, limit: 20, total: 0, totalPages: 0});
    }
});

// Hilfsfunktion für Zeitangabe
function timeSince(date) {
    const seconds = Math.floor((new Date() - date) / 1000);
    const minutes = Math.floor(seconds / 60);
    if (minutes < 1) return "gerade eben";
    if (minutes === 1) return "vor 1 Min";
    return `vor ${minutes} Min`;
}

// SPA Fallback for React Router (must be after all API routes)
app.get('*', (req, res) => {
    if (req.path.startsWith('/api') || req.path.startsWith('/health')) {
        return res.status(404).end();
    }
    // Serve index.html from built dist if present, otherwise project root
    res.sendFile(path.join(PUBLIC_DIR, 'index.html'));
});

app.listen(PORT, '0.0.0.0', () => {
    console.log(`Backend läuft auf http://0.0.0.0:${PORT}`);
});
