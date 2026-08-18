// E2E-Test Aufbau-Plan: bildliche Aufbaukarte fuer Trainer UND Helfer.
// Feldmasse/Torgroesse aus der DFB-Spielform, Schritt-fuer-Schritt-Anleitung
// in Laien-Sprache, gemeinsames Abhaken, Hinweis vom Trainer an die Helfer.
// Aufruf: npm run build && node scripts/test-aufbau.mjs
import { chromium } from "playwright-core";
import http from "http"; import fs from "fs"; import path from "path";
const dist = path.resolve("dist");
const srv = http.createServer((req,res)=>{ let p=path.join(dist,req.url.split("?")[0]); if(!fs.existsSync(p)||fs.statSync(p).isDirectory()) p=path.join(dist,"index.html"); res.setHeader("content-type",{".html":"text/html",".js":"text/javascript",".css":"text/css"}[path.extname(p)]||"text/plain"); res.end(fs.readFileSync(p)); }).listen(4221);
const exe=process.env.PLAYWRIGHT_CHROMIUM||"/opt/pw-browsers/chromium-1194/chrome-linux/chrome";
const browser = await chromium.launch({ executablePath:exe, args:["--no-sandbox"] });
const page = await browser.newPage({ viewport:{ width:390, height:900 } });
const errors=[]; const fails=[];
page.on("pageerror", e=>errors.push(e.message));
page.on("dialog", d=>d.accept());
const fail=m=>{ fails.push(m); console.log("FEHLGESCHLAGEN:", m); };
const ok=m=>console.log("OK:", m);
const body=()=>page.evaluate(()=>document.body.innerText);
const closeEv=async()=>{ await page.getByRole('button',{name:'Schließen',exact:true}).first().click().catch(()=>{}); await page.keyboard.press("Escape").catch(()=>{}); await page.waitForTimeout(400); };
const dismissOverlays=async()=>{ for(let k=0;k<14;k++){ const done=await page.evaluate(()=>{
  const fx=[...document.querySelectorAll("div")].filter(d=>getComputedStyle(d).position==="fixed"&&d.querySelector("button")&&d.innerText.length>30);
  for(const f of fx){
    if(/Willkommen!/.test(f.innerText)){ const w=[...f.querySelectorAll("button")].pop(); if(w){ w.click(); return false; } }
    const b2=[...f.querySelectorAll("button")].find(x=>/geht|Los|Verstanden|Alles klar|Start|Jetzt nicht|Fertig|Speichern & loslegen|Weiter →/i.test(x.innerText)); if(b2){ b2.click(); return false; } }
  return true; }); await page.waitForTimeout(500); if(done) break; } };
await page.addInitScript(()=>{
  localStorage.setItem("vereinsapp_config", JSON.stringify({url:"https://127.0.0.1:1/x", key:"test"}));
  if(!sessionStorage.getItem("va_role")) sessionStorage.setItem("vereinsapp_v12_session", JSON.stringify({ role:"trainer", cid:"demo", tids:["demo_f1"], name:"Demo Trainer", id:"demo_tr1" }));
});
await page.goto("http://127.0.0.1:4221/", { waitUntil:"networkidle" }); await page.waitForTimeout(2500);
await page.locator('button:has-text("Überspringen")').first().click().catch(()=>{}); await page.waitForTimeout(300);
await dismissOverlays();

// ===== 1) Trainer: Aufbau-Plan im Orga-Reiter =====
await page.locator('button:has-text("Ansehen")').first().click(); await page.waitForTimeout(800);
await page.locator('button:has-text("👥 Orga")').first().click(); await page.waitForTimeout(600);
let b=await body();
if(b.includes("Aufbau-Plan")) ok("Aufbau-Plan im Orga-Reiter (Trainer)"); else fail("Aufbau-Plan fehlt: "+b.slice(0,150));
if(/F-JUGEND/i.test(b)&&/3:3/.test(b)) ok("Spielform der Jugend wird erkannt (F-Jugend)"); else fail("Spielform fehlt: "+(b.match(/Aufbau-Plan[\s\S]{0,200}/)||["?"])[0].replace(/\n/g," | "));
if(b.includes("35 m")&&b.includes("25 m")) ok("Feldmaße 35 × 25 m aus der DFB-Spielform"); else fail("Feldmaße fehlen");
if(/Minitore/.test(b)) ok("Torgröße wird genannt (Minitore)"); else fail("Torgröße fehlt");
if(/Schritte/.test(b)) ok("Maße zusätzlich in großen Schritten (ohne Maßband)"); else fail("Schritt-Umrechnung fehlt");
// Bildliche Skizze
const sk=await page.evaluate(()=>{ const s=[...document.querySelectorAll("svg")].find(x=>/Spielfeld \d+ mal \d+ Meter/.test(x.getAttribute("aria-label")||"")); return s?{lbl:s.getAttribute("aria-label"),rects:s.querySelectorAll("rect").length,cones:s.querySelectorAll("circle").length}:null; });
if(sk&&sk.rects>=3&&sk.cones>=6) ok("Gezeichnete Feldskizze mit Toren und Hütchen ("+sk.lbl+")"); else fail("Feldskizze fehlt/unvollständig: "+JSON.stringify(sk));
// Materialliste
for(const [needle,label] of [["Tor","Tore"],["Hütchen","Hütchen"],["Leibchen","Leibchen"],["Bälle","Bälle"],["Min Aufbau","Zeitbedarf"]])
  if(b.includes(needle)) ok("Materialliste nennt "+label); else fail("Material fehlt: "+label);
// Laien-Schritte
const steps=["Feld abstecken","Tore aufstellen","Tore sichern","Hütchen setzen","Material bereitlegen","Sicherheits-Check","abbauen"];
const missing=steps.filter(x=>!b.includes(x));
if(!missing.length) ok("7 Schritte für Laien erklärt (Abstecken → Tore → Sichern → … → Abbau)"); else fail("Schritte fehlen: "+missing.join(", "));
if(b.includes("0/7 erledigt")) ok("Fortschritt startet bei 0/7"); else fail("Fortschritt-Anzeige fehlt: "+(b.match(/\d\/7[^\n]*/)||["?"])[0]);

// ===== 2) Abhaken wird mit Namen festgehalten =====
await page.evaluate(()=>{ const b2=[...document.querySelectorAll("button")].filter(x=>x.innerText.trim()==="✓ Erledigt"); b2[0]&&b2[0].click(); });
await page.waitForTimeout(700);
b=await body();
if(b.includes("erledigt von Demo Trainer")) ok("Abgehakter Schritt zeigt, wer ihn erledigt hat"); else fail("Urheber des Häkchens fehlt");
if(b.includes("1/7 erledigt")) ok("Fortschritt zählt mit (1/7)"); else fail("Fortschritt zählt nicht: "+(b.match(/\d\/7[^\n]*/)||["?"])[0]);

// ===== 3) Anzahl Felder anpassbar =====
b=await body();
if(/1 Feld aufbauen/.test(b)) ok("Feld-Anzahl automatisch vorgeschlagen"); else fail("Feld-Vorschlag fehlt: "+(b.match(/Feld(er)? aufbauen[^\n]*/)||["?"])[0]);
await page.locator('button[aria-label="Ein Feld mehr"]').first().click(); await page.waitForTimeout(600);
b=await body();
if(/2 Felder aufbauen/.test(b)) ok("Feld-Anzahl anpassbar (+)"); else fail("Feld-Anzahl nicht anpassbar");
if(/2 solche Felder nebeneinander/.test(await page.evaluate(()=>[...document.querySelectorAll("svg text")].map(t=>t.textContent).join(" ")))) ok("Skizze passt sich der Feld-Anzahl an"); else fail("Skizzen-Titel passt nicht");
if(/3 m Abstand/.test(b)) ok("Hinweis auf Abstand zwischen den Feldern"); else fail("Abstands-Hinweis fehlt");

// ===== 4) Hinweis vom Trainer an die Helfer =====
await page.locator('input[placeholder*="Tore stehen hinter"]').fill("Tore stehen hinter der Hütte");
await page.waitForTimeout(700);
await closeEv();

// ===== 5) Spickzettel fasst den Aufbau zusammen =====
await page.evaluate(()=>{ const b2=[...document.querySelectorAll("button")].find(x=>x.innerText.includes("⋯")); b2&&b2.click(); });
await page.waitForTimeout(400);
await page.locator('button:has-text("📋 Spickzettel")').first().click(); await page.waitForTimeout(800);
b=await body();
if(/AUFBAU/.test(b)&&/Hütchen/.test(b)) ok("Spickzettel zeigt den Aufbau in einer Zeile"); else fail("Aufbau-Zeile im Spickzettel fehlt");
if(/Aufbau-Plan/.test(b)) ok("Spickzettel verweist auf den ausführlichen Aufbau-Plan"); else fail("Verweis fehlt");
await page.keyboard.press("Escape").catch(()=>{}); await page.waitForTimeout(400);
await page.evaluate(()=>{ const b2=[...document.querySelectorAll("button")].find(x=>x.innerText.trim()==="Schließen"); b2&&b2.click(); });
await page.waitForTimeout(400);

// ===== 6) Helfer anlegen und einloggen =====
await page.locator('button:has-text("Mehr")').last().click(); await page.waitForTimeout(600);
await page.locator('button:has-text("Helfer")').last().click(); await page.waitForTimeout(700);
await page.locator('button:has-text("+ Neuer Helfer")').click(); await page.waitForTimeout(500);
await page.locator('input[placeholder*="Maria"]').fill("Aufbau Anton"); await page.waitForTimeout(200);
const pw=await page.evaluate(()=>{ const sp=[...document.querySelectorAll("span")].find(x=>x.style.fontFamily==="monospace"&&/^[A-Za-z0-9]{6}$/.test(x.textContent.trim())); return sp?sp.textContent.trim():null; });
await page.locator('button:has-text("Speichern")').last().click(); await page.waitForTimeout(700);
if(pw) ok("Helfer angelegt (Einmal-Passwort "+pw+")"); else fail("Kein Einmal-Passwort");
await page.keyboard.press("Escape").catch(()=>{}); await page.waitForTimeout(300);
await page.evaluate(()=>{ const b2=[...document.querySelectorAll("button")].find(x=>x.innerText.trim()==="Logout"); b2&&b2.click(); });
await page.waitForTimeout(1000);
await page.getByText("Turnier & Spieltag unterstützen").click(); await page.waitForTimeout(900);
await page.evaluate(()=>{ const cards=[...document.querySelectorAll("div")].filter(d=>String(d.className).includes("up")&&/\d+ Helfer/.test(d.innerText)&&d.innerText.length<120); cards[0]&&cards[0].click(); });
await page.waitForTimeout(700);
if((await body()).includes("Welcher Helfer bist du?")){ await page.getByText("Aufbau Anton",{exact:false}).first().click(); await page.waitForTimeout(500); }
await page.locator('input[type="password"]').first().fill(pw);
await page.locator('button:has-text("Anmelden")').click(); await page.waitForTimeout(800);
const pws=page.locator('input[type="password"]');
await pws.nth(0).fill("anton123"); await pws.nth(1).fill("anton123");
await page.locator('button:has-text("Passwort speichern & einloggen")').click(); await page.waitForTimeout(1500);
await dismissOverlays();
b=await body();

// ===== 7) Helfer: Aufbau direkt auf der Terminkarte =====
if(b.includes("🏗 Aufbau")) ok("Helfer hat den Aufbau-Knopf direkt auf der Terminkarte"); else fail("Aufbau-Knopf auf der Helfer-Karte fehlt");
if(!b.includes("Bearbeiten")) ok("Helfer kann Termine nicht bearbeiten"); else fail("Bearbeiten-Knopf beim Helfer sichtbar");
await page.evaluate(()=>{ const b2=[...document.querySelectorAll("button")].find(x=>x.innerText.trim()==="🏗 Aufbau"); b2&&b2.click(); });
await page.waitForTimeout(1400);
b=await body();
// "Aufbau" ist ein eigenes Fenster - nicht der ganze Termin mit allen Reitern
if(b.includes("🏗 Aufbau –")&&!/📊 Rückmeldungen/.test(b)) ok("„Aufbau“ öffnet ein eigenes Fenster (nicht den ganzen Termin)"); else fail("Aufbau-Fenster nicht eigenständig: "+b.slice(0,160).replace(/\n/g," | "));
if(!(await body()).includes("Aufbau-Plan")){ await page.locator('button:has-text("👥 Orga")').first().click().catch(()=>{}); await page.waitForTimeout(700); }
b=await body();
if(b.includes("Aufbau-Plan")) ok("Ein Tipp führt zum Aufbau-Plan"); else fail("Aufbau-Plan beim Helfer nicht erreichbar: "+b.slice(0,150));
if(b.includes("Feld abstecken")&&b.includes("Minitore")) ok("Helfer sieht Feldmaße, Tore und die Schritte"); else fail("Aufbau-Details beim Helfer unvollständig");
if(b.includes("Hinweis vom Trainer: Tore stehen hinter der Hütte")) ok("Hinweis des Trainers erreicht den Helfer"); else fail("Trainer-Hinweis fehlt beim Helfer");
{ const inp=await page.locator('input[placeholder*="Tore stehen hinter"]').count();
  if(inp===0) ok("Helfer kann den Trainer-Hinweis nicht überschreiben"); else fail("Helfer kann den Hinweis bearbeiten"); }
// Helfer hakt ab -> Trainer sieht es
await page.evaluate(()=>{ const b2=[...document.querySelectorAll("button")].filter(x=>x.innerText.trim()==="✓ Erledigt"); b2[0]&&b2[0].click(); });
await page.waitForTimeout(800);
b=await body();
if(b.includes("erledigt von Aufbau Anton")) ok("Helfer kann abhaken – mit Namen"); else fail("Helfer-Häkchen ohne Namen/nicht möglich");
if(b.includes("2/7 erledigt")) ok("Trainer- und Helfer-Häkchen laufen zusammen (2/7)"); else fail("Gemeinsamer Fortschritt fehlt: "+(b.match(/\d\/7[^\n]*/)||["?"])[0]);
await closeEv();
// Gegenprobe: "Ansehen" zeigt den ganzen Termin mit Reitern
await page.locator('button:has-text("Ansehen")').first().click().catch(()=>{}); await page.waitForTimeout(900);
b=await body();
if(/📊 Rückmeldungen/.test(b)&&/👥 Orga/.test(b)) ok("„Ansehen“ zeigt dagegen den ganzen Termin mit Reitern"); else fail("„Ansehen“ unterscheidet sich nicht: "+b.slice(0,160).replace(/\n/g," | "));
await closeEv();

// ===== 8) Gegenprobe beim Trainer =====
await page.evaluate(()=>{ sessionStorage.setItem("va_role","1"); sessionStorage.setItem("vereinsapp_v12_session", JSON.stringify({ role:"trainer", cid:"demo", tids:["demo_f1"], name:"Demo Trainer", id:"demo_tr1" })); });
await page.reload({waitUntil:"networkidle"}); await page.waitForTimeout(2500);
await page.locator('button:has-text("Überspringen")').first().click().catch(()=>{}); await page.waitForTimeout(300);
await dismissOverlays();
await page.locator('button:has-text("Ansehen")').first().click(); await page.waitForTimeout(800);
await page.locator('button:has-text("👥 Orga")').first().click(); await page.waitForTimeout(600);
b=await body();
if(b.includes("erledigt von Aufbau Anton")) ok("Trainer sieht, was der Helfer schon aufgebaut hat"); else fail("Helfer-Fortschritt beim Trainer unsichtbar");

if(errors.length){ console.log("JS-FEHLER:"); [...new Set(errors)].forEach(e=>console.log(" -",e.slice(0,150))); }
console.log(errors.length||fails.length?`ERGEBNIS: ${fails.length} Fehlschläge, ${errors.length} JS-Fehler`:"ERGEBNIS: ALLES OK");
await browser.close(); srv.close();
process.exit(errors.length||fails.length?1:0);
