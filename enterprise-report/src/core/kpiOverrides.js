// =========================================================================
//  KPI-OVERRIDES — KPI-Definitionen im Tool bearbeiten (Ziel, Beschreibung,
//  Einheit, Name, Richtung). Speicherung in er_kpi_overrides (gleiche Schicht,
//  die der Transport nutzt) und SOFORT in der laufenden Registry wirksam.
//
//  Originalwerte werden vor der ersten Änderung gesichert, damit
//  „Zurücksetzen" den Code-Stand wiederherstellt (ohne Reload).
// =========================================================================
import { KPI, KPI_BASIS, OVERRIDE_FELDER } from './kpiRegistry.js'

const KEY = 'er_kpi_overrides'
const ORIGINAL = {} // Session-Snapshots vor der ersten Bearbeitung

export const EINHEITEN = [
  { id: 'eur_mio', name: 'EUR Mio' }, { id: 'eur', name: 'EUR' },
  { id: 'percent', name: 'Prozent (1 Nk)' }, { id: 'percent0', name: 'Prozent (0 Nk)' },
  { id: 'days', name: 'Tage' }, { id: 'faktor', name: 'Faktor (×)' },
  { id: 'monate', name: 'Monate' }, { id: 'count', name: 'Anzahl' },
  { id: 'kg', name: 'kg' }, { id: 'kwh', name: 'kWh' }, { id: 'tonnen', name: 'Tonnen' }
]
export const RICHTUNGEN = [
  { id: 'hoch_gut', name: 'höher = besser' }, { id: 'tief_gut', name: 'niedriger = besser' }
]

export function ladeOverrides() { try { return JSON.parse(localStorage.getItem(KEY) || '{}') } catch { return {} } }
function speichere(o) { localStorage.setItem(KEY, JSON.stringify(o)); return o }
export const istUeberschrieben = (id) => !!ladeOverrides()[id]

function snapshot(id) {
  if (ORIGINAL[id] || !KPI[id]) return
  ORIGINAL[id] = {}
  for (const f of OVERRIDE_FELDER) ORIGINAL[id][f] = KPI[id][f]
}

/** Override setzen: persistieren + live in der Registry anwenden. */
export function setKpiOverride(id, patch) {
  snapshot(id)
  const o = ladeOverrides()
  o[id] = { ...(o[id] || {}), ...patch }
  speichere(o)
  if (KPI[id]) Object.assign(KPI[id], patch)
  return o[id]
}

/** Override entfernen: Code-Original wiederherstellen (Session- oder Load-Snapshot). */
export function resetKpiOverride(id) {
  const o = ladeOverrides()
  delete o[id]
  speichere(o)
  const basis = ORIGINAL[id] || KPI_BASIS[id]
  if (basis && KPI[id]) Object.assign(KPI[id], basis)
  return o
}

/** Aktuelle (ggf. überschriebene) editierbare Felder einer KPI. */
export function kpiFelder(id) {
  const k = KPI[id] || {}
  return { name: k.name || '', einheit: k.einheit || 'count', ziel: k.ziel ?? '', richtung: k.richtung || 'hoch_gut', beschreibung: k.beschreibung || '' }
}
