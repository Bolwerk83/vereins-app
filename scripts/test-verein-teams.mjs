// E2E-Test: Vereinsansicht "Mannschaften verwalten". Uebersichtlich statt
// Einstellungs-Wand, und die Aufteilung (Großfeld/Kleinfeld) ist freiwillig -
// aber wenn sie genutzt wird, bleibt mindestens eine Mannschaft stehen.
// Aufruf: npm run build && node scripts/test-verein-teams.mjs
import { chromium } from "playwright-core";
import http from "http"; import fs from "fs"; import path from "path";
const dist = path.resolve("dist");
const srv = http.createServer((req,res)=>{ let p=path.join(dist,req.url.split("?")[0]); if(!fs.existsSync(p)||fs.statSync(p).isDirectory()) p=path.join(dist,"index.html"); res.setHeader("content-type",{".html":"text/html",".js":"text/javascript",".css":"text/css"}[path.extname(p)]||"text/plain"); res.end(fs.readFileSync(p)); }).listen(4251);
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
await page.goto("http://127.0.0.1:4251/", { waitUntil:"networkidle" }); await page.waitForTimeout(2500);
await page.evaluate(()=>{ sessionStorage.setItem("vereinsapp_v12_session", JSON.stringify({role:"admin",cid:"demo",name:"Demo Admin",id:"demo_ad1"})); });
await page.reload({waitUntil:"networkidle"}); await page.waitForTimeout(2600); await dismiss();
await page.evaluate(()=>{ const b=[...document.querySelectorAll("button")].find(x=>(x.innerText||"").trim()==="Team"); b&&b.click(); });
await page.waitForTimeout(1400);
await clickTxt("Mannschaften verwalten|Mannschaften"); await page.waitForTimeout(1200); await dismiss();

let b=await body();
if(/MANNSCHAFTEN \(\d+\)/.test(b)) ok("Mannschafts-Liste ist da: "+(b.match(/MANNSCHAFTEN \(\d+\)/)||[""])[0]);
else fail("Keine Mannschaftsliste: "+b.slice(0,200).replace(/\n/g," | "));

// ===== 1) Aufgeräumt: Einstellungen erst nach dem Aufklappen =====
if(!/SPIELSTÄRKE|KADERGRÖSSE/.test(b)) ok("Die Einstellungen stehen nicht mehr alle offen unter jeder Mannschaft");
else fail("Einstellungs-Wand ist noch da");
if(!/Neue Mannschaft anlegen[\s\S]{0,40}ALTERSKLASSE/.test(b)) ok("Auch das Anlege-Formular ist eingeklappt");
{ const n=await page.evaluate(()=>document.querySelectorAll("button").length);
  if(n<=40) ok("Wenige Knöpfe auf der Seite ("+n+")"); else fail("Zu viele Knöpfe: "+n); }
// Name der Mannschaft ist nicht mehr gequetscht
{ const breit=await page.evaluate(()=>{
    const d=[...document.querySelectorAll("div")].find(x=>/^F-Jugend 1$/.test((x.innerText||"").trim()));
    return d?Math.round(d.getBoundingClientRect().width):0; });
  if(breit>=150) ok("Der Mannschaftsname hat Platz ("+breit+" px)"); else fail("Name weiterhin gequetscht: "+breit+" px"); }

// ===== 2) Aufklappen =====
await page.evaluate(()=>{ const d=[...document.querySelectorAll("div")].find(x=>/^F-Jugend 1$/.test((x.innerText||"").trim()));
  const kopf=d&&d.parentElement&&d.parentElement.parentElement; (kopf||d).click(); });
await page.waitForTimeout(900);
b=await body();
for(const [was,re] of [["Name",/NAME/],["Anmeldung",/WER MELDET AN\?/],["Stärke",/SPIELSTÄRKE/],["Kadergröße",/KADERGRÖSSE/],["Aufteilung",/MANNSCHAFTEN AM SPIELTAG/],["Bewertung",/SPIELER-BEWERTUNG/],["Passwortrecht",/TEAM-PASSWORT ÄNDERN/],["fussball.de",/FUSSBALL\.DE/],["Löschen",/Mannschaft löschen/]]){
  if(re.test(b)) ok("Aufgeklappt vorhanden: "+was); else fail("Fehlt nach dem Aufklappen: "+was);
}

// ===== 3) Aufteilung ist freiwillig – und mindestens eine bleibt =====
if(/nicht eingerichtet/.test(b)&&/\+ Aufteilung einrichten/.test(b)) ok("Ohne Aufteilung: nichts wird erzwungen");
else fail("Aufteilung wirkt weiterhin verpflichtend");
await clickTxt("\\+ Aufteilung einrichten"); await page.waitForTimeout(900);
b=await body();
if(/\+ Mannschaft hinzufügen/.test(b)) ok("Eine erste Mannschaft ist eingerichtet"); else fail("Einrichten hat nicht gegriffen");
{ const zeilen=await page.evaluate(()=>[...document.querySelectorAll('input[placeholder^="z. B."]')].length);
  if(zeilen===1) ok("Genau eine Zeile – kein erzwungenes Großfeld/Kleinfeld"); else fail("Unerwartete Zeilenzahl: "+zeilen); }
// Das ✕ der letzten Zeile ist gesperrt
{ const gesperrt=await page.evaluate(()=>{
    const b2=[...document.querySelectorAll("button")].filter(x=>(x.getAttribute("aria-label")||"")==="Mannschaft entfernen");
    return b2.length===1 && b2[0].disabled; });
  if(gesperrt) ok("Die letzte Mannschaft lässt sich nicht entfernen"); else fail("Letzte Mannschaft wäre löschbar"); }
// Zweite hinzufügen, benennen, wieder entfernen
await clickTxt("\\+ Mannschaft hinzufügen"); await page.waitForTimeout(800);
{ const felder=page.locator('input[placeholder^="z. B."]');
  const n=await felder.count();
  if(n===2) ok("Eine zweite Mannschaft lässt sich hinzufügen"); else fail("Hinzufügen ging nicht: "+n);
  await felder.nth(0).fill("Großfeld"); await felder.nth(1).fill("Kleinfeld");
  await page.evaluate(()=>document.activeElement&&document.activeElement.blur()); await page.waitForTimeout(900);
  const frei=await page.evaluate(()=>{
    const d=JSON.parse(localStorage.getItem("vereinsapp_v14")||"null");
    const tm=(d.teams||[]).find(x=>x.name==="F-Jugend 1");
    return (tm&&tm.squads||[]).map(s=>s.label); });
  if(frei.includes("Kleinfeld")) ok("Frei benennbar – gespeichert: "+frei.join(", ")); else fail("Namen nicht gespeichert: "+JSON.stringify(frei)); }
{ const wieder=await page.evaluate(()=>{
    const b2=[...document.querySelectorAll("button")].filter(x=>(x.getAttribute("aria-label")||"")==="Mannschaft entfernen");
    if(b2.length!==2) return "nur "+b2.length;
    if(b2[0].disabled||b2[1].disabled) return "gesperrt obwohl zwei";
    b2[1].click(); return "ok"; });
  if(wieder==="ok") ok("Bei zwei Mannschaften ist Entfernen erlaubt"); else fail("Entfernen-Knopf falsch: "+wieder);
  await page.waitForTimeout(900);
  const rest=await page.evaluate(()=>[...document.querySelectorAll('input[placeholder^="z. B."]')].length);
  if(rest===1) ok("Nach dem Entfernen bleibt genau eine übrig"); else fail("Unerwartet: "+rest+" Zeilen"); }
// Ganz ausschalten
await clickTxt("Aufteilung aus"); await page.waitForTimeout(1000);
b=await body();
if(/\+ Aufteilung einrichten/.test(b)) ok("Die Aufteilung lässt sich auch ganz ausschalten"); else fail("Ausschalten ging nicht");

// ===== 3b) Beim Tippen darf der Fokus nicht wegspringen =====
await clickTxt("\\+ Aufteilung einrichten"); await page.waitForTimeout(800);
{ const feld=page.locator('input[placeholder^="z. B."]').first();
  await feld.click();
  await page.keyboard.type("Groß", {delay:60});
  const halt=await page.evaluate(()=>{
    const a=document.activeElement;
    return { istFeld:!!(a&&a.tagName==="INPUT"&&/^z\. B\./.test(a.placeholder||"")), wert:a?a.value:"" }; });
  if(halt.istFeld&&halt.wert==="Groß") ok("Beim Tippen bleibt der Cursor im Feld („"+halt.wert+"“)");
  else fail("Fokus springt beim Tippen raus: "+JSON.stringify(halt));
  await clickTxt("Aufteilung aus"); await page.waitForTimeout(900); }

// ===== 4) Umbenennen =====
{ const feld=page.locator('div:has-text("NAME")').locator('input').first();
  await page.evaluate(()=>{ const i=[...document.querySelectorAll("input")].find(x=>x.value==="F-Jugend 1"); if(i){ i.focus(); } });
  const inp=page.locator('input').filter({hasNot:page.locator('[type="number"]')}).first();
  await page.evaluate(()=>{ const i=[...document.querySelectorAll("input")].find(x=>x.value==="F-Jugend 1");
    if(i){ const setter=Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype,"value").set; setter.call(i,"F-Jugend I"); i.dispatchEvent(new Event("input",{bubbles:true})); } });
  await page.waitForTimeout(600);
  const kann=await clickTxt("^Speichern$");
  if(kann){ await page.waitForTimeout(900);
    const neu=await page.evaluate(()=>{ const d=JSON.parse(localStorage.getItem("vereinsapp_v14")||"null"); return (d.teams||[]).some(x=>x.name==="F-Jugend I"); });
    if(neu) ok("Umbenennen funktioniert direkt im Namensfeld"); else fail("Umbenennen nicht gespeichert");
  } else fail("Kein Speichern-Knopf beim Umbenennen"); }

if(errors.length){ console.log("JS-FEHLER:"); [...new Set(errors)].forEach(e=>console.log(" -",e.slice(0,150))); }
console.log(errors.length||fails.length?`ERGEBNIS: ${fails.length} Fehlschläge, ${errors.length} JS-Fehler`:"ERGEBNIS: ALLES OK");
await browser.close(); srv.close();
process.exit(errors.length||fails.length?1:0);
