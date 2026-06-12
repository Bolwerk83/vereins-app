/* =====================================================================
   bolwerk24 — Supabase-Konfiguration
   ---------------------------------------------------------------------
   HIER trägst du EINMALIG deine Supabase-Zugangsdaten ein.
   Beides findest du im Supabase-Dashboard unter:
     Project Settings → API
       • "Project URL"   -> url
       • "anon public"   -> anonKey   (dieser Key ist ÖFFENTLICH & sicher
                                        im Browser – er ist durch die
                                        Row-Level-Security-Regeln geschützt.)

   Solange anonKey leer ist, läuft die Seite ganz normal weiter –
   nur ohne Statistik/Login (alles fällt sauber auf Demo/lokal zurück).
   ===================================================================== */
window.BW24_SUPABASE = {
  url: "https://phpkyzujpvrsypqqptlv.supabase.co",
  anonKey: "", // <-- hier den "anon public"-Key einfügen
};
