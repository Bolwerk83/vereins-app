// =========================================================================
//  BEMERKUNGEN & AUFGABEN — Notizen je Datensatz, optional einer Person
//  zugewiesen. Offene zugewiesene Bemerkungen erscheinen als Aufgabe auf der
//  Aufgabenliste der Person. Persistenz in localStorage (er_bemerkungen).
// =========================================================================
const KEY = 'er_bemerkungen'

// Team (Demo). Später aus dem Mitarbeiter-/Identitätsmodul speisbar.
export const PERSONEN = ['Felix Metternich', 'Janne Ditters', 'Sandra Bohl', 'Tarek Aydın', 'Du']

function lade() { try { const o = JSON.parse(localStorage.getItem(KEY) || '{}'); return o && typeof o === 'object' ? o : {} } catch { return {} } }
function speichere(o) { try { localStorage.setItem(KEY, JSON.stringify(o)) } catch {} return o }
const schluessel = (typ, id) => `${typ}::${id}`

/** Bemerkungen eines Datensatzes (neueste zuerst). */
export function ladeBemerkungen(typ, id) {
  const arr = lade()[schluessel(typ, id)] || []
  return [...arr].sort((a, b) => b.erstellt - a.erstellt)
}

export function addBemerkung(typ, id, { text, zuweisung = '', autor = 'Du' }) {
  if (!text || !text.trim()) return ladeBemerkungen(typ, id)
  const o = lade(); const k = schluessel(typ, id)
  o[k] = [...(o[k] || []), { nid: 'n_' + Date.now().toString(36), text: text.trim(), zuweisung, autor, erledigt: false, erstellt: Date.now() }]
  speichere(o)
  return ladeBemerkungen(typ, id)
}

export function toggleErledigt(typ, id, nid) {
  const o = lade(); const k = schluessel(typ, id)
  o[k] = (o[k] || []).map((n) => (n.nid === nid ? { ...n, erledigt: !n.erledigt } : n))
  speichere(o)
  return ladeBemerkungen(typ, id)
}

export function loescheBemerkung(typ, id, nid) {
  const o = lade(); const k = schluessel(typ, id)
  o[k] = (o[k] || []).filter((n) => n.nid !== nid)
  speichere(o)
  return ladeBemerkungen(typ, id)
}

/** Alle offenen, zugewiesenen Bemerkungen als Aufgaben (optional je Person). */
export function aufgaben(person = null) {
  const o = lade(); const out = []
  for (const k of Object.keys(o)) {
    const [typ, id] = k.split('::')
    for (const n of o[k]) {
      if (!n.erledigt && n.zuweisung && (!person || n.zuweisung === person)) out.push({ typ, id, ...n })
    }
  }
  return out.sort((a, b) => b.erstellt - a.erstellt)
}

/** Aufgabenanzahl je Person (für Badges). */
export function aufgabenZaehler() {
  const z = {}
  for (const a of aufgaben()) z[a.zuweisung] = (z[a.zuweisung] || 0) + 1
  return z
}
