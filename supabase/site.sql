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
