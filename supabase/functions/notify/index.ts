// Supabase Edge Function: notify
// Sendet Web-Push-Benachrichtigungen:
//   POST { "mode": "cron" }                  -> taegliche Erinnerungen
//   POST { "mode": "chat", "message": {...} }-> neue Chat-Nachricht
//   POST { "mode": "test", "endpoint": "..." } -> Testpush
//
// Benoetigte Secrets (Supabase -> Edge Functions -> Secrets):
//   VAPID_PUBLIC_KEY, VAPID_PRIVATE_KEY, VAPID_EMAIL
//   SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY (von Supabase automatisch gesetzt)
//   APP_DATA_KEY  (Default "vereinsapp_v14")
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import webpush from "npm:web-push@3";

const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SERVICE_KEY  = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
const VAPID_PUB    = Deno.env.get("VAPID_PUBLIC_KEY")!;
const VAPID_PRIV   = Deno.env.get("VAPID_PRIVATE_KEY")!;
const VAPID_EMAIL  = Deno.env.get("VAPID_EMAIL") || "mailto:admin@example.com";
const SK           = Deno.env.get("APP_DATA_KEY") || "vereinsapp_v14";
const STAFF_LEAD_HOURS = Number(Deno.env.get("STAFF_LEAD_HOURS") || "8"); // Helfer-Anfrage so viele Stunden vor Trainingsbeginn

webpush.setVapidDetails(VAPID_EMAIL, VAPID_PUB, VAPID_PRIV);
const admin = createClient(SUPABASE_URL, SERVICE_KEY, { auth: { persistSession: false } });

// --- Spruchpool (deterministisch pro Termin) ----------------
const QUOTES = [
  "Auf gehts - heute wartet ein top Tag auf dich!",
  "Jetzt zaehlt's: Du gibst der Mannschaft was Wichtiges.",
  "Lieber muede ankommen als gar nicht losgegangen sein.",
  "Eine Mannschaft ist nur so stark wie ihre Vollzaehligkeit.",
  "Jeder Trainingstag ist ein Schritt nach vorne.",
  "Hab Spass dabei - der Rest kommt von allein.",
  "Egal ob's regnet: ihr seid eine Mannschaft.",
  "Du wirst heute jemanden zum Lachen bringen.",
  "Was du heute lernst, kann dir morgen den Sieg bringen.",
  "Ein Tor entsteht meistens aus 30 unscheinbaren Aktionen davor.",
  "Wer da ist, gewinnt schon - der Rest ist Bonus.",
  "Heute kann der Tag werden, an dem du was Neues kannst.",
  "Sport hat noch nie jemandem geschadet - Sofa hingegen schon.",
  "Wenn alle ziehen, geht der Wagen leicht.",
  "Heute ist Mannschafts-Tag. Bring deine gute Laune mit.",
  "Es ist nicht wichtig, der Beste zu sein - sondern dabei zu sein.",
  "Ein Lacher mehr im Team - das nimmt dir keiner mehr weg.",
  "Heute lernst du, was du gestern noch nicht konntest.",
  "Trau dich, schiess heute mal aus der Distanz.",
  "Sei laut auf dem Platz, sei leise auf der Bank.",
  "Komm an, sei dabei, hab Spass. Mehr braucht es nicht.",
  "Deine Mannschaft freut sich, wenn sie dich sieht.",
  "Heute lockerer Tag - aber gemeinsam.",
  "Jeder Schritt zum Sportplatz ist ein guter Schritt.",
  "Bring jemanden zum Glaenzen - das geht immer.",
  "Du musst nicht der Schnellste sein, nur der mit dem groessten Einsatz.",
  "Es gibt kein schlechtes Wetter, nur falsche Ausreden.",
  "Was du investierst, bekommst du doppelt zurueck.",
  "Mannschaftsgefuehl entsteht da, wo man hingeht, auch wenn's mal nervt.",
  "Heute mit Vollgas - und einem Laecheln dazu.",
];
function quoteFor(eventId: string): string {
  let h = 0;
  for (const ch of String(eventId)) h = (h * 31 + ch.charCodeAt(0)) | 0;
  return QUOTES[Math.abs(h) % QUOTES.length];
}

// --- Hilfsfunktionen ----------------------------------------
function berlinISO(d = new Date()): string {
  // YYYY-MM-DD in Europe/Berlin
  const f = new Intl.DateTimeFormat("sv-SE", { timeZone: "Europe/Berlin" });
  return f.format(d); // sv-SE -> YYYY-MM-DD
}
function daysBetween(aISO: string, bISO: string): number {
  const a = new Date(aISO + "T00:00:00Z").getTime();
  const b = new Date(bISO + "T00:00:00Z").getTime();
  return Math.round((b - a) / (1000 * 60 * 60 * 24));
}

async function send(sub: any, payload: any): Promise<{ok:boolean, gone:boolean}> {
  try {
    await webpush.sendNotification(
      { endpoint: sub.endpoint, keys: { p256dh: sub.p256dh, auth: sub.auth } },
      JSON.stringify(payload),
      { TTL: 60 * 60 * 24 },
    );
    return { ok: true, gone: false };
  } catch (err: any) {
    const code = err?.statusCode || 0;
    return { ok: false, gone: code === 404 || code === 410 }; // Subscription weg
  }
}
async function reapGone(endpoints: string[]) {
  if (endpoints.length === 0) return;
  await admin.from("push_subscriptions").delete().in("endpoint", endpoints);
}

// --- Termine aus app_data (alle Vereine) -------------------
type Ev = { id:string, cid?:string, tid?:string, type?:string, title?:string,
            date:string, time?:string, loc?:string, votes?:Record<string,any> };

function isAttending(v: any): boolean {
  if (!v) return false;
  if (v === "yes" || v === "maybe" || v === "late") return true;
  if (typeof v === "object") return v.val === "yes" || v.val === "maybe" || v.val === "late";
  return false;
}
function hasVoted(v: any): boolean {
  if (v === undefined || v === null || v === "") return false;
  if (typeof v === "object") return !!v.val;
  return true;
}

type HelperEntry = { name: string, tids: string[] };
type Birthday = { name: string, bday: string };
async function loadAll(): Promise<{ events: Ev[], helpersByCid: Record<string, HelperEntry[]>, birthdaysByTid: Record<string, Birthday[]> }> {
  const { data } = await admin
    .from("app_data")
    .select("key, value")
    .like("key", `${SK}__club_%`);
  const out: Ev[] = [];
  const helpersByCid: Record<string, HelperEntry[]> = {};
  const birthdaysByTid: Record<string, Birthday[]> = {};
  for (const row of data || []) {
    const value: any = row.value;
    const cid = String(row.key).slice((SK + "__club_").length);
    const evs: any[] = Array.isArray(value?.events) ? value.events : [];
    for (const e of evs) out.push({ ...e, cid: e.cid || cid });
    const hs: any[] = Array.isArray(value?.helpers) ? value.helpers : [];
    helpersByCid[cid] = hs
      .map((h: any) => ({ name: String(h?.name || "").toLowerCase(), tids: Array.isArray(h?.tids) ? h.tids : [] }))
      .filter((h: HelperEntry) => h.name);
    const pps: any[] = Array.isArray(value?.playerProfiles) ? value.playerProfiles : [];
    for (const p of pps) {
      if (!p?.mainTid || !p?.bday || p?.archived) continue;
      (birthdaysByTid[p.mainTid] ||= []).push({ name: p.name, bday: String(p.bday) });
    }
  }
  return { events: out, helpersByCid, birthdaysByTid };
}

// --- Modus "cron" -------------------------------------------
async function runCron(): Promise<Response> {
  const today = berlinISO();
  const { events: allEvents, helpersByCid, birthdaysByTid } = await loadAll();
  const { data: subs } = await admin
    .from("push_subscriptions")
    .select("*")
    .eq("enabled", true);
  if (!subs || subs.length === 0) return json({ sent: 0, note: "no subs" });

  let sent = 0; const gone: string[] = [];
  for (const sub of subs) {
    // Termine fuer die Teams dieses Abos (Trainer/Betreuer koennen mehrere haben)
    const subTids: string[] = (Array.isArray(sub.tids) && sub.tids.length ? sub.tids : (sub.tid ? [sub.tid] : []));
    const teamEvents = allEvents.filter(e => subTids.includes(e.tid) && (!sub.cid || e.cid === sub.cid));
    for (const ev of teamEvents) {
      if ((sub.disabled_types || []).includes(ev.type)) continue;
      if ((sub.muted_events || []).includes(ev.id)) continue;
      const diff = daysBetween(today, ev.date);
      const voted = hasVoted(ev.votes?.[sub.player_name]);
      const attend = isAttending(ev.votes?.[sub.player_name]);

      // a) Vote-Erinnerung: 0..3 Tage vorher, taeglich bis abgestimmt
      if (sub.reminders_vote && !voted && diff >= 0 && diff <= 3) {
        const body = diff === 0
          ? `Heute ${ev.time || ""} - bitte noch kurz abstimmen.`
          : `In ${diff} ${diff === 1 ? "Tag" : "Tagen"} (${ev.date}) - du hast noch nicht abgestimmt.`;
        const { ok, gone: g } = await send(sub, {
          title: ev.title || "Termin",
          body, tag: `vote_${ev.id}`, renotify: true,
          url: `/?club=${ev.cid || ""}&event=${ev.id}`, icon: "/icon-192.png",
        });
        if (ok) sent++; if (g) gone.push(sub.endpoint);
      }

      // b) Morgen-Erinnerung am Tag des Termins, wenn zugesagt
      if (sub.reminders_morning && diff === 0 && attend) {
        const { ok, gone: g } = await send(sub, {
          title: `Heute: ${ev.title || "Termin"}${ev.time ? " um " + ev.time : ""}`,
          body: quoteFor(ev.id),
          tag: `morn_${ev.id}`,
          url: `/?club=${ev.cid || ""}&event=${ev.id}`, icon: "/icon-192.png",
        });
        if (ok) sent++; if (g) gone.push(sub.endpoint);
      }
    }
    // c) Betreuer gesucht: nur an Vereins-Helfer (ueber cid, fuer ihre Teams),
    //    wenn ein Training heute/morgen den Soll-Betreuerwert nicht erreicht.
    const helperEntry = (helpersByCid[sub.cid || ""] || []).find(h => h.name === String(sub.player_name || "").toLowerCase());
    if (helperEntry && !(sub.disabled_types || []).includes("training")) {
      for (const ev of allEvents) {
        if (ev.cid !== sub.cid || ev.type !== "training") continue;
        if (helperEntry.tids.length && ev.tid && !helperEntry.tids.includes(ev.tid)) continue;
        if ((sub.muted_events || []).includes(ev.id)) continue;
        const diff = daysBetween(today, ev.date);
        if (diff < 0 || diff > 1) continue;
        // Nur kurz vor Beginn anpingen: bis STAFF_LEAD_HOURS vorher (bei bekannter Uhrzeit).
        let withinLead = diff === 0;
        if (ev.time) {
          const startMs = new Date(`${ev.date}T${ev.time}:00+02:00`).getTime();
          const h = (startMs - Date.now()) / 3600000;
          withinLead = h > -1 && h <= STAFF_LEAD_HOURS;
        }
        if (!withinLead) continue;
        const e: any = ev;
        const yesC = Object.values(e.votes || {}).filter((v: any) => isAttending(v)).length;
        const size = yesC || e.sollPlayers || 7;
        const target = e.staffTarget || (size > 10 ? 3 : 2);
        const tc = Object.keys(e.trainerPresence || {}).length;
        const offers: any[] = Array.isArray(e.helperOffers) ? e.helperOffers : [];
        const ist = tc + Math.min(offers.length, Math.max(0, target - tc));
        const mine = offers.some((o: any) => String(o?.name || "").toLowerCase() === helperEntry.name);
        if (ist >= target || mine) continue;
        const need = target - ist;
        const { ok, gone: g } = await send(sub, {
          title: `Betreuer gesucht: ${e.title || "Training"}`,
          body: `${diff === 0 ? "Heute" : "Morgen"}${e.time ? " " + e.time : ""}: noch ${need} Betreuer fehlen. Kannst du einspringen?`.trim(),
          tag: `staff_${e.id}`, renotify: true,
          url: `/?club=${e.cid || ""}&event=${e.id}`, icon: "/icon-192.png",
          requireInteraction: true,
        });
        if (ok) sent++; if (g) gone.push(sub.endpoint);
      }
    }
    // d) Geburtstags-Gratulation: heute Geburtstag im Team -> an die Teammitglieder.
    for (const btid of subTids) {
      const md = today.slice(5); // MM-DD
      const others = (birthdaysByTid[btid] || [])
        .filter(p => String(p.bday || "").slice(5) === md && p.name)
        .filter(p => String(p.name).toLowerCase() !== String(sub.player_name || "").toLowerCase());
      if (others.length) {
        const names = others.map(p => p.name).join(", ");
        const { ok, gone: g } = await send(sub, {
          title: "🎂 Geburtstag im Team!",
          body: `${names} hat heute Geburtstag. Gratuliert doch kurz! 🎉`,
          tag: `bday_${today}_${btid}`,
          url: "/", icon: "/icon-192.png",
        });
        if (ok) sent++; if (g) gone.push(sub.endpoint);
      }
    }
  }
  await reapGone(gone);
  return json({ sent, gone: gone.length });
}

// --- Modus "chat" -------------------------------------------
type ChatPayload = { cid?:string, tid?:string, from?:string, text?:string, title?:string };
async function runChat(msg: ChatPayload): Promise<Response> {
  if (!msg) return json({ error: "no message" }, 400);
  const filters: Record<string, any> = { chat: true, enabled: true };
  let q = admin.from("push_subscriptions").select("*").match(filters);
  if (msg.cid) q = q.eq("cid", msg.cid);
  if (msg.tid) q = q.eq("tid", msg.tid);
  const { data: subs } = await q;
  if (!subs || subs.length === 0) return json({ sent: 0 });

  let sent = 0; const gone: string[] = [];
  for (const sub of subs) {
    if (msg.from && sub.player_name === msg.from) continue; // nicht an Absender
    const { ok, gone: g } = await send(sub, {
      title: msg.title || (msg.from ? `Neue Nachricht von ${msg.from}` : "Neue Chat-Nachricht"),
      body: (msg.text || "").slice(0, 140),
      tag: `chat_${msg.cid || ""}_${msg.tid || ""}`,
      url: "/?tab=chat", icon: "/icon-192.png",
    });
    if (ok) sent++; if (g) gone.push(sub.endpoint);
  }
  await reapGone(gone);
  return json({ sent, gone: gone.length });
}

// --- Modus "test" -------------------------------------------
async function runTest(endpoint?: string): Promise<Response> {
  const q = admin.from("push_subscriptions").select("*").eq("enabled", true);
  const { data: subs } = endpoint ? await q.eq("endpoint", endpoint) : await q.limit(50);
  let sent = 0; const gone: string[] = [];
  for (const sub of subs || []) {
    const { ok, gone: g } = await send(sub, {
      title: "Vereins-App", body: "Push funktioniert!", tag: "test",
      icon: "/icon-192.png",
    });
    if (ok) sent++; if (g) gone.push(sub.endpoint);
  }
  await reapGone(gone);
  return json({ sent, gone: gone.length });
}

// --- HTTP ---------------------------------------------------
function json(obj: unknown, status = 200) {
  return new Response(JSON.stringify(obj), {
    status, headers: { "Content-Type": "application/json" },
  });
}

Deno.serve(async (req) => {
  if (req.method !== "POST") return json({ error: "POST only" }, 405);
  let body: any;
  try { body = await req.json(); } catch { body = {}; }
  const mode = body?.mode || "cron";
  try {
    if (mode === "cron") return await runCron();
    if (mode === "chat") return await runChat(body?.message || body);
    if (mode === "test") return await runTest(body?.endpoint);
    return json({ error: "unknown mode" }, 400);
  } catch (e) {
    return json({ error: String(e) }, 500);
  }
});
