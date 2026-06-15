# Kennzahlen-Steuerung (Business Controlling)

Eigenständige, statische Single-Page-App (reines HTML/CSS/JS, **kein Build**)
als Controlling-Cockpit: Kennzahlen-Katalog, Bereiche/OnePager, Qualitäts-Board,
Prozesskette, Cube-/Dimensions-Designer, Datenquellen, Rollen/Rechte und der
KI-Berichtsassistent „James".

## Aufbau

```
controlling/
├── index.html      Die komplette App (Markup, Styles, Logik)
├── vercel.json     Security-Header + cleanUrls, kein Build, noindex
├── robots.txt      Internes Tool – Suchmaschinen ausgeschlossen
└── README.md
```

## Lokal ansehen

```bash
cd controlling
python3 -m http.server 8080
# -> http://localhost:8080
```

## Deploy (Vercel) als eigene Subdomain

Da das Repo zusätzlich die Vereins-App und den Hub enthält, dieses Verzeichnis
als **eigenes** Projekt deployen (analog `site/`):

1. Neues Vercel-Projekt aus demselben Repo (`Bolwerk83/vereins-app`)
2. **Root Directory:** `controlling`
3. **Framework Preset:** „Other" (kein Build, kein Output-Verzeichnis)
4. Subdomain zuweisen, z. B. `controlling.bolwerk24.de`

Funktioniert ebenso auf jedem Static-Host (Netlify, GitHub Pages,
Cloudflare Pages …) ohne Anpassung.

## Zugriffsschutz (empfohlen)

Das `noindex` (via `robots.txt` + `X-Robots-Tag`) hält nur Suchmaschinen fern —
es ist **kein** Zugriffsschutz. Für ein internes Tool zusätzlich in Vercel unter
**Settings → Deployment Protection** entweder **Vercel Authentication** (nur
Team-Mitglieder) oder **Password Protection** aktivieren.

## Hinweis zum KI-Assistenten „James"

`index.html` ruft für die KI-Berichte `https://api.anthropic.com/v1/messages`
(Modell `claude-sonnet-4-6`) direkt aus dem Browser auf. Ohne erreichbares
Endpoint läuft die App im **Offline-Modus** (lokale Erkennung, Demo-Werte).
Für den produktiven Einsatz die KI-Aufrufe über ein Backend mit hinterlegtem
API-Key leiten – keinen Schlüssel im Client einbetten.
