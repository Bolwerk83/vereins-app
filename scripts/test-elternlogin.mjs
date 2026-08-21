// E2E-Test: Wechsel zum anderen Kind und der Weg zurueck. Merkt sich das
// Geraet das Team-Passwort, sprang die App frueher sofort wieder nach vorne -
// "Zurueck" fuehlte sich an, als passiere nichts.
// Aufruf: npm run build && node scripts/test-elternlogin.mjs
import { chromium } from "playwright-core";
import http from "http"; import fs from "fs"; import path from "path";
const dist = path.resolve("dist");
const srv = http.createServer((req,res)=>{ let p=path.join(dist,req.url.split("?")[0]); if(!fs.existsSync(p)||fs.statSync(p).isDirectory()) p=path.join(dist,"index.html"); res.setHeader("content-type",{".html":"text/html",".js":"text/javascript",".css":"text/css"}[path.extname(p)]||"text/plain"); res.end(fs.readFileSync(p)); }).listen(4235);
const exe=process.env.PLAYWRIGHT_CHROMIUM||"/opt/pw-browsers/chromium-1194/chrome-linux/chrome";
const browser = await chromium.launch({ executablePath:exe, args:["--no-sandbox"] });
const page = await browser.newPage({ viewport:{ width:390, height:844 } });
const errors=[]; const fails=[];
page.on("pageerror", e=>errors.push(e.message));
page.on("dialog", d=>d.accept());
const fail=m=>{ fails.push(m); console.log("FEHLGESCHLAGEN:", m); };
const ok=m=>console.log("OK:", m);
const body=()=>page.evaluate(()=>document.body.innerText);
const clickTxt=re=>page.evaluate(r=>{ const b=[...document.querySelectorAll("button")].find(x=>new RegExp(r).test(x.innerText||"")); if(!b) return false; b.click(); return true; },re instanceof RegExp?re.source:re);
const dismiss=async()=>{ for(let k=0;k<10;k++){ const done=await page.evaluate(()=>{
  const fx=[...document.querySelectorAll("div")].filter(d=>getComputedStyle(d).position==="fixed"&&d.querySelector("button")&&d.innerText.length>30);
  for(const f of fx){ const b=[...f.querySelectorAll("button")].find(x=>/geht|Los|Verstanden|Alles klar|Fertig|Jetzt nicht|Weiter →|Überspringen|Schließen/i.test(x.innerText)); if(b){ b.click(); return false; } }
  return true; }); await page.waitForTimeout(420); if(done) break; } };
await page.addInitScript(()=>{
  localStorage.setItem("vereinsapp_config", JSON.stringify({url:"https://127.0.0.1:1/x", key:"test"}));
  localStorage.setItem("va_teamok_demo_f1","h2h7");   // Geraet kennt das Team-Passwort schon
  sessionStorage.setItem("vereinsapp_v12_session", JSON.stringify({ role:"user", cid:"demo", tid:"demo_f1", user:"Ben Fischer" }));
});
await page.goto("http://127.0.0.1:4235/", { waitUntil:"networkidle" }); await page.waitForTimeout(2500);
await dismiss();

// ===== 1) Zum anderen Kind wechseln =====
let b=await body();
if(/Anderes Kind/.test(b)) ok("„Anderes Kind“ steht in der einfachen Ansicht"); else fail("Kein Kind-Wechsel: "+b.slice(-160).replace(/\n/g," | "));
await clickTxt("Anderes Kind"); await page.waitForTimeout(1400);
b=await body();
const nameListe=/Wer bist du|suchen|Ben|Leon|Lina|Sophie/i.test(b);
if(nameListe) ok("Der Wechsel führt direkt zur Namensliste (Team-Passwort ist gemerkt)"); else ok("Passwort wird abgefragt (Merker nicht aktiv)");
if(/Dieses Handy kennt das Passwort/.test(b)) ok("Die App erklärt, warum kein Passwort kommt"); else fail("Kein Hinweis auf das gemerkte Passwort");
if(/Wieder fragen/.test(b)) ok("Das Merken lässt sich mit einem Tipp rückgängig machen"); else fail("Kein Weg, das Passwort wieder abfragen zu lassen");

// ===== 2) Zurück muss wirken – frühere Endlosschleife =====
const vorher=await body();
if(await clickTxt("Zurück")){
  await page.waitForTimeout(1300);
  const nachher=await body();
  if(nachher!==vorher) ok("„Zurück“ ändert die Ansicht wirklich"); else fail("Zurück bleibt wirkungslos – die App springt sofort zurück");
  if(/Jugend|Mannschaft|F-Jugend|Verein/i.test(nachher)) ok("Zurück führt zur Auswahl davor"); else fail("Zurück landet nirgends Sinnvollem: "+nachher.slice(0,150).replace(/\n/g," | "));
  // Zweites Zurück
  const v2=await body();
  await clickTxt("Zurück"); await page.waitForTimeout(1200);
  const n2=await body();
  if(n2!==v2) ok("Auch der zweite Schritt zurück funktioniert"); else fail("Zweites Zurück wirkungslos");
} else fail("Kein Zurück-Knopf gefunden: "+vorher.slice(0,150).replace(/\n/g," | "));

// ===== 3) Vorwärts geht es weiterhin =====
b=await body();
if(/F-Jugend/.test(b)){
  await page.evaluate(()=>{ const el=[...document.querySelectorAll("div,button")].find(x=>/F-Jugend/.test(x.innerText||"")&&(x.innerText||"").length<60); el&&el.click(); });
  await page.waitForTimeout(1200);
  const b2=await body();
  if(/Ben|Leon|Lina|Sophie|Passwort/i.test(b2)) ok("Nach dem Zurückgehen kommt man wieder vorwärts"); else fail("Vorwärts blockiert: "+b2.slice(0,150).replace(/\n/g," | "));
} else console.log("HINWEIS: Jugend-Auswahl nicht sichtbar – Schritt übersprungen");

if(errors.length){ console.log("JS-FEHLER:"); [...new Set(errors)].forEach(e=>console.log(" -",e.slice(0,150))); }
console.log(errors.length||fails.length?`ERGEBNIS: ${fails.length} Fehlschläge, ${errors.length} JS-Fehler`:"ERGEBNIS: ALLES OK");
await browser.close(); srv.close();
process.exit(errors.length||fails.length?1:0);
