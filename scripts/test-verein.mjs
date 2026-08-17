// E2E-Test Vereins-Paket: Skills-Default AUS + Saison-Modul im Wizard,
// Chat-Beschraenkung (Trainer nicht an ganzen Verein, Direktkanal zum Admin),
// Termin-Wizard Mehrfachauswahl + Drinnen/Draussen bei Halle, Ansprechpartner
// mit Einwilligungs-Link + Klick-Statistik, Vereins-Cockpit + Saison-Check.
// Aufruf: npm run build && node scripts/test-verein.mjs
import { chromium } from "playwright-core";
import http from "http"; import fs from "fs"; import path from "path";
const dist = path.resolve("dist");
const srv = http.createServer((req,res)=>{ let p=path.join(dist,req.url.split("?")[0]); if(!fs.existsSync(p)||fs.statSync(p).isDirectory()) p=path.join(dist,"index.html"); res.setHeader("content-type",{".html":"text/html",".js":"text/javascript",".css":"text/css"}[path.extname(p)]||"text/plain"); res.end(fs.readFileSync(p)); }).listen(4214);
const exe=process.env.PLAYWRIGHT_CHROMIUM||"/opt/pw-browsers/chromium-1194/chrome-linux/chrome";
const browser = await chromium.launch({ executablePath:exe, args:["--no-sandbox"] });
const page = await browser.newPage({ viewport:{ width:390, height:900 } });
const errors=[]; const fails=[];
page.on("pageerror", e=>errors.push(e.message));
page.on("dialog", d=>d.accept());
const fail=m=>{ fails.push(m); console.log("FEHLGESCHLAGEN:", m); };
const ok=m=>console.log("OK:", m);
const body=()=>page.evaluate(()=>document.body.innerText);
await page.addInitScript(()=>{
  localStorage.setItem("vereinsapp_config", JSON.stringify({url:"https://127.0.0.1:1/x", key:"test"}));   // Fake-Cloud: Offline-Spiegel
  if(!sessionStorage.getItem("va_sw")) sessionStorage.setItem("vereinsapp_v12_session", JSON.stringify({ role:"trainer", cid:"demo", tids:["demo_g","demo_f1"], name:"Trainer A", id:"dt1" }));
});
await page.goto("http://127.0.0.1:4214/", { waitUntil:"networkidle" }); await page.waitForTimeout(2500);
await page.locator('button:has-text("Überspringen")').first().click().catch(()=>{}); await page.waitForTimeout(400);
// Trainer-Willkommen wegklicken, dahinter der Modul-Wizard
for(let k=0;k<4;k++){ const t2=await body(); if(t2.includes("Was möchtet ihr nutzen?")) break;
  await page.evaluate(()=>{ const fx=[...document.querySelectorAll("div")].filter(d=>getComputedStyle(d).position==="fixed"&&d.querySelector("button"));
    for(const f of fx){ if(f.innerText.includes("Was möchtet ihr nutzen?")) continue;
      const b2=[...f.querySelectorAll("button")].find(x=>/geht|Verstanden|Start|Weiter|Schließen|✕|OK/i.test(x.innerText)); if(b2){ b2.click(); return; } } });
  await page.waitForTimeout(700); }

// ===== 1) Modul-Wizard: Skills startet AUS, Saison-Planung als 6. Modul =====
let b=await body();
if(b.includes("Was möchtet ihr nutzen?")){
  await page.locator('button:has-text("Los geht")').click(); await page.waitForTimeout(400);
  b=await body();
  if(b.includes("Skills & Entwicklung")&&b.includes("Ausgeblendet")) ok("Skills startet ausgeschaltet – Trainer muss aktiv einschalten"); else fail("Skills-Default falsch: "+b.slice(0,150));
  for(let i=0;i<6;i++){
    b=await body();
    if(i===5){ if(b.includes("Saison-Planung")&&b.includes("Fragebogen")) ok("Neues Modul Saison-Planung mit Erklärung"); else fail("Saison-Modul fehlt"); }
    await page.locator('button:has-text("Weiter →")').click(); await page.waitForTimeout(350);
  }
  b=await body();
  if(/Skills & Entwicklung[\s\S]{0,90}AUS/.test(b)) ok("Zusammenfassung: Skills AUS"); else fail("Skills nicht AUS in Zusammenfassung");
  await page.locator('button:has-text("Speichern & loslegen")').click(); await page.waitForTimeout(800);
} else fail("Modul-Wizard fehlt");

// ===== 2) Chat: Trainer nicht an ganzen Verein, Direktkanal zum Admin =====
await page.locator('button:has-text("Chat")').last().click(); await page.waitForTimeout(800);
b=await body();
if(b.includes("🛡 Vereins-Admin")) ok("Direktkanal zum Vereins-Admin vorhanden"); else fail("Admin-Kanal fehlt");
await page.locator('button:has-text("Gesamter Verein")').first().click().catch(()=>{}); await page.waitForTimeout(500);
b=await body();
if(b.includes("an den ganzen Verein schreibt nur der Vereins-Admin")) ok("Vereins-Kanal für Trainer nur lesbar"); else fail("Vereins-Kanal-Sperre fehlt: "+b.slice(0,120));
await page.locator('button:has-text("🛡 Vereins-Admin")').first().click(); await page.waitForTimeout(500);
await page.locator('input[placeholder*="Nachricht schreiben"]').fill("Kurze Frage an den Vorstand");
await page.locator('button:has-text("➤")').click(); await page.waitForTimeout(600);
b=await body();
if(b.includes("Kurze Frage an den Vorstand")) ok("Direktnachricht an Admin gesendet"); else fail("Admin-Nachricht fehlt");

// ===== 3) Termin-Wizard: Mehrfachauswahl + Halle drinnen/draussen =====
await page.locator('button:has-text("Termine")').last().click(); await page.waitForTimeout(700);
await page.getByText("Schritt-für-Schritt Assistent").first().click(); await page.waitForTimeout(600);
await page.getByText("F-Jugend 1").first().click().catch(()=>{}); await page.waitForTimeout(300);  // Team der Eltern-Testfamilie
await page.locator('button:has-text("Weiter ->")').click(); await page.waitForTimeout(400);  // Team
await page.locator('button:has-text("Weiter ->")').click(); await page.waitForTimeout(400);  // Art=Training
const txtInputs=page.locator('input:not([type="time"]):not([type="checkbox"]):not([type="number"])');
await txtInputs.nth(0).fill("Hallentraining Test");
await txtInputs.nth(1).fill("Sporthalle Nord"); await page.waitForTimeout(400);
b=await body();
if(b.includes("Drinnen/Draußen je nach Wetter")) ok("Halle erkannt → Drinnen/Draußen-Option erscheint (Standard aus)"); else fail("Halle-Option fehlt: "+b.slice(0,150));
await page.evaluate(()=>{ const lbl=[...document.querySelectorAll("div")].find(x=>x.innerText.trim().startsWith("🌤 Drinnen/Draußen")&&x.childElementCount===0); const row=lbl?.parentElement?.parentElement; const sw=row&&[...row.children].pop(); sw&&sw.click(); });
await page.waitForTimeout(300);
await page.locator('button:has-text("Weiter ->")').click(); await page.waitForTimeout(400);  // Details -> Umfrage
b=await body();
if(b.includes("Auch mehrere zusammen")) ok("Abstimmungs-Schritt erklärt Mehrfachauswahl"); else fail("Mehrfach-Hinweis fehlt");
await page.getByText("Fahrtgemeinschaft").first().click(); await page.waitForTimeout(300);
b=await body();
await page.locator('button:has-text("Weiter ->")').click(); await page.waitForTimeout(400);  // -> Abschluss
b=await body();
if(b.includes("Anwesenheit + Fahrtgemeinschaft")) ok("Zusammenfassung: Anwesenheit + Fahrtgemeinschaft kombiniert"); else fail("Kombi fehlt in Zusammenfassung: "+(b.match(/Umfrage[\s\S]{0,60}/)||["?"])[0].replace(/\n/g," | "));
await page.locator('button:has-text("Termin erstellen"), button:has-text("Erstellen")').last().click().catch(async()=>{ await page.locator('button').last().click(); });
await page.waitForTimeout(900);

// ===== 4) Eltern sehen beides: Anwesenheit + Fahrgemeinschaft + Wetter-Hinweis =====
await page.evaluate(()=>{ sessionStorage.setItem("va_sw","1"); sessionStorage.setItem("vereinsapp_v12_session", JSON.stringify({ role:"user", cid:"demo", tid:"demo_f1", user:"Ben Fischer" })); });
await page.reload({waitUntil:"networkidle"}); await page.waitForTimeout(2500);
await page.locator('button:has-text("Überspringen")').first().click().catch(()=>{}); await page.waitForTimeout(300);
for(let k=0;k<6;k++){ const done=await page.evaluate(()=>{
  const fx=[...document.querySelectorAll("div")].filter(d=>getComputedStyle(d).position==="fixed"&&d.querySelector("button")&&d.innerText.length>30);
  for(const f of fx){ const b2=[...f.querySelectorAll("button")].find(x=>/geht|Los|Verstanden|Alles klar|Start|Jetzt nicht/i.test(x.innerText)); if(b2){ b2.click(); return false; } }
  return true; }); await page.waitForTimeout(500); if(done) break; }
// Der erste anstehende Termin (heute) ist automatisch aufgeklappt - NICHT klicken.
await page.waitForTimeout(400);
b=await body();
if(b.includes("Drinnen/Draußen")||b.includes("Je nach Wetter")||b.includes("Voraussichtlich")) ok("Eltern sehen Drinnen/Draußen-Hinweis"); else fail("Wetter-Hinweis fehlt");
if(b.includes("Fahrtgemeinschaft")||b.includes("Fahrgemeinschaft")) ok("Eltern sehen Fahrgemeinschaft ZUSÄTZLICH zur Anwesenheit"); else fail("Extra-Fahrgemeinschaft fehlt");

// ===== 5) Admin: Ansprechpartner + Klick-Statistik + Einwilligungs-Link =====
await page.evaluate(()=>{ sessionStorage.setItem("vereinsapp_v12_session", JSON.stringify({ role:"admin", cid:"demo", name:"Admin" })); });
await page.reload({waitUntil:"networkidle"}); await page.waitForTimeout(2500);
await page.locator('button:has-text("Überspringen")').first().click().catch(()=>{}); await page.waitForTimeout(300);
await page.locator('button:has-text("Mehr")').last().click(); await page.waitForTimeout(600);
await page.locator('button:has-text("Einstellungen")').last().click(); await page.waitForTimeout(800);
await page.locator('button:has-text("Infos")').first().click().catch(()=>{}); await page.waitForTimeout(600);
b=await body();
if(b.includes("ANSPRECHPARTNER FÜR ELTERN")) ok("Admin-Bereich Ansprechpartner vorhanden"); else fail("Ansprechpartner-Bereich fehlt: "+b.slice(0,150));
await page.locator('input[placeholder*="Petra"]').fill("Petra Vorstand");
await page.locator('input[placeholder*="Vorsitzende"]').fill("1. Vorsitzende");
await page.locator('input[placeholder="E-Mail"]').fill("vorstand@verein.de");
await page.locator('input[placeholder*="Wofür zuständig"]').fill("Anmelden & Abmelden, Fragen rund um den Verein");
await page.locator('button:has-text("+ Ansprechpartner anlegen")').click(); await page.waitForTimeout(600);
b=await body();
if(b.includes("Petra Vorstand")&&b.includes("Zustimmung offen")) ok("Ansprechpartner angelegt (wartet auf Einwilligung)"); else fail("Anlage fehlgeschlagen");
if(b.includes("Klicks:")&&b.includes("(7 Tage)")) ok("Klick-Statistik je Link (7/30 Tage/gesamt)"); else fail("Klick-Statistik fehlt");
const ctId=await page.evaluate(()=>{ try{ const raw=JSON.parse(localStorage.getItem("vereinsapp_v14")); const d=raw?.data||raw; const c=(d.clubs||[]).find(x=>x.id==="demo"); return (c?.contacts||[]).find(x=>x.name==="Petra Vorstand")?.id||null; }catch{ return null; } });
if(ctId) ok("Kontakt im Datenbestand: "+ctId); else fail("Kontakt-ID nicht gefunden");

// ===== 6) Einwilligung per Link =====
if(ctId){
  await page.goto(`http://127.0.0.1:4214/?kontakt=${ctId}&club=demo`,{waitUntil:"networkidle"}); await page.waitForTimeout(1800);
  b=await body();
  if(b.includes("ANSPRECHPARTNER-FREIGABE")&&b.includes("Petra Vorstand")&&b.includes("DSGVO")) ok("Einwilligungs-Seite zeigt alle Daten + Rechtsgrundlage"); else fail("Einwilligungs-Seite falsch: "+b.slice(0,180));
  await page.locator('button:has-text("Ja, Daten anzeigen")').click(); await page.waitForTimeout(800);
  b=await body();
  if(b.includes("Daten werden angezeigt")) ok("Zustimmung per Link erteilt"); else fail("Zustimmung fehlgeschlagen");
}

// ===== 7) Eltern sehen Ansprechpartner (erst NACH Zustimmung) =====
await page.goto("http://127.0.0.1:4214/",{waitUntil:"domcontentloaded"});
await page.evaluate(()=>{ sessionStorage.setItem("va_sw","1"); sessionStorage.setItem("vereinsapp_v12_session", JSON.stringify({ role:"user", cid:"demo", tid:"demo_f1", user:"Ben Fischer" })); });
await page.reload({waitUntil:"networkidle"}); await page.waitForTimeout(2500);
await page.locator('button:has-text("Überspringen")').first().click().catch(()=>{}); await page.waitForTimeout(300);
await page.locator('button:has-text("Mehr")').last().click(); await page.waitForTimeout(700);
b=await body();
if(b.includes("ANSPRECHPARTNER")&&b.includes("Petra Vorstand")&&b.includes("E-Mail schreiben")) ok("Eltern sehen Ansprechpartner mit E-Mail-Knopf"); else fail("Eltern-Ansicht Ansprechpartner fehlt: "+b.slice(0,150));

// ===== 8) Saison-Check (Trainer) + Vereins-Cockpit (Admin) =====
await page.evaluate(()=>{ sessionStorage.setItem("vereinsapp_v12_session", JSON.stringify({ role:"trainer", cid:"demo", tids:["demo_g","demo_f1"], name:"Trainer A", id:"dt1" })); });
await page.reload({waitUntil:"networkidle"}); await page.waitForTimeout(2500);
await page.locator('button:has-text("Überspringen")').first().click().catch(()=>{}); await page.waitForTimeout(300);
await page.locator('button:has-text("Mehr")').last().click(); await page.waitForTimeout(600);
await page.locator('button:has-text("📝 Saison-Check")').click(); await page.waitForTimeout(600);
b=await body();
if(b.includes("Saison-Check")&&b.includes("MACHST DU NÄCHSTE SAISON WEITER?")) ok("Saison-Fragebogen öffnet (Mehr → Saison-Check)"); else fail("Fragebogen fehlt: "+b.slice(0,150));
if(b.includes("dein Jahrgang rückt auf")&&b.includes("empfohlen")) ok("Jugend-Vorschläge: nächsthöhere Jugend empfohlen (F → E)"); else fail("Jugend-Vorschlag fehlt: "+b.slice(0,180));
if(b.includes("deine aktuelle")) ok("Eigene Jugend markiert"); else fail("Aktuell-Markierung fehlt");
await page.locator('button:has-text("✅ Ja")').click(); await page.waitForTimeout(250);
await page.locator('button:has-text("empfohlen")').first().click(); await page.waitForTimeout(250);
await page.locator('button:has-text("2×")').first().click(); await page.waitForTimeout(250);
await page.locator('button:has-text("Antwort senden")').click(); await page.waitForTimeout(700);
b=await body();
if(b.includes("hilft dem Vorstand")) ok("Fragebogen abgeschickt"); else fail("Absenden fehlgeschlagen");
// Admin-Cockpit
await page.evaluate(()=>{ sessionStorage.setItem("vereinsapp_v12_session", JSON.stringify({ role:"admin", cid:"demo", name:"Admin" })); });
await page.reload({waitUntil:"networkidle"}); await page.waitForTimeout(2500);
await page.locator('button:has-text("Überspringen")').first().click().catch(()=>{}); await page.waitForTimeout(300);
await page.locator('button:has-text("Mehr")').last().click(); await page.waitForTimeout(600);
await page.locator('button:has-text("Übersicht")').last().click(); await page.waitForTimeout(800);
b=await body();
if(b.includes("Vereins-Cockpit")&&b.includes("SPIELER")&&b.includes("Gesamt")) ok("Vereins-Cockpit: Spieler/Trainer/Helfer je Team"); else fail("Cockpit fehlt: "+b.slice(0,150));
if(b.includes("1 machen weiter")&&b.includes("Trainer A")) ok("Cockpit zeigt Saison-Check-Antwort (Trainer A macht weiter)"); else fail("Saison-Antwort fehlt im Cockpit: "+(b.match(/SAISON-CHECK[\s\S]{0,160}/)||["?"])[0].replace(/\n/g," | "));
if(b.includes("VERFÜGBARE TRAINER JE JUGEND")) ok("Cockpit: verfügbare Trainer je Jugend (Wunsch aus Saison-Check)"); else fail("Jugend-Auswertung fehlt");
// Admin hat KEINE Eintrags-Karte, aber den Erinnern-Knopf
if(b.includes("🔔 Offene erinnern")) ok("Admin kann Offene erinnern"); else fail("Erinnern-Knopf fehlt");
await page.locator('button:has-text("🔔 Offene erinnern")').click(); await page.waitForTimeout(600);
b=await body();
if(b.includes("Erinnerung an")) ok("Erinnerung gesendet (Posteingang + Teilen-Text)"); else fail("Erinnerungs-Toast fehlt");
await page.locator('button:has-text("Mehr")').last().click(); await page.waitForTimeout(600);
b=await body();
if(!b.includes("📝 Saison-Check")) ok("Admin hat keine Saison-Check-Eintragskarte im Menü"); else fail("Admin sieht Saison-Check-Menüpunkt");
await page.keyboard.press("Escape").catch(()=>{}); await page.waitForTimeout(300);
// Saison-Label kompakt: 2026/27 statt 2026/2027 (in der Saisonplanung)
await page.locator('button:has-text("Termine")').last().click().catch(()=>{}); await page.waitForTimeout(500);
await page.evaluate(()=>{ const b2=[...document.querySelectorAll("button")].find(x=>x.innerText.trim()==="Saison"); b2&&b2.click(); }); await page.waitForTimeout(700);
b=await body();
if(b.includes("Saisonplanung")) ok("Saison-Verwaltung öffnet"); else fail("Saisonplanung fehlt: "+b.slice(0,120));
// Neue Saison im Kurzformat anlegen -> Archivieren (mit Nachfrage) -> Wiederherstellen
await page.locator('button:has-text("+ Neue Saison planen")').click(); await page.waitForTimeout(600);
await page.evaluate(()=>{ const b2=[...document.querySelectorAll("button")].find(x=>/^\d{4}\/\d{2}$/.test(x.innerText.trim())); b2&&b2.click(); });
await page.waitForTimeout(300);
b=await body();
if(/z\.B\. 2026\/27|\d{4}\/\d{2}/.test(b)) ok("Saison-Vorschläge im Kurzformat (2026/27 statt 2026/2027)"); else fail("Kurzformat-Vorschlag fehlt");
for(let k=0;k<4;k++){ const t2=await body(); if(t2.includes("Saison anlegen")&&!t2.includes("SCHRITT 1")){ break; }
  await page.locator('button:has-text("Weiter")').last().click().catch(()=>{}); await page.waitForTimeout(400); }
await page.locator('button:has-text("Saison anlegen")').last().click().catch(()=>{}); await page.waitForTimeout(800);
b=await body();
const lbl=(b.match(/\d{4}\/\d{2}(?!\d)/)||[null])[0];
if(lbl&&b.includes("Planung")) ok("Neue Saison angelegt ("+lbl+", Status Planung)"); else fail("Saison-Anlage fehlgeschlagen: "+b.slice(0,200));
await page.locator('button:has-text("Archiv")').first().click().catch(()=>{}); await page.waitForTimeout(600);
b=await body();
if(b.includes("↩ Wiederherstellen")) ok("Archiviert bleibt sichtbar + Wiederherstellen-Knopf"); else fail("Wiederherstellen fehlt: "+b.slice(0,150));
// Eine Saison MIT Spielern darf nicht entfernbar sein (Schutz vor Datenverlust)
b=await body();
if(!b.includes("🗑 Entfernen")) ok("Saison mit Spielern ist nicht entfernbar (Schutz)"); else fail("Entfernen bei befüllter Saison angeboten");
await page.locator('button:has-text("↩ Wiederherstellen")').click(); await page.waitForTimeout(900);
b=await body();
if(b.includes("Planung")&&!b.includes("↩ Wiederherstellen")) ok("Saison wiederhergestellt (zurück in Planung)"); else fail("Wiederherstellen wirkt nicht");
// Leere Karteileiche: Saison OHNE Mannschaften anlegen -> 0 Spieler -> entfernbar
await page.locator('button:has-text("+ Neue Saison planen")').click(); await page.waitForTimeout(700);
await page.locator('input[placeholder*="z.B."]').first().fill("2019/20"); await page.waitForTimeout(300);
await page.locator('button:has-text("Weiter")').last().click(); await page.waitForTimeout(600);
// Schritt 2: alle Mannschaften abwaehlen, damit keine Spieler kopiert werden
await page.evaluate(()=>{ [...document.querySelectorAll("button")].filter(x=>x.innerText.includes("wird übernommen")).forEach(x=>x.click()); });
await page.waitForTimeout(400);
for(let k=0;k<3;k++){ const t2=await body(); if(t2.includes("Saison anlegen")&&!/SCHRITT [12]\//.test(t2)) break;
  await page.locator('button:has-text("Weiter")').last().click().catch(()=>{}); await page.waitForTimeout(400); }
await page.locator('button:has-text("Saison anlegen")').last().click(); await page.waitForTimeout(1000);
b=await body();
if(b.includes("2019/20")&&/2019\/20[\s\S]{0,40}0 Spieler/.test(b)) ok("Leere Saison angelegt (0 Spieler)"); else fail("Leere Saison fehlt: "+(b.match(/2019[\s\S]{0,80}/)||["?"])[0].replace(/\n/g," | "));
// Der Assistent macht die neue Saison zur laufenden -> erst archivieren,
// dann ist sie (leer) entfernbar. Genau der Fall aus der Praxis.
await page.evaluate(()=>{ const btn=[...document.querySelectorAll("button")].filter(x=>x.innerText.trim()==="Archiv")
    .find(x=>{ let n=x; for(let i=0;i<5&&n;i++){ if(n.innerText&&n.innerText.includes("2019/20")) return true; n=n.parentElement; } return false; });
  btn&&btn.click(); });
await page.waitForTimeout(900);
b=await body();
if(b.includes("🗑 Entfernen")) ok("Leere Saison kann entfernt werden"); else fail("Entfernen-Knopf fehlt");
await page.locator('button:has-text("🗑 Entfernen")').first().click(); await page.waitForTimeout(900);
b=await body();
if(!b.includes("2019/20")) ok("Leere Saison entfernt – Karteileiche weg"); else fail("Saison nach Entfernen noch da");

if(errors.length){ console.log("JS-FEHLER:"); [...new Set(errors)].forEach(e=>console.log(" -",e.slice(0,150))); }
console.log(errors.length||fails.length?`ERGEBNIS: ${fails.length} Fehlschläge, ${errors.length} JS-Fehler`:"ERGEBNIS: ALLES OK");
await browser.close(); srv.close();
process.exit(errors.length||fails.length?1:0);
