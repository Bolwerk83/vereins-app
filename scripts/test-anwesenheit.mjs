// E2E-Test: Anwesenheit abhaken. Die Namensliste darf NICHT in einem eigenen
// Scrollkasten stecken - sonst kommt man auf dem Handy nur an die ersten Namen.
// Aufruf: npm run build && node scripts/test-anwesenheit.mjs
import { chromium } from "playwright-core";
import http from "http"; import fs from "fs"; import path from "path";
const dist = path.resolve("dist");
const srv = http.createServer((req,res)=>{ let p=path.join(dist,req.url.split("?")[0]); if(!fs.existsSync(p)||fs.statSync(p).isDirectory()) p=path.join(dist,"index.html"); res.setHeader("content-type",{".html":"text/html",".js":"text/javascript",".css":"text/css"}[path.extname(p)]||"text/plain"); res.end(fs.readFileSync(p)); }).listen(4245);
const exe=process.env.PLAYWRIGHT_CHROMIUM||"/opt/pw-browsers/chromium-1194/chrome-linux/chrome";
const browser = await chromium.launch({ executablePath:exe, args:["--no-sandbox"] });
// bewusst kleines Handy-Display - da faellt der Scrollkasten am ehesten auf
const page = await browser.newPage({ viewport:{ width:390, height:640 } });
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
await page.addInitScript(()=>{ localStorage.setItem("vereinsapp_config", JSON.stringify({url:"https://127.0.0.1:1/x", key:"test"})); });

await page.goto("http://127.0.0.1:4245/", { waitUntil:"networkidle" }); await page.waitForTimeout(2500);
await page.evaluate(()=>{ localStorage.setItem("va_simple","0"); localStorage.setItem("va_tsimple","0"); sessionStorage.setItem("vereinsapp_v12_session", JSON.stringify({role:"trainer",cid:"demo",tids:["demo_f1"],name:"Demo Trainer",id:"demo_tr1"})); });
await page.reload({waitUntil:"networkidle"}); await page.waitForTimeout(2500); await dismiss();
await clickTxt("Bin dabei"); await page.waitForTimeout(1200);

// Termin öffnen und zur Anwesenheit
await page.evaluate(()=>{ const b=[...document.querySelectorAll("button")].find(x=>/^(✅ Anwesenheit|Ansehen)$/.test((x.innerText||"").trim())); b&&b.click(); });
await page.waitForTimeout(1100);
await page.evaluate(()=>{ const b=[...document.querySelectorAll("button")].find(x=>/^(Orga|Anwesenheit|✅ Anwesenheit)$/.test((x.innerText||"").trim())); b&&b.click(); });
await page.waitForTimeout(900);
let b=await body();
if(/Anwesenheit abhaken/.test(b)) ok("Anwesenheits-Liste ist offen"); else fail("Keine Abhak-Liste: "+b.slice(0,180).replace(/\n/g," | "));

// ===== 1) Kein eigener Scrollkasten um die Namen =====
// Anker ist der Erklaersatz - die Namensliste ist sein naechster Nachbar.
const listeInfo = () => page.evaluate(()=>{
  const hint=[...document.querySelectorAll("div")].find(d=>/^Hake ab, wer wirklich gekommen ist/.test((d.innerText||"").trim()));
  if(!hint) return null;
  const liste=hint.nextElementSibling;
  if(!liste) return null;
  const st=getComputedStyle(liste);
  return { scrollkasten:(st.overflowY==="auto"||st.overflowY==="scroll")&&liste.scrollHeight>liste.clientHeight+4,
           overflow:st.overflowY, maxH:st.maxHeight, zeilen:liste.children.length,
           hoehe:Math.round(liste.getBoundingClientRect().height) };
});
{ const info=await listeInfo();
  if(!info) fail("Abhak-Liste nicht gefunden");
  else {
    if(!info.scrollkasten) ok("Die Namen stecken in keinem eigenen Scrollkasten (overflow: "+info.overflow+", max-height: "+info.maxH+")");
    else fail("Weiterhin ein eigener Scrollkasten: max-height "+info.maxH);
    if(info.zeilen>0) ok("Die Liste zeigt "+info.zeilen+" Namen"); else fail("Keine Namen in der Liste");
  } }

// ===== 2) Der letzte Name lässt sich erreichen und abhaken =====
{ const res=await page.evaluate(()=>{
    const hint=[...document.querySelectorAll("div")].find(d=>/^Hake ab, wer wirklich gekommen ist/.test((d.innerText||"").trim()));
    const liste=hint&&hint.nextElementSibling;
    if(!liste||!liste.children.length) return {fehler:"keine Liste"};
    const zeile=liste.children[liste.children.length-1];
    const name=(zeile.innerText||"").split("\n")[0].trim();
    zeile.scrollIntoView({block:"center"});
    const r=zeile.getBoundingClientRect();
    if(r.top<0||r.bottom>window.innerHeight) return {fehler:"nach dem Scrollen nicht im Bild",name};
    const oben=document.elementFromPoint(r.left+14,r.top+r.height/2);
    if(!oben||!(zeile===oben||zeile.contains(oben))) return {fehler:"verdeckt",name};
    zeile.click();
    return {name};
  });
  if(res.fehler) fail("Letzter Name nicht bedienbar ("+res.fehler+")");
  else {
    ok("Der letzte Name („"+res.name+"“) ist erreichbar und anklickbar");
    await page.waitForTimeout(1200);
    const sichtbar=await page.evaluate(()=>{
      const t=document.body.innerText;
      const m=t.match(/(\d+)\s*da(\s|·|\n)/);
      return m?Number(m[1]):-1;
    });
    if(sichtbar>0) ok("Das Häkchen sitzt sofort ("+sichtbar+" da)"); else fail("Häkchen wird nicht angezeigt: "+sichtbar);
    let gesetzt=0;
    for(let k=0;k<12&&!gesetzt;k++){ await page.waitForTimeout(600);
      gesetzt=await page.evaluate(()=>{
        const d=JSON.parse(localStorage.getItem("vereinsapp_v14")||"null");
        return (d.events||[]).reduce((n,e)=>n+Object.keys(e.present||{}).length,0);
      }); }
    if(gesetzt>0) ok("Und wird gespeichert"); else fail("Häkchen kam nicht in den Daten an");
  } }

// ===== 3) Auch die Abstimmungs- und Torschützenliste ohne Kasten =====
{ const kaesten=await page.evaluate(()=>[...document.querySelectorAll("div")].filter(d=>{
    const st=getComputedStyle(d);
    return (st.overflowY==="auto"||st.overflowY==="scroll") && d.scrollHeight>d.clientHeight+4
      && !/Termin|Schließen/.test((d.getAttribute("aria-label")||""))
      && d.clientHeight<0.75*window.innerHeight;   // der Termin selbst darf scrollen
  }).length);
  if(kaesten===0) ok("Im ganzen Termin gibt es keinen kleinen Scrollkasten mehr");
  else fail("Es bleiben "+kaesten+" kleine Scrollkästen im Termin"); }

if(errors.length){ console.log("JS-FEHLER:"); [...new Set(errors)].forEach(e=>console.log(" -",e.slice(0,150))); }
console.log(errors.length||fails.length?`ERGEBNIS: ${fails.length} Fehlschläge, ${errors.length} JS-Fehler`:"ERGEBNIS: ALLES OK");
await browser.close(); srv.close();
process.exit(errors.length||fails.length?1:0);
