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
      shopVerfuegbarkeit: 99.88, cashConversion: 48
    },
    '2024': {
      bruttoumsatz: 53.0, erloesschmaelerung: 3.3, nettoumsatz: 48.1,
      wareneinsatz: 29.6, ebitda: 2.3, ebit: 1.6,
      onlineAnteil: 42, retourenquote: 10.7,
      einkaufsvolumen: 29.7, liefertreue: 92,
      ausschuss: 2.0, auslastung: 86,
      lagerbestand: 9.4, reichweite: 57,
      personalkosten: 10.0, fluktuation: 9.1,
      shopVerfuegbarkeit: 99.85, cashConversion: 53
    },
    '2025': {
      bruttoumsatz: 55.8, erloesschmaelerung: 3.8, nettoumsatz: 52.0,
      wareneinsatz: 32.2, ebitda: 2.1, ebit: 1.4,
      onlineAnteil: 45, retourenquote: 11.2,
      einkaufsvolumen: 31.4, liefertreue: 91,
      ausschuss: 2.1, auslastung: 88,
      lagerbestand: 11.2, reichweite: 64,
      personalkosten: 10.5, fluktuation: 9.8,
      shopVerfuegbarkeit: 99.82, cashConversion: 58
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
      zeilen: [['Bruttoumsatz','55,8','E-Bikes treiben Schnitt'],['− Erlösschmälerung','−3,8','Online-Retouren'],['= Nettoumsatz','52,0','+8,1 %'],['− Wareneinsatz','−32,2','über Plan'],['= DB I','19,8','38,1 %'],['− Personal','−10,5','Filialnetz'],['− übrige OpEx','−7,05','Marketing/Logistik'],['= EBITDA','2,1','4,0 %'],['= EBIT','1,4','2,7 %']] }
  }
}
