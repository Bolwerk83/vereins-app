// E2E-Test: Ist die Vereinsliste leer, muss die App sagen WARUM - Datenbank
// nicht erreichbar, oder kein Verein oeffentlich sichtbar.
// Aufruf: npm run build && node scripts/test-vereinsliste.mjs
import { chromium } from "playwright-core";
import http from "http"; import fs from "fs"; import path from "path";
const dist = path.resolve("dist");
const srv = http.createServer((req,res)=>{ let p=path.join(dist,req.url.split("?")[0]); if(!fs.existsSync(p)||fs.statSync(p).isDirectory()) p=path.join(dist,"index.html"); res.setHeader("content-type",{".html":"text/html",".js":"text/javascript",".css":"text/css"}[path.extname(p)]||"text/plain"); res.end(fs.readFileSync(p)); }).listen(4269);
let modus="ok";
const db = http.createServer((req,res)=>{
  res.setHeader("access-control-allow-origin","*"); res.setHeader("access-control-allow-headers","*");
  res.setHeader("access-control-allow-methods","GET,POST,PATCH,OPTIONS"); res.setHeader("content-type","application/json");
  if(req.method==="OPTIONS"){ res.statusCode=204; res.end(); return; }
  res.statusCode=200; res.end(JSON.stringify([]));   // Cloud erreichbar, aber leer
}).listen(4270);
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
await page.addInitScript(()=>{ if(!localStorage.getItem("vereinsapp_config")) localStorage.setItem("vereinsapp_config", JSON.stringify({url:"https://127.0.0.1:1/x", key:"test"})); });
await page.goto("http://127.0.0.1:4269/", { waitUntil:"networkidle" }); await page.waitForTimeout(3200);
// alle Vereine lokal entfernen, damit die Liste wirklich leer ist
await page.evaluate(()=>{ const d=JSON.parse(localStorage.getItem("vereinsapp_v14")||"null")||{}; d.clubs=[]; localStorage.setItem("vereinsapp_v14",JSON.stringify(d)); });
await page.reload({waitUntil:"networkidle"}); await page.waitForTimeout(3200);
let b=await body();
if(/Vereinsliste konnte nicht geladen werden/.test(b)) ok("Bei gestörter Datenbank sagt die Liste, dass nichts geladen wurde");
else fail("Kein Hinweis in der leeren Liste: "+b.slice(0,260).replace(/\n/g," | "));
if(/Vereinsdaten sind davon nicht betroffen/.test(b)) ok("Und beruhigt: die Vereinsdaten sind nicht betroffen");
{ const knopf=await page.evaluate(()=>!![...document.querySelectorAll("button")].find(x=>/Neu laden/.test(x.innerText||"")));
  if(knopf) ok("Mit Knopf zum erneuten Versuch"); }

// ===== 2) Datenbank ok, aber Verein nicht öffentlich =====
await page.evaluate(()=>{ localStorage.setItem("vereinsapp_config", JSON.stringify({url:"http://127.0.0.1:4270", key:"test"})); });
await page.reload({waitUntil:"networkidle"}); await page.waitForTimeout(3000);
await page.evaluate(()=>{
  const d=JSON.parse(localStorage.getItem("vereinsapp_v14")||"null")||{};
  d.clubs=[{id:"c_test",name:"SUS Testdorf",slug:"sus-testdorf",dir:false,pub:false,sport:"fussball",pri:"#16a34a"}];
  localStorage.setItem("vereinsapp_v14",JSON.stringify(d));
});
await page.reload({waitUntil:"networkidle"}); await page.waitForTimeout(3200);
b=await body();
if(/Noch kein Verein in der Liste/.test(b)) ok("Ist alles geladen, sagt die App: kein Verein gelistet");
else fail("Kein Hinweis bei verstecktem Verein: "+b.slice(0,260).replace(/\n/g," | "));
if(/nicht öffentlich sichtbar/.test(b)) ok("Und nennt den Grund: der Verein ist nicht öffentlich sichtbar");
else fail("Grund fehlt");
if(/Im Verzeichnis sichtbar/.test(b)) ok("Sogar mit dem Weg dorthin (Einstellungen → Verein)"); else fail("Kein Hinweis auf die Einstellung");
if(/eigenen Link/.test(b)) ok("Und dem Hinweis, dass der eigene Link trotzdem funktioniert");

// ===== 3) Sichtbarer Verein -> Liste normal (lokaler Stand) =====
await page.evaluate(()=>{ localStorage.setItem("vereinsapp_config", JSON.stringify({url:"https://127.0.0.1:1/x", key:"test"})); });
await page.reload({waitUntil:"networkidle"}); await page.waitForTimeout(2600);
await page.evaluate(()=>{
  const d=JSON.parse(localStorage.getItem("vereinsapp_v14")||"null")||{};
  d.clubs=[{id:"c_test",name:"SUS Testdorf",slug:"sus-testdorf",dir:true,pub:true,sport:"fussball",pri:"#16a34a"}];
  localStorage.setItem("vereinsapp_v14",JSON.stringify(d));
});
await page.reload({waitUntil:"networkidle"}); await page.waitForTimeout(3200);
b=await body();
if(/SUS Testdorf/.test(b)&&!/Noch kein Verein in der Liste/.test(b)&&!/Vereinsliste konnte nicht geladen/.test(b)) ok("Ein sichtbarer Verein steht wieder ganz normal in der Liste");
else fail("Verein fehlt in der Liste: "+b.slice(0,240).replace(/\n/g," | "));

if(errors.length){ console.log("JS-FEHLER:"); [...new Set(errors)].forEach(e=>console.log(" -",e.slice(0,150))); }
console.log(errors.length||fails.length?`ERGEBNIS: ${fails.length} Fehlschläge, ${errors.length} JS-Fehler`:"ERGEBNIS: ALLES OK");
await browser.close(); srv.close(); db.close();
process.exit(errors.length||fails.length?1:0);
