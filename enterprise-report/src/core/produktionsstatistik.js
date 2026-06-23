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

/** Produkt-Statistik: Output (Summe/Ø), Trend, Ausschuss, FPY, Stückkosten,
 *  produzierter Wert (= Menge × Stückkosten). */
export function produkte(monate = 6) {
  return PROGRAMM.map((p) => {
    const reihe = (OUTPUT_HISTORIE[p.id] || []).slice(-monate)
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

/** Monatlicher Gesamt-Output (alle Produkte) als Reihe. */
export function monatsOutput(monate = 6) {
  const ms = MONATE.slice(-monate)
  return ms.map((m, i) => {
    const idx = MONATE.length - monate + i
    const stueck = PROGRAMM.reduce((n, p) => n + ((OUTPUT_HISTORIE[p.id] || [])[idx] || 0), 0)
    return { monat: m, stueck }
  })
}

/** Werke-Output: Summe Output je Werk (über die Linien/Produkte). */
export function werke(monate = 6) {
  const pr = produkte(monate)
  const wa = werkeAuswertung()
  return WERKE.map((w) => {
    const linienIds = LINIEN.filter((l) => l.werkId === w.id).map((l) => l.id)
    const stueck = pr.filter((p) => linienIds.includes(p.linieId)).reduce((n, p) => n + p.summe, 0)
    const wert = pr.filter((p) => linienIds.includes(p.linieId)).reduce((n, p) => n + p.produzierterWert, 0)
    const a = wa.find((x) => x.id === w.id) || {}
    return { id: w.id, name: w.name, ort: w.ort, stueck, wert, oee: a.oee ?? 0, auslastung: a.auslastung ?? 0 }
  }).sort((a, b) => b.stueck - a.stueck)
}

export function kennzahlen(monate = 6) {
  const pr = produkte(monate)
  const q = qualitaetAuswertung()
  const stueck = pr.reduce((n, p) => n + p.summe, 0)
  const wert = pr.reduce((n, p) => n + p.produzierterWert, 0)
  const ausschussStueck = pr.reduce((n, p) => n + p.ausschussStueck, 0)
  const wa = werkeAuswertung()
  return {
    stueck, schnittMonat: r0(stueck / monate), wert, ausschussPct: q.ausschussPct,
    ausschussStueck, fpy: q.fpy, oee: r1(wa.reduce((n, w) => n + w.oee, 0) / wa.length),
    auslastung: r1(wa.reduce((n, w) => n + w.auslastung, 0) / wa.length),
    avgStueckkosten: stueck ? r0(wert / stueck) : 0, werkeN: WERKE.length, topProdukt: pr[0]?.name, monate
  }
}
