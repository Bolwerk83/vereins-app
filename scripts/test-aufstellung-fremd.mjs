// E2E-Test: Kinder, die inzwischen in einer anderen Mannschaft spielen,
// stehen noch in Aufstellungen. Aufgefallen beim Wiederherstellen von zehn
// Kindern, die aus der F2 gelöscht und der F3 zugeordnet wurden:
// Zu- und Absagen waren weg, in den Aufstellungen standen sie noch.
//   1. In VERGANGENEN Terminen bleiben sie stehen – das ist Geschichte.
//   2. In KÜNFTIGEN Terminen bekommen sie den Vermerk „andere Mannschaft“.
//   3. Dort zählen sie nicht mehr mit – weder in der Mannschaftsgröße
//      noch bei „ohne Zusage“.
//   4. Kinder der eigenen Mannschaft bleiben unberührt.
// Aufruf: npm run build && node scripts/test-aufstellung-fremd.mjs
import { chromium } from "playwright-core";
import http from "http"; import fs from "fs"; import path from "path";
const dist = path.resolve("dist");
const srv = http.createServer((req,res)=>{ let p=path.join(dist,req.url.split("?")[0]); if(!fs.existsSync(p)||fs.statSync(p).isDirectory()) p=path.join(dist,"index.html"); res.setHeader("content-type",{".html":"text/html",".js":"text/javascript",".css":"text/css"}[path.extname(p)]||"text/plain"); res.end(fs.readFileSync(p)); }).listen(4333);
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
const kurz=t=>String(t).slice(0,320).replace(/\n/g," | ");
const dismiss=async()=>{ for(let k=0;k<12;k++){ const done=await page.evaluate(()=>{
  const fx=[...document.querySelectorAll("div")].filter(d=>getComputedStyle(d).position==="fixed"&&d.querySelector("button")&&d.innerText.length>30);
  for(const f of fx){ const b=[...f.querySelectorAll("button")].find(x=>/geht|Los|Verstanden|Alles klar|Fertig|Jetzt nicht|Weiter →|Überspringen|Start/i.test(x.innerText)); if(b){ b.click(); return false; } }
  return true; }); await page.waitForTimeout(400); if(done) break; } };

await page.addInitScript(()=>{
  if(!localStorage.getItem("vereinsapp_config")) localStorage.setItem("vereinsapp_config", JSON.stringify({url:"https://127.0.0.1:1/x", key:"test"}));
  if(localStorage.getItem("va_simple")===null)  localStorage.setItem("va_simple","0");
  if(localStorage.getItem("va_tsimple")===null) localStorage.setItem("va_tsimple","0");
});
await page.goto("http://127.0.0.1:4333/", { waitUntil:"networkidle" }); await page.waitForTimeout(2500);
await page.evaluate(()=>{ sessionStorage.setItem("vereinsapp_v12_session", JSON.stringify({role:"trainer",cid:"demo",tids:["demo_f1"],name:"Demo Trainer",id:"demo_tr1"})); });
await page.reload({waitUntil:"networkidle"}); await page.waitForTimeout(2600); await dismiss();
await page.evaluate(()=>{ const b=[...document.querySelectorAll("button")].find(x=>/Bin dabei/.test(x.innerText)); b&&b.click(); });
await page.waitForTimeout(1400);

// Ein Kind wechselt die Mannschaft, steht aber in zwei Aufstellungen:
// einmal in einem vergangenen und einmal in einem künftigen Termin.
const setup = await page.evaluate(()=>{
  const d=JSON.parse(localStorage.getItem("vereinsapp_v14")||"null");
  const z=x=>String(x).padStart(2,"0");
  const iso=dt=>`${dt.getFullYear()}-${z(dt.getMonth()+1)}-${z(dt.getDate())}`;
  const tg=n=>{ const x=new Date(); x.setHours(12,0,0,0); x.setDate(x.getDate()+n); return iso(x); };
  const prof=(d.playerProfiles||[]).filter(q=>q.mainTid==="demo_f1"&&!q.archived);
  const weg=prof[0], bleibt=prof[1], dritter=prof[2];
  if(!weg||!bleibt||!dritter) return null;
  // Eine zweite Mannschaft anlegen und das Kind dorthin umhängen
  const t2={ id:"demo_f9", cid:"demo", name:"F-Jugend 9", icon:"F9", col:"#7c3aed", pub:true, pwd:"x", cat:"F-Jugend", years:"" };
  d.teams=[...(d.teams||[]).filter(t=>t.id!=="demo_f9"), t2];
  d.playerProfiles=(d.playerProfiles||[]).map(p=>p.id===weg.id?{...p, mainTid:"demo_f9", optTids:[]}:p);
  const evs=(d.events||[]).filter(e=>e.cid==="demo"&&e.tid==="demo_f1");
  const vorbei=evs[0], kommt=evs[1];
  if(!vorbei||!kommt) return null;
  const ts=new Date().toISOString();
  const auf={T:[],A:[weg.name,bleibt.name],M:[dritter.name],S:[],E:[]};
  Object.assign(vorbei,{ type:"heimspiel", date:tg(-7), time:"10:30", endTime:"12:00", title:"Rückspiel",
    deadline:null, lineups:[{id:"t1",name:"Team 1",...auf}], lineup:null,
    votes:Object.fromEntries([bleibt,dritter].map(p=>[p.name,{val:"yes",ts,role:"player"}])) });
  Object.assign(kommt,{ type:"heimspiel", date:tg(7), time:"10:30", endTime:"12:00", title:"Nächstes Spiel",
    deadline:null, lineups:[{id:"t1",name:"Team 1",...auf}], lineup:null,
    votes:Object.fromEntries([bleibt,dritter].map(p=>[p.name,{val:"yes",ts,role:"player"}])) });
  (d.events||[]).filter(e=>e.cid==="demo"&&e.id!==vorbei.id&&e.id!==kommt.id).forEach(e=>{ e.date=tg(60); });
  localStorage.setItem("vereinsapp_v14", JSON.stringify(d));
  return { weg:weg.name, bleibt:bleibt.name, dritter:dritter.name, vorbei:vorbei.id, kommt:kommt.id };
});
if(setup) ok(`„${setup.weg}“ spielt jetzt in der F-Jugend 9, steht aber in beiden Aufstellungen`);
else { fail("Testdaten nicht gesetzt"); process.exit(1); }

const oeffne=async(titel)=>{
  await page.reload({waitUntil:"networkidle"}); await page.waitForTimeout(2800); await dismiss();
  // Vergangene Termine stehen zugeklappt
  await page.evaluate(()=>{ const b=[...document.querySelectorAll("button")].find(x=>/vergangene Termine anzeigen/.test(x.innerText||"")); b&&b.click(); });
  await page.waitForTimeout(700);
  const da=await page.evaluate(t=>{
    const karten=[...document.querySelectorAll("div")].filter(d=>(d.innerText||"").includes(t)&&d.querySelector("button")&&(d.innerText||"").length<1600);
    for(const k of karten.reverse()){
      const b=[...k.querySelectorAll("button")].find(x=>/^(Ansehen|✅ Anwesenheit)$/.test((x.innerText||"").trim()));
      if(b){ b.click(); return true; } }
    return false; }, titel);
  await page.waitForTimeout(1600);
  // Zur Aufstellung
  await page.evaluate(()=>{ const b=[...document.querySelectorAll("button")].find(x=>/Aufstellung/.test(x.innerText||"")&&(x.innerText||"").length<30); b&&b.click(); });
  await page.waitForTimeout(1200);
  return da;
};
const fenster=()=>page.evaluate(()=>{
  const fx=[...document.querySelectorAll("div")].filter(d=>getComputedStyle(d).position==="fixed"&&(d.innerText||"").length>200);
  const f=fx.find(d=>/Aufstellung|Team 1/.test(d.innerText||""));
  return f?(f.innerText||""):""; });

// ===== 1) Künftiger Termin: Vermerk und nicht mitzählen =====
if(await oeffne("Nächstes Spiel")) ok("Der künftige Termin ist offen"); else fail("Künftiger Termin nicht erreichbar");
let b=await fenster();
if(/andere Mannschaft/.test(b)) ok("Im künftigen Termin steht der Vermerk „andere Mannschaft“");
else fail("Kein Vermerk im künftigen Termin: "+kurz(b));
{ const m=b.match(/Team 1 \((\d+)\)/);
  if(m&&m[1]==="2") ok("Die Mannschaft zählt nur noch 2 statt 3 – das Kind zählt nicht mit");
  else fail("Falsche Zählung: "+((b.match(/Team 1[^\n]*/)||["(keine Kopfzeile)"])[0])); }
if(new RegExp(setup.weg.replace(/[.*+?^${}()|[\]\\]/g,"\\$&")).test(b))
  ok("Der Name steht trotzdem noch da – nichts verschwindet heimlich");
else fail("Name ist verschwunden statt markiert");

// ===== 2) Vergangener Termin: alles bleibt, wie es war =====
if(await oeffne("Rückspiel")) ok("Der vergangene Termin ist offen"); else fail("Vergangener Termin nicht erreichbar");
b=await fenster();
if(!/andere Mannschaft/.test(b)) ok("Im vergangenen Termin kein Vermerk – die Aufstellung von damals bleibt");
else fail("Auch im vergangenen Termin wird markiert: "+kurz(b));
{ const m=b.match(/Team 1 \((\d+)\)/);
  if(m&&m[1]==="3") ok("Und dort zählen weiterhin alle 3 mit");
  else fail("Zählung im vergangenen Termin verändert: "+((b.match(/Team 1[^\n]*/)||["(keine Kopfzeile)"])[0])); }

if(errors.length){ console.log("JS-FEHLER:"); [...new Set(errors)].forEach(e=>console.log(" -",e.slice(0,150))); }
console.log(errors.length||fails.length?`ERGEBNIS: ${fails.length} Fehlschläge, ${errors.length} JS-Fehler`:"ERGEBNIS: ALLES OK");
await browser.close(); srv.close();
process.exit(errors.length||fails.length?1:0);
