// =========================================================================
//  SERVER-CACHE — die KPI-/Stammdaten sind für ALLE Nutzer identisch
//  (Reporting, nicht nutzerspezifisch). Ohne Cache trifft jeder der z. B.
//  200 gleichzeitigen Clients die DB frisch. Mit kurzlebigem TTL-Cache
//  sinkt die DB-Last von „200 Abfragen" auf „1 pro TTL-Fenster".
//
//  Zwei Bausteine:
//   - memo(key, ttlMs, fn)  : serverseitiger In-Memory-Cache. Gleichzeitige
//     Anfragen auf denselben Schlüssel teilen sich EINE laufende Promise
//     (Single-Flight) — verhindert den „Thundering Herd" beim Cache-Miss.
//   - cacheControl(res, sek): setzt den HTTP-Header, damit Browser/CDN die
//     Antwort ebenfalls für kurze Zeit halten (zweite Verteidigungslinie).
// =========================================================================

const _store = new Map() // key -> { wert, bis }  (bis = Ablaufzeitpunkt in ms)
const _inflight = new Map() // key -> Promise (laufende Berechnung, Single-Flight)

/**
 * Liefert den gecachten Wert oder berechnet ihn via fn() und cacht ihn ttlMs lang.
 * Gleichzeitige Misses auf denselben Schlüssel laufen nur EINMAL.
 * @param {string} key     eindeutiger Cache-Schlüssel
 * @param {number} ttlMs   Lebensdauer in Millisekunden
 * @param {() => Promise<any>} fn  Berechnung bei Miss
 * @param {number} [now]   Zeitstempel (für Tests injizierbar)
 */
export async function memo(key, ttlMs, fn, now = Date.now()) {
  const hit = _store.get(key)
  if (hit && hit.bis > now) return hit.wert
  if (_inflight.has(key)) return _inflight.get(key) // Single-Flight: an laufende Promise andocken
  const p = (async () => {
    try {
      const wert = await fn()
      _store.set(key, { wert, bis: now + ttlMs })
      return wert
    } finally {
      _inflight.delete(key)
    }
  })()
  _inflight.set(key, p)
  return p
}

/** Setzt Cache-Control für öffentlich (für alle gleiche) Reporting-Antworten. */
export function cacheControl(res, sekunden) {
  res.set('Cache-Control', `public, max-age=${sekunden}`)
}

/** Cache leeren — gezielt (Präfix) oder komplett. Für Daten-Refresh/Tests. */
export function leereCache(praefix) {
  if (!praefix) { _store.clear(); return }
  for (const k of _store.keys()) if (k.startsWith(praefix)) _store.delete(k)
}

/** Diagnose: aktuelle Einträge (Anzahl + Schlüssel). */
export function cacheStatus(now = Date.now()) {
  const eintraege = [...(_store.entries())].map(([k, v]) => ({ key: k, gueltig: v.bis > now, restMs: Math.max(0, v.bis - now) }))
  return { groesse: _store.size, eintraege }
}
