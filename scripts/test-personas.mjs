// Intensiver Anwender-Check mit 500 Personas.
// Ablauf: Jedes Sitzungs-Profil (Rolle x Bildschirm x Sprache) wird einmal
// im echten Browser durchlaufen und vermessen (was ist sichtbar, laeuft etwas
// aus dem Bild, gibt es Fehler). Danach wird jede der 500 Personas mit ihren
// eigenen Erwartungen gegen diese Messwerte geprueft.
// Aufruf: npm run build && node scripts/test-personas.mjs
import { chromium } from "playwright-core";
import http from "http"; import fs from "fs"; import path from "path";
import { PROFILE, buildPersonas } from "./personas.mjs";
const dist = path.resolve("dist");
const srv = http.createServer((req,res)=>{ let p=path.join(dist,req.url.split("?")[0]); if(!fs.existsSync(p)||fs.statSync(p).isDirectory()) p=path.join(dist,"index.html"); res.setHeader("content-type",{".html":"text/html",".js":"text/javascript",".css":"text/css"}[path.extname(p)]||"text/plain"); res.end(fs.readFileSync(p)); }).listen(4229);
const exe=process.env.PLAYWRIGHT_CHROMIUM||"/opt/pw-browsers/chromium-1194/chrome-linux/chrome";
const browser = await chromium.launch({ executablePath:exe, args:["--no-sandbox"] });
const ctx = await browser.newContext({ viewport:{ width:390, height:844 } });
// Ein echter Kassenhelfer wird zuerst ueber die Oberflaeche angelegt
// (nur Rolle "Kasse", kein Einsatz) - sonst prueft man einen normalen Helfer.
const legeKassenhelferAn = async () => {
  const page=await ctx.newPage();
  page.on("dialog",d=>d.accept());
  await page.addInitScript(()=>{ localStorage.setItem("vereinsapp_config", JSON.stringify({url:"https://127.0.0.1:1/x", key:"test"}));
    sessionStorage.setItem("vereinsapp_v12_session", JSON.stringify({ role:"trainer", cid:"demo", tids:["demo_f1"], name:"Demo Trainer", id:"demo_tr1" })); });
  await page.goto("http://127.0.0.1:4229/",{waitUntil:"networkidle"}); await page.waitForTimeout(2400);
  await page.locator('button:has-text("Überspringen")').first().click({timeout:1200}).catch(()=>{});
  for(let k=0;k<12;k++){ const done=await page.evaluate(()=>{ const fx=[...document.querySelectorAll("div")].filter(d=>getComputedStyle(d).position==="fixed"&&d.querySelector("button")&&d.innerText.length>30);
    for(const f of fx){ if(/Willkommen!/.test(f.innerText)){ const w=[...f.querySelectorAll("button")].pop(); if(w){w.click(); return false;} }
      const b=[...f.querySelectorAll("button")].find(x=>/geht|Los|Verstanden|Alles klar|Start|Jetzt nicht|Fertig|Speichern & loslegen|Weiter →|Überspringen/i.test(x.innerText)); if(b){b.click(); return false;} } return true; });
    await page.waitForTimeout(380); if(done) break; }
  let id=null;
  try{
    await page.locator('button:has-text("Mehr")').last().click(); await page.waitForTimeout(700);
    await page.locator('button:has-text("Helfer")').last().click(); await page.waitForTimeout(800);
    await page.locator('button:has-text("+ Neuer Helfer")').click(); await page.waitForTimeout(500);
    await page.locator('input[placeholder*="Maria"]').fill("Kasse Karin"); await page.waitForTimeout(200);
    // Rollen sind Checkboxen: erst Kasse an, dann Einsatz aus (eine muss bleiben)
    const boxes=page.locator('input[type="checkbox"]');
    const n=await boxes.count();
    for(let i=0;i<n;i++){
      const lbl=await boxes.nth(i).evaluate(el=>(el.closest("label")?.innerText||"").slice(0,40));
      if(/Kasse/i.test(lbl)){ await boxes.nth(i).check().catch(()=>{}); await page.waitForTimeout(250); }
    }
    for(let i=0;i<n;i++){
      const lbl=await boxes.nth(i).evaluate(el=>(el.closest("label")?.innerText||"").slice(0,40));
      if(/Einsatz/i.test(lbl)){ await boxes.nth(i).uncheck().catch(()=>{}); await page.waitForTimeout(250); }
    }
    await page.locator('button:has-text("Speichern")').last().click(); await page.waitForTimeout(900);
    id=await page.evaluate(()=>{ try{ const raw=JSON.parse(localStorage.getItem("vereinsapp_v14")||"{}");
      const h=(raw.helpers||[]).find(x=>x.name==="Kasse Karin"); return h?{id:h.id,roles:h.roles||null}:null; }catch{ return null; } });
  }catch(e){ }
  await page.close();
  return id;
};
const SESS={
  trainer:{ role:"trainer", cid:"demo", tids:["demo_f1"], name:"Demo Trainer", id:"demo_tr1" },
  helfer :{ id:"dh2", role:"helper", cid:"demo", name:"Markus Lang", helperId:"dh2", tids:["demo_f1"] },
  kasse  :{ id:"dh3", role:"helper", cid:"demo", name:"Sabine Vogt", helperId:"dh3", tids:["demo_f1"] },
  eltern :{ role:"user", cid:"demo", tid:"demo_f1", user:"Ben Fischer" },
  admin  :{ role:"admin", cid:"demo", name:"Vereinsadmin", id:"demo_admin", tids:[] },
};
const messe = async prof => {
  const page = await ctx.newPage();
  await page.setViewportSize({ width:prof.w, height:prof.h });
  const errs=[];
  page.on("pageerror", e=>errs.push(e.message));
  page.on("dialog", d=>d.accept());
  await page.addInitScript(([sess,lang])=>{
    localStorage.setItem("vereinsapp_config", JSON.stringify({url:"https://127.0.0.1:1/x", key:"test"}));
    localStorage.setItem("vereinsapp_lang", lang);
    localStorage.setItem("va_lang", lang);
    sessionStorage.setItem("vereinsapp_v12_session", JSON.stringify(sess));
  },[SESS[prof.rolle], prof.lang]);
  const txt=()=>page.evaluate(()=>document.body.innerText);
  const over=()=>page.evaluate(()=>{
    const d=document.documentElement;
    const breit=[...document.querySelectorAll("body *")].filter(e=>{
      const r=e.getBoundingClientRect(); return r.width>0&&r.right>d.clientWidth+2&&getComputedStyle(e).position!=="fixed";
    }).slice(0,3).map(e=>(e.tagName+"."+String(e.className||"").slice(0,20)+" ›"+(e.innerText||"").slice(0,28)).replace(/\n/g," "));
    return { scrollt: d.scrollWidth>d.clientWidth+2, breit };
  });
  const klick=async re=>page.evaluate(r=>{ const b=[...document.querySelectorAll("button")].find(x=>new RegExp(r).test(x.innerText)); if(!b) return false; b.click(); return true; },re instanceof RegExp?re.source:re);
  const klickExakt=async l=>page.evaluate(x=>{ const b=[...document.querySelectorAll("button")].find(y=>y.innerText.trim()===x); if(!b) return false; b.click(); return true; },l);
  const weg=async()=>{ for(let k=0;k<14;k++){ const done=await page.evaluate(()=>{
    const fx=[...document.querySelectorAll("div")].filter(d=>getComputedStyle(d).position==="fixed"&&d.querySelector("button")&&d.innerText.length>30);
    for(const f of fx){ if(/Willkommen!/.test(f.innerText)){ const w=[...f.querySelectorAll("button")].pop(); if(w){w.click(); return false;} }
      const b=[...f.querySelectorAll("button")].find(x=>/geht|Los|Verstanden|Alles klar|Start|Jetzt nicht|Fertig|Speichern & loslegen|Weiter →|Überspringen/i.test(x.innerText)); if(b){ b.click(); return false; } }
    return true; }); await page.waitForTimeout(380); if(done) break; } };
  const ziele=()=>page.evaluate(()=>{
    const klein=[...document.querySelectorAll("button")].filter(b=>{ const r=b.getBoundingClientRect();
      return r.width>0&&r.height>0&&r.height<34&&(b.innerText||"").trim().length>2&&getComputedStyle(b).display!=="none"; })
      .slice(0,4).map(b=>`${(b.innerText||"").replace(/\n/g," ").slice(0,22)} (${Math.round(b.getBoundingClientRect().height)}px)`);
    return klein;
  });
  const fakt={ start:"", termin:"", aufbau:"", mehr:"", log:"", nav:[], overflow:{}, ziele:{}, fehler:[], crash:false };
  try{
    await page.goto("http://127.0.0.1:4229/", { waitUntil:"networkidle" }); await page.waitForTimeout(2400);
    await page.locator('button:has-text("Überspringen")').first().click({timeout:1200}).catch(()=>{});
    await weg();
    fakt.start=await txt(); fakt.overflow.start=await over(); fakt.ziele.start=await ziele();
    fakt.nav=await page.evaluate(()=>[...document.querySelectorAll("button")].map(b=>b.innerText.trim()).filter(x=>x&&x.length<16).slice(-8));
    // Termin oeffnen
    if(await klickExakt("Ansehen")){ await page.waitForTimeout(900);
      fakt.termin=await txt(); fakt.overflow.termin=await over();
      await page.evaluate(()=>{ const x=[...document.querySelectorAll("button")].find(y=>y.innerText.trim()==="Schließen"); x&&x.click(); });
      await page.keyboard.press("Escape").catch(()=>{}); await page.waitForTimeout(500);
    }
    // Aufbau oeffnen
    if(await klick("🏗 Aufbau")){ await page.waitForTimeout(1100);
      fakt.aufbau=await txt(); fakt.overflow.aufbau=await over();
      await page.evaluate(()=>{ const x=[...document.querySelectorAll("button")].find(y=>y.innerText.trim()==="Schließen"); x&&x.click(); });
      await page.keyboard.press("Escape").catch(()=>{}); await page.waitForTimeout(500);
    }
    // Mehr-Bereich und Entwicklungs-Log
    if(await klickExakt("Mehr")){ await page.waitForTimeout(800); fakt.mehr=await txt();
      if(await klick("📈 Entwicklung")){ await page.waitForTimeout(900); fakt.log=await txt(); fakt.overflow.log=await over(); }
    }
    const ende=await txt();
    fakt.crash=/schiefgelaufen/.test(ende+fakt.start+fakt.termin+fakt.aufbau+fakt.log);
  }catch(e){ fakt.fehler.push("Rundgang: "+e.message.slice(0,120)); }
  fakt.fehler.push(...[...new Set(errs)].map(e=>e.slice(0,120)));
  await page.close();
  return fakt;
};
const kh=await legeKassenhelferAn();
if(kh&&kh.id){ SESS.kasse={ id:kh.id, role:"helper", cid:"demo", name:"Kasse Karin", helperId:kh.id, tids:["demo_f1"] };
  console.log("Kassenhelfer angelegt: "+kh.id+" roles="+JSON.stringify(kh.roles)); }
else console.log("HINWEIS: Kassenhelfer konnte nicht angelegt werden – Profil läuft mit normalem Helfer.");
console.log("Vermesse "+PROFILE.length+" Sitzungs-Profile …");
const F={};
for(const p of PROFILE){ F[p.id]=await messe(p); console.log("  ✓ "+p.id+(F[p.id].fehler.length?"  ⚠ "+F[p.id].fehler.length+" Fehler":"")); }
srv.close(); await ctx.close(); await browser.close();

// ---- Personas gegen die Messwerte pruefen ----
const personas=buildPersonas(500);
const befunde=new Map();   // Schluessel -> {text, personas:[], rollen:Set}
const merke=(key,text,p)=>{ if(!befunde.has(text)) befunde.set(text,{text,personas:[],rollen:new Set(),profile:new Set()}); const b=befunde.get(text); b.personas.push(p.id); b.rollen.add(p.rolle); b.profile.add(p.profil); };
let okP=0, geprueft=0;
for(const p of personas){
  const f=F[p.profil]; let sauber=true;
  for(const e of p.erwartungen){
    geprueft++;
    const raum = e.wo?(f[e.wo]||""):"";
    if(e.art==="sichtbar"){
      if(!raum.includes(e.was)){ sauber=false; merke(`${p.profil}|fehlt|${e.wo}|${e.was}`,`„${e.was}" fehlt in „${e.wo}" (${e.grund})`,p); }
    } else if(e.art==="unsichtbar"){
      if(raum.includes(e.was)){ sauber=false; merke(`${p.profil}|zuviel|${e.wo}|${e.was}`,`„${e.was}" ist in „${e.wo}" sichtbar, sollte es aber nicht sein (${e.grund})`,p); }
    } else if(e.art==="kein_overflow"){
      const o=f.overflow[e.wo];
      if(o&&o.scrollt){ sauber=false; merke(`${p.profil}|overflow|${e.wo}`,`In „${e.wo}" läuft etwas aus dem Bildschirm: ${(o.breit||[]).join(" · ")||"?"} (${e.grund})`,p); }
    } else if(e.art==="tippziele"){
      const z=f.ziele[e.wo]||[];
      if(z.length){ sauber=false; merke(`${p.profil}|tippziel|${e.wo}`,`Zu kleine Knöpfe in „${e.wo}": ${z.join(" · ")} (${e.grund})`,p); }
    } else if(e.art==="sauber"){
      const m=(raum.match(/NaN|undefined|\bnull\b|\b0 Bälle\b|\b0 Hütchen\b/g)||[]);
      if(m.length){ sauber=false; merke(`${p.profil}|kaputt|${e.wo}|${m[0]}`,`Kaputte Angabe in „${e.wo}": ${[...new Set(m)].join(", ")} (${e.grund})`,p); }
    } else if(e.art==="sprache"){
      const lang=(PROFILE.find(x=>x.id===p.profil)||{}).lang;
      if(lang&&lang!=="de"){
        // Die Navigation muss der gewaehlten Sprache folgen - daran haengt,
        // ob man sich ueberhaupt zurechtfindet.
        const navDeutsch=(f.nav||[]).filter(x=>["Termine","Mannschaft","Taktik","Platz","Mehr","Kasse"].includes(x));
        if(navDeutsch.length){ sauber=false; merke(`sprache-nav-${lang}`,`Navigation bleibt deutsch, obwohl „${lang}" gewählt ist: ${navDeutsch.join(", ")}`,p); }
      }
    } else if(e.art==="keine_fehler"){
      if(f.crash||f.fehler.length){ sauber=false; merke(`${p.profil}|fehler`,`Technischer Fehler: ${f.crash?"Fehlerseite":""} ${f.fehler.join(" | ")}`.trim(),p); }
    }
  }
  if(sauber) okP++;
}
const liste=[...befunde.values()].sort((a,b)=>b.personas.length-a.personas.length);
console.log("\n================ 500-PERSONA-CHECK ================");
console.log(`Personas ohne Befund: ${okP}/500   ·   geprüfte Erwartungen: ${geprueft}`);
console.log(`Verschiedene Befunde: ${liste.length}`);
liste.forEach((b,i)=>console.log(`\n${i+1}. [${b.personas.length} Personas · ${[...b.rollen].join(", ")} · ${[...b.profile].join(", ")}]\n   ${b.text}`));
// Bericht schreiben
const md=["# Anwender-Check mit 500 Personas","",
  `Stand: ${new Date().toISOString().slice(0,10)}`,"",
  `- Sitzungs-Profile vermessen: **${PROFILE.length}** (Rolle × Bildschirmbreite × Sprache)`,
  `- Personas geprüft: **500**`,
  `- Geprüfte Erwartungen: **${geprueft}**`,
  `- Personas ohne Befund: **${okP}/500**`,
  `- Verschiedene Befunde: **${liste.length}**`,"","## Befunde",""];
liste.forEach((b,i)=>md.push(`**${i+1}. ${b.text}**  \nBetrifft ${b.personas.length} Personas (${[...b.rollen].join(", ")}) in den Profilen ${[...b.profile].join(", ")} – z. B. ${b.personas.slice(0,5).join(", ")}`,""));
if(!liste.length) md.push("Keine Befunde – alle 500 Personas kamen sauber durch.","");
// Ehrliche Beobachtungen jenseits der Erwartungen
md.push("## Beobachtungen (kein Fehlschlag, aber bekannt)","");
const enProf=PROFILE.filter(p=>p.lang!=="de");
enProf.forEach(p=>{
  const f=F[p.id]; if(!f) return;
  const deutsch=["Anstehende Termine","Mannschaften","Rückmeldungen","Das wird gebraucht","Spielzüge","Entwicklung","Material"].filter(w=>(f.start+f.aufbau+f.mehr+f.log).includes(w));
  md.push(`- **${p.id}** (Sprache ${p.lang}): Navigation übersetzt (${(f.nav||[]).slice(0,6).join(", ")}). Inhaltlich weiterhin deutsch: ${deutsch.length?deutsch.join(", "):"– nichts gefunden"}.`);
});
md.push("", "Die Sprachwahl greift in der Navigation und im Eltern-/Spieler-Bereich. Die Trainer- und Helfer-Inhalte (Kacheln, Erklärtexte, Aufbau, Spielzüge, Material, Entwicklungs-Log) sind bewusst noch deutsch – eine vollständige Übersetzung dieser Bereiche wäre ein eigenes Paket.","");
md.push("## Profile","", "| Profil | Rolle | Breite | Sprache | Fehler |","|---|---|---|---|---|");
PROFILE.forEach(p=>md.push(`| ${p.id} | ${p.rolle} | ${p.w}px | ${p.lang} | ${F[p.id].fehler.length||(F[p.id].crash?"Fehlerseite":"–")} |`));
fs.writeFileSync("persona-report.md", md.join("\n"));
console.log("\nBericht: persona-report.md");
process.exit(liste.length?1:0);
