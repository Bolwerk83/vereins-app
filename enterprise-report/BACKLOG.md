# Backlog / TODO — Enterprise Report

Gesammelte, noch offene Wünsche (damit nichts untergeht). Wird Stück für Stück
abgearbeitet — pro Punkt jeweils: Core-Logik + Tests + UI + kurzer Sichtcheck.

Stand: laufende Session. Branch: `claude/enterprise-reporting-system-fvfwe4`.

## Offen — priorisiert

### 1. BCG-/Portfolio-Matrix drill-down
- Bubbles **anklickbar**; Sprung in den passenden Detailbereich **mit passenden
  Filtern** (z. B. Artikel-/Produktliste gefiltert auf die Warengruppe), damit man
  den Wert „im Gesamt" wiederfindet.
- Auch Quadranten (Stars / Cash Cows / Question Marks / Poor Dogs) als Einstieg.
- Mechanik: `onDrill(objekt)` aus Lebenszyklus → App → Detailberichte mit Vorfilter
  (`startSuche`).

### 2. Instrumente / Berichtsbaum aufräumen
- Alle Berichte unter **Instrumente** in sinnvolle Bereiche einsortieren.
- Berichtsbaum-Logik **anwenderfreundlicher** strukturieren.
- Berichts-**Beschreibungen deutlich ausführlicher** (Zweck, Inhalt, typische Fragen,
  Quelle, Lesehilfe).

### 3. Szenarienplanung (eigener Bereich)
- What-if: Kennzahlen-Werte **prozentual ODER absolut** ändern, Auswirkung auf
  abgeleitete KPIs live sehen (nutzt KPI-Abhängigkeitsgraph).
- Szenarien speichern/vergleichen (Basis/Best/Worst), mehr Stellhebel.

### 4. Tagesreporting auffindbar machen
- Das „Tag-Rep" (Tagesreporting) ist aktuell schwer zu finden — eigener,
  klar sichtbarer Einstieg + Inhalt.

### 5. Produktion ausbauen
- Produktionsbereich kommt zu kurz: eigene Berichte/Kennzahlen (Auslastung, OEE,
  Ausschuss/Nacharbeit, Durchlaufzeit, Engpässe), ggf. eigenes Modul.

### 6. Reichere Berichte je Knoten
- Mehr als 2–3 KPIs je Bericht; **kritischste zuerst** sortiert.
- **Visual-/Tabellen-Umschalter**; kompakte „Was sticht heraus"-Zeile.

### 7. Prozesskette AE → Umsatz
- Flussgrafik: **AE** → (− stornierte Aufträge − verlorene Angebote) → **AEB**
  → Aufteilung in **Lieferkette** (ab hier angestoßen) und **Wertschöpfungskette**
  bis zu den **Umsatzerlösen** (bessere Begriffe gern).

### 8. Marketing-Landkarten
- Choropleth: **Welt → Europa → Deutschland → Bundesländer → PLZ-Gebiet**.
- Mehrere wählbare Metriken (Umsatzerlöse, Marktanteil, DB %, Verteilung nach
  Warenbereichen …), **Bookmarks** + ein-/ausblenden (wie bei den Listen).

### 9. Vollansicht-Karte: Zuweisungen ausbauen
- **User hinzufügen/verwalten**, nach **Bereichen/Gruppen** unterteilen,
  **Favoriten** (Person oder Gruppe) priorisiert anzeigen.

### 10. Vollansicht-Karte: Maßnahmen + KI
- Direkt auf der Karte **Maßnahme anlegen**; KI schlägt **mehrere SMART-Maßnahmen**
  als Vorlage vor; Anwender wählt die passenden.

### 11. Designer: bestehende Berichte frei anpassen
- Aufbau, Sortierung, **Visuals und andere Elemente** je Bericht konfigurierbar.

### 12. Design im Rose-Stil (Inspiration)
- Clean & modern: klare Top-Navigation, viel Weißraum, kräftiger roter Akzent,
  große Karten/Bilder, ruhige Typografie (eigenständig, kein 1:1-Klon).

### 13. Lebenszyklus grafisch
- Den Produkt-/Kunden-Lebenszyklus zusätzlich **grafisch** zeigen (Phasenkurve/
  Timeline „Einführung → Wachstum → Reife → Rückgang" mit Position der Objekte),
  nicht nur Tabelle + Bubble-Matrix.

### 14. Navigation entwirren (zwei Leisten)
- Obere Leiste (Shortcuts) und Burger-Menü (volle Navigation) überschneiden sich →
  verwirrend. Klar trennen: oben = globaler Kontext + Suche + wenige Primär-Shortcuts;
  Burger = komplette, rollen-gefilterte Berichtsnavigation. Obere Leiste ebenfalls
  rollen-bewusst (fremde Bereiche ausblenden/kennzeichnen).

### 15. Startseite mit Import-/Ladestatus
- Eigene Startseite/Cockpit: Sind **alle Importe gelaufen?** Fortschritt/Restwartezeit,
  **Stand/Frische der Daten**, Verbindungsstatus, letzte Aktualisierung je Quelle,
  Fehler/Warnungen beim Laden.

### 16. Flexible Zeitraumsdefinition
- Granularitäten wählbar: **Jahr/Monat/Tag**, **Jahr/KW/Tag** usw.,
  jeweils **nach Datumsart** (Belegdatum, Bestelldatum, Lieferdatum …).
- Baut auf `periodenmodell.js` + `ZeitDatenart` auf; in allen passenden Berichten
  wirksam (Filter/Aggregation).

## Kleinere / Querschnitt
- Visualisierungen (Daten-Balken etc.) auch **im Berichtsbaum** und weiteren
  Berichten anbieten (bisher nur Detaillisten).
- Hierarchie-Matrix auch in weiteren passenden Berichten einsetzen.
- KPI-Symbole (#, Σ, Δ) konsequent überall ausrollen, wo sinnvoll.
- Stub an echte Quellen anbinden: **Preispiranha-API**, **Bild-Upload**
  (Artikelkarte), unternehmensweite **Aufgabenliste**.
- Struktur: `core/detailberichte.js` aufteilen (Daten/Plausi/Registry); `HEUTE`
  aus dem Periodenmodell statt hartkodiert.
- Standalone-Demo nach größeren Änderungen jeweils neu erzeugen
  (`npm run build:standalone`).

## In dieser Session bereits erledigt (Kontext)
- Detailberichte: 17 Listen, Plausi, E5-Historie, Cross-Drill, Spalten/Bookmarks,
  CSV, KPI-Hover, Vollansicht (KI-Erkenntnisse/Bemerkungen/Preisvergleich),
  Sammel-Cockpit, Qualitätsdashboard (Status+Log), Controller-Radar (+Log),
  Kontenliste (DimKonto).
- Hub nach Bereichen gruppiert; Fake-Demodaten (Namen & Nummern).
- Visualisierungen (Daten-Balken, an/aus); KPI-Symbole + Logik-Drill (Transparenz).
- Admin: eigene Designs anlegen; Onboarding neugierig/wechselnd.
- Hierarchie-Matrix (Power-BI-Stil) im Strukturbericht.
- KPI-Kaltstart-Crash behoben; Standalone-Build (`?demo` / `er_demo_view`).
