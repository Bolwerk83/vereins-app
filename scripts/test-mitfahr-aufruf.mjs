// E2E-Test: Mitfahr-Aufruf für die WhatsApp-Gruppe.
//   Beim Spiel/Turnier kann der Trainer einen fertigen Text teilen, der
//   sagt, welche Kinder noch eine Mitfahrt suchen – motivierend und mit
//   klarer Handlungsaufforderung.
//   1. Der Knopf erscheint nur, wenn wirklich jemand ohne Platz dasteht.
//   2. Im Text stehen Vorname und Treffpunkt der Suchenden – keine Nachnamen.
//   3. Freie Plätze und ein Satz, was zu tun ist, gehören dazu.
//   4. Sitzen alle im Auto, ist der Knopf weg.
// Aufruf: npm run build && node scripts/test-mitfahr-aufruf.mjs
import { chromium } from "playwright-core";
import http from "http"; import fs from "fs"; import path from "path";
const dist = path.resolve("dist");
const srv = http.createServer((req,res)=>{ let p=path.join(dist,req.url.split("?")[0]); if(!fs.existsSync(p)||fs.statSync(p).isDirectory()) p=path.join(dist,"index.html"); res.setHeader("content-type",{".html":"text/html",".js":"text/javascript",".css":"text/css"}[path.extname(p)]||"text/plain"); res.end(fs.readFileSync(p)); }).listen(4331);
const exe=process.env.PLAYWRIGHT_CHROMIUM||"/opt/pw-browsers/chromium-1194/chrome-linux/chrome";
const browser = await chromium.launch({ executablePath:exe, args:["--no-sandbox"] });
const ctx = await browser.newContext({ viewport:{ width:390, height:900 }, permissions:["clipboard-read","clipboard-write"] });
const page = await ctx.newPage();
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
const oeffneTermin = async () => {
  await page.evaluate(()=>{ const b=[...document.querySelectorAll("button")].find(x=>/^(Ansehen|✅ Anwesenheit)$/.test((x.innerText||"").trim())); b&&b.click(); });
  await page.waitForTimeout(1600);
};
// navigator.share abfangen, damit wir den erzeugten Text lesen können
const shareAbfangen = () => page.evaluate(()=>{ window.__geteilt=null;
  navigator.share = (d)=>{ window.__geteilt=d; return Promise.resolve(); }; });
const geteilt = () => page.evaluate(()=>window.__geteilt);
const knopf = () => page.evaluate(()=>{
  const b=[...document.querySelectorAll("button")].find(x=>/Mitfahr-Aufruf teilen/.test(x.innerText||""));
  return b?(b.innerText||"").replace(/\n/g," | "):null; });

await page.addInitScript(()=>{
  if(!localStorage.getItem("vereinsapp_config")) localStorage.setItem("vereinsapp_config", JSON.stringify({url:"https://127.0.0.1:1/x", key:"test"}));
  if(localStorage.getItem("va_simple")===null)  localStorage.setItem("va_simple","0");
  if(localStorage.getItem("va_tsimple")===null) localStorage.setItem("va_tsimple","0");
});
await page.goto("http://127.0.0.1:4331/", { waitUntil:"networkidle" }); await page.waitForTimeout(2500);
await page.evaluate(()=>{ sessionStorage.setItem("vereinsapp_v12_session", JSON.stringify({role:"trainer",cid:"demo",tids:["demo_f1"],name:"Demo Trainer",id:"demo_tr1"})); });
await page.reload({waitUntil:"networkidle"}); await page.waitForTimeout(2600); await dismiss();
await page.evaluate(()=>{ const b=[...document.querySelectorAll("button")].find(x=>/Bin dabei/.test(x.innerText)); b&&b.click(); });
await page.waitForTimeout(1500);

// Auswärtsspiel: A fährt (2 Plätze, einer belegt), B und C suchen noch
const daten = await page.evaluate(()=>{
  const d=JSON.parse(localStorage.getItem("vereinsapp_v14")||"null"); if(!d) return null;
  const p=v=>String(v).padStart(2,"0"); const x=new Date(Date.now()+3*86400000);
  const ev=(d.events||[]).filter(e=>e.cid==="demo"&&e.tid==="demo_f1"&&(e.pt==="att"||!e.pt))
    .sort((a,b)=>String(a.date||"").localeCompare(String(b.date||"")))[0]; if(!ev) return null;
  const k=[...new Set([...((d.players||{})["demo_f1"]||[]),
    ...((d.playerProfiles||[]).filter(pp=>pp.mainTid==="demo_f1"&&!pp.archived).map(pp=>pp.name))])];
  if(k.length<4) return null;
  const ts=new Date().toISOString();
  Object.assign(ev,{ type:"auswarts", date:`${x.getFullYear()}-${p(x.getMonth()+1)}-${p(x.getDate())}`,
    time:"10:30", endTime:"12:00", title:"SV Adler", loc:"Adler-Arena", note:"", deadline:null,
    carpoolExtra:true, carpoolEnabled:true, extraPolls:[], duties:[],
    votes:Object.fromEntries(k.slice(0,4).map(n=>[n,{val:"yes",ts,role:"player"}])),
    carpool:{ [k[0]]:{mode:"drive",seats:2,ts},
              [k[1]]:{mode:"need",car:k[0],pickup:"Sportplatz",ts},
              [k[2]]:{mode:"need",car:null,pickup:"Marktplatz, 9:15 Uhr",ts},
              [k[3]]:{mode:"need",car:null,ts} } });
  (d.events||[]).filter(e=>e.cid==="demo"&&e.id!==ev.id).forEach(e=>{
    const y=new Date(Date.now()+12*86400000); e.date=`${y.getFullYear()}-${p(y.getMonth()+1)}-${p(y.getDate())}`; });
  localStorage.setItem("vereinsapp_v14", JSON.stringify(d));
  return {ev:ev.id, fahrer:k[0], mit:k[1], sucht1:k[2], sucht2:k[3]};
});
if(daten) ok(`Ausgangslage: ${daten.fahrer} fährt (2 Plätze, 1 belegt), ${daten.sucht1} und ${daten.sucht2} suchen noch`);
else { fail("Konnte die Ausgangslage nicht setzen"); process.exit(1); }
await page.reload({waitUntil:"networkidle"}); await page.waitForTimeout(2800); await dismiss();
await oeffneTermin();

// ===== 1) Der Knopf ist da und nennt die Lage =====
{ const k=await knopf();
  if(k) ok("Es gibt den Knopf „Mitfahr-Aufruf teilen“: "+k);
  else fail("Kein Knopf: "+(await body()).slice(0,300).replace(/\n/g," | "));
  if(k&&/2 Kinder suchen/.test(k)) ok("Er nennt die Zahl der Suchenden");
  else fail("Keine Zahl am Knopf: "+k);
  if(k&&/1 Platz frei/.test(k)) ok("Und die freien Plätze");
  else fail("Keine freien Plätze am Knopf: "+k); }

// ===== 2) Der Text =====
await shareAbfangen();
await page.evaluate(()=>{ const b=[...document.querySelectorAll("button")].find(x=>/Mitfahr-Aufruf teilen/.test(x.innerText||"")); b&&b.click(); });
await page.waitForTimeout(900);
const g=await geteilt();
const t=g&&g.text||"";
if(t) { ok("Ein fertiger Text wird geteilt"); console.log("--- so sieht er aus ---\n"+t+"\n-----------------------"); }
else { fail("Kein Text erzeugt"); }
if(/Wer hat noch einen Platz frei/.test(t)) ok("Überschrift spricht die Eltern direkt an");
else fail("Keine ansprechende Überschrift: "+t.slice(0,120));
if(t.includes("SV Adler")&&/Adler-Arena/.test(t)) ok("Termin und Ort stehen drin");
else fail("Termin/Ort fehlen: "+t.slice(0,200));
{ const v1=daten.sucht1.split(" ")[0], v2=daten.sucht2.split(" ")[0];
  if(t.includes("• "+v1)&&t.includes("• "+v2)) ok(`Beide Suchenden stehen mit Vornamen drin (${v1}, ${v2})`);
  else fail("Suchende fehlen: "+t.slice(0,300));
  if(!t.includes(daten.sucht1)) ok("Der Nachname bleibt draußen");
  else fail("Voller Name im Text: "+daten.sucht1);
  if(!t.includes(daten.mit.split(" ")[0])&&!t.includes(daten.mit)) ok("Wer schon einen Platz hat, steht nicht in der Liste");
  else fail("Versorgtes Kind steht trotzdem drin"); }
if(/Marktplatz, 9:15 Uhr/.test(t)) ok("Der Treffpunkt steht dabei – so weiß man, ob es passt");
else fail("Kein Treffpunkt: "+t.slice(0,300));
if(/ist noch 1 Platz frei/.test(t)&&/1 von 2/.test(t)) ok("Der Text rechnet vor, was ein Platz schon bringt");
else fail("Keine Einordnung der freien Plätze: "+t.slice(0,400));
if(/Ein freier Platz im Auto reicht/.test(t)&&/„Ich fahre“ antippen/.test(t)) ok("Und sagt in einem Satz, was zu tun ist");
else fail("Keine Handlungsaufforderung: "+t.slice(0,400));
if(/Danke euch/.test(t)) ok("Der Ton bleibt freundlich statt fordernd");
else fail("Kein Dank am Ende");
if(/club=/.test(t)) ok("Der Link zur Mannschaft hängt dran"); else fail("Kein Link: "+t.slice(-120));

// ===== 3) Sitzen alle im Auto, ist der Knopf weg =====
await page.evaluate(k=>{ const d=JSON.parse(localStorage.getItem("vereinsapp_v14")||"null");
  const ev=(d.events||[]).find(e=>e.id===k.ev); const ts=new Date().toISOString();
  ev.carpool={ [k.fahrer]:{mode:"drive",seats:4,ts},
               [k.mit]:{mode:"need",car:k.fahrer,ts},
               [k.sucht1]:{mode:"need",car:k.fahrer,ts},
               [k.sucht2]:{mode:"need",car:k.fahrer,ts} };
  localStorage.setItem("vereinsapp_v14", JSON.stringify(d)); }, daten);
await page.reload({waitUntil:"networkidle"}); await page.waitForTimeout(2800); await dismiss();
await oeffneTermin();
{ const k=await knopf();
  if(!k) ok("Sobald alle einen Platz haben, verschwindet der Aufruf von selbst");
  else fail("Knopf bleibt trotz voller Autos: "+k); }

if(errors.length){ console.log("JS-FEHLER:"); [...new Set(errors)].forEach(e=>console.log(" -",e.slice(0,150))); }
console.log(errors.length||fails.length?`ERGEBNIS: ${fails.length} Fehlschläge, ${errors.length} JS-Fehler`:"ERGEBNIS: ALLES OK");
await browser.close(); srv.close();
process.exit(errors.length||fails.length?1:0);
