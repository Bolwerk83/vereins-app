// E2E-Test: In der Kaderliste muss der Name lesbar sein - auch lange Namen.
// Aufruf: npm run build && node scripts/test-kaderliste.mjs
import { chromium } from "playwright-core";
import http from "http"; import fs from "fs"; import path from "path";
const dist = path.resolve("dist");
const srv = http.createServer((req,res)=>{ let p=path.join(dist,req.url.split("?")[0]); if(!fs.existsSync(p)||fs.statSync(p).isDirectory()) p=path.join(dist,"index.html"); res.setHeader("content-type",{".html":"text/html",".js":"text/javascript",".css":"text/css"}[path.extname(p)]||"text/plain"); res.end(fs.readFileSync(p)); }).listen(4263);
const exe=process.env.PLAYWRIGHT_CHROMIUM||"/opt/pw-browsers/chromium-1194/chrome-linux/chrome";
const browser = await chromium.launch({ executablePath:exe, args:["--no-sandbox"] });
const page = await browser.newPage({ viewport:{ width:390, height:900 } });
const errors=[]; const fails=[];
page.on("pageerror", e=>errors.push(e.message));
page.on("dialog", d=>d.accept());
const fail=m=>{ fails.push(m); console.log("FEHLGESCHLAGEN:", m); };
const ok=m=>console.log("OK:", m);
const body=()=>page.evaluate(()=>document.body.innerText);
const clickTxt=re=>page.evaluate(r=>{ const b=[...document.querySelectorAll("button")].find(x=>new RegExp(r).test(x.innerText||"")); if(!b) return false; b.click(); return true; },re instanceof RegExp?re.source:re);
const dismiss=async()=>{ for(let k=0;k<12;k++){ const done=await page.evaluate(()=>{
  const fx=[...document.querySelectorAll("div")].filter(d=>getComputedStyle(d).position==="fixed"&&d.querySelector("button")&&d.innerText.length>30);
  for(const f of fx){ const b=[...f.querySelectorAll("button")].find(x=>/geht|Los|Verstanden|Alles klar|Fertig|Jetzt nicht|Weiter →|Überspringen|Start/i.test(x.innerText)); if(b){ b.click(); return false; } }
  return true; }); await page.waitForTimeout(400); if(done) break; } };
await page.addInitScript(()=>{ localStorage.setItem("vereinsapp_config", JSON.stringify({url:"https://127.0.0.1:1/x", key:"test"})); localStorage.setItem("va_simple","0"); localStorage.setItem("va_tsimple","0"); });
await page.goto("http://127.0.0.1:4263/", { waitUntil:"networkidle" }); await page.waitForTimeout(2500);
await page.evaluate(()=>{ sessionStorage.setItem("vereinsapp_v12_session", JSON.stringify({role:"trainer",cid:"demo",tids:["demo_f1"],name:"Demo Trainer",id:"demo_tr1"})); });
await page.reload({waitUntil:"networkidle"}); await page.waitForTimeout(2600); await dismiss();
await page.evaluate(()=>{ const b=[...document.querySelectorAll("button")].find(x=>/Bin dabei/.test(x.innerText)); b&&b.click(); });
await page.waitForTimeout(1300);
// Lange Namen setzen – genau der gemeldete Fall
const LANG="Ahmed Ibrahim Al-Rashid";
await page.evaluate(n=>{
  const d=JSON.parse(localStorage.getItem("vereinsapp_v14")||"null"); if(!d) return;
  const p=(d.playerProfiles||[]).filter(x=>x.mainTid==="demo_f1")[0]; if(p) p.name=n;
  localStorage.setItem("vereinsapp_v14", JSON.stringify(d));
}, LANG);
await page.reload({waitUntil:"networkidle"}); await page.waitForTimeout(2800); await dismiss();
await page.evaluate(()=>{ const b=[...document.querySelectorAll("button")].find(x=>(x.innerText||"").trim()==="Team"); b&&b.click(); });
await page.waitForTimeout(1400); await dismiss();
await clickTxt("^Spieler$"); await page.waitForTimeout(1400);

let b=await body();
if(/HAUPTKADER/.test(b)) ok("Kaderliste ist offen"); else fail("Kader nicht offen: "+b.slice(0,200).replace(/\n/g," | "));

// ===== 1) Name vollständig lesbar =====
{ const info=await page.evaluate(n=>{
    const el=[...document.querySelectorAll("span")].find(x=>(x.innerText||"").trim()===n);
    if(!el) return null;
    const r=el.getBoundingClientRect();
    return { breite:Math.round(r.width), noetig:Math.round(el.scrollWidth), abgeschnitten:el.scrollWidth>el.clientWidth+1 };
  }, LANG);
  if(!info) fail("Langer Name gar nicht gefunden");
  else if(!info.abgeschnitten) ok("Langer Name steht vollständig da ("+info.breite+" px für "+info.noetig+" px Text)");
  else fail("Name wird abgeschnitten: "+JSON.stringify(info)); }
{ const kurz=await page.evaluate(()=>[...document.querySelectorAll("span")]
    .filter(x=>x.style.fontWeight==="800"&&x.scrollWidth>x.clientWidth+1)
    .map(x=>(x.innerText||"").trim()).filter(t=>t.length>2));
  if(!kurz.length) ok("Auch sonst wird kein Name gekürzt"); else fail("Gekürzte Namen: "+JSON.stringify(kurz)); }

// ===== 2) Alle Knöpfe weiter da und gross genug =====
{ const kn=await page.evaluate(n=>{
    const el=[...document.querySelectorAll("span")].find(x=>(x.innerText||"").trim()===n);
    // Karte = naechster Vorfahre, der auch die Knopf-Zeile enthaelt
    let karte=el; for(let k=0;k<6&&karte;k++){ karte=karte.parentElement;
      if(karte&&karte.querySelectorAll("button").length>=3) break; }
    if(!karte) return null;
    return [...karte.querySelectorAll("button")].map(x=>({ t:(x.innerText||"").trim()||x.getAttribute("aria-label")||"?",
      h:Math.round(x.getBoundingClientRect().height), w:Math.round(x.getBoundingClientRect().width) }));
  }, LANG);
  if(!kn) fail("Karte nicht gefunden");
  else {
    const namen=kn.map(x=>x.t).join(" · ");
    if(kn.length>=3) ok("Die Knöpfe sind weiterhin da: "+namen); else fail("Knöpfe fehlen: "+namen);
    const klein=kn.filter(x=>x.h<32||x.w<32);
    if(!klein.length) ok("Und alle mindestens 32 px groß"); else fail("Zu kleine Ziele: "+JSON.stringify(klein)); } }

// ===== 3) Zeilenaufbau: Name oben, Knöpfe darunter =====
{ const lage=await page.evaluate(n=>{
    const el=[...document.querySelectorAll("span")].find(x=>(x.innerText||"").trim()===n);
    let karte=el; for(let k=0;k<6&&karte;k++){ karte=karte.parentElement;
      if(karte&&karte.querySelectorAll("button").length>=3) break; }
    const b2=karte&&[...karte.querySelectorAll("button")].find(x=>(x.getAttribute("aria-label")||"")==="Bearbeiten");
    if(!el||!b2) return null;
    return el.getBoundingClientRect().bottom <= b2.getBoundingClientRect().top+2;
  }, LANG);
  if(lage===true) ok("Der Name steht über den Knöpfen – nichts drängelt mehr");
  else fail("Aufbau unerwartet: "+JSON.stringify(lage)); }

if(errors.length){ console.log("JS-FEHLER:"); [...new Set(errors)].forEach(e=>console.log(" -",e.slice(0,150))); }
console.log(errors.length||fails.length?`ERGEBNIS: ${fails.length} Fehlschläge, ${errors.length} JS-Fehler`:"ERGEBNIS: ALLES OK");
await browser.close(); srv.close();
process.exit(errors.length||fails.length?1:0);
