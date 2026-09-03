// E2E-Test: Der Fahrer nimmt jemanden mit.
//   1. Wer selbst fährt, kann jemanden aus „Sucht noch Mitfahrt“ direkt
//      auswählen: „🚗 Ich nehme … mit“.
//   2. Beim Angefragten poppt beim nächsten Öffnen eine Meldung auf –
//      zusagen oder absagen, Begründung freiwillig.
//   3. Danach sehen es alle: der Mitfahrer sitzt im Auto bzw. beim Fahrer
//      steht „hat abgesagt: <Grund>“.
// Aufruf: npm run build && node scripts/test-mitfahrt.mjs
import { chromium } from "playwright-core";
import http from "http"; import fs from "fs"; import path from "path";
const dist = path.resolve("dist");
const srv = http.createServer((req,res)=>{ let p=path.join(dist,req.url.split("?")[0]); if(!fs.existsSync(p)||fs.statSync(p).isDirectory()) p=path.join(dist,"index.html"); res.setHeader("content-type",{".html":"text/html",".js":"text/javascript",".css":"text/css"}[path.extname(p)]||"text/plain"); res.end(fs.readFileSync(p)); }).listen(4287);
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
  const b=[...document.querySelectorAll("button")].find(x=>new RegExp(r).test((x.innerText||"").trim()));
  if(!b||b.disabled) return false; b.click(); return true; }, re instanceof RegExp?re.source:re);
const dismiss=async()=>{ for(let k=0;k<12;k++){ const done=await page.evaluate(()=>{
  const fx=[...document.querySelectorAll("div")].filter(d=>getComputedStyle(d).position==="fixed"&&d.querySelector("button")&&d.innerText.length>30&&!/nimmt .* mit/.test(d.innerText||""));
  for(const f of fx){ const b=[...f.querySelectorAll("button")].find(x=>/geht|Los|Verstanden|Alles klar|Fertig|Jetzt nicht|Weiter →|Überspringen|Start/i.test(x.innerText)); if(b){ b.click(); return false; } }
  return true; }); await page.waitForTimeout(400); if(done) break; } };
const carpool = () => page.evaluate(()=>{
  const d=JSON.parse(localStorage.getItem("vereinsapp_v14")||"null");
  const ev=(d.events||[]).find(e=>e.id==="ev_fahrt"); return ev?(ev.carpool||{}):null; });
const alsEltern = async (kind) => {
  await page.evaluate(k=>{ localStorage.setItem("va_simple","1");
    sessionStorage.setItem("vereinsapp_v12_session", JSON.stringify({role:"user",cid:"demo",tid:"demo_f1",name:k,user:k})); }, kind);
  await page.goto("http://127.0.0.1:4287/", { waitUntil:"networkidle" }); await page.waitForTimeout(2800); await dismiss();
};

await page.addInitScript(()=>{ if(!localStorage.getItem("vereinsapp_config")) localStorage.setItem("vereinsapp_config", JSON.stringify({url:"https://127.0.0.1:1/x", key:"test"})); });
await page.goto("http://127.0.0.1:4287/", { waitUntil:"networkidle" }); await page.waitForTimeout(2500);
await page.evaluate(()=>{ localStorage.setItem("va_simple","0"); localStorage.setItem("va_tsimple","0");
  sessionStorage.setItem("vereinsapp_v12_session", JSON.stringify({role:"trainer",cid:"demo",tids:["demo_f1"],name:"Demo Trainer",id:"demo_tr1"})); });
await page.reload({waitUntil:"networkidle"}); await page.waitForTimeout(2600); await dismiss();
await page.evaluate(()=>{ const b=[...document.querySelectorAll("button")].find(x=>/Bin dabei/.test(x.innerText)); b&&b.click(); });
await page.waitForTimeout(1500);

// Auswärtsspiel mit Fahrgemeinschaft: Kind A fährt, Kind B sucht Mitfahrt
const kinder = await page.evaluate(()=>{
  const d=JSON.parse(localStorage.getItem("vereinsapp_v14")||"null"); if(!d) return null;
  const vorlage=(d.events||[]).find(e=>e.cid==="demo"&&e.tid==="demo_f1"&&(e.pt==="att"||!e.pt)); if(!vorlage) return null;
  const kader=[...new Set([...((d.players||{})["demo_f1"]||[]),
    ...((d.playerProfiles||[]).filter(pp=>pp.mainTid==="demo_f1"&&!pp.archived).map(pp=>pp.name))])];
  if(kader.length<2) return null;
  const [fahrer,gast]=kader;
  const x=new Date(Date.now()+3*86400000); const p=v=>String(v).padStart(2,"0");
  const rest=(d.events||[]).filter(e=>e.id!=="ev_fahrt");
  d.events=[...rest,{ ...vorlage, id:"ev_fahrt", title:"SV Adler", type:"auswarts",
    date:`${x.getFullYear()}-${p(x.getMonth()+1)}-${p(x.getDate())}`, time:"10:30", endTime:"12:00",
    loc:"Adler-Arena", note:"", deadline:null, extraPolls:[], carpoolExtra:true, carpoolOpt:false,
    votes:{ [fahrer]:{val:"yes",ts:new Date().toISOString(),role:"player"},
            [gast]:{val:"yes",ts:new Date().toISOString(),role:"player"} },
    carpool:{ [fahrer]:{mode:"drive",seats:3,ts:new Date().toISOString()},
              [gast]:{mode:"need",car:null,pickup:"Sportplatz",ts:new Date().toISOString()} } }];
  localStorage.setItem("vereinsapp_v14", JSON.stringify(d));
  return {fahrer,gast};
});
if(kinder) ok(`Ausgangslage: ${kinder.fahrer} fährt (3 Plätze), ${kinder.gast} sucht Mitfahrt`);
else fail("Konnte die Ausgangslage nicht setzen");

// ===== 1) Der Fahrer nimmt jemanden mit =====
await alsEltern(kinder.fahrer);
let b=await body();
if(/Sucht noch Mitfahrt|SUCHT NOCH/i.test(b)) ok("Der Fahrer sieht, wer noch eine Mitfahrt sucht");
else fail("Keine Suchenden-Liste: "+b.slice(0,300).replace(/\n/g," | "));
{ const geklickt=await klick("^🚗 Ich nehme "+kinder.gast.split(" ")[0]+" mit$");
  if(geklickt) ok(`Der Fahrer kann „${kinder.gast.split(" ")[0]}“ direkt auswählen`);
  else fail("Kein Knopf zum Mitnehmen: "+(await body()).slice(0,300).replace(/\n/g," | ")); }
await page.waitForTimeout(1500);
{ const cp=await carpool();
  const ang=cp&&cp[kinder.gast]&&cp[kinder.gast].angebot;
  if(ang&&ang.status==="offen"&&ang.von===kinder.fahrer) ok("Die Anfrage ist gespeichert (offen, von "+ang.von+")");
  else fail("Anfrage nicht gespeichert: "+JSON.stringify(cp&&cp[kinder.gast])); }
b=await body();
if(/wartet auf Antwort/.test(b)) ok("Beim Fahrer steht „wartet auf Antwort“"); else fail("Kein Wartestatus beim Fahrer");
if(/Anfrage zurückziehen/.test(b)) ok("Und er kann die Anfrage zurückziehen"); else fail("Kein Zurückziehen möglich");

// ===== 2) Beim Angefragten poppt die Meldung auf =====
await alsEltern(kinder.gast);
b=await body();
if(new RegExp(kinder.fahrer.replace(/[.*+?^${}()|[\]\\]/g,"\\$&")+" nimmt ").test(b)) ok("Beim Angefragten poppt die Meldung auf: "+(b.match(/\w+ [\w.]+ nimmt [^\n]*/)||[""])[0]);
else fail("Keine Meldung beim Angefragten: "+b.slice(0,300).replace(/\n/g," | "));
if(/✅ Ja, gerne/.test(b)&&/❌ Passt nicht/.test(b)) ok("Mit Zusage und Absage"); else fail("Knöpfe fehlen in der Meldung");
if(/Später entscheiden/.test(b)) ok("Und man kann später entscheiden"); else fail("Kein „Später entscheiden“");
// Erst absagen - mit Begründung
await klick("^❌ Passt nicht$"); await page.waitForTimeout(800);
b=await body();
if(/Warum passt es nicht\?/.test(b)&&/freiwillig/.test(b)) ok("Die Begründung wird gefragt – und ist freiwillig");
else fail("Keine Grund-Abfrage: "+b.slice(0,300).replace(/\n/g," | "));
await klick("^Wir fahren selbst$"); await page.waitForTimeout(1600);
{ const cp=await carpool(); const ang=cp&&cp[kinder.gast]&&cp[kinder.gast].angebot;
  if(ang&&ang.status==="nein"&&ang.grund==="Wir fahren selbst") ok("Absage samt Grund gespeichert: "+ang.grund);
  else fail("Absage nicht gespeichert: "+JSON.stringify(cp&&cp[kinder.gast])); }
b=await body();
if(!/nimmt .* mit/.test(b)) ok("Die Meldung ist danach weg"); else fail("Meldung bleibt stehen");

// ===== 3) Der Fahrer sieht die Absage =====
await alsEltern(kinder.fahrer);
b=await body();
if(/hat abgesagt: Wir fahren selbst/.test(b)) ok("Der Fahrer sieht die Absage mit Grund");
else fail("Absage beim Fahrer nicht sichtbar: "+b.slice(0,320).replace(/\n/g," | "));

// ===== 4) Zweiter Anlauf: diesmal Zusage =====
await klick("^🚗 Ich nehme "+kinder.gast.split(" ")[0]+" mit$"); await page.waitForTimeout(1500);
await alsEltern(kinder.gast);
await klick("^✅ Ja, gerne$"); await page.waitForTimeout(1600);
{ const cp=await carpool(); const e=cp&&cp[kinder.gast];
  if(e&&e.car===kinder.fahrer&&e.angebot&&e.angebot.status==="ok") ok("Nach der Zusage sitzt das Kind im Auto von "+e.car);
  else fail("Zusage nicht übernommen: "+JSON.stringify(e)); }
await alsEltern(kinder.fahrer);
b=await body();
{ const proben=b.split("\n");
  const imAuto=b.includes(kinder.gast)&&/Sportplatz|📍/.test(b);
  if(imAuto&&!/hat abgesagt/.test(b)) ok("Alle sehen den Mitfahrer im Auto");
  else if(imAuto) ok("Der Mitfahrer steht im Auto (alte Absage steht noch in der Historie)");
  else fail("Mitfahrer nicht im Auto sichtbar: "+b.slice(0,320).replace(/\n/g," | ")); }

if(errors.length){ console.log("JS-FEHLER:"); [...new Set(errors)].forEach(e=>console.log(" -",e.slice(0,150))); }
console.log(errors.length||fails.length?`ERGEBNIS: ${fails.length} Fehlschläge, ${errors.length} JS-Fehler`:"ERGEBNIS: ALLES OK");
await browser.close(); srv.close();
process.exit(errors.length||fails.length?1:0);
