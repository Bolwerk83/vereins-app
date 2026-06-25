// =========================================================================
//  BERICHT-ZUGRIFFS-LOG — protokolliert Aufrufe je Bericht für die Admin-
//  Statistik. Ein Nutzer zählt pro Tag nur EINMAL. Admins werden bewusst
//  NICHT gezählt (sonst verzerren Verwaltungs-Aufrufe die Statistik).
// =========================================================================
const KEY = 'er_bericht_log'
const heute = () => new Date().toISOString().slice(0, 10)
function lade() { try { return JSON.parse(localStorage.getItem(KEY) || '{}') } catch { return {} } }
function speichere(o) { localStorage.setItem(KEY, JSON.stringify(o)); return o }

/** Zugriff protokollieren. Admin & fehlende Kennung werden ignoriert;
 *  pro Tag und Nutzer wird nur einmal gezählt. */
export function protokolliereZugriff(berichtId, uid, admin = false) {
  if (admin || !berichtId || !uid) return
  const o = lade(); const e = o[berichtId] || { tage: {} }
  const set = new Set(e.tage[heute()] || []); set.add(uid); e.tage[heute()] = [...set]
  o[berichtId] = e; return speichere(o)
}

/** Auswertung je Bericht: eindeutige Personen, Aufrufe (User-Tage) gesamt,
 *  heute, und der Verlauf je Tag. */
export function logVon(berichtId) {
  const e = lade()[berichtId] || { tage: {} }
  const alle = new Set(); let gesamt = 0; const proTag = []
  for (const [d, uids] of Object.entries(e.tage)) { uids.forEach((u) => alle.add(u)); gesamt += uids.length; proTag.push({ datum: d, anzahl: uids.length }) }
  proTag.sort((a, b) => (a.datum < b.datum ? 1 : -1))
  return { personen: alle.size, aufrufeGesamt: gesamt, heute: (e.tage[heute()] || []).length, proTag }
}
export function setzeZurueck() { localStorage.removeItem(KEY) }
