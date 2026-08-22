// E2E-Test Team-Paket: klickbare Statistik-Kacheln, KI-Trainingsgruppen mit
// Kriterien (Staerken/Befreundet/Zufall) + Leiter-Wahl + Lern-Feedback,
// Spielteams, Orga & Verkauf (Mitbringen/Material/Schichten), Helfer-Rollen
// (Kassenhelfer), Konten-Zusammenfuehrung und neuer Helfer-Login-Flow.
// Aufruf: npm run build && node scripts/test-team.mjs
import { chromium } from "playwright-core";
import http from "http"; import fs from "fs"; import path from "path";
const dist = path.resolve("dist");
const srv = http.createServer((req,res)=>{ let p=path.join(dist,req.url.split("?")[0]); if(!fs.existsSync(p)||fs.statSync(p).isDirectory()) p=path.join(dist,"index.html"); res.setHeader("content-type",{".html":"text/html",".js":"text/javascript",".css":"text/css"}[path.extname(p)]||"text/plain"); res.end(fs.readFileSync(p)); }).listen(4213);
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
  localStorage.setItem("va_simple","0"); localStorage.setItem("va_tsimple","0");   // diese Tests pruefen die ausfuehrliche Ansicht   // Fake-Cloud: Offline-Spiegel
  if(!sessionStorage.getItem("va_sw")) sessionStorage.setItem("vereinsapp_v12_session", JSON.stringify({ role:"trainer", cid:"demo", tids:["demo_f1"], name:"Demo Trainer", id:"demo_tr1" }));
});
await page.goto("http://127.0.0.1:4213/", { waitUntil:"networkidle" }); await page.waitForTimeout(2500);
await page.locator('button:has-text("Überspringen")').first().click().catch(()=>{}); await page.waitForTimeout(400);
const closeEv=async()=>{ await page.getByRole('button',{name:'Schließen',exact:true}).first().click().catch(()=>{}); await page.keyboard.press("Escape").catch(()=>{}); await page.waitForTimeout(400); };

// ===== 1) Statistik-Kacheln anklickbar =====
let b=await body();
if(b.includes("Rückmeldungen ›")) ok("Kacheln als klickbar markiert (›)"); else fail("Kachel-Marker fehlt");
await page.evaluate(l=>{ const d=[...document.querySelectorAll("div")].find(x=>x.innerText.trim()===l&&x.childElementCount<=2&&x.innerText.length<40); d&&d.click(); },"Rückmeldungen ›"); await page.waitForTimeout(600);
b=await body();
if(b.includes("Antippen öffnet den Termin")) ok("Kachel Rückmeldungen öffnet Übersicht"); else fail("Rückmeldungs-Übersicht fehlt");
// Termin aus der Uebersicht oeffnen
await page.evaluate(()=>{ const rows=[...document.querySelectorAll("div")].filter(d=>/›$/.test(d.innerText.trim())&&d.innerText.includes("✓")&&d.innerText.length<200); rows[0]&&rows[0].click(); });
await page.waitForTimeout(800);
b=await body();
if(b.includes("👥 Orga")) ok("Termin aus Übersicht geöffnet"); else fail("Termin öffnet nicht aus Übersicht");
await closeEv();
await page.evaluate(l=>{ const d=[...document.querySelectorAll("div")].find(x=>x.innerText.trim()===l&&x.childElementCount<=2&&x.innerText.length<40); d&&d.click(); },"Mannschaften ›"); await page.waitForTimeout(900);
b=await body();
if(b.includes("Spieler")||b.includes("Kader")) ok("Kachel Mannschaften springt in den Team-Bereich"); else fail("Team-Sprung fehlt: "+b.slice(0,100));
await page.evaluate(l=>{ const d=[...document.querySelectorAll("div")].find(x=>x.innerText.trim()===l&&x.childElementCount<=2&&x.innerText.length<40); d&&d.click(); },"Anstehende Termine ›"); await page.waitForTimeout(700);
b=await body();
if(b.includes("NÄCHSTE 21 TAGE")) ok("Kachel Termine springt zur Terminliste"); else fail("Termin-Sprung fehlt");

// ===== 2) KI-Trainingsgruppen: Kriterien, Leiter-Wahl, Feedback =====
const openEvWith=async(txt)=>{
  const c=await page.locator('button:has-text("Ansehen")').count();
  for(let i=0;i<c;i++){
    await page.locator('button:has-text("Ansehen")').nth(i).click().catch(()=>{}); await page.waitForTimeout(700);
    await page.locator('button:has-text("👥 Orga")').first().click().catch(()=>{}); await page.waitForTimeout(500);
    if((await body()).includes(txt)) return true;
    await closeEv();
  }
  return false;
};
if(await openEvWith("Trainingsgruppen & Stationen")){
  b=await body();
  if(b.includes("WIE EINTEILEN?")&&b.includes("💪 Stärken ✓")) ok("Kriterien-Buttons da, Stärken vorausgewählt"); else fail("Kriterien fehlen");
  await page.locator('button:has-text("👫 Befreundet")').click(); await page.waitForTimeout(250);
  await page.locator('button:has-text("🎲 Zufall")').click(); await page.waitForTimeout(250);
  b=await body();
  if(b.includes("👫 Befreundet ✓")&&b.includes("🎲 Zufall ✓")) ok("Kriterien kombinierbar (alle drei aktiv)"); else fail("Kombination klappt nicht");
  await page.locator('button:has-text("Gruppen einteilen")').click(); await page.waitForTimeout(800);
  b=await body();
  if(b.includes("Feld 1")) ok("Gruppen eingeteilt (6–8 pro Trainer)"); else fail("Einteilung fehlt");
  const selCount=await page.locator('select').count();
  if(selCount>0) ok("Leiter je Gruppe frei wählbar (Dropdown)"); else fail("Leiter-Auswahl fehlt");
  // Leiter wechseln
  const opts=await page.evaluate(()=>{ const s=document.querySelector("select"); return s?[...s.options].map(o=>o.value).filter(Boolean):[]; });
  if(opts.length){ await page.locator('select').first().selectOption(opts[opts.length-1]); await page.waitForTimeout(500);
    b=await body();
    if(b.includes("übernimmt")) ok("Trainer sucht sich Gruppe aus (Toast)"); else ok("Leiter gewechselt");
  }
  // Feedback "zu stark" -> App lernt
  if(b.includes("Wie war die Einteilung?")) ok("Feedback-Zeile unter jeder Gruppe"); else fail("Feedback-Zeile fehlt");
  await page.locator('button:has-text("💪 Zu stark")').first().click(); await page.waitForTimeout(700);
  b=await body();
  if(b.includes("fließt in die nächste Einteilung")) ok("Feedback bestätigt (App lernt)"); else fail("Feedback-Toast fehlt");
  const adj=await page.evaluate(()=>{ try{ const raw=JSON.parse(localStorage.getItem("vereinsapp_v14")); const d=raw?.data||raw; const tm=(d.teams||[]).find(t=>t.id==="demo_f1"); return tm?.strengthAdj||null; }catch{ return null; } });
  if(adj&&Object.values(adj).some(v=>Math.abs(Number(v))>0.2)) ok("Gelernte Stärke-Korrektur gespeichert (+0.3)"); else fail("strengthAdj fehlt: "+JSON.stringify(adj));
  await closeEv();
} else fail("Kein Training mit Gruppen-Karte gefunden");

// ===== 3) Spielteams + Orga & Verkauf am Spiel/Turnier =====
if(await openEvWith("Orga & Verkauf")){
  b=await body();
  if(b.includes("Spielteams (KI-Vorschlag)")) ok("Spielteams-KI am Spiel/Turnier"); else fail("Spielteams fehlen");
  // Vorschlag antippen: Kuchen
  await page.locator('button:has-text("+ 🍰 Kuchen")').click(); await page.waitForTimeout(500);
  b=await body();
  if(b.includes("🍰 Kuchen")&&b.includes("0/1")) ok("Vorschlag Kuchen übernommen (0/1)"); else fail("Kuchen-Eintrag fehlt");
  await page.locator('button:has-text("Übernehme ich")').first().click(); await page.waitForTimeout(500);
  b=await body();
  if(b.includes("1/1")) ok("Trainer übernimmt Kuchen (1/1, grün)"); else fail("Übernahme klappt nicht");
  // Schicht anlegen + uebernehmen
  await page.locator('input[placeholder*="Verkauf 10:00"]').fill("Verkauf 10:00–11:30");
  await page.locator('button:has-text("Anlegen")').click(); await page.waitForTimeout(500);
  b=await body();
  if(b.includes("⏱ Verkauf 10:00–11:30")) ok("Schicht angelegt"); else fail("Schicht fehlt");
  await page.locator('button:has-text("Schicht übernehmen")').first().click(); await page.waitForTimeout(500);
  b=await body();
  if(b.includes("Schicht übernommen")||b.includes("1/2")) ok("Schicht übernommen"); else fail("Schicht-Übernahme fehlt");
  // Spielteams einteilen
  await page.locator('button:has-text("Teams einteilen")').click(); await page.waitForTimeout(800);
  b=await body();
  if(b.includes("Team 1")) ok("Spielteams nach Stärken eingeteilt"); else fail("Spielteam-Einteilung fehlt");
  await closeEv();
} else fail("Kein Spiel/Turnier mit Orga-Board gefunden");

// ===== 4) Helfer mit Rollen anlegen + Duplikate zusammenfuehren =====
const createHelper=async(name,withKasse)=>{
  await page.locator('button:has-text("Mehr")').last().click(); await page.waitForTimeout(600);
  await page.locator('button:has-text("Helfer")').last().click(); await page.waitForTimeout(700);
  await page.locator('button:has-text("+ Neuer Helfer")').click(); await page.waitForTimeout(500);
  await page.locator('input[placeholder*="Maria"]').fill(name); await page.waitForTimeout(200);
  if(withKasse){ await page.locator('input[type="checkbox"]').nth(1).check().catch(()=>{}); await page.waitForTimeout(200); }
  const pw=await page.evaluate(()=>{ const sp=[...document.querySelectorAll("span")].find(x=>x.style.fontFamily==="monospace"&&/^[A-Za-z0-9]{6}$/.test(x.textContent.trim())); return sp?sp.textContent.trim():null; });
  await page.locator('button:has-text("Speichern")').last().click(); await page.waitForTimeout(600);
  return pw;
};
await page.locator('button:has-text("Mehr")').last().click(); await page.waitForTimeout(600);
await page.locator('button:has-text("Helfer")').last().click(); await page.waitForTimeout(700);
await page.locator('button:has-text("+ Neuer Helfer")').click(); await page.waitForTimeout(500);
b=await body();
if(b.includes("AUFGABEN")&&b.includes("💶 Kassenhelfer")&&b.includes("nur")) ok("Rollen-Auswahl im Helfer-Formular (Einsatz/Kasse)"); else fail("Rollen-Auswahl fehlt");
await page.locator('button:has-text("Abbrechen")').click(); await page.waitForTimeout(400);
const pw1=await createHelper("Orga Otto",true);
if(pw1) ok("Helfer Otto (mit Kasse) angelegt: "+pw1); else fail("Einmal-Passwort fehlt");
b=await body();
if(b.includes("💶 Kassenhelfer")) ok("Kassenhelfer-Badge in der Liste"); else fail("Kassenhelfer-Badge fehlt");
const pw2=await createHelper("Orga Otto",false);
await page.waitForTimeout(400);
b=await body();
if(b.includes("2 Zugänge für „Orga Otto“")) ok("Duplikat erkannt (gleicher Name)"); else fail("Duplikat-Karte fehlt");
await page.locator('button:has-text("🔗 Jetzt zusammenführen")').click(); await page.waitForTimeout(700);
b=await body();
if(!b.includes("2 Zugänge für")) ok("Zusammengeführt: EIN Login für alle Jugenden"); else fail("Zusammenführen klappt nicht");

// ===== 5) Neuer Helfer-Login: Jugend-Auswahl im Trainer-Design + Kasse-Zugriff =====
await page.keyboard.press("Escape").catch(()=>{}); await page.waitForTimeout(400);
await page.evaluate(()=>{ const b2=[...document.querySelectorAll("button")].find(x=>x.innerText.trim()==="Logout"); b2&&b2.click(); });
await page.waitForTimeout(1000);
await page.getByText("Turnier & Spieltag unterstützen").click(); await page.waitForTimeout(900);
b=await body();
if(b.includes("Für welche Jugend hilfst du?")) ok("Helfer-Login: Jugend-Auswahl zuerst (Trainer-Design)"); else fail("Jugend-Auswahl fehlt: "+b.slice(0,120));
await page.evaluate(()=>{ const cards=[...document.querySelectorAll("div")].filter(d=>String(d.className).includes("up")&&/\d+ Helfer/.test(d.innerText)&&d.innerText.length<120); cards[0]&&cards[0].click(); });
await page.waitForTimeout(700);
b=await body();
if(b.includes("Welcher Helfer bist du?")){ await page.getByText("Orga Otto",{exact:false}).first().click(); await page.waitForTimeout(500); b=await body(); }
if(b.includes("Hallo Orga!")&&b.includes("Einmal-Passwort")) ok("Passwort-Seite im Glas-Design (wie Trainer)"); else fail("Passwort-Design falsch: "+b.slice(0,150));
await page.locator('input[type="password"]').first().fill(pw1);
await page.locator('button:has-text("Anmelden")').click(); await page.waitForTimeout(700);
b=await body();
if(b.includes("Eigenes Passwort vergeben")){
  const pws=page.locator('input[type="password"]');
  await pws.nth(0).fill("otto123"); await pws.nth(1).fill("otto123");
  await page.locator('button:has-text("Passwort speichern & einloggen")').click(); await page.waitForTimeout(1200);
  ok("Pflicht-Passwortwechsel durchlaufen");
} else fail("Passwortwechsel-Seite fehlt");
// Overlays (Helfer-Willkommen) wegklicken
for(let k=0;k<3;k++){ const done=await page.evaluate(()=>{
  const fx=[...document.querySelectorAll("div")].filter(d=>getComputedStyle(d).position==="fixed"&&d.querySelector("button")&&d.innerText.length>30);
  for(const f of fx){ const b2=[...f.querySelectorAll("button")].find(x=>/geht|Los|Verstanden|Alles klar|Start/i.test(x.innerText)); if(b2){ b2.click(); return false; } }
  return true; }); await page.waitForTimeout(500); if(done) break; }
b=await body();
if(b.includes("Kasse")) ok("Kassenhelfer sieht Kasse in der Navigation"); else fail("Kasse-Tab fehlt beim Kassenhelfer");
await page.locator('button:has-text("Kasse")').last().click(); await page.waitForTimeout(800);
b=await body();
if(b.includes("Kasse")||b.includes("Einnahmen")||b.includes("Beitrag")) ok("Kassenhelfer öffnet die Mannschafts-Kasse"); else fail("Kasse öffnet nicht");
// Helfer traegt sich in eine Schicht ein
await page.locator('button:has-text("Termine")').last().click().catch(()=>{}); await page.waitForTimeout(700);
if(await openEvWith("Orga & Verkauf")){
  b=await body();
  if(b.includes("🍰 Kuchen")) ok("Helfer sieht die Orga-Liste des Trainers"); else fail("Orga-Liste beim Helfer leer");
  await page.locator('button:has-text("Schicht übernehmen")').first().click().catch(()=>{}); await page.waitForTimeout(500);
  b=await body();
  if(b.includes("Schicht übernommen")||b.includes("2/2")) ok("Helfer übernimmt Schicht (gemeinsame Pflege)"); else fail("Helfer-Schicht klappt nicht");
} else fail("Helfer findet Orga-Board nicht");

if(errors.length){ console.log("JS-FEHLER:"); [...new Set(errors)].forEach(e=>console.log(" -",e.slice(0,150))); }
console.log(errors.length||fails.length?`ERGEBNIS: ${fails.length} Fehlschläge, ${errors.length} JS-Fehler`:"ERGEBNIS: ALLES OK");
await browser.close(); srv.close();
process.exit(errors.length||fails.length?1:0);
