// E2E-Test: Einteilung in Leistungsgruppen mit dem Assistenten besprechen.
//   1. Eigener Reiter „🎯 Einteilung“ im Trainer-Assistenten.
//   2. Zwei Fragen: worauf schauen, wo trennen.
//   3. Der Vorschlag nennt je Kind die Begründung (Stärke, Entwicklung,
//      Beteiligung) und den Rechenweg.
//   4. Jede Zuordnung lässt sich vor dem Übernehmen ändern.
//   5. Ohne „So übernehmen“ wird nichts gespeichert.
//   6. Mit Übernehmen stehen die Gruppen im Kader.
//   7. Sind kaum Stärken gepflegt, warnt er von sich aus.
// Aufruf: npm run build && node scripts/test-einteilung.mjs
import { chromium } from "playwright-core";
import http from "http"; import fs from "fs"; import path from "path";
const dist = path.resolve("dist");
const srv = http.createServer((req,res)=>{ let p=path.join(dist,req.url.split("?")[0]); if(!fs.existsSync(p)||fs.statSync(p).isDirectory()) p=path.join(dist,"index.html"); res.setHeader("content-type",{".html":"text/html",".js":"text/javascript",".css":"text/css"}[path.extname(p)]||"text/plain"); res.end(fs.readFileSync(p)); }).listen(4345);
const exe=process.env.PLAYWRIGHT_CHROMIUM||"/opt/pw-browsers/chromium-1194/chrome-linux/chrome";
const browser = await chromium.launch({ executablePath:exe, args:["--no-sandbox"] });
const page = await browser.newPage({ viewport:{ width:390, height:900 } });
const errors=[]; const fails=[];
page.on("pageerror", e=>errors.push(e.message));
page.on("dialog", d=>d.accept());
const fail=m=>{ fails.push(m); console.log("FEHLGESCHLAGEN:", m); };
const ok=m=>console.log("OK:", m);
const body=()=>page.evaluate(()=>document.body.innerText);
const klick=(re)=>page.evaluate(r=>{
  const b=[...document.querySelectorAll("button")].find(x=>new RegExp(r).test((x.innerText||"").replace(/\s+/g," ").trim()));
  if(!b||b.disabled) return false; b.click(); return true; }, re instanceof RegExp?re.source:re);
const dismiss=async()=>{ for(let k=0;k<12;k++){ const done=await page.evaluate(()=>{
  const fx=[...document.querySelectorAll("div")].filter(d=>getComputedStyle(d).position==="fixed"&&d.querySelector("button")&&d.innerText.length>30&&!/Trainer-Assistent/.test(d.innerText||""));
  for(const f of fx){ const b=[...f.querySelectorAll("button")].find(x=>/geht|Los|Verstanden|Alles klar|Fertig|Jetzt nicht|Weiter →|Überspringen|Start/i.test(x.innerText)); if(b){ b.click(); return false; } }
  return true; }); await page.waitForTimeout(400); if(done) break; } };
const oeffne = async () => {
  await page.evaluate(()=>{ const b=[...document.querySelectorAll("button")].find(x=>/^(Mehr|=)$/.test((x.innerText||"").trim())); b&&b.click(); });
  await page.waitForTimeout(900);
  await page.evaluate(()=>{ const b=[...document.querySelectorAll("button,div,a")].find(x=>/Trainer-Assistent/.test((x.innerText||"").trim())&&(x.innerText||"").length<40); b&&b.click(); });
  await page.waitForTimeout(1300);
  await klick("🎯 Einteilung"); await page.waitForTimeout(800);
};
const gruppenIm = () => page.evaluate(()=>{ const d=JSON.parse(localStorage.getItem("vereinsapp_v14")||"null");
  const o={}; (d.playerProfiles||[]).filter(p=>p.mainTid==="demo_f1"&&!p.archived).forEach(p=>{ o[p.name]=p.intGrp||""; }); return o; });

await page.addInitScript(()=>{
  if(!localStorage.getItem("vereinsapp_config")) localStorage.setItem("vereinsapp_config", JSON.stringify({url:"https://127.0.0.1:1/x", key:"test"}));
  if(localStorage.getItem("va_simple")===null)  localStorage.setItem("va_simple","0");
  if(localStorage.getItem("va_tsimple")===null) localStorage.setItem("va_tsimple","0");
});
await page.goto("http://127.0.0.1:4345/", { waitUntil:"networkidle" }); await page.waitForTimeout(2500);
await page.evaluate(()=>{ sessionStorage.setItem("vereinsapp_v12_session", JSON.stringify({role:"trainer",cid:"demo",tids:["demo_f1"],name:"Demo Trainer",id:"demo_tr1"})); });
await page.reload({waitUntil:"networkidle"}); await page.waitForTimeout(2600); await dismiss();
await page.evaluate(()=>{ const b=[...document.querySelectorAll("button")].find(x=>/Bin dabei/.test(x.innerText)); b&&b.click(); });
await page.waitForTimeout(1500);

// Sechs Kinder mit gepflegten Stärken (absteigend) und Beteiligung
const kader = await page.evaluate(()=>{
  const d=JSON.parse(localStorage.getItem("vereinsapp_v14")||"null");
  const vorhanden=(d.playerProfiles||[]).filter(p=>p.mainTid==="demo_f1"&&!p.archived);
  let i=1; const namen=vorhanden.map(p=>p.name);
  while(namen.length<6){ const n="Kind "+i;
    d.playerProfiles.push({id:"pp_ein"+i,cid:"demo",seasonId:vorhanden[0]&&vorhanden[0].seasonId,archived:false,name:n,
      by:2017,gender:"m",mainTid:"demo_f1",optTids:[],friends:[],mustWith:[]});
    namen.push(n); i++; }
  const werte=[5,4.3,3.6,2.9,2.2,1.5];
  namen.slice(0,6).forEach((n,ix)=>{ const p=(d.playerProfiles||[]).find(q=>q.name===n);
    p.intGrp=""; p.skills={Technik:werte[ix],Schnelligkeit:werte[ix],Zweikampf:werte[ix],
      "Übersicht":werte[ix],Abschluss:werte[ix],Ausdauer:werte[ix],Teamplay:werte[ix]}; });
  localStorage.setItem("vereinsapp_v14", JSON.stringify(d));
  return namen.slice(0,6);
});
if(kader&&kader.length===6) ok(`Kader mit sechs Kindern und gepflegten Stärken: ${kader[0]} (stark) … ${kader[5]} (schwächer)`);
else { fail("Kader nicht vorbereitet"); process.exit(1); }
await page.reload({waitUntil:"networkidle"}); await page.waitForTimeout(2800); await dismiss();

// ===== 1+2) Reiter und Fragen =====
await oeffne();
let b=await body();
if(/Worauf soll ich vor allem schauen/.test(b)) ok("Der Reiter „🎯 Einteilung“ stellt die passenden Fragen");
else fail("Keine Fragen: "+b.slice(0,400).replace(/\n/g," | "));
if(/entscheiden musst du/i.test(b)) ok("Und sagt klar, dass der Trainer entscheidet");
else fail("Kein Hinweis auf die Entscheidungshoheit");
if(/Wie groß soll die stärkste Gruppe sein/.test(b)) ok("Zweite Frage: wo getrennt wird");
else fail("Zweite Frage fehlt");

// ===== 3) Vorschlag =====
await klick("Aktuelle Stärke"); await page.waitForTimeout(400);
await klick("Etwa gleich große Gruppen"); await page.waitForTimeout(400);
if(await klick("🧮 Vorschlag rechnen")) ok("Der Vorschlag lässt sich rechnen"); else fail("Kein Rechnen-Knopf");
await page.waitForTimeout(1200);
b=await body();
if(/SO KOMMT DAS ZUSTANDE/.test(b)&&/Gewichtung: Stärke 60 %/.test(b)) ok("Der Rechenweg nennt die Gewichtung (Stärke 60 %)");
else fail("Kein Rechenweg: "+b.slice(0,500).replace(/\n/g," | "));
if(/Leistung: 2 · Reserve: 2 · Entwicklung: 2/.test(b)) ok("Sechs Kinder werden auf drei Gruppen zu je zwei verteilt");
else fail("Verteilung stimmt nicht: "+(b.match(/Leistung: \d[^\n]*/)||[""])[0]);
if(/Stärke 5\/5/.test(b)&&/Stärke 1\.5\/5/.test(b)) ok("Bei jedem Kind steht, woraus sich das ergibt");
else fail("Keine Begründung je Kind");

// ===== 5) Ohne Übernehmen passiert nichts =====
{ const g=await gruppenIm();
  if(Object.values(g).every(x=>!x)) ok("Solange nichts übernommen ist, bleibt der Kader unverändert");
  else fail("Ungefragt gespeichert: "+JSON.stringify(g)); }

// ===== 4) Zuordnung ändern =====
{ const geaendert=await page.evaluate(n=>{
    const karten=[...document.querySelectorAll("div")].filter(d=>(d.innerText||"").includes(n)&&d.querySelectorAll("button").length===3);
    const k=karten[karten.length-1]; if(!k) return false;
    const b2=[...k.querySelectorAll("button")].find(x=>(x.innerText||"").trim()==="Entwicklung");
    if(!b2) return false; b2.click(); return true; }, kader[0]);
  await page.waitForTimeout(700);
  if(geaendert) ok(`Die Zuordnung von ${kader[0]} lässt sich vor dem Übernehmen ändern`);
  else fail("Zuordnung nicht änderbar"); }

// ===== 6) Übernehmen =====
if(await klick("✓ So übernehmen")) ok("„✓ So übernehmen“ geht"); else fail("Kein Übernehmen");
await page.waitForTimeout(1400);
{ const g=await gruppenIm();
  const gesetzt=Object.values(g).filter(Boolean).length;
  if(gesetzt===6) ok("Danach haben alle sechs Kinder ihre Gruppe");
  else fail("Nicht alle zugeteilt: "+JSON.stringify(g));
  if(g[kader[0]]==="g3") ok("Und zwar so, wie der Trainer es geändert hat – nicht wie gerechnet");
  else fail("Änderung nicht übernommen: "+kader[0]+" = "+g[kader[0]]);
  if(g[kader[5]]==="g3") ok("Das schwächste Kind steht in der Entwicklungsgruppe");
  else fail("Rechnung nicht übernommen: "+kader[5]+" = "+g[kader[5]]); }

// ===== 7) Warnung bei dünner Datenlage =====
await page.evaluate(()=>{ const d=JSON.parse(localStorage.getItem("vereinsapp_v14")||"null");
  (d.playerProfiles||[]).filter(p=>p.mainTid==="demo_f1").forEach((p,ix)=>{ if(ix>0){ p.skills={}; p.intGrp=""; } });
  localStorage.setItem("vereinsapp_v14", JSON.stringify(d)); });
await page.reload({waitUntil:"networkidle"}); await page.waitForTimeout(2800); await dismiss();
await oeffne();
await klick("Aktuelle Stärke"); await page.waitForTimeout(400);
await klick("Etwa gleich große Gruppen"); await page.waitForTimeout(400);
await klick("🧮 Vorschlag rechnen"); await page.waitForTimeout(1200);
b=await body();
if(/Nur bei 1 von \d+ Kindern sind Stärken gepflegt/.test(b)) ok("Bei dünner Datenlage warnt er von sich aus");
else fail("Keine Warnung: "+b.slice(0,400).replace(/\n/g," | "));
if(/besonders kritisch/.test(b)) ok("Und rät, den Vorschlag kritisch zu prüfen");
else fail("Keine Einordnung der Warnung");

if(errors.length){ console.log("JS-FEHLER:"); [...new Set(errors)].forEach(e=>console.log(" -",e.slice(0,150))); }
console.log(errors.length||fails.length?`ERGEBNIS: ${fails.length} Fehlschläge, ${errors.length} JS-Fehler`:"ERGEBNIS: ALLES OK");
await browser.close(); srv.close();
process.exit(errors.length||fails.length?1:0);
