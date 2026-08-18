// E2E-Test: Ein verwaister Saison-Zeiger (activeSeason zeigt auf eine geloeschte
// Saison) darf NICHT dazu fuehren, dass alle Termine verschwinden - genau der
// Fall aus der Praxis: Trainer/Helfer sehen "0 Termine", obwohl 26 da sind.
// Aufruf: npm run build && node scripts/test-saisonzeiger.mjs
import { chromium } from "playwright-core";
import http from "http"; import fs from "fs"; import path from "path";
const dist = path.resolve("dist");
const srv = http.createServer((req,res)=>{ let p=path.join(dist,req.url.split("?")[0]); if(!fs.existsSync(p)||fs.statSync(p).isDirectory()) p=path.join(dist,"index.html"); res.setHeader("content-type",{".html":"text/html",".js":"text/javascript",".css":"text/css"}[path.extname(p)]||"text/plain"); res.end(fs.readFileSync(p)); }).listen(4220);
const exe=process.env.PLAYWRIGHT_CHROMIUM||"/opt/pw-browsers/chromium-1194/chrome-linux/chrome";
const browser = await chromium.launch({ executablePath:exe, args:["--no-sandbox"] });
const page = await browser.newPage({ viewport:{ width:390, height:900 } });
const errors=[]; const fails=[];
page.on("pageerror", e=>errors.push(e.message));
page.on("dialog", d=>d.accept());
const fail=m=>{ fails.push(m); console.log("FEHLGESCHLAGEN:", m); };
const ok=m=>console.log("OK:", m);
const body=()=>page.evaluate(()=>document.body.innerText);

// Vor dem Start: Demo-Daten so verbiegen wie in der Praxis - activeSeason zeigt
// auf eine Saison-ID, die es in der Liste gar nicht (mehr) gibt.
await page.addInitScript(()=>{
  localStorage.setItem("vereinsapp_config", JSON.stringify({url:"https://127.0.0.1:1/x", key:"test"}));
  sessionStorage.setItem("vereinsapp_v12_session", JSON.stringify({ role:"trainer", cid:"demo", tids:["demo_f1"], name:"Trainer A", id:"dt1" }));
  // Nach dem Boot (refreshDemo baut die Demo neu auf) den Zeiger kaputt machen
  window.__brechenNach = true;
});
await page.goto("http://127.0.0.1:4220/", { waitUntil:"networkidle" }); await page.waitForTimeout(2500);
await page.locator('button:has-text("Überspringen")').first().click().catch(()=>{}); await page.waitForTimeout(400);

let b=await body();
const vorher=(b.match(/(\d+)\s*\n?\s*Anstehende Termine/)||[])[1];
if(Number(vorher)>0) ok("Ausgangslage: Termine sichtbar ("+vorher+")"); else fail("Keine Termine im Ausgangszustand");

// Einmal speichern, damit der Offline-Spiegel existiert (Fake-Cloud)
await page.evaluate(()=>{ const b2=[...document.querySelectorAll("button")].find(x=>x.innerText.includes("Bin dabei")); b2&&b2.click(); });
await page.waitForTimeout(1200);
// Jetzt den Saison-Zeiger ins Leere zeigen lassen und neu laden
await page.evaluate(()=>{
  const d=JSON.parse(localStorage.getItem("vereinsapp_v14"));
  d.activeSeason="s_gibt_es_nicht_mehr";
  (d.clubs||[]).forEach(c=>{ if(c.id==="demo") c.activeSeason="s_gibt_es_nicht_mehr"; });
  localStorage.setItem("vereinsapp_v14", JSON.stringify(d));
  sessionStorage.setItem("va_keep","1");
});
await page.reload({waitUntil:"networkidle"}); await page.waitForTimeout(2500);
await page.locator('button:has-text("Überspringen")').first().click().catch(()=>{}); await page.waitForTimeout(400);
b=await body();
const nachher=(b.match(/(\d+)\s*\n?\s*Anstehende Termine/)||[])[1];
if(Number(nachher)>0) ok("Verwaister Saison-Zeiger blendet die Termine NICHT aus ("+nachher+")");
else fail("Termine verschwunden trotz kaputtem Saison-Zeiger");
if(!b.includes("Noch keine Termine")) ok("Keine irreführende Leermeldung"); else fail("Leermeldung trotz vorhandener Termine");

if(errors.length){ console.log("JS-FEHLER:"); [...new Set(errors)].forEach(e=>console.log(" -",e.slice(0,150))); }
console.log(errors.length||fails.length?`ERGEBNIS: ${fails.length} Fehlschläge, ${errors.length} JS-Fehler`:"ERGEBNIS: ALLES OK");
await browser.close(); srv.close();
process.exit(errors.length||fails.length?1:0);
