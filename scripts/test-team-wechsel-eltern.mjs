// E2E-Test: Kind wechselt die Mannschaft – F2 und F3 sind getrennt.
// Gemeldet: „Die Spieler die in die f3 geschoben wurden, können noch die f2
// Termine sehen, bis sie sich einmal neu angemeldet haben." Grund: Die
// Mannschaft steckt in der ANMELDUNG auf dem Geraet, nicht im Profil.
// Gewuenscht: Wer auf der alten Mannschaft steht, aber nicht mehr dahin
// gehoert, wird abgemeldet und muss sich bei der neuen neu anmelden.
//   1. Vor dem Wechsel sehen die Eltern die Termine ihrer Mannschaft.
//   2. Nach dem Wechsel ist die Anmeldung beendet – Code-Abfrage der NEUEN.
//   3. Dabei steht da, warum: das Kind ist jetzt in der neuen Mannschaft.
//   4. Solange sie abgemeldet sind, sehen sie KEINE Termine mehr.
//   5. Mit dem Code der neuen Mannschaft geht es weiter – dann nur deren Termine.
//   6. Eine Zweitmannschaft (Aushilfe) wird NICHT angefasst.
//   7. Umbenannt UND gewechselt: der Hinweis nennt den neuen Namen.
// Aufruf: npm run build && node scripts/test-team-wechsel-eltern.mjs
import { chromium } from "playwright-core";
import http from "http"; import fs from "fs"; import path from "path";
const dist = path.resolve("dist");
const srv = http.createServer((req,res)=>{ let p=path.join(dist,req.url.split("?")[0]); if(!fs.existsSync(p)||fs.statSync(p).isDirectory()) p=path.join(dist,"index.html"); res.setHeader("content-type",{".html":"text/html",".js":"text/javascript",".css":"text/css"}[path.extname(p)]||"text/plain"); res.end(fs.readFileSync(p)); }).listen(4339);
// Chromium-Pfad nicht festnageln: der Container hat die Version schon
// zweimal gewechselt (1194 -> 1243, dazu anderer Unterordner) und dann
// scheitert JEDER Test am Start. Erster Treffer gewinnt.
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
const kurz=t=>String(t).slice(0,340).replace(/\n/g," | ");
const dismiss=async()=>{ for(let k=0;k<12;k++){ const done=await page.evaluate(()=>{
  const fx=[...document.querySelectorAll("div")].filter(d=>getComputedStyle(d).position==="fixed"&&d.querySelector("button")&&d.innerText.length>30);
  for(const f of fx){ const b=[...f.querySelectorAll("button")].find(x=>/geht|Los|Verstanden|Alles klar|Fertig|Jetzt nicht|Weiter →|Überspringen|Start/i.test(x.innerText)); if(b){ b.click(); return false; } }
  return true; }); await page.waitForTimeout(400); if(done) break; } };
const sitzung=()=>page.evaluate(()=>{ try{ return JSON.parse(sessionStorage.getItem("vereinsapp_v12_session")||"null"); }catch{ return null; } });

await page.addInitScript(()=>{
  if(!localStorage.getItem("vereinsapp_config")) localStorage.setItem("vereinsapp_config", JSON.stringify({url:"https://127.0.0.1:1/x", key:"test"}));
  if(localStorage.getItem("va_simple")===null)  localStorage.setItem("va_simple","1");
  if(localStorage.getItem("va_tsimple")===null) localStorage.setItem("va_tsimple","0");
});
await page.goto("http://127.0.0.1:4339/", { waitUntil:"networkidle" }); await page.waitForTimeout(2500);
await page.evaluate(()=>{ sessionStorage.setItem("vereinsapp_v12_session", JSON.stringify({role:"trainer",cid:"demo",tids:["demo_f1"],name:"Demo Trainer",id:"demo_tr1"})); });
await page.reload({waitUntil:"networkidle"}); await page.waitForTimeout(2600); await dismiss();
await page.evaluate(()=>{ const b=[...document.querySelectorAll("button")].find(x=>/Bin dabei/.test(x.innerText)); b&&b.click(); });
await page.waitForTimeout(1400);

// Zwei Mannschaften mit je eigenen Terminen. Ein Kind wechselt.
const setup = await page.evaluate(()=>{
  const d=JSON.parse(localStorage.getItem("vereinsapp_v14")||"null");
  const z=x=>String(x).padStart(2,"0");
  const tg=n=>{ const x=new Date(); x.setHours(12,0,0,0); x.setDate(x.getDate()+n);
    return `${x.getFullYear()}-${z(x.getMonth()+1)}-${z(x.getDate())}`; };
  const t2={ id:"demo_f9", cid:"demo", name:"F-Jugend 9", icon:"F9", col:"#7c3aed", pub:true, pwd:"neun", cat:"F-Jugend", years:"" };
  d.teams=[...(d.teams||[]).filter(t=>t.id!=="demo_f9"), t2];
  const kind=(d.playerProfiles||[]).filter(p=>p.mainTid==="demo_f1"&&!p.archived)[0];
  const vorlage=(d.events||[]).filter(e=>e.cid==="demo"&&e.tid==="demo_f1")[0];
  // Alte Termine der F1 und neue der F9 - klar unterscheidbare Titel
  const mk=(id,tid,titel,tage)=>({...vorlage, id, tid, title:titel, type:"training",
    date:tg(tage), time:"17:30", endTime:"19:00", deadline:null, votes:{}, present:{},
    lineup:null, lineups:null, extraPolls:[], duties:[] });
  d.events=[...(d.events||[]).filter(e=>e.cid!=="demo"),
    mk("ev_alt1","demo_f1","Training ALTE Mannschaft",3),
    mk("ev_alt2","demo_f1","Spiel ALTE Mannschaft",5),
    mk("ev_neu1","demo_f9","Training NEUE Mannschaft",4),
    mk("ev_neu2","demo_f9","Spiel NEUE Mannschaft",6)];
  localStorage.setItem("vereinsapp_v14", JSON.stringify(d));
  return { kind:kind.name, pid:kind.id };
});
if(setup) ok(`Ausgangslage: „${setup.kind}“ ist in der alten Mannschaft, beide Mannschaften haben Termine`);
else { fail("Testdaten nicht gesetzt"); process.exit(1); }

// Die Eltern melden sich an – Anmeldung trägt die ALTE Mannschaft
const alsEltern=async()=>{
  await page.evaluate(k=>{ sessionStorage.setItem("vereinsapp_v12_session",
    JSON.stringify({role:"user",cid:"demo",tid:"demo_f1",user:k,name:k})); }, setup.kind);
  await page.reload({waitUntil:"networkidle"}); await page.waitForTimeout(2800); await dismiss();
};
const wechsel=async(patch)=>{
  await page.evaluate(([pid,pa])=>{ const d=JSON.parse(localStorage.getItem("vereinsapp_v14")||"null");
    d.playerProfiles=(d.playerProfiles||[]).map(p=>p.id===pid?{...p, ...pa}:p);
    localStorage.setItem("vereinsapp_v14", JSON.stringify(d)); }, [setup.pid, patch]);
};
await alsEltern();
let b=await body();
if(/ALTE Mannschaft/.test(b)) ok("Vor dem Wechsel sehen die Eltern die Termine ihrer Mannschaft");
else fail("Keine Termine sichtbar: "+kurz(b));

// ===== Das Kind wechselt die Mannschaft =====
await wechsel({ mainTid:"demo_f9", optTids:[] });
await page.reload({waitUntil:"networkidle"}); await page.waitForTimeout(3000); await dismiss();

// ===== 2) Anmeldung beendet, Code der NEUEN Mannschaft =====
{ const s=await sitzung();
  if(!s) ok("Die alte Anmeldung ist beendet – das Gerät steht nicht mehr in der alten Mannschaft");
  else fail("Anmeldung besteht weiter: "+JSON.stringify(s)); }
b=await body();
if(/F-Jugend 9/.test(b)) ok("Es wird der Zugang der NEUEN Mannschaft abgefragt");
else fail("Nicht bei der neuen Mannschaft gelandet: "+kurz(b));

// ===== 3) Begründung steht dabei =====
if(/ist jetzt in der/.test(b)&&/alte Anmeldung beendet/.test(b)) ok("Und es steht dabei, warum: das Kind ist jetzt in der neuen Mannschaft");
else fail("Kein Hinweis zum Wechsel: "+kurz(b));
if(new RegExp(String(setup.kind).split(" ")[0]).test(b)) ok("Der Vorname des Kindes steht im Hinweis");
else fail("Kind nicht genannt: "+kurz(b));

// ===== 4) Abgemeldet heißt: keine Termine =====
if(!/ALTE Mannschaft/.test(b)&&!/NEUE Mannschaft/.test(b)) ok("Solange niemand angemeldet ist, sind keine Termine zu sehen");
else fail("Termine trotz Abmeldung sichtbar: "+kurz(b));

// ===== 5) Mit dem Code der neuen Mannschaft weiter =====
await page.evaluate(()=>{ const i=document.querySelector('input[type="password"],input[type="text"]'); if(i){ i.focus(); } });
await page.keyboard.type("neun"); await page.waitForTimeout(400);
await page.keyboard.press("Enter"); await page.waitForTimeout(2200); await dismiss();
b=await body();
if(new RegExp(String(setup.kind).split(" ")[0]).test(b)) ok("Der Code der neuen Mannschaft führt zur Kinder-Auswahl");
else fail("Code nicht angenommen: "+kurz(b));
// Anmeldung abschliessen (Einwilligungs-Dialog gehoert zu einem anderen Test)
await page.evaluate(k=>{ sessionStorage.setItem("vereinsapp_v12_session",
  JSON.stringify({role:"user",cid:"demo",tid:"demo_f9",user:k,name:k})); }, setup.kind);
await page.reload({waitUntil:"networkidle"}); await page.waitForTimeout(2900); await dismiss();
b=await body();
if(/NEUE Mannschaft/.test(b)&&!/ALTE Mannschaft/.test(b)) ok("Danach stehen nur die Termine der neuen Mannschaft da");
else fail("Falsche Termine nach dem Neu-Anmelden: "+kurz(b));
{ const s=await sitzung();
  if(s&&s.tid==="demo_f9") ok("Die Anmeldung gehört jetzt zur neuen Mannschaft");
  else fail("Anmeldung falsch: "+JSON.stringify(s&&s.tid)); }

// ===== 6) Zweitmannschaft wird nicht angefasst =====
// Kind hilft in der alten Mannschaft aus: dann darf die Anmeldung dort bleiben.
await wechsel({ mainTid:"demo_f9", optTids:["demo_f1"] });
await alsEltern();
{ const s=await sitzung();
  if(s&&s.tid==="demo_f1") ok("Als Aushilfe in der alten Mannschaft bleibt die Anmeldung dort – nichts wird überfahren");
  else fail("Aushilfe-Anmeldung wurde beendet: "+JSON.stringify(s)); }
b=await body();
if(/ALTE Mannschaft/.test(b)) ok("Und die Aushilfe sieht die Termine dieser Mannschaft weiter");
else fail("Aushilfe sieht keine Termine: "+kurz(b));

// ===== 7) Umbenannt UND gewechselt =====
await wechsel({ name:"Neuer Name T.", prevNames:[setup.kind], mainTid:"demo_f9", optTids:[] });
await alsEltern();
{ const s=await sitzung();
  if(!s) ok("Umbenannt und gewechselt: die Anmeldung endet ebenfalls");
  else fail("Anmeldung besteht weiter: "+JSON.stringify(s)); }
b=await body();
if(/Neuer/.test(b)&&/F-Jugend 9/.test(b)) ok("Der Hinweis nennt den neuen Namen und die neue Mannschaft");
else fail("Hinweis falsch: "+kurz(b));

if(errors.length){ console.log("JS-FEHLER:"); [...new Set(errors)].forEach(e=>console.log(" -",e.slice(0,150))); }
console.log(errors.length||fails.length?`ERGEBNIS: ${fails.length} Fehlschläge, ${errors.length} JS-Fehler`:"ERGEBNIS: ALLES OK");
await browser.close(); srv.close();
process.exit(errors.length||fails.length?1:0);
