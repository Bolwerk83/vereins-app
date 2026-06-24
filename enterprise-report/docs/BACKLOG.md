# Backlog / TODO — Enterprise Report

Gepflegte Liste offener Themen. Wird laufend aktualisiert; in jeder Antwort
erinnere ich an den Stand und schlage den nächsten passenden Schritt vor.

Stand: laufend.

## ✅ Erledigt (Auszug)
- Verteiler (Versand) inкл. echtem Bericht-Export (PDF/Excel), Scheduler, PR-Transport
- Abschluss & Versionierung, Datenqualitäts-Abstimmbrücken (+ Hauptbuch-Endpoint)
- Transportwesen dev/test/prod, Tabellen-Virtualisierung, Tests + CI
- Klassifikation operativ/strategisch & monetär/nicht-monetär
- Controlling-Struktur (Teilgebiete, Instrumente, Rechnungswesen)
- KLR: Kostenbegriff, Abgrenzung Aufwand↔Kosten, Stufen-Fluss (laienverständlich)
- Kostenartenrechnung (mehrdimensional), Kalkulatorik (mit Vorschlägen)
- Einzel-/Gemeinkosten + Zuschlagskalkulation
- Lebenszyklus: Produkt (Normstrategie) + Kunde (Beziehungsphasen) getrennt
- Auftrags-Lebenszyklus (Order-to-Cash) mit Engpass
- Kostenstellenrechnung (BAB, Umlage, Zuschlagssätze, Plan/Ist, Center-Typen)

## 🆕 Neue Wünsche
- [x] **Globale Suche oben rechts** nach Berichten/KPIs mit Sprung dorthin ✅
- [x] **Admin-Bereich** (eigener verwalteter Bereich): Logo hinterlegen/jederzeit
      tauschen (Themes: Black Week, Weihnachten, Ferien …), App-Branding ✅
- [x] **Events/Aktionen** mit Zeitraum, Produkten, Mechanik & Kosten →
      **Wirksamkeitsanalyse** (Mehrumsatz, Ladenhüter-Abbau, ROI der Werbung) ✅
- [x] Dezenter „Business Controller"-Urheberhinweis (Footer) ✅
- [x] **Beispielberichte** als HTML-Übersicht (11 echte Berichte) ✅
- [x] **Nutzungs-Statistik** (Klick-Tracking je Bericht, Ranking/Verlauf) — nur Admin ✅

## 🔜 Offen / geplant (priorisiert)
- [x] **Kostenträgerrechnung / Kalkulation** — Division, Äquivalenzziffern, Zuschlag; Selbstkosten + Produktergebnis ✅
- [x] **Maschinenstundensatz & Kuppelkalkulation** (Tabs in der Kalkulation, getestet) ✅
- [ ] **Ergebniskonto / GuV als Konten-Darstellung** (T-Konten, Gesamtkostenverfahren)
      mit unseren Werten — reportingtauglich, nicht überfrachtet. (Bild 0832)
- [ ] **Prozess-/Ablaufdarstellung der KLR** mit Werten als „roter Faden"/Inhaltsverzeichnis. (Bild 7d83)
- [x] **Anwender-Doku in der App** ("Wissen/Doku"-Seite, durchsuchbar, Sprung in Berichte) ✅
- [x] **Kalkulatorik echt verbuchen**: vollständige Abgrenzungsrechnung (BÜB) — neutrale
      Abgrenzung + kalk. Kosten in KLR/Betriebsergebnis; Überleitung konsistent gemacht ✅
- [x] **Weitere Lebenszyklen**: Anlagen/Asset, Lieferant, Bestands-/Artikel-Gängigkeit,
      Mitarbeiter (HR), Forderungs-Aging, Technologie-Reifegrad/F&E-Portfolio ✅
- [x] **Lebenszyklus → Strategie-Empfehlungen** automatisch (Produkt & Kunde) + Übernahme
      als Maßnahme mit quelle-Tag/Nachverfolgung ✅
- [ ] **Deckungsbeitragsrechnung** mehrstufig (Fixkostendeckung)
- [x] **KPI-Editor: Formel/Abhängigkeiten** — abgeleitete KPIs aus Formeln (sicherer
      Parser, Live-Vorschau), werden mitberechnet & überall nutzbar ✅
- [ ] **Profitcenter-Ergebnisrechnung**, Abweichungsanalysen (DB/Erlös), Segmentbericht
- [ ] **CI-Lauf grün halten** / ggf. PR eröffnen und überwachen

## 🧭 Session-Themen (Simulation, Szenario, Planung, Designer) — offen
**Szenario-Planung** (Engine `core/szenarioEngine.js` steht, UI offen)
- [ ] UI mit mehreren Stellhebeln + **Kernaussage** (Größen & wichtigste Auswirkungen erklärt, je Effekt)
- [ ] Szenarien **speichern · vergleichen · Best-/Worst-Range**
- [ ] **Kumuliert-Haken** (Effekt über N Perioden, nur Stromgrößen)

**Designer — Kennzahl-Ansichten (Phase 2)**
- [ ] Ansichten je Kennzahl in den Eigenschaften: Menge/Summe · YTD/MTD/QTD · VJ · Δ VJ (abs/%) · Ø · kumuliert · Forecast · Plan/Abweichung · Anteil — **Label passt sich an**
- [ ] **Gleitender Ø**: Default 3 Monate, einstellbar in Eigenschaften ODER Filter
- [ ] **„Seiten-Filter ignorieren"** pro Kennzahl in den Eigenschaften

**Plankalender / DimKalender** (in Arbeit)
- [ ] Per-Kategorie-Tageskalender (Fixkosten/Filiale/Onlineshop …): Wochentagsmuster, Feiertage (0), kurze Tage (0,5)
- [ ] Monats-Planwert taggenau verteilen; Integration Tagesreporting (taggenaue Ist + Monatshochrechnung)

**Warenfluss / Vorschau** (Grundgerüst steht)
- [ ] Echte Orderbuch-/Auftragsdaten (Einkauf/Vertrieb nach Lieferdatum) statt synthetisch
- [ ] Liquidität an Forderungs-Fälligkeiten & Bestell-Zahlungen koppeln; Plan vs. Orderbuch trennen

**Faire DB / Sponsoring** (Bericht steht)
- [ ] Assistent-Anbindung „bereinigter DB ohne Sponsoring"; **Sponsoring-Budget-Tracking** (verbraucht/Limit/Ampel); Sonderfälle in Verkaufsstatistik-DB-Spalte

**Assistent / Lokale KI**
- [ ] Optionaler lokaler LLM-Modus (Ollama, abschaltbar); globalen Filter respektieren; Synonyme erweitern

**Besucherdaten / Filial-Frequenz** (neuer Wunsch)
- [ ] Besucher-/Frequenzdaten je Filiale erfassen und im Reporting analysieren
- [ ] Mehrwerte: **Conversion (Käufe ÷ Besucher)**, **Umsatz je Besucher**, Bon-Quote, Stoßzeiten/Heatmap (Tag/Stunde), **Personalbedarf vs. Frequenz**, Wetter-/Aktions-Korrelation, Vergleich Filialen & vs. Onlineshop-Traffic
- [ ] An Plankalender koppeln (Frequenz je Öffnungstag) und in die Kausal-/Szenario-Logik aufnehmen (Frequenz → Umsatz)

**Diagramme**
- [x] Farbwechsel Ist→Plan im Warenfluss-Chart
- [ ] Farbwechsel Ist→Plan auf weitere Charts (Forecast-Brücke, Verlauf)

## 🎯 Vision: vollständiges Reporting (Budget · Kommentierung · OnePager bis Ebene 5)
- [x] **Einheitliche Kommentierung** auf allen Berichten mit Exec-Kopf (`<Kommentar>` im ExecKopf, Bericht-ID via Nav-Kontext). Offen: Kommentar je KPI/Knoten & im Roten Faden, Aufgaben-Rollup
- [x] **Engine-Vereinheitlichung**: whatif.js → szenarioEngine.js (eine Wahrheit)
- [ ] **OnePager je Ebene** (1–5) mit Kernaussage, Ampel, Qualitätskennzahlen und Drill bis Ebene 5 — einheitliche Vorlage
- [ ] **Budgetierung end-to-end / vereinfachte Planung**: FactPlan füllen, **alle KPIs vom Budget ableiten**, Plan/Ist/Forecast je KPI
  - [ ] **Einfache Erfassung weniger Treiber** → alle KPIs werden daraus abgeleitet (Kausalmodell + Verhältniszahlen)
  - [ ] **Prozent-Vorschläge aus der Vorsaison** (Default = Vorjahr ±%, editierbar)
  - [ ] **Rückwärtsrechnung über Verhältnisse**: z. B. Delta(Auftragseingang↔Umsatzerlöse)=x% → aus geplantem Auftragseingang den Umsatz (und umgekehrt)
  - [ ] **AEB — Auftragseingang bereinigt** (ohne stornierte Aufträge & verlorene Angebote) als belastbare Planbasis; neue Kennzahl + Felder
  - [ ] **Statuswechsel-Datum** (wie Buchungsdatum): Angebot→Auftrag→storniert/geliefert mit Datum je Wechsel, anzeig-/filterbar (DWH: FactAuftrag um Statushistorie erweitern)
- [ ] **Rolling Forecast** (rollierend 12M) + dessen Auswirkungen auf alle Plan-KPIs (nutzt Kausalmodell/Szenario)
- [ ] **Werbebudget-Bedarf laut Plan**: wie viel Marketing (über ROAS/CAC) nötig, um Umsatz-/Ergebnisziele zu erreichen (inverse Rechnung)
- [ ] **Event-Planung**: geplante Events, Vorher-Wirkung (Wirksamkeitsanalyse `events` ausbauen) und Erwartung/Forecast
- [ ] **GA-Berichte** ausbauen + **Webshop-Analyse** (Funnel, AOV, Warenkorbabbruch, Onsite-Suche, neu/wiederkehrend) — Schema (FactWebSession/FactWebFunnel) steht bereits

## 🛟 Service-/Retoure-Cockpit & Zoll-Traceability (neuer Wunsch, hoher Wert)
**Service-/Retoure-Cockpit (360°-Sicht für den Telefon-Support)**
- [ ] Suche nach **BikeID / Rahmennummer / Gabelnummer / Auftrag / Kunde**
- [ ] Zeigt: Modell + alle **Seriennummern** (Rahmen/Gabel/Motor/Akku), Kaufdatum,
      **Garantie/Gewährleistung-Restlaufzeit**, Kunde/Händler, Status (aus Status-Journal),
      Service-/Reklamations-/Retouren-Historie, Ersatzteilverfügbarkeit
- [ ] Schnellaktionen: Retoure/Reklamation/Serviceauftrag anlegen

**Zoll / Serien-Traceability (Nachweis für Zollvergünstigung)**
- [ ] Bewegungsjournal auf **Serien-/Chargen-Ebene** mit **Wareneingangs-/Zollnummer + Ort + Status**
- [ ] Pro Zoll-/WE-Nummer (z. B. 100 Rahmen) **Mengen-Verbleib**: X auf Lager (Fach), Y in Produktion,
      Z beim Kunden, W verschrottet, V retour — lückenlos, Summe = Eingangsmenge
- [ ] **Audit-Trail** je Stück/Charge für den Zollnachweis (aktive Veredelung/Präferenz/Zolllager)
- [ ] DWH: FactSerienbewegung (Serie/Charge, Zollnummer, OrtKey, Status, Datum) + DimOrt/Fach

## 💡 Claudes Empfehlungen (eigene Ideen, würde ich später umsetzen)
Priorisiert nach Nutzen/Aufwand — alle lokal/ohne KI machbar:
- [ ] **Treiberbaum-Visualisierung** des Kausalmodells: interaktiver Wirkungsbaum, Klick auf eine Kennzahl zeigt Treiber & Effekte (macht die 80+ Verkettungen sichtbar/prüfbar).
- [ ] **Sensitivität / Tornado-Diagramm**: jeder Stellhebel ±10 % → gerankt, welcher das EBIT am stärksten bewegt. Top-Hebel auf einen Blick.
- [ ] **Bandbreiten-/Monte-Carlo-Simulation**: Verteilungen auf den Schlüsseltreibern → Konfidenzband für den EBIT-/Stichtags-Landepunkt (deckt „Best/Worst-Range" datenbasiert ab).
- [ ] **Forecast-Alerts**: Stichtags-Hochrechnung unter Plan → automatischer Alert + Vorschlag passender Gegenmaßnahmen (nutzt Maßnahmen-Engine).
- [ ] **Kalibrierung der Kausalfaktoren aus der Historie** (einfache Regression) statt Schätzwerte; je Kante Quelle/Verantwortlicher + Versionierung (Audit der Annahmen).
- [ ] **Rollierender 12-Monats-Forecast** (nicht nur bis Jahresende/Stichtag).
- [ ] **Szenario-/Vergleichs-Export** (Excel/PDF) und Teilen mit Berechtigung.
- [ ] **Kommentar-/Annotations-Layer** auf Berichten (Controller-Notizen, mit Verlauf).
- [ ] **Echte Datenanbindung** (MSSQL/DWH) über den vorhandenen SQL-Vertrag; Daten-Qualitäts-Gate vor jeder Hochrechnung.
- [ ] **Konsistente Zeitintelligenz-Schicht** (eine Engine für YTD/MTD/VJ/Ø/kumuliert/gleitender Ø), die Designer, Tagesreporting und Forecast gemeinsam nutzen.

## Zuletzt ergänzt
- Lernpfad (modulare Lektionen, Fortschritt, Zusammenhänge) ✅
- Deckungsbeitragsrechnung (ein-/mehrstufig + Typologie) ✅
- Ergebnisrechnung (GKV, Staffel + T-Konto) ✅
- Kostenträgerrechnung/Kalkulation, KLR-Ablauf, BAB (Datenarten), Onboarding ✅

## Lernpfad — Ausbauideen (offen)
- [x] Quizfragen / Wissens-Check je Lektion (mit Fortschritt) ✅
- [ ] Mehr Lektionen je Kapitel
- [ ] Interaktive Ablaufdiagramme (klickbare Prozessgrafik der Zusammenhänge)
- [x] Rollenbasierte Lernpfade (je Rolle anderer Schwerpunkt, Fokus-Filter) ✅
- [x] Zertifikat/Abschluss bei 100 % (Lektionen + Wissens-Checks, druckbar) ✅

## Hinweise
- Jede Funktion: Build grün + Tests; Persistenz via localStorage, später DWH/Backend.
- Reihenfolge wird je nach deinem Fokus angepasst.
