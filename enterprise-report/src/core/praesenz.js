// =========================================================================
//  PRÄSENZ / HEARTBEAT — wer ist gerade im Reporting? Jeder aktive Client
//  meldet sich regelmäßig (heartbeat). „Aktiv" = innerhalb des Zeitfensters
//  (Standard 60 Min.) zuletzt gesehen. Zusätzlich: eindeutige aktive Nutzer
//  je Tag, um Zeiträume auszuwerten.
//  (Lokal je Browser im Mock; identische Struktur später serverseitig.)
// =========================================================================
import { nutzerLabel } from './identitaet.js'

const KEY = 'er_praesenz'        // { [uid]: lastSeenISO }
const TAG_KEY = 'er_praesenz_tage' // { [date]: [uid, …] }  (eindeutige Aktive/Tag)
export const FENSTER_MIN = 60

const jetzt = () => Date.now()
const heute = () => new Date().toISOString().slice(0, 10)

function lade(key) { try { const o = JSON.parse(localStorage.getItem(key) || '{}'); return o && typeof o === 'object' ? o : {} } catch { return {} } }
function speichere(key, o) { try { localStorage.setItem(key, JSON.stringify(o)) } catch {} return o }

/** Lebenszeichen des aktuellen Nutzers setzen. */
export function heartbeat(uid) {
  if (!uid) return
  const m = lade(KEY)
  m[uid] = new Date().toISOString()
  speichere(KEY, m)

  const d = lade(TAG_KEY)
  const t = heute()
  const set = new Set(d[t] || [])
  set.add(uid)
  d[t] = [...set]
  // Tagesverlauf auf 60 Tage begrenzen.
  const tage = Object.keys(d).sort()
  while (tage.length > 60) delete d[tage.shift()]
  speichere(TAG_KEY, d)
  return m
}

/** Anzahl aktuell aktiver Nutzer (innerhalb des Zeitfensters). */
export function aktiveNutzer(fensterMin = FENSTER_MIN) {
  return aktiveListe(fensterMin).length
}

/** Liste der aktiven Nutzer mit „vor X Minuten gesehen". */
export function aktiveListe(fensterMin = FENSTER_MIN) {
  const m = lade(KEY)
  const grenze = jetzt() - fensterMin * 60000
  return Object.entries(m)
    .map(([uid, iso]) => ({ uid, name: nutzerLabel(uid), lastSeen: iso, minutenHer: Math.max(0, Math.round((jetzt() - new Date(iso).getTime()) / 60000)) }))
    .filter((x) => new Date(x.lastSeen).getTime() >= grenze)
    .sort((a, b) => a.minutenHer - b.minutenHer)
}

/** Eindeutige aktive Nutzer je Tag (letzte n Tage, älteste zuerst). */
export function aktiveProTag(n = 14) {
  const d = lade(TAG_KEY)
  const out = []
  const base = new Date()
  for (let i = n - 1; i >= 0; i--) {
    const x = new Date(base); x.setDate(base.getDate() - i)
    const tag = x.toISOString().slice(0, 10)
    out.push({ tag, anzahl: (d[tag] || []).length })
  }
  return out
}

/** Eindeutige aktive Nutzer heute / in den letzten 7 Tagen. */
export function aktiveZeitraum() {
  const d = lade(TAG_KEY)
  const tage = (n) => { const a = []; const b = new Date(); for (let i = 0; i < n; i++) { const x = new Date(b); x.setDate(b.getDate() - i); a.push(x.toISOString().slice(0, 10)) } return a }
  const uniq = (liste) => new Set(liste.flatMap((t) => d[t] || [])).size
  return { heute: uniq(tage(1)), woche: uniq(tage(7)), monat: uniq(tage(30)) }
}

export function reset() { try { localStorage.removeItem(KEY); localStorage.removeItem(TAG_KEY) } catch {} }
