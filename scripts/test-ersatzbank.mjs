// E2E-Test: Ersatzbank als eigene Reihe in der Mannschaft.
//   Bisher gab es nur Tor/Abwehr/Mittelfeld/Angriff – wer nicht startet,
//   blieb in der allgemeinen Bank („verfügbar“) und gehörte damit zu keiner
//   Mannschaft. Jetzt lässt sich ein Kind gezielt auf die Ersatzbank der
//   Mannschaft setzen.
//   1. Die Bank bietet fünf Knöpfe: T A M S E.
//   2. „E“ setzt das Kind auf die Ersatzbank – gespeichert und sichtbar.
//   3. Es zählt zur Mannschaft und ist aus der allgemeinen Bank raus.
//   4. Von der Ersatzbank in eine Linie: es steht danach nur noch dort.
//   5. Der Spieltag-Zettel funktioniert weiter (und nennt weiter keine Namen).
// Aufruf: npm run build && node scripts/test-ersatzbank.mjs
import { chromium } from "playwright-core";
import http from "http"; import fs from "fs"; import path from "path";
const dist = path.resolve("dist");
const srv = http.createServer((req,res)=>{ let p=path.join(dist,req.url.split("?")[0]); if(!fs.existsSync(p)||fs.statSync(p).isDirectory()) p=path.join(dist,"index.html"); res.setHeader("content-type",{".html":"text/html",".js":"text/javascript",".css":"text/css"}[path.extname(p)]||"text/plain"); res.end(fs.readFileSync(p)); }).listen(4335);
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
const zurAufstellung = async () => {
  await page.evaluate(()=>{ const b=[...document.querySelectorAll("button")].find(x=>/^(Ansehen|✅ Anwesenheit)$/.test((x.innerText||"").trim())); b&&b.click(); });
  await page.waitForTimeout(1600);
  await page.evaluate(()=>{ const b=[...document.querySelectorAll("button")].find(x=>/^(⚽ Aufstellung|Aufstellung)$/.test((x.innerText||"").trim())); b&&b.click(); });
  await page.waitForTimeout(1200);
};
// Knöpfe in der Bank-Zeile eines Kindes
const bankKnoepfe=(name)=>page.evaluate(n=>{
  const z=[...document.querySelectorAll("div")].filter(d=>(d.innerText||"").includes(n)&&d.querySelectorAll("button").length>=4&&(d.innerText||"").replace(/\s+/g," ").trim().length<70);
  const el=z[z.length-1]; if(!el) return null;
  return [...el.querySelectorAll("button")].map(b=>(b.innerText||"").trim()); }, name);
const bankKlick=(name,pos)=>page.evaluate(({n,p})=>{
  const z=[...document.querySelectorAll("div")].filter(d=>(d.innerText||"").includes(n)&&d.querySelectorAll("button").length>=4&&(d.innerText||"").replace(/\s+/g," ").trim().length<70);
  const el=z[z.length-1]; if(!el) return false;
  const b=[...el.querySelectorAll("button")].find(x=>(x.innerText||"").trim()===p); if(!b) return false; b.click(); return true; },{n:name,p:pos});
const evLesen=(id)=>page.evaluate(x=>{ const d=JSON.parse(localStorage.getItem("vereinsapp_v14")||"null");
  return (d.events||[]).find(e=>e.id===x)||null; }, id);
// Text der Ersatzbank-Zeile in der Mannschaft
const ersatzZeile=()=>page.evaluate(()=>{ const t=document.body.innerText;
  const i=t.indexOf("ERSATZBANK"); if(i<0) return null;
  const rest=t.slice(i+10); const e=rest.search(/\n(TOR|ABWEHR|MITTELFELD|ANGRIFF|BANK|BETREUUNG)/);
  return (e<0?rest.slice(0,200):rest.slice(0,e)).replace(/\n/g," ").trim(); });

await page.addInitScript(()=>{
  if(!localStorage.getItem("vereinsapp_config")) localStorage.setItem("vereinsapp_config", JSON.stringify({url:"https://127.0.0.1:1/x", key:"test"}));
  if(localStorage.getItem("va_simple")===null)  localStorage.setItem("va_simple","0");
  if(localStorage.getItem("va_tsimple")===null) localStorage.setItem("va_tsimple","0");
});
await page.goto("http://127.0.0.1:4335/", { waitUntil:"networkidle" }); await page.waitForTimeout(2500);
await page.evaluate(()=>{ sessionStorage.setItem("vereinsapp_v12_session", JSON.stringify({role:"trainer",cid:"demo",tids:["demo_f1"],name:"Demo Trainer",id:"demo_tr1"})); });
await page.reload({waitUntil:"networkidle"}); await page.waitForTimeout(2600); await dismiss();
await page.evaluate(()=>{ const b=[...document.querySelectorAll("button")].find(x=>/Bin dabei/.test(x.innerText)); b&&b.click(); });
await page.waitForTimeout(1500);

const daten = await page.evaluate(()=>{
  const d=JSON.parse(localStorage.getItem("vereinsapp_v14")||"null"); if(!d) return null;
  const p=v=>String(v).padStart(2,"0"); const x=new Date(Date.now()+2*86400000);
  const ev=(d.events||[]).filter(e=>e.cid==="demo"&&e.tid==="demo_f1"&&(e.pt==="att"||!e.pt))
    .sort((a,b)=>String(a.date||"").localeCompare(String(b.date||"")))[0]; if(!ev) return null;
  const k=[...new Set([...((d.players||{})["demo_f1"]||[]),
    ...((d.playerProfiles||[]).filter(pp=>pp.mainTid==="demo_f1"&&!pp.archived).map(pp=>pp.name))])];
  if(k.length<3) return null;
  const ts=new Date().toISOString();
  Object.assign(ev,{ type:"turnier", date:`${x.getFullYear()}-${p(x.getMonth()+1)}-${p(x.getDate())}`,
    time:"09:30", endTime:"12:00", title:"Kinderfestival", loc:"Halle", note:"", deadline:null,
    carpoolExtra:false, carpoolEnabled:false, extraPolls:[], duties:[], lineup:null, lineups:null,
    votes:Object.fromEntries(k.slice(0,3).map(n=>[n,{val:"yes",ts,role:"player"}])) });
  (d.events||[]).filter(e=>e.cid==="demo"&&e.id!==ev.id).forEach(e=>{
    const y=new Date(Date.now()+12*86400000); e.date=`${y.getFullYear()}-${p(y.getMonth()+1)}-${p(y.getDate())}`; });
  localStorage.setItem("vereinsapp_v14", JSON.stringify(d));
  return {ev:ev.id, a:k[0], b:k[1]};
});
if(daten) ok(`Ausgangslage: Turnier mit Zusagen von ${daten.a} und ${daten.b}`);
else { fail("Konnte die Ausgangslage nicht setzen"); process.exit(1); }
await page.reload({waitUntil:"networkidle"}); await page.waitForTimeout(2800); await dismiss();
await zurAufstellung();

// ===== 1) Fünf Knöpfe auf der Bank =====
{ const kn=await bankKnoepfe(daten.a);
  if(kn&&kn.join("")==="TAMSE") ok("Die Bank bietet T A M S und neu E für die Ersatzbank");
  else fail("Falsche Knöpfe auf der Bank: "+JSON.stringify(kn)); }

// ===== 2) Auf die Ersatzbank setzen =====
if(await bankKlick(daten.a,"E")) ok(`„E“ ist anklickbar`); else fail("E nicht klickbar");
await page.waitForTimeout(1300);
{ const ev=await evLesen(daten.ev);
  const e=ev&&ev.lineups&&ev.lineups[0]&&(ev.lineups[0].E||[]);
  if(e&&e.includes(daten.a)) ok(`${daten.a} steht in der Ersatzbank der Mannschaft`);
  else fail("Nicht gespeichert: "+JSON.stringify(ev&&ev.lineups&&ev.lineups[0])); }
{ const z=await ersatzZeile();
  if(z&&z.includes(daten.a)) ok("Die Zeile „ERSATZBANK“ zeigt das Kind: "+z.slice(0,60));
  else fail("Keine Ersatzbank-Zeile: "+(z||"—")); }

// ===== 3) Zählt zur Mannschaft, raus aus „verfügbar“ =====
{ const b=await body();
  if(/Team 1 \(1\)/.test(b)) ok("Der Mannschafts-Kopf zählt es mit: „Team 1 (1)“");
  else fail("Kopf-Zahl stimmt nicht: "+(b.match(/Team 1 \([^)]*\)/)||[""])[0]);
  const bank=(()=>{ const i=b.search(/BANK \/ VERF/i); return i<0?"":b.slice(i,i+400); })();
  if(!bank.includes(daten.a)) ok("Und aus der allgemeinen Bank ist es verschwunden");
  else fail("Steht doppelt – auch noch auf der Bank"); }

// ===== 4) Von der Ersatzbank in die Abwehr =====
{ const geklickt=await page.evaluate(n=>{
    const sp=[...document.querySelectorAll("span")].find(x=>(x.innerText||"").includes(n)&&getComputedStyle(x).borderStyle!=="none");
    if(!sp) return false; sp.click(); return true; }, daten.a);
  await page.waitForTimeout(1100);
  if(geklickt) ok("Ein Tipp nimmt es wieder von der Ersatzbank"); else fail("Kein Entfernen möglich");
  if(await bankKlick(daten.a,"A")) ok("Und es lässt sich in die Abwehr stellen"); else fail("A nicht klickbar");
  await page.waitForTimeout(1200);
  const ev=await evLesen(daten.ev); const t1=ev&&ev.lineups&&ev.lineups[0];
  if(t1&&(t1.A||[]).includes(daten.a)&&!(t1.E||[]).includes(daten.a))
    ok("Danach steht es nur in der Abwehr – nicht mehr auf der Ersatzbank");
  else fail("Steht an zwei Stellen: "+JSON.stringify(t1)); }

// ===== 5) Spieltag-Zettel nennt die Ersatzbank =====
{ await bankKlick(daten.b,"E"); await page.waitForTimeout(1200);
  // Der Spieltag-Zettel steht im Reiter "Rückmeldungen"
  await page.evaluate(()=>{ const x=[...document.querySelectorAll("button")].find(y=>/Rückmeldungen/.test(y.innerText||"")); x&&x.click(); });
  await page.waitForTimeout(1000);
  await page.evaluate(()=>{ window.__geteilt=null; navigator.share=(d)=>{ window.__geteilt=d; return Promise.resolve(); }; });
  await page.evaluate(()=>{ const b=[...document.querySelectorAll("button")].find(x=>/Spieltag-Zettel teilen/.test(x.innerText||"")); b&&b.click(); });
  await page.waitForTimeout(900);
  const g=await page.evaluate(()=>window.__geteilt);
  const t=g&&g.text||"";
  if(t) ok("Der Spieltag-Zettel lässt sich teilen");
  else fail("Kein Spieltag-Zettel erzeugt");
  // Der Zettel nennt bewusst keine Namen - er meldet nur, dass eine
  // Aufstellung steht. Die Ersatzbank zählt dafür mit.
  if(/Aufstellung steht/.test(t)) ok("Und meldet, dass eine Aufstellung steht – ohne Namen zu nennen");
  else fail("Aufstellung nicht erwähnt: "+t.slice(0,400).replace(/\n/g," | "));
  if(!t.includes(daten.b)) ok("Namen bleiben aus dem geteilten Text heraus");
  else fail("Name im geteilten Text: "+daten.b); }

if(errors.length){ console.log("JS-FEHLER:"); [...new Set(errors)].forEach(e=>console.log(" -",e.slice(0,150))); }
console.log(errors.length||fails.length?`ERGEBNIS: ${fails.length} Fehlschläge, ${errors.length} JS-Fehler`:"ERGEBNIS: ALLES OK");
await browser.close(); srv.close();
process.exit(errors.length||fails.length?1:0);
