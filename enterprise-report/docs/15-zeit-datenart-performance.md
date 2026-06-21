# Zeitbezug, Datenart-Steuerung & Performance

## 1. Datumssicht (Periodenbezug)

Ein und derselbe Vorgang trägt mehrere Datumsstempel. In welche Periode er
fällt, hängt von der gewählten **Datumssicht** ab:

| Sicht          | Controlling-Frage                                   |
|----------------|-----------------------------------------------------|
| Belegdatum     | Wann wurde fakturiert? (Standard für Umsatz/GuV)    |
| Bestelldatum   | Wann kam der Auftrag herein? (Vertriebsfrühindikator)|
| Lieferdatum    | Wann wurde geliefert/realisiert? (Logistik/Umsatzrealisierung)|
| Zahldatum      | Wann floss Geld? (Liquidität/Treasury)              |

Technisch: die Datumssicht ist ein Parameter an der Datenschicht. Im SQL
entscheidet sie, **welche Datumsspalte** die Periodenzuordnung steuert
(`WHERE <gewählte_datumsspalte> BETWEEN @von AND @bis`).

## 2. Datenherkunft je Periode (Ist / Tagesreporting / Plan / Forecast)

Das **Versionsmodell** des Controllings, gesteuert über eine
**Zuweisungstabelle** (pro Monat genau eine Datenart):

- **Ist (Buchhaltung)** — abgeschlossene Monate, Quelle = Buchhaltungskonten.
  Verbindlich, abgestimmt.
- **Tagesreporting (Auftrag + Plan)** — der **laufende** Monat. Schnelle,
  operative Zahlen aus **Auftragsdaten**, ergänzt („aufgefüllt") um **Plan
  für einzelne Konten**, die in den Auftragsdaten noch nicht enthalten sind
  (z. B. Gemeinkosten, Abschreibungen). Welche Konten aufgefüllt werden, ist
  einstellbar.
- **Plan** / **Forecast (FC)** — zukünftige Monate.

So sieht das **Tagesreporting** tagesaktuell, was über **Tag / Woche / Monat /
Quartal / Jahr** kumuliert — laufender Monat operativ, Vormonate als Ist,
Folgemonate als Plan/FC. Year-to-date mischt also sauber Ist + Tagesreporting,
Year-to-go nutzt Plan/FC.

Begriffe (falls gewünscht): „Datenherkunft", „Periodensteuerung",
„Versionszuordnung" oder „Ist/Plan/FC-Mix" meinen dasselbe.

## 3. Granularität

Tag → Woche → Monat → Quartal → Jahr. Aufwärts wird **verdichtet**
(summiert/gewichtet), abwärts **aufgerissen**. Verdichtung passiert
serverseitig in der jeweiligen Datenquelle (kein Nachladen je Ebene).

## 4. Performance — so bleibt es schnell

1. **Filter vor dem Laden** (bereits umgesetzt): erst Maske, dann laden.
2. **Client-Cache** (umgesetzt): identische Abfragen (gleiche Periode,
   Datumssicht, Granularität, Perspektive) werden nicht erneut geholt.
3. **Serverseitige Vor-Aggregate**: je Granularität eine **indizierte /
   materialisierte View** (Tages-, Monats-, Jahresaggregat) — die UI liest
   das passende Aggregat statt Rohbelege.
4. **Columnstore-Index** auf den Faktentabellen (ideal für Aggregationen).
5. **Inkrementelles Laden / Pagination**: nur sichtbare Zeilen (Top-N),
   Nachladen auf Anforderung; Tabellen virtualisiert.
6. **Schmale Verträge**: KPI-SQL liefert nur `periode, wert[, dimension]` —
   keine `SELECT *`-Rohdaten in die UI.
7. **Datenstand-Cache je Abschluss**: Ist-Monate ändern sich nicht mehr →
   einmal berechnen, einfrieren (Snapshot-Tabelle).

> Wichtigster Hebel: **vorberechnen statt zur Laufzeit aggregieren**. Das
> Frontend ist bereits darauf vorbereitet (schmaler Vertrag + Cache); die
> Aggregate legst du als Views im DWH an.
