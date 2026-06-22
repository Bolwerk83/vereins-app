# Stages & Transportwesen (dev / test / prod)

Drei getrennte Deployments — **dev → test → prod** — mit Git-basiertem
Transport ausgewählter Berichte/Konfiguration.

## Stages

| Stage | Zweck | Branch (Default) | Env |
|---|---|---|---|
| dev  | Entwicklung | `stage/dev`  | `STAGE=dev`,  `VITE_STAGE=dev` |
| test | Test / QA    | `stage/test` | `STAGE=test`, `VITE_STAGE=test` |
| prod | Produktion   | `stage/prod` | `STAGE=prod`, `VITE_STAGE=prod` |

Jede Instanz läuft als eigenes Deployment mit eigener `STAGE`/`VITE_STAGE`.
Die Topbar zeigt die Instanz als Farb-Badge (DEV/TEST/PROD).

## Was transportiert wird

Auf der Seite **🚚 Transport** werden Artefakte ausgewählt:

- **Berichte / Katalog** — selbst gebaute Management-Reports (`er_designer_reports`)
- **KPI-Definitionen** — Snapshot aus der Registry → Ziel-Overrides (`er_kpi_overrides`)
- **Spalten-Layouts** — aus dem Spalten-Designer (`er_tabellenlayout`)
- **Verteiler** — Versand-Definitionen (`er_verteiler`)

## Freigabe-Wege

- **dev → test**: direkter Push in `stage/test`.
- **test → prod**: Push eines Transport-Branches `transport/TR-…` und ein
  **Pull Request** gegen `stage/prod` (Vier-Augen-Freigabe). Die UI liefert
  den fertigen Compare-/PR-Link.

## Wie der Push funktioniert (ohne Working-Tree-Wechsel)

`server/transport.js` nutzt Git-Plumbing: Das Bundle wird als
`transports/TR-….json` gehasht (`hash-object`), per temporärem Index auf die
**Spitze des Ziel-Branches** gesetzt (`read-tree` + `update-index` +
`write-tree`) und als Commit erzeugt (`commit-tree`). Gepusht wird die
Commit-Ref direkt auf den Ziel- bzw. Transport-Branch. So landet **genau die
Bundle-Datei** auf dem Ziel — der laufende Checkout der Instanz bleibt
unberührt, und es vermischt sich keine Fremd-Historie.

## Empfangen / Anwenden

Die Zielinstanz wendet ein Bundle an:

- **Automatisch**: liest die committeten `transports/*.json` (CI/Deploy-Schritt)
  und ruft `bundleAnwenden()`.
- **Manuell**: Reiter **Empfangen** → Bundle-Datei (`TR-….json`) importieren.
  Gleiche IDs werden ersetzt; danach Seite neu laden.

## Robustheit

Ist kein Git/Remote erreichbar (oder fehlen Rechte), bleibt das Bundle als
Datei gespeichert (Status `gespeichert`) und kann heruntergeladen und auf der
Zielinstanz importiert werden — der Transport funktioniert also auch ohne
Server-Git.
