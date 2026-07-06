// Supabase Edge Function: inbound-mail
// E-Mail-Bruecke: leitet eingehende E-Mails (z. B. DFBnet-Benachrichtigungen,
// Turnier-Anfragen anderer Vereine) in den App-Posteingang (contactRequests).
//
// Ablauf:
//   1. Deploy:   supabase functions deploy inbound-mail --no-verify-jwt
//   2. Secret:   supabase secrets set INBOUND_MAIL_SECRET=<langes-zufalls-geheimnis>
//   3. Beim Mail-Anbieter (z. B. Cloudflare Email Routing Worker, Mailgun Route,
//      Resend Inbound) einen Webhook auf diese URL konfigurieren:
//        POST https://<projekt>.supabase.co/functions/v1/inbound-mail?club=<cid>&secret=<geheimnis>
//      Body: JSON { "from": "...", "subject": "...", "text": "..." }
//      (Mailgun-Formfelder sender/subject/body-plain werden ebenfalls akzeptiert.)
//   4. In DFBnet/beim Verband die Weiterleitungs-Adresse als Kontakt hinterlegen –
//      alle Benachrichtigungen landen dann automatisch im Vereins-Posteingang.
//
// Sicherheit: Ohne gueltiges Secret (Query-Param `secret` oder Header
// `x-inbound-secret`) wird abgewiesen. Es wird NUR an contactRequests angehaengt;
// die App merged Arrays per id, daher gehen parallele App-Schreibvorgaenge nicht verloren.
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SERVICE_KEY  = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
const SECRET       = Deno.env.get("INBOUND_MAIL_SECRET") || "";
const SK           = Deno.env.get("APP_DATA_KEY") || "vereinsapp_v14";
const MAX_REQUESTS = 300; // Posteingang-Deckel je Verein

const admin = createClient(SUPABASE_URL, SERVICE_KEY, { auth: { persistSession: false } });

const uid = () => Math.random().toString(36).slice(2, 10) + Date.now().toString(36);

async function parseBody(req: Request): Promise<{ from: string; subject: string; text: string }> {
  const ct = req.headers.get("content-type") || "";
  if (ct.includes("application/json")) {
    const j = await req.json().catch(() => ({}));
    return {
      from: String(j.from || j.sender || j.From || ""),
      subject: String(j.subject || j.Subject || ""),
      text: String(j.text || j["body-plain"] || j.body || j.html || ""),
    };
  }
  // Mailgun & Co. senden multipart/form-data bzw. urlencoded
  const fd = await req.formData().catch(() => null);
  if (fd) {
    return {
      from: String(fd.get("sender") || fd.get("from") || ""),
      subject: String(fd.get("subject") || ""),
      text: String(fd.get("body-plain") || fd.get("stripped-text") || fd.get("text") || ""),
    };
  }
  return { from: "", subject: "", text: await req.text().catch(() => "") };
}

Deno.serve(async (req) => {
  if (req.method !== "POST") return new Response("method not allowed", { status: 405 });
  const url = new URL(req.url);
  const given = url.searchParams.get("secret") || req.headers.get("x-inbound-secret") || "";
  if (!SECRET || given !== SECRET) return new Response("forbidden", { status: 403 });

  const club = (url.searchParams.get("club") || "").trim();
  if (!club) return new Response("missing ?club=<cid>", { status: 400 });

  const mail = await parseBody(req);
  if (!mail.from && !mail.subject && !mail.text) return new Response("empty mail", { status: 400 });

  const key = `${SK}__club_${club}`;
  const fromLow = mail.from.toLowerCase();
  const isDfb = /dfbnet|dfb\.de|fussball\.de/.test(fromLow);
  const entry = {
    id: uid(),
    cid: club,
    fromName: (isDfb ? "DFBnet: " : "E-Mail: ") + (mail.from || "unbekannt"),
    fromEmail: mail.from,
    msg: [mail.subject && `Betreff: ${mail.subject}`, mail.text.slice(0, 4000)].filter(Boolean).join("\n\n"),
    ts: new Date().toISOString(),
    read: false,
    blocked: false,
    mail: true,
  };

  // Optimistic Locking: Der Shard wird als Ganzes geschrieben. Damit ein
  // paralleler App-Save (z. B. neuer Termin) nicht von unserem veralteten
  // Snapshot ueberschrieben wird, schreiben wir nur, wenn updated_at noch dem
  // gelesenen Stand entspricht - sonst frisch lesen und erneut versuchen.
  for (let attempt = 0; attempt < 4; attempt++) {
    const { data: rows, error } = await admin.from("app_data").select("key, value, updated_at").eq("key", key).limit(1);
    if (error) return new Response("db error: " + error.message, { status: 500 });
    if (!rows || !rows.length) return new Response("unknown club", { status: 404 });

    const value: any = rows[0].value || {};
    const next = [...(Array.isArray(value.contactRequests) ? value.contactRequests : []), entry].slice(-MAX_REQUESTS);
    let q = admin
      .from("app_data")
      .update({ value: { ...value, contactRequests: next }, updated_at: new Date().toISOString() })
      .eq("key", key);
    q = rows[0].updated_at == null ? q.is("updated_at", null) : q.eq("updated_at", rows[0].updated_at);
    const { data: upd, error: werr } = await q.select("key");
    if (werr) return new Response("write error: " + werr.message, { status: 500 });
    if (upd && upd.length) return new Response(JSON.stringify({ ok: true, id: entry.id }), { headers: { "content-type": "application/json" } });
    await new Promise((r) => setTimeout(r, 300 * (attempt + 1)));
  }
  return new Response("conflict, retry later", { status: 409 });
});
