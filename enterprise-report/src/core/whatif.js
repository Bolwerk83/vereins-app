// =========================================================================
//  WHAT-IF / SZENARIO-SIMULATOR — Treiber-Kennzahlen prozentual oder absolut
//  ändern und die Wirkung auf die abgeleiteten KPIs LIVE sehen. Nutzt den
//  KPI-Abhängigkeitsgraph + berechneAlle() der Registry (keine Doppellogik).
// =========================================================================
import { KPI, berechneAlle } from './kpiRegistry.js'

const r2 = (x) => Math.round(x * 100) / 100

/** Roh-/Treiber-Kennzahlen: direkt eingegebene Werte (keine Formel). */
export function treiber(roh = {}) {
  return Object.values(KPI)
    .filter((k) => typeof k.berechne !== 'function' && roh[k.id] != null && typeof roh[k.id] === 'number')
    .map((k) => ({ id: k.id, name: k.name, einheit: k.einheit, basis: roh[k.id] }))
}

/** Abgeleitete Kennzahlen (mit Formel) — auf die wirken sich Änderungen aus. */
export function abgeleitet() {
  return Object.values(KPI).filter((k) => typeof k.berechne === 'function').map((k) => ({ id: k.id, name: k.name, einheit: k.einheit }))
}

/**
 * Simulation: overrides = { kpiId: { modus:'pct'|'abs', wert:number } }.
 *  pct: ±% auf den Basiswert; abs: absoluter neuer Wert.
 * Liefert Basis- und Simulationswerte aller KPIs + Delta je abgeleiteter KPI.
 */
export function simuliere(roh = {}, overrides = {}) {
  const basis = berechneAlle(roh)
  const rohSim = { ...roh }
  for (const [id, ov] of Object.entries(overrides)) {
    if (roh[id] == null || !ov) continue
    rohSim[id] = ov.modus === 'abs' ? Number(ov.wert) : r2(roh[id] * (1 + Number(ov.wert) / 100))
  }
  const sim = berechneAlle(rohSim)
  const wirkung = abgeleitet().map((k) => {
    const vor = basis[k.id], nach = sim[k.id]
    const delta = (vor != null && nach != null) ? r2(nach - vor) : null
    const deltaPct = (vor) ? r2((nach - vor) / Math.abs(vor) * 100) : null
    return { ...k, vor, nach, delta, deltaPct, geaendert: delta != null && Math.abs(delta) > 0.0001 }
  })
  return { basis, sim, wirkung }
}
