# bolwerk24.de — Website (App-Store / Hub)

Die professionelle Landing- & Hub-Seite für bolwerk24.de, die deine Apps
(VereinsApp, Vorsorge, Klartext, Kochbuch …) wie ein kleiner App-Store
präsentiert. **Kein Build-Schritt nötig** — reine HTML/CSS/JS, blitzschnell
und auf Handy, Tablet & PC optimiert.

## Aufbau

```
site/
├── index.html              Startseite (Hero, Apps, Werbung, FAQ, Newsletter …)
├── impressum.html          Impressum (Pflicht – Felder [..] ausfüllen!)
├── datenschutz.html        Datenschutzerklärung (Vorlage – anpassen!)
├── manifest.webmanifest    PWA-Manifest (Installierbar)
├── robots.txt / sitemap.xml  SEO
├── favicon.svg             Logo
└── assets/
    ├── css/styles.css      Komplettes Design-System (Light/Dark, responsiv)
    └── js/
        ├── apps.js         >>> HIER neue Apps eintragen <<<
        └── main.js         Interaktion (Filter, Theme, Cookies, Animationen)
```

## Neue App hinzufügen

Öffne `assets/js/apps.js` und füge ein Objekt zum `APPS`-Array hinzu:

```js
{
  id: "meine-app",
  name: "Meine App",
  icon: "🚀",
  category: "alltag",          // siehe CATEGORIES oben in der Datei
  tagline: "Kurzer Slogan",
  desc: "Was die App macht.",
  tags: ["Schlagwort1", "Schlagwort2"],
  color: "#10b981",            // Akzentfarbe der App
  status: "live",              // "live" => Öffnen-Button | "soon" => Vormerken
  url: "https://meine-app.bolwerk24.de",
  rating: 4.8, reviews: 42,    // optional (Social Proof)
}
```

Fertig — Karte, Filter & Hero-Mockup aktualisieren sich automatisch.

## Werbung / Affiliate aktivieren

1. Im Cookie-Banner wird die Einwilligung abgefragt. Erst danach ruft
   `loadAds()` in `main.js` deinen Werbecode auf.
2. Ersetze die `.ad-slot`-Platzhalter in `index.html` durch deinen echten
   Awin-/Google-AdSense-Code und trage in `loadAds()` (in `main.js`) die
   Initialisierung ein, z. B.:
   ```js
   (adsbygoogle = window.adsbygoogle || []).push({});
   ```
3. Affiliate-Links: einfach als normale `<a href="…" rel="sponsored noopener">`
   einbauen. In Impressum & Datenschutz ist der Hinweis bereits enthalten.

## Vor dem Livegang unbedingt erledigen

- [ ] In `impressum.html` die Felder `[DEIN NAME]`, `[STRASSE]`, `[PLZ ORT]` ausfüllen.
- [ ] In `datenschutz.html` Hoster + tatsächlich genutzte Werbe-/Newsletter-Dienste eintragen.
- [ ] Echte Live-URLs der Apps in `apps.js` setzen.
- [ ] Newsletter an einen echten Dienst anbinden (aktuell nur lokale Demo-Speicherung).
- [ ] Social-Media-Links im Footer (`index.html`) ergänzen.

## Lokal ansehen

```bash
cd site
python3 -m http.server 8080
# -> http://localhost:8080
```

## Deploy (Vercel) als eigene Domain bolwerk24.de

Da das Repo zusätzlich die Vereins-App enthält, dieses Verzeichnis als
**eigenes** Projekt deployen:

- Neues Vercel-Projekt aus demselben Repo
- **Root Directory:** `site`
- **Framework Preset:** „Other" (kein Build)
- Domain `bolwerk24.de` zuweisen

Alternativ funktioniert das Verzeichnis auf jedem Static-Host
(Netlify, GitHub Pages, Cloudflare Pages …) ohne Anpassung.
