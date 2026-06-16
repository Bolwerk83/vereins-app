-- =====================================================================
-- bolwerk24 — zentrales Backend (Hub + Controlling)
-- ---------------------------------------------------------------------
-- Stellt die zentrale Konfiguration (site_config) und die zentralen
-- Rollen (site_roles: superadmin / power) bereit. Wird von beiden
-- Frontends genutzt:
--   • bolwerk24-Hub  (site/)        -> Affiliate-Schalter, Partner
--   • Controlling    (controlling/) -> kann dieselben Rollen nutzen
--
-- Im Supabase SQL-Editor ausführen (oder per CLI als Migration).
-- Idempotent: kann gefahrlos erneut ausgeführt werden.
-- =====================================================================

-- ---------- Zentrale Konfiguration -----------------------------------
create table if not exists public.site_config (
  key        text primary key,
  value      jsonb not null default '{}'::jsonb,
  updated_at timestamptz not null default now()
);
alter table public.site_config enable row level security;

-- ---------- Zentrale Rollen (per E-Mail) -----------------------------
create table if not exists public.site_roles (
  email      text primary key,
  role       text not null check (role in ('superadmin','power')),
  created_at timestamptz not null default now()
);
alter table public.site_roles enable row level security;

-- ---------- Helfer ----------------------------------------------------
-- E-Mail des eingeloggten Nutzers aus dem JWT (klein geschrieben).
create or replace function public.jwt_email()
returns text language sql stable set search_path = public, pg_temp as $$
  select lower(coalesce(nullif(auth.jwt() ->> 'email',''), ''))
$$;

-- Ist der eingeloggte Nutzer Superadmin?  (vom Hub-Frontend erwartet)
create or replace function public.is_site_admin()
returns boolean language sql stable security definer set search_path = public as $$
  select exists (
    select 1 from public.site_roles r
    where r.email = public.jwt_email() and r.role = 'superadmin'
  )
$$;

-- Ist der eingeloggte Nutzer Power User (oder Superadmin)?
create or replace function public.is_site_power()
returns boolean language sql stable security definer set search_path = public as $$
  select exists (
    select 1 from public.site_roles r
    where r.email = public.jwt_email() and r.role in ('superadmin','power')
  )
$$;

-- Bequeme Rollenabfrage fürs Power-User-Frontend.
create or replace function public.my_site_role()
returns text language sql stable security definer set search_path = public as $$
  select coalesce(
    (select r.role from public.site_roles r where r.email = public.jwt_email() limit 1),
    'none'
  )
$$;

grant execute on function public.is_site_admin() to anon, authenticated;
grant execute on function public.is_site_power() to anon, authenticated;
grant execute on function public.my_site_role() to anon, authenticated;

-- ---------- RLS: site_config -----------------------------------------
-- Lesen für alle (Frontend braucht Affiliate-/Feature-Flags),
-- Schreiben ausschliesslich Superadmin.
drop policy if exists site_config_read  on public.site_config;
create policy site_config_read on public.site_config
  for select using (true);

drop policy if exists site_config_write on public.site_config;
create policy site_config_write on public.site_config
  for all to authenticated using (public.is_site_admin()) with check (public.is_site_admin());

-- ---------- RLS: site_roles ------------------------------------------
-- Nur eingeloggte Nutzer: eigene Zeile + Superadmin lesen; nur Superadmin ändern.
drop policy if exists site_roles_read  on public.site_roles;
create policy site_roles_read on public.site_roles
  for select to authenticated using (email = public.jwt_email() or public.is_site_admin());

drop policy if exists site_roles_write on public.site_roles;
create policy site_roles_write on public.site_roles
  for all to authenticated using (public.is_site_admin()) with check (public.is_site_admin());

-- ---------- Seed ------------------------------------------------------
-- Superadmin festlegen (anpassen, falls weitere gewünscht).
insert into public.site_roles(email, role) values
  ('bolwerk@outlook.de', 'superadmin')
on conflict (email) do update set role = excluded.role;

-- Affiliate-Feature standardmaessig AUS (Schalter im SuperAdmin).
-- value-Schema fuer key 'affiliate':  { "enabled": bool, "partners": [ ... ] }
insert into public.site_config(key, value) values
  ('affiliate', jsonb_build_object('enabled', false, 'partners', '[]'::jsonb))
on conflict (key) do nothing;

-- =====================================================================
-- Hub-Backend: Tracking, Newsletter-Leads, Bewertungen
-- (macht die übrigen SuperAdmin-Tabs Statistik/Newsletter/Bewertungen
--  sowie die Sterne/Kommentare auf der Startseite funktionsfähig)
-- =====================================================================

-- ---------- Anonymes First-Party-Tracking ---------------------------
create table if not exists public.site_events (
  id         bigint generated always as identity primary key,
  type       text not null,
  session_id text,
  path       text,
  device     text,
  referrer   text,
  app_id     text,
  created_at timestamptz not null default now()
);
alter table public.site_events enable row level security;
create index if not exists site_events_created_idx on public.site_events(created_at);
create index if not exists site_events_type_idx    on public.site_events(type);

-- Jeder darf Ereignisse schreiben; direktes Lesen ist gesperrt
-- (Auswertung ausschliesslich ueber die RPC site_stats).
drop policy if exists site_events_insert on public.site_events;
create policy site_events_insert on public.site_events
  for insert to anon, authenticated with check (true);

-- ---------- Newsletter-Leads -----------------------------------------
create table if not exists public.site_leads (
  id         bigint generated always as identity primary key,
  email      text not null,
  app        text,
  source     text,
  created_at timestamptz not null default now()
);
alter table public.site_leads enable row level security;

drop policy if exists site_leads_insert on public.site_leads;
create policy site_leads_insert on public.site_leads
  for insert to anon, authenticated with check (true);

drop policy if exists site_leads_admin on public.site_leads;
create policy site_leads_admin on public.site_leads
  for all to authenticated using (public.is_site_admin()) with check (public.is_site_admin());

-- ---------- Bewertungen ----------------------------------------------
create table if not exists public.site_reviews (
  id         bigint generated always as identity primary key,
  app_id     text not null,
  rating     int check (rating between 1 and 5),
  name       text,
  comment    text,
  session_id text,
  created_at timestamptz not null default now()
);
alter table public.site_reviews enable row level security;
create index if not exists site_reviews_app_idx on public.site_reviews(app_id);

-- Besucher duerfen bewerten; Lesen ist oeffentlich (Sterne/Kommentare);
-- Loeschen nur Superadmin.
drop policy if exists site_reviews_insert on public.site_reviews;
create policy site_reviews_insert on public.site_reviews
  for insert to anon, authenticated
  with check (rating is null or rating between 1 and 5);

drop policy if exists site_reviews_read on public.site_reviews;
create policy site_reviews_read on public.site_reviews
  for select using (true);

drop policy if exists site_reviews_admin on public.site_reviews;
create policy site_reviews_admin on public.site_reviews
  for all to authenticated using (public.is_site_admin()) with check (public.is_site_admin());

-- ---------- Auswertung: Bewertungs-Schnitt (oeffentlich) -------------
create or replace function public.site_review_summary()
returns table(app_id text, avg numeric, count bigint)
language sql stable security definer set search_path = public, pg_temp as $$
  select app_id, round(avg(rating)::numeric, 2) as avg, count(*)::bigint as count
  from public.site_reviews
  where rating is not null
  group by app_id
$$;
grant execute on function public.site_review_summary() to anon, authenticated;

-- ---------- Auswertung: Statistik (Superadmin + Power User) ----------
-- Aggregierte, anonyme Kennzahlen. Newsletter-Leads (PII) bleiben dem
-- Superadmin vorbehalten (eigene Tabelle/Policy).
create or replace function public.site_stats(days int default 30)
returns jsonb language plpgsql stable security definer set search_path = public, pg_temp as $$
declare res jsonb; d int := greatest(coalesce(days, 30), 1);
begin
  if not public.is_site_power() then
    raise exception 'not authorized';
  end if;
  with ev as (
    select * from public.site_events
    where created_at >= now() - make_interval(days => d)
  )
  select jsonb_build_object(
    'page_views', (select count(*) from ev where type = 'page_view'),
    'sessions',   (select count(distinct session_id) from ev where session_id is not null),
    'app_opens',  (select count(*) from ev where type = 'app_open'),
    'affiliate_clicks', (select count(*) from ev where type = 'affiliate_click'),
    'leads',      (select count(*) from public.site_leads
                    where created_at >= now() - make_interval(days => d)),
    'by_app', coalesce((
        select jsonb_agg(to_jsonb(x)) from (
          select app_id,
                 count(*) filter (where type = 'app_view') as views,
                 count(*) filter (where type = 'app_open') as opens
          from ev where app_id is not null
          group by app_id order by opens desc, views desc limit 50
        ) x), '[]'::jsonb),
    'by_affiliate', coalesce((
        select jsonb_agg(to_jsonb(x)) from (
          select app_id as partner, count(*) as clicks
          from ev where type = 'affiliate_click' and app_id is not null
          group by app_id order by clicks desc limit 50
        ) x), '[]'::jsonb),
    'top_referrers', coalesce((
        select jsonb_agg(to_jsonb(x)) from (
          select referrer, count(*) as n from ev
          where referrer is not null and referrer <> ''
          group by referrer order by n desc limit 20
        ) x), '[]'::jsonb),
    'by_day', coalesce((
        select jsonb_agg(to_jsonb(x)) from (
          select to_char(date_trunc('day', created_at), 'YYYY-MM-DD') as day,
                 count(*) filter (where type = 'page_view') as views,
                 count(distinct session_id) as sessions
          from ev group by 1 order by 1
        ) x), '[]'::jsonb)
  ) into res;
  return res;
end $$;
revoke execute on function public.site_stats(int) from anon;
grant execute on function public.site_stats(int) to authenticated;

-- ---------- Schutz öffentlicher Inserts (Defense-in-depth) -----------
-- Begrenzt Missbrauch über die öffentliche API (überlange Strings,
-- ungültige E-Mails). Idempotent.
alter table public.site_events  drop constraint if exists site_events_len;
alter table public.site_events  add  constraint site_events_len check (
  char_length(type) <= 40
  and char_length(coalesce(session_id,'')) <= 64
  and char_length(coalesce(path,''))      <= 200
  and char_length(coalesce(device,''))    <= 20
  and char_length(coalesce(referrer,''))  <= 200
  and char_length(coalesce(app_id,''))    <= 80
);

alter table public.site_leads  drop constraint if exists site_leads_chk;
alter table public.site_leads  add  constraint site_leads_chk check (
  char_length(email) <= 200
  and email ~ '^[^@[:space:]]+@[^@[:space:]]+\.[^@[:space:]]+$'
  and char_length(coalesce(app,''))    <= 80
  and char_length(coalesce(source,'')) <= 40
);

alter table public.site_reviews drop constraint if exists site_reviews_len;
alter table public.site_reviews add  constraint site_reviews_len check (
  char_length(coalesce(comment,'')) <= 2000
  and char_length(coalesce(name,'')) <= 120
  and char_length(app_id) <= 80
  and char_length(coalesce(session_id,'')) <= 64
);

-- =====================================================================
-- Server-seitiges Rate-Limit (für Edge Functions: james, intake)
-- =====================================================================
-- Zählt Treffer je "bucket" (z. B. 'lead:1.2.3.4') in einem gleitenden
-- Zeitfenster. Nur die Edge Functions (service_role) greifen darauf zu;
-- anon/authenticated haben KEINEN Zugriff (RLS ohne Policy).
create table if not exists public.site_rate (
  bucket       text primary key,
  hits         int  not null default 0,
  window_start timestamptz not null default now()
);
alter table public.site_rate enable row level security;  -- keine Policy => nur service_role

-- rl_hit: registriert einen Treffer und meldet, ob er noch erlaubt ist.
--   p_bucket  Schlüssel (z. B. 'james:<ip>')
--   p_max     erlaubte Treffer je Fenster
--   p_window  Fensterlänge in Sekunden
-- true = innerhalb des Limits, false = Limit überschritten.
create or replace function public.rl_hit(p_bucket text, p_max int, p_window int)
returns boolean
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare cur int;
begin
  insert into public.site_rate as r (bucket, hits, window_start)
       values (p_bucket, 1, now())
  on conflict (bucket) do update
     set hits = case when r.window_start < now() - make_interval(secs => p_window)
                     then 1 else r.hits + 1 end,
         window_start = case when r.window_start < now() - make_interval(secs => p_window)
                     then now() else r.window_start end
  returning hits into cur;
  return cur <= p_max;
end $$;
revoke all on function public.rl_hit(text, int, int) from public, anon, authenticated;
grant  execute on function public.rl_hit(text, int, int) to service_role;

-- Aufräumen alter Buckets (per Cron oder manuell aufrufbar).
create or replace function public.rl_gc()
returns void language sql security definer set search_path = public, pg_temp as $$
  delete from public.site_rate where window_start < now() - interval '2 days';
$$;
revoke all on function public.rl_gc() from public, anon, authenticated;
grant  execute on function public.rl_gc() to service_role;
