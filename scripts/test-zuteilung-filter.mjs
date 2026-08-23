// E2E-Test: In der Zuteilung sind die Zahlen-Kacheln der Filter.
// Aufruf: npm run build && node scripts/test-zuteilung-filter.mjs
import { chromium } from "playwright-core";
import http from "http"; import fs from "fs"; import path from "path";
const dist = path.resolve("dist");
const srv = http.createServer((req,res)=>{ let p=path.join(dist,req.url.split("?")[0]); if(!fs.existsSync(p)||fs.statSync(p).isDirectory()) p=path.join(dist,"index.html"); res.setHeader("content-type",{".html":"text/html",".js":"text/javascript",".css":"text/css"}[path.extname(p)]||"text/plain"); res.end(fs.readFileSync(p)); }).listen(4257);
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
await page.goto("http://127.0.0.1:4257/", { waitUntil:"networkidle" }); await page.waitForTimeout(2500);
await page.evaluate(()=>{ sessionStorage.setItem("vereinsapp_v12_session", JSON.stringify({role:"admin",cid:"demo",name:"Demo Admin",id:"demo_ad1"})); });
await page.reload({waitUntil:"networkidle"}); await page.waitForTimeout(2600); await dismiss();
await page.evaluate(()=>{ const b=[...document.querySelectorAll("button")].find(x=>/Bin dabei/.test(x.innerText)); b&&b.click(); });
await page.waitForTimeout(1200);

// Kader -> Zuteilung
await page.evaluate(()=>{ const b=[...document.querySelectorAll("button")].find(x=>(x.innerText||"").trim()==="Team"); b&&b.click(); });
await page.waitForTimeout(1400); await dismiss();
await clickTxt("^Spieler$"); await page.waitForTimeout(1200);
await clickTxt("Zuteilung"); await page.waitForTimeout(1200);
let b=await body();
if(/Zuteilung für|Welche Mannschaften/.test(b)) ok("Zuteilung ist offen"); else fail("Zuteilung nicht offen: "+b.slice(0,180).replace(/\n/g," | "));

// Kacheln finden
const kacheln = () => page.evaluate(()=>[...document.querySelectorAll("button")]
  .filter(x=>/^\d+\n/.test((x.innerText||"").trim())||/^\d+$/.test(((x.innerText||"").trim().split("\n")[0])||""))
  .map(x=>({txt:(x.innerText||"").replace(/\n/g," ").trim(), an:x.getAttribute("aria-pressed")==="true"})));
{ const k=await kacheln();
  if(k.length>=2) ok("Die Zahlen-Kacheln sind Knöpfe ("+k.map(x=>x.txt).join(" · ")+")");
  else fail("Kacheln sind keine Knöpfe: "+JSON.stringify(k)); }

// ===== 1) "Offen" antippen filtert =====
{ const vorher=await page.evaluate(()=>document.body.innerText.length);
  const geklickt=await page.evaluate(()=>{ const b2=[...document.querySelectorAll("button")].find(x=>/Offen$/.test((x.innerText||"").replace(/\n/g," ").trim()));
    if(!b2) return false; b2.click(); return true; });
  if(!geklickt) fail("Keine Offen-Kachel gefunden");
  await page.waitForTimeout(900);
  const k2=await kacheln();
  const aktiv=k2.find(x=>x.an);
  if(aktiv&&/Offen/.test(aktiv.txt)) ok("„Offen“ ist nach dem Antippen aktiv markiert");
  else fail("Offen-Kachel nicht markiert: "+JSON.stringify(k2));
  const chip=await page.evaluate(()=>{ const c=[...document.querySelectorAll("button")].find(x=>/Offen \(\d+\)/.test(x.innerText||""));
    return c?getComputedStyle(c).borderColor:null; });
  if(chip) ok("Der Filterstreifen zeigt dieselbe Auswahl");
  const nachher=await page.evaluate(()=>document.body.innerText.length);
  if(nachher!==vorher) ok("Die Liste darunter ändert sich"); else fail("Liste bleibt unverändert"); }

// ===== 2) Nochmal antippen hebt den Filter auf =====
{ await page.evaluate(()=>{ const b2=[...document.querySelectorAll("button")].find(x=>/Offen$/.test((x.innerText||"").replace(/\n/g," ").trim()));
    b2&&b2.click(); });
  await page.waitForTimeout(900);
  const k3=await kacheln();
  if(!k3.some(x=>x.an)) ok("Nochmal antippen zeigt wieder alle");
  else fail("Filter bleibt hängen: "+JSON.stringify(k3)); }

// ===== 3) Eine Mannschafts-Kachel filtert genauso =====
{ const name=await page.evaluate(()=>{
    const b2=[...document.querySelectorAll("button")].filter(x=>{ const t2=(x.innerText||"").trim().split("\n"); return t2.length===2&&/^\d+$/.test(t2[0])&&!/Offen/.test(t2[1]); })[0];
    if(!b2) return null; b2.click(); return (b2.innerText||"").trim().split("\n")[1]; });
  if(!name) fail("Keine Mannschafts-Kachel gefunden");
  else { await page.waitForTimeout(900);
    const k4=await kacheln();
    const aktiv=k4.find(x=>x.an);
    if(aktiv&&aktiv.txt.includes(name)) ok("Auch die Mannschaft lässt sich per Kachel filtern ("+name+")");
    else fail("Mannschafts-Kachel filtert nicht: "+JSON.stringify(k4)); } }

if(errors.length){ console.log("JS-FEHLER:"); [...new Set(errors)].forEach(e=>console.log(" -",e.slice(0,150))); }
console.log(errors.length||fails.length?`ERGEBNIS: ${fails.length} Fehlschläge, ${errors.length} JS-Fehler`:"ERGEBNIS: ALLES OK");
await browser.close(); srv.close();
process.exit(errors.length||fails.length?1:0);
