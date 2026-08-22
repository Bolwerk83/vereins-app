// E2E-Test: Trainer- und Helfer-Zusagen duerfen nirgends als Spieler zaehlen -
// weder neu abgegebene noch alte Eintraege ohne Rollen-Vermerk und auch nicht
// mit abgekuerztem Namen ("Demo T." statt "Demo Trainer").
// Aufruf: npm run build && node scripts/test-zaehlung.mjs
import { chromium } from "playwright-core";
import http from "http"; import fs from "fs"; import path from "path";
const dist = path.resolve("dist");
const srv = http.createServer((req,res)=>{ let p=path.join(dist,req.url.split("?")[0]); if(!fs.existsSync(p)||fs.statSync(p).isDirectory()) p=path.join(dist,"index.html"); res.setHeader("content-type",{".html":"text/html",".js":"text/javascript",".css":"text/css"}[path.extname(p)]||"text/plain"); res.end(fs.readFileSync(p)); }).listen(4231);
const exe=process.env.PLAYWRIGHT_CHROMIUM||"/opt/pw-browsers/chromium-1194/chrome-linux/chrome";
const browser = await chromium.launch({ executablePath:exe, args:["--no-sandbox"] });
const page = await browser.newPage({ viewport:{ width:390, height:900 } });
const errors=[]; const fails=[];
page.on("pageerror", e=>errors.push(e.message));
page.on("dialog", d=>d.accept());
const fail=m=>{ fails.push(m); console.log("FEHLGESCHLAGEN:", m); };
const ok=m=>console.log("OK:", m);
const body=()=>page.evaluate(()=>document.body.innerText);
const dismiss=async()=>{ for(let k=0;k<14;k++){ const done=await page.evaluate(()=>{
  const fx=[...document.querySelectorAll("div")].filter(d=>getComputedStyle(d).position==="fixed"&&d.querySelector("button")&&d.innerText.length>30);
  for(const f of fx){ if(/Willkommen!/.test(f.innerText)){ const w=[...f.querySelectorAll("button")].pop(); if(w){ w.click(); return false; } }
    const b2=[...f.querySelectorAll("button")].find(x=>/geht|Los|Verstanden|Alles klar|Start|Jetzt nicht|Fertig|Speichern & loslegen|Weiter →|Überspringen/i.test(x.innerText)); if(b2){ b2.click(); return false; } }
  return true; }); await page.waitForTimeout(450); if(done) break; } };
const TRAINING="Abschlusstraining vor dem Spiel";
const karte = () => page.evaluate(tt=>{ const cs=[...document.querySelectorAll("div")].filter(d=>d.innerText.includes(tt)&&d.querySelector("button")&&d.innerText.length<1400); return cs.length?cs[cs.length-1].innerText.replace(/\n/g," | "):""; },TRAINING);
const inKarte = re => page.evaluate(([tt,r])=>{ const cs=[...document.querySelectorAll("div")].filter(d=>d.innerText.includes(tt)&&d.querySelector("button")&&d.innerText.length<1400); const c=cs[cs.length-1]; if(!c) return false; const b=[...c.querySelectorAll("button")].find(x=>new RegExp(r).test(x.innerText)); if(!b) return false; b.click(); return true; },[TRAINING,re]);
const votesVon = () => page.evaluate(tt=>{ const d=JSON.parse(localStorage.getItem("vereinsapp_v14")||"null"); if(!d||!d.events) return null;
  const ev=d.events.find(e=>e.title===tt); return ev?ev.votes||{}:null; },TRAINING);
const setzeVotes = v => page.evaluate(([tt,vv])=>{ const d=JSON.parse(localStorage.getItem("vereinsapp_v14")||"null"); if(!d||!d.events) return false;
  const ev=d.events.find(e=>e.title===tt); if(!ev) return false; ev.votes=vv; localStorage.setItem("vereinsapp_v14",JSON.stringify(d)); return true; },[TRAINING,v]);
await page.addInitScript(()=>{
  localStorage.setItem("vereinsapp_config", JSON.stringify({url:"https://127.0.0.1:1/x", key:"test"}));
  localStorage.setItem("va_simple","0"); localStorage.setItem("va_tsimple","0");   // diese Tests pruefen die ausfuehrliche Ansicht
  sessionStorage.setItem("vereinsapp_v12_session", JSON.stringify({ role:"trainer", cid:"demo", tids:["demo_f1"], name:"Demo Trainer", id:"demo_tr1" }));
});
await page.goto("http://127.0.0.1:4231/", { waitUntil:"networkidle" }); await page.waitForTimeout(2500);
await page.locator('button:has-text("Überspringen")').first().click({timeout:1500}).catch(()=>{}); await page.waitForTimeout(300);
await dismiss();

// ===== 1) Der Trainer sagt selbst zu =====
let k=await karte();
const vorher=(k.match(/✓ (\d+) Spieler/)||[])[1];
if(await inKarte("Bin dabei")) ok("Trainer sagt über die Schnellwahl zu"); else fail("Schnellwahl nicht gefunden");
await page.waitForTimeout(1200);
const v=await votesVon();
const meins=v&&v["Demo Trainer"];
if(meins&&typeof meins==="object"&&meins.role==="trainer") ok("Die Zusage wird mit der Rolle gespeichert (role: trainer)");
else fail("Rolle fehlt an der Zusage: "+JSON.stringify(meins));
k=await karte();
const nachher=(k.match(/✓ (\d+) Spieler/)||[])[1];
if(vorher===nachher) ok("Spielerzahl bleibt unverändert bei "+nachher+" – der Trainer zählt nicht mit");
else fail("Trainer wurde mitgezählt: "+vorher+" → "+nachher);
if(/🧑‍🏫 1 Betreuer/.test(k)) ok("Der Trainer erscheint separat als Betreuer"); else fail("Betreuer-Chip fehlt: "+k.slice(0,140));

// ===== 2) Alt-Daten: Zusagen ohne Rolle, teils mit abgekürztem Namen =====
const gesetzt=await setzeVotes({ "Ben Fischer":"yes", "Leon Weber":"yes", "Lina Schulz":"yes",
  "Demo Trainer":"yes",   // Trainer, altes Format ohne Rolle
  "Demo T.":"yes",        // Trainer mit abgekürztem Nachnamen
  "Markus Lang":"yes" }); // Helfer, altes Format
if(gesetzt) ok("Alt-Zusagen gesetzt: 3 Spieler, 2× Trainer (einmal abgekürzt), 1 Helfer"); else fail("Konnte keine Alt-Daten setzen");
await page.reload({waitUntil:"networkidle"}); await page.waitForTimeout(2500); await dismiss();
k=await karte();
if(/✓ 3 Spieler/.test(k)) ok("Terminkarte zählt nur die 3 Spieler"); else fail("Karte zählt falsch: "+(k.match(/✓ \d+ Spieler/)||["(kein Zähler)"])[0]+" · "+k.slice(0,140));
if(/🧑‍🏫 3 Betreuer/.test(k)) ok("Alle drei Betreuer stehen separat (2 Trainer + 1 Helfer)"); else fail("Betreuer-Chip falsch: "+(k.match(/🧑‍🏫[^|]*/)||["fehlt"])[0]);

// ===== 3) Im Termin =====
{ const geklickt=await inKarte("^Ansehen$"); await page.waitForTimeout(1400);
  if(!geklickt){ const dia=await page.evaluate(tt=>{ const cs=[...document.querySelectorAll("div")].filter(d=>d.innerText.includes(tt)&&d.querySelector("button")&&d.innerText.length<1400);
    return cs.length? (cs[cs.length-1].innerText.replace(/\n/g," | ").slice(0,200)+" || Buttons: "+[...cs[cs.length-1].querySelectorAll("button")].map(b=>b.innerText.trim()).join(",")) : "keine Karte gefunden"; },TRAINING);
    fail("Ansehen nicht klickbar: "+dia); } }
let modal=await page.evaluate(()=>{ const fx=[...document.querySelectorAll("div")].filter(d=>getComputedStyle(d).position==="fixed"&&/Rückmeldungen/.test(d.innerText)); return fx.length?fx[0].innerText:""; });
if(!modal){ const alles=await body();
  console.log("DIAGNOSE nach Ansehen-Klick:", alles.slice(0,300).replace(/\n/g," | "));
  const fixed=await page.evaluate(()=>[...document.querySelectorAll("div")].filter(d=>getComputedStyle(d).position==="fixed").map(d=>d.innerText.slice(0,60).replace(/\n/g,"/")).slice(0,6));
  console.log("FIXED-Container:", JSON.stringify(fixed)); }
{ const vor=(modal.split("Spieler dabei")[0]||"").trim().split(/\s+/).pop();
  if(vor==="3") ok("Kachel „Spieler dabei“ zeigt 3"); else fail("Kachel falsch: "+vor+" statt 3"); }
if(/BETREUER:/.test(modal)) ok("Betreuer stehen in ihrer eigenen Zeile"); else fail("Betreuer-Zeile fehlt: "+modal.slice(0,160).replace(/\n/g," | "));
const liste=await page.evaluate(()=>{ const h=[...document.querySelectorAll("span")].find(x=>x.innerText==="Anwesenheit abhaken");
  const box=h?.closest("div")?.parentElement; return box?box.innerText:""; });
if(liste&&!/Demo T\./.test(liste)) ok("Abgekürzter Trainer-Name („Demo T.“) fehlt in der Anwesenheitsliste"); else fail("Trainer in der Anwesenheitsliste: "+liste.slice(0,140).replace(/\n/g," | "));
if(liste&&!/Markus Lang/.test(liste)) ok("Helfer fehlt in der Anwesenheitsliste"); else fail("Helfer in der Anwesenheitsliste");
if(liste&&/Ben Fischer/.test(liste)) ok("Die Spieler stehen weiterhin drin"); else fail("Spieler fehlen in der Liste");

// ===== 4) Spickzettel zählt ebenfalls nur Spieler =====
await page.evaluate(()=>{ const x=[...document.querySelectorAll("button")].find(y=>y.innerText.trim()==="Schließen"); x&&x.click(); });
await page.keyboard.press("Escape").catch(()=>{}); await page.waitForTimeout(600);
await inKarte("⋯"); await page.waitForTimeout(400);
if(await inKarte("Spickzettel")){ await page.waitForTimeout(900);
  const sp=await body();
  const m=sp.match(/👟\s*(\d+)/);
  if(m&&m[1]==="3") ok("Spickzettel zeigt 3 Zusagen (ohne Trainer und Helfer)"); else fail("Spickzettel zählt falsch: "+(m?m[1]:"?"));
} else fail("Spickzettel nicht erreichbar");

if(errors.length){ console.log("JS-FEHLER:"); [...new Set(errors)].forEach(e=>console.log(" -",e.slice(0,150))); }
console.log(errors.length||fails.length?`ERGEBNIS: ${fails.length} Fehlschläge, ${errors.length} JS-Fehler`:"ERGEBNIS: ALLES OK");
await browser.close(); srv.close();
process.exit(errors.length||fails.length?1:0);
