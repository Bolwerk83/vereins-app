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
if(b.includes("Das wird gebraucht")) ok("Aufbau-Liste im Orga-Reiter (Trainer)"); else fail("Aufbau-Liste fehlt: "+b.slice(0,150));
if(/3:3/.test(b)&&/Funino/.test(b)) ok("Spielform der Jugend wird erkannt (Funino 3:3)"); else fail("Spielform fehlt: "+b.slice(0,200).replace(/\n/g," | "));
if(/35 × 25 m/.test(b)) ok("Feldmaße 35 × 25 m stehen auf der Feld-Karte"); else fail("Feldmaße fehlen");
if(/Minitore/.test(b)) ok("Torgröße wird genannt (Minitore)"); else fail("Torgröße fehlt");
if(/Schritte/.test(b)) ok("Maße zusätzlich in großen Schritten (ohne Maßband)"); else fail("Schritt-Umrechnung fehlt");
// Bildliche Skizze
await page.evaluate(()=>{ const x=[...document.querySelectorAll("button")].find(y=>/Wie abstecken/.test(y.innerText)); x&&x.click(); });
await page.waitForTimeout(600);
const sk=await page.evaluate(()=>{ const s=[...document.querySelectorAll("svg")].find(x=>/Spielfeld \d+ mal \d+ Meter/.test(x.getAttribute("aria-label")||"")); return s?{lbl:s.getAttribute("aria-label"),rects:s.querySelectorAll("rect").length,cones:s.querySelectorAll("circle").length}:null; });
if(sk&&sk.rects>=3&&sk.cones>=6) ok("Anleitung zeigt die gezeichnete Feldskizze ("+sk.lbl+")"); else fail("Feldskizze fehlt/unvollständig: "+JSON.stringify(sk));
b=await body();
// Materialliste
for(const [needle,label] of [["Tor","Tore"],["Hütchen","Hütchen"],["Leibchen","Leibchen"],["Bälle","Bälle"],["Min Aufbau","Zeitbedarf"]])
  if(b.includes(needle)) ok("Materialliste nennt "+label); else fail("Material fehlt: "+label);
// Einfache Liste: was muss auf welches Feld
const teile=["Minitore","Hütchen","Bälle","Leibchen","Ballsack","Erste-Hilfe","alles zurück"];
const missing=teile.filter(x=>!b.includes(x));
if(!missing.length) ok("Einfache Liste zum Abhaken (Tore, Hütchen, Bälle, Leibchen, Ballsack …)"); else fail("Liste unvollständig: "+missing.join(", "));
if(/Platzumrandung/.test(b)) ok("Hütchen sind als Platzumrandung erklärt"); else fail("Hütchen-Erklärung fehlt");
if(/Ein Ball pro Kind/.test(b)) ok("Bälle richten sich nach der Zahl der Kinder"); else fail("Ball-Regel fehlt");
if(/Wie abstecken|Anleitung zu/.test(b)) ok("Ausführliche Anleitung nur auf Wunsch (aufklappbar)"); else fail("Anleitung nicht aufklappbar");
if(/0\/7 erledigt/.test(b)) ok("Fortschritt startet bei 0/7 (4 Schritte fürs Feld + 3 gemeinsame)"); else fail("Fortschritt-Anzeige fehlt: "+(b.match(/\d+\/\d+ erledigt/)||["?"])[0]);

// ===== 2) Abhaken wird mit Namen festgehalten =====
await page.getByText(/^\d+ Minitore$/).first().click().catch(()=>{});
await page.waitForTimeout(700);
b=await body();
if(b.includes("erledigt von Demo Trainer")) ok("Angetippte Zeile zeigt, wer sie erledigt hat"); else fail("Urheber des Häkchens fehlt");
if(/1\/7 erledigt/.test(b)) ok("Fortschritt zählt mit (1/7)"); else fail("Fortschritt zählt nicht: "+(b.match(/\d+\/\d+ erledigt/)||["?"])[0]);

// ===== 2b) Uebersichtliche Feld-Karten =====
b=await body();
if(/Feld 1/.test(b)) ok("Jedes Feld hat eine eigene Karte (Feld 1)"); else fail("Feld-Karten fehlen");
if(/Feld 1[\s\S]{0,60}\d+ × \d+ m/.test(b)) ok("Feld-Karte nennt direkt die Maße"); else fail("Feld-Maße auf der Karte fehlen: "+(b.match(/Feld 1[\s\S]{0,120}/)||["?"])[0].replace(/\n/g," | "));
if(/Für alle Felder zusammen/.test(b)) ok("Was für alle gilt, steht getrennt darunter (Ballsack & Co.)"); else fail("Gemeinsamer Block fehlt");
if(/Richtwert: 6–8 Kinder pro kleinem Feld/.test(b)) ok("Richtwert 6–8 (klein) bzw. volle Mannschaft (groß) ausgewiesen"); else fail("Richtwert fehlt");
if(/Automatisch gewählt/.test(b)) ok("Standard-Aufbau wird begründet"); else fail("Begründung fehlt");
if(/AUFBAU-VORSCHLÄGE/.test(b)) ok("KI schlägt einen Aufbau vor"); else fail("Vorschläge fehlen");
{ await page.evaluate(()=>{ const x=[...document.querySelectorAll("button")].find(y=>/andere zeigen/.test(y.innerText)); x&&x.click(); });
  await page.waitForTimeout(600); const b3=await body();
  const n=(b3.match(/wählen/g)||[]).length;
  if(/andere zeigen|weniger/.test(b3)&&n>=1) ok("Mehrere Varianten zur Auswahl ("+(n+1)+")"); else fail("Nur eine Variante");
  if(/Nur klein · 3:3/.test(b3)&&/Wie im Spiel · 5:5/.test(b3)) ok("Varianten reichen von Funino bis 5:5 wie im Spiel"); else fail("Varianten-Auswahl unvollständig: "+(b3.match(/AUFBAU-VORSCHLÄGE[\s\S]{0,300}/)||["?"])[0].replace(/\n/g," | ")); }
if(/⚙ Feld ändern/.test(b)) ok("Jedes Feld einzeln änderbar"); else fail("Feld-Änderung fehlt");
if(/Keine Jugendtore hinterlegt/.test(b)) ok("Ohne Jugendtore wird Funino vorgeschlagen"); else fail("Funino-Standard fehlt: "+(b.match(/Automatisch gewählt[\s\S]{0,160}/)||["?"])[0].replace(/\n/g," | "));

// ===== 3) Anzahl Felder anpassbar =====
b=await body();
if(/1 Feld\b/.test(b)) ok("Feld-Anzahl automatisch vorgeschlagen"); else fail("Feld-Vorschlag fehlt: "+(b.match(/Feld[^\n]*/)||["?"])[0]);
await page.evaluate(()=>{ const x=[...document.querySelectorAll("button")].find(y=>/\+ Feld hinzufügen/.test(y.innerText)); x&&x.click(); });
await page.waitForTimeout(800);
b=await body();
if(/2 Felder\b/.test(b)) ok("Feld lässt sich hinzufügen"); else fail("Feld-Anzahl nicht anpassbar");
if(/Feld 2/.test(b)) ok("Zweites Feld bekommt eine eigene Karte"); else fail("Feld 2 fehlt");
if(/\d+\/11 erledigt/.test(b)) ok("Fortschritt rechnet je Feld (2 Felder = 11 Schritte)"); else fail("Fortschritt pro Feld falsch: "+(b.match(/\d+\/\d+ erledigt/)||["?"])[0]);
if(/Feld 2/.test(b)) ok("Zweites Feld erscheint als eigene Karte"); else fail("Feld 2 fehlt");
await page.evaluate(()=>{ const x=[...document.querySelectorAll("button")].find(y=>/Wie abstecken/.test(y.innerText)); x&&x.click(); });
await page.waitForTimeout(500);
b=await body();
if(/3 m Abstand/.test(b)) ok("Anleitung erinnert an den Abstand zwischen den Feldern"); else fail("Abstands-Hinweis fehlt");
if(/große Schritte/.test(b)) ok("Anleitung rechnet die Meter in Schritte um"); else fail("Schritt-Umrechnung in der Anleitung fehlt");

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
{ const row=await page.evaluate(()=>{ const bs=[...document.querySelectorAll("button")]; const a=bs.find(x=>x.innerText.trim()==="Ansehen"), c=bs.find(x=>x.innerText.trim()==="🏗 Aufbau");
    if(!a||!c) return null; const ra=a.getBoundingClientRect(), rc=c.getBoundingClientRect();
    return { gleicheZeile:Math.abs(ra.top-rc.top)<4, gleicheBreite:Math.abs(ra.width-rc.width)<4, mehr:bs.some(x=>x.innerText.trim()==="⋯") }; });
  if(row&&row.gleicheZeile&&row.gleicheBreite) ok("Ansehen und Aufbau stehen sauber nebeneinander in einer Zeile"); else fail("Knopf-Zeile nicht sauber: "+JSON.stringify(row));
  if(row&&!row.mehr) ok("Kein überflüssiges ⋯-Menü beim Helfer"); else fail("⋯-Menü beim Helfer noch da"); }
if(!b.includes("Bearbeiten")) ok("Helfer kann Termine nicht bearbeiten"); else fail("Bearbeiten-Knopf beim Helfer sichtbar");
await page.evaluate(()=>{ const b2=[...document.querySelectorAll("button")].find(x=>x.innerText.trim()==="🏗 Aufbau"); b2&&b2.click(); });
await page.waitForTimeout(1400);
b=await body();
// "Aufbau" ist ein eigenes Fenster - nicht der ganze Termin mit allen Reitern
if(b.includes("🏗 Aufbau –")&&!/📊 Rückmeldungen/.test(b)) ok("„Aufbau“ öffnet ein eigenes Fenster (nicht den ganzen Termin)"); else fail("Aufbau-Fenster nicht eigenständig: "+b.slice(0,160).replace(/\n/g," | "));
if(!(await body()).includes("Das wird gebraucht")){ await page.locator('button:has-text("👥 Orga")').first().click().catch(()=>{}); await page.waitForTimeout(700); }
b=await body();
if(b.includes("Das wird gebraucht")) ok("Ein Tipp führt zur Aufbau-Liste"); else fail("Aufbau-Liste beim Helfer nicht erreichbar: "+b.slice(0,150));
if(/\d+ Minitore/.test(b)&&/\d+ Hütchen/.test(b)&&/Ballsack/.test(b)) ok("Helfer sieht die einfache Liste (Tore, Hütchen, Bälle, Ballsack)"); else fail("Aufbau-Liste beim Helfer unvollständig");
if(!/EINSTELLUNGEN FÜR DIESEN TERMIN/.test(b)) ok("Helfer bekommt keine Einstellungen zu sehen"); else fail("Einstellungen beim Helfer sichtbar");
if(b.includes("Hinweis vom Trainer: Tore stehen hinter der Hütte")) ok("Hinweis des Trainers erreicht den Helfer"); else fail("Trainer-Hinweis fehlt beim Helfer");
{ const inp=await page.locator('input[placeholder*="Tore stehen hinter"]').count();
  if(inp===0) ok("Helfer kann den Trainer-Hinweis nicht überschreiben"); else fail("Helfer kann den Hinweis bearbeiten"); }
// Helfer hakt ab -> Trainer sieht es
await page.getByText(/^\d+ Hütchen$/).first().click().catch(()=>{});
await page.waitForTimeout(800);
b=await body();
if(b.includes("erledigt von Aufbau Anton")) ok("Helfer hakt mit einem Tipp ab – mit Namen"); else fail("Helfer-Häkchen ohne Namen/nicht möglich");
if(/2\/\d+ erledigt/.test(b)) ok("Trainer- und Helfer-Häkchen laufen zusammen ("+(b.match(/\d+\/\d+ erledigt/)||[""])[0]+")"); else fail("Gemeinsamer Fortschritt fehlt: "+(b.match(/\d+\/\d+ erledigt/)||["?"])[0]);
await closeEv();
// Gegenprobe: "Ansehen" zeigt den ganzen Termin mit Reitern
await page.locator('button:has-text("Ansehen")').first().click().catch(()=>{}); await page.waitForTimeout(900);
b=await body();
if(/📊 Rückmeldungen/.test(b)) ok("„Ansehen“ zeigt dagegen den Termin selbst"); else fail("„Ansehen“ unterscheidet sich nicht: "+b.slice(0,160).replace(/\n/g," | "));
if(!/👥 Orga/.test(b)) ok("Helfer hat keinen Orga-Reiter mehr"); else fail("Orga-Reiter beim Helfer noch da");
if(!/Das wird gebraucht/.test(b)) ok("Die Aufbau-Liste steht nur im eigenen Fenster, nicht doppelt"); else fail("Aufbau-Liste doppelt im Termin");
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

// ===== 9) Standard-Regel: sind Jugendtore da, wird darauf gespielt =====
await page.keyboard.press("Escape").catch(()=>{});
await page.evaluate(()=>{ const x=[...document.querySelectorAll("button")].find(y=>y.innerText.trim()==="Schließen"); x&&x.click(); });
await page.waitForTimeout(400);
const clickExact=lbl=>page.evaluate(l=>{ const x=[...document.querySelectorAll("button")].find(y=>y.innerText.trim()===l); if(!x) return false; x.click(); return true; },lbl);
const clickTxt=re=>page.evaluate(r=>{ const x=[...document.querySelectorAll("button")].find(y=>new RegExp(r).test(y.innerText)); if(!x) return false; x.click(); return true; },re);
await clickExact("Team"); await page.waitForTimeout(1400);
for(let i=0;i<3;i++){ if(!(await clickExact("Überspringen"))) break; await page.waitForTimeout(500); }
await clickTxt("🗂️ Organisation"); await page.waitForTimeout(500);
if(await clickTxt("🧰 Material")){
  await page.waitForTimeout(800);
  for(let i=0;i<2;i++){ await page.evaluate(()=>{ const x=[...document.querySelectorAll("button")].find(y=>/Jugendtore .* mehr/.test(y.getAttribute("aria-label")||"")); x&&x.click(); }); await page.waitForTimeout(500); }
  b=await body();
  if(/Gespeichert/.test(b)) ok("2 Jugendtore im Material der Mannschaft eingetragen"); else fail("Material nicht gespeichert");
  await clickExact("Termine"); await page.waitForTimeout(1400);
  await page.evaluate(()=>{ const x=[...document.querySelectorAll("button")].find(y=>y.innerText.trim()==="🏗 Aufbau"); x&&x.click(); });
  await page.waitForTimeout(1200);
  b=await body();
  await page.evaluate(()=>{ const x=[...document.querySelectorAll("button")].find(y=>/andere zeigen/.test(y.innerText)); x&&x.click(); });
await page.waitForTimeout(600); b=await body();
if(/Wie im Spiel · 5:5/.test(b)) ok("Mit Jugendtoren ist „Wie im Spiel“ wählbar"); else fail("Standard-Regel greift nicht: "+(b.match(/AUFBAU-VORSCHLÄGE[\s\S]{0,240}/)||["?"])[0].replace(/\n/g," | "));
  await page.evaluate(()=>{ const x=[...document.querySelectorAll("div")].find(y=>/^Wie im Spiel · 5:5/.test(y.innerText)&&y.innerText.length<200); x&&x.click(); });
await page.waitForTimeout(900);
b=await body();
if(/Feld 1 · 5:5/.test(b)&&/2 Jugendtore/.test(b)) ok("Gewählt: 5:5-Spielfeld auf die großen Tore"); else fail("Spielform nicht umgestellt: "+b.slice(0,220).replace(/\n/g," | "));
if(/10 Kinder|Ein Ball pro Kind/.test(b)) ok("Auf dem 5:5-Feld wird mit voller Mannschaft gerechnet"); else fail("Kinderzahl passt nicht");
} else fail("Material-Bereich nicht erreichbar");

if(errors.length){ console.log("JS-FEHLER:"); [...new Set(errors)].forEach(e=>console.log(" -",e.slice(0,150))); }
console.log(errors.length||fails.length?`ERGEBNIS: ${fails.length} Fehlschläge, ${errors.length} JS-Fehler`:"ERGEBNIS: ALLES OK");
await browser.close(); srv.close();
process.exit(errors.length||fails.length?1:0);
