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
            scriptSrc: ["'self'", "'unsafe-inline'", "'unsafe-eval'", "https://pagead2.googlesyndication.com", "https://www.googletagservices.com", "https://adservice.google.com", "https://www.google-analytics.com", "https://googleads.g.doubleclick.net"],
            styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com", "https://api.fontshare.com"],
            fontSrc: ["'self'", "https://fonts.gstatic.com", "https://cdn.fontshare.com", "data:"],
            imgSrc: ["'self'", "data:", "blob:", "https://cdn.discordapp.com", "https://pagead2.googlesyndication.com", "https://www.google-analytics.com", "https://googleads.g.doubleclick.net", "https://*.google.com", "https://*.gstatic.com"],
            connectSrc: ["'self'", "https://discord.com", "https://pagead2.googlesyndication.com", "https://www.google-analytics.com", "https://googleads.g.doubleclick.net"],
            frameSrc: ["https://googleads.g.doubleclick.net", "https://www.google.com", "https://tpc.googlesyndication.com"],
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

        // Get updated click count for milestone check
        const [rows] = await pool.query("SELECT clicks FROM links WHERE custom_id = ? LIMIT 1", [id]);
        const clicks = rows && rows[0] ? Number(rows[0].clicks) : 0;

        // Webhook best-effort
        try {
            sendWebhookEvent('link.clicked', {id, clicks, at: new Date().toISOString()});
            // Check for milestones
            checkMilestone(id, clicks);
        } catch (e) {
        }
        res.json({ok: true, clicks});
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

        // Reserved routes check
        const reservedRoutes = ['api', 'login', 'register', 'edit', 'tos', 'privacy', 'docs', 'health', 'redirect', 'support', 'about', 'terms', 'admin', 'dashboard', 'settings', 'profile', 'user', 'users', 'static', 'assets', 'public', 'uploads'];
        if (reservedRoutes.includes(customId.toLowerCase())) {
            return res.status(400).json({error: "Diese ID ist reserviert"});
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
    try {
        return JSON.parse(fs.readFileSync(WEBHOOK_PATH));
    } catch {
        return [];
    }
}

function saveWebhooks(webhooks) {
    fs.writeFileSync(WEBHOOK_PATH, JSON.stringify(webhooks, null, 2));
}

// Map internal event types to webhook event IDs
const eventTypeMap = {
    'link.created': 'link_created',
    'link.clicked': 'link_clicked',
    'link.milestone': 'link_milestone',
    'server.featured': 'server_featured',
    'daily.stats': 'daily_stats'
};

// Format webhook payload based on format type
function formatWebhookPayload(hook, type, payload, timestamp) {
    const format = hook.format || 'custom';

    if (format === 'discord') {
        // Discord embed format
        const color = type.includes('created') ? 0x22c55e : type.includes('clicked') ? 0x8b5cf6 : 0x3b82f6;
        const title = type === 'link.created' ? '🔗 Neuer Link erstellt'
            : type === 'link.clicked' ? '📊 Link geklickt'
                : type === 'link.milestone' ? '🎉 Meilenstein erreicht'
                    : '📢 DCS.lol Event';

        const fields = [];
        if (payload.id) fields.push({name: 'Link ID', value: payload.id, inline: true});
        if (payload.shortUrl) fields.push({name: 'URL', value: payload.shortUrl, inline: true});
        if (payload.clicks !== undefined) fields.push({name: 'Klicks', value: String(payload.clicks), inline: true});
        if (payload.originalUrl) fields.push({name: 'Original', value: payload.originalUrl, inline: false});

        return {
            embeds: [{
                title,
                color,
                fields,
                timestamp,
                footer: {text: 'DCS.lol Webhook'}
            }]
        };
    }

    if (format === 'slack') {
        // Slack format
        const emoji = type === 'link.created' ? ':link:'
            : type === 'link.clicked' ? ':chart_with_upwards_trend:'
                : ':bell:';
        const text = type === 'link.created'
            ? `${emoji} *Neuer Link erstellt*: ${payload.shortUrl || payload.id}`
            : type === 'link.clicked'
                ? `${emoji} *Link geklickt*: ${payload.id}`
                : `${emoji} *DCS.lol Event*`;

        return {
            text,
            blocks: [
                {
                    type: 'section',
                    text: {type: 'mrkdwn', text}
                },
                {
                    type: 'context',
                    elements: [
                        {type: 'mrkdwn', text: `*ID:* ${payload.id || 'N/A'} | *Klicks:* ${payload.clicks ?? 'N/A'}`}
                    ]
                }
            ]
        };
    }

    // Custom JSON format (default)
    return {type, timestamp, payload};
}

// Send webhooks (fire-and-forget) for events like link.created / link.clicked
function sendWebhookEvent(type, payload) {
    try {
        const webhooks = loadWebhooks();
        if (!Array.isArray(webhooks) || webhooks.length === 0) return;

        const eventId = eventTypeMap[type] || type.replace('.', '_');
        const timestamp = new Date().toISOString();

        webhooks.forEach(async (hook) => {
            try {
                if (!hook || !hook.url) return;
                // Skip inactive webhooks
                if (hook.active === false) return;
                // Check if webhook is subscribed to this event
                if (hook.events && Array.isArray(hook.events) && hook.events.length > 0) {
                    if (!hook.events.includes(eventId)) return;
                }

                const body = formatWebhookPayload(hook, type, payload, timestamp);
                await axios.post(hook.url, body, {
                    headers: {'Content-Type': 'application/json'},
                    timeout: 5000
                });

                // Update counters best-effort
                hook.totalCalls = (hook.totalCalls || 0) + 1;
                hook.lastTriggered = timestamp;
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

// Check for milestones and trigger webhook
function checkMilestone(id, clicks) {
    const milestones = [100, 500, 1000, 5000, 10000, 50000, 100000];
    if (milestones.includes(clicks)) {
        sendWebhookEvent('link.milestone', {id, clicks, milestone: clicks, at: new Date().toISOString()});
    }
}

app.get("/api/webhooks", (req, res) => {
    res.json(loadWebhooks());
});

// Add webhook
app.post("/api/webhooks", tightLimiter, (req, res) => {
    const webhooks = loadWebhooks();
    const newHook = {
        ...req.body,
        id: Date.now().toString(),
        totalCalls: 0,
        active: req.body.active !== false,
        createdAt: new Date().toISOString()
    };
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
        let testPayload;
        const format = hook.format || 'custom';

        if (format === 'discord') {
            testPayload = {
                embeds: [{
                    title: '🔔 Test erfolgreich!',
                    description: `Testnachricht vom Webhook "${hook.name}"`,
                    color: 0x8b5cf6,
                    fields: [
                        {name: 'Webhook', value: hook.name, inline: true},
                        {name: 'Format', value: 'Discord', inline: true},
                        {name: 'Events', value: (hook.events || []).join(', ') || 'Alle', inline: false}
                    ],
                    timestamp: new Date().toISOString(),
                    footer: {text: 'DCS.lol Webhook Test'}
                }]
            };
        } else if (format === 'slack') {
            testPayload = {
                text: `🔔 *Test erfolgreich!* - Webhook "${hook.name}"`,
                blocks: [
                    {
                        type: 'section',
                        text: {type: 'mrkdwn', text: `🔔 *Test erfolgreich!*\nWebhook "${hook.name}" funktioniert.`}
                    },
                    {
                        type: 'context',
                        elements: [
                            {
                                type: 'mrkdwn',
                                text: `*Format:* Slack | *Events:* ${(hook.events || []).join(', ') || 'Alle'}`
                            }
                        ]
                    }
                ]
            };
        } else {
            testPayload = {
                type: 'test',
                timestamp: new Date().toISOString(),
                payload: {
                    message: `Testnachricht vom Webhook "${hook.name}"`,
                    webhookId: hook.id,
                    webhookName: hook.name,
                    events: hook.events || []
                }
            };
        }

        const result = await axios.post(hook.url, testPayload, {
            headers: {'Content-Type': 'application/json'},
            timeout: 5000
        });

        hook.totalCalls = (hook.totalCalls || 0) + 1;
        hook.lastTriggered = new Date().toISOString();
        saveWebhooks(webhooks);
        res.json({success: true, status: result.status});
    } catch (e) {
        console.error('Webhook test error:', e?.message || e);
        res.status(500).json({error: "Fehler beim Senden des Webhooks", details: e?.message});
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

// ============================================================================
// PUBLIC API v1 - No Rate Limits, Full Access
// ============================================================================

// GET /api/v1/stats - Global statistics
app.get('/api/v1/stats', async (req, res) => {
    try {
        const [linksCount] = await pool.query('SELECT COUNT(*) AS total FROM links');
        const [clicksSum] = await pool.query('SELECT COALESCE(SUM(clicks), 0) AS total FROM links');
        const [usersCount] = await pool.query('SELECT COUNT(*) AS total FROM users');
        const [todayLinks] = await pool.query(
            'SELECT COUNT(*) AS total FROM links WHERE DATE(created_at) = CURDATE()'
        );
        const [todayClicks] = await pool.query(
            'SELECT COUNT(*) AS total FROM links WHERE DATE(created_at) = CURDATE()'
        );
        const [topLinks] = await pool.query(
            'SELECT custom_id, clicks FROM links ORDER BY clicks DESC LIMIT 10'
        );

        res.json({
            success: true,
            data: {
                totalLinks: linksCount[0]?.total || 0,
                totalClicks: Number(clicksSum[0]?.total || 0),
                totalUsers: usersCount[0]?.total || 0,
                linksToday: todayLinks[0]?.total || 0,
                topLinks: topLinks.map(l => ({id: l.custom_id, clicks: Number(l.clicks)})),
                uptime: '99.9%',
                version: '1.0.0',
                timestamp: new Date().toISOString()
            }
        });
    } catch (e) {
        console.error('/api/v1/stats error:', e?.message || e);
        res.status(500).json({success: false, error: 'Internal server error'});
    }
});

// GET /api/v1/links - Get all links with advanced filtering
app.get('/api/v1/links', async (req, res) => {
    try {
        const base = getBaseUrl(req);

        // Pagination
        const page = Math.max(1, parseInt(req.query.page) || 1);
        const limit = Math.min(1000, Math.max(1, parseInt(req.query.limit) || 50));
        const offset = (page - 1) * limit;

        // Sorting
        const sortFields = {clicks: 'clicks', id: 'custom_id', createdAt: 'created_at', created_at: 'created_at'};
        const sortBy = sortFields[req.query.sortBy] || sortFields[req.query.sort] || 'created_at';
        const order = (req.query.order || req.query.dir || 'desc').toLowerCase() === 'asc' ? 'ASC' : 'DESC';

        // Filtering
        const conditions = [];
        const params = [];

        // Search query (searches in id and url)
        if (req.query.q || req.query.search) {
            const q = (req.query.q || req.query.search).toString();
            conditions.push('(custom_id LIKE ? OR original_url LIKE ?)');
            params.push(`%${q}%`, `%${q}%`);
        }

        // Filter by exact ID
        if (req.query.id) {
            conditions.push('custom_id = ?');
            params.push(req.query.id);
        }

        // Filter by clicks range
        if (req.query.minClicks) {
            conditions.push('clicks >= ?');
            params.push(parseInt(req.query.minClicks));
        }
        if (req.query.maxClicks) {
            conditions.push('clicks <= ?');
            params.push(parseInt(req.query.maxClicks));
        }

        // Filter by date range
        if (req.query.createdAfter || req.query.after) {
            conditions.push('created_at >= ?');
            params.push(new Date(req.query.createdAfter || req.query.after));
        }
        if (req.query.createdBefore || req.query.before) {
            conditions.push('created_at <= ?');
            params.push(new Date(req.query.createdBefore || req.query.before));
        }

        // Filter by user (if provided)
        if (req.query.userId) {
            conditions.push('user_id = ?');
            params.push(parseInt(req.query.userId));
        }

        const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';

        // Get total count
        const [countRows] = await pool.query(`SELECT COUNT(*) AS cnt
                                              FROM links ${whereClause}`, params);
        const total = countRows[0]?.cnt || 0;

        // Get data
        const [rows] = await pool.query(
            `SELECT custom_id, original_url, clicks, created_at, user_id
             FROM links ${whereClause}
             ORDER BY ${sortBy} ${order} 
             LIMIT ?
             OFFSET ?`,
            [...params, limit, offset]
        );

        const items = (rows || []).map(l => ({
            id: l.custom_id,
            originalUrl: l.original_url,
            shortUrl: `${base}/${l.custom_id}`,
            clicks: Number(l.clicks || 0),
            createdAt: new Date(l.created_at).toISOString(),
            userId: l.user_id || null
        }));

        res.json({
            success: true,
            data: {
                items,
                pagination: {
                    page,
                    limit,
                    total,
                    totalPages: Math.ceil(total / limit),
                    hasNext: page * limit < total,
                    hasPrev: page > 1
                },
                filters: {
                    sortBy: Object.keys(sortFields).find(k => sortFields[k] === sortBy) || 'createdAt',
                    order: order.toLowerCase(),
                    query: req.query.q || req.query.search || null
                }
            }
        });
    } catch (e) {
        console.error('/api/v1/links error:', e?.message || e);
        res.status(500).json({success: false, error: 'Internal server error'});
    }
});

// GET /api/v1/links/:id - Get single link with full details
app.get('/api/v1/links/:id', async (req, res) => {
    try {
        const id = req.params.id;
        const base = getBaseUrl(req);

        const [rows] = await pool.query(
            'SELECT custom_id, original_url, clicks, created_at, user_id FROM links WHERE custom_id = ? LIMIT 1',
            [id]
        );

        const link = Array.isArray(rows) && rows[0];
        if (!link) {
            return res.status(404).json({success: false, error: 'Link not found'});
        }

        // Try to fetch Discord invite info
        let discordInfo = null;
        try {
            const inviteMatch = link.original_url.match(/(?:discord\.gg\/|discord\.com\/invite\/)([A-Za-z0-9-_]+)/);
            if (inviteMatch) {
                const inviteCode = inviteMatch[1];
                const response = await axios.get(
                    `https://discord.com/api/v10/invites/${inviteCode}?with_counts=true&with_expiration=true`
                );
                const data = response.data || {};
                const guild = data.guild || {};

                discordInfo = {
                    serverName: guild.name || null,
                    serverId: guild.id || null,
                    memberCount: data.approximate_member_count || null,
                    onlineCount: data.approximate_presence_count || null,
                    serverIcon: guild.icon ? `https://cdn.discordapp.com/icons/${guild.id}/${guild.icon}.png` : null,
                    inviteCode: inviteCode,
                    expiresAt: data.expires_at || null
                };
            }
        } catch (e) {
            // Discord API error, continue without discord info
        }

        res.json({
            success: true,
            data: {
                id: link.custom_id,
                originalUrl: link.original_url,
                shortUrl: `${base}/${link.custom_id}`,
                clicks: Number(link.clicks || 0),
                createdAt: new Date(link.created_at).toISOString(),
                userId: link.user_id || null,
                discord: discordInfo
            }
        });
    } catch (e) {
        console.error('/api/v1/links/:id error:', e?.message || e);
        res.status(500).json({success: false, error: 'Internal server error'});
    }
});

// GET /api/v1/links/:id/stats - Get detailed stats for a link
app.get('/api/v1/links/:id/stats', async (req, res) => {
    try {
        const id = req.params.id;
        const base = getBaseUrl(req);

        const [rows] = await pool.query(
            'SELECT custom_id, original_url, clicks, created_at, user_id FROM links WHERE custom_id = ? LIMIT 1',
            [id]
        );

        const link = Array.isArray(rows) && rows[0];
        if (!link) {
            return res.status(404).json({success: false, error: 'Link not found'});
        }

        const createdAt = new Date(link.created_at);
        const now = new Date();
        const ageInDays = Math.max(1, Math.floor((now - createdAt) / (1000 * 60 * 60 * 24)));
        const clicksPerDay = (Number(link.clicks) / ageInDays).toFixed(2);

        res.json({
            success: true,
            data: {
                id: link.custom_id,
                shortUrl: `${base}/${link.custom_id}`,
                totalClicks: Number(link.clicks || 0),
                createdAt: createdAt.toISOString(),
                ageInDays,
                averageClicksPerDay: parseFloat(clicksPerDay),
                lastUpdated: now.toISOString()
            }
        });
    } catch (e) {
        console.error('/api/v1/links/:id/stats error:', e?.message || e);
        res.status(500).json({success: false, error: 'Internal server error'});
    }
});

// POST /api/v1/links - Create a new shortened link
app.post('/api/v1/links', async (req, res) => {
    try {
        let {url, originalUrl, customId, id} = req.body || {};
        const targetUrl = url || originalUrl;
        const targetId = customId || id;
        const base = getBaseUrl(req);

        // Normalize Discord invite URLs
        let normalizedUrl = targetUrl;
        if (typeof normalizedUrl === 'string') {
            normalizedUrl = normalizedUrl.trim();
            normalizedUrl = normalizedUrl.replace(/^http:\/\//, 'https://');
            normalizedUrl = normalizedUrl.replace(/^https:\/\/discord\.com\/invite\//, 'https://discord.gg/');
        }

        // Validate URL
        const isValid = typeof normalizedUrl === 'string' &&
            (/^https:\/\/discord\.gg\/[a-zA-Z0-9]+$/.test(normalizedUrl) ||
                /^https:\/\/discord\.com\/invite\/[a-zA-Z0-9]+$/.test(normalizedUrl));

        if (!isValid) {
            return res.status(400).json({
                success: false,
                error: 'Invalid Discord URL',
                message: 'URL must be a valid discord.gg or discord.com/invite link'
            });
        }

        // Validate custom ID
        if (!targetId || !/^[a-zA-Z0-9_-]{3,32}$/.test(targetId)) {
            return res.status(400).json({
                success: false,
                error: 'Invalid custom ID',
                message: 'ID must be 3-32 characters (letters, numbers, underscore, hyphen)'
            });
        }

        // Check for conflicts
        const [existing] = await pool.query('SELECT 1 FROM links WHERE custom_id = ? LIMIT 1', [targetId]);
        if (Array.isArray(existing) && existing.length > 0) {
            return res.status(409).json({
                success: false,
                error: 'ID already exists',
                message: `The ID "${targetId}" is already taken`
            });
        }

        // Insert the link
        await pool.query(
            'INSERT INTO links (custom_id, original_url, clicks, user_id) VALUES (?, ?, 0, ?)',
            [targetId, normalizedUrl, req.user?.id || null]
        );

        res.status(201).json({
            success: true,
            data: {
                id: targetId,
                originalUrl: normalizedUrl,
                shortUrl: `${base}/${targetId}`,
                clicks: 0,
                createdAt: new Date().toISOString()
            }
        });
    } catch (e) {
        console.error('/api/v1/links POST error:', e?.message || e);
        res.status(500).json({success: false, error: 'Internal server error'});
    }
});

// DELETE /api/v1/links/:id - Delete a link (requires auth)
app.delete('/api/v1/links/:id', requireAuth, async (req, res) => {
    try {
        const id = req.params.id;

        const [rows] = await pool.query('SELECT user_id FROM links WHERE custom_id = ? LIMIT 1', [id]);
        const link = Array.isArray(rows) && rows[0];

        if (!link) {
            return res.status(404).json({success: false, error: 'Link not found'});
        }

        if (!link.user_id || link.user_id !== req.user.id) {
            return res.status(403).json({success: false, error: 'Not authorized to delete this link'});
        }

        await pool.query('DELETE FROM links WHERE custom_id = ?', [id]);

        res.json({success: true, message: 'Link deleted successfully'});
    } catch (e) {
        console.error('/api/v1/links DELETE error:', e?.message || e);
        res.status(500).json({success: false, error: 'Internal server error'});
    }
});

// PATCH /api/v1/links/:id - Update a link (requires auth)
app.patch('/api/v1/links/:id', requireAuth, async (req, res) => {
    try {
        const id = req.params.id;
        const {url, originalUrl, newId, customId} = req.body || {};
        const base = getBaseUrl(req);

        const [rows] = await pool.query(
            'SELECT custom_id, original_url, user_id FROM links WHERE custom_id = ? LIMIT 1',
            [id]
        );
        const link = Array.isArray(rows) && rows[0];

        if (!link) {
            return res.status(404).json({success: false, error: 'Link not found'});
        }

        if (!link.user_id || link.user_id !== req.user.id) {
            return res.status(403).json({success: false, error: 'Not authorized to update this link'});
        }

        const updates = [];
        const params = [];
        let finalId = link.custom_id;
        let finalUrl = link.original_url;

        // Update URL
        const targetUrl = url || originalUrl;
        if (targetUrl) {
            let normalizedUrl = targetUrl.trim().replace(/^http:\/\//, 'https://');
            normalizedUrl = normalizedUrl.replace(/^https:\/\/discord\.com\/invite\//, 'https://discord.gg/');

            if (!/^https:\/\/discord\.(gg|com\/invite)\/[a-zA-Z0-9]+$/.test(normalizedUrl)) {
                return res.status(400).json({success: false, error: 'Invalid Discord URL'});
            }

            updates.push('original_url = ?');
            params.push(normalizedUrl);
            finalUrl = normalizedUrl;
        }

        // Update ID
        const targetNewId = newId || customId;
        if (targetNewId) {
            if (!/^[a-zA-Z0-9_-]{3,32}$/.test(targetNewId)) {
                return res.status(400).json({success: false, error: 'Invalid custom ID'});
            }

            const [conflict] = await pool.query('SELECT 1 FROM links WHERE custom_id = ? LIMIT 1', [targetNewId]);
            if (Array.isArray(conflict) && conflict.length > 0) {
                return res.status(409).json({success: false, error: 'ID already exists'});
            }

            updates.push('custom_id = ?');
            params.push(targetNewId);
            finalId = targetNewId;
        }

        if (updates.length === 0) {
            return res.json({success: true, message: 'Nothing to update'});
        }

        params.push(id);
        await pool.query(`UPDATE links
                          SET ${updates.join(', ')}
                          WHERE custom_id = ?`, params);

        res.json({
            success: true,
            data: {
                id: finalId,
                originalUrl: finalUrl,
                shortUrl: `${base}/${finalId}`
            }
        });
    } catch (e) {
        console.error('/api/v1/links PATCH error:', e?.message || e);
        res.status(500).json({success: false, error: 'Internal server error'});
    }
});

// GET /api/v1/users/:id/links - Get links for a specific user
app.get('/api/v1/users/:id/links', async (req, res) => {
    try {
        const userId = parseInt(req.params.id);
        const base = getBaseUrl(req);

        if (isNaN(userId)) {
            return res.status(400).json({success: false, error: 'Invalid user ID'});
        }

        // Pagination
        const page = Math.max(1, parseInt(req.query.page) || 1);
        const limit = Math.min(100, Math.max(1, parseInt(req.query.limit) || 20));
        const offset = (page - 1) * limit;

        const [countRows] = await pool.query('SELECT COUNT(*) AS cnt FROM links WHERE user_id = ?', [userId]);
        const total = countRows[0]?.cnt || 0;

        const [rows] = await pool.query(
            'SELECT custom_id, original_url, clicks, created_at FROM links WHERE user_id = ? ORDER BY created_at DESC LIMIT ? OFFSET ?',
            [userId, limit, offset]
        );

        const items = (rows || []).map(l => ({
            id: l.custom_id,
            originalUrl: l.original_url,
            shortUrl: `${base}/${l.custom_id}`,
            clicks: Number(l.clicks || 0),
            createdAt: new Date(l.created_at).toISOString()
        }));

        res.json({
            success: true,
            data: {
                userId,
                items,
                pagination: {
                    page,
                    limit,
                    total,
                    totalPages: Math.ceil(total / limit)
                }
            }
        });
    } catch (e) {
        console.error('/api/v1/users/:id/links error:', e?.message || e);
        res.status(500).json({success: false, error: 'Internal server error'});
    }
});

// GET /api/v1/search - Advanced search across all data
app.get('/api/v1/search', async (req, res) => {
    try {
        const base = getBaseUrl(req);
        const q = (req.query.q || req.query.query || '').toString().trim();

        if (!q || q.length < 2) {
            return res.status(400).json({
                success: false,
                error: 'Query too short',
                message: 'Search query must be at least 2 characters'
            });
        }

        const limit = Math.min(100, Math.max(1, parseInt(req.query.limit) || 20));

        const [rows] = await pool.query(
            `SELECT custom_id, original_url, clicks, created_at
             FROM links
             WHERE custom_id LIKE ?
                OR original_url LIKE ?
             ORDER BY clicks DESC LIMIT ?`,
            [`%${q}%`, `%${q}%`, limit]
        );

        const items = (rows || []).map(l => ({
            id: l.custom_id,
            originalUrl: l.original_url,
            shortUrl: `${base}/${l.custom_id}`,
            clicks: Number(l.clicks || 0),
            createdAt: new Date(l.created_at).toISOString()
        }));

        res.json({
            success: true,
            data: {
                query: q,
                count: items.length,
                items
            }
        });
    } catch (e) {
        console.error('/api/v1/search error:', e?.message || e);
        res.status(500).json({success: false, error: 'Internal server error'});
    }
});

// GET /api/v1/top - Get top performing links
app.get('/api/v1/top', async (req, res) => {
    try {
        const base = getBaseUrl(req);
        const limit = Math.min(100, Math.max(1, parseInt(req.query.limit) || 10));
        const period = req.query.period || 'all'; // all, today, week, month

        let dateFilter = '';
        if (period === 'today') {
            dateFilter = 'WHERE DATE(created_at) = CURDATE()';
        } else if (period === 'week') {
            dateFilter = 'WHERE created_at >= DATE_SUB(NOW(), INTERVAL 7 DAY)';
        } else if (period === 'month') {
            dateFilter = 'WHERE created_at >= DATE_SUB(NOW(), INTERVAL 30 DAY)';
        }

        const [rows] = await pool.query(
            `SELECT custom_id, original_url, clicks, created_at
             FROM links ${dateFilter}
             ORDER BY clicks DESC LIMIT ?`,
            [limit]
        );

        const items = (rows || []).map((l, index) => ({
            rank: index + 1,
            id: l.custom_id,
            originalUrl: l.original_url,
            shortUrl: `${base}/${l.custom_id}`,
            clicks: Number(l.clicks || 0),
            createdAt: new Date(l.created_at).toISOString()
        }));

        res.json({
            success: true,
            data: {
                period,
                items
            }
        });
    } catch (e) {
        console.error('/api/v1/top error:', e?.message || e);
        res.status(500).json({success: false, error: 'Internal server error'});
    }
});

// GET /api/v1/recent - Get most recent links
app.get('/api/v1/recent', async (req, res) => {
    try {
        const base = getBaseUrl(req);
        const limit = Math.min(100, Math.max(1, parseInt(req.query.limit) || 10));

        const [rows] = await pool.query(
            `SELECT custom_id, original_url, clicks, created_at
             FROM links
             ORDER BY created_at DESC LIMIT ?`,
            [limit]
        );

        const items = (rows || []).map(l => ({
            id: l.custom_id,
            originalUrl: l.original_url,
            shortUrl: `${base}/${l.custom_id}`,
            clicks: Number(l.clicks || 0),
            createdAt: new Date(l.created_at).toISOString()
        }));

        res.json({
            success: true,
            data: {items}
        });
    } catch (e) {
        console.error('/api/v1/recent error:', e?.message || e);
        res.status(500).json({success: false, error: 'Internal server error'});
    }
});

// POST /api/v1/links/:id/click - Track a click (alternative to /api/click/:id)
app.post('/api/v1/links/:id/click', async (req, res) => {
    try {
        const id = req.params.id;

        const [result] = await pool.query('UPDATE links SET clicks = clicks + 1 WHERE custom_id = ?', [id]);

        if (result.affectedRows === 0) {
            return res.status(404).json({success: false, error: 'Link not found'});
        }

        // Get updated click count
        const [rows] = await pool.query('SELECT clicks FROM links WHERE custom_id = ? LIMIT 1', [id]);
        const clicks = rows[0]?.clicks || 0;

        res.json({
            success: true,
            data: {
                id,
                clicks: Number(clicks),
                trackedAt: new Date().toISOString()
            }
        });
    } catch (e) {
        console.error('/api/v1/links/:id/click error:', e?.message || e);
        res.status(500).json({success: false, error: 'Internal server error'});
    }
});

// GET /api/v1/check/:id - Check if an ID is available
app.get('/api/v1/check/:id', async (req, res) => {
    try {
        const id = req.params.id;

        if (!/^[a-zA-Z0-9_-]{3,32}$/.test(id)) {
            return res.json({
                success: true,
                data: {
                    id,
                    available: false,
                    reason: 'Invalid format (must be 3-32 chars, alphanumeric, underscore, hyphen)'
                }
            });
        }

        // Check reserved routes
        const reserved = ['api', 'login', 'register', 'edit', 'tos', 'privacy', 'docs', 'health', 'redirect', 'support', 'about', 'terms'];
        if (reserved.includes(id.toLowerCase())) {
            return res.json({
                success: true,
                data: {
                    id,
                    available: false,
                    reason: 'Reserved route'
                }
            });
        }

        const [rows] = await pool.query('SELECT 1 FROM links WHERE custom_id = ? LIMIT 1', [id]);
        const exists = Array.isArray(rows) && rows.length > 0;

        res.json({
            success: true,
            data: {
                id,
                available: !exists,
                reason: exists ? 'Already taken' : null
            }
        });
    } catch (e) {
        console.error('/api/v1/check/:id error:', e?.message || e);
        res.status(500).json({success: false, error: 'Internal server error'});
    }
});

// GET /api/v1/discord/:inviteCode - Get Discord server info
app.get('/api/v1/discord/:inviteCode', async (req, res) => {
    try {
        const inviteCode = req.params.inviteCode;

        const response = await axios.get(
            `https://discord.com/api/v10/invites/${inviteCode}?with_counts=true&with_expiration=true`
        );

        const data = response.data || {};
        const guild = data.guild || {};
        const channel = data.channel || {};

        res.json({
            success: true,
            data: {
                inviteCode,
                server: {
                    id: guild.id || null,
                    name: guild.name || null,
                    icon: guild.icon ? `https://cdn.discordapp.com/icons/${guild.id}/${guild.icon}.png` : null,
                    splash: guild.splash ? `https://cdn.discordapp.com/splashes/${guild.id}/${guild.splash}.png` : null,
                    banner: guild.banner ? `https://cdn.discordapp.com/banners/${guild.id}/${guild.banner}.png` : null,
                    description: guild.description || null,
                    features: guild.features || [],
                    verificationLevel: guild.verification_level || 0,
                    vanityUrlCode: guild.vanity_url_code || null,
                    premiumSubscriptionCount: guild.premium_subscription_count || 0,
                    nsfw: guild.nsfw || false,
                    nsfwLevel: guild.nsfw_level || 0
                },
                channel: {
                    id: channel.id || null,
                    name: channel.name || null,
                    type: channel.type || 0
                },
                memberCount: data.approximate_member_count || null,
                onlineCount: data.approximate_presence_count || null,
                expiresAt: data.expires_at || null,
                inviter: data.inviter ? {
                    id: data.inviter.id,
                    username: data.inviter.username,
                    avatar: data.inviter.avatar ? `https://cdn.discordapp.com/avatars/${data.inviter.id}/${data.inviter.avatar}.png` : null
                } : null
            }
        });
    } catch (e) {
        if (e.response?.status === 404) {
            return res.status(404).json({success: false, error: 'Invite not found or expired'});
        }
        console.error('/api/v1/discord/:inviteCode error:', e?.message || e);
        res.status(500).json({success: false, error: 'Failed to fetch Discord data'});
    }
});

// ============================================================================
// END PUBLIC API v1
// ============================================================================

// ============================================================================
// SHOWCASE API v1
// ============================================================================

// GET /api/v1/showcase - Get all showcase entries
app.get('/api/v1/showcase', async (req, res) => {
    try {
        const page = Math.max(1, parseInt(req.query.page) || 1);
        const limit = Math.min(100, Math.max(1, parseInt(req.query.limit) || 20));
        const offset = (page - 1) * limit;

        // Filtering
        const conditions = [];
        const params = [];

        if (req.query.category) {
            conditions.push('category = ?');
            params.push(req.query.category);
        }
        if (req.query.featured === 'true') {
            conditions.push('featured = 1');
        }
        if (req.query.verified === 'true') {
            conditions.push('verified = 1');
        }
        if (req.query.q || req.query.search) {
            const q = (req.query.q || req.query.search).toString();
            conditions.push('(name LIKE ? OR description LIKE ?)');
            params.push(`%${q}%`, `%${q}%`);
        }

        const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';

        // Get total
        const [countRows] = await pool.query(`SELECT COUNT(*) AS cnt FROM showcase ${whereClause}`, params);
        const total = countRows[0]?.cnt || 0;

        // Get data
        const [rows] = await pool.query(
            `SELECT id, name, description, invite_link, category, tags, logo_url, featured, verified, created_at, owner_id 
             FROM showcase ${whereClause} 
             ORDER BY featured DESC, created_at DESC 
             LIMIT ? OFFSET ?`,
            [...params, limit, offset]
        );

        const items = (rows || []).map(r => ({
            id: r.id,
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
            logoUrl: r.logo_url,
            featured: Boolean(r.featured),
            verified: Boolean(r.verified),
            createdAt: new Date(r.created_at).toISOString(),
            ownerId: r.owner_id || null
        }));

        res.json({
            success: true,
            data: {
                items,
                pagination: {
                    page,
                    limit,
                    total,
                    totalPages: Math.ceil(total / limit),
                    hasNext: page * limit < total,
                    hasPrev: page > 1
                }
            }
        });
    } catch (e) {
        console.error('/api/v1/showcase error:', e?.message || e);
        res.status(500).json({success: false, error: 'Internal server error'});
    }
});

// GET /api/v1/showcase/:id - Get single showcase entry
app.get('/api/v1/showcase/:id', async (req, res) => {
    try {
        const id = req.params.id;

        const [rows] = await pool.query(
            'SELECT id, name, description, invite_link, category, tags, logo_url, featured, verified, created_at, owner_id FROM showcase WHERE id = ? LIMIT 1',
            [id]
        );

        if (!rows || rows.length === 0) {
            return res.status(404).json({success: false, error: 'Showcase entry not found'});
        }

        const r = rows[0];
        res.json({
            success: true,
            data: {
                id: r.id,
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
                logoUrl: r.logo_url,
                featured: Boolean(r.featured),
                verified: Boolean(r.verified),
                createdAt: new Date(r.created_at).toISOString(),
                ownerId: r.owner_id || null
            }
        });
    } catch (e) {
        console.error('/api/v1/showcase/:id error:', e?.message || e);
        res.status(500).json({success: false, error: 'Internal server error'});
    }
});

// GET /api/v1/showcase/categories - Get all categories with counts
app.get('/api/v1/showcase/categories', async (req, res) => {
    try {
        const [rows] = await pool.query(
            'SELECT category, COUNT(*) as count FROM showcase GROUP BY category ORDER BY count DESC'
        );

        const categories = (rows || []).map(r => ({
            name: r.category,
            count: Number(r.count)
        }));

        res.json({
            success: true,
            data: {categories}
        });
    } catch (e) {
        console.error('/api/v1/showcase/categories error:', e?.message || e);
        res.status(500).json({success: false, error: 'Internal server error'});
    }
});

// GET /api/v1/showcase/featured - Get featured showcase entries
app.get('/api/v1/showcase/featured', async (req, res) => {
    try {
        const limit = Math.min(50, Math.max(1, parseInt(req.query.limit) || 10));

        const [rows] = await pool.query(
            `SELECT id, name, description, invite_link, category, tags, logo_url, featured, verified, created_at 
             FROM showcase 
             WHERE featured = 1 
             ORDER BY created_at DESC 
             LIMIT ?`,
            [limit]
        );

        const items = (rows || []).map(r => ({
            id: r.id,
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
            logoUrl: r.logo_url,
            featured: Boolean(r.featured),
            verified: Boolean(r.verified),
            createdAt: new Date(r.created_at).toISOString()
        }));

        res.json({
            success: true,
            data: {items}
        });
    } catch (e) {
        console.error('/api/v1/showcase/featured error:', e?.message || e);
        res.status(500).json({success: false, error: 'Internal server error'});
    }
});

// ============================================================================
// END SHOWCASE API v1
// ============================================================================

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
