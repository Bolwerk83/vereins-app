// E2E-Test: Wer ist Spieler, wer ist Betreuer?
// Ein Kind darf nie bei den Betreuern landen - auch dann nicht, wenn
//  a) seine Zusage unter dem abgekürzten Namen steht ("Zinedin S." statt
//     "Zinedin Sarr"), oder
//  b) es aus einer anderen Mannschaft aushilft und deshalb nicht im Kader
//     dieser Mannschaft steht.
// Aufruf: npm run build && node scripts/test-betreuer-abgrenzung.mjs
import { chromium } from "playwright-core";
import http from "http"; import fs from "fs"; import path from "path";
const dist = path.resolve("dist");
const srv = http.createServer((req,res)=>{ let p=path.join(dist,req.url.split("?")[0]); if(!fs.existsSync(p)||fs.statSync(p).isDirectory()) p=path.join(dist,"index.html"); res.setHeader("content-type",{".html":"text/html",".js":"text/javascript",".css":"text/css"}[path.extname(p)]||"text/plain"); res.end(fs.readFileSync(p)); }).listen(4277);
const exe=process.env.PLAYWRIGHT_CHROMIUM||"/opt/pw-browsers/chromium-1194/chrome-linux/chrome";
const browser = await chromium.launch({ executablePath:exe, args:["--no-sandbox"] });
const page = await browser.newPage({ viewport:{ width:390, height:900 } });
const errors=[]; const fails=[];
page.on("pageerror", e=>errors.push(e.message));
page.on("dialog", d=>d.accept());
const fail=m=>{ fails.push(m); console.log("FEHLGESCHLAGEN:", m); };
const ok=m=>console.log("OK:", m);
const body=()=>page.evaluate(()=>document.body.innerText);
const dismiss=async()=>{ for(let k=0;k<12;k++){ const done=await page.evaluate(()=>{
  const fx=[...document.querySelectorAll("div")].filter(d=>getComputedStyle(d).position==="fixed"&&d.querySelector("button")&&d.innerText.length>30);
  for(const f of fx){ const b=[...f.querySelectorAll("button")].find(x=>/geht|Los|Verstanden|Alles klar|Fertig|Jetzt nicht|Weiter →|Überspringen|Start/i.test(x.innerText)); if(b){ b.click(); return false; } }
  return true; }); await page.waitForTimeout(400); if(done) break; } };
await page.addInitScript(()=>{
  if(!localStorage.getItem("vereinsapp_config")) localStorage.setItem("vereinsapp_config", JSON.stringify({url:"https://127.0.0.1:1/x", key:"test"}));
  if(localStorage.getItem("va_simple")===null)  localStorage.setItem("va_simple","0");
  if(localStorage.getItem("va_tsimple")===null) localStorage.setItem("va_tsimple","0");
});
await page.goto("http://127.0.0.1:4277/", { waitUntil:"networkidle" }); await page.waitForTimeout(2500);
await page.evaluate(()=>{ sessionStorage.setItem("vereinsapp_v12_session", JSON.stringify({role:"trainer",cid:"demo",tids:["demo_f1"],name:"Demo Trainer",id:"demo_tr1"})); });
await page.reload({waitUntil:"networkidle"}); await page.waitForTimeout(2600); await dismiss();
await page.evaluate(()=>{ const b=[...document.querySelectorAll("button")].find(x=>/Bin dabei/.test(x.innerText)); b&&b.click(); });
await page.waitForTimeout(1500);

const kind = await page.evaluate(()=>{
  const d=JSON.parse(localStorage.getItem("vereinsapp_v14")||"null"); if(!d) return null;
  const ev=(d.events||[]).filter(e=>e.cid==="demo"&&e.tid==="demo_f1"&&(e.pt==="att"||!e.pt))
    .sort((a,b)=>String(a.date||"").localeCompare(String(b.date||"")))[0]; if(!ev) return null;
  const kader=(d.playerProfiles||[]).filter(p=>p.mainTid==="demo_f1"&&!p.archived);
  const voll=kader[0]&&kader[0].name; if(!voll) return null;
  const kurz=voll.split(" ").length>1 ? voll.split(" ")[0]+" "+voll.split(" ").pop()[0]+"." : null;
  // Aushilfe aus einer anderen Mannschaft (Jahrgang passend, damit erlaubt)
  const rest=(d.playerProfiles||[]).filter(p=>p.id!=="pp_aus_test");
  d.playerProfiles=[...rest,{id:"pp_aus_test",cid:"demo",name:"Aylin Aushilf",by:2020,gender:"w",mainTid:"demo_g",optTids:["demo_f1"],archived:false}];
  const v={...(ev.votes||{})};
  delete v[voll];                                             // nur die Kurzform stimmt ab
  v[kurz]        = {val:"yes",ts:"2026-08-31T18:08:00.000Z"}; // ohne Rollen-Merker (Altbestand)
  v["Aylin Aushilf"]={val:"yes",ts:"2026-08-31T18:09:00.000Z"};
  v["Demo Trainer"] ={val:"yes",ts:"2026-08-31T18:10:00.000Z",role:"trainer"};
  ev.votes=v;
  localStorage.setItem("vereinsapp_v14", JSON.stringify(d));
  return kurz;
});
if(kind) ok("Testdaten gesetzt – Zusage steht unter der Kurzform „"+kind+"“");
else fail("Konnte keine Testdaten setzen");
await page.reload({waitUntil:"networkidle"}); await page.waitForTimeout(2800); await dismiss();

await page.evaluate(()=>{ const b=[...document.querySelectorAll("button")].find(x=>/^(Ansehen|✅ Anwesenheit)$/.test((x.innerText||"").trim())); b&&b.click(); });
await page.waitForTimeout(1500);
await page.evaluate(()=>{ const b=[...document.querySelectorAll("button")].find(x=>/^(📊 Rückmeldungen|Rückmeldungen)$/.test((x.innerText||"").trim())); b&&b.click(); });
await page.waitForTimeout(1000);

const betreuer = await page.evaluate(()=>{
  const alle=[...document.querySelectorAll("div")].filter(d=>/^🧑‍🏫 BETREUER/.test((d.innerText||"").trim()));
  const kopf=alle[alle.length-1]; if(!kopf) return null;
  return kopf.parentElement.innerText.replace(/\n/g," | ");
});
if(betreuer) ok("Betreuer-Liste gefunden: "+betreuer);
else fail("Keine Betreuer-Liste");
if(betreuer&&/Demo Trainer/.test(betreuer)) ok("Der Trainer steht bei den Betreuern");
else fail("Trainer fehlt bei den Betreuern");
if(betreuer&&!new RegExp(String(kind).replace(/[.*+?^${}()|[\]\\]/g,"\\$&")).test(betreuer))
  ok("Das Kind mit abgekürztem Namen steht NICHT bei den Betreuern");
else fail("Kind mit Kurzform landet bei den Betreuern: "+betreuer);
if(betreuer&&!/Aylin Aushilf/.test(betreuer)) ok("Die Aushilfe aus der anderen Mannschaft steht NICHT bei den Betreuern");
else fail("Aushilfe landet bei den Betreuern: "+betreuer);
if(/BETREUER \(1\)/.test(betreuer||"")) ok("Es wird genau ein Betreuer gezählt");
else fail("Falsche Betreuer-Zahl: "+(betreuer||"").slice(0,60));

// Und sie zählen als Spieler mit
{ const b=await body();
  const kopf=(b.match(/(\d+)\s*\nSpieler dabei/)||b.match(/(\d+)[^\d]{0,20}Spieler dabei/)||[])[1];
  if(kopf&&Number(kopf)>=2) ok("Beide zählen als Spieler mit (dabei: "+kopf+")");
  else fail("Spieler-Zahl stimmt nicht: "+(kopf||"?")); }

if(errors.length){ console.log("JS-FEHLER:"); [...new Set(errors)].forEach(e=>console.log(" -",e.slice(0,150))); }
console.log(errors.length||fails.length?`ERGEBNIS: ${fails.length} Fehlschläge, ${errors.length} JS-Fehler`:"ERGEBNIS: ALLES OK");
await browser.close(); srv.close();
process.exit(errors.length||fails.length?1:0);
