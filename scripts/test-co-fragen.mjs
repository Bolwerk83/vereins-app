// E2E-Test: Co fragt bis zu zehnmal nach - aber nur, was er wirklich braucht.
//   1. Weiß er nichts, stellt er viele Fragen (mehr als fünf, höchstens zehn).
//   2. Was in der App steht (Kadergröße, Dauer, Altersklasse, Betreuer),
//      fragt er NICHT - er sagt stattdessen, dass er es schon wusste.
//   3. Der Zähler sagt, wie viele Fragen noch kommen.
//   4. „Das reicht – rechne jetzt“ bricht ab und rechnet sofort.
//   5. Die Zusatz-Antworten landen im Rechenweg.
// Aufruf: npm run build && node scripts/test-co-fragen.mjs
import { chromium } from "playwright-core";
import http from "http"; import fs from "fs"; import path from "path";
const dist = path.resolve("dist");
const srv = http.createServer((req,res)=>{ let p=path.join(dist,req.url.split("?")[0]); if(!fs.existsSync(p)||fs.statSync(p).isDirectory()) p=path.join(dist,"index.html"); res.setHeader("content-type",{".html":"text/html",".js":"text/javascript",".css":"text/css"}[path.extname(p)]||"text/plain"); res.end(fs.readFileSync(p)); }).listen(4323);
const exe=process.env.PLAYWRIGHT_CHROMIUM||"/opt/pw-browsers/chromium-1194/chrome-linux/chrome";
const browser = await chromium.launch({ executablePath:exe, args:["--no-sandbox"] });
const page = await browser.newPage({ viewport:{ width:390, height:900 } });
page.setDefaultTimeout(10000);
const errors=[]; const fails=[];
page.on("pageerror", e=>errors.push(e.message));
page.on("dialog", d=>d.accept());
const fail=m=>{ fails.push(m); console.log("FEHLGESCHLAGEN:", m); };
const ok=m=>console.log("OK:", m);
const body=()=>page.evaluate(()=>document.body.innerText);
const kurz=t=>String(t).slice(-400).replace(/\n/g," | ");
const klick=(re)=>page.evaluate(r=>{
  const b=[...document.querySelectorAll("button")].find(x=>new RegExp(r).test((x.innerText||"").replace(/\s+/g," ").trim()));
  if(!b||b.disabled) return false; b.click(); return true; }, re instanceof RegExp?re.source:re);
const dismiss=async()=>{ for(let k=0;k<12;k++){ const done=await page.evaluate(()=>{
  const fx=[...document.querySelectorAll("div")].filter(d=>getComputedStyle(d).position==="fixed"&&d.querySelector("button")&&d.innerText.length>30&&!/Co – dein Co-Trainer|Co · dein Co-Trainer/.test(d.innerText||""));
  for(const f of fx){ const b=[...f.querySelectorAll("button")].find(x=>/geht|Los|Verstanden|Alles klar|Fertig|Jetzt nicht|Weiter →|Überspringen|Start/i.test(x.innerText)); if(b){ b.click(); return false; } }
  return true; }); await page.waitForTimeout(400); if(done) break; } };
const oeffneCo = async () => {
  await page.evaluate(()=>{ const b=[...document.querySelectorAll("button")].find(x=>/^(Mehr|=)$/.test((x.innerText||"").trim())); b&&b.click(); });
  await page.waitForTimeout(900);
  const auf=await page.evaluate(()=>{ const b=[...document.querySelectorAll("button,div,a")].find(x=>/Co – dein Co-Trainer|Co · dein Co-Trainer/.test((x.innerText||"").trim())&&(x.innerText||"").length<40);
    if(!b) return false; b.click(); return true; });
  await page.waitForTimeout(1200); return auf;
};
const fragen = async (txt) => {
  await page.evaluate(t=>{ const i=[...document.querySelectorAll("input")].find(x=>/Woran hakt/.test(x.placeholder||""));
    if(!i) return; const set=Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype,"value").set;
    set.call(i,t); i.dispatchEvent(new Event("input",{bubbles:true})); }, txt);
  await page.waitForTimeout(400);
  await klick("^Fragen$"); await page.waitForTimeout(900);
};
// Immer die erste Antwort nehmen - so bleibt der Durchlauf vorhersagbar.
const ersteAntwort=()=>page.evaluate(()=>{
  const bs=[...document.querySelectorAll("button")].filter(x=>getComputedStyle(x).color==="rgb(76, 29, 149)");
  if(!bs.length) return false; bs[0].click(); return true; });
const fertig=()=>page.evaluate(()=>/🧮 Ergebnis/.test(document.body.innerText));
const durchfragen = async (max=12) => { let n=0;
  while(n<max){ if(await fertig()) break; if(!(await ersteAntwort())) break; n++; await page.waitForTimeout(600); }
  return n; };
await page.addInitScript(()=>{
  if(!localStorage.getItem("vereinsapp_config")) localStorage.setItem("vereinsapp_config", JSON.stringify({url:"https://127.0.0.1:1/x", key:"test"}));
  if(localStorage.getItem("va_simple")===null)  localStorage.setItem("va_simple","0");
  if(localStorage.getItem("va_tsimple")===null) localStorage.setItem("va_tsimple","0");
});
await page.goto("http://127.0.0.1:4323/", { waitUntil:"networkidle" }); await page.waitForTimeout(2500);
await page.evaluate(()=>{ sessionStorage.setItem("vereinsapp_v12_session", JSON.stringify({role:"trainer",cid:"demo",tids:["demo_f1"],name:"Demo Trainer",id:"demo_tr1"})); });
await page.reload({waitUntil:"networkidle"}); await page.waitForTimeout(2600); await dismiss();
await page.evaluate(()=>{ const b=[...document.querySelectorAll("button")].find(x=>/Bin dabei/.test(x.innerText)); b&&b.click(); });
await page.waitForTimeout(1400);

// ===== A) Co weiß nichts: er fragt alles nach =====
await page.evaluate(()=>{
  const d=JSON.parse(localStorage.getItem("vereinsapp_v14")||"null");
  (d.events||[]).filter(e=>e.tid==="demo_f1").forEach(e=>{ e.votes={}; e.endTime=""; });
  const t=(d.teams||[]).find(x=>x.id==="demo_f1"); if(t) t.cat="";
  d.trainers=(d.trainers||[]).map(x=>({...x, tids:(x.tids||[]).filter(i=>i!=="demo_f1")}));
  localStorage.setItem("vereinsapp_v14", JSON.stringify(d));
});
await page.reload({waitUntil:"networkidle"}); await page.waitForTimeout(2800); await dismiss();
if(await oeffneCo()) ok("Co ist erreichbar"); else { fail("Co nicht erreichbar"); process.exit(1); }
await fragen("wir müssen das zusammenspiel der mannschaft verbessern");
if(await klick("🧮 Fragen beantworten")) ok("Der geführte Weg startet"); else fail("Kein geführter Weg");
await page.waitForTimeout(800);
let b=await body();
if(/Ich frage höchstens zehnmal/.test(b)) ok("Er sagt vorweg, dass er höchstens zehnmal fragt");
else fail("Kein Hinweis auf die Obergrenze: "+kurz(b));
{ const m=b.match(/FRAGE 1 · noch (\d+) weitere/);
  if(m&&Number(m[1])>=4) ok(`Der Zähler sagt, wie viele noch kommen (noch ${m[1]})`);
  else fail("Kein brauchbarer Zähler: "+(b.match(/FRAGE 1[^\n]*/)||[""])[0]); }
const ohneWissen = await durchfragen();
if(ohneWissen>5&&ohneWissen<=10) ok(`Ohne Vorwissen stellt Co ${ohneWissen} Fragen – mehr als die bisherigen fünf, höchstens zehn`);
else fail("Unerwartete Fragenzahl ohne Vorwissen: "+ohneWissen);
b=await body();
if(/🧮 Ergebnis/.test(b)) ok("Am Ende steht ein Ergebnis"); else fail("Kein Ergebnis: "+kurz(b));
if(/Welche Altersklasse/.test(b)) ok("Ohne hinterlegte Altersklasse fragt er danach");
else fail("Altersklasse nicht gefragt: "+kurz(b));
if(/Wie viele Kinder sind im Training/.test(b)) ok("Und nach der Zahl der Kinder");
else fail("Kinderzahl nicht gefragt");
if(!/Wusste ich schon/.test(b)) ok("Und behauptet nicht, etwas gewusst zu haben");
else fail("Behauptet Wissen, das er nicht hat: "+kurz(b));

// ===== B) Co weiß Bescheid: dieselben Punkte kommen ohne Frage =====
await page.evaluate(()=>{
  const d=JSON.parse(localStorage.getItem("vereinsapp_v14")||"null");
  const p=v=>String(v).padStart(2,"0");
  const tg=n=>{ const x=new Date(Date.now()+n*86400000); return `${x.getFullYear()}-${p(x.getMonth()+1)}-${p(x.getDate())}`; };
  const t=(d.teams||[]).find(x=>x.id==="demo_f1"); if(t) t.cat="F-Jugend";
  d.trainers=(d.trainers||[]).map(x=>x.cid==="demo"?{...x, tids:[...new Set([...(x.tids||[]),"demo_f1"])]}:x);
  const kader=[...new Set([...((d.playerProfiles||[]).filter(q=>q.mainTid==="demo_f1"&&!q.archived).map(q=>q.name)),
    ...(((d.players||{})["demo_f1"])||[])])].filter(Boolean).slice(0,14);
  const ts=new Date().toISOString();
  // Vier vergangene Trainings mit Zusagen und Endzeit - daraus kennt Co
  // Kadergröße und Dauer, ohne zu fragen.
  d.events=[...(d.events||[]).filter(e=>!String(e.id).startsWith("ev_co_")),
    ...[7,14,21,28].map((n,i)=>({ id:"ev_co_"+i, cid:"demo", tid:"demo_f1", type:"training", pt:"att",
      title:"Training", date:tg(-n), time:"17:30", endTime:"19:00", loc:"Platz",
      votes:Object.fromEntries(kader.map(nm=>[nm,{val:"yes",ts,role:"player"}])) }))];
  localStorage.setItem("vereinsapp_v14", JSON.stringify(d));
});
await page.reload({waitUntil:"networkidle"}); await page.waitForTimeout(2800); await dismiss();
if(await oeffneCo()) ok("Co ist wieder offen"); else fail("Co nicht erreichbar");
await fragen("wir müssen das zusammenspiel der mannschaft verbessern");
await klick("🧮 Fragen beantworten"); await page.waitForTimeout(800);
const mitWissen = await durchfragen();
if(mitWissen<ohneWissen) ok(`Mit Vorwissen sind es nur noch ${mitWissen} statt ${ohneWissen} Fragen`);
else fail(`Er fragt trotz Vorwissen genauso viel (${mitWissen} statt ${ohneWissen})`);
b=await body();
if(!/Welche Altersklasse/.test(b)) ok("Nach der Altersklasse fragt er nicht mehr");
else fail("Fragt trotz bekannter Altersklasse");
{ const gew=(b.match(/Wusste ich schon: [^\n]*/g)||[]);
  if(gew.length>=2) ok("Er legt offen, was er schon wusste: "+gew.slice(0,2).join(" / "));
  else fail("Kein Hinweis auf vorhandenes Wissen: "+kurz(b)); }
if(/zuletzt waren im Schnitt \d+ Kinder/.test(b)) ok("Darunter die Kadergröße aus den letzten Trainings");
else fail("Kadergröße nicht erkannt");
if(/eure Einheit dauert 90 Minuten/.test(b)) ok("Und die Dauer der Einheit (90 Minuten)");
else fail("Dauer nicht erkannt: "+(b.match(/Einheit dauert[^\n]*/)||[""])[0]);

// ===== C) Abkürzen =====
await klick("🧮 Fragen beantworten"); await page.waitForTimeout(800);
{ await ersteAntwort(); await page.waitForTimeout(600);
  await ersteAntwort(); await page.waitForTimeout(600);
  await ersteAntwort(); await page.waitForTimeout(600);
  const da=await klick("Das reicht – rechne jetzt");
  if(da) ok("Ab der vierten Frage kann man abkürzen"); else fail("Kein Abkürzen möglich: "+kurz(await body()));
  await page.waitForTimeout(900);
  const b2=await body();
  if(/Den Rest habe ich weggelassen/.test(b2)) ok("Co sagt, dass er den Rest weggelassen hat");
  else fail("Kein Hinweis aufs Abkürzen: "+kurz(b2));
  if((b2.match(/🧮 Ergebnis/g)||[]).length>=2) ok("Und rechnet trotzdem ein Ergebnis");
  else fail("Kein Ergebnis nach dem Abkürzen"); }

if(errors.length){ console.log("JS-FEHLER:"); [...new Set(errors)].forEach(e=>console.log(" -",e.slice(0,150))); }
console.log(errors.length||fails.length?`ERGEBNIS: ${fails.length} Fehlschläge, ${errors.length} JS-Fehler`:"ERGEBNIS: ALLES OK");
await browser.close(); srv.close();
process.exit(errors.length||fails.length?1:0);
