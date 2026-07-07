-- ============================================================
--  Nachtrag: Push fuer Trainer/Betreuer mit MEHREREN Teams
--  (einmalig im Supabase SQL-Editor ausfuehren, NACH notifications.sql)
--
--  Vorher bekam ein Abo nur EIN Team (tid). Trainer mit mehreren
--  Mannschaften erhielten dadurch keine Team-Erinnerungen.
-- ============================================================

alter table public.push_subscriptions add column if not exists tids text[];

-- Alte 6-Parameter-Funktion entfernen (sonst waere der Aufruf mehrdeutig)
drop function if exists public.subscribe_push(text,text,text,text,text,text);

create or replace function public.subscribe_push(
  p_endpoint text, p_p256dh text, p_auth text,
  p_cid text, p_tid text, p_player_name text,
  p_tids text[] default null
) returns uuid language plpgsql security definer
set search_path = public, extensions as $$
declare _id uuid;
begin
  insert into public.push_subscriptions(endpoint, p256dh, auth, cid, tid, player_name, tids)
  values (p_endpoint, p_p256dh, p_auth, p_cid, p_tid, p_player_name, p_tids)
  on conflict (endpoint) do update
    set p256dh      = excluded.p256dh,
        auth        = excluded.auth,
        cid         = excluded.cid,
        tid         = excluded.tid,
        player_name = excluded.player_name,
        tids        = excluded.tids,
        last_seen   = now(),
        enabled     = true
  returning id into _id;
  return _id;
end $$;

revoke all on function public.subscribe_push(text,text,text,text,text,text,text[]) from public;
grant execute on function public.subscribe_push(text,text,text,text,text,text,text[]) to anon, authenticated;
