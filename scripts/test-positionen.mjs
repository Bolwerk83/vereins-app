// E2E-Test: Hauptposition + Nebenpositionen nach Priorität.
//   1. Im Spielerprofil heißt das Feld „Hauptposition“.
//   2. Nebenpositionen lassen sich antippen; die Reihenfolge ist die Priorität.
//   3. Die Reihenfolge lässt sich ändern und wird gespeichert.
//   4. Die Hauptposition taucht nicht als Nebenposition auf.
//   5. Der Aufstellungs-Vorschlag nutzt sie: wer eine Linie als 1. Neben-
//      position hat, wird dort eher eingesetzt als jemand ohne Bezug.
// Aufruf: npm run build && node scripts/test-positionen.mjs
import { chromium } from "playwright-core";
import http from "http"; import fs from "fs"; import path from "path";
const dist = path.resolve("dist");
const srv = http.createServer((req,res)=>{ let p=path.join(dist,req.url.split("?")[0]); if(!fs.existsSync(p)||fs.statSync(p).isDirectory()) p=path.join(dist,"index.html"); res.setHeader("content-type",{".html":"text/html",".js":"text/javascript",".css":"text/css"}[path.extname(p)]||"text/plain"); res.end(fs.readFileSync(p)); }).listen(4341);
const exe=process.env.PLAYWRIGHT_CHROMIUM||"/opt/pw-browsers/chromium-1194/chrome-linux/chrome";
const browser = await chromium.launch({ executablePath:exe, args:["--no-sandbox"] });
const page = await browser.newPage({ viewport:{ width:390, height:900 } });
const errors=[]; const fails=[];
page.on("pageerror", e=>errors.push(e.message));
page.on("dialog", d=>d.accept());
const fail=m=>{ fails.push(m); console.log("FEHLGESCHLAGEN:", m); };
const ok=m=>console.log("OK:", m);
const body=()=>page.evaluate(()=>document.body.innerText);
const klick=(re)=>page.evaluate(r=>{
  const b=[...document.querySelectorAll("button")].find(x=>new RegExp(r).test((x.innerText||"").replace(/\s+/g," ").trim()));
  if(!b||b.disabled) return false; b.click(); return true; }, re instanceof RegExp?re.source:re);
const dismiss=async()=>{ for(let k=0;k<12;k++){ const done=await page.evaluate(()=>{
  const fx=[...document.querySelectorAll("div")].filter(d=>getComputedStyle(d).position==="fixed"&&d.querySelector("button")&&d.innerText.length>30);
  for(const f of fx){ const b=[...f.querySelectorAll("button")].find(x=>/geht|Los|Verstanden|Alles klar|Fertig|Jetzt nicht|Weiter →|Überspringen|Start/i.test(x.innerText)); if(b){ b.click(); return false; } }
  return true; }); await page.waitForTimeout(400); if(done) break; } };
const profilOeffnen=(name)=>page.evaluate(n=>{
  const btn=[...document.querySelectorAll('button[aria-label="Bearbeiten"]')]
    .find(b=>{ let k=b; for(let i=0;i<8&&k;i++){ if((k.innerText||"").includes(n)) return true; k=k.parentElement; } return false; });
  if(!btn) return false; btn.click(); return true; }, name);
const posKlick=(pos)=>page.evaluate(x=>{
  const b=[...document.querySelectorAll("button")].filter(y=>(y.innerText||"").replace(/\s+/g," ").trim().replace(/^\d+\s*/,"")===x);
  const el=b[b.length-1]; if(!el) return false; el.click(); return true; }, pos);
const profilVon=(name)=>page.evaluate(n=>{ const d=JSON.parse(localStorage.getItem("vereinsapp_v14")||"null");
  const p=(d.playerProfiles||[]).find(x=>x.name===n); return p?{position:p.position||"",posAlt:p.posAlt||[]}:null; }, name);

await page.addInitScript(()=>{
  if(!localStorage.getItem("vereinsapp_config")) localStorage.setItem("vereinsapp_config", JSON.stringify({url:"https://127.0.0.1:1/x", key:"test"}));
  if(localStorage.getItem("va_simple")===null)  localStorage.setItem("va_simple","0");
  if(localStorage.getItem("va_tsimple")===null) localStorage.setItem("va_tsimple","0");
});
await page.goto("http://127.0.0.1:4341/", { waitUntil:"networkidle" }); await page.waitForTimeout(2500);
await page.evaluate(()=>{ sessionStorage.setItem("vereinsapp_v12_session", JSON.stringify({role:"trainer",cid:"demo",tids:["demo_f1"],name:"Demo Trainer",id:"demo_tr1"})); });
await page.reload({waitUntil:"networkidle"}); await page.waitForTimeout(2600); await dismiss();
await page.evaluate(()=>{ const b=[...document.querySelectorAll("button")].find(x=>/Bin dabei/.test(x.innerText)); b&&b.click(); });
await page.waitForTimeout(1500);

const kind = await page.evaluate(()=>{ const d=JSON.parse(localStorage.getItem("vereinsapp_v14")||"null");
  const p=(d.playerProfiles||[]).filter(x=>x.mainTid==="demo_f1"&&!x.archived)[0]; return p?p.name:null; });
if(kind) ok("Testkind: "+kind); else { fail("Kein Kind gefunden"); process.exit(1); }

await page.evaluate(()=>{ const b=[...document.querySelectorAll("button")].find(x=>(x.innerText||"").trim()==="Team"); b&&b.click(); });
await page.waitForTimeout(1400); await dismiss();
await klick("^Spieler$"); await page.waitForTimeout(1400);
if(await profilOeffnen(kind)) ok("Das Spielerprofil lässt sich öffnen"); else fail("Profil nicht offen");
await page.waitForTimeout(1200);
await klick("🎯 Profil"); await page.waitForTimeout(800);

// ===== 1) Feldname =====
let b=await body();
if(/Hauptposition/i.test(b)) ok("Das Feld heißt jetzt „Hauptposition“");
else fail("Kein Feld „Hauptposition“: "+b.slice(0,300).replace(/\n/g," | "));
if(/NEBENPOSITIONEN/.test(b)&&/nach Priorität/.test(b)) ok("Darunter stehen die Nebenpositionen mit dem Hinweis auf die Priorität");
else fail("Keine Nebenpositionen: "+b.slice(0,400).replace(/\n/g," | "));

// ===== 2+3) Auswählen und sortieren =====
if(await posKlick("Off. Mittelfeld")) ok("Eine Nebenposition lässt sich antippen"); else fail("Nicht anklickbar");
await page.waitForTimeout(500);
await posKlick("Rechter Fluegel"); await page.waitForTimeout(500);
b=await body();
if(/Reihenfolge:/.test(b)&&/1\. Off\. Mittelfeld/.test(b)&&/2\. Rechter Fluegel/.test(b))
  ok("Die Reihenfolge steht da: 1. Off. Mittelfeld, 2. Rechter Fluegel");
else fail("Keine Reihenfolge: "+b.slice(0,500).replace(/\n/g," | "));
{ const geklickt=await page.evaluate(()=>{ const b2=[...document.querySelectorAll("button")].find(x=>(x.innerText||"").trim()==="↑");
    if(!b2) return false; b2.click(); return true; });
  await page.waitForTimeout(600);
  b=await body();
  if(geklickt&&/1\. Rechter Fluegel/.test(b)) ok("Mit ↑ wandert eine Position nach vorn");
  else fail("Sortieren klappt nicht: "+b.slice(0,400).replace(/\n/g," | ")); }
if(await klick("Spielerprofil speichern")) ok("Gespeichert"); else fail("Kein Speichern");
await page.waitForTimeout(1500);
{ const p=await profilVon(kind);
  if(p&&p.posAlt.length===2&&p.posAlt[0]==="Rechter Fluegel") ok("Die Reihenfolge ist gespeichert: "+p.posAlt.join(" → "));
  else fail("Nicht gespeichert: "+JSON.stringify(p)); }
b=await body();
if(/· auch /.test(b)) ok("In der Kaderliste steht dezent „auch …“ dabei");
else fail("Keine Anzeige in der Liste: "+b.slice(0,300).replace(/\n/g," | "));

// ===== 4) Hauptposition taucht nicht als Nebenposition auf =====
{ await profilOeffnen(kind); await page.waitForTimeout(1000);
  await klick("🎯 Profil"); await page.waitForTimeout(800);
  const haupt=(await profilVon(kind)).position;
  if(!haupt){ console.log("HINWEIS: Kind hat keine Hauptposition – Prüfung übersprungen"); }
  else { const da=await page.evaluate(h=>{
      const kopf=[...document.querySelectorAll("div")].find(d=>(d.innerText||"").trim().startsWith("NEBENPOSITIONEN"));
      if(!kopf) return null;
      return [...kopf.parentElement.querySelectorAll("button")].map(b2=>(b2.innerText||"").replace(/\s+/g," ").trim().replace(/^\d+\s*/,"")); }, haupt);
    if(da&&!da.includes(haupt)) ok(`Die Hauptposition („${haupt}“) steht nicht bei den Nebenpositionen`);
    else fail("Hauptposition doppelt: "+JSON.stringify(da)); } }
await klick("Spielerprofil speichern"); await page.waitForTimeout(1200);

// ===== 5) Der Vorschlag nutzt die Nebenposition =====
{ const vorbereitet=await page.evaluate(n=>{ const d=JSON.parse(localStorage.getItem("vereinsapp_v14")||"null");
    const p=v=>String(v).padStart(2,"0"); const x=new Date(Date.now()+2*86400000);
    const kader=(d.playerProfiles||[]).filter(q=>q.mainTid==="demo_f1"&&!q.archived);
    // Genau zwei Kinder: eines mit Tor als Nebenposition, eines ohne Bezug
    const a=kader[0], b2=kader[1]; if(!a||!b2) return null;
    // Alle vier ohne Torwart-Bezug - nur a hat Torwart als Nebenposition.
    kader.forEach(q=>{ q.position="Stürmer"; q.posAlt=[]; });
    a.posAlt=["Torwart"];
    const ev=(d.events||[]).filter(e=>e.cid==="demo"&&e.tid==="demo_f1"&&(e.pt==="att"||!e.pt))
      .sort((q,r)=>String(q.date||"").localeCompare(String(r.date||"")))[0];
    const ts=new Date().toISOString();
    Object.assign(ev,{ type:"auswarts", date:`${x.getFullYear()}-${p(x.getMonth()+1)}-${p(x.getDate())}`, time:"10:30",
      endTime:"12:00", title:"SV Adler", loc:"Arena", note:"", deadline:null, carpoolExtra:false, carpoolEnabled:false,
      extraPolls:[], duties:[], lineup:null, lineups:null, sollPlayers:4,
      votes:{[a.name]:{val:"yes",ts,role:"player"},[b2.name]:{val:"yes",ts,role:"player"},
             [kader[2]&&kader[2].name||"x"]:{val:"yes",ts,role:"player"},[kader[3]&&kader[3].name||"y"]:{val:"yes",ts,role:"player"}} });
    (d.events||[]).filter(e=>e.cid==="demo"&&e.id!==ev.id).forEach(e=>{
      const y=new Date(Date.now()+12*86400000); e.date=`${y.getFullYear()}-${p(y.getMonth()+1)}-${p(y.getDate())}`; });
    localStorage.setItem("vereinsapp_v14", JSON.stringify(d));
    return {ev:ev.id, torwart:a.name, ohne:b2.name}; }, kind);
  if(!vorbereitet){ fail("Konnte den Vorschlags-Test nicht vorbereiten"); }
  else {
    await page.reload({waitUntil:"networkidle"}); await page.waitForTimeout(2800); await dismiss();
    await page.evaluate(()=>{ const b2=[...document.querySelectorAll("button")].find(x=>/^(Ansehen|✅ Anwesenheit)$/.test((x.innerText||"").trim())); b2&&b2.click(); });
    await page.waitForTimeout(1600);
    await page.evaluate(()=>{ const b2=[...document.querySelectorAll("button")].find(x=>/^(⚽ Aufstellung|Aufstellung)$/.test((x.innerText||"").trim())); b2&&b2.click(); });
    await page.waitForTimeout(1200);
    await klick("🤖"); await page.waitForTimeout(1500);
    const ev=await page.evaluate(x=>{ const d=JSON.parse(localStorage.getItem("vereinsapp_v14")||"null");
      return (d.events||[]).find(e=>e.id===x)||null; }, vorbereitet.ev);
    const tor=ev&&ev.lineups&&ev.lineups[0]&&(ev.lineups[0].T||[]);
    if(tor&&tor.includes(vorbereitet.torwart))
      ok(`Ins Tor kommt das Kind, das Torwart als Nebenposition hat (${vorbereitet.torwart})`);
    else fail("Nebenposition wirkt nicht: Tor = "+JSON.stringify(tor)); } }

if(errors.length){ console.log("JS-FEHLER:"); [...new Set(errors)].forEach(e=>console.log(" -",e.slice(0,150))); }
console.log(errors.length||fails.length?`ERGEBNIS: ${fails.length} Fehlschläge, ${errors.length} JS-Fehler`:"ERGEBNIS: ALLES OK");
await browser.close(); srv.close();
process.exit(errors.length||fails.length?1:0);
