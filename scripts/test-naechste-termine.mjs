// E2E-Test: "Nächstes Training" UND "Nächstes Spiel" stehen beide direkt da.
//   1. Je Terminart eine große Karte – ohne Umschalten, beide sofort
//      beantwortbar.
//   2. Die Karte liest sich in einer Reihenfolge: Art → gegen wen → wann → wo.
//   3. Eltern- und Trainer-Ansicht zeigen dasselbe Muster.
// Aufruf: npm run build && node scripts/test-schnellwahl.mjs
import { chromium } from "playwright-core";
import http from "http"; import fs from "fs"; import path from "path";
const dist = path.resolve("dist");
const srv = http.createServer((req,res)=>{ let p=path.join(dist,req.url.split("?")[0]); if(!fs.existsSync(p)||fs.statSync(p).isDirectory()) p=path.join(dist,"index.html"); res.setHeader("content-type",{".html":"text/html",".js":"text/javascript",".css":"text/css"}[path.extname(p)]||"text/plain"); res.end(fs.readFileSync(p)); }).listen(4285);
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
// Die Überschriften der großen Karten ("NÄCHSTES TRAINING", "NÄCHSTES SPIEL")
const karten = () => page.evaluate(()=>
  (document.body.innerText.match(/NÄCHSTES (?:TRAINING|SPIEL|TURNIER|TERMIN)/g)||[]));

await page.addInitScript(()=>{ if(!localStorage.getItem("vereinsapp_config")) localStorage.setItem("vereinsapp_config", JSON.stringify({url:"https://127.0.0.1:1/x", key:"test"})); });
await page.goto("http://127.0.0.1:4285/", { waitUntil:"networkidle" }); await page.waitForTimeout(2500);
await page.evaluate(()=>{ localStorage.setItem("va_simple","0"); localStorage.setItem("va_tsimple","0");
  sessionStorage.setItem("vereinsapp_v12_session", JSON.stringify({role:"trainer",cid:"demo",tids:["demo_f1"],name:"Demo Trainer",id:"demo_tr1"})); });
await page.reload({waitUntil:"networkidle"}); await page.waitForTimeout(2600); await dismiss();
await page.evaluate(()=>{ const b=[...document.querySelectorAll("button")].find(x=>/Bin dabei/.test(x.innerText)); b&&b.click(); });
await page.waitForTimeout(1500);

// Ausgangslage: Training in 2 Tagen, Auswärtsspiel gegen SV Adler in 5 Tagen
const kind = await page.evaluate(()=>{
  const d=JSON.parse(localStorage.getItem("vereinsapp_v14")||"null"); if(!d) return null;
  const p=v=>String(v).padStart(2,"0"); const tg=n=>{const x=new Date(Date.now()+n*86400000);return `${x.getFullYear()}-${p(x.getMonth()+1)}-${p(x.getDate())}`;};
  const evs=(d.events||[]).filter(e=>e.cid==="demo"&&e.tid==="demo_f1"&&(e.pt==="att"||!e.pt))
    .sort((a,b)=>String(a.date).localeCompare(String(b.date)));
  if(evs.length<2) return null;
  const kader=[...new Set([...((d.players||{})["demo_f1"]||[]),
    ...((d.playerProfiles||[]).filter(pp=>pp.mainTid==="demo_f1"&&!pp.archived).map(pp=>pp.name))])];
  const k=kader[0]; if(!k) return null;
  Object.assign(evs[0],{type:"training",date:tg(2),time:"17:30",endTime:"19:00",title:"Training",loc:"Sportplatz Platz 1",deadline:null});
  Object.assign(evs[1],{type:"auswarts",date:tg(5),time:"10:30",endTime:"12:00",title:"SV Adler",loc:"Adler-Arena",deadline:null});
  // Drittes Training, damit die Liste laenger ist als ein Bildschirm - erst
  // dann lohnt sich die Schnellwahl und wird deshalb auch erst dann gezeigt.
  const drittes={...evs[0], id:"ev_drittes", date:tg(9), time:"17:30", endTime:"19:00", title:"Training", votes:{}};
  d.events=[...(d.events||[]).filter(e=>e.id!=="ev_drittes"), drittes];
  [evs[0],evs[1]].forEach(e=>{ const v={...(e.votes||{})}; delete v[k]; e.votes=v; });
  localStorage.setItem("vereinsapp_v14", JSON.stringify(d));
  return k;
});
if(kind) ok("Ausgangslage: Training in 2 Tagen, Spiel gegen SV Adler in 5 Tagen");
else fail("Konnte die Ausgangslage nicht setzen");

// ===== 1) Eltern, einfache Ansicht: beides steht direkt da =====
await page.evaluate(k=>{ localStorage.setItem("va_simple","1");
  sessionStorage.setItem("vereinsapp_v12_session", JSON.stringify({role:"user",cid:"demo",tid:"demo_f1",name:k,user:k})); }, kind);
await page.reload({waitUntil:"networkidle"}); await page.waitForTimeout(2800); await dismiss();
let ks=await karten();
if(ks.includes("NÄCHSTES TRAINING")&&ks.includes("NÄCHSTES SPIEL")) ok("Training UND Spiel stehen beide groß da: "+ks.join(" | "));
else fail("Nicht beides zu sehen: "+JSON.stringify(ks));
let b=await body();
if(/SV Adler/.test(b)) ok("Beim Spiel steht, gegen wen es geht"); else fail("Gegner fehlt");
if(/in 2 Tagen/.test(b)&&/in 5 Tagen/.test(b)) ok("Beide mit Countdown"); else fail("Countdown fehlt bei einem der beiden");
// Ohne einen einzigen Klick muss das Spiel abstimmbar sein
{ const knoepfe=await page.evaluate(()=>{
    const alle=[...document.querySelectorAll("div")].filter(d=>/^NÄCHSTES SPIEL/.test((d.innerText||"").trim()));
    const kopf=alle[alle.length-1]; if(!kopf) return null;
    // von der Ueberschrift aus die zugehoerige Karte suchen
    let karte=kopf.parentElement; for(let i=0;i<3&&karte;i++){ if(/\bJA\b/.test(karte.innerText||"")) break; karte=karte.parentElement; }
    return karte?[...karte.querySelectorAll("button")].map(x=>(x.innerText||"").trim()).filter(t=>/^(JA|NEIN|SPÄTER)$/.test(t)):null; });
  if(knoepfe&&knoepfe.length>=3) ok("Und ist sofort abstimmbar – ohne Umweg ("+knoepfe.join(", ")+")");
  else fail("Keine Antwort-Knöpfe am Spiel: "+JSON.stringify(knoepfe)); }
// Zusage am Spiel geben
{ const geklickt=await page.evaluate(()=>{
    const alle=[...document.querySelectorAll("div")].filter(d=>/^NÄCHSTES SPIEL/.test((d.innerText||"").trim()));
    const kopf=alle[alle.length-1]; if(!kopf) return false;
    let karte=kopf.parentElement; for(let i=0;i<3&&karte;i++){ if(/\bJA\b/.test(karte.innerText||"")) break; karte=karte.parentElement; }
    const b=karte&&[...karte.querySelectorAll("button")].find(x=>(x.innerText||"").trim()==="JA");
    if(!b) return false; b.click(); return true; });
  await page.waitForTimeout(1500);
  const st=await page.evaluate(k=>{
    const d=JSON.parse(localStorage.getItem("vereinsapp_v14")||"null");
    const ev=(d.events||[]).find(e=>e.title==="SV Adler");
    const v=ev&&(ev.votes||{})[k]; return v==null?null:(typeof v==="object"?v.val:v); }, kind);
  if(geklickt&&st==="yes") ok("Die Zusage zum Spiel ist gespeichert");
  else fail("Zusage nicht gespeichert: "+st); }
// Und das Training bleibt daneben offen
b=await body();
if(/NÄCHSTES TRAINING/.test(b)&&/Kommt /.test(b)) ok("Das Training steht weiter offen daneben");
else fail("Training verschwunden: "+b.slice(0,240).replace(/\n/g," | "));

// ===== 2) Reihenfolge der Angaben: Art → Gegner → wann → wo =====
{ const iSpiel=b.indexOf("SPIEL"), iGegner=b.indexOf("SV Adler"), iOrt=b.indexOf("Adler-Arena");
  if(iSpiel>=0&&iGegner>iSpiel&&iOrt>iGegner) ok("Die Karte liest sich von oben nach unten: Art → Gegner → wann → wo");
  else fail(`Reihenfolge stimmt nicht (Art ${iSpiel}, Gegner ${iGegner}, Ort ${iOrt})`); }
if(!/TRAINING\s*\n\s*Training/.test(b)) ok("Der Titel wird nicht doppelt unter der Terminart wiederholt");
else fail("Titel steht doppelt da");

// ===== 3) Trainer sieht dasselbe Muster =====
await page.evaluate(()=>{ localStorage.setItem("va_tsimple","1");
  sessionStorage.setItem("vereinsapp_v12_session", JSON.stringify({role:"trainer",cid:"demo",tids:["demo_f1"],name:"Demo Trainer",id:"demo_tr1"})); });
await page.reload({waitUntil:"networkidle"}); await page.waitForTimeout(2800); await dismiss();
ks=await karten();
if(ks.includes("NÄCHSTES TRAINING")&&ks.includes("NÄCHSTES SPIEL")) ok("Auch der Trainer sieht beides direkt: "+ks.join(" | "));
else fail("Beim Trainer fehlt eine der beiden Karten: "+JSON.stringify(ks));
b=await body();
if(/SV Adler/.test(b)) ok("Mit Gegner"); else fail("Gegner fehlt beim Trainer");
if(/in \d+ Tagen|morgen|heute/.test(b)) ok("Mit demselben Countdown wie bei den Eltern");
else fail("Kein Countdown in der Trainer-Ansicht");
// Der Trainer kann bei beiden direkt selbst zusagen
{ const n=await page.evaluate(()=>[...document.querySelectorAll("button")].filter(x=>/^(✓ )?Bin dabei$|^Späte Anmeldung$/.test((x.innerText||"").trim())).length);
  if(n>=2) ok("Und kann bei beiden direkt selbst zusagen ("+n+"×)"); else fail("Eigene Zusage fehlt an einer Karte: "+n); }

if(errors.length){ console.log("JS-FEHLER:"); [...new Set(errors)].forEach(e=>console.log(" -",e.slice(0,150))); }
console.log(errors.length||fails.length?`ERGEBNIS: ${fails.length} Fehlschläge, ${errors.length} JS-Fehler`:"ERGEBNIS: ALLES OK");
await browser.close(); srv.close();
process.exit(errors.length||fails.length?1:0);
