// E2E-Test: (1) Trainer sieht auf der Terminkarte, wie viele Helfer dabei sind -
// inklusive Warteliste und Namen. (2) Uebungs-Auswahl: erst ansehen (Skizze,
// Beschreibung, Coaching), dann entscheiden.
// Aufruf: npm run build && node scripts/test-uebersicht.mjs
import { chromium } from "playwright-core";
import http from "http"; import fs from "fs"; import path from "path";
const dist = path.resolve("dist");
const srv = http.createServer((req,res)=>{ let p=path.join(dist,req.url.split("?")[0]); if(!fs.existsSync(p)||fs.statSync(p).isDirectory()) p=path.join(dist,"index.html"); res.setHeader("content-type",{".html":"text/html",".js":"text/javascript",".css":"text/css"}[path.extname(p)]||"text/plain"); res.end(fs.readFileSync(p)); }).listen(4223);
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
    if(/Willkommen!/.test(f.innerText)){ const w=[...f.querySelectorAll("button")].pop(); if(w){ w.click(); return false; } }
    const b2=[...f.querySelectorAll("button")].find(x=>/geht|Los|Verstanden|Alles klar|Start|Jetzt nicht|Fertig|Speichern & loslegen|Weiter →/i.test(x.innerText)); if(b2){ b2.click(); return false; } }
  return true; }); await page.waitForTimeout(500); if(done) break; } };
// Karte eines Termins (innerster Container mit dem Titel)
const card = t => page.evaluate(tt=>{ const cs=[...document.querySelectorAll("div")].filter(d=>d.innerText.includes(tt)&&d.querySelector("button")&&d.innerText.length<800); return cs.length?cs[cs.length-1].innerText.replace(/\n/g," | "):""; },t);
const clickInCard = (t,re) => page.evaluate(([tt,rr])=>{ const cs=[...document.querySelectorAll("div")].filter(d=>d.innerText.includes(tt)&&d.querySelector("button")&&d.innerText.length<800); const c=cs[cs.length-1]; if(!c) return false; const b=[...c.querySelectorAll("button")].find(x=>new RegExp(rr).test(x.innerText)); if(!b) return false; b.click(); return true; },[t,re]);
const asUser = async sess => { await page.evaluate(s=>{ sessionStorage.setItem("va_role","1"); sessionStorage.setItem("vereinsapp_v12_session", JSON.stringify(s)); },sess);
  await page.reload({waitUntil:"networkidle"}); await page.waitForTimeout(2300);
  await page.locator('button:has-text("Überspringen")').first().click({timeout:1200}).catch(()=>{}); await page.waitForTimeout(300); await dismissOverlays(); };
// Termin ueber die Ansehen-Knoepfe oeffnen (Reihenfolge haengt vom Datum ab)
const modalTxt = () => page.evaluate(()=>{ const fx=[...document.querySelectorAll("div")].filter(d=>getComputedStyle(d).position==="fixed"&&/👥 Orga/.test(d.innerText)); return fx.length?fx[0].innerText:""; });
const openEvent = async title => { const n=await page.locator('button:has-text("Ansehen")').count();
  for(let i=0;i<n;i++){ await page.locator('button:has-text("Ansehen")').nth(i).click({timeout:3000}).catch(()=>{}); await page.waitForTimeout(800);
    if((await modalTxt()).includes(title)) return true;
    await page.evaluate(()=>{ const x=[...document.querySelectorAll("button")].find(y=>y.innerText.trim()==="Schließen"); x&&x.click(); }); await page.keyboard.press("Escape").catch(()=>{}); await page.waitForTimeout(400); }
  return false; };
const TRAINER={ role:"trainer", cid:"demo", tids:["demo_f1"], name:"Demo Trainer", id:"demo_tr1" };
const H1={ id:"dh2", role:"helper", cid:"demo", name:"Markus Lang", helperId:"dh2", tids:["demo_f1"] };
const H2={ id:"dh3", role:"helper", cid:"demo", name:"Sabine Vogt", helperId:"dh3", tids:["demo_f1"] };
const TRAINING="Abschlusstraining vor dem Spiel";
const SPIEL="Heimspiel vs. SV Adler";

await page.addInitScript(()=>{
  localStorage.setItem("vereinsapp_config", JSON.stringify({url:"https://127.0.0.1:1/x", key:"test"}));
  if(!sessionStorage.getItem("va_role")) sessionStorage.setItem("vereinsapp_v12_session", JSON.stringify({ role:"trainer", cid:"demo", tids:["demo_f1"], name:"Demo Trainer", id:"demo_tr1" }));
});
await page.goto("http://127.0.0.1:4223/", { waitUntil:"networkidle" }); await page.waitForTimeout(2500);
await page.locator('button:has-text("Überspringen")').first().click({timeout:1200}).catch(()=>{}); await page.waitForTimeout(300);
await dismissOverlays();

// ===== 1) Ausgangslage: noch keine Helfer =====
let ct=await card(TRAINING);
if(!/Helfer dabei/.test(ct)) ok("Ohne Helfer keine Helfer-Zeile auf der Karte"); else fail("Helfer-Zeile ohne Helfer: "+ct);

// ===== 2) Zwei Helfer melden sich beim Training =====
await asUser(H1);
if(await clickInCard(TRAINING,"🙋 Ich helfe")) ok("Helfer 1 meldet sich beim Training"); else fail("Helfer 1 konnte sich nicht melden: "+(await card(TRAINING)));
await page.waitForTimeout(900);
await asUser(H2);
if(await clickInCard(TRAINING,"🙋 Ich helfe")) ok("Helfer 2 meldet sich beim Training"); else fail("Helfer 2 konnte sich nicht melden");
await page.waitForTimeout(900);

// ===== 3) Trainer sieht die Zahl und die Namen =====
await asUser(TRAINER);
ct=await card(TRAINING);
if(/🙋 2 Helfer dabei/.test(ct)) ok("Trainer sieht die Anzahl der Helfer beim Training (2)"); else fail("Helfer-Zähler fehlt: "+ct);
if(/Markus Lang/.test(ct)&&/Sabine Vogt/.test(ct)) ok("Namen der Helfer stehen direkt auf der Karte"); else fail("Helfer-Namen fehlen: "+ct);

// ===== 4) Spiel: Bedarf 1 -> zweiter Helfer landet auf der Warteliste =====
if(await openEvent(SPIEL)) ok("Spieltermin geöffnet"); else fail("Spieltermin nicht gefunden");
await page.locator('button:has-text("👥 Orga")').first().click({timeout:3000}).catch(()=>{}); await page.waitForTimeout(600);
let b=await modalTxt();
if(/Helfer-Einsatz|Helfer-Anmeldung/.test(b)) ok("Trainer findet den Helfer-Bereich beim Spiel"); else fail("Helfer-Bereich fehlt: "+b.slice(0,220).replace(/\n/g," | "));
await page.evaluate(()=>{ const x=[...document.querySelectorAll("button")].find(y=>/freigeben/i.test(y.innerText)); x&&x.click(); });
await page.waitForTimeout(800);
// Bedarf auf 1 stellen
for(let i=0;i<4;i++){ const done=await page.evaluate(()=>{ const box=[...document.querySelectorAll("div")].filter(d=>/Benötigte Helfer/.test(d.innerText)&&d.innerText.length<400).pop();
  const minus=[...(box||document).querySelectorAll("button")].find(x=>x.innerText.trim()==="−"||x.innerText.trim()==="-"); if(!minus) return true; minus.click(); return false; });
  await page.waitForTimeout(350); if(done) break; }
await page.keyboard.press("Escape").catch(()=>{});
await page.evaluate(()=>{ const x=[...document.querySelectorAll("button")].find(y=>y.innerText.trim()==="Schließen"); x&&x.click(); });
await page.waitForTimeout(500);
await asUser(H1);
if(await clickInCard(SPIEL,"🙋 Ich helfe")) ok("Helfer 1 sagt beim Spiel zu"); else fail("Helfer 1 kann beim Spiel nicht zusagen: "+(await card(SPIEL)));
await page.waitForTimeout(900);
await asUser(H2);
if(await clickInCard(SPIEL,"🙋 Ich helfe")) ok("Helfer 2 sagt beim Spiel zu"); else fail("Helfer 2 kann beim Spiel nicht zusagen");
await page.waitForTimeout(900);
let ct2=await card(SPIEL);
if(/Warteliste/.test(ct2)) ok("Helfer 2 sieht selbst, dass er auf der Warteliste steht"); else fail("Warteliste-Status beim Helfer fehlt: "+ct2);
await asUser(TRAINER);
ct2=await card(SPIEL);
if(/🙋 \d+\/\d+ Helfer/.test(ct2)) ok("Trainer sieht Ist/Soll der Helfer beim Spiel ("+(ct2.match(/🙋 \d+\/\d+ Helfer/)||[""])[0]+")"); else fail("Ist/Soll fehlt: "+ct2);
if(/⏳ \d+ auf Warteliste/.test(ct2)) ok("Warteliste wird dem Trainer angezeigt ("+(ct2.match(/⏳ \d+ auf Warteliste/)||[""])[0]+")"); else fail("Warteliste fehlt beim Trainer: "+ct2);
if(/Markus Lang/.test(ct2)&&/Sabine Vogt/.test(ct2)) ok("Auch beim Spiel stehen die Namen auf der Karte"); else fail("Namen fehlen beim Spiel: "+ct2);

// ===== 5) Übungs-Auswahl: erst ansehen, dann entscheiden =====
await page.evaluate(t=>{ const cs=[...document.querySelectorAll("div")].filter(d=>d.innerText.includes(t)&&d.querySelector("button")&&d.innerText.length<800); const c=cs[cs.length-1]; const b=[...c.querySelectorAll("button")].find(x=>/Training/.test(x.innerText)); b&&b.click(); },TRAINING);
await page.waitForTimeout(1000);
b=await body();
if(/Trainingsplan/.test(b)) ok("Trainingsplan-Editor geöffnet"); else fail("Editor nicht geöffnet: "+b.slice(0,150));
await page.evaluate(()=>{ const x=[...document.querySelectorAll("button")].find(y=>/\+ Block|Block hinzufügen|＋ Block/.test(y.innerText)); x&&x.click(); });
await page.waitForTimeout(600);
await page.evaluate(()=>{ const x=[...document.querySelectorAll("button")].find(y=>/Übung aus Bibliothek wählen/.test(y.innerText)); x&&x.click(); });
await page.waitForTimeout(700);
b=await body();
if(/Übung wählen/.test(b)) ok("Übungs-Auswahl geöffnet"); else fail("Übungs-Auswahl nicht geöffnet: "+b.slice(0,200));
if(/du siehst erst die Skizze/.test(b)) ok("Hinweis erklärt das Ansehen vor dem Auswählen"); else fail("Erklärtext fehlt");
if(/👁 Ansehen/.test(b)) ok("Jede Übung hat einen Ansehen-Hinweis"); else fail("Ansehen-Hinweis fehlt");
// Erste Übung aufklappen
const first=await page.evaluate(()=>{ const rows=[...document.querySelectorAll("div")].filter(d=>/👁 Ansehen/.test(d.innerText)&&d.innerText.length<200); const r=rows[rows.length-1]; if(!r) return null; const name=r.innerText.split("\n")[0]; r.click(); return name; });
await page.waitForTimeout(700);
b=await body();
if(first) ok("Übung „"+first+"“ angetippt"); else fail("Keine Übung zum Aufklappen gefunden");
const svg=await page.evaluate(()=>[...document.querySelectorAll("svg")].some(s=>s.closest("div")&&/Diese Übung nehmen/.test(s.closest("div").parentElement?.innerText||"")));
if(svg) ok("Vorschau zeigt die gezeichnete Übungs-Skizze"); else fail("Skizze in der Vorschau fehlt");
if(/Diese Übung nehmen/.test(b)) ok("Erst nach dem Ansehen kommt „Diese Übung nehmen“"); else fail("Übernehmen-Knopf fehlt");
if(/Darauf achten|Passt zu/.test(b)) ok("Vorschau erklärt Coaching-Punkt bzw. passende Jugend"); else fail("Erklärungen in der Vorschau fehlen");
// Ganze Karte oeffnen
await page.evaluate(()=>{ const x=[...document.querySelectorAll("button")].find(y=>/Ganze Karte/.test(y.innerText)); x&&x.click(); });
await page.waitForTimeout(800);
b=await body();
if(/So erklärst du es den Kindern|Coaching|Ablauf|Variante/i.test(b)) ok("„Ganze Karte“ öffnet die ausführliche Übungskarte"); else fail("Ganze Karte fehlt: "+b.slice(0,200));
await page.evaluate(()=>{ const fx=[...document.querySelectorAll("div")].filter(d=>getComputedStyle(d).position==="fixed"); const top=fx[fx.length-1]; const x=[...(top||document).querySelectorAll("button")].find(y=>y.getAttribute("aria-label")==="Schließen"); x&&x.click(); });
await page.waitForTimeout(600);
b=await body();
if(/Übung wählen/.test(b)) ok("Nach dem Schließen ist die Auswahl-Liste noch da"); else fail("Auswahl-Liste nach dem Schließen weg");
// Uebernehmen
await page.evaluate(()=>{ const x=[...document.querySelectorAll("button")].find(y=>/Diese Übung nehmen/.test(y.innerText)); x&&x.click(); });
await page.waitForTimeout(700);
b=await body();
if(!/Übung wählen/.test(b)&&first&&b.includes(first.trim())) ok("Übung übernommen – steht im Trainingsplan"); else fail("Übung nicht übernommen: "+b.slice(0,200));

if(errors.length){ console.log("JS-FEHLER:"); [...new Set(errors)].forEach(e=>console.log(" -",e.slice(0,150))); }
console.log(errors.length||fails.length?`ERGEBNIS: ${fails.length} Fehlschläge, ${errors.length} JS-Fehler`:"ERGEBNIS: ALLES OK");
await browser.close(); srv.close();
process.exit(errors.length||fails.length?1:0);
