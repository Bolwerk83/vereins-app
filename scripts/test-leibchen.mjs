// E2E-Test: Leistungsgruppen am Spieler, Übersicht mit Leibchen und
// Mannschaften fürs Spielchen.
//   1. An jeder Spielerkarte sitzt ein Punkt – antippen setzt die Gruppe.
//   2. Unten steht nur noch die Übersicht (wer gehört wohin).
//   3. Jede Gruppe bekommt eine Leibchenfarbe.
//   4. Im Training entstehen daraus Mannschaften aus den Zusagen.
//   5. Fehlt jemand, rückt aus der mittleren Gruppe (Reserve) jemand nach.
// Aufruf: npm run build && node scripts/test-leibchen.mjs
import { chromium } from "playwright-core";
import http from "http"; import fs from "fs"; import path from "path";
const dist = path.resolve("dist");
const srv = http.createServer((req,res)=>{ let p=path.join(dist,req.url.split("?")[0]); if(!fs.existsSync(p)||fs.statSync(p).isDirectory()) p=path.join(dist,"index.html"); res.setHeader("content-type",{".html":"text/html",".js":"text/javascript",".css":"text/css"}[path.extname(p)]||"text/plain"); res.end(fs.readFileSync(p)); }).listen(4347);
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
const zumKader = async () => {
  await page.evaluate(()=>{ const b=[...document.querySelectorAll("button")].find(x=>(x.innerText||"").trim()==="Team"); b&&b.click(); });
  await page.waitForTimeout(1400); await dismiss();
  await klick("^Spieler$"); await page.waitForTimeout(1400);
};
const grpVon=(name)=>page.evaluate(n=>{ const d=JSON.parse(localStorage.getItem("vereinsapp_v14")||"null");
  const p=(d.playerProfiles||[]).find(x=>x.name===n); return p?(p.intGrp||""):null; }, name);
// Der Gruppen-Chip in der Zeile eines Kindes
const chipKlick=(name)=>page.evaluate(n=>{
  const karten=[...document.querySelectorAll("div")].filter(d=>(d.innerText||"").includes(n)&&(d.innerText||"").length<300);
  for(const k of karten.reverse()){
    const b=[...k.querySelectorAll("button")].find(x=>/^(Gruppe\?|Leistung|Reserve|Entwicklung|Aufbau)$/.test((x.innerText||"").trim()));
    if(b){ b.click(); return (b.innerText||"").trim(); }
  }
  return null; }, name);
// Aus der geöffneten Auswahl eine Gruppe wählen
const wahlKlick=(name,gruppe)=>page.evaluate(({n,g})=>{
  const karten=[...document.querySelectorAll("div")].filter(d=>(d.innerText||"").trim().startsWith("GRUPPE"));
  const k=karten[karten.length-1]; if(!k) return false;
  const b=[...k.querySelectorAll("button")].filter(x=>(x.innerText||"").trim()===g).pop();
  if(!b) return false; b.click(); return true; },{n:name,g:gruppe});

await page.addInitScript(()=>{
  if(!localStorage.getItem("vereinsapp_config")) localStorage.setItem("vereinsapp_config", JSON.stringify({url:"https://127.0.0.1:1/x", key:"test"}));
  if(localStorage.getItem("va_simple")===null)  localStorage.setItem("va_simple","0");
  if(localStorage.getItem("va_tsimple")===null) localStorage.setItem("va_tsimple","0");
});
await page.goto("http://127.0.0.1:4347/", { waitUntil:"networkidle" }); await page.waitForTimeout(2500);
await page.evaluate(()=>{ sessionStorage.setItem("vereinsapp_v12_session", JSON.stringify({role:"trainer",cid:"demo",tids:["demo_f1"],name:"Demo Trainer",id:"demo_tr1"})); });
await page.reload({waitUntil:"networkidle"}); await page.waitForTimeout(2600); await dismiss();
await page.evaluate(()=>{ const b=[...document.querySelectorAll("button")].find(x=>/Bin dabei/.test(x.innerText)); b&&b.click(); });
await page.waitForTimeout(1500);

const kader = await page.evaluate(()=>{
  const d=JSON.parse(localStorage.getItem("vereinsapp_v14")||"null");
  const vorhanden=(d.playerProfiles||[]).filter(p=>p.mainTid==="demo_f1"&&!p.archived);
  let i=1; const namen=vorhanden.map(p=>p.name);
  while(namen.length<13){ const n="Kind "+i;
    d.playerProfiles.push({id:"pp_lb"+i,cid:"demo",seasonId:vorhanden[0]&&vorhanden[0].seasonId,archived:false,name:n,
      by:2017,gender:"m",mainTid:"demo_f1",optTids:[],friends:[],mustWith:[]});
    namen.push(n); i++; }
  (d.playerProfiles||[]).filter(p=>p.mainTid==="demo_f1").forEach(p=>{ p.intGrp=""; });
  localStorage.setItem("vereinsapp_v14", JSON.stringify(d));
  return namen.slice(0,13);
});
if(kader&&kader.length===13) ok("Kader mit 13 Kindern steht");
else { fail("Kader nicht vorbereitet"); process.exit(1); }
await page.reload({waitUntil:"networkidle"}); await page.waitForTimeout(2800); await dismiss();
await zumKader();

// ===== 1) Gruppen-Chip an der Spielerkarte =====
{ const beschriftung=await chipKlick(kader[0]);
  if(beschriftung==="Gruppe?") ok("An der Spielerkarte steht „Gruppe?“ – man sieht, dass hier etwas einzustellen ist");
  else fail("Kein beschrifteter Chip: "+beschriftung);
  await page.waitForTimeout(700);
  const b2=await body();
  if(/GRUPPE/.test(b2)&&/Leistung/.test(b2)&&/keine/.test(b2))
    ok("Ein Tipp öffnet die Auswahl mit allen Gruppen und „keine“");
  else fail("Keine Auswahl: "+b2.slice(0,400).replace(/\n/g," | ")); }
if(await wahlKlick(kader[0],"Reserve")) ok("Die Gruppe lässt sich direkt auswählen"); else fail("Auswahl nicht klickbar");
await page.waitForTimeout(1100);
{ const g=await grpVon(kader[0]);
  if(g==="g2") ok(`Gewählt ist genau die angetippte Gruppe (${kader[0]} → Reserve)`);
  else fail("Falsche Gruppe: "+g); }
{ const beschriftung=await page.evaluate(n=>{
    const karten=[...document.querySelectorAll("div")].filter(d=>(d.innerText||"").includes(n)&&(d.innerText||"").length<300);
    for(const k of karten.reverse()){
      const b=[...k.querySelectorAll("button")].find(x=>/^(Gruppe\?|Leistung|Reserve|Entwicklung)$/.test((x.innerText||"").trim()));
      if(b) return (b.innerText||"").trim(); }
    return null; }, kader[0]);
  if(beschriftung==="Reserve") ok("Danach steht die Gruppe am Chip – ohne die Karte zu öffnen");
  else fail("Chip zeigt die Gruppe nicht: "+beschriftung); }

// ===== 2+3) Übersicht mit Leibchen =====
if(await klick("🎯 Leistungsgruppen")) ok("Unten gibt es die Übersicht"); else fail("Keine Übersicht");
await page.waitForTimeout(800);
let b=await body();
if(/Zuteilen kannst du oben an der Spielerkarte/.test(b)) ok("Sie erklärt, dass zugeteilt oben wird – der lange Zuteil-Block ist weg");
else fail("Kein Hinweis auf die Karte: "+b.slice(-500).replace(/\n/g," | "));
if(/LEIBCHEN/.test(b)) ok("Jede Gruppe hat eine Leibchenfarbe");
else fail("Kein Leibchen");
if(/OHNE GRUPPE \(12\)/.test(b)) ok("Und sie zeigt, wer noch keiner Gruppe zugeteilt ist (12)");
else fail("Keine Ohne-Gruppe-Liste: "+(b.match(/OHNE GRUPPE[^\n]*/)||[""])[0]);
{ const geklickt=await page.evaluate(()=>{ const b2=[...document.querySelectorAll('button[aria-label="Leibchen Gelb"]')][0];
    if(!b2) return false; b2.click(); return true; });
  await page.waitForTimeout(1100);
  const g=await page.evaluate(()=>{ const d=JSON.parse(localStorage.getItem("vereinsapp_v14")||"null");
    const t=(d.teams||[]).find(x=>x.id==="demo_f1"); return (t&&t.intGroups&&t.intGroups[0])||null; });
  if(geklickt&&g&&g.leib==="gelb") ok("Die Leibchenfarbe lässt sich wechseln (Gelb) und wird gespeichert");
  else fail("Leibchen nicht gespeichert: "+JSON.stringify(g)); }

// ===== 4+5) Mannschaften im Training =====
// 13 Zusagen: Leistung 5, Reserve 6, Entwicklung 2.
// Erwartung bei 5+1: Leistung holt sich EINEN aus der Reserve nach oben,
// steht dann bei 6. Reserve hat danach 5 und holt aus Entwicklung auf 6.
// Entwicklung bleibt übrig -> keine dritte Mannschaft mit 6.
// Vor allem: KEIN Leistungsspieler darf in der Reserve auftauchen.
const trId = await page.evaluate(k=>{
  const d=JSON.parse(localStorage.getItem("vereinsapp_v14")||"null");
  const p=v=>String(v).padStart(2,"0"); const x=new Date(Date.now()+2*86400000);
  const zu={}; k.slice(0,5).forEach(n=>zu[n]="g1"); k.slice(5,11).forEach(n=>zu[n]="g2"); k.slice(11,13).forEach(n=>zu[n]="g3");
  (d.playerProfiles||[]).filter(q=>q.mainTid==="demo_f1").forEach(q=>{ q.intGrp=zu[q.name]||""; });
  const ev=(d.events||[]).filter(e=>e.cid==="demo"&&e.tid==="demo_f1")[0];
  const ts=new Date().toISOString();
  Object.assign(ev,{ type:"training", date:`${x.getFullYear()}-${p(x.getMonth()+1)}-${p(x.getDate())}`, time:"17:30",
    endTime:"19:00", title:"Training", loc:"Platz", note:"", deadline:null, extraPolls:[], duties:[], spielGr:6,
    votes:Object.fromEntries(k.map(n=>[n,{val:"yes",ts,role:"player"}])) });
  (d.events||[]).filter(e=>e.cid==="demo"&&e.id!==ev.id).forEach(e=>{
    const y=new Date(Date.now()+12*86400000); e.date=`${y.getFullYear()}-${p(y.getMonth()+1)}-${p(y.getDate())}`; });
  localStorage.setItem("vereinsapp_v14", JSON.stringify(d));
  return ev.id; }, kader);
await page.reload({waitUntil:"networkidle"}); await page.waitForTimeout(2800); await dismiss();
await page.evaluate(()=>{ const b=[...document.querySelectorAll("button")].find(x=>/^(Ansehen|✅ Anwesenheit)$/.test((x.innerText||"").trim())); b&&b.click(); });
await page.waitForTimeout(1700);
b=await body();
if(/Mannschaften fürs Spielchen/.test(b)) ok("Im Training stehen die Mannschaften");
else fail("Keine Mannschaften: "+b.slice(0,400).replace(/\n/g," | "));
if(/SPIELFORM/.test(b)&&/5\+1/.test(b)) ok("Die Spielform lässt sich wählen (4+1 bis 7+1)");
else fail("Keine Spielform-Auswahl");
if(/Aus den 13 Zusagen/.test(b)) ok("Aus den 13 Zusagen gebildet");
else fail("Zusagen nicht Grundlage");
if(/Nach unten wird niemand geschoben/.test(b)) ok("Die Regel steht dabei: es wird nur aufgerückt");
else fail("Regel nicht erklärt");

// Der Block als Text - daraus lesen wir die Mannschaften
const block=()=>page.evaluate(()=>{ const t=document.body.innerText; const i=t.indexOf("Mannschaften fürs Spielchen");
  return i<0?"":t.slice(i,i+900); });
{ const bl=await block();
  const teil=(name)=>{ const i=bl.indexOf(name); if(i<0) return ""; 
    const rest=bl.slice(i+name.length); const e=rest.search(/\n(Leistung|Reserve|Entwicklung)\n/);
    return e<0?rest.slice(0,300):rest.slice(0,e); };
  const leistung=teil("Leistung"), reserve=teil("Reserve");
  // Kein Kind aus der Leistungsgruppe darf im Reserve-Block stehen
  const leistungsKinder=kader.slice(0,5);
  const abgestiegen=leistungsKinder.filter(n=>reserve.includes(n));
  if(abgestiegen.length===0) ok("Kein Kind aus der Leistungsgruppe steht bei der Reserve – kein Abstieg");
  else fail("Abstieg passiert: "+abgestiegen.join(", "));
  // Genau einer rückt aus der Reserve in die Leistung auf
  const reserveKinder=kader.slice(5,11);
  const aufgerueckt=reserveKinder.filter(n=>leistung.includes(n));
  if(aufgerueckt.length===1) ok(`Genau einer rückt aus der Reserve auf: ${aufgerueckt[0]}`);
  else fail("Falsche Zahl aufgerückt: "+aufgerueckt.length);
  if(/rückt auf/.test(bl)) ok("Und ist als „rückt auf“ gekennzeichnet");
  else fail("Keine Kennzeichnung"); }
{ const bl=await block();
  if(/AUSWECHSEL/.test(bl)) ok("Wer übrig ist, steht als Auswechselspieler dabei");
  else fail("Keine Auswechselspieler: "+bl.slice(0,400).replace(/\n/g," | "));
  if(/zum Auswechseln/.test(bl)) ok("Und unten steht, wie viele es sind");
  else fail("Keine Zusammenfassung"); }

// Spielform wechseln: 4+1 ergibt kleinere Mannschaften
{ if(await klick("^4\\+1$")) ok("Die Spielform lässt sich umstellen"); else fail("4+1 nicht klickbar");
  await page.waitForTimeout(1300);
  const ev=await page.evaluate(x=>{ const d=JSON.parse(localStorage.getItem("vereinsapp_v14")||"null");
    return (d.events||[]).find(e=>e.id===x)||null; }, trId);
  if(ev&&ev.spielGr===5) ok("Die Wahl ist am Termin gespeichert");
  else fail("Spielform nicht gespeichert: "+(ev&&ev.spielGr));
  const bl=await block();
  // 13 Kinder bei 4+1 (5 je Mannschaft): zwei volle Mannschaften, 3 wechseln ein
  if(/2 × 4\+1/.test(bl)&&/3 zum Auswechseln/.test(bl)) ok("Bei 4+1: zwei volle Mannschaften und drei zum Auswechseln");
  else fail("Falsche Aufteilung bei 4+1: "+(bl.match(/\d+ × \d\+1[^\n]*/)||[""])[0]); }

if(errors.length){ console.log("JS-FEHLER:"); [...new Set(errors)].forEach(e=>console.log(" -",e.slice(0,150))); }
console.log(errors.length||fails.length?`ERGEBNIS: ${fails.length} Fehlschläge, ${errors.length} JS-Fehler`:"ERGEBNIS: ALLES OK");
await browser.close(); srv.close();
process.exit(errors.length||fails.length?1:0);
