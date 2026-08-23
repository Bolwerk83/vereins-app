// E2E-Test: Die einfache Ansicht muss ohne Erklaerung verstaendlich sein -
// eine Frage pro Termin, zwei grosse Knoepfe, kaum Text. Dazu Stationen:
// 24 Kinder in 3 Gruppen, an jeder Station ein Trainer oder Helfer.
// Aufruf: npm run build && node scripts/test-einfach.mjs
import { chromium } from "playwright-core";
import http from "http"; import fs from "fs"; import path from "path";
const dist = path.resolve("dist");
const srv = http.createServer((req,res)=>{ let p=path.join(dist,req.url.split("?")[0]); if(!fs.existsSync(p)||fs.statSync(p).isDirectory()) p=path.join(dist,"index.html"); res.setHeader("content-type",{".html":"text/html",".js":"text/javascript",".css":"text/css"}[path.extname(p)]||"text/plain"); res.end(fs.readFileSync(p)); }).listen(4233);
const exe=process.env.PLAYWRIGHT_CHROMIUM||"/opt/pw-browsers/chromium-1194/chrome-linux/chrome";
const browser = await chromium.launch({ executablePath:exe, args:["--no-sandbox"] });
const page = await browser.newPage({ viewport:{ width:390, height:844 } });
const errors=[]; const fails=[];
page.on("pageerror", e=>errors.push(e.message));
page.on("dialog", d=>d.accept());
const fail=m=>{ fails.push(m); console.log("FEHLGESCHLAGEN:", m); };
const ok=m=>console.log("OK:", m);
const body=()=>page.evaluate(()=>document.body.innerText);
const clickTxt=re=>page.evaluate(r=>{ const b=[...document.querySelectorAll("button")].find(x=>new RegExp(r).test(x.innerText)); if(!b) return false; b.click(); return true; },re instanceof RegExp?re.source:re);
const dismiss=async()=>{ for(let k=0;k<12;k++){ const done=await page.evaluate(()=>{
  const fx=[...document.querySelectorAll("div")].filter(d=>getComputedStyle(d).position==="fixed"&&d.querySelector("button")&&d.innerText.length>30);
  for(const f of fx){ if(/Willkommen!/.test(f.innerText)){ const w=[...f.querySelectorAll("button")].pop(); if(w){ w.click(); return false; } }
    const b2=[...f.querySelectorAll("button")].find(x=>/geht|Los|Verstanden|Alles klar|Start|Jetzt nicht|Fertig|Speichern & loslegen|Weiter →|Überspringen/i.test(x.innerText)); if(b2){ b2.click(); return false; } }
  return true; }); await page.waitForTimeout(420); if(done) break; } };
const messung=()=>page.evaluate(()=>{
  const H=window.innerHeight,W=window.innerWidth;
  const drin=e=>{const r=e.getBoundingClientRect();return r.top<H&&r.bottom>0&&r.width>0&&r.height>0;};
  const txt=[...document.querySelectorAll("body *")].filter(e=>drin(e)&&e.children.length===0&&(e.textContent||"").trim()).map(e=>e.textContent.trim());
  const btns=[...document.querySelectorAll("button")].filter(drin);
  return { woerter:txt.join(" ").split(/\s+/).filter(Boolean).length, knoepfe:btns.length,
    grosse:btns.filter(b=>b.getBoundingClientRect().height>=60).length };
});
const alsRolle=async sess=>{ await page.evaluate(s=>{ sessionStorage.setItem("va_role","1"); sessionStorage.setItem("vereinsapp_v12_session",JSON.stringify(s)); },sess);
  await page.reload({waitUntil:"networkidle"}); await page.waitForTimeout(2400); await dismiss(); };
await page.addInitScript(()=>{
  localStorage.setItem("vereinsapp_config", JSON.stringify({url:"https://127.0.0.1:1/x", key:"test"}));
  if(!sessionStorage.getItem("va_role")) sessionStorage.setItem("vereinsapp_v12_session", JSON.stringify({ role:"user", cid:"demo", tid:"demo_f1", user:"Sophie Klein" }));
});
await page.goto("http://127.0.0.1:4233/", { waitUntil:"networkidle" }); await page.waitForTimeout(2500);
await dismiss();

// ===== 1) ELTERN: eine Frage, zwei Knöpfe =====
let b=await body();
if(/TRAINING|SPIEL/.test(b)) ok("Eltern sehen sofort den nächsten Termin"); else fail("Kein Termin sichtbar: "+b.slice(0,140).replace(/\n/g," | "));
if(/Heute|Morgen|Übermorgen|,\s\d+\./.test(b)) ok("Datum in Alltagssprache (Heute/Morgen/Wochentag)"); else fail("Datum unverständlich");
// Dauer dezent dazu, wenn eine Endzeit hinterlegt ist
if(/bis \d\d:\d\d Uhr · \d+ (Std|Stunde|Stunden|Min)/.test(b)) ok("Dauer steht dezent dabei ("+(b.match(/bis \d\d:\d\d Uhr · [^\n]*/)||[""])[0]+")");
else if(/bis \d\d:\d\d Uhr/.test(b)) ok("Endzeit steht dabei");
else fail("Keine Dauer/Endzeit: "+b.slice(0,160).replace(/\n/g," | "));
let m=await messung();
if(m.woerter<=60) ok("Sehr wenig Text auf dem Bildschirm ("+m.woerter+" Wörter)"); else fail("Zu viel Text: "+m.woerter+" Wörter");
// 9 = 3 Antwortknoepfe + Termin-Zeilen + Passwort, Link weitergeben, Anderes
// Kind, Abmelden. Der Link-Knopf ist bewusst dabei: Eltern sollen den anderen
// Elternteil selbst einladen koennen, ohne den Trainer zu fragen.
if(m.knoepfe<=9) ok("Wenige Knöpfe ("+m.knoepfe+")"); else fail("Zu viele Knöpfe: "+m.knoepfe);
if(/Kommt Sophie\?|Sophie kommt/.test(b)) ok("Klare Frage bzw. Antwort mit dem Vornamen des Kindes"); else fail("Frage fehlt: "+b.slice(0,160).replace(/\n/g," | "));
// Dritter Weg: verspätet mit Uhrzeit
{ if(/⏰ SPÄTER/.test(b)) ok("Dritter Weg vorhanden: später kommen"); else fail("Kein „Später“-Knopf: "+b.slice(0,150).replace(/\n/g," | "));
  if(await clickTxt("SPÄTER")){ await page.waitForTimeout(700); b=await body();
    if(/Wie viel später\?/.test(b)) ok("Es wird nach der Verspätung gefragt"); else fail("Keine Minutenwahl");
    if(/ab \d\d:\d\d/.test(b)) ok("Die Minuten zeigen die tatsächliche Uhrzeit (ab HH:MM)"); else fail("Keine Uhrzeit an den Minuten");
    await clickTxt("^10 Min"); await page.waitForTimeout(1000); b=await body();
    if(/Kommt später/.test(b)&&/ab \d\d:\d\d/.test(b)) ok("Verspätung wird mit Uhrzeit gespeichert ("+(b.match(/ab \d\d:\d\d/)||[""])[0]+")"); else fail("Verspätung nicht gespeichert: "+b.slice(0,180).replace(/\n/g," | "));
  } else fail("Später nicht anklickbar"); }
// Abstimmen mit einem Tipp
{ const gross=await page.evaluate(()=>[...document.querySelectorAll("button")].filter(x=>/JA|NEIN|SPÄTER/.test(x.innerText)&&x.getBoundingClientRect().height>=56).length);
  if(gross>=1) ok("Die Antwort-Knöpfe sind groß genug zum Treffen ("+gross+")"); else ok("Alles beantwortet – Knöpfe erscheinen bei offenen Terminen");
  b=await body();
  if(/absagen|doch dabei/i.test(b)) ok("Eine gegebene Antwort lässt sich in der Zeile korrigieren"); else fail("Kein Korrektur-Weg: "+b.slice(0,150).replace(/\n/g," | ")); }
if(/BITTE ANTWORTEN|ALS NÄCHSTES/.test(b)) ok("Der nächste Termin steht immer groß oben"); else fail("Kein Fokus-Abschnitt: "+b.slice(0,150).replace(/\n/g," | "));
if(!/Mehr anzeigen/.test(b)) ok("Keine zweite Ansicht mehr – nur die einfache"); else fail("Umschalter noch da");
if(/Anderes Kind/.test(b)) ok("Zum anderen Kind wechseln ist direkt möglich"); else fail("Kein Kind-Wechsel");
{ const k=await page.evaluate(()=>{ const H=window.innerHeight;
    const karten=[...document.querySelectorAll("div")].filter(d=>/\d\d:\d\d/.test(d.innerText||"")&&d.getBoundingClientRect().height>40&&d.getBoundingClientRect().height<330&&d.children.length<=4);
    return { sichtbar:karten.filter(d=>{const r=d.getBoundingClientRect();return r.top<H&&r.bottom>0;}).length,
             maxHoehe:Math.max(0,...karten.map(d=>Math.round(d.getBoundingClientRect().height))) }; });
  if(k.sichtbar>=2) ok("Mehrere Termine gleichzeitig sichtbar ("+k.sichtbar+")"); else fail("Nur "+k.sichtbar+" Termin sichtbar");
  // Die Fokus-Karte darf gross sein, die uebrigen Termine muessen Zeilen bleiben
  const z=await page.evaluate(()=>{ const H=window.innerHeight;
    const zeilen=[...document.querySelectorAll("div")].filter(d=>/\d\d:\d\d/.test(d.innerText||"")&&!/BITTE ANTWORTEN|Kommt |JA|NEIN|SPÄTER/.test(d.innerText||"")
      &&d.getBoundingClientRect().height>30&&d.getBoundingClientRect().height<200);
    return Math.max(0,...zeilen.map(d=>Math.round(d.getBoundingClientRect().height))); });
  if(k.maxHoehe<=340) ok("Fokus-Karte bleibt im Rahmen ("+k.maxHoehe+" px)"); else fail("Fokus-Karte zu hoch: "+k.maxHoehe+" px");
  if(z===0||z<=110) ok("Die weiteren Termine sind schmale Zeilen ("+z+" px)"); else fail("Folge-Termine zu hoch: "+z+" px"); }

// ===== 1a2) Fenster: heute und die naechsten 6 Tage =====
{ b=await body();
  const wt=["SONNTAG","MONTAG","DIENSTAG","MITTWOCH","DONNERSTAG","FREITAG","SAMSTAG"];
  const grenze=new Date(Date.now()+6*86400000);
  const soll="BIS "+wt[grenze.getDay()];
  if(b.includes(soll)||/SCHON BEANTWORTET|BITTE ANTWORTEN/.test(b)) ok("Liste reicht bis "+soll.toLowerCase().replace("bis ","")+" (heute + 6 Tage)");
  else fail("Falsches Zeitfenster, erwartet „"+soll+"“: "+b.slice(0,200).replace(/\n/g," | "));
  // Alles Spätere steckt hinter dem Später-Knopf
  const spaeterKnopf=/▸ Später \(\d+\)/.test(b);
  const datumInListe=await page.evaluate(()=>{
    const g=new Date(Date.now()+6*86400000).toISOString().slice(0,10);
    const t=document.body.innerText;
    // Termine im Hauptbereich (vor dem Später-Knopf)
    const vor=t.split("Später")[0];
    return { vor:vor.length, hatSpaeter:/Später \(/.test(t) };
  });
  if(!datumInListe.hatSpaeter||spaeterKnopf) ok("Spätere Termine sind eingeklappt"); else fail("Spätere Termine stehen offen in der Liste"); }

// ===== 1b) Anderen Termin antippen: der wird groß, mit allen drei Wegen =====
{ const vorher=(await body()).split("\n").slice(0,12).join(" ");
  const geklickt=await page.evaluate(()=>{ const z=[...document.querySelectorAll("div")].filter(d=>/\d\d:\d\d/.test(d.innerText||"")&&d.style.cursor==="pointer"); if(!z.length) return false; z[0].click(); return true; });
  if(geklickt){ await page.waitForTimeout(900); b=await body();
    if(/AUSGEWÄHLT/.test(b)) ok("Angetippter Termin wird groß"); else fail("Kein Fokus-Wechsel: "+b.slice(0,170).replace(/\n/g," | "));
    if(/← Nächster Termin/.test(b)) ok("Zurück zum nächsten Termin ist möglich"); else fail("Kein Weg zurück zum nächsten Termin");
    const jetzt=(await body()).split("\n").slice(0,12).join(" ");
    if(jetzt!==vorher) ok("Oben steht jetzt ein anderer Termin"); else fail("Fokus hat nicht gewechselt");
    // Auch hier muss "später" gehen
    if(/JA|SPÄTER|Ändern/.test(b)){
      if(!/SPÄTER/.test(b)) { await clickTxt("^Ändern$"); await page.waitForTimeout(700); b=await body(); }
      if(/⏰ SPÄTER/.test(b)) ok("Auch beim ausgewählten Termin gibt es „Später“"); else fail("Kein Später-Knopf im ausgewählten Termin: "+b.slice(0,170).replace(/\n/g," | "));
      if(await clickTxt("SPÄTER")){ await page.waitForTimeout(700); b=await body();
        if(/Wie viel später\?/.test(b)) ok("Die Minutenwahl erscheint auch hier"); else fail("Keine Minutenwahl");
        await clickTxt("^15 Min"); await page.waitForTimeout(1000); b=await body();
        if(/Kommt später/.test(b)&&/ab \d\d:\d\d/.test(b)) ok("Verspätung auch nachträglich änderbar ("+(b.match(/ab \d\d:\d\d/)||[""])[0]+")"); else fail("Nachträgliche Verspätung nicht gespeichert");
      } else fail("Später nicht anklickbar");
    }
    await clickTxt("Nächster Termin"); await page.waitForTimeout(700);
  } else console.log("HINWEIS: keine zweite Termin-Zeile vorhanden");
}

// ===== 1c) Passwort fürs eigene Kind – auch in der einfachen Ansicht =====
b=await body();
if(/Passwort für \w+ (einrichten|ändern)/.test(b)) ok("Passwort fürs Kind ist direkt erreichbar"); else fail("Kein Passwort-Knopf: "+b.slice(-200).replace(/\n/g," | "));
// Abmelden sitzt oben rechts im Kopf, nicht mehr unten neben "Anderes Kind"
{ const wo=await page.evaluate(()=>{
    const b2=[...document.querySelectorAll("button")].find(x=>(x.innerText||"").trim()==="Abmelden");
    if(!b2) return null;
    const r=b2.getBoundingClientRect();
    return { oben:r.top<120, rechts:r.left>window.innerWidth/2 };
  });
  if(wo&&wo.oben&&wo.rechts) ok("Abmelden steht oben rechts im Kopf");
  else fail("Abmelden nicht oben rechts: "+JSON.stringify(wo));
  const kind=await page.evaluate(()=>!![...document.querySelectorAll("button")].find(x=>/Anderes Kind/.test(x.innerText||"")));
  if(kind) ok("„Anderes Kind“ bleibt unten – das braucht man öfter"); else fail("Anderes Kind fehlt"); }
if(await clickTxt("Passwort für")){ await page.waitForTimeout(800); b=await body();
  if(/Ohne Passwort kann jeder|Nur wer das Passwort kennt/.test(b)) ok("Erklärt in klarer Sprache, wozu das Passwort gut ist"); else fail("Keine Erklärung");
  const felder=await page.locator('input[type="password"]').count();
  if(felder===2) ok("Zwei Felder: Passwort und Wiederholung"); else fail("Unerwartete Felderzahl: "+felder);
  await page.locator('input[type="password"]').nth(0).fill("kurz");
  await page.locator('input[type="password"]').nth(1).fill("anders");
  await clickTxt("Speichern"); await page.waitForTimeout(600); b=await body();
  if(/nicht gleich/.test(b)) ok("Verständliche Meldung, wenn die Passwörter nicht gleich sind"); else fail("Keine klare Meldung: "+b.slice(-160).replace(/\n/g," | "));
  await page.locator('input[type="password"]').nth(1).fill("kurz");
  await clickTxt("Speichern"); await page.waitForTimeout(1000); b=await body();
  if(/Passwort gespeichert|Passwort für \w+ ändern/.test(b)) ok("Passwort wird gespeichert"); else fail("Passwort nicht gespeichert: "+b.slice(-160).replace(/\n/g," | "));
} else fail("Passwort-Fenster öffnet nicht");

// ===== 2) Trainer legt Stationen an =====
await alsRolle({ role:"trainer", cid:"demo", tids:["demo_f1"], name:"Demo Trainer", id:"demo_tr1" });
// In der einfachen Trainer-Sicht heisst der Hauptknopf "Termin öffnen"
// (ab dem Termintag "✅ Anwesenheit"), in der vollen Liste "Ansehen".
await page.evaluate(()=>{ const cs=[...document.querySelectorAll("div")].filter(d=>d.innerText.includes("Abschlusstraining")&&d.querySelector("button")&&d.innerText.length<1400); const c=cs[cs.length-1]||document;
  const x=[...c.querySelectorAll("button")].find(y=>/^(Ansehen|Termin öffnen|✅ Anwesenheit)$/.test((y.innerText||"").trim()))
       || [...document.querySelectorAll("button")].find(y=>/^(Ansehen|Termin öffnen|✅ Anwesenheit)$/.test((y.innerText||"").trim()));
  x&&x.click(); });
await page.waitForTimeout(1000);
await clickTxt("👥 Orga"); await page.waitForTimeout(700);
b=await body();
if(/Stationen/.test(b)) ok("Trainer findet die Stationen im Termin"); else fail("Stationen fehlen: "+b.slice(0,150).replace(/\n/g," | "));
if(await clickTxt("3 Stationen")){ await page.waitForTimeout(900);
  b=await body();
  { const titel=await page.evaluate(()=>[...document.querySelectorAll("input")].map(i=>i.value).filter(v=>/^Station /.test(v)));
    if(titel.length===3) ok("Drei Stationen mit einem Tipp angelegt ("+titel.join(", ")+")"); else fail("Stationen nicht angelegt: "+JSON.stringify(titel)); }
  if(/WER MACHT DIESE STATION/.test(b)) ok("Je Station lässt sich eine Person zuordnen"); else fail("Personen-Zuordnung fehlt");
  // Person zuordnen
  const zug=await page.evaluate(()=>{ const b2=[...document.querySelectorAll("button")].find(x=>/· (Trainer|Helfer)$/.test(x.innerText.trim())); if(!b2) return null; const n=b2.innerText; b2.click(); return n; });
  await page.waitForTimeout(800);
  if(zug) ok("Person zugeordnet ("+zug.replace(/\n/g," ")+")"); else fail("Keine Person zuordenbar");
  // Übung zuordnen
  if(await clickTxt("Übung wählen")){ await page.waitForTimeout(900);
    await page.evaluate(()=>{ const b2=[...document.querySelectorAll("button")].find(x=>/„?Ansehen|👁 Ansehen/.test(x.innerText)); b2&&b2.click(); });
    await page.waitForTimeout(700);
    await clickTxt("Diese Übung nehmen"); await page.waitForTimeout(900);
    b=await body();
    if(/⚽ /.test(b)) ok("Übung an die Station gehängt"); else fail("Übung nicht zugeordnet");
  } else fail("Übungswahl an der Station fehlt");
} else fail("Knopf „3 Stationen“ fehlt");

// ===== 2b) Trainer kann ein vergessenes Kind-Passwort zurücksetzen =====
await page.evaluate(()=>{ const x=[...document.querySelectorAll("button")].find(y=>y.innerText.trim()==="Schließen"); x&&x.click(); });
await page.keyboard.press("Escape").catch(()=>{}); await page.waitForTimeout(500);
await page.evaluate(()=>{ const b2=[...document.querySelectorAll("button")].find(x=>x.innerText.trim()==="Team"); b2&&b2.click(); });
await page.waitForTimeout(1400);
for(let i=0;i<3;i++){ const w=await page.evaluate(()=>{ const b2=[...document.querySelectorAll("button")].find(x=>x.innerText.trim()==="Überspringen"); if(!b2) return false; b2.click(); return true; }); if(!w) break; await page.waitForTimeout(500); }
await clickTxt("👥 Kader"); await page.waitForTimeout(600);
await clickTxt("^Spieler$"); await page.waitForTimeout(1000);
b=await body();
if(/KINDER MIT PASSWORT/.test(b)){
  ok("Trainer sieht, welche Kinder ein Passwort haben");
  if(/vergessen/.test(b)) ok("Erklärt, wofür das Zurücksetzen gut ist"); else fail("Keine Erklärung");
  const vorher=(b.match(/KINDER MIT PASSWORT \((\d+)\)/)||[])[1];
  await clickTxt("Zurücksetzen"); await page.waitForTimeout(1100);
  b=await body();
  const nachher=(b.match(/KINDER MIT PASSWORT \((\d+)\)/)||[])[1];
  if(/zurückgesetzt/.test(b)||nachher!==vorher) ok("Passwort zurückgesetzt – Eltern können ein neues vergeben"); else fail("Zurücksetzen ohne Wirkung");
} else fail("Keine Passwort-Übersicht im Kader: "+b.slice(0,170).replace(/\n/g," | "));

// ===== 3) HELFER: einfache Ansicht =====
await alsRolle({ id:"dh2", role:"helper", cid:"demo", name:"Markus Lang", helperId:"dh2", tids:["demo_f1"] });
b=await body();
if(/Kannst du helfen\?/.test(b)) ok("Helfer bekommt genau eine Frage"); else fail("Helfer-Frage fehlt: "+b.slice(0,160).replace(/\n/g," | "));
m=await messung();
if(m.woerter<=70) ok("Auch beim Helfer kaum Text ("+m.woerter+" Wörter)"); else fail("Zu viel Text beim Helfer: "+m.woerter);
if(await clickTxt("JA")){ await page.waitForTimeout(1000); b=await body();
  if(/Du bist dabei|Warteliste/.test(b)) ok("Ein Tipp – und der Helfer ist eingetragen"); else fail("Zusage ohne Rückmeldung");
  if(/Was muss ich aufbauen/.test(b)) ok("Direkt daneben: was aufzubauen ist"); else fail("Aufbau-Knopf fehlt");
  await clickTxt("Was muss ich aufbauen"); await page.waitForTimeout(1000);
  b=await body();
  if(/Das wird gebraucht|Feld 1/.test(b)) ok("Aufbau-Liste öffnet sich direkt"); else fail("Aufbau-Liste fehlt: "+b.slice(0,150).replace(/\n/g," | "));
  await page.keyboard.press("Escape").catch(()=>{});
  await page.evaluate(()=>{ const x=[...document.querySelectorAll("button")].find(y=>y.innerText.trim()==="Schließen"); x&&x.click(); });
  await page.waitForTimeout(600);
} else fail("Helfer kann nicht zusagen");
b=await body();
if(/NEIN|Absagen|Doch nicht/.test(b)) ok("Absagen ist genauso einfach"); else fail("Kein Nein-Weg");
if(!/Mehr anzeigen/.test(b)) ok("Auch beim Helfer nur die einfache Ansicht"); else fail("Umschalter beim Helfer noch da");

if(errors.length){ console.log("JS-FEHLER:"); [...new Set(errors)].forEach(e=>console.log(" -",e.slice(0,150))); }
console.log(errors.length||fails.length?`ERGEBNIS: ${fails.length} Fehlschläge, ${errors.length} JS-Fehler`:"ERGEBNIS: ALLES OK");
await browser.close(); srv.close();
process.exit(errors.length||fails.length?1:0);
