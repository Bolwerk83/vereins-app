// =========================================================================
//  ZUGRIFFSANFRAGEN — wenn ein Nutzer einen gesperrten Bericht sieht, kann er
//  Zugriff anfordern. Anfragen werden lokal gesammelt; der Admin sieht sie in
//  „Rollen & Rechte" und kann die Berechtigung dann vergeben.
//  (Mock/lokal; mappt später auf ein Ticket-/Berechtigungs-Backend.)
// =========================================================================
const KEY = 'er_zugriffsanfragen'

export function ladeAnfragen() {
  try { const a = JSON.parse(localStorage.getItem(KEY) || '[]'); return Array.isArray(a) ? a : [] } catch { return [] }
}
function speichere(a) { try { localStorage.setItem(KEY, JSON.stringify(a)) } catch {} return a }

export const anfrageOffen = (view, uid) => ladeAnfragen().some((r) => r.view === view && r.uid === uid)

/** Zugriff auf einen Bericht anfordern (dedupliziert je View+Nutzer). */
export function anfrageStellen({ view, bereich, uid, name }) {
  if (!view) return ladeAnfragen()
  const a = ladeAnfragen()
  if (a.some((r) => r.view === view && r.uid === uid)) return a // schon angefragt
  return speichere([{ view, bereich: bereich || null, uid: uid || null, name: name || null, zeit: new Date().toISOString() }, ...a])
}

export function loescheAnfrage(view, uid) {
  return speichere(ladeAnfragen().filter((r) => !(r.view === view && r.uid === uid)))
}

export const anzahlAnfragen = () => ladeAnfragen().length
