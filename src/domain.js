// ----------------------------------------------------------------
// Fach-Logik (Domain): Skill-Achsen und Soll-Werte, zentrale Trainings-
// Fokus-Ermittlung, Auto-Trainingsplaene, Uebungs-Feedback-Gewichtung,
// Pausen-/No-Show-Helfer, Betreuer-Schluessel und Audit-Log.
// Kein React - von Trainer-Dashboard, Insights und Planern gemeinsam genutzt.
// ----------------------------------------------------------------
import { DRILL_LIB, TRAINING_TEMPLATES } from "./drills.js";
import { round2, clampSkill, monthKey, skillsMean } from "./logic.js";
import { CAT_YEARS } from "./dfb.js";

// Audit-Log speichern (append-only, max 500 Eintraege)
// Anwesenheit: hat ein Spieler bei einem Termin zugesagt (Dabei/Verspätet)?
export const _votedYes = (ev,name)=>{ const v=(ev.votes||{})[name]; const val=(typeof v==="object"&&v)?v.val:v; return val==="yes"; };

// No-Show-Termine: Anwesenheit wurde abgehakt, Spieler hat zugesagt, war aber nicht als anwesend markiert.
// Pausiert/Verletzt: Kind ist bis einschliesslich pausedUntil aus Planung,
// Gruppen, Vorschlaegen und No-Show-Logik ausgenommen.
export const isPausedP = (p, tod=null)=> !!(p?.pausedUntil && p.pausedUntil >= (tod||new Date().toISOString().slice(0,10)));

// Übungs-Feedback (👍/👎 nach dem Training): Generatoren bevorzugen Übungen,
// die bei EUREN Kindern gut ankamen (Score je Übungs-Id, vereinsweit).
export const drillScores = (data, cid) => { const m={}; (data?.drillFeedback||[]).forEach(fb=>{ if(cid&&fb.cid!==cid) return; if(!fb.drillId) return; m[fb.drillId]=(m[fb.drillId]||0)+(fb.vote>0?1:-1); }); return m; };

export const drillVoteOf = (data, evId, drillId) => (data?.drillFeedback||[]).find(fb=>fb.evId===evId&&fb.drillId===drillId)?.vote||0;

export const playerNoShowEvents = (events, name)=> (events||[]).filter(e=> e && e.present && Object.keys(e.present).length>0 && _votedYes(e,name) && !e.present[name]);

export const NO_SHOW_HINT_THRESHOLD = 2; // ab so vielen No-Shows Hinweis an Eltern + Audit

export const addAuditLog = (data, save, entry) => {
  const log = [...(data.securityLog || []), entry].slice(-500);
  save({ ...data, securityLog: log });
};

// Passende Übungen zu einem Skill finden (deterministische Empfehlung):
// Übungen, deren Skill-Achsen den Skill enthalten, nach Altersklasse + Fokus
// gewichtet. Keine externe KI nötig – nutzt die getaggte Übungs-Bibliothek.
export function suggestDrillsForSkill(skill, cat, n=4){
  return DRILL_LIB
    .filter(d=>(d.axes||[]).includes(skill))
    .map(d=>{
      const inCat=!cat||(d.cats||[]).includes(cat);
      const primary=(d.axes||[])[0]===skill;        // Skill ist Haupt-Achse
      const focusBonus=12/((d.axes||[]).length||1);  // fokussierte Übung bevorzugen
      return {d,score:(inCat?100:0)+(primary?25:0)+focusBonus,inCat};
    })
    .sort((a,b)=>b.score-a.score)
    .slice(0,n);
}

// Baut automatisch eine ausgewogene Trainingseinheit aus TRAINING_TEMPLATES:
// Aufwärmen -> Hauptteil (nach Schwerpunkt) -> Spielform, passend zu Alter & Zieldauer,
// mit Belastungsaufbau und möglichst ohne Übungen der zuletzt gespeicherten Einheit.
export function generateTrainingPlan({ ageKey="all", targetMin=90, focus="auto", avoidIds=[], scores={} }){
  const lib = TRAINING_TEMPLATES;
  const ageOk = d => ageKey==="all" || (d.age||[]).includes(ageKey);
  let pool = lib.filter(ageOk);
  if(pool.length < 6) pool = lib.slice();          // zu wenig fürs Alter -> ganze Bibliothek
  const used = new Set(); const avoid = new Set(avoidIds);
  const pick = (pred) => {
    const cand = pool.filter(d=>pred(d) && !used.has(d.id));
    const fresh = cand.filter(d=>!avoid.has(d.id));
    const arr = fresh.length ? fresh : cand;
    if(!arr.length) return null;
    // Feedback-gewichtet: gut bewertete Übungen kommen öfter dran (Basisgewicht 3)
    const w = x => Math.max(1, 3 + (scores[x.id]||0));
    let tot=arr.reduce((s2,x)=>s2+w(x),0), r=Math.random()*tot, d=arr[0];
    for(const x of arr){ r-=w(x); if(r<=0){ d=x; break; } }
    used.add(d.id); return d;
  };
  const toEx = d => ({ name:d.name, cat:d.cat||"technik", duration:d.duration||15,
    zone:d.fieldZone||"full", intensity:d.intensity||5, skills:d.skills||[],
    description:d.description||"", material:d.material||[], fromTemplate:d.id });
  const out=[]; const total=()=>out.reduce((s,e)=>s+(e.duration||0),0);
  const isShot = d => (d.skills||[]).includes("schuss") || d.cat==="spezial";
  // 1) Aufwärmen
  const w = pick(d=>d.cat==="warmup"); if(w) out.push(toEx(w));
  // 2) Hauptteil – Schwerpunkt zuerst, dann ergänzend
  const seq = ({
    technik:   [d=>d.cat==="technik", d=>d.cat==="taktik", isShot],
    taktik:    [d=>d.cat==="taktik", d=>d.cat==="technik", d=>d.cat==="kondition"],
    torschuss: [isShot, d=>d.cat==="technik", d=>d.cat==="taktik"],
    kondition: [d=>d.cat==="kondition", d=>d.cat==="technik", d=>d.cat==="taktik"],
    spielform: [d=>d.cat==="taktik", d=>d.cat==="technik", d=>d.cat==="kondition"],
    auto:      [d=>d.cat==="technik", d=>d.cat==="taktik", isShot],
  }[focus]) || [d=>d.cat==="technik", d=>d.cat==="taktik", isShot];
  // Junge Jahrgänge spielerischer: weniger Hauptteil, mehr Platz fürs Spielen.
  const young = ["bambini","g","f"].includes(ageKey);
  const mainFill = young ? 0.5 : 0.62;
  let gi=0, guard=0;
  while(total() < targetMin*mainFill && guard++<14){
    const d = pick(seq[gi%seq.length]) || pick(x=>["technik","taktik","kondition","spezial"].includes(x.cat));
    gi++; if(!d) break; out.push(toEx(d));
  }
  // 3) Abschluss: EIN richtiges, LANGES Abschlussspiel – es bekommt die komplette
  //    Restzeit (gerade in der Jugend soll jedes Training mit viel Spielen enden).
  {
    const g = pick(x=>x.cat==="spielform") || pick(x=>["spielform","taktik"].includes(x.cat));
    if(g){
      const rest = Math.max(g.duration||15, targetMin - total());
      out.push({ ...toEx(g), duration: Math.min(45, rest) });
      // Bei sehr langen Einheiten frisst der 45-Min-Deckel sonst Restzeit:
      // verbleibende Minuten mit weiteren Spielformen auffuellen.
      let extraGames = 0;
      while(targetMin - total() > 8 && extraGames < 2){
        extraGames++;
        const gx = pick(x=>x.cat==="spielform");
        if(!gx) break;
        out.push({ ...toEx(gx), duration: Math.min(45, Math.max(gx.duration||15, targetMin - total())) });
      }
    }
  }
  // Garantie: falls die Altersauswahl keine Spielform enthielt, aus der ganzen Bibliothek nachziehen.
  if(!out.some(e=>e.cat==="spielform")){
    const g = lib.find(d=>d.cat==="spielform" && !used.has(d.id)) || lib.find(d=>d.cat==="spielform");
    if(g){ used.add(g.id); out.push(toEx(g)); }
  }
  // Belastungskurve: Aufwärmen vorn, Hauptteil nach Intensität aufsteigend, Spielform hinten.
  const wu  = out.filter(e=>e.cat==="warmup");
  const game= out.filter(e=>e.cat==="spielform");
  const mid = out.filter(e=>e.cat!=="warmup" && e.cat!=="spielform").sort((a,b)=>(a.intensity||5)-(b.intensity||5));
  return [...wu, ...mid, ...game];
}

export const SKILLS = {
  // TECHNISCH
  ballkontrolle: { label:"Ballkontrolle",  cat:"Technik",  col:"#2563eb" },
  dribbling:     { label:"Dribbling",      cat:"Technik",  col:"#2563eb" },
  passen:        { label:"Passspiel",      cat:"Technik",  col:"#2563eb" },
  schuss:        { label:"Torabschluss",   cat:"Technik",  col:"#2563eb" },
  kopfball:      { label:"Kopfballspiel",  cat:"Technik",  col:"#2563eb" },
  // TAKTISCH
  raumaufteilung:{ label:"Raumaufteilung", cat:"Taktik",   col:"#7c3aed" },
  pressing:      { label:"Pressing",       cat:"Taktik",   col:"#7c3aed" },
  umschalten:    { label:"Umschalten",     cat:"Taktik",   col:"#7c3aed" },
  standards:     { label:"Standards",      cat:"Taktik",   col:"#7c3aed" },
  verteidigung:  { label:"Verteidigung",   cat:"Taktik",   col:"#7c3aed" },
  // ATHLETISCH
  schnelligkeit: { label:"Schnelligkeit",  cat:"Athletik", col:"#dc2626" },
  ausdauer:      { label:"Ausdauer",       cat:"Athletik", col:"#dc2626" },
  kraft:         { label:"Kraft",          cat:"Athletik", col:"#dc2626" },
  koordination:  { label:"Koordination",   cat:"Athletik", col:"#dc2626" },
  wendigkeit:    { label:"Wendigkeit",     cat:"Athletik", col:"#dc2626" },
  // MENTAL
  spielintelligenz:{ label:"Spielintelligenz",cat:"Mental",col:"#d97706" },
  zweikampf:     { label:"Zweikampfstärke",cat:"Mental",  col:"#d97706" },
  teamarbeit:    { label:"Teamarbeit",     cat:"Mental",   col:"#d97706" },
  konzentration: { label:"Konzentration",  cat:"Mental",   col:"#d97706" },
};

export const SKILL_AXES = {
  fussball:      ["Technik","Schnelligkeit","Zweikampf","Übersicht","Abschluss","Ausdauer","Teamplay"],
  handball:      ["Wurfkraft","Sprung","Zweikampf","Übersicht","Tempo","Ausdauer","Teamplay"],
  basketball:    ["Wurf","Dribbling","Sprung","Übersicht","Defense","Ausdauer","Teamplay"],
  volleyball:    ["Aufschlag","Annahme","Angriff","Block","Stellung","Sprungkraft","Teamplay"],
  tennis:        ["Vorhand","Rueckhand","Aufschlag","Beinarbeit","Taktik","Ausdauer","Mentalstärke"],
  badminton:     ["Schlagtechnik","Beinarbeit","Reaktion","Taktik","Kondition","Mentalstärke"],
  tischtennis:   ["Vorhand","Rueckhand","Aufschlag","Beinarbeit","Spinkontrolle","Taktik"],
  kegeln:        ["Technik","Konstanz","Konzentration","Zielgenauigkeit","Nervenstärke"],
  schützen:     ["Praezision","Ruhe","Atemkontrolle","Konzentration","Standfestigkeit"],
  turnen:        ["Kraft","Beweglichkeit","Gleichgewicht","Koordination","Haltung","Mut"],
  leichtathletik:["Schnelligkeit","Sprungkraft","Wurfkraft","Ausdauer","Technik","Koordination"],
  tanzen:        ["Rhythmus","Koordination","Ausdruck","Beweglichkeit","Synchronität","Haltung"],
  schwimmen:     ["Technik","Schnelligkeit","Ausdauer","Wende","Atmung","Kraft"],
  mehrzweck:     ["Technik","Schnelligkeit","Kraft","Ausdauer","Koordination","Teamplay"],
};

export const skillAxesFor = sport => SKILL_AXES[sport] || SKILL_AXES.mehrzweck;

// Liefert die Soll-Werte für eine Kategorie + Achsen, beruecksichtigt Vereins-Overrides (cl.skillTargets[cat])
// Soll-VORSCHLÄGE pro Altersklasse (1-5). Bewusst als Startwerte gedacht -
// vom Verein anhand der eigenen Ausbildungskonzeption editierbar.
// Steigende Messlatte: Technik frueh, Kondition/Kraft später (DFB-Leitgedanke).
export const CAT_RANK = { "Bambinis":0,"G-Jugend":1,"F-Jugend":2,"E-Jugend":3,"D-Jugend":4,"C-Jugend":5,"B-Jugend":6,"A-Jugend":7,"Senioren":8,"Alt-Herren":8,"Frauen":8,"Maedchen":4 };
// Default-Zielwert je Achse abhängig vom Altersrang (0..8). Technik-naher Skill steigt frueher.
const _techAxes = ["Technik","Vorhand","Rueckhand","Aufschlag","Schlagtechnik","Dribbling","Wurf","Praezision","Koordination","Rhythmus","Annahme"];
const _condAxes = ["Ausdauer","Kraft","Sprungkraft","Sprung","Tempo","Wurfkraft","Kondition","Standfestigkeit"];
export function defaultSoll(rank, axis) {
  // Basislinie steigt mit Alter; Technik frueher hoch, Kondition später
  const base = 2 + rank*0.32;                  // ~2.0 (Bambini) .. ~4.6 (Senioren)
  let v = base;
  if(_techAxes.includes(axis)) v = base + 0.5;  // Technik frueher gefordert
  if(_condAxes.includes(axis)) v = base - 0.6;  // Kondition später
  return Math.max(1, Math.min(5, Math.round(v)));
}


// Empfohlene Spieleranzahl auf dem Feld je Altersklasse (DFB-Spielformen, Stand 2024/25)
export const SOLL_PLAYERS_BY_CAT = {
  "Bambinis":3,"G-Jugend":3,"F-Jugend":5,"E-Jugend":7,"D-Jugend":9,
  "C-Jugend":11,"B-Jugend":11,"A-Jugend":11,"Senioren":11,"Alt-Herren":11,"Damen":11,"Mädchen":11,"Frauen":11,"Maedchen":7
};

export function sollFor(cl, cat, axes) {
  const rank = CAT_RANK[cat] ?? 4;
  const override = cl?.skillTargets?.[cat] || null;
  return axes.map(a => (override && typeof override[a]==="number") ? override[a] : defaultSoll(rank,a));
}

// ═══ ZENTRALE Trainings-Logik ═══════════════════════════════════════════
// EIN Rechenweg für Empfehlung, Auto-Plan und "an Termin hängen":
// 1) Standard erreichen: größte Lücke zum Alters-Ziel (sollFor) zuerst.
// 2) Alle Ziele erreicht -> Ausbau-Modus: kleinster Vorsprung zuerst.
// present = Namen der Zusagen eines Termins -> Schwerpunkt wird primär aus
// den Skills der TATSÄCHLICH anwesenden Spieler berechnet (Fallback: Kader).
// overrideFocus setzt die Achse manuell (eigener Schwerpunkt schlägt Logik).
export function trainingFocusFor({ data, cl, tid, present=null, overrideFocus=null }) {
  const axes = skillAxesFor(cl?.sport||"fussball");
  const team = (data?.teams||[]).find(tm=>tm.id===tid);
  const cat = team?.cat||team?.name||"F-Jugend";
  const soll = sollFor(cl, cat, axes);
  const roster = (data?.playerProfiles||[]).filter(p=>p.mainTid===tid&&!p.archived&&!isPausedP(p)&&p.skills&&Object.values(p.skills).some(v=>(Number(v)||0)>0));
  const presentLow = (present||[]).map(n=>String(n).toLowerCase());
  const pool = presentLow.length ? roster.filter(p=>presentLow.includes((p.name||"").toLowerCase())) : [];
  const use = pool.length ? pool : roster;
  const stats = axes.map((a,i)=>{ let sum=0,n=0; use.forEach(p=>{ const v=p.skills?.[a]; if(typeof v==="number"&&v>0){ sum+=v; n++; } }); return { axis:a, avg:n?sum/n:null, n, soll:soll[i], gap:n?soll[i]-sum/n:null }; }).filter(x=>x.n>0);
  const below = stats.filter(x=>x.gap>0.05).sort((a,b)=>b.gap-a.gap);
  const buildMode = stats.length>0 && below.length===0;
  const ranked = below.length ? below : [...stats].sort((a,b)=>(a.avg-a.soll)-(b.avg-b.soll));
  const axis = overrideFocus || ranked[0]?.axis || "Technik";
  return { axis, ranked, buildMode, cat, axes, soll, basis: pool.length?"anwesend":"kader", usedCount: use.length };
}

// Baut eine Einheit. focus = Schwerpunkt-Id, cat = Altersklasse, used = bereits verwendete IDs
// targetMin = angestrebte Gesamtdauer; die Auswahl füllt die Phasen passend dazu.
export function buildSession({ focus="technik", cat=null, used=[], targetMin=60, scores={} }) {
  const inCat = d => !cat || (d.cats||[]).includes(cat);
  const byFocus = (fid) => DRILL_LIB.filter(d=>d.focus===fid && inCat(d));
  const blocks = [];
  const ex = [...used];
  const add = (phase, drill) => { if(drill){ blocks.push({phase, drill}); ex.push(drill.id); } };
  // Feedback-gewichtete Auswahl (👍 erhöht, 👎 senkt die Chance)
  const wpick = (cands) => { const arr=cands.filter(d=>!ex.includes(d.id)); if(!arr.length) return null;
    const w=d=>Math.max(1,3+(scores[d.id]||0)); let tot=arr.reduce((s2,d)=>s2+w(d),0), r=Math.random()*tot;
    for(const d of arr){ r-=w(d); if(r<=0) return d; } return arr[0]; };
  const sum = () => blocks.reduce((a,b)=>a+(b.drill.min||0),0);

  const mainFocus = (focus==="auto"||focus==="spielform"||focus==="aufwärmen") ? "technik" : focus;
  // 1) Aufwärmen (immer)
  add("Aufwärmen", wpick(byFocus("aufwärmen")));
  // 2) Hauptteil 1 — Schwerpunkt
  add("Hauptteil", wpick(byFocus(mainFocus)));
  // 3) Abschluss — Spielform (immer, als Abschluss). Jugend-Reserve: das Spiel
  //    bekommt ~40 % (junge Jahrgänge) bzw. ~30 % der Einheit und wird am Ende
  //    auf die komplette Restzeit gestreckt (langes Abschlussspiel).
  const game = wpick(byFocus("spielform"));
  const _young = ["Bambinis","G-Jugend","F-Jugend","E-Jugend"].includes(cat);
  const gameMin = Math.max(game?.min||18, Math.round(targetMin*(_young?0.4:0.3)));
  const secondFocus = ["torschuss","technik"].includes(mainFocus) ? "taktik" : "torschuss";
  const fillPool = [secondFocus, mainFocus, "kondition"];
  let fi=0, guard=0;
  while(sum() + gameMin < targetMin - 6 && guard < 8){
    const fid = fillPool[fi % fillPool.length]; fi++; guard++;
    const d = wpick(byFocus(fid));
    if(d && sum() + gameMin + d.min <= targetMin + 6){ add("Hauptteil", d); }
  }
  // Abschluss zuletzt anhängen – gestreckt auf die Restzeit (max. 45 Min am Stück);
  // bleibt darüber hinaus Zeit übrig, ein zweites Spiel statt abzuschneiden
  if(game){
    const rest=Math.max(game.min||15, targetMin - sum());
    add("Abschluss", {...game, min: Math.min(45, rest)});
    const left=targetMin - sum();
    if(left > 8) add("Abschluss", {...game, title:(game.title||"Abschlussspiel")+" – Variante", min: Math.min(45, left)});
  }
  return blocks;
}

// Schwerpunkt aus den größten Förderlücken ableiten (Achse -> Schwerpunkt-Id)
// Spieler-Typ fuer Positions-Vorschlaege: kurze, fachliche Einordnung ("Ausputzer",
// "Spielmacher", "Knipser") auf Basis der staerksten Skills fuer die Position.
export const playerArchetype = (sk, pos) => {
  const v = a => Number(sk?.[a]) || 0;
  if (pos === "Tor")        return "Rückhalt";
  if (pos === "Abwehr")     return (v("Übersicht")>=3.5 && v("Zweikampf")>=3.5) ? "Ausputzer" : v("Zweikampf")>=3.5 ? "Zweikampfstark" : "Stabilisator";
  if (pos === "Mittelfeld") return v("Übersicht")>=3.5 ? "Spielmacher" : v("Ausdauer")>=3.5 ? "Dauerläufer" : "Box-to-Box";
  if (pos === "Sturm")      return v("Abschluss")>=3.5 ? "Knipser" : v("Schnelligkeit")>=3.5 ? "Tempo-Stürmer" : "Wühler";
  return "";
};

export const AXIS_TO_FOCUS = {
  Technik:"technik", Schnelligkeit:"kondition", Zweikampf:"taktik",
  Übersicht:"taktik", Abschluss:"torschuss", Ausdauer:"kondition", Teamplay:"spielform",
};


/* Altersklassen -> src/dfb.js */

// Modulübergreifende Auto-Hinweise pro Termin (für Trainer/Admin).
// Betreuer-Bedarf: benötigte Trainer/Betreuer aus der erwarteten Spielerzahl.
// Standard 6 Spieler je Betreuer (einstellbar, sinnvoll 6–8). Verfügbar = zugeteilte
// Trainer bzw. eingecheckte Trainer (das Größere) + zugesagte Helfer.
export const staffNeed = (ev, { perStaff=6, trainers=0, squad=0 }={}) => {
  const ps = Math.max(1, Number(perStaff)||6);
  const yes = Object.values(ev.votes||{}).filter(v=>(typeof v==="object"?v.val:v)==="yes").length;
  const expected = yes>0 ? yes : (ev.sollPlayers||squad||0);
  const required = expected>0 ? Math.max(1, Math.ceil(expected/ps)) : 0;
  const avail = Math.max(Object.keys(ev.trainerPresence||{}).length, trainers||0) + (ev.helperOffers||[]).length;
  return { expected, required, avail, perStaff:ps, ok: required===0 || avail>=required };
};

