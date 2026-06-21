# 12 · Self-Service-BI-Bausteine

Drei Erweiterungen heben das Tool auf Enterprise-BI-Niveau.

## 1. Berichtsnummern & Katalog (Glossar)

Jeder Bericht hat eine feste, sprechende Nummer — Schema `<BEREICH>-<NNN>`:
- E2 Fachbereich = `B-100` · E3 Themenbereich = `B-110/120…` · E4 Detail = `B-111/112…`
- Beispiel: **`VK-111`** = Verkauf › Kanäle & Marktplätze › Umsatz je Kanal.

Erzeugt in `reportTree.js` (`nummeriereBaum`, `berichtIndex`, `findeNummer`).
Der Reiter **Katalog** listet alle ~150 Berichte, durchsuchbar nach Nummer
oder Titel, nach Clustern gruppiert; Klick öffnet den Bericht im Baum. So
sprechen wir beide eindeutig über „Bericht VK-111".

## 2. Mehrere E4-Sprungpunkte (Detail-Perspektiven) + Filtermaske

Beim Sprung auf Ebene 4 bietet ein Knoten mehrere **Auswertungsobjekte** an —
**nur die fachlich sinnvollen** (`src/core/drilldowns.js`):

| Knoten | Perspektiven |
|--------|--------------|
| Verkauf › Kanäle | Artikel · Produktgruppe · Kunde · Verkaufsrechnung · Auftrag |
| Verkauf › Retouren | Artikel · Kunde · Verkaufsrechnung |
| Einkauf › Lieferanten | Lieferant · Artikel · **Einkaufsrechnung** · Bestellung |
| Logistik › Bestände | Artikel · Produktgruppe · Lagerort |
| Finanzen › GuV | Profit-Center · Kostenstelle · Konto |

Die Verkaufsstatistik bietet also bewusst **keine** Einkaufsrechnung an.

Jede Perspektive zeigt zuerst eine **Filtermaske** (Zeitraum, Suche, Top-N) —
erst nach „Anzeigen" wird geladen, damit große Auswertungen schnell bleiben.
Datenweg: `dataProvider.ladePerspektive(<bereich>_<objekt>)` (Mock heute,
MSSQL `/api/perspektive/:key` morgen — SQL `perspektive_<key>.sql`).

## 3. Management-Report-Designer (Self-Service)

Reiter **Designer**: eigene Management-Reports zusammenbauen aus Bausteinen —
**KPI · Textblock · Maßnahmen** — sortierbar, mit Live-Vorschau, automatischer
Lagebewertung, **Speichern** (mehrere Reports), **PDF-Druck** und **CSV-Export**.
Object-Level-Security greift (geschützte KPIs nicht wählbar). Store:
`src/core/designer.js` (LocalStorage; später MSSQL-Tabelle).

## Erweiterungen

- **Perspektiven ausgerollt** auf Produktion (Artikel/Auftrag/Maschine),
  Logistik externe Läger, Vertriebscontrolling (Kunde/Kanal), Marketing
  (Kampagne/Kanal), Risiko (Kunde/Verkaufsrechnung), Personalcontrolling
  (Kostenstelle/Mitarbeiter), Supply-Chain (Artikel/Lagerort).
- **Echte Feldfilter:** Datensätze markieren kategorische Spalten über
  `filterSpalten`; die Filtermaske bietet dafür Dropdowns (Status, Segment,
  Typ, ABC, Risiko …) — kombiniert mit Volltext und Top-N.
- **Eigene Berichte im Katalog:** gespeicherte Designer-Reports erscheinen im
  Berichtskatalog mit fortlaufender Nummer **`EIG-001`** und öffnen direkt
  im Designer.

## Wirkung
- **Eindeutige Kommunikation** über Berichtsnummern (inkl. eigener `EIG-*`).
- **Tiefe Detailanalyse** über kontextabhängige Sprungpunkte — performant
  dank Filtermaske.
- **Eigene Berichte** ohne Entwicklung — der Anwender baut sich sein Cockpit.
