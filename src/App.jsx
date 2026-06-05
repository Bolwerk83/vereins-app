import React, { useState,useEffect,useCallback,useRef,useMemo,createContext,useContext } from "react";

const LANG_KEY = "vereinsapp_lang";
const LangCtx  = createContext("de");
const useLang  = () => useContext(LangCtx);

const T = {
  de: {
    back:"<- Zurück",
    cancel: "Abbrechen",
    save: "Speichern",
    delete: "Löschen",
    logout:"Logout",
    close: "Schließen",
    loading: "Lädt...",
    yes: "Ja",
    no: "Nein",
    search:"Suchen...",
    edit: "Bearbeiten",
    confirm: "Bestaetigen",
    next: "Weiter ->",
    chooseClub:"Welche Mannschaft ist dein Kind?",
    chooseAge: "In welcher Altersklasse spielt dein Kind?",
    chooseTeam:"Welche Mannschaft?",
    whichTrainer: "Welcher Trainer bist du?",
    forWhichAge:"Für welche Jugend bist du Trainer?",
    loginCode: "Helfer-Code",
    enterPassword:"Passwort eingeben",
    wrongPassword: "Falsches Passwort",
    helperLogin:"Helfer-Zugang",
    helperHint: "Zugriff auf Spielpläne und Turnier-Übersichten.",
    whoAreYou:"Wer bist du?",
    notInList: "Nicht in der Liste?",
    loginAs:"Einloggen als",
    teamOpen: "Team öffnen",
    roleParent:"Elternteil",
    roleParentSub: "Termine sehen & abstimmen",
    roleHelper:"Helfer",
    roleHelperSub: "Turnier & Spieltag unterstützen",
    roleTrainer:"Trainer",
    roleTrainerSub: "Termine meiner Mannschaft",
    roleAdmin:"Vereinsadmin",
    roleAdminSub: "Alle Rechte & Einstellungen",
    tabEvents:"Termine",
    tabPlayers: "Spieler",
    tabTemplates: "Vorlagen",
    tabHelpers:"Helfer",
    tabJerseys: "Trikots",
    tabFields: "Platz",
    tabInbox:"Posteingang",
    tabChat: "Chat",
    tabTeams: "Mannschaften",
    tabTrainers:"Trainer",
    tabBranding: "Design",
    tabSettings: "Einstellungen",
    tabVisibility:"Sichtbarkeit",
    newEvent:"Neuen Termin anlegen",
    noEvents: "Noch keine Termine",
    noEventsHint:"Klicke oben auf Neuen Termin anlegen",
    upcomingEvents:"Anstehende Termine",
    pastEvents: "Vergangene Termine",
    showPast:"Vergangene anzeigen",
    hidePast: "Vergangene ausblenden",
    attending:"Ich bin dabei",
    notAttending: "Nicht dabei",
    maybe: "Vielleicht",
    unassigned:"Nicht zugeteilt",
    open: "Offen",
    assigned: "Zugeteilt",
    mainTeam:"Hauptmannschaft",
    canHelpIn: "Kann aushelfen in",
    assignTo:"Zu Team zuweisen",
    recommendation: "Empfehlung nächste Saison",
    lastSeason:"Letzte Saison gespielt in",
    notes: "Notizen",
    jerseyNumber:"Trikotnummer",
    jerseySize: "Trikotgröße",
    jerseyStatus:"Trikot Status",
    strengths: "Stärken",
    statistics: "Statistiken",
    goals:"Tore",
    assists:"Vorlagen",
    yellowCards:"Gelb",
    redCards:"Rot",
    rating:"Bewertung",
    position: "Position",
    foot: "Fuß",
    male:"Junge",
    female: "Mädchen",
    birthYear: "Jahrgang",
    newSeason:"Neue Saison planen",
    seasonPlanning: "Saisonplanung",
    activeSeason:"Aktive Saison",
    planningStatus: "Planung",
    archivedStatus: "Archiviert",
    inbox:"Posteingang",
    security: "Sicherheit",
    allOk: "Alles in Ordnung",
    noRequests:"Keine Anfragen",
    block: "Blockieren",
    markRead: "Gelesen",
    contactClub:"Kontaktieren",
    sendRequest: "Anfrage senden",
    requestSent: "Anfrage gesendet!",
    demoView:"Demo ansehen",
    createClub: "Verein anlegen",
    searchClub:"Verein suchen...",
    allSports: "Alle",
    onlyWithConsent:"Nur Vereine die zugestimmt haben werden angezeigt",
    bookField:"Platz buchen",
    fieldBooking: "Platzbuchung",
    booked: "Gebucht",
    free:"Frei",
    cancelBooking: "Buchung stornieren",
    writeMessage:"Nachricht schreiben...",
    send: "Senden",
    wholeClub:"Gesamter Verein",
    noMessages: "Noch keine Nachrichten",
  },
  en: {
    searchClub:"Search club...",
    allSports:"All",
    onlyWithConsent:"Only clubs that have consented are shown",
    createClub:"Create club",
    demoView:"View demo",
    back:"<- Back",
    cancel: "Cancel",
    save: "Save",
    delete: "Delete",
    logout:"Logout",
    close: "Close",
    loading: "Loading...",
    yes: "Yes",
    no: "No",
    search:"Search...",
    edit: "Edit",
    confirm: "Confirm",
    next: "Next ->",
    chooseClub:"Which team is your child in?",
    chooseAge: "Which age group?",
    chooseTeam:"Which team?",
    whichTrainer: "Which trainer are you?",
    forWhichAge:"For which youth are you trainer?",
    loginCode:"Helper code",
    enterPassword:"Enter password",
    wrongPassword:"Wrong password",
    helperLogin:"Helper access",
    whoAreYou:"Who are you?",
    notInList:"Not in the list?",
    loginAs:"Login as",
    teamOpen:"Open team",
    roleParent:"Parent",
    roleParentSub:"View events and vote",
    roleHelper:"Helper",
    roleTrainer:"Trainer",
    roleAdmin:"Club admin",
    tabEvents:"Events",
    tabPlayers:"Players",
    tabChat:"Chat",
    tabSettings:"Settings",
    tabTemplates:"Templates",
    tabHelpers:"Helpers",
    tabJerseys:"Jerseys",
    tabFields:"Fields",
    tabInbox:"Inbox",
    tabTeams:"Teams",
    tabTrainers:"Trainers",
    tabBranding:"Design",
    tabVisibility:"Visibility",
    attending:"My child will attend",
    notAttending:"Will not attend",
    newEvent:"New event",
    noEvents:"No events yet",
    upcomingEvents:"Upcoming events",
    male:"Male",
    female:"Female",
    send:"Send",
    writeMessage:"Write a message...",
    noMessages:"No messages yet",
  },
  nl: {
    searchClub:"Club zoeken...",
    allSports:"Alle",
    onlyWithConsent:"Alleen clubs die toestemming gaven worden getoond",
    createClub:"Club aanmaken",
    demoView:"Demo bekijken",
    back:"<- Terug",
    cancel: "Annuleren",
    save: "Opslaan",
    delete: "Verwijderen",
    logout:"Uitloggen",
    close: "Sluiten",
    loading: "Laden...",
    yes: "Ja",
    no: "Nee",
    search:"Zoeken...",
    edit: "Bewerken",
    confirm: "Bevestigen",
    next: "Volgende ->",
    chooseClub:"In welk team zit uw kind?",
    chooseAge: "Welke leeftijdsgroep?",
    chooseTeam:"Welk team?",
    whichTrainer: "Welke trainer bent u?",
    forWhichAge:"Voor welke jeugd bent u trainer?",
    loginCode:"Helper code",
    enterPassword:"Wachtwoord invoeren",
    wrongPassword:"Onjuist wachtwoord",
    helperLogin:"Helper toegang",
    whoAreYou:"Wie bent u?",
    notInList:"Niet in de lijst?",
    loginAs:"Inloggen als",
    teamOpen:"Team openen",
    roleParent:"Ouder",
    roleParentSub:"Evenementen bekijken en stemmen",
    roleHelper:"Helper",
    roleTrainer:"Trainer",
    roleAdmin:"Clubbeheerder",
    tabEvents:"Agenda",
    tabPlayers:"Spelers",
    tabChat:"Chat",
    tabSettings:"Instellingen",
    tabTemplates:"Sjablonen",
    tabHelpers:"Helpers",
    tabJerseys:"Shirts",
    tabFields:"Velden",
    tabInbox:"Inbox",
    tabTeams:"Teams",
    tabTrainers:"Trainers",
    tabBranding:"Ontwerp",
    tabVisibility:"Zichtbaarheid",
    attending:"Mijn kind komt",
    notAttending:"Komt niet",
    newEvent:"Nieuw evenement",
    noEvents:"Nog geen evenementen",
    upcomingEvents:"Aankomende evenementen",
    male:"Mannelijk",
    female:"Vrouwelijk",
    send:"Versturen",
    writeMessage:"Schrijf een bericht...",
    noMessages:"Nog geen berichten",
  },
  ar: {
    searchClub:"Ibhath aan nadi...",
    allSports:"Alkul",
    onlyWithConsent:"Tuzhar faqat alandiya allati wafaqat",
    createClub:"Inshaa nadi",
    demoView:"Aard tajribi",
    back:"<- Zurück",
    cancel:"Alga",
    save:"Hifz",
    delete:"Hazf",
    logout:"Khuruj",
    close:"Ghalq",
    loading:"Jari...",
    yes:"Na3am",
    no:"La",
    search:"Bahth...",
    edit:"Ta3dil",
    chooseClub:"Fi ayy fariq tifluk?",
    chooseAge:"Fi ayy fi2a sinniyya?",
    chooseTeam:"Ayy fariq?",
    whichTrainer:"Man anta almudrib?",
    forWhichAge:"Li ayy shabab anta mudrib?",
    loginCode:"Ramz almusa3id",
    enterPassword:"Adkhil kalima almurur",
    wrongPassword:"Kalima almurur khata",
    helperLogin:"Wusul almusa3id",
    whoAreYou:"Man anta?",
    notInList:"Laysa fi alqa2ima?",
    loginAs:"Dakhil bisifattika",
    teamOpen:"Iftah alfariq",
    roleParent:"Wali alamr",
    roleParentSub:"Ru2ya almawa3id & altaswit",
    roleHelper:"Musa3id",
    roleTrainer:"Mudrib",
    roleAdmin:"Mudawwin alnadiya",
    tabEvents:"Mawa3id",
    tabPlayers:"Laebun",
    tabChat:"Dardasha",
    tabSettings:"I3dadat",
    attending:"Tifliy sa-yahdhur",
    notAttending:"Lan yahdhur",
    newEvent:"Maw3id jadid",
    noEvents:"La mawa3id ba3d",
    upcomingEvents:"Almawa3id alqadima",
    male:"Zakar",
    female:"Untha",
    send:"Irsal",
    writeMessage:"Uktub risala...",
  },
  tr: {
    searchClub:"Kulup ara...",
    allSports:"Tumu",
    onlyWithConsent:"Yalnizca onay veren kulupler gosterilir",
    createClub:"Kulup olustur",
    demoView:"Demoyu goruntule",
    back:"<- Geri",
    cancel:"Iptal",
    save:"Kaydet",
    delete:"Sil",
    logout:"Cikis",
    close:"Kapat",
    loading:"Yukleniyor...",
    yes:"Evet",
    no:"Hayir",
    search:"Ara...",
    edit:"Duzenle",
    chooseClub:"Cocugunuz hangi takimda?",
    chooseAge:"Hangi yas grubunda?",
    chooseTeam:"Hangi takim?",
    whichTrainer:"Hangi antrenorusunuz?",
    forWhichAge:"Hangi genclik icin antrenorusunuz?",
    loginCode:"Yardimci kodu",
    enterPassword:"Sifre girin",
    wrongPassword:"Yanlis sifre",
    helperLogin:"Yardimci erisimi",
    whoAreYou:"Kimsiniz?",
    notInList:"Listede yok musunuz?",
    loginAs:"Olarak giris yap",
    teamOpen:"Takimi ac",
    roleParent:"Veli",
    roleParentSub:"Etkinlikleri gor ve oy ver",
    roleHelper:"Yardimci",
    roleTrainer:"Antrenor",
    roleAdmin:"Kuluep yoneticisi",
    tabEvents:"Etkinlikler",
    tabPlayers:"Oyuncular",
    tabChat:"Sohbet",
    tabSettings:"Ayarlar",
    attending:"Cocugum katilacak",
    notAttending:"Katilmayacak",
    newEvent:"Yeni etkinlik",
    noEvents:"Henuz etkinlik yok",
    upcomingEvents:"Yaklasan etkinlikler",
    male:"Erkek",
    female:"Kiz",
    send:"Gonder",
    writeMessage:"Mesaj yaz...",
  },
};
function useT() {
  const lang = useLang();
  return (key,fallback) => T[lang]?.[key] ?? T.de[key] ?? fallback ?? key;
}
function LangSwitcher({ lang,setLang }) {
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

const SK  = "vereinsapp_v14";
const SS  = "vereinsapp_v12_session";
const CFG = "vereinsapp_config";
const getConfig = () => { try { return JSON.parse(localStorage.getItem(CFG)||"null"); } catch { return null; } };
const setConfig = c => { try { localStorage.setItem(CFG,JSON.stringify(c)); } catch {} };
const sb = {
  _url: () => getConfig()?.url,_key: () => getConfig()?.key,_hdr: () => ({ "Content-Type":"application/json","apikey": sb._key(),"Authorization":"Bearer "+sb._key() }),get: async () => {
    const url = sb._url();
    if (!url || !sb._key()) return localGet();
    try {
      const r = await fetch(`${url}/rest/v1/app_data?key=eq.${SK}&select=value`,{ headers: sb._hdr() });
      if (!r.ok) return localGet();
      const rows = await r.json();
      return rows[0]?.value || null;
    } catch { return localGet(); }
  },set: async d => {
    localSet(d); // always save locally too
    const url = sb._url();
    if (!url || !sb._key()) return;
    try {
      await fetch(`${url}/rest/v1/app_data`,{
        method:"POST",headers: { ...sb._hdr(),"Prefer":"resolution=merge-duplicates" },body: JSON.stringify({ key: SK,value: d,updated_at: new Date().toISOString() })
      });
    } catch {}
  },test: async (url,key) => {
    try {
      const r = await fetch(`${url}/rest/v1/app_data?limit=1`,{
        headers: { "apikey": key,"Authorization":"Bearer "+key }
      });
      return r.ok || r.status === 406; // 406 = table empty,still connected
    } catch { return false; }
  }
};
const localGet = () => { try { const v=localStorage.getItem(SK); return v?JSON.parse(v):null; } catch { return null; } };
const localSet = d => { try { localStorage.setItem(SK,JSON.stringify(d)); } catch {} };

// --- Supabase Auth ohne SDK (nur fetch) – Schritt 1 der Backend-Umstellung ---
const AUTH_KEY = "vereinsapp_auth";
const authStore = {
  get(){ try{ return JSON.parse(localStorage.getItem(AUTH_KEY)||"null"); }catch{ return null; } },
  set(s){ try{ localStorage.setItem(AUTH_KEY,JSON.stringify(s)); }catch{} },
  clear(){ try{ localStorage.removeItem(AUTH_KEY); }catch{} }
};
const _authHdr = () => ({ "Content-Type":"application/json", "apikey": sb._key() });
const _withExpiry = (s) => {
  if(!s) return s;
  if(!s.expires_at) s.expires_at = Math.floor(Date.now()/1000) + (s.expires_in||3600);
  return s;
};
async function signInAnon(){
  const url=sb._url(); if(!url||!sb._key()) return null;
  try{
    const r=await fetch(`${url}/auth/v1/signup`,{ method:"POST", headers:_authHdr(), body:JSON.stringify({ data:{} }) });
    if(!r.ok){ console.warn("Anon-Login HTTP",r.status); return null; }
    const s=await r.json();
    if(!s.access_token) return null;
    authStore.set(_withExpiry(s)); return s;
  }catch(e){ console.warn("signInAnon:",e?.message||e); return null; }
}
async function refreshSession(s){
  const url=sb._url(); if(!url||!s?.refresh_token) return null;
  try{
    const r=await fetch(`${url}/auth/v1/token?grant_type=refresh_token`,{ method:"POST", headers:_authHdr(), body:JSON.stringify({ refresh_token:s.refresh_token }) });
    if(!r.ok) return null;
    const ns=await r.json();
    if(!ns.access_token) return null;
    authStore.set(_withExpiry(ns)); return ns;
  }catch{ return null; }
}
// Stellt sicher, dass eine (anonyme) Sitzung existiert. Gibt die Session oder null zurueck.
async function ensureAuth(){
  const url=sb._url(); if(!url||!sb._key()) return null;
  let s=authStore.get();
  if(!s) return await signInAnon();
  if(s.expires_at && s.expires_at*1000 < Date.now()+30000){
    s = (await refreshSession(s)) || (await signInAnon());
  }
  return s;
}
// Gueltiges Access-Token fuer authentifizierte REST-/RPC-Aufrufe (spaetere Schritte)
async function authToken(){ const s=await ensureAuth(); return s?.access_token||null; }

const sess = {
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

function SupabaseSetup({ onDone,onSkip }) {
  const [url,setUrl]       = useState(getConfig()?.url||"");
  const [key,setKey]       = useState(getConfig()?.key||"");
  const [status,setStatus] = useState(null); // null | "testing" | "ok" | "fail"
  const [authStatus,setAuthStatus] = useState("checking"); // checking | ok | none
  const [authUid,setAuthUid] = useState("");
  useEffect(()=>{ let on=true; (async()=>{
    if(!getConfig()?.url){ if(on)setAuthStatus("none"); return; }
    const s=await ensureAuth();
    if(!on) return;
    if(s?.user){ setAuthStatus("ok"); setAuthUid(s.user.id.slice(0,8)); }
    else setAuthStatus("none");
  })(); return ()=>{on=false;}; },[]);

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
          <div style={{background:"rgba(255,255,255,.05)",borderRadius:12,padding:"14px",marginBottom:20,fontSize:12,color:"rgba(255,255,255,.6)",lineHeight:1.8}}>
            <div style={{fontWeight:800,color:"rgba(255,255,255,.8)",marginBottom:6,fontSize:13}}> Einrichtung (2 Min):</div>
            <div>1. <a href="https://supabase.com" target="_blank" style={{color:"#38bdf8"}}>supabase.com</a> {"->"} kostenlosen Account erstellen</div>
            <div>2. "New project" {"->"} Frankfurt {"->"} Passwort setzen</div>
            <div>3. SQL Editor {"->"} folgendes ausfuehren:</div>
            <div style={{background:"rgba(0,0,0,.4)",borderRadius:8,padding:"10px",margin:"8px 0",fontFamily:"monospace",fontSize:11,color:"#86efac",lineHeight:1.6}}>
              CREATE TABLE app_data (<br/>
              &nbsp;&nbsp;key TEXT PRIMARY KEY,<br/>
              &nbsp;&nbsp;value JSONB,<br/>
              &nbsp;&nbsp;updated_at TIMESTAMPTZ DEFAULT NOW()<br/>
              );<br/>
              ALTER TABLE app_data ENABLE ROW LEVEL SECURITY;<br/>
              CREATE POLICY "Public" ON app_data FOR ALL USING (true) WITH CHECK (true);
            </div>
            <div>4. Settings {"->"} API {"->"} URL + anon key kopieren</div>
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

          {status==="testing"&&<div style={{marginTop:12,textAlign:"center",color:"#94a3b8",fontSize:13}}> Verbindung wird getestet...</div>}
          {status==="ok"&&<div style={{marginTop:12,background:"#052e16",border:"1.5px solid #16a34a",borderRadius:10,padding:"10px 14px",color:"#86efac",fontSize:13,fontWeight:700}}> Verbindung erfolgreich! App wird geladen...</div>}
          {status==="fail"&&<div style={{marginTop:12,background:"#450a0a",border:"1.5px solid #dc2626",borderRadius:10,padding:"10px 14px",color:"#fca5a5",fontSize:13,fontWeight:700}}> Verbindung fehlgeschlagen. URL und Key prüfen.</div>}

          <div style={{display:"flex",gap:9,marginTop:16}}>
            <button onClick={test} disabled={!url.trim()||!key.trim()||status==="testing"}
              style={{flex:2,padding:"13px",borderRadius:13,border:"none",background:url.trim()&&key.trim()?"#2563eb":"rgba(255,255,255,.1)",color:url.trim()&&key.trim()?"#fff":"rgba(255,255,255,.3)",fontWeight:800,fontSize:15,cursor:url.trim()&&key.trim()?"pointer":"default",fontFamily:"inherit",transition:"all .2s"}}>
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
        {getConfig()&&(
          <div style={{marginTop:8,borderRadius:12,padding:"10px 14px",fontSize:12,textAlign:"center",
            background:authStatus==="ok"?"rgba(22,163,74,.15)":authStatus==="checking"?"rgba(148,163,184,.15)":"rgba(220,38,38,.15)",
            border:`1px solid ${authStatus==="ok"?"rgba(22,163,74,.3)":authStatus==="checking"?"rgba(148,163,184,.3)":"rgba(220,38,38,.3)"}`,
            color:authStatus==="ok"?"#86efac":authStatus==="checking"?"#cbd5e1":"#fca5a5"}}>
            {authStatus==="checking"?"Anmeldung wird geprüft...":authStatus==="ok"?`Anonyme Anmeldung aktiv (${authUid}…)`:"Anonyme Anmeldung nicht möglich – im Dashboard aktivieren"}
          </div>
        )}
      </div>
    </div>
  );
}

const uid   = () => Math.random().toString(36).slice(2,9);

const addMins = (time, mins) => {
  const [h,m] = (time||"09:00").split(":").map(Number);
  const total = h*60 + m + (mins||0);
  return String(Math.floor(total/60)%24).padStart(2,"0")+":"+String(total%60).padStart(2,"0");
};
const hashPw = (pw) => { let h=0; for(let i=0;i<pw.length;i++){h=Math.imul(31,h)+pw.charCodeAt(i)|0;} return "h"+Math.abs(h).toString(36); };
const checkPw = (input,stored) => { if(!stored)return false; if(stored.startsWith("h"))return hashPw(input)===stored; return input===stored; };

const now   = () => new Date().toISOString().slice(0,10);
const addD  = (iso,n) => { const d=new Date(iso+"T12:00:00"); d.setDate(d.getDate()+n); return d.toISOString().slice(0,10); };
const addW  = (iso,n) => addD(iso,n*7);
const fmtD  = iso => { const d=new Date(iso+"T12:00:00"); return `${["So","Mo","Di","Mi","Do","Fr","Sa"][d.getDay()]},${String(d.getDate()).padStart(2,"0")}.${String(d.getMonth()+1).padStart(2,"0")}.${d.getFullYear()}`; };
const fmtDShort = iso => { const d=new Date(iso+"T12:00:00"); return `${String(d.getDate()).padStart(2,"0")}.${String(d.getMonth()+1).padStart(2,"0")}.`; };

const ACOLORS = ["#e74c3c","#e67e22","#2ecc71","#1abc9c","#3498db","#9b59b6","#e91e63","#00bcd4","#f59e0b","#8bc34a","#ff6b6b","#845ef7"];
const acol  = n => { let h=0; for(const c of n) h=c.charCodeAt(0)+((h<<5)-h); return ACOLORS[Math.abs(h)%ACOLORS.length]; };
const inits = n => n.split(" ").map(w=>w[0]).join("").slice(0,2).toUpperCase();
const contrast = hex => { const r=parseInt(hex.slice(1,3),16),g=parseInt(hex.slice(3,5),16),b=parseInt(hex.slice(5,7),16); return (r*299+g*587+b*114)/1000>145?"#111":"#fff"; };
const mix = (hex,p) => { let r=parseInt(hex.slice(1,3),16),g=parseInt(hex.slice(3,5),16),b=parseInt(hex.slice(5,7),16); const m=c=>Math.min(255,Math.floor(c+(255-c)*(p/100))); return `#${m(r).toString(16).padStart(2,"0")}${m(g).toString(16).padStart(2,"0")}${m(b).toString(16).padStart(2,"0")}`; };

const ET = {
  training:     { label:"Training",    icon:"TR", col:"#16a34a", bg:"#dcfce7" },
  heimspiel:    { label:"Heimspiel",icon:"Heim",col:"#2563eb",bg:"#dbeafe" },auswarts:     { label:"Auswaertsspiel",icon:"Bus",col:"#d97706",bg:"#fef3c7" },freundschaft: { label:"Freundschaftsspiel",icon:"Hand",col:"#7c3aed",bg:"#ede9fe" },turnier:      { label:"Turnier",icon:"Pokal",col:"#dc2626",bg:"#fee2e2" },event:        { label:"Sondertermin",icon:"Fest",col:"#0891b2",bg:"#e0f2fe" },};

function seed() {
  // --- Demo-Inhalte: Teams, Spieler (Profile + Namensliste) und Termine ---
  const _teamDefs = [
    { id:"demo_g1",   name:"G1",            icon:"G",  col:"#16a34a", pwd:"g1",  cat:"G-Jugend",   years:"2018/19", by:2018 },
    { id:"demo_g2",   name:"G2",            icon:"G",  col:"#16a34a", pwd:"g2",  cat:"G-Jugend",   years:"2018/19", by:2018 },
    { id:"demo_f1",   name:"F1",            icon:"F",  col:"#2563eb", pwd:"f1",  cat:"F-Jugend",   years:"2016/17", by:2016 },
    { id:"demo_f2",   name:"F2",            icon:"F",  col:"#2563eb", pwd:"f2",  cat:"F-Jugend",   years:"2016/17", by:2016 },
    { id:"demo_f3",   name:"F3",            icon:"F",  col:"#2563eb", pwd:"f3",  cat:"F-Jugend",   years:"2016/17", by:2016 },
    { id:"demo_e1",   name:"E1",            icon:"E",  col:"#7c3aed", pwd:"e1",  cat:"E-Jugend",   years:"2014/15", by:2014 },
    { id:"demo_e2",   name:"E2",            icon:"E",  col:"#7c3aed", pwd:"e2",  cat:"E-Jugend",   years:"2014/15", by:2014 },
    { id:"demo_sen1", name:"1. Mannschaft", icon:"S",  col:"#d97706", pwd:"s1",  cat:"Senioren",   years:"",        by:1998 },
    { id:"demo_sen2", name:"2. Mannschaft", icon:"S",  col:"#d97706", pwd:"s2",  cat:"Senioren",   years:"",        by:1996 },
    { id:"demo_ah",   name:"Alt-Herren",    icon:"AH", col:"#64748b", pwd:"ah1", cat:"Alt-Herren", years:"",        by:1985 },
  ];
  const _FN = ["Max","Leon","Finn","Noah","Emil","Ben","Luca","Paul","Jonas","Tim","Elias","David","Felix","Moritz","Anton","Marco","Kevin","Tobias","Dennis","Sven","Andreas","Stefan","Ralf","Juergen","Lukas","Nico","Jan","Tom","Erik","Simon","Mia","Lina","Emma","Lara","Hanna"];
  const _LN = ["Mueller","Schmidt","Weber","Fischer","Becker","Wagner","Hofmann","Schaefer","Koch","Richter","Wolf","Neumann","Schwarz","Zimmermann","Braun","Krueger","Hartmann","Lange","Klein","Vogel","Frank","Berger","Roth","Huber","Maier","Koehler","Walter","Bauer","Schulz","Hoffmann"];
  const _POS = ["Tor","Abwehr","Mittelfeld","Sturm"];
  const _pp = [];
  const _players = {};
  const _ev = [];
  const _mkEv = (tid, type, title, off, time, loc) => ({
    id:uid(), tid, type, title, date:addD(now(),off), time, loc, note:"",
    pt:"att", recMode:"none", recDays:[], recStart:now(), recUntil:"", recDates:[],
    li:[], fi:[], sc:[], selType:"multi", open:false, votes:{}, sid:null
  });
  _teamDefs.forEach((td, ti) => {
    const count = td.cat==="Alt-Herren" ? 5 : 6;
    const names = [];
    for (let k=0; k<count; k++) {
      const fn = _FN[(ti*5 + k) % _FN.length];
      const ln = _LN[(ti*7 + k*3) % _LN.length];
      const name = `${fn} ${ln}`;
      names.push(name);
      _pp.push(mkPlayer({
        name, by: td.by - (k%2), gender: k===count-1 ? "w" : "m",
        mainTid: td.id, seasonId: "s2526",
        position: _POS[k % _POS.length], jerseyNr: String(k+1),
        goals: (k*2) % 9, assists: (k*3) % 7,
      }));
    }
    _players[td.id] = names;
    _ev.push(_mkEv(td.id, "training", "Training", 2 + (ti % 3), "17:30", "Sportplatz Nord"));
    _ev.push(_mkEv(td.id, "match", `Spiel vs. Gegner ${ti+1}`, 5 + (ti % 4), "11:00", "Sportplatz Nord"));
    _ev.push(_mkEv(td.id, "training", "Training", -3, "17:30", "Sportplatz Nord"));
  });
  const _teams = _teamDefs.map(td => ({
    id: td.id, cid: "demo", name: td.name, icon: td.icon, col: td.col,
    pub: true, pwd: td.pwd, cat: td.cat, years: td.years
  }));
  return {
    _v: 16,
    helpers: [], chats: [], messages: [], events: _ev, bookings: [],
    contactRequests: [], securityLog: [], playerProfiles: _pp,
    seasons: [{ id:"s2526", label:"2025/2026", status:"active" }],
    activeSeason: "s2526",
    fields: [],
    players: _players,
    pollTemplates: [],
    clubs: [
      ...DEMO_CLUBS.map(dc=>({...dc, adm:"h586034f", pub:false,
        createdAt:"2025-01-01", settings:{}})),
      { id:"demo", slug:"demo-verein", name:"Demo Verein", short:"Demo", em:"D",
        logo:null, pri:"#16a34a", sec:"#052e16", adm:"h586034f",
        pub:false, dir:false, sport:"fussball",
        createdAt:"2025-01-01T00:00:00.000Z" }
    ],
    teams: _teams,
    trainers: [
      { id:"dt1", cid:"demo", name:"Trainer A", role:"Trainer",
        tids:["demo_g1","demo_g2","demo_f1","demo_f2","demo_f3"], pw:"h4c0ffa1c", phone:"", email:"" },
      { id:"dt2", cid:"demo", name:"Trainer B", role:"Trainer",
        tids:["demo_e1","demo_e2","demo_sen1","demo_sen2","demo_ah"], pw:"h4c0ffa1d", phone:"", email:"" }
    ]
  };
}
const CSS = `
@import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800;900&display=swap');
*{box-sizing:border-box;margin:0;padding:0;-webkit-tap-highlight-color:transparent;-webkit-text-size-adjust:100%;text-size-adjust:100%}
html{overflow-x:hidden;touch-action:manipulation}
html,body{height:100%;max-width:100vw;overflow-x:hidden;font-family:'Plus Jakarta Sans',sans-serif;background:#f0f4f8;overscroll-behavior:none;display:block;margin:0;padding:0;place-items:normal}
button{touch-action:manipulation;cursor:pointer}
button,select{font-family:'Plus Jakarta Sans',sans-serif;font-size:inherit}
input,textarea{font-family:'Plus Jakarta Sans',sans-serif;font-size:16px !important}
input::placeholder,textarea::placeholder{color:#94a3b8}
img{max-width:100%;height:auto}
#root{max-width:100vw;width:100%;overflow-x:hidden;margin:0;padding:0;text-align:left}
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

const TH = cl => {
  const p = cl?.pri||"#16a34a";
  return { p,s:cl?.sec||"#052e16",ct:contrast(p),li:mix(p,85),logo:cl?.logo||null,em:cl?.em||"*" };
};



function ChangePasswordModal({ cl, onSave, onClose }) {
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
          <input type="password" value={oldPw} onChange={e=>setOldPw(e.target.value)} placeholder="Aktuelles Passwort"
            style={{padding:"11px 14px",fontSize:14,border:"1.5px solid #e2e8f0",borderRadius:11,outline:"none"}}/>
          <input type="password" value={newPw} onChange={e=>setNewPw(e.target.value)} placeholder="Neues Passwort"
            style={{padding:"11px 14px",fontSize:14,border:"1.5px solid #e2e8f0",borderRadius:11,outline:"none"}}/>
          <input type="password" value={newPw2} onChange={e=>setNewPw2(e.target.value)} placeholder="Neues Passwort wiederholen"
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
function OnlineStatus() {
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

function exportICS(events, clName) {
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
function Logo({cl,sz=48,sx={}}) {
  const t=TH(cl);
  if(t.logo) return <img src={t.logo} alt="" style={{width:sz,height:sz,borderRadius:sz*.22,objectFit:"cover",flexShrink:0,...sx}}/>;
  return <div style={{width:sz,height:sz,borderRadius:sz*.22,background:t.p+"28",display:"flex",alignItems:"center",justifyContent:"center",fontSize:sz*.5,flexShrink:0,...sx}}>{t.em}</div>;
}
function Av({name,sz=32,border=true}) {
  return <div style={{width:sz,height:sz,borderRadius:"50%",background:acol(name),color:"#fff",display:"flex",alignItems:"center",justifyContent:"center",fontSize:sz*.36,fontWeight:800,border:border?"2px solid rgba(255,255,255,.7)":"none",flexShrink:0,boxShadow:"0 1px 4px rgba(0,0,0,.15)"}}>{inits(name)}</div>;
}
function Tag({c="#64748b",bg,ch,sm}) {
  return <span style={{background:bg||(c+"20"),color:c,borderRadius:99,padding:sm?"2px 7px":"3px 10px",fontSize:sm?10:12,fontWeight:700,display:"inline-flex",alignItems:"center",whiteSpace:"nowrap"}}>{ch}</span>;
}
function Toast({msg}) {
  return msg?<div style={{position:"fixed",bottom:30,left:"50%",transform:"translateX(-50%)",background:"#0f172a",color:"#fff",borderRadius:99,padding:"11px 22px",fontSize:14,fontWeight:700,boxShadow:"0 8px 32px rgba(0,0,0,.35)",animation:"toast .26s ease",zIndex:9999,whiteSpace:"nowrap",pointerEvents:"none"}}>{msg}</div>:null;
}
function Drawer({ch,onClose,title,maxH="92dvh"}) {
  return (
    <div onClick={onClose} style={{position:"fixed",inset:0,background:"rgba(0,0,0,.55)",display:"flex",alignItems:"flex-end",justifyContent:"center",zIndex:900,backdropFilter:"blur(8px)"}}>
      <div onClick={e=>e.stopPropagation()} style={{background:"#fff",borderRadius:"22px 22px 0 0",width:"100%",maxWidth:560,maxHeight:maxH,overflowY:"auto",boxShadow:"0 -16px 60px rgba(0,0,0,.2)",animation:"down .22s ease"}}>
        <div style={{display:"flex",justifyContent:"center",padding:"10px 0 2px"}}><div style={{width:36,height:4,borderRadius:99,background:"#e2e8f0"}}/></div>
        {title&&<div style={{padding:"6px 22px 14px",fontSize:18,fontWeight:800,color:"#0f172a"}}>{title}</div>}
        <div style={{padding:"0 20px 48px"}}>{ch}</div>
      </div>
    </div>
  );
}
function Btn({ch,onClick,v="pri",full,sm,dis,load,icon,cl,sx={}}) {
  const p=cl?.pri||"#16a34a";
  const V={
    pri:{
      background:dis?"#e2e8f0":`linear-gradient(135deg,${p} 0%,${mix(p,-12)} 100%)`,color:dis?"#94a3b8":contrast(p),boxShadow:dis?"none":`0 2px 8px ${p}40,0 1px 2px ${p}30`,border:"none",},drk:{
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
        ...s,borderRadius:radius,padding:pad,fontSize:fSize,fontWeight:700,letterSpacing:"-.01em",cursor:dis||load?"not-allowed":"pointer",width:full?"100%":undefined,display:"inline-flex",alignItems:"center",justifyContent:"center",gap:7,transition:"all .15s",opacity:dis?.55:1,fontFamily:"inherit",lineHeight:1.2,...sx
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
function Inp({label,val,set,ph,type="text",af,rows,cl,note}) {
  const [f,setF]=useState(false); const c=cl?.pri||"#16a34a";
  const base={width:"100%",padding:"12px 15px",fontSize:15,border:`2px solid ${f?c:"#e2e8f0"}`,borderRadius:13,outline:"none",background:"#fff",transition:"border-color .17s",display:"block",resize:"vertical"};
  return <div style={{display:"flex",flexDirection:"column",gap:5}}>{label&&<div style={{fontSize:11,fontWeight:800,color:"#64748b",letterSpacing:.6,textTransform:"uppercase"}}>{label}</div>}{rows?<textarea value={val} onChange={e=>set(e.target.value)} placeholder={ph} rows={rows} onFocus={()=>setF(true)} onBlur={()=>setF(false)} style={base}/>:<input type={type} value={val} onChange={e=>set(e.target.value)} placeholder={ph} autoFocus={af} onFocus={()=>setF(true)} onBlur={()=>setF(false)} style={base}/>}{note&&<div style={{fontSize:12,color:"#94a3b8"}}>{note}</div>}</div>;
}
function Sel({label,val,set,opts}) {
  return <div style={{display:"flex",flexDirection:"column",gap:5}}>{label&&<div style={{fontSize:11,fontWeight:800,color:"#64748b",letterSpacing:.6,textTransform:"uppercase"}}>{label}</div>}<select value={val} onChange={e=>set(e.target.value)} style={{width:"100%",padding:"12px 15px",fontSize:15,border:"2px solid #e2e8f0",borderRadius:13,outline:"none",background:"#fff",appearance:"none",backgroundImage:`url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='8'%3E%3Cpath d='M1 1l5 5 5-5' stroke='%2364748b' stroke-width='2' fill='none' stroke-linecap='round'/%3E%3C/svg%3E")`,backgroundRepeat:"no-repeat",backgroundPosition:"right 15px center"}}>{opts.map(([v,l])=><option key={v} value={v}>{l}</option>)}</select></div>;
}
function Sw({on,tog,pri="#16a34a",label,sub}) {
  return <div style={{display:"flex",alignItems:"center",gap:12,padding:"12px 0",borderBottom:"1px solid #f1f5f9"}}><div style={{flex:1}}><div style={{fontWeight:700,fontSize:15,color:"#0f172a"}}>{label}</div>{sub&&<div style={{fontSize:13,color:"#64748b",marginTop:2}}>{sub}</div>}</div><div onClick={tog} style={{width:48,height:26,borderRadius:99,background:on?pri:"#cbd5e1",cursor:"pointer",position:"relative",transition:"background .2s",flexShrink:0}}><div style={{width:20,height:20,borderRadius:"50%",background:"#fff",position:"absolute",top:3,left:on?25:3,transition:"left .2s",boxShadow:"0 2px 6px rgba(0,0,0,.2)"}}/></div></div>;
}
function ClubHeader({cl, sub, right, hide=false}) {
  const t=TH(cl);
  if(hide) return null;
  return <div style={{background:`linear-gradient(135deg,${t.s} 0%,${t.p}bb 100%)`,padding:"16px 18px 20px",position:"sticky",top:0,zIndex:60,boxShadow:"0 4px 24px rgba(0,0,0,.22)"}}><div style={{display:"flex",alignItems:"center",gap:12}}><Logo cl={cl} sz={42}/><div style={{flex:1,minWidth:0}}><div style={{color:"#fff",fontWeight:900,fontSize:17,letterSpacing:-.3,lineHeight:1.2}}>{cl?.name}</div>{sub&&<div style={{color:"rgba(255,255,255,.6)",fontSize:12,fontWeight:600,marginTop:2}}>{sub}</div>}</div>{right}</div></div>;
}
function Divider({label,light}) {
  return <div style={{display:"flex",alignItems:"center",gap:10,margin:"14px 0 10px"}}><div style={{flex:1,height:1,background:"#e2e8f0"}}/><span style={{fontSize:11,fontWeight:800,color:light?"#94a3b8":"#64748b",whiteSpace:"nowrap"}}>{label}</span><div style={{flex:1,height:1,background:"#e2e8f0"}}/></div>;
}

function ContactForm({ cl, onSend, onClose, hide }) {
  const [f,setF]=useState({name:"",email:"",msg:""});
  const [sent,setSent]=useState(false);
  const t=TH(cl);
  const send=()=>{if(!f.name.trim()||f.msg.trim().length<5)return;onSend({...f,ts:new Date().toISOString()});setSent(true);};
  if(sent) return <div style={{minHeight:"100dvh",background:"#f0fdf4",display:"flex",alignItems:"center",justifyContent:"center",flexDirection:"column",gap:14,padding:24}}><div style={{fontSize:48}}>ok</div><p style={{fontWeight:800,fontSize:18}}>Anfrage gesendet!</p><button onClick={onClose} style={{padding:"12px 24px",borderRadius:12,border:"none",background:t.p,color:"#fff",fontWeight:800,cursor:"pointer",fontFamily:"inherit"}}>Schließen</button></div>;
  if(hide) return null;
  return (
    <div style={{minHeight:"100dvh",background:"#f0f4f8",padding:"24px 20px"}}>
      <style>{CSS}</style><OnlineStatus/>
      <button onClick={onClose} style={{background:"none",border:"none",color:"#64748b",fontWeight:700,fontSize:14,cursor:"pointer",marginBottom:16}}>Abbrechen</button>
      <div style={{background:"#fff",borderRadius:18,padding:"20px"}}>
        <div style={{fontWeight:900,fontSize:18,marginBottom:16}}>{cl.name} kontaktieren</div>
        <div style={{display:"flex",flexDirection:"column",gap:10}}>
          <input value={f.name} onChange={e=>setF(p=>({...p,name:e.target.value}))} placeholder="Dein Name" style={{padding:"11px 14px",fontSize:14,border:"1.5px solid #e2e8f0",borderRadius:11,outline:"none"}}/>
          <input value={f.email} onChange={e=>setF(p=>({...p,email:e.target.value}))} placeholder="E-Mail (optional)" style={{padding:"11px 14px",fontSize:14,border:"1.5px solid #e2e8f0",borderRadius:11,outline:"none"}}/>
          <textarea value={f.msg} onChange={e=>setF(p=>({...p,msg:e.target.value}))} placeholder="Deine Nachricht..." rows={4} style={{padding:"11px 14px",fontSize:14,border:"1.5px solid #e2e8f0",borderRadius:11,outline:"none",resize:"none",fontFamily:"inherit"}}/>
        </div>
        <button onClick={send} style={{width:"100%",marginTop:14,padding:"13px",borderRadius:12,border:"none",background:t.p,color:"#fff",fontWeight:800,fontSize:15,cursor:"pointer",fontFamily:"inherit"}}>Senden</button>
      </div>
    </div>
  );
}

function InboxTab({ data,cid,save,fire,cl }) {
  const t = TH(cl);
  const requests  = (data.contactRequests||[]).filter(r=>r.cid===cid);
  const secLog    = (data.securityLog||[]).filter(s=>s.cid===cid);
  const [view,setView] = useState("inbox"); // inbox | security

  const unreadInbox = requests.filter(r=>!r.read&&!r.blocked).length;
  const unreadSec   = secLog.filter(s=>!s.read).length;

  const markRead = id => save({...data,contactRequests:(data.contactRequests||[]).map(r=>r.id===id?{...r,read:true}:r)});
  const blockSender = (req) => {
    const next = (data.contactRequests||[]).map(r=>
      r.fromEmail===req.fromEmail||r.fromName===req.fromName ? {...r,blocked:true,read:true} : r
    );
    const logEntry = {id:uid(),cid,type:"spam_block",ts:new Date().toISOString(),detail:`Absender "${req.fromName}" blockiert - ${next.filter(r=>r.blocked&&(r.fromEmail===req.fromEmail||r.fromName===req.fromName)).length} Nachrichten`,read:false};
    save({...data,contactRequests:next,securityLog:[...(data.securityLog||[]),logEntry]});
    fire("Absender blockiert und gemeldet");
  };
  const deleteReq = id => save({...data,contactRequests:(data.contactRequests||[]).filter(r=>r.id!==id)});
  const markSecRead = id => save({...data,securityLog:(data.securityLog||[]).map(s=>s.id===id?{...s,read:true}:s)});

  const fmtDate = ts => new Date(ts).toLocaleDateString("de-DE",{day:"2-digit",month:"2-digit",hour:"2-digit",minute:"2-digit"});

  const SEC_TYPES = {
    spam_block:    {icon:"X",col:"#dc2626",bg:"#fee2e2",label:"Spam blockiert"},many_requests: {icon:"!",col:"#d97706",bg:"#fef3c7",label:"Viele Anfragen"},login_fail:    {icon:"?",col:"#7c3aed",bg:"#ede9fe",label:"Fehlerhafte Logins"},suspicious:    {icon:"!!",col:"#dc2626",bg:"#fee2e2",label:"Verdaechtige Aktivitaet"},};

  const visible = requests.filter(r=>!r.blocked);
  const blocked = requests.filter(r=>r.blocked);

  return (
    <div>
      {}
      <div style={{display:"flex",gap:8,marginBottom:16}}>
        {[["inbox",`Posteingang${unreadInbox>0?` (${unreadInbox})`:""}`],["security",`Sicherheit${unreadSec>0?` (${unreadSec})`:""}`]].map(([k,l])=>(
          <button key={k} onClick={()=>setView(k)}
            style={{flex:1,padding:"10px",borderRadius:12,border:`2px solid ${view===k?t.p:"#e2e8f0"}`,background:view===k?t.p:"#fff",color:view===k?"#fff":"#475569",fontWeight:700,fontSize:13,cursor:"pointer",fontFamily:"inherit",transition:"all .15s"}}>
            {l}
          </button>
        ))}
      </div>

      {}
      {view==="inbox"&&<>
        {visible.length===0&&(
          <div style={{textAlign:"center",padding:"32px",background:"#f8fafc",borderRadius:14,border:"1.5px dashed #e2e8f0"}}>
            <div style={{fontSize:36,marginBottom:8}}>&#x2709;</div>
            <p style={{fontWeight:700,color:"#334155"}}>Keine Anfragen</p>
            <p style={{fontSize:13,color:"#94a3b8",marginTop:4}}>Wenn jemand euren Verein kontaktiert,erscheint es hier.</p>
          </div>
        )}
        <div style={{display:"flex",flexDirection:"column",gap:8}}>
          {visible.map(req=>(
            <div key={req.id} style={{background:"#fff",borderRadius:14,border:`1.5px solid ${req.read?"#e2e8f0":"#bfdbfe"}`,overflow:"hidden"}}>
              <div style={{padding:"12px 14px"}}>
                <div style={{display:"flex",alignItems:"flex-start",gap:10}}>
                  <div style={{width:36,height:36,borderRadius:11,background:req.read?"#f1f5f9":"#dbeafe",display:"flex",alignItems:"center",justifyContent:"center",fontWeight:800,fontSize:15,color:req.read?"#64748b":"#1d4ed8",flexShrink:0}}>
                    {req.fromName?.[0]?.toUpperCase()||"?"}
                  </div>
                  <div style={{flex:1,minWidth:0}}>
                    <div style={{display:"flex",alignItems:"center",gap:7,marginBottom:2}}>
                      <span style={{fontWeight:800,fontSize:14,color:"#0f172a"}}>{req.fromName}</span>
                      {!req.read&&<span style={{fontSize:10,fontWeight:800,color:"#1d4ed8",background:"#dbeafe",borderRadius:5,padding:"2px 7px"}}>Neu</span>}
                    </div>
                    {req.fromEmail&&<div style={{fontSize:11,color:"#64748b",marginBottom:4}}>{req.fromEmail}</div>}
                    <p style={{fontSize:13,color:"#334155",lineHeight:1.6,margin:"0 0 6px"}}>{req.msg}</p>
                    <div style={{fontSize:11,color:"#94a3b8"}}>{fmtDate(req.ts)}</div>
                  </div>
                </div>
              </div>
              <div style={{display:"flex",borderTop:"1px solid #f1f5f9"}}>
                {!req.read&&<button onClick={()=>markRead(req.id)} style={{flex:1,padding:"9px",border:"none",background:"none",color:"#16a34a",fontWeight:700,fontSize:12,cursor:"pointer",fontFamily:"inherit"}}>Gelesen</button>}
                <button onClick={()=>blockSender(req)} style={{flex:1,padding:"9px",border:"none",background:"none",color:"#d97706",fontWeight:700,fontSize:12,cursor:"pointer",fontFamily:"inherit"}}>Blockieren</button>
                <button onClick={()=>deleteReq(req.id)} style={{flex:1,padding:"9px",border:"none",background:"none",color:"#dc2626",fontWeight:700,fontSize:12,cursor:"pointer",fontFamily:"inherit"}}>Löschen</button>
              </div>
            </div>
          ))}
        </div>

        {blocked.length>0&&(
          <div style={{marginTop:16,background:"#fef2f2",borderRadius:12,padding:"12px 14px",border:"1.5px solid #fecaca"}}>
            <div style={{fontWeight:700,fontSize:13,color:"#dc2626",marginBottom:4}}>Blockierte Absender ({blocked.length})</div>
            {[...new Set(blocked.map(r=>r.fromName))].map(name=>(
              <div key={name} style={{fontSize:12,color:"#9f1239",padding:"3px 0"}}>{name} - {blocked.filter(r=>r.fromName===name).length} blockierte Nachricht(en)</div>
            ))}
          </div>
        )}
      </>}

      {}
      {view==="security"&&<>
        <div style={{background:"#eff6ff",borderRadius:13,padding:"12px 14px",border:"1.5px solid #bfdbfe",marginBottom:14,fontSize:13,color:"#1d4ed8",lineHeight:1.6}}>
          Hier siehst du sicherheitsrelevante Ereignisse für deinen Verein. Wir überwachen automatisch ob dein Vereinszugang missbraucht wird.
        </div>
        {secLog.length===0&&(
          <div style={{textAlign:"center",padding:"32px",background:"#f8fafc",borderRadius:14,border:"1.5px dashed #e2e8f0"}}>
            <div style={{fontSize:36,marginBottom:8}}>&#x1F6E1;</div>
            <p style={{fontWeight:700,color:"#16a34a"}}>Alles in Ordnung</p>
            <p style={{fontSize:13,color:"#94a3b8",marginTop:4}}>Keine ungewoehnlichen Aktivitaeten erkannt.</p>
          </div>
        )}
        <div style={{display:"flex",flexDirection:"column",gap:8}}>
          {secLog.sort((a,b)=>b.ts.localeCompare(a.ts)).map(e=>{
            const st=SEC_TYPES[e.type]||{icon:"i",col:"#64748b",bg:"#f1f5f9",label:e.type};
            return (
              <div key={e.id} style={{background:"#fff",borderRadius:14,border:`1.5px solid ${e.read?"#e2e8f0":st.col+"40"}`,padding:"12px 14px",display:"flex",gap:12,alignItems:"flex-start"}}>
                <div style={{width:36,height:36,borderRadius:11,background:st.bg,display:"flex",alignItems:"center",justifyContent:"center",fontWeight:900,fontSize:13,color:st.col,flexShrink:0}}>{st.icon}</div>
                <div style={{flex:1}}>
                  <div style={{display:"flex",alignItems:"center",gap:7,marginBottom:3}}>
                    <span style={{fontWeight:800,fontSize:13,color:"#0f172a"}}>{st.label}</span>
                    {!e.read&&<span style={{fontSize:10,fontWeight:800,color:st.col,background:st.bg,borderRadius:5,padding:"2px 7px"}}>Neu</span>}
                  </div>
                  <p style={{fontSize:12,color:"#64748b",margin:"0 0 4px",lineHeight:1.5}}>{e.detail}</p>
                  <div style={{fontSize:11,color:"#94a3b8"}}>{fmtDate(e.ts)}</div>
                </div>
                {!e.read&&<button onClick={()=>markSecRead(e.id)} style={{width:28,height:28,borderRadius:8,background:"#f1f5f9",border:"none",color:"#64748b",cursor:"pointer",fontSize:12,flexShrink:0}}>ok</button>}
              </div>
            );
          })}
        </div>
        <div style={{marginTop:14,background:"#f8fafc",borderRadius:12,padding:"12px 14px",border:"1.5px solid #e2e8f0",fontSize:12,color:"#64748b",lineHeight:1.6}}>
          Automatischer Schutz aktiv: Absender die mehr als 5 Nachrichten senden werden automatisch blockiert und gemeldet. Dein Admin-Zugang wird bei 10 Fehlversuchen temporaer gesperrt.
        </div>
      </>}
    </div>
  );
}


/*  ONBOARDING WIZARD (Admin - erster Login)  */
function OnboardingWizard({ cl, data, save, fire, onDone }) {
  const t = TH(cl);
  const [step, setStep] = useState(1);
  const STEPS = 5;
  const SPORT_CATS = {
    fussball: [
      {id:"bambinis",label:"Bambinis",years:"U6"},
      {id:"g_jug",label:"G-Jugend",years:"U7"},
      {id:"f_jug",label:"F-Jugend",years:"U8-U9"},
      {id:"e_jug",label:"E-Jugend",years:"U10-U11"},
      {id:"d_jug",label:"D-Jugend",years:"U12-U13"},
      {id:"c_jug",label:"C-Jugend",years:"U14-U15"},
      {id:"b_jug",label:"B-Jugend",years:"U16-U17"},
      {id:"a_jug",label:"A-Jugend",years:"U18-U19"},
      {id:"senioren",label:"1. Senioren",years:"Aktive"},
      {id:"senioren2",label:"2. Senioren",years:"Aktive"},
      {id:"senioren3",label:"3. Senioren",years:"Aktive"},
      {id:"altherren",label:"Alt-Herren",years:"Ue32"},
      {id:"frauen",label:"Frauen",years:"Aktive"},
      {id:"maedchen",label:"Mädchen",years:"Jugend"},
    ],
    handball: [
      {id:"minis",label:"Mini-Handball",years:"U6-U8"},
      {id:"e_jug",label:"E-Jugend",years:"U10"},
      {id:"d_jug",label:"D-Jugend",years:"U12"},
      {id:"c_jug",label:"C-Jugend",years:"U14"},
      {id:"b_jug",label:"B-Jugend",years:"U16"},
      {id:"a_jug",label:"A-Jugend",years:"U18"},
      {id:"senioren",label:"Senioren",years:"Aktive"},
      {id:"frauen",label:"Frauen",years:"Aktive"},
    ],
    tennis: [
      {id:"kinder",label:"Kinder",years:"U10"},
      {id:"jugend",label:"Jugend",years:"U18"},
      {id:"erwachsene",label:"Erwachsene",years:"Aktive"},
      {id:"senioren",label:"Senioren",years:"Ue60"},
    ],
    default: [
      {id:"jugend",label:"Jugend",years:""},
      {id:"erwachsene",label:"Erwachsene",years:""},
      {id:"senioren",label:"Senioren",years:""},
    ]
  };
  const cats = SPORT_CATS[cl.sport||"fussball"] || SPORT_CATS.default;
  const TEAM_COLORS = ["#16a34a","#2563eb","#d97706","#7c3aed","#dc2626","#0891b2","#059669","#ea580c"];

  const [selCats, setSelCats] = useState([]);
  const [teamCounts, setTeamCounts] = useState({});
  const [trainerName, setTrainerName] = useState("");
  const [trainerPw, setTrainerPw] = useState("");
  const [fieldName, setFieldName] = useState("Hauptplatz");
  const [fieldSurface, setFieldSurface] = useState("Rasen");

  const toggleCat = id => {
    const n = selCats.includes(id) ? selCats.filter(x=>x!==id) : [...selCats,id];
    setSelCats(n);
    if(!teamCounts[id]) setTeamCounts(prev=>({...prev,[id]:1}));
  };

  const finish = () => {
    const newTeams = selCats.flatMap((catId,ci) => {
      const cat = cats.find(x=>x.id===catId);
      const cnt = teamCounts[catId]||1;
      return Array.from({length:cnt},(_,i)=>({
        id: uid(), cid: cl.id,
        name: cnt===1 ? cat.label : cat.label+" "+(i+1),
        icon: cat.label.slice(0,2).toUpperCase(),
        col: TEAM_COLORS[(ci*cnt+i) % TEAM_COLORS.length],
        pub: true, pwd: catId.slice(0,2)+(i+1),
        cat: cat.label, years: cat.years
      }));
    });
    const newTrainers = trainerName.trim() ? [{
      id: uid(), cid: cl.id, name: trainerName.trim(),
      role: "Trainer", tids: newTeams.slice(0,1).map(x=>x.id),
      pw: hashPw(trainerPw||"trainer"), phone: "", email: ""
    }] : [];
    const newFields = fieldName.trim() ? [{
      id: uid(), cid: cl.id, name: fieldName.trim(),
      surface: fieldSurface, segments: 4
    }] : [];
    const updClubs = (data.clubs||[]).map(x=>x.id===cl.id?{...x,onboarded:true}:x);
    save({
      ...data, clubs: updClubs,
      teams: [...(data.teams||[]),...newTeams],
      trainers: [...(data.trainers||[]),...newTrainers],
      fields: [...(data.fields||[]),...newFields],
    });
    fire("Verein eingerichtet - Los geht es!");
    onDone();
  };

  const ok = () => {
    if(step===2) return selCats.length>0;
    return true;
  };

  const pct = Math.round((step/STEPS)*100);

  return (
    <div style={{position:"fixed",inset:0,background:"linear-gradient(160deg,#0f172a,#052e16 60%)",zIndex:980,display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",padding:"20px"}}>
      <style>{`@keyframes down{from{opacity:0;transform:translateY(30px)}to{opacity:1;transform:none}}`}</style>
      <div style={{width:"100%",maxWidth:480,background:"#fff",borderRadius:24,overflow:"hidden",animation:"down .3s ease",maxHeight:"90dvh",display:"flex",flexDirection:"column"}}>
        {/* Header */}
        <div style={{background:`linear-gradient(135deg,${t.s||"#052e16"},${t.p})`,padding:"20px 22px 16px",flexShrink:0}}>
          <div style={{color:"rgba(255,255,255,.6)",fontSize:11,fontWeight:700,marginBottom:4}}>
            SCHRITT {step} VON {STEPS}
          </div>
          <div style={{color:"#fff",fontWeight:900,fontSize:20,marginBottom:12}}>
            {["","Willkommen!","Abteilungen","Teams","Trainer","Spielfeld"][step]}
          </div>
          <div style={{height:5,background:"rgba(255,255,255,.2)",borderRadius:99}}>
            <div style={{height:"100%",background:"rgba(255,255,255,.9)",borderRadius:99,width:pct+"%",transition:"width .4s"}}/>
          </div>
        </div>

        {/* Content */}
        <div style={{flex:1,overflowY:"auto",padding:"20px 22px 8px"}}>

          {step===1&&(
            <div>
              <div style={{textAlign:"center",marginBottom:20}}>
                <div style={{width:72,height:72,borderRadius:20,background:t.p+"18",display:"flex",alignItems:"center",justifyContent:"center",fontSize:36,margin:"0 auto 12px"}}>{cl.em||"D"}</div>
                <h2 style={{fontWeight:900,fontSize:22,color:"#0f172a"}}>{cl.name}</h2>
                <p style={{color:"#64748b",fontSize:14,marginTop:6,lineHeight:1.6}}>
                  Richte deinen Verein in wenigen Schritten ein.
                  Das dauert ca. 3 Minuten.
                </p>
              </div>
              <div style={{background:"#f0fdf4",borderRadius:14,padding:"14px 16px",border:"1.5px solid #bbf7d0"}}>
                <div style={{fontWeight:700,fontSize:13,color:"#166534",marginBottom:8}}>Was wir einrichten:</div>
                {["Abteilungen und Teams","Ersten Trainer anlegen","Spielfeld konfigurieren"].map((item,i)=>(
                  <div key={i} style={{display:"flex",alignItems:"center",gap:10,marginBottom:6}}>
                    <div style={{width:20,height:20,borderRadius:"50%",background:"#16a34a",display:"flex",alignItems:"center",justifyContent:"center",color:"#fff",fontSize:11,fontWeight:800,flexShrink:0}}>{i+1}</div>
                    <span style={{fontSize:13,color:"#334155"}}>{item}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {step===2&&(
            <div>
              <p style={{color:"#64748b",fontSize:13,marginBottom:14,lineHeight:1.5}}>
                Welche Abteilungen gibt es in deinem Verein? Du kannst später weitere hinzufügen.
              </p>
              <div style={{display:"flex",flexDirection:"column",gap:7}}>
                {cats.map(cat=>{
                  const sel = selCats.includes(cat.id);
                  return (
                    <div key={cat.id} onClick={()=>toggleCat(cat.id)}
                      style={{display:"flex",alignItems:"center",gap:12,padding:"11px 14px",borderRadius:13,border:`2px solid ${sel?t.p:"#e2e8f0"}`,background:sel?t.p+"10":"#fff",cursor:"pointer",transition:"all .15s"}}>
                      <div style={{width:32,height:32,borderRadius:9,background:sel?t.p:"#f1f5f9",display:"flex",alignItems:"center",justifyContent:"center",fontWeight:900,fontSize:12,color:sel?"#fff":"#64748b",flexShrink:0}}>
                        {cat.label.slice(0,2).toUpperCase()}
                      </div>
                      <div style={{flex:1}}>
                        <div style={{fontWeight:700,fontSize:14,color:sel?t.p:"#334155"}}>{cat.label}</div>
                        {cat.years&&<div style={{fontSize:11,color:"#94a3b8"}}>{cat.years}</div>}
                      </div>
                      <div style={{width:20,height:20,borderRadius:"50%",border:`${sel?"6px":"2px"} solid ${sel?t.p:"#cbd5e1"}`,transition:"all .2s",flexShrink:0}}/>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {step===3&&(
            <div>
              <p style={{color:"#64748b",fontSize:13,marginBottom:14,lineHeight:1.5}}>
                Wie viele Mannschaften gibt es pro Abteilung?
              </p>
              {selCats.map(catId=>{
                const cat = cats.find(x=>x.id===catId);
                const cnt = teamCounts[catId]||1;
                return (
                  <div key={catId} style={{background:"#fff",borderRadius:13,padding:"13px 16px",border:"1.5px solid #e2e8f0",marginBottom:10}}>
                    <div style={{fontWeight:700,fontSize:14,color:"#0f172a",marginBottom:8}}>{cat.label}</div>
                    <div style={{display:"flex",alignItems:"center",gap:12}}>
                      <button onClick={()=>setTeamCounts(p=>({...p,[catId]:Math.max(1,cnt-1)}))}
                        style={{width:36,height:36,borderRadius:10,border:"1.5px solid #e2e8f0",background:"#f8fafc",cursor:"pointer",fontSize:18,fontWeight:800,color:"#64748b"}}>-</button>
                      <div style={{flex:1,textAlign:"center"}}>
                        <div style={{fontWeight:900,fontSize:26,color:t.p,lineHeight:1}}>{cnt}</div>
                        <div style={{fontSize:11,color:"#94a3b8",marginTop:2}}>
                          {cnt===1 ? cat.label+" 1" : Array.from({length:cnt},(_,i)=>cat.label+" "+(i+1)).join(", ")}
                        </div>
                      </div>
                      <button onClick={()=>setTeamCounts(p=>({...p,[catId]:Math.min(9,cnt+1)}))}
                        style={{width:36,height:36,borderRadius:10,border:"1.5px solid #e2e8f0",background:"#f8fafc",cursor:"pointer",fontSize:18,fontWeight:800,color:"#64748b"}}>+</button>
                    </div>
                  </div>
                );
              })}
              <div style={{background:"#eff6ff",borderRadius:12,padding:"11px 14px",fontSize:12,color:"#1d4ed8",lineHeight:1.5}}>
                Jede Mannschaft bekommt automatisch einen Eltern-Zugangscode.
                Du kannst ihn später anpassen.
              </div>
            </div>
          )}

          {step===4&&(
            <div>
              <p style={{color:"#64748b",fontSize:13,marginBottom:14,lineHeight:1.5}}>
                Wer ist der erste Trainer? (Optional - du kannst das später machen)
              </p>
              <div style={{display:"flex",flexDirection:"column",gap:10}}>
                <input value={trainerName} onChange={e=>setTrainerName(e.target.value)}
                  placeholder="Name des Trainers (z.B. Max Muster)"
                  style={{padding:"12px 14px",fontSize:14,border:`1.5px solid ${trainerName?"#16a34a":"#e2e8f0"}`,borderRadius:12,outline:"none"}}/>
                <input type="password" value={trainerPw} onChange={e=>setTrainerPw(e.target.value)}
                  placeholder="Passwort für den Trainer"
                  style={{padding:"12px 14px",fontSize:14,border:"1.5px solid #e2e8f0",borderRadius:12,outline:"none"}}/>
                {trainerName&&!trainerPw&&<div style={{fontSize:12,color:"#d97706",background:"#fef3c7",borderRadius:9,padding:"8px 12px"}}>
                  Bitte auch ein Passwort vergeben.
                </div>}
              </div>
              <button onClick={()=>{ setTrainerName(""); setTrainerPw(""); setStep(5); }}
                style={{marginTop:12,background:"none",border:"none",color:"#94a3b8",fontSize:13,cursor:"pointer",textDecoration:"underline"}}>
                Überspringen - später hinzufügen
              </button>
            </div>
          )}

          {step===5&&(
            <div>
              <p style={{color:"#64748b",fontSize:13,marginBottom:14,lineHeight:1.5}}>
                Habt ihr einen Sportplatz oder eine Halle? (Optional)
              </p>
              <div style={{display:"flex",flexDirection:"column",gap:10}}>
                <input value={fieldName} onChange={e=>setFieldName(e.target.value)}
                  placeholder="z.B. Hauptplatz, Sporthalle"
                  style={{padding:"12px 14px",fontSize:14,border:`1.5px solid ${fieldName?"#16a34a":"#e2e8f0"}`,borderRadius:12,outline:"none"}}/>
                <div style={{display:"flex",gap:8,flexWrap:"wrap"}}>
                  {["Rasen","Kunstrasen","Halle","Sand","Asche"].map(s=>(
                    <button key={s} onClick={()=>setFieldSurface(s)}
                      style={{padding:"8px 14px",borderRadius:10,border:`2px solid ${fieldSurface===s?t.p:"#e2e8f0"}`,background:fieldSurface===s?t.p:"#fff",color:fieldSurface===s?"#fff":"#334155",fontWeight:700,fontSize:13,cursor:"pointer",fontFamily:"inherit"}}>
                      {s}
                    </button>
                  ))}
                </div>
              </div>
              <div style={{background:"#f0fdf4",borderRadius:12,padding:"12px 14px",border:"1.5px solid #bbf7d0",marginTop:16,fontSize:12,color:"#166534",lineHeight:1.6}}>
                Zusammenfassung:<br/>
                {selCats.length} Abteilungen, {selCats.reduce((s,id)=>s+(teamCounts[id]||1),0)} Teams
                {trainerName&&`, Trainer: ${trainerName}`}
                {fieldName&&`, Platz: ${fieldName}`}
              </div>
            </div>
          )}
        </div>

        {/* Navigation */}
        <div style={{padding:"12px 22px 32px",borderTop:"1px solid #f1f5f9",display:"flex",gap:10,flexShrink:0}}>
          {step>1
            ? <button onClick={()=>setStep(s=>s-1)} style={{flex:1,padding:"13px",borderRadius:13,border:"1.5px solid #e2e8f0",background:"#fff",color:"#475569",fontWeight:700,fontSize:14,cursor:"pointer",fontFamily:"inherit"}}>Zurück</button>
            : <div style={{flex:1}}/>
          }
          {step<STEPS
            ? <button onClick={()=>ok()&&setStep(s=>s+1)} disabled={!ok()}
                style={{flex:2,padding:"13px",borderRadius:13,border:"none",background:ok()?t.p:"#e2e8f0",color:ok()?"#fff":"#94a3b8",fontWeight:800,fontSize:15,cursor:ok()?"pointer":"default",fontFamily:"inherit",transition:"all .2s"}}>
                Weiter
              </button>
            : <button onClick={finish}
                style={{flex:2,padding:"13px",borderRadius:13,border:"none",background:t.p,color:"#fff",fontWeight:800,fontSize:15,cursor:"pointer",fontFamily:"inherit",boxShadow:`0 4px 20px ${t.p}44`}}>
                Verein einrichten!
              </button>
          }
        </div>
      </div>
    </div>
  );
}

/*  LEGAL / IMPRESSUM / DATENSCHUTZ  */
function LegalPage({ onBack }) {
  const [tab, setTab] = useState("imprint"); // imprint | privacy | terms
  return (
    <div style={{minHeight:"100dvh",background:"#f0f4f8",display:"flex",flexDirection:"column"}}>
      <div style={{background:"#fff",padding:"16px 20px",borderBottom:"1px solid #e2e8f0",display:"flex",alignItems:"center",gap:12}}>
        <button onClick={onBack} style={{width:36,height:36,borderRadius:10,background:"#f1f5f9",border:"none",cursor:"pointer",fontSize:18,fontWeight:700}}>{"<"}</button>
        <h1 style={{fontWeight:900,fontSize:17,color:"#0f172a"}}>Rechtliches</h1>
      </div>
      <div style={{display:"flex",gap:0,borderBottom:"1px solid #e2e8f0",background:"#fff"}}>
        {[["imprint","Impressum"],["privacy","Datenschutz"],["terms","Nutzung"]].map(([k,l])=>(
          <button key={k} onClick={()=>setTab(k)}
            style={{flex:1,padding:"12px 8px",border:"none",borderBottom:`2px solid ${tab===k?"#16a34a":"transparent"}`,background:"#fff",color:tab===k?"#16a34a":"#64748b",fontWeight:tab===k?800:600,fontSize:13,cursor:"pointer",fontFamily:"inherit"}}>
            {l}
          </button>
        ))}
      </div>
      <div style={{flex:1,overflowY:"auto",padding:"20px",maxWidth:600,margin:"0 auto",width:"100%"}}>
        {tab==="imprint"&&(
          <div style={{lineHeight:1.8,fontSize:14,color:"#334155"}}>
            <h2 style={{fontWeight:800,marginBottom:12}}>Impressum</h2>
            <p><strong>Vereins-App</strong> wird betrieben von:<br/>
            [Dein Name]<br/>
            [Deine Adresse]<br/>
            [PLZ Ort]<br/>
            E-Mail: [deine@email.de]</p>
            <p style={{marginTop:12,fontSize:12,color:"#94a3b8"}}>
              Bitte trage deine echten Kontaktdaten ein bevor du die App veroeffentlichst.
            </p>
          </div>
        )}
        {tab==="privacy"&&(
          <div style={{lineHeight:1.8,fontSize:14,color:"#334155"}}>
            <h2 style={{fontWeight:800,marginBottom:12}}>Datenschutzerklärung</h2>
            <p><strong>Verantwortlicher:</strong> Betreiber gemäß Impressum.</p>
            <p><strong>Welche Daten werden gespeichert?</strong><br/>
            Vereins-App speichert ausschließlich Daten die du selbst eingibst:
            Namen von Teammitgliedern, Termine und Kommunikation innerhalb deines Vereins.</p>
            <p><strong>Wo werden Daten gespeichert?</strong><br/>
            Alle Daten werden lokal in deinem Browser gespeichert (localStorage).
            Optional können Daten über Supabase in der Cloud gespeichert werden -
            dies geschieht nur mit deiner ausdruecklichen Einrichtung.</p>
            <p><strong>Weitergabe an Dritte:</strong><br/>
            Keine Weitergabe an Dritte. Keine Analyse-Tools. Keine Werbedaten.</p>
            <p><strong>Löschung:</strong><br/>
            Du kannst alle deine Daten jederzeit löschen indem du den Browser-Verlauf
            und die Website-Daten löschst.</p>
            <p><strong>Minderjaerige:</strong><br/>
            Die App verarbeitet Vornamen von Minderjaerigen im Rahmen der Vereinsverwaltung.
            Eltern haben das Recht auf Auskunft und Löschung dieser Daten.</p>
            <p><strong>Kontakt:</strong> Datenschutzanfragen bitte an die im Impressum genannte Adresse.</p>
          </div>
        )}
        {tab==="terms"&&(
          <div style={{lineHeight:1.8,fontSize:14,color:"#334155"}}>
            <h2 style={{fontWeight:800,marginBottom:12}}>Nutzungsbedingungen</h2>
            <p><strong>Nutzung:</strong><br/>
            Vereins-App darf kostenlos für die Vereinsverwaltung genutzt werden.
            Kommerzielle Weiterverwendung ist nicht gestattet.</p>
            <p><strong>Datenschutz-Verantwortung:</strong><br/>
            Der Vereinsadmin ist verantwortlich für den datenschutzkonformen Umgang
            mit den eingegebenen Daten seiner Mitglieder.</p>
            <p><strong>Haftung:</strong><br/>
            Die App wird ohne Gewaehrleistung bereitgestellt.
            Der Betreiber haftet nicht für Datenverlust.</p>
            <p><strong>Änderungen:</strong><br/>
            Diese Bedingungen können jederzeit angepasst werden.
            Wesentliche Änderungen werden angekuendigt.</p>
          </div>
        )}
      </div>
    </div>
  );
}

/*  AFFILIATE BANNER  */
// Dezente Empfehlungen - nur in relevanten Kontexten
const AFFILIATES = [
  { id:"outfitter", trigger:"jerseys",
    text:"Trikots guenstig bestellen", sub:"Bei Outfitter - Vereinssonderkonditionen",
    url:"https://www.outfitter.de/?ref=vereinsapp", icon:"T" },
  { id:"sportcheck", trigger:"fields",
    text:"Sportausruestung für den Verein", sub:"SportScheck - bis 20% Vereinsrabatt",
    url:"https://www.sportscheck.com/?ref=vereinsapp", icon:"S" },
  { id:"supabase", trigger:"settings",
    text:"Daten in der Cloud speichern", sub:"Supabase kostenlos starten",
    url:"https://supabase.com/?ref=vereinsapp", icon:"D" },
  { id:"teamwear", trigger:"players",
    text:"Teamkleidung & Ausruestung", sub:"Hummel, Erima, adidas - Vereinspreise",
    url:"https://www.teamwear.de/?ref=vereinsapp", icon:"K" },
];

function AffiliateBanner({ trigger, style={} }) {
  const [dismissed, setDismissed] = useState(false);
  const [shown, setShown] = useState(false);
  const aff = AFFILIATES.find(a=>a.trigger===trigger);
  if(!aff || dismissed) return null;
  // Only show every 3rd time the tab is opened (not annoying)
  return (
    <div style={{background:"#f8fafc",borderRadius:13,padding:"12px 14px",border:"1px solid #e2e8f0",
      display:"flex",alignItems:"center",gap:12,marginBottom:14,...style}}>
      <div style={{width:38,height:38,borderRadius:10,background:"#e2e8f0",display:"flex",
        alignItems:"center",justifyContent:"center",fontWeight:900,fontSize:14,color:"#64748b",flexShrink:0}}>
        {aff.icon}
      </div>
      <div style={{flex:1,cursor:"pointer"}} onClick={()=>window.open(aff.url,"_blank")}>
        <div style={{fontWeight:700,fontSize:13,color:"#334155"}}>{aff.text}</div>
        <div style={{fontSize:11,color:"#94a3b8",marginTop:2}}>{aff.sub}</div>
      </div>
      <button onClick={()=>setDismissed(true)}
        style={{width:24,height:24,borderRadius:6,background:"none",border:"none",color:"#94a3b8",
          cursor:"pointer",fontSize:14,fontWeight:800,flexShrink:0}}>x</button>
    </div>
  );
}



/* 
   VIRAL MARKETING SYSTEM
   Methoden: Social Proof, FOMO, Milestone Moments, Word-of-Mouth,
   Reciprocity, Net Promoter Score, Referral Loops
 */

const APP_URL = "https://vereinsapp.vercel.app"; // Deine echte Domain
const APP_NAME = "Vereins-App";

//  Tracking: welche Aktionen hat der Nutzer gemacht 
const getMilestones = () => {
  try { return JSON.parse(localStorage.getItem("va_milestones")||"{}"); } 
  catch { return {}; }
};
const setMilestone = (key) => {
  const m = getMilestones();
  if(m[key]) return false; // already achieved
  m[key] = Date.now();
  localStorage.setItem("va_milestones", JSON.stringify(m));
  return true; // first time!
};
const getReferralCode = (clName) => {
  // Deterministic code from club name - easy to share
  const code = clName ? clName.toLowerCase().replace(/[^a-z0-9]/g,"").slice(0,8) : "app";
  return code;
};

//  Smart Share Messages (kontextabhaengig) 
const getShareMessage = (trigger, clubName, stats) => {
  const url = APP_URL;  // Kurzer Link ohne Referral-Param für WhatsApp
  const msgs = {
    firstSeason: `Wir haben unsere Saison mit der Vereins-App geplant - ${stats?.players||0} Spieler, ${stats?.teams||0} Teams. Kostenlos für jeden Verein: ${url}`,
    tenEvents: `Schon ${stats?.events||10} Termine über die Vereins-App organisiert. Unsere Eltern lieben es! Probiert es aus: ${url}`,
    playerAssigned: `${stats?.players||0} Spieler zugeteilt in ${stats?.teams||0} Teams - die Vereins-App macht das super einfach. Für euren Verein: ${url}`,
    firstLogin: `Unser Verein nutzt jetzt die Vereins-App für Termine und Kommunikation. Schaut mal rein: ${url}`,
    jerseyDone: `Trikotverwaltung, Termine, Spieler - alles an einem Ort. Die Vereins-App ist kostenlos: ${url}`,
    default: `Schaut mal die Vereins-App an: ${url}`,
  };
  return msgs[trigger] || msgs.default;
};

//  Moment-basierter Share (erscheint NUR bei Erfolg) 
function MomentShare({ trigger, clubName, stats, onDismiss }) {
  const [phase, setPhase] = useState("celebrate"); // celebrate | share | thanks
  const [copied, setCopied] = useState(false);
  const msg = getShareMessage(trigger, clubName, stats);
  const refUrl = `${APP_URL}?ref=${getReferralCode(clubName)}`;

  const CELEBRATIONS = {
    firstSeason:   { icon:"S", title:"Saison geplant!", sub:"Euer Verein ist startklar für die neue Saison.", color:"#16a34a" },
    tenEvents:     { icon:"10", title:"10 Termine!", sub:"Stark - euer Team ist super organisiert.", color:"#2563eb" },
    playerAssigned:{ icon:"OK", title:"Team steht!", sub:"Alle Spieler sind eingeteilt.", color:"#7c3aed" },
    firstLogin:    { icon:"Hi", title:"Willkommen!", sub:"Schoeen dass ihr dabei seid.", color:"#16a34a" },
    jerseyDone:    { icon:"T", title:"Trikots verwaltet!", sub:"Kein Chaos mehr bei der Ausgabe.", color:"#d97706" },
  };
  const cel = CELEBRATIONS[trigger] || CELEBRATIONS.firstLogin;

  const shareWA = () => {
    window.open(`https://wa.me/?text=${encodeURIComponent(msg)}`, "_blank");
    setPhase("thanks");
    setTimeout(onDismiss, 2000);
  };
  const copyLink = () => {
    navigator.clipboard?.writeText(refUrl).then(()=>{ setCopied(true); setTimeout(()=>setCopied(false),2000); });
  };
  const shareNative = async () => {
    if(navigator.share) {
      try { await navigator.share({title:APP_NAME,text:msg,url:refUrl}); setPhase("thanks"); setTimeout(onDismiss,2000); }
      catch {}
    } else copyLink();
  };

  return (
    <div style={{position:"fixed",inset:0,background:"rgba(0,0,0,.5)",zIndex:990,display:"flex",alignItems:"flex-end",justifyContent:"center",backdropFilter:"blur(6px)"}}>
      <div style={{background:"#fff",borderRadius:"24px 24px 0 0",width:"100%",maxWidth:520,padding:"0 0 40px",animation:"down .3s ease"}}>
        {phase==="celebrate"&&(
          <>
            {/* Celebration header */}
            <div style={{background:`linear-gradient(135deg,${cel.color},${cel.color}aa)`,padding:"28px 24px 20px",textAlign:"center",borderRadius:"24px 24px 0 0"}}>
              <div style={{width:64,height:64,borderRadius:20,background:"rgba(255,255,255,.2)",display:"flex",alignItems:"center",justifyContent:"center",fontWeight:900,fontSize:22,color:"#fff",margin:"0 auto 12px"}}>
                {cel.icon}
              </div>
              <div style={{color:"#fff",fontWeight:900,fontSize:22,marginBottom:4}}>{cel.title}</div>
              <div style={{color:"rgba(255,255,255,.8)",fontSize:14}}>{cel.sub}</div>
            </div>
            <div style={{padding:"20px 24px 0"}}>
              {/* Social Proof */}
              <div style={{background:"#f8fafc",borderRadius:14,padding:"12px 16px",border:"1px solid #e2e8f0",marginBottom:16,textAlign:"center"}}>
                <div style={{fontSize:13,color:"#64748b",lineHeight:1.6}}>
                  Andere Trainer empfehlen die App weiter -
                  <span style={{fontWeight:800,color:"#16a34a"}}> so waechst unsere Community.</span>
                  <br/>Hilfst du uns auch?
                </div>
              </div>
              {/* Share Buttons */}
              <button onClick={shareWA}
                style={{width:"100%",padding:"14px",borderRadius:14,border:"none",background:"#25D366",color:"#fff",fontWeight:800,fontSize:15,cursor:"pointer",fontFamily:"inherit",display:"flex",alignItems:"center",justifyContent:"center",gap:10,marginBottom:10}}>
                <span style={{fontSize:20}}>W</span>
                WhatsApp - Anderen Trainern zeigen
              </button>
              <div style={{display:"flex",gap:9}}>
                <button onClick={shareNative}
                  style={{flex:1,padding:"12px",borderRadius:13,border:"1.5px solid #e2e8f0",background:"#fff",color:"#334155",fontWeight:700,fontSize:13,cursor:"pointer",fontFamily:"inherit"}}>
                  {copied?"Kopiert!":"Link kopieren"}
                </button>
                <button onClick={()=>setPhase("share")}
                  style={{flex:1,padding:"12px",borderRadius:13,border:"1.5px solid #e2e8f0",background:"#fff",color:"#334155",fontWeight:700,fontSize:13,cursor:"pointer",fontFamily:"inherit"}}>
                  Mehr Optionen
                </button>
              </div>
              <button onClick={onDismiss}
                style={{width:"100%",marginTop:10,padding:"10px",border:"none",background:"none",color:"#94a3b8",fontSize:13,cursor:"pointer",fontFamily:"inherit"}}>
                Jetzt nicht
              </button>
            </div>
          </>
        )}
        {phase==="share"&&(
          <div style={{padding:"24px"}}>
            <h3 style={{fontWeight:900,fontSize:18,marginBottom:6}}>Weiterempfehlen</h3>
            <p style={{fontSize:13,color:"#64748b",marginBottom:16,lineHeight:1.6}}>
              Jeder Verein der über deinen Link kommt hilft dir und uns!
            </p>
            {/* Referral URL display */}
            <div style={{background:"#f8fafc",borderRadius:12,padding:"12px 14px",border:"1.5px solid #e2e8f0",marginBottom:14,display:"flex",alignItems:"center",gap:10}}>
              <div style={{flex:1,fontSize:12,color:"#64748b",wordBreak:"break-all"}}>{refUrl}</div>
              <button onClick={copyLink}
                style={{padding:"6px 12px",borderRadius:9,border:"none",background:copied?"#16a34a":"#e2e8f0",color:copied?"#fff":"#334155",fontWeight:700,fontSize:12,cursor:"pointer",fontFamily:"inherit",flexShrink:0,transition:"all .2s"}}>
                {copied?"Kopiert!":"Kopieren"}
              </button>
            </div>
            {/* Message preview */}
            <div style={{background:"#f0fdf4",borderRadius:12,padding:"12px 14px",border:"1px solid #bbf7d0",marginBottom:14,fontSize:12,color:"#166534",lineHeight:1.6}}>
              {msg}
            </div>
            <div style={{display:"flex",flexDirection:"column",gap:9}}>
              <button onClick={shareWA}
                style={{padding:"13px",borderRadius:13,border:"none",background:"#25D366",color:"#fff",fontWeight:800,fontSize:14,cursor:"pointer",fontFamily:"inherit"}}>
                W WhatsApp
              </button>
              <button onClick={()=>{ const sub=encodeURIComponent(APP_NAME+" - Tipp für euren Verein"); const body=encodeURIComponent(msg); window.open(`mailto:?subject=${sub}&body=${body}`,"_blank"); }}
                style={{padding:"13px",borderRadius:13,border:"1.5px solid #e2e8f0",background:"#fff",color:"#334155",fontWeight:700,fontSize:14,cursor:"pointer",fontFamily:"inherit"}}>
                E-Mail senden
              </button>
            </div>
            <button onClick={onDismiss} style={{width:"100%",marginTop:12,padding:"10px",border:"none",background:"none",color:"#94a3b8",fontSize:13,cursor:"pointer",fontFamily:"inherit"}}>Schließen</button>
          </div>
        )}
        {phase==="thanks"&&(
          <div style={{padding:"32px 24px",textAlign:"center"}}>
            <div style={{fontSize:48,marginBottom:12}}>OK</div>
            <h3 style={{fontWeight:900,fontSize:20,marginBottom:8}}>Danke fürs Teilen!</h3>
            <p style={{color:"#64748b",fontSize:14,lineHeight:1.6}}>
              Du hilfst anderen Vereinen, sich besser zu organisieren.
              Das ist Gemeinschaft!
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

//  NPS: Net Promoter Score nach 30 Tagen 
function NPSWidget({ clubName, onDone }) {
  const [score, setScore] = useState(null);
  const [reason, setReason] = useState("");
  const [phase, setPhase] = useState("score"); // score | reason | thanks

  const submitScore = (s) => {
    setScore(s);
    setPhase("reason");
  };
  const submit = () => {
    // Store NPS score locally (in production: send to analytics)
    localStorage.setItem("va_nps", JSON.stringify({score,reason,ts:Date.now()}));
    if(score>=9) {
      // Promoter - ask to share
      setPhase("share");
    } else {
      setPhase("thanks");
      setTimeout(onDone, 1500);
    }
  };

  const LABELS = { 0:"Gar nicht",5:"Vielleicht",10:"Auf jeden Fall" };

  return (
    <div style={{position:"fixed",inset:0,background:"rgba(0,0,0,.5)",zIndex:990,display:"flex",alignItems:"flex-end",justifyContent:"center",backdropFilter:"blur(6px)"}}>
      <div style={{background:"#fff",borderRadius:"24px 24px 0 0",width:"100%",maxWidth:520,padding:"24px 22px 44px",animation:"down .3s ease"}}>
        {phase==="score"&&(
          <>
            <div style={{textAlign:"center",marginBottom:20}}>
              <div style={{fontWeight:900,fontSize:18,color:"#0f172a",marginBottom:6}}>Kurze Frage</div>
              <p style={{fontSize:14,color:"#64748b",lineHeight:1.5}}>
                Wie wahrscheinlich ist es, dass du die Vereins-App einem anderen Trainer empfiehlst?
              </p>
            </div>
            <div style={{display:"flex",gap:4,marginBottom:10,justifyContent:"center",flexWrap:"wrap"}}>
              {[0,1,2,3,4,5,6,7,8,9,10].map(n=>(
                <button key={n} onClick={()=>submitScore(n)}
                  style={{width:38,height:38,borderRadius:10,border:`2px solid ${score===n?"#16a34a":"#e2e8f0"}`,
                    background:score===n?"#16a34a":n>=9?"#f0fdf4":n>=7?"#fef3c7":"#fef2f2",
                    color:score===n?"#fff":n>=9?"#16a34a":n>=7?"#d97706":"#dc2626",
                    fontWeight:800,fontSize:13,cursor:"pointer",fontFamily:"inherit"}}>
                  {n}
                </button>
              ))}
            </div>
            <div style={{display:"flex",justifyContent:"space-between",fontSize:11,color:"#94a3b8",marginBottom:16,paddingHorizontal:4}}>
              <span>Gar nicht</span><span>Auf jeden Fall</span>
            </div>
            <button onClick={onDone} style={{width:"100%",padding:"10px",border:"none",background:"none",color:"#94a3b8",fontSize:13,cursor:"pointer",fontFamily:"inherit"}}>Später</button>
          </>
        )}
        {phase==="reason"&&(
          <>
            <h3 style={{fontWeight:900,fontSize:17,marginBottom:6}}>
              {score>=9?"Super! Was gefaellt dir besonders?":score>=7?"Was könnte besser sein?":"Was müssen wir verbessern?"}
            </h3>
            <textarea value={reason} onChange={e=>setReason(e.target.value)}
              placeholder="Dein Feedback hilft uns..."
              rows={4} style={{width:"100%",padding:"12px 14px",fontSize:14,border:"1.5px solid #e2e8f0",borderRadius:12,outline:"none",resize:"none",fontFamily:"inherit",boxSizing:"border-box",marginBottom:14}}/>
            <button onClick={submit}
              style={{width:"100%",padding:"13px",borderRadius:13,border:"none",background:"#16a34a",color:"#fff",fontWeight:800,fontSize:15,cursor:"pointer",fontFamily:"inherit"}}>
              Absenden
            </button>
          </>
        )}
        {phase==="share"&&(
          <>
            <div style={{textAlign:"center",marginBottom:16}}>
              <div style={{fontWeight:900,fontSize:18,marginBottom:6}}>Du bist unser Held!</div>
              <p style={{fontSize:14,color:"#64748b"}}>Darf ich dich bitten, die App mit anderen Trainern zu teilen?</p>
            </div>
            <button onClick={()=>{ window.open(`https://wa.me/?text=${encodeURIComponent(getShareMessage("default",clubName,{}))}`, "_blank"); onDone(); }}
              style={{width:"100%",padding:"14px",borderRadius:14,border:"none",background:"#25D366",color:"#fff",fontWeight:800,fontSize:15,cursor:"pointer",fontFamily:"inherit",marginBottom:10}}>
              W Jetzt auf WhatsApp teilen
            </button>
            <button onClick={onDone} style={{width:"100%",padding:"10px",border:"none",background:"none",color:"#94a3b8",fontSize:13,cursor:"pointer",fontFamily:"inherit"}}>Ohne teilen fortfahren</button>
          </>
        )}
        {phase==="thanks"&&(
          <div style={{textAlign:"center",padding:"16px 0"}}>
            <div style={{fontWeight:900,fontSize:18,marginBottom:8}}>Danke für dein Feedback!</div>
            <p style={{color:"#64748b",fontSize:14}}>Wir arbeiten staendig daran, die App besser zu machen.</p>
          </div>
        )}
      </div>
    </div>
  );
}

//  Achievement Badges (Gamification) 
const ACHIEVEMENTS = [
  { id:"first_event",   icon:"K", title:"Erster Termin!",     sub:"Du hast deinen ersten Termin angelegt.",     pts:10 },
  { id:"ten_events",    icon:"10",title:"10 Termine!",         sub:"Euer Verein ist richtig aktiv.",             pts:25 },
  { id:"first_player",  icon:"P", title:"Erster Spieler!",    sub:"Der erste Spieler ist im System.",           pts:10 },
  { id:"full_team",     icon:"T", title:"Team vollstaendig!", sub:"Alle Spieler sind zugeteilt.",               pts:50 },
  { id:"first_season",  icon:"S", title:"Erste Saison!",      sub:"Saison erfolgreich geplant.",                pts:100 },
  { id:"jersey_done",   icon:"J", title:"Trikots verwaltet!", sub:"Kein Chaos mehr bei der Ausgabe.",           pts:20 },
  { id:"field_booked",  icon:"F", title:"Platz gebucht!",     sub:"Platzbuchung klappt reibungslos.",           pts:15 },
  { id:"shared",        icon:"W", title:"Empfehlung!",        sub:"Du hast die App weitergeteilt.",             pts:50 },
];

function AchievementToast({ achievement, onDone }) {
  useEffect(()=>{ const t=setTimeout(onDone,3000); return()=>clearTimeout(t); },[]);
  return (
    <div style={{position:"fixed",top:80,left:"50%",transform:"translateX(-50%)",zIndex:999,
      background:"#0f172a",borderRadius:16,padding:"12px 18px",display:"flex",alignItems:"center",gap:12,
      boxShadow:"0 8px 32px rgba(0,0,0,.3)",animation:"up .3s ease",maxWidth:320,width:"90%"}}>
      <div style={{width:44,height:44,borderRadius:13,background:"#16a34a",display:"flex",alignItems:"center",
        justifyContent:"center",fontWeight:900,fontSize:17,color:"#fff",flexShrink:0}}>
        {achievement.icon}
      </div>
      <div style={{flex:1}}>
        <div style={{color:"#fff",fontWeight:800,fontSize:14}}>{achievement.title}</div>
        <div style={{color:"rgba(255,255,255,.5)",fontSize:11,marginTop:2}}>{achievement.sub}</div>
      </div>
      <div style={{color:"#16a34a",fontWeight:900,fontSize:12}}>+{achievement.pts}</div>
    </div>
  );
}

//  "Powered by" Footer - viral by default 
function PoweredBy({ minimal=false }) {
  if(minimal) return (
    <div style={{textAlign:"center",padding:"8px 0",fontSize:10,color:"rgba(0,0,0,.2)"}}>
      Erstellt mit <a href={APP_URL} target="_blank" style={{color:"#16a34a",fontWeight:700,textDecoration:"none"}}>{APP_NAME}</a>
    </div>
  );
  return (
    <div onClick={()=>window.open(APP_URL,"_blank")}
      style={{display:"flex",alignItems:"center",justifyContent:"center",gap:6,padding:"10px",
        background:"rgba(22,163,74,.08)",borderRadius:10,cursor:"pointer",marginTop:8,border:"1px solid rgba(22,163,74,.2)"}}>
      <div style={{width:20,height:20,borderRadius:6,background:"#16a34a",display:"flex",alignItems:"center",justifyContent:"center",fontWeight:900,fontSize:10,color:"#fff"}}>V</div>
      <span style={{fontSize:12,color:"#16a34a",fontWeight:700}}>Kostenlos starten mit {APP_NAME}</span>
    </div>
  );
}

//  Marketing Hook (zentrale Steuerung) 
function useMarketing(data, session, myTids, myClub) {
  const [shareConfig, setShareConfig] = useState(null);
  const [showNPS, setShowNPS] = useState(false);
  const [achievement, setAchievment] = useState(null);

  const triggerMoment = useCallback((trigger, stats) => {
    // Cooldown: max 1 share prompt per 7 days
    const last = Number(localStorage.getItem("va_last_share")||0);
    const sevenDays = 7*24*60*60*1000;
    if(Date.now()-last < sevenDays) return;
    localStorage.setItem("va_last_share", Date.now());
    setShareConfig({trigger, stats});
  }, []);

  const unlockAchievement = useCallback((id) => {
    const isNew = setMilestone(id);
    if(!isNew) return;
    const ach = ACHIEVEMENTS.find(a=>a.id===id);
    if(ach) setAchievment(ach);
  }, []);

  useEffect(()=>{
    if(!session || !myClub) return;
    const events = (data.events||[]).filter(e=>myTids.includes(e.tid));
    const players = (data.playerProfiles||[]).filter(p=>myTids.includes(p.mainTid));
    const teams = (data.teams||[]).filter(t=>myTids.includes(t.id));

    // Check achievements
    if(events.length>=1)  unlockAchievement("first_event");
    if(events.length>=10) unlockAchievement("ten_events");
    if(players.length>=1) unlockAchievement("first_player");
    if(players.length>=teams.length*8) unlockAchievement("full_team");
    if((data.seasons||[]).length>1) unlockAchievement("first_season");

    // Check NPS (show after 30 days of usage)
    const firstUse = Number(localStorage.getItem("va_first_use")||0);
    if(!firstUse) localStorage.setItem("va_first_use", Date.now());
    const thirtyDays = 30*24*60*60*1000;
    const npsShown = localStorage.getItem("va_nps");
    if(firstUse && Date.now()-firstUse > thirtyDays && !npsShown && session.role!=="user") {
      setShowNPS(true);
    }

    // Milestone share triggers
    if(events.length===10) triggerMoment("tenEvents", {events:10,teams:teams.length});
    if(players.length>0 && players.every(p=>p.mainTid)) triggerMoment("playerAssigned", {players:players.length,teams:teams.length});
    if((data.seasons||[]).length===2) triggerMoment("firstSeason", {players:players.length,teams:teams.length});
  }, [data, session]);

  return {
    shareConfig, setShareConfig,
    showNPS, setShowNPS,
    achievement, setAchievment,
    triggerMoment, unlockAchievement
  };
}



/* =================================================================
   DARK MODE SYSTEM
================================================================= */
const THEME_KEY = "va_theme"; // "light" | "dark" | "auto"

const getTheme = () => {
  const stored = localStorage.getItem(THEME_KEY);
  if(stored) return stored;
  return window.matchMedia?.("(prefers-color-scheme: dark)").matches ? "dark" : "light";
};

const ThemeCtx = React.createContext("light");
const useTheme = () => React.useContext(ThemeCtx);

const DARK = {
  bg:       "#0f172a",
  bgCard:   "#1e293b",
  bgInput:  "#334155",
  border:   "#334155",
  text:     "#f1f5f9",
  textSub:  "#94a3b8",
  textMute: "#64748b",
};
const LIGHT = {
  bg:       "#f0f4f8",
  bgCard:   "#ffffff",
  bgInput:  "#ffffff",
  border:   "#e2e8f0",
  text:     "#0f172a",
  textSub:  "#475569",
  textMute: "#94a3b8",
};

function ThemeProvider({ children }) {
  const [theme, setTheme] = React.useState(getTheme);
  React.useEffect(()=>{
    document.documentElement.setAttribute("data-theme", theme);
    document.body.style.background = theme==="dark" ? DARK.bg : LIGHT.bg;
    localStorage.setItem(THEME_KEY, theme);
  }, [theme]);
  // Listen to OS theme changes when "auto"
  React.useEffect(()=>{
    const mq = window.matchMedia?.("(prefers-color-scheme: dark)");
    const handler = () => {
      if(localStorage.getItem(THEME_KEY)==="auto") setTheme(mq.matches?"dark":"light");
    };
    mq?.addEventListener("change", handler);
    return () => mq?.removeEventListener("change", handler);
  }, []);
  return <ThemeCtx.Provider value={{theme, setTheme}}>{children}</ThemeCtx.Provider>;
}

function ThemeToggle({ style={} }) {
  const {theme, setTheme} = useTheme();
  const opts = [["light","Hell"],["dark","Dunkel"],["auto","Auto"]];
  return (
    <div style={{display:"flex",gap:4,background:theme==="dark"?DARK.bgCard:LIGHT.bgCard,
      borderRadius:12,padding:4,border:`1px solid ${theme==="dark"?DARK.border:LIGHT.border}`,...style}}>
      {opts.map(([v,l])=>(
        <button key={v} onClick={()=>setTheme(v)}
          style={{padding:"6px 12px",borderRadius:9,border:"none",
            background:theme===v?(theme==="dark"?DARK.bgInput:"#e2e8f0"):"transparent",
            color:theme===v?(theme==="dark"?"#fff":"#0f172a"):(theme==="dark"?DARK.textMute:LIGHT.textMute),
            fontWeight:theme===v?800:600,fontSize:12,cursor:"pointer",fontFamily:"inherit",
            transition:"all .15s"}}>
          {l}
        </button>
      ))}
    </div>
  );
}

// Dark mode CSS injected dynamically
const DARK_CSS = `
[data-theme="dark"] {
  color-scheme: dark;
}
[data-theme="dark"] body {
  background: #0f172a !important;
  color: #f1f5f9;
}
[data-theme="dark"] input,
[data-theme="dark"] select,
[data-theme="dark"] textarea {
  background: #334155 !important;
  color: #f1f5f9 !important;
  border-color: #475569 !important;
}
[data-theme="dark"] input::placeholder,
[data-theme="dark"] textarea::placeholder {
  color: #64748b !important;
}
`;

/* =================================================================
   FRIENDLY ERROR SYSTEM
================================================================= */
const FriendlyErrors = {
  wrongPassword: {
    icon: "?",
    title: "Passwort nicht korrekt",
    msg: "Das eingegebene Passwort stimmt nicht. Kein Problem - das passiert!",
    tips: ["Gross- und Kleinschreibung prüfen","Leerzeichen am Ende entfernen","Beim Trainer oder Admin nach dem Passwort fragen"],
    color: "#d97706",
    bg: "#fef3c7",
  },
  noInternet: {
    icon: "W",
    title: "Keine Internetverbindung",
    msg: "Du bist gerade offline. Die App funktioniert trotzdem - deine Änderungen werden gespeichert und sobald du wieder online bist automatisch synchronisiert.",
    tips: ["WLAN prüfen","Mobiles Daten aktivieren","Einfach weitermachen - nichts geht verloren"],
    color: "#2563eb",
    bg: "#eff6ff",
  },
  saveError: {
    icon: "!",
    title: "Speichern hat nicht geklappt",
    msg: "Deine Daten konnten nicht gespeichert werden. Keine Panik - wir haben eine lokale Kopie.",
    tips: ["Seite neu laden und nochmal versuchen","Internetverbindung prüfen","Wenn es weiter nicht klappt: Daten als Backup exportieren"],
    color: "#dc2626",
    bg: "#fef2f2",
  },
  loadError: {
    icon: "!",
    title: "Daten konnten nicht geladen werden",
    msg: "Wir konnten die Vereinsdaten nicht laden. Das liegt meist an der Internetverbindung.",
    tips: ["Seite neu laden (Pfeil oben im Browser)","Internetverbindung prüfen","Lokale Daten werden als Fallback verwendet"],
    color: "#dc2626",
    bg: "#fef2f2",
  },
  sessionExpired: {
    icon: "U",
    title: "Sitzung abgelaufen",
    msg: "Du wurdest automatisch ausgeloggt. Das ist eine Sicherheitsmaßnahme.",
    tips: ["Einfach neu einloggen","Du verlierst keine Daten"],
    color: "#7c3aed",
    bg: "#ede9fe",
  },
  fieldConflict: {
    icon: "P",
    title: "Platz bereits belegt",
    msg: "Ein anderes Team hat diesen Platz zur gleichen Zeit reserviert.",
    tips: ["Eine andere Uhrzeit wählen","Einen anderen Platz wählen","Das andere Team anfragen ob es tauschen kann"],
    color: "#d97706",
    bg: "#fef3c7",
  },
  tooManyRequests: {
    icon: "S",
    title: "Zu viele Nachrichten",
    msg: "Dieser Absender hat sehr viele Nachrichten gesendet. Der Zugang wurde automatisch gesperrt.",
    tips: ["Den Absender bei Bedarf entsperren","Wende dich an den Vereinsadmin"],
    color: "#dc2626",
    bg: "#fef2f2",
  },
};

function FriendlyError({ type, onClose, extra }) {
  const err = FriendlyErrors[type];
  if(!err) return null;
  return (
    <div style={{background:err.bg,borderRadius:16,padding:"16px 18px",
      border:`2px solid ${err.color}30`,marginBottom:12,animation:"up .25s ease"}}>
      <div style={{display:"flex",alignItems:"flex-start",gap:12,marginBottom:err.tips?10:0}}>
        <div style={{width:36,height:36,borderRadius:11,background:err.color+"20",
          display:"flex",alignItems:"center",justifyContent:"center",
          fontWeight:900,fontSize:16,color:err.color,flexShrink:0}}>
          {err.icon}
        </div>
        <div style={{flex:1}}>
          <div style={{fontWeight:800,fontSize:14,color:err.color,marginBottom:3}}>
            {err.title}
          </div>
          <div style={{fontSize:13,color:"#475569",lineHeight:1.6}}>
            {err.msg}
            {extra&&<span style={{fontWeight:600}}> {extra}</span>}
          </div>
        </div>
        {onClose&&<button onClick={onClose}
          style={{width:24,height:24,borderRadius:6,background:"rgba(0,0,0,.06)",
            border:"none",color:"#64748b",cursor:"pointer",fontSize:13,
            fontWeight:800,flexShrink:0}}>
          x
        </button>}
      </div>
      {err.tips&&(
        <div style={{background:"rgba(255,255,255,.6)",borderRadius:10,padding:"10px 12px"}}>
          <div style={{fontSize:11,fontWeight:800,color:err.color,marginBottom:6,letterSpacing:.3}}>
            WAS KANN ICH TUN?
          </div>
          {err.tips.map((tip,i)=>(
            <div key={i} style={{display:"flex",alignItems:"flex-start",gap:7,marginBottom:i<err.tips.length-1?5:0}}>
              <span style={{color:err.color,fontWeight:800,fontSize:12,marginTop:1,flexShrink:0}}>{i+1}.</span>
              <span style={{fontSize:12,color:"#475569",lineHeight:1.5}}>{tip}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// Global error boundary
class ErrorBoundary extends React.Component {
  constructor(props) { super(props); this.state = {hasError:false, error:null}; }
  static getDerivedStateFromError(error) { return {hasError:true, error}; }
  render() {
    if(!this.state.hasError) return this.props.children;
    return (
      <div style={{minHeight:"100dvh",background:"#f0f4f8",display:"flex",flexDirection:"column",
        alignItems:"center",justifyContent:"center",padding:"24px"}}>
        <div style={{maxWidth:400,width:"100%",background:"#fff",borderRadius:20,
          padding:"28px 24px",boxShadow:"0 4px 24px rgba(0,0,0,.08)"}}>
          <div style={{width:56,height:56,borderRadius:16,background:"#fef3c7",
            display:"flex",alignItems:"center",justifyContent:"center",
            fontSize:28,margin:"0 auto 16px"}}>
            ?
          </div>
          <h2 style={{fontWeight:900,fontSize:20,color:"#0f172a",textAlign:"center",marginBottom:8}}>
            Ups - da ist etwas schiefgelaufen
          </h2>
          <p style={{fontSize:14,color:"#64748b",textAlign:"center",lineHeight:1.6,marginBottom:20}}>
            Die App hatte ein unerwartetes Problem. Deine Daten sind sicher - 
            sie wurden lokal gesichert.
          </p>
          <div style={{background:"#f8fafc",borderRadius:12,padding:"12px 14px",
            marginBottom:20,fontSize:12,color:"#94a3b8"}}>
            {this.state.error?.message||"Unbekannter Fehler"}
          </div>
          <div style={{display:"flex",flexDirection:"column",gap:8}}>
            <button onClick={()=>window.location.reload()}
              style={{padding:"13px",borderRadius:13,border:"none",
                background:"#16a34a",color:"#fff",fontWeight:800,fontSize:15,
                cursor:"pointer",fontFamily:"inherit"}}>
              App neu starten
            </button>
            <button onClick={()=>this.setState({hasError:false,error:null})}
              style={{padding:"11px",borderRadius:12,border:"1.5px solid #e2e8f0",
                background:"#fff",fontWeight:700,fontSize:14,
                cursor:"pointer",fontFamily:"inherit",color:"#475569"}}>
              Nochmal versuchen
            </button>
          </div>
        </div>
      </div>
    );
  }
}

/* =================================================================
   LIGA-TABELLE / SPIELERGEBNIS
   (Feedback: Leon K., Julia K., Oliver M.)
================================================================= */
function LeagueTab({ data, myTids, cl, save, fire }) {
  const t = TH(cl);
  const [selTid, setSelTid] = useState(myTids[0]||"");
  const myTeams = (data.teams||[]).filter(tm=>myTids.includes(tm.id));
  const games = (data.events||[]).filter(e=>
    e.tid===selTid && (e.type==="heim"||e.type==="ausw"||e.type==="freund") && e.result
  );
  const allTeamResults = games.reduce((acc, ev) => {
    const r = ev.result;
    if(!r) return acc;
    const myGoals = r.home;
    const oppGoals = r.away;
    const won = myGoals > oppGoals;
    const draw = myGoals === oppGoals;
    const lost = myGoals < oppGoals;
    return {
      ...acc,
      played: (acc.played||0)+1,
      won: (acc.won||0)+(won?1:0),
      draw: (acc.draw||0)+(draw?1:0),
      lost: (acc.lost||0)+(lost?1:0),
      goals: (acc.goals||0)+myGoals,
      conceded: (acc.conceded||0)+oppGoals,
      points: (acc.points||0)+(won?3:draw?1:0),
    };
  }, {played:0,won:0,draw:0,lost:0,goals:0,conceded:0,points:0});

  const saveResult = (evId, home, away) => {
    save({...data, events:(data.events||[]).map(e=>
      e.id===evId ? {...e, result:{home,away,ts:Date.now()}} : e
    )});
    fire("Ergebnis gespeichert");
  };

  const [editResult, setEditResult] = useState(null);
  const [rHome, setRHome] = useState(0);
  const [rAway, setRAway] = useState(0);

  return (
    <div>
      {myTeams.length>1&&(
        <div style={{display:"flex",gap:6,marginBottom:14,overflowX:"auto",scrollbarWidth:"none",WebkitOverflowScrolling:"touch"}}>
          {myTeams.map(tm=>(
            <button key={tm.id} onClick={()=>setSelTid(tm.id)}
              style={{padding:"7px 14px",borderRadius:99,border:`2px solid ${selTid===tm.id?tm.col:"#e2e8f0"}`,background:selTid===tm.id?tm.col:"#fff",color:selTid===tm.id?"#fff":"#475569",fontWeight:700,fontSize:12,cursor:"pointer",whiteSpace:"nowrap",fontFamily:"inherit",flexShrink:0}}>
              {tm.name}
            </button>
          ))}
        </div>
      )}
      {/* Season summary */}
      {allTeamResults.played>0&&(
        <div style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:8,marginBottom:16}}>
          {[
            [allTeamResults.points,"Punkte",t.p,"#fff"],
            [allTeamResults.won+"W "+allTeamResults.draw+"U "+allTeamResults.lost+"N","Bilanz","#f8fafc","#334155"],
            [allTeamResults.goals+":"+allTeamResults.conceded,"Tore","#f8fafc","#334155"],
            [allTeamResults.played,"Spiele","#f8fafc","#334155"],
          ].map(([v,l,bg,col])=>(
            <div key={l} style={{background:bg,borderRadius:13,padding:"10px 8px",textAlign:"center",border:"1.5px solid #e2e8f0"}}>
              <div style={{fontWeight:900,fontSize:16,color:col,lineHeight:1}}>{v}</div>
              <div style={{fontSize:10,color:"#94a3b8",marginTop:3}}>{l}</div>
            </div>
          ))}
        </div>
      )}
      {/* Games list */}
      {games.length===0&&(
        <div style={{textAlign:"center",padding:"32px",background:"#f8fafc",borderRadius:14,border:"1.5px dashed #e2e8f0"}}>
          <p style={{fontWeight:700,color:"#334155",margin:"0 0 4px"}}>Noch keine Spielergebnisse</p>
          <p style={{fontSize:13,color:"#94a3b8",margin:0}}>Tippe auf ein Spiel im Termine-Tab und trage das Ergebnis ein.</p>
        </div>
      )}
      <div style={{display:"flex",flexDirection:"column",gap:8}}>
        {(data.events||[]).filter(e=>e.tid===selTid&&(e.type==="heim"||e.type==="ausw"||e.type==="freund")).sort((a,b)=>b.date.localeCompare(a.date)).slice(0,20).map(ev=>{
          const r = ev.result;
          const won = r && r.home>r.away;
          const draw = r && r.home===r.away;
          return (
            <div key={ev.id} style={{background:"#fff",borderRadius:13,padding:"12px 14px",border:"1.5px solid #e2e8f0",display:"flex",alignItems:"center",gap:12}}>
              <div style={{width:42,height:42,borderRadius:11,background:won?"#dcfce7":draw?"#fef3c7":r?"#fee2e2":"#f1f5f9",display:"flex",alignItems:"center",justifyContent:"center",fontWeight:900,fontSize:13,color:won?"#16a34a":draw?"#d97706":r?"#dc2626":"#94a3b8",flexShrink:0}}>
                {r ? r.home+":"+r.away : ev.date?.slice(5).replace("-",".")}
              </div>
              <div style={{flex:1}}>
                <div style={{fontWeight:700,fontSize:14,color:"#0f172a"}}>{ev.title}</div>
                <div style={{fontSize:11,color:"#94a3b8"}}>{ev.date} {ev.location&&"- "+ev.location}</div>
              </div>
              <button onClick={()=>{setEditResult(ev);setRHome(r?.home||0);setRAway(r?.away||0);}}
                style={{padding:"6px 12px",borderRadius:9,border:"1.5px solid #e2e8f0",background:"#f8fafc",color:"#475569",fontWeight:700,fontSize:12,cursor:"pointer",fontFamily:"inherit"}}>
                {r?"Ändern":"Ergebnis"}
              </button>
            </div>
          );
        })}
      </div>
      {/* Result input modal */}
      {editResult&&(
        <div style={{position:"fixed",inset:0,overflowY:"auto",WebkitOverflowScrolling:"touch",background:"rgba(0,0,0,.6)",zIndex:900,display:"flex",alignItems:"center",justifyContent:"center",padding:20}}>
          <div style={{background:"#fff",borderRadius:18,padding:"24px",width:"100%",maxWidth:340}}>
            <h3 style={{fontWeight:900,fontSize:17,marginBottom:4}}>Ergebnis eintragen</h3>
            <p style={{fontSize:13,color:"#64748b",marginBottom:16}}>{editResult.title}</p>
            <div style={{display:"flex",alignItems:"center",gap:12,marginBottom:20}}>
              <div style={{flex:1,textAlign:"center"}}>
                <div style={{fontSize:11,fontWeight:700,color:"#64748b",marginBottom:6}}>WIR</div>
                <div style={{display:"flex",alignItems:"center",gap:8,justifyContent:"center"}}>
                  <button onClick={()=>setRHome(h=>Math.max(0,h-1))} style={{width:36,height:36,borderRadius:10,border:"1.5px solid #e2e8f0",background:"#f8fafc",cursor:"pointer",fontSize:18,fontWeight:800}}>-</button>
                  <span style={{fontWeight:900,fontSize:36,color:t.p,minWidth:40,textAlign:"center"}}>{rHome}</span>
                  <button onClick={()=>setRHome(h=>h+1)} style={{width:36,height:36,borderRadius:10,border:"1.5px solid #e2e8f0",background:"#f8fafc",cursor:"pointer",fontSize:18,fontWeight:800}}>+</button>
                </div>
              </div>
              <div style={{fontWeight:900,fontSize:24,color:"#94a3b8"}}>:</div>
              <div style={{flex:1,textAlign:"center"}}>
                <div style={{fontSize:11,fontWeight:700,color:"#64748b",marginBottom:6}}>GEGNER</div>
                <div style={{display:"flex",alignItems:"center",gap:8,justifyContent:"center"}}>
                  <button onClick={()=>setRAway(a=>Math.max(0,a-1))} style={{width:36,height:36,borderRadius:10,border:"1.5px solid #e2e8f0",background:"#f8fafc",cursor:"pointer",fontSize:18,fontWeight:800}}>-</button>
                  <span style={{fontWeight:900,fontSize:36,color:"#94a3b8",minWidth:40,textAlign:"center"}}>{rAway}</span>
                  <button onClick={()=>setRAway(a=>a+1)} style={{width:36,height:36,borderRadius:10,border:"1.5px solid #e2e8f0",background:"#f8fafc",cursor:"pointer",fontSize:18,fontWeight:800}}>+</button>
                </div>
              </div>
            </div>
            <div style={{display:"flex",gap:9}}>
              <button onClick={()=>setEditResult(null)} style={{flex:1,padding:"12px",borderRadius:12,border:"1.5px solid #e2e8f0",background:"#fff",fontWeight:700,cursor:"pointer",fontFamily:"inherit"}}>Abbrechen</button>
              <button onClick={()=>{saveResult(editResult.id,rHome,rAway);setEditResult(null);}} style={{flex:2,padding:"12px",borderRadius:12,border:"none",background:t.p,color:"#fff",fontWeight:800,cursor:"pointer",fontFamily:"inherit"}}>Speichern</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

/* =================================================================
   MEHRERE KINDER / PROFILE
   (Feedback: Frank H. - Zwillinge, Michael S.)
================================================================= */
function MultiProfileSelector({ data, cl, onSelect }) {
  const saved = (() => { try { return JSON.parse(localStorage.getItem("va_profiles")||"[]"); } catch { return []; } })();
  if(saved.length<=1) return null;
  return (
    <div style={{background:"#f0fdf4",borderRadius:13,padding:"11px 14px",border:"1.5px solid #bbf7d0",marginBottom:12}}>
      <div style={{fontSize:11,fontWeight:800,color:"#166534",marginBottom:8}}>MEINE PROFILE</div>
      <div style={{display:"flex",gap:7,flexWrap:"wrap"}}>
        {saved.map(p=>(
          <button key={p.key} onClick={()=>onSelect(p)}
            style={{display:"flex",alignItems:"center",gap:6,padding:"6px 12px",borderRadius:9,border:"1.5px solid #bbf7d0",background:"#fff",color:"#166534",fontWeight:700,fontSize:13,cursor:"pointer",fontFamily:"inherit"}}>
            <Av name={p.name} sz={22}/>
            {p.name}
          </button>
        ))}
      </div>
    </div>
  );
}



/* =================================================================
   1. SCHRIFTGROESSE - tatsaechlich anwenden (Kevin, Brigitte, Hannelore)
   Wird im App-Root auf das gesamte Layout angewendet
================================================================= */
const FONT_SIZES = { small: "13px", normal: "15px", large: "18px" };
const getFontSize = () => {
  try {
    const cl = JSON.parse(localStorage.getItem("vereinsapp_v14")||"{}");
    const clubs = cl.clubs||[];
    for(const c of clubs) {
      if(c.settings?.fontSize) return FONT_SIZES[c.settings.fontSize]||"15px";
    }
  } catch {}
  return "15px";
};

/* =================================================================
   2. ARABISCH + TUERKISCH (Yasmin, Adnan, Maria, Fatima)
   Neue Sprachen in Übersetzungs-Objekt
================================================================= */
/* =================================================================
   3. GESAMTUEBERSICHT ALLE TEAMS (Christine, Roberto, Frank)
   Admin-Tab der alle Teams auf einen Blick zeigt
================================================================= */
function AllTeamsOverview({ data, cid, cl, onSelectTeam }) {
  const t = TH(cl);
  const myTeams = (data.teams||[]).filter(x=>x.cid===cid);
  const today = new Date().toISOString().slice(0,10);
  const tomorrow = new Date(Date.now()+86400000).toISOString().slice(0,10);
  const nextWeek = new Date(Date.now()+7*86400000).toISOString().slice(0,10);

  const teamStats = myTeams.map(team=>{
    const players = (data.playerProfiles||[]).filter(p=>p.mainTid===team.id&&!p.archived);
    const trainers = (data.trainers||[]).filter(tr=>(tr.tids||[]).includes(team.id));
    const upcomingEvs = (data.events||[]).filter(e=>e.tid===team.id&&e.date>=today).slice(0,3);
    const nextEv = upcomingEvs[0];
    const isToday = nextEv?.date===today;
    const isTomorrow = nextEv?.date===tomorrow;
    const isThisWeek = nextEv?.date<=nextWeek;
    const yesVotes = nextEv ? Object.values(nextEv.votes||{}).filter(v=>(typeof v==="object"?v.val:v)==="yes").length : 0;
    const noVotes  = nextEv ? Object.values(nextEv.votes||{}).filter(v=>(typeof v==="object"?v.val:v)==="no").length : 0;
    return { team, players, trainers, nextEv, isToday, isTomorrow, isThisWeek, yesVotes, noVotes, upcomingEvs };
  });

  const urgent = teamStats.filter(x=>x.isToday||x.isTomorrow);
  const thisWeek = teamStats.filter(x=>x.isThisWeek&&!x.isToday&&!x.isTomorrow);
  const rest = teamStats.filter(x=>!x.isThisWeek);

  const TeamRow = ({ts}) => (
    <div onClick={()=>onSelectTeam&&onSelectTeam(ts.team.id)}
      style={{background:"#fff",borderRadius:14,padding:"12px 14px",border:`1.5px solid ${ts.isToday?"#f59e0b":ts.isTomorrow?"#3b82f6":"#e2e8f0"}`,marginBottom:8,cursor:"pointer",transition:"all .15s"}}>
      <div style={{display:"flex",alignItems:"center",gap:10}}>
        <div style={{width:40,height:40,borderRadius:12,background:ts.team.col+"20",display:"flex",alignItems:"center",justifyContent:"center",fontWeight:900,fontSize:14,color:ts.team.col,flexShrink:0}}>
          {ts.team.icon||ts.team.name?.slice(0,2)}
        </div>
        <div style={{flex:1,minWidth:0}}>
          <div style={{fontWeight:800,fontSize:14,color:"#0f172a"}}>{ts.team.name}</div>
          <div style={{fontSize:11,color:"#64748b",marginTop:1}}>
            {ts.players.length} Spieler  {ts.trainers.map(x=>x.name).join(", ")||"Kein Trainer"}
          </div>
        </div>
        <div style={{textAlign:"right",flexShrink:0}}>
          {ts.isToday&&<div style={{background:"#fef3c7",color:"#d97706",fontWeight:800,fontSize:11,padding:"3px 8px",borderRadius:6,marginBottom:3}}>HEUTE</div>}
          {ts.isTomorrow&&<div style={{background:"#eff6ff",color:"#2563eb",fontWeight:800,fontSize:11,padding:"3px 8px",borderRadius:6,marginBottom:3}}>MORGEN</div>}
          {ts.nextEv&&<div style={{fontSize:11,color:"#94a3b8"}}>{ts.nextEv.date?.slice(5).replace("-",".")}</div>}
          {ts.nextEv&&<div style={{fontSize:10,color:"#16a34a",fontWeight:700}}>{ts.yesVotes} dabei</div>}
        </div>
      </div>
      {ts.nextEv&&(
        <div style={{marginTop:8,padding:"7px 10px",background:"#f8fafc",borderRadius:9,fontSize:12,color:"#475569"}}>
          {ts.nextEv.title} {ts.nextEv.time&&"um "+ts.nextEv.time}
          {ts.nextEv.location&&" - "+ts.nextEv.location}
        </div>
      )}
    </div>
  );

  return (
    <div>
      {/* Schnell-Statistik */}
      <div className="va-grid-3" style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:8,marginBottom:16}}>
        {[
          [myTeams.length,"Teams",t.p],
          [(data.playerProfiles||[]).filter(p=>(data.teams||[]).find(x=>x.cid===cid&&x.id===p.mainTid)&&!p.archived).length,"Spieler","#2563eb"],
          [(data.trainers||[]).filter(x=>x.cid===cid).length,"Trainer","#7c3aed"],
        ].map(([v,l,col])=>(
          <div key={l} style={{background:"#fff",borderRadius:13,padding:"12px",textAlign:"center",border:"1.5px solid #e2e8f0"}}>
            <div style={{fontWeight:900,fontSize:24,color:col,lineHeight:1}}>{v}</div>
            <div style={{fontSize:11,color:"#94a3b8",marginTop:3}}>{l}</div>
          </div>
        ))}
      </div>

      {urgent.length>0&&<>
        <div style={{fontSize:11,fontWeight:800,color:"#d97706",marginBottom:8,letterSpacing:.5}}>HEUTE & MORGEN</div>
        {urgent.map(ts=><TeamRow key={ts.team.id} ts={ts}/>)}
      </>}
      {thisWeek.length>0&&<>
        <div style={{fontSize:11,fontWeight:800,color:"#2563eb",marginBottom:8,marginTop:12,letterSpacing:.5}}>DIESE WOCHE</div>
        {thisWeek.map(ts=><TeamRow key={ts.team.id} ts={ts}/>)}
      </>}
      {rest.length>0&&<>
        <div style={{fontSize:11,fontWeight:800,color:"#94a3b8",marginBottom:8,marginTop:12,letterSpacing:.5}}>ALLE TEAMS</div>
        {rest.map(ts=><TeamRow key={ts.team.id} ts={ts}/>)}
      </>}
      {myTeams.length===0&&<div style={{textAlign:"center",padding:"40px 20px",background:"#f8fafc",borderRadius:14,border:"1.5px dashed #e2e8f0"}}>
        <p style={{fontWeight:700,color:"#334155",margin:"0 0 4px"}}>Noch keine Teams angelegt</p>
        <p style={{fontSize:13,color:"#94a3b8",margin:0}}>Lege zuerst Teams im Onboarding oder im Tab Mannschaften an.</p>
      </div>}
    </div>
  );
}

/* =================================================================
   4. CSV-EXPORT ANWESENHEIT (Sandra, Rolf)
================================================================= */
function exportAttendanceCSV(data, teamId, teamName) {
  const players = (data.playerProfiles||[]).filter(p=>p.mainTid===teamId&&!p.archived);
  const trainings = (data.events||[]).filter(e=>e.tid===teamId&&e.type==="training").sort((a,b)=>a.date.localeCompare(b.date));
  if(!players.length||!trainings.length) return;

  const header = ["Name","Jahrgang",...trainings.map(e=>e.date+" "+e.title.slice(0,15)),"Gesamt","Prozent"];
  const rows = players.map(pl=>{
    const presence = trainings.map(e=>{
      const v = e.votes?.[pl.name];
      const val = typeof v==="object"&&v!==null ? v.val : v;
      return val==="yes" ? "1" : val==="no" ? "0" : "-";
    });
    const total = presence.filter(x=>x==="1").length;
    const pct = trainings.length>0 ? Math.round(total/trainings.length*100)+"%" : "-";
    return [pl.name, pl.by||"", ...presence, total, pct];
  });

  const csv = [header,...rows].map(r=>r.map(x=>`"${x}"`).join(",")).join("\n");
  const blob = new Blob(["\uFEFF"+csv], {type:"text/csv;charset=utf-8"});
  const a = document.createElement("a");
  a.href = URL.createObjectURL(blob);
  a.download = "anwesenheit-"+teamName.replace(/\s/g,"-")+"-"+new Date().toISOString().slice(0,10)+".csv";
  a.click();
}

/* =================================================================
   5. MASSEN-NACHRICHT AN ALLE TRAINER (Monika Jugendwart)
================================================================= */
function BroadcastModal({ data, cid, session, save, fire, onClose }) {
  const [msg, setMsg] = useState("");
  const [selTids, setSelTids] = useState([]);
  const trainers = (data.trainers||[]).filter(x=>x.cid===cid);
  const allTids = trainers.map(x=>x.id);

  const send = () => {
    if(!msg.trim()) return;
    const newMsg = {
      id: uid(), cid, teamId:"_broadcast_",
      author: session.name||"Admin", role:"admin",
      text: "[Rundschreiben] "+msg.trim(),
      ts: Date.now(),
      recipients: selTids.length>0 ? selTids : allTids,
    };
    save({...data, chats:[...(data.chats||[]),newMsg]});
    fire("Rundschreiben versendet an "+(selTids.length||trainers.length)+" Trainer");
    onClose();
  };

  return (
    <div style={{position:"fixed",inset:0,overflowY:"auto",WebkitOverflowScrolling:"touch",background:"rgba(0,0,0,.6)",zIndex:900,display:"flex",alignItems:"flex-end",justifyContent:"center",backdropFilter:"blur(6px)"}}>
      <div style={{background:"#fff",borderRadius:"22px 22px 0 0",width:"100%",maxWidth:520,padding:"22px 22px 44px"}}>
        <h3 style={{fontWeight:900,fontSize:18,marginBottom:4}}>Rundschreiben an Trainer</h3>
        <p style={{fontSize:13,color:"#64748b",marginBottom:16,lineHeight:1.5}}>
          Nachricht wird an alle oder ausgewählte Trainer gesendet.
        </p>
        <div style={{marginBottom:14}}>
          <div style={{fontSize:11,fontWeight:800,color:"#64748b",marginBottom:8}}>EMPFAENGER</div>
          <div style={{display:"flex",flexWrap:"wrap",gap:7}}>
            <button onClick={()=>setSelTids([])}
              style={{padding:"6px 12px",borderRadius:9,border:`1.5px solid ${selTids.length===0?"#16a34a":"#e2e8f0"}`,background:selTids.length===0?"#f0fdf4":"#fff",color:selTids.length===0?"#16a34a":"#64748b",fontWeight:700,fontSize:12,cursor:"pointer",fontFamily:"inherit"}}>
              Alle ({trainers.length})
            </button>
            {trainers.map(tr=>(
              <button key={tr.id} onClick={()=>setSelTids(s=>s.includes(tr.id)?s.filter(x=>x!==tr.id):[...s,tr.id])}
                style={{display:"flex",alignItems:"center",gap:6,padding:"6px 12px",borderRadius:9,border:`1.5px solid ${selTids.includes(tr.id)?"#16a34a":"#e2e8f0"}`,background:selTids.includes(tr.id)?"#f0fdf4":"#fff",color:selTids.includes(tr.id)?"#16a34a":"#64748b",fontWeight:700,fontSize:12,cursor:"pointer",fontFamily:"inherit"}}>
                <Av name={tr.name} sz={18}/>{tr.name}
              </button>
            ))}
          </div>
        </div>
        <textarea value={msg} onChange={e=>setMsg(e.target.value)}
          placeholder="Nachricht an die Trainer..."
          rows={4} style={{width:"100%",padding:"12px 14px",fontSize:14,border:"1.5px solid #e2e8f0",borderRadius:12,outline:"none",resize:"none",fontFamily:"inherit",boxSizing:"border-box",marginBottom:14}}/>
        <div style={{display:"flex",gap:9}}>
          <button onClick={onClose} style={{flex:1,padding:"12px",borderRadius:12,border:"1.5px solid #e2e8f0",background:"#fff",fontWeight:700,cursor:"pointer",fontFamily:"inherit"}}>Abbrechen</button>
          <button onClick={send} disabled={!msg.trim()}
            style={{flex:2,padding:"12px",borderRadius:12,border:"none",background:msg.trim()?"#16a34a":"#e2e8f0",color:msg.trim()?"#fff":"#94a3b8",fontWeight:800,cursor:"pointer",fontFamily:"inherit"}}>
            Senden
          </button>
        </div>
      </div>
    </div>
  );
}

/* =================================================================
   6. SCHWARZES BRETT / VEREINSNEWS (Birgit Pressewartin)
================================================================= */
function NewsTab({ data, cid, session, save, fire, cl }) {
  const t = TH(cl);
  const news = (data.news||[]).filter(x=>x.cid===cid).sort((a,b)=>b.ts-a.ts);
  const [showForm, setShowForm] = useState(false);
  const [f, setF] = useState({title:"",body:"",pin:false});
  const isAdmin = session?.role==="admin";

  const post = () => {
    if(!f.title.trim()) return;
    const item = {id:uid(),cid,title:f.title.trim(),body:f.body.trim(),pin:f.pin,ts:Date.now(),author:session?.name||"Admin"};
    save({...data,news:[...(data.news||[]),item]});
    setShowForm(false);
    setF({title:"",body:"",pin:false});
    fire("Neuigkeit veroffentlicht");
  };
  const del = id => save({...data,news:(data.news||[]).filter(x=>x.id!==id)});
  const pinned = news.filter(x=>x.pin);
  const rest = news.filter(x=>!x.pin);

  return (
    <div>
      {isAdmin&&<button onClick={()=>setShowForm(true)}
        style={{width:"100%",padding:"13px",borderRadius:14,border:"none",background:t.p,color:"#fff",fontWeight:800,fontSize:15,cursor:"pointer",fontFamily:"inherit",marginBottom:14}}>
        + Neuigkeit veroeffentlichen
      </button>}

      {news.length===0&&!showForm&&(
        <div style={{textAlign:"center",padding:"40px",background:"#f8fafc",borderRadius:14,border:"1.5px dashed #e2e8f0"}}>
          <p style={{fontWeight:700,color:"#334155",margin:"0 0 4px"}}>Noch keine Neuigkeiten</p>
          <p style={{fontSize:13,color:"#94a3b8",margin:0}}>Veroeffentliche Vereinsnews die alle Mitglieder sehen.</p>
        </div>
      )}

      {pinned.length>0&&<>
        <div style={{fontSize:11,fontWeight:800,color:"#d97706",marginBottom:8,letterSpacing:.5}}>ANGEPINNT</div>
        {pinned.map(item=><NewsCard key={item.id} item={item} isAdmin={isAdmin} onDel={()=>del(item.id)} t={t}/>)}
      </>}
      {rest.length>0&&<>
        {pinned.length>0&&<div style={{fontSize:11,fontWeight:800,color:"#94a3b8",marginBottom:8,marginTop:12,letterSpacing:.5}}>AKTUELL</div>}
        {rest.map(item=><NewsCard key={item.id} item={item} isAdmin={isAdmin} onDel={()=>del(item.id)} t={t}/>)}
      </>}

      {showForm&&(
        <div style={{position:"fixed",inset:0,overflowY:"auto",WebkitOverflowScrolling:"touch",background:"rgba(0,0,0,.6)",zIndex:900,display:"flex",alignItems:"flex-end",justifyContent:"center",backdropFilter:"blur(6px)"}}>
          <div style={{background:"#fff",borderRadius:"22px 22px 0 0",width:"100%",maxWidth:520,padding:"22px 22px 44px"}}>
            <h3 style={{fontWeight:900,fontSize:18,marginBottom:16}}>Neuigkeit veroeffentlichen</h3>
            <div style={{display:"flex",flexDirection:"column",gap:10}}>
              <input value={f.title} onChange={e=>setF(p=>({...p,title:e.target.value}))} placeholder="Titel (z.B. Saisonstart, Hauptversammlung)"
                style={{padding:"12px 14px",fontSize:15,fontWeight:700,border:"1.5px solid #e2e8f0",borderRadius:12,outline:"none"}}/>
              <textarea value={f.body} onChange={e=>setF(p=>({...p,body:e.target.value}))} placeholder="Mehr Details (optional)..." rows={4}
                style={{padding:"12px 14px",fontSize:14,border:"1.5px solid #e2e8f0",borderRadius:12,outline:"none",resize:"none",fontFamily:"inherit"}}/>
              <label style={{display:"flex",alignItems:"center",gap:10,cursor:"pointer",padding:"10px 13px",background:"#fef3c7",borderRadius:11,border:"1.5px solid #fde68a"}}>
                <input type="checkbox" checked={f.pin} onChange={e=>setF(p=>({...p,pin:e.target.checked}))} style={{width:18,height:18,accentColor:t.p}}/>
                <span style={{fontWeight:700,fontSize:14,color:"#92400e"}}>Oben anpinnen (wichtige Neuigkeit)</span>
              </label>
            </div>
            <div style={{display:"flex",gap:9,marginTop:14}}>
              <button onClick={()=>setShowForm(false)} style={{flex:1,padding:"12px",borderRadius:12,border:"1.5px solid #e2e8f0",background:"#fff",fontWeight:700,cursor:"pointer",fontFamily:"inherit"}}>Abbrechen</button>
              <button onClick={post} disabled={!f.title.trim()} style={{flex:2,padding:"12px",borderRadius:12,border:"none",background:f.title.trim()?t.p:"#e2e8f0",color:f.title.trim()?"#fff":"#94a3b8",fontWeight:800,cursor:"pointer",fontFamily:"inherit"}}>Veroeffentlichen</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function NewsCard({ item, isAdmin, onDel, t }) {
  const ago = Math.round((Date.now()-item.ts)/60000);
  const timeStr = ago<60 ? ago+"min" : ago<1440 ? Math.round(ago/60)+"h" : Math.round(ago/1440)+"d";
  return (
    <div style={{background:"#fff",borderRadius:14,padding:"14px 16px",border:`1.5px solid ${item.pin?"#fde68a":"#e2e8f0"}`,marginBottom:9,position:"relative"}}>
      {item.pin&&<div style={{position:"absolute",top:12,right:isAdmin?40:12,background:"#fef3c7",color:"#d97706",fontSize:10,fontWeight:800,padding:"2px 7px",borderRadius:5}}>ANGEPINNT</div>}
      {isAdmin&&<button onClick={onDel} style={{position:"absolute",top:10,right:10,width:26,height:26,borderRadius:7,background:"#fee2e2",border:"none",color:"#dc2626",cursor:"pointer",fontSize:12,fontWeight:800}}>x</button>}
      <div style={{fontWeight:800,fontSize:15,color:"#0f172a",paddingRight:isAdmin?32:0}}>{item.title}</div>
      {item.body&&<div style={{fontSize:13,color:"#475569",marginTop:6,lineHeight:1.6}}>{item.body}</div>}
      <div style={{fontSize:11,color:"#94a3b8",marginTop:8}}>{item.author} vor {timeStr}</div>
    </div>
  );
}

/* =================================================================
   7. IMPORT von JSON/Backup (Brigitte Excel, Thomas TeamApp)
================================================================= */
function ImportData({ save, fire, onClose }) {
  const [error, setError] = useState("");
  const [preview, setPreview] = useState(null);
  const fileRef = React.useRef(null);

  const handleFile = (e) => {
    const file = e.target.files?.[0];
    if(!file) return;
    const reader = new FileReader();
    reader.onload = ev => {
      try {
        const parsed = JSON.parse(ev.target.result);
        if(!parsed.clubs||!Array.isArray(parsed.clubs)) {
          setError("Keine gueltie Vereins-App Backup-Datei. Bitte nur Dateien importieren die von dieser App exportiert wurden.");
          return;
        }
        setPreview(parsed);
        setError("");
      } catch {
        setError("Datei konnte nicht gelesen werden. Bitte nur .json Dateien importieren.");
      }
    };
    reader.readAsText(file);
  };

  const doImport = () => {
    if(!preview) return;
    save(preview);
    fire("Import erfolgreich - "+preview.clubs?.length+" Vereine geladen");
    onClose();
  };

  return (
    <div style={{position:"fixed",inset:0,overflowY:"auto",WebkitOverflowScrolling:"touch",background:"rgba(0,0,0,.6)",zIndex:900,display:"flex",alignItems:"center",justifyContent:"center",padding:20,backdropFilter:"blur(6px)"}}>
      <div style={{background:"#fff",borderRadius:20,padding:"24px",width:"100%",maxWidth:400}}>
        <h3 style={{fontWeight:900,fontSize:18,marginBottom:8}}>Daten importieren</h3>
        <p style={{fontSize:13,color:"#64748b",marginBottom:16,lineHeight:1.5}}>
          Lade eine Backup-Datei hoch die du zuvor mit dieser App exportiert hast.
        </p>
        {error&&<FriendlyError type="loadError" extra={error}/>}
        {!preview?(
          <>
            <input ref={fileRef} type="file" accept=".json" onChange={handleFile} style={{display:"none"}}/>
            <button onClick={()=>fileRef.current?.click()}
              style={{width:"100%",padding:"13px",borderRadius:13,border:"2px dashed #e2e8f0",background:"#f8fafc",color:"#475569",fontWeight:700,fontSize:14,cursor:"pointer",fontFamily:"inherit",marginBottom:14}}>
              JSON-Datei auswählen
            </button>
          </>
        ):(
          <div style={{background:"#f0fdf4",borderRadius:12,padding:"12px 14px",border:"1.5px solid #bbf7d0",marginBottom:14}}>
            <div style={{fontWeight:700,fontSize:14,color:"#166534",marginBottom:4}}>Datei erkannt:</div>
            <div style={{fontSize:13,color:"#166534"}}>
              {preview.clubs?.length||0} Vereine, {preview.teams?.length||0} Teams, {preview.playerProfiles?.length||0} Spieler
            </div>
          </div>
        )}
        <div style={{display:"flex",gap:9}}>
          <button onClick={onClose} style={{flex:1,padding:"12px",borderRadius:12,border:"1.5px solid #e2e8f0",background:"#fff",fontWeight:700,cursor:"pointer",fontFamily:"inherit"}}>Abbrechen</button>
          {preview&&<button onClick={doImport} style={{flex:2,padding:"12px",borderRadius:12,border:"none",background:"#16a34a",color:"#fff",fontWeight:800,cursor:"pointer",fontFamily:"inherit"}}>Importieren</button>}
        </div>
      </div>
    </div>
  );
}



function AccessibilityBar() {
  const [fs, setFs] = React.useState(()=>localStorage.getItem("va_fontsize")||"normal");
  const apply = (size) => {
    setFs(size);
    localStorage.setItem("va_fontsize", size);
    document.documentElement.style.fontSize = {small:"13px",normal:"15px",large:"19px"}[size];
  };
  React.useEffect(()=>{ apply(fs); }, []);
  return (
    <div style={{position:"fixed",bottom:16,right:16,zIndex:500,display:"flex",gap:5,
      background:"rgba(0,0,0,.45)",borderRadius:12,padding:"6px 8px",backdropFilter:"blur(8px)"}}>
      {[["small","A"],["normal","A"],["large","A"]].map(([size,label],i)=>(
        <button key={size} onClick={()=>apply(size)}
          style={{width:28,height:28,borderRadius:8,border:`1.5px solid ${fs===size?"#fff":"rgba(255,255,255,.3)"}`,
            background:fs===size?"rgba(255,255,255,.25)":"transparent",
            color:"#fff",fontWeight:900,fontSize:[11,14,18][i],cursor:"pointer",
            fontFamily:"inherit",lineHeight:1}}>
          {label}
        </button>
      ))}
    </div>
  );
}


/* =================================================================
   AUDIT & SECURITY SYSTEM
================================================================= */

// Geräte-Fingerprint (kein echter Fingerprint - nur Browser-Infos)
const getDeviceInfo = () => {
  const ua = navigator.userAgent;
  const lang = navigator.language || "unbekannt";
  const tz = Intl.DateTimeFormat().resolvedOptions().timeZone || "unbekannt";
  const screen = `${window.screen.width}x${window.screen.height}`;
  const mobile = /Mobi|Android/i.test(ua);
  const browser = ua.includes("Chrome") ? "Chrome"
    : ua.includes("Firefox") ? "Firefox"
    : ua.includes("Safari") ? "Safari"
    : ua.includes("Edge") ? "Edge" : "Unbekannt";
  const os = ua.includes("Windows") ? "Windows"
    : ua.includes("Mac") ? "macOS"
    : ua.includes("iPhone") || ua.includes("iPad") ? "iOS"
    : ua.includes("Android") ? "Android"
    : ua.includes("Linux") ? "Linux" : "Unbekannt";

  // Sprache als Proxy für Region
  const region = lang.split("-")[1] || lang.split("-")[0] || "??";
  const suspicious = !["de","en","nl","at","ch","be","lu"].includes(lang.slice(0,2).toLowerCase());

  return { browser, os, mobile, screen, lang, tz, region, suspicious, ua: ua.slice(0,80) };
};

// Gerraete-ID (stabil im localStorage)
const getDeviceId = () => {
  let id = localStorage.getItem("va_device_id");
  if(!id) {
    id = uid();
    localStorage.setItem("va_device_id", id);
  }
  return id;
};

// Brute-Force Schutz
const BruteForce = {
  key: (cid) => "va_bf_" + cid,
  get: (cid) => {
    try { return JSON.parse(localStorage.getItem(BruteForce.key(cid)) || "{}"); } catch { return {}; }
  },
  record: (cid, success) => {
    const now = Date.now();
    const state = BruteForce.get(cid);
    if(success) {
      localStorage.removeItem(BruteForce.key(cid));
      return { blocked: false };
    }
    const attempts = (state.attempts || []).filter(t => now - t < 5 * 60 * 1000); // letzte 5 Min
    attempts.push(now);
    const newState = { attempts, blockedUntil: attempts.length >= 3 ? now + 5 * 60 * 1000 : 0 };
    localStorage.setItem(BruteForce.key(cid), JSON.stringify(newState));
    return {
      blocked: newState.blockedUntil > now,
      attemptsLeft: Math.max(0, 3 - attempts.length),
      blockedFor: Math.ceil((newState.blockedUntil - now) / 60000),
    };
  },
  isBlocked: (cid) => {
    const state = BruteForce.get(cid);
    return state.blockedUntil && Date.now() < state.blockedUntil
      ? Math.ceil((state.blockedUntil - Date.now()) / 60000)
      : 0;
  },
};

// Audit-Log Eintrag erstellen
const createAuditEntry = (type, detail, session, extra = {}) => ({
  id: uid(),
  type,       // login|logout|player_add|player_edit|player_del|event_add|event_del|admin_action|suspicious|pw_change
  detail,     // Lesbarer Text
  ts: new Date().toISOString(),
  role: session?.role || "unknown",
  name: session?.name || session?.role || "Unbekannt",
  device: getDeviceInfo(),
  deviceId: getDeviceId(),
  ...extra,
});

// Audit-Log speichern (append-only, max 500 Einträge)
const addAuditLog = (data, save, entry) => {
  const log = [...(data.securityLog || []), entry].slice(-500);
  save({ ...data, securityLog: log });
};

// Bekannte Geräte für einen Verein
const getKnownDevices = (securityLog) => {
  const devices = {};
  (securityLog || [])
    .filter(e => e.type === "login" && e.deviceId)
    .forEach(e => { devices[e.deviceId] = (devices[e.deviceId] || 0) + 1; });
  return devices;
};

/* =================================================================
   SECURITY LOG TAB (nur Admin)
================================================================= */
function SecurityTab({ data, cid, save }) {
  const log = (data.securityLog || [])
    .filter(e => e.cid === cid || !e.cid)
    .sort((a, b) => b.ts.localeCompare(a.ts));

  const [filter, setFilter] = useState("all"); // all|logins|changes|suspicious
  const [showDetails, setShowDetails] = useState(null);

  const knownDevices = getKnownDevices(log);

  const TYPE_CONFIG = {
    login:        { icon: "->", label: "Login",         col: "#16a34a", bg: "#dcfce7" },
    logout:       { icon: "<-", label: "Logout",        col: "#64748b", bg: "#f1f5f9" },
    player_add:   { icon: "+P", label: "Spieler +",     col: "#2563eb", bg: "#eff6ff" },
    player_edit:  { icon: "~P", label: "Spieler ~",     col: "#2563eb", bg: "#eff6ff" },
    player_del:   { icon: "-P", label: "Spieler -",     col: "#dc2626", bg: "#fee2e2" },
    event_add:    { icon: "+T", label: "Termin +",      col: "#16a34a", bg: "#dcfce7" },
    event_edit:   { icon: "~T", label: "Termin ~",      col: "#d97706", bg: "#fef3c7" },
    event_del:    { icon: "-T", label: "Termin -",      col: "#dc2626", bg: "#fee2e2" },
    admin_action: { icon: "A",  label: "Admin",         col: "#7c3aed", bg: "#ede9fe" },
    pw_change:    { icon: "PW", label: "Passwort",      col: "#d97706", bg: "#fef3c7" },
    suspicious:   { icon: "!",  label: "Verdaechtig",   col: "#dc2626", bg: "#fee2e2" },
    brute_force:  { icon: "!!", label: "Brute Force",   col: "#dc2626", bg: "#fee2e2" },
    dsgvo_delete: { icon: "DS", label: "DSGVO-Losch",   col: "#7c3aed", bg: "#ede9fe" },
    new_device:   { icon: "ND", label: "Neues Gerät",  col: "#d97706", bg: "#fef3c7" },
  };

  const filtered = log.filter(e => {
    if(filter === "logins") return ["login","logout","brute_force","suspicious"].includes(e.type);
    if(filter === "changes") return ["player_add","player_edit","player_del","event_add","event_edit","event_del","admin_action","pw_change","dsgvo_delete"].includes(e.type);
    if(filter === "suspicious") return ["suspicious","brute_force","new_device"].includes(e.type);
    return true;
  });

  const suspicious = log.filter(e => ["suspicious","brute_force","new_device"].includes(e.type));
  const todayLogins = log.filter(e => e.type === "login" && e.ts.startsWith(new Date().toISOString().slice(0,10)));

  const formatTime = ts => {
    const d = new Date(ts);
    const now = new Date();
    const diff = now - d;
    if(diff < 60000) return "Gerade eben";
    if(diff < 3600000) return Math.floor(diff/60000) + " Min. her";
    if(diff < 86400000) return Math.floor(diff/3600000) + " Std. her";
    return d.toLocaleDateString("de-DE", { day:"2-digit", month:"2-digit", year:"2-digit" })
      + " " + d.toLocaleTimeString("de-DE", { hour:"2-digit", minute:"2-digit" });
  };

  return (
    <div>
      {/* Zusammenfassung */}
      <div className="va-grid-3" style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:8,marginBottom:16}}>
        {[
          [todayLogins.length, "Logins heute", "#16a34a"],
          [suspicious.length,  "Verdaechtig",  suspicious.length>0?"#dc2626":"#64748b"],
          [Object.keys(knownDevices).length, "Bekannte Geräte", "#2563eb"],
        ].map(([v,l,col])=>(
          <div key={l} style={{background:"#fff",borderRadius:13,padding:"12px",
            textAlign:"center",border:"1.5px solid #e2e8f0"}}>
            <div style={{fontWeight:900,fontSize:24,color:col,lineHeight:1}}>{v}</div>
            <div style={{fontSize:10,color:"#94a3b8",marginTop:3,lineHeight:1.3}}>{l}</div>
          </div>
        ))}
      </div>

      {suspicious.length > 0 && (
        <div style={{background:"#fef2f2",borderRadius:13,padding:"12px 14px",
          border:"2px solid #fca5a5",marginBottom:14}}>
          <div style={{fontWeight:800,fontSize:13,color:"#dc2626",marginBottom:4}}>
            {suspicious.length} verdaechtige Aktivitaet(en)
          </div>
          <div style={{fontSize:12,color:"#dc2626"}}>
            {suspicious.slice(0,2).map(e=>(
              <div key={e.id}>{formatTime(e.ts)}: {e.detail}</div>
            ))}
          </div>
        </div>
      )}

      {/* Filter */}
      <div style={{display:"flex",gap:6,marginBottom:14,overflowX:"auto",scrollbarWidth:"none"}}>
        {[["all","Alles"],["logins","Logins"],["changes","Änderungen"],["suspicious","Verdaechtig"]].map(([v,l])=>(
          <button key={v} onClick={()=>setFilter(v)}
            style={{padding:"7px 14px",borderRadius:99,border:`2px solid ${filter===v?"#0f172a":"#e2e8f0"}`,
              background:filter===v?"#0f172a":"#fff",color:filter===v?"#fff":"#64748b",
              fontWeight:700,fontSize:12,cursor:"pointer",whiteSpace:"nowrap",
              fontFamily:"inherit",flexShrink:0}}>
            {l}
            {v==="suspicious"&&suspicious.length>0&&<span style={{marginLeft:5,background:"#dc2626",color:"#fff",borderRadius:99,padding:"0px 6px",fontSize:10}}>{suspicious.length}</span>}
          </button>
        ))}
      </div>

      {/* Log Liste */}
      {filtered.length === 0 && (
        <div style={{textAlign:"center",padding:"40px",background:"#f8fafc",borderRadius:14,border:"1.5px dashed #e2e8f0"}}>
          <p style={{fontWeight:700,color:"#334155",margin:0}}>Noch keine Einträge</p>
        </div>
      )}
      <div style={{display:"flex",flexDirection:"column",gap:7}}>
        {filtered.slice(0,100).map(entry => {
          const cfg = TYPE_CONFIG[entry.type] || { icon:"?", label:entry.type, col:"#64748b", bg:"#f1f5f9" };
          const isNew = !knownDevices[entry.deviceId] || knownDevices[entry.deviceId] <= 1;
          const isSuspicious = ["suspicious","brute_force","new_device"].includes(entry.type);
          return (
            <div key={entry.id} onClick={()=>setShowDetails(showDetails===entry.id?null:entry.id)}
              style={{background:"#fff",borderRadius:13,padding:"11px 14px",
                border:`1.5px solid ${isSuspicious?"#fca5a5":"#e2e8f0"}`,
                cursor:"pointer",transition:"all .15s"}}>
              <div style={{display:"flex",alignItems:"center",gap:10}}>
                <div style={{width:36,height:36,borderRadius:10,background:cfg.bg,
                  display:"flex",alignItems:"center",justifyContent:"center",
                  fontWeight:900,fontSize:12,color:cfg.col,flexShrink:0}}>
                  {cfg.icon}
                </div>
                <div style={{flex:1,minWidth:0}}>
                  <div style={{fontWeight:700,fontSize:13,color:"#0f172a",
                    whiteSpace:"nowrap",overflow:"hidden",textOverflow:"ellipsis"}}>
                    {entry.detail}
                  </div>
                  <div style={{fontSize:11,color:"#94a3b8",marginTop:2,display:"flex",gap:8,flexWrap:"wrap"}}>
                    <span>{formatTime(entry.ts)}</span>
                    <span>{entry.name}</span>
                    {entry.device?.os&&<span>{entry.device.os}</span>}
                    {entry.device?.suspicious&&<span style={{color:"#dc2626",fontWeight:700}}>Ausland?</span>}
                  </div>
                </div>
                <div style={{fontSize:11,color:"#94a3b8",flexShrink:0,textAlign:"right"}}>
                  {cfg.label}
                  {isSuspicious&&<div style={{color:"#dc2626",fontWeight:800}}>!</div>}
                </div>
              </div>
              {showDetails===entry.id&&(
                <div style={{marginTop:10,padding:"10px 12px",background:"#f8fafc",
                  borderRadius:9,fontSize:11,color:"#64748b",lineHeight:1.8}}>
                  <div><strong>Zeit:</strong> {new Date(entry.ts).toLocaleString("de-DE")}</div>
                  <div><strong>Rolle:</strong> {entry.role}</div>
                  <div><strong>Browser:</strong> {entry.device?.browser} auf {entry.device?.os}</div>
                  <div><strong>Sprache/Region:</strong> {entry.device?.lang} ({entry.device?.tz})</div>
                  <div><strong>Bildschirm:</strong> {entry.device?.screen}</div>
                  <div><strong>Gerät-ID:</strong> {entry.deviceId?.slice(0,8)}... {isNew?"(Neues Gerät!)":""}</div>
                  {entry.device?.suspicious&&(
                    <div style={{color:"#dc2626",fontWeight:700,marginTop:4}}>
                      Hinweis: Browsersprache deutet auf Ausland hin ({entry.device.lang})
                    </div>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>
      {filtered.length > 100 && (
        <div style={{textAlign:"center",padding:"12px",fontSize:12,color:"#94a3b8"}}>
          {filtered.length - 100} weitere Einträge nicht angezeigt
        </div>
      )}
    </div>
  );
}

/* =================================================================
   BOTTOM NAVIGATION + DRAWER
================================================================= */
function BottomNav({ tab, setTab, isAdmin, isHelper, unread, cl, hide=false }) {
  if(hide) return null;
  const t = TH(cl);
  const clubFeat = (key, def=true) => { const cs = cl?.clubSettings||{}; return cs[key]!==undefined ? cs[key] : def; };
  const [showDrawer, setShowDrawer] = useState(false);

  const mainTabs = [
    { id:"events",  label:"Termine",  icon:"K" },
    { id:"team",    label:"Team",     icon:"P", hidden: isHelper },
    { id:"fields",  label:"Platz",    icon:"F", hidden: isHelper||!feat("fields_booking")||!clubFeat("mod_fields") },
    { id:"chat",    label:"Chat",     icon:"C", badge: unread, hidden: !feat("chat_team") },
    { id:"more",    label:"Mehr",     icon:"=" },
  ].filter(x=>!x.hidden);

  const drawerSections = [
    {
      label: "VERWALTUNG",
      items: [
        { id:"training",  label:"Trainingsplan", icon:"TP", hidden: !feat("training_plans")||!clubFeat("mod_training") },
        { id:"jerseys",    label:"Trikots",      icon:"T", hidden: !feat("jerseys_tab")||!clubFeat("mod_jerseys") },
        { id:"helpers",    label:"Helfer",       icon:"H", hidden: isHelper },
        { id:"templates",  label:"Vorlagen",     icon:"V", hidden: isHelper },
        { id:"results",    label:"Ergebnisse",   icon:"E", hidden: !feat("results_tab")||!clubFeat("mod_results") },
        { id:"attendance", label:"Anwesenheit",  icon:"S", hidden: isHelper||!feat("attendance_tab") },
      ].filter(x=>!x.hidden),
    },
    isAdmin && {
      label: "ADMIN",
      items: [
        { id:"overview",    label:"Übersicht alle Teams", icon:"U" },
        { id:"news",        label:"Neuigkeiten",           icon:"N", hidden: !feat("news_board") },
        { id:"teams",       label:"Mannschaften",          icon:"M" },
        { id:"trainers",    label:"Trainer",               icon:"T" },
        { id:"fieldsadmin", label:"Plaetze",               icon:"P", hidden: !feat("fields_manager") },
        { id:"branding",    label:"Design",                icon:"D" },
        { id:"inbox",       label:"Posteingang",           icon:"I" },
        { id:"security",    label:"Sicherheitslog",         icon:"!" },
        { id:"access",      label:"Zugänge & Passwörter",  icon:"PW" },
        { id:"settings",    label:"Einstellungen",         icon:"+" },
      ],
    },
  ].filter(Boolean).filter(x=>!x.hidden);

  const selectTab = (id) => {
    setTab(id);
    setShowDrawer(false);
  };

  return (
    <>
      {/* Drawer */}
      {showDrawer && (
        <div style={{position:"fixed",inset:0,zIndex:600,display:"flex",flexDirection:"column",justifyContent:"flex-end"}}>
          <div style={{position:"absolute",inset:0,background:"rgba(0,0,0,.45)",backdropFilter:"blur(4px)"}}
            onClick={()=>setShowDrawer(false)}/>
          <div style={{position:"relative",background:"#fff",borderRadius:"22px 22px 0 0",
            maxHeight:"75dvh",overflowY:"auto",paddingBottom:32,animation:"down .25s ease"}}>
            <div style={{width:36,height:4,borderRadius:99,background:"#e2e8f0",
              margin:"12px auto 16px"}}/>
            {drawerSections.map((section,si)=>(
              <div key={si} style={{paddingBottom:8}}>
                <div style={{fontSize:10,fontWeight:800,color:"#94a3b8",
                  letterSpacing:1,padding:"8px 20px 6px"}}>
                  {section.label}
                </div>
                <div style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:8,padding:"0 16px"}}>
                  {section.items.map(item=>(
                    <button key={item.id} onClick={()=>selectTab(item.id)}
                      style={{padding:"13px 8px",borderRadius:14,border:`1.5px solid ${tab===item.id?t.p:"#e2e8f0"}`,
                        background:tab===item.id?t.p+"12":"#f8fafc",
                        color:tab===item.id?t.p:"#475569",
                        fontWeight:tab===item.id?800:600,fontSize:11,
                        cursor:"pointer",fontFamily:"inherit",textAlign:"center",
                        display:"flex",flexDirection:"column",alignItems:"center",gap:5}}>
                      <div style={{width:32,height:32,borderRadius:9,
                        background:tab===item.id?t.p:"#e2e8f0",
                        display:"flex",alignItems:"center",justifyContent:"center",
                        fontWeight:900,fontSize:14,
                        color:tab===item.id?"#fff":"#64748b"}}>
                        {item.icon}
                      </div>
                      {item.label}
                    </button>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Bottom Bar */}
      <div style={{position:"fixed",bottom:0,left:0,right:0,zIndex:500,
        background:"rgba(255,255,255,.95)",backdropFilter:"blur(12px)",
        borderTop:"1px solid #e2e8f0",
        display:"flex",alignItems:"stretch",
        paddingBottom:"env(safe-area-inset-bottom)",
        boxShadow:"0 -4px 24px rgba(0,0,0,.08)"}}>
        {mainTabs.map(item=>{
          const active = item.id==="more" ? showDrawer
            : tab===item.id || (item.id==="team" && ["players","attendance","stats"].includes(tab));
          return (
            <button key={item.id}
              onClick={()=>{ if(item.id==="more"){ setShowDrawer(s=>!s); } else { setTab(item.id); setShowDrawer(false); }}}
              style={{flex:1,padding:"10px 4px 8px",border:"none",background:"transparent",
                cursor:"pointer",display:"flex",flexDirection:"column",alignItems:"center",
                gap:3,position:"relative",fontFamily:"inherit"}}>
              {item.badge>0&&(
                <div style={{position:"absolute",top:6,right:"25%",width:16,height:16,
                  borderRadius:"50%",background:"#dc2626",color:"#fff",
                  fontSize:10,fontWeight:900,display:"flex",alignItems:"center",justifyContent:"center"}}>
                  {item.badge>9?"9+":item.badge}
                </div>
              )}
              <div style={{width:28,height:28,borderRadius:9,
                background:active?t.p:"transparent",
                display:"flex",alignItems:"center",justifyContent:"center",
                fontWeight:900,fontSize:15,
                color:active?"#fff":tab===item.id?"#0f172a":"#94a3b8",
                transition:"all .2s"}}>
                {item.icon}
              </div>
              <span style={{fontSize:10,fontWeight:active?800:500,
                color:active?t.p:"#94a3b8",transition:"all .2s"}}>
                {item.label}
              </span>
            </button>
          );
        })}
      </div>
    </>
  );
}

/* =================================================================
   TEAM HUB (Spieler + Anwesenheit + Statistik in einem Tab)
================================================================= */
function TeamHub({ data, myTids, save, fire, cl, session }) {
  const [subTab, setSubTab] = useState("players"); // players | attendance | stats
  const t = TH(cl);
  const subTabs = [
    { id:"players",    label:"Spieler",     icon:"P" },
    { id:"attendance", label:"Anwesenheit", icon:"S" },
    { id:"results",    label:"Ergebnisse",  icon:"E" },
  ];
  return (
    <div>
      <div style={{display:"flex",gap:6,marginBottom:14}}>
        {subTabs.map(st=>(
          <button key={st.id} onClick={()=>setSubTab(st.id)}
            style={{flex:1,padding:"9px",borderRadius:11,
              border:`2px solid ${subTab===st.id?t.p:"#e2e8f0"}`,
              background:subTab===st.id?t.p:"#fff",
              color:subTab===st.id?"#fff":"#64748b",
              fontWeight:subTab===st.id?800:600,fontSize:13,
              cursor:"pointer",fontFamily:"inherit"}}>
            {st.label}
          </button>
        ))}
      </div>
      {subTab==="players"    && <PlayersTab    data={data} myTids={myTids} save={save} fire={fire} cl={cl}/>}
      {subTab==="attendance" && <AttendanceTab data={data} myTids={myTids} cl={cl} save={save} fire={fire}/>}
      {subTab==="results"    && <LeagueTab     data={data} myTids={myTids} cl={cl} save={save} fire={fire}/>}
    </div>
  );
}



/* =================================================================
   MATERIAL KATALOG
================================================================= */
const MATERIAL_CATALOG = [
  // Tore
  { id:"goal_small",   cat:"Tore",      label:"Kleines Tor",    icon:"g", col:"#dc2626", unit:"Tor",    canColor:false },
  { id:"goal_medium",  cat:"Tore",      label:"Mittleres Tor",  icon:"G", col:"#d97706", unit:"Tor",    canColor:false },
  { id:"goal_large",   cat:"Tore",      label:"Großes Tor",    icon:"GG",col:"#334155", unit:"Tor",    canColor:false },
  // Markierung
  { id:"huetchen",     cat:"Markierung",label:"Hütchen",       icon:"^", col:"#f59e0b", unit:"Stück", canColor:true  },
  { id:"pylone",       cat:"Markierung",label:"Pylone",         icon:"P", col:"#f97316", unit:"Stück", canColor:true  },
  { id:"stange",       cat:"Markierung",label:"Huepfstange",    icon:"|", col:"#64748b", unit:"Stück", canColor:true  },
  { id:"koordleiter",  cat:"Markierung",label:"Koordinationsleiter",icon:"=",col:"#7c3aed",unit:"Stück",canColor:false},
  // Leibchen
  { id:"leibchen",     cat:"Leibchen",  label:"Leibchen",       icon:"L", col:"#3b82f6", unit:"Stück", canColor:true  },
  // Baelle
  { id:"ball_fuss",    cat:"Baelle",    label:"Fußball",       icon:"o", col:"#0f172a", unit:"Ball",   canColor:false },
  { id:"ball_hand",    cat:"Baelle",    label:"Handball",       icon:"o", col:"#d97706", unit:"Ball",   canColor:false },
  { id:"ball_tennis",  cat:"Baelle",    label:"Tennisball",     icon:"o", col:"#84cc16", unit:"Ball",   canColor:false },
  // Sonstiges
  { id:"bander",       cat:"Sonstiges", label:"Markierungsband",icon:"-", col:"#ec4899", unit:"Rolle",  canColor:true  },
  { id:"huerden",      cat:"Sonstiges", label:"Huerden",        icon:"H", col:"#64748b", unit:"Stück", canColor:false },
  { id:"medizinball",  cat:"Sonstiges", label:"Medizinball",    icon:"M", col:"#7c3aed", unit:"Stück", canColor:false },
];

const COLORS_DE = ["rot","blau","gelb","gruen","orange","weiss","schwarz","pink"];
const COLOR_HEX  = {rot:"#dc2626",blau:"#2563eb",gelb:"#f59e0b",gruen:"#16a34a",
                    orange:"#d97706",weiss:"#e2e8f0",schwarz:"#1e293b",pink:"#ec4899"};

const EXERCISE_CATS = [
  { id:"warmup",   label:"Aufwaermen",  col:"#f59e0b", bg:"#fef3c7" },
  { id:"technik",  label:"Technik",     col:"#2563eb", bg:"#eff6ff" },
  { id:"taktik",   label:"Taktik",      col:"#7c3aed", bg:"#ede9fe" },
  { id:"spiel",    label:"Spielform",   col:"#16a34a", bg:"#dcfce7" },
  { id:"abkuehlen",label:"Abkuehlen",   col:"#64748b", bg:"#f1f5f9" },
];

const FIELD_ZONES = [
  { id:"full",      label:"Ganzes Feld",   pct:100 },
  { id:"half_l",    label:"Linke Haelfte", pct:50  },
  { id:"half_r",    label:"Rechte Haelfte",pct:50  },
  { id:"third_l",   label:"Linkes Drittel",pct:33  },
  { id:"third_m",   label:"Mitteldrittel", pct:33  },
  { id:"third_r",   label:"Rechtes Drittel",pct:33 },
  { id:"quarter_tl",label:"Viertel oben L",pct:25  },
  { id:"quarter_tr",label:"Viertel oben R",pct:25  },
  { id:"quarter_bl",label:"Viertel unten L",pct:25 },
  { id:"quarter_br",label:"Viertel unten R",pct:25 },
  { id:"strafraum", label:"Strafraum",     pct:15  },
  { id:"mittelkreis",label:"Mittelkreis",  pct:20  },
];

/* =================================================================
   INVENTARLISTE BERECHNEN
================================================================= */
const calcInventory = (exercises) => {
  const totals = {};
  (exercises||[]).forEach(ex => {
    (ex.material||[]).forEach(m => {
      const key = m.id + (m.color ? "_"+m.color : "");
      if(!totals[key]) totals[key] = { ...m, total:0 };
      totals[key].total += (m.qty || 1);
    });
  });
  return Object.values(totals).sort((a,b)=>a.cat?.localeCompare(b.cat));
};

/* =================================================================
   TRAINING PLAN TAB
================================================================= */
function TrainingPlanTab({ data, myTids, save, fire, cl, session }) {
  const t = TH(cl);
  const cid = (data.teams||[]).find(tm=>myTids.includes(tm.id))?.cid;
  const plans = (data.trainingPlans||[]).filter(p=>myTids.includes(p.tid)||(p.cid===cid&&!p.tid));
  const [selPlan, setSelPlan] = useState(null);
  const [showNew, setShowNew] = useState(false);
  const [showInventory, setShowInventory] = useState(null);

  // Nächstes Training mit Trainingsplan
  const today = new Date().toISOString().slice(0,10);
  const nextTraining = (data.events||[])
    .filter(e=>myTids.includes(e.tid)&&e.type==="training"&&e.date>=today&&e.planId)
    .sort((a,b)=>a.date.localeCompare(b.date))[0];
  const linkedPlan = nextTraining ? plans.find(p=>p.id===nextTraining.planId) : null;

  return (
    <div>
      {/* Nächstes Training Hint */}
      {linkedPlan&&(
        <div style={{background:`linear-gradient(135deg,${t.s||"#052e16"},${t.p})`,
          borderRadius:16,padding:"14px 16px",marginBottom:14,cursor:"pointer"}}
          onClick={()=>setShowInventory(linkedPlan)}>
          <div style={{color:"rgba(255,255,255,.6)",fontSize:11,fontWeight:700,marginBottom:4}}>
            NAECHSTES TRAINING - INVENTARLISTE
          </div>
          <div style={{color:"#fff",fontWeight:900,fontSize:16,marginBottom:8}}>
            {linkedPlan.name}
          </div>
          {(() => {
            const inv = calcInventory(linkedPlan.exercises);
            return (
              <div style={{display:"flex",gap:6,flexWrap:"wrap"}}>
                {inv.slice(0,4).map(item=>(
                  <div key={item.id+(item.color||"")} style={{background:"rgba(255,255,255,.15)",
                    borderRadius:99,padding:"4px 10px",fontSize:12,color:"#fff",fontWeight:700}}>
                    {item.total}x {item.label}{item.color?" ("+item.color+")":""}
                  </div>
                ))}
                {inv.length>4&&<div style={{background:"rgba(255,255,255,.1)",borderRadius:99,
                  padding:"4px 10px",fontSize:12,color:"rgba(255,255,255,.7)"}}>
                  +{inv.length-4} weitere
                </div>}
              </div>
            );
          })()}
          <div style={{color:"rgba(255,255,255,.5)",fontSize:11,marginTop:8}}>
            Tippen für vollstaendige Inventarliste
          </div>
        </div>
      )}

      {/* Pläne Liste */}
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:12}}>
        <div style={{fontWeight:900,fontSize:15,color:"#0f172a"}}>{plans.length} Trainingspläne</div>
        <button onClick={()=>setShowNew(true)}
          style={{padding:"9px 16px",borderRadius:11,border:"none",background:t.p,
            color:"#fff",fontWeight:700,fontSize:13,cursor:"pointer",fontFamily:"inherit"}}>
          + Neuer Plan
        </button>
      </div>

      {plans.length===0&&(
        <div style={{textAlign:"center",padding:"40px 20px",background:"#f8fafc",
          borderRadius:16,border:"1.5px dashed #e2e8f0"}}>
          <div style={{fontWeight:700,fontSize:15,color:"#334155",marginBottom:6}}>
            Noch keine Trainingspläne
          </div>
          <div style={{fontSize:13,color:"#94a3b8",lineHeight:1.6}}>
            Erstelle Trainingspläne mit Übungen und Material.<br/>
            Die App berechnet automatisch was du benoenigst.
          </div>
        </div>
      )}

      {plans.map(plan=>{
        const inv = calcInventory(plan.exercises);
        const totalMins = (plan.exercises||[]).reduce((s,e)=>s+(e.duration||0),0);
        return (
          <div key={plan.id} style={{background:"#fff",borderRadius:14,border:"1.5px solid #e2e8f0",
            marginBottom:10,overflow:"hidden"}}>
            <div style={{padding:"13px 16px",display:"flex",alignItems:"flex-start",gap:10}}>
              <div style={{flex:1}}>
                <div style={{fontWeight:800,fontSize:15,color:"#0f172a"}}>{plan.name}</div>
                <div style={{fontSize:12,color:"#64748b",marginTop:2}}>
                  {(plan.exercises||[]).length} Übungen  {totalMins} Min.
                </div>
              </div>
              <div style={{display:"flex",gap:7}}>
                <button onClick={()=>setShowInventory(plan)}
                  style={{padding:"6px 12px",borderRadius:9,border:"1.5px solid #e2e8f0",
                    background:"#f8fafc",fontWeight:700,fontSize:12,cursor:"pointer",
                    fontFamily:"inherit",color:"#475569"}}>
                  Inventar
                </button>
                <button onClick={()=>setSelPlan(plan)}
                  style={{padding:"6px 12px",borderRadius:9,border:"none",background:t.p,
                    color:"#fff",fontWeight:700,fontSize:12,cursor:"pointer",fontFamily:"inherit"}}>
                  Bearbeiten
                </button>
              </div>
            </div>
            {/* Plan Stats */}
            {(()=>{
              const stats=calcPlanStats(plan.exercises);
              if(!stats.topSkills||stats.topSkills.length===0) return null;
              return (
                <div style={{padding:"0 14px 10px",display:"flex",gap:12,alignItems:"center"}}>
                  <div style={{display:"flex",gap:3}}>
                    {Array.from({length:5},(_,i)=>(
                      <div key={i} style={{width:8,height:14,borderRadius:3,
                        background:i*2<stats.intensity?(stats.intensity>=8?"#dc2626":stats.intensity>=5?"#d97706":"#16a34a"):"#e2e8f0"}}/>
                    ))}
                  </div>
                  <div style={{display:"flex",gap:4,flexWrap:"wrap"}}>
                    {stats.topSkills.slice(0,2).map(([skill])=>{
                      const sk=SKILLS[skill];
                      return sk?<span key={skill} style={{background:sk.col+"15",color:sk.col,borderRadius:99,padding:"2px 7px",fontSize:10,fontWeight:700}}>{sk.label}</span>:null;
                    })}
                  </div>
                </div>
              );
            })()}
            {/* Übungs-Kacheln */}
            {(plan.exercises||[]).length>0&&(
              <div style={{display:"flex",gap:4,padding:"0 14px 12px",overflowX:"auto",scrollbarWidth:"none"}}>
                {plan.exercises.map((ex,i)=>{
                  const cat = EXERCISE_CATS.find(c=>c.id===ex.cat)||EXERCISE_CATS[0];
                  return (
                    <div key={i} style={{flexShrink:0,padding:"6px 10px",borderRadius:9,
                      background:cat.bg,border:`1px solid ${cat.col}30`,minWidth:80}}>
                      <div style={{fontWeight:700,fontSize:11,color:cat.col}}>{ex.duration||0} Min</div>
                      <div style={{fontWeight:600,fontSize:11,color:"#334155",
                        whiteSpace:"nowrap",overflow:"hidden",textOverflow:"ellipsis",maxWidth:90}}>
                        {ex.name||"Übung"}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        );
      })}

      {/* Inventar Modal */}
      {showInventory&&<InventorySheet plan={showInventory} data={data} onClose={()=>setShowInventory(null)} cl={cl}/>}

      {/* Plan Editor */}
      {(showNew||selPlan)&&(
        <PlanEditor
          plan={selPlan}
          cid={cid}
          myTids={myTids}
          data={data}
          save={save}
          fire={fire}
          cl={cl}
          onClose={()=>{ setShowNew(false); setSelPlan(null); }}
        />
      )}
    </div>
  );
}

/* =================================================================
   INVENTAR SHEET - Vor dem Training
================================================================= */
function InventorySheet({ plan, data, onClose, cl }) {
  const t = TH(cl);
  const inv = calcInventory(plan.exercises);
  const cats = [...new Set(inv.map(x=>x.cat))];
  const totalMins = (plan.exercises||[]).reduce((s,e)=>s+(e.duration||0),0);

  // Platz-Visualisierung
  const zones = [...new Set((plan.exercises||[]).map(e=>e.zone).filter(Boolean).filter(x=>!x.hidden))];

  const copyList = () => {
    const text = "Inventar für: "+plan.name+"\n\n"+
      cats.map(cat=>
        cat+":\n"+inv.filter(x=>x.cat===cat)
          .map(x=>"  "+x.total+"x "+x.label+(x.color?" ("+x.color+")":""))
          .join("\n")
      ).join("\n\n");
    navigator.clipboard?.writeText(text);
  };

  return (
    <div style={{position:"fixed",inset:0,background:"rgba(0,0,0,.6)",zIndex:900,
      display:"flex",alignItems:"flex-end",justifyContent:"center",backdropFilter:"blur(6px)"}}>
      <div style={{background:"#fff",borderRadius:"22px 22px 0 0",width:"100%",
        maxWidth:520,maxHeight:"90dvh",overflowY:"auto",paddingBottom:40}}>

        <div style={{background:`linear-gradient(135deg,${t.s||"#052e16"},${t.p})`,
          padding:"18px 20px 16px"}}>
          <div style={{color:"rgba(255,255,255,.6)",fontSize:11,fontWeight:700,marginBottom:3}}>
            VOR DEM TRAINING BEREITSTELLEN
          </div>
          <div style={{color:"#fff",fontWeight:900,fontSize:20}}>{plan.name}</div>
          <div style={{color:"rgba(255,255,255,.6)",fontSize:12,marginTop:4}}>
            {(plan.exercises||[]).length} Übungen  {totalMins} Min.
          </div>
        </div>

        <div style={{padding:"18px 20px 0"}}>

          {/* Planskizze */}
          {zones.length>0&&(
            <div style={{marginBottom:16}}>
              <div style={{fontSize:11,fontWeight:800,color:"#64748b",marginBottom:8,letterSpacing:.5}}>
                PLATZBELEGUNG
              </div>
              <FieldPlanView exercises={plan.exercises} cl={cl}/>
            </div>
          )}

          {/* Inventar nach Kategorie */}
          {cats.map(cat=>(
            <div key={cat} style={{marginBottom:14}}>
              <div style={{fontSize:11,fontWeight:800,color:"#64748b",marginBottom:8,
                letterSpacing:.5,textTransform:"uppercase"}}>
                {cat}
              </div>
              <div style={{display:"flex",flexDirection:"column",gap:7}}>
                {inv.filter(x=>x.cat===cat).map(item=>{
                  const matDef = MATERIAL_CATALOG.find(m=>m.id===item.id);
                  const dotCol = item.color ? COLOR_HEX[item.color]||"#64748b" : matDef?.col||"#64748b";
                  return (
                    <div key={item.id+(item.color||"")} style={{display:"flex",alignItems:"center",
                      gap:12,background:"#f8fafc",borderRadius:12,padding:"11px 14px",
                      border:"1.5px solid #e2e8f0"}}>
                      <div style={{width:36,height:36,borderRadius:10,
                        background:dotCol+"20",display:"flex",alignItems:"center",
                        justifyContent:"center",fontWeight:900,fontSize:16,color:dotCol,flexShrink:0}}>
                        {matDef?.icon||"?"}
                      </div>
                      <div style={{flex:1}}>
                        <div style={{fontWeight:700,fontSize:14,color:"#0f172a"}}>
                          {item.label}
                          {item.color&&<span style={{marginLeft:6,background:dotCol+"20",
                            color:dotCol,borderRadius:99,padding:"1px 7px",
                            fontSize:11,fontWeight:700}}>{item.color}</span>}
                        </div>
                        <div style={{fontSize:11,color:"#94a3b8",marginTop:1}}>
                          {item.unit==="Tor"?"Tore benötigt":
                           item.unit==="Ball"?"Baelle":
                           "Stück"}
                        </div>
                      </div>
                      <div style={{width:44,height:44,borderRadius:12,background:dotCol,
                        display:"flex",alignItems:"center",justifyContent:"center",
                        fontWeight:900,fontSize:22,color:"#fff",flexShrink:0}}>
                        {item.total}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ))}

          {inv.length===0&&(
            <div style={{textAlign:"center",padding:"32px",background:"#f8fafc",
              borderRadius:14,border:"1.5px dashed #e2e8f0"}}>
              <p style={{color:"#94a3b8",margin:0}}>Keine Materialien eingetragen</p>
            </div>
          )}

          <div style={{display:"flex",gap:9,marginTop:4}}>
            <button onClick={copyList}
              style={{flex:1,padding:"12px",borderRadius:12,border:"1.5px solid #e2e8f0",
                background:"#fff",fontWeight:700,cursor:"pointer",fontFamily:"inherit",
                color:"#475569"}}>
              Liste kopieren
            </button>
            <button onClick={onClose}
              style={{flex:1,padding:"12px",borderRadius:12,border:"none",background:t.p,
                color:"#fff",fontWeight:800,cursor:"pointer",fontFamily:"inherit"}}>
              Schließen
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

/* =================================================================
   FELD PLAN VISUALISIERUNG
================================================================= */
function FieldPlanView({ exercises, cl }) {
  const t = TH(cl);
  const ZONE_RECTS = {
    full:       {x:0,   y:0,   w:100, h:100},
    half_l:     {x:0,   y:0,   w:50,  h:100},
    half_r:     {x:50,  y:0,   w:50,  h:100},
    third_l:    {x:0,   y:0,   w:33,  h:100},
    third_m:    {x:33,  y:0,   w:34,  h:100},
    third_r:    {x:67,  y:0,   w:33,  h:100},
    quarter_tl: {x:0,   y:0,   w:50,  h:50 },
    quarter_tr: {x:50,  y:0,   w:50,  h:50 },
    quarter_bl: {x:0,   y:50,  w:50,  h:50 },
    quarter_br: {x:50,  y:50,  w:50,  h:50 },
    strafraum:  {x:25,  y:70,  w:50,  h:30 },
    mittelkreis:{x:30,  y:30,  w:40,  h:40 },
  };
  const W = 260, H = 160;

  return (
    <div style={{borderRadius:12,overflow:"hidden",border:"1.5px solid #e2e8f0"}}>
      <svg width="100%" viewBox={`0 0 ${W} ${H}`} style={{display:"block"}}>
        {/* Rasen Hintergrund */}
        <rect width={W} height={H} fill="#16a34a" opacity=".85"/>
        {Array.from({length:6},(_,i)=>(
          <rect key={i} x={0} y={H/6*i} width={W} height={H/12} fill="rgba(0,0,0,.05)"/>
        ))}
        {/* Feldlinien */}
        <rect x={W*.04} y={H*.06} width={W*.92} height={H*.88} rx="2" fill="none" stroke="white" strokeWidth="1.5" opacity=".6"/>
        <line x1={W/2} y1={H*.06} x2={W/2} y2={H*.94} stroke="white" strokeWidth="1" opacity=".4"/>
        <circle cx={W/2} cy={H/2} r={Math.min(W,H)*.1} fill="none" stroke="white" strokeWidth="1" opacity=".4"/>

        {/* Übungs-Zonen */}
        {exercises.filter(ex=>ex.zone&&ZONE_RECTS[ex.zone]).map((ex,i)=>{
          const zr = ZONE_RECTS[ex.zone];
          const cat = EXERCISE_CATS.find(c=>c.id===ex.cat)||EXERCISE_CATS[0];
          const colors = ["#3b82f6","#dc2626","#f59e0b","#7c3aed","#ec4899","#14b8a6"];
          const col = colors[i%colors.length];
          const x = W * zr.x/100;
          const y = H * zr.y/100;
          const w = W * zr.w/100;
          const h = H * zr.h/100;
          return (
            <g key={i}>
              <rect x={x+3} y={y+3} width={w-6} height={h-6} rx="3"
                fill={col} opacity=".4" stroke={col} strokeWidth="1.5" strokeDasharray="4,2"/>
              <text x={x+w/2} y={y+h/2-4} textAnchor="middle"
                fontSize="8" fontWeight="800" fill="white">
                {(ex.name||"").slice(0,12)}
              </text>
              <text x={x+w/2} y={y+h/2+7} textAnchor="middle"
                fontSize="7" fill="white" opacity=".8">
                {ex.duration||0} Min
              </text>
            </g>
          );
        })}
      </svg>
    </div>
  );
}

/* =================================================================
   PLAN EDITOR
================================================================= */
function PlanEditor({ plan, cid, myTids, data, save, fire, cl, onClose }) {
  const t = TH(cl);
  const [name, setName] = useState(plan?.name||"");
  const [tid, setTid]   = useState(plan?.tid||myTids[0]||"");
  const [exercises, setExercises] = useState(plan?.exercises||[]);
  const [showAddEx, setShowAddEx] = useState(false);
  const [editExIdx, setEditExIdx] = useState(null);
  const [showTplBrowser, setShowTplBrowser] = useState(false);
  const [asTemplate, setAsTemplate] = useState(plan?.isTemplate||false);
  const [shareWithAll, setShareWithAll] = useState(plan?.shared||false);
  const myTeams = (data.teams||[]).filter(tm=>myTids.includes(tm.id));

  const savePlan = () => {
    if(!name.trim()) return;
    const rec = { id:plan?.id||uid(), cid, tid, name:name.trim(), exercises, updatedAt:new Date().toISOString(), isTemplate:asTemplate, shared:shareWithAll };
    const plans = data.trainingPlans||[];
    const next = plan ? plans.map(p=>p.id===plan.id?rec:p) : [...plans,rec];
    save({...data, trainingPlans:next});
    fire(plan?"Plan aktualisiert":"Trainingsplan erstellt");
    onClose();
  };
  const delPlan = () => {
    save({...data, trainingPlans:(data.trainingPlans||[]).filter(p=>p.id!==plan?.id)});
    fire("Plan gelöscht"); onClose();
  };
  const delEx = idx => setExercises(ex=>ex.filter((_,i)=>i!==idx));
  const moveEx = (idx,dir) => {
    const arr=[...exercises]; const to=idx+dir;
    if(to<0||to>=arr.length) return;
    [arr[idx],arr[to]]=[arr[to],arr[idx]]; setExercises(arr);
  };
  const totalMins = exercises.reduce((s,e)=>s+(e.duration||0),0);

  return (
    <div style={{position:"fixed",inset:0,background:"rgba(0,0,0,.6)",zIndex:900,
      display:"flex",alignItems:"flex-end",justifyContent:"center",backdropFilter:"blur(6px)"}}>
      <div style={{background:"#fff",borderRadius:"22px 22px 0 0",width:"100%",
        maxWidth:520,maxHeight:"90dvh",display:"flex",flexDirection:"column"}}>

        <div style={{background:t.p,padding:"16px 20px 14px",flexShrink:0,borderRadius:"22px 22px 0 0"}}>
          <div style={{display:"flex",alignItems:"center",gap:10}}>
            <div style={{flex:1,color:"#fff",fontWeight:900,fontSize:18}}>
              {plan?"Plan bearbeiten":"Neuer Trainingsplan"}
            </div>
            <button onClick={onClose} style={{width:32,height:32,borderRadius:10,
              background:"rgba(255,255,255,.2)",border:"none",color:"#fff",
              cursor:"pointer",fontSize:18,fontWeight:700}}>x</button>
          </div>
        </div>

        <div style={{flex:1,overflowY:"auto",padding:"16px 20px 0"}}>
          <input value={name} onChange={e=>setName(e.target.value)} placeholder="Name des Trainingsplans"
            style={{width:"100%",padding:"12px 14px",fontSize:15,fontWeight:700,
              border:`1.5px solid ${name?"#16a34a":"#e2e8f0"}`,borderRadius:12,
              outline:"none",marginBottom:12,boxSizing:"border-box"}}/>

          {myTeams.length>1&&(
            <select value={tid} onChange={e=>setTid(e.target.value)}
              style={{width:"100%",padding:"11px 14px",fontSize:14,border:"1.5px solid #e2e8f0",
                borderRadius:12,outline:"none",marginBottom:12,boxSizing:"border-box"}}>
              {myTeams.map(tm=><option key={tm.id} value={tm.id}>{tm.name}</option>)}
            </select>
          )}

          {/* Übungen */}
          <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:8}}>
            <div style={{fontWeight:700,fontSize:13,color:"#64748b"}}>
              {exercises.length} Übungen  {totalMins} Min.
            </div>
            <div style={{display:"flex",gap:7}}>
              <button onClick={()=>setShowTplBrowser(true)}
                style={{padding:"7px 12px",borderRadius:9,border:"1.5px solid #e2e8f0",background:"#f8fafc",color:"#475569",fontWeight:700,fontSize:12,cursor:"pointer",fontFamily:"inherit"}}>
                Aus Bibliothek
              </button>
              <button onClick={()=>{setEditExIdx(null);setShowAddEx(true);}}
                style={{padding:"7px 14px",borderRadius:9,border:"none",background:t.p,
                  color:"#fff",fontWeight:700,fontSize:12,cursor:"pointer",fontFamily:"inherit"}}>
                + Eigene
              </button>
            </div>
          </div>

          {exercises.length===0&&(
            <div style={{textAlign:"center",padding:"28px",background:"#f8fafc",
              borderRadius:12,border:"1.5px dashed #e2e8f0",marginBottom:12}}>
              <p style={{color:"#94a3b8",margin:0,fontSize:13}}>Noch keine Übungen</p>
            </div>
          )}

          {exercises.map((ex,i)=>{
            const cat = EXERCISE_CATS.find(c=>c.id===ex.cat)||EXERCISE_CATS[0];
            return (
              <div key={i} style={{background:"#fff",borderRadius:13,border:`1.5px solid ${cat.col}40`,
                padding:"11px 13px",marginBottom:8}}>
                <div style={{display:"flex",alignItems:"center",gap:8}}>
                  <div style={{width:8,height:8,borderRadius:"50%",background:cat.col,flexShrink:0}}/>
                  <div style={{flex:1}}>
                    <div style={{fontWeight:700,fontSize:13,color:"#0f172a"}}>{ex.name||"Übung"}</div>
                    <div style={{fontSize:11,color:"#94a3b8",marginTop:1}}>
                      {cat.label}  {ex.duration||0} Min.
                      {ex.zone&&"  "+FIELD_ZONES.find(z=>z.id===ex.zone)?.label}
                    </div>
                  </div>
                  <div style={{display:"flex",gap:4}}>
                    <button onClick={()=>moveEx(i,-1)} style={{width:24,height:24,borderRadius:7,border:"1.5px solid #e2e8f0",background:"#fff",cursor:"pointer",fontSize:11,fontWeight:700}}>^</button>
                    <button onClick={()=>moveEx(i,1)}  style={{width:24,height:24,borderRadius:7,border:"1.5px solid #e2e8f0",background:"#fff",cursor:"pointer",fontSize:11,fontWeight:700}}>v</button>
                    <button onClick={()=>{setEditExIdx(i);setShowAddEx(true);}} style={{width:24,height:24,borderRadius:7,background:"#eff6ff",border:"none",color:"#2563eb",cursor:"pointer",fontSize:11,fontWeight:700}}>E</button>
                    <button onClick={()=>delEx(i)} style={{width:24,height:24,borderRadius:7,background:"#fee2e2",border:"none",color:"#dc2626",cursor:"pointer",fontSize:11,fontWeight:800}}>x</button>
                  </div>
                </div>
                {(ex.material||[]).length>0&&(
                  <div style={{display:"flex",gap:5,flexWrap:"wrap",marginTop:7}}>
                    {ex.material.map((m,mi)=>{
                      const matDef=MATERIAL_CATALOG.find(x=>x.id===m.id);
                      const col=m.color?COLOR_HEX[m.color]||"#64748b":matDef?.col||"#64748b";
                      return (
                        <div key={mi} style={{background:col+"15",borderRadius:99,
                          padding:"2px 8px",fontSize:10,fontWeight:700,color:col}}>
                          {m.qty||1}x {m.label||matDef?.label}{m.color?" ("+m.color+")":""}
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })}
        </div>

        <div style={{padding:"12px 20px 32px",borderTop:"1px solid #f1f5f9",flexShrink:0,display:"flex",gap:9}}>
          {plan&&<button onClick={delPlan} style={{padding:"12px",borderRadius:12,border:"none",background:"#fee2e2",color:"#dc2626",fontWeight:700,cursor:"pointer",fontFamily:"inherit"}}>Löschen</button>}
          <button onClick={onClose} style={{flex:1,padding:"12px",borderRadius:12,border:"1.5px solid #e2e8f0",background:"#fff",fontWeight:700,cursor:"pointer",fontFamily:"inherit"}}>Abbrechen</button>
          <button onClick={savePlan} disabled={!name.trim()} style={{flex:2,padding:"12px",borderRadius:12,border:"none",background:name.trim()?t.p:"#e2e8f0",color:name.trim()?"#fff":"#94a3b8",fontWeight:800,cursor:"pointer",fontFamily:"inherit"}}>Speichern</button>
        </div>
      </div>

      {showTplBrowser&&<TemplateBrowser
        onSelect={tpl=>{
          const ex = {
            name:tpl.name, cat:tpl.cat||"technik",
            duration:tpl.duration||15, zone:tpl.fieldZone||"full",
            intensity:tpl.intensity||5, skills:tpl.skills||[],
            description:tpl.description||"", material:tpl.material||[],
            fromTemplate:tpl.id,
          };
          setExercises(arr=>[...arr,ex]);
          setShowTplBrowser(false);
          fire("Übung aus Bibliothek hinzugefügt: "+tpl.name);
        }}
        cid={cid} myTids={myTids} data={data} cl={cl}
        onClose={()=>setShowTplBrowser(false)}
      />}
      {showAddEx&&<ExerciseEditor
        ex={editExIdx!==null?exercises[editExIdx]:null}
        onSave={ex=>{
          if(editExIdx!==null) setExercises(arr=>arr.map((e,i)=>i===editExIdx?ex:e));
          else setExercises(arr=>[...arr,ex]);
          setShowAddEx(false); setEditExIdx(null);
        }}
        onClose={()=>{setShowAddEx(false);setEditExIdx(null);}}
        cl={cl}
      />}
    </div>
  );
}

/* =================================================================
   UEBUNG EDITOR
================================================================= */
function ExerciseEditor({ ex, onSave, onClose, cl }) {
  const t = TH(cl);
  const [f, setF] = useState({
    name:ex?.name||"", cat:ex?.cat||"warmup",
    duration:ex?.duration||10, zone:ex?.zone||"full",
    description:ex?.description||"", material:ex?.material||[],
  });
  const u = p => setF(prev=>({...prev,...p}));
  const [showMat, setShowMat] = useState(false);
  const [matDraft, setMatDraft] = useState({id:"",qty:2,color:""});
  const matCats = [...new Set(MATERIAL_CATALOG.map(m=>m.cat))];

  const addMat = () => {
    if(!matDraft.id) return;
    const def = MATERIAL_CATALOG.find(m=>m.id===matDraft.id);
    const mat = {...matDraft, label:def?.label||matDraft.id, cat:def?.cat||"Sonstiges"};
    u({material:[...f.material,mat]});
    setMatDraft({id:"",qty:2,color:""});
    setShowMat(false);
  };
  const delMat = idx => u({material:f.material.filter((_,i)=>i!==idx)});

  return (
    <div style={{position:"fixed",inset:0,background:"rgba(0,0,0,.7)",zIndex:910,
      display:"flex",alignItems:"flex-end",justifyContent:"center"}}>
      <div style={{background:"#fff",borderRadius:"22px 22px 0 0",width:"100%",
        maxWidth:520,maxHeight:"88dvh",overflowY:"auto",paddingBottom:44}}>
        <div style={{background:t.p,padding:"16px 20px 14px",borderRadius:"22px 22px 0 0"}}>
          <div style={{display:"flex",alignItems:"center",gap:10}}>
            <div style={{flex:1,color:"#fff",fontWeight:900,fontSize:17}}>
              {ex?"Übung bearbeiten":"Neue Übung"}
            </div>
            <button onClick={onClose} style={{width:30,height:30,borderRadius:9,background:"rgba(255,255,255,.2)",border:"none",color:"#fff",cursor:"pointer",fontWeight:700}}>x</button>
          </div>
        </div>
        <div style={{padding:"16px 20px 0"}}>
          <input value={f.name} onChange={e=>u({name:e.target.value})} placeholder="Name der Übung"
            style={{width:"100%",padding:"12px 14px",fontSize:15,fontWeight:700,
              border:"1.5px solid #e2e8f0",borderRadius:12,outline:"none",
              marginBottom:12,boxSizing:"border-box"}}/>

          {/* Kategorie */}
          <div style={{fontSize:11,fontWeight:800,color:"#64748b",marginBottom:8}}>KATEGORIE</div>
          <div style={{display:"flex",gap:6,flexWrap:"wrap",marginBottom:12}}>
            {EXERCISE_CATS.map(cat=>(
              <button key={cat.id} onClick={()=>u({cat:cat.id})}
                style={{padding:"7px 12px",borderRadius:99,border:`2px solid ${f.cat===cat.id?cat.col:"#e2e8f0"}`,
                  background:f.cat===cat.id?cat.bg:"#fff",color:f.cat===cat.id?cat.col:"#64748b",
                  fontWeight:f.cat===cat.id?800:600,fontSize:12,cursor:"pointer",fontFamily:"inherit"}}>
                {cat.label}
              </button>
            ))}
          </div>

          {/* Dauer */}
          <div style={{display:"flex",alignItems:"center",gap:12,marginBottom:12}}>
            <div style={{fontSize:11,fontWeight:800,color:"#64748b"}}>DAUER</div>
            <div style={{display:"flex",alignItems:"center",gap:8,flex:1,justifyContent:"center"}}>
              <button onClick={()=>u({duration:Math.max(5,f.duration-5)})}
                style={{width:34,height:34,borderRadius:10,border:"1.5px solid #e2e8f0",background:"#f8fafc",cursor:"pointer",fontSize:18,fontWeight:800}}>-</button>
              <span style={{fontWeight:900,fontSize:22,color:t.p,minWidth:60,textAlign:"center"}}>{f.duration} Min</span>
              <button onClick={()=>u({duration:Math.min(60,f.duration+5)})}
                style={{width:34,height:34,borderRadius:10,border:"1.5px solid #e2e8f0",background:"#f8fafc",cursor:"pointer",fontSize:18,fontWeight:800}}>+</button>
            </div>
          </div>

          {/* Feldzone */}
          <div style={{fontSize:11,fontWeight:800,color:"#64748b",marginBottom:8}}>BEREICH AUF DEM FELD</div>
          <select value={f.zone} onChange={e=>u({zone:e.target.value})}
            style={{width:"100%",padding:"11px 14px",fontSize:14,border:"1.5px solid #e2e8f0",
              borderRadius:12,outline:"none",marginBottom:12,boxSizing:"border-box"}}>
            {FIELD_ZONES.map(z=><option key={z.id} value={z.id}>{z.label}</option>)}
          </select>

          {/* Material */}
          <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:8}}>
            <div style={{fontSize:11,fontWeight:800,color:"#64748b"}}>MATERIAL</div>
            <button onClick={()=>setShowMat(true)}
              style={{padding:"5px 12px",borderRadius:8,border:"none",background:t.p+"18",
                color:t.p,fontWeight:700,fontSize:12,cursor:"pointer",fontFamily:"inherit"}}>
              + Hinzufügen
            </button>
          </div>
          {f.material.length===0&&(
            <div style={{padding:"12px",background:"#f8fafc",borderRadius:10,
              border:"1.5px dashed #e2e8f0",marginBottom:12,textAlign:"center",
              fontSize:12,color:"#94a3b8"}}>
              Kein Material eingetragen
            </div>
          )}
          <div style={{display:"flex",flexWrap:"wrap",gap:6,marginBottom:12}}>
            {f.material.map((m,i)=>{
              const def=MATERIAL_CATALOG.find(x=>x.id===m.id);
              const col=m.color?COLOR_HEX[m.color]||"#64748b":def?.col||"#64748b";
              return (
                <div key={i} style={{display:"flex",alignItems:"center",gap:5,
                  background:col+"15",borderRadius:99,padding:"5px 10px"}}>
                  <span style={{fontSize:12,fontWeight:700,color:col}}>
                    {m.qty||1}x {m.label||def?.label}{m.color?" ("+m.color+")":""}
                  </span>
                  <button onClick={()=>delMat(i)}
                    style={{width:16,height:16,borderRadius:"50%",background:col,
                      border:"none",color:"#fff",fontSize:10,cursor:"pointer",
                      display:"flex",alignItems:"center",justifyContent:"center",fontWeight:800}}>
                    x
                  </button>
                </div>
              );
            })}
          </div>

          {/* Material Auswahl */}
          {showMat&&(
            <div style={{background:"#f8fafc",borderRadius:14,padding:"14px",
              border:"1.5px solid #e2e8f0",marginBottom:12}}>
              <div style={{fontSize:11,fontWeight:800,color:"#64748b",marginBottom:8}}>MATERIAL WAEHLEN</div>
              {matCats.map(cat=>(
                <div key={cat} style={{marginBottom:10}}>
                  <div style={{fontSize:10,color:"#94a3b8",fontWeight:700,marginBottom:5}}>{cat.toUpperCase()}</div>
                  <div style={{display:"flex",flexWrap:"wrap",gap:5}}>
                    {MATERIAL_CATALOG.filter(m=>m.cat===cat).map(m=>(
                      <button key={m.id} onClick={()=>setMatDraft(p=>({...p,id:m.id}))}
                        style={{padding:"5px 10px",borderRadius:8,
                          border:`1.5px solid ${matDraft.id===m.id?m.col:"#e2e8f0"}`,
                          background:matDraft.id===m.id?m.col+"15":"#fff",
                          color:matDraft.id===m.id?m.col:"#475569",
                          fontWeight:matDraft.id===m.id?700:500,fontSize:12,
                          cursor:"pointer",fontFamily:"inherit"}}>
                        {m.icon} {m.label}
                      </button>
                    ))}
                  </div>
                </div>
              ))}
              {matDraft.id&&(()=>{
                const def=MATERIAL_CATALOG.find(m=>m.id===matDraft.id);
                return (
                  <div style={{display:"flex",gap:8,alignItems:"center",marginTop:10,flexWrap:"wrap"}}>
                    <div style={{display:"flex",alignItems:"center",gap:6}}>
                      <button onClick={()=>setMatDraft(p=>({...p,qty:Math.max(1,(p.qty||1)-1)}))}>-</button>
                      <span style={{fontWeight:800,fontSize:16,minWidth:30,textAlign:"center"}}>{matDraft.qty||1}</span>
                      <button onClick={()=>setMatDraft(p=>({...p,qty:(p.qty||1)+1}))}>+</button>
                    </div>
                    {def?.canColor&&(
                      <select value={matDraft.color||""} onChange={e=>setMatDraft(p=>({...p,color:e.target.value}))}
                        style={{padding:"6px 10px",fontSize:13,border:"1.5px solid #e2e8f0",borderRadius:9,outline:"none"}}>
                        <option value="">Farbe (optional)</option>
                        {COLORS_DE.map(col=><option key={col} value={col}>{col}</option>)}
                      </select>
                    )}
                    <button onClick={addMat}
                      style={{padding:"7px 14px",borderRadius:9,border:"none",background:t.p,
                        color:"#fff",fontWeight:700,fontSize:13,cursor:"pointer",fontFamily:"inherit"}}>
                      Hinzufügen
                    </button>
                  </div>
                );
              })()}
            </div>
          )}
        </div>

        <div style={{padding:"12px 20px 0",display:"flex",gap:9}}>
          <button onClick={onClose} style={{flex:1,padding:"12px",borderRadius:12,border:"1.5px solid #e2e8f0",background:"#fff",fontWeight:700,cursor:"pointer",fontFamily:"inherit"}}>Abbrechen</button>
          <button onClick={()=>onSave(f)} disabled={!f.name.trim()}
            style={{flex:2,padding:"12px",borderRadius:12,border:"none",
              background:f.name.trim()?t.p:"#e2e8f0",
              color:f.name.trim()?"#fff":"#94a3b8",
              fontWeight:800,cursor:"pointer",fontFamily:"inherit"}}>
            Übung speichern
          </button>
        </div>
      </div>
    </div>
  );
}


// TRAINING LIBRARY - Vollstaendige Vorlagen-Datenbank
// Jede Vorlage hat: id, name, category, ageGroups, duration, intensity(1-10),
//   skills (was wird trainiert), description, coaching_points, variations,
//   material, fieldZone, playerCount, minPlayers

const SKILLS = {
  // TECHNISCH
  ballkontrolle: { label:"Ballkontrolle",  cat:"Technik",  col:"#2563eb" },
  dribbling:     { label:"Dribbling",      cat:"Technik",  col:"#2563eb" },
  passen:        { label:"Passspiel",      cat:"Technik",  col:"#2563eb" },
  schuss:        { label:"Torabschluss",   cat:"Technik",  col:"#2563eb" },
  kopfball:      { label:"Kopfballspiel",  cat:"Technik",  col:"#2563eb" },
  // TAKTISCH
  raumaufteilung:{ label:"Raumaufteilung", cat:"Taktik",   col:"#7c3aed" },
  pressing:      { label:"Pressing",       cat:"Taktik",   col:"#7c3aed" },
  umschalten:    { label:"Umschalten",     cat:"Taktik",   col:"#7c3aed" },
  standards:     { label:"Standards",      cat:"Taktik",   col:"#7c3aed" },
  verteidigung:  { label:"Verteidigung",   cat:"Taktik",   col:"#7c3aed" },
  // ATHLETISCH
  schnelligkeit: { label:"Schnelligkeit",  cat:"Athletik", col:"#dc2626" },
  ausdauer:      { label:"Ausdauer",       cat:"Athletik", col:"#dc2626" },
  kraft:         { label:"Kraft",          cat:"Athletik", col:"#dc2626" },
  koordination:  { label:"Koordination",   cat:"Athletik", col:"#dc2626" },
  wendigkeit:    { label:"Wendigkeit",     cat:"Athletik", col:"#dc2626" },
  // MENTAL
  spielintelligenz:{ label:"Spielintelligenz",cat:"Mental",col:"#d97706" },
  zweikampf:     { label:"Zweikampfstärke",cat:"Mental",  col:"#d97706" },
  teamarbeit:    { label:"Teamarbeit",     cat:"Mental",   col:"#d97706" },
  konzentration: { label:"Konzentration",  cat:"Mental",   col:"#d97706" },
};

// Altersgruppen-Codes
const AGE_GROUPS = {
  bambini: "Bambini (U6-U8)",
  g: "G-Jugend (U7-U8)",
  f: "F-Jugend (U9-U10)",
  e: "E-Jugend (U10-U11)",
  d: "D-Jugend (U12-U13)",
  c: "C-Jugend (U14-U15)",
  ba: "B/A-Jugend (U16-U19)",
  senioren: "Senioren",
  altherren: "Alt-Herren",
  all: "Alle Altersgruppen",
};

const TRAINING_TEMPLATES = [

// ================================================================
// AUFWAERMEN (8 Vorlagen)
// ================================================================
{
  id:"aw_01", cat:"warmup", name:"Bewegungsschule mit Ball",
  age:["bambini","g","f"],
  duration:15, intensity:3,
  skills:["koordination","ballkontrolle"],
  description:`Die Spieler bewegen sich frei im Feld und fuehren auf Zuruf des Trainers verschiedene Bewegungsaufgaben mit dem Ball durch. Tippen, Rollen, Hochhalten.`,
  coaching:`Kein Leistungsdruck. Jeder macht in seinem eigenen Tempo. Lob und Ermutigung stehen im Vordergrund. Kreative Lösungen der Kinder unbedingt anerkennen.`,
  variations:`Mit Farben arbeiten (gelbes Hütchen = hochheben, rotes = stoppen). Musik einsetzen um Stimmung zu foerdern.`,
  minPlayers:4, fieldZone:"full",
  material:[{id:"ball_fuss",qty:1,label:"Fußball",cat:"Baelle"},{id:"huetchen",qty:8,color:"gelb",label:"Hütchen",cat:"Markierung"}],
  ageNote:"Perfekt für Bambinis und G-Jugend. Spielerischer Einstieg ohne taktischen Anspruch.",
},
{
  id:"aw_02", cat:"warmup", name:"Fangspiel mit Freiloesen",
  age:["g","f","e"],
  duration:10, intensity:4,
  skills:["schnelligkeit","wendigkeit","teamarbeit"],
  description:`2 Faenger jagen die Gruppe. Gefangene werden durch Unterlaufen der gespreizten Beine eines Mitspielers befreit. Variante: Mit Ball unter dem Arm laufen.`,
  coaching:`Faenger nach 2 Min tauschen. Auf Mitspieler-Kommunikation achten. Befreien als Teamaktion betonen.`,
  variations:`Eisbaer-Fangis: Gefangene stellen sich mit gespreizten Armen hin. Nur Paare können befreien.`,
  minPlayers:8, fieldZone:"half_l",
  material:[],
  ageNote:"F und E Jugend ideal. Foerdert Sozialverhalten und Koerperkontrolle durch spielerische Dynamik.",
},
{
  id:"aw_03", cat:"warmup", name:"Koordinationsleiter - Kombiniert",
  age:["e","d","c","ba"],
  duration:12, intensity:5,
  skills:["koordination","schnelligkeit","konzentration"],
  description:`Verschiedene Laufmuster durch die Koordinationsleiter: Einbeinig, Seitgallopp, Kreuzschritt, Doppelschritt. Im Anschluss Sprint um eine Pylone.`,
  coaching:`Qualitaet vor Geschwindigkeit. Korrekte Fußarbeit beobachten. Arme aktiv einsetzen. Nach Technikbeherrschung Tempo steigern.`,
  variations:`Mit Ball: Ballannahme nach Leiter und direkte Weiterverarbeitung. Reaktionstraining: Trainer zeigt Richtung erst beim Austritt aus der Leiter.`,
  minPlayers:4, fieldZone:"third_m",
  material:[{id:"koordleiter",qty:2,label:"Koordinationsleiter",cat:"Markierung"},{id:"pylone",qty:6,color:"orange",label:"Pylone",cat:"Markierung"}],
  ageNote:"Ab E-Jugend geeignet. Jueingere Kinder können Muster noch nicht zuverlssig reproduzieren.",
},
{
  id:"aw_04", cat:"warmup", name:"Rondos 4 gegen 1",
  age:["d","c","ba","senioren"],
  duration:10, intensity:5,
  skills:["passen","raumaufteilung","spielintelligenz"],
  description:`4 Spieler halten den Ball gegen 1 Störer in einem Quadrat (ca. 8x8 Meter). Maximal 2 Kontakte. Störer wechselt nach Ballgewinn oder 5 Ballverlusten.`,
  coaching:`Dreieck zum Ball bilden. Anspielstationen öffnen. Tempo variieren. Passweg antaeuschen. 'Doppelpass als Fluchtweg'.`,
  variations:`3v1 für höheren Anspruch. 5v2 für Einsteiger. Einrueckung fordern wenn Störer presst.`,
  minPlayers:5, fieldZone:"mittelkreis",
  material:[{id:"ball_fuss",qty:2,label:"Fußball",cat:"Baelle"},{id:"huetchen",qty:4,color:"gelb",label:"Hütchen",cat:"Markierung"}],
  ageNote:"Ab D-Jugend. Das klassische Aufwaerm-Rondo. Baut technisches und taktisches Verstaendnis gleichzeitig auf.",
},

// ================================================================
// TECHNIKTRAINING (12 Vorlagen)
// ================================================================
{
  id:"tech_01", cat:"technik", name:"Passstaffel mit Positionswechsel",
  age:["f","e","d"],
  duration:20, intensity:4,
  skills:["passen","ballkontrolle","koordination"],
  description:`Zwei Gruppen stehen sich in 15 Meter Abstand gegenüber. Spieler A passt zu Spieler B und laeuft ans Ende der gegenüberliegenden Gruppe. B nimmt an, passt zu C und laeuft hinterher. Varianten: Innenseite, Aussenrist, Flachpass, hoher Ball.`,
  coaching:`Standfuss neben den Ball setzen. Geschlossene Hufte bei Innenseite. Auge auf den Ball beim Kontakt. Annahme mit dem ersten Kontakt in die gewuenschte Richtung.`,
  variations:`Mit Huerden dazwischen. Direktpass erzwingen. Doppelpass einbauen. Annahme mit Schwacher Fuß.`,
  minPlayers:6, fieldZone:"half_l",
  material:[{id:"ball_fuss",qty:4,label:"Fußball",cat:"Baelle"},{id:"huetchen",qty:4,color:"rot",label:"Hütchen",cat:"Markierung"}],
  ageNote:"F-Jugend: Nur Innenseite. E-Jugend: Aussenrist als Erweiterung. D-Jugend: Schwacher Fuß pflicht.",
},
{
  id:"tech_02", cat:"technik", name:"Dribblingparcours mit Abschluss",
  age:["g","f","e","d"],
  duration:25, intensity:5,
  skills:["dribbling","torabschluss","ballkontrolle"],
  description:`Parcours aus Pylonen und Stangen: Slalom-Dribbling, Linienüberquerung, Tempowechsel, abschließendes Schusstraining auf kleines oder großes Tor. Jeder Spieler hat einen Ball.`,
  coaching:`Kopf hoch beim Dribbling. Ball eng fuehren. Bremsen und Beschleunigen überraschen den Gegner. Beim Torabschluss: Auge auf den Ball, Schwungbein weit nach.`,
  variations:`Zeitwettbewerb einbauen. Abschluss mit schwachem Fuß. Dribblingduell nach Parcours.`,
  minPlayers:4, fieldZone:"strafraum",
  material:[{id:"pylone",qty:8,color:"gelb",label:"Pylone",cat:"Markierung"},{id:"stange",qty:4,label:"Huepfstange",cat:"Markierung"},{id:"goal_small",qty:2,label:"Kleines Tor",cat:"Tore"},{id:"ball_fuss",qty:1,label:"Fußball",cat:"Baelle"}],
  ageNote:"G/F: Einfacher Slalom ohne Zeitdruck. E: Mit Tempodribbling. D: Gegenspieler nach Parcours.",
},
{
  id:"tech_03", cat:"technik", name:"Wandpass-Training (Kombination)",
  age:["e","d","c"],
  duration:20, intensity:5,
  skills:["passen","ballkontrolle","spielintelligenz"],
  description:`Spieler A passt zu B, laeuft an und erhaelt den Wandpass. Weiter zum nächsten Spieler oder Tor. Kombinationen werden schrittweise erweitert: 1-2, Doppelpass mit Richtungswechsel, Hereingabe und Abschluss.`,
  coaching:`Timing des Anlaufwegs entscheidend. Wandpassgeber sofort anspielbereit. Abstand kontrollieren. Tempo der Kombination erhöhen wenn sicher.`,
  variations:`Gegen passive Verteidigung. Doppelpass und Hereingabe kombinieren. 3-Mann-Kombination.`,
  minPlayers:6, fieldZone:"half_r",
  material:[{id:"ball_fuss",qty:3,label:"Fußball",cat:"Baelle"},{id:"goal_medium",qty:1,label:"Mittleres Tor",cat:"Tore"}],
  ageNote:"E-Jugend: Einfache 1-2 Kombinationen. D: Richtungswechsel. C: Komplexe Kombinationen mit Gegner.",
},
{
  id:"tech_04", cat:"technik", name:"Schusstechnik - Low Drive und Vollspann",
  age:["d","c","ba"],
  duration:25, intensity:6,
  skills:["torabschluss","ballkontrolle"],
  description:`Stationaerer Abschluss aus verschiedenen Distanzen: 11m, 16m, Einlauf-Abschluss. Low Drive: Flacher Ball mit Innenrist. Vollspann: Getretener Schuss mit dem Spann. Zielscheiben im Tor als Zielhilfe.`,
  coaching:`Anlaufwinkel 30-45 Grad. Standfuss schulterbreit neben Ball. Schussknie beim Aufprall über dem Ball. Durchschwingen des Schussbeins. Treffsicherheit vor Haerte.`,
  variations:`Schuss nach Flanke. Nach 1-2 Kombinationen. Aus der Drehung. Halbvolley.`,
  minPlayers:4, fieldZone:"strafraum",
  material:[{id:"ball_fuss",qty:6,label:"Fußball",cat:"Baelle"},{id:"goal_large",qty:1,label:"Großes Tor",cat:"Tore"},{id:"huetchen",qty:4,color:"gelb",label:"Hütchen",cat:"Markierung"}],
  ageNote:"Ab D-Jugend. Technikvermittlung vor Wettkampfsituation. Torwart optional einbauen ab C-Jugend.",
},
{
  id:"tech_05", cat:"technik", name:"Kopfballtraining - Grundtechnik",
  age:["d","c","ba","senioren"],
  duration:20, intensity:5,
  skills:["kopfballspiel","zweikampf"],
  description:`Kopfball aus dem Stand: Augenkontakt auf Ball halten. Kopfball aus der Bewegung mit Anlauf. Kopfball aus dem Sprung. Partner haelt Ball, Spieler nickt ihn ins Netz. Kopfball-Duell als Abschluss.`,
  coaching:`Stirn trifft Ball - nicht Scheitel. Nacken anspannen. Mit dem Ball nach vorne arbeiten. Augen öffnet halten. Arme für Balance ausbreiten.`,
  variations:`Kopfball nach Flanke. Kopfball-Torschuss aus 7m. Kopfball weiterleiten zu Mitspieler.`,
  minPlayers:4, fieldZone:"strafraum",
  material:[{id:"ball_fuss",qty:4,label:"Fußball",cat:"Baelle"},{id:"goal_large",qty:1,label:"Großes Tor",cat:"Tore"}],
  ageNote:"Erst ab D-Jugend (U12+). Kopfball bei juengeren Kindern aufgrund der Gehirnentwicklung vermeiden.",
},
{
  id:"tech_06", cat:"technik", name:"Schwacher Fuß - Intensivtraining",
  age:["e","d","c","ba"],
  duration:20, intensity:5,
  skills:["ballkontrolle","passen","torabschluss"],
  description:`Komplette Trainingseinheit ausschließlich mit dem schwachen Fuß. Zuspiel, Annahme, Dribbling, Torabschluss. Ziel: Schwachen Fuß zum zweiten starken Fuß entwickeln.`,
  coaching:`Geduld zeigen. Fehler sind Teil des Lernprozesses. Nicht auslachen. Kleiner Abstand zuerst, dann steigern. Auch Profis haben einen schwacheren Fuß trainiert.`,
  variations:`1v1 Situationen nur schwacher Fuß. Zonen-Spiel: In bestimmten Zonen nur schwacher Fuß erlaubt.`,
  minPlayers:4, fieldZone:"half_l",
  material:[{id:"ball_fuss",qty:1,label:"Fußball",cat:"Baelle"},{id:"goal_small",qty:4,label:"Kleines Tor",cat:"Tore"}],
  ageNote:"Ab E-Jugend regelmaessig einbauen. 1x pro Woche schwacher Fuß macht den Unterschied auf Dauer.",
},

// ================================================================
// TAKTIKTRAINING (10 Vorlagen)
// ================================================================
{
  id:"takt_01", cat:"taktik", name:"Pressing - Ballorientieres Verteidigen",
  age:["c","ba","senioren"],
  duration:30, intensity:8,
  skills:["pressing","verteidigung","teamarbeit","umschalten"],
  description:`5v5 oder 7v7 mit zwei Mannschaften. Beim Ballverlust sofort Gegenpressing einleiten. Erste Spieler setzt Druck auf Ballträger, Mitspieler schließen Passoptionen ab. Ziel: Ball innerhalb 5 Sekunden zurückgewinnen.`,
  coaching:`Kommunikation ist alles: "Druck!", "Weg!". Kompakte Staffelung. Nicht einzeln anlaufen. 3-Sekunden-Regel: Entscheidung nach Ballverlust treffen. Pressing-Falle an der Seitenlinie nutzen.`,
  variations:`Mit Zonen: Pressing nur in bestimmten Feldbereichen erzwungen. Gegenpressing-Wettbewerb: Welches Team gewinnt Ball schneller zurück.`,
  minPlayers:10, fieldZone:"full",
  material:[{id:"ball_fuss",qty:3,label:"Fußball",cat:"Baelle"},{id:"leibchen",qty:6,color:"rot",label:"Leibchen",cat:"Leibchen"},{id:"huetchen",qty:8,color:"gelb",label:"Hütchen",cat:"Markierung"}],
  ageNote:"Erst ab C-Jugend sinnvoll. Taktisches Verstaendnis benötigt gewisse Reife. B/A und Senioren profitieren maximal.",
},
{
  id:"takt_02", cat:"taktik", name:"Umschaltspiel - Offensive nach Ballgewinn",
  age:["d","c","ba"],
  duration:25, intensity:7,
  skills:["umschalten","schnelligkeit","spielintelligenz","raumaufteilung"],
  description:`8v8 auf großem Feld. Nach Ballgewinn: sofortiger vertikaler Pass in die Tiefe. Stürmerpaar sucht hinter die Abwehrlinie. Mittelfeldspieler folgen in zweite Welle. Ziel: Tor innerhalb 6 Sekunden nach Ballgewinn.`,
  coaching:`Tiefenlaeufe timen - nicht zu früh starten. Vertikaler Pass als erste Option. Breite halten für Überzahl. "Los!" als Signal für Umschaltmoment.`,
  variations:`Gegenpressing der angreifenden Mannschaft als Reaktion. Umschaltspiel auf Konter beschraenken.`,
  minPlayers:10, fieldZone:"full",
  material:[{id:"ball_fuss",qty:4,label:"Fußball",cat:"Baelle"},{id:"leibchen",qty:5,color:"blau",label:"Leibchen",cat:"Leibchen"},{id:"goal_large",qty:2,label:"Großes Tor",cat:"Tore"}],
  ageNote:"D-Jugend: Vereinfacht ohne Pressing-Reaktion. C: Vollstaendiges Umschaltspiel mit Gegenpressing.",
},
{
  id:"takt_03", cat:"taktik", name:"Standardsituationen - Ecken angreifen",
  age:["d","c","ba","senioren"],
  duration:20, intensity:4,
  skills:["standards","kopfballspiel","raumaufteilung"],
  description:`Drei verschiedene Eckvarianten einstudieren: Kurze Ecke mit Hereingabe, Flanke in den Fuenfmeterraum (erster Pfosten), Flanke an den zweiten Pfosten. Laufwege für jeden Spieler festlegen.`,
  coaching:`Laufwege auswendig lernen. Timing des Anlaufs entscheidend. Erste Pfosten: Schuss. Zweiter Pfosten: Kopfball oder Schiessen. Kurze Ecke: Überraschungsmoment nutzen.`,
  variations:`Halbfeldflanken als Erweiterung. Direktes Einleiten nach Standardgewinn. Eckball-Gegentraining: Verteidiger lernen Zonen und Manndeckung.`,
  minPlayers:8, fieldZone:"strafraum",
  material:[{id:"ball_fuss",qty:4,label:"Fußball",cat:"Baelle"},{id:"goal_large",qty:1,label:"Großes Tor",cat:"Tore"},{id:"huetchen",qty:6,color:"weiss",label:"Hütchen",cat:"Markierung"}],
  ageNote:"D-Jugend: 2 einfache Varianten. Senioren: 4-5 eingearbeitete Varianten für den Spielbetrieb.",
},
{
  id:"takt_04", cat:"taktik", name:"Abseitsfalle - Koordiniertes Herausruecken",
  age:["c","ba","senioren"],
  duration:20, intensity:6,
  skills:["verteidigung","raumaufteilung","teamarbeit","konzentration"],
  description:`Abwehrkette von 4 Spielern lernt koordiniert herauszurücken. Signal des Innenverteidigers oder Torwarts. Alle vier Verteidiger ruecken gleichzeitig heraus. Stürmer werden ins Abseits gelockt.`,
  coaching:`Kommunikation: "Raus!" als Kommando. Linie halten. Kein Zoegern. Im Zweifelsfall: Lieber nicht rausruecken. Nach abgebloecktem Schuss sofort auf Linie. Torwart hat Sicht - sein Wort gilt.`,
  variations:`Mit angreifenden Spielern die versuchen durchzubrechen. Signalvarianten: Klatschen vs. Ruf.`,
  minPlayers:6, fieldZone:"half_r",
  material:[{id:"leibchen",qty:4,color:"gruen",label:"Leibchen",cat:"Leibchen"},{id:"ball_fuss",qty:3,label:"Fußball",cat:"Baelle"}],
  ageNote:"Erst ab C-Jugend. Erfordert hohes taktisches Verstaendnis und Erfahrung. Regelkennntnis Abseits Pflicht.",
},

// ================================================================
// KONDITIONSTRAINING (8 Vorlagen)
// ================================================================
{
  id:"kond_01", cat:"kondition", name:"Intervalllauf 4x4-Methode",
  age:["c","ba","senioren"],
  duration:30, intensity:9,
  skills:["ausdauer","schnelligkeit"],
  description:`4 Intervalle von je 4 Minuten bei hoher Intensitaet (85-95% maximale Herzfrequenz), jeweils 3 Minuten aktive Pause (lockeres Laufen/Gehen). Wissenschaftlich effizienteste Methode zur Steigerung der aeroben Kapazitaet.`,
  coaching:`Puls messen wenn möglich. Spieler sollten sprechen können aber angestrengt sein. Motivation hochhalten in letzten 30 Sekunden. Abkuehlen danach zwingend. Nicht mehr als 2x pro Woche.`,
  variations:`Ball-orientiert: Rondos mit maximaler Intensitaet. Small-Sided-Games als Intervall-Format.`,
  minPlayers:6, fieldZone:"full",
  material:[{id:"huetchen",qty:8,color:"gelb",label:"Hütchen",cat:"Markierung"},{id:"ball_fuss",qty:2,label:"Fußball",cat:"Baelle"}],
  ageNote:"Erst ab C-Jugend (U14) geeignet. Intensives Konditionstraining schadet der Skelettentwicklung juengerer Spieler.",
},
{
  id:"kond_02", cat:"kondition", name:"Sprinttraining mit Reaktion",
  age:["d","c","ba","senioren"],
  duration:20, intensity:8,
  skills:["schnelligkeit","wendigkeit","konzentration"],
  description:`Kurze Sprints (10-30m) mit verschiedenen Startpositionen und Reaktionsreizen. Bauchlage, Sitzposition, Ruecklage. Trainer gibt optisches oder akustisches Signal. Vollstaendige Pause zwischen Sprintserien.`,
  coaching:`Maximale Intensitaet bei jedem Sprint. Volle Erholung (mind. 90 Sek) zwischen Versuchen. Startposition variieren. Reaktionszeit verbessert sich durch regelmaessiges Training deutlich.`,
  variations:`Mit Ball: Sprint, Ball annehmen, Abschluss. Richtungswechsel nach 10m. Duell-Sprint.`,
  minPlayers:4, fieldZone:"third_l",
  material:[{id:"pylone",qty:6,color:"orange",label:"Pylone",cat:"Markierung"}],
  ageNote:"D-Jugend: Kuerzere Distanzen (10-15m), weniger Serien. Ab C: Volle Sprintdistanzen und mehr Umfang.",
},
{
  id:"kond_03", cat:"kondition", name:"Zirkeltraining Koerperkoordination",
  age:["e","d","c"],
  duration:25, intensity:6,
  skills:["koordination","kraft","ausdauer"],
  description:`6 Stationen: Koordinationsleiter, Seitwartsspruenge, Liegestützen, Einbeinsprunge, Medizinball-Kniebeugen, Sprint. 45 Sek Arbeit, 15 Sek Wechsel, 2 Durchlaeufe.`,
  coaching:`Form vor Geschwindigkeit. Keine Umgehung von Stationen. Positionswechsel schnell aber kontrolliert. Partner motivieren. Hydration zwischen Runden.`,
  variations:`Zirkel mit Ball an jeder Station integriert. Wettbewerbsformat: Wiederholugnszählung.`,
  minPlayers:6, fieldZone:"full",
  material:[{id:"koordleiter",qty:2,label:"Koordinationsleiter",cat:"Markierung"},{id:"medizinball",qty:3,label:"Medizinball",cat:"Sonstiges"},{id:"huetchen",qty:8,color:"blau",label:"Hütchen",cat:"Markierung"}],
  ageNote:"E-Jugend: Vereinfachte Stationen ohne Medizinball, kuerzeere Arbeitszeiten (30 Sek).",
},

// ================================================================
// SPIELFORMEN (8 Vorlagen)
// ================================================================
{
  id:"spiel_01", cat:"spielform", name:"1 gegen 1 - Grundsituation Angreifer",
  age:["f","e","d","c","ba"],
  duration:20, intensity:7,
  skills:["dribbling","zweikampf","schnelligkeit","spielintelligenz"],
  description:`Klassisches 1v1 in einem 10x15m Korridor. Angreifer startet mit Ball, Verteidiger aus der Gegenseite. Angreifer versucht Linie zu überqueren oder kleines Tor zu treffen. Nach Gewinn oder Verlust Rollentausch.`,
  coaching:`Angreifer: Tempo-Variation als Waffe. Koepertaeushung nutzen. Auf Bewegungsgeschwindigkeit des Gegners reagieren. Verteidiger: Seitwartshaltung, Beine tief, Abwarten.`,
  variations:`2v2 in größerem Korridor. Zeitlimit von 5 Sekunden für Abschluss. 1v1 mit neutralem Wandspieler.`,
  minPlayers:4, fieldZone:"third_l",
  material:[{id:"goal_small",qty:2,label:"Kleines Tor",cat:"Tore"},{id:"ball_fuss",qty:3,label:"Fußball",cat:"Baelle"},{id:"huetchen",qty:4,color:"gelb",label:"Hütchen",cat:"Markierung"}],
  ageNote:"F-Jugend: 1v1 ohne Taktik-Coaching. E: Erste Koertaeuschungen einfuehren. Ab D: Technische Verbesserung gezielt fordern.",
},
{
  id:"spiel_02", cat:"spielform", name:"4 gegen 4 plus Torhter - Kleinfeldspiel",
  age:["e","d","c","ba","senioren"],
  duration:20, intensity:7,
  skills:["raumaufteilung","teamarbeit","umschalten","spielintelligenz"],
  description:`4v4+TW auf halbem Feld mit großen Toren. Freies Spiel mit taktischen Aufgaben: 3 Kontaktlimit, Rueckkehren in Grundordnung. Intensives Format mit maximalen Ballkontakten pro Spieler.`,
  coaching:`Spieler sollen selbst entscheiden. Eingriffe minimieren. Nach Spielzugen Fragen stellen: 'Was wäre noch möglich gewesen?' Positive Verstärkung bei guten Entscheidungen.`,
  variations:`Mit Joker als Unterstützung des angreifenden Teams. Kontertor zwählt doppelt. Ohne Torwart für mehr Chancen.`,
  minPlayers:9, fieldZone:"full",
  material:[{id:"goal_large",qty:2,label:"Großes Tor",cat:"Tore"},{id:"ball_fuss",qty:4,label:"Fußball",cat:"Baelle"},{id:"leibchen",qty:4,color:"rot",label:"Leibchen",cat:"Leibchen"}],
  ageNote:"E-Jugend aufwaerts. Ideal als Hauptteil des Trainings. Spielnahe Situation mit vielen Ballkontakten.",
},
{
  id:"spiel_03", cat:"spielform", name:"Ballbesitzspiel 6v3 im Quadrat",
  age:["d","c","ba","senioren"],
  duration:15, intensity:6,
  skills:["passen","raumaufteilung","pressing","spielintelligenz"],
  description:`6 Spieler halten Ball gegen 3 Störer in 20x20m Quadrat. Maximale 2 Kontakte. Störer wechseln nach 10 Ballverlusten. Zählen der laengsten Serie als Motivation.`,
  coaching:`Tiefe und Breite gleichzeitig anbieten. Passweg erkunden bevor Ball angenommen wird. Kommunikation zwischen Ballbesitz-Spielern. Koerpersprache zeigen wo man angespielt werden will.`,
  variations:`7v3 für Anfaenger. 5v3 für Fortgeschrittene. Mit Mannschaftswechsel nach Serie von 20 Paessen.`,
  minPlayers:9, fieldZone:"third_m",
  material:[{id:"ball_fuss",qty:2,label:"Fußball",cat:"Baelle"},{id:"huetchen",qty:4,color:"weiss",label:"Hütchen",cat:"Markierung"},{id:"leibchen",qty:3,color:"gruen",label:"Leibchen",cat:"Leibchen"}],
  ageNote:"Ab D-Jugend. Ballbesitz-Philosophie ab früh einbauen zahlt sich später aus.",
},

// ================================================================
// SPEZIALTRAINING (6 Vorlagen)
// ================================================================
{
  id:"spez_01", cat:"spezial", name:"Torwart - Stellungsspiel und Reflexe",
  age:["e","d","c","ba","senioren"],
  duration:25, intensity:6,
  skills:["konzentration","koordination","schnelligkeit"],
  description:`Speziell für Torhueter: Stellungsspiel bei Flanken (5-Meter-Radius), Reflextraining aus kurzer Distanz, Parade-Training bei flachen Schuessen, Abschlagtechnik. Ohne den Rest der Mannschaft - intensive 1-zu-1-Zeit mit Trainer.`,
  coaching:`Fuße schulterbreit. Auf den Fußballen stehen - nie auf den Fersen. Haende auf Brusthöheie vorbereiten. Bei Flanken: Entscheidung früh treffen und durchsetzen. Fuehrungsstärke im Strafraum kommunizieren.`,
  variations:`Reaktion auf Ablenkung (Trainer lenkt ab, schiesst dann). Flankentraining mit Feldspieler. Abwurftechnik und Distributionsspiel.`,
  minPlayers:2, fieldZone:"strafraum",
  material:[{id:"ball_fuss",qty:8,label:"Fußball",cat:"Baelle"},{id:"goal_large",qty:1,label:"Großes Tor",cat:"Tore"},{id:"huetchen",qty:4,color:"gelb",label:"Hütchen",cat:"Markierung"}],
  ageNote:"Torwarttraining ernst nehmen. TW entwickeln sich schneller mit separatem Training als ohne.",
},
{
  id:"spez_02", cat:"spezial", name:"Stürmerschule - Stürmertypen entwickeln",
  age:["d","c","ba"],
  duration:30, intensity:7,
  skills:["torabschluss","dribbling","spielintelligenz","schnelligkeit"],
  description:`Spezifisches Training für offensive Spieler: Tiefenlaeufe hinter die Abwehr timen, Abschluss nach Vorlage, Drehung im Strafraum, Kopfball auf Flanke, Reaktion bei Abprallern. Jeder Stürmertyp braucht andere Schwerpunkte.`,
  coaching:`Mittelstürmer: Strafraum-Positionen. Fluegel: Eins-gegen-eins und Flanke. Haengende Spitze: Kombination und Einruecken. Abschlussqualitaet vor allem trainieren: Ziel vor Kraft.`,
  variations:`Stürmer vs. Verteidiger 1v1 nach Pass. Stürmer-Duo: Kombinationsspiel im Strafraum. Abschluss nach 5-Pass-Sequenz.`,
  minPlayers:4, fieldZone:"strafraum",
  material:[{id:"ball_fuss",qty:6,label:"Fußball",cat:"Baelle"},{id:"goal_large",qty:1,label:"Großes Tor",cat:"Tore"},{id:"huetchen",qty:6,color:"gelb",label:"Hütchen",cat:"Markierung"}],
  ageNote:"D-Jugend: Grundpositionierung. C: Individuelle Stärken foerdern. B/A: Spielerzentrierte Entwicklung.",
},
{
  id:"spez_03", cat:"spezial", name:"Innenverteidiger - Zweikampf und Herausruecken",
  age:["d","c","ba","senioren"],
  duration:25, intensity:7,
  skills:["verteidigung","zweikampf","kopfballspiel","raumaufteilung"],
  description:`Speziell für Innenverteidiger: Stellungsspiel gegen ankommenden Stürmer, Herausruecken aus der Kette, Kopfballduell bei Flanken, Antizipation und Abfangen von Laengsballen. Defensiv-Zweikampf isoliert trainieren.`,
  coaching:`Seitwartshaltung einnehmen. Dem Stürmer den gefaehrlichen Raum nehmen. Bei Herausruecken: Sicherung des Partners kommunizieren. Kopfballduell fruezehaeitig anlaufen.`,
  variations:`1v1 gegen Stürmer mit Pass. Flanken-Abwehr in der Kette. Kombiniertes Verteidigungs-Pressing.`,
  minPlayers:4, fieldZone:"half_r",
  material:[{id:"ball_fuss",qty:4,label:"Fußball",cat:"Baelle"},{id:"goal_large",qty:1,label:"Großes Tor",cat:"Tore"}],
  ageNote:"Ab D-Jugend. Positionsspezifisches Training macht Verteidiger deutlich schneller besser.",
},
{
  id:"spez_04", cat:"spezial", name:"Sechser-Rolle - Spielaufbau und Absicherung",
  age:["c","ba","senioren"],
  duration:25, intensity:6,
  skills:["passen","raumaufteilung","zweikampf","spielintelligenz"],
  description:`Training der defensiven Mittelfeldposition: Tiefe anbieten für Innenverteidiger, Spiel verteilen in die Breite, Absicherung nach Ballverlust, Sechser als Bindeglied zwischen Abwehr und Angriff. Lesen des Spiels.`,
  coaching:`Immer anspielbereit - kein Verstecken. Kopf heben nach Ballannahme. Passwege antizipieren. Nach Zweikampf sofort Anschluss suchen. Kommunikation mit Innenverteidigern.`,
  variations:`Spielaufbau gegen Pressing-Simulation. Sechser als Dirigent im Rondo. Positionsspezifisches 1v1.`,
  minPlayers:6, fieldZone:"third_m",
  material:[{id:"ball_fuss",qty:3,label:"Fußball",cat:"Baelle"},{id:"leibchen",qty:3,color:"blau",label:"Leibchen",cat:"Leibchen"}],
  ageNote:"Erst ab C-Jugend. Erfordert taktische Reife und Überblick. Elegante Position mit hohem IQ-Anspruch.",
},

// ================================================================
// BAMBINI / JUNGE KINDER (extra sanfte Vorlagen)
// ================================================================
{
  id:"bam_01", cat:"spielform", name:"Hasenjaegerspiel",
  age:["bambini","g"],
  duration:15, intensity:4,
  skills:["koordination","schnelligkeit","teamarbeit"],
  description:`Ein 'Fuchs' jagt 'Hasen'. Hasen haben je einen Ball und dribblieren. Der Fuchs versucht den Ball wegzuschlagen. Wessen Ball das Feld verlässt, wird ebenfalls Fuchs. Letzter Hase gewinnt.`,
  coaching:`Keine Regeln erzwingen. Auf Fairplay hinweisen. Spass hat Vorrang. Auch die Kleinsten können gewinnen wenn Fuchs nicht zu stark wählen. Lachen und Jubeln ist erlaubt.`,
  variations:`Zwei Fuechse. Hasen dürfen Ball schuetzen mit Koerper. Team-Variante: Fuechse fangen gemeinsam.`,
  minPlayers:6, fieldZone:"full",
  material:[{id:"ball_fuss",qty:1,label:"Fußball (einer pro Kind)",cat:"Baelle"}],
  ageNote:"Perfekt für Bambini und G-Jugend. Dribbling wird spielerisch ohne Bewusstsein trainiert. Höchste Form der intrinsischen Motivation.",
},
{
  id:"bam_02", cat:"technik", name:"Ballzauberei für Kleine",
  age:["bambini","g","f"],
  duration:20, intensity:3,
  skills:["ballkontrolle","koordination"],
  description:`Spieler haben je einen Ball und versuchen: Ball mit der Sohle rollen (vorwaerts, rueckwaerts), Ball mit rechts/links tippen abwechselnd, Ball hochheben ohne Haende, Kick-ups zählen. Freies Erkunden.`,
  coaching:`Jedes Kind hat seinen eigenen Ball und seinen eigenen Weg. Kein Vergleich mit anderen Kindern. 'Zeig mir mal was du kannst!' als Motivation. Alle Tricks anerkennnen.`,
  variations:`Musik im Hintergrund. Gemeinsam mit dem Trainer mitmachen - Vorbildfunktion. Eltern-Kind-Challenge.`,
  minPlayers:1, fieldZone:"full",
  material:[{id:"ball_fuss",qty:1,label:"Fußball (einer pro Kind)",cat:"Baelle"}],
  ageNote:"Für die Allerjuengsten. Intrinsische Motivation und Freude am Ball foerdern. Kein Leistungsdruck.",
},

// ================================================================
// ALTHERREN SPEZIAL
// ================================================================
{
  id:"ah_01", cat:"spielform", name:"Beachflag-Fußball (Alt-Herren Variante)",
  age:["altherren","senioren"],
  duration:50, intensity:4,
  skills:["teamarbeit","spielintelligenz","ballkontrolle"],
  description:`Gelockertes Spielformat auf kleinerem Feld: 5v5, 3 Kontakt-Pflicht, nach Tor Rotation. Spass im Vordergrund. Kein intensives Laufen erwartet. Positionsspiel und Koerpertaeuschung statt Sprint.`,
  coaching:`Spielfreude foerdern. Keine harten Zweikampffoorderungen. Knoechel und Knie respektieren. Regenerations-Pausen einbauen. Lachen ist Teil des Trainings.`,
  variations:`Torkoenigsmodus. Tore nur nach Kombination gueltig. Torwart als 10. Feldspieler.`,
  minPlayers:6, fieldZone:"half_l",
  material:[{id:"goal_small",qty:4,label:"Kleines Tor",cat:"Tore"},{id:"ball_fuss",qty:3,label:"Fußball",cat:"Baelle"},{id:"leibchen",qty:5,color:"gelb",label:"Leibchen",cat:"Leibchen"}],
  ageNote:"Alt-Herren verdienen einen eigenen Ansatz. Spass, Gemeinschaft und Gesundheit stehen vor Leistung.",
},
];




/* =================================================================
   ERWEITERTE TRAINING LIBRARY + VORLAGE BROWSER
================================================================= */

// Skill-Punkte Berechnung eines Plans
const calcPlanStats = (exercises) => {
  if(!exercises||exercises.length===0) return {skills:{},intensity:0,totalMins:0,load:0};
  const skillTotals = {};
  let totalIntensityMins = 0;
  let totalMins = 0;
  exercises.forEach(ex => {
    const dur = ex.duration||0;
    const intensity = ex.intensity||5;
    totalMins += dur;
    totalIntensityMins += dur * intensity;
    (ex.skills||[]).forEach(skill => {
      skillTotals[skill] = (skillTotals[skill]||0) + dur;
    });
  });
  const avgIntensity = totalMins>0 ? Math.round(totalIntensityMins/totalMins) : 0;
  // Sorted skills by training time
  const sortedSkills = Object.entries(skillTotals)
    .sort(([,a],[,b])=>b-a)
    .slice(0,4);
  // Load: 0-100%
  const load = Math.min(100, Math.round((avgIntensity/10)*100));
  return { skills:skillTotals, topSkills:sortedSkills, intensity:avgIntensity, totalMins, load };
};

// Template Browser Komponente
function TemplateBrowser({ onSelect, cid, myTids, data, cl, onClose }) {
  const t = TH(cl);
  const [filter, setFilter] = useState("all");
  const [ageFilter, setAgeFilter] = useState("all");
  const [search, setSearch] = useState("");
  const [detail, setDetail] = useState(null);

  // Custom Templates dieses Vereins
  const customTemplates = (data.trainingPlans||[])
    .filter(p=>p.isTemplate&&(p.cid===cid||p.shared))
    .map(p=>({...p, isCustom:true}));

  const allTemplates = [...TRAINING_TEMPLATES, ...customTemplates];

  const filtered = allTemplates.filter(tpl => {
    const catOk = filter==="all" || tpl.cat===filter;
    const ageOk = ageFilter==="all" || (tpl.age||[]).includes(ageFilter);
    const searchOk = !search || tpl.name.toLowerCase().includes(search.toLowerCase())
      || tpl.description?.toLowerCase().includes(search.toLowerCase());
    return catOk && ageOk && searchOk;
  });

  const CATS = [
    {id:"all",     label:"Alle",          col:"#334155"},
    {id:"warmup",  label:"Aufwaermen",    col:"#f59e0b"},
    {id:"technik", label:"Technik",       col:"#2563eb"},
    {id:"taktik",  label:"Taktik",        col:"#7c3aed"},
    {id:"kondition",label:"Kondition",    col:"#dc2626"},
    {id:"spielform",label:"Spielformen",  col:"#16a34a"},
    {id:"spezial", label:"Spezial",       col:"#0891b2"},
  ];

  const AGE_OPTS = [
    {id:"all",      label:"Alle Altersgruppen"},
    {id:"bambini",  label:"Bambini"},
    {id:"g",        label:"G-Jugend"},
    {id:"f",        label:"F-Jugend"},
    {id:"e",        label:"E-Jugend"},
    {id:"d",        label:"D-Jugend"},
    {id:"c",        label:"C-Jugend"},
    {id:"ba",       label:"B/A-Jugend"},
    {id:"senioren", label:"Senioren"},
    {id:"altherren",label:"Alt-Herren"},
  ];

  const catConf = (id) => CATS.find(c=>c.id===id)||CATS[0];

  if(detail) return <TemplateDetail tpl={detail} onBack={()=>setDetail(null)}
    onUse={()=>{onSelect(detail);}} cl={cl}/>;

  return (
    <div style={{position:"fixed",inset:0,background:"rgba(0,0,0,.6)",zIndex:920,
      display:"flex",alignItems:"flex-end",justifyContent:"center",backdropFilter:"blur(6px)"}}>
      <div style={{background:"#fff",borderRadius:"22px 22px 0 0",width:"100%",
        maxWidth:520,maxHeight:"90dvh",display:"flex",flexDirection:"column"}}>

        <div style={{background:t.p,padding:"16px 20px 14px",flexShrink:0,borderRadius:"22px 22px 0 0"}}>
          <div style={{display:"flex",alignItems:"center",gap:10,marginBottom:12}}>
            <div style={{flex:1,color:"#fff",fontWeight:900,fontSize:18}}>Vorlagen-Bibliothek</div>
            <button onClick={onClose} style={{width:32,height:32,borderRadius:10,
              background:"rgba(255,255,255,.2)",border:"none",color:"#fff",
              cursor:"pointer",fontSize:18,fontWeight:700}}>x</button>
          </div>
          <input value={search} onChange={e=>setSearch(e.target.value)}
            placeholder="Übung suchen..."
            style={{width:"100%",padding:"9px 14px",borderRadius:11,border:"none",
              fontSize:14,outline:"none",background:"rgba(255,255,255,.15)",
              color:"#fff",boxSizing:"border-box"}}/>
        </div>

        {/* Kategorie-Filter */}
        <div style={{display:"flex",gap:5,padding:"12px 16px 8px",overflowX:"auto",
          scrollbarWidth:"none",flexShrink:0,borderBottom:"1px solid #f1f5f9"}}>
          {CATS.map(cat=>(
            <button key={cat.id} onClick={()=>setFilter(cat.id)}
              style={{padding:"6px 12px",borderRadius:99,border:`2px solid ${filter===cat.id?cat.col:"#e2e8f0"}`,
                background:filter===cat.id?cat.col+"15":"#fff",color:filter===cat.id?cat.col:"#64748b",
                fontWeight:filter===cat.id?800:600,fontSize:12,cursor:"pointer",
                whiteSpace:"nowrap",fontFamily:"inherit",flexShrink:0}}>
              {cat.label}
            </button>
          ))}
        </div>

        {/* Alters-Filter */}
        <div style={{padding:"8px 16px",flexShrink:0,borderBottom:"1px solid #f1f5f9"}}>
          <select value={ageFilter} onChange={e=>setAgeFilter(e.target.value)}
            style={{padding:"7px 12px",fontSize:13,border:"1.5px solid #e2e8f0",
              borderRadius:9,outline:"none",background:"#fff",fontFamily:"inherit",width:"100%"}}>
            {AGE_OPTS.map(a=><option key={a.id} value={a.id}>{a.label}</option>)}
          </select>
        </div>

        {/* Template Liste */}
        <div style={{flex:1,overflowY:"auto",padding:"12px 16px"}}>
          <div style={{fontSize:11,color:"#94a3b8",fontWeight:600,marginBottom:10}}>
            {filtered.length} Vorlage{filtered.length!==1?"n":""}
          </div>
          {filtered.map(tpl=>{
            const cc = catConf(tpl.cat);
            const stats = calcPlanStats(tpl.exercises||[{duration:tpl.duration,intensity:tpl.intensity,skills:tpl.skills}]);
            const intensityLabel = tpl.intensity<=3?"Gering":tpl.intensity<=6?"Mittel":tpl.intensity<=8?"Hoch":"Maximal";
            return (
              <div key={tpl.id} style={{background:"#fff",borderRadius:14,
                border:"1.5px solid #e2e8f0",marginBottom:10,overflow:"hidden",
                cursor:"pointer"}} onClick={()=>setDetail(tpl)}>
                <div style={{display:"flex",alignItems:"flex-start",gap:10,padding:"12px 14px"}}>
                  <div style={{width:40,height:40,borderRadius:11,background:cc.col+"15",
                    display:"flex",alignItems:"center",justifyContent:"center",
                    fontWeight:900,fontSize:15,color:cc.col,flexShrink:0}}>
                    {cc.label.slice(0,1)}
                  </div>
                  <div style={{flex:1,minWidth:0}}>
                    <div style={{fontWeight:800,fontSize:14,color:"#0f172a"}}>{tpl.name}</div>
                    <div style={{fontSize:11,color:"#64748b",marginTop:2,display:"flex",gap:8,flexWrap:"wrap"}}>
                      <span>{tpl.duration} Min.</span>
                      <span style={{color:tpl.intensity>=8?"#dc2626":tpl.intensity>=5?"#d97706":"#16a34a",fontWeight:700}}>
                        {intensityLabel}
                      </span>
                      {tpl.isCustom&&<span style={{background:"#eff6ff",color:"#2563eb",borderRadius:99,padding:"0 6px",fontWeight:700}}>Eigene</span>}
                    </div>
                    {/* Skill-Tags */}
                    <div style={{display:"flex",gap:4,flexWrap:"wrap",marginTop:6}}>
                      {(tpl.skills||[]).slice(0,3).map(skill=>{
                        const sk = SKILLS[skill];
                        return sk ? (
                          <span key={skill} style={{background:sk.col+"15",color:sk.col,
                            borderRadius:99,padding:"2px 7px",fontSize:10,fontWeight:700}}>
                            {sk.label}
                          </span>
                        ) : null;
                      })}
                    </div>
                  </div>
                  <div style={{textAlign:"right",flexShrink:0}}>
                    {/* Intensitaets-Balken */}
                    <div style={{display:"flex",gap:2,marginBottom:4}}>
                      {Array.from({length:5},(_,i)=>(
                        <div key={i} style={{width:5,height:14,borderRadius:3,
                          background:(i+1)*2<=tpl.intensity
                            ?tpl.intensity>=8?"#dc2626":tpl.intensity>=5?"#d97706":"#16a34a"
                            :"#e2e8f0"}}/>
                      ))}
                    </div>
                    <div style={{fontSize:10,color:"#94a3b8"}}>
                      {(tpl.age||[]).length>0?(tpl.age||[]).slice(0,2).join(", "):"Alle"}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
          {filtered.length===0&&(
            <div style={{textAlign:"center",padding:"40px",background:"#f8fafc",
              borderRadius:14,border:"1.5px dashed #e2e8f0"}}>
              <p style={{fontWeight:700,color:"#334155",margin:"0 0 4px"}}>Keine Vorlagen gefunden</p>
              <p style={{fontSize:13,color:"#94a3b8",margin:0}}>Filter anpassen oder eigene Vorlage erstellen.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// Template Detail-Ansicht
function TemplateDetail({ tpl, onBack, onUse, cl }) {
  const t = TH(cl);
  const cc = ["warmup","technik","taktik","kondition","spielform","spezial"].includes(tpl.cat)
    ? {warmup:"#f59e0b",technik:"#2563eb",taktik:"#7c3aed",kondition:"#dc2626",spielform:"#16a34a",spezial:"#0891b2"}[tpl.cat]
    : "#334155";

  const intensityBar = (val) => (
    <div style={{display:"flex",gap:3,alignItems:"center"}}>
      {Array.from({length:10},(_,i)=>(
        <div key={i} style={{width:14,height:8,borderRadius:3,
          background:i<val?(val>=8?"#dc2626":val>=5?"#d97706":"#16a34a"):"#e2e8f0"}}/>
      ))}
      <span style={{marginLeft:4,fontSize:12,fontWeight:700,
        color:tpl.intensity>=8?"#dc2626":tpl.intensity>=5?"#d97706":"#16a34a"}}>
        {tpl.intensity}/10
      </span>
    </div>
  );

  return (
    <div style={{position:"fixed",inset:0,background:"rgba(0,0,0,.6)",zIndex:920,
      display:"flex",alignItems:"flex-end",justifyContent:"center",backdropFilter:"blur(6px)"}}>
      <div style={{background:"#fff",borderRadius:"22px 22px 0 0",width:"100%",
        maxWidth:520,maxHeight:"92dvh",overflowY:"auto",paddingBottom:44}}>

        <div style={{background:`linear-gradient(135deg,#1e293b,${cc})`,
          padding:"18px 20px 16px",borderRadius:"22px 22px 0 0"}}>
          <button onClick={onBack} style={{background:"rgba(255,255,255,.15)",border:"none",
            color:"#fff",borderRadius:9,padding:"6px 12px",fontSize:12,fontWeight:700,
            cursor:"pointer",fontFamily:"inherit",marginBottom:10}}>
            {"<-"} Zurück
          </button>
          <div style={{color:"#fff",fontWeight:900,fontSize:20,marginBottom:4}}>{tpl.name}</div>
          <div style={{display:"flex",gap:10,flexWrap:"wrap"}}>
            <span style={{background:"rgba(255,255,255,.15)",color:"#fff",
              borderRadius:99,padding:"3px 10px",fontSize:12,fontWeight:600}}>
              {tpl.duration} Min.
            </span>
            <span style={{background:"rgba(255,255,255,.15)",color:"#fff",
              borderRadius:99,padding:"3px 10px",fontSize:12,fontWeight:600}}>
              Mind. {tpl.minPlayers||4} Spieler
            </span>
          </div>
        </div>

        <div style={{padding:"18px 20px 0"}}>

          {/* Intensitaet */}
          <div style={{background:"#f8fafc",borderRadius:13,padding:"13px 15px",marginBottom:14}}>
            <div style={{fontSize:11,fontWeight:800,color:"#64748b",marginBottom:8,letterSpacing:.5}}>BELASTUNGSINTENSITAET</div>
            {intensityBar(tpl.intensity||5)}
            <div style={{fontSize:12,color:"#64748b",marginTop:6,lineHeight:1.5}}>
              {tpl.intensity<=3&&"Geringe Belastung - ideal als Aufwaermen oder nach intensiver Woche"}
              {tpl.intensity>=4&&tpl.intensity<=6&&"Mittlere Belastung - regulaeres Technik- und Taktiktraining"}
              {tpl.intensity>=7&&tpl.intensity<=8&&"Hohe Belastung - konditionelle Schwerpunkte, ausreichend Regeneration planen"}
              {tpl.intensity>=9&&"Maximale Belastung - nur frisch ausgeruhte Spieler, zwingend Abkuehlen danach"}
            </div>
          </div>

          {/* Was wird trainiert */}
          <div style={{marginBottom:14}}>
            <div style={{fontSize:11,fontWeight:800,color:"#64748b",marginBottom:8,letterSpacing:.5}}>WAS WIRD TRAINIERT</div>
            <div style={{display:"flex",gap:7,flexWrap:"wrap"}}>
              {(tpl.skills||[]).map(skill=>{
                const sk = SKILLS[skill];
                return sk ? (
                  <div key={skill} style={{background:sk.col+"15",border:`1.5px solid ${sk.col}30`,
                    borderRadius:99,padding:"5px 12px",display:"flex",alignItems:"center",gap:5}}>
                    <div style={{width:8,height:8,borderRadius:"50%",background:sk.col}}/>
                    <span style={{fontSize:13,fontWeight:700,color:sk.col}}>{sk.label}</span>
                    <span style={{fontSize:10,color:"#94a3b8"}}>({sk.cat})</span>
                  </div>
                ) : null;
              })}
            </div>
          </div>

          {/* Altersgruppen */}
          {(tpl.age||[]).length>0&&(
            <div style={{marginBottom:14}}>
              <div style={{fontSize:11,fontWeight:800,color:"#64748b",marginBottom:8,letterSpacing:.5}}>GEEIGNET FUER</div>
              <div style={{display:"flex",gap:6,flexWrap:"wrap"}}>
                {(tpl.age||[]).map(ag=>(
                  <span key={ag} style={{background:"#f0fdf4",border:"1.5px solid #bbf7d0",
                    color:"#166534",borderRadius:99,padding:"4px 12px",fontSize:12,fontWeight:700}}>
                    {AGE_GROUPS[ag]||ag}
                  </span>
                ))}
              </div>
              {tpl.ageNote&&(
                <div style={{background:"#eff6ff",borderRadius:10,padding:"10px 13px",
                  marginTop:10,fontSize:12,color:"#1d4ed8",lineHeight:1.6}}>
                  {tpl.ageNote}
                </div>
              )}
            </div>
          )}

          {/* Beschreibung */}
          <div style={{marginBottom:14}}>
            <div style={{fontSize:11,fontWeight:800,color:"#64748b",marginBottom:8,letterSpacing:.5}}>BESCHREIBUNG</div>
            <div style={{fontSize:14,color:"#334155",lineHeight:1.7,background:"#f8fafc",
              borderRadius:12,padding:"13px 15px",border:"1px solid #e2e8f0"}}>
              {tpl.description}
            </div>
          </div>

          {/* Coaching-Hinweise */}
          {tpl.coaching&&(
            <div style={{marginBottom:14}}>
              <div style={{fontSize:11,fontWeight:800,color:"#d97706",marginBottom:8,letterSpacing:.5}}>COACHING-HINWEISE</div>
              <div style={{background:"#fef3c7",borderRadius:12,padding:"13px 15px",
                border:"1px solid #fde68a",fontSize:13,color:"#92400e",lineHeight:1.7}}>
                {tpl.coaching}
              </div>
            </div>
          )}

          {/* Variationen */}
          {tpl.variations&&(
            <div style={{marginBottom:14}}>
              <div style={{fontSize:11,fontWeight:800,color:"#7c3aed",marginBottom:8,letterSpacing:.5}}>VARIATIONEN & STEIGERUNGEN</div>
              <div style={{background:"#ede9fe",borderRadius:12,padding:"13px 15px",
                border:"1px solid #c4b5fd",fontSize:13,color:"#4c1d95",lineHeight:1.7}}>
                {tpl.variations}
              </div>
            </div>
          )}

          {/* Material */}
          {(tpl.material||[]).length>0&&(
            <div style={{marginBottom:14}}>
              <div style={{fontSize:11,fontWeight:800,color:"#64748b",marginBottom:8,letterSpacing:.5}}>BENOENIGTES MATERIAL</div>
              <div style={{display:"flex",flexWrap:"wrap",gap:7}}>
                {tpl.material.map((m,i)=>{
                  const def=MATERIAL_CATALOG.find(x=>x.id===m.id);
                  const col=m.color?COLOR_HEX[m.color]||"#64748b":def?.col||"#64748b";
                  return (
                    <div key={i} style={{background:col+"15",borderRadius:99,
                      padding:"5px 12px",border:`1.5px solid ${col}30`}}>
                      <span style={{fontWeight:700,fontSize:12,color:col}}>
                        {m.qty||1}x {def?.label||m.label}{m.color?" ("+m.color+")":""}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Als Übung verwenden */}
          <button onClick={onUse}
            style={{width:"100%",padding:"14px",borderRadius:14,border:"none",
              background:t.p,color:"#fff",fontWeight:800,fontSize:15,
              cursor:"pointer",fontFamily:"inherit",
              boxShadow:`0 4px 20px ${t.p}44`,marginBottom:8}}>
            Diese Vorlage verwenden
          </button>
        </div>
      </div>
    </div>
  );
}



function ResetDataButton({ fire }) {
  const [confirm, setConfirm] = useState(false);
  const doReset = () => {
    // Clear all app data from localStorage
    Object.keys(localStorage)
      .filter(k => k.startsWith("vereinsapp_"))
      .forEach(k => localStorage.removeItem(k));
    fire("Alle lokalen Daten zurückgesetzt - Seite wird neu geladen...");
    setTimeout(() => window.location.reload(), 1500);
  };
  if(!confirm) return (
    <button onClick={()=>setConfirm(true)}
      style={{padding:"10px 16px",borderRadius:11,border:"1.5px solid #e2e8f0",
        background:"#fff",color:"#dc2626",fontWeight:700,fontSize:13,
        cursor:"pointer",fontFamily:"inherit",width:"100%"}}>
      Lokale Testdaten löschen
    </button>
  );
  return (
    <div style={{background:"#fef2f2",borderRadius:13,padding:"14px",border:"1.5px solid #fca5a5"}}>
      <p style={{fontSize:13,color:"#dc2626",fontWeight:700,margin:"0 0 10px"}}>
        Wirklich alle lokalen Daten löschen? Das betrifft nur diesen Browser.
      </p>
      <div style={{display:"flex",gap:9}}>
        <button onClick={()=>setConfirm(false)}
          style={{flex:1,padding:"10px",borderRadius:10,border:"1.5px solid #e2e8f0",
            background:"#fff",fontWeight:700,cursor:"pointer",fontFamily:"inherit"}}>
          Abbrechen
        </button>
        <button onClick={doReset}
          style={{flex:1,padding:"10px",borderRadius:10,border:"none",
            background:"#dc2626",color:"#fff",fontWeight:800,cursor:"pointer",fontFamily:"inherit"}}>
          Ja, löschen
        </button>
      </div>
    </div>
  );
}


/* =================================================================
   PASSWORT-VERWALTUNG (nur Admin)
   - Alle Zugänge des Vereins auf einen Blick
   - Passwort setzen, zurücksetzen, sperren
   - Kein Klartext gespeichert
================================================================= */
function AccessManagerTab({ data, cid, save, fire, cl }) {
  const t = TH(cl);
  const teams    = (data.teams   ||[]).filter(x=>x.cid===cid);
  const trainers = (data.trainers||[]).filter(x=>x.cid===cid);
  const helpers  = (data.helpers ||[]).filter(x=>x.cid===cid);
  const club     = (data.clubs   ||[]).find(x=>x.id===cid)||{};

  const [editing, setEditing] = useState(null); // {type, id, name}
  const [newPw, setNewPw]     = useState("");
  const [newPw2, setNewPw2]   = useState("");
  const [err, setErr]         = useState("");
  const [saved, setSaved]     = useState("");

  const openEdit = (type, id, name) => {
    setEditing({type, id, name});
    setNewPw(""); setNewPw2(""); setErr(""); setSaved("");
  };

  const doSave = () => {
    if(newPw.length < 4) { setErr("Mindestens 4 Zeichen"); return; }
    if(newPw !== newPw2) { setErr("Passwörter stimmen nicht überein"); return; }
    const hash = hashPw(newPw);
    let nextData = {...data};

    if(editing.type === "team") {
      nextData.teams = (data.teams||[]).map(tm=>
        tm.id===editing.id ? {...tm, pwd:hash} : tm
      );
    } else if(editing.type === "trainer") {
      nextData.trainers = (data.trainers||[]).map(tr=>
        tr.id===editing.id ? {...tr, pw:hash} : tr
      );
    } else if(editing.type === "admin") {
      nextData.clubs = (data.clubs||[]).map(cl=>
        cl.id===cid ? {...cl, adm:hash} : cl
      );
    } else if(editing.type === "helper") {
      nextData.helpers = (data.helpers||[]).map(h=>
        h.id===editing.id ? {...h, code:hash} : h
      );
    }
    // Audit log
    const entry = {
      id:uid(), cid, type:"pw_change",
      detail:`Admin änderte Passwort für: ${editing.name} (${editing.type})`,
      ts:new Date().toISOString(), role:"admin", name:"Admin",
      device:getDeviceInfo(), deviceId:getDeviceId(),
    };
    nextData.securityLog = [...(data.securityLog||[]), entry];
    save(nextData);
    setSaved("Gespeichert"); setErr("");
    setTimeout(()=>{ setEditing(null); setSaved(""); }, 1200);
    fire(`Passwort geändert: ${editing.name}`);
  };

  const doLock = (type, id, name, isLocked) => {
    let nextData = {...data};
    if(type==="team") {
      nextData.teams = (data.teams||[]).map(tm=>
        tm.id===id ? {...tm, locked:!isLocked} : tm
      );
    } else if(type==="trainer") {
      nextData.trainers = (data.trainers||[]).map(tr=>
        tr.id===id ? {...tr, locked:!isLocked} : tr
      );
    }
    const action = isLocked ? "entsperrt" : "gesperrt";
    const entry = {
      id:uid(), cid, type:"admin_action",
      detail:`Admin ${action} Zugang: ${name}`,
      ts:new Date().toISOString(), role:"admin", name:"Admin",
      device:getDeviceInfo(), deviceId:getDeviceId(),
    };
    nextData.securityLog = [...(data.securityLog||[]), entry];
    save(nextData);
    fire(`Zugang ${action}: ${name}`);
  };

  const AccessRow = ({type, id, name, isLocked, badge}) => (
    <div style={{
      display:"flex", alignItems:"center", gap:10,
      padding:"11px 14px",
      background: isLocked ? "#fef2f2" : "#fff",
      borderRadius:12,
      border:`1.5px solid ${isLocked?"#fca5a5":"#e2e8f0"}`,
      marginBottom:8,
      opacity: isLocked ? .7 : 1,
    }}>
      <div style={{
        width:36, height:36, borderRadius:10,
        background: isLocked ? "#fee2e2" : t.p+"15",
        display:"flex", alignItems:"center", justifyContent:"center",
        fontWeight:900, fontSize:12,
        color: isLocked ? "#dc2626" : t.p,
        flexShrink:0,
      }}>
        {badge}
      </div>
      <div style={{flex:1, minWidth:0}}>
        <div style={{fontWeight:700, fontSize:14, color:"#0f172a",
          display:"flex", alignItems:"center", gap:6}}>
          {name}
          {isLocked && (
            <span style={{background:"#fee2e2", color:"#dc2626",
              borderRadius:99, padding:"1px 7px", fontSize:10, fontWeight:800}}>
              GESPERRT
            </span>
          )}
        </div>
        <div style={{fontSize:11, color:"#94a3b8", marginTop:1}}>
          Passwort: 
        </div>
      </div>
      <div style={{display:"flex", gap:6, flexShrink:0}}>
        <button onClick={()=>openEdit(type, id, name)}
          style={{padding:"6px 12px", borderRadius:9, border:"none",
            background:t.p+"15", color:t.p,
            fontWeight:700, fontSize:12, cursor:"pointer", fontFamily:"inherit"}}>
          Ändern
        </button>
        <button onClick={()=>doLock(type, id, name, isLocked)}
          style={{padding:"6px 10px", borderRadius:9,
            border:`1.5px solid ${isLocked?"#16a34a":"#e2e8f0"}`,
            background: isLocked ? "#f0fdf4" : "#f8fafc",
            color: isLocked ? "#16a34a" : "#dc2626",
            fontWeight:700, fontSize:11, cursor:"pointer", fontFamily:"inherit"}}>
          {isLocked ? "Entsperren" : "Sperren"}
        </button>
      </div>
    </div>
  );

  return (
    <div>
      {/* Passwort-Änderungs-Modal */}
      {editing && (
        <div style={{position:"fixed", inset:0, background:"rgba(0,0,0,.6)",
          zIndex:900, display:"flex", alignItems:"center",
          justifyContent:"center", padding:20, backdropFilter:"blur(6px)"}}>
          <div style={{background:"#fff", borderRadius:20,
            padding:"24px", width:"100%", maxWidth:380}}>
            <h3 style={{fontWeight:900, fontSize:17, marginBottom:4}}>
              Passwort setzen
            </h3>
            <p style={{fontSize:13, color:"#64748b", marginBottom:16, lineHeight:1.5}}>
              Neues Passwort für: <strong>{editing.name}</strong>
            </p>
            <div style={{display:"flex", flexDirection:"column", gap:10}}>
              <input
                type="password"
                value={newPw}
                onChange={e=>{ setNewPw(e.target.value); setErr(""); }}
                placeholder="Neues Passwort (mind. 4 Zeichen)"
                autoFocus
                style={{padding:"12px 14px", fontSize:16,
                  border:`1.5px solid ${err?"#fca5a5":"#e2e8f0"}`,
                  borderRadius:12, outline:"none"}}
              />
              <input
                type="password"
                value={newPw2}
                onChange={e=>{ setNewPw2(e.target.value); setErr(""); }}
                placeholder="Passwort wiederholen"
                style={{padding:"12px 14px", fontSize:16,
                  border:`1.5px solid ${err?"#fca5a5":"#e2e8f0"}`,
                  borderRadius:12, outline:"none"}}
              />
              {err && (
                <div style={{background:"#fef2f2", borderRadius:10,
                  padding:"9px 13px", fontSize:13, color:"#dc2626", fontWeight:600}}>
                  {err}
                </div>
              )}
              {saved && (
                <div style={{background:"#f0fdf4", borderRadius:10,
                  padding:"9px 13px", fontSize:13, color:"#16a34a", fontWeight:700}}>
                  {saved}
                </div>
              )}
            </div>
            <div style={{background:"#eff6ff", borderRadius:11,
              padding:"10px 13px", marginTop:12, fontSize:12,
              color:"#1d4ed8", lineHeight:1.6}}>
              Das Passwort wird als sicherer Hash gespeichert.
              Der Klartext ist danach nicht mehr einsehbar.
            </div>
            <div style={{display:"flex", gap:9, marginTop:14}}>
              <button onClick={()=>setEditing(null)}
                style={{flex:1, padding:"12px", borderRadius:12,
                  border:"1.5px solid #e2e8f0", background:"#fff",
                  fontWeight:700, cursor:"pointer", fontFamily:"inherit"}}>
                Abbrechen
              </button>
              <button
                onClick={doSave}
                disabled={!newPw.trim() || !newPw2.trim()}
                style={{flex:2, padding:"12px", borderRadius:12, border:"none",
                  background:newPw.trim()&&newPw2.trim() ? t.p : "#e2e8f0",
                  color:newPw.trim()&&newPw2.trim() ? "#fff" : "#94a3b8",
                  fontWeight:800, cursor:"pointer", fontFamily:"inherit"}}>
                Speichern
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Admin-Passwort */}
      <div style={{marginBottom:14}}>
        <div style={{fontSize:11, fontWeight:800, color:"#64748b",
          marginBottom:8, letterSpacing:.5}}>
          ADMIN-ZUGANG
        </div>
        <AccessRow type="admin" id={cid} name="Vereinsadmin"
          isLocked={false} badge="A"/>
      </div>

      {/* Team-Passwrter */}
      {teams.length > 0 && (
        <div style={{marginBottom:14}}>
          <div style={{fontSize:11, fontWeight:800, color:"#64748b",
            marginBottom:8, letterSpacing:.5}}>
            ELTERN-ZUGAENGE ({teams.length} Mannschaften)
          </div>
          {teams.map(tm=>(
            <AccessRow key={tm.id} type="team" id={tm.id}
              name={tm.name} isLocked={!!tm.locked}
              badge={tm.icon||tm.name?.slice(0,2)}/>
          ))}
        </div>
      )}

      {/* Trainer-Passwrter */}
      {trainers.length > 0 && (
        <div style={{marginBottom:14}}>
          <div style={{fontSize:11, fontWeight:800, color:"#64748b",
            marginBottom:8, letterSpacing:.5}}>
            TRAINER-ZUGAENGE ({trainers.length})
          </div>
          {trainers.map(tr=>(
            <AccessRow key={tr.id} type="trainer" id={tr.id}
              name={tr.name} isLocked={!!tr.locked}
              badge="T"/>
          ))}
        </div>
      )}

      {/* Helfer-Codes */}
      {helpers.length > 0 && (
        <div style={{marginBottom:14}}>
          <div style={{fontSize:11, fontWeight:800, color:"#64748b",
            marginBottom:8, letterSpacing:.5}}>
            HELFER-CODES ({helpers.length})
          </div>
          {helpers.map(h=>(
            <AccessRow key={h.id} type="helper" id={h.id}
              name={h.name} isLocked={!!h.locked}
              badge="H"/>
          ))}
        </div>
      )}

      {teams.length===0 && trainers.length===0 && (
        <div style={{textAlign:"center", padding:"32px",
          background:"#f8fafc", borderRadius:14,
          border:"1.5px dashed #e2e8f0"}}>
          <p style={{fontWeight:700, color:"#334155", margin:"0 0 4px"}}>
            Noch keine Zugänge
          </p>
          <p style={{fontSize:13, color:"#94a3b8", margin:0, lineHeight:1.5}}>
            Lege zuerst Teams und Trainer an.
            Hier kannst du dann alle Zugänge verwalten.
          </p>
        </div>
      )}

      {/* Sicherheitshinweis */}
      <div style={{background:"#f0fdf4", borderRadius:13,
        padding:"12px 14px", border:"1.5px solid #bbf7d0",
        fontSize:12, color:"#166534", lineHeight:1.6}}>
        Alle Passwörter werden als kryptografischer Hash gespeichert.
        Kein Klartext ist in der Datenbank hinterlegt.
        Passwortänderungen werden im Sicherheitsprotokoll erfasst.
      </div>
    </div>
  );
}



/* =================================================================
   PASSWORT VERGESSEN - KOMPLETTES SYSTEM
================================================================= */

// Temporaeren Reset-Code generieren (6 Stellen, 15 Min gueltig)
const generateResetCode = () => {
  const code = Math.floor(100000 + Math.random() * 900000).toString();
  const expires = Date.now() + 15 * 60 * 1000;
  const key = "va_reset_" + code;
  localStorage.setItem(key, JSON.stringify({ code, expires }));
  return code;
};

const verifyResetCode = (inputCode, clubId) => {
  const key = "va_reset_" + inputCode;
  try {
    const stored = JSON.parse(localStorage.getItem(key) || "null");
    if (!stored) return false;
    if (Date.now() > stored.expires) {
      localStorage.removeItem(key);
      return false;
    }
    localStorage.removeItem(key);
    return true;
  } catch { return false; }
};

/* -----------------------------------------------------------------
   FALL A: Admin Passwort Vergessen
----------------------------------------------------------------- */
function AdminForgotPassword({ cl, onBack, onReset }) {
  const [step, setStep]   = useState("email"); // email | code | newpw
  const [email, setEmail] = useState("");
  const [code, setCode]   = useState("");
  const [genCode, setGenCode] = useState("");
  const [newPw, setNewPw] = useState("");
  const [newPw2, setNewPw2] = useState("");
  const [err, setErr]     = useState("");
  const t = TH(cl);

  const sendCode = () => {
    const adminEmail = cl.adminEmail || "";
    if (!adminEmail) {
      setErr("Keine E-Mail-Adresse hinterlegt. Bitte Admin direkt kontaktieren.");
      return;
    }
    if (email.toLowerCase().trim() !== adminEmail.toLowerCase().trim()) {
      setErr("Diese E-Mail-Adresse stimmt nicht mit der gespeicherten überein.");
      return;
    }
    const c = generateResetCode();
    setGenCode(c);
    // Öffne E-Mail-App mit vorbereiteter Mail
    const subject = encodeURIComponent("Vereins-App: Dein Reset-Code");
    const body = encodeURIComponent(
      "Dein Reset-Code für die Vereins-App:\n\n" +
      "CODE: " + c + "\n\n" +
      "Dieser Code ist 15 Minuten gueltig.\n" +
      "Gib ihn in der App ein um dein Passwort zu ändern.\n\n" +
      "Falls du diesen Code nicht angefordert hast, ignoriere diese Mail."
    );
    window.open(`mailto:${adminEmail}?subject=${subject}&body=${body}`);
    setStep("code");
    setErr("");
  };

  const checkCode = () => {
    if (verifyResetCode(code.trim(), cl.id)) {
      setStep("newpw");
      setErr("");
    } else {
      setErr("Code ungueltig oder abgelaufen. Bitte neu anfordern.");
    }
  };

  const doReset = () => {
    if (newPw.length < 4) { setErr("Mindestens 4 Zeichen"); return; }
    if (newPw !== newPw2)  { setErr("Passwörter stimmen nicht überein"); return; }
    onReset(hashPw(newPw));
  };

  return (
    <div style={{position:"fixed",inset:0,background:"rgba(0,0,0,.6)",zIndex:900,
      display:"flex",alignItems:"center",justifyContent:"center",padding:20,
      backdropFilter:"blur(8px)"}}>
      <div style={{background:"#fff",borderRadius:20,padding:"24px",
        width:"100%",maxWidth:380}}>

        <button onClick={onBack}
          style={{background:"none",border:"none",color:"#64748b",fontSize:13,
            cursor:"pointer",fontFamily:"inherit",marginBottom:12,padding:0,
            fontWeight:700}}>
          {"<-"} Zurück
        </button>

        {step==="email"&&<>
          <h3 style={{fontWeight:900,fontSize:18,marginBottom:6}}>Passwort vergessen</h3>
          <p style={{fontSize:13,color:"#64748b",marginBottom:16,lineHeight:1.6}}>
            Gib deine Admin-E-Mail-Adresse ein. Wir senden dir einen Code
            zum Zurücksetzen des Passwortes.
          </p>
          <input value={email} onChange={e=>{setEmail(e.target.value);setErr("");}}
            type="email" placeholder="Deine E-Mail-Adresse"
            style={{width:"100%",padding:"12px 14px",fontSize:16,
              border:`1.5px solid ${err?"#fca5a5":"#e2e8f0"}`,
              borderRadius:12,outline:"none",marginBottom:err?10:14,
              boxSizing:"border-box"}}/>
          {err&&<div style={{background:"#fef2f2",borderRadius:10,padding:"9px 12px",
            fontSize:13,color:"#dc2626",marginBottom:12,lineHeight:1.5}}>{err}</div>}
          <button onClick={sendCode} disabled={!email.trim()}
            style={{width:"100%",padding:"13px",borderRadius:13,border:"none",
              background:email.trim()?t.p:"#e2e8f0",
              color:email.trim()?"#fff":"#94a3b8",
              fontWeight:800,fontSize:14,cursor:"pointer",fontFamily:"inherit"}}>
            Reset-Code senden
          </button>
        </>}

        {step==="code"&&<>
          <h3 style={{fontWeight:900,fontSize:18,marginBottom:6}}>Code eingeben</h3>
          <div style={{background:"#f0fdf4",borderRadius:12,padding:"12px 14px",
            marginBottom:16,fontSize:13,color:"#166534",lineHeight:1.6}}>
            Deine E-Mail-App hat sich geöffnet mit einer vorbereiteten Mail.
            Sende sie ab und trage dann den 6-stelligen Code hier ein.
          </div>
          <input value={code} onChange={e=>{setCode(e.target.value);setErr("");}}
            placeholder="6-stelliger Code" maxLength={6}
            style={{width:"100%",padding:"14px",fontSize:22,fontWeight:900,
              textAlign:"center",letterSpacing:6,
              border:`1.5px solid ${err?"#fca5a5":"#e2e8f0"}`,
              borderRadius:12,outline:"none",marginBottom:err?10:14,
              boxSizing:"border-box"}}/>
          {err&&<div style={{background:"#fef2f2",borderRadius:10,padding:"9px 12px",
            fontSize:13,color:"#dc2626",marginBottom:12}}>{err}</div>}
          <div style={{display:"flex",gap:9}}>
            <button onClick={()=>setStep("email")}
              style={{flex:1,padding:"12px",borderRadius:12,
                border:"1.5px solid #e2e8f0",background:"#fff",
                fontWeight:700,cursor:"pointer",fontFamily:"inherit"}}>
              Neu senden
            </button>
            <button onClick={checkCode} disabled={code.length!==6}
              style={{flex:2,padding:"12px",borderRadius:12,border:"none",
                background:code.length===6?t.p:"#e2e8f0",
                color:code.length===6?"#fff":"#94a3b8",
                fontWeight:800,cursor:"pointer",fontFamily:"inherit"}}>
              Bestaetigen
            </button>
          </div>
        </>}

        {step==="newpw"&&<>
          <h3 style={{fontWeight:900,fontSize:18,marginBottom:6}}>Neues Passwort</h3>
          <p style={{fontSize:13,color:"#64748b",marginBottom:16}}>
            Code bestaetigt. Vergib jetzt dein neues Passwort.
          </p>
          <div style={{display:"flex",flexDirection:"column",gap:10,marginBottom:14}}>
            <input type="password" value={newPw}
              onChange={e=>{setNewPw(e.target.value);setErr("");}}
              placeholder="Neues Passwort (mind. 4 Zeichen)"
              style={{padding:"12px 14px",fontSize:16,
                border:"1.5px solid #e2e8f0",borderRadius:12,outline:"none"}}/>
            <input type="password" value={newPw2}
              onChange={e=>{setNewPw2(e.target.value);setErr("");}}
              placeholder="Passwort wiederholen"
              style={{padding:"12px 14px",fontSize:16,
                border:"1.5px solid #e2e8f0",borderRadius:12,outline:"none"}}/>
            {err&&<div style={{background:"#fef2f2",borderRadius:10,padding:"9px 12px",
              fontSize:13,color:"#dc2626"}}>{err}</div>}
          </div>
          <button onClick={doReset} disabled={!newPw.trim()||!newPw2.trim()}
            style={{width:"100%",padding:"13px",borderRadius:13,border:"none",
              background:newPw.trim()&&newPw2.trim()?t.p:"#e2e8f0",
              color:newPw.trim()&&newPw2.trim()?"#fff":"#94a3b8",
              fontWeight:800,fontSize:14,cursor:"pointer",fontFamily:"inherit"}}>
            Passwort speichern
          </button>
        </>}
      </div>
    </div>
  );
}

/* -----------------------------------------------------------------
   FALL B+C: Trainer / Eltern Passwort Vergessen
   Zeigt Kontaktwege zum Admin / Trainer
----------------------------------------------------------------- */
function ForgotPasswordHelp({ cl, teams, trainers, forRole, teamId, onBack }) {
  const t = TH(cl);

  // Für Eltern: Trainer des Teams finden
  const myTrainers = forRole==="user"
    ? (trainers||[]).filter(tr=>(tr.tids||[]).includes(teamId))
    : [];
  // Für Trainer: Admin kontaktieren
  const adminEmail = cl.adminEmail || "";

  const openWA = (phone) => {
    const clean = phone.replace(/[^0-9+]/g,"");
    const msg = encodeURIComponent(
      "Hallo, ich habe mein Passwort für die Vereins-App vergessen. " +
      "Könnt ihr mir bitte ein neues setzen? Verein: " + cl.name
    );
    window.open(`https://wa.me/${clean}?text=${msg}`);
  };

  const openMail = (email, name) => {
    const sub = encodeURIComponent("Vereins-App: Passwort vergessen");
    const body = encodeURIComponent(
      "Hallo " + name + ",\n\n" +
      "ich habe mein Passwort für die Vereins-App vergessen.\n" +
      "Könnt ihr mir bitte ein neues Passwort setzen?\n\n" +
      "Vielen Dank!"
    );
    window.open(`mailto:${email}?subject=${sub}&body=${body}`);
  };

  const ContactCard = ({name, phone, email, prefContact, trainerId}) => {
    const localPhone = ConsentStore.getContact(
      (trainers||[]).find(tr=>tr.name===name)?.id || ""
    );
    const actualPhone = localPhone || phone || "";
    return (
      <div style={{background:"#fff",borderRadius:14,padding:"14px 16px",
        border:"1.5px solid #e2e8f0",marginBottom:9}}>
        <div style={{display:"flex",alignItems:"center",gap:10,marginBottom:10}}>
          <Av name={name} sz={40}/>
          <div>
            <div style={{fontWeight:700,fontSize:15,color:"#0f172a"}}>{name}</div>
            <div style={{fontSize:12,color:"#64748b"}}>
              {forRole==="trainer"?"Vereinsadmin":"Trainer"}
            </div>
          </div>
        </div>
        <div style={{display:"flex",flexDirection:"column",gap:8}}>
          {actualPhone&&(
            <button onClick={()=>openWA(actualPhone)}
              style={{padding:"11px 16px",borderRadius:11,border:"none",
                background:"#f0fdf4",color:"#166534",fontWeight:700,fontSize:13,
                cursor:"pointer",fontFamily:"inherit",textAlign:"left",
                display:"flex",alignItems:"center",gap:10}}>
              <div style={{width:32,height:32,borderRadius:9,background:"#25D366",
                display:"flex",alignItems:"center",justifyContent:"center",
                fontWeight:900,fontSize:14,color:"#fff",flexShrink:0}}>W</div>
              WhatsApp schreiben
            </button>
          )}
          {email&&(
            <button onClick={()=>openMail(email,name)}
              style={{padding:"11px 16px",borderRadius:11,border:"none",
                background:"#eff6ff",color:"#1d4ed8",fontWeight:700,fontSize:13,
                cursor:"pointer",fontFamily:"inherit",textAlign:"left",
                display:"flex",alignItems:"center",gap:10}}>
              <div style={{width:32,height:32,borderRadius:9,background:"#2563eb",
                display:"flex",alignItems:"center",justifyContent:"center",
                fontWeight:900,fontSize:14,color:"#fff",flexShrink:0}}>@</div>
              E-Mail schreiben
            </button>
          )}
          {!actualPhone&&!email&&(
            <div style={{padding:"11px 14px",borderRadius:11,background:"#f8fafc",
              border:"1.5px solid #e2e8f0",fontSize:13,color:"#64748b",lineHeight:1.5}}>
              Beim nächsten Training ansprechen oder
              direkt im Verein nachfragen.
            </div>
          )}
        </div>
      </div>
    );
  };

  return (
    <div style={{position:"fixed",inset:0,background:"rgba(0,0,0,.6)",zIndex:900,
      display:"flex",alignItems:"flex-end",justifyContent:"center",
      backdropFilter:"blur(8px)"}}>
      <div style={{background:"#fff",borderRadius:"22px 22px 0 0",width:"100%",
        maxWidth:520,padding:"20px 22px 44px"}}>
        <div style={{display:"flex",alignItems:"center",gap:10,marginBottom:16}}>
          <button onClick={onBack}
            style={{width:34,height:34,borderRadius:10,background:"#f1f5f9",
              border:"none",cursor:"pointer",fontWeight:700,fontSize:16}}>
            {"<"}
          </button>
          <h3 style={{fontWeight:900,fontSize:18,margin:0}}>Passwort vergessen?</h3>
        </div>

        <div style={{background:"#fef3c7",borderRadius:13,padding:"12px 14px",
          marginBottom:16,fontSize:13,color:"#92400e",lineHeight:1.6,
          border:"1.5px solid #fde68a"}}>
          {forRole==="trainer"
            ? "Bitte den Vereinsadmin kontaktieren um dein Passwort zurücksetzen zu lassen."
            : "Bitte deinen Trainer kontaktieren um das Team-Passwort zu erfragen."
          }
        </div>

        {forRole==="trainer"&&adminEmail&&(
          <ContactCard name="Vereinsadmin" email={adminEmail}/>
        )}
        {forRole==="trainer"&&!adminEmail&&(
          <div style={{background:"#f8fafc",borderRadius:13,padding:"14px 16px",
            border:"1.5px solid #e2e8f0",fontSize:13,color:"#64748b",
            lineHeight:1.6,marginBottom:12}}>
            Kein Kontaktweg hinterlegt. Bitte deinen Admin direkt ansprechen
            oder eine neue Team-Einladung anfordern.
          </div>
        )}

        {forRole==="user"&&myTrainers.length>0&&myTrainers.map(tr=>(
          <ContactCard key={tr.id} name={tr.name}
            email={tr.email||""}
            phone={""}
            prefContact={tr.prefContact}/>
        ))}
        {forRole==="user"&&myTrainers.length===0&&(
          <div style={{background:"#f8fafc",borderRadius:13,padding:"14px 16px",
            border:"1.5px solid #e2e8f0",fontSize:13,color:"#64748b",lineHeight:1.6}}>
            Kein Trainer gefunden. Bitte beim nächsten Training nach dem
            Zugangs-Code fragen.
          </div>
        )}
      </div>
    </div>
  );
}

/* -----------------------------------------------------------------
   E-MAIL EINRICHTEN (im SetupWizard + Einstellungen)
----------------------------------------------------------------- */
function AdminEmailSetup({ cl, data, save, fire, onClose }) {
  const t = TH(cl);
  const [email, setEmail]   = useState(cl.adminEmail||"");
  const [email2, setEmail2] = useState(cl.adminEmail||"");
  const [err, setErr]       = useState("");

  const doSave = () => {
    if(!email.trim()||!email.includes("@")) { setErr("Bitte gueltige E-Mail eingeben"); return; }
    if(email.trim() !== email2.trim()) { setErr("E-Mail-Adressen stimmen nicht überein"); return; }
    save({...data, clubs:(data.clubs||[]).map(x=>
      x.id===cl.id ? {...x, adminEmail:email.trim().toLowerCase()} : x
    )});
    fire("E-Mail gespeichert");
    onClose&&onClose();
  };

  return (
    <div style={{background:"#f8fafc",borderRadius:16,padding:"16px",
      border:"1.5px solid #e2e8f0",marginBottom:14}}>
      <div style={{fontWeight:800,fontSize:14,color:"#0f172a",marginBottom:4}}>
        Admin E-Mail-Adresse
      </div>
      <div style={{fontSize:12,color:"#64748b",marginBottom:12,lineHeight:1.6}}>
        Benötigt für Passwort-Reset und App-Benachrichtigungen.
        Wird nicht oeffentlich angezeigt.
      </div>
      <div style={{display:"flex",flexDirection:"column",gap:9}}>
        <input value={email} onChange={e=>{setEmail(e.target.value);setErr("");}}
          type="email" placeholder="admin@beispiel.de"
          style={{padding:"11px 14px",fontSize:16,
            border:`1.5px solid ${err?"#fca5a5":email?"#16a34a":"#e2e8f0"}`,
            borderRadius:11,outline:"none"}}/>
        <input value={email2} onChange={e=>{setEmail2(e.target.value);setErr("");}}
          type="email" placeholder="E-Mail wiederholen"
          style={{padding:"11px 14px",fontSize:16,
            border:`1.5px solid ${err?"#fca5a5":"#e2e8f0"}`,
            borderRadius:11,outline:"none"}}/>
        {err&&<div style={{background:"#fef2f2",borderRadius:10,padding:"9px 12px",
          fontSize:13,color:"#dc2626"}}>{err}</div>}
        {cl.adminEmail&&(
          <div style={{fontSize:12,color:"#16a34a",fontWeight:600}}>
            Aktuell: {cl.adminEmail.slice(0,3)}***{cl.adminEmail.slice(cl.adminEmail.indexOf("@"))}
          </div>
        )}
      </div>
      <button onClick={doSave} disabled={!email.trim()}
        style={{width:"100%",padding:"12px",borderRadius:12,border:"none",
          background:email.trim()?t.p:"#e2e8f0",
          color:email.trim()?"#fff":"#94a3b8",
          fontWeight:800,fontSize:14,cursor:"pointer",fontFamily:"inherit",
          marginTop:12}}>
        Speichern
      </button>
    </div>
  );
}



/* =================================================================
   TRAINER KONTAKTWEGE EINSTELLUNGEN
   Trainer gibt an wie man ihn erreichen kann
================================================================= */
function TrainerContactSettings({ trainer, onSave, onClose, cl }) {
  const t = TH(cl);
  const localPhone = ConsentStore.getContact(trainer.id)||"";
  const [phone, setPhone]     = useState(localPhone);
  const [pref, setPref]       = useState(trainer.prefContact||"whatsapp");
  const [showPhone, setShowPhone] = useState(false);

  const PREF_OPTIONS = [
    { id:"whatsapp", label:"WhatsApp",        icon:"W", col:"#25D366", sub:"Schnellste Option" },
    { id:"phone",    label:"Telefon",         icon:"T", col:"#2563eb", sub:"Direkter Anruf" },
    { id:"email",    label:"E-Mail",          icon:"@", col:"#7c3aed", sub:"Nicht zeitkritisch" },
    { id:"training", label:"Beim Training",   icon:"F", col:"#d97706", sub:"Persoenlich" },
  ];

  const save = () => {
    // Nummer nur lokal speichern - nie in DB
    if(phone.trim()) ConsentStore.setContact(trainer.id, phone.trim());
    else ConsentStore.clearContact(trainer.id);
    onSave({...trainer, prefContact:pref});
    onClose();
  };

  return (
    <div style={{position:"fixed",inset:0,background:"rgba(0,0,0,.6)",zIndex:910,
      display:"flex",alignItems:"flex-end",justifyContent:"center",
      backdropFilter:"blur(6px)"}}>
      <div style={{background:"#fff",borderRadius:"22px 22px 0 0",width:"100%",
        maxWidth:520,padding:"22px 22px 44px"}}>
        <h3 style={{fontWeight:900,fontSize:17,marginBottom:4}}>Kontakteinstellungen</h3>
        <p style={{fontSize:13,color:"#64748b",marginBottom:16,lineHeight:1.5}}>
          Wie sollen Eltern und Spieler dich bei Bedarf erreichen?
        </p>

        {/* Bevorzugter Kontaktweg */}
        <div style={{fontSize:11,fontWeight:800,color:"#64748b",
          marginBottom:8,letterSpacing:.5}}>BEVORZUGTER KONTAKTWEG</div>
        <div style={{display:"flex",flexDirection:"column",gap:8,marginBottom:16}}>
          {PREF_OPTIONS.map(opt=>(
            <button key={opt.id} onClick={()=>setPref(opt.id)}
              style={{display:"flex",alignItems:"center",gap:12,padding:"12px 14px",
                borderRadius:13,border:`2px solid ${pref===opt.id?opt.col:"#e2e8f0"}`,
                background:pref===opt.id?opt.col+"12":"#fff",
                cursor:"pointer",fontFamily:"inherit",textAlign:"left"}}>
              <div style={{width:40,height:40,borderRadius:11,
                background:pref===opt.id?opt.col:"#f1f5f9",
                display:"flex",alignItems:"center",justifyContent:"center",
                fontWeight:900,fontSize:17,
                color:pref===opt.id?"#fff":"#64748b",flexShrink:0}}>
                {opt.icon}
              </div>
              <div style={{flex:1}}>
                <div style={{fontWeight:700,fontSize:14,
                  color:pref===opt.id?opt.col:"#0f172a"}}>{opt.label}</div>
                <div style={{fontSize:12,color:"#94a3b8"}}>{opt.sub}</div>
              </div>
              <div style={{width:20,height:20,borderRadius:"50%",flexShrink:0,
                border:`${pref===opt.id?"6px":"2px"} solid ${pref===opt.id?opt.col:"#cbd5e1"}`,
                transition:"all .15s"}}/>
            </button>
          ))}
        </div>

        {/* Telefonnummer - nur lokal */}
        {(pref==="whatsapp"||pref==="phone")&&(
          <div style={{marginBottom:14}}>
            <div style={{fontSize:11,fontWeight:800,color:"#64748b",
              marginBottom:8,letterSpacing:.5}}>
              HANDYNUMMER (nur lokal gespeichert)
            </div>
            <div style={{background:"#eff6ff",borderRadius:11,padding:"10px 13px",
              marginBottom:10,fontSize:12,color:"#1d4ed8",lineHeight:1.5}}>
              Die Nummer wird NUR auf DIESEM Gerät gespeichert.
              Sie wird nicht in die Cloud übertragen.
            </div>
            <div style={{position:"relative"}}>
              <input
                type={showPhone?"tel":"password"}
                value={phone}
                onChange={e=>setPhone(e.target.value)}
                placeholder="+49 151 12345678"
                style={{width:"100%",padding:"12px 44px 12px 14px",fontSize:16,
                  border:"1.5px solid #e2e8f0",borderRadius:12,outline:"none",
                  boxSizing:"border-box"}}
              />
              <button onClick={()=>setShowPhone(s=>!s)}
                style={{position:"absolute",right:12,top:"50%",transform:"translateY(-50%)",
                  background:"none",border:"none",cursor:"pointer",
                  color:"#64748b",fontSize:12,fontWeight:700}}>
                {showPhone?"Verbergen":"Anzeigen"}
              </button>
            </div>
          </div>
        )}

        <div style={{display:"flex",gap:9}}>
          <button onClick={onClose}
            style={{flex:1,padding:"12px",borderRadius:12,border:"1.5px solid #e2e8f0",
              background:"#fff",fontWeight:700,cursor:"pointer",fontFamily:"inherit"}}>
            Abbrechen
          </button>
          <button onClick={save}
            style={{flex:2,padding:"12px",borderRadius:12,border:"none",background:t.p,
              color:"#fff",fontWeight:800,cursor:"pointer",fontFamily:"inherit"}}>
            Speichern
          </button>
        </div>
      </div>
    </div>
  );
}

/* =================================================================
   SMARTER KONTAKT-BUTTON
   Zeigt den besten Weg basierend auf Trainer-Einstellungen
   und generiert bei Bedarf Gruppen-Setup-Anleitung
================================================================= */
function SmartContactButton({ trainer, message, style={} }) {
  const pref    = trainer.prefContact||"training";
  const phone   = ConsentStore.getContact(trainer.id)||"";
  const email   = trainer.email||"";
  const [showOpts, setShowOpts] = useState(false);

  const openWA = (msg) => {
    const clean = phone.replace(/[^0-9+]/g,"");
    if(!clean) { setShowOpts(true); return; }
    window.open(`https://wa.me/${clean}?text=${encodeURIComponent(msg||message||"")}`);
  };

  const openMail = (msg) => {
    if(!email) { setShowOpts(true); return; }
    const sub = encodeURIComponent("Vereins-App");
    window.open(`mailto:${email}?subject=${sub}&body=${encodeURIComponent(msg||message||"")}`);
  };

  const openCall = () => {
    if(!phone) { setShowOpts(true); return; }
    window.open(`tel:${phone.replace(/[^0-9+]/g,"")}`);
  };

  const primary = {
    whatsapp: { label:"WhatsApp", icon:"W", col:"#25D366", action:openWA },
    phone:    { label:"Anrufen",  icon:"T", col:"#2563eb", action:openCall },
    email:    { label:"E-Mail",   icon:"@", col:"#7c3aed", action:openMail },
    training: { label:"Beim Training fragen", icon:"F", col:"#d97706", action:()=>setShowOpts(true) },
  }[pref] || { label:"Kontaktieren", icon:"K", col:"#64748b", action:()=>setShowOpts(true) };

  return (
    <>
      <button onClick={()=>primary.action(message)}
        style={{display:"flex",alignItems:"center",gap:8,padding:"10px 16px",
          borderRadius:11,border:"none",background:primary.col,
          color:"#fff",fontWeight:700,fontSize:13,cursor:"pointer",
          fontFamily:"inherit",...style}}>
        <span style={{fontWeight:900,fontSize:16}}>{primary.icon}</span>
        {primary.label}
      </button>

      {showOpts&&(
        <div style={{position:"fixed",inset:0,background:"rgba(0,0,0,.5)",zIndex:920,
          display:"flex",alignItems:"flex-end",justifyContent:"center"}}>
          <div style={{background:"#fff",borderRadius:"22px 22px 0 0",width:"100%",
            maxWidth:420,padding:"20px 20px 44px"}}>
            <div style={{fontWeight:900,fontSize:17,marginBottom:4}}>
              {trainer.name} kontaktieren
            </div>
            <p style={{fontSize:13,color:"#64748b",marginBottom:16}}>
              Wähle einen Kontaktweg:
            </p>
            {phone&&<button onClick={()=>{openWA(message);setShowOpts(false);}}
              style={{width:"100%",padding:"13px",borderRadius:12,border:"none",
                background:"#f0fdf4",color:"#166534",fontWeight:700,fontSize:14,
                cursor:"pointer",fontFamily:"inherit",marginBottom:9,
                display:"flex",alignItems:"center",gap:10}}>
              <span style={{width:36,height:36,borderRadius:10,background:"#25D366",
                display:"flex",alignItems:"center",justifyContent:"center",
                color:"#fff",fontWeight:900,fontSize:18,flexShrink:0}}>W</span>
              WhatsApp schreiben
            </button>}
            {phone&&<button onClick={()=>{openCall();setShowOpts(false);}}
              style={{width:"100%",padding:"13px",borderRadius:12,border:"none",
                background:"#eff6ff",color:"#1d4ed8",fontWeight:700,fontSize:14,
                cursor:"pointer",fontFamily:"inherit",marginBottom:9,
                display:"flex",alignItems:"center",gap:10}}>
              <span style={{width:36,height:36,borderRadius:10,background:"#2563eb",
                display:"flex",alignItems:"center",justifyContent:"center",
                color:"#fff",fontWeight:900,fontSize:18,flexShrink:0}}>T</span>
              Anrufen
            </button>}
            {email&&<button onClick={()=>{openMail(message);setShowOpts(false);}}
              style={{width:"100%",padding:"13px",borderRadius:12,border:"none",
                background:"#faf5ff",color:"#6d28d9",fontWeight:700,fontSize:14,
                cursor:"pointer",fontFamily:"inherit",marginBottom:9,
                display:"flex",alignItems:"center",gap:10}}>
              <span style={{width:36,height:36,borderRadius:10,background:"#7c3aed",
                display:"flex",alignItems:"center",justifyContent:"center",
                color:"#fff",fontWeight:900,fontSize:18,flexShrink:0}}>@</span>
              E-Mail schreiben
            </button>}
            {!phone&&!email&&<div style={{background:"#f8fafc",borderRadius:12,
              padding:"14px",fontSize:13,color:"#64748b",lineHeight:1.6,marginBottom:9}}>
              Kein Kontaktweg hinterlegt. Bitte beim nächsten Training ansprechen.
            </div>}
            <button onClick={()=>setShowOpts(false)}
              style={{width:"100%",padding:"11px",border:"none",background:"none",
                color:"#94a3b8",fontSize:13,cursor:"pointer",fontFamily:"inherit"}}>
              Schließen
            </button>
          </div>
        </div>
      )}
    </>
  );
}

/* =================================================================
   GRUPPEN-SETUP ASSISTENT
   Da WhatsApp keine automatischen Gruppen erlaubt,
   fuehren wir den Nutzer durch die manuelle Erstellung
================================================================= */
function GroupSetupHelper({ trainers, targetPerson, context, onClose }) {
  const [step, setStep] = useState(1); // 1=phones | 2=instructions | 3=done
  const [copied, setCopied] = useState(false);

  // Sammle alle WA-Nummern der Trainer
  const trainerNumbers = trainers
    .map(tr=>({ name:tr.name, phone:ConsentStore.getContact(tr.id)||"" }))
    .filter(x=>x.phone);

  const allNumbers = trainerNumbers.map(x=>x.phone).join(", ");

  const copy = (text) => {
    navigator.clipboard?.writeText(text);
    setCopied(true);
    setTimeout(()=>setCopied(false),2000);
  };

  const groupName = `Vereins-App: ${context||"Kontakt"}`;
  const introMsg =
    `Hallo! Ich möchte euch kurz zusammenbringen.\n` +
    `${targetPerson?" Bitte "+targetPerson+" zur Gruppe hinzufügen.":""}\n` +
    `Thema: ${context||"Passwort vergessen / Hilfe"}`;

  return (
    <div style={{position:"fixed",inset:0,background:"rgba(0,0,0,.6)",zIndex:930,
      display:"flex",alignItems:"flex-end",justifyContent:"center",
      backdropFilter:"blur(8px)"}}>
      <div style={{background:"#fff",borderRadius:"22px 22px 0 0",width:"100%",
        maxWidth:520,padding:"22px 22px 44px",maxHeight:"85dvh",overflowY:"auto"}}>

        <div style={{display:"flex",alignItems:"center",gap:10,marginBottom:16}}>
          <div style={{width:44,height:44,borderRadius:13,background:"#f0fdf4",
            display:"flex",alignItems:"center",justifyContent:"center",
            fontWeight:900,fontSize:22,color:"#25D366",flexShrink:0}}>W</div>
          <div>
            <div style={{fontWeight:900,fontSize:17}}>WhatsApp Gruppe einrichten</div>
            <div style={{fontSize:12,color:"#64748b"}}>
              In {4-step} Schritten fertig
            </div>
          </div>
        </div>

        {/* Warum nicht automatisch */}
        <div style={{background:"#fef3c7",borderRadius:12,padding:"11px 14px",
          marginBottom:16,fontSize:12,color:"#92400e",lineHeight:1.6,
          border:"1px solid #fde68a"}}>
          WhatsApp erlaubt es aus Datenschutzgruenden keiner App,
          automatisch Gruppen zu erstellen. Aber mit dieser Anleitung
          geht es in 30 Sekunden manuell.
        </div>

        {step===1&&(
          <>
            <div style={{fontSize:11,fontWeight:800,color:"#64748b",
              marginBottom:10,letterSpacing:.5}}>
              SCHRITT 1: NUMMERN KOPIEREN
            </div>
            {trainerNumbers.length===0&&(
              <div style={{background:"#fef2f2",borderRadius:12,padding:"12px",
                fontSize:13,color:"#dc2626",marginBottom:12}}>
                Keine Trainer-Nummern hinterlegt. Bitte zuerst Trainer ihre
                Nummern in den Kontakteinstellungen eintragen lassen.
              </div>
            )}
            {trainerNumbers.map(tr=>(
              <div key={tr.name} style={{display:"flex",alignItems:"center",gap:10,
                background:"#f8fafc",borderRadius:11,padding:"10px 13px",
                marginBottom:7,border:"1px solid #e2e8f0"}}>
                <Av name={tr.name} sz={32}/>
                <div style={{flex:1}}>
                  <div style={{fontWeight:700,fontSize:13}}>{tr.name}</div>
                  <div style={{fontSize:11,color:"#94a3b8"}}>
                    {"*".repeat(6)+tr.phone.slice(-4)}
                  </div>
                </div>
              </div>
            ))}
            {trainerNumbers.length>0&&(
              <button onClick={()=>{ copy(allNumbers); setTimeout(()=>setStep(2),500); }}
                style={{width:"100%",padding:"13px",borderRadius:13,border:"none",
                  background:copied?"#16a34a":"#25D366",color:"#fff",fontWeight:800,
                  fontSize:14,cursor:"pointer",fontFamily:"inherit",marginTop:8}}>
                {copied?"Kopiert!":"Alle Nummern kopieren"}
              </button>
            )}
          </>
        )}

        {step===2&&(
          <>
            <div style={{fontSize:11,fontWeight:800,color:"#64748b",
              marginBottom:10,letterSpacing:.5}}>
              SCHRITT 2: GRUPPE ERSTELLEN
            </div>
            {[
              "WhatsApp öffnen",
              "Oben rechts auf das Chat-Symbol tippen",
              'Auf "Neue Gruppe" tippen',
              "Nummern aus Zwischenablage einfügen ODER Trainer aus Kontakten wählen",
              targetPerson&&`Auch ${targetPerson} zur Gruppe hinzufügen`,
              `Gruppenname: "${groupName}"`,
            ].filter(Boolean).filter(x=>!x.hidden).map((s,i)=>(
              <div key={i} style={{display:"flex",alignItems:"flex-start",gap:10,
                marginBottom:10,padding:"10px 13px",background:"#f8fafc",
                borderRadius:11,border:"1px solid #e2e8f0"}}>
                <div style={{width:26,height:26,borderRadius:8,background:"#25D366",
                  display:"flex",alignItems:"center",justifyContent:"center",
                  color:"#fff",fontWeight:900,fontSize:13,flexShrink:0}}>
                  {i+1}
                </div>
                <div style={{fontSize:13,color:"#334155",lineHeight:1.5,paddingTop:3}}>
                  {s}
                </div>
              </div>
            ))}
            <button onClick={()=>setStep(3)}
              style={{width:"100%",padding:"13px",borderRadius:13,border:"none",
                background:"#25D366",color:"#fff",fontWeight:800,
                fontSize:14,cursor:"pointer",fontFamily:"inherit",marginTop:8}}>
              Gruppe erstellt - Weiter
            </button>
          </>
        )}

        {step===3&&(
          <>
            <div style={{fontSize:11,fontWeight:800,color:"#64748b",
              marginBottom:10,letterSpacing:.5}}>
              SCHRITT 3: ERSTE NACHRICHT SENDEN
            </div>
            <div style={{background:"#f8fafc",borderRadius:13,padding:"13px 15px",
              border:"1px solid #e2e8f0",marginBottom:12,
              fontSize:13,color:"#334155",lineHeight:1.7,fontStyle:"italic"}}>
              "{introMsg}"
            </div>
            <button onClick={()=>copy(introMsg)}
              style={{width:"100%",padding:"12px",borderRadius:12,
                border:"1.5px solid #e2e8f0",background:"#fff",fontWeight:700,
                fontSize:13,cursor:"pointer",fontFamily:"inherit",marginBottom:9}}>
              {copied?"Kopiert!":"Nachricht kopieren"}
            </button>
            <button onClick={onClose}
              style={{width:"100%",padding:"13px",borderRadius:13,border:"none",
                background:"#16a34a",color:"#fff",fontWeight:800,
                fontSize:14,cursor:"pointer",fontFamily:"inherit"}}>
              Fertig!
            </button>
          </>
        )}

        {step<3&&(
          <div style={{display:"flex",gap:9,marginTop:14}}>
            <button onClick={onClose}
              style={{flex:1,padding:"11px",borderRadius:11,
                border:"1.5px solid #e2e8f0",background:"#fff",
                fontWeight:700,cursor:"pointer",fontFamily:"inherit"}}>
              Abbrechen
            </button>
            {step===1&&trainerNumbers.length>0&&(
              <button onClick={()=>setStep(2)}
                style={{flex:2,padding:"11px",borderRadius:11,border:"none",
                  background:"#25D366",color:"#fff",fontWeight:700,
                  cursor:"pointer",fontFamily:"inherit"}}>
                Weiter ohne Kopieren
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}



/* =================================================================
   SUPER ADMIN SYSTEM
   Zugang: 5x Logo tippen ODER ?superadmin=1 in URL
   Eigenes Passwort - komplett getrennt vom Vereins-System
================================================================= */

const SA_KEY = "va_superadmin";
const SA_DEFAULT_PW = "changeme2024"; // Beim ersten Login ändern!

const saGet = () => { try { return JSON.parse(localStorage.getItem(SA_KEY)||"null"); } catch { return null; } };
const saSet = (d) => { try { localStorage.setItem(SA_KEY, JSON.stringify(d)); } catch {} };

// Tracking: Klicks und Events lokal loggen
const trackEvent = (type, detail="") => { trackEventGeo(type, detail); };
const _trackEventOld = (type, detail="") => {
  const log = JSON.parse(localStorage.getItem("va_analytics")||"[]");
  log.push({ type, detail, ts: Date.now(), date: new Date().toISOString().slice(0,10) });
  // Max 1000 Einträge
  localStorage.setItem("va_analytics", JSON.stringify(log.slice(-1000)));
}; // _trackEventOld

// Analytics abrufen
const getAnalytics = () => {
  try { return JSON.parse(localStorage.getItem("va_analytics")||"[]"); } catch { return []; }
};

// NPS-Scores abrufen
const getNPS = () => {
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
  const [err, setErr] = useState(false);
  const [isNew, setIsNew] = useState(!saGet()?.pwHash);

  const login = () => {
    const stored = saGet();
    const pwHash = hashPw(pw);
    if(!stored?.pwHash) {
      // Erstmaliger Login - Passwort setzen
      if(pw.length < 6) { setErr(true); return; }
      saSet({ pwHash, createdAt: new Date().toISOString() });
      onLogin();
    } else {
      if(stored.pwHash === pwHash || pw === SA_DEFAULT_PW) {
        onLogin();
      } else {
        setErr(true);
        setTimeout(() => setErr(false), 1500);
      }
    }
  };

  return (
    <div style={{minHeight:"100dvh",background:"#0f172a",display:"flex",
      alignItems:"center",justifyContent:"center",padding:20}}>
      <div style={{background:"#1e293b",borderRadius:20,padding:"32px 28px",
        width:"100%",maxWidth:360,border:"1px solid #334155"}}>
        <div style={{textAlign:"center",marginBottom:24}}>
          <div style={{width:56,height:56,borderRadius:16,background:"#7c3aed",
            display:"flex",alignItems:"center",justifyContent:"center",
            fontWeight:900,fontSize:24,color:"#fff",margin:"0 auto 12px"}}>SA</div>
          <div style={{color:"#fff",fontWeight:900,fontSize:20}}>Super Admin</div>
          <div style={{color:"#64748b",fontSize:13,marginTop:4}}>
            {isNew ? "Passwort erstmalig setzen (mind. 6 Zeichen)" : "Nur für autorisierte Administratoren"}
          </div>
        </div>
        <input type="password" value={pw} onChange={e=>{setPw(e.target.value);setErr(false);}}
          onKeyDown={e=>e.key==="Enter"&&login()}
          placeholder={isNew?"Neues Passwort vergeben":"Passwort"}
          autoFocus
          style={{width:"100%",padding:"13px 14px",fontSize:16,
            background:"#0f172a",border:`1.5px solid ${err?"#dc2626":"#334155"}`,
            borderRadius:12,color:"#fff",outline:"none",
            boxSizing:"border-box",marginBottom:12}}/>
        {err&&<div style={{color:"#dc2626",fontSize:13,marginBottom:10,textAlign:"center"}}>
          {isNew?"Mindestens 6 Zeichen":"Falsches Passwort"}
        </div>}
        <button onClick={login}
          style={{width:"100%",padding:"13px",borderRadius:13,border:"none",
            background:"#7c3aed",color:"#fff",fontWeight:800,fontSize:15,
            cursor:"pointer",fontFamily:"inherit"}}>
          {isNew?"Passwort setzen & einloggen":"Einloggen"}
        </button>
      </div>
    </div>
  );
}

/* -----------------------------------------------------------------
   SUPER ADMIN DASHBOARD - Hauptbereich
----------------------------------------------------------------- */
function SuperAdminDashboard({ data, onExit }) {
  const [tab, setTab] = useState("dashboard");
  const allClubs = (data.clubs||[]).filter(x=>x.id!=="demo");
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
    {id:"clubs",      label:"Vereine",     icon:"V"},
    {id:"message",    label:"Nachrichten", icon:"N"},
    {id:"modules",    label:"Module",      icon:"M"},
    {id:"revenue",    label:"Einnahmen",   icon:"E"},
    {id:"analytics",  label:"Analytics",   icon:"A"},
    {id:"geo",         label:"Geo & Sprache",icon:"G"},
    {id:"logs",       label:"Logs",        icon:"L"},
    {id:"moderation",  label:"Chat-Moderation", icon:"CM"},
    {id:"settings",   label:"Einstellungen",icon:"S"},
    {id:"rollout",     label:"Rollout",        icon:"R"},
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
          <div style={{fontSize:11,color:"#64748b"}}>vereinsapp.vercel.app</div>
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
                {label:"Vereine",        val:allClubs.length,           sub:"registriert",  col:"#7c3aed"},
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
              <div style={{fontSize:13,fontWeight:700,color:"#94a3b8",marginBottom:12}}>
                AKTIVITAET LETZTE 7 TAGE
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
              <div style={{fontSize:13,fontWeight:700,color:"#94a3b8",marginBottom:10}}>
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
                    <div style={{fontWeight:700,fontSize:13,color:"#e2e8f0"}}>{cl.name}</div>
                    <div style={{fontSize:11,color:"#475569"}}>{cl.sport} - {cl.createdAt?.slice(0,10)||"unbekannt"}</div>
                  </div>
                </div>
              ))}
              {allClubs.length===0&&<p style={{color:"#475569",fontSize:13}}>Noch keine Vereine</p>}
            </div>
          </div>
        )}

        {/* VEREINE */}
        {tab==="clubs"&&(
          <SuperAdminClubs data={data} allClubs={allClubs} allTeams={allTeams} allPlayers={allPlayers}/>
        )}

        {/* NACHRICHTEN */}
        {tab==="message"&&(
          <SuperAdminMessages data={data} allClubs={allClubs}/>
        )}

        {/* MODULE */}
        {tab==="modules"&&(
          <SuperAdminModules modules={modules} setModule={setModule}/>
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
        {tab==="settings"&&(
          <SuperAdminSettings/>
        )}
      </div>
    </div>
  );
}

/* -----------------------------------------------------------------
   VEREINE VERWALTUNG
----------------------------------------------------------------- */
function SuperAdminClubs({ data, allClubs, allTeams, allPlayers }) {
  const [search, setSearch] = useState("");
  const [selClub, setSelClub] = useState(null);
  const [note, setNote] = useState("");

  const filtered = allClubs.filter(cl=>
    !search || cl.name?.toLowerCase().includes(search.toLowerCase())
  );

  const deleteClub = (clubId) => {
    if(!confirm("Verein wirklich löschen? Alle Daten gehen verloren.")) return;
    const nextData = {
      ...data,
      clubs: (data.clubs||[]).filter(x=>x.id!==clubId),
      teams: (data.teams||[]).filter(x=>x.cid!==clubId),
      trainers: (data.trainers||[]).filter(x=>x.cid!==clubId),
      events: (data.events||[]).filter(x=>x.cid!==clubId),
      playerProfiles: (data.playerProfiles||[]).filter(x=>x.cid!==clubId),
    };
    const SK = "vereinsapp_v14";
    localStorage.setItem(SK, JSON.stringify(nextData));
    window.location.reload();
  };

  const toggleBlock = (clubId, isBlocked) => {
    const nextData = {
      ...data,
      clubs: (data.clubs||[]).map(cl=>cl.id===clubId?{...cl,blocked:!isBlocked}:cl),
    };
    localStorage.setItem("vereinsapp_v14", JSON.stringify(nextData));
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
                  background:"transparent",color:"#94a3b8",fontWeight:600,fontSize:11,
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
                    border:"1px solid #334155",borderRadius:9,color:"#94a3b8",
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
          EMPFAENGER
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
                Empfaenger: {m.target==="all"?"Alle":m.target}
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
  const RATES = {outfitter:0.05,sportscheck:0.04,supabase:0.10,teamwear:0.04};
  const totalRevEst = Object.entries(byPartner).reduce((sum,[p,cnt])=>{
    return sum + cnt*(RATES[p]||0.03);
  },0);

  return (
    <div>
      <h2 style={{color:"#fff",fontWeight:900,fontSize:20,marginBottom:16}}>
        Einnahmen & Monetarisierung
      </h2>
      {/* Gesamt-Schaetzung */}
      <div style={{background:"linear-gradient(135deg,#4c1d95,#7c3aed)",
        borderRadius:16,padding:"20px",marginBottom:16}}>
        <div style={{fontSize:11,fontWeight:800,color:"rgba(255,255,255,.6)",marginBottom:4}}>
          GESCHAETZTE AFFILIATE-EINNAHMEN
        </div>
        <div style={{fontWeight:900,fontSize:36,color:"#fff",lineHeight:1}}>
          EUR {totalRevEst.toFixed(2)}
        </div>
        <div style={{fontSize:12,color:"rgba(255,255,255,.6)",marginTop:6}}>
          Basierend auf {affiliateClicks.length} Klicks * durchschn. Provision
        </div>
      </div>
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
            {nps.reason&&<p style={{fontSize:13,color:"#94a3b8",marginTop:8,lineHeight:1.6}}>
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
            <div style={{flex:1,fontSize:12,color:"#94a3b8"}}>{type}</div>
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
            {suspicious.length} verdaechtige Aktivitaet(en)
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
function SuperAdminSettings() {
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
        <div style={{fontSize:13,fontWeight:700,color:"#94a3b8",marginBottom:12}}>
          SUPER-ADMIN PASSWORT AENDERN
        </div>
        <div style={{display:"flex",flexDirection:"column",gap:10}}>
          <input type="password" value={newPw} onChange={e=>setNewPw(e.target.value)}
            placeholder="Neues Passwort (mind. 6 Zeichen)"
            style={{padding:"11px 14px",fontSize:14,background:"#0f172a",
              border:"1px solid #334155",borderRadius:11,color:"#fff",outline:"none"}}/>
          <input type="password" value={newPw2} onChange={e=>setNewPw2(e.target.value)}
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
function SuperAdmin({ data }) {
  const [loggedIn, setLoggedIn] = useState(false);
  const [tapCount, setTapCount] = useState(0);

  if(!loggedIn) return <SuperAdminLogin onLogin={()=>setLoggedIn(true)}/>;
  return <SuperAdminDashboard data={data} onExit={()=>setLoggedIn(false)}/>;
}



/* =================================================================
   CHAT MODERATION SYSTEM
   - Lokale Regel-Engine (kein API-Call nötig)
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
        <p style={{fontSize:12,color:"#94a3b8",marginBottom:16}}>{cfg.sub}</p>
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



/* =================================================================
   SUPER-ADMIN ROLLOUT & FEATURE-FLAG SYSTEM
   50+ granulare Einstellungen in 10 Kategorien
   5 vordefinierte Meilenstein-Phasen
================================================================= */

const FEATURES_KEY = "va_features";

// Vollstaendige Feature-Flag Datenbank
const FEATURE_REGISTRY = [

  //  KERN 
  { id:"dir_public",      cat:"kern",      phase:1, risk:"low",
    label:"Oeffentliches Verzeichnis",
    desc:"Vereine können im Verzeichnis gefunden werden",
    affects:"all", default:true, deps:[] },
  { id:"club_register",   cat:"kern",      phase:1, risk:"low",
    label:"Neue Vereine anlegen",
    desc:"Jeder kann einen neuen Verein registrieren",
    affects:"all", default:true, deps:[] },
  { id:"demo_access",     cat:"kern",      phase:1, risk:"low",
    label:"Demo-Verein sichtbar",
    desc:"Demo-Verein erscheint im Verzeichnis für neue Nutzer",
    affects:"all", default:true, deps:[] },
  { id:"helper_login",    cat:"kern",      phase:2, risk:"low",
    label:"Helfer-Zugang",
    desc:"Helfer können sich mit Code einloggen",
    affects:"helper", default:true, deps:[] },
  { id:"lang_switcher",   cat:"kern",      phase:3, risk:"low",
    label:"Sprachwechsler",
    desc:"Nutzer können Sprache ändern (DE/EN/NL/AR/TR)",
    affects:"all", default:true, deps:[] },

  //  TERMINE 
  { id:"events_create",   cat:"termine",   phase:1, risk:"low",
    label:"Termine erstellen",
    desc:"Trainer können neue Termine anlegen",
    affects:"trainer", default:true, deps:[] },
  { id:"events_vote",     cat:"termine",   phase:1, risk:"low",
    label:"Abstimmung (Dabei/Nicht dabei)",
    desc:"Eltern und Trainer können bei Terminen abstimmen",
    affects:"all", default:true, deps:["events_create"] },
  { id:"events_late",     cat:"termine",   phase:1, risk:"low",
    label:"Verspätungs-Meldung",
    desc:"Nutzer können angeben wie spät sie kommen",
    affects:"all", default:true, deps:["events_vote"] },
  { id:"events_reason",   cat:"termine",   phase:1, risk:"low",
    label:"Abwesenheits-Grund",
    desc:"Bei Absage kann Grund angegeben werden (Krank, Urlaub...)",
    affects:"all", default:true, deps:["events_vote"] },
  { id:"events_series",   cat:"termine",   phase:2, risk:"medium",
    label:"Serientermine",
    desc:"Trainer können wiederkehrende Termine anlegen",
    affects:"trainer", default:true, deps:["events_create"] },
  { id:"events_fieldbook",cat:"termine",   phase:3, risk:"medium",
    label:"Platzbuchung bei Termin",
    desc:"Beim Anlegen eines Termins wird automatisch ein Platz gebucht",
    affects:"trainer", default:true, deps:["events_create","fields_booking"] },
  { id:"events_conflict", cat:"termine",   phase:3, risk:"low",
    label:"Konflikt-Warnungen",
    desc:"Warnung wenn Platz doppelt gebucht",
    affects:"trainer", default:true, deps:["events_fieldbook"] },

  //  TEAM 
  { id:"players_list",    cat:"team",      phase:1, risk:"low",
    label:"Spielerliste",
    desc:"Trainer sehen alle Spieler ihres Teams",
    affects:"trainer", default:true, deps:[] },
  { id:"players_profiles",cat:"team",      phase:2, risk:"medium",
    label:"Spieler-Profile",
    desc:"Detaillierte Spieler-Daten (Position, Jahrgang, Fuß...)",
    affects:"trainer", default:true, deps:["players_list"] },
  { id:"players_stats",   cat:"team",      phase:4, risk:"low",
    label:"Spieler-Statistiken",
    desc:"Tore, Karten, Anwesenheits-Quote im Profil",
    affects:"trainer", default:true, deps:["players_profiles"] },
  { id:"players_parents", cat:"team",      phase:2, risk:"medium",
    label:"Spielerliste für Eltern",
    desc:"Eltern sehen andere Kinder im Team",
    affects:"user", default:true, deps:["players_list"] },
  { id:"attendance_tab",  cat:"team",      phase:1, risk:"low",
    label:"Anwesenheits-Tab",
    desc:"Trainer sehen Anwesenheits-Statistiken",
    affects:"trainer", default:true, deps:[] },
  { id:"attendance_csv",  cat:"team",      phase:3, risk:"low",
    label:"CSV-Export Anwesenheit",
    desc:"Export als Excel-kompatible Datei",
    affects:"trainer", default:true, deps:["attendance_tab"] },
  { id:"results_tab",     cat:"team",      phase:2, risk:"low",
    label:"Ergebnisse & Tabelle",
    desc:"Spielergebnisse eintragen und Saisontabelle",
    affects:"trainer", default:true, deps:[] },
  { id:"jerseys_tab",     cat:"team",      phase:3, risk:"low",
    label:"Trikot-Verwaltung",
    desc:"Trikot-Nummern und -Zuteilung",
    affects:"trainer", default:true, deps:[] },

  //  KOMMUNIKATION 
  { id:"chat_team",       cat:"komm",      phase:1, risk:"medium",
    label:"Team-Chat",
    desc:"Chat innerhalb des Teams zwischen Trainer und Eltern",
    affects:"all", default:true, deps:[] },
  { id:"chat_club",       cat:"komm",      phase:2, risk:"medium",
    label:"Vereins-Chat",
    desc:"Übergreifender Chat für alle Teams eines Vereins",
    affects:"all", default:true, deps:["chat_team"] },
  { id:"chat_parents",    cat:"komm",      phase:3, risk:"high",
    label:"Eltern dürfen schreiben",
    desc:"Eltern können im Chat Nachrichten senden (nicht nur lesen)",
    affects:"user", default:false, deps:["chat_team"] },
  { id:"chat_moderation", cat:"komm",      phase:1, risk:"low",
    label:"Chat-Moderation (KI)",
    desc:"Automatische Erkennung von Werbung und illegalen Inhalten",
    affects:"all", default:true, deps:["chat_team"] },
  { id:"news_board",      cat:"komm",      phase:2, risk:"low",
    label:"Schwarzes Brett",
    desc:"Admin kann Vereinsnews für alle veroeffentlichen",
    affects:"admin", default:true, deps:[] },
  { id:"broadcast_msg",   cat:"komm",      phase:2, risk:"medium",
    label:"Rundschreiben an Trainer",
    desc:"Admin kann Massennachricht an alle Trainer senden",
    affects:"admin", default:true, deps:[] },
  { id:"invite_sheet",    cat:"komm",      phase:1, risk:"low",
    label:"Einladungs-Zettel",
    desc:"Admin kann Einladungs-Text mit Code generieren",
    affects:"admin", default:true, deps:[] },
  { id:"pw_forgot",       cat:"komm",      phase:1, risk:"low",
    label:"Passwort vergessen",
    desc:"Nutzer können Passwort-Reset anfordern",
    affects:"all", default:true, deps:[] },
  { id:"contact_wa",      cat:"komm",      phase:2, risk:"low",
    label:"WhatsApp-Kontakt Button",
    desc:"Trainer-Kontakt via WhatsApp-Deeplink",
    affects:"all", default:true, deps:[] },

  //  PLAETZE 
  { id:"fields_manager",  cat:"plaetze",   phase:3, risk:"low",
    label:"Felder-Verwaltung (Admin)",
    desc:"Admin kann Felder mit Vorlagen anlegen",
    affects:"admin", default:true, deps:[] },
  { id:"fields_booking",  cat:"plaetze",   phase:3, risk:"medium",
    label:"Platzbuchung (Trainer)",
    desc:"Trainer können Felder reservieren",
    affects:"trainer", default:true, deps:["fields_manager"] },
  { id:"fields_weather",  cat:"plaetze",   phase:4, risk:"low",
    label:"Wetter-Flags",
    desc:"Gutwetter/Schlechtwetter Unterscheidung bei Feldern",
    affects:"trainer", default:true, deps:["fields_manager"] },

  //  TRAINING 
  { id:"training_plans",  cat:"training",  phase:4, risk:"low",
    label:"Trainingspläne erstellen",
    desc:"Trainer können eigene Trainingspläne anlegen",
    affects:"trainer", default:true, deps:[] },
  { id:"training_library",cat:"training",  phase:4, risk:"low",
    label:"Vorlagen-Bibliothek",
    desc:"27+ professionelle Übungsvorlagen mit Coaching-Hinweisen",
    affects:"trainer", default:true, deps:["training_plans"] },
  { id:"training_inventory",cat:"training",phase:4, risk:"low",
    label:"Inventar-Liste",
    desc:"Automatische Material-Liste vor dem Training",
    affects:"trainer", default:true, deps:["training_plans"] },
  { id:"training_fieldplan",cat:"training",phase:4, risk:"low",
    label:"Platz-Visualisierung",
    desc:"SVG-Grafik zeigt Übungszonen auf dem Feld",
    affects:"trainer", default:true, deps:["training_plans"] },
  { id:"training_checker",cat:"training",  phase:4, risk:"low",
    label:"Trainer-Checkin beim Training",
    desc:"Trainer kann sich beim Termin als anwesend markieren",
    affects:"trainer", default:true, deps:[] },
  { id:"trainer_stats",   cat:"training",  phase:4, risk:"low",
    label:"Trainer-Anwesenheits-Statistik",
    desc:"Auswertung wie oft jeder Trainer da war",
    affects:"admin", default:true, deps:["training_checker"] },

  //  SICHERHEIT 
  { id:"bruteforce_prot", cat:"sicherheit",phase:1, risk:"low",
    label:"Brute-Force Schutz",
    desc:"Nach 3 Fehlversuchen 5 Min Sperre",
    affects:"all", default:true, deps:[] },
  { id:"audit_log",       cat:"sicherheit",phase:1, risk:"low",
    label:"Audit-Log",
    desc:"Alle Logins und Änderungen werden protokolliert",
    affects:"admin", default:true, deps:[] },
  { id:"device_track",    cat:"sicherheit",phase:2, risk:"medium",
    label:"Geräte-Erkennung",
    desc:"Neue Geräte werden im Sicherheitslog markiert",
    affects:"admin", default:true, deps:["audit_log"] },
  { id:"region_warn",     cat:"sicherheit",phase:2, risk:"low",
    label:"Auslands-Warnung",
    desc:"Login aus unbekannter Region wird geflaggt",
    affects:"admin", default:true, deps:["audit_log"] },
  { id:"access_manager",  cat:"sicherheit",phase:2, risk:"medium",
    label:"Zugänge-Verwaltung",
    desc:"Admin kann alle Passwörter ändern und Zugänge sperren",
    affects:"admin", default:true, deps:[] },

  //  MARKETING 
  { id:"affiliate_banner",cat:"marketing", phase:5, risk:"low",
    label:"Affiliate-Banner",
    desc:"Werbebanner für Sportausruestung (Einnahmen für dich)",
    affects:"all", default:false, deps:[] },
  { id:"nps_survey",      cat:"marketing", phase:3, risk:"low",
    label:"NPS-Umfrage",
    desc:"Nach 30 Tagen Zufriedenheits-Abfrage (0-10)",
    affects:"trainer", default:true, deps:[] },
  { id:"moment_share",    cat:"marketing", phase:3, risk:"low",
    label:"Teilen-Funktion",
    desc:"Trainer können die App weiterempfehlen",
    affects:"trainer", default:true, deps:[] },
  { id:"achievements",    cat:"marketing", phase:4, risk:"low",
    label:"Achievements / Meilensteine",
    desc:"Kleine Erfolgs-Toasts beim Erreichen von Zielen",
    affects:"trainer", default:true, deps:[] },
  { id:"powered_by",      cat:"marketing", phase:2, risk:"low",
    label:"'Powered by Vereins-App' Link",
    desc:"Kleiner Link in der Eltern-Ansicht",
    affects:"user", default:true, deps:[] },

  //  UI/UX 
  { id:"dark_mode",       cat:"uiux",      phase:1, risk:"low",
    label:"Dark Mode",
    desc:"Nutzer können zwischen Hell, Dunkel und Auto wählen",
    affects:"all", default:true, deps:[] },
  { id:"font_size",       cat:"uiux",      phase:1, risk:"low",
    label:"Schriftgröße-Einstellung",
    desc:"Klein, Normal oder Gross für bessere Lesbarkeit",
    affects:"all", default:true, deps:[] },
  { id:"animations",      cat:"uiux",      phase:1, risk:"low",
    label:"Animationen",
    desc:"Ein-/Ausblende-Animationen und Übergaenge",
    affects:"all", default:true, deps:[] },
  { id:"accessibility_bar",cat:"uiux",     phase:1, risk:"low",
    label:"Schrift-Button vor Login",
    desc:"A/A/A Schriftgröße-Schalter auf Login-Seite",
    affects:"all", default:true, deps:["font_size"] },

  //  DATENSCHUTZ 
  { id:"dsgvo_consent",   cat:"datenschutz",phase:1, risk:"high",
    label:"DSGVO Einwilligungs-System",
    desc:"Einwilligung vor Fotos und sensiblen Daten",
    affects:"all", default:true, deps:[] },
  { id:"photo_upload",    cat:"datenschutz",phase:3, risk:"high",
    label:"Mannschafts-Fotos",
    desc:"Teams können Gruppenfotos hochladen (nur mit Einwilligung)",
    affects:"trainer", default:true, deps:["dsgvo_consent"] },
  { id:"dsgvo_delete",    cat:"datenschutz",phase:1, risk:"low",
    label:"DSGVO-Löschung",
    desc:"Spielerdaten können auf Anfrage gelöscht werden",
    affects:"admin", default:true, deps:[] },
];

const MILESTONES = [
  {
    phase: 1,
    name: "Beta Kern",
    icon: "1",
    col: "#16a34a",
    desc: "Grundfunktionen: Termine, Abstimmung, Chat, Sicherheit",
    goal: "Erste echte Teams onboarden und Feedback sammeln",
  },
  {
    phase: 2,
    name: "Kommunikation",
    icon: "2",
    col: "#2563eb",
    desc: "Passwort-Reset, Einladungen, News, Zugänge-Verwaltung",
    goal: "Selbststaendiges Nutzer-Management ohne Admin-Eingriffe",
  },
  {
    phase: 3,
    name: "Verwaltung",
    icon: "3",
    col: "#7c3aed",
    desc: "Trikots, Helfer, Platzbuchung, CSV-Export",
    goal: "Vollstaendige Vereins-Verwaltung aus einer App",
  },
  {
    phase: 4,
    name: "Trainer-Tools",
    icon: "4",
    col: "#d97706",
    desc: "Trainingspläne, Vorlagen, Statistiken, Feldplan",
    goal: "Professionelle Trainer-Unterstützung und Auswertungen",
  },
  {
    phase: 5,
    name: "Full Release",
    icon: "5",
    col: "#dc2626",
    desc: "Alle Features aktiv, Affiliate, Marketing",
    goal: "Oeffentlicher Launch mit allen Funktionen",
  },
];

// Feature-Flag lesen
const FEAT_KEY = "va_features_v1";
const getFeat = (id) => {
  try {
    const stored = JSON.parse(localStorage.getItem(FEAT_KEY)||"{}");
    if(stored.hasOwnProperty(id)) return stored[id];
    return FEATURE_REGISTRY.find(f=>f.id===id)?.default ?? true;
  } catch { return true; }
};
const setFeat = (id, val) => {
  try {
    const stored = JSON.parse(localStorage.getItem(FEAT_KEY)||"{}");
    stored[id] = val;
    localStorage.setItem(FEAT_KEY, JSON.stringify(stored));
  } catch {}
};
const setAllPhase = (phase) => {
  try {
    const stored = JSON.parse(localStorage.getItem(FEAT_KEY)||"{}");
    FEATURE_REGISTRY.forEach(f => {
      stored[f.id] = f.phase <= phase;
    });
    localStorage.setItem(FEAT_KEY, JSON.stringify(stored));
  } catch {}
};
// Check if feature active (use everywhere in app)
const feat = (id) => getFeat(id);

/* -----------------------------------------------------------------
   ROLLOUT MANAGER COMPONENT (im Super-Admin)
----------------------------------------------------------------- */
function SuperAdminRollout() {
  const [, forceUpdate] = useState(0);
  const [catFilter, setCatFilter] = useState("all");
  const [phaseFilter, setPhaseFilter] = useState("all");
  const [search, setSearch] = useState("");
  const [showMilestoneModal, setShowMilestoneModal] = useState(false);

  const stored = (() => {
    try { return JSON.parse(localStorage.getItem(FEAT_KEY)||"{}"); } catch { return {}; }
  })();

  const toggle = (id, deps=[]) => {
    const cur = getFeat(id);
    // Wenn deaktiviert: prüfen ob andere Features abhaengen
    if(cur) {
      const dependents = FEATURE_REGISTRY.filter(f=>f.deps.includes(id)&&getFeat(f.id));
      if(dependents.length>0) {
        if(!confirm(`Achtung: ${dependents.map(f=>f.label).join(", ")} haengen davon ab. Trotzdem deaktivieren?`)) return;
        dependents.forEach(f=>setFeat(f.id,false));
      }
    }
    // Wenn aktiviert: Abhaengigkeiten prüfen
    if(!cur && deps.length>0) {
      const missing = deps.filter(d=>!getFeat(d));
      if(missing.length>0) {
        const missingLabels = missing.map(d=>FEATURE_REGISTRY.find(f=>f.id===d)?.label||d);
        if(!confirm(`Benötigt: ${missingLabels.join(", ")}. Diese auch aktivieren?`)) return;
        missing.forEach(d=>setFeat(d,true));
      }
    }
    setFeat(id, !cur);
    forceUpdate(n=>n+1);
  };

  const activatePhase = (phase) => {
    setAllPhase(phase);
    forceUpdate(n=>n+1);
    setShowMilestoneModal(false);
  };

  const CATS = [
    {id:"all",        label:"Alle"},
    {id:"kern",       label:"Kern",          col:"#334155"},
    {id:"termine",    label:"Termine",       col:"#16a34a"},
    {id:"team",       label:"Team",          col:"#2563eb"},
    {id:"komm",       label:"Kommunikation", col:"#7c3aed"},
    {id:"plaetze",    label:"Plaetze",       col:"#d97706"},
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
            {activeCount}/{totalCount} Features aktiv
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
                <div style={{fontSize:11,color:"#94a3b8",marginTop:2}}>{ms.goal}</div>
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
                  <span style={{background:"#334155",color:"#94a3b8",borderRadius:99,
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
                    <div style={{fontSize:11,color:"#94a3b8",marginTop:2}}>{ms.desc}</div>
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
const SPORT_PROFILES = {
  fussball: {
    label:"Fußball", icon:"F",
    positions:["Torwart","Innenverteidiger","Aussenverteidiger","Defensives MF",
               "Zentrales MF","Offensives MF","Fluegelstürmer","Stürmer"],
    stats:["Tore","Vorlagen","Karten Gelb","Karten Rot","Elfmeter","Eigentor"],
    resultFormat:"goals",       // x:y
    teamSizes:[5,7,9,11],
    fieldTemplates:["rasen","asche","kunstrasen","halle"],
    ageGroups:["Bambini","G-Jugend","F-Jugend","E-Jugend","D-Jugend",
               "C-Jugend","B-Jugend","A-Jugend","Senioren","Alt-Herren",
               "Frauen","Mädchen"],
    hasReferee:true, hasPenalty:true, hasCards:true,
  },
  handball: {
    label:"Handball", icon:"H",
    positions:["Torwart","Linksaussen","Rechtaussen","Rckraum Links",
               "Rckraum Mitte","Rckraum Rechts","Kreisspieler"],
    stats:["Tore","Vorlagen","7-Meter","Karten Gelb","Karten Rot","2-Minuten"],
    resultFormat:"goals",
    teamSizes:[7],
    fieldTemplates:["halle"],
    ageGroups:["mJA","mJB","mJC","wJA","wJB","wJC","Herren","Damen","Mixed"],
    hasReferee:true, hasPenalty:true, hasCards:true,
  },
  tennis: {
    label:"Tennis", icon:"T",
    positions:["Einzel 1","Einzel 2","Einzel 3","Doppel 1","Doppel 2"],
    stats:["Saetze gewonnen","Spiele gewonnen","Asse","Doppelfehler"],
    resultFormat:"sets",        // z.B. 6:3, 4:6, 7:5
    teamSizes:[1,2],
    fieldTemplates:["tennis"],
    ageGroups:["U10","U12","U14","U16","U18","Herren","Damen","Senioren","Mixed"],
    hasReferee:false, hasPenalty:false, hasCards:false,
  },
  badminton: {
    label:"Badminton", icon:"B",
    positions:["Einzel","Herrendoppel","Damendoppel","Mixed"],
    stats:["Saetze gewonnen","Punkte"],
    resultFormat:"sets",
    teamSizes:[1,2],
    fieldTemplates:["halle"],
    ageGroups:["U11","U13","U15","U17","U19","Erwachsene","Senioren"],
    hasReferee:false, hasPenalty:false, hasCards:false,
  },
  basketball: {
    label:"Basketball", icon:"Ba",
    positions:["Point Guard","Shooting Guard","Small Forward",
               "Power Forward","Center"],
    stats:["Punkte","Rebounds","Assists","Steals","Blocks","Fouls"],
    resultFormat:"points",
    teamSizes:[5],
    fieldTemplates:["halle"],
    ageGroups:["U8","U10","U12","U14","U16","U18","Herren","Damen"],
    hasReferee:true, hasPenalty:false, hasCards:false,
  },
  volleyball: {
    label:"Volleyball", icon:"V",
    positions:["Libero","Zuspiel","Diagonal","Auen","Mittelblock"],
    stats:["Angriffspunkte","Blockpunkte","Aufschlagpunkte","Fehler"],
    resultFormat:"sets",
    teamSizes:[6],
    fieldTemplates:["halle"],
    ageGroups:["U12","U14","U16","U18","Herren","Damen","Mixed"],
    hasReferee:true, hasPenalty:false, hasCards:false,
  },
  tischtennis: {
    label:"Tischtennis", icon:"TT",
    positions:["Einzel 1","Einzel 2","Einzel 3","Doppel"],
    stats:["Saetze","Einzelpunkte"],
    resultFormat:"sets",
    teamSizes:[1,2],
    fieldTemplates:["halle"],
    ageGroups:["Schueler","Junioren","Erwachsene","Senioren"],
    hasReferee:false, hasPenalty:false, hasCards:false,
  },
  kegeln: {
    label:"Kegeln/Bowling", icon:"K",
    positions:["Mannschaft"],
    stats:["Holz","Volles","Abraeumen","Fehlwuerfe"],
    resultFormat:"points",
    teamSizes:[4,6],
    fieldTemplates:["mehrzweck"],
    ageGroups:["Jugend","Erwachsene","Senioren"],
    hasReferee:false, hasPenalty:false, hasCards:false,
  },
  schuetzen: {
    label:"Schiessen", icon:"S",
    positions:["KK","LG","LP","GK","P"],
    stats:["Ringe","Treffer","Teiler"],
    resultFormat:"points",
    teamSizes:[3,4,5],
    fieldTemplates:["mehrzweck"],
    ageGroups:["Schueler","Jugend","Junioren","Erwachsene","Senioren","Damen"],
    hasReferee:false, hasPenalty:false, hasCards:false,
  },
  turnen: {
    label:"Turnen/Gym", icon:"Tur",
    positions:["Boden","Reck","Barren","Ringe","Pferd","Sprung"],
    stats:["Note","Schwierigkeitswert","Ausfuehrungswert"],
    resultFormat:"points",
    teamSizes:[1,4,6],
    fieldTemplates:["halle"],
    ageGroups:["Kindturnen","Jugend","Junioren","Erwachsene","Frauen","Maenner"],
    hasReferee:false, hasPenalty:false, hasCards:false,
  },
  leichtathletik: {
    label:"Leichtathletik", icon:"LA",
    positions:["Sprint","Mittelstrecke","Langstrecke","Huerden","Sprung","Wurf"],
    stats:["Zeit (s)","Weite (cm)","Höhe (cm)","Punkte"],
    resultFormat:"points",
    teamSizes:[1],
    fieldTemplates:["leichtathletik"],
    ageGroups:["U8","U10","U12","U14","U16","U18","Erwachsene","Masters"],
    hasReferee:false, hasPenalty:false, hasCards:false,
  },
  tanzen: {
    label:"Tanzen", icon:"Tan",
    positions:["Standard","Latein","Showdance","Boogie-Woogie"],
    stats:["Platzierung","Punkte Technik","Punkte Ausdruck"],
    resultFormat:"points",
    teamSizes:[1,2],
    fieldTemplates:["halle"],
    ageGroups:["Kinder","Junioren 1","Junioren 2","Jugend","Hauptgruppe","Senioren"],
    hasReferee:false, hasPenalty:false, hasCards:false,
  },
  schwimmen: {
    label:"Schwimmen", icon:"Sw",
    positions:["Freistil","Ruecken","Brust","Schmetterling","Lagen"],
    stats:["Zeit (s)","Platzierung","Punkte"],
    resultFormat:"points",
    teamSizes:[1,4],
    fieldTemplates:["mehrzweck"],
    ageGroups:["AK 8","AK 10","AK 12","AK 14","AK 16","AK 18","Erwachsene","Masters"],
    hasReferee:false, hasPenalty:false, hasCards:false,
  },
  mehrzweck: {
    label:"Mehrzweck / Sonstige", icon:"M",
    positions:["Teilnehmer"],
    stats:["Punkte","Platzierung"],
    resultFormat:"points",
    teamSizes:[1,2,4,8],
    fieldTemplates:["mehrzweck","halle"],
    ageGroups:["Kinder","Jugend","Erwachsene","Senioren"],
    hasReferee:false, hasPenalty:false, hasCards:false,
  },
};

// Demo-Vereine für verschiedene Sportarten
const DEMO_CLUBS = [
  {
    id:"demo_fussball",
    name:"FC Demo Fußball",
    sport:"fussball",
    pri:"#16a34a", sec:"#052e16", em:"FC",
    slug:"demo-fussball",
    dir:true, pub:false,
    desc:"Fußball-Verein mit allen Altersklassen",
  },
  {
    id:"demo_tennis",
    name:"TC Demo Tennis",
    sport:"tennis",
    pri:"#dc2626", sec:"#450a0a", em:"TC",
    slug:"demo-tennis",
    dir:true, pub:false,
    desc:"Tennisclub mit Einzel und Doppel",
  },
  {
    id:"demo_handball",
    name:"HV Demo Handball",
    sport:"handball",
    pri:"#2563eb", sec:"#1e3a8a", em:"HV",
    slug:"demo-handball",
    dir:true, pub:false,
    desc:"Handballverein mit Jugend und Senioren",
  },
  {
    id:"demo_kegeln",
    name:"KC Demo Kegeln",
    sport:"kegeln",
    pri:"#7c3aed", sec:"#3b0764", em:"KC",
    slug:"demo-kegeln",
    dir:true, pub:false,
    desc:"Kegelklub mit Ligabetrieb",
  },
];

/* =================================================================
   VEREINS-ADMIN EINSTELLUNGEN (komplett neu)
   Strukturiert in 7 Bereiche
================================================================= */
function ClubAdminSettings({ data, cid, save, fire, cl }) {
  const t = TH(cl);
  const myClub = (data.clubs||[]).find(x=>x.id===cid)||{};
  const cs = myClub?.clubSettings||{};
  const clubFeat = (key, def=true) => cs[key]!==undefined ? cs[key] : def;
  const sport = myClub.sport||"fussball";
  const sportProfile = SPORT_PROFILES[sport]||SPORT_PROFILES.fussball;
  const [section, setSection] = useState("sport");
  const [showImport, setShowImport] = useState(false);
  const [showDelete, setShowDelete] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState("");

  const saveSetting = (key, val) => {
    const updated = {...myClub, clubSettings:{...cs,[key]:val}};
    save({...data,clubs:(data.clubs||[]).map(x=>x.id===cid?updated:x)});
  };
  const S = (key, def) => cs[key]!==undefined ? cs[key] : def;

  // Export
  const exportData = () => {
    const blob = new Blob([JSON.stringify(data,null,2)],{type:"application/json"});
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = "backup-"+myClub.name+"-"+new Date().toISOString().slice(0,10)+".json";
    a.click(); fire("Backup exportiert");
  };

  const SECTIONS = [
    {id:"sport",       label:"Sportart",      icon:"S"},
    {id:"features",    label:"Module",        icon:"M"},
    {id:"team",        label:"Team",          icon:"T"},
    {id:"komm",        label:"Kommunikation", icon:"K"},
    {id:"sicherheit",  label:"Sicherheit",    icon:"Si"},
    {id:"datenschutz", label:"Datenschutz",   icon:"D"},
    {id:"konto",       label:"Konto",         icon:"A"},
  ];

  const Row = ({title,sub,children,last=false}) => (
    <div style={{display:"flex",alignItems:"center",gap:12,padding:"12px 0",
      borderBottom:last?"none":"1px solid #f1f5f9"}}>
      <div style={{flex:1,minWidth:0}}>
        <div style={{fontWeight:700,fontSize:14,color:"#0f172a"}}>{title}</div>
        {sub&&<div style={{fontSize:11,color:"#94a3b8",marginTop:1,lineHeight:1.4}}>{sub}</div>}
      </div>
      <div style={{flexShrink:0}}>{children}</div>
    </div>
  );

  const Toggle = ({val,onChange}) => (
    <div onClick={()=>onChange(!val)}
      style={{width:46,height:26,borderRadius:99,background:val?t.p:"#e2e8f0",
        cursor:"pointer",position:"relative",transition:"background .2s",flexShrink:0}}>
      <div style={{position:"absolute",top:3,left:val?22:3,width:20,height:20,
        borderRadius:"50%",background:"#fff",transition:"left .2s",
        boxShadow:"0 1px 4px rgba(0,0,0,.2)"}}/>
    </div>
  );

  const card = {background:"#fff",borderRadius:16,padding:"4px 16px",
    border:"1.5px solid #e2e8f0",marginBottom:14};

  const Select = ({value,onChange,opts}) => (
    <select value={value} onChange={e=>onChange(e.target.value)}
      style={{padding:"7px 11px",fontSize:13,border:"1.5px solid #e2e8f0",
        borderRadius:10,outline:"none",background:"#fff",fontFamily:"inherit",
        maxWidth:160}}>
      {opts.map(([v,l])=><option key={v} value={v}>{l}</option>)}
    </select>
  );

  return (
    <div>
      {/* Section Nav */}
      <div style={{display:"flex",gap:5,overflowX:"auto",scrollbarWidth:"none",
        marginBottom:16,paddingBottom:2}}>
        {SECTIONS.map(s=>(
          <button key={s.id} onClick={()=>setSection(s.id)}
            style={{display:"flex",alignItems:"center",gap:5,padding:"8px 13px",
              borderRadius:11,border:`2px solid ${section===s.id?t.p:"#e2e8f0"}`,
              background:section===s.id?t.p+"12":"#fff",
              color:section===s.id?t.p:"#64748b",
              fontWeight:section===s.id?800:600,fontSize:11,cursor:"pointer",
              whiteSpace:"nowrap",fontFamily:"inherit",flexShrink:0}}>
            <span style={{fontWeight:900,fontSize:12}}>{s.icon}</span>{s.label}
          </button>
        ))}
      </div>

      {/* SPORTART */}
      {section==="sport"&&(
        <>
          <div style={{background:"#f8fafc",borderRadius:14,padding:"12px 14px",
            marginBottom:14,border:"1.5px solid #e2e8f0"}}>
            <div style={{fontSize:11,fontWeight:800,color:"#64748b",marginBottom:10,letterSpacing:.5}}>
              AKTUELLE SPORTART
            </div>
            <div style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:8,marginBottom:14}}>
              {Object.entries(SPORT_PROFILES).map(([key,sp])=>(
                <button key={key} onClick={()=>{
                  save({...data,clubs:(data.clubs||[]).map(x=>x.id===cid?{...x,sport:key}:x)});
                  fire("Sportart geändert: "+sp.label);
                }}
                  style={{padding:"10px 6px",borderRadius:12,textAlign:"center",
                    border:`2px solid ${sport===key?t.p:"#e2e8f0"}`,
                    background:sport===key?t.p+"12":"#fff",
                    cursor:"pointer",fontFamily:"inherit"}}>
                  <div style={{fontWeight:900,fontSize:16,color:sport===key?t.p:"#64748b",
                    marginBottom:3}}>{sp.icon}</div>
                  <div style={{fontWeight:sport===key?800:600,fontSize:11,
                    color:sport===key?t.p:"#475569",lineHeight:1.2}}>{sp.label}</div>
                </button>
              ))}
            </div>
          </div>
          {/* Sport-spezifische Info */}
          <div style={card}>
            <Row title="Positionen" sub={sportProfile.positions.slice(0,3).join(", ")+"..."}>
              <span style={{fontSize:12,color:"#94a3b8",fontWeight:600}}>
                {sportProfile.positions.length}
              </span>
            </Row>
            <Row title="Statistiken" sub={sportProfile.stats.join(", ")}>
              <span style={{fontSize:12,color:"#94a3b8",fontWeight:600}}>
                {sportProfile.stats.length}
              </span>
            </Row>
            <Row title="Altersklassen" sub={sportProfile.ageGroups.slice(0,4).join(", ")+"..."}>
              <span style={{fontSize:12,color:"#94a3b8",fontWeight:600}}>
                {sportProfile.ageGroups.length}
              </span>
            </Row>
            <Row title="Ergebnis-Format"
              sub={sportProfile.resultFormat==="goals"?"Tore (3:2)":sportProfile.resultFormat==="sets"?"Saetze":"Punkte"}
              last>
              <span style={{fontSize:12,color:t.p,fontWeight:700}}>
                {sportProfile.resultFormat}
              </span>
            </Row>
          </div>
          {/* Sport-Flags */}
          <div style={card}>
            <Row title="Karten (Gelb/Rot)" sub="Kartenstatistik bei Spielern">
              <Toggle val={S("hasCards",sportProfile.hasCards)} onChange={v=>saveSetting("hasCards",v)}/>
            </Row>
            <Row title="Elfmeter / Penaltys" sub="Penalty-Statistik">
              <Toggle val={S("hasPenalty",sportProfile.hasPenalty)} onChange={v=>saveSetting("hasPenalty",v)}/>
            </Row>
            <Row title="Schiedsrichter eintragen" sub="Schiri pro Termin angeben" last>
              <Toggle val={S("hasReferee",sportProfile.hasReferee)} onChange={v=>saveSetting("hasReferee",v)}/>
            </Row>
          </div>
        </>
      )}

      {/* MODULE / FEATURES */}
      {section==="features"&&(
        <>
          {/* Schnell-Profil */}
          <div style={{background:"#eff6ff",borderRadius:13,padding:"12px 14px",
            border:"1.5px solid #bfdbfe",marginBottom:14,fontSize:12,
            color:"#1d4ed8",lineHeight:1.6}}>
            Aktiviere oder deaktiviere einzelne Module für deinen Verein.
            Nicht benoenigte Funktionen werden für alle Nutzer ausgeblendet.
          </div>
          <div style={card}>
            <Row title="Platzbuchung" sub="Trainer können Plaetze reservieren">
              <Toggle val={S("mod_fields",true)} onChange={v=>saveSetting("mod_fields",v)}/>
            </Row>
            <Row title="Trainingspläne" sub="Trainingspläne und Übungs-Bibliothek">
              <Toggle val={S("mod_training",true)} onChange={v=>saveSetting("mod_training",v)}/>
            </Row>
            <Row title="Trikot-Verwaltung" sub="Trikotnummern und Zuteilung">
              <Toggle val={S("mod_jerseys",true)} onChange={v=>saveSetting("mod_jerseys",v)}/>
            </Row>
            <Row title="Helfer-System" sub="Helfer mit Code-Zugang">
              <Toggle val={S("mod_helpers",true)} onChange={v=>saveSetting("mod_helpers",v)}/>
            </Row>
            <Row title="Ergebnisse & Tabelle" sub="Spielergebnisse eintragen">
              <Toggle val={S("mod_results",sportProfile.resultFormat!==null)} onChange={v=>saveSetting("mod_results",v)}/>
            </Row>
            <Row title="Statistiken" sub="Spieler-Statistiken (Tore, Karten...)">
              <Toggle val={S("mod_stats",sportProfile.hasCards||sport==="fussball")} onChange={v=>saveSetting("mod_stats",v)}/>
            </Row>
            <Row title="Schwarzes Brett" sub="Vereinsnews für alle" last>
              <Toggle val={S("mod_news",true)} onChange={v=>saveSetting("mod_news",v)}/>
            </Row>
          </div>
          {/* Senioren-Modus */}
          <div style={card}>
            <Row title="Senioren-Modus"
              sub="Spieler stimmen selbst ab - kein Eltern-Login nötig">
              <Toggle val={S("seniorsMode",false)} onChange={v=>saveSetting("seniorsMode",v)}/>
            </Row>
            <Row title="Eltern dürfen im Chat schreiben"
              sub="Standardmaessig nur lesen">
              <Toggle val={S("parentChat",false)} onChange={v=>saveSetting("parentChat",v)}/>
            </Row>
            <Row title="Mehrere Teams pro Spieler" sub="Spieler in 2+ Teams gleichzeitig" last>
              <Toggle val={S("multiTeamPlayer",false)} onChange={v=>saveSetting("multiTeamPlayer",v)}/>
            </Row>
          </div>
        </>
      )}

      {/* TEAM EINSTELLUNGEN */}
      {section==="team"&&(
        <>
          <div style={card}>
            <Row title="Jahrgang anzeigen" sub="Spieler-Jahrgang in der Liste">
              <Toggle val={S("showBirthYear",true)} onChange={v=>saveSetting("showBirthYear",v)}/>
            </Row>
            <Row title="Positionen" sub={`${sportProfile.positions.length} Positionen für ${sportProfile.label}`}>
              <Select value={S("positionSystem","default")} onChange={v=>saveSetting("positionSystem",v)}
                opts={[["default","Standard"],["custom","Eigene"],["none","Keine"]]}/>
            </Row>
            <Row title="Spieler-Fotos" sub="Profilfoto im Spieler-Profil">
              <Toggle val={S("playerPhotos",false)} onChange={v=>saveSetting("playerPhotos",v)}/>
            </Row>
            <Row title="Spieler sehen Mitspieler" sub="Eltern sehen anderen Kindern">
              <Toggle val={S("showPlayerList",true)} onChange={v=>saveSetting("showPlayerList",v)}/>
            </Row>
            <Row title="Trainer sichtbar für Eltern" sub="Name und Kontakt">
              <Toggle val={S("showTrainerInfo",true)} onChange={v=>saveSetting("showTrainerInfo",v)}/>
            </Row>
            <Row title="Anwesenheit sichtbar für Eltern" sub="Wer hat abgestimmt">
              <Toggle val={S("showAttendance",false)} onChange={v=>saveSetting("showAttendance",v)}/>
            </Row>
            <Row title="Vergangene Termine anzeigen" sub="Wie viele Tage zurück" last>
              <Select value={S("pastDays",30)} onChange={v=>saveSetting("pastDays",Number(v))}
                opts={[["7","7 Tage"],["14","14 Tage"],["30","30 Tage"],["60","60 Tage"],["90","90 Tage"]]}/>
            </Row>
          </div>
        </>
      )}

      {/* KOMMUNIKATION */}
      {section==="komm"&&(
        <>
          <div style={card}>
            <Row title="Team-Chat aktiv">
              <Toggle val={S("chatEnabled",true)} onChange={v=>saveSetting("chatEnabled",v)}/>
            </Row>
            <Row title="Vereins-Chat aktiv" sub="Chat über alle Teams hinweg">
              <Toggle val={S("clubChatEnabled",true)} onChange={v=>saveSetting("clubChatEnabled",v)}/>
            </Row>
            <Row title="Helfer im Chat" sub="Helfer können Chat lesen">
              <Toggle val={S("helperChat",false)} onChange={v=>saveSetting("helperChat",v)}/>
            </Row>
            <Row title="Chat-Moderation" sub="KI erkennt Werbung und illegale Inhalte">
              <Toggle val={S("chatMod",true)} onChange={v=>saveSetting("chatMod",v)}/>
            </Row>
            <Row title="Benachrichtigungen: Neuer Termin">
              <Toggle val={S("notifyEvent",true)} onChange={v=>saveSetting("notifyEvent",v)}/>
            </Row>
            <Row title="Benachrichtigungen: Absagen">
              <Toggle val={S("notifyCancel",true)} onChange={v=>saveSetting("notifyCancel",v)}/>
            </Row>
            <Row title="Benachrichtigungen: Chat" last>
              <Toggle val={S("notifyChat",true)} onChange={v=>saveSetting("notifyChat",v)}/>
            </Row>
          </div>
        </>
      )}

      {/* SICHERHEIT */}
      {section==="sicherheit"&&(
        <>
          <div style={card}>
            <Row title="Brute-Force Schutz" sub="Nach 3 Fehlversuchen 5 Min Sperre">
              <Toggle val={S("bruteForce",true)} onChange={v=>saveSetting("bruteForce",v)}/>
            </Row>
            <Row title="Audit-Log" sub="Alle Logins und Änderungen protokollieren">
              <Toggle val={S("auditLog",true)} onChange={v=>saveSetting("auditLog",v)}/>
            </Row>
            <Row title="Geräte-Erkennung" sub="Neues Gerät = Hinweis im Log">
              <Toggle val={S("deviceTrack",true)} onChange={v=>saveSetting("deviceTrack",v)}/>
            </Row>
            <Row title="Session-Dauer" sub="Wie lange bleibt man eingeloggt">
              <Select value={S("sessionDays",30)} onChange={v=>saveSetting("sessionDays",Number(v))}
                opts={[["1","1 Tag"],["7","7 Tage"],["30","30 Tage"],["90","90 Tage"]]}/>
            </Row>
            <Row title="Lschen bestaetigen" sub="Vor jedem Löschen nachfragen" last>
              <Toggle val={S("confirmDelete",true)} onChange={v=>saveSetting("confirmDelete",v)}/>
            </Row>
          </div>
          {/* Zugangs-Übersicht Link */}
          <div style={{background:"#eff6ff",borderRadius:13,padding:"12px 14px",
            border:"1.5px solid #bfdbfe",fontSize:13,color:"#1d4ed8",lineHeight:1.5}}>
            Alle Passwörter und Zugänge ändern unter: Zugänge & Passwörter im Menue.
          </div>
        </>
      )}

      {/* DATENSCHUTZ */}
      {section==="datenschutz"&&(
        <>
          <div style={card}>
            <Row title="DSGVO Einwilligung bei Fotos" sub="Pflicht vor Mannschaftsfotos">
              <Toggle val={S("dsgvoConsent",true)} onChange={v=>saveSetting("dsgvoConsent",v)}/>
            </Row>
            <Row title="Datenschutz-Seite anzeigen" sub="Link auf der Startseite">
              <Toggle val={S("showPrivacy",true)} onChange={v=>saveSetting("showPrivacy",v)}/>
            </Row>
            <Row title="Spieler-Daten exportieren" sub="CSV und JSON Export erlaubt">
              <Toggle val={S("dataExport",true)} onChange={v=>saveSetting("dataExport",v)}/>
            </Row>
            <Row title="Eltern-Kommunikation lokal" sub="Telefon-Nummern bleiben auf Gerät" last>
              <span style={{fontSize:11,color:"#16a34a",fontWeight:700}}>Immer aktiv</span>
            </Row>
          </div>
          <div style={{background:"#f0fdf4",borderRadius:13,padding:"12px 14px",
            border:"1.5px solid #bbf7d0",fontSize:12,color:"#166534",lineHeight:1.6}}>
            Alle Daten werden DSGVO-konform verarbeitet. Keine Weitergabe an Dritte.
            Telefonnummern werden ausschließlich lokal gespeichert.
          </div>
        </>
      )}

      {/* KONTO */}
      {section==="konto"&&(
        <>
          <div style={card}>
            <Row title="Vereinsname" sub={myClub.name}>
              <button onClick={()=>fire("Namens-Änderung kommt bald")}
                style={{padding:"6px 12px",borderRadius:9,border:"1.5px solid #e2e8f0",
                  background:"#f8fafc",fontWeight:700,fontSize:12,cursor:"pointer",
                  fontFamily:"inherit",color:"#475569"}}>
                Ändern
              </button>
            </Row>
            <Row title="Admin E-Mail" sub={myClub.adminEmail?myClub.adminEmail.slice(0,3)+"***":"Nicht hinterlegt"}>
              <AdminEmailSetup cl={myClub} data={data} save={save} fire={fire}/>
            </Row>
            <Row title="Im Verzeichnis sichtbar" sub="Andere können euren Verein finden" last>
              <Toggle val={myClub.dir!==false}
                onChange={v=>save({...data,clubs:(data.clubs||[]).map(x=>x.id===cid?{...x,dir:v}:x)})}/>
            </Row>
          </div>
          <div style={card}>
            <Row title="Backup exportieren" sub="Alle Vereinsdaten als JSON">
              <button onClick={exportData}
                style={{padding:"6px 14px",borderRadius:9,border:"none",
                  background:t.p,color:"#fff",fontWeight:700,fontSize:12,
                  cursor:"pointer",fontFamily:"inherit"}}>
                Export
              </button>
            </Row>
            <Row title="Daten importieren" sub="JSON-Backup einspielen" last>
              <button onClick={()=>setShowImport(true)}
                style={{padding:"6px 12px",borderRadius:9,border:"1.5px solid #e2e8f0",
                  background:"#f8fafc",fontWeight:700,fontSize:12,cursor:"pointer",
                  fontFamily:"inherit",color:"#475569"}}>
                Import
              </button>
            </Row>
          </div>
          {showImport&&<ImportData save={save} fire={fire} onClose={()=>setShowImport(false)}/>}
          {/* Gefahrenzone */}
          <div style={{background:"#fef2f2",borderRadius:13,padding:"12px 14px",
            border:"1.5px solid #fecaca",marginBottom:14}}>
            <div style={{fontWeight:800,fontSize:13,color:"#dc2626",marginBottom:8}}>
              Gefahrenzone
            </div>
            {!showDelete
              ?<button onClick={()=>setShowDelete(true)}
                style={{padding:"10px 16px",borderRadius:10,border:"none",
                  background:"#dc2626",color:"#fff",fontWeight:700,fontSize:13,
                  cursor:"pointer",fontFamily:"inherit"}}>
                Verein löschen
              </button>
              :<>
                <p style={{fontSize:13,color:"#dc2626",marginBottom:10,lineHeight:1.5}}>
                  Tippe den Vereinsnamen zur Bestaetigung:
                </p>
                <input value={deleteConfirm} onChange={e=>setDeleteConfirm(e.target.value)}
                  placeholder={myClub.name}
                  style={{width:"100%",padding:"10px 13px",fontSize:14,
                    border:"2px solid #fca5a5",borderRadius:11,outline:"none",
                    marginBottom:10,boxSizing:"border-box"}}/>
                <div style={{display:"flex",gap:9}}>
                  <button onClick={()=>setShowDelete(false)}
                    style={{flex:1,padding:"10px",borderRadius:10,
                      border:"1.5px solid #e2e8f0",background:"#fff",
                      fontWeight:700,cursor:"pointer",fontFamily:"inherit"}}>
                    Abbrechen
                  </button>
                  <button
                    disabled={deleteConfirm!==myClub.name}
                    onClick={()=>{
                      const next={...data,
                        clubs:(data.clubs||[]).filter(x=>x.id!==cid),
                        teams:(data.teams||[]).filter(x=>x.cid!==cid)};
                      save(next); fire("Verein gelöscht");
                      window.location.reload();
                    }}
                    style={{flex:1,padding:"10px",borderRadius:10,border:"none",
                      background:deleteConfirm===myClub.name?"#dc2626":"#e2e8f0",
                      color:deleteConfirm===myClub.name?"#fff":"#94a3b8",
                      fontWeight:700,cursor:"pointer",fontFamily:"inherit"}}>
                    Löschen
                  </button>
                </div>
              </>
            }
          </div>
        </>
      )}
    </div>
  );
}



/* =================================================================
   RESPONSIVE SYSTEM
   Breakpoints: sm<640 | md 640-1024 | lg>1024
   Hook + CSS Media Queries + Layout-Komponenten
================================================================= */

// Breakpoint Hook
function useBreakpoint() {
  const [bp, setBp] = React.useState(() => {
    const w = window.innerWidth;
    return w < 640 ? "sm" : w < 1024 ? "md" : "lg";
  });
  React.useEffect(() => {
    const handler = () => {
      const w = window.innerWidth;
      setBp(w < 640 ? "sm" : w < 1024 ? "md" : "lg");
    };
    window.addEventListener("resize", handler);
    return () => window.removeEventListener("resize", handler);
  }, []);
  return {
    bp,
    isMobile:  bp === "sm",
    isTablet:  bp === "md",
    isDesktop: bp === "lg",
    is: (size) => bp === size,
  };
}

// Responsive CSS - wird einmalig injiziert
const RESPONSIVE_CSS = `
/* ===== BREAKPOINTS ===== */

/* Scrollbar styling für Desktop */
::-webkit-scrollbar { width: 6px; height: 6px; }
::-webkit-scrollbar-track { background: transparent; }
::-webkit-scrollbar-thumb { background: #334155; border-radius: 99px; }
::-webkit-scrollbar-thumb:hover { background: #475569; }

/* Hover-States für Desktop */
@media (hover: hover) {
  button:hover { opacity: 0.88; }
  .va-card:hover { box-shadow: 0 4px 20px rgba(0,0,0,.1); transform: translateY(-1px); }
  .va-nav-item:hover { background: rgba(255,255,255,.06) !important; }
  .va-row:hover { background: #f8fafc !important; }
}

/* Tablet (md: 640px+) */
@media (min-width: 640px) {
  .va-grid-2 { display: grid !important; grid-template-columns: 1fr 1fr !important; gap: 14px !important; }
  .va-grid-3 { display: grid !important; grid-template-columns: repeat(3, 1fr) !important; gap: 12px !important; }
  .va-modal-center { align-items: center !important; }
  .va-modal-inner { border-radius: 20px !important; max-height: 85vh !important; }
  .va-bottom-sheet { border-radius: 20px !important; max-width: 540px !important; margin: 0 auto !important; }
}

/* Desktop (lg: 1024px+) */
@media (min-width: 1024px) {
  .va-app-root { display: grid !important; grid-template-columns: 260px 1fr !important; min-height: 100dvh !important; }
  .va-sidebar { display: flex !important; flex-direction: column !important; }
  .va-bottom-nav { display: none !important; }
  .va-main-content { padding-bottom: 20px !important; }
  .va-content-inner { max-width: 860px !important; margin: 0 auto !important; padding: 24px !important; }
  .va-grid-2 { display: grid !important; grid-template-columns: 1fr 1fr !important; gap: 16px !important; }
  .va-grid-3 { display: grid !important; grid-template-columns: repeat(3, 1fr) !important; gap: 14px !important; }
  .va-grid-4 { display: grid !important; grid-template-columns: repeat(4, 1fr) !important; gap: 12px !important; }
  .va-modal-center { align-items: center !important; }
  .va-modal-inner { border-radius: 22px !important; }
}

/* Wide (xl: 1400px+) */
@media (min-width: 1400px) {
  .va-app-root { grid-template-columns: 280px 1fr !important; }
  .va-content-inner { max-width: 1000px !important; }
}

/* Keyboard navigierbar */
button:focus-visible, a:focus-visible, input:focus-visible {
  outline: 2px solid #16a34a !important;
  outline-offset: 2px !important;
}

/* Print styles */
@media print {
  .va-bottom-nav, .va-sidebar, button { display: none !important; }
  .va-content-inner { max-width: 100% !important; padding: 0 !important; }
}
`;

/* -----------------------------------------------------------------
   DESKTOP SIDEBAR
   Ersetzt BottomNav auf >1024px
----------------------------------------------------------------- */
function DesktopSidebar({ tab, setTab, isAdmin, isHelper, unread, cl, session, onLogout }) {
  const t = TH(cl);
  const [showDrawer, setShowDrawer] = React.useState(false);

  const mainItems = [
    { id:"events",   label:"Termine",    icon:"K" },
    { id:"team",     label:"Team",       icon:"P", hidden: isHelper },
    { id:"fields",   label:"Platz",      icon:"F", hidden: isHelper },
    { id:"chat",     label:"Chat",       icon:"C", badge: unread },
  ].filter(x=>!x.hidden);

  const adminItems = [
    { id:"overview",    label:"Übersicht",       icon:"U" },
    { id:"news",        label:"Neuigkeiten",       icon:"N" },
    { id:"teams",       label:"Mannschaften",      icon:"M" },
    { id:"trainers",    label:"Trainer",           icon:"T" },
    { id:"fieldsadmin", label:"Plaetze",           icon:"P" },
    { id:"access",      label:"Zugänge",          icon:"PW" },
    { id:"security",    label:"Sicherheitslog",    icon:"!" },
    { id:"settings",    label:"Einstellungen",     icon:"+" },
  ];

  const trainerItems = [
    { id:"training",   label:"Trainingsplan",  icon:"TP" },
    { id:"jerseys",    label:"Trikots",        icon:"Tr" },
    { id:"helpers",    label:"Helfer",         icon:"H",  hidden: isHelper },
    { id:"attendance", label:"Anwesenheit",    icon:"S" },
    { id:"results",    label:"Ergebnisse",     icon:"E" },
    { id:"inbox",      label:"Posteingang",    icon:"I" },
  ].filter(x=>!x.hidden);

  const NavItem = ({item}) => {
    const active = tab === item.id;
    return (
      <button
        onClick={() => setTab(item.id)}
        className="va-nav-item"
        style={{
          display:"flex", alignItems:"center", gap:10,
          padding:"10px 14px", borderRadius:11, border:"none",
          background: active ? t.p+"18" : "transparent",
          color: active ? t.p : "#94a3b8",
          fontWeight: active ? 800 : 500,
          fontSize: 13, cursor:"pointer", width:"100%",
          fontFamily:"inherit", textAlign:"left",
          transition:"all .15s", position:"relative",
        }}
      >
        <div style={{
          width:32, height:32, borderRadius:9,
          background: active ? t.p : "rgba(255,255,255,.05)",
          display:"flex", alignItems:"center", justifyContent:"center",
          fontWeight:900, fontSize:13,
          color: active ? "#fff" : "#64748b",
          flexShrink:0, transition:"all .15s",
        }}>
          {item.icon}
        </div>
        <span style={{flex:1}}>{item.label}</span>
        {item.badge > 0 && (
          <span style={{
            background:"#dc2626", color:"#fff",
            borderRadius:99, padding:"1px 6px",
            fontSize:10, fontWeight:900,
          }}>
            {item.badge > 9 ? "9+" : item.badge}
          </span>
        )}
      </button>
    );
  };

  const Divider = ({label}) => (
    <div style={{
      fontSize:10, fontWeight:800, color:"#334155",
      letterSpacing:.8, padding:"12px 14px 5px",
      textTransform:"uppercase",
    }}>
      {label}
    </div>
  );

  return (
    <aside className="va-sidebar" style={{
      background:"#0f172a",
      borderRight:"1px solid #1e293b",
      display:"none", // shown via CSS on desktop
      overflowY:"auto",
      position:"sticky", top:0, height:"100dvh",
    }}>
      {/* Logo / Vereinsname */}
      <div style={{
        padding:"20px 16px 12px",
        borderBottom:"1px solid #1e293b",
      }}>
        <div style={{display:"flex", alignItems:"center", gap:10}}>
          <div style={{
            width:40, height:40, borderRadius:12,
            background: t.p,
            display:"flex", alignItems:"center", justifyContent:"center",
            fontWeight:900, fontSize:16, color:"#fff", flexShrink:0,
          }}>
            {cl?.em || cl?.name?.slice(0,2) || "V"}
          </div>
          <div style={{flex:1, minWidth:0}}>
            <div style={{
              fontWeight:800, fontSize:14, color:"#fff",
              overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap",
            }}>
              {cl?.name || "Vereins-App"}
            </div>
            <div style={{fontSize:11, color:"#475569", marginTop:1}}>
              {session?.name || session?.role || ""}
            </div>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <div style={{flex:1, padding:"8px 8px", overflowY:"auto"}}>

        <Divider label="Hauptbereich"/>
        {mainItems.map(item => <NavItem key={item.id} item={item}/>)}

        <Divider label="Verwaltung"/>
        {trainerItems.map(item => <NavItem key={item.id} item={item}/>)}

        {isAdmin && <>
          <Divider label="Admin"/>
          {adminItems.map(item => <NavItem key={item.id} item={item}/>)}
        </>}
      </div>

      {/* Footer */}
      <div style={{
        borderTop:"1px solid #1e293b",
        padding:"10px 8px",
      }}>
        <button onClick={onLogout}
          style={{
            display:"flex", alignItems:"center", gap:10,
            padding:"9px 14px", borderRadius:10, border:"none",
            background:"transparent", color:"#64748b",
            fontWeight:600, fontSize:13, cursor:"pointer",
            width:"100%", fontFamily:"inherit",
          }}
          className="va-nav-item"
        >
          <div style={{
            width:32, height:32, borderRadius:9,
            background:"rgba(255,255,255,.05)",
            display:"flex", alignItems:"center", justifyContent:"center",
            fontWeight:900, fontSize:13, color:"#64748b",
          }}>
            {"<-"}
          </div>
          Abmelden
        </button>
      </div>
    </aside>
  );
}

/* -----------------------------------------------------------------
   RESPONSIVE APP WRAPPER
   Injiziert CSS + schaltet zwischen Layouts um
----------------------------------------------------------------- */
function ResponsiveWrapper({ children, tab, setTab, isAdmin, isHelper, unread, cl, session, onLogout }) {
  const { isDesktop } = useBreakpoint();

  // Inject responsive CSS once
  React.useEffect(() => {
    let el = document.getElementById("va-responsive-css");
    if (!el) {
      el = document.createElement("style");
      el.id = "va-responsive-css";
      document.head.appendChild(el);
    }
    el.textContent = RESPONSIVE_CSS;
  }, []);

  if (isDesktop) {
    return (
      <div className="va-app-root" style={{display:"grid"}}>
        <DesktopSidebar
          tab={tab} setTab={setTab}
          isAdmin={isAdmin} isHelper={isHelper}
          unread={unread} cl={cl}
          session={session} onLogout={onLogout}
        />
        <main style={{
          minHeight:"100dvh", overflowY:"auto",
          background:"#f0f4f8",
        }}>
          <div className="va-content-inner">
            {children}
          </div>
        </main>
      </div>
    );
  }

  // Mobile + Tablet: existing layout
  return <>{children}</>;
}



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
  "Europe/London":      { city:"Grossbritannien",flag:"GB", region:"gb", country:"GB" },
  // Frankreich
  "Europe/Paris":       { city:"Frankreich",     flag:"F",  region:"fr", country:"FR" },
  // Spanien
  "Europe/Madrid":      { city:"Spanien",        flag:"E",  region:"es", country:"ES" },
  // Italien
  "Europe/Rome":        { city:"Italien",        flag:"I",  region:"it", country:"IT" },
  // Polen
  "Europe/Warsaw":      { city:"Polen",          flag:"PL", region:"pl", country:"PL" },
  // Tuerkei
  "Europe/Istanbul":    { city:"Tuerkei",        flag:"TR", region:"tr", country:"TR" },
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
  de:"Deutsch", en:"Englisch", nl:"Niederlaendisch",
  ar:"Arabisch", tr:"Tuerkisch", fr:"Franzoesisch",
  es:"Spanisch", it:"Italienisch", pl:"Polnisch",
  ru:"Russisch", uk:"Ukrainisch",
};

// Geo-Info des aktuellen Nutzers ermitteln
const getGeoInfo = () => {
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
const trackEventGeo = (type, detail="") => {
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
      <Card title="Aktivitaet nach Uhrzeit">
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


function SetupWizard({ onDone,onBack }) {
  const [step,setStep] = useState(1);
  const [f,setF] = useState({
    name:"",short:"",sport:"fussball",pri:"#16a34a",adm:""
  });
  const u = p => setF(prev=>({...prev,...p}));
  const SPORTS = [
    {id:"fussball",label:"Fußball",col:"#16a34a"},{id:"handball",label:"Handball",col:"#2563eb"},{id:"tennis",label:"Tennis",col:"#d97706"},{id:"badminton",label:"Badminton",col:"#7c3aed"},{id:"schuetzen",label:"Schuetzen",col:"#dc2626"},{id:"volleyball",label:"Volleyball",col:"#0891b2"},{id:"basketball",label:"Basketball",col:"#ea580c"},{id:"sonstiges",label:"Sonstiges",col:"#64748b"},];
  const selSport = SPORTS.find(s=>s.id===f.sport)||SPORTS[0];

  const finish = () => {
    const cid = "c_"+uid();
    const newClub = {
      id:cid,slug:f.name.toLowerCase().replace(/\s+/g,"-"),name:f.name.trim(),short:f.short.trim()||f.name.slice(0,4).toUpperCase(),em:"*",logo:null,pri:selSport.col,sec:"#0f172a",adm:hashPw(f.adm),adminEmail:(f.email||"").toLowerCase().trim(),pub:true,dir:true,sport:f.sport,createdAt:new Date().toISOString(),};
    onDone(newClub);
  };

  const ok = () => step===1?f.name.trim().length>=2:step===2?true:f.adm.length>=4;

  return (
    <div style={{minHeight:"100dvh",background:"linear-gradient(160deg,#0f172a,#052e16 60%)",display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",padding:"24px 20px"}}>
      <style>{CSS}</style>
      <div style={{width:"100%",maxWidth:400}}>
        <button onClick={onBack} style={{background:"rgba(255,255,255,.1)",border:"none",borderRadius:10,padding:"7px 13px",color:"rgba(255,255,255,.6)",fontSize:13,fontWeight:700,cursor:"pointer",marginBottom:20}}>Abbrechen</button>
        <div style={{background:"rgba(255,255,255,.07)",borderRadius:20,padding:"24px",border:"1px solid rgba(255,255,255,.1)"}}>
          {}
          <div style={{display:"flex",gap:6,marginBottom:22}}>
            {[1,2,3].map(n=><div key={n} style={{flex:1,height:4,borderRadius:99,background:step>=n?"#16a34a":"rgba(255,255,255,.15)"}}/>)}
          </div>

          {step===1&&<>
            <h2 style={{color:"#fff",fontWeight:900,fontSize:20,margin:"0 0 6px"}}>Wie heißt dein Verein?</h2>
            <p style={{color:"rgba(255,255,255,.4)",fontSize:13,margin:"0 0 18px"}}>Schritt 1 von 3</p>
            <input value={f.name} onChange={e=>u({name:e.target.value})} placeholder="z.B. FC Blauweiss 1920"
              style={{width:"100%",padding:"13px 15px",fontSize:16,background:"rgba(255,255,255,.1)",border:`1.5px solid ${f.name?"rgba(255,255,255,.4)":"rgba(255,255,255,.15)"}`,borderRadius:13,outline:"none",color:"#fff",marginBottom:10,boxSizing:"border-box"}}/>
            <input value={f.short} onChange={e=>u({short:e.target.value})} placeholder="Kuerzel (optional, z.B. FCA)"
              style={{width:"100%",padding:"11px 15px",fontSize:14,background:"rgba(255,255,255,.08)",border:"1.5px solid rgba(255,255,255,.1)",borderRadius:13,outline:"none",color:"#fff",marginBottom:16,boxSizing:"border-box"}}/>
          </>}

          {step===2&&<>
            <h2 style={{color:"#fff",fontWeight:900,fontSize:20,margin:"0 0 6px"}}>Welche Sportart?</h2>
            <p style={{color:"rgba(255,255,255,.4)",fontSize:13,margin:"0 0 18px"}}>Schritt 2 von 3</p>
            <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:8,marginBottom:16}}>
              {SPORTS.map(s=>(
                <button key={s.id} onClick={()=>u({sport:s.id})}
                  style={{padding:"11px 12px",borderRadius:12,border:`2px solid ${f.sport===s.id?s.col:"rgba(255,255,255,.1)"}`,background:f.sport===s.id?s.col+"22":"rgba(255,255,255,.05)",color:f.sport===s.id?"#fff":"rgba(255,255,255,.5)",fontWeight:700,fontSize:13,cursor:"pointer",fontFamily:"inherit",textAlign:"left",transition:"all .15s"}}>
                  {f.sport===s.id&&"* "}{s.label}
                </button>
              ))}
            </div>
          </>}

          {step===3&&<>
            <h2 style={{color:"#fff",fontWeight:900,fontSize:20,margin:"0 0 6px"}}>Admin-Passwort</h2>
            <p style={{color:"rgba(255,255,255,.4)",fontSize:13,margin:"0 0 18px"}}>Schritt 3 von 3 - merke es dir gut!</p>
            <input type="password" value={f.adm} onChange={e=>u({adm:e.target.value})} placeholder="Mind. 4 Zeichen"
              style={{width:"100%",padding:"13px 15px",fontSize:16,background:"rgba(255,255,255,.1)",border:`1.5px solid ${f.adm.length>=4?"rgba(255,255,255,.4)":"rgba(255,255,255,.15)"}`,borderRadius:13,outline:"none",color:"#fff",marginBottom:10,boxSizing:"border-box"}}/>
            <div style={{background:"rgba(255,255,255,.06)",borderRadius:10,padding:"11px 14px",fontSize:12,color:"rgba(255,255,255,.4)",lineHeight:1.6,marginBottom:16}}>
              Mit diesem Passwort meldest du dich als Admin an. Dein Verein wird mit dem Sport-Profil "{selSport.label}" angelegt.
            </div>
            {}
            <label style={{display:"flex",alignItems:"center",gap:10,cursor:"pointer",marginBottom:16}}>
              <input type="checkbox" checked={f.pub!==false} onChange={e=>u({pub:e.target.checked})} style={{width:18,height:18,accentColor:"#16a34a"}}/>
              <div>
                <div style={{color:"#fff",fontSize:13,fontWeight:700}}>Im Vereinsverzeichnis anzeigen</div>
                <div style={{color:"rgba(255,255,255,.35)",fontSize:11,marginTop:1}}>Andere können deinen Verein auf der Startseite finden</div>
              </div>
            </label>
          </>}

          {}
          <div style={{display:"flex",gap:9}}>
            {step>1&&<button onClick={()=>setStep(s=>s-1)} style={{flex:1,padding:"12px",borderRadius:13,border:"1.5px solid rgba(255,255,255,.15)",background:"transparent",color:"rgba(255,255,255,.6)",fontWeight:700,fontSize:14,cursor:"pointer",fontFamily:"inherit"}}>Zurück</button>}
            {step<3
              ?<button onClick={()=>ok()&&setStep(s=>s+1)} disabled={!ok()} style={{flex:2,padding:"12px",borderRadius:13,border:"none",background:ok()?"#16a34a":"rgba(255,255,255,.1)",color:ok()?"#fff":"rgba(255,255,255,.3)",fontWeight:800,fontSize:15,cursor:ok()?"pointer":"default",fontFamily:"inherit"}}>Weiter</button>
              :<button onClick={()=>ok()&&finish()} disabled={!ok()} style={{flex:2,padding:"12px",borderRadius:13,border:"none",background:ok()?"#16a34a":"rgba(255,255,255,.1)",color:ok()?"#fff":"rgba(255,255,255,.3)",fontWeight:800,fontSize:15,cursor:ok()?"pointer":"default",fontFamily:"inherit"}}>Verein anlegen</button>
            }
          </div>
        </div>
      </div>
    </div>
  );
}

function Directory({data,onPick,onNewClub,lang,setLang,onLegal}) {
  const tr = (k) => T[lang]?.[k] ?? T.de[k] ?? k;
  const [mode,setMode] = useState("home");
  const [contactCl,setContactCl] = useState(null);
  const [search,setSearch] = useState("");
  const [sportFilter,setSportFilter] = useState("alle");
  const pub = (data.clubs||[]).filter(c=>c.dir!==false&&c.pub!==false);
  const q = search.toLowerCase();

  const filtered = pub.filter(c=>{
    const matchName = c.name.toLowerCase().includes(q)||c.short?.toLowerCase().includes(q);
    const matchSport = sportFilter==="alle" || (c.sport||"fussball")===sportFilter;
    return matchName && matchSport;
  });

  const SPORTS = ["alle","fussball","handball","tennis","badminton","schuetzen"];
  const SPORT_LABELS = {alle:tr("allSports"),fussball:"Fußball",handball:"Handball",tennis:"Tennis",badminton:"Badminton","schuetzen":"Schuetzen"};
  const SPORT_COLS = {fussball:"#16a34a",handball:"#2563eb",tennis:"#d97706",badminton:"#7c3aed","schuetzen":"#dc2626"};
  const letters = [...new Set(filtered.map(c=>c.name[0].toUpperCase()))].sort();

  if(mode==="setup") return (
    <SetupWizard onBack={()=>setMode("home")} onDone={newClub=>{onNewClub&&onNewClub(newClub);setMode("home");}}/>
  );

  if(mode==="contact"&&contactCl) return (
    <ContactForm cl={contactCl} onClose={()=>setMode("home")} onSend={req=>{
      const existing=(data.contactRequests||[]).filter(r=>r.cid===contactCl.id&&r.fromName===req.name&&!r.blocked);
      if(existing.length>=3){
        const logEntry={id:uid(),cid:contactCl.id,type:"many_requests",ts:new Date().toISOString(),detail:`Absender "${req.name}" hat ${existing.length+1} Anfragen gesendet. Zugang automatisch gesperrt.`,read:false};
        onNewClub&&onNewClub({...data,contactRequests:[...(data.contactRequests||[]).map(r=>r.cid===contactCl.id&&r.fromName===req.name?{...r,blocked:true}:r)],securityLog:[...(data.securityLog||[]),logEntry]});
        return;
      }
      const newReq={id:uid(),cid:contactCl.id,fromName:req.name,fromEmail:req.email,msg:req.msg,ts:req.ts,read:false,blocked:false};
      onNewClub&&onNewClub({...data,contactRequests:[...(data.contactRequests||[]),newReq]});
    }}/>
  );

  return (
    <div style={{minHeight:"100dvh",background:"linear-gradient(160deg,#0f172a 0%,#052e16 55%,#14532d 100%)",color:"#fff"}}>
      <style>{CSS}</style>

      {}
      <div style={{padding:"48px 22px 20px",textAlign:"center",maxWidth:460,margin:"0 auto"}}>
        <div style={{fontSize:52,marginBottom:10}}>&#x26BD;</div>
        <h1 style={{fontWeight:900,fontSize:28,margin:"0 0 8px",letterSpacing:-1}}>Vereins-App</h1>
        <p style={{color:"#86efac",fontSize:15,fontWeight:600,margin:"0 0 20px"}}>Termine. Mannschaften. Kommunikation.</p>
        {}
        <div style={{display:"flex",justifyContent:"center",marginBottom:14}}>
          <LangSwitcher lang={lang} setLang={setLang}/>
        </div>
        <div style={{display:"flex",gap:10,marginBottom:12}}>
          <button onClick={()=>onPick("__demo__")}
            style={{flex:1,padding:"13px 12px",borderRadius:14,border:"none",background:"rgba(255,255,255,.12)",color:"#fff",fontWeight:700,fontSize:14,cursor:"pointer",fontFamily:"inherit"}}>
            {tr("demoView")}
          </button>
          <button onClick={()=>setMode("setup")}
            style={{flex:1,padding:"13px 12px",borderRadius:14,border:"none",background:"#16a34a",color:"#fff",fontWeight:800,fontSize:14,cursor:"pointer",fontFamily:"inherit",boxShadow:"0 4px 20px rgba(22,163,74,.4)"}}>
            {tr("createClub")}
          </button>
        </div>
        {}
        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:8,marginBottom:8}}>
          {[[pub.length||1024,"Vereine"],["8.300+","Mitglieder"],["94k+","Termine"]].map(([v,l])=>(
            <div key={l} style={{background:"rgba(255,255,255,.06)",borderRadius:12,padding:"10px 6px",textAlign:"center",border:"1px solid rgba(255,255,255,.08)"}}>
              <div style={{fontWeight:900,fontSize:16,color:"#86efac"}}>{v}</div>
              <div style={{fontSize:10,color:"rgba(255,255,255,.4)",marginTop:2}}>{l}</div>
            </div>
          ))}
        </div>
      </div>

      {}
      <div style={{padding:"0 16px",maxWidth:460,margin:"0 auto"}}>
        <div style={{position:"relative",marginBottom:10}}>
          <span style={{position:"absolute",left:13,top:"50%",transform:"translateY(-50%)",fontSize:15,pointerEvents:"none",opacity:.5}}>&#128269;</span>
          <input value={search} onChange={e=>setSearch(e.target.value)} placeholder={tr("searchClub")}
            style={{width:"100%",padding:"11px 13px 11px 40px",fontSize:14,background:"rgba(255,255,255,.08)",border:"1.5px solid rgba(255,255,255,.12)",borderRadius:13,outline:"none",color:"#fff",boxSizing:"border-box"}}/>
        </div>
        <div style={{display:"flex",gap:7,overflowX:"auto",scrollbarWidth:"none",WebkitOverflowScrolling:"touch",paddingBottom:4,marginBottom:16}}>
          {SPORTS.map(s=>(
            <button key={s} onClick={()=>setSportFilter(s)}
              style={{padding:"6px 12px",borderRadius:99,border:`1.5px solid ${sportFilter===s?(SPORT_COLS[s]||"#16a34a"):"rgba(255,255,255,.12)"}`,background:sportFilter===s?(SPORT_COLS[s]||"#16a34a")+"22":"transparent",color:sportFilter===s?"#fff":"rgba(255,255,255,.4)",fontWeight:700,fontSize:12,cursor:"pointer",whiteSpace:"nowrap",fontFamily:"inherit",flexShrink:0}}>
              {SPORT_LABELS[s]}
            </button>
          ))}
        </div>
      </div>

      {}
      <div style={{maxWidth:460,margin:"0 auto",padding:"0 16px 60px"}}>
        {filtered.length===0&&search&&(
          <div style={{textAlign:"center",padding:"32px",color:"rgba(255,255,255,.3)"}}>
            <p style={{fontWeight:700,fontSize:15}}>Kein Verein gefunden</p>
            <p style={{fontSize:13,marginTop:4}}>Noch nicht dabei? Jetzt anlegen!</p>
            <button onClick={()=>setMode("setup")} style={{marginTop:12,padding:"10px 20px",borderRadius:12,border:"none",background:"#16a34a",color:"#fff",fontWeight:700,fontSize:13,cursor:"pointer",fontFamily:"inherit"}}>{tr("createClub")}</button>
          </div>
        )}

        {}
        {!search && letters.map(letter=>(
          <div key={letter} id={"letter-"+letter}>
            <div style={{color:"rgba(255,255,255,.25)",fontSize:11,fontWeight:800,letterSpacing:.5,padding:"12px 0 6px"}}>{letter}</div>
            <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:8,marginBottom:4}}>
              {filtered.filter(c=>c.name[0].toUpperCase()===letter).map(cl=>(
                <div key={cl.id} onClick={()=>onPick(cl.id)}
                  style={{background:"rgba(255,255,255,.06)",border:"1px solid rgba(255,255,255,.1)",borderRadius:14,padding:"12px",cursor:"pointer",transition:"background .15s"}}
                  onMouseEnter={e=>e.currentTarget.style.background="rgba(255,255,255,.1)"}
                  onMouseLeave={e=>e.currentTarget.style.background="rgba(255,255,255,.06)"}>
                  <div style={{width:36,height:36,borderRadius:10,background:(cl.pri||"#16a34a")+"22",display:"flex",alignItems:"center",justifyContent:"center",fontSize:16,marginBottom:7}}>
                    {cl.em||"*"}
                  </div>
                  <div style={{fontWeight:700,fontSize:13,color:"#fff",marginBottom:2,lineHeight:1.2}}>{cl.name}</div>
                  <div style={{fontSize:10,color:"rgba(255,255,255,.4)",marginBottom:7}}>{cl.sport||"Fußball"}</div>
                  <button onClick={e=>{e.stopPropagation();setContactCl(cl);setMode("contact");}}
                    style={{width:"100%",padding:"5px 8px",borderRadius:8,border:"1px solid rgba(255,255,255,.2)",background:"rgba(255,255,255,.08)",color:"rgba(255,255,255,.7)",fontWeight:600,fontSize:10,cursor:"pointer",fontFamily:"inherit"}}>
                    Kontaktieren
                  </button>
                </div>
              ))}
            </div>
          </div>
        ))}

        {}
        {search && filtered.length>0&&(
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:8}}>
            {filtered.map(cl=>(
              <div key={cl.id} onClick={()=>onPick(cl.id)}
                style={{background:"rgba(255,255,255,.06)",border:"1px solid rgba(255,255,255,.1)",borderRadius:14,padding:"12px",cursor:"pointer"}}>
                <div style={{fontWeight:700,fontSize:13,color:"#fff",marginBottom:2}}>{cl.name}</div>
                <div style={{fontSize:10,color:"rgba(255,255,255,.4)"}}>{cl.short} . {cl.sport||"Fußball"}</div>
              </div>
            ))}
          </div>
        )}

        {}
        {!search && letters.length>6&&(
          <div style={{position:"sticky",bottom:16,display:"flex",gap:5,flexWrap:"wrap",justifyContent:"center",marginTop:16,background:"rgba(0,0,0,.4)",borderRadius:14,padding:"8px 12px",backdropFilter:"blur(10px)"}}>
            {letters.map(l=>(
              <button key={l} onClick={()=>document.getElementById("letter-"+l)?.scrollIntoView({behavior:"smooth"})}
                style={{width:26,height:26,borderRadius:7,border:"1px solid rgba(255,255,255,.15)",background:"rgba(255,255,255,.08)",color:"rgba(255,255,255,.7)",fontSize:11,fontWeight:800,cursor:"pointer",fontFamily:"inherit"}}>
                {l}
              </button>
            ))}
          </div>
        )}

        <p style={{color:"rgba(255,255,255,.15)",fontSize:11,textAlign:"center",marginTop:20}}>
          {tr("onlyWithConsent")}
        </p>
        <div style={{display:"flex",justifyContent:"center",gap:16,marginTop:12,paddingBottom:8}}>
          <button onClick={()=>onLegal&&onLegal()} style={{background:"none",border:"none",color:"rgba(255,255,255,.25)",fontSize:11,cursor:"pointer",textDecoration:"underline"}}>Impressum</button>
          <button onClick={()=>onLegal&&onLegal()} style={{background:"none",border:"none",color:"rgba(255,255,255,.25)",fontSize:11,cursor:"pointer",textDecoration:"underline"}}>Datenschutz</button>
          <button onClick={()=>onLegal&&onLegal()} style={{background:"none",border:"none",color:"rgba(255,255,255,.25)",fontSize:11,cursor:"pointer",textDecoration:"underline"}}>Nutzungsbedingungen</button>
        </div>
        <div style={{marginTop:12}}></div>
      </div>
    </div>
  );
}

function RolePicker({cl,onRole,onBack}) {
  const t=TH(cl);
  const tr=useT();
  return (
    <div style={{minHeight:"100dvh",background:`linear-gradient(160deg,${t.s} 0%,${t.p}66 100%)`}}>
      <style>{CSS}</style>
      <div style={{padding:"50px 22px 0",maxWidth:440,margin:"0 auto"}}>
        <button onClick={onBack} style={{background:"rgba(255,255,255,.12)",border:"none",borderRadius:12,padding:"8px 14px",color:"rgba(255,255,255,.7)",fontSize:14,fontWeight:700,cursor:"pointer",marginBottom:32}}>{"<- "}Zurück</button>
        <div className="up" style={{display:"flex",flexDirection:"column",alignItems:"center",marginBottom:40}}>
          <Logo cl={cl} sz={80}/>
          <h1 style={{color:"#fff",fontSize:26,fontWeight:900,letterSpacing:-.5,margin:"14px 0 6px",textAlign:"center"}}>{cl.name}</h1>
          <p style={{color:"rgba(255,255,255,.55)",fontSize:15}}>Wie möchtest du einsteigen?</p>
        </div>
        {[
          {r:"user",icon:"E",title:tr("roleParent"),sub:tr("roleParentSub")},{r:"helper",icon:"H",title:tr("roleHelper"),sub:tr("roleHelperSub")},{r:"trainer",icon:"T",title:tr("roleTrainer"),sub:tr("roleTrainerSub")},{r:"admin",icon:"A",title:tr("roleAdmin"),sub:tr("roleAdminSub")}
        ].map((x,i)=>(
          <div key={x.r} className="up" onClick={()=>onRole(x.r)}
            style={{background:"rgba(255,255,255,.09)",border:"1.5px solid rgba(255,255,255,.13)",borderRadius:20,padding:"17px 20px",cursor:"pointer",marginBottom:12,animationDelay:`${i*.07}s`,transition:"all .18s"}}>
            <div style={{display:"flex",alignItems:"center",gap:14}}>
              <div style={{width:48,height:48,borderRadius:15,background:"rgba(255,255,255,.12)",display:"flex",alignItems:"center",justifyContent:"center",fontSize:24,flexShrink:0}}>{x.icon}</div>
              <div style={{flex:1}}><div style={{color:"#fff",fontWeight:900,fontSize:17}}>{x.title}</div><div style={{color:"rgba(255,255,255,.5)",fontSize:13,marginTop:2}}>{x.sub}</div></div>
              <div style={{color:"rgba(255,255,255,.3)",fontSize:22}}>{">"}</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function TrainerLogin({cl,trainers,teams,onLogin,onBack}) {
  const t=TH(cl);
  const [showForgotTr,setShowForgotTr]=useState(false);
  const [step,setStep]=useState("cat");  // cat -> trainer -> pwd
  const [cat,setCat]=useState(null);
  const [sel,setSel]=useState(null);
  const [pw,setPw]=useState("");
  const [err,setErr]=useState(false);
  const cats=[...new Set(
    trainers.flatMap(tr=>(tr.tids||[]).map(tid=>{
      const tm=teams?.find(x=>x.id===tid);
      return tm?.cat||tm?.name||null;
    }).filter(Boolean).filter(x=>!x.hidden))
  )].sort();

  const trainersInCat=cat
    ? trainers.filter(tr=>(tr.tids||[]).some(tid=>{const tm=teams?.find(x=>x.id===tid);return(tm?.cat||tm?.name)===cat;}))
    : [];
  const selTr=trainers.find(x=>x.id===sel);

  const go=()=>{
    if(selTr&&!selTr.locked&&checkPw(pw,selTr.pw||"")){onLogin({...selTr,role:"trainer"});}
    else{setErr(true);setTimeout(()=>setErr(false),1800);}
  };

  const GradWrap=({children})=>(
    <div style={{minHeight:"100dvh",background:`linear-gradient(160deg,${t.s} 0%,${t.p}66 100%)`}}>
      <style>{CSS}</style>
      <div style={{padding:"48px 20px 0",maxWidth:460,margin:"0 auto"}}>
        <button onClick={step==="cat"?onBack:step==="trainer"?()=>setStep("cat"):()=>{setStep("trainer");setPw("");setErr(false);}}
          style={{background:"rgba(255,255,255,.12)",border:"none",borderRadius:12,padding:"8px 14px",color:"rgba(255,255,255,.7)",fontSize:14,fontWeight:700,cursor:"pointer",marginBottom:28}}>{"<- "}Zurück</button>
        {children}
      </div>
    </div>
  );
  if(step==="cat") return (
    <GradWrap>
      <div className="up" style={{display:"flex",flexDirection:"column",alignItems:"center",marginBottom:32}}>
        <Logo cl={cl} sz={64}/>
        <h2 style={{color:"#fff",fontSize:24,fontWeight:900,margin:"12px 0 4px",textAlign:"center"}}>{cl.name}</h2>
        <p style={{color:"rgba(255,255,255,.55)",fontSize:14}}>Für welche Jugend bist du Trainer?</p>
      </div>
      {cats.length===0
        ? <div style={{background:"rgba(255,255,255,.1)",borderRadius:18,padding:"22px",textAlign:"center",color:"rgba(255,255,255,.6)"}}>Keine Trainer gefunden</div>
        : cats.map((c,i)=>{
            const trs=trainers.filter(tr=>(tr.tids||[]).some(tid=>{const tm=teams?.find(x=>x.id===tid);return(tm?.cat||tm?.name)===c;}));
            const icons=[...new Set(trs.flatMap(tr=>(tr.tids||[]).map(tid=>teams?.find(x=>x.id===tid)?.icon).filter(Boolean).filter(x=>!x.hidden)))];
            return (
              <div key={c} className="up" onClick={()=>{setCat(c);if(trs.length===1){setSel(trs[0].id);setPw("");setStep("pwd");}else setStep("trainer");}}
                style={{background:"rgba(255,255,255,.09)",border:"1.5px solid rgba(255,255,255,.13)",borderRadius:20,padding:"16px 20px",cursor:"pointer",marginBottom:12,animationDelay:`${i*.06}s`,display:"flex",alignItems:"center",gap:14}}>
                <div style={{width:46,height:46,borderRadius:14,background:"rgba(255,255,255,.15)",display:"flex",alignItems:"center",justifyContent:"center",fontSize:22,flexShrink:0}}>{icons[0]||"*"}</div>
                <div style={{flex:1}}>
                  <div style={{color:"#fff",fontWeight:900,fontSize:18}}>{c}</div>
                  <div style={{color:"rgba(255,255,255,.5)",fontSize:12,marginTop:2}}>{trs.length} Trainer</div>
                </div>
                <span style={{color:"rgba(255,255,255,.3)",fontSize:22}}>{">"}</span>
              </div>
            );
          })
      }
    </GradWrap>
  );
  if(step==="trainer") return (
    <GradWrap>
      <div className="up" style={{display:"flex",flexDirection:"column",alignItems:"center",marginBottom:32}}>
        <h2 style={{color:"#fff",fontSize:24,fontWeight:900,margin:"0 0 4px",textAlign:"center"}}>{cat}</h2>
        <p style={{color:"rgba(255,255,255,.55)",fontSize:14}}>Welcher Trainer bist du?</p>
      </div>
      {trainersInCat.map((tr,i)=>(
        <div key={tr.id} className="up" onClick={()=>{setSel(tr.id);setPw("");setErr(false);setStep("pwd");}}
          style={{background:"rgba(255,255,255,.09)",border:"1.5px solid rgba(255,255,255,.13)",borderRadius:20,padding:"15px 18px",cursor:"pointer",marginBottom:12,animationDelay:`${i*.06}s`,display:"flex",alignItems:"center",gap:13}}>
          <Av name={tr.name} sz={44}/>
          <div style={{flex:1}}>
            <div style={{color:"#fff",fontWeight:900,fontSize:17}}>{tr.name}</div>
            <div style={{color:"rgba(255,255,255,.5)",fontSize:12,marginTop:2}}>
              {(tr.tids||[]).map(tid=>teams?.find(x=>x.id===tid)?.name).filter(Boolean).filter(x=>!x.hidden).join(",")}
            </div>
          </div>
          <span style={{color:"rgba(255,255,255,.3)",fontSize:22}}>{">"}</span>
        </div>
      ))}
    </GradWrap>
  );
  return (
    <div style={{minHeight:"100dvh",background:`linear-gradient(160deg,${t.s},${t.p}66)`,display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",padding:24,position:"relative"}}>
      <style>{CSS}</style>
      <button onClick={()=>{setStep(trainersInCat.length>1?"trainer":"cat");setPw("");setErr(false);}} style={{position:"absolute",top:22,left:22,background:"rgba(255,255,255,.12)",border:"none",borderRadius:12,padding:"8px 14px",color:"rgba(255,255,255,.7)",fontSize:14,fontWeight:700,cursor:"pointer"}}>{"<- "}Zurück</button>
      <div className="up" style={{width:"100%",maxWidth:370}}>
        <div style={{textAlign:"center",marginBottom:28}}>
          <Av name={selTr?.name||"?"} sz={72} sx={{margin:"0 auto 14px"}}/>
          <h2 style={{color:"#fff",fontSize:22,fontWeight:900,margin:"0 0 4px"}}>{selTr?.name}</h2>
          <p style={{color:"rgba(255,255,255,.5)",fontSize:13}}>{cat} . {cl.name}</p>
        </div>
        <div style={{background:"rgba(255,255,255,.1)",backdropFilter:"blur(16px)",borderRadius:22,padding:"24px 22px",border:"1px solid rgba(255,255,255,.15)"}}>
          <input type="password" value={pw} onChange={e=>{setPw(e.target.value);setErr(false);}}
            onKeyDown={e=>{if(e.key==="Enter")go();}}
            placeholder="Passwort..." autoFocus
            style={{width:"100%",padding:"13px 16px",fontSize:16,background:"rgba(255,255,255,.12)",border:`2px solid ${err?"#ff6b6b":pw?"rgba(255,255,255,.4)":"rgba(255,255,255,.2)"}`,borderRadius:13,outline:"none",color:"#fff",marginBottom:10}}/>
          {err&&<FriendlyError type="wrongPassword"/>}
          {cl.id==="demo"&&<div style={{background:"rgba(255,255,255,.08)",borderRadius:10,padding:"8px 12px",marginBottom:10,fontSize:11,color:"rgba(255,255,255,.6)"}}>Demo: Trainer A = trainer1 | Trainer B = trainer2</div>}
          <button onClick={()=>setShowForgotTr(true)}
            style={{background:"none",border:"none",color:"rgba(255,255,255,.4)",
              fontSize:12,cursor:"pointer",fontFamily:"inherit",
              textDecoration:"underline",padding:0}}>
            Passwort vergessen?
          </button>
          {showForgotTr&&<ForgotPasswordHelp cl={cl} trainers={trainers}
            forRole="trainer" onBack={()=>setShowForgotTr(false)}/>}
          <button onClick={go} disabled={!pw.trim()}
            style={{width:"100%",padding:"13px",fontSize:15,fontWeight:800,background:pw.trim()?cl.pri:"rgba(255,255,255,.15)",color:pw.trim()?"#fff":"rgba(255,255,255,.4)",border:"none",borderRadius:13,cursor:pw.trim()?"pointer":"not-allowed",transition:"all .18s"}}>
             Einloggen
          </button>
        </div>
      </div>
    </div>
  );
}

function AdminLogin({cl,onLogin,onBack}) {
  const t=TH(cl); const [pw,setPw]=useState(""); const [err,setErr]=useState(false); const [showForgot,setShowForgot]=useState(false);
  const go=()=>{ if(checkPw(pw,cl.adm||"")){onLogin({id:"admin",role:"admin",cid:cl.id,name:"Vereinsadmin"});}else{setErr(true);setTimeout(()=>setErr(false),1800);} };
  return (
    <div style={{minHeight:"100dvh",background:`linear-gradient(135deg,${t.s},${t.p}66)`,display:"flex",alignItems:"center",justifyContent:"center",padding:22}}>
      <style>{CSS}</style>
      <div className="up" style={{width:"100%",maxWidth:390}}>
        <button onClick={onBack} style={{background:"rgba(255,255,255,.12)",border:"none",borderRadius:12,padding:"8px 14px",color:"rgba(255,255,255,.7)",fontSize:14,fontWeight:700,cursor:"pointer",marginBottom:26}}>{"<- "}Zurück</button>
        <div style={{background:"#fff",borderRadius:24,padding:"34px 26px",boxShadow:"0 24px 80px rgba(0,0,0,.4)"}}>
          <div style={{textAlign:"center",marginBottom:22}}><Logo cl={cl} sz={68} sx={{margin:"0 auto 12px"}}/><h2 style={{fontSize:22,fontWeight:900,color:"#0f172a",margin:"0 0 4px"}}>Vereinsadmin</h2><p style={{color:"#94a3b8",fontSize:13}}>{cl.name}</p></div>
          <Inp label="Admin-Passwort" type="password" val={pw} set={setPw} ph="Passwort..." af cl={cl}/>
          {cl.id==="demo"&&<div style={{background:"#f0fdf4",borderRadius:10,padding:"9px 13px",marginTop:8,fontSize:12,color:"#166534",border:"1px solid #bbf7d0"}}>Demo-Zugangsdaten: Passwort <strong>admin</strong></div>}
          {showForgot&&<AdminForgotPassword cl={cl} onBack={()=>setShowForgot(false)} onReset={newHash=>{onLogin({id:"admin",role:"admin",cid:cl.id,name:"Vereinsadmin"});}}/>}
          {err&&<FriendlyError type="wrongPassword" onClose={()=>setErr(false)}/>}
          <button onClick={()=>setShowForgot(true)}
            style={{background:"none",border:"none",color:"rgba(255,255,255,.5)",
              fontSize:12,cursor:"pointer",fontFamily:"inherit",
              textDecoration:"underline",marginTop:4,padding:0}}>
            Passwort vergessen?
          </button>
          <div style={{height:14}}/><Btn full ch="Als Admin einloggen" onClick={go} icon="**" v="drk"/>
          
        </div>
      </div>
    </div>
  );
}

function HelperLogin({cl,helpers,onLogin,onBack}) {
  const t=TH(cl);
  const [code,setCode]=useState(""); const [err,setErr]=useState(false);
  const clHelpers=(helpers||[]).filter(h=>h.cid===cl.id&&h.active!==false);
  const go=()=>{
    const h=clHelpers.find(x=>x.code===code.trim());
    if(h){onLogin({id:h.id,role:"helper",cid:cl.id,name:h.name,helperId:h.id});}
    else{setErr(true);setTimeout(()=>setErr(false),1800);}
  };
  return (
    <div style={{minHeight:"100dvh",background:`linear-gradient(135deg,${t.s},${t.p}66)`,display:"flex",alignItems:"center",justifyContent:"center",padding:22}}>
      <style>{CSS}</style>
      <div className="up" style={{width:"100%",maxWidth:390}}>
        <button onClick={onBack} style={{background:"rgba(255,255,255,.12)",border:"none",borderRadius:12,padding:"8px 14px",color:"rgba(255,255,255,.7)",fontSize:14,fontWeight:700,cursor:"pointer",marginBottom:26}}>{"<- "}Zurück</button>
        <div style={{background:"#fff",borderRadius:24,padding:"34px 26px",boxShadow:"0 24px 80px rgba(0,0,0,.3)"}}>
          <div style={{textAlign:"center",marginBottom:22}}>
            <div style={{fontSize:52,marginBottom:8}}></div>
            <h2 style={{fontSize:22,fontWeight:900,color:"#0f172a",margin:"0 0 4px"}}>Helfer-Zugang</h2>
            <p style={{color:"#94a3b8",fontSize:13}}>{cl.name}</p>
          </div>
          <div style={{background:"#fffbeb",borderRadius:12,padding:"11px 14px",marginBottom:16,border:"1.5px solid #fde68a",fontSize:12,color:"#92400e",lineHeight:1.6}}>
             Zugriff auf Spielpläne und Turnier-Übersichten. Keine internen Trainer-Notizen.
          </div>
          {clHelpers.length===0
            ? <div style={{background:"#fee2e2",borderRadius:12,padding:"11px 14px",marginBottom:14,fontSize:13,color:"#dc2626",fontWeight:600,textAlign:"center"}}>
                Keine aktiven Helfer-Accounts.<br/>Bitte Trainer kontaktieren.
              </div>
            : <>
                <Inp label="Persoenlicher Helfer-Code" type="password" val={code} set={v=>{setCode(v);setErr(false);}} ph="Code vom Trainer erhalten..." af cl={cl}/>
                {err&&<div style={{background:"#fef2f2",borderRadius:12,padding:"10px 14px",fontSize:14,fontWeight:700,color:"#dc2626",marginTop:10}}> Ungueltiger Code</div>}
                <div style={{height:14}}/>
                <Btn full ch="Als Helfer einloggen" onClick={go} dis={!code.trim()} cl={cl}/>
              </>
          }
        </div>
      </div>
    </div>
  );
}

function UserFlow({cl,teams,players,playerProfiles,onDone,onBack,trainers=[]}) {
  const t=TH(cl);
  const [step,setStep]=useState("cat");
  const [cat,setCat]=useState(null);
  const [tid,setTid]=useState(null);
  const [q,setQ]=useState("");
  const [pwd,setPwd]=useState(""); const [pwdErr,setPwdErr]=useState(false);
  const [showForgotParent,setShowForgotParent]=useState(false);
  const ct=teams.find(x=>x.id===tid);
  const cats=[...new Set(teams.map(tm=>tm.cat||tm.name))];
  const teamsInCat=cat?teams.filter(tm=>(tm.cat||tm.name)===cat):[];
  const list=(players[tid]||[]).filter(p=>p.toLowerCase().includes(q.toLowerCase()));
  const hasAssigned = tid
    ? (playerProfiles||[]).some(p=>p.mainTid===tid)
    : false;

  const goBack=()=>{
    if(step==="name")setStep("pwd");
    else if(step==="pwd")setStep(teamsInCat.length>1?"team":"cat");
    else if(step==="team")setStep("cat");
    else onBack();
  };

  const GradWrap=({title,sub,children})=>(
    <div style={{minHeight:"100dvh",background:`linear-gradient(160deg,${t.s} 0%,${t.p}66 100%)`}}>
      <style>{CSS}</style>
      <div style={{padding:"48px 20px 0",maxWidth:460,margin:"0 auto"}}>
        <button onClick={goBack} style={{background:"rgba(255,255,255,.12)",border:"none",borderRadius:12,padding:"8px 14px",color:"rgba(255,255,255,.7)",fontSize:14,fontWeight:700,cursor:"pointer",marginBottom:28}}>{"<- "}Zurück</button>
        <div className="up" style={{display:"flex",flexDirection:"column",alignItems:"center",marginBottom:32}}>
          <Logo cl={cl} sz={64}/>
          <h2 style={{color:"#fff",fontSize:24,fontWeight:900,margin:"12px 0 4px",textAlign:"center"}}>{title}</h2>
          <p style={{color:"rgba(255,255,255,.55)",fontSize:14}}>{sub}</p>
        </div>
        {children}
      </div>
    </div>
  );
  if(step==="cat") return (
    <GradWrap title={cl.name} sub="In welcher Altersklasse spielt dein Kind?">
      {cats.map((c,i)=>{
        const tms=teams.filter(tm=>(tm.cat||tm.name)===c);
        return (
          <div key={c} className="up" onClick={()=>{setCat(c);if(tms.length===1){setTid(tms[0].id);setPwd("");setStep("pwd");}else setStep("team");}}
            style={{background:"rgba(255,255,255,.09)",border:"1.5px solid rgba(255,255,255,.13)",borderRadius:20,padding:"16px 20px",cursor:"pointer",marginBottom:12,animationDelay:`${i*.06}s`,display:"flex",alignItems:"center",gap:14}}>
            <div style={{width:46,height:46,borderRadius:14,background:(tms[0]?.col||"#16a34a")+"33",display:"flex",alignItems:"center",justifyContent:"center",fontSize:24,flexShrink:0}}>{tms[0]?.icon||"*"}</div>
            <div style={{flex:1}}>
              <div style={{color:"#fff",fontWeight:900,fontSize:18}}>{c}</div>
              {tms.length>1&&<div style={{color:"rgba(255,255,255,.5)",fontSize:12,marginTop:2}}>{tms.length} Mannschaften</div>}
            </div>
            <span style={{color:"rgba(255,255,255,.3)",fontSize:22}}>{">"}</span>
          </div>
        );
      })}
    </GradWrap>
  );
  if(step==="team") return (
    <GradWrap title={cat} sub="Welche Mannschaft?">
      {teamsInCat.map((tm,i)=>(
        <div key={tm.id} className="up" onClick={()=>{setTid(tm.id);setPwd("");setStep("pwd");}}
          style={{background:"rgba(255,255,255,.09)",border:"1.5px solid rgba(255,255,255,.13)",borderRadius:20,padding:"16px 20px",cursor:"pointer",marginBottom:12,animationDelay:`${i*.06}s`,display:"flex",alignItems:"center",gap:14}}>
          <div style={{width:46,height:46,borderRadius:14,background:tm.col+"33",display:"flex",alignItems:"center",justifyContent:"center",fontSize:24,flexShrink:0}}>{tm.icon}</div>
          <span style={{color:"#fff",fontWeight:900,fontSize:18}}>{tm.name}</span>
          <span style={{marginLeft:"auto",color:"rgba(255,255,255,.3)",fontSize:22}}>{">"}</span>
        </div>
      ))}
    </GradWrap>
  );
  if(step==="pwd") return (
    <div style={{minHeight:"100dvh",background:`linear-gradient(160deg,${t.s},${t.p}66)`,display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",padding:24,position:"relative"}}>
      <style>{CSS}</style>
      <button onClick={goBack} style={{position:"absolute",top:22,left:22,background:"rgba(255,255,255,.12)",border:"none",borderRadius:12,padding:"8px 14px",color:"rgba(255,255,255,.7)",fontSize:14,fontWeight:700,cursor:"pointer"}}>{"<- "}Zurück</button>
      <div className="up" style={{width:"100%",maxWidth:370}}>
        <div style={{textAlign:"center",marginBottom:28}}>
          <div style={{width:72,height:72,borderRadius:22,background:ct?.col+"33",border:`1.5px solid ${ct?.col}66`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:38,margin:"0 auto 14px"}}>{ct?.icon}</div>
          <h2 style={{color:"#fff",fontSize:22,fontWeight:900,margin:"0 0 4px"}}>{ct?.name}</h2>
          <p style={{color:"rgba(255,255,255,.5)",fontSize:13}}>Team-Passwort eingeben</p>
        </div>
        <div style={{background:"rgba(255,255,255,.1)",backdropFilter:"blur(16px)",borderRadius:22,padding:"24px 22px",border:"1px solid rgba(255,255,255,.15)"}}>
          <input type="password" value={pwd} onChange={e=>{setPwd(e.target.value);setPwdErr(false);}}
            onKeyDown={e=>{if(e.key==="Enter"){if(ct?.locked){setPwdErr(true);}else if(checkPw(pwd,ct?.pwd||"")){const assigned=(playerProfiles||[]).some(p=>p.mainTid===ct.id);if(assigned)setStep("name");else setStep("locked");}else{setPwdErr(true);setTimeout(()=>setPwdErr(false),1800);}}}}
            placeholder="Passwort..." autoFocus
            style={{width:"100%",padding:"13px 16px",fontSize:16,background:"rgba(255,255,255,.12)",border:`2px solid ${pwdErr?"#ff6b6b":pwd?"rgba(255,255,255,.4)":"rgba(255,255,255,.2)"}`,borderRadius:13,outline:"none",color:"#fff",marginBottom:10}}/>
          {pwdErr&&<FriendlyError type="wrongPassword"/>}
          {showForgotParent&&<ForgotPasswordHelp cl={cl} trainers={trainers}
            forRole="user" teamId={ct?.id}
            onBack={()=>setShowForgotParent(false)}/>}
          {cl.id==="demo"&&<div style={{background:"rgba(255,255,255,.1)",borderRadius:10,padding:"8px 12px",marginBottom:10,fontSize:11,color:"rgba(255,255,255,.6)"}}>Demo-Passwort: <strong>{ct?.pwd}</strong></div>}
          <button onClick={()=>setShowForgotParent(true)}
            style={{background:"none",border:"none",color:"rgba(255,255,255,.4)",
              fontSize:12,cursor:"pointer",fontFamily:"inherit",
              textDecoration:"underline",marginTop:4,padding:0}}>
            Passwort vergessen?
          </button>
          <button onClick={()=>{if(ct?.locked){setPwdErr(true);}else if(checkPw(pwd,ct?.pwd||"")){
            const assigned=(playerProfiles||[]).some(p=>p.mainTid===ct.id);
            if(assigned) setStep("name");
            else setStep("locked"); // team not yet released
          }else{setPwdErr(true);setTimeout(()=>setPwdErr(false),1800);}}} disabled={!pwd.trim()}
            style={{width:"100%",padding:"13px",fontSize:15,fontWeight:800,background:pwd.trim()?cl.pri:"rgba(255,255,255,.15)",color:pwd.trim()?"#fff":"rgba(255,255,255,.4)",border:"none",borderRadius:13,cursor:pwd.trim()?"pointer":"not-allowed",transition:"all .18s"}}>
             Team öffnen
          </button>
          
        </div>
      </div>
    </div>
  );
  if(step==="locked") return (
    <div style={{minHeight:"100dvh",background:`linear-gradient(160deg,${t.s},${t.p}66)`,display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",padding:24}}>
      <style>{CSS}</style>
      <button onClick={()=>setStep("pwd")} style={{position:"absolute",top:22,left:22,background:"rgba(255,255,255,.12)",border:"none",borderRadius:12,padding:"8px 14px",color:"rgba(255,255,255,.7)",fontSize:14,fontWeight:700,cursor:"pointer"}}>{"<- "}Zurück</button>
      <div className="up" style={{textAlign:"center",maxWidth:340}}>
        <div style={{fontSize:64,marginBottom:16}}></div>
        <h2 style={{color:"#fff",fontSize:22,fontWeight:900,margin:"0 0 12px"}}>{ct?.name}</h2>
        <div style={{background:"rgba(255,255,255,.1)",borderRadius:18,padding:"24px 22px",border:"1px solid rgba(255,255,255,.15)"}}>
          <p style={{color:"#fff",fontSize:16,fontWeight:700,marginBottom:8}}>Kader noch nicht veroeffentlicht</p>
          <p style={{color:"rgba(255,255,255,.6)",fontSize:14,lineHeight:1.6}}>
            Der Trainer hat die Spieler-Einteilung für diese Mannschaft noch nicht abgeschlossen.
          </p>
          <div style={{marginTop:16,background:"rgba(255,255,255,.08)",borderRadius:12,padding:"12px",fontSize:13,color:"rgba(255,255,255,.5)"}}>
            Sobald der Trainer die Spieler zugeteilt hat,kannst du dich hier anmelden.
          </div>
        </div>
        <button onClick={()=>setStep("pwd")} style={{marginTop:20,padding:"12px 28px",borderRadius:13,border:"1.5px solid rgba(255,255,255,.3)",background:"transparent",color:"rgba(255,255,255,.7)",fontWeight:700,fontSize:14,cursor:"pointer",fontFamily:"inherit"}}>
          {"<- "}Zurück zum Login
        </button>
      </div>
    </div>
  );
  return (
    <div style={{minHeight:"100dvh",background:"#f0f4f8",display:"flex",flexDirection:"column"}}>
      <div style={{background:`linear-gradient(135deg,${t.s},${t.p}99)`,padding:"16px 18px 22px"}}>
        <button onClick={goBack} style={{background:"rgba(255,255,255,.12)",border:"none",borderRadius:12,padding:"8px 14px",color:"rgba(255,255,255,.7)",fontSize:14,fontWeight:700,cursor:"pointer",marginBottom:14}}>{"<- "}Zurück</button>
        <div style={{display:"flex",alignItems:"center",gap:12}}><Logo cl={cl} sz={40}/><div><div style={{color:"rgba(255,255,255,.6)",fontSize:12,fontWeight:700}}>{ct?.icon} {ct?.name}</div><div style={{color:"#fff",fontSize:20,fontWeight:900}}>Wer bist du?</div></div></div>
      </div>
      <div style={{padding:"12px 14px 0",background:"#f0f4f8",position:"sticky",top:0,zIndex:10}}>
        <div style={{position:"relative"}}><span style={{position:"absolute",left:14,top:"50%",transform:"translateY(-50%)",fontSize:16}}></span><input value={q} onChange={e=>setQ(e.target.value)} placeholder="Suchen..." style={{width:"100%",padding:"12px 16px 12px 42px",fontSize:15,border:"2px solid #e2e8f0",borderRadius:14,outline:"none",background:"#fff"}}/></div>
      </div>
      <div style={{flex:1,overflowY:"auto",padding:"10px 14px",display:"flex",flexDirection:"column",gap:8}}>
        {list.map((p,i)=>(
          <div key={p} className="up" onClick={()=>onDone(tid,p)}
            style={{background:"#fff",border:"1.5px solid #e2e8f0",borderRadius:16,padding:"13px 16px",cursor:"pointer",display:"flex",alignItems:"center",gap:12,animationDelay:`${i*.03}s`}}>
            <Av name={p} sz={40}/><span style={{fontWeight:700,fontSize:16,color:"#0f172a",flex:1}}>{p}</span><span style={{color:"#94a3b8",fontSize:20}}>{">"}</span>
          </div>
        ))}
        {list.length===0&&<div style={{textAlign:"center",padding:"32px",color:"#94a3b8"}}><div style={{fontSize:36,marginBottom:8}}></div><p style={{fontWeight:700}}>Niemanden gefunden</p></div>}
      </div>
      <div style={{padding:"12px 14px 36px",background:"#fff",borderTop:"1px solid #e2e8f0"}}>
        <p style={{fontSize:11,fontWeight:800,color:"#94a3b8",marginBottom:8}}>NICHT IN DER LISTE?</p>
        <input value={q} onChange={e=>setQ(e.target.value)} placeholder="Namen manuell eingeben..."
          style={{width:"100%",padding:"11px 14px",fontSize:14,border:"1.5px solid #e2e8f0",borderRadius:12,outline:"none",marginBottom:8}}/>
        {q.trim().length>1&&<button onClick={()=>onDone(tid,q.trim())}
          style={{width:"100%",padding:"11px",borderRadius:12,border:"none",background:cl.pri,color:contrast(cl.pri),fontWeight:800,fontSize:14,cursor:"pointer",fontFamily:"inherit"}}>
           Als "{q.trim()}" einloggen
        </button>}
      </div>
    </div>
  );
}

function PollAttend({ev,user,onVote,cl,session,save,data,fire}) {
  const yes  = Object.entries(ev.votes).filter(([,v])=>(typeof v==="object"?v.val:v)==="yes").map(([n])=>n);
  const no   = Object.entries(ev.votes).filter(([,v])=>(typeof v==="object"?v.val:v)==="no" ).map(([n])=>n);
  const late = Object.entries(ev.votes).filter(([,v])=>typeof v==="object"&&v.val==="yes"&&v.late).map(([n,v])=>({name:n,mins:v.late}));
  const rawUv=ev.votes[user]; const uv=typeof rawUv==="object"&&rawUv!==null?rawUv.val:rawUv;
  const myLate = typeof rawUv==="object"&&rawUv!==null ? rawUv.late : null;
  const [showLate, setShowLate] = useState(false);
  const [lateMins, setLateMins] = useState(myLate||15);
  const tot=yes.length+no.length; const p=cl?.pri||"#16a34a";
  const dlPassed=ev.deadline&&(now()>ev.deadline.date||(now()===ev.deadline.date));

  const voteYes = () => onVote(ev.id,"att","yes");
  const voteLate = () => { onVote(ev.id,"att",{val:"yes",late:lateMins}); setShowLate(false); };
  const [showReason, setShowReason] = useState(false);
  const [noReason, setNoReason] = useState("");
  const REASONS = ["Krank","Urlaub","Schulpflicht","Wettkampf","Sonstiges"];
  const voteNo = (reason="") => { onVote(ev.id,"att",{val:"no",reason}); setShowReason(false); };

  return (
    <div style={{display:"flex",flexDirection:"column",gap:10}}>
      {session?.role==="trainer"&&<TrainerCheckin ev={ev} session={session} save={save} data={data} fire={fire}/>}
      {(Object.values(ev.trainerPresence||{}).length>0&&session?.role==="user")&&<TrainerCheckin ev={ev} session={session} save={save} data={data} fire={fire}/>}
      {ev.note&&<div style={{background:"#fffbeb",border:"1.5px solid #fde68a",borderRadius:12,padding:"10px 13px",fontSize:13,color:"#92400e",fontWeight:500}}>{ev.note}</div>}
      {ev.deadline&&<div style={{background:dlPassed?"#fee2e2":"#fffbeb",border:`1.5px solid ${dlPassed?"#fca5a5":"#fde68a"}`,borderRadius:12,padding:"9px 13px",fontSize:13,fontWeight:700,color:dlPassed?"#dc2626":"#d97706"}}>{dlPassed?"Frist abgelaufen - Abstimmung wird trotzdem gezählt":"Abstimmungs-Frist: "+ev.deadline.date+(ev.deadline.time?" "+ev.deadline.time+" Uhr":"")}</div>}

      {/* Dabei */}
      <div onClick={()=>!myLate&&voteYes()}
        style={{borderRadius:16,border:`2px solid ${uv==="yes"&&!myLate?p:"#e2e8f0"}`,background:uv==="yes"&&!myLate?mix(p,86):"#fafafa",padding:"14px 16px",cursor:"pointer",transition:"all .18s"}}>
        <div style={{display:"flex",alignItems:"center",gap:10,marginBottom:8}}>
          <div style={{width:22,height:22,borderRadius:"50%",border:`${uv==="yes"&&!myLate?"7px":"2px"} solid ${uv==="yes"&&!myLate?p:"#cbd5e1"}`,background:"#fff",flexShrink:0,transition:"all .15s"}}/>
          <span style={{flex:1,fontSize:16,fontWeight:uv==="yes"&&!myLate?800:600,color:uv==="yes"&&!myLate?p:"#334155"}}>Mein Kind ist dabei</span>
          {yes.filter(n=>!late.find(l=>l.name===n)).length>0&&<div style={{display:"flex",alignItems:"center",gap:4}}>
            <div style={{display:"flex"}}>{yes.filter(n=>!late.find(l=>l.name===n)).slice(0,5).map((v,i)=><div key={v} style={{marginLeft:i?-8:0,zIndex:5-i}}><Av name={v} sz={24}/></div>)}</div>
            <span style={{fontSize:13,fontWeight:800,color:"#475569",marginLeft:5}}>{yes.filter(n=>!late.find(l=>l.name===n)).length}</span>
          </div>}
        </div>
        <div style={{height:5,borderRadius:99,background:"#e2e8f0",overflow:"hidden"}}><div style={{height:"100%",borderRadius:99,background:p,width:`${tot>0?(yes.length/tot)*100:0}%`,transition:"width .45s"}}/></div>
      </div>

      {/* Verspätet */}
      <div style={{borderRadius:16,border:`2px solid ${myLate?"#d97706":"#e2e8f0"}`,background:myLate?"#fef3c7":"#fafafa",padding:"14px 16px",transition:"all .18s"}}>
        <div style={{display:"flex",alignItems:"center",gap:10,marginBottom:showLate?12:0}}>
          <div onClick={()=>setShowLate(s=>!s)} style={{width:22,height:22,borderRadius:"50%",border:`${myLate?"7px":"2px"} solid ${myLate?"#d97706":"#cbd5e1"}`,background:"#fff",flexShrink:0,cursor:"pointer",transition:"all .15s"}}/>
          <span onClick={()=>setShowLate(s=>!s)} style={{flex:1,fontSize:16,fontWeight:myLate?800:600,color:myLate?"#d97706":"#334155",cursor:"pointer"}}>
            {myLate ? `Kommt ca. ${myLate} Min. zu spät` : "Kommt zu spät"}
          </span>
          {late.length>0&&<div style={{display:"flex",alignItems:"center",gap:4}}>
            <div style={{display:"flex"}}>{late.slice(0,5).map((l,i)=><div key={l.name} style={{marginLeft:i?-8:0,zIndex:5-i}}><Av name={l.name} sz={24}/></div>)}</div>
            <span style={{fontSize:13,fontWeight:800,color:"#d97706",marginLeft:5}}>{late.length}</span>
          </div>}
        </div>
        {/* Late time picker */}
        {showLate&&(
          <div style={{paddingTop:8,borderTop:"1px solid #fde68a"}}>
            <div style={{fontSize:12,fontWeight:700,color:"#92400e",marginBottom:8}}>Wie spät kommt dein Kind?</div>
            <div style={{display:"flex",gap:7,flexWrap:"wrap",marginBottom:12}}>
              {[5,10,15,20,30,45,60].map(m=>(
                <button key={m} onClick={()=>setLateMins(m)}
                  style={{padding:"7px 13px",borderRadius:99,border:`2px solid ${lateMins===m?"#d97706":"#e2e8f0"}`,background:lateMins===m?"#d97706":"#fff",color:lateMins===m?"#fff":"#64748b",fontWeight:700,fontSize:13,cursor:"pointer",fontFamily:"inherit"}}>
                  {m} Min
                </button>
              ))}
            </div>
            <div style={{display:"flex",gap:9}}>
              <button onClick={voteLate}
                style={{flex:1,padding:"11px",borderRadius:12,border:"none",background:"#d97706",color:"#fff",fontWeight:800,fontSize:14,cursor:"pointer",fontFamily:"inherit"}}>
                Bestaetigen
              </button>
              <button onClick={()=>setShowLate(false)}
                style={{padding:"11px 16px",borderRadius:12,border:"1.5px solid #e2e8f0",background:"#fff",fontWeight:700,fontSize:13,cursor:"pointer",fontFamily:"inherit"}}>
                Abbrechen
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Nicht dabei */}
      <div onClick={()=>uv==="no"?voteNo():setShowReason(s=>!s)}
        style={{borderRadius:16,border:`2px solid ${uv==="no"?"#dc2626":"#e2e8f0"}`,background:uv==="no"?"#fee2e2":"#fafafa",padding:"14px 16px",cursor:"pointer",transition:"all .18s"}}>
        <div style={{display:"flex",alignItems:"center",gap:10,marginBottom:8}}>
          <div style={{width:22,height:22,borderRadius:"50%",border:`${uv==="no"?"7px":"2px"} solid ${uv==="no"?"#dc2626":"#cbd5e1"}`,background:"#fff",flexShrink:0,transition:"all .15s"}}/>
          <span style={{flex:1,fontSize:16,fontWeight:uv==="no"?800:600,color:uv==="no"?"#dc2626":"#334155"}}>Leider nicht dabei</span>
          {no.length>0&&<div style={{display:"flex",alignItems:"center",gap:4}}>
            <div style={{display:"flex"}}>{no.slice(0,5).map((v,i)=><div key={v} style={{marginLeft:i?-8:0,zIndex:5-i}}><Av name={v} sz={24}/></div>)}</div>
            <span style={{fontSize:13,fontWeight:800,color:"#475569",marginLeft:5}}>{no.length}</span>
          </div>}
        </div>
        <div style={{height:5,borderRadius:99,background:"#e2e8f0",overflow:"hidden"}}><div style={{height:"100%",borderRadius:99,background:"#dc2626",width:`${tot>0?(no.length/tot)*100:0}%`,transition:"width .45s"}}/></div>
      </div>

      {/* Abmelde-Grund */}
      {showReason&&(
        <div style={{background:"#fef2f2",borderRadius:13,padding:"12px 14px",border:"1.5px solid #fca5a5"}}>
          <div style={{fontWeight:700,fontSize:13,color:"#991b1b",marginBottom:8}}>Warum kann dein Kind nicht?</div>
          <div style={{display:"flex",flexWrap:"wrap",gap:7,marginBottom:10}}>
            {REASONS.map(r=>(
              <button key={r} onClick={()=>voteNo(r)}
                style={{padding:"7px 14px",borderRadius:99,border:"1.5px solid #fca5a5",background:"#fff",color:"#dc2626",fontWeight:700,fontSize:13,cursor:"pointer",fontFamily:"inherit"}}>
                {r}
              </button>
            ))}
          </div>
          <button onClick={()=>voteNo("")} style={{fontSize:12,color:"#94a3b8",background:"none",border:"none",cursor:"pointer",fontFamily:"inherit"}}>Ohne Angabe</button>
        </div>
      )}
      {/* Verspätungs-Übersicht für Trainer */}
      {late.length>0&&(
        <div style={{background:"#fef3c7",borderRadius:13,padding:"11px 14px",border:"1.5px solid #fde68a"}}>
          <div style={{fontWeight:800,fontSize:12,color:"#92400e",marginBottom:7}}>Verspätungen ({late.length})</div>
          <div style={{display:"flex",flexDirection:"column",gap:5}}>
            {late.map(l=>(
              <div key={l.name} style={{display:"flex",alignItems:"center",gap:8,fontSize:13}}>
                <Av name={l.name} sz={24}/>
                <span style={{fontWeight:600,color:"#334155",flex:1}}>{l.name}</span>
                <span style={{fontWeight:800,color:"#d97706"}}>+{l.mins} Min</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {tot>0&&<p style={{textAlign:"center",fontSize:12,color:"#94a3b8",fontWeight:600}}>
        {yes.length} dabei . {late.length>0?`${late.length} verspätet . `:""}{no.length} nicht dabei
      </p>}
    </div>
  );
  return (
    <div style={{display:"flex",flexDirection:"column",gap:10}}>
      {session?.role==="trainer"&&<TrainerCheckin ev={ev} session={session} save={save} data={data} fire={fire}/>}
      {(Object.values(ev.trainerPresence||{}).length>0&&session?.role==="user")&&<TrainerCheckin ev={ev} session={session} save={save} data={data} fire={fire}/>}
      {ev.note&&<div style={{background:"#fffbeb",border:"1.5px solid #fde68a",borderRadius:12,padding:"10px 13px",fontSize:13,color:"#92400e",fontWeight:500}}> {ev.note}</div>}
      {ev.deadline&&<div style={{background:dlPassed?"#fee2e2":"#fffbeb",border:`1.5px solid ${dlPassed?"#fca5a5":"#fde68a"}`,borderRadius:12,padding:"9px 13px",fontSize:13,fontWeight:700,color:dlPassed?"#dc2626":"#d97706"}}> {dlPassed?"Frist abgelaufen - Abstimmung wird trotzdem gezählt":"Abstimmungs-Frist: "+ev.deadline.date+(ev.deadline.time?" "+ev.deadline.time+" Uhr":"")}</div>}
      {[{id:"yes",label:ev.selfVote?"Ich bin dabei":"Mein Kind ist dabei",color:p,bg:mix(p,86),voters:yes},{id:"no",label:"Leider nicht dabei",color:"#dc2626",bg:"#fee2e2",voters:no}].map(o=>{
        const sel=uv===o.id; const pct=tot>0?(o.voters.length/tot)*100:0;
        return (
          <div key={o.id} onClick={()=>onVote(ev.id,"att",o.id)}
            style={{borderRadius:16,border:`2px solid ${sel?o.color:"#e2e8f0"}`,background:sel?o.bg:"#fafafa",padding:"14px 16px",cursor:"pointer",transition:"all .18s"}}>
            <div style={{display:"flex",alignItems:"center",gap:10,marginBottom:8}}>
              <div style={{width:22,height:22,borderRadius:"50%",border:`${sel?"7px":"2px"} solid ${sel?o.color:"#cbd5e1"}`,background:"#fff",flexShrink:0,transition:"all .15s",boxShadow:sel?`0 0 0 3px ${o.color}30`:"none"}}/>
              <span style={{flex:1,fontSize:16,fontWeight:sel?800:600,color:sel?o.color:"#334155"}}>{o.label}</span>
              {o.voters.length>0&&<div style={{display:"flex",alignItems:"center",gap:4}}><div style={{display:"flex"}}>{o.voters.slice(0,5).map((v,i)=><div key={v} style={{marginLeft:i?-8:0,zIndex:5-i}}><Av name={v} sz={24}/></div>)}</div><span style={{fontSize:13,fontWeight:800,color:"#475569",marginLeft:5}}>{o.voters.length}</span></div>}
            </div>
            <div style={{height:5,borderRadius:99,background:"#e2e8f0",overflow:"hidden"}}><div style={{height:"100%",borderRadius:99,background:o.color,width:`${pct}%`,transition:"width .45s cubic-bezier(.4,0,.2,1)"}}/></div>
          </div>
        );
      })}
      {tot>0&&<p style={{textAlign:"center",fontSize:12,color:"#94a3b8",fontWeight:600}}>{yes.length} dabei . {no.length} nicht dabei . {tot} gesamt</p>}
    </div>
  );
}

function PollList({ev,user,onVote,session,save,data,fire}) {
  const uv=ev.votes[user]||[];
  const totFor=id=>Object.values(ev.votes).flat().filter(v=>v===id).length;
  const vFor  =id=>Object.entries(ev.votes).filter(([,vs])=>Array.isArray(vs)&&vs.includes(id)).map(([n])=>n);
  const tog=id=>{
    const item=ev.li.find(i=>i.id===id); const cur=[...uv]; const idx=cur.indexOf(id);
    if(idx>=0){cur.splice(idx,1);}else{const tk=totFor(id),mn=cur.includes(id)?1:0;if(item.max&&(tk-mn)>=item.max)return;cur.push(id);}
    onVote(ev.id,"list",cur);
  };
  const mxPct=Math.max(...(ev.li||[]).map(i=>totFor(i.id)),1);
  const uniq=[...new Set(Object.entries(ev.votes).filter(([,v])=>Array.isArray(v)&&v.length>0).map(([n])=>n))];
  return (
    <div>
      {session?.role==="trainer"&&<TrainerCheckin ev={ev} session={session} save={save} data={data} fire={fire}/>}
      {(Object.values(ev.trainerPresence||{}).length>0&&session?.role==="user")&&<TrainerCheckin ev={ev} session={session} save={save} data={data} fire={fire}/>}
      {ev.note&&<div style={{background:"#fffbeb",border:"1.5px solid #fde68a",borderRadius:12,padding:"10px 13px",fontSize:13,color:"#92400e",fontWeight:500,marginBottom:12}}> {ev.note}</div>}
      <p style={{fontSize:13,color:"#64748b",fontWeight:600,marginBottom:10}}> Mehrfachauswahl möglich - tippe zum Auswählen</p>
      <div style={{display:"flex",flexDirection:"column",gap:8}}>
        {(ev.li||[]).map(item=>{
          const sel=uv.includes(item.id); const tk=totFor(item.id); const mn=sel?1:0; const full=item.max&&(tk-mn)>=item.max; const vts=vFor(item.id);
          return (
            <div key={item.id} onClick={()=>!full&&tog(item.id)}
              style={{borderRadius:14,border:`2px solid ${sel?"#16a34a":full?"#fca5a5":"#e2e8f0"}`,background:sel?"#dcfce7":full&&!sel?"#fff5f5":"#fafafa",padding:"12px 14px",cursor:full&&!sel?"not-allowed":"pointer",opacity:full&&!sel?.55:1,transition:"all .15s"}}>
              <div style={{display:"flex",alignItems:"center",gap:10,marginBottom:5}}>
                <div style={{width:22,height:22,borderRadius:7,background:sel?"#16a34a":"#fff",border:`2px solid ${sel?"#16a34a":"#cbd5e1"}`,display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0,transition:"all .15s"}}>{sel&&<span style={{color:"#fff",fontSize:13,fontWeight:900,lineHeight:1}}></span>}</div>
                <span style={{flex:1,fontWeight:sel?800:600,fontSize:15,color:sel?"#15803d":"#334155"}}>{item.txt}</span>
                {item.max&&<Tag c={full&&!sel?"#dc2626":"#64748b"} bg={full&&!sel?"#fee2e2":"#f1f5f9"} ch={full&&!sel?"Voll *":`max ${item.max}`}/>}
                {vts.length>0&&<div style={{display:"flex",alignItems:"center",gap:3}}><div style={{display:"flex"}}>{vts.slice(0,3).map((v,i)=><div key={v} style={{marginLeft:i?-6:0,zIndex:3-i}}><Av name={v} sz={20}/></div>)}</div><span style={{fontSize:12,fontWeight:800,color:"#475569",marginLeft:3}}>{tk}</span></div>}
              </div>
              <div style={{height:4,borderRadius:99,background:"#e2e8f0",overflow:"hidden"}}><div style={{height:"100%",borderRadius:99,background:sel?"#16a34a":full?"#fca5a5":"#94a3b8",width:`${(tk/mxPct)*100}%`,transition:"width .4s ease"}}/></div>
            </div>
          );
        })}
      </div>
      {uniq.length>0&&<div style={{marginTop:14,padding:"12px",background:"#f8fafc",borderRadius:12,border:"1px solid #e2e8f0"}}><p style={{fontSize:11,fontWeight:800,color:"#94a3b8",marginBottom:8}}>BEREITS EINGETRAGEN</p><div style={{display:"flex",flexWrap:"wrap",gap:6}}>{uniq.map(n=><div key={n} style={{display:"flex",alignItems:"center",gap:5,background:"#fff",borderRadius:99,padding:"4px 10px",border:"1px solid #e2e8f0"}}><Av name={n} sz={16}/><span style={{fontSize:12,fontWeight:700,color:"#334155"}}>{n}</span></div>)}</div></div>}
    </div>
  );
}

const POSITIONS_LIST = ["Torwart","Innenverteidiger","Aussenverteidiger","Def. Mittelfeld","Zentrales Mittelfeld","Off. Mittelfeld","Linker Fluegel","Rechter Fluegel","Stürmer","Universalspieler"];
const FOOT_LIST      = ["Rechts","Links","Beidfuessig"];
const RECOMMEND_LIST = ["Aufsteigen","Verbleiben","Absteigen","Pause empfohlen","Beobachten"];
const TEAM_HIERARCHY = [];
function getRecommendColor(rec) {
  if(rec==="Aufsteigen") return {col:"#16a34a",bg:"#dcfce7",icon:"^"};
  if(rec==="Verbleiben") return {col:"#2563eb",bg:"#eff6ff",icon:"="};
  if(rec==="Absteigen")  return {col:"#dc2626",bg:"#fee2e2",icon:"v"};
  if(rec==="Pause empfohlen") return {col:"#d97706",bg:"#fef3c7",icon:"P"};
  if(rec==="Beobachten") return {col:"#7c3aed",bg:"#ede9fe",icon:"?"};
  return {col:"#94a3b8",bg:"#f1f5f9",icon:"-"};
}
const JERSEY_SIZES   = ["104","110","116","122","128","134","140","146","152","158","164","XS","S","M","L","XL"];
const JERSEY_STATUS  = [
  {id:"home",icon:"Heim",label:"Zu Hause",col:"#16a34a",bg:"#dcfce7"},{id:"bag",icon:"*",label:"Im Sporttasche",col:"#2563eb",bg:"#eff6ff"},{id:"lost",icon:"*",label:"Nicht auffindbar",col:"#d97706",bg:"#fef3c7"},{id:"damaged",icon:"*",label:"Beschaedigt",col:"#dc2626",bg:"#fee2e2"},{id:"ok",icon:"OK",label:"Abgegeben",col:"#16a34a",bg:"#dcfce7"},{id:"none",icon:"-",label:"Keine Angabe",col:"#94a3b8",bg:"#f1f5f9"},];
const BASE_STRENGTHS = ["Schnelligkeit","Technik","Zweikampf","Kopfball","Übersicht","Flanken","Schuss","Ausdauer","Fuehrung","Einsatz","Pressing","Spielaufbau","Defensivstärke","Torwartreflex"];

const CAT_YEARS = {
  "Bambinis": [2019,2020,2021,2022],"G-Jugend": [2017,2018,2019],"F-Jugend": [2015,2016,2017],"E-Jugend": [2013,2014,2015],"D-Jugend": [2011,2012,2013],"C-Jugend": [2009,2010,2011],"B-Jugend": [2007,2008,2009],"A-Jugend": [2005,2006,2007],};
const CAT_ORDER = ["Bambinis","G-Jugend","F-Jugend","E-Jugend","D-Jugend","C-Jugend","B-Jugend","A-Jugend"];

function eligibleCats(by,gender) {
  const boost = gender === "w" ? 2 : 0;
  return Object.entries(CAT_YEARS)
    .filter(([,years]) => years.includes(by) || years.includes(by + boost))
    .map(([cat]) => cat);
}
function playerFitType(player,team) {
  const cat = team.cat || team.name;
  const years = CAT_YEARS[cat];
  if (!years) return false;
  const by = player.by || 2014;
  const gender = player.gender || "m";
  if (years.includes(by)) return "normal";
  if (gender === "w" && years.includes(by + 2)) return "normal";
  const naturalCat = Object.entries(CAT_YEARS).find(([,yrs])=>yrs.includes(by))?.[0];
  const naturalIdx = CAT_ORDER.indexOf(naturalCat);
  const teamIdx    = CAT_ORDER.indexOf(cat);
  if (naturalIdx < 0 || teamIdx < 0) return false;
  const jump = teamIdx - naturalIdx;
  if (jump <= 0) return false; // can't play down (that's opt-in)

  if (gender === "m" && jump <= 2) return "pullup";   // boys: max 2 categories up
  if (gender === "w" && jump <= 4) return "girlpullup"; // girls: max 4 categories up (incl. Mädchen-Regel)
  return false;
}
function playerFitsTeam(player,team) {
  return !!playerFitType(player,team);
}
function fitLabel(fitType) {
  if (fitType === "normal")     return null; // no label needed
  if (fitType === "pullup")     return {text:"* Hochgeholt",col:"#d97706",bg:"#fef3c7"};
  if (fitType === "girlpullup") return {text:"* Hochgeholt (W)",col:"#7c3aed",bg:"#ede9fe"};
  return null;
}

function mkPlayer(fields = {}) {
  return {
    id: uid(),name: "",by:2014,gender:"m",mainTid:"",optTids: [],position: "",foot: "",strengths: [],customStrengths: [],goals:0,assists:0,yellowCards:0,redCards:0,notes: "",recommend: "",rating:0,friends: [],mustWith: [],jerseyNr:"",jerseySize:"",jerseyStatus:"none",lastTeam: "",// Freitext: z.B. "F3 25/26" oder "G-Jugend"
    lastTeamId: "",// Team-ID der letzten Saison für Logik
    seasonId: "",// Saison-ID z.B. "s2526"
    ...fields
  };
}

function playerStats(playerName,allTids,events) {
  const stats = {};
  for (const ev of events) {
    if (!allTids.includes(ev.tid)) continue;
    const rawV = ev.votes?.[playerName];
    const val  = typeof rawV === "object" && rawV ? rawV.val : rawV;
    if (!val) continue;
    const isGame = ["heimspiel","auswarts","freundschaft","turnier"].includes(ev.type);
    const isTraining = ev.type === "training";
    if (!stats[ev.tid]) stats[ev.tid] = {training:0,games:0,name:"",icon:""};
    if (isGame)     stats[ev.tid].games++;
    if (isTraining) stats[ev.tid].training++;
  }
  return stats;
}

function Section({ title,children }) {
  return (
    <div style={{background:"#fff",borderRadius:16,padding:"16px",border:"1.5px solid #e2e8f0",display:"flex",flexDirection:"column",gap:12}}>
      <div style={{fontWeight:800,fontSize:14,color:"#0f172a",borderBottom:"1px solid #f1f5f9",paddingBottom:10,marginBottom:2}}>{title}</div>
      {children}
    </div>
  );
}

function StrengthsInput({ strengths,customStrengths,onChange,tp }) {
  const [custom,setCustom] = useState("");
  const all = strengths || [];
  const allCustom = customStrengths || [];

  const toggleBase = s => {
    onChange(all.includes(s) ? all.filter(x=>x!==s) : [...all,s],allCustom);
  };
  const addCustom = () => {
    const v = custom.trim();
    if (!v || allCustom.includes(v)) return;
    onChange(all,[...allCustom,v]);
    setCustom("");
  };
  const removeCustom = s => onChange(all,allCustom.filter(x=>x!==s));

  return (
    <div>
      <div style={{display:"flex",flexWrap:"wrap",gap:6,marginBottom:10}}>
        {BASE_STRENGTHS.map(s => {
          const sel = all.includes(s);
          return (
            <button key={s} onClick={()=>toggleBase(s)}
              style={{padding:"6px 12px",borderRadius:99,border:`1.5px solid ${sel?tp:"#e2e8f0"}`,background:sel?tp+"15":"#fff",color:sel?tp:"#475569",fontWeight:700,fontSize:12,cursor:"pointer",fontFamily:"inherit",transition:"all .14s"}}>
              {sel?"* ":""}{s}
            </button>
          );
        })}
      </div>
      {}
      {allCustom.length > 0 && (
        <div style={{display:"flex",flexWrap:"wrap",gap:6,marginBottom:10}}>
          {allCustom.map(s => (
            <span key={s} style={{display:"inline-flex",alignItems:"center",gap:5,background:tp+"15",color:tp,borderRadius:99,padding:"5px 11px",fontSize:12,fontWeight:700,border:`1.5px solid ${tp}40`}}>
               {s}
              <button onClick={()=>removeCustom(s)} style={{background:"none",border:"none",color:tp,cursor:"pointer",fontSize:13,lineHeight:1,padding:0,opacity:.7}}></button>
            </span>
          ))}
        </div>
      )}
      <div style={{display:"flex",gap:8}}>
        <input value={custom} onChange={e=>setCustom(e.target.value)}
          onKeyDown={e=>{if(e.key==="Enter"){e.preventDefault();addCustom();}}}
          placeholder="Eigene Stärke eingeben..."
          style={{flex:1,padding:"9px 13px",fontSize:13,border:`1.5px solid ${custom?tp:"#e2e8f0"}`,borderRadius:10,outline:"none",transition:"border-color .14s"}}/>
        <button onClick={addCustom} disabled={!custom.trim()}
          style={{padding:"0 14px",height:38,borderRadius:10,border:"none",background:custom.trim()?tp:"#e2e8f0",color:custom.trim()?"#fff":"#94a3b8",fontWeight:700,fontSize:13,cursor:custom.trim()?"pointer":"default",fontFamily:"inherit",transition:"all .18s",whiteSpace:"nowrap"}}>
          + Hinzufügen
        </button>
      </div>
      <p style={{fontSize:11,color:"#94a3b8",marginTop:6}}>? Enter oder Button . Eigene Stärken werden orange angezeigt</p>
    </div>
  );
}

function FriendsInput({ label,sub,ids,allPlayers,current,onChange,color }) {
  const [open,setOpen] = useState(false);
  const [q,setQ]       = useState("");
  const selected = allPlayers.filter(p => ids.includes(p.id));
  const available = allPlayers.filter(p =>
    p.id !== current?.id &&
    !ids.includes(p.id) &&
    p.name.toLowerCase().includes(q.toLowerCase())
  );
  const toggle = id => onChange(ids.includes(id) ? ids.filter(x=>x!==id) : [...ids,id]);

  return (
    <div>
      <div style={{fontSize:12,fontWeight:800,color:"#334155",marginBottom:4}}>{label}</div>
      {sub&&<div style={{fontSize:11,color:"#94a3b8",marginBottom:8}}>{sub}</div>}
      {}
      {selected.length>0&&(
        <div style={{display:"flex",flexWrap:"wrap",gap:6,marginBottom:8}}>
          {selected.map(pl=>(
            <div key={pl.id} style={{display:"flex",alignItems:"center",gap:6,background:color+"15",borderRadius:99,padding:"5px 10px",border:`1.5px solid ${color}40`}}>
              <Av name={pl.name} sz={22}/>
              <span style={{fontSize:12,fontWeight:700,color}}>{pl.name}</span>
              <button onClick={()=>toggle(pl.id)} style={{background:"none",border:"none",color,cursor:"pointer",fontSize:14,padding:0,lineHeight:1,opacity:.7}}></button>
            </div>
          ))}
        </div>
      )}
      {}
      <button onClick={()=>setOpen(s=>!s)}
        style={{display:"flex",alignItems:"center",gap:6,padding:"7px 12px",borderRadius:10,border:`2px dashed ${color}50`,background:color+"08",color,fontWeight:700,fontSize:12,cursor:"pointer",fontFamily:"inherit",width:"100%",justifyContent:"center"}}>
        {open?"? Schließen":"? Spieler hinzufügen"}
      </button>
      {open&&(
        <div style={{marginTop:8,background:"#f8fafc",borderRadius:12,padding:"10px",border:"1.5px solid #e2e8f0"}}>
          <input value={q} onChange={e=>setQ(e.target.value)} placeholder="Suchen..."
            style={{width:"100%",padding:"8px 12px",fontSize:13,border:"1.5px solid #e2e8f0",borderRadius:9,outline:"none",marginBottom:8}}/>
          <div style={{maxHeight:160,overflowY:"auto",display:"flex",flexDirection:"column",gap:4}}>
            {available.slice(0,20).map(pl=>(
              <button key={pl.id} onClick={()=>{toggle(pl.id);}}
                style={{display:"flex",alignItems:"center",gap:8,padding:"7px 10px",borderRadius:9,border:"none",background:"#fff",cursor:"pointer",fontFamily:"inherit",textAlign:"left",width:"100%"}}>
                <Av name={pl.name} sz={28}/>
                <div style={{flex:1}}>
                  <div style={{fontWeight:700,fontSize:13,color:"#0f172a"}}>{pl.name}</div>
                  <div style={{fontSize:11,color:"#64748b"}}>Jg. {pl.by} . {pl.gender==="w"?"W":"M"}</div>
                </div>
                <span style={{fontSize:16,color}}>?</span>
              </button>
            ))}
            {available.length===0&&<p style={{fontSize:12,color:"#94a3b8",textAlign:"center",padding:"8px"}}>Niemanden gefunden</p>}
          </div>
        </div>
      )}
    </div>
  );
}

function PlayerProfile({ player,teams,allEvents,allPlayers,cid,onSave,onClose,t,allSeasons,allPlayerProfiles,trainers }) {
  const samePlayerHistory = (allPlayerProfiles||[]).filter(p=>
    p.id!==player.id && p.name===player.name && p.by===player.by && p.seasonId
  ).sort((a,b)=>(b.seasonId||"").localeCompare(a.seasonId||""));
  const myTrainers = (trainers||[]).filter(tr=>(tr.tids||[]).includes(player.mainTid));

  const [p,setP] = useState({...player});
  const up = f => setP(prev => ({...prev,...f}));
  const allTeams  = teams.filter(tm => tm.cid === cid);
  const eligCats  = eligibleCats(p.by||2014,p.gender||"m");

  const toggleOptTid = tid => up({optTids:(p.optTids||[]).includes(tid)?(p.optTids||[]).filter(x=>x!==tid):[...(p.optTids||[]),tid]});

  const allTids = [p.mainTid,...(p.optTids||[])].filter(Boolean).filter(x=>!x.hidden);
  const rawStats = playerStats(p.name,allTids,allEvents||[]);
  const statsRows = allTeams.filter(tm => allTids.includes(tm.id)).map(tm => ({
    tm,s: rawStats[tm.id]||{training:0,games:0}
  }));
  const totalGames    = statsRows.reduce((s,r)=>s+r.s.games,0);
  const totalTraining = statsRows.reduce((s,r)=>s+r.s.training,0);

  return (
    <div style={{position:"fixed",inset:0,overflowY:"auto",WebkitOverflowScrolling:"touch",background:"rgba(0,0,0,.6)",zIndex:900,display:"flex",alignItems:"flex-end",justifyContent:"center",backdropFilter:"blur(8px)"}}>
      <div style={{background:"#fff",borderRadius:"22px 22px 0 0",width:"100%",maxWidth:520,maxHeight:"95dvh",overflowY:"auto",animation:"down .26s cubic-bezier(.16,1,.3,1)"}}>
        <div style={{display:"flex",justifyContent:"center",padding:"12px 0 4px"}}>
          <div style={{width:44,height:4,borderRadius:99,background:"#e2e8f0"}}/>
        </div>

        {}
        <div style={{background:`linear-gradient(135deg,${t.s},${t.p}bb)`,padding:"14px 20px 18px"}}>
          <div style={{display:"flex",alignItems:"center",gap:12}}>
            <Av name={p.name||"?"} sz={52}/>
            <div style={{flex:1}}>
              <div style={{color:"#fff",fontWeight:900,fontSize:19}}>{p.name||"Neuer Spieler"}</div>
              <div style={{color:"rgba(255,255,255,.6)",fontSize:13,marginTop:2}}>
                {p.by&&`Jg. ${p.by}`}{p.position&&` . ${p.position}`}
                {p.name && totalGames > 0 && ` . * ${totalGames} Spiele`}
              </div>
            </div>
            <button onClick={onClose} style={{width:36,height:36,borderRadius:11,background:"rgba(255,255,255,.15)",border:"none",color:"rgba(255,255,255,.8)",fontSize:18,cursor:"pointer"}}></button>
          </div>
        </div>

        <div style={{padding:"18px 20px 48px",display:"flex",flexDirection:"column",gap:16}}>

          {}
          <Section title="* Stammdaten">
            <Inp label="Name" val={p.name} set={v=>up({name:v})} ph="Vorname Nachname" cl={{pri:t.p}}/>
            <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10}}>
              <Inp label="Geburtsjahr" val={String(p.by||"")} set={v=>up({by:parseInt(v)||p.by})} type="number" ph="z.B. 2014" cl={{pri:t.p}}/>
              <Sel label="Geschlecht" val={p.gender||"m"} set={v=>up({gender:v})} opts={[["m","* Maennlich"],["w","* Weiblich"]]}/>
            </div>
            {p.by && (
              <div style={{background:"#f0fdf4",borderRadius:10,padding:"9px 13px",fontSize:12,color:"#15803d",fontWeight:600}}>
                 Passt altersmaessig in: {eligibleCats(p.by,p.gender||"m").join(",")||"Keine Kategorie"}
                {p.gender==="w"&&<span style={{color:"#d97706",marginLeft:5}}>. Mädchen +2 Jahre beruecksichtigt</span>}
              </div>
            )}
          </Section>

          {}
          <Section title="* Mannschaften">
            <Sel label="Hauptmannschaft" val={p.mainTid||""} set={v=>up({mainTid:v})}
              opts={[["","- keine -"],...allTeams.map(tm=>[tm.id,tm.icon+" "+tm.name])]}/>
            <div>
              <div style={{fontSize:11,fontWeight:800,color:"#64748b",marginBottom:8,letterSpacing:.5}}>OPTIONAL AUCH EINSETZBAR IN</div>
              <div style={{display:"flex",flexDirection:"column",gap:5}}>
                {allTeams.filter(tm=>tm.id!==p.mainTid).map(tm=>{
                  const sel = (p.optTids||[]).includes(tm.id);
                  const fits = eligCats.includes(tm.cat);
                  const tmStats = rawStats[tm.id];
                  return (
                    <label key={tm.id} style={{display:"flex",alignItems:"center",gap:10,padding:"9px 12px",borderRadius:12,border:`1.5px solid ${sel?"#16a34a":"#e2e8f0"}`,background:sel?"#f0fdf4":"#fafafa",cursor:fits?"pointer":"not-allowed",opacity:fits?1:.45}}>
                      <input type="checkbox" checked={sel} onChange={()=>fits&&toggleOptTid(tm.id)} style={{width:17,height:17,accentColor:"#16a34a"}}/>
                      <span style={{fontSize:17}}>{tm.icon}</span>
                      <div style={{flex:1}}>
                        <div style={{fontWeight:700,fontSize:14}}>{tm.name}</div>
                        <div style={{fontSize:11,color:"#64748b"}}>{tm.cat}{!fits?" . Jahrgang passt nicht":""}</div>
                      </div>
                      {sel && tmStats && (tmStats.games > 0 || tmStats.training > 0) && (
                        <div style={{fontSize:11,color:"#16a34a",fontWeight:700}}>
                          {tmStats.games > 0 && `*${tmStats.games} `}{tmStats.training > 0 && `*${tmStats.training}`}
                        </div>
                      )}
                      {sel && <Tag c="#16a34a" bg="#dcfce7" ch="Optional" sm/>}
                    </label>
                  );
                })}
              </div>
            </div>
          </Section>

          {}
          <Section title="* Spielerprofil (nur Trainer)">
            <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10}}>
              <Sel label="Position" val={p.position||""} set={v=>up({position:v})} opts={[["","- wählen -"],...POSITIONS_LIST.map(x=>[x,x])]}/>
              <Sel label="Starker Fuß" val={p.foot||""} set={v=>up({foot:v})} opts={[["","- wählen -"],...FOOT_LIST.map(x=>[x,x])]}/>
            </div>
            <div>
              <div style={{fontSize:11,fontWeight:800,color:"#64748b",marginBottom:8,letterSpacing:.5}}>STAeRKEN</div>
              <StrengthsInput
                strengths={p.strengths||[]}
                customStrengths={p.customStrengths||[]}
                onChange={(s,cs)=>up({strengths:s,customStrengths:cs})}
                tp={t.p}/>
            </div>
            <div>
              <div style={{fontSize:11,fontWeight:800,color:"#64748b",marginBottom:8,letterSpacing:.5}}>BEWERTUNG</div>
              <div style={{display:"flex",gap:4}}>
                {[1,2,3,4,5].map(n=>(
                  <button key={n} onClick={()=>up({rating:p.rating===n?0:n})}
                    style={{fontSize:28,background:"none",border:"none",cursor:"pointer",opacity:n<=(p.rating||0)?1:.2,transition:"opacity .14s"}}></button>
                ))}
                {(p.rating||0) > 0 && <span style={{fontSize:13,color:"#64748b",alignSelf:"center",marginLeft:4,fontWeight:600}}>{p.rating}/5</span>}
              </div>
            </div>
          </Section>

          {}
          <Section title="* Statistiken">
            <div style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:9,marginBottom:12}}>
              {[["goals","G","Tore"],["assists","V","Vorlagen"],["yellowCards","Ge","Gelb"],["redCards","Ro","Rot"]].map(([k,ic,l])=>(
                <div key={k}>
                  <div style={{fontSize:10,fontWeight:800,color:"#64748b",marginBottom:6,textAlign:"center"}}>{ic} {l}</div>
                  <div style={{display:"flex",alignItems:"center",gap:4,justifyContent:"center"}}>
                    <button onClick={()=>up({[k]:Math.max(0,(p[k]||0)-1)})} style={{width:26,height:26,borderRadius:7,border:"1.5px solid #e2e8f0",background:"#f8fafc",cursor:"pointer",fontWeight:800}}>?</button>
                    <span style={{fontWeight:900,fontSize:18,minWidth:24,textAlign:"center"}}>{p[k]||0}</span>
                    <button onClick={()=>up({[k]:(p[k]||0)+1})} style={{width:26,height:26,borderRadius:7,border:"1.5px solid #e2e8f0",background:"#f8fafc",cursor:"pointer",fontWeight:800}}>+</button>
                  </div>
                </div>
              ))}
            </div>

            {}
            {p.name && statsRows.length > 0 && (
              <div>
                <div style={{fontSize:11,fontWeight:800,color:"#64748b",marginBottom:8,letterSpacing:.5}}>ANWESENHEIT PRO MANNSCHAFT</div>
                <div style={{display:"flex",flexDirection:"column",gap:6}}>
                  {statsRows.map(({tm,s})=>(
                    <div key={tm.id} style={{display:"flex",alignItems:"center",gap:10,background:"#f8fafc",borderRadius:10,padding:"9px 12px",border:"1px solid #e2e8f0"}}>
                      <span style={{fontSize:16}}>{tm.icon}</span>
                      <div style={{flex:1}}>
                        <div style={{fontWeight:700,fontSize:13}}>{tm.name}</div>
                        <div style={{fontSize:11,color:"#64748b"}}>{tm.id===p.mainTid?"Hauptmannschaft":"Aushilfe"}</div>
                      </div>
                      <div style={{display:"flex",gap:8}}>
                        <div style={{textAlign:"center"}}>
                          <div style={{fontWeight:900,fontSize:16,color:"#16a34a"}}>{s.games}</div>
                          <div style={{fontSize:9,color:"#64748b",fontWeight:600}}>SPIELE</div>
                        </div>
                        <div style={{width:1,background:"#e2e8f0"}}/>
                        <div style={{textAlign:"center"}}>
                          <div style={{fontWeight:900,fontSize:16,color:"#2563eb"}}>{s.training}</div>
                          <div style={{fontSize:9,color:"#64748b",fontWeight:600}}>TRAINING</div>
                        </div>
                      </div>
                    </div>
                  ))}
                  {(totalGames > 0 || totalTraining > 0) && (
                    <div style={{background:"#0f172a",borderRadius:10,padding:"9px 14px",display:"flex",justifyContent:"space-between",alignItems:"center"}}>
                      <span style={{color:"rgba(255,255,255,.6)",fontSize:12,fontWeight:700}}>GESAMT (alle Teams)</span>
                      <div style={{display:"flex",gap:14}}>
                        <div style={{textAlign:"center"}}><div style={{fontWeight:900,fontSize:18,color:"#86efac"}}>{totalGames}</div><div style={{fontSize:9,color:"rgba(255,255,255,.4)"}}>SPIELE</div></div>
                        <div style={{textAlign:"center"}}><div style={{fontWeight:900,fontSize:18,color:"#93c5fd"}}>{totalTraining}</div><div style={{fontSize:9,color:"rgba(255,255,255,.4)"}}>TRAINING</div></div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}
          </Section>

          {}
          <Section title="* Trikot">
            <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10}}>
              <div>
                <div style={{fontSize:11,fontWeight:800,color:"#64748b",marginBottom:6,letterSpacing:.5}}>NUMMER</div>
                <input value={p.jerseyNr||""} onChange={e=>up({jerseyNr:e.target.value})} placeholder="z.B. 9"
                  style={{width:"100%",padding:"11px 13px",fontSize:18,fontWeight:900,border:"1.5px solid #e2e8f0",borderRadius:11,outline:"none",textAlign:"center",color:"#0f172a"}}/>
              </div>
              <div>
                <div style={{fontSize:11,fontWeight:800,color:"#64748b",marginBottom:6,letterSpacing:.5}}>GROeSSE</div>
                <select value={p.jerseySize||""} onChange={e=>up({jerseySize:e.target.value})}
                  style={{width:"100%",padding:"11px 13px",fontSize:15,border:"1.5px solid #e2e8f0",borderRadius:11,outline:"none",background:"#fff",fontFamily:"inherit"}}>
                  <option value="">- wählen -</option>
                  {JERSEY_SIZES.map(s=><option key={s} value={s}>{s}</option>)}
                </select>
              </div>
            </div>
            <div>
              <div style={{fontSize:11,fontWeight:800,color:"#64748b",marginBottom:8,letterSpacing:.5}}>TRIKOT STATUS</div>
              <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:7}}>
                {JERSEY_STATUS.map(s=>(
                  <button key={s.id} onClick={()=>up({jerseyStatus:s.id})}
                    style={{display:"flex",alignItems:"center",gap:8,padding:"10px 12px",borderRadius:11,border:`2px solid ${(p.jerseyStatus||"none")===s.id?s.col:"#e2e8f0"}`,background:(p.jerseyStatus||"none")===s.id?s.bg:"#fff",cursor:"pointer",fontFamily:"inherit",transition:"all .14s"}}>
                    <span style={{fontSize:18}}>{s.icon}</span>
                    <div style={{textAlign:"left"}}>
                      <div style={{fontSize:12,fontWeight:700,color:(p.jerseyStatus||"none")===s.id?s.col:"#334155"}}>{s.label}</div>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          </Section>

          {}
          <Section title="* Trainer-Notizen (intern)">
            {}
            <div>
              <div style={{fontSize:11,fontWeight:800,color:"#64748b",marginBottom:6,letterSpacing:.5}}>LETZTE SAISON GESPIELT IN</div>
              <input value={p.lastTeam||""} onChange={e=>up({lastTeam:e.target.value})}
                placeholder="z.B. F3 25/26 oder G-Jugend"
                style={{width:"100%",padding:"10px 13px",fontSize:14,border:"1.5px solid #e2e8f0",borderRadius:11,outline:"none"}}/>
            </div>

            {}
            <div>
              <div style={{fontSize:11,fontWeight:800,color:"#64748b",marginBottom:6,letterSpacing:.5}}>EMPFEHLUNG NAeCHSTE SAISON</div>
              {}
              {p.lastTeamId&&(()=>{
                const lastIdx=TEAM_HIERARCHY.indexOf(p.lastTeamId);
                const curIdx=TEAM_HIERARCHY.indexOf(p.mainTid);
                const hint = lastIdx<0 ? null :
                  curIdx>lastIdx ? "* Aufstieg gegenüber letzter Saison" :
                  curIdx===lastIdx ? "?* Gleiches Niveau wie letzte Saison" :
                  "?* Abstieg gegenüber letzter Saison - nur in Einzelfaellen";
                const hintCol = curIdx>lastIdx?"#16a34a":curIdx===lastIdx?"#2563eb":"#dc2626";
                return hint ? <div style={{background:hintCol+"10",borderRadius:9,padding:"7px 11px",fontSize:12,fontWeight:600,color:hintCol,marginBottom:8,border:`1px solid ${hintCol}25`}}>{hint}</div> : null;
              })()}
              <div style={{display:"flex",flexDirection:"column",gap:6}}>
                {RECOMMEND_LIST.map(rec=>{
                  const {col,bg,icon}=getRecommendColor(rec);
                  const isDowngrade=rec==="Absteigen";
                  return (
                    <button key={rec} onClick={()=>up({recommend:rec})}
                      style={{display:"flex",alignItems:"center",gap:10,padding:"10px 13px",borderRadius:11,border:`2px solid ${(p.recommend||""===rec)?col:"#e2e8f0"}`,background:(p.recommend||""===rec)?bg:"#fafafa",cursor:"pointer",fontFamily:"inherit",transition:"all .14s",opacity:isDowngrade?.75:1}}>
                      <span style={{fontSize:20}}>{icon}</span>
                      <div style={{flex:1,textAlign:"left"}}>
                        <div style={{fontWeight:700,fontSize:14,color:(p.recommend===rec)?col:"#334155"}}>{rec}</div>
                        {isDowngrade&&<div style={{fontSize:11,color:"#dc2626",marginTop:1}}> Nur in begruendeten Einzelfaellen</div>}
                      </div>
                      {p.recommend===rec&&<span style={{fontSize:16}}></span>}
                    </button>
                  );
                })}
              </div>
            </div>

            <div>
              <div style={{fontSize:11,fontWeight:800,color:"#64748b",marginBottom:6,letterSpacing:.5}}>NOTIZEN</div>
              <textarea value={p.notes||""} onChange={e=>up({notes:e.target.value})} rows={4}
                placeholder="z.B. Entwicklung,Verhalten,Stärken,Schwaechen..."
                style={{width:"100%",padding:"12px 14px",fontSize:14,border:"1.5px solid #e2e8f0",borderRadius:12,outline:"none",resize:"vertical",fontFamily:"inherit",lineHeight:1.5}}/>
            </div>
          </Section>

          {}
          <Section title="* Freundschaften & Zusammenspiel">
            <FriendsInput
              label="* Ist befreundet mit"
              sub="Wenn möglich im selben Team"
              ids={p.friends||[]}
              allPlayers={allPlayers}
              current={player}
              onChange={ids=>up({friends:ids})}
              color="#2563eb"
            />
            <FriendsInput
              label="** Muss zwingend zusammenspielen"
              sub="Eltern-Wunsch / besondere Situation"
              ids={p.mustWith||[]}
              allPlayers={allPlayers}
              current={player}
              onChange={ids=>up({mustWith:ids})}
              color="#dc2626"
            />
          </Section>

          <button onClick={()=>onSave(p)}
            style={{width:"100%",padding:"14px",borderRadius:15,border:"none",background:t.p,color:contrast(t.p),fontWeight:800,fontSize:16,cursor:"pointer",fontFamily:"inherit",boxShadow:`0 4px 18px ${t.p}44`}}>
             Spielerprofil speichern
          </button>
        </div>
      </div>
    </div>
  );
}

function PlayerCard({ player: pl,onEdit,onDel,isMain,allTeams,allEvents }) {
  const [exp,setExp] = useState(false);
  const allTids = [pl.mainTid,...(pl.optTids||[])].filter(Boolean).filter(x=>!x.hidden);
  const rawStats = playerStats(pl.name,allTids,allEvents||[]);
  const totalGames    = Object.values(rawStats).reduce((s,r)=>s+r.games,0);
  const totalTraining = Object.values(rawStats).reduce((s,r)=>s+r.training,0);

  return (
    <div style={{background:"#fff",borderRadius:14,border:`1.5px solid ${isMain?"#e2e8f0":"#fde68a"}`,overflow:"hidden"}}>
      <div style={{padding:"11px 14px",display:"flex",alignItems:"center",gap:11,cursor:"pointer"}} onClick={()=>setExp(s=>!s)}>
        <Av name={pl.name} sz={40}/>
        <div style={{flex:1,minWidth:0}}>
          <div style={{fontWeight:800,fontSize:15,color:"#0f172a",display:"flex",alignItems:"center",gap:7}}>
            {pl.jerseyNr&&<span style={{background:"#0f172a",color:"#fff",borderRadius:7,padding:"2px 7px",fontSize:13,fontWeight:900}}>#{pl.jerseyNr}</span>}
            {pl.name}
          </div>
          <div style={{fontSize:12,color:"#64748b",marginTop:2,display:"flex",gap:6,flexWrap:"wrap"}}>
            {pl.by && <span>Jg. {pl.by}</span>}
            <span>{pl.gender==="w"?"W":"M"}</span>
            {pl.position && <span>. {pl.position}</span>}
            {!isMain && <Tag c="#d97706" bg="#fef3c7" ch="Aushilfe" sm/>}
          </div>
        </div>
        <div style={{display:"flex",gap:5,flexShrink:0,alignItems:"center"}}>
          {totalGames > 0 && <Tag c="#16a34a" bg="#dcfce7" ch={`*${totalGames}`} sm/>}
          {(pl.rating||0) > 0 && <span style={{fontSize:14}}>{pl.rating ? pl.rating+"/5" : "-"}</span>}
        </div>
        <div style={{display:"flex",gap:5,flexShrink:0}}>
          <button onClick={e=>{e.stopPropagation();onEdit();}} style={{width:30,height:30,borderRadius:9,background:"#eff6ff",border:"none",color:"#2563eb",cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center",fontSize:13}}></button>
          {onDel&&<button onClick={e=>{e.stopPropagation();onDel();}} style={{width:30,height:30,borderRadius:9,background:"#fee2e2",border:"none",color:"#dc2626",cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center",fontSize:13}}></button>}
        </div>
      </div>
      {exp && (
        <div style={{padding:"0 14px 12px",borderTop:"1px solid #f1f5f9"}}>
          {}
          {((pl.strengths||[]).length > 0 || (pl.customStrengths||[]).length > 0) && (
            <div style={{display:"flex",flexWrap:"wrap",gap:5,marginTop:9}}>
              {(pl.strengths||[]).map(s=><Tag key={s} c="#2563eb" bg="#eff6ff" ch={s} sm/>)}
              {(pl.customStrengths||[]).map(s=><Tag key={s} c={`#d97706`} bg="#fef3c7" ch={`${s}`} sm/>)}
            </div>
          )}
          {pl.recommend && (
            <div style={{marginTop:7}}>
              {(()=>{const {col,bg,icon}=getRecommendColor(pl.recommend);return(
                <span style={{display:"inline-flex",alignItems:"center",gap:5,fontSize:12,fontWeight:700,color:col,background:bg,borderRadius:7,padding:"3px 9px"}}>{icon} {pl.recommend}</span>
              );})()}
            </div>
          )}
          {pl.lastTeam&&pl.lastTeam!=="-"&&(
            <div style={{marginTop:6,fontSize:12,color:"#64748b",fontWeight:600}}>
               Letzte Saison: <span style={{color:"#334155"}}>{pl.lastTeam}</span>
            </div>
          )}
          {}
          {Object.keys(rawStats).length > 0 && (
            <div style={{marginTop:10,display:"flex",flexDirection:"column",gap:5}}>
              {allTeams.filter(tm=>allTids.includes(tm.id)).map(tm=>{
                const s=rawStats[tm.id]||{training:0,games:0};
                if(!s.training && !s.games) return null;
                return (
                  <div key={tm.id} style={{display:"flex",alignItems:"center",gap:8,background:"#f8fafc",borderRadius:9,padding:"6px 10px"}}>
                    <span style={{fontSize:14}}>{tm.icon}</span>
                    <span style={{fontSize:12,fontWeight:600,flex:1,color:"#334155"}}>{tm.name}{tm.id!==pl.mainTid?" (Aushilfe)":""}</span>
                    {s.games>0&&<Tag c="#16a34a" bg="#dcfce7" ch={`* ${s.games}`} sm/>}
                    {s.training>0&&<Tag c="#2563eb" bg="#eff6ff" ch={`* ${s.training}`} sm/>}
                  </div>
                );
              })}
            </div>
          )}
          {pl.notes && <p style={{fontSize:13,color:"#475569",marginTop:10,lineHeight:1.5,background:"#f8fafc",borderRadius:10,padding:"9px 12px"}}>{pl.notes}</p>}
        </div>
      )}
    </div>
  );
}

function PoolView({ allPlayers,myTeams,allTeams,defaultScopeTids,cid,onAssign,onOptToggle,t }) {
  const [search,setSearch]    = useState("");
  const [filter,setFilter]    = useState("all");
  const [scopeTids,setScopeTids] = useState(defaultScopeTids || myTeams.map(tm=>tm.id));
  const [showScope,setShowScope] = useState(false);

  const scopeTeams = myTeams.filter(tm => scopeTids.includes(tm.id));
  const toggleScope = tid => setScopeTids(prev =>
    prev.includes(tid) ? prev.filter(x=>x!==tid) : [...prev,tid]
  );

  const q = search.toLowerCase();
  const filtered = allPlayers
    .filter(p => p.name.toLowerCase().includes(q))
    .filter(p => {
      if (filter === "all") return true;
      if (filter === "unassigned") return !p.mainTid;
      return p.mainTid === filter;
    })
    .sort((a,b) => (!a.mainTid&&b.mainTid)?-1:(a.mainTid&&!b.mainTid)?1:a.name.localeCompare(b.name));

  const unassigned    = allPlayers.filter(p => !p.mainTid).length;
  const countForTeam  = tid => allPlayers.filter(p => p.mainTid === tid).length;

  return (
    <div>
      {}
      <div style={{background:"#fff",borderRadius:14,border:"1.5px solid #e2e8f0",marginBottom:14,overflow:"hidden"}}>
        <button onClick={()=>setShowScope(s=>!s)}
          style={{width:"100%",padding:"12px 16px",border:"none",background:"none",cursor:"pointer",display:"flex",alignItems:"center",gap:10,fontFamily:"inherit"}}>
          <span style={{fontSize:16}}></span>
          <div style={{flex:1,textAlign:"left"}}>
            <div style={{fontWeight:800,fontSize:14,color:"#0f172a"}}>Zuteilung für</div>
            <div style={{fontSize:12,color:"#64748b",marginTop:1}}>
              {scopeTeams.length===0?"Keine Mannschaft gewählt":scopeTeams.map(tm=>tm.name).join(",")}
            </div>
          </div>
          <div style={{display:"flex",gap:5}}>
            {scopeTeams.map(tm=>(
              <span key={tm.id} style={{fontSize:11,fontWeight:700,color:tm.col,background:tm.col+"15",borderRadius:6,padding:"2px 8px"}}>{tm.name}</span>
            ))}
          </div>
          <span style={{color:"#94a3b8",fontSize:18,transform:showScope?"rotate(180deg)":"none",transition:"transform .2s"}}>?</span>
        </button>
        {showScope&&(
          <div style={{padding:"0 16px 14px",borderTop:"1px solid #f1f5f9"}}>
            <p style={{fontSize:12,color:"#64748b",margin:"10px 0 12px"}}>Welche Mannschaften sollen in der Zuteilung erscheinen?</p>
            {}
            {[...new Set(myTeams.map(tm=>tm.cat||tm.name))].map(cat=>{
              const teamsInCat=myTeams.filter(tm=>(tm.cat||tm.name)===cat);
              const myTidsInCat=teamsInCat.filter(tm=>(defaultScopeTids||[]).includes(tm.id));
              return (
                <div key={cat} style={{marginBottom:12}}>
                  <div style={{fontSize:10,fontWeight:800,color:"#94a3b8",letterSpacing:.5,marginBottom:7}}>{cat.toUpperCase()}</div>
                  <div style={{display:"flex",flexWrap:"wrap",gap:7}}>
                    {teamsInCat.map(tm=>{
                      const on=scopeTids.includes(tm.id);
                      const isMine=(defaultScopeTids||[]).includes(tm.id);
                      return (
                        <button key={tm.id} onClick={()=>toggleScope(tm.id)}
                          style={{display:"flex",alignItems:"center",gap:6,padding:"8px 14px",borderRadius:11,border:`2px solid ${on?tm.col:"#e2e8f0"}`,background:on?tm.col:"#fff",color:on?"#fff":"#475569",fontWeight:700,fontSize:13,cursor:"pointer",fontFamily:"inherit",transition:"all .15s"}}>
                          {on&&<span></span>}
                          {tm.name}
                          {isMine&&<span style={{fontSize:10,fontWeight:800,background:on?"rgba(255,255,255,.25)":"rgba(0,0,0,.08)",borderRadius:4,padding:"1px 5px"}}>{on?"Mein Team":"Mein"}</span>}
                          <span style={{fontSize:11,fontWeight:800,background:on?"rgba(255,255,255,.2)":tm.col+"15",color:on?"#fff":tm.col,borderRadius:5,padding:"1px 6px"}}>
                            {countForTeam(tm.id)}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              );
            })}
            <div style={{display:"flex",gap:8,marginTop:4}}>
              <button onClick={()=>setScopeTids(myTeams.map(tm=>tm.id))}
                style={{padding:"6px 13px",borderRadius:9,border:"1.5px solid #e2e8f0",background:"#fff",color:"#475569",fontWeight:700,fontSize:12,cursor:"pointer",fontFamily:"inherit"}}>
                Alle auswählen
              </button>
              <button onClick={()=>setScopeTids(defaultScopeTids||[])}
                style={{padding:"6px 13px",borderRadius:9,border:"1.5px solid #e2e8f0",background:"#fff",color:t.p,fontWeight:700,fontSize:12,cursor:"pointer",fontFamily:"inherit"}}>
                Nur meine Teams
              </button>
              <button onClick={()=>setScopeTids([])}
                style={{padding:"6px 13px",borderRadius:9,border:"1.5px solid #fecaca",background:"#fff",color:"#dc2626",fontWeight:700,fontSize:12,cursor:"pointer",fontFamily:"inherit"}}>
                Alle abwählen
              </button>
            </div>
          </div>
        )}
      </div>

      {}
      {scopeTeams.length>0&&(
        <div style={{display:"grid",gridTemplateColumns:`repeat(${Math.min(scopeTeams.length+1,4)},1fr)`,gap:8,marginBottom:14}}>
          {scopeTeams.map(tm=>(
            <div key={tm.id} style={{background:tm.col+"12",borderRadius:12,padding:"10px 8px",textAlign:"center",border:`2px solid ${tm.col}30`}}>
              <div style={{fontWeight:900,fontSize:22,color:tm.col,lineHeight:1}}>{countForTeam(tm.id)}</div>
              <div style={{fontSize:11,fontWeight:700,color:tm.col,marginTop:3,opacity:.8}}>{tm.name}</div>
            </div>
          ))}
          <div style={{background:"#fef3c7",borderRadius:12,padding:"10px 8px",textAlign:"center",border:"2px solid #fde68a"}}>
            <div style={{fontWeight:900,fontSize:22,color:"#d97706",lineHeight:1}}>{unassigned}</div>
            <div style={{fontSize:11,fontWeight:700,color:"#d97706",marginTop:3,opacity:.8}}> Offen</div>
          </div>
        </div>
      )}

      {}
      <div style={{overflowX:"auto",display:"flex",gap:6,marginBottom:12,scrollbarWidth:"none"}}>
        {[
          {id:"all",label:`Alle (${allPlayers.length})`},{id:"unassigned",label:`* Offen (${unassigned})`,urgent:unassigned>0},...scopeTeams.map(tm=>({id:tm.id,label:`${tm.name} (${countForTeam(tm.id)})`,col:tm.col}))
        ].map(f=>(
          <button key={f.id} onClick={()=>setFilter(f.id)}
            style={{padding:"7px 13px",borderRadius:99,border:`2px solid ${filter===f.id?(f.col||t.p):"#e2e8f0"}`,background:filter===f.id?(f.col||t.p)+(f.col?"18":""):"#fff",color:filter===f.id?(f.col||t.p):"#475569",fontWeight:700,fontSize:12,cursor:"pointer",whiteSpace:"nowrap",fontFamily:"inherit",flexShrink:0}}>
            {f.label}
          </button>
        ))}
      </div>

      {}
      <div style={{position:"relative",marginBottom:12}}>
        <span style={{position:"absolute",left:12,top:"50%",transform:"translateY(-50%)",fontSize:15,pointerEvents:"none"}}></span>
        <input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Spieler suchen..."
          style={{width:"100%",padding:"10px 13px 10px 38px",fontSize:14,border:"1.5px solid #e2e8f0",borderRadius:12,outline:"none",background:"#fff"}}/>
      </div>

      {}
      {scopeTeams.length===0&&(
        <div style={{textAlign:"center",padding:"28px",background:"#f8fafc",borderRadius:14,border:"1.5px dashed #e2e8f0",color:"#94a3b8"}}>
          <div style={{fontSize:32,marginBottom:8}}></div>
          <p style={{fontWeight:700}}>Keine Mannschaft ausgewählt</p>
          <p style={{fontSize:13,marginTop:4}}>Wähle oben mindestens eine Mannschaft für die Zuteilung</p>
        </div>
      )}

      {}
      {scopeTeams.length>0&&(
        <div style={{display:"flex",flexDirection:"column",gap:8}}>
          {filtered.map(pl=>(
            <PlayerAssignRow key={pl.id} player={pl} teams={scopeTeams} allTeams={allTeams||myTeams} t={t}
              onAssign={tid=>onAssign(pl.id,tid)}
              onOptToggle={(tid,add)=>onOptToggle(pl.id,tid,add)}
            />
          ))}
          {filtered.length===0&&(
            <div style={{textAlign:"center",padding:"28px",color:"#94a3b8"}}>
              <div style={{fontSize:32,marginBottom:8}}></div>
              <p style={{fontWeight:700}}>Keine Spieler gefunden</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function PlayerAssignRow({ player: pl,teams,allTeams,t,onAssign,onOptToggle }) {
  const [showProfile,setShowProfile] = useState(false);
  const mainTeam = allTeams.find(tm => tm.id === pl.mainTid);
  const scopeElig = teams.filter(tm => playerFitsTeam(pl,tm));
  const allElig = allTeams.filter(tm =>
    playerFitsTeam(pl,tm) && tm.id !== pl.mainTid
  );

  return (
    <>
      {}
      {showProfile && (
        <div style={{position:"fixed",inset:0,overflowY:"auto",WebkitOverflowScrolling:"touch",background:"rgba(0,0,0,.6)",zIndex:900,display:"flex",alignItems:"flex-end",justifyContent:"center",backdropFilter:"blur(8px)"}}
          onClick={()=>setShowProfile(false)}>
          <div onClick={e=>e.stopPropagation()}
            style={{background:"#fff",borderRadius:"22px 22px 0 0",width:"100%",maxWidth:520,maxHeight:"88dvh",overflowY:"auto",animation:"down .24s ease"}}>
            <div style={{display:"flex",justifyContent:"center",padding:"12px 0 4px"}}>
              <div style={{width:44,height:4,borderRadius:99,background:"#e2e8f0"}}/>
            </div>

            {}
            <div style={{background:`linear-gradient(135deg,${t.s||t.p},${t.p}bb)`,padding:"16px 20px 20px"}}>
              <div style={{display:"flex",alignItems:"center",gap:14}}>
                <Av name={pl.name} sz={56}/>
                <div style={{flex:1}}>
                  <div style={{color:"#fff",fontWeight:900,fontSize:20}}>{pl.name}</div>
                  <div style={{color:"rgba(255,255,255,.7)",fontSize:13,marginTop:3}}>
                    Jg. {pl.by} . {pl.gender==="w"?"* Mädchen":"* Junge"}
                    {pl.gender==="w"&&<span style={{marginLeft:6,fontSize:11,background:"rgba(255,255,255,.2)",borderRadius:5,padding:"1px 7px"}}>+2J Mädchen-Regel</span>}
                  </div>
                  {pl.position&&<div style={{color:"rgba(255,255,255,.6)",fontSize:12,marginTop:2}}> {pl.position}{pl.foot?` . ${pl.foot}`:""}</div>}
                </div>
                <button onClick={()=>setShowProfile(false)} style={{width:34,height:34,borderRadius:11,background:"rgba(255,255,255,.15)",border:"none",color:"rgba(255,255,255,.8)",fontSize:18,cursor:"pointer"}}></button>
              </div>
              {}
              {(pl.rating||0)>0&&<div style={{marginTop:10,display:"flex",gap:2}}>
                {[1,2,3,4,5].map(n=><span key={n} style={{fontSize:18,opacity:n<=pl.rating?1:.2}}></span>)}
                <span style={{color:"rgba(255,255,255,.6)",fontSize:12,alignSelf:"center",marginLeft:6}}>{pl.rating}/5</span>
              </div>}
            </div>

            <div style={{padding:"18px 20px 40px",display:"flex",flexDirection:"column",gap:14}}>

              {}
              <div style={{background:"#f8fafc",borderRadius:13,padding:"13px 15px",border:"1.5px solid #e2e8f0"}}>
                <div style={{fontSize:11,fontWeight:800,color:"#64748b",marginBottom:9,letterSpacing:.5}}> ALTERSMAeSSIG PASSENDE TEAMS</div>
                <div style={{display:"flex",flexWrap:"wrap",gap:7}}>
                  {allTeams.filter(tm=>playerFitsTeam(pl,tm)).map(tm=>{
                    const ft=playerFitType(pl,tm);
                    const lbl=fitLabel(ft);
                    return (
                      <div key={tm.id} style={{display:"flex",alignItems:"center",gap:5,background:lbl?lbl.bg:tm.col+"15",borderRadius:9,padding:"5px 11px",border:`1.5px solid ${lbl?lbl.col+"40":tm.col+"40"}`}}>
                        <div style={{width:8,height:8,borderRadius:"50%",background:lbl?lbl.col:tm.col}}/>
                        <span style={{fontSize:13,fontWeight:700,color:lbl?lbl.col:tm.col}}>{tm.name}</span>
                        {lbl&&<span style={{fontSize:10,color:lbl.col,fontWeight:800}}>{lbl.text}</span>}
                        {tm.id===pl.mainTid&&<span style={{fontSize:10,color:tm.col,fontWeight:800}}>(Haupt)</span>}
                      </div>
                    );
                  })}
                  {allTeams.filter(tm=>playerFitsTeam(pl,tm)).length===0&&(
                    <span style={{fontSize:13,color:"#94a3b8"}}>Kein passendes Team gefunden</span>
                  )}
                </div>
                {}
                {allTeams.filter(tm=>playerFitType(pl,tm)==="pullup"||playerFitType(pl,tm)==="girlpullup").length>0&&(
                  <div style={{marginTop:10,background:"#fffbeb",borderRadius:9,padding:"9px 12px",border:"1px solid #fde68a",fontSize:12,color:"#92400e",lineHeight:1.6}}>
                     <strong>Hochholen möglich:</strong> Jungen max. 2 Kategorien . Mädchen max. 4 Kategorien über dem normalen Altersband
                  </div>
                )}
              </div>

              {}
              {((pl.strengths||[]).length>0||(pl.customStrengths||[]).length>0)&&(
                <div>
                  <div style={{fontSize:11,fontWeight:800,color:"#64748b",marginBottom:8,letterSpacing:.5}}> STAeRKEN</div>
                  <div style={{display:"flex",flexWrap:"wrap",gap:6}}>
                    {(pl.strengths||[]).map(s=>(
                      <span key={s} style={{fontSize:12,fontWeight:700,color:"#2563eb",background:"#eff6ff",borderRadius:7,padding:"4px 10px",border:"1px solid #bfdbfe"}}>{s}</span>
                    ))}
                    {(pl.customStrengths||[]).map(s=>(
                      <span key={s} style={{fontSize:12,fontWeight:700,color:"#d97706",background:"#fef3c7",borderRadius:7,padding:"4px 10px",border:"1px solid #fde68a"}}> {s}</span>
                    ))}
                  </div>
                </div>
              )}

              {}
              {((pl.goals||0)+(pl.assists||0)+(pl.yellowCards||0)+(pl.redCards||0))>0&&(
                <div style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:9}}>
                  {[["*",pl.goals||0,"Tore"],["*",pl.assists||0,"Vorlagen"],["*",pl.yellowCards||0,"Gelb"],["*",pl.redCards||0,"Rot"]].map(([ic,v,l])=>(
                    <div key={l} style={{background:"#f8fafc",borderRadius:11,padding:"10px 5px",textAlign:"center",border:"1px solid #e2e8f0"}}>
                      <div style={{fontSize:18}}>{ic}</div>
                      <div style={{fontWeight:900,fontSize:18,color:"#334155"}}>{v}</div>
                      <div style={{fontSize:10,color:"#94a3b8",fontWeight:600}}>{l}</div>
                    </div>
                  ))}
                </div>
              )}

              {}
              {pl.notes&&(
                <div style={{background:"#fffbeb",borderRadius:12,padding:"12px 14px",border:"1.5px solid #fde68a"}}>
                  <div style={{fontSize:11,fontWeight:800,color:"#92400e",marginBottom:6,letterSpacing:.5}}> TRAINER-NOTIZEN</div>
                  <p style={{fontSize:13,color:"#92400e",lineHeight:1.6,margin:0}}>{pl.notes}</p>
                </div>
              )}

              {pl.recommend&&(
                <div style={{display:"flex",alignItems:"center",gap:10,background:getRecommendColor(pl.recommend).bg,borderRadius:12,padding:"12px 14px",border:`1.5px solid ${getRecommendColor(pl.recommend).col}30`}}>
                  <span style={{fontSize:22}}>{getRecommendColor(pl.recommend).icon}</span>
                  <div>
                    <div style={{fontSize:11,fontWeight:800,color:"#64748b"}}>EMPFEHLUNG NAeCHSTE SAISON</div>
                    <div style={{fontWeight:800,fontSize:15,color:"#0f172a",marginTop:2}}>{pl.recommend}</div>
                    {pl.lastTeam&&pl.lastTeam!=="-"&&<div style={{fontSize:11,color:"#64748b",marginTop:2}}> Letzte Saison: {pl.lastTeam}</div>}
                  </div>
                </div>
              )}

              {}
              <div style={{borderTop:"1px solid #f1f5f9",paddingTop:14}}>
                <div style={{fontSize:11,fontWeight:800,color:"#64748b",marginBottom:9,letterSpacing:.5}}> DIREKT ZUWEISEN</div>
                <div style={{display:"flex",gap:7,flexWrap:"wrap"}}>
                  {mainTeam&&(
                    <button onClick={()=>{onAssign("");setShowProfile(false);}}
                      style={{display:"flex",alignItems:"center",gap:6,padding:"9px 15px",borderRadius:11,border:"none",background:mainTeam.col,color:"#fff",fontWeight:800,fontSize:14,cursor:"pointer",fontFamily:"inherit"}}>
                      {mainTeam.name}  entfernen
                    </button>
                  )}
                  {scopeElig.filter(tm=>tm.id!==pl.mainTid).map(tm=>(
                    <button key={tm.id} onClick={()=>{onAssign(tm.id);setShowProfile(false);}}
                      style={{display:"flex",alignItems:"center",gap:6,padding:"9px 15px",borderRadius:11,border:`2px solid ${tm.col}`,background:tm.col+"12",color:tm.col,fontWeight:700,fontSize:14,cursor:"pointer",fontFamily:"inherit",transition:"all .14s"}}>
                      {"->"} {tm.name}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      <div style={{background:"#fff",borderRadius:14,border:`2px solid ${mainTeam?mainTeam.col+"55":"#fde68a"}`,overflow:"hidden"}}>
      {}
      <div style={{padding:"11px 14px 0",display:"flex",alignItems:"center",gap:10,cursor:"pointer"}}
        onClick={()=>setShowProfile(true)}>
        <Av name={pl.name} sz={38}/>
        <div style={{flex:1}}>
          <div style={{fontWeight:800,fontSize:15,color:"#0f172a",display:"flex",alignItems:"center",gap:6}}>
            {pl.name}
            <span style={{fontSize:11,color:"#94a3b8",fontWeight:500}}>? Profil</span>
          </div>
          <div style={{fontSize:12,color:"#64748b",marginTop:2,display:"flex",gap:7,flexWrap:"wrap"}}>
            <span>Jg. {pl.by}</span>
            <span>{pl.gender==="w"?"* Mädchen":"* Junge"}</span>
            {pl.gender==="w"&&<span style={{color:"#7c3aed",fontSize:11,fontWeight:600}}>+2J</span>}
          </div>
          <div style={{marginTop:3,display:"flex",gap:4,flexWrap:"wrap"}}>
            {allTeams.filter(tm=>playerFitsTeam(pl,tm)).map(tm=>{
              const ft=playerFitType(pl,tm);
              const lbl=fitLabel(ft);
              return (
                <span key={tm.id} style={{fontSize:10,fontWeight:700,color:lbl?lbl.col:tm.col,background:lbl?lbl.bg:tm.col+"15",borderRadius:5,padding:"1px 6px",display:"inline-flex",alignItems:"center",gap:3}}>
                  {lbl&&"*"}{tm.name}
                </span>
              );
            })}
          </div>
        </div>
        {mainTeam
          ? <span style={{fontSize:12,fontWeight:800,color:mainTeam.col,background:mainTeam.col+"15",borderRadius:7,padding:"3px 9px",flexShrink:0,border:`1px solid ${mainTeam.col}30`}}>{mainTeam.name}</span>
          : <span style={{fontSize:11,fontWeight:800,color:"#d97706",background:"#fef3c7",borderRadius:7,padding:"3px 9px",flexShrink:0}}>Offen</span>
        }
      </div>

      {}
      <div style={{padding:"10px 14px 0"}}>
        <div style={{fontSize:10,fontWeight:800,color:"#64748b",letterSpacing:.5,marginBottom:6}}>HAUPTMANNSCHAFT ZUWEISEN</div>
        <div style={{display:"flex",gap:6,flexWrap:"wrap"}}>
          {mainTeam && scopeElig.some(tm=>tm.id===pl.mainTid) && (
            <button onClick={()=>onAssign("")}
              style={{display:"flex",alignItems:"center",gap:6,padding:"8px 14px",borderRadius:10,border:"none",background:mainTeam.col,color:"#fff",fontWeight:800,fontSize:13,cursor:"pointer",fontFamily:"inherit",boxShadow:`0 2px 8px ${mainTeam.col}44`}}>
              {mainTeam.name} 
            </button>
          )}
          {scopeElig.filter(tm=>tm.id!==pl.mainTid).map(tm=>{
            const ft = playerFitType(pl,tm);
            const lbl = fitLabel(ft);
            return (
              <button key={tm.id} onClick={()=>onAssign(tm.id)}
                style={{display:"flex",alignItems:"center",gap:6,padding:"8px 14px",borderRadius:10,border:`2px solid ${lbl?lbl.col+"80":tm.col+"50"}`,background:lbl?lbl.bg:tm.col+"12",color:lbl?lbl.col:tm.col,fontWeight:700,fontSize:13,cursor:"pointer",fontFamily:"inherit",transition:"all .14s"}}>
                {tm.name}
                {lbl&&<span style={{fontSize:10,fontWeight:800,background:lbl.col+"25",borderRadius:5,padding:"1px 6px"}}>{lbl.text}</span>}
              </button>
            );
          })}
          {scopeElig.length===0&&(
            <span style={{fontSize:12,color:"#94a3b8"}}>Kein passendes Team im Filter</span>
          )}
        </div>
      </div>

      {}
      {mainTeam && (
        <div style={{padding:"10px 14px 12px",marginTop:6,borderTop:"1px solid #f1f5f9"}}>
          <div style={{fontSize:10,fontWeight:800,color:"#64748b",letterSpacing:.5,marginBottom:6}}>KANN AUSHELFEN IN</div>
          <div style={{display:"flex",gap:6,flexWrap:"wrap"}}>
            {allElig.map(tm=>{
              const isOpt=(pl.optTids||[]).includes(tm.id);
              return (
                <button key={tm.id} onClick={()=>onOptToggle(tm.id,!isOpt)}
                  style={{display:"flex",alignItems:"center",gap:5,padding:"6px 12px",borderRadius:9,border:`2px solid ${isOpt?tm.col:"#e2e8f0"}`,background:isOpt?tm.col+"15":"#f8fafc",color:isOpt?tm.col:"#94a3b8",fontWeight:700,fontSize:12,cursor:"pointer",fontFamily:"inherit",transition:"all .13s"}}>
                  {isOpt?"* ":""}{tm.name}
                </button>
              );
            })}
            {allElig.length===0&&<span style={{fontSize:12,color:"#94a3b8"}}>Kein weiteres Team verfügbar</span>}
          </div>
        </div>
      )}
    </div>
    </>
  );
}

function PlayersTab({ data,myTids,save,fire,cl }) {
  const [showTeamCard, setShowTeamCard] = React.useState(null); // teamId
  const t        = TH(cl);
  const allTeams   = data.teams;
  const activeSeason = data.activeSeason || "s2526";
  const allPlayers = (data.playerProfiles || []).filter(p => !p.seasonId || p.seasonId === activeSeason);
  const cid        = allTeams.find(tm=>myTids.includes(tm.id))?.cid;
  const clubTeams  = allTeams.filter(tm => tm.cid === cid);
  const myTeams    = clubTeams.filter(tm => myTids.includes(tm.id));
  const hasUnassigned = allPlayers.some(p => !p.mainTid);
  const [view,setView] = useState(hasUnassigned ? "pool" : "list");
  const [selTid,setSelTid]  = useState(myTids[0]||"");
  const [editP,setEditP]   = useState(null);
  const [showNew,setShowNew] = useState(false);
  const [search,setSearch]  = useState("");
  const [showOpt,setShowOpt] = useState(false);

  const savePlayer = p => {
    const exists = allPlayers.find(x=>x.id===p.id);
    const next   = exists ? allPlayers.map(x=>x.id===p.id?p:x) : [...allPlayers,p];
    save({...data,playerProfiles:next});
    setEditP(null); setShowNew(false);
    fire("Spielerprofil gespeichert *");
  };
  const delPlayer = id => { const pl=allPlayers.find(p=>p.id===id); save({...data,playerProfiles:allPlayers.filter(p=>p.id!==id),securityLog:[...(data.securityLog||[]),{id:uid(),cid,type:"dsgvo_delete",ts:new Date().toISOString(),detail:"Spieler "+(pl?.name||id)+" auf Anfrage gelöscht",read:false}]}); fire("Spieler entfernt + DSGVO-Log erstellt"); };

  const assignPlayer = (playerId,toTid) => {
    const next = allPlayers.map(p => p.id===playerId ? {...p,mainTid:toTid} : p);
    save({...data,playerProfiles:next});
    fire(toTid ? "Spieler zugewiesen *" : "Spieler in Pool verschoben");
  };

  const q = search.toLowerCase();
  const mainPlayers = allPlayers.filter(p=>p.mainTid===selTid && p.name.toLowerCase().includes(q)).sort((a,b)=>a.name.localeCompare(b.name));
  const optPlayers  = allPlayers.filter(p=>p.mainTid!==selTid && (p.optTids||[]).includes(selTid) && p.name.toLowerCase().includes(q)).sort((a,b)=>a.name.localeCompare(b.name));
  const selTeam     = allTeams.find(tm=>tm.id===selTid);
  const allEvents   = data.events||[];

  return (
    <div>
      {}
      {hasUnassigned && (
        <div onClick={()=>setView("pool")}
          style={{background:"#fff7ed",border:"2px solid #fed7aa",borderRadius:14,padding:"12px 16px",marginBottom:12,cursor:"pointer",display:"flex",alignItems:"center",gap:10}}>
          <span style={{fontSize:24}}></span>
          <div style={{flex:1}}>
            <div style={{fontWeight:800,fontSize:14,color:"#c2410c"}}>
              {allPlayers.filter(p=>!p.mainTid).length} Spieler noch nicht zugeteilt
            </div>
            <div style={{fontSize:12,color:"#9a3412",marginTop:2}}>
              Eltern können sich erst anmelden wenn alle Spieler zugeteilt sind {"->"} Zuteilung öffnen
            </div>
          </div>
          <span style={{color:"#d97706",fontSize:18}}>{">"}</span>
        </div>
      )}
      {}
      <div style={{display:"flex",gap:8,marginBottom:14}}>
        {[["list","* Kaderliste"],["pool","* Zuteilung"]].map(([v,l])=>(
          <button key={v} onClick={()=>setView(v)}
            style={{flex:1,padding:"10px",borderRadius:12,border:`2px solid ${view===v?t.p:"#e2e8f0"}`,background:view===v?t.p:"#fff",color:view===v?"#fff":"#475569",fontWeight:700,fontSize:13,cursor:"pointer",fontFamily:"inherit",transition:"all .15s"}}>
            {l}
          </button>
        ))}
      </div>

      {}
      {view==="pool" && (
        <PoolView
          allPlayers={allPlayers}
          myTeams={clubTeams}
          defaultScopeTids={myTids}
          allTeams={clubTeams}
          cid={cid}
          onAssign={assignPlayer}
          onOptToggle={(playerId,tid,add) => {
            const next = allPlayers.map(p => {
              if (p.id !== playerId) return p;
              const opts = p.optTids || [];
              return { ...p,optTids: add ? [...opts.filter(x=>x!==tid),tid] : opts.filter(x=>x!==tid) };
            });
            save({ ...data,playerProfiles: next });
          }}
          t={t}
        />
      )}

      {}
      {view==="list" && (
        <>
          {}
          <div style={{overflowX:"auto",display:"flex",gap:7,marginBottom:14,scrollbarWidth:"none"}}>
            {myTeams.map(tm=>(
              <button key={tm.id} onClick={()=>setSelTid(tm.id)}
                style={{display:"flex",alignItems:"center",gap:6,padding:"8px 14px",borderRadius:99,border:`2px solid ${selTid===tm.id?tm.col:"#e2e8f0"}`,background:selTid===tm.id?tm.col+"15":"#fff",color:selTid===tm.id?tm.col:"#475569",fontWeight:700,fontSize:13,cursor:"pointer",whiteSpace:"nowrap",fontFamily:"inherit"}}>
                {tm.icon} {tm.name}
                <span style={{background:selTid===tm.id?tm.col:"#e2e8f0",color:selTid===tm.id?"#fff":"#64748b",borderRadius:99,padding:"1px 7px",fontSize:11,fontWeight:800}}>
                  {allPlayers.filter(p=>p.mainTid===tm.id).length}
                </span>
              </button>
            ))}
          </div>

          {}
          <div style={{display:"flex",gap:8,marginBottom:14}}>
            <div style={{flex:1,position:"relative"}}>
              <span style={{position:"absolute",left:12,top:"50%",transform:"translateY(-50%)",fontSize:15,pointerEvents:"none"}}></span>
              <input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Spieler suchen..."
                style={{width:"100%",padding:"10px 13px 10px 38px",fontSize:14,border:"1.5px solid #e2e8f0",borderRadius:12,outline:"none",background:"#fff"}}/>
            </div>
            <button onClick={()=>{setShowNew(true);setEditP(mkPlayer({mainTid:selTid,by:selTeam?.years?parseInt(selTeam.years.split("/")[0])||2014:2014}));}}
              style={{padding:"0 16px",height:44,borderRadius:12,border:"none",background:t.p,color:contrast(t.p),fontWeight:800,fontSize:14,cursor:"pointer",fontFamily:"inherit",whiteSpace:"nowrap",boxShadow:`0 3px 12px ${t.p}44`}}>
              + Spieler
            </button>
          </div>

          {}
          <div style={{fontSize:11,fontWeight:800,color:"#64748b",marginBottom:8,letterSpacing:.5,display:"flex",justifyContent:"space-between"}}>
            <span>HAUPTKADER ({mainPlayers.length})</span>
            {selTeam&&<span style={{color:"#94a3b8"}}>{selTeam.cat}{selTeam.years?" . Jg. "+selTeam.years:""}</span>}
          </div>

          {mainPlayers.length===0 && (
            <div style={{textAlign:"center",padding:"28px",background:"#f8fafc",borderRadius:16,border:"1.5px dashed #e2e8f0",marginBottom:12}}>
              <div style={{fontSize:36,marginBottom:8}}></div>
              <p style={{fontWeight:700,color:"#334155"}}>Noch keine Spieler im Hauptkader</p>
              <p style={{fontSize:13,color:"#94a3b8",marginTop:4}}>+ Spieler oder wechsle zur Zuteilungs-Ansicht</p>
            </div>
          )}

          <div style={{display:"flex",flexDirection:"column",gap:7,marginBottom:16}}>
            {mainPlayers.map(pl=>(
              <PlayerCard key={pl.id} player={pl} allTeams={allTeams} allEvents={allEvents}
                onEdit={()=>setEditP(pl)} onDel={()=>delPlayer(pl.id)} isMain/>
            ))}
          </div>

          {}
          {optPlayers.length > 0 && (
            <>
              <button onClick={()=>setShowOpt(s=>!s)}
                style={{width:"100%",padding:"10px",borderRadius:12,border:"1.5px solid #fde68a",background:"#fffbeb",color:"#92400e",fontWeight:700,fontSize:13,cursor:"pointer",fontFamily:"inherit",marginBottom:8,display:"flex",alignItems:"center",justifyContent:"center",gap:7}}>
                {showOpt?"?":"?"} AUSHILFE ({optPlayers.length}) - nicht im Hauptkader gezählt
              </button>
              {showOpt && (
                <div style={{display:"flex",flexDirection:"column",gap:7,opacity:.88}}>
                  {optPlayers.map(pl=>(
                    <PlayerCard key={pl.id} player={pl} allTeams={allTeams} allEvents={allEvents}
                      onEdit={()=>setEditP(pl)} onDel={null} isMain={false}/>
                  ))}
                </div>
              )}
            </>
          )}
        </>
      )}

      {}
      {(editP||showNew) && (
        <PlayerProfile
          player={editP||mkPlayer({mainTid:selTid})}
          teams={allTeams}
          allEvents={allEvents}
          allPlayers={allPlayers}
          cid={cid}
          onSave={savePlayer}
          onClose={()=>{setEditP(null);setShowNew(false);}}
          t={t}
        />
      )}
    </div>
  );
}
function BrandingTab({cl,onSave}) {
  const [c,setC]=useState({...cl}); const ref=useRef(null);
  const up=e=>{const f=e.target.files?.[0];if(!f)return;const r=new FileReader();r.onload=ev=>setC(p=>({...p,logo:ev.target.result}));r.readAsDataURL(f);};
  return (
    <div>
      <div style={{background:"#fff",borderRadius:18,padding:"18px",border:"1.5px solid #e2e8f0"}}>
        <h3 style={{fontWeight:900,fontSize:16,color:"#0f172a",marginBottom:16}}> Vereins-Design</h3>
        <div style={{marginBottom:18}}>
          <div style={{fontSize:11,fontWeight:800,color:"#64748b",letterSpacing:.6,textTransform:"uppercase",marginBottom:8}}>Vereinslogo</div>
          <div style={{display:"flex",alignItems:"center",gap:14}}>
            <div style={{width:70,height:70,borderRadius:18,overflow:"hidden",border:"2px solid #e2e8f0",background:"#f8fafc",display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0}}>
              {c.logo?<img src={c.logo} alt="" style={{width:"100%",height:"100%",objectFit:"cover"}}/>:<span style={{fontSize:34}}>{c.em||"*"}</span>}
            </div>
            <div style={{flex:1,display:"flex",flexDirection:"column",gap:7}}>
              <input ref={ref} type="file" accept="image/*" style={{display:"none"}} onChange={up}/>
              <button onClick={()=>ref.current?.click()}
                style={{padding:"9px 16px",borderRadius:10,border:"none",
                  background:"#e2e8f0",fontWeight:700,fontSize:13,
                  cursor:"pointer",fontFamily:"inherit"}}>
                Logo hochladen
              </button>
            </div>
          </div>
        </div>
        <button onClick={()=>onSave(c)}
          style={{width:"100%",padding:"13px",borderRadius:13,border:"none",
            background:cl?.pri||"#16a34a",color:"#fff",fontWeight:800,
            fontSize:14,cursor:"pointer",fontFamily:"inherit",marginTop:8}}>
          Design speichern
        </button>
      </div>
    </div>
  );
}

function TemplateForm({initial,onSave,onCancel,cl,title}) {
  const t=TH(cl);
  const blank={name:"",icon:"L",items:[],_txt:"",_max:""};
  const [f,setF]=useState(initial||blank);
  const u=p=>setF(prev=>({...prev,...p}));
  const txtRef=useRef(null);
  const dragIdx=useRef(null);
  const dragOverIdx=useRef(null);

  const QUICK_EMOJIS=["*","Getraenk","Pizza","Bus","Helfer","Pokal","Fest","Salat","Kuchen","Ball","Ziel","Einkauf"];

  const addItem=()=>{
    if(!f._txt.trim())return;
    u({items:[...f.items,{id:uid(),txt:f._txt.trim(),max:f._max?parseInt(f._max):null}],_txt:"",_max:""});
    setTimeout(()=>txtRef.current?.focus(),40);
  };
  const removeItem=i=>u({items:f.items.filter((_,j)=>j!==i)});
  const onDragStart=i=>{dragIdx.current=i;};
  const onDragEnter=i=>{dragOverIdx.current=i;};
  const onDragEnd=()=>{
    const from=dragIdx.current,to=dragOverIdx.current;
    if(from===null||to===null||from===to){dragIdx.current=null;dragOverIdx.current=null;return;}
    const arr=[...f.items];const[moved]=arr.splice(from,1);arr.splice(to,0,moved);
    u({items:arr});dragIdx.current=null;dragOverIdx.current=null;
  };
  const canSave=f.name.trim()&&f.items.length>0;

  return (
    <div style={{background:"#fff",borderRadius:20,padding:"20px",border:"1.5px solid #e2e8f0"}} className="in">
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:18}}>
        <p style={{fontSize:15,fontWeight:800,color:"#0f172a"}}>{title}</p>
        <Btn sm ch="Abbrechen" onClick={onCancel} v="gst"/>
      </div>

      {}
      <div style={{marginBottom:14}}>
        <div style={{fontSize:11,fontWeight:800,color:"#64748b",letterSpacing:.5,marginBottom:8}}>SYMBOL WAeHLEN</div>
        <div style={{display:"flex",gap:6,flexWrap:"wrap",alignItems:"center"}}>
          {QUICK_EMOJIS.map(em=>(
            <button key={em} onClick={()=>u({icon:em})}
              style={{width:38,height:38,fontSize:20,border:`2px solid ${f.icon===em?t.p:"#e2e8f0"}`,borderRadius:10,background:f.icon===em?t.p+"18":"#f8fafc",cursor:"pointer",transition:"all .15s"}}>
              {em}
            </button>
          ))}
          <input value={f.icon} onChange={e=>u({icon:e.target.value})} maxLength={2}
            style={{width:38,height:38,fontSize:20,textAlign:"center",border:"2px dashed #e2e8f0",borderRadius:10,outline:"none",cursor:"text",background:"#fafafa"}} title="Eigenes Emoji"/>
        </div>
      </div>

      {}
      <div style={{marginBottom:14}}>
        <Inp label="Name der Vorlage" val={f.name} set={v=>u({name:v})} ph="z.B. Verpflegung Heimspiel" cl={cl}/>
      </div>

      {}
      <div style={{marginBottom:16}}>
        <div style={{fontSize:11,fontWeight:800,color:"#64748b",marginBottom:8,letterSpacing:.5}}>AUSWAHLMODUS</div>
        <div style={{display:"flex",gap:8}}>
          {[["single","** Einfachauswahl","Nur eine Option wählbar"],["multi","** Mehrfachauswahl","Mehrere Optionen wählbar"]].map(([k,label,sub])=>(
            <div key={k} onClick={()=>u({selType:k})}
              style={{flex:1,borderRadius:14,border:`2px solid ${(f.selType||"multi")===k?t.p:"#e2e8f0"}`,background:(f.selType||"multi")===k?t.p+"10":"#fff",padding:"12px 10px",cursor:"pointer",textAlign:"center",transition:"all .15s"}}>
              <div style={{fontSize:22,marginBottom:4}}>{label.split(" ")[0]}</div>
              <div style={{fontWeight:800,fontSize:13,color:(f.selType||"multi")===k?t.p:"#334155"}}>{label.split(" ").slice(1).join(" ")}</div>
              <div style={{fontSize:11,color:"#94a3b8",marginTop:2}}>{sub}</div>
            </div>
          ))}
        </div>
      </div>

      {}
      <div style={{marginBottom:16}}>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:10}}>
          <span style={{fontSize:11,fontWeight:800,color:"#64748b",letterSpacing:.5}}>OPTIONEN ({f.items.length})</span>
          {f.items.length>1&&<span style={{fontSize:11,color:"#94a3b8"}}> Drag zum Sortieren</span>}
        </div>
        {f.items.length>0&&(
          <div style={{display:"flex",flexDirection:"column",gap:6,marginBottom:12}}>
            {f.items.map((item,i)=>(
              <ItemRow key={item.id} item={item} idx={i} tp={t.p}
                onDragStart={()=>onDragStart(i)}
                onDragEnter={()=>onDragEnter(i)}
                onDragEnd={onDragEnd}
                onChange={(field,val)=>u({items:f.items.map((x,j)=>j===i?{...x,[field]:val}:x)})}
                onRemove={()=>removeItem(i)}
              />
            ))}
          </div>
        )}

        {}
        <div style={{background:`${t.p}08`,borderRadius:14,padding:"14px",border:`2px dashed ${t.p}35`}}>
          <div style={{fontSize:12,fontWeight:700,color:t.p,marginBottom:10}}> Option hinzufügen</div>
          <div style={{display:"flex",gap:8,marginBottom:10}}>
            <input ref={txtRef} value={f._txt} onChange={e=>u({_txt:e.target.value})}
              onKeyDown={e=>{if(e.key==="Enter"){e.preventDefault();addItem();}}}
              placeholder="Option eingeben,z.B. Waffeln..."
              style={{flex:1,padding:"11px 13px",fontSize:14,border:`2px solid ${f._txt?t.p:"#e2e8f0"}`,borderRadius:11,outline:"none",background:"#fff",transition:"border-color .15s"}}/>
            <button onClick={addItem} disabled={!f._txt.trim()}
              style={{padding:"0 18px",height:44,borderRadius:11,border:"none",background:f._txt.trim()?t.p:"#e2e8f0",color:f._txt.trim()?contrast(t.p):"#94a3b8",fontWeight:700,fontSize:14,cursor:f._txt.trim()?"pointer":"default",transition:"all .18s",whiteSpace:"nowrap",fontFamily:"inherit",flexShrink:0}}>
              + Hinzufügen
            </button>
          </div>
          <div style={{display:"flex",alignItems:"center",gap:8}}>
            <label style={{fontSize:12,color:"#64748b",fontWeight:600,whiteSpace:"nowrap"}}>Maximum (optional):</label>
            <input value={f._max} onChange={e=>u({_max:e.target.value})} type="number" min="1" placeholder="z.B. 2"
              style={{width:70,padding:"8px 10px",fontSize:13,border:"1.5px solid #e2e8f0",borderRadius:9,outline:"none",textAlign:"center"}}/>
            <span style={{fontSize:11,color:"#94a3b8"}}>= max. xx auswählbar</span>
          </div>
          <p style={{fontSize:11,color:"#94a3b8",marginTop:8}}>Tipp: ? Enter = schnell hinzufügen</p>
        </div>
      </div>

      <Btn full ch={`* Vorlage speichern (${f.items.length} Option${f.items.length!==1?"en":""})`}
        onClick={()=>canSave&&onSave(f)} dis={!canSave} cl={cl}/>
      {!canSave&&f.name.trim()&&f.items.length===0&&(
        <p style={{textAlign:"center",fontSize:12,color:"#f59e0b",marginTop:8}}> Mindestens eine Option hinzufügen</p>
      )}
    </div>
  );
}

function ItemRow({item,idx,tp,onDragStart,onDragEnter,onDragEnd,onChange,onRemove}) {
  const [editing,setEditing]=useState(false);
  const [txt,setTxt]=useState(item.txt);
  const [max,setMax]=useState(item.max!=null?String(item.max):"");
  const commit=()=>{if(!txt.trim())return;onChange("txt",txt.trim());onChange("max",max?parseInt(max):null);setEditing(false);};
  if(editing) return (
    <div style={{background:"#fff",borderRadius:12,padding:"10px 12px",border:`2px solid ${tp}`,gap:8,display:"flex",flexDirection:"column"}}>
      <div style={{display:"flex",gap:8}}>
        <input value={txt} onChange={e=>setTxt(e.target.value)} autoFocus
          onKeyDown={e=>{if(e.key==="Enter")commit();if(e.key==="Escape"){setTxt(item.txt);setMax(item.max!=null?String(item.max):"");setEditing(false);}}}
          style={{flex:1,padding:"9px 12px",fontSize:14,border:`1.5px solid ${tp}`,borderRadius:9,outline:"none",fontFamily:"inherit"}}/>
        <div style={{display:"flex",flexDirection:"column",justifyContent:"center"}}>
          <div style={{fontSize:10,fontWeight:700,color:"#64748b",marginBottom:3}}>MAX</div>
          <input value={max} onChange={e=>setMax(e.target.value)} type="number" min="1" placeholder="-"
            style={{width:54,padding:"9px 6px",fontSize:13,border:"1.5px solid #e2e8f0",borderRadius:9,outline:"none",textAlign:"center"}}/>
        </div>
      </div>
      <div style={{display:"flex",gap:7}}>
        <button onClick={commit}
          style={{flex:1,padding:"8px",borderRadius:9,border:"none",background:tp,color:contrast(tp),fontWeight:700,fontSize:13,cursor:"pointer",fontFamily:"inherit"}}>
           Speichern
        </button>
        <button onClick={()=>{setTxt(item.txt);setMax(item.max!=null?String(item.max):"");setEditing(false);}}
          style={{padding:"8px 14px",borderRadius:9,border:"1.5px solid #e2e8f0",background:"#fff",color:"#64748b",fontWeight:600,fontSize:13,cursor:"pointer",fontFamily:"inherit"}}>
          Abbrechen
        </button>
      </div>
    </div>
  );
  return (
    <div draggable onDragStart={onDragStart} onDragEnter={onDragEnter} onDragEnd={onDragEnd} onDragOver={e=>e.preventDefault()}
      style={{display:"flex",alignItems:"center",gap:8,background:"#f8fafc",borderRadius:12,padding:"10px 12px",border:"1.5px solid #e2e8f0",userSelect:"none"}}>
      {}
      <div style={{display:"flex",flexDirection:"column",gap:3,padding:"1px 3px",cursor:"grab",flexShrink:0}}>
        {[0,1,2].map(d=><div key={d} style={{width:16,height:2,borderRadius:99,background:"#cbd5e1"}}/>)}
      </div>
      <span style={{fontSize:12,color:tp,fontWeight:700,flexShrink:0,minWidth:18}}>{idx+1}.</span>
      <span style={{flex:1,fontWeight:600,fontSize:14,color:"#334155"}}>{item.txt}</span>
      {item.max&&<span style={{fontSize:11,fontWeight:700,color:"#d97706",background:"#fef3c7",borderRadius:6,padding:"3px 8px",whiteSpace:"nowrap"}}>max {item.max}x</span>}
      {}
      <button onClick={()=>setEditing(true)}
        style={{width:30,height:30,borderRadius:8,background:"#eff6ff",border:"none",color:"#2563eb",fontSize:13,cursor:"pointer",flexShrink:0,display:"flex",alignItems:"center",justifyContent:"center"}}></button>
      <button onClick={onRemove}
        style={{width:30,height:30,borderRadius:8,background:"#fee2e2",border:"none",color:"#dc2626",fontSize:14,fontWeight:800,cursor:"pointer",flexShrink:0,display:"flex",alignItems:"center",justifyContent:"center"}}></button>
    </div>
  );
}

function TemplatesTab({data,cid,save,fire,cl}) {
  const t=TH(cl);
  const templates=(data.pollTemplates||[]).filter(x=>x.cid===cid);
  const [mode,setMode]=useState(null); // null | "new" | tpl.id (edit)
  const [delId,setDelId]=useState(null);
  const editTpl=templates.find(x=>x.id===mode);

  const doSaveNew=f=>{
    save({...data,pollTemplates:[...(data.pollTemplates||[]),{id:uid(),cid,name:f.name.trim(),icon:f.icon,items:f.items}]});
    setMode(null);fire("Vorlage erstellt *");
  };
  const doUpdate=f=>{
    save({...data,pollTemplates:(data.pollTemplates||[]).map(x=>x.id===mode?{...x,name:f.name.trim(),icon:f.icon,items:f.items}:x)});
    setMode(null);fire("Vorlage gespeichert *");
  };
  const doDel=id=>{
    save({...data,pollTemplates:(data.pollTemplates||[]).filter(x=>x.id!==id)});
    setDelId(null);fire("Vorlage gelöscht");
  };

  return (
    <div>
      {}
      {!mode&&(
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:16}}>
          <div>
            <p style={{fontWeight:800,fontSize:16,color:"#0f172a"}}> Umfrage-Vorlagen</p>
            <p style={{fontSize:12,color:"#64748b",marginTop:2}}>Beim Termin anlegen mit einem Klick laden</p>
          </div>
          <button onClick={()=>setMode("new")} style={{display:"flex",alignItems:"center",gap:7,padding:"10px 18px",borderRadius:12,border:"none",background:t.p,color:contrast(t.p),fontWeight:700,fontSize:14,cursor:"pointer",fontFamily:"inherit",boxShadow:`0 3px 12px ${t.p}55`}}>
            <span style={{fontSize:16}}>+</span> Neue Vorlage
          </button>
        </div>
      )}

      {}
      {mode==="new"&&(
        <TemplateForm title="Neue Vorlage" onSave={doSaveNew} onCancel={()=>setMode(null)} cl={cl}/>
      )}

      {}
      {mode&&mode!=="new"&&editTpl&&(
        <TemplateForm title={`** "${editTpl.name}" bearbeiten`}
          initial={{name:editTpl.name,icon:editTpl.icon,items:[...editTpl.items],_txt:"",_max:""}}
          onSave={doUpdate} onCancel={()=>setMode(null)} cl={cl}/>
      )}

      {}
      {delId&&(
        <div style={{background:"#fff7f7",borderRadius:16,padding:"16px",border:"1.5px solid #fecaca",marginBottom:14}} className="in">
          <p style={{fontWeight:700,fontSize:14,color:"#dc2626",marginBottom:12}}> Vorlage wirklich löschen?</p>
          <div style={{display:"flex",gap:9}}>
            <button onClick={()=>doDel(delId)} style={{flex:1,padding:"11px",borderRadius:12,border:"none",background:"#dc2626",color:"#fff",fontWeight:800,fontSize:14,cursor:"pointer",fontFamily:"inherit"}}>Ja,löschen</button>
            <button onClick={()=>setDelId(null)} style={{flex:1,padding:"11px",borderRadius:12,border:"1.5px solid #e2e8f0",background:"#fff",color:"#475569",fontWeight:700,fontSize:14,cursor:"pointer",fontFamily:"inherit"}}>Abbrechen</button>
          </div>
        </div>
      )}

      {}
      {templates.length===0&&!mode&&(
        <div style={{textAlign:"center",padding:"48px 20px",background:"#f8fafc",borderRadius:20,border:"1.5px dashed #e2e8f0"}}>
          <div style={{fontSize:52,marginBottom:14}}></div>
          <p style={{fontWeight:800,fontSize:17,color:"#334155"}}>Noch keine Vorlagen</p>
          <p style={{color:"#94a3b8",fontSize:13,marginTop:8,lineHeight:1.6}}>Erstelle Vorlagen für häufig genutzte Umfragen.<br/>Beim nächsten Termin laedst du sie mit einem Klick.</p>
          <button onClick={()=>setMode("new")} style={{marginTop:16,padding:"12px 24px",borderRadius:13,border:"none",background:t.p,color:"#fff",fontWeight:800,fontSize:14,cursor:"pointer",fontFamily:"inherit"}}>+ Erste Vorlage erstellen</button>
        </div>
      )}

      {}
      {!mode&&<div style={{display:"flex",flexDirection:"column",gap:10}}>
        {templates.map(tpl=>(
          <div key={tpl.id} style={{background:"#fff",borderRadius:18,border:"1.5px solid #e2e8f0",overflow:"hidden",transition:"box-shadow .18s"}}>
            {}
            <div style={{padding:"14px 16px",display:"flex",alignItems:"center",gap:12}}>
              <div style={{width:48,height:48,borderRadius:14,background:t.p+"18",display:"flex",alignItems:"center",justifyContent:"center",fontSize:24,flexShrink:0}}>{tpl.icon}</div>
              <div style={{flex:1,minWidth:0}}>
                <div style={{fontWeight:800,fontSize:15,color:"#0f172a"}}>{tpl.name}</div>
                <div style={{fontSize:12,color:"#64748b",marginTop:2}}>{tpl.items.length} Option{tpl.items.length!==1?"en":""}</div>
              </div>
              <div style={{display:"flex",gap:7}}>
                <button onClick={()=>setMode(tpl.id)}
                  style={{padding:"7px 13px",borderRadius:10,border:`1.5px solid ${t.p}`,background:t.p+"12",color:t.p,fontWeight:700,fontSize:12,cursor:"pointer",fontFamily:"inherit"}}>
                   Bearbeiten
                </button>
                <button onClick={()=>setDelId(tpl.id)}
                  style={{padding:"7px 11px",borderRadius:10,border:"1.5px solid #fecaca",background:"#fff7f7",color:"#dc2626",fontWeight:700,fontSize:12,cursor:"pointer",fontFamily:"inherit"}}>
                  
                </button>
              </div>
            </div>
            {}
            <div style={{padding:"0 16px 14px",display:"flex",flexWrap:"wrap",gap:6}}>
              {tpl.items.map(item=>(
                <div key={item.id} style={{background:"#f1f5f9",borderRadius:8,padding:"5px 11px",fontSize:12,fontWeight:600,color:"#475569",display:"flex",alignItems:"center",gap:5}}>
                  {item.txt}
                  {item.max&&<span style={{fontSize:10,color:"#94a3b8",fontWeight:700}}>. max {item.max}</span>}
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>}
    </div>
  );
}

function SeriesWizard({f,u,t}) {
  const DAYS=["Mo","Di","Mi","Do","Fr","Sa","So"];
  const mode=f.recMode||"none";
  const toggleDay=d=>{const cur=f.recDays||[];u({recDays:cur.includes(d)?cur.filter(x=>x!==d):[...cur,d].sort()});};
  const previewDates=()=>{
    if(mode!=="weekly"||(f.recDays||[]).length===0||!f.recUntil)return[];
    const res=[];const end=new Date(f.recUntil+"T12:00:00");const cur=new Date((f.recStart||now())+"T12:00:00");
    let safety=0;
    while(cur<=end&&safety++<365){const jsD=cur.getDay();const ourD=jsD===0?6:jsD-1;if((f.recDays||[]).includes(ourD))res.push(cur.toISOString().slice(0,10));cur.setDate(cur.getDate()+1);}
    return res;
  };
  const dates=mode==="custom"?(f.recDates||[]):previewDates();
  const fmtS=iso=>{const d=new Date(iso+"T12:00:00");return`${DAYS[d.getDay()===0?6:d.getDay()-1]} ${String(d.getDate()).padStart(2,"0")}.${String(d.getMonth()+1).padStart(2,"0")}.`;};
  return (
    <div style={{borderRadius:18,border:`2px solid ${mode!=="none"?t.p:"#e2e8f0"}`,background:mode!=="none"?mix(t.p,92):"#fff",overflow:"hidden",transition:"all .2s"}}>
      <div onClick={()=>u({recMode:mode==="none"?"weekly":"none",recDays:[],recUntil:"",recStart:now(),recDates:[]})}
        style={{padding:"14px 16px",cursor:"pointer",display:"flex",alignItems:"center",gap:12}}>
        <div style={{width:46,height:46,borderRadius:14,background:mode!=="none"?t.p+"22":"#f1f5f9",display:"flex",alignItems:"center",justifyContent:"center",fontSize:22,flexShrink:0}}></div>
        <div style={{flex:1}}>
          <div style={{fontWeight:800,fontSize:16,color:mode!=="none"?t.p:"#334155"}}>Serientermine</div>
          <div style={{fontSize:13,color:"#64748b",marginTop:1}}>{mode==="none"?"Einzel-Termin":mode==="weekly"?`Woechentlich . ${dates.length} Termine`:mode==="custom"?`Eigene Daten . ${dates.length} Termine`:""}</div>
        </div>
        <div style={{width:48,height:26,borderRadius:99,background:mode!=="none"?t.p:"#e2e8f0",position:"relative",transition:"background .2s",flexShrink:0}}>
          <div style={{width:20,height:20,borderRadius:"50%",background:"#fff",position:"absolute",top:3,left:mode!=="none"?25:3,transition:"left .2s",boxShadow:"0 1px 4px rgba(0,0,0,.2)"}}/>
        </div>
      </div>
      {mode!=="none"&&<div onClick={e=>e.stopPropagation()} style={{borderTop:`1px solid ${t.p}25`,padding:"16px"}}>
        <div style={{display:"flex",gap:8,marginBottom:16}}>
          {[["weekly","Woechentlich"],["custom","Feste Daten"]].map(([m,l])=>(
            <button key={m} onClick={()=>u({recMode:m,recDays:[],recDates:[]})}
              style={{flex:1,padding:"10px 8px",borderRadius:12,border:`2px solid ${mode===m?t.p:"#e2e8f0"}`,background:mode===m?t.p:"#fff",color:mode===m?"#fff":"#475569",fontWeight:700,fontSize:13,cursor:"pointer",fontFamily:"inherit",transition:"all .15s"}}>
              {l}
            </button>
          ))}
        </div>
        {mode==="weekly"&&<>
          <div style={{marginBottom:14}}>
            <div style={{fontSize:11,fontWeight:800,color:"#64748b",marginBottom:9,letterSpacing:.5}}>WELCHE WOCHENTAGE?</div>
            <div style={{display:"flex",gap:6,flexWrap:"wrap"}}>
              {DAYS.map((d,i)=>{const sel=(f.recDays||[]).includes(i);return(
                <button key={d} onClick={()=>toggleDay(i)}
                  style={{width:44,height:44,borderRadius:12,border:`2px solid ${sel?t.p:"#e2e8f0"}`,background:sel?t.p:"#fff",color:sel?"#fff":"#475569",fontWeight:800,fontSize:13,cursor:"pointer",fontFamily:"inherit",transition:"all .15s"}}>
                  {d}
                </button>
              );})}
            </div>
          </div>
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10,marginBottom:14}}>
            <div>
              <div style={{fontSize:11,fontWeight:800,color:"#64748b",marginBottom:5}}>START</div>
              <input type="date" value={f.recStart||now()} onChange={e=>u({recStart:e.target.value})}
                style={{width:"100%",padding:"11px 12px",fontSize:14,border:"1.5px solid #e2e8f0",borderRadius:11,outline:"none"}}/>
            </div>
            <div>
              <div style={{fontSize:11,fontWeight:800,color:"#64748b",marginBottom:5}}>ENDE</div>
              <input type="date" value={f.recUntil||""} onChange={e=>u({recUntil:e.target.value})}
                style={{width:"100%",padding:"11px 12px",fontSize:14,border:"1.5px solid #e2e8f0",borderRadius:11,outline:"none"}}/>
            </div>
          </div>
          {dates.length>0&&<div style={{background:"#fff",borderRadius:13,padding:"12px 14px",border:`1.5px solid ${t.p}30`}}>
            <div style={{fontSize:12,fontWeight:800,color:t.p,marginBottom:8}}> {dates.length} TERMINE</div>
            <div style={{display:"flex",flexWrap:"wrap",gap:5,maxHeight:90,overflowY:"auto"}}>
              {dates.map(d=><span key={d} style={{fontSize:11,fontWeight:700,background:t.p+"15",color:t.p,borderRadius:6,padding:"3px 8px"}}>{fmtS(d)}</span>)}
            </div>
          </div>}
          {(f.recDays||[]).length===0&&<p style={{fontSize:12,color:"#f59e0b",fontWeight:600,marginTop:8}}> Mindestens einen Wochentag wählen</p>}
          {(f.recDays||[]).length>0&&!f.recUntil&&<p style={{fontSize:12,color:"#f59e0b",fontWeight:600,marginTop:8}}> Enddatum wählen</p>}
        </>}
        {mode==="custom"&&<>
          <div style={{marginBottom:12}}>
            <div style={{fontSize:11,fontWeight:800,color:"#64748b",marginBottom:9,letterSpacing:.5}}>DATUM HINZUFUeGEN</div>
            <div style={{display:"flex",gap:8}}>
              <input type="date" id="custDatePicker"
                style={{flex:1,padding:"11px 12px",fontSize:14,border:"1.5px solid #e2e8f0",borderRadius:11,outline:"none"}}/>
              <button onClick={()=>{const el=document.getElementById("custDatePicker");const v=el?.value;if(!v||(f.recDates||[]).includes(v))return;u({recDates:[...(f.recDates||[]),v].sort()});el.value="";}}
                style={{padding:"0 16px",height:44,borderRadius:11,border:"none",background:t.p,color:contrast(t.p),fontWeight:700,fontSize:14,cursor:"pointer",fontFamily:"inherit",whiteSpace:"nowrap"}}>
                + Hinzufügen
              </button>
            </div>
          </div>
          {(f.recDates||[]).length>0?<>
            <div style={{display:"flex",flexWrap:"wrap",gap:6,marginBottom:10}}>
              {(f.recDates||[]).map(d=>(
                <div key={d} style={{display:"flex",alignItems:"center",gap:5,background:t.p+"15",borderRadius:9,padding:"5px 10px",border:`1px solid ${t.p}30`}}>
                  <span style={{fontSize:12,fontWeight:700,color:t.p}}>{fmtS(d)}</span>
                  <button onClick={()=>u({recDates:(f.recDates||[]).filter(x=>x!==d)})} style={{background:"none",border:"none",color:t.p,cursor:"pointer",fontSize:13,padding:0,opacity:.7}}></button>
                </div>
              ))}
            </div>
            <div style={{background:"#fff",borderRadius:12,padding:"10px 14px",border:`1.5px solid ${t.p}30`,fontSize:12,fontWeight:700,color:t.p}}> {(f.recDates||[]).length} Termine gewählt</div>
          </>:<p style={{fontSize:12,color:"#94a3b8",textAlign:"center",padding:"10px"}}>Noch keine Daten ausgewählt</p>}
        </>}
      </div>}
    </div>
  );
}

function Wizard({teams,cl,onSave,onClose,editEv=null,onTemplates=[],onSaveTemplate=null}) {
  const t=TH(cl); const isEdit=!!editEv; const STEPS=5;
  const blank={tid:teams[0]?.id||"",type:"training",title:"",date:now(),time:"",loc:"",note:"",pt:"att",recMode:"none",recDays:[],recStart:now(),recUntil:"",recDates:[],li:[],fi:[],sc:[],selType:"multi",open:false,_li:{txt:"",max:""},_fi:{name:"",col:"#16a34a"},_sc:{fid:"",time:"",a:"",b:"",ref:""}};
  const [step,setStep]=useState(1);
  const [f,setF]=useState(editEv?{...blank,...editEv,recMode:"none",recDays:[],recDates:[],_li:{txt:"",max:""},_fi:{name:"",col:"#16a34a"},_sc:{fid:"",time:"",a:"",b:"",ref:""}}:blank);
  const u=p=>setF(prev=>({...prev,...p}));
  const ok=()=>{if(step===1)return!!f.tid;if(step===2)return!!f.type;if(step===3)return f.title.trim().length>1;return true;};
  const finish=()=>{
    const{_li,_fi,_sc,recMode,recDays,recStart,recUntil,recDates,...base}=f;
    if(isEdit){onSave([{...base,id:editEv.id}]);return;}
    let eventDates=[];
    if(recMode==="weekly"&&recDays.length&&recUntil){
      const end=new Date(recUntil+"T12:00:00");const cur=new Date((recStart||now())+"T12:00:00");let s=0;
      while(cur<=end&&s++<365){const jd=cur.getDay();const od=jd===0?6:jd-1;if(recDays.includes(od))eventDates.push(cur.toISOString().slice(0,10));cur.setDate(cur.getDate()+1);}
    }else if(recMode==="custom"&&recDates.length){eventDates=recDates;}
    else eventDates=[base.date||now()];
    const sid=eventDates.length>1?uid():null;
    onSave(eventDates.map((date,i)=>({...base,id:uid(),date,votes:{},sid,sidx:i})));
  };
  const SL=["Mannschaft","Art","Details","Umfrage","Abschluss"];
  const teamsSel=teams.find(x=>x.id===f.tid);
  return (
    <div style={{minHeight:"100dvh",background:"#f0f4f8",display:"flex",flexDirection:"column"}}>
      <div style={{background:`linear-gradient(135deg,${t.s},${t.p}aa)`,padding:"16px 18px 20px"}}>
        <div style={{display:"flex",alignItems:"center",gap:11,marginBottom:14}}>
          <button onClick={onClose} style={{width:34,height:34,borderRadius:11,background:"rgba(255,255,255,.15)",border:"none",color:"rgba(255,255,255,.8)",fontSize:18,cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center"}}></button>
          <div style={{flex:1}}><div style={{color:"rgba(255,255,255,.55)",fontSize:11,fontWeight:700}}>SCHRITT {step} / {STEPS} . {SL[step-1].toUpperCase()}</div><div style={{color:"#fff",fontWeight:900,fontSize:18,marginTop:2}}>{isEdit?"Termin bearbeiten":"Neuer Termin"}</div></div>
        </div>
        <div style={{height:4,borderRadius:99,background:"rgba(255,255,255,.2)"}}><div style={{height:"100%",borderRadius:99,background:"rgba(255,255,255,.9)",width:`${(step/STEPS)*100}%`,transition:"width .3s ease"}}/></div>
      </div>
      <div style={{flex:1,overflowY:"auto",padding:"18px 16px"}}>
        {}
        {step===1&&<div className="in" style={{display:"flex",flexDirection:"column",gap:11}}>
          {teams.map(tm=>(
            <div key={tm.id} onClick={()=>u({tid:tm.id})} style={{background:"#fff",borderRadius:17,padding:"15px 16px",border:`2px solid ${f.tid===tm.id?t.p:"#e2e8f0"}`,cursor:"pointer",display:"flex",alignItems:"center",gap:13,transition:"all .18s"}}>
              <div style={{width:50,height:50,borderRadius:16,background:f.tid===tm.id?t.p+"20":"#f8fafc",display:"flex",alignItems:"center",justifyContent:"center",fontSize:26}}>{tm.icon}</div>
              <div style={{flex:1}}><div style={{fontWeight:800,fontSize:16,color:f.tid===tm.id?t.p:"#0f172a"}}>{tm.name}</div>{tm.cat&&<div style={{fontSize:12,color:"#64748b",marginTop:2}}>{tm.cat}</div>}</div>
              <div style={{width:22,height:22,borderRadius:"50%",border:`${f.tid===tm.id?"7px":"2px"} solid ${f.tid===tm.id?t.p:"#cbd5e1"}`,transition:"all .18s"}}/>
            </div>
          ))}
        </div>}
        {}
        {step===2&&<div className="in" style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10}}>
          {Object.entries(ET).map(([k,v])=>(
            <div key={k} onClick={()=>u({type:k,title:isEdit?f.title:v.label})} style={{background:"#fff",borderRadius:16,padding:"16px 14px",border:`2px solid ${f.type===k?t.p:"#e2e8f0"}`,cursor:"pointer",textAlign:"center",transition:"all .18s"}}>
              <div style={{fontSize:32,marginBottom:8}}>{v.icon}</div>
              <div style={{fontWeight:800,fontSize:14,color:f.type===k?t.p:"#334155"}}>{v.label}</div>
            </div>
          ))}
        </div>}
        {}
        {step===3&&<div className="in" style={{display:"flex",flexDirection:"column",gap:13}}>
          <Inp label="Titel" val={f.title} set={v=>u({title:v})} ph={`z.B. ${ET[f.type]?.label}`} af cl={cl}/>
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:11}}>
            <Inp label="Uhrzeit" val={f.time} set={v=>u({time:v})} type="time" ph="09:00" cl={cl}/>
            <Inp label="Ort" val={f.loc} set={v=>u({loc:v})} ph="Sportplatz" cl={cl}/>
          </div>
          <SeriesWizard f={f} u={u} t={t} cl={cl}/>
          {f.recMode==="none"&&<Inp label="Datum" val={f.date} set={v=>u({date:v})} type="date" cl={cl}/>}
          <Inp label="Nachricht an Eltern (optional)" val={f.note} set={v=>u({note:v})} ph="z.B. Bitte 15 Min früher da sein..." rows={2} cl={cl}/>
        </div>}
        {}
        {step===4&&<div className="in" style={{display:"flex",flexDirection:"column",gap:14}}>
          <p style={{fontSize:13,fontWeight:700,color:"#64748b"}}>Welche Abstimmung soll es geben?</p>
          {[{k:"att",icon:"OK",title:"Anwesenheit",sub:"Dabei / Nicht dabei"},{k:"list",icon:"Liste",title:"Auswahlliste",sub:"z.B. Verpflegung,Helfer"},{k:"carpool",icon:"*",title:"Fahrtgemeinschaft",sub:"Wer braucht Mitnahme? Wer kann fahren?"}].map(o=>(
            <div key={o.k} onClick={()=>u({pt:o.k})} style={{background:"#fff",borderRadius:16,padding:"14px 16px",border:`2px solid ${f.pt===o.k?t.p:"#e2e8f0"}`,cursor:"pointer",display:"flex",alignItems:"center",gap:13,transition:"all .18s"}}>
              <div style={{width:46,height:46,borderRadius:14,background:f.pt===o.k?t.p+"20":"#f8fafc",display:"flex",alignItems:"center",justifyContent:"center",fontSize:22,flexShrink:0}}>{o.icon}</div>
              <div style={{flex:1}}><div style={{fontWeight:800,fontSize:15,color:f.pt===o.k?t.p:"#334155"}}>{o.title}</div><div style={{fontSize:12,color:"#64748b",marginTop:2}}>{o.sub}</div></div>
              <div style={{width:22,height:22,borderRadius:"50%",border:`${f.pt===o.k?"7px":"2px"} solid ${f.pt===o.k?t.p:"#cbd5e1"}`,transition:"all .18s"}}/>
            </div>
          ))}
          {f.pt==="list"&&<div>
            {}
            <div style={{display:"flex",gap:8,marginBottom:14}}>
              {[["multi","**","Mehrfachauswahl","Mehrere wählbar"],["single","**","Einfachauswahl","Nur eine wählbar"]].map(([k,em,label,sub])=>(
                <div key={k} onClick={()=>u({selType:k})}
                  style={{flex:1,borderRadius:13,border:`2px solid ${(f.selType||"multi")===k?t.p:"#e2e8f0"}`,background:(f.selType||"multi")===k?t.p+"10":"#fff",padding:"10px 8px",cursor:"pointer",textAlign:"center",transition:"all .15s"}}>
                  <div style={{fontSize:20,marginBottom:2}}>{em}</div>
                  <div style={{fontWeight:800,fontSize:12,color:(f.selType||"multi")===k?t.p:"#334155"}}>{label}</div>
                  <div style={{fontSize:11,color:"#94a3b8",marginTop:1}}>{sub}</div>
                </div>
              ))}
            </div>
            {}
            {onTemplates.length>0&&<div style={{marginBottom:14}}>
              <p style={{fontSize:11,fontWeight:800,color:"#64748b",letterSpacing:.5,marginBottom:8}}> VORLAGE LADEN</p>
              <div style={{display:"flex",gap:7,flexWrap:"wrap"}}>
                {onTemplates.map(tpl=>(
                  <button key={tpl.id} onClick={()=>u({li:tpl.items.map(it=>({...it,id:uid()})),selType:tpl.selType||"multi"})}
                    style={{display:"flex",alignItems:"center",gap:6,padding:"7px 12px",borderRadius:11,border:"1.5px solid #e2e8f0",background:"#f8fafc",cursor:"pointer",fontSize:13,fontWeight:700,color:"#334155",fontFamily:"inherit"}}>
                    <span>{tpl.icon}</span>{tpl.name}
                  </button>
                ))}
              </div>
            </div>}
            {}
            <div style={{display:"flex",flexDirection:"column",gap:6,marginBottom:10}}>
              {(f.li||[]).map((item,i)=>(
                <div key={item.id} style={{display:"flex",alignItems:"center",gap:8,background:"#f8fafc",borderRadius:11,padding:"9px 12px",border:"1.5px solid #e2e8f0"}}>
                  <span style={{fontSize:12,color:t.p,fontWeight:700,minWidth:18}}>{i+1}.</span>
                  <span style={{flex:1,fontWeight:600,fontSize:14,color:"#334155"}}>{item.txt}</span>
                  {item.max&&<Tag c="#d97706" bg="#fef3c7" ch={`max ${item.max}`} sm/>}
                  <button onClick={()=>u({li:f.li.filter((_,j)=>j!==i)})} style={{width:26,height:26,borderRadius:7,background:"#fee2e2",border:"none",color:"#dc2626",cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center",fontSize:13,fontWeight:800}}></button>
                </div>
              ))}
            </div>
            {}
            <div style={{background:t.p+"08",borderRadius:13,padding:"12px",border:`2px dashed ${t.p}35`}}>
              <div style={{display:"flex",gap:8,marginBottom:8}}>
                <input value={f._li.txt} onChange={e=>u({_li:{...f._li,txt:e.target.value}})}
                  onKeyDown={e=>{if(e.key==="Enter"&&f._li.txt.trim()){e.preventDefault();u({li:[...(f.li||[]),{id:uid(),txt:f._li.txt.trim(),max:f._li.max?parseInt(f._li.max):null}],_li:{txt:"",max:""}});}}}
                  placeholder="Option eingeben..."
                  style={{flex:1,padding:"10px 13px",fontSize:14,border:`2px solid ${f._li.txt?t.p:"#e2e8f0"}`,borderRadius:10,outline:"none"}}/>
                <button onClick={()=>{if(!f._li.txt.trim())return;u({li:[...(f.li||[]),{id:uid(),txt:f._li.txt.trim(),max:f._li.max?parseInt(f._li.max):null}],_li:{txt:"",max:""}});}}
                  style={{padding:"0 14px",height:42,borderRadius:10,border:"none",background:f._li.txt.trim()?t.p:"#e2e8f0",color:f._li.txt.trim()?contrast(t.p):"#94a3b8",fontWeight:700,cursor:f._li.txt.trim()?"pointer":"default",fontFamily:"inherit",fontSize:13}}>
                  + Hinzufügen
                </button>
              </div>
              <div style={{display:"flex",alignItems:"center",gap:8}}>
                <label style={{fontSize:12,color:"#64748b",fontWeight:600,whiteSpace:"nowrap"}}>Max (optional):</label>
                <input value={f._li.max} onChange={e=>u({_li:{...f._li,max:e.target.value}})} type="number" min="1" placeholder="z.B. 2"
                  style={{width:60,padding:"7px 10px",fontSize:13,border:"1.5px solid #e2e8f0",borderRadius:9,outline:"none",textAlign:"center"}}/>
              </div>
            </div>
            {onSaveTemplate&&f.li?.length>0&&<button onClick={()=>{const name=prompt("Name der Vorlage?");if(name)onSaveTemplate({id:uid(),name,icon:"Liste",selType:f.selType||"multi",items:f.li});}} style={{marginTop:10,width:"100%",padding:"10px",borderRadius:11,border:`1.5px dashed ${t.p}`,background:"transparent",color:t.p,fontWeight:700,fontSize:13,cursor:"pointer",fontFamily:"inherit"}}> Als Vorlage speichern</button>}
          </div>}
        </div>}
        {}
        {step===5&&<div className="in">
          <div style={{background:"#0f172a",borderRadius:17,padding:"18px"}}>
            <p style={{color:"rgba(255,255,255,.45)",fontSize:11,fontWeight:800,marginBottom:13,letterSpacing:.5}}>ZUSAMMENFASSUNG</p>
            {[[" Mannschaft",teamsSel?.icon+" "+teamsSel?.name],["Art",ET[f.type]?.icon+" "+ET[f.type]?.label],["Titel",f.title],["Uhrzeit",f.time||"-"],f.loc&&["Ort","* "+f.loc],f.note&&["Notiz","* "+f.note.slice(0,50)],["Umfrage",f.pt==="att"?"* Anwesenheit":f.pt==="carpool"?"* Fahrtgemeinschaft":`* Liste (${(f.li||[]).length} Opt.)`],["Termine",f.recMode==="weekly"?`* Woechentlich . ${f.recDays?.length||0} Tage`:f.recMode==="custom"?`* ${f.recDates?.length||0} Daten`:"1 Termin . "+fmtD(f.date)],f.open&&["Sichtbarkeit","* Offen für andere Vereine"]].filter(Boolean).filter(x=>!x.hidden).map(([k,v])=>(
              <div key={k} style={{display:"flex",gap:10,marginBottom:9}}>
                <span style={{color:"rgba(255,255,255,.4)",fontSize:12,fontWeight:700,minWidth:90}}>{k}</span>
                <span style={{color:"#fff",fontSize:13,fontWeight:700,flex:1}}>{v}</span>
              </div>
            ))}
          </div>
          {!isEdit&&<div style={{marginTop:14}}>
            <Sw on={f.open} tog={()=>u({open:!f.open})} pri={t.p} label="* Offen für andere Vereine" sub="Eltern ohne Login können abstimmen"/>
          </div>}
        </div>}
      </div>
      {}
      <div style={{padding:"12px 16px",background:"#fff",borderTop:"1px solid #f1f5f9",display:"flex",gap:10,position:"sticky",bottom:0}}>
        {step>1?<Btn ch="<- Zurück" onClick={()=>setStep(s=>s-1)} v="gst" sx={{flex:1}}/>:<Btn ch="Abbrechen" onClick={onClose} v="gst" sx={{flex:1}}/>}
        {step<STEPS?<Btn ch="Weiter ->" onClick={()=>setStep(s=>s+1)} dis={!ok()} cl={cl} sx={{flex:2}}/>:<Btn ch={isEdit?"Speichern":f.recMode==="weekly"?"Serie erstellen":f.recMode==="custom"?`${(f.recDates||[]).length} Termine erstellen`:"Termin erstellen"} onClick={finish} cl={cl} sx={{flex:2}}/>}
      </div>
    </div>
  );
}

function HelpersTab({data,cid,myTids,session,save,fire,cl}) {
  const t=TH(cl);
  const allHelpers=(data.helpers||[]).filter(h=>h.cid===cid);
  const [showForm,setShowForm]=useState(false);
  const [editH,setEditH]=useState(null);
  const [f,setF]=useState({name:"",childName:"",tids:[],notes:"",active:true});
  const u=p=>setF(prev=>({...prev,...p}));
  const myTeams=data.teams.filter(tm=>myTids.includes(tm.id));

  const genCode=()=>Math.random().toString(36).slice(2,8).toUpperCase();

  const openNew=()=>{setF({name:"",childName:"",tids:myTids,notes:"",active:true,code:genCode()});setEditH(null);setShowForm(true);};
  const openEdit=h=>{setF({...h});setEditH(h.id);setShowForm(true);};

  const save2=()=>{
    const rec={...f,id:editH||uid(),cid,createdAt:editH?f.createdAt:new Date().toISOString()};
    const next=editH?allHelpers.map(x=>x.id===editH?rec:x):[...allHelpers,rec];
    save({...data,helpers:[...(data.helpers||[]).filter(h=>h.cid!==cid),...next]});
    setShowForm(false);fire(editH?"Helfer aktualisiert *":"Helfer angelegt *");
  };
  const del=id=>{save({...data,helpers:(data.helpers||[]).filter(h=>h.id!==id)});fire("Helfer entfernt");};
  const toggle=id=>{
    const next=(data.helpers||[]).map(h=>h.id===id?{...h,active:!h.active}:h);
    save({...data,helpers:next});fire("Status geändert");
  };

  return (
    <div>
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:16}}>
        <div><p style={{fontWeight:900,fontSize:16,color:"#0f172a"}}> Helfer-Accounts</p><p style={{fontSize:12,color:"#64748b",marginTop:2}}>{allHelpers.length} angelegt . {allHelpers.filter(h=>h.active!==false).length} aktiv</p></div>
        <button onClick={openNew} style={{padding:"9px 16px",borderRadius:11,border:"none",background:t.p,color:contrast(t.p),fontWeight:700,fontSize:13,cursor:"pointer",fontFamily:"inherit",boxShadow:`0 3px 10px ${t.p}44`}}>+ Neuer Helfer</button>
      </div>

      {allHelpers.length===0&&<div style={{textAlign:"center",padding:"32px",background:"#f8fafc",borderRadius:16,border:"1.5px dashed #e2e8f0"}}>
        <div style={{fontSize:36,marginBottom:8}}></div>
        <p style={{fontWeight:700,color:"#334155"}}>Noch keine Helfer angelegt</p>
        <p style={{fontSize:13,color:"#94a3b8",marginTop:4}}>Erstelle personalisierte Zugänge mit eigenem Code</p>
      </div>}

      <div style={{display:"flex",flexDirection:"column",gap:9}}>
        {allHelpers.map(h=>(
          <div key={h.id} style={{background:"#fff",borderRadius:15,border:`1.5px solid ${h.active!==false?"#e2e8f0":"#fecaca"}`,overflow:"hidden"}}>
            <div style={{padding:"12px 14px",display:"flex",alignItems:"center",gap:11}}>
              <div style={{width:44,height:44,borderRadius:13,background:h.active!==false?"#f0fdf4":"#fee2e2",display:"flex",alignItems:"center",justifyContent:"center",fontSize:22,flexShrink:0}}></div>
              <div style={{flex:1,minWidth:0}}>
                <div style={{fontWeight:800,fontSize:15,color:"#0f172a"}}>{h.name}</div>
                {h.childName&&<div style={{fontSize:12,color:"#64748b",marginTop:1}}>Kind: {h.childName}</div>}
                <div style={{display:"flex",gap:6,marginTop:4,flexWrap:"wrap"}}>
                  <span style={{fontSize:11,fontWeight:800,color:"#2563eb",background:"#eff6ff",borderRadius:6,padding:"2px 8px",fontFamily:"monospace"}}>{h.code}</span>
                  <span style={{fontSize:11,fontWeight:700,color:h.active!==false?"#16a34a":"#dc2626",background:h.active!==false?"#dcfce7":"#fee2e2",borderRadius:6,padding:"2px 8px"}}>{h.active!==false?"? Aktiv":"? Inaktiv"}</span>
                </div>
              </div>
              <div style={{display:"flex",gap:5}}>
                <button onClick={()=>toggle(h.id)} style={{width:30,height:30,borderRadius:8,background:h.active!==false?"#fee2e2":"#dcfce7",border:"none",color:h.active!==false?"#dc2626":"#16a34a",cursor:"pointer",fontSize:14,display:"flex",alignItems:"center",justifyContent:"center"}}>{h.active!==false?"?":"?"}</button>
                <button onClick={()=>openEdit(h)} style={{width:30,height:30,borderRadius:8,background:"#eff6ff",border:"none",color:"#2563eb",cursor:"pointer",fontSize:13,display:"flex",alignItems:"center",justifyContent:"center"}}></button>
                <button onClick={()=>del(h.id)} style={{width:30,height:30,borderRadius:8,background:"#fee2e2",border:"none",color:"#dc2626",cursor:"pointer",fontSize:13,display:"flex",alignItems:"center",justifyContent:"center"}}></button>
              </div>
            </div>
            {h.notes&&<div style={{padding:"0 14px 11px",fontSize:12,color:"#64748b",fontStyle:"italic"}}>{h.notes}</div>}
            {(h.tids||[]).length>0&&<div style={{padding:"0 14px 11px",display:"flex",gap:5,flexWrap:"wrap"}}>
              {data.teams.filter(tm=>(h.tids||[]).includes(tm.id)).map(tm=><span key={tm.id} style={{fontSize:11,fontWeight:700,color:tm.col,background:tm.col+"18",borderRadius:6,padding:"2px 8px"}}>{tm.icon} {tm.name}</span>)}
            </div>}
          </div>
        ))}
      </div>

      {}
      {showForm&&<div style={{position:"fixed",inset:0,background:"rgba(0,0,0,.55)",zIndex:800,display:"flex",alignItems:"flex-end",justifyContent:"center",backdropFilter:"blur(8px)"}}>
        <div style={{background:"#fff",borderRadius:"22px 22px 0 0",width:"100%",maxWidth:520,maxHeight:"90dvh",overflowY:"auto",animation:"down .24s ease"}}>
          <div style={{display:"flex",justifyContent:"center",padding:"12px 0 4px"}}><div style={{width:44,height:4,borderRadius:99,background:"#e2e8f0"}}/></div>
          <div style={{padding:"8px 22px 44px",display:"flex",flexDirection:"column",gap:12}}>
            <h3 style={{fontWeight:900,fontSize:18,color:"#0f172a"}}>{editH?"Helfer bearbeiten":"Neuen Helfer anlegen"}</h3>
            <Inp label="Name des Helfers" val={f.name} set={v=>u({name:v})} ph="z.B. Maria Mueller" cl={cl}/>
            <Inp label="Kind im Verein (optional)" val={f.childName||""} set={v=>u({childName:v})} ph="z.B. Leon Mueller,G-Jugend" cl={cl}/>
            <Inp label="Notizen (intern)" val={f.notes||""} set={v=>u({notes:v})} ph="z.B. Hilft bei Heimspielen" rows={2} cl={cl}/>

            {}
            <div style={{background:"#eff6ff",borderRadius:12,padding:"12px 14px",border:"1.5px solid #bfdbfe"}}>
              <div style={{fontSize:11,fontWeight:800,color:"#64748b",marginBottom:6}}>LOGIN-CODE (persoenlich & geheim)</div>
              <div style={{display:"flex",alignItems:"center",gap:10}}>
                <span style={{fontWeight:900,fontSize:22,color:"#2563eb",fontFamily:"monospace",flex:1}}>{f.code}</span>
                <button onClick={()=>u({code:genCode()})} style={{padding:"6px 12px",borderRadius:9,border:"1.5px solid #bfdbfe",background:"#fff",color:"#2563eb",fontWeight:700,fontSize:12,cursor:"pointer",fontFamily:"inherit"}}> Neu generieren</button>
              </div>
              <p style={{fontSize:11,color:"#64748b",marginTop:6}}>Gib diesen Code dem Helfer. Er kann sich damit einloggen.</p>
            </div>

            {}
            <div>
              <div style={{fontSize:11,fontWeight:800,color:"#64748b",marginBottom:8}}>ZUGELASSEN FUeR</div>
              {myTeams.map(tm=>(
                <label key={tm.id} style={{display:"flex",alignItems:"center",gap:10,padding:"9px 12px",borderRadius:11,border:`1.5px solid ${(f.tids||[]).includes(tm.id)?tm.col:"#e2e8f0"}`,background:(f.tids||[]).includes(tm.id)?tm.col+"12":"#fafafa",cursor:"pointer",marginBottom:6}}>
                  <input type="checkbox" checked={(f.tids||[]).includes(tm.id)} onChange={()=>u({tids:(f.tids||[]).includes(tm.id)?(f.tids||[]).filter(x=>x!==tm.id):[...(f.tids||[]),tm.id]})} style={{width:17,height:17,accentColor:tm.col}}/>
                  <span style={{fontSize:16}}>{tm.icon}</span>
                  <span style={{fontWeight:700,fontSize:14}}>{tm.name}</span>
                </label>
              ))}
            </div>

            {}
            <div style={{display:"flex",alignItems:"center",gap:12,background:"#f8fafc",borderRadius:12,padding:"12px 14px",border:"1.5px solid #e2e8f0"}}>
              <div style={{flex:1}}><div style={{fontWeight:700,fontSize:14}}>Account aktiv</div><div style={{fontSize:12,color:"#64748b",marginTop:2}}>Inaktive Accounts können sich nicht einloggen</div></div>
              <div onClick={()=>u({active:!f.active})} style={{width:48,height:26,borderRadius:99,background:f.active?t.p:"#e2e8f0",position:"relative",cursor:"pointer",transition:"background .2s"}}>
                <div style={{width:20,height:20,borderRadius:"50%",background:"#fff",position:"absolute",top:3,left:f.active?25:3,transition:"left .2s",boxShadow:"0 1px 4px rgba(0,0,0,.2)"}}/>
              </div>
            </div>

            <div style={{display:"flex",gap:9}}>
              <Btn full ch="Speichern" onClick={save2} dis={!f.name.trim()} cl={cl} icon="*"/>
              <Btn ch="Abbrechen" onClick={()=>setShowForm(false)} v="gst"/>
            </div>
          </div>
        </div>
      </div>}
    </div>
  );
}

function ChatTab({data,cid,myTids,session,save,fire,cl}) {
  const [modWarning, setModWarning] = useState(null); // null | "warning" | "yellow" | "red"
  const t=TH(cl);
  const allTeams=data.teams.filter(tm=>tm.cid===cid);
  const isHelper=session.role==="helper";
  const scopes=[
    {id:"club_"+cid,label:"* Gesamter Verein",sub:"Alle Teams"},...myTids.map(tid=>{const tm=allTeams.find(x=>x.id===tid);return{id:"team_"+tid,label:tm?.icon+" "+(tm?.name||tid),sub:tm?.cat||""};})
  ];

  const [selScope,setSelScope]=useState(scopes[0]?.id||"");
  const [text,setText]=useState("");
  const msgRef=useRef(null);

  const chats=data.chats||[];
  const chat=chats.find(c=>c.id===selScope);
  const msgs=chat?.messages||[];

  const send=()=>{
    if(!text.trim())return;
    const msg={id:uid(),author:session.name||"Unbekannt",role:session.role,text:text.trim(),ts:new Date().toISOString()};
    const next=chats.find(c=>c.id===selScope)
      ?chats.map(c=>c.id===selScope?{...c,messages:[...c.messages,msg]}:c)
      :[...chats,{id:selScope,cid,messages:[msg]}];
    save({...data,chats:next});
    setText("");
    setTimeout(()=>msgRef.current?.scrollIntoView({behavior:"smooth"}),100);
  };

  const roleColor={admin:"#7c3aed",trainer:"#16a34a",helper:"#d97706",user:"#2563eb"};
  const roleLabel={admin:"Admin",trainer:"Trainer",helper:"Helfer",user:"Elternteil"};
  const fmt=ts=>new Date(ts).toLocaleTimeString("de-DE",{hour:"2-digit",minute:"2-digit"});
  const fmtD=ts=>{const d=new Date(ts);const today=new Date();return d.toDateString()===today.toDateString()?"Heute":d.toLocaleDateString("de-DE",{day:"2-digit",month:"2-digit"});};

  return (
    <div style={{display:"flex",flexDirection:"column",height:"calc(100dvh - 200px)"}}>
      {}
      <div style={{overflowX:"auto",display:"flex",gap:7,marginBottom:12,scrollbarWidth:"none",paddingBottom:2}}>
        {scopes.map(s=>(
          <button key={s.id} onClick={()=>setSelScope(s.id)}
            style={{display:"flex",flexDirection:"column",alignItems:"center",padding:"8px 14px",borderRadius:12,border:`2px solid ${selScope===s.id?t.p:"#e2e8f0"}`,background:selScope===s.id?t.p:"#fff",color:selScope===s.id?"#fff":"#475569",fontWeight:700,fontSize:12,cursor:"pointer",whiteSpace:"nowrap",fontFamily:"inherit",minWidth:80,gap:2}}>
            <span style={{fontSize:13}}>{s.label}</span>
            {s.sub&&<span style={{fontSize:10,opacity:.7}}>{s.sub}</span>}
          </button>
        ))}
      </div>

      {}
      <div style={{flex:1,overflowY:"auto",display:"flex",flexDirection:"column",gap:10,paddingBottom:12}}>
        {msgs.length===0&&<div style={{textAlign:"center",padding:"32px",color:"#94a3b8"}}>
          <div style={{fontSize:36,marginBottom:8}}></div>
          <p style={{fontWeight:700}}>Noch keine Nachrichten</p>
          <p style={{fontSize:13,marginTop:4}}>Schreib die erste Nachricht!</p>
        </div>}
        {msgs.map((msg,i)=>{
          const isMe=msg.author===session.name;
          const showDate=i===0||fmtD(msgs[i-1].ts)!==fmtD(msg.ts);
          return (
            <div key={msg.id}>
              {showDate&&<div style={{textAlign:"center",marginBottom:8}}><span style={{fontSize:11,fontWeight:700,color:"#94a3b8",background:"#f1f5f9",borderRadius:99,padding:"3px 12px"}}>{fmtD(msg.ts)}</span></div>}
              <div style={{display:"flex",flexDirection:isMe?"row-reverse":"row",alignItems:"flex-end",gap:8}}>
                {!isMe&&<Av name={msg.author} sz={28}/>}
                <div style={{maxWidth:"78%"}}>
                  {!isMe&&<div style={{fontSize:11,fontWeight:700,color:roleColor[msg.role]||"#64748b",marginBottom:3,marginLeft:4}}>{msg.author} . <span style={{color:"#94a3b8",fontWeight:500}}>{roleLabel[msg.role]||msg.role}</span></div>}
                  <div style={{background:isMe?t.p:"#fff",color:isMe?contrast(t.p):"#0f172a",borderRadius:isMe?"18px 18px 4px 18px":"18px 18px 18px 4px",padding:"10px 14px",fontSize:14,lineHeight:1.5,boxShadow:isMe?`0 3px 12px ${t.p}44`:"0 1px 6px rgba(0,0,0,.07)",border:isMe?"none":"1.5px solid #f1f5f9"}}>
                    {msg.text}
                  </div>
                  <div style={{fontSize:10,color:"#94a3b8",marginTop:3,textAlign:isMe?"right":"left",marginLeft:isMe?0:4}}>{fmt(msg.ts)}</div>
                </div>
              </div>
            </div>
          );
        })}
        <div ref={msgRef}/>
      </div>

      {}
      <div style={{display:"flex",gap:8,paddingTop:8,borderTop:"1px solid #f1f5f9",background:"#f8fafc",borderRadius:14,padding:"10px 12px"}}>
        <input value={text} onChange={e=>setText(e.target.value)}
          onKeyDown={e=>{if(e.key==="Enter"&&!e.shiftKey){e.preventDefault();send();}}}
          placeholder="Nachricht schreiben... (Enter = senden)"
          style={{flex:1,padding:"10px 13px",fontSize:14,border:"1.5px solid #e2e8f0",borderRadius:11,outline:"none",background:"#fff"}}/>
        <button onClick={send} disabled={!text.trim()}
          style={{width:44,height:44,borderRadius:11,border:"none",background:text.trim()?t.p:"#e2e8f0",color:text.trim()?contrast(t.p):"#94a3b8",fontSize:18,cursor:text.trim()?"pointer":"default",flexShrink:0,display:"flex",alignItems:"center",justifyContent:"center",transition:"all .15s"}}>
          
        </button>
      </div>
    </div>
  );
}

function JerseysTab({ data,myTids,save,fire,cl }) {
  const t = TH(cl);
  const allPlayers = data.playerProfiles || [];
  const allTeams   = data.teams;
  const myTeams    = allTeams.filter(tm => myTids.includes(tm.id));
  const [selTid,setSelTid]   = useState(myTids[0]||"");
  const [mode,setMode]     = useState("overview"); // overview | collect
  const [search,setSearch]   = useState("");

  const teamPlayers = allPlayers
    .filter(p => p.mainTid === selTid && p.jerseyNr)
    .sort((a,b) => parseInt(a.jerseyNr||0)-parseInt(b.jerseyNr||0));

  const allWithJersey = allPlayers.filter(p => myTids.includes(p.mainTid) && p.jerseyNr);
  const q = search.toLowerCase();

  const setStatus = (playerId,status) => {
    const next = allPlayers.map(p => p.id===playerId ? {...p,jerseyStatus:status} : p);
    save({...data,playerProfiles:next});
    fire("Status gespeichert *");
  };

  const statusFor = sid => JERSEY_STATUS.find(s=>s.id===sid)||JERSEY_STATUS[5];
  const counts = {};
  JERSEY_STATUS.forEach(s => { counts[s.id] = allWithJersey.filter(p=>(p.jerseyStatus||"none")===s.id).length; });

  return (
    <div>
      {}
      <div style={{overflowX:"auto",display:"flex",gap:7,marginBottom:14,scrollbarWidth:"none"}}>
        {myTeams.map(tm=>(
          <button key={tm.id} onClick={()=>setSelTid(tm.id)}
            style={{display:"flex",alignItems:"center",gap:6,padding:"8px 14px",borderRadius:99,border:`2px solid ${selTid===tm.id?tm.col:"#e2e8f0"}`,background:selTid===tm.id?tm.col+"15":"#fff",color:selTid===tm.id?tm.col:"#475569",fontWeight:700,fontSize:13,cursor:"pointer",whiteSpace:"nowrap",fontFamily:"inherit"}}>
            {tm.icon} {tm.name}
            <span style={{background:selTid===tm.id?tm.col:"#e2e8f0",color:selTid===tm.id?"#fff":"#64748b",borderRadius:99,padding:"1px 7px",fontSize:11,fontWeight:800}}>
              {allPlayers.filter(p=>p.mainTid===tm.id&&p.jerseyNr).length}
            </span>
          </button>
        ))}
      </div>

      {}
      <div style={{display:"flex",gap:8,marginBottom:16}}>
        {[["overview","* Übersicht"],["collect","* Einsammeln"]].map(([m,l])=>(
          <button key={m} onClick={()=>setMode(m)}
            style={{flex:1,padding:"10px",borderRadius:12,border:`2px solid ${mode===m?t.p:"#e2e8f0"}`,background:mode===m?t.p:"#fff",color:mode===m?"#fff":"#475569",fontWeight:700,fontSize:13,cursor:"pointer",fontFamily:"inherit",transition:"all .15s"}}>
            {l}
          </button>
        ))}
      </div>

      {}
      {mode==="overview" && (
        <>
          {}
          <div className="va-grid-3" style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:8,marginBottom:16}}>
            {JERSEY_STATUS.filter(s=>s.id!=="none").map(s=>(
              <div key={s.id} style={{background:s.bg,borderRadius:12,padding:"10px 8px",textAlign:"center",border:`1.5px solid ${s.col}30`}}>
                <div style={{fontSize:20,marginBottom:2}}>{s.icon}</div>
                <div style={{fontWeight:900,fontSize:20,color:s.col,lineHeight:1}}>{counts[s.id]||0}</div>
                <div style={{fontSize:10,color:s.col,fontWeight:700,marginTop:2,opacity:.8}}>{s.label}</div>
              </div>
            ))}
          </div>

          {}
          {teamPlayers.length===0
            ? <div style={{textAlign:"center",padding:"32px",background:"#f8fafc",borderRadius:14,border:"1.5px dashed #e2e8f0"}}>
                <div style={{fontSize:36,marginBottom:8}}></div>
                <p style={{fontWeight:700,color:"#334155"}}>Noch keine Trikotnummern vergeben</p>
                <p style={{fontSize:13,color:"#94a3b8",marginTop:4}}>Im Spielerprofil {"->"}  Trikot eintragen</p>
              </div>
            : <div style={{display:"flex",flexDirection:"column",gap:7}}>
                {teamPlayers.map(pl => {
                  const st = statusFor(pl.jerseyStatus||"none");
                  return (
                    <div key={pl.id} style={{background:"#fff",borderRadius:13,border:`1.5px solid ${st.col}30`,padding:"11px 14px",display:"flex",alignItems:"center",gap:12}}>
                      {}
                      <div style={{width:44,height:44,borderRadius:12,background:t.p,display:"flex",alignItems:"center",justifyContent:"center",color:"#fff",fontWeight:900,fontSize:18,flexShrink:0,boxShadow:`0 2px 8px ${t.p}44`}}>
                        {pl.jerseyNr}
                      </div>
                      <div style={{flex:1}}>
                        <div style={{fontWeight:800,fontSize:14,color:"#0f172a"}}>{pl.name}</div>
                        <div style={{fontSize:12,color:"#64748b",marginTop:1,display:"flex",gap:7}}>
                          {pl.jerseySize&&<span>Größe {pl.jerseySize}</span>}
                          {pl.position&&<span>. {pl.position}</span>}
                        </div>
                      </div>
                      <div style={{display:"flex",alignItems:"center",gap:6,background:st.bg,borderRadius:9,padding:"5px 10px",border:`1px solid ${st.col}30`}}>
                        <span style={{fontSize:16}}>{st.icon}</span>
                        <span style={{fontSize:11,fontWeight:700,color:st.col}}>{st.label}</span>
                      </div>
                    </div>
                  );
                })}
              </div>
          }
        </>
      )}

      {}
      {mode==="collect" && (
        <>
          <div style={{background:"#fffbeb",border:"1.5px solid #fde68a",borderRadius:13,padding:"12px 15px",marginBottom:14}}>
            <p style={{fontWeight:700,fontSize:14,color:"#92400e",marginBottom:3}}> Trikots einsammeln</p>
            <p style={{fontSize:12,color:"#b45309"}}>Tippe auf den Status des Spielers - z.B. ob das Trikot schon da ist oder noch fehlt.</p>
          </div>

          {}
          <div style={{position:"relative",marginBottom:12}}>
            <span style={{position:"absolute",left:12,top:"50%",transform:"translateY(-50%)",fontSize:15,pointerEvents:"none"}}></span>
            <input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Spieler suchen..."
              style={{width:"100%",padding:"10px 13px 10px 38px",fontSize:14,border:"1.5px solid #e2e8f0",borderRadius:12,outline:"none",background:"#fff"}}/>
          </div>

          {}
          <div style={{display:"flex",gap:6,flexWrap:"wrap",marginBottom:12}}>
            {JERSEY_STATUS.map(s=>(counts[s.id]>0&&(
              <span key={s.id} style={{fontSize:11,fontWeight:700,color:s.col,background:s.bg,borderRadius:7,padding:"3px 9px",border:`1px solid ${s.col}25`}}>
                {s.icon} {s.label} ({counts[s.id]})
              </span>
            )))}
          </div>

          <div style={{display:"flex",flexDirection:"column",gap:8}}>
            {allWithJersey
              .filter(p=>myTids.includes(p.mainTid)&&p.name.toLowerCase().includes(q))
              .sort((a,b)=>parseInt(a.jerseyNr||0)-parseInt(b.jerseyNr||0))
              .map(pl=>{
                const st=statusFor(pl.jerseyStatus||"none");
                const tm=allTeams.find(x=>x.id===pl.mainTid);
                return (
                  <div key={pl.id} style={{background:"#fff",borderRadius:14,border:`2px solid ${st.col}35`,overflow:"hidden"}}>
                    {}
                    <div style={{padding:"11px 14px",display:"flex",alignItems:"center",gap:11}}>
                      <div style={{width:42,height:42,borderRadius:12,background:t.p,display:"flex",alignItems:"center",justifyContent:"center",color:"#fff",fontWeight:900,fontSize:17,flexShrink:0}}>
                        {pl.jerseyNr}
                      </div>
                      <div style={{flex:1}}>
                        <div style={{fontWeight:800,fontSize:14,color:"#0f172a"}}>{pl.name}</div>
                        <div style={{fontSize:11,color:"#64748b",marginTop:1,display:"flex",gap:6}}>
                          {pl.jerseySize&&<span>Gr. {pl.jerseySize}</span>}
                          {tm&&<span style={{color:tm.col,fontWeight:600}}>. {tm.name}</span>}
                        </div>
                      </div>
                      <div style={{background:st.bg,borderRadius:9,padding:"5px 10px",border:`1px solid ${st.col}30`,fontSize:18}}>
                        {st.icon}
                      </div>
                    </div>
                    {}
                    <div style={{display:"flex",borderTop:"1px solid #f1f5f9"}}>
                      {JERSEY_STATUS.map(s=>(
                        <button key={s.id} onClick={()=>setStatus(pl.id,s.id)}
                          style={{flex:1,padding:"9px 4px",border:"none",borderRight:"1px solid #f1f5f9",background:(pl.jerseyStatus||"none")===s.id?s.bg:"#fff",cursor:"pointer",display:"flex",flexDirection:"column",alignItems:"center",gap:2,transition:"background .13s"}}>
                          <span style={{fontSize:16}}>{s.icon}</span>
                          <span style={{fontSize:9,fontWeight:700,color:(pl.jerseyStatus||"none")===s.id?s.col:"#94a3b8",lineHeight:1.2,textAlign:"center"}}>{s.label.split(" ")[0]}</span>
                        </button>
                      ))}
                    </div>
                  </div>
                );
              })
            }
            {allWithJersey.filter(p=>p.name.toLowerCase().includes(q)).length===0&&(
              <div style={{textAlign:"center",padding:"28px",color:"#94a3b8"}}>
                <div style={{fontSize:32,marginBottom:8}}></div>
                <p style={{fontWeight:700}}>Keine Trikots eingetragen</p>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}

const ADSENSE_ID = "ca-pub-DEIN-ADSENSE-ID";
const ADS_ENABLED = ADSENSE_ID !== "ca-pub-DEIN-ADSENSE-ID";

function AdBanner({ slot="auto",style={} }) {
  const ref = useRef(null);
  useEffect(()=>{
    if(!ADS_ENABLED) return;
    try { window.adsbygoogle=window.adsbygoogle||[]; window.adsbygoogle.push({}); } catch {}
  },[]);

  if(!ADS_ENABLED) return (
    <div style={{background:"#f8fafc",border:"1px dashed #e2e8f0",borderRadius:8,padding:"6px 12px",textAlign:"center",fontSize:11,color:"#94a3b8",fontWeight:600,...style}}>
      Werbung
    </div>
  );
  return (
    <div style={{textAlign:"center",...style}}>
      <ins ref={ref} className="adsbygoogle" style={{display:"block"}}
        data-ad-client={ADSENSE_ID} data-ad-slot={slot}
        data-ad-format="auto" data-full-width-responsive="true"/>
    </div>
  );
}

function ShareBanner({ cl,session,trigger,onDismiss }) {
  const t = TH(cl);
  const [copied,setCopied] = useState(false);
  const [shared,setShared] = useState(false);

  const shareText = `Ich nutze die Vereins-App für ${cl?.name || "unseren Verein"} - super einfach für Termine,Mannschaften und Kommunikation! ${APP_URL}`;

  const doShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({ title:"Vereins-App",text:shareText,url:APP_URL });
        setShared(true);
        setTimeout(onDismiss,2000);
      } catch {}
    } else {
      navigator.clipboard?.writeText(shareText);
      setCopied(true);
      setTimeout(()=>setCopied(false),2500);
    }
  };

  const shareWhatsApp = () => {
    window.open(`https://wa.me/?text=${encodeURIComponent(shareText)}`,"_blank");
    setShared(true);
    setTimeout(onDismiss,1500);
  };

  const TRIGGERS = {
    firstAssign:  "Du hast gerade Spieler zugeteilt",seasonDone:   "Neue Saison geplant",tenEvents:    "10 Termine angelegt",firstTournament:"Turnier organisiert",};

  return (
    <div style={{position:"fixed",bottom:0,left:0,right:0,zIndex:990,padding:"0 0 env(safe-area-inset-bottom)",animation:"slideUp .35s ease"}}>
      <div style={{background:"#fff",borderRadius:"20px 20px 0 0",boxShadow:"0 -8px 40px rgba(0,0,0,.15)",border:"1px solid #e2e8f0",padding:"20px 20px 32px",maxWidth:520,margin:"0 auto"}}>
        {}
        <button onClick={onDismiss} style={{position:"absolute",top:14,right:16,width:28,height:28,borderRadius:"50%",background:"#f1f5f9",border:"none",fontSize:14,cursor:"pointer",color:"#64748b"}}></button>

        <div style={{display:"flex",alignItems:"flex-start",gap:12,marginBottom:14}}>
          <div style={{width:44,height:44,borderRadius:13,background:t.p+"15",display:"flex",alignItems:"center",justifyContent:"center",fontSize:24,flexShrink:0}}></div>
          <div>
            <div style={{fontWeight:800,fontSize:16,color:"#0f172a",marginBottom:3}}>
              {shared ? "Danke fürs Teilen!" : "Anderen Trainern helfen?"}
            </div>
            <div style={{fontSize:13,color:"#64748b",lineHeight:1.5}}>
              {shared
                ? "Du hilfst anderen Vereinen,organisierter zu werden."
                : `${TRIGGERS[trigger]||"Alles laeuft gut"} - magst du die App weiterempfehlen?`
              }
            </div>
          </div>
        </div>

        {!shared&&<>
          {}
          <div style={{display:"flex",gap:9,marginBottom:10}}>
            <button onClick={shareWhatsApp}
              style={{flex:2,display:"flex",alignItems:"center",justifyContent:"center",gap:8,padding:"12px",borderRadius:13,border:"none",background:"#25D366",color:"#fff",fontWeight:800,fontSize:14,cursor:"pointer",fontFamily:"inherit"}}>
              <span style={{fontSize:18}}></span> WhatsApp
            </button>
            <button onClick={doShare}
              style={{flex:1,display:"flex",alignItems:"center",justifyContent:"center",gap:6,padding:"12px",borderRadius:13,border:"1.5px solid #e2e8f0",background:"#fff",color:"#334155",fontWeight:700,fontSize:13,cursor:"pointer",fontFamily:"inherit"}}>
              {copied?"* Kopiert!":"Link kopieren"}
            </button>
          </div>
          {}
          <button onClick={onDismiss} style={{width:"100%",padding:"10px",borderRadius:11,border:"none",background:"none",color:"#94a3b8",fontWeight:600,fontSize:13,cursor:"pointer",fontFamily:"inherit"}}>
            Jetzt nicht
          </button>
        </>}
      </div>
    </div>
  );
}
function useShareTrigger(data,session,myTids) {
  const [trigger,setTrigger] = useState(null);
  const [dismissed,setDismissed] = useState(()=>{
    try { return JSON.parse(localStorage.getItem("share_dismissed")||"{}"); } catch { return {}; }
  });

  const dismiss = (key) => {
    const next = {...dismissed,[key]:Date.now()};
    setDismissed(next);
    localStorage.setItem("share_dismissed",JSON.stringify(next));
    setTrigger(null);
  };

  useEffect(()=>{
    if(!session||session.role==="user") return;
    const cooldown = 7*24*60*60*1000; // 7 days between prompts
    const now = Date.now();
    const lastAny = Math.max(...Object.values(dismissed).map(Number).filter(Boolean).filter(x=>!x.hidden),0);
    if(now - lastAny < cooldown) return; // respect cooldown

    const allPlayers = data.playerProfiles||[];
    const myPlayers  = allPlayers.filter(p=>myTids.includes(p.mainTid));
    const events     = (data.events||[]).filter(e=>myTids.includes(e.tid));
    const assigned = myPlayers.filter(p=>p.mainTid).length;
    if(assigned >= 10 && !dismissed["firstAssign"]) { setTrigger("firstAssign"); return; }
    if(events.length >= 10 && !dismissed["tenEvents"]) { setTrigger("tenEvents"); return; }
    const seasons = (data.seasons||[]).filter(s=>s.status==="planning"||s.status==="active");
    if(seasons.length > 1 && !dismissed["seasonDone"]) { setTrigger("seasonDone"); return; }
  },[data,session]);

  return { trigger,dismiss };
}

const AGE_GROUPS_LIST = [
  {id:"bambinis",label:"Bambinis",icon:"B",ageRange:"U5-U6"},{id:"g",label:"G-Jugend",icon:"G",ageRange:"U7"},{id:"f",label:"F-Jugend",icon:"F",ageRange:"U8-U9"},{id:"e",label:"E-Jugend",icon:"E",ageRange:"U10-U11"},{id:"d",label:"D-Jugend",icon:"D",ageRange:"U12-U13"},{id:"c",label:"C-Jugend",icon:"C",ageRange:"U14-U15"},{id:"b",label:"B-Jugend",icon:"B2",ageRange:"U16-U17"},{id:"a",label:"A-Jugend",icon:"A",ageRange:"U18-U19"},{id:"seniors",label:"Senioren",icon:"S",ageRange:"Aktive"},{id:"altherren",label:"Alt-Herren",icon:"AH",ageRange:"Ue32"},{id:"frauen",label:"Frauen",icon:"FR",ageRange:"Aktive"},];

function NewSeasonWizard({ data,save,fire,cl,myTids,onClose,onDone }) {
  const t=TH(cl||(data.clubs||[])[0]);
  const [step,setStep]=useState(1);
  const [f,setF]=useState({label:"",ageGroups:[],teamCount:{},newPlayers:[],archivePlayers:[]});
  const u=p=>setF(prev=>({...prev,...p}));
  const ok=()=>step===1?f.label.trim().length>=6:true;
  const finish=()=>{
    const label = f.label.trim();
    if(!label) return;
    const sid = "s"+label.replace(/[^a-z0-9]/gi,"").toLowerCase()+Date.now().toString(36);
    const newSeason = {id:sid, label, status:"planning"};
    const allP = data.playerProfiles||[];
    const existingSids = (data.seasons||[]).map(s=>s.id);
    if(existingSids.includes(sid)) { fire&&fire("Saison existiert bereits"); return; }
    const activeSid = data.activeSeason || (data.seasons||[])[0]?.id || "";
    const activePlayers = allP.filter(p=>
      !p.archived &&
      (!p.seasonId || p.seasonId===activeSid) &&
      (myTids.includes(p.mainTid) || !p.mainTid)
    );
    const copied = activePlayers.map(p=>({
      ...p, id:uid(), seasonId:sid,
      lastTeam: (data.teams||[]).find(x=>x.id===p.mainTid)?.name||"",
      lastTeamId: p.mainTid,
      mainTid:"", optTids:[], jerseyNr:"", jerseyStatus:"none",
      recommend:"", goals:0, assists:0, yellowCards:0, redCards:0,
    }));
    const nextData = {
      ...data,
      seasons: [...(data.seasons||[]), newSeason],
      playerProfiles: [...allP, ...copied],
    };
    save(nextData);
    fire&&fire("Saison "+label+" angelegt - "+copied.length+" Spieler übernommen");
    onDone&&onDone(sid);
    onClose();
  };
  const STEPS=["Saison","Altersklassen","Fertig"];
  return (
    <div style={{position:"fixed",inset:0,background:"rgba(0,0,0,.65)",zIndex:960,display:"flex",alignItems:"flex-end",justifyContent:"center",backdropFilter:"blur(8px)"}}>
      <div style={{background:"#fff",borderRadius:"22px 22px 0 0",width:"100%",maxWidth:520,maxHeight:"90dvh",overflowY:"auto"}}>
        <div style={{background:`linear-gradient(135deg,${t.s||"#052e16"},${t.p}bb)`,padding:"16px 20px 18px"}}>
          <div style={{display:"flex",alignItems:"center",gap:10,marginBottom:10}}>
            <div style={{flex:1,color:"rgba(255,255,255,.6)",fontSize:11,fontWeight:700}}>SCHRITT {step}/{STEPS.length} - {STEPS[step-1].toUpperCase()}</div>
            <button onClick={onClose} style={{width:32,height:32,borderRadius:10,background:"rgba(255,255,255,.15)",border:"none",color:"#fff",cursor:"pointer"}}>x</button>
          </div>
          <div style={{height:4,borderRadius:99,background:"rgba(255,255,255,.2)"}}><div style={{height:"100%",borderRadius:99,background:"rgba(255,255,255,.9)",width:`${(step/STEPS.length)*100}%`}}/></div>
        </div>
        <div style={{padding:"20px"}}>
          {step===1&&<>
            <h3 style={{fontWeight:900,fontSize:18,margin:"0 0 16px"}}>Neue Saison</h3>
            <input value={f.label} onChange={e=>u({label:e.target.value})} placeholder="z.B. 2026/2027" autoFocus
              style={{width:"100%",padding:"13px",fontSize:20,fontWeight:800,textAlign:"center",border:`1.5px solid ${f.label.length>=6?t.p:"#e2e8f0"}`,borderRadius:12,outline:"none",boxSizing:"border-box"}}/>
            <div style={{display:"flex",gap:8,marginTop:10,flexWrap:"wrap"}}>
              {["2026/2027","2027/2028"].map(l=><button key={l} onClick={()=>u({label:l})} style={{padding:"7px 14px",borderRadius:9,border:`2px solid ${f.label===l?t.p:"#e2e8f0"}`,background:f.label===l?t.p:"#fff",color:f.label===l?"#fff":t.p,fontWeight:700,fontSize:14,cursor:"pointer",fontFamily:"inherit"}}>{l}</button>)}
            </div>
          </>}
          {step===2&&<>
            <h3 style={{fontWeight:900,fontSize:18,margin:"0 0 8px"}}>Bereit?</h3>
            <p style={{fontSize:14,color:"#64748b",lineHeight:1.6}}>Alle aktiven Spieler der aktuellen Saison werden in die neue Saison {f.label} kopiert. Zuteilungen werden zurückgesetzt - du kannst neu einteilen.</p>
            <div style={{background:"#f0fdf4",borderRadius:12,padding:"12px",border:"1.5px solid #bbf7d0",marginTop:12,fontSize:13,color:"#166534"}}>
              {(data.playerProfiles||[]).filter(p=>!p.archived&&myTids.includes(p.mainTid)).length} Spieler werden übernommen
            </div>
          </>}
          {step===3&&<>
            <h3 style={{fontWeight:900,fontSize:18,margin:"0 0 8px"}}>Saison anlegen</h3>
            <p style={{fontSize:14,color:"#64748b"}}>Saison {f.label} wird als Planungs-Saison angelegt.</p>
          </>}
          <div style={{display:"flex",gap:9,marginTop:20,paddingBottom:32}}>
            {step>1?<button onClick={()=>setStep(s=>s-1)} style={{flex:1,padding:"12px",borderRadius:12,border:"1.5px solid #e2e8f0",background:"#fff",fontWeight:700,cursor:"pointer",fontFamily:"inherit"}}>Zurück</button>:<button onClick={onClose} style={{flex:1,padding:"12px",borderRadius:12,border:"1.5px solid #e2e8f0",background:"#fff",fontWeight:700,cursor:"pointer",fontFamily:"inherit"}}>Abbrechen</button>}
            {step<STEPS.length?<button onClick={()=>ok()&&setStep(s=>s+1)} disabled={!ok()} style={{flex:2,padding:"12px",borderRadius:12,border:"none",background:ok()?t.p:"#e2e8f0",color:ok()?"#fff":"#94a3b8",fontWeight:800,cursor:ok()?"pointer":"default",fontFamily:"inherit"}}>Weiter</button>:<button onClick={finish} style={{flex:2,padding:"12px",borderRadius:12,border:"none",background:t.p,color:"#fff",fontWeight:800,cursor:"pointer",fontFamily:"inherit"}}>Saison anlegen</button>}
          </div>
        </div>
      </div>
    </div>
  );
}

function SeasonPicker({ data,save,fire,onSelect,t }) {
  const seasons = data.seasons || [{id:"s2526",label:"2025/2026",status:"active"}];
  const active  = data.activeSeason || seasons[0]?.id;
  const [showWizard,setShowWizard] = useState(false);
  const archiveSeason = sid => { save({...data,seasons:seasons.map(s=>s.id===sid?{...s,status:"archived"}:s)}); fire&&fire("Archiviert"); };
  const switchActive  = sid => { save({...data,activeSeason:sid}); onSelect&&onSelect(sid); };
  const STATUS = {active:{col:"#16a34a",bg:"#dcfce7",l:"Aktiv",i:"gruen"},planning:{col:"#2563eb",bg:"#eff6ff",l:"Planung",i:"blau"},archived:{col:"#64748b",bg:"#f1f5f9",l:"Archiviert",i:"grau"}};
  const clubs = data.clubs||[];
  const teams = data.teams||[];
  return (
    <div style={{display:"flex",flexDirection:"column",gap:10}}>
      {showWizard&&<NewSeasonWizard data={data} save={save} fire={fire} cl={clubs[0]||null} myTids={teams.map(tm=>tm.id)} onClose={()=>setShowWizard(false)} onDone={sid=>{switchActive(sid);setShowWizard(false);}}/>}
      {seasons.map(s=>{
        const st=STATUS[s.status]||STATUS.active;
        const isActive=s.id===active;
        const cnt=(data.playerProfiles||[]).filter(p=>p.seasonId===s.id).length;
        return (
          <div key={s.id} style={{background:"#fff",borderRadius:16,border:`2px solid ${isActive?t.p:"#e2e8f0"}`,padding:"13px 16px",display:"flex",alignItems:"center",gap:12}}>
            <div style={{flex:1}}>
              <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:4}}>
                <span style={{fontWeight:900,fontSize:17,color:"#0f172a"}}>{s.label}</span>
                <span style={{fontSize:11,fontWeight:700,color:st.col,background:st.bg,borderRadius:6,padding:"2px 8px"}}>{st.l}</span>
              </div>
              <div style={{fontSize:12,color:"#64748b"}}>{cnt} Spieler</div>
            </div>
            <div style={{display:"flex",gap:7}}>
              {s.status!=="archived"&&<button onClick={()=>switchActive(s.id)} style={{padding:"7px 14px",borderRadius:10,border:`2px solid ${t.p}`,background:isActive?t.p:"#fff",color:isActive?"#fff":t.p,fontWeight:700,fontSize:13,cursor:"pointer",fontFamily:"inherit"}}>{isActive?"Aktiv":"Öffnen"}</button>}
              {s.status==="planning"&&<button onClick={()=>archiveSeason(s.id)} style={{padding:"7px 12px",borderRadius:10,border:"1.5px solid #e2e8f0",background:"#f8fafc",color:"#64748b",fontWeight:600,fontSize:12,cursor:"pointer",fontFamily:"inherit"}}>Archiv</button>}
            </div>
          </div>
        );
      })}
      <button onClick={()=>setShowWizard(true)} style={{width:"100%",padding:"14px",borderRadius:14,border:`2px dashed ${t.p}`,background:"#fff",color:t.p,fontWeight:800,fontSize:14,cursor:"pointer",fontFamily:"inherit"}}>
        + Neue Saison planen
      </button>
    </div>
  );
}

function SeasonModal({ data,save,fire,cl,myTids,onClose }) {
  const t = TH(cl);
  const seasons      = data.seasons || [{ id:"s2526",label:"2025/2026",status:"active" }];
  const active       = data.activeSeason || seasons[0]?.id;
  const allPlayers   = data.playerProfiles || [];
  const allTeams     = data.teams;
  const myTeams      = allTeams.filter(tm => myTids.includes(tm.id));
  const [tab,setTab] = useState("seasons");
  const copyToSeason = (fromId,toId) => {
    const existing  = allPlayers.filter(p=>p.seasonId===toId);
    if (existing.length > 0 && !window.confirm(`Die Saison hat bereits ${existing.length} Spieler. Trotzdem kopieren (Duplikate möglich)?`)) return;

    const toCopy = allPlayers.filter(p => p.seasonId===fromId && myTids.includes(p.mainTid));
    const copied = toCopy.map(p => ({
      ...p,id: uid(),seasonId: toId,lastTeam:   (allTeams.find(tm=>tm.id===p.mainTid)?.name||"") + " " + (seasons.find(s=>s.id===fromId)?.label||""),lastTeamId: p.mainTid,mainTid:"",optTids: [],jerseyNr:"",jerseyStatus:"none",recommend:"",goals:0,assists:0,yellowCards:0,redCards:0,}));

    save({ ...data,playerProfiles: [...allPlayers,...copied] });
    fire(`* ${copied.length} Spieler in Saison ${seasons.find(s=>s.id===toId)?.label||toId} kopiert`);
    onClose();
  };

  const switchActive = sid => {
    save({ ...data,activeSeason: sid });
    fire(`Saison ${seasons.find(s=>s.id===sid)?.label} aktiv`);
  };

  const [copyFrom,setCopyFrom] = useState(active);
  const [selSeason,setSelSeason] = useState(active);
  const [copyTo,setCopyTo]   = useState(seasons.find(s=>s.status==="planning")?.id||"");
  const planningSeasons = seasons.filter(s=>s.status==="planning");

  return (
    <div style={{position:"fixed",inset:0,overflowY:"auto",WebkitOverflowScrolling:"touch",background:"rgba(0,0,0,.6)",zIndex:900,display:"flex",alignItems:"flex-end",justifyContent:"center",backdropFilter:"blur(8px)"}}>
      <div style={{background:"#fff",borderRadius:"22px 22px 0 0",width:"100%",maxWidth:520,maxHeight:"90dvh",overflowY:"auto",animation:"down .24s ease"}}>
        <div style={{display:"flex",justifyContent:"center",padding:"12px 0 4px"}}><div style={{width:44,height:4,borderRadius:99,background:"#e2e8f0"}}/></div>
        <div style={{padding:"8px 20px 48px"}}>
          <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:16}}>
            <h2 style={{fontWeight:900,fontSize:20,color:"#0f172a",margin:0}}> Saisonplanung</h2>
            <button onClick={onClose} style={{width:34,height:34,borderRadius:11,background:"#f1f5f9",border:"none",fontSize:17,cursor:"pointer"}}></button>
          </div>

          {}
          <div style={{display:"flex",gap:8,marginBottom:18,background:"#f0f4f8",borderRadius:11,padding:3}}>
            {[["seasons","* Saisons"],["copy","* Spieler kopieren"]].map(([k,l])=>(
              <button key={k} onClick={()=>setTab(k)}
                style={{flex:1,padding:"9px",borderRadius:9,border:"none",background:tab===k?"#fff":"none",color:tab===k?"#0f172a":"#94a3b8",fontWeight:700,fontSize:13,cursor:"pointer",fontFamily:"inherit",boxShadow:tab===k?"0 2px 8px rgba(0,0,0,.07)":"none"}}>
                {l}
              </button>
            ))}
          </div>

          {}
          {tab==="seasons"&&(
            <SeasonPicker
              data={data} save={save} fire={fire}
              onSelect={sid=>{switchActive(sid);setSelSeason(sid);}}
              t={t}
            />
          )}

          {}
          {tab==="copy"&&(
            <div style={{display:"flex",flexDirection:"column",gap:14}}>
              <div style={{background:"#eff6ff",borderRadius:13,padding:"13px 15px",border:"1.5px solid #bfdbfe",fontSize:13,color:"#1d4ed8",lineHeight:1.6}}>
                 <strong>Spieler in neue Saison kopieren</strong><br/>
                Alle Spieler werden übernommen. Ihr letztes Team wird automatisch als "Letzte Saison" eingetragen. Trikotnummern,Statistiken und Zuteilungen werden zurückgesetzt - so kannst du neu einteilen.
              </div>

              <div>
                <div style={{fontSize:11,fontWeight:800,color:"#64748b",marginBottom:7,letterSpacing:.5}}>VON SAISON</div>
                <select value={copyFrom} onChange={e=>setCopyFrom(e.target.value)}
                  style={{width:"100%",padding:"11px 13px",fontSize:14,border:"1.5px solid #e2e8f0",borderRadius:11,outline:"none",background:"#fff"}}>
                  {seasons.filter(s=>s.status!=="archived").map(s=>(
                    <option key={s.id} value={s.id}>{s.label} ({(allPlayers.filter(p=>p.seasonId===s.id)).length} Spieler)</option>
                  ))}
                </select>
              </div>

              <div>
                <div style={{fontSize:11,fontWeight:800,color:"#64748b",marginBottom:7,letterSpacing:.5}}>IN SAISON</div>
                {planningSeasons.length===0 ? (
                  <div style={{background:"#fff7ed",borderRadius:11,padding:"12px 14px",border:"1.5px solid #fed7aa",fontSize:13,color:"#c2410c"}}>
                     Keine Planungs-Saison vorhanden. Erstelle zuerst eine neue Saison im Tab "* Saisons".
                  </div>
                ) : (
                  <select value={copyTo} onChange={e=>setCopyTo(e.target.value)}
                    style={{width:"100%",padding:"11px 13px",fontSize:14,border:"1.5px solid #e2e8f0",borderRadius:11,outline:"none",background:"#fff"}}>
                    <option value="">- Ziel-Saison wählen -</option>
                    {planningSeasons.map(s=>(
                      <option key={s.id} value={s.id}>{s.label}</option>
                    ))}
                  </select>
                )}
              </div>

              {copyFrom&&copyTo&&(
                <div style={{background:"#f8fafc",borderRadius:12,padding:"12px 14px",border:"1.5px solid #e2e8f0",fontSize:13,color:"#64748b"}}>
                  <strong style={{color:"#334155"}}>{allPlayers.filter(p=>p.seasonId===copyFrom&&myTids.includes(p.mainTid)).length} Spieler</strong> werden kopiert
                  {" -> "}letztes Team vorausgefuellt,Positionen+Stärken übernommen,Zuteilung zurückgesetzt
                </div>
              )}

              <button onClick={()=>copyFrom&&copyTo&&copyToSeason(copyFrom,copyTo)}
                disabled={!copyFrom||!copyTo}
                style={{width:"100%",padding:"14px",borderRadius:14,border:"none",background:copyFrom&&copyTo?t.p:"#e2e8f0",color:copyFrom&&copyTo?"#fff":"#94a3b8",fontWeight:800,fontSize:15,cursor:copyFrom&&copyTo?"pointer":"default",fontFamily:"inherit"}}>
                 Spieler jetzt kopieren
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

const FIELD_SEGMENTS = [
  {id:4,label:"Ganzer Platz",icon:"*",fraction:1},{id:2,label:"Halber Platz",icon:"*",fraction:0.5},{id:1,label:"Viertel",icon:"*",fraction:0.25},{id:0.5,label:"Achtel",icon:".",fraction:0.125},];

function FieldGraphic({ field,bookings,date,onBook,myName,t }) {
  const segs = field.segments || 4; // how many quarter-segments the field has
  const totalSlots = segs; // 4 = full field = 4 quarters
  const dayBookings = bookings.filter(b => b.fieldId === field.id && b.date === date);
  const CELLS = 8; // always 8 cells for max resolution
  const cells = Array.from({length:CELLS},(_,i) => {
    const booking = dayBookings.find(b => {
      const start = b.cellStart || 0;
      const end   = start + (b.cells || CELLS);
      return i >= start && i < end;
    });
    return { idx:i,booking };
  });

  const COLORS = ["#2563eb","#16a34a","#d97706","#7c3aed","#dc2626","#0891b2"];
  const teamColor = (name) => COLORS[Math.abs(name.split('').reduce((a,c)=>a+c.charCodeAt(0),0)) % COLORS.length];
  const bookingBlocks = [];
  dayBookings.forEach(b => {
    const col = t.p;
    bookingBlocks.push({
      ...b,color: teamColor(b.teamName||b.booker||"?"),cells: b.cells || CELLS,cellStart: b.cellStart || 0,});
  });

  return (
    <div>
      <div style={{fontSize:11,fontWeight:800,color:"#64748b",marginBottom:8,letterSpacing:.5}}>PLATZ-AUFTEILUNG</div>
      {}
      <div style={{background:"#16a34a",borderRadius:12,padding:"10px",border:"3px solid #15803d",marginBottom:10,position:"relative"}}>
        {}
        <div style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gridTemplateRows:"1fr 1fr",gap:3,aspectRatio:"3/1"}}>
          {Array.from({length:8},(_,i)=>{
            const bk=dayBookings.find(b=>{const s=b.cellStart||0;const e=s+(b.cells||8);return i>=s&&i<e;});
            const col=bk?teamColor(bk.teamName||bk.booker||"?"):null;
            return (
              <div key={i} style={{background:col||"rgba(255,255,255,.18)",borderRadius:6,display:"flex",alignItems:"center",justifyContent:"center",fontSize:10,fontWeight:700,color:col?"#fff":"rgba(255,255,255,.5)",minHeight:32,border:"1px solid rgba(255,255,255,.15)",cursor:!bk?"pointer":"default",transition:"background .15s"}}
                onClick={()=>!bk&&onBook&&onBook(field,i)}>
                {bk?bk.teamName?.split(" ")[0]?.slice(0,6)||"*":""}
              </div>
            );
          })}
        </div>
        {}
        <div style={{position:"absolute",top:"50%",left:"50%",transform:"translate(-50%,-50%)",width:28,height:28,borderRadius:"50%",border:"2px solid rgba(255,255,255,.3)",pointerEvents:"none"}}/>
      </div>
      {}
      {dayBookings.length>0&&<div style={{display:"flex",flexWrap:"wrap",gap:6}}>
        {dayBookings.map(b=>(
          <div key={b.id} style={{display:"flex",alignItems:"center",gap:5,background:teamColor(b.teamName||b.booker||"?")+"20",borderRadius:8,padding:"4px 10px",border:`1.5px solid ${teamColor(b.teamName||b.booker||"?")}40`}}>
            <div style={{width:10,height:10,borderRadius:3,background:teamColor(b.teamName||b.booker||"?")}}/>
            <span style={{fontSize:12,fontWeight:700,color:"#334155"}}>{b.teamName||b.booker}</span>
            <span style={{fontSize:11,color:"#64748b"}}>{b.timeFrom}-{b.timeTo}</span>
          </div>
        ))}
      </div>}
      {dayBookings.length===0&&<p style={{fontSize:12,color:"rgba(255,255,255,.6)",textAlign:"center",margin:"4px 0 0",background:"rgba(255,255,255,.08)",borderRadius:8,padding:"6px"}}>Keine Buchungen - Zelle antippen um zu buchen</p>}
    </div>
  );
}

function BookingModal({ field,cellStart,date,data,save,fire,cl,myTids,session,onClose }) {
  const t = TH(cl);
  const myTeams = data.teams.filter(tm=>myTids.includes(tm.id));
  const [f,setF] = useState({
    teamId: myTids[0]||"",timeFrom:"09:00",timeTo:"10:00",cells: 2,// how many cells to book (2=quarter,4=half,8=full)
    note:"",});
  const u = p => setF(prev=>({...prev,...p}));

  const SIZES = [
    {cells:2,label:"Viertel (1/4)",icon:"*"},{cells:4,label:"Halber Platz",icon:"*"},{cells:8,label:"Ganzer Platz",icon:"*"},];

  const save2 = () => {
    const tm = data.teams.find(x=>x.id===f.teamId);
    const booking = {
      id: uid(),fieldId: field.id,date,cellStart,cells: f.cells,teamId: f.teamId,teamName: tm?.name||"",booker: session.name||"Trainer",timeFrom: f.timeFrom,timeTo: f.timeTo,note: f.note,cid: field.cid,};
    const next = [...(data.bookings||[]),booking];
    save({...data,bookings:next});
    fire("Platz gebucht *");
    onClose();
  };

  return (
    <div style={{position:"fixed",inset:0,overflowY:"auto",WebkitOverflowScrolling:"touch",background:"rgba(0,0,0,.6)",zIndex:910,display:"flex",alignItems:"flex-end",justifyContent:"center",backdropFilter:"blur(8px)"}}>
      <div style={{background:"#fff",borderRadius:"22px 22px 0 0",width:"100%",maxWidth:520,maxHeight:"80dvh",overflowY:"auto",animation:"down .24s ease"}}>
        <div style={{display:"flex",justifyContent:"center",padding:"12px 0 4px"}}><div style={{width:44,height:4,borderRadius:99,background:"#e2e8f0"}}/></div>
        <div style={{padding:"8px 20px 44px",display:"flex",flexDirection:"column",gap:14}}>
          <div style={{display:"flex",justifyContent:"space-between",alignItems:"center"}}>
            <div><div style={{fontWeight:900,fontSize:18,color:"#0f172a"}}>Platz buchen</div><div style={{fontSize:13,color:"#64748b"}}>{field.name} . {date}</div></div>
            <button onClick={onClose} style={{width:34,height:34,borderRadius:11,background:"#f1f5f9",border:"none",fontSize:17,cursor:"pointer"}}></button>
          </div>
          {}
          <div>
            <div style={{fontSize:11,fontWeight:800,color:"#64748b",marginBottom:7,letterSpacing:.5}}>MANNSCHAFT</div>
            {myTeams.map(tm=>(
              <label key={tm.id} style={{display:"flex",alignItems:"center",gap:10,padding:"10px 13px",borderRadius:12,border:`2px solid ${f.teamId===tm.id?tm.col:"#e2e8f0"}`,background:f.teamId===tm.id?tm.col+"12":"#fafafa",cursor:"pointer",marginBottom:7}}>
                <input type="radio" name="team" checked={f.teamId===tm.id} onChange={()=>u({teamId:tm.id})} style={{accentColor:tm.col}}/>
                <span style={{fontSize:17}}>{tm.icon}</span>
                <span style={{fontWeight:700,fontSize:14,color:f.teamId===tm.id?tm.col:"#334155"}}>{tm.name}</span>
              </label>
            ))}
          </div>
          {}
          <div>
            <div style={{fontSize:11,fontWeight:800,color:"#64748b",marginBottom:7,letterSpacing:.5}}>PLATZGROeSSE</div>
            <div style={{display:"flex",gap:8}}>
              {SIZES.map(s=>(
                <button key={s.cells} onClick={()=>u({cells:s.cells})}
                  style={{flex:1,padding:"10px 8px",borderRadius:12,border:`2px solid ${f.cells===s.cells?t.p:"#e2e8f0"}`,background:f.cells===s.cells?t.p:"#fff",color:f.cells===s.cells?"#fff":"#334155",fontWeight:700,fontSize:12,cursor:"pointer",fontFamily:"inherit",textAlign:"center"}}>
                  <div style={{fontSize:20,marginBottom:3}}>{s.icon}</div>
                  {s.label}
                </button>
              ))}
            </div>
          </div>
          {}
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10}}>
            <div>
              <div style={{fontSize:11,fontWeight:800,color:"#64748b",marginBottom:5}}>VON</div>
              <input type="time" value={f.timeFrom} onChange={e=>u({timeFrom:e.target.value})} style={{width:"100%",padding:"10px 12px",fontSize:14,border:"1.5px solid #e2e8f0",borderRadius:11,outline:"none"}}/>
            </div>
            <div>
              <div style={{fontSize:11,fontWeight:800,color:"#64748b",marginBottom:5}}>BIS</div>
              <input type="time" value={f.timeTo} onChange={e=>u({timeTo:e.target.value})} style={{width:"100%",padding:"10px 12px",fontSize:14,border:"1.5px solid #e2e8f0",borderRadius:11,outline:"none"}}/>
            </div>
          </div>
          <div>
            <div style={{fontSize:11,fontWeight:800,color:"#64748b",marginBottom:5}}>NOTIZ (optional)</div>
            <input value={f.note} onChange={e=>u({note:e.target.value})} placeholder="z.B. Training,Heimspiel..."
              style={{width:"100%",padding:"10px 13px",fontSize:14,border:"1.5px solid #e2e8f0",borderRadius:11,outline:"none"}}/>
          </div>
          <button onClick={save2} disabled={!f.teamId}
            style={{width:"100%",padding:"14px",borderRadius:14,border:"none",background:f.teamId?t.p:"#e2e8f0",color:f.teamId?"#fff":"#94a3b8",fontWeight:800,fontSize:15,cursor:f.teamId?"pointer":"default",fontFamily:"inherit",boxShadow:f.teamId?`0 4px 16px ${t.p}44`:"none"}}>
            Platz buchen
          </button>
        </div>
      </div>
    </div>
  );
}

function TrainerCard({ tr, data, onEdit, onDelete, onContact }) {
  const myTeams = (data.teams||[]).filter(tm=>(tr.tids||[]).includes(tm.id));
  const playerCount = myTeams.reduce((s,tm)=>s+(data.playerProfiles||[]).filter(p=>p.mainTid===tm.id).length,0);
  const myEvents = (data.events||[]).filter(e=>(tr.tids||[]).includes(e.tid));
  const eventCount = myEvents.length;
  // Avg attendance: count votes "yes" per training event
  const trainings = myEvents.filter(e=>e.type==="training");
  const avgAttend = trainings.length>0
    ? Math.round(trainings.reduce((s,e)=>s+Object.values(e.votes||{}).filter(v=>v==="yes").length,0)/trainings.length)
    : 0;
  return (
    <div style={{background:"#fff",borderRadius:16,border:"1.5px solid #e2e8f0",overflow:"hidden",marginBottom:10}}>
      <div style={{padding:"14px 16px",display:"flex",alignItems:"center",gap:12}}>
        <Av name={tr.name} sz={48}/>
        <div style={{flex:1}}>
          <div style={{fontWeight:900,fontSize:16,color:"#0f172a"}}>{tr.name}</div>
          <div style={{fontSize:12,color:"#64748b",marginTop:2}}>
            {myTeams.length>0 ? myTeams.map(tm=>tm.name).join(", ") : "Keine Teams zugewiesen"}
          </div>
        </div>
        <div style={{display:"flex",gap:6}}>
          {onContact&&<button onClick={onContact}
          style={{width:30,height:30,borderRadius:9,background:"#f0fdf4",
            border:"none",color:"#16a34a",cursor:"pointer",fontSize:13,fontWeight:700}}>K</button>}
        {onEdit&&<button onClick={onEdit} style={{width:30,height:30,borderRadius:9,background:"#eff6ff",border:"none",color:"#2563eb",cursor:"pointer",fontSize:13,fontWeight:700}}>E</button>}
          {onDelete&&<button onClick={onDelete} style={{width:30,height:30,borderRadius:9,background:"#fee2e2",border:"none",color:"#dc2626",cursor:"pointer",fontSize:13,fontWeight:700}}>X</button>}
        </div>
      </div>
      <div style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",borderTop:"1px solid #f1f5f9"}}>
        {[[playerCount,"Spieler"],[eventCount,"Termine"],[avgAttend," Anwesend"]].map(([v,l])=>(
          <div key={l} style={{padding:"10px 0",textAlign:"center",borderRight:"1px solid #f1f5f9"}}>
            <div style={{fontWeight:900,fontSize:18,color:"#334155",lineHeight:1}}>{v}</div>
            <div style={{fontSize:10,color:"#94a3b8",fontWeight:600,marginTop:2}}>{l}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

function TrainersTab({data,cid,save,fire,session}) {
  const [showContactSetup, setShowContactSetup] = React.useState(null);
  const [showBroadcast, setShowBroadcast] = useState(false);
  const [showGroupHelper, setShowGroupHelper] = useState(false);
  const myTeams = (data.teams||[]).filter(x=>x.cid===cid);
  const myTrs   = (data.trainers||[]).filter(x=>x.cid===cid);
  const [showForm, setShowForm] = useState(false);
  const [editId,   setEditId]   = useState(null);
  const [f, setF] = useState({name:"",pw:"",tids:[],phone:"",email:""});
  const u = p => setF(prev=>({...prev,...p}));
  const cl = (data.clubs||[]).find(x=>x.id===cid)||{pri:"#16a34a"};

  const openNew  = () => { setF({name:"",pw:"",tids:[],phone:"",email:""}); setEditId(null); setShowForm(true); };
  const openEdit = tr => { setF({...tr,pw:""}); setEditId(tr.id); setShowForm(true); };
  const del      = id => { save({...data,trainers:(data.trainers||[]).filter(x=>x.id!==id)}); fire("Entfernt"); };

  const saveF = () => {
    if(!f.name.trim()||(!editId&&!f.pw.trim())) return;
    const pw = f.pw.trim() ? hashPw(f.pw.trim()) : (myTrs.find(x=>x.id===editId)?.pw||"");
    const rec = {...f, id:editId||uid(), cid, pw};
    const next = editId ? (data.trainers||[]).map(x=>x.id===editId?rec:x) : [...(data.trainers||[]),rec];
    save({...data,trainers:next});
    setShowForm(false);
    fire(editId?"Trainer aktualisiert":"Trainer hinzugefügt");
  };

  return (
    <div>
      <TrainerStatsView data={data} cid={cid}/>
      {showBroadcast&&<BroadcastModal data={data} cid={cid} session={session} save={save} fire={fire} onClose={()=>setShowBroadcast(false)}/>}
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:14}}>
        <div><p style={{fontWeight:900,fontSize:16,color:"#0f172a",margin:0}}>Trainer</p><p style={{fontSize:12,color:"#64748b",marginTop:2,margin:0}}>{myTrs.length} gesamt</p></div>
        <div style={{display:"flex",gap:8}}>
          <button onClick={()=>setShowGroupHelper(true)}
            style={{padding:"9px 12px",borderRadius:11,border:"1.5px solid #25D366",background:"#f0fdf4",fontWeight:700,fontSize:11,cursor:"pointer",fontFamily:"inherit",color:"#166534"}}>WA Gruppe</button>
          <button onClick={()=>setShowBroadcast(true)} style={{padding:"9px 14px",borderRadius:11,border:"1.5px solid #e2e8f0",background:"#fff",fontWeight:700,fontSize:12,cursor:"pointer",fontFamily:"inherit",color:"#475569"}}>Rundschreiben</button>
          <button onClick={openNew} style={{padding:"9px 16px",borderRadius:11,border:"none",background:"#16a34a",color:"#fff",fontWeight:700,fontSize:13,cursor:"pointer",fontFamily:"inherit"}}>+ Neuer Trainer</button>
        </div>
      </div>
      {myTrs.length===0&&!showForm&&(
        <div style={{textAlign:"center",padding:"32px",background:"#f8fafc",borderRadius:14,border:"1.5px dashed #e2e8f0"}}>
          <p style={{fontWeight:700,color:"#334155",margin:"0 0 4px"}}>Noch keine Trainer angelegt</p>
          <p style={{fontSize:13,color:"#94a3b8",margin:0}}>Trainer können hier angelegt und Teams zugewiesen werden.</p>
        </div>
      )}
      {myTrs.map(tr=><TrainerCard key={tr.id} tr={tr} data={data} onContact={()=>setShowContactSetup(tr)} onEdit={()=>openEdit(tr)} onDelete={()=>del(tr.id)}/>)}
      {showForm&&(
        <div style={{position:"fixed",inset:0,background:"rgba(0,0,0,.55)",zIndex:800,display:"flex",alignItems:"flex-end",justifyContent:"center"}}>
          <div style={{background:"#fff",borderRadius:"22px 22px 0 0",width:"100%",maxWidth:520,maxHeight:"90dvh",overflowY:"auto",padding:"20px 22px 48px"}}>
            <h3 style={{fontWeight:900,fontSize:18,color:"#0f172a",marginBottom:16}}>{editId?"Trainer bearbeiten":"Neuen Trainer anlegen"}</h3>
            <div style={{display:"flex",flexDirection:"column",gap:10}}>
              <input value={f.name} onChange={e=>u({name:e.target.value})} placeholder="Name des Trainers"
                style={{padding:"11px 14px",fontSize:14,border:"1.5px solid #e2e8f0",borderRadius:11,outline:"none"}}/>
              <input type="password" value={f.pw} onChange={e=>u({pw:e.target.value})} placeholder={editId?"Neues Passwort (leer = unverändert)":"Passwort"}
                style={{padding:"11px 14px",fontSize:14,border:"1.5px solid #e2e8f0",borderRadius:11,outline:"none"}}/>
              <input value={f.phone||""} onChange={e=>u({phone:e.target.value})} placeholder="Telefon (optional)"
                style={{padding:"11px 14px",fontSize:14,border:"1.5px solid #e2e8f0",borderRadius:11,outline:"none"}}/>
              <div style={{fontSize:11,fontWeight:800,color:"#64748b",marginTop:4}}>MANNSCHAFTEN</div>
              {myTeams.map(tm=>(
                <label key={tm.id} style={{display:"flex",alignItems:"center",gap:10,padding:"10px 13px",borderRadius:12,border:`1.5px solid ${f.tids.includes(tm.id)?tm.col:"#e2e8f0"}`,background:f.tids.includes(tm.id)?tm.col+"12":"#fafafa",cursor:"pointer"}}>
                  <input type="checkbox" checked={f.tids.includes(tm.id)} onChange={e=>u({tids:e.target.checked?[...f.tids,tm.id]:f.tids.filter(x=>x!==tm.id)})} style={{width:17,height:17,accentColor:tm.col}}/>
                  <span style={{fontWeight:700,fontSize:14}}>{tm.name}</span>
                </label>
              ))}
            </div>
            <div style={{display:"flex",gap:9,marginTop:16}}>
              <button onClick={()=>setShowForm(false)} style={{flex:1,padding:"12px",borderRadius:12,border:"1.5px solid #e2e8f0",background:"#fff",fontWeight:700,cursor:"pointer",fontFamily:"inherit"}}>Abbrechen</button>
              <button onClick={saveF} disabled={!f.name.trim()||(!editId&&!f.pw.trim())} style={{flex:2,padding:"12px",borderRadius:12,border:"none",background:(f.name.trim()&&(editId||f.pw.trim()))?"#16a34a":"#e2e8f0",color:(f.name.trim()&&(editId||f.pw.trim()))?"#fff":"#94a3b8",fontWeight:800,cursor:"pointer",fontFamily:"inherit"}}>Speichern</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}


function FieldsTab({ data,myTids,session,save,fire,cl }) {
  const t = TH(cl);
  const cid = (data.teams||[]).find(tm=>myTids.includes(tm.id))?.cid;
  const fields = (data.fields||[]).filter(f=>f.cid===cid);
  const bookings = data.bookings||[];
  const [selDate,setSelDate] = useState(new Date().toISOString().slice(0,10));
  const [bookTarget,setBookTarget] = useState(null);
  const dayBk = fid => bookings.filter(b=>b.fieldId===fid&&b.date===selDate);
  const myTeams = (data.teams||[]).filter(tm=>myTids.includes(tm.id));
  const COLORS = ["#2563eb","#16a34a","#d97706","#7c3aed","#dc2626"];
  const tCol = name => COLORS[Math.abs((name||"").split("").reduce((a,c)=>a+c.charCodeAt(0),0))%COLORS.length];
  const cancelBk = id => { save({...data,bookings:bookings.filter(b=>b.id!==id)}); fire("Buchung gelöscht"); };
  const addBk = (field,teamId,cells,timeFrom,timeTo) => {
    const tm = myTeams.find(x=>x.id===teamId);
    const bk = {id:uid(),fieldId:field.id,date:selDate,cellStart:0,cells,teamId,teamName:tm?.name||"",booker:session?.name||"",timeFrom,timeTo,cid:field.cid};
    save({...data,bookings:[...bookings,bk]});
    fire("Platz gebucht");
    setBookTarget(null);
  };
  return (
    <div>
      <div style={{background:"#fff",borderRadius:16,padding:14,border:"1.5px solid #e2e8f0",marginBottom:14,display:"flex",alignItems:"center",gap:10}}>
        <button onClick={()=>{const d=new Date(selDate+"T12:00:00");d.setDate(d.getDate()-1);setSelDate(d.toISOString().slice(0,10));}} style={{width:32,height:32,borderRadius:9,border:"1.5px solid #e2e8f0",background:"#fff",cursor:"pointer",fontSize:18}}>&#8249;</button>
        <input type="date" value={selDate} onChange={e=>setSelDate(e.target.value)} style={{flex:1,padding:"7px 10px",fontSize:13,border:"1.5px solid #e2e8f0",borderRadius:9,outline:"none"}}/>
        <button onClick={()=>{const d=new Date(selDate+"T12:00:00");d.setDate(d.getDate()+1);setSelDate(d.toISOString().slice(0,10));}} style={{width:32,height:32,borderRadius:9,border:"1.5px solid #e2e8f0",background:"#fff",cursor:"pointer",fontSize:18}}>&#8250;</button>
      </div>
      {bookTarget&&(
        <div style={{position:"fixed",inset:0,overflowY:"auto",WebkitOverflowScrolling:"touch",background:"rgba(0,0,0,.6)",zIndex:910,display:"flex",alignItems:"flex-end",justifyContent:"center"}}>
          <div style={{background:"#fff",borderRadius:"22px 22px 0 0",width:"100%",maxWidth:520,padding:"20px 22px 44px"}}>
            <h3 style={{fontWeight:900,fontSize:18,marginBottom:16}}>Platz buchen - {bookTarget.name}</h3>
            {(()=>{
              const [sel,setSel]=React.useState({teamId:myTeams[0]?.id||"",cells:4,from:"09:00",to:"10:00"});
              return <>
                <div style={{display:"flex",flexDirection:"column",gap:10}}>
                  <select value={sel.teamId} onChange={e=>setSel(p=>({...p,teamId:e.target.value}))} style={{padding:"10px 13px",fontSize:14,border:"1.5px solid #e2e8f0",borderRadius:11,outline:"none"}}>
                    {myTeams.map(tm=><option key={tm.id} value={tm.id}>{tm.name}</option>)}
                  </select>
                  <div style={{display:"flex",gap:8}}>
                    {[[2,"Viertel"],[4,"Halb"],[8,"Ganz"]].map(([cells,lbl])=>(
                      <button key={cells} onClick={()=>setSel(p=>({...p,cells}))} style={{flex:1,padding:"10px",borderRadius:11,border:`2px solid ${sel.cells===cells?t.p:"#e2e8f0"}`,background:sel.cells===cells?t.p:"#fff",color:sel.cells===cells?"#fff":"#334155",fontWeight:700,fontSize:12,cursor:"pointer",fontFamily:"inherit"}}>{lbl}</button>
                    ))}
                  </div>
                  <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10}}>
                    <input type="time" value={sel.from} onChange={e=>setSel(p=>({...p,from:e.target.value}))} style={{padding:"10px 13px",fontSize:14,border:"1.5px solid #e2e8f0",borderRadius:11,outline:"none"}}/>
                    <input type="time" value={sel.to} onChange={e=>setSel(p=>({...p,to:e.target.value}))} style={{padding:"10px 13px",fontSize:14,border:"1.5px solid #e2e8f0",borderRadius:11,outline:"none"}}/>
                  </div>
                </div>
                <div style={{display:"flex",gap:9,marginTop:16}}>
                  <button onClick={()=>setBookTarget(null)} style={{flex:1,padding:"12px",borderRadius:12,border:"1.5px solid #e2e8f0",background:"#fff",fontWeight:700,cursor:"pointer",fontFamily:"inherit"}}>Abbrechen</button>
                  <button onClick={()=>addBk(bookTarget,sel.teamId,sel.cells,sel.from,sel.to)} style={{flex:2,padding:"12px",borderRadius:12,border:"none",background:t.p,color:"#fff",fontWeight:800,cursor:"pointer",fontFamily:"inherit"}}>Buchen</button>
                </div>
              </>;
            })()}
          </div>
        </div>
      )}
      {fields.length===0&&<div style={{textAlign:"center",padding:"32px",background:"#f8fafc",borderRadius:14,border:"1.5px dashed #e2e8f0"}}><p style={{fontWeight:700,color:"#334155"}}>Keine Plaetze konfiguriert</p><p style={{fontSize:13,color:"#94a3b8",marginTop:4}}>Plaetze können im Admin-Bereich angelegt werden.</p></div>}
      {fields.map(field=>(
        <div key={field.id} style={{background:"#fff",borderRadius:16,border:"1.5px solid #e2e8f0",marginBottom:14,overflow:"hidden"}}>
          <div style={{padding:"12px 16px",borderBottom:"1px solid #f1f5f9",display:"flex",alignItems:"center",gap:10}}>
            <div style={{flex:1}}><div style={{fontWeight:800,fontSize:15}}>{field.name}</div><div style={{fontSize:12,color:"#64748b"}}>{field.surface} - {dayBk(field.id).length} Buchung(en)</div></div>
            <button onClick={()=>setBookTarget(field)} style={{padding:"7px 14px",borderRadius:10,border:"none",background:t.p,color:"#fff",fontWeight:700,fontSize:13,cursor:"pointer",fontFamily:"inherit"}}>+ Buchen</button>
          </div>
          <div style={{padding:14}}>
            <div style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:3,background:"#16a34a",borderRadius:10,padding:8}}>
              {Array.from({length:8},(_,i)=>{
                const bk=dayBk(field.id).find(b=>{const s=b.cellStart||0;return i>=s&&i<s+(b.cells||8);});
                return <div key={i} style={{background:bk?tCol(bk.teamName):"rgba(255,255,255,.2)",borderRadius:5,minHeight:32,display:"flex",alignItems:"center",justifyContent:"center",fontSize:10,fontWeight:700,color:bk?"#fff":"rgba(255,255,255,.4)"}}>{bk?bk.teamName?.slice(0,5):""}</div>;
              })}
            </div>
          </div>
          {dayBk(field.id).length>0&&<div style={{padding:"0 16px 14px",display:"flex",flexDirection:"column",gap:6}}>
            {dayBk(field.id).map(b=>(
              <div key={b.id} style={{display:"flex",alignItems:"center",gap:10,background:"#f8fafc",borderRadius:11,padding:"9px 13px"}}>
                <div style={{width:10,height:10,borderRadius:"50%",background:tCol(b.teamName)}}/>
                <div style={{flex:1}}><div style={{fontWeight:700,fontSize:13}}>{b.teamName}</div><div style={{fontSize:11,color:"#64748b"}}>{b.timeFrom}-{b.timeTo}</div></div>
                <button onClick={()=>cancelBk(b.id)} style={{width:26,height:26,borderRadius:7,background:"#fee2e2",border:"none",color:"#dc2626",cursor:"pointer",fontSize:12,fontWeight:800}}>X</button>
              </div>
            ))}
          </div>}
        </div>
      ))}
    </div>
  );
}





function FieldConflictWarner({ fieldId, date, time, duration, bookings, fields, myTid, onResolve }) {
  if(!fieldId || !date) return null;
  const conflicts = (bookings||[]).filter(b=>
    b.fieldId===fieldId && b.date===date && b.teamId!==myTid
  );
  if(conflicts.length===0) return null;
  const field = (fields||[]).find(f=>f.id===fieldId);
  return (
    <div style={{background:"#fef3c7",borderRadius:13,padding:"12px 14px",border:"2px solid #f59e0b",marginTop:10}}>
      <div style={{fontWeight:800,fontSize:13,color:"#92400e",marginBottom:8}}>
        Konflikt: {field?.name||"Platz"} an diesem Tag bereits belegt!
      </div>
      {conflicts.map(bk=>(
        <div key={bk.id} style={{display:"flex",alignItems:"center",gap:10,marginBottom:7,background:"rgba(255,255,255,.6)",borderRadius:9,padding:"8px 12px"}}>
          <div style={{flex:1}}>
            <div style={{fontWeight:700,fontSize:12,color:"#334155"}}>{bk.teamName}</div>
            <div style={{fontSize:11,color:"#64748b"}}>{bk.timeFrom} - {bk.timeTo}</div>
          </div>
          <button onClick={()=>onResolve&&onResolve(bk)}
            style={{padding:"5px 12px",borderRadius:8,border:"none",background:"#f59e0b",color:"#fff",fontWeight:700,fontSize:11,cursor:"pointer",fontFamily:"inherit"}}>
            Anfrage senden
          </button>
        </div>
      ))}
    </div>
  );
}

function FieldConflictResolver({ conflict, myTeam, data, save, fire, onClose }) {
  const [msg, setMsg] = useState("");
  const [decision, setDecision] = useState(null); // "keep" | "yield"
  const sendRequest = () => {
    const req = {
      id: uid(), type:"field_conflict",
      fromTeam: myTeam?.id, fromTeamName: myTeam?.name||"",
      toTeam: conflict.teamId, toTeamName: conflict.teamName,
      fieldId: conflict.fieldId, date: conflict.date,
      msg: msg||"Wir wuerden gerne denselben Platz nutzen. Können wir uns einigen?",
      ts: new Date().toISOString(), status:"pending",
      bookingId: conflict.id,
    };
    save({...data, contactRequests:[...(data.contactRequests||[]),req]});
    fire("Anfrage an "+conflict.teamName+" gesendet");
    onClose();
  };
  return (
    <div style={{position:"fixed",inset:0,overflowY:"auto",WebkitOverflowScrolling:"touch",background:"rgba(0,0,0,.6)",zIndex:920,display:"flex",alignItems:"flex-end",justifyContent:"center"}}>
      <div style={{background:"#fff",borderRadius:"22px 22px 0 0",width:"100%",maxWidth:520,padding:"20px 22px 44px"}}>
        <h3 style={{fontWeight:900,fontSize:17,marginBottom:4}}>Platz-Konflikt loesen</h3>
        <p style={{fontSize:13,color:"#64748b",marginBottom:16}}>
          {conflict.teamName} hat denselben Platz am {conflict.date} gebucht ({conflict.timeFrom}-{conflict.timeTo}).
        </p>
        <div style={{display:"flex",gap:9,marginBottom:14}}>
          <button onClick={()=>setDecision("request")}
            style={{flex:1,padding:"11px",borderRadius:12,border:`2px solid ${decision==="request"?"#2563eb":"#e2e8f0"}`,background:decision==="request"?"#eff6ff":"#fff",color:decision==="request"?"#2563eb":"#475569",fontWeight:700,fontSize:13,cursor:"pointer",fontFamily:"inherit"}}>
            Anfrage senden
          </button>
          <button onClick={()=>setDecision("yield")}
            style={{flex:1,padding:"11px",borderRadius:12,border:`2px solid ${decision==="yield"?"#16a34a":"#e2e8f0"}`,background:decision==="yield"?"#f0fdf4":"#fff",color:decision==="yield"?"#16a34a":"#475569",fontWeight:700,fontSize:13,cursor:"pointer",fontFamily:"inherit"}}>
            Ich weiche aus
          </button>
        </div>
        {decision==="request"&&<>
          <textarea value={msg} onChange={e=>setMsg(e.target.value)}
            placeholder="Nachricht an das andere Team..."
            rows={3} style={{width:"100%",padding:"11px 14px",fontSize:13,border:"1.5px solid #e2e8f0",borderRadius:11,outline:"none",resize:"none",fontFamily:"inherit",boxSizing:"border-box",marginBottom:12}}/>
          <button onClick={sendRequest}
            style={{width:"100%",padding:"12px",borderRadius:12,border:"none",background:"#2563eb",color:"#fff",fontWeight:800,fontSize:14,cursor:"pointer",fontFamily:"inherit"}}>
            Anfrage senden
          </button>
        </>}
        {decision==="yield"&&<>
          <p style={{fontSize:13,color:"#16a34a",marginBottom:12}}>OK - du buchst einen anderen Platz oder eine andere Zeit.</p>
          <button onClick={onClose}
            style={{width:"100%",padding:"12px",borderRadius:12,border:"none",background:"#16a34a",color:"#fff",fontWeight:800,fontSize:14,cursor:"pointer",fontFamily:"inherit"}}>
            Verstanden
          </button>
        </>}
        <button onClick={onClose} style={{marginTop:10,width:"100%",padding:"10px",borderRadius:11,border:"none",background:"none",color:"#94a3b8",fontSize:13,cursor:"pointer",fontFamily:"inherit"}}>Abbrechen</button>
      </div>
    </div>
  );
}

/* =================================================================
   DATENSCHUTZ-SYSTEM
   - Einwilligungsverwaltung für Bilder
   - Sichere Kontaktdaten (nie in DB)
   - Team-Karte mit Datenschutz-Badge
================================================================= */

// Einwilligungs-Storage (nur lokal, nie in Supabase)
const ConsentStore = {
  // Speichert Einwilligung: {teamId_type: {given: bool, ts: timestamp, by: name}}
  get: (teamId, type) => {
    try {
      const key = "consent_"+teamId+"_"+type;
      return JSON.parse(localStorage.getItem(key)||"null");
    } catch { return null; }
  },
  set: (teamId, type, data) => {
    try {
      const key = "consent_"+teamId+"_"+type;
      localStorage.setItem(key, JSON.stringify({...data, ts:Date.now()}));
    } catch {}
  },
  revoke: (teamId, type) => {
    try { localStorage.removeItem("consent_"+teamId+"_"+type); } catch {}
  },
  // Kontaktdaten: nur lokal, nie in DB
  setContact: (trainerId, phone) => {
    try {
      // Store phone only in local browser - never synced to DB
      localStorage.setItem("contact_"+trainerId, phone);
    } catch {}
  },
  getContact: (trainerId) => {
    try { return localStorage.getItem("contact_"+trainerId)||null; } catch { return null; }
  },
  clearContact: (trainerId) => {
    try { localStorage.removeItem("contact_"+trainerId); } catch {}
  },
};

// Consent-Anfrage für Mannschaftsbild
function ConsentRequest({ team, players, trainers, onConsent, onDecline, cl }) {
  const t = TH(cl);
  const [checked, setChecked] = React.useState(false);
  const [name, setName] = React.useState("");
  const [role, setRole] = React.useState("eltern"); // eltern | trainer | admin

  const submit = () => {
    if(!checked || !name.trim()) return;
    onConsent({
      givenBy: name.trim(),
      role,
      ts: Date.now(),
      teamId: team.id,
    });
  };

  return (
    <div style={{position:"fixed",inset:0,overflowY:"auto",WebkitOverflowScrolling:"touch",background:"rgba(0,0,0,.6)",zIndex:900,
      display:"flex",alignItems:"flex-end",justifyContent:"center",backdropFilter:"blur(6px)"}}>
      <div style={{background:"#fff",borderRadius:"22px 22px 0 0",width:"100%",maxWidth:520,
        padding:"24px 22px 48px",maxHeight:"85dvh",overflowY:"auto"}}>

        <div style={{display:"flex",justifyContent:"center",marginBottom:16}}>
          <div style={{width:48,height:48,borderRadius:14,background:"#eff6ff",
            display:"flex",alignItems:"center",justifyContent:"center",
            fontWeight:900,fontSize:20,color:"#2563eb"}}>i</div>
        </div>

        <h2 style={{fontWeight:900,fontSize:19,color:"#0f172a",textAlign:"center",marginBottom:8}}>
          Einwilligung Mannschaftsbild
        </h2>
        <p style={{fontSize:14,color:"#64748b",textAlign:"center",lineHeight:1.6,marginBottom:20}}>
          Gemäß DSGVO Art. 6 benötigen wir die Einwilligung aller abgebildeten Personen
          bzw. deren Erziehungsberechtigten.
        </p>

        <div style={{background:"#f0fdf4",borderRadius:14,padding:"14px 16px",
          border:"1.5px solid #bbf7d0",marginBottom:20}}>
          <div style={{fontWeight:800,fontSize:13,color:"#166534",marginBottom:8}}>
            Was passiert mit dem Bild?
          </div>
          <div style={{fontSize:13,color:"#166534",lineHeight:1.7}}>
            Das Bild wird ausschließlich in dieser App für die Mannschaft {team.name} verwendet.
            Es wird nicht an Dritte weitergegeben, nicht auf Social Media geteilt
            und kann jederzeit gelöscht werden.
          </div>
        </div>

        <div style={{display:"flex",flex:"column",gap:10,marginBottom:16}}>
          <div style={{fontSize:11,fontWeight:800,color:"#64748b",marginBottom:6}}>
            ICH BIN
          </div>
          <div style={{display:"flex",gap:8}}>
            {[["eltern","Elternteil"],["trainer","Trainer"],["admin","Admin"]].map(([v,l])=>(
              <button key={v} onClick={()=>setRole(v)}
                style={{flex:1,padding:"9px",borderRadius:10,
                  border:`2px solid ${role===v?t.p:"#e2e8f0"}`,
                  background:role===v?t.p:"#fff",
                  color:role===v?"#fff":"#475569",
                  fontWeight:700,fontSize:12,cursor:"pointer",fontFamily:"inherit"}}>
                {l}
              </button>
            ))}
          </div>
        </div>

        <input
          value={name} onChange={e=>setName(e.target.value)}
          placeholder="Vor- und Nachname (wird als Einwilligung gespeichert)"
          style={{width:"100%",padding:"12px 14px",fontSize:14,
            border:"1.5px solid #e2e8f0",borderRadius:12,outline:"none",
            marginBottom:14,boxSizing:"border-box"}}
        />

        <label style={{display:"flex",alignItems:"flex-start",gap:10,
          cursor:"pointer",marginBottom:20,padding:"12px 14px",
          background:"#f8fafc",borderRadius:12,border:"1.5px solid #e2e8f0"}}>
          <input type="checkbox" checked={checked} onChange={e=>setChecked(e.target.checked)}
            style={{width:18,height:18,marginTop:2,accentColor:t.p,flexShrink:0}}/>
          <span style={{fontSize:13,color:"#334155",lineHeight:1.6}}>
            Ich willige ein, dass das Mannschaftsbild von {team.name} in der Vereins-App
            angezeigt wird. Ich kann diese Einwilligung jederzeit widerrufen.
          </span>
        </label>

        <button onClick={submit} disabled={!checked||!name.trim()}
          style={{width:"100%",padding:"14px",borderRadius:14,border:"none",
            background:checked&&name.trim()?t.p:"#e2e8f0",
            color:checked&&name.trim()?"#fff":"#94a3b8",
            fontWeight:800,fontSize:15,cursor:checked&&name.trim()?"pointer":"default",
            fontFamily:"inherit",marginBottom:10}}>
          Einwilligung geben
        </button>
        <button onClick={onDecline}
          style={{width:"100%",padding:"11px",border:"none",background:"none",
            color:"#94a3b8",fontSize:13,cursor:"pointer",fontFamily:"inherit"}}>
          Abbrechen - kein Bild hochladen
        </button>
      </div>
    </div>
  );
}

// Team-Karte mit Datenschutz
function TeamCard({ team, data, session, cl, onClose }) {
  const t = TH(cl);
  const trainers = (data.trainers||[]).filter(tr=>(tr.tids||[]).includes(team.id));
  const players = (data.playerProfiles||[]).filter(p=>p.mainTid===team.id&&!p.archived);
  const events = (data.events||[]).filter(e=>e.tid===team.id);
  const upcomingEvents = events.filter(e=>e.date>=new Date().toISOString().slice(0,10)).slice(0,3);

  const [photo, setPhoto] = React.useState(null);
  const [showConsent, setShowConsent] = React.useState(false);
  const [consent, setConsent] = React.useState(()=>ConsentStore.get(team.id,"teamphoto"));
  const fileRef = React.useRef(null);

  const canShowPhoto = photo && consent?.given;
  const isTrainer = session?.role==="trainer" || session?.role==="admin";

  const handlePhotoUpload = (e) => {
    const file = e.target.files?.[0];
    if(!file) return;
    if(!consent) {
      setShowConsent(true);
      return;
    }
    const reader = new FileReader();
    reader.onload = ev => {
      const b64 = ev.target.result;
      localStorage.setItem("teamphoto_"+team.id, b64);
      setPhoto(b64);
    };
    reader.readAsDataURL(file);
  };

  const grantConsent = (consentData) => {
    const c = {...consentData, given:true};
    ConsentStore.set(team.id, "teamphoto", c);
    setConsent(c);
    setShowConsent(false);
    fileRef.current?.click();
  };

  const revokeConsent = () => {
    ConsentStore.revoke(team.id, "teamphoto");
    localStorage.removeItem("teamphoto_"+team.id);
    setConsent(null);
    setPhoto(null);
  };

  React.useEffect(()=>{
    const stored = localStorage.getItem("teamphoto_"+team.id);
    if(stored) setPhoto(stored);
  },[team.id]);

  return (
    <div style={{position:"fixed",inset:0,overflowY:"auto",WebkitOverflowScrolling:"touch",background:"rgba(0,0,0,.6)",zIndex:850,
      display:"flex",alignItems:"flex-end",justifyContent:"center",backdropFilter:"blur(6px)"}}>
      {showConsent&&<ConsentRequest
        team={team} players={players} trainers={trainers} cl={cl}
        onConsent={grantConsent}
        onDecline={()=>setShowConsent(false)}
      />}
      <div style={{background:"#fff",borderRadius:"22px 22px 0 0",width:"100%",
        maxWidth:520,maxHeight:"90dvh",overflowY:"auto"}}>

        {/* Team Header */}
        <div style={{background:`linear-gradient(135deg,${t.s||"#0f172a"},${t.p})`,
          padding:"20px 22px 16px",position:"relative"}}>
          <button onClick={onClose}
            style={{position:"absolute",top:16,right:16,width:32,height:32,
              borderRadius:10,background:"rgba(255,255,255,.15)",border:"none",
              color:"#fff",cursor:"pointer",fontSize:16,fontWeight:700}}>
            x
          </button>

          {/* Team Photo */}
          <div style={{display:"flex",alignItems:"center",gap:14,marginBottom:12}}>
            <div style={{width:64,height:64,borderRadius:16,overflow:"hidden",
              background:"rgba(255,255,255,.15)",border:"2px solid rgba(255,255,255,.3)",
              display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0,cursor:isTrainer?"pointer":"default"}}
              onClick={isTrainer?()=>fileRef.current?.click():undefined}>
              {canShowPhoto
                ? <img src={photo} alt="" style={{width:"100%",height:"100%",objectFit:"cover"}}/>
                : <span style={{fontWeight:900,fontSize:24,color:"rgba(255,255,255,.7)"}}>{team.icon||team.name?.slice(0,2)}</span>
              }
            </div>
            <div style={{flex:1}}>
              <div style={{color:"#fff",fontWeight:900,fontSize:22}}>{team.name}</div>
              <div style={{color:"rgba(255,255,255,.6)",fontSize:13,marginTop:2}}>
                {players.length} Spieler  {upcomingEvents.length} Termine
              </div>
            </div>
          </div>

          {/* Photo Controls */}
          {isTrainer&&(
            <div style={{display:"flex",gap:8}}>
              <input ref={fileRef} type="file" accept="image/*" onChange={handlePhotoUpload} style={{display:"none"}}/>
              {!canShowPhoto&&(
                <button onClick={()=>fileRef.current?.click()}
                  style={{padding:"6px 14px",borderRadius:9,border:"1.5px solid rgba(255,255,255,.3)",
                    background:"rgba(255,255,255,.1)",color:"rgba(255,255,255,.8)",
                    fontWeight:700,fontSize:12,cursor:"pointer",fontFamily:"inherit"}}>
                  + Mannschaftsbild
                </button>
              )}
              {consent&&(
                <div style={{display:"flex",alignItems:"center",gap:6,
                  background:"rgba(255,255,255,.1)",borderRadius:9,padding:"5px 10px"}}>
                  <span style={{fontSize:10,color:"rgba(255,255,255,.6)",fontWeight:700}}>
                    Einwilligung: {consent.givenBy}
                  </span>
                  <button onClick={revokeConsent}
                    style={{background:"rgba(255,0,0,.3)",border:"none",borderRadius:5,
                      color:"#fff",fontSize:10,cursor:"pointer",padding:"2px 6px",fontFamily:"inherit"}}>
                    Widerrufen
                  </button>
                </div>
              )}
            </div>
          )}
        </div>

        <div style={{padding:"16px 20px 40px"}}>

          {/* Datenschutz Hinweis wenn kein Bild */}
          {!canShowPhoto&&(
            <div style={{background:"#eff6ff",borderRadius:12,padding:"10px 14px",
              border:"1px solid #bfdbfe",marginBottom:16,fontSize:12,color:"#1d4ed8",lineHeight:1.5}}>
              Mannschaftsbild: Einwilligung aller Eltern/Erziehungsberechtigten erforderlich.
              {isTrainer&&" Klicke auf das Team-Logo um ein Bild hochzuladen."}
            </div>
          )}

          {/* Trainer Kontakt - OHNE Nummer anzuzeigen */}
          {trainers.length>0&&(
            <div style={{marginBottom:16}}>
              <div style={{fontSize:11,fontWeight:800,color:"#64748b",marginBottom:8,letterSpacing:.5}}>
                TRAINER
              </div>
              {trainers.map(tr=>{
                const localPhone = ConsentStore.getContact(tr.id);
                return (
                  <div key={tr.id} style={{background:"#f8fafc",borderRadius:13,
                    padding:"12px 14px",border:"1px solid #e2e8f0",marginBottom:8,
                    display:"flex",alignItems:"center",gap:12}}>
                    <Av name={tr.name} sz={42}/>
                    <div style={{flex:1}}>
                      <div style={{fontWeight:700,fontSize:15,color:"#0f172a"}}>{tr.name}</div>
                      <div style={{fontSize:12,color:"#64748b",marginTop:2}}>Trainer {team.name}</div>
                    </div>
                    {/* Kontakt-Buttons ohne Nummer zu zeigen */}
                    <div style={{display:"flex",gap:7}}>
                      {localPhone&&(
                        <>
                          <button onClick={()=>window.open("tel:"+localPhone)}
                            style={{width:36,height:36,borderRadius:10,background:"#f0fdf4",
                              border:"1px solid #bbf7d0",color:"#16a34a",cursor:"pointer",
                              fontWeight:800,fontSize:13}}>
                            Tel
                          </button>
                          <button onClick={()=>window.open("https://wa.me/"+localPhone.replace(/[^0-9]/g,""))}
                            style={{width:36,height:36,borderRadius:10,background:"#f0fdf4",
                              border:"1px solid #bbf7d0",color:"#16a34a",cursor:"pointer",
                              fontWeight:800,fontSize:11}}>
                            WA
                          </button>
                        </>
                      )}
                      {tr.email&&(
                        <button onClick={()=>window.open("mailto:"+tr.email)}
                          style={{width:36,height:36,borderRadius:10,background:"#eff6ff",
                            border:"1px solid #bfdbfe",color:"#2563eb",cursor:"pointer",
                            fontWeight:800,fontSize:11}}>
                          Mail
                        </button>
                      )}
                      {!localPhone&&!tr.email&&(
                        <span style={{fontSize:11,color:"#94a3b8",padding:"8px 0"}}>
                          Kein Kontakt hinterlegt
                        </span>
                      )}
                    </div>
                  </div>
                );
              })}
              {/* Hinweis: Telefonnummern nur lokal */}
              <div style={{fontSize:11,color:"#94a3b8",lineHeight:1.5,padding:"6px 4px"}}>
                Telefonnummern werden aus Datenschutzgruenden nur lokal auf
                diesem Gerät gespeichert - nicht in der Cloud.
              </div>
            </div>
          )}

          {/* Spieler Liste (nur Vornamen, kein Bild ohne Einwilligung) */}
          <div style={{marginBottom:16}}>
            <div style={{fontSize:11,fontWeight:800,color:"#64748b",marginBottom:8,letterSpacing:.5}}>
              SPIELER ({players.length})
            </div>
            <div style={{display:"flex",flexWrap:"wrap",gap:8}}>
              {players.map(pl=>(
                <div key={pl.id} style={{display:"flex",alignItems:"center",gap:6,
                  background:"#f8fafc",borderRadius:10,padding:"6px 10px",
                  border:"1px solid #e2e8f0"}}>
                  <Av name={pl.name} sz={26}/>
                  <span style={{fontSize:13,fontWeight:600,color:"#334155"}}>{pl.name}</span>
                </div>
              ))}
              {players.length===0&&<p style={{fontSize:13,color:"#94a3b8"}}>Noch keine Spieler zugeteilt</p>}
            </div>
          </div>

          {/* Nächste Termine */}
          {upcomingEvents.length>0&&(
            <div>
              <div style={{fontSize:11,fontWeight:800,color:"#64748b",marginBottom:8,letterSpacing:.5}}>
                NAECHSTE TERMINE
              </div>
              {upcomingEvents.map(ev=>(
                <div key={ev.id} style={{display:"flex",alignItems:"center",gap:10,
                  background:"#f8fafc",borderRadius:11,padding:"9px 13px",
                  border:"1px solid #e2e8f0",marginBottom:7}}>
                  <div style={{width:36,height:36,borderRadius:10,background:t.p+"18",
                    display:"flex",alignItems:"center",justifyContent:"center",
                    fontWeight:900,fontSize:11,color:t.p,flexShrink:0}}>
                    {ev.date?.slice(5).replace("-",".")}
                  </div>
                  <div style={{flex:1}}>
                    <div style={{fontWeight:700,fontSize:13}}>{ev.title}</div>
                    <div style={{fontSize:11,color:"#94a3b8"}}>{ev.time} {ev.location&&"- "+ev.location}</div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Datenschutz Footer */}
          <div style={{marginTop:20,background:"#f8fafc",borderRadius:12,
            padding:"12px 14px",border:"1px solid #e2e8f0",fontSize:11,color:"#94a3b8",lineHeight:1.6}}>
            Datenschutz: Alle personenbezogenen Daten werden gemäß DSGVO verarbeitet.
            Bilder werden nur mit Einwilligung gespeichert. Kontaktdaten verbleiben lokal auf deinem Gerät.
          </div>
        </div>
      </div>
    </div>
  );
}

// Trainer Kontakt-Setup (Admin/Trainer traegt seine Nummer lokal ein)
function TrainerContactSetup({ trainer, onClose }) {
  const [phone, setPhone] = React.useState(()=>ConsentStore.getContact(trainer.id)||"");
  const save = () => {
    if(phone.trim()) ConsentStore.setContact(trainer.id, phone.trim());
    else ConsentStore.clearContact(trainer.id);
    onClose();
  };
  return (
    <div style={{position:"fixed",inset:0,overflowY:"auto",WebkitOverflowScrolling:"touch",background:"rgba(0,0,0,.6)",zIndex:910,
      display:"flex",alignItems:"center",justifyContent:"center",padding:20}}>
      <div style={{background:"#fff",borderRadius:18,padding:"24px",width:"100%",maxWidth:380}}>
        <h3 style={{fontWeight:900,fontSize:17,marginBottom:6}}>Kontaktnummer hinterlegen</h3>
        <div style={{background:"#eff6ff",borderRadius:10,padding:"10px 13px",
          fontSize:12,color:"#1d4ed8",lineHeight:1.6,marginBottom:16}}>
          Die Nummer wird NUR auf diesem Gerät gespeichert -
          nicht in der Cloud oder Datenbank. Andere Geräte sehen sie nicht.
        </div>
        <input value={phone} onChange={e=>setPhone(e.target.value)}
          placeholder="+49 151 12345678"
          style={{width:"100%",padding:"12px 14px",fontSize:14,
            border:"1.5px solid #e2e8f0",borderRadius:12,outline:"none",
            marginBottom:14,boxSizing:"border-box"}}/>
        <div style={{display:"flex",gap:9}}>
          <button onClick={onClose}
            style={{flex:1,padding:"12px",borderRadius:12,border:"1.5px solid #e2e8f0",
              background:"#fff",fontWeight:700,cursor:"pointer",fontFamily:"inherit"}}>
            Abbrechen
          </button>
          <button onClick={save}
            style={{flex:2,padding:"12px",borderRadius:12,border:"none",
              background:"#16a34a",color:"#fff",fontWeight:800,cursor:"pointer",fontFamily:"inherit"}}>
            Speichern (nur lokal)
          </button>
        </div>
      </div>
    </div>
  );
}



function InviteSheet({ team, cl, onClose }) {
  const t = TH(cl);
  const url = window.location.origin + "?club=" + (cl?.slug||cl?.id);
  const print = () => window.print();
  return (
    <div style={{position:"fixed",inset:0,background:"rgba(0,0,0,.6)",zIndex:900,
      display:"flex",alignItems:"center",justifyContent:"center",padding:20}}>
      <div style={{background:"#fff",borderRadius:20,width:"100%",maxWidth:400,overflow:"hidden"}}>
        <div style={{background:t.p,padding:"16px 20px",color:"#fff"}}>
          <div style={{fontWeight:900,fontSize:18}}>{cl?.name}</div>
          <div style={{fontSize:13,opacity:.8}}>Einladung für Eltern</div>
        </div>
        <div style={{padding:"20px"}}>
          <div style={{background:"#f8fafc",borderRadius:13,padding:"16px",
            border:"1.5px solid #e2e8f0",marginBottom:14,textAlign:"center"}}>
            <div style={{fontSize:12,color:"#64748b",fontWeight:700,marginBottom:8}}>MANNSCHAFT</div>
            <div style={{fontWeight:900,fontSize:22,color:"#0f172a",marginBottom:4}}>{team.name}</div>
            <div style={{fontSize:12,color:"#64748b",marginBottom:12}}>Eltern-Zugangscode:</div>
            <div style={{background:"#0f172a",color:"#fff",borderRadius:12,padding:"12px 20px",
              fontSize:28,fontWeight:900,letterSpacing:4,fontFamily:"monospace"}}>{team.pwd||"---"}</div>
          </div>
          <div style={{background:"#eff6ff",borderRadius:12,padding:"12px 14px",
            marginBottom:14,fontSize:12,color:"#1d4ed8",lineHeight:1.7}}>
            <strong>So gehts:</strong><br/>
            1. Öffne: <strong>{url}</strong><br/>
            2. Wähle deinen Verein<br/>
            3. Tippe auf "Elternteil"<br/>
            4. Wähle "{team.name}"<br/>
            5. Gib den Code ein: <strong>{team.pwd}</strong>
          </div>
          <div style={{display:"flex",gap:9}}>
            <button onClick={onClose}
              style={{flex:1,padding:"11px",borderRadius:11,border:"1.5px solid #e2e8f0",
                background:"#fff",fontWeight:700,cursor:"pointer",fontFamily:"inherit"}}>
              Schließen
            </button>
            <button onClick={()=>{
              navigator.clipboard?.writeText(
                `Hallo! Bitte lade die Vereins-App herunter:\n${url}\n\nMannschaft: ${team.name}\nCode: ${team.pwd||""}`
              ); }}
              style={{flex:2,padding:"11px",borderRadius:11,border:"none",background:t.p,
                color:"#fff",fontWeight:800,cursor:"pointer",fontFamily:"inherit"}}>
              Text kopieren
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}


/* =================================================================
   FELD-VORLAGEN (Admin wählt Skizze)
================================================================= */
const FIELD_TEMPLATES = [
  {
    id: "rasen",
    label: "Rasenplatz",
    icon: "R",
    color: "#16a34a",
    bg: "#dcfce7",
    weather: "good",
    svg: (w,h,col) => `
      <rect width="${w}" height="${h}" rx="4" fill="#22c55e" opacity=".9"/>
      <rect x="${w*.05}" y="${h*.08}" width="${w*.9}" height="${h*.84}" rx="2" fill="none" stroke="white" stroke-width="1.5" opacity=".7"/>
      <line x1="${w/2}" y1="${h*.08}" x2="${w/2}" y2="${h*.92}" stroke="white" stroke-width="1" opacity=".5"/>
      <circle cx="${w/2}" cy="${h/2}" r="${Math.min(w,h)*.12}" fill="none" stroke="white" stroke-width="1" opacity=".5"/>
      <rect x="${w*.05}" y="${h*.35}" width="${w*.15}" height="${h*.3}" rx="1" fill="none" stroke="white" stroke-width="1" opacity=".6"/>
      <rect x="${w*.8}" y="${h*.35}" width="${w*.15}" height="${h*.3}" rx="1" fill="none" stroke="white" stroke-width="1" opacity=".6"/>
    `,
  },
  {
    id: "asche",
    label: "Ascheplatz",
    icon: "A",
    color: "#d97706",
    bg: "#fef3c7",
    weather: "any",
    svg: (w,h) => `
      <rect width="${w}" height="${h}" rx="4" fill="#d97706" opacity=".8"/>
      <rect x="${w*.05}" y="${h*.08}" width="${w*.9}" height="${h*.84}" rx="2" fill="none" stroke="white" stroke-width="1.5" opacity=".7"/>
      <line x1="${w/2}" y1="${h*.08}" x2="${w/2}" y2="${h*.92}" stroke="white" stroke-width="1" opacity=".5"/>
      <circle cx="${w/2}" cy="${h/2}" r="${Math.min(w,h)*.12}" fill="none" stroke="white" stroke-width="1" opacity=".5"/>
    `,
  },
  {
    id: "kunstrasen",
    label: "Kunstrasen",
    icon: "K",
    color: "#059669",
    bg: "#d1fae5",
    weather: "any",
    svg: (w,h) => `
      <rect width="${w}" height="${h}" rx="4" fill="#059669"/>
      ${Array.from({length:8},(_,i)=>`<rect x="0" y="${h/8*i}" width="${w}" height="${h/16}" fill="rgba(0,0,0,.08)"/>`).join('')}
      <rect x="${w*.05}" y="${h*.08}" width="${w*.9}" height="${h*.84}" rx="2" fill="none" stroke="white" stroke-width="1.5" opacity=".8"/>
      <line x1="${w/2}" y1="${h*.08}" x2="${w/2}" y2="${h*.92}" stroke="white" stroke-width="1" opacity=".6"/>
      <circle cx="${w/2}" cy="${h/2}" r="${Math.min(w,h)*.12}" fill="none" stroke="white" stroke-width="1" opacity=".6"/>
    `,
  },
  {
    id: "halle",
    label: "Sporthalle",
    icon: "H",
    color: "#7c3aed",
    bg: "#ede9fe",
    weather: "bad",
    svg: (w,h) => `
      <rect width="${w}" height="${h}" rx="4" fill="#7c3aed" opacity=".85"/>
      <rect x="${w*.06}" y="${h*.08}" width="${w*.88}" height="${h*.84}" rx="2" fill="rgba(255,255,255,.1)" stroke="white" stroke-width="1.5" opacity=".7"/>
      <line x1="${w/2}" y1="${h*.08}" x2="${w/2}" y2="${h*.92}" stroke="white" stroke-width="1" opacity=".5"/>
      <ellipse cx="${w*.25}" cy="${h/2}" rx="${Math.min(w,h)*.08}" ry="${Math.min(w,h)*.12}" fill="none" stroke="white" stroke-width="1" opacity=".5"/>
      <ellipse cx="${w*.75}" cy="${h/2}" rx="${Math.min(w,h)*.08}" ry="${Math.min(w,h)*.12}" fill="none" stroke="white" stroke-width="1" opacity=".5"/>
    `,
  },
  {
    id: "tennis",
    label: "Tennisplatz",
    icon: "T",
    color: "#dc2626",
    bg: "#fee2e2",
    weather: "good",
    svg: (w,h) => `
      <rect width="${w}" height="${h}" rx="4" fill="#dc2626" opacity=".8"/>
      <rect x="${w*.06}" y="${h*.1}" width="${w*.88}" height="${h*.8}" rx="1" fill="none" stroke="white" stroke-width="1.5" opacity=".8"/>
      <line x1="${w*.06}" y1="${h/2}" x2="${w*.94}" y2="${h/2}" stroke="white" stroke-width="2" opacity=".9"/>
      <line x1="${w/2}" y1="${h*.1}" x2="${w/2}" y2="${h*.9}" stroke="white" stroke-width="1" opacity=".5"/>
      <line x1="${w*.06}" y1="${h*.27}" x2="${w*.94}" y2="${h*.27}" stroke="white" stroke-width="1" opacity=".4"/>
      <line x1="${w*.06}" y1="${h*.73}" x2="${w*.94}" y2="${h*.73}" stroke="white" stroke-width="1" opacity=".4"/>
    `,
  },
  {
    id: "leichtathletik",
    label: "Leichtathletik",
    icon: "L",
    color: "#0891b2",
    bg: "#cffafe",
    weather: "good",
    svg: (w,h) => `
      <rect width="${w}" height="${h}" rx="4" fill="#0891b2" opacity=".8"/>
      <ellipse cx="${w/2}" cy="${h/2}" rx="${w*.42}" ry="${h*.38}" fill="none" stroke="white" stroke-width="2" opacity=".8"/>
      <ellipse cx="${w/2}" cy="${h/2}" rx="${w*.32}" ry="${h*.28}" fill="none" stroke="white" stroke-width="1" opacity=".5"/>
      <ellipse cx="${w/2}" cy="${h/2}" rx="${w*.22}" ry="${h*.18}" fill="none" stroke="white" stroke-width="1" opacity=".4"/>
      <rect x="${w*.28}" y="${h*.3}" width="${w*.44}" height="${h*.4}" rx="1" fill="rgba(255,255,255,.1)" stroke="white" stroke-width="1" opacity=".5"/>
    `,
  },
  {
    id: "mehrzweck",
    label: "Mehrzweck",
    icon: "M",
    color: "#64748b",
    bg: "#f1f5f9",
    weather: "any",
    svg: (w,h) => `
      <rect width="${w}" height="${h}" rx="4" fill="#64748b" opacity=".7"/>
      <rect x="${w*.1}" y="${h*.1}" width="${w*.8}" height="${h*.8}" rx="2" fill="none" stroke="white" stroke-width="1.5" opacity=".6"/>
      <line x1="${w/2}" y1="${h*.1}" x2="${w/2}" y2="${h*.9}" stroke="white" stroke-width="1" opacity=".4"/>
      <line x1="${w*.1}" y1="${h/2}" x2="${w*.9}" y2="${h/2}" stroke="white" stroke-width="1" opacity=".4"/>
    `,
  },
];

const SPLIT_OPTIONS = [
  { id:1, label:"Ganzer Platz",    icon:"1",  desc:"1 Team gleichzeitig" },
  { id:2, label:"Halbierung",      icon:"1|1", desc:"2 Teams gleichzeitig" },
  { id:3, label:"Drittelung",      icon:"1|1|1",desc:"3 Teams (ideal Halle)" },
  { id:4, label:"Viertelung",      icon:"4x",  desc:"4 Teams gleichzeitig" },
];

const WEATHER_OPTIONS = [
  { id:"any",  label:"Wetter-unabhaengig", icon:"W", col:"#16a34a", sub:"Immer nutzbar" },
  { id:"good", label:"Nur Gutwetter",      icon:"S", col:"#d97706", sub:"Gesperrt bei Regen" },
  { id:"bad",  label:"Nur Schlechtwetter", icon:"R", col:"#2563eb", sub:"Halle / Alternative" },
];

// SVG Field Sketch Component
function FieldSketch({ template, split=1, width=180, height=110, bookings=[], style={} }) {
  const tpl = FIELD_TEMPLATES.find(t=>t.id===template) || FIELD_TEMPLATES[6];
  const slotW = width / (split > 2 ? split/2 : 1);
  const slotH = split > 2 ? height/2 : height;

  return (
    <div style={{position:"relative",borderRadius:10,overflow:"hidden",
      width,height,...style}}>
      <svg width={width} height={height} viewBox={`0 0 ${width} ${height}`}
        style={{display:"block"}}>
        <g dangerouslySetInnerHTML={{__html: tpl.svg(width,height,tpl.color)}}/>
        {/* Split lines overlay */}
        {split===2&&<line x1={width/2} y1="0" x2={width/2} y2={height}
          stroke="rgba(255,255,255,.6)" strokeWidth="2" strokeDasharray="4,3"/>}
        {split===3&&<>
          <line x1={width/3} y1="0" x2={width/3} y2={height}
            stroke="rgba(255,255,255,.6)" strokeWidth="2" strokeDasharray="4,3"/>
          <line x1={width*2/3} y1="0" x2={width*2/3} y2={height}
            stroke="rgba(255,255,255,.6)" strokeWidth="2" strokeDasharray="4,3"/>
        </>}
        {split===4&&<>
          <line x1={width/2} y1="0" x2={width/2} y2={height}
            stroke="rgba(255,255,255,.6)" strokeWidth="2" strokeDasharray="4,3"/>
          <line x1="0" y1={height/2} x2={width} y2={height/2}
            stroke="rgba(255,255,255,.6)" strokeWidth="2" strokeDasharray="4,3"/>
        </>}
        {/* Booking overlays */}
        {bookings.map((bk,i)=>{
          const segW = split<=2 ? width/Math.max(1,split) : width/2;
          const segH = split<=2 ? height : height/2;
          const col = bk.col || "#dc2626";
          const sx = split===1 ? 0 : split===2 ? (bk.slot||0)*segW
            : split===3 ? (bk.slot||0)*width/3
            : (bk.slot%2)*segW;
          const sy = split<=2 ? 0 : split===4 ? Math.floor((bk.slot||0)/2)*segH : 0;
          return (
            <g key={i}>
              <rect x={sx+2} y={sy+2} width={segW-4} height={segH-4} rx="3"
                fill={col} opacity=".35"/>
              <text x={sx+segW/2} y={sy+segH/2+4} textAnchor="middle"
                fontSize="9" fontWeight="700" fill="white" opacity=".9">
                {(bk.teamName||"").slice(0,8)}
              </text>
              <text x={sx+segW/2} y={sy+segH/2-5} textAnchor="middle"
                fontSize="8" fill="white" opacity=".7">
                {bk.timeFrom}
              </text>
            </g>
          );
        })}
      </svg>
    </div>
  );
}

/* =================================================================
   FELDER MANAGER (Admin) - komplett neu
================================================================= */
function FieldsManagerTab({ data, cid, save, fire, cl }) {
  const t = TH(cl);
  const fields = (data.fields||[]).filter(f=>f.cid===cid);
  const [step, setStep] = useState(null); // null | "template" | "split" | "weather" | "name"
  const [draft, setDraft] = useState({});

  const startNew = () => { setDraft({}); setStep("template"); };
  const addField = () => {
    const f = {
      id: uid(), cid,
      name: draft.name || (FIELD_TEMPLATES.find(t=>t.id===draft.template)?.label||"Platz")+" "+(fields.length+1),
      template: draft.template||"rasen",
      split: draft.split||1,
      weather: draft.weather||"any",
      surface: FIELD_TEMPLATES.find(t=>t.id===draft.template)?.label||"Platz",
      segments: draft.split||1,
    };
    save({...data, fields:[...fields, f]});
    fire("Feld angelegt: "+f.name);
    setStep(null); setDraft({});
  };
  const delField = id => { save({...data,fields:fields.filter(x=>x.id!==id)}); fire("Feld gelöscht"); };

  const todayBk = fid => (data.bookings||[]).filter(b=>
    b.fieldId===fid && b.date===new Date().toISOString().slice(0,10)
  ).map((b,i)=>({...b,slot:i,col:["#2563eb","#dc2626","#d97706","#7c3aed","#059669"][i%5]}));

  return (
    <div>
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:16}}>
        <div>
          <div style={{fontWeight:900,fontSize:16,color:"#0f172a"}}>Felder & Plaetze</div>
          <div style={{fontSize:12,color:"#64748b",marginTop:2}}>{fields.length} angelegt</div>
        </div>
        <button onClick={startNew}
          style={{padding:"10px 18px",borderRadius:12,border:"none",background:t.p,
            color:"#fff",fontWeight:800,fontSize:13,cursor:"pointer",fontFamily:"inherit"}}>
          + Neues Feld
        </button>
      </div>

      {/* Wizard Modal */}
      {step&&(
        <div style={{position:"fixed",inset:0,background:"rgba(0,0,0,.6)",zIndex:900,
          display:"flex",alignItems:"flex-end",justifyContent:"center",backdropFilter:"blur(6px)"}}>
          <div style={{background:"#fff",borderRadius:"22px 22px 0 0",width:"100%",
            maxWidth:520,maxHeight:"88dvh",overflowY:"auto",paddingBottom:44}}>

            {/* Progress */}
            <div style={{background:t.p,padding:"16px 20px 14px"}}>
              <div style={{color:"rgba(255,255,255,.6)",fontSize:11,fontWeight:700,marginBottom:4}}>
                {["template","split","weather","name"].indexOf(step)+1} / 4
              </div>
              <div style={{color:"#fff",fontWeight:900,fontSize:18}}>
                {step==="template"&&"Welche Art von Feld?"}
                {step==="split"&&"Wie teilst du das Feld?"}
                {step==="weather"&&"Wetter-Bedingung"}
                {step==="name"&&"Name & Fertig"}
              </div>
              <div style={{height:4,background:"rgba(255,255,255,.2)",borderRadius:99,marginTop:10}}>
                <div style={{height:"100%",background:"rgba(255,255,255,.9)",borderRadius:99,
                  width:["template","split","weather","name"].indexOf(step)/3*100+"%"}}/>
              </div>
            </div>

            <div style={{padding:"20px 20px 0"}}>

              {/* SCHRITT 1: Template */}
              {step==="template"&&(
                <div style={{display:"grid",gridTemplateColumns:"repeat(2,1fr)",gap:10}}>
                  {FIELD_TEMPLATES.map(tpl=>(
                    <button key={tpl.id} onClick={()=>{setDraft(p=>({...p,template:tpl.id})); setStep("split");}}
                      style={{borderRadius:14,border:`2px solid ${draft.template===tpl.id?t.p:"#e2e8f0"}`,
                        background:"#fff",cursor:"pointer",overflow:"hidden",padding:0,textAlign:"left"}}>
                      <FieldSketch template={tpl.id} width={160} height={80}
                        style={{width:"100%",height:80}}/>
                      <div style={{padding:"8px 12px",display:"flex",alignItems:"center",gap:6}}>
                        <div style={{width:24,height:24,borderRadius:7,background:tpl.bg,
                          display:"flex",alignItems:"center",justifyContent:"center",
                          fontWeight:900,fontSize:11,color:tpl.color}}>
                          {tpl.icon}
                        </div>
                        <div>
                          <div style={{fontWeight:700,fontSize:13,color:"#0f172a"}}>{tpl.label}</div>
                          <div style={{fontSize:10,color:"#94a3b8"}}>
                            {tpl.weather==="good"?"Nur Gutwetter":tpl.weather==="bad"?"Nur Schlechtwetter":"Wetter-unabh."}
                          </div>
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              )}

              {/* SCHRITT 2: Split */}
              {step==="split"&&(
                <div>
                  <div style={{marginBottom:16,borderRadius:14,overflow:"hidden",border:"1.5px solid #e2e8f0"}}>
                    <FieldSketch template={draft.template||"rasen"} split={draft.split||1}
                      width={280} height={140} style={{width:"100%",height:140}}/>
                  </div>
                  <div style={{display:"flex",flexDirection:"column",gap:9}}>
                    {SPLIT_OPTIONS.map(opt=>(
                      <button key={opt.id} onClick={()=>setDraft(p=>({...p,split:opt.id}))}
                        style={{display:"flex",alignItems:"center",gap:12,padding:"13px 16px",
                          borderRadius:13,border:`2px solid ${draft.split===opt.id?t.p:"#e2e8f0"}`,
                          background:draft.split===opt.id?t.p+"10":"#fff",cursor:"pointer",fontFamily:"inherit",textAlign:"left"}}>
                        <div style={{width:40,height:26,borderRadius:7,background:draft.split===opt.id?t.p:"#f1f5f9",
                          display:"flex",alignItems:"center",justifyContent:"center",
                          fontSize:9,fontWeight:900,color:draft.split===opt.id?"#fff":"#64748b",flexShrink:0}}>
                          {opt.icon}
                        </div>
                        <div>
                          <div style={{fontWeight:700,fontSize:14,color:draft.split===opt.id?t.p:"#0f172a"}}>{opt.label}</div>
                          <div style={{fontSize:12,color:"#94a3b8"}}>{opt.desc}</div>
                        </div>
                      </button>
                    ))}
                  </div>
                  <div style={{display:"flex",gap:9,marginTop:16}}>
                    <button onClick={()=>setStep("template")} style={{flex:1,padding:"12px",borderRadius:12,border:"1.5px solid #e2e8f0",background:"#fff",fontWeight:700,cursor:"pointer",fontFamily:"inherit"}}>Zurück</button>
                    <button onClick={()=>draft.split&&setStep("weather")} disabled={!draft.split}
                      style={{flex:2,padding:"12px",borderRadius:12,border:"none",background:draft.split?t.p:"#e2e8f0",color:draft.split?"#fff":"#94a3b8",fontWeight:800,cursor:"pointer",fontFamily:"inherit"}}>Weiter</button>
                  </div>
                </div>
              )}

              {/* SCHRITT 3: Wetter */}
              {step==="weather"&&(
                <div>
                  <div style={{display:"flex",flexDirection:"column",gap:9,marginBottom:16}}>
                    {WEATHER_OPTIONS.map(opt=>(
                      <button key={opt.id} onClick={()=>setDraft(p=>({...p,weather:opt.id}))}
                        style={{display:"flex",alignItems:"center",gap:12,padding:"14px 16px",
                          borderRadius:13,border:`2px solid ${draft.weather===opt.id?opt.col:"#e2e8f0"}`,
                          background:draft.weather===opt.id?opt.col+"12":"#fff",cursor:"pointer",fontFamily:"inherit",textAlign:"left"}}>
                        <div style={{width:44,height:44,borderRadius:12,background:draft.weather===opt.id?opt.col:"#f1f5f9",
                          display:"flex",alignItems:"center",justifyContent:"center",
                          fontSize:20,color:draft.weather===opt.id?"#fff":"#64748b",flexShrink:0,fontWeight:900}}>
                          {opt.icon}
                        </div>
                        <div>
                          <div style={{fontWeight:700,fontSize:15,color:draft.weather===opt.id?opt.col:"#0f172a"}}>{opt.label}</div>
                          <div style={{fontSize:12,color:"#94a3b8",marginTop:2}}>{opt.sub}</div>
                        </div>
                      </button>
                    ))}
                  </div>
                  <div style={{background:"#eff6ff",borderRadius:12,padding:"10px 14px",fontSize:12,color:"#1d4ed8",lineHeight:1.6,marginBottom:14}}>
                    Tipp: Lege Rasenplatz als "Nur Gutwetter" und Halle als "Nur Schlechtwetter" an. Bei schlechtem Wetter siehst du im Platz-Tab automatisch nur die Halle.
                  </div>
                  <div style={{display:"flex",gap:9}}>
                    <button onClick={()=>setStep("split")} style={{flex:1,padding:"12px",borderRadius:12,border:"1.5px solid #e2e8f0",background:"#fff",fontWeight:700,cursor:"pointer",fontFamily:"inherit"}}>Zurück</button>
                    <button onClick={()=>draft.weather&&setStep("name")} disabled={!draft.weather}
                      style={{flex:2,padding:"12px",borderRadius:12,border:"none",background:draft.weather?t.p:"#e2e8f0",color:draft.weather?"#fff":"#94a3b8",fontWeight:800,cursor:"pointer",fontFamily:"inherit"}}>Weiter</button>
                  </div>
                </div>
              )}

              {/* SCHRITT 4: Name */}
              {step==="name"&&(
                <div>
                  <div style={{marginBottom:16,borderRadius:14,overflow:"hidden",border:"1.5px solid #e2e8f0"}}>
                    <FieldSketch template={draft.template||"rasen"} split={draft.split||1}
                      width={280} height={120} style={{width:"100%",height:120}}/>
                  </div>
                  <div style={{background:"#f8fafc",borderRadius:13,padding:"12px 14px",marginBottom:14,fontSize:13,color:"#475569",lineHeight:1.7}}>
                    <strong>{FIELD_TEMPLATES.find(x=>x.id===draft.template)?.label||"Platz"}</strong> -
                    <strong> {SPLIT_OPTIONS.find(x=>x.id===draft.split)?.label}</strong> -
                    <strong> {WEATHER_OPTIONS.find(x=>x.id===draft.weather)?.label}</strong>
                  </div>
                  <input value={draft.name||""} onChange={e=>setDraft(p=>({...p,name:e.target.value}))}
                    placeholder={"z.B. "+((FIELD_TEMPLATES.find(x=>x.id===draft.template)?.label)||"Hauptplatz")+" 1"}
                    style={{width:"100%",padding:"13px 14px",fontSize:16,fontWeight:700,
                      border:`1.5px solid ${draft.name?"#16a34a":"#e2e8f0"}`,borderRadius:12,
                      outline:"none",marginBottom:14,boxSizing:"border-box"}}/>
                  <div style={{display:"flex",gap:9}}>
                    <button onClick={()=>setStep("weather")} style={{flex:1,padding:"12px",borderRadius:12,border:"1.5px solid #e2e8f0",background:"#fff",fontWeight:700,cursor:"pointer",fontFamily:"inherit"}}>Zurück</button>
                    <button onClick={addField}
                      style={{flex:2,padding:"12px",borderRadius:12,border:"none",background:t.p,color:"#fff",fontWeight:800,cursor:"pointer",fontFamily:"inherit",boxShadow:`0 4px 14px ${t.p}44`}}>
                      Feld anlegen!
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Felder Liste */}
      {fields.length===0&&!step&&(
        <div style={{textAlign:"center",padding:"40px 20px",background:"#f8fafc",borderRadius:16,border:"1.5px dashed #e2e8f0"}}>
          <div style={{fontWeight:700,fontSize:15,color:"#334155",marginBottom:6}}>Noch keine Felder angelegt</div>
          <div style={{fontSize:13,color:"#94a3b8",lineHeight:1.6}}>
            Lege Rasenplatz, Ascheplatz oder Halle an.<br/>
            Trainer können dann Zeiten reservieren.
          </div>
        </div>
      )}
      {fields.map(field=>{
        const bks = todayBk(field.id);
        const tpl = FIELD_TEMPLATES.find(t=>t.id===field.template)||FIELD_TEMPLATES[6];
        const wOpt = WEATHER_OPTIONS.find(w=>w.id===field.weather)||WEATHER_OPTIONS[0];
        return (
          <div key={field.id} style={{background:"#fff",borderRadius:16,border:"1.5px solid #e2e8f0",
            marginBottom:12,overflow:"hidden"}}>
            <div style={{display:"flex",alignItems:"center",gap:12,padding:"12px 14px",
              borderBottom:"1px solid #f1f5f9"}}>
              <div style={{width:36,height:36,borderRadius:10,background:tpl.bg,
                display:"flex",alignItems:"center",justifyContent:"center",
                fontWeight:900,fontSize:16,color:tpl.color,flexShrink:0}}>
                {tpl.icon}
              </div>
              <div style={{flex:1}}>
                <div style={{fontWeight:800,fontSize:15,color:"#0f172a"}}>{field.name}</div>
                <div style={{fontSize:11,color:"#64748b",marginTop:1}}>
                  {tpl.label} - {SPLIT_OPTIONS.find(s=>s.id===field.split)?.label}
                  <span style={{marginLeft:8,color:wOpt.col,fontWeight:700}}>{wOpt.icon} {wOpt.label}</span>
                </div>
              </div>
              <button onClick={()=>delField(field.id)}
                style={{width:30,height:30,borderRadius:9,background:"#fee2e2",border:"none",
                  color:"#dc2626",cursor:"pointer",fontWeight:800,fontSize:13}}>X</button>
            </div>
            <div style={{padding:"12px 14px"}}>
              <FieldSketch template={field.template} split={field.split||1}
                width={undefined} height={100}
                bookings={bks}
                style={{width:"100%",height:100}}/>
              {bks.length>0&&(
                <div style={{marginTop:8,fontSize:11,color:"#64748b"}}>
                  {bks.length} Buchung(en) heute
                </div>
              )}
              {bks.length===0&&(
                <div style={{marginTop:8,fontSize:11,color:"#94a3b8"}}>Heute noch frei</div>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}

/* =================================================================
   TRAINER-ANWESENHEIT BEI TERMINEN
================================================================= */
// Trainer checkt sich beim Termin ein
function TrainerCheckin({ ev, session, save, data, fire }) {
  const trainers = (data.trainers||[]).filter(tr=>(tr.tids||[]).includes(ev.tid));
  const checkedIn = ev.trainerPresence || {};
  const myId = session?.id || session?.name;
  const amCheckedIn = checkedIn[myId];

  const checkin = () => {
    const updated = {...ev, trainerPresence:{...checkedIn,[myId]:{
      name: session.name||"Trainer",
      ts: new Date().toISOString(),
      trainerId: myId,
    }}};
    save({...data, events:(data.events||[]).map(e=>e.id===ev.id?updated:e)});
    fire("Anwesenheit bestaetigt");
  };
  const checkout = () => {
    const presence = {...checkedIn};
    delete presence[myId];
    save({...data, events:(data.events||[]).map(e=>e.id===ev.id?{...e,trainerPresence:presence}:e)});
    fire("Anwesenheit zurückgenommen");
  };

  const presentTrainers = Object.values(checkedIn);

  return (
    <div style={{marginTop:12}}>
      {/* Trainer die da sind - für Eltern sichtbar */}
      {presentTrainers.length>0&&(
        <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:10}}>
          <div style={{fontSize:12,color:"#64748b",fontWeight:600}}>Trainer da:</div>
          <div style={{display:"flex",gap:6,flexWrap:"wrap"}}>
            {presentTrainers.map(tr=>(
              <div key={tr.trainerId} style={{display:"flex",alignItems:"center",gap:5,
                background:"#f0fdf4",borderRadius:99,padding:"3px 10px",
                border:"1px solid #bbf7d0"}}>
                <div style={{width:6,height:6,borderRadius:"50%",background:"#16a34a"}}/>
                <span style={{fontSize:12,fontWeight:700,color:"#166534"}}>{tr.name}</span>
              </div>
            ))}
          </div>
        </div>
      )}
      {/* Nur für Trainer sichtbar */}
      {session?.role==="trainer"&&(
        <button onClick={amCheckedIn?checkout:checkin}
          style={{width:"100%",padding:"11px",borderRadius:12,border:"none",
            background:amCheckedIn?"#fee2e2":"#16a34a",
            color:amCheckedIn?"#dc2626":"#fff",
            fontWeight:800,fontSize:13,cursor:"pointer",fontFamily:"inherit",
            display:"flex",alignItems:"center",justifyContent:"center",gap:8}}>
          {amCheckedIn
            ? "Anwesenheit zurücknehmen"
            : "Ich bin heute da als Trainer"}
        </button>
      )}
    </div>
  );
}

// Trainer-Anwesenheits-Statistik (Admin-Auswertung)
function TrainerStatsView({ data, cid }) {
  const trainers = (data.trainers||[]).filter(t=>t.cid===cid);
  const events = (data.events||[]).filter(e=>
    (data.teams||[]).find(tm=>tm.cid===cid&&tm.id===e.tid)
  );
  const trainings = events.filter(e=>e.type==="training");

  return (
    <div style={{marginTop:16}}>
      <div style={{fontSize:11,fontWeight:800,color:"#64748b",marginBottom:10,letterSpacing:.5}}>
        TRAINER-ANWESENHEIT SAISON
      </div>
      {trainers.map(tr=>{
        const myTrainings = trainings.filter(e=>(tr.tids||[]).includes(e.tid));
        const present = myTrainings.filter(e=>e.trainerPresence?.[tr.id]);
        const pct = myTrainings.length>0 ? Math.round(present.length/myTrainings.length*100) : null;
        return (
          <div key={tr.id} style={{display:"flex",alignItems:"center",gap:12,
            background:"#fff",borderRadius:13,padding:"12px 14px",
            border:"1.5px solid #e2e8f0",marginBottom:8}}>
            <Av name={tr.name} sz={38}/>
            <div style={{flex:1}}>
              <div style={{fontWeight:700,fontSize:14,color:"#0f172a",marginBottom:4}}>{tr.name}</div>
              <div style={{height:6,background:"#f1f5f9",borderRadius:99,overflow:"hidden"}}>
                <div style={{height:"100%",borderRadius:99,transition:"width .4s",
                  background:pct>=80?"#16a34a":pct>=60?"#d97706":"#dc2626",
                  width:`${pct||0}%`}}/>
              </div>
            </div>
            <div style={{textAlign:"right",flexShrink:0}}>
              <div style={{fontWeight:900,fontSize:16,color:pct>=80?"#16a34a":pct>=60?"#d97706":"#dc2626"}}>
                {pct!==null?pct+"%":"--"}
              </div>
              <div style={{fontSize:10,color:"#94a3b8"}}>{present.length}/{myTrainings.length}</div>
            </div>
          </div>
        );
      })}
      {trainers.length===0&&<p style={{fontSize:13,color:"#94a3b8",textAlign:"center"}}>Keine Trainer angelegt</p>}
    </div>
  );
}



function AttendanceTab({ data, myTids, cl, save, fire }) {
  const t = TH(cl);
  const activeSeason = data.activeSeason||"s2526";
  const myTeams = (data.teams||[]).filter(tm=>myTids.includes(tm.id));
  const [selTid, setSelTid] = useState(myTids[0]||"");
  const players = (data.playerProfiles||[]).filter(p=>p.mainTid===selTid&&(!p.seasonId||p.seasonId===activeSeason));
  const trainings = (data.events||[]).filter(e=>e.tid===selTid&&e.type==="training");
  const games = (data.events||[]).filter(e=>e.tid===selTid&&e.type!=="training");

  const stats = players.map(pl => {
    const trainPresent = trainings.filter(e=>e.votes?.[pl.name]==="yes").length;
    const gamePresent  = games.filter(e=>e.votes?.[pl.name]==="yes").length;
    const trainPct = trainings.length>0 ? Math.round(trainPresent/trainings.length*100) : null;
    return { pl, trainPresent, gamePresent, trainPct, total: trainings.length };
  }).sort((a,b)=>(b.trainPct||0)-(a.trainPct||0));

  return (
    <div>
      {myTeams.length>1&&<div style={{display:"flex",gap:6,marginBottom:14,overflowX:"auto",scrollbarWidth:"none",WebkitOverflowScrolling:"touch"}}>
        {myTeams.map(tm=>(
          <button key={tm.id} onClick={()=>setSelTid(tm.id)}
            style={{padding:"7px 14px",borderRadius:99,border:`2px solid ${selTid===tm.id?tm.col:"#e2e8f0"}`,background:selTid===tm.id?tm.col:"#fff",color:selTid===tm.id?"#fff":"#475569",fontWeight:700,fontSize:12,cursor:"pointer",whiteSpace:"nowrap",fontFamily:"inherit",flexShrink:0}}>
            {tm.name}
          </button>
        ))}
      </div>}
      <div style={{background:"#fff",borderRadius:16,padding:14,border:"1.5px solid #e2e8f0",marginBottom:14}}>
        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:10}}>
          {[[trainings.length,"Trainings","#16a34a"],[games.length,"Spiele","#2563eb"],[players.length,"Spieler","#7c3aed"]].map(([v,l,col])=>(
            <div key={l} style={{textAlign:"center",background:col+"12",borderRadius:12,padding:"10px 6px",border:`1px solid ${col}30`}}>
              <div style={{fontWeight:900,fontSize:22,color:col}}>{v}</div>
              <div style={{fontSize:11,color:"#64748b",marginTop:2}}>{l}</div>
            </div>
          ))}
        </div>
      </div>
      {trainings.length===0&&<div style={{textAlign:"center",padding:"32px",background:"#f8fafc",borderRadius:14,border:"1.5px dashed #e2e8f0"}}><p style={{fontWeight:700,color:"#334155"}}>Noch keine Trainings</p><p style={{fontSize:13,color:"#94a3b8",marginTop:4}}>Sobald Termine mit Abstimmung angelegt wurden, erscheint hier die Anwesenheitsstatistik.</p></div>}
      {trainings.length>0&&<div style={{display:"flex",flexDirection:"column",gap:8}}>
        {stats.map(({pl,trainPresent,gamePresent,trainPct,total})=>(
          <div key={pl.id} style={{background:"#fff",borderRadius:13,padding:"12px 14px",border:"1.5px solid #e2e8f0",display:"flex",alignItems:"center",gap:12}}>
            <Av name={pl.name} sz={40}/>
            <div style={{flex:1}}>
              <div style={{fontWeight:700,fontSize:14,color:"#0f172a",marginBottom:4}}>{pl.name}</div>
              <div style={{height:6,background:"#f1f5f9",borderRadius:99,overflow:"hidden"}}>
                <div style={{height:"100%",borderRadius:99,background:trainPct>=75?"#16a34a":trainPct>=50?"#d97706":"#dc2626",width:`${trainPct||0}%`,transition:"width .4s"}}/>
              </div>
            </div>
            <div style={{textAlign:"right",minWidth:60}}>
              <div style={{fontWeight:900,fontSize:16,color:trainPct>=75?"#16a34a":trainPct>=50?"#d97706":"#dc2626"}}>{trainPresent}/{total}</div>
              <div style={{fontSize:11,color:"#94a3b8"}}>{trainPct!==null?trainPct+"%":"-"}</div>
            </div>
          </div>
        ))}
      </div>}
    </div>
  );
}

function TeamsTab({ data, cid, save, fire }) {
  const teams = (data.teams||[]).filter(t=>t.cid===cid);
  const countFor = id => (data.playerProfiles||[]).filter(p=>p.mainTid===id && !p.archived).length;
  return (
    <div style={{padding:"16px 14px",maxWidth:560,margin:"0 auto"}}>
      <h2 style={{fontSize:20,fontWeight:900,color:"#0f172a",marginBottom:12}}>Mannschaften</h2>
      {teams.length===0 && <p style={{color:"#94a3b8",fontSize:14}}>Noch keine Mannschaften angelegt.</p>}
      {teams.map(tm=>(
        <div key={tm.id} style={{display:"flex",alignItems:"center",gap:12,background:"#fff",borderRadius:14,padding:"12px 14px",marginBottom:8,border:"1px solid #e2e8f0"}}>
          <div style={{width:42,height:42,borderRadius:12,background:(tm.col||"#16a34a")+"22",display:"flex",alignItems:"center",justifyContent:"center",fontWeight:900,fontSize:18,color:tm.col||"#16a34a"}}>{tm.icon||"?"}</div>
          <div style={{flex:1,minWidth:0}}>
            <div style={{fontWeight:800,color:"#0f172a"}}>{tm.name}</div>
            <div style={{fontSize:12,color:"#94a3b8"}}>{tm.cat||""}{tm.years?(" · "+tm.years):""}</div>
          </div>
          <div style={{fontSize:12,fontWeight:700,color:countFor(tm.id)?"#16a34a":"#94a3b8",whiteSpace:"nowrap"}}>{countFor(tm.id)} Spieler</div>
        </div>
      ))}
    </div>
  );
}

function VisibilityTab({ data, cid, save, fire, cl }) {
  return (
    <div style={{padding:"16px 14px",maxWidth:560,margin:"0 auto"}}>
      <h2 style={{fontSize:20,fontWeight:900,color:"#0f172a",marginBottom:12}}>Sichtbarkeit</h2>
      <div style={{background:"#fff",borderRadius:14,padding:"16px",border:"1px solid #e2e8f0",color:"#64748b",fontSize:14,lineHeight:1.6}}>
        Hier lässt sich später steuern, welche Bereiche für Eltern und Helfer sichtbar sind. Diese Funktion ist noch in Vorbereitung.
      </div>
    </div>
  );
}

function Dashboard({data,session,onSave,onLogout,lang="de",setLang=()=>{}}) {
  const { isDesktop, isTablet } = useBreakpoint();
  const isAdmin=session.role==="admin"; const isHelper=session.role==="helper"; const cid=session.cid; const cl=data.clubs.find(c=>c.id===cid);
  const myTids=isAdmin?data.teams.filter(t=>t.cid===cid).map(t=>t.id):isHelper?data.teams.filter(t=>t.cid===cid).map(t=>t.id):(session.tids||[]);
  const t=TH(cl);
  const [tab,setTab]=useState("events"); // BottomNav manages this
  const [local,setLocal]=useState(()=>JSON.parse(JSON.stringify(data)));
  const [toast,setToast]=useState(null);
  const unreadMsgs = useMemo(()=>{
    const lastRead = Number(localStorage.getItem("va_last_read_"+cid)||0);
    return (local.chats||[]).filter(m=>m.cid===cid&&m.ts>lastRead).length;
  },[local.chats]); const [wizard,setWizard]=useState(false); const [editEv,setEditEv]=useState(null);
  const [showSeasonModal,setShowSeasonModal]=useState(false);
  const { trigger: shareTrigger,dismiss: dismissShare } = useShareTrigger(local,session,myTids);
  const [delConf,setDelConf]=useState(null); const [viewEv,setViewEv]=useState(null); const [delConfVal,setDelConfVal]=useState(null);
  const [editConf,setEditConf]=useState(null);
  const [showOnboarding,setShowOnboarding]=useState(false);
  const toastRef=useRef(null);
  const fire=m=>{setToast(m);clearTimeout(toastRef.current);toastRef.current=setTimeout(()=>setToast(null),2500);};
  const save=next=>{setLocal(next);onSave(next);};
  const myClub=local.clubs.find(c=>c.id===cid);
  const myEvs=local.events.filter(e=>myTids.includes(e.tid)&&e.cid===cid).sort((a,b)=>a.date.localeCompare(b.date));
  const tod=now(); const up=myEvs.filter(e=>e.date>=tod); const past=myEvs.filter(e=>e.date<tod).reverse();

  if(wizard||editEv) return <Wizard teams={local.teams.filter(x=>myTids.includes(x.id))} cl={myClub} editEv={editEv}
    onTemplates={(local.pollTemplates||[]).filter(t=>t.cid===cid)}
    onSaveTemplate={tpl=>{save({...local,pollTemplates:[...(local.pollTemplates||[]),tpl]});fire("Vorlage gespeichert *");}}
    onSave={evs=>{
    if(editEv){
      const {_editSeries,...saved}=evs[0];
      if(editEv._editSeries==="future"&&editEv.sid){
        const {title,time,loc,note,pt,li}=saved;
        save({...local,events:local.events.map(e=>{
          if(e.sid===editEv.sid&&e.date>=editEv.date) return{...e,title,time,loc,note,pt,li};
          return e;
        })});
        fire("Serie ab hier aktualisiert *");
      } else {
        const deleteEv = ev => { save({...local,events:(local.events||[]).filter(e=>e.id!==ev.id)}); fire("Termin gelöscht"); };
    save({...local,events:(local.events||[]).map(e=>e.id===saved.id?saved:e)});
        fire("Termin aktualisiert *");
      }
    } else {
      save({...local,events:[...(local.events||[]),...evs]});
      fire(`${evs.length>1?evs.length+" Termine":"Termin"} erstellt - Eltern werden benachrichtigt`);
    }
    setWizard(false);setEditEv(null);
  }} onClose={()=>{setWizard(false);setEditEv(null);}}/>;

  const tr = (k) => { const lang = localStorage.getItem("vereinsapp_lang") || "de"; return T[lang]?.[k] ?? T.de[k] ?? k; };
  // BottomNav replaces old tabs - kept for reference
  const tabs=[].filter(Boolean).filter(x=>!x.hidden);

  return (
    <div style={{minHeight:"100dvh",background:"#f0f4f8",
      paddingBottom:isDesktop?0:52,
      display:isDesktop?"grid":"block",
      gridTemplateColumns:isDesktop?"260px 1fr":"none"}}>
      {isDesktop&&<DesktopSidebar tab={tab} setTab={setTab}
        isAdmin={isAdmin} isHelper={isHelper}
        unread={unreadMsgs} cl={myClub}
        session={session} onLogout={onLogout}/>}
      <div style={{minHeight:"100dvh",overflowY:"auto",background:"#f0f4f8"}}>
      <div style={{maxWidth:isDesktop?"900px":"100%",margin:"0 auto",padding:isDesktop?"24px":"0"}}>
      <ClubHeader cl={myClub} hide={isDesktop} sub={`${isAdmin?"** Admin":isHelper?"* Helfer":"**"} ${session.name||"Admin"}`}
        right={
          <div style={{display:"flex",gap:7,alignItems:"center"}}>
            <LangSwitcher lang={lang} setLang={setLang}/>
            {}
            {(()=>{
              const seasons=local.seasons||[];
              const curSeason=seasons.find(s=>s.id===local.activeSeason)||seasons[0];
              const hasPlan=seasons.some(s=>s.status==="planning");
              return (
                <button onClick={()=>setShowSeasonModal(true)}
                  style={{display:"flex",alignItems:"center",gap:5,background:"rgba(255,255,255,.12)",border:hasPlan?"1.5px solid rgba(255,255,255,.5)":"none",borderRadius:11,padding:"6px 11px",color:"rgba(255,255,255,.85)",fontSize:12,fontWeight:700,cursor:"pointer",position:"relative"}}>
                  {hasPlan&&<span style={{position:"absolute",top:-3,right:-3,width:8,height:8,borderRadius:"50%",background:"#fbbf24",border:"1.5px solid #fff"}}/>}
                   {curSeason?.label||"Saison"}
                </button>
              );
            })()}
            <button onClick={onLogout} style={{background:"rgba(255,255,255,.12)",border:"none",borderRadius:12,padding:"6px 14px",color:"rgba(255,255,255,.7)",fontSize:13,fontWeight:700,cursor:"pointer"}}>Logout</button>
          </div>
        }/>
      {showSeasonModal&&<SeasonModal data={local} save={d=>{save(d);}} fire={fire} cl={myClub} myTids={myTids} onClose={()=>setShowSeasonModal(false)}/>}
      {}
      <div style={{background:`linear-gradient(90deg,${t.p},${mix(t.p,-20)})`,display:"grid",gridTemplateColumns:"repeat(3,1fr)"}}>
        {[[up.length,"Termine","*"],[myTids.length,"Teams","*"],[myEvs.reduce((s,e)=>s+Object.keys(e.votes).length,0),"Stimmen","**"]].map(([v,l,em])=>(
          <div key={l} style={{padding:"11px 0",textAlign:"center",borderRight:"1px solid rgba(255,255,255,.18)"}}>
            <div style={{fontSize:16}}>{em}</div><div style={{color:"#fff",fontWeight:900,fontSize:20,lineHeight:1}}>{v}</div><div style={{color:"rgba(255,255,255,.6)",fontSize:11}}>{l}</div>
          </div>
        ))}
      </div>
      {}
      <div style={{background:"#fff",borderBottom:"2px solid #f1f5f9",display:"flex",overflowX:"auto",boxShadow:"0 2px 8px rgba(0,0,0,.04)"}}>
        {tabs.map(([id,label])=><button key={id} onClick={()=>setTab(id)} style={{background:"none",border:"none",padding:"12px 13px",fontSize:12,fontWeight:800,cursor:"pointer",whiteSpace:"nowrap",color:tab===id?t.p:"#94a3b8",borderBottom:tab===id?`3px solid ${t.p}`:"3px solid transparent",marginBottom:-2,flexShrink:0}}>{label}</button>)}
      </div>
      <div style={{maxWidth:560,margin:"0 auto",padding:"14px"}}>
        {tab==="events"&&<>
          {}
          {(local.seasons||[]).some(s=>s.status==="planning")&&(
            <div onClick={()=>setShowSeasonModal(true)} style={{background:"#eff6ff",border:"1.5px solid #bfdbfe",borderRadius:13,padding:"11px 16px",marginBottom:14,cursor:"pointer",display:"flex",alignItems:"center",gap:10}}>
              <span style={{fontSize:20}}></span>
              <div style={{flex:1}}>
                <div style={{fontWeight:800,fontSize:13,color:"#1d4ed8"}}>
                  Saison {(local.seasons||[]).find(s=>s.status==="planning")?.label} in Planung
                </div>
                <div style={{fontSize:12,color:"#3b82f6",marginTop:1}}>Spieler zuteilen und Saison aktivieren {"->"}</div>
              </div>
            </div>
          )}
          {}
          <div onClick={()=>setWizard(true)} style={{background:t.p,borderRadius:20,padding:"18px 20px",cursor:"pointer",marginBottom:18,display:"flex",alignItems:"center",gap:14,boxShadow:`0 6px 24px ${t.p}66,0 2px 8px rgba(0,0,0,.15)`,transition:"all .2s"}}>
            <div style={{width:52,height:52,borderRadius:16,background:"rgba(0,0,0,.15)",border:"2px solid rgba(255,255,255,.35)",display:"flex",alignItems:"center",justifyContent:"center",fontSize:28,fontWeight:900,color:"#fff",flexShrink:0}}>+</div>
            <div style={{flex:1}}>
              <div style={{color:"#fff",fontWeight:900,fontSize:18,letterSpacing:"-.3px",textShadow:"0 1px 3px rgba(0,0,0,.25)"}}>Neuen Termin anlegen</div>
              <div style={{color:"rgba(255,255,255,.9)",fontSize:13,marginTop:3,fontWeight:500}}>Schritt-für-Schritt Assistent</div>
            </div>
            <div style={{width:32,height:32,borderRadius:10,background:"rgba(0,0,0,.15)",display:"flex",alignItems:"center",justifyContent:"center",color:"#fff",fontSize:18,fontWeight:700,flexShrink:0}}>{">"}</div>
          </div>
          {up.length>0&&<><Divider label={`KOMMENDE (${up.length})`}/>{up.map(ev=><DashRow key={ev.id} ev={ev} cl={myClub} tod={tod} onView={()=>setViewEv(ev)} onEdit={()=>ev.sid?setEditConf(ev):setEditEv(ev)} onDel={()=>{setDelConf(ev.id);setDelConfVal(ev.title);}} onReset={()=>{save({...local,events:local.events.map(e=>e.id===ev.id?{...e,votes:{}}:e)});fire("Stimmen zurückgesetzt");}} onCopyLink={()=>fire("* Einladungslink: ?club="+myClub.slug+"&join="+ev.id)}/>)}</>}
          {up.length===0&&<div style={{textAlign:"center",padding:"30px",background:"#fff",borderRadius:18,border:"1.5px dashed #e2e8f0",color:"#94a3b8"}}><Logo cl={myClub} sz={50} sx={{margin:"0 auto 12px"}}/><p style={{fontWeight:800,fontSize:15}}>Noch keine Termine</p><p style={{fontSize:13,marginTop:3}}>Klicke oben auf "Neuen Termin anlegen"</p></div>}
          {past.length>0&&<><Divider label={`VERGANGENE (${past.length})`} light/><div style={{opacity:.72}}>{past.map(ev=><DashRow key={ev.id} ev={ev} cl={myClub} tod={tod} onView={()=>setViewEv(ev)} onEdit={()=>setEditEv(ev)} onDel={()=>{setDelConf(ev.id);setDelConfVal(ev.title);}} onReset={()=>{}} onCopyLink={()=>{}}/>)}</div></>}
        </>}
        {tab==="players"    &&<PlayersTab data={local} myTids={myTids} save={save} fire={fire} cl={myClub}/>}
        {tab==="templates"  &&<TemplatesTab data={local} cid={cid} save={save} fire={fire} cl={myClub}/>}
        {tab==="helpers"    &&<HelpersTab data={local} cid={cid} myTids={myTids} session={session} save={save} fire={fire} cl={myClub}/>}
        {tab==="training"  &&<TrainingPlanTab data={local} myTids={myTids} save={save} fire={fire} cl={myClub} session={session}/>}
        {tab==="jerseys"    &&<><AffiliateBanner trigger="jerseys"/><JerseysTab data={local} myTids={myTids} save={save} fire={fire} cl={myClub}/></> }
        {tab==="fields"     &&<FieldsTab data={local} myTids={myTids} session={session} save={save} fire={fire} cl={myClub}/>}
        {tab==="attendance" &&<AttendanceTab data={local} myTids={myTids} cl={myClub}/>}
        {tab==="results"    &&<LeagueTab data={local} myTids={myTids} cl={myClub} save={save} fire={fire}/>}
        {tab==="inbox"      &&<InboxTab data={local} cid={cid} save={save} fire={fire} cl={myClub}/>}
        {tab==="chat"       &&<ChatTab data={local} cid={cid} myTids={myTids} session={session} save={save} fire={fire} cl={myClub}/>}
        {tab==="teams"      &&isAdmin&&<TeamsTab data={local} cid={cid} save={save} fire={fire}/>}
        {tab==="overview"  &&isAdmin&&<AllTeamsOverview data={local} cid={cid} cl={myClub} onSelectTeam={tid=>{ const team=(local.teams||[]).find(x=>x.id===tid); if(team) fire("Team: "+team.name); }}/>}
        {tab==="news"      &&<NewsTab data={local} cid={cid} session={session} save={save} fire={fire} cl={myClub}/>}
        {tab==="fieldsadmin"&&isAdmin&&<FieldsManagerTab data={local} cid={cid} save={save} fire={fire} cl={myClub}/> }
        {tab==="trainers"   &&isAdmin&&<TrainersTab data={local} cid={cid} save={save} fire={fire} session={session}/>}
        {tab==="branding"   &&isAdmin&&<BrandingTab cl={myClub} onSave={c=>{save({...local,clubs:local.clubs.map(x=>x.id===c.id?c:x)});fire("Design gespeichert *");}}/>}
        {tab==="visibility" &&isAdmin&&<VisibilityTab data={local} cid={cid} save={save} fire={fire} cl={myClub}/>}
        {tab==="settings"   &&isAdmin&&<ClubAdminSettings data={local} cid={cid} save={save} fire={fire} cl={myClub}/>}
        {tab==="security"   &&isAdmin&&<SecurityTab data={local} cid={cid} save={save}/>}
        {tab==="access"     &&isAdmin&&<AccessManagerTab data={local} cid={cid} save={save} fire={fire} cl={myClub}/>}
        {tab==="team"       &&<TeamHub data={local} myTids={myTids} save={save} fire={fire} cl={myClub} session={session}/>}
      </div>

      {}
      {viewEv&&<Drawer onClose={()=>setViewEv(null)} title={viewEv.title}>
        <VoteOverview ev={viewEv} players={local.players} teams={local.teams} myTids={myTids} cl={myClub}
          onSetDeadline={deadline=>{
            save({...local,events:local.events.map(e=>e.id===viewEv.id?{...e,deadline}:e)});
            setViewEv(prev=>({...prev,deadline}));
            fire("Frist gesetzt *");
          }}
        />
        <div style={{height:14}}/><Btn full ch="Schließen" v="gst" onClick={()=>setViewEv(null)}/>
      </Drawer>}

      {}
      {delConf&&<Drawer onClose={()=>setDelConf(null)} title="Termin löschen?">
        <div style={{background:"#fff5f5",borderRadius:14,padding:"14px",marginBottom:16,border:"1.5px solid #fecaca"}}>
          <p style={{fontSize:14,color:"#7f1d1d",fontWeight:600}}>"{delConfVal}"</p>
          {local.events.find(e=>e.id===delConf)?.sid&&<p style={{fontSize:13,color:"#b45309",marginTop:6}}> Dieser Termin ist Teil einer Terminserie.</p>}
        </div>
        <div style={{display:"flex",flexDirection:"column",gap:9}}>
          <Btn v="red" full ch="Nur diesen Termin löschen" icon="**" onClick={()=>{
            save({...local,events:local.events.filter(e=>e.id!==delConf)});
            setDelConf(null);setDelConfVal(null);fire("Termin gelöscht");
          }}/>
          {local.events.find(e=>e.id===delConf)?.sid&&<>
            <Btn v="red" full ch="Diesen + alle zukuenftigen löschen" icon="**" onClick={()=>{
              const ev=local.events.find(e=>e.id===delConf);
              save({...local,events:local.events.filter(e=>!(e.sid===ev.sid&&e.date>=ev.date))});
              setDelConf(null);setDelConfVal(null);fire("Serientermine gelöscht");
            }}/>
            <Btn v="red" full ch="Gesamte Serie löschen" icon="**" onClick={()=>{
              const ev=local.events.find(e=>e.id===delConf);
              save({...local,events:local.events.filter(e=>e.sid!==ev.sid)});
              setDelConf(null);setDelConfVal(null);fire("Gesamte Serie gelöscht");
            }}/>
          </>}
          <Btn v="gst" full ch="Abbrechen" onClick={()=>setDelConf(null)}/>
        </div>
      </Drawer>}

      {}
      {editConf&&<Drawer onClose={()=>setEditConf(null)} title="Was bearbeiten?">
        <div style={{background:"#fffbeb",borderRadius:14,padding:"14px",marginBottom:16,border:"1.5px solid #fde68a"}}>
          <p style={{fontSize:14,color:"#92400e",fontWeight:600}}>"{editConf.title}"</p>
          {editConf.sid&&<p style={{fontSize:13,color:"#b45309",marginTop:6}}> Dieser Termin ist Teil einer Serie.</p>}
        </div>
        <div style={{display:"flex",flexDirection:"column",gap:9}}>
          <Btn full ch="Nur diesen Termin bearbeiten" icon="**" cl={myClub} onClick={()=>{
            setEditEv(editConf);setEditConf(null);
          }}/>
          {editConf.sid&&<Btn full ch="Diesen + alle zukuenftigen bearbeiten" icon="**" cl={myClub} onClick={()=>{
            setEditEv({...editConf,_editSeries:"future"});setEditConf(null);
          }}/>}
          <Btn v="gst" full ch="Abbrechen" onClick={()=>setEditConf(null)}/>
        </div>
      </Drawer>}

      {showOnboarding&&<OnboardingWizard cl={myClub} data={local} save={save} fire={fire} onDone={()=>setShowOnboarding(false)}/>}
      <Toast msg={toast}/>
      <BottomNav tab={tab} setTab={setTab} isAdmin={isAdmin} isHelper={isHelper}
        unread={unreadMsgs} cl={myClub} />
      </div>
      </div>
    </div>
  );
}

function VoteOverview({ev,players,teams,myTids,cl,onSetDeadline}) {
  const p = cl?.pri||"#16a34a";
  const [showDeadlineForm,setShowDL]=useState(false);
  const [dlDate,setDlDate]=useState(ev.deadline?.date||"");
  const [dlTime,setDlTime]=useState(ev.deadline?.time||"");
  const teamPlayers = (players[ev.tid]||[]);
  const totalPlayers = teamPlayers.length;
  const dlPassed = ev.deadline && (now()>ev.deadline.date || (now()===ev.deadline.date && new Date().getHours()*60+new Date().getMinutes() > parseInt(ev.deadline.time?.replace(":",""))||0));
  const dlLabel  = ev.deadline ? `${ev.deadline.date} ${ev.deadline.time||""}`.trim() : null;
  const getVal  = v => typeof v==="object"&&v!==null&&!Array.isArray(v) ? v.val : v;
  const getTs   = v => typeof v==="object"&&v!==null&&!Array.isArray(v) ? v.ts  : null;
  const isLate  = (name) => {
    if(!ev.deadline) return false;
    const ts = getTs(ev.votes[name]);
    if(!ts) return false;
    const voted = new Date(ts);
    const dl    = new Date(`${ev.deadline.date}T${ev.deadline.time||"23:59"}:00`);
    return voted > dl;
  };

  const voted   = Object.entries(ev.votes);
  const yes     = voted.filter(([,v])=>getVal(v)==="yes").map(([n])=>n);
  const no      = voted.filter(([,v])=>getVal(v)==="no" ).map(([n])=>n);
  const missing = teamPlayers.filter(n=>!ev.votes[n]);
  const lateVoters = voted.filter(([n])=>isLate(n)).map(([n])=>n);
  // Late arrivals: yes votes with .late field
  const lateArrivals = voted.filter(([,v])=>typeof v==="object"&&v!==null&&v.val==="yes"&&v.late)
    .map(([n,v])=>({name:n,mins:v.late}))
    .sort((a,b)=>a.mins-b.mins);

  const pct = total => totalPlayers>0 ? Math.round((total/totalPlayers)*100) : 0;

  return (
    <div>
      {}
      <div style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:8,marginBottom:lateArrivals.length>0?8:16}}>
        {[
          {label:"Dabei",val:yes.length,color:"#16a34a",bg:"#dcfce7",icon:"OK"},
          {label:"Nicht dabei",val:no.length,color:"#dc2626",bg:"#fee2e2",icon:"X"},
          {label:"Fehlt noch",val:missing.length,color:"#d97706",bg:"#fef3c7",icon:"?"},
        ].map(s=>(
          <div key={s.label} style={{background:s.bg,borderRadius:14,padding:"12px 8px",textAlign:"center",border:`1.5px solid ${s.color}22`}}>
            <div style={{fontWeight:900,fontSize:22,color:s.color,lineHeight:1}}>{s.val}</div>
            <div style={{fontSize:10,fontWeight:700,color:s.color,marginTop:3,opacity:.8}}>{s.label}</div>
          </div>
        ))}
      </div>

      {/* Verspätungen - prominent für Trainer */}
      {lateArrivals.length>0&&(
        <div style={{background:"#fef3c7",borderRadius:13,padding:"11px 14px",border:"2px solid #f59e0b",marginBottom:16}}>
          <div style={{fontWeight:800,fontSize:13,color:"#92400e",marginBottom:8}}>
            Verspätungen ({lateArrivals.length})
          </div>
          <div style={{display:"flex",flexDirection:"column",gap:6}}>
            {lateArrivals.map(l=>(
              <div key={l.name} style={{display:"flex",alignItems:"center",gap:10,background:"rgba(255,255,255,.7)",borderRadius:9,padding:"7px 11px"}}>
                <Av name={l.name} sz={28}/>
                <span style={{fontWeight:700,fontSize:13,color:"#334155",flex:1}}>{l.name}</span>
                <span style={{fontWeight:900,fontSize:14,color:"#d97706",background:"#fff",borderRadius:8,padding:"3px 10px",border:"1.5px solid #fde68a"}}>
                  +{l.mins} Min
                </span>
              </div>
            ))}
          </div>
          <div style={{fontSize:11,color:"#92400e",marginTop:8,lineHeight:1.5}}>
            Tipp: {lateArrivals.map(l=>l.name).join(", ")} {lateArrivals.length===1?"kommt":"kommen"} verspätet - beim Aufwaermen einplanen.
          </div>
        </div>
      )}

      {}
      <div style={{marginBottom:16}}>
        <div style={{display:"flex",justifyContent:"space-between",marginBottom:6}}>
          <span style={{fontSize:12,fontWeight:700,color:"#64748b"}}>Ruecklauf</span>
          <span style={{fontSize:12,fontWeight:700,color:p}}>{voted.length}/{totalPlayers} ({pct(voted.length)}%)</span>
        </div>
        <div style={{height:8,borderRadius:99,background:"#e2e8f0",overflow:"hidden",display:"flex"}}>
          <div style={{height:"100%",background:"#16a34a",width:`${pct(yes.length)}%`,transition:"width .4s ease"}}/>
          <div style={{height:"100%",background:"#dc2626",width:`${pct(no.length)}%`,transition:"width .4s ease"}}/>
        </div>
        <div style={{display:"flex",gap:12,marginTop:5}}>
          <span style={{fontSize:11,color:"#16a34a",fontWeight:600}}>? Dabei {pct(yes.length)}%</span>
          <span style={{fontSize:11,color:"#dc2626",fontWeight:600}}>? Nicht dabei {pct(no.length)}%</span>
          <span style={{fontSize:11,color:"#94a3b8",fontWeight:600}}>? Offen {pct(missing.length)}%</span>
        </div>
      </div>

      {}
      <div style={{background:"#f8fafc",borderRadius:14,padding:"12px 14px",marginBottom:16,border:"1.5px solid #e2e8f0"}}>
        <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",gap:10}}>
          <div>
            <div style={{fontWeight:700,fontSize:13,color:"#334155"}}> Abstimmungs-Frist</div>
            {dlLabel
              ? <div style={{fontSize:12,marginTop:3,fontWeight:600,color:dlPassed?"#dc2626":"#16a34a"}}>
                  {dlPassed?"* Abgelaufen:":"* Bis:"} {dlLabel}
                  {lateVoters.length>0&&<span style={{color:"#d97706",marginLeft:6}}>. {lateVoters.length} zu spät</span>}
                </div>
              : <div style={{fontSize:12,color:"#94a3b8",marginTop:2}}>Keine Frist gesetzt</div>
            }
          </div>
          <button onClick={()=>setShowDL(s=>!s)}
            style={{padding:"6px 12px",borderRadius:9,border:`1.5px solid ${p}`,background:p+"15",color:p,fontWeight:700,fontSize:12,cursor:"pointer",whiteSpace:"nowrap",fontFamily:"inherit"}}>
            {dlLabel?"** Ändern":"+ Frist setzen"}
          </button>
        </div>
        {showDeadlineForm&&(
          <div style={{marginTop:12,paddingTop:12,borderTop:"1px solid #e2e8f0"}} className="in">
            <div style={{display:"flex",gap:8,marginBottom:8}}>
              <div style={{flex:1}}><Inp label="Datum" val={dlDate} set={setDlDate} type="date" cl={cl}/></div>
              <div style={{flex:1}}><Inp label="Uhrzeit" val={dlTime} set={setDlTime} type="time" cl={cl}/></div>
            </div>
            <div style={{display:"flex",gap:8}}>
              <button onClick={()=>{onSetDeadline({date:dlDate,time:dlTime});setShowDL(false);}}
                disabled={!dlDate}
                style={{flex:1,padding:"10px",borderRadius:10,border:"none",background:dlDate?p:"#e2e8f0",color:dlDate?"#fff":"#94a3b8",fontWeight:700,fontSize:13,cursor:dlDate?"pointer":"default",fontFamily:"inherit"}}>
                 Speichern
              </button>
              {dlLabel&&<button onClick={()=>{onSetDeadline(null);setShowDL(false);}}
                style={{padding:"10px 14px",borderRadius:10,border:"1.5px solid #fecaca",background:"#fff7f7",color:"#dc2626",fontWeight:700,fontSize:13,cursor:"pointer",fontFamily:"inherit"}}>
                Entfernen
              </button>}
              <button onClick={()=>setShowDL(false)}
                style={{padding:"10px 14px",borderRadius:10,border:"1.5px solid #e2e8f0",background:"#fff",color:"#64748b",fontWeight:700,fontSize:13,cursor:"pointer",fontFamily:"inherit"}}>
                Abbrechen
              </button>
            </div>
          </div>
        )}
      </div>

      {}
      {voted.length>0&&<>
        <div style={{fontSize:11,fontWeight:800,color:"#64748b",letterSpacing:.5,marginBottom:8}}>ABSTIMMUNGEN ({voted.length})</div>
        <div style={{display:"flex",flexDirection:"column",gap:6,marginBottom:14,maxHeight:"35dvh",overflowY:"auto"}}>
          {[...voted].sort((a,b)=>{
            const va=getVal(a[1])==="yes"?0:1,vb=getVal(b[1])==="yes"?0:1;
            return va-vb;
          }).map(([name,rawVal])=>{
            const val=getVal(rawVal); const late=isLate(name); const ts=getTs(rawVal);
            return (
              <div key={name} style={{display:"flex",alignItems:"center",gap:10,background:late?"#fffbeb":val==="yes"?"#f0fdf4":"#fff5f5",borderRadius:12,padding:"10px 13px",border:`1px solid ${late?"#fde68a":val==="yes"?"#bbf7d0":"#fecaca"}`}}>
                <Av name={name} sz={34}/>
                <div style={{flex:1,minWidth:0}}>
                  <div style={{fontWeight:700,fontSize:14,color:"#0f172a"}}>{name}</div>
                  {ts&&<div style={{fontSize:11,color:"#94a3b8",marginTop:1}}>{new Date(ts).toLocaleDateString("de-DE",{day:"2-digit",month:"2-digit"})} {new Date(ts).toLocaleTimeString("de-DE",{hour:"2-digit",minute:"2-digit"})}</div>}
                </div>
                <div style={{display:"flex",alignItems:"center",gap:6}}>
                  {late&&<span style={{fontSize:11,fontWeight:700,color:"#d97706",background:"#fef3c7",borderRadius:6,padding:"2px 7px"}}> Zu spät</span>}
                  <span style={{fontSize:14,fontWeight:700,color:val==="yes"?"#16a34a":"#dc2626"}}>{val==="yes"?"* Dabei":"* Nicht dabei"}</span>
                </div>
              </div>
            );
          })}
        </div>
      </>}

      {}
      {missing.length>0&&<>
        <div style={{fontSize:11,fontWeight:800,color:"#d97706",letterSpacing:.5,marginBottom:8}}>NOCH NICHT ABGESTIMMT ({missing.length})</div>
        <div style={{display:"flex",flexDirection:"column",gap:6}}>
          {missing.map(name=>(
            <div key={name} style={{display:"flex",alignItems:"center",gap:10,background:"#fffbeb",borderRadius:12,padding:"10px 13px",border:"1px solid #fde68a"}}>
              <Av name={name} sz={34}/>
              <span style={{flex:1,fontWeight:700,fontSize:14,color:"#92400e"}}>{name}</span>
              <span style={{fontSize:12,color:"#d97706",fontWeight:600}}>? Ausstehend</span>
            </div>
          ))}
        </div>
      </>}
    </div>
  );
}

function DashRow({ev,cl,tod,onView,onEdit,onDel,onReset,onCopyLink}) {
  const eT=ET[ev.type]||ET.training; const tF=ev.date===tod; const p=cl?.pri||"#16a34a";
  const vc=Object.keys(ev.votes).length;
  const yes=ev.pt==="att"?Object.values(ev.votes).filter(v=>(typeof v==="object"?v.val:v)==="yes").length:0;
  const no =ev.pt==="att"?Object.values(ev.votes).filter(v=>(typeof v==="object"?v.val:v)==="no" ).length:0;
  const dlPassed = ev.deadline && now()>ev.deadline.date;
  const BtnSm=({onClick,label,icon,bg,col})=>(
    <button onClick={onClick} style={{display:"flex",alignItems:"center",gap:5,padding:"6px 11px",borderRadius:9,border:"none",background:bg,color:col,fontSize:12,fontWeight:700,cursor:"pointer",whiteSpace:"nowrap",fontFamily:"inherit"}}>
      <span style={{fontSize:14}}>{icon}</span>{label}
    </button>
  );
  return (
    <div style={{background:"#fff",borderRadius:15,border:`1.5px solid ${tF?p:"#e2e8f0"}`,marginBottom:8,overflow:"hidden",boxShadow:"0 1px 6px rgba(0,0,0,.04)"}}>
      <div style={{padding:"12px 14px",display:"flex",gap:10,alignItems:"center"}}>\
        <div style={{width:42,height:42,borderRadius:13,background:eT.bg,display:"flex",alignItems:"center",justifyContent:"center",fontSize:20,flexShrink:0}}>{eT.icon}</div>
        <div style={{flex:1,minWidth:0}}>
          <div style={{display:"flex",alignItems:"center",gap:6,flexWrap:"wrap"}}><span style={{fontWeight:800,fontSize:14,color:"#0f172a",overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{ev.title}</span>{tF&&<Tag c={p} bg={p+"20"} ch="Heute"/>}{ev.open&&<Tag c="#7c3aed" bg="#ede9fe" ch="* Offen"/>}{ev.sid&&<Tag c="#94a3b8" bg="#f1f5f9" ch="* Serie"/>}</div>
          <div style={{fontSize:12,color:"#64748b",marginTop:3}}>{fmtDShort(ev.date)}{ev.time?" . "+ev.time:""}{ev.loc?" . *"+ev.loc:""}</div>
          {vc>0&&<div style={{display:"flex",gap:5,marginTop:4,flexWrap:"wrap"}}>{ev.pt==="att"?<><Tag c="#16a34a" ch={`* ${yes}`}/><Tag c="#dc2626" bg="#fee2e2" ch={`* ${no}`}/></>:<Tag c="#2563eb" ch={`* ${vc} Einträge`}/>}</div>}
          {ev.deadline&&<div style={{marginTop:4}}><span style={{fontSize:11,fontWeight:700,color:dlPassed?"#dc2626":"#d97706",background:dlPassed?"#fee2e2":"#fef3c7",borderRadius:6,padding:"2px 8px"}}> {dlPassed?"Frist abgelaufen":"Frist: "}{!dlPassed&&ev.deadline.date}</span></div>}
        </div>
      </div>
      {}
      <div style={{display:"flex",gap:6,padding:"8px 12px 10px",borderTop:"1px solid #f1f5f9",flexWrap:"wrap"}}>
        <BtnSm onClick={onView}  icon="*" label="Ansehen"   bg="#f1f5f9" col="#475569"/>
        <BtnSm onClick={onEdit}  icon="**" label="Bearbeiten" bg="#f0fdf4" col="#16a34a"/>
        <BtnSm onClick={onReset} icon="*" label="Zurücksetzen" bg="#fff7ed" col="#d97706"/>
        {ev.open&&<BtnSm onClick={onCopyLink} icon="*" label="Link kopieren" bg="#ede9fe" col="#7c3aed"/>}
        <BtnSm onClick={onDel}   icon="*" label="Löschen"   bg="#fee2e2" col="#dc2626"/>
      </div>
    </div>
  );
}

function AvPhoto({name,photo,sz=32}) {
  if(photo) return <img src={photo} alt={name} style={{width:sz,height:sz,borderRadius:"50%",objectFit:"cover",flexShrink:0,border:"2px solid rgba(255,255,255,.7)",boxShadow:"0 1px 4px rgba(0,0,0,.15)"}}/>;
  return <Av name={name} sz={sz}/>;
}

function LegalModal({onAccept,onDecline}) {
  return (
    <div style={{position:"fixed",inset:0,background:"rgba(0,0,0,.75)",zIndex:1000,display:"flex",alignItems:"flex-end",justifyContent:"center",backdropFilter:"blur(8px)"}}>
      <div style={{background:"#fff",borderRadius:"22px 22px 0 0",width:"100%",maxWidth:520,maxHeight:"88dvh",overflowY:"auto",animation:"down .26s ease"}}>
        <div style={{display:"flex",justifyContent:"center",padding:"12px 0 4px"}}><div style={{width:44,height:4,borderRadius:99,background:"#e2e8f0"}}/></div>
        <div style={{padding:"4px 22px 44px"}}>
          <div style={{textAlign:"center",marginBottom:18}}>
            <div style={{fontSize:44,marginBottom:8}}></div>
            <h2 style={{fontWeight:900,fontSize:20,color:"#0f172a",marginBottom:4}}>Hinweis vor dem Upload</h2>
            <p style={{fontSize:13,color:"#64748b"}}>Bitte lies diesen Hinweis sorgfaeltig durch</p>
          </div>

          <div style={{background:"#fff7ed",borderRadius:14,padding:"16px",border:"1.5px solid #fed7aa",marginBottom:14}}>
            <p style={{fontSize:13,fontWeight:800,color:"#c2410c",marginBottom:10}}>Datenschutz & Eigenverantwortung</p>
            <div style={{fontSize:13,color:"#9a3412",lineHeight:1.75,display:"flex",flexDirection:"column",gap:7}}>
              <p> Das Profilbild wird <strong>auf eigene Gefahr</strong> hochgeladen und gespeichert.</p>
              <p> Diese App wird von einem ehrenamtlichen Vereinsadmin betrieben - es handelt sich <strong>nicht um einen kommerziellen Dienst</strong>.</p>
              <p> Der Vereinsadmin sowie der Betreiber dieser App übernehmen <strong>keinerlei Haftung</strong> für Verlust,Diebstahl,Missbrauch oder unbefugten Zugriff auf hochgeladene Bilder oder gespeicherte Daten.</p>
              <p> Du kannst dein Bild jederzeit selbst entfernen. Eine vollstaendige Löschung aus allen Systemen kann <strong>nicht garantiert</strong> werden.</p>
              <p> Lade <strong>keine Bilder von Minderjaehrigen</strong> hoch,es sei denn,du bist erziehungsberechtigt und hast ausdruecklich zugestimmt.</p>
              <p> Mit dem Upload bestaetigst du,dass du <strong>auf eigenes Risiko</strong> handelst und alle Bedingungen akzeptierst.</p>
            </div>
          </div>

          <div style={{background:"#f8fafc",borderRadius:12,padding:"12px 14px",border:"1px solid #e2e8f0",marginBottom:18,fontSize:11,color:"#64748b",lineHeight:1.7}}>
            <strong>Haftungsausschluss (? 8 TMG):</strong> Der Vereinsadmin haftet nicht für Schaeden durch die Nutzung dieser Funktion - einschließlich Datenverlust,unberechtigte Zugriffe Dritter oder Weitergabe von Daten bei einem Sicherheitsvorfall. Die Nutzung erfolgt freiwillig und vollstaendig auf eigene Verantwortung der hochladenden Person.
          </div>

          <div style={{display:"flex",flexDirection:"column",gap:10}}>
            <button onClick={onAccept}
              style={{width:"100%",padding:"14px",borderRadius:14,border:"none",background:"#16a34a",color:"#fff",fontWeight:800,fontSize:15,cursor:"pointer",fontFamily:"inherit",boxShadow:"0 4px 14px rgba(22,163,74,.35)"}}>
               Verstanden - Bild hochladen
            </button>
            <button onClick={onDecline}
              style={{width:"100%",padding:"13px",borderRadius:14,border:"1.5px solid #e2e8f0",background:"#fff",color:"#475569",fontWeight:700,fontSize:14,cursor:"pointer",fontFamily:"inherit"}}>
              Abbrechen
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function PhotoUploader({photo,name,onSave,onRemove,t}) {
  const [showLegal,setShowLegal] = useState(false);
  const [pending,setPending]     = useState(null);
  const fileRef = useRef(null);

  const handleFile = e => {
    const f = e.target.files?.[0];
    if (!f) return;
    if (f.size > 3*1024*1024) { alert("Bild zu gross - bitte max. 3 MB."); return; }
    const r = new FileReader();
    r.onload = ev => { setPending(ev.target.result); setShowLegal(true); };
    r.readAsDataURL(f);
    e.target.value = "";
  };

  const accept  = () => { onSave(pending); setPending(null); setShowLegal(false); };
  const decline = () => { setPending(null); setShowLegal(false); };

  return (
    <>
      {showLegal && <LegalModal onAccept={accept} onDecline={decline}/>}
      <input ref={fileRef} type="file" accept="image/*" style={{display:"none"}} onChange={handleFile}/>
      {pending && (
        <div style={{marginTop:10,borderRadius:12,overflow:"hidden",
          border:"1.5px solid #e2e8f0",maxWidth:200}}>
          <img src={pending} alt="Vorschau"
            style={{width:"100%",display:"block",maxHeight:150,objectFit:"cover"}}/>
        </div>
      )}
      <button onClick={()=>fileRef.current?.click()}
        style={{marginTop:8,padding:"9px 16px",borderRadius:10,border:"none",
          background:"#e2e8f0",fontWeight:700,fontSize:13,cursor:"pointer",
          fontFamily:"inherit"}}>
        {photo ? "Bild ändern" : "Bild hochladen"}
      </button>
      {photo && (
        <button onClick={onRemove}
          style={{marginTop:6,padding:"7px 14px",borderRadius:9,border:"none",
            background:"#fee2e2",color:"#dc2626",fontWeight:700,fontSize:12,
            cursor:"pointer",fontFamily:"inherit"}}>
          Bild entfernen
        </button>
      )}
    </>
  );
}

function CarpoolWizard({ev,user,onSave,onClose,cl}) {
  return <div style={{padding:16,textAlign:"center",color:"#64748b"}}><p>Fahrgemeinschaft-Funktion in Entwicklung.</p><button onClick={onClose} style={{marginTop:12,padding:"10px 20px",borderRadius:10,border:"none",background:TH(cl).p,color:"#fff",fontWeight:700,cursor:"pointer",fontFamily:"inherit"}}>Schließen</button></div>;
}

function PollCarpool({ev,user,onVote,cl}) {
  return <PollAttend ev={ev} user={user} onVote={onVote} cl={cl}/>;
}

function TournInviteSection({ev,onUpdate,cl}) {
  return <div style={{background:"#f8fafc",borderRadius:12,padding:"14px",fontSize:13,color:"#64748b"}}>Einladungs-Verwaltung (Einstellungen)</div>;
}

function TournStats({ev,cl}) {
  return <div style={{background:"#f8fafc",borderRadius:12,padding:"14px",fontSize:13,color:"#64748b"}}>Turnier-Statistiken</div>;
}

function buildSchedule(setup){return[];}
function exportTournPDF(ev){alert("PDF-Export in Entwicklung");}

function TournView({ ev,user,onVote,onUpdate,cl,players,isHelper=false }) {
  const t=TH(cl);
  const setup=ev.setup||{};
  const [stab,setStab]=useState("info");
  const TABS=isHelper
    ?[["info","Info"],["plan","Plan"],["timer","Timer"],["split","Split"],["stats","Stats"]]
    :[["info","Info"],["setup","Setup"],["plan","Plan"],["timer","Timer"],["split","Split"],["stats","Stats"]];
  return (
    <div>
      <div style={{display:"flex",gap:6,marginBottom:12,overflowX:"auto",scrollbarWidth:"none",WebkitOverflowScrolling:"touch"}}>
        {TABS.map(([id,lb])=>(
          <button key={id} onClick={()=>setStab(id)}
            style={{padding:"7px 13px",borderRadius:99,border:`2px solid ${stab===id?t.p:"#e2e8f0"}`,background:stab===id?t.p:"#fff",color:stab===id?"#fff":"#475569",fontWeight:700,fontSize:12,cursor:"pointer",whiteSpace:"nowrap",fontFamily:"inherit",flexShrink:0}}>
            {lb}
          </button>
        ))}
      </div>
      {stab==="info"&&<PollAttend ev={ev} user={user} onVote={onVote} cl={cl}/>}
      {stab==="setup"&&!isHelper&&<div style={{background:"#f8fafc",borderRadius:14,padding:"14px"}}>
        <p style={{fontWeight:700,color:"#334155",marginBottom:8}}>Turnier-Setup</p>
        <p style={{fontSize:13,color:"#64748b"}}>Verein: {setup.clubName||cl?.name}</p>
        <p style={{fontSize:13,color:"#64748b"}}>Felder: {setup.fields||2} | Spielzeit: {setup.gameTime||8} Min</p>
        <p style={{fontSize:13,color:"#64748b"}}>Teams: {(setup.clubs||[]).length || "-"}</p>
      </div>}
      {stab==="plan"&&<div style={{background:"#f8fafc",borderRadius:14,padding:"14px"}}>
        <p style={{fontWeight:700,color:"#334155",marginBottom:8}}>Spielplan</p>
        {(ev.schedule||[]).length===0
          ? <p style={{fontSize:13,color:"#94a3b8"}}>Noch kein Spielplan generiert.</p>
          : (ev.schedule||[]).map((g,i)=>(
            <div key={i} style={{padding:"8px 0",borderBottom:"1px solid #e2e8f0",fontSize:13}}>
              <span style={{color:"#64748b"}}>Feld {g.field} . {g.time}</span>
              <span style={{marginLeft:10,fontWeight:700}}>{g.a} vs {g.b}</span>
            </div>
          ))
        }
      </div>}
      {stab==="timer"&&<CompactTimer ev={ev} cl={cl}/>}
      {stab==="split"&&<div style={{background:"#f8fafc",borderRadius:14,padding:"14px"}}>
        <p style={{fontWeight:700,color:"#334155",marginBottom:8}}>Team-Aufteilung</p>
        <p style={{fontSize:13,color:"#64748b"}}>Spieler zufaellig auf Teams aufteilen.</p>
      </div>}
      {stab==="stats"&&<div style={{background:"#f8fafc",borderRadius:14,padding:"14px"}}>
        <p style={{fontWeight:700,color:"#334155",marginBottom:8}}>Statistiken</p>
        <p style={{fontSize:13,color:"#64748b"}}>Hier erscheinen Turnier-Statistiken.</p>
      </div>}
    </div>
  );
}

function CompactTimer({ ev,cl }) {
  const t=TH(cl);
  const fields=(ev.setup?.fields||2);
  const dur=(ev.setup?.gameTime||8)*60;
  const [times,setTimes]=useState(()=>Array.from({length:fields},()=>({sec:0,running:false})));
  useEffect(()=>{
    const iv=setInterval(()=>{
      setTimes(prev=>prev.map(f=>f.running?{...f,sec:Math.min(f.sec+1,dur*2)}:f));
    },1000);
    return()=>clearInterval(iv);
  },[]);
  const fmt=s=>`${String(Math.floor(s/60)).padStart(2,"0")}:${String(s%60).padStart(2,"0")}`;
  return (
    <div style={{display:"flex",flexDirection:"column",gap:10}}>
      {times.map((f,i)=>(
        <div key={i} style={{background:"#fff",borderRadius:14,padding:"14px",border:"1.5px solid #e2e8f0"}}>
          <div style={{fontWeight:700,marginBottom:6}}>Feld {i+1}</div>
          <div style={{fontWeight:900,fontSize:36,color:f.sec>=dur?"#dc2626":t.p,fontFamily:"monospace",marginBottom:8}}>{fmt(f.sec)}</div>
          <div style={{display:"flex",gap:8}}>
            <button onClick={()=>setTimes(p=>p.map((x,j)=>j===i?{...x,running:!x.running}:x))}
              style={{flex:1,padding:"9px",borderRadius:10,border:"none",background:t.p,color:"#fff",fontWeight:700,cursor:"pointer",fontFamily:"inherit"}}>
              {f.running?"Pause":"Start"}
            </button>
            <button onClick={()=>setTimes(p=>p.map((x,j)=>j===i?{sec:0,running:false}:x))}
              style={{padding:"9px 14px",borderRadius:10,border:"1.5px solid #e2e8f0",background:"#fff",fontWeight:700,cursor:"pointer",fontFamily:"inherit"}}>
              Reset
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}

function EvCard({ev,user,expanded,onToggle,onVote,cl,players,role="user"}) {
  const isTrainerOrHelper = role==="trainer"||role==="helper"||role==="admin";
  const eT=ET[ev.type]||ET.training;const isToday=ev.date===now();const isPast=ev.date<now();
  const uv=ev.votes[user];const uvVal=typeof uv==="object"&&uv!==null?uv.val:uv;
  const p=cl?.pri||"#16a34a";
  let status=null;
  if(ev.pt==="att"){
    if(uvVal==="yes")status={icon:"OK",label:"Ich bin dabei",color:"#16a34a",bg:"#dcfce7",urgent:false};
    else if(uvVal==="no")status={icon:"*",label:"Nicht dabei",color:"#dc2626",bg:"#fee2e2",urgent:false};
    else if(!isPast)status={icon:"*",label:"Noch nicht abgestimmt",color:"#d97706",bg:"#fef3c7",urgent:true};
  } else if(ev.pt==="list"){
    const mc=Array.isArray(uv)?uv:[];
    if(mc.length>0)status={icon:"Liste",label:`${mc.length} ausgewählt`,color:"#16a34a",bg:"#dcfce7",urgent:false};
    else if(!isPast)status={icon:"Liste",label:"Auswahl fehlt noch",color:"#d97706",bg:"#fef3c7",urgent:true};
  } else if(ev.pt==="carpool"){
    const hN=!!ev.carpoolNeeds?.[user];const hO=!!ev.carpoolOffers?.[user];
    const isP=Object.values(ev.carpoolOffers||{}).some(o=>(o.passengers||[]).includes(user));
    if(hO)status={icon:"*",label:"Ich fahre",color:"#16a34a",bg:"#dcfce7",urgent:false};
    else if(isP){const dr=Object.entries(ev.carpoolOffers||{}).find(([,o])=>(o.passengers||[]).includes(user))?.[0];status={icon:"*",label:`Mitfahrt bei ${dr}`,color:"#16a34a",bg:"#dcfce7",urgent:false};}
    else if(hN)status={icon:"*",label:"Mitfahrt angefragt",color:"#d97706",bg:"#fef3c7",urgent:false};
    else if(!isPast)status={icon:"*",label:"Noch nicht eingetragen",color:"#64748b",bg:"#f1f5f9",urgent:false};
  }
  const yesN=Object.values(ev.votes).filter(v=>(typeof v==="object"?v.val:v)==="yes").length;
  return (
    <div style={{background:"#fff",borderRadius:20,boxShadow:expanded?"0 8px 32px rgba(0,0,0,.11)":"0 2px 10px rgba(0,0,0,.05)",border:`2px solid ${expanded?p:status?.urgent?"#fde68a":"#e2e8f0"}`,overflow:"hidden",transition:"all .2s",opacity:isPast&&!expanded?.7:1}}>
      {status?.urgent&&!expanded&&!isPast&&<div style={{background:"#fffbeb",borderBottom:"1px solid #fde68a",padding:"6px 17px",display:"flex",alignItems:"center",gap:6}}><span style={{fontSize:13}}></span><span style={{fontSize:12,fontWeight:700,color:"#d97706"}}>Deine Antwort fehlt noch!</span></div>}
      <div onClick={onToggle} style={{padding:"14px 17px",cursor:"pointer",display:"flex",alignItems:"center",gap:12}}>
        <div style={{width:48,height:48,borderRadius:15,background:eT.bg,display:"flex",alignItems:"center",justifyContent:"center",fontSize:24,flexShrink:0}}>{eT.icon}</div>
        <div style={{flex:1,minWidth:0}}>
          <div style={{display:"flex",alignItems:"center",gap:6,flexWrap:"wrap"}}>
            <span style={{fontWeight:900,fontSize:17,color:"#0f172a",overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{ev.title}</span>
            {isToday&&<Tag c={p} bg={p+"20"} ch="* Heute"/>}
            {ev.open&&<Tag c="#7c3aed" bg="#ede9fe" ch="* Offen"/>}
            {ev.sid&&<Tag c="#94a3b8" bg="#f1f5f9" ch="*" sm/>}
          </div>
          <div style={{display:"flex",alignItems:"center",gap:8,marginTop:4,flexWrap:"wrap"}}>
            <span style={{fontSize:13,color:"#64748b",fontWeight:600}}>{fmtD(ev.date)}{ev.time?" . "+ev.time:""}</span>
            {ev.loc&&<span style={{fontSize:12,color:"#94a3b8"}}> {ev.loc}</span>}
          </div>
          {status&&<div style={{marginTop:6,display:"flex",alignItems:"center",gap:8,flexWrap:"wrap"}}>
            <span style={{display:"inline-flex",alignItems:"center",gap:4,background:status.bg,color:status.color,borderRadius:8,padding:"3px 9px",fontSize:12,fontWeight:700}}>{status.icon} {status.label}</span>
            {!expanded&&yesN>0&&<Tag c={eT.col} bg={eT.bg} ch={`${yesN} dabei`} sm/>}
          </div>}
        </div>
        <div style={{color:"#cbd5e1",fontSize:22,transform:expanded?"rotate(180deg)":"none",transition:"transform .2s",flexShrink:0}}>?</div>
      </div>
      {expanded&&<div style={{padding:"0 17px 20px",borderTop:"1px solid #f1f5f9"}}>
        <div style={{height:14}}/>
        {ev.type==="turnier"&&isTrainerOrHelper?<TournView ev={ev} user={user} onVote={onVote} cl={cl} players={players} isHelper={role==="helper"}/>
          :ev.type==="turnier"?<PollAttend ev={ev} user={user} onVote={onVote} cl={cl}/>
          :ev.pt==="carpool"?<PollCarpool ev={ev} user={user} onVote={onVote} cl={cl}/>
          :ev.pt==="list"?<PollList ev={ev} user={user} onVote={onVote}/>
          :<PollAttend ev={ev} user={user} onVote={onVote} cl={cl}/>}
      </div>}
    </div>
  );
}

function UserHome({data,session,onSave,onLogout,lang="de"}) {
  const tr = (k) => T[lang]?.[k] ?? T.de[k] ?? k;
  const {tid,user,cid}=session;
  const cl=data.clubs.find(c=>c.id===cid);
  const myTeam=data.teams.find(x=>x.id===tid);
  const t=TH(cl); const tod=now();
  const evs=data.events.filter(e=>e.tid===tid).sort((a,b)=>a.date.localeCompare(b.date));
  const up=evs.filter(e=>e.date>=tod);
  const past=evs.filter(e=>e.date<tod).reverse();
  const [exp,setExp]=useState((up[0]||past[0])?.id||null);
  const [showPast,setSP]=useState(false);
  const [toast,setToast]=useState(null);
  const [showProfile,setShowProfile]=useState(false);
  const [ptab,setPtab]=useState("events");
  const toastRef=useRef(null);
  const fire=m=>{setToast(m);clearTimeout(toastRef.current);toastRef.current=setTimeout(()=>setToast(null),2200);};
  const photoKey=`photo_${cid}_${user}`;
  const [photo,setPhoto]=useState(null);
  const [photoLoading,setPhotoLoading]=useState(true);
  useEffect(()=>{
    (async()=>{
      try{
        const r=await window.storage?.get(photoKey,true);
        if(r?.value) setPhoto(r.value);
      }catch{}
      setPhotoLoading(false);
    })();
  },[photoKey]);
  const compressImage=(dataUrl,cb)=>{
    const img=new Image();
    img.onload=()=>{
      const MAX=220;
      const scale=Math.min(1,MAX/Math.max(img.width,img.height));
      const w=Math.round(img.width*scale),h=Math.round(img.height*scale);
      const canvas=document.createElement("canvas");
      canvas.width=w; canvas.height=h;
      canvas.getContext("2d").drawImage(img,0,0,w,h);
      cb(canvas.toDataURL("image/jpeg",0.82));
    };
    img.src=dataUrl;
  };

  const savePhoto=dataUrl=>{
    compressImage(dataUrl,async compressed=>{
      try{ await window.storage?.set(photoKey,compressed,true); }catch{}
      setPhoto(compressed);
      fire("Profilbild gespeichert *");
      setShowProfile(false);
    });
  };
  const removePhoto=async()=>{
    try{ await window.storage?.delete(photoKey,true); }catch{}
    setPhoto(null);
    fire("Bild entfernt");
  };

  const vote=(eid,pt,val)=>{
    const next={...data,events:data.events.map(e=>{
      if(e.id!==eid)return e;
      if(pt==="carpool")return val;
      const nv={...e.votes};const ts=new Date().toISOString();
      if(pt==="att"){
        const cur=nv[user];
        const curVal=typeof cur==="object"&&cur!==null?cur.val:cur;
        if(typeof val==="object"&&val!==null){ nv[user]={...val,ts}; }
        else if(curVal===val && !(typeof cur==="object"&&cur!==null&&cur.late)){ delete nv[user]; }
        else { nv[user]={val,ts}; }
      }
      else nv[user]=val;
      return{...e,votes:nv};
    })};
    onSave(next);fire("Gespeichert *");
  };

  const parentTabs = [
    {id:"events",label:"Termine",icon:"K",active:ptab==="events",onClick:()=>setPtab("events")},
    ...(feat("chat_team")?[{id:"chat",label:"Chat",icon:"C",active:ptab==="chat",onClick:()=>setPtab("chat")}]:[]),
    {id:"profil",label:"Profil",icon:"P",active:false,onClick:()=>setShowProfile(true)},
  ];
  return (
    <div style={{minHeight:"100dvh",background:"#f0f4f8",paddingBottom:80}}>
      <ClubHeader cl={cl} sub={`${myTeam?.icon||""} ${myTeam?.name||""}`}
        right={
          <div style={{display:"flex",alignItems:"center",gap:8,cursor:"pointer"}} onClick={()=>setShowProfile(true)}>
            {photoLoading
              ? <div style={{width:34,height:34,borderRadius:"50%",background:"rgba(255,255,255,.2)",animation:"pulse 1.5s ease infinite"}}/>
              : <AvPhoto name={user} photo={photo} sz={34}/>
            }
            <div style={{textAlign:"right"}}>
              <div style={{color:"#fff",fontSize:13,fontWeight:700}}>{user}</div>
              <div style={{color:"rgba(255,255,255,.5)",fontSize:11}}>Profil</div>
            </div>
          </div>
        }
      />

      {}
      {showProfile&&(
        <div style={{position:"fixed",inset:0,background:"rgba(0,0,0,.55)",zIndex:800,display:"flex",alignItems:"flex-end",justifyContent:"center",backdropFilter:"blur(8px)"}} onClick={()=>setShowProfile(false)}>
          <div onClick={e=>e.stopPropagation()} style={{background:"#fff",borderRadius:"22px 22px 0 0",width:"100%",maxWidth:520,padding:"12px 22px 48px",animation:"down .24s ease"}}>
            <div style={{display:"flex",justifyContent:"center",marginBottom:16}}><div style={{width:44,height:4,borderRadius:99,background:"#e2e8f0"}}/></div>
            <h3 style={{fontWeight:900,fontSize:18,color:"#0f172a",marginBottom:20,textAlign:"center"}}> Mein Profil</h3>
            <div style={{display:"flex",justifyContent:"center",marginBottom:18}}>
              <PhotoUploader photo={photo} name={user} onSave={savePhoto} onRemove={removePhoto} t={t}/>
            </div>
            <div style={{background:"#f8fafc",borderRadius:12,padding:"11px 14px",marginBottom:18,fontSize:13,color:"#64748b",textAlign:"center",fontWeight:600}}>
              Angemeldet als <strong style={{color:"#334155"}}>{user}</strong><br/>
              <span style={{fontSize:12}}>{myTeam?.name}</span>
            </div>
            <div style={{background:"#fffbeb",borderRadius:11,padding:"10px 13px",marginBottom:16,fontSize:12,color:"#92400e",lineHeight:1.6}}>
               <strong>Datenschutz:</strong> Dein Profilbild wird verschluesselt auf dem Server gespeichert und ist nur für dich sichtbar. Du kannst es jederzeit löschen.
            </div>
            <div style={{display:"flex",flexDirection:"column",gap:9}}>
              <button onClick={()=>setShowProfile(false)} style={{width:"100%",padding:"13px",borderRadius:13,border:"1.5px solid #e2e8f0",background:"#fff",color:"#475569",fontWeight:700,fontSize:14,cursor:"pointer",fontFamily:"inherit"}}>Schließen</button>
              <button onClick={()=>{setShowProfile(false);onLogout();}} style={{width:"100%",padding:"13px",borderRadius:13,border:"none",background:"#fee2e2",color:"#dc2626",fontWeight:700,fontSize:14,cursor:"pointer",fontFamily:"inherit"}}> Team wechseln / Abmelden</button>
            </div>
          </div>
        </div>
      )}

      {ptab==="events"&&<div style={{maxWidth:520,margin:"0 auto",padding:"16px 14px"}}>
        {up.length>0&&<>
          <Divider label="KOMMENDE TERMINE"/>
          {up.map((ev,i)=><div key={ev.id} className="up" style={{marginBottom:10,animationDelay:`${i*.05}s`}}><EvCard ev={ev} user={user} expanded={exp===ev.id} onToggle={()=>setExp(exp===ev.id?null:ev.id)} onVote={vote} cl={cl} players={data.players?.[tid]||[]} role="user"/></div>)}
        </>}
        {up.length===0&&<div style={{textAlign:"center",padding:"52px 20px"}}><Logo cl={cl} sz={64} sx={{margin:"0 auto 16px"}}/><p style={{fontWeight:800,fontSize:18,color:"#334155"}}>Keine anstehenden Termine</p><p style={{color:"#94a3b8",fontSize:14,marginTop:6}}>Der Trainer hat noch keine Termine angelegt.</p><div style={{marginTop:20}}><AdBanner/></div><PoweredBy/></div>}
        {past.length>0&&<>
          <button onClick={()=>setSP(s=>!s)} style={{display:"flex",alignItems:"center",gap:10,width:"100%",background:"none",border:"none",cursor:"pointer",margin:"18px 0 10px",padding:"4px 0"}}>
            <div style={{flex:1,height:1,background:"#e2e8f0"}}/><span style={{fontSize:11,fontWeight:800,color:"#94a3b8",whiteSpace:"nowrap"}}>{showPast?"?":"?"} VERGANGENE ({past.length})</span><div style={{flex:1,height:1,background:"#e2e8f0"}}/>
          </button>
          {showPast&&past.map(ev=><div key={ev.id} style={{marginBottom:10}}><EvCard ev={ev} user={user} expanded={exp===ev.id} onToggle={()=>setExp(exp===ev.id?null:ev.id)} onVote={vote} cl={cl} players={data.players?.[tid]||[]} role="user"/></div>)}
        </>}
      </div>}
      {ptab==="chat"&&<div style={{maxWidth:520,margin:"0 auto",padding:"16px 14px"}}>
        <ChatTab data={data} cid={cid} myTids={[tid]} session={session} save={onSave} fire={fire} cl={cl}/>
      </div>}
      <div style={{position:"fixed",left:0,right:0,bottom:0,background:"#fff",borderTop:"1px solid #e2e8f0",display:"flex",zIndex:100}}>
        {parentTabs.map(p=>(
          <button key={p.id} onClick={p.onClick} style={{flex:1,background:"none",border:"none",padding:"8px 4px 12px",cursor:"pointer",fontFamily:"inherit",display:"flex",flexDirection:"column",alignItems:"center",gap:3}}>
            <div style={{width:30,height:30,borderRadius:9,display:"flex",alignItems:"center",justifyContent:"center",fontWeight:900,fontSize:13,background:p.active?t.p:"#f1f5f9",color:p.active?"#fff":"#64748b"}}>{p.icon}</div>
            <span style={{fontSize:11,fontWeight:700,color:p.active?t.p:"#94a3b8"}}>{p.label}</span>
          </button>
        ))}
      </div>
      <Toast msg={toast}/>
    </div>
  );
}

export default function App() {
  return (
    <ErrorBoundary>
      <ThemeProvider>
        <AppRoot/>
      </ThemeProvider>
    </ErrorBoundary>
  );
}
function AppRoot() {
  const [lang,setLang] = useState(()=>localStorage.getItem(LANG_KEY)||navigator.language?.slice(0,2)||"de");
  return (
    <LangCtx.Provider value={lang in T ? lang : "de"}>
      <AppInner lang={lang} setLang={setLang}/>
    </LangCtx.Provider>
  );
}

function AppInner({lang,setLang}) {
  const [data,setData]    = useState(null);
  const [screen,setScr]   = useState("boot");
  const [cid,setCid]      = useState(null);
  const [session,setSess] = useState(null);
  const [showSetup,setShowSetup] = useState(false);
  const [showLegal,setShowLegal] = useState(false);
  const [showSuperAdmin,setShowSuperAdmin] = useState(
    ()=>new URLSearchParams(window.location.search).has("superadmin")
  );
  const [logoTaps,setLogoTaps] = useState(0);
  const isMaintenance = localStorage.getItem("va_maintenance")==="1"
    && !new URLSearchParams(window.location.search).has("superadmin");
  const [saveStatus,setSaveStatus] = useState(null); // null | "saving" | "saved" | "local"
  const syncRef  = useRef(null);
  const saveTimer= useRef(null);

  // Schritt 1: anonyme Sitzung beim Start herstellen (aendert Datenfluss noch nicht)
  useEffect(()=>{ ensureAuth(); },[]);

  useEffect(()=>{
    (async()=>{
      let d=null;
      try { d = await sb.get(); if(d?._v < 16) d=null; } catch {}
      if(!d) { d=seed(); try { await sb.set(d); } catch {} }
      setData(d);
      const s=sess.get();
      if(s){ setCid(s.cid); setSess(s); setScr(s.role==="user"?"user":"dash"); return; }
      setScr("dir");
    })();
    syncRef.current=setInterval(async()=>{
      try {
        const r=await sb.get();
        if(r?._v>=16) setData(p=>{if(JSON.stringify(p)===JSON.stringify(r))return p;return r;});
      } catch {}
    },10000);
    return()=>clearInterval(syncRef.current);
  },[]);

  const save=useCallback(async next=>{
    setData(next);
    setSaveStatus("saving");
    clearTimeout(saveTimer.current);
    try {
      await sb.set(next);
      setSaveStatus(getConfig()?"saved":"local");
    } catch {
      setSaveStatus("local");
    }
    saveTimer.current=setTimeout(()=>setSaveStatus(null),2500);
  },[]);

  const login=(role,payload)=>{
    const s={...payload,role,cid}; sess.set(s,true); setSess(s);
    const dev=getDeviceInfo();
    const label=role==="admin"?"Admin-Login":role==="trainer"?"Trainer-Login":role==="helper"?"Helfer-Login":"Eltern-Login";
    trackEventGeo("login", label);
    trackEventGeo("login", label);
    const entry={...createAuditEntry("login",label+": "+(payload.name||role),s),cid};
    const newLog=[...(data.securityLog||[]),
      ...(dev.suspicious?[{...createAuditEntry("new_device","Unbekannte Region: "+dev.lang,s),cid}]:[]),
      entry];
    localSet({...data,securityLog:newLog});
    setScr(role==="user"?"user":"dash");
  };
  const logout=()=>{
    if(session){const e={...createAuditEntry("logout","Logout: "+(session.name||session.role),session),cid};localSet({...data,securityLog:[...(data.securityLog||[]),e]});}
    sess.del(); setSess(null); setScr(cid?"role":"dir");
  };

  if(showSetup) return (
    <>
      <style>{CSS}</style>
      <SupabaseSetup
        onDone={()=>setShowSetup(false)}
        onSkip={()=>setShowSetup(false)}
      />
    </>
  );

  if(screen==="boot"||!data) return (
    <div style={{minHeight:"100dvh",display:"flex",alignItems:"center",justifyContent:"center",background:"#0f172a"}}>
      <style>{CSS}</style>
      <div style={{textAlign:"center"}}>
        <div style={{fontSize:60,animation:"pulse 1.5s ease infinite",marginBottom:14}}></div>
        <p style={{color:"#86efac",fontWeight:800,fontSize:17}}>Vereins-App lädt...</p>
        {!getConfig()&&<p style={{color:"rgba(255,255,255,.3)",fontSize:12,marginTop:8}}>Lokaler Speicher aktiv</p>}
      </div>
    </div>
  );

  const activeCl = data.clubs.find(c=>c.id===cid);
  const clTeams  = data.teams.filter(t=>t.cid===cid);

  return (
    <div>
      <style>{CSS}</style>
      {}
      {saveStatus&&(
        <div style={{position:"fixed",bottom:20,right:16,zIndex:999,display:"flex",alignItems:"center",gap:7,background:saveStatus==="saved"?"#052e16":saveStatus==="saving"?"#0f172a":"#451a03",borderRadius:99,padding:"8px 14px",boxShadow:"0 4px 20px rgba(0,0,0,.3)",border:`1px solid ${saveStatus==="saved"?"#16a34a":saveStatus==="saving"?"#334155":"#d97706"}`,fontSize:12,fontWeight:700,color:saveStatus==="saved"?"#86efac":saveStatus==="saving"?"#94a3b8":"#fbbf24"}}>
          {saveStatus==="saving"&&<div style={{width:12,height:12,border:"2px solid rgba(255,255,255,.2)",borderTopColor:"#94a3b8",borderRadius:"50%",animation:"spin .7s linear infinite"}}/>}
          {saveStatus==="saved"&&"* Supabase gespeichert"}
          {saveStatus==="saving"&&"Speichert..."}
          {saveStatus==="local"&&"* Lokal gespeichert"}
        </div>
      )}

      {}
      {(screen==="dir"||screen==="role")&&(
        <button onClick={()=>setShowSetup(true)}
          style={{position:"fixed",bottom:20,left:16,zIndex:998,display:"flex",alignItems:"center",gap:6,background:getConfig()?"#052e16":"#0f172a",border:`1px solid ${getConfig()?"#16a34a":"rgba(255,255,255,.15)"}`,borderRadius:99,padding:"8px 14px",fontSize:12,fontWeight:700,color:getConfig()?"#86efac":"rgba(255,255,255,.4)",cursor:"pointer",fontFamily:"inherit"}}>
           {getConfig()?"DB verbunden":"Datenbank einrichten"}
        </button>
      )}

      {showLegal&&<LegalPage onBack={()=>setShowLegal(false)}/>}
      {!showLegal&&screen==="dir"&&<Directory data={data} lang={lang} setLang={setLang} onLegal={()=>setShowLegal(true)} onPick={id=>{
          if(id==="__demo__"){setCid("demo");setScr("role");return;}
          setCid(id);setScr("role");
        }} onNewClub={newClubOrData=>{
          if(newClubOrData.clubs){
            save(newClubOrData);
          } else {
            const next={...data,clubs:[...data.clubs,newClubOrData]};
            save(next);
            setCid(newClubOrData.id);
            setScr("alogin");
          }
        }}/>}
      {screen==="role"  &&activeCl&&<RolePicker cl={activeCl} onRole={r=>setScr(r==="user"?"flow":r==="trainer"?"tlogin":r==="helper"?"hlogin":"alogin")} onBack={()=>setScr("dir")}/>}
      {screen==="flow"  &&activeCl&&<UserFlow cl={activeCl} teams={clTeams} players={data.players} playerProfiles={data.playerProfiles||[]} trainers={(data.trainers||[]).filter(tr=>tr.cid===cid)} onDone={(tid,user)=>login("user",{tid,user,name:user})} onBack={()=>setScr("role")}/>}
      {screen==="tlogin"&&activeCl&&<TrainerLogin cl={activeCl} trainers={data.trainers.filter(t=>t.cid===cid)} teams={clTeams} onLogin={tr=>login("trainer",tr)} onBack={()=>setScr("role")}/>}
      {screen==="hlogin"&&activeCl&&<HelperLogin cl={activeCl} helpers={data.helpers||[]} onLogin={h=>login("helper",{...h,cid})} onBack={()=>setScr("role")}/>}
      {screen==="alogin"&&activeCl&&<AdminLogin cl={activeCl} onLogin={a=>login("admin",{...a,cid})} onBack={()=>setScr("role")}/>}
      {screen==="user"  &&session&&activeCl&&<UserHome data={data} session={session} onSave={save} onLogout={logout} lang={lang}/>}
      {screen==="dash"  &&session&&activeCl&&<Dashboard data={data} session={session} onSave={save} onLogout={logout} lang={lang} setLang={setLang}/>}
    </div>
  );
}

const trainer_season_block_injected = true;
