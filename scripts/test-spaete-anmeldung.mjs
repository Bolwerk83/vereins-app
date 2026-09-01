// E2E-Test: Zwei Dinge am Termin.
//  1) Der Trainer sieht in den Rückmeldungen, WER hilft (Helfer-Liste mit Zeit).
//  2) Nach Ablauf der Frist kann man sich noch anmelden - aber nur mit Grund,
//     und der Trainer sieht diesen Grund.
// Aufruf: npm run build && node scripts/test-spaete-anmeldung.mjs
import { chromium } from "playwright-core";
import http from "http"; import fs from "fs"; import path from "path";
const dist = path.resolve("dist");
const srv = http.createServer((req,res)=>{ let p=path.join(dist,req.url.split("?")[0]); if(!fs.existsSync(p)||fs.statSync(p).isDirectory()) p=path.join(dist,"index.html"); res.setHeader("content-type",{".html":"text/html",".js":"text/javascript",".css":"text/css"}[path.extname(p)]||"text/plain"); res.end(fs.readFileSync(p)); }).listen(4273);
const exe=process.env.PLAYWRIGHT_CHROMIUM||"/opt/pw-browsers/chromium-1194/chrome-linux/chrome";
const browser = await chromium.launch({ executablePath:exe, args:["--no-sandbox"] });
const page = await browser.newPage({ viewport:{ width:390, height:900 } });
const errors=[]; const fails=[];
page.on("pageerror", e=>errors.push(e.message));
page.on("dialog", d=>d.accept());
const fail=m=>{ fails.push(m); console.log("FEHLGESCHLAGEN:", m); };
const ok=m=>console.log("OK:", m);
const body=()=>page.evaluate(()=>document.body.innerText);
const clickTxt=re=>page.evaluate(r=>{ const b=[...document.querySelectorAll("button")].find(x=>new RegExp(r).test(x.innerText||"")); if(!b) return false; b.click(); return true; },re instanceof RegExp?re.source:re);
const dismiss=async()=>{ for(let k=0;k<12;k++){ const done=await page.evaluate(()=>{
  const fx=[...document.querySelectorAll("div")].filter(d=>getComputedStyle(d).position==="fixed"&&d.querySelector("button")&&d.innerText.length>30);
  for(const f of fx){ const b=[...f.querySelectorAll("button")].find(x=>/geht|Los|Verstanden|Alles klar|Fertig|Jetzt nicht|Weiter →|Überspringen|Start/i.test(x.innerText)); if(b){ b.click(); return false; } }
  return true; }); await page.waitForTimeout(400); if(done) break; } };
// Nur setzen, was noch fehlt - das Skript laeuft bei JEDEM Laden erneut und
// wuerde eine spaeter gesetzte Ansicht sonst wieder ueberschreiben.
await page.addInitScript(()=>{
  if(!localStorage.getItem("vereinsapp_config")) localStorage.setItem("vereinsapp_config", JSON.stringify({url:"https://127.0.0.1:1/x", key:"test"}));
  if(localStorage.getItem("va_simple")===null)  localStorage.setItem("va_simple","0");
  if(localStorage.getItem("va_tsimple")===null) localStorage.setItem("va_tsimple","0");
});

// ===== Trainer anmelden und Daten lokal erzeugen =====
await page.goto("http://127.0.0.1:4273/", { waitUntil:"networkidle" }); await page.waitForTimeout(2500);
await page.evaluate(()=>{ sessionStorage.setItem("vereinsapp_v12_session", JSON.stringify({role:"trainer",cid:"demo",tids:["demo_f1"],name:"Demo Trainer",id:"demo_tr1"})); });
await page.reload({waitUntil:"networkidle"}); await page.waitForTimeout(2600); await dismiss();
await page.evaluate(()=>{ const b=[...document.querySelectorAll("button")].find(x=>/Bin dabei/.test(x.innerText)); b&&b.click(); });
await page.waitForTimeout(1400);

// Frist auf gestern, Helfer eintragen, ein Kind ohne Antwort lassen
let titel="";
const kind = await page.evaluate(()=>{
  const d=JSON.parse(localStorage.getItem("vereinsapp_v14")||"null"); if(!d) return null;
  // Den zeitlich naechsten Termin nehmen - der steht in der Liste ganz oben.
  const ev=(d.events||[]).filter(e=>e.cid==="demo"&&e.tid==="demo_f1"&&(e.pt==="att"||!e.pt))
    .sort((a,b)=>String(a.date||"").localeCompare(String(b.date||"")))[0]; if(!ev) return null;
  const kader=[...new Set([...((d.players||{})["demo_f1"]||[]),
    ...((d.playerProfiles||[]).filter(pp=>pp.mainTid==="demo_f1"&&!pp.archived).map(pp=>pp.name))])];
  const wer=kader[0]; if(!wer) return null;
  const g=new Date(Date.now()-86400000);
  const pad=x=>String(x).padStart(2,"0");
  ev.deadline={date:`${g.getFullYear()}-${pad(g.getMonth()+1)}-${pad(g.getDate())}`,time:"18:00"};
  const v={...(ev.votes||{})}; delete v[wer]; ev.votes=v;      // dieses Kind hat noch nicht geantwortet
  ev.staffTarget=2;
  ev.helferNote="Grillstand und Aufbau";
  ev.helperOffers=[{id:"h1",name:"Petra Helferin",ts:"2026-08-20T09:15:00.000Z"},
                   {id:"h2",name:"Uwe Packan",ts:"2026-08-21T17:40:00.000Z"},
                   {id:"h3",name:"Wartel Ist",ts:"2026-08-22T08:05:00.000Z"}];
  ev.helperInterest=[{id:"h4",name:"Bea Bereit",ts:"2026-08-23T11:22:00.000Z"}];
  // Zu jedem Helfer gehoert ein Konto - sonst raeumt die App verwaiste
  // Eintraege (zu Recht) wieder weg.
  const hs=(d.helpers||[]).filter(h=>!["h1","h2","h3","h4"].includes(h.id));
  d.helpers=[...hs,
    {id:"h1",cid:"demo",name:"Petra Helferin",tids:["demo_f1"]},
    {id:"h2",cid:"demo",name:"Uwe Packan",tids:["demo_f1"]},
    {id:"h3",cid:"demo",name:"Wartel Ist",tids:["demo_f1"]},
    {id:"h4",cid:"demo",name:"Bea Bereit",tids:["demo_f1"]}];
  localStorage.setItem("vereinsapp_v14", JSON.stringify(d));
  return wer+"|"+(ev.title||ev.opp||"");
});
if(kind){ titel=String(kind).split("|")[1]||""; }
const kindName=kind?String(kind).split("|")[0]:null;
if(kind) ok("Testdaten gesetzt (Frist gestern, Helfer eingetragen), Kind: "+kindName+" / Termin: "+titel);
else fail("Konnte keine Testdaten setzen");
await page.reload({waitUntil:"networkidle"}); await page.waitForTimeout(2800); await dismiss();

// ===== 1) Helfer-Liste in den Rückmeldungen =====
const zumTermin=async()=>{
  await page.evaluate(()=>{ const b=[...document.querySelectorAll("button")].find(x=>/^(Ansehen|✅ Anwesenheit)$/.test((x.innerText||"").trim())); b&&b.click(); });
  await page.waitForTimeout(1500);
  await page.evaluate(()=>{ const b=[...document.querySelectorAll("button")].find(x=>/^(📊 Rückmeldungen|Rückmeldungen)$/.test((x.innerText||"").trim())); b&&b.click(); });
  await page.waitForTimeout(900);
};
await zumTermin();
let b=await body();
if(/🙋 HELFER/.test(b)) ok("Die Helfer-Liste ist da: "+(b.match(/🙋 HELFER[^\n]*/)||[""])[0]);
else fail("Keine Helfer-Liste in den Rückmeldungen: "+b.slice(0,240).replace(/\n/g," | "));
if(/Petra Helferin/.test(b)&&/Uwe Packan/.test(b)) ok("Man sieht, wer fest mithilft");
else fail("Feste Helfer fehlen");
if(/hilft mit/.test(b)) ok("Mit klarem Status „hilft mit“"); else fail("Kein Helfer-Status");
if(/Warteliste/.test(b)&&/Wartel Ist/.test(b)) ok("Die Warteliste steht getrennt darunter"); else fail("Keine Warteliste");
if(/wäre bereit/.test(b)&&/Bea Bereit/.test(b)) ok("Wer nur bereit wäre, steht auch drin"); else fail("„Bereit“-Liste fehlt");
if(/Grillstand und Aufbau/.test(b)) ok("Wofür geholfen wird, steht dabei"); else fail("Helfer-Notiz fehlt");
{ const kopf=await page.evaluate(()=>{
    const alle=[...document.querySelectorAll("div")].filter(d=>/^🙋 HELFER/.test((d.innerText||"").trim()));
    const k=alle[alle.length-1];   // innerste Überschrift, nicht der Rahmen darum
    if(!k) return null; return [...k.parentElement.children].map(r=>(r.innerText||"").replace(/\n/g," ").trim()); });
  const mitZeit=(kopf||[]).filter(z=>/\d\d\.\d\d\. · \d\d:\d\d Uhr/.test(z));
  if(mitZeit.length>=3) ok("Bei jedem Helfer steht, wann er zugesagt hat: "+mitZeit[0]);
  else fail("Zeitpunkt bei den Helfern fehlt: "+JSON.stringify(kopf||[]).slice(0,220)); }

// ===== 2) Eltern: Anmeldung nach Frist nur mit Grund =====
await page.evaluate(()=>{ sessionStorage.clear(); localStorage.removeItem("va_teamok_demo_f1"); });
await page.evaluate(k=>{ sessionStorage.setItem("vereinsapp_v12_session", JSON.stringify({role:"user",cid:"demo",tid:"demo_f1",name:k,user:k})); }, kindName);
await page.goto("http://127.0.0.1:4273/", { waitUntil:"networkidle" }); await page.waitForTimeout(2800); await dismiss();
b=await body();
if(/Frist abgelaufen/.test(b)) ok("Die Eltern sehen, dass die Frist um ist");
else fail("Kein Frist-Hinweis in der Elternansicht: "+b.slice(0,240).replace(/\n/g," | "));
// „Bin dabei“ antippen -> es muss nach dem Grund fragen, nicht sofort speichern
await page.evaluate(()=>{ const d=[...document.querySelectorAll("div")].find(x=>/ist dabei$/.test((x.innerText||"").trim())&&x.innerText.length<40); if(d){ (d.closest("div[style]")||d).click(); return; }
  const s=[...document.querySelectorAll("span")].find(x=>/ist dabei|Ich bin dabei/.test((x.innerText||"").trim())); s&&s.parentElement&&s.parentElement.parentElement&&s.parentElement.parentElement.click(); });
await page.waitForTimeout(1100);
b=await body();
if(/Warum war eine frühere Anmeldung nicht möglich/.test(b)) ok("Vor dem Anmelden wird gefragt, warum es früher nicht ging");
else fail("Es wird nicht nach dem Grund gefragt: "+b.slice(0,300).replace(/\n/g," | "));
{ const gespeichert=await page.evaluate(k=>{
    const d=JSON.parse(localStorage.getItem("vereinsapp_v14")||"null");
    const ev=(d.events||[]).filter(e=>e.cid==="demo"&&e.tid==="demo_f1"&&(e.pt==="att"||!e.pt))
      .sort((a,b)=>String(a.date||"").localeCompare(String(b.date||"")))[0];
    return !!(ev&&(ev.votes||{})[k]); }, kindName);
  if(!gespeichert) ok("Ohne Grund wird noch nichts gespeichert"); else fail("Zusage wurde ohne Grund gespeichert"); }
await clickTxt("War krank"); await page.waitForTimeout(1400);
{ const eintrag=await page.evaluate(k=>{
    const d=JSON.parse(localStorage.getItem("vereinsapp_v14")||"null");
    const ev=(d.events||[]).filter(e=>e.cid==="demo"&&e.tid==="demo_f1"&&(e.pt==="att"||!e.pt))
      .sort((a,b)=>String(a.date||"").localeCompare(String(b.date||"")))[0];
    return ev?((ev.votes||{})[k]||null):null; }, kindName);
  if(eintrag&&eintrag.val==="yes") ok("Mit Grund klappt die Anmeldung nach der Frist");
  else fail("Anmeldung nicht gespeichert: "+JSON.stringify(eintrag));
  if(eintrag&&eintrag.reason==="War krank") ok("Der Grund wird mitgespeichert: "+eintrag.reason);
  else fail("Kein Grund gespeichert: "+JSON.stringify(eintrag));
  if(eintrag&&eintrag.lateChange) ok("Und ist als Änderung nach Frist markiert"); else fail("Nicht als späte Änderung markiert");
  if(eintrag&&eintrag.needsOk) ok("Die Anmeldung wartet auf die Freigabe des Trainers"); else fail("Kein Freigabe-Bedarf gesetzt"); }
b=await body();
if(/liegt beim Trainer/.test(b)) ok("Die Eltern sehen, dass der Trainer noch freigeben muss");
else fail("Kein Hinweis auf die ausstehende Freigabe: "+b.slice(0,240).replace(/\n/g," | "));
b=await body();
if(/Späte Anmeldung erfasst/.test(b)) ok("Die Eltern bekommen eine klare Rückmeldung"); else console.log("HINWEIS: Toast schon wieder weg");

// ===== 3) Der Trainer sieht die späte Anmeldung samt Grund =====
await page.evaluate(()=>{ sessionStorage.setItem("vereinsapp_v12_session", JSON.stringify({role:"trainer",cid:"demo",tids:["demo_f1"],name:"Demo Trainer",id:"demo_tr1"})); });
await page.reload({waitUntil:"networkidle"}); await page.waitForTimeout(2800); await dismiss();
await zumTermin();
b=await body();
if(/NACH FRIST GEÄNDERT/.test(b)) ok("Der Trainer hat einen eigenen Block dafür");
else fail("Kein Block „Nach Frist geändert“: "+b.slice(0,260).replace(/\n/g," | "));
if(new RegExp(String(kindName||"").replace(/[.*+?^${}()|[\]\\]/g,"\\$&")).test(b)) ok("Das Kind steht namentlich drin"); else fail("Kind fehlt im Block");
if(/nachgemeldet/.test(b)&&/War krank/.test(b)) ok("Mit Grund und Status: "+(b.match(/nachgemeldet[^\n]*/)||[""])[0]);
else fail("Grund fehlt beim Trainer: "+b.slice(b.indexOf("NACH FRIST"), b.indexOf("NACH FRIST")+220).replace(/\n/g," | "));
if(/bestätigen oder ablehnen/.test(b)) ok("Der Trainer wird zum Bestätigen aufgefordert");
else fail("Kein Hinweis zum Bestätigen beim Trainer");
if(/1 offen/.test(b)) ok("Die Überschrift zählt die offenen Punkte mit: "+(b.match(/NACH FRIST GEÄNDERT[^\n]*/)||[""])[0]);
else fail("Zähler für offene Punkte fehlt");
// Freigeben
{ const knoepfe=await page.evaluate(()=>{
    const alle=[...document.querySelectorAll("div")].filter(d=>/^⏰ NACH FRIST/.test((d.innerText||"").trim()));
    const box=alle[alle.length-1]; if(!box) return null;
    return [...box.parentElement.querySelectorAll("button")].map(x=>(x.innerText||"").trim()); });
  if(knoepfe&&knoepfe.includes("✓ Bestätigen")&&knoepfe.includes("✕ Ablehnen")) ok("Bestätigen und Ablehnen stehen direkt am Eintrag");
  else fail("Knöpfe fehlen am Eintrag: "+JSON.stringify(knoepfe)); }
{ const geklickt=await page.evaluate(()=>{ const b=[...document.querySelectorAll("button")].find(x=>(x.innerText||"").trim()==="✓ Bestätigen"); if(!b) return false; b.click(); return true; });
  if(geklickt) ok("Der Trainer kann bestätigen"); else fail("Kein Bestätigen-Knopf im Block"); }
await page.waitForTimeout(1400);
{ const eintrag=await page.evaluate(k=>{
    const d=JSON.parse(localStorage.getItem("vereinsapp_v14")||"null");
    const ev=(d.events||[]).filter(e=>e.cid==="demo"&&e.tid==="demo_f1"&&(e.pt==="att"||!e.pt))
      .sort((a,b)=>String(a.date||"").localeCompare(String(b.date||"")))[0];
    return ev?((ev.votes||{})[k]||null):null; }, kindName);
  if(eintrag&&!eintrag.needsOk&&eintrag.okAt) ok("Nach dem Bestätigen ist vermerkt, wer wann entschieden hat: "+eintrag.okBy);
  else fail("Bestätigung nicht gespeichert: "+JSON.stringify(eintrag)); }
b=await body();
if(/✓ bestätigt/.test(b)) ok("Der Block zeigt die Bestätigung an"); else fail("Bestätigung wird nicht angezeigt");
if(!/1 offen/.test(b)) ok("Und der Zähler ist wieder auf null"); else fail("Zähler bleibt offen");

// ===== 3b) Alte Einträge ohne Freigabe-Merker lassen sich auch entscheiden =====
// Vor der Freigabe-Funktion angelegte Änderungen haben kein needsOk. Auch die
// muss der Trainer bestätigen oder ablehnen können.
await page.evaluate(()=>{
  const d=JSON.parse(localStorage.getItem("vereinsapp_v14")||"null");
  const ev=(d.events||[]).filter(e=>e.cid==="demo"&&e.tid==="demo_f1"&&(e.pt==="att"||!e.pt))
    .sort((a,b)=>String(a.date||"").localeCompare(String(b.date||"")))[0];
  ev.votes={...(ev.votes||{}), "Zinedin S.":{val:"yes",ts:"2026-08-31T18:08:00.000Z",lateChange:true}};
  localStorage.setItem("vereinsapp_v14", JSON.stringify(d));
});
await page.reload({waitUntil:"networkidle"}); await page.waitForTimeout(2800); await dismiss();
await zumTermin();
b=await body();
if(/Zinedin S\./.test(b)&&/1 offen/.test(b)) ok("Auch ein alter Eintrag ohne Merker gilt als offen");
else fail("Alter Eintrag nicht als offen erkannt: "+(b.match(/NACH FRIST GEÄNDERT[^\n]*/)||[""])[0]);
{ const geklickt=await page.evaluate(()=>{ const b=[...document.querySelectorAll("button")].find(x=>(x.innerText||"").trim()==="✓ Bestätigen"); if(!b) return false; b.click(); return true; });
  if(geklickt) ok("Und lässt sich genauso bestätigen"); else fail("Kein Bestätigen-Knopf beim alten Eintrag"); }
await page.waitForTimeout(1400);
{ const eintrag=await page.evaluate(()=>{
    const d=JSON.parse(localStorage.getItem("vereinsapp_v14")||"null");
    const ev=(d.events||[]).filter(e=>e.cid==="demo"&&e.tid==="demo_f1"&&(e.pt==="att"||!e.pt))
      .sort((a,b)=>String(a.date||"").localeCompare(String(b.date||"")))[0];
    return ev?((ev.votes||{})["Zinedin S."]||null):null; });
  if(eintrag&&eintrag.okAt) ok("Die Entscheidung ist gespeichert"); else fail("Alter Eintrag nicht bestätigt: "+JSON.stringify(eintrag)); }

// ===== 4) Auch in der einfachen Eltern-Ansicht wird nach dem Grund gefragt =====
await page.evaluate(k=>{
  const d=JSON.parse(localStorage.getItem("vereinsapp_v14")||"null");
  const ev=(d.events||[]).filter(e=>e.cid==="demo"&&e.tid==="demo_f1"&&(e.pt==="att"||!e.pt))
    .sort((a,b)=>String(a.date||"").localeCompare(String(b.date||"")))[0];
  const v={...(ev.votes||{})}; delete v[k]; ev.votes=v;      // Antwort zuruecksetzen
  localStorage.setItem("vereinsapp_v14", JSON.stringify(d));
  localStorage.setItem("va_simple","1");
  sessionStorage.setItem("vereinsapp_v12_session", JSON.stringify({role:"user",cid:"demo",tid:"demo_f1",name:k,user:k}));
}, kindName);
await page.reload({waitUntil:"networkidle"}); await page.waitForTimeout(2800); await dismiss();
b=await body();
if(/JA/.test(b)) ok("Die einfache Ansicht ist offen"); else fail("Einfache Ansicht fehlt: "+b.slice(0,220).replace(/\n/g," | "));
await clickTxt("✅ JA"); await page.waitForTimeout(1000);
b=await body();
if(/warum war eine frühere Anmeldung nicht möglich/i.test(b)) ok("Auch hier wird zuerst nach dem Grund gefragt");
else fail("Einfache Ansicht fragt nicht nach dem Grund: "+b.slice(0,260).replace(/\n/g," | "));
await clickTxt("Anderer Termin abgesagt"); await page.waitForTimeout(1300);
{ const eintrag=await page.evaluate(k=>{
    const d=JSON.parse(localStorage.getItem("vereinsapp_v14")||"null");
    const ev=(d.events||[]).filter(e=>e.cid==="demo"&&e.tid==="demo_f1"&&(e.pt==="att"||!e.pt))
      .sort((a,b)=>String(a.date||"").localeCompare(String(b.date||"")))[0];
    return ev?((ev.votes||{})[k]||null):null; }, kindName);
  if(eintrag&&eintrag.val==="yes"&&eintrag.reason==="Anderer Termin abgesagt") ok("Mit Grund wird auch hier gespeichert: "+eintrag.reason);
  else fail("Einfache Ansicht speichert nicht richtig: "+JSON.stringify(eintrag)); }

if(errors.length){ console.log("JS-FEHLER:"); [...new Set(errors)].forEach(e=>console.log(" -",e.slice(0,150))); }
console.log(errors.length||fails.length?`ERGEBNIS: ${fails.length} Fehlschläge, ${errors.length} JS-Fehler`:"ERGEBNIS: ALLES OK");
await browser.close(); srv.close();
process.exit(errors.length||fails.length?1:0);
