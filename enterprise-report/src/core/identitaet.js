// =========================================================================
//  IDENTITÄT — stabile Nutzer-Kennung für die Nutzungs-/Präsenz-Statistik.
//  Angemeldeter Benutzer → "user:<name>"; sonst eine pro Gerät/Browser
//  persistierte anonyme ID. Rein technisch, keine personenbezogene Auswertung.
//  (Im Mock lokal je Browser; mappt später 1:1 auf das Backend/SSO.)
// =========================================================================
const ANON_KEY = 'er_anon_uid'

export function anonId() {
  try {
    let id = localStorage.getItem(ANON_KEY)
    if (!id) { id = 'anon_' + Math.random().toString(36).slice(2, 8); localStorage.setItem(ANON_KEY, id) }
    return id
  } catch { return 'anon_unknown' }
}

/** Stabile Kennung des aktuellen Nutzers (angemeldet oder anonym). */
export function nutzerId(benutzer) {
  return benutzer ? ('user:' + benutzer) : anonId()
}

/** Lesbarer Name aus einer Kennung (für die Anzeige). */
export function nutzerLabel(uid) {
  if (!uid) return '—'
  if (uid.startsWith('user:')) return uid.slice(5)
  return 'Gast ' + uid.replace(/^anon_/, '')
}
