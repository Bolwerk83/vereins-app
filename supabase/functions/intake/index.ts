// =====================================================================
// Edge Function: intake
// ---------------------------------------------------------------------
// Nimmt die öffentlichen Inserts des Hubs entgegen (Tracking, Newsletter,
// Bewertungen) und schreibt sie server-seitig per service_role – mit
// Rate-Limit pro IP und Art. So lässt sich der direkte anon-Insert
// abschalten (siehe supabase/harden_inserts_cutover.sql) und Missbrauch
// (Flooding) wirksam begrenzen.
//
//   POST /functions/v1/intake
//   { "kind": "event"|"lead"|"review", ...felder }
//
// Deploy: verify_jwt = false (CORS-Preflight + öffentlicher Aufruf;
// eigene Validierung + Rate-Limit). SUPABASE_URL/SERVICE_ROLE_KEY sind
// in Edge Functions automatisch verfügbar.
// =====================================================================
import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "jsr:@supabase/supabase-js@2";

const SUPABASE_URL = Deno.env.get("SUPABASE_URL") ?? "";
const SERVICE_ROLE = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "";

// Rate-Limits je Art: [maxTreffer, fensterSekunden] pro IP
const LIMITS: Record<string, [number, number]> = {
  event: [200, 3600],
  lead: [5, 3600],
  review: [10, 3600],
};

const CORS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};
const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { ...CORS, "Content-Type": "application/json" },
  });

// String beschneiden (oder null) – spiegelt die DB-Längen-Constraints.
const str = (v: unknown, n: number): string | null =>
  typeof v === "string" && v.trim() ? v.trim().slice(0, n) : null;

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: CORS });
  if (req.method !== "POST") return json({ error: "method_not_allowed" }, 405);
  if (!SUPABASE_URL || !SERVICE_ROLE) return json({ error: "not_configured" }, 503);

  let body: any;
  try { body = await req.json(); } catch { return json({ error: "bad_json" }, 400); }

  const kind = String(body?.kind || "");
  const lim = LIMITS[kind];
  if (!lim) return json({ error: "bad_kind" }, 400);

  const admin = createClient(SUPABASE_URL, SERVICE_ROLE, { auth: { persistSession: false } });
  const ip = (req.headers.get("x-forwarded-for") || "").split(",")[0].trim() || "unknown";
  try {
    const { data: ok } = await admin.rpc("rl_hit", { p_bucket: kind + ":" + ip, p_max: lim[0], p_window: lim[1] });
    if (ok === false) return json({ error: "rate_limited" }, 429);
  } catch { /* Rate-Limit darf den Dienst nicht blockieren */ }

  try {
    if (kind === "event") {
      const type = str(body.type, 40);
      if (!type) return json({ error: "bad_event" }, 400);
      await admin.from("site_events").insert([{
        type,
        session_id: str(body.session_id, 64),
        path: str(body.path, 200),
        device: str(body.device, 20),
        referrer: str(body.referrer, 200),
        app_id: str(body.app_id, 80),
      }]);
    } else if (kind === "lead") {
      const email = str(body.email, 200);
      if (!email || !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) return json({ error: "bad_email" }, 400);
      await admin.from("site_leads").insert([{
        email,
        app: str(body.app, 80),
        source: str(body.source, 40) || "landing",
      }]);
    } else if (kind === "review") {
      const app_id = str(body.app_id, 80);
      if (!app_id) return json({ error: "bad_review" }, 400);
      const ratingNum = Number(body.rating);
      const rating = Number.isInteger(ratingNum) && ratingNum >= 1 && ratingNum <= 5 ? ratingNum : null;
      await admin.from("site_reviews").insert([{
        app_id,
        rating,
        name: str(body.name, 120),
        comment: str(body.comment, 2000),
        session_id: str(body.session_id, 64),
      }]);
    }
    return json({ ok: true });
  } catch (e) {
    return json({ error: "insert_failed", message: String(e) }, 500);
  }
});
