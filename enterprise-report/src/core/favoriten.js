// =========================================================================
//  FAVORITEN — angepinnte Berichte/Ansichten für den schnellen Zugriff im
//  Arbeitsalltag. Reihenfolge = Pin-Reihenfolge. Persistenz in localStorage.
// =========================================================================
const KEY = 'er_favoriten'

export function ladeFavoriten() {
  try { const a = JSON.parse(localStorage.getItem(KEY) || '[]'); return Array.isArray(a) ? a : [] } catch { return [] }
}
function speichere(a) { try { localStorage.setItem(KEY, JSON.stringify(a)) } catch {} return a }

export const istFavorit = (view) => ladeFavoriten().includes(view)

/** Favorit umschalten; gibt die neue Liste zurück. */
export function toggleFavorit(view) {
  if (!view) return ladeFavoriten()
  const a = ladeFavoriten()
  return speichere(a.includes(view) ? a.filter((v) => v !== view) : [...a, view])
}

export function entferneFavorit(view) { return speichere(ladeFavoriten().filter((v) => v !== view)) }
