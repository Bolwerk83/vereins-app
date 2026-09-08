// E2E-Test: Fahrgemeinschaft lässt sich zuklappen, sobald man geantwortet hat.
//   1. Wer noch nicht geantwortet hat, sieht alles offen – nichts versteckt.
//   2. Wer geantwortet hat, sieht beim nächsten Öffnen nur noch eine Zeile
//      mit der eigenen Antwort und dem Stand („Ändern ▾“).
//   3. „Ändern ▾“ klappt wieder auf, „▴ Fahrgemeinschaft zuklappen“ zu.
//   4. Eine offene Anfrage an mich bleibt immer sichtbar.
// Aufruf: npm run build && node scripts/test-fahrgemeinschaft-zu.mjs
import { chromium } from "playwright-core";
import http from "http"; import fs from "fs"; import path from "path";
const dist = path.resolve("dist");
const srv = http.createServer((req,res)=>{ let p=path.join(dist,req.url.split("?")[0]); if(!fs.existsSync(p)||fs.statSync(p).isDirectory()) p=path.join(dist,"index.html"); res.setHeader("content-type",{".html":"text/html",".js":"text/javascript",".css":"text/css"}[path.extname(p)]||"text/plain"); res.end(fs.readFileSync(p)); }).listen(4317);
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
  const fx=[...document.querySelectorAll("div")].filter(d=>getComputedStyle(d).position==="fixed"&&d.querySelector("button")&&d.innerText.length>30&&!/nimmt .* mit/.test(d.innerText||""));
  for(const f of fx){ const b=[...f.querySelectorAll("button")].find(x=>/geht|Los|Verstanden|Alles klar|Fertig|Jetzt nicht|Weiter →|Überspringen|Start/i.test(x.innerText)); if(b){ b.click(); return false; } }
  return true; }); await page.waitForTimeout(400); if(done) break; } };
const alsEltern = async (kind) => {
  await page.evaluate(k=>{ localStorage.setItem("va_simple","1");
    sessionStorage.setItem("vereinsapp_v12_session", JSON.stringify({role:"user",cid:"demo",tid:"demo_f1",name:k,user:k})); }, kind);
  await page.goto("http://127.0.0.1:4317/", { waitUntil:"networkidle" }); await page.waitForTimeout(2800); await dismiss();
};
// Der Fahrgemeinschafts-Abschnitt: alles zwischen der Überschrift und dem
// naechsten Abschnitt - daran messen wir, wie lang die Karte wird.
const cpText = () => page.evaluate(()=>{
  const t=document.body.innerText; const i=t.search(/Fahrgemeinschaft/);
  if(i<0) return ""; return t.slice(i, i+900); });

await page.addInitScript(()=>{ if(!localStorage.getItem("vereinsapp_config")) localStorage.setItem("vereinsapp_config", JSON.stringify({url:"https://127.0.0.1:1/x", key:"test"})); });
await page.goto("http://127.0.0.1:4317/", { waitUntil:"networkidle" }); await page.waitForTimeout(2500);
await page.evaluate(()=>{ localStorage.setItem("va_simple","0"); localStorage.setItem("va_tsimple","0");
  sessionStorage.setItem("vereinsapp_v12_session", JSON.stringify({role:"trainer",cid:"demo",tids:["demo_f1"],name:"Demo Trainer",id:"demo_tr1"})); });
await page.reload({waitUntil:"networkidle"}); await page.waitForTimeout(2600); await dismiss();
await page.evaluate(()=>{ const b=[...document.querySelectorAll("button")].find(x=>/Bin dabei/.test(x.innerText)); b&&b.click(); });
await page.waitForTimeout(1500);

// Auswärtsspiel: A faehrt (3 Plaetze), B sucht Mitfahrt, C hat noch nicht geantwortet
const kinder = await page.evaluate(()=>{
  const d=JSON.parse(localStorage.getItem("vereinsapp_v14")||"null"); if(!d) return null;
  const vorlage=(d.events||[]).find(e=>e.cid==="demo"&&e.tid==="demo_f1"&&(e.pt==="att"||!e.pt)); if(!vorlage) return null;
  const kader=[...new Set([...((d.players||{})["demo_f1"]||[]),
    ...((d.playerProfiles||[]).filter(pp=>pp.mainTid==="demo_f1"&&!pp.archived).map(pp=>pp.name))])];
  if(kader.length<3) return null;
  const [fahrer,gast,offen]=kader;
  const x=new Date(Date.now()+3*86400000); const p=v=>String(v).padStart(2,"0");
  const rest=(d.events||[]).filter(e=>e.id!=="ev_zu");
  const ja=n=>[n,{val:"yes",ts:new Date().toISOString(),role:"player"}];
  d.events=[...rest,{ ...vorlage, id:"ev_zu", title:"SV Adler", type:"auswarts",
    date:`${x.getFullYear()}-${p(x.getMonth()+1)}-${p(x.getDate())}`, time:"10:30", endTime:"12:00",
    loc:"Adler-Arena", note:"", deadline:null, extraPolls:[], carpoolExtra:true, carpoolOpt:false,
    votes:Object.fromEntries([ja(fahrer),ja(gast),ja(offen)]),
    carpool:{ [fahrer]:{mode:"drive",seats:3,ts:new Date().toISOString()},
              [gast]:{mode:"need",car:null,pickup:"Sportplatz",ts:new Date().toISOString()} } }];
  localStorage.setItem("vereinsapp_v14", JSON.stringify(d));
  return {fahrer,gast,offen};
});
if(kinder) ok(`Ausgangslage: ${kinder.fahrer} fährt, ${kinder.gast} sucht Mitfahrt, ${kinder.offen} hat noch nicht geantwortet`);
else { fail("Konnte die Ausgangslage nicht setzen"); process.exit(1); }

// ===== 1) Noch keine Antwort: alles offen =====
await alsEltern(kinder.offen);
let c=await cpText();
if(/Noch keine Antwort/.test(c)) ok("Ohne eigene Antwort steht der Hinweis „Noch keine Antwort“ da");
else fail("Kein Hinweis auf die fehlende Antwort: "+c.slice(0,220).replace(/\n/g," | "));
if(!/Ändern ▾/.test(c)) ok("Und nichts ist zugeklappt – erst antworten, dann zuklappen");
else fail("Zugeklappt, obwohl noch keine Antwort da ist");

// ===== 2) Wer geantwortet hat, sieht beim Öffnen nur eine Zeile =====
await alsEltern(kinder.fahrer);
c=await cpText();
if(/Ändern ▾/.test(c)) ok("Der Fahrer sieht die Fahrgemeinschaft zugeklappt");
else fail("Nicht zugeklappt, obwohl geantwortet: "+c.slice(0,220).replace(/\n/g," | "));
if(/3 von 3 Plätzen frei/.test(c)) ok("Die eigene Antwort steht in der Zeile: „3 von 3 Plätzen frei“");
else fail("Eigene Antwort nicht in der Zeile: "+c.slice(0,220).replace(/\n/g," | "));
if(/1 Auto · 3 Plätze · 1 suchen/.test(c)) ok("Und der Stand daneben: „1 Auto · 3 Plätze · 1 suchen“");
else fail("Kein Stand in der Zeile: "+c.slice(0,220).replace(/\n/g," | "));
if(/jemanden mitnehmen\?/.test(c)) ok("Der Fahrer wird trotzdem erinnert: „🙋 jemanden mitnehmen?“");
else fail("Kein Hinweis auf die Suchenden: "+c.slice(0,220).replace(/\n/g," | "));
if(!/Sucht noch Mitfahrt|Ich nehme /i.test(c)) ok("Die lange Autoliste ist eingeklappt");
else fail("Autoliste trotz Zuklappen sichtbar");
const zuLang=(await body()).length;

// ===== 3) Auf und wieder zu =====
if(await klick("Ändern ▾")) ok("„Ändern ▾“ ist anklickbar"); else fail("Kein Knopf „Ändern ▾“");
await page.waitForTimeout(700);
c=await cpText();
if(/Sucht noch Mitfahrt/i.test(c)&&/Ich nehme /.test(c)) ok("Aufgeklappt steht wieder alles da – auch das Mitnehmen");
else fail("Nach dem Aufklappen fehlt der Inhalt: "+c.slice(0,260).replace(/\n/g," | "));
if(/Fahrgemeinschaft zuklappen/.test(c)) ok("Unten steht „▴ Fahrgemeinschaft zuklappen“");
else fail("Kein Knopf zum Zuklappen: "+c.slice(0,260).replace(/\n/g," | "));
{ const aufLang=(await body()).length;
  if(zuLang<aufLang) ok(`Zugeklappt ist die Seite deutlich kürzer: ${zuLang} statt ${aufLang} Zeichen`);
  else fail(`Nicht kürzer: zugeklappt ${zuLang}, aufgeklappt ${aufLang} Zeichen`); }
if(await klick("Fahrgemeinschaft zuklappen")) ok("Der Zuklappen-Knopf reagiert"); else fail("Zuklappen nicht möglich");
await page.waitForTimeout(700);
c=await cpText();
if(/Ändern ▾/.test(c)&&!/Sucht noch Mitfahrt/i.test(c)) ok("Und es ist wieder auf eine Zeile geschrumpft");
else fail("Bleibt offen: "+c.slice(0,260).replace(/\n/g," | "));

// ===== 4) Frisch geantwortet: bleibt offen, kann aber zugeklappt werden =====
await alsEltern(kinder.offen);
if(await klick("^Komme selbst$")) ok("Wer neu antwortet, wählt ganz normal aus");
else fail("Antwort-Knopf „Komme selbst“ fehlt: "+(await cpText()).slice(0,220).replace(/\n/g," | "));
await page.waitForTimeout(900);
c=await cpText();
if(!/Ändern ▾/.test(c)&&/Fahrgemeinschaft zuklappen/.test(c)) ok("Direkt nach der Antwort bleibt alles offen – zuklappen kann man selbst");
else fail("Nach der Antwort sofort zugeklappt: "+c.slice(0,260).replace(/\n/g," | "));

// ===== 5) Offene Anfrage an mich bleibt sichtbar =====
await page.evaluate(k=>{ const d=JSON.parse(localStorage.getItem("vereinsapp_v14")||"null");
  const ev=(d.events||[]).find(e=>e.id==="ev_zu");
  ev.carpool[k.gast]={...ev.carpool[k.gast], angebot:{von:k.fahrer,ts:new Date().toISOString(),status:"offen"}};
  localStorage.setItem("vereinsapp_v14", JSON.stringify(d)); }, kinder);
await alsEltern(kinder.gast);
c=await cpText();
if(!/Ändern ▾/.test(c)) ok("Wer gefragt wurde, bekommt die Fahrgemeinschaft offen zu sehen");
else fail("Offene Anfrage hinter dem Zuklappen versteckt: "+c.slice(0,260).replace(/\n/g," | "));
{ const b=await body();
  if(/Ja, gerne/.test(b)) ok("Die Anfrage kann beantwortet werden"); else fail("Keine Antwortmöglichkeit auf die Anfrage"); }

if(errors.length){ console.log("JS-FEHLER:"); [...new Set(errors)].forEach(e=>console.log(" -",e.slice(0,150))); }
console.log(errors.length||fails.length?`ERGEBNIS: ${fails.length} Fehlschläge, ${errors.length} JS-Fehler`:"ERGEBNIS: ALLES OK");
await browser.close(); srv.close();
process.exit(errors.length||fails.length?1:0);
