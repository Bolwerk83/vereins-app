// E2E-Test: Der Trainer kann in der Abhak-Liste einen Absage-Grund
// hinterlegen – etwa wenn die Eltern angerufen, aber nichts in der App
// eingetragen haben. Der Grund ist freiwillig und steht danach in der Liste.
// Aufruf: npm run build && node scripts/test-absagegrund.mjs
import { chromium } from "playwright-core";
import http from "http"; import fs from "fs"; import path from "path";
const dist = path.resolve("dist");
const srv = http.createServer((req,res)=>{ let p=path.join(dist,req.url.split("?")[0]); if(!fs.existsSync(p)||fs.statSync(p).isDirectory()) p=path.join(dist,"index.html"); res.setHeader("content-type",{".html":"text/html",".js":"text/javascript",".css":"text/css"}[path.extname(p)]||"text/plain"); res.end(fs.readFileSync(p)); }).listen(4295);
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
const klick=(re)=>page.evaluate(r=>{
  const b=[...document.querySelectorAll("button")].find(x=>new RegExp(r).test((x.innerText||"").trim()));
  if(!b) return false; b.click(); return true; }, re instanceof RegExp?re.source:re);
const stimme=(n)=>page.evaluate(k=>{
  const d=JSON.parse(localStorage.getItem("vereinsapp_v14")||"null");
  const ev=(d.events||[]).filter(e=>e.cid==="demo"&&e.tid==="demo_f1").sort((a,b)=>String(a.date).localeCompare(String(b.date)))[0];
  const v=ev&&(ev.votes||{})[k]; return v==null?null:(typeof v==="object"?{...v}:{val:v}); }, n);
const liste=()=>page.evaluate(()=>{ const t=document.body.innerText; const i=t.indexOf("Anwesenheit abhaken"); return i<0?null:t.slice(i,i+1200); });

await page.addInitScript(()=>{ if(!localStorage.getItem("vereinsapp_config")) localStorage.setItem("vereinsapp_config", JSON.stringify({url:"https://127.0.0.1:1/x", key:"test"})); });
await page.goto("http://127.0.0.1:4295/", { waitUntil:"networkidle" }); await page.waitForTimeout(2500);
await page.evaluate(()=>{ localStorage.setItem("va_simple","0"); localStorage.setItem("va_tsimple","0");
  sessionStorage.setItem("vereinsapp_v12_session", JSON.stringify({role:"trainer",cid:"demo",tids:["demo_f1"],name:"Demo Trainer",id:"demo_tr1"})); });
await page.reload({waitUntil:"networkidle"}); await page.waitForTimeout(2600); await dismiss();
await page.evaluate(()=>{ const b=[...document.querySelectorAll("button")].find(x=>/Bin dabei/.test(x.innerText)); b&&b.click(); });
await page.waitForTimeout(1500);

// Training mit zwei offenen Kindern und einer Absage ohne Grund
const k = await page.evaluate(()=>{
  const d=JSON.parse(localStorage.getItem("vereinsapp_v14")||"null"); if(!d) return null;
  const p=v=>String(v).padStart(2,"0"); const tg=n=>{const x=new Date(Date.now()+n*86400000);return `${x.getFullYear()}-${p(x.getMonth()+1)}-${p(x.getDate())}`;};
  const evs=(d.events||[]).filter(e=>e.cid==="demo"&&e.tid==="demo_f1").sort((a,b)=>String(a.date).localeCompare(String(b.date)));
  if(!evs.length) return null;
  const kader=[...new Set([...((d.players||{})["demo_f1"]||[]),
    ...((d.playerProfiles||[]).filter(pp=>pp.mainTid==="demo_f1"&&!pp.archived).map(pp=>pp.name))])];
  if(kader.length<2) return null;
  Object.assign(evs[0],{ type:"training", date:tg(2), time:"17:30", endTime:"19:00", title:"Training",
    loc:"Sportplatz", note:"", deadline:null, carpoolExtra:false, carpoolEnabled:false, extraPolls:[], duties:[],
    votes:{ [kader[1]]:{val:"no",ts:new Date().toISOString(),role:"player"} } });
  evs.slice(1).forEach(e=>{ e.date=tg(12); });
  localStorage.setItem("vereinsapp_v14", JSON.stringify(d));
  return {offen:kader[0], abgesagt:kader[1]};
});
if(k) ok(`Testdaten: ${k.offen} hat nicht abgestimmt, ${k.abgesagt} hat ohne Grund abgesagt`);
else fail("Konnte die Testdaten nicht setzen");
await page.reload({waitUntil:"networkidle"}); await page.waitForTimeout(2800); await dismiss();
await page.evaluate(()=>{ const b=[...document.querySelectorAll("button")].find(x=>/^(Ansehen|✅ Anwesenheit)$/.test((x.innerText||"").trim())); b&&b.click(); });
await page.waitForTimeout(1500);

// ===== 1) Für ein Kind ohne Antwort absagen – mit Grund =====
{ const geklickt=await page.evaluate(n=>{
    const zeilen=[...document.querySelectorAll("div")].filter(d=>(d.innerText||"").includes(n)&&d.querySelectorAll("button").length>=2&&(d.innerText||"").replace(/\s+/g," ").trim().length<80);
    const z=zeilen[zeilen.length-1]; if(!z) return false;
    const b=[...z.querySelectorAll("button")].find(x=>(x.innerText||"").trim()==="✕"); if(!b) return false; b.click(); return true; }, k.offen);
  if(geklickt) ok("Der ✕-Knopf ist da"); else fail("Kein ✕-Knopf beim offenen Kind"); }
await page.waitForTimeout(700);
let b=await body();
if(new RegExp("Warum ist "+k.offen.split(" ")[0]+" nicht dabei").test(b)) ok("Es wird nach dem Grund gefragt: "+(b.match(/Warum ist [^\n]*/)||[""])[0]);
else fail("Keine Grund-Abfrage: "+b.slice(0,300).replace(/\n/g," | "));
if(/\(freiwillig\)/.test(b)) ok("Und der Grund ist ausdrücklich freiwillig"); else fail("Kein Hinweis „freiwillig“");
{ const chips=await page.evaluate(()=>[...document.querySelectorAll("button")].map(x=>(x.innerText||"").trim()).filter(t=>["Krank","Urlaub","Schule","Verletzt","Wettkampf","Familie"].includes(t)));
  if(chips.length>=5) ok("Mit Schnellgründen: "+chips.join(", ")); else fail("Zu wenige Schnellgründe: "+JSON.stringify(chips)); }
{ const st=await stimme(k.offen);
  if(!st) ok("Vor der Auswahl wird nichts gespeichert"); else fail("Vorschnell gespeichert: "+JSON.stringify(st)); }
await klick("^Krank$"); await page.waitForTimeout(1400);
{ const st=await stimme(k.offen);
  if(st&&st.val==="no"&&st.reason==="Krank") ok("Absage samt Grund gespeichert: "+st.reason);
  else fail("Nicht gespeichert: "+JSON.stringify(st));
  if(st&&st.byTrainer) ok("Und ist als Trainer-Eintrag gekennzeichnet"); else fail("Kein Trainer-Merker"); }
{ const L=await liste();
  if(L&&/Grund: Krank/.test(L)) ok("Der Grund steht in der Liste: "+(L.match(/Grund: [^\n]*/)||[""])[0]);
  else fail("Grund fehlt in der Liste: "+String(L).slice(0,240).replace(/\n/g," | ")); }

// ===== 2) Bei einer bestehenden Absage den Grund nachtragen =====
{ const geklickt=await page.evaluate(n=>{
    const zeilen=[...document.querySelectorAll("div")].filter(d=>(d.innerText||"").includes(n)&&(d.innerText||"").replace(/\s+/g," ").trim().length<120);
    for(const z of zeilen.reverse()){ const b=[...z.querySelectorAll("button")].find(x=>/^abgesagt/.test((x.innerText||"").trim())); if(b){ b.click(); return true; } }
    return false; }, k.abgesagt);
  if(geklickt) ok("Auch eine bestehende Absage lässt sich antippen"); else fail("Absage-Feld nicht antippbar"); }
await page.waitForTimeout(700);
b=await body();
if(new RegExp("Warum ist "+k.abgesagt.split(" ")[0]+" nicht dabei").test(b)) ok("Und fragt nach dem Grund");
else fail("Keine Grund-Abfrage bei bestehender Absage: "+b.slice(0,300).replace(/\n/g," | "));
{ await page.evaluate(()=>{ const i=[...document.querySelectorAll("input")].find(x=>/Eigener Grund/.test(x.placeholder||"")); if(i){ const set=Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype,"value").set; set.call(i,"Zahnarzt"); i.dispatchEvent(new Event("input",{bubbles:true})); } });
  await page.waitForTimeout(300);
  await klick("^Speichern$"); await page.waitForTimeout(1400);
  const st=await stimme(k.abgesagt);
  if(st&&st.reason==="Zahnarzt") ok("Eigener Grund gespeichert: "+st.reason); else fail("Eigener Grund nicht gespeichert: "+JSON.stringify(st)); }

// ===== 3) Ohne Angabe geht auch =====
{ await page.evaluate(n=>{
    const zeilen=[...document.querySelectorAll("div")].filter(d=>(d.innerText||"").includes(n)&&(d.innerText||"").replace(/\s+/g," ").trim().length<140);
    for(const z of zeilen.reverse()){ const b=[...z.querySelectorAll("button")].find(x=>/^abgesagt/.test((x.innerText||"").trim())); if(b){ b.click(); return true; } }
    return false; }, k.abgesagt);
  await page.waitForTimeout(700);
  await klick("^Ohne Angabe absagen$"); await page.waitForTimeout(1400);
  const st=await stimme(k.abgesagt);
  if(st&&st.val==="no"&&!st.reason) ok("„Ohne Angabe absagen“ löscht den Grund wieder");
  else fail("Grund bleibt trotz „ohne Angabe“: "+JSON.stringify(st)); }

if(errors.length){ console.log("JS-FEHLER:"); [...new Set(errors)].forEach(e=>console.log(" -",e.slice(0,150))); }
console.log(errors.length||fails.length?`ERGEBNIS: ${fails.length} Fehlschläge, ${errors.length} JS-Fehler`:"ERGEBNIS: ALLES OK");
await browser.close(); srv.close();
process.exit(errors.length||fails.length?1:0);
