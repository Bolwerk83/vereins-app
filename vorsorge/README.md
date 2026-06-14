# Vorsorge – vorsorge.bolwerk24.de

Eigenständige, statische Landingpage für die **Vorsorge**-App aus der
bolwerk24-Sammlung. Kein Build-Schritt nötig – reines HTML/CSS/JS.

> „Heute regeln. Morgen entlastet." – Vollmachten, Patientenverfügung,
> wichtige Dokumente & Notfallkontakte sicher an einem Ort.

## Struktur

```
vorsorge/
├── index.html              Landingpage
├── impressum.html          Impressum (Platzhalter [...] ausfüllen)
├── datenschutz.html        Datenschutz (Platzhalter [...] ausfüllen)
├── manifest.webmanifest    PWA-Manifest
├── vercel.json             Vercel-Config (cleanUrls + Security-Header)
├── robots.txt              Suchmaschinen
├── sitemap.xml             Sitemap
├── favicon.svg             Schild-Logo (Sky/Teal)
└── assets/
    ├── css/styles.css      Design-System (geteilt mit bolwerk24)
    ├── css/vorsorge.css    Akzentfarbe + App-spezifische Stile
    ├── js/main.js          Theme, Navigation, Reveal, FAQ, Vormerken
    └── img/                PWA-Icons (192/512, Apple-Touch)
```

## Lokal ansehen

```bash
cd vorsorge
python3 -m http.server 5050
# -> http://localhost:5050
```

## Deploy nach vorsorge.bolwerk24.de (Vercel)

1. In Vercel ein **neues Projekt** anlegen und als **Root Directory** den
   Ordner `vorsorge/` wählen (Framework: „Other", kein Build-Command,
   Output = Projekt-Root).
   - Alternativ den Inhalt von `vorsorge/` als eigenes Repo
     (z. B. `Bolwerk83/Vorsorge`) pushen und dieses mit Vercel verbinden.
2. Unter **Settings → Domains** die Domain `vorsorge.bolwerk24.de`
   hinzufügen und den vorgeschlagenen CNAME-/DNS-Eintrag setzen.
3. Fertig – jeder Push deployt automatisch.

## Noch zu erledigen (vor dem echten Livegang)

- Platzhalter `[…]` in `impressum.html` und `datenschutz.html` ausfüllen.
- Eigene PWA-Icons für Vorsorge in `assets/img/` ablegen (aktuell die
  bolwerk24-Icons als Platzhalter).
- Optional eigenes Open-Graph-Bild (`assets/img/og.png`) ergänzen und in
  `index.html` als `og:image` verlinken.
- Vormerken-Formular bei Bedarf an einen Versanddienst (z. B. Brevo)
  anbinden – aktuell lokaler Fallback (`localStorage`).
