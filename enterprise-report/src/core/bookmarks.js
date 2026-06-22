// =========================================================================
//  BOOKMARKS — gespeicherte Spalten-Ansichten je Detailliste. Damit lässt
//  sich der Fokus auf wichtige Spalten legen und Spezialspalten nur bei
//  Bedarf einblenden. Persistenz in localStorage (er_bookmarks), je Listen-ID.
// =========================================================================
const KEY = 'er_bookmarks'

function lade() { try { const o = JSON.parse(localStorage.getItem(KEY) || '{}'); return o && typeof o === 'object' ? o : {} } catch { return {} } }
function speichere(o) { try { localStorage.setItem(KEY, JSON.stringify(o)) } catch {} return o }

/** Benutzer-Bookmarks einer Liste laden. */
export function ladeBookmarks(listId) { return lade()[listId] || [] }

/** Aktuelle Spaltenauswahl als benannten Bookmark speichern. */
export function addBookmark(listId, name, sichtbar) {
  const o = lade()
  const bm = { id: 'bm_' + Date.now().toString(36), name: (name || 'Ansicht').trim(), sichtbar: [...sichtbar] }
  o[listId] = [...(o[listId] || []), bm]
  speichere(o)
  return o[listId]
}

export function loescheBookmark(listId, id) {
  const o = lade()
  o[listId] = (o[listId] || []).filter((b) => b.id !== id)
  speichere(o)
  return o[listId]
}

// --- Zuletzt genutzte Spaltenansicht je Liste merken ---------------------
const LETZTE_KEY = 'er_bookmarks_last'
function ladeAlleLetzte() { try { const o = JSON.parse(localStorage.getItem(LETZTE_KEY) || '{}'); return o && typeof o === 'object' ? o : {} } catch { return {} } }

/** Zuletzt genutzte Spaltenauswahl einer Liste (oder null). */
export function ladeLetzte(listId) { const a = ladeAlleLetzte()[listId]; return Array.isArray(a) ? a : null }

/** Aktuelle Spaltenauswahl als „zuletzt genutzt" merken. */
export function merkeLetzte(listId, sichtbar) {
  const o = ladeAlleLetzte()
  o[listId] = [...sichtbar]
  try { localStorage.setItem(LETZTE_KEY, JSON.stringify(o)) } catch {}
  return o[listId]
}
