// E2E-Test: Gemeinsamer Termin mehrerer Mannschaften.
// Aus dem Verein: der Silvesterlauf am 31.12. machen F2 und F3 zusammen.
// Jede Mannschaft stimmt in ihrem eigenen Termin ab – der Trainer braucht
// aber EINE Liste, in der steht, wer aus welcher Mannschaft kommt.
//   1. Der Verbund wird als solcher erkannt und benannt.
//   2. Eine gemeinsame Liste zeigt je Mannschaft Zusagen, Absagen und Offene
//      – mit Namen.
//   3. Die Gesamtzahl der Zusagen zählt über beide Mannschaften.
//   4. Die bisherigen Zusagen der ersten Mannschaft bleiben unangetastet.
//   5. Ohne Verbund erscheint die Liste nicht.
// Aufruf: npm run build && node scripts/test-verbund-termin.mjs
import { chromium } from "playwright-core";
import http from "http"; import fs from "fs"; import path from "path";
const dist = path.resolve("dist");
const srv = http.createServer((req,res)=>{ let p=path.join(dist,req.url.split("?")[0]); if(!fs.existsSync(p)||fs.statSync(p).isDirectory()) p=path.join(dist,"index.html"); res.setHeader("content-type",{".html":"text/html",".js":"text/javascript",".css":"text/css"}[path.extname(p)]||"text/plain"); res.end(fs.readFileSync(p)); }).listen(4335);
const exe=process.env.PLAYWRIGHT_CHROMIUM||"/opt/pw-browsers/chromium-1194/chrome-linux/chrome";
const browser = await chromium.launch({ executablePath:exe, args:["--no-sandbox"] });
const page = await browser.newPage({ viewport:{ width:390, height:900 } });
page.setDefaultTimeout(10000);
const errors=[]; const fails=[];
page.on("pageerror", e=>errors.push(e.message));
page.on("dialog", d=>d.accept());
const fail=m=>{ fails.push(m); console.log("FEHLGESCHLAGEN:", m); };
const ok=m=>console.log("OK:", m);
const kurz=t=>String(t).slice(0,320).replace(/\n/g," | ");
const dismiss=async()=>{ for(let k=0;k<12;k++){ const done=await page.evaluate(()=>{
  const fx=[...document.querySelectorAll("div")].filter(d=>getComputedStyle(d).position==="fixed"&&d.querySelector("button")&&d.innerText.length>30);
  for(const f of fx){ const b=[...f.querySelectorAll("button")].find(x=>/geht|Los|Verstanden|Alles klar|Fertig|Jetzt nicht|Weiter →|Überspringen|Start/i.test(x.innerText)); if(b){ b.click(); return false; } }
  return true; }); await page.waitForTimeout(400); if(done) break; } };
const fenster=()=>page.evaluate(()=>{
  const fx=[...document.querySelectorAll("div")].filter(d=>getComputedStyle(d).position==="fixed"&&(d.innerText||"").length>200);
  const f=fx.find(d=>/Rückmeldungen|Spieler dabei/.test(d.innerText||""));
  return f?(f.innerText||""):""; });

await page.addInitScript(()=>{
  if(!localStorage.getItem("vereinsapp_config")) localStorage.setItem("vereinsapp_config", JSON.stringify({url:"https://127.0.0.1:1/x", key:"test"}));
  if(localStorage.getItem("va_simple")===null)  localStorage.setItem("va_simple","0");
  if(localStorage.getItem("va_tsimple")===null) localStorage.setItem("va_tsimple","0");
});
await page.goto("http://127.0.0.1:4335/", { waitUntil:"networkidle" }); await page.waitForTimeout(2500);
await page.evaluate(()=>{ sessionStorage.setItem("vereinsapp_v12_session", JSON.stringify({role:"trainer",cid:"demo",tids:["demo_f1","demo_f9"],name:"Demo Trainer",id:"demo_tr1"})); });
await page.reload({waitUntil:"networkidle"}); await page.waitForTimeout(2600); await dismiss();
await page.evaluate(()=>{ const b=[...document.querySelectorAll("button")].find(x=>/Bin dabei/.test(x.innerText)); b&&b.click(); });
await page.waitForTimeout(1400);

// Zwei Mannschaften, ein gemeinsamer Termin – wie Silvesterlauf F2 + F3
const setup = await page.evaluate(()=>{
  const d=JSON.parse(localStorage.getItem("vereinsapp_v14")||"null");
  const z=x=>String(x).padStart(2,"0");
  const tg=n=>{ const x=new Date(); x.setHours(12,0,0,0); x.setDate(x.getDate()+n);
    return `${x.getFullYear()}-${z(x.getMonth()+1)}-${z(x.getDate())}`; };
  const t2={ id:"demo_f9", cid:"demo", name:"F-Jugend 9", icon:"F9", col:"#7c3aed", pub:true, pwd:"x", cat:"F-Jugend", years:"" };
  d.teams=[...(d.teams||[]).filter(t=>t.id!=="demo_f9"), t2];
  const f1=(d.playerProfiles||[]).filter(p=>p.mainTid==="demo_f1"&&!p.archived).map(p=>p.name);
  // Drei Kinder in die zweite Mannschaft holen
  const umzug=f1.slice(0,2);   // zwei wechseln, drei bleiben
  d.playerProfiles=(d.playerProfiles||[]).map(p=>umzug.includes(p.name)?{...p,mainTid:"demo_f9"}:p);
  const bleiben=f1.filter(n=>!umzug.includes(n));
  const ts=new Date().toISOString();
  const ev=(d.events||[]).filter(e=>e.cid==="demo"&&e.tid==="demo_f1")[0];
  Object.assign(ev,{ type:"event", title:"Silvesterlauf", date:tg(14), time:"14:30", endTime:"",
    deadline:null, groupId:"grp_test", lineup:null, lineups:null, extraPolls:[], duties:[],
    votes:Object.fromEntries([ [bleiben[0],{val:"yes",ts,role:"player"}],
                               [bleiben[1],{val:"yes",ts,role:"player"}],
                               [bleiben[2],{val:"no", ts,role:"player"}] ]) });
  const zwilling={ ...ev, id:"ev_verbund_f9", tid:"demo_f9", groupId:"grp_test",
    votes:{ [umzug[0]]:{val:"yes",ts,role:"player"} }, present:{} };
  d.events=[...(d.events||[]).filter(e=>e.id!=="ev_verbund_f9"), zwilling];
  (d.events||[]).filter(e=>e.cid==="demo"&&e.id!==ev.id&&e.id!=="ev_verbund_f9").forEach(e=>{ e.date=tg(60); });
  localStorage.setItem("vereinsapp_v14", JSON.stringify(d));
  return { f1:bleiben, f9:umzug, evId:ev.id };
});
if(setup) ok(`Verbund gebaut: F-Jugend 1 (${setup.f1.length} Kinder) + F-Jugend 9 (${setup.f9.length})`);
else { fail("Testdaten nicht gesetzt"); process.exit(1); }

const oeffne=async()=>{
  await page.reload({waitUntil:"networkidle"}); await page.waitForTimeout(2800); await dismiss();
  await page.evaluate(()=>{ const b=[...document.querySelectorAll("button")].find(x=>/^(Ansehen|✅ Anwesenheit)$/.test((x.innerText||"").trim())); b&&b.click(); });
  await page.waitForTimeout(1700);
};
await oeffne();
let b=await fenster();
if(/Verbund-Termin/.test(b)) ok("Der Termin ist als Verbund erkannt: "+((b.match(/🤝 Verbund-Termin[^\n]*/)||[""])[0]).slice(0,70));
else fail("Nicht als Verbund erkannt: "+kurz(b));

// ===== Gemeinsame Liste =====
if(/GEMEINSAMER TERMIN/.test(b)) ok("Es gibt eine gemeinsame Liste über beide Mannschaften");
else fail("Keine gemeinsame Liste: "+kurz(b));
{ const m=b.match(/GEMEINSAMER TERMIN · (\d+) ZUSAGEN/);
  if(m&&m[1]==="3") ok("Sie zählt die Zusagen über beide Mannschaften (2 + 1 = 3)");
  else fail("Falsche Gesamtzahl: "+(m?m[1]:"(keine)")); }
if(/F-Jugend 1/.test(b)&&/F-Jugend 9/.test(b)) ok("Beide Mannschaften stehen namentlich da");
else fail("Mannschaften fehlen: "+kurz(b));
if(/dieser Termin/.test(b)) ok("Und es ist markiert, in welchem Termin man gerade steht");
else fail("Kein Hinweis auf den eigenen Termin");
{ // nur innerhalb der gemeinsamen Liste suchen - der Verbund-Hinweis oben
  // nennt die Mannschaften ebenfalls.
  const liste=b.slice(b.indexOf("GEMEINSAMER TERMIN"));
  const zeilen=liste.split("\n");
  const i9=zeilen.findIndex(z=>z.includes("F-Jugend 9"));
  const block=zeilen.slice(i9,i9+4).join(" | ");
  if(i9>=0&&block.includes(setup.f9[0])) ok(`Das Kind der zweiten Mannschaft steht bei seiner Mannschaft (${setup.f9[0]})`);
  else fail("Zuordnung stimmt nicht: "+block);
  const i1=zeilen.findIndex(z=>z.includes("F-Jugend 1"));
  const block1=zeilen.slice(i1,i1+4).join(" | ");
  if(i1>=0&&!block1.includes(setup.f9[0])) ok("Und nicht bei der ersten Mannschaft");
  else fail("Kind steht bei der falschen Mannschaft: "+block1); }
if(new RegExp("Abgesagt: "+setup.f1[2].replace(/[.*+?^${}()|[\]\\]/g,"\\$&")).test(b))
  ok("Absagen stehen getrennt dabei");
else fail("Keine Absage-Zeile: "+kurz(b));
if(/Offen: /.test(b)) ok("Und wer noch nicht geantwortet hat");
else fail("Keine Offen-Zeile");

// ===== Die bisherigen Zusagen bleiben unangetastet =====
{ const v=await page.evaluate(i=>{ const d=JSON.parse(localStorage.getItem("vereinsapp_v14")||"null");
    const e=(d.events||[]).find(x=>x.id===i); return Object.keys(e.votes||{}).length; }, setup.evId);
  if(v===3) ok("Die drei Antworten der ersten Mannschaft sind unverändert");
  else fail("Antworten verändert: "+v); }

// ===== Ohne Verbund keine Liste =====
await page.evaluate(i=>{ const d=JSON.parse(localStorage.getItem("vereinsapp_v14")||"null");
  d.events=(d.events||[]).filter(e=>e.id!=="ev_verbund_f9");
  const e=(d.events||[]).find(x=>x.id===i); delete e.groupId;
  localStorage.setItem("vereinsapp_v14", JSON.stringify(d)); }, setup.evId);
await oeffne();
b=await fenster();
if(!/GEMEINSAMER TERMIN/.test(b)) ok("Bei einem normalen Termin erscheint die Liste nicht");
else fail("Liste erscheint auch ohne Verbund");

if(errors.length){ console.log("JS-FEHLER:"); [...new Set(errors)].forEach(e=>console.log(" -",e.slice(0,150))); }
console.log(errors.length||fails.length?`ERGEBNIS: ${fails.length} Fehlschläge, ${errors.length} JS-Fehler`:"ERGEBNIS: ALLES OK");
await browser.close(); srv.close();
process.exit(errors.length||fails.length?1:0);
