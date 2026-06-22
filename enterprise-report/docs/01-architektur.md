# 01 · Architektur

## Schichten

```
┌─────────────────────────────────────────────────────────────┐
│  MODULE (Sichten)   tree-navigator · management-report ·     │
│                     wizard · (später: forecast, export …)    │
├─────────────────────────────────────────────────────────────┤
│  DESIGN             tokens.css · theme.js   (EIN Aussehen)   │
├─────────────────────────────────────────────────────────────┤
│  KERN (Logik)       reportTree · kpiRegistry · ampel · rbac  │
├─────────────────────────────────────────────────────────────┤
│  DATA-PROVIDER      ladeKpiWerte · ladeHistorie · ladeDetail │
│                     (eine Naht: mock | mssql)                │
├─────────────────────────────────────────────────────────────┤
│  QUELLE   mock.js   ──ODER──   server/ ─► sql/*.kpi.sql ─► MSSQL │
└─────────────────────────────────────────────────────────────┘
```

**Regel:** Module kennen nur Kern + Design + dataProvider. Sie kennen
**nie** die Datenquelle. Deshalb ist der Umstieg Mock → MSSQL ein
Einzeiler (`VITE_DATA_SOURCE=mssql`).

## Datenfluss (eine Periode)

1. `dataProvider.ladeKpiWerte('2025')` holt **rohe** Werte (Mock oder
   `GET /api/kpi`).
2. `kpiRegistry.berechneAlle()` ergänzt **abgeleitete** KPIs.
3. Module rendern Kacheln; `ampel.js` bestimmt die Farbe; `rbac.js`
   blendet geschützte KPIs aus.

## Modul-Kontrakt (damit „zusammenführen" klappt)

Ein Modul ist ein Ordner unter `src/modules/<name>/` mit einer
Default-exportierten React-Komponente, die nur bekommt:
`{ rolle, werte, periode, … Callbacks }`. Es schreibt **nichts** direkt in
Daten und definiert **keine** eigenen Farben (nur Tokens). So bleiben
Module unabhängig und kollisionsfrei.

## Geplante weitere Module (andockbar)

- **forecast** — Plan/Ist/Forecast je KPI (nutzt dieselbe Registry).
- **export** — PDF/Excel des aktuellen Knotens.
- **kommentare** — Kommentar/Maßnahme je KPI (eigene MSSQL-Tabelle).
- **alerts** — Schwellen-Benachrichtigungen (rote Ampeln).
- **admin** — Pflege von Registry/Baum über UI statt Code.
