// E2E-Test: Die Aufgabenliste ("Zu erledigen") des Trainers
//   1. zeigt nur, was in den nächsten 7 Tagen ansteht,
//   2. erinnert nicht mehr an fehlende Trainingspläne (die sind freiwillig).
// Aufruf: npm run build && node scripts/test-todo-fenster.mjs
import { chromium } from "playwright-core";
import http from "http"; import fs from "fs"; import path from "path";
const dist = path.resolve("dist");
const srv = http.createServer((req,res)=>{ let p=path.join(dist,req.url.split("?")[0]); if(!fs.existsSync(p)||fs.statSync(p).isDirectory()) p=path.join(dist,"index.html"); res.setHeader("content-type",{".html":"text/html",".js":"text/javascript",".css":"text/css"}[path.extname(p)]||"text/plain"); res.end(fs.readFileSync(p)); }).listen(4281);
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
  const fx=[...document.querySelectorAll("div")].filter(d=>getComputedStyle(d).position==="fixed"&&d.querySelector("button")&&d.innerText.length>30);
  for(const f of fx){ const b=[...f.querySelectorAll("button")].find(x=>/geht|Los|Verstanden|Alles klar|Fertig|Jetzt nicht|Weiter →|Überspringen|Start/i.test(x.innerText)); if(b){ b.click(); return false; } }
  return true; }); await page.waitForTimeout(400); if(done) break; } };
// Inhalt der Aufgabenliste als einzelne Zeilen
const todoListe = () => page.evaluate(()=>{
  const alle=[...document.querySelectorAll("div")].filter(d=>/^✅ Zu erledigen/.test((d.innerText||"").trim()));
  const kopf=alle[alle.length-1]; if(!kopf) return null;
  return [...kopf.parentElement.children].slice(1).map(r=>(r.innerText||"").replace(/\n/g," · ").trim());
});
const setzen = (fn) => page.evaluate(f=>{
  const d=JSON.parse(localStorage.getItem("vereinsapp_v14")||"null"); if(!d) return null;
  const r=new Function("d","tage","return ("+f+")(d,tage)")(d,(n)=>{ const x=new Date(Date.now()+n*86400000); const p=v=>String(v).padStart(2,"0"); return `${x.getFullYear()}-${p(x.getMonth()+1)}-${p(x.getDate())}`; });
  localStorage.setItem("vereinsapp_v14", JSON.stringify(d));
  return r;
}, fn.toString());

await page.addInitScript(()=>{
  if(!localStorage.getItem("vereinsapp_config")) localStorage.setItem("vereinsapp_config", JSON.stringify({url:"https://127.0.0.1:1/x", key:"test"}));
  if(localStorage.getItem("va_simple")===null)  localStorage.setItem("va_simple","0");
  if(localStorage.getItem("va_tsimple")===null) localStorage.setItem("va_tsimple","0");
});
await page.goto("http://127.0.0.1:4281/", { waitUntil:"networkidle" }); await page.waitForTimeout(2500);
await page.evaluate(()=>{ sessionStorage.setItem("vereinsapp_v12_session", JSON.stringify({role:"trainer",cid:"demo",tids:["demo_f1"],name:"Demo Trainer",id:"demo_tr1"})); });
await page.reload({waitUntil:"networkidle"}); await page.waitForTimeout(2600); await dismiss();
await page.evaluate(()=>{ const b=[...document.querySelectorAll("button")].find(x=>/Bin dabei/.test(x.innerText)); b&&b.click(); });
await page.waitForTimeout(1500);

// Zwei Trainings ohne Plan: eines in 3 Tagen, eines in 14 Tagen.
// Beide bekommen eine abgelaufene Frist, damit sie überhaupt eine Aufgabe
// erzeugen würden ("Frist abgelaufen – erinnern").
const info = await setzen((d,tage)=>{
  const evs=(d.events||[]).filter(e=>e.cid==="demo"&&e.tid==="demo_f1"&&(e.pt==="att"||!e.pt))
    .sort((a,b)=>String(a.date||"").localeCompare(String(b.date||"")));
  const nah=evs[0], fern=evs[1];
  if(!nah||!fern) return null;
  const g=tage(-1);
  [[nah,3],[fern,14]].forEach(([ev,n])=>{
    ev.date=tage(n); ev.type="training"; ev.pt="att"; ev.sollPlayers=8;
    ev.deadline={date:g,time:"18:00"};
    delete ev.trainingId; delete ev.trainingPlan;
  });
  nah.title="Training NAH"; fern.title="Training FERN";
  return {nah:nah.title,fern:fern.title,nahDatum:nah.date,fernDatum:fern.date};
});
if(info) ok("Testdaten: „"+info.nah+"“ in 3 Tagen ("+info.nahDatum+"), „"+info.fern+"“ in 14 Tagen ("+info.fernDatum+")");
else fail("Konnte keine Testdaten setzen");
await page.reload({waitUntil:"networkidle"}); await page.waitForTimeout(2800); await dismiss();

const liste = await todoListe();
if(liste) ok("Aufgabenliste gefunden ("+liste.length+" Einträge)");
else fail("Keine Aufgabenliste: "+(await body()).slice(0,240).replace(/\n/g," | "));
const alles=(liste||[]).join(" || ");

// 1) Nur die nächsten 7 Tage
if(/Training NAH/.test(alles)) ok("Der Termin in 3 Tagen steht drin");
else fail("Der nahe Termin fehlt: "+alles.slice(0,300));
if(!/Training FERN/.test(alles)) ok("Der Termin in 14 Tagen steht NICHT drin");
else fail("Termin außerhalb der 7 Tage steht in der Liste: "+alles.slice(0,300));

// 2) Kein Trainingsplan-Hinweis mehr
if(!/Trainingsplan fehlt/.test(alles)) ok("Kein Hinweis „Trainingsplan fehlt“ mehr – Training ist freiwillig");
else fail("„Trainingsplan fehlt“ steht immer noch in der Liste: "+alles.slice(0,300));
// Gegenprobe: planen geht weiter über den Termin selbst
{ const b=await body();
  if(/Training planen/.test(b)) ok("Planen geht weiter über den Knopf am Termin");
  else fail("Kein „Training planen“-Knopf mehr am Termin"); }

// 3) Grenze sauber: derselbe Termin auf Tag 7 bzw. Tag 8
const grenze = async (n) => {
  await setzen(new Function("d","tage",`
    const evs=(d.events||[]).filter(e=>e.cid==="demo"&&e.tid==="demo_f1"&&(e.pt==="att"||!e.pt));
    const ev=evs.find(e=>e.title==="Training NAH"); if(!ev) return null;
    ev.date=tage(${n}); return ev.date;`));
  await page.reload({waitUntil:"networkidle"}); await page.waitForTimeout(2600); await dismiss();
  return ((await todoListe())||[]).join(" || ");
};
const amTag7=await grenze(7);
if(/Training NAH/.test(amTag7)) ok("Am 7. Tag ist der Termin noch dabei");
else fail("Termin am 7. Tag fehlt: "+amTag7.slice(0,240));
const amTag8=await grenze(8);
if(!/Training NAH/.test(amTag8)) ok("Am 8. Tag ist er raus");
else fail("Termin am 8. Tag steht noch drin: "+amTag8.slice(0,240));

// 4) Ein Löschantrag darf nie verschwinden - auch nicht, wenn sonst nichts
//    zu tun ist (er hängt an einer 2-Tage-Frist).
const zaehler=async()=>{ const b=await body(); const m=b.match(/Zu erledigen \((\d+)\)/); return m?Number(m[1]):0; };
// Alle Termine weit nach hinten schieben: keine termin-bezogenen Aufgaben mehr
await setzen(new Function("d","tage",`
  (d.events||[]).filter(e=>e.cid==="demo"&&e.tid==="demo_f1").forEach(e=>{ e.date=tage(30); delete e.deadline; });
  d.deletionRequests=[];
  return true;`));
await page.reload({waitUntil:"networkidle"}); await page.waitForTimeout(2800); await dismiss();
const vorher=await zaehler();
{ const b=await body();
  if(!/Training NAH|Training FERN/.test((await todoListe()||[]).join(" || ")))
    ok("Ohne Termine in den nächsten 7 Tagen steht kein Termin mehr in der Liste ("+vorher+" andere Aufgaben)");
  else fail("Weit entfernte Termine stehen noch in der Liste"); }
// Jetzt einen Löschantrag dazu
await setzen(new Function("d","tage",`
  d.deletionRequests=[{id:"dr_test",cid:"demo",name:"Ben Fischer",status:"pending",ts:new Date().toISOString()}];
  return true;`));
await page.reload({waitUntil:"networkidle"}); await page.waitForTimeout(2800); await dismiss();
{ const b=await body(); const jetzt=await zaehler();
  if(/🗑 Löschantrag: Ben Fischer/.test(b)) ok("Der Löschantrag steht auch bei sonst leerer Terminliste da");
  else fail("Löschantrag fehlt: "+b.slice(0,260).replace(/\n/g," | "));
  if(jetzt===vorher+1) ok("Und wird mitgezählt ("+vorher+" → "+jetzt+")");
  else fail("Zähler stimmt nicht: vorher "+vorher+", jetzt "+jetzt); }

if(errors.length){ console.log("JS-FEHLER:"); [...new Set(errors)].forEach(e=>console.log(" -",e.slice(0,150))); }
console.log(errors.length||fails.length?`ERGEBNIS: ${fails.length} Fehlschläge, ${errors.length} JS-Fehler`:"ERGEBNIS: ALLES OK");
await browser.close(); srv.close();
process.exit(errors.length||fails.length?1:0);
