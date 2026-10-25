// E2E-Test: Module je Mannschaft einstellen.
// Aus dem Verein: die F2 macht monatliche Skills, die F3 ausdrücklich nicht.
// Bisher schrieb die Modul-Wahl dieselbe Auswahl in ALLE Mannschaften des
// Trainers – eine Mannschaft einzeln abzuschalten war nicht möglich.
//   1. Die Modul-Einstellung lässt sich je Mannschaft wählen.
//   2. Abschalten wirkt nur auf die gewählte Mannschaft.
//   3. Gespeichert wird getrennt – die andere behält ihre Einstellung.
//   4. Folge im Alltag: Die Skill-Aufgabe erscheint nur für die Mannschaft,
//      die das Modul anhat.
// Aufruf: npm run build && node scripts/test-module-pro-team.mjs
import { chromium } from "playwright-core";
import http from "http"; import fs from "fs"; import path from "path";
const dist = path.resolve("dist");
const srv = http.createServer((req,res)=>{ let p=path.join(dist,req.url.split("?")[0]); if(!fs.existsSync(p)||fs.statSync(p).isDirectory()) p=path.join(dist,"index.html"); res.setHeader("content-type",{".html":"text/html",".js":"text/javascript",".css":"text/css"}[path.extname(p)]||"text/plain"); res.end(fs.readFileSync(p)); }).listen(4337);
const exe=process.env.PLAYWRIGHT_CHROMIUM||"/opt/pw-browsers/chromium-1194/chrome-linux/chrome";
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
const klick=(re)=>page.evaluate(r=>{
  const b=[...document.querySelectorAll("button")].find(x=>new RegExp(r).test((x.innerText||"").replace(/\s+/g," ").trim()));
  if(!b||b.disabled) return false; b.click(); return true; }, re instanceof RegExp?re.source:re);
const dismiss=async()=>{ for(let k=0;k<12;k++){ const done=await page.evaluate(()=>{
  const fx=[...document.querySelectorAll("div")].filter(d=>getComputedStyle(d).position==="fixed"&&d.querySelector("button")&&d.innerText.length>30&&!/Was möchtet ihr nutzen/.test(d.innerText||""));
  for(const f of fx){ const b=[...f.querySelectorAll("button")].find(x=>/geht|Los|Verstanden|Alles klar|Fertig|Jetzt nicht|Weiter →|Überspringen|Start/i.test(x.innerText)); if(b){ b.click(); return false; } }
  return true; }); await page.waitForTimeout(400); if(done) break; } };

await page.addInitScript(()=>{
  if(!localStorage.getItem("vereinsapp_config")) localStorage.setItem("vereinsapp_config", JSON.stringify({url:"https://127.0.0.1:1/x", key:"test"}));
  if(localStorage.getItem("va_simple")===null)  localStorage.setItem("va_simple","0");
  if(localStorage.getItem("va_tsimple")===null) localStorage.setItem("va_tsimple","0");
});
await page.goto("http://127.0.0.1:4337/", { waitUntil:"networkidle" }); await page.waitForTimeout(2500);
await page.evaluate(()=>{ sessionStorage.setItem("vereinsapp_v12_session", JSON.stringify({role:"trainer",cid:"demo",tids:["demo_f1","demo_f9"],name:"Demo Trainer",id:"dt1"})); });
await page.reload({waitUntil:"networkidle"}); await page.waitForTimeout(2600); await dismiss();
await page.evaluate(()=>{ const b=[...document.querySelectorAll("button")].find(x=>/Bin dabei/.test(x.innerText)); b&&b.click(); });
await page.waitForTimeout(1400);

// Zwei Mannschaften, beide mit Skills AN, beide mit einem Kind mit Bewertung
const setup = await page.evaluate(()=>{
  const d=JSON.parse(localStorage.getItem("vereinsapp_v14")||"null");
  const t2={ id:"demo_f9", cid:"demo", name:"F-Jugend 9", icon:"F9", col:"#7c3aed", pub:true, pwd:"x", cat:"F-Jugend", years:"" };
  d.teams=[...(d.teams||[]).filter(t=>t.id!=="demo_f9"), t2];
  // Der Trainer gehoert zu beiden Mannschaften
  d.trainers=(d.trainers||[]).map(x=>x.id==="dt1"?{...x, tids:["demo_f1","demo_f9"]}:x);
  // Beide Mannschaften: Skills eingeschaltet (Stimme des Trainers)
  d.teams=d.teams.map(tm=>["demo_f1","demo_f9"].includes(tm.id)
    ? {...tm, moduleVotes:{ dt1:{skills:true,training:true,taktik:true,helfer:true,kasse:true,saison:true} },
       skillCheckBy:{}, skillCheckSkip:{}, skillCheckPauseUntil:null}
    : tm);
  // Ein Kind in die zweite Mannschaft, mit Bewertung - damit beide Mannschaften
  // Skill-Aufgaben erzeugen koennten
  const f1=(d.playerProfiles||[]).filter(p=>p.mainTid==="demo_f1"&&!p.archived);
  const um=f1[0];
  d.playerProfiles=(d.playerProfiles||[]).map(p=>p.id===um.id
    ? {...p, mainTid:"demo_f9", skills:{Technik:3,Zweikampf:3}} : p);
  localStorage.setItem("vereinsapp_v14", JSON.stringify(d));
  return { umgezogen:um.name };
});
if(setup) ok(`Zwei Mannschaften mit Skills an („${setup.umgezogen}“ ist in der F-Jugend 9)`);
else { fail("Testdaten nicht gesetzt"); process.exit(1); }
await page.reload({waitUntil:"networkidle"}); await page.waitForTimeout(2800); await dismiss();

const votes=()=>page.evaluate(()=>{ const d=JSON.parse(localStorage.getItem("vereinsapp_v14")||"null");
  const g=tid=>{ const tm=(d.teams||[]).find(x=>x.id===tid); return ((tm&&tm.moduleVotes)||{}).dt1||null; };
  return { f1:g("demo_f1"), f9:g("demo_f9") }; });

// ===== Vorher: beide an, Skill-Aufgabe für beide =====
let b=await body();
{ const n=(b.match(/Skill-Check fällig/g)||[]).length;
  if(n>=2) ok("Vorher steht die Skill-Aufgabe für beide Mannschaften da ("+n+")");
  else fail("Nicht für beide Mannschaften fällig: "+n); }

// ===== Modul-Einstellung öffnen =====
await page.evaluate(()=>{ const b2=[...document.querySelectorAll("button")].find(x=>/^(Mehr|≡|=)$/.test((x.innerText||"").trim())); b2&&b2.click(); });
await page.waitForTimeout(900);
{ const auf=await page.evaluate(()=>{ const b2=[...document.querySelectorAll("button,a,div[role=button]")]
    .find(x=>/Module|nutzen/i.test((x.innerText||"").replace(/\s+/g," ").trim())&&(x.innerText||"").length<40);
    if(!b2) return false; b2.click(); return true; });
  await page.waitForTimeout(1200);
  if(auf&&/Was möchtet ihr nutzen|Eure Auswahl/.test(await body())) ok("Die Modul-Einstellung ist erreichbar");
  else { const m=await page.evaluate(()=>[...document.querySelectorAll("button,a")].map(x=>(x.innerText||"").replace(/\s+/g," ").trim()).filter(t=>t&&t.length<30));
    fail("Modul-Einstellung nicht gefunden – sichtbar: "+JSON.stringify(m.slice(-18))); } }

// Zur Zusammenfassung durchklicken
for(let i=0;i<9;i++){ if(/Eure Auswahl/.test(await body())) break;
  if(!(await klick("Weiter →"))&&!(await klick("Los geht"))) break; await page.waitForTimeout(350); }
b=await body();
if(/Eure Auswahl/.test(b)) ok("Die Zusammenfassung ist offen"); else fail("Zusammenfassung nicht erreicht: "+kurz(b));

// ===== 1) Mannschaftswahl =====
if(/Jede Mannschaft lässt sich einzeln einstellen/.test(b)) ok("Sie sagt, dass jede Mannschaft einzeln einstellbar ist");
else fail("Kein Hinweis auf die Mannschaftswahl: "+kurz(b));
{ const chips=await page.evaluate(()=>[...document.querySelectorAll("button")].map(x=>(x.innerText||"").trim())
    .filter(t=>/^F-Jugend (1|9)$/.test(t)));
  if(chips.length>=2) ok("Beide Mannschaften stehen zur Wahl: "+chips.join(", "));
  else fail("Keine Mannschaftswahl: "+JSON.stringify(chips)); }

// ===== 2) Skills nur für die F-Jugend 9 abschalten =====
if(await klick("^F-Jugend 9$")) ok("Die F-Jugend 9 lässt sich wählen"); else fail("F-Jugend 9 nicht wählbar");
await page.waitForTimeout(500);
b=await body();
if(/Gilt nur für/.test(b)) ok("Es steht dabei, für welche Mannschaft die Einstellung gilt");
else fail("Kein Hinweis auf die Geltung: "+kurz(b));
if(await klick("Skills & Entwicklung")) ok("Das Skills-Modul ist antippbar"); else fail("Skills nicht antippbar");
await page.waitForTimeout(500);
b=await body();
{ const i=b.indexOf("Skills & Entwicklung");
  const block=b.slice(i,i+120).replace(/\n/g," | ");
  if(/ausblenden/.test(block)) ok("Für die F-Jugend 9 steht es jetzt auf „ausblenden“: "+block.slice(0,70));
  else fail("Umschalten wirkt nicht: "+block); }
if(await klick("Speichern & loslegen")) ok("Gespeichert"); else fail("Kein Speichern-Knopf");
await page.waitForTimeout(1600);

// ===== 3) Getrennt gespeichert =====
{ const v=await votes();
  if(v.f1&&v.f1.skills===true) ok("Die F-Jugend 1 behält Skills an");
  else fail("F-Jugend 1 verändert: "+JSON.stringify(v.f1));
  if(v.f9&&v.f9.skills===false) ok("Die F-Jugend 9 steht auf aus – getrennt gespeichert");
  else fail("F-Jugend 9 nicht abgeschaltet: "+JSON.stringify(v.f9)); }

// ===== 4) Folge im Alltag =====
await page.reload({waitUntil:"networkidle"}); await page.waitForTimeout(2800); await dismiss();
b=await body();
{ const n=(b.match(/Skill-Check fällig/g)||[]).length;
  if(n===1) ok("Die Skill-Aufgabe erscheint nur noch für die Mannschaft, die das Modul anhat");
  else fail("Falsche Zahl an Skill-Aufgaben: "+n); }
{ const i=b.indexOf("Skill-Check fällig");
  const block=i<0?"":b.slice(i,i+90).replace(/\n/g," | ");
  if(/F-Jugend 1/.test(block)&&!/F-Jugend 9/.test(block)) ok("Und zwar für die richtige: "+block.slice(0,60));
  else fail("Falsche Mannschaft: "+block); }

if(errors.length){ console.log("JS-FEHLER:"); [...new Set(errors)].forEach(e=>console.log(" -",e.slice(0,150))); }
console.log(errors.length||fails.length?`ERGEBNIS: ${fails.length} Fehlschläge, ${errors.length} JS-Fehler`:"ERGEBNIS: ALLES OK");
await browser.close(); srv.close();
process.exit(errors.length||fails.length?1:0);
