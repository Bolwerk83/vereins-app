/* =====================================================================
   bolwerk24 — gemeinsamer Supabase-Client
   ---------------------------------------------------------------------
   Stellt window.bwSupabase() bereit. Gibt den (einmalig erzeugten)
   Supabase-Client zurück – oder null, wenn nichts konfiguriert ist.
   Erfordert, dass vorher geladen wurden:
     1. die offizielle supabase-js Library (window.supabase)
     2. supabase-config.js (window.BW24_SUPABASE)
   ===================================================================== */
(function () {
  "use strict";
  let client = null;
  window.bwSupabase = function () {
    const cfg = window.BW24_SUPABASE || {};
    if (!cfg.url || !cfg.anonKey) return null;            // noch nicht konfiguriert
    if (!window.supabase || !window.supabase.createClient) return null; // Library fehlt
    if (!client) {
      client = window.supabase.createClient(cfg.url, cfg.anonKey, {
        auth: { persistSession: true, autoRefreshToken: true },
      });
    }
    return client;
  };
  // praktisch: ist Supabase überhaupt eingerichtet?
  window.bwSupabaseReady = function () {
    const cfg = window.BW24_SUPABASE || {};
    return !!(cfg.url && cfg.anonKey);
  };

  // Öffentliche Inserts über die Edge Function `intake` (Rate-Limit/IP).
  //   kind: "event" | "lead" | "review"
  // Rückgabe: { handled, ok, status }
  //   handled=true  -> Backend hat entschieden (Insert ODER 429/400);
  //                    der Aufrufer soll NICHT zusätzlich direkt inserten.
  //   handled=false -> Function nicht erreichbar (404/5xx/Netzwerk);
  //                    der Aufrufer nutzt den Direkt-Insert-Fallback.
  window.bwIntake = async function (kind, payload) {
    const cfg = window.BW24_SUPABASE || {};
    if (!cfg.url || !cfg.anonKey) return { handled: false };
    try {
      const r = await fetch(cfg.url.replace(/\/$/, "") + "/functions/v1/intake", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "apikey": cfg.anonKey,
          "Authorization": "Bearer " + cfg.anonKey,
        },
        body: JSON.stringify(Object.assign({ kind: kind }, payload || {})),
      });
      return { handled: r.status !== 404 && r.status < 500, ok: r.ok, status: r.status };
    } catch {
      return { handled: false };
    }
  };
})();
