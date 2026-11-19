// E2E-Test: Beim Bearbeiten eines Termins dürfen keine Antworten verloren gehen.
// Gemeldet: „Beim Ändern der Bezeichnung am Samstag sind die Anmeldungen
// teilweise rausgeflogen. Der Ort des Spieltags hatte sich geändert."
// Ursache: Das Bearbeiten-Fenster hält den Stand von dem Moment, in dem es
// geöffnet wurde. Beim Speichern wurde der Termin damit KOMPLETT überschrieben –
// samt Stimmen. Wer in der Zwischenzeit geantwortet hatte, fiel raus.
//   1. Titel ändern ändert den Titel.
//   2. Alle Antworten bleiben erhalten.
//   3. Anwesenheit, Aufstellung und die Antworten der Zusatzliste ebenfalls.
//   4. Bei einer Serie bekommt nicht jeder Termin die Anwesenheit des einen.
// Dass auch eine WÄHREND des Bearbeitens eingehende Antwort überlebt, prüfen
// die Unit-Tests zu terminUebernehmen (src/logic.test.js) - dafür müssten hier
// zwei Geräte gleichzeitig tippen.
// Aufruf: npm run build && node scripts/test-bearbeiten-stimmen.mjs
import { chromium } from "playwright-core";
import http from "http"; import fs from "fs"; import path from "path";
const dist = path.resolve("dist");
const srv = http.createServer((req,res)=>{ let p=path.join(dist,req.url.split("?")[0]); if(!fs.existsSync(p)||fs.statSync(p).isDirectory()) p=path.join(dist,"index.html"); res.setHeader("content-type",{".html":"text/html",".js":"text/javascript",".css":"text/css"}[path.extname(p)]||"text/plain"); res.end(fs.readFileSync(p)); }).listen(4357);
const exe=(()=>{ if(process.env.PLAYWRIGHT_CHROMIUM) return process.env.PLAYWRIGHT_CHROMIUM;
  const basis=process.env.PLAYWRIGHT_BROWSERS_PATH||"/opt/pw-browsers";
  const kand=[`${basis}/chromium`, ...fs.existsSync(basis)
    ? fs.readdirSync(basis).filter(d=>d.startsWith("chromium-")).sort().reverse()
        .flatMap(d=>["chrome-linux64/chrome","chrome-linux/chrome"].map(x=>`${basis}/${d}/${x}`))
    : []];
  for(const p of kand){ try{ if(fs.existsSync(p)) return p; }catch{} }
  return `${basis}/chromium`; })();
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
const dismiss=async()=>{ for(let k=0;k<12;k++){ const done=await page.evaluate(()=>{
  const fx=[...document.querySelectorAll("div")].filter(d=>getComputedStyle(d).position==="fixed"&&d.querySelector("button")&&d.innerText.length>30);
  for(const f of fx){ const b=[...f.querySelectorAll("button")].find(x=>/geht|Los|Verstanden|Alles klar|Fertig|Jetzt nicht|Weiter →|Überspringen|Start/i.test(x.innerText)); if(b){ b.click(); return false; } }
  return true; }); await page.waitForTimeout(400); if(done) break; } };
const klick=(re)=>page.evaluate(r=>{
  const b=[...document.querySelectorAll("button")].find(x=>new RegExp(r).test((x.innerText||"").replace(/\s+/g," ").trim()));
  if(!b||b.disabled) return false; b.click(); return true; }, re instanceof RegExp?re.source:re);
const termin=(id)=>page.evaluate(i=>{ const d=JSON.parse(localStorage.getItem("vereinsapp_v14")||"null");
  const e=(d.events||[]).find(x=>x.id===i); if(!e) return null;
  return { titel:e.title, loc:e.loc, stimmen:Object.keys(e.votes||{}).sort(),
    present:Object.keys(e.present||{}).sort(), auf:(e.lineup&&e.lineup.A||[]).length,
    listen:(e.extraPolls||[]).map(p=>({id:p.id,n:Object.keys(p.votes||{}).length})) }; }, id);

await page.addInitScript(()=>{
  if(!localStorage.getItem("vereinsapp_config")) localStorage.setItem("vereinsapp_config", JSON.stringify({url:"https://127.0.0.1:1/x", key:"test"}));
  if(localStorage.getItem("va_simple")===null)  localStorage.setItem("va_simple","0");
  if(localStorage.getItem("va_tsimple")===null) localStorage.setItem("va_tsimple","0");
});
await page.goto("http://127.0.0.1:4357/", { waitUntil:"networkidle" }); await page.waitForTimeout(2500);
await page.evaluate(()=>{ sessionStorage.setItem("vereinsapp_v12_session", JSON.stringify({role:"trainer",cid:"demo",tids:["demo_f1"],name:"Demo Trainer",id:"demo_tr1"})); });
await page.reload({waitUntil:"networkidle"}); await page.waitForTimeout(2600); await dismiss();
await page.evaluate(()=>{ const b=[...document.querySelectorAll("button")].find(x=>/Bin dabei/.test(x.innerText)); b&&b.click(); });
await page.waitForTimeout(1400);

// Ein Spiel mit Zusagen, Anwesenheit, Aufstellung und einer Zusatzliste.
const setup = await page.evaluate(()=>{
  const d=JSON.parse(localStorage.getItem("vereinsapp_v14")||"null");
  const z=x=>String(x).padStart(2,"0");
  const tag=n=>{ const x=new Date(); x.setHours(12,0,0,0); x.setDate(x.getDate()+n);
    return `${x.getFullYear()}-${z(x.getMonth()+1)}-${z(x.getDate())}`; };
  const vorlage=(d.events||[]).filter(e=>e.cid==="demo"&&e.tid==="demo_f1")[0];
  const kader=(d.playerProfiles||[]).filter(p=>p.mainTid==="demo_f1"&&!p.archived).map(p=>p.name);
  const ts=new Date().toISOString();
  const ev={...vorlage, id:"ev_edit", tid:"demo_f1", cid:"demo", title:"Spieltag ALT", type:"heimspiel",
    pt:"att", date:tag(3), time:"11:00", endTime:"12:30", loc:"Alter Platz", deadline:null,
    votes:Object.fromEntries(kader.slice(0,4).map(n=>[n,{val:"yes",ts,role:"player"}])),
    present:{[kader[0]]:true}, lineup:{T:[],A:[kader[0],kader[1]],M:[],S:[],E:[]}, lineups:null,
    extraPolls:[{id:"liste1",title:"Kuchen",selType:"multi",items:["Blech","Muffins"],
      votes:{[kader[0]]:["Blech"]}}], duties:[], sollPlayers:0 };
  // Serie mit zwei Terminen, einer mit Anwesenheit
  const s1={...ev, id:"ser_a", title:"Serie", type:"training", date:tag(5), sid:"ser_x", sidx:0,
    votes:{}, present:{[kader[2]]:true}, lineup:null, extraPolls:[]};
  const s2={...ev, id:"ser_b", title:"Serie", type:"training", date:tag(12), sid:"ser_x", sidx:1,
    votes:{}, present:{}, lineup:null, extraPolls:[]};
  d.events=[...(d.events||[]).filter(e=>e.cid!=="demo"), ev, s1, s2];
  localStorage.setItem("vereinsapp_v14", JSON.stringify(d));
  return { kader };
});
if(setup) ok(`Ausgangslage: Spieltag mit 4 Zusagen, Anwesenheit, Aufstellung und Kuchenliste`);
else { fail("Testdaten nicht gesetzt"); process.exit(1); }
await page.reload({waitUntil:"networkidle"}); await page.waitForTimeout(2900); await dismiss();
const vorher=await termin("ev_edit");
if(vorher&&vorher.stimmen.length===4) ok("Vier Zusagen stehen im Termin");
else { fail("Testdaten unvollständig: "+JSON.stringify(vorher)); process.exit(1); }

// ===== Bearbeiten öffnen =====
await page.evaluate(()=>{
  const k=[...document.querySelectorAll("div")].filter(d=>/Spieltag ALT/.test(d.innerText||"")
    && [...d.querySelectorAll("button")].filter(x=>(x.innerText||"").trim()==="⋯").length===1)
    .sort((a,b)=>(a.innerText||"").length-(b.innerText||"").length)[0];
  const b=k&&[...k.querySelectorAll("button")].find(x=>(x.innerText||"").trim()==="⋯"); b&&b.click(); });
await page.waitForTimeout(700);
await page.evaluate(()=>{
  const k=[...document.querySelectorAll("div")].filter(d=>/Spieltag ALT/.test(d.innerText||"")
    && [...d.querySelectorAll("button")].filter(x=>(x.innerText||"").trim()==="⋯").length===1)
    .sort((a,b)=>(a.innerText||"").length-(b.innerText||"").length)[0];
  const b=k&&[...k.querySelectorAll("button")].find(x=>/Bearbeiten/.test(x.innerText||"")); b&&b.click(); });
await page.waitForTimeout(1200);
{ const b0=await body();
  if(/Titel|Übersicht|ZUSAMMENFASSUNG|Termin bearbeiten/i.test(b0)) ok("Das Bearbeiten-Fenster ist offen");
  else fail("Bearbeiten öffnet nicht: "+kurz(b0)); }

// ===== Titel ändern und speichern =====
// Das Fenster startet auf der Übersicht - erst über „TITEL ... Ändern" zum Feld.
{ const auf=await page.evaluate(()=>{
    const b=[...document.querySelectorAll("button")].find(x=>/^TITEL/.test((x.innerText||"").trim()));
    if(!b) return false; b.click(); return true; });
  if(auf) ok("Über die Übersicht geht es zum Titel"); else fail("Keine Titel-Zeile im Fenster"); }
await page.waitForTimeout(900);
{ const getippt=await page.evaluate(()=>{
    const i=[...document.querySelectorAll("input")].find(x=>/Spieltag ALT/.test(x.value||""));
    if(!i) return false;
    const set=Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype,"value").set;
    set.call(i,"Spieltag NEU – anderer Platz"); i.dispatchEvent(new Event("input",{bubbles:true}));
    return true; });
  if(getippt) ok("Der Titel lässt sich ändern"); else fail("Kein Titel-Feld gefunden"); }
await page.waitForTimeout(500);
// Zurueck zur Uebersicht, dort steht "Speichern".
if(await klick("Übersicht")) ok("Zurück zur Übersicht"); else fail("Kein Übersicht-Knopf");
await page.waitForTimeout(900);
if(await klick("^Speichern$")) ok("Speichern ist anklickbar");
else { const b0=await body(); fail("Kein Speichern-Knopf: "+kurz(b0)); }
await page.waitForTimeout(1600);

// ===== 1-4) Prüfen =====
const nachher=await termin("ev_edit");
if(/NEU/.test(nachher.titel||"")) ok("Der Titel ist geändert: "+nachher.titel);
else fail("Titel nicht geändert: "+JSON.stringify(nachher.titel));
if(nachher.stimmen.length===4) ok("Alle vier Antworten stehen noch da");
else fail(`Antworten verändert: ${nachher.stimmen.length} statt 4 (${nachher.stimmen.join(", ")})`);
if(nachher.present.length===vorher.present.length) ok("Die Anwesenheit ist unverändert");
else fail("Anwesenheit verändert: "+JSON.stringify(nachher.present));
if(nachher.auf===vorher.auf) ok("Die Aufstellung ist unverändert");
else fail("Aufstellung verändert: "+nachher.auf);
if(nachher.listen.length===1&&nachher.listen[0].n===1) ok("Die Antwort in der Zusatzliste ist erhalten");
else fail("Zusatzliste verändert: "+JSON.stringify(nachher.listen));

// ===== 4) Serie: Anwesenheit bleibt beim eigenen Termin =====
await page.evaluate(()=>{
  const k=[...document.querySelectorAll("div")].filter(d=>/Serie/.test(d.innerText||"")
    && [...d.querySelectorAll("button")].filter(x=>(x.innerText||"").trim()==="⋯").length===1)
    .sort((a,b)=>(a.innerText||"").length-(b.innerText||"").length)[0];
  const b=k&&[...k.querySelectorAll("button")].find(x=>(x.innerText||"").trim()==="⋯"); b&&b.click(); });
await page.waitForTimeout(700);
await page.evaluate(()=>{
  const k=[...document.querySelectorAll("div")].filter(d=>/Serie/.test(d.innerText||"")
    && [...d.querySelectorAll("button")].filter(x=>(x.innerText||"").trim()==="⋯").length===1)
    .sort((a,b)=>(a.innerText||"").length-(b.innerText||"").length)[0];
  const b=k&&[...k.querySelectorAll("button")].find(x=>/Bearbeiten/.test(x.innerText||"")); b&&b.click(); });
await page.waitForTimeout(1000);
await klick("Ganze Serie|alle Termine|Alle Termine"); await page.waitForTimeout(1100);
await page.evaluate(()=>{ const b=[...document.querySelectorAll("button")].find(x=>/^TITEL/.test((x.innerText||"").trim())); b&&b.click(); });
await page.waitForTimeout(900);
await page.evaluate(()=>{
  const i=[...document.querySelectorAll("input")].find(x=>(x.value||"")==="Serie");
  if(i){ const set=Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype,"value").set;
    set.call(i,"Serie UMBENANNT"); i.dispatchEvent(new Event("input",{bubbles:true})); } });
await page.waitForTimeout(500);
await klick("Übersicht"); await page.waitForTimeout(900);
await klick("^Speichern$"); await page.waitForTimeout(1600);
{ const a=await termin("ser_a"), b2=await termin("ser_b");
  if(a&&b2&&/UMBENANNT/.test(a.titel)&&/UMBENANNT/.test(b2.titel)) ok("Die Serie ist umbenannt");
  else fail("Serie nicht umbenannt: "+JSON.stringify([a&&a.titel,b2&&b2.titel]));
  if(b2&&b2.present.length===0) ok("Der zweite Serientermin hat weiterhin KEINE Anwesenheit – sie wird nicht kopiert");
  else fail("Anwesenheit auf die ganze Serie kopiert: "+JSON.stringify(b2&&b2.present)); }

if(errors.length){ console.log("JS-FEHLER:"); [...new Set(errors)].forEach(e=>console.log(" -",e.slice(0,150))); }
console.log(errors.length||fails.length?`ERGEBNIS: ${fails.length} Fehlschläge, ${errors.length} JS-Fehler`:"ERGEBNIS: ALLES OK");
await browser.close(); srv.close();
process.exit(errors.length||fails.length?1:0);
