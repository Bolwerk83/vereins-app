// E2E-Test: Direktlink fuer die Eltern. Der Link enthaelt Verein, Mannschaft
// und Kind - nach dem Team-Passwort landen die Eltern sofort bei ihrem Kind,
// ohne Rollenwahl und ohne Namensliste.
// Aufruf: npm run build && node scripts/test-direktlink.mjs
import { chromium } from "playwright-core";
import http from "http"; import fs from "fs"; import path from "path";
const dist = path.resolve("dist");
const srv = http.createServer((req,res)=>{ let p=path.join(dist,req.url.split("?")[0]); if(!fs.existsSync(p)||fs.statSync(p).isDirectory()) p=path.join(dist,"index.html"); res.setHeader("content-type",{".html":"text/html",".js":"text/javascript",".css":"text/css"}[path.extname(p)]||"text/plain"); res.end(fs.readFileSync(p)); }).listen(4239);
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
  for(const f of fx){ const b=[...f.querySelectorAll("button")].find(x=>/geht|Los|Verstanden|Alles klar|Fertig|Jetzt nicht|Weiter →|Überspringen|Schließen/i.test(x.innerText)); if(b){ b.click(); return false; } }
  return true; }); await page.waitForTimeout(420); if(done) break; } };
await page.addInitScript(()=>{ localStorage.setItem("vereinsapp_config", JSON.stringify({url:"https://127.0.0.1:1/x", key:"test"})); });

// ===== 1) Trainer erzeugt den Link =====
await page.goto("http://127.0.0.1:4239/", { waitUntil:"networkidle" }); await page.waitForTimeout(2500);
await page.evaluate(()=>{ localStorage.setItem("va_simple","0"); localStorage.setItem("va_tsimple","0"); sessionStorage.setItem("vereinsapp_v12_session", JSON.stringify({role:"trainer",cid:"demo",tids:["demo_f1"],name:"Demo Trainer",id:"demo_tr1"})); });
await page.reload({waitUntil:"networkidle"}); await page.waitForTimeout(2500); await dismiss();
await page.evaluate(()=>{ const b=[...document.querySelectorAll("button")].find(x=>/Bin dabei/.test(x.innerText)); b&&b.click(); });
await page.waitForTimeout(1200);
{ const da=await page.evaluate(()=>!!localStorage.getItem("vereinsapp_v14"));
  if(da) ok("Vereinsdaten liegen lokal vor"); else fail("Keine lokalen Daten"); }
// Kaderliste: Link-Knopf beim Kind
await page.evaluate(()=>{ const b=[...document.querySelectorAll("button")].find(x=>x.innerText.trim()==="Team"); b&&b.click(); });
await page.waitForTimeout(1400);
for(let i=0;i<3;i++){ const w=await page.evaluate(()=>{ const b=[...document.querySelectorAll("button")].find(x=>x.innerText.trim()==="Überspringen"); if(!b) return false; b.click(); return true; }); if(!w) break; await page.waitForTimeout(500); }
await clickTxt("👥 Kader"); await page.waitForTimeout(600);
await clickTxt("^Spieler$"); await page.waitForTimeout(1000);
{ const hat=await page.evaluate(()=>{
    const k=[...document.querySelectorAll("div")].filter(d=>/Ben Fischer/.test(d.innerText||"")&&d.querySelector("button")&&d.innerText.length<500).pop();
    return !!(k&&[...k.querySelectorAll("button")].find(x=>(x.innerText||"").trim()==="🔗"));
  });
  if(hat) ok("Der Trainer hat pro Kind einen Link-Knopf"); else fail("Kein Link-Knopf in der Kaderliste");
  await page.evaluate(()=>{
    const k=[...document.querySelectorAll("div")].filter(d=>/Ben Fischer/.test(d.innerText||"")&&d.querySelector("button")&&d.innerText.length<500).pop();
    const b=k&&[...k.querySelectorAll("button")].find(x=>(x.innerText||"").trim()==="🔗"); b&&b.click();
  });
  await page.waitForTimeout(900);
  const b2=await body();
  if(/Link für Ben Fischer kopiert|Link geteilt/.test(b2)) ok("Link wird kopiert bzw. geteilt"); else fail("Keine Rückmeldung beim Teilen: "+b2.slice(-140).replace(/\n/g," | ")); }

// ===== 2) Eltern öffnen den Link =====
await page.evaluate(()=>{ sessionStorage.clear(); localStorage.removeItem("va_teamok_demo_f1"); localStorage.removeItem("va_simple"); });
await page.goto("http://127.0.0.1:4239/?club=demo-verein&team=demo_f1&kind=Ben%20Fischer", { waitUntil:"networkidle" });
await page.waitForTimeout(3000);
let b=await body();
if(/F-Jugend 1/.test(b)&&/Team-Passwort/.test(b)) ok("Der Link führt sofort zur richtigen Mannschaft – ohne Rollenwahl"); else fail("Direktlink landet falsch: "+b.slice(0,180).replace(/\n/g," | "));
{ const felder=await page.locator('input[type="password"]').count();
  if(felder>0){
    await page.locator('input[type="password"]').first().fill("f1");
    await page.evaluate(()=>{ const x=[...document.querySelectorAll("button")].find(y=>/Team öffnen|Öffnen|Weiter/i.test(y.innerText)); x&&x.click(); });
    await page.waitForTimeout(1900);
    b=await body();
    if(/Ben F\.|Ben Fischer/.test(b)) ok("Nach dem Passwort geht es direkt zum verlinkten Kind – ohne Namensliste");
    else fail("Kind nicht vorausgewählt: "+b.slice(0,190).replace(/\n/g," | "));
    if(/Wer bist du\?/.test(b)){
      ok("Beim ersten Mal kommt nur noch die Einwilligung");
      await clickTxt("Mutter"); await page.waitForTimeout(500);
      await clickTxt("Ja, einverstanden"); await page.waitForTimeout(1500);
      // Onboarding zu Ende klicken: optionales Kind-Passwort ueberspringen, dann "Los geht's!"
      b=await body();
      if(/Extra-Schutz/.test(b)) ok("Das Kind-Passwort ist ausdruecklich optional");
      else fail("Schritt Extra-Schutz fehlt: "+b.slice(0,160).replace(/\n/g," | "));
      await clickTxt("Ohne Passwort weiter"); await page.waitForTimeout(900);
      await clickTxt("Los geht"); await page.waitForTimeout(1800);
      await dismiss(); b=await body();
    }
    if(/BITTE ANTWORTEN|ALS NÄCHSTES|Kommt Ben/.test(b)) ok("Die Eltern landen direkt bei den Terminen ihres Kindes");
    else fail("Nicht bei den Terminen gelandet: "+b.slice(0,190).replace(/\n/g," | "));
  } else fail("Kein Passwort-Feld im Direktlink"); }

// ===== 3) Zweiter Aufruf: Passwort ist gemerkt =====
await page.evaluate(()=>sessionStorage.clear());
await page.goto("http://127.0.0.1:4239/?club=demo-verein&team=demo_f1&kind=Ben%20Fischer", { waitUntil:"networkidle" });
await page.waitForTimeout(3000); await dismiss();
b=await body();
if(/BITTE ANTWORTEN|ALS NÄCHSTES|Kommt Ben|Ben kommt/.test(b)) ok("Beim zweiten Mal geht es ohne jede Eingabe direkt zu den Terminen");
else fail("Zweiter Aufruf nicht durchgereicht: "+b.slice(0,190).replace(/\n/g," | "));

// ===== 4) Eltern geben den Link selbst weiter (an Papa, Oma, Fahrgemeinschaft) =====
{ const hat=await page.evaluate(()=>!![...document.querySelectorAll("button")].find(x=>/Link weitergeben/.test(x.innerText||"")));
  if(hat) ok("Eltern haben selbst einen Weitergeben-Knopf"); else fail("Kein Weitergeben-Knopf in der Elternansicht");
  const titel=await page.evaluate(()=>{ const b=[...document.querySelectorAll("button")].find(x=>/Link weitergeben/.test(x.innerText||"")); return b?(b.getAttribute("title")||""):""; });
  if(/Ohne Passwort im Link/i.test(titel)) ok("Der Knopf erklaert sich selbst (Titel)"); else fail("Kein erklaerender Titel: "+titel);
  // Zwischenablage mitlesen: kein Passwort, aber Verein, Team und Kind im Link
  await page.evaluate(()=>{ window.__kopiert=null;
    try{ Object.defineProperty(navigator,"share",{value:undefined,configurable:true}); }catch{}
    try{ Object.defineProperty(navigator,"clipboard",{value:{writeText:t=>{window.__kopiert=t;return Promise.resolve();}},configurable:true}); }catch{}
  });
  await clickTxt("Link weitergeben"); await page.waitForTimeout(900);
  const txt=await page.evaluate(()=>window.__kopiert||"");
  if(/club=demo-verein/.test(txt)&&/team=demo_f1/.test(txt)&&/kind=Ben(%20|\+)Fischer/.test(txt)) ok("Der geteilte Link enthaelt Verein, Mannschaft und Kind");
  else fail("Link unvollstaendig: "+txt.slice(0,180).replace(/\n/g," | "));
  if(!/passwort\s*[:=]/i.test(txt)&&!/[?&]pw=/.test(txt)) ok("Im Link steht kein Passwort");
  else fail("Passwort im Link: "+txt.slice(0,180));
  if(/im Link steht keins/i.test(txt)) ok("Die Nachricht sagt, dass kein Passwort im Link steht");
  else fail("Hinweis im Nachrichtentext fehlt: "+txt.slice(0,200).replace(/\n/g," | "));
  const b4=await body();
  if(/kopiert|geteilt/i.test(b4)) ok("Die Eltern bekommen eine Rueckmeldung"); else fail("Keine Rueckmeldung beim Teilen (Eltern)");
}

if(errors.length){ console.log("JS-FEHLER:"); [...new Set(errors)].forEach(e=>console.log(" -",e.slice(0,150))); }
console.log(errors.length||fails.length?`ERGEBNIS: ${fails.length} Fehlschläge, ${errors.length} JS-Fehler`:"ERGEBNIS: ALLES OK");
await browser.close(); srv.close();
process.exit(errors.length||fails.length?1:0);
