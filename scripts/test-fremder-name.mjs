// E2E-Test: Ein Name, den es weder im Kader noch bei den Betreuern gibt,
// darf nicht als Betreuer erscheinen.
//   Fall aus der Praxis: Ein Kind wurde später umbenannt ("Zinedin S." →
//   "Zinedin B."). Die alten Zusagen blieben unter dem alten Namen stehen –
//   und die App zeigte ihn als dritten Trainer an.
//   1. Der Betreuer-Kasten zeigt nur echte Trainer und Helfer.
//   2. Der übrig gebliebene Name steht gesondert unter „NICHT IM KADER“.
//   3. Er zählt weder als Spieler noch als Betreuer.
//   4. Beim Umbenennen ziehen die Antworten künftig mit – es entsteht kein
//      neuer Karteirest.
// Aufruf: npm run build && node scripts/test-fremder-name.mjs
import { chromium } from "playwright-core";
import http from "http"; import fs from "fs"; import path from "path";
const dist = path.resolve("dist");
const srv = http.createServer((req,res)=>{ let p=path.join(dist,req.url.split("?")[0]); if(!fs.existsSync(p)||fs.statSync(p).isDirectory()) p=path.join(dist,"index.html"); res.setHeader("content-type",{".html":"text/html",".js":"text/javascript",".css":"text/css"}[path.extname(p)]||"text/plain"); res.end(fs.readFileSync(p)); }).listen(4319);
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
  const fx=[...document.querySelectorAll("div")].filter(d=>getComputedStyle(d).position==="fixed"&&d.querySelector("button")&&d.innerText.length>30);
  for(const f of fx){ const b=[...f.querySelectorAll("button")].find(x=>/geht|Los|Verstanden|Alles klar|Fertig|Jetzt nicht|Weiter →|Überspringen|Start/i.test(x.innerText)); if(b){ b.click(); return false; } }
  return true; }); await page.waitForTimeout(400); if(done) break; } };
// Innerster Kasten, dessen Text mit der Überschrift beginnt
const kasten = (kopf) => page.evaluate(k=>{
  const alle=[...document.querySelectorAll("div")].filter(d=>new RegExp("^"+k).test((d.innerText||"").trim()));
  const el=alle[alle.length-1]; if(!el) return null;
  return (el.parentElement||el).innerText.replace(/\n/g," | "); }, kopf);

await page.addInitScript(()=>{
  if(!localStorage.getItem("vereinsapp_config")) localStorage.setItem("vereinsapp_config", JSON.stringify({url:"https://127.0.0.1:1/x", key:"test"}));
  if(localStorage.getItem("va_simple")===null)  localStorage.setItem("va_simple","0");
  if(localStorage.getItem("va_tsimple")===null) localStorage.setItem("va_tsimple","0");
});
await page.goto("http://127.0.0.1:4319/", { waitUntil:"networkidle" }); await page.waitForTimeout(2500);
await page.evaluate(()=>{ sessionStorage.setItem("vereinsapp_v12_session", JSON.stringify({role:"trainer",cid:"demo",tids:["demo_f1"],name:"Demo Trainer",id:"demo_tr1"})); });
await page.reload({waitUntil:"networkidle"}); await page.waitForTimeout(2600); await dismiss();
await page.evaluate(()=>{ const b=[...document.querySelectorAll("button")].find(x=>/Bin dabei/.test(x.innerText)); b&&b.click(); });
await page.waitForTimeout(1500);

// Ausgangslage: ein Kind aus dem Kader, der Trainer und ein übrig gebliebener
// Name, den es nirgends (mehr) gibt.
const daten = await page.evaluate(()=>{
  const d=JSON.parse(localStorage.getItem("vereinsapp_v14")||"null"); if(!d) return null;
  const ev=(d.events||[]).filter(e=>e.cid==="demo"&&e.tid==="demo_f1"&&(e.pt==="att"||!e.pt))
    .sort((a,b)=>String(a.date||"").localeCompare(String(b.date||"")))[0]; if(!ev) return null;
  const kader=(d.playerProfiles||[]).filter(p=>p.mainTid==="demo_f1"&&!p.archived).map(p=>p.name);
  if(kader.length<1) return null;
  ev.votes={ [kader[0]]:{val:"yes",ts:"2026-08-20T18:00:00.000Z",role:"player"},
             "Demo Trainer":{val:"yes",ts:"2026-08-21T18:00:00.000Z",role:"trainer"},
             "Zinedin S.":{val:"yes",ts:"2026-08-23T18:30:00.000Z"} };
  localStorage.setItem("vereinsapp_v14", JSON.stringify(d));
  return {ev:ev.id, kind:kader[0]};
});
if(daten) ok(`Ausgangslage: ${daten.kind} (Kader), Demo Trainer, dazu der übrig gebliebene Name „Zinedin S.“`);
else { fail("Konnte die Ausgangslage nicht setzen"); process.exit(1); }
await page.reload({waitUntil:"networkidle"}); await page.waitForTimeout(2800); await dismiss();

// ===== 1) Betreuer-Kasten =====
await page.evaluate(()=>{ const b=[...document.querySelectorAll("button")].find(x=>/^(Ansehen|✅ Anwesenheit)$/.test((x.innerText||"").trim())); b&&b.click(); });
await page.waitForTimeout(1500);
await page.evaluate(()=>{ const b=[...document.querySelectorAll("button")].find(x=>/^(📊 Rückmeldungen|Rückmeldungen)$/.test((x.innerText||"").trim())); b&&b.click(); });
await page.waitForTimeout(1000);

const bet=await kasten("🧑‍🏫 BETREUER");
if(bet) ok("Betreuer-Kasten gefunden: "+bet.slice(0,90));
else fail("Kein Betreuer-Kasten");
if(/BETREUER \(1\)/.test(bet||"")) ok("Es wird genau ein Betreuer gezählt – der Trainer");
else fail("Falsche Betreuer-Zahl: "+(bet||"").slice(0,80));
if(bet&&/Demo Trainer/.test(bet)) ok("Der Trainer steht dort"); else fail("Trainer fehlt im Betreuer-Kasten");
if(bet&&!/Zinedin/.test(bet)) ok("„Zinedin S.“ steht NICHT bei den Betreuern");
else fail("Der fremde Name steht bei den Betreuern: "+bet);

// ===== 2) Eigener Kasten für den übrig gebliebenen Namen =====
const fremd=await kasten("❓ NICHT IM KADER");
if(fremd&&/Zinedin S\./.test(fremd)) ok("Er steht gesondert unter „NICHT IM KADER“: "+fremd.slice(0,70));
else fail("Kein Kasten „NICHT IM KADER“: "+(fremd||"—"));
if(fremd&&/NICHT IM KADER \(1\)/.test(fremd)) ok("Mit Anzahl (1)"); else fail("Falsche Anzahl: "+(fremd||""));
if(fremd&&/später geändert/.test(fremd)) ok("Und mit Erklärung, woher der Name kommt");
else fail("Keine Erklärung im Kasten: "+(fremd||""));

// ===== 3) Zählt nirgends mit =====
{ const b=await body();
  const m=b.match(/(\d+)\s*\n?\s*Spieler dabei/);
  if(m&&m[1]==="1") ok("„Spieler dabei“ zählt nur das Kind aus dem Kader (1)");
  else fail("Falsche Spielerzahl: "+(m?m[1]:"nicht gefunden")); }

// ===== 4) Umbenennen nimmt die Antworten mit =====
await page.evaluate(()=>{ const b=[...document.querySelectorAll("button")].find(x=>(x.innerText||"").trim()==="Team"); b&&b.click(); });
await page.waitForTimeout(1400); await dismiss();
await klick("^Spieler$"); await page.waitForTimeout(1400);
{ const auf=await page.evaluate(n=>{
    const btn=[...document.querySelectorAll('button[aria-label="Bearbeiten"]')]
      .find(b=>{ let k=b; for(let i=0;i<8&&k;i++){ if((k.innerText||"").includes(n)) return true; k=k.parentElement; } return false; });
    if(!btn) return false; btn.click(); return true; }, daten.kind);
  await page.waitForTimeout(1200);
  const offen=await page.evaluate(()=>!!document.querySelector('input[placeholder="z.B. Max M."]'));
  if(auf&&offen) ok("Das Spielerprofil lässt sich öffnen");
  else fail("Spielerprofil nicht offen"); }
await page.evaluate(()=>{
  const i=document.querySelector('input[placeholder="z.B. Max M."]'); if(!i) return;
  const set=Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype,"value").set;
  set.call(i,"Neuer Testname"); i.dispatchEvent(new Event("input",{bubbles:true}));
});
await page.waitForTimeout(500);
if(await klick("Spielerprofil speichern")) ok("Gespeichert"); else fail("Kein Speichern-Knopf");
await page.waitForTimeout(1800);
{ const st=await page.evaluate(id=>{
    const d=JSON.parse(localStorage.getItem("vereinsapp_v14")||"null");
    const ev=(d.events||[]).find(e=>e.id===id);
    const pp=(d.playerProfiles||[]).find(p=>p.name==="Neuer Testname");
    return {votes:Object.keys(ev?.votes||{}), profil:!!pp}; }, daten.ev);
  if(st.profil) ok("Der neue Name steht im Kader"); else fail("Umbenennen hat nicht gegriffen");
  if(st.votes.includes("Neuer Testname")) ok("Die Zusage ist mit umgezogen");
  else fail("Zusage blieb beim alten Namen: "+st.votes.join(", "));
  if(!st.votes.includes(daten.kind)) ok("Unter dem alten Namen steht nichts mehr – kein neuer Karteirest");
  else fail("Alter Name blieb stehen: "+st.votes.join(", ")); }

if(errors.length){ console.log("JS-FEHLER:"); [...new Set(errors)].forEach(e=>console.log(" -",e.slice(0,150))); }
console.log(errors.length||fails.length?`ERGEBNIS: ${fails.length} Fehlschläge, ${errors.length} JS-Fehler`:"ERGEBNIS: ALLES OK");
await browser.close(); srv.close();
process.exit(errors.length||fails.length?1:0);
