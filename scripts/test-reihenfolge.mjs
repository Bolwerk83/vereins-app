// E2E-Test: Die großen Terminkarten stehen in zeitlicher Reihenfolge.
// Beispiel: heute (Di) war Training, Do ist wieder Training, Sa ist Spiel.
// Dann muss oben Do stehen, danach Sa – und nicht das Spiel vor dem Training.
// Liegt das nächste Spiel weiter hinten, wird es zusätzlich angehängt –
// hinten, damit die Reihenfolge stimmt.
// Aufruf: npm run build && node scripts/test-reihenfolge.mjs
import { chromium } from "playwright-core";
import http from "http"; import fs from "fs"; import path from "path";
const dist = path.resolve("dist");
const srv = http.createServer((req,res)=>{ let p=path.join(dist,req.url.split("?")[0]); if(!fs.existsSync(p)||fs.statSync(p).isDirectory()) p=path.join(dist,"index.html"); res.setHeader("content-type",{".html":"text/html",".js":"text/javascript",".css":"text/css"}[path.extname(p)]||"text/plain"); res.end(fs.readFileSync(p)); }).listen(4315);
const exe=process.env.PLAYWRIGHT_CHROMIUM||"/opt/pw-browsers/chromium-1194/chrome-linux/chrome";
const browser = await chromium.launch({ executablePath:exe, args:["--no-sandbox"] });
const page = await browser.newPage({ viewport:{ width:390, height:1200 } });
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
// Reihenfolge der großen Karten: Überschrift + Titel je Karte
const karten = () => page.evaluate(()=>{
  const t=document.body.innerText;
  const out=[];
  const re=/(ALS NÄCHSTES|DANACH|NÄCHSTES (?:SPIEL|TURNIER|TRAINING|TERMIN)|AUSGEWÄHLT)[^\n]*\n[^\n]*\n?([^\n]*)/g;
  let m; while((m=re.exec(t))) out.push(m[0].replace(/\n/g," / "));
  return out; });
const titelReihe = () => page.evaluate(()=>{
  // Die Titel der großen Karten in der Reihenfolge, wie sie im DOM stehen
  const t=document.body.innerText;
  return ["Training A","Training B","Spiel C"].map(n=>({n,i:t.indexOf(n)})).filter(x=>x.i>=0).sort((a,b)=>a.i-b.i).map(x=>x.n); });

await page.addInitScript(()=>{ if(!localStorage.getItem("vereinsapp_config")) localStorage.setItem("vereinsapp_config", JSON.stringify({url:"https://127.0.0.1:1/x", key:"test"})); });
await page.goto("http://127.0.0.1:4315/", { waitUntil:"networkidle" }); await page.waitForTimeout(2500);
await page.evaluate(()=>{ localStorage.setItem("va_simple","0"); localStorage.setItem("va_tsimple","0");
  sessionStorage.setItem("vereinsapp_v12_session", JSON.stringify({role:"trainer",cid:"demo",tids:["demo_f1"],name:"Demo Trainer",id:"demo_tr1"})); });
await page.reload({waitUntil:"networkidle"}); await page.waitForTimeout(2600); await dismiss();
await page.evaluate(()=>{ const b=[...document.querySelectorAll("button")].find(x=>/Bin dabei/.test(x.innerText)); b&&b.click(); });
await page.waitForTimeout(1500);

// Heute Training (schon vorbei), in 2 Tagen Training, in 4 Tagen Spiel
const kind = await page.evaluate(()=>{
  const d=JSON.parse(localStorage.getItem("vereinsapp_v14")||"null"); if(!d) return null;
  const p=v=>String(v).padStart(2,"0"); const tg=n=>{const x=new Date(Date.now()+n*86400000);return `${x.getFullYear()}-${p(x.getMonth()+1)}-${p(x.getDate())}`;};
  const evs=(d.events||[]).filter(e=>e.cid==="demo"&&e.tid==="demo_f1").sort((a,b)=>String(a.date).localeCompare(String(b.date)));
  const kader=[...new Set([...((d.players||{})["demo_f1"]||[]),
    ...((d.playerProfiles||[]).filter(pp=>pp.mainTid==="demo_f1"&&!pp.archived).map(pp=>pp.name))])];
  const vorlage=evs[0]; if(!vorlage||!kader.length) return null;
  const mach=(id,titel,typ,tage,zeit,ende)=>({...vorlage,id,title:titel,type:typ,date:tg(tage),time:zeit,endTime:ende,
    loc:"Platz",note:"",deadline:null,votes:{},carpoolExtra:false,carpoolEnabled:false,extraPolls:[],duties:[],lineup:null,lineups:null});
  d.events=[...(d.events||[]).filter(e=>!(e.cid==="demo"&&e.tid==="demo_f1")),
    mach("ev_heute","Training Heute","training",0,"08:00","09:30"),   // heute früh – schon vorbei
    mach("ev_a","Training A","training",2,"17:30","19:00"),
    mach("ev_b","Training B","training",3,"17:30","19:00"),
    mach("ev_c","Spiel C","auswarts",4,"10:30","12:00")];
  localStorage.setItem("vereinsapp_v14", JSON.stringify(d));
  return kader[0];
});
if(kind) ok("Testdaten: heute früh Training (vorbei), in 2 und 3 Tagen Training, in 4 Tagen Spiel");
else fail("Konnte die Testdaten nicht setzen");

// ===== Eltern-Ansicht =====
await page.evaluate(k=>{ localStorage.setItem("va_simple","1");
  sessionStorage.setItem("vereinsapp_v12_session", JSON.stringify({role:"user",cid:"demo",tid:"demo_f1",name:k,user:k})); }, kind);
await page.goto("http://127.0.0.1:4315/", { waitUntil:"networkidle" }); await page.waitForTimeout(2800); await dismiss();
let b=await body();
if(!/Training Heute/.test(b)) ok("Das Training von heute früh ist nicht mehr „als nächstes“ – es ist vorbei");
else fail("Vorbeier Termin steht noch oben: "+b.slice(0,260).replace(/\n/g," | "));
{ const reihe=await titelReihe();
  if(JSON.stringify(reihe)===JSON.stringify(["Training A","Training B","Spiel C"]))
    ok("Die Termine stehen in zeitlicher Reihenfolge: "+reihe.join(" → "));
  else fail("Falsche Reihenfolge: "+JSON.stringify(reihe)); }
{ const k2=await karten();
  if(/ALS NÄCHSTES/.test(k2[0]||"")) ok("Der erste heißt „ALS NÄCHSTES“");
  else fail("Erste Karte ohne Reihenfolge-Hinweis: "+JSON.stringify(k2[0]));
  if((k2[1]||"").startsWith("DANACH")) ok("Der zweite heißt „DANACH“ – die Reihe ist ablesbar");
  else fail("Zweite Karte falsch benannt: "+JSON.stringify(k2[1])); }

// ===== Spiel weiter hinten: wird angehängt, nicht vorgezogen =====
await page.evaluate(()=>{
  const d=JSON.parse(localStorage.getItem("vereinsapp_v14"));
  const p=v=>String(v).padStart(2,"0"); const tg=n=>{const x=new Date(Date.now()+n*86400000);return `${x.getFullYear()}-${p(x.getMonth()+1)}-${p(x.getDate())}`;};
  const ev=(d.events||[]).find(e=>e.id==="ev_c"); if(ev) ev.date=tg(12);   // Spiel erst in 12 Tagen
  const extra=(d.events||[]).find(e=>e.id==="ev_b");
  d.events=[...d.events,{...extra,id:"ev_d",title:"Training D",date:tg(5)}];
  localStorage.setItem("vereinsapp_v14", JSON.stringify(d));
});
await page.reload({waitUntil:"networkidle"}); await page.waitForTimeout(2800); await dismiss();
b=await body();
{ const t=b;
  const iA=t.indexOf("Training A"), iB=t.indexOf("Training B"), iD=t.indexOf("Training D"), iC=t.indexOf("Spiel C");
  if(iA>=0&&iB>iA&&iD>iB&&iC>iD) ok("Auch mit drei Trainings davor: das Spiel steht hinten, nicht vorgezogen");
  else fail(`Reihenfolge stimmt nicht (A ${iA}, B ${iB}, D ${iD}, C ${iC})`);
  if(/NÄCHSTES SPIEL/.test(t)) ok("Das Spiel ist trotzdem groß sichtbar – als „NÄCHSTES SPIEL“");
  else fail("Spiel nicht als große Karte sichtbar"); }

// ===== Trainer sieht dasselbe Muster =====
await page.evaluate(()=>{ localStorage.setItem("va_tsimple","1");
  sessionStorage.setItem("vereinsapp_v12_session", JSON.stringify({role:"trainer",cid:"demo",tids:["demo_f1"],name:"Demo Trainer",id:"demo_tr1"})); });
await page.goto("http://127.0.0.1:4315/", { waitUntil:"networkidle" }); await page.waitForTimeout(2800); await dismiss();
b=await body();
{ const iA=b.indexOf("Training A"), iC=b.indexOf("Spiel C");
  if(iA>=0&&iC>iA) ok("Beim Trainer stehen die Termine ebenfalls in der richtigen Reihenfolge");
  else fail(`Trainer-Reihenfolge falsch (A ${iA}, C ${iC})`);
  if(/ALS NÄCHSTES/.test(b)&&/DANACH/.test(b)) ok("Mit denselben Überschriften wie bei den Eltern");
  else fail("Überschriften fehlen beim Trainer: "+b.slice(0,300).replace(/\n/g," | ")); }

if(errors.length){ console.log("JS-FEHLER:"); [...new Set(errors)].forEach(e=>console.log(" -",e.slice(0,150))); }
console.log(errors.length||fails.length?`ERGEBNIS: ${fails.length} Fehlschläge, ${errors.length} JS-Fehler`:"ERGEBNIS: ALLES OK");
await browser.close(); srv.close();
process.exit(errors.length||fails.length?1:0);
