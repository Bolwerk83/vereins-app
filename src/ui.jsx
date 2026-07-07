// ----------------------------------------------------------------
// Gemeinsames Fundament: Datums-/Format-Helfer, Saison-Logik-Kurzformen,
// Theme (TH/CSS), Event-Typen und die UI-Grundbausteine (Btn, Drawer,
// Tag, Av, Inp/Sel/Sw, PageHead, PillTabs, EmptyBox, ...).
// Wird von App.jsx und allen kuenftigen Feature-Modulen importiert.
// ----------------------------------------------------------------
import React, { useState, useEffect, useRef } from "react";
import { LANG_KEY, T, useT } from "./i18n.jsx";
import { getConfig, setConfig, DEFAULT_CFG, sb, MULTI_TENANT } from "./storage.js";
import { ACOLORS, acol, inits, contrast, mix, hashPw, checkPw } from "./util.js";

export const LANG_SWITCHER_ENABLED = true;
export function LangSwitcher({ lang,setLang }) {
  if(!LANG_SWITCHER_ENABLED) return null;
  const LANGS = [{id:"de",flag:"DE"},{id:"en",flag:"EN"},{id:"nl",flag:"NL"}];
  return (
    <div style={{display:"flex",gap:4}}>
      {LANGS.map(l=>(
        <button key={l.id} onClick={()=>{setLang(l.id);localStorage.setItem(LANG_KEY,l.id);}}
          style={{padding:"4px 8px",borderRadius:7,border:`1.5px solid ${lang===l.id?"rgba(255,255,255,.5)":"rgba(255,255,255,.15)"}`,background:lang===l.id?"rgba(255,255,255,.2)":"transparent",color:lang===l.id?"#fff":"rgba(255,255,255,.4)",fontWeight:800,fontSize:11,cursor:"pointer",fontFamily:"inherit"}}>
          {l.flag}
        </button>
      ))}
    </div>
  );
}

// Schwebender Sprachumschalter – auf JEDER Seite verfügbar (eigene dunkle Pille,
// damit DE/EN/NL auch auf hellen Hintergründen lesbar sind).
export function FloatingLangSwitcher({ lang,setLang }) {
  if(!LANG_SWITCHER_ENABLED) return null;
  return (
    <div style={{position:"fixed",top:"calc(env(safe-area-inset-top) + 10px)",right:10,zIndex:1200,
      background:"rgba(15,23,42,.82)",backdropFilter:"blur(8px)",border:"1px solid rgba(255,255,255,.16)",
      borderRadius:99,padding:"4px 6px",boxShadow:"0 4px 16px rgba(0,0,0,.28)"}}>
      <LangSwitcher lang={lang} setLang={setLang}/>
    </div>
  );
}

// Globale Schriftgröße (Lesbarkeit für ältere Nutzer). Wir skalieren die ganze
// Oberfläche per CSS-zoom, weil Schriftgrößen in der App in px hinterlegt sind.
export const FONT_KEY = "va_fontscale";
export const FONT_STEPS = [["A", 1], ["A⁺", 1.15], ["A⁺⁺", 1.3], ["A⁺⁺⁺", 1.5]];
export const getFontScale = () => { try { const v = parseFloat(localStorage.getItem(FONT_KEY)); return [1, 1.15, 1.3, 1.5].includes(v) ? v : 1; } catch { return 1; } };
export const applyFontScale = (s) => { try { document.documentElement.style.zoom = s === 1 ? "" : String(s); localStorage.setItem(FONT_KEY, String(s)); } catch {} };
export function FontScaleControl({ dark = false }) {
  const [cur, setCur] = useState(getFontScale);
  const set = (s) => { setCur(s); applyFontScale(s); };
  const idle = dark ? "rgba(255,255,255,.7)" : "#475569";
  const idleBd = dark ? "rgba(255,255,255,.25)" : "#e2e8f0";
  return (
    <div style={{ display: "flex", gap: 6, alignItems: "center", flexWrap: "wrap" }}>
      <span style={{ fontSize: 13, fontWeight: 700, color: dark ? "rgba(255,255,255,.75)" : "#64748b", marginRight: 2 }}>Schriftgröße</span>
      {FONT_STEPS.map(([l, s], i) => {
        const on = cur === s;
        return (
          <button key={s} onClick={() => set(s)} aria-label={"Schrift "+l}
            style={{ padding: "7px 14px", borderRadius: 10, border: `1.5px solid ${on ? "#16a34a" : idleBd}`, background: on ? "#16a34a" : "transparent", color: on ? "#fff" : idle, fontWeight: 800, fontSize: 13 + i * 3, cursor: "pointer", fontFamily: "inherit", lineHeight: 1 }}>{l}</button>
        );
      })}
    </div>
  );
}


export function SupabaseSetup({ onDone,onSkip }) {
  const [url,setUrl]       = useState(getConfig()?.url||"");
  const [key,setKey]       = useState(getConfig()?.key||"");
  const [status,setStatus] = useState(null); // null | "testing" | "ok" | "fail"

  const test = async () => {
    setStatus("testing");
    const ok = await sb.test(url.trim(),key.trim());
    if (ok) {
      setConfig({ url: url.trim(),key: key.trim() });
      setStatus("ok");
      setTimeout(onDone,900);
    } else {
      setStatus("fail");
    }
  };

  return (
    <div style={{minHeight:"100dvh",background:"linear-gradient(135deg,#0f172a,#1e3a5f)",display:"flex",alignItems:"center",justifyContent:"center",padding:22}}>
      <div style={{width:"100%",maxWidth:440}}>
        <div style={{textAlign:"center",marginBottom:28}}>
          <div style={{fontSize:52,marginBottom:10}}></div>
          <h1 style={{color:"#fff",fontSize:24,fontWeight:900,margin:"0 0 6px"}}>Datenbank verbinden</h1>
          <p style={{color:"rgba(255,255,255,.5)",fontSize:14}}>Verbinde Supabase für permanente Datenspeicherung</p>
        </div>

        <div style={{background:"rgba(255,255,255,.05)",borderRadius:20,padding:"24px",border:"1px solid rgba(255,255,255,.1)",marginBottom:16}}>
          {}
          <div style={{background:"rgba(255,255,255,.05)",borderRadius:12,padding:"14px",marginBottom:16,fontSize:12,color:"rgba(255,255,255,.6)",lineHeight:1.8}}>
            <div style={{fontWeight:800,color:"rgba(255,255,255,.8)",marginBottom:6,fontSize:13}}>Einrichtung (ca. 3 Min):</div>
            <div>1. <a href="https://supabase.com" target="_blank" rel="noopener" style={{color:"#38bdf8"}}>supabase.com</a> → kostenlosen Account erstellen</div>
            <div>2. "New project" → Region Frankfurt (EU) → Datenbank-Passwort setzen</div>
            <div>3. SQL Editor → folgendes ausführen:</div>
            <div style={{background:"rgba(0,0,0,.4)",borderRadius:8,padding:"10px",margin:"8px 0",fontFamily:"monospace",fontSize:11,color:"#86efac",lineHeight:1.6}}>
              CREATE TABLE app_data (<br/>
              &nbsp;&nbsp;key TEXT PRIMARY KEY,<br/>
              &nbsp;&nbsp;value JSONB,<br/>
              &nbsp;&nbsp;updated_at TIMESTAMPTZ DEFAULT NOW()<br/>
              );<br/>
              ALTER TABLE app_data ENABLE ROW LEVEL SECURITY;
            </div>
            <div>4. Settings → API → Project URL + anon key kopieren</div>
          </div>

          <div style={{background:"rgba(220,38,38,.12)",borderRadius:12,padding:"13px 15px",marginBottom:20,border:"1px solid rgba(248,113,113,.4)",fontSize:12,color:"#fca5a5",lineHeight:1.65}}>
            <div style={{fontWeight:900,color:"#fecaca",marginBottom:5,fontSize:12.5}}>⚠ Wichtig zum Datenschutz (besonders bei Kinderdaten)</div>
            <div style={{color:"rgba(254,202,202,.85)"}}>
              Mit dem obigen SQL ist die Tabelle <b>gesperrt</b> – ohne zusätzliche Regel kann <b>niemand</b> zugreifen, auch die App nicht. Du musst selbst festlegen, wer darf. Setze <b>keine</b> Regel, die allen alles erlaubt (z.&nbsp;B. <span style={{fontFamily:"monospace"}}>USING (true)</span>) – damit lägen alle Vereins- und Kinderdaten für jeden offen im Netz.
              <br/><br/>
              Für echten Schutz von Kinderdaten reicht diese App allein nicht aus. Lass das Datenbank-Setup von einer Person mit Datenschutz-Kenntnissen prüfen und kläre eine Einwilligung der Eltern. Diese App kann den Zugriff technisch nicht erzwingen – das passiert nur in der Datenbank.
            </div>
          </div>

          <div style={{display:"flex",flexDirection:"column",gap:10}}>
            <div>
              <div style={{fontSize:11,fontWeight:800,color:"rgba(255,255,255,.5)",marginBottom:5,letterSpacing:.5}}>SUPABASE PROJECT URL</div>
              <input value={url} onChange={e=>setUrl(e.target.value)} placeholder="https://xxxxx.supabase.co"
                style={{width:"100%",padding:"12px 14px",fontSize:14,background:"rgba(255,255,255,.08)",border:`1.5px solid ${status==="fail"?"#f87171":"rgba(255,255,255,.15)"}`,borderRadius:11,outline:"none",color:"#fff"}}/>
            </div>
            <div>
              <div style={{fontSize:11,fontWeight:800,color:"rgba(255,255,255,.5)",marginBottom:5,letterSpacing:.5}}>ANON PUBLIC KEY</div>
              <input value={key} onChange={e=>setKey(e.target.value)} placeholder="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
                style={{width:"100%",padding:"12px 14px",fontSize:14,background:"rgba(255,255,255,.08)",border:`1.5px solid ${status==="fail"?"#f87171":"rgba(255,255,255,.15)"}`,borderRadius:11,outline:"none",color:"#fff"}}/>
            </div>
          </div>

          {status==="testing"&&<div style={{marginTop:12,textAlign:"center",color:"#64748b",fontSize:13}}> Verbindung wird getestet...</div>}
          {status==="ok"&&<div style={{marginTop:12,background:"#052e16",border:"1.5px solid #16a34a",borderRadius:10,padding:"10px 14px",color:"#86efac",fontSize:13,fontWeight:700}}> Verbindung erfolgreich! App wird geladen...</div>}
          {status==="fail"&&<div style={{marginTop:12,background:"#450a0a",border:"1.5px solid #dc2626",borderRadius:10,padding:"10px 14px",color:"#fca5a5",fontSize:13,fontWeight:700}}> Verbindung fehlgeschlagen. URL und Key prüfen.</div>}

          <div style={{display:"flex",gap:9,marginTop:16}}>
            <button onClick={test} disabled={!url.trim()||!key.trim()||status==="testing"}
              style={{flex:2,padding:"13px",borderRadius:13,border:url.trim()&&key.trim()?"none":"1.5px solid rgba(255,255,255,.25)",background:url.trim()&&key.trim()?"#2563eb":"rgba(255,255,255,.16)",color:url.trim()&&key.trim()?"#fff":"rgba(255,255,255,.65)",fontWeight:800,fontSize:15,cursor:url.trim()&&key.trim()?"pointer":"default",fontFamily:"inherit",transition:"all .2s"}}>
               Verbinden & testen
            </button>
            <button onClick={onSkip}
              style={{flex:1,padding:"13px",borderRadius:13,border:"1px solid rgba(255,255,255,.15)",background:"transparent",color:"rgba(255,255,255,.4)",fontWeight:600,fontSize:14,cursor:"pointer",fontFamily:"inherit"}}>
              Überspringen
            </button>
          </div>
          <p style={{textAlign:"center",fontSize:11,color:"rgba(255,255,255,.25)",marginTop:10}}>
            Ohne Verbindung werden Daten im Browser-Speicher gesichert (gehen beim Löschen des Browsers verloren)
          </p>
        </div>

        {getConfig()&&(
          <div style={{background:"rgba(22,163,74,.15)",borderRadius:12,padding:"11px 14px",border:"1px solid rgba(22,163,74,.3)",fontSize:12,color:"#86efac",textAlign:"center"}}>
             Bereits verbunden mit {getConfig()?.url?.replace("https://","").split(".")[0]}
            <button onClick={()=>{setConfig(null);window.location.reload();}} style={{marginLeft:10,background:"none",border:"none",color:"#f87171",cursor:"pointer",fontSize:11,fontFamily:"inherit"}}>Trennen</button>
          </div>
        )}
      </div>
    </div>
  );
}

export const uid   = () => Math.random().toString(36).slice(2,9);

export const addMins = (time, mins) => {
  const [h,m] = (time||"09:00").split(":").map(Number);
  const total = h*60 + m + (mins||0);
  return String(Math.floor(total/60)%24).padStart(2,"0")+":"+String(total%60).padStart(2,"0");
};

// Ist ein Team in einer bestimmten Saison aktiv? Abgemeldete Teams (endedSid) bleiben in
// früheren Saisons sichtbar, verschwinden aber ab der Saison, in der sie abgemeldet wurden.
// Teams ohne startedSid/endedSid gelten als immer aktiv (Abwärtskompatibilität mit Bestandsdaten).
export const seasonIndex = (sid, seasons) => {
  if(!sid) return -1;
  const i=(seasons||[]).findIndex(s=>s.id===sid);
  return i; // -1 wenn unbekannt
};
export const isTeamActiveInSeason = (team, sid, seasons) => {
  if(!team) return false;
  if(!sid) return !team.endedSid; // ohne Saison-Kontext: nur nicht-abgemeldete
  const cur = seasonIndex(sid, seasons);
  // gestartet? (wenn startedSid gesetzt, muss aktuelle Saison >= Startsaison sein)
  if(team.startedSid){
    const st = seasonIndex(team.startedSid, seasons);
    if(st>=0 && cur>=0 && cur<st) return false; // Team gibt es in dieser (früheren) Saison noch nicht
  }
  // abgemeldet? (ab endedSid nicht mehr aktiv)
  if(team.endedSid){
    const en = seasonIndex(team.endedSid, seasons);
    if(en>=0 && cur>=0 && cur>=en) return false; // ab Abmelde-Saison nicht mehr aktiv
  }
  return true;
};
// Saisons eines Vereins. Bei MULTI_TENANT pro Verein (Saison traegt cid),
// sonst global wie bisher (verhaltensneutral bei ausgeschaltetem Flag).
export const clubSeasons = (data, cid) => {
  const all = (data && data.seasons) || [];
  return MULTI_TENANT ? all.filter(s=>!s.cid || s.cid===cid) : all;
};
// Aktive Saison-ID eines Vereins. Bei MULTI_TENANT zuerst cl.activeSeason,
// sonst das globale data.activeSeason (bisheriges Verhalten).
export const activeSid = (data, cid) => {
  const ss = clubSeasons(data, cid);
  const cl = MULTI_TENANT ? ((data && data.clubs)||[]).find(c=>c.id===cid) : null;
  return (cl && cl.activeSeason) || (data && data.activeSeason) || ss[0]?.id || null;
};
// bequemer Filter: aktive Teams eines Vereins in der aktiven Saison
export const activeTeamsFor = (data, cid) => {
  const sid = activeSid(data, cid);
  return (data.teams||[]).filter(tm=>tm.cid===cid && isTeamActiveInSeason(tm, sid, clubSeasons(data, cid)));
};


// Trainer-Einmalcode: 6 Zeichen, garantiert Buchstabe + Ziffer, ohne leicht
// verwechselbare Zeichen (O/0, I/1/l). Wird beim Anlegen/Teilen vergeben.
export function genTempPw(){
  const L="ABCDEFGHJKLMNPQRSTUVWXYZ", D="23456789", A=L+D;
  const pick = s => s[Math.floor(Math.random()*s.length)];
  let s = pick(L) + pick(D); for(let i=0;i<4;i++) s += pick(A);
  return s.split("").sort(()=>Math.random()-0.5).join("");
}
// Eigenes Trainer-Passwort: mind. 6 Zeichen, Buchstabe UND Ziffer.
export const validTrainerPw = pw => typeof pw==="string" && pw.trim().length>=6 && /[a-zA-Z]/.test(pw) && /[0-9]/.test(pw);

export const now   = () => new Date().toISOString().slice(0,10);
export const addD  = (iso,n) => { const d=new Date(iso+"T12:00:00"); d.setDate(d.getDate()+n); return d.toISOString().slice(0,10); };
export const addW  = (iso,n) => addD(iso,n*7);
export const fmtD  = iso => { const d=new Date(iso+"T12:00:00"); return `${["So","Mo","Di","Mi","Do","Fr","Sa"][d.getDay()]},${String(d.getDate()).padStart(2,"0")}.${String(d.getMonth()+1).padStart(2,"0")}.${d.getFullYear()}`; };

// ----------------------------------------------------------------
// Standort & Umkreis (Offline-Schätzung über die 2-stellige PLZ-Leitregion).
// Bewusst grob (±ca. 15-25 km) – reicht, um Turniere "in der Nähe" zu finden,
// ohne externen Dienst. Koordinaten = ungefährer Hauptort der Leitregion.
// ----------------------------------------------------------------
export const PLZ2_GEO = {
  "01":[51.05,13.74],"02":[51.18,14.43],"03":[51.76,14.33],"04":[51.34,12.37],"06":[51.48,11.97],
  "07":[50.88,11.59],"08":[50.72,12.49],"09":[50.83,12.92],"10":[52.52,13.40],"12":[52.45,13.45],
  "13":[52.57,13.35],"14":[52.40,13.06],"15":[52.34,14.55],"16":[52.83,13.24],"17":[53.56,13.26],
  "18":[54.09,12.14],"19":[53.63,11.41],"20":[53.55,9.99],"21":[53.25,10.41],"22":[53.59,9.93],
  "23":[53.87,10.69],"24":[54.32,10.14],"25":[54.20,9.40],"26":[53.14,8.21],"27":[53.55,8.58],
  "28":[53.08,8.80],"29":[52.93,10.08],"30":[52.37,9.73],"31":[52.15,9.95],"32":[52.12,8.68],
  "33":[51.72,8.75],"34":[51.31,9.49],"35":[50.58,8.68],"36":[50.55,9.68],"37":[51.53,9.93],
  "38":[52.27,10.52],"39":[52.13,11.63],"40":[51.23,6.78],"41":[51.19,6.42],"42":[51.26,7.18],
  "44":[51.51,7.47],"45":[51.45,7.01],"46":[51.50,6.86],"47":[51.43,6.76],"48":[51.96,7.63],
  "49":[52.28,8.05],"50":[50.94,6.96],"51":[51.03,7.02],"52":[50.78,6.08],"53":[50.74,7.10],
  "54":[49.75,6.64],"55":[50.00,8.27],"56":[50.36,7.59],"57":[50.88,8.02],"58":[51.36,7.47],
  "59":[51.68,7.82],"60":[50.11,8.68],"61":[50.23,8.62],"63":[50.10,8.77],"64":[49.87,8.65],
  "65":[50.08,8.24],"66":[49.24,6.99],"67":[49.44,7.77],"68":[49.49,8.47],"69":[49.40,8.67],
  "70":[48.78,9.18],"71":[48.90,9.19],"72":[48.52,9.06],"73":[48.70,9.65],"74":[49.14,9.22],
  "75":[48.89,8.70],"76":[49.01,8.40],"77":[48.47,7.94],"78":[48.06,8.46],"79":[47.99,7.85],
  "80":[48.14,11.58],"81":[48.11,11.60],"82":[48.00,11.35],"83":[47.86,12.12],"84":[48.54,12.15],
  "85":[48.40,11.42],"86":[48.37,10.90],"87":[47.73,10.31],"88":[47.78,9.61],"89":[48.40,9.99],
  "90":[49.45,11.08],"91":[49.30,10.99],"92":[49.45,12.16],"93":[49.01,12.10],"94":[48.57,13.43],
  "95":[50.00,11.60],"96":[49.89,10.90],"97":[49.79,9.95],"98":[50.61,10.69],"99":[50.98,11.03],
};
export const plzToGeo = plz => { const p=String(plz||"").trim().slice(0,2); return PLZ2_GEO[p]||null; };
// ── Wetter (Open-Meteo, kostenlos & ohne Schlüssel) ─────────────────────
// 8-Tage-Vorhersage für die Vereins-Region; 1× je Tag gecacht (localStorage).
export const wxIcon = c => c==null?"":c<=1?"☀️":c<=3?"⛅":c<=48?"🌫":c<=57?"🌦":c<=67?"🌧":c<=77?"🌨":c<=82?"🌦":c<=86?"🌨":"⛈";
export function useWeather(geo){
  const [wx,setWx]=useState(null);
  useEffect(()=>{
    if(!geo) return; let dead=false;
    const ck="wx_"+geo.join(",")+"_"+new Date().toISOString().slice(0,10);
    try{ const c=JSON.parse(localStorage.getItem("va_wx")||"null"); if(c&&c.key===ck){ setWx(c.data); return; } }catch{}
    fetch(`https://api.open-meteo.com/v1/forecast?latitude=${geo[0]}&longitude=${geo[1]}&daily=weather_code,temperature_2m_max,precipitation_probability_max&timezone=Europe%2FBerlin&forecast_days=8`)
      .then(r=>r.json())
      .then(j=>{ if(dead||!j?.daily?.time) return;
        const d={}; j.daily.time.forEach((tday,i)=>{ d[tday]={c:j.daily.weather_code?.[i], t:Math.round(j.daily.temperature_2m_max?.[i]), r:j.daily.precipitation_probability_max?.[i]??null}; });
        setWx(d); try{ localStorage.setItem("va_wx",JSON.stringify({key:ck,data:d})); }catch{}
      }).catch(()=>{});
    return ()=>{ dead=true; };
  },[geo&&geo.join(",")]);
  return wx;
}
export const geoDistanceKm = (a,b) => {
  if(!a||!b) return null;
  const R=6371, toR=d=>d*Math.PI/180;
  const dLat=toR(b[0]-a[0]), dLon=toR(b[1]-a[1]);
  const s=Math.sin(dLat/2)**2 + Math.cos(toR(a[0]))*Math.cos(toR(b[0]))*Math.sin(dLon/2)**2;
  return Math.round(R*2*Math.atan2(Math.sqrt(s),Math.sqrt(1-s)));
};

// Mannschafts-Stärke (neutral benannt) – für faires Turnier-Matchmaking.
export const TEAM_STRENGTHS = [
  { id:1, label:"Entwicklung", col:"#16a34a", desc:"Junge oder neue Mannschaft – Spaß, Lernen und Spielpraxis stehen im Vordergrund. Gegner auf Augenhöhe, damit alle Kinder erfolgreich mitspielen.", dfb:"Kinderfußball / Funino-Festival, Breitensport (keine Tabellen)" },
  { id:2, label:"Ambitioniert", col:"#2563eb", desc:"Eingespielte Mannschaft mit solidem Niveau – ausgeglichene, faire Spiele gegen ähnlich starke Teams.", dfb:"Breitensport / Kreisklasse" },
  { id:3, label:"Leistung", col:"#d97706", desc:"Leistungsorientierte Mannschaft – sucht anspruchsvolle, fordernde Gegner auf hohem Niveau.", dfb:"Kreis-/Bezirksliga, Leistungs-/Förderstaffel" },
  { id:4, label:"Spitze", col:"#dc2626", desc:"Leistungsstärkste Mannschaft – oberste Spielklasse bzw. Leistungszentrums-Niveau. Sucht ausschließlich Top-Gegner.", dfb:"Landes-/Verbandsliga, Leistungszentrum (NLZ)" },
];
// Info-Text für die ℹ️-Hints inkl. DFB-Einordnung (es gibt keine offizielle
// DFB-Stärke-Benennung; das ist eine grobe Orientierung an Spielformen/Spielklassen).
export const strengthInfoText = (prefix="") => prefix + TEAM_STRENGTHS.map(s=>`${s.label}: ${s.desc} (DFB-Einordnung: ${s.dfb})`).join("  ·  ");
export const strengthOf = id => TEAM_STRENGTHS.find(s=>s.id===id) || null;

// Kleiner Info-Punkt: zeigt Erklärung per Hover (title) und per Tipp (Bubble).
export function InfoHint({ text, col="#64748b" }){
  const [open,setOpen]=useState(false);
  return (
    <span style={{position:"relative",display:"inline-flex",verticalAlign:"middle"}}>
      <button type="button" title={text} onClick={e=>{e.stopPropagation();setOpen(o=>!o);}}
        style={{width:16,height:16,borderRadius:"50%",border:"none",background:col+"22",color:col,fontSize:11,fontWeight:900,cursor:"pointer",fontFamily:"inherit",lineHeight:1,display:"inline-flex",alignItems:"center",justifyContent:"center"}}>i</button>
      {open&&<span onClick={e=>{e.stopPropagation();setOpen(false);}} style={{position:"absolute",bottom:"135%",left:"50%",transform:"translateX(-50%)",width:210,background:"#0f172a",color:"#fff",fontSize:11.5,lineHeight:1.45,fontWeight:500,padding:"9px 11px",borderRadius:9,zIndex:60,boxShadow:"0 6px 20px rgba(0,0,0,.35)",textAlign:"left"}}>{text}</span>}
    </span>
  );
}


// ----------------------------------------------------------------
// Aktivitäts-Status: Trainer/Helfer/Spieler können in Pause geschaltet
// werden. `active === false` blendet sie überall aus Auswahl-Listen aus.
// Fehlende Property = aktiv (Backwards-Compat).
// ----------------------------------------------------------------
export const isActive = (entity) => !entity ? false : entity.active !== false;

// Login-Modus je Mannschaft: melden sich die Spieler selbst an oder die Eltern?
// "auto" leitet es vom Alter ab (Erwachsene/ältere Jugend = Spieler selbst),
// sonst Vereins-Standard (seniorsMode). "players"/"parents" überschreiben.
export const SELFLOGIN_CATS = new Set(["Senioren","Alt-Herren","Damen","Herren","Frauen","A-Jugend","B-Jugend"]);
export function teamSelfLogin(tm, cs){
  const m = tm && tm.loginMode;
  if(m==="players") return true;
  if(m==="parents") return false;
  const cat=(tm&&(tm.cat||tm.name))||"";
  if(SELFLOGIN_CATS.has(cat)) return true;
  return !!(cs && cs.seniorsMode);
}

// ----------------------------------------------------------------
// Event-Timing & Vote-Lock.
//   eventStart(ev)      → Date-Objekt
//   eventDeadline(ev)   → 24h vor Event-Start, ab dann nur noch Absagen möglich
//   isVotingLocked(ev)  → true wenn Deadline durch
//   daysUntil(ev)       → restliche Tage bis zum Event (Float)
//   isUpcoming5(ev)     → true wenn innerhalb der nächsten 5 Tage und nicht vorbei
//   formatCountdown(ms) → "2 T 14 h", "14 h 7 m", "23 m" …
// ----------------------------------------------------------------
// Event-/Frist-Helfer (eventStart, eventDeadline, isVotingLocked,
// isDeadlinePassed, isEventPast, daysUntil, isUpcoming5, formatCountdown)
// ausgelagert nach src/logic.js und oben importiert.
export const fmtDShort = iso => { const d=new Date(iso+"T12:00:00"); return `${String(d.getDate()).padStart(2,"0")}.${String(d.getMonth()+1).padStart(2,"0")}.`; };

// ACOLORS/acol/inits/contrast/mix ausgelagert nach src/util.js (oben importiert).

export const ET = {
  training:     { label:"Training",    icon:"TR", col:"#16a34a", bg:"#dcfce7" },
  heimspiel:    { label:"Heimspiel",icon:"Heim",col:"#2563eb",bg:"#dbeafe" },auswarts:     { label:"Auswärtsspiel",icon:"Bus",col:"#d97706",bg:"#fef3c7" },freundschaft: { label:"Freundschaftsspiel",icon:"Hand",col:"#7c3aed",bg:"#ede9fe" },turnier:      { label:"Turnier",icon:"Pokal",col:"#dc2626",bg:"#fee2e2" },event:        { label:"Sondertermin",icon:"Fest",col:"#0891b2",bg:"#e0f2fe" },};
// Übersetztes Terminart-Label (Fallback auf das deutsche ET.label).
export const etLabel = (type, tr) => (tr ? tr("et_"+type) : null) || ET[type]?.label || type;
// Standard-Termintitel (deutsch gespeichert) sprachabhängig anzeigen; eigene Titel bleiben.
export const _STD_TITLE = { "training":"training","heimspiel":"heimspiel","auswärtsspiel":"auswarts","auswartsspiel":"auswarts","auswaertsspiel":"auswarts","freundschaftsspiel":"freundschaft","turnier":"turnier","sondertermin":"event" };
export const evDisplayTitle = (ev, tr) => { const t0=String(ev?.title||"").trim(); if(!t0) return etLabel(ev?.type,tr); const k=_STD_TITLE[t0.toLowerCase()]; return k?etLabel(k,tr):t0; };

export const CSS = `
@import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800;900&display=swap');
*{box-sizing:border-box;margin:0;padding:0;-webkit-tap-highlight-color:transparent;-webkit-text-size-adjust:100%;text-size-adjust:100%}
html{overflow-x:hidden;touch-action:manipulation}
html,body{height:100%;max-width:100vw;overflow-x:hidden;font-family:'Plus Jakarta Sans',sans-serif;background:#f0f4f8;overscroll-behavior:none}
button{touch-action:manipulation;cursor:pointer}
button,select{font-family:'Plus Jakarta Sans',sans-serif;font-size:inherit}
input,textarea{font-family:'Plus Jakarta Sans',sans-serif;font-size:16px !important}
input::placeholder,textarea::placeholder{color:#64748b}
img{max-width:100%;height:auto}
#root{max-width:100vw;overflow-x:hidden}
@keyframes up    {from{opacity:0;transform:translateY(18px)}to{opacity:1;transform:none}}
@keyframes in    {from{opacity:0;transform:translateX(24px)}to{opacity:1;transform:none}}
@keyframes down  {from{transform:translateY(100%)}to{transform:none}}
@keyframes toast {from{opacity:0;transform:translate(-50%,10px)}to{opacity:1;transform:translate(-50%,0)}}
@keyframes pulse {0%,100%{opacity:1}50%{opacity:.35}}
@keyframes spin  {to{transform:rotate(360deg)}}
@keyframes blink {0%,100%{opacity:1}50%{opacity:.1}}
@keyframes pop   {0%{transform:scale(.85);opacity:0}65%{transform:scale(1.06)}100%{transform:scale(1);opacity:1}}
.up   {animation:up   .3s cubic-bezier(.2,0,.1,1) both}
.in   {animation:in   .25s cubic-bezier(.2,0,.1,1) both}
.down {animation:down .24s cubic-bezier(.2,0,.1,1) both}
button:active:not(:disabled){transform:scale(.95)}
::-webkit-scrollbar{width:3px}::-webkit-scrollbar-thumb{background:#cbd5e1;border-radius:99px}
`;

export const TH = cl => {
  const p = cl?.pri||"#16a34a";
  return { p,s:cl?.sec||"#052e16",ct:contrast(p),li:mix(p,85),logo:cl?.logo||null,em:cl?.em||(cl?.name?cl.name.trim().slice(0,1).toUpperCase():"⚽") };
};



export function ChangePasswordModal({ cl, onSave, onClose }) {
  const t = TH(cl);
  const [oldPw, setOldPw] = React.useState("");
  const [newPw, setNewPw] = React.useState("");
  const [newPw2, setNewPw2] = React.useState("");
  const [err, setErr] = React.useState("");
  const save = () => {
    if(!checkPw(oldPw, cl.adm||"")) { setErr("Altes Passwort falsch"); return; }
    if(newPw.length < 4) { setErr("Mindestens 4 Zeichen"); return; }
    if(newPw !== newPw2) { setErr("Passwörter stimmen nicht überein"); return; }
    onSave(hashPw(newPw));
  };
  return (
    <div style={{position:"fixed",inset:0,overflowY:"auto",WebkitOverflowScrolling:"touch",background:"rgba(0,0,0,.6)",zIndex:900,display:"flex",alignItems:"center",justifyContent:"center",padding:20}}>
      <div style={{background:"#fff",borderRadius:18,padding:"24px",width:"100%",maxWidth:380}}>
        <h3 style={{fontWeight:900,fontSize:18,marginBottom:16}}>Passwort ändern</h3>
        <div style={{display:"flex",flexDirection:"column",gap:10}}>
          <PwInput value={oldPw} onChange={e=>setOldPw(e.target.value)} placeholder="Aktuelles Passwort"
            style={{padding:"11px 14px",fontSize:14,border:"1.5px solid #e2e8f0",borderRadius:11,outline:"none"}}/>
          <PwInput value={newPw} onChange={e=>setNewPw(e.target.value)} placeholder="Neues Passwort"
            style={{padding:"11px 14px",fontSize:14,border:"1.5px solid #e2e8f0",borderRadius:11,outline:"none"}}/>
          <PwInput value={newPw2} onChange={e=>setNewPw2(e.target.value)} placeholder="Neues Passwort wiederholen"
            style={{padding:"11px 14px",fontSize:14,border:"1.5px solid #e2e8f0",borderRadius:11,outline:"none"}}/>
          {err&&<div style={{background:"#fef2f2",borderRadius:10,padding:"9px 13px",fontSize:13,color:"#dc2626"}}>{err}</div>}
        </div>
        <div style={{display:"flex",gap:9,marginTop:16}}>
          <button onClick={onClose} style={{flex:1,padding:"12px",borderRadius:12,border:"1.5px solid #e2e8f0",background:"#fff",fontWeight:700,cursor:"pointer",fontFamily:"inherit"}}>Abbrechen</button>
          <button onClick={save} style={{flex:2,padding:"12px",borderRadius:12,border:"none",background:t.p,color:"#fff",fontWeight:800,cursor:"pointer",fontFamily:"inherit"}}>Speichern</button>
        </div>
      </div>
    </div>
  );
}
export function OnlineStatus() {
  const [online, setOnline] = React.useState(navigator.onLine);
  React.useEffect(()=>{
    const on=()=>setOnline(true); const off=()=>setOnline(false);
    window.addEventListener("online",on); window.addEventListener("offline",off);
    return()=>{window.removeEventListener("online",on);window.removeEventListener("offline",off);};
  },[]);
  if(online) return null;
  return (
    <div style={{position:"fixed",top:0,left:0,right:0,zIndex:9999,background:"#dc2626",color:"#fff",
      textAlign:"center",fontSize:12,fontWeight:700,padding:"6px"}}>
      Offline - Daten werden lokal gespeichert
    </div>
  );
}

export function exportICS(events, clName) {
  const lines = [
    "BEGIN:VCALENDAR","VERSION:2.0",
    "PRODID:-//VereinsApp//DE",
    "CALNAME:"+clName
  ];
  events.forEach(ev => {
    const dt = (ev.date||"").replace(/-/g,"");
    const tm = (ev.time||"").replace(/:/g,"");
    lines.push("BEGIN:VEVENT");
    lines.push("DTSTART:" + dt + (tm?"T"+tm+"00":""));
    lines.push("SUMMARY:" + (ev.title||"Termin"));
    lines.push("DESCRIPTION:" + (ev.location||""));
    lines.push("END:VEVENT");
  });
  lines.push("END:VCALENDAR");
  const blob = new Blob([lines.join("\r\n")], {type:"text/calendar"});
  const a = document.createElement("a");
  a.href = URL.createObjectURL(blob);
  a.download = "vereinstermine.ics";
  a.click();
}
export function Logo({cl,sz=48,sx={}}) {
  const t=TH(cl);
  if(t.logo) return <img src={t.logo} alt="" style={{width:sz,height:sz,borderRadius:sz*.22,objectFit:"cover",flexShrink:0,...sx}}/>;
  return <div style={{width:sz,height:sz,borderRadius:sz*.22,background:t.p+"28",display:"flex",alignItems:"center",justifyContent:"center",fontSize:sz*.5,flexShrink:0,...sx}}>{t.em}</div>;
}
export function Av({name,sz=32,border=true}) {
  return <div style={{width:sz,height:sz,borderRadius:"50%",background:acol(name),color:"#fff",display:"flex",alignItems:"center",justifyContent:"center",fontSize:sz*.36,fontWeight:800,border:border?"2px solid rgba(255,255,255,.7)":"none",flexShrink:0,boxShadow:"0 1px 4px rgba(0,0,0,.15)"}}>{inits(name)}</div>;
}
export function Tag({c="#64748b",bg,ch,sm}) {
  return <span style={{background:bg||(c+"20"),color:c,borderRadius:99,padding:sm?"2px 7px":"3px 10px",fontSize:sm?10:12,fontWeight:700,display:"inline-flex",alignItems:"center",whiteSpace:"nowrap"}}>{ch}</span>;
}
export function Toast({msg}) {
  return msg?<div style={{position:"fixed",bottom:30,left:"50%",transform:"translateX(-50%)",background:"#0f172a",color:"#fff",borderRadius:99,padding:"11px 22px",fontSize:14,fontWeight:700,boxShadow:"0 8px 32px rgba(0,0,0,.35)",animation:"toast .26s ease",zIndex:9999,whiteSpace:"nowrap",pointerEvents:"none"}}>{msg}</div>:null;
}
// Einmaliges, ausblendbares Onboarding pro Bereich (gemerkt via localStorage).
export const AREA_INTROS = {
  events:    {icon:"📅", title:"Termine", text:"Plane Trainings, Spiele & Turniere. Eltern/Spieler stimmen mit einem Tipp ab (Bin dabei / Sage ab). Tippe oben auf 'Neuen Termin anlegen' und folge dem Assistenten."},
  fields:    {icon:"🏟️", title:"Platzbelegung", text:"Reserviere Plätze/Hallen für deine Mannschaft, damit es keine Doppelbelegung gibt. Die Plätze selbst legt der Vereinsadmin an."},
  chat:      {icon:"💬", title:"Team-Chat", text:"Kommuniziere mit dem Team – pro Mannschaft, ohne private Handynummern. Links/Infos einfach reinschreiben."},
  treasury:  {icon:"💶", title:"Kasse", text:"Behalte Mannschaftskasse & Beiträge im Blick: Einnahmen, Ausgaben und offene Beträge."},
  jerseys:   {icon:"👕", title:"Trikots", text:"Verwalte Trikotnummern, Größen und den Bestellstatus deiner Spieler."},
  helpers:   {icon:"🙋", title:"Helfer", text:"Lade Eltern als Helfer ein (Kuchen, Aufbau, Kasse) und vergib Aufgaben direkt pro Termin."},
  templates: {icon:"🧩", title:"Vorlagen", text:"Speichere wiederkehrende Abstimmungen/Listen als Vorlage und hänge sie mit einem Klick an neue Termine."},
  results:   {icon:"🏆", title:"Ergebnisse & Tabelle", text:"Trage Spielergebnisse ein und behalte Tabelle und Saisonverlauf im Blick."},
  attendance:{icon:"✅", title:"Anwesenheit", text:"Sieh auf einen Blick, wer wie oft dabei war – inklusive Hinweisen zu verlässlichen und Risiko-Spielern."},
  tinbox:    {icon:"📥", title:"Posteingang", text:"Nachrichten und Anfragen rund um deine Mannschaft an einer zentralen Stelle."},
  news:      {icon:"📣", title:"Neuigkeiten", text:"Teile Vereins-News mit allen Mitgliedern. Wichtiges kannst du oben anpinnen."},
  teams:     {icon:"👥", title:"Mannschaften", text:"Lege Mannschaften an und stelle Stärke, Anmeldung, Bewertung und die Aufteilung (1–3 Teams je nach Zusagen) ein."},
  trainers:  {icon:"🧑‍🏫", title:"Trainer", text:"Lege Trainer an, vergib Zugänge und weise ihnen ihre Mannschaften zu."},
  branding:  {icon:"🎨", title:"Design", text:"Hinterlege Logo und Vereinsfarben – die App erscheint dann komplett in eurem Look."},
  settings:  {icon:"⚙️", title:"Einstellungen", text:"Module an/aus, Kommunikation, Sicherheit, Datenschutz sowie 'Infos & Links' für eure Mitglieder."},
  team_players:    {icon:"🧒", title:"Kader / Spieler", text:"Lege Spieler an (einzeln oder mehrere auf einmal), teile sie Mannschaften zu und pflege die Profile."},
  team_taktik:     {icon:"⚽", title:"Taktiktafel", text:"Stelle Aufstellung & Gegner auf, zeichne Lauf-/Passwege, spiele sie als Animation ab, markiere einen Spieler (⭐) und speichere Boards."},
  team_attendance: {icon:"✅", title:"Anwesenheit", text:"Auswertung der Zu-/Absagen über die letzten Trainings – wer ist verlässlich dabei, wer fehlt oft?"},
  team_results:    {icon:"🏆", title:"Ergebnisse", text:"Spielergebnisse eintragen und Tabelle verfolgen."},
  team_drills:     {icon:"📚", title:"Übungs-Bibliothek", text:"Stöbere durch viele Übungen mit Diagramm, Beschreibung, Coaching-Tipps und 'für Kinder erklärt'."},
  team_planner:    {icon:"🗓️", title:"Trainingsplaner", text:"Stelle ein komplettes Training aus Übungen zusammen – passend zu Alter und Schwerpunkt."},
  team_trainings:  {icon:"📋", title:"Trainingspläne", text:"Deine gespeicherten Pläne als Vorlagen – am Termin kopierbar und frei anpassbar."},
  team_insights:   {icon:"📈", title:"Team-Einblicke", text:"Kennzahlen zu deiner Mannschaft auf einen Blick."},
  team_analysis:   {icon:"🧠", title:"Skill-Analyse", text:"Stärken/Schwächen des Teams je Fähigkeit – Basis für gezielte Förderung."},
  team_ziele:      {icon:"🎯", title:"Trainingsziele", text:"Lege je Altersklasse die Schwerpunkte fest, an denen sich Übungsvorschläge orientieren."},
  team_boerse:     {icon:"🤝", title:"Turnier-Börse", text:"Finde Gegner für Freundschaftsspiele/Turniere auf Augenhöhe."},
  team_manage:     {icon:"👥", title:"Mannschaften verwalten", text:"Anlegen, umbenennen, Stärke/Anmeldung/Bewertung und Aufteilung in mehrere Mannschaften einstellen."},
  parent_home:     {icon:"👋", title:"Willkommen!", text:"Hier siehst du die Termine eures Teams. Tippe 'Bin dabei' oder 'Sage ab'. Unten findest du Chat und unter 'Mehr' dein Profil."},
};
export function AreaIntro({ id, cl }){
  const info=AREA_INTROS[id]; if(!info) return null;
  const key="va_intro_"+id;
  const [open,setOpen]=useState(()=>{ try{return localStorage.getItem(key)!=="1";}catch{return true;} });
  if(!open) return null;
  const c=cl?.pri||"#16a34a";
  return (
    <div className="up" style={{background:c+"0f",border:`1.5px solid ${c}33`,borderRadius:14,padding:"12px 14px",marginBottom:14,display:"flex",gap:11,alignItems:"flex-start"}}>
      <div style={{fontSize:22,lineHeight:1.1,flexShrink:0}}>{info.icon}</div>
      <div style={{flex:1,minWidth:0}}>
        <div style={{fontWeight:800,fontSize:14,color:"#0f172a",marginBottom:3}}>{info.title}</div>
        <div style={{fontSize:12.5,color:"#475569",lineHeight:1.5}}>{info.text}</div>
      </div>
      <button onClick={()=>{ try{localStorage.setItem(key,"1");}catch{} setOpen(false); }} title="Verstanden"
        style={{flexShrink:0,width:28,height:28,borderRadius:8,border:"none",background:c,color:contrast(c),fontWeight:800,fontSize:14,cursor:"pointer",fontFamily:"inherit"}}>✓</button>
    </div>
  );
}
export function Drawer({ch,children,onClose,title,maxH="92dvh"}) {
  return (
    <div onClick={onClose} style={{position:"fixed",inset:0,background:"rgba(0,0,0,.55)",display:"flex",alignItems:"flex-end",justifyContent:"center",zIndex:900,backdropFilter:"blur(8px)"}}>
      <div onClick={e=>e.stopPropagation()} style={{background:"#fff",borderRadius:"22px 22px 0 0",width:"100%",maxWidth:560,maxHeight:maxH,display:"flex",flexDirection:"column",boxShadow:"0 -16px 60px rgba(0,0,0,.2)",animation:"down .22s ease"}}>
        {/* Fixer Kopf mit immer erreichbarem Schliessen-X; nur der Inhalt scrollt. */}
        <div style={{flexShrink:0,position:"relative",paddingTop:10}}>
          <div style={{width:36,height:4,borderRadius:99,background:"#e2e8f0",margin:"0 auto"}}/>
          <button onClick={onClose} aria-label="Schließen" style={{position:"absolute",top:8,right:12,width:32,height:32,borderRadius:10,background:"#f1f5f9",border:"none",color:"#475569",fontWeight:800,fontSize:16,cursor:"pointer",fontFamily:"inherit",zIndex:2}}>✕</button>
          {title&&<div style={{padding:"6px 56px 12px 22px",fontSize:18,fontWeight:800,color:"#0f172a"}}>{title}</div>}
        </div>
        <div style={{overflowY:"auto",WebkitOverflowScrolling:"touch",padding:title?"0 20px calc(28px + env(safe-area-inset-bottom))":"6px 20px calc(28px + env(safe-area-inset-bottom))"}}>{ch||children}</div>
      </div>
    </div>
  );
}
// ── Einheitliches Seiten-Layout ─────────────────────────────────────────
// Jede Hauptseite folgt demselben Skelett: PageHead (Icon+Titel+Kontext)
// → TeamPills (Team-Wahl) → PillTabs (Unter-Tabs) → Inhalt → EmptyBox.
export function PageHead({icon,title,sub,right}) {
  return (
    <div style={{display:"flex",alignItems:"center",gap:10,marginBottom:12}}>
      <div style={{width:40,height:40,borderRadius:12,background:"#f1f5f9",display:"flex",alignItems:"center",justifyContent:"center",fontSize:20,flexShrink:0}}>{icon}</div>
      <div style={{flex:1,minWidth:0}}>
        <div style={{fontWeight:900,fontSize:17,color:"#0f172a",lineHeight:1.2}}>{title}</div>
        {sub&&<div style={{fontSize:12,color:"#64748b",marginTop:1}}>{sub}</div>}
      </div>
      {right}
    </div>
  );
}
export function PillTabs({tabs,value,onChange,color="#16a34a"}) {
  return (
    <div style={{display:"flex",gap:6,marginBottom:12,overflowX:"auto",scrollbarWidth:"none",WebkitOverflowScrolling:"touch"}}>
      {tabs.map(([k,l])=>(
        <button key={k} onClick={()=>onChange(k)} style={{flexShrink:0,padding:"8px 14px",borderRadius:99,border:`1.5px solid ${value===k?color:"#e2e8f0"}`,background:value===k?color:"#fff",color:value===k?contrast(color):"#475569",fontWeight:800,fontSize:12.5,cursor:"pointer",fontFamily:"inherit",whiteSpace:"nowrap"}}>{l}</button>
      ))}
    </div>
  );
}
export function TeamPills({teams,value,onChange}) {
  if(!teams||teams.length<2) return null;
  return (
    <div style={{display:"flex",gap:6,marginBottom:12,overflowX:"auto",scrollbarWidth:"none",WebkitOverflowScrolling:"touch"}}>
      {teams.map(tm=>(
        <button key={tm.id} onClick={()=>onChange(tm.id)} style={{padding:"7px 14px",borderRadius:99,border:`2px solid ${value===tm.id?tm.col:"#e2e8f0"}`,background:value===tm.id?tm.col:"#fff",color:value===tm.id?"#fff":"#475569",fontWeight:700,fontSize:12.5,cursor:"pointer",whiteSpace:"nowrap",fontFamily:"inherit",flexShrink:0}}>{tm.name}</button>
      ))}
    </div>
  );
}
export function EmptyBox({icon="📭",title,sub,children}) {
  return (
    <div style={{textAlign:"center",padding:"34px 20px",background:"#f8fafc",borderRadius:16,border:"1.5px dashed #e2e8f0"}}>
      <div style={{fontSize:32,marginBottom:8}}>{icon}</div>
      <p style={{fontWeight:800,color:"#334155",fontSize:15,margin:0}}>{title}</p>
      {sub&&<p style={{fontSize:13,color:"#64748b",marginTop:5,lineHeight:1.5}}>{sub}</p>}
      {children}
    </div>
  );
}
export function Btn({ch,onClick,v="pri",full,sm,dis,load,icon,cl,sx={}}) {
  const p=cl?.pri||"#16a34a";
  const V={
    pri:{
      background:dis?"#e2e8f0":`linear-gradient(135deg,${p} 0%,${mix(p,-12)} 100%)`,color:dis?"#0f172a":contrast(p),boxShadow:dis?"none":`0 2px 8px ${p}40,0 1px 2px ${p}30`,border:dis?"1.5px solid #cbd5e1":"none",},drk:{
      background:"linear-gradient(135deg,#1e293b 0%,#0f172a 100%)",color:"#fff",boxShadow:"0 2px 8px rgba(0,0,0,.25),0 1px 2px rgba(0,0,0,.15)",border:"none",},red:{
      background:"linear-gradient(135deg,#ef4444 0%,#dc2626 100%)",color:"#fff",boxShadow:"0 2px 8px rgba(239,68,68,.3)",border:"none",},gst:{
      background:"#fff",color:"#475569",boxShadow:"0 1px 3px rgba(0,0,0,.08),0 0 0 1.5px #e2e8f0",border:"none",},out:{
      background:"transparent",color:p,boxShadow:"none",border:`2px solid ${p}`,},dng:{
      background:"#fff7f7",color:"#dc2626",boxShadow:"0 0 0 1.5px #fecaca",border:"none",},};
  const s=V[v]||V.pri;
  const radius=sm?10:14;
  const pad=sm?"8px 15px":"13px 22px";
  const fSize=sm?13:15;
  return (
    <button
      onClick={dis||load?undefined:onClick}
      style={{
        ...s,borderRadius:radius,padding:pad,fontSize:fSize,fontWeight:700,letterSpacing:"-.01em",cursor:dis||load?"not-allowed":"pointer",width:full?"100%":undefined,display:"inline-flex",alignItems:"center",justifyContent:"center",gap:7,transition:"all .15s",opacity:1,fontFamily:"inherit",lineHeight:1.2,...sx
      }}
    >
      {load
        ? <span style={{width:15,height:15,border:"2px solid rgba(255,255,255,.35)",borderTopColor:"currentColor",borderRadius:"50%",animation:"spin .7s linear infinite",display:"inline-block"}}/>
        : icon && <span style={{fontSize:sm?14:18,lineHeight:1,flexShrink:0}}>{icon}</span>
      }
      {ch}
    </button>
  );
}
export function EyeBtn({show,onClick}) {
  return <button type="button" onClick={onClick} tabIndex={-1}
    aria-label={show?"Passwort verbergen":"Passwort anzeigen"}
    style={{position:"absolute",right:8,top:"50%",transform:"translateY(-50%)",background:"none",border:"none",padding:6,cursor:"pointer",color:"#64748b",display:"flex",alignItems:"center",fontFamily:"inherit",zIndex:1}}>
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      {show
        ? <><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></>
        : <><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"/><line x1="1" y1="1" x2="23" y2="23"/></>}
    </svg>
  </button>;
}
export function PwInput({style, value, onChange, placeholder, autoFocus, onKeyDown, name, ...rest}) {
  const [show, setShow] = useState(false);
  return (
    <div style={{position:"relative", width: style?.width||"100%"}}>
      <input {...rest} type={show?"text":"password"} value={value} onChange={onChange}
        placeholder={placeholder} autoFocus={autoFocus} onKeyDown={onKeyDown} name={name}
        autoCapitalize="none" autoCorrect="off" spellCheck={false}
        style={{...(style||{}), paddingRight:44, width:"100%", boxSizing:"border-box"}}/>
      <EyeBtn show={show} onClick={()=>setShow(s=>!s)}/>
    </div>
  );
}
export function Inp({label,val,set,ph,type="text",af,rows,cl,note,onEnter,inputRef}) {
  const [f,setF]=useState(false); const c=cl?.pri||"#16a34a";
  const [show,setShow]=useState(false);
  const isPw=type==="password"&&!rows;
  const actualType=isPw&&show?"text":type;
  const base={width:"100%",padding:"12px 15px",fontSize:15,border:`2px solid ${f?c:"#e2e8f0"}`,borderRadius:13,outline:"none",background:"#fff",transition:"border-color .17s",display:"block",resize:"vertical"};
  const inputStyle=isPw?{...base,paddingRight:44}:base;
  const inputEl = rows
    ? <textarea value={val} onChange={e=>set(e.target.value)} placeholder={ph} rows={rows} onFocus={()=>setF(true)} onBlur={()=>setF(false)} style={base}/>
    : <input ref={inputRef} type={actualType} value={val} onChange={e=>set(e.target.value)} placeholder={ph} autoFocus={af} autoCapitalize={type==="password"?"none":"sentences"} autoCorrect={type==="password"?"off":"on"} spellCheck={type==="password"?false:undefined} onKeyDown={onEnter?(e=>{if(e.key==="Enter"){e.preventDefault();onEnter();}}):undefined} onFocus={()=>setF(true)} onBlur={()=>setF(false)} style={inputStyle}/>;
  return <div style={{display:"flex",flexDirection:"column",gap:5}}>{label&&<div style={{fontSize:11,fontWeight:800,color:"#64748b",letterSpacing:.6,textTransform:"uppercase"}}>{label}</div>}{isPw?<div style={{position:"relative"}}>{inputEl}<EyeBtn show={show} onClick={()=>setShow(s=>!s)}/></div>:inputEl}{note&&<div style={{fontSize:12,color:"#64748b"}}>{note}</div>}</div>;
}
export function Sel({label,val,set,opts}) {
  return <div style={{display:"flex",flexDirection:"column",gap:5}}>{label&&<div style={{fontSize:11,fontWeight:800,color:"#64748b",letterSpacing:.6,textTransform:"uppercase"}}>{label}</div>}<select value={val} onChange={e=>set(e.target.value)} style={{width:"100%",padding:"12px 15px",fontSize:15,border:"2px solid #e2e8f0",borderRadius:13,outline:"none",background:"#fff",appearance:"none",backgroundImage:`url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='8'%3E%3Cpath d='M1 1l5 5 5-5' stroke='%2364748b' stroke-width='2' fill='none' stroke-linecap='round'/%3E%3C/svg%3E")`,backgroundRepeat:"no-repeat",backgroundPosition:"right 15px center"}}>{opts.map(([v,l])=><option key={v} value={v}>{l}</option>)}</select></div>;
}
export function Sw({on,tog,pri="#16a34a",label,sub}) {
  return <div style={{display:"flex",alignItems:"center",gap:12,padding:"12px 0",borderBottom:"1px solid #f1f5f9"}}><div style={{flex:1}}><div style={{fontWeight:700,fontSize:15,color:"#0f172a"}}>{label}</div>{sub&&<div style={{fontSize:13,color:"#64748b",marginTop:2}}>{sub}</div>}</div><div onClick={tog} style={{width:48,height:26,borderRadius:99,background:on?pri:"#cbd5e1",cursor:"pointer",position:"relative",transition:"background .2s",flexShrink:0}}><div style={{width:20,height:20,borderRadius:"50%",background:"#fff",position:"absolute",top:3,left:on?25:3,transition:"left .2s",boxShadow:"0 2px 6px rgba(0,0,0,.2)"}}/></div></div>;
}
export function ClubHeader({cl, sub, right, hide=false}) {
  const t=TH(cl);
  return <div style={{background:`linear-gradient(135deg,${t.s} 0%,${t.p}bb 100%)`,padding:"16px 18px 20px",position:"sticky",top:0,zIndex:60,boxShadow:"0 4px 24px rgba(0,0,0,.22)"}}>
    <div style={{display:"flex",alignItems:"center",gap:12,flexWrap:"wrap",rowGap:10}}>
      <div style={{display:"flex",alignItems:"center",gap:12,flex:"1 1 200px",minWidth:0}}>
        <Logo cl={cl} sz={42}/>
        <div style={{flex:1,minWidth:0}}>
          <div title={cl?.name} style={{color:"#fff",fontWeight:900,fontSize:17,letterSpacing:-.3,lineHeight:1.2,whiteSpace:"nowrap",overflow:"hidden",textOverflow:"ellipsis"}}>{cl?.name}</div>
          {sub&&<div style={{color:"rgba(255,255,255,.6)",fontSize:12,fontWeight:600,marginTop:2,whiteSpace:"nowrap",overflow:"hidden",textOverflow:"ellipsis"}}>{sub}</div>}
        </div>
      </div>
      {right&&<div style={{flexShrink:0,marginLeft:"auto"}}>{right}</div>}
    </div>
  </div>;
}
export function Divider({label,light}) {
  return <div style={{display:"flex",alignItems:"center",gap:10,margin:"14px 0 10px"}}><div style={{flex:1,height:1,background:"#e2e8f0"}}/><span style={{fontSize:11,fontWeight:800,color:light?"#94a3b8":"#64748b",whiteSpace:"nowrap"}}>{label}</span><div style={{flex:1,height:1,background:"#e2e8f0"}}/></div>;
}
