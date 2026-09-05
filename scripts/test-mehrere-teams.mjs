// E2E-Test: Mehrere Mannschaften je Termin (Turnier: G1, G2 …), jede für
// sich auf- und zuklappbar. Ein Kind steht immer nur in einer Mannschaft,
// die Bank sortiert in die gerade offene ein.
// Aufruf: npm run build && node scripts/test-mehrere-teams.mjs
import { chromium } from "playwright-core";
import http from "http"; import fs from "fs"; import path from "path";
const dist = path.resolve("dist");
const srv = http.createServer((req,res)=>{ let p=path.join(dist,req.url.split("?")[0]); if(!fs.existsSync(p)||fs.statSync(p).isDirectory()) p=path.join(dist,"index.html"); res.setHeader("content-type",{".html":"text/html",".js":"text/javascript",".css":"text/css"}[path.extname(p)]||"text/plain"); res.end(fs.readFileSync(p)); }).listen(4299);
const exe=process.env.PLAYWRIGHT_CHROMIUM||"/opt/pw-browsers/chromium-1194/chrome-linux/chrome";
const browser = await chromium.launch({ executablePath:exe, args:["--no-sandbox"] });
const page = await browser.newPage({ viewport:{ width:390, height:900 } });
const errors=[]; const fails=[];
page.on("pageerror", e=>errors.push(e.message));
page.on("dialog", d=>d.accept());
const fail=m=>{ fails.push(m); console.log("FEHLGESCHLAGEN:", m); };
const ok=m=>console.log("OK:", m);
const body=()=>page.evaluate(()=>document.body.innerText);
const dismiss=async()=>{ for(let k=0;k<12;k++){ const done=await page.evaluate(()=>{
  const fx=[...document.querySelectorAll("div")].filter(d=>getComputedStyle(d).position==="fixed"&&d.querySelector("button")&&d.innerText.length>30);
  for(const f of fx){ const b=[...f.querySelectorAll("button")].find(x=>/geht|Los|Verstanden|Alles klar|Fertig|Jetzt nicht|Weiter →|Überspringen|Start/i.test(x.innerText)); if(b){ b.click(); return false; } }
  return true; }); await page.waitForTimeout(400); if(done) break; } };
const klick=(re)=>page.evaluate(r=>{
  const b=[...document.querySelectorAll("button")].find(x=>new RegExp(r).test((x.innerText||"").trim()));
  if(!b) return false; b.click(); return true; }, re instanceof RegExp?re.source:re);
const evLesen=()=>page.evaluate(()=>{
  const d=JSON.parse(localStorage.getItem("vereinsapp_v14")||"null");
  const ev=(d.events||[]).filter(e=>e.cid==="demo"&&e.tid==="demo_f1").sort((a,b)=>String(a.date).localeCompare(String(b.date)))[0];
  return ev?{lineups:ev.lineups||null, lineup:ev.lineup||null}:null; });
// Bank-Knopf "A" (Abwehr) beim ersten Spieler der Bank
const bankKlick=(name,pos)=>page.evaluate(({n,p})=>{
  const zeilen=[...document.querySelectorAll("div")].filter(d=>(d.innerText||"").includes(n)&&d.querySelectorAll("button").length>=4&&(d.innerText||"").replace(/\s+/g," ").trim().length<60);
  const z=zeilen[zeilen.length-1]; if(!z) return false;
  const b=[...z.querySelectorAll("button")].find(x=>(x.innerText||"").trim()===p); if(!b) return false; b.click(); return true; },{n:name,p:pos});

await page.addInitScript(()=>{ if(!localStorage.getItem("vereinsapp_config")) localStorage.setItem("vereinsapp_config", JSON.stringify({url:"https://127.0.0.1:1/x", key:"test"})); });
await page.goto("http://127.0.0.1:4299/", { waitUntil:"networkidle" }); await page.waitForTimeout(2500);
await page.evaluate(()=>{ localStorage.setItem("va_simple","0"); localStorage.setItem("va_tsimple","0");
  sessionStorage.setItem("vereinsapp_v12_session", JSON.stringify({role:"trainer",cid:"demo",tids:["demo_f1"],name:"Demo Trainer",id:"demo_tr1"})); });
await page.reload({waitUntil:"networkidle"}); await page.waitForTimeout(2600); await dismiss();
await page.evaluate(()=>{ const b=[...document.querySelectorAll("button")].find(x=>/Bin dabei/.test(x.innerText)); b&&b.click(); });
await page.waitForTimeout(1500);

const kader = await page.evaluate(()=>{
  const d=JSON.parse(localStorage.getItem("vereinsapp_v14")||"null"); if(!d) return null;
  const p=v=>String(v).padStart(2,"0"); const tg=n=>{const x=new Date(Date.now()+n*86400000);return `${x.getFullYear()}-${p(x.getMonth()+1)}-${p(x.getDate())}`;};
  const evs=(d.events||[]).filter(e=>e.cid==="demo"&&e.tid==="demo_f1").sort((a,b)=>String(a.date).localeCompare(String(b.date)));
  if(!evs.length) return null;
  const k=[...new Set([...((d.players||{})["demo_f1"]||[]),
    ...((d.playerProfiles||[]).filter(pp=>pp.mainTid==="demo_f1"&&!pp.archived).map(pp=>pp.name))])];
  if(k.length<3) return null;
  const ts=new Date().toISOString();
  Object.assign(evs[0],{ type:"turnier", date:tg(2), time:"09:30", endTime:"12:00", title:"Kinderfestival",
    loc:"Halle", note:"", deadline:null, carpoolExtra:false, carpoolEnabled:false, extraPolls:[], duties:[],
    votes:Object.fromEntries(k.map(n=>[n,{val:"yes",ts,role:"player"}])), lineup:null, lineups:null });
  evs.slice(1).forEach(e=>{ e.date=tg(12); });
  localStorage.setItem("vereinsapp_v14", JSON.stringify(d));
  return k;
});
if(kader) ok(`Turnier mit ${kader.length} Zusagen angelegt`); else fail("Konnte das Turnier nicht anlegen");
await page.reload({waitUntil:"networkidle"}); await page.waitForTimeout(2800); await dismiss();
await page.evaluate(()=>{ const b=[...document.querySelectorAll("button")].find(x=>/^(Ansehen|✅ Anwesenheit)$/.test((x.innerText||"").trim())); b&&b.click(); });
await page.waitForTimeout(1500);
await page.evaluate(()=>{ const b=[...document.querySelectorAll("button")].find(x=>/^(⚽ Aufstellung|Aufstellung)$/.test((x.innerText||"").trim())); b&&b.click(); });
await page.waitForTimeout(1000);
let b=await body();
if(/Team 1/.test(b)) ok("Die erste Mannschaft heißt „Team 1“"); else fail("Kein Team-Block: "+b.slice(0,300).replace(/\n/g," | "));
if(/＋ Weitere Mannschaft/.test(b)) ok("Es gibt einen Knopf für weitere Mannschaften"); else fail("Kein Knopf „Weitere Mannschaft“");

// ===== 1) Ersten Spieler in Team 1 stellen =====
{ const geklickt=await bankKlick(kader[0],"A");
  await page.waitForTimeout(1200);
  const ev=await evLesen();
  if(geklickt&&ev&&ev.lineups&&ev.lineups[0]&&(ev.lineups[0].A||[]).includes(kader[0]))
    ok(`${kader[0]} steht in Team 1 (Abwehr)`);
  else fail("Nicht in Team 1 gelandet: "+JSON.stringify(ev)); }

// ===== 2) Zweite Mannschaft anlegen =====
await klick("Weitere Mannschaft"); await page.waitForTimeout(1200);
{ const ev=await evLesen();
  if(ev&&ev.lineups&&ev.lineups.length===2) ok("Eine zweite Mannschaft ist angelegt: "+ev.lineups.map(t=>t.name).join(", "));
  else fail("Zweite Mannschaft fehlt: "+JSON.stringify(ev)); }
b=await body();
if(/Team 2/.test(b)) ok("Sie heißt „Team 2“"); else fail("Kein Team 2 sichtbar");
if(/→ in „Team 2“/.test(b)) ok("Die Bank sagt, wohin sie einsortiert: „→ in Team 2“");
else fail("Kein Hinweis, wohin die Bank einsortiert: "+b.slice(0,300).replace(/\n/g," | "));

// ===== 3) Spieler in Team 2 stellen =====
{ const geklickt=await bankKlick(kader[1],"S");
  await page.waitForTimeout(1200);
  const ev=await evLesen();
  const t2=ev&&ev.lineups&&ev.lineups[1];
  if(geklickt&&t2&&(t2.S||[]).includes(kader[1])) ok(`${kader[1]} steht in Team 2 (Angriff)`);
  else fail("Nicht in Team 2 gelandet: "+JSON.stringify(ev)); }
{ const ev=await evLesen();
  const alle=(ev.lineups||[]).flatMap(t=>[...(t.T||[]),...(t.A||[]),...(t.M||[]),...(t.S||[])]);
  if(alle.filter(n=>n===kader[0]).length===1&&alle.filter(n=>n===kader[1]).length===1)
    ok("Jedes Kind steht genau einmal – über beide Mannschaften hinweg");
  else fail("Doppelte Einträge: "+JSON.stringify(alle)); }

// ===== 4) Zuklappen und wieder aufklappen =====
{ const vorher=await body();
  await page.evaluate(()=>{ const l=[...document.querySelectorAll("div")].filter(x=>/^▾ Team 2/.test((x.innerText||"").trim().replace(/\s+/g," "))); const d=l[l.length-1]; d&&d.click(); });
  await page.waitForTimeout(700);
  const b2=await body();
  if(/▸ Team 2|▸\s*Team 2/.test(b2.replace(/\n/g," "))) ok("Team 2 lässt sich zuklappen");
  else fail("Team 2 nicht zugeklappt: "+b2.slice(b2.indexOf("Team 1"),b2.indexOf("Team 1")+220).replace(/\n/g," | "));
  await page.evaluate(()=>{ const l=[...document.querySelectorAll("div")].filter(x=>/^▸ Team 2/.test((x.innerText||"").trim().replace(/\s+/g," "))); const d=l[l.length-1]; d&&d.click(); });
  await page.waitForTimeout(700);
  const b3=await body();
  if(/ABWEHR|ANGRIFF/.test(b3)) ok("Und wieder aufklappen"); else fail("Team 2 nicht wieder offen"); }

// ===== 5) Mannschaft entfernen =====
{ const geklickt=await page.evaluate(()=>{
    const l=[...document.querySelectorAll("div")].filter(x=>/^[▾▸]\s*Team 2/.test((x.innerText||"").trim().replace(/\s+/g," "))); const kopf=l[l.length-1];
    if(!kopf) return false; const b=[...kopf.querySelectorAll("button")].find(x=>(x.innerText||"").trim()==="🗑"); if(!b) return false; b.click(); return true; });
  await page.waitForTimeout(1200);
  const ev=await evLesen();
  if(geklickt&&ev&&ev.lineups&&ev.lineups.length===1) ok("Eine Mannschaft lässt sich wieder entfernen");
  else fail("Entfernen klappt nicht: "+JSON.stringify(ev&&ev.lineups&&ev.lineups.length)); }

// ===== 6) Alte Termine ohne "lineups" bleiben lesbar =====
{ const ev=await evLesen();
  if(ev&&ev.lineup&&(ev.lineup.A||[]).includes(kader[0]))
    ok("Die erste Mannschaft wird weiter als ev.lineup gespiegelt – Spieltag-Zettel und Gäste-Ansicht bleiben heil");
  else fail("ev.lineup nicht gespiegelt: "+JSON.stringify(ev&&ev.lineup)); }

if(errors.length){ console.log("JS-FEHLER:"); [...new Set(errors)].forEach(e=>console.log(" -",e.slice(0,150))); }
console.log(errors.length||fails.length?`ERGEBNIS: ${fails.length} Fehlschläge, ${errors.length} JS-Fehler`:"ERGEBNIS: ALLES OK");
await browser.close(); srv.close();
process.exit(errors.length||fails.length?1:0);
