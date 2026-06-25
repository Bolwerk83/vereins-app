// =========================================================================
//  BERICHT-RECHTE (Freigabe je Rolle & je Kollege) — ADDITIV zur Bereichs-
//  logik (darfBereich): hier kann der Admin einzelne Berichte ODER ganze
//  Ordner zusätzlich freigeben — pro Rolle (Gruppe) und pro Kollege (Person).
//  Eine Freigabe erweitert die Sicht, sie entzieht nie etwas.
//
//  Ordner-Katalog: Berichte nach Cluster (Führung/Markt/Supply/…) gruppiert,
//  Kernberichte ohne Fachbereich in „Cockpit & Allgemein". Persistenz lokal.
// =========================================================================
import { NAV_ZIELE } from './suche.js'
import { bereichVon } from './navMeta.js'
import { CLUSTER } from './bereiche.js'
import { nutzerId } from './identitaet.js'

const KEY_ROLLE = 'er_rolle_berichte'  // { rolleId: [view, …] }
const KEY_USER = 'er_user_berichte'    // { uid: [view, …] }

function lade(key) { try { return JSON.parse(localStorage.getItem(key) || '{}') } catch { return {} } }
function speichere(key, o) { try { localStorage.setItem(key, JSON.stringify(o)) } catch {} ; return o }

const setVon = (o, k) => new Set(o[k] || [])
function toggleIn(key, k, view) {
  const o = lade(key); const s = setVon(o, k)
  s.has(view) ? s.delete(view) : s.add(view)
  o[k] = [...s]; if (!o[k].length) delete o[k]
  return speichere(key, o)
}
function setzeViele(key, k, views, an) {
  const o = lade(key); const s = setVon(o, k)
  for (const v of views) an ? s.add(v) : s.delete(v)
  o[k] = [...s]; if (!o[k].length) delete o[k]
  return speichere(key, o)
}

// --- Rolle -----------------------------------------------------------------
export const rolleViews = (rolleId) => setVon(lade(KEY_ROLLE), rolleId)
export const rolleToggle = (rolleId, view) => toggleIn(KEY_ROLLE, rolleId, view)
export const rolleSetzeOrdner = (rolleId, views, an) => setzeViele(KEY_ROLLE, rolleId, views, an)

// --- Kollege (Person) ------------------------------------------------------
export const userViews = (uid) => setVon(lade(KEY_USER), uid)
export const userToggle = (uid, view) => toggleIn(KEY_USER, uid, view)
export const userSetzeOrdner = (uid, views, an) => setzeViele(KEY_USER, uid, views, an)

/** Zusätzliche Freigabe vorhanden? (Rolle ODER Person). */
export function hatFreigabe(rolleId, uid, view) {
  if (rolleId && setVon(lade(KEY_ROLLE), rolleId).has(view)) return true
  if (uid && setVon(lade(KEY_USER), uid).has(view)) return true
  return false
}
export const hatFreigabeFuerName = (rolleId, name, view) => hatFreigabe(rolleId, name ? nutzerId(name) : null, view)

// --- Ordner-Katalog (Berichte nach Cluster) --------------------------------
// Verwaltungs-/System-Sichten ausnehmen (nicht freigebbar).
const AUSNAHME = new Set(['wizard', 'admin', 'nutzung', 'rechte', 'berichtfreigabe', 'berichtlog', 'transport', 'verteiler', 'datenmodell', 'datenschutz', 'kisteuerung', 'rechte'])

/** Berichts-Ordner: [{ id, name, berichte:[{view, schluessel}] }] — t() liefert Labels. */
export function berichtsOrdner() {
  const clusterVon = (view) => {
    const b = bereichVon(view)
    if (!b) return { id: 'cockpit', name: 'Cockpit & Allgemein' }
    const c = CLUSTER.find((c) => c.bereiche.includes(b))
    return c ? { id: c.id, name: c.name } : { id: 'weitere', name: 'Weitere' }
  }
  const map = new Map()
  for (const z of NAV_ZIELE) {
    if (AUSNAHME.has(z.ziel)) continue
    const c = clusterVon(z.ziel)
    if (!map.has(c.id)) map.set(c.id, { id: c.id, name: c.name, berichte: [] })
    map.get(c.id).berichte.push({ view: z.ziel, schluessel: z.schluessel })
  }
  // Cockpit zuerst, dann nach Cluster-Reihenfolge.
  const ord = ['cockpit', ...CLUSTER.map((c) => c.id), 'weitere']
  return [...map.values()].sort((a, b) => ord.indexOf(a.id) - ord.indexOf(b.id))
}
