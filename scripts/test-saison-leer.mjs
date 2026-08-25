// E2E-Test: Ist die aktive Saison leer, sagt die App klar, dass die Daten
// nicht weg sind - und bringt einen mit einem Tipp zurueck.
// Aufruf: npm run build && node scripts/test-saison-leer.mjs
import { chromium } from "playwright-core";
import http from "http"; import fs from "fs"; import path from "path";
const dist = path.resolve("dist");
const srv = http.createServer((req,res)=>{ let p=path.join(dist,req.url.split("?")[0]); if(!fs.existsSync(p)||fs.statSync(p).isDirectory()) p=path.join(dist,"index.html"); res.setHeader("content-type",{".html":"text/html",".js":"text/javascript",".css":"text/css"}[path.extname(p)]||"text/plain"); res.end(fs.readFileSync(p)); }).listen(4265);
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
await page.addInitScript(()=>{ localStorage.setItem("vereinsapp_config", JSON.stringify({url:"https://127.0.0.1:1/x", key:"test"})); localStorage.setItem("va_simple","0"); localStorage.setItem("va_tsimple","1"); });
await page.goto("http://127.0.0.1:4265/", { waitUntil:"networkidle" }); await page.waitForTimeout(2500);
await page.evaluate(()=>{ sessionStorage.setItem("vereinsapp_v12_session", JSON.stringify({role:"trainer",cid:"demo",tids:["demo_f1"],name:"Demo Trainer",id:"demo_tr1"})); });
await page.reload({waitUntil:"networkidle"}); await page.waitForTimeout(2600); await dismiss();
await page.evaluate(()=>{ const b=[...document.querySelectorAll("button")].find(x=>/Bin dabei/.test(x.innerText)); b&&b.click(); });
await page.waitForTimeout(1300);
{ const b0=await body();
  if(!/Diese Saison ist noch leer/.test(b0)) ok("Im Normalfall steht kein Hinweis da"); else fail("Hinweis erscheint fälschlich"); }

// Genau der gemeldete Fall: eine leere Saison ist aktiv
await page.evaluate(()=>{
  const d=JSON.parse(localStorage.getItem("vereinsapp_v14")||"null"); if(!d) return;
  const alt=(d.seasons||[]).find(s=>s.id==="s2627")||{id:"s2627",label:"2026/2027"};
  d.seasons=[{...alt,status:"archived"},{id:"leer1",label:"2027/2028",status:"active"}];
  // Termine gehoeren ausdruecklich zur alten Saison (wie im echten Verein)
  (d.events||[]).forEach(e=>{ if(e.cid==="demo"&&!e.seasonId) e.seasonId="s2627"; });
  d.activeSeason="leer1";
  d.clubs=(d.clubs||[]).map(c=>c.id==="demo"?{...c,activeSeason:"leer1"}:c);
  localStorage.setItem("vereinsapp_v14", JSON.stringify(d));
});
await page.reload({waitUntil:"networkidle"}); await page.waitForTimeout(2800); await dismiss();
let b=await body();
if(/Diese Saison ist noch leer/.test(b)) ok("Die App erklärt die leere Saison");
else fail("Kein Hinweis bei leerer Saison: "+b.slice(0,240).replace(/\n/g," | "));
if(/nicht weg/.test(b)) ok("Und sagt ausdrücklich, dass die Daten nicht weg sind"); else fail("Keine Beruhigung im Text");
if(/\d+ Spieler, \d+ Termine/.test(b)) ok("Mit Zahlen zur anderen Saison: "+(b.match(/\d+ Spieler, \d+ Termine/)||[""])[0]);
else fail("Keine Zahlen genannt");
if(/Zurück zu 2026\/27/.test(b)) ok("Und einem Knopf zurück"); else fail("Kein Zurück-Knopf: "+(b.match(/Zurück zu[^\n]*/)||[""])[0]);
await clickTxt("Zurück zu 2026"); await page.waitForTimeout(1600);
b=await body();
if(!/Diese Saison ist noch leer/.test(b)) ok("Nach dem Tipp ist der Hinweis weg");
else fail("Hinweis bleibt");
{ const wieder=await page.evaluate(()=>{
    const d=JSON.parse(localStorage.getItem("vereinsapp_v14")||"null");
    return { aktiv:d.activeSeason, klub:(d.clubs||[]).find(c=>c.id==="demo")?.activeSeason }; });
  if(wieder.aktiv==="s2627"||wieder.klub==="s2627") ok("Die alte Saison ist wieder aktiv");
  else fail("Saison nicht umgestellt: "+JSON.stringify(wieder)); }
if(/ALS NÄCHSTES|Keine Termine geplant/.test(b)) ok("Und die Termine sind wieder da");

if(errors.length){ console.log("JS-FEHLER:"); [...new Set(errors)].forEach(e=>console.log(" -",e.slice(0,150))); }
console.log(errors.length||fails.length?`ERGEBNIS: ${fails.length} Fehlschläge, ${errors.length} JS-Fehler`:"ERGEBNIS: ALLES OK");
await browser.close(); srv.close();
process.exit(errors.length||fails.length?1:0);
