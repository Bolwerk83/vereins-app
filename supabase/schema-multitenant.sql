-- ============================================================
--  VORSCHLAG: Mandanten-Trennung (mehrere Vereine isoliert)
--  -----------------------------------------------------------
--  NICHT automatisch anwenden. Dies ist der Ziel-Zustand fuer
--  Punkt #3 (Datenisolation pro Verein). Erst nach Freigabe und
--  Daten-Migration (siehe docs/mandanten-trennung.md) ausfuehren.
--
--  Kernidee: Mitgliedschaft + Geheimcode werden PRO VEREIN gefuehrt.
--  Die RLS auf app_data erlaubt einer Person nur Zugriff auf die
--  Zeilen ihres/ihrer Vereine; die oeffentliche Verzeichnis-Zeile
--  (__global) bleibt fuer angemeldete Nutzer lesbar.
-- ============================================================

create extension if not exists pgcrypto;

-- 1) Datentabelle (unveraendert)
create table if not exists public.app_data (
  key        text primary key,
  value      jsonb,
  updated_at timestamptz default now()
);
alter table public.app_data enable row level security;

-- 2) Mitgliedschaft jetzt PRO (Nutzer, Verein)
create table if not exists public.app_members (
  user_id   uuid not null references auth.users(id) on delete cascade,
  cid       text not null,
  joined_at timestamptz default now(),
  primary key (user_id, cid)
);
alter table public.app_members enable row level security;
drop policy if exists "see own membership" on public.app_members;
create policy "see own membership" on public.app_members
  for select using (auth.uid() = user_id);

-- 3) Geheimcode PRO VEREIN (gehasht, ueber die API nicht lesbar)
create table if not exists public.app_club_secret (
  cid       text primary key,
  code_hash text not null
);
alter table public.app_club_secret enable row level security; -- bewusst KEINE Policy -> API-gesperrt

-- SuperAdmin-Passwort bleibt wie gehabt in app_secret (eine Zeile)
create table if not exists public.app_secret (
  id int primary key default 1,
  code_hash text,
  sa_password_hash text,
  constraint app_secret_one_row check (id = 1)
);
alter table public.app_secret enable row level security; -- keine Policy

-- 4) Hilfsfunktion: aus einem app_data-key die cid ableiten (oder NULL)
create or replace function public.app_key_cid(k text)
returns text language sql immutable as $$
  select case
    when k like 'vereinsapp_v14__club\_%' escape '\'
      then substring(k from length('vereinsapp_v14__club_') + 1)
    else null
  end;
$$;

-- 5) RLS auf app_data:
--    - __global (Verzeichnis + oeffentlicher Live-Index): fuer alle
--      angemeldeten Nutzer LESBAR und SCHREIBBAR (nur wenig sensibel:
--      Vereinsliste/Logos + liveEvents). Integritaet wird durch den
--      3-Wege-Merge im Client + SuperAdmin-Backups abgesichert.
--    - __club_<cid>: NUR fuer Mitglieder genau dieses Vereins.
--    - alles andere (Backups, __dbtest, etc.): KEIN normaler Zugriff
--      (nur Service-Role / SuperAdmin server-seitig).
drop policy if exists "members access app_data" on public.app_data;
drop policy if exists "tenant access app_data" on public.app_data;
create policy "tenant access app_data" on public.app_data
  for all
  using (
    auth.uid() is not null and (
      key = 'vereinsapp_v14__global'
      or exists (
        select 1 from public.app_members m
        where m.user_id = auth.uid()
          and m.cid = public.app_key_cid(app_data.key)
      )
    )
  )
  with check (
    auth.uid() is not null and (
      key = 'vereinsapp_v14__global'
      or exists (
        select 1 from public.app_members m
        where m.user_id = auth.uid()
          and m.cid = public.app_key_cid(app_data.key)
      )
    )
  );

-- 6) Vereinscode einloesen -> Mitgliedschaft fuer GENAU diesen Verein
create or replace function public.redeem_code(p_cid text, p_code text)
returns boolean
language plpgsql
security definer
set search_path = public, extensions
as $$
declare valid boolean;
begin
  if auth.uid() is null then return false; end if;
  select exists (
    select 1 from public.app_club_secret
    where cid = p_cid
      and code_hash = encode(digest(p_code, 'sha256'), 'hex')
  ) into valid;
  if valid then
    insert into public.app_members (user_id, cid)
    values (auth.uid(), p_cid)
    on conflict (user_id, cid) do nothing;
  end if;
  return valid;
end;
$$;
revoke all on function public.redeem_code(text, text) from public;
grant execute on function public.redeem_code(text, text) to anon, authenticated;

-- 7) Vereinscode festlegen/aendern: nur SuperAdmin-Aufruf vorgesehen
--    (per Service-Role oder SQL-Editor). Beispiel:
-- insert into public.app_club_secret (cid, code_hash)
-- values ('c_xxx', encode(digest('GEHEIM-CODE','sha256'),'hex'))
-- on conflict (cid) do update set code_hash = excluded.code_hash;

-- 8) SuperAdmin (Plattform-Betreiber) greift NICHT als normales Mitglied
--    auf alle Daten zu, sondern server-seitig mit der SERVICE-ROLE
--    (umgeht RLS). Der In-App-SuperAdmin-Bereich muss dafuer ueber eine
--    vertrauenswuerdige Server-Funktion / Edge-Function laufen, nicht
--    ueber den anon/Member-Token im Browser.
