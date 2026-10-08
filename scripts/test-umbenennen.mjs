// E2E-Test: Name geändert, obwohl es schon Zusagen gab.
// Gemeldeter Fall: Der alte Name bleibt im Termin stehen und lässt sich nicht
// mehr rausnehmen – weil die Eltern mit der alten Anmeldung weiter darunter
// abstimmen. Drei Dinge müssen stimmen:
//   1. Beim Umbenennen zieht ALLES mit – auch die Aufstellung (Linien) und
//      eine festgehaltene Spielchen-Einteilung.
//   2. Der alte Name bleibt am Profil vermerkt, und eine Anmeldung mit dem
//      alten Namen wird beim Laden still auf den neuen gezogen.
//   3. Bleibt doch eine fremde Antwort stehen, kann der Trainer sie im Block
//      „NICHT IM KADER“ zuordnen oder entfernen.
// Aufruf: npm run build && node scripts/test-umbenennen.mjs
import { chromium } from "playwright-core";
import http from "http"; import fs from "fs"; import path from "path";
const dist = path.resolve("dist");
const srv = http.createServer((req,res)=>{ let p=path.join(dist,req.url.split("?")[0]); if(!fs.existsSync(p)||fs.statSync(p).isDirectory()) p=path.join(dist,"index.html"); res.setHeader("content-type",{".html":"text/html",".js":"text/javascript",".css":"text/css"}[path.extname(p)]||"text/plain"); res.end(fs.readFileSync(p)); }).listen(4327);
const exe=process.env.PLAYWRIGHT_CHROMIUM||"/opt/pw-browsers/chromium-1194/chrome-linux/chrome";
const browser = await chromium.launch({ executablePath:exe, args:["--no-sandbox"] });
const page = await browser.newPage({ viewport:{ width:390, height:900 } });
page.setDefaultTimeout(10000);
const errors=[]; const fails=[];
page.on("pageerror", e=>errors.push(e.message));
page.on("dialog", d=>d.accept());
const fail=m=>{ fails.push(m); console.log("FEHLGESCHLAGEN:", m); };
const ok=m=>console.log("OK:", m);
const body=()=>page.evaluate(()=>document.body.innerText);
const kurz=t=>String(t).slice(0,300).replace(/\n/g," | ");
// Nur das offene Fenster lesen - body() enthaelt auch die Seite dahinter.
const fenster=()=>page.evaluate(()=>{
  const fx=[...document.querySelectorAll("div")].filter(d=>getComputedStyle(d).position==="fixed"&&(d.innerText||"").length>200);
  const f=fx.find(d=>/Rückmeldungen|Anwesenheit abhaken/.test(d.innerText||""));
  return f?(f.innerText||""):""; });
const klick=(re)=>page.evaluate(r=>{
  const b=[...document.querySelectorAll("button")].find(x=>new RegExp(r).test((x.innerText||"").replace(/\s+/g," ").trim()));
  if(!b||b.disabled) return false; b.click(); return true; }, re instanceof RegExp?re.source:re);
const dismiss=async()=>{ for(let k=0;k<12;k++){ const done=await page.evaluate(()=>{
  const fx=[...document.querySelectorAll("div")].filter(d=>getComputedStyle(d).position==="fixed"&&d.querySelector("button")&&d.innerText.length>30);
  for(const f of fx){ const b=[...f.querySelectorAll("button")].find(x=>/geht|Los|Verstanden|Alles klar|Fertig|Jetzt nicht|Weiter →|Überspringen|Start/i.test(x.innerText)); if(b){ b.click(); return false; } }
  return true; }); await page.waitForTimeout(400); if(done) break; } };

await page.addInitScript(()=>{
  if(!localStorage.getItem("vereinsapp_config")) localStorage.setItem("vereinsapp_config", JSON.stringify({url:"https://127.0.0.1:1/x", key:"test"}));
  if(localStorage.getItem("va_simple")===null)  localStorage.setItem("va_simple","0");
  if(localStorage.getItem("va_tsimple")===null) localStorage.setItem("va_tsimple","0");
});
await page.goto("http://127.0.0.1:4327/", { waitUntil:"networkidle" }); await page.waitForTimeout(2500);
await page.evaluate(()=>{ sessionStorage.setItem("vereinsapp_v12_session", JSON.stringify({role:"trainer",cid:"demo",tids:["demo_f1"],name:"Demo Trainer",id:"demo_tr1"})); });
await page.reload({waitUntil:"networkidle"}); await page.waitForTimeout(2600); await dismiss();
await page.evaluate(()=>{ const b=[...document.querySelectorAll("button")].find(x=>/Bin dabei/.test(x.innerText)); b&&b.click(); });
await page.waitForTimeout(1400);

// Ein Kind steht überall drin: Zusage, Anwesenheit, Aufstellung (Linien) und
// in einer festgehaltenen Spielchen-Einteilung.
const setup = await page.evaluate(()=>{
  const d=JSON.parse(localStorage.getItem("vereinsapp_v14")||"null");
  const p=v=>String(v).padStart(2,"0");
  const tg=n=>{ const x=new Date(Date.now()+n*86400000); return `${x.getFullYear()}-${p(x.getMonth()+1)}-${p(x.getDate())}`; };
  const prof=(d.playerProfiles||[]).filter(q=>q.mainTid==="demo_f1"&&!q.archived);
  const wer=prof[0], andere=prof[1];
  if(!wer||!andere) return null;
  const ev=(d.events||[]).filter(e=>e.cid==="demo"&&e.tid==="demo_f1")[0];
  const ts=new Date().toISOString();
  Object.assign(ev,{ type:"training", date:tg(2), time:"17:30", endTime:"19:00", title:"Training", loc:"Platz",
    deadline:null, extraPolls:[], duties:[],
    votes:{ [wer.name]:{val:"yes",ts,role:"player"}, [andere.name]:{val:"yes",ts,role:"player"} },
    present:{ [wer.name]:true },
    lineup:{ T:[], A:[wer.name, andere.name], M:[], S:[], E:[] },
    spielFest:{ groesse:6, manuell:true, paarungen:[{ titel:"Leistung", grpId:"g1",
      a:{ leib:"rot",  namen:[wer.name],    linien:{T:[],A:[wer.name],M:[],S:[]} },
      b:{ leib:"blau", namen:[andere.name], linien:{T:[],A:[andere.name],M:[],S:[]} },
      bank:[], torwart:false }] } });
  (d.events||[]).filter(e=>e.cid==="demo"&&e.id!==ev.id).forEach(e=>{ e.date=tg(14); });
  localStorage.setItem("vereinsapp_v14", JSON.stringify(d));
  return { evId:ev.id, pid:wer.id, alt:wer.name, andere:andere.name };
});
if(setup) ok(`Ausgangslage: „${setup.alt}“ steht in Zusage, Anwesenheit, Aufstellung und Spielchen`);
else { fail("Testdaten nicht gesetzt"); process.exit(1); }
const NEU = "Umbenannt Test";
// Erst neu laden: sonst haelt die App noch den alten Stand im Speicher und
// schreibt ihn beim naechsten Speichern ueber die Testdaten.
await page.reload({waitUntil:"networkidle"}); await page.waitForTimeout(2800); await dismiss();

const stand=()=>page.evaluate(i=>{ const d=JSON.parse(localStorage.getItem("vereinsapp_v14")||"null");
  const ev=(d.events||[]).find(e=>e.id===i);
  return { votes:Object.keys(ev.votes||{}), present:Object.keys(ev.present||{}),
           lineupA:(ev.lineup&&ev.lineup.A)||[],
           spielA:((ev.spielFest&&ev.spielFest.paarungen&&ev.spielFest.paarungen[0]&&ev.spielFest.paarungen[0].a.namen))||[],
           spielLinien:((ev.spielFest&&ev.spielFest.paarungen&&ev.spielFest.paarungen[0]&&ev.spielFest.paarungen[0].a.linien&&ev.spielFest.paarungen[0].a.linien.A))||[] }; }, setup.evId);
const profil=()=>page.evaluate(id=>{ const d=JSON.parse(localStorage.getItem("vereinsapp_v14")||"null");
  const p=(d.playerProfiles||[]).find(x=>x.id===id); return p?{name:p.name, prevNames:p.prevNames||[]}:null; }, setup.pid);

// ===== 1) Umbenennen – alles zieht mit =====
await page.evaluate(([id,neu])=>{
  // Umbenennen über denselben Weg wie die Oberfläche: savePlayer
  const d=JSON.parse(localStorage.getItem("vereinsapp_v14")||"null");
  const p=(d.playerProfiles||[]).find(x=>x.id===id);
  window.__umbenennen={id, alt:p.name, neu};
}, [setup.pid, NEU]);
// Über die Kaderliste: Team → Spieler → Profil bearbeiten → Name ändern
await page.evaluate(()=>{ const b=[...document.querySelectorAll("button")].find(x=>(x.innerText||"").trim()==="Team"); b&&b.click(); });
await page.waitForTimeout(1500); await dismiss();
await klick("^Spieler$"); await page.waitForTimeout(1400);
{ const auf=await page.evaluate(n=>{
    const karten=[...document.querySelectorAll("div")].filter(d=>(d.innerText||"").includes(n)&&(d.innerText||"").length<400);
    for(const k of karten.reverse()){
      const b=[...k.querySelectorAll("button")].find(x=>(x.innerText||"").trim()==="✏️");
      if(b){ b.click(); return true; } }
    return false; }, setup.alt);
  if(auf) ok("Das Spielerprofil lässt sich öffnen"); else fail("Kein Bearbeiten-Knopf an der Spielerkarte"); }
await page.waitForTimeout(1100);
{ const gesetzt=await page.evaluate(([alt,neu])=>{
    const i=[...document.querySelectorAll("input")].find(x=>x.value===alt);
    if(!i) return false;
    const set=Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype,"value").set;
    set.call(i,neu); i.dispatchEvent(new Event("input",{bubbles:true})); return true; }, [setup.alt,NEU]);
  if(gesetzt) ok("Der Name lässt sich ändern"); else fail("Kein Namensfeld mit dem alten Namen gefunden"); }
await page.waitForTimeout(400);
if(await klick("Spielerprofil speichern")) ok("Gespeichert"); else fail("Kein Speichern-Knopf");
await page.waitForTimeout(1600);
{ const s=await stand();
  if(s.votes.includes(NEU)&&!s.votes.includes(setup.alt)) ok("Die Zusage läuft jetzt auf den neuen Namen");
  else fail("Zusage nicht mitgezogen: "+JSON.stringify(s.votes));
  if(s.present.includes(NEU)) ok("Die Anwesenheit ebenso"); else fail("Anwesenheit nicht mitgezogen: "+JSON.stringify(s.present));
  if(s.lineupA.includes(NEU)&&!s.lineupA.includes(setup.alt)) ok("Und die Aufstellung – genau die Lücke, die den alten Namen stehen ließ");
  else fail("Aufstellung nicht mitgezogen: "+JSON.stringify(s.lineupA));
  if(s.spielA.includes(NEU)&&!s.spielA.includes(setup.alt)) ok("Auch die festgehaltene Spielchen-Einteilung");
  else fail("Spielchen nicht mitgezogen: "+JSON.stringify(s.spielA));
  if(s.spielLinien.includes(NEU)) ok("Samt ihrer Linien"); else fail("Linien im Spielchen nicht mitgezogen: "+JSON.stringify(s.spielLinien)); }
{ const p=await profil();
  if(p&&p.name===NEU) ok("Das Profil trägt den neuen Namen"); else fail("Profilname falsch: "+JSON.stringify(p));
  if(p&&p.prevNames.includes(setup.alt)) ok(`Der alte Name bleibt vermerkt (${setup.alt})`);
  else fail("Alter Name nicht vermerkt: "+JSON.stringify(p&&p.prevNames)); }

// ===== 2) Alte Anmeldung der Eltern wird mitgezogen =====
await page.evaluate(a=>{ sessionStorage.setItem("vereinsapp_v12_session",
  JSON.stringify({role:"user",cid:"demo",tid:"demo_f1",user:a,name:a})); }, setup.alt);
await page.reload({waitUntil:"networkidle"}); await page.waitForTimeout(2800); await dismiss();
{ const s=await page.evaluate(()=>{ try{ return JSON.parse(sessionStorage.getItem("vereinsapp_v12_session")||"null"); }catch{ return null; } });
  if(s&&s.user===NEU) ok("Die alte Anmeldung wird beim Laden auf den neuen Namen gezogen");
  else fail("Anmeldung bleibt auf dem alten Namen: "+JSON.stringify(s&&s.user));
  const b=await body();
  if(b.includes(String(NEU).split(" ")[0])) ok("Die Eltern sehen den richtigen Namen");
  else fail("Falscher Name in der Eltern-Ansicht: "+kurz(b)); }
// Und eine Zusage landet jetzt unter dem richtigen Namen
{ await klick("^NEIN$"); await page.waitForTimeout(1200);
  const s=await stand();
  if(!s.votes.includes(setup.alt)) ok("Eine neue Antwort legt den alten Namen nicht wieder an");
  else fail("Der alte Name ist wieder da: "+JSON.stringify(s.votes)); }

// ===== 3) Fremde Antwort aufräumen =====
await page.evaluate(([i,alt])=>{ const d=JSON.parse(localStorage.getItem("vereinsapp_v14")||"null");
  const ev=(d.events||[]).find(e=>e.id===i);
  ev.votes={...(ev.votes||{}), [alt]:{val:"yes",ts:new Date().toISOString(),role:"player"}};
  localStorage.setItem("vereinsapp_v14", JSON.stringify(d));
  sessionStorage.setItem("vereinsapp_v12_session", JSON.stringify({role:"trainer",cid:"demo",tids:["demo_f1"],name:"Demo Trainer",id:"demo_tr1"}));
}, [setup.evId, "Fremder Name"]);
await page.reload({waitUntil:"networkidle"}); await page.waitForTimeout(2800); await dismiss();
const oeffneTermin=async()=>{
  for(let i=0;i<3;i++){
    await page.evaluate(()=>{ const b=[...document.querySelectorAll("button")].find(x=>/^(Ansehen|✅ Anwesenheit)$/.test((x.innerText||"").trim())); b&&b.click(); });
    await page.waitForTimeout(1600);
    if(await page.evaluate(()=>/Anwesenheit abhaken|Rückmeldungen/.test(document.body.innerText))) return true;
    await dismiss();
  }
  return false;
};
if(await oeffneTermin()) ok("Der Termin ist offen"); else fail("Termin lässt sich nicht öffnen: "+kurz(await body()));
let b=await fenster();
if(/Gehört zu keinem Kind im Kader/.test(b)) ok("Die übrig gebliebene Antwort ist in der Abhak-Liste als solche erkannt");
else fail("Nicht als übrig erkannt: "+String(b).slice(-420).replace(/\n/g," | "));
{ const knoepfe=await page.evaluate(()=>[...document.querySelectorAll("button")].map(x=>(x.innerText||"").trim()));
  if(knoepfe.includes("✕ Entfernen")&&knoepfe.includes("Zuordnen")) ok("Mit „Zuordnen“ und „✕ Entfernen“");
  else fail("Keine Aufräum-Knöpfe: "+JSON.stringify(knoepfe.filter(x=>x.length<14).slice(0,14))); }
// Zuordnen: der fremde Name wird dem umbenannten Kind zugeschlagen
{ const gewaehlt=await page.evaluate(n=>{
    const s=[...document.querySelectorAll("select")].find(x=>[...x.options].some(o=>o.value===n));
    if(!s) return false;
    const set=Object.getOwnPropertyDescriptor(window.HTMLSelectElement.prototype,"value").set;
    set.call(s,n); s.dispatchEvent(new Event("change",{bubbles:true})); return true; }, NEU);
  if(gewaehlt) ok("Das richtige Kind lässt sich auswählen"); else fail("Keine Auswahlliste mit dem Kader");
  await page.waitForTimeout(500);
  if(await klick("^Zuordnen$")) ok("Und zuordnen"); else fail("Zuordnen nicht klickbar");
  await page.waitForTimeout(1500);
  const s=await stand();
  if(!s.votes.includes("Fremder Name")) ok("Der fremde Name ist weg");
  else fail("Fremder Name bleibt: "+JSON.stringify(s.votes));
  const p=await profil();
  if(p&&p.prevNames.includes("Fremder Name")) ok("Und ist als früherer Name vermerkt – damit die Eltern künftig richtig abstimmen");
  else fail("Nicht als früherer Name vermerkt: "+JSON.stringify(p&&p.prevNames)); }
// Entfernen
{ await page.evaluate(i=>{ const d=JSON.parse(localStorage.getItem("vereinsapp_v14")||"null");
    const ev=(d.events||[]).find(e=>e.id===i);
    ev.votes={...(ev.votes||{}), "Noch Fremder":{val:"no",ts:new Date().toISOString(),role:"player"}};
    localStorage.setItem("vereinsapp_v14", JSON.stringify(d)); }, setup.evId);
  await page.reload({waitUntil:"networkidle"}); await page.waitForTimeout(2800); await dismiss();
  await oeffneTermin();
  if(await klick("^✕ Entfernen$")) ok("Entfernen ist klickbar"); else fail("Entfernen nicht klickbar");
  await page.waitForTimeout(1500);
  const s=await stand();
  if(!s.votes.includes("Noch Fremder")) ok("Die Antwort ist entfernt");
  else fail("Antwort bleibt stehen: "+JSON.stringify(s.votes)); }

if(errors.length){ console.log("JS-FEHLER:"); [...new Set(errors)].forEach(e=>console.log(" -",e.slice(0,150))); }
console.log(errors.length||fails.length?`ERGEBNIS: ${fails.length} Fehlschläge, ${errors.length} JS-Fehler`:"ERGEBNIS: ALLES OK");
await browser.close(); srv.close();
process.exit(errors.length||fails.length?1:0);
