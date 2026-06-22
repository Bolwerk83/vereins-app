# Klassifikation: operativ/strategisch & monetär/nicht-monetär

Zwei Controlling-Dimensionen über alle Kennzahlen — besonders fürs
**Profitcenter** nützlich, um Werttreiber vom strategischen/nicht-monetären
Rahmen zu trennen.

## Dimensionen

- **Horizont**: `operativ` (kurzfristige Steuerung) vs `strategisch`
  (mittel-/langfristige Ausrichtung).
- **Art**: `monetär` (in €) vs `nicht-monetär` (Mengen, Quoten, Zeiten, Indizes).

## Herleitung (`core/klassifikation.js`)

- **monetär** wird aus der **Einheit** abgeleitet (`eur`, `eur_mio` → monetär),
  kann aber je KPI überschrieben werden (`monetaer`).
- **horizont** hat eine Default-Zuordnung (strategische KPIs wie ESG, F&E,
  Kapitalstruktur, Forecast, ROCE …); alles andere ist operativ. Je KPI
  überschreibbar (`horizont`).

## Pflege & Transport

Beide Felder sind Teil der **Override-Schicht** (`OVERRIDE_FELDER`): im
Kennzahlen-Glossar per KPI-Editor (Admin) änderbar, in `er_kpi_overrides`
gespeichert und über das **Transportwesen** nach test/prod überführbar.

## Im Tool

- **Glossar** (📖): Filter-Chips „Horizont" und „Art", Badges je Kennzahl,
  Editor-Felder.
- **Steckbrief** (ⓘ): Zeile „Klassifikation".
