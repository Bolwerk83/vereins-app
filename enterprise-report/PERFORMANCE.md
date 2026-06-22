# Performance & Skalierung — Millionen Datensätze über Jahre, ohne zu aggregieren

Leitsatz: **Granularität bleibt erhalten, nur die zu einem Zeitpunkt geladene/gerenderte
Menge wird begrenzt.** Rohdaten werden NICHT wegaggregiert — Drill bis zum Einzelbeleg
bleibt jederzeit möglich. Aggregierte Anzeigen und granularer Drill werden entkoppelt.

Status: Architektur-Leitlinie. Greift, sobald die Detaillisten an echte Quellen
(MSSQL/WaWi) angebunden werden statt an die Mock-Daten.

---

## 1. Das Grundprinzip: Anzeige ≠ Datenmenge

| Sicht | lädt | Granularität |
|---|---|---|
| KPI/Aggregat | vorberechnete/aggregierte Werte (klein) | grob (Summe/Schnitt) |
| Liste (gefiltert) | nur die sichtbare **Seite** (z. B. 100 Zeilen) | fein, aber begrenzt |
| Drill Einzelbeleg | genau **ein** Datensatz on-demand | feinst |

Niemand lädt je „alle 5 Mio Zeilen" in den Browser. Die App fragt immer nur das ab,
was gerade sichtbar/gebraucht ist.

## 2. Server-seitig filtern & paginieren

- Filter (Zeitraum, Bereich, Dimensionen, Suche) wandern als `WHERE` in die Quelle,
  nicht ins JavaScript. Der Browser bekommt nur die Treffer-Seite.
- **Cursor-/Keyset-Pagination** statt `OFFSET` (OFFSET wird bei großen Tabellen langsam):
  `WHERE (datum, id) > (:lastDatum, :lastId) ORDER BY datum, id LIMIT :n`.
- Server liefert `{ rows, nextCursor, gesamt? }`. `gesamt` nur bei Bedarf (count ist teuer
  — entweder geschätzt, gecacht, oder „> 10.000").

Konkret in dieser App: `core/detailberichte.js` → `generischListe()` würde aus einer reinen
In-Memory-Filterung zu einem **Provider-Call** mit `{ suche, filter, cursor, limit }`. Die
UI (`Liste`) ändert sich kaum — sie konsumiert `rows` + `nextCursor` statt der vollen Liste.

## 3. Tabellen-Virtualisierung (Rendering)

- Auch von 100.000 geladenen Zeilen rendert der Browser nur die ~50 im Viewport
  (Windowing), Rest wird über Platzhalter-Höhe simuliert.
- In `Liste` umsetzbar mit einem Scroll-Container + berechnetem `startIndex/endIndex`
  (oder `react-window`/`@tanstack/virtual`). Sticky Header, `colgroup` und ziehbare
  Spaltenbreiten bleiben erhalten.
- Kombiniert mit #2: virtualisierte Anzeige der gerade geladenen Seite, „mehr laden"
  am Scroll-Ende (Infinite Scroll über den Cursor).

## 4. In der Datenquelle: schnell trotz Masse

- **Zeit-Partitionierung** (z. B. je Monat/Jahr) → Abfragen treffen nur relevante Partitionen.
- **Indizes** auf die Filter-/Sortierspalten (datum, kunde, sku, bereich …); zusammengesetzte
  Indizes passend zum Keyset-Cursor.
- **Spaltenspeicher / Columnstore** (z. B. SQL Server Clustered Columnstore) für die großen
  Faktentabellen → Scans/Aggregationen um Größenordnungen schneller.
- **Pre-Aggregate / materialisierte Sichten** für die KPI-Schicht (Tages-/Monatssummen),
  **neben** den Rohdaten — nicht statt ihnen. Die KPIs kommen aus den Pre-Aggregaten,
  der Drill geht in die Rohtabelle.

## 5. KPI-Schicht cachen

- Kennzahlen (`berechneAlle`) aus **vorberechneten** Perioden-Werten, im Backend gecacht
  (Invalidierung bei neuem Import). Der Browser rechnet nicht über Rohdaten.
- Frontend-Cache pro (Periode, Datenart, Rolle) wie heute (`dataProvider` Cache-Kontext),
  nur gespeist aus der Aggregat-API.

## 6. Lazy-Drill (erst auf Klick)

- Unterzeilen/Positionen/Historie werden **erst beim Aufklappen** nachgeladen
  (so wie heute die Rechnungspositionen, künftig serverseitig je `koppelKey`).
- Befund-/E5-Historie je Zeile: ein gezielter Call pro geöffnetem Datensatz.

## 7. Was sich konkret hier ändern müsste (Migrationspfad)

1. `core/dataProvider.js`: zusätzliche Methode `ladeListe(typ, { suche, filter, cursor, limit })`
   → ruft `mock` (heute) oder `mssql` (später) hinter demselben SEAM auf.
2. `core/detailberichte.js`: `REGISTRY[].lade` wird async/paginiert; `generischListe`
   bleibt als Mock-Implementierung erhalten.
3. `modules/detailberichte/Detailberichte.jsx` (`Liste`): aus `data.rows` wird ein
   gepuffertes, virtualisiertes Fenster + „mehr laden"; Summen/Counts kommen vom Server
   (`aggregat`-Endpoint), nicht aus dem clientseitigen Reduce.
4. Dimensionsfilter (`☰ Filter`) + Dimensions-Umschalter (`pivot.js`) liefern künftig
   `GROUP BY`-Parameter an die Aggregat-API statt clientseitig zu gruppieren.

## 8. Richtwerte

- Browser hält ~10–50k DOM-Zeilen ohne Virtualisierung mühsam; **mit** Virtualisierung
  praktisch unbegrenzt (nur sichtbare ~50 im DOM).
- Pro API-Seite 100–500 Zeilen sind ein guter Default; Drill-Calls < 50 ms anstreben
  (Index/Partition vorausgesetzt).
- Count vermeiden/begrenzen: „1–500 von vielen" statt exaktem Gesamt bei > 10.000 Treffern.

---

**Kurzfassung:** Server filtert & paginiert (Keyset-Cursor), Browser virtualisiert die
Anzeige, KPIs kommen aus gecachten Pre-Aggregaten, Drill lädt Einzelbelege on-demand.
Rohdaten bleiben vollständig granular — es wird nie alles auf einmal geladen.
