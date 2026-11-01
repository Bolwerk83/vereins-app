// E2E-Test: Hinweise muessen sich wegklicken lassen und von allein verschwinden.
// Gemeldet: „Kurzfristig Rückmeldung Fenster will ich nicht sehen. Ich kann es
// auch nicht wegklicken" und „Nach Frist zwei Änderungen Meldung oben soll
// auch weg, wenn ich oder jemand drauf reagiert hat."
//   1. Der Kurzfristig-Kasten hat je Termin ein ✕ – nur dieser Termin geht weg.
//   2. Das ✕ im Kopf blendet den ganzen Kasten aus.
//   3. Ausgeblendet bleibt ausgeblendet – auch nach dem Neuladen.
//   4. Ein NEUER kurzfristiger Termin bringt den Hinweis wieder.
//   5. „Nach Frist: 1 Änderung offen" steht oben, solange niemand reagiert hat.
//   6. Nach dem Bestätigen im Termin ist die Meldung weg.
// Aufruf: npm run build && node scripts/test-nachfassen-weg.mjs
import { chromium } from "playwright-core";
import http from "http"; import fs from "fs"; import path from "path";
const dist = path.resolve("dist");
const srv = http.createServer((req,res)=>{ let p=path.join(dist,req.url.split("?")[0]); if(!fs.existsSync(p)||fs.statSync(p).isDirectory()) p=path.join(dist,"index.html"); res.setHeader("content-type",{".html":"text/html",".js":"text/javascript",".css":"text/css"}[path.extname(p)]||"text/plain"); res.end(fs.readFileSync(p)); }).listen(4349);
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
// Der Kurzfristig-Kasten als DOM-Knoten: nur dort suchen, nicht im ganzen Body
// (der enthaelt auch Ausgeklapptes und Verstecktes).
const KASTEN=`(()=>{ const a=[...document.querySelectorAll("div")]
  .filter(x=>/Kurzfristig – Rückmeldungen fehlen/.test(x.innerText||"")&&/In die Eltern-Gruppe/.test(x.innerText||""));
  return a.sort((p,q)=>(p.innerText||"").length-(q.innerText||"").length)[0]||null; })()`;
const kasten=()=>page.evaluate(`(()=>{ const d=${KASTEN}; return d?(d.innerText||""):""; })()`);

await page.addInitScript(()=>{
  if(!localStorage.getItem("vereinsapp_config")) localStorage.setItem("vereinsapp_config", JSON.stringify({url:"https://127.0.0.1:1/x", key:"test"}));
  if(localStorage.getItem("va_simple")===null)  localStorage.setItem("va_simple","0");
  if(localStorage.getItem("va_tsimple")===null) localStorage.setItem("va_tsimple","0");
});
await page.goto("http://127.0.0.1:4349/", { waitUntil:"networkidle" }); await page.waitForTimeout(2500);
await page.evaluate(()=>{ sessionStorage.setItem("vereinsapp_v12_session", JSON.stringify({role:"trainer",cid:"demo",tids:["demo_f1"],name:"Demo Trainer",id:"demo_tr1"})); });
await page.reload({waitUntil:"networkidle"}); await page.waitForTimeout(2600); await dismiss();
await page.evaluate(()=>{ const b=[...document.querySelectorAll("button")].find(x=>/Bin dabei/.test(x.innerText)); b&&b.click(); });
await page.waitForTimeout(1400);

// Zwei kurzfristige Termine ohne Rueckmeldungen - genau die Lage, in der der
// Kasten aufgeht.
const setup = await page.evaluate(()=>{
  const d=JSON.parse(localStorage.getItem("vereinsapp_v14")||"null");
  const z=x=>String(x).padStart(2,"0");
  const tag=n=>{ const x=new Date(); x.setHours(12,0,0,0); x.setDate(x.getDate()+n);
    return `${x.getFullYear()}-${z(x.getMonth()+1)}-${z(x.getDate())}`; };
  const vorlage=(d.events||[]).filter(e=>e.cid==="demo"&&e.tid==="demo_f1")[0];
  const mk=(id,titel,tage)=>({...vorlage, id, tid:"demo_f1", cid:"demo", title:titel, type:"training",
    pt:"att", date:tag(tage), time:"17:30", endTime:"19:00", deadline:null, votes:{}, present:{},
    createdAt:new Date().toISOString(), lineup:null, lineups:null, extraPolls:[], duties:[],
    lateCancellations:null, sollPlayers:0, nudgeOff:false });
  d.events=[...(d.events||[]).filter(e=>e.cid!=="demo"), mk("ev_k1","Kurzfristig EINS",2), mk("ev_k2","Kurzfristig ZWEI",3)];
  localStorage.setItem("vereinsapp_v14", JSON.stringify(d));
  return { n:(d.playerProfiles||[]).filter(p=>p.mainTid==="demo_f1"&&!p.archived).length };
});
if(setup&&setup.n>0) ok(`Ausgangslage: zwei kurzfristige Termine, ${setup.n} Kinder, keine Rückmeldung`);
else { fail("Testdaten nicht gesetzt"); process.exit(1); }
await page.reload({waitUntil:"networkidle"}); await page.waitForTimeout(2900); await dismiss();

// ===== 1) Der Kasten ist da und hat ein ✕ je Termin =====
let k=await kasten();
if(/Kurzfristig EINS/.test(k)&&/Kurzfristig ZWEI/.test(k)) ok("Der Kurzfristig-Kasten zeigt beide Termine");
else fail("Kasten fehlt oder unvollständig: "+kurz(k||await body()));

// ✕ der ersten Zeile: zaehlt die Ausblenden-Knoepfe im Kasten
const xKnoepfe=()=>page.evaluate(`(()=>{ const d=${KASTEN}; if(!d) return [];
  return [...d.querySelectorAll("button")].map(b=>(b.title||"")).filter(t=>/ausblenden/i.test(t)); })()`);
{ const t=await xKnoepfe();
  if(t.length>=3) ok(`Es gibt ${t.length} Ausblenden-Knöpfe: einen im Kopf und einen je Termin`);
  else fail("Zu wenige Ausblenden-Knöpfe: "+JSON.stringify(t)); }

await page.evaluate(`(()=>{ const d=${KASTEN};
  const b=[...d.querySelectorAll("button")].find(x=>/Für diesen Termin ausblenden/i.test(x.title||""));
  b&&b.click(); })()`);
await page.waitForTimeout(1500);
k=await kasten();
if(!/Kurzfristig EINS/.test(k)&&/Kurzfristig ZWEI/.test(k)) ok("Nach dem ✕ ist nur dieser Termin weg – der andere bleibt");
else fail("Einzelnes Ausblenden hat nicht gegriffen: "+kurz(k));

// ===== 2) ✕ im Kopf blendet alles aus =====
await page.evaluate(`(()=>{ const d=${KASTEN};
  const b=[...d.querySelectorAll("button")].find(x=>/^Hinweis ausblenden$/i.test(x.title||""));
  b&&b.click(); })()`);
await page.waitForTimeout(1500);
k=await kasten();
if(!k) ok("Das ✕ im Kopf blendet den ganzen Kasten aus");
else fail("Kasten steht noch da: "+kurz(k));

// ===== 3) Auch nach dem Neuladen =====
await page.reload({waitUntil:"networkidle"}); await page.waitForTimeout(2900); await dismiss();
k=await kasten();
if(!k) ok("Nach dem Neuladen bleibt er ausgeblendet – nicht nur bis zum nächsten Öffnen");
else fail("Nach dem Neuladen wieder da: "+kurz(k));

// ===== 4) Ein NEUER kurzfristiger Termin kommt wieder durch =====
await page.evaluate(()=>{
  const d=JSON.parse(localStorage.getItem("vereinsapp_v14")||"null");
  const z=x=>String(x).padStart(2,"0");
  const x=new Date(); x.setHours(12,0,0,0); x.setDate(x.getDate()+4);
  const v=(d.events||[]).find(e=>e.id==="ev_k1");
  d.events=[...(d.events||[]), {...v, id:"ev_k3", title:"Kurzfristig DREI", nudgeOff:false,
    date:`${x.getFullYear()}-${z(x.getMonth()+1)}-${z(x.getDate())}`, createdAt:new Date().toISOString(), votes:{}}];
  localStorage.setItem("vereinsapp_v14", JSON.stringify(d)); });
await page.reload({waitUntil:"networkidle"}); await page.waitForTimeout(2900); await dismiss();
k=await kasten();
if(/Kurzfristig DREI/.test(k)&&!/Kurzfristig ZWEI/.test(k)) ok("Ein neuer kurzfristiger Termin bringt den Hinweis wieder – die weggeklickten bleiben weg");
else fail("Neuer Termin kommt nicht durch: "+kurz(k||await body()));

// ===== 5) „Nach Frist: 1 Änderung offen" =====
const setup2 = await page.evaluate(()=>{
  const d=JSON.parse(localStorage.getItem("vereinsapp_v14")||"null");
  const z=x=>String(x).padStart(2,"0");
  const tag=n=>{ const x=new Date(); x.setHours(12,0,0,0); x.setDate(x.getDate()+n);
    return `${x.getFullYear()}-${z(x.getMonth()+1)}-${z(x.getDate())}`; };
  const vorlage=(d.events||[]).find(e=>e.id==="ev_k1");
  const kinder=(d.playerProfiles||[]).filter(p=>p.mainTid==="demo_f1"&&!p.archived).map(p=>p.name);
  const ts=new Date().toISOString(); const alt=new Date(Date.now()-30*86400000).toISOString();
  // Ein Termin, bei dem sich nach der Frist jemand abgemeldet hat.
  d.events=[{...vorlage, id:"ev_frist", title:"Spiel mit Nachmeldung", type:"heimspiel",
    date:tag(2), time:"11:00", endTime:"12:30", createdAt:alt, nudgeOff:true,
    deadline:{date:tag(-1),time:"18:00"}, sollPlayers:0, lateCancellations:[{user:kinder[0],prev:"yes",ts,reason:"krank"}],
    votes:{ [kinder[0]]:{val:"no",ts,reason:"krank",lateChange:true,role:"player"},
            ...Object.fromEntries(kinder.slice(1,4).map(n=>[n,{val:"yes",ts,role:"player"}])) } }];
  localStorage.setItem("vereinsapp_v14", JSON.stringify(d));
  return { wer:kinder[0] };
});
await page.reload({waitUntil:"networkidle"}); await page.waitForTimeout(2900); await dismiss();
let b=await body();
if(/Nach Frist: 1 Änderung offen/.test(b)) ok(`Oben steht „Nach Frist: 1 Änderung offen" (${setup2.wer} hat abgesagt)`);
else fail("Meldung fehlt: "+kurz(b));
if(!/Änderung(en)? bestätigen/.test(b)) ok("Und nur EINE Meldung – nicht zweimal dasselbe");
else fail("Es stehen zwei Meldungen zur gleichen Sache da: "+kurz(b));

// ===== 6) Nach dem Bestätigen ist die Meldung weg =====
await page.evaluate(()=>{ const x=[...document.querySelectorAll("button")].find(y=>/^(Ansehen|✅ Anwesenheit)$/.test((y.innerText||"").trim())); x&&x.click(); });
await page.waitForTimeout(1900);
{ const drin=await page.evaluate(()=>{
    const fx=[...document.querySelectorAll("div")].filter(d=>getComputedStyle(d).position==="fixed"&&(d.innerText||"").length>200);
    return fx.some(d=>/NACH FRIST GEÄNDERT/.test(d.innerText||"")); });
  if(drin) ok("Im Termin steht die Änderung mit Grund und Knöpfen");
  else fail("Der Block NACH FRIST GEAENDERT fehlt im Termin"); }
await page.evaluate(()=>{ const x=[...document.querySelectorAll("button")].find(y=>/Bestätigen/.test(y.innerText||"")); x&&x.click(); });
await page.waitForTimeout(1600);
await page.evaluate(()=>{ const fx=[...document.querySelectorAll("div")].filter(d=>getComputedStyle(d).position==="fixed");
  for(const f of fx){ const b=[...f.querySelectorAll("button")].find(x=>(x.innerText||"").trim()==="✕"); if(b){ b.click(); return; } } });
await page.waitForTimeout(1500);
b=await body();
if(!/Nach Frist: \d+ Änderung/.test(b)) ok("Nach dem Bestätigen ist die Meldung oben weg – genau wie gewünscht");
else fail("Meldung steht trotz Bestätigung noch da: "+kurz(b));
{ const v=await page.evaluate(w=>{ const d=JSON.parse(localStorage.getItem("vereinsapp_v14")||"null");
    const e=(d.events||[]).find(x=>x.id==="ev_frist"); const s=(e.votes||{})[w];
    return { okAt:!!(s&&s.okAt), val:s&&s.val, hist:(e.lateCancellations||[]).length }; }, setup2.wer);
  if(v.okAt&&v.val==="no"&&v.hist===1) ok("Die Absage selbst bleibt erhalten – nur der Hinweis verschwindet");
  else fail("Daten verändert: "+JSON.stringify(v)); }

if(errors.length){ console.log("JS-FEHLER:"); [...new Set(errors)].forEach(e=>console.log(" -",e.slice(0,150))); }
console.log(errors.length||fails.length?`ERGEBNIS: ${fails.length} Fehlschläge, ${errors.length} JS-Fehler`:"ERGEBNIS: ALLES OK");
await browser.close(); srv.close();
process.exit(errors.length||fails.length?1:0);
