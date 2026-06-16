// =====================================================================
// Edge Function: james
// ---------------------------------------------------------------------
// Server-seitiger Proxy für den KI-Assistenten „James" (Controlling).
// Hält den Anthropic-API-Key serverseitig (NIE im Browser) und schützt
// vor Missbrauch:
//   • Modell-Allowlist + Deckel für max_tokens
//   • Größenlimit für die Anfrage
//   • Rate-Limit pro IP (rl_hit-RPC, service_role)
//
// Aufruf vom Browser (controlling/index.html):
//   POST /functions/v1/james
//   { "model": "...", "max_tokens": 1000, "messages": [...] }
//
// Deploy:  verify_jwt = false  (CORS-Preflight + Demo-Nutzung ohne Login;
//          die Funktion macht ihre eigenen Checks). Secret setzen:
//          supabase secrets set ANTHROPIC_API_KEY=sk-ant-...
// =====================================================================
import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "jsr:@supabase/supabase-js@2";

const ANTHROPIC_KEY = Deno.env.get("ANTHROPIC_API_KEY") ?? "";
const SUPABASE_URL = Deno.env.get("SUPABASE_URL") ?? "";
const SERVICE_ROLE = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "";

const ALLOWED_MODELS = new Set([
  "claude-sonnet-4-6",
  "claude-haiku-4-5-20251001",
  "claude-opus-4-8",
]);
const DEFAULT_MODEL = "claude-sonnet-4-6";
const MAX_TOKENS_CAP = 1500;     // Deckel je Antwort
const MAX_BODY_CHARS = 24000;    // max. Länge der messages (JSON)
const RL_MAX = 40;               // Anfragen ...
const RL_WINDOW = 3600;          // ... je Stunde und IP

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

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: CORS });
  if (req.method !== "POST") return json({ error: "method_not_allowed" }, 405);
  if (!ANTHROPIC_KEY) {
    return json({ error: "not_configured", message: "ANTHROPIC_API_KEY fehlt – James läuft offline." }, 503);
  }

  // Rate-Limit pro IP
  const ip = (req.headers.get("x-forwarded-for") || "").split(",")[0].trim() || "unknown";
  if (SUPABASE_URL && SERVICE_ROLE) {
    try {
      const admin = createClient(SUPABASE_URL, SERVICE_ROLE, { auth: { persistSession: false } });
      const { data: allowed, error } = await admin.rpc("rl_hit", {
        p_bucket: "james:" + ip, p_max: RL_MAX, p_window: RL_WINDOW,
      });
      if (!error && allowed === false) {
        return json({ error: "rate_limited", message: "Zu viele Anfragen – bitte später erneut." }, 429);
      }
    } catch { /* Rate-Limit darf den Dienst nicht blockieren */ }
  }

  let payload: any;
  try { payload = await req.json(); } catch { return json({ error: "bad_json" }, 400); }

  const messages = Array.isArray(payload?.messages) ? payload.messages : null;
  if (!messages || !messages.length) return json({ error: "bad_request", message: "messages fehlt" }, 400);
  if (JSON.stringify(messages).length > MAX_BODY_CHARS) {
    return json({ error: "too_large", message: "Anfrage zu groß." }, 413);
  }
  const model = ALLOWED_MODELS.has(payload?.model) ? payload.model : DEFAULT_MODEL;
  const max_tokens = Math.min(Math.max(Number(payload?.max_tokens) || 1000, 1), MAX_TOKENS_CAP);

  try {
    const r = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": ANTHROPIC_KEY,
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify({ model, max_tokens, messages }),
    });
    const data = await r.json();
    return json(data, r.status);
  } catch (e) {
    return json({ error: "upstream", message: String(e) }, 502);
  }
});
