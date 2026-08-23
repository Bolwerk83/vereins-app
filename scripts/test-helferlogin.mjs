// E2E-Test: Der Weg vom "Neuer Helfer" bis zum ersten Login muss halten -
// auch wenn der Helfer das Einmal-Passwort klein tippt, ein Leerzeichen
// mitkopiert oder der Trainer den Zugang nur geteilt (nicht gespeichert) hat.
// Aufruf: npm run build && node scripts/test-helferlogin.mjs
import { chromium } from "playwright-core";
import http from "http"; import fs from "fs"; import path from "path";
const dist = path.resolve("dist");
const srv = http.createServer((req,res)=>{ let p=path.join(dist,req.url.split("?")[0]); if(!fs.existsSync(p)||fs.statSync(p).isDirectory()) p=path.join(dist,"index.html"); res.setHeader("content-type",{".html":"text/html",".js":"text/javascript",".css":"text/css"}[path.extname(p)]||"text/plain"); res.end(fs.readFileSync(p)); }).listen(4229);
const exe=process.env.PLAYWRIGHT_CHROMIUM||"/opt/pw-browsers/chromium-1194/chrome-linux/chrome";
const browser = await chromium.launch({ executablePath:exe, args:["--no-sandbox"] });
const page = await browser.newPage({ viewport:{ width:390, height:900 } });
const errors=[]; const fails=[];
page.on("pageerror", e=>errors.push(e.message));
page.on("dialog", d=>d.accept());
const fail=m=>{ fails.push(m); console.log("FEHLGESCHLAGEN:", m); };
const ok=m=>console.log("OK:", m);
const body=()=>page.evaluate(()=>document.body.innerText);
const clickTxt=re=>page.evaluate(r=>{ const b=[...document.querySelectorAll("button")].find(x=>new RegExp(r).test(x.innerText)); if(!b) return false; b.click(); return true; },re instanceof RegExp?re.source:re);
const dismiss=async()=>{ for(let k=0;k<14;k++){ const done=await page.evaluate(()=>{
  const fx=[...document.querySelectorAll("div")].filter(d=>getComputedStyle(d).position==="fixed"&&d.querySelector("button")&&d.innerText.length>30);
  for(const f of fx){ if(/Willkommen!/.test(f.innerText)){ const w=[...f.querySelectorAll("button")].pop(); if(w){ w.click(); return false; } }
    const b2=[...f.querySelectorAll("button")].find(x=>/geht|Los|Verstanden|Alles klar|Start|Jetzt nicht|Fertig|Speichern & loslegen|Weiter →|Überspringen/i.test(x.innerText)); if(b2){ b2.click(); return false; } }
  return true; }); await page.waitForTimeout(450); if(done) break; } };
// Trainer legt einen Helfer an und liest das Einmal-Passwort ab
const legeHelferAn = async (name, teilenStattSpeichern) => {
  await page.locator('button:has-text("Mehr")').last().click(); await page.waitForTimeout(600);
  await page.locator('button:has-text("Helfer")').last().click(); await page.waitForTimeout(700);
  await page.locator('button:has-text("+ Neuer Helfer")').click(); await page.waitForTimeout(500);
  await page.locator('input[placeholder*="Maria"]').fill(name); await page.waitForTimeout(250);
  const pw=await page.evaluate(()=>{ const sp=[...document.querySelectorAll("span")].find(x=>x.style.fontFamily==="monospace"&&/^[A-Z0-9]{6}$/.test(x.textContent.trim())); return sp?sp.textContent.trim():null; });
  if(teilenStattSpeichern){
    await clickTxt("Zugang teilen"); await page.waitForTimeout(800);
    await page.keyboard.press("Escape").catch(()=>{});
    await page.evaluate(()=>{ const x=[...document.querySelectorAll("button")].find(y=>/^(✕|Abbrechen)$/.test(y.innerText.trim())); x&&x.click(); });
  } else {
    await page.locator('button:has-text("Speichern")').last().click();
  }
  await page.waitForTimeout(800);
  await page.keyboard.press("Escape").catch(()=>{}); await page.waitForTimeout(400);
  return pw;
};
// Helfer-Login mit einem beliebig geschriebenen Passwort
const helferLogin = async (name, pwEingabe) => {
  await page.evaluate(()=>{ const b=[...document.querySelectorAll("button")].find(x=>/^(Abmelden|Logout)$/.test(x.innerText.trim())); b&&b.click(); });
  await page.waitForTimeout(1200);
  await page.getByText("Turnier & Spieltag unterstützen").click(); await page.waitForTimeout(900);
  await page.evaluate(()=>{ const cards=[...document.querySelectorAll("div")].filter(d=>String(d.className).includes("up")&&/\d+ Helfer/.test(d.innerText)&&d.innerText.length<120); cards[0]&&cards[0].click(); });
  await page.waitForTimeout(700);
  if((await body()).includes("Welcher Helfer bist du?")){ await page.getByText(name,{exact:false}).first().click(); await page.waitForTimeout(500); }
  await page.locator('input[type="password"]').first().fill(pwEingabe);
  await page.locator('button:has-text("Anmelden")').click(); await page.waitForTimeout(900);
  return await body();
};
await page.addInitScript(()=>{
  localStorage.setItem("vereinsapp_config", JSON.stringify({url:"https://127.0.0.1:1/x", key:"test"}));
  localStorage.setItem("va_simple","0"); localStorage.setItem("va_tsimple","0");   // diese Tests pruefen die ausfuehrliche Ansicht
  if(!sessionStorage.getItem("va_role")) sessionStorage.setItem("vereinsapp_v12_session", JSON.stringify({ role:"trainer", cid:"demo", tids:["demo_f1"], name:"Demo Trainer", id:"demo_tr1" }));
});
await page.goto("http://127.0.0.1:4229/", { waitUntil:"networkidle" }); await page.waitForTimeout(2500);
await page.locator('button:has-text("Überspringen")').first().click({timeout:1500}).catch(()=>{}); await page.waitForTimeout(300);
await dismiss();

// ===== 1) Normalfall: Passwort genau so eingeben =====
const pw1=await legeHelferAn("Erna Exakt", false);
if(pw1) ok("Einmal-Passwort erzeugt ("+pw1+")"); else fail("Kein Einmal-Passwort sichtbar");
let b=await helferLogin("Erna Exakt", pw1);
if(/Passwort speichern & einloggen|Eigenes Passwort/.test(b)) ok("Login mit exakt eingetipptem Einmal-Passwort"); else fail("Exakter Login scheitert: "+b.slice(0,180).replace(/\n/g," | "));
const pws=page.locator('input[type="password"]');
await pws.nth(0).fill("erna1234"); await pws.nth(1).fill("erna1234");
await page.locator('button:has-text("Passwort speichern & einloggen")').click(); await page.waitForTimeout(1500);
await dismiss();
b=await body();
if(/Termine|Ansehen/.test(b)) ok("Eigenes Passwort gesetzt – Helfer ist drin"); else fail("Nach Passwortwechsel nicht eingeloggt");

// ===== 2) Klein getippt =====
await page.evaluate(()=>{ sessionStorage.setItem("va_role","1"); sessionStorage.setItem("vereinsapp_v12_session", JSON.stringify({ role:"trainer", cid:"demo", tids:["demo_f1"], name:"Demo Trainer", id:"demo_tr1" })); });
await page.reload({waitUntil:"networkidle"}); await page.waitForTimeout(2300); await dismiss();
const pw2=await legeHelferAn("Klaus Kleinschreiber", false);
b=await helferLogin("Klaus Kleinschreiber", (pw2||"").toLowerCase());
if(/Passwort speichern & einloggen|Eigenes Passwort/.test(b)) ok("Klein getipptes Einmal-Passwort wird akzeptiert ("+(pw2||"").toLowerCase()+")");
else fail("Kleinschreibung scheitert noch: "+b.slice(0,180).replace(/\n/g," | "));

// ===== 3) Mit mitkopiertem Leerzeichen =====
await page.evaluate(()=>{ sessionStorage.setItem("vereinsapp_v12_session", JSON.stringify({ role:"trainer", cid:"demo", tids:["demo_f1"], name:"Demo Trainer", id:"demo_tr1" })); });
await page.reload({waitUntil:"networkidle"}); await page.waitForTimeout(2300); await dismiss();
const pw3=await legeHelferAn("Lotte Leerzeichen", false);
b=await helferLogin("Lotte Leerzeichen", " "+(pw3||"").slice(0,3)+" "+(pw3||"").slice(3)+" ");
if(/Passwort speichern & einloggen|Eigenes Passwort/.test(b)) ok("Leerzeichen im Passwort stören nicht");
else fail("Leerzeichen lassen den Login scheitern: "+b.slice(0,180).replace(/\n/g," | "));

// ===== 4) Trainer hat nur geteilt, nicht gespeichert =====
await page.evaluate(()=>{ sessionStorage.setItem("vereinsapp_v12_session", JSON.stringify({ role:"trainer", cid:"demo", tids:["demo_f1"], name:"Demo Trainer", id:"demo_tr1" })); });
await page.reload({waitUntil:"networkidle"}); await page.waitForTimeout(2300); await dismiss();
const pw4=await legeHelferAn("Timo Teiler", true);
if(pw4) ok("Zugang über „Teilen“ weitergegeben ("+pw4+")"); else fail("Kein Passwort beim Teilen");
b=await helferLogin("Timo Teiler", pw4);
if(/Passwort speichern & einloggen|Eigenes Passwort/.test(b)) ok("Auch ein nur geteilter Zugang funktioniert (Teilen speichert mit)");
else fail("Geteilter Zugang funktioniert nicht: "+b.slice(0,180).replace(/\n/g," | "));

// ===== 5) Falsches Passwort: verständliche Meldung =====
await page.evaluate(()=>{ sessionStorage.setItem("vereinsapp_v12_session", JSON.stringify({ role:"trainer", cid:"demo", tids:["demo_f1"], name:"Demo Trainer", id:"demo_tr1" })); });
await page.reload({waitUntil:"networkidle"}); await page.waitForTimeout(2300); await dismiss();
b=await helferLogin("Timo Teiler", "XXXXXX");
if(/Passwort falsch/.test(b)&&/Groß- und Kleinschreibung/.test(b)) ok("Falsches Passwort: verständliche Meldung mit Hinweis"); else fail("Fehlermeldung unklar: "+b.slice(0,200).replace(/\n/g," | "));

if(errors.length){ console.log("JS-FEHLER:"); [...new Set(errors)].forEach(e=>console.log(" -",e.slice(0,150))); }
console.log(errors.length||fails.length?`ERGEBNIS: ${fails.length} Fehlschläge, ${errors.length} JS-Fehler`:"ERGEBNIS: ALLES OK");
await browser.close(); srv.close();
process.exit(errors.length||fails.length?1:0);
