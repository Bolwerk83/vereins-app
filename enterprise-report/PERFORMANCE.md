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

## 8. Sternschema & Snowflake — warum das schnell bleibt

Das semantische Modell (`core/datenmodell.js`, `core/beziehungen.js`, `core/dimHierarchie.js`)
ist ein **Sternschema**: schlanke, lange **Faktentabellen** (FactUmsatz, FactAuftrag …) mit
nur Schlüsseln + Kennzahlen, ringsum kurze **Dimensionen** (DimZeit, DimArtikel, DimKunde,
DimRegion, DimProfitCenter …).

- **Schmale Fakten = schnelle Scans.** Die teure Tabelle enthält nur `int`-Keys und Measures;
  Texte/Attribute liegen in den (kleinen) Dimensionen → Columnstore komprimiert die Fakten
  extrem, Joins gehen gegen wenige tausend Dim-Zeilen.
- **Snowflake nur wo nötig.** Ausgelagerte Unter-Dimensionen (Outrigger, z. B.
  DimArtikel → DimWarengruppe → DimSortiment) normalisieren tiefe Hierarchien, ohne die
  Faktentabelle aufzublähen. Faustregel: **Star für Abfragetempo, Snowflake für Pflege/
  Konsistenz** großer Hierarchien.
- **Conformed Dimensions.** Dieselbe DimZeit/DimProfitCenter hängt an *allen* Fakten →
  ein Filter (Periode, Profit-Center) wirkt konsistent über alle Berichte und ist als
  Join-Bedingung indizierbar.

## 9. Roll-up über Hierarchien & Pre-Aggregate je Korn

Hierarchien (Zeit: Tag→Monat→Quartal→Jahr; Profit-Center: Geschäftsbereich/Vertriebskanal/
Land; Artikel: SKU→Warengruppe) erlauben **Aggregat-Navigation**:

- Pre-Aggregate werden **je sinnvollem Korn** materialisiert (z. B. Monat × Profit-Center ×
  Warengruppe), nicht je Einzelkombination. Die KPI-Schicht trifft das gröbste passende
  Aggregat; der Drill faltet erst beim Aufklappen feiner auf (vgl. #5/#6).
- Der **Profit-Center-Baum** ist genau so eine Dimensionshierarchie: Der zentrale PC-Filter
  (`core/statistikFilter.js → pcBaum/pcFaktor`, gespeist aus `pcKostenstellen`) liefert in der
  App heute Anteilsfaktoren auf Demo-Aggregate; gegen echte Quellen wird daraus ein
  `GROUP BY pc_key` bzw. ein `WHERE pc_key IN (rollup(:knoten))`. Kanäle sind Knoten desselben
  Baums — **eine** Dimension, kein paralleles Filterwerk.
- **Additiv vs. nicht-additiv:** Summen/Mengen rollen frei auf; Verhältnis-/Ø-Kennzahlen
  (Quoten, Margen, Ø-Preis) werden **aus den additiven Bausteinen am Zielkorn neu berechnet**,
  nie aus Teilquoten gemittelt. (Genau deshalb skalieren in der App absolute Werte mit dem
  PC-Anteil, Quoten bleiben gleich.)

## 10. Sicherheit ohne Tempoverlust: RLS/OLS-Pushdown

Berechtigung gehört **in die Abfrage**, nicht in den Browser (vgl. `core/datenschutz.js`,
`core/rbac.js`):

- **RLS (Row-Level Security):** Zeilenfilter als Prädikat in der Quelle — z. B. „Bereichsleiter
  sieht nur seine Profit-Center". Bildet exakt auf den PC-Baum ab: das RLS-Prädikat ist ein
  `pc_key IN (erlaubte Knoten inkl. Roll-up)`. Da `pc_key` indiziert und Teil der Pre-Aggregate
  ist, **kostet die Einschränkung nichts** — sie verkleinert die Treffermenge sogar.
- **OLS/CLS (Object-/Column-Level Security):** sensible Spalten (Namen, Gehälter, Margen) werden
  serverseitig **maskiert oder weggelassen**, in dev/test grundsätzlich maskiert (DSGVO-konform,
  wie heute in der Maskierungs-Demo). Der Client bekommt die Daten gar nicht erst.
- **Konsequenz:** Gecachte Aggregate werden **pro Sicherheitskontext** (Rolle/erlaubte PCs)
  geschlüsselt — kein Cache-Leck über Berechtigungsgrenzen.

## 11. Externe Daten (Google, Geo, Markt) — ELT in conformed Dimensions

Google Ads/Analytics, Geo-/PLZ-/Einwohnerdaten und Marktstatistik (`core/googleDaten.js`,
`core/marktpotenzial.js`, `core/datenquellen.js`) werden **nicht live** im Browser gejoint,
sondern als Staging→Conform→Load-Strecke integriert:

- **Inkrementell laden** (nur neue Tage/Deltas), in Staging-Tabellen; daraus **conformte**
  Dimensionen/Fakten (FactGoogleAds je Tag×Kampagne×Kanal, DimGeo je PLZ).
- **Matching/Konformität:** externe Schlüssel (Kampagne→Kanal, PLZ→Region) werden über
  Mapping-Tabellen auf die internen Dimensionsschlüssel gezogen → danach ist der Abgleich
  „Plan/Ist ↔ Google" bzw. „Umsatz ↔ Marktpotenzial je PLZ" ein normaler Join, kein
  Laufzeit-Mapping.
- **Auffrischzyklus** je Quelle (Ads täglich, Geo/Markt selten) steuert Cache-Invalidierung;
  Datenstand pro Quelle wird ausgewiesen (`core/datenstand.js`).

## 12. Richtwerte

- Browser hält ~10–50k DOM-Zeilen ohne Virtualisierung mühsam; **mit** Virtualisierung
  praktisch unbegrenzt (nur sichtbare ~50 im DOM).
- Pro API-Seite 100–500 Zeilen sind ein guter Default; Drill-Calls < 50 ms anstreben
  (Index/Partition vorausgesetzt).
- Count vermeiden/begrenzen: „1–500 von vielen" statt exaktem Gesamt bei > 10.000 Treffern.
- Pre-Aggregat-Korn so grob wie möglich, so fein wie nötig: lieber wenige gut getroffene
  Aggregate (Monat×PC×Warengruppe) als eine Würfel-Explosion über alle Dimensionen.

---

**Kurzfassung:** Sternschema (schlanke Fakten, conformte Dimensionen) + Pre-Aggregate je
sinnvollem Korn machen KPIs schnell; der Profit-Center-Baum ist eine Dimensionshierarchie,
über die zugleich gefiltert (Roll-up) und abgesichert (RLS-Pushdown) wird. Server filtert &
paginiert (Keyset-Cursor), Browser virtualisiert die Anzeige, sensible Spalten werden
serverseitig maskiert (OLS), externe Daten kommen vor-konformt aus einer ELT-Strecke. Drill
lädt Einzelbelege on-demand — Rohdaten bleiben vollständig granular, es wird nie alles auf
einmal geladen.
