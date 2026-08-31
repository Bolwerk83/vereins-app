// E2E-Test: Ein Kind darf nur in Mannschaften aushelfen, in die es nach
// DFB-Schema auch gehört. Nach unten aushelfen ist nicht erlaubt: wer aus der
// Altersklasse herausgewachsen ist, fliegt aus der Vorschlagsliste - auch dann,
// wenn die Aushilfe-Option aus einer früheren Saison noch gesetzt ist.
// (Gleiche Regel wie "Jahrgang 2019 darf in 26/27 nicht mehr in die G-Jugend";
//  im Demo-Verein wird sie mit F-Jugend und Jahrgang 2017 geprüft.)
// Aufruf: npm run build && node scripts/test-aushilfe-alter.mjs
import { chromium } from "playwright-core";
import http from "http"; import fs from "fs"; import path from "path";
const dist = path.resolve("dist");
const srv = http.createServer((req,res)=>{ let p=path.join(dist,req.url.split("?")[0]); if(!fs.existsSync(p)||fs.statSync(p).isDirectory()) p=path.join(dist,"index.html"); res.setHeader("content-type",{".html":"text/html",".js":"text/javascript",".css":"text/css"}[path.extname(p)]||"text/plain"); res.end(fs.readFileSync(p)); }).listen(4275);
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
await page.goto("http://127.0.0.1:4275/", { waitUntil:"networkidle" }); await page.waitForTimeout(2500);
await page.evaluate(()=>{ sessionStorage.setItem("vereinsapp_v12_session", JSON.stringify({role:"trainer",cid:"demo",tids:["demo_f1"],name:"Demo Trainer",id:"demo_tr1"})); });
await page.reload({waitUntil:"networkidle"}); await page.waitForTimeout(2600); await dismiss();
await page.evaluate(()=>{ const b=[...document.querySelectorAll("button")].find(x=>/Bin dabei/.test(x.innerText)); b&&b.click(); });
await page.waitForTimeout(1500);

// Aus der F-Jugend eine G-Jugend machen und ein zu altes Kind mit
// Aushilfe-Option (aus einer alten Saison) darauf zeigen lassen.
const info = await page.evaluate(()=>{
  const d=JSON.parse(localStorage.getItem("vereinsapp_v14")||"null"); if(!d) return null;
  const tm=(d.teams||[]).find(x=>x.id==="demo_f1"); if(!tm) return null;
  tm.cat="G-Jugend"; tm.name="G-Jugend 1";
  const ev=(d.events||[]).filter(e=>e.cid==="demo"&&e.tid==="demo_f1"&&(e.pt==="att"||!e.pt))
    .sort((a,b)=>String(a.date||"").localeCompare(String(b.date||"")))[0]; if(!ev) return null;
  // Ein Kind aus einer anderen Mannschaft: Jahrgang 2019, männlich, mit
  // Aushilfe-Option auf demo_f1 - und bereits im Termin zugesagt.
  const rest=(d.playerProfiles||[]).filter(p=>p.id!=="pp_test_alt");
  d.playerProfiles=[...rest,{id:"pp_test_alt",cid:"demo",name:"Timo Zualt",by:2017,gender:"m",mainTid:"demo_e1",optTids:["demo_f1"],archived:false}];
  ev.votes={...(ev.votes||{}), "Timo Zualt":{val:"yes",ts:new Date().toISOString(),byTrainer:true}};
  localStorage.setItem("vereinsapp_v14", JSON.stringify(d));
  return ev.id;
});
if(info) ok("Testdaten gesetzt: G-Jugend 1 mit einem Kind Jahrgang 2017 (männlich)");
else fail("Konnte keine Testdaten setzen");
await page.reload({waitUntil:"networkidle"}); await page.waitForTimeout(2800); await dismiss();

// Termin öffnen -> Orga-Reiter (dort steht das Aushilfen-Board)
await page.evaluate(()=>{ const b=[...document.querySelectorAll("button")].find(x=>/^(Ansehen|✅ Anwesenheit)$/.test((x.innerText||"").trim())); b&&b.click(); });
await page.waitForTimeout(1500);
await page.evaluate(()=>{ const b=[...document.querySelectorAll("button")].find(x=>/^(👥 Orga|Orga)$/.test((x.innerText||"").trim())); b&&b.click(); });
await page.waitForTimeout(1100);
let b=await body();
if(/Nicht mehr spielberechtigt/.test(b)) ok("Der Trainer wird gewarnt: „Nicht mehr spielberechtigt“");
else fail("Keine Warnung zum Jahrgang: "+b.slice(0,300).replace(/\n/g," | "));
if(/Timo Zualt/.test(b)) ok("Das Kind wird namentlich genannt"); else fail("Kind fehlt in der Warnung");
if(/Jahrgang 2017/.test(b)&&/E-Jugend/.test(b)) ok("Mit Begründung: "+(b.match(/Jahrgang 2017[^\n]*/)||[""])[0]);
else fail("Keine Begründung mit Jahrgang und richtiger Jugend: "+b.slice(b.indexOf("Nicht mehr"), b.indexOf("Nicht mehr")+260).replace(/\n/g," | "));
if(/Saison 2026\/27/.test(b)) ok("Und mit Bezug auf die laufende Saison"); else fail("Kein Saison-Bezug in der Warnung");
if(/steht im Termin/.test(b)) ok("Es steht dabei, dass das Kind schon im Termin steht"); else fail("Hinweis „steht im Termin“ fehlt");
// Kind wieder austragen
{ const geklickt=await page.evaluate(()=>{ const x=[...document.querySelectorAll("button")].find(y=>/^Aus dem Termin nehmen$/.test((y.innerText||"").trim())); if(!x) return false; x.click(); return true; });
  if(geklickt) ok("Der Trainer kann das Kind direkt aus dem Termin nehmen"); else fail("Kein Knopf zum Austragen"); }
await page.waitForTimeout(1400);
{ const drin=await page.evaluate(()=>{
    const d=JSON.parse(localStorage.getItem("vereinsapp_v14")||"null");
    const ev=(d.events||[]).filter(e=>e.cid==="demo"&&e.tid==="demo_f1"&&(e.pt==="att"||!e.pt))
      .sort((a,b)=>String(a.date||"").localeCompare(String(b.date||"")))[0];
    return !!(ev&&(ev.votes||{})["Timo Zualt"]); });
  if(!drin) ok("Danach steht es nicht mehr im Termin"); else fail("Kind steht immer noch im Termin"); }
// Und es darf nicht als Aushilfe vorgeschlagen werden
b=await body();
{ const vorschlag=await page.evaluate(()=>{
    const k=[...document.querySelectorAll("div")].find(d=>/Kann aushelfen|Aushilfe|Wer könnte aushelfen/i.test((d.innerText||"").trim().slice(0,60)));
    return k?k.innerText:""; });
  if(!/Timo Zualt/.test(vorschlag)) ok("Das Kind wird nicht mehr als Aushilfe vorgeschlagen");
  else fail("Kind steht trotzdem in der Vorschlagsliste: "+vorschlag.slice(0,200).replace(/\n/g," | ")); }

if(errors.length){ console.log("JS-FEHLER:"); [...new Set(errors)].forEach(e=>console.log(" -",e.slice(0,150))); }
console.log(errors.length||fails.length?`ERGEBNIS: ${fails.length} Fehlschläge, ${errors.length} JS-Fehler`:"ERGEBNIS: ALLES OK");
await browser.close(); srv.close();
process.exit(errors.length||fails.length?1:0);
