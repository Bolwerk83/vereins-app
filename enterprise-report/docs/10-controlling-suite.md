# 10 · Controlling-Suite & digitales Controlling

Ausbau des Berichtsbaums um sechs Controlling-Hauptbereiche — das fachliche
Rückgrat, mit dem das Controlling (fast) jede Frage beantworten kann.

## Die neuen Hauptbereiche (Ebene 2)

| Bereich | Code | Schwerpunkt | Leit-KPIs |
|---------|------|-------------|-----------|
| Kosten- & Leistungsrechnung | `KLR` | Kostenarten/-stellen/-träger, Stückkosten | Herstellkosten/Rad, Gemeinkostenquote, Gesamtkosten |
| Absatz- & Umsatzprognose | `FC` | rollierender Forecast, Prognosegüte, Orderbuch | Absatz-/Umsatzprognose, Prognosegüte |
| Umsatz-, Kosten- & Erfolgsplanung | `PLAN` | Budget & Plan/Ist | Umsatz-/EBIT-Zielerreichung, Kostendisziplin |
| Produktionsplanung | `PP` | Kapazität, Schichtplan, Programmabgleich | Kapazitätsauslastung, Plan-Erfüllung, Liefertermintreue |
| Bestands- & Supply-Chain-Controlling | `SCC` | Bestände im Zusammenspiel EK/PR/VK | Lagerumschlag, Lieferfähigkeit, Überbestand |
| Finanzbuchhaltung & Abschluss | `FIBU` | Monats-/Jahresabschluss, Bilanz, Rückstellungen | Betriebsergebnis, EK-Quote, Abschlussdauer |
| Investitions- & Liquiditätsplanung | `LIQ` | CapEx, Liquiditätsvorschau, Cashflow | Operativer Cashflow, Freie Liquidität, Budgettreue |
| Vertriebscontrolling | `VC` | Kanal-/Kundenprofitabilität, Rabatte, Vertriebskosten | Vertriebskostenquote, Rabattquote, Neukundenanteil |
| Personalcontrolling | `PC` | Produktivität, Fluktuation, Arbeitszeit (OLS) | Personalkostenquote*, Umsatz/FTE, Krankenstand |

| Risiko- & Forderungscontrolling | `RIS` | DSO/Aging, Ausfall, Klumpenrisiko | DSO, Überfälligkeitsquote, Forderungsausfall |
| Nachhaltigkeits- & ESG-Controlling | `ESG` | CO₂, Energie, Kreislauf/Soziales | CO₂/Rad, Recyclingquote, Ökostromanteil |
| Treasury & Zins-/Währungsrisiko | `TRE` | Verschuldung, Zins-, FX-Risiko | Net Debt/EBITDA, Zinsdeckung, Hedge-Quote |

*Personalkostenquote ist per Object-Level-Security auf GF/HR/FIN beschränkt (greift auch im Self-Service-BI).

## Maßnahmen-Modul (Eingabe · KI-Empfehlung · Verwaltung)

`src/modules/massnahmen` + `src/core/massnahmen.js`. Drei Funktionen:

- **KI-Empfehlung (SMART):** Knopf „Auswerten (wie ein Controller)" — wertet die
  auffälligen KPIs (rot/amber) aus und schlägt Maßnahmen nach **SMART** vor:
  **S**pezifisch (Titel), **M**essbar (KPI + Zielwert), **A**chievable
  (Weg/Begründung), **R**elevant (Bezug zum Unternehmensziel), **T**erminiert
  (Frist). Engine wie beim BI: `heuristik` offline / `claude` via `/api/massnahmen`.
- **Direkt aus dem Bericht:** Im Management Report startet der Knopf
  „🎯 Controller-Auswertung (SMART)" die Bewertung für genau diesen Bericht.
- **Eingabe:** eigene Maßnahmen erfassen (Titel, Bereich, Hebel, Owner, Frist, Aufwand).
- **Verwaltung & Tracking:** Liste mit Owner, **Fälligkeit**, **Fortschritt %**,
  **realisierter Wirkung** und Status (offen · in_arbeit · erledigt · verworfen);
  **Fälligkeits-Alerts** für überfällige Maßnahmen. Persistent (LocalStorage; später
  MSSQL-Tabelle). Object-Level-Security greift — geschützte KPIs erzeugen für
  unberechtigte Rollen keine Empfehlung.

## Controlling-Instrumente (Reiter „Instrumente")

`src/modules/controlling-instrumente` + `src/core/instrumente.js`:
- **BCG-Portfolio** — Produktgruppen nach Marktwachstum × relativem Marktanteil
  als Star / Cash Cow / Question Mark / Poor Dog, mit Strategieempfehlung.
- **Break-even-Analyse** — Fixkosten ÷ DB-Quote → Gewinnschwelle + Sicherheitsstrecke.
- **Deckungsbeitrags-Ranking** je Produktgruppe.
- **Investitionsrechnung** — Kapitalwert (NPV @ WACC), interner Zinsfuß (IRR) und
  statische Amortisation je Projekt, mit Vorteilhaftigkeits-Entscheidung.
- **Szenarioanalyse** — Best/Base/Worst-EBIT bei ± Variation der zwei Haupthebel
  (Volumen, Wareneinsatzquote).
- **Soll-Ist-Abweichungsbrücke** — Überleitung Plan-EBIT → Ist-EBIT
  (Umsatz-/Mengeneffekt + Kosten-/Margeneffekt).

Jeder Bereich hat Themenbereiche (E3), Detailberichte (E4) und Historie (E5)
wie der Rest des Baums — gleiche Engine, gleiche Rechte, gleiches Design.

## Abgeleitete KPIs & bereichsübergreifende Abhängigkeiten

Der rote Faden zieht sich durch die ganze Suite — abgeleitete Kennzahlen
verknüpfen die Bereiche **explizit** (dokumentiert in `kpiRegistry.js`):

```
herstellkostenJeRad   = herstellkosten ÷ produktionsmenge        (KLR)
gemeinkostenquote     = gemeinkosten ÷ gesamtkosten              (KLR)
umsatzZielerreichung  = nettoumsatz ÷ umsatzplan                 (PLAN ← VK)
ergebnisZielerreichung= ebit ÷ ebitPlan                          (PLAN ← FIN)
kostendisziplin       = kostenplan ÷ gesamtkosten                (PLAN ← KLR)
kapazitaetsauslastung = produktionsplan ÷ kapazität             (PP)
planErfuellung        = produktionsmenge ÷ produktionsplan       (PP ← KLR)
lagerumschlag         = wareneinsatz ÷ lagerbestand              (SCC ← FIN/LOG)
betrieblichesErgebnis = handelsr. Ergebnis − neutrales Ergebnis  (FIBU, Abgrenzung)
```

Die **abweichende Controlling-Darstellung** ist als echte
**Abgrenzungsrechnung** abgebildet: Die FiBu liefert das handelsrechtliche
Ergebnis, das Controlling bereinigt um neutrale Posten → Betriebsergebnis
(= EBIT). Sichtbar im Detailbericht „Abgrenzungsrechnung".

## Querchecks — die Vertrauensschicht (`core/validierung.js`)

Bereichsübergreifende Abstimm- und Plausibilitätsregeln, sichtbar im Reiter
**Querchecks** (Topbar zeigt die Zahl harter Abstimmfehler):

- **hart** (muss aufgehen): `Gesamtkosten = Nettoumsatz − EBIT`,
  `Betriebsergebnis = EBIT`, `DB I = Umsatz − Wareneinsatz`,
  `Produktionsplan ≤ Kapazität`, `Eigenkapital ≤ Bilanzsumme` …
- **weich** (Plausibilität): Wareneinsatzquote im Band 50–70 %,
  Umsatzprognose ≥ Auftragsbestand …

So beantwortet das Tool automatisch: *„Stimmen die Zahlen untereinander?"*
und *„Wo muss ich hinschauen?"* — die Grundlage, um Zahlen zu verantworten.

## Fahrplan: vom altmodischen zum digitalen Controlling

| Stufe | Was es bringt | Status |
|-------|---------------|--------|
| **Single Source** | Alle KPIs einmal definiert, eine Wahrheit, ein Design | ✅ |
| **Drill-down 5 Ebenen** | Von GF bis Beleg, mit Historie | ✅ |
| **Plan/Ist/Forecast** | Abgleiche über KLR/PLAN/PP/FC | ✅ |
| **Querchecks** | Automatische Datenvalidierung & Abstimmung | ✅ |
| **Self-Service BI** | Frage in Sprache → Maßnahmen aus Controller-Sicht | ✅ |
| **Echte Daten (MSSQL)** | SQL je KPI, Backend angebunden | ⏳ du lieferst SQL |
| **Maßnahmen-Tracking** | Maßnahme → Owner → Termin → Wirkung verfolgen | geplant |
| **Kommentar/Storyline** | je KPI Kommentar + Management-Narrativ | geplant |
| **Alerts** | rote Ampel/Quercheck-Fehler proaktiv melden | geplant |

### Wie dich das zum „Head of Controlling" trägt
- **Fast jede Frage** ist im Baum oder per Self-Service-BI beantwortbar.
- **Maßnahmen** kommen mit Wirkung (Ergebnis & Liquidität) und Aufwand.
- **Erklärungen** liefern KPI-Beschreibung + Abhängigkeit + Abgrenzung.
- **Validierung & Querchecks** sichern ab, dass die Zahlen tragen.

Nächste sinnvolle Schritte: echte MSSQL-Daten anbinden, dann
Maßnahmen-Tracking + Alerts als eigene Module ergänzen.
