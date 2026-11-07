// E2E-Test: Mannschaftsauswahl über der Terminliste; Aufbau und Spickzettel
// sind aus der App genommen.
// Gewünscht: „Ich möchte in den Terminen, wenn ich in zwei oder mehreren
// Gruppen bin, oben eine Auswahl haben, zum Beispiel F2, F3 usw. Damit ich
// dort nur die Termine der F2 oder der F3 auswählen kann." Dazu: „Aufbau
// komplett aus der App nehmen. Auch Spickzettel rausnehmen."
//   1. Mit zwei Mannschaften steht oben eine Auswahl: Alle / F-Jugend 1 / F-Jugend 9.
//   2. Eine Mannschaft antippen zeigt nur deren Termine.
//   3. „Alle Mannschaften" zeigt wieder beide.
//   4. Die Wahl bleibt nach dem Neuladen bestehen.
//   5. Mit nur EINER Mannschaft erscheint die Auswahl nicht (kein Ballast).
//   6. Weder „🏗 Aufbau" noch „📋 Spickzettel" sind noch zu finden.
// Aufruf: npm run build && node scripts/test-mannschaftswahl.mjs
import { chromium } from "playwright-core";
import http from "http"; import fs from "fs"; import path from "path";
const dist = path.resolve("dist");
const srv = http.createServer((req,res)=>{ let p=path.join(dist,req.url.split("?")[0]); if(!fs.existsSync(p)||fs.statSync(p).isDirectory()) p=path.join(dist,"index.html"); res.setHeader("content-type",{".html":"text/html",".js":"text/javascript",".css":"text/css"}[path.extname(p)]||"text/plain"); res.end(fs.readFileSync(p)); }).listen(4218);
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
const body=()=>page.evaluate(()=>document.body.innerText);
const kurz=t=>String(t).slice(0,320).replace(/\n/g," | ");
const dismiss=async()=>{ for(let k=0;k<12;k++){ const done=await page.evaluate(()=>{
  const fx=[...document.querySelectorAll("div")].filter(d=>getComputedStyle(d).position==="fixed"&&d.querySelector("button")&&d.innerText.length>30);
  for(const f of fx){ const b=[...f.querySelectorAll("button")].find(x=>/geht|Los|Verstanden|Alles klar|Fertig|Jetzt nicht|Weiter →|Überspringen|Start/i.test(x.innerText)); if(b){ b.click(); return false; } }
  return true; }); await page.waitForTimeout(400); if(done) break; } };
const klick=(re)=>page.evaluate(r=>{
  const b=[...document.querySelectorAll("button")].find(x=>new RegExp(r).test((x.innerText||"").replace(/\s+/g," ").trim()));
  if(!b||b.disabled) return false; b.click(); return true; }, re instanceof RegExp?re.source:re);

await page.addInitScript(()=>{
  if(!localStorage.getItem("vereinsapp_config")) localStorage.setItem("vereinsapp_config", JSON.stringify({url:"https://127.0.0.1:1/x", key:"test"}));
  if(localStorage.getItem("va_simple")===null)  localStorage.setItem("va_simple","0");
  if(localStorage.getItem("va_tsimple")===null) localStorage.setItem("va_tsimple","0");
});
await page.goto("http://127.0.0.1:4218/", { waitUntil:"networkidle" }); await page.waitForTimeout(2500);
const alsTrainer=async(tids)=>{
  await page.evaluate(t=>{ sessionStorage.setItem("vereinsapp_v12_session", JSON.stringify({role:"trainer",cid:"demo",tids:t,name:"Demo Trainer",id:"demo_tr1"})); }, tids);
  await page.reload({waitUntil:"networkidle"}); await page.waitForTimeout(2700); await dismiss();
};
await alsTrainer(["demo_f1"]);
await page.evaluate(()=>{ const b=[...document.querySelectorAll("button")].find(x=>/Bin dabei/.test(x.innerText)); b&&b.click(); });
await page.waitForTimeout(1400);

// Zweite Mannschaft mit eigenen Terminen
const setup = await page.evaluate(()=>{
  const d=JSON.parse(localStorage.getItem("vereinsapp_v14")||"null");
  const z=x=>String(x).padStart(2,"0");
  const tag=n=>{ const x=new Date(); x.setHours(12,0,0,0); x.setDate(x.getDate()+n);
    return `${x.getFullYear()}-${z(x.getMonth()+1)}-${z(x.getDate())}`; };
  const t2={ id:"demo_f9", cid:"demo", name:"F-Jugend 9", icon:"F9", col:"#7c3aed", pub:true, pwd:"neun", cat:"F-Jugend", years:"" };
  d.teams=[...(d.teams||[]).filter(t=>t.id!=="demo_f9"), t2];
  const vorlage=(d.events||[]).filter(e=>e.cid==="demo"&&e.tid==="demo_f1")[0];
  const mk=(id,tid,titel,tage)=>({...vorlage, id, tid, cid:"demo", title:titel, type:"training", pt:"att",
    date:tag(tage), time:"17:30", endTime:"19:00", deadline:null, votes:{}, present:{},
    lineup:null, lineups:null, extraPolls:[], duties:[], sollPlayers:0 });
  d.events=[...(d.events||[]).filter(e=>e.cid!=="demo"),
    mk("ev_a1","demo_f1","Training EINS",2), mk("ev_a2","demo_f1","Spiel EINS",4),
    mk("ev_b1","demo_f9","Training NEUN",3), mk("ev_b2","demo_f9","Spiel NEUN",5)];
  localStorage.setItem("vereinsapp_v14", JSON.stringify(d));
  return true;
});
if(setup) ok("Ausgangslage: zwei Mannschaften mit je zwei Terminen");
else { fail("Testdaten nicht gesetzt"); process.exit(1); }

// ===== 5) Mit nur EINER Mannschaft keine Auswahl =====
await alsTrainer(["demo_f1"]);
let b=await body();
if(!/Alle Mannschaften/.test(b)) ok("Mit nur einer Mannschaft erscheint keine Auswahl – kein Ballast");
else fail("Auswahl bei nur einer Mannschaft: "+kurz(b));

// ===== 1) Mit zwei Mannschaften steht die Auswahl oben =====
await alsTrainer(["demo_f1","demo_f9"]);
b=await body();
if(/Alle Mannschaften/.test(b)&&/F-Jugend 9/.test(b)) ok("Mit zwei Mannschaften steht oben die Auswahl");
else fail("Keine Auswahl: "+kurz(b));
{ const oben=await page.evaluate(()=>{
    const a=[...document.querySelectorAll("button")].find(x=>/Alle Mannschaften/.test(x.innerText||""));
    // kleinster Kasten mit diesem Termin - nicht der aeussere Rahmen
    const e=[...document.querySelectorAll("div")].filter(d=>/Training EINS/.test(d.innerText||""))
      .sort((x,y)=>(x.innerText||"").length-(y.innerText||"").length)[0];
    if(!a||!e) return null;
    return a.getBoundingClientRect().top < e.getBoundingClientRect().top; });
  if(oben===true) ok("Und zwar über der Terminliste");
  else fail("Auswahl steht nicht oben: "+JSON.stringify(oben)); }
if(/Training EINS/.test(b)&&/Training NEUN/.test(b)) ok("Ohne Auswahl sind beide Mannschaften zu sehen");
else fail("Nicht beide Mannschaften sichtbar: "+kurz(b));

// ===== 2) Eine Mannschaft auswählen =====
if(await klick("F-Jugend 9")) ok("Die Mannschaft lässt sich antippen"); else fail("Kein Knopf für die Mannschaft");
await page.waitForTimeout(1300);
b=await body();
if(/Training NEUN/.test(b)&&!/Training EINS/.test(b)) ok("Danach stehen nur noch die Termine dieser Mannschaft da");
else fail("Filter greift nicht: "+kurz(b));

// ===== 4) Bleibt nach dem Neuladen =====
await page.reload({waitUntil:"networkidle"}); await page.waitForTimeout(2700); await dismiss();
b=await body();
if(/Training NEUN/.test(b)&&!/Training EINS/.test(b)) ok("Die Wahl bleibt nach dem Neuladen bestehen");
else fail("Wahl nach dem Neuladen weg: "+kurz(b));

// ===== 3) Zurück auf alle =====
if(await klick("Alle Mannschaften")) ok("„Alle Mannschaften“ ist anwählbar"); else fail("Kein Alle-Knopf");
await page.waitForTimeout(1300);
b=await body();
if(/Training EINS/.test(b)&&/Training NEUN/.test(b)) ok("Und zeigt wieder beide Mannschaften");
else fail("Alle-Ansicht unvollständig: "+kurz(b));

// ===== 6) Aufbau und Spickzettel sind raus =====
{ const ganz=await page.evaluate(()=>document.body.innerText);
  if(!/🏗 Aufbau/.test(ganz)&&!/Spickzettel/.test(ganz)) ok("Auf der Terminseite kein Aufbau und kein Spickzettel mehr");
  else fail("Entfernte Funktion noch da: "+kurz(ganz)); }
await klick("⋯ Mehr"); await page.waitForTimeout(700);
{ const ganz=await page.evaluate(()=>document.body.innerText);
  if(!/🏗 Aufbau/.test(ganz)&&!/Spickzettel/.test(ganz)) ok("Auch unter „mehr“ nicht");
  else fail("Noch im Menü: "+kurz(ganz)); }
await page.evaluate(()=>{ const x=[...document.querySelectorAll("button")].find(y=>/^(Ansehen|✅ Anwesenheit)$/.test((y.innerText||"").trim())); x&&x.click(); });
await page.waitForTimeout(1600);
await klick("👥 Orga"); await page.waitForTimeout(1000);
{ const ganz=await page.evaluate(()=>document.body.innerText);
  if(!/Das wird gebraucht|AUFBAU-VORSCHL/.test(ganz)) ok("Und im Termin unter Orga steht keine Aufbau-Liste mehr");
  else fail("Aufbau-Liste noch in der Orga: "+kurz(ganz)); }

if(errors.length){ console.log("JS-FEHLER:"); [...new Set(errors)].forEach(e=>console.log(" -",e.slice(0,150))); }
console.log(errors.length||fails.length?`ERGEBNIS: ${fails.length} Fehlschläge, ${errors.length} JS-Fehler`:"ERGEBNIS: ALLES OK");
await browser.close(); srv.close();
process.exit(errors.length||fails.length?1:0);
