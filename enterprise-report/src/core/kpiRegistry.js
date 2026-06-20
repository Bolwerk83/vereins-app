// =========================================================================
//  KPI-REGISTRY — das Herz des metadaten-getriebenen Reportings.
//
//  JEDE Kennzahl ist hier EINMAL als Metadatum definiert: Bedeutung,
//  Einheit, Ziel, Ampel-Richtung, ABHÄNGIGKEITEN und – ganz wichtig –
//  die Referenz auf die SQL-Datei, die DU später mit MSSQL-Logik füllst
//  (`sql/<sqlRef>.kpi.sql`).
//
//  Roher (gemessener) Wert  -> kommt aus SQL/MSSQL bzw. Mock.
//  Abgeleiteter Wert        -> wird aus `abhaengig` + `berechne()` berechnet.
//                              So sind Abhängigkeiten EXPLIZIT & dokumentiert.
// =========================================================================

export const KPI = {
  // ---- Konzern / GF -----------------------------------------------------
  nettoumsatz: {
    id: 'nettoumsatz', name: 'Nettoumsatz', einheit: 'eur_mio',
    bereich: 'GF', ziel: 52.0, richtung: 'hoch_gut',
    beschreibung: 'Bruttoumsatz abzgl. Erlösschmälerungen, konsolidiert in EUR.',
    sqlRef: 'nettoumsatz', abhaengig: [], security: null
  },
  bruttoumsatz: {
    id: 'bruttoumsatz', name: 'Bruttoumsatz', einheit: 'eur_mio',
    bereich: 'FIN', ziel: null, richtung: 'hoch_gut',
    beschreibung: 'Fakturierter Umsatz vor Erlösschmälerungen.',
    sqlRef: 'bruttoumsatz', abhaengig: [], security: null
  },
  erloesschmaelerung: {
    id: 'erloesschmaelerung', name: 'Erlösschmälerung', einheit: 'eur_mio',
    bereich: 'FIN', ziel: null, richtung: 'tief_gut',
    beschreibung: 'Retouren, Skonti, Rabatte. Haupttreiber: Online-Retouren.',
    sqlRef: 'erloesschmaelerung', abhaengig: [], security: null
  },
  wareneinsatz: {
    id: 'wareneinsatz', name: 'Wareneinsatz', einheit: 'eur_mio',
    bereich: 'FIN', ziel: 31.2, richtung: 'tief_gut',
    beschreibung: 'Material- und Handelswareneinsatz (COGS).',
    sqlRef: 'wareneinsatz', abhaengig: [], security: null
  },
  db1: {
    id: 'db1', name: 'Deckungsbeitrag I', einheit: 'eur_mio',
    bereich: 'FIN', ziel: 20.8, richtung: 'hoch_gut',
    beschreibung: 'Nettoumsatz − Wareneinsatz. Abgeleitete Kennzahl.',
    sqlRef: null, abhaengig: ['nettoumsatz', 'wareneinsatz'],
    berechne: (v) => v.nettoumsatz - v.wareneinsatz, security: null
  },
  dbQuote: {
    id: 'dbQuote', name: 'DB-Quote', einheit: 'percent',
    bereich: 'GF', ziel: 40.0, richtung: 'hoch_gut', warn: 0.95,
    beschreibung: 'DB I in % vom Nettoumsatz. Zentrale Margenkennzahl.',
    sqlRef: null, abhaengig: ['db1', 'nettoumsatz'],
    berechne: (v) => (v.db1 / v.nettoumsatz) * 100, security: null
  },
  wareneinsatzquote: {
    id: 'wareneinsatzquote', name: 'Wareneinsatzquote', einheit: 'percent',
    bereich: 'GF', ziel: 60.0, richtung: 'tief_gut', warn: 0.97,
    beschreibung: 'Wareneinsatz in % vom Nettoumsatz. Hebel #1 (Einkauf+Produktion).',
    sqlRef: null, abhaengig: ['wareneinsatz', 'nettoumsatz'],
    berechne: (v) => (v.wareneinsatz / v.nettoumsatz) * 100, security: null
  },
  ebitda: {
    id: 'ebitda', name: 'EBITDA', einheit: 'eur_mio',
    bereich: 'FIN', ziel: 2.6, richtung: 'hoch_gut',
    beschreibung: 'Ergebnis vor Zinsen, Steuern, Abschreibungen.',
    sqlRef: 'ebitda', abhaengig: [], security: null
  },
  ebit: {
    id: 'ebit', name: 'EBIT', einheit: 'eur_mio',
    bereich: 'FIN', ziel: 1.8, richtung: 'hoch_gut',
    beschreibung: 'Operatives Ergebnis nach Abschreibungen.',
    sqlRef: 'ebit', abhaengig: [], security: null
  },

  // ---- Verkauf ----------------------------------------------------------
  onlineAnteil: {
    id: 'onlineAnteil', name: 'Online-Anteil', einheit: 'percent0',
    bereich: 'VK', ziel: 45, richtung: 'hoch_gut',
    beschreibung: 'Umsatzanteil Onlineshop. Margenstärkster Kanal.',
    sqlRef: 'online_anteil', abhaengig: [], security: null
  },
  retourenquote: {
    id: 'retourenquote', name: 'Retourenquote (online)', einheit: 'percent',
    bereich: 'VK', ziel: 7.0, richtung: 'tief_gut', warn: 0.7,
    beschreibung: 'Retouren in % vom Online-Bruttoumsatz. Achillesferse.',
    sqlRef: 'retourenquote', abhaengig: [], security: null
  },

  // ---- Einkauf ----------------------------------------------------------
  einkaufsvolumen: {
    id: 'einkaufsvolumen', name: 'Einkaufsvolumen', einheit: 'eur_mio',
    bereich: 'EK', ziel: null, richtung: 'tief_gut',
    beschreibung: 'Bestellvolumen Material + Handelsware.',
    sqlRef: 'einkaufsvolumen', abhaengig: [], security: null
  },
  liefertreue: {
    id: 'liefertreue', name: 'Liefertreue', einheit: 'percent0',
    bereich: 'EK', ziel: 95, richtung: 'hoch_gut', warn: 0.95,
    beschreibung: 'Termin- und mengengerechte Lieferungen.',
    sqlRef: 'liefertreue', abhaengig: [], security: null
  },

  // ---- Produktion -------------------------------------------------------
  ausschuss: {
    id: 'ausschuss', name: 'Ausschussquote', einheit: 'percent',
    bereich: 'PR', ziel: 1.5, richtung: 'tief_gut', warn: 0.75,
    beschreibung: 'Ausschuss in % der Fertigungsmenge.',
    sqlRef: 'ausschuss', abhaengig: [], security: null
  },
  auslastung: {
    id: 'auslastung', name: 'Auslastung', einheit: 'percent0',
    bereich: 'PR', ziel: 85, richtung: 'hoch_gut',
    beschreibung: 'Kapazitätsauslastung Fertigung/Montage.',
    sqlRef: 'auslastung', abhaengig: [], security: null
  },

  // ---- Logistik ---------------------------------------------------------
  lagerbestand: {
    id: 'lagerbestand', name: 'Lagerbestand', einheit: 'eur_mio',
    bereich: 'LOG', ziel: 7.5, richtung: 'tief_gut', warn: 0.8,
    beschreibung: 'Bestandswert gesamt. Hebel #2 (Bestandsabbau).',
    sqlRef: 'lagerbestand', abhaengig: [], security: null
  },
  reichweite: {
    id: 'reichweite', name: 'Reichweite', einheit: 'days',
    bereich: 'LOG', ziel: 40, richtung: 'tief_gut', warn: 0.8,
    beschreibung: 'Bestandsreichweite in Tagen. Treiber des Cash Conversion Cycle.',
    sqlRef: 'reichweite', abhaengig: [], security: null
  },

  // ---- HR (Object-Level-Security!) -------------------------------------
  personalkosten: {
    id: 'personalkosten', name: 'Personalkosten', einheit: 'eur_mio',
    bereich: 'HR', ziel: null, richtung: 'tief_gut',
    beschreibung: 'Größter Fixkostenblock. Sichtbar nur HR/FIN/GF.',
    sqlRef: 'personalkosten', abhaengig: [],
    security: ['GF', 'HR', 'FIN']            // <-- Object-Level-Security
  },
  fluktuation: {
    id: 'fluktuation', name: 'Fluktuation', einheit: 'percent',
    bereich: 'HR', ziel: 8.0, richtung: 'tief_gut', warn: 0.8,
    beschreibung: 'Personalfluktuation p. a. Schwerpunkt Filialverkauf.',
    sqlRef: 'fluktuation', abhaengig: [],
    security: ['GF', 'HR', 'FIN']
  },

  // ---- IT ---------------------------------------------------------------
  shopVerfuegbarkeit: {
    id: 'shopVerfuegbarkeit', name: 'Shop-Verfügbarkeit', einheit: 'percent',
    bereich: 'IT', ziel: 99.9, richtung: 'hoch_gut', warn: 0.999,
    beschreibung: 'Verfügbarkeit Onlineshop. Geschäftskritisch (45 % Umsatz).',
    sqlRef: 'shop_verfuegbarkeit', abhaengig: [], security: null
  },

  // ---- Finanzen ---------------------------------------------------------
  cashConversion: {
    id: 'cashConversion', name: 'Cash Conversion Cycle', einheit: 'days',
    bereich: 'FIN', ziel: 40, richtung: 'tief_gut', warn: 0.8,
    beschreibung: 'Kapitalbindungsdauer. Wird durch Bestandsreichweite getrieben.',
    sqlRef: 'cash_conversion', abhaengig: ['reichweite'], security: null
  },

  // ---- Kosten- & Leistungsrechnung (KLR) -------------------------------
  produktionsmenge: {
    id: 'produktionsmenge', name: 'Produktionsmenge', einheit: 'count',
    bereich: 'KLR', ziel: 24800, richtung: 'hoch_gut',
    beschreibung: 'Gefertigte Räder p. a. — Bezugsgröße der Stückkostenrechnung.',
    sqlRef: 'produktionsmenge', abhaengig: [], security: null
  },
  herstellkosten: {
    id: 'herstellkosten', name: 'Herstellkosten', einheit: 'eur_mio',
    bereich: 'KLR', ziel: 31.5, richtung: 'tief_gut',
    beschreibung: 'Herstellkosten gesamt (Material + Fertigung), Kostenträgerrechnung.',
    sqlRef: 'herstellkosten', abhaengig: [], security: null
  },
  gemeinkosten: {
    id: 'gemeinkosten', name: 'Gemeinkosten', einheit: 'eur_mio',
    bereich: 'KLR', ziel: null, richtung: 'tief_gut',
    beschreibung: 'Nicht direkt zurechenbare Kosten (Verwaltung, Vertrieb, …).',
    sqlRef: 'gemeinkosten', abhaengig: [], security: null
  },
  gesamtkosten: {
    id: 'gesamtkosten', name: 'Gesamtkosten', einheit: 'eur_mio',
    bereich: 'KLR', ziel: 50.6, richtung: 'tief_gut',
    beschreibung: 'Gesamte Periodenkosten der KLR (Einzel- + Gemeinkosten).',
    sqlRef: 'gesamtkosten', abhaengig: [], security: null
  },
  herstellkostenJeRad: {
    id: 'herstellkostenJeRad', name: 'Herstellkosten / Rad', einheit: 'eur',
    bereich: 'KLR', ziel: 1280, richtung: 'tief_gut', warn: 0.97,
    beschreibung: 'Herstellkosten je gefertigtem Rad. Abgeleitet (Herstellkosten ÷ Menge).',
    sqlRef: null, abhaengig: ['herstellkosten', 'produktionsmenge'],
    berechne: (v) => (v.herstellkosten * 1e6) / v.produktionsmenge, security: null
  },
  gemeinkostenquote: {
    id: 'gemeinkostenquote', name: 'Gemeinkostenquote', einheit: 'percent',
    bereich: 'KLR', ziel: 28, richtung: 'tief_gut', warn: 0.97,
    beschreibung: 'Gemeinkosten in % der Gesamtkosten. Abgeleitet.',
    sqlRef: null, abhaengig: ['gemeinkosten', 'gesamtkosten'],
    berechne: (v) => (v.gemeinkosten / v.gesamtkosten) * 100, security: null
  },

  // ---- Absatz- & Umsatzprognose (FC) -----------------------------------
  absatzprognose: {
    id: 'absatzprognose', name: 'Absatzprognose', einheit: 'count',
    bereich: 'FC', ziel: 26500, richtung: 'hoch_gut',
    beschreibung: 'Prognostizierte Absatzmenge (rollierend, nächste Periode).',
    sqlRef: 'absatzprognose', abhaengig: [], security: null
  },
  umsatzprognose: {
    id: 'umsatzprognose', name: 'Umsatzprognose', einheit: 'eur_mio',
    bereich: 'FC', ziel: 55.0, richtung: 'hoch_gut',
    beschreibung: 'Prognostizierter Nettoumsatz (rollierend).',
    sqlRef: 'umsatzprognose', abhaengig: [], security: null
  },
  forecastGenauigkeit: {
    id: 'forecastGenauigkeit', name: 'Prognosegüte', einheit: 'percent',
    bereich: 'FC', ziel: 90, richtung: 'hoch_gut', warn: 0.95,
    beschreibung: 'Prognosegüte (100 − MAPE) der letzten Perioden.',
    sqlRef: 'forecast_genauigkeit', abhaengig: [], security: null
  },
  auftragsbestand: {
    id: 'auftragsbestand', name: 'Auftragsbestand', einheit: 'eur_mio',
    bereich: 'FC', ziel: null, richtung: 'hoch_gut',
    beschreibung: 'Orderbuch als Frühindikator für den künftigen Umsatz.',
    sqlRef: 'auftragsbestand', abhaengig: [], security: null
  },
  prognoseWachstum: {
    id: 'prognoseWachstum', name: 'Prognost. Wachstum', einheit: 'percent',
    bereich: 'FC', ziel: 5, richtung: 'hoch_gut',
    beschreibung: 'Erwartetes Umsatzwachstum ggü. Ist. Abgeleitet (Umsatzprognose vs. Nettoumsatz).',
    sqlRef: null, abhaengig: ['umsatzprognose', 'nettoumsatz'],
    berechne: (v) => (v.umsatzprognose / v.nettoumsatz - 1) * 100, security: null
  },

  // ---- Umsatz-, Kosten- & Erfolgsplanung (PLAN) ------------------------
  umsatzplan: {
    id: 'umsatzplan', name: 'Umsatzplan', einheit: 'eur_mio',
    bereich: 'PLAN', ziel: null, richtung: 'hoch_gut',
    beschreibung: 'Geplanter Nettoumsatz der Periode (Budget).',
    sqlRef: 'umsatzplan', abhaengig: [], security: null
  },
  kostenplan: {
    id: 'kostenplan', name: 'Kostenplan', einheit: 'eur_mio',
    bereich: 'PLAN', ziel: null, richtung: 'tief_gut',
    beschreibung: 'Geplante Gesamtkosten der Periode (Budget).',
    sqlRef: 'kostenplan', abhaengig: [], security: null
  },
  ebitPlan: {
    id: 'ebitPlan', name: 'EBIT-Plan', einheit: 'eur_mio',
    bereich: 'PLAN', ziel: null, richtung: 'hoch_gut',
    beschreibung: 'Geplantes operatives Ergebnis (Budget).',
    sqlRef: 'ebit_plan', abhaengig: [], security: null
  },
  umsatzZielerreichung: {
    id: 'umsatzZielerreichung', name: 'Umsatz-Zielerreichung', einheit: 'percent',
    bereich: 'PLAN', ziel: 100, richtung: 'hoch_gut', warn: 0.95,
    beschreibung: 'Ist-Nettoumsatz in % vom Plan. Abgeleitet.',
    sqlRef: null, abhaengig: ['nettoumsatz', 'umsatzplan'],
    berechne: (v) => (v.nettoumsatz / v.umsatzplan) * 100, security: null
  },
  ergebnisZielerreichung: {
    id: 'ergebnisZielerreichung', name: 'EBIT-Zielerreichung', einheit: 'percent',
    bereich: 'PLAN', ziel: 100, richtung: 'hoch_gut', warn: 0.9,
    beschreibung: 'Ist-EBIT in % vom Plan. Abgeleitet — zeigt die Ergebnislücke.',
    sqlRef: null, abhaengig: ['ebit', 'ebitPlan'],
    berechne: (v) => (v.ebit / v.ebitPlan) * 100, security: null
  },
  kostendisziplin: {
    id: 'kostendisziplin', name: 'Kostendisziplin', einheit: 'percent',
    bereich: 'PLAN', ziel: 100, richtung: 'hoch_gut', warn: 0.98,
    beschreibung: 'Kostenplan in % der Ist-Gesamtkosten (≥100 = im Budget). Abgeleitet.',
    sqlRef: null, abhaengig: ['kostenplan', 'gesamtkosten'],
    berechne: (v) => (v.kostenplan / v.gesamtkosten) * 100, security: null
  },

  // ---- Produktionsplanung (PP) -----------------------------------------
  produktionsplan: {
    id: 'produktionsplan', name: 'Produktionsplan', einheit: 'count',
    bereich: 'PP', ziel: null, richtung: 'hoch_gut',
    beschreibung: 'Geplante Fertigungsmenge der Periode (Programmplanung).',
    sqlRef: 'produktionsplan', abhaengig: [], security: null
  },
  kapazitaet: {
    id: 'kapazitaet', name: 'Kapazität', einheit: 'count',
    bereich: 'PP', ziel: null, richtung: 'hoch_gut',
    beschreibung: 'Verfügbare Fertigungskapazität (Räder/Periode) aus dem Schichtmodell.',
    sqlRef: 'kapazitaet', abhaengig: [], security: null
  },
  schichtauslastung: {
    id: 'schichtauslastung', name: 'Schichtauslastung', einheit: 'percent0',
    bereich: 'PP', ziel: 85, richtung: 'hoch_gut',
    beschreibung: 'Ist-Auslastung der geplanten Schichten.',
    sqlRef: 'schichtauslastung', abhaengig: [], security: null
  },
  liefertermintreue: {
    id: 'liefertermintreue', name: 'Liefertermintreue', einheit: 'percent0',
    bereich: 'PP', ziel: 95, richtung: 'hoch_gut', warn: 0.95,
    beschreibung: 'Termingerecht fertiggestellte Fertigungsaufträge.',
    sqlRef: 'liefertermintreue', abhaengig: [], security: null
  },
  kapazitaetsauslastung: {
    id: 'kapazitaetsauslastung', name: 'Kapazitätsauslastung (Plan)', einheit: 'percent',
    bereich: 'PP', ziel: 90, richtung: 'hoch_gut', warn: 0.9,
    beschreibung: 'Produktionsplan in % der Kapazität. Abgeleitet — Engpass-/Leerstands-Anzeige.',
    sqlRef: null, abhaengig: ['produktionsplan', 'kapazitaet'],
    berechne: (v) => (v.produktionsplan / v.kapazitaet) * 100, security: null
  },
  planErfuellungProduktion: {
    id: 'planErfuellungProduktion', name: 'Plan-Erfüllung Produktion', einheit: 'percent',
    bereich: 'PP', ziel: 100, richtung: 'hoch_gut', warn: 0.97,
    beschreibung: 'Ist-Menge in % vom Produktionsplan. Abgeleitet (Abgleich Plan↔Ist).',
    sqlRef: null, abhaengig: ['produktionsmenge', 'produktionsplan'],
    berechne: (v) => (v.produktionsmenge / v.produktionsplan) * 100, security: null
  },

  // ---- Bestands- & Supply-Chain-Controlling (SCC) ----------------------
  lieferfaehigkeit: {
    id: 'lieferfaehigkeit', name: 'Lieferfähigkeit', einheit: 'percent',
    bereich: 'SCC', ziel: 97, richtung: 'hoch_gut', warn: 0.95,
    beschreibung: 'Servicegrad ab Lager (Abstimmung mit Vertrieb). Verfügbarkeit zugesagter Ware.',
    sqlRef: 'lieferfaehigkeit', abhaengig: [], security: null
  },
  ueberbestand: {
    id: 'ueberbestand', name: 'Überbestand', einheit: 'eur_mio',
    bereich: 'SCC', ziel: 2.0, richtung: 'tief_gut', warn: 0.8,
    beschreibung: 'Bestand über Ziel-Reichweite (Abstimmung mit Einkauf/Produktion).',
    sqlRef: 'ueberbestand', abhaengig: [], security: null
  },
  lagerumschlag: {
    id: 'lagerumschlag', name: 'Lagerumschlag', einheit: 'faktor',
    bereich: 'SCC', ziel: 5, richtung: 'hoch_gut', warn: 0.9,
    beschreibung: 'Umschlagshäufigkeit p. a. Abgeleitet (Wareneinsatz ÷ Lagerbestand).',
    sqlRef: null, abhaengig: ['wareneinsatz', 'lagerbestand'],
    berechne: (v) => v.wareneinsatz / v.lagerbestand, security: null
  },

  // ---- Finanzbuchhaltung & Abschluss (FIBU) ----------------------------
  abschlussdauer: {
    id: 'abschlussdauer', name: 'Abschlussdauer', einheit: 'days',
    bereich: 'FIBU', ziel: 5, richtung: 'tief_gut', warn: 0.7,
    beschreibung: 'Arbeitstage bis zum fertigen Monatsabschluss (Fast Close).',
    sqlRef: 'abschlussdauer', abhaengig: [], security: null
  },
  rueckstellungen: {
    id: 'rueckstellungen', name: 'Rückstellungen', einheit: 'eur_mio',
    bereich: 'FIBU', ziel: null, richtung: 'tief_gut',
    beschreibung: 'Summe der Rückstellungen (Garantie, Personal, drohende Verluste …).',
    sqlRef: 'rueckstellungen', abhaengig: [], security: null
  },
  bilanzsumme: {
    id: 'bilanzsumme', name: 'Bilanzsumme', einheit: 'eur_mio',
    bereich: 'FIBU', ziel: null, richtung: 'hoch_gut',
    beschreibung: 'Summe Aktiva = Summe Passiva zum Stichtag.',
    sqlRef: 'bilanzsumme', abhaengig: [], security: null
  },
  eigenkapital: {
    id: 'eigenkapital', name: 'Eigenkapital', einheit: 'eur_mio',
    bereich: 'FIBU', ziel: null, richtung: 'hoch_gut',
    beschreibung: 'Bilanzielles Eigenkapital zum Stichtag.',
    sqlRef: 'eigenkapital', abhaengig: [], security: null
  },
  handelsrechtlichesErgebnis: {
    id: 'handelsrechtlichesErgebnis', name: 'Ergebnis (FiBu/HGB)', einheit: 'eur_mio',
    bereich: 'FIBU', ziel: null, richtung: 'hoch_gut',
    beschreibung: 'Handelsrechtliches Jahresergebnis aus der Finanzbuchhaltung.',
    sqlRef: 'handelsrechtliches_ergebnis', abhaengig: [], security: null
  },
  neutralesErgebnis: {
    id: 'neutralesErgebnis', name: 'Neutrales Ergebnis', einheit: 'eur_mio',
    bereich: 'FIBU', ziel: null, richtung: 'tief_gut',
    beschreibung: 'Betriebsfremde/periodenfremde/außerordentliche Posten (Abgrenzung).',
    sqlRef: 'neutrales_ergebnis', abhaengig: [], security: null
  },
  eigenkapitalquote: {
    id: 'eigenkapitalquote', name: 'Eigenkapitalquote', einheit: 'percent',
    bereich: 'FIBU', ziel: 40, richtung: 'hoch_gut', warn: 0.95,
    beschreibung: 'Eigenkapital in % der Bilanzsumme. Abgeleitet.',
    sqlRef: null, abhaengig: ['eigenkapital', 'bilanzsumme'],
    berechne: (v) => (v.eigenkapital / v.bilanzsumme) * 100, security: null
  },
  betrieblichesErgebnis: {
    id: 'betrieblichesErgebnis', name: 'Betriebsergebnis (Controlling)', einheit: 'eur_mio',
    bereich: 'FIBU', ziel: 1.8, richtung: 'hoch_gut',
    beschreibung: 'Controlling-Sicht: FiBu-Ergebnis bereinigt um neutrale Posten (Abgrenzungsrechnung).',
    sqlRef: null, abhaengig: ['handelsrechtlichesErgebnis', 'neutralesErgebnis'],
    berechne: (v) => v.handelsrechtlichesErgebnis - v.neutralesErgebnis, security: null
  }
}

// --- Abhängigkeits-Auflösung (topologisch) -------------------------------
// Liefert für eine Menge roher Werte ALLE (auch abgeleiteten) KPI-Werte.
export function berechneAlle(roheWerte) {
  const werte = { ...roheWerte }
  const offen = Object.values(KPI).filter((k) => typeof k.berechne === 'function')
  let runde = 0
  while (offen.length && runde++ < 10) {
    for (let i = offen.length - 1; i >= 0; i--) {
      const k = offen[i]
      if (k.abhaengig.every((d) => werte[d] != null)) {
        werte[k.id] = k.berechne(werte)
        offen.splice(i, 1)
      }
    }
  }
  return werte
}

// --- Abhängigkeitsgraph (für Doku/Visualisierung) ------------------------
export function abhaengigkeitsGraph() {
  return Object.values(KPI).map((k) => ({
    id: k.id, name: k.name, abhaengt_von: k.abhaengig,
    quelle: k.sqlRef ? `sql/${k.sqlRef}.kpi.sql` : 'berechnet'
  }))
}
