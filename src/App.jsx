import { useState,useEffect,useCallback,useRef,useMemo,createContext,useContext } from "react";

const LANG_KEY = "vereinsapp_lang";
const LangCtx  = createContext("de");
const useLang  = () => useContext(LangCtx);

const T = {
  de: {
    back:"← Zurück",cancel: "Abbrechen",save: "Speichern",delete: "Löschen",logout:"Logout",close: "Schliessen",loading: "Lädt…",yes: "Ja",no: "Nein",search:"Suchen…",edit: "Bearbeiten",confirm: "Bestätigen",next: "Weiter →",chooseClub:"Welche Mannschaft ist dein Kind?",chooseAge: "In welcher Altersklasse spielt dein Kind?",chooseTeam:"Welche Mannschaft?",whichTrainer: "Welcher Trainer bist du?",forWhichAge:"Für welche Jugend bist du Trainer?",loginCode: "Helfer-Code",enterPassword:"Passwort eingeben",wrongPassword: "Falsches Passwort",helperLogin:"Helfer-Zugang",helperHint: "Zugriff auf Spielpläne und Turnier-Übersichten.",whoAreYou:"Wer bist du?",notInList: "Nicht in der Liste?",loginAs:"Einloggen als",teamOpen: "Team öffnen",roleParent:"Elternteil",roleParentSub: "Termine sehen & abstimmen",roleHelper:"Helfer",roleHelperSub: "Turnier & Spieltag unterstützen",roleTrainer:"Trainer",roleTrainerSub: "Termine meiner Mannschaft",roleAdmin:"Vereinsadmin",roleAdminSub: "Alle Rechte & Einstellungen",tabEvents:"Termine",tabPlayers: "Spieler",tabTemplates: "Vorlagen",tabHelpers:"Helfer",tabJerseys: "Trikots",tabFields: "Platz",tabInbox:"Posteingang",tabChat: "Chat",tabTeams: "Mannschaften",tabTrainers:"Trainer",tabBranding: "Design",tabSettings: "Einstellungen",tabVisibility:"Sichtbarkeit",newEvent:"Neuen Termin anlegen",noEvents: "Noch keine Termine",noEventsHint:"Klicke oben auf „Neuen Termin anlegen\"",upcomingEvents:"Anstehende Termine",pastEvents: "Vergangene Termine",showPast:"Vergangene anzeigen",hidePast: "Vergangene ausblenden",attending:"Ich bin dabei",notAttending: "Nicht dabei",maybe: "Vielleicht",unassigned:"Nicht zugeteilt",open: "Offen",assigned: "Zugeteilt",mainTeam:"Hauptmannschaft",canHelpIn: "Kann aushelfen in",assignTo:"Zu Team zuweisen",recommendation: "Empfehlung nächste Saison",lastSeason:"Letzte Saison gespielt in",notes: "Notizen",jerseyNumber:"Trikotnummer",jerseySize: "Trikotgrösse",jerseyStatus:"Trikot Status",strengths: "Stärken",statistics: "Statistiken",goals:"Tore",assists:"Vorlagen",yellowCards:"Gelb",redCards:"Rot",rating:"Bewertung",position: "Position",foot: "Fuss",male:"Junge",female: "Mädchen",birthYear: "Jahrgang",newSeason:"Neue Saison planen",seasonPlanning: "Saisonplanung",activeSeason:"Aktive Saison",planningStatus: "Planung",archivedStatus: "Archiviert",inbox:"Posteingang",security: "Sicherheit",allOk: "Alles in Ordnung",noRequests:"Keine Anfragen",block: "Blockieren",markRead: "Gelesen",contactClub:"Kontaktieren",sendRequest: "Anfrage senden",requestSent: "Anfrage gesendet!",demoView:"Demo ansehen",createClub: "Verein anlegen",searchClub:"Verein suchen...",allSports: "Alle",onlyWithConsent:"Nur Vereine die zugestimmt haben werden angezeigt",bookField:"Platz buchen",fieldBooking: "Platzbuchung",booked: "Gebucht",free:"Frei",cancelBooking: "Buchung stornieren",writeMessage:"Nachricht schreiben…",send: "Senden",wholeClub:"Gesamter Verein",noMessages: "Noch keine Nachrichten",},en: {
    back:"← Back",cancel: "Cancel",save: "Save",delete: "Delete",logout:"Logout",close: "Close",loading: "Loading…",yes: "Yes",no: "No",search:"Search…",edit: "Edit",confirm: "Confirm",next: "Next →",chooseClub:"Which team is your child in?",chooseAge: "Which age group does your child play in?",chooseTeam:"Which team?",whichTrainer: "Which trainer are you?",forWhichAge:"Which age group do you coach?",loginCode: "Helper code",enterPassword:"Enter password",wrongPassword: "Wrong password",helperLogin:"Helper access",helperHint: "Access to schedules and tournament overviews.",whoAreYou:"Who are you?",notInList: "Not in the list?",loginAs:"Log in as",teamOpen: "Open team",roleParent:"Parent",roleParentSub: "View events & vote",roleHelper:"Helper",roleHelperSub: "Support match days & tournaments",roleTrainer:"Coach",roleTrainerSub: "My team's events",roleAdmin:"Club admin",roleAdminSub: "All rights & settings",tabEvents:"Events",tabPlayers: "Players",tabTemplates: "Templates",tabHelpers:"Helpers",tabJerseys: "Jerseys",tabFields: "Pitch",tabInbox:"Inbox",tabChat: "Chat",tabTeams: "Teams",tabTrainers:"Coaches",tabBranding: "Design",tabSettings: "Settings",tabVisibility:"Visibility",newEvent:"Create new event",noEvents: "No events yet",noEventsHint:"Click above to create a new event",upcomingEvents:"Upcoming events",pastEvents: "Past events",showPast:"Show past",hidePast: "Hide past",attending:"I'm coming",notAttending: "Not coming",maybe: "Maybe",unassigned:"Unassigned",open: "Open",assigned: "Assigned",mainTeam:"Main team",canHelpIn: "Can assist in",assignTo:"Assign to team",recommendation: "Recommendation next season",lastSeason:"Last season played in",notes: "Notes",jerseyNumber:"Jersey number",jerseySize: "Jersey size",jerseyStatus:"Jersey status",strengths: "Strengths",statistics: "Statistics",goals:"Goals",assists:"Assists",yellowCards:"Yellow",redCards:"Red",rating:"Rating",position: "Position",foot: "Foot",male:"Boy",female: "Girl",birthYear: "Birth year",newSeason:"Plan new season",seasonPlanning: "Season planning",activeSeason:"Active season",planningStatus: "Planning",archivedStatus: "Archived",inbox:"Inbox",security: "Security",allOk: "All clear",noRequests:"No requests",block: "Block",markRead: "Mark read",contactClub:"Contact",sendRequest: "Send request",requestSent: "Request sent!",demoView:"View demo",createClub: "Create club",searchClub:"Search club...",allSports: "All",onlyWithConsent:"Only clubs that have given consent are shown",bookField:"Book pitch",fieldBooking: "Pitch booking",booked: "Booked",free:"Free",cancelBooking: "Cancel booking",writeMessage:"Write a message…",send: "Send",wholeClub:"Whole club",noMessages: "No messages yet",},nl: {
    back:"← Terug",cancel: "Annuleren",save: "Opslaan",delete: "Verwijderen",logout:"Uitloggen",close: "Sluiten",loading: "Laden…",yes: "Ja",no: "Nee",search:"Zoeken…",edit: "Bewerken",confirm: "Bevestigen",next: "Verder →",chooseClub:"In welk team zit je kind?",chooseAge: "In welke leeftijdsklasse speelt je kind?",chooseTeam:"Welk team?",whichTrainer: "Welke trainer ben jij?",forWhichAge:"Voor welke jeugd ben je trainer?",loginCode: "Helper-code",enterPassword:"Wachtwoord invoeren",wrongPassword: "Verkeerd wachtwoord",helperLogin:"Helper-toegang",helperHint: "Toegang tot schema's en toernooi-overzichten.",whoAreYou:"Wie ben jij?",notInList: "Niet in de lijst?",loginAs:"Inloggen als",teamOpen: "Team openen",roleParent:"Ouder",roleParentSub: "Afspraken zien & stemmen",roleHelper:"Helper",roleHelperSub: "Wedstrijddag & toernooi ondersteunen",roleTrainer:"Trainer",roleTrainerSub: "Afspraken van mijn team",roleAdmin:"Clubbeheerder",roleAdminSub: "Alle rechten & instellingen",tabEvents:"Afspraken",tabPlayers: "Spelers",tabTemplates: "Sjablonen",tabHelpers:"Helpers",tabJerseys: "Shirts",tabFields: "Veld",tabInbox:"Postvak",tabChat: "Chat",tabTeams: "Teams",tabTrainers:"Trainers",tabBranding: "Ontwerp",tabSettings: "Instellingen",tabVisibility:"Zichtbaarheid",newEvent:"Nieuwe afspraak aanmaken",noEvents: "Nog geen afspraken",noEventsHint:"Klik hierboven om een nieuwe afspraak aan te maken",upcomingEvents:"Aankomende afspraken",pastEvents: "Voorbije afspraken",showPast:"Voorbije tonen",hidePast: "Voorbije verbergen",attending:"Ik ben erbij",notAttending: "Niet aanwezig",maybe: "Misschien",unassigned:"Niet toegewezen",open: "Open",assigned: "Toegewezen",mainTeam:"Hoofdteam",canHelpIn: "Kan invallen in",assignTo:"Toewijzen aan team",recommendation: "Aanbeveling volgend seizoen",lastSeason:"Vorig seizoen gespeeld in",notes: "Notities",jerseyNumber:"Shirtnummer",jerseySize: "Shirtmaat",jerseyStatus:"Shirtstatus",strengths: "Kwaliteiten",statistics: "Statistieken",goals:"Doelpunten",assists:"Assists",yellowCards:"Geel",redCards:"Rood",rating:"Beoordeling",position: "Positie",foot: "Voet",male:"Jongen",female: "Meisje",birthYear: "Geboortejaar",newSeason:"Nieuw seizoen plannen",seasonPlanning: "Seizoensplanning",activeSeason:"Actief seizoen",planningStatus: "Planning",archivedStatus: "Gearchiveerd",inbox:"Postvak",security: "Beveiliging",allOk: "Alles in orde",noRequests:"Geen verzoeken",block: "Blokkeren",markRead: "Gelezen",contactClub:"Contact",sendRequest: "Verzoek sturen",requestSent: "Verzoek verstuurd!",demoView:"Demo bekijken",createClub: "Club aanmaken",searchClub:"Club zoeken...",allSports: "Alles",onlyWithConsent:"Alleen clubs die toestemming hebben gegeven worden getoond",bookField:"Veld boeken",fieldBooking: "Veldboeking",booked: "Geboekt",free:"Vrij",cancelBooking: "Boeking annuleren",writeMessage:"Schrijf een bericht…",send: "Versturen",wholeClub:"Hele club",noMessages: "Nog geen berichten",},};
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

const SK  = "vereinsapp_v12";
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

const sess = {
  get: () => { try { return JSON.parse(sessionStorage.getItem(SS)||"null"); } catch { return null; } },set: d  => { try { sessionStorage.setItem(SS,JSON.stringify(d)); } catch {} },del: () => { try { sessionStorage.removeItem(SS); } catch {} },};

function SupabaseSetup({ onDone,onSkip }) {
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
          <div style={{background:"rgba(255,255,255,.05)",borderRadius:12,padding:"14px",marginBottom:20,fontSize:12,color:"rgba(255,255,255,.6)",lineHeight:1.8}}>
            <div style={{fontWeight:800,color:"rgba(255,255,255,.8)",marginBottom:6,fontSize:13}}> Einrichtung (2 Min):</div>
            <div>1. <a href="https://supabase.com" target="_blank" style={{color:"#38bdf8"}}>supabase.com</a> → kostenlosen Account erstellen</div>
            <div>2. "New project" → Frankfurt → Passwort setzen</div>
            <div>3. SQL Editor → folgendes ausführen:</div>
            <div style={{background:"rgba(0,0,0,.4)",borderRadius:8,padding:"10px",margin:"8px 0",fontFamily:"monospace",fontSize:11,color:"#86efac",lineHeight:1.6}}>
              CREATE TABLE app_data (<br/>
              &nbsp;&nbsp;key TEXT PRIMARY KEY,<br/>
              &nbsp;&nbsp;value JSONB,<br/>
              &nbsp;&nbsp;updated_at TIMESTAMPTZ DEFAULT NOW()<br/>
              );<br/>
              ALTER TABLE app_data ENABLE ROW LEVEL SECURITY;<br/>
              CREATE POLICY "Public" ON app_data FOR ALL USING (true) WITH CHECK (true);
            </div>
            <div>4. Settings → API → URL + anon key kopieren</div>
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

          {status==="testing"&&<div style={{marginTop:12,textAlign:"center",color:"#94a3b8",fontSize:13}}> Verbindung wird getestet…</div>}
          {status==="ok"&&<div style={{marginTop:12,background:"#052e16",border:"1.5px solid #16a34a",borderRadius:10,padding:"10px 14px",color:"#86efac",fontSize:13,fontWeight:700}}> Verbindung erfolgreich! App wird geladen…</div>}
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
      </div>
    </div>
  );
}

const uid   = () => Math.random().toString(36).slice(2,9);
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
  training:     { label:"Training",icon:"Kick",col:"#16a34a",bg:"#dcfce7" },heimspiel:    { label:"Heimspiel",icon:"Heim",col:"#2563eb",bg:"#dbeafe" },auswarts:     { label:"Auswärtsspiel",icon:"Bus",col:"#d97706",bg:"#fef3c7" },freundschaft: { label:"Freundschaftsspiel",icon:"Hand",col:"#7c3aed",bg:"#ede9fe" },turnier:      { label:"Turnier",icon:"Pokal",col:"#dc2626",bg:"#fee2e2" },event:        { label:"Sondertermin",icon:"Fest",col:"#0891b2",bg:"#e0f2fe" },};

function seed() {
  const t = now();
  return {
    _v: 12,helpers: [],chats: [],seasons: [
      { id:"s2526",label:"2025/2026",status:"active" }
    ],activeSeason:"s2526",fields: [
      { id:"f_main",cid:"sus",name:"Hauptplatz",surface:"Rasen",segments:4 },{ id:"f_neben",cid:"sus",name:"Nebenplatz",surface:"Rasen",segments:4 },{ id:"f_kunst",cid:"sus",name:"Kunstrasenplatz",surface:"Kunstrasen",segments:4 },],bookings: [],contactRequests: [],// {id,cid,fromName,fromEmail,msg,ts,read,blocked,ip}
    securityLog: [],// {id,cid,type,ts,detail,read}
    playerProfiles: [
      {id:"r01",name:"Lasse",by:2020,gender:"m",mainTid:"sus_g",optTids:[],position:"",foot:"",strengths:[],customStrengths:[],goals:0,assists:0,yellowCards:0,redCards:0,notes:"",recommend:"",rating:0,friends:[],mustWith:[],jerseyNr:"",jerseySize:"",jerseyStatus:"none",lastTeam:"G-Jugend 25/26",lastTeamId:"sus_g",seasonId:"s2526"},{id:"r02",name:"Lucas",by:2019,gender:"m",mainTid:"sus_g",optTids:[],position:"",foot:"",strengths:[],customStrengths:[],goals:0,assists:0,yellowCards:0,redCards:0,notes:"",recommend:"",rating:0,friends:[],mustWith:[],jerseyNr:"",jerseySize:"",jerseyStatus:"none",lastTeam:"G-Jugend 25/26",lastTeamId:"sus_g",seasonId:"s2526"},{id:"r03",name:"Jonas",by:2019,gender:"m",mainTid:"sus_g",optTids:[],position:"",foot:"",strengths:[],customStrengths:[],goals:0,assists:0,yellowCards:0,redCards:0,notes:"Könnte spielerisch auch in die E",recommend:"",rating:0,friends:[],mustWith:[],jerseyNr:"",jerseySize:"",jerseyStatus:"none",lastTeam:"G-Jugend 25/26",lastTeamId:"sus_g",seasonId:"s2526"},{id:"r04",name:"Maximilian",by:2019,gender:"m",mainTid:"sus_g",optTids:[],position:"",foot:"",strengths:[],customStrengths:[],goals:0,assists:0,yellowCards:0,redCards:0,notes:"",recommend:"",rating:0,friends:[],mustWith:[],jerseyNr:"",jerseySize:"",jerseyStatus:"none",lastTeam:"G-Jugend 25/26",lastTeamId:"sus_g",seasonId:"s2526"},{id:"r05",name:"Carlos E.",by:2019,gender:"m",mainTid:"sus_g",optTids:[],position:"",foot:"",strengths:[],customStrengths:[],goals:0,assists:0,yellowCards:0,redCards:0,notes:"",recommend:"",rating:0,friends:[],mustWith:[],jerseyNr:"",jerseySize:"",jerseyStatus:"none",lastTeam:"G-Jugend 25/26",lastTeamId:"sus_g",seasonId:"s2526"},{id:"r06",name:"Emilio",by:2020,gender:"m",mainTid:"sus_g",optTids:[],position:"",foot:"",strengths:[],customStrengths:[],goals:0,assists:0,yellowCards:0,redCards:0,notes:"",recommend:"",rating:0,friends:[],mustWith:[],jerseyNr:"",jerseySize:"",jerseyStatus:"none",lastTeam:"G-Jugend 25/26",lastTeamId:"sus_g",seasonId:"s2526"},{id:"r07",name:"Elias H.",by:2019,gender:"m",mainTid:"sus_g",optTids:[],position:"",foot:"",strengths:[],customStrengths:[],goals:0,assists:0,yellowCards:0,redCards:0,notes:"",recommend:"",rating:0,friends:[],mustWith:[],jerseyNr:"",jerseySize:"",jerseyStatus:"none",lastTeam:"G-Jugend 25/26",lastTeamId:"sus_g",seasonId:"s2526"},{id:"r08",name:"Levi",by:2019,gender:"m",mainTid:"sus_g",optTids:[],position:"",foot:"",strengths:[],customStrengths:[],goals:0,assists:0,yellowCards:0,redCards:0,notes:"",recommend:"",rating:0,friends:[],mustWith:[],jerseyNr:"",jerseySize:"",jerseyStatus:"none",lastTeam:"G-Jugend 25/26",lastTeamId:"sus_g",seasonId:"s2526"},{id:"r09",name:"Lian",by:2019,gender:"m",mainTid:"sus_g",optTids:[],position:"",foot:"",strengths:[],customStrengths:[],goals:0,assists:0,yellowCards:0,redCards:0,notes:"",recommend:"",rating:0,friends:[],mustWith:[],jerseyNr:"",jerseySize:"",jerseyStatus:"none",lastTeam:"G-Jugend 25/26",lastTeamId:"sus_g",seasonId:"s2526"},{id:"r10",name:"Maxim K.",by:2019,gender:"m",mainTid:"sus_g",optTids:[],position:"",foot:"",strengths:[],customStrengths:[],goals:0,assists:0,yellowCards:0,redCards:0,notes:"Spielt bereits F3",recommend:"",rating:0,friends:[],mustWith:[],jerseyNr:"",jerseySize:"",jerseyStatus:"none",lastTeam:"F3 25/26",lastTeamId:"sus_f3",seasonId:"s2526"},{id:"r11",name:"Saleh",by:2019,gender:"m",mainTid:"sus_g",optTids:[],position:"",foot:"",strengths:[],customStrengths:[],goals:0,assists:0,yellowCards:0,redCards:0,notes:"",recommend:"",rating:0,friends:[],mustWith:[],jerseyNr:"",jerseySize:"",jerseyStatus:"none",lastTeam:"G-Jugend 25/26",lastTeamId:"sus_g",seasonId:"s2526"},{id:"r12",name:"Beni",by:2019,gender:"m",mainTid:"sus_g",optTids:[],position:"",foot:"",strengths:[],customStrengths:[],goals:0,assists:0,yellowCards:0,redCards:0,notes:"",recommend:"",rating:0,friends:[],mustWith:[],jerseyNr:"",jerseySize:"",jerseyStatus:"none",lastTeam:"G-Jugend 25/26",lastTeamId:"sus_g",seasonId:"s2526"},{id:"r13",name:"Zipadin",by:2019,gender:"m",mainTid:"sus_g",optTids:[],position:"",foot:"",strengths:[],customStrengths:[],goals:0,assists:0,yellowCards:0,redCards:0,notes:"",recommend:"",rating:0,friends:[],mustWith:[],jerseyNr:"",jerseySize:"",jerseyStatus:"none",lastTeam:"G-Jugend 25/26",lastTeamId:"sus_g",seasonId:"s2526"},{id:"r14",name:"Lukas M.",by:2019,gender:"m",mainTid:"sus_g",optTids:[],position:"",foot:"",strengths:[],customStrengths:[],goals:0,assists:0,yellowCards:0,redCards:0,notes:"Spielt bereits F3",recommend:"",rating:0,friends:[],mustWith:[],jerseyNr:"",jerseySize:"",jerseyStatus:"none",lastTeam:"F3 25/26",lastTeamId:"sus_f3",seasonId:"s2526"},{id:"r15",name:"Finn",by:2019,gender:"m",mainTid:"sus_g",optTids:[],position:"",foot:"",strengths:[],customStrengths:[],goals:0,assists:0,yellowCards:0,redCards:0,notes:"Spielt bereits F3",recommend:"",rating:0,friends:[],mustWith:[],jerseyNr:"",jerseySize:"",jerseyStatus:"none",lastTeam:"F3 25/26",lastTeamId:"sus_f3",seasonId:"s2526"},{id:"r16",name:"Johann",by:2019,gender:"m",mainTid:"sus_g",optTids:[],position:"",foot:"",strengths:[],customStrengths:[],goals:0,assists:0,yellowCards:0,redCards:0,notes:"Spielt bereits F3",recommend:"",rating:0,friends:[],mustWith:[],jerseyNr:"",jerseySize:"",jerseyStatus:"none",lastTeam:"F3 25/26",lastTeamId:"sus_f3",seasonId:"s2526"},{id:"r17",name:"Karl",by:2019,gender:"m",mainTid:"sus_g",optTids:[],position:"",foot:"",strengths:[],customStrengths:[],goals:0,assists:0,yellowCards:0,redCards:0,notes:"",recommend:"",rating:0,friends:[],mustWith:[],jerseyNr:"",jerseySize:"",jerseyStatus:"none",lastTeam:"G-Jugend 25/26",lastTeamId:"sus_g",seasonId:"s2526"},{id:"r18",name:"Barghash",by:2019,gender:"m",mainTid:"sus_g",optTids:[],position:"",foot:"",strengths:[],customStrengths:[],goals:0,assists:0,yellowCards:0,redCards:0,notes:"",recommend:"",rating:0,friends:[],mustWith:[],jerseyNr:"",jerseySize:"",jerseyStatus:"none",lastTeam:"G-Jugend 25/26",lastTeamId:"sus_g",seasonId:"s2526"},{id:"r19",name:"Mohammad T.",by:2018,gender:"m",mainTid:"sus_f3",optTids:[],position:"",foot:"",strengths:[],customStrengths:[],goals:0,assists:0,yellowCards:0,redCards:0,notes:"",recommend:"",rating:0,friends:[],mustWith:[],jerseyNr:"",jerseySize:"",jerseyStatus:"none",lastTeam:"F3 25/26",lastTeamId:"sus_f3",seasonId:"s2526"},{id:"r20",name:"Ahmad M.",by:2018,gender:"m",mainTid:"sus_f3",optTids:[],position:"",foot:"",strengths:[],customStrengths:[],goals:0,assists:0,yellowCards:0,redCards:0,notes:"",recommend:"",rating:0,friends:[],mustWith:[],jerseyNr:"",jerseySize:"",jerseyStatus:"none",lastTeam:"F3 25/26",lastTeamId:"sus_f3",seasonId:"s2526"},{id:"r21",name:"Tilo",by:2018,gender:"m",mainTid:"sus_f3",optTids:[],position:"",foot:"",strengths:[],customStrengths:[],goals:0,assists:0,yellowCards:0,redCards:0,notes:"",recommend:"",rating:0,friends:[],mustWith:[],jerseyNr:"",jerseySize:"",jerseyStatus:"none",lastTeam:"F3 25/26",lastTeamId:"sus_f3",seasonId:"s2526"},{id:"r22",name:"Amjed",by:2018,gender:"m",mainTid:"sus_f3",optTids:[],position:"",foot:"",strengths:[],customStrengths:[],goals:0,assists:0,yellowCards:0,redCards:0,notes:"",recommend:"",rating:0,friends:[],mustWith:[],jerseyNr:"",jerseySize:"",jerseyStatus:"none",lastTeam:"F3 25/26",lastTeamId:"sus_f3",seasonId:"s2526"},{id:"r23",name:"Jan",by:2018,gender:"m",mainTid:"sus_f2",optTids:[],position:"",foot:"",strengths:[],customStrengths:[],goals:0,assists:0,yellowCards:0,redCards:0,notes:"",recommend:"",rating:0,friends:[],mustWith:[],jerseyNr:"",jerseySize:"",jerseyStatus:"none",lastTeam:"F2 25/26",lastTeamId:"sus_f2",seasonId:"s2526"},{id:"r24",name:"Carlos B.",by:2018,gender:"m",mainTid:"sus_f2",optTids:[],position:"",foot:"",strengths:[],customStrengths:[],goals:0,assists:0,yellowCards:0,redCards:0,notes:"",recommend:"",rating:0,friends:[],mustWith:[],jerseyNr:"",jerseySize:"",jerseyStatus:"none",lastTeam:"F2 25/26",lastTeamId:"sus_f2",seasonId:"s2526"},{id:"r25",name:"Jud",by:2018,gender:"m",mainTid:"sus_f3",optTids:[],position:"",foot:"",strengths:[],customStrengths:[],goals:0,assists:0,yellowCards:0,redCards:0,notes:"",recommend:"",rating:0,friends:[],mustWith:[],jerseyNr:"",jerseySize:"",jerseyStatus:"none",lastTeam:"F3 25/26",lastTeamId:"sus_f3",seasonId:"s2526"},{id:"r26",name:"Abdul Rashid",by:2019,gender:"m",mainTid:"sus_f1",optTids:[],position:"",foot:"",strengths:[],customStrengths:[],goals:0,assists:0,yellowCards:0,redCards:0,notes:"Spielt bereits F1",recommend:"",rating:0,friends:[],mustWith:[],jerseyNr:"",jerseySize:"",jerseyStatus:"none",lastTeam:"F1 25/26",lastTeamId:"sus_f1",seasonId:"s2526"},{id:"r27",name:"Ahmad B.",by:2018,gender:"m",mainTid:"sus_f3",optTids:[],position:"",foot:"",strengths:[],customStrengths:[],goals:0,assists:0,yellowCards:0,redCards:0,notes:"",recommend:"",rating:0,friends:[],mustWith:[],jerseyNr:"",jerseySize:"",jerseyStatus:"none",lastTeam:"F3 25/26",lastTeamId:"sus_f3",seasonId:"s2526"},{id:"r28",name:"Tian",by:2018,gender:"m",mainTid:"sus_f3",optTids:[],position:"",foot:"",strengths:[],customStrengths:[],goals:0,assists:0,yellowCards:0,redCards:0,notes:"",recommend:"",rating:0,friends:[],mustWith:[],jerseyNr:"",jerseySize:"",jerseyStatus:"none",lastTeam:"F3 25/26",lastTeamId:"sus_f3",seasonId:"s2526"},{id:"r29",name:"Luis",by:2018,gender:"m",mainTid:"sus_f2",optTids:[],position:"",foot:"",strengths:[],customStrengths:[],goals:0,assists:0,yellowCards:0,redCards:0,notes:"",recommend:"",rating:0,friends:[],mustWith:[],jerseyNr:"",jerseySize:"",jerseyStatus:"none",lastTeam:"F2 25/26",lastTeamId:"sus_f2",seasonId:"s2526"},{id:"r30",name:"Lukas Kr.",by:2018,gender:"m",mainTid:"sus_f3",optTids:[],position:"",foot:"",strengths:[],customStrengths:[],goals:0,assists:0,yellowCards:0,redCards:0,notes:"Spielt bereits F3",recommend:"",rating:0,friends:[],mustWith:[],jerseyNr:"",jerseySize:"",jerseyStatus:"none",lastTeam:"F3 25/26",lastTeamId:"sus_f3",seasonId:"s2526"},{id:"r31",name:"Henri",by:2018,gender:"m",mainTid:"sus_f3",optTids:[],position:"",foot:"",strengths:[],customStrengths:[],goals:0,assists:0,yellowCards:0,redCards:0,notes:"",recommend:"",rating:0,friends:[],mustWith:[],jerseyNr:"",jerseySize:"",jerseyStatus:"none",lastTeam:"F3 25/26",lastTeamId:"sus_f3",seasonId:"s2526"},{id:"r32",name:"Yehor",by:2018,gender:"m",mainTid:"sus_f3",optTids:[],position:"",foot:"",strengths:[],customStrengths:[],goals:0,assists:0,yellowCards:0,redCards:0,notes:"",recommend:"",rating:0,friends:[],mustWith:[],jerseyNr:"",jerseySize:"",jerseyStatus:"none",lastTeam:"F3 25/26",lastTeamId:"sus_f3",seasonId:"s2526"},{id:"r33",name:"Elias O.",by:2018,gender:"m",mainTid:"sus_f3",optTids:[],position:"",foot:"",strengths:[],customStrengths:[],goals:0,assists:0,yellowCards:0,redCards:0,notes:"",recommend:"",rating:0,friends:[],mustWith:[],jerseyNr:"",jerseySize:"",jerseyStatus:"none",lastTeam:"F3 25/26",lastTeamId:"sus_f3",seasonId:"s2526"},{id:"r34",name:"Maxim R.",by:2018,gender:"m",mainTid:"sus_f3",optTids:[],position:"",foot:"",strengths:[],customStrengths:[],goals:0,assists:0,yellowCards:0,redCards:0,notes:"",recommend:"",rating:0,friends:[],mustWith:[],jerseyNr:"",jerseySize:"",jerseyStatus:"none",lastTeam:"F3 25/26",lastTeamId:"sus_f3",seasonId:"s2526"},{id:"r35",name:"Phil-Lamar",by:2018,gender:"m",mainTid:"",optTids:[],position:"",foot:"",strengths:[],customStrengths:[],goals:0,assists:0,yellowCards:0,redCards:0,notes:"",recommend:"",rating:0,friends:[],mustWith:[],jerseyNr:"",jerseySize:"",jerseyStatus:"none",lastTeam:"—",lastTeamId:"",seasonId:"s2526"},{id:"r36",name:"Edwin",by:2018,gender:"m",mainTid:"sus_f3",optTids:[],position:"",foot:"",strengths:[],customStrengths:[],goals:0,assists:0,yellowCards:0,redCards:0,notes:"",recommend:"",rating:0,friends:[],mustWith:[],jerseyNr:"",jerseySize:"",jerseyStatus:"none",lastTeam:"F3 25/26",lastTeamId:"sus_f3",seasonId:"s2526"},{id:"r37",name:"Lennart",by:2018,gender:"m",mainTid:"sus_f2",optTids:[],position:"",foot:"",strengths:[],customStrengths:[],goals:0,assists:0,yellowCards:0,redCards:0,notes:"",recommend:"",rating:0,friends:[],mustWith:[],jerseyNr:"",jerseySize:"",jerseyStatus:"none",lastTeam:"F2 25/26",lastTeamId:"sus_f2",seasonId:"s2526"},{id:"r38",name:"Abdulla",by:2018,gender:"m",mainTid:"sus_f3",optTids:[],position:"",foot:"",strengths:[],customStrengths:[],goals:0,assists:0,yellowCards:0,redCards:0,notes:"",recommend:"",rating:0,friends:[],mustWith:[],jerseyNr:"",jerseySize:"",jerseyStatus:"none",lastTeam:"F3 25/26",lastTeamId:"sus_f3",seasonId:"s2526"},{id:"r39",name:"Kabher",by:2018,gender:"m",mainTid:"sus_f3",optTids:[],position:"",foot:"",strengths:[],customStrengths:[],goals:0,assists:0,yellowCards:0,redCards:0,notes:"",recommend:"",rating:0,friends:[],mustWith:[],jerseyNr:"",jerseySize:"",jerseyStatus:"none",lastTeam:"F3 25/26",lastTeamId:"sus_f3",seasonId:"s2526"},{id:"r40",name:"Maxim vE.",by:2018,gender:"m",mainTid:"sus_f2",optTids:[],position:"",foot:"",strengths:[],customStrengths:[],goals:0,assists:0,yellowCards:0,redCards:0,notes:"",recommend:"",rating:0,friends:[],mustWith:[],jerseyNr:"",jerseySize:"",jerseyStatus:"none",lastTeam:"F2 25/26",lastTeamId:"sus_f2",seasonId:"s2526"},{id:"r41",name:"Leonard",by:2018,gender:"m",mainTid:"sus_f3",optTids:[],position:"",foot:"",strengths:[],customStrengths:[],goals:0,assists:0,yellowCards:0,redCards:0,notes:"",recommend:"",rating:0,friends:[],mustWith:[],jerseyNr:"",jerseySize:"",jerseyStatus:"none",lastTeam:"F3 25/26",lastTeamId:"sus_f3",seasonId:"s2526"},{id:"r42",name:"Timur",by:2018,gender:"m",mainTid:"sus_f3",optTids:[],position:"",foot:"",strengths:[],customStrengths:[],goals:0,assists:0,yellowCards:0,redCards:0,notes:"",recommend:"",rating:0,friends:[],mustWith:[],jerseyNr:"",jerseySize:"",jerseyStatus:"none",lastTeam:"F3 25/26",lastTeamId:"sus_f3",seasonId:"s2526"},{id:"r43",name:"Paulina",by:2017,gender:"w",mainTid:"sus_f3",optTids:[],position:"",foot:"",strengths:[],customStrengths:[],goals:0,assists:0,yellowCards:0,redCards:0,notes:"",recommend:"",rating:0,friends:[],mustWith:[],jerseyNr:"",jerseySize:"",jerseyStatus:"none",lastTeam:"F3 25/26",lastTeamId:"sus_f3",seasonId:"s2526"},{id:"r44",name:"Tilda",by:2017,gender:"w",mainTid:"sus_f3",optTids:[],position:"",foot:"",strengths:[],customStrengths:[],goals:0,assists:0,yellowCards:0,redCards:0,notes:"",recommend:"",rating:0,friends:[],mustWith:[],jerseyNr:"",jerseySize:"",jerseyStatus:"none",lastTeam:"F3 25/26",lastTeamId:"sus_f3",seasonId:"s2526"},{id:"r45",name:"Xenia",by:2016,gender:"w",mainTid:"sus_f2",optTids:[],position:"",foot:"",strengths:[],customStrengths:[],goals:0,assists:0,yellowCards:0,redCards:0,notes:"",recommend:"",rating:0,friends:[],mustWith:[],jerseyNr:"",jerseySize:"",jerseyStatus:"none",lastTeam:"F2 25/26",lastTeamId:"sus_f2",seasonId:"s2526"},{id:"r46",name:"Anne",by:2018,gender:"w",mainTid:"sus_f2",optTids:[],position:"",foot:"",strengths:[],customStrengths:[],goals:0,assists:0,yellowCards:0,redCards:0,notes:"",recommend:"",rating:0,friends:[],mustWith:[],jerseyNr:"",jerseySize:"",jerseyStatus:"none",lastTeam:"F2 25/26",lastTeamId:"sus_f2",seasonId:"s2526"},],clubs: [
      { id:"sus",slug:"sus-kalkar",name:"SuS Kalkar",short:"SuS",em:"*",logo:null,pri:"#16a34a",sec:"#052e16",adm:"admin123",pub:true,dir:true },{ id:"bvw",slug:"bv-wissel",name:"BV Sturm Wissel",short:"BVW",em:"*",logo:null,pri:"#1d4ed8",sec:"#1e1b4b",adm:"wissel123",pub:true,dir:true },],teams: [
      { id:"sus_bam",cid:"sus",name:"Bambinis",icon:"*",col:"#f59e0b",pub:true,pwd:"bam",cat:"Bambinis",years:"2019/20/21" },{ id:"sus_g",cid:"sus",name:"G-Jugend",icon:"Ball",col:"#16a34a",pub:true,pwd:"g1",cat:"G-Jugend",years:"2017/18/19" },{ id:"sus_f1",cid:"sus",name:"F-Jugend 1",icon:"Pokal",col:"#2563eb",pub:false,pwd:"f1",cat:"F-Jugend",years:"2015/16/17" },{ id:"sus_f2",cid:"sus",name:"F-Jugend 2",icon:"Pokal",col:"#1d4ed8",pub:false,pwd:"f2",cat:"F-Jugend",years:"2015/16/17" },{ id:"sus_f3",cid:"sus",name:"F-Jugend 3",icon:"Pokal",col:"#1e40af",pub:false,pwd:"f3",cat:"F-Jugend",years:"2015/16/17" },{ id:"sus_e",cid:"sus",name:"E-Jugend",icon:"*",col:"#7c3aed",pub:true,pwd:"e1",cat:"E-Jugend",years:"2013/14/15" },{ id:"bvw_g",cid:"bvw",name:"G-Jugend",icon:"*",col:"#1d4ed8",pub:true,cat:"G-Jugend",years:"2017/18/19" },{ id:"bvw_f",cid:"bvw",name:"F-Jugend",icon:"*",col:"#dc2626",pub:true },],trainers: [
      { id:"tr1",cid:"sus",name:"Marcel",role:"Trainer",tids:["sus_f1"],pw:"marcel123",phone:"",email:"",adm:false },{ id:"tr2",cid:"sus",name:"Daniel",role:"Co-Trainer",tids:["sus_f1"],pw:"daniel123",phone:"",email:"",adm:false },{ id:"tr3",cid:"sus",name:"Dennis",role:"Trainer",tids:["sus_f2"],pw:"dennis123",phone:"",email:"",adm:false },{ id:"tr4",cid:"sus",name:"Mario",role:"Co-Trainer",tids:["sus_f2"],pw:"mario123",phone:"",email:"",adm:false },{ id:"tr5",cid:"sus",name:"David",role:"Trainer",tids:["sus_f3","sus_g"],pw:"david123",phone:"",email:"",adm:false },{ id:"tr6",cid:"sus",name:"Thorsten",role:"Co-Trainer",tids:["sus_f3"],pw:"thorsten123",phone:"",email:"",adm:false },{ id:"tr7",cid:"sus",name:"Sarah",role:"Trainer",tids:["sus_bam"],pw:"sarah123",phone:"",email:"",adm:false },{ id:"tr8",cid:"sus",name:"Klaus",role:"Trainer",tids:["sus_e"],pw:"klaus123",phone:"",email:"",adm:false },{ id:"tr9",cid:"bvw",name:"Tom",role:"Trainer",tids:["bvw_g","bvw_f"],pw:"tom123",phone:"",email:"",adm:false },],players: {
      sus_bam: ["Lena M.","Tom K.","Max S.","Sophie W.","Finn B.","Mia L.","Luis P.","Emma R.","Theo J.","Clara N."],sus_g:   ["Jonas H.","Anna T.","Noah G.","Clara F.","Ben M.","Lea S.","Felix K.","Sarah B.","Tim W.","Nina D.","Elias R.","Maja L."],sus_f1:  ["Paul R.","Julia S.","Leon K.","Marie H.","Jan B.","Lisa W.","Mark T.","Laura P.","Nico V.","Hanna G."],sus_f2:  ["Kai S.","Mia B.","Tom F.","Lara K.","Max W.","Nina H.","Ben R.","Sara L.","Joel T.","Zoe M."],sus_f3:  ["Luca D.","Emma P.","Finn S.","Clara B.","Jonas K.","Leah W.","Moritz R.","Alina T.","Noah F.","Ida V."],sus_e:   ["Erik Z.","Jana M.","Sven L.","Petra W.","Lars K.","Mona T."],bvw_g:   ["Finn R.","Hanna G.","Lars K.","Mona T.","Sven L.","Jana M.","Erik S.","Petra W."],bvw_f:   ["Max B.","Lara K.","Tim S.","Julia M.","Nico H.","Eva R."],},events: [
      { id:"e1",cid:"sus",tid:"sus_g",type:"training",title:"Training G-Jugend",date:addD(t,-14),time:"17:00",loc:"Sportplatz Nord",pt:"attendance",votes:{},li:[],fi:[],sc:[],note:"",open:false },{ id:"e2",cid:"sus",tid:"sus_g",type:"training",title:"Training G-Jugend",date:addD(t,-7),time:"17:00",loc:"Sportplatz Nord",pt:"attendance",votes:{"Jonas H.":"yes","Anna T.":"yes","Noah G.":"no","Clara F.":"yes","Ben M.":"yes","Lea S.":"no"},li:[],fi:[],sc:[],note:"",open:false },{ id:"e3",cid:"sus",tid:"sus_g",type:"training",title:"Training G-Jugend",date:t,time:"17:00",loc:"Sportplatz Nord",pt:"attendance",votes:{},li:[],fi:[],sc:[],note:"",open:false },{ id:"e4",cid:"sus",tid:"sus_g",type:"heimspiel",title:"Heimspiel vs. VfL Xanten",date:addD(t,4),time:"10:00",loc:"Hauptplatz",pt:"list",votes:{},li:[{id:"li1",txt:"Wasser",max:null},{id:"li2",txt:"Apfelschorle",max:null},{id:"li3",txt:"Trinkpäckchen",max:null},{id:"li4",txt:"Muffins",max:3},{id:"li5",txt:"Waffeln",max:2},{id:"li6",txt:"Kuchen",max:null},{id:"li7",txt:"Obst",max:null}],fi:[],sc:[],note:"Bitte 30 Minuten früher da sein!",open:false },{ id:"e5",cid:"sus",tid:"sus_g",type:"turnier",title:"Stadtturnier Kalkar 2026",date:addD(t,11),time:"09:00",loc:"Hauptplatz",pt:"attendance",votes:{},li:[],note:"Jahresabschlussturnier mit 8 Teams. Bitte Trikot mitbringen!",open:true,fi:[{id:"f1",name:"Feld 1",col:"#16a34a"},{id:"f2",name:"Feld 2",col:"#2563eb"},{id:"f3",name:"Feld 3",col:"#dc2626"}],sc:[
          {id:"s1",fid:"f1",time:"09:00",a:"SuS Kalkar 1",b:"VfL Xanten",ref:"David Müller"},{id:"s2",fid:"f2",time:"09:00",a:"SuS Kalkar 2",b:"BV Sturm Wissel",ref:"Sarah Koch"},{id:"s3",fid:"f3",time:"09:00",a:"FC Kleve",b:"SV Bedburg",ref:"Klaus Weber"},{id:"s4",fid:"f1",time:"09:25",a:"VfL Xanten",b:"BV Sturm Wissel",ref:"Tom Schneider"},{id:"s5",fid:"f2",time:"09:25",a:"SuS Kalkar 1",b:"FC Kleve",ref:"David Müller"},{id:"s6",fid:"f3",time:"09:25",a:"SuS Kalkar 2",b:"SV Bedburg",ref:"Sarah Koch"},]},{ id:"e6",cid:"sus",tid:"sus_g",type:"training",title:"Training G-Jugend",date:addD(t,18),time:"17:00",loc:"Sportplatz Nord",pt:"attendance",votes:{},li:[],fi:[],sc:[],note:"",open:false },{ id:"e7",cid:"sus",tid:"sus_g",type:"auswarts",title:"Auswärtsspiel SV Bedburg",date:addD(t,25),time:"11:00",loc:"SV Bedburg Platz",pt:"carpool",votes:{},li:[],fi:[],sc:[],note:"Treffpunkt: 10:15 Uhr Sportplatz Nord",open:false,carpoolNeeds:{},carpoolOffers:{} },{ id:"e8",cid:"sus",tid:"sus_bam",type:"training",title:"Training Bambinis",date:t,time:"16:00",loc:"Nebenplatz",pt:"attendance",votes:{},li:[],fi:[],sc:[],note:"",open:false },{ id:"e9",cid:"sus",tid:"sus_bam",type:"event",title:"Bambini-Fest *",date:addD(t,8),time:"14:00",loc:"Vereinsheim",pt:"attendance",votes:{},li:[],fi:[],sc:[],note:"Eltern sind herzlich eingeladen!",open:false },{ id:"e10",cid:"sus",tid:"sus_e",type:"training",title:"Training E-Jugend",date:t,time:"15:30",loc:"Nebenplatz 2",pt:"attendance",votes:{},li:[],fi:[],sc:[],note:"",open:false },{ id:"e11",cid:"sus",tid:"sus_f1",type:"freundschaft",title:"Freundschaftsspiel",date:addD(t,6),time:"10:00",loc:"Hauptplatz",pt:"attendance",votes:{},li:[],fi:[],sc:[],note:"",open:false },{ id:"e12",cid:"bvw",tid:"bvw_g",type:"training",title:"Training G-Jugend BVW",date:t,time:"17:30",loc:"BVW Platz",pt:"attendance",votes:{},li:[],fi:[],sc:[],note:"",open:false },{ id:"e13",cid:"bvw",tid:"bvw_f",type:"heimspiel",title:"Heimspiel F-Jugend",date:addD(t,5),time:"09:00",loc:"BVW Hauptplatz",pt:"attendance",votes:{},li:[],fi:[],sc:[],note:"",open:false },],messages: [],pollTemplates: [
      { id:"pt1",cid:"sus",name:"Verpflegung Heimspiel",icon:"*",items:[{id:"i1",txt:"Wasser",max:null},{id:"i2",txt:"Apfelschorle",max:null},{id:"i3",txt:"Trinkpäckchen",max:null},{id:"i4",txt:"Muffins",max:3},{id:"i5",txt:"Waffeln",max:2},{id:"i6",txt:"Kuchen",max:null},{id:"i7",txt:"Obst",max:null}] },{ id:"pt2",cid:"sus",name:"Helfer Turnier",icon:"*",items:[{id:"i1",txt:"Aufbau helfen",max:2},{id:"i2",txt:"Abbau helfen",max:2},{id:"i3",txt:"Schiedsrichter",max:1},{id:"i4",txt:"Getränkestand",max:2}] },{ id:"pt3",cid:"sus",name:"Auswärtsspiel Verpflegung",icon:"Bus",items:[{id:"i1",txt:"Brötchen",max:null},{id:"i2",txt:"Obst",max:null},{id:"i3",txt:"Wasser",max:null},{id:"i4",txt:"Saft",max:null}] },],};
}

const CSS = `
@import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800;900&display=swap');
*{box-sizing:border-box;margin:0;padding:0;-webkit-tap-highlight-color:transparent}
html,body{height:100%;font-family:'Plus Jakarta Sans',sans-serif;background:#f0f4f8;overscroll-behavior:none}
button,input,select,textarea{font-family:'Plus Jakarta Sans',sans-serif}
input::placeholder,textarea::placeholder{color:#94a3b8}
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
function ClubHeader({cl,sub,right}) {
  const t=TH(cl);
  return <div style={{background:`linear-gradient(135deg,${t.s} 0%,${t.p}bb 100%)`,padding:"16px 18px 20px",position:"sticky",top:0,zIndex:60,boxShadow:"0 4px 24px rgba(0,0,0,.22)"}}><div style={{display:"flex",alignItems:"center",gap:12}}><Logo cl={cl} sz={42}/><div style={{flex:1,minWidth:0}}><div style={{color:"#fff",fontWeight:900,fontSize:17,letterSpacing:-.3,lineHeight:1.2}}>{cl?.name}</div>{sub&&<div style={{color:"rgba(255,255,255,.6)",fontSize:12,fontWeight:600,marginTop:2}}>{sub}</div>}</div>{right}</div></div>;
}
function Divider({label,light}) {
  return <div style={{display:"flex",alignItems:"center",gap:10,margin:"14px 0 10px"}}><div style={{flex:1,height:1,background:"#e2e8f0"}}/><span style={{fontSize:11,fontWeight:800,color:light?"#94a3b8":"#64748b",whiteSpace:"nowrap"}}>{label}</span><div style={{flex:1,height:1,background:"#e2e8f0"}}/></div>;
}

function ContactForm({ cl, onSend, onClose }) {
  const [f,setF]=useState({name:"",email:"",msg:""});
  const [sent,setSent]=useState(false);
  const t=TH(cl);
  const send=()=>{if(!f.name.trim()||f.msg.trim().length<5)return;onSend({...f,ts:new Date().toISOString()});setSent(true);};
  if(sent) return <div style={{minHeight:"100dvh",background:"#f0fdf4",display:"flex",alignItems:"center",justifyContent:"center",flexDirection:"column",gap:14,padding:24}}><div style={{fontSize:48}}>ok</div><p style={{fontWeight:800,fontSize:18}}>Anfrage gesendet!</p><button onClick={onClose} style={{padding:"12px 24px",borderRadius:12,border:"none",background:t.p,color:"#fff",fontWeight:800,cursor:"pointer",fontFamily:"inherit"}}>Schliessen</button></div>;
  return (
    <div style={{minHeight:"100dvh",background:"#f0f4f8",padding:"24px 20px"}}>
      <style>{CSS}</style>
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
    const logEntry = {id:uid(),cid,type:"spam_block",ts:new Date().toISOString(),detail:`Absender "${req.fromName}" blockiert — ${next.filter(r=>r.blocked&&(r.fromEmail===req.fromEmail||r.fromName===req.fromName)).length} Nachrichten`,read:false};
    save({...data,contactRequests:next,securityLog:[...(data.securityLog||[]),logEntry]});
    fire("Absender blockiert und gemeldet");
  };
  const deleteReq = id => save({...data,contactRequests:(data.contactRequests||[]).filter(r=>r.id!==id)});
  const markSecRead = id => save({...data,securityLog:(data.securityLog||[]).map(s=>s.id===id?{...s,read:true}:s)});

  const fmtDate = ts => new Date(ts).toLocaleDateString("de-DE",{day:"2-digit",month:"2-digit",hour:"2-digit",minute:"2-digit"});

  const SEC_TYPES = {
    spam_block:    {icon:"X",col:"#dc2626",bg:"#fee2e2",label:"Spam blockiert"},many_requests: {icon:"!",col:"#d97706",bg:"#fef3c7",label:"Viele Anfragen"},login_fail:    {icon:"?",col:"#7c3aed",bg:"#ede9fe",label:"Fehlerhafte Logins"},suspicious:    {icon:"!!",col:"#dc2626",bg:"#fee2e2",label:"Verdächtige Aktivität"},};

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
                <button onClick={()=>deleteReq(req.id)} style={{flex:1,padding:"9px",border:"none",background:"none",color:"#dc2626",fontWeight:700,fontSize:12,cursor:"pointer",fontFamily:"inherit"}}>Loeschen</button>
              </div>
            </div>
          ))}
        </div>

        {blocked.length>0&&(
          <div style={{marginTop:16,background:"#fef2f2",borderRadius:12,padding:"12px 14px",border:"1.5px solid #fecaca"}}>
            <div style={{fontWeight:700,fontSize:13,color:"#dc2626",marginBottom:4}}>Blockierte Absender ({blocked.length})</div>
            {[...new Set(blocked.map(r=>r.fromName))].map(name=>(
              <div key={name} style={{fontSize:12,color:"#9f1239",padding:"3px 0"}}>{name} — {blocked.filter(r=>r.fromName===name).length} blockierte Nachricht(en)</div>
            ))}
          </div>
        )}
      </>}

      {}
      {view==="security"&&<>
        <div style={{background:"#eff6ff",borderRadius:13,padding:"12px 14px",border:"1.5px solid #bfdbfe",marginBottom:14,fontSize:13,color:"#1d4ed8",lineHeight:1.6}}>
          Hier siehst du sicherheitsrelevante Ereignisse fuer deinen Verein. Wir ueberwachen automatisch ob dein Vereinszugang missbraucht wird.
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

function SetupWizard({ onDone,onBack }) {
  const [step,setStep] = useState(1);
  const [f,setF] = useState({
    name:"",short:"",sport:"fussball",pri:"#16a34a",adm:""
  });
  const u = p => setF(prev=>({...prev,...p}));
  const SPORTS = [
    {id:"fussball",label:"Fussball",col:"#16a34a"},{id:"handball",label:"Handball",col:"#2563eb"},{id:"tennis",label:"Tennis",col:"#d97706"},{id:"badminton",label:"Badminton",col:"#7c3aed"},{id:"schützen",label:"Schützen",col:"#dc2626"},{id:"volleyball",label:"Volleyball",col:"#0891b2"},{id:"basketball",label:"Basketball",col:"#ea580c"},{id:"sonstiges",label:"Sonstiges",col:"#64748b"},];
  const selSport = SPORTS.find(s=>s.id===f.sport)||SPORTS[0];

  const finish = () => {
    const cid = "c_"+uid();
    const newClub = {
      id:cid,slug:f.name.toLowerCase().replace(/\s+/g,"-"),name:f.name.trim(),short:f.short.trim()||f.name.slice(0,4).toUpperCase(),em:"*",logo:null,pri:selSport.col,sec:"#0f172a",adm:f.adm,pub:true,dir:true,sport:f.sport,createdAt:new Date().toISOString(),};
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
            <h2 style={{color:"#fff",fontWeight:900,fontSize:20,margin:"0 0 6px"}}>Wie heisst dein Verein?</h2>
            <p style={{color:"rgba(255,255,255,.4)",fontSize:13,margin:"0 0 18px"}}>Schritt 1 von 3</p>
            <input value={f.name} onChange={e=>u({name:e.target.value})} placeholder="z.B. SuS Kalkar 1920"
              style={{width:"100%",padding:"13px 15px",fontSize:16,background:"rgba(255,255,255,.1)",border:`1.5px solid ${f.name?"rgba(255,255,255,.4)":"rgba(255,255,255,.15)"}`,borderRadius:13,outline:"none",color:"#fff",marginBottom:10,boxSizing:"border-box"}}/>
            <input value={f.short} onChange={e=>u({short:e.target.value})} placeholder="Kuerzel (optional,z.B. SuS)"
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
            <p style={{color:"rgba(255,255,255,.4)",fontSize:13,margin:"0 0 18px"}}>Schritt 3 von 3 — merke es dir gut!</p>
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
                <div style={{color:"rgba(255,255,255,.35)",fontSize:11,marginTop:1}}>Andere koennen deinen Verein auf der Startseite finden</div>
              </div>
            </label>
          </>}

          {}
          <div style={{display:"flex",gap:9}}>
            {step>1&&<button onClick={()=>setStep(s=>s-1)} style={{flex:1,padding:"12px",borderRadius:13,border:"1.5px solid rgba(255,255,255,.15)",background:"transparent",color:"rgba(255,255,255,.6)",fontWeight:700,fontSize:14,cursor:"pointer",fontFamily:"inherit"}}>Zurueck</button>}
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

function Directory({data,onPick,onNewClub,lang,setLang}) {
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

  const SPORTS = ["alle","fussball","handball","tennis","badminton","schützen"];
  const SPORT_LABELS = {alle:"Alle",fussball:"Fussball",handball:"Handball",tennis:"Tennis",badminton:"Badminton","schützen":"Schützen"};
  const SPORT_COLS = {fussball:"#16a34a",handball:"#2563eb",tennis:"#d97706",badminton:"#7c3aed","schützen":"#dc2626"};
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
          <input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Verein suchen..."
            style={{width:"100%",padding:"11px 13px 11px 40px",fontSize:14,background:"rgba(255,255,255,.08)",border:"1.5px solid rgba(255,255,255,.12)",borderRadius:13,outline:"none",color:"#fff",boxSizing:"border-box"}}/>
        </div>
        <div style={{display:"flex",gap:7,overflowX:"auto",scrollbarWidth:"none",paddingBottom:4,marginBottom:16}}>
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
            <button onClick={()=>setMode("setup")} style={{marginTop:12,padding:"10px 20px",borderRadius:12,border:"none",background:"#16a34a",color:"#fff",fontWeight:700,fontSize:13,cursor:"pointer",fontFamily:"inherit"}}>Verein anlegen</button>
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
                  <div style={{fontSize:10,color:"rgba(255,255,255,.4)",marginBottom:7}}>{cl.sport||"Fussball"}</div>
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
                <div style={{fontSize:10,color:"rgba(255,255,255,.4)"}}>{cl.short} · {cl.sport||"Fussball"}</div>
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
          Nur Vereine die zugestimmt haben werden angezeigt
        </p>
        <div style={{marginTop:12}}>
          <AdBanner style={{borderRadius:12,overflow:"hidden"}}/>
        </div>
      </div>
    </div>
  );
}

function RolePicker({cl,onRole,onBack}) {
  const t=TH(cl);
  return (
    <div style={{minHeight:"100dvh",background:`linear-gradient(160deg,${t.s} 0%,${t.p}66 100%)`}}>
      <style>{CSS}</style>
      <div style={{padding:"50px 22px 0",maxWidth:440,margin:"0 auto"}}>
        <button onClick={onBack} style={{background:"rgba(255,255,255,.12)",border:"none",borderRadius:12,padding:"8px 14px",color:"rgba(255,255,255,.7)",fontSize:14,fontWeight:700,cursor:"pointer",marginBottom:32}}>← Zurück</button>
        <div className="up" style={{display:"flex",flexDirection:"column",alignItems:"center",marginBottom:40}}>
          <Logo cl={cl} sz={80}/>
          <h1 style={{color:"#fff",fontSize:26,fontWeight:900,letterSpacing:-.5,margin:"14px 0 6px",textAlign:"center"}}>{cl.name}</h1>
          <p style={{color:"rgba(255,255,255,.55)",fontSize:15}}>Wie möchtest du einsteigen?</p>
        </div>
        {[
          {r:"user",icon:"*",title:"Elternteil",sub:"Termine sehen & abstimmen"},{r:"helper",icon:"*",title:"Helfer",sub:"Turnier & Spieltag unterstützen"},{r:"trainer",icon:"*",title:"Trainer",sub:"Termine meiner Mannschaft"},{r:"admin",icon:"*",title:"Vereinsadmin",sub:"Alle Rechte & Einstellungen"}
        ].map((x,i)=>(
          <div key={x.r} className="up" onClick={()=>onRole(x.r)}
            style={{background:"rgba(255,255,255,.09)",border:"1.5px solid rgba(255,255,255,.13)",borderRadius:20,padding:"17px 20px",cursor:"pointer",marginBottom:12,animationDelay:`${i*.07}s`,transition:"all .18s"}}>
            <div style={{display:"flex",alignItems:"center",gap:14}}>
              <div style={{width:48,height:48,borderRadius:15,background:"rgba(255,255,255,.12)",display:"flex",alignItems:"center",justifyContent:"center",fontSize:24,flexShrink:0}}>{x.icon}</div>
              <div style={{flex:1}}><div style={{color:"#fff",fontWeight:900,fontSize:17}}>{x.title}</div><div style={{color:"rgba(255,255,255,.5)",fontSize:13,marginTop:2}}>{x.sub}</div></div>
              <div style={{color:"rgba(255,255,255,.3)",fontSize:22}}>›</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function TrainerLogin({cl,trainers,teams,onLogin,onBack}) {
  const t=TH(cl);
  const [step,setStep]=useState("cat");  // cat → trainer → pwd
  const [cat,setCat]=useState(null);
  const [sel,setSel]=useState(null);
  const [pw,setPw]=useState("");
  const [err,setErr]=useState(false);
  const cats=[...new Set(
    trainers.flatMap(tr=>(tr.tids||[]).map(tid=>{
      const tm=teams?.find(x=>x.id===tid);
      return tm?.cat||tm?.name||null;
    }).filter(Boolean))
  )].sort();

  const trainersInCat=cat
    ? trainers.filter(tr=>(tr.tids||[]).some(tid=>{const tm=teams?.find(x=>x.id===tid);return(tm?.cat||tm?.name)===cat;}))
    : [];
  const selTr=trainers.find(x=>x.id===sel);

  const go=()=>{
    if(selTr&&pw===selTr.pw){onLogin({...selTr,role:"trainer"});}
    else{setErr(true);setTimeout(()=>setErr(false),1800);}
  };

  const GradWrap=({children})=>(
    <div style={{minHeight:"100dvh",background:`linear-gradient(160deg,${t.s} 0%,${t.p}66 100%)`}}>
      <style>{CSS}</style>
      <div style={{padding:"48px 20px 0",maxWidth:460,margin:"0 auto"}}>
        <button onClick={step==="cat"?onBack:step==="trainer"?()=>setStep("cat"):()=>{setStep("trainer");setPw("");setErr(false);}}
          style={{background:"rgba(255,255,255,.12)",border:"none",borderRadius:12,padding:"8px 14px",color:"rgba(255,255,255,.7)",fontSize:14,fontWeight:700,cursor:"pointer",marginBottom:28}}>← Zurück</button>
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
            const icons=[...new Set(trs.flatMap(tr=>(tr.tids||[]).map(tid=>teams?.find(x=>x.id===tid)?.icon).filter(Boolean)))];
            return (
              <div key={c} className="up" onClick={()=>{setCat(c);if(trs.length===1){setSel(trs[0].id);setPw("");setStep("pwd");}else setStep("trainer");}}
                style={{background:"rgba(255,255,255,.09)",border:"1.5px solid rgba(255,255,255,.13)",borderRadius:20,padding:"16px 20px",cursor:"pointer",marginBottom:12,animationDelay:`${i*.06}s`,display:"flex",alignItems:"center",gap:14}}>
                <div style={{width:46,height:46,borderRadius:14,background:"rgba(255,255,255,.15)",display:"flex",alignItems:"center",justifyContent:"center",fontSize:22,flexShrink:0}}>{icons[0]||"*"}</div>
                <div style={{flex:1}}>
                  <div style={{color:"#fff",fontWeight:900,fontSize:18}}>{c}</div>
                  <div style={{color:"rgba(255,255,255,.5)",fontSize:12,marginTop:2}}>{trs.length} Trainer</div>
                </div>
                <span style={{color:"rgba(255,255,255,.3)",fontSize:22}}>›</span>
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
              {(tr.tids||[]).map(tid=>teams?.find(x=>x.id===tid)?.name).filter(Boolean).join(",")}
            </div>
          </div>
          <span style={{color:"rgba(255,255,255,.3)",fontSize:22}}>›</span>
        </div>
      ))}
    </GradWrap>
  );
  return (
    <div style={{minHeight:"100dvh",background:`linear-gradient(160deg,${t.s},${t.p}66)`,display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",padding:24,position:"relative"}}>
      <style>{CSS}</style>
      <button onClick={()=>{setStep(trainersInCat.length>1?"trainer":"cat");setPw("");setErr(false);}} style={{position:"absolute",top:22,left:22,background:"rgba(255,255,255,.12)",border:"none",borderRadius:12,padding:"8px 14px",color:"rgba(255,255,255,.7)",fontSize:14,fontWeight:700,cursor:"pointer"}}>← Zurück</button>
      <div className="up" style={{width:"100%",maxWidth:370}}>
        <div style={{textAlign:"center",marginBottom:28}}>
          <Av name={selTr?.name||"?"} sz={72} sx={{margin:"0 auto 14px"}}/>
          <h2 style={{color:"#fff",fontSize:22,fontWeight:900,margin:"0 0 4px"}}>{selTr?.name}</h2>
          <p style={{color:"rgba(255,255,255,.5)",fontSize:13}}>{cat} · {cl.name}</p>
        </div>
        <div style={{background:"rgba(255,255,255,.1)",backdropFilter:"blur(16px)",borderRadius:22,padding:"24px 22px",border:"1px solid rgba(255,255,255,.15)"}}>
          <input type="password" value={pw} onChange={e=>{setPw(e.target.value);setErr(false);}}
            onKeyDown={e=>{if(e.key==="Enter")go();}}
            placeholder="Passwort…" autoFocus
            style={{width:"100%",padding:"13px 16px",fontSize:16,background:"rgba(255,255,255,.12)",border:`2px solid ${err?"#ff6b6b":pw?"rgba(255,255,255,.4)":"rgba(255,255,255,.2)"}`,borderRadius:13,outline:"none",color:"#fff",marginBottom:10}}/>
          {err&&<div style={{background:"rgba(255,107,107,.15)",borderRadius:10,padding:"9px 13px",fontSize:13,fontWeight:700,color:"#ff9999",marginBottom:10,textAlign:"center"}}> Falsches Passwort</div>}
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
  const t=TH(cl); const [pw,setPw]=useState(""); const [err,setErr]=useState(false);
  const go=()=>{ if(pw===cl.adm){onLogin({id:"admin",role:"admin",cid:cl.id,name:"Vereinsadmin"});}else{setErr(true);setTimeout(()=>setErr(false),1800);} };
  return (
    <div style={{minHeight:"100dvh",background:`linear-gradient(135deg,${t.s},${t.p}66)`,display:"flex",alignItems:"center",justifyContent:"center",padding:22}}>
      <style>{CSS}</style>
      <div className="up" style={{width:"100%",maxWidth:390}}>
        <button onClick={onBack} style={{background:"rgba(255,255,255,.12)",border:"none",borderRadius:12,padding:"8px 14px",color:"rgba(255,255,255,.7)",fontSize:14,fontWeight:700,cursor:"pointer",marginBottom:26}}>← Zurück</button>
        <div style={{background:"#fff",borderRadius:24,padding:"34px 26px",boxShadow:"0 24px 80px rgba(0,0,0,.4)"}}>
          <div style={{textAlign:"center",marginBottom:22}}><Logo cl={cl} sz={68} sx={{margin:"0 auto 12px"}}/><h2 style={{fontSize:22,fontWeight:900,color:"#0f172a",margin:"0 0 4px"}}>Vereinsadmin</h2><p style={{color:"#94a3b8",fontSize:13}}>{cl.name}</p></div>
          <Inp label="Admin-Passwort" type="password" val={pw} set={setPw} ph="Passwort…" af cl={cl}/>
          {err&&<div style={{background:"#fef2f2",borderRadius:12,padding:"10px 14px",fontSize:14,fontWeight:700,color:"#dc2626",marginTop:10}}> Falsches Passwort</div>}
          <div style={{height:14}}/><Btn full ch="Als Admin einloggen" onClick={go} icon="**" v="drk"/>
          <p style={{textAlign:"center",fontSize:11,color:"#94a3b8",marginTop:12}}>Demo: <code style={{background:"#f1f5f9",padding:"2px 5px",borderRadius:5}}>admin123</code> / <code style={{background:"#f1f5f9",padding:"2px 5px",borderRadius:5}}>wissel123</code></p>
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
        <button onClick={onBack} style={{background:"rgba(255,255,255,.12)",border:"none",borderRadius:12,padding:"8px 14px",color:"rgba(255,255,255,.7)",fontSize:14,fontWeight:700,cursor:"pointer",marginBottom:26}}>← Zurück</button>
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
                <Inp label="Persönlicher Helfer-Code" type="password" val={code} set={v=>{setCode(v);setErr(false);}} ph="Code vom Trainer erhalten…" af cl={cl}/>
                {err&&<div style={{background:"#fef2f2",borderRadius:12,padding:"10px 14px",fontSize:14,fontWeight:700,color:"#dc2626",marginTop:10}}> Ungültiger Code</div>}
                <div style={{height:14}}/>
                <Btn full ch="Als Helfer einloggen" onClick={go} dis={!code.trim()} icon="*" cl={cl}/>
              </>
          }
        </div>
      </div>
    </div>
  );
}

function UserFlow({cl,teams,players,playerProfiles,onDone,onBack}) {
  const t=TH(cl);
  const [step,setStep]=useState("cat");
  const [cat,setCat]=useState(null);
  const [tid,setTid]=useState(null);
  const [q,setQ]=useState("");
  const [pwd,setPwd]=useState(""); const [pwdErr,setPwdErr]=useState(false);
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
        <button onClick={goBack} style={{background:"rgba(255,255,255,.12)",border:"none",borderRadius:12,padding:"8px 14px",color:"rgba(255,255,255,.7)",fontSize:14,fontWeight:700,cursor:"pointer",marginBottom:28}}>← Zurück</button>
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
            <span style={{color:"rgba(255,255,255,.3)",fontSize:22}}>›</span>
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
          <span style={{marginLeft:"auto",color:"rgba(255,255,255,.3)",fontSize:22}}>›</span>
        </div>
      ))}
    </GradWrap>
  );
  if(step==="pwd") return (
    <div style={{minHeight:"100dvh",background:`linear-gradient(160deg,${t.s},${t.p}66)`,display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",padding:24,position:"relative"}}>
      <style>{CSS}</style>
      <button onClick={goBack} style={{position:"absolute",top:22,left:22,background:"rgba(255,255,255,.12)",border:"none",borderRadius:12,padding:"8px 14px",color:"rgba(255,255,255,.7)",fontSize:14,fontWeight:700,cursor:"pointer"}}>← Zurück</button>
      <div className="up" style={{width:"100%",maxWidth:370}}>
        <div style={{textAlign:"center",marginBottom:28}}>
          <div style={{width:72,height:72,borderRadius:22,background:ct?.col+"33",border:`1.5px solid ${ct?.col}66`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:38,margin:"0 auto 14px"}}>{ct?.icon}</div>
          <h2 style={{color:"#fff",fontSize:22,fontWeight:900,margin:"0 0 4px"}}>{ct?.name}</h2>
          <p style={{color:"rgba(255,255,255,.5)",fontSize:13}}>Team-Passwort eingeben</p>
        </div>
        <div style={{background:"rgba(255,255,255,.1)",backdropFilter:"blur(16px)",borderRadius:22,padding:"24px 22px",border:"1px solid rgba(255,255,255,.15)"}}>
          <input type="password" value={pwd} onChange={e=>{setPwd(e.target.value);setPwdErr(false);}}
            onKeyDown={e=>{if(e.key==="Enter"){if(pwd===ct?.pwd){const assigned=(playerProfiles||[]).some(p=>p.mainTid===ct.id);if(assigned)setStep("name");else setStep("locked");}else{setPwdErr(true);setTimeout(()=>setPwdErr(false),1800);}}}}
            placeholder="Passwort…" autoFocus
            style={{width:"100%",padding:"13px 16px",fontSize:16,background:"rgba(255,255,255,.12)",border:`2px solid ${pwdErr?"#ff6b6b":pwd?"rgba(255,255,255,.4)":"rgba(255,255,255,.2)"}`,borderRadius:13,outline:"none",color:"#fff",marginBottom:10}}/>
          {pwdErr&&<div style={{background:"rgba(255,107,107,.15)",borderRadius:10,padding:"9px 13px",fontSize:13,fontWeight:700,color:"#ff9999",marginBottom:10,textAlign:"center"}}> Falsches Passwort</div>}
          <button onClick={()=>{if(pwd===ct?.pwd){
            const assigned=(playerProfiles||[]).some(p=>p.mainTid===ct.id);
            if(assigned) setStep("name");
            else setStep("locked"); // team not yet released
          }else{setPwdErr(true);setTimeout(()=>setPwdErr(false),1800);}}} disabled={!pwd.trim()}
            style={{width:"100%",padding:"13px",fontSize:15,fontWeight:800,background:pwd.trim()?cl.pri:"rgba(255,255,255,.15)",color:pwd.trim()?"#fff":"rgba(255,255,255,.4)",border:"none",borderRadius:13,cursor:pwd.trim()?"pointer":"not-allowed",transition:"all .18s"}}>
             Team öffnen
          </button>
          <div style={{marginTop:12,textAlign:"center",fontSize:11,color:"rgba(255,255,255,.3)"}}>Demo: {ct?.pwd}</div>
        </div>
      </div>
    </div>
  );
  if(step==="locked") return (
    <div style={{minHeight:"100dvh",background:`linear-gradient(160deg,${t.s},${t.p}66)`,display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",padding:24}}>
      <style>{CSS}</style>
      <button onClick={()=>setStep("pwd")} style={{position:"absolute",top:22,left:22,background:"rgba(255,255,255,.12)",border:"none",borderRadius:12,padding:"8px 14px",color:"rgba(255,255,255,.7)",fontSize:14,fontWeight:700,cursor:"pointer"}}>← Zurück</button>
      <div className="up" style={{textAlign:"center",maxWidth:340}}>
        <div style={{fontSize:64,marginBottom:16}}></div>
        <h2 style={{color:"#fff",fontSize:22,fontWeight:900,margin:"0 0 12px"}}>{ct?.name}</h2>
        <div style={{background:"rgba(255,255,255,.1)",borderRadius:18,padding:"24px 22px",border:"1px solid rgba(255,255,255,.15)"}}>
          <p style={{color:"#fff",fontSize:16,fontWeight:700,marginBottom:8}}>Kader noch nicht veröffentlicht</p>
          <p style={{color:"rgba(255,255,255,.6)",fontSize:14,lineHeight:1.6}}>
            Der Trainer hat die Spieler-Einteilung für diese Mannschaft noch nicht abgeschlossen.
          </p>
          <div style={{marginTop:16,background:"rgba(255,255,255,.08)",borderRadius:12,padding:"12px",fontSize:13,color:"rgba(255,255,255,.5)"}}>
            Sobald der Trainer die Spieler zugeteilt hat,kannst du dich hier anmelden.
          </div>
        </div>
        <button onClick={()=>setStep("pwd")} style={{marginTop:20,padding:"12px 28px",borderRadius:13,border:"1.5px solid rgba(255,255,255,.3)",background:"transparent",color:"rgba(255,255,255,.7)",fontWeight:700,fontSize:14,cursor:"pointer",fontFamily:"inherit"}}>
          ← Zurück zum Login
        </button>
      </div>
    </div>
  );
  return (
    <div style={{minHeight:"100dvh",background:"#f0f4f8",display:"flex",flexDirection:"column"}}>
      <div style={{background:`linear-gradient(135deg,${t.s},${t.p}99)`,padding:"16px 18px 22px"}}>
        <button onClick={goBack} style={{background:"rgba(255,255,255,.12)",border:"none",borderRadius:12,padding:"8px 14px",color:"rgba(255,255,255,.7)",fontSize:14,fontWeight:700,cursor:"pointer",marginBottom:14}}>← Zurück</button>
        <div style={{display:"flex",alignItems:"center",gap:12}}><Logo cl={cl} sz={40}/><div><div style={{color:"rgba(255,255,255,.6)",fontSize:12,fontWeight:700}}>{ct?.icon} {ct?.name}</div><div style={{color:"#fff",fontSize:20,fontWeight:900}}>Wer bist du?</div></div></div>
      </div>
      <div style={{padding:"12px 14px 0",background:"#f0f4f8",position:"sticky",top:0,zIndex:10}}>
        <div style={{position:"relative"}}><span style={{position:"absolute",left:14,top:"50%",transform:"translateY(-50%)",fontSize:16}}></span><input value={q} onChange={e=>setQ(e.target.value)} placeholder="Suchen…" style={{width:"100%",padding:"12px 16px 12px 42px",fontSize:15,border:"2px solid #e2e8f0",borderRadius:14,outline:"none",background:"#fff"}}/></div>
      </div>
      <div style={{flex:1,overflowY:"auto",padding:"10px 14px",display:"flex",flexDirection:"column",gap:8}}>
        {list.map((p,i)=>(
          <div key={p} className="up" onClick={()=>onDone(tid,p)}
            style={{background:"#fff",border:"1.5px solid #e2e8f0",borderRadius:16,padding:"13px 16px",cursor:"pointer",display:"flex",alignItems:"center",gap:12,animationDelay:`${i*.03}s`}}>
            <Av name={p} sz={40}/><span style={{fontWeight:700,fontSize:16,color:"#0f172a",flex:1}}>{p}</span><span style={{color:"#94a3b8",fontSize:20}}>›</span>
          </div>
        ))}
        {list.length===0&&<div style={{textAlign:"center",padding:"32px",color:"#94a3b8"}}><div style={{fontSize:36,marginBottom:8}}></div><p style={{fontWeight:700}}>Niemanden gefunden</p></div>}
      </div>
      <div style={{padding:"12px 14px 36px",background:"#fff",borderTop:"1px solid #e2e8f0"}}>
        <p style={{fontSize:11,fontWeight:800,color:"#94a3b8",marginBottom:8}}>NICHT IN DER LISTE?</p>
        <input value={q} onChange={e=>setQ(e.target.value)} placeholder="Namen manuell eingeben…"
          style={{width:"100%",padding:"11px 14px",fontSize:14,border:"1.5px solid #e2e8f0",borderRadius:12,outline:"none",marginBottom:8}}/>
        {q.trim().length>1&&<button onClick={()=>onDone(tid,q.trim())}
          style={{width:"100%",padding:"11px",borderRadius:12,border:"none",background:cl.pri,color:contrast(cl.pri),fontWeight:800,fontSize:14,cursor:"pointer",fontFamily:"inherit"}}>
           Als „{q.trim()}" einloggen
        </button>}
      </div>
    </div>
  );
}

function PollAttend({ev,user,onVote,cl}) {
  const yes=Object.entries(ev.votes).filter(([,v])=>(typeof v==="object"?v.val:v)==="yes").map(([n])=>n);
  const no =Object.entries(ev.votes).filter(([,v])=>(typeof v==="object"?v.val:v)==="no" ).map(([n])=>n);
  const rawUv=ev.votes[user]; const uv=typeof rawUv==="object"&&rawUv!==null?rawUv.val:rawUv;
  const tot=yes.length+no.length; const p=cl?.pri||"#16a34a";
  const dlPassed=ev.deadline&&(now()>ev.deadline.date||(now()===ev.deadline.date));
  return (
    <div style={{display:"flex",flexDirection:"column",gap:10}}>
      {ev.note&&<div style={{background:"#fffbeb",border:"1.5px solid #fde68a",borderRadius:12,padding:"10px 13px",fontSize:13,color:"#92400e",fontWeight:500}}> {ev.note}</div>}
      {ev.deadline&&<div style={{background:dlPassed?"#fee2e2":"#fffbeb",border:`1.5px solid ${dlPassed?"#fca5a5":"#fde68a"}`,borderRadius:12,padding:"9px 13px",fontSize:13,fontWeight:700,color:dlPassed?"#dc2626":"#d97706"}}>⏰ {dlPassed?"Frist abgelaufen — Abstimmung wird trotzdem gezählt":"Abstimmungs-Frist: "+ev.deadline.date+(ev.deadline.time?" "+ev.deadline.time+" Uhr":"")}</div>}
      {[{id:"yes",label:"Mein Kind ist dabei",color:p,bg:mix(p,86),voters:yes},{id:"no",label:"Leider nicht dabei",color:"#dc2626",bg:"#fee2e2",voters:no}].map(o=>{
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
      {tot>0&&<p style={{textAlign:"center",fontSize:12,color:"#94a3b8",fontWeight:600}}>{yes.length} dabei · {no.length} nicht dabei · {tot} gesamt</p>}
    </div>
  );
}

function PollList({ev,user,onVote}) {
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
      {ev.note&&<div style={{background:"#fffbeb",border:"1.5px solid #fde68a",borderRadius:12,padding:"10px 13px",fontSize:13,color:"#92400e",fontWeight:500,marginBottom:12}}> {ev.note}</div>}
      <p style={{fontSize:13,color:"#64748b",fontWeight:600,marginBottom:10}}> Mehrfachauswahl möglich — tippe zum Auswählen</p>
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

const POSITIONS_LIST = ["Torwart","Innenverteidiger","Außenverteidiger","Def. Mittelfeld","Zentrales Mittelfeld","Off. Mittelfeld","Linker Flügel","Rechter Flügel","Stürmer","Universalspieler"];
const FOOT_LIST      = ["Rechts","Links","Beidfüßig"];
const RECOMMEND_LIST = ["Aufsteigen","Verbleiben","Absteigen","Pause empfohlen","Beobachten"];
const TEAM_HIERARCHY = ["sus_f3","sus_f2","sus_f1","sus_e","sus_d","sus_c","sus_b","sus_a"];
function getRecommendColor(rec) {
  if(rec==="Aufsteigen") return {col:"#16a34a",bg:"#dcfce7",icon:"*"};
  if(rec==="Verbleiben") return {col:"#2563eb",bg:"#eff6ff",icon:"*"};
  if(rec==="Absteigen")  return {col:"#dc2626",bg:"#fee2e2",icon:"*"};
  if(rec==="Pause empfohlen") return {col:"#d97706",bg:"#fef3c7",icon:"*"};
  if(rec==="Beobachten") return {col:"#7c3aed",bg:"#ede9fe",icon:"*"};
  return {col:"#94a3b8",bg:"#f1f5f9",icon:"—"};
}
const JERSEY_SIZES   = ["104","110","116","122","128","134","140","146","152","158","164","XS","S","M","L","XL"];
const JERSEY_STATUS  = [
  {id:"home",icon:"Heim",label:"Zu Hause",col:"#16a34a",bg:"#dcfce7"},{id:"bag",icon:"*",label:"Im Sporttasche",col:"#2563eb",bg:"#eff6ff"},{id:"lost",icon:"*",label:"Nicht auffindbar",col:"#d97706",bg:"#fef3c7"},{id:"damaged",icon:"*",label:"Beschädigt",col:"#dc2626",bg:"#fee2e2"},{id:"ok",icon:"OK",label:"Abgegeben",col:"#16a34a",bg:"#dcfce7"},{id:"none",icon:"—",label:"Keine Angabe",col:"#94a3b8",bg:"#f1f5f9"},];
const BASE_STRENGTHS = ["Schnelligkeit","Technik","Zweikampf","Kopfball","Übersicht","Flanken","Schuss","Ausdauer","Führung","Einsatz","Pressing","Spielaufbau","Defensivstärke","Torwartreflex"];

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
  if (fitType === "pullup")     return {text:"⬆* Hochgeholt",col:"#d97706",bg:"#fef3c7"};
  if (fitType === "girlpullup") return {text:"⬆* Hochgeholt (W)",col:"#7c3aed",bg:"#ede9fe"};
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
              ⭐ {s}
              <button onClick={()=>removeCustom(s)} style={{background:"none",border:"none",color:tp,cursor:"pointer",fontSize:13,lineHeight:1,padding:0,opacity:.7}}></button>
            </span>
          ))}
        </div>
      )}
      <div style={{display:"flex",gap:8}}>
        <input value={custom} onChange={e=>setCustom(e.target.value)}
          onKeyDown={e=>{if(e.key==="Enter"){e.preventDefault();addCustom();}}}
          placeholder="Eigene Stärke eingeben…"
          style={{flex:1,padding:"9px 13px",fontSize:13,border:`1.5px solid ${custom?tp:"#e2e8f0"}`,borderRadius:10,outline:"none",transition:"border-color .14s"}}/>
        <button onClick={addCustom} disabled={!custom.trim()}
          style={{padding:"0 14px",height:38,borderRadius:10,border:"none",background:custom.trim()?tp:"#e2e8f0",color:custom.trim()?"#fff":"#94a3b8",fontWeight:700,fontSize:13,cursor:custom.trim()?"pointer":"default",fontFamily:"inherit",transition:"all .18s",whiteSpace:"nowrap"}}>
          + Hinzufügen
        </button>
      </div>
      <p style={{fontSize:11,color:"#94a3b8",marginTop:6}}>↵ Enter oder Button · Eigene Stärken werden orange angezeigt</p>
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
        {open?"▲ Schließen":"＋ Spieler hinzufügen"}
      </button>
      {open&&(
        <div style={{marginTop:8,background:"#f8fafc",borderRadius:12,padding:"10px",border:"1.5px solid #e2e8f0"}}>
          <input value={q} onChange={e=>setQ(e.target.value)} placeholder="Suchen…"
            style={{width:"100%",padding:"8px 12px",fontSize:13,border:"1.5px solid #e2e8f0",borderRadius:9,outline:"none",marginBottom:8}}/>
          <div style={{maxHeight:160,overflowY:"auto",display:"flex",flexDirection:"column",gap:4}}>
            {available.slice(0,20).map(pl=>(
              <button key={pl.id} onClick={()=>{toggle(pl.id);}}
                style={{display:"flex",alignItems:"center",gap:8,padding:"7px 10px",borderRadius:9,border:"none",background:"#fff",cursor:"pointer",fontFamily:"inherit",textAlign:"left",width:"100%"}}>
                <Av name={pl.name} sz={28}/>
                <div style={{flex:1}}>
                  <div style={{fontWeight:700,fontSize:13,color:"#0f172a"}}>{pl.name}</div>
                  <div style={{fontSize:11,color:"#64748b"}}>Jg. {pl.by} · {pl.gender==="w"?"*":"*"}</div>
                </div>
                <span style={{fontSize:16,color}}>＋</span>
              </button>
            ))}
            {available.length===0&&<p style={{fontSize:12,color:"#94a3b8",textAlign:"center",padding:"8px"}}>Niemanden gefunden</p>}
          </div>
        </div>
      )}
    </div>
  );
}

function PlayerProfile({ player,teams,allEvents,allPlayers,cid,onSave,onClose,t }) {

  const [p,setP] = useState({...player});
  const up = f => setP(prev => ({...prev,...f}));
  const allTeams  = teams.filter(tm => tm.cid === cid);
  const eligCats  = eligibleCats(p.by||2014,p.gender||"m");

  const toggleOptTid = tid => up({optTids:(p.optTids||[]).includes(tid)?(p.optTids||[]).filter(x=>x!==tid):[...(p.optTids||[]),tid]});

  const allTids = [p.mainTid,...(p.optTids||[])].filter(Boolean);
  const rawStats = playerStats(p.name,allTids,allEvents||[]);
  const statsRows = allTeams.filter(tm => allTids.includes(tm.id)).map(tm => ({
    tm,s: rawStats[tm.id]||{training:0,games:0}
  }));
  const totalGames    = statsRows.reduce((s,r)=>s+r.s.games,0);
  const totalTraining = statsRows.reduce((s,r)=>s+r.s.training,0);

  return (
    <div style={{position:"fixed",inset:0,background:"rgba(0,0,0,.6)",zIndex:900,display:"flex",alignItems:"flex-end",justifyContent:"center",backdropFilter:"blur(8px)"}}>
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
                {p.by&&`Jg. ${p.by}`}{p.position&&` · ${p.position}`}
                {p.name && totalGames > 0 && ` · * ${totalGames} Spiele`}
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
              <Sel label="Geschlecht" val={p.gender||"m"} set={v=>up({gender:v})} opts={[["m","* Männlich"],["w","* Weiblich"]]}/>
            </div>
            {p.by && (
              <div style={{background:"#f0fdf4",borderRadius:10,padding:"9px 13px",fontSize:12,color:"#15803d",fontWeight:600}}>
                 Passt altersmäßig in: {eligibleCats(p.by,p.gender||"m").join(",")||"Keine Kategorie"}
                {p.gender==="w"&&<span style={{color:"#d97706",marginLeft:5}}>· Mädchen +2 Jahre berücksichtigt</span>}
              </div>
            )}
          </Section>

          {}
          <Section title="* Mannschaften">
            <Sel label="Hauptmannschaft" val={p.mainTid||""} set={v=>up({mainTid:v})}
              opts={[["","– keine –"],...allTeams.map(tm=>[tm.id,tm.icon+" "+tm.name])]}/>
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
                        <div style={{fontSize:11,color:"#64748b"}}>{tm.cat}{!fits?" · Jahrgang passt nicht":""}</div>
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
              <Sel label="Position" val={p.position||""} set={v=>up({position:v})} opts={[["","– wählen –"],...POSITIONS_LIST.map(x=>[x,x])]}/>
              <Sel label="Starker Fuß" val={p.foot||""} set={v=>up({foot:v})} opts={[["","– wählen –"],...FOOT_LIST.map(x=>[x,x])]}/>
            </div>
            <div>
              <div style={{fontSize:11,fontWeight:800,color:"#64748b",marginBottom:8,letterSpacing:.5}}>STÄRKEN</div>
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
                    style={{fontSize:28,background:"none",border:"none",cursor:"pointer",opacity:n<=(p.rating||0)?1:.2,transition:"opacity .14s"}}>⭐</button>
                ))}
                {(p.rating||0) > 0 && <span style={{fontSize:13,color:"#64748b",alignSelf:"center",marginLeft:4,fontWeight:600}}>{p.rating}/5</span>}
              </div>
            </div>
          </Section>

          {}
          <Section title="* Statistiken">
            <div style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:9,marginBottom:12}}>
              {[["goals","*","Tore"],["assists","*","Vorlagen"],["yellowCards","*","Gelb"],["redCards","*","Rot"]].map(([k,ic,l])=>(
                <div key={k}>
                  <div style={{fontSize:10,fontWeight:800,color:"#64748b",marginBottom:6,textAlign:"center"}}>{ic} {l}</div>
                  <div style={{display:"flex",alignItems:"center",gap:4,justifyContent:"center"}}>
                    <button onClick={()=>up({[k]:Math.max(0,(p[k]||0)-1)})} style={{width:26,height:26,borderRadius:7,border:"1.5px solid #e2e8f0",background:"#f8fafc",cursor:"pointer",fontWeight:800}}>−</button>
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
                <div style={{fontSize:11,fontWeight:800,color:"#64748b",marginBottom:6,letterSpacing:.5}}>GRÖSSE</div>
                <select value={p.jerseySize||""} onChange={e=>up({jerseySize:e.target.value})}
                  style={{width:"100%",padding:"11px 13px",fontSize:15,border:"1.5px solid #e2e8f0",borderRadius:11,outline:"none",background:"#fff",fontFamily:"inherit"}}>
                  <option value="">– wählen –</option>
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
              <div style={{fontSize:11,fontWeight:800,color:"#64748b",marginBottom:6,letterSpacing:.5}}>EMPFEHLUNG NÄCHSTE SAISON</div>
              {}
              {p.lastTeamId&&(()=>{
                const lastIdx=TEAM_HIERARCHY.indexOf(p.lastTeamId);
                const curIdx=TEAM_HIERARCHY.indexOf(p.mainTid);
                const hint = lastIdx<0 ? null :
                  curIdx>lastIdx ? "⬆* Aufstieg gegenüber letzter Saison" :
                  curIdx===lastIdx ? "↔* Gleiches Niveau wie letzte Saison" :
                  "⬇* Abstieg gegenüber letzter Saison — nur in Einzelfällen";
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
                        {isDowngrade&&<div style={{fontSize:11,color:"#dc2626",marginTop:1}}> Nur in begründeten Einzelfällen</div>}
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
                placeholder="z.B. Entwicklung,Verhalten,Stärken,Schwächen…"
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
  const allTids = [pl.mainTid,...(pl.optTids||[])].filter(Boolean);
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
            <span>{pl.gender==="w"?"*":"*"}</span>
            {pl.position && <span>· {pl.position}</span>}
            {!isMain && <Tag c="#d97706" bg="#fef3c7" ch="Aushilfe" sm/>}
          </div>
        </div>
        <div style={{display:"flex",gap:5,flexShrink:0,alignItems:"center"}}>
          {totalGames > 0 && <Tag c="#16a34a" bg="#dcfce7" ch={`*${totalGames}`} sm/>}
          {(pl.rating||0) > 0 && <span style={{fontSize:14}}>{"⭐".repeat(Math.min(pl.rating,5))}</span>}
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
              {(pl.customStrengths||[]).map(s=><Tag key={s} c={`#d97706`} bg="#fef3c7" ch={`⭐${s}`} sm/>)}
            </div>
          )}
          {pl.recommend && (
            <div style={{marginTop:7}}>
              {(()=>{const {col,bg,icon}=getRecommendColor(pl.recommend);return(
                <span style={{display:"inline-flex",alignItems:"center",gap:5,fontSize:12,fontWeight:700,color:col,background:bg,borderRadius:7,padding:"3px 9px"}}>{icon} {pl.recommend}</span>
              );})()}
            </div>
          )}
          {pl.lastTeam&&pl.lastTeam!=="—"&&(
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
          <span style={{color:"#94a3b8",fontSize:18,transform:showScope?"rotate(180deg)":"none",transition:"transform .2s"}}>⌄</span>
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
        <input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Spieler suchen…"
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
        <div style={{position:"fixed",inset:0,background:"rgba(0,0,0,.6)",zIndex:900,display:"flex",alignItems:"flex-end",justifyContent:"center",backdropFilter:"blur(8px)"}}
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
                    Jg. {pl.by} · {pl.gender==="w"?"* Mädchen":"* Junge"}
                    {pl.gender==="w"&&<span style={{marginLeft:6,fontSize:11,background:"rgba(255,255,255,.2)",borderRadius:5,padding:"1px 7px"}}>+2J Mädchen-Regel</span>}
                  </div>
                  {pl.position&&<div style={{color:"rgba(255,255,255,.6)",fontSize:12,marginTop:2}}> {pl.position}{pl.foot?` · ${pl.foot}`:""}</div>}
                </div>
                <button onClick={()=>setShowProfile(false)} style={{width:34,height:34,borderRadius:11,background:"rgba(255,255,255,.15)",border:"none",color:"rgba(255,255,255,.8)",fontSize:18,cursor:"pointer"}}></button>
              </div>
              {}
              {(pl.rating||0)>0&&<div style={{marginTop:10,display:"flex",gap:2}}>
                {[1,2,3,4,5].map(n=><span key={n} style={{fontSize:18,opacity:n<=pl.rating?1:.2}}>⭐</span>)}
                <span style={{color:"rgba(255,255,255,.6)",fontSize:12,alignSelf:"center",marginLeft:6}}>{pl.rating}/5</span>
              </div>}
            </div>

            <div style={{padding:"18px 20px 40px",display:"flex",flexDirection:"column",gap:14}}>

              {}
              <div style={{background:"#f8fafc",borderRadius:13,padding:"13px 15px",border:"1.5px solid #e2e8f0"}}>
                <div style={{fontSize:11,fontWeight:800,color:"#64748b",marginBottom:9,letterSpacing:.5}}> ALTERSMÄSSIG PASSENDE TEAMS</div>
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
                    ⬆ <strong>Hochholen möglich:</strong> Jungen max. 2 Kategorien · Mädchen max. 4 Kategorien über dem normalen Altersband
                  </div>
                )}
              </div>

              {}
              {((pl.strengths||[]).length>0||(pl.customStrengths||[]).length>0)&&(
                <div>
                  <div style={{fontSize:11,fontWeight:800,color:"#64748b",marginBottom:8,letterSpacing:.5}}> STÄRKEN</div>
                  <div style={{display:"flex",flexWrap:"wrap",gap:6}}>
                    {(pl.strengths||[]).map(s=>(
                      <span key={s} style={{fontSize:12,fontWeight:700,color:"#2563eb",background:"#eff6ff",borderRadius:7,padding:"4px 10px",border:"1px solid #bfdbfe"}}>{s}</span>
                    ))}
                    {(pl.customStrengths||[]).map(s=>(
                      <span key={s} style={{fontSize:12,fontWeight:700,color:"#d97706",background:"#fef3c7",borderRadius:7,padding:"4px 10px",border:"1px solid #fde68a"}}>⭐ {s}</span>
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
                    <div style={{fontSize:11,fontWeight:800,color:"#64748b"}}>EMPFEHLUNG NÄCHSTE SAISON</div>
                    <div style={{fontWeight:800,fontSize:15,color:"#0f172a",marginTop:2}}>{pl.recommend}</div>
                    {pl.lastTeam&&pl.lastTeam!=="—"&&<div style={{fontSize:11,color:"#64748b",marginTop:2}}> Letzte Saison: {pl.lastTeam}</div>}
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
                      → {tm.name}
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
            <span style={{fontSize:11,color:"#94a3b8",fontWeight:500}}>ℹ Profil</span>
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
                  {lbl&&"⬆*"}{tm.name}
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
  const delPlayer = id => { save({...data,playerProfiles:allPlayers.filter(p=>p.id!==id)}); fire("Spieler entfernt"); };

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
              Eltern können sich erst anmelden wenn alle Spieler zugeteilt sind → Zuteilung öffnen
            </div>
          </div>
          <span style={{color:"#d97706",fontSize:18}}>›</span>
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
              <input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Spieler suchen…"
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
            {selTeam&&<span style={{color:"#94a3b8"}}>{selTeam.cat}{selTeam.years?" · Jg. "+selTeam.years:""}</span>}
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
                {showOpt?"▲":"▼"} AUSHILFE ({optPlayers.length}) — nicht im Hauptkader gezählt
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
              <input ref={ref} type="file" accept="image

function TemplateForm({initial,onSave,onCancel,cl,title}) {
  const t=TH(cl);
  const blank={name:"",icon:"Liste",items:[],_txt:"",_max:""};
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
        <div style={{fontSize:11,fontWeight:800,color:"#64748b",letterSpacing:.5,marginBottom:8}}>SYMBOL WÄHLEN</div>
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
              placeholder="Option eingeben,z.B. Waffeln…"
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
            <span style={{fontSize:11,color:"#94a3b8"}}>= max. x× auswählbar</span>
          </div>
          <p style={{fontSize:11,color:"#94a3b8",marginTop:8}}>Tipp: ↵ Enter = schnell hinzufügen</p>
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
          <input value={max} onChange={e=>setMax(e.target.value)} type="number" min="1" placeholder="—"
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
      {item.max&&<span style={{fontSize:11,fontWeight:700,color:"#d97706",background:"#fef3c7",borderRadius:6,padding:"3px 8px",whiteSpace:"nowrap"}}>max {item.max}×</span>}
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
          <p style={{color:"#94a3b8",fontSize:13,marginTop:8,lineHeight:1.6}}>Erstelle Vorlagen für häufig genutzte Umfragen.<br/>Beim nächsten Termin lädst du sie mit einem Klick.</p>
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
                  {item.max&&<span style={{fontSize:10,color:"#94a3b8",fontWeight:700}}>· max {item.max}</span>}
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
          <div style={{fontSize:13,color:"#64748b",marginTop:1}}>{mode==="none"?"Einzel-Termin":mode==="weekly"?`Wöchentlich · ${dates.length} Termine`:mode==="custom"?`Eigene Daten · ${dates.length} Termine`:""}</div>
        </div>
        <div style={{width:48,height:26,borderRadius:99,background:mode!=="none"?t.p:"#e2e8f0",position:"relative",transition:"background .2s",flexShrink:0}}>
          <div style={{width:20,height:20,borderRadius:"50%",background:"#fff",position:"absolute",top:3,left:mode!=="none"?25:3,transition:"left .2s",boxShadow:"0 1px 4px rgba(0,0,0,.2)"}}/>
        </div>
      </div>
      {mode!=="none"&&<div onClick={e=>e.stopPropagation()} style={{borderTop:`1px solid ${t.p}25`,padding:"16px"}}>
        <div style={{display:"flex",gap:8,marginBottom:16}}>
          {[["weekly","* Wöchentlich"],["custom","* Feste Daten"]].map(([m,l])=>(
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
            <div style={{fontSize:11,fontWeight:800,color:"#64748b",marginBottom:9,letterSpacing:.5}}>DATUM HINZUFÜGEN</div>
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
          <div style={{flex:1}}><div style={{color:"rgba(255,255,255,.55)",fontSize:11,fontWeight:700}}>SCHRITT {step} / {STEPS} · {SL[step-1].toUpperCase()}</div><div style={{color:"#fff",fontWeight:900,fontSize:18,marginTop:2}}>{isEdit?"Termin bearbeiten":"Neuer Termin"}</div></div>
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
          <Inp label="Nachricht an Eltern (optional)" val={f.note} set={v=>u({note:v})} ph="z.B. Bitte 15 Min früher da sein…" rows={2} cl={cl}/>
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
                  placeholder="Option eingeben…"
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
            {[[" Mannschaft",teamsSel?.icon+" "+teamsSel?.name],["Art",ET[f.type]?.icon+" "+ET[f.type]?.label],["Titel",f.title],["Uhrzeit",f.time||"—"],f.loc&&["Ort","* "+f.loc],f.note&&["Notiz","* "+f.note.slice(0,50)],["Umfrage",f.pt==="att"?"* Anwesenheit":f.pt==="carpool"?"* Fahrtgemeinschaft":`* Liste (${(f.li||[]).length} Opt.)`],["Termine",f.recMode==="weekly"?`* Wöchentlich · ${f.recDays?.length||0} Tage`:f.recMode==="custom"?`* ${f.recDates?.length||0} Daten`:"1 Termin · "+fmtD(f.date)],f.open&&["Sichtbarkeit","* Offen für andere Vereine"]].filter(Boolean).map(([k,v])=>(
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
        {step>1?<Btn ch="← Zurück" onClick={()=>setStep(s=>s-1)} v="gst" sx={{flex:1}}/>:<Btn ch="Abbrechen" onClick={onClose} v="gst" sx={{flex:1}}/>}
        {step<STEPS?<Btn ch="Weiter →" onClick={()=>setStep(s=>s+1)} dis={!ok()} cl={cl} sx={{flex:2}}/>:<Btn ch={isEdit?"Speichern":f.recMode==="weekly"?"Serie erstellen":f.recMode==="custom"?`${(f.recDates||[]).length} Termine erstellen`:"Termin erstellen"} onClick={finish} icon="*" cl={cl} sx={{flex:2}}/>}
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
        <div><p style={{fontWeight:900,fontSize:16,color:"#0f172a"}}> Helfer-Accounts</p><p style={{fontSize:12,color:"#64748b",marginTop:2}}>{allHelpers.length} angelegt · {allHelpers.filter(h=>h.active!==false).length} aktiv</p></div>
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
                  <span style={{fontSize:11,fontWeight:700,color:h.active!==false?"#16a34a":"#dc2626",background:h.active!==false?"#dcfce7":"#fee2e2",borderRadius:6,padding:"2px 8px"}}>{h.active!==false?"● Aktiv":"○ Inaktiv"}</span>
                </div>
              </div>
              <div style={{display:"flex",gap:5}}>
                <button onClick={()=>toggle(h.id)} style={{width:30,height:30,borderRadius:8,background:h.active!==false?"#fee2e2":"#dcfce7",border:"none",color:h.active!==false?"#dc2626":"#16a34a",cursor:"pointer",fontSize:14,display:"flex",alignItems:"center",justifyContent:"center"}}>{h.active!==false?"⏸":"▶"}</button>
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
            <Inp label="Name des Helfers" val={f.name} set={v=>u({name:v})} ph="z.B. Maria Müller" cl={cl}/>
            <Inp label="Kind im Verein (optional)" val={f.childName||""} set={v=>u({childName:v})} ph="z.B. Leon Müller,G-Jugend" cl={cl}/>
            <Inp label="Notizen (intern)" val={f.notes||""} set={v=>u({notes:v})} ph="z.B. Hilft bei Heimspielen" rows={2} cl={cl}/>

            {}
            <div style={{background:"#eff6ff",borderRadius:12,padding:"12px 14px",border:"1.5px solid #bfdbfe"}}>
              <div style={{fontSize:11,fontWeight:800,color:"#64748b",marginBottom:6}}>LOGIN-CODE (persönlich & geheim)</div>
              <div style={{display:"flex",alignItems:"center",gap:10}}>
                <span style={{fontWeight:900,fontSize:22,color:"#2563eb",fontFamily:"monospace",flex:1}}>{f.code}</span>
                <button onClick={()=>u({code:genCode()})} style={{padding:"6px 12px",borderRadius:9,border:"1.5px solid #bfdbfe",background:"#fff",color:"#2563eb",fontWeight:700,fontSize:12,cursor:"pointer",fontFamily:"inherit"}}> Neu generieren</button>
              </div>
              <p style={{fontSize:11,color:"#64748b",marginTop:6}}>Gib diesen Code dem Helfer. Er kann sich damit einloggen.</p>
            </div>

            {}
            <div>
              <div style={{fontSize:11,fontWeight:800,color:"#64748b",marginBottom:8}}>ZUGELASSEN FÜR</div>
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
                  {!isMe&&<div style={{fontSize:11,fontWeight:700,color:roleColor[msg.role]||"#64748b",marginBottom:3,marginLeft:4}}>{msg.author} · <span style={{color:"#94a3b8",fontWeight:500}}>{roleLabel[msg.role]||msg.role}</span></div>}
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
          placeholder="Nachricht schreiben… (Enter = senden)"
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
          <div style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:8,marginBottom:16}}>
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
                <p style={{fontSize:13,color:"#94a3b8",marginTop:4}}>Im Spielerprofil →  Trikot eintragen</p>
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
                          {pl.position&&<span>· {pl.position}</span>}
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
            <p style={{fontSize:12,color:"#b45309"}}>Tippe auf den Status des Spielers — z.B. ob das Trikot schon da ist oder noch fehlt.</p>
          </div>

          {}
          <div style={{position:"relative",marginBottom:12}}>
            <span style={{position:"absolute",left:12,top:"50%",transform:"translateY(-50%)",fontSize:15,pointerEvents:"none"}}></span>
            <input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Spieler suchen…"
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
                          {tm&&<span style={{color:tm.col,fontWeight:600}}>· {tm.name}</span>}
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

const APP_URL = "https://vereinsapp.de"; // Deine Domain hier eintragen

function ShareBanner({ cl,session,trigger,onDismiss }) {
  const t = TH(cl);
  const [copied,setCopied] = useState(false);
  const [shared,setShared] = useState(false);

  const shareText = `Ich nutze die Vereins-App für ${cl?.name || "unseren Verein"} — super einfach für Termine,Mannschaften und Kommunikation! ${APP_URL}`;

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
                : `${TRIGGERS[trigger]||"Alles läuft gut"} — magst du die App weiterempfehlen?`
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
    const lastAny = Math.max(...Object.values(dismissed).map(Number).filter(Boolean),0);
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

  {id:"left",icon:"Tuer",label:"Verein verlassen"},{id:"injury",icon:"Krank",label:"Verletzt / Pause"},{id:"retired",icon:"Ende",label:"Karriereende"},{id:"nolust",icon:"Pause",label:"Keine Lust / Auszeit"},{id:"moved",icon:"Weg",label:"Weggezogen"},{id:"other",icon:"?",label:"Sonstiges"},];
const AGE_GROUPS = [
  {id:"bambinis",label:"Bambinis",icon:"B",ageRange:"U5–U6"},{id:"g",label:"G-Jugend",icon:"G",ageRange:"U7"},{id:"f",label:"F-Jugend",icon:"F",ageRange:"U8–U9"},{id:"e",label:"E-Jugend",icon:"E",ageRange:"U10–U11"},{id:"d",label:"D-Jugend",icon:"D",ageRange:"U12–U13"},{id:"c",label:"C-Jugend",icon:"C",ageRange:"U14–U15"},{id:"b",label:"B-Jugend",icon:"B2",ageRange:"U16–U17"},{id:"a",label:"A-Jugend",icon:"A",ageRange:"U18–U19"},{id:"seniors",label:"Senioren",icon:"S",ageRange:"Aktive"},{id:"altherren",label:"Alt-Herren",icon:"AH",ageRange:"Ü32"},{id:"frauen",label:"Frauen",icon:"FR",ageRange:"Aktive"},];

function NewSeasonWizard({ data,save,fire,cl,myTids,onClose,onDone }) {
  const t=TH(cl||(data.clubs||[])[0]);
  const [step,setStep]=useState(1);
  const [f,setF]=useState({label:"",ageGroups:[],teamCount:{},newPlayers:[],archivePlayers:[]});
  const u=p=>setF(prev=>({...prev,...p}));
  const ok=()=>step===1?f.label.trim().length>=6:true;
  const finish=()=>{
    const sid="s"+f.label.replace(/\//g,"").replace(/\s/g,"").toLowerCase();
    const newSeason={id:sid,label:f.label,status:"planning"};
    const allP=data.playerProfiles||[];
    const copied=allP.filter(p=>!p.archived&&(myTids.includes(p.mainTid)||!p.mainTid)).map(p=>({...p,id:uid(),seasonId:sid,lastTeam:(data.teams||[]).find(x=>x.id===p.mainTid)?.name||"",lastTeamId:p.mainTid,mainTid:"",optTids:[],jerseyNr:"",jerseyStatus:"none",recommend:"",goals:0,assists:0,yellowCards:0,redCards:0}));
    save({...data,seasons:[...(data.seasons||[]),newSeason],playerProfiles:[...allP,...copied]});
    fire&&fire("Saison "+f.label+" angelegt");
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
            <p style={{fontSize:14,color:"#64748b",lineHeight:1.6}}>Alle aktiven Spieler der aktuellen Saison werden in die neue Saison {f.label} kopiert. Zuteilungen werden zurueckgesetzt — du kannst neu einteilen.</p>
            <div style={{background:"#f0fdf4",borderRadius:12,padding:"12px",border:"1.5px solid #bbf7d0",marginTop:12,fontSize:13,color:"#166534"}}>
              {(data.playerProfiles||[]).filter(p=>!p.archived&&myTids.includes(p.mainTid)).length} Spieler werden uebernommen
            </div>
          </>}
          {step===3&&<>
            <h3 style={{fontWeight:900,fontSize:18,margin:"0 0 8px"}}>Saison anlegen</h3>
            <p style={{fontSize:14,color:"#64748b"}}>Saison {f.label} wird als Planungs-Saison angelegt.</p>
          </>}
          <div style={{display:"flex",gap:9,marginTop:20,paddingBottom:32}}>
            {step>1?<button onClick={()=>setStep(s=>s-1)} style={{flex:1,padding:"12px",borderRadius:12,border:"1.5px solid #e2e8f0",background:"#fff",fontWeight:700,cursor:"pointer",fontFamily:"inherit"}}>Zurueck</button>:<button onClick={onClose} style={{flex:1,padding:"12px",borderRadius:12,border:"1.5px solid #e2e8f0",background:"#fff",fontWeight:700,cursor:"pointer",fontFamily:"inherit"}}>Abbrechen</button>}
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
              {s.status!=="archived"&&<button onClick={()=>switchActive(s.id)} style={{padding:"7px 14px",borderRadius:10,border:`2px solid ${t.p}`,background:isActive?t.p:"#fff",color:isActive?"#fff":t.p,fontWeight:700,fontSize:13,cursor:"pointer",fontFamily:"inherit"}}>{isActive?"Aktiv":"Oeffnen"}</button>}
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
  const [copyTo,setCopyTo]   = useState(seasons.find(s=>s.status==="planning")?.id||"");
  const planningSeasons = seasons.filter(s=>s.status==="planning");

  return (
    <div style={{position:"fixed",inset:0,background:"rgba(0,0,0,.6)",zIndex:900,display:"flex",alignItems:"flex-end",justifyContent:"center",backdropFilter:"blur(8px)"}}>
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
                Alle Spieler werden übernommen. Ihr letztes Team wird automatisch als "Letzte Saison" eingetragen. Trikotnummern,Statistiken und Zuteilungen werden zurückgesetzt — so kannst du neu einteilen.
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
                    <option value="">– Ziel-Saison wählen –</option>
                    {planningSeasons.map(s=>(
                      <option key={s.id} value={s.id}>{s.label}</option>
                    ))}
                  </select>
                )}
              </div>

              {copyFrom&&copyTo&&(
                <div style={{background:"#f8fafc",borderRadius:12,padding:"12px 14px",border:"1.5px solid #e2e8f0",fontSize:13,color:"#64748b"}}>
                  <strong style={{color:"#334155"}}>{allPlayers.filter(p=>p.seasonId===copyFrom&&myTids.includes(p.mainTid)).length} Spieler</strong> werden kopiert
                  {" → "}letztes Team vorausgefüllt,Positionen+Stärken übernommen,Zuteilung zurückgesetzt
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
  {id:4,label:"Ganzer Platz",icon:"*",fraction:1},{id:2,label:"Halber Platz",icon:"*",fraction:0.5},{id:1,label:"Viertel",icon:"*",fraction:0.25},{id:0.5,label:"Achtel",icon:"·",fraction:0.125},];

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
            <span style={{fontSize:11,color:"#64748b"}}>{b.timeFrom}–{b.timeTo}</span>
          </div>
        ))}
      </div>}
      {dayBookings.length===0&&<p style={{fontSize:12,color:"rgba(255,255,255,.6)",textAlign:"center",margin:"4px 0 0",background:"rgba(255,255,255,.08)",borderRadius:8,padding:"6px"}}>Keine Buchungen — Zelle antippen um zu buchen</p>}
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
    <div style={{position:"fixed",inset:0,background:"rgba(0,0,0,.6)",zIndex:910,display:"flex",alignItems:"flex-end",justifyContent:"center",backdropFilter:"blur(8px)"}}>
      <div style={{background:"#fff",borderRadius:"22px 22px 0 0",width:"100%",maxWidth:520,maxHeight:"80dvh",overflowY:"auto",animation:"down .24s ease"}}>
        <div style={{display:"flex",justifyContent:"center",padding:"12px 0 4px"}}><div style={{width:44,height:4,borderRadius:99,background:"#e2e8f0"}}/></div>
        <div style={{padding:"8px 20px 44px",display:"flex",flexDirection:"column",gap:14}}>
          <div style={{display:"flex",justifyContent:"space-between",alignItems:"center"}}>
            <div><div style={{fontWeight:900,fontSize:18,color:"#0f172a"}}>Platz buchen</div><div style={{fontSize:13,color:"#64748b"}}>{field.name} · {date}</div></div>
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
            <div style={{fontSize:11,fontWeight:800,color:"#64748b",marginBottom:7,letterSpacing:.5}}>PLATZGRÖSSE</div>
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
            <input value={f.note} onChange={e=>u({note:e.target.value})} placeholder="z.B. Training,Heimspiel…"
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

function FieldsTab({ data,myTids,session,save,fire,cl }) {
  const t = TH(cl);
  const cid = data.teams.find(tm=>myTids.includes(tm.id))?.cid;
  const fields = (data.fields||[]).filter(f=>f.cid===cid);
  const bookings = data.bookings||[];
  const [selDate,setSelDate] = useState(now());
  const [bookingTarget,setBookingTarget] = useState(null); // {field,cellStart}
  const [view,setView] = useState("day"); // day | week
  const weekDates = Array.from({length:7},(_,i)=>{
    const d = new Date(selDate+"T12:00:00");
    d.setDate(d.getDate()-d.getDay()+1+i);
    return d.toISOString().slice(0,10);
  });

  const dayBookings = (fieldId) => bookings.filter(b=>b.fieldId===fieldId&&b.date===selDate);

  const cancelBooking = id => {
    save({...data,bookings:bookings.filter(b=>b.id!==id)});
    fire("Buchung gelöscht");
  };
  const totalCells = fields.length * 8;
  const bookedCells = bookings.filter(b=>b.date===selDate&&fields.find(f=>f.id===b.fieldId)).reduce((s,b)=>s+(b.cells||8),0);
  const utilPct = totalCells>0?Math.round(bookedCells/totalCells*100):0;

  return (
    <div>
      {bookingTarget&&<BookingModal
        field={bookingTarget.field} cellStart={bookingTarget.cellStart}
        date={selDate} data={data} save={save} fire={fire} cl={cl}
        myTids={myTids} session={session}
        onClose={()=>setBookingTarget(null)}
      />}

      {}
      <div style={{background:"#fff",borderRadius:16,padding:"14px",border:"1.5px solid #e2e8f0",marginBottom:14}}>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:10}}>
          <div style={{fontWeight:800,fontSize:16,color:"#0f172a"}}>Platzbelegung</div>
          <div style={{display:"flex",gap:6}}>
            <button onClick={()=>{const d=new Date(selDate+"T12:00:00");d.setDate(d.getDate()-1);setSelDate(d.toISOString().slice(0,10));}} style={{width:32,height:32,borderRadius:9,border:"1.5px solid #e2e8f0",background:"#fff",cursor:"pointer",fontSize:18}}>‹</button>
            <input type="date" value={selDate} onChange={e=>setSelDate(e.target.value)} style={{padding:"6px 10px",fontSize:13,border:"1.5px solid #e2e8f0",borderRadius:9,outline:"none",fontFamily:"inherit"}}/>
            <button onClick={()=>{const d=new Date(selDate+"T12:00:00");d.setDate(d.getDate()+1);setSelDate(d.toISOString().slice(0,10));}} style={{width:32,height:32,borderRadius:9,border:"1.5px solid #e2e8f0",background:"#fff",cursor:"pointer",fontSize:18}}>›</button>
          </div>
        </div>
        {}
        <div style={{display:"flex",alignItems:"center",gap:10}}>
          <div style={{flex:1,height:8,borderRadius:99,background:"#e2e8f0",overflow:"hidden"}}>
            <div style={{height:"100%",borderRadius:99,background:utilPct>80?"#dc2626":utilPct>50?"#d97706":"#16a34a",width:`${utilPct}%`,transition:"width .4s ease"}}/>
          </div>
          <span style={{fontSize:12,fontWeight:800,color:utilPct>80?"#dc2626":utilPct>50?"#d97706":"#16a34a",minWidth:38}}>{utilPct}%</span>
          <span style={{fontSize:12,color:"#94a3b8"}}>belegt</span>
        </div>
      </div>

      {}
      {fields.length===0&&<div style={{textAlign:"center",padding:"32px",background:"#f8fafc",borderRadius:14,border:"1.5px dashed #e2e8f0"}}>
        <div style={{fontSize:36,marginBottom:8}}></div>
        <p style={{fontWeight:700,color:"#334155"}}>Keine Plätze konfiguriert</p>
        <p style={{fontSize:13,color:"#94a3b8",marginTop:4}}>Plätze werden vom Admin angelegt</p>
      </div>}

      {fields.map(field=>(
        <div key={field.id} style={{background:"#fff",borderRadius:16,border:"1.5px solid #e2e8f0",marginBottom:14,overflow:"hidden"}}>
          {}
          <div style={{padding:"12px 16px",borderBottom:"1px solid #f1f5f9",display:"flex",alignItems:"center",gap:10}}>
            <div style={{width:36,height:36,borderRadius:10,background:"#16a34a22",display:"flex",alignItems:"center",justifyContent:"center",fontSize:20}}></div>
            <div style={{flex:1}}>
              <div style={{fontWeight:800,fontSize:15,color:"#0f172a"}}>{field.name}</div>
              <div style={{fontSize:12,color:"#64748b"}}>{field.surface} · {dayBookings(field.id).length} Buchung{dayBookings(field.id).length!==1?"en":""}</div>
            </div>
            <button onClick={()=>setBookingTarget({field,cellStart:0})}
              style={{padding:"7px 14px",borderRadius:10,border:"none",background:t.p,color:"#fff",fontWeight:700,fontSize:13,cursor:"pointer",fontFamily:"inherit",boxShadow:`0 2px 8px ${t.p}44`}}>
              + Buchen
            </button>
          </div>
          {}
          <div style={{padding:"14px 16px"}}>
            <FieldGraphic
              field={field} bookings={bookings} date={selDate}
              onBook={(f,cell)=>setBookingTarget({field:f,cellStart:cell})}
              myName={session.name} t={t}
            />
          </div>
          {}
          {dayBookings(field.id).length>0&&<div style={{padding:"0 16px 14px",display:"flex",flexDirection:"column",gap:6}}>
            <div style={{fontSize:10,fontWeight:800,color:"#64748b",letterSpacing:.5,marginBottom:2}}>BUCHUNGEN</div>
            {dayBookings(field.id).map(b=>{
              const tm=data.teams.find(x=>x.id===b.teamId);
              const sizeLbl=b.cells>=8?"Ganzer Platz":b.cells>=4?"Halber Platz":"Viertel";
              return (
                <div key={b.id} style={{display:"flex",alignItems:"center",gap:10,background:"#f8fafc",borderRadius:11,padding:"9px 13px",border:"1px solid #e2e8f0"}}>
                  <div style={{width:10,height:10,borderRadius:"50%",background:tm?.col||"#64748b",flexShrink:0}}/>
                  <div style={{flex:1}}>
                    <div style={{fontWeight:700,fontSize:13}}>{b.teamName||b.booker}</div>
                    <div style={{fontSize:11,color:"#64748b"}}>{b.timeFrom}–{b.timeTo} · {sizeLbl}{b.note?" · "+b.note:""}</div>
                  </div>
                  <button onClick={()=>cancelBooking(b.id)} style={{width:26,height:26,borderRadius:7,background:"#fee2e2",border:"none",color:"#dc2626",cursor:"pointer",fontSize:13,fontWeight:800}}></button>
                </div>
              );
            })}
          </div>}
        </div>
      ))}
    </div>
  );
}

function Dashboard({data,session,onSave,onLogout,lang="de",setLang=()=>{}}) {

  const isAdmin=session.role==="admin"; const isHelper=session.role==="helper"; const cid=session.cid; const cl=data.clubs.find(c=>c.id===cid);
  const myTids=isAdmin?data.teams.filter(t=>t.cid===cid).map(t=>t.id):isHelper?data.teams.filter(t=>t.cid===cid).map(t=>t.id):(session.tids||[]);
  const t=TH(cl);
  const [tab,setTab]=useState("events"); const [local,setLocal]=useState(()=>JSON.parse(JSON.stringify(data)));
  const [toast,setToast]=useState(null); const [wizard,setWizard]=useState(false); const [editEv,setEditEv]=useState(null);
  const [showSeasonModal,setShowSeasonModal]=useState(false);
  const { trigger: shareTrigger,dismiss: dismissShare } = useShareTrigger(local,session,myTids);
  const [delConf,setDelConf]=useState(null); const [viewEv,setViewEv]=useState(null); const [delConfVal,setDelConfVal]=useState(null);
  const [editConf,setEditConf]=useState(null);
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
        save({...local,events:local.events.map(e=>e.id===saved.id?saved:e)});
        fire("Termin aktualisiert *");
      }
    } else {
      save({...local,events:[...local.events,...evs]});
      fire(`${evs.length>1?evs.length+" Termine":"Termin"} erstellt *`);
    }
    setWizard(false);setEditEv(null);
  }} onClose={()=>{setWizard(false);setEditEv(null);}}/>;

  const tr = (k) => { const lang = localStorage.getItem("vereinsapp_lang") || "de"; return T[lang]?.[k] ?? T.de[k] ?? k; };
  const tabs=[["events",tr("tabEvents")],!isHelper&&["players",tr("tabPlayers")],["templates",tr("tabTemplates")],!isHelper&&["helpers",tr("tabHelpers")],["jerseys",tr("tabJerseys")],["fields",tr("tabFields")],["inbox",tr("tabInbox")],["chat",tr("tabChat")],isAdmin&&["teams",tr("tabTeams")],isAdmin&&["trainers",tr("tabTrainers")],isAdmin&&["branding",tr("tabBranding")],isAdmin&&["visibility",tr("tabVisibility")],isAdmin&&["settings",tr("tabSettings")]].filter(Boolean);

  return (
    <div style={{minHeight:"100dvh",background:"#f0f4f8",paddingBottom:52}}>
      <ClubHeader cl={myClub} sub={`${isAdmin?"** Admin":isHelper?"* Helfer":"**"} ${session.name||"Admin"}`}
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
                <div style={{fontSize:12,color:"#3b82f6",marginTop:1}}>Spieler zuteilen und Saison aktivieren →</div>
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
            <div style={{width:32,height:32,borderRadius:10,background:"rgba(0,0,0,.15)",display:"flex",alignItems:"center",justifyContent:"center",color:"#fff",fontSize:18,fontWeight:700,flexShrink:0}}>›</div>
          </div>
          {up.length>0&&<><Divider label={`* KOMMENDE (${up.length})`}/>{up.map(ev=><DashRow key={ev.id} ev={ev} cl={myClub} tod={tod} onView={()=>setViewEv(ev)} onEdit={()=>ev.sid?setEditConf(ev):setEditEv(ev)} onDel={()=>{setDelConf(ev.id);setDelConfVal(ev.title);}} onReset={()=>{save({...local,events:local.events.map(e=>e.id===ev.id?{...e,votes:{}}:e)});fire("Stimmen zurückgesetzt");}} onCopyLink={()=>fire("* Einladungslink: ?club="+myClub.slug+"&join="+ev.id)}/>)}</>}
          {up.length===0&&<div style={{textAlign:"center",padding:"30px",background:"#fff",borderRadius:18,border:"1.5px dashed #e2e8f0",color:"#94a3b8"}}><Logo cl={myClub} sz={50} sx={{margin:"0 auto 12px"}}/><p style={{fontWeight:800,fontSize:15}}>Noch keine Termine</p><p style={{fontSize:13,marginTop:3}}>Klicke oben auf „Neuen Termin anlegen"</p></div>}
          {past.length>0&&<><Divider label={`VERGANGENE (${past.length})`} light/><div style={{opacity:.72}}>{past.map(ev=><DashRow key={ev.id} ev={ev} cl={myClub} tod={tod} onView={()=>setViewEv(ev)} onEdit={()=>setEditEv(ev)} onDel={()=>{setDelConf(ev.id);setDelConfVal(ev.title);}} onReset={()=>{}} onCopyLink={()=>{}}/>)}</div></>}
        </>}
        {tab==="players"    &&<PlayersTab data={local} myTids={myTids} save={save} fire={fire} cl={myClub}/>}
        {tab==="templates"  &&<TemplatesTab data={local} cid={cid} save={save} fire={fire} cl={myClub}/>}
        {tab==="helpers"    &&<HelpersTab data={local} cid={cid} myTids={myTids} session={session} save={save} fire={fire} cl={myClub}/>}
        {tab==="jerseys"    &&<JerseysTab data={local} myTids={myTids} save={save} fire={fire} cl={myClub}/>}
        {tab==="fields"     &&<FieldsTab data={local} myTids={myTids} session={session} save={save} fire={fire} cl={myClub}/>}
        {tab==="inbox"      &&<InboxTab data={local} cid={cid} save={save} fire={fire} cl={myClub}/>}
        {tab==="chat"       &&<ChatTab data={local} cid={cid} myTids={myTids} session={session} save={save} fire={fire} cl={myClub}/>}
        {tab==="teams"      &&isAdmin&&<TeamsTab data={local} cid={cid} save={save} fire={fire}/>}
        {tab==="trainers"   &&isAdmin&&<TrainersTab data={local} cid={cid} save={save} fire={fire}/>}
        {tab==="branding"   &&isAdmin&&<BrandingTab cl={myClub} onSave={c=>{save({...local,clubs:local.clubs.map(x=>x.id===c.id?c:x)});fire("Design gespeichert *");}}/>}
        {tab==="visibility" &&isAdmin&&<VisibilityTab data={local} cid={cid} save={save} fire={fire} cl={myClub}/>}
        {tab==="settings"   &&isAdmin&&<SettingsTab data={local} cid={cid} save={save} fire={fire} cl={myClub}/>}
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
          <p style={{fontSize:14,color:"#7f1d1d",fontWeight:600}}>„{delConfVal}"</p>
          {local.events.find(e=>e.id===delConf)?.sid&&<p style={{fontSize:13,color:"#b45309",marginTop:6}}> Dieser Termin ist Teil einer Terminserie.</p>}
        </div>
        <div style={{display:"flex",flexDirection:"column",gap:9}}>
          <Btn v="red" full ch="Nur diesen Termin löschen" icon="**" onClick={()=>{
            save({...local,events:local.events.filter(e=>e.id!==delConf)});
            setDelConf(null);setDelConfVal(null);fire("Termin gelöscht");
          }}/>
          {local.events.find(e=>e.id===delConf)?.sid&&<>
            <Btn v="red" full ch="Diesen + alle zukünftigen löschen" icon="**" onClick={()=>{
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
          <p style={{fontSize:14,color:"#92400e",fontWeight:600}}>„{editConf.title}"</p>
          {editConf.sid&&<p style={{fontSize:13,color:"#b45309",marginTop:6}}> Dieser Termin ist Teil einer Serie.</p>}
        </div>
        <div style={{display:"flex",flexDirection:"column",gap:9}}>
          <Btn full ch="Nur diesen Termin bearbeiten" icon="**" cl={myClub} onClick={()=>{
            setEditEv(editConf);setEditConf(null);
          }}/>
          {editConf.sid&&<Btn full ch="Diesen + alle zukünftigen bearbeiten" icon="**" cl={myClub} onClick={()=>{
            setEditEv({...editConf,_editSeries:"future"});setEditConf(null);
          }}/>}
          <Btn v="gst" full ch="Abbrechen" onClick={()=>setEditConf(null)}/>
        </div>
      </Drawer>}

      <Toast msg={toast}/>
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

  const pct = total => totalPlayers>0 ? Math.round((total/totalPlayers)*100) : 0;

  return (
    <div>
      {}
      <div style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:8,marginBottom:16}}>
        {[
          {label:"Dabei",val:yes.length,color:"#16a34a",bg:"#dcfce7",icon:"OK"},{label:"Nicht dabei",val:no.length,color:"#dc2626",bg:"#fee2e2",icon:"*"},{label:"Fehlt noch",val:missing.length,color:"#d97706",bg:"#fef3c7",icon:"*"},].map(s=>(
          <div key={s.label} style={{background:s.bg,borderRadius:14,padding:"12px 8px",textAlign:"center",border:`1.5px solid ${s.color}22`}}>
            <div style={{fontSize:20,marginBottom:2}}>{s.icon}</div>
            <div style={{fontWeight:900,fontSize:22,color:s.color,lineHeight:1}}>{s.val}</div>
            <div style={{fontSize:10,fontWeight:700,color:s.color,marginTop:3,opacity:.8}}>{s.label}</div>
          </div>
        ))}
      </div>

      {}
      <div style={{marginBottom:16}}>
        <div style={{display:"flex",justifyContent:"space-between",marginBottom:6}}>
          <span style={{fontSize:12,fontWeight:700,color:"#64748b"}}>Rücklauf</span>
          <span style={{fontSize:12,fontWeight:700,color:p}}>{voted.length}/{totalPlayers} ({pct(voted.length)}%)</span>
        </div>
        <div style={{height:8,borderRadius:99,background:"#e2e8f0",overflow:"hidden",display:"flex"}}>
          <div style={{height:"100%",background:"#16a34a",width:`${pct(yes.length)}%`,transition:"width .4s ease"}}/>
          <div style={{height:"100%",background:"#dc2626",width:`${pct(no.length)}%`,transition:"width .4s ease"}}/>
        </div>
        <div style={{display:"flex",gap:12,marginTop:5}}>
          <span style={{fontSize:11,color:"#16a34a",fontWeight:600}}>■ Dabei {pct(yes.length)}%</span>
          <span style={{fontSize:11,color:"#dc2626",fontWeight:600}}>■ Nicht dabei {pct(no.length)}%</span>
          <span style={{fontSize:11,color:"#94a3b8",fontWeight:600}}>■ Offen {pct(missing.length)}%</span>
        </div>
      </div>

      {}
      <div style={{background:"#f8fafc",borderRadius:14,padding:"12px 14px",marginBottom:16,border:"1.5px solid #e2e8f0"}}>
        <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",gap:10}}>
          <div>
            <div style={{fontWeight:700,fontSize:13,color:"#334155"}}>⏰ Abstimmungs-Frist</div>
            {dlLabel
              ? <div style={{fontSize:12,marginTop:3,fontWeight:600,color:dlPassed?"#dc2626":"#16a34a"}}>
                  {dlPassed?"* Abgelaufen:":"* Bis:"} {dlLabel}
                  {lateVoters.length>0&&<span style={{color:"#d97706",marginLeft:6}}>· {lateVoters.length} zu spät</span>}
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
                  {late&&<span style={{fontSize:11,fontWeight:700,color:"#d97706",background:"#fef3c7",borderRadius:6,padding:"2px 7px"}}>⏰ Zu spät</span>}
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
              <span style={{fontSize:12,color:"#d97706",fontWeight:600}}>⏳ Ausstehend</span>
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
          <div style={{fontSize:12,color:"#64748b",marginTop:3}}>{fmtDShort(ev.date)}{ev.time?" · "+ev.time:""}{ev.loc?" · *"+ev.loc:""}</div>
          {vc>0&&<div style={{display:"flex",gap:5,marginTop:4,flexWrap:"wrap"}}>{ev.pt==="att"?<><Tag c="#16a34a" ch={`* ${yes}`}/><Tag c="#dc2626" bg="#fee2e2" ch={`* ${no}`}/></>:<Tag c="#2563eb" ch={`* ${vc} Einträge`}/>}</div>}
          {ev.deadline&&<div style={{marginTop:4}}><span style={{fontSize:11,fontWeight:700,color:dlPassed?"#dc2626":"#d97706",background:dlPassed?"#fee2e2":"#fef3c7",borderRadius:6,padding:"2px 8px"}}>⏰ {dlPassed?"Frist abgelaufen":"Frist: "}{!dlPassed&&ev.deadline.date}</span></div>}
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
            <p style={{fontSize:13,color:"#64748b"}}>Bitte lies diesen Hinweis sorgfältig durch</p>
          </div>

          <div style={{background:"#fff7ed",borderRadius:14,padding:"16px",border:"1.5px solid #fed7aa",marginBottom:14}}>
            <p style={{fontSize:13,fontWeight:800,color:"#c2410c",marginBottom:10}}>Datenschutz & Eigenverantwortung</p>
            <div style={{fontSize:13,color:"#9a3412",lineHeight:1.75,display:"flex",flexDirection:"column",gap:7}}>
              <p> Das Profilbild wird <strong>auf eigene Gefahr</strong> hochgeladen und gespeichert.</p>
              <p> Diese App wird von einem ehrenamtlichen Vereinsadmin betrieben — es handelt sich <strong>nicht um einen kommerziellen Dienst</strong>.</p>
              <p> Der Vereinsadmin sowie der Betreiber dieser App übernehmen <strong>keinerlei Haftung</strong> für Verlust,Diebstahl,Missbrauch oder unbefugten Zugriff auf hochgeladene Bilder oder gespeicherte Daten.</p>
              <p> Du kannst dein Bild jederzeit selbst entfernen. Eine vollständige Löschung aus allen Systemen kann <strong>nicht garantiert</strong> werden.</p>
              <p> Lade <strong>keine Bilder von Minderjährigen</strong> hoch,es sei denn,du bist erziehungsberechtigt und hast ausdrücklich zugestimmt.</p>
              <p> Mit dem Upload bestätigst du,dass du <strong>auf eigenes Risiko</strong> handelst und alle Bedingungen akzeptierst.</p>
            </div>
          </div>

          <div style={{background:"#f8fafc",borderRadius:12,padding:"12px 14px",border:"1px solid #e2e8f0",marginBottom:18,fontSize:11,color:"#64748b",lineHeight:1.7}}>
            <strong>Haftungsausschluss (§ 8 TMG):</strong> Der Vereinsadmin haftet nicht für Schäden durch die Nutzung dieser Funktion — einschließlich Datenverlust,unberechtigte Zugriffe Dritter oder Weitergabe von Daten bei einem Sicherheitsvorfall. Die Nutzung erfolgt freiwillig und vollständig auf eigene Verantwortung der hochladenden Person.
          </div>

          <div style={{display:"flex",flexDirection:"column",gap:10}}>
            <button onClick={onAccept}
              style={{width:"100%",padding:"14px",borderRadius:14,border:"none",background:"#16a34a",color:"#fff",fontWeight:800,fontSize:15,cursor:"pointer",fontFamily:"inherit",boxShadow:"0 4px 14px rgba(22,163,74,.35)"}}>
               Verstanden — Bild hochladen
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
    if (f.size > 3*1024*1024) { alert("Bild zu groß — bitte max. 3 MB."); return; }
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
      <input ref={fileRef} type="file" accept="image
function CarpoolWizard({ev,user,onSave,onClose,cl}) {
  return <div style={{padding:16,textAlign:"center",color:"#64748b"}}><p>Fahrgemeinschaft-Funktion in Entwicklung.</p><button onClick={onClose} style={{marginTop:12,padding:"10px 20px",borderRadius:10,border:"none",background:TH(cl).p,color:"#fff",fontWeight:700,cursor:"pointer",fontFamily:"inherit"}}>Schliessen</button></div>;
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
      <div style={{display:"flex",gap:6,marginBottom:12,overflowX:"auto",scrollbarWidth:"none"}}>
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
        <p style={{fontSize:13,color:"#64748b"}}>Teams: {(setup.clubs||[]).length || "–"}</p>
      </div>}
      {stab==="plan"&&<div style={{background:"#f8fafc",borderRadius:14,padding:"14px"}}>
        <p style={{fontWeight:700,color:"#334155",marginBottom:8}}>Spielplan</p>
        {(ev.schedule||[]).length===0
          ? <p style={{fontSize:13,color:"#94a3b8"}}>Noch kein Spielplan generiert.</p>
          : (ev.schedule||[]).map((g,i)=>(
            <div key={i} style={{padding:"8px 0",borderBottom:"1px solid #e2e8f0",fontSize:13}}>
              <span style={{color:"#64748b"}}>Feld {g.field} · {g.time}</span>
              <span style={{marginLeft:10,fontWeight:700}}>{g.a} vs {g.b}</span>
            </div>
          ))
        }
      </div>}
      {stab==="timer"&&<CompactTimer ev={ev} cl={cl}/>}
      {stab==="split"&&<div style={{background:"#f8fafc",borderRadius:14,padding:"14px"}}>
        <p style={{fontWeight:700,color:"#334155",marginBottom:8}}>Team-Aufteilung</p>
        <p style={{fontSize:13,color:"#64748b"}}>Spieler zufällig auf Teams aufteilen.</p>
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
            <span style={{fontSize:13,color:"#64748b",fontWeight:600}}>{fmtD(ev.date)}{ev.time?" · "+ev.time:""}</span>
            {ev.loc&&<span style={{fontSize:12,color:"#94a3b8"}}> {ev.loc}</span>}
          </div>
          {status&&<div style={{marginTop:6,display:"flex",alignItems:"center",gap:8,flexWrap:"wrap"}}>
            <span style={{display:"inline-flex",alignItems:"center",gap:4,background:status.bg,color:status.color,borderRadius:8,padding:"3px 9px",fontSize:12,fontWeight:700}}>{status.icon} {status.label}</span>
            {!expanded&&yesN>0&&<Tag c={eT.col} bg={eT.bg} ch={`${yesN} dabei`} sm/>}
          </div>}
        </div>
        <div style={{color:"#cbd5e1",fontSize:22,transform:expanded?"rotate(180deg)":"none",transition:"transform .2s",flexShrink:0}}>⌄</div>
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
      if(pt==="att"){if(typeof nv[user]==="object"&&nv[user]?.val===val)delete nv[user];else if(nv[user]===val)delete nv[user];else nv[user]={val,ts};}
      else nv[user]=val;
      return{...e,votes:nv};
    })};
    onSave(next);fire("Gespeichert *");
  };

  return (
    <div style={{minHeight:"100dvh",background:"#f0f4f8",paddingBottom:52}}>
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
               <strong>Datenschutz:</strong> Dein Profilbild wird verschlüsselt auf dem Server gespeichert und ist nur für dich sichtbar. Du kannst es jederzeit löschen.
            </div>
            <div style={{display:"flex",flexDirection:"column",gap:9}}>
              <button onClick={()=>setShowProfile(false)} style={{width:"100%",padding:"13px",borderRadius:13,border:"1.5px solid #e2e8f0",background:"#fff",color:"#475569",fontWeight:700,fontSize:14,cursor:"pointer",fontFamily:"inherit"}}>Schließen</button>
              <button onClick={()=>{setShowProfile(false);onLogout();}} style={{width:"100%",padding:"13px",borderRadius:13,border:"none",background:"#fee2e2",color:"#dc2626",fontWeight:700,fontSize:14,cursor:"pointer",fontFamily:"inherit"}}> Team wechseln / Abmelden</button>
            </div>
          </div>
        </div>
      )}

      <div style={{maxWidth:520,margin:"0 auto",padding:"16px 14px"}}>
        {up.length>0&&<>
          <Divider label="KOMMENDE TERMINE"/>
          {up.map((ev,i)=><div key={ev.id} className="up" style={{marginBottom:10,animationDelay:`${i*.05}s`}}><EvCard ev={ev} user={user} expanded={exp===ev.id} onToggle={()=>setExp(exp===ev.id?null:ev.id)} onVote={vote} cl={cl} players={data.players?.[tid]||[]} role="user"/></div>)}
        </>}
        {up.length===0&&<div style={{textAlign:"center",padding:"52px 20px"}}><Logo cl={cl} sz={64} sx={{margin:"0 auto 16px"}}/><p style={{fontWeight:800,fontSize:18,color:"#334155"}}>Keine anstehenden Termine</p><p style={{color:"#94a3b8",fontSize:14,marginTop:6}}>Der Trainer hat noch keine Termine angelegt.</p><div style={{marginTop:20}}><AdBanner/></div></div>}
        {past.length>0&&<>
          <button onClick={()=>setSP(s=>!s)} style={{display:"flex",alignItems:"center",gap:10,width:"100%",background:"none",border:"none",cursor:"pointer",margin:"18px 0 10px",padding:"4px 0"}}>
            <div style={{flex:1,height:1,background:"#e2e8f0"}}/><span style={{fontSize:11,fontWeight:800,color:"#94a3b8",whiteSpace:"nowrap"}}>{showPast?"▴":"▾"} VERGANGENE ({past.length})</span><div style={{flex:1,height:1,background:"#e2e8f0"}}/>
          </button>
          {showPast&&past.map(ev=><div key={ev.id} style={{marginBottom:10}}><EvCard ev={ev} user={user} expanded={exp===ev.id} onToggle={()=>setExp(exp===ev.id?null:ev.id)} onVote={vote} cl={cl} players={data.players?.[tid]||[]} role="user"/></div>)}
        </>}
      </div>
      <Toast msg={toast}/>
      {shareTrigger&&<ShareBanner cl={myClub} session={session} trigger={shareTrigger} onDismiss={()=>dismissShare(shareTrigger)}/>}
    </div>
  );
}

export default function App() {
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
  const [saveStatus,setSaveStatus] = useState(null); // null | "saving" | "saved" | "local"
  const syncRef  = useRef(null);
  const saveTimer= useRef(null);

  useEffect(()=>{
    (async()=>{
      let d=null;
      try { d = await sb.get(); if(d?._v < 10) d=null; } catch {}
      if(!d) { d=seed(); try { await sb.set(d); } catch {} }
      setData(d);
      const s=sess.get();
      if(s){ setCid(s.cid); setSess(s); setScr(s.role==="user"?"user":"dash"); return; }
      setScr("dir");
    })();
    syncRef.current=setInterval(async()=>{
      try {
        const r=await sb.get();
        if(r?._v>=12) setData(p=>{if(JSON.stringify(p)===JSON.stringify(r))return p;return r;});
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
    const s={...payload,role,cid}; sess.set(s); setSess(s);
    setScr(role==="user"?"user":"dash");
  };
  const logout=()=>{ sess.del(); setSess(null); setScr(cid?"role":"dir"); };

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
        <p style={{color:"#86efac",fontWeight:800,fontSize:17}}>Vereins-App lädt…</p>
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
          {saveStatus==="saving"&&"Speichert…"}
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

      {screen==="dir"   &&<Directory data={data} lang={lang} setLang={setLang} onPick={id=>{
          if(id==="__demo__"){setCid("sus");setScr("role");return;}
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
      {screen==="flow"  &&activeCl&&<UserFlow cl={activeCl} teams={clTeams} players={data.players} playerProfiles={data.playerProfiles||[]} onDone={(tid,user)=>login("user",{tid,user})} onBack={()=>setScr("role")}/>}
      {screen==="tlogin"&&activeCl&&<TrainerLogin cl={activeCl} trainers={data.trainers.filter(t=>t.cid===cid)} teams={clTeams} onLogin={tr=>login("trainer",tr)} onBack={()=>setScr("role")}/>}
      {screen==="hlogin"&&activeCl&&<HelperLogin cl={activeCl} helpers={data.helpers||[]} onLogin={h=>login("helper",{...h,cid})} onBack={()=>setScr("role")}/>}
      {screen==="alogin"&&activeCl&&<AdminLogin cl={activeCl} onLogin={a=>login("admin",{...a,cid})} onBack={()=>setScr("role")}/>}
      {screen==="user"  &&session&&activeCl&&<UserHome data={data} session={session} onSave={save} onLogout={logout} lang={lang}/>}
      {screen==="dash"  &&session&&activeCl&&<Dashboard data={data} session={session} onSave={save} onLogout={logout} lang={lang} setLang={setLang}/>}
    </div>
  );
}
