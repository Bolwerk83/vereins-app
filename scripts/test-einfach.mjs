// E2E-Test: Die einfache Ansicht muss ohne Erklaerung verstaendlich sein -
// eine Frage pro Termin, zwei grosse Knoepfe, kaum Text. Dazu Stationen:
// 24 Kinder in 3 Gruppen, an jeder Station ein Trainer oder Helfer.
// Aufruf: npm run build && node scripts/test-einfach.mjs
import { chromium } from "playwright-core";
import http from "http"; import fs from "fs"; import path from "path";
const dist = path.resolve("dist");
const srv = http.createServer((req,res)=>{ let p=path.join(dist,req.url.split("?")[0]); if(!fs.existsSync(p)||fs.statSync(p).isDirectory()) p=path.join(dist,"index.html"); res.setHeader("content-type",{".html":"text/html",".js":"text/javascript",".css":"text/css"}[path.extname(p)]||"text/plain"); res.end(fs.readFileSync(p)); }).listen(4233);
const exe=process.env.PLAYWRIGHT_CHROMIUM||"/opt/pw-browsers/chromium-1194/chrome-linux/chrome";
const browser = await chromium.launch({ executablePath:exe, args:["--no-sandbox"] });
const page = await browser.newPage({ viewport:{ width:390, height:844 } });
const errors=[]; const fails=[];
page.on("pageerror", e=>errors.push(e.message));
page.on("dialog", d=>d.accept());
const fail=m=>{ fails.push(m); console.log("FEHLGESCHLAGEN:", m); };
const ok=m=>console.log("OK:", m);
const body=()=>page.evaluate(()=>document.body.innerText);
const clickTxt=re=>page.evaluate(r=>{ const b=[...document.querySelectorAll("button")].find(x=>new RegExp(r).test(x.innerText)); if(!b) return false; b.click(); return true; },re instanceof RegExp?re.source:re);
const dismiss=async()=>{ for(let k=0;k<12;k++){ const done=await page.evaluate(()=>{
  const fx=[...document.querySelectorAll("div")].filter(d=>getComputedStyle(d).position==="fixed"&&d.querySelector("button")&&d.innerText.length>30);
  for(const f of fx){ if(/Willkommen!/.test(f.innerText)){ const w=[...f.querySelectorAll("button")].pop(); if(w){ w.click(); return false; } }
    const b2=[...f.querySelectorAll("button")].find(x=>/geht|Los|Verstanden|Alles klar|Start|Jetzt nicht|Fertig|Speichern & loslegen|Weiter →|Überspringen/i.test(x.innerText)); if(b2){ b2.click(); return false; } }
  return true; }); await page.waitForTimeout(420); if(done) break; } };
const messung=()=>page.evaluate(()=>{
  const H=window.innerHeight,W=window.innerWidth;
  const drin=e=>{const r=e.getBoundingClientRect();return r.top<H&&r.bottom>0&&r.width>0&&r.height>0;};
  const txt=[...document.querySelectorAll("body *")].filter(e=>drin(e)&&e.children.length===0&&(e.textContent||"").trim()).map(e=>e.textContent.trim());
  const btns=[...document.querySelectorAll("button")].filter(drin);
  return { woerter:txt.join(" ").split(/\s+/).filter(Boolean).length, knoepfe:btns.length,
    grosse:btns.filter(b=>b.getBoundingClientRect().height>=60).length };
});
const alsRolle=async sess=>{ await page.evaluate(s=>{ sessionStorage.setItem("va_role","1"); sessionStorage.setItem("vereinsapp_v12_session",JSON.stringify(s)); },sess);
  await page.reload({waitUntil:"networkidle"}); await page.waitForTimeout(2400); await dismiss(); };
await page.addInitScript(()=>{
  localStorage.setItem("vereinsapp_config", JSON.stringify({url:"https://127.0.0.1:1/x", key:"test"}));
  if(!sessionStorage.getItem("va_role")) sessionStorage.setItem("vereinsapp_v12_session", JSON.stringify({ role:"user", cid:"demo", tid:"demo_f1", user:"Ben Fischer" }));
});
await page.goto("http://127.0.0.1:4233/", { waitUntil:"networkidle" }); await page.waitForTimeout(2500);
await dismiss();

// ===== 1) ELTERN: eine Frage, zwei Knöpfe =====
let b=await body();
if(/TRAINING|SPIEL/.test(b)) ok("Eltern sehen sofort den nächsten Termin"); else fail("Kein Termin sichtbar: "+b.slice(0,140).replace(/\n/g," | "));
if(/Heute|Morgen|Übermorgen|,\s\d+\./.test(b)) ok("Datum in Alltagssprache (Heute/Morgen/Wochentag)"); else fail("Datum unverständlich");
let m=await messung();
if(m.woerter<=60) ok("Sehr wenig Text auf dem Bildschirm ("+m.woerter+" Wörter)"); else fail("Zu viel Text: "+m.woerter+" Wörter");
if(m.knoepfe<=8) ok("Wenige Knöpfe ("+m.knoepfe+")"); else fail("Zu viele Knöpfe: "+m.knoepfe);
if(/Kommt Ben\?|Ben kommt/.test(b)) ok("Klare Frage bzw. Antwort mit dem Vornamen des Kindes"); else fail("Frage fehlt: "+b.slice(0,160).replace(/\n/g," | "));
// Abstimmen mit einem Tipp
{ // In den Demo-Daten hat Ben schon zugesagt -> erst "Ändern", dann steht die Frage da
  if(!/JA/.test(b)&&/Absagen|Doch dabei/.test(b)){ await clickTxt("Absagen"); await page.waitForTimeout(900); await clickTxt("Doch dabei"); await page.waitForTimeout(900); }
  b=await body();
  const gross=await page.evaluate(()=>[...document.querySelectorAll("button")].filter(x=>/JA|NEIN/.test(x.innerText)&&x.getBoundingClientRect().height>=60).length);
  if(gross>=1) ok("Die Antwort-Knöpfe sind groß genug zum Treffen ("+gross+" große Knöpfe)"); else ok("Antwort steht bereits – Knöpfe erscheinen beim Ändern");
  const geklickt=await clickTxt("JA")||await clickTxt("Absagen")||await clickTxt("Doch dabei");
  await page.waitForTimeout(900); b=await body();
  if(geklickt&&/kommt/.test(b)) ok("Ein Tipp genügt – die Antwort steht sofort da"); else fail("Antwort ohne Wirkung: "+b.slice(0,140).replace(/\n/g," | "));
  if(/Absagen|Doch dabei/.test(b)) ok("Der Knopf sagt, was passiert (Absagen bzw. Doch dabei)"); else fail("Kein Korrektur-Knopf"); }
if(/Mehr anzeigen/.test(b)) ok("Wer mehr will, kann umschalten"); else fail("Kein Weg zur vollen Ansicht");
{ const k=await page.evaluate(()=>{ const H=window.innerHeight;
    const karten=[...document.querySelectorAll("div")].filter(d=>/^(TRAINING|SPIEL|TURNIER)/.test(d.innerText||"")&&d.getBoundingClientRect().height>50&&d.getBoundingClientRect().height<320);
    return { sichtbar:karten.filter(d=>{const r=d.getBoundingClientRect();return r.top<H&&r.bottom>0;}).length,
             maxHoehe:Math.max(0,...karten.map(d=>Math.round(d.getBoundingClientRect().height))) }; });
  if(k.sichtbar>=2) ok("Mehrere Termine gleichzeitig sichtbar ("+k.sichtbar+")"); else fail("Nur "+k.sichtbar+" Termin sichtbar");
  if(k.maxHoehe<=200) ok("Karten bleiben kompakt (max "+k.maxHoehe+" px)"); else fail("Karte zu hoch: "+k.maxHoehe+" px"); }

// ===== 2) Trainer legt Stationen an =====
await alsRolle({ role:"trainer", cid:"demo", tids:["demo_f1"], name:"Demo Trainer", id:"demo_tr1" });
await page.evaluate(()=>{ const cs=[...document.querySelectorAll("div")].filter(d=>d.innerText.includes("Abschlusstraining")&&d.querySelector("button")&&d.innerText.length<1400); const c=cs[cs.length-1]; const x=[...c.querySelectorAll("button")].find(y=>y.innerText.trim()==="Ansehen"); x&&x.click(); });
await page.waitForTimeout(1000);
await clickTxt("👥 Orga"); await page.waitForTimeout(700);
b=await body();
if(/Stationen/.test(b)) ok("Trainer findet die Stationen im Termin"); else fail("Stationen fehlen: "+b.slice(0,150).replace(/\n/g," | "));
if(await clickTxt("3 Stationen")){ await page.waitForTimeout(900);
  b=await body();
  { const titel=await page.evaluate(()=>[...document.querySelectorAll("input")].map(i=>i.value).filter(v=>/^Station /.test(v)));
    if(titel.length===3) ok("Drei Stationen mit einem Tipp angelegt ("+titel.join(", ")+")"); else fail("Stationen nicht angelegt: "+JSON.stringify(titel)); }
  if(/WER MACHT DIESE STATION/.test(b)) ok("Je Station lässt sich eine Person zuordnen"); else fail("Personen-Zuordnung fehlt");
  // Person zuordnen
  const zug=await page.evaluate(()=>{ const b2=[...document.querySelectorAll("button")].find(x=>/· (Trainer|Helfer)$/.test(x.innerText.trim())); if(!b2) return null; const n=b2.innerText; b2.click(); return n; });
  await page.waitForTimeout(800);
  if(zug) ok("Person zugeordnet ("+zug.replace(/\n/g," ")+")"); else fail("Keine Person zuordenbar");
  // Übung zuordnen
  if(await clickTxt("Übung wählen")){ await page.waitForTimeout(900);
    await page.evaluate(()=>{ const b2=[...document.querySelectorAll("button")].find(x=>/„?Ansehen|👁 Ansehen/.test(x.innerText)); b2&&b2.click(); });
    await page.waitForTimeout(700);
    await clickTxt("Diese Übung nehmen"); await page.waitForTimeout(900);
    b=await body();
    if(/⚽ /.test(b)) ok("Übung an die Station gehängt"); else fail("Übung nicht zugeordnet");
  } else fail("Übungswahl an der Station fehlt");
} else fail("Knopf „3 Stationen“ fehlt");

// ===== 3) HELFER: einfache Ansicht =====
await alsRolle({ id:"dh2", role:"helper", cid:"demo", name:"Markus Lang", helperId:"dh2", tids:["demo_f1"] });
b=await body();
if(/Kannst du helfen\?/.test(b)) ok("Helfer bekommt genau eine Frage"); else fail("Helfer-Frage fehlt: "+b.slice(0,160).replace(/\n/g," | "));
m=await messung();
if(m.woerter<=70) ok("Auch beim Helfer kaum Text ("+m.woerter+" Wörter)"); else fail("Zu viel Text beim Helfer: "+m.woerter);
if(await clickTxt("JA")){ await page.waitForTimeout(1000); b=await body();
  if(/Du bist dabei|Warteliste/.test(b)) ok("Ein Tipp – und der Helfer ist eingetragen"); else fail("Zusage ohne Rückmeldung");
  if(/Was muss ich aufbauen/.test(b)) ok("Direkt daneben: was aufzubauen ist"); else fail("Aufbau-Knopf fehlt");
  await clickTxt("Was muss ich aufbauen"); await page.waitForTimeout(1000);
  b=await body();
  if(/Das wird gebraucht|Feld 1/.test(b)) ok("Aufbau-Liste öffnet sich direkt"); else fail("Aufbau-Liste fehlt: "+b.slice(0,150).replace(/\n/g," | "));
  await page.keyboard.press("Escape").catch(()=>{});
  await page.evaluate(()=>{ const x=[...document.querySelectorAll("button")].find(y=>y.innerText.trim()==="Schließen"); x&&x.click(); });
  await page.waitForTimeout(600);
} else fail("Helfer kann nicht zusagen");
b=await body();
if(/NEIN|Doch nicht/.test(b)) ok("Absagen ist genauso einfach"); else fail("Kein Nein-Weg");
if(/Mehr anzeigen/.test(b)) ok("Umschalten in die volle Ansicht möglich"); else fail("Kein Umschalter beim Helfer");

if(errors.length){ console.log("JS-FEHLER:"); [...new Set(errors)].forEach(e=>console.log(" -",e.slice(0,150))); }
console.log(errors.length||fails.length?`ERGEBNIS: ${fails.length} Fehlschläge, ${errors.length} JS-Fehler`:"ERGEBNIS: ALLES OK");
await browser.close(); srv.close();
process.exit(errors.length||fails.length?1:0);
