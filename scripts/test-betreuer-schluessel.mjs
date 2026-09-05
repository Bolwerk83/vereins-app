// E2E-Test: Der Betreuer-Schlüssel rechnet nur mit Kindern.
// Die Zusage eines Trainers oder Helfers machte die erwartete Spielerzahl
// größer ("~13 Spieler" bei 11 Kinder-Zusagen und 2 Betreuern) und damit
// den Betreuer-Bedarf falsch.
// Aufruf: npm run build && node scripts/test-betreuer-schluessel.mjs
import { chromium } from "playwright-core";
import http from "http"; import fs from "fs"; import path from "path";
const dist = path.resolve("dist");
const srv = http.createServer((req,res)=>{ let p=path.join(dist,req.url.split("?")[0]); if(!fs.existsSync(p)||fs.statSync(p).isDirectory()) p=path.join(dist,"index.html"); res.setHeader("content-type",{".html":"text/html",".js":"text/javascript",".css":"text/css"}[path.extname(p)]||"text/plain"); res.end(fs.readFileSync(p)); }).listen(4297);
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

await page.addInitScript(()=>{ if(!localStorage.getItem("vereinsapp_config")) localStorage.setItem("vereinsapp_config", JSON.stringify({url:"https://127.0.0.1:1/x", key:"test"})); });
await page.goto("http://127.0.0.1:4297/", { waitUntil:"networkidle" }); await page.waitForTimeout(2500);
await page.evaluate(()=>{ localStorage.setItem("va_simple","0"); localStorage.setItem("va_tsimple","0");
  sessionStorage.setItem("vereinsapp_v12_session", JSON.stringify({role:"trainer",cid:"demo",tids:["demo_f1"],name:"Demo Trainer",id:"demo_tr1"})); });
await page.reload({waitUntil:"networkidle"}); await page.waitForTimeout(2600); await dismiss();
await page.evaluate(()=>{ const b=[...document.querySelectorAll("button")].find(x=>/Bin dabei/.test(x.innerText)); b&&b.click(); });
await page.waitForTimeout(1500);

// Spiel: alle Kinder des Kaders sagen zu, dazu zwei Betreuer
const info = await page.evaluate(()=>{
  const d=JSON.parse(localStorage.getItem("vereinsapp_v14")||"null"); if(!d) return null;
  const p=v=>String(v).padStart(2,"0"); const tg=n=>{const x=new Date(Date.now()+n*86400000);return `${x.getFullYear()}-${p(x.getMonth()+1)}-${p(x.getDate())}`;};
  const evs=(d.events||[]).filter(e=>e.cid==="demo"&&e.tid==="demo_f1").sort((a,b)=>String(a.date).localeCompare(String(b.date)));
  if(!evs.length) return null;
  const kader=[...new Set([...((d.players||{})["demo_f1"]||[]),
    ...((d.playerProfiles||[]).filter(pp=>pp.mainTid==="demo_f1"&&!pp.archived).map(pp=>pp.name))])];
  const trainer=(d.trainers||[]).filter(t=>t.cid==="demo").map(t=>t.name);
  const ts=new Date().toISOString();
  const votes={};
  kader.forEach(n=>{ votes[n]={val:"yes",ts,role:"player"}; });
  // zwei Betreuer sagen ebenfalls zu
  const be=[...new Set([...(trainer.length?trainer:["Demo Trainer"]),"Demo Trainer"])].slice(0,2);
  be.forEach(n=>{ votes[n]={val:"yes",ts,role:"trainer"}; });
  Object.assign(evs[0],{ type:"heimspiel", date:tg(2), time:"10:30", endTime:"12:00", title:"SV Adler",
    loc:"Platz 1", note:"", deadline:null, carpoolExtra:false, carpoolEnabled:false, extraPolls:[], duties:[],
    sollPlayers:null, votes, trainerPresence:{}, helperOffers:[] });
  evs.slice(1).forEach(e=>{ e.date=tg(12); });
  localStorage.setItem("vereinsapp_v14", JSON.stringify(d));
  return { kinder:kader.length, betreuer:be.length, perStaff:(d.clubs||[]).find(c=>c.id==="demo")?.clubSettings?.playersPerStaff||6 };
});
if(info) ok(`Testdaten: ${info.kinder} Kinder sagen zu, dazu ${info.betreuer} Betreuer (Schlüssel ${info.perStaff} je Betreuer)`);
else fail("Konnte die Testdaten nicht setzen");
await page.reload({waitUntil:"networkidle"}); await page.waitForTimeout(2800); await dismiss();
await page.evaluate(()=>{ const b=[...document.querySelectorAll("button")].find(x=>/^(Ansehen|✅ Anwesenheit)$/.test((x.innerText||"").trim())); b&&b.click(); });
await page.waitForTimeout(1500);
const b=await body();

// Die Kachel "Spieler dabei" zählt bereits nur Kinder
{ const m=b.match(/(\d+)\s*\n?\s*Spieler dabei/);
  if(m&&Number(m[1])===info.kinder) ok(`„Spieler dabei" zählt nur Kinder: ${m[1]}`);
  else fail("Spieler-Zahl unerwartet: "+(m?m[1]:"?")+" statt "+info.kinder); }

// Der Betreuer-Schlüssel muss dieselbe Zahl verwenden
{ const m=b.match(/~(\d+) Spieler/);
  if(!m) fail("Kein Betreuer-Schlüssel sichtbar: "+b.slice(0,320).replace(/\n/g," | "));
  else if(Number(m[1])===info.kinder) ok(`Der Betreuer-Schlüssel rechnet mit denselben ${m[1]} Kindern`);
  else fail(`Betreuer-Schlüssel rechnet mit ~${m[1]} statt ${info.kinder} – die Betreuer werden mitgezählt`); }

// Und der daraus abgeleitete Bedarf stimmt
{ const soll=Math.max(1,Math.ceil(info.kinder/info.perStaff));
  const m=b.match(/Betreuer (\d+)\/(\d+)/);
  if(m&&Number(m[2])===soll) ok(`Daraus folgt der richtige Bedarf: ${m[1]}/${m[2]} (${info.kinder} Kinder ÷ ${info.perStaff})`);
  else fail(`Bedarf falsch: ${m?m[0]:"?"} – erwartet /${soll}`); }

if(errors.length){ console.log("JS-FEHLER:"); [...new Set(errors)].forEach(e=>console.log(" -",e.slice(0,150))); }
console.log(errors.length||fails.length?`ERGEBNIS: ${fails.length} Fehlschläge, ${errors.length} JS-Fehler`:"ERGEBNIS: ALLES OK");
await browser.close(); srv.close();
process.exit(errors.length||fails.length?1:0);
