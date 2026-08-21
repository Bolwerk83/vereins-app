// E2E-Paket-Test: 21 Tage, Ferien-Hinweis, Modul-Wizard, Training-/Anwesenheits-/
// Spickzettel-Knoepfe, Eltern (Foto-Freigabe, Freunde, Kind wechseln, Loeschantrag).
// Aufruf: npm run build && node scripts/test-paket.mjs
import { chromium } from "playwright-core";
import http from "http"; import fs from "fs"; import path from "path";
const dist = path.resolve("dist");
const srv = http.createServer((req,res)=>{ let p=path.join(dist,req.url.split("?")[0]); if(!fs.existsSync(p)||fs.statSync(p).isDirectory()) p=path.join(dist,"index.html"); res.setHeader("content-type",{".html":"text/html",".js":"text/javascript",".css":"text/css"}[path.extname(p)]||"text/plain"); res.end(fs.readFileSync(p)); }).listen(4212);
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
  localStorage.setItem("vereinsapp_config", JSON.stringify({url:"https://127.0.0.1:1/x", key:"test"}));
  localStorage.setItem("va_simple","0");   // diese Tests pruefen die ausfuehrliche Ansicht   // Fake-Cloud: Offline-Spiegel
  if(!sessionStorage.getItem("va_sw")) sessionStorage.setItem("vereinsapp_v12_session", JSON.stringify({ role:"trainer", cid:"demo", tids:["demo_g","demo_f1"], name:"Trainer A", id:"dt1" }));
  const y=new Date().getFullYear();
  localStorage.setItem("va_ferien_DE-NW", JSON.stringify({ts:Date.now(),data:[{start:`${y}-01-01`,end:`${y+1}-12-31`,name:"Test-Ferien"}]}));
});
await page.goto("http://127.0.0.1:4212/", { waitUntil:"networkidle" }); await page.waitForTimeout(2500);
await page.locator('button:has-text("Überspringen")').first().click().catch(()=>{}); await page.waitForTimeout(400);
// Trainer-Willkommen (erster Login) wegklicken, dahinter erscheint der Modul-Wizard
for(let k=0;k<4;k++){ const t2=await body(); if(t2.includes("Was möchtet ihr nutzen?")) break;
  await page.evaluate(()=>{ const fx=[...document.querySelectorAll("div")].filter(d=>getComputedStyle(d).position==="fixed"&&d.querySelector("button"));
    for(const f of fx){ if(f.innerText.includes("Was möchtet ihr nutzen?")) continue;
      const b2=[...f.querySelectorAll("button")].find(x=>/geht|Verstanden|Start|Weiter|Schließen|✕|OK/i.test(x.innerText)); if(b2){ b2.click(); return; } } });
  await page.waitForTimeout(700); }

// ===== 1) Modul-Wizard beim ersten Trainer-Login =====
let b=await body();
if(b.includes("Was möchtet ihr nutzen?")){
  ok("Modul-Wizard öffnet beim Onboarding");
  if(b.includes("Termin-Abstimmung")&&b.includes("Immer aktiv")) ok("Abstimmung als Pflicht-Modul erklärt");
  await page.locator('button:has-text("Los geht")').click(); await page.waitForTimeout(400);
  // 5 Modul-Seiten durchgehen, Taktik (Seite 3) abwählen
  for(let i=0;i<6;i++){
    b=await body();
    if(i===2){ if(b.includes("Taktiktafel")) ok("Modul-Seite Taktik mit Erklärung"); await page.locator('div:has-text("Wir nutzen das")').last().click(); await page.waitForTimeout(300); }
    await page.locator('button:has-text("Weiter →")').click(); await page.waitForTimeout(400);
  }
  b=await body();
  if(/Taktiktafel[\s\S]{0,120}AUS/.test(b)) ok("Zusammenfassung zeigt Taktik AUS"); else fail("Zusammenfassung falsch: "+(b.match(/Taktiktafel[\s\S]{0,80}/)||["?"])[0].replace(/\n/g," | "));
  await page.locator('button:has-text("Speichern & loslegen")').click(); await page.waitForTimeout(800);
  const navTxt=await page.evaluate(()=>[...document.querySelectorAll("button")].filter(x=>{const r=x.getBoundingClientRect();return r.top>800&&r.width>30;}).map(x=>x.innerText.trim()).join("|"));
  if(!navTxt.includes("Taktik")) ok("Taktik-Tab nach Abwahl ausgeblendet"); else fail("Taktik-Tab noch da: "+navTxt);
  // Wieder aktivieren ueber Mehr -> Module
  await page.locator('button:has-text("Mehr")').last().click(); await page.waitForTimeout(600);
  await page.locator('button:has-text("🧩 Module")').click(); await page.waitForTimeout(500);
  await page.locator('button:has-text("Los geht")').click(); await page.waitForTimeout(300);
  for(let i=0;i<6;i++){
    if(i===2){ await page.locator('div:has-text("Ausgeblendet")').last().click().catch(()=>{}); await page.waitForTimeout(250); }
    await page.locator('button:has-text("Weiter →")').click(); await page.waitForTimeout(300);
  }
  await page.locator('button:has-text("Speichern & loslegen")').click(); await page.waitForTimeout(800);
  const navTxt2=await page.evaluate(()=>[...document.querySelectorAll("button")].filter(x=>{const r=x.getBoundingClientRect();return r.top>800&&r.width>30;}).map(x=>x.innerText.trim()).join("|"));
  if(navTxt2.includes("Taktik")) ok("Taktik über Mehr→Module wieder aktiviert"); else fail("Reaktivierung fehlgeschlagen");
} else fail("Modul-Wizard fehlt: "+b.slice(0,120));

// ===== 2) Terminliste: 21 Tage, Ferien, Training-Knopf, ✅, Spickzettel =====
await page.locator('button:has-text("Termine")').last().click(); await page.waitForTimeout(700);
b=await body();
if(b.includes("NÄCHSTE 21 TAGE")) ok("21-Tage-Fenster aktiv"); else fail("21-Tage-Label fehlt");
if(b.includes("Test-Ferien")&&b.includes("Serientermine pausieren")) ok("Ferien-Hinweisbalken sichtbar"); else fail("Ferien-Hinweis fehlt");
if(/Training (planen|steht)/.test(b)) ok("Training-Knopf mit klarem Status (planen/steht)"); else fail("Training-Knopf fehlt");
// Spickzettel ueber ⋯
await page.locator('button[aria-label="Weitere Aktionen"]').first().click(); await page.waitForTimeout(400);
await page.locator('button:has-text("📋 Spickzettel")').first().click(); await page.waitForTimeout(600);
b=await body();
if(b.includes("Spickzettel")&&b.includes("MATERIAL DER MANNSCHAFT")&&b.includes("Zusagen")) ok("Spickzettel: Personen + Material der Mannschaft"); else fail("Spickzettel unvollständig");
// Material wird nicht mehr am Termin gepflegt, sondern einmal je Mannschaft
if(b.includes("Mannschaft › 🧰 Material")||/Einmal je Mannschaft gepflegt/.test(b)) ok("Spickzettel verweist auf das Material der Mannschaft"); else fail("Material-Hinweis im Spickzettel fehlt");
await page.getByRole('button',{name:'Schließen',exact:true}).first().click().catch(()=>{}); await page.keyboard.press("Escape").catch(()=>{}); await page.waitForTimeout(400);
// ✅ Anwesenheit oeffnet Orga
// Kuenftige Termine: der Hauptknopf oeffnet den Termin, die Anwesenheit
// steckt darin als Reiter (ab dem Termintag fuehrt der Knopf direkt hin).
await page.evaluate(()=>{ const b=[...document.querySelectorAll("button")].find(x=>/^(✅ Anwesenheit|Ansehen)$/.test((x.innerText||"").trim())); b&&b.click(); });
await page.waitForTimeout(1000);
await page.evaluate(()=>{ const b=[...document.querySelectorAll("button")].find(x=>/^(Orga|Anwesenheit|✅ Anwesenheit)$/.test((x.innerText||"").trim())); b&&b.click(); });
await page.waitForTimeout(800);
b=await body();
if(b.includes("Orga")||b.includes("Anwesenheit")) ok("✅-Knopf öffnet Termin mit Orga/Anwesenheit"); else fail("Anwesenheits-Sprung fehlt");
await page.getByRole('button',{name:'Schließen',exact:true}).first().click().catch(()=>{}); await page.keyboard.press("Escape").catch(()=>{}); await page.waitForTimeout(400);

// ===== 3) Eltern-Paket =====
await page.evaluate(()=>{ sessionStorage.setItem("va_sw","1"); sessionStorage.setItem("vereinsapp_v12_session", JSON.stringify({ role:"user", cid:"demo", tid:"demo_f1", user:"Ben Fischer" })); });
await page.reload({waitUntil:"networkidle"}); await page.waitForTimeout(2500);
await page.locator('button:has-text("Überspringen")').first().click().catch(()=>{}); await page.waitForTimeout(300);
b=await body();
if(b.includes("Test-Ferien")) ok("Eltern sehen Ferien-Hinweis"); else fail("Eltern-Ferien fehlt");
await page.locator('button:has-text("Mehr")').last().click(); await page.waitForTimeout(700);
b=await body();
if(b.includes("👧👦 Kind wechseln")) ok("Kind-wechseln-Knopf im Profil"); else fail("Kind-wechseln fehlt");
if(b.includes("PROFILBILD-FREIGABE")&&b.includes("Rechtlich in Klärung")) ok("Foto-Freigabe (Turnier ausgegraut)"); else fail("Foto-Freigabe fehlt");
if(b.includes("FREUNDE IM TEAM")) ok("Freunde-Auswahl vorhanden"); else fail("Freunde fehlen");
if(b.includes("auch mehrere")) ok("Eltern-Namen: mehrere/Patchwork-Hinweis");
// Foto freigeben: 2-stufig
await page.locator('div:has-text("Für Trainer & Mannschaft")').last().click(); await page.waitForTimeout(500);
b=await body();
if(b.includes("Rechtlicher Hinweis")&&b.includes("DSGVO")) ok("2. Stufe: rechtlicher Hinweis"); else fail("Rechts-Modal fehlt");
await page.locator('button:has-text("Einwilligen & freigeben")').click(); await page.waitForTimeout(600);
// Freund waehlen
await page.evaluate(()=>{ const sec=[...document.querySelectorAll("div")].find(d=>d.innerText.startsWith("🤝 FREUNDE IM TEAM")); const btn=sec&&[...sec.querySelectorAll("button")][0]; btn&&btn.click(); });
await page.waitForTimeout(500);
b=await body();
if(/✓ (Leon|Lina|Paul|Sophie)/.test(b)) ok("Freund markiert (fließt in Aufstellung/Gruppen)"); else fail("Freund-Auswahl wirkt nicht");
// Loeschantrag stellen (Dialog wird auto-bestaetigt)
await page.locator('button:has-text("Daten löschen (Antrag)")').click(); await page.waitForTimeout(800);
b=await body();
if(b.includes("Trainer bestätigt ihn innerhalb von 2 Tagen")||b.includes("Löschantrag gestellt")) ok("Löschantrag mit 2-Tage-Hinweis gestellt"); else fail("Löschantrag-Toast fehlt");

// ===== 4) Trainer sieht Loeschantrag ganz oben + kann ablehnen =====
await page.evaluate(()=>{ sessionStorage.setItem("vereinsapp_v12_session", JSON.stringify({ role:"trainer", cid:"demo", tids:["demo_g","demo_f1"], name:"Trainer A", id:"dt1" })); });
await page.reload({waitUntil:"networkidle"}); await page.waitForTimeout(2500);
await page.locator('button:has-text("Überspringen")').first().click().catch(()=>{}); await page.waitForTimeout(300);
b=await body();
if(b.includes("🗑 Löschantrag: Ben Fischer")&&b.includes("Std. zur Bestätigung")) ok("Löschantrag ganz oben in der Trainer-Todo"); else fail("Löschantrag-Karte fehlt: "+(b.match(/Löschantrag[\s\S]{0,80}/)||["?"])[0].replace(/\n/g," | "));
await page.locator('button:has-text("Ablehnen")').first().click(); await page.waitForTimeout(600);
b=await body();
if(!b.includes("🗑 Löschantrag: Ben Fischer")) ok("Ablehnen entfernt den Antrag (Daten bleiben)"); else fail("Ablehnen wirkt nicht");
// Freundschafts-Netz beim Trainer
await page.locator('button:has-text("Team")').last().click(); await page.waitForTimeout(900);
b=await body();
if(b.includes("FREUNDSCHAFTS-NETZ")) ok("Trainer-Auswertung Freundschafts-Netz sichtbar"); else fail("Freundschafts-Netz fehlt");

if(errors.length){ console.log("JS-FEHLER:"); [...new Set(errors)].forEach(e=>console.log(" -",e.slice(0,150))); }
console.log(errors.length||fails.length?`ERGEBNIS: ${fails.length} Fehlschläge, ${errors.length} JS-Fehler`:"ERGEBNIS: ALLES OK");
await browser.close(); srv.close();
process.exit(errors.length||fails.length?1:0);
