// E2E-Test: Die Namen in „Anwesenheit abhaken" müssen lesbar sein.
// Gemeldet: „Bei Anwesenheit abhaken kann ich die Namen nicht richtig
// lesen." Gemessen: Der Name teilte sich die Zeile mit Status, Leibchen und
// Zeitstempel und bekam auf einem 390-px-Handy nur 17–21 px – sichtbar war
// der erste Buchstabe.
//   1. Der Name steht allein in der ersten Zeile und wird nicht abgeschnitten.
//   2. Auch ein langer Name bleibt vollständig lesbar (bricht um statt zu kappen).
//   3. Die Schrift ist groß genug.
//   4. Status, Leibchen und Zeit stehen darunter – nicht neben dem Namen.
//   5. Die Zeile bleibt antippbar (Anwesenheit setzen).
// Aufruf: npm run build && node scripts/test-anwesenheit-lesbar.mjs
import { chromium } from "playwright-core";
import http from "http"; import fs from "fs"; import path from "path";
const dist = path.resolve("dist");
const srv = http.createServer((req,res)=>{ let p=path.join(dist,req.url.split("?")[0]); if(!fs.existsSync(p)||fs.statSync(p).isDirectory()) p=path.join(dist,"index.html"); res.setHeader("content-type",{".html":"text/html",".js":"text/javascript",".css":"text/css"}[path.extname(p)]||"text/plain"); res.end(fs.readFileSync(p)); }).listen(4345);
// Chromium-Pfad nicht festnageln: der Container hat die Version schon
// zweimal gewechselt (1194 -> 1243, dazu anderer Unterordner) und dann
// scheitert JEDER Test am Start. Erster Treffer gewinnt.
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
const kurz=t=>String(t).slice(0,300).replace(/\n/g," | ");
const dismiss=async()=>{ for(let k=0;k<12;k++){ const done=await page.evaluate(()=>{
  const fx=[...document.querySelectorAll("div")].filter(d=>getComputedStyle(d).position==="fixed"&&d.querySelector("button")&&d.innerText.length>30);
  for(const f of fx){ const b=[...f.querySelectorAll("button")].find(x=>/geht|Los|Verstanden|Alles klar|Fertig|Jetzt nicht|Weiter →|Überspringen|Start/i.test(x.innerText)); if(b){ b.click(); return false; } }
  return true; }); await page.waitForTimeout(400); if(done) break; } };

await page.addInitScript(()=>{
  if(!localStorage.getItem("vereinsapp_config")) localStorage.setItem("vereinsapp_config", JSON.stringify({url:"https://127.0.0.1:1/x", key:"test"}));
  if(localStorage.getItem("va_simple")===null)  localStorage.setItem("va_simple","0");
  if(localStorage.getItem("va_tsimple")===null) localStorage.setItem("va_tsimple","0");
});
await page.goto("http://127.0.0.1:4345/", { waitUntil:"networkidle" }); await page.waitForTimeout(2500);
await page.evaluate(()=>{ sessionStorage.setItem("vereinsapp_v12_session", JSON.stringify({role:"trainer",cid:"demo",tids:["demo_f1"],name:"Demo Trainer",id:"demo_tr1"})); });
await page.reload({waitUntil:"networkidle"}); await page.waitForTimeout(2600); await dismiss();
await page.evaluate(()=>{ const b=[...document.querySelectorAll("button")].find(x=>/Bin dabei/.test(x.innerText)); b&&b.click(); });
await page.waitForTimeout(1400);

// Training mit allen Merkern gleichzeitig: Zusage, Verspätung, Absage,
// Leibchen (Leistungsgruppen) und ein bewusst langer Name.
const LANG = "Anne-Christin Freudenberger";
const setup = await page.evaluate(lang=>{
  const d=JSON.parse(localStorage.getItem("vereinsapp_v14")||"null");
  const z=x=>String(x).padStart(2,"0");
  const x=new Date(); x.setHours(12,0,0,0); x.setDate(x.getDate()+2);
  const prof=(d.playerProfiles||[]).filter(p=>p.mainTid==="demo_f1"&&!p.archived);
  // Genug Kinder für zwei Spielchen-Mannschaften, damit Leibchen entstehen
  let i=1; const namen=prof.map(p=>p.name);
  while(namen.length<12){ const n="Kind "+i;
    d.playerProfiles.push({id:"pp_les"+i,cid:"demo",archived:false,name:n,by:2017,gender:"m",
      mainTid:"demo_f1",optTids:[],friends:[],mustWith:[],intGrp:"g1"});
    namen.push(n); i++; }
  // Erstes Kind bekommt den langen Namen
  const erster=prof[0];
  d.playerProfiles=(d.playerProfiles||[]).map(p=>p.id===erster.id?{...p,name:lang,intGrp:"g1"}:p);
  const liste=namen.map(n=>n===erster.name?lang:n);
  (d.playerProfiles||[]).filter(p=>p.mainTid==="demo_f1").forEach(p=>{ if(!p.intGrp) p.intGrp="g1"; });
  const ev=(d.events||[]).filter(e=>e.cid==="demo"&&e.tid==="demo_f1")[0];
  const ts=new Date().toISOString();
  Object.assign(ev,{ type:"training", date:`${x.getFullYear()}-${z(x.getMonth()+1)}-${z(x.getDate())}`,
    time:"17:30", endTime:"19:00", title:"Training", deadline:null, spielFest:null, spielGr:null, present:{},
    votes:Object.fromEntries(liste.map((n,k)=>[n,{val:k===1?"no":"yes",ts,role:"player",...(k===2?{late:15}:{})}])) });
  (d.events||[]).filter(e=>e.cid==="demo"&&e.id!==ev.id).forEach(e=>{ const y=new Date(); y.setDate(y.getDate()+40);
    e.date=`${y.getFullYear()}-${z(y.getMonth()+1)}-${z(y.getDate())}`; });
  localStorage.setItem("vereinsapp_v14", JSON.stringify(d));
  return { lang, zweiter:liste[1], dritter:liste[2], anzahl:liste.length };
}, LANG);
if(setup) ok(`Training mit ${setup.anzahl} Kindern, langem Namen, Zusage, Verspätung und Absage`);
else { fail("Testdaten nicht gesetzt"); process.exit(1); }

await page.reload({waitUntil:"networkidle"}); await page.waitForTimeout(2800); await dismiss();
await page.evaluate(()=>{ const b=[...document.querySelectorAll("button")].find(x=>/^(Ansehen|✅ Anwesenheit)$/.test((x.innerText||"").trim())); b&&b.click(); });
await page.waitForTimeout(1800);

// Die Abhak-Karte und darin die Namens-Elemente
const mass=(name)=>page.evaluate(n=>{
  const karten=[...document.querySelectorAll("div")].filter(d=>{ const t=d.innerText||"";
    return t.includes("Anwesenheit abhaken")&&t.includes("Hake ab, wer wirklich"); });
  const karte=karten[karten.length-1]; if(!karte) return null;
  const el=[...karte.querySelectorAll("span")].find(s=>s.children.length===0&&(s.textContent||"").trim()===n);
  if(!el) return null;
  const r=el.getBoundingClientRect(); const st=getComputedStyle(el);
  // Merker in derselben Zeile? (gleiche Oberkante, rechts vom Namen)
  const merker=[...karte.querySelectorAll("span,button")].filter(s=>{
    const t=(s.textContent||"").trim();
    if(!/^(zugesagt|abgesagt|No-Show|\+\d+ Min später|🎽)/.test(t)) return false;
    const q=s.getBoundingClientRect();
    return Math.abs(q.top-r.top)<8 && q.left>r.left;
  }).length;
  return { breite:Math.round(r.width), schrift:parseFloat(st.fontSize),
           abgeschnitten: el.scrollWidth>el.clientWidth+1,
           sichtbar: (el.textContent||"").trim(), merkerDaneben:merker,
           karte: Math.round(karte.getBoundingClientRect().width) }; }, name);

// ===== 1-3) Name lesbar =====
{ const m=await mass(setup.lang);
  if(!m) { fail("Der lange Name steht nicht in der Liste"); }
  else {
    if(!m.abgeschnitten) ok(`Der lange Name „${setup.lang}" ist vollständig lesbar`);
    else fail("Name wird abgeschnitten – genau die Beschwerde");
    if(m.breite>=150) ok(`Er hat ${m.breite} px Platz (Karte ${m.karte} px)`);
    else fail("Zu wenig Platz für den Namen: "+m.breite+" px");
    if(m.schrift>=15) ok(`Die Schrift ist ${m.schrift} px groß`);
    else fail("Schrift zu klein: "+m.schrift+" px");
  } }

// ===== 4) Merker stehen nicht neben dem Namen =====
{ const a=await mass(setup.zweiter), b2=await mass(setup.dritter);
  const summe=(a?.merkerDaneben||0)+(b2?.merkerDaneben||0);
  if(summe===0) ok("Status, Leibchen und Zeit stehen unter dem Namen, nicht daneben");
  else fail("Merker drängen den Namen weiter weg: "+summe); }
{ const sichtbar=await page.evaluate(([n1,n2])=>{
    const t=document.body.innerText; const i=t.indexOf("Anwesenheit abhaken");
    const liste=t.slice(i, i+2000);
    return { lang:liste.includes(n1), zweiter:liste.includes(n2),
             zugesagt:/zugesagt/.test(liste), leibchen:/🎽/.test(liste) }; }, [setup.lang,setup.zweiter]);
  if(sichtbar.lang&&sichtbar.zweiter) ok("Alle Namen stehen vollständig in der Liste");
  else fail("Namen fehlen: "+JSON.stringify(sichtbar));
  if(sichtbar.zugesagt&&sichtbar.leibchen) ok("Und die Merker sind weiter da – nichts ist verloren gegangen");
  else fail("Merker fehlen: "+JSON.stringify(sichtbar)); }

// ===== 5) Zeile bleibt antippbar =====
{ const vorher=await page.evaluate(()=>{ const d=JSON.parse(localStorage.getItem("vereinsapp_v14")||"null");
    const ev=(d.events||[]).filter(e=>e.cid==="demo"&&e.tid==="demo_f1")[0];
    return Object.keys(ev.present||{}).length; });
  const geklickt=await page.evaluate(n=>{
    const karten=[...document.querySelectorAll("div")].filter(d=>{ const t=d.innerText||"";
      return t.includes("Anwesenheit abhaken")&&t.includes("Hake ab, wer wirklich"); });
    const karte=karten[karten.length-1]; if(!karte) return false;
    const zeile=[...karte.querySelectorAll("div")].filter(d=>(d.innerText||"").includes(n)&&d.style.cursor==="pointer")
      .sort((a,b)=>(a.innerText||"").length-(b.innerText||"").length)[0];
    if(!zeile) return false; zeile.click(); return true; }, setup.lang);
  if(geklickt) ok("Die Zeile lässt sich antippen"); else fail("Zeile nicht antippbar");
  await page.waitForTimeout(1300);
  const nachher=await page.evaluate(()=>{ const d=JSON.parse(localStorage.getItem("vereinsapp_v14")||"null");
    const ev=(d.events||[]).filter(e=>e.cid==="demo"&&e.tid==="demo_f1")[0];
    return Object.keys(ev.present||{}).length; });
  if(nachher===vorher+1) ok("Und setzt die Anwesenheit – die Bedienung ist unverändert");
  else fail(`Anwesenheit nicht gesetzt (${vorher} → ${nachher})`); }

if(errors.length){ console.log("JS-FEHLER:"); [...new Set(errors)].forEach(e=>console.log(" -",e.slice(0,150))); }
console.log(errors.length||fails.length?`ERGEBNIS: ${fails.length} Fehlschläge, ${errors.length} JS-Fehler`:"ERGEBNIS: ALLES OK");
await browser.close(); srv.close();
process.exit(errors.length||fails.length?1:0);
