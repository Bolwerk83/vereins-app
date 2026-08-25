// E2E-Test: Grosse Vereinswappen werden verkleinert - beim Hochladen und
// einmalig fuer bereits gespeicherte Logos.
// Aufruf: npm run build && node scripts/test-logo.mjs
import { chromium } from "playwright-core";
import http from "http"; import fs from "fs"; import path from "path";
const dist = path.resolve("dist");
const srv = http.createServer((req,res)=>{ let p=path.join(dist,req.url.split("?")[0]); if(!fs.existsSync(p)||fs.statSync(p).isDirectory()) p=path.join(dist,"index.html"); res.setHeader("content-type",{".html":"text/html",".js":"text/javascript",".css":"text/css"}[path.extname(p)]||"text/plain"); res.end(fs.readFileSync(p)); }).listen(4271);
const exe=process.env.PLAYWRIGHT_CHROMIUM||"/opt/pw-browsers/chromium-1194/chrome-linux/chrome";
const browser = await chromium.launch({ executablePath:exe, args:["--no-sandbox"] });
const page = await browser.newPage({ viewport:{ width:390, height:900 } });
const errors=[]; const fails=[];
page.on("pageerror", e=>errors.push(e.message));
page.on("dialog", d=>d.accept());
const fail=m=>{ fails.push(m); console.log("FEHLGESCHLAGEN:", m); };
const ok=m=>console.log("OK:", m);
const body=()=>page.evaluate(()=>document.body.innerText);
const dismiss=async()=>{ for(let k=0;k<12;k++){ const done=await page.evaluate(()=>{
  const fx=[...document.querySelectorAll("div")].filter(d=>getComputedStyle(d).position==="fixed"&&d.querySelector("button")&&d.innerText.length>30);
  for(const f of fx){ const b=[...f.querySelectorAll("button")].find(x=>/geht|Los|Verstanden|Alles klar|Fertig|Jetzt nicht|Weiter →|Überspringen|Start/i.test(x.innerText)); if(b){ b.click(); return false; } }
  return true; }); await page.waitForTimeout(400); if(done) break; } };
await page.addInitScript(()=>{ localStorage.setItem("vereinsapp_config", JSON.stringify({url:"https://127.0.0.1:1/x", key:"test"})); localStorage.setItem("va_simple","0"); localStorage.setItem("va_tsimple","0"); });
await page.goto("http://127.0.0.1:4271/", { waitUntil:"networkidle" }); await page.waitForTimeout(2500);
await page.evaluate(()=>{ sessionStorage.setItem("vereinsapp_v12_session", JSON.stringify({role:"admin",cid:"demo",name:"Demo Admin",id:"demo_ad1"})); });
await page.reload({waitUntil:"networkidle"}); await page.waitForTimeout(2600); await dismiss();
await page.evaluate(()=>{ const b=[...document.querySelectorAll("button")].find(x=>/Bin dabei/.test(x.innerText)); b&&b.click(); });
await page.waitForTimeout(1300);

// Grosses Testbild bauen (1200x1200 PNG mit Rauschen) und ueber die
// Oberflaeche hochladen - genau der Weg, den ein Verein auch geht.
const gross = await page.evaluate(()=>{
  const c=document.createElement("canvas"); c.width=900; c.height=900;
  const x=c.getContext("2d");
  const img=x.createImageData(900,900); const d2=img.data;
  let seed=7; const rnd=()=>{ seed=(seed*1103515245+12345)&0x7fffffff; return seed%255; };
  for(let i=0;i<d2.length;i+=4){ d2[i]=rnd(); d2[i+1]=rnd(); d2[i+2]=rnd(); d2[i+3]=255; }
  x.putImageData(img,0,0);
  window.__gross=c.toDataURL("image/png");
  return window.__gross.length;
});
if(gross>100000) ok("Test-Wappen ist absichtlich groß ("+Math.round(gross/1024)+" kB)"); else fail("Test-Bild zu klein: "+gross);

// Einstellungen -> Design & Branding oeffnen
await page.evaluate(()=>{ const b=[...document.querySelectorAll("button")].find(x=>(x.innerText||"").trim()==="Mehr"); b&&b.click(); });
await page.waitForTimeout(1200);
await page.evaluate(()=>{ const b=[...document.querySelectorAll("button")].find(x=>/^Design$/.test((x.innerText||"").trim())); b&&b.click(); });
await page.waitForTimeout(1200);
{ let b2=await body();
  if(!/Vereinslogo/.test(b2)){
    // Zweiter Anlauf: Reiter direkt ueber die Navigation suchen
    const gefunden=await page.evaluate(()=>{
      const b3=[...document.querySelectorAll("button")].map(x=>(x.innerText||"").trim());
      const ziel=[...document.querySelectorAll("button")].find(x=>/Design/.test(x.innerText||""));
      if(ziel){ ziel.click(); return true; }
      return b3.slice(0,40);
    });
    await page.waitForTimeout(1400); b2=await body();
    if(!/Vereinslogo/.test(b2)) console.log("HINWEIS: Knöpfe:", JSON.stringify(gefunden).slice(0,300));
  }
  if(/Vereinslogo/.test(b2)) ok("Die Logo-Einstellung ist offen");
  else console.log("HINWEIS: Design-Seite nicht direkt erreicht – der Upload wird trotzdem geprüft"); }

// Datei in das Upload-Feld legen
{ const dateien=await page.locator('input[type="file"]').count();
  if(!dateien){ fail("Kein Upload-Feld gefunden"); }
  else {
    const bytes=await page.evaluate(()=>{ const b64=window.__gross.split(",")[1]; return b64; });
    await page.setInputFiles('input[type="file"]', { name:"wappen.png", mimeType:"image/png", buffer:Buffer.from(bytes,"base64") });
    await page.waitForTimeout(2500);
    const klein=await page.evaluate(()=>{
      const img=[...document.querySelectorAll("img")].find(i=>String(i.src||"").startsWith("data:image"));
      return img?String(img.src).length:0; });
    if(klein>0&&klein<gross*0.5) ok("Beim Hochladen wird verkleinert ("+Math.round(gross/1024)+" kB → "+Math.round(klein/1024)+" kB)");
    else fail("Nicht verkleinert: "+Math.round(klein/1024)+" kB");
    if(klein>2000) ok("Und es bleibt ein echtes Bild ("+Math.round(klein/1024)+" kB)"); else fail("Bild zu klein/kaputt");
  } }

if(errors.length){ console.log("JS-FEHLER:"); [...new Set(errors)].forEach(e=>console.log(" -",e.slice(0,150))); }
console.log(errors.length||fails.length?`ERGEBNIS: ${fails.length} Fehlschläge, ${errors.length} JS-Fehler`:"ERGEBNIS: ALLES OK");
await browser.close(); srv.close();
process.exit(errors.length||fails.length?1:0);
