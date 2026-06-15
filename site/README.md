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

**Akzentfarben** (`color`) bringen Leben in die neutrale Basis. Bewährte Werte:

| Farbe | Hex | passend für |
|-------|-----|-------------|
| Grün | `#16a34a` | Vereine, Sport, Erfolg |
| Blau | `#0ea5e9` | Finanzen, Vorsorge, Vertrauen |
| Indigo | `#6366f1` | Kommunikation, Tech |
| Violett | `#8b5cf6` | Kreatives, Premium |
| Orange | `#f97316` | Essen, Familie, Energie |
| Rot | `#ef4444` | Gesundheit, Wichtiges |
| Türkis | `#14b8a6` | Reise, Natur |
| Pink | `#ec4899` | Lifestyle, Community |

## Newsletter an Brevo anbinden (sicher, ohne API-Key)

In `assets/js/apps.js` ganz unten im `CONFIG`-Block:

1. In [Brevo](https://www.brevo.com) eine Kontaktliste anlegen.
2. **Kontakte → Formulare** → ein **DOI-Anmeldeformular** erstellen.
3. Im Einbettungs-Code die `action`-URL kopieren
   (`https://xxxxx.sibforms.com/serve/MUIFA…`).
4. Diese URL bei `newsletter.brevoFormUrl` eintragen.

```js
newsletter: {
  brevoFormUrl: "https://abc123.sibforms.com/serve/MUIFAxyz...",
  emailField: "EMAIL",   // Standard bei Brevo
  sourceField: "APP",    // optional: welche App vorgemerkt wurde
}
```

Der API-Key bleibt geheim – das Form-Endpoint ist von Brevo öffentlich &
sicher ausgelegt. Solange das Feld leer ist, werden Adressen nur lokal im
Browser gespeichert (Demo-Modus).

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
- [ ] Newsletter: `brevoFormUrl` in `apps.js` setzen (siehe Abschnitt oben).
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

## Zentrales Backend, Rollen & Affiliate-Schalter

Hub **und** Controlling-Tool nutzen dasselbe Supabase-Backend
(`supabase/site.sql`). Es stellt bereit:

- **`site_config`** – zentrale Konfiguration (u. a. `affiliate`, `apps`, `features`).
  Lesen ist öffentlich (Frontend), Schreiben nur für Superadmins (RLS).
- **`site_roles`** – zentrale Rollen pro E-Mail: `superadmin` oder `power`.
- **RPCs** `is_site_admin()`, `is_site_power()`, `my_site_role()`.

### Einrichtung (einmalig)

1. **Schema einspielen:** `supabase/site.sql` im Supabase SQL-Editor ausführen
   (idempotent, additiv – ändert keine bestehenden Tabellen).
2. **anon-Key:** ist in `assets/js/supabase-config.js` bereits eingetragen
   (öffentlich & durch RLS geschützt).
3. **Login-Accounts anlegen:** in Supabase → **Authentication → Add user**
   je eine E-Mail + Passwort anlegen. Die Rolle steuert `site_roles`:
   - Superadmin ist bereits geseedet (`bolwerk@outlook.de`).
   - Weitere Rollen per SQL:
     ```sql
     insert into public.site_roles(email, role) values
       ('power-user@beispiel.de', 'power')
     on conflict (email) do update set role = excluded.role;
     ```

### Oberflächen

| Seite           | Wer            | Was                                                        |
|-----------------|----------------|------------------------------------------------------------|
| `/` (Startseite)| alle Besucher  | sieht Affiliate-Empfehlungen **nur, wenn aktiviert**       |
| `/power.html`   | Power User     | **nur Lesen**: Affiliate-Status & Partnerliste (Auswertung)|
| `/admin.html`   | Superadmin     | Affiliate **an/aus** schalten + Partner pflegen, Katalog … |

Der **Affiliate-Schalter** liegt im SuperAdmin unter „🤝 Affiliate" oben
(„Affiliate-Empfehlungen anzeigen"). Steht er aus, blendet die Startseite
sämtliche Partner aus – unabhängig davon, wie viele aktiv sind. Power User
sehen den Status, können ihn aber nicht ändern (serverseitig per RLS erzwungen).
