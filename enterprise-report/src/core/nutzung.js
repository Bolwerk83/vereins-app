// =========================================================================
//  NUTZUNGS-STATISTIK — zählt, wie oft welche Berichte/Ansichten geöffnet
//  werden (Klick-Tracking). Lokal in localStorage; nur der Admin wertet sie
//  im Admin-Bereich aus. Keine personenbezogenen Daten — reine Aufrufzähler.
// =========================================================================

const KEY = 'er_nutzung'
const heute = () => new Date().toISOString().slice(0, 10)

function lade() {
  try { const o = JSON.parse(localStorage.getItem(KEY) || '{}'); return o && typeof o === 'object' ? o : {} } catch { return {} }
}
function speichere(o) { try { localStorage.setItem(KEY, JSON.stringify(o)) } catch {} return o }

/** Eine Bericht-/Ansichts-Öffnung zählen (optional mit Nutzer-Kennung). */
export function trackOeffnung(id, uid = null) {
  if (!id) return
  const d = lade()
  const e = d[id] || { count: 0, last: null, tage: {}, nutzer: {} }
  if (!e.nutzer) e.nutzer = {}
  const t = heute()
  e.count += 1
  e.last = new Date().toISOString()
  e.tage[t] = (e.tage[t] || 0) + 1
  if (uid) { const set = new Set(e.nutzer[t] || []); set.add(uid); e.nutzer[t] = [...set] }
  // Tagesverlauf (Aufrufe + Nutzer) auf 60 Tage begrenzen.
  const tage = Object.keys(e.tage).sort()
  while (tage.length > 60) { const alt = tage.shift(); delete e.tage[alt]; delete e.nutzer[alt] }
  d[id] = e
  speichere(d)
  return d
}

function letzteTage(n) {
  const out = []
  const base = new Date()
  for (let i = 0; i < n; i++) { const x = new Date(base); x.setDate(base.getDate() - i); out.push(x.toISOString().slice(0, 10)) }
  return out
}

/** Auswertung: Ranking + Summen (gesamt, heute, letzte 7 Tage). */
export function auswertung() {
  const d = lade()
  const t = heute()
  const w = letzteTage(7)
  const rows = Object.entries(d).map(([id, e]) => ({
    id, count: e.count || 0, last: e.last || null,
    heute: e.tage?.[t] || 0,
    woche: w.reduce((n, tag) => n + (e.tage?.[tag] || 0), 0),
    userHeute: (e.nutzer?.[t] || []).length,
    userWoche: new Set(w.flatMap((tag) => e.nutzer?.[tag] || [])).size
  })).sort((a, b) => b.count - a.count)
  // Eindeutige Nutzer heute über ALLE Berichte hinweg.
  const userHeuteGesamt = new Set(Object.values(d).flatMap((e) => e.nutzer?.[t] || [])).size
  return {
    rows,
    gesamt: rows.reduce((n, r) => n + r.count, 0),
    heuteGesamt: rows.reduce((n, r) => n + r.heute, 0),
    wocheGesamt: rows.reduce((n, r) => n + r.woche, 0),
    userHeuteGesamt,
    aktiveBerichte: rows.length
  }
}

/** Tagesverlauf (letzte n Tage) gesamt über alle Berichte — für ein Mini-Chart. */
export function verlauf(n = 14) {
  const d = lade()
  return letzteTage(n).reverse().map((tag) => ({
    tag, count: Object.values(d).reduce((s, e) => s + (e.tage?.[tag] || 0), 0)
  }))
}

export function reset() { try { localStorage.removeItem(KEY) } catch {} }

/**
 * Aufräum-Sicht: welche der bekannten Berichte wurden NIE geöffnet?
 * @param alleIds  Liste aller verfügbaren Ansichts-IDs (z. B. aus NAV_ZIELE)
 * @returns { nie:[ids], kaum:[{id,count}] }  kaum = 1–2 Aufrufe gesamt
 */
export function aufraeumen(alleIds = []) {
  const d = lade()
  const nie = alleIds.filter((id) => !d[id] || !d[id].count)
  const kaum = Object.entries(d)
    .filter(([, e]) => (e.count || 0) > 0 && (e.count || 0) <= 2)
    .map(([id, e]) => ({ id, count: e.count }))
    .sort((a, b) => a.count - b.count)
  return { nie, kaum }
}

/** Auswertung als CSV (für Export). Spalten: Bericht-ID, Aufrufe, Heute, 7 Tage, Zuletzt. */
export function alsCsv(labelFn = (id) => id) {
  const a = auswertung()
  const head = ['Bericht', 'ID', 'Aufrufe', 'Aufrufe heute', 'Aufrufe 7 Tage', 'User heute', 'User 7 Tage', 'Zuletzt']
  const esc = (s) => { const v = String(s ?? ''); return /[";\n]/.test(v) ? '"' + v.replace(/"/g, '""') + '"' : v }
  const zeilen = a.rows.map((r) => [labelFn(r.id), r.id, r.count, r.heute, r.woche, r.userHeute, r.userWoche, r.last || ''].map(esc).join(';'))
  return [head.join(';'), ...zeilen].join('\n')
}
