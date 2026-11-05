// E2E-Test: Fehlversuche beim Anmelden – sperren und sichtbar machen.
// Gemeldet: „Kann ich bei verdächtig sehen ob er sich anmelden konnte oder
// etwas passiert ist. Ich will verdächtige gar nicht erst bis zur Anmeldung
// lassen." Vorher: Fehlversuche wurden nirgends festgehalten, der
// Brute-Force-Schutz war programmiert, aber an keiner Maske angeschlossen.
//   1. Ein falscher Code wird abgewiesen und als Fehlversuch protokolliert.
//   2. Nach dem dritten Fehlversuch ist die Eingabe gesperrt (Countdown).
//   3. Der richtige Code hilft während der Sperre auch nicht weiter.
//   4. Im Sicherheits-Protokoll steht je Eintrag, ob jemand hereinkam.
//   5. Nach einer gelungenen Anmeldung vom selben Gerät steht das dort.
//   6. Ein richtiger Code setzt den Zähler zurück – ein Tippfehler sperrt nicht.
// Aufruf: npm run build && node scripts/test-login-sperre.mjs
import { chromium } from "playwright-core";
import http from "http"; import fs from "fs"; import path from "path";
const dist = path.resolve("dist");
const srv = http.createServer((req,res)=>{ let p=path.join(dist,req.url.split("?")[0]); if(!fs.existsSync(p)||fs.statSync(p).isDirectory()) p=path.join(dist,"index.html"); res.setHeader("content-type",{".html":"text/html",".js":"text/javascript",".css":"text/css"}[path.extname(p)]||"text/plain"); res.end(fs.readFileSync(p)); }).listen(4353);
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
const klick=(re)=>page.evaluate(r=>{
  const b=[...document.querySelectorAll("button")].find(x=>new RegExp(r).test((x.innerText||"").replace(/\s+/g," ").trim()));
  if(!b||b.disabled) return false; b.click(); return true; }, re instanceof RegExp?re.source:re);
const dismiss=async()=>{ for(let k=0;k<12;k++){ const done=await page.evaluate(()=>{
  const fx=[...document.querySelectorAll("div")].filter(d=>getComputedStyle(d).position==="fixed"&&d.querySelector("button")&&d.innerText.length>30);
  for(const f of fx){ const b=[...f.querySelectorAll("button")].find(x=>/geht|Los|Verstanden|Alles klar|Fertig|Jetzt nicht|Weiter →|Überspringen|Start/i.test(x.innerText)); if(b){ b.click(); return false; } }
  return true; }); await page.waitForTimeout(400); if(done) break; } };
// Protokoll-Eintraege direkt aus den Daten - unabhaengig von der Darstellung
const prot=()=>page.evaluate(()=>{ const d=JSON.parse(localStorage.getItem("vereinsapp_v14")||"null");
  return (d.securityLog||[]).filter(e=>e.cid==="demo").map(e=>({t:e.type,d:e.detail})); });
const tippe=async(code)=>{
  await page.evaluate(()=>{ const i=[...document.querySelectorAll("input")].find(x=>x.type==="password"||x.type==="text"); if(i){ i.focus(); i.select&&i.select(); } });
  await page.keyboard.press("Control+A").catch(()=>{});
  await page.keyboard.type(code);
  await page.waitForTimeout(250);
  await page.keyboard.press("Enter");
  await page.waitForTimeout(900);
};

await page.addInitScript(()=>{
  if(!localStorage.getItem("vereinsapp_config")) localStorage.setItem("vereinsapp_config", JSON.stringify({url:"https://127.0.0.1:1/x", key:"test"}));
  if(localStorage.getItem("va_simple")===null)  localStorage.setItem("va_simple","1");
  if(localStorage.getItem("va_tsimple")===null) localStorage.setItem("va_tsimple","0");
});
await page.goto("http://127.0.0.1:4353/", { waitUntil:"networkidle" }); await page.waitForTimeout(2600);
// Erst die Vereinsdaten lokal holen (sonst kennt der Direktlink den Verein nicht)
await page.evaluate(()=>{ sessionStorage.setItem("vereinsapp_v12_session", JSON.stringify({role:"trainer",cid:"demo",tids:["demo_f1"],name:"Demo Trainer",id:"demo_tr1"})); });
await page.reload({waitUntil:"networkidle"}); await page.waitForTimeout(2600); await dismiss();
await page.evaluate(()=>{ const b=[...document.querySelectorAll("button")].find(x=>/Bin dabei/.test(x.innerText)); b&&b.click(); });
await page.waitForTimeout(1300);

// ===== Zur Code-Abfrage der F-Jugend 1 =====
const zurEingabe=async()=>{
  await page.evaluate(()=>{ sessionStorage.clear(); localStorage.removeItem("va_teamok_demo_f1"); });
  await page.goto("http://127.0.0.1:4353/?club=demo-verein&team=demo_f1", { waitUntil:"networkidle" });
  await page.waitForTimeout(2600); await dismiss();
};
await zurEingabe();
let b=await body();
if(/F-Jugend 1/.test(b)) ok("Die Code-Abfrage der Mannschaft steht da");
else { fail("Nicht bei der Code-Abfrage: "+kurz(b)); process.exit(1); }

// ===== 1) Erster Fehlversuch =====
await tippe("falsch1");
b=await body();
if(!/Zu viele Fehlversuche/.test(b)) ok("Ein einzelner Tippfehler sperrt noch nicht");
else fail("Schon nach dem ersten Versuch gesperrt");
{ const p=await prot();
  if(p.some(x=>x.t==="login_fail"&&/Versuch 1 von 3/.test(x.d))) ok("Der Fehlversuch steht im Protokoll (Versuch 1 von 3)");
  else fail("Kein Protokoll-Eintrag: "+JSON.stringify(p.slice(-3))); }

// ===== 2) Dritter Fehlversuch sperrt =====
await tippe("falsch2");
await tippe("falsch3");
b=await body();
if(/Zu viele Fehlversuche/.test(b)) ok("Nach dem dritten Fehlversuch ist die Eingabe gesperrt");
else fail("Keine Sperre: "+kurz(b));
if(/Minuten|Sekunden/.test(b)) ok("Mit Countdown, damit klar ist, wie lange");
else fail("Kein Countdown: "+kurz(b));
{ const feld=await page.evaluate(()=>[...document.querySelectorAll("input")].filter(x=>x.type==="password").length);
  if(feld===0) ok("Das Eingabefeld ist weg – man kommt gar nicht mehr zum Tippen");
  else fail("Eingabefeld noch da: "+feld); }
{ const p=await prot();
  if(p.some(x=>x.t==="brute_force")) ok("Die Sperre selbst steht auch im Protokoll");
  else fail("Keine Sperre protokolliert: "+JSON.stringify(p.slice(-3))); }

// ===== 3) Auch der richtige Code hilft jetzt nicht =====
{ const knopf=await page.evaluate(()=>{ const b2=[...document.querySelectorAll("button")].find(x=>/Mannschaft öffnen|Weiter|Öffnen/i.test(x.innerText||"")); return b2?!!b2.disabled:null; });
  if(knopf!==false) ok("Der Knopf ist gesperrt");
  else fail("Knopf trotz Sperre klickbar"); }
await page.reload({waitUntil:"networkidle"}); await page.waitForTimeout(2600); await dismiss();
b=await body();
if(/Zu viele Fehlversuche/.test(b)) ok("Neu laden hebt die Sperre nicht auf");
else fail("Nach dem Neuladen wieder offen: "+kurz(b));

// ===== 4) Das Protokoll sagt, ob jemand hereinkam =====
await page.evaluate(()=>{ localStorage.removeItem("va_bf_demo"); });   // Sperre abgelaufen
await page.evaluate(()=>{ sessionStorage.setItem("vereinsapp_v12_session", JSON.stringify({role:"admin",cid:"demo",name:"Vereinsadmin",id:"admin"})); });
await page.reload({waitUntil:"networkidle"}); await page.waitForTimeout(2800); await dismiss();
const zumProtokoll=async()=>{
  await page.evaluate(()=>{ const b2=[...document.querySelectorAll("button")].find(x=>/^Mehr$/.test((x.innerText||"").replace(/\s+/g," ").trim())); b2&&b2.click(); });
  await page.waitForTimeout(1100);
  const hin=await page.evaluate(()=>{
    const el=[...document.querySelectorAll("button,div,a")].filter(x=>/^!?\s*Sicherheitslog$/.test((x.innerText||"").replace(/\s+/g," ").trim()))
      .sort((a,b)=>(a.innerText||"").length-(b.innerText||"").length)[0];
    if(!el) return false; el.click(); return true; });
  await page.waitForTimeout(1500);
  return hin;
};
{ const hin=await zumProtokoll();
  if(hin) ok("Das Sicherheitslog ist über Mehr erreichbar"); else fail("Sicherheitslog nicht gefunden"); }
b=await body();
if(/Fehlversuch|Gesperrt/.test(b)) ok("Die Fehlversuche stehen im Sicherheits-Protokoll");
else fail("Fehlversuche fehlen im Protokoll: "+kurz(b));
if(/nicht hereingekommen/.test(b)) ok("Und dabei steht: nicht hereingekommen");
else fail("Kein Ergebnis am Eintrag: "+kurz(b));
if(/Fehlversuche/.test(b)) ok("Oben zählt eine Kachel die Fehlversuche");
else fail("Keine Kachel: "+kurz(b));

// ===== 5) Nach gelungener Anmeldung vom selben Gerät =====
{ const gid=await page.evaluate(()=>localStorage.getItem("va_device_id"));
  await page.evaluate(g=>{ const d=JSON.parse(localStorage.getItem("vereinsapp_v14")||"null");
    d.securityLog=[...(d.securityLog||[]), { id:"log_test", cid:"demo", type:"login", detail:"Login: Testeltern",
      ts:new Date().toISOString(), role:"user", name:"Testeltern", deviceId:g, device:{os:"iOS"} }];
    localStorage.setItem("vereinsapp_v14", JSON.stringify(d)); }, gid);
  await page.reload({waitUntil:"networkidle"}); await page.waitForTimeout(2800); await dismiss();
  await zumProtokoll();
  b=await body();
  if(/danach angemeldet als Testeltern/.test(b)) ok("Gelingt die Anmeldung später doch, steht genau das am Fehlversuch");
  else fail("Kein Hinweis auf die spätere Anmeldung: "+kurz(b)); }

// ===== 6) Richtiger Code setzt den Zähler zurück =====
await page.evaluate(()=>{ localStorage.removeItem("va_bf_demo"); localStorage.removeItem("va_teamok_demo_f1"); });
await zurEingabe();
await tippe("falsch1");
await tippe("f1");                       // Demo-Code der F-Jugend 1
await page.waitForTimeout(1200);
{ const bf=await page.evaluate(()=>localStorage.getItem("va_bf_demo"));
  if(!bf) ok("Nach dem richtigen Code ist der Zähler zurückgesetzt – ein Tippfehler bleibt folgenlos");
  else fail("Zähler nicht zurückgesetzt: "+bf); }
b=await body();
if(!/Zu viele Fehlversuche/.test(b)) ok("Und die Anmeldung geht normal weiter");
else fail("Trotz richtigem Code gesperrt: "+kurz(b));

if(errors.length){ console.log("JS-FEHLER:"); [...new Set(errors)].forEach(e=>console.log(" -",e.slice(0,150))); }
console.log(errors.length||fails.length?`ERGEBNIS: ${fails.length} Fehlschläge, ${errors.length} JS-Fehler`:"ERGEBNIS: ALLES OK");
await browser.close(); srv.close();
process.exit(errors.length||fails.length?1:0);
