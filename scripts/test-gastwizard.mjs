// E2E-Test: Gast-Wizard (eigenes Fenster) und Link-Teilen auf dem
// Namens-Bildschirm - ganze Mannschaft oder ein bestimmtes Kind.
// Aufruf: npm run build && node scripts/test-gastwizard.mjs
import { chromium } from "playwright-core";
import http from "http"; import fs from "fs"; import path from "path";
const dist = path.resolve("dist");
const srv = http.createServer((req,res)=>{ let p=path.join(dist,req.url.split("?")[0]); if(!fs.existsSync(p)||fs.statSync(p).isDirectory()) p=path.join(dist,"index.html"); res.setHeader("content-type",{".html":"text/html",".js":"text/javascript",".css":"text/css"}[path.extname(p)]||"text/plain"); res.end(fs.readFileSync(p)); }).listen(4241);
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
await page.addInitScript(()=>{ localStorage.setItem("vereinsapp_config", JSON.stringify({url:"https://127.0.0.1:1/x", key:"test"})); });

// Erst einmal als Trainer laden, damit die Demo-Daten lokal liegen
await page.goto("http://127.0.0.1:4241/", { waitUntil:"networkidle" }); await page.waitForTimeout(2500);
await page.evaluate(()=>{ sessionStorage.setItem("vereinsapp_v12_session", JSON.stringify({role:"trainer",cid:"demo",tids:["demo_f1"],name:"Demo Trainer",id:"demo_tr1"})); });
await page.reload({waitUntil:"networkidle"}); await page.waitForTimeout(2500);
await page.evaluate(()=>{ const b=[...document.querySelectorAll("button")].find(x=>/Bin dabei/.test(x.innerText)); b&&b.click(); });
await page.waitForTimeout(1200);
{ const da=await page.evaluate(()=>!!localStorage.getItem("vereinsapp_v14"));
  if(da) ok("Vereinsdaten liegen lokal vor"); else fail("Keine lokalen Daten"); }

// Als Eltern auf die Namensliste (Team-Link ohne Kind)
await page.evaluate(()=>{ sessionStorage.clear(); localStorage.removeItem("va_teamok_demo_f1"); });
await page.goto("http://127.0.0.1:4241/?club=demo-verein&team=demo_f1", { waitUntil:"networkidle" });
await page.waitForTimeout(2800);
await page.locator('input[type="password"]').first().fill("f1");
await page.evaluate(()=>{ const x=[...document.querySelectorAll("button")].find(y=>/Team öffnen|Öffnen|Weiter/i.test(y.innerText)); x&&x.click(); });
await page.waitForTimeout(1900);
let b=await body();
if(/Wer bist du\?/.test(b)) ok("Namensliste erreicht"); else fail("Nicht auf der Namensliste: "+b.slice(0,160).replace(/\n/g," | "));

// ===== 1) Die Liste ist aufgeraeumt: kein Dauer-Formular mehr =====
if(!/Name des Kindes/.test(b)) ok("Kein dauerhaftes Gast-Formular mehr unter der Liste");
else fail("Gast-Formular steht immer noch fest auf dem Bildschirm");
if(!/verschlüsselten Cloud-Datenbank/.test(b)) ok("Auch der Datenschutz-Kasten steht nicht mehr dauerhaft im Weg");
else fail("Datenschutz-Kasten weiterhin dauerhaft sichtbar");
if(/Neu hier\? Gast anmelden/.test(b)) ok("Stattdessen ein einziger Knopf für Gäste");
else fail("Kein Gast-Knopf: "+b.slice(-160).replace(/\n/g," | "));

// ===== 2) Gast-Wizard =====
await clickTxt("Neu hier\\? Gast anmelden"); await page.waitForTimeout(700);
b=await body();
if(/Wie heißt das Kind\?/.test(b)) ok("Der Gast-Wizard stellt genau eine Frage");
else fail("Gast-Wizard öffnet nicht: "+b.slice(0,160).replace(/\n/g," | "));
if(/F-Jugend 1/.test(b)) ok("Die Mannschaft steht dabei"); else fail("Mannschaft fehlt im Wizard");
if(/Warteliste/.test(b)) ok("Warteliste ist im Wizard erreichbar"); else fail("Keine Warteliste im Wizard");
// Doppelter Name wird abgefangen
{ const inp=page.locator('div[style*="fixed"] input').first();
  await inp.fill("Ben Fischer"); await page.waitForTimeout(500); b=await body();
  if(/schon im Team/.test(b)) ok("Ein Name, den es schon gibt, wird erkannt"); else fail("Doppelter Name nicht erkannt");
  if(/Dann oben antippen/.test(b)) ok("Und die App sagt, was stattdessen zu tun ist"); else fail("Kein Hinweis auf die Liste");
  await inp.fill("Tom Probe"); await page.waitForTimeout(500); }
b=await body();
if(/„Tom Probe“/.test(b)) ok("Der Knopf nennt den eingetragenen Namen"); else fail("Kein Name im Knopf: "+b.slice(0,200).replace(/\n/g," | "));
await clickTxt("als Gast anmelden"); await page.waitForTimeout(1400);
b=await body();
if(/Einwilligung|Wer bist du\?/.test(b)) ok("Danach kommt die Einwilligung – auch für Gäste");
else fail("Keine Einwilligung nach dem Gast-Wizard: "+b.slice(0,180).replace(/\n/g," | "));
await clickTxt("Mutter"); await page.waitForTimeout(500);
await clickTxt("Ja, einverstanden"); await page.waitForTimeout(1200);
b=await body();
await clickTxt("Los geht"); await page.waitForTimeout(1800);
b=await body();
if(/Tom/.test(b)) ok("Der Gast ist drin und sieht die Termine");
else fail("Gast nicht angemeldet: "+b.slice(0,180).replace(/\n/g," | "));

// ===== 3) Link teilen auf der Namensliste =====
await page.goto("http://127.0.0.1:4241/?club=demo-verein&team=demo_f1", { waitUntil:"networkidle" });
await page.waitForTimeout(1200);
await page.evaluate(()=>{ sessionStorage.clear(); localStorage.removeItem("vereinsapp_v12_session_persist"); });
await page.goto("http://127.0.0.1:4241/?club=demo-verein&team=demo_f1", { waitUntil:"networkidle" });
await page.waitForTimeout(2800);
if(await page.locator('input[type="password"]').count()){
  await page.locator('input[type="password"]').first().fill("f1");
  await page.evaluate(()=>{ const x=[...document.querySelectorAll("button")].find(y=>/Team öffnen|Öffnen|Weiter/i.test(y.innerText)); x&&x.click(); });
  await page.waitForTimeout(1900); }
b=await body();
if(!/Wer bist du\?/.test(b)) fail("Namensliste beim zweiten Anlauf nicht erreicht: "+b.slice(0,160).replace(/\n/g," | "));
await page.evaluate(()=>{ window.__kopiert=null;
  try{ Object.defineProperty(navigator,"share",{value:undefined,configurable:true}); }catch{}
  try{ Object.defineProperty(navigator,"clipboard",{value:{writeText:t=>{window.__kopiert=t;return Promise.resolve();}},configurable:true}); }catch{}
});
{ const hat=await page.evaluate(()=>!![...document.querySelectorAll("button")].find(x=>(x.innerText||"").trim()==="🔗"));
  if(hat) ok("Auf der Namensliste gibt es einen Teilen-Knopf"); else fail("Kein Teilen-Knopf auf der Namensliste"); }
await page.evaluate(()=>{ const x=[...document.querySelectorAll("button")].find(y=>(y.innerText||"").trim()==="🔗"); x&&x.click(); });
await page.waitForTimeout(700); b=await body();
if(/Ganze Mannschaft/.test(b)) ok("Man kann den Link zur ganzen Mannschaft teilen"); else fail("Kein Team-Link: "+b.slice(0,160).replace(/\n/g," | "));
if(/ODER EIN BESTIMMTES KIND/.test(b)) ok("Oder den Link zu einem bestimmten Kind"); else fail("Keine Kinder-Auswahl im Teilen-Fenster");
// Team-Link: ohne kind-Parameter
await clickTxt("Ganze Mannschaft"); await page.waitForTimeout(900);
{ const txt=await page.evaluate(()=>window.__kopiert||"");
  if(/team=demo_f1/.test(txt)&&!/kind=/.test(txt)) ok("Der Mannschafts-Link kommt ohne Kind-Parameter");
  else fail("Team-Link falsch: "+txt.slice(0,180).replace(/\n/g," | ")); }
// Kind-Link: mit kind-Parameter
await page.evaluate(()=>{ const x=[...document.querySelectorAll("button")].find(y=>(y.innerText||"").trim()==="🔗"); x&&x.click(); });
await page.waitForTimeout(700);
await page.evaluate(()=>{ const b=[...document.querySelectorAll("button")].find(x=>/Ben Fischer/.test(x.innerText||"")); b&&b.click(); });
await page.waitForTimeout(900);
{ const txt=await page.evaluate(()=>window.__kopiert||"");
  if(/kind=Ben(%20|\+)Fischer/.test(txt)) ok("Der Kind-Link enthält den Kind-Parameter");
  else fail("Kind-Link falsch: "+txt.slice(0,180).replace(/\n/g," | "));
  if(!/passwort\s*[:=]/i.test(txt)&&!/[?&]pw=/.test(txt)) ok("Auch hier steht kein Passwort im Link");
  else fail("Passwort im Link"); }

if(errors.length){ console.log("JS-FEHLER:"); [...new Set(errors)].forEach(e=>console.log(" -",e.slice(0,150))); }
console.log(errors.length||fails.length?`ERGEBNIS: ${fails.length} Fehlschläge, ${errors.length} JS-Fehler`:"ERGEBNIS: ALLES OK");
await browser.close(); srv.close();
process.exit(errors.length||fails.length?1:0);
