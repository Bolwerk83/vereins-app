// E2E-Test: Trainer-Assistent (intern, ohne fremden Dienst).
//   1. Erreichbar über „Mehr“ – nur für Trainer, nicht für Helfer.
//   2. Auf „wir müssen das Zusammenspiel verbessern“ kommt das passende
//      Thema mit konkreten Tipps.
//   3. Daraus lässt sich ein Training bauen – aus der Übungssammlung.
//   4. „Nur für mich speichern“ legt einen privaten Entwurf an.
//   5. „Ins nächste Training“ hängt den Plan an den Trainingstermin.
//   6. Wiederkehrende Aufgabe mit sinnvollem Rhythmus und Enddatum.
//   7. „Zeig mir Tricks“ zeigt Moves mit Schritten und Bewegungsbild.
// Aufruf: npm run build && node scripts/test-assistent.mjs
import { chromium } from "playwright-core";
import http from "http"; import fs from "fs"; import path from "path";
const dist = path.resolve("dist");
const srv = http.createServer((req,res)=>{ let p=path.join(dist,req.url.split("?")[0]); if(!fs.existsSync(p)||fs.statSync(p).isDirectory()) p=path.join(dist,"index.html"); res.setHeader("content-type",{".html":"text/html",".js":"text/javascript",".css":"text/css"}[path.extname(p)]||"text/plain"); res.end(fs.readFileSync(p)); }).listen(4343);
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
  const fx=[...document.querySelectorAll("div")].filter(d=>getComputedStyle(d).position==="fixed"&&d.querySelector("button")&&d.innerText.length>30&&!/Trainer-Assistent/.test(d.innerText||""));
  for(const f of fx){ const b=[...f.querySelectorAll("button")].find(x=>/geht|Los|Verstanden|Alles klar|Fertig|Jetzt nicht|Weiter →|Überspringen|Start/i.test(x.innerText)); if(b){ b.click(); return false; } }
  return true; }); await page.waitForTimeout(400); if(done) break; } };
const oeffneAssistent = async () => {
  await page.evaluate(()=>{ const b=[...document.querySelectorAll("button")].find(x=>/^(Mehr|=)$/.test((x.innerText||"").trim())); b&&b.click(); });
  await page.waitForTimeout(900);
  const auf=await page.evaluate(()=>{ const b=[...document.querySelectorAll("button,div,a")].find(x=>/Trainer-Assistent/.test((x.innerText||"").trim())&&(x.innerText||"").length<40);
    if(!b) return false; b.click(); return true; });
  await page.waitForTimeout(1200); return auf;
};
const fragen = async (txt) => {
  await page.evaluate(t=>{ const i=[...document.querySelectorAll("input")].find(x=>/Woran hakt/.test(x.placeholder||""));
    if(!i) return; const set=Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype,"value").set;
    set.call(i,t); i.dispatchEvent(new Event("input",{bubbles:true})); }, txt);
  await page.waitForTimeout(400);
  await klick("^Fragen$"); await page.waitForTimeout(900);
};

await page.addInitScript(()=>{
  if(!localStorage.getItem("vereinsapp_config")) localStorage.setItem("vereinsapp_config", JSON.stringify({url:"https://127.0.0.1:1/x", key:"test"}));
  if(localStorage.getItem("va_simple")===null)  localStorage.setItem("va_simple","0");
  if(localStorage.getItem("va_tsimple")===null) localStorage.setItem("va_tsimple","0");
});
await page.goto("http://127.0.0.1:4343/", { waitUntil:"networkidle" }); await page.waitForTimeout(2500);
await page.evaluate(()=>{ sessionStorage.setItem("vereinsapp_v12_session", JSON.stringify({role:"trainer",cid:"demo",tids:["demo_f1"],name:"Demo Trainer",id:"demo_tr1"})); });
await page.reload({waitUntil:"networkidle"}); await page.waitForTimeout(2600); await dismiss();
await page.evaluate(()=>{ const b=[...document.querySelectorAll("button")].find(x=>/Bin dabei/.test(x.innerText)); b&&b.click(); });
await page.waitForTimeout(1500);

// Ein kommendes Training sicherstellen
const trId = await page.evaluate(()=>{ const d=JSON.parse(localStorage.getItem("vereinsapp_v14")||"null");
  const p=v=>String(v).padStart(2,"0"); const x=new Date(Date.now()+3*86400000);
  const ev=(d.events||[]).filter(e=>e.cid==="demo"&&e.tid==="demo_f1")[0];
  ev.type="training"; ev.date=`${x.getFullYear()}-${p(x.getMonth()+1)}-${p(x.getDate())}`; ev.trainingPlan=null;
  localStorage.setItem("vereinsapp_v14", JSON.stringify(d)); return ev.id; });
await page.reload({waitUntil:"networkidle"}); await page.waitForTimeout(2800); await dismiss();

// ===== 1) Erreichbar =====
if(await oeffneAssistent()) ok("Über „Mehr“ ist der Trainer-Assistent erreichbar");
else { fail("Nicht erreichbar: "+(await body()).slice(0,300).replace(/\n/g," | ")); process.exit(1); }
let b=await body();
if(/Intern für das Trainerteam/.test(b)) ok("Er weist sich als internes Werkzeug aus");
else fail("Kein Hinweis auf „intern“");

// ===== 2) Thema erkennen =====
await fragen("wir müssen das zusammenspiel der mannschaft verbessern");
b=await body();
if(/Zusammenspiel & Passspiel/.test(b)) ok("Er erkennt das Thema Zusammenspiel");
else fail("Thema nicht erkannt: "+b.slice(-500).replace(/\n/g," | "));
if(/Schulter/.test(b)&&/4 gegen 4/.test(b)) ok("Und gibt konkrete Tipps statt Allgemeinplätzen");
else fail("Keine konkreten Tipps");

// ===== 6) Wiederkehrende Aufgabe =====
if(/2× pro Woche · 6 Wochen/.test(b)) ok("Er schlägt einen Rhythmus vor: 2× pro Woche, sechs Wochen");
else fail("Kein Rhythmus angeboten: "+b.slice(-400).replace(/\n/g," | "));
if(await klick("🔁 2× pro Woche")) ok("Die Aufgabe lässt sich übernehmen"); else fail("Aufgabe nicht übernehmbar");
await page.waitForTimeout(1200);
{ const a=await page.evaluate(()=>{ const d=JSON.parse(localStorage.getItem("vereinsapp_v14")||"null");
    return (d.trainerTasks||[])[0]||null; });
  if(a&&a.themaId==="zusammenspiel"&&a.faellig&&a.bis) ok(`Gespeichert mit Fälligkeit ${a.faellig} und Ende ${a.bis}`);
  else fail("Aufgabe nicht gespeichert: "+JSON.stringify(a));
  if(a&&new Date(a.bis)>new Date(a.faellig)) ok("Der Zeitraum ist begrenzt – die Aufgabe läuft nicht ewig");
  else fail("Kein sinnvoller Zeitraum"); }

// ===== 2b) Geführte Fragen: Antwortknöpfe statt Tippen =====
{ if(await klick("🧮 Fragen beantworten")) ok("Es gibt einen geführten Weg: „🧮 Fragen beantworten“");
  else fail("Kein geführter Weg angeboten");
  await page.waitForTimeout(800);
  b=await body();
  if(/FRAGE 1 VON 4/.test(b)) ok("Die erste von vier Fragen steht da");
  else fail("Keine Fragen: "+b.slice(-400).replace(/\n/g," | "));
  if(/Wo geht der Ball meistens verloren/.test(b)) ok("Und sie passt zum Thema");
  else fail("Frage passt nicht zum Thema");
  // vier Antworten per Knopf
  const antworten=["Sie spielen gar nicht erst ab","Mehr als 16","75 Minuten","Halle"];
  for(const a2 of antworten){
    const g=await klick("^"+a2.replace(/[.*+?^${}()|[\]\\]/g,"\\$&"));
    if(!g) fail("Antwort nicht anklickbar: "+a2);
    await page.waitForTimeout(700);
  }
  ok("Alle vier Fragen lassen sich per Knopfdruck beantworten");
  b=await body();
  if(/🧮 Ergebnis/.test(b)) ok("Danach kommt ein Ergebnis");
  else fail("Kein Ergebnis: "+b.slice(-500).replace(/\n/g," | "));
  if(/SO KOMMT DAS ZUSTANDE/.test(b)) ok("Mit offenem Rechenweg");
  else fail("Kein Rechenweg");
  if(/3 Stationen im Wechsel/.test(b)) ok("Der Rechenweg nutzt die Antwort „mehr als 16“: 3 Stationen");
  else fail("Gruppenzahl nicht berechnet: "+b.slice(-500).replace(/\n/g," | "));
  if(/60 Minuten echte Übungszeit/.test(b)) ok("Und rechnet aus 75 Minuten 60 Minuten echte Übungszeit");
  else fail("Zeit nicht gerechnet");
  if(/20 × 12 m/.test(b)) ok("Die Halle führt zu kleineren Feldern (20 × 12 m)");
  else fail("Ort nicht berücksichtigt");
  if(/DAS WÜRDE ICH MACHEN/.test(b)) ok("Dazu drei konkrete Maßnahmen");
  else fail("Keine Maßnahmen"); }

// ===== 2c) Gleiche Antworten, gleiches Ergebnis =====
{ const vorher=await page.evaluate(()=>{ const t=document.body.innerText; const i=t.lastIndexOf("SO KOMMT DAS ZUSTANDE");
    return t.slice(i,i+320); });
  await klick("🧮 Fragen beantworten"); await page.waitForTimeout(700);
  for(const a2 of ["Sie spielen gar nicht erst ab","Mehr als 16","75 Minuten","Halle"]){
    await klick("^"+a2.replace(/[.*+?^${}()|[\]\\]/g,"\\$&")); await page.waitForTimeout(600); }
  const nachher=await page.evaluate(()=>{ const t=document.body.innerText; const i=t.lastIndexOf("SO KOMMT DAS ZUSTANDE");
    return t.slice(i,i+320); });
  if(vorher&&vorher===nachher) ok("Dieselben Antworten ergeben dasselbe Ergebnis – nachvollziehbar wie ein Taschenrechner");
  else fail("Ergebnis schwankt bei gleichen Antworten"); }

// ===== 2d) Einheit aus dem Ergebnis =====
{ if(await klick("⚽ Passende Einheit bauen")) ok("Aus dem Ergebnis lässt sich direkt die Einheit bauen");
  else fail("Kein Knopf zur Einheit");
  await page.waitForTimeout(1300);
  b=await body();
  if(/Vorschlag für eine Einheit/.test(b)) ok("Und sie kommt");
  else fail("Keine Einheit aus dem Ergebnis"); }

// ===== 3) Training bauen =====
if(await klick("⚽ Training vorschlagen")) ok("„Training vorschlagen“ ist anklickbar"); else fail("Kein Trainings-Knopf");
await page.waitForTimeout(1200);
b=await body();
if(/Vorschlag für eine Einheit/.test(b)&&/Minuten/.test(b)) ok("Es kommt eine komplette Einheit mit Minutenangaben");
else fail("Kein Trainingsvorschlag: "+b.slice(-500).replace(/\n/g," | "));
if(/Aufwärmen|Technik|Spielform/.test(b)) ok("Mit Übungen aus der vorhandenen Sammlung");
else fail("Keine Übungen erkennbar");

// ===== 4) Nur für mich =====
if(await klick("📋 Nur für mich speichern")) ok("„Nur für mich speichern“ geht"); else fail("Kein Speichern-Knopf");
await page.waitForTimeout(1200);
{ const tr=await page.evaluate(()=>{ const d=JSON.parse(localStorage.getItem("vereinsapp_v14")||"null");
    return (d.trainings||[]).filter(x=>x.privat)[0]||null; });
  if(tr&&tr.privat&&tr.by==="demo_tr1"&&(tr.blocks||[]).length>2) ok(`Privater Entwurf angelegt (${tr.blocks.length} Blöcke)`);
  else fail("Kein privater Entwurf: "+JSON.stringify(tr&&{privat:tr.privat,by:tr.by})); }

// ===== 5) Ins Training einsetzen =====
if(await klick("⚽ Ins nächste Training")) ok("„Ins nächste Training“ geht"); else fail("Kein Einsetzen-Knopf");
await page.waitForTimeout(1300);
{ const ev=await page.evaluate(x=>{ const d=JSON.parse(localStorage.getItem("vereinsapp_v14")||"null");
    return (d.events||[]).find(e=>e.id===x)||null; }, trId);
  const pl=ev&&ev.trainingPlan;
  if(pl&&pl.sessions&&pl.sessions[0].blocks.length>2) ok(`Der Plan hängt am Trainingstermin (${pl.sessions[0].blocks.length} Blöcke)`);
  else fail("Nicht am Termin: "+JSON.stringify(pl)); }

// ===== 7) Tricks =====
await fragen("zeig mir tricks");
b=await body();
if(/Übersteiger/.test(b)&&/Cruyff/.test(b)) ok("Auf „zeig mir Tricks“ kommen die Moves");
else fail("Keine Tricks: "+b.slice(-400).replace(/\n/g," | "));
if(/Häufiger Fehler/.test(b)) ok("Jeweils mit dem häufigsten Fehler dazu");
else fail("Kein Fehler-Hinweis");
{ const svg=await page.evaluate(()=>document.querySelectorAll("svg animateMotion").length);
  if(svg>0) ok(`Und mit ${svg} Bewegungsbildern – der Ball läuft den Weg ab`);
  else fail("Keine Bewegungsbilder"); }

// ===== Aufgaben-Reiter =====
if(await klick("🔁 Aufgaben")) ok("Es gibt einen Reiter für die Aufgaben"); else fail("Kein Aufgaben-Reiter");
await page.waitForTimeout(800);
b=await body();
if(/Zusammenspiel: kleine Spielformen/.test(b)&&/nächste Fälligkeit/.test(b)) ok("Dort steht die Aufgabe mit der nächsten Fälligkeit");
else fail("Aufgabe nicht in der Liste: "+b.slice(-400).replace(/\n/g," | "));
if(await klick("✓ Gemacht")) ok("Abhaken geht"); else fail("Kein Abhaken");
await page.waitForTimeout(1200);
{ const a=await page.evaluate(()=>{ const d=JSON.parse(localStorage.getItem("vereinsapp_v14")||"null");
    return (d.trainerTasks||[])[0]||null; });
  if(a&&(a.erledigt||[]).length===1) ok("Der Haken ist gezählt und die nächste Fälligkeit gesetzt");
  else fail("Abhaken ohne Wirkung: "+JSON.stringify(a&&a.erledigt)); }

// ===== Helfer sehen den Assistenten nicht =====
await page.evaluate(()=>{ sessionStorage.setItem("vereinsapp_v12_session", JSON.stringify({role:"helper",cid:"demo",tids:["demo_f1"],name:"Markus Lang",helperId:"dh2",id:"dh2"})); });
await page.goto("http://127.0.0.1:4343/", { waitUntil:"networkidle" }); await page.waitForTimeout(2800); await dismiss();
{ await page.evaluate(()=>{ const b2=[...document.querySelectorAll("button")].find(x=>/^(Mehr|=)$/.test((x.innerText||"").trim())); b2&&b2.click(); });
  await page.waitForTimeout(900);
  const b2=await body();
  if(!/Trainer-Assistent/.test(b2)) ok("Helfer bekommen den Assistenten nicht angeboten");
  else fail("Helfer sieht den Assistenten"); }

if(errors.length){ console.log("JS-FEHLER:"); [...new Set(errors)].forEach(e=>console.log(" -",e.slice(0,150))); }
console.log(errors.length||fails.length?`ERGEBNIS: ${fails.length} Fehlschläge, ${errors.length} JS-Fehler`:"ERGEBNIS: ALLES OK");
await browser.close(); srv.close();
process.exit(errors.length||fails.length?1:0);
