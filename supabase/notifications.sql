-- ============================================================
--  Vereins-App - Push-Benachrichtigungen (PWA Web Push)
--  Im Supabase SQL-Editor ausfuehren:
--    Dashboard -> SQL Editor -> New query -> einfuegen -> Run
-- ============================================================

-- 1) Tabelle fuer Push-Subscriptions (eine Zeile pro Geraet)
create table if not exists public.push_subscriptions (
  id                 uuid primary key default gen_random_uuid(),
  cid                text,                       -- Club-ID des Nutzers
  tid                text,                       -- Haupt-Team-ID
  player_name        text,                       -- Anzeigename im App-Vote-System
  endpoint           text unique not null,
  p256dh             text not null,
  auth               text not null,
  -- Einstellungen pro Geraet
  enabled            boolean default true,
  reminders_vote     boolean default true,       -- 3-Tage- und taeglich-bis-abgestimmt
  reminders_morning  boolean default true,       -- morgens am Tag des Termins
  chat               boolean default true,       -- neue Chat-Nachrichten
  disabled_types     text[] default '{}',        -- Termin-Arten ausblenden (z.B. ['training'])
  muted_events       text[] default '{}',        -- einzelne Termin-IDs ausblenden
  created_at         timestamptz default now(),
  last_seen          timestamptz default now()
);
alter table public.push_subscriptions enable row level security;
-- absichtlich KEINE Policy -> Zugriff nur ueber die RPCs unten (security definer)

-- 2) RPC: Subscription anlegen oder aktualisieren
create or replace function public.subscribe_push(
  p_endpoint text, p_p256dh text, p_auth text,
  p_cid text, p_tid text, p_player_name text
) returns uuid language plpgsql security definer
set search_path = public, extensions as $$
declare _id uuid;
begin
  insert into public.push_subscriptions(endpoint, p256dh, auth, cid, tid, player_name)
  values (p_endpoint, p_p256dh, p_auth, p_cid, p_tid, p_player_name)
  on conflict (endpoint) do update
    set p256dh      = excluded.p256dh,
        auth        = excluded.auth,
        cid         = excluded.cid,
        tid         = excluded.tid,
        player_name = excluded.player_name,
        last_seen   = now(),
        enabled     = true
  returning id into _id;
  return _id;
end $$;

-- 3) RPC: Einstellungen aendern (per Endpoint identifiziert)
create or replace function public.update_push_prefs(
  p_endpoint text,
  p_enabled boolean,
  p_reminders_vote boolean,
  p_reminders_morning boolean,
  p_chat boolean,
  p_disabled_types text[],
  p_muted_events text[]
) returns void language plpgsql security definer
set search_path = public, extensions as $$
begin
  update public.push_subscriptions set
    enabled            = coalesce(p_enabled, enabled),
    reminders_vote     = coalesce(p_reminders_vote, reminders_vote),
    reminders_morning  = coalesce(p_reminders_morning, reminders_morning),
    chat               = coalesce(p_chat, chat),
    disabled_types     = coalesce(p_disabled_types, disabled_types),
    muted_events       = coalesce(p_muted_events, muted_events),
    last_seen          = now()
  where endpoint = p_endpoint;
end $$;

-- 4) RPC: Subscription loeschen
create or replace function public.unsubscribe_push(p_endpoint text)
returns void language plpgsql security definer
set search_path = public, extensions as $$
begin
  delete from public.push_subscriptions where endpoint = p_endpoint;
end $$;

revoke all on function public.subscribe_push(text,text,text,text,text,text) from public;
grant execute on function public.subscribe_push(text,text,text,text,text,text) to anon, authenticated;
revoke all on function public.update_push_prefs(text,boolean,boolean,boolean,boolean,text[],text[]) from public;
grant execute on function public.update_push_prefs(text,boolean,boolean,boolean,boolean,text[],text[]) to anon, authenticated;
revoke all on function public.unsubscribe_push(text) from public;
grant execute on function public.unsubscribe_push(text) to anon, authenticated;

-- ============================================================
--  5) Cron einrichten (taeglicher Versand der Erinnerungen)
--     Dafuer in Supabase die Extensions "pg_cron" und "pg_net"
--     unter Database -> Extensions aktivieren, dann diese
--     Statements ausfuehren (PROJEKT-URL und SERVICE-KEY ersetzen).
-- ============================================================
-- select cron.schedule(
--   'vereins-daily-reminders',
--   '0 5 * * *',                              -- 05:00 UTC = 07:00 Berlin
--   $$
--     select net.http_post(
--       url     := 'https://DEIN-PROJEKT.supabase.co/functions/v1/notify',
--       headers := jsonb_build_object(
--                    'Authorization', 'Bearer DEIN-SERVICE-ROLE-KEY',
--                    'Content-Type',  'application/json'),
--       body    := jsonb_build_object('mode','cron')
--     ) as request_id;
--   $$
-- );
