// =========================================================================
//  PROFITCENTER-ERGEBNISRECHNUNG — Ergebnis je Verantwortungsbereich und
//  Beitrag zum Gesamtergebnis. Center-Typen:
//    Cost Center       : nur Kosten
//    Profit Center     : Umsatz − variable Kosten − Fixkosten = Ergebnis
//    Investment Center : zusätzlich Kapital -> ROCE (Ergebnis / Kapital)
//
//  EINHEITLICHE PC-WAHRHEIT: Die Center werden aus dem gemeinsamen PC-Modell
//  (pcKostenstellen) abgeleitet — dieselben Profit-Center, Kanäle und Länder
//  wie im PC-Baum/Filter, inkl. manueller Kostenstellen-Verschiebungen. Der
//  variable/fixe Kostensplit kommt aus der Kostenstellen-Gruppe; gebundenes
//  Kapital & Center-Typ je PC ergänzen ROCE. Beträge in Mio € (Quelle T€).
// =========================================================================
import { gruppiereNach, gesamt as pcGesamt } from './pcKostenstellen.js'
import { CENTER_TYPEN, centerTypInfo } from './kostenstellen.js'
export { CENTER_TYPEN, centerTypInfo, pcGesamt }

const r2 = (x) => Math.round(x * 100) / 100
const r1 = (x) => Math.round(x * 10) / 10
const T_ZU_MIO = 1000 // Quelle in T€ → Mio €

// Variabler Kostenanteil je Kostenstellen-Gruppe (Rest = zurechenbare Fixkosten).
const VAR_ANTEIL = {
  Material: 0.9, Produktion: 0.7, Logistik: 0.6, Partner: 0.6, Filiale: 0.5,
  Vertrieb: 0.4, Marketing: 0.3, 'IT/Betrieb': 0.25, Verwaltung: 0.1
}
const varAnteil = (gruppe) => (VAR_ANTEIL[gruppe] != null ? VAR_ANTEIL[gruppe] : 0.4)

// Center-Typ & gebundenes Kapital (Mio €) je Profit-Center (Geschäftsbereich).
const PC_META = {
  'pc-bike': { typ: 'investment', kapital: 14.0 },   // Produktion/Lager-intensiv
  'pc-store': { typ: 'investment', kapital: 9.0 },   // Filialen/Flächen
  'pc-ecom': { typ: 'profit', kapital: 0 },
  'pc-tbz': { typ: 'profit', kapital: 0 },
  'pc-zentral': { typ: 'cost', kapital: 0 }
}

// Wählbare Gruppierungs-Dimensionen = Strukturen des gemeinsamen PC-Baums.
export const DIMENSIONEN = [
  { key: 'geschaeftsbereich', name: 'Geschäftsbereich' },
  { key: 'kanal', name: 'Vertriebskanal' },
  { key: 'land', name: 'Land' }
]

/** Auswertung nach wählbarer PC-Struktur (Geschäftsbereich / Kanal / Land). */
export function auswertungNach(dim = 'geschaeftsbereich') {
  const istGB = dim === 'geschaeftsbereich'
  const gruppen = gruppiereNach(istGB ? 'geschaeftsbereich' : dim)
  const rows = gruppen.map((g) => {
    const umsatz = r2(g.erloes / T_ZU_MIO)
    const kosten = r2(g.kosten / T_ZU_MIO)
    const varKosten = r2(g.kostenstellen.reduce((n, k) => n + k.kosten * varAnteil(k.gruppe), 0) / T_ZU_MIO)
    const fixKosten = r2(kosten - varKosten)
    const db = r2(umsatz - varKosten)
    const ergebnis = r2(db - fixKosten)
    const meta = istGB ? (PC_META[g.id] || { typ: 'profit', kapital: 0 }) : { typ: null, kapital: 0 }
    const kapital = meta.kapital || null
    const roce = (meta.typ === 'investment' && kapital) ? r1(ergebnis / kapital * 100) : null
    return { id: g.id, name: g.name, typ: meta.typ, kapital, umsatz, varKosten, fixKosten, db, ergebnis, roce }
  })
  const gesamt = r2(rows.reduce((n, r) => n + r.ergebnis, 0))
  const umsatz = r2(rows.reduce((n, r) => n + r.umsatz, 0))
  return { rows: rows.map((r) => ({ ...r, beitrag: gesamt ? r1(r.ergebnis / gesamt * 100) : 0 })), gesamt, umsatz }
}

/** Standard-Auswertung je Profit-Center (Geschäftsbereich). */
export function auswertung() { return auswertungNach('geschaeftsbereich') }
