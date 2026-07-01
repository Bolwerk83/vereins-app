// ═══ Vereins-App - Push Notifications (PWA Web Push) ═══
// Eigenstaendiges Modul, das ein kleines Glocken-Symbol unten rechts
// einblendet und ein Einstellungs-Sheet oeffnet. Liest die Supabase-Verbindung
// aus localStorage ("vereinsapp_config"), die Session aus sessionStorage und
// die zwischengespeicherten App-Daten aus localStorage ("vereinsapp_v14").

import React, { useState, useEffect, useCallback } from "react";

// VAPID Public Key (zu dem privaten Schluessel in den Supabase Edge Function Secrets).
export const VAPID_PUBLIC_KEY =
  "BAiX4eqLOJ_HAqEpTshi67K6HNgynFpzaYmfeiLn9eGhPEYzoC7LKNaTU_wS0iw5dSIYgawt_AbOwrCbP1TN5ZA";

const DATA_KEY = "vereinsapp_v14";
const SESS_KEY = "vereinsapp_v12_session"; // muss zur App passen (SS in App.jsx)
const CFG_KEY  = "vereinsapp_config";
const SUB_PREF = "va_push_local"; // letzter bekannter Endpoint + Prefs
const LANG_KEY = "vereinsapp_lang"; // muss zur App passen (LANG_KEY in App.jsx)

// ── Eigenstaendige i18n (das Modul lebt ausserhalb der App-LangCtx) ──────────
const I18N = {
  de: {
    notConnected:"Supabase ist nicht verbunden.",
    notSupported:"Push wird auf diesem Gerät nicht unterstützt.",
    blocked:"Du hast Benachrichtigungen blockiert. Bitte in den Browser-Einstellungen freigeben.",
    permDenied:"Erlaubnis verweigert.",
    enableFirst:"Erst Benachrichtigungen aktivieren.",
    testFailed:"Test fehlgeschlagen",
    activated:"Aktiviert.",
    deactivated:"Deaktiviert.",
    testSent:"Test gesendet – sollte gleich ankommen.",
    testNoRecip:"Gesendet, aber 0 Empfänger. Push wirklich aktiviert?",
    bell:"Benachrichtigungen",
    title:"Benachrichtigungen",
    intro:"Erinnerungen an Termine, Abstimmungen und Chat-Nachrichten.",
    unsupportedDevice:"Dieses Gerät / diese Browser-Version unterstützt keine Push-Benachrichtigungen.",
    iosHint1:"Auf dem iPhone muss die App zuerst zum ",
    iosHintBold:"Home-Bildschirm",
    iosHint2:" hinzugefügt werden (Safari → Teilen-Icon → „Zum Home-Bildschirm“). Danach die App von dort öffnen und hier nochmal auf „Aktivieren“ tippen.",
    deniedHint:"Du hast Benachrichtigungen für diese Seite blockiert. In den Browser-/iOS-Einstellungen wieder freigeben.",
    turnOff:"Auf diesem Gerät ausschalten",
    turnOn:"Auf diesem Gerät aktivieren",
    testBtn:"🔔 Test-Benachrichtigung an dieses Gerät",
    testSub:"Schickt dir sofort eine Push, um zu prüfen ob alles funktioniert.",
    whatReaches:"Was soll mich erreichen?",
    voteRem:"Erinnerungen wenn ich noch nicht abgestimmt habe",
    voteRemSub:"3 Tage vor dem Termin, danach täglich",
    morning:"Morgens am Tag des Termins",
    morningSub:"Nur wenn du zugesagt hast – mit motivierendem Spruch",
    chatMsg:"Neue Chat-Nachrichten",
    evTypes:"Termin-Arten",
    muteEvents:"Einzelne Termine stummschalten",
    event:"Termin",
    muted:"stumm",
    onLabel:"an",
    close:"Schließen",
    training:"Training", heimspiel:"Heimspiel", auswarts:"Auswärts", freundschaft:"Freundschaft", turnier:"Turnier", sondertermin:"Sondertermin",
  },
  en: {
    notConnected:"Supabase is not connected.",
    notSupported:"Push is not supported on this device.",
    blocked:"You have blocked notifications. Please allow them in your browser settings.",
    permDenied:"Permission denied.",
    enableFirst:"Enable notifications first.",
    testFailed:"Test failed",
    activated:"Enabled.",
    deactivated:"Disabled.",
    testSent:"Test sent – it should arrive shortly.",
    testNoRecip:"Sent, but 0 recipients. Is push really enabled?",
    bell:"Notifications",
    title:"Notifications",
    intro:"Reminders for events, votes and chat messages.",
    unsupportedDevice:"This device / browser version does not support push notifications.",
    iosHint1:"On iPhone, the app must first be added to the ",
    iosHintBold:"Home Screen",
    iosHint2:" (Safari → Share icon → “Add to Home Screen”). Then open the app from there and tap “Enable” here again.",
    deniedHint:"You have blocked notifications for this site. Allow them again in your browser / iOS settings.",
    turnOff:"Turn off on this device",
    turnOn:"Turn on on this device",
    testBtn:"🔔 Test notification to this device",
    testSub:"Sends you a push right away to check everything works.",
    whatReaches:"What should reach me?",
    voteRem:"Reminders when I haven't voted yet",
    voteRemSub:"3 days before the event, then daily",
    morning:"On the morning of the event",
    morningSub:"Only if you accepted – with a motivating line",
    chatMsg:"New chat messages",
    evTypes:"Event types",
    muteEvents:"Mute individual events",
    event:"Event",
    muted:"muted",
    onLabel:"on",
    close:"Close",
    training:"Training", heimspiel:"Home game", auswarts:"Away game", freundschaft:"Friendly", turnier:"Tournament", sondertermin:"Special event",
  },
  nl: {
    notConnected:"Supabase is niet verbonden.",
    notSupported:"Push wordt op dit apparaat niet ondersteund.",
    blocked:"Je hebt meldingen geblokkeerd. Sta ze toe in je browserinstellingen.",
    permDenied:"Toestemming geweigerd.",
    enableFirst:"Schakel eerst meldingen in.",
    testFailed:"Test mislukt",
    activated:"Ingeschakeld.",
    deactivated:"Uitgeschakeld.",
    testSent:"Test verstuurd – zou zo moeten aankomen.",
    testNoRecip:"Verstuurd, maar 0 ontvangers. Staat push echt aan?",
    bell:"Meldingen",
    title:"Meldingen",
    intro:"Herinneringen voor afspraken, stemmingen en chatberichten.",
    unsupportedDevice:"Dit apparaat / deze browserversie ondersteunt geen pushmeldingen.",
    iosHint1:"Op de iPhone moet de app eerst aan het ",
    iosHintBold:"Beginscherm",
    iosHint2:" worden toegevoegd (Safari → Deel-icoon → “Zet op beginscherm”). Open de app daarna van daaruit en tik hier opnieuw op “Inschakelen”.",
    deniedHint:"Je hebt meldingen voor deze site geblokkeerd. Sta ze weer toe in je browser-/iOS-instellingen.",
    turnOff:"Uitschakelen op dit apparaat",
    turnOn:"Inschakelen op dit apparaat",
    testBtn:"🔔 Testmelding naar dit apparaat",
    testSub:"Stuurt je meteen een push om te controleren of alles werkt.",
    whatReaches:"Wat moet mij bereiken?",
    voteRem:"Herinneringen als ik nog niet gestemd heb",
    voteRemSub:"3 dagen voor de afspraak, daarna dagelijks",
    morning:"'s Ochtends op de dag van de afspraak",
    morningSub:"Alleen als je hebt toegezegd – met een motiverende zin",
    chatMsg:"Nieuwe chatberichten",
    evTypes:"Soorten afspraken",
    muteEvents:"Losse afspraken dempen",
    event:"Afspraak",
    muted:"gedempt",
    onLabel:"aan",
    close:"Sluiten",
    training:"Training", heimspiel:"Thuiswedstrijd", auswarts:"Uitwedstrijd", freundschaft:"Vriendschappelijk", turnier:"Toernooi", sondertermin:"Speciale afspraak",
  },
};
function getLang(){ try { const l = localStorage.getItem(LANG_KEY); return I18N[l] ? l : "de"; } catch { return "de"; } }
function tr(key){ const l = getLang(); return (I18N[l] && I18N[l][key]) ?? I18N.de[key] ?? key; }

// ── Helpers ─────────────────────────────────────────────────
// Fest eingebaute Standard-Verbindung – identisch zu DEFAULT_CFG in App.jsx.
// Ohne diesen Fallback meldete der Testknopf "Supabase ist nicht verbunden",
// weil die App die Default-Verbindung nutzt und nichts in den localStorage schreibt.
const DEFAULT_CFG = {
  url: "https://phpkyzujpvrsypqqptlv.supabase.co",
  key: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBocGt5enVqcHZyc3lwcXFwdGx2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODA0MjA2MjAsImV4cCI6MjA5NTk5NjYyMH0.t7wCh6Juzkn9cyshpy78ZfJ_G9ji8pko_v1hoOzui8w"
};
function safeJSON(s) { try { return JSON.parse(s); } catch { return null; } }
function getConfig()  { const v = safeJSON(localStorage.getItem(CFG_KEY)); return (v && v.url && v.key) ? v : DEFAULT_CFG; }
function getSession() { return safeJSON(sessionStorage.getItem(SESS_KEY)) || {}; }
function getData()    { return safeJSON(localStorage.getItem(DATA_KEY))  || {}; }
function getLocalPref(){ return safeJSON(localStorage.getItem(SUB_PREF))  || {}; }
function setLocalPref(p){ try { localStorage.setItem(SUB_PREF, JSON.stringify(p)); } catch {} }

function urlBase64ToUint8Array(base64String) {
  const padding = "=".repeat((4 - (base64String.length % 4)) % 4);
  const b64 = (base64String + padding).replace(/-/g, "+").replace(/_/g, "/");
  const raw = atob(b64);
  const out = new Uint8Array(raw.length);
  for (let i = 0; i < raw.length; i++) out[i] = raw.charCodeAt(i);
  return out;
}

// ── Supabase RPC (anon) ────────────────────────────────────
async function rpc(name, params) {
  const c = getConfig();
  if (!c.url || !c.key) throw new Error(tr("notConnected"));
  const r = await fetch(`${c.url}/rest/v1/rpc/${name}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "apikey": c.key,
      "Authorization": "Bearer " + c.key,
    },
    body: JSON.stringify(params),
  });
  if (!r.ok) throw new Error(`${name} -> ${r.status}`);
  try { return await r.json(); } catch { return null; }
}

// ── Subscribe / Unsubscribe ────────────────────────────────
export async function subscribePush() {
  if (!("serviceWorker" in navigator) || !("PushManager" in window))
    throw new Error(tr("notSupported"));
  if (Notification.permission === "denied")
    throw new Error(tr("blocked"));
  if (Notification.permission !== "granted") {
    const perm = await Notification.requestPermission();
    if (perm !== "granted") throw new Error(tr("permDenied"));
  }
  const reg = await navigator.serviceWorker.ready;
  let sub = await reg.pushManager.getSubscription();
  if (!sub) {
    sub = await reg.pushManager.subscribe({
      userVisibleOnly: true,
      applicationServerKey: urlBase64ToUint8Array(VAPID_PUBLIC_KEY),
    });
  }
  const j = sub.toJSON();
  const s = getSession();
  await rpc("subscribe_push", {
    p_endpoint: j.endpoint,
    p_p256dh: j.keys?.p256dh,
    p_auth:   j.keys?.auth,
    p_cid: s.cid || null,
    p_tid: s.tid || (Array.isArray(s.tids) && s.tids.length === 1 ? s.tids[0] : null),
    p_player_name: s.user || s.name || null,
  });
  setLocalPref({ endpoint: j.endpoint });
  return j.endpoint;
}

export async function unsubscribePush() {
  if (!("serviceWorker" in navigator)) return;
  const reg = await navigator.serviceWorker.ready;
  const sub = await reg.pushManager.getSubscription();
  if (sub) {
    try { await rpc("unsubscribe_push", { p_endpoint: sub.endpoint }); } catch {}
    await sub.unsubscribe();
  }
  setLocalPref({});
}

// Testpush an genau dieses Geraet (ruft die notify-Edge-Function im Modus "test").
export async function testPush() {
  const c = getConfig();
  if (!c.url || !c.key) throw new Error("Supabase ist nicht verbunden.");
  let { endpoint } = getLocalPref();
  if (!endpoint && "serviceWorker" in navigator) {
    try { const reg = await navigator.serviceWorker.ready; const sub = await reg.pushManager.getSubscription(); endpoint = sub?.endpoint; } catch {}
  }
  if (!endpoint) throw new Error(tr("enableFirst"));
  const r = await fetch(`${c.url}/functions/v1/notify`, {
    method: "POST",
    headers: { "Content-Type": "application/json", "apikey": c.key, "Authorization": "Bearer " + c.key },
    body: JSON.stringify({ mode: "test", endpoint }),
  });
  if (!r.ok) throw new Error(tr("testFailed") + " (" + r.status + ")");
  return await r.json().catch(() => ({}));
}

export async function updatePrefs(prefs) {
  const { endpoint } = getLocalPref();
  if (!endpoint) return;
  await rpc("update_push_prefs", {
    p_endpoint:           endpoint,
    p_enabled:            prefs.enabled            ?? null,
    p_reminders_vote:     prefs.reminders_vote     ?? null,
    p_reminders_morning:  prefs.reminders_morning  ?? null,
    p_chat:               prefs.chat               ?? null,
    p_disabled_types:     prefs.disabled_types     ?? null,
    p_muted_events:       prefs.muted_events       ?? null,
  });
}

// ── UI: kleines Glocken-Symbol unten rechts ────────────────
const COL = "#16a34a";
const isStandalone = () =>
  (typeof window !== "undefined") &&
  (window.matchMedia?.("(display-mode: standalone)")?.matches ||
   window.navigator?.standalone === true);
const isIOS = () =>
  typeof navigator !== "undefined" &&
  /iPad|iPhone|iPod/.test(navigator.userAgent) && !window.MSStream;

const EVENT_TYPES = [
  ["training",     "training"],
  ["heimspiel",    "heimspiel"],
  ["auswarts",     "auswarts"],
  ["freundschaft", "freundschaft"],
  ["turnier",      "turnier"],
  ["event",        "sondertermin"],
];

export function NotifMount() {
  const [open, setOpen] = useState(false);
  const [perm, setPerm] = useState(typeof Notification !== "undefined" ? Notification.permission : "default");
  const [subbed, setSubbed] = useState(false);
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState(null);
  const [prefs, setPrefs] = useState({
    enabled: true, reminders_vote: true, reminders_morning: true, chat: true,
    disabled_types: [], muted_events: [],
  });
  const [sess, setSess] = useState(getSession());

  useEffect(() => {
    (async () => {
      if (!("serviceWorker" in navigator)) return;
      try {
        const reg = await navigator.serviceWorker.ready;
        const sub = await reg.pushManager.getSubscription();
        setSubbed(!!sub);
        if (sub) setLocalPref({ endpoint: sub.endpoint });
      } catch {}
    })();
    const onFocus = () => setSess(getSession());
    window.addEventListener("focus", onFocus);
    return () => window.removeEventListener("focus", onFocus);
  }, []);

  const data = getData();
  const upcomingEvents = (data?.events || [])
    .filter(e => sess.tid ? e.tid === sess.tid : true)
    .filter(e => {
      const d = new Date(e.date + "T00:00:00").getTime();
      const today = new Date(new Date().toISOString().slice(0,10) + "T00:00:00").getTime();
      return d >= today && d <= today + 1000*60*60*24*30; // 30 Tage
    })
    .sort((a,b)=>String(a.date).localeCompare(String(b.date)))
    .slice(0, 12);

  // Nichts anzeigen, wenn keine Session laeuft.
  if (!sess.cid) return null;

  const fire = (m) => { setMsg(m); setTimeout(() => setMsg(null), 2500); };

  const onEnable = async () => {
    setBusy(true);
    try { await subscribePush(); setSubbed(true); setPerm(Notification.permission); fire(tr("activated")); }
    catch (e) { fire(String(e.message || e)); }
    finally { setBusy(false); }
  };
  const onDisable = async () => {
    setBusy(true);
    try { await unsubscribePush(); setSubbed(false); fire(tr("deactivated")); }
    catch (e) { fire(String(e.message || e)); }
    finally { setBusy(false); }
  };
  const onTest = async () => {
    setBusy(true);
    try { const j = await testPush(); fire(j?.sent ? tr("testSent") : tr("testNoRecip")); }
    catch (e) { fire(String(e.message || e)); }
    finally { setBusy(false); }
  };
  const togglePref = async (key, val) => {
    const next = { ...prefs, [key]: val };
    setPrefs(next);
    try { await updatePrefs({ [key]: val }); } catch {}
  };
  const toggleType = async (t) => {
    const has = prefs.disabled_types.includes(t);
    const next = has ? prefs.disabled_types.filter(x=>x!==t) : [...prefs.disabled_types, t];
    const np = { ...prefs, disabled_types: next };
    setPrefs(np);
    try { await updatePrefs({ disabled_types: next }); } catch {}
  };
  const toggleMute = async (id) => {
    const has = prefs.muted_events.includes(id);
    const next = has ? prefs.muted_events.filter(x=>x!==id) : [...prefs.muted_events, id];
    const np = { ...prefs, muted_events: next };
    setPrefs(np);
    try { await updatePrefs({ muted_events: next }); } catch {}
  };

  const supported = ("serviceWorker" in navigator) && ("PushManager" in window);
  const needsHomescreen = isIOS() && !isStandalone();

  return (
    <>
      <button
        aria-label={tr("bell")}
        onClick={() => setOpen(true)}
        style={{
          position:"fixed", right:14, bottom:"calc(78px + env(safe-area-inset-bottom))", zIndex:9000,
          width:52, height:52, borderRadius:"50%", border:"none",
          background: subbed ? COL : "rgba(15,23,42,.86)",
          color:"#fff", fontSize:20, cursor:"pointer",
          boxShadow:"0 6px 18px rgba(0,0,0,.3)", fontFamily:"inherit",
        }}>{subbed ? "🔔" : "🔕"}</button>

      {open && (
        <div onClick={()=>setOpen(false)}
          style={{position:"fixed", inset:0, background:"rgba(0,0,0,.55)", zIndex:9001,
                  display:"flex", alignItems:"flex-end", justifyContent:"center", backdropFilter:"blur(6px)"}}>
          <div onClick={e=>e.stopPropagation()}
            style={{background:"#fff", borderRadius:"22px 22px 0 0", width:"100%", maxWidth:520,
                    maxHeight:"86dvh", overflowY:"auto", padding:"10px 20px 36px",
                    fontFamily:"'Plus Jakarta Sans',sans-serif"}}>
            <div style={{display:"flex",justifyContent:"center",marginBottom:10}}>
              <div style={{width:40,height:4,borderRadius:99,background:"#e2e8f0"}}/>
            </div>
            <h3 style={{fontWeight:900,fontSize:18,color:"#0f172a",margin:"0 0 4px"}}>{tr("title")}</h3>
            <p style={{fontSize:13,color:"#64748b",margin:"0 0 14px"}}>
              {tr("intro")}
            </p>

            {!supported && (
              <Info color="#dc2626">
                {tr("unsupportedDevice")}
              </Info>
            )}
            {supported && needsHomescreen && (
              <Info color="#d97706">
                {tr("iosHint1")}<b>{tr("iosHintBold")}</b>{tr("iosHint2")}
              </Info>
            )}
            {supported && perm === "denied" && (
              <Info color="#dc2626">
                {tr("deniedHint")}
              </Info>
            )}

            <div style={{display:"flex",gap:8,marginTop:6,marginBottom:subbed?8:14}}>
              {subbed
                ? <Btn label={tr("turnOff")} onClick={onDisable} busy={busy} kind="ghost"/>
                : <Btn label={tr("turnOn")}  onClick={onEnable}  busy={busy} kind="primary"/>}
            </div>
            {subbed && (
              <div style={{marginBottom:14}}>
                <Btn label={tr("testBtn")} onClick={onTest} busy={busy} kind="primary"/>
                <p style={{fontSize:11.5,color:"#64748b",margin:"6px 2px 0",lineHeight:1.4}}>{tr("testSub")}</p>
              </div>
            )}

            <Section title={tr("whatReaches")}>
              <Sw label={tr("voteRem")}
                  sub={tr("voteRemSub")}
                  on={prefs.reminders_vote}
                  onChange={v=>togglePref("reminders_vote", v)}/>
              <Sw label={tr("morning")}
                  sub={tr("morningSub")}
                  on={prefs.reminders_morning}
                  onChange={v=>togglePref("reminders_morning", v)}/>
              <Sw label={tr("chatMsg")}
                  on={prefs.chat}
                  onChange={v=>togglePref("chat", v)}/>
            </Section>

            <Section title={tr("evTypes")}>
              <div style={{display:"flex",flexWrap:"wrap",gap:6}}>
                {EVENT_TYPES.map(([k,lbl]) => {
                  const off = prefs.disabled_types.includes(k);
                  return (
                    <button key={k} onClick={()=>toggleType(k)}
                      style={{padding:"7px 12px",borderRadius:99,border:"1.5px solid "+(off?"#e2e8f0":COL),
                              background:off?"#fff":COL+"18",color:off?"#64748b":COL,
                              fontWeight:700,fontSize:13,cursor:"pointer",fontFamily:"inherit"}}>
                      {off ? "✕ " : "✓ "}{tr(lbl)}
                    </button>
                  );
                })}
              </div>
            </Section>

            {upcomingEvents.length > 0 && (
              <Section title={tr("muteEvents")}>
                <div style={{display:"flex",flexDirection:"column",gap:6}}>
                  {upcomingEvents.map(e => {
                    const muted = prefs.muted_events.includes(e.id);
                    return (
                      <button key={e.id} onClick={()=>toggleMute(e.id)}
                        style={{display:"flex",alignItems:"center",gap:10,
                                padding:"10px 12px",borderRadius:11,
                                border:"1.5px solid #e2e8f0",background:"#fff",
                                cursor:"pointer",textAlign:"left",fontFamily:"inherit"}}>
                        <div style={{fontSize:18}}>{muted ? "🔕" : "🔔"}</div>
                        <div style={{flex:1,minWidth:0}}>
                          <div style={{fontSize:13,fontWeight:700,color:"#0f172a"}}>
                            {e.title || tr("event")}
                          </div>
                          <div style={{fontSize:11,color:"#64748b"}}>
                            {e.date}{e.time ? " " + e.time : ""}
                          </div>
                        </div>
                        <div style={{fontSize:12,fontWeight:700,color:muted ? "#64748b" : COL}}>
                          {muted ? tr("muted") : tr("onLabel")}
                        </div>
                      </button>
                    );
                  })}
                </div>
              </Section>
            )}

            {msg && (
              <div style={{marginTop:10,fontSize:13,fontWeight:600,color:"#0f172a",
                           background:"#f0fdf4",borderRadius:10,padding:"8px 12px"}}>{msg}</div>
            )}

            <button onClick={()=>setOpen(false)}
              style={{marginTop:18,width:"100%",padding:"12px",borderRadius:13,
                      border:"1.5px solid #e2e8f0",background:"#fff",color:"#475569",
                      fontWeight:700,fontSize:14,cursor:"pointer",fontFamily:"inherit"}}>
              {tr("close")}
            </button>
          </div>
        </div>
      )}
    </>
  );
}

function Section({ title, children }) {
  return (
    <div style={{marginTop:14}}>
      <div style={{fontSize:11,fontWeight:800,color:"#64748b",letterSpacing:.5,
                   textTransform:"uppercase",marginBottom:8}}>{title}</div>
      {children}
    </div>
  );
}
function Btn({ label, onClick, busy, kind }) {
  const prim = kind === "primary";
  return (
    <button onClick={onClick} disabled={busy}
      style={{flex:1,padding:"12px 14px",borderRadius:13,
              border: prim ? "none" : "1.5px solid #e2e8f0",
              background: prim ? COL : "#fff",
              color: prim ? "#fff" : "#475569",
              fontWeight:800,fontSize:14,cursor: busy ? "default" : "pointer",
              opacity: busy ? .6 : 1, fontFamily:"inherit"}}>
      {busy ? "..." : label}
    </button>
  );
}
function Sw({ label, sub, on, onChange }) {
  return (
    <div style={{display:"flex",alignItems:"center",gap:10,padding:"10px 0",
                 borderBottom:"1px solid #f1f5f9"}}>
      <div style={{flex:1}}>
        <div style={{fontSize:14,fontWeight:700,color:"#0f172a"}}>{label}</div>
        {sub && <div style={{fontSize:12,color:"#64748b",marginTop:2}}>{sub}</div>}
      </div>
      <div onClick={()=>onChange(!on)}
        style={{width:46,height:26,borderRadius:99,background:on?COL:"#cbd5e1",
                cursor:"pointer",position:"relative",flexShrink:0,transition:"background .2s"}}>
        <div style={{width:20,height:20,borderRadius:"50%",background:"#fff",
                     position:"absolute",top:3,left:on?23:3,transition:"left .2s",
                     boxShadow:"0 2px 6px rgba(0,0,0,.2)"}}/>
      </div>
    </div>
  );
}
function Info({ color, children }) {
  return (
    <div style={{background:color+"14",border:"1.5px solid "+color+"44",borderRadius:12,
                 padding:"10px 12px",fontSize:13,color,lineHeight:1.5,marginBottom:12,fontFamily:"inherit"}}>
      {children}
    </div>
  );
}
