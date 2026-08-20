// E2E-Test Rollen-Durchstich: greifen die neuen Bausteine (Aufbau, Material,
// Spielzuege, Entwicklungs-Log) sauber in die vier Rollen - Trainer, Helfer,
// Eltern, Vereinsadmin - und bleibt jede Rolle bei ihren Rechten?
// Aufruf: npm run build && node scripts/test-rollen.mjs
import { chromium } from "playwright-core";
import http from "http"; import fs from "fs"; import path from "path";
const dist = path.resolve("dist");
const srv = http.createServer((req,res)=>{ let p=path.join(dist,req.url.split("?")[0]); if(!fs.existsSync(p)||fs.statSync(p).isDirectory()) p=path.join(dist,"index.html"); res.setHeader("content-type",{".html":"text/html",".js":"text/javascript",".css":"text/css"}[path.extname(p)]||"text/plain"); res.end(fs.readFileSync(p)); }).listen(4227);
const exe=process.env.PLAYWRIGHT_CHROMIUM||"/opt/pw-browsers/chromium-1194/chrome-linux/chrome";
const browser = await chromium.launch({ executablePath:exe, args:["--no-sandbox"] });
const page = await browser.newPage({ viewport:{ width:390, height:900 } });
const errors=[]; const fails=[];
page.on("pageerror", e=>errors.push(e.message));
page.on("dialog", d=>d.accept());
const fail=m=>{ fails.push(m); console.log("FEHLGESCHLAGEN:", m); };
const ok=m=>console.log("OK:", m);
const body=()=>page.evaluate(()=>document.body.innerText);
const clickExact=lbl=>page.evaluate(l=>{ const b=[...document.querySelectorAll("button")].find(x=>x.innerText.trim()===l); if(!b) return false; b.click(); return true; },lbl);
const clickTxt=re=>page.evaluate(r=>{ const b=[...document.querySelectorAll("button")].find(x=>new RegExp(r).test(x.innerText)); if(!b) return false; b.click(); return true; },re);
const dismiss=async()=>{ for(let k=0;k<14;k++){ const done=await page.evaluate(()=>{
  const fx=[...document.querySelectorAll("div")].filter(d=>getComputedStyle(d).position==="fixed"&&d.querySelector("button")&&d.innerText.length>30);
  for(const f of fx){
    if(/Willkommen!/.test(f.innerText)){ const w=[...f.querySelectorAll("button")].pop(); if(w){ w.click(); return false; } }
    const b2=[...f.querySelectorAll("button")].find(x=>/geht|Los|Verstanden|Alles klar|Start|Jetzt nicht|Fertig|Speichern & loslegen|Weiter →|Überspringen/i.test(x.innerText)); if(b2){ b2.click(); return false; } }
  return true; }); await page.waitForTimeout(450); if(done) break; } };
const modalTxt = () => page.evaluate(()=>{ const fx=[...document.querySelectorAll("div")].filter(d=>getComputedStyle(d).position==="fixed"&&/📊 Rückmeldungen/.test(d.innerText)); return fx.length?fx[0].innerText:""; });
const asUser = async sess => { await page.evaluate(s=>{ sessionStorage.setItem("va_role","1"); sessionStorage.setItem("vereinsapp_v12_session", JSON.stringify(s)); },sess);
  await page.reload({waitUntil:"networkidle"}); await page.waitForTimeout(2400);
  await page.locator('button:has-text("Überspringen")').first().click({timeout:1200}).catch(()=>{}); await page.waitForTimeout(300); await dismiss(); };
await page.addInitScript(()=>{
  localStorage.setItem("vereinsapp_config", JSON.stringify({url:"https://127.0.0.1:1/x", key:"test"}));
  localStorage.setItem("va_simple","0");   // diese Tests pruefen die ausfuehrliche Ansicht
  if(!sessionStorage.getItem("va_role")) sessionStorage.setItem("vereinsapp_v12_session", JSON.stringify({ role:"trainer", cid:"demo", tids:["demo_f1"], name:"Demo Trainer", id:"demo_tr1" }));
});
await page.goto("http://127.0.0.1:4227/", { waitUntil:"networkidle" }); await page.waitForTimeout(2500);
await page.locator('button:has-text("Überspringen")').first().click({timeout:1200}).catch(()=>{}); await page.waitForTimeout(300);
await dismiss();

// ===== 1) TRAINER: hat alle Werkzeuge =====
let b=await body();
if(/🏗 Aufbau/.test(b)) ok("Trainer: Aufbau direkt auf der Terminkarte"); else fail("Trainer ohne Aufbau-Knopf");
if(/Training (planen|steht)/.test(b)) ok("Trainer: Trainingsplan von der Karte"); else fail("Trainer ohne Trainings-Knopf");
if(/✅ Anwesenheit/.test(b)) ok("Trainer: Anwesenheit von der Karte"); else fail("Trainer ohne Anwesenheits-Knopf");
await page.locator('button[aria-label="Weitere Aktionen"]').first().click(); await page.waitForTimeout(400);
b=await body();
if(/📋 Spickzettel/.test(b)) ok("Trainer: Spickzettel im Menü"); else fail("Trainer ohne Spickzettel");
await page.locator('button[aria-label="Weitere Aktionen"]').first().click(); await page.waitForTimeout(300);
// Termin oeffnen: Orga-Reiter vorhanden
await page.locator('button:has-text("Ansehen")').first().click(); await page.waitForTimeout(900);
b=await body();
if(/👥 Orga/.test(b)) ok("Trainer: Orga-Reiter im Termin"); else fail("Trainer ohne Orga-Reiter");
await page.locator('button:has-text("👥 Orga")').first().click().catch(()=>{}); await page.waitForTimeout(600);
b=await body();
if(/Das wird gebraucht/.test(b)) ok("Trainer: Aufbau-Liste in der Orga"); else fail("Aufbau-Liste in der Orga fehlt");
if(/EINSTELLUNGEN FÜR DIESEN TERMIN/.test(b)) ok("Trainer: Einstellungen (Ort, Spielform, Felder)"); else fail("Einstellungen fehlen");
await page.evaluate(()=>{ const x=[...document.querySelectorAll("button")].find(y=>y.innerText.trim()==="Schließen"); x&&x.click(); });
await page.keyboard.press("Escape").catch(()=>{}); await page.waitForTimeout(500);

// ===== 2) ELTERN: sehen den Termin, aber keine Trainer-Interna =====
await asUser({ role:"user", cid:"demo", tid:"demo_f1", user:"Ben Fischer" });
b=await body();
if(/Bin dabei|Zusagen|Termine/i.test(b)) ok("Eltern: sehen die Termine ihres Kindes"); else fail("Eltern sehen keine Termine: "+b.slice(0,140).replace(/\n/g," | "));
if(!/Das wird gebraucht/.test(b)) ok("Eltern: keine Aufbau-Liste (ist Sache von Trainer und Helfern)"); else fail("Aufbau-Liste bei den Eltern sichtbar");
if(!/Spickzettel/.test(b)) ok("Eltern: kein Spickzettel"); else fail("Spickzettel bei den Eltern sichtbar");
if(!/EINSTELLUNGEN FÜR DIESEN TERMIN/.test(b)) ok("Eltern: keine Termin-Einstellungen"); else fail("Einstellungen bei den Eltern sichtbar");
if(!/🧰 Material/.test(b)) ok("Eltern: kein Material-Bereich"); else fail("Material-Bereich bei den Eltern sichtbar");
if(!/⚡ Spielzüge/.test(b)) ok("Eltern: keine Spielzug-Bibliothek"); else fail("Spielzüge bei den Eltern sichtbar");

// ===== 3) HELFER: nur Einsatz und Aufbau =====
await asUser({ id:"dh2", role:"helper", cid:"demo", name:"Markus Lang", helperId:"dh2", tids:["demo_f1"] });
b=await body();
if(/🏗 Aufbau/.test(b)&&/Ansehen/.test(b)) ok("Helfer: Ansehen und Aufbau auf der Karte"); else fail("Helfer-Knöpfe fehlen");
if(!/Training (planen|steht)/.test(b)) ok("Helfer: kein Trainingsplan"); else fail("Trainingsplan beim Helfer");
if(!/📋 Spickzettel/.test(b)) ok("Helfer: kein Spickzettel"); else fail("Spickzettel beim Helfer");
if(!/✏️ Bearbeiten/.test(b)) ok("Helfer: kein Bearbeiten"); else fail("Bearbeiten beim Helfer");
await page.locator('button:has-text("Ansehen")').first().click(); await page.waitForTimeout(1100);
let m=await modalTxt();
if(m) ok("Helfer: Termin lässt sich öffnen"); else fail("Termin beim Helfer nicht geöffnet");
if(m&&!/👥 Orga/.test(m)) ok("Helfer: kein Orga-Reiter"); else fail("Orga-Reiter beim Helfer");
if(/Betreuung|Helfer-Einsatz|Helfer-Dienste|Orga & Verkauf|Bereitschaft/i.test(m)) ok("Helfer: Einsatz und Dienste stehen trotzdem im Termin"); else fail("Helfer-Bereiche im Termin verschwunden: "+m.slice(0,220).replace(/\n/g," | "));
if(!/Das wird gebraucht/.test(m)) ok("Helfer: Aufbau steht nur im eigenen Fenster"); else fail("Aufbau doppelt im Termin");
await page.evaluate(()=>{ const x=[...document.querySelectorAll("button")].find(y=>y.innerText.trim()==="Schließen"); x&&x.click(); });
await page.keyboard.press("Escape").catch(()=>{}); await page.waitForTimeout(500);

// ===== 4) VEREINSADMIN: Überblick und Entwicklung =====
await asUser({ role:"admin", cid:"demo", name:"Vereinsadmin", id:"demo_admin", tids:[] });
b=await body();
if(!/Fragebogen ausfüllen|Deine Rückmeldung für die neue Saison/i.test(b)) ok("Admin: keine Eintrage-Karte des Saison-Checks"); else fail("Admin bekommt die Eintrage-Karte");
await clickExact("Mehr"); await page.waitForTimeout(800);
b=await body();
if(/📈 Entwicklung/.test(b)) ok("Admin: Entwicklungs-Log erreichbar"); else fail("Admin ohne Entwicklungs-Log");
await clickTxt("📈 Entwicklung"); await page.waitForTimeout(900);
b=await body();
if(/So wächst eure App/.test(b)&&/Neue Funktion/.test(b)) ok("Admin: sieht Features und behobene Fehler getrennt"); else fail("Entwicklungs-Log unvollständig");
if(/🏛 Vorstand & Verein|Vorstand/.test(b)) ok("Admin: Einträge nach Bereichen filterbar (auch Vorstand)"); else fail("Bereichs-Filter fehlt");

// ===== 5) Verzahnung: Trainer sieht, was der Helfer gemeldet hat =====
await asUser({ id:"dh2", role:"helper", cid:"demo", name:"Markus Lang", helperId:"dh2", tids:["demo_f1"] });
await page.evaluate(()=>{ const x=[...document.querySelectorAll("button")].find(y=>/🙋 Ich (helfe|kann helfen)/.test(y.innerText)); x&&x.click(); });
await page.waitForTimeout(900);
await asUser({ role:"trainer", cid:"demo", tids:["demo_f1"], name:"Demo Trainer", id:"demo_tr1" });
b=await body();
if(/🙋 \d+ Helfer|🙋 \d+ bereit/.test(b)) ok("Verzahnung: Helfer-Meldung erscheint beim Trainer auf der Karte"); else fail("Helfer-Meldung kommt beim Trainer nicht an: "+b.slice(0,200).replace(/\n/g," | "));
if(/Markus Lang/.test(b)) ok("Verzahnung: mit Namen"); else fail("Name fehlt beim Trainer");

if(errors.length){ console.log("JS-FEHLER:"); [...new Set(errors)].forEach(e=>console.log(" -",e.slice(0,150))); }
console.log(errors.length||fails.length?`ERGEBNIS: ${fails.length} Fehlschläge, ${errors.length} JS-Fehler`:"ERGEBNIS: ALLES OK");
await browser.close(); srv.close();
process.exit(errors.length||fails.length?1:0);
