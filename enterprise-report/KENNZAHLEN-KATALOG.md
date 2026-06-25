# Kennzahlen-Katalog — Abgleich mit dem KPI-Buch

Stand der App: **123 Kennzahlen** in `src/core/kpiRegistry.js`, jede mit
Abhängigkeiten (`abhaengig`) und laienverständlicher Erklärung in
`src/core/kpiLaienGlossar.js` (Definition + Beispiel).

**Legende:** ✅ vorhanden · 🟢 neu (jetzt rechenbar angelegt) · 🟡 rechenbar, sobald
Rohdaten da · 🔴 Rohdaten fehlen (Quelle genannt). „id" = Schlüssel in der Registry.

> Duplikate bewusst NICHT doppelt angelegt: **Bruttomarge** = `dbQuote`,
> **Materialaufwandsquote** = `wareneinsatzquote`, **Eigenkapitalrentabilität** =
> `eigenkapitalrendite`, **Umsatz pro Mitarbeiter** = `umsatzJeFTE`,
> **Cashflow** = `operativerCashflow`, **Lieferbereitschaftsgrad** = `lieferfaehigkeit`.

---

## 1. Finanzkennzahlen

| Buch-Kennzahl | Status | id / Hinweis |
|---|---|---|
| Nettoumsatz / Bruttoumsatz | ✅ | `nettoumsatz`, `bruttoumsatz` |
| EBIT / EBITDA | ✅ | `ebit`, `ebitda` |
| EBITDA-Marge | 🟢 | `ebitdaMarge` = EBITDA ÷ Umsatz |
| Umsatzrendite (RoS) | 🟢 | `umsatzrendite` = EBIT ÷ Umsatz |
| Deckungsbeitrag / Deckungsgrad | ✅ | `db1`, `dbQuote` |
| Bruttomarge | ✅ (=`dbQuote`) | Rohertrag ÷ Umsatz |
| Eigenkapital / Eigenkapitalquote | ✅ | `eigenkapital`, `eigenkapitalquote` |
| Fremdkapital / Fremdkapitalquote | 🟢 | `fremdkapital` = Bilanz − EK; `fremdkapitalquote` |
| Verschuldungsgrad | 🟢 | `verschuldungsgrad` = FK ÷ EK |
| Kapitalumschlag | 🟢 | `kapitalumschlag` = Umsatz ÷ Bilanzsumme |
| NOPAT | 🟢 | `nopat` = EBIT × (1 − 30 %) |
| Investitionsquote | 🟢 | `investitionsquote` = Invest ÷ Umsatz |
| ROCE / RoI | ✅ | `roce` |
| Eigenkapitalrendite (RoE) | ✅ | `eigenkapitalrendite` |
| Cashflow / Operativer Cashflow | ✅ | `operativerCashflow` |
| Cash Conversion Cycle | ✅ | `cashConversion` |
| Liquide Mittel / Freie Liquidität | ✅ | `liquideMittel`, `freieLiquiditaet` |
| Working Capital / Working Capital Ratio | 🔴 | braucht **kurzfristige Verbindlichkeiten** (FiBu: Kreditoren/Bilanz-Gliederung) |
| Liquidität 1./2./3. Grades | 🔴 | braucht **kurzfr. Verbindlichkeiten** + Aufteilung Umlaufvermögen (FiBu-Bilanz) |
| Anlagevermögen / Umlaufvermögen / Anlagequote | 🔴 | braucht **Bilanz-Gliederung** Aktiva (FiBu/Anlagenbuchhaltung) |
| Anlagen-Deckungsgrad / Anlagenintensität | 🔴 | wie oben (Anlagevermögen) |
| Abschreibungsquote / Amortisationszeit | 🔴 | braucht **Abschreibungen** + Investitionsdetail (Anlagenbuchhaltung) |
| Zinsdeckungsgrad | ✅ | `zinsdeckung` |
| Nettoverschuldung / Net Debt/EBITDA | ✅ | `nettoverschuldung`, `nettoverschuldungEbitda` |
| WACC / Beta-Faktor / Kapitalwert / Interner Zinsfuß / EVA / Ewige Rente / Unternehmenswert / Substanzwert | 🔴 | **Bewertungsmodell**: Kapitalkostensatz, Cashflow-Reihen, Marktdaten (Treasury/Beratung). Als eigener „Unternehmenswert"-Rechner umsetzbar |
| Kapitalumschlag/-schöpfungsquote, Sicherheitskoeffizient, Substanzwert | 🟡/🔴 | teils aus Bilanz ableitbar, sobald Bilanz-Gliederung vorliegt |

## 2. Logistik — Lager

| Buch-Kennzahl | Status | id / Hinweis |
|---|---|---|
| Lagerbestand / -wert | ✅ | `lagerbestand` |
| Umschlagshäufigkeit (Turn Rate) | ✅ | `lagerumschlag` |
| Lager-/Bestandsreichweite (Days on Hand) | ✅ | `reichweite` |
| Lieferbereitschaftsgrad / Servicegrad | ✅ | `lieferfaehigkeit` |
| Überbestand | ✅ | `ueberbestand` |
| GMROI | 🟢 | `gmroi` = Rohertrag ÷ Lagerbestand |
| Rückstandsquote / Out-of-Stock-Rate | 🟡 | = 100 − `lieferfaehigkeit`; exakt aus **Auftrags-/Bestandsabgleich** (WaWi) |
| Eiserner Bestand / Sicherheitsbestand | 🟡 | aus **Lager-Stammdaten** (Min-/Meldebestand) — teils in `lager`-Modul vorhanden |
| Retourenquote | ✅ | `retourenquote` |
| Cross-Docking-Quote, Lagerverlust, Kommissionierfehler, Mitarbeiterproduktivität, Lagerauslastung, Flächen, Logistikkosten | 🔴 | **WMS/Lager-Bewegungsdaten** (Kommissionier-, Einlager-, Fehlerbuchungen) — Quelle: WMS/Lagerverwaltung |

## 3. Logistik — Transporte

| Buch-Kennzahl | Status | Datenherkunft |
|---|---|---|
| Transportkosten/-auftrag, Gewicht/Auftrag, Transportmittelauslastung, Kraftstoff/100 km, CO₂/km, Ausfallzeiten, Umschlichtungsquote | 🔴 | **Transport-/Frachtsystem (TMS) bzw. Carrier-Daten**: Sendungen, Gewichte, Kosten, Fahrzeug-Telematik. CO₂ teils aus `co2ProRad`/`co2Gesamt` ableitbar |

## 4. Produktion

| Buch-Kennzahl | Status | id / Hinweis |
|---|---|---|
| OEE / Auslastung / Ausschussquote | ✅ | `auslastung`, `ausschuss` (OEE als Erweiterung) |
| Durchlaufzeit / mittlere/gewichtete DLZ / Varianz | 🟡 | aus **Fertigungsaufträgen** (Start/Ende je Auftrag) — Modul `machbarkeit` rechnet DLZ bereits |
| First Pass Yield / Nacharbeitsquote / Reklamationsquote | ✅ | `firstPassYield`, `nacharbeitsquote`, `reklamationsquote` |
| Termintreue / Liefertermintreue | ✅ | `liefertermintreue` |
| Fließgrad / Flussgrad / Auslastungsmenge | 🔴 | **Fertigungs-BDE** (Rüst-/Bearbeitungszeiten, Liegezeiten) |

## 5. Vertrieb / Marketing

| Buch-Kennzahl | Status | id / Hinweis |
|---|---|---|
| Marktanteil | 🔴 | braucht **Marktvolumen** (Branchendaten, z. B. ZIV) — Quelle vorhanden (`Marktdaten ZIV`), nur verknüpfen |
| Ø Verkaufspreis / Ø Bon / Teile pro Kunde | 🟡 | aus **Verkaufspositionen** (WaWi/Kasse): Umsatz ÷ Menge bzw. ÷ Bons |
| Umsatz pro Mitarbeiter | ✅ | `umsatzJeFTE` |
| Umsatz pro m² | 🔴 | braucht **Verkaufsfläche je Filiale** (Stammdaten Filialen) |
| Umsatz pro Stunde / Produktivität | 🔴 | braucht **Arbeitsstunden** (Zeiterfassung) |
| Conversion-Rate | ✅ | `conversionRate` |
| CAC / Kundenakquise-Kosten | ✅ | `cac` |
| ROAS / Marketingkosten(quote) | ✅ | `roas`, `marketingkosten`, `marketingkostenquote` |
| Churn Rate / Neukundenanteil | 🟡/✅ | `neukundenanteil`; Churn aus **Kundenhistorie** (WaWi/CRM) |
| Kundendeckungsbeitrag / Kundenwert / KUR / Lost Order Rate / Empfehlungsquote / Sales Velocity / Win Cycle | 🔴 | **CRM/Opportunity-Daten** (Angebote, Stufen, Verweildauer, Kosten je Besuch) |
| Kundenzufriedenheit / NPS | ✅ | `nps` |

## 6. Einkauf

| Buch-Kennzahl | Status | id / Hinweis |
|---|---|---|
| Liefertreue / Termintreue & Fehllieferquote | ✅ | `liefertreue` |
| Einkaufsvolumen | ✅ | `einkaufsvolumen` |
| Ø Lagerbestand / Lagerumschlag / Lagerreichweite | ✅ | `lagerbestand`, `lagerumschlag`, `reichweite` |
| Zahlungsziel / Lagerzinskosten | 🟡 | aus **Kreditoren-Zahlungsbedingungen** (FiBu) |
| Abverkaufsquote (AVG) / Block-Order / SKU | 🔴 | **Artikel-Bewegungen** je SKU (WaWi) — Detaillisten teils vorhanden |
| GMROII | 🟢 | `gmroi` |

## 7. E-Commerce / Webshop

| Buch-Kennzahl | Status | Datenherkunft |
|---|---|---|
| Conversion Rate / AOV / Click-Through / Bounce / Visits / Unique Visitors / Wiederkehrer / Visit Depth / Domain Authority | 🔴 | **Web-Analytics (GA4 / Shop-Tracking)** — Modul `google`/`marketing` ist der Andockpunkt; `conversionRate` vorhanden |
| CPC / CPO / Cost per Click/Order | 🔴 | **Ad-Plattformen (Google/Meta Ads)** — teils über `roas`/`cac` abgedeckt |
| Retouren-Quote (E-Com) | ✅ | `retourenquote` |
| Eingangs-/Waren-/Lagerspanne, Kalkulationsfaktor, Rohertragsmarge | 🟡 | aus **Kalkulationsdaten** (EK/VK je Artikel) — Modul `kalkulation` |
| E-Mail: Delivery/Open/Click/Opt-in/Abmelderate | 🔴 | **E-Mail-Tool (Newsletter-System)** |

## 8. Personalwesen (HR)

| Buch-Kennzahl | Status | id / Hinweis |
|---|---|---|
| Personalaufwand / Personalkostenquote / -intensität | ✅ | `personalkosten`, `personalkostenquote` |
| Fluktuation / Frühfluktuation / Abwanderungsrisiko | ✅/🟡 | `fluktuation`; Detailquoten aus **HR-System** (Eintritte/Austritte) |
| Krankenstand / Überstundenquote | ✅ | `krankenstand`, `ueberstundenquote` |
| Ø Alter / Frauenquote / Schwerbehinderten-/BEM-/Aussteuerungsquote / Urlaubsverteilung / Beschäftigungsgrad / Personalbedarf | 🔴 | **HR-Stammdaten** (Alter, Geschlecht, Schwerbehinderung, Fehlzeiten) — personenbezogen, daher eigenes HR-Modul mit Zugriffsschutz |

## 9. IT

| Buch-Kennzahl | Status | id / Hinweis |
|---|---|---|
| Server Uptime / Downtime / Shop-Verfügbarkeit | ✅ | `shopVerfuegbarkeit` |
| Mean Time to Repair (MTTR) / Fehlerhäufigkeit / Fehlermarge / Anteil neue HW/SW / Betreuungsquote IT | 🔴 | **IT-Service-Management (Ticketsystem/Monitoring)**: Incidents, Wiederherstellzeiten, Asset-Inventar |

---

## Wie wir an die fehlenden Daten kommen (Zusammenfassung)

1. **FiBu / Bilanz-Gliederung** (Anlage-/Umlaufvermögen, kurzfr. Verbindlichkeiten,
   Abschreibungen) → schaltet *Working Capital, Liquiditätsgrade, Anlagen-Deckungsgrad,
   Abschreibungsquote* frei. Quelle: dein MSSQL-Hauptbuch (`sql/*.kpi.sql`).
2. **WaWi / Verkaufspositionen** (Bons, Mengen, Kunden) → *Ø Bon, Ø VK-Preis, Teile/Kunde,
   Churn, Abverkaufsquote*.
3. **WMS / Lagerbewegungen** → *Kommissionierfehler, Cross-Docking, Lagerverlust, Auslastung*.
4. **TMS / Carrier** → *Transport-Kennzahlen, CO₂/km, Fahrzeugauslastung*.
5. **Web-Analytics (GA4) + Ad-Plattformen** → *Webshop- & E-Mail-Kennzahlen, CPC/CPO*.
   Andockpunkt: bestehendes `google`/`marketing`-Modul.
6. **HR-System** (zugriffsgeschützt) → *Alters-/Frauen-/Schwerbehindertenquote, Fehlzeiten*.
7. **IT-Ticketsystem/Monitoring** → *MTTR, Fehlerhäufigkeit, Asset-Anteile*.
8. **Bewertungsmodell (Treasury)** → *WACC, EVA, Kapitalwert, Unternehmenswert* als eigener Rechner.

Jede Kennzahl bekommt beim Anlegen sofort `abhaengig` (Abhängigkeiten), eine
laienverständliche Definition + Beispiel und – sobald die Quelle steht – die passende
`sql/<id>.kpi.sql`.
