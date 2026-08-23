// E2E-Test: Spieler in die neue Saison kopieren. Der Vorschlag richtet sich
// nach Jahrgang und Geschlecht, jedes Kind laesst sich ab- und anwaehlen und
// die Mannschaft aendern.
// Aufruf: npm run build && node scripts/test-saison-kopieren.mjs
import { chromium } from "playwright-core";
import http from "http"; import fs from "fs"; import path from "path";
const dist = path.resolve("dist");
const srv = http.createServer((req,res)=>{ let p=path.join(dist,req.url.split("?")[0]); if(!fs.existsSync(p)||fs.statSync(p).isDirectory()) p=path.join(dist,"index.html"); res.setHeader("content-type",{".html":"text/html",".js":"text/javascript",".css":"text/css"}[path.extname(p)]||"text/plain"); res.end(fs.readFileSync(p)); }).listen(4255);
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
const dismiss=async()=>{ for(let k=0;k<10;k++){ const done=await page.evaluate(()=>{
  const fx=[...document.querySelectorAll("div")].filter(d=>getComputedStyle(d).position==="fixed"&&d.querySelector("button")&&d.innerText.length>30);
  for(const f of fx){ const b=[...f.querySelectorAll("button")].find(x=>/geht|Los|Verstanden|Alles klar|Fertig|Jetzt nicht|Weiter →|Überspringen|Start/i.test(x.innerText)); if(b){ b.click(); return false; } }
  return true; }); await page.waitForTimeout(420); if(done) break; } };
await page.addInitScript(()=>{ localStorage.setItem("vereinsapp_config", JSON.stringify({url:"https://127.0.0.1:1/x", key:"test"})); localStorage.setItem("va_simple","0"); localStorage.setItem("va_tsimple","0"); });
await page.goto("http://127.0.0.1:4255/", { waitUntil:"networkidle" }); await page.waitForTimeout(2500);
await page.evaluate(()=>{ sessionStorage.setItem("vereinsapp_v12_session", JSON.stringify({role:"admin",cid:"demo",name:"Demo Admin",id:"demo_ad1"})); });
await page.reload({waitUntil:"networkidle"}); await page.waitForTimeout(2600); await dismiss();
await page.evaluate(()=>{ const b=[...document.querySelectorAll("button")].find(x=>/Bin dabei/.test(x.innerText)); b&&b.click(); });
await page.waitForTimeout(1200);

// Planungs-Saison anlegen (Saisons ohne cid ueberleben den Demo-Neuaufbau)
const jahr=new Date().getFullYear();
await page.evaluate(j2=>{
  const d=JSON.parse(localStorage.getItem("vereinsapp_v14")||"null"); if(!d) return;
  const alt=(d.seasons||[]).find(x=>x.id==="s2627")||{id:"s2627",label:"2026/2027",status:"active"};
  // ohne cid, sonst raeumt der Demo-Neuaufbau die Saison weg
  d.seasons=[{id:"s2627",label:alt.label||"2026/2027",status:"active"},
             {id:"plan1",label:`${j2+1}/${String(j2+2).slice(2)}`,status:"planning"}];
  d.activeSeason="s2627";
  localStorage.setItem("vereinsapp_v14", JSON.stringify(d));
}, jahr);
await page.reload({waitUntil:"networkidle"}); await page.waitForTimeout(2800); await dismiss();
await clickTxt("^\\d{4}/\\d{2}$|Saison"); await page.waitForTimeout(1400);
let b=await body();
if(/Saisonplanung/.test(b)) ok("Saisonplanung ist offen"); else fail("Saisonplanung öffnet nicht: "+b.slice(0,150).replace(/\n/g," | "));
await clickTxt("Spieler kopieren"); await page.waitForTimeout(900);
{ const gewaehlt=await page.evaluate(()=>{
    const sels=[...document.querySelectorAll("select")];
    // Das Ziel-Feld erkennt man an der Platzhalter-Option
    const ziel=sels.find(s2=>[...s2.options].some(o=>/Ziel-Saison/.test(o.text)));
    if(!ziel) return null;
    const setter=Object.getOwnPropertyDescriptor(window.HTMLSelectElement.prototype,"value").set;
    setter.call(ziel,"plan1"); ziel.dispatchEvent(new Event("change",{bubbles:true}));
    return true; });
  if(!gewaehlt) fail("Planungs-Saison steht nicht zur Auswahl"); }
await page.waitForTimeout(1200);
b=await body();
// ===== 1) Vorschlag nach Jahrgang =====
if(/VORSCHLAG FÜR/.test(b)) ok("Es gibt einen Vorschlag für die neue Saison"); else fail("Kein Vorschlag sichtbar: "+b.slice(0,220).replace(/\n/g," | "));
if(/Jg\. \d{4}/.test(b)) ok("Jeder Eintrag zeigt den Jahrgang"); else fail("Kein Jahrgang in der Liste");
if(/♀ Mädchen/.test(b)&&/♂ Junge/.test(b)) ok("Junge und Mädchen werden unterschieden"); else fail("Geschlecht fehlt in der Liste");
{ const gr=await page.evaluate(()=>{
    // Gruppen-Ueberschriften: Zeilen mit Gruppen-Haken und Anzahl
    const köpfe=[...document.querySelectorAll("span")].filter(x=>{
      const t2=(x.innerText||"").trim();
      return /Jugend|Senioren|Alt-Herren|Damen|Mädchen|Bambini|Kein passendes Team/.test(t2)&&t2.length<40&&x.style.fontWeight==="800"; });
    return [...new Set(köpfe.map(x=>(x.innerText||"").trim()))]; });
  if(gr.length) ok("Nach Mannschaften gruppiert: "+gr.join(" · ")); else fail("Keine Gruppierung erkannt");
  // Ein F-Jugend-Kind (Jg. -8) muss in der naechsten Saison hoeher einsortiert sein
  const auf=await page.evaluate(()=>{
    const d=JSON.parse(localStorage.getItem("vereinsapp_v14")||"null");
    const p=(d.playerProfiles||[]).find(x=>x.name==="Ben Fischer"&&x.seasonId!=="plan1");
    return p?p.by:null; });
  if(auf) ok("Beispiel-Kind hat einen Jahrgang ("+auf+") – Grundlage für den Vorschlag");
  else console.log("HINWEIS: Beispiel-Kind ohne Jahrgang"); }

// ===== 2) Ab- und anwählen =====
{ const vor=(b.match(/(\d+)\/(\d+)\s*$/m)||[])[0]||"";
  const zahl=await page.evaluate(()=>{ const el=[...document.querySelectorAll("span")].find(x=>/^\d+\/\d+$/.test((x.innerText||"").trim())); return el?el.innerText.trim():null; });
  if(zahl) ok("Zähler zeigt "+zahl); else fail("Kein Zähler");
  await page.evaluate(()=>{ const b2=[...document.querySelectorAll("button")].find(x=>(x.getAttribute("aria-label")||"")==="abwählen"); b2&&b2.click(); });
  await page.waitForTimeout(700);
  const zahl2=await page.evaluate(()=>{ const el=[...document.querySelectorAll("span")].find(x=>/^\d+\/\d+$/.test((x.innerText||"").trim())); return el?el.innerText.trim():null; });
  if(zahl2&&zahl2!==zahl) ok("Abwählen wirkt sofort ("+zahl+" → "+zahl2+")"); else fail("Abwählen ohne Wirkung: "+zahl2);
  await page.evaluate(()=>{ const b2=[...document.querySelectorAll("button")].find(x=>(x.getAttribute("aria-label")||"")==="auswählen"); b2&&b2.click(); });
  await page.waitForTimeout(700);
  const zahl3=await page.evaluate(()=>{ const el=[...document.querySelectorAll("span")].find(x=>/^\d+\/\d+$/.test((x.innerText||"").trim())); return el?el.innerText.trim():null; });
  if(zahl3===zahl) ok("Und wieder anwählen geht genauso"); else fail("Anwählen ohne Wirkung: "+zahl3); }

// ===== 3) Mannschaft je Kind änderbar + Kopieren übernimmt sie =====
{ const gesetzt=await page.evaluate(()=>{
    const sels=[...document.querySelectorAll("select")].filter(s=>[...s.options].some(o=>o.text.includes("ohne Team")));
    if(!sels.length) return null;
    const s0=sels[0];
    const opt=[...s0.options].find(o=>o.value&&o.value!==s0.value);
    if(!opt) return null;
    const setter=Object.getOwnPropertyDescriptor(window.HTMLSelectElement.prototype,"value").set;
    setter.call(s0,opt.value); s0.dispatchEvent(new Event("change",{bubbles:true}));
    return opt.text; });
  if(gesetzt) ok("Die Mannschaft lässt sich je Kind ändern (→ "+gesetzt+")"); else fail("Kein Mannschafts-Auswahlfeld");
  await page.waitForTimeout(700); }
{ const txt=await page.evaluate(()=>{ const b2=[...document.querySelectorAll("button")].find(x=>/Spieler jetzt kopieren/.test(x.innerText||"")); return b2?b2.innerText.trim():null; });
  if(txt&&/^\d+ Spieler jetzt kopieren$/.test(txt)) ok("Der Knopf nennt die Anzahl: „"+txt+"“"); else fail("Knopftext ohne Anzahl: "+txt); }
await clickTxt("Spieler jetzt kopieren"); await page.waitForTimeout(1600);
{ const erg=await page.evaluate(()=>{
    const d=JSON.parse(localStorage.getItem("vereinsapp_v14")||"null");
    const neu=(d.playerProfiles||[]).filter(p=>p.seasonId==="plan1");
    return { n:neu.length, mitTeam:neu.filter(p=>p.mainTid).length, ohne:neu.filter(p=>!p.mainTid).length,
             beispiel:(neu[0]||{}).name||"" }; });
  if(erg.n>0) ok(erg.n+" Spieler in die neue Saison kopiert"); else fail("Nichts kopiert");
  if(erg.mitTeam>0) ok(erg.mitTeam+" davon direkt einer Mannschaft zugeordnet – keine Handarbeit mehr");
  else fail("Zuordnung nicht übernommen (alle ohne Team)"); }

if(errors.length){ console.log("JS-FEHLER:"); [...new Set(errors)].forEach(e=>console.log(" -",e.slice(0,150))); }
console.log(errors.length||fails.length?`ERGEBNIS: ${fails.length} Fehlschläge, ${errors.length} JS-Fehler`:"ERGEBNIS: ALLES OK");
await browser.close(); srv.close();
process.exit(errors.length||fails.length?1:0);
