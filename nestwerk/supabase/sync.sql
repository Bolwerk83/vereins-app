-- ============================================================
-- Eselsohr Familien-Sync (Stufe 2, v1)
-- Einmal im Supabase-SQL-Editor ausführen:
--   supabase.com → Projekt „Bolwerk83's Project" → SQL Editor
--   → diesen Text einfügen → Run. Fertig.
--
-- Eine Zeile pro Familie. Zugriff NUR über die drei Funktionen
-- unten; der unerratbare Familien-Code ist der Schlüssel (gleiche
-- Idee wie der Vereinscode der Vereins-App). Gedächtnispalast-
-- Inhalte liegen im JSON bereits Ende-zu-Ende-verschlüsselt –
-- die Datenbank sieht dort nur salt/iv/cipher.
-- ============================================================

create table if not exists public.es_families (
  id uuid primary key default gen_random_uuid(),
  code text unique not null check (char_length(code) between 16 and 64),
  data jsonb not null,
  version bigint not null default 1,
  updated_at timestamptz not null default now()
);

alter table public.es_families enable row level security;
-- Keine Policies: direkter Tabellenzugriff ist für anon/authenticated komplett zu.

create or replace function public.es_create_family(p_code text, p_data jsonb)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
begin
  if char_length(coalesce(p_code, '')) < 16 then
    return jsonb_build_object('ok', false, 'error', 'code_too_short');
  end if;
  if pg_column_size(p_data) > 2000000 then
    return jsonb_build_object('ok', false, 'error', 'too_large');
  end if;
  insert into es_families (code, data) values (p_code, p_data);
  return jsonb_build_object('ok', true, 'version', 1);
exception when unique_violation then
  return jsonb_build_object('ok', false, 'error', 'code_exists');
end;
$$;

create or replace function public.es_pull(p_code text)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare r record;
begin
  select data, version into r from es_families where code = p_code;
  if not found then
    return jsonb_build_object('ok', false, 'error', 'not_found');
  end if;
  return jsonb_build_object('ok', true, 'data', r.data, 'version', r.version);
end;
$$;

create or replace function public.es_push(p_code text, p_data jsonb, p_version bigint)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare r record;
begin
  if pg_column_size(p_data) > 2000000 then
    return jsonb_build_object('ok', false, 'error', 'too_large');
  end if;
  select version into r from es_families where code = p_code for update;
  if not found then
    return jsonb_build_object('ok', false, 'error', 'not_found');
  end if;
  if r.version <> p_version then
    -- Konflikt: Server-Stand zurückgeben, der Client merged und pusht erneut
    select data, version into r from es_families where code = p_code;
    return jsonb_build_object('ok', false, 'error', 'conflict', 'data', r.data, 'version', r.version);
  end if;
  update es_families
     set data = p_data, version = version + 1, updated_at = now()
   where code = p_code;
  return jsonb_build_object('ok', true, 'version', p_version + 1);
end;
$$;

revoke all on table public.es_families from anon, authenticated;
grant execute on function public.es_create_family(text, jsonb) to anon, authenticated;
grant execute on function public.es_pull(text) to anon, authenticated;
grant execute on function public.es_push(text, jsonb, bigint) to anon, authenticated;
