// =========================================================================
//  MOCK-DATEN — ersetzen später die MSSQL-Abfragen.
//  Bewusst NUR rohe (gemessene) Werte je Periode; abgeleitete KPIs
//  (db1, dbQuote, wareneinsatzquote …) rechnet die Registry daraus.
//  Zahlen angelehnt an die VeloWerk-Berichtsvorlage.
// =========================================================================

export const MOCK = {
  aktuellePeriode: '2025',
  perioden: ['2023', '2024', '2025'],

  // Rohwerte je Periode (Schlüssel = KPI.id der NICHT-berechneten KPIs)
  roheWerte: {
    '2023': {
      bruttoumsatz: 50.1, erloesschmaelerung: 2.9, nettoumsatz: 47.2,
      wareneinsatz: 28.4, ebitda: 2.4, ebit: 1.7,
      onlineAnteil: 39, retourenquote: 10.1,
      einkaufsvolumen: 28.0, liefertreue: 93,
      ausschuss: 1.8, auslastung: 84,
      lagerbestand: 8.9, reichweite: 52,
      personalkosten: 9.6, fluktuation: 8.4,
      shopVerfuegbarkeit: 99.88, cashConversion: 48,
      produktionsmenge: 22100, herstellkosten: 28.2, gemeinkosten: 12.4, gesamtkosten: 45.5,
      absatzprognose: 24000, umsatzprognose: 49.0, forecastGenauigkeit: 84, auftragsbestand: 5.4,
      umsatzplan: 46.5, kostenplan: 44.0, ebitPlan: 2.0,
      produktionsplan: 22500, kapazitaet: 26000, schichtauslastung: 82, liefertermintreue: 93,
      lieferfaehigkeit: 95, ueberbestand: 2.4,
      abschlussdauer: 10, rueckstellungen: 2.9, bilanzsumme: 24.5, eigenkapital: 9.6,
      handelsrechtlichesErgebnis: 1.5, neutralesErgebnis: -0.2,
      investitionsvolumen: 2.1, investitionsbudget: 2.5, liquideMittel: 5.4, kreditlinie: 4.0, operativerCashflow: 2.0,
      vertriebskosten: 5.6, neukundenanteil: 24, rabattquote: 6.5,
      mitarbeiterFTE: 352, ueberstundenquote: 3.5, krankenstand: 4.6,
      offeneForderungen: 4.0, ueberfaelligeForderungen: 0.50, dso: 34, forderungsausfall: 0.6, klumpenrisikoTop3: 30,
      co2ProRad: 110, co2Gesamt: 3100, energieJeRad: 48, oekostromanteil: 55, recyclingquote: 70,
      nettoverschuldung: 7.8, zinsaufwand: 0.32, durchschnittszins: 3.1, hedgeQuote: 70, fxExposureOffen: 1.2,
      reklamationsquote: 1.0, nacharbeitsquote: 3.0, firstPassYield: 95, garantiekosten: 0.5,
      marketingkosten: 2.2, roas: 4.6, cac: 40, conversionRate: 2.4,
      roce: 10.2, auslandsanteil: 21, intercompanyVolumen: 7.4,
      serviceumsatz: 5.0, ersatzteilverfuegbarkeit: 93, reparaturdurchlaufzeit: 6, nps: 44,
      fuekosten: 1.6, neuproduktumsatzanteil: 26, entwicklungsprojekte: 7, timeToMarket: 15
    },
    '2024': {
      bruttoumsatz: 53.0, erloesschmaelerung: 3.3, nettoumsatz: 48.1,
      wareneinsatz: 29.6, ebitda: 2.3, ebit: 1.6,
      onlineAnteil: 42, retourenquote: 10.7,
      einkaufsvolumen: 29.7, liefertreue: 92,
      ausschuss: 2.0, auslastung: 86,
      lagerbestand: 9.4, reichweite: 57,
      personalkosten: 10.0, fluktuation: 9.1,
      shopVerfuegbarkeit: 99.85, cashConversion: 53,
      produktionsmenge: 23200, herstellkosten: 29.0, gemeinkosten: 13.0, gesamtkosten: 46.5,
      absatzprognose: 25000, umsatzprognose: 51.5, forecastGenauigkeit: 86, auftragsbestand: 6.0,
      umsatzplan: 49.0, kostenplan: 46.0, ebitPlan: 2.2,
      produktionsplan: 23800, kapazitaet: 27000, schichtauslastung: 85, liefertermintreue: 92,
      lieferfaehigkeit: 94, ueberbestand: 3.0,
      abschlussdauer: 9, rueckstellungen: 3.2, bilanzsumme: 26.0, eigenkapital: 10.2,
      handelsrechtlichesErgebnis: 1.4, neutralesErgebnis: -0.2,
      investitionsvolumen: 2.4, investitionsbudget: 2.6, liquideMittel: 5.9, kreditlinie: 4.0, operativerCashflow: 1.9,
      vertriebskosten: 6.0, neukundenanteil: 26, rabattquote: 6.8,
      mitarbeiterFTE: 364, ueberstundenquote: 3.8, krankenstand: 4.7,
      offeneForderungen: 4.1, ueberfaelligeForderungen: 0.55, dso: 36, forderungsausfall: 0.7, klumpenrisikoTop3: 32,
      co2ProRad: 104, co2Gesamt: 3050, energieJeRad: 46, oekostromanteil: 62, recyclingquote: 74,
      nettoverschuldung: 8.4, zinsaufwand: 0.38, durchschnittszins: 3.6, hedgeQuote: 72, fxExposureOffen: 1.4,
      reklamationsquote: 1.1, nacharbeitsquote: 3.2, firstPassYield: 94.5, garantiekosten: 0.55,
      marketingkosten: 2.4, roas: 4.4, cac: 43, conversionRate: 2.5,
      roce: 9.8, auslandsanteil: 22, intercompanyVolumen: 7.8,
      serviceumsatz: 5.5, ersatzteilverfuegbarkeit: 94, reparaturdurchlaufzeit: 5.5, nps: 46,
      fuekosten: 1.8, neuproduktumsatzanteil: 28, entwicklungsprojekte: 8, timeToMarket: 14
    },
    '2025': {
      bruttoumsatz: 55.8, erloesschmaelerung: 3.8, nettoumsatz: 52.0,
      wareneinsatz: 32.2, ebitda: 2.1, ebit: 1.4,
      onlineAnteil: 45, retourenquote: 11.2,
      einkaufsvolumen: 31.4, liefertreue: 91,
      ausschuss: 2.1, auslastung: 88,
      lagerbestand: 11.2, reichweite: 64,
      personalkosten: 10.5, fluktuation: 9.8,
      shopVerfuegbarkeit: 99.82, cashConversion: 58,
      produktionsmenge: 24800, herstellkosten: 31.5, gemeinkosten: 14.6, gesamtkosten: 50.6,
      absatzprognose: 26500, umsatzprognose: 55.0, forecastGenauigkeit: 88, auftragsbestand: 6.8,
      umsatzplan: 54.0, kostenplan: 51.0, ebitPlan: 2.0,
      produktionsplan: 25500, kapazitaet: 28000, schichtauslastung: 88, liefertermintreue: 91,
      lieferfaehigkeit: 93, ueberbestand: 3.5,
      abschlussdauer: 8, rueckstellungen: 3.6, bilanzsumme: 28.5, eigenkapital: 11.2,
      handelsrechtlichesErgebnis: 1.1, neutralesErgebnis: -0.3,
      investitionsvolumen: 2.8, investitionsbudget: 2.6, liquideMittel: 6.3, kreditlinie: 4.0, operativerCashflow: 1.8,
      vertriebskosten: 6.4, neukundenanteil: 28, rabattquote: 7.2,
      mitarbeiterFTE: 372, ueberstundenquote: 4.1, krankenstand: 4.9,
      offeneForderungen: 4.1, ueberfaelligeForderungen: 0.62, dso: 38, forderungsausfall: 0.8, klumpenrisikoTop3: 34,
      co2ProRad: 98, co2Gesamt: 2980, energieJeRad: 44, oekostromanteil: 68, recyclingquote: 77,
      nettoverschuldung: 9.1, zinsaufwand: 0.45, durchschnittszins: 3.9, hedgeQuote: 74, fxExposureOffen: 1.6,
      reklamationsquote: 1.2, nacharbeitsquote: 3.4, firstPassYield: 94, garantiekosten: 0.6,
      marketingkosten: 2.6, roas: 4.2, cac: 46, conversionRate: 2.6,
      roce: 9.5, auslandsanteil: 22, intercompanyVolumen: 8.2,
      serviceumsatz: 6.0, ersatzteilverfuegbarkeit: 94, reparaturdurchlaufzeit: 5.2, nps: 47,
      fuekosten: 2.0, neuproduktumsatzanteil: 30, entwicklungsprojekte: 9, timeToMarket: 13
    }
  },

  // Detailtabellen (Ebene 4). Struktur = { titel, spalten[], zeilen[][] }
  details: {
    kanaele: { titel: 'Umsatz je Kanal (2025)', spalten: ['Kanal', 'Netto Mio €', 'DB-Quote'],
      zeilen: [['Onlineshop','23,4','39 %'],['Filialen DE','13,0','37 %'],['Filialen CH','6,2','40 %'],['Filialen NL','5,2','36 %'],['B2B','4,2','30 %']] },
    retouren: { titel: 'Retouren je Warengruppe', spalten: ['Warengruppe', 'Retourenquote', 'Effekt'],
      zeilen: [['Bekleidung','22 %','kritisch'],['Teile','9 %','ok'],['Zubehör','6 %','ok'],['Fahrräder','4 %','gut']] },
    lieferanten: { titel: 'Lieferantengruppen & Klumpenrisiko', spalten: ['Gruppe','Mio €','Anteil','Status'],
      zeilen: [['Antrieb & Schaltung','9,8','31 %','Klumpen'],['Rahmen-Rohmaterial','6,4','20 %','Preisdruck'],['Handelsware','7,2','23 %','ok'],['Zubehör/Bekleidung','4,8','15 %','ok']] },
    fertigung: { titel: 'Fertigungskennzahlen', spalten: ['Kennzahl','Wert','Ziel'],
      zeilen: [['Rahmen-Eigenanteil','71 %','—'],['Durchlaufzeit Montage','3,2 Tg','3,0'],['Nacharbeit Endmontage','3,4 %','2,0 %'],['Reklamationsquote Feld','1,2 %','1,0 %']] },
    bestaende: { titel: 'Bestände je Warenbereich', spalten: ['Warenbereich','Mio €','Reichw.','Ziel'],
      zeilen: [['Fahrräder','5,4','42 Tg','35'],['Teile','3,1','96 Tg','45'],['Zubehör','1,3','58 Tg','40'],['Bekleidung','1,4','110 Tg','50'],['Gesamt','11,2','64 Tg','40']] },
    externe_laeger: { titel: 'Externe Läger', spalten: ['Standort','Kosten/J','Empfehlung'],
      zeilen: [['Reservelager Nord','0,15 Mio','kündigen'],['Saisonlager Süd','0,12 Mio','verkleinern'],['Hub Schweiz','0,08 Mio','behalten']] },
    belegschaft: { titel: 'Belegschaft je Bereich', spalten: ['Bereich','FTE','Fluktuation'],
      zeilen: [['Filialen DE/CH/NL','186','12,4 %'],['Onlineshop & Service','64','8,1 %'],['Produktion & Logistik','96','6,5 %'],['Verwaltung/IT/Finanzen','26','4,2 %']] },
    projekte: { titel: 'IT-Projektportfolio', spalten: ['Projekt','Budget','Fortschritt','Status'],
      zeilen: [['Onlineshop-Replatforming','0,45 Mio','60 %','im Plan'],['PIM (Artikeldaten)','0,12 Mio','35 %','verzögert']] },
    guv: { titel: 'GuV-Staffel (2025)', spalten: ['Position','Mio €','Hinweis'],
      zeilen: [['Bruttoumsatz','55,8','E-Bikes treiben Schnitt'],['− Erlösschmälerung','−3,8','Online-Retouren'],['= Nettoumsatz','52,0','+8,1 %'],['− Wareneinsatz','−32,2','über Plan'],['= DB I','19,8','38,1 %'],['− Personal','−10,5','Filialnetz'],['− übrige OpEx','−7,05','Marketing/Logistik'],['= EBITDA','2,1','4,0 %'],['= EBIT','1,4','2,7 %']] },

    // --- Kosten- & Leistungsrechnung ---
    kostenarten: { titel: 'Kostenartenübersicht (2025)', spalten: ['Kostenart','Mio €','% Gesamt'],
      zeilen: [['Materialkosten','24,8','49 %'],['Personalkosten','10,5','21 %'],['Abschreibungen','0,7','1 %'],['Energie/Raum','3,1','6 %'],['Marketing/Vertrieb','4,9','10 %'],['Logistik','2,3','5 %'],['Sonstige','4,3','8 %'],['Gesamtkosten','50,6','100 %']] },
    kostenstellen: { titel: 'Kostenstellen Plan/Ist (BAB, Mio €)', spalten: ['Kostenstelle','Plan','Ist','Abw.'],
      zeilen: [['Fertigung','18,2','18,9','+0,7'],['Montage','6,4','6,6','+0,2'],['Logistik','2,2','2,3','+0,1'],['Vertrieb','9,8','9,6','−0,2'],['Verwaltung','5,1','5,0','−0,1'],['IT','1,1','1,1','0,0']] },
    kostentraeger: { titel: 'Deckungsbeitrag je Produktgruppe', spalten: ['Produktgruppe','Erlös Mio €','HK Mio €','DB %'],
      zeilen: [['E-Bikes','30,1','18,9','37 %'],['City/Trekking','9,6','6,3','34 %'],['Teile','8,8','5,4','39 %'],['Zubehör','5,7','3,2','44 %'],['Bekleidung','3,7','2,5','32 %']] },

    // --- Absatz- & Umsatzprognose ---
    absatz_forecast: { titel: 'Prognose je Warengruppe (Stück, nächste Periode)', spalten: ['Warengruppe','Ist','Prognose','Δ %'],
      zeilen: [['E-Bikes','14.300','15.600','+9 %'],['City/Trekking','7.200','7.500','+4 %'],['Kinder/Sonstige','3.300','3.400','+3 %'],['Gesamt Räder','24.800','26.500','+7 %']] },
    forecast_guete: { titel: 'Prognosegüte (Plan vs. Ist Umsatz, Mio €)', spalten: ['Periode','Prognose','Ist','Abw. %'],
      zeilen: [['2023','49,0','47,2','−3,7 %'],['2024','51,5','48,1','−6,6 %'],['2025','55,0','52,0','−5,5 %']] },
    auftragsbestand_kanal: { titel: 'Orderbuch je Kanal (Mio €)', spalten: ['Kanal','Auftragsbestand','Reichweite'],
      zeilen: [['Onlineshop','2,6','21 Tg'],['Filialen','1,9','17 Tg'],['B2B/Leasing','2,3','46 Tg'],['Gesamt','6,8','—']] },

    // --- Umsatz-, Kosten- & Erfolgsplanung ---
    umsatzplan_kanal: { titel: 'Umsatzplan je Kanal 2025 (Mio €)', spalten: ['Kanal','Plan','Ist','Erfüllung'],
      zeilen: [['Onlineshop','24,5','23,4','96 %'],['Filialen DE','13,2','13,0','98 %'],['Filialen CH','6,4','6,2','97 %'],['Filialen NL','5,5','5,2','95 %'],['B2B','4,4','4,2','95 %'],['Gesamt','54,0','52,0','96 %']] },
    kostenplan_bereich: { titel: 'Kostenbudget je Bereich 2025 (Mio €)', spalten: ['Bereich','Plan','Ist','Abw.'],
      zeilen: [['Material/Einkauf','25,5','24,8','−0,7'],['Produktion','7,1','7,4','+0,3'],['Personal','10,4','10,5','+0,1'],['Marketing/Vertrieb','4,8','4,9','+0,1'],['Logistik','2,1','2,3','+0,2'],['Verwaltung/IT','1,1','1,1','0,0'],['Gesamt','51,0','50,6','−0,4']] },
    plan_guv: { titel: 'Plan-GuV 2025 (Plan/Ist, Mio €)', spalten: ['Position','Plan','Ist','Abw.'],
      zeilen: [['Nettoumsatz','54,0','52,0','−2,0'],['− Wareneinsatz','−31,5','−32,2','−0,7'],['= DB I','22,5','19,8','−2,7'],['− Fixkosten','−20,5','−18,4','+2,1'],['= EBIT','2,0','1,4','−0,6']] },

    // --- Produktionsplanung ---
    kapazitaet_linien: { titel: 'Kapazität je Fertigungslinie (Räder/Periode)', spalten: ['Linie','Kapazität','Plan','Auslastung'],
      zeilen: [['Rahmenbau','9.500','8.900','94 %'],['Lackiererei','11.000','9.800','89 %'],['Endmontage E-Bike','12.500','11.700','94 %'],['Endmontage City','8.000','6.900','86 %'],['Gesamt','28.000','25.500','91 %']] },
    schichtplan: { titel: 'Schichtplan KW (Endmontage)', spalten: ['Schicht','Tage','MA','Kap./Tag','Status'],
      zeilen: [['Frühschicht','Mo–Fr','24','110','besetzt'],['Spätschicht','Mo–Fr','22','100','besetzt'],['Nachtschicht','Mo–Do','12','55','Engpass'],['Samstag-Sonderschicht','Sa','10','45','optional']] },
    prod_abgleich: { titel: 'Programmabgleich Forecast↔Plan↔Ist (Räder)', spalten: ['Warengruppe','Forecast','Plan','Ist','Δ Plan/Ist'],
      zeilen: [['E-Bikes','15.600','15.000','14.300','−700'],['City/Trekking','7.500','7.300','7.200','−100'],['Kinder/Sonstige','3.400','3.200','3.300','+100'],['Gesamt','26.500','25.500','24.800','−700']] },

    // --- Bestands- & Supply-Chain-Controlling ---
    abc_analyse: { titel: 'ABC/XYZ-Analyse Bestand', spalten: ['Klasse','Artikel-Anteil','Wert-Anteil','Ø Reichweite'],
      zeilen: [['A / X','8 %','62 %','34 Tg'],['A / Y','6 %','14 %','41 Tg'],['B','22 %','18 %','58 Tg'],['C / Z','64 %','6 %','120 Tg']] },
    lieferfaehigkeit_gruppe: { titel: 'Servicegrad je Warengruppe', spalten: ['Warengruppe','Servicegrad','Fehlmengen','Ziel'],
      zeilen: [['E-Bikes','96 %','niedrig','98 %'],['Teile','89 %','mittel','95 %'],['Zubehör','95 %','niedrig','97 %'],['Bekleidung','91 %','Saisonlücken','95 %']] },
    ueberbestand_massnahmen: { titel: 'Überbestände & Maßnahmen', spalten: ['Warengruppe','Überbestand Mio €','Treiber','Maßnahme'],
      zeilen: [['Teile','1,4','Sicherheitsbestand (↔ Einkauf)','Lieferantenrückgabe'],['Bekleidung','1,1','Saisonrest (↔ Vertrieb)','Outlet-Abverkauf'],['E-Bikes','0,6','Modellwechsel (↔ Produktion)','Abverkaufsaktion'],['Zubehör','0,4','Langsamdreher','Sortiment straffen']] },

    // --- Finanzbuchhaltung & Abschluss ---
    abschluss_status: { titel: 'Monatsabschluss — Status', spalten: ['Aufgabe','Verantwortlich','Status','Termin'],
      zeilen: [['Abgrenzungen gebucht','FiBu','erledigt','WT 3'],['Bestandsbewertung','KLR/SCC','offen','WT 5'],['Rückstellungen aktualisiert','FiBu','in Arbeit','WT 5'],['Intercompany-Abstimmung','FiBu','offen','WT 6'],['Reporting freigegeben','Controlling','wartet','WT 8']] },
    rueckstellungsspiegel: { titel: 'Rückstellungsspiegel (Mio €)', spalten: ['Art','Stand VJ','Zuführung','Verbrauch','Stand'],
      zeilen: [['Garantie/Gewährleistung','1,2','0,6','−0,4','1,4'],['Personal (Urlaub/Boni)','1,1','0,5','−0,3','1,3'],['Drohende Verluste','0,5','0,2','−0,1','0,6'],['Sonstige','0,4','0,1','−0,2','0,3'],['Gesamt','3,2','1,4','−1,0','3,6']] },
    bilanz: { titel: 'Bilanz kompakt 2025 (Mio €)', spalten: ['Position','Mio €','Seite'],
      zeilen: [['Anlagevermögen','9,8','Aktiva'],['Vorräte','11,2','Aktiva'],['Forderungen','4,1','Aktiva'],['Liquide Mittel','3,4','Aktiva'],['Eigenkapital','11,2','Passiva'],['Rückstellungen','3,6','Passiva'],['Verbindlichkeiten','13,7','Passiva'],['Bilanzsumme','28,5','—']] },
    abgrenzungsrechnung: { titel: 'Abgrenzungsrechnung — FiBu → Controlling (Mio €)', spalten: ['Position','FiBu','Abgrenzung','Controlling'],
      zeilen: [['Ergebnis lt. GuV (HGB)','1,1','—','—'],['− neutrale Erträge','—','−0,1','—'],['+ neutrale Aufwendungen','—','+0,4','—'],['= Betriebsergebnis','—','—','1,4'],['Hinweis','periodengerecht','betriebsfremd/außerord.','operativ steuerbar']] },

    // --- Investitions- & Liquiditätsplanung ---
    invest_projekte: { titel: 'Investitionsprojekte 2025 (Mio €)', spalten: ['Projekt','Budget','Ist','Status','ROI'],
      zeilen: [['Lackiererei-Umstellung','0,9','1,0','aktiv','3,1 J'],['Onlineshop-Replatforming','0,45','0,5','aktiv','2,4 J'],['Lagerautomatisierung','0,7','0,8','verzögert','3,8 J'],['Fuhrpark/Leasing-Flotte','0,55','0,5','geplant','—'],['Gesamt','2,6','2,8','—','—']] },
    liquiditaetsvorschau: { titel: 'Liquiditätsvorschau (rollierend, Mio €)', spalten: ['Monat','Einzahlung','Auszahlung','Saldo','Bestand'],
      zeilen: [['M+1','4,6','4,3','+0,3','6,6'],['M+2','4,2','4,5','−0,3','6,3'],['M+3','5,1','4,4','+0,7','7,0'],['M+4','4,8','4,9','−0,1','6,9']] },
    cashflow: { titel: 'Cashflow-Rechnung 2025 (Mio €)', spalten: ['Position','Mio €','Hinweis'],
      zeilen: [['Operativer Cashflow','1,8','vor Working-Capital-Abbau'],['− Investitionen','−2,8','CapEx'],['+ Bestandsabbau (Potenzial)','+3,5','Hebel #2'],['− Finanzierung/Tilgung','−0,4',''],['= Veränderung Liquidität','+2,1','']] },

    // --- Vertriebscontrolling ---
    kanal_profitabilitaet: { titel: 'DB je Kanal/Segment', spalten: ['Kanal/Segment','Netto Mio €','DB-Quote','Neukunden'],
      zeilen: [['Onlineshop','23,4','39 %','31 %'],['Filialen DE','13,0','37 %','22 %'],['Filialen CH','6,2','40 %','19 %'],['B2B/Gewerbe','4,2','30 %','28 %'],['Leasing','2,6','34 %','35 %']] },
    rabattanalyse: { titel: 'Rabattanalyse je Warengruppe', spalten: ['Warengruppe','Rabattquote','Effekt Mio €','Bewertung'],
      zeilen: [['E-Bikes','5,1 %','−1,5','vertretbar'],['City/Trekking','7,8 %','−0,7','prüfen'],['Teile','9,4 %','−0,8','hoch'],['Bekleidung','12,2 %','−0,5','Abverkauf']] },
    vertriebskosten_struktur: { titel: 'Vertriebskostenstruktur (Mio €)', spalten: ['Kostenart','Mio €','% Umsatz'],
      zeilen: [['Online-Marketing','2,1','4,0 %'],['Filial-/Flächenkosten','1,9','3,7 %'],['Provisionen','1,0','1,9 %'],['Messen/Promotion','0,8','1,5 %'],['Sonstige','0,6','1,2 %'],['Gesamt','6,4','12,3 %']] },

    // --- Personalcontrolling ---
    personal_produktivitaet: { titel: 'Kosten & Produktivität je Bereich', spalten: ['Bereich','FTE','Kosten Mio €','Umsatz/FTE T€'],
      zeilen: [['Filialen DE/CH/NL','186','5,2','—'],['Onlineshop & Service','64','2,1','365'],['Produktion & Logistik','96','2,4','—'],['Verwaltung/IT/Finanzen','26','0,8','—'],['Gesamt','372','10,5','140']] },
    arbeitszeit: { titel: 'Arbeitszeit & Fehlzeiten je Bereich', spalten: ['Bereich','Überstundenquote','Krankenstand'],
      zeilen: [['Filialen','3,1 %','5,2 %'],['Onlineshop & Service','4,8 %','4,1 %'],['Produktion','5,4 %','5,6 %'],['Logistik','4,6 %','4,9 %'],['Verwaltung','1,9 %','3,2 %']] },

    // --- Risiko- & Forderungscontrolling ---
    forderungs_aging: { titel: 'Forderungs-Aging (Mio €)', spalten: ['Fälligkeit','Mio €','Anteil','Risiko'],
      zeilen: [['nicht fällig','3,48','85 %','—'],['1–30 Tage','0,33','8 %','gering'],['31–60 Tage','0,16','4 %','mittel'],['61–90 Tage','0,08','2 %','hoch'],['> 90 Tage','0,05','1 %','kritisch'],['Gesamt','4,10','100 %','—']] },
    ausfaelle: { titel: 'Ausfälle & Wertberichtigungen', spalten: ['Position','Mio €','Hinweis'],
      zeilen: [['Pauschalwertberichtigung','0,18','1 % der Forderungen'],['Einzelwertberichtigung','0,22','3 Großfälle'],['Realisierter Ausfall','0,42','0,8 % vom Umsatz'],['Inkasso/Recht','0,06','laufend']] },
    konzentration: { titel: 'Konzentrationsrisiko Top-Partner', spalten: ['Partner','Typ','Umsatz/Volumen','Anteil'],
      zeilen: [['Leasing-Partner A','Kunde','7,8 Mio','15 %'],['B2B-Händler B','Kunde','5,2 Mio','10 %'],['Filialkette C','Kunde','4,7 Mio','9 %'],['Antrieb/Schaltung X','Lieferant','9,8 Mio','31 % EK'],['Rahmen-Rohmaterial Y','Lieferant','6,4 Mio','20 % EK']] },

    // --- Nachhaltigkeits-/ESG-Controlling ---
    co2_scope: { titel: 'CO₂-Bilanz nach Scope (t CO₂e)', spalten: ['Scope','Quelle','t CO₂e','Anteil'],
      zeilen: [['Scope 1','eigene Verbrennung/Fuhrpark','420','14 %'],['Scope 2','Strom/Wärme','610','20 %'],['Scope 3','Vorprodukte/Logistik','1.950','66 %'],['Gesamt','—','2.980','100 %']] },
    energie_material: { titel: 'Energie & Material je Rad', spalten: ['Kennzahl','Wert','Ziel'],
      zeilen: [['Energie je Rad','44 kWh','42'],['Ökostromanteil','68 %','100 %'],['Aluminium-Rezyklat','41 %','60 %'],['Verpackung recycelt','82 %','90 %'],['Ausschussmaterial','2,1 %','1,5 %']] },
    kreislauf_sozial: { titel: 'Kreislauf & Soziales', spalten: ['Kennzahl','Wert','Trend'],
      zeilen: [['Recyclingquote','77 %','▲'],['Reparaturquote (Leasing-Rückläufer)','64 %','▲'],['Betriebszugehörigkeit Ø','6,8 J','▬'],['Frauenanteil Führung','28 %','▲'],['Ausbildungsquote','5,1 %','▬']] },

    // --- Treasury & Zins-/Währungsrisiko ---
    finanzierung: { titel: 'Finanzierungsstruktur (Mio €)', spalten: ['Instrument','Volumen','Zins','Laufzeit'],
      zeilen: [['Bankdarlehen A (fest)','4,5','3,4 %','2028'],['Bankdarlehen B (variabel)','2,6','4,8 %','2027'],['Kontokorrent','1,2','5,5 %','revolv.'],['Leasingverbindlichkeiten','0,8','3,1 %','div.'],['Summe Finanzschulden','9,1','3,9 %','—']] },
    zinsbindung: { titel: 'Zinsbindung & Sensitivität', spalten: ['Tranche','Typ','Volumen','Effekt +1 %'],
      zeilen: [['Darlehen A','fest','4,5','—'],['Darlehen B','variabel','2,6','−26 T€'],['Kontokorrent','variabel','1,2','−12 T€'],['Variabel gesamt','—','3,8','−38 T€ p. a.']] },
    fx_exposure: { titel: 'FX-Exposure je Währung (Mio €)', spalten: ['Währung','Exposure','gehedged','offen'],
      zeilen: [['CHF (Schweiz)','4,8','3,6','1,2'],['USD (Beschaffung)','1,2','0,8','0,4'],['Gesamt','6,0','4,4','1,6']] },

    // --- Qualitäts- & Reklamationscontrolling ---
    reklamationen: { titel: 'Reklamationen je Warengruppe', spalten: ['Warengruppe','Quote','Top-Ursache','Trend'],
      zeilen: [['E-Bikes','1,5 %','Antrieb/Elektronik','▲'],['City/Trekking','0,9 %','Bremsen/Schaltung','▬'],['Teile','0,8 %','Passung','▬'],['Zubehör','0,5 %','—','▼'],['Bekleidung','0,4 %','—','▼']] },
    fertigungsqualitaet: { titel: 'Fertigungsqualität', spalten: ['Kennzahl','Wert','Ziel'],
      zeilen: [['First Pass Yield','94 %','97 %'],['Nacharbeitsquote Endmontage','3,4 %','2,0 %'],['Ausschuss','2,1 %','1,5 %'],['Durchlaufzeit Montage','3,2 Tg','3,0'],['Prüfumfang','100 %','—']] },
    fehlerkosten: { titel: 'Fehlerkosten (Cost of Poor Quality, Mio €)', spalten: ['Kategorie','Mio €','Hinweis'],
      zeilen: [['Garantie/Gewährleistung','0,60','Feldausfälle'],['Nacharbeit intern','0,42','Endmontage'],['Ausschuss','0,33','Material'],['Prüf-/Kontrollkosten','0,18','Eingangs-/Endprüfung'],['Summe CoPQ','1,53','2,9 % vom Umsatz']] },

    // --- Marketing-/Kampagnencontrolling ---
    kampagnen: { titel: 'Kampagnen-ROI', spalten: ['Kampagne','Spend T€','Umsatz T€','ROAS'],
      zeilen: [['Frühjahr E-Bike','420','2.310','5,5'],['Performance Search','310','1.395','4,5'],['Social Awareness','180','540','3,0'],['Retargeting','150','975','6,5'],['Print/Messe','120','300','2,5']] },
    funnel: { titel: 'Conversion-Funnel Onlineshop', spalten: ['Stufe','Wert','Conversion'],
      zeilen: [['Besuche','3,9 Mio','—'],['Produktansichten','1,8 Mio','46 %'],['Warenkorb','312.000','17 %'],['Checkout','148.000','47 %'],['Bestellung','101.000','2,6 %']] },
    cac_clv: { titel: 'CAC & CLV je Kanal (€)', spalten: ['Kanal','CAC','CLV','CLV/CAC'],
      zeilen: [['Performance Search','52','410','7,9'],['Social','61','330','5,4'],['Retargeting','28','395','14,1'],['Organisch/SEO','12','420','35,0'],['Ø gesamt','46','390','8,5']] },

    // --- Beteiligungs-/Konzerncontrolling ---
    segment_guv: { titel: 'Segment-GuV je Gesellschaft (Mio €)', spalten: ['Gesellschaft','Umsatz','EBIT','EBIT-Marge'],
      zeilen: [['VeloWerk DE','36,4','0,9','2,5 %'],['VeloWerk CH','6,2','0,3','4,8 %'],['VeloWerk NL','5,2','0,1','1,9 %'],['B2B/Leasing','4,2','0,1','2,4 %'],['Konzern (kons.)','52,0','1,4','2,7 %']] },
    rendite: { titel: 'Kapitalrendite je Gesellschaft', spalten: ['Gesellschaft','ROCE','EK-Rendite','Capital Empl. Mio'],
      zeilen: [['VeloWerk DE','9,1 %','9,4 %','9,9'],['VeloWerk CH','13,2 %','12,1 %','2,3'],['VeloWerk NL','7,8 %','8,0 %','1,3'],['Konzern','9,5 %','9,8 %','14,7']] },
    ic_abstimmung: { titel: 'Intercompany-Abstimmung (Mio €)', spalten: ['Beziehung','Lieferung','Forderung','Differenz'],
      zeilen: [['DE → CH','3,1','3,1','0,0'],['DE → NL','2,6','2,5','0,1'],['DE → B2B','2,5','2,5','0,0'],['Summe IC','8,2','8,1','0,1']] },

    // --- After-Sales- & Servicecontrolling ---
    serviceumsatz_leistung: { titel: 'Serviceumsatz je Leistung (Mio €)', spalten: ['Leistung','Umsatz','DB-Quote','Trend'],
      zeilen: [['Ersatzteile','2,6','48 %','▲'],['Inspektion/Wartung','1,8','41 %','▲'],['Reparatur','1,1','35 %','▬'],['Garantie-Reparatur','0,5','—','▼'],['Gesamt','6,0','43 %','▲']] },
    werkstatt: { titel: 'Werkstattkennzahlen', spalten: ['Kennzahl','Wert','Ziel'],
      zeilen: [['Reparatur-Durchlaufzeit','5,2 Tg','5,0'],['Ersatzteilverfügbarkeit','94 %','95 %'],['Auslastung Werkstatt','82 %','85 %'],['Wiederholreparaturen','3,1 %','2,0 %'],['Termintreue','89 %','95 %']] },
    nps_beschwerden: { titel: 'Kundenzufriedenheit', spalten: ['Kennzahl','Wert','Trend'],
      zeilen: [['Net Promoter Score','47','▲'],['Beschwerdequote','2,3 %','▼'],['Ø Bearbeitungszeit Beschwerde','4,1 Tg','▬'],['Lösungsquote 1st Contact','71 %','▲'],['Wiederkaufrate','58 %','▲']] },

    // --- F&E-/Innovationscontrolling ---
    fe_projekte: { titel: 'F&E-Projektportfolio', spalten: ['Projekt','Budget','Fortschritt','Status'],
      zeilen: [['E-Bike-Antrieb Gen.3','0,7','55 %','im Plan'],['Leichtbau-Rahmen','0,5','40 %','im Plan'],['Connected-Bike App','0,4','30 %','verzögert'],['Akku-Reichweite +20 %','0,4','25 %','im Plan']] },
    neuprodukt: { titel: 'Neuprodukt-Umsatz (Produkte < 3 Jahre)', spalten: ['Jahr','Anteil','Umsatz Mio €'],
      zeilen: [['2023','26 %','12,3'],['2024','28 %','13,5'],['2025','30 %','15,6']] },
    fe_pipeline: { titel: 'Entwicklungspipeline', spalten: ['Phase','Projekte','Ø Dauer'],
      zeilen: [['Idee/Konzept','4','3 Mon.'],['Entwicklung','3','9 Mon.'],['Prototyp/Test','1','4 Mon.'],['Markteinführung','1','2 Mon.'],['Ø Time-to-Market','—','13 Mon.']] }
  },

  // Investitionsrechnung — Projekte (t0-Auszahlung negativ, danach Cashflows).
  wacc: 8,
  investitionen: [
    { projekt: 'Lagerautomatisierung', invest: 0.8, cashflows: [0.18, 0.22, 0.25, 0.25, 0.25] },
    { projekt: 'Lackiererei-Umstellung', invest: 1.0, cashflows: [0.30, 0.32, 0.34, 0.34, 0.30] },
    { projekt: 'PV-Anlage (ESG)', invest: 0.6, cashflows: [0.09, 0.10, 0.11, 0.12, 0.13] },
    { projekt: 'Onlineshop-Replatforming', invest: 0.5, cashflows: [0.20, 0.22, 0.18, 0.12, 0.08] }
  ],

  // Portfolio (Produktgruppen) für Controlling-Instrumente (BCG-Matrix).
  // wachstum = Marktwachstum %, marktanteil = relativer Marktanteil (>1 = Marktführer)
  portfolio: [
    { gruppe: 'E-Bikes', umsatz: 30.1, wachstum: 13, marktanteil: 1.6, db: 37 },
    { gruppe: 'Zubehör', umsatz: 5.7, wachstum: 9, marktanteil: 0.6, db: 44 },
    { gruppe: 'City/Trekking', umsatz: 9.6, wachstum: 2, marktanteil: 1.3, db: 34 },
    { gruppe: 'Teile', umsatz: 8.8, wachstum: 1, marktanteil: 1.1, db: 39 },
    { gruppe: 'Bekleidung', umsatz: 3.7, wachstum: -3, marktanteil: 0.5, db: 32 }
  ],

  // Detail-Perspektiven (Ebene-4-Sprungpunkte). Key = <bereich>_<objekt>.
  perspektiven: {
    vk_artikel: { titel: 'Umsatz je Artikel', spalten: ['Artikel-Nr', 'Bezeichnung', 'Menge', 'Umsatz €', 'DB %'],
      zeilen: [['10042','E-Bike Urban 500','1.240','3.348.000','38 %'],['10088','E-MTB Trail Pro','680','2.992.000','41 %'],['20155','Trekking City 7','910','1.456.000','34 %'],['30219','Pendix Nachrüstsatz','420','546.000','46 %'],['40310','Helm Air Pro','3.120','312.000','52 %'],['40455','Schloss Faltschloss','2.430','170.100','49 %']] },
    vk_produkt: { titel: 'Umsatz je Produktgruppe', spalten: ['Produktgruppe', 'Umsatz Mio €', 'Anteil', 'DB %'],
      zeilen: [['E-Bikes','30,1','58 %','37 %'],['City/Trekking','9,6','18 %','34 %'],['Teile','8,8','17 %','39 %'],['Zubehör','5,7','11 %','44 %'],['Bekleidung','3,7','7 %','32 %']] },
    vk_kunde: { titel: 'Umsatz je Kunde', spalten: ['Kunden-Nr', 'Kunde', 'Umsatz €', 'DB %', 'Segment'], filterSpalten: [4], drillTo: { perspektive: 'verkaufsrechnung', keySpalte: 1, label: 'Verkaufsrechnungen' },
      zeilen: [['K-1003','Stadtwerke Leasing GmbH','780.000','34 %','B2B'],['K-2210','Radhaus Müller e.K.','512.000','30 %','Händler'],['K-0098','Onlineshop (Privatkunden)','23.400.000','39 %','B2C'],['K-3320','Velo Schweiz AG','620.000','40 %','B2B'],['K-4407','Stadtflotte NL','410.000','31 %','B2B']] },
    vk_verkaufsrechnung: { titel: 'Verkaufsrechnungen', spalten: ['Rechnung-Nr', 'Datum', 'Kunde', 'Betrag €', 'Status'], filterSpalten: [4],
      zeilen: [['AR-2025-04412','12.05.2025','Stadtwerke Leasing GmbH','46.800','bezahlt'],['AR-2025-04418','13.05.2025','Radhaus Müller e.K.','12.340','offen'],['AR-2025-04501','19.05.2025','Velo Schweiz AG','58.900','bezahlt'],['AR-2025-04533','21.05.2025','Stadtflotte NL','31.200','überfällig'],['AR-2025-04560','24.05.2025','Onlineshop Sammelrg.','118.450','bezahlt']] },
    vk_auftrag: { titel: 'Aufträge', spalten: ['Auftrag-Nr', 'Kunde', 'Wert €', 'Liefertermin', 'Status'], filterSpalten: [4], drillTo: { perspektive: 'verkaufsrechnung', keySpalte: 1, label: 'Verkaufsrechnungen' },
      zeilen: [['SO-88231','Stadtwerke Leasing GmbH','46.800','30.06.2025','in Fertigung'],['SO-88245','Velo Schweiz AG','58.900','15.06.2025','versandbereit'],['SO-88260','Stadtflotte NL','31.200','10.07.2025','offen'],['SO-88277','Radhaus Müller e.K.','12.340','05.06.2025','geliefert']] },
    ek_lieferant: { titel: 'Einkaufsvolumen je Lieferant', spalten: ['Lieferant-Nr', 'Lieferant', 'Volumen €', 'Liefertreue', 'Risiko'], filterSpalten: [4], drillTo: { perspektive: 'bestellung', keySpalte: 1, label: 'Bestellungen' },
      zeilen: [['L-0012','Antrieb & Schaltung AG','9.800.000','91 %','Klumpen'],['L-0034','RahmenStahl GmbH','6.400.000','94 %','Preisdruck'],['L-0050','Handelsware Süd','7.200.000','96 %','ok'],['L-0071','Zubehör Import','4.800.000','89 %','ok']] },
    ek_artikel: { titel: 'Einkauf je Artikel', spalten: ['Artikel-Nr', 'Bezeichnung', 'Menge', 'Einstand €', 'Δ Preis VJ'],
      zeilen: [['R-2201','Antriebseinheit M3','24.800','312','+6,1 %'],['R-3310','Schaltwerk 12s','24.800','88','+4,8 %'],['R-1102','Rahmen Alu 6061','18.000','142','+7,2 %'],['R-5500','Akku 625Wh','19.200','410','+3,9 %']] },
    ek_einkaufsrechnung: { titel: 'Einkaufsrechnungen', spalten: ['Rechnung-Nr', 'Datum', 'Lieferant', 'Betrag €', 'Status'], filterSpalten: [4],
      zeilen: [['AP-2025-2231','08.05.2025','Antrieb & Schaltung AG','248.000','geprüft'],['AP-2025-2240','10.05.2025','RahmenStahl GmbH','156.400','zur Zahlung'],['AP-2025-2255','14.05.2025','Handelsware Süd','92.300','offen'],['AP-2025-2261','18.05.2025','Zubehör Import','61.200','Klärfall']] },
    ek_bestellung: { titel: 'Bestellungen', spalten: ['Bestell-Nr', 'Lieferant', 'Wert €', 'Liefertermin', 'Status'], filterSpalten: [4], drillTo: { perspektive: 'einkaufsrechnung', keySpalte: 1, label: 'Einkaufsrechnungen' },
      zeilen: [['PO-55120','Antrieb & Schaltung AG','248.000','20.06.2025','bestätigt'],['PO-55133','RahmenStahl GmbH','156.400','12.06.2025','teilgeliefert'],['PO-55149','Handelsware Süd','92.300','25.06.2025','offen'],['PO-55160','Zubehör Import','61.200','08.07.2025','angefragt']] },
    log_artikel: { titel: 'Bestand je Artikel', spalten: ['Artikel-Nr', 'Bezeichnung', 'Bestand', 'Wert €', 'Reichw.'],
      zeilen: [['10042','E-Bike Urban 500','310','831.800','42 Tg'],['20155','Trekking City 7','280','448.000','58 Tg'],['R-2201','Antriebseinheit M3','1.900','592.800','96 Tg'],['40455','Schloss Faltschloss','5.400','37.800','120 Tg']] },
    log_produkt: { titel: 'Bestand je Produktgruppe', spalten: ['Warenbereich', 'Wert Mio €', 'Reichw.', 'Ziel'],
      zeilen: [['Fahrräder','5,4','42 Tg','35'],['Teile','3,1','96 Tg','45'],['Zubehör','1,3','58 Tg','40'],['Bekleidung','1,4','110 Tg','50']] },
    log_lager: { titel: 'Bestand je Lagerort', spalten: ['Lagerort', 'Wert Mio €', 'Auslastung', 'Typ'], filterSpalten: [3],
      zeilen: [['Zentrallager DE','7,8','88 %','eigen'],['Reservelager Nord','1,4','62 %','extern'],['Saisonlager Süd','1,1','55 %','extern'],['Hub Schweiz','0,9','71 %','extern']] },
    fin_profitcenter: { titel: 'Ergebnis je Profit-Center', spalten: ['Profit-Center', 'Umsatz Mio €', 'DB Mio €', 'EBIT Mio €'],
      zeilen: [['PC Online','23,4','9,1','0,9'],['PC Filialen DE','13,0','4,8','0,2'],['PC Filialen CH','6,2','2,5','0,3'],['PC B2B/Leasing','6,8','2,2','0,1'],['PC Service','6,0','2,6','0,2']] },
    fin_kostenstelle: { titel: 'Kosten je Kostenstelle', spalten: ['Kostenstelle', 'Plan Mio €', 'Ist Mio €', 'Abw.'],
      zeilen: [['Fertigung','18,2','18,9','+0,7'],['Montage','6,4','6,6','+0,2'],['Vertrieb','9,8','9,6','−0,2'],['Verwaltung','5,1','5,0','−0,1'],['IT','1,1','1,1','0,0']] },
    fin_konto: { titel: 'Salden je Sachkonto', spalten: ['Konto', 'Bezeichnung', 'Saldo €', 'Typ'], filterSpalten: [3],
      zeilen: [['8400','Erlöse 19% USt','52.000.000','Ertrag'],['3400','Wareneingang','32.200.000','Aufwand'],['4100','Löhne/Gehälter','10.500.000','Aufwand'],['1200','Bank','6.300.000','Aktiva'],['1600','Verbindlichkeiten LuL','13.700.000','Passiva']] },

    // Produktion
    pr_artikel: { titel: 'Fertigung je Artikel', spalten: ['Artikel-Nr', 'Bezeichnung', 'Menge', 'Ausschuss %', 'Linie'], filterSpalten: [4], drillTo: { perspektive: 'auftrag', keySpalte: 1, label: 'Fertigungsauftraege' },
      zeilen: [['10042','E-Bike Urban 500','12.400','2,1 %','Endmontage E-Bike'],['10088','E-MTB Trail Pro','6.800','2,6 %','Endmontage E-Bike'],['20155','Trekking City 7','9.100','1,7 %','Endmontage City'],['R-1102','Rahmen Alu 6061','18.000','1,9 %','Rahmenbau']] },
    pr_auftrag: { titel: 'Fertigungsaufträge', spalten: ['FA-Nr', 'Artikel', 'Menge', 'Termin', 'Status'], filterSpalten: [4], drillTo: { perspektive: 'artikel', keySpalte: 1, label: 'Artikeldetails' },
      zeilen: [['FA-77120','E-Bike Urban 500','500','12.06.2025','läuft'],['FA-77135','E-MTB Trail Pro','300','18.06.2025','geplant'],['FA-77150','Trekking City 7','450','10.06.2025','fertig'],['FA-77166','Rahmen Alu 6061','800','08.06.2025','läuft']] },
    pr_maschine: { titel: 'Auslastung je Linie/Maschine', spalten: ['Linie', 'Auslastung', 'Ausschuss %', 'Status'], filterSpalten: [3],
      zeilen: [['Rahmenbau','94 %','1,9 %','ok'],['Lackiererei','89 %','2,4 %','Engpass'],['Endmontage E-Bike','94 %','2,3 %','ok'],['Endmontage City','86 %','1,7 %','ok']] },

    // Vertriebscontrolling
    vc_kunde: { titel: 'Profitabilität je Kunde', spalten: ['Kunde', 'Umsatz €', 'DB %', 'Segment'], filterSpalten: [3],
      zeilen: [['Stadtwerke Leasing GmbH','780.000','34 %','B2B'],['Radhaus Müller e.K.','512.000','30 %','Händler'],['Velo Schweiz AG','620.000','40 %','B2B'],['Onlineshop Privatkunden','23.400.000','39 %','B2C'],['Stadtflotte NL','410.000','31 %','B2B']] },
    vc_kanal: { titel: 'Profitabilität je Kanal', spalten: ['Kanal', 'Umsatz Mio €', 'DB %', 'Neukunden'], filterSpalten: [],
      zeilen: [['Onlineshop','23,4','39 %','31 %'],['Filialen DE','13,0','37 %','22 %'],['Filialen CH','6,2','40 %','19 %'],['B2B/Gewerbe','4,2','30 %','28 %']] },

    // Marketing
    mkt_kampagne: { titel: 'Kampagnen', spalten: ['Kampagne', 'Spend T€', 'Umsatz T€', 'ROAS', 'Kanal'], filterSpalten: [4],
      zeilen: [['Frühjahr E-Bike','420','2.310','5,5','Search'],['Performance Search','310','1.395','4,5','Search'],['Social Awareness','180','540','3,0','Social'],['Retargeting','150','975','6,5','Display'],['Print/Messe','120','300','2,5','Offline']] },
    mkt_kanal: { titel: 'ROI je Kanal', spalten: ['Kanal', 'Spend T€', 'ROAS', 'CAC €'], filterSpalten: [],
      zeilen: [['Search','730','5,1','52'],['Social','180','3,0','61'],['Display','150','6,5','28'],['Offline','120','2,5','—']] },

    // Risiko-/Forderungscontrolling
    ris_kunde: { titel: 'Offene Posten je Kunde', spalten: ['Kunde', 'Offen €', 'davon >60 Tg', 'Bonität'], filterSpalten: [3], drillTo: { perspektive: 'verkaufsrechnung', keySpalte: 0, label: 'Verkaufsrechnungen' },
      zeilen: [['Stadtflotte NL','31.200','12.000','B'],['Radhaus Müller e.K.','12.340','0','A'],['Velo Schweiz AG','58.900','0','A'],['Bike Discount X','42.500','22.000','C']] },
    ris_verkaufsrechnung: { titel: 'Überfällige Verkaufsrechnungen', spalten: ['Rechnung-Nr', 'Kunde', 'Betrag €', 'Überfällig', 'Status'], filterSpalten: [4],
      zeilen: [['AR-2025-04533','Stadtflotte NL','31.200','24 Tg','1. Mahnung'],['AR-2025-04188','Bike Discount X','42.500','71 Tg','Inkasso'],['AR-2025-04402','Radhaus Müller e.K.','12.340','5 Tg','offen']] },

    // Personalcontrolling
    pc_kostenstelle: { titel: 'Personalkosten je Kostenstelle', spalten: ['Kostenstelle', 'FTE', 'Kosten T€', 'Fluktuation'], filterSpalten: [],
      zeilen: [['Filialen DE/CH/NL','186','5.200','12,4 %'],['Onlineshop & Service','64','2.100','8,1 %'],['Produktion & Logistik','96','2.400','6,5 %'],['Verwaltung/IT/Finanzen','26','800','4,2 %']] },
    pc_mitarbeiter: { titel: 'Kennzahlen je Mitarbeitergruppe', spalten: ['Gruppe', 'FTE', 'Überstunden %', 'Krankenstand'], filterSpalten: [],
      zeilen: [['Filialverkauf','176','3,1 %','5,2 %'],['Werkstatt/Service','58','4,8 %','4,1 %'],['Produktion','82','5,4 %','5,6 %'],['Verwaltung','24','1,9 %','3,2 %']] },

    // Supply-Chain-Controlling
    scc_artikel: { titel: 'Bestand/Umschlag je Artikel', spalten: ['Artikel-Nr', 'Bezeichnung', 'Bestand €', 'Reichw.', 'ABC'], filterSpalten: [4],
      zeilen: [['10042','E-Bike Urban 500','831.800','42 Tg','A'],['R-2201','Antriebseinheit M3','592.800','96 Tg','A'],['20155','Trekking City 7','448.000','58 Tg','B'],['40455','Schloss Faltschloss','37.800','120 Tg','C']] },
    scc_lager: { titel: 'Bestand je Lagerort', spalten: ['Lagerort', 'Wert Mio €', 'Auslastung', 'Typ'], filterSpalten: [3],
      zeilen: [['Zentrallager DE','7,8','88 %','eigen'],['Reservelager Nord','1,4','62 %','extern'],['Saisonlager Süd','1,1','55 %','extern'],['Hub Schweiz','0,9','71 %','extern']] },

    // Kosten- & Leistungsrechnung
    klr_kostenstelle: { titel: 'Kostenstellen Plan/Ist', spalten: ['Kostenstelle', 'Plan T€', 'Ist T€', 'Abw.', 'Verantwortl.'], filterSpalten: [4],
      zeilen: [['Fertigung','18.200','18.900','+700','Schmidt'],['Montage','6.400','6.600','+200','Weber'],['Vertrieb','9.800','9.600','−200','Klein'],['Verwaltung','5.100','5.000','−100','Braun'],['IT','1.100','1.100','0','Lang']] },
    klr_konto: { titel: 'Kostenarten (Konten)', spalten: ['Konto', 'Kostenart', 'Ist T€', 'Typ'], filterSpalten: [3],
      zeilen: [['6000','Materialaufwand','24.800','Einzelkosten'],['6200','Personalaufwand','10.500','Gemeinkosten'],['6500','Energie/Raum','3.100','Gemeinkosten'],['6700','Marketing','4.900','Gemeinkosten'],['6900','Sonstige','4.300','Gemeinkosten']] },
    klr_produkt: { titel: 'Kostenträger (Produktgruppen)', spalten: ['Produktgruppe', 'HK T€', 'Erlös T€', 'DB %'], filterSpalten: [],
      zeilen: [['E-Bikes','18.900','30.100','37 %'],['City/Trekking','6.300','9.600','34 %'],['Teile','5.400','8.800','39 %'],['Zubehör','3.200','5.700','44 %']] },

    // Finanzbuchhaltung & Abschluss
    fibu_konto: { titel: 'Salden je Sachkonto', spalten: ['Konto', 'Bezeichnung', 'Saldo €', 'Klasse'], filterSpalten: [3],
      zeilen: [['0200','Sachanlagen','9.800.000','Aktiva'],['1400','Vorräte','11.200.000','Aktiva'],['1200','Bank','6.300.000','Aktiva'],['0800','Eigenkapital','11.200.000','Passiva'],['3000','Rückstellungen','3.600.000','Passiva'],['1600','Verbindl. LuL','13.700.000','Passiva']] },
    fibu_kostenstelle: { titel: 'Abschluss je Kostenstelle', spalten: ['Kostenstelle', 'Aufwand T€', 'Abgrenzung T€', 'Status'], filterSpalten: [3],
      zeilen: [['Fertigung','18.900','120','gebucht'],['Vertrieb','9.600','85','gebucht'],['Verwaltung','5.000','40','offen'],['IT','1.100','10','gebucht']] },
    fibu_profitcenter: { titel: 'Ergebnis je Profit-Center', spalten: ['Profit-Center', 'Umsatz Mio €', 'EBIT Mio €', 'Marge'], filterSpalten: [],
      zeilen: [['PC Online','23,4','0,9','3,8 %'],['PC Filialen DE','13,0','0,2','1,5 %'],['PC Filialen CH','6,2','0,3','4,8 %'],['PC B2B/Leasing','6,8','0,1','1,5 %'],['PC Service','6,0','0,2','3,3 %']] },

    // Treasury
    tre_tranche: { titel: 'Finanztranchen', spalten: ['Instrument', 'Volumen Mio €', 'Zins', 'Bindung', 'Typ'], filterSpalten: [4],
      zeilen: [['Bankdarlehen A','4,5','3,4 %','fest','fest'],['Bankdarlehen B','2,6','4,8 %','variabel','variabel'],['Kontokorrent','1,2','5,5 %','variabel','variabel'],['Leasing','0,8','3,1 %','fest','fest']] },

    // Nachhaltigkeits-/ESG
    esg_standort: { titel: 'CO₂ je Standort (t)', spalten: ['Standort', 'Scope 1', 'Scope 2', 'Gesamt', 'Land'], filterSpalten: [4],
      zeilen: [['Werk DE','310','420','1.980','DE'],['Filialen DE','40','90','420','DE'],['Filialen CH','30','40','280','CH'],['Filialen NL','40','60','300','NL']] },
    esg_produkt: { titel: 'CO₂ je Produktgruppe (kg/Stück)', spalten: ['Produktgruppe', 'CO₂/Stück', 'Rezyklat %', 'Trend'], filterSpalten: [],
      zeilen: [['E-Bikes','142','38 %','▼'],['City/Trekking','96','41 %','▼'],['Teile','24','52 %','▬'],['Zubehör','11','60 %','▼']] },

    // Qualität
    qm_artikel: { titel: 'Reklamationen je Artikel', spalten: ['Artikel-Nr', 'Bezeichnung', 'Quote', 'Top-Ursache'], filterSpalten: [3], drillTo: { perspektive: 'auftrag', keySpalte: 1, label: 'Nacharbeit je Auftrag' },
      zeilen: [['10088','E-MTB Trail Pro','1,9 %','Antrieb/Elektronik'],['10042','E-Bike Urban 500','1,4 %','Display'],['20155','Trekking City 7','0,9 %','Bremsen'],['R-2201','Antriebseinheit M3','2,2 %','Lager']] },
    qm_lieferant: { titel: 'Reklamationen je Lieferant', spalten: ['Lieferant', 'Quote', 'Fälle', 'Bewertung'], filterSpalten: [3],
      zeilen: [['Antrieb & Schaltung AG','2,1 %','142','kritisch'],['RahmenStahl GmbH','0,8 %','38','ok'],['Handelsware Süd','1,1 %','61','beobachten'],['Zubehör Import','1,4 %','54','beobachten']] },
    qm_auftrag: { titel: 'Nacharbeit je Auftrag', spalten: ['FA-Nr', 'Artikel', 'Nacharbeit %', 'Status'], filterSpalten: [3],
      zeilen: [['FA-77120','E-Bike Urban 500','3,1 %','geschlossen'],['FA-77135','E-MTB Trail Pro','4,2 %','offen'],['FA-77150','Trekking City 7','2,4 %','geschlossen']] },

    // HR
    hr_kostenstelle: { titel: 'Belegschaft je Kostenstelle', spalten: ['Kostenstelle', 'FTE', 'Fluktuation', 'Offene Stellen'], filterSpalten: [],
      zeilen: [['Filialen DE/CH/NL','186','12,4 %','9'],['Onlineshop & Service','64','8,1 %','3'],['Produktion & Logistik','96','6,5 %','2'],['Verwaltung/IT/Finanzen','26','4,2 %','0']] },
    hr_mitarbeiter: { titel: 'Kennzahlen je Mitarbeitergruppe', spalten: ['Gruppe', 'FTE', 'Ø Zugehörigkeit', 'Krankenstand'], filterSpalten: [],
      zeilen: [['Filialverkauf','176','4,2 J','5,2 %'],['Werkstatt/Service','58','6,1 J','4,1 %'],['Produktion','82','8,4 J','5,6 %'],['Verwaltung','24','9,8 J','3,2 %']] }
  }
}

// -------------------------------------------------------------------------
//  Großdatensatz für die Verkaufsrechnungen — deterministisch generiert,
//  damit die Tabellen-Virtualisierung an realistischer Zeilenzahl greift.
//  (Im Echtbetrieb liefert das MSSQL-Backend die Belegliste.)
// -------------------------------------------------------------------------
;(function belegeAuffuellen() {
  const liste = MOCK.perspektiven?.vk_verkaufsrechnung
  if (!liste) return
  const kunden = ['Stadtwerke Leasing GmbH', 'Radhaus Müller e.K.', 'Velo Schweiz AG', 'Stadtflotte NL',
    'Onlineshop Sammelrg.', 'BikeWorld B2B', 'CityRad Hamburg', 'Alpentour AG', 'PedalPower e.K.', 'Leasing Nord']
  const status = ['bezahlt', 'offen', 'überfällig', 'bezahlt', 'bezahlt', 'offen']
  let seed = 4242
  const rnd = () => (seed = (seed * 1103515245 + 12345) & 0x7fffffff) / 0x7fffffff
  const zusatz = []
  for (let i = 0; i < 640; i++) {
    const nr = `AR-2025-${String(5000 + i).padStart(5, '0')}`
    const tag = String(1 + Math.floor(rnd() * 27)).padStart(2, '0')
    const monat = String(1 + Math.floor(rnd() * 5)).padStart(2, '0')
    const betrag = (800 + Math.floor(rnd() * 149000)).toLocaleString('de-DE')
    zusatz.push([nr, `${tag}.${monat}.2025`, kunden[Math.floor(rnd() * kunden.length)], betrag, status[Math.floor(rnd() * status.length)]])
  }
  liste.zeilen = [...liste.zeilen, ...zusatz]
})()
