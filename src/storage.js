// ----------------------------------------------------------------
// Speicher-/Sync-Schicht: Supabase-Anbindung (sb), Sitzung (sess),
// lokaler Spiegel (localGet/localSet), Datennormalisierung (normData)
// und Vereins-Sharding-Konstanten. Kein React.
// ----------------------------------------------------------------
import { splitData, mergeData, merge3Obj } from "./data.js";
import { applyFeatureFlags } from "./features.js";

export const SK  = "vereinsapp_v14";
export const SS  = "vereinsapp_v12_session";
export const CFG = "vereinsapp_config";
// Fest eingebaute Verbindung: jedes Gerät verbindet sich automatisch mit der Vereins-Datenbank.
// Der anon-Key ist bauartbedingt öffentlich (steckt ohnehin im ausgelieferten Browser-Code).
// Echter Datenschutz erfolgt über Zugriffsregeln (RLS) in der Datenbank, nicht über Geheimhaltung dieses Keys.
export const DEFAULT_CFG = {
  url: "https://phpkyzujpvrsypqqptlv.supabase.co",
  key: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBocGt5enVqcHZyc3lwcXFwdGx2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODA0MjA2MjAsImV4cCI6MjA5NTk5NjYyMH0.t7wCh6Juzkn9cyshpy78ZfJ_G9ji8pko_v1hoOzui8w"
};
export const getConfig = () => { try { const v=JSON.parse(localStorage.getItem(CFG)||"null"); return (v&&v.url&&v.key)?v:DEFAULT_CFG; } catch { return DEFAULT_CFG; } };
export const setConfig = c => { try { localStorage.setItem(CFG,JSON.stringify(c)); } catch {} };
// ----------------------------------------------------------------
// Daten-Trennung pro Verein (Phase 1: Schreib-Isolation).
// Jeder Verein wird in einer eigenen Zeile gespeichert. Beim Speichern
// schreibt ein Verein nur seine eigene Zeile -> kann andere nicht überschreiben.
// splitData/mergeData sind GENERISCH und verlustfrei: jeder Datensatz wird
// genau einem Verein zugeordnet (über cid bzw. Team-Zugehörigkeit); alles,
// was keinem bekannten Verein zuzuordnen ist, landet in der globalen Zeile.
// ----------------------------------------------------------------
// splitData/mergeData/merge3* sind nach src/data.js ausgelagert (testbar) und
// werden oben importiert.

// ----------------------------------------------------------------
// Auth: anonymer Login + Vereinscode → Mitgliedschaft (gegen RLS).
// Token wird in localStorage gehalten; bei 401 wird automatisch
// neu angemeldet, bei 403 wird die Mitgliedschaft eingelöst.
// ----------------------------------------------------------------
export const JOIN_CODE = "r3EDDDJf0t4U4Zep8_tTXw";
const AUTH_KEY  = SK + "__auth";

// Mandanten-Trennung (mehrere Vereine isoliert) - siehe docs/mandanten-trennung.md.
// Default AUS = bisheriges Verhalten (ein globaler Vereinscode). Erst auf true
// stellen, NACHDEM supabase/schema-multitenant.sql deployt und je Verein ein
// Code gesetzt wurde - sonst sperrt sich die App aus.
export const MULTI_TENANT = false;

export const auth = {
  _s: null,
  _load() {
    if (this._s) return this._s;
    try { this._s = JSON.parse(localStorage.getItem(AUTH_KEY) || "null"); }
    catch { this._s = null; }
    return this._s;
  },
  _save(s) {
    try { localStorage.setItem(AUTH_KEY, JSON.stringify(s)); } catch {}
    this._s = s;
  },
  _clear() {
    try { localStorage.removeItem(AUTH_KEY); } catch {}
    this._s = null;
  },
  async getToken() {
    const cfg = getConfig();
    if (!cfg?.url || !cfg?.key) return null;
    const s = this._load();
    const now = Math.floor(Date.now() / 1000);
    if (s?.access_token && s?.expires_at && s.expires_at > now + 60) return s.access_token;
    // Refresh wenn möglich
    if (s?.refresh_token) {
      try {
        const r = await fetch(`${cfg.url}/auth/v1/token?grant_type=refresh_token`, {
          method: "POST",
          headers: { "Content-Type":"application/json","apikey": cfg.key },
          body: JSON.stringify({ refresh_token: s.refresh_token }),
        });
        if (r.ok) {
          const d = await r.json();
          const ns = {
            ...(s||{}),
            access_token: d.access_token,
            refresh_token: d.refresh_token,
            expires_at: d.expires_at || (now + (d.expires_in||3600)),
            user_id: d.user?.id || s.user_id,
          };
          this._save(ns);
          return ns.access_token;
        }
      } catch {}
    }
    // Anonyme Anmeldung (Supabase: "Allow anonymous sign-ins" muss aktiv sein)
    try {
      const r = await fetch(`${cfg.url}/auth/v1/signup`, {
        method: "POST",
        headers: { "Content-Type":"application/json","apikey": cfg.key },
        body: JSON.stringify({}),
      });
      if (r.ok) {
        const d = await r.json();
        const at = d.access_token || d.session?.access_token;
        const rt = d.refresh_token || d.session?.refresh_token;
        if (at) {
          const ns = {
            access_token: at,
            refresh_token: rt,
            expires_at: d.expires_at || d.session?.expires_at || (now + 3600),
            user_id: d.user?.id || d.id,
            is_member: false,
          };
          this._save(ns);
          return at;
        }
      }
    } catch {}
    return null;
  },
  async ensureMember() {
    const cfg = getConfig();
    const token = await this.getToken();
    if (!token) return false;
    const s = this._load();
    if (s?.is_member) return true;
    try {
      const r = await fetch(`${cfg.url}/rest/v1/rpc/redeem_code`, {
        method: "POST",
        headers: {
          "Content-Type":"application/json",
          "apikey": cfg.key,
          "Authorization":"Bearer "+token,
        },
        body: JSON.stringify({ p_code: JOIN_CODE }),
      });
      if (r.ok) {
        const ok = await r.json();
        if (ok === true) {
          this._save({ ...(s||{}), is_member: true });
          return true;
        }
      }
    } catch {}
    return false;
  },
  // Multi-Tenant: Mitgliedschaft fuer GENAU einen Verein einloesen.
  // Versucht zuerst die neue Signatur redeem_code(p_cid,p_code); faellt das
  // RPC (altes Schema) weg, wird auf redeem_code(p_code) zurueckgefallen.
  async joinClub(cid, code) {
    const cfg = getConfig();
    const token = await this.getToken();
    if (!token) return false;
    const hdr = { "Content-Type":"application/json","apikey":cfg.key,"Authorization":"Bearer "+token };
    const call = async (body) => {
      try {
        const r = await fetch(`${cfg.url}/rest/v1/rpc/redeem_code`, { method:"POST", headers:hdr, body:JSON.stringify(body) });
        if (r.status===404) return { missing:true, ok:false };
        if (!r.ok) return { ok:false };
        const v = await r.json(); return { ok: v===true };
      } catch { return { ok:false }; }
    };
    let res = await call({ p_cid: cid, p_code: code || JOIN_CODE });
    if (res.missing) res = await call({ p_code: code || JOIN_CODE }); // altes Schema
    if (res.ok) {
      const s = this._load() || {};
      const cids = new Set(s.cids || []); if (cid) cids.add(cid);
      this._save({ ...s, is_member:true, cids:[...cids] });
      return true;
    }
    return false;
  },
  isMemberOf(cid) {
    const s = this._load();
    if (!s) return false;
    if (!MULTI_TENANT) return !!s.is_member;
    return !!(s.cids || []).includes(cid);
  },
};

// ----------------------------------------------------------------
// Normalisierung: stellt sicher, dass jedes Lese-Ergebnis die
// erwarteten Array-/Objekt-Felder hat. Verhindert Crashes wie
// "data.events.filter is not a function", wenn nur das Verzeichnis
// (skinny global) geladen ist und ein einzelner Verein-View
// auf events/chats/... zugreift.
// ----------------------------------------------------------------
export const _DATA_ARRAYS = [
  "events","chats","messages","helpers","teams","trainers",
  "playerProfiles","trainings","fields","bookings",
  "contactRequests","securityLog","seasons","pollTemplates",
  "clubs","news","newsItems","photos","broadcasts","treasuries","liveEvents",
  "trainerMsgs","cashbook","waitlist","drillFeedback",
  "tacticBoards","trainingPlans","venues"
];
export const normData = (d) => {
  if (!d || typeof d !== "object") return d;
  const o = { ...d };
  for (const k of _DATA_ARRAYS) if (!Array.isArray(o[k])) o[k] = [];
  if (!o.players || typeof o.players !== "object" || Array.isArray(o.players)) o.players = {};
  // Global gepflegte Modul-Schalter (SuperAdmin -> Rollout) fuer feat() uebernehmen
  applyFeatureFlags(o.featureFlags);
  return o;
};

export const sb = {
  _url: () => getConfig()?.url,
  _key: () => getConfig()?.key,
  _glKey: SK+"__global",
  _clubKey: cid => SK+"__club_"+cid,
  _lastWrite: null,
  _writing: false,
  _snap: {}, // letzter gelesener Roh-Zeilenwert je key (Basis fuer 3-Wege-Merge)
  // Header mit Bearer-Token aus auth (fällt auf anon-Key zurück, wenn Auth noch nicht da).
  _hdr: async () => {
    const cfg = getConfig();
    const t = await auth.getToken();
    return {
      "Content-Type":"application/json",
      "apikey": cfg.key,
      "Authorization":"Bearer "+(t || cfg.key),
    };
  },
  // Fetch mit Auto-Retry. Beim Kaltstart kann die frisch eingeloeste
  // Mitgliedschaft noch nicht durch die RLS-Pruefung propagiert sein -
  // deshalb 403 bis zu 3x mit kurzem Delay nachfassen.
  _fetch: async (path, init={}, attempt=0) => {
    const cfg = getConfig();
    if (!cfg?.url || !cfg?.key) throw new Error("DB nicht konfiguriert");
    const hdr = await sb._hdr();
    const r = await fetch(cfg.url+path, { ...init, headers: { ...hdr, ...(init.headers||{}) } });
    if (attempt >= 3) return r;
    if (r.status === 401) {
      auth._clear();
      await new Promise(res=>setTimeout(res, 150*(attempt+1)));
      return sb._fetch(path, init, attempt+1);
    }
    if (r.status === 403) {
      const ok = await auth.ensureMember();
      // Auch wenn ensureMember (noch) false liefert: kurz warten und erneut
      // versuchen - der Insert braucht u.U. einen Moment bis er sichtbar ist.
      await new Promise(res=>setTimeout(res, 250*(attempt+1)));
      if (ok || attempt < 2) return sb._fetch(path, init, attempt+1);
    }
    return r;
  },
  _migrate: async () => {
    try {
      const r = await sb._fetch(`/rest/v1/app_data?key=eq.${SK}&select=value`);
      if (r.ok) {
        const rows = await r.json();
        const legacy = rows[0]?.value;
        if (legacy) { await sb.set(legacy); return legacy; }
      }
    } catch {}
    return null;
  },
  get: async () => {
    try {
      const r = await sb._fetch(`/rest/v1/app_data?key=like.${SK}__*&select=key,value`);
      if (r.ok) {
        const rows = await r.json();
        if (rows && rows.length) {
          rows.forEach(x=>{ sb._snap[x.key]=x.value; });
          const gl = rows.find(x=>x.key===sb._glKey)?.value || {};
          const shardRows = rows.filter(x=>x.key!==sb._glKey).map(x=>x.value);
          const merged = normData(mergeData(gl, shardRows));
          localSet(merged);
          return merged;
        }
        const m = await sb._migrate();
        if (m) return normData(m);
        return null;
      }
      return null; // Cloud antwortet, sperrt aber (401/403) - kein Local-Cache zeigen
    } catch {
      return normData(localGet()); // Netzwerk-Aus - Offline-Cache
    }
  },
  getDirectory: async () => {
    try {
      const r = await sb._fetch(`/rest/v1/app_data?key=eq.${sb._glKey}&select=value`);
      if (r.ok) {
        const rows = await r.json();
        if (rows[0]?.value) { sb._snap[sb._glKey]=rows[0].value; return normData(rows[0].value); }
        const m = await sb._migrate();
        if (m) { const { global } = splitData(m); return normData(global); }
        // Cloud ist erreichbar, aber wirklich leer - das Init darf seedn.
        return { __cloudEmpty: true };
      }
      return null; // Cloud erreichbar, aber RLS/Auth blockt -> NICHT seeden, sonst Datenverlust
    } catch {
      return normData(localGet());
    }
  },
  getClub: async (cid) => {
    try {
      const r = await sb._fetch(`/rest/v1/app_data?or=(key.eq.${sb._glKey},key.eq.${sb._clubKey(cid)})&select=key,value`);
      if (r.ok) {
        const rows = await r.json();
        if (rows && rows.length) {
          rows.forEach(x=>{ sb._snap[x.key]=x.value; });
          const gl = rows.find(x=>x.key===sb._glKey)?.value || {};
          const shard = rows.find(x=>x.key===sb._clubKey(cid))?.value || {};
          return normData(mergeData(gl, [shard]));
        }
        const m = await sb._migrate();
        if (m) { const { global, shards } = splitData(m); return normData(mergeData(global, [shards[cid]||{}])); }
        return null;
      }
      return null;
    } catch {
      return normData(localGet());
    }
  },
  // set(d): schreibt erst in die Cloud; localStorage wird erst nach Erfolg aktualisiert.
  // Offline-Nachtrag: gescheiterte Netzwerk-Writes werden lokal gesichert und
  // vom 10s-Sync erneut geschrieben (3-Wege-Merge verhindert Ueberschreiben).
  _pendKey: SK + "_pendingSync",
  hasPending: () => { try { return !!localStorage.getItem(sb._pendKey); } catch { return false; } },
  _markPending: (d) => { try { localSet(d); localStorage.setItem(sb._pendKey, new Date().toISOString()); } catch {} },
  clearPending: () => { try { localStorage.removeItem(sb._pendKey); } catch {} },
  set: async (d, cid=null) => {
    const cfg = getConfig();
    if (!cfg?.url || !cfg?.key) {
      sb._lastWrite = { ok:false, status:0, error:"keine DB konfiguriert", at:Date.now() };
      return sb._lastWrite;
    }
    const { global, shards } = splitData(d);
    const ts = new Date().toISOString();
    // Ein leerer Shard ({}) bedeutet: für diesen Verein sind KEINE Detaildaten
    // geladen (z.B. beim Speichern aus dem Directory). Ihn per Upsert zu schreiben
    // würde die echten Cloud-Daten (Teams/Spieler/Events) dieses Vereins mit {}
    // überschreiben. Solche leeren Shards werden daher nie geschrieben.
    const hasData = obj => obj && Object.keys(obj).length > 0;
    let rows = [{ key: sb._glKey, value: global, updated_at: ts }];
    if (cid) {
      if (hasData(shards[cid])) rows.push({ key: sb._clubKey(cid), value: shards[cid], updated_at: ts });
    } else {
      for (const id of Object.keys(shards)) {
        if (hasData(shards[id])) rows.push({ key: sb._clubKey(id), value: shards[id], updated_at: ts });
      }
    }
    // Schreibvorgang markieren: der Hintergrund-Sync darf den lokalen Stand
    // NICHT mit einem aelteren Cloud-Read ueberschreiben, solange ein Write
    // laeuft - sonst gehen frisch angelegte Vereine wieder verloren.
    sb._writing = true;
    try {
      // 3-Wege-Merge: frischen Cloud-Stand der zu schreibenden Zeilen lesen und
      // mit dem lokalen Stand zusammenfuehren, damit parallele Aenderungen anderer
      // Geraete nicht ueberschrieben werden. Nur mergen, wenn der Read GELANG.
      try {
        const inList = rows.map(x=>`"${x.key}"`).join(",");
        const rr = await sb._fetch(`/rest/v1/app_data?key=in.(${inList})&select=key,value`);
        if (rr.ok) {
          const cur = await rr.json();
          const cloudByKey = {}; cur.forEach(x=>{ cloudByKey[x.key]=x.value; });
          rows = rows.map(x=>{
            if (!(x.key in cloudByKey)) return x; // Zeile existiert noch nicht -> unveraendert anlegen
            return { ...x, value: merge3Obj(sb._snap[x.key], cloudByKey[x.key], x.value) };
          });
        }
      } catch {}
      const r = await sb._fetch(`/rest/v1/app_data`, {
        method:"POST",
        headers: { "Prefer":"resolution=merge-duplicates" },
        body: JSON.stringify(rows),
      });
      if (!r.ok) {
        let txt=""; try{ txt=await r.text(); }catch{}
        sb._lastWrite = { ok:false, status:r.status, error:(txt||"").slice(0,400), at:Date.now() };
        return sb._lastWrite;
      }
      localSet(d); // Cache erst nach Cloud-Erfolg
      sb.clearPending(); // evtl. offene Offline-Aenderungen sind jetzt in der Cloud
      rows.forEach(x=>{ sb._snap[x.key]=x.value; }); // Snapshot = neuer Cloud-Stand
      sb._lastWrite = { ok:true, status:r.status, error:"", at:Date.now() };
      return sb._lastWrite;
    } catch (e) {
      // Netzwerk weg (Sportplatz!): Stand lokal sichern und als "nachzutragen"
      // markieren - der Hintergrund-Sync schreibt ihn, sobald Verbindung da ist.
      sb._markPending(d);
      sb._lastWrite = { ok:false, status:0, error:String((e&&e.message)||e).slice(0,400), at:Date.now() };
      return sb._lastWrite;
    } finally {
      sb._writing = false;
    }
  },
  // Verifiziert, dass eine Club-ID wirklich im Cloud-Stand auftaucht.
  // Wird nach onNewClub aufgerufen, um "lokal scheinbar gespeichert,
  // aber nicht in Cloud" zu erkennen.
  verifyClubInCloud: async (clubId) => {
    try {
      const r = await sb._fetch(`/rest/v1/app_data?key=eq.${sb._glKey}&select=value`);
      if (!r.ok) return { ok:false, reason:`HTTP ${r.status}` };
      const rows = await r.json();
      const val = rows[0]?.value;
      if (!val) return { ok:false, reason:"keine Cloud-Antwort" };
      const found = (val.clubs||[]).some(c=>c?.id===clubId);
      return found ? { ok:true } : { ok:false, reason:"Club fehlt in Cloud-Antwort" };
    } catch (e) {
      return { ok:false, reason:String((e&&e.message)||e).slice(0,200) };
    }
  },
  // Live-Health: einmaliger Connection-/Membership-Check
  health: async () => {
    const cfg = getConfig();
    if (!cfg?.url || !cfg?.key) return { online:false, member:false, reason:"keine Config" };
    try {
      const tok = await auth.getToken();
      if (!tok) return { online:false, member:false, reason:"kein Token" };
      const r = await sb._fetch(`/rest/v1/app_data?limit=1`);
      if (r.ok) return { online:true, member:true };
      if (r.status === 401) return { online:true, member:false, reason:"Token abgelaufen" };
      if (r.status === 403) return { online:true, member:false, reason:"keine Mitgliedschaft (Vereinscode)" };
      return { online:true, member:false, reason:`HTTP ${r.status}` };
    } catch (e) {
      return { online:false, member:false, reason:String((e&&e.message)||e).slice(0,200) };
    }
  },
  // SuperAdmin: alle app_data-Zeilen listen (key + updated_at + Wert)
  dbList: async () => {
    const r = await sb._fetch(`/rest/v1/app_data?select=key,updated_at,value&order=updated_at.desc`);
    if (!r.ok) throw new Error("HTTP "+r.status);
    return await r.json();
  },
  // SuperAdmin: eine Zeile loeschen
  dbDelete: async (key) => {
    const r = await sb._fetch(`/rest/v1/app_data?key=eq.${encodeURIComponent(key)}`, { method:"DELETE" });
    if (!r.ok) throw new Error("HTTP "+r.status);
    return true;
  },
  // SuperAdmin: Backup des kompletten Cloud-Stands erstellen.
  // Liest globale Zeile + alle __club_*-Shards und speichert sie unter
  // __backup_<ISO>.
  backupCreate: async () => {
    const list = await sb.dbList();
    const sk = SK;
    const payload = {
      createdAt: new Date().toISOString(),
      version: 1,
      rows: list
        .filter(r => r.key.startsWith(sk+"__") && !r.key.startsWith(sk+"__backup_") && !r.key.endsWith("__dbtest"))
        .map(r => ({ key: r.key, value: r.value, updated_at: r.updated_at })),
    };
    const stamp = new Date().toISOString().replace(/[:.]/g,"-").slice(0,19);
    const key = `${sk}__backup_${stamp}`;
    const r = await sb._fetch(`/rest/v1/app_data`, {
      method:"POST",
      headers:{ "Prefer":"resolution=merge-duplicates" },
      body: JSON.stringify([{ key, value: payload, updated_at: new Date().toISOString() }]),
    });
    if (!r.ok) throw new Error("HTTP "+r.status);
    return key;
  },
  // SuperAdmin: Backup wiederherstellen. Schreibt ALLE im Backup enthaltenen Zeilen
  // zurueck (UPSERT). Nicht im Backup enthaltene Zeilen bleiben unangetastet.
  backupRestore: async (key) => {
    const r = await sb._fetch(`/rest/v1/app_data?key=eq.${encodeURIComponent(key)}&select=value`);
    if (!r.ok) throw new Error("HTTP "+r.status);
    const rows = await r.json();
    const payload = rows[0]?.value;
    if (!payload || !Array.isArray(payload.rows)) throw new Error("Backup-Inhalt ungueltig");
    const ts = new Date().toISOString();
    const writeRows = payload.rows.map(r => ({ key: r.key, value: r.value, updated_at: ts }));
    const w = await sb._fetch(`/rest/v1/app_data`, {
      method:"POST",
      headers:{ "Prefer":"resolution=merge-duplicates" },
      body: JSON.stringify(writeRows),
    });
    if (!w.ok) throw new Error("HTTP "+w.status);
    return writeRows.length;
  },
  // SuperAdmin: Push-Subscriptions + Members zaehlen
  dbCounts: async () => {
    const out = {};
    try {
      const r1 = await sb._fetch(`/rest/v1/push_subscriptions?select=endpoint`, { headers:{ "Prefer":"count=exact" } });
      out.pushSubs = r1.headers.get("content-range")?.split("/")[1] || "?";
    } catch { out.pushSubs = "?"; }
    try {
      const r2 = await sb._fetch(`/rest/v1/app_members?select=user_id`, { headers:{ "Prefer":"count=exact" } });
      out.members = r2.headers.get("content-range")?.split("/")[1] || "?";
    } catch { out.members = "?"; }
    return out;
  },
  // RPC-Aufruf (Postgres-Function) - liefert das JSON-Ergebnis oder wirft.
  rpc: async (name, args = {}) => {
    const cfg = getConfig();
    if (!cfg?.url || !cfg?.key) throw new Error("DB nicht konfiguriert");
    const r = await sb._fetch(`/rest/v1/rpc/${name}`, {
      method: "POST",
      body: JSON.stringify(args),
    });
    if (!r.ok) {
      let t=""; try{ t=await r.text(); }catch{}
      throw new Error("RPC "+name+" "+r.status+" "+(t||"").slice(0,200));
    }
    return await r.json();
  },
  test: async (url, key) => {
    try {
      const r = await fetch(`${url}/rest/v1/app_data?limit=1`, {
        headers: { "apikey": key, "Authorization":"Bearer "+key },
      });
      return r.ok || r.status === 401 || r.status === 403 || r.status === 406;
    } catch { return false; }
  },
  selfTest: async () => {
    const cfg = getConfig();
    if (!cfg?.url || !cfg?.key) return { step:"config", ok:false, status:0, msg:"Keine Datenbank konfiguriert." };
    const tkey = SK+"__dbtest", tval = { t: Date.now() };
    let w;
    try {
      w = await sb._fetch(`/rest/v1/app_data`, {
        method:"POST",
        headers:{ "Prefer":"resolution=merge-duplicates" },
        body: JSON.stringify([{ key:tkey, value:tval, updated_at:new Date().toISOString() }]),
      });
    } catch (e) { return { step:"write", ok:false, status:0, msg:String((e&&e.message)||e) }; }
    if (!w.ok) { let t=""; try{ t=await w.text(); }catch{} return { step:"write", ok:false, status:w.status, msg:(t||"").slice(0,400) }; }
    let rd;
    try { rd = await sb._fetch(`/rest/v1/app_data?key=eq.${tkey}&select=value`); }
    catch (e) { return { step:"read", ok:false, status:0, msg:String((e&&e.message)||e) }; }
    if (!rd.ok) { let t=""; try{ t=await rd.text(); }catch{} return { step:"read", ok:false, status:rd.status, msg:(t||"").slice(0,400) }; }
    let rows=[]; try{ rows = await rd.json(); }catch{}
    if (!rows.length || rows[0]?.value?.t !== tval.t) return { step:"verify", ok:false, status:rd.status, msg:"Geschrieben, aber Zurücklesen lieferte den Wert nicht. Antwort: "+JSON.stringify(rows).slice(0,200) };
    return { step:"done", ok:true, status:w.status, msg:"Schreiben und Zurücklesen erfolgreich." };
  },
  fnTest: async () => {
    const cfg = getConfig();
    if (!cfg?.url) return { ok:false, status:0, msg:"Keine URL konfiguriert." };
    const fnUrl = `${cfg.url}/functions/v1/data-api`;
    try {
      const t = await auth.getToken();
      const r = await fetch(fnUrl, {
        method:"POST",
        headers:{ "Content-Type":"application/json","apikey":cfg.key,"Authorization":"Bearer "+(t || cfg.key) },
        body: JSON.stringify({ action:"getDirectory" }),
      });
      let txt=""; try{ txt = await r.text(); }catch{}
      if (!r.ok) return { ok:false, status:r.status, msg:(txt||"").slice(0,400) };
      return { ok:true, status:r.status, msg:(txt||"").slice(0,300) };
    } catch (e) { return { ok:false, status:0, msg:String((e&&e.message)||e) }; }
  },
};
export const localGet = () => { try { const v=localStorage.getItem(SK); return v?JSON.parse(v):null; } catch { return null; } };
export const localSet = d => { try { localStorage.setItem(SK,JSON.stringify(d)); } catch {} };

export const sess = {
  get: () => {
    try {
      const s = sessionStorage.getItem(SS) || localStorage.getItem(SS+"_persist");
      return s ? JSON.parse(s) : null;
    } catch { return null; }
  },
  set: (d, persist=false) => {
    try {
      sessionStorage.setItem(SS, JSON.stringify(d));
      if(persist) localStorage.setItem(SS+"_persist", JSON.stringify({...d,_exp:Date.now()+30*24*60*60*1000}));
    } catch {}
  },
  del: () => {
    try { sessionStorage.removeItem(SS); localStorage.removeItem(SS+"_persist"); } catch {}
  },
};
