# Enterprise Report — Management-Cockpit (Fundament)

Metadaten-getriebenes Reporting für ein Unternehmen mit **Produktion und
Direktverkauf**. Ein **Berichtsbaum über 5 Ebenen**, ein einheitliches
Design, ein **Rollen-/Rechte-Konzept**, dokumentierte **KPI-Logik mit
Abhängigkeiten** und ein **Erststart-Wizard** — modular aufgebaut, damit
weitere Module später andocken können. Datenquelle ist **Microsoft SQL
Server**; heute läuft alles gegen Mock-Daten, der Umstieg ist ein Einzeiler.

> **Die Idee in einem Satz:** Du pflegst nur **SQL je Kennzahl** (festes
> Layout, siehe `sql/`) — Baum, Ampeln, Trends, Rechte, Druckbericht und
> Historie ergeben sich automatisch aus den Metadaten.

## Schnellstart (Demo mit Mock-Daten)

```bash
cd enterprise-report
npm install
npm run dev      # http://localhost:5180
```

Beim ersten Start erscheint der **Wizard**. Danach: Berichtsbaum links,
oben **Rolle** und **Periode** umschalten, im Konzernknoten den
**Management Report** öffnen.

## SQL Server verbinden

```bash
cd enterprise-report/server
npm install
cp .env.example .env      # dann ausfüllen: MSSQL_SERVER, MSSQL_DATABASE, MSSQL_USER/PASSWORD, MSSQL_AUTH
npm run test:db           # Verbindung prüfen (SELECT 1 + Servername/Version)
npm start                 # Backend auf :3001, Health: /api/health
```

Dann das Frontend gegen echte Quellen starten (zweites Terminal):

```bash
cd enterprise-report
VITE_DATA_SOURCE=mssql VITE_BI_SOURCE=claude npm run dev
```

Der Vite-Dev-Proxy leitet `/api` an das Backend; oben links zeigt die App
**● verbunden / keine Verbindung**. KPIs ohne hinterlegte `sql/<kpi>.kpi.sql`
werden übersprungen (Header `X-KPI-Fehlend`) — du füllst die SQL-Dateien
schrittweise. **Hinweis:** Windows-Integrated-Auth funktioniert von einem
Linux-Backend nicht — nutze SQL-Login (`MSSQL_AUTH=sql`) oder Azure AD.

## Die 5 Ebenen

| Ebene | Name | Beispiel | Im Code |
|------:|------|----------|---------|
| 1 | **GF** (Konzern) | VeloWerk Gruppe gesamt | Wurzelknoten + `management-report` |
| 2 | **Fachbereich** | Verkauf, Einkauf, Logistik … | Kinder im `reportTree` |
| 3 | **Themenbereich** | Logistik › Bestände | Enkel im `reportTree` |
| 4 | **Details** | Bestände je Warenbereich | `detail:`-Knoten + `sql/detail_*.sql` |
| 5 | **Historisierung** | Zeitreihe je KPI | `ladeHistorie()` + Sparkline |

## Module (einzeln zusammenführbar)

- `src/modules/tree-navigator` — Berichtsbaum + Knotenansicht
- `src/modules/management-report` — Executive-Bericht (druckbar, A4)
- `src/modules/wizard` — Erststart-Assistent → Konfiguration + SQL-Liste
- `src/modules/self-service-bi` — Anforderung in natürlicher Sprache →
  Controller-geführter **Beirat aus Berater-Bots** → Bericht mit Maßnahmen
  (offline-Heuristik **oder** Claude `claude-opus-4-8`)

Jedes Modul nutzt denselben **Kern** (`src/core`) und dieselben
**Design-Tokens** (`src/design`) → garantiert einheitliches Aussehen.

## Architektur in einem Bild

```
 Wizard ─► config.json ─┐
                         ▼
  reportTree (Struktur) ─┬─► Module (UI) ─► Design-Tokens
  kpiRegistry (Logik)  ──┤
  rbac (Rechte)        ──┤
                         ▼
                   dataProvider  ──(mock | mssql)──►  server/ ─► sql/*.kpi.sql ─► MSSQL
```

## Wo trage ich was ein?

| Aufgabe | Datei |
|---------|-------|
| Neue Kennzahl + Ziel + Ampel + Abhängigkeit | `src/core/kpiRegistry.js` |
| Baum/Struktur ändern | `src/core/reportTree.js` |
| Rollen & Object-Level-Security | `src/core/rbac.js` |
| **SQL je Kennzahl (dein Hauptjob)** | `sql/<kpi>.kpi.sql` |
| MSSQL-Verbindung | `server/.env` |
| Beirat / KI-Berater | `src/core/agentBoard.js`, `server/biAgents.js` |

Mehr in `docs/` — Konzept, Architektur, 5 Ebenen, KPI-Logik, Rollen,
SQL-Vertrag, Wizard und **Roadmap (wie wir vorgehen)**.
