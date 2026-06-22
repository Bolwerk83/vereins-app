// =========================================================================
//  LAGER-SIGNALE — Kommentar- & Eskalations-Workflow
//  Wichtige (unkommentierte) Signale „ploppen" bei der Abteilungsleitung
//  Einkauf auf, damit sie Rückfragen stellen kann. Sobald jemand kommentiert,
//  gilt das Signal als geklärt und eskaliert nicht mehr.
// =========================================================================
import { signale } from './lager.js'

const KEY = 'er_lager_kommentar'

function ladeAlle() {
  try { return JSON.parse(localStorage.getItem(KEY) || '{}') || {} } catch { return {} }
}
function speichereAlle(map) { try { localStorage.setItem(KEY, JSON.stringify(map)) } catch {} }

/** Kommentar zu einem Signal lesen ({ text, von, am } oder null). */
export function kommentarVon(signalId) { return ladeAlle()[signalId] || null }

/** Signal kommentieren (markiert es als geklärt → keine Eskalation mehr). */
export function kommentiere(signalId, text, von = 'Du') {
  const map = ladeAlle()
  if (!text || !text.trim()) delete map[signalId]
  else map[signalId] = { text: text.trim(), von, am: new Date().toISOString().slice(0, 10) }
  speichereAlle(map)
  return map
}

/** Ist die Rolle (auch) für den Einkauf verantwortlich? (Abteilungsleitung) */
export function istEinkaufsleitung(rolle) {
  if (!rolle) return false
  return rolle.bereiche === '*' || (Array.isArray(rolle.bereiche) && rolle.bereiche.includes('EK'))
}

/**
 * Offene Eskalationen: wichtige/kritische Signale ohne Kommentar.
 * Genau diese sollen bei der Einkaufsleitung aufploppen.
 */
export function offeneEskalationen(artikel) {
  return signale(artikel)
    .filter((s) => (s.schwere === 'kritisch' || s.schwere === 'wichtig') && !kommentarVon(s.id))
}

/** Alle Signale mit angehängtem Kommentarstatus (für die Übersicht). */
export function signaleMitStatus(artikel) {
  return signale(artikel).map((s) => ({ ...s, kommentar: kommentarVon(s.id) }))
}
