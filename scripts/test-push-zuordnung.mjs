// E2E-Test: „Benachrichtigungen sind an, der Test funktioniert, es kommt
// aber nichts an." Genau dieser Fall stand in den echten Daten: Das Gerät
// war in der Datenbank eingetragen, aber OHNE Verein/Team/Name. Der Test
// sucht allein über den Endpunkt und kam deshalb an – jeder echte Versand
// filtert nach Verein und Team und ließ das Gerät aus.
//   1. Die Glocke zeigt, was der Server über dieses Gerät weiß.
//   2. Fehlt die Zuordnung, sagt sie das deutlich – und bietet Reparieren an.
//   3. Beim Öffnen der App meldet sich das Gerät von allein neu an.
//   4. Scheitert die Anmeldung, meldet der Test das statt „gesendet".
// Die Datenbank wird dabei nicht angefasst: Supabase-Antworten werden
// abgefangen und beantwortet.
// Aufruf: npm run build && node scripts/test-push-zuordnung.mjs
import { chromium } from "playwright-core";
import http from "http"; import fs from "fs"; import path from "path";
const dist = path.resolve("dist");
const srv = http.createServer((req,res)=>{ let p=path.join(dist,req.url.split("?")[0]); if(!fs.existsSync(p)||fs.statSync(p).isDirectory()) p=path.join(dist,"index.html"); res.setHeader("content-type",{".html":"text/html",".js":"text/javascript",".css":"text/css"}[path.extname(p)]||"text/plain"); res.end(fs.readFileSync(p)); }).listen(4331);
const exe=process.env.PLAYWRIGHT_CHROMIUM||"/opt/pw-browsers/chromium-1194/chrome-linux/chrome";
const browser = await chromium.launch({ executablePath:exe, args:["--no-sandbox"] });
const ctx = await browser.newContext({ viewport:{ width:390, height:900 },
  permissions:["notifications"], origin:"http://127.0.0.1:4331" });
const page = await ctx.newPage();
page.setDefaultTimeout(10000);
const errors=[]; const fails=[];
page.on("pageerror", e=>errors.push(e.message));
page.on("dialog", d=>d.accept());
const fail=m=>{ fails.push(m); console.log("FEHLGESCHLAGEN:", m); };
const ok=m=>console.log("OK:", m);
const body=()=>page.evaluate(()=>document.body.innerText);
const kurz=t=>String(t).slice(0,300).replace(/\n/g," | ");

// ── Nachgebaute Supabase-Seite ────────────────────────────────────────────
// So lässt sich der Fall ohne echte Datenbank und ohne echten Push prüfen.
let zeile = null;            // die Zeile in der nachgebauten Tabelle
let rpcFehler = false;       // soll subscribe_push scheitern?
const rpcRufe = [];
await page.route("**/rest/v1/rpc/subscribe_push", async route => {
  const p = JSON.parse(route.request().postData()||"{}");
  rpcRufe.push(p);
  if ("p_tids" in p) { await route.fulfill({ status:404, body:'{"message":"not found"}' }); return; }
  if (rpcFehler) { await route.fulfill({ status:500, body:'{"message":"kaputt"}' }); return; }
  zeile = { cid:p.p_cid, tid:p.p_tid, player_name:p.p_player_name, enabled:true, last_seen:new Date().toISOString() };
  await route.fulfill({ status:200, contentType:"application/json", body:'"id-1"' });
});
await page.route("**/rest/v1/push_subscriptions**", async route => {
  await route.fulfill({ status:200, contentType:"application/json", body: JSON.stringify(zeile?[zeile]:[]) });
});
await page.route("**/rest/v1/rpc/update_push_prefs", r=>r.fulfill({status:200,body:"null"}));
await page.route("**/functions/v1/notify", async route => {
  await route.fulfill({ status:200, contentType:"application/json", body: JSON.stringify({ sent:1, found:1 }) });
});

// Service Worker und Push im Browser vortäuschen – echter Push geht im Test nicht.
await page.addInitScript(() => {
  const ENDPOINT="https://push.example/abo-1";
  const abo={ endpoint:ENDPOINT, options:{applicationServerKey:null},
    toJSON:()=>({endpoint:ENDPOINT, keys:{p256dh:"p256dh-x", auth:"auth-x"}}),
    unsubscribe:async()=>true };
  Object.defineProperty(navigator,"serviceWorker",{ configurable:true, value:{
    ready: Promise.resolve({ pushManager:{
      getSubscription: async()=>abo,
      subscribe: async()=>abo,
    }}),
    register: async()=>({}),
    addEventListener(){}, controller:null,
  }});
  window.PushManager = function(){};
  window.Notification = function(){};
  window.Notification.permission = "granted";
  window.Notification.requestPermission = async()=>"granted";
  localStorage.setItem("vereinsapp_config", JSON.stringify({url:"https://sb.example", key:"anon-key"}));
  localStorage.setItem("va_simple","0"); localStorage.setItem("va_tsimple","0");
  localStorage.setItem("va_push_local", JSON.stringify({endpoint:ENDPOINT}));
});

const glocke = async () => {
  await page.evaluate(()=>{ const b=[...document.querySelectorAll("button")]
    .find(x=>/🔕|🔔/.test((x.innerText||"").trim())&&(x.innerText||"").trim().length<4); b&&b.click(); });
  await page.waitForTimeout(900);
};

// ===== 1) Altlast: Zeile ohne Zuordnung – genau der gemeldete Zustand =====
zeile = { cid:null, tid:null, player_name:null, enabled:true, last_seen:"2026-08-14T18:45:00Z" };
await page.goto("http://127.0.0.1:4331/", { waitUntil:"networkidle" }); await page.waitForTimeout(2200);
await page.evaluate(()=>{ sessionStorage.setItem("vereinsapp_v12_session",
  JSON.stringify({role:"trainer",cid:"demo",tids:["demo_f1"],name:"Demo Trainer",id:"demo_tr1"})); });
await page.reload({waitUntil:"networkidle"}); await page.waitForTimeout(3000);

// ===== 2) Beim Öffnen meldet sich das Gerät von allein neu an =====
{ const nach = rpcRufe.filter(r=>!("p_tids" in r));
  if (nach.length>=1) ok("Beim Öffnen meldet sich das Gerät neu an – ohne Zutun");
  else fail("Keine Neuanmeldung beim Öffnen: "+JSON.stringify(rpcRufe));
  const letzter = nach[nach.length-1]||{};
  if (letzter.p_cid==="demo") ok("Mit dem Verein aus der laufenden Anmeldung ("+letzter.p_cid+")");
  else fail("Verein nicht mitgegeben: "+JSON.stringify(letzter));
  if (letzter.p_tid==="demo_f1") ok("Und mit der Mannschaft ("+letzter.p_tid+")");
  else fail("Mannschaft nicht mitgegeben: "+JSON.stringify(letzter));
  if (letzter.p_player_name==="Demo Trainer") ok("Und mit dem Namen");
  else fail("Name nicht mitgegeben: "+JSON.stringify(letzter));
  if (zeile && zeile.cid==="demo") ok("Die Zuordnung steht jetzt in der Datenbank");
  else fail("Zuordnung nicht gespeichert: "+JSON.stringify(zeile)); }
{ const mitTids = rpcRufe.filter(r=>"p_tids" in r);
  if (mitTids.length>=1) ok("Mehrere Mannschaften werden zuerst versucht (p_tids) – mit Rückfall");
  else fail("p_tids wird nicht versucht"); }

// ===== 3) Die Glocke zeigt den Zustand =====
await glocke();
let b=await body();
if(/Angemeldet als/.test(b)) ok("Die Glocke zeigt, als wer das Gerät angemeldet ist: "+((b.match(/Angemeldet als[^\n]*/)||[""])[0]));
else fail("Kein Zustand in der Glocke: "+kurz(b));

// ===== 4) Fehlende Zuordnung wird benannt und lässt sich reparieren =====
await page.evaluate(()=>{ const x=[...document.querySelectorAll("button")].find(y=>/Schließen/.test(y.innerText||"")); x&&x.click(); });
await page.waitForTimeout(500);
zeile = { cid:null, tid:null, player_name:null, enabled:true, last_seen:"2026-08-14T18:45:00Z" };
rpcFehler = true;   // Neuanmeldung scheitert -> Zustand bleibt kaputt
await page.reload({waitUntil:"networkidle"}); await page.waitForTimeout(3000);
await glocke();
b=await body();
if(/keiner Mannschaft zugeordnet/.test(b)) ok("Fehlt die Zuordnung, sagt die Glocke das deutlich");
else fail("Kein Hinweis auf die fehlende Zuordnung: "+kurz(b));
if(/Zuordnung reparieren/.test(b)) ok("Und bietet „Zuordnung reparieren“ an");
else fail("Kein Reparieren-Knopf");

// ===== 5) Der Test darf nicht „gesendet“ melden, wenn die Anmeldung scheitert =====
{ const da=await page.evaluate(()=>{ const x=[...document.querySelectorAll("button")]
    .find(y=>/Test-Benachrichtigung/.test(y.innerText||"")); if(!x) return false; x.click(); return true; });
  if(da) ok("Der Test ist anklickbar"); else fail("Kein Test-Knopf");
  await page.waitForTimeout(1600);
  b=await body();
  if(/Anmeldung an die Datenbank fehlgeschlagen/.test(b))
    ok("Der Test meldet die gescheiterte Anmeldung – statt „gesendet“ zu behaupten");
  else fail("Test behauptet Erfolg trotz kaputter Anmeldung: "+kurz(b)); }

// ===== 6) Reparieren setzt die Zuordnung =====
rpcFehler = false;
{ await page.evaluate(()=>{ const x=[...document.querySelectorAll("button")].find(y=>/Zuordnung reparieren/.test(y.innerText||"")); x&&x.click(); });
  await page.waitForTimeout(1600);
  if(zeile && zeile.cid==="demo" && zeile.player_name==="Demo Trainer") ok("Reparieren trägt Verein, Team und Namen nach");
  else fail("Reparieren wirkt nicht: "+JSON.stringify(zeile));
  b=await body();
  if(/Angemeldet als/.test(b)) ok("Und die Glocke zeigt es sofort an");
  else fail("Zustand nicht aktualisiert: "+kurz(b)); }

if(errors.length){ console.log("JS-FEHLER:"); [...new Set(errors)].forEach(e=>console.log(" -",e.slice(0,150))); }
console.log(errors.length||fails.length?`ERGEBNIS: ${fails.length} Fehlschläge, ${errors.length} JS-Fehler`:"ERGEBNIS: ALLES OK");
await browser.close(); srv.close();
process.exit(errors.length||fails.length?1:0);
