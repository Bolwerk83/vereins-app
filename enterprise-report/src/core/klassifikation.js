// =========================================================================
//  KLASSIFIKATION — zwei Controlling-Dimensionen über alle Kennzahlen:
//
//    Horizont:  operativ  vs  strategisch   (Steuerungshorizont)
//    Art:       monetär    vs  nicht-monetär (Werttreiber vs Mengentreiber)
//
//  „monetär" wird aus der Einheit abgeleitet (eur, eur_mio), kann aber je
//  KPI überschrieben werden (kpi.monetaer). „horizont" hat eine sinnvolle
//  Default-Zuordnung (STRATEGISCH-Liste) und ist je KPI überschreibbar
//  (kpi.horizont). Beide Felder laufen über die Override-/Transport-Schicht.
//
//  Besonders fürs Profitcenter nützlich: monetäre operative Treiber vom
//  strategischen/nicht-monetären Rahmen trennen.
// =========================================================================

export const HORIZONTE = [
  { id: 'operativ',    name: 'Operativ',    farbe: '#2563eb', hinweis: 'Kurzfristige Steuerung des laufenden Geschäfts' },
  { id: 'strategisch', name: 'Strategisch', farbe: '#7c3aed', hinweis: 'Mittel-/langfristige Ausrichtung & Struktur' }
]
export const ARTEN = [
  { id: 'monetaer',      name: 'Monetär',       farbe: '#0f766e', hinweis: 'In Geldeinheiten (€)' },
  { id: 'nicht_monetaer', name: 'Nicht-monetär', farbe: '#b45309', hinweis: 'Mengen, Quoten, Zeiten, Indizes' }
]

const MONETAER_EINHEITEN = new Set(['eur', 'eur_mio'])

// Default als strategisch eingestufte Kennzahlen (Rest = operativ).
const STRATEGISCH = new Set([
  'forecastGenauigkeit', 'prognoseWachstum', 'absatzprognose', 'umsatzprognose',
  'investitionsvolumen', 'investitionsbudget', 'investBudgettreue',
  'co2ProRad', 'co2Gesamt', 'energieJeRad', 'oekostromanteil', 'recyclingquote',
  'fuekosten', 'neuproduktumsatzanteil', 'entwicklungsprojekte', 'timeToMarket', 'fueQuote',
  'eigenkapitalquote', 'nettoverschuldung', 'nettoverschuldungEbitda', 'zinsdeckung',
  'durchschnittszins', 'hedgeQuote', 'fxExposureOffen',
  'roce', 'eigenkapitalrendite', 'eigenkapital',
  'neukundenanteil', 'klumpenrisikoTop3', 'nps', 'auslandsanteil', 'serviceanteil', 'intercompanyQuote'
])

/** monetär? — explizit am KPI, sonst aus der Einheit. */
export function istMonetaer(kpi) {
  if (kpi?.monetaer != null) return !!kpi.monetaer
  return MONETAER_EINHEITEN.has(kpi?.einheit)
}
export const artId = (kpi) => (istMonetaer(kpi) ? 'monetaer' : 'nicht_monetaer')
export const artInfo = (kpi) => ARTEN.find((a) => a.id === artId(kpi))

/** Horizont — explizit am KPI, sonst Default-Zuordnung. */
export function horizontId(kpi) {
  if (kpi?.horizont) return kpi.horizont
  return STRATEGISCH.has(kpi?.id) ? 'strategisch' : 'operativ'
}
export const horizontInfo = (kpi) => HORIZONTE.find((h) => h.id === horizontId(kpi))
