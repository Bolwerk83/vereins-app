// E2E-Test: Beim Abhaken der Anwesenheit sieht und ändert man beides -
// die Leistungsgruppe und das Leibchen fürs heutige Spielchen.
//   1. In jeder Zeile steht die Leistungsgruppe als antippbarer Chip.
//   2. Ein Tipp öffnet die Auswahl, ein zweiter setzt sie – ohne Umweg
//      über die Team-Seite.
//   3. Bei jedem Zugesagten steht, welches Leibchen er heute trägt.
//   4. Das Leibchen stimmt mit der Einteilung im Spielchen überein.
//   5. Wer auf der Auswechselbank sitzt, steht als „Bank“ da.
// Aufruf: npm run build && node scripts/test-anwesenheit-gruppe.mjs
import { chromium } from "playwright-core";
import http from "http"; import fs from "fs"; import path from "path";
const dist = path.resolve("dist");
const srv = http.createServer((req,res)=>{ let p=path.join(dist,req.url.split("?")[0]); if(!fs.existsSync(p)||fs.statSync(p).isDirectory()) p=path.join(dist,"index.html"); res.setHeader("content-type",{".html":"text/html",".js":"text/javascript",".css":"text/css"}[path.extname(p)]||"text/plain"); res.end(fs.readFileSync(p)); }).listen(4325);
const exe=process.env.PLAYWRIGHT_CHROMIUM||"/opt/pw-browsers/chromium-1194/chrome-linux/chrome";
const browser = await chromium.launch({ executablePath:exe, args:["--no-sandbox"] });
const page = await browser.newPage({ viewport:{ width:390, height:900 } });
page.setDefaultTimeout(10000);
const errors=[]; const fails=[];
page.on("pageerror", e=>errors.push(e.message));
page.on("dialog", d=>d.accept());
const fail=m=>{ fails.push(m); console.log("FEHLGESCHLAGEN:", m); };
const ok=m=>console.log("OK:", m);
const body=()=>page.evaluate(()=>document.body.innerText);
const kurz=t=>String(t).slice(0,300).replace(/\n/g," | ");
const klick=(re)=>page.evaluate(r=>{
  const b=[...document.querySelectorAll("button")].find(x=>new RegExp(r).test((x.innerText||"").replace(/\s+/g," ").trim()));
  if(!b||b.disabled) return false; b.click(); return true; }, re instanceof RegExp?re.source:re);
const dismiss=async()=>{ for(let k=0;k<12;k++){ const done=await page.evaluate(()=>{
  const fx=[...document.querySelectorAll("div")].filter(d=>getComputedStyle(d).position==="fixed"&&d.querySelector("button")&&d.innerText.length>30);
  for(const f of fx){ const b=[...f.querySelectorAll("button")].find(x=>/geht|Los|Verstanden|Alles klar|Fertig|Jetzt nicht|Weiter →|Überspringen|Start/i.test(x.innerText)); if(b){ b.click(); return false; } }
  return true; }); await page.waitForTimeout(400); if(done) break; } };

await page.addInitScript(()=>{
  if(!localStorage.getItem("vereinsapp_config")) localStorage.setItem("vereinsapp_config", JSON.stringify({url:"https://127.0.0.1:1/x", key:"test"}));
  if(localStorage.getItem("va_simple")===null)  localStorage.setItem("va_simple","0");
  if(localStorage.getItem("va_tsimple")===null) localStorage.setItem("va_tsimple","0");
});
await page.goto("http://127.0.0.1:4325/", { waitUntil:"networkidle" }); await page.waitForTimeout(2500);
await page.evaluate(()=>{ sessionStorage.setItem("vereinsapp_v12_session", JSON.stringify({role:"trainer",cid:"demo",tids:["demo_f1"],name:"Demo Trainer",id:"demo_tr1"})); });
await page.reload({waitUntil:"networkidle"}); await page.waitForTimeout(2600); await dismiss();
await page.evaluate(()=>{ const b=[...document.querySelectorAll("button")].find(x=>/Bin dabei/.test(x.innerText)); b&&b.click(); });
await page.waitForTimeout(1400);

// 13 Zusagen: 6 Leistung, 6 Entwicklung, einer ohne Gruppe
const setup = await page.evaluate(()=>{
  const d=JSON.parse(localStorage.getItem("vereinsapp_v14")||"null");
  const p=v=>String(v).padStart(2,"0");
  const tg=n=>{ const x=new Date(Date.now()+n*86400000); return `${x.getFullYear()}-${p(x.getMonth()+1)}-${p(x.getDate())}`; };
  const vorhanden=(d.playerProfiles||[]).filter(q=>q.mainTid==="demo_f1"&&!q.archived);
  const namen=vorhanden.map(q=>q.name); let i=1;
  while(namen.length<13){ const n="Kind "+i;
    d.playerProfiles.push({id:"pp_ag"+i,cid:"demo",seasonId:vorhanden[0]&&vorhanden[0].seasonId,archived:false,
      name:n,by:2017,gender:"m",mainTid:"demo_f1",optTids:[],friends:[],mustWith:[]});
    namen.push(n); i++; }
  const k=namen.slice(0,13);
  const zu={}; k.slice(0,6).forEach(n=>zu[n]="g1"); k.slice(6,12).forEach(n=>zu[n]="g3");
  (d.playerProfiles||[]).filter(q=>q.mainTid==="demo_f1").forEach(q=>{ q.intGrp=zu[q.name]||""; });
  const ev=(d.events||[]).filter(e=>e.cid==="demo"&&e.tid==="demo_f1")[0];
  const ts=new Date().toISOString();
  Object.assign(ev,{ type:"training", date:tg(2), time:"17:30", endTime:"19:00", title:"Training", loc:"Platz",
    note:"", deadline:null, extraPolls:[], duties:[], spielFest:null, spielGr:null, present:{},
    votes:Object.fromEntries(k.map(n=>[n,{val:"yes",ts,role:"player"}])) });
  (d.events||[]).filter(e=>e.cid==="demo"&&e.id!==ev.id).forEach(e=>{ e.date=tg(14); });
  localStorage.setItem("vereinsapp_v14", JSON.stringify(d));
  return { evId:ev.id, kader:k, ohne:k[12] };
});
if(setup&&setup.kader.length===13) ok("Training mit 13 Zusagen steht (6 Leistung, 6 Entwicklung, einer ohne Gruppe)");
else { fail("Testdaten nicht gesetzt"); process.exit(1); }

const zumTermin=async()=>{
  await page.reload({waitUntil:"networkidle"}); await page.waitForTimeout(2800); await dismiss();
  await page.evaluate(()=>{ const b=[...document.querySelectorAll("button")].find(x=>/^(Ansehen|✅ Anwesenheit)$/.test((x.innerText||"").trim())); b&&b.click(); });
  await page.waitForTimeout(1800);
};
// Die Zeile eines Kindes in der Abhak-Liste
const zeile=(name)=>page.evaluate(n=>{
  // Die Abhak-Karte: der innerste Kasten, der Überschrift UND Erklärung hat
  const karten=[...document.querySelectorAll("div")].filter(d=>{ const t=d.innerText||"";
    return t.includes("Anwesenheit abhaken")&&t.includes("Hake ab, wer wirklich gekommen ist"); });
  const karte=karten[karten.length-1]; if(!karte) return null;
  const kand=[...karte.querySelectorAll("div")]
    .filter(d=>(d.innerText||"").includes(n)&&(d.innerText||"").length<600)
    .sort((a,b)=>(b.innerText||"").length-(a.innerText||"").length);
  return kand[0] ? (kand[0].innerText||"").replace(/\s+/g," ").trim() : null; }, name);
const grpVon=(name)=>page.evaluate(n=>{ const d=JSON.parse(localStorage.getItem("vereinsapp_v14")||"null");
  const p=(d.playerProfiles||[]).find(x=>x.name===n); return p?(p.intGrp||""):null; }, name);
// Chip-Knopf in der Zeile eines Kindes anklicken
const chipKlick=(name,txt)=>page.evaluate(({n,t})=>{
  const karten=[...document.querySelectorAll("div")].filter(d=>(d.innerText||"").includes(n)&&(d.innerText||"").length<420);
  for(const k of karten.reverse()){
    const b=[...k.querySelectorAll("button")].find(x=>new RegExp(t).test((x.innerText||"").trim()));
    if(b){ b.click(); return (b.innerText||"").trim(); }
  }
  return null; },{n:name,t:txt});

await zumTermin();
let b=await body();
if(/Anwesenheit abhaken/.test(b)) ok("Die Abhak-Liste ist da");
else { fail("Keine Abhak-Liste: "+kurz(b)); process.exit(1); }

// ===== 1) Leistungsgruppe steht in der Zeile =====
{ const z=await zeile(setup.kader[0]);
  if(z&&/Leistung/.test(z)) ok(`In der Zeile steht die Leistungsgruppe (${setup.kader[0]} → Leistung)`);
  else fail("Keine Gruppe in der Zeile: "+JSON.stringify(z)); }
{ const z=await zeile(setup.ohne);
  if(z&&/Gruppe\?/.test(z)) ok("Wer noch keine hat, bekommt „Gruppe?“ angeboten");
  else fail("Kein Angebot bei fehlender Gruppe: "+JSON.stringify(z)); }

// ===== 2) Gruppe direkt hier setzen =====
{ const g0=await grpVon(setup.ohne);
  if(!g0) ok(`${setup.ohne} hat noch keine Gruppe`); else fail("Hat schon eine Gruppe: "+g0);
  const auf=await chipKlick(setup.ohne,"^Gruppe\\?$");
  if(auf) ok("Der Chip lässt sich antippen"); else fail("Chip nicht antippbar");
  await page.waitForTimeout(700);
  const z=await zeile(setup.ohne);
  if(z&&/Reserve/.test(z)&&/keine/.test(z)) ok("Die Auswahl geht auf – mit allen Gruppen und „keine“");
  else fail("Keine Auswahl: "+JSON.stringify(z));
  const gew=await chipKlick(setup.ohne,"^Reserve$");
  if(gew) ok("Eine Gruppe lässt sich wählen"); else fail("Gruppe nicht wählbar");
  await page.waitForTimeout(1300);
  const g1=await grpVon(setup.ohne);
  if(g1==="g2") ok(`Gespeichert ist genau die angetippte Gruppe (${setup.ohne} → Reserve)`);
  else fail("Falsche Gruppe gespeichert: "+g1); }
{ const z=await zeile(setup.ohne);
  if(z&&/Reserve/.test(z)) ok("Und die Zeile zeigt sie danach an");
  else fail("Zeile zeigt die Gruppe nicht: "+JSON.stringify(z)); }

// ===== 3+4) Leibchen in der Zeile, passend zum Spielchen =====
await zumTermin();
{ const z=await zeile(setup.kader[0]);
  if(z&&/🎽/.test(z)) ok("Bei jedem Zugesagten steht das Leibchen: "+(z.match(/🎽 [^\s|]+/)||[""])[0]);
  else fail("Kein Leibchen in der Zeile: "+JSON.stringify(z)); }
{ // Einteilung festhalten und gegen die Chips prüfen
  if(await klick("📌 Festhalten")) ok("Die Einteilung lässt sich festhalten"); else fail("Kein Festhalten-Knopf");
  await page.waitForTimeout(1400);
  const stand=await page.evaluate(i=>{ const d=JSON.parse(localStorage.getItem("vereinsapp_v14")||"null");
    const ev=(d.events||[]).find(e=>e.id===i); return ev?(ev.spielFest||null):null; }, setup.evId);
  const NAME={rot:"Rot",blau:"Blau",gruen:"Grün",gelb:"Gelb",orange:"Orange",schwarz:"Schwarz"};
  const soll={};
  (stand&&stand.paarungen||[]).forEach(p=>{
    p.a.namen.forEach(n=>soll[n]=NAME[p.a.leib]||p.a.leib);
    p.b.namen.forEach(n=>soll[n]=NAME[p.b.leib]||p.b.leib);
    (p.bank||[]).forEach(n=>soll[n]="Bank"); });
  let geprueft=0, falsch=[];
  for(const n of Object.keys(soll)){
    const z=await zeile(n); const m=z&&z.match(/🎽 ([^\s|]+)/);
    if(!m){ falsch.push(n+": kein Leibchen"); continue; }
    geprueft++;
    if(m[1]!==soll[n]) falsch.push(`${n}: Liste „${m[1]}“, Spielchen „${soll[n]}“`);
  }
  if(geprueft>=10&&falsch.length===0) ok(`Alle ${geprueft} Leibchen stimmen mit dem Spielchen überein`);
  else fail("Leibchen passen nicht: "+falsch.slice(0,4).join(" / ")+` (geprüft: ${geprueft})`);
  if(Object.values(soll).includes("Bank")) ok("Wer einwechselt, steht als „Bank“ da");
  else console.log("HINWEIS: in dieser Einteilung sitzt niemand auf der Bank"); }

// ===== 5) Ohne Training kein Gruppen-Chip =====
await page.evaluate(i=>{ const d=JSON.parse(localStorage.getItem("vereinsapp_v14")||"null");
  const ev=(d.events||[]).find(e=>e.id===i); ev.type="spiel"; ev.opp="SV Test";
  localStorage.setItem("vereinsapp_v14", JSON.stringify(d)); }, setup.evId);
await zumTermin();
{ const z=await zeile(setup.kader[0]);
  if(z&&!/🎽/.test(z)&&!/Gruppe\?/.test(z)) ok("Beim Spiel bleibt die Liste schlank – Gruppe und Leibchen gehören ins Training");
  else fail("Auch beim Spiel stehen Gruppe/Leibchen da: "+JSON.stringify(z)); }

if(errors.length){ console.log("JS-FEHLER:"); [...new Set(errors)].forEach(e=>console.log(" -",e.slice(0,150))); }
console.log(errors.length||fails.length?`ERGEBNIS: ${fails.length} Fehlschläge, ${errors.length} JS-Fehler`:"ERGEBNIS: ALLES OK");
await browser.close(); srv.close();
process.exit(errors.length||fails.length?1:0);
