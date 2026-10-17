// E2E-Test: Wochentag einer Serie mittendrin verlegen.
// Beispiel aus dem Verein: Training ist Dienstag UND Donnerstag. Zur
// Wintersaison wandert der Dienstag auf Montag – der Donnerstag bleibt.
//   1. Nur die Termine am Quelltag wandern, ab dem gewählten Termin.
//   2. Der zweite Trainingstag derselben Serie bleibt unberührt.
//   3. Vergangene Termine der Serie bleiben stehen.
//   4. Zu- und Absagen, Anwesenheit und Aufstellung bleiben erhalten.
//   5. Eine gesetzte Frist wandert im gleichen Abstand mit.
//   6. Liegt am neuen Tag schon ein Termin, wird nicht verlegt.
// Aufruf: npm run build && node scripts/test-serie-wochentag.mjs
import { chromium } from "playwright-core";
import http from "http"; import fs from "fs"; import path from "path";
const dist = path.resolve("dist");
const srv = http.createServer((req,res)=>{ let p=path.join(dist,req.url.split("?")[0]); if(!fs.existsSync(p)||fs.statSync(p).isDirectory()) p=path.join(dist,"index.html"); res.setHeader("content-type",{".html":"text/html",".js":"text/javascript",".css":"text/css"}[path.extname(p)]||"text/plain"); res.end(fs.readFileSync(p)); }).listen(4329);
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
const klick=(re)=>page.evaluate(r=>{
  const b=[...document.querySelectorAll("button")].find(x=>new RegExp(r).test((x.innerText||"").replace(/\s+/g," ").trim()));
  if(!b||b.disabled) return false; b.click(); return true; }, re instanceof RegExp?re.source:re);
const dismiss=async()=>{ for(let k=0;k<12;k++){ const done=await page.evaluate(()=>{
  const fx=[...document.querySelectorAll("div")].filter(d=>getComputedStyle(d).position==="fixed"&&d.querySelector("button")&&d.innerText.length>30);
  for(const f of fx){ const b=[...f.querySelectorAll("button")].find(x=>/geht|Los|Verstanden|Alles klar|Fertig|Jetzt nicht|Weiter →|Überspringen|Start/i.test(x.innerText)); if(b){ b.click(); return false; } }
  return true; }); await page.waitForTimeout(400); if(done) break; } };

await page.addInitScript(()=>{
  if(!localStorage.getItem("vereinsapp_config")) localStorage.setItem("vereinsapp_config", JSON.stringify({url:"https://127.0.0.1:1/x", key:"test"}));
  if(localStorage.getItem("va_simple")===null)  localStorage.setItem("va_simple","0");
  if(localStorage.getItem("va_tsimple")===null) localStorage.setItem("va_tsimple","0");
});
await page.goto("http://127.0.0.1:4329/", { waitUntil:"networkidle" }); await page.waitForTimeout(2500);
await page.evaluate(()=>{ sessionStorage.setItem("vereinsapp_v12_session", JSON.stringify({role:"trainer",cid:"demo",tids:["demo_f1"],name:"Demo Trainer",id:"demo_tr1"})); });
await page.reload({waitUntil:"networkidle"}); await page.waitForTimeout(2600); await dismiss();
await page.evaluate(()=>{ const b=[...document.querySelectorAll("button")].find(x=>/Bin dabei/.test(x.innerText)); b&&b.click(); });
await page.waitForTimeout(1400);

// Serie bauen: Di + Do, je 6 Wochen, einer davon in der Vergangenheit.
const setup = await page.evaluate(()=>{
  const d=JSON.parse(localStorage.getItem("vereinsapp_v14")||"null");
  const z=x=>String(x).padStart(2,"0");
  const iso=dt=>`${dt.getFullYear()}-${z(dt.getMonth()+1)}-${z(dt.getDate())}`;
  // Nächsten Dienstag suchen (Mo=1 … So=7)
  const heute=new Date(); heute.setHours(12,0,0,0);
  const wi=dt=>{ const w=dt.getDay(); return w===0?7:w; };
  const naechster=(ziel)=>{ const dt=new Date(heute); let i=1;
    while(wi(dt)!==ziel||i===1){ dt.setDate(dt.getDate()+1); i++; if(wi(dt)===ziel) break; } return dt; };
  const di0=naechster(2), do0=naechster(4);
  const ts=new Date().toISOString();
  const kader=(d.playerProfiles||[]).filter(q=>q.mainTid==="demo_f1"&&!q.archived).map(q=>q.name).slice(0,3);
  const mk=(start,wochen,sid,pref)=>{
    const liste=[];
    for(let w=-1;w<wochen;w++){
      const dt=new Date(start); dt.setDate(dt.getDate()+w*7);
      liste.push({ id:pref+"_"+(w+1), cid:"demo", tid:"demo_f1", sid, sidx:w+1, type:"training", pt:"att",
        title:"Training", date:iso(dt), time: pref==="di"?"17:30":"18:00", endTime: pref==="di"?"19:00":"19:30",
        loc:"Platz", deadline:null, extraPolls:[], duties:[],
        votes:Object.fromEntries(kader.map(n=>[n,{val:"yes",ts,role:"player"}])),
        present:{ [kader[0]]:true },
        lineup:{T:[],A:[kader[0]],M:[],S:[],E:[]} });
    }
    return liste;
  };
  // Alte Demo-Termine weit weg schieben, damit die Serie allein vorne steht
  (d.events||[]).filter(e=>e.cid==="demo").forEach(e=>{ const dt=new Date(heute); dt.setDate(dt.getDate()+200); e.date=iso(dt); });
  const serie=[...mk(di0,5,"ser_x","di"), ...mk(do0,5,"ser_x","do")];
  // Eine Frist am ersten künftigen Dienstag: 24 h vorher
  const ersterDi=serie.find(e=>e.id==="di_1");
  const dlv=new Date(ersterDi.date+"T17:30:00"); dlv.setDate(dlv.getDate()-1);
  ersterDi.deadline={date:iso(dlv),time:"17:30"};
  d.events=[...(d.events||[]), ...serie];
  localStorage.setItem("vereinsapp_v14", JSON.stringify(d));
  return { di:serie.filter(e=>e.id.startsWith("di")).map(e=>e.date),
           do:serie.filter(e=>e.id.startsWith("do")).map(e=>e.date),
           kader, frist:ersterDi.deadline.date, start:ersterDi.date };
});
if(setup&&setup.di.length===6) ok(`Serie steht: 6× Dienstag, 6× Donnerstag (ab ${setup.di[1]})`);
else { fail("Serie nicht gebaut: "+JSON.stringify(setup)); process.exit(1); }

const stand=()=>page.evaluate(()=>{ const d=JSON.parse(localStorage.getItem("vereinsapp_v14")||"null");
  const wi=s=>{ const dt=new Date(s+"T12:00:00"); const w=dt.getDay(); return w===0?7:w; };
  const serie=(d.events||[]).filter(e=>e.sid==="ser_x").sort((a,b)=>a.id.localeCompare(b.id));
  return serie.map(e=>({ id:e.id, datum:e.date, tag:wi(e.date), zeit:e.time,
    ja:Object.keys(e.votes||{}).length, da:Object.keys(e.present||{}).length,
    auf:(e.lineup&&e.lineup.A||[]).length, frist:e.deadline?e.deadline.date:null })); });
const vorher=await stand();

await page.reload({waitUntil:"networkidle"}); await page.waitForTimeout(2800); await dismiss();

// ===== Dialog öffnen: Terminkarte → ⋯ → Bearbeiten → Wochentag verlegen =====
{ const auf=await page.evaluate(d=>{
    const karten=[...document.querySelectorAll("div")].filter(x=>(x.innerText||"").includes("Training")&&x.querySelector("button")&&(x.innerText||"").length<1400);
    for(const k of karten.reverse()){
      const b=[...k.querySelectorAll("button")].find(x=>(x.innerText||"").trim()==="⋯");
      if(b){ b.click(); return true; } }
    return false; }, setup.di[1]);
  if(auf) ok("Das Termin-Menü lässt sich öffnen"); else fail("Kein ⋯-Knopf an der Terminkarte");
  await page.waitForTimeout(700);
  if(await klick("✏️ Bearbeiten")) ok("„Bearbeiten“ ist da"); else fail("Kein Bearbeiten im Menü");
  await page.waitForTimeout(900); }
let b=await body();
if(/Teil einer Serie/.test(b)) ok("Die App erkennt den Serientermin");
else fail("Kein Serien-Hinweis: "+kurz(b));
if(await klick("📅 Wochentag verlegen")) ok("Es gibt „📅 Wochentag verlegen (ab hier)“");
else { fail("Kein Knopf zum Verlegen: "+kurz(await body())); }
await page.waitForTimeout(900);
b=await body();
if(/liegt bisher am Dienstag/.test(b)) ok("Der Dialog nennt den bisherigen Tag (Dienstag)");
else fail("Kein Hinweis auf den bisherigen Tag: "+kurz(b));
if(/bleiben, wo sie sind/.test(b)) ok("Und sagt zu, dass der zweite Trainingstag bleibt");
else fail("Kein Hinweis auf die anderen Tage");

// ===== Auf Montag verlegen =====
if(await klick("^Mo$")) ok("Montag lässt sich wählen"); else fail("Kein Montag-Knopf");
await page.waitForTimeout(600);
b=await body();
if(/Betroffen: ?\d+ Termine/.test(b)||/Betroffen/.test(b)) ok("Die Vorschau sagt, was passiert: "+((b.match(/Betroffen[^\n]*/)||[""])[0]).slice(0,90));
else fail("Keine Vorschau: "+kurz(b));
if(await klick("Termine verlegen")) ok("Verlegen ist klickbar"); else fail("Verlegen nicht klickbar");
await page.waitForTimeout(1600);

const nachher=await stand();
{ const di=nachher.filter(x=>x.id.startsWith("di"));
  const dovor=vorher.filter(x=>x.id.startsWith("do"));
  const donach=nachher.filter(x=>x.id.startsWith("do"));
  // 1) vergangener Dienstag bleibt, die künftigen wandern auf Montag
  const alt=di.find(x=>x.id==="di_0");
  const kuenftig=di.filter(x=>x.id!=="di_0");
  if(alt&&alt.tag===2) ok("Der vergangene Dienstag bleibt stehen");
  else fail("Vergangener Termin verschoben: "+JSON.stringify(alt));
  if(kuenftig.length===5&&kuenftig.every(x=>x.tag===1)) ok("Alle 5 künftigen Dienstage liegen jetzt auf Montag");
  else fail("Nicht alle verlegt: "+JSON.stringify(kuenftig.map(x=>x.tag)));
  // 2) Donnerstag unberührt
  if(JSON.stringify(dovor.map(x=>x.datum))===JSON.stringify(donach.map(x=>x.datum)))
    ok("Der Donnerstag ist unberührt – genau wie gewünscht");
  else fail("Donnerstag hat sich geändert: "+JSON.stringify(donach.map(x=>x.datum)));
  // 3) Zusagen und Co. bleiben
  const vorMap=Object.fromEntries(vorher.map(x=>[x.id,x]));
  const verloren=nachher.filter(x=>x.ja!==vorMap[x.id].ja||x.da!==vorMap[x.id].da||x.auf!==vorMap[x.id].auf);
  if(verloren.length===0) ok("Zusagen, Anwesenheit und Aufstellung sind überall erhalten");
  else fail("Daten verloren: "+JSON.stringify(verloren.slice(0,2)));
  // 4) Frist wandert mit
  const mitFrist=nachher.find(x=>x.id==="di_1");
  if(mitFrist&&mitFrist.frist&&mitFrist.frist<mitFrist.datum) ok("Die Frist ist mitgewandert ("+mitFrist.frist+" vor "+mitFrist.datum+")");
  else fail("Frist nicht mitgezogen: "+JSON.stringify(mitFrist)); }

// ===== Gegenprobe: auf den Donnerstag verlegen wird abgelehnt =====
await page.reload({waitUntil:"networkidle"}); await page.waitForTimeout(2800); await dismiss();
{ await page.evaluate(()=>{
    const karten=[...document.querySelectorAll("div")].filter(x=>(x.innerText||"").includes("Training")&&x.querySelector("button")&&(x.innerText||"").length<1400);
    for(const k of karten.reverse()){ const b2=[...k.querySelectorAll("button")].find(x=>(x.innerText||"").trim()==="⋯"); if(b2){ b2.click(); return; } } });
  await page.waitForTimeout(700);
  await klick("✏️ Bearbeiten"); await page.waitForTimeout(900);
  await klick("📅 Wochentag verlegen"); await page.waitForTimeout(900);
  const heutigerTag=await page.evaluate(()=>{ const t=document.body.innerText; const m=t.match(/liegt bisher am (\w+)/); return m?m[1]:""; });
  ok("Der Dialog ist wieder offen (Tag: "+heutigerTag+")");
  // Auf einen Tag verlegen, an dem schon ein Termin derselben Mannschaft liegt
  const belegt=await page.evaluate(()=>{ const d=JSON.parse(localStorage.getItem("vereinsapp_v14")||"null");
    const dt=(d.events||[]).find(e=>e.id==="do_2"); const x=new Date(dt.date+"T12:00:00"); const w=x.getDay(); return w===0?7:w; });
  const KUERZEL=["Mo","Di","Mi","Do","Fr","Sa","So"];
  await page.evaluate(k=>{ const b2=[...document.querySelectorAll("button")].find(x=>(x.innerText||"").trim()===k); b2&&b2.click(); }, KUERZEL[belegt-1]);
  await page.waitForTimeout(600);
  // Uhrzeit auf die des Donnerstags setzen -> echte Dopplung
  await page.evaluate(()=>{ const i=[...document.querySelectorAll("input")].find(x=>x.type==="time");
    if(i){ const set=Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype,"value").set;
      set.call(i,"18:00"); i.dispatchEvent(new Event("input",{bubbles:true})); } });
  await page.waitForTimeout(700);
  const b3=await body();
  if(/Am neuen Tag liegt schon ein Termin/.test(b3)) ok("Eine Dopplung wird erkannt und benannt");
  else fail("Keine Warnung bei Dopplung: "+kurz(b3));
  const gesperrt=await page.evaluate(()=>{ const b2=[...document.querySelectorAll("button")].find(x=>/Termine verlegen/.test(x.innerText||"")); return b2?b2.disabled:null; });
  if(gesperrt) ok("Und der Knopf ist gesperrt – es wird nichts überschrieben");
  else fail("Verlegen trotz Dopplung möglich"); }

if(errors.length){ console.log("JS-FEHLER:"); [...new Set(errors)].forEach(e=>console.log(" -",e.slice(0,150))); }
console.log(errors.length||fails.length?`ERGEBNIS: ${fails.length} Fehlschläge, ${errors.length} JS-Fehler`:"ERGEBNIS: ALLES OK");
await browser.close(); srv.close();
process.exit(errors.length||fails.length?1:0);
