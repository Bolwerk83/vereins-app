// E2E-Test: Erreicht die App die Datenbank nicht, MUSS das sofort oben stehen.
// Aufruf: npm run build && node scripts/test-dbstatus.mjs
import { chromium } from "playwright-core";
import http from "http"; import fs from "fs"; import path from "path";
const dist = path.resolve("dist");
const srv = http.createServer((req,res)=>{ let p=path.join(dist,req.url.split("?")[0]); if(!fs.existsSync(p)||fs.statSync(p).isDirectory()) p=path.join(dist,"index.html"); res.setHeader("content-type",{".html":"text/html",".js":"text/javascript",".css":"text/css"}[path.extname(p)]||"text/plain"); res.end(fs.readFileSync(p)); }).listen(4267);
// Zweiter Server spielt die "Datenbank": mal offline, mal 403, mal ok
let modus="netzweg";
const db = http.createServer((req,res)=>{
  // CORS immer mitschicken - sonst blockt der Browser schon vor der Antwort
  res.setHeader("access-control-allow-origin","*");
  res.setHeader("access-control-allow-headers","*");
  res.setHeader("access-control-allow-methods","GET,POST,PATCH,OPTIONS");
  res.setHeader("content-type","application/json");
  if(req.method==="OPTIONS"){ res.statusCode=204; res.end(); return; }
  if(modus==="block"){ res.statusCode=403; res.end(JSON.stringify({message:"permission denied"})); return; }
  res.statusCode=200; res.end(JSON.stringify([]));
}).listen(4268);
const exe=process.env.PLAYWRIGHT_CHROMIUM||"/opt/pw-browsers/chromium-1194/chrome-linux/chrome";
const browser = await chromium.launch({ executablePath:exe, args:["--no-sandbox"] });
const page = await browser.newPage({ viewport:{ width:390, height:900 } });
const errors=[]; const fails=[];
page.on("pageerror", e=>errors.push(e.message));
page.on("dialog", d=>d.accept());
const fail=m=>{ fails.push(m); console.log("FEHLGESCHLAGEN:", m); };
const ok=m=>console.log("OK:", m);
const body=()=>page.evaluate(()=>document.body.innerText);

// ===== 1) Datenbank nicht erreichbar =====
// Config nur beim ersten Mal setzen - sonst ueberschreibt das Init-Skript
// spaetere Aenderungen bei jedem Reload.
await page.addInitScript(()=>{ if(!localStorage.getItem("vereinsapp_config")) localStorage.setItem("vereinsapp_config", JSON.stringify({url:"https://127.0.0.1:1/x", key:"test"}));
  sessionStorage.setItem("vereinsapp_v12_session", JSON.stringify({role:"trainer",cid:"demo",tids:["demo_f1"],name:"Demo Trainer",id:"demo_tr1"})); });
await page.goto("http://127.0.0.1:4267/", { waitUntil:"networkidle" }); await page.waitForTimeout(3200);
let b=await body();
if(/Keine Verbindung zur Datenbank/.test(b)) ok("Bei nicht erreichbarer Datenbank steht der Hinweis sofort oben");
else fail("Kein Hinweis: "+b.slice(0,260).replace(/\n/g," | "));
if(/zuletzt geladenen Stand von diesem Gerät/.test(b)) ok("Und erklärt, dass man den lokalen Stand sieht");
{ const lage=await page.evaluate(()=>{
    const el=[...document.querySelectorAll("div")].find(d=>/Keine Verbindung zur Datenbank/.test(d.innerText||"")&&getComputedStyle(d).position==="fixed");
    if(!el) return null; const r=el.getBoundingClientRect();
    return { oben:r.top<=2, breit:Math.round(r.width), z:getComputedStyle(el).zIndex }; });
  if(lage&&lage.oben&&lage.breit>300) ok("Der Hinweis steht ganz oben über die volle Breite (z-index "+lage.z+")");
  else fail("Hinweis nicht prominent: "+JSON.stringify(lage)); }
{ const knopf=await page.evaluate(()=>!![...document.querySelectorAll("button")].find(x=>/Neu laden/.test(x.innerText||"")));
  if(knopf) ok("Mit einem Knopf zum erneuten Versuch"); else fail("Kein Neu-laden-Knopf"); }

// ===== 2) Datenbank antwortet, verweigert aber =====
modus="block";
await page.evaluate(()=>{ localStorage.setItem("vereinsapp_config", JSON.stringify({url:"http://127.0.0.1:4268", key:"test"})); });
await page.reload({waitUntil:"networkidle"}); await page.waitForTimeout(3200);
b=await body();
if(/verweigert gerade den Zugriff/.test(b)) ok("Bei abgewiesenem Zugriff steht ein eigener, deutlicher Text");
else fail("Kein Hinweis bei 403: "+b.slice(0,260).replace(/\n/g," | "));
{ const rot=await page.evaluate(()=>{
    const el=[...document.querySelectorAll("div")].find(d=>/verweigert gerade den Zugriff/.test(d.innerText||"")&&getComputedStyle(d).position==="fixed");
    return el?getComputedStyle(el).backgroundColor:null; });
  if(rot&&/127, 29, 29|rgb\(127/.test(rot)) ok("Und zwar in Rot ("+rot+")"); else console.log("HINWEIS: Farbe "+rot); }

// ===== 3) Alles in Ordnung -> kein Hinweis =====
modus="ok";
await page.reload({waitUntil:"networkidle"}); await page.waitForTimeout(3200);
b=await body();
if(!/Keine Verbindung zur Datenbank|verweigert gerade den Zugriff/.test(b)) ok("Läuft die Datenbank, steht kein Hinweis da");
else fail("Hinweis bleibt trotz funktionierender Datenbank: "+b.slice(0,200).replace(/\n/g," | "));

if(errors.length){ console.log("JS-FEHLER:"); [...new Set(errors)].forEach(e=>console.log(" -",e.slice(0,150))); }
console.log(errors.length||fails.length?`ERGEBNIS: ${fails.length} Fehlschläge, ${errors.length} JS-Fehler`:"ERGEBNIS: ALLES OK");
await browser.close(); srv.close(); db.close();
process.exit(errors.length||fails.length?1:0);
