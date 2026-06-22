# Tests & CI

Automatisierte Absicherung der Kernlogik — bewusst **ohne zusätzliche
Abhängigkeit**, über den eingebauten Node-Test-Runner (`node --test`).

## Lokal ausführen

```
cd enterprise-report
npm test          # node --test tests/*.test.mjs
```

## Abdeckung

| Datei | prüft |
|---|---|
| `tests/ampel.test.mjs` | Ampel-Schwellen (hoch_gut/tief_gut), Trendrichtung |
| `tests/kpi.test.mjs` | `berechneAlle`: Ableitungen (z. B. db1), vollständige Auflösung |
| `tests/tabellensicht.test.mjs` | Filter, Suche, Sortierung (dt. Zahlen), Top-N |
| `tests/abstimmung.test.mjs` | Abstimmbrücken: Differenz, Auto-Status, Persistenz |
| `tests/transport.test.mjs` | Transport-Bundle: Erstellen + Anwenden (Round-Trip) |
| `tests/seed.test.mjs` | 20 Seed-Berichte mit KPI-/Tabellen-/Maßnahmen-Blöcken |

`tests/_setup.mjs` stellt ein minimales `localStorage` bereit (kein Browser
nötig) und wird als erster Import jeder Testdatei geladen. Jede Testdatei läuft
in einem eigenen Prozess — die Stores sind dadurch isoliert.

## CI (GitHub Actions)

`.github/workflows/ci.yml` läuft bei **jedem Push und Pull Request**:

1. `npm ci` (Node 22, npm-Cache)
2. `npm test` — alle Core-Tests
3. `npm run build` — Vite-Build muss durchlaufen

So bricht ein Fehler in KPI-Engine, Abstimmung, Transport, Seeder oder
Tabellen-Sicht den Build, bevor er in einen Stage-Branch transportiert wird.

## Neue Tests hinzufügen

Datei `tests/<thema>.test.mjs` anlegen, als ersten Import `./_setup.mjs`,
dann `node:test` + `node:assert/strict`. Wird automatisch von `npm test`
erfasst.
