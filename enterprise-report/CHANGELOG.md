# Changelog

Alle nennenswerten Änderungen an diesem Projekt werden hier dokumentiert.
Das Format orientiert sich an [Keep a Changelog](https://keepachangelog.com/de/),
die Versionierung an [SemVer](https://semver.org/lang/de/).

## [1.0.0] — 2026-06-25

Erste vollständige Version des KI-freien (regelbasierten) Enterprise-Reporting-
und Controlling-Systems. Alle Kennzahlen, Szenarien und Empfehlungen sind
deterministisch aus den Daten abgeleitet — keine generative KI im Datenpfad.

### Berichte & Cockpits
- Berichtsbaum (5 Ebenen), Self-Service BI, Querchecks und Abstimmbrücken.
- Finanz- & Risiko-Cockpit (HGB/IFRS), Profitcenter-Ergebnis, Segment-/Konzernbericht.
- Kosten- & Leistungsrechnung: Einzel-/Gemeinkosten, Kostenstellen, BAB, Kalkulation,
  Deckungsbeitrag, kalkulatorische Kosten, Abgrenzungsrechnung.
- Operative Statistiken: Verkauf, Fahrrad, Einkauf, Produktion, Versand, Bestand,
  Forderungs-Aging, Gutschriften & Retouren.
- **Service- & Zoll-Cockpit**: 360°-Seriensicht (Rahmen/Gabel/Motor/Akku) und
  Zoll-Mengenverbleib mit exaktem Mengenabgleich je Charge.
- **Budget-Cockpit**: Budget vs. Ist/Forecast inkl. Ziel-Rückwärtsrechnung.

### Artikel-Journey (Mini-ERP)
- Artikelkarte mit Bild (falls hinterlegt), Preis-/Absatz-/Lagerentwicklung,
  Bestellungen, Produktion, Stückliste, Marketingaktionen, Bewertungen,
  Lebenszyklus und Journey-Timeline mit rotem Faden.

### Hierarchien & Dimensionen
- Profitcenter als vollständiger Hierarchiebaum bis zur 8. Ebene (Konzern → Beleg)
  mit exakter Bottom-up-Aggregation.
- Zeit als Dimension mit mehreren Kalender-Hierarchien (WJ/KJ, Monat/KW/Quartal)
  und Datumsart-Filter (Beleg-/Bestell-/Lieferdatum).
- Eigene Hierarchiebäume im Report-Designer anlegbar.

### Rollen, Rechte & Freigaben
- Standard-Rolle plus separater Login (Rolle + Name + Demo-Passwort) für mehr Berichte.
- Berichts-Freigabe: ganze Ordner oder einzelne Berichte je Rolle sowie an einzelne Kollegen.

### Assistent (regelbasiert)
- Textuelle Antworten mit Synonym-Index, Rückfrage-Logik bei Mehrdeutigkeit
  (mit Empfehlungen) und Folgefragen-Kontext.
- Lern-Protokoll der Eingaben mit Insights-Auswertung (Top-Fragen, Wissenslücken).
- Modell mit 200 simulierten Personas erweitert (Trefferquote ~92 %).

### UX & Barrierefreiheit
- Rot-Grün-sichere Statusdarstellung (Farbe + Symbol ✓/!/✕ + Text) einheitlich überall.
- Command-Palette (⌘K / Strg+K), nicht-blockierendes Onboarding-Banner,
  saubere Druck-Seitenumbrüche.

### Technik & Betrieb
- Optimistisches Sperren in allen Tabellen (Version + Audit + Konflikt-Dialog
  mit Überschreiben/Zusammenführen/Abbrechen).
- Server-Cache mit TTL und Single-Flight, vergrößerter MSSQL-Connection-Pool
  für ~200 gleichzeitige Nutzer.
- Schema 1.1.0 (RowVersion/GeaendertVon/-Am in allen Tabellen, DimProdukt.BildUrl).
- 730+ deterministische Tests (node --test), grün.
