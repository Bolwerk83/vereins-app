// E2E-Test: Wird eine Person entfernt, muessen auch ihre Eintraege weg sein -
// Zusagen, Anwesenheiten, Helfer-Meldungen, Dienste, Stationen und Listen.
// Aufruf: npm run build && node scripts/test-loeschen.mjs
import { chromium } from "playwright-core";
import http from "http"; import fs from "fs"; import path from "path";
const dist = path.resolve("dist");
const srv = http.createServer((req,res)=>{ let p=path.join(dist,req.url.split("?")[0]); if(!fs.existsSync(p)||fs.statSync(p).isDirectory()) p=path.join(dist,"index.html"); res.setHeader("content-type",{".html":"text/html",".js":"text/javascript",".css":"text/css"}[path.extname(p)]||"text/plain"); res.end(fs.readFileSync(p)); }).listen(4237);
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
const clickExact=l=>page.evaluate(x=>{ const b=[...document.querySelectorAll("button")].find(y=>y.innerText.trim()===x); if(!b) return false; b.click(); return true; },l);
const dismiss=async()=>{ for(let k=0;k<12;k++){ const done=await page.evaluate(()=>{
  const fx=[...document.querySelectorAll("div")].filter(d=>getComputedStyle(d).position==="fixed"&&d.querySelector("button")&&d.innerText.length>30);
  for(const f of fx){ if(/Willkommen!/.test(f.innerText)){ const w=[...f.querySelectorAll("button")].pop(); if(w){ w.click(); return false; } }
    const b2=[...f.querySelectorAll("button")].find(x=>/geht|Los|Verstanden|Alles klar|Start|Jetzt nicht|Fertig|Speichern & loslegen|Weiter →|Überspringen/i.test(x.innerText)); if(b2){ b2.click(); return false; } }
  return true; }); await page.waitForTimeout(420); if(done) break; } };
// Was steht im Speicher zu dieser Person?
const spuren = name => page.evaluate(n=>{
  const d=JSON.parse(localStorage.getItem("vereinsapp_v14")||"null"); if(!d) return null;
  const roh=JSON.stringify({events:d.events||[],players:d.players||{},playerProfiles:d.playerProfiles||[]});
  return { treffer:(roh.match(new RegExp(n.replace(/[.*+?^${}()|[\]\\]/g,"\\$&"),"g"))||[]).length };
},name);
await page.addInitScript(()=>{
  localStorage.setItem("vereinsapp_config", JSON.stringify({url:"https://127.0.0.1:1/x", key:"test"}));
  localStorage.setItem("va_simple","0"); localStorage.setItem("va_tsimple","0");
  sessionStorage.setItem("vereinsapp_v12_session", JSON.stringify({ role:"trainer", cid:"demo", tids:["demo_f1"], name:"Demo Trainer", id:"demo_tr1" }));
});
await page.goto("http://127.0.0.1:4237/", { waitUntil:"networkidle" }); await page.waitForTimeout(2500);
await page.locator('button:has-text("Überspringen")').first().click({timeout:1500}).catch(()=>{}); await page.waitForTimeout(300);
await dismiss();

// ===== 1) Spuren erzeugen: Zusage, Helfer-Meldung, Dienst, Station =====
await page.evaluate(()=>{ const b=[...document.querySelectorAll("button")].find(x=>/Bin dabei/.test(x.innerText)); b&&b.click(); });
await page.waitForTimeout(1300);
const gesetzt=await page.evaluate(()=>{
  const d=JSON.parse(localStorage.getItem("vereinsapp_v14")||"null"); if(!d||!d.events) return false;
  const ev=d.events.find(e=>e.tid==="demo_f1"); if(!ev) return false;
  ev.helperOffers=[{id:"dh2",name:"Markus Lang",ts:new Date().toISOString()}];
  ev.duties=[{id:"dd1",title:"Kuchen",assignee:"Markus Lang"}];
  ev.orga={items:[{id:"oi1",label:"🍰 Kuchen",need:1,who:["Markus Lang"]}],shifts:[]};
  ev.stations=[{id:"st1",titel:"Station 1",min:10,kinder:8,wer:["dh2"],werNamen:{dh2:"Markus Lang"},drillId:""}];
  ev.votes={...(ev.votes||{}),"Ben Fischer":"yes"};
  ev.present={"Ben Fischer":true};
  localStorage.setItem("vereinsapp_v14",JSON.stringify(d));
  return true;
});
if(gesetzt) ok("Spuren angelegt: Helfer-Meldung, Dienst, Liste, Station, Zusage"); else fail("Konnte keine Spuren anlegen");
await page.reload({waitUntil:"networkidle"}); await page.waitForTimeout(2400); await dismiss();
let sp=await spuren("Markus Lang");
if(sp&&sp.treffer>=4) ok("Der Helfer steht an "+sp.treffer+" Stellen in den Terminen"); else fail("Zu wenige Spuren: "+(sp?sp.treffer:"?"));

// ===== 2) Trainer löscht den Helfer =====
await page.evaluate(()=>{ sessionStorage.setItem("vereinsapp_v12_session", JSON.stringify({ role:"trainer", cid:"demo", tids:["demo_f1"], name:"Demo Trainer", id:"demo_tr1" })); });
await page.reload({waitUntil:"networkidle"}); await page.waitForTimeout(2400); await dismiss();
await page.locator('button:has-text("Mehr")').last().click(); await page.waitForTimeout(700);
await page.locator('button:has-text("Helfer")').last().click(); await page.waitForTimeout(900);
let b=await body();
if(/Markus Lang/.test(b)) ok("Helfer steht in der Liste"); else fail("Helfer nicht gefunden: "+b.slice(0,150).replace(/\n/g," | "));
const geloescht=await page.evaluate(()=>{
  const karten=[...document.querySelectorAll("div")].filter(d=>/Markus Lang/.test(d.innerText||"")&&d.querySelector("button")&&d.innerText.length<400);
  const k=karten[karten.length-1]; if(!k) return false;
  const b2=[...k.querySelectorAll("button")].find(x=>/^(✕|🗑)$/.test((x.innerText||"").trim()));
  if(!b2) return false; b2.click(); return true;
});
await page.waitForTimeout(1400);
if(geloescht) ok("Löschen angestoßen"); else fail("Kein Löschen-Knopf beim Helfer gefunden");
b=await body();
if(!/Markus Lang/.test(b)) ok("Helfer ist aus der Liste verschwunden"); else fail("Helfer noch in der Liste");
sp=await spuren("Markus Lang");
if(sp&&sp.treffer===0) ok("Auch alle Einträge des Helfers sind weg (0 Treffer im Speicher)"); else fail("Es bleiben Spuren zurück: "+(sp?sp.treffer:"?"));

// ===== 3) Spieler löschen räumt ebenfalls auf =====
await clickExact("Team"); await page.waitForTimeout(1400);
for(let i=0;i<3;i++){ if(!(await clickExact("Überspringen"))) break; await page.waitForTimeout(500); }
await clickTxt("👥 Kader"); await page.waitForTimeout(600);
await clickTxt("^Spieler$"); await page.waitForTimeout(1000);
b=await body();
if(/Ben Fischer/.test(b)){
  const vorher=await spuren("Ben Fischer");
  // Loeschen ist zweistufig: erster Tipp schaltet scharf, zweiter loescht
  const klickX=()=>page.evaluate(()=>{
    const karten=[...document.querySelectorAll("div")].filter(d=>/Ben Fischer/.test(d.innerText||"")&&d.querySelector("button")&&d.innerText.length<500);
    const k=karten[karten.length-1]; if(!k) return false;
    const b2=[...k.querySelectorAll("button")].find(x=>/^(✕|Sicher löschen\?)$/.test((x.innerText||"").trim()));
    if(!b2) return false; b2.click(); return true;
  });
  const weg=await klickX(); await page.waitForTimeout(700);
  await klickX(); await page.waitForTimeout(1600);
  if(weg){
    let nachher=await spuren("Ben Fischer");
    if(nachher&&nachher.treffer>0){
      // Das X in der Liste nimmt den Spieler nur aus dem Kader - endgueltig
      // geloescht wird im Profil.
      await page.evaluate(()=>{ const k=[...document.querySelectorAll("div")].filter(d=>/Ben Fischer/.test(d.innerText||"")&&d.querySelector("button")&&d.innerText.length<500).pop();
        const b2=k&&[...k.querySelectorAll("button")].find(x=>(x.innerText||"").trim()==="✎"); b2&&b2.click(); });
      await page.waitForTimeout(1200);
      await page.evaluate(()=>{ const b2=[...document.querySelectorAll("button")].find(x=>/endgültig löschen|Spieler löschen|🗑/i.test(x.innerText||"")); b2&&b2.click(); });
      await page.waitForTimeout(1500);
      nachher=await spuren("Ben Fischer");
    }
    if(nachher&&nachher.treffer===0) ok("Spieler gelöscht – auch seine Zusagen und Listen ("+vorher.treffer+" → 0)");
    else fail("Spieler-Spuren bleiben: "+(nachher?nachher.treffer:"?")+" (vorher "+vorher.treffer+")");
  } else console.log("HINWEIS: Kein direkter Löschen-Knopf in der Kaderliste");
} else console.log("HINWEIS: Kaderliste nicht sichtbar");

// ===== 4) Altlast: Helfer-Eintrag ohne Konto wird still aufgeraeumt =====
// Genau der gemeldete Fall: der Zugang wurde geloescht (frueher oder auf einem
// anderen Geraet), der Name stand aber weiter im Termin.
{ const gesetzt=await page.evaluate(()=>{
    const d=JSON.parse(localStorage.getItem("vereinsapp_v14")||"null"); if(!d||!d.events) return false;
    const ev=d.events.find(e=>e.cid==="demo"&&e.tid==="demo_f1"); if(!ev) return false;
    ev.helperOffers=[...(ev.helperOffers||[]),{id:"geloescht_1",name:"Geloeschter Helfer",ts:new Date().toISOString()}];
    ev.helperInterest=[...(ev.helperInterest||[]),{id:"geloescht_2",name:"Auch Weg",ts:new Date().toISOString()}];
    localStorage.setItem("vereinsapp_v14", JSON.stringify(d));
    return true;
  });
  if(gesetzt) ok("Altlast angelegt: zwei Helfer-Einträge ohne Konto"); else fail("Konnte keine Altlast anlegen");
  await page.reload({waitUntil:"networkidle"}); await page.waitForTimeout(3000); await dismiss(); await page.waitForTimeout(1200);
  const rest=await page.evaluate(()=>{
    const d=JSON.parse(localStorage.getItem("vereinsapp_v14")||"null"); if(!d) return -1;
    return JSON.stringify(d.events||[]).split("Geloeschter Helfer").length-1 + (JSON.stringify(d.events||[]).split("Auch Weg").length-1);
  });
  if(rest===0) ok("Beim nächsten Öffnen sind die verwaisten Einträge verschwunden");
  else fail("Verwaiste Helfer-Einträge bleiben stehen: "+rest);
  const b4=await body();
  if(!/Geloeschter Helfer|Auch Weg/.test(b4)) ok("Und sie stehen auch nicht mehr auf der Terminkarte");
  else fail("Name steht weiter auf der Terminkarte");
  // Gegenprobe: ein echter Helfer bleibt selbstverstaendlich stehen
  const echt=await page.evaluate(()=>{
    const d=JSON.parse(localStorage.getItem("vereinsapp_v14")||"null"); if(!d) return -1;
    const h=(d.helpers||[]).find(x=>x.cid==="demo"&&x.active!==false); if(!h) return -1;
    const ev=(d.events||[]).find(e=>e.cid==="demo"&&e.tid==="demo_f1"); if(!ev) return -1;
    ev.helperOffers=[{id:h.id,name:h.name,ts:new Date().toISOString()}];
    localStorage.setItem("vereinsapp_v14", JSON.stringify(d));
    return 1;
  });
  if(echt===1){
    await page.reload({waitUntil:"networkidle"}); await page.waitForTimeout(3000); await dismiss(); await page.waitForTimeout(1200);
    const bleibt=await page.evaluate(()=>{
      const d=JSON.parse(localStorage.getItem("vereinsapp_v14")||"null");
      const ev=(d.events||[]).find(e=>e.cid==="demo"&&e.tid==="demo_f1");
      return (ev&&ev.helperOffers||[]).length;
    });
    if(bleibt===1) ok("Ein Helfer MIT Konto bleibt unangetastet"); else fail("Echter Helfer wurde mit weggeräumt: "+bleibt);
  }
}

if(errors.length){ console.log("JS-FEHLER:"); [...new Set(errors)].forEach(e=>console.log(" -",e.slice(0,150))); }
console.log(errors.length||fails.length?`ERGEBNIS: ${fails.length} Fehlschläge, ${errors.length} JS-Fehler`:"ERGEBNIS: ALLES OK");
await browser.close(); srv.close();
process.exit(errors.length||fails.length?1:0);
