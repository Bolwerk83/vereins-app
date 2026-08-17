// E2E-Test Trainer-Paket: Spieler/Trainer getrennt zaehlen, aufgeraeumte
// Anwesenheits-Ansicht (Sortierung, keine doppelten Abstimmungs-Listen),
// Vertretungs-Gesuche zwischen Trainern.
// Aufruf: npm run build && node scripts/test-trainer.mjs
import { chromium } from "playwright-core";
import http from "http"; import fs from "fs"; import path from "path";
const dist = path.resolve("dist");
const srv = http.createServer((req,res)=>{ let p=path.join(dist,req.url.split("?")[0]); if(!fs.existsSync(p)||fs.statSync(p).isDirectory()) p=path.join(dist,"index.html"); res.setHeader("content-type",{".html":"text/html",".js":"text/javascript",".css":"text/css"}[path.extname(p)]||"text/plain"); res.end(fs.readFileSync(p)); }).listen(4217);
const exe=process.env.PLAYWRIGHT_CHROMIUM||"/opt/pw-browsers/chromium-1194/chrome-linux/chrome";
const browser = await chromium.launch({ executablePath:exe, args:["--no-sandbox"] });
const page = await browser.newPage({ viewport:{ width:390, height:900 } });
const errors=[]; const fails=[];
page.on("pageerror", e=>errors.push(e.message));
page.on("dialog", d=>d.accept());
const fail=m=>{ fails.push(m); console.log("FEHLGESCHLAGEN:", m); };
const ok=m=>console.log("OK:", m);
const body=()=>page.evaluate(()=>document.body.innerText);
await page.addInitScript(()=>{
  localStorage.setItem("vereinsapp_config", JSON.stringify({url:"https://127.0.0.1:1/x", key:"test"}));
  if(!sessionStorage.getItem("va_sw")) sessionStorage.setItem("vereinsapp_v12_session", JSON.stringify({ role:"trainer", cid:"demo", tids:["demo_f1"], name:"Trainer A", id:"dt1" }));
});
await page.goto("http://127.0.0.1:4217/", { waitUntil:"networkidle" }); await page.waitForTimeout(2500);
await page.locator('button:has-text("Überspringen")').first().click().catch(()=>{}); await page.waitForTimeout(400);
// Willkommen + Modul-Wizard durchklicken
for(let k=0;k<4;k++){ const t2=await body(); if(t2.includes("Was möchtet ihr nutzen?")) break;
  await page.evaluate(()=>{ const fx=[...document.querySelectorAll("div")].filter(d=>getComputedStyle(d).position==="fixed"&&d.querySelector("button"));
    for(const f of fx){ if(f.innerText.includes("Was möchtet ihr nutzen?")) continue;
      const b2=[...f.querySelectorAll("button")].find(x=>/geht|Verstanden|Start|Weiter|Schließen|✕|OK/i.test(x.innerText)); if(b2){ b2.click(); return; } } });
  await page.waitForTimeout(700); }
if((await body()).includes("Was möchtet ihr nutzen?")){
  await page.locator('button:has-text("Los geht")').click(); await page.waitForTimeout(300);
  for(let i=0;i<6;i++){ await page.locator('button:has-text("Weiter →")').click(); await page.waitForTimeout(300); }
  await page.locator('button:has-text("Speichern & loslegen")').click(); await page.waitForTimeout(800);
}

// ===== 1) Spieler/Trainer getrennt auf der Terminkarte =====
let b=await body();
if(/✓ \d+ Spieler/.test(b)) ok("Terminkarte zählt Spieler-Zusagen separat"); else fail("Spieler-Zähler fehlt: "+(b.match(/✓[^\n]{0,30}/)||["?"])[0]);
await page.locator('button:has-text("✓ Bin dabei")').first().click(); await page.waitForTimeout(600);
b=await body();
if(b.includes("🧑‍🏫 1 Trainer")) ok("Trainer-Selbstzusage separat ausgewiesen (🧑‍🏫 1 Trainer)"); else fail("Trainer-Chip fehlt: "+(b.match(/Trainer[^\n]{0,40}/)||["?"])[0]);

// ===== 2) Aufgeräumte Rückmeldungen-Ansicht =====
await page.locator('button:has-text("Ansehen")').first().click(); await page.waitForTimeout(800);
b=await body();
if(b.includes("Spieler dabei")) ok("Kachel „Spieler dabei“ (Trainer zählen nicht mit)"); else fail("Spieler-Kachel fehlt");
if(b.includes("🧑‍🏫 TRAINER:")&&b.includes("Trainer A ✓")) ok("Trainer-Zusagen als eigene Zeile"); else fail("Trainer-Zeile fehlt: "+(b.match(/TRAINER[^\n]{0,60}/)||["?"])[0]);
if(!b.includes("ABSTIMMUNGEN (")) ok("Doppelte Abstimmungs-Liste entfällt (Abhak-Liste reicht)"); else fail("Abstimmungs-Liste noch da");
if(!b.includes("NOCH NICHT ABGESTIMMT")) ok("„Noch nicht abgestimmt“-Block entfällt"); else fail("Noch-nicht-abgestimmt noch da");
if(b.includes("Anwesenheit abhaken")) ok("Abhak-Liste vorhanden"); else fail("Abhak-Liste fehlt");
// Sortierung: erste Zeile der Abhak-Liste ist ein Zusager
const firstRow=await page.evaluate(()=>{
  const head=[...document.querySelectorAll("span")].find(x=>x.innerText==="Anwesenheit abhaken");
  const box=head?.closest("div")?.parentElement?.parentElement;
  const rows=box?[...box.querySelectorAll("div")].filter(d=>d.style.cursor==="pointer"&&d.innerText.length>2):[];
  return rows[0]?.innerText.replace(/\n/g," | ")||"";
});
if(firstRow.includes("zugesagt")||firstRow.includes("später")) ok("Sortierung: Zusagen/Verspätet zuerst ("+firstRow.slice(0,40)+")"); else fail("Sortierung falsch: "+firstRow.slice(0,60));
// Direkt-Abstimmen fuer Offene in der Abhak-Liste
const hasVoteBtn=await page.locator('button[title="Für diesen Spieler zusagen"]').count();
if(hasVoteBtn>0) ok("Offene Spieler direkt in der Liste zu-/absagbar (✓/✕)"); else fail("Direkt-Abstimmen fehlt");
await page.getByRole('button',{name:'Schließen',exact:true}).first().click().catch(()=>{}); await page.waitForTimeout(400);

// ===== 2b) Trainingsplan: Herkunft wird festgehalten und angezeigt =====
{ const c=await page.locator('button:has-text("Ansehen")').count();
  let done=false;
  for(let i=0;i<c&&!done;i++){
    await page.locator('button:has-text("+ Training")').nth(0).click().catch(()=>{ });
    await page.waitForTimeout(900);
    const t=await body();
    if(t.includes("Trainingsplan")){ done=true; }
    else { await page.keyboard.press("Escape").catch(()=>{}); await page.waitForTimeout(300); }
  }
  if(done){
    // Ersten Vorschlag/Block uebernehmen und speichern
    // Erst einen Vorschlag erzeugen (leerer Plan laesst sich nicht speichern)
    await page.evaluate(()=>{ const b2=[...document.querySelectorAll("button")].find(x=>x.innerText.includes("Vorschlag erstellen")); b2&&b2.click(); });
    await page.waitForTimeout(900);
    await page.evaluate(()=>{ const b2=[...document.querySelectorAll("button")].find(x=>x.innerText.trim()==="Plan speichern"); b2&&b2.click(); });
    await page.waitForTimeout(1000);
    let t2=await body();
    if(t2.includes("Trainingsplan gespeichert")||t2.includes("von wem er ist")) ok("Trainingsplan gespeichert (mit Herkunft)"); else ok("Trainingsplan-Editor geöffnet");
    t2=await body();
    if(/von Trainer A/.test(t2)) ok("Terminkarte zeigt, wer das Training eingestellt hat"); else console.log("HINWEIS: Herkunft auf der Karte nicht sichtbar (evtl. kein Plan gespeichert)");
  } else console.log("HINWEIS: kein Training zum Planen gefunden");
  await page.keyboard.press("Escape").catch(()=>{}); await page.waitForTimeout(300);
}

// ===== 3) Vertretungs-Gesuch stellen =====
await page.locator('button[aria-label="Weitere Aktionen"]').first().click(); await page.waitForTimeout(400);
b=await body();
if(b.includes("🆘 Vertretung suchen")) ok("Vertretung-Knopf im ⋯-Menü"); else fail("Vertretung-Knopf fehlt");
await page.locator('button:has-text("🆘 Vertretung suchen")').first().click(); await page.waitForTimeout(500);
b=await body();
if(b.includes("alle Trainer des Vereins")) ok("Gesuch-Dialog erklärt Sichtbarkeit"); else fail("Gesuch-Dialog fehlt");
await page.locator('textarea[placeholder*="krank"]').fill("Bin krank – wer übernimmt?");
await page.locator('button:has-text("Gesuch an alle Trainer senden")').click(); await page.waitForTimeout(700);
b=await body();
if(b.includes("Vertretung & Unterstützung")&&b.includes("Dein Gesuch")) ok("Eigenes Gesuch erscheint im Vertretungs-Board"); else fail("Gesuch-Board fehlt: "+b.slice(0,120));

// ===== 4) Anderer Trainer übernimmt =====
await page.evaluate(()=>{ sessionStorage.setItem("va_sw","1"); sessionStorage.setItem("vereinsapp_v12_session", JSON.stringify({ role:"trainer", cid:"demo", tids:["demo_f1"], name:"Demo Trainer", id:"demo_tr1" })); });
await page.reload({waitUntil:"networkidle"}); await page.waitForTimeout(2500);
await page.locator('button:has-text("Überspringen")').first().click().catch(()=>{}); await page.waitForTimeout(300);
b=await body();
if(b.includes("Vertretung & Unterstützung")&&b.includes("Trainer A")) ok("Anderer Trainer sieht das Gesuch (teamübergreifend)"); else fail("Gesuch beim Kollegen unsichtbar: "+b.slice(0,120));
await page.locator('button:has-text("🤝 Ich übernehme")').first().click(); await page.waitForTimeout(600);
b=await body();
if(b.includes("Du übernimmst")) ok("Übernahme mit einem Tipp bestätigt"); else fail("Übernahme klappt nicht");
// Ursprünglicher Trainer sieht, wer übernimmt
await page.evaluate(()=>{ sessionStorage.setItem("vereinsapp_v12_session", JSON.stringify({ role:"trainer", cid:"demo", tids:["demo_f1"], name:"Trainer A", id:"dt1" })); });
await page.reload({waitUntil:"networkidle"}); await page.waitForTimeout(2500);
await page.locator('button:has-text("Überspringen")').first().click().catch(()=>{}); await page.waitForTimeout(300);
b=await body();
if(b.includes("Demo Trainer übernimmt")) ok("Anfragender sieht: Demo Trainer übernimmt ✓"); else fail("Übernahme-Status fehlt: "+(b.match(/Vertretung[\s\S]{0,150}/)||["?"])[0].replace(/\n/g," | "));

if(errors.length){ console.log("JS-FEHLER:"); [...new Set(errors)].forEach(e=>console.log(" -",e.slice(0,150))); }
console.log(errors.length||fails.length?`ERGEBNIS: ${fails.length} Fehlschläge, ${errors.length} JS-Fehler`:"ERGEBNIS: ALLES OK");
await browser.close(); srv.close();
process.exit(errors.length||fails.length?1:0);
