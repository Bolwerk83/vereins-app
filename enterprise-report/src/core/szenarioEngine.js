// =========================================================================
//  SZENARIO-ENGINE — mehrere Stellhebel gleichzeitig, volle Wirkung über das
//  dichte KAUSALMODELL + den strukturellen berechne()-Graph der Registry.
//  Liefert die Wirkung als gerankte Effektliste mit Klartext-Erklärungen,
//  damit man Größen und wichtigste Auswirkungen sofort erkennt.
//
//  Rein rechnerisch/explorativ: ändert keine gespeicherten Werte.
// =========================================================================
import { KPI, berechneAlle } from './kpiRegistry.js'
import { ampelStatus } from './ampel.js'
import { KAUSAL } from './kausalmodell.js'

const r2 = (x) => Math.round(x * 100) / 100
const amp = (k, w) => ampelStatus({ wert: w, ziel: k.ziel, richtung: k.richtung, warn: k.warn })

// Klartext-Erklärung je Effekt-Kennzahl (aus dem Kausalmodell).
export const ERKLAERUNG = Object.fromEntries(KAUSAL.map((e) => [e.id, e.erklaerung]))

// Kuratierte Stellhebel (Roh-/Treiber-Kennzahlen, die als Hebel Sinn ergeben).
export const STELLHEBEL = [
  'nettoumsatz', 'wareneinsatz', 'gemeinkosten', 'personalkosten', 'marketingkosten',
  'retourenquote', 'rabattquote', 'ausschuss', 'krankenstand', 'fluktuation',
  'dso', 'einkaufsvolumen', 'kapazitaetsauslastung', 'reklamationsquote', 'oekostromanteil',
]

// Kern-Kennzahlen für Range/Vergleich (Landepunkte).
export const KERN_KPIS = ['ebit', 'betrieblichesErgebnis', 'nettoumsatz', 'dbQuote', 'db1', 'operativerCashflow', 'roce']

export function stellhebel(roh = {}) {
  const basis = berechneAlle(roh)
  return STELLHEBEL.map((id) => KPI[id] && basis[id] != null ? { id, name: KPI[id].name, einheit: KPI[id].einheit, basis: basis[id] } : null).filter(Boolean)
}

/**
 * Simulation mit MEHREREN Overrides.
 * @param {object} roh        Roh-Kennzahlen (MOCK.roheWerte[periode])
 * @param {object} overrides  { id: { modus:'pct'|'abs', wert:number } }
 * @returns {{ basis, sim, fixiert:string[] }}
 */
export function simuliereSzenario(roh = {}, overrides = {}) {
  const basis = berechneAlle(roh)
  const fix = {}
  for (const [id, ov] of Object.entries(overrides)) {
    if (basis[id] == null || !ov) continue
    const wert = Number(ov.wert)
    if (Number.isNaN(wert)) continue
    if (ov.modus !== 'abs' && wert === 0) continue // 0 % relativ = kein Effekt; absolut 0 ist gültig
    fix[id] = ov.modus === 'abs' ? wert : r2(basis[id] * (1 + wert / 100))
  }
  const sim = { ...basis, ...fix }
  const fixIds = new Set(Object.keys(fix))
  const struktur = Object.values(KPI).filter((k) => typeof k.berechne === 'function' && !fixIds.has(k.id))
  const kausal = KAUSAL.filter((e) => !fixIds.has(e.id))
  for (let runde = 0; runde < 24; runde++) {
    let ch = false
    for (const e of kausal) {
      if (basis[e.id] != null && e.von.every((d) => sim[d] != null && basis[d] != null)) {
        const nv = e.f(sim, basis)
        if (Math.abs(nv - (sim[e.id] ?? 0)) > 1e-9) { sim[e.id] = nv; ch = true }
      }
    }
    for (const k of struktur) {
      if (k.abhaengig.every((d) => sim[d] != null)) {
        const nv = k.berechne(sim)
        if (Math.abs(nv - (sim[k.id] ?? 0)) > 1e-9) { sim[k.id] = nv; ch = true }
      }
    }
    if (!ch) break
  }
  return { basis, sim, fixiert: [...fixIds] }
}

/**
 * Gerankte Effektliste: Ampel-Wechsel zuerst, dann (gedeckelte) relative
 * Änderung. Mit Erklärung (Kausalmodell) und Stromgrößen-Flag (für „kumuliert").
 */
export function effekte(basis, sim, { fixiert = [], rolle = null, darfKpi = null } = {}) {
  const fix = new Set(fixiert)
  return Object.values(KPI).map((k) => {
    if (fix.has(k.id)) return null
    if (rolle && darfKpi && !darfKpi(rolle, k)) return null
    const vor = basis[k.id], nach = sim[k.id]
    if (vor == null || nach == null) return null
    const delta = r2(nach - vor)
    if (Math.abs(delta) <= 1e-6) return null
    const aVor = amp(k, vor), aNach = amp(k, nach)
    const rel = Math.abs((nach - vor) / (vor || 1))
    const strom = k.einheit === 'eur_mio' || k.einheit === 'stk' || k.einheit === 'menge'
    return {
      id: k.id, name: k.name, einheit: k.einheit, ziel: k.ziel,
      vor, nach, delta, deltaPct: vor ? r2((nach - vor) / Math.abs(vor) * 100) : null,
      ampVor: aVor, ampNach: aNach, flip: aVor !== aNach && k.ziel != null,
      strom, erklaerung: ERKLAERUNG[k.id] || null,
      score: (aVor !== aNach && k.ziel != null ? 1000 : 0) + Math.min(rel, 5) * 100,
    }
  }).filter(Boolean).sort((a, b) => b.score - a.score)
}
