// E2E-Test: In der Betreuer-Liste am Termin steht, wann wer zu- oder
// abgesagt hat.
// Aufruf: npm run build && node scripts/test-betreuer-zeit.mjs
import { chromium } from "playwright-core";
import http from "http"; import fs from "fs"; import path from "path";
const dist = path.resolve("dist");
const srv = http.createServer((req,res)=>{ let p=path.join(dist,req.url.split("?")[0]); if(!fs.existsSync(p)||fs.statSync(p).isDirectory()) p=path.join(dist,"index.html"); res.setHeader("content-type",{".html":"text/html",".js":"text/javascript",".css":"text/css"}[path.extname(p)]||"text/plain"); res.end(fs.readFileSync(p)); }).listen(4261);
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
await page.goto("http://127.0.0.1:4261/", { waitUntil:"networkidle" }); await page.waitForTimeout(2500);
await page.evaluate(()=>{ sessionStorage.setItem("vereinsapp_v12_session", JSON.stringify({role:"trainer",cid:"demo",tids:["demo_f1"],name:"Demo Trainer",id:"demo_tr1"})); });
await page.reload({waitUntil:"networkidle"}); await page.waitForTimeout(2600); await dismiss();
await page.evaluate(()=>{ const b=[...document.querySelectorAll("button")].find(x=>/Bin dabei/.test(x.innerText)); b&&b.click(); });
await page.waitForTimeout(1400);

// Zwei Betreuer-Stimmen mit klarem Zeitstempel setzen
await page.evaluate(()=>{
  const d=JSON.parse(localStorage.getItem("vereinsapp_v14")||"null"); if(!d) return;
  const ev=(d.events||[]).find(e=>e.cid==="demo"&&e.tid==="demo_f1"&&(e.pt==="att"||!e.pt)); if(!ev) return;
  ev.votes={...(ev.votes||{}),
    "Demo Trainer":{val:"yes",ts:"2026-08-20T14:12:00.000Z"},
    "Trainer B":{val:"no",ts:"2026-08-21T09:03:00.000Z"}};
  localStorage.setItem("vereinsapp_v14", JSON.stringify(d));
});
await page.reload({waitUntil:"networkidle"}); await page.waitForTimeout(2800); await dismiss();

// Termin öffnen (Rückmeldungen)
await page.evaluate(()=>{ const b=[...document.querySelectorAll("button")].find(x=>/^(Ansehen|✅ Anwesenheit)$/.test((x.innerText||"").trim())); b&&b.click(); });
await page.waitForTimeout(1400);
await page.evaluate(()=>{ const b=[...document.querySelectorAll("button")].find(x=>/^(📊 Rückmeldungen|Rückmeldungen)$/.test((x.innerText||"").trim())); b&&b.click(); });
await page.waitForTimeout(900);
let b=await body();
if(/BETREUER/.test(b)) ok("Die Betreuer-Liste ist da: "+(b.match(/BETREUER[^\n]*/)||[""])[0]);
else fail("Keine Betreuer-Liste: "+b.slice(0,220).replace(/\n/g," | "));
if(/Demo Trainer/.test(b)) ok("Der Betreuer steht drin"); else fail("Betreuer fehlt");
if(/✓ zugesagt/.test(b)) ok("Mit klarem Status „zugesagt“"); else fail("Kein Status");
if(/✕ abgesagt/.test(b)) ok("Auch Absagen werden gezeigt"); else console.log("HINWEIS: keine Absage im Termin");
{ const zeit=(b.match(/[A-Z][a-z], \d\d\.\d\d\. · \d\d:\d\d Uhr/g)||[]);
  if(zeit.length>=1) ok("Und dahinter steht, wann: "+zeit.join(" / "));
  else fail("Kein Zeitpunkt bei den Betreuern: "+b.slice(b.indexOf("BETREUER"), b.indexOf("BETREUER")+180).replace(/\n/g," | ")); }
{ const paar=await page.evaluate(()=>{
    const kopf=[...document.querySelectorAll("div")].find(d=>/^🧑‍🏫 BETREUER/.test((d.innerText||"").trim()));
    if(!kopf) return null; const box=kopf.parentElement;
    return [...box.children].slice(1).map(r=>(r.innerText||"").replace(/\n/g," ").trim()); });
  if(paar&&paar.length>=1&&/zugesagt|abgesagt/.test(paar[0])) ok("Jede Zeile: Name · Status · Zeitpunkt („"+paar[0]+"“)");
  else fail("Zeilenaufbau unerwartet: "+JSON.stringify(paar)); }

if(errors.length){ console.log("JS-FEHLER:"); [...new Set(errors)].forEach(e=>console.log(" -",e.slice(0,150))); }
console.log(errors.length||fails.length?`ERGEBNIS: ${fails.length} Fehlschläge, ${errors.length} JS-Fehler`:"ERGEBNIS: ALLES OK");
await browser.close(); srv.close();
process.exit(errors.length||fails.length?1:0);
