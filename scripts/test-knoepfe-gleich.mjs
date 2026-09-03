// E2E-Test: Knöpfe, die dasselbe tun sollen, müssen auch dasselbe tun.
// Verglichen werden jeweils die einfache und die vollständige Ansicht:
//   1. Trainer: "Bin dabei" / "Sage ab" (nach Ablauf der Frist)
//   2. Eltern:  "dabei" / "JA" (nach Ablauf der Frist -> Grund-Abfrage)
//   3. Helfer:  "Ich helfe" auf der Karte und im Termin
// Aufruf: npm run build && node scripts/test-knoepfe-gleich.mjs
import { chromium } from "playwright-core";
import http from "http"; import fs from "fs"; import path from "path";
const dist = path.resolve("dist");
const srv = http.createServer((req,res)=>{ let p=path.join(dist,req.url.split("?")[0]); if(!fs.existsSync(p)||fs.statSync(p).isDirectory()) p=path.join(dist,"index.html"); res.setHeader("content-type",{".html":"text/html",".js":"text/javascript",".css":"text/css"}[path.extname(p)]||"text/plain"); res.end(fs.readFileSync(p)); }).listen(4279);
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
// Knopf per exaktem/teilweisem Text klicken – meldet, ob es einen gab
const klick=(re)=>page.evaluate(r=>{
  const b=[...document.querySelectorAll("button")].find(x=>new RegExp(r).test((x.innerText||"").trim()));
  if(!b||b.disabled) return false; b.click(); return true;
}, re instanceof RegExp?re.source:re);
const knopfDa=(re)=>page.evaluate(r=>{
  const b=[...document.querySelectorAll("button")].find(x=>new RegExp(r).test((x.innerText||"").trim()));
  return b?{txt:(b.innerText||"").trim(),aus:!!b.disabled}:null;
}, re instanceof RegExp?re.source:re);

await page.addInitScript(()=>{
  if(!localStorage.getItem("vereinsapp_config")) localStorage.setItem("vereinsapp_config", JSON.stringify({url:"https://127.0.0.1:1/x", key:"test"}));
});
// Zustand des Termins lesen bzw. setzen
const evLesen = (wer) => page.evaluate(w=>{
  const d=JSON.parse(localStorage.getItem("vereinsapp_v14")||"null"); if(!d) return null;
  const ev=(d.events||[]).filter(e=>e.cid==="demo"&&e.tid==="demo_f1"&&(e.pt==="att"||!e.pt))
    .sort((a,b)=>String(a.date||"").localeCompare(String(b.date||"")))[0];
  if(!ev) return null;
  const v=(ev.votes||{})[w];
  return { stimme: v==null?null:(typeof v==="object"?{...v}:{val:v}),
           helfer: [...(ev.helperOffers||[]),...(ev.helperInterest||[])].map(o=>o.id) };
}, wer);
const stimmeWeg = (wer) => page.evaluate(w=>{
  const d=JSON.parse(localStorage.getItem("vereinsapp_v14")||"null");
  const ev=(d.events||[]).filter(e=>e.cid==="demo"&&e.tid==="demo_f1"&&(e.pt==="att"||!e.pt))
    .sort((a,b)=>String(a.date||"").localeCompare(String(b.date||"")))[0];
  const v={...(ev.votes||{})}; delete v[w]; ev.votes=v;
  localStorage.setItem("vereinsapp_v14", JSON.stringify(d));
}, wer);
// Nur die Felder vergleichen, die gleich sein müssen (ohne Zeitstempel)
const form = (st) => st ? JSON.stringify({ val:st.val, grund:!!st.reason, spaet:!!st.lateChange,
  freigabeNoetig:!!st.needsOk, schonEntschieden:!!st.okAt, rolle:st.role||null }) : "keine Stimme";

// ===== Ausgangslage: Trainer anmelden, Frist auf gestern =====
await page.goto("http://127.0.0.1:4279/", { waitUntil:"networkidle" }); await page.waitForTimeout(2500);
await page.evaluate(()=>{ localStorage.setItem("va_simple","0"); localStorage.setItem("va_tsimple","0");
  sessionStorage.setItem("vereinsapp_v12_session", JSON.stringify({role:"trainer",cid:"demo",tids:["demo_f1"],name:"Demo Trainer",id:"demo_tr1"})); });
await page.reload({waitUntil:"networkidle"}); await page.waitForTimeout(2600); await dismiss();
await page.evaluate(()=>{ const b=[...document.querySelectorAll("button")].find(x=>/Bin dabei/.test(x.innerText)); b&&b.click(); });
await page.waitForTimeout(1500);
const kind = await page.evaluate(()=>{
  const d=JSON.parse(localStorage.getItem("vereinsapp_v14")||"null"); if(!d) return null;
  const ev=(d.events||[]).filter(e=>e.cid==="demo"&&e.tid==="demo_f1"&&(e.pt==="att"||!e.pt))
    .sort((a,b)=>String(a.date||"").localeCompare(String(b.date||"")))[0]; if(!ev) return null;
  const g=new Date(Date.now()-86400000); const pad=x=>String(x).padStart(2,"0");
  ev.deadline={date:`${g.getFullYear()}-${pad(g.getMonth()+1)}-${pad(g.getDate())}`,time:"18:00"};
  const kader=[...new Set([...((d.players||{})["demo_f1"]||[]),
    ...((d.playerProfiles||[]).filter(pp=>pp.mainTid==="demo_f1"&&!pp.archived).map(pp=>pp.name))])];
  const hs=(d.helpers||[]).filter(h=>h.id!=="hx");
  d.helpers=[...hs,{id:"hx",cid:"demo",name:"Hilde Helfer",tids:["demo_f1"]}];
  ev.helperOffers=(ev.helperOffers||[]).filter(o=>o.id!=="hx");
  ev.helperInterest=(ev.helperInterest||[]).filter(o=>o.id!=="hx");
  localStorage.setItem("vereinsapp_v14", JSON.stringify(d));
  return kader[0]||null;
});
if(kind) ok("Ausgangslage steht – Frist ist abgelaufen, Testkind: "+kind);
else fail("Konnte die Ausgangslage nicht setzen");

// ===== 1) Trainer: „Bin dabei“ in beiden Ansichten =====
const trainerLauf = async (einfach) => {
  await stimmeWeg("Demo Trainer");
  await page.evaluate(e=>{ localStorage.setItem("va_tsimple", e?"1":"0"); }, einfach);
  await page.reload({waitUntil:"networkidle"}); await page.waitForTimeout(2600); await dismiss();
  const k=await knopfDa("^(✓ )?(Bin dabei|Späte Anmeldung)$");
  const geklickt=await klick("^(✓ )?(Bin dabei|Späte Anmeldung)$");
  await page.waitForTimeout(1500);
  const st=(await evLesen("Demo Trainer"))?.stimme||null;
  return { knopf:k, geklickt, form:form(st) };
};
const trVoll   = await trainerLauf(false);
const trEinfach= await trainerLauf(true);
if(trVoll.geklickt) ok("Vollständige Ansicht: Zusage-Knopf ist bedienbar („"+trVoll.knopf.txt+"“)");
else fail("Vollständige Ansicht: kein bedienbarer Zusage-Knopf: "+JSON.stringify(trVoll.knopf));
if(trEinfach.geklickt) ok("Einfache Ansicht: Zusage-Knopf ist bedienbar („"+trEinfach.knopf.txt+"“)");
else fail("Einfache Ansicht: kein bedienbarer Zusage-Knopf: "+JSON.stringify(trEinfach.knopf));
if(trVoll.form===trEinfach.form&&/"val":"yes"/.test(trVoll.form))
  ok("Beide speichern dasselbe: "+trVoll.form);
else fail("Trainer-Zusage unterschiedlich – voll: "+trVoll.form+" / einfach: "+trEinfach.form);
if(trVoll.knopf&&trEinfach.knopf&&trVoll.knopf.txt.replace(/^✓ /,"")===trEinfach.knopf.txt.replace(/^✓ /,""))
  ok("Und die Knöpfe heißen gleich: „"+trEinfach.knopf.txt+"“");
else fail("Unterschiedliche Beschriftung: „"+(trVoll.knopf||{}).txt+"“ vs. „"+(trEinfach.knopf||{}).txt+"“");

// ===== 2) Trainer: „Sage ab“ nach Frist – beide Ansichten verlangen einen Grund =====
const absageLauf = async (einfach) => {
  await stimmeWeg("Demo Trainer");
  await page.evaluate(e=>{ localStorage.setItem("va_tsimple", e?"1":"0"); }, einfach);
  await page.reload({waitUntil:"networkidle"}); await page.waitForTimeout(2600); await dismiss();
  const k=await knopfDa("^(✕ )?(Sage ab|Späte Absage)$");
  await klick("^(✕ )?(Sage ab|Späte Absage)$");
  await page.waitForTimeout(1500);
  const st=(await evLesen("Demo Trainer"))?.stimme||null;
  const txt=await body();
  return { knopf:k, form:form(st), hinweis:/nur mit Grund/.test(txt), termin:/Rückmeldungen|Abstimmungs-Frist/.test(txt) };
};
const abVoll   = await absageLauf(false);
const abEinfach= await absageLauf(true);
if(abVoll.form==="keine Stimme"&&abEinfach.form==="keine Stimme")
  ok("Absage nach Frist wird in beiden Ansichten nicht stillschweigend gespeichert");
else fail("Absage ohne Grund gespeichert – voll: "+abVoll.form+" / einfach: "+abEinfach.form);
if(abVoll.hinweis&&abEinfach.hinweis) ok("Beide sagen, dass ein Grund nötig ist");
else fail("Hinweis fehlt – voll: "+abVoll.hinweis+" / einfach: "+abEinfach.hinweis);
if(abVoll.termin&&abEinfach.termin) ok("Und beide öffnen dafür den Termin");
else fail("Termin wird nicht geöffnet – voll: "+abVoll.termin+" / einfach: "+abEinfach.termin);
if(abVoll.knopf&&abEinfach.knopf&&abVoll.knopf.txt.replace(/^✕ /,"")===abEinfach.knopf.txt.replace(/^✕ /,""))
  ok("Auch die Absage-Knöpfe heißen gleich: „"+abEinfach.knopf.txt+"“");
else fail("Unterschiedliche Beschriftung: „"+(abVoll.knopf||{}).txt+"“ vs. „"+(abEinfach.knopf||{}).txt+"“");

// ===== 3) Eltern: Zusage nach Frist in beiden Ansichten =====
const elternLauf = async (einfach) => {
  await stimmeWeg(kind);
  await page.evaluate(({e,k})=>{ localStorage.setItem("va_simple", e?"1":"0");
    sessionStorage.setItem("vereinsapp_v12_session", JSON.stringify({role:"user",cid:"demo",tid:"demo_f1",name:k,user:k})); }, {e:einfach,k:kind});
  await page.reload({waitUntil:"networkidle"}); await page.waitForTimeout(2800); await dismiss();
  // "dabei" antippen (Karte in der vollen Ansicht, JA in der einfachen)
  if(einfach) await klick("^✅ JA$");
  else await page.evaluate(()=>{ const s=[...document.querySelectorAll("span")].find(x=>/ist dabei|Ich bin dabei/.test((x.innerText||"").trim()));
    s&&s.parentElement&&s.parentElement.parentElement&&s.parentElement.parentElement.click(); });
  await page.waitForTimeout(1200);
  const gefragt=/frühere Anmeldung nicht möglich/i.test(await body());
  const zwischen=(await evLesen(kind))?.stimme||null;
  await klick("^War krank$");
  await page.waitForTimeout(1500);
  const st=(await evLesen(kind))?.stimme||null;
  return { gefragt, ohneGrund:form(zwischen), form:form(st) };
};
const elVoll   = await elternLauf(false);
const elEinfach= await elternLauf(true);
if(elVoll.gefragt&&elEinfach.gefragt) ok("Beide Eltern-Ansichten fragen zuerst nach dem Grund");
else fail("Grund-Abfrage fehlt – voll: "+elVoll.gefragt+" / einfach: "+elEinfach.gefragt);
if(elVoll.ohneGrund==="keine Stimme"&&elEinfach.ohneGrund==="keine Stimme") ok("Und speichern vorher nichts");
else fail("Ohne Grund gespeichert – voll: "+elVoll.ohneGrund+" / einfach: "+elEinfach.ohneGrund);
if(elVoll.form===elEinfach.form&&/"val":"yes"/.test(elVoll.form)&&/"grund":true/.test(elVoll.form))
  ok("Beide speichern dasselbe: "+elVoll.form);
else fail("Eltern-Zusage unterschiedlich – voll: "+elVoll.form+" / einfach: "+elEinfach.form);
if(/"freigabeNoetig":true/.test(elVoll.form)) ok("In beiden Fällen muss der Trainer freigeben");
else fail("Freigabe-Merker fehlt: "+elVoll.form);

// ===== 4) Helfer: Karte und Termin =====
const helferAn = async (imTermin) => {
  await page.evaluate(()=>{
    const d=JSON.parse(localStorage.getItem("vereinsapp_v14")||"null");
    const ev=(d.events||[]).filter(e=>e.cid==="demo"&&e.tid==="demo_f1"&&(e.pt==="att"||!e.pt))
      .sort((a,b)=>String(a.date||"").localeCompare(String(b.date||"")))[0];
    ev.helperOffers=(ev.helperOffers||[]).filter(o=>o.id!=="hx");
    ev.helperInterest=(ev.helperInterest||[]).filter(o=>o.id!=="hx");
    localStorage.setItem("vereinsapp_v14", JSON.stringify(d));
    localStorage.setItem("va_simple","0");
    sessionStorage.setItem("vereinsapp_v12_session", JSON.stringify({role:"helper",cid:"demo",id:"hx",helperId:"hx",name:"Hilde Helfer",tids:["demo_f1"]}));
  });
  await page.reload({waitUntil:"networkidle"}); await page.waitForTimeout(2800); await dismiss();
  if(imTermin){
    await page.evaluate(()=>{ const b=[...document.querySelectorAll("button")].find(x=>/^(Ansehen|✅ Anwesenheit)$/.test((x.innerText||"").trim())); b&&b.click(); });
    await page.waitForTimeout(1500);
  }
  const k=await knopfDa("^(🙋 )?(Ich helfe!|Ich kann helfen|Ich helfe mit)$");
  const geklickt=await klick("^(🙋 )?(Ich helfe!|Ich kann helfen|Ich helfe mit)$");
  await page.waitForTimeout(1500);
  const drin=((await evLesen("Demo Trainer"))?.helfer||[]).includes("hx");
  return { knopf:k, geklickt, drin };
};
const hKarte  = await helferAn(false);
const hTermin = await helferAn(true);
if(hKarte.geklickt&&hKarte.drin) ok("Helfer-Zusage auf der Karte klappt („"+hKarte.knopf.txt+"“)");
else fail("Helfer-Zusage auf der Karte klappt nicht: "+JSON.stringify(hKarte));
if(hTermin.geklickt&&hTermin.drin) ok("Helfer-Zusage im Termin klappt („"+hTermin.knopf.txt+"“)");
else fail("Helfer-Zusage im Termin klappt nicht: "+JSON.stringify(hTermin));
if(hKarte.drin===hTermin.drin) ok("Beide Wege führen zum selben Ergebnis");
else fail("Karte und Termin führen zu unterschiedlichen Ergebnissen");

// ===== 5) Helfer: Zusage zurückziehen – Karte und Termin =====
const helferAb = async (imTermin) => {
  await page.evaluate(()=>{
    const d=JSON.parse(localStorage.getItem("vereinsapp_v14")||"null");
    const ev=(d.events||[]).filter(e=>e.cid==="demo"&&e.tid==="demo_f1"&&(e.pt==="att"||!e.pt))
      .sort((a,b)=>String(a.date||"").localeCompare(String(b.date||"")))[0];
    const rein=(ev.helperOffers||[]).filter(o=>o.id!=="hx");
    ev.helperOffers=[...rein,{id:"hx",name:"Hilde Helfer",ts:new Date().toISOString()}];
    localStorage.setItem("vereinsapp_v14", JSON.stringify(d));
    sessionStorage.setItem("vereinsapp_v12_session", JSON.stringify({role:"helper",cid:"demo",id:"hx",helperId:"hx",name:"Hilde Helfer",tids:["demo_f1"]}));
  });
  await page.reload({waitUntil:"networkidle"}); await page.waitForTimeout(2800); await dismiss();
  if(imTermin){
    await page.evaluate(()=>{ const b=[...document.querySelectorAll("button")].find(x=>/^(Ansehen|✅ Anwesenheit)$/.test((x.innerText||"").trim())); b&&b.click(); });
    await page.waitForTimeout(1500);
  }
  const k=await knopfDa("^(Doch nicht|Zurückziehen|Doch nicht dabei)$");
  const geklickt=await klick("^(Doch nicht|Zurückziehen|Doch nicht dabei)$");
  await page.waitForTimeout(1500);
  const drin=((await evLesen("Demo Trainer"))?.helfer||[]).includes("hx");
  return { knopf:k, geklickt, drin };
};
const abKarte  = await helferAb(false);
const abTermin = await helferAb(true);
if(abKarte.geklickt&&!abKarte.drin) ok("Zurückziehen auf der Karte klappt („"+abKarte.knopf.txt+"“)");
else fail("Zurückziehen auf der Karte klappt nicht: "+JSON.stringify(abKarte));
if(abTermin.geklickt&&!abTermin.drin) ok("Zurückziehen im Termin klappt („"+abTermin.knopf.txt+"“)");
else fail("Zurückziehen im Termin klappt nicht: "+JSON.stringify(abTermin));

// ===== 6) Eltern, einfache Liste: „absagen“ an einem beantworteten Termin =====
// Der zweite Termin (steht in der Liste, nicht oben gross) bekommt eine
// abgelaufene Frist und eine Zusage - "absagen" muss dort nach dem Grund fragen.
const zweiter = await page.evaluate(k=>{
  const d=JSON.parse(localStorage.getItem("vereinsapp_v14")||"null");
  const evs=(d.events||[]).filter(e=>e.cid==="demo"&&e.tid==="demo_f1"&&(e.pt==="att"||!e.pt))
    .sort((a,b)=>String(a.date||"").localeCompare(String(b.date||"")));
  const ev=evs[1]; if(!ev) return null;
  const g=new Date(Date.now()-86400000); const pad=x=>String(x).padStart(2,"0");
  ev.deadline={date:`${g.getFullYear()}-${pad(g.getMonth()+1)}-${pad(g.getDate())}`,time:"18:00"};
  ev.votes={...(ev.votes||{}), [k]:{val:"yes",ts:new Date().toISOString(),role:"player"}};
  localStorage.setItem("vereinsapp_v14", JSON.stringify(d));
  localStorage.setItem("va_simple","1");
  sessionStorage.setItem("vereinsapp_v12_session", JSON.stringify({role:"user",cid:"demo",tid:"demo_f1",name:k,user:k}));
  return ev.id;
}, kind);
await page.reload({waitUntil:"networkidle"}); await page.waitForTimeout(2800); await dismiss();
if(!zweiter) fail("Kein zweiter Termin für die Gegenprobe");
else {
  // In der Liste heisst der Weg "absagen", auf einer grossen Karte "Ändern" -
  // beide muessen in dieselbe Grund-Abfrage fuehren.
  const geklickt=await page.evaluate(()=>{
    const b=[...document.querySelectorAll("button")].find(x=>["absagen","Ändern"].includes((x.innerText||"").trim()));
    if(!b) return false; b.click(); return true; });
  await page.waitForTimeout(1400);
  const txt=await body();
  const st=await page.evaluate(({k,id})=>{
    const d=JSON.parse(localStorage.getItem("vereinsapp_v14")||"null");
    const ev=(d.events||[]).find(e=>e.id===id); const v=ev&&(ev.votes||{})[k];
    return v==null?null:(typeof v==="object"?{...v}:{val:v}); }, {k:kind,id:zweiter});
  if(!geklickt) fail("Kein Weg zum Ändern der Antwort");
  else if(/Antwort ändern/.test(txt)&&/❌ NEIN/.test(txt)) ok("Der Änderungs-Weg öffnet die Antwort-Knöpfe");
  else fail("Antwort lässt sich nicht ändern: "+txt.slice(0,220).replace(/\n/g," | "));
  if(st&&st.val==="yes") ok("Die Zusage bleibt dabei erst einmal bestehen");
  else fail("Zusage wurde ohne Grund verworfen: "+JSON.stringify(st));
  await klick("^❌ NEIN$"); await page.waitForTimeout(1300);
  const txt2=await body();
  if(/warum absagen/i.test(txt2)) ok("Und dort wird wie überall nach dem Grund gefragt");
  else fail("Keine Grund-Abfrage nach „NEIN“: "+txt2.slice(0,220).replace(/\n/g," | "));
  const st2=await page.evaluate(({k,id})=>{
    const d=JSON.parse(localStorage.getItem("vereinsapp_v14")||"null");
    const ev=(d.events||[]).find(e=>e.id===id); const v=ev&&(ev.votes||{})[k];
    return v==null?null:(typeof v==="object"?{...v}:{val:v}); }, {k:kind,id:zweiter});
  if(st2&&st2.val==="yes") ok("Ohne Grund wird die Absage nicht gespeichert");
  else fail("Absage ohne Grund gespeichert: "+JSON.stringify(st2));
}

if(errors.length){ console.log("JS-FEHLER:"); [...new Set(errors)].forEach(e=>console.log(" -",e.slice(0,150))); }
console.log(errors.length||fails.length?`ERGEBNIS: ${fails.length} Fehlschläge, ${errors.length} JS-Fehler`:"ERGEBNIS: ALLES OK");
await browser.close(); srv.close();
process.exit(errors.length||fails.length?1:0);
