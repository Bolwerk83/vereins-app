# CLAUDE.md — Projektüberblick

> Sprache: **Antworten und Commits auf Deutsch.**

Monorepo mit mehreren eigenständig deploybaren Teilen plus einem gemeinsamen
Supabase-Backend.

## Bestandteile

| Pfad           | Was                          | Deploy (Vercel)                         |
|----------------|------------------------------|-----------------------------------------|
| `src/App.jsx`  | Vereins-App (React + Vite)   | Repo-Root, Vite-Build → `dist/`         |
| `site/`        | bolwerk24-Hub (App-Store)    | eigenes Projekt, Root `site/` (kein Build) |
| `controlling/` | Kennzahlen-Steuerung (Controlling-Cockpit) | eigenes Projekt, Root `controlling/` (kein Build) |
| `supabase/`    | SQL-Schemas & Edge Functions | im Supabase-Dashboard ausführen         |

Jeder statische Teil hat eine eigene `vercel.json`. Neues Vercel-Projekt aus
demselben Repo, **Root Directory** auf den Ordner setzen, Framework „Other".

## Zentrales Supabase-Backend (`supabase/site.sql`)

Genutzt von **Hub und Controlling** (Projekt `phpkyzujpvrsypqqptlv`).

- **`site_config`** — Konfig (`affiliate` = `{enabled, partners}`, `apps`, `features`).
  Lesen öffentlich, Schreiben nur Superadmin (RLS).
- **`site_roles`** — zentrale Rollen pro E-Mail: `superadmin` | `power`.
- **`site_events`** (anon. Tracking, nur INSERT), **`site_leads`** (Newsletter),
  **`site_reviews`** (Bewertungen).
- **RPCs**: `is_site_admin()`, `is_site_power()`, `my_site_role()`,
  `site_stats(days)` (Superadmin + Power), `site_review_summary()` (öffentlich).

### Rollen / Berechtigungen
- **Superadmin**: alles — u. a. Affiliate an/aus (`/admin.html`), Partner pflegen,
  Newsletter-Leads, Bewertungen moderieren.
- **Power User**: nur Lesen/Auswertung — Affiliate-Status + Statistik (`/power.html`).
- **Affiliate aktivieren/deaktivieren kann ausschließlich der Superadmin**
  (serverseitig per RLS erzwungen, nicht nur im UI).

### Einrichtung
1. `supabase/site.sql` im SQL-Editor ausführen (idempotent, additiv).
2. anon-Key liegt in `site/assets/js/supabase-config.js` (öffentlich, durch RLS geschützt).
3. Login-Accounts in **Supabase → Authentication → Add user** anlegen; Rolle über
   `site_roles` setzen (Superadmin `bolwerk@outlook.de` ist geseedet).

## Hinweise
- **KI-Assistent „James"** (im Controlling-Tool) ruft `api.anthropic.com` direkt
  aus dem Browser; produktiv über ein Backend mit API-Key proxen, keinen Key
  in den Client einbetten.
- Öffentliche Inserts (Tracking/Newsletter/Bewertungen) haben kein Rate-Limit —
  bei Bedarf serverseitig (Edge Function / Captcha) härten. Moderation der
  Bewertungen über den SuperAdmin.
