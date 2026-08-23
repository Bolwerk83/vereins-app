// E2E-Test: einfache Trainer-Sicht. Fokus auf den naechsten Termin, darunter
// die Woche - und trotzdem ist JEDE Funktion erreichbar.
// Aufruf: npm run build && node scripts/test-trainer-einfach.mjs
import { chromium } from "playwright-core";
import http from "http"; import fs from "fs"; import path from "path";
const dist = path.resolve("dist");
const srv = http.createServer((req,res)=>{ let p=path.join(dist,req.url.split("?")[0]); if(!fs.existsSync(p)||fs.statSync(p).isDirectory()) p=path.join(dist,"index.html"); res.setHeader("content-type",{".html":"text/html",".js":"text/javascript",".css":"text/css"}[path.extname(p)]||"text/plain"); res.end(fs.readFileSync(p)); }).listen(4249);
const exe=process.env.PLAYWRIGHT_CHROMIUM||"/opt/pw-browsers/chromium-1194/chrome-linux/chrome";
const browser = await chromium.launch({ executablePath:exe, args:["--no-sandbox"] });
const page = await browser.newPage({ viewport:{ width:390, height:844 } });
const errors=[]; const fails=[];
page.on("pageerror", e=>errors.push(e.message));
page.on("dialog", d=>d.accept());
const fail=m=>{ fails.push(m); console.log("FEHLGESCHLAGEN:", m); };
const ok=m=>console.log("OK:", m);
const body=()=>page.evaluate(()=>document.body.innerText);
const clickTxt=re=>page.evaluate(r=>{ const b=[...document.querySelectorAll("button")].find(x=>new RegExp(r).test(x.innerText||"")); if(!b) return false; b.click(); return true; },re instanceof RegExp?re.source:re);
const knopf=re=>page.evaluate(r=>!![...document.querySelectorAll("button")].find(x=>new RegExp(r).test(x.innerText||"")),re);
const zurueck=async()=>{ await page.keyboard.press("Escape").catch(()=>{});
  await page.evaluate(()=>{ const b=[...document.querySelectorAll("button")].find(x=>(x.getAttribute("aria-label")||"")==="Schließen"||(x.innerText||"").trim()==="✕"||/Abbrechen/.test(x.innerText||"")); b&&b.click(); });
  await page.waitForTimeout(800); };
const dismiss=async()=>{ for(let k=0;k<10;k++){ const done=await page.evaluate(()=>{
  const fx=[...document.querySelectorAll("div")].filter(d=>getComputedStyle(d).position==="fixed"&&d.querySelector("button")&&d.innerText.length>30);
  for(const f of fx){ const b=[...f.querySelectorAll("button")].find(x=>/geht|Los|Verstanden|Alles klar|Fertig|Jetzt nicht|Weiter →|Überspringen|Start/i.test(x.innerText)); if(b){ b.click(); return false; } }
  return true; }); await page.waitForTimeout(420); if(done) break; } };
await page.addInitScript(()=>{ localStorage.setItem("vereinsapp_config", JSON.stringify({url:"https://127.0.0.1:1/x", key:"test"})); });
await page.goto("http://127.0.0.1:4249/", { waitUntil:"networkidle" }); await page.waitForTimeout(2500);
await page.evaluate(()=>{ sessionStorage.setItem("vereinsapp_v12_session", JSON.stringify({role:"trainer",cid:"demo",tids:["demo_f1"],name:"Demo Trainer",id:"demo_tr1"})); });
await page.reload({waitUntil:"networkidle"}); await page.waitForTimeout(2500); await dismiss();
await clickTxt("Bin dabei"); await page.waitForTimeout(1200); await dismiss();

// ===== 1) Standard ist die einfache Sicht mit Fokus =====
let b=await body();
if(/ALS NÄCHSTES/.test(b)) ok("Der nächste Termin steht ganz oben und groß"); else fail("Kein Fokus-Termin: "+b.slice(0,200).replace(/\n/g," | "));
if(/\d+ von \d+ zugesagt/.test(b)&&/\d+ offen/.test(b)) ok("Der Stand steht in einer Zeile: "+(b.match(/\d+ von \d+ zugesagt[^\n]*/)||[""])[0]);
else fail("Stand der Rückmeldungen fehlt");
if(/BIS [A-ZÄÖÜ]+ \(\d+\)/.test(b)) ok("Darunter die restliche Woche: "+(b.match(/BIS [A-ZÄÖÜ]+ \(\d+\)/)||[""])[0]);
else console.log("HINWEIS: nur ein Termin in dieser Woche");
if(!/Plane Trainings, Spiele & Turniere/.test(b)) ok("Der lange Erklärkasten ist weg"); else fail("Erklärkasten steht weiter vor dem Termin");
{ const n=await page.evaluate(()=>document.body.innerText.split(/\s+/).filter(Boolean).length);
  if(n<=180) ok("Wenig Text auf dem Bildschirm ("+n+" Wörter)"); else fail("Zu viel Text: "+n+" Wörter"); }

{ const gross=await page.evaluate(()=>{
    const raus=[];
    for(const el of document.querySelectorAll("div,span,p,h1,h2,h3,button")){
      if(!el.children.length&&(el.innerText||"").trim().length>1){
        const fs=parseFloat(getComputedStyle(el).fontSize)||0;
        const r=el.getBoundingClientRect();
        if(fs>20&&r.height>0&&r.top<800) raus.push(Math.round(fs)+"px: "+el.innerText.trim().slice(0,24));
      } }
    return raus; });
  if(!gross.length) ok("Keine überlaute Schrift mehr (alles ≤ 20 px)");
  else fail("Zu große Schrift: "+gross.slice(0,3).join(" | ")); }

// ===== 2) Alle Funktionen erreichbar =====
for(const [was,re] of [["Termin ansehen","^Ansehen$|✅ Anwesenheit"],["Aufbau","🏗 Aufbau"],["Trainingsplan","📋 Training"],["Erinnern","🔔 Erinnern \\(\\d+\\)"],["Neuer Termin","Neuen Termin anlegen"],["Alles anzeigen","Alles anzeigen"]]){
  if(await knopf(re)) ok("Direkt erreichbar: "+was); else fail("Fehlt im Fokus: "+was);
}
// Die Karte "Neuen Termin anlegen" steht ueber dem naechsten Termin
{ const oben=await page.evaluate(()=>{
    const b=[...document.querySelectorAll("button")].find(x=>/Neuen Termin anlegen/.test(x.innerText||""));
    const l=[...document.querySelectorAll("div")].find(d=>/^ALS NÄCHSTES|^AUSGEWÄHLTER TERMIN/.test((d.innerText||"").trim()));
    if(!b||!l) return {fehler:(!b?"kein Knopf":"")+(!l?" kein Label":"")};
    return b.getBoundingClientRect().top < l.getBoundingClientRect().top;
  });
  if(oben===true) ok("„Neuen Termin anlegen“ steht über dem nächsten Termin");
  else fail("Neuer Termin steht nicht oben: "+JSON.stringify(oben)); }
{ const b2=await body();
  if(/Ich:/.test(b2)&&/Bin dabei/.test(b2)&&/Sage ab/.test(b2)) ok("Der Trainer kann direkt selbst zu- und absagen");
  else fail("Eigene Zu-/Absage fehlt auf der Fokus-Karte"); }
await clickTxt("⋯ Mehr"); await page.waitForTimeout(600);
b=await body();
for(const [was,re] of [["Rückmeldungen",/📊 Rückmeldungen/],["Bearbeiten",/✏️ Bearbeiten/],["Spickzettel",/📋 Spickzettel/],["Vertretung",/🆘 Vertretung/],["Stimmen zurücksetzen",/↺ Stimmen/],["Löschen",/🗑 Löschen/]]){
  if(re.test(b)) ok("Unter „mehr“ erreichbar: "+was); else fail("Fehlt unter „mehr“: "+was);
}

// ===== 3) Die Knöpfe tun auch etwas =====
await clickTxt("^Ansehen$|^✅ Anwesenheit$"); await page.waitForTimeout(1200);
b=await body();
if(/Rückmeldungen|Anwesenheit abhaken/.test(b)) ok("„Ansehen“ öffnet den Termin"); else fail("Termin öffnet nicht: "+b.slice(0,160).replace(/\n/g," | "));
await zurueck();
await clickTxt("🏗 Aufbau"); await page.waitForTimeout(1200);
b=await body();
if(/Aufbau|Das wird gebraucht|Feld 1/.test(b)) ok("„Aufbau“ öffnet die Aufbau-Liste"); else fail("Aufbau öffnet nicht");
await zurueck();

// ===== 4) Anderen Termin antippen macht ihn groß =====
b=await body();
if(/BIS [A-ZÄÖÜ]+/.test(b)){
  const vorher=(b.match(/ALS NÄCHSTES[\s\S]{0,120}/)||[""])[0];
  await page.evaluate(()=>{ const kopf=[...document.querySelectorAll("div")].find(d=>/^BIS [A-ZÄÖÜ]+/.test((d.innerText||"").trim()));
    const liste=kopf&&kopf.nextElementSibling; const zeile=liste&&liste.children[0]; zeile&&zeile.click(); });
  await page.waitForTimeout(900); b=await body();
  if(/AUSGEWÄHLTER TERMIN/.test(b)) ok("Ein anderer Termin lässt sich groß machen"); else fail("Auswahl wirkt nicht: "+b.slice(0,160).replace(/\n/g," | "));
}

// ===== 5) Umschalten auf die volle Liste und zurück =====
await clickTxt("Alles anzeigen"); await page.waitForTimeout(1200);
b=await body();
if(/NÄCHSTE 21 TAGE|Neuen Termin anlegen|Spielplan von fussball/.test(b)) ok("„Alles anzeigen“ bringt die vollständige Liste");
else fail("Vollansicht fehlt: "+b.slice(0,200).replace(/\n/g," | "));
{ const merk=await page.evaluate(()=>localStorage.getItem("va_tsimple"));
  if(merk==="0") ok("Die Wahl wird gemerkt"); else fail("Wahl nicht gemerkt: "+merk); }
await clickTxt("Zurück zur einfachen Sicht"); await page.waitForTimeout(1000);
b=await body();
if(/ALS NÄCHSTES/.test(b)) ok("Und zurück zur einfachen Sicht"); else fail("Rückweg fehlt");

if(errors.length){ console.log("JS-FEHLER:"); [...new Set(errors)].forEach(e=>console.log(" -",e.slice(0,150))); }
console.log(errors.length||fails.length?`ERGEBNIS: ${fails.length} Fehlschläge, ${errors.length} JS-Fehler`:"ERGEBNIS: ALLES OK");
await browser.close(); srv.close();
process.exit(errors.length||fails.length?1:0);
