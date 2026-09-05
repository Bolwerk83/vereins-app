// E2E-Test: Der Trainer sieht auch beim TURNIER, wer zu- oder abgesagt hat
// und wer noch nicht abgestimmt hat. Vorher stand im Reiter „Rückmeldungen“
// eines Turniers nur die Turnier-Planung – ohne eine einzige Namensliste.
// Aufruf: npm run build && node scripts/test-turnier-rueckmeldungen.mjs
import { chromium } from "playwright-core";
import http from "http"; import fs from "fs"; import path from "path";
const dist = path.resolve("dist");
const srv = http.createServer((req,res)=>{ let p=path.join(dist,req.url.split("?")[0]); if(!fs.existsSync(p)||fs.statSync(p).isDirectory()) p=path.join(dist,"index.html"); res.setHeader("content-type",{".html":"text/html",".js":"text/javascript",".css":"text/css"}[path.extname(p)]||"text/plain"); res.end(fs.readFileSync(p)); }).listen(4289);
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
await page.addInitScript(()=>{ if(!localStorage.getItem("vereinsapp_config")) localStorage.setItem("vereinsapp_config", JSON.stringify({url:"https://127.0.0.1:1/x", key:"test"})); });
await page.goto("http://127.0.0.1:4289/", { waitUntil:"networkidle" }); await page.waitForTimeout(2500);
await page.evaluate(()=>{ localStorage.setItem("va_simple","0"); localStorage.setItem("va_tsimple","0");
  sessionStorage.setItem("vereinsapp_v12_session", JSON.stringify({role:"trainer",cid:"demo",tids:["demo_f1"],name:"Demo Trainer",id:"demo_tr1"})); });
await page.reload({waitUntil:"networkidle"}); await page.waitForTimeout(2600); await dismiss();
await page.evaluate(()=>{ const b=[...document.querySelectorAll("button")].find(x=>/Bin dabei/.test(x.innerText)); b&&b.click(); });
await page.waitForTimeout(1500);

// Ein Turnier als nächster Termin: einer zugesagt, einer abgesagt, Rest offen
const kader = await page.evaluate(()=>{
  const d=JSON.parse(localStorage.getItem("vereinsapp_v14")||"null"); if(!d) return null;
  const p=v=>String(v).padStart(2,"0"); const tg=n=>{const x=new Date(Date.now()+n*86400000);return `${x.getFullYear()}-${p(x.getMonth()+1)}-${p(x.getDate())}`;};
  const evs=(d.events||[]).filter(e=>e.cid==="demo"&&e.tid==="demo_f1"&&(e.pt==="att"||!e.pt))
    .sort((a,b)=>String(a.date).localeCompare(String(b.date)));
  if(!evs.length) return null;
  const k=[...new Set([...((d.players||{})["demo_f1"]||[]),
    ...((d.playerProfiles||[]).filter(pp=>pp.mainTid==="demo_f1"&&!pp.archived).map(pp=>pp.name))])];
  if(k.length<3) return null;
  const ts=new Date().toISOString();
  Object.assign(evs[0],{ type:"turnier", date:tg(2), time:"09:30", endTime:"12:00",
    title:"Kinderfestival", loc:"Halle", note:"", deadline:null,
    votes:{ [k[0]]:{val:"yes",ts,role:"player"}, [k[1]]:{val:"no",ts,role:"player",reason:"Krank"} } });
  // die anderen Termine nach hinten, damit das Turnier oben steht
  evs.slice(1).forEach(e=>{ e.date=tg(12); });
  localStorage.setItem("vereinsapp_v14", JSON.stringify(d));
  return {ja:k[0], nein:k[1], offen:k[2], alle:k};
});
if(kader) ok(`Turnier angelegt: ${kader.ja} sagt zu, ${kader.nein} sagt ab, ${kader.offen} hat noch nicht geantwortet`);
else fail("Konnte das Turnier nicht anlegen");
await page.reload({waitUntil:"networkidle"}); await page.waitForTimeout(2800); await dismiss();

// Turnier öffnen, Reiter „Rückmeldungen“
await page.evaluate(()=>{ const b=[...document.querySelectorAll("button")].find(x=>/^(Ansehen|✅ Anwesenheit)$/.test((x.innerText||"").trim())); b&&b.click(); });
await page.waitForTimeout(1500);
let b=await body();
if(/Kinderfestival/.test(b)) ok("Das Turnier ist geöffnet"); else fail("Turnier nicht geöffnet: "+b.slice(0,240).replace(/\n/g," | "));
await page.evaluate(()=>{ const x=[...document.querySelectorAll("button")].find(y=>/^(📊 Rückmeldungen|Rückmeldungen)$/.test((y.innerText||"").trim())); x&&x.click(); });
await page.waitForTimeout(1000);
b=await body();

// 1) Die Zahlen
if(/Spieler dabei/.test(b)&&/Abgesagt/.test(b)&&/Fehlt noch/.test(b)) ok("Die drei Zahlen stehen da: dabei / abgesagt / fehlt noch");
else fail("Keine Zahlen im Rückmeldungen-Reiter: "+b.slice(0,320).replace(/\n/g," | "));
if(/Ruecklauf|Rücklauf/.test(b)) ok("Mit Rücklauf-Quote"); else fail("Keine Rücklauf-Anzeige");

// 2) Die Namen mit Status
{ const liste=await page.evaluate(()=>{
    const t=document.body.innerText;
    const i=t.indexOf("Anwesenheit abhaken");
    return i<0?null:t.slice(i,i+900).replace(/\n/g," · "); });
  if(liste) ok("Die Namensliste ist da");
  else fail("Keine Namensliste („Anwesenheit abhaken“) beim Turnier");
  if(liste&&new RegExp(kader.ja.replace(/[.*+?^${}()|[\]\\]/g,"\\$&")).test(liste)&&/zugesagt/.test(liste))
    ok(`Wer zugesagt hat, steht drin (${kader.ja})`);
  else fail("Zusage fehlt in der Liste: "+String(liste).slice(0,240));
  if(liste&&new RegExp(kader.nein.replace(/[.*+?^${}()|[\]\\]/g,"\\$&")).test(liste)&&/abgesagt/.test(liste))
    ok(`Wer abgesagt hat, steht drin (${kader.nein})`);
  else fail("Absage fehlt in der Liste: "+String(liste).slice(0,240));
  if(liste&&new RegExp(kader.offen.replace(/[.*+?^${}()|[\]\\]/g,"\\$&")).test(liste))
    ok(`Und wer noch nicht geantwortet hat, steht auch drin (${kader.offen})`);
  else fail("Offene fehlen in der Liste: "+String(liste).slice(0,240)); }

// 3) Der Trainer kann direkt eintragen
{ const knoepfe=await page.evaluate(k=>{
    // die Zeile des Spielers finden und ihre Knoepfe lesen
    const zeilen=[...document.querySelectorAll("div")].filter(d=>(d.innerText||"").includes(k)&&d.querySelectorAll("button").length>=2&&(d.innerText||"").replace(/\s+/g," ").trim().length<80);
    const z=zeilen[zeilen.length-1]; if(!z) return null;
    return [...z.querySelectorAll("button")].map(x=>(x.innerText||"").trim()); }, kader.offen);
  if(knoepfe&&knoepfe.length>=2) ok("Beim Offenen kann der Trainer direkt zu- oder absagen ("+knoepfe.join(" ")+")");
  else fail("Keine Eintrag-Knöpfe beim Offenen: "+JSON.stringify(knoepfe)); }

// 4) Die Turnier-Planung ist weiterhin da
if(/TURNIER-PLANUNG/.test(b)) ok("Die Turnier-Planung steht weiterhin darunter");
else fail("Turnier-Planung verschwunden");
if(/Info/.test(b)&&/Timer/.test(b)) ok("Mit ihren eigenen Reitern (Info … Timer)"); else fail("Turnier-Reiter fehlen");

if(errors.length){ console.log("JS-FEHLER:"); [...new Set(errors)].forEach(e=>console.log(" -",e.slice(0,150))); }
console.log(errors.length||fails.length?`ERGEBNIS: ${fails.length} Fehlschläge, ${errors.length} JS-Fehler`:"ERGEBNIS: ALLES OK");
await browser.close(); srv.close();
process.exit(errors.length||fails.length?1:0);
