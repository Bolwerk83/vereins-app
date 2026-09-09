// E2E-Test: Vergangene Termine stehen in der Trainer-Liste zugeklappt.
//   Sie stehen ganz unten, sind aber der längste Block – jeder alte Termin
//   mit voller Karte. Ab sofort nur noch eine Zeile zum Aufklappen.
//   1. Beim Öffnen sind sie zu, die Zeile nennt die Anzahl.
//   2. Ein Tipp klappt sie auf, ein zweiter wieder zu.
//   3. Die kommenden Termine bleiben davon unberührt.
// Aufruf: npm run build && node scripts/test-vergangene-zu.mjs
import { chromium } from "playwright-core";
import http from "http"; import fs from "fs"; import path from "path";
const dist = path.resolve("dist");
const srv = http.createServer((req,res)=>{ let p=path.join(dist,req.url.split("?")[0]); if(!fs.existsSync(p)||fs.statSync(p).isDirectory()) p=path.join(dist,"index.html"); res.setHeader("content-type",{".html":"text/html",".js":"text/javascript",".css":"text/css"}[path.extname(p)]||"text/plain"); res.end(fs.readFileSync(p)); }).listen(4325);
const exe=process.env.PLAYWRIGHT_CHROMIUM||"/opt/pw-browsers/chromium-1194/chrome-linux/chrome";
const browser = await chromium.launch({ executablePath:exe, args:["--no-sandbox"] });
const page = await browser.newPage({ viewport:{ width:390, height:900 } });
const errors=[]; const fails=[];
page.on("pageerror", e=>errors.push(e.message));
page.on("dialog", d=>d.accept());
const fail=m=>{ fails.push(m); console.log("FEHLGESCHLAGEN:", m); };
const ok=m=>console.log("OK:", m);
const body=()=>page.evaluate(()=>document.body.innerText);
// Wie oft steht der Titel auf der Seite? (Er kann auch in der To-do-Liste
// stehen - uns interessiert nur die Terminliste darunter.)
const zaehl=(t)=>page.evaluate(x=>(document.body.innerText.match(new RegExp(x.replace(/[.*+?^${}()|[\]\\]/g,"\\$&"),"g"))||[]).length, t);
// Die Liste unterhalb der Zeile "vergangene Termine"
const listeUnten=()=>page.evaluate(()=>{ const t=document.body.innerText;
  const m=t.match(/(vergangene Termine anzeigen|Vergangene Termine ausblenden)/);
  return m ? t.slice(t.indexOf(m[0])+m[0].length) : ""; });
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
await page.goto("http://127.0.0.1:4325/", { waitUntil:"networkidle" }); await page.waitForTimeout(2500);
await page.evaluate(()=>{ sessionStorage.setItem("vereinsapp_v12_session", JSON.stringify({role:"trainer",cid:"demo",tids:["demo_f1"],name:"Demo Trainer",id:"demo_tr1"})); });
await page.reload({waitUntil:"networkidle"}); await page.waitForTimeout(2600); await dismiss();
await page.evaluate(()=>{ const b=[...document.querySelectorAll("button")].find(x=>/Bin dabei/.test(x.innerText)); b&&b.click(); });
await page.waitForTimeout(1500);

// Zwei Termine in die Vergangenheit legen, einer bleibt in der Zukunft
const daten = await page.evaluate(()=>{
  const d=JSON.parse(localStorage.getItem("vereinsapp_v14")||"null"); if(!d) return null;
  const p=v=>String(v).padStart(2,"0"); const tag=n=>{const x=new Date(Date.now()+n*86400000);return `${x.getFullYear()}-${p(x.getMonth()+1)}-${p(x.getDate())}`;};
  const evs=(d.events||[]).filter(e=>e.cid==="demo"&&e.tid==="demo_f1")
    .sort((a,b)=>String(a.date||"").localeCompare(String(b.date||"")));
  if(!evs.length) return {fehler:"keine Termine der F-Jugend 1"};
  // Notfalls Termine ergaenzen, damit es sicher zwei vergangene und einen
  // kommenden gibt - unabhaengig davon, wie viele die Demo gerade mitbringt.
  while(evs.length<3){ const kopie={...evs[0], id:"ev_alt"+evs.length, votes:{}, lineup:null, lineups:null};
    d.events.push(kopie); evs.push(kopie); }
  evs[0].date=tag(-9);  evs[0].title="Altes Training Anton";
  evs[1].date=tag(-4);  evs[1].title="Altes Spiel Berta";
  evs[2].date=tag(3);   evs[2].title="Kommendes Training Cesar";
  evs.slice(3).forEach(e=>{ e.date=tag(20); });
  localStorage.setItem("vereinsapp_v14", JSON.stringify(d));
  return {alt:[evs[0].title,evs[1].title], neu:evs[2].title};
});
if(daten&&daten.fehler){ fail("Ausgangslage: "+daten.fehler); process.exit(1); }
if(daten) ok(`Ausgangslage: 2 vergangene Termine (${daten.alt.join(", ")}) und „${daten.neu}“ in der Zukunft`);
else { fail("Konnte die Ausgangslage nicht setzen"); process.exit(1); }
await page.reload({waitUntil:"networkidle"}); await page.waitForTimeout(2800); await dismiss();

// ===== 1) Beim Öffnen zugeklappt =====
let b=await body();
if(/2 vergangene Termine anzeigen/.test(b)) ok("Es gibt eine Zeile „▼ 2 vergangene Termine anzeigen“");
else fail("Keine Zeile für vergangene Termine: "+b.slice(0,400).replace(/\n/g," | "));
{ const unten=await listeUnten();
  if(!unten.includes(daten.alt[0])&&!unten.includes(daten.alt[1]))
    ok("Unter der Zeile steht keiner der alten Termine – das spart den Platz");
  else fail("Vergangene Termine stehen trotzdem ausgeschrieben da: "+unten.slice(0,200).replace(/\n/g," | ")); }
const vorher=[await zaehl(daten.alt[0]), await zaehl(daten.alt[1])];
if(b.includes(daten.neu)) ok("Der kommende Termin steht weiterhin ganz normal da");
else fail("Kommender Termin fehlt: "+b.slice(0,300).replace(/\n/g," | "));
const zuLang=b.length;

// ===== 2) Auf- und wieder zuklappen =====
if(await klick("vergangene Termine anzeigen")) ok("Die Zeile ist anklickbar"); else fail("Zeile nicht klickbar");
await page.waitForTimeout(900);
b=await body();
{ const nachher=[await zaehl(daten.alt[0]), await zaehl(daten.alt[1])];
  if(nachher[0]>vorher[0]&&nachher[1]>vorher[1]) ok("Aufgeklappt stehen beide alten Termine da");
  else fail(`Nach dem Aufklappen fehlen die alten Termine (vorher ${vorher}, nachher ${nachher})`); }
if(b.length>zuLang) ok(`Zugeklappt ist die Seite deutlich kürzer: ${zuLang} statt ${b.length} Zeichen`);
else fail(`Nicht kürzer: zu ${zuLang}, auf ${b.length}`);
if(/Vergangene Termine ausblenden/.test(b)) ok("Und die Zeile bietet das Ausblenden an");
else fail("Kein Ausblenden angeboten");
if(await klick("Vergangene Termine ausblenden")) ok("Ausblenden reagiert"); else fail("Ausblenden nicht möglich");
await page.waitForTimeout(900);
b=await body();
{ const unten=await listeUnten();
  if(!unten.includes(daten.alt[0])&&!unten.includes(daten.alt[1])&&/2 vergangene Termine anzeigen/.test(b))
    ok("Danach ist wieder alles zu");
  else fail("Bleibt offen: "+unten.slice(0,200).replace(/\n/g," | ")); }
if(b.includes(daten.neu)) ok("Der kommende Termin ist die ganze Zeit über sichtbar geblieben");
else fail("Kommender Termin verschwunden");

if(errors.length){ console.log("JS-FEHLER:"); [...new Set(errors)].forEach(e=>console.log(" -",e.slice(0,150))); }
console.log(errors.length||fails.length?`ERGEBNIS: ${fails.length} Fehlschläge, ${errors.length} JS-Fehler`:"ERGEBNIS: ALLES OK");
await browser.close(); srv.close();
process.exit(errors.length||fails.length?1:0);
