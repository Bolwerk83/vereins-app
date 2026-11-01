// E2E-Test: Kind wechselt die Mannschaft – was sehen die Eltern?
// Gemeldet: Aiden ist von der F2 in die F3 umgezogen, seine Mutter bekam
// aber weiter die alten F2-Termine. Grund: Die Mannschaft steckt in der
// ANMELDUNG auf dem Gerät, nicht im Profil – und die blieb auf der F2.
//   1. Die Eltern sehen nach dem Wechsel die Termine der NEUEN Mannschaft.
//   2. Die Termine der alten Mannschaft sind weg.
//   3. Die Anmeldung auf dem Gerät wird dauerhaft nachgezogen.
//   4. Eine Zweitmannschaft (Aushilfe) wird NICHT angefasst.
//   5. Umbenennen und Mannschaftswechsel zusammen klappen auch.
// Aufruf: npm run build && node scripts/test-team-wechsel-eltern.mjs
import { chromium } from "playwright-core";
import http from "http"; import fs from "fs"; import path from "path";
const dist = path.resolve("dist");
const srv = http.createServer((req,res)=>{ let p=path.join(dist,req.url.split("?")[0]); if(!fs.existsSync(p)||fs.statSync(p).isDirectory()) p=path.join(dist,"index.html"); res.setHeader("content-type",{".html":"text/html",".js":"text/javascript",".css":"text/css"}[path.extname(p)]||"text/plain"); res.end(fs.readFileSync(p)); }).listen(4339);
// Chromium-Pfad nicht festnageln: der Container hat die Version schon
// zweimal gewechselt (1194 -> 1243, dazu anderer Unterordner) und dann
// scheitert JEDER Test am Start. Erster Treffer gewinnt.
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
const kurz=t=>String(t).slice(0,340).replace(/\n/g," | ");
const dismiss=async()=>{ for(let k=0;k<12;k++){ const done=await page.evaluate(()=>{
  const fx=[...document.querySelectorAll("div")].filter(d=>getComputedStyle(d).position==="fixed"&&d.querySelector("button")&&d.innerText.length>30);
  for(const f of fx){ const b=[...f.querySelectorAll("button")].find(x=>/geht|Los|Verstanden|Alles klar|Fertig|Jetzt nicht|Weiter →|Überspringen|Start/i.test(x.innerText)); if(b){ b.click(); return false; } }
  return true; }); await page.waitForTimeout(400); if(done) break; } };
const sitzung=()=>page.evaluate(()=>{ try{ return JSON.parse(sessionStorage.getItem("vereinsapp_v12_session")||"null"); }catch{ return null; } });

await page.addInitScript(()=>{
  if(!localStorage.getItem("vereinsapp_config")) localStorage.setItem("vereinsapp_config", JSON.stringify({url:"https://127.0.0.1:1/x", key:"test"}));
  if(localStorage.getItem("va_simple")===null)  localStorage.setItem("va_simple","1");
  if(localStorage.getItem("va_tsimple")===null) localStorage.setItem("va_tsimple","0");
});
await page.goto("http://127.0.0.1:4339/", { waitUntil:"networkidle" }); await page.waitForTimeout(2500);
await page.evaluate(()=>{ sessionStorage.setItem("vereinsapp_v12_session", JSON.stringify({role:"trainer",cid:"demo",tids:["demo_f1"],name:"Demo Trainer",id:"demo_tr1"})); });
await page.reload({waitUntil:"networkidle"}); await page.waitForTimeout(2600); await dismiss();
await page.evaluate(()=>{ const b=[...document.querySelectorAll("button")].find(x=>/Bin dabei/.test(x.innerText)); b&&b.click(); });
await page.waitForTimeout(1400);

// Zwei Mannschaften mit je eigenen Terminen. Ein Kind wechselt.
const setup = await page.evaluate(()=>{
  const d=JSON.parse(localStorage.getItem("vereinsapp_v14")||"null");
  const z=x=>String(x).padStart(2,"0");
  const tg=n=>{ const x=new Date(); x.setHours(12,0,0,0); x.setDate(x.getDate()+n);
    return `${x.getFullYear()}-${z(x.getMonth()+1)}-${z(x.getDate())}`; };
  const t2={ id:"demo_f9", cid:"demo", name:"F-Jugend 9", icon:"F9", col:"#7c3aed", pub:true, pwd:"x", cat:"F-Jugend", years:"" };
  d.teams=[...(d.teams||[]).filter(t=>t.id!=="demo_f9"), t2];
  const kind=(d.playerProfiles||[]).filter(p=>p.mainTid==="demo_f1"&&!p.archived)[0];
  const vorlage=(d.events||[]).filter(e=>e.cid==="demo"&&e.tid==="demo_f1")[0];
  // Alte Termine der F1 und neue der F9 - klar unterscheidbare Titel
  const mk=(id,tid,titel,tage)=>({...vorlage, id, tid, title:titel, type:"training",
    date:tg(tage), time:"17:30", endTime:"19:00", deadline:null, votes:{}, present:{},
    lineup:null, lineups:null, extraPolls:[], duties:[] });
  d.events=[...(d.events||[]).filter(e=>e.cid!=="demo"),
    mk("ev_alt1","demo_f1","Training ALTE Mannschaft",3),
    mk("ev_alt2","demo_f1","Spiel ALTE Mannschaft",5),
    mk("ev_neu1","demo_f9","Training NEUE Mannschaft",4),
    mk("ev_neu2","demo_f9","Spiel NEUE Mannschaft",6)];
  localStorage.setItem("vereinsapp_v14", JSON.stringify(d));
  return { kind:kind.name, pid:kind.id };
});
if(setup) ok(`Ausgangslage: „${setup.kind}“ ist in der alten Mannschaft, beide Mannschaften haben Termine`);
else { fail("Testdaten nicht gesetzt"); process.exit(1); }

// Die Eltern melden sich an – Anmeldung trägt die ALTE Mannschaft
const alsEltern=async()=>{
  await page.evaluate(k=>{ sessionStorage.setItem("vereinsapp_v12_session",
    JSON.stringify({role:"user",cid:"demo",tid:"demo_f1",user:k,name:k})); }, setup.kind);
  await page.reload({waitUntil:"networkidle"}); await page.waitForTimeout(2800); await dismiss();
};
await alsEltern();
let b=await body();
if(/ALTE Mannschaft/.test(b)) ok("Vor dem Wechsel sehen die Eltern die Termine ihrer Mannschaft");
else fail("Keine Termine sichtbar: "+kurz(b));

// ===== Das Kind wechselt die Mannschaft =====
await page.evaluate(pid=>{ const d=JSON.parse(localStorage.getItem("vereinsapp_v14")||"null");
  d.playerProfiles=(d.playerProfiles||[]).map(p=>p.id===pid?{...p, mainTid:"demo_f9", optTids:[]}:p);
  localStorage.setItem("vereinsapp_v14", JSON.stringify(d)); }, setup.pid);
await page.reload({waitUntil:"networkidle"}); await page.waitForTimeout(3000); await dismiss();

// ===== 1+2) Neue Termine da, alte weg =====
b=await body();
if(/NEUE Mannschaft/.test(b)) ok("Nach dem Wechsel stehen die Termine der neuen Mannschaft da");
else fail("Neue Termine fehlen – genau der gemeldete Fehler: "+kurz(b));
if(!/ALTE Mannschaft/.test(b)) ok("Und die Termine der alten Mannschaft sind weg");
else fail("Alte Termine stehen noch da: "+kurz(b));
if(/F-Jugend 9/.test(b)) ok("Im Kopf steht die neue Mannschaft");
else fail("Falsche Mannschaft im Kopf: "+kurz(b));

// ===== 3) Anmeldung dauerhaft nachgezogen =====
{ const s=await sitzung();
  if(s&&s.tid==="demo_f9") ok("Die Anmeldung auf dem Gerät ist auf die neue Mannschaft gezogen");
  else fail("Anmeldung bleibt auf der alten Mannschaft: "+JSON.stringify(s&&s.tid)); }

// ===== 4) Zweitmannschaft wird nicht angefasst =====
// Kind hilft in der alten Mannschaft aus: dann darf die Anmeldung dort bleiben.
await page.evaluate(pid=>{ const d=JSON.parse(localStorage.getItem("vereinsapp_v14")||"null");
  d.playerProfiles=(d.playerProfiles||[]).map(p=>p.id===pid?{...p, mainTid:"demo_f9", optTids:["demo_f1"]}:p);
  localStorage.setItem("vereinsapp_v14", JSON.stringify(d)); }, setup.pid);
await page.evaluate(k=>{ sessionStorage.setItem("vereinsapp_v12_session",
  JSON.stringify({role:"user",cid:"demo",tid:"demo_f1",user:k,name:k})); }, setup.kind);
await page.reload({waitUntil:"networkidle"}); await page.waitForTimeout(3000); await dismiss();
{ const s=await sitzung();
  if(s&&s.tid==="demo_f1") ok("Als Aushilfe in der alten Mannschaft bleibt die Anmeldung dort – nichts wird überfahren");
  else fail("Aushilfe-Anmeldung wurde verschoben: "+JSON.stringify(s&&s.tid)); }

// ===== 5) Umbenannt UND gewechselt =====
await page.evaluate(([pid,alt])=>{ const d=JSON.parse(localStorage.getItem("vereinsapp_v14")||"null");
  d.playerProfiles=(d.playerProfiles||[]).map(p=>p.id===pid
    ? {...p, name:"Neuer Name T.", prevNames:[alt], mainTid:"demo_f9", optTids:[]} : p);
  localStorage.setItem("vereinsapp_v14", JSON.stringify(d)); }, [setup.pid, setup.kind]);
await page.evaluate(k=>{ sessionStorage.setItem("vereinsapp_v12_session",
  JSON.stringify({role:"user",cid:"demo",tid:"demo_f1",user:k,name:k})); }, setup.kind);
await page.reload({waitUntil:"networkidle"}); await page.waitForTimeout(3000); await dismiss();
{ const s=await sitzung();
  if(s&&s.user==="Neuer Name T.") ok("Umbenannt und gewechselt: der Name zieht mit");
  else fail("Name nicht nachgezogen: "+JSON.stringify(s&&s.user));
  if(s&&s.tid==="demo_f9") ok("Und die Mannschaft ebenfalls");
  else fail("Mannschaft nicht nachgezogen: "+JSON.stringify(s&&s.tid)); }
b=await body();
if(/NEUE Mannschaft/.test(b)&&!/ALTE Mannschaft/.test(b)) ok("Die Eltern sehen die richtigen Termine");
else fail("Falsche Termine: "+kurz(b));

if(errors.length){ console.log("JS-FEHLER:"); [...new Set(errors)].forEach(e=>console.log(" -",e.slice(0,150))); }
console.log(errors.length||fails.length?`ERGEBNIS: ${fails.length} Fehlschläge, ${errors.length} JS-Fehler`:"ERGEBNIS: ALLES OK");
await browser.close(); srv.close();
process.exit(errors.length||fails.length?1:0);
