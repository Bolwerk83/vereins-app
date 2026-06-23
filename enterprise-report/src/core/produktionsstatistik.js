// =========================================================================
//  PRODUKTIONSSTATISTIK — Output-Überblick der Fertigung: produzierte Mengen
//  je Produkt und Werk, Monatsverlauf, Ausschuss/First-Pass-Yield und
//  Stückkosten. Aufbauend auf den Daten des Produktionscontrollings, hier
//  als kompakte Statistik. Mengen in Stück, Beträge in €.
// =========================================================================
import { PROGRAMM, WERKE, OUTPUT_HISTORIE, MONATE, QUALITAET, LINIEN, qualitaetAuswertung, werkeAuswertung } from './produktion.js'

const r0 = (x) => Math.round(x)
const r1 = (x) => Math.round(x * 10) / 10

export { MONATE }

const qualFuerProdukt = (linieId) => QUALITAET.find((q) => q.linieId === linieId) || { ausschussPct: 0, fpy: 100 }
// Tatsächlich mit Ist-Daten belegte Monatsindizes (Output-Historie reicht bis Juni).
export const VERFUEGBARE_MONATE = MONATE.map((_, i) => i).filter((i) => PROGRAMM.some((p) => (OUTPUT_HISTORIE[p.id] || [])[i] != null))
/** Auswahl auf vorhandene Monate eingrenzen (Zukunftsmonate ohne Ist entfallen). */
function gewaehlteMonate(monate) {
  const sel = monate || VERFUEGBARE_MONATE
  return sel.filter((i) => VERFUEGBARE_MONATE.includes(i))
}

/** Produkt-Statistik: Output (Summe/Ø), Trend, Ausschuss, FPY, Stückkosten,
 *  produzierter Wert (= Menge × Stückkosten). monate = Index-Auswahl, faktor =
 *  Profit-Center-Skalierung. */
const verschoben = (reihe, i, shift) => { const j = Math.max(0, Math.min(reihe.length - 1, i - shift)); return reihe[j] }
export function produkte({ monate, faktor = 1, shift = 0 } = {}) {
  const ms = gewaehlteMonate(monate)
  return PROGRAMM.map((p) => {
    const hist = OUTPUT_HISTORIE[p.id] || []
    const reihe = ms.map((i) => r0(verschoben(hist, i, shift) * faktor))
    const summe = reihe.reduce((a, b) => a + b, 0)
    const schnitt = reihe.length ? r0(summe / reihe.length) : 0
    const trendPct = reihe.length > 1 && reihe[0] ? r1((reihe[reihe.length - 1] - reihe[0]) / reihe[0] * 100) : 0
    const q = qualFuerProdukt(p.linieId)
    return {
      id: p.id, name: p.name, linieId: p.linieId, reihe, summe, schnitt, trendPct,
      ausschussPct: q.ausschussPct, fpy: q.fpy, ausschussStueck: r0(summe * q.ausschussPct / 100),
      stueckkosten: p.stueckkosten, produzierterWert: r0(summe * p.stueckkosten)
    }
  }).sort((a, b) => b.produzierterWert - a.produzierterWert)
}

/** Monatlicher Gesamt-Output (alle Produkte) als Reihe über die Auswahl. */
export function monatsOutput({ monate, faktor = 1, shift = 0 } = {}) {
  return gewaehlteMonate(monate).map((i) => ({
    monat: MONATE[i], stueck: r0(PROGRAMM.reduce((n, p) => n + (verschoben(OUTPUT_HISTORIE[p.id] || [], i, shift) || 0), 0) * faktor)
  }))
}

/** Werke-Output: Summe Output je Werk (über die Linien/Produkte). */
export function werke(opts = {}) {
  const pr = produkte(opts)
  const wa = werkeAuswertung()
  return WERKE.map((w) => {
    const linienIds = LINIEN.filter((l) => l.werkId === w.id).map((l) => l.id)
    const stueck = pr.filter((p) => linienIds.includes(p.linieId)).reduce((n, p) => n + p.summe, 0)
    const wert = pr.filter((p) => linienIds.includes(p.linieId)).reduce((n, p) => n + p.produzierterWert, 0)
    const a = wa.find((x) => x.id === w.id) || {}
    return { id: w.id, name: w.name, ort: w.ort, stueck, wert, oee: a.oee ?? 0, auslastung: a.auslastung ?? 0 }
  }).sort((a, b) => b.stueck - a.stueck)
}

export function kennzahlen(opts = {}) {
  const pr = produkte(opts)
  const q = qualitaetAuswertung()
  const monateN = gewaehlteMonate(opts.monate).length
  const stueck = pr.reduce((n, p) => n + p.summe, 0)
  const wert = pr.reduce((n, p) => n + p.produzierterWert, 0)
  const ausschussStueck = pr.reduce((n, p) => n + p.ausschussStueck, 0)
  const wa = werkeAuswertung()
  return {
    stueck, schnittMonat: monateN ? r0(stueck / monateN) : 0, wert, ausschussPct: q.ausschussPct,
    ausschussStueck, fpy: q.fpy, oee: r1(wa.reduce((n, w) => n + w.oee, 0) / wa.length),
    auslastung: r1(wa.reduce((n, w) => n + w.auslastung, 0) / wa.length),
    avgStueckkosten: stueck ? r0(wert / stueck) : 0, werkeN: WERKE.length, topProdukt: pr[0]?.name, monateN
  }
}
