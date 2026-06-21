# Reifegrad & Roadmap — was fehlt zum vollwertigen Controlling-BI

Stand: das Tool deckt Struktur (Berichtsbaum, 5 Ebenen), Kennzahlenlogik,
Rollen/Rechte, Self-Service-BI, Maßnahmen, Instrumente, Drill-Through und
Export bereits ab. Für ein **vollwertiges** Controlling-BI-Reporting fehlen
noch die folgenden Bausteine — geordnet nach Wirkung.

## A. Datenmodell & Zeitlogik  ← jetzt umgesetzt (Baustein 1)
- **Datumssicht / Periodenbezug**: dieselbe Zahl je nach Belegdatum,
  Bestelldatum, Lieferdatum oder Zahldatum. (umgesetzt)
- **Datenherkunft je Periode (Ist / Tagesreporting / Plan / Forecast)** über
  eine **Zuweisungstabelle** — pro Monat steuerbar. (umgesetzt)
- **Granularität** Tag/Woche/Monat/Quartal/Jahr mit Auf-/Abwärtsverdichtung.
  (Auswahl umgesetzt; Verdichtung serverseitig je Datenquelle)
- Offen: **Währungsumrechnung** (Konzern), **Mengen-/Wert-Dualität**.

## B. Self-Service-Layout  ← nächster Schritt (Baustein 2)
- **Spalten-Designer wie Power BI**: Spalten hinzufügen (auch berechnete
  Felder/Measures), umbenennen, ausblenden, sortieren, formatieren, löschen.
- **Immer „Standard wiederherstellen"** — pro Bericht. (Prinzip bereits in
  Zeit/Datenart umgesetzt, wird im Designer fortgeführt.)
- Pivot/Matrix (Zeilen × Spalten), Zwischensummen, bedingte Formatierung.

## C. Performance bei großen Datenmengen  ← Konzept + erste Optimierung umgesetzt
Siehe `15-zeit-datenart-performance.md`. Kurz: Filter-vor-Laden (vorhanden),
**Client-Cache** (umgesetzt), serverseitige **Vor-Aggregate / indizierte
Views**, **Columnstore-Indizes**, **Inkrementelles Laden**, **Pagination/
Virtualisierung** der Tabellen.

## D. Governance & Betrieb (mittel-/langfristig)
- **Versionierung & Freeze**: Monatsabschluss „einfrieren" (Ist sperren).
- **Audit-Trail**: wer hat wann welche Maßnahme/Planung geändert.
- **Kommentare/Workflow** an Berichten (Freigabe Monatsreporting).
- **Datenstand/Aktualität** sichtbar (Ladezeitpunkt, „Daten von …").
- **Plan-Erfassung** (Bottom-up) statt nur Anzeige.
- **Verteilung**: Abos, geplanter Versand, Snapshots als PDF.

## E. Datenqualität (Ausbau des vorhandenen Quercheck)
- Vollständigkeits-/Abstimmbrücken (z. B. Summe Konten = GuV-Zeile).
- Saldenabstimmung Vorsystem ↔ Buchhaltung.

> Fazit: Mit A + B + C wird aus dem heutigen Reporting-Werkzeug ein
> **steuerndes Controlling-Instrument** (Ist/Plan/FC, frei modellierbar,
> performant). D + E machen es **abschluss- und revisionssicher**.
