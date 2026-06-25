// =========================================================================
//  KPI-FREIGABE (Governance)
//  Eine Kennzahl ist erst dann für alle sichtbar, wenn die Daten sauber
//  angebunden und vom Controlling/Admin freigegeben wurden.
//
//  Status je KPI:
//   - 'freigegeben'  → für alle sichtbar (Wert wird angezeigt)            [Default]
//   - 'entwurf'      → noch nicht angebunden/geprüft: NUR Controller+Admin
//                      sehen den Wert; für alle anderen ist die Kennzahl
//                      gar nicht sichtbar (versteckt)
//   - 'deaktiviert'  → war mal aktiv, ist abgeschaltet: für ALLE als kurzer
//                      Platzhalter "Aktuell nicht verfügbar" (kein Wert)
//
//  Persistenz: localStorage 'er_kpi_freigabe' = { [kpiId]: status }.
// =========================================================================
import { istAdmin } from './gruppen.js'

export const FREIGABE_STATUS = ['freigegeben', 'entwurf', 'deaktiviert']
export const FREIGABE_LABEL = {
  freigegeben: 'Freigegeben',
  entwurf: 'Entwurf (nicht freigegeben)',
  deaktiviert: 'Deaktiviert'
}
const KEY = 'er_kpi_freigabe'

function ladeAlle() {
  try { return JSON.parse(localStorage.getItem(KEY) || '{}') || {} } catch { return {} }
}
function speichereAlle(map) {
  try { localStorage.setItem(KEY, JSON.stringify(map)) } catch {}
}

/** Aktueller Freigabestatus einer Kennzahl (Default: freigegeben). */
export function statusVon(kpiId) {
  const s = ladeAlle()[kpiId]
  return FREIGABE_STATUS.includes(s) ? s : 'freigegeben'
}

/** Status setzen (vom Controlling/Admin). Ungültige Werte werden ignoriert. */
export function setzeStatus(kpiId, status) {
  if (!FREIGABE_STATUS.includes(status)) return ladeAlle()
  const map = ladeAlle()
  if (status === 'freigegeben') delete map[kpiId] // Default nicht speichern
  else map[kpiId] = status
  speichereAlle(map)
  return map
}

/** Darf diese Rolle Kennzahlen freigeben/steuern? (Controlling + Admin) */
export function darfFreigeben(rolle) {
  if (!rolle) return false
  return istAdmin(rolle) || rolle.id === 'g-controlling' || (rolle.kontext || []).includes('CTRL')
}

/**
 * Wie soll die Kennzahl für diese Rolle dargestellt werden?
 *  - 'wert'           → Wert normal anzeigen
 *  - 'entwurf'        → Wert anzeigen, aber als Entwurf markiert (nur Befugte)
 *  - 'versteckt'      → gar nicht anzeigen (Entwurf, unbefugte Rolle)
 *  - 'nichtVerfuegbar'→ Platzhalter "Aktuell nicht verfügbar" (deaktiviert)
 */
export function kpiAnzeige(kpiId, rolle) {
  const status = statusVon(kpiId)
  if (status === 'deaktiviert') return { modus: 'nichtVerfuegbar', status }
  if (status === 'entwurf') return { modus: darfFreigeben(rolle) ? 'entwurf' : 'versteckt', status }
  return { modus: 'wert', status }
}

/** Kurzer, allgemeinverständlicher Platzhaltertext für abgeschaltete KPIs. */
export const NICHT_VERFUEGBAR = 'Aktuell nicht verfügbar'
