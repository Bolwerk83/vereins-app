-- ============================================================
--  Vereins-App - sicheres Supabase-Backend
--  Einmalig im Supabase SQL-Editor ausfuehren:
--    Dashboard -> SQL Editor -> New query -> einfuegen -> Run
--  WICHTIG: Unten in Schritt 6 DEINEN Vereinscode eintragen.
-- ============================================================

create extension if not exists pgcrypto;

-- 1) Datentabelle (ein Dokument; von Supabase verschluesselt gespeichert)
create table if not exists public.app_data (
  key        text primary key,
  value      jsonb,
  updated_at timestamptz default now()
);
alter table public.app_data enable row level security;

-- 2) Mitglieder: Geraete, die den Vereinscode eingeloest haben
create table if not exists public.app_members (
  user_id   uuid primary key references auth.users(id) on delete cascade,
  joined_at timestamptz default now()
);
alter table public.app_members enable row level security;

-- 3) Geheimer Vereinscode (gehasht; ueber die API NICHT lesbar)
create table if not exists public.app_secret (
  id        int primary key default 1,
  code_hash text not null,
  constraint app_secret_one_row check (id = 1)
);
alter table public.app_secret enable row level security;
-- absichtlich KEINE Policy -> diese Tabelle ist ueber die API komplett gesperrt

-- 4) Sicherheitsregeln (Row Level Security):
--    Nur eingeloeste Mitglieder duerfen die Daten lesen/schreiben.
drop policy if exists "members access app_data" on public.app_data;
create policy "members access app_data" on public.app_data
  for all
  using      (exists (select 1 from public.app_members m where m.user_id = auth.uid()))
  with check (exists (select 1 from public.app_members m where m.user_id = auth.uid()));

drop policy if exists "see own membership" on public.app_members;
create policy "see own membership" on public.app_members
  for select using (auth.uid() = user_id);

-- 5) Funktion: Vereinscode einloesen -> Mitglied werden
create or replace function public.redeem_code(p_code text)
returns boolean
language plpgsql
security definer
set search_path = public, extensions
as $$
declare valid boolean;
begin
  if auth.uid() is null then
    return false;
  end if;
  select exists (
    select 1 from public.app_secret
    where id = 1
      and code_hash = encode(digest(p_code, 'sha256'), 'hex')
  ) into valid;
  if valid then
    insert into public.app_members (user_id) values (auth.uid())
    on conflict (user_id) do nothing;
  end if;
  return valid;
end;
$$;

revoke all on function public.redeem_code(text) from public;
grant execute on function public.redeem_code(text) to anon, authenticated;

-- ============================================================
--  6) DEINEN VEREINSCODE FESTLEGEN
--     Ersetze HIER-DEINEN-CODE durch einen langen, geheimen Code
--     (mindestens 12 Zeichen). Diesen Code teilst du mit den
--     Vereinsmitgliedern - er ist der Zugangsschluessel zur App.
--     Diese Zeile kannst du spaeter erneut ausfuehren, um den
--     Code zu aendern.
-- ============================================================
insert into public.app_secret (id, code_hash)
values (1, encode(digest('r3EDDDJf0t4U4Zep8_tTXw', 'sha256'), 'hex'))
on conflict (id) do update set code_hash = excluded.code_hash;
