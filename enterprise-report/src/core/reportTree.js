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
