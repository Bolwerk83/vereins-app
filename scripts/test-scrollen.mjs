// E2E-Test: Wischen im Termin. Egal WO der Finger aufsetzt - auf dem
// Reiter-Streifen, auf einer Namenszeile, auf einem Chip - der Termin muss
// weiterscrollen und darf nicht haengenbleiben.
// Aufruf: npm run build && node scripts/test-scrollen.mjs
import { chromium } from "playwright-core";
import http from "http"; import fs from "fs"; import path from "path";
const dist = path.resolve("dist");
const srv = http.createServer((req,res)=>{ let p=path.join(dist,req.url.split("?")[0]); if(!fs.existsSync(p)||fs.statSync(p).isDirectory()) p=path.join(dist,"index.html"); res.setHeader("content-type",{".html":"text/html",".js":"text/javascript",".css":"text/css"}[path.extname(p)]||"text/plain"); res.end(fs.readFileSync(p)); }).listen(4247);
const exe=process.env.PLAYWRIGHT_CHROMIUM||"/opt/pw-browsers/chromium-1194/chrome-linux/chrome";
const browser = await chromium.launch({ executablePath:exe, args:["--no-sandbox"] });
const ctx = await browser.newContext({ viewport:{width:340,height:620}, hasTouch:true, isMobile:true });
const page = await ctx.newPage();
const errors=[]; const fails=[];
page.on("pageerror", e=>errors.push(e.message));
page.on("dialog", d=>d.accept());
const fail=m=>{ fails.push(m); console.log("FEHLGESCHLAGEN:", m); };
const ok=m=>console.log("OK:", m);
const cdp = await ctx.newCDPSession(page);
// Echtes Wischen: Finger aufsetzen, in Schritten hochziehen, loslassen
const wisch = async (x,y,dy=-220)=>{
  await cdp.send("Input.dispatchTouchEvent",{type:"touchStart",touchPoints:[{x,y}]});
  for(let i=1;i<=8;i++){ await cdp.send("Input.dispatchTouchEvent",{type:"touchMove",touchPoints:[{x,y:y+dy*i/8}]}); await page.waitForTimeout(16); }
  await cdp.send("Input.dispatchTouchEvent",{type:"touchEnd",touchPoints:[]});
  await page.waitForTimeout(500);
};
const dismiss=async()=>{ for(let k=0;k<10;k++){ const done=await page.evaluate(()=>{
  const fx=[...document.querySelectorAll("div")].filter(d=>getComputedStyle(d).position==="fixed"&&d.querySelector("button")&&d.innerText.length>30);
  for(const f of fx){ const b=[...f.querySelectorAll("button")].find(x=>/geht|Los|Verstanden|Alles klar|Fertig|Jetzt nicht|Weiter →|Überspringen|Start/i.test(x.innerText)); if(b){ b.click(); return false; } }
  return true; }); await page.waitForTimeout(420); if(done) break; } };
await page.addInitScript(()=>{ localStorage.setItem("vereinsapp_config", JSON.stringify({url:"https://127.0.0.1:1/x", key:"test"})); });
await page.goto("http://127.0.0.1:4247/", { waitUntil:"networkidle" }); await page.waitForTimeout(2500);
await page.evaluate(()=>{ localStorage.setItem("va_simple","0"); localStorage.setItem("va_tsimple","0"); sessionStorage.setItem("vereinsapp_v12_session", JSON.stringify({role:"trainer",cid:"demo",tids:["demo_f1"],name:"Demo Trainer",id:"demo_tr1"})); });
await page.reload({waitUntil:"networkidle"}); await page.waitForTimeout(2500); await dismiss();
await page.evaluate(()=>{ const b=[...document.querySelectorAll("button")].find(x=>/Bin dabei/.test(x.innerText)); b&&b.click(); });
await page.waitForTimeout(1200);
// Termin öffnen
// Bewusst ein Spiel oeffnen - dort gibt es mehr Reiter, der Streifen laeuft ueber
{ const auf=await page.evaluate(()=>{
    const karten=[...document.querySelectorAll("div")].filter(d=>/Heimspiel|Auswärts|Spiel/.test(d.innerText||"")&&[...d.querySelectorAll("button")].some(b=>/^(✅ Anwesenheit|Ansehen)$/.test((b.innerText||"").trim()))&&d.innerText.length<900);
    const k=karten[karten.length-1]; if(!k) return false;
    const b=[...k.querySelectorAll("button")].find(x=>/^(✅ Anwesenheit|Ansehen)$/.test((x.innerText||"").trim())); if(!b) return false; b.click(); return true; });
  if(!auf) await page.evaluate(()=>{ const b=[...document.querySelectorAll("button")].find(x=>/^(✅ Anwesenheit|Ansehen)$/.test((x.innerText||"").trim())); b&&b.click(); }); }
await page.waitForTimeout(1300);
{ const streifen=await page.evaluate(()=>{
    const d=[...document.querySelectorAll("div")].find(x=>{ const st=getComputedStyle(x);
      return (st.overflowX==="auto"||st.overflowX==="scroll")&&x.scrollWidth>x.clientWidth+4&&/Rückmeldungen/.test(x.innerText||""); });
    return d?{breit:d.scrollWidth-d.clientWidth,ta:getComputedStyle(d).touchAction}:null; });
  if(streifen) ok("Reiter-Streifen läuft über ("+streifen.breit+" px, touch-action: "+streifen.ta+")");
  else fail("Kein überlaufender Reiter-Streifen im Test – Fall wird nicht geprüft"); }

// Der scrollende Bereich des Termins
const scroller = () => page.evaluate(()=>{
  const el=[...document.querySelectorAll("div")].filter(d=>{ const st=getComputedStyle(d);
    return (st.overflowY==="auto"||st.overflowY==="scroll")&&d.scrollHeight>d.clientHeight+20; })
    .sort((a,b)=>b.clientHeight-a.clientHeight)[0];
  if(!el) return null;
  const r=el.getBoundingClientRect();
  return {top:Math.round(el.scrollTop),max:Math.round(el.scrollHeight-el.clientHeight),
          x:Math.round(r.left+r.width/2),y:Math.round(r.top),h:Math.round(r.height)};
});
let s0=await scroller();
if(s0&&s0.max>60) ok("Der Termin ist länger als der Bildschirm ("+s0.max+" px zum Scrollen)");
else fail("Kein scrollbarer Termin gefunden");

if(s0){
  // Drei typische Fingerpositionen: oben (Reiter-Streifen), Mitte, unten
  const stellen=[["auf dem Reiter-Streifen", s0.y+22],["mitten im Inhalt", s0.y+Math.round(s0.h*0.5)],["weit unten", s0.y+Math.round(s0.h*0.85)]];
  for(const [wo,y] of stellen){
    await page.evaluate(()=>{ const el=[...document.querySelectorAll("div")].filter(d=>{ const st=getComputedStyle(d);
      return (st.overflowY==="auto"||st.overflowY==="scroll")&&d.scrollHeight>d.clientHeight+20; })
      .sort((a,b)=>b.clientHeight-a.clientHeight)[0]; if(el) el.scrollTop=0; });
    await page.waitForTimeout(300);
    await wisch(s0.x, y);
    const s1=await scroller();
    if(s1&&s1.top>40) ok("Wischen "+wo+" scrollt den Termin ("+s1.top+" px)");
    else fail("Wischen "+wo+" bleibt hängen (nur "+(s1?s1.top:"?")+" px)");
  }
  // Auch am linken und rechten Rand (dort liegen Häkchen bzw. Knöpfe)
  const breite=page.viewportSize().width;
  for(const [wo,x] of [["am linken Rand", 26],["am rechten Rand", breite-26]]){
    await page.evaluate(()=>{ const el=[...document.querySelectorAll("div")].filter(d=>{ const st=getComputedStyle(d);
      return (st.overflowY==="auto"||st.overflowY==="scroll")&&d.scrollHeight>d.clientHeight+20; })
      .sort((a,b)=>b.clientHeight-a.clientHeight)[0]; if(el) el.scrollTop=0; });
    await page.waitForTimeout(300);
    await wisch(x, s0.y+Math.round(s0.h*0.55));
    const s1=await scroller();
    if(s1&&s1.top>40) ok("Wischen "+wo+" scrollt ebenfalls ("+s1.top+" px)");
    else fail("Wischen "+wo+" bleibt hängen (nur "+(s1?s1.top:"?")+" px)");
  }
}

// Waagerechte Streifen dürfen das senkrechte Wischen nicht abfangen
{ const schlecht=await page.evaluate(()=>[...document.querySelectorAll("div")].filter(d=>{
    const st=getComputedStyle(d);
    const waagerecht=(st.overflowX==="auto"||st.overflowX==="scroll")&&d.scrollWidth>d.clientWidth+4;
    return waagerecht && !/pan-y/.test(st.touchAction) && st.touchAction!=="auto";
  }).map(d=>(d.innerText||"").replace(/\n/g,"/").slice(0,50)));
  if(!schlecht.length) ok("Alle waagerechten Streifen geben das senkrechte Wischen weiter");
  else fail(schlecht.length+" Streifen fangen das Wischen noch ab: "+schlecht.slice(0,3).join(" | ")); }

if(errors.length){ console.log("JS-FEHLER:"); [...new Set(errors)].forEach(e=>console.log(" -",e.slice(0,150))); }
console.log(errors.length||fails.length?`ERGEBNIS: ${fails.length} Fehlschläge, ${errors.length} JS-Fehler`:"ERGEBNIS: ALLES OK");
await browser.close(); srv.close();
process.exit(errors.length||fails.length?1:0);
