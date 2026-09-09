// E2E-Test: Auch Kinder ohne Zusage lassen sich aufstellen.
//   1. Sie stehen auf der Bank – farblich abgesetzt mit „noch offen“.
//   2. Sie lassen sich ganz normal in eine Linie stellen und bleiben dort
//      als „noch offen“ markiert, bis die Zusage da ist.
//   3. Im Mannschafts-Kopf steht, wie viele davon noch ohne Zusage sind.
//   4. Sagt das Kind zu, verschwindet die Markierung von selbst.
//   5. Sagt es ab, wird es rot als „abgesagt“ markiert – es fällt nicht
//      still aus der Mannschaft.
// Aufruf: npm run build && node scripts/test-aufstellung-offen.mjs
import { chromium } from "playwright-core";
import http from "http"; import fs from "fs"; import path from "path";
const dist = path.resolve("dist");
const srv = http.createServer((req,res)=>{ let p=path.join(dist,req.url.split("?")[0]); if(!fs.existsSync(p)||fs.statSync(p).isDirectory()) p=path.join(dist,"index.html"); res.setHeader("content-type",{".html":"text/html",".js":"text/javascript",".css":"text/css"}[path.extname(p)]||"text/plain"); res.end(fs.readFileSync(p)); }).listen(4329);
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
const zurAufstellung = async () => {
  await page.evaluate(()=>{ const b=[...document.querySelectorAll("button")].find(x=>/^(Ansehen|✅ Anwesenheit)$/.test((x.innerText||"").trim())); b&&b.click(); });
  await page.waitForTimeout(1500);
  await page.evaluate(()=>{ const b=[...document.querySelectorAll("button")].find(x=>/^(⚽ Aufstellung|Aufstellung)$/.test((x.innerText||"").trim())); b&&b.click(); });
  await page.waitForTimeout(1200);
};
// Die Bank-Zeile eines Kindes: Text + Rahmenfarbe
const bankZeile = (name) => page.evaluate(n=>{
  const t=document.body.innerText; const i=t.indexOf("BANK");
  const zeilen=[...document.querySelectorAll("div")].filter(d=>(d.innerText||"").includes(n)&&d.querySelectorAll("button").length===4);
  const z=zeilen[zeilen.length-1]; if(!z) return null;
  const st=getComputedStyle(z);
  return { text:(z.innerText||"").replace(/\n/g," "), rahmen:st.borderColor, stil:st.borderStyle, bg:st.backgroundColor }; }, name);
// Der Chip eines Kindes in der Mannschaft
const chip = (name) => page.evaluate(n=>{
  const alle=[...document.querySelectorAll("span")].filter(x=>(x.innerText||"").includes(n)&&getComputedStyle(x).borderStyle!=="none");
  const el=alle[0]; if(!el) return null;
  const st=getComputedStyle(el);
  return { text:(el.innerText||"").replace(/\n/g," "), stil:st.borderStyle, rahmen:st.borderColor }; }, name);
// Bank-Knopf "A" (Abwehr) bei einem Kind
const bankKlick=(name)=>page.evaluate(n=>{
  const zeilen=[...document.querySelectorAll("div")].filter(d=>(d.innerText||"").includes(n)&&d.querySelectorAll("button").length===4);
  const z=zeilen[zeilen.length-1]; if(!z) return false;
  const b=[...z.querySelectorAll("button")].find(x=>(x.innerText||"").trim()==="A"); if(!b) return false; b.click(); return true; }, name);
const evLesen=(id)=>page.evaluate(x=>{ const d=JSON.parse(localStorage.getItem("vereinsapp_v14")||"null");
  return (d.events||[]).find(e=>e.id===x)||null; }, id);

await page.addInitScript(()=>{
  if(!localStorage.getItem("vereinsapp_config")) localStorage.setItem("vereinsapp_config", JSON.stringify({url:"https://127.0.0.1:1/x", key:"test"}));
  if(localStorage.getItem("va_simple")===null)  localStorage.setItem("va_simple","0");
  if(localStorage.getItem("va_tsimple")===null) localStorage.setItem("va_tsimple","0");
});
await page.goto("http://127.0.0.1:4329/", { waitUntil:"networkidle" }); await page.waitForTimeout(2500);
await page.evaluate(()=>{ sessionStorage.setItem("vereinsapp_v12_session", JSON.stringify({role:"trainer",cid:"demo",tids:["demo_f1"],name:"Demo Trainer",id:"demo_tr1"})); });
await page.reload({waitUntil:"networkidle"}); await page.waitForTimeout(2600); await dismiss();
await page.evaluate(()=>{ const b=[...document.querySelectorAll("button")].find(x=>/Bin dabei/.test(x.innerText)); b&&b.click(); });
await page.waitForTimeout(1500);

// Turnier: zwei Kinder sagen zu, eines antwortet gar nicht
const daten = await page.evaluate(()=>{
  const d=JSON.parse(localStorage.getItem("vereinsapp_v14")||"null"); if(!d) return null;
  const p=v=>String(v).padStart(2,"0"); const x=new Date(Date.now()+2*86400000);
  const ev=(d.events||[]).filter(e=>e.cid==="demo"&&e.tid==="demo_f1"&&(e.pt==="att"||!e.pt))
    .sort((a,b)=>String(a.date||"").localeCompare(String(b.date||"")))[0]; if(!ev) return null;
  const k=[...new Set([...((d.players||{})["demo_f1"]||[]),
    ...((d.playerProfiles||[]).filter(pp=>pp.mainTid==="demo_f1"&&!pp.archived).map(pp=>pp.name))])];
  if(k.length<3) return null;
  const ts=new Date().toISOString();
  Object.assign(ev,{ type:"turnier", date:`${x.getFullYear()}-${p(x.getMonth()+1)}-${p(x.getDate())}`,
    time:"09:30", endTime:"12:00", title:"Kinderfestival", loc:"Halle", note:"", deadline:null,
    carpoolExtra:false, carpoolEnabled:false, extraPolls:[], duties:[], lineup:null, lineups:null,
    votes:{ [k[0]]:{val:"yes",ts,role:"player"}, [k[1]]:{val:"yes",ts,role:"player"} } });
  (d.events||[]).filter(e=>e.cid==="demo"&&e.id!==ev.id).forEach(e=>{
    const y=new Date(Date.now()+12*86400000); e.date=`${y.getFullYear()}-${p(y.getMonth()+1)}-${p(y.getDate())}`; });
  localStorage.setItem("vereinsapp_v14", JSON.stringify(d));
  return {ev:ev.id, ja:k[0], ja2:k[1], offen:k[2]};
});
if(daten) ok(`Ausgangslage: ${daten.ja} und ${daten.ja2} haben zugesagt, ${daten.offen} hat noch nicht geantwortet`);
else { fail("Konnte die Ausgangslage nicht setzen"); process.exit(1); }
await page.reload({waitUntil:"networkidle"}); await page.waitForTimeout(2800); await dismiss();

// ===== 1) Ohne Zusage steht trotzdem auf der Bank =====
await zurAufstellung();
let b=await body();
if(b.includes(daten.offen)) ok(`${daten.offen} steht zur Auswahl, obwohl noch keine Antwort da ist`);
else fail("Kind ohne Zusage fehlt ganz: "+b.slice(0,300).replace(/\n/g," | "));
{ const z=await bankZeile(daten.offen);
  if(z&&/noch offen/.test(z.text)) ok("Auf der Bank steht dahinter „noch offen“");
  else fail("Keine Markierung auf der Bank: "+JSON.stringify(z));
  if(z&&z.stil==="dashed") ok("Die Zeile ist gestrichelt abgesetzt – es fällt auf");
  else fail("Nicht abgesetzt: "+JSON.stringify(z&&z.stil)); }
{ const z=await bankZeile(daten.ja);
  if(z&&!/noch offen/.test(z.text)) ok(`${daten.ja} (zugesagt) bleibt unauffällig`);
  else fail("Zusage fälschlich markiert: "+JSON.stringify(z)); }
if(/Kinder ohne Zusage kannst du trotzdem aufstellen/.test(b)) ok("Ein Hinweis erklärt es in einem Satz");
else fail("Kein erklärender Hinweis");

// ===== 2) Aufstellen klappt =====
if(await bankKlick(daten.offen)) ok("Das Kind ohne Zusage lässt sich in die Abwehr stellen");
else fail("Kein Aufstellen möglich");
await page.waitForTimeout(1300);
{ const ev=await evLesen(daten.ev);
  const drin=ev&&ev.lineups&&ev.lineups[0]&&(ev.lineups[0].A||[]).includes(daten.offen);
  if(drin) ok("Es steht in der gespeicherten Mannschaft"); else fail("Nicht gespeichert: "+JSON.stringify(ev&&ev.lineups)); }
{ const c=await chip(daten.offen);
  if(c&&/noch offen/.test(c.text)) ok("Auch in der Mannschaft bleibt „noch offen“ dran");
  else fail("Keine Markierung in der Mannschaft: "+JSON.stringify(c));
  if(c&&c.stil==="dashed") ok("Der Chip ist gestrichelt – der Unterschied ist sichtbar");
  else fail("Chip nicht abgesetzt: "+JSON.stringify(c&&c.stil)); }
b=await body();
if(/1 ohne Zusage/.test(b)) ok("Im Mannschafts-Kopf steht „· 1 ohne Zusage“");
else fail("Keine Zahl im Mannschafts-Kopf: "+b.slice(0,300).replace(/\n/g," | "));

// ===== 3) Zusage lässt die Markierung verschwinden =====
await page.evaluate(k=>{ const d=JSON.parse(localStorage.getItem("vereinsapp_v14")||"null");
  const ev=(d.events||[]).find(e=>e.id===k.ev);
  ev.votes={...(ev.votes||{}), [k.offen]:{val:"yes",ts:new Date().toISOString(),role:"player"}};
  localStorage.setItem("vereinsapp_v14", JSON.stringify(d)); }, daten);
await page.reload({waitUntil:"networkidle"}); await page.waitForTimeout(2800); await dismiss();
await zurAufstellung();
{ const c=await chip(daten.offen);
  if(c&&!/noch offen/.test(c.text)) ok("Nach der Zusage ist die Markierung von selbst weg");
  else fail("Markierung bleibt trotz Zusage: "+JSON.stringify(c)); }
b=await body();
if(!/· \d+ ohne Zusage/.test(b)) ok("Und der Zähler im Mannschafts-Kopf ist verschwunden");
else fail("Zähler bleibt stehen: "+(b.match(/· \d+ ohne Zusage/)||[""])[0]);

// ===== 4) Absage fällt rot auf =====
await page.evaluate(k=>{ const d=JSON.parse(localStorage.getItem("vereinsapp_v14")||"null");
  const ev=(d.events||[]).find(e=>e.id===k.ev);
  ev.votes={...(ev.votes||{}), [k.offen]:{val:"no",ts:new Date().toISOString(),role:"player"}};
  localStorage.setItem("vereinsapp_v14", JSON.stringify(d)); }, daten);
await page.reload({waitUntil:"networkidle"}); await page.waitForTimeout(2800); await dismiss();
await zurAufstellung();
{ const c=await chip(daten.offen);
  if(c&&/abgesagt/.test(c.text)) ok("Sagt das Kind ab, steht „abgesagt“ am Chip – es fällt nicht still heraus");
  else fail("Absage nicht markiert: "+JSON.stringify(c)); }
{ const ev=await evLesen(daten.ev);
  const drin=ev&&ev.lineups&&ev.lineups[0]&&(ev.lineups[0].A||[]).includes(daten.offen);
  if(drin) ok("Und die Aufstellung selbst bleibt unangetastet – der Trainer entscheidet");
  else fail("Kind wurde still aus der Mannschaft geworfen"); }

if(errors.length){ console.log("JS-FEHLER:"); [...new Set(errors)].forEach(e=>console.log(" -",e.slice(0,150))); }
console.log(errors.length||fails.length?`ERGEBNIS: ${fails.length} Fehlschläge, ${errors.length} JS-Fehler`:"ERGEBNIS: ALLES OK");
await browser.close(); srv.close();
process.exit(errors.length||fails.length?1:0);
