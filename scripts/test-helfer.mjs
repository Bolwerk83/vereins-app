// E2E-Test Helfer-Lebenszyklus. Aufruf: npm run build && node scripts/test-helfer.mjs
// Prueft: Trainer legt Helfer mit Einmal-Passwort an -> Helfer-Login mit
// Pflicht-Passwortwechsel -> Termin-Freigabe mit Bedarf/Notiz -> Zusage (fest)
// -> zweiter Helfer auf Warteliste -> Trainer-Uebersicht + automatisches Nachruecken.
import { chromium } from "playwright-core";
import http from "http"; import fs from "fs"; import path from "path";
const dist = path.resolve("dist");
const srv = http.createServer((req,res)=>{ let p=path.join(dist,req.url.split("?")[0]); if(!fs.existsSync(p)||fs.statSync(p).isDirectory()) p=path.join(dist,"index.html"); res.setHeader("content-type",{".html":"text/html",".js":"text/javascript",".css":"text/css"}[path.extname(p)]||"text/plain"); res.end(fs.readFileSync(p)); }).listen(4209);
const exe=process.env.PLAYWRIGHT_CHROMIUM||"/opt/pw-browsers/chromium-1194/chrome-linux/chrome";
const browser = await chromium.launch({ executablePath:exe, args:["--no-sandbox"] });
const page = await browser.newPage({ viewport:{ width:390, height:900 } });
const errors=[]; const fails=[];
page.on("pageerror", e=>errors.push(e.message));
const fail=m=>{ fails.push(m); console.log("FEHLGESCHLAGEN:", m); };
const ok=m=>console.log("OK:", m);
const body=()=>page.evaluate(()=>document.body.innerText);
// Fake-Cloud: Saves landen im Offline-Spiegel und überleben Reloads (wie am Sportplatz ohne Netz)
await page.addInitScript(()=>{
  localStorage.setItem("vereinsapp_config", JSON.stringify({url:"https://127.0.0.1:1/x", key:"test"}));
  if(!sessionStorage.getItem("va_role")) sessionStorage.setItem("vereinsapp_v12_session", JSON.stringify({ role:"trainer", cid:"demo", tids:["demo_f1"], name:"Demo Trainer", id:"demo_tr1" }));
});
await page.goto("http://127.0.0.1:4209/", { waitUntil:"networkidle" }); await page.waitForTimeout(2500);
await page.locator('button:has-text("Überspringen")').first().click().catch(()=>{}); await page.waitForTimeout(300);

// ===== 1) Trainer legt zwei Helfer an =====
const createHelper=async(name)=>{
  await page.locator('button:has-text("Mehr")').last().click(); await page.waitForTimeout(600);
  await page.locator('button:has-text("Helfer")').last().click(); await page.waitForTimeout(700);
  await page.locator('button:has-text("+ Neuer Helfer")').click(); await page.waitForTimeout(500);
  await page.locator('input[placeholder*="Maria"]').fill(name); await page.waitForTimeout(200);
  const pw=await page.evaluate(()=>{ const sp=[...document.querySelectorAll("span")].find(x=>x.style.fontFamily==="monospace"&&/^[A-Za-z0-9]{6}$/.test(x.textContent.trim())); return sp?sp.textContent.trim():null; });
  await page.locator('button:has-text("Speichern")').last().click(); await page.waitForTimeout(600);
  return pw;
};
const pwA=await createHelper("Anna Helferin");
if(pwA&&/^[A-Za-z0-9]{6}$/.test(pwA)) ok("Helfer A angelegt, Einmal-Passwort erzeugt: "+pwA); else fail("Einmal-Passwort A fehlt: "+pwA);
const pwB=await createHelper("Bernd Helfer");
if(pwB) ok("Helfer B angelegt: "+pwB); else fail("Einmal-Passwort B fehlt");
let b=await body();
if(b.includes("🔑 Einmal-Passwort aktiv")) ok("Liste zeigt Einmal-Passwort-Status"); else fail("Status-Badge fehlt");

// ===== 2) Termin freigeben (Nicht-Training) + Bedarf auf 1 =====
await page.locator('button:has-text("Termine")').last().click(); await page.waitForTimeout(700);
// zweiten Termin öffnen (das Spiel), sonst ersten
const n=await page.locator('button:has-text("Ansehen")').count();
await page.locator('button:has-text("Ansehen")').nth(n>1?1:0).click(); await page.waitForTimeout(800);
await page.locator('button:has-text("👥 Orga")').first().click(); await page.waitForTimeout(600);
b=await body();
if(b.includes("Helfer-Anmeldung für diesen Termin freigeben")) ok("Freigabe-Knopf im Orga-Tab (Nicht-Training)"); else fail("Freigabe-Knopf fehlt: "+b.slice(0,150));
await page.locator('button:has-text("Helfer-Anmeldung für diesen Termin freigeben")').click(); await page.waitForTimeout(900);
b=await body();
if(b.includes("Helfer-Einsatz")) ok("Helfer-Einsatz-Karte nach Freigabe da"); else fail("Karte fehlt");
// Bedarf 2 -> 1
await page.evaluate(()=>{ const sp=[...document.querySelectorAll("span")].find(x=>x.textContent==="Benötigte Helfer"); const btn=sp&&sp.parentElement.querySelector("button"); btn&&btn.click(); });
await page.waitForTimeout(400);
// Notiz setzen
await page.locator('input[placeholder*="Grillstand"]').fill("Grillstand-Test"); await page.locator('input[placeholder*="Grillstand"]').blur(); await page.waitForTimeout(500);
b=await body();
if(/Helfer-Einsatz[\s\S]{0,40}0\/1/.test(b.replace(/\n/g," "))||b.includes("0/1")) ok("Bedarf auf 1 gesetzt"); else fail("Bedarf nicht 1");
await page.getByRole('button',{name:'Schließen',exact:true}).first().click().catch(()=>{}); await page.waitForTimeout(400);

const dismissOverlays=async()=>{ for(let k=0;k<3;k++){ const done=await page.evaluate(()=>{
  const fx=[...document.querySelectorAll("div")].filter(d=>["fixed"].includes(getComputedStyle(d).position)&&d.querySelector("button")&&d.innerText.length>30);
  for(const f of fx){ const b=[...f.querySelectorAll("button")].find(x=>/geht|Los|Verstanden|Alles klar|Start|Überspringen|Weiter/i.test(x.innerText)); if(b){ b.click(); return false; } }
  return true; }); await page.waitForTimeout(500); if(done) break; } };
// ===== 3) Helfer A: Login mit Einmal-PW + Pflicht-Wechsel + Zusage =====
const helperLogin=async(name,tempPw,newPw)=>{
  // In-App-Logout -> Rollen-Auswahl (Daten bleiben im Speicher)
  await page.keyboard.press("Escape").catch(()=>{}); await page.waitForTimeout(400);
  await page.evaluate(()=>{ const b2=[...document.querySelectorAll("button")].find(x=>x.innerText.trim()==="Logout"); b2&&b2.click(); });
  await page.waitForTimeout(1000);
  await page.getByText("Turnier & Spieltag unterstützen").click(); await page.waitForTimeout(900);
  let t2=await body();
  // Neuer Login-Flow im Trainer-Design: erst die Jugend waehlen, dann den Namen
  if(!t2.includes("Für welche Jugend hilfst du?")){ fail("Jugend-Auswahl beim Helfer-Login fehlt: "+t2.slice(0,120)); return false; }
  await page.evaluate(()=>{ const cards=[...document.querySelectorAll("div")].filter(d=>String(d.className).includes("up")&&/\d+ Helfer/.test(d.innerText)&&d.innerText.length<120); cards[0]&&cards[0].click(); });
  await page.waitForTimeout(700);
  t2=await body();
  if(t2.includes("Welcher Helfer bist du?")){ await page.getByText(name,{exact:false}).first().click(); await page.waitForTimeout(500); }
  await page.locator('input[type="password"]').first().fill(tempPw);
  await page.locator('button:has-text("Anmelden")').click(); await page.waitForTimeout(700);
  t2=await body();
  if(t2.includes("Eigenes Passwort vergeben")){
    const pws=page.locator('input[type="password"]');
    await pws.nth(0).fill(newPw); await pws.nth(1).fill(newPw);
    await page.locator('button:has-text("Passwort speichern & einloggen")').click(); await page.waitForTimeout(1200);
    return true;
  }
  fail("Kein Pflicht-Passwortwechsel für "+name); return false;
};
if(await helperLogin("Anna Helferin",pwA,"anna123")){
  ok("Helfer A: Einmal-PW akzeptiert + eigenes Passwort gesetzt");
  b=await body();
  if(b.includes("Anna")||b.includes("Termine")) ok("Helfer A eingeloggt (Dashboard)");
  await dismissOverlays();
  // Termin öffnen und helfen
  const c=await page.locator('button:has-text("Ansehen")').count();
  for(let i=0;i<c;i++){
    await page.locator('button:has-text("Ansehen")').nth(i).click({timeout:8000}).catch(()=>{});
    await page.waitForTimeout(700);
    await page.locator('button:has-text("👥 Orga")').first().click().catch(()=>{}); await page.waitForTimeout(500);
    const t2=await body();
    if(t2.includes("Helfer-Einsatz")){ break; }
    await page.keyboard.press("Escape").catch(()=>{}); await page.waitForTimeout(200);
    await page.getByRole('button',{name:'Schließen',exact:true}).first().click().catch(()=>{}); await page.waitForTimeout(300);
  }
  b=await body();
  if(b.includes("Grillstand-Test")) ok("Helfer sieht die Einsatz-Notiz"); else { fail("Notiz fehlt beim Helfer"); console.log("DEBUG Karte:", (b.match(/Helfer-Einsatz[\s\S]{0,260}/)||["?"])[0].replace(/\n+/g," | ")); }
  await page.locator('button:has-text("🙋 Ich helfe!")').click(); await page.waitForTimeout(600);
  b=await body();
  if(b.includes("Du bist fest eingeplant")) ok("Helfer A fest eingeplant (1/1)"); else fail("Zusage A fehlgeschlagen: "+(b.match(/Helfer-Einsatz[\s\S]{0,120}/)||["?"])[0].replace(/\n/g," | "));
  await page.getByRole('button',{name:'Schließen',exact:true}).first().click().catch(()=>{}); await page.waitForTimeout(300);
}

// ===== 4) Helfer B: Login + Warteliste =====
if(await helperLogin("Bernd Helfer",pwB,"bernd123")){
  ok("Helfer B eingeloggt");
  await dismissOverlays();
  const c=await page.locator('button:has-text("Ansehen")').count();
  for(let i=0;i<c;i++){
    await page.locator('button:has-text("Ansehen")').nth(i).click(); await page.waitForTimeout(700);
    await page.locator('button:has-text("👥 Orga")').first().click().catch(()=>{}); await page.waitForTimeout(500);
    if((await body()).includes("Helfer-Einsatz")) break;
    await page.getByRole('button',{name:'Schließen',exact:true}).first().click().catch(()=>{}); await page.waitForTimeout(300);
  }
  b=await body();
  if(b.includes("🙋 Auf die Warteliste")) ok("B sieht Wartelisten-Knopf (Platz voll)"); else fail("Wartelisten-Knopf fehlt");
  await page.locator('button:has-text("🙋 Auf die Warteliste")').click(); await page.waitForTimeout(600);
  b=await body();
  if(/Warteliste Platz 1/.test(b)) ok("B auf Warteliste Platz 1 (rückt automatisch nach)"); else fail("Wartelisten-Status fehlt: "+(b.match(/Warteliste[^\n]*/)||["?"])[0]);
}

// ===== 5) Trainer: Übersicht Fest/Warteliste + Nachrücken =====
await page.evaluate(()=>{ sessionStorage.setItem("vereinsapp_v12_session", JSON.stringify({ role:"trainer", cid:"demo", tids:["demo_f1"], name:"Demo Trainer", id:"demo_tr1" })); });
await page.reload({waitUntil:"networkidle"}); await page.waitForTimeout(2500);
await page.locator('button:has-text("Überspringen")').first().click().catch(()=>{}); await page.waitForTimeout(300);
const c2=await page.locator('button:has-text("Ansehen")').count();
for(let i=0;i<c2;i++){
  await page.locator('button:has-text("Ansehen")').nth(i).click(); await page.waitForTimeout(700);
  await page.locator('button:has-text("👥 Orga")').first().click().catch(()=>{}); await page.waitForTimeout(500);
  if((await body()).includes("Helfer-Einsatz")) break;
  await page.getByRole('button',{name:'Schließen',exact:true}).first().click().catch(()=>{}); await page.waitForTimeout(300);
}
b=await body();
if(b.includes("Anna Helferin")&&b.includes("WARTELISTE")&&b.includes("Bernd Helfer")) ok("Trainer sieht: Anna fest, Bernd auf Warteliste"); else fail("Trainer-Übersicht unvollständig: "+(b.match(/Helfer-Einsatz[\s\S]{0,200}/)||["?"])[0].replace(/\n/g," | "));
// Anna entfernen -> Bernd rückt automatisch nach
await page.evaluate(()=>{ const chips=[...document.querySelectorAll("span")].filter(x=>x.innerText.includes("Anna Helferin"));
  for(const ch of chips){ const x=[...ch.querySelectorAll("span")].find(s2=>s2.textContent==="×"); if(x){ x.click(); return; } } });
await page.waitForTimeout(700);
b=await body();
if(!b.includes("Anna Helferin")&&b.includes("Bernd Helfer")&&!b.includes("WARTELISTE")) ok("Nachrücken: Anna raus, Bernd automatisch fest"); else fail("Nachrücken klappt nicht: "+(b.match(/Helfer-Einsatz[\s\S]{0,200}/)||["?"])[0].replace(/\n/g," | "));

if(errors.length){ console.log("JS-FEHLER:"); [...new Set(errors)].forEach(e=>console.log(" -",e.slice(0,150))); }
console.log(errors.length||fails.length?`ERGEBNIS: ${fails.length} Fehlschläge, ${errors.length} JS-Fehler`:"ERGEBNIS: ALLES OK");
await browser.close(); srv.close();
process.exit(errors.length||fails.length?1:0);
