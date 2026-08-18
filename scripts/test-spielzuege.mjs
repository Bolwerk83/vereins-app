// E2E-Test: Spielzug-Bibliothek (150 echte Spielvorgaenge), Torschuss-Uebungen
// mit Aufstellung, Material je Mannschaft und das Entwicklungs-Log.
// Aufruf: npm run build && node scripts/test-spielzuege.mjs
import { chromium } from "playwright-core";
import http from "http"; import fs from "fs"; import path from "path";
const dist = path.resolve("dist");
const srv = http.createServer((req,res)=>{ let p=path.join(dist,req.url.split("?")[0]); if(!fs.existsSync(p)||fs.statSync(p).isDirectory()) p=path.join(dist,"index.html"); res.setHeader("content-type",{".html":"text/html",".js":"text/javascript",".css":"text/css"}[path.extname(p)]||"text/plain"); res.end(fs.readFileSync(p)); }).listen(4225);
const exe=process.env.PLAYWRIGHT_CHROMIUM||"/opt/pw-browsers/chromium-1194/chrome-linux/chrome";
const browser = await chromium.launch({ executablePath:exe, args:["--no-sandbox"] });
const page = await browser.newPage({ viewport:{ width:390, height:900 } });
const errors=[]; const fails=[];
page.on("pageerror", e=>errors.push(e.message));
page.on("dialog", d=>d.accept());
const fail=m=>{ fails.push(m); console.log("FEHLGESCHLAGEN:", m); };
const ok=m=>console.log("OK:", m);
const body=()=>page.evaluate(()=>document.body.innerText);
const clickTxt=(re,tag="button")=>page.evaluate(([r,t])=>{ const b=[...document.querySelectorAll(t)].find(x=>new RegExp(r).test(x.innerText)); if(!b) return false; b.click(); return true; },[re instanceof RegExp?re.source:re,tag]);
const clickExact=lbl=>page.evaluate(l=>{ const b=[...document.querySelectorAll("button")].find(x=>x.innerText.trim()===l); if(!b) return false; b.click(); return true; },lbl);
const skipGuide=async()=>{ for(let i=0;i<3;i++){ if(!(await clickExact("Überspringen"))) break; await page.waitForTimeout(500);} };
const dismissOverlays=async()=>{ for(let k=0;k<14;k++){ const done=await page.evaluate(()=>{
  const fx=[...document.querySelectorAll("div")].filter(d=>getComputedStyle(d).position==="fixed"&&d.querySelector("button")&&d.innerText.length>30);
  for(const f of fx){
    if(/Willkommen!/.test(f.innerText)){ const w=[...f.querySelectorAll("button")].pop(); if(w){ w.click(); return false; } }
    const b2=[...f.querySelectorAll("button")].find(x=>/geht|Los|Verstanden|Alles klar|Start|Jetzt nicht|Fertig|Speichern & loslegen|Weiter →/i.test(x.innerText)); if(b2){ b2.click(); return false; } }
  return true; }); await page.waitForTimeout(450); if(done) break; } };
await page.addInitScript(()=>{
  localStorage.setItem("vereinsapp_config", JSON.stringify({url:"https://127.0.0.1:1/x", key:"test"}));
  sessionStorage.setItem("vereinsapp_v12_session", JSON.stringify({ role:"trainer", cid:"demo", tids:["demo_f1"], name:"Demo Trainer", id:"demo_tr1" }));
});
await page.goto("http://127.0.0.1:4225/", { waitUntil:"networkidle" }); await page.waitForTimeout(2500);
await page.locator('button:has-text("Überspringen")').first().click({timeout:1500}).catch(()=>{}); await page.waitForTimeout(300);
await dismissOverlays();

// ===== 1) Spielzug-Bibliothek im Mannschafts-Bereich =====
await clickExact("Team"); await page.waitForTimeout(1400); await skipGuide();
await clickTxt("⚽ Training"); await page.waitForTimeout(600);
if(!await clickTxt("⚡ Spielzüge")) fail("Reiter „Spielzüge“ nicht gefunden");
await page.waitForTimeout(900);
let b=await body();
if(/150 echte Spielvorgänge/.test(b)) ok("Spielzug-Bibliothek mit 150 Spielvorgängen"); else fail("Bibliothek nicht gefunden: "+b.slice(0,180).replace(/\n/g," | "));
if(/Spielzüge gefunden/.test(b)) ok("Trefferzähler vorhanden"); else fail("Trefferzähler fehlt");
if(/Hinterlaufen/.test(b)) ok("Hinterlaufen steht in der Liste"); else fail("Hinterlaufen fehlt");
// Kategorie-Filter
if(await clickTxt("🥅 Abschluss")) ok("Kategorie-Filter vorhanden"); else fail("Kategorie-Filter fehlt");
await page.waitForTimeout(600);
b=await body();
if(!/Hinterlaufen/.test(b)&&/Torschuss|Abschluss/.test(b)) ok("Filter grenzt die Liste ein"); else fail("Filter wirkt nicht");
await clickTxt("⭐ Alle"); await page.waitForTimeout(500);
// Suche
await page.locator('input[placeholder*="Spielzug suchen"]').fill("hinterlaufen"); await page.waitForTimeout(600);
b=await body();
if(/1 Spielzug gefunden|Hinterlaufen/.test(b)) ok("Suche findet den Spielzug"); else fail("Suche findet nichts");
// Detail oeffnen
await clickTxt("Hinterlaufen"); await page.waitForTimeout(900);
b=await body();
if(/„Hinterlaufen!“/.test(b)) ok("Zuruf für den Platz wird angezeigt (Hinterlaufen!)"); else fail("Zuruf fehlt: "+b.slice(0,200).replace(/\n/g," | "));
if(/SO LÄUFT ES AB/.test(b)) ok("Ablauf in Schritten erklärt"); else fail("Ablauf fehlt");
if(/Warum das wirkt/.test(b)) ok("Erklärung, warum es den Gegner überrascht"); else fail("Warum-Block fehlt");
if(/Beispiel:/.test(b)&&/F-Jugend/.test(b)) ok("Beispiel aus dem Spiel (F-Jugend)"); else fail("Beispiel fehlt");
if(/▶ Spielzug abspielen/.test(b)) ok("Spielzug lässt sich abspielen"); else fail("Abspielen fehlt");
const svgs=await page.evaluate(()=>[...document.querySelectorAll("svg")].length);
if(svgs>0) ok("Gezeichnete Spielzug-Skizze vorhanden"); else fail("Skizze fehlt");
// Vollbild fuer die Kinder
if(await clickTxt("Den Spielern zeigen")){ await page.waitForTimeout(800);
  b=await body();
  if(/Fertig/.test(b)&&/Hinterlaufen/.test(b)) ok("Vollbild zum Vorzeigen für die Spieler"); else fail("Vollbild fehlt");
  await clickTxt("^Fertig$"); await page.waitForTimeout(500);
} else fail("Knopf „Den Spielern zeigen“ fehlt");
await clickTxt("^Schließen$"); await page.waitForTimeout(500);

// ===== 2) Torschuss-Übungen mit Aufstellung =====
await clickTxt("⚽ Training"); await page.waitForTimeout(400);
await clickTxt("Übungen|Übung");
await page.waitForTimeout(900);
b=await body();
{ const inp=await page.locator('input[placeholder*="Übung suchen"]').count();
  if(inp>0){
    await page.locator('input[placeholder*="Übung suchen"]').first().fill("Torjäger"); await page.waitForTimeout(700);
    b=await body();
    if(/Torjäger-Parcours/.test(b)) ok("Neue Torschuss-Übung auf das große F-Jugend-Tor gefunden"); else fail("Torschuss-Übung fehlt: "+b.slice(0,180).replace(/\n/g," | "));
    await clickTxt("Torjäger-Parcours"); await page.waitForTimeout(900);
    b=await body();
    if(/WER STEHT WO/.test(b)) ok("Übung erklärt die Aufstellung („wer steht wo“)"); else fail("Aufstellung fehlt");
    if(/große F-Jugend-Tor|großen F-Jugend-Tore|große Tor/.test(b)) ok("Abschluss auf die großen F-Jugend-Tore"); else fail("Hinweis auf die großen Tore fehlt");
    await page.keyboard.press("Escape").catch(()=>{});
    await clickTxt("^Schließen$"); await page.waitForTimeout(400);
  } else fail("Übungs-Bibliothek nicht erreichbar");
}

// ===== 3) Material je Mannschaft =====
await clickTxt("🗂️ Organisation"); await page.waitForTimeout(400);
if(await clickTxt("🧰 Material")){ await page.waitForTimeout(800);
  b=await body();
  if(/Material der Mannschaft/.test(b)) ok("Material-Bereich je Mannschaft"); else fail("Material-Bereich fehlt");
  if(/🌳 Draußen/.test(b)&&/🏠 Halle/.test(b)) ok("Getrennt für draußen und Halle"); else fail("Drinnen/Draußen fehlt");
  if(/Minitore/.test(b)&&/Leibchen/.test(b)) ok("Material-Liste vollständig"); else fail("Material-Liste unvollständig");
  await page.evaluate(()=>{ const b2=[...document.querySelectorAll("button")].find(x=>x.getAttribute("aria-label")&&/Hütchen mehr/.test(x.getAttribute("aria-label"))); b2&&b2.click(); });
  await page.waitForTimeout(700);
  b=await body();
  if(/Gespeichert/.test(b)) ok("Eintrag wird gespeichert und bestätigt"); else fail("Speicher-Bestätigung fehlt");
} else fail("Material-Reiter fehlt");

// ===== 4) Spielzüge aus der Taktiktafel =====
await clickExact("Taktik"); await page.waitForTimeout(1800); await skipGuide();
await dismissOverlays();
b=await body();
if(/⚡ Spielzüge aus der Bibliothek \(150\)/.test(b)) ok("Taktiktafel verweist auf die 150 Spielzüge"); else fail("Knopf in der Taktiktafel fehlt");
await clickTxt("Spielzüge aus der Bibliothek"); await page.waitForTimeout(900);
b=await body();
if(/Auf die Taktiktafel legen|Spielzug suchen/.test(b)) ok("Bibliothek öffnet sich über der Tafel"); else fail("Bibliothek öffnet nicht: "+b.slice(0,150).replace(/\n/g," | "));
await clickTxt("Doppelpass"); await page.waitForTimeout(800);
if(await clickTxt("Auf die Taktiktafel legen")){ await page.waitForTimeout(1200);
  b=await body();
  if(/liegt auf der Tafel|Spielzug übernommen/.test(b)) ok("Spielzug landet auf der Taktiktafel"); else fail("Übernahme nicht bestätigt: "+b.slice(0,200).replace(/\n/g," | "));
} else fail("Knopf „Auf die Taktiktafel legen“ fehlt");

// ===== 5) Entwicklungs-Log =====
await clickExact("Mehr"); await page.waitForTimeout(900);
if(await clickTxt("📈 Entwicklung")){ await page.waitForTimeout(900);
  b=await body();
  if(/So wächst eure App/.test(b)) ok("Entwicklungs-Log erreichbar"); else fail("Entwicklungs-Log fehlt");
  if(/Neue Funktion/.test(b)&&/Behobener Fehler/.test(b)) ok("Features und behobene Fehler getrennt gezählt"); else fail("Trennung Feature/Fehler fehlt");
  if(/Verbesserungen seit/.test(b)) ok("Zeigt, wie viel seit dem Start passiert ist"); else fail("Gesamtzahl fehlt");
  await clickTxt("🙋 Helfer"); await page.waitForTimeout(600);
  b=await body();
  if(/Eintr(a|ä)g/.test(b)&&/Helfer/.test(b)) ok("Bereiche einzeln anschaubar (Helfer)"); else fail("Bereichsfilter wirkt nicht");
  await page.locator('input[placeholder*="Suchen"]').first().fill("Push"); await page.waitForTimeout(600);
  await clickTxt("Filter zurücksetzen"); await page.waitForTimeout(500);
  b=await body();
  if(/Und weiter geht/.test(b)) ok("Positiver Abschluss-Hinweis („und weiter geht's“)"); else fail("Abschluss-Hinweis fehlt");
} else fail("Kein Zugang zum Entwicklungs-Log");

if(errors.length){ console.log("JS-FEHLER:"); [...new Set(errors)].forEach(e=>console.log(" -",e.slice(0,150))); }
console.log(errors.length||fails.length?`ERGEBNIS: ${fails.length} Fehlschläge, ${errors.length} JS-Fehler`:"ERGEBNIS: ALLES OK");
await browser.close(); srv.close();
process.exit(errors.length||fails.length?1:0);
