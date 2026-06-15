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
  // "anon public"-Key: öffentlich & sicher im Browser – durch Row-Level-Security geschützt.
  anonKey: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBocGt5enVqcHZyc3lwcXFwdGx2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODA0MjA2MjAsImV4cCI6MjA5NTk5NjYyMH0.t7wCh6Juzkn9cyshpy78ZfJ_G9ji8pko_v1hoOzui8w",
};
