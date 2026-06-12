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
})();
