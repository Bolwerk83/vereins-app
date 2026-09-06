// E2E-Test: „🆘 Vertretung suchen".
//   1. Ein Gesuch sehen alle anderen Trainer des Vereins.
//   2. Wer übernimmt, steht danach als Betreuer IM Termin (Anwesenheit +
//      Betreuer-Liste) – die Betreuer-Zahlen stimmen dadurch wieder.
//   3. Der Suchende bekommt beim nächsten Öffnen eine Meldung.
//   4. „Doch nicht" nimmt die Übernahme samt Eintrag zurück.
// Aufruf: npm run build && node scripts/test-vertretung.mjs
import { chromium } from "playwright-core";
import http from "http"; import fs from "fs"; import path from "path";
const dist = path.resolve("dist");
const srv = http.createServer((req,res)=>{ let p=path.join(dist,req.url.split("?")[0]); if(!fs.existsSync(p)||fs.statSync(p).isDirectory()) p=path.join(dist,"index.html"); res.setHeader("content-type",{".html":"text/html",".js":"text/javascript",".css":"text/css"}[path.extname(p)]||"text/plain"); res.end(fs.readFileSync(p)); }).listen(4311);
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
  const fx=[...document.querySelectorAll("div")].filter(d=>getComputedStyle(d).position==="fixed"&&d.querySelector("button")&&d.innerText.length>30&&!/übernimmt für dich/.test(d.innerText||""));
  for(const f of fx){ const b=[...f.querySelectorAll("button")].find(x=>/geht|Los|Verstanden|Alles klar –|Fertig|Jetzt nicht|Weiter →|Überspringen|Start/i.test(x.innerText)); if(b){ b.click(); return false; } }
  return true; }); await page.waitForTimeout(400); if(done) break; } };
const klick=(re)=>page.evaluate(r=>{
  const b=[...document.querySelectorAll("button")].find(x=>new RegExp(r).test((x.innerText||"").trim()));
  if(!b) return false; b.click(); return true; }, re instanceof RegExp?re.source:re);
const alsTrainer=async(name,id)=>{
  await page.evaluate(({n,i})=>{ localStorage.setItem("va_tsimple","0");
    sessionStorage.setItem("vereinsapp_v12_session", JSON.stringify({role:"trainer",cid:"demo",tids:["demo_f1"],name:n,id:i})); },{n:name,i:id});
  await page.goto("http://127.0.0.1:4311/", { waitUntil:"networkidle" }); await page.waitForTimeout(2800); await dismiss();
};
const stand=()=>page.evaluate(()=>{
  const d=JSON.parse(localStorage.getItem("vereinsapp_v14")||"null");
  const ev=(d.events||[]).filter(e=>e.cid==="demo"&&e.tid==="demo_f1").sort((a,b)=>String(a.date).localeCompare(String(b.date)))[0];
  const r=(d.subRequests||[])[0]||null;
  return { req:r, presence:Object.values((ev&&ev.trainerPresence)||{}).map(x=>x.name),
           votes:Object.entries((ev&&ev.votes)||{}).filter(([,v])=>v&&v.role==="trainer").map(([n])=>n) }; });

await page.addInitScript(()=>{ if(!localStorage.getItem("vereinsapp_config")) localStorage.setItem("vereinsapp_config", JSON.stringify({url:"https://127.0.0.1:1/x", key:"test"})); });
await page.goto("http://127.0.0.1:4311/", { waitUntil:"networkidle" }); await page.waitForTimeout(2500);
await page.evaluate(()=>{ localStorage.setItem("va_simple","0"); localStorage.setItem("va_tsimple","0");
  sessionStorage.setItem("vereinsapp_v12_session", JSON.stringify({role:"trainer",cid:"demo",tids:["demo_f1"],name:"Trainer Eins",id:"tr_eins"})); });
await page.reload({waitUntil:"networkidle"}); await page.waitForTimeout(2600); await dismiss();
await page.evaluate(()=>{ const b=[...document.querySelectorAll("button")].find(x=>/Bin dabei/.test(x.innerText)); b&&b.click(); });
await page.waitForTimeout(1500);
await page.evaluate(()=>{
  const d=JSON.parse(localStorage.getItem("vereinsapp_v14"));
  const p=v=>String(v).padStart(2,"0"); const tg=n=>{const x=new Date(Date.now()+n*86400000);return `${x.getFullYear()}-${p(x.getMonth()+1)}-${p(x.getDate())}`;};
  const evs=(d.events||[]).filter(e=>e.cid==="demo"&&e.tid==="demo_f1").sort((a,b)=>String(a.date).localeCompare(String(b.date)));
  Object.assign(evs[0],{ type:"training", date:tg(3), time:"17:30", endTime:"19:00", title:"Training",
    loc:"Sportplatz", note:"", deadline:null, trainerPresence:{}, votes:{} });
  evs.slice(1).forEach(e=>{ e.date=tg(14); });
  d.subRequests=[];
  localStorage.setItem("vereinsapp_v14", JSON.stringify(d));
});
await page.reload({waitUntil:"networkidle"}); await page.waitForTimeout(2800); await dismiss();

// ===== 1) Gesuch stellen =====
await page.evaluate(()=>{ const b=[...document.querySelectorAll("button")].find(x=>(x.innerText||"").trim()==="⋯"); b&&b.click(); });
await page.waitForTimeout(700);
{ const geklickt=await klick("Vertretung suchen");
  if(geklickt) ok("Der Knopf Vertretung suchen steckt hinter dem ⋯-Menü");
  else fail("Kein Vertretung-Knopf im ⋯-Menü"); }
await page.waitForTimeout(800);
let b=await body();
if(/Gesuch an alle Trainer senden/.test(b)) ok("Das Fenster erklärt, wer es sieht"); else fail("Kein Gesuch-Fenster: "+b.slice(0,240).replace(/\n/g," | "));
await page.evaluate(()=>{ const t=document.querySelector("textarea"); if(t){ const set=Object.getOwnPropertyDescriptor(window.HTMLTextAreaElement.prototype,"value").set; set.call(t,"Bin krank"); t.dispatchEvent(new Event("input",{bubbles:true})); } });
await page.waitForTimeout(300);
await klick("Gesuch an alle Trainer senden"); await page.waitForTimeout(1400);
{ const st=await stand();
  if(st.req&&st.req.status==="open"&&st.req.note==="Bin krank") ok("Das Gesuch ist gespeichert (offen, mit Grund)");
  else fail("Gesuch nicht gespeichert: "+JSON.stringify(st.req)); }

// ===== 2) Ein anderer Trainer sieht und übernimmt =====
await alsTrainer("Trainer Zwei","tr_zwei");
b=await body();
if(/Vertretung & Unterstützung/.test(b)&&/Trainer Eins/.test(b)) ok("Ein anderer Trainer sieht das Gesuch");
else fail("Gesuch beim anderen Trainer nicht sichtbar: "+b.slice(0,300).replace(/\n/g," | "));
if(/Bin krank/.test(b)) ok("Mit dem angegebenen Grund"); else fail("Grund fehlt");
{ const geklickt=await klick("Ich übernehme"); await page.waitForTimeout(1600);
  const st=await stand();
  if(geklickt&&st.req&&st.req.status==="taken"&&st.req.takenBy==="Trainer Zwei") ok("Die Übernahme ist gespeichert");
  else fail("Übernahme nicht gespeichert: "+JSON.stringify(st.req));
  if(st.presence.includes("Trainer Zwei")) ok("Und er steht jetzt als anwesender Betreuer im Termin");
  else fail("Nicht in der Anwesenheit: "+JSON.stringify(st.presence));
  if(st.votes.includes("Trainer Zwei")) ok("Sowie mit Zusage in der Betreuer-Liste");
  else fail("Keine Betreuer-Zusage: "+JSON.stringify(st.votes)); }

// ===== 3) Der Suchende bekommt die Meldung =====
await alsTrainer("Trainer Eins","tr_eins");
b=await body();
if(/Trainer Zwei übernimmt für dich/.test(b)) ok("Beim Suchenden poppt die Meldung auf");
else fail("Keine Meldung beim Suchenden: "+b.slice(0,300).replace(/\n/g," | "));
if(/steht jetzt als Betreuer im Termin/.test(b)) ok("Mit dem Hinweis, dass die Zahlen wieder stimmen"); else fail("Kein Hinweis auf den Eintrag");
await klick("Alles klar – danke!"); await page.waitForTimeout(1400);
{ const st=await stand();
  if(st.req&&st.req.ack) ok("Nach dem Bestätigen kommt sie nicht wieder");
  else fail("Bestätigung nicht gespeichert: "+JSON.stringify(st.req)); }
b=await body();
if(!/übernimmt für dich/.test(b)) ok("Die Meldung ist weg"); else fail("Meldung bleibt stehen");

// ===== 4) „Doch nicht“ nimmt alles zurück =====
await alsTrainer("Trainer Zwei","tr_zwei");
{ const geklickt=await klick("Doch nicht"); await page.waitForTimeout(1600);
  const st=await stand();
  if(geklickt&&st.req&&st.req.status==="open") ok("„Doch nicht“ öffnet das Gesuch wieder");
  else fail("Gesuch nicht wieder offen: "+JSON.stringify(st.req&&st.req.status));
  if(!st.presence.includes("Trainer Zwei")&&!st.votes.includes("Trainer Zwei"))
    ok("Und der Eintrag im Termin ist wieder raus");
  else fail("Eintrag bleibt: "+JSON.stringify({p:st.presence,v:st.votes})); }

if(errors.length){ console.log("JS-FEHLER:"); [...new Set(errors)].forEach(e=>console.log(" -",e.slice(0,150))); }
console.log(errors.length||fails.length?`ERGEBNIS: ${fails.length} Fehlschläge, ${errors.length} JS-Fehler`:"ERGEBNIS: ALLES OK");
await browser.close(); srv.close();
process.exit(errors.length||fails.length?1:0);
