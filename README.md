# Vereins-App

Verwaltungs-App für Sportvereine (React + Vite). Die gesamte Anwendung liegt in `src/App.jsx`.

## Lokal starten

```bash
npm install
npm run dev
```

## Bauen

```bash
npm run build      # erzeugt dist/
npm run preview    # gebauten Stand lokal ansehen
```

## Deploy (Vercel)

Repo mit Vercel verbinden – Vercel erkennt Vite automatisch:
- Build Command: `npm run build`
- Output Directory: `dist`

Bei jedem Push auf den Hauptbranch deployt Vercel automatisch.

## Projektstruktur

```
.
├── index.html          Einstiegspunkt (lädt src/main.jsx)
├── package.json        Abhängigkeiten + Scripts
├── vite.config.js      Vite + React-Plugin
├── manifest.json       PWA-Manifest
├── sw.js               Service Worker (Offline-Cache)
├── .gitignore
└── src/
    ├── main.jsx        React-Mount
    └── App.jsx         Die komplette App
```

## Hinweis zu Icons

`manifest.json` und `index.html` verweisen auf `/icon-192.png` und `/icon-512.png`.
Diese beiden Dateien im Projekt-Stammverzeichnis ablegen, falls die PWA-Icons
genutzt werden sollen (optional – die App läuft auch ohne).

## Push-Benachrichtigungen (iOS, Android, Desktop)

Nutzer:innen sehen unten rechts ein 🔔-Symbol. Tippen → Sheet mit
„Aktivieren", danach Schalter pro Bereich (Abstimm-Erinnerung, Morgens
am Termin, Chat) sowie pro Termin-Art und pro Einzeltermin.

Voraussetzung auf dem iPhone (iOS 16.4+): die App muss einmalig zum
**Home-Bildschirm** hinzugefügt werden — Safari → „Teilen" → „Zum
Home-Bildschirm". Aus dem Safari-Tab heraus erlaubt Apple keinen Push.

### Einmalige Einrichtung (Server-Seite)

1. **Tabellen + Funktionen anlegen** — `supabase/notifications.sql` im
   Supabase SQL-Editor ausführen.
2. **VAPID-Schlüssel als Secrets setzen** — Supabase → Edge Functions →
   Secrets:
   - `VAPID_PUBLIC_KEY` = der öffentliche Schlüssel
   - `VAPID_PRIVATE_KEY` = der private Schlüssel
   - `VAPID_EMAIL` = `mailto:deine@email`
   - `APP_DATA_KEY` = `vereinsapp_v14` (Default)

   Den öffentlichen Schlüssel zusätzlich oben in
   `src/notifications.jsx` in der Konstante `VAPID_PUBLIC_KEY`
   eintragen. (Schlüsselpaar mit `node -e "..."` erzeugen — die App
   liefert bereits eines mit; bei Bedarf rotieren.)
3. **Edge-Function deployen** — `supabase functions deploy notify`
   (CLI) oder per Dashboard den Inhalt von
   `supabase/functions/notify/index.ts` einfügen.
4. **Täglichen Versand einrichten** — Extensions `pg_cron` und
   `pg_net` aktivieren, dann den auskommentierten Block am Ende von
   `supabase/notifications.sql` (Projekt-URL + Service-Role-Key
   eintragen) im SQL-Editor ausführen.
5. **Chat-Benachrichtigungen** (optional) — in Supabase
   Database → Webhooks einen Webhook auf die Tabelle `app_data` mit
   POST auf die Edge-Function-URL und Body
   `{"mode":"chat","message":{"cid":"…","tid":"…","from":"…","text":"…"}}`
   anlegen, oder die App schickt den Push beim Absenden direkt an die
   Function.

### Test

```bash
curl -X POST https://DEIN-PROJEKT.supabase.co/functions/v1/notify \
  -H "Authorization: Bearer DEIN-SERVICE-ROLE-KEY" \
  -H "Content-Type: application/json" \
  -d '{"mode":"test"}'
```

Alle aktiven Subscriptions bekommen daraufhin eine Test-Benachrichtigung.
