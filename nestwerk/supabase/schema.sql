-- ============================================================
-- Nestwerk – Datenbankschema
-- Einmalig ausführen: Supabase-Dashboard → SQL Editor → einfügen → Run
-- Alle Tabellen tragen das Präfix nw_ und sind per RLS strikt getrennt.
-- ============================================================

create table if not exists nw_families (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  invite_code text not null unique default encode(gen_random_bytes(6), 'hex'),
  created_at timestamptz not null default now()
);

create table if not exists nw_members (
  id uuid primary key default gen_random_uuid(),
  family_id uuid not null references nw_families(id) on delete cascade,
  user_id uuid unique references auth.users(id) on delete set null,
  name text not null,
  color text not null default '#3E7CB1',
  kind text not null default 'adult' check (kind in ('adult','kid')),
  is_admin boolean not null default false,
  can_direct boolean not null default false,
  created_at timestamptz not null default now()
);

create table if not exists nw_events (
  id uuid primary key default gen_random_uuid(),
  family_id uuid not null references nw_families(id) on delete cascade,
  member_id uuid not null references nw_members(id) on delete cascade,
  on_date date not null,
  at_time time not null,
  title text not null,
  meta text not null default '',
  serie boolean not null default false,
  status text not null default 'fix' check (status in ('fix','pending')),
  created_by uuid references nw_members(id) on delete set null,
  created_at timestamptz not null default now()
);

create table if not exists nw_list_items (
  id uuid primary key default gen_random_uuid(),
  family_id uuid not null references nw_families(id) on delete cascade,
  list text not null check (list in ('einkauf','todo')),
  text text not null,
  done boolean not null default false,
  created_by uuid references nw_members(id) on delete set null,
  created_at timestamptz not null default now()
);

-- Digitales Gedächtnis: Der Server speichert NUR Chiffretext.
-- Der Schlüssel wird aus dem Gedächtnis-Passwort auf dem Gerät abgeleitet
-- und verlässt es nie. Kein "Passwort vergessen" möglich – gewollt.
create table if not exists nw_memory (
  user_id uuid primary key references auth.users(id) on delete cascade,
  salt text not null,
  iv text not null,
  cipher text not null,
  updated_at timestamptz not null default now()
);

-- Hilfsfunktionen
create or replace function nw_my_family() returns uuid
language sql stable security definer set search_path = public as $$
  select family_id from nw_members where user_id = auth.uid() limit 1;
$$;

create or replace function nw_my_member() returns uuid
language sql stable security definer set search_path = public as $$
  select id from nw_members where user_id = auth.uid() limit 1;
$$;

-- Familie gründen (Gründer wird Admin und darf direkt eintragen)
create or replace function nw_create_family(family_name text, my_name text, my_color text)
returns uuid language plpgsql security definer set search_path = public as $$
declare fid uuid;
begin
  if auth.uid() is null then raise exception 'Nicht angemeldet'; end if;
  if exists (select 1 from nw_members where user_id = auth.uid()) then
    raise exception 'Du gehörst schon zu einer Familie';
  end if;
  insert into nw_families (name) values (family_name) returning id into fid;
  insert into nw_members (family_id, user_id, name, color, kind, is_admin, can_direct)
    values (fid, auth.uid(), my_name, coalesce(my_color, '#3E7CB1'), 'adult', true, true);
  return fid;
end $$;

-- Familie per Einladungscode beitreten
create or replace function nw_join_family(code text, my_name text, my_color text)
returns uuid language plpgsql security definer set search_path = public as $$
declare fid uuid;
begin
  if auth.uid() is null then raise exception 'Nicht angemeldet'; end if;
  if exists (select 1 from nw_members where user_id = auth.uid()) then
    raise exception 'Du gehörst schon zu einer Familie';
  end if;
  select id into fid from nw_families where invite_code = lower(trim(code));
  if fid is null then raise exception 'Einladungscode nicht gefunden'; end if;
  insert into nw_members (family_id, user_id, name, color, kind, is_admin, can_direct)
    values (fid, auth.uid(), my_name, coalesce(my_color, '#5B9E63'), 'adult', false, false);
  return fid;
end $$;

grant execute on function nw_create_family(text, text, text) to authenticated;
grant execute on function nw_join_family(text, text, text) to authenticated;

-- Outlook-Regel serverseitig: Wer kein Direkt-Recht hat (oder einen belegten
-- Platz trifft), erzeugt für Personen mit eigenem Login automatisch eine
-- Anfrage statt eines festen Termins. Für Kinder ohne Login gilt der Termin
-- sofort (Eltern verwalten Kinder).
create or replace function nw_event_guard() returns trigger
language plpgsql security definer set search_path = public as $$
declare
  creator nw_members%rowtype;
  target_has_login boolean;
  busy boolean;
begin
  select * into creator from nw_members where user_id = auth.uid();
  if creator.id is null then raise exception 'Kein Familienmitglied'; end if;
  new.family_id := creator.family_id;
  new.created_by := creator.id;
  if not exists (select 1 from nw_members m where m.id = new.member_id and m.family_id = creator.family_id) then
    raise exception 'Termin-Person gehört nicht zur Familie';
  end if;
  if new.member_id = creator.id then
    new.status := 'fix';
  else
    select (user_id is not null) into target_has_login from nw_members where id = new.member_id;
    select exists (
      select 1 from nw_events e
      where e.member_id = new.member_id and e.on_date = new.on_date and e.status = 'fix'
        and abs(extract(epoch from (e.at_time - new.at_time))) < 3600
    ) into busy;
    if target_has_login and (not creator.can_direct or busy) then
      new.status := 'pending';
    else
      new.status := 'fix';
    end if;
  end if;
  return new;
end $$;

drop trigger if exists nw_event_guard_trg on nw_events;
create trigger nw_event_guard_trg before insert on nw_events
  for each row execute function nw_event_guard();

-- RLS: jede Familie sieht ausschließlich sich selbst
alter table nw_families enable row level security;
alter table nw_members enable row level security;
alter table nw_events enable row level security;
alter table nw_list_items enable row level security;
alter table nw_memory enable row level security;

create policy nw_families_select on nw_families for select
  using (id = nw_my_family());
create policy nw_families_update on nw_families for update
  using (id = nw_my_family() and exists (select 1 from nw_members where user_id = auth.uid() and is_admin));

create policy nw_members_select on nw_members for select
  using (family_id = nw_my_family());
create policy nw_members_insert on nw_members for insert
  with check (family_id = nw_my_family() and user_id is null
    and exists (select 1 from nw_members where user_id = auth.uid() and is_admin));
create policy nw_members_update on nw_members for update
  using (family_id = nw_my_family()
    and (user_id = auth.uid() or exists (select 1 from nw_members where user_id = auth.uid() and is_admin)));
create policy nw_members_delete on nw_members for delete
  using (family_id = nw_my_family() and user_id is null
    and exists (select 1 from nw_members where user_id = auth.uid() and is_admin));

create policy nw_events_select on nw_events for select
  using (family_id = nw_my_family());
create policy nw_events_insert on nw_events for insert
  with check (family_id = nw_my_family());
create policy nw_events_update on nw_events for update
  using (family_id = nw_my_family());
create policy nw_events_delete on nw_events for delete
  using (family_id = nw_my_family());

create policy nw_list_select on nw_list_items for select
  using (family_id = nw_my_family());
create policy nw_list_insert on nw_list_items for insert
  with check (family_id = nw_my_family());
create policy nw_list_update on nw_list_items for update
  using (family_id = nw_my_family());
create policy nw_list_delete on nw_list_items for delete
  using (family_id = nw_my_family());

-- Gedächtnis: ausschließlich der Besitzer – für alle anderen unsichtbar
create policy nw_memory_all on nw_memory for all
  using (user_id = auth.uid()) with check (user_id = auth.uid());
