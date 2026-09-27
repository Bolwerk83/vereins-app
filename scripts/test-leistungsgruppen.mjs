// E2E-Test: Interne Leistungsgruppen (nur Trainerteam).
//   Hintergrund: ein Kader von fast 30 Kindern soll sich intern unterteilen
//   lassen, damit bei zwei gemeldeten Mannschaften gleich starke Teams
//   entstehen – trainiert wird weiter gemeinsam.
//   1. Der Abschnitt steht auf der Team-Seite, zugeklappt, mit Zählern.
//   2. Aufgeklappt: Hinweis „nur Trainer“ und ein Fairness-Hinweis.
//   3. Kinder lassen sich zuteilen und wieder lösen; die Zahl stimmt.
//   4. Gruppen lassen sich umbenennen.
//   5. In der Aufstellung bildet „🎯 Nach Gruppen“ getrennte Mannschaften.
//   6. Die Mannschaften heißen neutral – Eltern sehen keine Gruppennamen.
// Aufruf: npm run build && node scripts/test-leistungsgruppen.mjs
import { chromium } from "playwright-core";
import http from "http"; import fs from "fs"; import path from "path";
const dist = path.resolve("dist");
const srv = http.createServer((req,res)=>{ let p=path.join(dist,req.url.split("?")[0]); if(!fs.existsSync(p)||fs.statSync(p).isDirectory()) p=path.join(dist,"index.html"); res.setHeader("content-type",{".html":"text/html",".js":"text/javascript",".css":"text/css"}[path.extname(p)]||"text/plain"); res.end(fs.readFileSync(p)); }).listen(4337);
const exe=process.env.PLAYWRIGHT_CHROMIUM||"/opt/pw-browsers/chromium-1194/chrome-linux/chrome";
const browser = await chromium.launch({ executablePath:exe, args:["--no-sandbox"] });
const page = await browser.newPage({ viewport:{ width:390, height:900 } });
const errors=[]; const fails=[];
page.on("pageerror", e=>errors.push(e.message));
page.on("dialog", d=>d.accept());
const fail=m=>{ fails.push(m); console.log("FEHLGESCHLAGEN:", m); };
const ok=m=>console.log("OK:", m);
const body=()=>page.evaluate(()=>document.body.innerText);
const klick=(re)=>page.evaluate(r=>{
  const b=[...document.querySelectorAll("button")].find(x=>new RegExp(r).test((x.innerText||"").replace(/\s+/g," ").trim()));
  if(!b||b.disabled) return false; b.click(); return true; }, re instanceof RegExp?re.source:re);
const dismiss=async()=>{ for(let k=0;k<12;k++){ const done=await page.evaluate(()=>{
  const fx=[...document.querySelectorAll("div")].filter(d=>getComputedStyle(d).position==="fixed"&&d.querySelector("button")&&d.innerText.length>30);
  for(const f of fx){ const b=[...f.querySelectorAll("button")].find(x=>/geht|Los|Verstanden|Alles klar|Fertig|Jetzt nicht|Weiter →|Überspringen|Start/i.test(x.innerText)); if(b){ b.click(); return false; } }
  return true; }); await page.waitForTimeout(400); if(done) break; } };
const zumKader = async () => {
  await page.evaluate(()=>{ const b=[...document.querySelectorAll("button")].find(x=>(x.innerText||"").trim()==="Team"); b&&b.click(); });
  await page.waitForTimeout(1400); await dismiss();
  await klick("^Spieler$"); await page.waitForTimeout(1400);
};
// Zugeteilt wird am Punkt neben dem Namen in der Kaderliste: jeder Tipp
// schaltet eine Gruppe weiter (Leistung → Reserve → Entwicklung → keine).
const punktKlick=(name)=>page.evaluate(n=>{
  const karten=[...document.querySelectorAll("div")].filter(d=>(d.innerText||"").includes(n)&&(d.innerText||"").length<200);
  for(const k of karten.reverse()){
    const sp=[...k.querySelectorAll("span")].find(x=>{ const st=getComputedStyle(x);
      return st.borderRadius==="99px"&&x.offsetWidth<=16&&x.offsetWidth>=10&&!x.innerText.trim(); });
    if(sp){ sp.click(); return true; }
  }
  return false; }, name);
const setzeGruppe=async(name,gid)=>{
  for(let i=0;i<5;i++){
    const ist=await page.evaluate(n=>{ const d=JSON.parse(localStorage.getItem("vereinsapp_v14")||"null");
      const p=(d.playerProfiles||[]).find(x=>x.name===n); return p?(p.intGrp||""):""; }, name);
    if(ist===gid) return true;
    if(!await punktKlick(name)) return false;
    await page.waitForTimeout(700);
  }
  return false; };
const profilVon=(name)=>page.evaluate(n=>{ const d=JSON.parse(localStorage.getItem("vereinsapp_v14")||"null");
  const p=(d.playerProfiles||[]).find(x=>x.name===n); return p?{intGrp:p.intGrp||""}:null; }, name);

await page.addInitScript(()=>{
  if(!localStorage.getItem("vereinsapp_config")) localStorage.setItem("vereinsapp_config", JSON.stringify({url:"https://127.0.0.1:1/x", key:"test"}));
  if(localStorage.getItem("va_simple")===null)  localStorage.setItem("va_simple","0");
  if(localStorage.getItem("va_tsimple")===null) localStorage.setItem("va_tsimple","0");
});
await page.goto("http://127.0.0.1:4337/", { waitUntil:"networkidle" }); await page.waitForTimeout(2500);
await page.evaluate(()=>{ sessionStorage.setItem("vereinsapp_v12_session", JSON.stringify({role:"trainer",cid:"demo",tids:["demo_f1"],name:"Demo Trainer",id:"demo_tr1"})); });
await page.reload({waitUntil:"networkidle"}); await page.waitForTimeout(2600); await dismiss();
await page.evaluate(()=>{ const b=[...document.querySelectorAll("button")].find(x=>/Bin dabei/.test(x.innerText)); b&&b.click(); });
await page.waitForTimeout(1500);

// Kader auf sechs Kinder bringen, damit sich zwei Mannschaften bilden lassen
const kader = await page.evaluate(()=>{
  const d=JSON.parse(localStorage.getItem("vereinsapp_v14")||"null"); if(!d) return null;
  const vorhanden=(d.playerProfiles||[]).filter(p=>p.mainTid==="demo_f1"&&!p.archived);
  const namen=vorhanden.map(p=>p.name);
  let i=1;
  while(namen.length<6){ const n="Testkind "+i;
    d.playerProfiles.push({id:"pp_lg"+i,cid:"demo",seasonId:vorhanden[0]?.seasonId,archived:false,name:n,by:2017,gender:"m",
      mainTid:"demo_f1",optTids:[],friends:[],mustWith:[],jerseyNr:String(20+i)});
    namen.push(n); i++; }
  localStorage.setItem("vereinsapp_v14", JSON.stringify(d));
  return namen;
});
if(kader&&kader.length>=6) ok(`Kader mit ${kader.length} Kindern steht`);
else { fail("Kein Kader: "+JSON.stringify(kader)); process.exit(1); }
await page.reload({waitUntil:"networkidle"}); await page.waitForTimeout(2800); await dismiss();
await zumKader();

// ===== 1) Abschnitt vorhanden und zugeklappt =====
let b=await body();
if(/🎯 Leistungsgruppen/.test(b)) ok("Auf der Team-Seite gibt es „🎯 Leistungsgruppen“");
else fail("Kein Abschnitt: "+b.slice(-400).replace(/\n/g," | "));
if(/nur Trainer/.test(b)) ok("Schon in der Kopfzeile steht „nur Trainer“");
else fail("Kein Hinweis in der Kopfzeile");
if(!/LEIBCHEN/.test(b)) ok("Zugeklappt ist die Übersicht nicht ausgeschrieben");
else fail("Steht offen da");

// ===== 2) Aufklappen =====
if(await klick("Leistungsgruppen")) ok("Der Abschnitt lässt sich aufklappen"); else fail("Nicht aufklappbar");
await page.waitForTimeout(800);
b=await body();
if(/Nur fürs Trainerteam/.test(b)&&/Kinder und Eltern sehen davon nichts/.test(b))
  ok("Oben steht unmissverständlich, dass niemand sonst das sieht");
else fail("Kein Datenschutz-Hinweis: "+b.slice(-500).replace(/\n/g," | "));
if(/Momentaufnahme/.test(b)&&/Spielzeit/.test(b)) ok("Und ein Hinweis zur Fairness – Momentaufnahme, Spielzeit für alle");
else fail("Kein Fairness-Hinweis");
if(/Leistung/.test(b)&&/Reserve/.test(b)&&/Entwicklung/.test(b)) ok("Drei Gruppen sind vorbereitet: Leistung, Reserve, Entwicklung");
else fail("Gruppen fehlen: "+b.slice(-500).replace(/\n/g," | "));

// ===== 3) Zuteilen und wieder lösen =====
if(await setzeGruppe(kader[0],"g1")) ok(`${kader[0]} lässt sich am Punkt der Gruppe „Leistung“ zuteilen`);
else fail("Zuteilen nicht möglich");
await page.waitForTimeout(600);
{ const p=await profilVon(kader[0]);
  if(p&&p.intGrp==="g1") ok("Die Zuteilung ist gespeichert");
  else fail("Nicht gespeichert: "+JSON.stringify(p)); }
await setzeGruppe(kader[1],"g1");
await setzeGruppe(kader[2],"g1");
await setzeGruppe(kader[3],"g3");
await setzeGruppe(kader[4],"g3");
await setzeGruppe(kader[5],"g3");
{ const z=await page.evaluate(()=>{ const d=JSON.parse(localStorage.getItem("vereinsapp_v14")||"null");
    const k=(d.playerProfiles||[]).filter(p=>p.mainTid==="demo_f1"&&!p.archived);
    return {g1:k.filter(p=>p.intGrp==="g1").length, g3:k.filter(p=>p.intGrp==="g3").length}; });
  if(z.g1===3&&z.g3===3) ok("Drei Kinder in „Leistung“, drei in „Entwicklung“");
  else fail("Falsche Verteilung: "+JSON.stringify(z)); }
if(await setzeGruppe(kader[0],"")) ok("Weitertippen löst die Zuteilung wieder");
else fail("Lösen klappt nicht");
await setzeGruppe(kader[0],"g1");

// ===== 4) Umbenennen =====
{ const geht=await page.evaluate(()=>{
    const sp=[...document.querySelectorAll("span")].find(x=>(x.innerText||"").trim()==="Reserve");
    if(!sp) return false; sp.click(); return true; });
  await page.waitForTimeout(600);
  if(geht){ await page.evaluate(()=>{ const i=document.querySelector("input[value], input"); });
    const getippt=await page.evaluate(()=>{
      const i=[...document.querySelectorAll("input")].find(x=>x.defaultValue==="Reserve");
      if(!i) return false;
      const set=Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype,"value").set;
      set.call(i,"Aufbau"); i.dispatchEvent(new Event("input",{bubbles:true}));
      i.dispatchEvent(new KeyboardEvent("keydown",{key:"Enter",bubbles:true})); return true; });
    await page.waitForTimeout(1200);
    const b2=await body();
    if(getippt&&/Aufbau/.test(b2)) ok("Gruppen lassen sich umbenennen (Reserve → Aufbau)");
    else fail("Umbenennen klappt nicht"); }
  else fail("Gruppenname nicht anklickbar"); }

// ===== 5) Aufstellung nach Gruppen =====
const evId = await page.evaluate(()=>{
  const d=JSON.parse(localStorage.getItem("vereinsapp_v14")||"null");
  const p=v=>String(v).padStart(2,"0"); const x=new Date(Date.now()+2*86400000);
  const ev=(d.events||[]).filter(e=>e.cid==="demo"&&e.tid==="demo_f1"&&(e.pt==="att"||!e.pt))
    .sort((a,b)=>String(a.date||"").localeCompare(String(b.date||"")))[0];
  const k=(d.playerProfiles||[]).filter(pp=>pp.mainTid==="demo_f1"&&!pp.archived).map(pp=>pp.name);
  const ts=new Date().toISOString();
  Object.assign(ev,{ type:"turnier", date:`${x.getFullYear()}-${p(x.getMonth()+1)}-${p(x.getDate())}`, time:"09:30",
    endTime:"12:00", title:"Kinderfestival", loc:"Halle", note:"", deadline:null, carpoolExtra:false, carpoolEnabled:false,
    extraPolls:[], duties:[], lineup:null, lineups:null,
    votes:Object.fromEntries(k.map(n=>[n,{val:"yes",ts,role:"player"}])) });
  (d.events||[]).filter(e=>e.cid==="demo"&&e.id!==ev.id).forEach(e=>{
    const y=new Date(Date.now()+12*86400000); e.date=`${y.getFullYear()}-${p(y.getMonth()+1)}-${p(y.getDate())}`; });
  localStorage.setItem("vereinsapp_v14", JSON.stringify(d));
  return ev.id;
});
await page.reload({waitUntil:"networkidle"}); await page.waitForTimeout(2800); await dismiss();
await page.evaluate(()=>{ const b=[...document.querySelectorAll("button")].find(x=>/^(Ansehen|✅ Anwesenheit)$/.test((x.innerText||"").trim())); b&&b.click(); });
await page.waitForTimeout(1600);
await page.evaluate(()=>{ const b=[...document.querySelectorAll("button")].find(x=>/^(⚽ Aufstellung|Aufstellung)$/.test((x.innerText||"").trim())); b&&b.click(); });
await page.waitForTimeout(1200);
if(await klick("🎯 Nach Gruppen")) ok("In der Aufstellung gibt es „🎯 Nach Gruppen“");
else fail("Kein Knopf: "+(await body()).slice(0,300).replace(/\n/g," | "));
await page.waitForTimeout(1600);
{ const ev=await page.evaluate(x=>{ const d=JSON.parse(localStorage.getItem("vereinsapp_v14")||"null");
    return (d.events||[]).find(e=>e.id===x)||null; }, evId);
  const lus=ev&&ev.lineups;
  if(lus&&lus.length===2) ok("Es entstehen zwei Mannschaften");
  else { fail("Keine zwei Mannschaften: "+JSON.stringify(lus&&lus.length)); }
  if(lus&&lus.length===2){
    const drin=t=>[...(t.T||[]),...(t.A||[]),...(t.M||[]),...(t.S||[]),...(t.E||[])];
    const grp=await page.evaluate(()=>{ const d=JSON.parse(localStorage.getItem("vereinsapp_v14")||"null");
      const o={}; (d.playerProfiles||[]).forEach(p=>{ if(p.intGrp) o[p.name]=p.intGrp; }); return o; });
    const rein=lus.every(t=>{ const g=[...new Set(drin(t).map(n=>grp[n]).filter(Boolean))]; return g.length<=1; });
    if(rein) ok("Jede Mannschaft besteht nur aus einer Gruppe – stark bei stark, Entwicklung bei Entwicklung");
    else fail("Gruppen sind vermischt");
    if(drin(lus[0]).length===3&&drin(lus[1]).length===3) ok("Alle sechs Kinder sind verteilt (3 + 3)");
    else fail("Falsche Verteilung: "+drin(lus[0]).length+" / "+drin(lus[1]).length);
    if(lus.every(t=>/^Mannschaft \d$/.test(t.name))) ok("Die Mannschaften heißen neutral („Mannschaft 1“) – kein Gruppenname im Team");
    else fail("Gruppenname im Mannschaftsnamen: "+lus.map(t=>t.name).join(", "));
  } }
{ const b2=await body();
  if(/· Leistung/.test(b2)||/· Entwicklung/.test(b2)) ok("Der Trainer sieht die Gruppe am Mannschafts-Kopf");
  else fail("Kein Gruppen-Hinweis für den Trainer: "+b2.slice(0,400).replace(/\n/g," | ")); }

// ===== 6) Eltern sehen davon nichts =====
await page.evaluate(k=>{ localStorage.setItem("va_simple","1");
  sessionStorage.setItem("vereinsapp_v12_session", JSON.stringify({role:"user",cid:"demo",tid:"demo_f1",name:k,user:k})); }, kader[0]);
await page.goto("http://127.0.0.1:4337/", { waitUntil:"networkidle" }); await page.waitForTimeout(2800); await dismiss();
{ const b2=await body();
  if(!/Leistungsgruppe/i.test(b2)&&!/· Entwicklung/.test(b2)&&!/Reserve/.test(b2))
    ok("In der Eltern-Ansicht taucht die Einteilung nicht auf");
  else fail("Einteilung bei den Eltern sichtbar: "+b2.slice(0,300).replace(/\n/g," | ")); }

if(errors.length){ console.log("JS-FEHLER:"); [...new Set(errors)].forEach(e=>console.log(" -",e.slice(0,150))); }
console.log(errors.length||fails.length?`ERGEBNIS: ${fails.length} Fehlschläge, ${errors.length} JS-Fehler`:"ERGEBNIS: ALLES OK");
await browser.close(); srv.close();
process.exit(errors.length||fails.length?1:0);
