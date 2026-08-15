// E2E-Test: kurzfristige Termine (in <=7 Tagen angelegt) werden auffaellig
// markiert - Trainer bekommt Info-Blatt mit Teilen-Text, Eltern sehen Banner
// oben in der Liste + rote Karte, und beides verschwindet nach dem Abstimmen.
// Aufruf: npm run build && node scripts/test-kurzfristig.mjs
import { chromium } from "playwright-core";
import http from "http"; import fs from "fs"; import path from "path";
const dist = path.resolve("dist");
const srv = http.createServer((req,res)=>{ let p=path.join(dist,req.url.split("?")[0]); if(!fs.existsSync(p)||fs.statSync(p).isDirectory()) p=path.join(dist,"index.html"); res.setHeader("content-type",{".html":"text/html",".js":"text/javascript",".css":"text/css"}[path.extname(p)]||"text/plain"); res.end(fs.readFileSync(p)); }).listen(4218);
const exe=process.env.PLAYWRIGHT_CHROMIUM||"/opt/pw-browsers/chromium-1194/chrome-linux/chrome";
const browser = await chromium.launch({ executablePath:exe, args:["--no-sandbox"] });
const page = await browser.newPage({ viewport:{ width:390, height:900 } });
const errors=[]; const fails=[];
page.on("pageerror", e=>errors.push(e.message));
page.on("dialog", d=>d.accept());
const fail=m=>{ fails.push(m); console.log("FEHLGESCHLAGEN:", m); };
const ok=m=>console.log("OK:", m);
const body=()=>page.evaluate(()=>document.body.innerText);
const dismissOverlays=async()=>{ for(let k=0;k<14;k++){ const done=await page.evaluate(()=>{
  const fx=[...document.querySelectorAll("div")].filter(d=>getComputedStyle(d).position==="fixed"&&d.querySelector("button")&&d.innerText.length>30);
  for(const f of fx){
    // Eltern-Willkommen: der Knopf traegt nur ein Haken-Symbol
    if(/Willkommen!/.test(f.innerText)){ const w=[...f.querySelectorAll("button")].pop(); if(w){ w.click(); return false; } }
    const b2=[...f.querySelectorAll("button")].find(x=>/geht|Los|Verstanden|Alles klar|Start|Jetzt nicht|Speichern & loslegen|Weiter →/i.test(x.innerText)); if(b2){ b2.click(); return false; } }
  return true; }); await page.waitForTimeout(500); if(done) break; } };
await page.addInitScript(()=>{
  localStorage.setItem("vereinsapp_config", JSON.stringify({url:"https://127.0.0.1:1/x", key:"test"}));   // Fake-Cloud: Offline-Spiegel
  if(!sessionStorage.getItem("va_sw")) sessionStorage.setItem("vereinsapp_v12_session", JSON.stringify({ role:"trainer", cid:"demo", tids:["demo_f1"], name:"Trainer A", id:"dt1" }));
});
await page.goto("http://127.0.0.1:4218/", { waitUntil:"networkidle" }); await page.waitForTimeout(2500);
await page.locator('button:has-text("Überspringen")').first().click().catch(()=>{}); await page.waitForTimeout(400);
await dismissOverlays();

// ===== 1) Trainer legt einen Termin in 3 Tagen an =====
const in3=await page.evaluate(()=>{ const d=new Date(); d.setDate(d.getDate()+3); const p=x=>String(x).padStart(2,"0"); return `${d.getFullYear()}-${p(d.getMonth()+1)}-${p(d.getDate())}`; });
await page.getByText("Schritt-für-Schritt Assistent").first().click(); await page.waitForTimeout(600);
await page.getByText("F-Jugend 1").first().click().catch(()=>{}); await page.waitForTimeout(300);
await page.locator('button:has-text("Weiter ->")').click(); await page.waitForTimeout(400);   // Team
await page.locator('button:has-text("Weiter ->")').click(); await page.waitForTimeout(400);   // Art
const txt=page.locator('input:not([type="time"]):not([type="checkbox"]):not([type="number"]):not([type="date"])');
await txt.nth(0).fill("Kurzfristiges Zusatztraining");
await page.locator('input[type="date"]').first().fill(in3).catch(()=>{});
await page.waitForTimeout(300);
await page.locator('button:has-text("Weiter ->")').click(); await page.waitForTimeout(400);   // Details -> Umfrage
await page.locator('button:has-text("Weiter ->")').click(); await page.waitForTimeout(400);   // -> Abschluss
await page.locator('button:has-text("Termin erstellen")').last().click().catch(()=>{}); await page.waitForTimeout(1200);

let b=await body();
if(b.includes("⚡ Kurzfristiger Termin angelegt")) ok("Trainer bekommt Info-Blatt für kurzfristigen Termin"); else fail("Info-Blatt fehlt: "+b.slice(0,200));
if(b.includes("Zusätzlich in die Eltern-Gruppe teilen")) ok("Fertiger Teilen-Text angeboten"); else fail("Teilen-Knopf fehlt");
if(b.includes("Push-Info ist bereits raus")) ok("Push wurde automatisch ausgelöst"); else fail("Push-Hinweis fehlt");
await page.locator('button:has-text("Fertig")').click(); await page.waitForTimeout(600);
b=await body();
if(b.includes("⚡ Kurzfristig")) ok("Trainer-Terminliste markiert den Termin (⚡ Kurzfristig)"); else fail("Trainer-Markierung fehlt");

// ===== 2) Normaler Termin (in 30 Tagen) darf NICHT markiert werden =====
const in30=await page.evaluate(()=>{ const d=new Date(); d.setDate(d.getDate()+30); const p=x=>String(x).padStart(2,"0"); return `${d.getFullYear()}-${p(d.getMonth()+1)}-${p(d.getDate())}`; });
await page.getByText("Schritt-für-Schritt Assistent").first().click(); await page.waitForTimeout(600);
await page.getByText("F-Jugend 1").first().click().catch(()=>{}); await page.waitForTimeout(300);
await page.locator('button:has-text("Weiter ->")').click(); await page.waitForTimeout(400);
await page.locator('button:has-text("Weiter ->")').click(); await page.waitForTimeout(400);
await page.locator('input:not([type="time"]):not([type="checkbox"]):not([type="number"]):not([type="date"])').nth(0).fill("Termin in Ruhe geplant");
await page.locator('input[type="date"]').first().fill(in30).catch(()=>{});
await page.waitForTimeout(300);
await page.locator('button:has-text("Weiter ->")').click(); await page.waitForTimeout(400);
await page.locator('button:has-text("Weiter ->")').click(); await page.waitForTimeout(400);
await page.locator('button:has-text("Termin erstellen")').last().click().catch(()=>{}); await page.waitForTimeout(1000);
b=await body();
if(!b.includes("⚡ Kurzfristiger Termin angelegt")) ok("Termin mit Vorlauf löst KEIN Info-Blatt aus"); else fail("Info-Blatt fälschlich bei langfristigem Termin");

// ===== 3) Eltern: Banner oben + rote Karte, Antwort fehlt =====
await page.evaluate(()=>{ sessionStorage.setItem("va_sw","1"); sessionStorage.setItem("vereinsapp_v12_session", JSON.stringify({ role:"user", cid:"demo", tid:"demo_f1", user:"Ben Fischer" })); });
await page.reload({waitUntil:"networkidle"}); await page.waitForTimeout(2500);
await page.locator('button:has-text("Überspringen")').first().click().catch(()=>{}); await page.waitForTimeout(300);
await dismissOverlays();
b=await body();
if(b.includes("Kurzfristiger Termin – deine Antwort fehlt")) ok("Eltern: Warn-Banner ganz oben in der Liste"); else fail("Eltern-Banner fehlt: "+b.slice(0,220));
if(b.includes("Kurzfristiges Zusatztraining")) ok("Banner nennt den Termin"); else fail("Termin im Banner fehlt");
if(b.includes("bitte kurz abstimmen")) ok("Rote Terminkarte mit Kurzfristig-Hinweis"); else fail("Karten-Hinweis fehlt");
// Der langfristige Termin darf NICHT im Banner auftauchen
if(!b.includes("Termin in Ruhe geplant · ")) ok("Langfristiger Termin bleibt normal (nicht im Banner)");

// ===== 4) Nach dem Abstimmen verschwindet die Warnung =====
// Innerstes passendes Element klicken - ein Klick auf einen Eltern-Container
// loest den onClick des Banners nicht aus.
await page.evaluate(()=>{ const ds=[...document.querySelectorAll("div")].filter(x=>x.innerText.includes("Kurzfristiger Termin – deine Antwort fehlt")&&x.innerText.includes("Ansehen")); const d=ds.pop(); d&&d.click(); });
await page.waitForTimeout(900);
// Die Zusage ist in PollAttend ein <div> mit onClick (kein <button>) -
// deshalb das innerste passende Element suchen und die Kette hochklicken.
const voted=await page.evaluate(()=>{
  const els=[...document.querySelectorAll("div,span")].filter(x=>/^(Ich bin dabei|Mein Kind ist dabei)/.test(x.innerText.trim())&&x.innerText.trim().length<60);
  const el=els.pop(); if(!el) return null;
  let n=el; for(let i=0;i<4&&n;i++){ n.click(); n=n.parentElement; }
  return el.innerText.trim().slice(0,30);
});
await page.waitForTimeout(1200);
b=await body();
if(voted&&!b.includes("Kurzfristiger Termin – deine Antwort fehlt")) ok("Nach der Zusage verschwindet der Warn-Banner ("+voted+")");
else if(!voted) fail("Zusage-Knopf nicht gefunden");
else fail("Banner bleibt trotz Zusage stehen");

if(errors.length){ console.log("JS-FEHLER:"); [...new Set(errors)].forEach(e=>console.log(" -",e.slice(0,150))); }
console.log(errors.length||fails.length?`ERGEBNIS: ${fails.length} Fehlschläge, ${errors.length} JS-Fehler`:"ERGEBNIS: ALLES OK");
await browser.close(); srv.close();
process.exit(errors.length||fails.length?1:0);
