// E2E-Test: Helfer kann sich bei bereits angelegten Terminen melden, AUCH
// bevor der Trainer die Helfer-Anmeldung freigegeben hat. Bei der Freigabe
// werden die Bereiten automatisch als Zusage uebernommen.
// Aufruf: npm run build && node scripts/test-helfer-bereit.mjs
import { chromium } from "playwright-core";
import http from "http"; import fs from "fs"; import path from "path";
const dist = path.resolve("dist");
const srv = http.createServer((req,res)=>{ let p=path.join(dist,req.url.split("?")[0]); if(!fs.existsSync(p)||fs.statSync(p).isDirectory()) p=path.join(dist,"index.html"); res.setHeader("content-type",{".html":"text/html",".js":"text/javascript",".css":"text/css"}[path.extname(p)]||"text/plain"); res.end(fs.readFileSync(p)); }).listen(4219);
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
// Termin mit Helfer-Bedarf finden (Spiel/Turnier/Fest -> kein Training)
const openHelferEv=async()=>{
  const c=await page.locator('button:has-text("Ansehen")').count();
  for(let i=0;i<c;i++){
    await page.locator('button:has-text("Ansehen")').nth(i).click().catch(()=>{}); await page.waitForTimeout(700);
    await page.locator('button:has-text("👥 Orga")').first().click().catch(()=>{}); await page.waitForTimeout(500);
    const t=await body();
    if(t.includes("Helfer-Einsatz")||t.includes("Helfer-Anmeldung für diesen Termin freigeben")) return true;
    await closeEv();
  }
  return false;
};
await page.addInitScript(()=>{
  localStorage.setItem("vereinsapp_config", JSON.stringify({url:"https://127.0.0.1:1/x", key:"test"}));   // Fake-Cloud: Offline-Spiegel
  if(!sessionStorage.getItem("va_role")) sessionStorage.setItem("vereinsapp_v12_session", JSON.stringify({ role:"trainer", cid:"demo", tids:["demo_f1"], name:"Demo Trainer", id:"demo_tr1" }));
});
await page.goto("http://127.0.0.1:4219/", { waitUntil:"networkidle" }); await page.waitForTimeout(2500);
await page.locator('button:has-text("Überspringen")').first().click().catch(()=>{}); await page.waitForTimeout(300);
await dismissOverlays();

// ===== 1) Trainer legt einen Helfer an (Einmal-Passwort) =====
await page.locator('button:has-text("Mehr")').last().click(); await page.waitForTimeout(600);
await page.locator('button:has-text("Helfer")').last().click(); await page.waitForTimeout(700);
await page.locator('button:has-text("+ Neuer Helfer")').click(); await page.waitForTimeout(500);
await page.locator('input[placeholder*="Maria"]').fill("Bereit Berta"); await page.waitForTimeout(200);
const pw=await page.evaluate(()=>{ const sp=[...document.querySelectorAll("span")].find(x=>x.style.fontFamily==="monospace"&&/^[A-Za-z0-9]{6}$/.test(x.textContent.trim())); return sp?sp.textContent.trim():null; });
await page.locator('button:has-text("Speichern")').last().click(); await page.waitForTimeout(700);
if(pw) ok("Helfer angelegt (Einmal-Passwort "+pw+")"); else fail("Kein Einmal-Passwort");

// ===== 2) Helfer loggt sich ein und sieht den bereits angelegten Termin =====
await page.keyboard.press("Escape").catch(()=>{}); await page.waitForTimeout(300);
await page.evaluate(()=>{ const b2=[...document.querySelectorAll("button")].find(x=>x.innerText.trim()==="Logout"); b2&&b2.click(); });
await page.waitForTimeout(1000);
await page.getByText("Turnier & Spieltag unterstützen").click(); await page.waitForTimeout(900);
await page.evaluate(()=>{ const cards=[...document.querySelectorAll("div")].filter(d=>String(d.className).includes("up")&&/\d+ Helfer/.test(d.innerText)&&d.innerText.length<120); cards[0]&&cards[0].click(); });
await page.waitForTimeout(700);
if((await body()).includes("Welcher Helfer bist du?")){ await page.getByText("Bereit Berta",{exact:false}).first().click(); await page.waitForTimeout(500); }
await page.locator('input[type="password"]').first().fill(pw);
await page.locator('button:has-text("Anmelden")').click(); await page.waitForTimeout(800);
const pws=page.locator('input[type="password"]');
await pws.nth(0).fill("berta123"); await pws.nth(1).fill("berta123");
await page.locator('button:has-text("Passwort speichern & einloggen")').click(); await page.waitForTimeout(1500);
await dismissOverlays();
let b=await body();
if(b.includes("Ansehen")) ok("Helfer sieht die bereits angelegten Termine"); else fail("Helfer sieht keine Termine: "+b.slice(0,150));
// Der Helfer darf NICHT als Spieler abstimmen (Schnellwahl 'Ich:' ist weg)
// Die Schnellwahl auf der Karte beginnt mit dem Label "Ich:" - der Text
// "Bin dabei" steht auch im Erklaertext der Seite und taugt nicht als Marker.
if(!/(^|\n)Ich:/.test(b)) ok("Keine Spieler-Schnellabstimmung für Helfer (verfälscht die Zusagen nicht)"); else fail("Helfer kann als Spieler abstimmen");

// ===== 3) Helfer meldet Bereitschaft VOR der Freigabe =====
if(await openHelferEv()){
  b=await body();
  if(b.includes("Der Trainer hat den Einsatz noch nicht freigegeben")) ok("Helfer sieht den Status (noch nicht freigegeben)"); else fail("Status-Hinweis fehlt: "+(b.match(/Helfer-Einsatz[\s\S]{0,200}/)||["?"])[0].replace(/\n/g," | "));
  if(b.includes("🙋 Ich kann helfen")) ok("Helfer kann sich trotzdem melden"); else fail("Melde-Knopf fehlt");
  await page.locator('button:has-text("🙋 Ich kann helfen")').click(); await page.waitForTimeout(700);
  b=await body();
  if(b.includes("Deine Bereitschaft ist notiert")) ok("Bereitschaft gespeichert"); else fail("Bereitschaft nicht gespeichert");
  if(b.includes("Bereit Berta")) ok("Helfer steht mit Namen in der Liste"); else fail("Name fehlt in der Liste");
  await closeEv();
} else fail("Kein Termin mit Helfer-Bereich gefunden");

// ===== 4) Trainer sieht die Bereitschaft und gibt frei =====
await page.evaluate(()=>{ sessionStorage.setItem("va_role","1"); sessionStorage.setItem("vereinsapp_v12_session", JSON.stringify({ role:"trainer", cid:"demo", tids:["demo_f1"], name:"Demo Trainer", id:"demo_tr1" })); });
await page.reload({waitUntil:"networkidle"}); await page.waitForTimeout(2500);
await page.locator('button:has-text("Überspringen")').first().click().catch(()=>{}); await page.waitForTimeout(300);
await dismissOverlays();
b=await body();
if(b.includes("🙋 1 bereit")) ok("Terminkarte zeigt dem Trainer: 1 Helfer bereit"); else fail("Chip '1 bereit' fehlt");
if(await openHelferEv()){
  b=await body();
  if(b.includes("1 Helfer ist schon bereit")&&b.includes("Bereit Berta")) ok("Trainer sieht die bereiten Helfer namentlich"); else fail("Bereitschafts-Karte fehlt: "+b.slice(0,200));
  await page.locator('button:has-text("Helfer-Anmeldung für diesen Termin freigeben")').click(); await page.waitForTimeout(900);
  b=await body();
  if(b.includes("bereite Helfer direkt übernommen")||b.includes("Helfer-Einsatz")) ok("Freigabe übernimmt die Bereiten automatisch"); else fail("Freigabe ohne Übernahme");
  if(b.includes("Bereit Berta")) ok("Helfer steht jetzt als Zusage im Einsatz"); else fail("Zusage nach Freigabe fehlt: "+(b.match(/Helfer-Einsatz[\s\S]{0,220}/)||["?"])[0].replace(/\n/g," | "));
} else fail("Termin nach Reload nicht gefunden");

if(errors.length){ console.log("JS-FEHLER:"); [...new Set(errors)].forEach(e=>console.log(" -",e.slice(0,150))); }
console.log(errors.length||fails.length?`ERGEBNIS: ${fails.length} Fehlschläge, ${errors.length} JS-Fehler`:"ERGEBNIS: ALLES OK");
await browser.close(); srv.close();
process.exit(errors.length||fails.length?1:0);
