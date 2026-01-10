import {useState} from "react";
import {Link as RLink} from "react-router-dom";
import {useLanguage} from "../contexts/LanguageContext";

interface Endpoint {
    method: "GET" | "POST" | "PATCH" | "DELETE";
    path: string;
    description: string;
    descriptionDe: string;
    params?: { name: string; type: string; required: boolean; description: string; descriptionDe: string }[];
    queryParams?: { name: string; type: string; required: boolean; description: string; descriptionDe: string }[];
    body?: { name: string; type: string; required: boolean; description: string; descriptionDe: string }[];
    response: string;
    example?: string;
    auth?: boolean;
}

const endpoints: Endpoint[] = [
    {
        method: "GET",
        path: "/api/v1/stats",
        description: "Get global statistics including total links, clicks, users, and top performing links.",
        descriptionDe: "Globale Statistiken abrufen: Gesamtanzahl Links, Klicks, Nutzer und Top-Links.",
        response: `{
  "success": true,
  "data": {
    "totalLinks": 1234,
    "totalClicks": 56789,
    "totalUsers": 100,
    "linksToday": 15,
    "topLinks": [
      { "id": "myserver", "clicks": 500 }
    ],
    "uptime": "99.9%",
    "version": "1.0.0",
    "timestamp": "2026-01-09T12:00:00.000Z"
  }
}`
    },
    {
        method: "GET",
        path: "/api/v1/links",
        description: "Get all links with advanced filtering, sorting, and pagination. Combine any filters.",
        descriptionDe: "Alle Links mit erweiterten Filtern, Sortierung und Paginierung abrufen. Filter kombinierbar.",
        queryParams: [
            {
                name: "page",
                type: "number",
                required: false,
                description: "Page number (default: 1)",
                descriptionDe: "Seitennummer (Standard: 1)"
            },
            {
                name: "limit",
                type: "number",
                required: false,
                description: "Items per page (1-1000, default: 50)",
                descriptionDe: "Einträge pro Seite (1-1000, Standard: 50)"
            },
            {
                name: "sortBy",
                type: "string",
                required: false,
                description: "Sort by: clicks, id, createdAt",
                descriptionDe: "Sortieren nach: clicks, id, createdAt"
            },
            {
                name: "order",
                type: "string",
                required: false,
                description: "Sort order: asc, desc (default: desc)",
                descriptionDe: "Reihenfolge: asc, desc (Standard: desc)"
            },
            {
                name: "q",
                type: "string",
                required: false,
                description: "Search in ID and URL",
                descriptionDe: "Suche in ID und URL"
            },
            {
                name: "id",
                type: "string",
                required: false,
                description: "Filter by exact ID",
                descriptionDe: "Nach exakter ID filtern"
            },
            {
                name: "minClicks",
                type: "number",
                required: false,
                description: "Minimum clicks",
                descriptionDe: "Mindestanzahl Klicks"
            },
            {
                name: "maxClicks",
                type: "number",
                required: false,
                description: "Maximum clicks",
                descriptionDe: "Maximalanzahl Klicks"
            },
            {
                name: "createdAfter",
                type: "string",
                required: false,
                description: "Created after date (ISO 8601)",
                descriptionDe: "Erstellt nach Datum (ISO 8601)"
            },
            {
                name: "createdBefore",
                type: "string",
                required: false,
                description: "Created before date (ISO 8601)",
                descriptionDe: "Erstellt vor Datum (ISO 8601)"
            },
            {
                name: "userId",
                type: "number",
                required: false,
                description: "Filter by user ID",
                descriptionDe: "Nach Benutzer-ID filtern"
            }
        ],
        response: `{
  "success": true,
  "data": {
    "items": [
      {
        "id": "myserver",
        "originalUrl": "https://discord.gg/abc123",
        "shortUrl": "https://dcs.lol/myserver",
        "clicks": 150,
        "createdAt": "2026-01-01T10:00:00.000Z",
        "userId": 1
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 50,
      "total": 100,
      "totalPages": 2,
      "hasNext": true,
      "hasPrev": false
    },
    "filters": {
      "sortBy": "createdAt",
      "order": "desc",
      "query": null
    }
  }
}`,
        example: `// Alle Links mit mehr als 100 Klicks, sortiert nach Klicks
fetch('/api/v1/links?minClicks=100&sortBy=clicks&order=desc')

// Links von heute
fetch('/api/v1/links?createdAfter=2026-01-09T00:00:00Z')

// Suche nach "gaming"
fetch('/api/v1/links?q=gaming&limit=10')`
    },
    {
        method: "GET",
        path: "/api/v1/links/:id",
        description: "Get detailed information about a specific link including Discord server info.",
        descriptionDe: "Detaillierte Informationen zu einem Link inkl. Discord-Server-Infos abrufen.",
        params: [
            {
                name: "id",
                type: "string",
                required: true,
                description: "The link ID (short code)",
                descriptionDe: "Die Link-ID (Kurzcode)"
            }
        ],
        response: `{
  "success": true,
  "data": {
    "id": "myserver",
    "originalUrl": "https://discord.gg/abc123",
    "shortUrl": "https://dcs.lol/myserver",
    "clicks": 150,
    "createdAt": "2026-01-01T10:00:00.000Z",
    "userId": 1,
    "discord": {
      "serverName": "My Awesome Server",
      "serverId": "123456789",
      "memberCount": 5000,
      "onlineCount": 500,
      "serverIcon": "https://cdn.discordapp.com/icons/...",
      "inviteCode": "abc123",
      "expiresAt": null
    }
  }
}`
    },
    {
        method: "GET",
        path: "/api/v1/links/:id/stats",
        description: "Get detailed statistics for a specific link.",
        descriptionDe: "Detaillierte Statistiken für einen bestimmten Link abrufen.",
        params: [
            {name: "id", type: "string", required: true, description: "The link ID", descriptionDe: "Die Link-ID"}
        ],
        response: `{
  "success": true,
  "data": {
    "id": "myserver",
    "shortUrl": "https://dcs.lol/myserver",
    "totalClicks": 150,
    "createdAt": "2026-01-01T10:00:00.000Z",
    "ageInDays": 9,
    "averageClicksPerDay": 16.67,
    "lastUpdated": "2026-01-09T12:00:00.000Z"
  }
}`
    },
    {
        method: "POST",
        path: "/api/v1/links",
        description: "Create a new shortened Discord link.",
        descriptionDe: "Einen neuen verkürzten Discord-Link erstellen.",
        body: [
            {
                name: "url",
                type: "string",
                required: true,
                description: "Discord invite URL (discord.gg/... or discord.com/invite/...)",
                descriptionDe: "Discord-Einladungs-URL (discord.gg/... oder discord.com/invite/...)"
            },
            {
                name: "customId",
                type: "string",
                required: true,
                description: "Custom ID (3-32 chars, alphanumeric, _, -)",
                descriptionDe: "Benutzerdefinierte ID (3-32 Zeichen, alphanumerisch, _, -)"
            }
        ],
        response: `{
  "success": true,
  "data": {
    "id": "myserver",
    "originalUrl": "https://discord.gg/abc123",
    "shortUrl": "https://dcs.lol/myserver",
    "clicks": 0,
    "createdAt": "2026-01-09T12:00:00.000Z"
  }
}`,
        example: `fetch('/api/v1/links', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    url: 'https://discord.gg/abc123',
    customId: 'my-awesome-server'
  })
})`
    },
    {
        method: "PATCH",
        path: "/api/v1/links/:id",
        description: "Update an existing link (requires authentication, only owner).",
        descriptionDe: "Einen bestehenden Link aktualisieren (erfordert Authentifizierung, nur Besitzer).",
        auth: true,
        params: [
            {
                name: "id",
                type: "string",
                required: true,
                description: "Current link ID",
                descriptionDe: "Aktuelle Link-ID"
            }
        ],
        body: [
            {
                name: "url",
                type: "string",
                required: false,
                description: "New Discord URL",
                descriptionDe: "Neue Discord-URL"
            },
            {
                name: "newId",
                type: "string",
                required: false,
                description: "New custom ID",
                descriptionDe: "Neue benutzerdefinierte ID"
            }
        ],
        response: `{
  "success": true,
  "data": {
    "id": "new-id",
    "originalUrl": "https://discord.gg/newcode",
    "shortUrl": "https://dcs.lol/new-id"
  }
}`
    },
    {
        method: "DELETE",
        path: "/api/v1/links/:id",
        description: "Delete a link (requires authentication, only owner).",
        descriptionDe: "Einen Link löschen (erfordert Authentifizierung, nur Besitzer).",
        auth: true,
        params: [
            {
                name: "id",
                type: "string",
                required: true,
                description: "Link ID to delete",
                descriptionDe: "Zu löschende Link-ID"
            }
        ],
        response: `{
  "success": true,
  "message": "Link deleted successfully"
}`
    },
    {
        method: "GET",
        path: "/api/v1/users/:id/links",
        description: "Get all links created by a specific user.",
        descriptionDe: "Alle Links eines bestimmten Benutzers abrufen.",
        params: [
            {name: "id", type: "number", required: true, description: "User ID", descriptionDe: "Benutzer-ID"}
        ],
        queryParams: [
            {name: "page", type: "number", required: false, description: "Page number", descriptionDe: "Seitennummer"},
            {
                name: "limit",
                type: "number",
                required: false,
                description: "Items per page (1-100)",
                descriptionDe: "Einträge pro Seite (1-100)"
            }
        ],
        response: `{
  "success": true,
  "data": {
    "userId": 1,
    "items": [...],
    "pagination": {
      "page": 1,
      "limit": 20,
      "total": 5,
      "totalPages": 1
    }
  }
}`
    },
    {
        method: "GET",
        path: "/api/v1/search",
        description: "Advanced search across all links.",
        descriptionDe: "Erweiterte Suche über alle Links.",
        queryParams: [
            {
                name: "q",
                type: "string",
                required: true,
                description: "Search query (min 2 chars)",
                descriptionDe: "Suchbegriff (min. 2 Zeichen)"
            },
            {
                name: "limit",
                type: "number",
                required: false,
                description: "Max results (1-100, default: 20)",
                descriptionDe: "Max. Ergebnisse (1-100, Standard: 20)"
            }
        ],
        response: `{
  "success": true,
  "data": {
    "query": "gaming",
    "count": 5,
    "items": [...]
  }
}`
    },
    {
        method: "GET",
        path: "/api/v1/top",
        description: "Get top performing links by clicks.",
        descriptionDe: "Top-Links nach Klicks abrufen.",
        queryParams: [
            {
                name: "limit",
                type: "number",
                required: false,
                description: "Number of results (1-100, default: 10)",
                descriptionDe: "Anzahl Ergebnisse (1-100, Standard: 10)"
            },
            {
                name: "period",
                type: "string",
                required: false,
                description: "Time period: all, today, week, month",
                descriptionDe: "Zeitraum: all, today, week, month"
            }
        ],
        response: `{
  "success": true,
  "data": {
    "period": "week",
    "items": [
      {
        "rank": 1,
        "id": "popular-server",
        "shortUrl": "https://dcs.lol/popular-server",
        "clicks": 500,
        ...
      }
    ]
  }
}`
    },
    {
        method: "GET",
        path: "/api/v1/recent",
        description: "Get most recently created links.",
        descriptionDe: "Die zuletzt erstellten Links abrufen.",
        queryParams: [
            {
                name: "limit",
                type: "number",
                required: false,
                description: "Number of results (1-100, default: 10)",
                descriptionDe: "Anzahl Ergebnisse (1-100, Standard: 10)"
            }
        ],
        response: `{
  "success": true,
  "data": {
    "items": [...]
  }
}`
    },
    {
        method: "POST",
        path: "/api/v1/links/:id/click",
        description: "Manually track a click for a link.",
        descriptionDe: "Einen Klick für einen Link manuell tracken.",
        params: [
            {name: "id", type: "string", required: true, description: "Link ID", descriptionDe: "Link-ID"}
        ],
        response: `{
  "success": true,
  "data": {
    "id": "myserver",
    "clicks": 151,
    "trackedAt": "2026-01-09T12:00:00.000Z"
  }
}`
    },
    {
        method: "GET",
        path: "/api/v1/check/:id",
        description: "Check if a custom ID is available.",
        descriptionDe: "Prüfen, ob eine benutzerdefinierte ID verfügbar ist.",
        params: [
            {name: "id", type: "string", required: true, description: "ID to check", descriptionDe: "Zu prüfende ID"}
        ],
        response: `{
  "success": true,
  "data": {
    "id": "my-new-id",
    "available": true,
    "reason": null
  }
}`
    },
    {
        method: "GET",
        path: "/api/v1/discord/:inviteCode",
        description: "Get detailed Discord server information from an invite code.",
        descriptionDe: "Detaillierte Discord-Server-Informationen von einem Einladungscode abrufen.",
        params: [
            {
                name: "inviteCode",
                type: "string",
                required: true,
                description: "Discord invite code (e.g., abc123 from discord.gg/abc123)",
                descriptionDe: "Discord-Einladungscode (z.B. abc123 von discord.gg/abc123)"
            }
        ],
        response: `{
  "success": true,
  "data": {
    "inviteCode": "abc123",
    "server": {
      "id": "123456789",
      "name": "My Awesome Server",
      "icon": "https://cdn.discordapp.com/icons/...",
      "splash": null,
      "banner": null,
      "description": "A cool server",
      "features": ["COMMUNITY", "VERIFIED"],
      "verificationLevel": 2,
      "vanityUrlCode": null,
      "premiumSubscriptionCount": 5,
      "nsfw": false,
      "nsfwLevel": 0
    },
    "channel": {
      "id": "987654321",
      "name": "welcome",
      "type": 0
    },
    "memberCount": 5000,
    "onlineCount": 500,
    "expiresAt": null,
    "inviter": {
      "id": "111222333",
      "username": "admin",
      "avatar": "https://cdn.discordapp.com/avatars/..."
    }
  }
}`
    },
    // Showcase API Endpoints
    {
        method: "GET",
        path: "/api/showcase",
        description: "Get all showcase entries (featured Discord servers).",
        descriptionDe: "Alle Showcase-Einträge (empfohlene Discord-Server) abrufen.",
        response: `{
  "success": true,
  "data": [
    {
      "id": "abc123-uuid",
      "name": "Gaming Hub",
      "description": "The best gaming community",
      "inviteLink": "dcs.lol/gaming",
      "category": "gaming",
      "tags": ["fps", "mmorpg", "esports"],
      "logoUrl": "/uploads/abc123.webp",
      "createdAt": "2026-01-01T10:00:00.000Z",
      "featured": true,
      "verified": true
    }
  ]
}`,
        example: `fetch('https://dcs.lol/api/showcase')
  .then(res => res.json())
  .then(data => console.log(data))`
    },
    {
        method: "POST",
        path: "/api/showcase",
        description: "Submit a new server to the showcase. Requires multipart/form-data with logo image.",
        descriptionDe: "Neuen Server zum Showcase hinzufügen. Erfordert multipart/form-data mit Logo-Bild.",
        body: [
            {
                name: "name",
                type: "string",
                required: true,
                description: "Server name (max 255 chars)",
                descriptionDe: "Server-Name (max. 255 Zeichen)"
            },
            {
                name: "description",
                type: "string",
                required: true,
                description: "Server description",
                descriptionDe: "Server-Beschreibung"
            },
            {
                name: "inviteLink",
                type: "string",
                required: true,
                description: "DCS.lol link (format: dcs.lol/yourlink)",
                descriptionDe: "DCS.lol-Link (Format: dcs.lol/deinlink)"
            },
            {
                name: "category",
                type: "string",
                required: true,
                description: "Category (gaming, community, music, art, tech, education, other)",
                descriptionDe: "Kategorie (gaming, community, music, art, tech, education, other)"
            },
            {
                name: "tags",
                type: "string[]",
                required: false,
                description: "Tags (max 5, JSON array or comma-separated)",
                descriptionDe: "Tags (max. 5, JSON-Array oder kommagetrennt)"
            },
            {
                name: "logo",
                type: "file",
                required: true,
                description: "Logo image (PNG, JPEG, WebP, max 5MB)",
                descriptionDe: "Logo-Bild (PNG, JPEG, WebP, max. 5MB)"
            }
        ],
        response: `{
  "success": true,
  "data": {
    "id": "new-uuid",
    "name": "My Server",
    "description": "Description...",
    "inviteLink": "dcs.lol/myserver",
    "category": "gaming",
    "tags": ["tag1", "tag2"],
    "logoUrl": "/uploads/new-uuid.webp",
    "createdAt": "2026-01-09T12:00:00.000Z",
    "featured": false,
    "verified": false
  }
}`,
        example: `const formData = new FormData();
formData.append('name', 'My Gaming Server');
formData.append('description', 'The best gaming community!');
formData.append('inviteLink', 'dcs.lol/mygaming');
formData.append('category', 'gaming');
formData.append('tags', JSON.stringify(['fps', 'esports']));
formData.append('logo', logoFile);

fetch('https://dcs.lol/api/showcase', {
  method: 'POST',
  body: formData
})`
    },
    // Webhooks API
    {
        method: "GET",
        path: "/api/webhooks",
        description: "Get all configured webhooks.",
        descriptionDe: "Alle konfigurierten Webhooks abrufen.",
        response: `{
  "success": true,
  "data": [
    {
      "id": "1704800000000",
      "name": "My Discord Webhook",
      "url": "https://discord.com/api/webhooks/...",
      "totalCalls": 150,
      "lastTriggered": "2026-01-09T12:00:00.000Z"
    }
  ]
}`
    },
    {
        method: "POST",
        path: "/api/webhooks",
        description: "Create a new webhook for event notifications.",
        descriptionDe: "Neuen Webhook für Event-Benachrichtigungen erstellen.",
        body: [
            {
                name: "name",
                type: "string",
                required: true,
                description: "Webhook name",
                descriptionDe: "Webhook-Name"
            },
            {
                name: "url",
                type: "string",
                required: true,
                description: "Webhook URL (Discord, Slack, etc.)",
                descriptionDe: "Webhook-URL (Discord, Slack, etc.)"
            }
        ],
        response: `{
  "success": true,
  "data": {
    "id": "1704800000000",
    "name": "My Webhook",
    "url": "https://...",
    "totalCalls": 0
  }
}`
    },
    {
        method: "POST",
        path: "/api/webhooks/:id/test",
        description: "Send a test message to a webhook.",
        descriptionDe: "Testnachricht an einen Webhook senden.",
        params: [
            {
                name: "id",
                type: "string",
                required: true,
                description: "Webhook ID",
                descriptionDe: "Webhook-ID"
            }
        ],
        response: `{
  "success": true,
  "status": 200
}`
    },
    {
        method: "DELETE",
        path: "/api/webhooks/:id",
        description: "Delete a webhook.",
        descriptionDe: "Einen Webhook löschen.",
        params: [
            {
                name: "id",
                type: "string",
                required: true,
                description: "Webhook ID to delete",
                descriptionDe: "Zu löschende Webhook-ID"
            }
        ],
        response: `{
  "success": true
}`
    },
    // User/Auth APIs
    {
        method: "GET",
        path: "/api/me",
        description: "Get current authenticated user info.",
        descriptionDe: "Aktuelle authentifizierte Benutzerinfo abrufen.",
        response: `{
  "user": {
    "id": 1,
    "username": "DiscordUser",
    "avatar": "https://cdn.discordapp.com/avatars/..."
  }
}`,
        example: `// Returns null if not logged in
fetch('https://dcs.lol/api/me', { credentials: 'include' })
  .then(res => res.json())
  .then(data => {
    if (data.user) {
      console.log('Logged in as:', data.user.username);
    }
  })`
    },
    {
        method: "GET",
        path: "/api/my/links",
        description: "Get all links created by the authenticated user.",
        descriptionDe: "Alle Links des eingeloggten Benutzers abrufen.",
        auth: true,
        response: `{
  "items": [
    {
      "id": "mylink",
      "originalUrl": "https://discord.gg/abc123",
      "shortUrl": "https://dcs.lol/mylink",
      "clicks": 100,
      "createdAt": "2026-01-01T10:00:00.000Z"
    }
  ]
}`
    },
    {
        method: "PATCH",
        path: "/api/my/links/:id",
        description: "Update one of your own links.",
        descriptionDe: "Einen eigenen Link aktualisieren.",
        auth: true,
        params: [
            {
                name: "id",
                type: "string",
                required: true,
                description: "Current link ID",
                descriptionDe: "Aktuelle Link-ID"
            }
        ],
        body: [
            {
                name: "originalUrl",
                type: "string",
                required: false,
                description: "New Discord URL",
                descriptionDe: "Neue Discord-URL"
            },
            {
                name: "newCustomId",
                type: "string",
                required: false,
                description: "New custom ID",
                descriptionDe: "Neue benutzerdefinierte ID"
            }
        ],
        response: `{
  "ok": true
}`
    },
    {
        method: "DELETE",
        path: "/api/my/links/:id",
        description: "Delete one of your own links.",
        descriptionDe: "Einen eigenen Link löschen.",
        auth: true,
        params: [
            {
                name: "id",
                type: "string",
                required: true,
                description: "Link ID to delete",
                descriptionDe: "Zu löschende Link-ID"
            }
        ],
        response: `{
  "ok": true
}`
    },
    // Health & Utility
    {
        method: "GET",
        path: "/health",
        description: "Health check endpoint for monitoring.",
        descriptionDe: "Health-Check-Endpoint für Monitoring.",
        response: `{
  "status": "ok"
}`
    },
    {
        method: "GET",
        path: "/api/info/:id",
        description: "Get Discord server info for a shortened link (proxied, CSP-friendly).",
        descriptionDe: "Discord-Server-Info für einen gekürzten Link abrufen (proxied, CSP-freundlich).",
        params: [
            {
                name: "id",
                type: "string",
                required: true,
                description: "The short link ID",
                descriptionDe: "Die Kurzlink-ID"
            }
        ],
        response: `{
  "name": "My Awesome Server",
  "icon": "https://dcs.lol/proxy/discord/icons/123/abc",
  "inviteCode": "myserver",
  "originalUrl": "https://discord.gg/abc123"
}`,
        example: `// Get server preview before redirecting
fetch('https://dcs.lol/api/info/myserver')
  .then(res => res.json())
  .then(data => {
    console.log('Server:', data.name);
    console.log('Icon:', data.icon);
  })`
    },
    {
        method: "GET",
        path: "/api/recents",
        description: "Get the most recently created links.",
        descriptionDe: "Die zuletzt erstellten Links abrufen.",
        queryParams: [
            {
                name: "limit",
                type: "number",
                required: false,
                description: "Number of results (1-100, default: 9)",
                descriptionDe: "Anzahl Ergebnisse (1-100, Standard: 9)"
            }
        ],
        response: `{
  "success": true,
  "data": [
    {
      "id": "newlink",
      "originalUrl": "https://discord.gg/...",
      "shortUrl": "https://dcs.lol/newlink",
      "clicks": 5,
      "createdAt": "2026-01-09T12:00:00.000Z"
    }
  ]
}`
    },
    // Discord Icon Proxy
    {
        method: "GET",
        path: "/proxy/discord/icons/:guildId/:icon",
        description: "Proxy Discord server icons (CSP-friendly, cached).",
        descriptionDe: "Discord-Server-Icons proxyen (CSP-freundlich, gecached).",
        params: [
            {
                name: "guildId",
                type: "string",
                required: true,
                description: "Discord server/guild ID",
                descriptionDe: "Discord-Server/Guild-ID"
            },
            {
                name: "icon",
                type: "string",
                required: true,
                description: "Icon hash from Discord API",
                descriptionDe: "Icon-Hash von der Discord API"
            }
        ],
        queryParams: [
            {
                name: "size",
                type: "number",
                required: false,
                description: "Image size (16-256, default: 128)",
                descriptionDe: "Bildgröße (16-256, Standard: 128)"
            }
        ],
        response: `// Returns image/png or image/gif binary data
// Cached for 24 hours
// Falls back to SVG placeholder if not found`,
        example: `// Use in img src
<img src="https://dcs.lol/proxy/discord/icons/123456/abc123?size=64" alt="Server Icon" />`
    },
    // Showcase Rating & Social Features
    {
        method: "GET",
        path: "/api/showcase/:id",
        description: "Get detailed info about a specific showcase server including ratings and reviews.",
        descriptionDe: "Detaillierte Infos zu einem Showcase-Server inkl. Bewertungen und Reviews abrufen.",
        params: [
            {
                name: "id",
                type: "string",
                required: true,
                description: "Showcase entry ID",
                descriptionDe: "Showcase-Eintrags-ID"
            }
        ],
        response: `{
  "id": "abc123-uuid",
  "name": "Gaming Hub",
  "description": "The best gaming community",
  "inviteLink": "dcs.lol/gaming",
  "category": "Gaming",
  "tags": ["fps", "mmorpg"],
  "logoUrl": "/uploads/abc123.webp",
  "avgRating": 4.5,
  "ratingCount": 25,
  "favoriteCount": 100,
  "views": 1500,
  "reviews": [
    {
      "id": 1,
      "rating": 5,
      "review": "Great server!",
      "username": "User123",
      "createdAt": "2026-01-09T12:00:00.000Z"
    }
  ],
  "userRating": { "rating": 5, "review": "..." },
  "userFavorited": true
}`
    },
    {
        method: "POST",
        path: "/api/showcase/:id/rate",
        description: "Rate a showcase server (1-5 stars). Requires authentication.",
        descriptionDe: "Einen Showcase-Server bewerten (1-5 Sterne). Erfordert Authentifizierung.",
        auth: true,
        params: [
            {
                name: "id",
                type: "string",
                required: true,
                description: "Showcase entry ID",
                descriptionDe: "Showcase-Eintrags-ID"
            }
        ],
        body: [
            {
                name: "rating",
                type: "number",
                required: true,
                description: "Rating (1-5)",
                descriptionDe: "Bewertung (1-5)"
            },
            {
                name: "review",
                type: "string",
                required: false,
                description: "Optional review text",
                descriptionDe: "Optionaler Bewertungstext"
            }
        ],
        response: `{
  "success": true,
  "avgRating": 4.5,
  "ratingCount": 26
}`,
        example: `fetch('/api/showcase/abc123/rate', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  credentials: 'include',
  body: JSON.stringify({ rating: 5, review: 'Amazing server!' })
})`
    },
    {
        method: "DELETE",
        path: "/api/showcase/:id/rate",
        description: "Remove your rating from a showcase server.",
        descriptionDe: "Deine Bewertung von einem Showcase-Server entfernen.",
        auth: true,
        params: [
            {
                name: "id",
                type: "string",
                required: true,
                description: "Showcase entry ID",
                descriptionDe: "Showcase-Eintrags-ID"
            }
        ],
        response: `{ "success": true }`
    },
    {
        method: "GET",
        path: "/api/showcase/:id/reviews",
        description: "Get paginated reviews for a showcase server.",
        descriptionDe: "Paginierte Reviews für einen Showcase-Server abrufen.",
        params: [
            {
                name: "id",
                type: "string",
                required: true,
                description: "Showcase entry ID",
                descriptionDe: "Showcase-Eintrags-ID"
            }
        ],
        queryParams: [
            {
                name: "page",
                type: "number",
                required: false,
                description: "Page number (default: 1)",
                descriptionDe: "Seitennummer (Standard: 1)"
            },
            {
                name: "limit",
                type: "number",
                required: false,
                description: "Reviews per page (max 100)",
                descriptionDe: "Reviews pro Seite (max. 100)"
            }
        ],
        response: `{
  "reviews": [...],
  "total": 50,
  "page": 1,
  "limit": 20
}`
    },
    {
        method: "POST",
        path: "/api/showcase/:id/favorite",
        description: "Toggle favorite status for a showcase server. Requires authentication.",
        descriptionDe: "Favoriten-Status für einen Showcase-Server umschalten. Erfordert Authentifizierung.",
        auth: true,
        params: [
            {
                name: "id",
                type: "string",
                required: true,
                description: "Showcase entry ID",
                descriptionDe: "Showcase-Eintrags-ID"
            }
        ],
        response: `{ "favorited": true }`
    },
    {
        method: "GET",
        path: "/api/favorites",
        description: "Get all favorited showcase servers for the authenticated user.",
        descriptionDe: "Alle favorisierten Showcase-Server des eingeloggten Benutzers abrufen.",
        auth: true,
        response: `[
  {
    "id": "abc123",
    "name": "Gaming Hub",
    "avgRating": 4.5,
    ...
  }
]`
    },
    {
        method: "POST",
        path: "/api/showcase/:id/report",
        description: "Report a showcase server for inappropriate content.",
        descriptionDe: "Einen Showcase-Server wegen unangemessenen Inhalts melden.",
        auth: true,
        params: [
            {
                name: "id",
                type: "string",
                required: true,
                description: "Showcase entry ID",
                descriptionDe: "Showcase-Eintrags-ID"
            }
        ],
        body: [
            {
                name: "reason",
                type: "string",
                required: true,
                description: "Reason (spam, inappropriate, scam, copyright, other)",
                descriptionDe: "Grund (spam, inappropriate, scam, copyright, other)"
            },
            {
                name: "details",
                type: "string",
                required: false,
                description: "Additional details",
                descriptionDe: "Weitere Details"
            }
        ],
        response: `{ "success": true, "message": "Thank you for your report!" }`
    },
    {
        method: "GET",
        path: "/api/search",
        description: "Search showcase servers by name, description, category, or tags.",
        descriptionDe: "Showcase-Server nach Name, Beschreibung, Kategorie oder Tags suchen.",
        queryParams: [
            {name: "q", type: "string", required: false, description: "Search query", descriptionDe: "Suchbegriff"},
            {
                name: "category",
                type: "string",
                required: false,
                description: "Filter by category",
                descriptionDe: "Nach Kategorie filtern"
            },
            {
                name: "tag",
                type: "string",
                required: false,
                description: "Filter by tag",
                descriptionDe: "Nach Tag filtern"
            },
            {
                name: "sort",
                type: "string",
                required: false,
                description: "Sort by: rating, views, favorites, newest",
                descriptionDe: "Sortieren nach: rating, views, favorites, newest"
            },
            {name: "page", type: "number", required: false, description: "Page number", descriptionDe: "Seitennummer"},
            {
                name: "limit",
                type: "number",
                required: false,
                description: "Results per page (max 50)",
                descriptionDe: "Ergebnisse pro Seite (max. 50)"
            }
        ],
        response: `{
  "servers": [...],
  "page": 1,
  "limit": 20
}`,
        example: `// Search gaming servers sorted by rating
fetch('/api/search?q=gaming&category=Gaming&sort=rating')`
    },
    {
        method: "GET",
        path: "/api/top",
        description: "Get top-rated showcase servers.",
        descriptionDe: "Die bestbewerteten Showcase-Server abrufen.",
        queryParams: [
            {
                name: "limit",
                type: "number",
                required: false,
                description: "Number of results (max 50)",
                descriptionDe: "Anzahl Ergebnisse (max. 50)"
            }
        ],
        response: `[
  {
    "id": "abc123",
    "name": "Top Server",
    "avgRating": 4.9,
    "ratingCount": 100,
    ...
  }
]`
    },
    {
        method: "GET",
        path: "/api/showcase-stats",
        description: "Get global showcase statistics.",
        descriptionDe: "Globale Showcase-Statistiken abrufen.",
        response: `{
  "totalServers": 150,
  "totalRatings": 2500,
  "totalFavorites": 5000,
  "totalViews": 100000,
  "averageRating": 4.2,
  "categories": [
    { "category": "Gaming", "count": 50 },
    { "category": "Community", "count": 30 }
  ]
}`
    }
];

const methodColors: Record<string, string> = {
    GET: "bg-emerald-500/20 text-emerald-400 border-emerald-500/30",
    POST: "bg-blue-500/20 text-blue-400 border-blue-500/30",
    PATCH: "bg-amber-500/20 text-amber-400 border-amber-500/30",
    DELETE: "bg-red-500/20 text-red-400 border-red-500/30"
};

export default function ApiDocs() {
    const {language} = useLanguage();
    const isDE = language === "de";
    const [expandedEndpoint, setExpandedEndpoint] = useState<string | null>(null);
    const [copiedCode, setCopiedCode] = useState<string | null>(null);

    const copyToClipboard = (text: string, id: string) => {
        navigator.clipboard.writeText(text);
        setCopiedCode(id);
        setTimeout(() => setCopiedCode(null), 2000);
    };

    const baseUrl = "https://dcs.lol";

    return (
        <div className="min-h-[100dvh] bg-background text-foreground">
            {/* Background */}
            <div className="fixed inset-0 pointer-events-none">
                <div className="absolute inset-0 opacity-[0.04] bg-grid"/>
                <div className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-primary/5 rounded-full blur-[180px]"/>
                <div
                    className="absolute bottom-1/4 right-1/4 w-[400px] h-[400px] bg-accent/5 rounded-full blur-[150px]"/>
            </div>

            {/* Header */}
            <header className="relative border-b border-border bg-card/80 backdrop-blur-xl sticky top-0 z-50">
                <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <RLink to="/"
                               className="font-display text-2xl tracking-tight text-foreground">
                            dcs<span className="text-primary">.</span>lol
                        </RLink>
                        <span className="text-muted-foreground">/</span>
                        <span className="text-foreground font-medium">API Documentation</span>
                        <span
                            className="px-2 py-0.5 rounded-full bg-primary/20 text-primary text-xs font-medium border border-primary/30">
                            v1
                        </span>
                    </div>
                    <RLink to="/"
                           className="px-4 py-2 rounded-xl btn-secondary text-sm font-medium">
                        {isDE ? "Zurück" : "Back"}
                    </RLink>
                </div>
            </header>

            <div className="relative max-w-7xl mx-auto px-6 py-12">
                {/* Hero Section */}
                <div className="mb-16 text-center">
                    <div
                        className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 mb-6">
                        <span className="w-2 h-2 rounded-full bg-primary animate-pulse"/>
                        <span className="text-sm text-primary">
                            {isDE ? "Keine Rate Limits • Vollständiger Zugriff" : "No Rate Limits • Full Access"}
                        </span>
                    </div>
                    <h1 className="text-4xl md:text-6xl font-semibold mb-6 tracking-tight text-foreground">
                        DCS.lol API
                    </h1>
                    <p className="text-lg text-muted-foreground max-w-2xl mx-auto mb-8">
                        {isDE
                            ? "Voller Zugriff auf alle Links, Statistiken und Discord-Server-Informationen. Keine Rate Limits. Keine API-Keys erforderlich."
                            : "Full access to all links, statistics, and Discord server information. No rate limits. No API keys required."}
                    </p>
                    <div className="flex flex-wrap justify-center gap-4 text-sm">
                        <div
                            className="px-4 py-2 rounded-xl bg-primary/10 border border-primary/20 text-primary">
                            ✓ {isDE ? "Keine Rate Limits" : "No Rate Limits"}
                        </div>
                        <div className="px-4 py-2 rounded-xl bg-accent/10 border border-accent/20 text-accent">
                            ✓ {isDE ? "Keine API-Keys" : "No API Keys"}
                        </div>
                        <div
                            className="px-4 py-2 rounded-xl bg-primary/10 border border-primary/20 text-primary">
                            ✓ {isDE ? "Alle Filter kombinierbar" : "All Filters Combinable"}
                        </div>
                        <div
                            className="px-4 py-2 rounded-xl bg-accent/10 border border-accent/20 text-accent">
                            ✓ JSON {isDE ? "Antworten" : "Responses"}
                        </div>
                    </div>
                </div>

                {/* API Categories Overview */}
                <div className="mb-16 grid md:grid-cols-2 lg:grid-cols-4 gap-4">
                    <div
                        className="p-5 rounded-2xl bg-card border border-border hover:border-primary/30 transition-colors">
                        <div className="w-10 h-10 rounded-xl bg-emerald-500/20 flex items-center justify-center mb-3">
                            <span className="text-emerald-400 text-lg">🔗</span>
                        </div>
                        <h3 className="font-semibold text-foreground mb-1">{isDE ? "Links API" : "Links API"}</h3>
                        <p className="text-sm text-muted-foreground">
                            {isDE ? "Links erstellen, abrufen, aktualisieren und löschen" : "Create, read, update and delete links"}
                        </p>
                        <span className="text-xs text-primary mt-2 block">10 Endpoints</span>
                    </div>
                    <div
                        className="p-5 rounded-2xl bg-card border border-border hover:border-accent/30 transition-colors">
                        <div className="w-10 h-10 rounded-xl bg-violet-500/20 flex items-center justify-center mb-3">
                            <span className="text-violet-400 text-lg">🏆</span>
                        </div>
                        <h3 className="font-semibold text-foreground mb-1">{isDE ? "Showcase API" : "Showcase API"}</h3>
                        <p className="text-sm text-muted-foreground">
                            {isDE ? "Server-Showcase Einträge verwalten" : "Manage server showcase entries"}
                        </p>
                        <span className="text-xs text-accent mt-2 block">2 Endpoints</span>
                    </div>
                    <div
                        className="p-5 rounded-2xl bg-card border border-border hover:border-blue-500/30 transition-colors">
                        <div className="w-10 h-10 rounded-xl bg-blue-500/20 flex items-center justify-center mb-3">
                            <span className="text-blue-400 text-lg">🔔</span>
                        </div>
                        <h3 className="font-semibold text-foreground mb-1">{isDE ? "Webhooks API" : "Webhooks API"}</h3>
                        <p className="text-sm text-muted-foreground">
                            {isDE ? "Event-Benachrichtigungen einrichten" : "Set up event notifications"}
                        </p>
                        <span className="text-xs text-blue-400 mt-2 block">4 Endpoints</span>
                    </div>
                    <div
                        className="p-5 rounded-2xl bg-card border border-border hover:border-amber-500/30 transition-colors">
                        <div className="w-10 h-10 rounded-xl bg-amber-500/20 flex items-center justify-center mb-3">
                            <span className="text-amber-400 text-lg">👤</span>
                        </div>
                        <h3 className="font-semibold text-foreground mb-1">{isDE ? "User API" : "User API"}</h3>
                        <p className="text-sm text-muted-foreground">
                            {isDE ? "Benutzer-Authentifizierung & eigene Links" : "User authentication & personal links"}
                        </p>
                        <span className="text-xs text-amber-400 mt-2 block">4 Endpoints</span>
                    </div>
                </div>

                {/* Quick Start */}
                <div
                    className="mb-16 p-6 rounded-2xl bg-card border border-border">
                    <h2 className="text-2xl font-semibold mb-4">{isDE ? "Schnellstart" : "Quick Start"}</h2>
                    <p className="text-muted-foreground mb-6">
                        {isDE
                            ? "Alle Endpoints sind unter der Base-URL erreichbar. Einfach loslegen!"
                            : "All endpoints are accessible under the base URL. Just start using them!"}
                    </p>
                    <div className="grid md:grid-cols-2 gap-4">
                        <div className="p-4 rounded-xl bg-background border border-border">
                            <div className="flex items-center justify-between mb-2">
                                <span className="text-sm text-muted-foreground">Base URL</span>
                                <button
                                    onClick={() => copyToClipboard(baseUrl, "base")}
                                    className="text-xs text-primary hover:text-primary/80"
                                >
                                    {copiedCode === "base" ? "✓ Copied" : "Copy"}
                                </button>
                            </div>
                            <code className="text-primary font-mono">{baseUrl}</code>
                        </div>
                        <div className="p-4 rounded-xl bg-background border border-border">
                            <div className="flex items-center justify-between mb-2">
                                <span
                                    className="text-sm text-muted-foreground">{isDE ? "Beispiel-Anfrage" : "Example Request"}</span>
                                <button
                                    onClick={() => copyToClipboard(`fetch('${baseUrl}/api/v1/stats')`, "example")}
                                    className="text-xs text-primary hover:text-primary/80"
                                >
                                    {copiedCode === "example" ? "✓ Copied" : "Copy"}
                                </button>
                            </div>
                            <code className="text-accent font-mono text-sm">fetch('{baseUrl}/api/v1/stats')</code>
                        </div>
                    </div>
                </div>

                {/* React/TSX Integration Example */}
                <div className="mb-16">
                    <h2 className="text-2xl font-semibold mb-6">{isDE ? "React/TSX Integration" : "React/TSX Integration"}</h2>
                    <div className="p-6 rounded-2xl bg-card border border-border">
                        <div className="flex items-center justify-between mb-4">
                            <span className="text-sm text-muted-foreground">LinkStats.tsx</span>
                            <button
                                onClick={() => copyToClipboard(`import { useEffect, useState } from 'react';

interface LinkData {
  id: string;
  shortUrl: string;
  clicks: number;
  createdAt: string;
  discord?: {
    serverName: string;
    memberCount: number;
  };
}

export function LinkStats({ linkId }: { linkId: string }) {
  const [data, setData] = useState<LinkData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch(\`https://dcs.lol/api/v1/links/\${linkId}\`)
      .then(res => res.json())
      .then(json => {
        if (json.success) {
          setData(json.data);
        } else {
          setError(json.error);
        }
      })
      .catch(err => setError(err.message))
      .finally(() => setLoading(false));
  }, [linkId]);

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;
  if (!data) return <div>No data</div>;

  return (
    <div className="p-6 rounded-xl bg-gradient-to-br from-violet-500/10 to-fuchsia-500/10">
      <h2 className="text-xl font-bold">{data.discord?.serverName || data.id}</h2>
      <p className="text-white/60">{data.shortUrl}</p>
      <div className="mt-4 grid grid-cols-2 gap-4">
        <div>
          <span className="text-white/40">Clicks</span>
          <p className="text-2xl font-bold">{data.clicks}</p>
        </div>
        {data.discord && (
          <div>
            <span className="text-white/40">Members</span>
            <p className="text-2xl font-bold">{data.discord.memberCount}</p>
          </div>
        )}
      </div>
    </div>
  );
}`, "react")}
                                className="text-xs text-primary hover:text-primary/80"
                            >
                                {copiedCode === "react" ? "✓ Copied" : "Copy"}
                            </button>
                        </div>
                        <pre className="text-sm overflow-x-auto text-foreground/80 font-mono leading-relaxed">
{`import { useEffect, useState } from 'react';

interface LinkData {
  id: string;
  shortUrl: string;
  clicks: number;
  createdAt: string;
  discord?: {
    serverName: string;
    memberCount: number;
  };
}

export function LinkStats({ linkId }: { linkId: string }) {
  const [data, setData] = useState<LinkData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(\`https://dcs.lol/api/v1/links/\${linkId}\`)
      .then(res => res.json())
      .then(json => {
        if (json.success) setData(json.data);
      })
      .finally(() => setLoading(false));
  }, [linkId]);

  if (loading) return <div>Loading...</div>;
  if (!data) return <div>No data</div>;

  return (
    <div className="p-6 rounded-xl bg-violet-500/10">
      <h2>{data.discord?.serverName || data.id}</h2>
      <p>Clicks: {data.clicks}</p>
    </div>
  );
}`}
                        </pre>
                    </div>
                </div>

                {/* Advanced Filter Combinations */}
                <div className="mb-16">
                    <h2 className="text-2xl font-semibold mb-6">{isDE ? "Filter kombinieren" : "Combining Filters"}</h2>
                    <div className="grid gap-4">
                        <div className="p-4 rounded-xl bg-card border border-border">
                            <p className="text-sm text-muted-foreground mb-2">
                                {isDE ? "Links mit 50-200 Klicks, diese Woche erstellt, sortiert nach Klicks:" : "Links with 50-200 clicks, created this week, sorted by clicks:"}
                            </p>
                            <code className="text-primary font-mono text-sm break-all">
                                /api/v1/links?minClicks=50&maxClicks=200&createdAfter=2026-01-02&sortBy=clicks&order=desc
                            </code>
                        </div>
                        <div className="p-4 rounded-xl bg-card border border-border">
                            <p className="text-sm text-muted-foreground mb-2">
                                {isDE ? "Suche nach 'gaming' mit mindestens 100 Klicks:" : "Search for 'gaming' with at least 100 clicks:"}
                            </p>
                            <code className="text-primary font-mono text-sm break-all">
                                /api/v1/links?q=gaming&minClicks=100&limit=50
                            </code>
                        </div>
                        <div className="p-4 rounded-xl bg-card border border-border">
                            <p className="text-sm text-muted-foreground mb-2">
                                {isDE ? "Top 20 Links des Monats:" : "Top 20 links of the month:"}
                            </p>
                            <code className="text-primary font-mono text-sm break-all">
                                /api/v1/top?period=month&limit=20
                            </code>
                        </div>
                    </div>
                </div>

                {/* Endpoints Overview */}
                <div className="mb-8">
                    <h2 className="text-2xl font-semibold mb-2">{isDE ? "Alle Endpoints" : "All Endpoints"}</h2>
                    <p className="text-muted-foreground mb-6">
                        {isDE ? "Klicke auf einen Endpoint für Details" : "Click on an endpoint for details"}
                    </p>

                    {/* Quick Overview Table */}
                    <div className="mb-8 overflow-x-auto">
                        <table className="w-full text-sm">
                            <thead>
                            <tr className="border-b border-border">
                                <th className="text-left py-3 px-4 text-muted-foreground font-medium">Method</th>
                                <th className="text-left py-3 px-4 text-muted-foreground font-medium">Endpoint</th>
                                <th className="text-left py-3 px-4 text-muted-foreground font-medium hidden md:table-cell">{isDE ? "Beschreibung" : "Description"}</th>
                                <th className="text-left py-3 px-4 text-muted-foreground font-medium">Auth</th>
                            </tr>
                            </thead>
                            <tbody>
                            {endpoints.map((ep) => (
                                <tr
                                    key={ep.method + ep.path}
                                    className="border-b border-border/50 hover:bg-card cursor-pointer transition-colors"
                                    onClick={() => setExpandedEndpoint(expandedEndpoint === ep.path ? null : ep.path)}
                                >
                                    <td className="py-3 px-4">
                                            <span
                                                className={`px-2 py-1 rounded text-xs font-mono font-bold border ${methodColors[ep.method]}`}>
                                                {ep.method}
                                            </span>
                                    </td>
                                    <td className="py-3 px-4 font-mono text-primary">{ep.path}</td>
                                    <td className="py-3 px-4 text-muted-foreground hidden md:table-cell">
                                        {isDE ? ep.descriptionDe : ep.description}
                                    </td>
                                    <td className="py-3 px-4">
                                        {ep.auth ? (
                                            <span className="text-amber-400">🔒</span>
                                        ) : (
                                            <span className="text-primary">✓</span>
                                        )}
                                    </td>
                                </tr>
                            ))}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* Detailed Endpoints */}
                <div className="space-y-6">
                    {endpoints.map((ep) => (
                        <div
                            key={ep.method + ep.path}
                            id={ep.path.replace(/[/:]/g, "-")}
                            className={`rounded-2xl border transition-all ${
                                expandedEndpoint === ep.path
                                    ? "bg-card border-primary/30"
                                    : "bg-card/50 border-border hover:border-border"
                            }`}
                        >
                            <button
                                className="w-full p-6 text-left flex items-center gap-4"
                                onClick={() => setExpandedEndpoint(expandedEndpoint === ep.path ? null : ep.path)}
                            >
                                <span
                                    className={`px-3 py-1.5 rounded-lg text-xs font-mono font-bold border ${methodColors[ep.method]}`}>
                                    {ep.method}
                                </span>
                                <code className="font-mono text-lg text-foreground">{ep.path}</code>
                                {ep.auth && (
                                    <span
                                        className="px-2 py-1 rounded-lg bg-amber-500/10 text-amber-400 text-xs border border-amber-500/20">
                                        🔒 Auth
                                    </span>
                                )}
                                <span className="ml-auto text-muted-foreground">
                                    {expandedEndpoint === ep.path ? "▼" : "▶"}
                                </span>
                            </button>

                            {expandedEndpoint === ep.path && (
                                <div className="px-6 pb-6 space-y-6">
                                    <p className="text-muted-foreground">
                                        {isDE ? ep.descriptionDe : ep.description}
                                    </p>

                                    {/* Parameters */}
                                    {ep.params && ep.params.length > 0 && (
                                        <div>
                                            <h4 className="text-sm font-semibold text-foreground/80 mb-3">
                                                {isDE ? "URL Parameter" : "URL Parameters"}
                                            </h4>
                                            <div className="space-y-2">
                                                {ep.params.map((p) => (
                                                    <div key={p.name}
                                                         className="flex items-start gap-3 p-3 rounded-xl bg-background border border-border">
                                                        <code className="text-primary font-mono">{p.name}</code>
                                                        <span className="text-muted-foreground text-sm">{p.type}</span>
                                                        {p.required && (
                                                            <span
                                                                className="text-xs text-red-400">{isDE ? "erforderlich" : "required"}</span>
                                                        )}
                                                        <span className="text-muted-foreground text-sm ml-auto">
                                                            {isDE ? p.descriptionDe : p.description}
                                                        </span>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    )}

                                    {/* Query Parameters */}
                                    {ep.queryParams && ep.queryParams.length > 0 && (
                                        <div>
                                            <h4 className="text-sm font-semibold text-foreground/80 mb-3">Query
                                                Parameters</h4>
                                            <div className="space-y-2">
                                                {ep.queryParams.map((p) => (
                                                    <div key={p.name}
                                                         className="flex flex-wrap items-start gap-3 p-3 rounded-xl bg-background border border-border">
                                                        <code className="text-primary font-mono">{p.name}</code>
                                                        <span className="text-muted-foreground text-sm">{p.type}</span>
                                                        {p.required && (
                                                            <span
                                                                className="text-xs text-red-400">{isDE ? "erforderlich" : "required"}</span>
                                                        )}
                                                        <span
                                                            className="text-muted-foreground text-sm flex-1 min-w-[200px]">
                                                            {isDE ? p.descriptionDe : p.description}
                                                        </span>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    )}

                                    {/* Request Body */}
                                    {ep.body && ep.body.length > 0 && (
                                        <div>
                                            <h4 className="text-sm font-semibold text-foreground/80 mb-3">Request
                                                Body</h4>
                                            <div className="space-y-2">
                                                {ep.body.map((p) => (
                                                    <div key={p.name}
                                                         className="flex flex-wrap items-start gap-3 p-3 rounded-xl bg-background border border-border">
                                                        <code className="text-primary font-mono">{p.name}</code>
                                                        <span className="text-muted-foreground text-sm">{p.type}</span>
                                                        {p.required && (
                                                            <span
                                                                className="text-xs text-red-400">{isDE ? "erforderlich" : "required"}</span>
                                                        )}
                                                        <span
                                                            className="text-muted-foreground text-sm flex-1 min-w-[200px]">
                                                            {isDE ? p.descriptionDe : p.description}
                                                        </span>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    )}

                                    {/* Response */}
                                    <div>
                                        <div className="flex items-center justify-between mb-3">
                                            <h4 className="text-sm font-semibold text-foreground/80">Response</h4>
                                            <button
                                                onClick={() => copyToClipboard(ep.response, ep.path + "-response")}
                                                className="text-xs text-primary hover:text-primary/80"
                                            >
                                                {copiedCode === ep.path + "-response" ? "✓ Copied" : "Copy"}
                                            </button>
                                        </div>
                                        <pre
                                            className="p-4 rounded-xl bg-background border border-border overflow-x-auto text-sm font-mono text-primary">
                                            {ep.response}
                                        </pre>
                                    </div>

                                    {/* Example */}
                                    {ep.example && (
                                        <div>
                                            <div className="flex items-center justify-between mb-3">
                                                <h4 className="text-sm font-semibold text-foreground/80">{isDE ? "Beispiel" : "Example"}</h4>
                                                <button
                                                    onClick={() => copyToClipboard(ep.example!, ep.path + "-example")}
                                                    className="text-xs text-primary hover:text-primary/80"
                                                >
                                                    {copiedCode === ep.path + "-example" ? "✓ Copied" : "Copy"}
                                                </button>
                                            </div>
                                            <pre
                                                className="p-4 rounded-xl bg-background border border-border overflow-x-auto text-sm font-mono text-accent">
                                                {ep.example}
                                            </pre>
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>
                    ))}
                </div>

                {/* API Terms of Service */}
                <div className="mt-16 p-6 rounded-2xl bg-amber-500/5 border border-amber-500/20">
                    <h2 className="text-2xl font-semibold mb-4 text-amber-400">
                        {isDE ? "API Nutzungsbedingungen" : "API Terms of Service"}
                    </h2>
                    <div className="space-y-4">
                        <div className="p-4 rounded-xl bg-background border border-amber-500/30">
                            <div className="flex items-start gap-3">
                                <span className="text-amber-400 text-xl">⚠️</span>
                                <div>
                                    <h3 className="font-semibold text-foreground mb-2">
                                        {isDE ? "Pflichtangabe bei Nutzung" : "Required Attribution"}
                                    </h3>
                                    <p className="text-muted-foreground">
                                        {isDE
                                            ? "Bei Verwendung der DCS.lol API muss auf jeder Seite, die API-Daten anzeigt, folgende Angabe sichtbar sein:"
                                            : "When using the DCS.lol API, the following attribution must be visible on every page displaying API data:"}
                                    </p>
                                    <div className="mt-4 p-4 rounded-lg bg-card border border-border">
                                        <code className="text-primary font-mono">
                                            Powered by{" "}
                                            <a href="https://dcs.lol"
                                               className="underline text-accent hover:text-accent/80">
                                                DCS.lol API
                                            </a>
                                        </code>
                                    </div>
                                    <p className="text-muted-foreground text-sm mt-3">
                                        {isDE
                                            ? "Der Link muss klickbar sein und zu https://dcs.lol führen."
                                            : "The link must be clickable and lead to https://dcs.lol."}
                                    </p>
                                </div>
                            </div>
                        </div>

                        <div className="p-4 rounded-xl bg-background border border-border">
                            <h3 className="font-semibold text-foreground mb-2">
                                {isDE ? "Beispiel-Implementierung" : "Example Implementation"}
                            </h3>
                            <pre className="text-sm font-mono text-foreground/80 overflow-x-auto">
{`<!-- HTML -->
<p>Powered by <a href="https://dcs.lol">DCS.lol API</a></p>

// React/JSX
<p>Powered by <a href="https://dcs.lol">DCS.lol API</a></p>

// Markdown
Powered by [DCS.lol API](https://dcs.lol)`}
                            </pre>
                        </div>

                        <div className="grid md:grid-cols-2 gap-4 text-sm">
                            <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/20">
                                <span className="text-emerald-400 font-semibold">✓ {isDE ? "Erlaubt" : "Allowed"}</span>
                                <ul className="mt-2 space-y-1 text-muted-foreground">
                                    <li>{isDE ? "• Kommerzielle Nutzung mit Attribution" : "• Commercial use with attribution"}</li>
                                    <li>{isDE ? "• Integration in eigene Projekte" : "• Integration into own projects"}</li>
                                    <li>{isDE ? "• Unbegrenzte API-Anfragen" : "• Unlimited API requests"}</li>
                                </ul>
                            </div>
                            <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/20">
                                <span
                                    className="text-red-400 font-semibold">✗ {isDE ? "Nicht erlaubt" : "Not Allowed"}</span>
                                <ul className="mt-2 space-y-1 text-muted-foreground">
                                    <li>{isDE ? "• Nutzung ohne Attribution" : "• Use without attribution"}</li>
                                    <li>{isDE ? "• Entfernen oder Verstecken der Attribution" : "• Removing or hiding attribution"}</li>
                                    <li>{isDE ? "• Weiterverkauf der API-Daten" : "• Reselling API data"}</li>
                                </ul>
                            </div>
                        </div>

                        <p className="text-muted-foreground text-sm">
                            {isDE
                                ? "Bei Verstoß gegen diese Nutzungsbedingungen behalten wir uns vor, den Zugang zur API zu sperren. Bei Fragen kontaktiere uns auf Discord."
                                : "Violation of these terms may result in API access being revoked. For questions, contact us on Discord."}
                        </p>
                    </div>
                </div>

                {/* Webhook Events */}
                <div className="mt-16 p-6 rounded-2xl bg-blue-500/5 border border-blue-500/20">
                    <h2 className="text-2xl font-semibold mb-4 text-blue-400">
                        {isDE ? "Webhook Events" : "Webhook Events"}
                    </h2>
                    <p className="text-muted-foreground mb-6">
                        {isDE
                            ? "Wenn du Webhooks konfigurierst, werden folgende Events automatisch gesendet:"
                            : "When you configure webhooks, the following events are automatically sent:"}
                    </p>
                    <div className="space-y-4">
                        <div className="p-4 rounded-xl bg-background border border-border">
                            <div className="flex items-center gap-3 mb-3">
                                <span
                                    className="px-2 py-1 rounded-lg bg-emerald-500/20 text-emerald-400 text-xs font-mono border border-emerald-500/30">
                                    link.created
                                </span>
                                <span className="text-muted-foreground text-sm">
                                    {isDE ? "Wird gesendet, wenn ein neuer Link erstellt wird" : "Sent when a new link is created"}
                                </span>
                            </div>
                            <pre className="text-sm font-mono text-foreground/80 overflow-x-auto">
{`{
  "type": "link.created",
  "timestamp": "2026-01-09T12:00:00.000Z",
  "payload": {
    "id": "myserver",
    "originalUrl": "https://discord.gg/abc123",
    "shortUrl": "https://dcs.lol/myserver",
    "clicks": 0,
    "createdAt": "2026-01-09T12:00:00.000Z"
  }
}`}
                            </pre>
                        </div>
                        <div className="p-4 rounded-xl bg-background border border-border">
                            <div className="flex items-center gap-3 mb-3">
                                <span
                                    className="px-2 py-1 rounded-lg bg-violet-500/20 text-violet-400 text-xs font-mono border border-violet-500/30">
                                    link.clicked
                                </span>
                                <span className="text-muted-foreground text-sm">
                                    {isDE ? "Wird gesendet, wenn ein Link geklickt wird" : "Sent when a link is clicked"}
                                </span>
                            </div>
                            <pre className="text-sm font-mono text-foreground/80 overflow-x-auto">
{`{
  "type": "link.clicked",
  "timestamp": "2026-01-09T12:01:00.000Z",
  "payload": {
    "id": "myserver",
    "at": "2026-01-09T12:01:00.000Z"
  }
}`}
                            </pre>
                        </div>
                    </div>
                    <p className="text-muted-foreground text-sm mt-4">
                        {isDE
                            ? "Webhooks werden als POST-Anfragen mit Content-Type: application/json gesendet."
                            : "Webhooks are sent as POST requests with Content-Type: application/json."}
                    </p>
                </div>

                {/* Error Handling */}
                <div className="mt-16 p-6 rounded-2xl bg-red-500/5 border border-red-500/20">
                    <h2 className="text-2xl font-semibold mb-4 text-red-400">{isDE ? "Fehlerbehandlung" : "Error Handling"}</h2>
                    <p className="text-muted-foreground mb-4">
                        {isDE
                            ? "Alle API-Antworten folgen einem konsistenten Format. Bei Fehlern enthält die Antwort:"
                            : "All API responses follow a consistent format. On errors, the response contains:"}
                    </p>
                    <pre className="p-4 rounded-xl bg-background border border-border text-sm font-mono text-red-400">
{`{
  "success": false,
  "error": "Error message",
  "message": "Detailed explanation (optional)"
}`}
                    </pre>
                    <div className="mt-4 grid md:grid-cols-3 gap-4 text-sm">
                        <div className="p-3 rounded-xl bg-background border border-border">
                            <span className="text-amber-400 font-mono">400</span>
                            <span
                                className="text-muted-foreground ml-2">{isDE ? "Ungültige Anfrage" : "Bad Request"}</span>
                        </div>
                        <div className="p-3 rounded-xl bg-background border border-border">
                            <span className="text-amber-400 font-mono">404</span>
                            <span className="text-muted-foreground ml-2">{isDE ? "Nicht gefunden" : "Not Found"}</span>
                        </div>
                        <div className="p-3 rounded-xl bg-background border border-border">
                            <span className="text-amber-400 font-mono">409</span>
                            <span
                                className="text-muted-foreground ml-2">{isDE ? "Konflikt (ID existiert)" : "Conflict (ID exists)"}</span>
                        </div>
                        <div className="p-3 rounded-xl bg-background border border-border">
                            <span className="text-red-400 font-mono">403</span>
                            <span
                                className="text-muted-foreground ml-2">{isDE ? "Nicht autorisiert" : "Forbidden"}</span>
                        </div>
                        <div className="p-3 rounded-xl bg-background border border-border">
                            <span className="text-red-400 font-mono">500</span>
                            <span className="text-muted-foreground ml-2">{isDE ? "Serverfehler" : "Server Error"}</span>
                        </div>
                    </div>
                </div>

                {/* Footer */}
                <div className="mt-16 text-center text-muted-foreground text-sm">
                    <p>
                        {isDE ? "Fragen? Kontaktiere uns auf" : "Questions? Contact us on"}{" "}
                        <a href="https://dcs.lol/dcs" className="text-primary hover:underline">Discord</a>
                        {" "}{isDE ? "oder per E-Mail:" : "or via email:"}{" "}
                        <a href="mailto:hello@star-dev.xyz"
                           className="text-primary hover:underline">hello@star-dev.xyz</a>
                    </p>
                    <p className="mt-2">© 2026 DCS.lol • {isDE ? "Alle Rechte vorbehalten" : "All rights reserved"}</p>
                </div>
            </div>
        </div>
    );
}

