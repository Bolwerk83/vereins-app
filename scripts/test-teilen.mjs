// E2E-Test: Was der Trainer teilt.
//   1. Jeder geteilte Link geht über die Mannschaft (?club=…&team=…) – damit
//      landet man beim Team-Passwort bzw. direkt in der Spielerliste.
//   2. Keine Spielernamen im geteilten Text.
//   3. Dafür die Zahlen – vor allem, wie viele noch nicht abgestimmt haben.
//   4. Turnier: der Trainer sieht keine „Mein Kind ist dabei“-Abstimmung mehr.
// Aufruf: npm run build && node scripts/test-teilen.mjs
import { chromium } from "playwright-core";
import http from "http"; import fs from "fs"; import path from "path";
const dist = path.resolve("dist");
const srv = http.createServer((req,res)=>{ let p=path.join(dist,req.url.split("?")[0]); if(!fs.existsSync(p)||fs.statSync(p).isDirectory()) p=path.join(dist,"index.html"); res.setHeader("content-type",{".html":"text/html",".js":"text/javascript",".css":"text/css"}[path.extname(p)]||"text/plain"); res.end(fs.readFileSync(p)); }).listen(4291);
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
// Teilen mitlesen: navigator.share abschalten, Zwischenablage abfangen
const lauschen = () => page.evaluate(()=>{ window.__geteilt=null;
  try{ Object.defineProperty(navigator,"share",{value:undefined,configurable:true}); }catch{}
  try{ Object.defineProperty(navigator,"clipboard",{value:{writeText:t=>{window.__geteilt=t;return Promise.resolve();}},configurable:true}); }catch{}
});
const geteilt = () => page.evaluate(()=>window.__geteilt||"");
const klick = (re)=>page.evaluate(r=>{
  const b=[...document.querySelectorAll("button")].find(x=>new RegExp(r).test((x.innerText||"").trim()));
  if(!b) return false; b.click(); return true; }, re instanceof RegExp?re.source:re);

await page.addInitScript(()=>{ if(!localStorage.getItem("vereinsapp_config")) localStorage.setItem("vereinsapp_config", JSON.stringify({url:"https://127.0.0.1:1/x", key:"test"})); });
await page.goto("http://127.0.0.1:4291/", { waitUntil:"networkidle" }); await page.waitForTimeout(2500);
await page.evaluate(()=>{ localStorage.setItem("va_simple","0"); localStorage.setItem("va_tsimple","0");
  sessionStorage.setItem("vereinsapp_v12_session", JSON.stringify({role:"trainer",cid:"demo",tids:["demo_f1"],name:"Demo Trainer",id:"demo_tr1"})); });
await page.reload({waitUntil:"networkidle"}); await page.waitForTimeout(2600); await dismiss();
await page.evaluate(()=>{ const b=[...document.querySelectorAll("button")].find(x=>/Bin dabei/.test(x.innerText)); b&&b.click(); });
await page.waitForTimeout(1500);

const kader = await page.evaluate(()=>{
  const d=JSON.parse(localStorage.getItem("vereinsapp_v14")||"null"); if(!d) return null;
  const p=v=>String(v).padStart(2,"0"); const tg=n=>{const x=new Date(Date.now()+n*86400000);return `${x.getFullYear()}-${p(x.getMonth()+1)}-${p(x.getDate())}`;};
  const evs=(d.events||[]).filter(e=>e.cid==="demo"&&e.tid==="demo_f1"&&(e.pt==="att"||!e.pt)).sort((a,b)=>String(a.date).localeCompare(String(b.date)));
  if(!evs.length) return null;
  const k=[...new Set([...((d.players||{})["demo_f1"]||[]),
    ...((d.playerProfiles||[]).filter(pp=>pp.mainTid==="demo_f1"&&!pp.archived).map(pp=>pp.name))])];
  if(k.length<3) return null;
  const ts=new Date().toISOString();
  Object.assign(evs[0],{ type:"turnier", date:tg(2), time:"09:30", endTime:"12:00", title:"Kinderfestival",
    loc:"Halle", note:"", deadline:null,
    votes:{ [k[0]]:{val:"yes",ts,role:"player"}, [k[1]]:{val:"no",ts,role:"player"} },
    carpool:{ [k[0]]:{mode:"drive",seats:3,ts}, [k[2]]:{mode:"need",car:null,ts} } });
  evs.slice(1).forEach(e=>{ e.date=tg(12); });
  localStorage.setItem("vereinsapp_v14", JSON.stringify(d));
  return {alle:k, ja:k[0], nein:k[1], offen:k[2]};
});
if(kader) ok("Turnier angelegt – 1 Zusage, 1 Absage, Rest offen");
else fail("Konnte das Turnier nicht anlegen");
await page.reload({waitUntil:"networkidle"}); await page.waitForTimeout(2800); await dismiss();
const keineNamen=(txt,wo)=>{
  const drin=kader.alle.filter(n=>txt.includes(n)||txt.includes(String(n).split(" ")[0]+" "+String(n).split(" ").pop()[0]+"."));
  if(drin.length===0) ok("Keine Spielernamen im geteilten Text ("+wo+")");
  else fail("Spielernamen im Text ("+wo+"): "+drin.join(", "));
};
const teamLink=(txt,wo)=>{
  const m=txt.match(/https?:\/\/[^\s]+/);
  if(m&&/[?&]club=/.test(m[0])&&/[?&]team=demo_f1/.test(m[0])) ok("Der Link führt zur Mannschaft ("+wo+"): "+m[0].replace(/^https?:\/\/[^/]+/,""));
  else fail("Kein Mannschafts-Link ("+wo+"): "+(m?m[0]:"gar kein Link"));
};

// ===== 1) Erinnerung an die Nicht-Abstimmer (Terminkarte, „Mehr“) =====
await lauschen();
// Das Weitere-Menü der Terminkarte öffnen ("⋯")
await page.evaluate(()=>{ const b=[...document.querySelectorAll("button")].find(x=>(x.innerText||"").trim()==="⋯"); b&&b.click(); });
await page.waitForTimeout(700);
{ const geklickt=await klick("Erinnern");
  if(!geklickt) fail("Kein Erinnern-Knopf auf der Terminkarte");
  await page.waitForTimeout(1200);
  const txt=await geteilt();
  if(txt) { ok("Die Erinnerung wurde erstellt");
    teamLink(txt,"Erinnerung"); keineNamen(txt,"Erinnerung");
    if(/fehlen noch \d+ Rückmeldung/.test(txt)) ok("Mit Zahl der offenen Rückmeldungen: "+(txt.match(/fehlen noch \d+ Rückmeldung\w*/)||[""])[0]);
    else fail("Keine Zahl der offenen Rückmeldungen: "+txt.replace(/\n/g," | ").slice(0,200));
  } else fail("Nichts geteilt"); }

// ===== 2) Termin öffnen: „Termin-Link teilen“ und „Spieltag-Zettel“ =====
await page.evaluate(()=>{ const b=[...document.querySelectorAll("button")].find(x=>/^(Ansehen|✅ Anwesenheit)$/.test((x.innerText||"").trim())); b&&b.click(); });
await page.waitForTimeout(1500);
await lauschen();
await klick("Termin-Link teilen"); await page.waitForTimeout(1000);
{ const txt=await geteilt();
  if(txt){ teamLink(txt,"Termin-Link"); keineNamen(txt,"Termin-Link");
    if(/⏳ \d+ noch offen/.test(txt)) ok("Mit Stand in Zahlen: "+(txt.match(/✅[^\n]*/)||[""])[0]);
    else fail("Kein Zahlen-Stand: "+txt.replace(/\n/g," | ").slice(0,200));
  } else fail("Termin-Link nicht geteilt"); }
await lauschen();
await klick("Spieltag-Zettel teilen"); await page.waitForTimeout(1000);
{ const txt=await geteilt();
  if(txt){ teamLink(txt,"Spieltag-Zettel"); keineNamen(txt,"Spieltag-Zettel");
    if(/\d+ dabei/.test(txt)&&/\d+ noch offen/.test(txt)) ok("Mit Zahlen statt Namen: "+(txt.match(/✅[^\n]*/)||[""])[0]);
    else fail("Keine Zahlen im Spieltag-Zettel: "+txt.replace(/\n/g," | ").slice(0,240));
    if(/Fahrer/.test(txt)&&!/\(3 Plätze/.test(txt)) ok("Fahrer nur als Zahl: "+(txt.match(/🚗[^\n]*/)||[""])[0]);
    else fail("Fahrer-Namen im Text: "+(txt.match(/🚗[^\n]*/)||[""])[0]);
  } else fail("Spieltag-Zettel nicht geteilt"); }

// ===== 3) Turnier: keine eigene Kind-Abstimmung mehr beim Trainer =====
{ const b=await body();
  if(!/Mein Kind ist dabei/.test(b)) ok("Der Trainer sieht keine „Mein Kind ist dabei“-Abstimmung mehr");
  else fail("„Mein Kind ist dabei“ steht immer noch beim Trainer");
  if(/Rückmeldungen/.test(b)&&/Spieler dabei/.test(b)) ok("Stattdessen stehen dort die Zahlen des Teams");
  else fail("Keine Team-Zahlen sichtbar"); }

if(errors.length){ console.log("JS-FEHLER:"); [...new Set(errors)].forEach(e=>console.log(" -",e.slice(0,150))); }
console.log(errors.length||fails.length?`ERGEBNIS: ${fails.length} Fehlschläge, ${errors.length} JS-Fehler`:"ERGEBNIS: ALLES OK");
await browser.close(); srv.close();
process.exit(errors.length||fails.length?1:0);
