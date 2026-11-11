// E2E-Test: Keine Aufgaben zu Terminen, die schon vorbei sind.
// Gemeldet: „Spielbericht nicht als Meldung anzeigen und erst recht nicht,
// wenn der Termin schon vorbei ist." Der Spielbericht war die einzige Aufgabe,
// die zurückschaute: Sie erschien erst NACH dem Spiel und blieb drei Wochen
// stehen, bis jemand den Bericht schrieb.
//   1. Ein gespieltes Spiel ohne Bericht erzeugt keine Aufgabe mehr.
//   2. Überhaupt steht in „Zu erledigen" nichts zu vergangenen Terminen.
//   3. Ein Termin, der heute war und schon vorbei ist, erzeugt auch nichts.
//   4. Aufgaben zu KÜNFTIGEN Terminen bleiben erhalten.
//   5. Der Spielbericht ist weiterhin im Termin zu schreiben.
// Aufruf: npm run build && node scripts/test-aufgaben-vergangen.mjs
import { chromium } from "playwright-core";
import http from "http"; import fs from "fs"; import path from "path";
const dist = path.resolve("dist");
const srv = http.createServer((req,res)=>{ let p=path.join(dist,req.url.split("?")[0]); if(!fs.existsSync(p)||fs.statSync(p).isDirectory()) p=path.join(dist,"index.html"); res.setHeader("content-type",{".html":"text/html",".js":"text/javascript",".css":"text/css"}[path.extname(p)]||"text/plain"); res.end(fs.readFileSync(p)); }).listen(4355);
const exe=(()=>{ if(process.env.PLAYWRIGHT_CHROMIUM) return process.env.PLAYWRIGHT_CHROMIUM;
  const basis=process.env.PLAYWRIGHT_BROWSERS_PATH||"/opt/pw-browsers";
  const kand=[`${basis}/chromium`, ...fs.existsSync(basis)
    ? fs.readdirSync(basis).filter(d=>d.startsWith("chromium-")).sort().reverse()
        .flatMap(d=>["chrome-linux64/chrome","chrome-linux/chrome"].map(x=>`${basis}/${d}/${x}`))
    : []];
  for(const p of kand){ try{ if(fs.existsSync(p)) return p; }catch{} }
  return `${basis}/chromium`; })();
const browser = await chromium.launch({ executablePath:exe, args:["--no-sandbox"] });
const page = await browser.newPage({ viewport:{ width:390, height:900 } });
page.setDefaultTimeout(10000);
const errors=[]; const fails=[];
page.on("pageerror", e=>errors.push(e.message));
page.on("dialog", d=>d.accept());
const fail=m=>{ fails.push(m); console.log("FEHLGESCHLAGEN:", m); };
const ok=m=>console.log("OK:", m);
const body=()=>page.evaluate(()=>document.body.innerText);
const kurz=t=>String(t).slice(0,320).replace(/\n/g," | ");
const dismiss=async()=>{ for(let k=0;k<12;k++){ const done=await page.evaluate(()=>{
  const fx=[...document.querySelectorAll("div")].filter(d=>getComputedStyle(d).position==="fixed"&&d.querySelector("button")&&d.innerText.length>30);
  for(const f of fx){ const b=[...f.querySelectorAll("button")].find(x=>/geht|Los|Verstanden|Alles klar|Fertig|Jetzt nicht|Weiter →|Überspringen|Start/i.test(x.innerText)); if(b){ b.click(); return false; } }
  return true; }); await page.waitForTimeout(400); if(done) break; } };
const klick=(re)=>page.evaluate(r=>{
  const b=[...document.querySelectorAll("button")].find(x=>new RegExp(r).test((x.innerText||"").replace(/\s+/g," ").trim()));
  if(!b||b.disabled) return false; b.click(); return true; }, re instanceof RegExp?re.source:re);
// Die Aufgabenliste als Text - nur dieser Kasten, nicht die ganze Seite.
const aufgaben=()=>page.evaluate(()=>{
  // Der kleinste Kasten, der die Ueberschrift UND mindestens einen Eintrag
  // enthaelt - die Ueberschrift allein steht in einem eigenen div.
  const a=[...document.querySelectorAll("div")].filter(x=>/✅ Zu erledigen/.test(x.innerText||"")&&(x.innerText||"").length>40)
    .sort((p,q)=>(p.innerText||"").length-(q.innerText||"").length)[0];
  return a?(a.innerText||""):""; });

await page.addInitScript(()=>{
  if(!localStorage.getItem("vereinsapp_config")) localStorage.setItem("vereinsapp_config", JSON.stringify({url:"https://127.0.0.1:1/x", key:"test"}));
  if(localStorage.getItem("va_simple")===null)  localStorage.setItem("va_simple","0");
  if(localStorage.getItem("va_tsimple")===null) localStorage.setItem("va_tsimple","0");
});
await page.goto("http://127.0.0.1:4355/", { waitUntil:"networkidle" }); await page.waitForTimeout(2500);
await page.evaluate(()=>{ sessionStorage.setItem("vereinsapp_v12_session", JSON.stringify({role:"trainer",cid:"demo",tids:["demo_f1"],name:"Demo Trainer",id:"demo_tr1"})); });
await page.reload({waitUntil:"networkidle"}); await page.waitForTimeout(2600); await dismiss();
await page.evaluate(()=>{ const b=[...document.querySelectorAll("button")].find(x=>/Bin dabei/.test(x.innerText)); b&&b.click(); });
await page.waitForTimeout(1400);

// Drei Spiele: eines vor drei Tagen (ohne Bericht), eines heute früh (vorbei),
// eines in zwei Tagen (soll weiter eine Aufgabe erzeugen).
const setup = await page.evaluate(()=>{
  const d=JSON.parse(localStorage.getItem("vereinsapp_v14")||"null");
  const z=x=>String(x).padStart(2,"0");
  const tag=n=>{ const x=new Date(); x.setHours(12,0,0,0); x.setDate(x.getDate()+n);
    return `${x.getFullYear()}-${z(x.getMonth()+1)}-${z(x.getDate())}`; };
  const vorlage=(d.events||[]).filter(e=>e.cid==="demo"&&e.tid==="demo_f1")[0];
  const mk=(id,titel,tage,zeit)=>({...vorlage, id, tid:"demo_f1", cid:"demo", title:titel, type:"heimspiel",
    pt:"att", date:tag(tage), time:zeit, endTime:"12:30", deadline:null, votes:{}, present:{},
    report:null, lineup:null, lineups:null, extraPolls:[], duties:[], sollPlayers:0, createdAt:null });
  d.events=[...(d.events||[]).filter(e=>e.cid!=="demo"),
    mk("sp_alt","Spiel VORBEI",-3,"11:00"),
    mk("sp_heute","Spiel HEUTE FRUEH",0,"00:01"),
    mk("sp_bald","Spiel BALD",2,"11:00")];
  localStorage.setItem("vereinsapp_v14", JSON.stringify(d));
  return true;
});
if(setup) ok("Ausgangslage: ein Spiel vor drei Tagen, eines heute früh, eines in zwei Tagen – keines mit Bericht");
else { fail("Testdaten nicht gesetzt"); process.exit(1); }
await page.reload({waitUntil:"networkidle"}); await page.waitForTimeout(2900); await dismiss();

// ===== 1+2) Keine Aufgabe zum vergangenen Spiel =====
let a=await aufgaben();
if(!/Spielbericht/.test(a)) ok("„Spielbericht eintragen“ steht nicht mehr in der Aufgabenliste");
else fail("Spielbericht-Aufgabe noch da: "+kurz(a));
if(!/VORBEI/.test(a)) ok("Zum vergangenen Spiel steht überhaupt keine Aufgabe da");
else fail("Aufgabe zu einem vergangenen Termin: "+kurz(a));

// ===== 3) Heute, aber schon vorbei =====
if(!/HEUTE FRUEH/.test(a)) ok("Auch ein Termin von heute früh erzeugt nichts mehr – er ist vorbei");
else fail("Aufgabe zu einem beendeten Termin von heute: "+kurz(a));

// ===== 4) Künftige Termine erzeugen weiter Aufgaben =====
if(/BALD/.test(a)) ok("Das Spiel in zwei Tagen steht weiter in der Liste – die Aufgaben selbst bleiben");
else fail("Künftige Aufgabe verschwunden: "+kurz(a)||"(keine Aufgabenliste)");

// ===== 5) Der Spielbericht ist weiter im Termin zu schreiben =====
if(await klick("vergangene Termine anzeigen")) ok("Die vergangenen Termine lassen sich aufklappen");
else fail("Kein Knopf für vergangene Termine");
await page.waitForTimeout(1100);
{ const auf=await page.evaluate(()=>{
    const k=[...document.querySelectorAll("div")].filter(d=>/Spiel VORBEI/.test(d.innerText||"")
      && [...d.querySelectorAll("button")].some(x=>/^(Ansehen|✅ Anwesenheit)$/.test((x.innerText||"").trim())))
      .sort((x,y)=>(x.innerText||"").length-(y.innerText||"").length)[0];
    if(!k) return false;
    const b=[...k.querySelectorAll("button")].find(x=>/^(Ansehen|✅ Anwesenheit)$/.test((x.innerText||"").trim()));
    if(!b) return false; b.click(); return true; });
  if(auf) ok("Das vergangene Spiel lässt sich öffnen"); else fail("Karte des vergangenen Spiels nicht gefunden"); }
await page.waitForTimeout(1700);
await klick("⏱ Spieltag"); await page.waitForTimeout(1200);
{ const offen=await body();
  if(/Spielbericht|Ergebnis/.test(offen)) ok("Der Spielbericht steht weiterhin im Termin – nur die Erinnerung ist weg");
  else fail("Spielbericht im Termin nicht erreichbar: "+kurz(offen)); }

if(errors.length){ console.log("JS-FEHLER:"); [...new Set(errors)].forEach(e=>console.log(" -",e.slice(0,150))); }
console.log(errors.length||fails.length?`ERGEBNIS: ${fails.length} Fehlschläge, ${errors.length} JS-Fehler`:"ERGEBNIS: ALLES OK");
await browser.close(); srv.close();
process.exit(errors.length||fails.length?1:0);
