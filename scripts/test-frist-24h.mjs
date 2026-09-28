// E2E-Test: Abmelden, wenn die AUTOMATISCHE 24-Stunden-Frist um ist.
// Gemeldeter Fall: Jemand hatte "kommt später" angetippt und wollte sich kurz
// vor dem Termin doch abmelden - es passierte nichts. Grund: die Knöpfe haben
// nur auf eine vom Trainer gesetzte Frist geschaut, gespeichert wurde aber
// nach BEIDEN Fristen. Die Oberfläche fragte also keinen Grund ab, das
// Speichern verlangte einen - und die Abmeldung ging lautlos verloren.
// Hier läuft der Fall ohne jede manuelle Frist durch: nur die 24-Stunden-Sperre.
// Aufruf: npm run build && node scripts/test-frist-24h.mjs
import { chromium } from "playwright-core";
import http from "http"; import fs from "fs"; import path from "path";
const dist = path.resolve("dist");
const srv = http.createServer((req,res)=>{ let p=path.join(dist,req.url.split("?")[0]); if(!fs.existsSync(p)||fs.statSync(p).isDirectory()) p=path.join(dist,"index.html"); res.setHeader("content-type",{".html":"text/html",".js":"text/javascript",".css":"text/css"}[path.extname(p)]||"text/plain"); res.end(fs.readFileSync(p)); }).listen(4319);
const exe=process.env.PLAYWRIGHT_CHROMIUM||"/opt/pw-browsers/chromium-1194/chrome-linux/chrome";
const browser = await chromium.launch({ executablePath:exe, args:["--no-sandbox"] });
const page = await browser.newPage({ viewport:{ width:390, height:900 } });
page.setDefaultTimeout(10000);
const errors=[]; const fails=[];
page.on("pageerror", e=>errors.push(e.message));
page.on("dialog", d=>d.accept());
const fail=m=>{ fails.push(m); console.log("FEHLGESCHLAGEN:", m); };
const ok=m=>console.log("OK:", m);
const body=()=>page.evaluate(()=>document.body.innerText);
const kurz=t=>String(t).slice(0,260).replace(/\n/g," | ");
const clickTxt=re=>page.evaluate(r=>{ const b=[...document.querySelectorAll("button")].find(x=>new RegExp(r).test((x.innerText||"").trim())); if(!b) return false; b.click(); return true; },re instanceof RegExp?re.source:re);
const dismiss=async()=>{ for(let k=0;k<12;k++){ const done=await page.evaluate(()=>{
  const fx=[...document.querySelectorAll("div")].filter(d=>getComputedStyle(d).position==="fixed"&&d.querySelector("button")&&d.innerText.length>30);
  for(const f of fx){ const b=[...f.querySelectorAll("button")].find(x=>/geht|Los|Verstanden|Alles klar|Fertig|Jetzt nicht|Weiter →|Überspringen|Start/i.test(x.innerText)); if(b){ b.click(); return false; } }
  return true; }); await page.waitForTimeout(400); if(done) break; } };

await page.addInitScript(()=>{
  if(!localStorage.getItem("vereinsapp_config")) localStorage.setItem("vereinsapp_config", JSON.stringify({url:"https://127.0.0.1:1/x", key:"test"}));
});

// ===== Demo-Daten erzeugen (einmal als Trainer laden) =====
await page.goto("http://127.0.0.1:4319/", { waitUntil:"networkidle" }); await page.waitForTimeout(2500);
await page.evaluate(()=>{ localStorage.setItem("va_simple","0"); localStorage.setItem("va_tsimple","0");
  sessionStorage.setItem("vereinsapp_v12_session", JSON.stringify({role:"trainer",cid:"demo",tids:["demo_f1"],name:"Demo Trainer",id:"demo_tr1"})); });
await page.reload({waitUntil:"networkidle"}); await page.waitForTimeout(2600); await dismiss();
// Ein erster Klick legt die Daten lokal ab - vorher steht dort nichts.
await page.evaluate(()=>{ const b=[...document.querySelectorAll("button")].find(x=>/Bin dabei/.test(x.innerText)); b&&b.click(); });
await page.waitForTimeout(1500);

// Fünf Termine, alle OHNE vom Trainer gesetzte Frist (deadline:null) -
// es zählt also nur die automatische 24-Stunden-Sperre.
//   A (+2 h, „kommt 15 Min später“) – die grosse Karte, der gemeldete Fall
//   B (+3 h) und C (+4 h) – füllen die drei grossen Karten auf
//   D (+5 h, zugesagt)  – steht als Zeile unter „schon beantwortet“
//   E (+3 Tage, offen)  – Gegenprobe: weit genug weg, kein Grund nötig
const k = await page.evaluate(()=>{
  const d=JSON.parse(localStorage.getItem("vereinsapp_v14")||"null"); if(!d) return null;
  const p=v=>String(v).padStart(2,"0");
  const inStd=h=>{ const x=new Date(Date.now()+h*3600000);
    return { date:`${x.getFullYear()}-${p(x.getMonth()+1)}-${p(x.getDate())}`, time:`${p(x.getHours())}:${p(x.getMinutes())}` }; };
  const tg=n=>{ const x=new Date(Date.now()+n*86400000); return `${x.getFullYear()}-${p(x.getMonth()+1)}-${p(x.getDate())}`; };
  // Genug Termine bereitstellen - der Demo-Verein hat nicht immer fünf.
  const vorhanden=(d.events||[]).filter(e=>e.cid==="demo"&&e.tid==="demo_f1"&&(e.pt==="att"||!e.pt))
    .sort((a,b)=>String(a.date||"").localeCompare(String(b.date||"")));
  const vorlage=vorhanden[0]; if(!vorlage) return null;
  while(vorhanden.length<5){ const neu={ ...vorlage, id:"ev_f24_"+vorhanden.length, votes:{}, lateCancellations:[], lateJoins:[] };
    d.events.push(neu); vorhanden.push(neu); }
  const evs=vorhanden;
  const kader=[...new Set([...((d.players||{})["demo_f1"]||[]),
    ...((d.playerProfiles||[]).filter(pp=>pp.mainTid==="demo_f1"&&!pp.archived).map(pp=>pp.name))])];
  const wer=kader[0]; if(!wer) return null;
  const ts=new Date().toISOString();
  const leer={ type:"training", title:"Training", loc:"Sportplatz", endTime:"", note:"",
    deadline:null, carpoolExtra:false, carpoolEnabled:false, extraPolls:[], duties:[], open:false };
  const ja={ [wer]:{ val:"yes", ts, role:"player" } };
  const a=inStd(2), bb=inStd(3), c=inStd(4), dd=inStd(5);
  Object.assign(evs[0], leer, { date:a.date,  time:a.time,  votes:{ [wer]:{ val:"yes", late:15, ts, role:"player" } } });
  Object.assign(evs[1], leer, { date:bb.date, time:bb.time, votes:{...ja} });
  Object.assign(evs[2], leer, { date:c.date,  time:c.time,  votes:{...ja} });
  Object.assign(evs[3], leer, { date:dd.date, time:dd.time, votes:{...ja} });
  Object.assign(evs[4], leer, { date:tg(3),   time:"17:30", endTime:"19:00", votes:{} });
  evs.slice(5).forEach(e=>{ e.date=tg(25); e.deadline=null; });
  localStorage.setItem("vereinsapp_v14", JSON.stringify(d));
  return { wer, bald:evs[0].id, zeile:evs[3].id, fern:evs[4].id, zeit:a.time,
           nah:[evs[0].id,evs[1].id,evs[2].id,evs[3].id] };
});
if(k) ok(`Testdaten: „${k.wer}“ hat „kommt 15 Min später“ für einen Termin in 2 Stunden (${k.zeit} Uhr) – ohne jede Trainer-Frist`);
else { fail("Konnte die Testdaten nicht setzen"); process.exit(1); }
const stimme=(id)=>page.evaluate(([i,n])=>{
  const d=JSON.parse(localStorage.getItem("vereinsapp_v14")||"null");
  const ev=(d.events||[]).find(e=>e.id===i); const v=ev&&(ev.votes||{})[n];
  return v==null?null:(typeof v==="object"?{...v}:{val:v}); }, [id,k.wer]);

// ===== 1) Einfache Eltern-Ansicht: absagen muss gehen =====
await page.evaluate(n=>{ localStorage.setItem("va_simple","1");
  sessionStorage.setItem("vereinsapp_v12_session", JSON.stringify({role:"user",cid:"demo",tid:"demo_f1",name:n,user:n})); }, k.wer);
await page.reload({waitUntil:"networkidle"}); await page.waitForTimeout(2800); await dismiss();
let b=await body();
if(/Kommt später/.test(b)) ok("Die Antwort „kommt später“ steht auf der großen Karte");
else fail("Die späte Zusage steht nicht auf der Karte: "+kurz(b));
{ const da=await clickTxt("^Ändern$");
  if(da) ok("Die Antwort lässt sich ändern"); else fail("Kein Ändern-Knopf auf der großen Karte"); }
await page.waitForTimeout(900);
b=await body();
if(/SPÄTER \+15/.test(b)) ok("Dort steht die bisherige Antwort („SPÄTER +15“)");
else fail("Bisherige Antwort fehlt: "+kurz(b));

{ const da=await clickTxt("^NEIN$");
  if(da) ok("Der NEIN-Knopf ist da"); else fail("Kein NEIN-Knopf in der einfachen Ansicht"); }
await page.waitForTimeout(1000);
b=await body();
if(/Die Frist ist um – warum absagen\?/.test(b))
  ok("Es wird nach dem Grund gefragt – der Klick läuft nicht mehr ins Leere");
else fail("Keine Grund-Abfrage trotz 24-Stunden-Sperre (genau der gemeldete Fehler): "+kurz(b));
{ const chips=await page.evaluate(()=>[...document.querySelectorAll("button")].map(x=>(x.innerText||"").trim())
    .filter(t=>["Krank","Urlaub","Schulpflicht","Wettkampf","Sonstiges"].includes(t)));
  if(chips.length>=4) ok("Mit Schnellgründen: "+chips.join(", ")); else fail("Zu wenige Schnellgründe: "+JSON.stringify(chips)); }
{ const st=await stimme(k.bald);
  if(st&&st.val==="yes") ok("Vor der Auswahl bleibt die alte Antwort stehen");
  else fail("Die Antwort wurde vorschnell geändert: "+JSON.stringify(st)); }
await clickTxt("^Krank$"); await page.waitForTimeout(1400);
{ const st=await stimme(k.bald);
  if(st&&st.val==="no") ok("Die Abmeldung ist gespeichert");
  else fail("Abmeldung NICHT gespeichert: "+JSON.stringify(st));
  if(st&&st.reason==="Krank") ok("Mit Grund: "+st.reason); else fail("Kein Grund gespeichert: "+JSON.stringify(st));
  if(st&&st.lateChange) ok("Und als Änderung nach Frist markiert"); else fail("Nicht als späte Änderung markiert"); }
{ const lc=await page.evaluate(i=>{ const d=JSON.parse(localStorage.getItem("vereinsapp_v14")||"null");
    const ev=(d.events||[]).find(e=>e.id===i); return (ev&&ev.lateCancellations||[]).length; }, k.bald);
  if(lc>=1) ok("Der Trainer bekommt die späte Absage in seine Liste");
  else fail("Keine späte Absage für den Trainer vermerkt"); }

// ===== 2) Die Zeile „absagen“ unter den beantworteten Terminen =====
// Genau hier lief der Klick früher ins Leere: die Zeile prüfte nur die
// manuelle Frist und rief dann eine Funktion auf, die es gar nicht gab.
{ const da=await clickTxt("^absagen$");
  if(da) ok("Unter „schon beantwortet“ gibt es ein „absagen“"); else fail("Keine Absage-Zeile gefunden: "+kurz(b)); }
await page.waitForTimeout(1200);
b=await body();
if(/Antwort ändern/.test(b)) ok("Ein Tipp öffnet den Termin groß, statt still zu scheitern");
else fail("Der Termin geht nicht auf: "+kurz(b));
if(errors.length===0) ok("Und dabei tritt kein Programmfehler auf");
else fail("Programmfehler beim Absagen: "+errors[0]);
{ await clickTxt("^NEIN$"); await page.waitForTimeout(900);
  const b2=await body();
  if(/Die Frist ist um – warum absagen\?/.test(b2)) ok("Auch von dort führt der Weg über den Grund");
  else fail("Keine Grund-Abfrage aus der Zeile heraus: "+kurz(b2));
  await clickTxt("^Urlaub$"); await page.waitForTimeout(1300);
  const st=await stimme(k.zeile);
  if(st&&st.val==="no"&&st.reason==="Urlaub") ok("Und die Abmeldung ist gespeichert: "+st.reason);
  else fail("Nicht gespeichert: "+JSON.stringify(st)); }

// ===== 3) Gegenprobe: weit entfernter Termin bleibt ohne Grund änderbar =====
{ const da=await page.evaluate(()=>{ const bs=[...document.querySelectorAll("button")].filter(x=>(x.innerText||"").trim()==="NEIN");
    if(!bs.length) return false; bs[bs.length-1].click(); return true; });
  if(da) ok("Der Termin in drei Tagen hat einen NEIN-Knopf"); else fail("Kein NEIN-Knopf beim fernen Termin"); }
await page.waitForTimeout(1300);
b=await body();
if(!/Die Frist ist um/.test(b)) ok("Beim Termin in drei Tagen wird NICHT nach einem Grund gefragt");
else fail("Auch ohne Frist wird nach einem Grund gefragt: "+kurz(b));
{ const st=await stimme(k.fern);
  if(st&&st.val==="no"&&!st.reason) ok("Und die Absage ist sofort gespeichert – ohne Grund");
  else fail("Normale Absage klappt nicht mehr: "+JSON.stringify(st)); }

// ===== 4) Ausführliche Eltern-Ansicht: gleiche Regel =====
// Alle Termine innerhalb der Sperre zurücksetzen - welche Karte die
// ausführliche Ansicht zuerst aufschlägt, ist für die Regel egal.
await page.evaluate(([ids,n])=>{
  const d=JSON.parse(localStorage.getItem("vereinsapp_v14")||"null");
  (d.events||[]).filter(e=>ids.includes(e.id)).forEach(ev=>{
    ev.votes={ [n]:{ val:"yes", late:15, ts:new Date().toISOString(), role:"player" } };
    ev.lateCancellations=[]; });
  localStorage.setItem("vereinsapp_v14", JSON.stringify(d));
  localStorage.setItem("va_simple","0");
}, [k.nah,k.wer]);
await page.reload({waitUntil:"networkidle"}); await page.waitForTimeout(2800); await dismiss();
{ const da=await page.evaluate(()=>{
    const s=[...document.querySelectorAll("span")].find(x=>/^Leider nicht dabei$/.test((x.innerText||"").trim()));
    if(!s) return false; let e=s; for(let i=0;i<4&&e;i++){ e=e.parentElement; if(e&&/Leider nicht dabei/.test(e.innerText||"")&&e.style&&e.style.cursor==="pointer"){ e.click(); return true; } }
    return false; });
  if(da) ok("„Leider nicht dabei“ lässt sich antippen"); else fail("Feld „Leider nicht dabei“ nicht gefunden"); }
await page.waitForTimeout(1000);
b=await body();
if(/Warum kann dein Kind nicht\?/.test(b)) ok("Auch hier kommt die Grund-Abfrage");
else fail("Keine Grund-Abfrage in der ausführlichen Ansicht: "+kurz(b));
if(/Nach Ablauf der Frist ist eine Absage nur mit Grund möglich/.test(b))
  ok("Mit dem klaren Hinweis, dass jetzt ein Grund nötig ist");
else fail("Hinweis auf die Frist fehlt: "+kurz(b));
{ const ohne=await page.evaluate(()=>[...document.querySelectorAll("button")].some(x=>(x.innerText||"").trim()==="Ohne Angabe"));
  if(!ohne) ok("Der Weg „Ohne Angabe“ ist nach der Frist ausgeblendet");
  else fail("„Ohne Angabe“ wird angeboten, das Speichern lehnt es aber ab"); }
await clickTxt("^Krank$"); await page.waitForTimeout(1400);
{ const treffer=await page.evaluate(([ids,n])=>{ const d=JSON.parse(localStorage.getItem("vereinsapp_v14")||"null");
    return (d.events||[]).filter(e=>ids.includes(e.id)).map(e=>(e.votes||{})[n]||null)
      .filter(v=>v&&v.val==="no"&&v.reason==="Krank"&&v.lateChange); }, [k.nah,k.wer]);
  if(treffer.length===1) ok("Und die Abmeldung ist auch hier gespeichert – mit Grund und als späte Änderung");
  else fail("Ausführliche Ansicht speichert die Abmeldung nicht: "+JSON.stringify(treffer)); }

if(errors.length){ console.log("JS-FEHLER:"); [...new Set(errors)].forEach(e=>console.log(" -",e.slice(0,150))); }
console.log(errors.length||fails.length?`ERGEBNIS: ${fails.length} Fehlschläge, ${errors.length} JS-Fehler`:"ERGEBNIS: ALLES OK");
await browser.close(); srv.close();
process.exit(errors.length||fails.length?1:0);
