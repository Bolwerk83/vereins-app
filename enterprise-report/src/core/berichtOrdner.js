// =========================================================================
//  BENUTZER-BERICHTSORDNER — jeder Nutzer hat einen eigenen Ordner mit selbst
//  erstellten Berichten. Berichte einzeln ODER der ganze Ordner lassen sich
//  mit anderen teilen. Vor dem Neu-Erstellen werden ähnliche vorhandene
//  Berichte vorgeschlagen (Duplikat-Vermeidung). Persistenz im LocalStorage.
// =========================================================================
const KEY = 'er_benutzerberichte'
// Struktur: { [uid]: { ordnerGeteiltMit: [uid], berichte: [ {id,titel,items,summary,erstellt,geteiltMit:[uid]} ] } }
function lade() { try { return JSON.parse(localStorage.getItem(KEY) || '{}') } catch { return {} } }
function speichere(o) { localStorage.setItem(KEY, JSON.stringify(o)); return o }
function ordnerVon(o, uid) { if (!o[uid]) o[uid] = { ordnerGeteiltMit: [], berichte: [] }; return o[uid] }

export function eigeneBerichte(uid) { return (lade()[uid]?.berichte) || [] }

/** Alle für einen Nutzer sichtbaren Berichte: eigene + einzeln geteilte +
 *  Berichte aus geteilten Ordnern. */
export function sichtbareBerichte(uid) {
  const o = lade(); const out = []
  for (const [besitzer, ord] of Object.entries(o)) {
    const ordnerGeteilt = (ord.ordnerGeteiltMit || []).includes(uid)
    for (const b of (ord.berichte || [])) {
      const eigen = besitzer === uid
      const geteilt = (b.geteiltMit || []).includes(uid) || ordnerGeteilt
      if (eigen || geteilt) out.push({ ...b, besitzer, eigen, quelle: eigen ? 'eigen' : ordnerGeteilt ? 'ordner' : 'bericht' })
    }
  }
  return out
}

export function speichereBericht(uid, { titel, items, summary, privat = false }) {
  const o = lade(); const ord = ordnerVon(o, uid)
  const b = { id: 'b-' + Date.now().toString(36) + Math.random().toString(36).slice(2, 5), titel, items, summary, privat, erstellt: new Date().toISOString().slice(0, 10), geteiltMit: [] }
  ord.berichte.unshift(b); speichere(o); return b
}
export function togglePrivat(uid, id) {
  const o = lade(); const ord = ordnerVon(o, uid)
  const b = ord.berichte.find((x) => x.id === id); if (b) b.privat = !b.privat
  return speichere(o)
}
/** Entdecken: von ANDEREN angelegte, nicht private Berichte (Community).
 *  Berechtigungen (RBAC/OLS) greifen zusätzlich beim Öffnen serverseitig. */
export function entdeckbareBerichte(uid) {
  const o = lade(); const out = []
  for (const [besitzer, ord] of Object.entries(o)) {
    if (besitzer === uid) continue
    for (const b of (ord.berichte || [])) {
      const schonGeteilt = (b.geteiltMit || []).includes(uid) || (ord.ordnerGeteiltMit || []).includes(uid)
      if (!b.privat && !schonGeteilt) out.push({ ...b, besitzer })
    }
  }
  return out.sort((a, b) => (a.erstellt < b.erstellt ? 1 : -1))
}
export function loescheBericht(uid, id) {
  const o = lade(); const ord = ordnerVon(o, uid); ord.berichte = ord.berichte.filter((b) => b.id !== id); return speichere(o)
}
export function teileBericht(uid, id, mitUid) {
  const o = lade(); const ord = ordnerVon(o, uid)
  const b = ord.berichte.find((x) => x.id === id); if (!b) return o
  const set = new Set(b.geteiltMit || []); set.add(mitUid); b.geteiltMit = [...set]; return speichere(o)
}
export function teileOrdner(uid, mitUid) {
  const o = lade(); const ord = ordnerVon(o, uid)
  const set = new Set(ord.ordnerGeteiltMit || []); set.add(mitUid); ord.ordnerGeteiltMit = [...set]; return speichere(o)
}
export const ordnerGeteiltMit = (uid) => (lade()[uid]?.ordnerGeteiltMit) || []

// --- Globale Berichte (vom Admin freigegeben, für alle sichtbar) -----------
const KEY_GLOBAL = 'er_globale_berichte'
export function ladeGlobale() { try { return JSON.parse(localStorage.getItem(KEY_GLOBAL) || '[]') } catch { return [] } }
/** Admin promotet einen Bericht zum globalen Bericht (für alle Nutzer). */
export function alsGlobalSpeichern({ titel, items, summary, vonUid }) {
  const arr = ladeGlobale()
  if (arr.some((g) => g.titel === titel && JSON.stringify(g.items) === JSON.stringify(items))) return arr // Duplikat
  arr.unshift({ id: 'g-' + Date.now().toString(36) + Math.random().toString(36).slice(2, 5), titel, items, summary, von: vonUid || null, erstellt: new Date().toISOString().slice(0, 10) })
  localStorage.setItem(KEY_GLOBAL, JSON.stringify(arr)); return arr
}
export function loescheGlobal(id) { const arr = ladeGlobale().filter((g) => g.id !== id); localStorage.setItem(KEY_GLOBAL, JSON.stringify(arr)); return arr }

/** Jaccard-Ähnlichkeit zweier Item-Mengen. */
function aehnlichkeit(a, b) {
  const sa = new Set(a), sb = new Set(b)
  const schnitt = [...sa].filter((x) => sb.has(x)).length
  const union = new Set([...sa, ...sb]).size || 1
  return schnitt / union
}
/** Vorhandene (sichtbare) Berichte, die zur aktuellen Auswahl passen —
 *  zur Vermeidung von Doppelarbeit. */
export function aehnlicheBerichte(items, uid, schwelle = 0.3) {
  const global = ladeGlobale().map((g) => ({ ...g, besitzer: null, eigen: false, quelle: 'global' }))
  return [...sichtbareBerichte(uid), ...global]
    .map((b) => ({ ...b, score: aehnlichkeit(items, b.items || []) }))
    .filter((b) => b.score >= schwelle)
    .sort((x, y) => y.score - x.score)
}
