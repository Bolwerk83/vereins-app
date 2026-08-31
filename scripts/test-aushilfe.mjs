// E2E-Test: Aushilfen aus anderen Mannschaften am Termin + Warnung, wenn ein
// Kind zur gleichen Zeit schon woanders zugesagt hat (mit Ignorieren-Option).
// Aufruf: npm run build && node scripts/test-aushilfe.mjs
import { chromium } from "playwright-core";
import http from "http"; import fs from "fs"; import path from "path";
const dist = path.resolve("dist");
const srv = http.createServer((req,res)=>{ let p=path.join(dist,req.url.split("?")[0]); if(!fs.existsSync(p)||fs.statSync(p).isDirectory()) p=path.join(dist,"index.html"); res.setHeader("content-type",{".html":"text/html",".js":"text/javascript",".css":"text/css"}[path.extname(p)]||"text/plain"); res.end(fs.readFileSync(p)); }).listen(4259);
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
await page.goto("http://127.0.0.1:4259/", { waitUntil:"networkidle" }); await page.waitForTimeout(2500);
await page.evaluate(()=>{ sessionStorage.setItem("vereinsapp_v12_session", JSON.stringify({role:"trainer",cid:"demo",tids:["demo_f1","demo_g"],name:"Demo Trainer",id:"demo_tr1"})); });
await page.reload({waitUntil:"networkidle"}); await page.waitForTimeout(2600); await dismiss();
await page.evaluate(()=>{ const b=[...document.querySelectorAll("button")].find(x=>/Bin dabei/.test(x.innerText)); b&&b.click(); });
await page.waitForTimeout(1200);

// Ausgangslage: das G-Jugend-Training auf dieselbe Zeit wie das F1-Training
// legen und Leon Weber (F-Jugend 1) als Aushilfe fuer die G-Jugend markieren.
await page.evaluate(()=>{
  const d=JSON.parse(localStorage.getItem("vereinsapp_v14")||"null"); if(!d) return;
  const f1=(d.events||[]).find(e=>e.id==="de5");     // F-Jugend 1, 17:30-19:00
  const g =(d.events||[]).find(e=>e.id==="de1");     // G-Jugend
  if(f1&&g){ g.date=f1.date; g.time="17:00"; g.endTime="19:30"; g.title="Training G-Jugend"; }
  // Jahrgang passend zur G-Jugend setzen: nach unten aushelfen ist nach
  // DFB-Schema nicht erlaubt, ein hochgeholtes Kind darf dagegen zurueck.
  const p=(d.playerProfiles||[]).find(x=>x.name==="Leon Weber"); if(p){ p.by=2020; p.optTids=["demo_g"]; }
  localStorage.setItem("vereinsapp_v14", JSON.stringify(d));
});
await page.reload({waitUntil:"networkidle"}); await page.waitForTimeout(2800); await dismiss();

// Den G-Turnier-Termin öffnen (dort ist Leon Aushilfe und schon zugesagt)
const oeffne = async (titel) => {
  await page.evaluate(t2=>{
    const karten=[...document.querySelectorAll("div")].filter(d=>(d.innerText||"").includes(t2)&&[...d.querySelectorAll("button")].some(b=>/^(Ansehen|✅ Anwesenheit)$/.test((b.innerText||"").trim()))&&d.innerText.length<1200);
    const k=karten[karten.length-1]; if(!k) return;
    const b=[...k.querySelectorAll("button")].find(x=>/^(Ansehen|✅ Anwesenheit)$/.test((x.innerText||"").trim())); b&&b.click();
  }, titel);
  await page.waitForTimeout(1200);
  await page.evaluate(()=>{ const b=[...document.querySelectorAll("button")].find(x=>/^(Orga|👥 Orga)$/.test((x.innerText||"").trim())); b&&b.click(); });
  await page.waitForTimeout(900);
  return body();
};
let b=await oeffne("Training G-Jugend");
if(/Anwesenheit abhaken|Orga|Training G-Jugend/.test(b)) ok("G-Jugend-Termin ist offen"); else fail("Termin nicht offen: "+b.slice(0,160).replace(/\n/g," | "));

// ===== 1) Aushilfe-Liste =====
if(/Aushilfe möglich/.test(b)) ok("Der Termin zeigt „Aushilfe möglich“"); else fail("Keine Aushilfe-Liste: "+b.slice(0,220).replace(/\n/g," | "));
await clickTxt("Aushilfe möglich"); await page.waitForTimeout(700);
b=await body();
if(/Leon Weber/.test(b)) ok("Das Aushilfe-Kind steht drin (Leon Weber)"); else fail("Kind fehlt in der Aushilfe-Liste");
if(/aus F-Jugend 1/.test(b)) ok("Mit Angabe, aus welcher Mannschaft es kommt (F-Jugend 1)"); else fail("Herkunft fehlt");
if(/zur gleichen Zeit bei/.test(b)) ok("Und mit Hinweis auf die Doppelmeldung"); else fail("Kein Konflikt-Hinweis in der Liste");
// Eintragen trotz Konflikt
{ const txt=await page.evaluate(()=>{ const b2=[...document.querySelectorAll("button")].find(x=>/Trotzdem eintragen|^Eintragen$/.test((x.innerText||"").trim())); return b2?b2.innerText.trim():null; });
  if(txt==="Trotzdem eintragen") ok("Der Knopf warnt vor: „Trotzdem eintragen“"); else fail("Knopftext unerwartet: "+txt);
  await clickTxt("Trotzdem eintragen"); await page.waitForTimeout(1400); }
b=await body();
if(/✓ dabei/.test(b)) ok("Nach dem Eintragen steht das Kind als dabei"); else fail("Eintragen ohne Wirkung");

// ===== 2) Warnung bei Doppelmeldung =====
if(/Zur gleichen Zeit woanders gemeldet/.test(b)) ok("Der Termin warnt vor der Doppelmeldung");
else fail("Keine Warnung: "+b.slice(0,240).replace(/\n/g," | "));
if(/F-Jugend 1/.test(b)) ok("Die Warnung nennt den anderen Termin (F-Jugend 1)"); else fail("Anderer Termin nicht genannt");
// ===== 3) Ignorieren =====
await clickTxt("Warnung ignorieren"); await page.waitForTimeout(1300);
b=await body();
if(!/Zur gleichen Zeit woanders gemeldet/.test(b)) ok("„Warnung ignorieren“ blendet sie aus");
else fail("Warnung bleibt trotz Ignorieren");
if(/Bewusst doppelt eingeplant/.test(b)) ok("Stattdessen steht dort, dass es Absicht ist"); else fail("Kein Hinweis auf die bewusste Doppelplanung");
{ const gespeichert=await page.evaluate(()=>{
    const d=JSON.parse(localStorage.getItem("vereinsapp_v14")||"null");
    const e=(d.events||[]).find(x=>x.id==="de1");
    return (e&&e.conflictOk)||[]; });
  if(gespeichert.includes("Leon Weber")) ok("Die Entscheidung wird gespeichert"); else fail("Nicht gespeichert: "+JSON.stringify(gespeichert)); }
await clickTxt("Warnung wieder zeigen"); await page.waitForTimeout(1200);
b=await body();
if(/Zur gleichen Zeit woanders gemeldet/.test(b)) ok("Und lässt sich wieder einschalten"); else fail("Warnung kommt nicht zurück");

// ===== 4) Direkt anschreiben + Hinweis beim eigenen Trainer =====
await page.keyboard.press("Escape").catch(()=>{});
await page.evaluate(()=>{ const b2=[...document.querySelectorAll("button")].find(x=>(x.getAttribute("aria-label")||"")==="Schließen"||(x.innerText||"").trim()==="✕"); b2&&b2.click(); });
await page.waitForTimeout(900);
// Zweites Aushilfe-Kind ohne Zusage vorbereiten
await page.evaluate(()=>{
  const d=JSON.parse(localStorage.getItem("vereinsapp_v14")||"null"); if(!d) return;
  const p=(d.playerProfiles||[]).find(x=>x.name==="Paul Becker"); if(p){ p.by=2020; p.optTids=["demo_g"]; }
  localStorage.setItem("vereinsapp_v14", JSON.stringify(d));
});
await page.reload({waitUntil:"networkidle"}); await page.waitForTimeout(2800); await dismiss();
b=await oeffne("Training G-Jugend");
await clickTxt("Aushilfe möglich"); await page.waitForTimeout(700);
b=await body();
if(/✉ Anfragen/.test(b)) ok("Es gibt einen Knopf zum direkten Anschreiben"); else fail("Kein Anfragen-Knopf");
await clickTxt("✉ Anfragen"); await page.waitForTimeout(800);
b=await body();
if(/anfragen/i.test(b)&&/Anfrage senden/.test(b)) ok("Das Anfrage-Fenster ist offen");
else fail("Kein Anfrage-Fenster: "+b.slice(0,200).replace(/\n/g," | "));
{ const txt=await page.evaluate(()=>{ const t2=document.querySelector("textarea"); return t2?t2.value:""; });
  if(/aushelfen|Unterstützung/.test(txt)) ok("Der Text ist vorformuliert und anpassbar"); else fail("Kein vorformulierter Text: "+txt.slice(0,80));
  if(/Der eigene Trainer bekommt nur einen Hinweis/.test(b)) ok("Es steht dabei, dass der eigene Trainer nur informiert wird"); }
await clickTxt("Anfrage senden"); await page.waitForTimeout(1500);
{ const gespeichert=await page.evaluate(()=>{
    const d=JSON.parse(localStorage.getItem("vereinsapp_v14")||"null");
    return { reqs:(d.aushilfeReqs||[]).length, msgs:(d.trainerMsgs||[]).length,
             r:(d.aushilfeReqs||[])[0]||null }; });
  if(gespeichert.reqs>0) ok("Die Anfrage ist gespeichert (Status: "+(gespeichert.r?.status)+")"); else fail("Keine Anfrage gespeichert");
  if(gespeichert.msgs>0) ok("Und die Eltern bekommen eine Nachricht"); else fail("Keine Elternnachricht"); }
b=await body();
if(/angefragt – Trainer informiert/.test(b)) ok("Der anfragende Trainer sieht den Status");

// Jetzt als Trainer der Heim-Mannschaft: Hinweis + Absage mit Grund
await page.evaluate(()=>{ const b2=[...document.querySelectorAll("button")].find(x=>(x.getAttribute("aria-label")||"")==="Schließen"||(x.innerText||"").trim()==="✕"); b2&&b2.click(); });
await page.waitForTimeout(700);
await page.evaluate(()=>{ sessionStorage.setItem("vereinsapp_v12_session", JSON.stringify({role:"trainer",cid:"demo",tids:["demo_f1"],name:"F1 Trainer",id:"demo_tr2"})); });
await page.reload({waitUntil:"networkidle"}); await page.waitForTimeout(2800); await dismiss();
b=await body();
if(/🔁 Aushilfe/.test(b)) ok("Der eigene Trainer sieht den Hinweis");
else fail("Kein Hinweis beim eigenen Trainer: "+b.slice(0,240).replace(/\n/g," | "));
if(/Du musst nichts tun/.test(b)) ok("Mit dem Hinweis, dass er nichts tun muss");
if(/Passt so/.test(b)&&/Absagen mit Grund/.test(b)) ok("Beide Wege stehen bereit: passt so / absagen mit Grund");
else fail("Knöpfe fehlen");
await clickTxt("Absagen mit Grund"); await page.waitForTimeout(700);
await page.evaluate(()=>{ const i=[...document.querySelectorAll("input")].find(x=>/Grund/.test(x.placeholder||""));
  if(i){ const setter=Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype,"value").set;
    setter.call(i,"Wir spielen zur gleichen Zeit"); i.dispatchEvent(new Event("input",{bubbles:true})); } });
await page.waitForTimeout(500);
await clickTxt("Absage senden"); await page.waitForTimeout(1500);
{ const st=await page.evaluate(()=>{
    const d=JSON.parse(localStorage.getItem("vereinsapp_v14")||"null");
    const r=(d.aushilfeReqs||[])[0]||{}; return {s:r.status,g:r.reason}; });
  if(st.s==="no"&&/gleichen Zeit/.test(st.g||"")) ok("Absage mit Grund gespeichert: „"+st.g+"“");
  else fail("Absage nicht gespeichert: "+JSON.stringify(st)); }
b=await body();
if(!/🔁 Aushilfe/.test(b)) ok("Der Hinweis verschwindet nach der Entscheidung"); else fail("Hinweis bleibt stehen");

// ===== 5) Eltern bieten ihr Kind selbst an =====
await page.evaluate(()=>{ sessionStorage.clear(); localStorage.removeItem("vereinsapp_v12_session_persist"); localStorage.removeItem("va_teamok_demo_g"); localStorage.setItem("va_simple","0"); });
await page.goto("http://127.0.0.1:4259/?club=demo-verein&team=demo_g", { waitUntil:"networkidle" });
await page.waitForTimeout(2800); await dismiss();
if(await page.locator('input[type="password"]').count()){
  await page.locator('input[type="password"]').first().fill("g1");
  await page.evaluate(()=>{ const x=[...document.querySelectorAll("button")].find(y=>/Team öffnen|Öffnen|Weiter/i.test(y.innerText)); x&&x.click(); });
  await page.waitForTimeout(1900); }
b=await body();
if(/Mitspielen oder mittrainieren/.test(b)) ok("Eltern finden den Knopf „Mitspielen oder mittrainieren?“");
else fail("Kein Mitmachen-Knopf: "+b.slice(-260).replace(/\n/g," | "));
await clickTxt("Mitspielen oder mittrainieren"); await page.waitForTimeout(800);
b=await body();
if(/Wer möchte mitmachen\?/.test(b)) ok("Das Fenster fragt, wer mitmachen möchte"); else fail("Fenster fehlt");
if(/Dauerhaft merken/.test(b)) ok("„Dauerhaft merken“ steht zur Auswahl"); else fail("Kein Dauerhaft-Haken");
if(/Mitspielen/.test(b)&&/Mittrainieren/.test(b)&&/Aushelfen/.test(b)) ok("Und man kann sagen, worum es geht");
{ const feld=page.locator('div[style*="fixed"] input').first();
  await feld.fill("Ben Fischer"); await page.waitForTimeout(600); }
await clickTxt("Anfrage an den Trainer senden"); await page.waitForTimeout(1500);
b=await body();
if(/Anfrage ist beim Trainer/.test(b)) ok("Die Eltern bekommen eine klare Rückmeldung"); else fail("Keine Bestätigung: "+b.slice(0,200).replace(/\n/g," | "));
{ const r=await page.evaluate(()=>{
    const d=JSON.parse(localStorage.getItem("vereinsapp_v14")||"null");
    return (d.aushilfeReqs||[]).find(x=>x.art==="angebot")||null; });
  if(r&&r.playerName==="Ben Fischer") ok("Die Anfrage ist gespeichert (dauerhaft: "+r.dauerhaft+", Wunsch: "+r.wunsch+")");
  else fail("Angebot nicht gespeichert: "+JSON.stringify(r));
  if(r&&r.homeTid==="demo_f1") ok("Das Kind wurde der richtigen Heim-Mannschaft zugeordnet"); }

// Trainer der G-Jugend entscheidet
await page.evaluate(()=>{ sessionStorage.setItem("vereinsapp_v12_session", JSON.stringify({role:"trainer",cid:"demo",tids:["demo_g"],name:"G Trainer",id:"demo_tr3"})); });
await page.reload({waitUntil:"networkidle"}); await page.waitForTimeout(2800); await dismiss();
b=await body();
if(/Anfrage(n)? von Eltern/.test(b)) ok("Der Trainer sieht die Eltern-Anfrage"); else fail("Keine Eltern-Anfrage beim Trainer: "+b.slice(0,260).replace(/\n/g," | "));
if(/dauerhaft merken gewünscht/.test(b)) ok("Mit dem Wunsch „dauerhaft merken“");
if(/Annehmen & dauerhaft merken/.test(b)&&/Ablehnen/.test(b)) ok("Annehmen und Ablehnen stehen bereit");
else fail("Knöpfe fehlen beim Angebot");
await clickTxt("Annehmen & dauerhaft merken"); await page.waitForTimeout(1600);
{ const erg=await page.evaluate(()=>{
    const d=JSON.parse(localStorage.getItem("vereinsapp_v14")||"null");
    const r=(d.aushilfeReqs||[]).find(x=>x.art==="angebot")||{};
    const p=(d.playerProfiles||[]).find(x=>x.name==="Ben Fischer")||{};
    return { status:r.status, opt:p.optTids||[] }; });
  if(erg.status==="ok") ok("Die Anfrage ist angenommen");
  else fail("Status falsch: "+erg.status);
  if(erg.opt.includes("demo_g")) ok("Und das Kind ist dauerhaft als Aushilfe hinterlegt ("+erg.opt.join(", ")+")");
  else fail("optTids nicht gesetzt: "+JSON.stringify(erg.opt)); }
b=await body();
if(!/Anfrage(n)? von Eltern/.test(b)) ok("Der Hinweis verschwindet nach der Entscheidung");

if(errors.length){ console.log("JS-FEHLER:"); [...new Set(errors)].forEach(e=>console.log(" -",e.slice(0,150))); }
console.log(errors.length||fails.length?`ERGEBNIS: ${fails.length} Fehlschläge, ${errors.length} JS-Fehler`:"ERGEBNIS: ALLES OK");
await browser.close(); srv.close();
process.exit(errors.length||fails.length?1:0);
