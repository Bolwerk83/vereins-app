// E2E-Test: Skill-Aufgaben stehen nur dann in der Trainer-Todo-Liste, wenn
// Skills auch wirklich eingeschaltet sind.
// Aufruf: npm run build && node scripts/test-todo-skills.mjs
import { chromium } from "playwright-core";
import http from "http"; import fs from "fs"; import path from "path";
const dist = path.resolve("dist");
const srv = http.createServer((req,res)=>{ let p=path.join(dist,req.url.split("?")[0]); if(!fs.existsSync(p)||fs.statSync(p).isDirectory()) p=path.join(dist,"index.html"); res.setHeader("content-type",{".html":"text/html",".js":"text/javascript",".css":"text/css"}[path.extname(p)]||"text/plain"); res.end(fs.readFileSync(p)); }).listen(4253);
const exe=process.env.PLAYWRIGHT_CHROMIUM||"/opt/pw-browsers/chromium-1194/chrome-linux/chrome";
const browser = await chromium.launch({ executablePath:exe, args:["--no-sandbox"] });
const page = await browser.newPage({ viewport:{ width:390, height:900 } });
const errors=[]; const fails=[];
page.on("pageerror", e=>errors.push(e.message));
page.on("dialog", d=>d.accept());
const fail=m=>{ fails.push(m); console.log("FEHLGESCHLAGEN:", m); };
const ok=m=>console.log("OK:", m);
const body=()=>page.evaluate(()=>document.body.innerText);
const dismiss=async()=>{ for(let k=0;k<10;k++){ const done=await page.evaluate(()=>{
  const fx=[...document.querySelectorAll("div")].filter(d=>getComputedStyle(d).position==="fixed"&&d.querySelector("button")&&d.innerText.length>30);
  for(const f of fx){ const b=[...f.querySelectorAll("button")].find(x=>/geht|Los|Verstanden|Alles klar|Fertig|Jetzt nicht|Weiter →|Überspringen|Start/i.test(x.innerText)); if(b){ b.click(); return false; } }
  return true; }); await page.waitForTimeout(420); if(done) break; } };
await page.addInitScript(()=>{ localStorage.setItem("vereinsapp_config", JSON.stringify({url:"https://127.0.0.1:1/x", key:"test"})); });
await page.goto("http://127.0.0.1:4253/", { waitUntil:"networkidle" }); await page.waitForTimeout(2500);
await page.evaluate(()=>{ localStorage.setItem("va_simple","0"); localStorage.setItem("va_tsimple","1");
  sessionStorage.setItem("vereinsapp_v12_session", JSON.stringify({role:"trainer",cid:"demo",tids:["demo_f1"],name:"Demo Trainer",id:"demo_tr1"})); });
await page.reload({waitUntil:"networkidle"}); await page.waitForTimeout(2600); await dismiss();
await page.evaluate(()=>{ const b=[...document.querySelectorAll("button")].find(x=>/Bin dabei/.test(x.innerText)); b&&b.click(); });
await page.waitForTimeout(1200);

// Ausgangslage: alle Skill-Werte löschen und Modul-Wahl leeren
const setz = (fn) => page.evaluate(f=>{
  const d=JSON.parse(localStorage.getItem("vereinsapp_v14")||"null"); if(!d) return false;
  // eslint-disable-next-line no-new-func
  (new Function("d", f))(d);
  localStorage.setItem("vereinsapp_v14", JSON.stringify(d)); return true;
}, fn);
const neuLaden=async()=>{ await page.reload({waitUntil:"networkidle"}); await page.waitForTimeout(2600); await dismiss(); await page.waitForTimeout(600); };

// ===== 1) Nie eingeschaltet + keine Bewertungen -> keine Skill-Aufgaben =====
await setz(`(d.playerProfiles||[]).forEach(p=>{ p.skills={}; });
  (d.teams||[]).forEach(t=>{ delete t.moduleVotes; delete t.skillCheckBy; });`);
await neuLaden();
let b=await body();
if(!/Skill-Check fällig/.test(b)&&!/Ohne Skill-Profil/.test(b)) ok("Skills nie eingeschaltet: keine Skill-Aufgaben in der Liste");
else fail("Skill-Aufgaben trotz ausgeschalteter Skills: "+(b.match(/Skill[^\n]*/g)||[]).slice(0,2).join(" | "));

// ===== 2) Modul bewusst eingeschaltet -> Aufgaben erscheinen =====
await setz(`(d.teams||[]).forEach(t=>{ if(t.id==="demo_f1") t.moduleVotes={demo_tr1:{skills:true}}; });`);
await neuLaden();
b=await body();
if(/Skill-Check fällig|Ohne Skill-Profil/.test(b)) ok("Skills eingeschaltet: die Aufgaben stehen wieder da");
else fail("Aufgaben fehlen trotz eingeschalteter Skills");

// ===== 3) Modul ausgeschaltet -> wieder weg =====
await setz(`(d.teams||[]).forEach(t=>{ if(t.id==="demo_f1") t.moduleVotes={demo_tr1:{skills:false}}; });`);
await neuLaden();
b=await body();
if(!/Skill-Check fällig/.test(b)&&!/Ohne Skill-Profil/.test(b)) ok("Modul ausgeschaltet: keine Skill-Aufgaben");
else fail("Aufgaben trotz ausgeschaltetem Modul da");

// ===== 4) Bewertung je Mannschaft aus (Vereinsansicht) -> auch weg =====
await setz(`(d.teams||[]).forEach(t=>{ if(t.id==="demo_f1"){ t.moduleVotes={demo_tr1:{skills:true}}; t.skillCheckEnabled=false; } });`);
await neuLaden();
b=await body();
if(!/Skill-Check fällig/.test(b)) ok("„Bewertung: Aus“ im Verein schaltet die Aufgaben ebenfalls ab");
else fail("Aufgaben trotz Bewertung=Aus");

// ===== 5) Schon bewertet, aber nie abgestimmt -> Erinnerung bleibt =====
await setz(`(d.teams||[]).forEach(t=>{ if(t.id==="demo_f1"){ delete t.moduleVotes; delete t.skillCheckEnabled; delete t.skillCheckBy; } });
  const p=(d.playerProfiles||[]).find(x=>x.mainTid==="demo_f1"); if(p) p.skills={technik:3};`);
await neuLaden();
b=await body();
if(/Skill-Check fällig/.test(b)) ok("Wer Skills schon nutzt, verliert die Erinnerung nicht");
else fail("Erinnerung fehlt, obwohl Bewertungen vorhanden sind");

// ===== 6) Auch im Kader verschwinden die Skill-Sachen =====
const kaderAuf=async()=>{
  await page.evaluate(()=>{ const b=[...document.querySelectorAll("button")].find(x=>(x.innerText||"").trim()==="Team"); b&&b.click(); });
  await page.waitForTimeout(1300);
  await page.evaluate(()=>{ const b=[...document.querySelectorAll("button")].find(x=>/👥 Kader|^Spieler$/.test((x.innerText||"").trim())); b&&b.click(); });
  await page.waitForTimeout(900);
  await page.evaluate(()=>{ const b=[...document.querySelectorAll("button")].find(x=>(x.innerText||"").trim()==="Spieler"); b&&b.click(); });
  await page.waitForTimeout(1100);
  return body();
};
await setz(`(d.teams||[]).forEach(t=>{ if(t.id==="demo_f1") t.moduleVotes={demo_tr1:{skills:false}}; });
  (d.playerProfiles||[]).forEach(p=>{ if(p.mainTid==="demo_f1") p.skills={}; });`);
await neuLaden();
{ const b6=await kaderAuf();
  if(!/🎯 Skills/.test(b6)) ok("Kader: kein Skills-Knopf, wenn Skills aus sind");
  else fail("Skills-Knopf trotz ausgeschalteter Skills im Kader");
  if(!/Skill-Check/.test(b6)) ok("Auch der Monats-Check bleibt weg"); else fail("Monats-Check trotzdem da"); }
await setz(`(d.teams||[]).forEach(t=>{ if(t.id==="demo_f1") t.moduleVotes={demo_tr1:{skills:true}}; });`);
await neuLaden();
{ const b7=await kaderAuf();
  if(/🎯 Skills|Skill-Check/.test(b7)) ok("Mit eingeschalteten Skills ist beides wieder da");
  else fail("Skills-Bereiche fehlen trotz eingeschalteter Skills"); }

if(errors.length){ console.log("JS-FEHLER:"); [...new Set(errors)].forEach(e=>console.log(" -",e.slice(0,150))); }
console.log(errors.length||fails.length?`ERGEBNIS: ${fails.length} Fehlschläge, ${errors.length} JS-Fehler`:"ERGEBNIS: ALLES OK");
await browser.close(); srv.close();
process.exit(errors.length||fails.length?1:0);
