// E2E-Test: Leistungsgruppen am Spieler, Übersicht mit Leibchen und
// Mannschaften fürs Spielchen.
//   1. An jeder Spielerkarte sitzt ein Punkt – antippen setzt die Gruppe.
//   2. Unten steht nur noch die Übersicht (wer gehört wohin).
//   3. Jede Gruppe bekommt eine Leibchenfarbe.
//   4. Im Training entstehen daraus Mannschaften aus den Zusagen.
//   5. Fehlt jemand, rückt aus der mittleren Gruppe (Reserve) jemand nach.
// Aufruf: npm run build && node scripts/test-leibchen.mjs
import { chromium } from "playwright-core";
import http from "http"; import fs from "fs"; import path from "path";
const dist = path.resolve("dist");
const srv = http.createServer((req,res)=>{ let p=path.join(dist,req.url.split("?")[0]); if(!fs.existsSync(p)||fs.statSync(p).isDirectory()) p=path.join(dist,"index.html"); res.setHeader("content-type",{".html":"text/html",".js":"text/javascript",".css":"text/css"}[path.extname(p)]||"text/plain"); res.end(fs.readFileSync(p)); }).listen(4347);
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
const grpVon=(name)=>page.evaluate(n=>{ const d=JSON.parse(localStorage.getItem("vereinsapp_v14")||"null");
  const p=(d.playerProfiles||[]).find(x=>x.name===n); return p?(p.intGrp||""):null; }, name);
// Der Gruppen-Chip in der Zeile eines Kindes
const chipKlick=(name)=>page.evaluate(n=>{
  const karten=[...document.querySelectorAll("div")].filter(d=>(d.innerText||"").includes(n)&&(d.innerText||"").length<300);
  for(const k of karten.reverse()){
    const b=[...k.querySelectorAll("button")].find(x=>/^(Gruppe\?|Leistung|Reserve|Entwicklung|Aufbau)$/.test((x.innerText||"").trim()));
    if(b){ b.click(); return (b.innerText||"").trim(); }
  }
  return null; }, name);
// Aus der geöffneten Auswahl eine Gruppe wählen
const wahlKlick=(name,gruppe)=>page.evaluate(({n,g})=>{
  const karten=[...document.querySelectorAll("div")].filter(d=>(d.innerText||"").trim().startsWith("GRUPPE"));
  const k=karten[karten.length-1]; if(!k) return false;
  const b=[...k.querySelectorAll("button")].filter(x=>(x.innerText||"").trim()===g).pop();
  if(!b) return false; b.click(); return true; },{n:name,g:gruppe});

await page.addInitScript(()=>{
  if(!localStorage.getItem("vereinsapp_config")) localStorage.setItem("vereinsapp_config", JSON.stringify({url:"https://127.0.0.1:1/x", key:"test"}));
  if(localStorage.getItem("va_simple")===null)  localStorage.setItem("va_simple","0");
  if(localStorage.getItem("va_tsimple")===null) localStorage.setItem("va_tsimple","0");
});
await page.goto("http://127.0.0.1:4347/", { waitUntil:"networkidle" }); await page.waitForTimeout(2500);
await page.evaluate(()=>{ sessionStorage.setItem("vereinsapp_v12_session", JSON.stringify({role:"trainer",cid:"demo",tids:["demo_f1"],name:"Demo Trainer",id:"demo_tr1"})); });
await page.reload({waitUntil:"networkidle"}); await page.waitForTimeout(2600); await dismiss();
await page.evaluate(()=>{ const b=[...document.querySelectorAll("button")].find(x=>/Bin dabei/.test(x.innerText)); b&&b.click(); });
await page.waitForTimeout(1500);

const kader = await page.evaluate(()=>{
  const d=JSON.parse(localStorage.getItem("vereinsapp_v14")||"null");
  const vorhanden=(d.playerProfiles||[]).filter(p=>p.mainTid==="demo_f1"&&!p.archived);
  let i=1; const namen=vorhanden.map(p=>p.name);
  while(namen.length<13){ const n="Kind "+i;
    d.playerProfiles.push({id:"pp_lb"+i,cid:"demo",seasonId:vorhanden[0]&&vorhanden[0].seasonId,archived:false,name:n,
      by:2017,gender:"m",mainTid:"demo_f1",optTids:[],friends:[],mustWith:[]});
    namen.push(n); i++; }
  (d.playerProfiles||[]).filter(p=>p.mainTid==="demo_f1").forEach(p=>{ p.intGrp=""; });
  localStorage.setItem("vereinsapp_v14", JSON.stringify(d));
  return namen.slice(0,13);
});
if(kader&&kader.length===13) ok("Kader mit 13 Kindern steht");
else { fail("Kader nicht vorbereitet"); process.exit(1); }
await page.reload({waitUntil:"networkidle"}); await page.waitForTimeout(2800); await dismiss();
await zumKader();

// ===== 1) Gruppen-Chip an der Spielerkarte =====
{ const beschriftung=await chipKlick(kader[0]);
  if(beschriftung==="Gruppe?") ok("An der Spielerkarte steht „Gruppe?“ – man sieht, dass hier etwas einzustellen ist");
  else fail("Kein beschrifteter Chip: "+beschriftung);
  await page.waitForTimeout(700);
  const b2=await body();
  if(/GRUPPE/.test(b2)&&/Leistung/.test(b2)&&/keine/.test(b2))
    ok("Ein Tipp öffnet die Auswahl mit allen Gruppen und „keine“");
  else fail("Keine Auswahl: "+b2.slice(0,400).replace(/\n/g," | ")); }
if(await wahlKlick(kader[0],"Reserve")) ok("Die Gruppe lässt sich direkt auswählen"); else fail("Auswahl nicht klickbar");
await page.waitForTimeout(1100);
{ const g=await grpVon(kader[0]);
  if(g==="g2") ok(`Gewählt ist genau die angetippte Gruppe (${kader[0]} → Reserve)`);
  else fail("Falsche Gruppe: "+g); }
{ const beschriftung=await page.evaluate(n=>{
    const karten=[...document.querySelectorAll("div")].filter(d=>(d.innerText||"").includes(n)&&(d.innerText||"").length<300);
    for(const k of karten.reverse()){
      const b=[...k.querySelectorAll("button")].find(x=>/^(Gruppe\?|Leistung|Reserve|Entwicklung)$/.test((x.innerText||"").trim()));
      if(b) return (b.innerText||"").trim(); }
    return null; }, kader[0]);
  if(beschriftung==="Reserve") ok("Danach steht die Gruppe am Chip – ohne die Karte zu öffnen");
  else fail("Chip zeigt die Gruppe nicht: "+beschriftung); }

// ===== 2+3) Übersicht mit Leibchen =====
if(await klick("🎯 Leistungsgruppen")) ok("Unten gibt es die Übersicht"); else fail("Keine Übersicht");
await page.waitForTimeout(800);
let b=await body();
if(/Zuteilen kannst du oben an der Spielerkarte/.test(b)) ok("Sie erklärt, dass zugeteilt oben wird – der lange Zuteil-Block ist weg");
else fail("Kein Hinweis auf die Karte: "+b.slice(-500).replace(/\n/g," | "));
if(/MANNSCHAFT 1/.test(b)&&/MANNSCHAFT 2/.test(b)) ok("Jede Gruppe hat zwei Leibchenfarben – eine je Mannschaft");
else fail("Keine zwei Leibchen: "+b.slice(-500).replace(/\n/g," | "));
if(/OHNE GRUPPE \(12\)/.test(b)) ok("Und sie zeigt, wer noch keiner Gruppe zugeteilt ist (12)");
else fail("Keine Ohne-Gruppe-Liste: "+(b.match(/OHNE GRUPPE[^\n]*/)||[""])[0]);
{ const geklickt=await page.evaluate(()=>{ const b2=[...document.querySelectorAll('button[aria-label="Mannschaft 2 Gelb"]')][0];
    if(!b2) return false; b2.click(); return true; });
  await page.waitForTimeout(1100);
  const g=await page.evaluate(()=>{ const d=JSON.parse(localStorage.getItem("vereinsapp_v14")||"null");
    const t=(d.teams||[]).find(x=>x.id==="demo_f1"); return (t&&t.intGroups&&t.intGroups[0])||null; });
  if(geklickt&&g&&g.leibB==="gelb") ok("Die zweite Mannschaft bekommt ihre eigene Farbe (Gelb) – gespeichert");
  else fail("Leibchen nicht gespeichert: "+JSON.stringify(g)); }

// ===== 4+5) Spielchen im Training =====
// 13 Zusagen: Leistung 6, Entwicklung 6, einer ohne Gruppe.
// Erwartung: Leistung spielt gegen sich selbst (3 gegen 3),
// Entwicklung ebenso. Niemand wechselt die Gruppe.
const trId = await page.evaluate(k=>{
  const d=JSON.parse(localStorage.getItem("vereinsapp_v14")||"null");
  const p=v=>String(v).padStart(2,"0"); const x=new Date(Date.now()+2*86400000);
  const zu={}; k.slice(0,6).forEach(n=>zu[n]="g1"); k.slice(6,12).forEach(n=>zu[n]="g3");
  (d.playerProfiles||[]).filter(q=>q.mainTid==="demo_f1").forEach(q=>{ q.intGrp=zu[q.name]||""; });
  const ev=(d.events||[]).filter(e=>e.cid==="demo"&&e.tid==="demo_f1")[0];
  const ts=new Date().toISOString();
  Object.assign(ev,{ type:"training", date:`${x.getFullYear()}-${p(x.getMonth()+1)}-${p(x.getDate())}`, time:"17:30",
    endTime:"19:00", title:"Training", loc:"Platz", note:"", deadline:null, extraPolls:[], duties:[],
    votes:Object.fromEntries(k.map(n=>[n,{val:"yes",ts,role:"player"}])) });
  (d.events||[]).filter(e=>e.cid==="demo"&&e.id!==ev.id).forEach(e=>{
    const y=new Date(Date.now()+12*86400000); e.date=`${y.getFullYear()}-${p(y.getMonth()+1)}-${p(y.getDate())}`; });
  localStorage.setItem("vereinsapp_v14", JSON.stringify(d));
  return ev.id; }, kader);
await page.reload({waitUntil:"networkidle"}); await page.waitForTimeout(2800); await dismiss();
await page.evaluate(()=>{ const b=[...document.querySelectorAll("button")].find(x=>/^(Ansehen|✅ Anwesenheit)$/.test((x.innerText||"").trim())); b&&b.click(); });
await page.waitForTimeout(1700);
const block=()=>page.evaluate(()=>{ const t=document.body.innerText; const i=t.indexOf("🎽");
  if(i<0) return "";
  const rest=t.slice(i); const e=rest.indexOf("Spieler dabei");
  return e<0?rest.slice(0,1200):rest.slice(0,e); });
b=await body();
if(/Spielchen/.test(b)) ok("Im Training steht das Spielchen");
else fail("Kein Spielchen: "+b.slice(0,400).replace(/\n/g," | "));
{ const bl=await block();
  if(/Jede Gruppe spielt gegen sich selbst/.test(bl)) ok("Die Regel steht dabei: jede Gruppe spielt gegen sich selbst");
  else fail("Regel fehlt: "+bl.slice(0,300).replace(/\n/g," | "));
  // Zwei Paarungen: Leistung und Entwicklung
  const pLeistung=(bl.match(/Leistung/g)||[]).length;
  if(/Leistung/.test(bl)&&/Entwicklung/.test(bl)) ok("Es gibt eine Paarung für Leistung und eine für Entwicklung");
  else fail("Nicht beide Paarungen: "+bl.slice(0,400).replace(/\n/g," | "));
  if(/3 gegen 3/.test(bl)) ok("Jede Gruppe teilt sich in zwei Mannschaften (3 gegen 3)");
  else fail("Keine Zweiteilung: "+(bl.match(/\d+ gegen \d+/g)||[]).join(", "));
  { const ungleich=(bl.match(/(\d+) gegen (\d+)/g)||[]).filter(x=>{ const m=x.match(/(\d+) gegen (\d+)/); return m[1]!==m[2]; });
    if(ungleich.length===0) ok("Beide Seiten sind immer gleich groß");
    else fail("Ungleiche Seiten: "+ungleich.join(", ")); }
  { const ohneTW=/ohne Torwart/.test(bl), hatTorZeile=/\nTOR\n/.test(bl);
    if(!(ohneTW&&hatTorZeile)) ok("Kein Widerspruch zwischen „ohne Torwart“ und einer Tor-Linie");
    else fail("„ohne Torwart“, aber eine Tor-Linie steht da"); }
  if(/vs/.test(bl)) ok("Die beiden Seiten stehen sich gegenüber");
  else fail("Kein Gegenüber");
  { const fehlen=kader.filter(n=>!bl.includes(n));
    if(fehlen.length===0) ok("Jedes Kind mit Zusage taucht auf – auch die ohne Gruppe");
    else fail("Kinder fallen weg: "+fehlen.join(", ")); } }
// Die Seiten tragen verschiedene Leibchen
{ const farben=await page.evaluate(()=>{ const t=document.body.innerText; const i=t.indexOf("🎽");
    const bl=t.slice(i,i+1200);
    return ["Rot","Blau","Grün","Gelb","Orange","Schwarz"].filter(f=>new RegExp("\\n"+f+"\\n").test(bl)); });
  if(farben.length>=2) ok("Die Mannschaften tragen unterschiedliche Leibchen: "+farben.join(", "));
  else fail("Keine zwei Leibchen: "+JSON.stringify(farben)); }
// Aufstellung wie im Spiel: Linien statt bloßer Namensliste
{ const bl=await block();
  if(/ABWEHR|MITTELFELD|ANGRIFF|TOR/.test(bl)) ok("Dargestellt wie die Aufstellung im Spiel – mit Linien");
  else fail("Keine Linien: "+bl.slice(0,400).replace(/\n/g," | ")); }
// Kein Gruppenwechsel
{ const bl=await block();
  const leistungsKinder=kader.slice(0,6);
  const iL=bl.indexOf("Leistung"), iE=bl.indexOf("Entwicklung");
  const entwBlock = iE<0 ? "" : (iE>iL ? bl.slice(iE) : bl.slice(iE, iL));
  const verirrt=leistungsKinder.filter(n=>entwBlock.includes(n));
  if(verirrt.length===0) ok("Kein Kind aus der Leistungsgruppe taucht bei Entwicklung auf");
  else fail("Gruppe gewechselt: "+verirrt.join(", ")+" || "+entwBlock.slice(0,220).replace(/\n/g," | ")); }
// Spielform passend zur Jugend
{ const bl=await block();
  if(/passend zur F-Jugend/.test(bl)) ok("Ohne eigene Wahl richtet sich die Spielform nach der Altersklasse (F-Jugend)");
  else fail("Keine Altersklasse berücksichtigt: "+bl.slice(0,300).replace(/\n/g," | ")); }
// Spielform wirkt
{ if(await klick("^4\\+1 / 5$")) ok("Die Spielform lässt sich umstellen"); else fail("4+1 nicht klickbar");
  await page.waitForTimeout(1300);
  const ev=await page.evaluate(x=>{ const d=JSON.parse(localStorage.getItem("vereinsapp_v14")||"null");
    return (d.events||[]).find(e=>e.id===x)||null; }, trId);
  if(ev&&ev.spielGr===5) ok("Die Wahl ist am Termin gespeichert");
  else fail("Spielform nicht gespeichert: "+(ev&&ev.spielGr)); }
// Gleiche Einteilung beim erneuten Öffnen
{ const vorher=await block();
  await page.reload({waitUntil:"networkidle"}); await page.waitForTimeout(2800); await dismiss();
  await page.evaluate(()=>{ const b2=[...document.querySelectorAll("button")].find(x=>/^(Ansehen|✅ Anwesenheit)$/.test((x.innerText||"").trim())); b2&&b2.click(); });
  await page.waitForTimeout(1700);
  const nachher=await block();
  if(vorher&&vorher===nachher) ok("Beim erneuten Öffnen steht dieselbe Einteilung da");
  else fail("Einteilung springt bei jedem Öffnen"); }

// ===== 6) Einteilung festhalten =====
{ const vorher=await block();
  if(await klick("📌 Festhalten")) ok("Es gibt „📌 Festhalten“"); else fail("Kein Festhalten-Knopf");
  await page.waitForTimeout(1300);
  const ev=await page.evaluate(x=>{ const d=JSON.parse(localStorage.getItem("vereinsapp_v14")||"null");
    return (d.events||[]).find(e=>e.id===x)||null; }, trId);
  if(ev&&ev.spielFest&&ev.spielFest.paarungen&&ev.spielFest.paarungen.length===2)
    ok("Die Einteilung ist am Termin gespeichert (2 Paarungen)");
  else fail("Nicht gespeichert: "+JSON.stringify(ev&&ev.spielFest&&ev.spielFest.paarungen&&ev.spielFest.paarungen.length));
  const nachher=await block();
  if(/festgehalten/.test(nachher)) ok("Und als festgehalten gekennzeichnet");
  else fail("Keine Kennzeichnung: "+nachher.slice(0,200).replace(/\n/g," | ")); }

// Auch nach Neuladen steht dieselbe Einteilung - und zwar die festgehaltene
{ const vorher=await block();
  await page.reload({waitUntil:"networkidle"}); await page.waitForTimeout(2800); await dismiss();
  await page.evaluate(()=>{ const b2=[...document.querySelectorAll("button")].find(x=>/^(Ansehen|✅ Anwesenheit)$/.test((x.innerText||"").trim())); b2&&b2.click(); });
  await page.waitForTimeout(1700);
  const nachher=await block();
  if(vorher===nachher) ok("Nach dem Neuladen steht exakt dieselbe Einteilung da");
  else fail("Einteilung hat sich geändert"); }

// Kommt eine Zusage dazu, weist er darauf hin
{ await page.evaluate(x=>{ const d=JSON.parse(localStorage.getItem("vereinsapp_v14")||"null");
    const ev=(d.events||[]).find(e=>e.id===x);
    ev.votes["Spät Zusager"]={val:"yes",ts:new Date().toISOString(),role:"player"};
    d.playerProfiles.push({id:"pp_spaet",cid:"demo",archived:false,name:"Spät Zusager",by:2017,gender:"m",
      mainTid:"demo_f1",optTids:[],friends:[],mustWith:[],intGrp:"g1"});
    localStorage.setItem("vereinsapp_v14", JSON.stringify(d)); }, trId);
  await page.reload({waitUntil:"networkidle"}); await page.waitForTimeout(2800); await dismiss();
  await page.evaluate(()=>{ const b2=[...document.querySelectorAll("button")].find(x=>/^(Ansehen|✅ Anwesenheit)$/.test((x.innerText||"").trim())); b2&&b2.click(); });
  await page.waitForTimeout(1700);
  const bl=await block();
  if(/Zusagen haben sich geändert/.test(bl)&&/1 dazu/.test(bl))
    ok("Kommt jemand dazu, weist er darauf hin statt still falsch zu bleiben");
  else fail("Kein Hinweis auf die geänderten Zusagen: "+bl.slice(0,300).replace(/\n/g," | "));
  if(await klick("Neu einteilen")) ok("Und bietet an, neu einzuteilen"); else fail("Kein Neu-Einteilen");
  await page.waitForTimeout(1300);
  const bl2=await block();
  if(!/festgehalten/.test(bl2)&&/Spät Zusager/.test(bl2)) ok("Danach ist der Nachzügler dabei");
  else fail("Nachzügler fehlt: "+bl2.slice(0,300).replace(/\n/g," | ")); }

if(errors.length){ console.log("JS-FEHLER:"); [...new Set(errors)].forEach(e=>console.log(" -",e.slice(0,150))); }
console.log(errors.length||fails.length?`ERGEBNIS: ${fails.length} Fehlschläge, ${errors.length} JS-Fehler`:"ERGEBNIS: ALLES OK");
await browser.close(); srv.close();
process.exit(errors.length||fails.length?1:0);
