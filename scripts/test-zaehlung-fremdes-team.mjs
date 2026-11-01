// E2E-Test: Kinder aus einer anderen Mannschaft dürfen nicht mitgezählt werden.
// Gemeldet: „Beim Termin morgen in der f2 zählt er falsch." Nachgesehen:
// Zwei Kinder, die inzwischen in der F3 sind, hatten in F2-Terminen
// zugesagt – ihre Eltern waren mit der alten Mannschaft angemeldet. Die
// Stimmen tragen role:"player" und wurden deshalb voll mitgezählt: 17
// Zusagen statt 15.
//   1. Die Terminkarte zählt nur Kinder der eigenen Mannschaft.
//   2. In den Rückmeldungen stimmt die Kachel „Spieler dabei".
//   3. Gäste und Aushilfen OHNE Profil zählen weiter mit.
//   4. Ein Kind, das als Aushilfe für diese Mannschaft hinterlegt ist, zählt mit.
//   5. Die Stimme verschwindet nicht – sie steht nur nicht mehr in der Zahl.
// Aufruf: npm run build && node scripts/test-zaehlung-fremdes-team.mjs
import { chromium } from "playwright-core";
import http from "http"; import fs from "fs"; import path from "path";
const dist = path.resolve("dist");
const srv = http.createServer((req,res)=>{ let p=path.join(dist,req.url.split("?")[0]); if(!fs.existsSync(p)||fs.statSync(p).isDirectory()) p=path.join(dist,"index.html"); res.setHeader("content-type",{".html":"text/html",".js":"text/javascript",".css":"text/css"}[path.extname(p)]||"text/plain"); res.end(fs.readFileSync(p)); }).listen(4347);
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
await page.goto("http://127.0.0.1:4347/", { waitUntil:"networkidle" }); await page.waitForTimeout(2500);
await page.evaluate(()=>{ sessionStorage.setItem("vereinsapp_v12_session", JSON.stringify({role:"trainer",cid:"demo",tids:["demo_f1"],name:"Demo Trainer",id:"demo_tr1"})); });
await page.reload({waitUntil:"networkidle"}); await page.waitForTimeout(2600); await dismiss();
await page.evaluate(()=>{ const b=[...document.querySelectorAll("button")].find(x=>/Bin dabei/.test(x.innerText)); b&&b.click(); });
await page.waitForTimeout(1400);

// Lage wie im Verein: 4 eigene Kinder sagen zu, dazu ein Kind aus einer
// anderen Mannschaft, eine Aushilfe MIT Profil für diese Mannschaft und ein
// Gast ohne Profil.
const setup = await page.evaluate(()=>{
  const d=JSON.parse(localStorage.getItem("vereinsapp_v14")||"null");
  const z=x=>String(x).padStart(2,"0");
  const x=new Date(); x.setHours(12,0,0,0); x.setDate(x.getDate()+1);
  const t2={ id:"demo_f9", cid:"demo", name:"F-Jugend 9", icon:"F9", col:"#7c3aed", pub:true, pwd:"x", cat:"F-Jugend", years:"" };
  d.teams=[...(d.teams||[]).filter(t=>t.id!=="demo_f9"), t2];
  const eigene=(d.playerProfiles||[]).filter(p=>p.mainTid==="demo_f1"&&!p.archived).map(p=>p.name).slice(0,4);
  // Kind, das die Mannschaft gewechselt hat
  d.playerProfiles=[...(d.playerProfiles||[]).filter(p=>!["pp_weg","pp_aus"].includes(p.id)),
    { id:"pp_weg", cid:"demo", archived:false, name:"Weg Gewechselt", by:2017, gender:"m",
      mainTid:"demo_f9", optTids:[], friends:[], mustWith:[] },
    // Aushilfe: Hauptmannschaft F9, aber ausdruecklich auch fuer F1 hinterlegt
    { id:"pp_aus", cid:"demo", archived:false, name:"Aus Hilfe", by:2017, gender:"m",
      mainTid:"demo_f9", optTids:["demo_f1"], friends:[], mustWith:[] }];
  const ev=(d.events||[]).filter(e=>e.cid==="demo"&&e.tid==="demo_f1")[0];
  const ts=new Date().toISOString();
  Object.assign(ev,{ type:"training", date:`${x.getFullYear()}-${z(x.getMonth()+1)}-${z(x.getDate())}`,
    time:"17:30", endTime:"19:00", title:"Training morgen", deadline:null, present:{},
    spielFest:null, lineup:null, lineups:null,
    guests:["Gast Ohneprofil"],
    votes:{ ...Object.fromEntries(eigene.map(n=>[n,{val:"yes",ts,role:"player"}])),
      "Weg Gewechselt":{val:"yes",ts,role:"player"},
      "Aus Hilfe":{val:"yes",ts,role:"player"},
      "Gast Ohneprofil":{val:"yes",ts,role:"player"} } });
  (d.events||[]).filter(e=>e.cid==="demo"&&e.id!==ev.id).forEach(e=>{ const y=new Date(); y.setDate(y.getDate()+50);
    e.date=`${y.getFullYear()}-${z(y.getMonth()+1)}-${z(y.getDate())}`; });
  localStorage.setItem("vereinsapp_v14", JSON.stringify(d));
  return { eigene, evId:ev.id };
});
if(setup) ok(`${setup.eigene.length} eigene Zusagen + 1 aus anderer Mannschaft + 1 Aushilfe + 1 Gast = 7 Antworten`);
else { fail("Testdaten nicht gesetzt"); process.exit(1); }
await page.reload({waitUntil:"networkidle"}); await page.waitForTimeout(2800); await dismiss();

// ===== 1) Terminkarte =====
let b=await body();
{ const m=b.match(/✓ (\d+) Spieler/);
  // Erwartet: 4 eigene + Aushilfe (fuer diese Mannschaft hinterlegt) + Gast = 6
  if(m&&m[1]==="6") ok("Die Terminkarte zählt 6 – ohne das Kind der anderen Mannschaft");
  else fail("Terminkarte zählt falsch: "+(m?m[1]:"(kein Zähler)")+" statt 6"); }

// ===== 2) Rückmeldungen =====
await page.evaluate(()=>{ const x=[...document.querySelectorAll("button")].find(y=>/^(Ansehen|✅ Anwesenheit)$/.test((y.innerText||"").trim())); x&&x.click(); });
await page.waitForTimeout(1800);
const fenster=()=>page.evaluate(()=>{
  const fx=[...document.querySelectorAll("div")].filter(d=>getComputedStyle(d).position==="fixed"&&(d.innerText||"").length>200);
  const f=fx.find(d=>/Spieler dabei/.test(d.innerText||""));
  return f?(f.innerText||""):""; });
b=await fenster();
{ const i=b.indexOf("Spieler dabei");
  const vor=(b.slice(0,i).trim().split(/\s+/).pop())||"";
  if(vor==="6") ok("Die Kachel „Spieler dabei“ zeigt ebenfalls 6");
  else fail("Kachel zeigt "+vor+" statt 6"); }

// ===== 3+4) Gast und Aushilfe zählen mit =====
{ if(/Gast Ohneprofil/.test(b)) ok("Der Gast ohne Profil steht weiter in der Liste");
  else fail("Gast fehlt: "+kurz(b));
  if(/Aus Hilfe/.test(b)) ok("Die Aushilfe mit Zweitmannschaft ebenfalls");
  else fail("Aushilfe fehlt"); }

// ===== 5) Die Stimme ist nicht verschwunden =====
{ if(/Weg Gewechselt/.test(b)) ok("Das Kind der anderen Mannschaft steht weiter da – nichts verschwindet heimlich");
  else fail("Stimme wurde unterschlagen: "+kurz(b));
  const v=await page.evaluate(i=>{ const d=JSON.parse(localStorage.getItem("vereinsapp_v14")||"null");
    const e=(d.events||[]).find(x=>x.id===i); return Object.keys(e.votes||{}).length; }, setup.evId);
  if(v===7) ok("Alle 7 Antworten sind in den Daten erhalten");
  else fail("Antworten verändert: "+v); }
{ if(/keinem Kind im Kader|andere Mannschaft|NICHT IM KADER/.test(b))
    ok("Und es ist als nicht zugehörig gekennzeichnet");
  else fail("Keine Kennzeichnung: "+kurz(b)); }

if(errors.length){ console.log("JS-FEHLER:"); [...new Set(errors)].forEach(e=>console.log(" -",e.slice(0,150))); }
console.log(errors.length||fails.length?`ERGEBNIS: ${fails.length} Fehlschläge, ${errors.length} JS-Fehler`:"ERGEBNIS: ALLES OK");
await browser.close(); srv.close();
process.exit(errors.length||fails.length?1:0);
