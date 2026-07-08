// Intensiv-Sweep: bedient die gebaute App als Demo-Trainer im headless
// Chromium und sammelt JEDEN Laufzeitfehler mit Fundort-Beschriftung.
// Aufruf: node scripts/sweep.mjs
import { chromium } from "playwright-core";
import http from "http"; import fs from "fs"; import path from "path";

const dist = path.resolve("dist");
const mime = {".html":"text/html",".js":"text/javascript",".css":"text/css",".json":"application/json"};
const srv = http.createServer((req,res)=>{
  let p = path.join(dist, req.url.split("?")[0]);
  if(!fs.existsSync(p)||fs.statSync(p).isDirectory()) p = path.join(dist,"index.html");
  res.setHeader("content-type", mime[path.extname(p)]||"application/octet-stream");
  res.end(fs.readFileSync(p));
}).listen(4175);

const browser = await chromium.launch({ executablePath:"/opt/pw-browsers/chromium-1194/chrome-linux/chrome", args:["--no-sandbox"] });
const page = await browser.newPage({ viewport:{ width:390, height:844 } });

let where = "Start";
const errors = [];
page.on("pageerror", e=>errors.push(`[${where}] ${e.message}`));
page.on("console", m=>{ if(m.type()==="error" && !/net::|Failed to load resource|fetch|CORS/i.test(m.text())) errors.push(`[${where}] CONSOLE: ${m.text().slice(0,200)}`); });

// Demo-Trainer-Session direkt setzen (App baut Demo-Daten offline selbst auf)
await page.addInitScript(()=>{
  sessionStorage.setItem("vereinsapp_v12_session", JSON.stringify({ role:"trainer", cid:"demo", tids:["demo_f1"], name:"Demo Trainer", id:"demo_tr1" }));
  // Ferien-Cache: deckt Ferien-Chips + Ferien-Check ohne Netz ab (1 Jahr Spanne)
  const y=new Date().getFullYear();
  localStorage.setItem("va_ferien_DE-NW", JSON.stringify({ts:Date.now(),data:[
    {start:`${y}-01-01`,end:`${y+1}-12-31`,name:"Test-Ferien"},
  ]}));
});
await page.goto("http://127.0.0.1:4175/", { waitUntil:"networkidle", timeout:30000 }).catch(e=>errors.push("[goto] "+e.message));
await page.waitForTimeout(2500);

const shot = async (label)=>{ where=label; };
const tap = async (label, locator, {optional=false, wait=900}={}) => {
  where = label;
  try {
    const el = typeof locator==="string" ? page.getByText(locator,{exact:false}).first() : locator;
    await el.waitFor({ state:"visible", timeout: 4000 });
    await el.click({ timeout: 5000 });
    await page.waitForTimeout(wait);
    return true;
  } catch(e){ if(!optional) errors.push(`[${label}] NICHT KLICKBAR: ${String(e.message).split("\n")[0].slice(0,140)}`); return false; }
};
const closeSheets = async ()=>{ for(let i=0;i<4;i++){
  const x=page.locator('button:has-text("✕")').last();
  if(await x.isVisible().catch(()=>false)) { await x.click({timeout:2000}).catch(()=>{}); }
  else { await page.mouse.click(10,200).catch(()=>{}); } // Backdrop-Tipp schliesst Drawer
  await page.keyboard.press("Escape").catch(()=>{});
  await page.waitForTimeout(300);
} };

const body = async ()=> (await page.evaluate(()=>document.body.innerText.slice(0,400))).replace(/\n/g," | ");
console.log("BOOT:", (await body()).slice(0,180));

// ---- Termine-Tab ----
await shot("Termine");
await tap("Termine-Tab","Termine",{optional:true});
await tap("Spielplan-Import öffnen","Spielplan von fussball.de",{optional:false});
await tap("Import Schritt2","Weiter: Spielplan einfügen",{optional:true});
await closeSheets();
await tap("Termin-Wizard öffnen","Neuen Termin anlegen");
await closeSheets();
// ersten Termin öffnen (Ansehen)
await tap("Termin ansehen",'text=Ansehen',{optional:true});
for(const t of ["Rückmeldungen","Training","Aufstellung","Orga","Spieltag"]) await tap("Termin-Tab "+t,t,{optional:true,wait:700});
await closeSheets();

// ---- Team-Bereich ----
for(const t of ["Team","Spieler","Anwesenheit","Insights","Analyse","Ziele","Übungen","Planer","Trainings","Taktik","Bericht","Kasse"]){
  await tap("Team/"+t, t, {optional:true, wait:800});
}
// Übung öffnen (Bibliothek/erste Karte)
await tap("Übung öffnen","Hampelmann",{optional:true});
await closeSheets();

// ---- Trainingsplaner: generieren + ansehen (gemeldeter Crash) ----
await tap("Planer öffnen","Planer",{optional:true});
await tap("Plan generieren","Trainingsplan erstellen",{optional:true,wait:1200});
await tap("Plan neu generieren","Neu generieren",{optional:true,wait:1200});
// ersten Block/Übung im Plan antippen
where="Plan-Block ansehen";
try {
  const blocks = page.locator('div[style*="cursor"]').filter({ hasText: /Min/ });
  if(await blocks.count()>0){ await blocks.first().click(); await page.waitForTimeout(900); }
} catch{}
await closeSheets();

// ---- Taktikboard ----
await tap("Taktik öffnen","Taktik",{optional:true,wait:1000});
await closeSheets();

// ---- Suche ----
await tap("Suche öffnen","🔍",{optional:true});
where="Suche tippen";
try { await page.keyboard.type("Hampelmann",{delay:20}); await page.waitForTimeout(900);
  await tap("Such-Treffer Übung","Hampelmann",{optional:true}); } catch{}
await closeSheets();

// ---- Chat / Platz / Mehr ----
for(const t of ["Chat","Platz","Mehr"]) await tap("Tab "+t, t, {optional:true, wait:800});
await closeSheets();

console.log("\n================ ERGEBNIS ================");
if(errors.length){ console.log("FEHLER ("+errors.length+"):"); [...new Set(errors)].forEach(e=>console.log(" -",e)); }
else console.log("KEINE Laufzeitfehler im gesamten Durchlauf. ✓");
await browser.close(); srv.close();
process.exit(errors.length?1:0);
