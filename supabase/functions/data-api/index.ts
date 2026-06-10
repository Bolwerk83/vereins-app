// Supabase Edge Function: data-api
// Türsteher zwischen App und Datenbank. Hält den service_role-Key (geheim).
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SERVICE_KEY  = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!; // GEHEIM
const APP_SECRET   = Deno.env.get("APP_TOKEN_SECRET")!;          // GEHEIM (selbst gewählt)

const SK = "vereinsapp_v14";
const glKey   = `${SK}__global`;
const clubKey = (cid: string) => `${SK}__club_${cid}`;

const admin = createClient(SUPABASE_URL, SERVICE_KEY, {
  auth: { persistSession: false },
});

// --- kleine Token-Helfer (HMAC-signiert, wie ein Mini-JWT) ---
const enc = new TextEncoder();
async function hmac(data: string): Promise<string> {
  const key = await crypto.subtle.importKey(
    "raw", enc.encode(APP_SECRET),
    { name: "HMAC", hash: "SHA-256" }, false, ["sign"],
  );
  const sig = await crypto.subtle.sign("HMAC", key, enc.encode(data));
  return btoa(String.fromCharCode(...new Uint8Array(sig)));
}
async function makeToken(cid: string): Promise<string> {
  const body = btoa(JSON.stringify({ cid, exp: Date.now() + 1000 * 60 * 60 * 12 })); // 12h
  return `${body}.${await hmac(body)}`;
}
async function readToken(token: string): Promise<{ cid: string } | null> {
  try {
    const [body, sig] = token.split(".");
    if (!body || !sig) return null;
    if (await hmac(body) !== sig) return null;          // Signatur falsch
    const data = JSON.parse(atob(body));
    if (!data.exp || Date.now() > data.exp) return null; // abgelaufen
    return { cid: data.cid };
  } catch { return null; }
}

// --- Passwortprüfung: identisch zur App (SHA-256 mit Präfix "s", Legacy "h", Klartext) ---
async function sha256hex(s: string): Promise<string> {
  const buf = await crypto.subtle.digest("SHA-256", enc.encode(s));
  return [...new Uint8Array(buf)].map(b => b.toString(16).padStart(2, "0")).join("");
}
function legacyHash(pw: string): string {
  let h = 0;
  for (let i = 0; i < pw.length; i++) h = (Math.imul(31, h) + pw.charCodeAt(i)) | 0;
  return "h" + Math.abs(h).toString(36);
}
async function checkPw(input: string, stored: string): Promise<boolean> {
  if (!stored) return false;
  const inp = (input || "").trim();
  if (stored.startsWith("s")) return ("s" + await sha256hex("vapp.v1." + inp)) === stored;
  if (stored.startsWith("h")) return legacyHash(inp) === stored;
  return inp === stored;
}

const cors = {
  "Access-Control-Allow-Origin": "*", // ➜ in Produktion auf deine Vercel-Domain einschränken!
  "Access-Control-Allow-Headers": "content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};
const json = (obj: unknown, status = 200) =>
  new Response(JSON.stringify(obj), { status, headers: { ...cors, "Content-Type": "application/json" } });

async function getRow(key: string) {
  const { data } = await admin.from("app_data").select("value").eq("key", key).maybeSingle();
  return data?.value ?? null;
}
async function setRow(key: string, value: unknown) {
  await admin.from("app_data").upsert({ key, value, updated_at: new Date().toISOString() });
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: cors });
  let p: any;
  try { p = await req.json(); } catch { return json({ error: "bad json" }, 400); }
  const action = p.action;

  // 1) VERZEICHNIS: Vereinsliste (nur leichte Metadaten). Bewusst ohne Token lesbar,
  //    damit Familien ihren Verein finden. Enthält KEINE Kinderdaten.
  if (action === "getDirectory") {
    return json({ global: await getRow(glKey) });
  }

  // 2) LOGIN: prüft ein Passwort gegen die in der Vereinszeile gespeicherten Hashes.
  //    typ: "admin" | "trainer" | "team"
  if (action === "login") {
    const { cid, typ, id, password } = p;
    const club = await getRow(clubKey(cid));
    const glob = await getRow(glKey);
    if (!club) return json({ error: "unknown club" }, 404);
    let ok = false;
    if (typ === "admin") {
      const c = (glob?.clubs || []).find((c: any) => c.id === cid);
      ok = await checkPw(password, c?.adm || "");
    } else if (typ === "trainer") {
      const tr = (club.trainers || []).find((t: any) => t.id === id);
      ok = await checkPw(password, tr?.pw || "");
    } else if (typ === "team") {
      const tm = (club.teams || []).find((t: any) => t.id === id);
      ok = await checkPw(password, tm?.pwd || "");
    }
    if (!ok) return json({ error: "wrong password" }, 401);
    return json({ token: await makeToken(cid) });
  }

  // Ab hier: Token nötig
  const auth = await readToken(p.token || "");
  if (!auth) return json({ error: "no/invalid token" }, 401);

  // 3) VEREIN LADEN: nur der eigene Verein
  if (action === "getClub") {
    if (auth.cid !== p.cid) return json({ error: "forbidden" }, 403);
    return json({ global: await getRow(glKey), club: await getRow(clubKey(p.cid)) });
  }

  // 4) VEREIN SPEICHERN: nur der eigene Verein
  if (action === "setClub") {
    if (auth.cid !== p.cid) return json({ error: "forbidden" }, 403);
    // p.club = die kompletten Vereinsdaten (eine Zeile)
    await setRow(clubKey(p.cid), p.club);

    // 🔶 KNIFFLIGE STELLE: die gemeinsame Verzeichnis-Zeile __global enthält die
    //    Metadaten ALLER Vereine. Ein einzelner Verein darf NICHT die ganze Zeile
    //    überschreiben (sonst löscht er die anderen). Wir mischen daher nur den
    //    EIGENEN Eintrag in das bestehende global hinein.
    if (p.clubMeta) {
      const glob = await getRow(glKey) || { clubs: [] };
      const others = (glob.clubs || []).filter((c: any) => c.id !== p.cid);
      glob.clubs = [...others, p.clubMeta];
      await setRow(glKey, glob);
    }
    return json({ ok: true });
  }

  // ===== SuperAdmin (Service-Role, umgeht RLS) =====
  // Auth ueber das SuperAdmin-Passwort (Hash in app_secret.sa_password_hash,
  // reines sha256 wie check_sa_password). Wird gebraucht, sobald die RLS pro
  // Verein verschaerft ist und der SuperAdmin nicht mehr alle Zeilen sieht.
  if (action && typeof action === "string" && action.startsWith("sa.")) {
    const { data: sec } = await admin.from("app_secret").select("sa_password_hash").eq("id", 1).maybeSingle();
    const stored = sec?.sa_password_hash;
    if (!stored || (await sha256hex(p.password || "")) !== stored) return json({ error: "sa auth" }, 401);

    if (action === "sa.list") {
      const { data } = await admin.from("app_data").select("key,updated_at,value").order("updated_at", { ascending: false });
      return json({ rows: data || [] });
    }
    if (action === "sa.delete") {
      await admin.from("app_data").delete().eq("key", p.key);
      return json({ ok: true });
    }
    if (action === "sa.set") {
      const rows = (p.rows || []).map((r: any) => ({ key: r.key, value: r.value, updated_at: new Date().toISOString() }));
      if (rows.length) await admin.from("app_data").upsert(rows);
      return json({ ok: true });
    }
    if (action === "sa.setClubCode") {
      if (!p.cid || !p.code) return json({ error: "cid/code fehlt" }, 400);
      await admin.from("app_club_secret").upsert({ cid: p.cid, code_hash: await sha256hex(p.code) });
      return json({ ok: true });
    }
    if (action === "sa.deleteClub") {
      const cid = p.cid;
      await admin.from("app_data").delete().eq("key", clubKey(cid));      // Shard
      const glob = await getRow(glKey) || { clubs: [] };
      glob.clubs = (glob.clubs || []).filter((c: any) => c.id !== cid);   // aus Verzeichnis
      await setRow(glKey, glob);
      try { await admin.from("app_members").delete().eq("cid", cid); } catch {}
      try { await admin.from("app_club_secret").delete().eq("cid", cid); } catch {}
      return json({ ok: true });
    }
    return json({ error: "unknown sa action" }, 400);
  }

  return json({ error: "unknown action" }, 400);
});
