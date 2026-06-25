// =========================================================================
//  FAVORITEN — angepinnte Berichte/Ansichten für den schnellen Zugriff im
//  Arbeitsalltag. Reihenfolge = Pin-Reihenfolge. Persistenz in localStorage.
//  Pro Benutzer getrennt (er_favoriten:<name>); ohne Login ein gemeinsamer
//  Gast-Schlüssel (er_favoriten) — abwärtskompatibel zur früheren Variante.
// =========================================================================
const BASIS = 'er_favoriten'
const key = (user) => (user ? `${BASIS}:${user}` : BASIS)

export function ladeFavoriten(user) {
  try { const a = JSON.parse(localStorage.getItem(key(user)) || '[]'); return Array.isArray(a) ? a : [] } catch { return [] }
}
function speichere(a, user) { try { localStorage.setItem(key(user), JSON.stringify(a)) } catch {} return a }

export const istFavorit = (view, user) => ladeFavoriten(user).includes(view)

/** Favorit umschalten; gibt die neue Liste zurück. */
export function toggleFavorit(view, user) {
  if (!view) return ladeFavoriten(user)
  const a = ladeFavoriten(user)
  return speichere(a.includes(view) ? a.filter((v) => v !== view) : [...a, view], user)
}

export function entferneFavorit(view, user) { return speichere(ladeFavoriten(user).filter((v) => v !== view), user) }

/** Favorit gezielt hinzufügen (ans Ende), Duplikate vermeiden. */
export function fuegeFavoritHinzu(view, user) {
  if (!view) return ladeFavoriten(user)
  const a = ladeFavoriten(user)
  return a.includes(view) ? a : speichere([...a, view], user)
}
