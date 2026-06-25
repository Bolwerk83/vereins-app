# Backlog / TODO — Enterprise Report

Gesammelte, noch offene Wünsche (damit nichts untergeht). Wird Stück für Stück
abgearbeitet — pro Punkt jeweils: Core-Logik + Tests + UI + kurzer Sichtcheck.

Stand: laufende Session. Branch: `claude/enterprise-reporting-system-fvfwe4`.

## Offen — priorisiert

> **Neu eingegangen (zuerst, eins nach dem anderen abarbeiten):**

### A. Eigener Planungsbereich (Budget / Forecast / Szenarien) — v1 DONE, Rest offen
> v1 erledigt: eigener Bereich, Pläne anlegen/kopieren, Bottom-Up-Mengen +
> Top-Down-Verteilung, Menge↔Betrag, Schwund-Aufschlag, Produktion ohne Umsatz,
> AE→Umsatz-Hochrechnung, Liquiditätsvorschau mit Zahlungszielen.
> Offen (v2): abteilungsspezifische Drilldowns — Einkauf „wann spätestens bestellen"
> (Puffer-Modus), Produktion „wann einplanen / Was-wäre-wenn", Szenarienvergleich (erledigt), gemeinsames Periodenmodell mit B (Monatsraster, erledigt).
- Eigener Bereich; Pläne **selbst anlegen** und **„kopieren von"** (Vorlage).
- Planung **Top-Down UND Bottom-Up**; der **Controller steuert/vermittelt** dazwischen.
  Leitgedanke: *alle haben dieselbe Vorstellung von den Werten.*
- Eingabe wahlweise **Artikelpreis × Menge** (hochrechnen) ODER **Betrag von oben**
  → über den Artikelpreis (Einkauf/Verkauf) **runterbrechen**.
- Wirkungssicht je Abteilung:
  - **Einkauf:** wann muss spätestens bestellt werden (Puffer-Modus, z. B. +1 Monat)?
  - **Produktion:** wann muss das Bike eingeplant werden? Was passiert bei Änderung?
  - **Vertrieb:** Auftragseingang, **prozentual hochgerechnet** AE→Umsatzerlöse (Historie).
- **Liquiditätsvorschau** aus Zahlungsfluss Einkauf/Verkauf (z. B. Sattel-Bestellung
  in 2 Wochen zahlbar; Fahrrad im Schnitt 2 Monate nach Produktion verkauft/bezahlt).
- **Mehrbedarf einplanen:** Aufschlag für **Bruch/Schwund** (Teile/Räder gehen kaputt
  oder verschwinden) — Planmenge = Bedarf × (1 + Schwundquote).
- **Produktion ohne Umsatz:** Räder für **Sponsoren, Ausstellungen, Muster, Tests** —
  verursachen Kosten, aber keinen Umsatz; als eigene Plan-Kategorie führen (Menge +
  Kosten, kein Erlös), damit Deckungsbeitrag/Ergebnis nicht verzerrt wird.
- „so simpel und doch so detailliert wie möglich" — weitere sinnvolle Stellhebel ergänzen.

### B. Kalkulatorische Kosten je Wirtschaftsjahr versionieren (+ Monat) — DONE
- Parameter (Wiederbeschaffungswert, Zinssatz, betr.notw. Kapital, Marktmiete,
  GF-Gehalt, Wagnissatz …) **pro Geschäftsjahr** pflegbar; **„Vorjahr kopieren"**.
- Monat: **nicht** eintippen, sondern **automatisch verteilen** (Default linear /12,
  optional Verteilungsschlüssel, Einzel-Override). Gemeinsames Periodenmodell mit A.

### C. Vertriebskennzahlen-Taxonomie übernehmen + Berichtslogik anpassen — DONE
- Phasen: **ANGE** (Angebot), **AE** (Auftragseingang), **AER** (Verwertung),
  **AU** (Bearbeitung), **Q** (Qualität/Verluste), **UM** (Umsatz/Absatz).
- Neue/zu prüfende KPIs: ANGE, OANG, VANGE; AE, AEB, AEOA, STORAE, SAEOA;
  AET, NFA; RET; Storno %, Angebotsverlust %, Auftragsstorno %;
  ABS, VKM, VUMS, KGUT, UMS, ARTUMS, KG; Umsatz/Auftrag Ø, Umsatz/Artikel Ø.
- **AEW (Auftragseingang wirksam) entfällt.** **„Offene Aufträge (OAU)" = Auftragsbestand.**
- Einzel-/Summen-/Ø-Kennzahlen + Legende (Σ Wert, ◊ Menge, % Verhältnis, Ø Schnitt).

### D. Performance/Skalierung bei Millionen Datensätzen — KONZEPT DOKUMENTIERT (PERFORMANCE.md)
- Anforderung: Rohdaten bleiben granular (nicht wegaggregieren), trotzdem schnell.
- Architektur-Bausteine: **Server-seitige Filterung/Paginierung** (Detaillisten nie
  komplett in den Browser laden), **Tabellen-Virtualisierung** (nur sichtbare Zeilen),
  **Zeit-Partitionierung/Indizes** in der Quelle, **Spaltenspeicher/Pre-Indizes**,
  **Lazy-Drill** (erst auf Klick nachladen), **Cursor-Streaming statt OFFSET**,
  Caching der KPI-Schicht. Entkopplung „Anzeige (gefiltert)" vs. „Drill bis
  Einzelbeleg (on-demand)" — Granularität bleibt, nur die geladene Menge wird begrenzt.

### E. Standard-Dimensionsfilter je Bericht (Button wie Burger)
- Im Bericht ein **Filter-Button** (Stil/Verhalten wie der Burger-Button) öffnet ein
  Panel zum Setzen der **Standard-Dimensionsfilter** (war schon gewünscht, aktuell
  nicht auffindbar → klar sichtbar machen).
- Auch **nach Bereichen filtern**.
- **Nur sinnvolle Dimensionen** anzeigen: Dimensionen, die für den jeweiligen Bericht
  keinen Sinn ergeben, werden ausgeblendet (kontextabhängige Filterliste).

### F. Vertriebsqualität: Gutschriften & Retouren (kundenbasiert) — DONE
- **Kundenbasierte Übersicht** (besserer Name, z. B. „Gutschriften- & Retouren-Cockpit"):
  je Kunde alle Belege verknüpfen — heute sind bei mehreren Versendungen die
  zugehörigen Belege NICHT verknüpft. Ziel: „sind wir beim Kunden sauber?".
- Unterscheiden: **Retourengutschriften** (mit Absatzänderung) — Quote teils > 55 % —
  und **Wertgutschriften** (ohne Absatzänderung).
- **Wertgutschriften zum tatsächlichen Auftrag**: in **EUR und %** ausweisen.
- Retourenübersicht je Kunde (Quote, Wert, Gründe), Auffälligkeiten markieren.

### H. Dimensions-Umschalter in allen sinnvollen Berichten — DONE
- Gruppierung je Bericht umschaltbar (z. B. Bereich → Profit-Center → Region →
  Kanal → Warenbereich …), nicht nur Filtern. Basis: `core/pivot.js` (gruppiere,
  sinnvolleDimensionen). v1 im Personalbericht umgesetzt.
- **Erledigt:** Vertrieb (Warengruppe/Kanal/Artikel), Produktion (Produkt/Werk),
  Profitcenter (Geschäftsbereich/Region/Kanal), Fahrrad (Kategorie/Preisklasse),
  **Lager** (Artikel/Lieferant/Status — Eskalations-Workflow bleibt in Artikel-Sicht).

### G. Abgleichsbericht Absatzmenge vs. Auftragseingang tatsächlich — DONE
- **Absatzmenge (aus Rechnungspositionen)** gegen **Auftragseingang tatsächlich
  (AET, WaWi)** je Produkt/Kunde abgleichen; Differenz (abs/%) und Ursachen
  (Teillieferung, Storno, Verschiebung) sichtbar machen.

---

### 1. BCG-/Portfolio-Matrix drill-down — DONE
- Bubbles **anklickbar**; Sprung in den passenden Detailbereich **mit passenden
  Filtern** (z. B. Artikel-/Produktliste gefiltert auf die Warengruppe), damit man
  den Wert „im Gesamt" wiederfindet. (onDrill → gehDetail('artikel', name))
- Quadranten (Stars / Cash Cows / Question Marks / Poor Dogs) als Einstieg:
  Achsen Wachstum × DB (DB-Schwelle = Median), vier getönte/anklickbare Felder
  im Chart + Karten; Klick filtert Chart & Liste auf das Feld, je Objekt Drill.
  Core: `bcgVerteilung`/`quadrantVon`/`BCG_QUADRANTEN` (+ Tests).

### 2. Instrumente / Berichtsbaum aufräumen
- Alle Berichte unter **Instrumente** in sinnvolle Bereiche einsortieren.
- Berichtsbaum-Logik **anwenderfreundlicher** strukturieren.
- Berichts-**Beschreibungen deutlich ausführlicher** (Zweck, Inhalt, typische Fragen,
  Quelle, Lesehilfe).

### 3. Szenarienplanung (eigener Bereich) — DONE (What-if-Simulator)
- What-if: Kennzahlen-Werte **prozentual ODER absolut** ändern, Auswirkung auf
  abgeleitete KPIs live sehen (nutzt KPI-Abhängigkeitsgraph).
- Szenarien speichern/vergleichen (Basis/Best/Worst), mehr Stellhebel.

### 4. Tagesreporting auffindbar machen — DONE
- Das „Tag-Rep" (Tagesreporting) ist aktuell schwer zu finden — eigener,
  klar sichtbarer Einstieg + Inhalt.

### 5. Produktion ausbauen
- Produktionsbereich kommt zu kurz: eigene Berichte/Kennzahlen (Auslastung, OEE,
  Ausschuss/Nacharbeit, Durchlaufzeit, Engpässe), ggf. eigenes Modul.

### 6. Reichere Berichte je Knoten — DONE
- Mehr als 2–3 KPIs je Bericht; **kritischste zuerst** sortiert.
- **Visual-/Tabellen-Umschalter**; kompakte „Was sticht heraus"-Zeile.

### 7. Prozesskette AE → Umsatz — DONE
- Flussgrafik: **AE** → (− stornierte Aufträge − verlorene Angebote) → **AEB**
  → Aufteilung in **Lieferkette** (ab hier angestoßen) und **Wertschöpfungskette**
  bis zu den **Umsatzerlösen** (bessere Begriffe gern).

### 8. Marketing-Landkarten — DONE
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

### 13b. Nachfolger-Verkettung / Produktlinien im Lebenszyklus — DONE
- Modellwechsel = neue Artikelnummer: Vorgänger→Nachfolger einmalig zuordnen und
  **dauerhaft validieren** (persistent, Wer/Wann). Validierte Matches werden zu
  einer durchgängigen Produktlinie kombiniert (Umsatz summiert, Lebenszyklus-
  Position des aktuellen Modells) und in Matrix/Kurve/Liste als eine Linie gezeigt.
- Vorschläge aus Stammdaten-Feld `vorgaenger` (WaWi „Nachfolgeartikel"); Panel zum
  Bestätigen/Aufheben; Toggle „⛓ Nachfolger kombinieren".
  Core: `core/produktlinie.js` (kandidaten, ladeMatches, bestaetigeMatch, loeseMatch,
  offeneVorschlaege, produktLinien, mitLinien) + Tests.

### 13. Lebenszyklus grafisch — DONE
- Klassische Lebenszyklus-Kurve (Aufstieg → Peak → Abfall) mit Phasenbändern,
  Objekte als Blasen je Phase (Größe = Umsatz). Produkte: Matrix/Kurve-Umschalter
  im Portfolio-Panel; Kunden: eigene Beziehungs-Kurve (5 Phasen) über der Tabelle.
  Core: `phasenKurve(phasen, objekte)` (Höhenprofil + Objektpositionen, + Tests).

### 14. Navigation entwirren (zwei Leisten) — DONE
- Obere Leiste (Shortcuts) und Burger-Menü (volle Navigation) überschneiden sich →
  verwirrend. Klar trennen: oben = globaler Kontext + Suche + wenige Primär-Shortcuts;
  Burger = komplette, rollen-gefilterte Berichtsnavigation. Obere Leiste ebenfalls
  rollen-bewusst (fremde Bereiche ausblenden/kennzeichnen).
- Erledigt: Berichte-/Kennzahlen-/Rechte-Shortcuts aus Topbar entfernt; nur noch QC + Alerts
  als Status-Badges oben. OnePager/Roter Faden/Assistent in BurgerMenu (Werkzeuge-Untergruppe)
  verschoben; Detail-Analyse in Burger-Überblick ergänzt; navMeta.js aktualisiert.

### 15. Startseite mit Import-/Ladestatus — DONE
- Eigene Startseite/Cockpit: Sind **alle Importe gelaufen?** Fortschritt/Restwartezeit,
  **Stand/Frische der Daten**, Verbindungsstatus, letzte Aktualisierung je Quelle,
  Fehler/Warnungen beim Laden.

### 16. Flexible Zeitraumsdefinition — DONE
- Granularitäten wählbar: **Jahr/Monat/Tag**, **Jahr/KW/Tag** usw.,
  jeweils **nach Datumsart** (Belegdatum, Bestelldatum, Lieferdatum …).
- Implementiert: `periodenmodell.js` (DATUMSSICHTEN, GRANULARITAETEN, Datenherkunft
  je Monat), `ZeitDatenart.jsx` (vollständige UI, erreichbar über 🗓 in der Topbar),
  `StatistikFilter.jsx` + `statistikFilter.js` (je Bericht: Datumsart-Auswahl);
  `DatenartBadge` in der Topbar zeigt den aktuellen Mix.

### 17. Von jeder Kennzahl in Themenbericht/Details springen — DONE
- An **jeder KPI** direkt: Sprung in den passenden **Themenbericht (E3)** oder die
  **Details (E4)** — mit Auswahl **unterschiedlicher Ansichten**. Einheitliches
  „Öffnen in …"-Menü an der Karte/im Drill.
- Implementiert: `DRILL_ZIELE`-Mapping (20+ Berichtsansichten) in `ExecKopf.jsx`.
  Kleine „Öffnen in:"-Pills am Fuß des ExecKopf nutzen `imBaum(kpiId)`,
  `details(bereich)` und `struktur()` aus NavContext — erscheinen automatisch,
  wenn die aktuelle Ansicht in `DRILL_ZIELE` eingetragen ist.

### 18. KPI als Standard-Vorlage beim Berichtsbau
- Beim Bauen eines Berichts ist die Kennzahl bereits als **Standard-Vorlage** für
  viele **Visuals** hinterlegt (Karte, Balken, Linie, Tabelle, Donut, Hierarchie …),
  sodass man **nur die Kennzahl tauschen** muss und alle Visuals automatisch passen.

### 19. Detailanalyse-Berichte für operative Erfasser:innen — DONE
- Zielgruppe: die täglich Daten **erfassen & bewerten** — sehr granular, nicht „Overall".
- Mehrwerte:
  - **Entwicklungen/Trends** je Artikel/Kunde/Charge/Konto über Zeit (Mini-Zeitreihen,
    „seit gestern"-Delta, Wochen-/Monatsverlauf).
  - **„Was hat sich geändert"** seit letztem Stand (Bewegungen, Korrekturen).
  - **Pivot/Kreuztabelle** mit frei wählbaren Dimensionen & Maßen.
  - **Eingabequalität/Vollständigkeit** je Erfasser:in (Fehlerquote, offene Felder).
  - **Ausreißer/Anomalien** über Zeit (nicht nur statische Plausi).
  - schneller Wechsel Tabelle ↔ Visual ↔ Hierarchie, Drill bis Einzelbeleg.

## Eigene Themen-Ideen (Vorschläge)
- **Schwellwert-Alerts** konfigurierbar + Benachrichtigung/Abo (Alerts ausbauen).
- **Textbox → Maßnahme**: aus Kommentar direkt SMART-Maßnahme erzeugen & nachverfolgen.
- **Audit-Trail global**: wer hat wann was geändert/bewertet (über alle Module).
- **Forecast/Trend-Projektion** (einfache Fortschreibung + Szenariokopplung, vgl. #3).
- **Benchmark/Vergleich** (Vorjahr/Plan/Peer) als eigene Vergleichsansicht.
- **Export/Verteilung** je Bericht (PDF, geplanter Versand — Verteiler nutzen).
- **Mobile/Responsive** Feinschliff für unterwegs.
- **Datenherkunft/Lineage** bis zur SQL-Quelle sichtbar machen.

### Neue Ideen aus Session-Review (2026-06)

- **Working Capital Cockpit** — Forderungen + Lager (Vorratskapital) + Verbindlichkeiten in
  einer Ansicht: Kapital-Bindungsdauer (DSO/DIO/DPO), Cash-Conversion-Cycle, Trend je
  Periode, Drill in den jeweiligen Teilbereich. Besonders relevant, weil Lager und
  Forderungen bereits als eigene Module existieren; die Synthese fehlt.

- **Anomalie-Erklärungskette** — Wenn ein KPI-Alarm auslöst (z. B. Umsatz-Spike in Lager),
  automatisch modulübergreifend nach Ursachen suchen: Lieferengpass? Saisoneffekt?
  Preisänderung? Ergebnis: gerankte Hypothesen mit Evidenz-Links in die jeweiligen
  Quell-Module. Ergänzt die bestehende Anomalie-Erkennung in detailAnalyse.js.

- **Freitext-Analyse (Natural Language Query)** — Eingabefeld: „Welche Warengruppe hatte
  den größten Umsatzrückgang im letzten Quartal?" → sofortige Chart/Tabellen-Antwort.
  Technisch: Mapping von Schlüsselbegriffen auf KPIs + Dimensionen + Zeitraumformel;
  Ergebnis im Antwort-Panel mit Drill-Link in den Bericht. Nutzt bestehenden Assistenten.

- **Kundenprofitabilität 360°** — je Kunde: DB, Servicekosten (Aufwand Kundendienst/Retouren),
  Zahlungsverhalten (Tage bis Zahlung), Retourenquote, Entwicklung über Zeit. Kreuzt
  bestehende Module: Gutschriften, Forderungen, DB-Bericht, Detailberichte.
  Liefert die Frage: „Welche Kunden sind wirklich profitabel — nach allen Kosten?"

- **Lieferanten-Scorecard 360°** — systematische Bewertung je Lieferant: Liefertreue (OTIF),
  Qualitätsquote (Reklamationen/Ausschuss), Preisstabilität, Reaktionszeit bei Engpässen,
  Abhängigkeitsgrad (% der Beschaffung). Baut auf bestehenden Lager-Signalen auf;
  ergänzt den Lieferanten-Lebenszyklus um eine quantitative Scorecard.

- **PDF-Paket / Board-Report** — einen vollständigen Board-Report als PDF generieren:
  Deckblatt (Logo, Periode, Ersteller), Inhaltsverzeichnis, Executive Summary (auto aus
  Managementreport), je Bereich ein Abschnitt mit den wichtigsten Charts/Tabellen,
  Maßnahmen-Übersicht. Nutzt `reportExport.js`; PDF via Browser-Print-API.

- **Was-hat-sich-geändert (Delta seit letztem Login)** — beim Login/Startseite eine
  kompakte Zusammenfassung: welche KPIs haben sich seit dem letzten Besuch signifikant
  verändert? Welche Berichte wurden aktualisiert? Welche Maßnahmen sind fällig?
  Speichert letzten Besuch-Timestamp in localStorage; Delta aus KPI-History berechnen.

- **Interaktiver Budgetabgleich-Kalender** — Planungs-Monat-für-Monat-Vergleich: Ist vs.
  Plan je Kostenstelle/Bereich als Kalenderansicht. Abweichungen direkt inline
  kommentierbar; Drill in den Einzelmonat. Vervollständigt den Planungsbereich (A).

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
- **Artikelkarte (360°-Artikel-Ansicht):** UI-Modul `Artikelkarte.jsx` mit 8 Tabs
  (Journey-Timeline, Verkauf Ist/Plan, Preis, Lager, Produktion, Marketing,
  Bewertungen, Folgeartikel) und 8 KPI-Kacheln; Core: `artikelkarte.js`;
  in Nav + berichtInfo + i18n + navMeta + suche.js integriert.
- **H-Rollout Dimensions-Umschalter:** Verkaufsstatistik (Warengruppe/Kanal/Artikel),
  Produktionsstatistik (Produkt/Werk), Fahrradstatistik (Kategorie/Preisklasse) —
  jeweils mit angepasstem Export.
- **#17 ExecKopf Drill-Links:** `DRILL_ZIELE`-Mapping in ExecKopf.jsx mit 20+
  Berichtsansichten; „Öffnen in:"-Pills am Fuß des ExecKopf automatisch sichtbar.
- Detailberichte: 17 Listen, Plausi, E5-Historie, Cross-Drill, Spalten/Bookmarks,
  CSV, KPI-Hover, Vollansicht (KI-Erkenntnisse/Bemerkungen/Preisvergleich),
  Sammel-Cockpit, Qualitätsdashboard (Status+Log), Controller-Radar (+Log),
  Kontenliste (DimKonto).
- Hub nach Bereichen gruppiert; Fake-Demodaten (Namen & Nummern).
- Visualisierungen (Daten-Balken, an/aus); KPI-Symbole + Logik-Drill (Transparenz).
- Admin: eigene Designs anlegen; Onboarding neugierig/wechselnd.
- Hierarchie-Matrix (Power-BI-Stil) im Strukturbericht.
- KPI-Kaltstart-Crash behoben; Standalone-Build (`?demo` / `er_demo_view`).
- Hub „Berichte & Analysen" neu (ampelrichtige Status); Legende berichtsspezifisch;
  Spalten-Toggle eingeklappt, Bookmarks sichtbar/ausblendbar.
- Globale Suche: Vorauswahl beim Reinklicken (rollen-relevanteste Treffer).
- Rechnungsliste + Positionen zusammengelegt (aufklappbare Master-Detail-Liste).
- KPI-Freigabe-Workflow (freigegeben/Entwurf/deaktiviert; „Aktuell nicht verfügbar";
  Steuerung nur Controlling/Admin).
- Lagerverwaltung: anklickbare Artikel, KI-Empfehlungen, schleichende Lieferanten-
  Signale, Eskalation/Rückfrage-Workflow an die Abteilungsleitung Einkauf.
- Standard-Dimensionsfilter-Button (☰ Filter) je Bericht (nur sinnvolle Dimensionen).
- Produktionscontrolling (#5): Werke/Linien-Live + OEE, EPQ-Losgrößen, Fehlteile,
  Qualität (FPY/Ausschuss), Output je Zeitraum, Abgleich Produktion↔Lager↔Auftragsbestand.
- **#19 Detailanalyse fertiggestellt:** 20 Tests (`detailAnalyse.test.mjs`) — Pflichtfelder,
  delta-Arithmetik, Anomalie-Konsistenz, Pivot-Aggregation, Determinismus; Backlog-Status DONE.
- **H-Lager Dimensions-Umschalter:** `Lagerverwaltung.jsx` Optimierung-Tab erweitert um
  Artikel/Lieferant/Status-Chips. Lieferant-Sicht: Kapital + Einsparpotenzial + Status-Mix
  je Lieferant. Status-Sicht: Unter-/Überdeckung-Aggregation. Eskalations-Workflow bleibt
  in Artikel-Sicht unberührt. Backlog H vollständig abgeschlossen.
- **Backlog-Audit:** #7 (Prozesskette), #15 (Startseite) nachträglich als DONE markiert
  (Module, Tests und berichtInfo-Einträge existierten bereits vollständig).
- **#14 Navigation entwirren:** Topbar auf QC+Alerts+Search+User/Settings reduziert.
  OnePager/Roter Faden/Assistent in BurgerMenu (neue Werkzeuge-Untergruppe) verschoben.
  Detail-Analyse im BurgerMenu (Überblick) ergänzt. navMeta.js um 3 Einträge erweitert.
- **Neue Ideen dokumentiert:** 8 neue Entwicklungspunkte in „Eigene Themen-Ideen" eingetragen
  (Working Capital Cockpit, Anomalie-Erklärungskette, Freitext-Analyse, Kundenprofitabilität 360°,
  Lieferanten-Scorecard, PDF-Paket, Was-hat-sich-geändert, Budgetabgleich-Kalender).
