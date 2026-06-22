// =========================================================================
//  BERICHT-STATUS / FREIGABE — der Admin steuert je Bericht die Sichtbarkeit:
//   • aktiv        → für alle sichtbar (im Rahmen der Rollenrechte)
//   • test         → nur für Admin und freigegebene Testuser sichtbar
//   • deaktiviert  → für niemanden außer Admin sichtbar
//
//  Persistenz im LocalStorage (später Backend/DB). Testuser werden je Bericht
//  über ihre Nutzer-Kennung (nutzerId) freigegeben.
// =========================================================================
import { nutzerId } from './identitaet.js'

export const STATUS = { AKTIV: 'aktiv', TEST: 'test', DEAKTIVIERT: 'deaktiviert' }
export const STATUS_LISTE = [
  { id: 'aktiv', name: 'Aktiv', icon: '✓', farbe: 'var(--amp-g)' },
  { id: 'test', name: 'Test', icon: '🧪', farbe: 'var(--amp-a)' },
  { id: 'deaktiviert', name: 'Deaktiviert', icon: '⏸', farbe: 'var(--amp-r)' }
]
const KEY_STATUS = 'er_bericht_status'
const KEY_TEST = 'er_bericht_testuser'

function lade(key) { try { return JSON.parse(localStorage.getItem(key) || '{}') } catch { return {} } }
function speichere(key, o) { localStorage.setItem(key, JSON.stringify(o)); return o }

export const ladeStatus = () => lade(KEY_STATUS)
export function statusVon(view) { return ladeStatus()[view] || STATUS.AKTIV }
export function setzeStatus(view, status) {
  const o = ladeStatus()
  if (status === STATUS.AKTIV) delete o[view]; else o[view] = status
  return speichere(KEY_STATUS, o)
}

export const ladeTestuser = () => lade(KEY_TEST)
export function testuserVon(view) { return ladeTestuser()[view] || [] }
/** Testuser je Bericht freigeben/entziehen (über nutzerId). */
export function testuserToggle(view, uid) {
  const o = ladeTestuser(); const set = new Set(o[view] || [])
  set.has(uid) ? set.delete(uid) : set.add(uid)
  o[view] = [...set]; if (!o[view].length) delete o[view]
  return speichere(KEY_TEST, o)
}
export const istTestuser = (view, uid) => testuserVon(view).includes(uid)

/** Sichtbarkeit eines Berichts für einen Nutzer (Status-Ebene, unabhängig von
 *  den Rollenrechten). Admin sieht immer alles (zum Verwalten). */
export function istSichtbar(view, { admin = false, uid = null } = {}) {
  if (admin) return true
  const s = statusVon(view)
  if (s === STATUS.DEAKTIVIERT) return false
  if (s === STATUS.TEST) return testuserVon(view).includes(uid)
  return true
}

/** Bequemer Wrapper mit Klarnamen statt uid. */
export const istSichtbarFuerName = (view, { admin, name }) => istSichtbar(view, { admin, uid: name ? nutzerId(name) : null })
