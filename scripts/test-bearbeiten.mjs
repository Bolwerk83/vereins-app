// E2E-Test: „✏️ Bearbeiten“ zeigt zuerst alle bisherigen Einstellungen.
// Jede Zeile springt in ihren Schritt, „Speichern“ geht sofort – und die
// bereits abgegebenen Zu- und Absagen bleiben unverändert.
// Aufruf: npm run build && node scripts/test-bearbeiten.mjs
import { chromium } from "playwright-core";
import http from "http"; import fs from "fs"; import path from "path";
const dist = path.resolve("dist");
const srv = http.createServer((req,res)=>{ let p=path.join(dist,req.url.split("?")[0]); if(!fs.existsSync(p)||fs.statSync(p).isDirectory()) p=path.join(dist,"index.html"); res.setHeader("content-type",{".html":"text/html",".js":"text/javascript",".css":"text/css"}[path.extname(p)]||"text/plain"); res.end(fs.readFileSync(p)); }).listen(4313);
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
const klick=(re)=>page.evaluate(r=>{
  const b=[...document.querySelectorAll("button")].find(x=>new RegExp(r).test((x.innerText||"").replace(/\s+/g," ").trim()));
  if(!b) return false; b.click(); return true; }, re instanceof RegExp?re.source:re);
const evLesen=()=>page.evaluate(()=>{
  const d=JSON.parse(localStorage.getItem("vereinsapp_v14")||"null");
  const ev=(d.events||[]).filter(e=>e.cid==="demo"&&e.tid==="demo_f1").sort((a,b)=>String(a.date).localeCompare(String(b.date)))[0];
  return ev?{title:ev.title,note:ev.note,loc:ev.loc,time:ev.time,type:ev.type,
             votes:Object.fromEntries(Object.entries(ev.votes||{}).map(([n,v])=>[n,(typeof v==="object"&&v)?v.val:v])),
             deadline:ev.deadline||null, sollPlayers:ev.sollPlayers||null}:null; });

await page.addInitScript(()=>{ if(!localStorage.getItem("vereinsapp_config")) localStorage.setItem("vereinsapp_config", JSON.stringify({url:"https://127.0.0.1:1/x", key:"test"})); });
await page.goto("http://127.0.0.1:4313/", { waitUntil:"networkidle" }); await page.waitForTimeout(2500);
await page.evaluate(()=>{ localStorage.setItem("va_simple","0"); localStorage.setItem("va_tsimple","0");
  sessionStorage.setItem("vereinsapp_v12_session", JSON.stringify({role:"trainer",cid:"demo",tids:["demo_f1"],name:"Demo Trainer",id:"demo_tr1"})); });
await page.reload({waitUntil:"networkidle"}); await page.waitForTimeout(2600); await dismiss();
await page.evaluate(()=>{ const b=[...document.querySelectorAll("button")].find(x=>/Bin dabei/.test(x.innerText)); b&&b.click(); });
await page.waitForTimeout(1500);

// Ein Termin mit vielen Einstellungen und ein paar Antworten
const start = await page.evaluate(()=>{
  const d=JSON.parse(localStorage.getItem("vereinsapp_v14")||"null"); if(!d) return null;
  const p=v=>String(v).padStart(2,"0"); const tg=n=>{const x=new Date(Date.now()+n*86400000);return `${x.getFullYear()}-${p(x.getMonth()+1)}-${p(x.getDate())}`;};
  const evs=(d.events||[]).filter(e=>e.cid==="demo"&&e.tid==="demo_f1").sort((a,b)=>String(a.date).localeCompare(String(b.date)));
  if(!evs.length) return null;
  const kader=[...new Set([...((d.players||{})["demo_f1"]||[]),
    ...((d.playerProfiles||[]).filter(pp=>pp.mainTid==="demo_f1"&&!pp.archived).map(pp=>pp.name))])];
  const ts=new Date().toISOString();
  Object.assign(evs[0],{ type:"auswarts", date:tg(4), time:"10:30", endTime:"12:00", title:"SV Adler",
    loc:"Adler-Arena", note:"Treffen 30 Minuten vorher am Platz.", sollPlayers:9, maxPlayers:null,
    deadline:{date:tg(2),time:"18:00"}, carpoolExtra:true, carpoolOpt:false,
    extraPolls:[{id:"ep1",title:"Wer bringt was mit?",selType:"multi",items:[{id:"i1",txt:"Kuchen"}],votes:{}}],
    votes:{ [kader[0]]:{val:"yes",ts,role:"player"}, [kader[1]]:{val:"no",ts,role:"player",reason:"Krank"} } });
  evs.slice(1).forEach(e=>{ e.date=tg(14); });
  localStorage.setItem("vereinsapp_v14", JSON.stringify(d));
  return {ja:kader[0], nein:kader[1]};
});
if(start) ok("Termin mit Ort, Notiz, Frist, Fahrgemeinschaft und Zusatzliste angelegt");
else fail("Konnte den Termin nicht anlegen");
await page.reload({waitUntil:"networkidle"}); await page.waitForTimeout(2800); await dismiss();
const vorher=await evLesen();

// ===== Bearbeiten öffnen =====
{ const geklickt=await klick("✏️ Bearbeiten"); await page.waitForTimeout(1200);
  if(geklickt) ok("„Bearbeiten“ geöffnet"); else fail("Kein Bearbeiten-Knopf"); }
let b=await body();
if(/ÜBERSICHT/.test(b)) ok("Es startet mit einer Übersicht statt auf Schritt 1");
else fail("Keine Übersicht: "+b.slice(0,300).replace(/\n/g," | "));
if(/Zu- und Absagen bleiben erhalten/.test(b)) ok("Mit dem Hinweis, dass die Abstimmung bleibt");
else fail("Kein Hinweis zu den Antworten");

// Alle Einstellungen sichtbar?
const soll=[["Mannschaft",/F-Jugend 1/],["Art",/Auswärtsspiel/],["Titel",/SV Adler/],
  ["Datum & Uhrzeit",/10:30–12:00 Uhr/],["Ort",/Adler-Arena/],
  ["Nachricht an Eltern",/Treffen 30 Minuten vorher am Platz\./],
  ["Spieler",/Soll 9/],["Abstimmung",/Anwesenheit \+ Fahrtgemeinschaft \+ 1 Zusatzliste/],
  ["Abstimmungs-Frist",/ABSTIMMUNGS-FRIST/]];
{ let fehlt=[];
  for(const [name,re] of soll) if(!re.test(b)) fehlt.push(name);
  if(!fehlt.length) ok("Alle bisherigen Einstellungen stehen da (Mannschaft, Art, Titel, Zeit, Ort, Nachricht, Soll, Abstimmung, Frist)");
  else fail("Diese fehlen in der Übersicht: "+fehlt.join(", ")+" | "+b.slice(0,400).replace(/\n/g," | ")); }

// ===== Nachricht ändern über die Zeile =====
{ const geklickt=await page.evaluate(()=>{
    const b=[...document.querySelectorAll("button")].find(x=>/NACHRICHT AN ELTERN/i.test(x.innerText||""));
    if(!b) return false; b.click(); return true; });
  await page.waitForTimeout(900);
  if(geklickt) ok("Ein Tipp auf „Nachricht an Eltern“ springt in den Schritt"); else fail("Zeile nicht antippbar");
  // Der Text steht im Wert des Feldes, nicht im sichtbaren Seitentext
  const wert=await page.evaluate(()=>{
    const t=[...document.querySelectorAll("textarea")].map(x=>x.value||"").find(v=>v.trim());
    return t||""; });
  if(/Treffen 30 Minuten vorher am Platz\./.test(wert)) ok("Der bisherige Text steht im Feld: „"+wert+"“");
  else fail("Text nicht vorbelegt: "+JSON.stringify(wert)); }
await page.evaluate(()=>{
  const t=[...document.querySelectorAll("textarea")].find(x=>/Treffen 30 Minuten/.test(x.value||""));
  if(t){ const set=Object.getOwnPropertyDescriptor(window.HTMLTextAreaElement.prototype,"value").set;
    set.call(t,"Treffen jetzt 45 Minuten vorher – Trikots nicht vergessen!"); t.dispatchEvent(new Event("input",{bubbles:true})); }
});
await page.waitForTimeout(400);
{ const geklickt=await klick("Übersicht"); await page.waitForTimeout(900);
  if(geklickt) ok("Und zurück zur Übersicht"); else fail("Kein Weg zurück zur Übersicht");
  const b3=await body();
  if(/45 Minuten vorher/.test(b3)) ok("Die Übersicht zeigt den neuen Text"); else fail("Neuer Text nicht in der Übersicht"); }

// ===== Speichern =====
{ const geklickt=await klick("^Speichern$"); await page.waitForTimeout(1600);
  if(geklickt) ok("Direkt aus der Übersicht speicherbar"); else fail("Kein Speichern-Knopf in der Übersicht"); }
{ const nachher=await evLesen();
  if(nachher&&/45 Minuten vorher/.test(nachher.note||"")) ok("Die neue Nachricht ist gespeichert");
  else fail("Nachricht nicht gespeichert: "+JSON.stringify(nachher&&nachher.note));
  if(nachher&&nachher.title===vorher.title&&nachher.loc===vorher.loc&&nachher.time===vorher.time&&nachher.sollPlayers===vorher.sollPlayers)
    ok("Alle anderen Einstellungen sind unverändert");
  else fail("Andere Einstellungen verändert: "+JSON.stringify({v:vorher,n:nachher}));
  if(nachher&&JSON.stringify(nachher.votes)===JSON.stringify(vorher.votes))
    ok("Und die Zu- und Absagen sind unangetastet: "+JSON.stringify(nachher.votes));
  else fail("Antworten verändert: "+JSON.stringify({v:vorher.votes,n:nachher.votes}));
  if(nachher&&nachher.deadline&&vorher.deadline&&nachher.deadline.date===vorher.deadline.date)
    ok("Die Abstimmungs-Frist bleibt ebenfalls stehen");
  else fail("Frist verloren: "+JSON.stringify(nachher&&nachher.deadline)); }

if(errors.length){ console.log("JS-FEHLER:"); [...new Set(errors)].forEach(e=>console.log(" -",e.slice(0,150))); }
console.log(errors.length||fails.length?`ERGEBNIS: ${fails.length} Fehlschläge, ${errors.length} JS-Fehler`:"ERGEBNIS: ALLES OK");
await browser.close(); srv.close();
process.exit(errors.length||fails.length?1:0);
