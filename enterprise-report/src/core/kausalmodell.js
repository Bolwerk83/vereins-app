// =========================================================================
//  KAUSALMODELL — dichtes Wirkungsnetz für die Was-wäre-wenn-Simulation.
//
//  ZIEL: möglichst viele Kennzahlen sind miteinander verkettet, sodass ein
//  Eingriff irgendwo (Qualität, Personal, Supply, Marketing, Treasury, ESG)
//  bis ins Finanzergebnis durchschlägt.
//
//  SICHER per Konstruktion:
//   • Rein DELTA-basiert: jede Kante liefert NeuerWert = Basiswert +
//     (Treiber-Änderung · Wirkung). Die angezeigten Ist-Werte der App
//     bleiben unangetastet — das Netz wirkt nur in der Simulation.
//   • Pro Szenario wird GENAU EINE Kennzahl überschrieben; nur deren Delta
//     fließt durch die Kette. Doppelzählungen zwischen Kostenkomponenten
//     können dadurch nicht entstehen.
//   • Der Graph ist zyklenfrei (operativ → Komponenten → EBIT → Finanz),
//     daher konvergiert die Iteration garantiert.
//
//  Buchhalterische Identitäten (EBIT = Nettoumsatz − Gesamtkosten, HGB =
//  EBIT + neutrales Ergebnis) sind exakt; alle übrigen Kanten sind
//  dokumentierte ökonomische Annahmen (Richtung gesichert, Höhe geschätzt).
//  Quoten/Ratios (DB-Quote, Zielerreichungen, Zinsdeckung, EK-Quote …)
//  rechnet weiterhin der berechne()-Graph der Registry nach.
//
//  Kante: { id, von:[treiber…], f:(sim, basis)=>neuerWert, erklaerung }
//  PRO EFFEKT-ID GENAU EINE KANTE (alle Treiber in einer Formel bündeln).
// =========================================================================

// kleine Helfer für lesbare Formeln
const d = (s, b, id) => (s[id] ?? 0) - (b[id] ?? 0)          // Delta eines Treibers
const skal = (b, id, faktor) => (b[id] ?? 0) * (faktor || 0)  // Anteil vom Basiswert

export const KAUSAL = [
  // ===================== UMSATZ- / ERLÖSKETTE ===========================
  {
    id: 'erloesschmaelerung', von: ['retourenquote', 'rabattquote'],
    f: (s, b) => b.erloesschmaelerung
      + d(s, b, 'retourenquote') / 100 * ((b.bruttoumsatz || 0) * ((b.onlineAnteil || 0) / 100)) // Retouren auf Online-Umsatz
      + d(s, b, 'rabattquote') / 100 * (b.bruttoumsatz || 0),                                     // Rabatte auf Gesamtumsatz
    erklaerung: 'Retouren und Rabatte erhöhen die Erlösschmälerung.',
  },
  {
    id: 'nettoumsatz', von: ['erloesschmaelerung', 'conversionRate', 'neukundenanteil', 'marketingkosten'],
    f: (s, b) => b.nettoumsatz
      - d(s, b, 'erloesschmaelerung')                                                              // Netto = Brutto − Erlösschmälerung
      + (b.conversionRate ? d(s, b, 'conversionRate') / b.conversionRate * ((b.bruttoumsatz || 0) * ((b.onlineAnteil || 0) / 100)) : 0) // Conversion hebt Online-Umsatz
      + d(s, b, 'neukundenanteil') / 100 * (b.nettoumsatz || 0) * 0.4                              // Neukunden treiben Wachstum (Teil-Elastizität)
      + d(s, b, 'marketingkosten') * (b.roas || 0),                                                // Marketing-Euro × ROAS
    erklaerung: 'Erlösschmälerung, Conversion, Neukunden und Marketing (×ROAS) wirken auf den Nettoumsatz.',
  },

  // ===================== KOSTEN- / ERGEBNISKETTE ========================
  {
    id: 'wareneinsatz', von: ['ausschuss', 'einkaufsvolumen'],
    f: (s, b) => b.wareneinsatz
      + d(s, b, 'ausschuss') / 100 * (b.wareneinsatz || 0)                                         // Ausschuss verschwendet Material
      + d(s, b, 'einkaufsvolumen') * 0.9,                                                          // höheres Einkaufsvolumen ≈ mehr COGS
    erklaerung: 'Ausschuss und Einkaufsvolumen treiben den Wareneinsatz.',
  },
  {
    id: 'herstellkosten', von: ['ausschuss', 'nacharbeitsquote'],
    f: (s, b) => b.herstellkosten
      + d(s, b, 'ausschuss') / 100 * (b.herstellkosten || 0)
      + d(s, b, 'nacharbeitsquote') / 100 * (b.herstellkosten || 0),
    erklaerung: 'Ausschuss und Nacharbeit erhöhen die Herstellkosten.',
  },
  {
    id: 'produktionsmenge', von: ['kapazitaetsauslastung', 'krankenstand', 'mitarbeiterFTE'],
    f: (s, b) => b.produktionsmenge
      + d(s, b, 'kapazitaetsauslastung') / 100 * (b.kapazitaet || 0)                              // Auslastung × Kapazität
      - d(s, b, 'krankenstand') / 100 * (b.produktionsmenge || 0) * 0.5                            // Krankheit senkt Output
      + (b.mitarbeiterFTE ? d(s, b, 'mitarbeiterFTE') / b.mitarbeiterFTE * (b.produktionsmenge || 0) : 0), // Personal proportional
    erklaerung: 'Auslastung, Krankenstand und Personal bestimmen die Produktionsmenge.',
  },
  {
    id: 'personalkosten', von: ['ueberstundenquote', 'fluktuation', 'krankenstand', 'mitarbeiterFTE'],
    f: (s, b) => b.personalkosten
      + d(s, b, 'ueberstundenquote') / 100 * (b.personalkosten || 0)                              // Überstunden ~ proportional
      + d(s, b, 'fluktuation') / 100 * (b.personalkosten || 0) * 0.3                               // Recruiting/Onboarding
      + d(s, b, 'krankenstand') / 100 * (b.personalkosten || 0) * 0.2                              // Ersatz/Vertretung
      + (b.mitarbeiterFTE ? d(s, b, 'mitarbeiterFTE') / b.mitarbeiterFTE * (b.personalkosten || 0) : 0),
    erklaerung: 'Überstunden, Fluktuation, Krankenstand und FTE treiben die Personalkosten.',
  },
  {
    id: 'ueberstundenquote', von: ['krankenstand'],
    f: (s, b) => b.ueberstundenquote + d(s, b, 'krankenstand') * 0.5,                              // Ausfall wird über Überstunden kompensiert
    erklaerung: 'Krankheitsausfälle werden teils über Überstunden aufgefangen.',
  },
  {
    id: 'krankenstand', von: ['fluktuation'],
    f: (s, b) => b.krankenstand + d(s, b, 'fluktuation') * 0.2,                                    // Belastung/Unzufriedenheit
    erklaerung: 'Hohe Fluktuation erhöht tendenziell den Krankenstand (Belastung).',
  },
  {
    id: 'gesamtkosten', von: ['wareneinsatz', 'gemeinkosten', 'personalkosten', 'vertriebskosten', 'marketingkosten', 'fuekosten', 'garantiekosten'],
    f: (s, b) => b.gesamtkosten
      + d(s, b, 'wareneinsatz') + d(s, b, 'gemeinkosten') + d(s, b, 'personalkosten')
      + d(s, b, 'vertriebskosten') + d(s, b, 'marketingkosten') + d(s, b, 'fuekosten') + d(s, b, 'garantiekosten'),
    erklaerung: 'Alle Kostenarten summieren sich in den Gesamtkosten (pro Szenario wirkt nur die geänderte).',
  },
  {
    id: 'ebit', von: ['nettoumsatz', 'gesamtkosten'],
    f: (s, b) => b.ebit + d(s, b, 'nettoumsatz') - d(s, b, 'gesamtkosten'),
    erklaerung: 'EBIT = Nettoumsatz − Gesamtkosten.',
  },

  // ===================== ERGEBNIS → FINANZ ==============================
  {
    id: 'ebitda', von: ['ebit'],
    f: (s, b) => b.ebitda + d(s, b, 'ebit'),
    erklaerung: 'EBITDA bewegt sich mit dem EBIT (Abschreibungen konstant).',
  },
  {
    id: 'handelsrechtlichesErgebnis', von: ['ebit', 'neutralesErgebnis'],
    f: (s, b) => b.handelsrechtlichesErgebnis + d(s, b, 'ebit') + d(s, b, 'neutralesErgebnis'),
    erklaerung: 'HGB-Ergebnis = EBIT + neutrales Ergebnis.',
  },
  {
    id: 'eigenkapital', von: ['handelsrechtlichesErgebnis'],
    f: (s, b) => b.eigenkapital + d(s, b, 'handelsrechtlichesErgebnis') * 0.6,                     // einbehaltener Gewinn
    erklaerung: 'Ein Teil des Jahresergebnisses stärkt das Eigenkapital (Thesaurierung).',
  },
  {
    id: 'roce', von: ['ebit'],
    f: (s, b) => b.roce + d(s, b, 'ebit') * 100 / (b.bilanzsumme || 1),
    erklaerung: 'ROCE = EBIT bezogen auf das eingesetzte Kapital (≈ Bilanzsumme).',
  },
  {
    id: 'operativerCashflow', von: ['ebit', 'offeneForderungen', 'lagerbestand'],
    f: (s, b) => b.operativerCashflow + 0.7 * d(s, b, 'ebit') - 0.5 * d(s, b, 'offeneForderungen') - 0.5 * d(s, b, 'lagerbestand'),
    erklaerung: 'Cashflow folgt dem Ergebnis; gebundenes Working Capital (Forderungen, Bestand) zehrt daran.',
  },
  {
    id: 'liquideMittel', von: ['operativerCashflow'],
    f: (s, b) => b.liquideMittel + d(s, b, 'operativerCashflow') * 0.5,
    erklaerung: 'Ein Teil des operativen Cashflows erhöht die liquiden Mittel.',
  },
  {
    id: 'nettoverschuldung', von: ['operativerCashflow'],
    f: (s, b) => b.nettoverschuldung - d(s, b, 'operativerCashflow') * 0.5,
    erklaerung: 'Überschüssiger Cashflow tilgt Nettoverschuldung.',
  },
  {
    id: 'zinsaufwand', von: ['nettoverschuldung', 'durchschnittszins'],
    f: (s, b) => b.zinsaufwand
      + d(s, b, 'nettoverschuldung') * ((b.durchschnittszins || 0) / 100)
      + d(s, b, 'durchschnittszins') / 100 * (b.nettoverschuldung || 0),
    erklaerung: 'Zinsaufwand = Nettoverschuldung × Durchschnittszins.',
  },

  // ===================== WORKING CAPITAL ================================
  {
    id: 'offeneForderungen', von: ['dso'],
    f: (s, b) => b.offeneForderungen + d(s, b, 'dso') * ((b.nettoumsatz || 0) / 365),
    erklaerung: 'Jeder DSO-Tag bindet rund einen Tagesumsatz in Forderungen.',
  },
  {
    id: 'ueberfaelligeForderungen', von: ['offeneForderungen'],
    f: (s, b) => (b.offeneForderungen ? b.ueberfaelligeForderungen * (s.offeneForderungen / b.offeneForderungen) : b.ueberfaelligeForderungen),
    erklaerung: 'Überfällige Forderungen bewegen sich proportional zum offenen Bestand.',
  },
  {
    id: 'lagerbestand', von: ['ueberbestand'],
    f: (s, b) => b.lagerbestand + d(s, b, 'ueberbestand'),
    erklaerung: 'Überbestände erhöhen den Lagerbestand.',
  },
  {
    id: 'reichweite', von: ['lagerbestand'],
    f: (s, b) => (b.lagerbestand ? b.reichweite * (s.lagerbestand / b.lagerbestand) : b.reichweite),
    erklaerung: 'Die Reichweite skaliert mit dem Lagerbestand.',
  },
  {
    id: 'cashConversion', von: ['dso', 'reichweite'],
    f: (s, b) => b.cashConversion + d(s, b, 'dso') + d(s, b, 'reichweite'),
    erklaerung: 'Forderungs- und Bestandsreichweite verlängern den Cash-Conversion-Cycle.',
  },

  // ===================== QUALITÄT / SERVICE / KUNDE =====================
  {
    id: 'firstPassYield', von: ['ausschuss', 'nacharbeitsquote'],
    f: (s, b) => b.firstPassYield - d(s, b, 'ausschuss') - d(s, b, 'nacharbeitsquote') * 0.5,
    erklaerung: 'Ausschuss und Nacharbeit senken die Gutausbeute (First Pass Yield).',
  },
  {
    id: 'garantiekosten', von: ['reklamationsquote'],
    f: (s, b) => (b.reklamationsquote ? b.garantiekosten * (s.reklamationsquote / b.reklamationsquote) : b.garantiekosten),
    erklaerung: 'Garantiekosten skalieren mit der Reklamationsquote.',
  },
  {
    id: 'lieferfaehigkeit', von: ['liefertreue', 'liefertermintreue'],
    f: (s, b) => b.lieferfaehigkeit + d(s, b, 'liefertreue') * 0.3 + d(s, b, 'liefertermintreue') * 0.3,
    erklaerung: 'Liefertreue und Termintreue verbessern die Lieferfähigkeit.',
  },
  {
    id: 'nps', von: ['reklamationsquote', 'liefertermintreue', 'reparaturdurchlaufzeit'],
    f: (s, b) => b.nps - d(s, b, 'reklamationsquote') * 6 + d(s, b, 'liefertermintreue') * 0.5 - d(s, b, 'reparaturdurchlaufzeit') * 1.5,
    erklaerung: 'Reklamationen und lange Reparaturzeiten drücken den NPS; Termintreue hebt ihn.',
  },
  {
    id: 'neukundenanteil', von: ['nps', 'marketingkosten'],
    f: (s, b) => b.neukundenanteil + d(s, b, 'nps') * 0.1 + d(s, b, 'marketingkosten') * 0.5,
    erklaerung: 'Zufriedene Kunden (NPS) und Marketing gewinnen Neukunden.',
  },

  // ===================== ESG / ENERGIE ==================================
  {
    id: 'co2ProRad', von: ['energieJeRad', 'recyclingquote'],
    f: (s, b) => b.co2ProRad
      + (b.energieJeRad ? d(s, b, 'energieJeRad') / b.energieJeRad * (b.co2ProRad || 0) : 0)
      - d(s, b, 'recyclingquote') * 0.3,
    erklaerung: 'Energieverbrauch erhöht, Recycling senkt den CO₂-Fußabdruck je Rad.',
  },
  {
    id: 'co2Gesamt', von: ['co2ProRad', 'oekostromanteil'],
    f: (s, b) => b.co2Gesamt
      + (b.co2ProRad ? d(s, b, 'co2ProRad') / b.co2ProRad * (b.co2Gesamt || 0) : 0)
      - d(s, b, 'oekostromanteil') / 100 * (b.co2Gesamt || 0) * 0.4,
    erklaerung: 'Fußabdruck je Rad und ein höherer Ökostromanteil bestimmen die Gesamtemissionen.',
  },
]
