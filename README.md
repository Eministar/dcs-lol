# 🎯 dcs.lol — Der schönste Discord-Linkverkürzer im Internet

<p align="center">
  <img src="https://dcs.lol/assets/logo.png" alt="dcs.lol Logo" width="150" />
</p>

<div align="center">
  <b>Discord-Einladungslinks verkürzen, aber stylisch.</b><br />
  <code>https://discord.gg/irgendwas</code> wird zu <code>https://dcs.lol/deinlink</code>
</div>

---

## ✨ Features

- 🔗 **Eigene Kurzlinks** wie `dcs.lol/meinserver`
- 🎨 **Atemberaubendes Frontend** mit Tailwind & React
- ⚡ **Blitzschnell & kostenlos**
- 🔐 SSL via Let's Encrypt
- 📊 Analytics-ready (in Arbeit)
- 🧠 Keine Registrierung nötig

---

## 🖼️ Screenshot

<img src="https://dcs.lol/assets/screenshot.png" alt="Screenshot von dcs.lol" width="100%" />

---

## 🛠️ Tech Stack

| Bereich    | Technologie                     |
|------------|---------------------------------|
| Frontend   | React, TypeScript, Tailwind CSS |
| Backend    | Express.js (Node.js)            |
| Hosting    | Apache2 + PM2                   |
| SSL        | Let's Encrypt via Certbot       |
| Deployment | Linux Ubuntu 22.04              |

---

## 🚀 Deployment (local)

```
# 1) Dependencies installieren (Root)
npm install

# 2) MySQL vorbereiten
# - Datenbank anlegen, z. B. "dcs"
# - Benutzer anlegen und Berechtigungen geben
# - Beispiel (MySQL Shell):
#   CREATE DATABASE dcs CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
#   CREATE USER 'dcs_user'@'%' IDENTIFIED BY 'change_me';
#   GRANT ALL PRIVILEGES ON dcs.* TO 'dcs_user'@'%';
#   FLUSH PRIVILEGES;

# 3) .env anlegen (im Projekt-Root)
cp .env.example .env
# und Werte anpassen (Host, User, Passwort, DB-Name, optional PORT)

# 4) Backend starten (Express bedient auch das Frontend aus /dist)
npm run start

# 5) Development Frontend (optional, wenn du Vite Dev nutzen willst)
# Das Backend läuft weiter auf PORT aus .env (Standard 49623)
npm run dev
```

> 💡 Standard-Port für das Backend ist 49623. In Deployments (z. B. nixpacks) kann `PORT` vorgegeben sein (Standard dort:
> 3000).
---

## 🧾 Beispiel-Link

```
Original: https://discord.gg/kcGCDRB2x6
Kurz:     https://dcs.lol/dcs
```

---

# 🧑‍💻 Maintainer

**EministarVR**

- 👨‍💻 Developer bei [YukiCraft](https://discord.yukicraft.net)
- 💻 GitHub: ``@Eministar``

---

## 📄 Lizenz

MIT License — freie Nutzung erlaubt, Credits wären sexy.
Logo, Style & Marke dcs.lol © EministarVR 2025.
---

# 🌐 Live-Version

👉 https://dcs.lol


---


---

## 🔐 Discord Login einrichten (Discord Developer Portal)

So bindest du den Discord Login ein:

1) App im Discord Developer Portal anlegen

- Gehe zu https://discord.com/developers/applications und klicke auf "New Application".
- Vergib einen Namen (z. B. dcs.lol) und erstelle die App.

2) OAuth2-Einstellungen konfigurieren

- Öffne in deiner App den Reiter "OAuth2" → "General".
- Setze bei "Redirects" die Callback-URL:
    - Produktion/Server: https://DEINE-DOMAIN/api/auth/discord/callback
    - Lokal (falls über Browser erreichbar): http://localhost:3000/api/auth/discord/callback
- Klicke auf "Save Changes".

Hinweis: Alternativ kannst du in der .env die Variable DISCORD_REDIRECT_URI setzen. Dann muss die dort konfigurierte URL
1:1 auch im Developer Portal unter Redirects hinterlegt sein.

3) Client-ID und Secret kopieren

- Reiter "General Information": kopiere die "CLIENT ID".
- Reiter "OAuth2" → "Client Secrets": generiere/kopiere ein "CLIENT SECRET".

4) .env konfigurieren

- Erstelle die Datei .env (auf Basis von .env.example) im Projekt-Root und trage ein:

```
# Server
PORT=49623

# MySQL
MYSQL_HOST=127.0.0.1
MYSQL_PORT=3306
MYSQL_USER=dcs_user
MYSQL_PASSWORD=change_me
MYSQL_DATABASE=dcs

# Auth & Discord OAuth
SESSION_SECRET=ein_langes_geheimes_passwort
DISCORD_CLIENT_ID=DEINE_CLIENT_ID
DISCORD_CLIENT_SECRET=DEIN_CLIENT_SECRET
# Optional, sonst wird automatisch http(s)://HOST/api/auth/discord/callback verwendet
DISCORD_REDIRECT_URI=https://DEINE-DOMAIN/api/auth/discord/callback
```

5) Server starten

- Dependencies installieren: npm install
- Backend starten: npm run start
- Optional: Vite-Dev-Server fürs Frontend: npm run dev (Backend läuft parallel auf PORT)

6) Login testen

- Rufe /login oder /register im Browser auf und klicke "Mit Discord anmelden".
- Nach erfolgreicher Anmeldung wirst du auf /edit weitergeleitet.

7) Links zuweisen und verwalten

- Wenn du eingeloggt bist, werden neu erstellte Kurzlinks automatisch deinem Account zugeordnet.
- Unter /edit kannst du deine eigenen Links bearbeiten (Ziel-URL ändern, Custom-ID umbenennen) oder löschen.
- Wichtig: Links, die vor der Registrierung erstellt wurden, können nicht nachträglich deinem Konto zugeordnet oder
  editiert werden.

Troubleshooting

- Invalid redirect URI: Stelle sicher, dass die Redirect-URL exakt in den Discord OAuth2 Redirects hinterlegt ist (inkl.
  Schema http/https, Port, Pfad /api/auth/discord/callback).
    - Lokal (dieses Repo mit npm run start): http://localhost:3000/api/auth/discord/callback
    - Vite-Dev-Server (Frontend auf 5173, Backend auf 3000): Trotzdem die Backend-URL
      eintragen: http://localhost:3000/api/auth/discord/callback
    - Produktion: https://DEINE-DOMAIN/api/auth/discord/callback
    - Prüfen, was dein Server wirklich verwendet: GET http://localhost:3000/api/auth/discord/redirect-uri liefert den
      exakten Wert.
- Cookies/Sessions: In Produktion ist das Cookie "Secure"; stelle sicher, dass du HTTPS verwendest. Bei Proxies
  X-Forwarded-Proto korrekt setzen.
- CORS: Das Backend erlaubt Credentials (Cookies). Wenn du ein separates Frontend-Hosting verwendest, konfiguriere die
  CORS-Origin entsprechend.
- Zeitabweichungen: Achte auf korrekte Serverzeit; große Abweichungen können beim OAuth-Flow Probleme verursachen.
