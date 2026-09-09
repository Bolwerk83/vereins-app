// E2E-Test: In der Aufstellung sollen bei „Betreuung“ nur die Betreuer
// vorgeschlagen werden, die bei DIESEM Termin dabei sind – nicht alle
// Trainer und Helfer des Vereins.
//   1. Wer als Betreuer zugesagt hat, steht als Vorschlag da.
//   2. Wer nicht zugesagt hat, steht gar nicht zur Auswahl.
//   3. Eingecheckte Trainer (Vertretung) zählen als dabei.
//   4. Ohne jede Zusage steht ein Hinweis statt einer langen Namensliste.
// Aufruf: npm run build && node scripts/test-betreuung-vorschlag.mjs
import { chromium } from "playwright-core";
import http from "http"; import fs from "fs"; import path from "path";
const dist = path.resolve("dist");
const srv = http.createServer((req,res)=>{ let p=path.join(dist,req.url.split("?")[0]); if(!fs.existsSync(p)||fs.statSync(p).isDirectory()) p=path.join(dist,"index.html"); res.setHeader("content-type",{".html":"text/html",".js":"text/javascript",".css":"text/css"}[path.extname(p)]||"text/plain"); res.end(fs.readFileSync(p)); }).listen(4321);
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
  const fx=[...document.querySelectorAll("div")].filter(d=>getComputedStyle(d).position==="fixed"&&d.querySelector("button")&&d.innerText.length>30);
  for(const f of fx){ const b=[...f.querySelectorAll("button")].find(x=>/geht|Los|Verstanden|Alles klar|Fertig|Jetzt nicht|Weiter →|Überspringen|Start/i.test(x.innerText)); if(b){ b.click(); return false; } }
  return true; }); await page.waitForTimeout(400); if(done) break; } };
// Die Betreuung-Zeile: die vorgeschlagenen Namen (die Knöpfe zeigen nur den
// Vornamen, der volle Name steht im title) und der Text der Zeile.
const betreuung = () => page.evaluate(()=>{
  const kopf=[...document.querySelectorAll("span")].find(x=>(x.innerText||"").trim()==="BETREUUNG");
  if(!kopf) return null;
  const zeile=kopf.parentElement; if(!zeile) return null;
  const namen=[...zeile.querySelectorAll("button")]
    .map(b=>(b.getAttribute("title")||"").replace(/ dieser Mannschaft zuweisen$/,""))
    .filter(x=>x&&!/^Nur die|^Auch Trainer/.test(x));
  return { namen, text:(zeile.innerText||"").replace(/\n/g," | ").trim() }; });
// Termin öffnen und zur Aufstellung wechseln
const zurAufstellung = async () => {
  await page.evaluate(()=>{ const b=[...document.querySelectorAll("button")].find(x=>/^(Ansehen|✅ Anwesenheit)$/.test((x.innerText||"").trim())); b&&b.click(); });
  await page.waitForTimeout(1500);
  await page.evaluate(()=>{ const b=[...document.querySelectorAll("button")].find(x=>/^(⚽ Aufstellung|Aufstellung)$/.test((x.innerText||"").trim())); b&&b.click(); });
  await page.waitForTimeout(1200);
};

await page.addInitScript(()=>{
  if(!localStorage.getItem("vereinsapp_config")) localStorage.setItem("vereinsapp_config", JSON.stringify({url:"https://127.0.0.1:1/x", key:"test"}));
  if(localStorage.getItem("va_simple")===null)  localStorage.setItem("va_simple","0");
  if(localStorage.getItem("va_tsimple")===null) localStorage.setItem("va_tsimple","0");
});
await page.goto("http://127.0.0.1:4321/", { waitUntil:"networkidle" }); await page.waitForTimeout(2500);
await page.evaluate(()=>{ sessionStorage.setItem("vereinsapp_v12_session", JSON.stringify({role:"trainer",cid:"demo",tids:["demo_f1"],name:"Demo Trainer",id:"demo_tr1"})); });
await page.reload({waitUntil:"networkidle"}); await page.waitForTimeout(2600); await dismiss();
await page.evaluate(()=>{ const b=[...document.querySelectorAll("button")].find(x=>/Bin dabei/.test(x.innerText)); b&&b.click(); });
await page.waitForTimeout(1500);

// Turnier: Kinder sagen zu, „Trainer A“ (Mannschaft demo_f1) sagt als Betreuer zu.
// „Trainer B“ gehört zu anderen Mannschaften und sagt NICHT zu.
const start = await page.evaluate(()=>{
  const d=JSON.parse(localStorage.getItem("vereinsapp_v14")||"null"); if(!d) return null;
  const p=v=>String(v).padStart(2,"0"); const x=new Date(Date.now()+2*86400000);
  const ev=(d.events||[]).filter(e=>e.cid==="demo"&&e.tid==="demo_f1"&&(e.pt==="att"||!e.pt))
    .sort((a,b)=>String(a.date||"").localeCompare(String(b.date||"")))[0]; if(!ev) return null;
  const k=[...new Set([...((d.players||{})["demo_f1"]||[]),
    ...((d.playerProfiles||[]).filter(pp=>pp.mainTid==="demo_f1"&&!pp.archived).map(pp=>pp.name))])];
  const ts=new Date().toISOString();
  Object.assign(ev,{ type:"turnier", date:`${x.getFullYear()}-${p(x.getMonth()+1)}-${p(x.getDate())}`,
    time:"09:30", endTime:"12:00", title:"Kinderfestival", loc:"Halle", note:"", deadline:null,
    carpoolExtra:false, carpoolEnabled:false, extraPolls:[], duties:[], lineup:null, lineups:null,
    trainerPresence:{},
    votes:{...Object.fromEntries(k.slice(0,4).map(n=>[n,{val:"yes",ts,role:"player"}])),
           "Trainer A":{val:"yes",ts}} });
  // alle anderen Termine nach hinten, damit das Turnier oben steht
  (d.events||[]).filter(e=>e.cid==="demo"&&e.id!==ev.id).forEach(e=>{
    const y=new Date(Date.now()+12*86400000);
    e.date=`${y.getFullYear()}-${p(y.getMonth()+1)}-${p(y.getDate())}`; });
  localStorage.setItem("vereinsapp_v14", JSON.stringify(d));
  const tr=(d.trainers||[]).filter(t=>t.cid==="demo").map(t=>t.name);
  return {ev:ev.id, trainer:tr};
});
if(start) ok(`Ausgangslage: Turnier der F-Jugend 1, Trainer im Verein: ${start.trainer.join(", ")} – nur „Trainer A“ hat zugesagt`);
else { fail("Konnte die Ausgangslage nicht setzen"); process.exit(1); }
await page.reload({waitUntil:"networkidle"}); await page.waitForTimeout(2800); await dismiss();

// ===== 1) Nur wer dabei ist, wird vorgeschlagen =====
await zurAufstellung();
let z=await betreuung();
if(z) ok("Betreuung-Zeile gefunden: "+z.namen.join(", ")+" · "+z.text.slice(0,50));
else { fail("Keine Betreuung-Zeile: "+(await body()).slice(0,250).replace(/\n/g," | ")); process.exit(1); }
if(z.namen.includes("Trainer A")) ok("„Trainer A“ steht als Vorschlag da – er hat zugesagt");
else fail("Der zugesagte Trainer fehlt: "+z.namen.join(", "));
if(!z.namen.includes("Trainer B")) ok("„Trainer B“ steht NICHT dabei – er hat nicht zugesagt und betreut andere Mannschaften");
else fail("Fremder Trainer wird vorgeschlagen: "+z.namen.join(", "));
if(z.namen.length===1) ok("Genau ein Vorschlag statt der ganzen Betreuer-Liste");
else fail("Zu viele Vorschläge: "+z.namen.join(", "));

// ===== 2) Es gibt keinen Umweg zu den übrigen =====
if(!/weitere/.test(z.text)) ok("Es gibt keinen Knopf, der die übrigen Trainer und Helfer nachlädt");
else fail("Es lassen sich doch weitere einblenden: "+z.text);

// ===== 3) Eingecheckter Trainer (Vertretung) zählt als dabei =====
await page.evaluate(id=>{ const d=JSON.parse(localStorage.getItem("vereinsapp_v14")||"null");
  const ev=(d.events||[]).find(e=>e.id===id);
  ev.trainerPresence={ dt2:{ name:"Trainer B", ts:new Date().toISOString(), trainerId:"dt2", sub:true } };
  localStorage.setItem("vereinsapp_v14", JSON.stringify(d)); }, start.ev);
await page.reload({waitUntil:"networkidle"}); await page.waitForTimeout(2800); await dismiss();
await zurAufstellung();
z=await betreuung();
if(z.namen.includes("Trainer B")) ok("Wer die Vertretung übernommen hat, steht sofort zur Auswahl");
else fail("Eingecheckter Trainer fehlt: "+z.namen.join(", "));

// ===== 4) Ohne jede Zusage: Hinweis statt Namensliste =====
await page.evaluate(id=>{ const d=JSON.parse(localStorage.getItem("vereinsapp_v14")||"null");
  const ev=(d.events||[]).find(e=>e.id===id);
  ev.trainerPresence={};
  const v={...(ev.votes||{})}; delete v["Trainer A"]; ev.votes=v;
  localStorage.setItem("vereinsapp_v14", JSON.stringify(d)); }, start.ev);
await page.reload({waitUntil:"networkidle"}); await page.waitForTimeout(2800); await dismiss();
await zurAufstellung();
z=await betreuung();
if(/Noch keine Betreuer-Zusage/.test(z.text)) ok("Ohne Zusage steht dort ein Hinweis statt einer langen Namensliste");
else fail("Kein Hinweis bei fehlender Zusage: "+z.text);
if(z.namen.length===0) ok("Und es wird niemand vorgeschlagen, der gar nicht zugesagt hat");
else fail("Trotzdem Vorschläge: "+z.namen.join(", "));
if(!/weitere/.test(z.text)) ok("Auch dann wird niemand nachgeladen – die Zeile bleibt leer bis zur ersten Zusage");
else fail("Doch ein Nachlade-Knopf: "+z.text);

if(errors.length){ console.log("JS-FEHLER:"); [...new Set(errors)].forEach(e=>console.log(" -",e.slice(0,150))); }
console.log(errors.length||fails.length?`ERGEBNIS: ${fails.length} Fehlschläge, ${errors.length} JS-Fehler`:"ERGEBNIS: ALLES OK");
await browser.close(); srv.close();
process.exit(errors.length||fails.length?1:0);
