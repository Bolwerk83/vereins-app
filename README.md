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
