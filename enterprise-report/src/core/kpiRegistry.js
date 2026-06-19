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
