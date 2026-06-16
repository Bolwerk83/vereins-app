-- =====================================================================
-- CUTOVER: öffentliche Inserts nur noch über die Edge Function `intake`
-- =====================================================================
-- ACHTUNG – Reihenfolge beachten, sonst bricht die Live-Seite kurzzeitig:
--   1. Edge Functions `intake` (+ `james`) deployen:
--        supabase functions deploy intake --no-verify-jwt
--        supabase functions deploy james  --no-verify-jwt
--      und supabase/site.sql ausführen (legt rl_hit + site_rate an).
--   2. Das neue `site/` (main.js/analytics.js mit window.bwIntake) auf
--      Vercel deployen – ab dann läuft jeder Insert über `intake`,
--      mit Direkt-Insert nur noch als Übergangs-Fallback.
--   3. ERST DANN dieses Skript ausführen. Es entzieht anon/authenticated
--      das direkte INSERT-Recht; der einzige Schreibweg ist dann die
--      service_role der Edge Function (umgeht RLS).
--
-- Rückgängig machen: die `*_insert`-Policies aus supabase/site.sql
-- erneut ausführen (sie erlauben anon/authenticated wieder das INSERT).
-- =====================================================================

-- Tracking-Ereignisse
drop policy if exists site_events_insert on public.site_events;

-- Newsletter-Leads
drop policy if exists site_leads_insert on public.site_leads;

-- Bewertungen (Lesen bleibt öffentlich über site_reviews_read)
drop policy if exists site_reviews_insert on public.site_reviews;

-- Hinweis: service_role umgeht RLS und kann weiterhin schreiben (intake).
-- Die öffentliche Leseregel der Bewertungen (site_reviews_read) und die
-- Auswertungs-RPCs (site_review_summary, site_stats) bleiben unberührt.
