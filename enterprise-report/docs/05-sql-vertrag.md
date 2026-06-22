# 05 · SQL-Vertrag (dein Hauptjob)

Die ausführliche Spezifikation steht in [`../sql/README.md`](../sql/README.md).
Kurzfassung:

- Eine **gemessene** KPI ⇒ genau eine Datei `sql/<sqlRef>.kpi.sql`.
- Rückgabe **muss** die Spalten `periode`, `wert` haben (optional `dimension`).
- **Einheit** wie in der Registry: `eur_mio` in Millionen, `percent` als
  Prozentzahl (38.1, nicht 0.381).
- Parameter `@periode` (NULL = alle Perioden ⇒ Historisierung).
- **Abgeleitete** KPIs (dbQuote, wareneinsatzquote, db1, cashConversion)
  brauchen **keine** SQL — sie rechnet die Engine.
- Detailberichte (Ebene 4): `sql/detail_<key>.sql`, freie Spalten.

Vorlagen liegen bereit: `sql/_template.kpi.sql`, `sql/nettoumsatz.kpi.sql`,
`sql/lagerbestand.kpi.sql`.

> So ist dein wiederkehrender Aufwand klar abgegrenzt: **SQL schreiben, das
> diesen Vertrag erfüllt** — den Rest erledigt die Engine.
