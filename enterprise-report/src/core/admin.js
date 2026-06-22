// =========================================================================
//  ADMIN / BRANDING — vom Admin verwalteter Bereich. Hier wird das Logo
//  hinterlegt (jederzeit tauschbar) und ein Theme/Motto gewählt
//  (z. B. Black Week, Weihnachten, Ferien). Persistenz via localStorage;
//  applyBranding() setzt die CSS-Variablen live für die ganze App.
// =========================================================================

const KEY = 'er_admin_branding'

// Mottos/Themes: setzen die Akzentfarbe und einen kleinen Banner-Hinweis.
export const THEMES = [
  { id: 'standard',   name: 'Standard',     accent: '#2563eb', accent2: '#1e40af', emoji: '🟦', banner: null },
  { id: 'blackweek',  name: 'Black Week',   accent: '#111827', accent2: '#374151', emoji: '🖤', banner: 'Black Week – Aktionspreise aktiv' },
  { id: 'weihnachten', name: 'Weihnachten', accent: '#b91c1c', accent2: '#166534', emoji: '🎄', banner: 'Weihnachtsaktion läuft' },
  { id: 'ferien',     name: 'Ferien/Sommer', accent: '#0891b2', accent2: '#0e7490', emoji: '🏖️', banner: 'Ferien-Special aktiv' },
  { id: 'fruehling',  name: 'Frühling',     accent: '#16a34a', accent2: '#15803d', emoji: '🌱', banner: 'Frühjahrsaktion läuft' }
]

// Eigene (Admin-)Designs zusätzlich zu den Vorlagen, in localStorage.
const CKEY = 'er_custom_themes'
export function ladeCustomThemes() {
  try { const r = JSON.parse(localStorage.getItem(CKEY) || '[]'); return Array.isArray(r) ? r : [] } catch { return [] }
}
/** Alle wählbaren Designs: Vorlagen + eigene. */
export function alleThemes() { return [...THEMES, ...ladeCustomThemes()] }

/** Eigenes Design anlegen (Name + Farben) und zurückgeben. */
export function addCustomTheme({ name, accent, accent2, banner = null } = {}) {
  const list = ladeCustomThemes()
  const t = { id: 'custom_' + Date.now().toString(36), name: (name || 'Eigenes Design').trim(), accent: accent || '#2563eb', accent2: accent2 || accent || '#1e40af', emoji: '🎨', banner: banner || null, custom: true }
  list.push(t)
  localStorage.setItem(CKEY, JSON.stringify(list))
  return t
}

/** Eigenes Design ändern (Teil-Update). */
export function aktualisiereCustomTheme(id, patch) {
  const list = ladeCustomThemes().map((t) => (t.id === id ? { ...t, ...patch } : t))
  localStorage.setItem(CKEY, JSON.stringify(list))
  return list
}

export function loescheCustomTheme(id) {
  const list = ladeCustomThemes().filter((t) => t.id !== id)
  localStorage.setItem(CKEY, JSON.stringify(list))
  return list
}

export const themeById = (id) => alleThemes().find((t) => t.id === id) || THEMES[0]

const DEFAULT = { appName: 'Enterprise Report', logoDataUrl: null, themeId: 'standard' }

/** Branding laden (mit Defaults zusammengeführt, robust gegen kaputtes JSON). */
export function ladeBranding() {
  try {
    const raw = localStorage.getItem(KEY)
    if (!raw) return { ...DEFAULT }
    const obj = JSON.parse(raw)
    return { ...DEFAULT, ...obj }
  } catch {
    return { ...DEFAULT }
  }
}

/** Branding speichern (Teil-Update) und das vollständige Objekt zurückgeben. */
export function speichereBranding(patch) {
  const next = { ...ladeBranding(), ...patch }
  localStorage.setItem(KEY, JSON.stringify(next))
  return next
}

/**
 * CSS-Variablen + Dokumenttitel aus dem Branding setzen.
 * Ohne DOM (z. B. in Tests) wird nur still nichts getan.
 */
export function applyBranding(branding = ladeBranding()) {
  const theme = themeById(branding.themeId)
  if (typeof document !== 'undefined' && document.documentElement) {
    const root = document.documentElement.style
    root.setProperty('--accent', theme.accent)
    root.setProperty('--accent-soft', theme.accent + '1a') // ~10 % Deckkraft
    if (theme.accent2) root.setProperty('--accent2', theme.accent2)
    if (document.title !== undefined) document.title = branding.appName || DEFAULT.appName
  }
  return theme
}
