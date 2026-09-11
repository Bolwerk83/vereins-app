// E2E-Test: „Kinder mit Passwort“ auf der Team-Seite.
//   Die Liste wird selten gebraucht, stand aber weit oben und offen.
//   1. Sie steht zugeklappt da – nur eine Zeile mit der Anzahl.
//   2. Sie steht ganz unten, unterhalb der Kaderliste und des Teilen-Links.
//   3. Ein Tipp klappt sie auf, dort lässt sich das Passwort zurücksetzen.
//   4. Gibt es kein Kind mit Passwort, ist die Zeile gar nicht da.
// Aufruf: npm run build && node scripts/test-kinder-passwort.mjs
import { chromium } from "playwright-core";
import http from "http"; import fs from "fs"; import path from "path";
const dist = path.resolve("dist");
const srv = http.createServer((req,res)=>{ let p=path.join(dist,req.url.split("?")[0]); if(!fs.existsSync(p)||fs.statSync(p).isDirectory()) p=path.join(dist,"index.html"); res.setHeader("content-type",{".html":"text/html",".js":"text/javascript",".css":"text/css"}[path.extname(p)]||"text/plain"); res.end(fs.readFileSync(p)); }).listen(4333);
const exe=process.env.PLAYWRIGHT_CHROMIUM||"/opt/pw-browsers/chromium-1194/chrome-linux/chrome";
const browser = await chromium.launch({ executablePath:exe, args:["--no-sandbox"] });
const page = await browser.newPage({ viewport:{ width:390, height:900 } });
const errors=[]; const fails=[];
page.on("pageerror", e=>errors.push(e.message));
page.on("dialog", d=>d.accept());
const fail=m=>{ fails.push(m); console.log("FEHLGESCHLAGEN:", m); };
const ok=m=>console.log("OK:", m);
const body=()=>page.evaluate(()=>document.body.innerText);
const klick=(re)=>page.evaluate(r=>{
  const b=[...document.querySelectorAll("button")].find(x=>new RegExp(r).test((x.innerText||"").replace(/\s+/g," ").trim()));
  if(!b||b.disabled) return false; b.click(); return true; }, re instanceof RegExp?re.source:re);
const dismiss=async()=>{ for(let k=0;k<12;k++){ const done=await page.evaluate(()=>{
  const fx=[...document.querySelectorAll("div")].filter(d=>getComputedStyle(d).position==="fixed"&&d.querySelector("button")&&d.innerText.length>30);
  for(const f of fx){ const b=[...f.querySelectorAll("button")].find(x=>/geht|Los|Verstanden|Alles klar|Fertig|Jetzt nicht|Weiter →|Überspringen|Start/i.test(x.innerText)); if(b){ b.click(); return false; } }
  return true; }); await page.waitForTimeout(400); if(done) break; } };
const zumKader = async () => {
  await page.evaluate(()=>{ const b=[...document.querySelectorAll("button")].find(x=>(x.innerText||"").trim()==="Team"); b&&b.click(); });
  await page.waitForTimeout(1400); await dismiss();
  await klick("^Spieler$"); await page.waitForTimeout(1400);
};

await page.addInitScript(()=>{
  if(!localStorage.getItem("vereinsapp_config")) localStorage.setItem("vereinsapp_config", JSON.stringify({url:"https://127.0.0.1:1/x", key:"test"}));
  if(localStorage.getItem("va_simple")===null)  localStorage.setItem("va_simple","0");
  if(localStorage.getItem("va_tsimple")===null) localStorage.setItem("va_tsimple","0");
});
await page.goto("http://127.0.0.1:4333/", { waitUntil:"networkidle" }); await page.waitForTimeout(2500);
await page.evaluate(()=>{ sessionStorage.setItem("vereinsapp_v12_session", JSON.stringify({role:"trainer",cid:"demo",tids:["demo_f1"],name:"Demo Trainer",id:"demo_tr1"})); });
await page.reload({waitUntil:"networkidle"}); await page.waitForTimeout(2600); await dismiss();
await page.evaluate(()=>{ const b=[...document.querySelectorAll("button")].find(x=>/Bin dabei/.test(x.innerText)); b&&b.click(); });
await page.waitForTimeout(1500);

// ===== 0) Ohne Passwörter gibt es die Zeile gar nicht =====
await zumKader();
{ const b=await body();
  if(/HAUPTKADER/i.test(b)) ok("Die Kaderliste ist offen");
  else fail("Kader nicht offen: "+b.slice(0,250).replace(/\n/g," | "));
  if(!/Kinder mit Passwort/.test(b)) ok("Ohne gesetzte Passwörter steht die Zeile gar nicht da");
  else fail("Zeile trotz fehlender Passwörter da"); }

// Zwei Kindern ein Passwort setzen
const kinder = await page.evaluate(()=>{
  const d=JSON.parse(localStorage.getItem("vereinsapp_v14")||"null"); if(!d) return null;
  const k=(d.playerProfiles||[]).filter(p=>p.mainTid==="demo_f1"&&!p.archived).slice(0,2);
  if(k.length<2) return null;
  k.forEach(p=>{ const x=(d.playerProfiles||[]).find(y=>y.id===p.id); x.childPw="xxhash"; x.childPwAt=new Date().toISOString(); });
  localStorage.setItem("vereinsapp_v14", JSON.stringify(d));
  return k.map(p=>p.name);
});
if(kinder) ok(`Zwei Kinder haben jetzt ein Passwort: ${kinder.join(", ")}`);
else { fail("Konnte keine Passwörter setzen"); process.exit(1); }
await page.reload({waitUntil:"networkidle"}); await page.waitForTimeout(2800); await dismiss();
await zumKader();

// ===== 1) Zugeklappt =====
let b=await body();
if(/🔑 Kinder mit Passwort \(2\)/.test(b)) ok("Es gibt die Zeile „🔑 Kinder mit Passwort (2)“");
else fail("Keine Zeile: "+b.slice(0,400).replace(/\n/g," | "));
if(!/Zurücksetzen/.test(b)&&!/Haben Eltern ihr Passwort vergessen/.test(b))
  ok("Die Liste selbst ist eingeklappt – kein Erklärtext, keine Zurücksetzen-Knöpfe");
else fail("Liste steht trotzdem offen da");
if(/Passwort zurücksetzen/.test(b)) ok("Die Zeile sagt, wofür man sie aufklappt");
else fail("Kein Hinweis auf der Zeile");

// ===== 2) Ganz unten =====
{ const pos=await page.evaluate(()=>{ const t=document.body.innerText;
    return { pw:t.indexOf("Kinder mit Passwort"), kader:t.search(/HAUPTKADER/i), teilen:t.indexOf("Link") , ende:t.length }; });
  if(pos.pw>pos.kader) ok("Sie steht unterhalb der Kaderliste");
  else fail(`Steht zu weit oben: Passwort bei ${pos.pw}, Kader bei ${pos.kader}`);
  if(pos.ende-pos.pw < 260) ok("Und ganz am Ende der Seite");
  else fail(`Nicht am Ende: noch ${pos.ende-pos.pw} Zeichen danach`); }

// ===== 3) Aufklappen =====
if(await klick("Kinder mit Passwort")) ok("Die Zeile ist anklickbar"); else fail("Zeile nicht klickbar");
await page.waitForTimeout(800);
b=await body();
if(b.includes(kinder[0])&&b.includes(kinder[1])) ok("Aufgeklappt stehen beide Kinder da");
else fail("Kinder fehlen nach dem Aufklappen: "+b.slice(-400).replace(/\n/g," | "));
if(/Haben Eltern ihr Passwort vergessen/.test(b)) ok("Mit der Erklärung, wofür das gut ist");
else fail("Keine Erklärung");
if(/Zurücksetzen/.test(b)) ok("Und den Zurücksetzen-Knöpfen"); else fail("Keine Knöpfe");
if(/▲ Zuklappen/.test(b)) ok("Zuklappen wird angeboten"); else fail("Kein Zuklappen");

// ===== 4) Zurücksetzen wirkt =====
await page.evaluate(()=>{ const b=[...document.querySelectorAll("button")].find(x=>(x.innerText||"").trim()==="Zurücksetzen"); b&&b.click(); });
await page.waitForTimeout(1500);
{ const rest=await page.evaluate(()=>{
    const d=JSON.parse(localStorage.getItem("vereinsapp_v14")||"null");
    return (d.playerProfiles||[]).filter(p=>p.mainTid==="demo_f1"&&p.childPw).length; });
  if(rest===1) ok("Ein Passwort ist zurückgesetzt, das andere bleibt");
  else fail("Falsche Zahl übrig: "+rest); }
b=await body();
if(/Kinder mit Passwort \(1\)/.test(b)) ok("Die Zeile zählt sofort richtig weiter");
else fail("Zähler stimmt nicht: "+b.slice(-300).replace(/\n/g," | "));

if(errors.length){ console.log("JS-FEHLER:"); [...new Set(errors)].forEach(e=>console.log(" -",e.slice(0,150))); }
console.log(errors.length||fails.length?`ERGEBNIS: ${fails.length} Fehlschläge, ${errors.length} JS-Fehler`:"ERGEBNIS: ALLES OK");
await browser.close(); srv.close();
process.exit(errors.length||fails.length?1:0);
