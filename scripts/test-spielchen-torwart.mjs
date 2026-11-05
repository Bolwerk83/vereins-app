// E2E-Test: Spielchen im Training – 6 gegen 6 wird mit Torhüter gespielt.
// Gemeldet: „Beim Training 6 bis 6 soll mit Torhüter sein." Vorher hing das
// am Kader: Ein Tor gab es nur, wenn auf BEIDEN Seiten ein Kind „Torwart" im
// Profil hatte - und das hat in dem Alter fast niemand. Also lief 6 gegen 6
// ohne Tor. Jetzt entscheidet die Spielform.
//   1. 5+1 / 6 (F-Jugend): beide Seiten mit Torwart, obwohl niemand Torwart ist.
//   2. Die Paarung ist als „mit Torwart" gekennzeichnet.
//   3. 3 gegen 3 (Bambini) bleibt ohne Tor.
//   4. Der Trainer kann je Termin auf „ohne (Futsal)" umschalten.
//   5. Und ausdrücklich „mit Torwart" erzwingen, auch bei 3 gegen 3.
//   6. Wer Torwart im Profil hat, steht zuerst im Tor.
// Aufruf: npm run build && node scripts/test-spielchen-torwart.mjs
import { chromium } from "playwright-core";
import http from "http"; import fs from "fs"; import path from "path";
const dist = path.resolve("dist");
const srv = http.createServer((req,res)=>{ let p=path.join(dist,req.url.split("?")[0]); if(!fs.existsSync(p)||fs.statSync(p).isDirectory()) p=path.join(dist,"index.html"); res.setHeader("content-type",{".html":"text/html",".js":"text/javascript",".css":"text/css"}[path.extname(p)]||"text/plain"); res.end(fs.readFileSync(p)); }).listen(4351);
const exe=(()=>{ if(process.env.PLAYWRIGHT_CHROMIUM) return process.env.PLAYWRIGHT_CHROMIUM;
  const basis=process.env.PLAYWRIGHT_BROWSERS_PATH||"/opt/pw-browsers";
  const kand=[`${basis}/chromium`, ...fs.existsSync(basis)
    ? fs.readdirSync(basis).filter(d=>d.startsWith("chromium-")).sort().reverse()
        .flatMap(d=>["chrome-linux64/chrome","chrome-linux/chrome"].map(x=>`${basis}/${d}/${x}`))
    : []];
  for(const p of kand){ try{ if(fs.existsSync(p)) return p; }catch{} }
  return `${basis}/chromium`; })();
const browser = await chromium.launch({ executablePath:exe, args:["--no-sandbox"] });
const page = await browser.newPage({ viewport:{ width:390, height:900 } });
page.setDefaultTimeout(10000);
const errors=[]; const fails=[];
page.on("pageerror", e=>errors.push(e.message));
page.on("dialog", d=>d.accept());
const fail=m=>{ fails.push(m); console.log("FEHLGESCHLAGEN:", m); };
const ok=m=>console.log("OK:", m);
const kurz=t=>String(t).slice(0,340).replace(/\n/g," | ");
const klick=(re)=>page.evaluate(r=>{
  const b=[...document.querySelectorAll("button")].find(x=>new RegExp(r).test((x.innerText||"").replace(/\s+/g," ").trim()));
  if(!b||b.disabled) return false; b.click(); return true; }, re instanceof RegExp?re.source:re);
const dismiss=async()=>{ for(let k=0;k<12;k++){ const done=await page.evaluate(()=>{
  const fx=[...document.querySelectorAll("div")].filter(d=>getComputedStyle(d).position==="fixed"&&d.querySelector("button")&&d.innerText.length>30);
  for(const f of fx){ const b=[...f.querySelectorAll("button")].find(x=>/geht|Los|Verstanden|Alles klar|Fertig|Jetzt nicht|Weiter →|Überspringen|Start/i.test(x.innerText)); if(b){ b.click(); return false; } }
  return true; }); await page.waitForTimeout(400); if(done) break; } };
// Der Spielchen-Block als Text: der kleinste Kasten, der Kopf UND Paarung hat.
const spielchen=()=>page.evaluate(()=>{
  const a=[...document.querySelectorAll("div")].filter(x=>/SPIELFORM/.test(x.innerText||"")
    && /Zum Ändern einen Namen antippen/.test(x.innerText||""));
  const d=a.sort((p,q)=>(p.innerText||"").length-(q.innerText||"").length)[0];
  return d?(d.innerText||""):""; });
const zaehl=(t,re)=>(String(t).match(re)||[]).length;

await page.addInitScript(()=>{
  if(!localStorage.getItem("vereinsapp_config")) localStorage.setItem("vereinsapp_config", JSON.stringify({url:"https://127.0.0.1:1/x", key:"test"}));
  if(localStorage.getItem("va_simple")===null)  localStorage.setItem("va_simple","0");
  if(localStorage.getItem("va_tsimple")===null) localStorage.setItem("va_tsimple","0");
});
await page.goto("http://127.0.0.1:4351/", { waitUntil:"networkidle" }); await page.waitForTimeout(2500);
await page.evaluate(()=>{ sessionStorage.setItem("vereinsapp_v12_session", JSON.stringify({role:"trainer",cid:"demo",tids:["demo_f1"],name:"Demo Trainer",id:"demo_tr1"})); });
await page.reload({waitUntil:"networkidle"}); await page.waitForTimeout(2600); await dismiss();
await page.evaluate(()=>{ const b=[...document.querySelectorAll("button")].find(x=>/Bin dabei/.test(x.innerText)); b&&b.click(); });
await page.waitForTimeout(1400);

// 12 Zusagen in EINER Gruppe -> eine Paarung 6 gegen 6. Niemand ist Torwart.
const setup = await page.evaluate(()=>{
  const d=JSON.parse(localStorage.getItem("vereinsapp_v14")||"null");
  const p=v=>String(v).padStart(2,"0");
  const tg=n=>{ const x=new Date(Date.now()+n*86400000); return `${x.getFullYear()}-${p(x.getMonth()+1)}-${p(x.getDate())}`; };
  const vorhanden=(d.playerProfiles||[]).filter(q=>q.mainTid==="demo_f1"&&!q.archived);
  const namen=vorhanden.map(q=>q.name); let i=1;
  while(namen.length<12){ const n="Kind "+i;
    d.playerProfiles.push({id:"pp_tw"+i,cid:"demo",seasonId:vorhanden[0]&&vorhanden[0].seasonId,archived:false,
      name:n,by:2017,gender:"m",mainTid:"demo_f1",optTids:[],friends:[],mustWith:[]});
    namen.push(n); i++; }
  const k=namen.slice(0,12);
  // Alle in dieselbe Gruppe, alle Mittelfeld: niemand kann ins Tor.
  (d.playerProfiles||[]).filter(q=>q.mainTid==="demo_f1").forEach(q=>{
    q.intGrp = k.includes(q.name) ? "g1" : "";
    q.position="Zentrales Mittelfeld"; q.posAlt=[]; });
  const ev=(d.events||[]).filter(e=>e.cid==="demo"&&e.tid==="demo_f1")[0];
  const ts=new Date().toISOString();
  Object.assign(ev,{ type:"training", date:tg(2), time:"17:30", endTime:"19:00", title:"Training", loc:"Platz",
    note:"", deadline:null, extraPolls:[], duties:[], spielFest:null, spielGr:null, spielTW:undefined,
    votes:Object.fromEntries(k.map(n=>[n,{val:"yes",ts,role:"player"}])) });
  (d.events||[]).filter(e=>e.cid==="demo"&&e.id!==ev.id).forEach(e=>{ e.date=tg(14); });
  localStorage.setItem("vereinsapp_v14", JSON.stringify(d));
  return { evId:ev.id, kader:k };
});
if(setup&&setup.kader.length===12) ok("Training mit 12 Zusagen – niemand hat Torwart im Profil");
else { fail("Testdaten nicht gesetzt"); process.exit(1); }

const zumTermin=async()=>{
  await page.reload({waitUntil:"networkidle"}); await page.waitForTimeout(2800); await dismiss();
  await page.evaluate(()=>{ const b=[...document.querySelectorAll("button")].find(x=>/^(Ansehen|✅ Anwesenheit)$/.test((x.innerText||"").trim())); b&&b.click(); });
  await page.waitForTimeout(1800);
};
await zumTermin();

// ===== 1+2) 6 gegen 6 mit Torwart =====
let s=await spielchen();
if(/6 gegen 6/.test(s)) ok("Die Einteilung steht: 6 gegen 6");
else fail("Keine 6 gegen 6: "+kurz(s));
if(zaehl(s,/TOR\b/g)>=2) ok("Beide Seiten haben ein Tor besetzt – obwohl niemand Torwart ist");
else fail("Kein Torwart aufgestellt – genau der gemeldete Fehler: "+kurz(s));
if(/mit Torwart/.test(s)&&!/ohne Torwart/.test(s)) ok("Die Paarung ist als „mit Torwart“ gekennzeichnet");
else fail("Kennzeichnung fehlt: "+kurz(s));

// ===== 3) 3 gegen 3 bleibt ohne Tor =====
if(await klick("^3 gegen 3$")) ok("Die Spielform lässt sich auf 3 gegen 3 stellen");
else fail("Kein Knopf „3 gegen 3“");
await page.waitForTimeout(1600);
s=await spielchen();
if(zaehl(s,/TOR\b/g)===0&&/ohne Torwart/.test(s)) ok("3 gegen 3 läuft ohne Tor – wie im Bambini-Spiel");
else fail("3 gegen 3 mit Tor: "+kurz(s));

// ===== 5) „mit Torwart" lässt sich erzwingen =====
if(await klick("mit Torwart")) ok("Der Schalter „🧤 mit Torwart“ ist da");
else fail("Kein Torwart-Schalter");
await page.waitForTimeout(1600);
s=await spielchen();
if(zaehl(s,/TOR\b/g)>=2) ok("Auch bei 3 gegen 3 kann der Trainer mit Torwart spielen lassen");
else fail("Erzwungener Torwart fehlt: "+kurz(s));

// ===== 4) „ohne (Futsal)" =====
if(await klick("ohne \\(Futsal\\)")) ok("Und der Schalter „ohne (Futsal)“ ebenfalls");
else fail("Kein Futsal-Schalter");
await page.waitForTimeout(1600);
s=await spielchen();
if(zaehl(s,/TOR\b/g)===0) ok("Ohne Torwart wird der Platz im Mittelfeld aufgefüllt");
else fail("Trotz Futsal ein Tor: "+kurz(s));
// zurueck auf die Spielform der F-Jugend, mit Torwart
await klick("5\\+1 / 6"); await page.waitForTimeout(1200);
await klick("mit Torwart"); await page.waitForTimeout(1600);
s=await spielchen();
if(/6 gegen 6/.test(s)&&zaehl(s,/TOR\b/g)>=2) ok("Zurück auf 5+1 / 6: wieder 6 gegen 6 mit Torwart");
else fail("Rückweg klappt nicht: "+kurz(s));

// ===== 6) Ein echter Torwart steht zuerst im Tor =====
await page.evaluate(k=>{ const d=JSON.parse(localStorage.getItem("vereinsapp_v14")||"null");
  d.playerProfiles=(d.playerProfiles||[]).map(p=>p.name===k?{...p,position:"Torwart"}:p);
  const ev=(d.events||[]).find(e=>e.tid==="demo_f1"&&e.type==="training");
  if(ev){ ev.spielFest=null; }
  localStorage.setItem("vereinsapp_v14", JSON.stringify(d)); }, setup.kader[0]);
await zumTermin();
s=await spielchen();
{ // Zeile "TOR" der Aufstellung finden - nicht die Schalter-Zeile "TORWART"
  const z=s.split("\n"); const i=z.findIndex(x=>x.trim()==="TOR");
  const nach=z.slice(i, i+8).join(" | ");
  if(i>=0 && new RegExp(String(setup.kader[0]).split(" ")[0]).test(nach))
    ok(`Wer Torwart im Profil hat, steht im Tor (${setup.kader[0]})`);
  else fail("Echter Torwart nicht im Tor: "+kurz(nach)); }

if(errors.length){ console.log("JS-FEHLER:"); [...new Set(errors)].forEach(e=>console.log(" -",e.slice(0,150))); }
console.log(errors.length||fails.length?`ERGEBNIS: ${fails.length} Fehlschläge, ${errors.length} JS-Fehler`:"ERGEBNIS: ALLES OK");
await browser.close(); srv.close();
process.exit(errors.length||fails.length?1:0);
