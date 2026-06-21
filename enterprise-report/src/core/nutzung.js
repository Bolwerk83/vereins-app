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

/** Eine Bericht-/Ansichts-Öffnung zählen. */
export function trackOeffnung(id) {
  if (!id) return
  const d = lade()
  const e = d[id] || { count: 0, last: null, tage: {} }
  const t = heute()
  e.count += 1
  e.last = new Date().toISOString()
  e.tage[t] = (e.tage[t] || 0) + 1
  // Tagesverlauf auf 60 Tage begrenzen.
  const tage = Object.keys(e.tage).sort()
  while (tage.length > 60) delete e.tage[tage.shift()]
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
    woche: w.reduce((n, tag) => n + (e.tage?.[tag] || 0), 0)
  })).sort((a, b) => b.count - a.count)
  return {
    rows,
    gesamt: rows.reduce((n, r) => n + r.count, 0),
    heuteGesamt: rows.reduce((n, r) => n + r.heute, 0),
    wocheGesamt: rows.reduce((n, r) => n + r.woche, 0),
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
