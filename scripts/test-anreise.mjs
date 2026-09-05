// E2E-Test: In der Abhak-Liste des Trainers steht bei jedem Kind, wie es
// zum Termin kommt – wer selbst fährt, wer mitfährt, wer noch eine
// Mitfahrgelegenheit braucht – jeweils mit dem Tag, an dem es eingetragen
// wurde. Oben zusätzlich der Stand in Zahlen.
// Aufruf: npm run build && node scripts/test-anreise.mjs
import { chromium } from "playwright-core";
import http from "http"; import fs from "fs"; import path from "path";
const dist = path.resolve("dist");
const srv = http.createServer((req,res)=>{ let p=path.join(dist,req.url.split("?")[0]); if(!fs.existsSync(p)||fs.statSync(p).isDirectory()) p=path.join(dist,"index.html"); res.setHeader("content-type",{".html":"text/html",".js":"text/javascript",".css":"text/css"}[path.extname(p)]||"text/plain"); res.end(fs.readFileSync(p)); }).listen(4293);
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
// Die Abhak-Liste als Text
const liste = () => page.evaluate(()=>{
  const t=document.body.innerText; const i=t.indexOf("Anwesenheit abhaken");
  return i<0?null:t.slice(i,i+1200); });

await page.addInitScript(()=>{ if(!localStorage.getItem("vereinsapp_config")) localStorage.setItem("vereinsapp_config", JSON.stringify({url:"https://127.0.0.1:1/x", key:"test"})); });
await page.goto("http://127.0.0.1:4293/", { waitUntil:"networkidle" }); await page.waitForTimeout(2500);
await page.evaluate(()=>{ localStorage.setItem("va_simple","0"); localStorage.setItem("va_tsimple","0");
  sessionStorage.setItem("vereinsapp_v12_session", JSON.stringify({role:"trainer",cid:"demo",tids:["demo_f1"],name:"Demo Trainer",id:"demo_tr1"})); });
await page.reload({waitUntil:"networkidle"}); await page.waitForTimeout(2600); await dismiss();
await page.evaluate(()=>{ const b=[...document.querySelectorAll("button")].find(x=>/Bin dabei/.test(x.innerText)); b&&b.click(); });
await page.waitForTimeout(1500);

// Auswärtsspiel: vier Zusagen mit vier verschiedenen Anreisen
const k = await page.evaluate(()=>{
  const d=JSON.parse(localStorage.getItem("vereinsapp_v14")||"null"); if(!d) return null;
  const p=v=>String(v).padStart(2,"0"); const tg=n=>{const x=new Date(Date.now()+n*86400000);return `${x.getFullYear()}-${p(x.getMonth()+1)}-${p(x.getDate())}`;};
  const evs=(d.events||[]).filter(e=>e.cid==="demo"&&e.tid==="demo_f1"&&(e.pt==="att"||!e.pt)).sort((a,b)=>String(a.date).localeCompare(String(b.date)));
  if(!evs.length) return null;
  const kader=[...new Set([...((d.players||{})["demo_f1"]||[]),
    ...((d.playerProfiles||[]).filter(pp=>pp.mainTid==="demo_f1"&&!pp.archived).map(pp=>pp.name))])];
  if(kader.length<4) return null;
  const [fahrer,mit,sucht,selbst]=kader;
  const ts=new Date().toISOString();
  const alt=new Date(Date.now()-2*86400000).toISOString();
  Object.assign(evs[0],{ type:"auswarts", date:tg(3), time:"10:30", endTime:"12:00", title:"SV Adler",
    loc:"Adler-Arena", note:"", deadline:null, carpoolExtra:true,
    votes:Object.fromEntries([fahrer,mit,sucht,selbst].map(n=>[n,{val:"yes",ts,role:"player"}])),
    carpool:{ [fahrer]:{mode:"drive",seats:3,ts:alt},
              [mit]:{mode:"need",car:fahrer,ts:alt},
              [sucht]:{mode:"need",car:null,ts:alt},
              [selbst]:{mode:"self",ts:alt} } });
  evs.slice(1).forEach(e=>{ e.date=tg(12); });
  localStorage.setItem("vereinsapp_v14", JSON.stringify(d));
  return {fahrer,mit,sucht,selbst};
});
if(k) ok(`Termin angelegt: ${k.fahrer} fährt, ${k.mit} fährt mit, ${k.sucht} sucht, ${k.selbst} kommt selbst`);
else fail("Konnte den Termin nicht anlegen");
await page.reload({waitUntil:"networkidle"}); await page.waitForTimeout(2800); await dismiss();
await page.evaluate(()=>{ const b=[...document.querySelectorAll("button")].find(x=>/^(Ansehen|✅ Anwesenheit)$/.test((x.innerText||"").trim())); b&&b.click(); });
await page.waitForTimeout(1500);
await page.evaluate(()=>{ const x=[...document.querySelectorAll("button")].find(y=>/^(📊 Rückmeldungen|Rückmeldungen)$/.test((y.innerText||"").trim())); x&&x.click(); });
await page.waitForTimeout(1000);

const L=await liste();
if(L) ok("Die Abhak-Liste ist offen"); else fail("Keine Abhak-Liste: "+(await body()).slice(0,240).replace(/\n/g," | "));

// 1) Zusammenfassung oben
if(/🚗 \d+ versorgt/.test(L)) ok("Oben steht der Anreise-Stand: "+(L.match(/🚗 \d+ versorgt/)||[""])[0]);
else fail("Keine Anreise-Zusammenfassung: "+String(L).slice(0,200).replace(/\n/g," | "));
if(/🙋 1 braucht Mitfahrt/.test(L)) ok("Und wie viele noch eine Mitfahrt brauchen");
else fail("Kein Hinweis auf fehlende Mitfahrten: "+String(L).slice(0,240).replace(/\n/g," | "));

// 2) Je Kind die Anreise
const zeile=(name)=>{ const i=L.indexOf(name); return i<0?"":L.slice(i,i+140).replace(/\n/g," · "); };
if(/fährt selbst/.test(zeile(k.fahrer))&&/Plätze frei|Platz frei/.test(zeile(k.fahrer)))
  ok(`Fahrer: „${(zeile(k.fahrer).match(/fährt selbst[^·]*/)||[""])[0].trim()}“`);
else fail("Fahrer-Anreise fehlt: "+zeile(k.fahrer));
if(new RegExp("fährt mit "+k.fahrer.split(" ")[0]).test(zeile(k.mit)))
  ok(`Mitfahrer: „fährt mit ${k.fahrer.split(" ")[0]}“`);
else fail("Mitfahrer-Anreise fehlt: "+zeile(k.mit));
if(/braucht Mitfahrt/.test(zeile(k.sucht))) ok("Wer noch eine Mitfahrt braucht, ist markiert");
else fail("Suchender nicht markiert: "+zeile(k.sucht));
if(/kommt selbst/.test(zeile(k.selbst))) ok("Und wer selbst kommt, steht auch da");
else fail("„Kommt selbst“ fehlt: "+zeile(k.selbst));

// 3) Datum dabei
{ const tage=(L.match(/[A-Z][a-z], \d\d\.\d\d\./g)||[]);
  if(tage.length>=4) ok("Bei jeder Anreise steht der Tag dabei ("+tage.slice(0,2).join(" / ")+" …)");
  else fail("Kein Datum an der Anreise: "+JSON.stringify(tage)); }

// 4) Ohne Fahrgemeinschaft keine Anreise-Zeile
await page.evaluate(()=>{ const b=[...document.querySelectorAll("button")].find(x=>(x.getAttribute("aria-label")||"")==="Schließen"||(x.innerText||"").trim()==="✕"); b&&b.click(); });
await page.waitForTimeout(700);
await page.evaluate(()=>{
  const d=JSON.parse(localStorage.getItem("vereinsapp_v14"));
  const ev=(d.events||[]).filter(e=>e.cid==="demo"&&e.tid==="demo_f1").sort((a,b)=>String(a.date).localeCompare(String(b.date)))[0];
  ev.type="training"; ev.carpoolExtra=false; ev.carpoolEnabled=false;
  localStorage.setItem("vereinsapp_v14", JSON.stringify(d));
});
await page.reload({waitUntil:"networkidle"}); await page.waitForTimeout(2800); await dismiss();
await page.evaluate(()=>{ const b=[...document.querySelectorAll("button")].find(x=>/^(Ansehen|✅ Anwesenheit)$/.test((x.innerText||"").trim())); b&&b.click(); });
await page.waitForTimeout(1500);
{ const L2=await liste();
  if(L2&&!/versorgt|braucht Mitfahrt|fährt selbst/.test(L2)) ok("Ohne Fahrgemeinschaft bleibt die Liste schlank – keine Anreise-Zeilen");
  else fail("Anreise-Zeilen auch ohne Fahrgemeinschaft: "+String(L2).slice(0,240).replace(/\n/g," | ")); }

if(errors.length){ console.log("JS-FEHLER:"); [...new Set(errors)].forEach(e=>console.log(" -",e.slice(0,150))); }
console.log(errors.length||fails.length?`ERGEBNIS: ${fails.length} Fehlschläge, ${errors.length} JS-Fehler`:"ERGEBNIS: ALLES OK");
await browser.close(); srv.close();
process.exit(errors.length||fails.length?1:0);
