// E2E-Test: Aushilfen aus anderen Mannschaften am Termin + Warnung, wenn ein
// Kind zur gleichen Zeit schon woanders zugesagt hat (mit Ignorieren-Option).
// Aufruf: npm run build && node scripts/test-aushilfe.mjs
import { chromium } from "playwright-core";
import http from "http"; import fs from "fs"; import path from "path";
const dist = path.resolve("dist");
const srv = http.createServer((req,res)=>{ let p=path.join(dist,req.url.split("?")[0]); if(!fs.existsSync(p)||fs.statSync(p).isDirectory()) p=path.join(dist,"index.html"); res.setHeader("content-type",{".html":"text/html",".js":"text/javascript",".css":"text/css"}[path.extname(p)]||"text/plain"); res.end(fs.readFileSync(p)); }).listen(4259);
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
const dismiss=async()=>{ for(let k=0;k<12;k++){ const done=await page.evaluate(()=>{
  const fx=[...document.querySelectorAll("div")].filter(d=>getComputedStyle(d).position==="fixed"&&d.querySelector("button")&&d.innerText.length>30);
  for(const f of fx){ const b=[...f.querySelectorAll("button")].find(x=>/geht|Los|Verstanden|Alles klar|Fertig|Jetzt nicht|Weiter →|Überspringen|Start/i.test(x.innerText)); if(b){ b.click(); return false; } }
  return true; }); await page.waitForTimeout(400); if(done) break; } };
await page.addInitScript(()=>{ localStorage.setItem("vereinsapp_config", JSON.stringify({url:"https://127.0.0.1:1/x", key:"test"})); localStorage.setItem("va_simple","0"); localStorage.setItem("va_tsimple","0"); });
await page.goto("http://127.0.0.1:4259/", { waitUntil:"networkidle" }); await page.waitForTimeout(2500);
await page.evaluate(()=>{ sessionStorage.setItem("vereinsapp_v12_session", JSON.stringify({role:"trainer",cid:"demo",tids:["demo_f1","demo_g"],name:"Demo Trainer",id:"demo_tr1"})); });
await page.reload({waitUntil:"networkidle"}); await page.waitForTimeout(2600); await dismiss();
await page.evaluate(()=>{ const b=[...document.querySelectorAll("button")].find(x=>/Bin dabei/.test(x.innerText)); b&&b.click(); });
await page.waitForTimeout(1200);

// Ausgangslage: das G-Jugend-Training auf dieselbe Zeit wie das F1-Training
// legen und Leon Weber (F-Jugend 1) als Aushilfe fuer die G-Jugend markieren.
await page.evaluate(()=>{
  const d=JSON.parse(localStorage.getItem("vereinsapp_v14")||"null"); if(!d) return;
  const f1=(d.events||[]).find(e=>e.id==="de5");     // F-Jugend 1, 17:30-19:00
  const g =(d.events||[]).find(e=>e.id==="de1");     // G-Jugend
  if(f1&&g){ g.date=f1.date; g.time="17:00"; g.endTime="19:30"; g.title="Training G-Jugend"; }
  const p=(d.playerProfiles||[]).find(x=>x.name==="Leon Weber"); if(p) p.optTids=["demo_g"];
  localStorage.setItem("vereinsapp_v14", JSON.stringify(d));
});
await page.reload({waitUntil:"networkidle"}); await page.waitForTimeout(2800); await dismiss();

// Den G-Turnier-Termin öffnen (dort ist Leon Aushilfe und schon zugesagt)
const oeffne = async (titel) => {
  await page.evaluate(t2=>{
    const karten=[...document.querySelectorAll("div")].filter(d=>(d.innerText||"").includes(t2)&&[...d.querySelectorAll("button")].some(b=>/^(Ansehen|✅ Anwesenheit)$/.test((b.innerText||"").trim()))&&d.innerText.length<1200);
    const k=karten[karten.length-1]; if(!k) return;
    const b=[...k.querySelectorAll("button")].find(x=>/^(Ansehen|✅ Anwesenheit)$/.test((x.innerText||"").trim())); b&&b.click();
  }, titel);
  await page.waitForTimeout(1200);
  await page.evaluate(()=>{ const b=[...document.querySelectorAll("button")].find(x=>/^(Orga|👥 Orga)$/.test((x.innerText||"").trim())); b&&b.click(); });
  await page.waitForTimeout(900);
  return body();
};
let b=await oeffne("Training G-Jugend");
if(/Anwesenheit abhaken|Orga|Training G-Jugend/.test(b)) ok("G-Jugend-Termin ist offen"); else fail("Termin nicht offen: "+b.slice(0,160).replace(/\n/g," | "));

// ===== 1) Aushilfe-Liste =====
if(/Aushilfe möglich/.test(b)) ok("Der Termin zeigt „Aushilfe möglich“"); else fail("Keine Aushilfe-Liste: "+b.slice(0,220).replace(/\n/g," | "));
await clickTxt("Aushilfe möglich"); await page.waitForTimeout(700);
b=await body();
if(/Leon Weber/.test(b)) ok("Das Aushilfe-Kind steht drin (Leon Weber)"); else fail("Kind fehlt in der Aushilfe-Liste");
if(/aus F-Jugend 1/.test(b)) ok("Mit Angabe, aus welcher Mannschaft es kommt (F-Jugend 1)"); else fail("Herkunft fehlt");
if(/zur gleichen Zeit bei/.test(b)) ok("Und mit Hinweis auf die Doppelmeldung"); else fail("Kein Konflikt-Hinweis in der Liste");
// Eintragen trotz Konflikt
{ const txt=await page.evaluate(()=>{ const b2=[...document.querySelectorAll("button")].find(x=>/Trotzdem eintragen|^Eintragen$/.test((x.innerText||"").trim())); return b2?b2.innerText.trim():null; });
  if(txt==="Trotzdem eintragen") ok("Der Knopf warnt vor: „Trotzdem eintragen“"); else fail("Knopftext unerwartet: "+txt);
  await clickTxt("Trotzdem eintragen"); await page.waitForTimeout(1400); }
b=await body();
if(/✓ dabei/.test(b)) ok("Nach dem Eintragen steht das Kind als dabei"); else fail("Eintragen ohne Wirkung");

// ===== 2) Warnung bei Doppelmeldung =====
if(/Zur gleichen Zeit woanders gemeldet/.test(b)) ok("Der Termin warnt vor der Doppelmeldung");
else fail("Keine Warnung: "+b.slice(0,240).replace(/\n/g," | "));
if(/F-Jugend 1/.test(b)) ok("Die Warnung nennt den anderen Termin (F-Jugend 1)"); else fail("Anderer Termin nicht genannt");
// ===== 3) Ignorieren =====
await clickTxt("Warnung ignorieren"); await page.waitForTimeout(1300);
b=await body();
if(!/Zur gleichen Zeit woanders gemeldet/.test(b)) ok("„Warnung ignorieren“ blendet sie aus");
else fail("Warnung bleibt trotz Ignorieren");
if(/Bewusst doppelt eingeplant/.test(b)) ok("Stattdessen steht dort, dass es Absicht ist"); else fail("Kein Hinweis auf die bewusste Doppelplanung");
{ const gespeichert=await page.evaluate(()=>{
    const d=JSON.parse(localStorage.getItem("vereinsapp_v14")||"null");
    const e=(d.events||[]).find(x=>x.id==="de1");
    return (e&&e.conflictOk)||[]; });
  if(gespeichert.includes("Leon Weber")) ok("Die Entscheidung wird gespeichert"); else fail("Nicht gespeichert: "+JSON.stringify(gespeichert)); }
await clickTxt("Warnung wieder zeigen"); await page.waitForTimeout(1200);
b=await body();
if(/Zur gleichen Zeit woanders gemeldet/.test(b)) ok("Und lässt sich wieder einschalten"); else fail("Warnung kommt nicht zurück");

if(errors.length){ console.log("JS-FEHLER:"); [...new Set(errors)].forEach(e=>console.log(" -",e.slice(0,150))); }
console.log(errors.length||fails.length?`ERGEBNIS: ${fails.length} Fehlschläge, ${errors.length} JS-Fehler`:"ERGEBNIS: ALLES OK");
await browser.close(); srv.close();
process.exit(errors.length||fails.length?1:0);
