// =========================================================================
//  BERICHTSBAUM mit den 5 EBENEN.
//
//   E1 GF              – Konzern / Executive (Wurzel)
//   E2 Fachbereich     – Verkauf, Einkauf, Produktion, Logistik, HR, IT, FIN …
//   E3 Themenbereich   – Unterthema je Fachbereich (z. B. Logistik › Bestände)
//   E4 Details         – konkreter Detailbericht (Tabellen, Positionen)
//   E5 Historisierung  – Zeitreihe (quer zu allen Knoten, je KPI/Bericht)
//
//  Der Baum ist NUR Struktur + Verweise (auf KPIs, Detailberichte, Bereich).
//  Inhalte/Zahlen kommen aus der Datenschicht (Mock heute, MSSQL morgen).
// =========================================================================

export const EBENEN = [
  { stufe: 1, code: 'GF',  name: 'Geschäftsführung', kurz: 'Konzern-/Executive-Sicht' },
  { stufe: 2, code: 'FB',  name: 'Fachbereich',      kurz: 'Abteilungssicht' },
  { stufe: 3, code: 'TB',  name: 'Themenbereich',    kurz: 'Unterthema im Fachbereich' },
  { stufe: 4, code: 'DET', name: 'Details',          kurz: 'Detailbericht / Positionen' },
  { stufe: 5, code: 'HIST',name: 'Historisierung',   kurz: 'Zeitreihe / Entwicklung' }
]

// Hilfsknoten-Fabrik.
const n = (id, ebene, titel, opts = {}) => ({ id, ebene, titel, kinder: [], ...opts })

export const BERICHTSBAUM = n('konzern', 1, 'VeloWerk Gruppe · Management Report', {
  bereich: 'GF',
  kpis: ['nettoumsatz', 'ebitda', 'dbQuote', 'wareneinsatzquote', 'lagerbestand'],
  bericht: 'management-report',          // -> Modul management-report
  kinder: [
    // ---- E2 Fachbereich: Verkauf ----------------------------------------
    n('vk', 2, 'Verkauf', {
      bereich: 'VK', kpis: ['nettoumsatz', 'onlineAnteil', 'retourenquote', 'dbQuote'],
      kinder: [
        n('vk-kanaele', 3, 'Kanäle & Marktplätze', {
          bereich: 'VK', kpis: ['onlineAnteil', 'nettoumsatz'],
          kinder: [ n('vk-kanaele-det', 4, 'Umsatz je Kanal', { bereich: 'VK', detail: 'kanaele' }) ]
        }),
        n('vk-retouren', 3, 'Retouren', {
          bereich: 'VK', kpis: ['retourenquote'],
          kinder: [ n('vk-retouren-det', 4, 'Retouren je Warengruppe', { bereich: 'VK', detail: 'retouren' }) ]
        })
      ]
    }),
    // ---- E2 Fachbereich: Einkauf ----------------------------------------
    n('ek', 2, 'Einkauf', {
      bereich: 'EK', kpis: ['einkaufsvolumen', 'liefertreue', 'wareneinsatzquote'],
      kinder: [
        n('ek-lieferanten', 3, 'Lieferantenstruktur', {
          bereich: 'EK', kpis: ['liefertreue'],
          kinder: [ n('ek-lieferanten-det', 4, 'Lieferantengruppen & Klumpenrisiko', { bereich: 'EK', detail: 'lieferanten' }) ]
        })
      ]
    }),
    // ---- E2 Fachbereich: Produktion -------------------------------------
    n('pr', 2, 'Produktion', {
      bereich: 'PR', kpis: ['wareneinsatzquote', 'ausschuss', 'auslastung'],
      kinder: [
        n('pr-fertigung', 3, 'Fertigung & Qualität', {
          bereich: 'PR', kpis: ['ausschuss', 'auslastung'],
          kinder: [ n('pr-fertigung-det', 4, 'Fertigungskennzahlen', { bereich: 'PR', detail: 'fertigung' }) ]
        })
      ]
    }),
    // ---- E2 Fachbereich: Logistik ---------------------------------------
    n('log', 2, 'Logistik & Lager', {
      bereich: 'LOG', kpis: ['lagerbestand', 'reichweite'],
      kinder: [
        n('log-bestaende', 3, 'Bestände & Reichweite', {
          bereich: 'LOG', kpis: ['lagerbestand', 'reichweite'],
          kinder: [ n('log-bestaende-det', 4, 'Bestände je Warenbereich', { bereich: 'LOG', detail: 'bestaende' }) ]
        }),
        n('log-extern', 3, 'Externe Läger', {
          bereich: 'LOG', kpis: ['lagerbestand'],
          kinder: [ n('log-extern-det', 4, 'Standorte & Kosten', { bereich: 'LOG', detail: 'externe_laeger' }) ]
        })
      ]
    }),
    // ---- E2 Fachbereich: HR (Object-Level-Security) ---------------------
    n('hr', 2, 'Human Resources', {
      bereich: 'HR', kpis: ['personalkosten', 'fluktuation'],
      kinder: [
        n('hr-fluktuation', 3, 'Bindung & Fluktuation', {
          bereich: 'HR', kpis: ['fluktuation'],
          kinder: [ n('hr-fluktuation-det', 4, 'Belegschaft je Bereich', { bereich: 'HR', detail: 'belegschaft' }) ]
        })
      ]
    }),
    // ---- E2 Fachbereich: IT ---------------------------------------------
    n('it', 2, 'Informationstechnologie', {
      bereich: 'IT', kpis: ['shopVerfuegbarkeit'],
      kinder: [
        n('it-projekte', 3, 'Projekte & Verfügbarkeit', {
          bereich: 'IT', kpis: ['shopVerfuegbarkeit'],
          kinder: [ n('it-projekte-det', 4, 'Projektportfolio', { bereich: 'IT', detail: 'projekte' }) ]
        })
      ]
    }),
    // ---- E2 Fachbereich: Finanzen ---------------------------------------
    n('fin', 2, 'Finanzen', {
      bereich: 'FIN', kpis: ['ebit', 'cashConversion', 'dbQuote'],
      kinder: [
        n('fin-guv', 3, 'GuV & Marge', {
          bereich: 'FIN', kpis: ['ebit', 'dbQuote'],
          kinder: [ n('fin-guv-det', 4, 'GuV-Staffel', { bereich: 'FIN', detail: 'guv' }) ]
        })
      ]
    }),

    // ---- E2 Fachbereich: Kosten- & Leistungsrechnung --------------------
    n('klr', 2, 'Kosten- & Leistungsrechnung', {
      bereich: 'KLR', kpis: ['herstellkostenJeRad', 'gemeinkostenquote', 'gesamtkosten', 'produktionsmenge'],
      kinder: [
        n('klr-kostenarten', 3, 'Kostenarten', {
          bereich: 'KLR', kpis: ['gemeinkostenquote', 'gesamtkosten'],
          kinder: [ n('klr-kostenarten-det', 4, 'Kostenartenübersicht', { bereich: 'KLR', detail: 'kostenarten' }) ]
        }),
        n('klr-kostenstellen', 3, 'Kostenstellen (BAB)', {
          bereich: 'KLR', kpis: ['gesamtkosten'],
          kinder: [ n('klr-kostenstellen-det', 4, 'Kostenstellen Plan/Ist', { bereich: 'KLR', detail: 'kostenstellen' }) ]
        }),
        n('klr-kostentraeger', 3, 'Kostenträger', {
          bereich: 'KLR', kpis: ['herstellkostenJeRad'],
          kinder: [ n('klr-kostentraeger-det', 4, 'Deckungsbeitrag je Produktgruppe', { bereich: 'KLR', detail: 'kostentraeger' }) ]
        })
      ]
    }),

    // ---- E2 Fachbereich: Absatz- & Umsatzprognose -----------------------
    n('fc', 2, 'Absatz- & Umsatzprognose', {
      bereich: 'FC', kpis: ['absatzprognose', 'umsatzprognose', 'forecastGenauigkeit', 'prognoseWachstum'],
      kinder: [
        n('fc-absatz', 3, 'Absatzprognose', {
          bereich: 'FC', kpis: ['absatzprognose', 'umsatzprognose'],
          kinder: [ n('fc-absatz-det', 4, 'Prognose je Warengruppe', { bereich: 'FC', detail: 'absatz_forecast' }) ]
        }),
        n('fc-guete', 3, 'Prognosegüte', {
          bereich: 'FC', kpis: ['forecastGenauigkeit'],
          kinder: [ n('fc-guete-det', 4, 'Plan/Ist-Historie', { bereich: 'FC', detail: 'forecast_guete' }) ]
        }),
        n('fc-auftrag', 3, 'Auftragsbestand', {
          bereich: 'FC', kpis: ['auftragsbestand'],
          kinder: [ n('fc-auftrag-det', 4, 'Orderbuch je Kanal', { bereich: 'FC', detail: 'auftragsbestand_kanal' }) ]
        })
      ]
    }),

    // ---- E2 Fachbereich: Umsatz-, Kosten- & Erfolgsplanung --------------
    n('plan', 2, 'Umsatz-, Kosten- & Erfolgsplanung', {
      bereich: 'PLAN', kpis: ['umsatzZielerreichung', 'kostendisziplin', 'ergebnisZielerreichung', 'ebitPlan'],
      kinder: [
        n('plan-umsatz', 3, 'Umsatzplanung', {
          bereich: 'PLAN', kpis: ['umsatzZielerreichung', 'umsatzplan'],
          kinder: [ n('plan-umsatz-det', 4, 'Umsatzplan je Kanal', { bereich: 'PLAN', detail: 'umsatzplan_kanal' }) ]
        }),
        n('plan-kosten', 3, 'Kostenplanung', {
          bereich: 'PLAN', kpis: ['kostendisziplin', 'kostenplan'],
          kinder: [ n('plan-kosten-det', 4, 'Kostenbudget je Bereich', { bereich: 'PLAN', detail: 'kostenplan_bereich' }) ]
        }),
        n('plan-erfolg', 3, 'Erfolgsplanung', {
          bereich: 'PLAN', kpis: ['ergebnisZielerreichung', 'ebitPlan'],
          kinder: [ n('plan-erfolg-det', 4, 'Plan-GuV (Plan/Ist)', { bereich: 'PLAN', detail: 'plan_guv' }) ]
        })
      ]
    }),

    // ---- E2 Fachbereich: Produktionsplanung -----------------------------
    n('pp', 2, 'Produktionsplanung', {
      bereich: 'PP', kpis: ['kapazitaetsauslastung', 'planErfuellungProduktion', 'schichtauslastung', 'liefertermintreue'],
      kinder: [
        n('pp-kapazitaet', 3, 'Kapazität & Auslastung', {
          bereich: 'PP', kpis: ['kapazitaetsauslastung', 'kapazitaet', 'produktionsplan'],
          kinder: [ n('pp-kapazitaet-det', 4, 'Kapazität je Fertigungslinie', { bereich: 'PP', detail: 'kapazitaet_linien' }) ]
        }),
        n('pp-schicht', 3, 'Schichtplanung', {
          bereich: 'PP', kpis: ['schichtauslastung', 'liefertermintreue'],
          kinder: [ n('pp-schicht-det', 4, 'Schichtplan', { bereich: 'PP', detail: 'schichtplan' }) ]
        }),
        n('pp-abgleich', 3, 'Plan/Ist/Forecast-Abgleich', {
          bereich: 'PP', kpis: ['planErfuellungProduktion'],
          kinder: [ n('pp-abgleich-det', 4, 'Programmabgleich (Forecast↔Plan↔Ist)', { bereich: 'PP', detail: 'prod_abgleich' }) ]
        })
      ]
    }),

    // ---- E2 Fachbereich: Bestands- & Supply-Chain-Controlling -----------
    n('scc', 2, 'Bestands- & Supply-Chain-Controlling', {
      bereich: 'SCC', kpis: ['lagerumschlag', 'lieferfaehigkeit', 'ueberbestand', 'reichweite'],
      kinder: [
        n('scc-struktur', 3, 'Bestandsstruktur (ABC/XYZ)', {
          bereich: 'SCC', kpis: ['lagerumschlag', 'reichweite'],
          kinder: [ n('scc-struktur-det', 4, 'ABC/XYZ-Analyse', { bereich: 'SCC', detail: 'abc_analyse' }) ]
        }),
        n('scc-service', 3, 'Lieferfähigkeit & Service (↔ Vertrieb)', {
          bereich: 'SCC', kpis: ['lieferfaehigkeit'],
          kinder: [ n('scc-service-det', 4, 'Servicegrad je Warengruppe', { bereich: 'SCC', detail: 'lieferfaehigkeit_gruppe' }) ]
        }),
        n('scc-ueberbestand', 3, 'Überbestände (↔ Einkauf/Produktion)', {
          bereich: 'SCC', kpis: ['ueberbestand'],
          kinder: [ n('scc-ueberbestand-det', 4, 'Überbestände & Maßnahmen', { bereich: 'SCC', detail: 'ueberbestand_massnahmen' }) ]
        })
      ]
    }),

    // ---- E2 Fachbereich: Finanzbuchhaltung & Abschluss ------------------
    n('fibu', 2, 'Finanzbuchhaltung & Abschluss', {
      bereich: 'FIBU', kpis: ['betrieblichesErgebnis', 'eigenkapitalquote', 'abschlussdauer', 'rueckstellungen'],
      kinder: [
        n('fibu-abschluss', 3, 'Monats- & Jahresabschluss', {
          bereich: 'FIBU', kpis: ['abschlussdauer'],
          kinder: [ n('fibu-abschluss-det', 4, 'Abschluss-Status', { bereich: 'FIBU', detail: 'abschluss_status' }) ]
        }),
        n('fibu-rueckstellungen', 3, 'Rückstellungen', {
          bereich: 'FIBU', kpis: ['rueckstellungen'],
          kinder: [ n('fibu-rueckstellungen-det', 4, 'Rückstellungsspiegel', { bereich: 'FIBU', detail: 'rueckstellungsspiegel' }) ]
        }),
        n('fibu-bilanz', 3, 'GuV & Bilanz', {
          bereich: 'FIBU', kpis: ['eigenkapitalquote', 'bilanzsumme'],
          kinder: [ n('fibu-bilanz-det', 4, 'Bilanz kompakt', { bereich: 'FIBU', detail: 'bilanz' }) ]
        }),
        n('fibu-abgrenzung', 3, 'Abgrenzung FiBu ↔ Controlling', {
          bereich: 'FIBU', kpis: ['betrieblichesErgebnis', 'neutralesErgebnis', 'handelsrechtlichesErgebnis'],
          kinder: [ n('fibu-abgrenzung-det', 4, 'Abgrenzungsrechnung (Überleitung)', { bereich: 'FIBU', detail: 'abgrenzungsrechnung' }) ]
        })
      ]
    }),

    // ---- E2 Fachbereich: Investitions- & Liquiditätsplanung -------------
    n('liq', 2, 'Investitions- & Liquiditätsplanung', {
      bereich: 'LIQ', kpis: ['operativerCashflow', 'freieLiquiditaet', 'investBudgettreue', 'investitionsvolumen'],
      kinder: [
        n('liq-invest', 3, 'Investitionen (CapEx)', {
          bereich: 'LIQ', kpis: ['investitionsvolumen', 'investBudgettreue'],
          kinder: [ n('liq-invest-det', 4, 'Investitionsprojekte', { bereich: 'LIQ', detail: 'invest_projekte' }) ]
        }),
        n('liq-vorschau', 3, 'Liquiditätsvorschau', {
          bereich: 'LIQ', kpis: ['liquideMittel', 'freieLiquiditaet'],
          kinder: [ n('liq-vorschau-det', 4, 'Liquiditätsvorschau (Monate)', { bereich: 'LIQ', detail: 'liquiditaetsvorschau' }) ]
        }),
        n('liq-cashflow', 3, 'Cashflow', {
          bereich: 'LIQ', kpis: ['operativerCashflow'],
          kinder: [ n('liq-cashflow-det', 4, 'Cashflow-Rechnung', { bereich: 'LIQ', detail: 'cashflow' }) ]
        })
      ]
    }),

    // ---- E2 Fachbereich: Vertriebscontrolling ---------------------------
    n('vc', 2, 'Vertriebscontrolling', {
      bereich: 'VC', kpis: ['vertriebskostenquote', 'rabattquote', 'neukundenanteil', 'dbQuote'],
      kinder: [
        n('vc-profitabilitaet', 3, 'Kanal- & Kundenprofitabilität', {
          bereich: 'VC', kpis: ['dbQuote', 'neukundenanteil'],
          kinder: [ n('vc-profitabilitaet-det', 4, 'DB je Kanal/Segment', { bereich: 'VC', detail: 'kanal_profitabilitaet' }) ]
        }),
        n('vc-rabatte', 3, 'Preise & Rabatte', {
          bereich: 'VC', kpis: ['rabattquote'],
          kinder: [ n('vc-rabatte-det', 4, 'Rabattanalyse je Warengruppe', { bereich: 'VC', detail: 'rabattanalyse' }) ]
        }),
        n('vc-kosten', 3, 'Vertriebskosten', {
          bereich: 'VC', kpis: ['vertriebskostenquote', 'vertriebskosten'],
          kinder: [ n('vc-kosten-det', 4, 'Vertriebskostenstruktur', { bereich: 'VC', detail: 'vertriebskosten_struktur' }) ]
        })
      ]
    }),

    // ---- E2 Fachbereich: Personalcontrolling (Object-Level-Security) ----
    n('pc', 2, 'Personalcontrolling', {
      bereich: 'PC', kpis: ['personalkostenquote', 'umsatzJeFTE', 'krankenstand', 'fluktuation'],
      kinder: [
        n('pc-produktivitaet', 3, 'Kosten & Produktivität', {
          bereich: 'PC', kpis: ['personalkostenquote', 'umsatzJeFTE', 'mitarbeiterFTE'],
          kinder: [ n('pc-produktivitaet-det', 4, 'Kosten/Produktivität je Bereich', { bereich: 'PC', detail: 'personal_produktivitaet' }) ]
        }),
        n('pc-bindung', 3, 'Fluktuation & Bindung', {
          bereich: 'PC', kpis: ['fluktuation'],
          kinder: [ n('pc-bindung-det', 4, 'Belegschaft je Bereich', { bereich: 'PC', detail: 'belegschaft' }) ]
        }),
        n('pc-arbeitszeit', 3, 'Arbeitszeit & Fehlzeiten', {
          bereich: 'PC', kpis: ['ueberstundenquote', 'krankenstand'],
          kinder: [ n('pc-arbeitszeit-det', 4, 'Überstunden/Krankenstand je Bereich', { bereich: 'PC', detail: 'arbeitszeit' }) ]
        })
      ]
    }),

    // ---- E2 Fachbereich: Risiko- & Forderungscontrolling ----------------
    n('ris', 2, 'Risiko- & Forderungscontrolling', {
      bereich: 'RIS', kpis: ['dso', 'ueberfaelligkeitsquote', 'forderungsausfall', 'klumpenrisikoTop3'],
      kinder: [
        n('ris-forderungen', 3, 'Forderungsmanagement (DSO/Aging)', {
          bereich: 'RIS', kpis: ['dso', 'ueberfaelligkeitsquote', 'offeneForderungen'],
          kinder: [ n('ris-forderungen-det', 4, 'Forderungs-Aging', { bereich: 'RIS', detail: 'forderungs_aging' }) ]
        }),
        n('ris-ausfall', 3, 'Ausfallrisiko', {
          bereich: 'RIS', kpis: ['forderungsausfall'],
          kinder: [ n('ris-ausfall-det', 4, 'Ausfälle & Wertberichtigungen', { bereich: 'RIS', detail: 'ausfaelle' }) ]
        }),
        n('ris-klumpen', 3, 'Klumpen-/Konzentrationsrisiko', {
          bereich: 'RIS', kpis: ['klumpenrisikoTop3'],
          kinder: [ n('ris-klumpen-det', 4, 'Top-Kunden & Lieferanten', { bereich: 'RIS', detail: 'konzentration' }) ]
        })
      ]
    }),

    // ---- E2 Fachbereich: Nachhaltigkeits-/ESG-Controlling ---------------
    n('esg', 2, 'Nachhaltigkeits- & ESG-Controlling', {
      bereich: 'ESG', kpis: ['co2ProRad', 'recyclingquote', 'oekostromanteil', 'energieJeRad'],
      kinder: [
        n('esg-emissionen', 3, 'Emissionen (CO₂)', {
          bereich: 'ESG', kpis: ['co2ProRad', 'co2Gesamt'],
          kinder: [ n('esg-emissionen-det', 4, 'CO₂-Bilanz nach Scope', { bereich: 'ESG', detail: 'co2_scope' }) ]
        }),
        n('esg-energie', 3, 'Energie & Material', {
          bereich: 'ESG', kpis: ['energieJeRad', 'oekostromanteil'],
          kinder: [ n('esg-energie-det', 4, 'Energie/Material je Rad', { bereich: 'ESG', detail: 'energie_material' }) ]
        }),
        n('esg-kreislauf', 3, 'Kreislauf & Soziales', {
          bereich: 'ESG', kpis: ['recyclingquote'],
          kinder: [ n('esg-kreislauf-det', 4, 'Recycling & Sozial-Kennzahlen', { bereich: 'ESG', detail: 'kreislauf_sozial' }) ]
        })
      ]
    }),

    // ---- E2 Fachbereich: Treasury & Zins-/Währungsrisiko ----------------
    n('tre', 2, 'Treasury & Zins-/Währungsrisiko', {
      bereich: 'TRE', kpis: ['nettoverschuldungEbitda', 'zinsdeckung', 'hedgeQuote', 'durchschnittszins'],
      kinder: [
        n('tre-finanzierung', 3, 'Finanzierung & Verschuldung', {
          bereich: 'TRE', kpis: ['nettoverschuldung', 'nettoverschuldungEbitda', 'zinsdeckung'],
          kinder: [ n('tre-finanzierung-det', 4, 'Finanzierungsstruktur', { bereich: 'TRE', detail: 'finanzierung' }) ]
        }),
        n('tre-zins', 3, 'Zinsrisiko', {
          bereich: 'TRE', kpis: ['durchschnittszins', 'zinsaufwand'],
          kinder: [ n('tre-zins-det', 4, 'Zinsbindung & Sensitivität', { bereich: 'TRE', detail: 'zinsbindung' }) ]
        }),
        n('tre-fx', 3, 'Währungsrisiko', {
          bereich: 'TRE', kpis: ['hedgeQuote', 'fxExposureOffen'],
          kinder: [ n('tre-fx-det', 4, 'FX-Exposure je Währung', { bereich: 'TRE', detail: 'fx_exposure' }) ]
        })
      ]
    })
  ]
})

// Baum nach Rolle filtern (Bereichssichtbarkeit, s. rbac.js).
export function baumFuerRolle(baum, darfBereich) {
  if (!darfBereich(baum.bereich)) return null
  const kinder = (baum.kinder || []).map((k) => baumFuerRolle(k, darfBereich)).filter(Boolean)
  return { ...baum, kinder }
}

// Knoten per id finden (Tiefensuche).
export function findeKnoten(baum, id) {
  if (baum.id === id) return baum
  for (const k of baum.kinder || []) {
    const t = findeKnoten(k, id)
    if (t) return t
  }
  return null
}

// Pfad (Breadcrumb) zu einem Knoten.
export function pfadZu(baum, id, acc = []) {
  const next = [...acc, baum]
  if (baum.id === id) return next
  for (const k of baum.kinder || []) {
    const p = pfadZu(k, id, next)
    if (p) return p
  }
  return null
}
