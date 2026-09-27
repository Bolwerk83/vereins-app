// E2E-Test: Empfehlung für ein einzelnes Spiel, gesteuert über die
// Leistungsgruppen – und bewusst nur als Vorschlag.
//   1. Im Spiel gibt es eine Ausrichtung: Leistung / Gemischt / Entwicklung.
//   2. „🎯 Empfehlung“ schlägt eine Aufstellung vor und begründet sie.
//   3. Bei „Leistung“ kommen zuerst Kinder aus der Leistungsgruppe.
//   4. Bei „Entwicklung“ ist es umgekehrt.
//   5. Der Vorschlag wird NICHT automatisch angewendet – erst „Übernehmen“.
//   6. „Verwerfen“ lässt die Aufstellung unangetastet.
//   7. Innerhalb der Gruppe kommen die dran, die zuletzt weniger gespielt haben.
// Aufruf: npm run build && node scripts/test-spiel-empfehlung.mjs
import { chromium } from "playwright-core";
import http from "http"; import fs from "fs"; import path from "path";
const dist = path.resolve("dist");
const srv = http.createServer((req,res)=>{ let p=path.join(dist,req.url.split("?")[0]); if(!fs.existsSync(p)||fs.statSync(p).isDirectory()) p=path.join(dist,"index.html"); res.setHeader("content-type",{".html":"text/html",".js":"text/javascript",".css":"text/css"}[path.extname(p)]||"text/plain"); res.end(fs.readFileSync(p)); }).listen(4339);
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
const zurAufstellung = async () => {
  await page.evaluate(()=>{ const b=[...document.querySelectorAll("button")].find(x=>/^(Ansehen|✅ Anwesenheit)$/.test((x.innerText||"").trim())); b&&b.click(); });
  await page.waitForTimeout(1600);
  await page.evaluate(()=>{ const b=[...document.querySelectorAll("button")].find(x=>/^(⚽ Aufstellung|Aufstellung)$/.test((x.innerText||"").trim())); b&&b.click(); });
  await page.waitForTimeout(1200);
};
// Der Vorschlagskasten
const vorschlag=()=>page.evaluate(()=>{ const t=document.body.innerText;
  const i=t.indexOf("🎯 Vorschlag"); if(i<0) return null;
  const rest=t.slice(i); const e=rest.indexOf("Verwerfen");
  return (e<0?rest.slice(0,700):rest.slice(0,e+9)).replace(/\n/g," | "); });
const evLesen=(id)=>page.evaluate(x=>{ const d=JSON.parse(localStorage.getItem("vereinsapp_v14")||"null");
  return (d.events||[]).find(e=>e.id===x)||null; }, id);

await page.addInitScript(()=>{
  if(!localStorage.getItem("vereinsapp_config")) localStorage.setItem("vereinsapp_config", JSON.stringify({url:"https://127.0.0.1:1/x", key:"test"}));
  if(localStorage.getItem("va_simple")===null)  localStorage.setItem("va_simple","0");
  if(localStorage.getItem("va_tsimple")===null) localStorage.setItem("va_tsimple","0");
});
await page.goto("http://127.0.0.1:4339/", { waitUntil:"networkidle" }); await page.waitForTimeout(2500);
await page.evaluate(()=>{ sessionStorage.setItem("vereinsapp_v12_session", JSON.stringify({role:"trainer",cid:"demo",tids:["demo_f1"],name:"Demo Trainer",id:"demo_tr1"})); });
await page.reload({waitUntil:"networkidle"}); await page.waitForTimeout(2600); await dismiss();
await page.evaluate(()=>{ const b=[...document.querySelectorAll("button")].find(x=>/Bin dabei/.test(x.innerText)); b&&b.click(); });
await page.waitForTimeout(1500);

// Acht Kinder: vier "Leistung" (g1), vier "Entwicklung" (g3); Soll 4 Spieler
const daten = await page.evaluate(()=>{
  const d=JSON.parse(localStorage.getItem("vereinsapp_v14")||"null"); if(!d) return null;
  const p=v=>String(v).padStart(2,"0"); const x=new Date(Date.now()+2*86400000);
  const vorhanden=(d.playerProfiles||[]).filter(q=>q.mainTid==="demo_f1"&&!q.archived);
  let i=1; const namen=vorhanden.map(q=>q.name);
  while(namen.length<8){ const n="Kind "+i;
    d.playerProfiles.push({id:"pp_se"+i,cid:"demo",seasonId:vorhanden[0]&&vorhanden[0].seasonId,archived:false,name:n,by:2017,
      gender:"m",mainTid:"demo_f1",optTids:[],friends:[],mustWith:[]});
    namen.push(n); i++; }
  const stark=namen.slice(0,4), entw=namen.slice(4,8);
  d.playerProfiles=(d.playerProfiles||[]).map(q=>{
    if(stark.includes(q.name)) return {...q,intGrp:"g1"};
    if(entw.includes(q.name))  return {...q,intGrp:"g3"};
    return q; });
  const ev=(d.events||[]).filter(e=>e.cid==="demo"&&e.tid==="demo_f1"&&(e.pt==="att"||!e.pt))
    .sort((a,b)=>String(a.date||"").localeCompare(String(b.date||"")))[0];
  const ts=new Date().toISOString();
  Object.assign(ev,{ type:"auswarts", date:`${x.getFullYear()}-${p(x.getMonth()+1)}-${p(x.getDate())}`, time:"10:30",
    endTime:"12:00", title:"SV Adler", loc:"Adler-Arena", note:"", deadline:null, carpoolExtra:false, carpoolEnabled:false,
    extraPolls:[], duties:[], lineup:null, lineups:null, spielLevel:"", sollPlayers:4,
    votes:Object.fromEntries([...stark,...entw].map(n=>[n,{val:"yes",ts,role:"player"}])) });
  // Ein vergangenes Spiel: zwei der Leistungsgruppe standen schon in der Startelf
  const alt=(d.events||[]).find(e=>e.cid==="demo"&&e.tid==="demo_f1"&&e.id!==ev.id);
  if(alt){ const y=new Date(Date.now()-7*86400000);
    alt.date=`${y.getFullYear()}-${p(y.getMonth()+1)}-${p(y.getDate())}`; alt.type="auswarts";
    alt.lineup={T:[stark[0]],A:[stark[1]],M:[],S:[]}; }
  (d.events||[]).filter(e=>e.cid==="demo"&&e.id!==ev.id&&e.id!==(alt&&alt.id)).forEach(e=>{
    const y=new Date(Date.now()+12*86400000); e.date=`${y.getFullYear()}-${p(y.getMonth()+1)}-${p(y.getDate())}`; });
  localStorage.setItem("vereinsapp_v14", JSON.stringify(d));
  return {ev:ev.id, stark, entw};
});
if(daten) ok(`Ausgangslage: 4 in „Leistung“ (${daten.stark.join(", ")}), 4 in „Entwicklung“, Soll 4 Spieler`);
else { fail("Konnte die Ausgangslage nicht setzen"); process.exit(1); }
await page.reload({waitUntil:"networkidle"}); await page.waitForTimeout(2800); await dismiss();
await zurAufstellung();

// ===== 1) Ausrichtung =====
let b=await body();
if(/AUSRICHTUNG/.test(b)&&/⚡ Leistung/.test(b)&&/🌱 Entwicklung/.test(b)) ok("Es gibt eine Ausrichtung: Leistung / Gemischt / Entwicklung");
else fail("Keine Ausrichtung: "+b.slice(0,400).replace(/\n/g," | "));
if(/Eltern, Kinder und Gegner sehen davon nichts/.test(b)) ok("Mit dem Hinweis, dass das intern bleibt");
else fail("Kein Hinweis zur Vertraulichkeit");
if(/Vorschlag; aufgestellt wird erst, wenn ihr sie übernehmt/.test(b)) ok("Und dass nichts automatisch passiert");
else fail("Kein Hinweis auf den Vorschlags-Charakter");

// ===== 2+3) Empfehlung „Leistung“ =====
if(await klick("⚡ Leistung")) ok("Die Ausrichtung lässt sich auf „Leistung“ stellen"); else fail("Nicht umstellbar");
await page.waitForTimeout(1100);
{ const ev=await evLesen(daten.ev);
  if(ev&&ev.spielLevel==="stark") ok("Die Ausrichtung ist am Termin gespeichert"); else fail("Nicht gespeichert: "+(ev&&ev.spielLevel)); }
if(await klick("🎯 Empfehlung")) ok("„🎯 Empfehlung für dieses Spiel“ ist anklickbar"); else fail("Kein Empfehlungs-Knopf");
await page.waitForTimeout(1200);
{ const v=await vorschlag();
  if(v) ok("Es erscheint ein Vorschlag: "+v.slice(0,90));
  else { fail("Kein Vorschlag erschienen"); }
  if(v&&/Leistung zuerst/.test(v)&&/4 von 8 Zusagen/.test(v)) ok("Mit Begründung: „Leistung zuerst – 4 von 8 Zusagen“");
  else fail("Keine Begründung: "+(v||"—"));
  if(v&&/wenigsten Einsätzen/.test(v)) ok("Und dem Hinweis auf die Einsatzzeiten");
  else fail("Kein Hinweis auf Einsatzzeiten");
  const drin=daten.stark.filter(n=>v&&v.includes(n)).length;
  if(drin===4) ok("Vorgeschlagen sind genau die vier aus der Leistungsgruppe");
  else fail(`Nur ${drin} von 4 aus der Leistungsgruppe im Vorschlag`); }

// ===== 5) Nichts passiert ohne Übernehmen =====
{ const ev=await evLesen(daten.ev);
  const leer=!ev.lineups||!ev.lineups.some(t=>[...(t.T||[]),...(t.A||[]),...(t.M||[]),...(t.S||[]),...(t.E||[])].length);
  if(leer) ok("Die Aufstellung ist noch unangetastet – der Vorschlag steht nur da");
  else fail("Wurde ungefragt angewendet: "+JSON.stringify(ev.lineups)); }
if(await klick("Verwerfen")) ok("„Verwerfen“ geht"); else fail("Kein Verwerfen");
await page.waitForTimeout(700);
{ const v=await vorschlag();
  if(!v) ok("Danach ist der Vorschlag weg"); else fail("Vorschlag bleibt stehen"); }

// ===== 4) Ausrichtung „Entwicklung“ dreht es um =====
await klick("🌱 Entwicklung"); await page.waitForTimeout(1000);
await klick("🎯 Empfehlung"); await page.waitForTimeout(1200);
{ const v=await vorschlag();
  const drinE=daten.entw.filter(n=>v&&v.includes(n)).length;
  if(v&&/Entwicklung zuerst/.test(v)&&drinE===4) ok("Bei „Entwicklung“ sind es die vier aus der Entwicklungsgruppe");
  else fail(`Umkehrung greift nicht (${drinE} von 4): `+(v||"—")); }

// ===== 6) Übernehmen stellt auf =====
if(await klick("✓ Übernehmen")) ok("„✓ Übernehmen“ ist anklickbar"); else fail("Kein Übernehmen");
await page.waitForTimeout(1400);
{ const ev=await evLesen(daten.ev);
  const t1=ev&&ev.lineups&&ev.lineups[0];
  const feld=t1?[...(t1.T||[]),...(t1.A||[]),...(t1.M||[]),...(t1.S||[])]:[];
  if(feld.length===4&&feld.every(n=>daten.entw.includes(n))) ok("Danach steht die Entwicklungsgruppe auf dem Feld");
  else fail("Aufstellung passt nicht: "+JSON.stringify(t1));
  const bank=t1?(t1.E||[]):[];
  if(bank.length===4) ok("Und die übrigen vier sitzen auf der Ersatzbank der Mannschaft");
  else fail("Ersatzbank falsch besetzt: "+JSON.stringify(bank)); }

// ===== 7) Einsatzzeiten wirken: nur 3 Plätze für 4 Kinder =====
{ await page.evaluate(x=>{ const d=JSON.parse(localStorage.getItem("vereinsapp_v14")||"null");
    const ev=(d.events||[]).find(e=>e.id===x); ev.sollPlayers=3; ev.lineups=null; ev.lineup=null;
    localStorage.setItem("vereinsapp_v14", JSON.stringify(d)); }, daten.ev);
  await page.reload({waitUntil:"networkidle"}); await page.waitForTimeout(2800); await dismiss();
  await zurAufstellung();
  await klick("⚡ Leistung"); await page.waitForTimeout(1000);
  await klick("🎯 Empfehlung"); await page.waitForTimeout(1200);
  const v=await vorschlag();
  // Ben und Leon standen letzte Woche in der Startelf. Bei nur drei Plätzen
  // müssen die beiden anderen aus der Gruppe zuerst drankommen.
  const drin=n=>!!v&&new RegExp("(^|[|, ])"+n.replace(/[.*+?^${}()|[\]\\]/g,"\\$&")).test(v.split("ERSATZBANK")[0]);
  if(v&&drin(daten.stark[2])&&drin(daten.stark[3]))
    ok("Bei nur drei Plätzen kommen die dran, die letzte Woche nicht gespielt haben");
  else fail("Einsatzzeit-Ausgleich greift nicht: "+(v||"—"));
  if(v&&(!drin(daten.stark[0])||!drin(daten.stark[1])))
    ok("Einer der beiden aus der letzten Startelf sitzt diesmal zunächst draußen");
  else fail("Beide aus der letzten Startelf wieder dabei: "+(v||"—")); }

if(errors.length){ console.log("JS-FEHLER:"); [...new Set(errors)].forEach(e=>console.log(" -",e.slice(0,150))); }
console.log(errors.length||fails.length?`ERGEBNIS: ${fails.length} Fehlschläge, ${errors.length} JS-Fehler`:"ERGEBNIS: ALLES OK");
await browser.close(); srv.close();
process.exit(errors.length||fails.length?1:0);
