// E2E-Test: Ein Termin mit mehreren Abstimmungen.
//   1. Die Eltern sehen ALLE Fragen – auch die Fahrgemeinschaft und
//      zusätzliche Auswahllisten, nicht nur "kommt mein Kind?".
//   2. Erledigt ist der Termin erst, wenn alle PFLICHT-Fragen beantwortet
//      sind; freiwillige (z.B. "Wer bringt Kuchen mit?") blockieren nicht.
//   3. Die Nachricht des Trainers steht auf der großen Karte vollständig da.
// Aufruf: npm run build && node scripts/test-mehrere-umfragen.mjs
import { chromium } from "playwright-core";
import http from "http"; import fs from "fs"; import path from "path";
const dist = path.resolve("dist");
const srv = http.createServer((req,res)=>{ let p=path.join(dist,req.url.split("?")[0]); if(!fs.existsSync(p)||fs.statSync(p).isDirectory()) p=path.join(dist,"index.html"); res.setHeader("content-type",{".html":"text/html",".js":"text/javascript",".css":"text/css"}[path.extname(p)]||"text/plain"); res.end(fs.readFileSync(p)); }).listen(4283);
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
  const b=[...document.querySelectorAll("button")].find(x=>new RegExp(r).test((x.innerText||"").trim()));
  if(!b||b.disabled) return false; b.click(); return true; }, re instanceof RegExp?re.source:re);
const dismiss=async()=>{ for(let k=0;k<12;k++){ const done=await page.evaluate(()=>{
  const fx=[...document.querySelectorAll("div")].filter(d=>getComputedStyle(d).position==="fixed"&&d.querySelector("button")&&d.innerText.length>30);
  for(const f of fx){ const b=[...f.querySelectorAll("button")].find(x=>/geht|Los|Verstanden|Alles klar|Fertig|Jetzt nicht|Weiter →|Überspringen|Start/i.test(x.innerText)); if(b){ b.click(); return false; } }
  return true; }); await page.waitForTimeout(400); if(done) break; } };
const NOTIZ="Unser erstes Spiel! Bitte so schnell wie möglich antworten – zusagen oder absagen. Danach bitte auch die Fahrgemeinschaft eintragen, wir brauchen genug Autos.";
const evLesen = (wer) => page.evaluate(w=>{
  const d=JSON.parse(localStorage.getItem("vereinsapp_v14")||"null"); if(!d) return null;
  const ev=(d.events||[]).find(e=>e.id==="ev_multi_test"); if(!ev) return null;
  return { stimme:(ev.votes||{})[w]||null, fahrt:(ev.carpool||{})[w]||null,
           listen:(ev.extraPolls||[]).map(p=>({titel:p.title,opt:!!p.opt,antwort:(p.votes||{})[w]||null})) };
}, wer);

await page.addInitScript(()=>{
  if(!localStorage.getItem("vereinsapp_config")) localStorage.setItem("vereinsapp_config", JSON.stringify({url:"https://127.0.0.1:1/x", key:"test"}));
});
await page.goto("http://127.0.0.1:4283/", { waitUntil:"networkidle" }); await page.waitForTimeout(2500);
await page.evaluate(()=>{ localStorage.setItem("va_simple","0"); localStorage.setItem("va_tsimple","0");
  sessionStorage.setItem("vereinsapp_v12_session", JSON.stringify({role:"trainer",cid:"demo",tids:["demo_f1"],name:"Demo Trainer",id:"demo_tr1"})); });
await page.reload({waitUntil:"networkidle"}); await page.waitForTimeout(2600); await dismiss();
await page.evaluate(()=>{ const b=[...document.querySelectorAll("button")].find(x=>/Bin dabei/.test(x.innerText)); b&&b.click(); });
await page.waitForTimeout(1500);

// Auswärtsspiel mit drei Fragen: Anwesenheit + Fahrgemeinschaft (Pflicht)
// + Kuchenliste (freiwillig).
const kind = await page.evaluate(n=>{
  const d=JSON.parse(localStorage.getItem("vereinsapp_v14")||"null"); if(!d) return null;
  const vorlage=(d.events||[]).find(e=>e.cid==="demo"&&e.tid==="demo_f1"&&(e.pt==="att"||!e.pt)); if(!vorlage) return null;
  const kader=[...new Set([...((d.players||{})["demo_f1"]||[]),
    ...((d.playerProfiles||[]).filter(pp=>pp.mainTid==="demo_f1"&&!pp.archived).map(pp=>pp.name))])];
  const wer=kader[0]; if(!wer) return null;
  const x=new Date(Date.now()+2*86400000); const p=v=>String(v).padStart(2,"0");
  const rest=(d.events||[]).filter(e=>e.id!=="ev_multi_test");
  d.events=[...rest,{ ...vorlage, id:"ev_multi_test", title:"Auswärtsspiel Test", type:"auswarts",
    date:`${x.getFullYear()}-${p(x.getMonth()+1)}-${p(x.getDate())}`, time:"09:30", endTime:"12:00",
    note:n, pt:"att", carpoolExtra:true, carpoolOpt:false, carpool:{}, votes:{}, deadline:null,
    extraPolls:[{id:"ep_kuchen",title:"Wer bringt Kuchen mit?",selType:"multi",opt:true,votes:{},
      items:[{id:"k1",txt:"Kuchen",max:null},{id:"k2",txt:"Getränke",max:null}]}] }];
  localStorage.setItem("vereinsapp_v14", JSON.stringify(d));
  return wer;
}, NOTIZ);
if(kind) ok("Termin mit drei Fragen angelegt (Kind: "+kind+")");
else fail("Konnte den Testtermin nicht anlegen");

// ===== Eltern, einfache Ansicht =====
await page.evaluate(k=>{ localStorage.setItem("va_simple","1");
  sessionStorage.setItem("vereinsapp_v12_session", JSON.stringify({role:"user",cid:"demo",tid:"demo_f1",name:k,user:k})); }, kind);
await page.reload({waitUntil:"networkidle"}); await page.waitForTimeout(2800); await dismiss();
// Den Testtermin groß machen
await page.evaluate(()=>{ const d=[...document.querySelectorAll("div")].find(x=>/Auswärtsspiel Test/.test(x.innerText||"")); });
let b=await body();
if(/Fahrgemeinschaft/.test(b)) ok("Die Fahrgemeinschaft ist in der einfachen Ansicht sichtbar");
else fail("Fahrgemeinschaft fehlt in der einfachen Ansicht: "+b.slice(0,320).replace(/\n/g," | "));
if(/PFLICHT/.test(b)) ok("Und ist als Pflicht gekennzeichnet"); else fail("Keine Pflicht-Kennzeichnung");
if(/Wer bringt Kuchen mit\?/.test(b)) ok("Die Kuchenliste steht ebenfalls da");
else fail("Kuchenliste fehlt: "+b.slice(0,320).replace(/\n/g," | "));
if(/freiwillig/.test(b)) ok("Sie ist als freiwillig gekennzeichnet"); else fail("Keine Freiwillig-Kennzeichnung");
// Nachricht vollständig?
if(b.includes("wir brauchen genug Autos")) ok("Die Nachricht des Trainers steht vollständig da");
else fail("Nachricht ist abgeschnitten: "+(b.match(/Unser erstes Spiel[^\n]*/)||[""])[0]);

// Nur die Anwesenheit beantworten -> Termin bleibt offen
await klick("^✅ JA$"); await page.waitForTimeout(1500);
b=await body();
{ const st=await evLesen(kind);
  if(st&&st.stimme) ok("Die Zusage ist gespeichert"); else fail("Zusage nicht gespeichert: "+JSON.stringify(st)); }
if(/noch offen|Noch zu beantworten|Noch \d+ Frage/i.test(b)) ok("Der Termin gilt weiter als offen – die Fahrgemeinschaft fehlt");
else fail("Kein Hinweis auf die offene Pflicht-Frage: "+b.slice(0,320).replace(/\n/g," | "));
if(!/Alles beantwortet/.test(b)) ok("Und es steht nicht „Alles beantwortet“ da");
else fail("„Alles beantwortet“ obwohl die Fahrgemeinschaft fehlt");

// Fahrgemeinschaft beantworten
{ const geklickt=await klick("^Komme selbst$");
  if(geklickt) ok("Die Fahrgemeinschaft lässt sich direkt hier beantworten");
  else fail("Kein Knopf „Komme selbst“ in der einfachen Ansicht");
  await page.waitForTimeout(1500); }
{ const st=await evLesen(kind);
  if(st&&st.fahrt) ok("Die Antwort zur Fahrgemeinschaft ist gespeichert ("+st.fahrt+")");
  else fail("Fahrgemeinschaft nicht gespeichert: "+JSON.stringify(st)); }
b=await body();
if(/Alles beantwortet/.test(b)) ok("Jetzt gilt der Termin als erledigt – die Kuchenliste blockiert nicht");
else fail("Termin gilt trotz aller Pflicht-Antworten nicht als erledigt: "+b.slice(-320).replace(/\n/g," | "));

// ===== Gegenprobe: ausführliche Ansicht zeigt dasselbe =====
await page.evaluate(k=>{
  const d=JSON.parse(localStorage.getItem("vereinsapp_v14")||"null");
  const ev=(d.events||[]).find(e=>e.id==="ev_multi_test");
  ev.carpool={};                       // Fahrgemeinschaft wieder offen
  localStorage.setItem("vereinsapp_v14", JSON.stringify(d));
  localStorage.setItem("va_simple","0");
  localStorage.removeItem("va_teamok_demo_f1");
  sessionStorage.clear();
  sessionStorage.setItem("vereinsapp_v12_session", JSON.stringify({role:"user",cid:"demo",tid:"demo_f1",name:k,user:k}));
}, kind);
await page.goto("http://127.0.0.1:4283/", { waitUntil:"networkidle" }); await page.waitForTimeout(2800); await dismiss();
b=await body();
if(/Noch zu beantworten/.test(b)) ok("Auch die ausführliche Ansicht weist oben auf die offene Frage hin");
else fail("Kein Hinweis in der ausführlichen Ansicht: "+b.slice(0,320).replace(/\n/g," | "));
if(/PFLICHT/.test(b)&&/freiwillig/.test(b)) ok("Und kennzeichnet Pflicht und freiwillig genauso");
else fail("Kennzeichnung fehlt in der ausführlichen Ansicht");

if(errors.length){ console.log("JS-FEHLER:"); [...new Set(errors)].forEach(e=>console.log(" -",e.slice(0,150))); }
console.log(errors.length||fails.length?`ERGEBNIS: ${fails.length} Fehlschläge, ${errors.length} JS-Fehler`:"ERGEBNIS: ALLES OK");
await browser.close(); srv.close();
process.exit(errors.length||fails.length?1:0);
