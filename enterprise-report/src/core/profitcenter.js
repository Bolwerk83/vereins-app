// =========================================================================
//  PROFITCENTER-ERGEBNISRECHNUNG — Ergebnis je Verantwortungsbereich und
//  Beitrag zum Gesamtergebnis. Center-Typen:
//    Cost Center       : nur Kosten
//    Profit Center     : Umsatz − variable Kosten − Fixkosten = Ergebnis
//    Investment Center : zusätzlich Kapital -> ROCE (Ergebnis / Kapital)
// =========================================================================
import { CENTER_TYPEN, centerTypInfo } from './kostenstellen.js'
export { CENTER_TYPEN, centerTypInfo }

// VeloWerk-Bereiche (Mio €). kapital nur bei Investment Centern.
export const CENTER = [
  { id: 'online',   name: 'Onlineshop (Privat)',   typ: 'profit',     umsatz: 23.4, varKosten: 14.3, fixKosten: 8.2 },
  { id: 'filialen', name: 'Filialen DACH',         typ: 'profit',     umsatz: 19.2, varKosten: 12.4, fixKosten: 6.0 },
  { id: 'b2b',      name: 'B2B / Leasing',         typ: 'investment', umsatz: 6.8,  varKosten: 4.6,  fixKosten: 1.4, kapital: 8.0 },
  { id: 'service',  name: 'Service & Ersatzteile', typ: 'profit',     umsatz: 2.6,  varKosten: 1.4,  fixKosten: 0.9 },
  { id: 'zentrale', name: 'Zentrale / Verwaltung', typ: 'cost',       umsatz: 0,    varKosten: 0,    fixKosten: 0.8 }
]

const r2 = (x) => Math.round(x * 100) / 100
const r1 = (x) => Math.round(x * 10) / 10

export function auswertung(center = CENTER) {
  const rows = center.map((c) => {
    const db = r2(c.umsatz - c.varKosten)
    const ergebnis = r2(db - c.fixKosten)
    const roce = c.kapital ? r1(ergebnis / c.kapital * 100) : null
    return { ...c, db, ergebnis, roce }
  })
  const gesamt = r2(rows.reduce((n, r) => n + r.ergebnis, 0))
  const umsatz = r2(rows.reduce((n, r) => n + r.umsatz, 0))
  return {
    rows: rows.map((r) => ({ ...r, beitrag: gesamt ? r1(r.ergebnis / gesamt * 100) : 0 })),
    gesamt, umsatz
  }
}
