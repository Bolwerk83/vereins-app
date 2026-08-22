// E2E-Test: drei Bedien-Verbesserungen
//  1) Sprachumschalter steht im Kopf statt schwebend ueber den Karten
//  2) "Ansehen" und "Anwesenheit" sind EIN Knopf (ab dem Termintag Anwesenheit)
//  3) "Bearbeiten" uebernimmt die Einstellungen des Termins
// Aufruf: npm run build && node scripts/test-bedienung.mjs
import { chromium } from "playwright-core";
import http from "http"; import fs from "fs"; import path from "path";
const dist = path.resolve("dist");
const srv = http.createServer((req,res)=>{ let p=path.join(dist,req.url.split("?")[0]); if(!fs.existsSync(p)||fs.statSync(p).isDirectory()) p=path.join(dist,"index.html"); res.setHeader("content-type",{".html":"text/html",".js":"text/javascript",".css":"text/css"}[path.extname(p)]||"text/plain"); res.end(fs.readFileSync(p)); }).listen(4243);
const exe=process.env.PLAYWRIGHT_CHROMIUM||"/opt/pw-browsers/chromium-1194/chrome-linux/chrome";
const browser = await chromium.launch({ executablePath:exe, args:["--no-sandbox"] });
const page = await browser.newPage({ viewport:{ width:390, height:900 } });
const errors=[]; const fails=[];
page.on("pageerror", e=>errors.push(e.message));
page.on("dialog", d=>d.accept());
const fail=m=>{ fails.push(m); console.log("FEHLGESCHLAGEN:", m); };
const ok=m=>console.log("OK:", m);
const body=()=>page.evaluate(()=>document.body.innerText);
const clickTxt=re=>page.evaluate(r=>{ const b=[...document.querySelectorAll("button")].find(x=>new RegExp(r).test(x.innerText||"")); if(!b) return false; b.click(); return true; },re instanceof RegExp?re.source:re);
const dismiss=async()=>{ for(let k=0;k<10;k++){ const done=await page.evaluate(()=>{
  const fx=[...document.querySelectorAll("div")].filter(d=>getComputedStyle(d).position==="fixed"&&d.querySelector("button")&&d.innerText.length>30);
  for(const f of fx){ const b=[...f.querySelectorAll("button")].find(x=>/geht|Los|Verstanden|Alles klar|Fertig|Jetzt nicht|Weiter →|Überspringen|Start/i.test(x.innerText)); if(b){ b.click(); return false; } }
  return true; }); await page.waitForTimeout(420); if(done) break; } };
await page.addInitScript(()=>{ localStorage.setItem("vereinsapp_config", JSON.stringify({url:"https://127.0.0.1:1/x", key:"test"})); });

// Demo-Daten erzeugen
await page.goto("http://127.0.0.1:4243/", { waitUntil:"networkidle" }); await page.waitForTimeout(2500);
await page.evaluate(()=>{ localStorage.setItem("va_simple","0"); localStorage.setItem("va_tsimple","0"); sessionStorage.setItem("vereinsapp_v12_session", JSON.stringify({role:"trainer",cid:"demo",tids:["demo_f1"],name:"Demo Trainer",id:"demo_tr1"})); });
await page.reload({waitUntil:"networkidle"}); await page.waitForTimeout(2500); await dismiss();
await clickTxt("Bin dabei"); await page.waitForTimeout(1200);

// ===== 1) Terminkarte: ein Knopf statt zwei =====
let b=await body();
if(/Ansehen/.test(b)) ok("Künftiger Termin: Hauptknopf heißt „Ansehen“"); else fail("Kein Ansehen-Knopf: "+b.slice(0,160).replace(/\n/g," | "));
{ const doppelt=await page.evaluate(()=>{
    const karten=[...document.querySelectorAll("div")].filter(d=>/Ansehen/.test(d.innerText||"")&&(d.innerText||"").length<900);
    const k=karten[karten.length-1]; if(!k) return -1;
    const txt=[...k.querySelectorAll("button")].map(x=>(x.innerText||"").trim());
    return txt.filter(x=>/Ansehen|Anwesenheit/.test(x)).length;
  });
  if(doppelt===1) ok("Auf der Karte gibt es dafür nur noch EINEN Knopf");
  else fail("Immer noch mehrere Knöpfe für dieselbe Ansicht: "+doppelt); }
// Vergangener Termin: der Knopf fuehrt direkt zur Anwesenheit
{ const wurde=await page.evaluate(()=>{
    const d=JSON.parse(localStorage.getItem("vereinsapp_v14")||"null"); if(!d) return false;
    const ev=(d.events||[]).find(e=>e.cid==="demo"&&e.tid==="demo_f1"); if(!ev) return false;
    const g=new Date(Date.now()-3*86400000); const z=x=>String(x).padStart(2,"0");
    ev.date=`${g.getFullYear()}-${z(g.getMonth()+1)}-${z(g.getDate())}`;
    localStorage.setItem("vereinsapp_v14", JSON.stringify(d)); return true; });
  if(wurde){
    await page.reload({waitUntil:"networkidle"}); await page.waitForTimeout(2600); await dismiss();
    const hat=await page.evaluate(()=>!![...document.querySelectorAll("button")].find(x=>/✅ Anwesenheit/.test(x.innerText||"")));
    if(hat) ok("Am Termintag/danach führt derselbe Knopf direkt zur Anwesenheit");
    else fail("Knopf wechselt nicht zur Anwesenheit");
  } }

// ===== 2) Bearbeiten übernimmt die Einstellungen =====
await clickTxt("✏️ Bearbeiten"); await page.waitForTimeout(1400);
b=await body();
if(/Termin bearbeiten/.test(b)) ok("Bearbeiten öffnet sich"); else fail("Bearbeiten öffnet nicht: "+b.slice(0,150).replace(/\n/g," | "));
await clickTxt("Weiter"); await page.waitForTimeout(600);
await clickTxt("Weiter"); await page.waitForTimeout(800);
{ const felder=await page.evaluate(()=>[...document.querySelectorAll("input")].map(i=>({t:i.type,v:i.value})));
  const titel=felder.find(x=>x.t==="text"&&x.v.length>3);
  const zeit=felder.find(x=>x.t==="time"&&x.v);
  const datum=felder.find(x=>x.t==="date"&&x.v);
  if(titel) ok("Titel ist vorausgefüllt: „"+titel.v+"“"); else fail("Titel leer");
  if(zeit) ok("Uhrzeit ist vorausgefüllt: "+zeit.v); else fail("Uhrzeit leer");
  if(datum) ok("Datum ist vorausgefüllt: "+datum.v); else fail("Datum leer");
  const ort=felder.filter(x=>x.t==="text"&&x.v).length;
  if(ort>=2) ok("Auch der Ort steht schon drin"); else fail("Ort fehlt"); }
// Ohne Änderung speichern -> Termin bleibt wie er war, keine Hilfsfelder im Speicher
await clickTxt("Weiter"); await page.waitForTimeout(600);
await clickTxt("Weiter|Speichern|Fertig"); await page.waitForTimeout(600);
await clickTxt("Speichern|Fertig|Termin aktualisieren"); await page.waitForTimeout(1600);
{ const sauber=await page.evaluate(()=>{
    const roh=localStorage.getItem("vereinsapp_v14")||"";
    return { hilf: /_coTids|_serie|_editSeries/.test(roh), titel: /Abschlusstraining|Training/.test(roh) };
  });
  if(!sauber.hilf) ok("Die internen Hilfsfelder landen nicht im gespeicherten Termin");
  else fail("Hilfsfelder (_coTids/_serie) wurden mitgespeichert");
  if(sauber.titel) ok("Der Termin ist nach dem Speichern noch vollständig"); }

// ===== 3) Sprachumschalter steht im Kopf, nicht über den Karten =====
await page.evaluate(()=>{ sessionStorage.clear(); localStorage.removeItem("vereinsapp_v12_session_persist"); localStorage.removeItem("va_teamok_demo_f1"); });
await page.goto("http://127.0.0.1:4243/?club=demo-verein&team=demo_f1", { waitUntil:"networkidle" });
await page.waitForTimeout(2800);
{ const schwebt=await page.evaluate(()=>{
    return [...document.querySelectorAll("div")].some(d=>getComputedStyle(d).position==="fixed"&&/Deutsch|Sprache/i.test(d.innerText||""));
  });
  if(!schwebt) ok("Kein schwebender Sprachkasten mehr über dem Inhalt"); else fail("Sprachkasten schwebt weiterhin");
  const imKopf=await page.evaluate(()=>!!document.querySelector('select[aria-label="Sprache / Language"]'));
  if(imKopf) ok("Die Sprachwahl steht trotzdem auf der Seite"); else fail("Sprachwahl ist ganz verschwunden"); }
if(await page.locator('input[type="password"]').count()){
  await page.locator('input[type="password"]').first().fill("f1");
  await clickTxt("Team öffnen|Öffnen|Weiter"); await page.waitForTimeout(1900); }
{ const schwebt=await page.evaluate(()=>[...document.querySelectorAll("div")].some(d=>getComputedStyle(d).position==="fixed"&&/Deutsch/i.test(d.innerText||"")));
  if(!schwebt) ok("Auch in der Namensliste verdeckt nichts mehr die erste Karte"); else fail("In der Namensliste schwebt der Sprachkasten weiter");
  const frei=await page.evaluate(()=>{
    const s=document.querySelector('input[placeholder="Suchen..."]'); if(!s) return null;
    const r=s.getBoundingClientRect();
    const oben=document.elementFromPoint(r.right-10, r.top+r.height/2);
    return !!(oben&&(oben===s||s.contains(oben)||oben.closest('button')));
  });
  if(frei!==false) ok("Suchzeile und Teilen-Knopf sind frei bedienbar"); else fail("Etwas liegt über der Suchzeile"); }

if(errors.length){ console.log("JS-FEHLER:"); [...new Set(errors)].forEach(e=>console.log(" -",e.slice(0,150))); }
console.log(errors.length||fails.length?`ERGEBNIS: ${fails.length} Fehlschläge, ${errors.length} JS-Fehler`:"ERGEBNIS: ALLES OK");
await browser.close(); srv.close();
process.exit(errors.length||fails.length?1:0);
