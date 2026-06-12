-- =====================================================================
--  bolwerk24 — SuperAdmin: Supabase-Setup
--  ---------------------------------------------------------------------
--  EINMALIG ausführen: Supabase-Dashboard -> SQL Editor -> einfügen -> "Run".
--  Danach (siehe docs/bolwerk24-superadmin-setup.md):
--    1) deine Admin-E-Mail unten eintragen,
--    2) den "anon public"-Key in site/assets/js/supabase-config.js setzen,
--    3) im Supabase-Auth einen Benutzer mit dieser E-Mail anlegen.
-- =====================================================================

-- 1) Statistik-Ereignisse -------------------------------------------------
create table if not exists public.site_events (
  id          bigint generated always as identity primary key,
  created_at  timestamptz not null default now(),
  type        text not null,            -- page_view | app_view | app_open | app_notify | affiliate_click
  app_id      text,
  path        text,
  referrer    text,
  session_id  text,
  device      text,
  meta        jsonb
);
create index if not exists site_events_created_idx on public.site_events (created_at);
create index if not exists site_events_type_idx    on public.site_events (type);
create index if not exists site_events_app_idx     on public.site_events (app_id);

-- 2) Newsletter-Anmeldungen ----------------------------------------------
create table if not exists public.site_leads (
  id          bigint generated always as identity primary key,
  created_at  timestamptz not null default now(),
  email       text not null,
  app         text,
  source      text
);

-- 3) Konfiguration (Affiliate-Partner, App-Katalog ...) ------------------
create table if not exists public.site_config (
  key         text primary key,
  value       jsonb not null default '{}'::jsonb,
  updated_at  timestamptz not null default now()
);

-- 4) Admin-Allowlist ------------------------------------------------------
create table if not exists public.site_admins (
  email       text primary key,
  created_at  timestamptz not null default now()
);

-- >>> HIER deine Admin-E-Mail eintragen (Kleinschreibung egal) <<<
insert into public.site_admins (email) values ('bolwerk@outlook.de')
  on conflict (email) do nothing;

-- Hilfsfunktion: ist der aktuell eingeloggte Nutzer Admin? ---------------
create or replace function public.is_site_admin()
returns boolean
language sql
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.site_admins
    where lower(email) = lower(coalesce(auth.jwt() ->> 'email', ''))
  );
$$;

-- Aggregierte Statistik (nur für Admins) --------------------------------
create or replace function public.site_stats(days int default 30)
returns json
language plpgsql
security definer
set search_path = public
as $$
declare
  result json;
  since timestamptz := now() - make_interval(days => days);
begin
  if not public.is_site_admin() then
    raise exception 'not authorized';
  end if;

  select json_build_object(
    'range_days', days,
    'page_views', (select count(*) from site_events where type = 'page_view' and created_at >= since),
    'sessions',   (select count(distinct session_id) from site_events where created_at >= since),
    'app_opens',  (select count(*) from site_events where type = 'app_open' and created_at >= since),
    'leads',      (select count(*) from site_leads  where created_at >= since),
    'by_app', (
      select coalesce(json_agg(row_to_json(t)), '[]'::json) from (
        select app_id,
               count(*) filter (where type = 'app_view') as views,
               count(*) filter (where type = 'app_open') as opens
        from site_events
        where app_id is not null and created_at >= since
        group by app_id
        order by count(*) filter (where type = 'app_open') desc, count(*) desc
      ) t
    ),
    'by_day', (
      select coalesce(json_agg(row_to_json(d) order by d.day), '[]'::json) from (
        select to_char(date_trunc('day', created_at), 'YYYY-MM-DD') as day,
               count(*) filter (where type = 'page_view') as views,
               count(distinct session_id) as sessions
        from site_events
        where created_at >= since
        group by date_trunc('day', created_at)
      ) d
    ),
    'top_referrers', (
      select coalesce(json_agg(row_to_json(r)), '[]'::json) from (
        select coalesce(nullif(referrer, ''), 'direkt') as referrer, count(*) as n
        from site_events
        where type = 'page_view' and created_at >= since
        group by 1 order by n desc limit 8
      ) r
    )
  ) into result;
  return result;
end;
$$;

-- Row Level Security ------------------------------------------------------
alter table public.site_events enable row level security;
alter table public.site_leads  enable row level security;
alter table public.site_config enable row level security;
alter table public.site_admins enable row level security;

-- Tracking: jeder darf EINFÜGEN, nur Admin darf LESEN
drop policy if exists site_events_insert on public.site_events;
create policy site_events_insert on public.site_events
  for insert to anon, authenticated with check (true);
drop policy if exists site_events_select on public.site_events;
create policy site_events_select on public.site_events
  for select to authenticated using (public.is_site_admin());

-- Leads: jeder darf EINFÜGEN, nur Admin darf LESEN/LÖSCHEN
drop policy if exists site_leads_insert on public.site_leads;
create policy site_leads_insert on public.site_leads
  for insert to anon, authenticated with check (true);
drop policy if exists site_leads_select on public.site_leads;
create policy site_leads_select on public.site_leads
  for select to authenticated using (public.is_site_admin());
drop policy if exists site_leads_delete on public.site_leads;
create policy site_leads_delete on public.site_leads
  for delete to authenticated using (public.is_site_admin());

-- Config: jeder darf LESEN (Startseite braucht Katalog/Affiliate), nur Admin schreibt
drop policy if exists site_config_select on public.site_config;
create policy site_config_select on public.site_config
  for select to anon, authenticated using (true);
drop policy if exists site_config_write on public.site_config;
create policy site_config_write on public.site_config
  for all to authenticated using (public.is_site_admin()) with check (public.is_site_admin());

-- Admin-Tabelle: nur Admins
drop policy if exists site_admins_all on public.site_admins;
create policy site_admins_all on public.site_admins
  for all to authenticated using (public.is_site_admin()) with check (public.is_site_admin());

-- Rechte für die öffentlichen Rollen --------------------------------------
grant usage on schema public to anon, authenticated;
grant insert on public.site_events to anon, authenticated;
grant select on public.site_events to authenticated;
grant insert on public.site_leads  to anon, authenticated;
grant select, delete on public.site_leads to authenticated;
grant select on public.site_config to anon, authenticated;
grant insert, update, delete on public.site_config to authenticated;
grant select, insert, update, delete on public.site_admins to authenticated;
grant execute on function public.is_site_admin()    to anon, authenticated;
grant execute on function public.site_stats(int)    to authenticated;
