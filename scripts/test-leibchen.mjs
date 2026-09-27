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
// Punkt in der Zeile eines Kindes anklicken
const punktKlick=(name)=>page.evaluate(n=>{
  const karten=[...document.querySelectorAll("div")].filter(d=>(d.innerText||"").includes(n)&&(d.innerText||"").length<200);
  for(const k of karten.reverse()){
    const sp=[...k.querySelectorAll("span")].find(x=>{ const st=getComputedStyle(x);
      return st.borderRadius==="99px"&&x.offsetWidth<=16&&x.offsetWidth>=10&&!x.innerText.trim(); });
    if(sp){ sp.click(); return true; }
  }
  return false; }, name);

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
  while(namen.length<9){ const n="Kind "+i;
    d.playerProfiles.push({id:"pp_lb"+i,cid:"demo",seasonId:vorhanden[0]&&vorhanden[0].seasonId,archived:false,name:n,
      by:2017,gender:"m",mainTid:"demo_f1",optTids:[],friends:[],mustWith:[]});
    namen.push(n); i++; }
  (d.playerProfiles||[]).filter(p=>p.mainTid==="demo_f1").forEach(p=>{ p.intGrp=""; });
  localStorage.setItem("vereinsapp_v14", JSON.stringify(d));
  return namen.slice(0,9);
});
if(kader&&kader.length===9) ok("Kader mit neun Kindern steht");
else { fail("Kader nicht vorbereitet"); process.exit(1); }
await page.reload({waitUntil:"networkidle"}); await page.waitForTimeout(2800); await dismiss();
await zumKader();

// ===== 1) Punkt an der Spielerkarte =====
if(await punktKlick(kader[0])) ok("An der Spielerkarte sitzt ein Punkt für die Leistungsgruppe");
else fail("Kein Punkt an der Karte");
await page.waitForTimeout(1100);
{ const g=await grpVon(kader[0]);
  if(g==="g1") ok(`Ein Tipp setzt die erste Gruppe (${kader[0]} → Leistung)`);
  else fail("Gruppe nicht gesetzt: "+g); }
await punktKlick(kader[0]); await page.waitForTimeout(1000);
{ const g=await grpVon(kader[0]);
  if(g==="g2") ok("Der nächste Tipp schaltet weiter zur zweiten Gruppe");
  else fail("Kein Weiterschalten: "+g); }

// ===== 2+3) Übersicht mit Leibchen =====
if(await klick("🎯 Leistungsgruppen")) ok("Unten gibt es die Übersicht"); else fail("Keine Übersicht");
await page.waitForTimeout(800);
let b=await body();
if(/Zuteilen kannst du oben an der Spielerkarte/.test(b)) ok("Sie erklärt, dass zugeteilt oben wird – der lange Zuteil-Block ist weg");
else fail("Kein Hinweis auf die Karte: "+b.slice(-500).replace(/\n/g," | "));
if(/LEIBCHEN/.test(b)) ok("Jede Gruppe hat eine Leibchenfarbe");
else fail("Kein Leibchen");
if(/OHNE GRUPPE \(8\)/.test(b)) ok("Und sie zeigt, wer noch keiner Gruppe zugeteilt ist (8)");
else fail("Keine Ohne-Gruppe-Liste: "+(b.match(/OHNE GRUPPE[^\n]*/)||[""])[0]);
{ const geklickt=await page.evaluate(()=>{ const b2=[...document.querySelectorAll('button[aria-label="Leibchen Gelb"]')][0];
    if(!b2) return false; b2.click(); return true; });
  await page.waitForTimeout(1100);
  const g=await page.evaluate(()=>{ const d=JSON.parse(localStorage.getItem("vereinsapp_v14")||"null");
    const t=(d.teams||[]).find(x=>x.id==="demo_f1"); return (t&&t.intGroups&&t.intGroups[0])||null; });
  if(geklickt&&g&&g.leib==="gelb") ok("Die Leibchenfarbe lässt sich wechseln (Gelb) und wird gespeichert");
  else fail("Leibchen nicht gespeichert: "+JSON.stringify(g)); }

// ===== 4+5) Mannschaften im Training =====
const trId = await page.evaluate(k=>{
  const d=JSON.parse(localStorage.getItem("vereinsapp_v14")||"null");
  const p=v=>String(v).padStart(2,"0"); const x=new Date(Date.now()+2*86400000);
  // 3 Leistung, 4 Reserve, 2 Entwicklung -> Entwicklung ist zu klein,
  // es muss aus der Reserve nachrücken.
  const zu={}; k.slice(0,3).forEach(n=>zu[n]="g1"); k.slice(3,7).forEach(n=>zu[n]="g2"); k.slice(7,9).forEach(n=>zu[n]="g3");
  (d.playerProfiles||[]).filter(q=>q.mainTid==="demo_f1").forEach(q=>{ if(zu[q.name]) q.intGrp=zu[q.name]; });
  const ev=(d.events||[]).filter(e=>e.cid==="demo"&&e.tid==="demo_f1")[0];
  const ts=new Date().toISOString();
  Object.assign(ev,{ type:"training", date:`${x.getFullYear()}-${p(x.getMonth()+1)}-${p(x.getDate())}`, time:"17:30",
    endTime:"19:00", title:"Training", loc:"Platz", note:"", deadline:null, extraPolls:[], duties:[],
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
if(/Aus den 9 Zusagen/.test(b)) ok("Aus den Zusagen gebildet (9)");
else fail("Zusagen nicht Grundlage");
if(/nachgerückt/.test(b)) ok("Ein Kind ist nachgerückt – die Mannschaften sind ausgeglichen");
else fail("Niemand nachgerückt: "+b.slice(0,500).replace(/\n/g," | "));
{ const hin=await page.evaluate(()=>{ const t=document.body.innerText; const i=t.indexOf("rückt aus");
    return i<0?"":t.slice(Math.max(0,i-40), i+60).replace(/\n/g," "); });
  if(/rückt aus Reserve nach/.test(hin)) ok("Und zwar aus der Reserve: "+hin.trim().slice(0,60));
  else fail("Nicht aus der Reserve: "+hin); }
{ const zahlen=await page.evaluate(()=>{ const t=document.body.innerText; const i=t.indexOf("Mannschaften fürs Spielchen");
    return t.slice(i,i+700); });
  if(/Leistung/.test(zahlen)&&/Reserve/.test(zahlen)&&/Entwicklung/.test(zahlen)) ok("Alle drei Mannschaften stehen da");
  else fail("Nicht alle Mannschaften"); }

if(errors.length){ console.log("JS-FEHLER:"); [...new Set(errors)].forEach(e=>console.log(" -",e.slice(0,150))); }
console.log(errors.length||fails.length?`ERGEBNIS: ${fails.length} Fehlschläge, ${errors.length} JS-Fehler`:"ERGEBNIS: ALLES OK");
await browser.close(); srv.close();
process.exit(errors.length||fails.length?1:0);
