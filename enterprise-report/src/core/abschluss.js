// =========================================================================
//  ABSCHLUSS & VERSIONIERUNG — Monatsabschluss revisionssicher einfrieren.
//
//  Workflow je Periode:  offen → in Abstimmung → freigegeben (final).
//  Bei „Freigeben" entsteht eine unveränderliche VERSION (Datenstand-Stempel,
//  Mix, Kommentar, Zeit, Benutzer); die Periode wird auf Datenart „ist"
//  gesetzt und gesperrt. Die Freigabe feuert das Ereignis
//  „abschluss_freigabe" → der Verteiler versendet automatisch.
//
//  Persistenz: localStorage (später DWH-Abschlusstabelle).
// =========================================================================
import { ladeModell, setDatenart, mixBeschreibung, AKTUELLER_MONAT } from './periodenmodell.js'

export const STATUS = [
  { id: 'offen',        name: 'Offen',          ampel: 'n', hinweis: 'In Bearbeitung, noch nicht abgestimmt' },
  { id: 'abstimmung',   name: 'In Abstimmung',  ampel: 'a', hinweis: 'Zahlen werden geprüft/abgestimmt' },
  { id: 'freigegeben',  name: 'Freigegeben',    ampel: 'g', hinweis: 'Final, eingefroren, revisionssicher' }
]
export const statusInfo = (id) => STATUS.find((s) => s.id === id) || STATUS[0]

const KEY = 'er_abschluss'

export function ladeAbschluss() {
  try { return JSON.parse(localStorage.getItem(KEY) || '{}') } catch { return {} }
}
function speichere(state) { localStorage.setItem(KEY, JSON.stringify(state)); return state }

/** Zustand einer Periode (mit Default „offen"). */
export function periode(p) {
  const s = ladeAbschluss()[p]
  return s || { status: 'offen', versionen: [] }
}
export function istGesperrt(p) { return periode(p).status === 'freigegeben' }

function stempel(modell) {
  return `Stand ${new Date().toLocaleString('de-DE')} · Datumssicht ${modell.datumssicht} · Mix: ${mixBeschreibung(modell)}`
}

/** Status setzen (offen/abstimmung). Freigabe läuft über freigeben(). */
export function setStatus(p, status) {
  const state = ladeAbschluss()
  const akt = state[p] || { status: 'offen', versionen: [] }
  state[p] = { ...akt, status }
  return speichere(state)
}

/** Zwischenstand als Version sichern, ohne freizugeben (z. B. Abstimm-Stand). */
export function sichereVersion(p, kommentar, benutzer = 'system') {
  const modell = ladeModell()
  const state = ladeAbschluss()
  const akt = state[p] || { status: 'offen', versionen: [] }
  const v = {
    nr: akt.versionen.length + 1, zeit: new Date().toISOString(), benutzer,
    stempel: stempel(modell), mix: mixBeschreibung(modell), datumssicht: modell.datumssicht,
    status: akt.status, final: false, kommentar: kommentar || ''
  }
  state[p] = { ...akt, versionen: [...akt.versionen, v] }
  return speichere(state)
}

/**
 * Periode freigeben: finale Version, Sperre, Datenart→ist, Ereignis feuern.
 * Gibt { state, ereignis } zurück (ereignis = Backend-Antwort oder null).
 */
export async function freigeben(p, kommentar, benutzer = 'system') {
  const modell = ladeModell()
  const state = ladeAbschluss()
  const akt = state[p] || { status: 'offen', versionen: [] }
  const v = {
    nr: akt.versionen.length + 1, zeit: new Date().toISOString(), benutzer,
    stempel: stempel(modell), mix: mixBeschreibung(modell), datumssicht: modell.datumssicht,
    status: 'freigegeben', final: true, kommentar: kommentar || 'Monatsabschluss freigegeben'
  }
  state[p] = { ...akt, status: 'freigegeben', versionen: [...akt.versionen, v], freigabe: v.zeit }
  speichere(state)
  setDatenart(p, 'ist')                         // Periode auf Ist sperren
  const ereignis = await feuereFreigabe(p)      // Verteiler auslösen (best-effort)
  return { state, ereignis }
}

/** Freigabe-Sperre wieder öffnen (Korrekturlauf) — protokolliert als Version. */
export function wiedereroeffnen(p, kommentar, benutzer = 'system') {
  const modell = ladeModell()
  const state = ladeAbschluss()
  const akt = state[p] || { status: 'offen', versionen: [] }
  const v = {
    nr: akt.versionen.length + 1, zeit: new Date().toISOString(), benutzer,
    stempel: stempel(modell), mix: mixBeschreibung(modell), datumssicht: modell.datumssicht,
    status: 'abstimmung', final: false, kommentar: kommentar || 'Wiedereröffnet (Korrektur)'
  }
  state[p] = { ...akt, status: 'abstimmung', versionen: [...akt.versionen, v], freigabe: null }
  return speichere(state)
}

/** Ereignis „abschluss_freigabe" an das Backend (löst den Verteiler aus). */
async function feuereFreigabe(p) {
  try {
    const r = await fetch('/api/ereignis/abschluss_freigabe', {
      method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ periode: p })
    })
    if (!r.ok) return null
    return r.json() // { ausgeloest: [...] }
  } catch { return null } // kein Backend (Mock) → Freigabe bleibt lokal gültig
}

export { AKTUELLER_MONAT }
