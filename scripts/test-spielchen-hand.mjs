// E2E-Test: Spielchen im Training von Hand nachbessern.
// Die gerechnete Einteilung ist ein Vorschlag - der Trainer will jemanden
// testen oder einen aus der Entwicklung mit nach oben nehmen.
//   1. Jeder Name ist antippbar.
//   2. Antippen + „→ hierher“ verschiebt ihn auf die andere Seite.
//   3. Antippen + zweiter Name tauscht die beiden.
//   4. „→ auf die Bank“ setzt jemanden raus.
//   5. Die Änderung bleibt nach dem Neuladen stehen.
//   6. „↩ Zurücksetzen“ stellt den gerechneten Vorschlag wieder her.
// Aufruf: npm run build && node scripts/test-spielchen-hand.mjs
import { chromium } from "playwright-core";
import http from "http"; import fs from "fs"; import path from "path";
const dist = path.resolve("dist");
const srv = http.createServer((req,res)=>{ let p=path.join(dist,req.url.split("?")[0]); if(!fs.existsSync(p)||fs.statSync(p).isDirectory()) p=path.join(dist,"index.html"); res.setHeader("content-type",{".html":"text/html",".js":"text/javascript",".css":"text/css"}[path.extname(p)]||"text/plain"); res.end(fs.readFileSync(p)); }).listen(4321);
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
const kurz=t=>String(t).slice(0,300).replace(/\n/g," | ");
const klick=(re)=>page.evaluate(r=>{
  const b=[...document.querySelectorAll("button")].find(x=>new RegExp(r).test((x.innerText||"").replace(/\s+/g," ").trim()));
  if(!b||b.disabled) return false; b.click(); return true; }, re instanceof RegExp?re.source:re);
const dismiss=async()=>{ for(let k=0;k<12;k++){ const done=await page.evaluate(()=>{
  const fx=[...document.querySelectorAll("div")].filter(d=>getComputedStyle(d).position==="fixed"&&d.querySelector("button")&&d.innerText.length>30);
  for(const f of fx){ const b=[...f.querySelectorAll("button")].find(x=>/geht|Los|Verstanden|Alles klar|Fertig|Jetzt nicht|Weiter →|Überspringen|Start/i.test(x.innerText)); if(b){ b.click(); return false; } }
  return true; }); await page.waitForTimeout(400); if(done) break; } };

await page.addInitScript(()=>{
  if(!localStorage.getItem("vereinsapp_config")) localStorage.setItem("vereinsapp_config", JSON.stringify({url:"https://127.0.0.1:1/x", key:"test"}));
  if(localStorage.getItem("va_simple")===null)  localStorage.setItem("va_simple","0");
  if(localStorage.getItem("va_tsimple")===null) localStorage.setItem("va_tsimple","0");
});
await page.goto("http://127.0.0.1:4321/", { waitUntil:"networkidle" }); await page.waitForTimeout(2500);
await page.evaluate(()=>{ sessionStorage.setItem("vereinsapp_v12_session", JSON.stringify({role:"trainer",cid:"demo",tids:["demo_f1"],name:"Demo Trainer",id:"demo_tr1"})); });
await page.reload({waitUntil:"networkidle"}); await page.waitForTimeout(2600); await dismiss();
await page.evaluate(()=>{ const b=[...document.querySelectorAll("button")].find(x=>/Bin dabei/.test(x.innerText)); b&&b.click(); });
await page.waitForTimeout(1400);

// 12 Kinder: 6 Leistung, 6 Entwicklung - zwei Paarungen mit je 3 gegen 3.
const setup = await page.evaluate(()=>{
  const d=JSON.parse(localStorage.getItem("vereinsapp_v14")||"null");
  const p=v=>String(v).padStart(2,"0");
  const tg=n=>{ const x=new Date(Date.now()+n*86400000); return `${x.getFullYear()}-${p(x.getMonth()+1)}-${p(x.getDate())}`; };
  const vorhanden=(d.playerProfiles||[]).filter(q=>q.mainTid==="demo_f1"&&!q.archived);
  const namen=vorhanden.map(q=>q.name); let i=1;
  while(namen.length<12){ const n="Kind "+i;
    d.playerProfiles.push({id:"pp_sh"+i,cid:"demo",seasonId:vorhanden[0]&&vorhanden[0].seasonId,archived:false,
      name:n,by:2017,gender:"m",mainTid:"demo_f1",optTids:[],friends:[],mustWith:[]});
    namen.push(n); i++; }
  const k=namen.slice(0,12);
  const zu={}; k.slice(0,6).forEach(n=>zu[n]="g1"); k.slice(6,12).forEach(n=>zu[n]="g3");
  (d.playerProfiles||[]).filter(q=>q.mainTid==="demo_f1").forEach(q=>{ q.intGrp=zu[q.name]||""; });
  const ev=(d.events||[]).filter(e=>e.cid==="demo"&&e.tid==="demo_f1")[0];
  const ts=new Date().toISOString();
  Object.assign(ev,{ type:"training", date:tg(2), time:"17:30", endTime:"19:00", title:"Training", loc:"Platz",
    note:"", deadline:null, extraPolls:[], duties:[], spielFest:null, spielGr:null,
    votes:Object.fromEntries(k.map(n=>[n,{val:"yes",ts,role:"player"}])) });
  (d.events||[]).filter(e=>e.cid==="demo"&&e.id!==ev.id).forEach(e=>{ e.date=tg(14); });
  localStorage.setItem("vereinsapp_v14", JSON.stringify(d));
  return { evId:ev.id, kader:k };
});
if(setup&&setup.kader.length===12) ok("Training mit 12 Zusagen steht (6 Leistung, 6 Entwicklung)");
else { fail("Testdaten nicht gesetzt"); process.exit(1); }

const zumTermin=async()=>{
  await page.reload({waitUntil:"networkidle"}); await page.waitForTimeout(2800); await dismiss();
  await page.evaluate(()=>{ const b=[...document.querySelectorAll("button")].find(x=>/^(Ansehen|✅ Anwesenheit)$/.test((x.innerText||"").trim())); b&&b.click(); });
  await page.waitForTimeout(1700);
};
const fest=()=>page.evaluate(i=>{ const d=JSON.parse(localStorage.getItem("vereinsapp_v14")||"null");
  const ev=(d.events||[]).find(e=>e.id===i); return ev?(ev.spielFest||null):null; }, setup.evId);
// Namens-Chips im Spielchen-Block (die Knoepfe mit hellem Hintergrund)
const chips=()=>page.evaluate(k=>[...document.querySelectorAll("button")]
  .map(x=>(x.innerText||"").trim()).filter(t=>k.includes(t)), setup.kader);
const chipKlick=(name)=>page.evaluate(n=>{
  const b=[...document.querySelectorAll("button")].find(x=>(x.innerText||"").trim()===n);
  if(!b) return false; b.click(); return true; }, name);

await zumTermin();
let b=await body();
if(/Spielchen/.test(b)) ok("Das Spielchen steht im Training"); else { fail("Kein Spielchen: "+kurz(b)); process.exit(1); }
if(/Zum Ändern einen Namen antippen/.test(b)) ok("Es steht dabei, dass man von Hand ändern kann");
else fail("Kein Hinweis aufs Ändern: "+kurz(b));

// ===== 1) Namen sind antippbar =====
{ const c=await chips();
  if(c.length>=8) ok(`Die Namen sind Knöpfe (${c.length} antippbar)`);
  else fail("Namen nicht antippbar: "+JSON.stringify(c)); }

// ===== 2) Verschieben auf die andere Seite =====
const wer = await page.evaluate(k=>{
  const b=[...document.querySelectorAll("button")].find(x=>k.includes((x.innerText||"").trim()));
  return b?(b.innerText||"").trim():null; }, setup.kader);
if(wer) ok("Erster Name im Spielchen: "+wer); else fail("Kein Name gefunden");
await chipKlick(wer); await page.waitForTimeout(600);
b=await body();
if(new RegExp(wer.replace(/[.*+?^${}()|[\]\\]/g,"\\$&")+" ist ausgewählt").test(b))
  ok("Ein Tipp wählt ihn aus und sagt, was als Nächstes passiert");
else fail("Keine Auswahl-Zeile: "+kurz(b));
if(await klick("→ hierher")) ok("Als Ziel steht „→ hierher“ bereit"); else fail("Kein Ziel-Knopf");
await page.waitForTimeout(1300);
{ const f=await fest();
  if(f&&f.manuell) ok("Die Änderung wird festgehalten (sonst wäre sie gleich wieder weg)");
  else fail("Nicht als Hand-Änderung gespeichert: "+JSON.stringify(f&&f.manuell));
  const inB=f&&f.paarungen&&f.paarungen[0]&&f.paarungen[0].b.namen.includes(wer);
  const inA=f&&f.paarungen&&f.paarungen[0]&&f.paarungen[0].a.namen.includes(wer);
  if(inB&&!inA) ok(`${wer} steht jetzt auf der anderen Seite`);
  else fail("Nicht verschoben: "+JSON.stringify({inA,inB})); }
b=await body();
if(/✋ von Hand angepasst/.test(b)) ok("Die Anzeige sagt, dass von Hand angepasst wurde");
else fail("Keine Kennzeichnung: "+kurz(b));

// ===== 3) Nach dem Neuladen steht die Änderung noch =====
await zumTermin();
{ const f=await fest();
  const inB=f&&f.paarungen&&f.paarungen[0]&&f.paarungen[0].b.namen.includes(wer);
  if(inB) ok("Nach dem Neuladen steht die Änderung noch"); else fail("Änderung nach dem Neuladen weg"); }

// ===== 4) Zwei Namen tauschen =====
{ const f=await fest();
  const n1=f.paarungen[0].a.namen[0];
  const n2=f.paarungen[0].b.namen[0];
  if(n1&&n2&&n1!==n2){
    await chipKlick(n1); await page.waitForTimeout(500);
    await chipKlick(n2); await page.waitForTimeout(1300);
    const f2=await fest();
    const getauscht = f2.paarungen[0].a.namen.includes(n2) && f2.paarungen[0].b.namen.includes(n1);
    if(getauscht) ok(`Zwei Namen antippen tauscht sie: ${n1} ↔ ${n2}`);
    else fail("Nicht getauscht: "+JSON.stringify({a:f2.paarungen[0].a.namen,b:f2.paarungen[0].b.namen}));
  } else fail("Keine zwei Namen zum Tauschen"); }

// ===== 5) Auf die Bank setzen =====
{ const f=await fest();
  const n=f.paarungen[0].a.namen[0];
  await chipKlick(n); await page.waitForTimeout(500);
  if(await klick("→ auf die Bank")) ok("Man kann jemanden auf die Bank setzen"); else fail("Kein Bank-Ziel");
  await page.waitForTimeout(1300);
  const f2=await fest();
  const aufBank=f2.paarungen.some(p=>(p.bank||[]).includes(n));
  if(aufBank) ok(`${n} sitzt jetzt auf der Auswechselbank`);
  else fail("Nicht auf der Bank: "+JSON.stringify(f2.paarungen.map(p=>p.bank))); }

// ===== 6) Zurücksetzen =====
{ if(await klick("↩ Zurücksetzen")) ok("Die Hand-Änderungen lassen sich zurücksetzen");
  else fail("Kein Zurücksetzen-Knopf: "+kurz(await body()));
  await page.waitForTimeout(1300);
  const f=await fest();
  if(!f) ok("Danach rechnet er wieder selbst"); else fail("Festhaltung bleibt: "+JSON.stringify(!!f));
  const b2=await body();
  if(!/✋ von Hand angepasst/.test(b2)) ok("Und die Kennzeichnung ist weg");
  else fail("Kennzeichnung bleibt stehen"); }

// ===== 7) Ohne Auswahl keine Ziel-Knöpfe =====
{ const b2=await body();
  if(!/→ hierher/.test(b2)) ok("Ohne ausgewählten Namen stehen keine Ziel-Knöpfe im Weg");
  else fail("Ziel-Knöpfe auch ohne Auswahl sichtbar"); }

if(errors.length){ console.log("JS-FEHLER:"); [...new Set(errors)].forEach(e=>console.log(" -",e.slice(0,150))); }
console.log(errors.length||fails.length?`ERGEBNIS: ${fails.length} Fehlschläge, ${errors.length} JS-Fehler`:"ERGEBNIS: ALLES OK");
await browser.close(); srv.close();
process.exit(errors.length||fails.length?1:0);
