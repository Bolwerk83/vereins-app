// ----------------------------------------------------------------
// SuperAdmin-Bereich: Login, Dashboard, Vereine, Altdaten, Rollout/
// Feature-Manager, Chat-Moderation, Geo-Analytics + Event-Tracking.
// Wird nur ueber ?superadmin gerendert; App nutzt von hier nur
// SuperAdmin (Gate) und trackEvent/trackEventGeo.
// ----------------------------------------------------------------
import React, { useState, useEffect, useRef } from "react";
import { sb } from "./storage.js";
import { hashPw, checkPw } from "./util.js";
import { PwInput } from "./ui.jsx";
import { AFFILIATE_IDS, applyAffiliateIds, AFFILIATES } from "./affiliates.jsx";
import { FEATURES_KEY, FEATURE_REGISTRY, FEAT_KEY, MILESTONES, applyFeatureFlags, getFeat, setFeat, setAllPhase } from "./features.js";

const SA_KEY = "va_superadmin";
// SA-Passwort liegt NICHT im Code, sondern als Hash in app_secret.sa_password_hash.
// Geprueft via RPC check_sa_password; Setup-Status via sa_is_setup.

export const saGet = () => { try { return JSON.parse(localStorage.getItem(SA_KEY)||"null"); } catch { return null; } };
export const saSet = (d) => { try { localStorage.setItem(SA_KEY, JSON.stringify(d)); } catch {} };

// Tracking: Klicks und Events lokal loggen
export const trackEvent = (type, detail="") => { trackEventGeo(type, detail); };
const _trackEventOld = (type, detail="") => {
  const log = JSON.parse(localStorage.getItem("va_analytics")||"[]");
  log.push({ type, detail, ts: Date.now(), date: new Date().toISOString().slice(0,10) });
  // Max 1000 Eintraege
  localStorage.setItem("va_analytics", JSON.stringify(log.slice(-1000)));
}; // _trackEventOld

// Analytics abrufen
export const getAnalytics = () => {
  try { return JSON.parse(localStorage.getItem("va_analytics")||"[]"); } catch { return []; }
};

// NPS-Scores abrufen
export const getNPS = () => {
  try { return JSON.parse(localStorage.getItem("va_nps")||"null"); } catch { return null; }
};

// Module-Flags
const MODULE_DEFAULTS = {
  chat:          { label:"Chat",               enabled:true },
  helpers:       { label:"Helfer",             enabled:true },
  jerseys:       { label:"Trikots",            enabled:true },
  fields:        { label:"Platzbuchung",       enabled:true },
  training:      { label:"Trainingspläne",    enabled:true },
  results:       { label:"Ergebnisse",         enabled:true },
  attendance:    { label:"Anwesenheit",        enabled:true },
  news:          { label:"Schwarzes Brett",    enabled:true },
  affiliate:     { label:"Affiliate-Banner",   enabled:true },
  marketing:     { label:"Marketing Prompts",  enabled:true },
  registration:  { label:"Verein anlegen",     enabled:true },
  directory:     { label:"Verzeichnis",        enabled:true },
  multilang:     { label:"Mehrsprachigkeit",   enabled:true },
};

const getModules = () => {
  try {
    const stored = JSON.parse(localStorage.getItem("va_modules")||"{}");
    return { ...MODULE_DEFAULTS, ...stored };
  } catch { return MODULE_DEFAULTS; }
};
const setModule = (key, enabled) => {
  const modules = getModules();
  modules[key] = { ...modules[key], enabled };
  localStorage.setItem("va_modules", JSON.stringify(modules));
};

/* -----------------------------------------------------------------
   SUPER ADMIN LOGIN
----------------------------------------------------------------- */
function SuperAdminLogin({ onLogin }) {
  const [pw, setPw] = useState("");
  const [err, setErr] = useState("");
  const [busy, setBusy] = useState(true);
  const [needsSetup, setNeedsSetup] = useState(false);
  const [unavailable, setUnavailable] = useState(false);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const ok = await sb.rpc("sa_is_setup");
        if (cancelled) return;
        setNeedsSetup(ok !== true);
        setBusy(false);
      } catch {
        if (cancelled) return;
        setUnavailable(true);
        setBusy(false);
      }
    })();
    return () => { cancelled = true; };
  }, []);

  const login = async () => {
    if (busy || needsSetup || unavailable) return;
    setErr(""); setBusy(true);
    try {
      const ok = await sb.rpc("check_sa_password", { p_password: pw });
      if (ok === true) {
        onLogin();
        return;
      }
      setErr("Falsches Passwort");
      setTimeout(() => setErr(""), 1800);
    } catch (e) {
      setErr("Datenbank nicht erreichbar");
    }
    setBusy(false);
  };

  return (
    <div style={{minHeight:"100dvh",background:"#0f172a",display:"flex",
      alignItems:"center",justifyContent:"center",padding:20}}>
      <div style={{background:"#1e293b",borderRadius:20,padding:"32px 28px",
        width:"100%",maxWidth:380,border:"1px solid #334155"}}>
        <div style={{textAlign:"center",marginBottom:24}}>
          <div style={{width:56,height:56,borderRadius:16,background:"#7c3aed",
            display:"flex",alignItems:"center",justifyContent:"center",
            fontWeight:900,fontSize:24,color:"#fff",margin:"0 auto 12px"}}>SA</div>
          <div style={{color:"#fff",fontWeight:900,fontSize:20}}>Super Admin</div>
          <div style={{color:"#64748b",fontSize:13,marginTop:4}}>
            {unavailable ? "Datenbank antwortet nicht" : needsSetup ? "Noch kein SA-Passwort gesetzt" : "Nur für autorisierte Administratoren"}
          </div>
        </div>
        {unavailable ? (
          <div style={{color:"#fca5a5",fontSize:13,lineHeight:1.6,background:"#450a0a",border:"1px solid #dc2626",borderRadius:12,padding:"12px 14px"}}>
            Die App konnte das SuperAdmin-Setup nicht prüfen. Internet checken oder später erneut versuchen.
          </div>
        ) : needsSetup ? (
          <div style={{color:"#fbbf24",fontSize:13,lineHeight:1.65,background:"#422006",border:"1px solid #d97706",borderRadius:12,padding:"12px 14px"}}>
            Im Supabase-SQL-Editor einmal ausführen (DEIN-SA-PASSWORT durch dein Wunschpasswort ersetzen):
            <div style={{background:"#0f172a",borderRadius:8,padding:"10px 12px",margin:"10px 0 0",fontFamily:"monospace",fontSize:11,color:"#86efac",lineHeight:1.55}}>
              update public.app_secret<br/>
              &nbsp;&nbsp;set sa_password_hash =<br/>
              &nbsp;&nbsp;encode(digest('DEIN-SA-PASSWORT','sha256'),'hex')<br/>
              &nbsp;&nbsp;where id = 1;
            </div>
          </div>
        ) : (
          <>
            <PwInput value={pw} onChange={e=>{setPw(e.target.value);setErr("");}}
              onKeyDown={e=>e.key==="Enter"&&login()}
              placeholder="Passwort"
              autoFocus
              style={{width:"100%",padding:"13px 14px",fontSize:16,
                background:"#0f172a",border:`1.5px solid ${err?"#dc2626":"#334155"}`,
                borderRadius:12,color:"#fff",outline:"none",
                boxSizing:"border-box",marginBottom:12}}/>
            {err && <div style={{color:"#dc2626",fontSize:13,marginBottom:10,textAlign:"center"}}>{err}</div>}
            <button onClick={login} disabled={busy||!pw}
              style={{width:"100%",padding:"13px",borderRadius:13,border:"none",
                background:(busy||!pw)?"#475569":"#7c3aed",color:"#fff",fontWeight:800,fontSize:15,
                cursor:(busy||!pw)?"default":"pointer",fontFamily:"inherit"}}>
              {busy?"Prüfe…":"Einloggen"}
            </button>
          </>
        )}
      </div>
    </div>
  );
}

/* -----------------------------------------------------------------
   SUPER ADMIN DASHBOARD - Hauptbereich
----------------------------------------------------------------- */
function SuperAdminDashboard({ data, onExit }) {
  const [tab, setTab] = useState("dashboard");
  const allClubs = (data.clubs||[]).filter(x=>!(x.id||"").startsWith("demo"));
  const allTeams = data.teams||[];
  const allTrainers = data.trainers||[];
  const allPlayers = data.playerProfiles||[];
  const analytics = getAnalytics();
  const modules = getModules();

  // Stats
  const today = new Date().toISOString().slice(0,10);
  const thisWeek = new Date(Date.now()-7*86400000).toISOString().slice(0,10);
  const todayEvents = analytics.filter(e=>e.date===today);
  const weekEvents = analytics.filter(e=>e.date>=thisWeek);
  const affiliateClicks = analytics.filter(e=>e.type==="affiliate_click");
  const shareClicks = analytics.filter(e=>e.type==="share");
  const loginEvents = analytics.filter(e=>e.type==="login");
  const nps = getNPS();

  const TABS = [
    {id:"dashboard",  label:"Dashboard",   icon:"D"},
    {id:"activity",   label:"Aktivität",   icon:"AK"},
    {id:"clubs",      label:"Vereine",     icon:"V"},
    {id:"message",    label:"Nachrichten", icon:"N"},
    {id:"modules",    label:"Module",      icon:"M"}, // zeigt den Feature-Manager (global wirksam)
    {id:"revenue",    label:"Einnahmen",   icon:"E"},
    {id:"affiliate",  label:"Werbung / IDs",icon:"€"},
    {id:"analytics",  label:"Analytics",   icon:"A"},
    {id:"geo",         label:"Geo & Sprache",icon:"G"},
    {id:"logs",       label:"Logs",        icon:"L"},
    {id:"moderation",  label:"Chat-Moderation", icon:"CM"},
    {id:"settings",   label:"Einstellungen",icon:"S"},
    {id:"compliance",  label:"Compliance",    icon:"C"},
    {id:"rollout",     label:"Rollout",        icon:"R"},
    {id:"database",    label:"Datenbank",      icon:"DB"},
    {id:"orphans",     label:"Altdaten",       icon:"AL"},
  ];

  return (
    <div style={{minHeight:"100dvh",background:"#0f172a",color:"#e2e8f0",
      fontFamily:"'Plus Jakarta Sans',sans-serif"}}>

      {/* Header */}
      <div style={{background:"#1e293b",borderBottom:"1px solid #334155",
        padding:"12px 20px",display:"flex",alignItems:"center",gap:12,
        position:"sticky",top:0,zIndex:100}}>
        <div style={{width:36,height:36,borderRadius:10,background:"#7c3aed",
          display:"flex",alignItems:"center",justifyContent:"center",
          fontWeight:900,fontSize:14,color:"#fff",flexShrink:0}}>SA</div>
        <div style={{flex:1}}>
          <div style={{fontWeight:800,fontSize:15,color:"#fff"}}>Super Admin</div>
          <div style={{fontSize:11,color:"#64748b"}}>verein.bolwerk24.de</div>
        </div>
        <button onClick={onExit}
          style={{padding:"6px 14px",borderRadius:9,border:"1px solid #334155",
            background:"transparent",color:"#64748b",fontWeight:700,fontSize:12,
            cursor:"pointer",fontFamily:"inherit"}}>
          Beenden
        </button>
      </div>

      {/* Tab Nav */}
      <div style={{display:"flex",overflowX:"auto",scrollbarWidth:"none",
        background:"#1e293b",borderBottom:"1px solid #334155",padding:"0 12px"}}>
        {TABS.map(t=>(
          <button key={t.id} onClick={()=>setTab(t.id)}
            style={{padding:"11px 14px",border:"none",
              borderBottom:`2px solid ${tab===t.id?"#7c3aed":"transparent"}`,
              background:"transparent",
              color:tab===t.id?"#a78bfa":"#64748b",
              fontWeight:tab===t.id?800:600,fontSize:12,cursor:"pointer",
              whiteSpace:"nowrap",fontFamily:"inherit",flexShrink:0}}>
            {t.label}
          </button>
        ))}
      </div>

      <div style={{padding:"20px",maxWidth:800,margin:"0 auto"}}>

        {/* DASHBOARD */}
        {tab==="dashboard"&&(
          <div>
            <h2 style={{color:"#fff",fontWeight:900,fontSize:20,marginBottom:16}}>
              Übersicht
            </h2>
            {/* KPI Cards */}
            <div style={{display:"grid",gridTemplateColumns:"repeat(2,1fr)",gap:10,marginBottom:20}}>
              {[
                {label:"Vereine",        val:allClubs.length,           sub:"in Datenbank", col:"#7c3aed"},
                {label:"Teams",          val:allTeams.length,           sub:"gesamt",       col:"#2563eb"},
                {label:"Spieler",        val:allPlayers.length,         sub:"Profile",      col:"#16a34a"},
                {label:"Heute aktiv",    val:todayEvents.length,        sub:"Events heute", col:"#d97706"},
                {label:"Affiliate Klicks",val:affiliateClicks.length,   sub:"gesamt",       col:"#dc2626"},
                {label:"NPS Score",      val:nps?.score??"-",           sub:"Zufriedenheit",col:"#0891b2"},
              ].map(kpi=>(
                <div key={kpi.label} style={{background:"#1e293b",borderRadius:14,
                  padding:"16px",border:"1px solid #334155"}}>
                  <div style={{fontSize:11,color:"#64748b",fontWeight:700,marginBottom:4}}>
                    {kpi.label.toUpperCase()}
                  </div>
                  <div style={{fontWeight:900,fontSize:28,color:kpi.col,lineHeight:1}}>
                    {kpi.val}
                  </div>
                  <div style={{fontSize:11,color:"#475569",marginTop:4}}>{kpi.sub}</div>
                </div>
              ))}
            </div>
            {/* Wachstums-Chart (Balken) */}
            <div style={{background:"#1e293b",borderRadius:14,padding:"16px",
              border:"1px solid #334155",marginBottom:16}}>
              <div style={{fontSize:13,fontWeight:700,color:"#64748b",marginBottom:12}}>
                AKTIVITÄT LETZTE 7 TAGE
              </div>
              {(()=>{
                const days = Array.from({length:7},(_,i)=>{
                  const d = new Date(Date.now()-i*86400000);
                  return d.toISOString().slice(0,10);
                }).reverse();
                const maxVal = Math.max(1,...days.map(d=>analytics.filter(e=>e.date===d).length));
                return (
                  <div style={{display:"flex",gap:8,alignItems:"flex-end",height:80}}>
                    {days.map(d=>{
                      const count = analytics.filter(e=>e.date===d).length;
                      const h = Math.round((count/maxVal)*70)+10;
                      return (
                        <div key={d} style={{flex:1,display:"flex",flexDirection:"column",
                          alignItems:"center",gap:4}}>
                          <div style={{fontSize:9,color:"#475569"}}>{count}</div>
                          <div style={{width:"100%",height:h,borderRadius:"4px 4px 0 0",
                            background:d===today?"#7c3aed":"#334155"}}/>
                          <div style={{fontSize:8,color:"#475569",transform:"rotate(-30deg)"}}>
                            {d.slice(5)}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                );
              })()}
            </div>
            {/* Letzte Vereine */}
            <div style={{background:"#1e293b",borderRadius:14,padding:"16px",
              border:"1px solid #334155"}}>
              <div style={{fontSize:13,fontWeight:700,color:"#64748b",marginBottom:10}}>
                ZULETZT REGISTRIERTE VEREINE
              </div>
              {allClubs.slice(-5).reverse().map(cl=>(
                <div key={cl.id} style={{display:"flex",alignItems:"center",gap:10,
                  padding:"8px 0",borderBottom:"1px solid #1e293b"}}>
                  <div style={{width:32,height:32,borderRadius:9,
                    background:cl.pri||"#7c3aed",display:"flex",alignItems:"center",
                    justifyContent:"center",fontWeight:900,fontSize:13,color:"#fff",
                    flexShrink:0}}>
                    {cl.em||cl.name?.slice(0,1)||"V"}
                  </div>
                  <div style={{flex:1}}>
                    <div style={{display:"flex",alignItems:"center",gap:6,flexWrap:"wrap"}}>
                      <div style={{fontWeight:700,fontSize:13,color:"#e2e8f0"}}>{cl.name}</div>
                      <span style={{fontSize:9,fontWeight:800,color:"#34d399",background:"#064e3b",borderRadius:5,padding:"2px 6px",letterSpacing:.3}}>IN DATENBANK</span>
                    </div>
                    <div style={{fontSize:11,color:"#475569"}}>{cl.sport} - {cl.createdAt?.slice(0,10)||"unbekannt"}</div>
                  </div>
                </div>
              ))}
              {allClubs.length===0&&<p style={{color:"#475569",fontSize:13}}>Noch keine Vereine</p>}
            </div>
          </div>
        )}

        {/* AKTIVITÄT */}
        {tab==="activity"&&(
          <SuperAdminActivity data={data} allClubs={allClubs}/>
        )}

        {/* VEREINE */}
        {tab==="clubs"&&(
          <SuperAdminClubs data={data} allClubs={allClubs} allTeams={allTeams} allPlayers={allPlayers}/>
        )}

        {/* NACHRICHTEN */}
        {tab==="message"&&(
          <SuperAdminMessages data={data} allClubs={allClubs}/>
        )}

        {/* MODULE / ROLLOUT - beide Tabs zeigen den echten (global wirksamen)
            Feature-Manager. Der alte "Module"-Schalter (va_modules) hatte auf
            die App KEINE Wirkung und fuehrte in die Irre. */}
        {(tab==="modules"||tab==="rollout")&&(
          <SuperAdminRollout data={data}/>
        )}

        {/* EINNAHMEN */}
        {tab==="revenue"&&(
          <SuperAdminRevenue analytics={analytics} affiliateClicks={affiliateClicks} shareClicks={shareClicks} nps={nps}/>
        )}

        {/* ANALYTICS */}
        {tab==="analytics"&&(
          <SuperAdminAnalytics analytics={analytics} loginEvents={loginEvents} allClubs={allClubs}/>
        )}

        {/* LOGS */}
        {tab==="logs"&&(
          <SuperAdminLogs data={data}/>
        )}

        {/* EINSTELLUNGEN */}
        {tab==="affiliate"&&(
          <SuperAdminAffiliate data={data}/>
        )}

        {tab==="settings"&&(
          <SuperAdminSettings data={data}/>
        )}

        {/* COMPLIANCE / SICHERHEITS-STATUS */}
        {tab==="compliance"&&(
          <SuperAdminCompliance allClubs={allClubs} allPlayers={allPlayers}/>
        )}

        {/* GEO & SPRACHE */}
        {tab==="geo"&&(
          <SuperAdminGeoAnalytics/>
        )}

        {/* CHAT-MODERATION */}
        {tab==="moderation"&&(
          <SuperAdminModeration/>
        )}

        {/* DATENBANK - app_data Rows ansehen + loeschen */}
        {tab==="database"&&(
          <SuperAdminDatabase/>
        )}

        {/* ALTDATEN - verwaiste Datensaetze geloeschter Vereine finden + loeschen */}
        {tab==="orphans"&&(
          <SuperAdminOrphans data={data}/>
        )}
      </div>
    </div>
  );
}

/* -----------------------------------------------------------------
   ALTDATEN geloeschter Vereine (SuperAdmin)
   Findet alle Datensaetze (Turnier-Boerse, Live-Spiegel, Shard-Reste),
   die auf einen Verein verweisen, den es im Verzeichnis nicht mehr
   gibt - durchsuchbar, je Alt-Verein komplett loeschbar. Entfernt
   auch die verwaiste Shard-Zeile in der Datenbank (Zombie-Quelle).
----------------------------------------------------------------- */
function SuperAdminOrphans({ data }) {
  const [q,setQ]=useState("");
  const [busy,setBusy]=useState(null);
  const known=new Set((data.clubs||[]).map(c=>c.id));
  const CID_FIELDS=["cid","hostCid","byCid","clubId"];
  const NAME_FIELDS=["hostName","clubName","club","name","teamName","title","label"];
  const refs={};
  for(const [key,val] of Object.entries(data)){
    if(!Array.isArray(val)) continue;
    for(const rec of val){
      if(!rec||typeof rec!=="object") continue;
      for(const f of CID_FIELDS){
        const id=rec[f];
        if(typeof id==="string"&&id&&!known.has(id)&&!id.startsWith("demo")){
          const e=(refs[id] ||= {counts:{},names:new Set(),total:0});
          e.counts[key]=(e.counts[key]||0)+1; e.total++;
          for(const nf of NAME_FIELDS){ if(rec[nf]){ e.names.add(String(rec[nf]).slice(0,44)); break; } }
          break;
        }
      }
    }
  }
  const ql=q.trim().toLowerCase();
  const list=Object.entries(refs).map(([id,e])=>({id,counts:e.counts,total:e.total,names:[...e.names].slice(0,3)}))
    .filter(x=>!ql||x.id.toLowerCase().includes(ql)||x.names.some(n=>n.toLowerCase().includes(ql)))
    .sort((a,b)=>b.total-a.total);
  const purge=async(cid)=>{
    const e=refs[cid];
    if(!window.confirm(`Alle ${e.total} Alt-Datensätze von „${[...e.names][0]||cid}" endgültig löschen?\n\nDas kann nicht rückgängig gemacht werden.`)) return;
    setBusy(cid);
    const next={...data};
    for(const [key,val] of Object.entries(next)){
      if(!Array.isArray(val)) continue;
      next[key]=val.filter(rec=>!(rec&&typeof rec==="object"&&CID_FIELDS.some(f=>rec[f]===cid)));
    }
    try { await sb.set(next); } catch(err){ window.alert("Speichern fehlgeschlagen: "+String((err&&err.message)||err)); setBusy(null); return; }
    try { await sb.dbDelete(sb._clubKey(cid)); } catch {} // verwaiste Shard-Zeile mit entfernen
    window.location.reload();
  };
  return (
    <div>
      <h2 style={{color:"#fff",fontWeight:900,fontSize:20,marginBottom:6}}>Altdaten gelöschter Vereine</h2>
      <p style={{fontSize:12.5,color:"#64748b",lineHeight:1.55,marginBottom:14}}>
        Datensätze (z. B. Turnier-Ausschreibungen, Börsen-Anmeldungen, Live-Spiegel), die auf einen Verein
        verweisen, den es im Verzeichnis nicht mehr gibt. Löschen entfernt alle Verweise UND die verwaiste
        Datenbank-Zeile des Vereins – danach tauchen sie auch nach dem nächsten Sync nicht wieder auf.
      </p>
      <input value={q} onChange={e=>setQ(e.target.value)}
        placeholder="Suchen: Vereins-ID oder Name (z. B. aus der alten Einladung)…"
        style={{width:"100%",padding:"11px 14px",fontSize:14,background:"#1e293b",
          border:"1px solid #334155",borderRadius:11,color:"#fff",outline:"none",
          marginBottom:14,boxSizing:"border-box"}}/>
      {list.length===0&&(
        <div style={{background:"#1e293b",border:"1px dashed #334155",borderRadius:14,padding:"28px 20px",textAlign:"center",color:"#64748b",fontSize:13.5}}>
          {ql?"Keine Altdaten zu dieser Suche.":"Keine verwaisten Datensätze gefunden – Datenbank ist sauber. ✓"}
        </div>
      )}
      {list.map(x=>(
        <div key={x.id} style={{background:"#1e293b",border:"1px solid #7f1d1d",borderRadius:14,padding:"14px 16px",marginBottom:10}}>
          <div style={{display:"flex",alignItems:"center",gap:10,flexWrap:"wrap"}}>
            <div style={{flex:1,minWidth:180}}>
              <div style={{fontWeight:800,fontSize:14.5,color:"#fff"}}>{x.names[0]||"Unbekannter Verein"}</div>
              <div style={{fontSize:11,color:"#64748b",fontFamily:"monospace",marginTop:2}}>ID: {x.id}{x.names.length>1?` · auch: ${x.names.slice(1).join(", ")}`:""}</div>
            </div>
            <span style={{fontSize:12,fontWeight:800,color:"#fca5a5",background:"#7f1d1d55",borderRadius:8,padding:"4px 10px"}}>{x.total} Datensätze</span>
            <button onClick={()=>purge(x.id)} disabled={busy===x.id}
              style={{padding:"9px 16px",borderRadius:10,border:"none",background:busy===x.id?"#475569":"#dc2626",color:"#fff",fontWeight:800,fontSize:13,cursor:busy===x.id?"default":"pointer",fontFamily:"inherit"}}>
              {busy===x.id?"Lösche…":"Endgültig löschen"}
            </button>
          </div>
          <div style={{display:"flex",gap:6,flexWrap:"wrap",marginTop:10}}>
            {Object.entries(x.counts).map(([k,n])=>(
              <span key={k} style={{fontSize:11,fontWeight:700,color:"#94a3b8",background:"#0f172a",border:"1px solid #334155",borderRadius:7,padding:"3px 8px"}}>{k}: {n}</span>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

/* -----------------------------------------------------------------
   COMPLIANCE / SICHERHEITS-STATUS  (ehrliche Bestandsaufnahme)
----------------------------------------------------------------- */
// Affiliate-/Werbe-IDs pflegen – global gespeichert (data.affiliateIds), greift sofort.
function SuperAdminAffiliate({ data }){
  const FIELDS=[
    {k:"awin",label:"AWIN Publisher-ID",ph:"z.B. 123456",hint:"11teamsports, Decathlon, HRS u.a. laufen über AWIN"},
    {k:"amazon",label:"Amazon Partner-Tag",ph:"z.B. deinname-21",hint:"Amazon PartnerNet (Tracking-ID)"},
    {k:"owayo",label:"Owayo Partner-ID",ph:"",hint:"Trikot-/Teamwear-Druck"},
    {k:"hrs",label:"HRS Affiliate-ID",ph:"",hint:"Hotels / Reise"},
    {k:"jako",label:"JAKO Code",ph:"",hint:"Sportbekleidung (Direktpartner)"},
    {k:"trainerakademie",label:"Trainerakademie-ID",ph:"",hint:"Trainer-Weiterbildung"},
    {k:"adsense",label:"Google AdSense Publisher-ID",ph:"ca-pub-1234567890123456",hint:"Aktiviert die Display-Werbeflächen (Format ca-pub-…). AdSense-Konto muss freigeschaltet & Seite genehmigt sein."},
  ];
  const [f,setF]=useState(()=>({...AFFILIATE_IDS,...(data?.affiliateIds||{})}));
  const [saving,setSaving]=useState(false);
  const [saved,setSaved]=useState(false);
  const doSave=async()=>{
    setSaving(true);
    const clean={}; FIELDS.forEach(x=>clean[x.k]=(f[x.k]||"").trim());
    applyAffiliateIds(clean);
    try{ await sb.set({...data, affiliateIds:clean}); }catch{}
    setSaving(false); setSaved(true); setTimeout(()=>setSaved(false),2500);
  };
  const inp={width:"100%",padding:"11px 13px",fontSize:14,background:"#0f172a",border:"1px solid #334155",borderRadius:10,color:"#e2e8f0",outline:"none",boxSizing:"border-box",fontFamily:"inherit"};
  return (
    <div>
      <h2 style={{color:"#fff",fontWeight:900,fontSize:20,marginBottom:6}}>Werbung / Affiliate-IDs</h2>
      <p style={{color:"#64748b",fontSize:13,marginBottom:16,lineHeight:1.6}}>Trag hier deine Partner-IDs ein. Sobald eine ID gesetzt ist, werden die zugehörigen Angebote bevorzugt ausgespielt und Klicks dir zugeordnet. Leer = Platzhalter ohne Provision. Gilt für alle Vereine.</p>
      <div style={{display:"flex",flexDirection:"column",gap:14,maxWidth:480}}>
        {FIELDS.map(x=>(
          <div key={x.k}>
            <div style={{fontSize:12,fontWeight:800,color:"#64748b",marginBottom:5}}>{x.label}{(f[x.k]||"").trim()&&<span style={{color:"#22c55e",marginLeft:6}}>● aktiv</span>}</div>
            <input value={f[x.k]||""} onChange={e=>setF(s=>({...s,[x.k]:e.target.value}))} placeholder={x.ph} style={inp}/>
            {x.hint&&<div style={{fontSize:11,color:"#64748b",marginTop:4}}>{x.hint}</div>}
          </div>
        ))}
      </div>
      <button onClick={doSave} disabled={saving} style={{marginTop:18,padding:"12px 22px",borderRadius:11,border:"none",background:saved?"#16a34a":"#7c3aed",color:"#fff",fontWeight:800,fontSize:14,cursor:"pointer",fontFamily:"inherit"}}>{saving?"Speichert…":saved?"Gespeichert ✓":"Speichern"}</button>
      <p style={{color:"#475569",fontSize:11,marginTop:14,maxWidth:480,lineHeight:1.5}}>Weitere Netzwerke (neue Shops) brauchen zusätzlich einen passenden Werbeplatz im Code – sag Bescheid, dann ergänze ich das Angebot und hier erscheint automatisch ein Feld dafür.</p>
    </div>
  );
}

function SuperAdminCompliance({ allClubs, allPlayers }) {
  const STATUS = {
    ok:    { label:"Erfüllt",        col:"#16a34a", bg:"rgba(22,163,74,.15)" },
    part:  { label:"Teilweise",      col:"#d97706", bg:"rgba(217,119,6,.15)" },
    open:  { label:"Offen",          col:"#dc2626", bg:"rgba(220,38,38,.15)" },
    na:    { label:"Nicht relevant", col:"#64748b", bg:"rgba(100,116,139,.15)" },
  };
  const SECTIONS = [
    { title:"KI & EU AI Act", items:[
      { s:"na",   t:"Keine KI-Verarbeitung von Personendaten",
        d:"Die App nutzt bewusst keine externe KI. Skill-Auswertung & Trainings-Logik laufen regelbasiert und lokal. Damit ist der EU AI Act aktuell nicht einschlägig." },
      { s:"open", t:"Falls später KI ergänzt wird",
        d:"Sobald KI Kinderdaten verarbeitet, gelten Transparenz-, Risiko- und Einwilligungspflichten (EU AI Act + DSGVO). Dann hier neu bewerten." },
    ]},
    { title:"Datenschutz (DSGVO)", items:[
      { s:"ok",   t:"Datensparsamkeit",
        d:"Nur Vorname/Jahr/Mannschaft; Notizen als feste Auswahl statt Freitext; Skill-Profil rein sportlich." },
      { s:"ok",   t:"Werbe-Kennzeichnung",
        d:"Affiliate-/Werbe-Banner sind als „Werbung\"/„Anzeige\" gekennzeichnet." },
      { s:"part", t:"Datenschutzerklärung / Impressum / Nutzung",
        d:"Vollständige Vorlage vorhanden – echte Betreiberdaten eintragen und juristisch prüfen lassen." },
      { s:"part", t:"Eltern-Einwilligung (Minderjährige, Art. 8)",
        d:"Einwilligung für Team-Fotos vorhanden. Generelle Einwilligung zur Datenverarbeitung bei Anmeldung noch offen." },
      { s:"open", t:"Auftragsverarbeitungs-Vertrag (Supabase)",
        d:"Pflicht, sobald personenbezogene Daten in der Cloud gespeichert werden." },
    ]},
    { title:"Datenbank & Zugriff", items:[
      { s:"ok",   t:"Verschlüsselte Übertragung (HTTPS)",
        d:"Auslieferung über Vercel erfolgt per HTTPS." },
      { s:"open", t:"Zugriffstrennung (Row-Level-Security)",
        d:"SQL-Schema mit RLS als Vorlage vorhanden, aber noch nicht angebunden. Aktuell könnten Daten zu breit lesbar sein." },
      { s:"open", t:"Sichere Anmeldung & Passwörter",
        d:"Noch selbstgebautes Hashing. Empfehlung: Supabase-Auth – übernimmt sicheres Hashing/Sessions." },
      { s:"part", t:"Löschkonzept",
        d:"Daten lokal löschbar; serverseitiges, nachvollziehbares Löschen kommt mit der echten Datenbank." },
    ]},
  ];
  const counts = SECTIONS.flatMap(s=>s.items).reduce((a,i)=>{a[i.s]=(a[i.s]||0)+1;return a;},{});
  return (
    <div>
      <h2 style={{color:"#fff",fontWeight:900,fontSize:20,marginBottom:6}}>Compliance & Sicherheit</h2>
      <p style={{color:"#64748b",fontSize:12.5,lineHeight:1.6,marginBottom:16}}>
        Ehrliche Bestandsaufnahme – keine Rechtsberatung. Vor Echtbetrieb mit Kinderdaten fachkundig prüfen lassen.
      </p>
      <div style={{display:"flex",gap:8,flexWrap:"wrap",marginBottom:20}}>
        {Object.entries(STATUS).map(([k,v])=>(
          <div key={k} style={{display:"flex",alignItems:"center",gap:6,background:v.bg,borderRadius:8,padding:"5px 10px"}}>
            <span style={{width:8,height:8,borderRadius:"50%",background:v.col}}/>
            <span style={{fontSize:11.5,fontWeight:700,color:v.col}}>{v.label}</span>
            <span style={{fontSize:11.5,fontWeight:800,color:"#64748b"}}>{counts[k]||0}</span>
          </div>
        ))}
      </div>
      {SECTIONS.map(sec=>(
        <div key={sec.title} style={{marginBottom:22}}>
          <div style={{color:"#a78bfa",fontWeight:800,fontSize:13,letterSpacing:.4,marginBottom:10,textTransform:"uppercase"}}>{sec.title}</div>
          <div style={{display:"flex",flexDirection:"column",gap:8}}>
            {sec.items.map((it,i)=>{
              const st=STATUS[it.s];
              return (
                <div key={i} style={{background:"#1e293b",border:"1px solid #334155",borderRadius:12,padding:"13px 15px"}}>
                  <div style={{display:"flex",alignItems:"center",gap:10,marginBottom:5}}>
                    <span style={{width:10,height:10,borderRadius:"50%",background:st.col,flexShrink:0}}/>
                    <span style={{flex:1,fontWeight:700,fontSize:14,color:"#e2e8f0"}}>{it.t}</span>
                    <span style={{fontSize:11,fontWeight:800,color:st.col,background:st.bg,borderRadius:7,padding:"3px 9px",whiteSpace:"nowrap"}}>{st.label}</span>
                  </div>
                  <div style={{fontSize:12.5,color:"#64748b",lineHeight:1.55,paddingLeft:20}}>{it.d}</div>
                </div>
              );
            })}
          </div>
        </div>
      ))}
    </div>
  );
}

/* -----------------------------------------------------------------
   DATENBANK-INSPEKTOR - alle app_data-Zeilen + Loeschen
----------------------------------------------------------------- */
function SuperAdminDatabase() {
  const [rows, setRows] = useState([]);
  const [counts, setCounts] = useState({});
  const [busy, setBusy] = useState(true);
  const [err, setErr] = useState("");
  const [selected, setSelected] = useState(null); // {key,value,updated_at}
  const [filter, setFilter] = useState("");

  const refresh = async () => {
    setBusy(true); setErr("");
    try {
      const list = await sb.dbList();
      setRows(list);
      const c = await sb.dbCounts();
      setCounts(c);
    } catch(e) {
      setErr(String((e&&e.message)||e));
    }
    setBusy(false);
  };

  useEffect(()=>{ refresh(); }, []);

  const del = async (key) => {
    if (!window.confirm(`Zeile "${key}" wirklich löschen?\n\nUnwiderruflich. Wird beim nächsten App-Öffnen ggf. neu erzeugt.`)) return;
    try {
      await sb.dbDelete(key);
      setSelected(null);
      await refresh();
    } catch(e) {
      window.alert("Löschen fehlgeschlagen: " + String((e&&e.message)||e));
    }
  };

  const purgeDbTest = async () => {
    const targets = rows.filter(r => r.key.endsWith("__dbtest"));
    if (targets.length === 0) { window.alert("Keine __dbtest-Zeilen vorhanden."); return; }
    if (!window.confirm(`${targets.length} __dbtest-Zeile(n) löschen?`)) return;
    for (const r of targets) {
      try { await sb.dbDelete(r.key); } catch {}
    }
    await refresh();
  };

  const makeBackup = async () => {
    setBusy(true);
    try {
      const key = await sb.backupCreate();
      await refresh();
      window.alert("Backup erstellt: "+key);
    } catch (e) {
      window.alert("Backup fehlgeschlagen: "+String((e&&e.message)||e));
    }
    setBusy(false);
  };

  const restoreBackup = async (key) => {
    if (!window.confirm("BACKUP WIEDERHERSTELLEN?\n\nDie aktuellen Zeilen (globaler Stand + alle Vereins-Shards) werden mit dem Inhalt aus\n  "+key+"\nüberschrieben. App muss danach von allen Geräten neu geladen werden.\n\nFortfahren?")) return;
    setBusy(true);
    try {
      const n = await sb.backupRestore(key);
      await refresh();
      window.alert(`${n} Zeilen wiederhergestellt.`);
    } catch (e) {
      window.alert("Restore fehlgeschlagen: "+String((e&&e.message)||e));
    }
    setBusy(false);
  };

  const downloadAll = () => {
    const blob = new Blob([JSON.stringify({ exportedAt:new Date().toISOString(), rows }, null, 2)], { type:"application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `vereinsapp-export-${new Date().toISOString().slice(0,10)}.json`;
    document.body.appendChild(a); a.click(); a.remove();
    setTimeout(()=>URL.revokeObjectURL(url), 1000);
  };

  const fmtBytes = (n) => n < 1024 ? `${n} B` : n < 1024*1024 ? `${(n/1024).toFixed(1)} KB` : `${(n/1024/1024).toFixed(1)} MB`;
  const sizeOf = (val) => { try { return JSON.stringify(val||{}).length; } catch { return 0; } };
  const labelOf = (r) => {
    if (r.key.includes("__backup_"))  return "Backup-Snapshot";
    if (r.key.endsWith("__global"))   return "Globaler Stand (Vereinsliste + Seasons)";
    if (r.key.endsWith("__dbtest"))   return "Test-Schreibzugriff";
    if (r.key.includes("__club_"))    return "Verein-Daten (Events, Spieler, Trainer)";
    return "Sonstiges / Legacy";
  };
  const isBackup = (r) => r.key.includes("__backup_");
  const clubsInRow = (val) => Array.isArray(val?.clubs) ? val.clubs : null;
  const visible = rows.filter(r => !filter || r.key.toLowerCase().includes(filter.toLowerCase()));
  const totalSize = rows.reduce((s,r)=>s+sizeOf(r.value), 0);

  return (
    <div>
      <h2 style={{color:"#fff",fontWeight:900,fontSize:20,marginBottom:8}}>Datenbank-Inspektor</h2>
      <p style={{color:"#64748b",fontSize:13,marginBottom:16,lineHeight:1.55}}>
        Direkter Blick auf die Supabase-Tabelle <code style={{background:"#1e293b",padding:"2px 6px",borderRadius:5,fontSize:12}}>public.app_data</code>. Jede Zeile löschbar – die App regeneriert globalen Stand und Verein-Shards automatisch beim nächsten Schreibzugriff.
      </p>

      {/* Counts */}
      <div style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:8,marginBottom:18}}>
        {[
          {l:"Zeilen", v:rows.length, col:"#7c3aed"},
          {l:"Gesamt-Größe", v:fmtBytes(totalSize), col:"#2563eb"},
          {l:"Push-Abos", v:counts.pushSubs||"…", col:"#16a34a"},
          {l:"Mitglieder", v:counts.members||"…", col:"#d97706"},
        ].map(s=>(
          <div key={s.l} style={{background:"#1e293b",border:"1px solid #334155",borderRadius:12,padding:"12px 14px"}}>
            <div style={{fontSize:11,fontWeight:700,color:"#64748b",letterSpacing:.4,marginBottom:4}}>{s.l.toUpperCase()}</div>
            <div style={{fontSize:18,fontWeight:900,color:s.col}}>{s.v}</div>
          </div>
        ))}
      </div>

      {/* Toolbar */}
      <div style={{display:"flex",gap:8,marginBottom:10,flexWrap:"wrap"}}>
        <input value={filter} onChange={e=>setFilter(e.target.value)} placeholder="Nach key filtern…"
          style={{flex:1,minWidth:200,padding:"9px 12px",fontSize:13,background:"#0f172a",border:"1px solid #334155",borderRadius:10,color:"#e2e8f0",outline:"none",fontFamily:"inherit"}}/>
        <button onClick={refresh} disabled={busy}
          style={{padding:"9px 14px",borderRadius:10,border:"none",background:"#334155",color:"#fff",fontWeight:700,fontSize:13,cursor:busy?"default":"pointer",fontFamily:"inherit"}}>
          {busy?"Lädt…":"Neu laden"}
        </button>
      </div>
      {/* Backup-Leiste */}
      <div style={{display:"flex",gap:8,marginBottom:14,flexWrap:"wrap",alignItems:"center",
        background:"#1e293b",border:"1px solid #334155",borderRadius:11,padding:"10px 14px"}}>
        <div style={{flex:1,minWidth:160,fontSize:12,color:"#64748b",lineHeight:1.4}}>
          <b style={{color:"#64748b"}}>🛟 Sicherung</b><br/>
          Snapshot aller Cloud-Zeilen. Restore überschreibt die enthaltenen Zeilen mit dem Backup-Stand.
        </div>
        <button onClick={makeBackup} disabled={busy}
          style={{padding:"9px 14px",borderRadius:10,border:"1.5px solid #16a34a",background:"#052e16",color:"#86efac",fontWeight:700,fontSize:13,cursor:busy?"default":"pointer",fontFamily:"inherit"}}>
          Backup erstellen
        </button>
        <button onClick={downloadAll}
          style={{padding:"9px 14px",borderRadius:10,border:"1.5px solid #334155",background:"transparent",color:"#64748b",fontWeight:700,fontSize:13,cursor:"pointer",fontFamily:"inherit"}}>
          Als JSON-Datei
        </button>
        <button onClick={purgeDbTest}
          style={{padding:"9px 14px",borderRadius:10,border:"1.5px solid #dc2626",background:"transparent",color:"#fca5a5",fontWeight:700,fontSize:13,cursor:"pointer",fontFamily:"inherit"}}>
          __dbtest aufräumen
        </button>
      </div>

      {err && (
        <div style={{background:"#450a0a",border:"1px solid #dc2626",borderRadius:11,padding:"11px 14px",marginBottom:14,color:"#fca5a5",fontSize:13}}>
          Fehler beim Laden: {err}
        </div>
      )}

      {/* Liste */}
      <div style={{display:"flex",flexDirection:"column",gap:8}}>
        {visible.map(r=>{
          const clubs = clubsInRow(r.value);
          return (
            <div key={r.key} style={{background:"#1e293b",border:"1px solid #334155",borderRadius:13,padding:"13px 16px"}}>
              <div style={{display:"flex",alignItems:"center",gap:10,marginBottom:6}}>
                <div style={{flex:1,minWidth:0}}>
                  <div style={{display:"flex",alignItems:"center",gap:8,flexWrap:"wrap"}}>
                    <code style={{color:"#a78bfa",fontSize:13,fontWeight:700,wordBreak:"break-all"}}>{r.key}</code>
                  </div>
                  <div style={{fontSize:11,color:"#64748b",marginTop:3}}>
                    {labelOf(r)} · {fmtBytes(sizeOf(r.value))} · zuletzt {new Date(r.updated_at).toLocaleString("de-DE")}
                  </div>
                </div>
                {isBackup(r) && (
                  <button onClick={()=>restoreBackup(r.key)}
                    style={{padding:"7px 12px",borderRadius:9,border:"1.5px solid #16a34a",background:"#052e16",color:"#86efac",fontWeight:700,fontSize:12,cursor:"pointer",fontFamily:"inherit"}}>
                    Restore
                  </button>
                )}
                <button onClick={()=>setSelected(r)}
                  style={{padding:"7px 12px",borderRadius:9,border:"1.5px solid #334155",background:"transparent",color:"#64748b",fontWeight:700,fontSize:12,cursor:"pointer",fontFamily:"inherit"}}>
                  Anzeigen
                </button>
                <button onClick={()=>del(r.key)}
                  style={{padding:"7px 12px",borderRadius:9,border:"1.5px solid #dc2626",background:"transparent",color:"#fca5a5",fontWeight:700,fontSize:12,cursor:"pointer",fontFamily:"inherit"}}>
                  Löschen
                </button>
              </div>
              {clubs && clubs.length > 0 && r.key.endsWith("__global") && (
                <div style={{marginTop:6,paddingTop:8,borderTop:"1px solid #334155"}}>
                  <div style={{fontSize:10,fontWeight:800,color:"#64748b",letterSpacing:.5,marginBottom:4}}>VEREINE ({clubs.length})</div>
                  <div style={{display:"flex",flexWrap:"wrap",gap:5}}>
                    {clubs.map(c=>(
                      <span key={c.id} style={{fontSize:11,fontWeight:600,color:"#e2e8f0",background:"#0f172a",border:"1px solid #334155",borderRadius:6,padding:"3px 8px"}}>
                        {c.name || c.id}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          );
        })}
        {!busy && visible.length === 0 && (
          <div style={{textAlign:"center",padding:"40px",color:"#475569",fontSize:14}}>
            Keine Zeilen{filter?" für diesen Filter":""}.
          </div>
        )}
      </div>

      {/* Detail-Modal */}
      {selected && (
        <div onClick={()=>setSelected(null)} style={{position:"fixed",inset:0,background:"rgba(0,0,0,.75)",
          display:"flex",alignItems:"center",justifyContent:"center",zIndex:9999,padding:18}}>
          <div onClick={e=>e.stopPropagation()} style={{background:"#0f172a",borderRadius:16,
            width:"100%",maxWidth:820,maxHeight:"88vh",display:"flex",flexDirection:"column",border:"1px solid #334155"}}>
            <div style={{padding:"16px 20px",borderBottom:"1px solid #334155",display:"flex",justifyContent:"space-between",alignItems:"flex-start",gap:12}}>
              <div style={{flex:1,minWidth:0}}>
                <code style={{color:"#a78bfa",fontSize:13,fontWeight:700,wordBreak:"break-all"}}>{selected.key}</code>
                <div style={{fontSize:11,color:"#64748b",marginTop:4}}>
                  {labelOf(selected)} · {fmtBytes(sizeOf(selected.value))} · {new Date(selected.updated_at).toLocaleString("de-DE")}
                </div>
              </div>
              <div style={{display:"flex",gap:6}}>
                <button onClick={()=>{ try{ navigator.clipboard.writeText(JSON.stringify(selected.value,null,2)); }catch{} }}
                  style={{padding:"7px 12px",borderRadius:9,border:"1.5px solid #334155",background:"transparent",color:"#64748b",fontWeight:700,fontSize:12,cursor:"pointer",fontFamily:"inherit"}}>
                  Kopieren
                </button>
                <button onClick={()=>del(selected.key)}
                  style={{padding:"7px 12px",borderRadius:9,border:"1.5px solid #dc2626",background:"transparent",color:"#fca5a5",fontWeight:700,fontSize:12,cursor:"pointer",fontFamily:"inherit"}}>
                  Löschen
                </button>
                <button onClick={()=>setSelected(null)} style={{background:"none",border:"none",color:"#64748b",fontSize:22,cursor:"pointer",padding:"0 6px",fontFamily:"inherit"}}>×</button>
              </div>
            </div>
            <pre style={{flex:1,overflow:"auto",margin:0,padding:"16px 20px",fontSize:11.5,color:"#64748b",fontFamily:"monospace",lineHeight:1.55,whiteSpace:"pre-wrap",wordBreak:"break-word"}}>
              {JSON.stringify(selected.value, null, 2)}
            </pre>
          </div>
        </div>
      )}
    </div>
  );
}

/* -----------------------------------------------------------------
   VEREINE VERWALTUNG
----------------------------------------------------------------- */
function SuperAdminActivity({ data, allClubs }) {
  const log = (data.securityLog||[]).filter(e=>e.type==="login");
  const today = new Date().toISOString().slice(0,10);
  const dayStr = d => new Date(Date.now()-d*86400000).toISOString().slice(0,10);
  // Anmeldungen pro Tag (letzte 14 Tage) aus dem echten securityLog
  const days = [];
  for(let i=13;i>=0;i--){
    const ds = dayStr(i);
    const cnt = log.filter(e=>(e.ts||"").slice(0,10)===ds).length;
    days.push({ ds, cnt, label: new Date(ds).toLocaleDateString("de-DE",{day:"2-digit",month:"2-digit"}) });
  }
  const maxCnt = Math.max(1,...days.map(d=>d.cnt));
  const todayCnt = days[days.length-1].cnt;
  const week = log.filter(e=>(e.ts||"").slice(0,10)>=dayStr(6)).length;
  // aktive Vereine = mind. 1 Login in letzten 30 Tagen
  const d30 = dayStr(30);
  const activeClubIds = new Set(log.filter(e=>(e.ts||"").slice(0,10)>=d30).map(e=>e.cid));
  // Vereine mit letzter Aktivität, sortiert (älteste zuerst → Löschkandidaten oben)
  const clubRows = allClubs.map(c=>{
    const la = c.lastActive || null;
    const days = la ? Math.floor((Date.now()-new Date(la).getTime())/86400000) : null;
    return { id:c.id, name:c.name, lastActive:la, daysAgo:days };
  }).sort((a,b)=>{
    if(a.daysAgo==null) return 1; if(b.daysAgo==null) return -1; return b.daysAgo-a.daysAgo;
  });
  const stale = clubRows.filter(c=>c.daysAgo!=null && c.daysAgo>=365).length;
  const card = (l,v,col)=>(
    <div key={l} style={{background:"#1e293b",borderRadius:13,padding:"14px",border:"1px solid #334155",textAlign:"center"}}>
      <div style={{fontWeight:900,fontSize:24,color:col}}>{v}</div>
      <div style={{fontSize:11,color:"#64748b",marginTop:3}}>{l}</div>
    </div>
  );
  return (
    <div>
      <h2 style={{color:"#fff",fontWeight:900,fontSize:20,marginBottom:6}}>Aktivität</h2>
      <p style={{color:"#64748b",fontSize:12,marginBottom:16}}>Basiert auf dem synchronisierten Login-Protokoll aller Vereine.</p>
      <div style={{display:"grid",gridTemplateColumns:"repeat(2,1fr)",gap:10,marginBottom:18}}>
        {card("Anmeldungen heute",todayCnt,"#d97706")}
        {card("Anmeldungen (7 Tage)",week,"#2563eb")}
        {card("Aktive Vereine (30 T.)",activeClubIds.size,"#16a34a")}
        {card("Vereine gesamt",allClubs.length,"#7c3aed")}
      </div>

      <div style={{background:"#1e293b",borderRadius:14,padding:"16px",border:"1px solid #334155",marginBottom:18}}>
        <div style={{fontSize:11,fontWeight:700,color:"#64748b",marginBottom:14}}>ANMELDUNGEN PRO TAG (LETZTE 14 TAGE)</div>
        <div style={{display:"flex",alignItems:"flex-end",gap:4,height:120}}>
          {days.map(d=>(
            <div key={d.ds} style={{flex:1,display:"flex",flexDirection:"column",alignItems:"center",gap:4}}>
              <div style={{fontSize:10,color:"#64748b",fontWeight:700}}>{d.cnt||""}</div>
              <div style={{width:"100%",height:`${Math.round(d.cnt/maxCnt*80)}px`,minHeight:d.cnt?4:1,background:d.ds===today?"#d97706":"#7c3aed",borderRadius:"4px 4px 0 0",transition:"height .3s"}}/>
              <div style={{fontSize:8.5,color:"#475569",transform:"rotate(-45deg)",whiteSpace:"nowrap",marginTop:2}}>{d.label}</div>
            </div>
          ))}
        </div>
      </div>

      <div style={{background:"#1e293b",borderRadius:14,padding:"16px",border:"1px solid #334155"}}>
        <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:12}}>
          <div style={{fontSize:11,fontWeight:700,color:"#64748b"}}>VEREINE – ZULETZT ONLINE (ÄLTESTE ZUERST)</div>
          {stale>0&&<span style={{fontSize:10.5,fontWeight:800,color:"#fca5a5",background:"#450a0a",borderRadius:6,padding:"2px 8px"}}>{stale} über 1 Jahr inaktiv</span>}
        </div>
        {clubRows.length===0&&<p style={{color:"#475569",fontSize:13}}>Noch keine Vereine.</p>}
        {clubRows.map(c=>{
          const danger = c.daysAgo!=null && c.daysAgo>=365;
          const warn = c.daysAgo!=null && c.daysAgo>=300 && c.daysAgo<365;
          return (
            <div key={c.id} style={{display:"flex",alignItems:"center",gap:10,padding:"9px 0",borderBottom:"1px solid #283548"}}>
              <div style={{flex:1,minWidth:0}}>
                <div style={{fontSize:13,fontWeight:700,color:"#e2e8f0",whiteSpace:"nowrap",overflow:"hidden",textOverflow:"ellipsis"}}>{c.name}</div>
                <div style={{fontSize:11,color:"#64748b"}}>{c.lastActive?new Date(c.lastActive).toLocaleDateString("de-DE",{day:"2-digit",month:"2-digit",year:"numeric"}):"noch nie eingeloggt"}</div>
              </div>
              <div style={{fontSize:11,fontWeight:800,color:danger?"#fca5a5":warn?"#fbbf24":"#16a34a",whiteSpace:"nowrap"}}>
                {c.daysAgo==null?"–":c.daysAgo===0?"heute":c.daysAgo+" Tage"}
              </div>
            </div>
          );
        })}
        <p style={{fontSize:11,color:"#475569",marginTop:12,lineHeight:1.5}}>Vereine ohne Anmeldung seit über 1 Jahr sind rot markiert – Kandidaten für eine Bereinigung.</p>
      </div>
    </div>
  );
}

function SuperAdminClubs({ data, allClubs, allTeams, allPlayers }) {
  const [search, setSearch] = useState("");
  const [selClub, setSelClub] = useState(null);
  const [note, setNote] = useState("");

  const filtered = allClubs.filter(cl=>
    !search || cl.name?.toLowerCase().includes(search.toLowerCase())
  );

  const deleteClub = async (clubId) => {
    if(!confirm("Verein wirklich löschen? Alle Daten gehen verloren.")) return;
    const nextData = {
      ...data,
      clubs: (data.clubs||[]).filter(x=>x.id!==clubId),
      teams: (data.teams||[]).filter(x=>x.cid!==clubId),
      trainers: (data.trainers||[]).filter(x=>x.cid!==clubId),
      events: (data.events||[]).filter(x=>x.cid!==clubId),
      playerProfiles: (data.playerProfiles||[]).filter(x=>x.cid!==clubId),
    };
    // Echte Persistenz: globale Zeile (Vereinsliste ohne den Verein) schreiben
    // UND die Shard-Zeile des Vereins entfernen. localStorage allein wuerde der
    // naechste Cloud-Read sofort wieder ueberschreiben.
    try { await sb.set(nextData); } catch {}
    try { await sb.dbDelete(sb._clubKey(clubId)); } catch {}
    window.location.reload();
  };

  const toggleBlock = async (clubId, isBlocked) => {
    const nextData = {
      ...data,
      clubs: (data.clubs||[]).map(cl=>cl.id===clubId?{...cl,blocked:!isBlocked}:cl),
    };
    try { await sb.set(nextData); } catch {}
    window.location.reload();
  };

  return (
    <div>
      <h2 style={{color:"#fff",fontWeight:900,fontSize:20,marginBottom:16}}>
        Vereine ({allClubs.length})
      </h2>
      <input value={search} onChange={e=>setSearch(e.target.value)}
        placeholder="Verein suchen..."
        style={{width:"100%",padding:"11px 14px",fontSize:14,background:"#1e293b",
          border:"1px solid #334155",borderRadius:11,color:"#fff",outline:"none",
          marginBottom:14,boxSizing:"border-box"}}/>
      {filtered.map(cl=>{
        const teams = allTeams.filter(t=>t.cid===cl.id);
        const players = allPlayers.filter(p=>teams.find(t=>t.id===p.mainTid));
        const saData = saGet()?.clubNotes||{};
        return (
          <div key={cl.id} style={{background:"#1e293b",borderRadius:14,
            border:`1px solid ${cl.blocked?"#dc2626":"#334155"}`,marginBottom:10,
            overflow:"hidden"}}>
            <div style={{padding:"13px 16px",display:"flex",alignItems:"center",gap:10}}>
              <div style={{width:38,height:38,borderRadius:10,
                background:cl.pri||"#7c3aed",display:"flex",alignItems:"center",
                justifyContent:"center",fontWeight:900,fontSize:14,color:"#fff",
                flexShrink:0}}>
                {cl.em||cl.name?.slice(0,1)||"V"}
              </div>
              <div style={{flex:1,minWidth:0}}>
                <div style={{fontWeight:700,fontSize:14,color:"#e2e8f0",
                  display:"flex",alignItems:"center",gap:6}}>
                  {cl.name}
                  {cl.blocked&&<span style={{background:"#dc2626",color:"#fff",
                    borderRadius:99,padding:"1px 7px",fontSize:10,fontWeight:800}}>
                    GESPERRT
                  </span>}
                </div>
                <div style={{fontSize:11,color:"#475569",marginTop:2}}>
                  {cl.sport} - {teams.length} Teams - {players.length} Spieler
                  {cl.adminEmail&&` - ${cl.adminEmail}`}
                </div>
              </div>
            </div>
            <div style={{display:"flex",gap:8,padding:"0 16px 12px",flexWrap:"wrap"}}>
              <button onClick={()=>setSelClub(selClub?.id===cl.id?null:cl)}
                style={{padding:"5px 12px",borderRadius:8,border:"1px solid #334155",
                  background:"transparent",color:"#64748b",fontWeight:600,fontSize:11,
                  cursor:"pointer",fontFamily:"inherit"}}>
                {selClub?.id===cl.id?"Schließen":"Details"}
              </button>
              <button onClick={()=>toggleBlock(cl.id, cl.blocked)}
                style={{padding:"5px 12px",borderRadius:8,border:"none",
                  background:cl.blocked?"#16a34a":"#d97706",
                  color:"#fff",fontWeight:700,fontSize:11,cursor:"pointer",fontFamily:"inherit"}}>
                {cl.blocked?"Entsperren":"Sperren"}
              </button>
              <button onClick={()=>deleteClub(cl.id)}
                style={{padding:"5px 12px",borderRadius:8,border:"none",
                  background:"#dc2626",color:"#fff",fontWeight:700,fontSize:11,
                  cursor:"pointer",fontFamily:"inherit"}}>
                Löschen
              </button>
            </div>
            {selClub?.id===cl.id&&(
              <div style={{padding:"0 16px 14px",borderTop:"1px solid #0f172a"}}>
                <div style={{fontSize:11,color:"#475569",marginTop:10,marginBottom:6}}>
                  INTERNE NOTIZ
                </div>
                <textarea
                  value={note||saData[cl.id]||""}
                  onChange={e=>{
                    setNote(e.target.value);
                    const cur = saGet()||{};
                    saSet({...cur, clubNotes:{...(cur.clubNotes||{}), [cl.id]:e.target.value}});
                  }}
                  placeholder="Notiz zu diesem Verein..."
                  rows={2}
                  style={{width:"100%",padding:"9px 12px",fontSize:12,background:"#0f172a",
                    border:"1px solid #334155",borderRadius:9,color:"#64748b",
                    outline:"none",resize:"none",fontFamily:"inherit",boxSizing:"border-box"}}
                />
              </div>
            )}
          </div>
        );
      })}
      {filtered.length===0&&(
        <p style={{color:"#475569",textAlign:"center",padding:"40px"}}>
          {allClubs.length===0?"Noch keine Vereine registriert":"Keine Treffer"}
        </p>
      )}
    </div>
  );
}

/* -----------------------------------------------------------------
   SYSTEM NACHRICHTEN
----------------------------------------------------------------- */
function SuperAdminMessages({ data, allClubs }) {
  const [msg, setMsg] = useState("");
  const [target, setTarget] = useState("all");
  const [sent, setSent] = useState(false);

  const send = () => {
    if(!msg.trim()) return;
    const sysMsg = {
      id: Math.random().toString(36).slice(2),
      type: "system",
      text: "[System] " + msg.trim(),
      ts: Date.now(),
      target,
      sentAt: new Date().toISOString(),
    };
    const cur = saGet()||{};
    saSet({...cur, messages:[...(cur.messages||[]),sysMsg]});
    setSent(true);
    setMsg("");
    setTimeout(()=>setSent(false),2000);
  };

  const history = saGet()?.messages||[];

  return (
    <div>
      <h2 style={{color:"#fff",fontWeight:900,fontSize:20,marginBottom:16}}>
        System-Nachrichten
      </h2>
      <div style={{background:"#1e293b",borderRadius:14,padding:"16px",
        border:"1px solid #334155",marginBottom:16}}>
        <div style={{fontSize:11,fontWeight:700,color:"#64748b",marginBottom:10}}>
          EMPFÄNGER
        </div>
        <div style={{display:"flex",gap:8,marginBottom:14,flexWrap:"wrap"}}>
          <button onClick={()=>setTarget("all")}
            style={{padding:"7px 14px",borderRadius:9,border:`1.5px solid ${target==="all"?"#7c3aed":"#334155"}`,
              background:target==="all"?"#7c3aed":"transparent",
              color:target==="all"?"#fff":"#64748b",fontWeight:700,fontSize:12,
              cursor:"pointer",fontFamily:"inherit"}}>
            Alle Vereine ({allClubs.length})
          </button>
          {allClubs.map(cl=>(
            <button key={cl.id} onClick={()=>setTarget(cl.id)}
              style={{padding:"7px 14px",borderRadius:9,
                border:`1.5px solid ${target===cl.id?"#7c3aed":"#334155"}`,
                background:target===cl.id?"#7c3aed":"transparent",
                color:target===cl.id?"#fff":"#64748b",fontWeight:600,fontSize:12,
                cursor:"pointer",fontFamily:"inherit"}}>
              {cl.name}
            </button>
          ))}
        </div>
        <textarea value={msg} onChange={e=>setMsg(e.target.value)}
          placeholder="Systemnachricht eingeben... (erscheint im Posteingang der Vereine)"
          rows={4}
          style={{width:"100%",padding:"12px 14px",fontSize:14,background:"#0f172a",
            border:"1px solid #334155",borderRadius:11,color:"#e2e8f0",outline:"none",
            resize:"none",fontFamily:"inherit",marginBottom:12,boxSizing:"border-box"}}/>
        <button onClick={send} disabled={!msg.trim()}
          style={{width:"100%",padding:"12px",borderRadius:12,border:"none",
            background:msg.trim()?"#7c3aed":"#334155",color:"#fff",
            fontWeight:800,fontSize:14,cursor:"pointer",fontFamily:"inherit"}}>
          {sent?"Gesendet!":"Nachricht senden"}
        </button>
      </div>
      {/* Verlauf */}
      {history.length>0&&(
        <div>
          <div style={{fontSize:11,fontWeight:700,color:"#64748b",marginBottom:10}}>
            GESENDETE NACHRICHTEN
          </div>
          {history.slice().reverse().map(m=>(
            <div key={m.id} style={{background:"#1e293b",borderRadius:11,
              padding:"11px 14px",marginBottom:8,border:"1px solid #334155"}}>
              <div style={{fontWeight:600,fontSize:13,color:"#e2e8f0"}}>{m.text}</div>
              <div style={{fontSize:11,color:"#475569",marginTop:4}}>
                {new Date(m.sentAt).toLocaleString("de-DE")} -
                Empfänger: {m.target==="all"?"Alle":m.target}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

/* -----------------------------------------------------------------
   MODULE EIN/AUSSCHALTEN
----------------------------------------------------------------- */
function SuperAdminModules({ modules, setModule }) {
  const [, forceUpdate] = useState(0);
  const toggle = (key) => {
    setModule(key, !modules[key].enabled);
    forceUpdate(n=>n+1);
  };
  const cats = {
    "Kern-Features": ["chat","helpers","jerseys","fields","training","results","attendance"],
    "Community": ["news","directory","registration","multilang"],
    "Monetarisierung": ["affiliate","marketing"],
  };
  return (
    <div>
      <h2 style={{color:"#fff",fontWeight:900,fontSize:20,marginBottom:8}}>Module</h2>
      <p style={{fontSize:13,color:"#64748b",marginBottom:16}}>
        Deaktivierte Module werden für alle Nutzer ausgeblendet.
        Änderungen gelten sofort beim nächsten Laden.
      </p>
      {Object.entries(cats).map(([catName, keys])=>(
        <div key={catName} style={{marginBottom:20}}>
          <div style={{fontSize:11,fontWeight:800,color:"#7c3aed",
            marginBottom:10,letterSpacing:.5}}>
            {catName.toUpperCase()}
          </div>
          {keys.map(key=>{
            const mod = modules[key]||MODULE_DEFAULTS[key];
            if(!mod) return null;
            return (
              <div key={key} style={{display:"flex",alignItems:"center",gap:12,
                padding:"12px 14px",background:"#1e293b",borderRadius:12,
                border:`1px solid ${mod.enabled?"#334155":"#dc2626"}`,
                marginBottom:8}}>
                <div style={{flex:1}}>
                  <div style={{fontWeight:700,fontSize:14,
                    color:mod.enabled?"#e2e8f0":"#475569"}}>
                    {mod.label}
                  </div>
                  <div style={{fontSize:11,color:mod.enabled?"#64748b":"#dc2626",marginTop:2}}>
                    {mod.enabled?"Aktiv":"Deaktiviert - für alle Nutzer unsichtbar"}
                  </div>
                </div>
                <div onClick={()=>toggle(key)}
                  style={{width:48,height:26,borderRadius:99,
                    background:mod.enabled?"#7c3aed":"#334155",cursor:"pointer",
                    position:"relative",transition:"background .2s",flexShrink:0}}>
                  <div style={{position:"absolute",top:3,
                    left:mod.enabled?24:3,width:20,height:20,borderRadius:"50%",
                    background:"#fff",transition:"left .2s",
                    boxShadow:"0 1px 4px rgba(0,0,0,.3)"}}/>
                </div>
              </div>
            );
          })}
        </div>
      ))}
    </div>
  );
}

/* -----------------------------------------------------------------
   EINNAHMEN & MONETARISIERUNG
----------------------------------------------------------------- */
function SuperAdminRevenue({ analytics, affiliateClicks, shareClicks, nps }) {
  const byPartner = affiliateClicks.reduce((acc,e)=>{
    const p=e.detail||"unbekannt";
    acc[p]=(acc[p]||0)+1;
    return acc;
  },{});
  // Geschaetzte durchschnittliche Provisionen je Partner (Quelle: oeffentliche Programm-Beschreibungen).
  const RATES = {
    "owayo-jerseys":0.12,
    "11teamsports-jerseys":0.06, "11teamsports-players":0.06,
    "amazon-jerseys":0.04, "amazon-players":0.04, "amazon-events":0.04,
    "amazon-fields":0.04, "amazon-cam":0.04,
    "hrs-events":0.05,
    "trainerakademie":0.08,
    "supabase":0.10,
  };
  // Geschaetzte Einnahmen pro Klick und Partner
  const estPerPartner = {};
  let totalRevEst = 0;
  for (const [p,cnt] of Object.entries(byPartner)) {
    const eur = cnt * (RATES[p]||0.03);
    estPerPartner[p] = eur;
    totalRevEst += eur;
  }

  // ===== Tatsaechliche Einnahmen (manuell, im SA-localStorage) =====
  const sa = saGet() || {};
  const [revs, setRevs] = useState(sa.revenue || []);
  const [showAdd, setShowAdd] = useState(false);
  const [form, setForm] = useState({
    partner: AFFILIATES[0]?.id || "",
    amount: "",
    month: new Date().toISOString().slice(0,7),
    note: "",
  });
  const saveRevs = (next) => {
    setRevs(next);
    const cur = saGet() || {};
    saSet({ ...cur, revenue: next });
  };
  const addRevenue = () => {
    const amt = parseFloat(String(form.amount).replace(",","."));
    if (!form.partner || !amt || !form.month) return;
    const entry = { id: Math.random().toString(36).slice(2), partner: form.partner, amount: amt, month: form.month, note: form.note, addedAt: Date.now() };
    saveRevs([...revs, entry]);
    setForm({ partner: form.partner, amount: "", month: form.month, note: "" });
    setShowAdd(false);
  };
  const delRevenue = (id) => {
    if (!confirm("Eintrag wirklich löschen?")) return;
    saveRevs(revs.filter(r=>r.id!==id));
  };
  const totalRevConfirmed = revs.reduce((s,r)=>s+(r.amount||0),0);
  // Pro Partner aufsummiert
  const confirmedPerPartner = revs.reduce((acc,r)=>{ acc[r.partner]=(acc[r.partner]||0)+(r.amount||0); return acc; },{});
  // Pro Monat aufsummiert
  const byMonth = revs.reduce((acc,r)=>{ acc[r.month]=(acc[r.month]||0)+(r.amount||0); return acc; },{});

  const partnerLabel = (id) => {
    const a = AFFILIATES.find(x=>x.id===id);
    return a ? `${a.network||""} · ${a.text}` : id;
  };

  return (
    <div>
      <h2 style={{color:"#fff",fontWeight:900,fontSize:20,marginBottom:16}}>
        Einnahmen & Monetarisierung
      </h2>
      {/* Tatsaechlich bestaetigt */}
      <div style={{background:"linear-gradient(135deg,#14532d,#16a34a)",
        borderRadius:16,padding:"20px",marginBottom:12}}>
        <div style={{fontSize:11,fontWeight:800,color:"rgba(255,255,255,.7)",marginBottom:4}}>
          TATSÄCHLICH ERHALTEN (manuell erfasst)
        </div>
        <div style={{fontWeight:900,fontSize:36,color:"#fff",lineHeight:1}}>
          EUR {totalRevConfirmed.toFixed(2)}
        </div>
        <div style={{fontSize:12,color:"rgba(255,255,255,.7)",marginTop:6}}>
          {revs.length} Einträge · gepflegt aus den Partner-Dashboards
        </div>
        <button onClick={()=>setShowAdd(true)}
          style={{marginTop:12,padding:"9px 16px",borderRadius:10,border:"1.5px solid rgba(255,255,255,.4)",
            background:"rgba(255,255,255,.15)",color:"#fff",fontWeight:800,fontSize:13,
            cursor:"pointer",fontFamily:"inherit"}}>+ Einnahme erfassen</button>
      </div>
      {/* Auto-Import Hinweis */}
      <div style={{background:"#1e293b",border:"1px solid #334155",borderRadius:10,padding:"10px 14px",
        marginBottom:16,fontSize:12,color:"#64748b",lineHeight:1.55}}>
        <b style={{color:"#64748b"}}>Auto-Import?</b> Theoretisch möglich (AWIN-API, Amazon Partnernet Reports),
        braucht aber server-seitige API-Credentials und einen Cron in Supabase Edge Functions.
        Solange noch nicht aktiviert: monatlich Beträge aus den Partner-Dashboards eintragen.
      </div>
      {/* Gesamt-Schaetzung */}
      <div style={{background:"linear-gradient(135deg,#4c1d95,#7c3aed)",
        borderRadius:16,padding:"20px",marginBottom:16}}>
        <div style={{fontSize:11,fontWeight:800,color:"rgba(255,255,255,.6)",marginBottom:4}}>
          GESCHÄTZTE AFFILIATE-EINNAHMEN
        </div>
        <div style={{fontWeight:900,fontSize:36,color:"#fff",lineHeight:1}}>
          EUR {totalRevEst.toFixed(2)}
        </div>
        <div style={{fontSize:12,color:"rgba(255,255,255,.6)",marginTop:6}}>
          Basierend auf {affiliateClicks.length} Klicks · Durchschnittsprovision je Partner
        </div>
      </div>
      {/* Erfasste Einnahmen */}
      {revs.length>0 && (
        <div style={{background:"#1e293b",borderRadius:14,padding:"16px",border:"1px solid #334155",marginBottom:16}}>
          <div style={{fontSize:11,fontWeight:700,color:"#64748b",marginBottom:12}}>EINNAHMEN PRO MONAT</div>
          {Object.entries(byMonth).sort(([a],[b])=>b.localeCompare(a)).map(([m,sum])=>(
            <div key={m} style={{display:"flex",justifyContent:"space-between",alignItems:"center",
              padding:"7px 0",borderBottom:"1px solid #334155"}}>
              <div style={{fontWeight:700,fontSize:13,color:"#e2e8f0"}}>{m}</div>
              <div style={{fontWeight:800,fontSize:14,color:"#86efac"}}>EUR {sum.toFixed(2)}</div>
            </div>
          ))}
          <div style={{marginTop:14,fontSize:11,fontWeight:700,color:"#64748b",marginBottom:10}}>EINZELNE EINTRÄGE</div>
          {revs.slice().sort((a,b)=>(b.month+b.addedAt).localeCompare(a.month+a.addedAt)).map(r=>(
            <div key={r.id} style={{display:"flex",alignItems:"center",gap:10,
              padding:"9px 0",borderBottom:"1px solid #334155"}}>
              <div style={{flex:1,minWidth:0}}>
                <div style={{fontWeight:700,fontSize:13,color:"#e2e8f0",overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>
                  {partnerLabel(r.partner)}
                </div>
                <div style={{fontSize:11,color:"#64748b",marginTop:1}}>
                  {r.month}{r.note?` · ${r.note}`:""}
                </div>
              </div>
              <div style={{fontWeight:800,fontSize:14,color:"#86efac",whiteSpace:"nowrap"}}>EUR {r.amount.toFixed(2)}</div>
              <button onClick={()=>delRevenue(r.id)} aria-label="Löschen"
                style={{background:"none",border:"none",color:"#475569",fontSize:18,cursor:"pointer",padding:"0 4px"}}>×</button>
            </div>
          ))}
        </div>
      )}
      {/* Modal: neue Einnahme */}
      {showAdd && (
        <div onClick={()=>setShowAdd(false)} style={{position:"fixed",inset:0,background:"rgba(0,0,0,.65)",
          display:"flex",alignItems:"center",justifyContent:"center",zIndex:9999,padding:18}}>
          <div onClick={e=>e.stopPropagation()} style={{background:"#1e293b",borderRadius:16,padding:"20px",
            width:"100%",maxWidth:380,border:"1px solid #334155"}}>
            <div style={{fontSize:17,fontWeight:900,color:"#fff",marginBottom:14}}>Einnahme erfassen</div>
            <div style={{display:"flex",flexDirection:"column",gap:10}}>
              <select value={form.partner} onChange={e=>setForm({...form,partner:e.target.value})}
                style={{padding:"11px 12px",fontSize:14,background:"#0f172a",border:"1px solid #334155",
                  borderRadius:10,color:"#e2e8f0",fontFamily:"inherit"}}>
                {AFFILIATES.map(a=><option key={a.id} value={a.id}>{a.network} · {a.text}</option>)}
              </select>
              <input type="number" step="0.01" value={form.amount} onChange={e=>setForm({...form,amount:e.target.value})}
                placeholder="Betrag in EUR"
                style={{padding:"11px 12px",fontSize:14,background:"#0f172a",border:"1px solid #334155",
                  borderRadius:10,color:"#e2e8f0",fontFamily:"inherit"}}/>
              <input type="month" value={form.month} onChange={e=>setForm({...form,month:e.target.value})}
                style={{padding:"11px 12px",fontSize:14,background:"#0f172a",border:"1px solid #334155",
                  borderRadius:10,color:"#e2e8f0",fontFamily:"inherit"}}/>
              <input value={form.note} onChange={e=>setForm({...form,note:e.target.value})}
                placeholder="Notiz (optional)"
                style={{padding:"11px 12px",fontSize:14,background:"#0f172a",border:"1px solid #334155",
                  borderRadius:10,color:"#e2e8f0",fontFamily:"inherit"}}/>
            </div>
            <div style={{display:"flex",gap:8,marginTop:14}}>
              <button onClick={()=>setShowAdd(false)}
                style={{flex:1,padding:"11px",borderRadius:10,border:"1px solid #334155",
                  background:"transparent",color:"#64748b",fontWeight:700,fontSize:13,cursor:"pointer",fontFamily:"inherit"}}>Abbrechen</button>
              <button onClick={addRevenue} disabled={!form.amount||!form.partner||!form.month}
                style={{flex:2,padding:"11px",borderRadius:10,border:"none",
                  background:form.amount&&form.partner&&form.month?"#16a34a":"#334155",
                  color:"#fff",fontWeight:800,fontSize:13,cursor:"pointer",fontFamily:"inherit"}}>Speichern</button>
            </div>
          </div>
        </div>
      )}
      {/* Pro Partner */}
      <div style={{background:"#1e293b",borderRadius:14,padding:"16px",
        border:"1px solid #334155",marginBottom:16}}>
        <div style={{fontSize:11,fontWeight:700,color:"#64748b",marginBottom:12}}>
          KLICKS PRO PARTNER
        </div>
        {Object.entries(byPartner).length===0&&(
          <p style={{color:"#475569",fontSize:13}}>Noch keine Affiliate-Klicks erfasst</p>
        )}
        {Object.entries(byPartner).map(([partner,cnt])=>(
          <div key={partner} style={{display:"flex",alignItems:"center",gap:10,
            marginBottom:10}}>
            <div style={{flex:1}}>
              <div style={{fontWeight:700,fontSize:13,color:"#e2e8f0",
                textTransform:"capitalize"}}>{partner}</div>
              <div style={{height:6,background:"#0f172a",borderRadius:99,marginTop:4}}>
                <div style={{height:"100%",background:"#7c3aed",borderRadius:99,
                  width:`${Math.min(100,cnt*10)}%`}}/>
              </div>
            </div>
            <div style={{fontWeight:800,fontSize:16,color:"#a78bfa",minWidth:30,
              textAlign:"right"}}>{cnt}</div>
          </div>
        ))}
      </div>
      {/* NPS */}
      <div style={{background:"#1e293b",borderRadius:14,padding:"16px",
        border:"1px solid #334155",marginBottom:16}}>
        <div style={{fontSize:11,fontWeight:700,color:"#64748b",marginBottom:10}}>
          NET PROMOTER SCORE
        </div>
        {nps?(
          <>
            <div style={{fontWeight:900,fontSize:28,color:
              nps.score>=9?"#16a34a":nps.score>=7?"#d97706":"#dc2626",lineHeight:1}}>
              {nps.score}/10
            </div>
            {nps.reason&&<p style={{fontSize:13,color:"#64748b",marginTop:8,lineHeight:1.6}}>
              "{nps.reason}"
            </p>}
          </>
        ):(
          <p style={{color:"#475569",fontSize:13}}>Noch kein NPS erfasst (erscheint nach 30 Tagen)</p>
        )}
      </div>
      {/* Referral Stats */}
      <div style={{background:"#1e293b",borderRadius:14,padding:"16px",
        border:"1px solid #334155"}}>
        <div style={{fontSize:11,fontWeight:700,color:"#64748b",marginBottom:10}}>
          SHARE & REFERRAL
        </div>
        <div style={{fontWeight:900,fontSize:28,color:"#e2e8f0",lineHeight:1}}>
          {shareClicks.length}
        </div>
        <div style={{fontSize:12,color:"#475569",marginTop:4}}>Mal geteilt</div>
      </div>
    </div>
  );
}

/* -----------------------------------------------------------------
   ANALYTICS
----------------------------------------------------------------- */
function SuperAdminAnalytics({ analytics, loginEvents, allClubs }) {
  const eventTypes = analytics.reduce((acc,e)=>{
    acc[e.type]=(acc[e.type]||0)+1; return acc;
  },{});
  const today = new Date().toISOString().slice(0,10);
  const last30 = new Date(Date.now()-30*86400000).toISOString().slice(0,10);
  const activeThisMonth = new Set(
    analytics.filter(e=>e.date>=last30&&e.type==="login").map(e=>e.detail)
  ).size;
  return (
    <div>
      <h2 style={{color:"#fff",fontWeight:900,fontSize:20,marginBottom:16}}>
        Analytics
      </h2>
      <div style={{display:"grid",gridTemplateColumns:"repeat(2,1fr)",gap:10,marginBottom:16}}>
        {[
          ["Gesamt Events",analytics.length,"#7c3aed"],
          ["Logins gesamt",loginEvents.length,"#2563eb"],
          ["Aktiv (30 Tage)",activeThisMonth,"#16a34a"],
          ["Heute",analytics.filter(e=>e.date===today).length,"#d97706"],
        ].map(([l,v,col])=>(
          <div key={l} style={{background:"#1e293b",borderRadius:13,padding:"14px",
            border:"1px solid #334155",textAlign:"center"}}>
            <div style={{fontWeight:900,fontSize:24,color:col}}>{v}</div>
            <div style={{fontSize:11,color:"#475569",marginTop:3}}>{l}</div>
          </div>
        ))}
      </div>
      <div style={{background:"#1e293b",borderRadius:14,padding:"16px",
        border:"1px solid #334155"}}>
        <div style={{fontSize:11,fontWeight:700,color:"#64748b",marginBottom:12}}>
          EVENTS NACH TYP
        </div>
        {Object.entries(eventTypes).sort(([,a],[,b])=>b-a).map(([type,cnt])=>(
          <div key={type} style={{display:"flex",alignItems:"center",gap:8,marginBottom:8}}>
            <div style={{flex:1,fontSize:12,color:"#64748b"}}>{type}</div>
            <div style={{height:5,background:"#0f172a",borderRadius:99,flex:2}}>
              <div style={{height:"100%",background:"#7c3aed",borderRadius:99,
                width:`${Math.min(100,cnt/Math.max(...Object.values(eventTypes))*100)}%`}}/>
            </div>
            <div style={{fontWeight:700,fontSize:12,color:"#a78bfa",minWidth:30,
              textAlign:"right"}}>{cnt}</div>
          </div>
        ))}
        {Object.keys(eventTypes).length===0&&(
          <p style={{color:"#475569",fontSize:13}}>Noch keine Events erfasst</p>
        )}
      </div>
    </div>
  );
}

/* -----------------------------------------------------------------
   SECURITY LOGS
----------------------------------------------------------------- */
function SuperAdminLogs({ data }) {
  const logs = (data.securityLog||[]).slice().reverse().slice(0,50);
  const suspicious = logs.filter(l=>["suspicious","brute_force","new_device"].includes(l.type));
  return (
    <div>
      <h2 style={{color:"#fff",fontWeight:900,fontSize:20,marginBottom:16}}>
        Sicherheits-Logs
      </h2>
      {suspicious.length>0&&(
        <div style={{background:"#3b0000",borderRadius:13,padding:"12px 14px",
          border:"1px solid #dc2626",marginBottom:16}}>
          <div style={{fontWeight:800,fontSize:13,color:"#dc2626",marginBottom:8}}>
            {suspicious.length} verdaechtige Aktivität(en)
          </div>
          {suspicious.slice(0,3).map(l=>(
            <div key={l.id} style={{fontSize:12,color:"#f87171",marginBottom:4}}>
              {new Date(l.ts).toLocaleString("de-DE")}: {l.detail}
            </div>
          ))}
        </div>
      )}
      <div style={{display:"flex",flexDirection:"column",gap:7}}>
        {logs.slice(0,30).map(l=>(
          <div key={l.id} style={{background:"#1e293b",borderRadius:11,
            padding:"10px 13px",border:"1px solid #334155",fontSize:12}}>
            <div style={{color:"#e2e8f0",fontWeight:600}}>{l.detail}</div>
            <div style={{color:"#475569",marginTop:3,display:"flex",gap:10}}>
              <span>{new Date(l.ts).toLocaleString("de-DE")}</span>
              <span>{l.type}</span>
              <span>{l.name||""}</span>
            </div>
          </div>
        ))}
        {logs.length===0&&<p style={{color:"#475569",textAlign:"center",padding:"40px"}}>Keine Logs</p>}
      </div>
    </div>
  );
}

/* -----------------------------------------------------------------
   SUPER ADMIN EINSTELLUNGEN
----------------------------------------------------------------- */
function SuperAdminSettings({ data }) {
  const [newPw, setNewPw] = useState("");
  const [newPw2, setNewPw2] = useState("");
  const [saved, setSaved] = useState("");
  const [maintenance, setMaintenance] = useState(
    localStorage.getItem("va_maintenance")==="1"
  );

  const changePw = () => {
    if(newPw.length<6||newPw!==newPw2) return;
    const cur = saGet()||{};
    saSet({...cur, pwHash:hashPw(newPw)});
    setSaved("Passwort geändert"); setNewPw(""); setNewPw2("");
    setTimeout(()=>setSaved(""),2000);
  };

  const toggleMaint = () => {
    const next = !maintenance;
    setMaintenance(next);
    localStorage.setItem("va_maintenance", next?"1":"0");
    // GLOBAL wirksam: Flag in der globalen Zeile speichern - alle Geraete
    // sehen den Wartungshinweis (Poll/Neuladen), nicht nur dieses.
    if(data) sb.set({ ...data, maintenance: next }).catch(()=>{});
  };

  const clearAnalytics = () => {
    if(confirm("Alle Analytics-Daten löschen?")) {
      localStorage.removeItem("va_analytics");
      alert("Gelöscht");
    }
  };

  return (
    <div>
      <h2 style={{color:"#fff",fontWeight:900,fontSize:20,marginBottom:16}}>
        Einstellungen
      </h2>
      {/* Passwort ändern */}
      <div style={{background:"#1e293b",borderRadius:14,padding:"16px",
        border:"1px solid #334155",marginBottom:14}}>
        <div style={{fontSize:13,fontWeight:700,color:"#64748b",marginBottom:12}}>
          SUPER-ADMIN PASSWORT AENDERN
        </div>
        <div style={{display:"flex",flexDirection:"column",gap:10}}>
          <PwInput value={newPw} onChange={e=>setNewPw(e.target.value)}
            placeholder="Neues Passwort (mind. 6 Zeichen)"
            style={{padding:"11px 14px",fontSize:14,background:"#0f172a",
              border:"1px solid #334155",borderRadius:11,color:"#fff",outline:"none"}}/>
          <PwInput value={newPw2} onChange={e=>setNewPw2(e.target.value)}
            placeholder="Wiederholen"
            style={{padding:"11px 14px",fontSize:14,background:"#0f172a",
              border:"1px solid #334155",borderRadius:11,color:"#fff",outline:"none"}}/>
          {saved&&<div style={{color:"#16a34a",fontSize:13,fontWeight:600}}>{saved}</div>}
          <button onClick={changePw} disabled={newPw.length<6||newPw!==newPw2}
            style={{padding:"11px",borderRadius:11,border:"none",
              background:newPw.length>=6&&newPw===newPw2?"#7c3aed":"#334155",
              color:"#fff",fontWeight:700,cursor:"pointer",fontFamily:"inherit"}}>
            Passwort speichern
          </button>
        </div>
      </div>
      {/* Wartungsmodus */}
      <div style={{background:"#1e293b",borderRadius:14,padding:"16px",
        border:"1px solid #334155",marginBottom:14,display:"flex",alignItems:"center",gap:12}}>
        <div style={{flex:1}}>
          <div style={{fontWeight:700,fontSize:14,color:"#e2e8f0"}}>Wartungsmodus</div>
          <div style={{fontSize:12,color:"#475569",marginTop:2}}>
            App zeigt Wartungshinweis für alle Nutzer
          </div>
        </div>
        <div onClick={toggleMaint} style={{width:48,height:26,borderRadius:99,
          background:maintenance?"#dc2626":"#334155",cursor:"pointer",position:"relative"}}>
          <div style={{position:"absolute",top:3,left:maintenance?24:3,width:20,height:20,
            borderRadius:"50%",background:"#fff",transition:"left .2s"}}/>
        </div>
      </div>
      {/* Analytics */}
      <div style={{background:"#1e293b",borderRadius:14,padding:"16px",
        border:"1px solid #334155"}}>
        <div style={{fontWeight:700,fontSize:14,color:"#e2e8f0",marginBottom:8}}>
          Analytics-Daten
        </div>
        <button onClick={clearAnalytics}
          style={{padding:"9px 16px",borderRadius:10,border:"none",
            background:"#dc2626",color:"#fff",fontWeight:700,fontSize:13,
            cursor:"pointer",fontFamily:"inherit"}}>
          Analytics zurücksetzen
        </button>
      </div>
    </div>
  );
}

/* -----------------------------------------------------------------
   SUPER ADMIN ROOT - Entry Point
----------------------------------------------------------------- */
export function SuperAdmin({ data }) {
  const [loggedIn, setLoggedIn] = useState(false);
  const [tapCount, setTapCount] = useState(0);

  if(!loggedIn) return <SuperAdminLogin onLogin={()=>setLoggedIn(true)}/>;
  return <SuperAdminDashboard data={data} onExit={()=>setLoggedIn(false)}/>;
}

/* =================================================================
   CHAT MODERATION SYSTEM
   - Lokale Regel-Engine (kein API-Call noetig)
   - Karten-System: Verwarnung -> Gelb -> Rot
   - Nur Super-Admin kann sperren aufheben
================================================================= */

const MOD_KEY = "va_moderation";

// Muster-Listen für Erkennung
const MOD_PATTERNS = {
  werbung: {
    label: "Werbung / Spam",
    col: "#d97706",
    icon: "W",
    patterns: [
      /\b(kaufen|bestellen|angebot|rabatt|sale|shop|preis|euro|eur|\$||gratis|kostenlos|click|klick|jetzt kaufen|limited|sonderangebot|gutschein|discount|prozent|%off)\b/i,
      /https?:\/\/(?!wa\.me|mailto)[^\s]+/gi,      // URLs (ausser WA/mailto)
      /www\.[a-z0-9-]+\.[a-z]{2,}/gi,              // www.xxx.de
      /\b\d+[.,]\d+\s*(eur|euro|\$|gbp)\b/i,       // Preisangaben
      /\b(verdiene|verdienen|nebenverdienst|heimarbeit|mlm|network marketing)\b/i,
    ],
    weight: 2,
  },
  illegal: {
    label: "Illegaler Inhalt",
    col: "#dc2626",
    icon: "!",
    patterns: [
      /\b(weed|gras|koka|heroin|mdma|speed|crystal|drogen|stoff|dealer|deal)\b/i,
      /\b(waffe|pistole|gewehr|messer stechen|bomben|sprengen|angriff)\b/i,
      /\b(fick|schei.e|wichser|hurensohn|miststuck|arschloch|bastard|idiot)\b/i,
      /\b(heil hitler|nazi|fascist|rassist|nigg|kanack)\b/i,
      /\b(betrug|phishing|passwort schicken|bankdaten|kreditkarte)\b/i,
      /\b(ich bring dich|ich kill|du bist tot|mach dich fertig|ich warte auf dich)\b/i,
    ],
    weight: 5,
  },
  spam: {
    label: "Spam",
    col: "#7c3aed",
    icon: "S",
    patterns: [
      /(.)\1{8,}/,                                  // aaaaaaaaaa
      /[\!\?\.\,]{5,}/,                             // !!!!!!
    ],
    weight: 1,
  },
  kontaktfishing: {
    label: "Kontaktdaten-Fishing",
    col: "#0891b2",
    icon: "K",
    patterns: [
      /\b\+?[\d\s\-]{10,15}\b/,                    // Telefonnummern
      /[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,}/i,   // E-Mail-Adressen
      /\b(telegram|signal|snapchat|discord|tiktok)[\s:@]?[\w.]+/i,
    ],
    weight: 2,
  },
};

// Nachricht analysieren
const analyzeMessage = (text) => {
  if(!text || text.length < 3) return null;
  let highestWeight = 0;
  let detected = null;
  let matchedText = "";

  for(const [type, cfg] of Object.entries(MOD_PATTERNS)) {
    for(const pattern of cfg.patterns) {
      const match = text.match(pattern);
      if(match) {
        if(cfg.weight > highestWeight) {
          highestWeight = cfg.weight;
          detected = { type, ...cfg };
          matchedText = match[0]?.slice(0,40)||"";
        }
      }
    }
  }
  return detected ? { ...detected, matchedText, score: highestWeight } : null;
};

// Moderation State verwalten
const modGet = () => { try { return JSON.parse(localStorage.getItem(MOD_KEY)||"{}"); } catch { return {}; } };
const modSet = (d) => { try { localStorage.setItem(MOD_KEY, JSON.stringify(d)); } catch {} };

const getModState = (userId, cid) => {
  const key = `${cid}_${userId}`;
  const mod = modGet();
  return mod[key] || { warnings:0, yellowCards:0, redCard:false, blocked:false, blockedUntil:null, violations:[] };
};

const recordViolation = (userId, userName, cid, violation, msgText) => {
  const key = `${cid}_${userId}`;
  const mod = modGet();
  const state = mod[key] || { warnings:0, yellowCards:0, redCard:false, blocked:false, blockedUntil:null, violations:[] };

  const entry = {
    ts: Date.now(),
    type: violation.type,
    label: violation.label,
    msgText: msgText.slice(0,100),
    matched: violation.matchedText,
  };
  state.violations = [...(state.violations||[]), entry];
  state.warnings = (state.warnings||0) + 1;
  state.userName = userName;
  state.userId = userId;
  state.cid = cid;

  // Karten-System
  let card = "warning";
  if(state.warnings >= 5 || violation.score >= 5) {
    state.redCard = true;
    state.blocked = true;
    state.blockedUntil = null; // permanent bis Super-Admin freischaltet
    card = "red";
  } else if(state.warnings >= 3) {
    state.yellowCards = (state.yellowCards||0) + 1;
    state.blocked = true;
    state.blockedUntil = Date.now() + 24*60*60*1000; // 24h
    card = "yellow";
  }

  mod[key] = state;
  modSet(mod);
  return { card, state };
};

const isBlocked = (userId, cid) => {
  const state = getModState(userId, cid);
  if(!state.blocked) return false;
  if(state.blockedUntil && Date.now() > state.blockedUntil) {
    // Zeit abgelaufen - entsperren
    const key = `${cid}_${userId}`;
    const mod = modGet();
    mod[key] = {...state, blocked:false, blockedUntil:null};
    modSet(mod);
    return false;
  }
  return true;
};

/* -----------------------------------------------------------------
   MODERATION FEEDBACK für den Nutzer
----------------------------------------------------------------- */
function ModerationWarning({ card, violation, onClose }) {
  const configs = {
    warning: {
      title: "Nachricht nicht erlaubt",
      col: "#d97706", bg: "#fef3c7",
      icon: "!",
      msg: `Deine Nachricht wurde blockiert: ${violation?.label||"Regelverstos"}. Bitte beachte die Nutzungsregeln.`,
      sub: "Noch 2 Verwarnungen bis zur Sperre.",
    },
    yellow: {
      title: "Gelbe Karte - 24h Sperre",
      col: "#d97706", bg: "#fef3c7",
      icon: "GK",
      msg: "Du hast mehrfach gegen die Nutzungsregeln verstosen. Dein Chat-Zugang ist für 24 Stunden gesperrt.",
      sub: "Bei weiteren Verstoessen wird dein Zugang permanent gesperrt.",
    },
    red: {
      title: "Rote Karte - Permanent gesperrt",
      col: "#dc2626", bg: "#fef2f2",
      icon: "RK",
      msg: "Dein Chat-Zugang wurde permanent gesperrt. Nur der Administrator kann den Zugang wieder freischalten.",
      sub: "Wende dich an deinen Trainer oder Vereinsadmin.",
    },
  };
  const cfg = configs[card]||configs.warning;
  return (
    <div style={{position:"fixed",inset:0,background:"rgba(0,0,0,.7)",zIndex:950,
      display:"flex",alignItems:"center",justifyContent:"center",padding:20,
      backdropFilter:"blur(6px)"}}>
      <div style={{background:cfg.bg,borderRadius:20,padding:"24px",
        width:"100%",maxWidth:360,border:`2px solid ${cfg.col}`}}>
        <div style={{display:"flex",alignItems:"center",gap:12,marginBottom:14}}>
          <div style={{width:52,height:52,borderRadius:14,background:cfg.col,
            display:"flex",alignItems:"center",justifyContent:"center",
            fontWeight:900,fontSize:18,color:"#fff",flexShrink:0}}>
            {cfg.icon}
          </div>
          <div style={{fontWeight:900,fontSize:17,color:cfg.col}}>{cfg.title}</div>
        </div>
        <p style={{fontSize:13,color:"#475569",lineHeight:1.6,marginBottom:8}}>{cfg.msg}</p>
        <p style={{fontSize:12,color:"#64748b",marginBottom:16}}>{cfg.sub}</p>
        <button onClick={onClose}
          style={{width:"100%",padding:"12px",borderRadius:12,border:"none",
            background:cfg.col,color:"#fff",fontWeight:800,fontSize:14,
            cursor:"pointer",fontFamily:"inherit"}}>
          Verstanden
        </button>
      </div>
    </div>
  );
}

/* -----------------------------------------------------------------
   MODERATION PANEL im Super-Admin
----------------------------------------------------------------- */
function SuperAdminModeration() {
  const [, forceUpdate] = useState(0);
  const mod = modGet();
  const entries = Object.entries(mod)
    .filter(([,v])=>v.violations&&v.violations.length>0)
    .sort(([,a],[,b])=>
      (b.violations[b.violations.length-1]?.ts||0) -
      (a.violations[a.violations.length-1]?.ts||0)
    );

  const unblock = (key) => {
    const cur = modGet();
    if(cur[key]) {
      cur[key] = {...cur[key], blocked:false, redCard:false,
        yellowCards:0, warnings:0, blockedUntil:null};
      modSet(cur);
      forceUpdate(n=>n+1);
    }
  };

  const dismiss = (key) => {
    if(!window.confirm("Verwarnungen für diesen Spieler wirklich zurücksetzen?")) return;
    const cur = modGet();
    delete cur[key];
    modSet(cur);
    forceUpdate(n=>n+1);
  };

  const blocked = entries.filter(([,v])=>v.blocked);
  const flagged = entries.filter(([,v])=>!v.blocked);

  return (
    <div>
      <h2 style={{color:"#fff",fontWeight:900,fontSize:20,marginBottom:8}}>
        Chat-Moderation
      </h2>
      <p style={{fontSize:13,color:"#64748b",marginBottom:16,lineHeight:1.5}}>
        KI-gestützte Erkennung von Werbung, illegalen Inhalten und Spam.
        Nur du kannst gesperrte Nutzer freischalten.
      </p>

      {/* Stats */}
      <div style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:10,marginBottom:16}}>
        {[
          [blocked.length,"Gesperrt","#dc2626"],
          [flagged.length,"Verwarnt","#d97706"],
          [entries.reduce((s,[,v])=>s+(v.violations?.length||0),0),"Verstoesze","#7c3aed"],
        ].map(([v,l,col])=>(
          <div key={l} style={{background:"#1e293b",borderRadius:13,padding:"12px",
            textAlign:"center",border:"1px solid #334155"}}>
            <div style={{fontWeight:900,fontSize:24,color:col}}>{v}</div>
            <div style={{fontSize:10,color:"#475569",marginTop:3}}>{l}</div>
          </div>
        ))}
      </div>

      {/* Gesperrte Nutzer */}
      {blocked.length>0&&(
        <>
          <div style={{fontSize:11,fontWeight:800,color:"#dc2626",marginBottom:10,letterSpacing:.5}}>
            GESPERRT
          </div>
          {blocked.map(([key,state])=>(
            <div key={key} style={{background:"#1e293b",borderRadius:13,
              border:"1px solid #dc2626",padding:"13px 14px",marginBottom:9}}>
              <div style={{display:"flex",alignItems:"center",gap:10,marginBottom:8}}>
                <div style={{width:36,height:36,borderRadius:10,
                  background:state.redCard?"#dc2626":"#d97706",
                  display:"flex",alignItems:"center",justifyContent:"center",
                  fontWeight:900,fontSize:14,color:"#fff",flexShrink:0}}>
                  {state.redCard?"RK":"GK"}
                </div>
                <div style={{flex:1}}>
                  <div style={{fontWeight:700,fontSize:14,color:"#e2e8f0"}}>
                    {state.userName||"Unbekannt"}
                  </div>
                  <div style={{fontSize:11,color:"#64748b"}}>
                    {state.warnings} Verstoesze - {state.redCard?"Permanent":"24h Sperre"}
                  </div>
                </div>
                <button onClick={()=>unblock(key)}
                  style={{padding:"6px 12px",borderRadius:9,border:"none",
                    background:"#16a34a",color:"#fff",fontWeight:700,fontSize:12,
                    cursor:"pointer",fontFamily:"inherit"}}>
                  Freischalten
                </button>
              </div>
              {/* Letzte Verst. */}
              {(state.violations||[]).slice(-2).map((v,i)=>(
                <div key={i} style={{background:"#0f172a",borderRadius:9,
                  padding:"8px 10px",marginBottom:5,fontSize:11}}>
                  <span style={{color:"#dc2626",fontWeight:700}}>{v.label}</span>
                  <span style={{color:"#475569",marginLeft:8}}>
                    "{v.msgText?.slice(0,50)}"
                  </span>
                  <span style={{color:"#334155",marginLeft:8}}>
                    {new Date(v.ts).toLocaleString("de-DE")}
                  </span>
                </div>
              ))}
            </div>
          ))}
        </>
      )}

      {/* Verwarnungen */}
      {flagged.length>0&&(
        <>
          <div style={{fontSize:11,fontWeight:800,color:"#d97706",
            marginBottom:10,marginTop:16,letterSpacing:.5}}>
            VERWARNUNGEN
          </div>
          {flagged.map(([key,state])=>(
            <div key={key} style={{background:"#1e293b",borderRadius:13,
              border:"1px solid #334155",padding:"12px 14px",marginBottom:8}}>
              <div style={{display:"flex",alignItems:"center",gap:10}}>
                <div style={{width:34,height:34,borderRadius:10,background:"#d97706",
                  display:"flex",alignItems:"center",justifyContent:"center",
                  fontWeight:900,fontSize:12,color:"#fff",flexShrink:0}}>
                  {state.warnings}
                </div>
                <div style={{flex:1}}>
                  <div style={{fontWeight:700,fontSize:13,color:"#e2e8f0"}}>
                    {state.userName||"Unbekannt"}
                  </div>
                  <div style={{fontSize:11,color:"#64748b"}}>
                    {state.warnings} Verwarnung(en) - {3-state.warnings} bis Gelbe Karte
                  </div>
                </div>
                <button onClick={()=>dismiss(key)}
                  style={{padding:"5px 10px",borderRadius:8,border:"1px solid #334155",
                    background:"transparent",color:"#64748b",fontWeight:600,
                    fontSize:11,cursor:"pointer",fontFamily:"inherit"}}>
                  Zurücksetzen
                </button>
              </div>
            </div>
          ))}
        </>
      )}

      {entries.length===0&&(
        <div style={{textAlign:"center",padding:"40px",background:"#1e293b",
          borderRadius:14,border:"1px solid #334155"}}>
          <p style={{color:"#475569",margin:0}}>Keine Moderations-Ereignisse</p>
        </div>
      )}
    </div>
  );
}




/* -----------------------------------------------------------------
   ROLLOUT MANAGER COMPONENT (im Super-Admin)
----------------------------------------------------------------- */
function SuperAdminRollout({ data }) {
  const [, forceUpdate] = useState(0);
  const [catFilter, setCatFilter] = useState("all");
  const [phaseFilter, setPhaseFilter] = useState("all");
  const [search, setSearch] = useState("");
  const [showMilestoneModal, setShowMilestoneModal] = useState(false);

  const stored = (() => {
    try { return JSON.parse(localStorage.getItem(FEAT_KEY)||"{}"); } catch { return {}; }
  })();

  // Schalter gelten GLOBAL: Aenderungen werden in data.featureFlags (globale
  // Zeile) gespeichert und wirken damit auf allen Geraeten/fuer alle Nutzer.
  // Der Geraete-Speicher wird nur noch als Fallback mitgepflegt.
  const flagsRef = useRef({ ...((data&&data.featureFlags)||{}) });
  const persistCloud = (patch) => {
    if(!Object.keys(patch).length) return;
    Object.assign(flagsRef.current, patch);
    applyFeatureFlags({ ...flagsRef.current });
    if(data) sb.set({ ...data, featureFlags: { ...flagsRef.current } }).catch(()=>{});
  };

  const toggle = (id, deps=[]) => {
    const patch = {};
    const cur = getFeat(id);
    // Wenn deaktiviert: prüfen ob andere Features abhängen
    if(cur) {
      const dependents = FEATURE_REGISTRY.filter(f=>f.deps.includes(id)&&getFeat(f.id));
      if(dependents.length>0) {
        if(!confirm(`Achtung: ${dependents.map(f=>f.label).join(", ")} hängen davon ab. Trotzdem deaktivieren?`)) return;
        dependents.forEach(f=>{ setFeat(f.id,false); patch[f.id]=false; });
      }
    }
    // Wenn aktiviert: Abhängigkeiten prüfen
    if(!cur && deps.length>0) {
      const missing = deps.filter(d=>!getFeat(d));
      if(missing.length>0) {
        const missingLabels = missing.map(d=>FEATURE_REGISTRY.find(f=>f.id===d)?.label||d);
        if(!confirm(`Benötigt: ${missingLabels.join(", ")}. Diese auch aktivieren?`)) return;
        missing.forEach(d=>{ setFeat(d,true); patch[d]=true; });
      }
    }
    setFeat(id, !cur); patch[id]=!cur;
    persistCloud(patch);
    forceUpdate(n=>n+1);
  };

  const activatePhase = (phase) => {
    setAllPhase(phase);
    persistCloud(Object.fromEntries(FEATURE_REGISTRY.map(f=>[f.id, f.phase<=phase])));
    forceUpdate(n=>n+1);
    setShowMilestoneModal(false);
  };

  const CATS = [
    {id:"all",        label:"Alle"},
    {id:"kern",       label:"Kern",          col:"#334155"},
    {id:"termine",    label:"Termine",       col:"#16a34a"},
    {id:"team",       label:"Team",          col:"#2563eb"},
    {id:"komm",       label:"Kommunikation", col:"#7c3aed"},
    {id:"plätze",    label:"Plätze",       col:"#d97706"},
    {id:"training",   label:"Training",      col:"#0891b2"},
    {id:"sicherheit", label:"Sicherheit",    col:"#dc2626"},
    {id:"marketing",  label:"Marketing",     col:"#ec4899"},
    {id:"uiux",       label:"UI/UX",         col:"#64748b"},
    {id:"datenschutz",label:"Datenschutz",   col:"#9333ea"},
  ];

  const RISK_COLS = {low:"#16a34a", medium:"#d97706", high:"#dc2626"};
  const AFFECT_ICONS = {all:"A", trainer:"T", user:"E", admin:"Ad", helper:"H"};

  const filtered = FEATURE_REGISTRY.filter(f=> {
    const catOk = catFilter==="all" || f.cat===catFilter;
    const phaseOk = phaseFilter==="all" || f.phase===Number(phaseFilter);
    const searchOk = !search ||
      f.label.toLowerCase().includes(search.toLowerCase()) ||
      f.desc.toLowerCase().includes(search.toLowerCase());
    return catOk && phaseOk && searchOk;
  });

  const activeCount = FEATURE_REGISTRY.filter(f=>getFeat(f.id)).length;
  const totalCount = FEATURE_REGISTRY.length;
  const currentPhase = (() => {
    const phases = MILESTONES.map(m=>m.phase);
    for(const p of phases.reverse()) {
      const phaseFeats = FEATURE_REGISTRY.filter(f=>f.phase===p);
      if(phaseFeats.every(f=>getFeat(f.id))) return p;
    }
    return 1;
  })();

  return (
    <div>
      <div style={{display:"flex",alignItems:"center",gap:12,marginBottom:16}}>
        <div style={{flex:1}}>
          <h2 style={{color:"#fff",fontWeight:900,fontSize:20,margin:0}}>
            Rollout & Feature-Flags
          </h2>
          <div style={{color:"#64748b",fontSize:12,marginTop:3}}>
            {activeCount}/{totalCount} Features aktiv · Änderungen gelten <b style={{color:"#a78bfa"}}>global für alle Geräte</b> (in der Cloud gespeichert)
          </div>
        </div>
        <button onClick={()=>setShowMilestoneModal(true)}
          style={{padding:"9px 16px",borderRadius:11,border:"none",
            background:"#7c3aed",color:"#fff",fontWeight:700,fontSize:13,
            cursor:"pointer",fontFamily:"inherit",flexShrink:0}}>
          Meilenstein
        </button>
      </div>

      {/* Aktiver Meilenstein */}
      {(() => {
        const ms = MILESTONES.find(m=>m.phase===currentPhase)||MILESTONES[0];
        return (
          <div style={{background:`linear-gradient(135deg,#1e293b,${ms.col}33)`,
            borderRadius:14,padding:"14px 16px",marginBottom:16,
            border:`1px solid ${ms.col}44`}}>
            <div style={{display:"flex",alignItems:"center",gap:10}}>
              <div style={{width:40,height:40,borderRadius:11,background:ms.col,
                display:"flex",alignItems:"center",justifyContent:"center",
                fontWeight:900,fontSize:18,color:"#fff",flexShrink:0}}>
                {ms.icon}
              </div>
              <div style={{flex:1}}>
                <div style={{fontWeight:800,fontSize:15,color:"#fff"}}>
                  Phase {ms.phase}: {ms.name}
                </div>
                <div style={{fontSize:11,color:"#64748b",marginTop:2}}>{ms.goal}</div>
              </div>
            </div>
            {/* Progress Bar */}
            <div style={{marginTop:12,height:6,background:"#0f172a",borderRadius:99}}>
              <div style={{height:"100%",borderRadius:99,background:ms.col,
                width:`${(activeCount/totalCount)*100}%`,transition:"width .4s"}}/>
            </div>
            <div style={{display:"flex",justifyContent:"space-between",
              marginTop:4,fontSize:10,color:"#475569"}}>
              <span>{activeCount} aktiv</span>
              <span>{totalCount-activeCount} inaktiv</span>
            </div>
          </div>
        );
      })()}

      {/* Suche */}
      <input value={search} onChange={e=>setSearch(e.target.value)}
        placeholder="Feature suchen..."
        style={{width:"100%",padding:"10px 14px",fontSize:13,background:"#1e293b",
          border:"1px solid #334155",borderRadius:11,color:"#e2e8f0",outline:"none",
          marginBottom:10,boxSizing:"border-box"}}/>

      {/* Kategorie Filter */}
      <div style={{display:"flex",gap:5,overflowX:"auto",scrollbarWidth:"none",
        marginBottom:8,paddingBottom:4}}>
        {CATS.map(cat=>(
          <button key={cat.id} onClick={()=>setCatFilter(cat.id)}
            style={{padding:"5px 12px",borderRadius:99,
              border:`1.5px solid ${catFilter===cat.id?(cat.col||"#7c3aed"):"#334155"}`,
              background:catFilter===cat.id?(cat.col||"#7c3aed")+"22":"transparent",
              color:catFilter===cat.id?(cat.col||"#a78bfa"):"#64748b",
              fontWeight:catFilter===cat.id?700:500,fontSize:11,cursor:"pointer",
              whiteSpace:"nowrap",fontFamily:"inherit",flexShrink:0}}>
            {cat.label}
          </button>
        ))}
      </div>

      {/* Phase Filter */}
      <div style={{display:"flex",gap:5,marginBottom:14}}>
        <button onClick={()=>setPhaseFilter("all")}
          style={{padding:"5px 12px",borderRadius:99,
            border:`1.5px solid ${phaseFilter==="all"?"#7c3aed":"#334155"}`,
            background:phaseFilter==="all"?"#7c3aed22":"transparent",
            color:phaseFilter==="all"?"#a78bfa":"#64748b",
            fontWeight:phaseFilter==="all"?700:500,fontSize:11,
            cursor:"pointer",fontFamily:"inherit"}}>
          Alle Phasen
        </button>
        {MILESTONES.map(ms=>(
          <button key={ms.phase} onClick={()=>setPhaseFilter(String(ms.phase))}
            style={{padding:"5px 12px",borderRadius:99,
              border:`1.5px solid ${phaseFilter===String(ms.phase)?ms.col:"#334155"}`,
              background:phaseFilter===String(ms.phase)?ms.col+"22":"transparent",
              color:phaseFilter===String(ms.phase)?ms.col:"#64748b",
              fontWeight:phaseFilter===String(ms.phase)?700:500,fontSize:11,
              cursor:"pointer",fontFamily:"inherit",flexShrink:0}}>
            {ms.phase}
          </button>
        ))}
      </div>

      <div style={{fontSize:11,color:"#475569",marginBottom:10}}>
        {filtered.length} von {FEATURE_REGISTRY.length} Features
      </div>

      {/* Feature Liste */}
      {filtered.map(f=>{
        const active = getFeat(f.id);
        const ms = MILESTONES.find(m=>m.phase===f.phase)||MILESTONES[0];
        const riskCol = RISK_COLS[f.risk]||"#64748b";
        const catDef = CATS.find(c=>c.id===f.cat)||CATS[0];
        return (
          <div key={f.id} style={{background:"#1e293b",borderRadius:12,
            border:`1px solid ${active?"#334155":"#dc263644"}`,
            padding:"12px 14px",marginBottom:7,
            opacity:active?1:.65,transition:"opacity .2s"}}>
            <div style={{display:"flex",alignItems:"flex-start",gap:10}}>
              <div style={{flex:1,minWidth:0}}>
                <div style={{display:"flex",alignItems:"center",gap:7,flexWrap:"wrap",marginBottom:3}}>
                  <span style={{fontWeight:700,fontSize:13,color:active?"#e2e8f0":"#64748b"}}>
                    {f.label}
                  </span>
                  {/* Phase Badge */}
                  <span style={{background:ms.col+"22",color:ms.col,borderRadius:99,
                    padding:"1px 7px",fontSize:9,fontWeight:800}}>
                    P{f.phase}
                  </span>
                  {/* Risiko */}
                  <span style={{background:riskCol+"22",color:riskCol,borderRadius:99,
                    padding:"1px 7px",fontSize:9,fontWeight:700}}>
                    {f.risk==="low"?"Sicher":f.risk==="medium"?"Mittel":"Hoch"}
                  </span>
                  {/* Betrifft */}
                  <span style={{background:"#334155",color:"#64748b",borderRadius:99,
                    padding:"1px 7px",fontSize:9,fontWeight:700}}>
                    {AFFECT_ICONS[f.affects]||f.affects}
                  </span>
                </div>
                <div style={{fontSize:11,color:"#475569",lineHeight:1.4}}>{f.desc}</div>
                {f.deps.length>0&&!active&&(
                  <div style={{fontSize:10,color:"#7c3aed",marginTop:3}}>
                    Benötigt: {f.deps.map(d=>FEATURE_REGISTRY.find(x=>x.id===d)?.label||d).join(", ")}
                  </div>
                )}
              </div>
              <div onClick={()=>toggle(f.id, f.deps)}
                style={{width:46,height:24,borderRadius:99,flexShrink:0,marginTop:2,
                  background:active?"#7c3aed":"#334155",cursor:"pointer",
                  position:"relative",transition:"background .2s"}}>
                <div style={{position:"absolute",top:2,
                  left:active?24:2,width:20,height:20,borderRadius:"50%",
                  background:"#fff",transition:"left .2s",
                  boxShadow:"0 1px 4px rgba(0,0,0,.4)"}}/>
              </div>
            </div>
          </div>
        );
      })}

      {/* Meilenstein Modal */}
      {showMilestoneModal&&(
        <div style={{position:"fixed",inset:0,background:"rgba(0,0,0,.8)",zIndex:950,
          display:"flex",alignItems:"center",justifyContent:"center",padding:20}}>
          <div style={{background:"#1e293b",borderRadius:20,width:"100%",maxWidth:420,
            border:"1px solid #334155",overflow:"hidden"}}>
            <div style={{background:"#0f172a",padding:"16px 20px",
              borderBottom:"1px solid #334155"}}>
              <div style={{color:"#fff",fontWeight:900,fontSize:18}}>
                Meilenstein aktivieren
              </div>
              <div style={{color:"#64748b",fontSize:12,marginTop:3}}>
                Alle Features bis zur gewählten Phase werden aktiviert,
                alles darüber deaktiviert.
              </div>
            </div>
            <div style={{padding:"16px 20px"}}>
              {MILESTONES.map(ms=>(
                <button key={ms.phase} onClick={()=>activatePhase(ms.phase)}
                  style={{width:"100%",display:"flex",alignItems:"center",gap:12,
                    padding:"13px 14px",borderRadius:13,border:`1.5px solid ${ms.col}44`,
                    background:ms.col+"11",cursor:"pointer",fontFamily:"inherit",
                    marginBottom:9,textAlign:"left"}}>
                  <div style={{width:40,height:40,borderRadius:11,background:ms.col,
                    display:"flex",alignItems:"center",justifyContent:"center",
                    fontWeight:900,fontSize:18,color:"#fff",flexShrink:0}}>
                    {ms.icon}
                  </div>
                  <div style={{flex:1}}>
                    <div style={{fontWeight:800,fontSize:14,color:"#fff"}}>
                      Phase {ms.phase}: {ms.name}
                    </div>
                    <div style={{fontSize:11,color:"#64748b",marginTop:2}}>{ms.desc}</div>
                    <div style={{fontSize:10,color:ms.col,marginTop:3}}>
                      {FEATURE_REGISTRY.filter(f=>f.phase<=ms.phase).length} Features aktiv
                    </div>
                  </div>
                </button>
              ))}
            </div>
            <div style={{padding:"0 20px 20px"}}>
              <button onClick={()=>setShowMilestoneModal(false)}
                style={{width:"100%",padding:"11px",borderRadius:11,
                  border:"1px solid #334155",background:"transparent",
                  color:"#64748b",fontWeight:700,cursor:"pointer",fontFamily:"inherit"}}>
                Abbrechen
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}



/* =================================================================
   SPORT-PROFILE SYSTEM
   Jede Sportart hat eigene Positionen, Statistiken, Spielfeld-Vorlagen
================================================================= */

// Geo-Info des aktuellen Nutzers ermitteln
/* =================================================================
   GEO & SPRACH-ANALYTICS
   DSGVO-konform: Nur Zeitzone + Sprache, keine IP, kein GPS
================================================================= */

// Zeitzone -> Region/Stadt Mapping
const TZ_MAP = {
  // Deutschland
  "Europe/Berlin":      { city:"Deutschland",    flag:"D",  region:"de", country:"DE" },
  // Oesterreich
  "Europe/Vienna":      { city:"Oesterreich",    flag:"A",  region:"at", country:"AT" },
  // Schweiz
  "Europe/Zurich":      { city:"Schweiz",        flag:"CH", region:"ch", country:"CH" },
  // Niederlande
  "Europe/Amsterdam":   { city:"Niederlande",    flag:"NL", region:"nl", country:"NL" },
  // Belgien
  "Europe/Brussels":    { city:"Belgien",        flag:"B",  region:"be", country:"BE" },
  // Luxemburg
  "Europe/Luxembourg":  { city:"Luxemburg",      flag:"LU", region:"lu", country:"LU" },
  // UK
  "Europe/London":      { city:"Großbritannien",flag:"GB", region:"gb", country:"GB" },
  // Frankreich
  "Europe/Paris":       { city:"Frankreich",     flag:"F",  region:"fr", country:"FR" },
  // Spanien
  "Europe/Madrid":      { city:"Spanien",        flag:"E",  region:"es", country:"ES" },
  // Italien
  "Europe/Rome":        { city:"Italien",        flag:"I",  region:"it", country:"IT" },
  // Polen
  "Europe/Warsaw":      { city:"Polen",          flag:"PL", region:"pl", country:"PL" },
  // Türkei
  "Europe/Istanbul":    { city:"Türkei",        flag:"TR", region:"tr", country:"TR" },
  // USA
  "America/New_York":   { city:"USA Ost",        flag:"US", region:"us", country:"US" },
  "America/Chicago":    { city:"USA Mitte",      flag:"US", region:"us", country:"US" },
  "America/Denver":     { city:"USA West",       flag:"US", region:"us", country:"US" },
  "America/Los_Angeles":{ city:"USA Westkste",  flag:"US", region:"us", country:"US" },
  // Kanada
  "America/Toronto":    { city:"Kanada",         flag:"CA", region:"ca", country:"CA" },
  // Arabien
  "Asia/Riyadh":        { city:"Saudi-Arabien",  flag:"SA", region:"sa", country:"SA" },
  "Asia/Dubai":         { city:"VAE",            flag:"AE", region:"ae", country:"AE" },
  "Asia/Baghdad":       { city:"Irak",           flag:"IQ", region:"iq", country:"IQ" },
  // Sonstige
  "Asia/Tokyo":         { city:"Japan",          flag:"JP", region:"jp", country:"JP" },
  "Asia/Shanghai":      { city:"China",          flag:"CN", region:"cn", country:"CN" },
  "Australia/Sydney":   { city:"Australien",     flag:"AU", region:"au", country:"AU" },
};

// Sprach-Labels
const LANG_LABELS = {
  de:"Deutsch", en:"Englisch", nl:"Niederländisch",
  ar:"Arabisch", tr:"Türkisch", fr:"Franzoesisch",
  es:"Spanisch", it:"Italienisch", pl:"Polnisch",
  ru:"Russisch", uk:"Ukrainisch",
};

export const getGeoInfo = () => {
  const tz  = Intl.DateTimeFormat().resolvedOptions().timeZone || "Unknown";
  const lang = (navigator.language || "de").slice(0,2).toLowerCase();
  const ua   = navigator.userAgent;
  const geo  = TZ_MAP[tz] || { city: tz.split("/")[1]||tz, flag:"?", region:"unknown", country:"??" };
  const device = /Mobi|Android/i.test(ua) ? "mobile"
               : /Tablet|iPad/i.test(ua)  ? "tablet" : "desktop";
  const browser = ua.includes("Chrome") && !ua.includes("Edge") ? "Chrome"
                : ua.includes("Safari") && !ua.includes("Chrome") ? "Safari"
                : ua.includes("Firefox") ? "Firefox"
                : ua.includes("Edge") ? "Edge" : "Sonstige";
  return { tz, lang, geo, device, browser };
};

// Erweitertes trackEvent mit Geo-Daten
export const trackEventGeo = (type, detail="") => {
  const geo = getGeoInfo();
  const log = (() => {
    try { return JSON.parse(localStorage.getItem("va_analytics")||"[]"); } catch { return []; }
  })();
  log.push({
    type, detail,
    ts:   Date.now(),
    date: new Date().toISOString().slice(0,10),
    hour: new Date().getHours(),
    lang: geo.lang,
    tz:   geo.tz,
    city: geo.geo.city,
    country: geo.geo.country,
    flag: geo.geo.flag,
    device: geo.device,
    browser: geo.browser,
  });
  localStorage.setItem("va_analytics", JSON.stringify(log.slice(-2000)));
};

/* =================================================================
   GEO ANALYTICS TAB (Super-Admin)
================================================================= */
function SuperAdminGeoAnalytics() {
  const analytics = (() => {
    try { return JSON.parse(localStorage.getItem("va_analytics")||"[]"); } catch { return []; }
  })();

  const logins = analytics.filter(e => e.type === "login");
  const today  = new Date().toISOString().slice(0,10);
  const last7  = new Date(Date.now()-7*86400000).toISOString().slice(0,10);
  const last30 = new Date(Date.now()-30*86400000).toISOString().slice(0,10);

  const [timeRange, setTimeRange] = React.useState("30d");
  const filtered = analytics.filter(e => {
    if(timeRange==="7d")  return e.date >= last7;
    if(timeRange==="30d") return e.date >= last30;
    if(timeRange==="today") return e.date === today;
    return true;
  });

  // Aggregierungen
  const byCity = filtered.reduce((acc, e) => {
    if(!e.city) return acc;
    acc[e.city] = (acc[e.city]||0) + 1;
    return acc;
  }, {});

  const byCountry = filtered.reduce((acc, e) => {
    if(!e.country) return acc;
    const key = (e.flag||"?") + " " + (e.city||e.country||"?");
    if(!acc[key]) acc[key] = { count:0, flag:e.flag, city:e.city, country:e.country };
    acc[key].count++;
    return acc;
  }, {});

  const byLang = filtered.reduce((acc, e) => {
    if(!e.lang) return acc;
    acc[e.lang] = (acc[e.lang]||0) + 1;
    return acc;
  }, {});

  const byDevice = filtered.reduce((acc, e) => {
    const d = e.device || "unbekannt";
    acc[d] = (acc[d]||0) + 1;
    return acc;
  }, {});

  const byBrowser = filtered.reduce((acc, e) => {
    const b = e.browser || "Sonstige";
    acc[b] = (acc[b]||0) + 1;
    return acc;
  }, {});

  const byHour = Array.from({length:24}, (_,h) => ({
    h, count: filtered.filter(e=>e.hour===h).length
  }));

  const maxHour = Math.max(1, ...byHour.map(x=>x.count));
  const total   = filtered.length;
  const uniqueCities = Object.keys(byCity).length;
  const uniqueLangs  = Object.keys(byLang).length;

  const DEVICE_ICONS = { mobile:"H", tablet:"T", desktop:"D" };
  const DEVICE_COLS  = { mobile:"#16a34a", tablet:"#2563eb", desktop:"#7c3aed" };

  // Card component
  const Card = ({title, children}) => (
    <div style={{background:"#1e293b",borderRadius:16,padding:"16px",
      border:"1px solid #334155",marginBottom:14}}>
      <div style={{fontSize:11,fontWeight:800,color:"#64748b",
        marginBottom:12,letterSpacing:.5,textTransform:"uppercase"}}>
        {title}
      </div>
      {children}
    </div>
  );

  // Bar row
  const BarRow = ({label, count, max, col="#7c3aed", icon}) => (
    <div style={{display:"flex",alignItems:"center",gap:10,marginBottom:9}}>
      {icon&&<span style={{fontSize:16,flexShrink:0,minWidth:24}}>{icon}</span>}
      <div style={{flex:1,minWidth:0}}>
        <div style={{display:"flex",justifyContent:"space-between",
          marginBottom:4,fontSize:12}}>
          <span style={{color:"#e2e8f0",fontWeight:600,
            overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>
            {label}
          </span>
          <span style={{color:col,fontWeight:800,marginLeft:8,flexShrink:0}}>
            {count}
          </span>
        </div>
        <div style={{height:5,background:"#0f172a",borderRadius:99}}>
          <div style={{
            height:"100%",borderRadius:99,background:col,
            width:`${Math.round((count/max)*100)}%`,
            transition:"width .4s",
          }}/>
        </div>
      </div>
    </div>
  );

  return (
    <div>
      <h2 style={{color:"#fff",fontWeight:900,fontSize:20,marginBottom:8}}>
        Geo & Sprach-Analytics
      </h2>
      <p style={{fontSize:13,color:"#64748b",marginBottom:16,lineHeight:1.5}}>
        Anonymisiert via Zeitzone + Browsersprache. Keine IP, kein GPS.
      </p>

      {/* Zeitraum Filter */}
      <div style={{display:"flex",gap:7,marginBottom:16}}>
        {[["today","Heute"],["7d","7 Tage"],["30d","30 Tage"],["all","Gesamt"]].map(([v,l])=>(
          <button key={v} onClick={()=>setTimeRange(v)}
            style={{padding:"7px 14px",borderRadius:9,
              border:`1.5px solid ${timeRange===v?"#7c3aed":"#334155"}`,
              background:timeRange===v?"#7c3aed22":"transparent",
              color:timeRange===v?"#a78bfa":"#64748b",
              fontWeight:timeRange===v?700:500,fontSize:12,
              cursor:"pointer",fontFamily:"inherit"}}>
            {l}
          </button>
        ))}
      </div>

      {/* KPI Übersicht */}
      <div style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",
        gap:10,marginBottom:14}}>
        {[
          [total,"Events","#7c3aed"],
          [uniqueCities,"Regionen","#16a34a"],
          [uniqueLangs,"Sprachen","#2563eb"],
        ].map(([v,l,col])=>(
          <div key={l} style={{background:"#1e293b",borderRadius:13,padding:"14px",
            border:"1px solid #334155",textAlign:"center"}}>
            <div style={{fontWeight:900,fontSize:26,color:col,lineHeight:1}}>{v}</div>
            <div style={{fontSize:10,color:"#475569",marginTop:4}}>{l}</div>
          </div>
        ))}
      </div>

      {/* Nach Land/Region */}
      <Card title="Herkunft / Region">
        {Object.entries(byCountry).length === 0
          ? <p style={{color:"#475569",fontSize:13}}>Noch keine Daten</p>
          : Object.entries(byCountry)
              .sort(([,a],[,b])=>b.count-a.count)
              .slice(0,15)
              .map(([key, {count, flag, city}]) => (
                <BarRow key={key} label={city||key} count={count}
                  max={Math.max(...Object.values(byCountry).map(x=>x.count))}
                  col="#16a34a" icon={flag}/>
              ))
        }
      </Card>

      {/* Nach Sprache */}
      <Card title="Genutzte Sprache">
        {Object.entries(byLang).length === 0
          ? <p style={{color:"#475569",fontSize:13}}>Noch keine Daten</p>
          : Object.entries(byLang)
              .sort(([,a],[,b])=>b-a)
              .map(([lang, count]) => {
                const pct = Math.round((count/total)*100);
                return (
                  <div key={lang} style={{display:"flex",alignItems:"center",
                    gap:10,marginBottom:10}}>
                    <div style={{width:36,height:36,borderRadius:10,
                      background:"#0f172a",display:"flex",alignItems:"center",
                      justifyContent:"center",fontWeight:800,fontSize:12,
                      color:"#7c3aed",flexShrink:0}}>
                      {lang.toUpperCase()}
                    </div>
                    <div style={{flex:1}}>
                      <div style={{display:"flex",justifyContent:"space-between",
                        marginBottom:4,fontSize:12}}>
                        <span style={{color:"#e2e8f0",fontWeight:600}}>
                          {LANG_LABELS[lang]||lang}
                        </span>
                        <span style={{color:"#a78bfa",fontWeight:800}}>
                          {count} ({pct}%)
                        </span>
                      </div>
                      <div style={{height:6,background:"#0f172a",borderRadius:99}}>
                        <div style={{height:"100%",borderRadius:99,
                          background:"#7c3aed",width:`${pct}%`,
                          transition:"width .4s"}}/>
                      </div>
                    </div>
                  </div>
                );
              })
        }
      </Card>

      {/* Nach Gerät */}
      <Card title="Geräte-Typ">
        <div style={{display:"flex",gap:10,flexWrap:"wrap"}}>
          {Object.entries(byDevice).length === 0
            ? <p style={{color:"#475569",fontSize:13}}>Noch keine Daten</p>
            : Object.entries(byDevice)
                .sort(([,a],[,b])=>b-a)
                .map(([device, count]) => {
                  const pct = Math.round((count/total)*100);
                  const col = DEVICE_COLS[device]||"#64748b";
                  return (
                    <div key={device} style={{flex:1,minWidth:90,
                      background:"#0f172a",borderRadius:12,padding:"14px",
                      border:`1px solid ${col}33`,textAlign:"center"}}>
                      <div style={{fontWeight:900,fontSize:22,color:col}}>
                        {DEVICE_ICONS[device]||"?"}
                      </div>
                      <div style={{fontWeight:900,fontSize:20,color:col,
                        margin:"6px 0 2px"}}>
                        {pct}%
                      </div>
                      <div style={{fontSize:10,color:"#475569"}}>
                        {device==="mobile"?"Handy":
                         device==="tablet"?"Tablet":"Desktop"}
                      </div>
                      <div style={{fontSize:10,color:"#334155",marginTop:2}}>
                        {count} Sessions
                      </div>
                    </div>
                  );
                })
          }
        </div>
      </Card>

      {/* Nach Browser */}
      <Card title="Browser">
        {Object.entries(byBrowser).length === 0
          ? <p style={{color:"#475569",fontSize:13}}>Noch keine Daten</p>
          : Object.entries(byBrowser)
              .sort(([,a],[,b])=>b-a)
              .map(([browser, count]) => (
                <BarRow key={browser} label={browser} count={count}
                  max={Math.max(...Object.values(byBrowser))}
                  col="#0891b2"/>
              ))
        }
      </Card>

      {/* Tageszeit-Heatmap */}
      <Card title="Aktivität nach Uhrzeit">
        <div style={{fontSize:11,color:"#64748b",marginBottom:10}}>
          Wann wird die App am meisten genutzt?
        </div>
        <div style={{display:"flex",alignItems:"flex-end",
          gap:2,height:60,paddingBottom:4}}>
          {byHour.map(({h, count}) => {
            const barH = count > 0 ? Math.max(4, Math.round((count/maxHour)*52)) : 2;
            const isActive = count === Math.max(...byHour.map(x=>x.count)) && count > 0;
            return (
              <div key={h} style={{flex:1,display:"flex",
                flexDirection:"column",alignItems:"center",gap:2}}>
                <div style={{
                  width:"100%", height:barH,
                  borderRadius:"2px 2px 0 0",
                  background: isActive ? "#7c3aed"
                    : count > 0 ? "#334155" : "#1e293b",
                  transition:"height .3s",
                }}/>
                {(h % 6 === 0) && (
                  <div style={{fontSize:8,color:"#334155",
                    transform:"rotate(-30deg)",marginTop:2}}>
                    {h}h
                  </div>
                )}
              </div>
            );
          })}
        </div>
        {(() => {
          const peak = byHour.reduce((a,b)=>b.count>a.count?b:a,{h:0,count:0});
          return peak.count > 0 ? (
            <div style={{fontSize:12,color:"#7c3aed",marginTop:10,fontWeight:600}}>
              Spitzenzeit: {peak.h}:00 - {peak.h+1}:00 Uhr ({peak.count} Events)
            </div>
          ) : null;
        })()}
      </Card>

      {/* Letzte Logins mit Geo */}
      <Card title="Letzte Logins">
        {logins.slice(-20).reverse().map((e,i) => (
          <div key={i} style={{display:"flex",alignItems:"center",gap:10,
            padding:"8px 0",borderBottom:i<19?"1px solid #0f172a":"none"}}>
            <div style={{fontSize:18,flexShrink:0,minWidth:28}}>{e.flag||"?"}</div>
            <div style={{flex:1,minWidth:0}}>
              <div style={{fontWeight:600,fontSize:13,color:"#e2e8f0"}}>
                {e.detail||"Login"} - {e.city||e.tz||"unbekannt"}
              </div>
              <div style={{fontSize:10,color:"#475569",marginTop:1,
                display:"flex",gap:8}}>
                <span>{e.date} {e.hour}:xx</span>
                <span>{LANG_LABELS[e.lang]||e.lang||"?"}</span>
                <span>{e.device||"?"}</span>
                <span>{e.browser||"?"}</span>
              </div>
            </div>
          </div>
        ))}
        {logins.length===0&&(
          <p style={{color:"#475569",fontSize:13,margin:0}}>
            Noch keine Logins getrackt. Wird ab nächstem Login erfasst.
          </p>
        )}
      </Card>
    </div>
  );
}
