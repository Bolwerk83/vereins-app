// Lokale Datenhaltung ohne Datenbank: alles liegt in diesem Browser
// (localStorage). Merkzeug-Inhalte sind darin nur als Chiffretext enthalten.
// Die Supabase-Anbindung (supabase/schema.sql) ist Stufe 2 und ersetzt
// später nur diese Datei.

const KEY = 'eselsohr-v1'
const OLD_KEY = 'nestwerk-v1' // App hieß früher Nestwerk – vorhandene Daten werden übernommen

let memoryFallback = null // falls localStorage nicht verfügbar ist (z. B. Sandbox)

export function loadState() {
  try {
    const raw = localStorage.getItem(KEY) || localStorage.getItem(OLD_KEY)
    if (raw) return JSON.parse(raw)
  } catch { /* localStorage gesperrt */ }
  return memoryFallback
}

export function saveState(state) {
  memoryFallback = state
  try {
    localStorage.setItem(KEY, JSON.stringify(state))
  } catch { /* localStorage gesperrt – Daten leben nur in dieser Sitzung */ }
}

export function storageWorks() {
  try {
    localStorage.setItem(KEY + '-test', '1')
    localStorage.removeItem(KEY + '-test')
    return true
  } catch {
    return false
  }
}
