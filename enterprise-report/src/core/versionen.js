// =========================================================================
//  VERSIONEN / DATENART-STÄNDE — für die Gegenüberstellung (Ist/Plan/FC …).
//
//  Jede Version hat:
//    kurz  -> kompaktes Kürzel für BERICHTE (überfrachtet die Tabelle nicht)
//    name  -> saubere Bezeichnung für FILTER/Auswahl und Legende
//
//  Forecasts gibt es als datierte Stände (FC 01 = Stand Januar usw.), damit
//  man „FC gegen FC Januar" vergleichen kann. Werte hier als Demo; im Echt-
//  betrieb je Version aus dem DWH (DimDatenart + Versions-/Forecast-Stand).
// =========================================================================

export const VERSIONEN = [
  { id: 'ist',   kurz: 'Ist',   name: 'Ist (Buchhaltung)',                status: 'g' },
  { id: 'plan',  kurz: 'Plan',  name: 'Plan (Budget, Jahresbeginn)',      status: 'n' },
  { id: 'fc_01', kurz: 'FC 01', name: 'Forecast – Stand Januar',          status: 'n' },
  { id: 'fc_04', kurz: 'FC 04', name: 'Forecast – Stand April',           status: 'n' },
  { id: 'fc_06', kurz: 'FC 06', name: 'Forecast – Stand Juni (aktuell)',  status: 'a' }
]
export const version = (id) => VERSIONEN.find((v) => v.id === id)

export const VERGLEICH_KENNZAHLEN = [
  { id: 'umsatz',    name: 'Nettoumsatz',      einheit: 'eur_mio', richtung: 'hoch_gut' },
  { id: 'db',        name: 'Deckungsbeitrag I', einheit: 'eur_mio', richtung: 'hoch_gut' },
  { id: 'kosten',    name: 'Gesamtkosten',     einheit: 'eur_mio', richtung: 'tief_gut' },
  { id: 'ebit',      name: 'EBIT',             einheit: 'eur_mio', richtung: 'hoch_gut' },
  { id: 'ebitMarge', name: 'EBIT-Marge',       einheit: 'percent', richtung: 'hoch_gut' }
]

// kpiId -> { versionId: Wert }
const WERTE = {
  umsatz:    { ist: 51.2, plan: 52.0, fc_01: 52.0, fc_04: 50.8, fc_06: 51.5 },
  db:        { ist: 20.1, plan: 20.8, fc_01: 20.8, fc_04: 19.9, fc_06: 20.3 },
  kosten:    { ist: 17.8, plan: 17.2, fc_01: 17.2, fc_04: 18.1, fc_06: 17.9 },
  ebit:      { ist: 2.3,  plan: 3.6,  fc_01: 3.6,  fc_04: 1.8,  fc_06: 2.4 },
  ebitMarge: { ist: 4.5,  plan: 6.9,  fc_01: 6.9,  fc_04: 3.5,  fc_06: 4.7 }
}
export const wert = (kpiId, versionId) => WERTE[kpiId]?.[versionId] ?? null

/** Zwei Versionen gegenüberstellen: liefert je Kennzahl A, B, Δ und Δ%. */
export function vergleich(aId, bId) {
  return VERGLEICH_KENNZAHLEN.map((k) => {
    const a = wert(k.id, aId), b = wert(k.id, bId)
    const dAbs = (a != null && b != null) ? a - b : null
    const dPct = (dAbs != null && b) ? (dAbs / Math.abs(b)) * 100 : null
    const istGut = dAbs == null ? null : (k.richtung === 'tief_gut' ? dAbs < 0 : dAbs > 0)
    return { ...k, a, b, dAbs, dPct, istGut }
  })
}
