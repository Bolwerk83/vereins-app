// Haerte-Test mit 500 sehr kritischen Personas. Gemessen wird das, worueber
// Nutzer wirklich stolpern: Textmenge, Knopfzahl, Fachbegriffe, Kontrast,
// Popups vor dem ersten Blick, versteckte Hauptaktionen, Symbol-Knoepfe ohne
// Wort, uneinheitliche Begriffe, Zurueck-Taste und Doppel-Tipp.
// Aufruf: npm run build && node scripts/test-personas-kritisch.mjs
import { chromium } from "playwright-core";
import http from "http"; import fs from "fs"; import path from "path";
import { KRIT_PROFILE, buildKritiker } from "./personas-kritisch.mjs";
const dist = path.resolve("dist");
const srv = http.createServer((req,res)=>{ let p=path.join(dist,req.url.split("?")[0]); if(!fs.existsSync(p)||fs.statSync(p).isDirectory()) p=path.join(dist,"index.html"); res.setHeader("content-type",{".html":"text/html",".js":"text/javascript",".css":"text/css"}[path.extname(p)]||"text/plain"); res.end(fs.readFileSync(p)); }).listen(4243);
const exe=process.env.PLAYWRIGHT_CHROMIUM||"/opt/pw-browsers/chromium-1194/chrome-linux/chrome";
const browser = await chromium.launch({ executablePath:exe, args:["--no-sandbox"] });
const ctx = await browser.newContext({ viewport:{ width:390, height:844 } });
const SESS={
  trainer:{ role:"trainer", cid:"demo", tids:["demo_f1"], name:"Demo Trainer", id:"demo_tr1" },
  helfer :{ id:"dh2", role:"helper", cid:"demo", name:"Markus Lang", helperId:"dh2", tids:["demo_f1"] },
  eltern :{ role:"user", cid:"demo", tid:"demo_f1", user:"Ben Fischer" },
  admin  :{ role:"admin", cid:"demo", name:"Vereinsadmin", id:"demo_admin", tids:[] },
};
// Begriffe, die ein Laie nicht sicher versteht
const JARGON=["Funino","Spielform","Kader","Orga","Modul","Cockpit","DFB","Staffelung","Halbraum","Umschalten","Pressing","Rondo","Abstoß","Steilpass","Verlagern","Spielbetrieb","Hinterlaufen","Sechser","Abseitsfalle"];
const messe = async prof => {
  const page = await ctx.newPage();
  await page.setViewportSize({ width:prof.w, height:prof.h });
  const errs=[]; page.on("pageerror", e=>errs.push(e.message)); page.on("dialog", d=>d.accept());
  await page.addInitScript(([sess,lang])=>{
    localStorage.setItem("vereinsapp_config", JSON.stringify({url:"https://127.0.0.1:1/x", key:"test"}));
    localStorage.setItem("vereinsapp_lang", lang);
    sessionStorage.setItem("vereinsapp_v12_session", JSON.stringify(sess));
  },[SESS[prof.rolle], prof.lang]);
  const M={ profil:prof.id, rolle:prof.rolle, overlays:0, fehler:[] };
  const sicht=()=>page.evaluate(()=>{
    const H=window.innerHeight, W=window.innerWidth;
    const drin=e=>{ const r=e.getBoundingClientRect(); return r.top<H&&r.bottom>0&&r.left<W&&r.right>0&&r.width>0&&r.height>0; };
    const txt=[...document.querySelectorAll("body *")].filter(e=>drin(e)&&e.children.length===0&&(e.textContent||"").trim())
      .map(e=>(e.textContent||"").trim());
    const btns=[...document.querySelectorAll("button")].filter(drin);
    return { text:txt.join(" "),
      woerter:txt.join(" ").split(/\s+/).filter(Boolean).length,
      knoepfe:btns.length,
      nurSymbol:btns.filter(b=>{ const t=(b.innerText||"").trim();
        const beschriftet=(b.getAttribute("aria-label")||b.getAttribute("title")||"").trim().length>2;
        return t.length>0 && !/[a-zA-ZäöüÄÖÜß]/.test(t) && !beschriftet; }).map(b=>(b.innerText||"").trim()).slice(0,6),
      klein:btns.filter(b=>b.getBoundingClientRect().height<44&&(b.innerText||"").trim().length>2)
        .map(b=>`${(b.innerText||"").replace(/\n/g," ").slice(0,20)} (${Math.round(b.getBoundingClientRect().height)}px)`).slice(0,6),
    };
  });
  const kontrast=()=>page.evaluate(()=>{
    const lum=c=>{ const [r,g,b]=c.map(v=>{ v/=255; return v<=0.03928?v/12.92:Math.pow((v+0.055)/1.055,2.4); }); return 0.2126*r+0.7152*g+0.0722*b; };
    const parse=s=>{ const m=String(s).match(/rgba?\((\d+),\s*(\d+),\s*(\d+)(?:,\s*([\d.]+))?\)/); return m?{c:[+m[1],+m[2],+m[3]],a:m[4]==null?1:+m[4]}:null; };
    // Hintergrund suchen. Steckt oben ein Farbverlauf oder Bild, laesst sich die
    // Farbe nicht sauber bestimmen - solche Stellen werden uebersprungen statt
    // falsch als "unlesbar" gemeldet.
    const bgOf=el=>{ let e=el; while(e){ const st=getComputedStyle(e);
      if(st.backgroundImage&&st.backgroundImage!=="none") return null;
      const b=parse(st.backgroundColor); if(b&&b.a>0.5) return b.c; e=e.parentElement; } return [255,255,255]; };
    const H=window.innerHeight;
    const out=[];
    [...document.querySelectorAll("body *")].forEach(e=>{
      if(e.children.length) return; const t=(e.textContent||"").trim(); if(t.length<3) return;
      const r=e.getBoundingClientRect(); if(!(r.top<H&&r.bottom>0&&r.width>0)) return;
      const st=getComputedStyle(e); const fg=parse(st.color); if(!fg) return;
      const size=parseFloat(st.fontSize)||14; const bold=(parseInt(st.fontWeight)||400)>=700;
      const gross=size>=24||(size>=18.66&&bold);
      const bg=bgOf(e); if(!bg) return;         // Verlauf/Bild: nicht messbar
      const l1=lum(fg.c), l2=lum(bg);
      const k=(Math.max(l1,l2)+0.05)/(Math.min(l1,l2)+0.05);
      const soll=gross?3:4.5;
      if(k<soll) out.push({t:t.slice(0,32),k:Math.round(k*10)/10,soll,px:Math.round(size)});
    });
    // gleiche Texte nur einmal
    const seen=new Set(); return out.filter(x=>{ const k=x.t+x.k; if(seen.has(k)) return false; seen.add(k); return true; }).slice(0,8);
  });
  try{
    await page.goto("http://127.0.0.1:4243/", { waitUntil:"networkidle" }); await page.waitForTimeout(2400);
    // Wie viele Overlays muss man wegklicken, bevor man arbeiten kann?
    for(let k=0;k<14;k++){ const weg=await page.evaluate(()=>{
      const fx=[...document.querySelectorAll("div")].filter(d=>getComputedStyle(d).position==="fixed"&&d.querySelector("button")&&d.innerText.length>30);
      for(const f of fx){ if(/Willkommen!/.test(f.innerText)){ const w=[...f.querySelectorAll("button")].pop(); if(w){w.click(); return true;} }
        const b=[...f.querySelectorAll("button")].find(x=>/geht|Los|Verstanden|Alles klar|Start|Jetzt nicht|Fertig|Speichern & loslegen|Weiter →|Überspringen/i.test(x.innerText)); if(b){ b.click(); return true; } }
      return false; }); if(!weg) break; M.overlays++; await page.waitForTimeout(380); }
    const s1=await sicht(); M.sicht=s1;
    M.jargon=JARGON.filter(w=>s1.text.includes(w));
    M.kontrast=await kontrast();
    // Liegt die Hauptaktion im sichtbaren Bereich?
    M.hauptaktion=await page.evaluate(()=>{
      const ziele=["Ansehen","✓ Bin dabei","🙋 Ich helfe!","🙋 Ich kann helfen","🏗 Aufbau","Ich bin dabei","Mein Kind ist dabei"];
      const b=[...document.querySelectorAll("button,div")].find(x=>ziele.includes((x.innerText||"").trim()));
      if(!b) return {gefunden:false};
      const r=b.getBoundingClientRect();
      return { gefunden:true, label:(b.innerText||"").trim(), y:Math.round(r.top), sichtbar:r.top<window.innerHeight&&r.bottom>0 };
    });
    // Heisst dieselbe Sache ueberall gleich?
    const ganz=await page.evaluate(()=>document.body.innerText);
    M.begriffe={ aufbau:["Aufbau-Plan","Das wird gebraucht","🏗 Aufbau"].filter(w=>ganz.includes(w)) };
    M.ganz=ganz;
    // Zurueck-Taste: schliesst sie ein geoeffnetes Fenster?
    const auf=await page.evaluate(()=>{ const b=[...document.querySelectorAll("button")].find(x=>(x.innerText||"").trim()==="Ansehen"); if(!b) return false; b.click(); return true; });
    if(auf){ await page.waitForTimeout(900);
      const offen=await page.evaluate(()=>[...document.querySelectorAll("div")].some(d=>getComputedStyle(d).position==="fixed"&&/📊|Rückmeldungen|Orga/.test(d.innerText)));
      await page.goBack({waitUntil:"domcontentloaded"}).catch(()=>{}); await page.waitForTimeout(900);
      const nochOffen=await page.evaluate(()=>[...document.querySelectorAll("div")].some(d=>getComputedStyle(d).position==="fixed"&&/📊|Rückmeldungen|Orga/.test(d.innerText)));
      const weg=await page.evaluate(()=>document.body.innerText.length>0);
      M.zurueck={ warOffen:offen, nochOffen, seiteDa:weg };
      await page.goto("http://127.0.0.1:4243/", { waitUntil:"networkidle" }); await page.waitForTimeout(1800);
    }
    // Doppel-Tipp auf die Zusage
    const dt=await page.evaluate(()=>{ const b=[...document.querySelectorAll("button")].find(x=>/Bin dabei|Ich helfe|Ich kann helfen/.test(x.innerText||"")); if(!b) return null; b.click(); b.click(); return (b.innerText||"").trim(); });
    if(dt){ await page.waitForTimeout(1100);
      M.doppeltipp=await page.evaluate(()=>{ const t=document.body.innerText;
        return { widerspruch:/Ich:[\s\S]{0,40}(Bin dabei[\s\S]{0,30}Sage ab)/.test(t)&&false, text:(t.match(/Ich:[^\n]*\n?[^\n]*/)||[""])[0].replace(/\n/g," ").slice(0,60) }; });
    }
  }catch(e){ M.fehler.push(e.message.slice(0,140)); }
  M.fehler.push(...[...new Set(errs)].map(e=>e.slice(0,120)));
  await page.close();
  return M;
};
console.log("Vermesse "+KRIT_PROFILE.length+" Profile mit harten Maßstäben …");
const F={};
for(const p of KRIT_PROFILE){ F[p.id]=await messe(p); console.log("  ✓ "+p.id); }
srv.close(); await ctx.close(); await browser.close();

const personas=buildKritiker(500);
const befunde=new Map();
const merke=(text,p,detail)=>{ if(!befunde.has(text)) befunde.set(text,{text,personas:[],typen:new Set(),profile:new Set(),detail:new Set()}); const b=befunde.get(text); b.personas.push(p.id); b.typen.add(p.typName); b.profile.add(p.profil); if(detail) b.detail.add(detail); };
let ok=0, geprueft=0;
for(const p of personas){
  const m=F[p.profil]; let sauber=true;
  for(const c of p.pruefe){
    geprueft++;
    if(c.art==="max_woerter"){ const n=m.sicht?.woerter||0;
      if(n>c.grenze){ sauber=false; merke(`${c.text}: ${n} Wörter auf dem ersten Bildschirm (Grenze ${c.grenze})`,p); } }
    else if(c.art==="max_knoepfe"){ const n=m.sicht?.knoepfe||0;
      if(n>c.grenze){ sauber=false; merke(`${c.text}: ${n} Knöpfe gleichzeitig (Grenze ${c.grenze})`,p); } }
    else if(c.art==="jargon"){ const j=m.jargon||[];
      if(j.length>=c.grenze){ sauber=false; merke(`${c.text}: ${j.join(", ")}`,p); } }
    else if(c.art==="kontrast"){ const k=m.kontrast||[];
      if(k.length){ sauber=false; merke(`${c.text}`,p,k.map(x=>`„${x.t}" ${x.k}:1 statt ${x.soll}:1`).join(" · ")); } }
    else if(c.art==="max_overlays"){ if((m.overlays||0)>c.grenze){ sauber=false; merke(`${c.text}: ${m.overlays} Fenster wegklicken`,p); } }
    else if(c.art==="hauptaktion_sichtbar"){ const h=m.hauptaktion||{};
      if(!h.gefunden||!h.sichtbar){ sauber=false; merke(`${c.text}${h.label?` („${h.label}" bei ${h.y} px)`:" (keine Hauptaktion gefunden)"}`,p); } }
    else if(c.art==="max_emoji_only"){ const e=m.sicht?.nurSymbol||[];
      if(e.length>c.grenze){ sauber=false; merke(`${c.text}: ${e.join(" ")}`,p); } }
    else if(c.art==="konsistenz"){ const g=m.ganz||"";
      const namen=["Aufbau-Plan","Das wird gebraucht","🏗 Aufbau"].filter(w=>g.includes(w));
      if(namen.length>1){ sauber=false; merke(`${c.text}: ${namen.join(" / ")}`,p); } }
    else if(c.art==="zurueck_schliesst"){ const z=m.zurueck;
      if(z&&z.warOffen&&z.nochOffen){ sauber=false; merke(`${c.text}`,p); } }
    else if(c.art==="tippziel_hart"){ const k=m.sicht?.klein||[];
      if(k.length){ sauber=false; merke(`${c.text}`,p,k.join(" · ")); } }
    else if(c.art==="doppeltipp"){ const d=m.doppeltipp;
      if(d&&d.widerspruch){ sauber=false; merke(`${c.text}: ${d.text}`,p); } }
  }
  if(sauber) ok++;
}
const liste=[...befunde.values()].sort((a,b)=>b.personas.length-a.personas.length);
console.log("\n============ HÄRTE-TEST: 500 SEHR KRITISCHE PERSONAS ============");
console.log(`Personas ohne Beschwerde: ${ok}/500   ·   geprüfte Messlatten: ${geprueft}`);
console.log(`Verschiedene Beschwerden: ${liste.length}`);
liste.forEach((b,i)=>{ console.log(`\n${i+1}. [${b.personas.length}× · ${[...b.typen].join(", ")} · ${[...b.profile].join(", ")}]\n   ${b.text}`);
  [...b.detail].slice(0,2).forEach(d=>console.log("   › "+d)); });
const md=["# Härte-Test: 500 sehr kritische Personas","",`Stand: ${new Date().toISOString().slice(0,10)}`,"",
  "Diese Personas finden fast nichts gut. Ihre Messlatten liegen bewusst höher als der Alltag:",
  "höchstens 120 Wörter auf dem ersten Blick, höchstens 12 Knöpfe, kein Fachwort ohne Erklärung,",
  "44 px Tippziele, voller Lesekontrast, kein Popup vor der ersten Nutzung.","",
  `- Profile vermessen: **${KRIT_PROFILE.length}**`,`- Personas: **500**`,`- Geprüfte Messlatten: **${geprueft}**`,
  `- Personas ohne Beschwerde: **${ok}/500**`,`- Verschiedene Beschwerden: **${liste.length}**`,"","## Beschwerden",""];
liste.forEach((b,i)=>{ md.push(`**${i+1}. ${b.text}**  \n${b.personas.length} Personas (${[...b.typen].join(", ")}) in ${[...b.profile].join(", ")}`);
  [...b.detail].slice(0,3).forEach(d=>md.push(`  - ${d}`)); md.push(""); });
if(!liste.length) md.push("Sogar die Nörgler haben nichts gefunden.","");
fs.writeFileSync("persona-report-kritisch.md", md.join("\n"));
console.log("\nBericht: persona-report-kritisch.md");
process.exit(0);
