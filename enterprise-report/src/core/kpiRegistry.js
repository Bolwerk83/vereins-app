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

import { evaluate as formelEvaluate, extractIds as formelIds, ladeCustomKpis } from './kpiFormel.js'

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
  },

  // ---- Investitions- & Liquiditätsplanung (LIQ) ------------------------
  investitionsvolumen: {
    id: 'investitionsvolumen', name: 'Investitionsvolumen', einheit: 'eur_mio',
    bereich: 'LIQ', ziel: null, richtung: 'hoch_gut',
    beschreibung: 'Getätigte Investitionen (CapEx) der Periode.',
    sqlRef: 'investitionsvolumen', abhaengig: [], security: null
  },
  investitionsbudget: {
    id: 'investitionsbudget', name: 'Investitionsbudget', einheit: 'eur_mio',
    bereich: 'LIQ', ziel: null, richtung: 'hoch_gut',
    beschreibung: 'Freigegebenes CapEx-Budget der Periode.',
    sqlRef: 'investitionsbudget', abhaengig: [], security: null
  },
  liquideMittel: {
    id: 'liquideMittel', name: 'Liquide Mittel', einheit: 'eur_mio',
    bereich: 'LIQ', ziel: 5.0, richtung: 'hoch_gut',
    beschreibung: 'Kassenbestand + Bankguthaben zum Stichtag.',
    sqlRef: 'liquide_mittel', abhaengig: [], security: null
  },
  kreditlinie: {
    id: 'kreditlinie', name: 'Freie Kreditlinie', einheit: 'eur_mio',
    bereich: 'LIQ', ziel: null, richtung: 'hoch_gut',
    beschreibung: 'Noch nicht in Anspruch genommene Kreditlinie (Reserve).',
    sqlRef: 'kreditlinie', abhaengig: [], security: null
  },
  operativerCashflow: {
    id: 'operativerCashflow', name: 'Operativer Cashflow', einheit: 'eur_mio',
    bereich: 'LIQ', ziel: 2.5, richtung: 'hoch_gut', warn: 0.9,
    beschreibung: 'Cashflow aus laufender Geschäftstätigkeit.',
    sqlRef: 'operativer_cashflow', abhaengig: [], security: null
  },
  investBudgettreue: {
    id: 'investBudgettreue', name: 'Investitions-Budgettreue', einheit: 'percent',
    bereich: 'LIQ', ziel: 100, richtung: 'hoch_gut', warn: 0.95,
    beschreibung: 'Budget in % des Ist (≥100 = im Rahmen). Abgeleitet.',
    sqlRef: null, abhaengig: ['investitionsbudget', 'investitionsvolumen'],
    berechne: (v) => (v.investitionsbudget / v.investitionsvolumen) * 100, security: null
  },
  freieLiquiditaet: {
    id: 'freieLiquiditaet', name: 'Freie Liquidität', einheit: 'eur_mio',
    bereich: 'LIQ', ziel: 8.0, richtung: 'hoch_gut', warn: 0.9,
    beschreibung: 'Liquide Mittel + freie Kreditlinie. Abgeleitet.',
    sqlRef: null, abhaengig: ['liquideMittel', 'kreditlinie'],
    berechne: (v) => v.liquideMittel + v.kreditlinie, security: null
  },

  // ---- Vertriebscontrolling (VC) ---------------------------------------
  vertriebskosten: {
    id: 'vertriebskosten', name: 'Vertriebskosten', einheit: 'eur_mio',
    bereich: 'VC', ziel: null, richtung: 'tief_gut',
    beschreibung: 'Marketing-, Vertriebs- und Provisionskosten.',
    sqlRef: 'vertriebskosten', abhaengig: [], security: null
  },
  rabattquote: {
    id: 'rabattquote', name: 'Rabattquote', einheit: 'percent',
    bereich: 'VC', ziel: 6, richtung: 'tief_gut', warn: 0.85,
    beschreibung: 'Gewährte Rabatte in % vom Bruttoumsatz.',
    sqlRef: 'rabattquote', abhaengig: [], security: null
  },
  neukundenanteil: {
    id: 'neukundenanteil', name: 'Neukundenanteil', einheit: 'percent0',
    bereich: 'VC', ziel: 25, richtung: 'hoch_gut',
    beschreibung: 'Umsatzanteil neu gewonnener Kunden.',
    sqlRef: 'neukundenanteil', abhaengig: [], security: null
  },
  vertriebskostenquote: {
    id: 'vertriebskostenquote', name: 'Vertriebskostenquote', einheit: 'percent',
    bereich: 'VC', ziel: 12, richtung: 'tief_gut', warn: 0.97,
    beschreibung: 'Vertriebskosten in % vom Nettoumsatz. Abgeleitet.',
    sqlRef: null, abhaengig: ['vertriebskosten', 'nettoumsatz'],
    berechne: (v) => (v.vertriebskosten / v.nettoumsatz) * 100, security: null
  },

  // ---- Personalcontrolling (PC) — z. T. Object-Level-Security ----------
  mitarbeiterFTE: {
    id: 'mitarbeiterFTE', name: 'Belegschaft (FTE)', einheit: 'count',
    bereich: 'PC', ziel: null, richtung: 'hoch_gut',
    beschreibung: 'Vollzeitäquivalente zum Stichtag.',
    sqlRef: 'mitarbeiter_fte', abhaengig: [], security: null
  },
  ueberstundenquote: {
    id: 'ueberstundenquote', name: 'Überstundenquote', einheit: 'percent',
    bereich: 'PC', ziel: 3, richtung: 'tief_gut', warn: 0.8,
    beschreibung: 'Überstunden in % der Soll-Arbeitszeit (Kapazitätsindikator).',
    sqlRef: 'ueberstundenquote', abhaengig: [], security: null
  },
  krankenstand: {
    id: 'krankenstand', name: 'Krankenstand', einheit: 'percent',
    bereich: 'PC', ziel: 4.2, richtung: 'tief_gut', warn: 0.85,
    beschreibung: 'Krankheitsbedingte Fehlzeitenquote.',
    sqlRef: 'krankenstand', abhaengig: [], security: null
  },
  umsatzJeFTE: {
    id: 'umsatzJeFTE', name: 'Umsatz je FTE', einheit: 'eur',
    bereich: 'PC', ziel: 140000, richtung: 'hoch_gut', warn: 0.97,
    beschreibung: 'Produktivität: Nettoumsatz je Vollzeitkraft. Abgeleitet.',
    sqlRef: null, abhaengig: ['nettoumsatz', 'mitarbeiterFTE'],
    berechne: (v) => (v.nettoumsatz * 1e6) / v.mitarbeiterFTE, security: null
  },
  personalkostenquote: {
    id: 'personalkostenquote', name: 'Personalkostenquote', einheit: 'percent',
    bereich: 'PC', ziel: 20, richtung: 'tief_gut', warn: 0.97,
    beschreibung: 'Personalkosten in % vom Nettoumsatz. Abgeleitet. Sichtbar nur GF/HR/FIN.',
    sqlRef: null, abhaengig: ['personalkosten', 'nettoumsatz'],
    berechne: (v) => (v.personalkosten / v.nettoumsatz) * 100,
    security: ['GF', 'HR', 'FIN']
  },

  // ---- Risiko- & Forderungscontrolling (RIS) ---------------------------
  offeneForderungen: {
    id: 'offeneForderungen', name: 'Offene Forderungen', einheit: 'eur_mio',
    bereich: 'RIS', ziel: null, richtung: 'tief_gut',
    beschreibung: 'Summe offener Kundenforderungen zum Stichtag.',
    sqlRef: 'offene_forderungen', abhaengig: [], security: null
  },
  ueberfaelligeForderungen: {
    id: 'ueberfaelligeForderungen', name: 'Überfällige Forderungen', einheit: 'eur_mio',
    bereich: 'RIS', ziel: null, richtung: 'tief_gut',
    beschreibung: 'Forderungen über Fälligkeit (>0 Tage überfällig).',
    sqlRef: 'ueberfaellige_forderungen', abhaengig: [], security: null
  },
  dso: {
    id: 'dso', name: 'DSO (Forderungslaufzeit)', einheit: 'days',
    bereich: 'RIS', ziel: 30, richtung: 'tief_gut', warn: 0.8,
    beschreibung: 'Days Sales Outstanding — durchschnittliche Forderungslaufzeit.',
    sqlRef: 'dso', abhaengig: [], security: null
  },
  forderungsausfall: {
    id: 'forderungsausfall', name: 'Forderungsausfallquote', einheit: 'percent',
    bereich: 'RIS', ziel: 0.5, richtung: 'tief_gut', warn: 0.7,
    beschreibung: 'Abgeschriebene Forderungen in % vom Umsatz.',
    sqlRef: 'forderungsausfall', abhaengig: [], security: null
  },
  klumpenrisikoTop3: {
    id: 'klumpenrisikoTop3', name: 'Klumpenrisiko Top-3', einheit: 'percent0',
    bereich: 'RIS', ziel: 30, richtung: 'tief_gut', warn: 0.85,
    beschreibung: 'Umsatzanteil der drei größten Kunden (Konzentrationsrisiko).',
    sqlRef: 'klumpenrisiko_top3', abhaengig: [], security: null
  },
  ueberfaelligkeitsquote: {
    id: 'ueberfaelligkeitsquote', name: 'Überfälligkeitsquote', einheit: 'percent',
    bereich: 'RIS', ziel: 10, richtung: 'tief_gut', warn: 0.8,
    beschreibung: 'Überfällige in % der offenen Forderungen. Abgeleitet.',
    sqlRef: null, abhaengig: ['ueberfaelligeForderungen', 'offeneForderungen'],
    berechne: (v) => (v.ueberfaelligeForderungen / v.offeneForderungen) * 100, security: null
  },

  // ---- Nachhaltigkeits-/ESG-Controlling (ESG) --------------------------
  co2ProRad: {
    id: 'co2ProRad', name: 'CO₂ je Rad', einheit: 'kg',
    bereich: 'ESG', ziel: 95, richtung: 'tief_gut', warn: 0.9,
    beschreibung: 'CO₂-Fußabdruck je gefertigtem Rad (Scope 1–3, kg CO₂e).',
    sqlRef: 'co2_pro_rad', abhaengig: [], security: null
  },
  co2Gesamt: {
    id: 'co2Gesamt', name: 'CO₂ gesamt', einheit: 'tonnen',
    bereich: 'ESG', ziel: null, richtung: 'tief_gut',
    beschreibung: 'Gesamtemissionen der Gruppe (t CO₂e).',
    sqlRef: 'co2_gesamt', abhaengig: [], security: null
  },
  energieJeRad: {
    id: 'energieJeRad', name: 'Energie je Rad', einheit: 'kwh',
    bereich: 'ESG', ziel: 42, richtung: 'tief_gut', warn: 0.9,
    beschreibung: 'Energieeinsatz je Rad in Fertigung & Montage.',
    sqlRef: 'energie_je_rad', abhaengig: [], security: null
  },
  oekostromanteil: {
    id: 'oekostromanteil', name: 'Ökostromanteil', einheit: 'percent0',
    bereich: 'ESG', ziel: 100, richtung: 'hoch_gut', warn: 0.85,
    beschreibung: 'Anteil erneuerbarer Energie am Stromverbrauch.',
    sqlRef: 'oekostromanteil', abhaengig: [], security: null
  },
  recyclingquote: {
    id: 'recyclingquote', name: 'Recyclingquote', einheit: 'percent0',
    bereich: 'ESG', ziel: 80, richtung: 'hoch_gut', warn: 0.9,
    beschreibung: 'Recycling-/Verwertungsquote von Material und Verpackung.',
    sqlRef: 'recyclingquote', abhaengig: [], security: null
  },

  // ---- Treasury & Zins-/Währungsrisiko (TRE) ---------------------------
  nettoverschuldung: {
    id: 'nettoverschuldung', name: 'Nettoverschuldung', einheit: 'eur_mio',
    bereich: 'TRE', ziel: null, richtung: 'tief_gut',
    beschreibung: 'Verzinsliche Verbindlichkeiten − liquide Mittel.',
    sqlRef: 'nettoverschuldung', abhaengig: [], security: null
  },
  zinsaufwand: {
    id: 'zinsaufwand', name: 'Zinsaufwand', einheit: 'eur_mio',
    bereich: 'TRE', ziel: null, richtung: 'tief_gut',
    beschreibung: 'Zinsaufwand der Periode.',
    sqlRef: 'zinsaufwand', abhaengig: [], security: null
  },
  durchschnittszins: {
    id: 'durchschnittszins', name: 'Ø Zinssatz', einheit: 'percent',
    bereich: 'TRE', ziel: 3.5, richtung: 'tief_gut', warn: 0.9,
    beschreibung: 'Durchschnittlicher Finanzierungszins über alle Tranchen.',
    sqlRef: 'durchschnittszins', abhaengig: [], security: null
  },
  hedgeQuote: {
    id: 'hedgeQuote', name: 'Hedge-Quote (FX)', einheit: 'percent0',
    bereich: 'TRE', ziel: 80, richtung: 'hoch_gut', warn: 0.9,
    beschreibung: 'Gegen Währungsrisiko abgesicherter Anteil des Exposures (v. a. CHF).',
    sqlRef: 'hedge_quote', abhaengig: [], security: null
  },
  fxExposureOffen: {
    id: 'fxExposureOffen', name: 'Offenes FX-Exposure', einheit: 'eur_mio',
    bereich: 'TRE', ziel: null, richtung: 'tief_gut',
    beschreibung: 'Nicht abgesichertes Währungsexposure (Wechselkursrisiko).',
    sqlRef: 'fx_exposure_offen', abhaengig: [], security: null
  },
  nettoverschuldungEbitda: {
    id: 'nettoverschuldungEbitda', name: 'Net Debt / EBITDA', einheit: 'faktor',
    bereich: 'TRE', ziel: 3, richtung: 'tief_gut', warn: 0.85,
    beschreibung: 'Verschuldungsgrad (Leverage). Abgeleitet. >3 gilt als hoch.',
    sqlRef: null, abhaengig: ['nettoverschuldung', 'ebitda'],
    berechne: (v) => v.nettoverschuldung / v.ebitda, security: null
  },
  zinsdeckung: {
    id: 'zinsdeckung', name: 'Zinsdeckungsgrad', einheit: 'faktor',
    bereich: 'TRE', ziel: 5, richtung: 'hoch_gut', warn: 0.8,
    beschreibung: 'EBIT ÷ Zinsaufwand (Interest Coverage). Abgeleitet.',
    sqlRef: null, abhaengig: ['ebit', 'zinsaufwand'],
    berechne: (v) => v.ebit / v.zinsaufwand, security: null
  },

  // ---- Qualitäts- & Reklamationscontrolling (QM) -----------------------
  reklamationsquote: {
    id: 'reklamationsquote', name: 'Reklamationsquote', einheit: 'percent',
    bereich: 'QM', ziel: 1.0, richtung: 'tief_gut', warn: 0.8,
    beschreibung: 'Feld-Reklamationen in % der ausgelieferten Räder.',
    sqlRef: 'reklamationsquote', abhaengig: [], security: null
  },
  nacharbeitsquote: {
    id: 'nacharbeitsquote', name: 'Nacharbeitsquote', einheit: 'percent',
    bereich: 'QM', ziel: 2.0, richtung: 'tief_gut', warn: 0.8,
    beschreibung: 'Nacharbeit in % der Fertigungsmenge (Endmontage).',
    sqlRef: 'nacharbeitsquote', abhaengig: [], security: null
  },
  firstPassYield: {
    id: 'firstPassYield', name: 'First Pass Yield', einheit: 'percent',
    bereich: 'QM', ziel: 97, richtung: 'hoch_gut', warn: 0.97,
    beschreibung: 'Anteil fehlerfrei im ersten Durchlauf gefertigter Räder.',
    sqlRef: 'first_pass_yield', abhaengig: [], security: null
  },
  garantiekosten: {
    id: 'garantiekosten', name: 'Garantiekosten', einheit: 'eur_mio',
    bereich: 'QM', ziel: null, richtung: 'tief_gut',
    beschreibung: 'Aufwand für Garantie-/Gewährleistungsfälle.',
    sqlRef: 'garantiekosten', abhaengig: [], security: null
  },
  qualitaetskostenquote: {
    id: 'qualitaetskostenquote', name: 'Fehlerkostenquote (CoPQ)', einheit: 'percent',
    bereich: 'QM', ziel: 1.0, richtung: 'tief_gut', warn: 0.85,
    beschreibung: 'Garantiekosten in % vom Nettoumsatz (Cost of Poor Quality). Abgeleitet.',
    sqlRef: null, abhaengig: ['garantiekosten', 'nettoumsatz'],
    berechne: (v) => (v.garantiekosten / v.nettoumsatz) * 100, security: null
  },

  // ---- Marketing-/Kampagnencontrolling (MKT) ---------------------------
  marketingkosten: {
    id: 'marketingkosten', name: 'Marketingkosten', einheit: 'eur_mio',
    bereich: 'MKT', ziel: null, richtung: 'tief_gut',
    beschreibung: 'Mediabudget + Kampagnenkosten (Teil der Vertriebskosten).',
    sqlRef: 'marketingkosten', abhaengig: [], security: null
  },
  roas: {
    id: 'roas', name: 'ROAS', einheit: 'faktor',
    bereich: 'MKT', ziel: 5, richtung: 'hoch_gut', warn: 0.85,
    beschreibung: 'Return on Ad Spend — Umsatz je € Mediabudget.',
    sqlRef: 'roas', abhaengig: [], security: null
  },
  cac: {
    id: 'cac', name: 'CAC', einheit: 'eur',
    bereich: 'MKT', ziel: 40, richtung: 'tief_gut', warn: 0.85,
    beschreibung: 'Customer Acquisition Cost — Kosten je gewonnenem Neukunden.',
    sqlRef: 'cac', abhaengig: [], security: null
  },
  conversionRate: {
    id: 'conversionRate', name: 'Conversion-Rate', einheit: 'percent',
    bereich: 'MKT', ziel: 3.0, richtung: 'hoch_gut', warn: 0.9,
    beschreibung: 'Bestellungen je Shop-Besuch (Onlineshop).',
    sqlRef: 'conversion_rate', abhaengig: [], security: null
  },
  marketingkostenquote: {
    id: 'marketingkostenquote', name: 'Marketingkostenquote', einheit: 'percent',
    bereich: 'MKT', ziel: 5, richtung: 'tief_gut', warn: 0.95,
    beschreibung: 'Marketingkosten in % vom Nettoumsatz. Abgeleitet.',
    sqlRef: null, abhaengig: ['marketingkosten', 'nettoumsatz'],
    berechne: (v) => (v.marketingkosten / v.nettoumsatz) * 100, security: null
  },

  // ---- Beteiligungs-/Konzerncontrolling (KON) --------------------------
  roce: {
    id: 'roce', name: 'ROCE', einheit: 'percent',
    bereich: 'KON', ziel: 12, richtung: 'hoch_gut', warn: 0.85,
    beschreibung: 'Return on Capital Employed — EBIT ÷ eingesetztes Kapital.',
    sqlRef: 'roce', abhaengig: [], security: null
  },
  auslandsanteil: {
    id: 'auslandsanteil', name: 'Auslandsanteil', einheit: 'percent0',
    bereich: 'KON', ziel: 25, richtung: 'hoch_gut', warn: 0.85,
    beschreibung: 'Umsatzanteil der Auslandsgesellschaften (CH, NL).',
    sqlRef: 'auslandsanteil', abhaengig: [], security: null
  },
  intercompanyVolumen: {
    id: 'intercompanyVolumen', name: 'Intercompany-Volumen', einheit: 'eur_mio',
    bereich: 'KON', ziel: null, richtung: 'tief_gut',
    beschreibung: 'Konzerninterne Lieferungen/Leistungen (zu konsolidieren).',
    sqlRef: 'intercompany_volumen', abhaengig: [], security: null
  },
  eigenkapitalrendite: {
    id: 'eigenkapitalrendite', name: 'Eigenkapitalrendite', einheit: 'percent',
    bereich: 'KON', ziel: 10, richtung: 'hoch_gut', warn: 0.9,
    beschreibung: 'Jahresergebnis ÷ Eigenkapital (ROE). Abgeleitet.',
    sqlRef: null, abhaengig: ['handelsrechtlichesErgebnis', 'eigenkapital'],
    berechne: (v) => (v.handelsrechtlichesErgebnis / v.eigenkapital) * 100, security: null
  },
  intercompanyQuote: {
    id: 'intercompanyQuote', name: 'Intercompany-Quote', einheit: 'percent',
    bereich: 'KON', ziel: 15, richtung: 'tief_gut', warn: 0.9,
    beschreibung: 'IC-Volumen in % vom Nettoumsatz (Konsolidierungsumfang). Abgeleitet.',
    sqlRef: null, abhaengig: ['intercompanyVolumen', 'nettoumsatz'],
    berechne: (v) => (v.intercompanyVolumen / v.nettoumsatz) * 100, security: null
  },

  // ---- After-Sales- & Servicecontrolling (SVC) -------------------------
  serviceumsatz: {
    id: 'serviceumsatz', name: 'Serviceumsatz', einheit: 'eur_mio',
    bereich: 'SVC', ziel: 6.0, richtung: 'hoch_gut', warn: 0.9,
    beschreibung: 'Umsatz aus Service, Reparatur, Ersatzteilen (wiederkehrend).',
    sqlRef: 'serviceumsatz', abhaengig: [], security: null
  },
  ersatzteilverfuegbarkeit: {
    id: 'ersatzteilverfuegbarkeit', name: 'Ersatzteilverfügbarkeit', einheit: 'percent0',
    bereich: 'SVC', ziel: 95, richtung: 'hoch_gut', warn: 0.95,
    beschreibung: 'Ab-Lager-Verfügbarkeit kritischer Ersatzteile.',
    sqlRef: 'ersatzteilverfuegbarkeit', abhaengig: [], security: null
  },
  reparaturdurchlaufzeit: {
    id: 'reparaturdurchlaufzeit', name: 'Reparatur-Durchlaufzeit', einheit: 'days',
    bereich: 'SVC', ziel: 5, richtung: 'tief_gut', warn: 0.85,
    beschreibung: 'Ø Durchlaufzeit Werkstatt/Reparatur.',
    sqlRef: 'reparaturdurchlaufzeit', abhaengig: [], security: null
  },
  nps: {
    id: 'nps', name: 'Net Promoter Score', einheit: 'count',
    bereich: 'SVC', ziel: 50, richtung: 'hoch_gut', warn: 0.9,
    beschreibung: 'Kundenzufriedenheit/Weiterempfehlung (NPS).',
    sqlRef: 'nps', abhaengig: [], security: null
  },
  serviceanteil: {
    id: 'serviceanteil', name: 'Serviceanteil', einheit: 'percent',
    bereich: 'SVC', ziel: 12, richtung: 'hoch_gut', warn: 0.9,
    beschreibung: 'Serviceumsatz in % vom Nettoumsatz. Abgeleitet.',
    sqlRef: null, abhaengig: ['serviceumsatz', 'nettoumsatz'],
    berechne: (v) => (v.serviceumsatz / v.nettoumsatz) * 100, security: null
  },

  // ---- F&E-/Innovationscontrolling (FE) --------------------------------
  fuekosten: {
    id: 'fuekosten', name: 'F&E-Kosten', einheit: 'eur_mio',
    bereich: 'FE', ziel: null, richtung: 'hoch_gut',
    beschreibung: 'Aufwand für Forschung & Entwicklung.',
    sqlRef: 'fuekosten', abhaengig: [], security: null
  },
  neuproduktumsatzanteil: {
    id: 'neuproduktumsatzanteil', name: 'Neuprodukt-Umsatzanteil', einheit: 'percent0',
    bereich: 'FE', ziel: 30, richtung: 'hoch_gut', warn: 0.9,
    beschreibung: 'Umsatzanteil mit Produkten jünger als 3 Jahre (Innovationskraft).',
    sqlRef: 'neuproduktumsatzanteil', abhaengig: [], security: null
  },
  entwicklungsprojekte: {
    id: 'entwicklungsprojekte', name: 'Entwicklungsprojekte', einheit: 'count',
    bereich: 'FE', ziel: null, richtung: 'hoch_gut',
    beschreibung: 'Aktive Entwicklungsprojekte in der Pipeline.',
    sqlRef: 'entwicklungsprojekte', abhaengig: [], security: null
  },
  timeToMarket: {
    id: 'timeToMarket', name: 'Time-to-Market', einheit: 'monate',
    bereich: 'FE', ziel: 12, richtung: 'tief_gut', warn: 0.85,
    beschreibung: 'Ø Entwicklungsdauer von Idee bis Markteinführung.',
    sqlRef: 'time_to_market', abhaengig: [], security: null
  },
  fueQuote: {
    id: 'fueQuote', name: 'F&E-Quote', einheit: 'percent',
    bereich: 'FE', ziel: 4, richtung: 'hoch_gut', warn: 0.9,
    beschreibung: 'F&E-Kosten in % vom Nettoumsatz. Abgeleitet.',
    sqlRef: null, abhaengig: ['fuekosten', 'nettoumsatz'],
    berechne: (v) => (v.fuekosten / v.nettoumsatz) * 100, security: null
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

// --- Transportierte/lokale KPI-Definitionsanpassungen -------------------
// Importierte oder im Tool bearbeitete KPI-Definitionen (er_kpi_overrides)
// überschreiben hier die Metadaten-Felder, sodass sie in der ganzen App
// wirken. KPI_BASIS hält die Code-Originalwerte der überschriebenen Felder
// für ein sauberes „Zurücksetzen". Nur im Browser; der Server bleibt unberührt.
export const KPI_BASIS = {}
export const OVERRIDE_FELDER = ['name', 'einheit', 'bereich', 'ziel', 'richtung', 'beschreibung', 'sqlRef', 'warn', 'horizont', 'monetaer']
try {
  if (typeof localStorage !== 'undefined') {
    const ov = JSON.parse(localStorage.getItem('er_kpi_overrides') || '{}')
    for (const [id, patch] of Object.entries(ov)) {
      if (KPI[id]) { KPI_BASIS[id] = {}; for (const f of OVERRIDE_FELDER) KPI_BASIS[id][f] = KPI[id][f] }
      KPI[id] = KPI[id] ? { ...KPI[id], ...patch } : { id, abhaengig: [], security: null, ...patch }
    }
  }
} catch { /* defekte Overrides ignorieren */ }

// --- Eigene, abgeleitete KPIs aus Formeln (er_kpi_custom) ---------------
// Werden als vollwertige (abgeleitete) KPIs registriert und überall genutzt.
const CUSTOM_REGISTRIERT = new Set()
export function registerCustomKpis() {
  for (const id of CUSTOM_REGISTRIERT) delete KPI[id]
  CUSTOM_REGISTRIERT.clear()
  let defs = []
  try { defs = ladeCustomKpis() } catch { defs = [] }
  for (const def of defs) {
    if (!def || !def.id || !def.formel) continue
    let ids = []
    try { ids = formelIds(def.formel) } catch { continue }
    KPI[def.id] = {
      id: def.id, name: def.name || def.id, einheit: def.einheit || 'faktor',
      bereich: def.bereich || 'CUSTOM', ziel: def.ziel ?? null, richtung: def.richtung || 'hoch_gut',
      warn: def.warn, beschreibung: def.beschreibung || ('Eigene Formel: ' + def.formel),
      sqlRef: null, abhaengig: ids, custom: true, formel: def.formel,
      berechne: (v) => { try { return formelEvaluate(def.formel, v) } catch { return null } }, security: null
    }
    CUSTOM_REGISTRIERT.add(def.id)
  }
  return defs
}
try { if (typeof localStorage !== 'undefined') registerCustomKpis() } catch { /* ignore */ }
