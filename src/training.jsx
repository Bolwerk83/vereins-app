// ----------------------------------------------------------------
// Trainings-Bereich: Uebungsbibliothek, Taktikboard, Trainings-/Plan-
// Editoren, Vorlagen-Browser, Foerder-Assistent und Planer-Tab.
// ----------------------------------------------------------------
import React, { useState, useEffect, useRef, useMemo } from "react";
import { useT, T } from "./i18n.jsx";
import { sb } from "./storage.js";
import { contrast, mix, acol, ACOLORS, inits, hashPw } from "./util.js";
import { round2, clampSkill, monthKey } from "./logic.js";
import { DRILL_LIB, TRAINING_TEMPLATES } from "./drills.js";
import { CAT_YEARS, catYearsStr, dfbFormatForCat, DFB_FORMATS } from "./dfb.js";
import { trainingFocusFor, generateTrainingPlan, buildSession, suggestDrillsForSkill, drillScores, drillVoteOf, sollFor, skillAxesFor, SKILLS, AXIS_TO_FOCUS, playerArchetype, isPausedP, addAuditLog } from "./domain.js";
import { uid, now, addD, addW, fmtD, fmtDShort, TH, CSS, ET, etLabel, evDisplayTitle, activeSid, activeTeamsFor, isActive, Btn, Tag, Av, Drawer, PageHead, PillTabs, TeamPills, EmptyBox, Inp, Sel, Sw, Divider, InfoHint, SpiderChart, dimLabel } from "./ui.jsx";
import { CAT_ORDER } from "./dfb.js";
import { AffiliateBanner } from "./affiliates.jsx";

// ---- Trainings-Konstanten & -Helfer ----
export function TacticLibrary({ onPick, onClose }) {
  return (
    <div onClick={onClose} style={{position:"fixed",inset:0,background:"rgba(0,0,0,.7)",
      display:"flex",alignItems:"center",justifyContent:"center",zIndex:9999,padding:18}}>
      <div onClick={e=>e.stopPropagation()} style={{background:"#fff",borderRadius:18,padding:"20px",
        width:"100%",maxWidth:720,maxHeight:"88vh",overflowY:"auto"}}>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:14}}>
          <div>
            <div style={{fontWeight:900,fontSize:18,color:"#0f172a"}}>Taktiktafel-Bibliothek</div>
            <div style={{fontSize:12,color:"#64748b"}}>{TACTIC_TEMPLATES.length} Vorlagen · per Klick auswählen</div>
          </div>
          <button onClick={onClose} style={{background:"none",border:"none",fontSize:22,color:"#64748b",cursor:"pointer"}}>×</button>
        </div>
        <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(220px,1fr))",gap:10}}>
          {TACTIC_TEMPLATES.map(tpl=>(
            <button key={tpl.id} onClick={()=>onPick(tpl.id)}
              style={{background:"#fff",border:"1.5px solid #e2e8f0",borderRadius:13,padding:"10px",
                cursor:"pointer",fontFamily:"inherit",display:"flex",flexDirection:"column",gap:7,textAlign:"left"}}>
              <TacticField tactic={tpl} size="md"/>
              <div style={{display:"flex",alignItems:"center",gap:6}}>
                <span style={{fontSize:18}}>{tpl.icon}</span>
                <span style={{fontWeight:800,fontSize:13.5,color:"#0f172a"}}>{tpl.name}</span>
              </div>
              <div style={{fontSize:11.5,color:"#64748b",lineHeight:1.45}}>{tpl.desc}</div>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

export function DFBFormatsCard({ cl, defaultOpen=false, cat=null, cats=null }){
  const { tr } = useT();
  const [open,setOpen]=useState(defaultOpen);
  const c=cl?.pri||"#16a34a";
  // Auf die gewählte(n) Jugend(en) filtern: cat = eine Kategorie, cats = Liste
  // (z. B. alle Mannschaften des Trainers). Ohne Treffer -> volle Übersicht.
  const matched = cat
    ? [dfbFormatForCat(cat)].filter(Boolean)
    : (Array.isArray(cats)&&cats.length ? [...new Set(cats.map(x=>dfbFormatForCat(x)).filter(Boolean))] : []);
  const list = matched.length ? DFB_FORMATS.filter(f=>matched.includes(f)) : DFB_FORMATS;
  const only = list.length===1 ? list[0] : null;
  return (
    <div style={{background:"#fff",border:"1.5px solid #e2e8f0",borderRadius:13,overflow:"hidden"}}>
      <button onClick={()=>setOpen(o=>!o)} style={{width:"100%",display:"flex",alignItems:"center",justifyContent:"space-between",padding:"12px 14px",background:"none",border:"none",cursor:"pointer",fontFamily:"inherit"}}>
        <span style={{fontWeight:800,fontSize:13.5,color:"#0f172a"}}>📐 {only?tr("dfbCardOne").replace("{age}",only.age):tr("dfbCardAll")}</span>
        <span style={{color:"#64748b",fontSize:16}}>{open?"▲":"▼"}</span>
      </button>
      {open&&<div style={{padding:"0 14px 14px"}}>
        <div style={{display:"flex",flexDirection:"column",gap:8}}>
          {list.map((f,i)=>(
            <div key={i} style={{background:"#f8fafc",border:"1px solid #f1f5f9",borderRadius:11,padding:"10px 12px"}}>
              <div style={{fontWeight:800,fontSize:13,color:c}}>{f.age}</div>
              <div style={{fontSize:12,color:"#334155",marginTop:4,lineHeight:1.6}}>
                <b>Spielform:</b> {f.form} · <b>Spieler:</b> {f.players}<br/>
                <b>Feld:</b> {f.field} · <b>Tore:</b> {f.goals}<br/>
                <b>Ball:</b> {f.ball} · <b>Spielzeit:</b> {f.time}<br/>
                <b>Schwerpunkt / Bewegung:</b> {f.focus}
                {f.rules&&<><br/><b>Regeln:</b> {f.rules}</>}
                {f.fair&&<><br/><b>Fair-Play / Einsatzzeit:</b> {f.fair}</>}
              </div>
            </div>
          ))}
        </div>
        <p style={{fontSize:11,color:"#64748b",marginTop:10,lineHeight:1.5}}>Orientierungswerte nach DFB-Empfehlung (Kinderfußball-Reform). Landes-/Kreisverbände können abweichen – im Zweifel beim eigenen Verband prüfen.</p>
      </div>}
    </div>
  );
}
export function TacticFullscreen({ tactic, title, onClose }) {
  return (
    <div style={{position:"fixed",inset:0,background:"#0f172a",zIndex:9999,
      display:"flex",flexDirection:"column",padding:"env(safe-area-inset-top) 12px 12px"}}>
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",padding:"8px 4px"}}>
        <div style={{color:"#fff",fontWeight:900,fontSize:18}}>{title || "Taktiktafel"}</div>
        <button onClick={onClose} style={{padding:"10px 18px",borderRadius:11,border:"none",background:"#dc2626",color:"#fff",fontWeight:800,fontSize:15,cursor:"pointer",fontFamily:"inherit"}}>
          Fertig
        </button>
      </div>
      <div style={{flex:1,display:"flex",alignItems:"center",justifyContent:"center",padding:"8px"}}>
        <TacticField tactic={tactic} size="xl"/>
      </div>
      {tactic?.desc && (
        <div style={{background:"rgba(255,255,255,.06)",borderRadius:14,padding:"12px 16px",color:"#64748b",fontSize:14,textAlign:"center",lineHeight:1.55}}>
          {tactic.desc}
        </div>
      )}
    </div>
  );
}
export function TacticPicker({ value, onChange, onFullscreen }) {
  const [open, setOpen] = useState(false);
  const tpl = value?.template ? TACTIC_TEMPLATES.find(t=>t.id===value.template) : null;
  return (
    <div style={{marginTop:6}}>
      {tpl ? (
        <div style={{display:"flex",alignItems:"center",gap:8,background:"#f8fafc",borderRadius:10,padding:"6px 8px",border:"1px solid #e2e8f0"}}>
          <TacticField tactic={tpl} size="sm" showLabels={false}/>
          <div style={{flex:1,minWidth:0}}>
            <div style={{fontWeight:800,fontSize:12,color:"#0f172a"}}>{tpl.icon} {tpl.name}</div>
            <div style={{fontSize:10.5,color:"#64748b",lineHeight:1.4}}>{tpl.desc}</div>
          </div>
          <div style={{display:"flex",flexDirection:"column",gap:4}}>
            {onFullscreen && <button onClick={()=>onFullscreen(tpl)}
              title="Auf dem Platz vergrößern"
              style={{padding:"4px 8px",borderRadius:7,border:"1.5px solid #16a34a",background:"#dcfce7",color:"#15803d",fontWeight:700,fontSize:11,cursor:"pointer",fontFamily:"inherit"}}>🔍 Platz</button>}
            <button onClick={()=>setOpen(true)}
              style={{padding:"4px 8px",borderRadius:7,border:"1.5px solid #e2e8f0",background:"#fff",color:"#64748b",fontWeight:700,fontSize:11,cursor:"pointer",fontFamily:"inherit"}}>Wechseln</button>
            <button onClick={()=>onChange(null)}
              style={{padding:"4px 8px",borderRadius:7,border:"1.5px solid #fecaca",background:"#fff",color:"#dc2626",fontWeight:700,fontSize:11,cursor:"pointer",fontFamily:"inherit"}}>×</button>
          </div>
        </div>
      ) : (
        <button onClick={()=>setOpen(true)}
          style={{width:"100%",padding:"6px 8px",borderRadius:8,border:"1.5px dashed #cbd5e1",background:"transparent",color:"#64748b",fontWeight:700,fontSize:11.5,cursor:"pointer",fontFamily:"inherit"}}>
          ⚽ Taktiktafel hinzufügen
        </button>
      )}
      {open && <TacticLibrary onPick={(id)=>{onChange({template:id});setOpen(false);}} onClose={()=>setOpen(false)}/>}
    </div>
  );
}
export function TacticField({ tactic, size="md", showLabels=true }) {
  // Maße basierend auf size
  const dims = {
    xs: { w:80,  h:50, cone:3, player:8, font:7,  arrow:1.5 },
    sm: { w:160, h:100, cone:4, player:11, font:10, arrow:2 },
    md: { w:260, h:160, cone:5, player:13, font:11, arrow:2.5 },
    lg: { w:420, h:260, cone:7, player:18, font:13, arrow:3 },
    xl: { w:760, h:460, cone:11, player:28, font:18, arrow:5 },
  };
  const D = dims[size] || dims.md;
  if (!tactic) return null;
  const tpl = TACTIC_TEMPLATES.find(t=>t.id===tactic.template) || tactic;
  const { cones=[], players=[], arrows=[], goal } = tpl;
  const arrowCol = (a) => a.type==="pass" ? "#fb923c" : "#ffffff";

  return (
    <svg viewBox="0 0 100 65" width={D.w} height={D.h}
      style={{display:"block",background:"#16a34a",borderRadius:8,boxShadow:"inset 0 0 0 2px rgba(255,255,255,.25)"}}>
      {/* Field markings */}
      <rect x="0" y="0" width="100" height="65" fill="none" stroke="rgba(255,255,255,.3)" strokeWidth=".3"/>
      <line x1="50" y1="0" x2="50" y2="65" stroke="rgba(255,255,255,.25)" strokeWidth=".3"/>
      <circle cx="50" cy="32.5" r="6" fill="none" stroke="rgba(255,255,255,.25)" strokeWidth=".3"/>
      <rect x="0" y="20" width="12" height="25" fill="none" stroke="rgba(255,255,255,.25)" strokeWidth=".3"/>
      <rect x="88" y="20" width="12" height="25" fill="none" stroke="rgba(255,255,255,.25)" strokeWidth=".3"/>
      {goal && <rect x={goal.x*0.85+85} y={goal.y*0.65-6} width="3" height="12" fill="#ffffff"/>}
      {/* Arrows */}
      <defs>
        <marker id="arr-run" viewBox="0 -3 6 6" refX="5" refY="0" markerWidth="3" markerHeight="3" orient="auto"><path d="M0 -3L6 0L0 3z" fill="#ffffff"/></marker>
        <marker id="arr-pass" viewBox="0 -3 6 6" refX="5" refY="0" markerWidth="3" markerHeight="3" orient="auto"><path d="M0 -3L6 0L0 3z" fill="#fb923c"/></marker>
      </defs>
      {arrows.map((a,i)=>(
        <line key={i}
          x1={a.x1} y1={a.y1*0.65} x2={a.x2} y2={a.y2*0.65}
          stroke={arrowCol(a)} strokeWidth="0.8"
          strokeDasharray={a.type==="pass"?"1.5,1":"none"}
          markerEnd={`url(#arr-${a.type==="pass"?"pass":"run"})`}/>
      ))}
      {/* Cones */}
      {cones.map((c,i)=>(
        <g key={"c"+i} transform={`translate(${c.x},${c.y*0.65})`}>
          <polygon points="-1.6,1.6 1.6,1.6 0,-1.6" fill="#fb923c"/>
        </g>
      ))}
      {/* Players */}
      {players.map((p,i)=>(
        <g key={"p"+i} transform={`translate(${p.x},${p.y*0.65})`}>
          <circle r="2.4" fill={p.color||"#0f172a"} stroke="#fff" strokeWidth=".3"/>
          {showLabels && <text textAnchor="middle" y="0.9" fontSize="2.7" fontWeight="900" fill="#fff" fontFamily="sans-serif">{p.label}</text>}
        </g>
      ))}
    </svg>
  );
}
// Kompakter Umschalter für die Diagramm-Darstellung (Rasen / Taktiktafel / Für Kinder)
export function StyleToggle({ value, onChange, t }){
  const opts=[["grass","Rasen",t.p],["chalk","Tafel","#1c2530"],["kids","Kinder","#f59e0b"]];
  return (
    <div style={{display:"flex",gap:5,marginBottom:10,flexWrap:"wrap"}}>
      {opts.map(([v,lbl,col])=>(
        <button key={v} onClick={()=>onChange(v)}
          style={{padding:"4px 10px",borderRadius:99,border:`1.5px solid ${value===v?col:"#e2e8f0"}`,background:value===v?col:"#fff",color:value===v?"#fff":"#475569",fontWeight:700,fontSize:11,cursor:"pointer",fontFamily:"inherit"}}>{lbl}</button>
      ))}
    </div>
  );
}
export const TrainerTipBadge = ({ small }) => (
  <span title="App-Empfehlung: vielseitig einsetzbare Übung – keine offizielle DFB-Empfehlung"
    style={{background:"#fde047",color:"#713f12",borderRadius:99,padding:small?"2px 7px":"3px 10px",fontSize:small?10.5:12,fontWeight:800,display:"inline-flex",alignItems:"center",gap:4,whiteSpace:"nowrap"}}>⭐ Trainer-Tipp</span>
);
export function TrackDiagram({ width=300 }){
  const h=Math.round(width*0.625);
  return (
    <svg viewBox="0 0 320 200" width={width} height={h} style={{borderRadius:14,boxShadow:"0 2px 10px rgba(0,0,0,.08)",background:"#eaf4ee"}}>
      <rect x="0" y="0" width="320" height="200" fill="#eaf4ee"/>
      <rect x="12" y="22" width="296" height="156" rx="78" fill="#c0492f"/>
      <rect x="26" y="36" width="268" height="128" rx="64" fill="none" stroke="#fff" strokeWidth="1.4" opacity=".85"/>
      <rect x="40" y="50" width="240" height="100" rx="50" fill="none" stroke="#fff" strokeWidth="1.4" opacity=".85"/>
      <rect x="54" y="64" width="212" height="72" rx="36" fill="#3f9d5e"/>
      <rect x="150" y="163" width="3" height="16" fill="#fff"/>
      <circle cx="118" cy="171" r="5" fill="#0f172a"/>
      <path d="M130 171 h24" stroke="#0f172a" strokeWidth="2.4" fill="none" strokeLinecap="round"/>
      <path d="M150 167 l6 4 -6 4" fill="none" stroke="#0f172a" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round"/>
      <text x="160" y="104" textAnchor="middle" fontSize="13" fontWeight="800" fill="#1e7a44" fontFamily="inherit">Tartanbahn</text>
    </svg>
  );
}

export function DrillDiagram({ field="half", elements=[], color="#16a34a", width=320, variant="grass", runColor=null }) {
  // Halbfeld: Hochformat (schmaler), Vollfeld: Querformat
  const ratio = field==="full" ? 0.64 : 1.3;   // h/w
  const W = 100, H = Math.round(100*ratio);
  const px = x => (x/100)*W;
  const py = y => (y/100)*H;
  const chalk = variant==="chalk";
  const kids = variant==="kids";
  const lineCol = chalk ? "rgba(255,255,255,.85)" : kids ? "rgba(255,255,255,.7)" : "rgba(255,255,255,.55)";
  const grass = chalk ? "#1c2530" : kids ? "#22c55e" : "#15803d";
  const lineW = chalk ? 0.7 : 0.8;
  const ownCol = chalk ? "#fff" : color;          // eigene Spieler
  const arrowCol = chalk ? "#fff" : "#fff";

  const arrowDefs = (
    <defs>
      <marker id="dd-arrow" markerWidth="6" markerHeight="6" refX="4.5" refY="3" orient="auto">
        <path d="M0,0 L6,3 L0,6 Z" fill="#fff"/>
      </marker>
      <marker id="dd-arrow-ball" markerWidth="6" markerHeight="6" refX="4.5" refY="3" orient="auto">
        <path d="M0,0 L6,3 L0,6 Z" fill={chalk?"#fff":"#fde047"}/>
      </marker>
    </defs>
  );

  const renderEl = (el, i) => {
    const c = el.color || "#fff";
    switch(el.type){
      case "player": return (
        <g key={i}>
          {chalk ? (
            <circle cx={px(el.x)} cy={py(el.y)} r="3.4" fill="none" stroke="#fff" strokeWidth="1"/>
          ) : kids ? (
            <circle cx={px(el.x)} cy={py(el.y)} r="4.5" fill="#fde047" stroke="#fff" strokeWidth="1.2"/>
          ) : (
            <circle cx={px(el.x)} cy={py(el.y)} r="3.4" fill={color} stroke="#fff" strokeWidth="0.8"/>
          )}
          {el.n!=null && !kids && <text x={px(el.x)} y={py(el.y)} fontSize="3.4" fontWeight="800" fill="#fff" textAnchor="middle" dominantBaseline="central">{el.n}</text>}
          {el.label && <text x={px(el.x)} y={py(el.y)-5} fontSize={kids?"3.6":"3"} fontWeight="700" fill="#fff" textAnchor="middle">{el.label}</text>}
        </g>
      );
      case "opp": return (
        <g key={i}>
          {chalk ? (
            <g stroke="#fff" strokeWidth="1" strokeLinecap="round">
              <line x1={px(el.x)-2.6} y1={py(el.y)-2.6} x2={px(el.x)+2.6} y2={py(el.y)+2.6}/>
              <line x1={px(el.x)+2.6} y1={py(el.y)-2.6} x2={px(el.x)-2.6} y2={py(el.y)+2.6}/>
            </g>
          ) : kids ? (
            <circle cx={px(el.x)} cy={py(el.y)} r="4.5" fill="#ef4444" stroke="#fff" strokeWidth="1.2"/>
          ) : (
            <>
              <circle cx={px(el.x)} cy={py(el.y)} r="3.4" fill="#1e293b" stroke="#fff" strokeWidth="0.8"/>
              {el.n!=null && <text x={px(el.x)} y={py(el.y)} fontSize="3.4" fontWeight="800" fill="#fff" textAnchor="middle" dominantBaseline="central">{el.n}</text>}
            </>
          )}
        </g>
      );
      case "ball": return chalk
        ? <g key={i}><circle cx={px(el.x)} cy={py(el.y)} r="2" fill="none" stroke="#fff" strokeWidth="0.9"/><circle cx={px(el.x)} cy={py(el.y)} r="0.7" fill="#fff"/></g>
        : <circle key={i} cx={px(el.x)} cy={py(el.y)} r={kids?"2.6":"2"} fill="#fff" stroke="#1e293b" strokeWidth="0.6"/>;
      case "cone": return <path key={i} d={`M ${px(el.x)} ${py(el.y)-3} L ${px(el.x)+2.2} ${py(el.y)+2} L ${px(el.x)-2.2} ${py(el.y)+2} Z`} fill={chalk?"none":"#f59e0b"} stroke="#fff" strokeWidth={chalk?"0.9":"0.4"}/>;
      case "goal": {
        const w=el.w||10;
        return <rect key={i} x={px(el.x)-px(w)/2} y={py(el.y)-1} width={px(w)} height="2.4" fill="none" stroke="#fff" strokeWidth="1.2"/>;
      }
      case "zone": return <rect key={i} x={px(el.x)} y={py(el.y)} width={px(el.w||20)} height={py(el.h||20)} fill={chalk?"none":(el.color||color)+"22"} stroke={chalk?"rgba(255,255,255,.5)":(el.color||color)+"66"} strokeWidth="0.6" strokeDasharray="2 1.5" rx="1"/>;
      case "passArrow": case "runArrow": case "dribbleArrow": {
        const dash = el.type==="passArrow" ? "3 2" : el.type==="dribbleArrow" ? "0.5 2" : "none";
        const isRun = el.type!=="passArrow";
        const stroke = (isRun&&runColor&&!chalk) ? runColor : (el.ball&&!chalk) ? "#fde047" : "#fff";
        const marker = (isRun&&runColor&&!chalk) ? "url(#dd-arrow)" : (el.ball&&!chalk) ? "url(#dd-arrow-ball)" : "url(#dd-arrow)";
        return <line key={i} x1={px(el.x1)} y1={py(el.y1)} x2={px(el.x2)} y2={py(el.y2)}
          stroke={stroke} strokeWidth={isRun&&runColor?"1.3":"1"} strokeDasharray={dash} markerEnd={marker}/>;
      }
      case "label": return <text key={i} x={px(el.x)} y={py(el.y)} fontSize="3.2" fontWeight="700" fill="#fff" textAnchor="middle">{el.text}</text>;
      default: return null;
    }
  };

  return (
    <svg viewBox={`0 0 ${W} ${H}`} width={width} style={{maxWidth:"100%",display:"block",borderRadius:10,background:grass}}>
      {arrowDefs}
      {/* Rasenstreifen nur im Rasen-Stil */}
      {!chalk && Array.from({length:6}).map((_,i)=>(
        <rect key={i} x="0" y={(H/6)*i} width={W} height={H/6} fill={i%2?"rgba(255,255,255,.04)":"transparent"}/>
      ))}
      {/* Feldbegrenzung */}
      <rect x="2" y="2" width={W-4} height={H-4} fill="none" stroke={lineCol} strokeWidth="0.8"/>
      {field==="full" ? (
        <>
          <line x1={W/2} y1="2" x2={W/2} y2={H-2} stroke={lineCol} strokeWidth="0.8"/>
          <circle cx={W/2} cy={H/2} r="9" fill="none" stroke={lineCol} strokeWidth="0.8"/>
          <rect x="2" y={H/2-12} width="10" height="24" fill="none" stroke={lineCol} strokeWidth="0.8"/>
          <rect x={W-12} y={H/2-12} width="10" height="24" fill="none" stroke={lineCol} strokeWidth="0.8"/>
        </>
      ) : (
        <>
          {/* Halbfeld: Strafraum oben, Mittellinie unten angedeutet */}
          <rect x={W/2-18} y="2" width="36" height="14" fill="none" stroke={lineCol} strokeWidth="0.8"/>
          <rect x={W/2-8} y="2" width="16" height="6" fill="none" stroke={lineCol} strokeWidth="0.8"/>
          <circle cx={W/2} cy="22" r="6" fill="none" stroke={lineCol} strokeWidth="0.8"/>
          <line x1="2" y1={H-2} x2={W-2} y2={H-2} stroke={lineCol} strokeWidth="0.8"/>
        </>
      )}
      {elements.map(renderEl)}
    </svg>
  );
}
// Trainingsplan-Generator: Einheit oder Woche, Schwerpunkt manuell oder aus Förderlücken
// ---- Teilbare Trainings-Bibliothek -------------------------------------
// Sichtbarkeit: eigene (Besitzer-Team) immer; "club" vereinsweit; "teams" nur freigegebene Teams; "team" nur Besitzer.
const canSeeTraining  = (tr, myTids) => { if(!tr) return false; if(myTids.includes(tr.ownerTid)) return true; if(tr.vis==="club") return true; if(tr.vis==="teams") return (tr.sharedTids||[]).some(id=>myTids.includes(id)); return false; };

const TB_FORMATIONS = {
  football: {
    5:[ {name:"2-1-1",p:[[.5,.9],[.3,.72],[.7,.72],[.5,.5],[.5,.28]],desc:"Vorteile: einfachste Ordnung, klare Aufgaben (2 hinten, 1 Mitte, 1 vorn). Nachteile: wenig Breite. Gegen: ideal für Einstieg/F-Jugend."},
        {name:"1-2-1",p:[[.5,.9],[.5,.74],[.3,.52],[.7,.52],[.5,.28]],desc:"Vorteile: Raute, viele Anspielstationen, schult Verschieben. Nachteile: nur 1 echter Verteidiger. Gegen: gegen tief stehende Gegner, eigenes Kombinieren."} ],
    7:[ {name:"2-3-1",p:[[.5,.9],[.32,.73],[.68,.73],[.22,.5],[.5,.52],[.78,.5],[.5,.27]],desc:"Vorteile: stabile Mitte, Breite über die Flügel. Nachteile: Einzelspitze isoliert. Gegen: ausgeglichener Allrounder."},
        {name:"3-2-1",p:[[.5,.9],[.25,.74],[.5,.76],[.75,.74],[.35,.5],[.65,.5],[.5,.27]],desc:"Vorteile: defensiv sicher (3 hinten), gut zum Kontern. Nachteile: wenig Offensivdruck. Gegen: stärkere Gegner."},
        {name:"2-1-2-1",p:[[.5,.9],[.3,.76],[.7,.76],[.5,.6],[.3,.42],[.7,.42],[.5,.25]],desc:"Vorteile: viele Dreiecke, Box-Mitte. Nachteile: anspruchsvolles Verschieben. Gegen: technisch starke eigene Teams."} ],
    9:[ {name:"3-3-2",p:[[.5,.92],[.22,.75],[.5,.77],[.78,.75],[.25,.52],[.5,.54],[.75,.52],[.38,.28],[.62,.28]],desc:"Vorteile: ausgewogen, klare Reihen. Nachteile: Flügel müssen viel arbeiten. Gegen: solider Standard im 9er."},
        {name:"3-2-3",p:[[.5,.92],[.22,.75],[.5,.77],[.78,.75],[.38,.55],[.62,.55],[.22,.3],[.5,.28],[.78,.3]],desc:"Vorteile: offensiv, starker Flügelangriff. Nachteile: konteranfällig. Gegen: tief stehende, schwächere Gegner."},
        {name:"2-4-2",p:[[.5,.92],[.32,.76],[.68,.76],[.18,.52],[.42,.54],[.58,.54],[.82,.52],[.38,.28],[.62,.28]],desc:"Vorteile: starke Mittelfeldpräsenz. Nachteile: nur 2 hinten. Gegen: ballbesitzorientiert."} ],
    11:[ {name:"4-4-2",p:[[.5,.93],[.18,.76],[.4,.78],[.6,.78],[.82,.76],[.18,.52],[.4,.54],[.6,.54],[.82,.52],[.4,.28],[.6,.28]],desc:"Vorteile: simpel, kompakt, klare Ketten, stark im Umschalten. Nachteile: zentrale Mitte kann überspielt werden. Gegen: gute Standardlösung, besonders gegen direkte Teams."},
         {name:"4-3-3",p:[[.5,.93],[.18,.76],[.4,.78],[.6,.78],[.82,.76],[.3,.55],[.5,.57],[.7,.55],[.25,.3],[.5,.28],[.75,.3]],desc:"Vorteile: hoher Pressingdruck, Breite über Flügel, ballbesitzdominant. Nachteile: viel Laufarbeit, anfällig bei Kontern über außen. Gegen: tief stehende, schwächere Gegner, die man bespielen will."},
         {name:"4-2-3-1",p:[[.5,.93],[.18,.77],[.4,.79],[.6,.79],[.82,.77],[.38,.6],[.62,.6],[.25,.42],[.5,.4],[.75,.42],[.5,.26]],desc:"Vorteile: sehr ausgewogen, Doppel-Sechs sichert ab, kreativer Zehner. Nachteile: Spitze oft allein. Gegen: ausgeglichene bis stärkere Gegner – das Allround-System der Profis."},
         {name:"4-1-4-1",p:[[.5,.93],[.18,.77],[.4,.79],[.6,.79],[.82,.77],[.5,.63],[.18,.48],[.4,.5],[.6,.5],[.82,.48],[.5,.28]],desc:"Vorteile: kompakte Defensive, ein Sechser als Filter vor der Abwehr. Nachteile: wenig Tiefe vorn. Gegen: starke, ballbesitzorientierte Gegner abfangen."},
         {name:"3-5-2",p:[[.5,.93],[.28,.77],[.5,.79],[.72,.77],[.15,.55],[.35,.57],[.5,.58],[.65,.57],[.85,.55],[.4,.3],[.6,.3]],desc:"Vorteile: Überzahl im Mittelfeld, zwei Spitzen. Nachteile: Flügelläufer müssen enorm viel laufen, außen konteranfällig. Gegen: Mittelfeld dominieren, gegen Teams mit schwachen Außenbahnen."},
         {name:"5-3-2",p:[[.5,.93],[.12,.76],[.31,.78],[.5,.79],[.69,.78],[.88,.76],[.3,.54],[.5,.56],[.7,.54],[.4,.3],[.6,.3]],desc:"Vorteile: sehr defensivstabil, ideal zum Kontern. Nachteile: wenig Offensivpräsenz. Gegen: deutlich stärkere Gegner, Ergebnis verteidigen."},
         {name:"3-4-3",p:[[.5,.93],[.28,.78],[.5,.8],[.72,.78],[.18,.55],[.42,.57],[.58,.57],[.82,.55],[.25,.3],[.5,.28],[.75,.3]],desc:"Vorteile: maximaler Offensivdruck, Breite und Tiefe. Nachteile: hinten riskant (nur 3). Gegen: schwächere Gegner, wenn unbedingt Tore her müssen."},
         {name:"4-4-2 Raute",p:[[.5,.93],[.18,.77],[.4,.79],[.6,.79],[.82,.77],[.5,.62],[.3,.5],[.7,.5],[.5,.4],[.4,.27],[.6,.27]],desc:"Vorteile: zentrale Mittelfeld-Überzahl, klarer Zehner. Nachteile: kaum Breite, Flügel bleiben offen. Gegen: zentrumsstarke Gegner, eigenes Kombinationsspiel."},
         {name:"4-5-1",p:[[.5,.93],[.18,.77],[.4,.79],[.6,.79],[.82,.77],[.15,.54],[.35,.56],[.5,.57],[.65,.56],[.85,.54],[.5,.3]],desc:"Vorteile: dichtes Mittelfeld, sehr schwer zu überspielen. Nachteile: Einzelspitze, wenig Torgefahr. Gegen: Favoriten ärgern / Unentschieden sichern."} ],
  },
  handball: { 7:[
    {name:"Angriff 3:3",p:[[.5,.93],[.12,.45],[.3,.62],[.5,.66],[.7,.62],[.88,.45],[.5,.32]]},
    {name:"Abwehr 6:0",p:[[.5,.93],[.12,.7],[.3,.72],[.43,.73],[.57,.73],[.7,.72],[.88,.7]]},
    {name:"Abwehr 5:1",p:[[.5,.93],[.15,.72],[.35,.74],[.5,.75],[.65,.74],[.85,.72],[.5,.55]]},
  ]},
  basketball: { 5:[
    {name:"Positionen",p:[[.5,.8],[.2,.62],[.8,.62],[.32,.38],[.5,.24]]},
    {name:"1-3-1",p:[[.5,.82],[.2,.55],[.5,.5],[.8,.55],[.5,.26]]},
    {name:"4-Out",p:[[.5,.82],[.18,.5],[.4,.4],[.6,.4],[.82,.5]]},
  ]},
  generic: {
    5:[{name:"Verteilt",p:[[.5,.85],[.3,.6],[.7,.6],[.35,.35],[.65,.35]]}],
    7:[{name:"Verteilt",p:[[.5,.88],[.3,.7],[.7,.7],[.25,.5],[.5,.5],[.75,.5],[.5,.3]]}],
    9:[{name:"Verteilt",p:[[.5,.9],[.25,.72],[.5,.74],[.75,.72],[.25,.52],[.5,.54],[.75,.52],[.4,.3],[.6,.3]]}],
    11:[{name:"Verteilt",p:[[.5,.92],[.2,.75],[.4,.77],[.6,.77],[.8,.75],[.2,.52],[.4,.54],[.6,.54],[.8,.52],[.4,.3],[.6,.3]]}],
  },
};

// Übungs-Vorlagen passend zur Trainingsphase (für die Vorlage/Frei-Umschaltung im Plan-Editor)
const PHASE_DRILL_FOCUS = { "Aufwärmen":["aufwärmen"], "Hauptteil":["technik","taktik","torschuss"], "Abschluss":["spielform"], "Spielform":["spielform"], "Athletik":["kondition"] };

export const TACTIC_TEMPLATES = [
  {
    id:"slalom", name:"Slalom-Parcours", icon:"〰",
    desc:"Dribbeln durch Hütchen-Reihe, am Ende Pass oder Abschluss",
    cones:[{x:15,y:50},{x:25,y:50},{x:35,y:50},{x:45,y:50},{x:55,y:50},{x:65,y:50},{x:75,y:50}],
    players:[{x:5,y:50,label:"A"}],
    arrows:[{x1:5,y1:50,x2:78,y2:50,type:"run",path:"wave"}],
  },
  {
    id:"quad5", name:"Quadrat 5×5", icon:"▢",
    desc:"Passspiel im Quadrat, 4 Eckspieler + 1 in der Mitte",
    cones:[{x:25,y:20},{x:75,y:20},{x:75,y:80},{x:25,y:80}],
    players:[{x:25,y:20,label:"1"},{x:75,y:20,label:"2"},{x:75,y:80,label:"3"},{x:25,y:80,label:"4"},{x:50,y:50,label:"M",color:"#dc2626"}],
    arrows:[{x1:25,y1:20,x2:50,y2:50,type:"pass"},{x1:50,y1:50,x2:75,y2:80,type:"pass"}],
  },
  {
    id:"abschluss", name:"Abschluss-Reihe", icon:"⌖",
    desc:"Spieler in Reihe, Pass von Trainer, Abschluss auf Tor",
    cones:[{x:30,y:30},{x:30,y:50},{x:30,y:70}],
    players:[{x:30,y:30,label:"A"},{x:30,y:50,label:"B"},{x:30,y:70,label:"C"},{x:55,y:50,label:"T",color:"#7c3aed"}],
    arrows:[{x1:55,y1:50,x2:75,y2:50,type:"pass"},{x1:75,y1:50,x2:90,y2:50,type:"run"}],
    goal:{x:90,y:50},
  },
  {
    id:"1gegen1", name:"1 gegen 1 frontal", icon:"⚔",
    desc:"Angreifer + Verteidiger, kleines Tor verteidigen",
    cones:[{x:80,y:30},{x:80,y:70}],
    players:[{x:20,y:50,label:"A",color:"#16a34a"},{x:60,y:50,label:"V",color:"#dc2626"}],
    arrows:[{x1:20,y1:50,x2:60,y2:50,type:"run"},{x1:60,y1:50,x2:80,y2:50,type:"run"}],
    goal:{x:85,y:50},
  },
  {
    id:"doppelpass", name:"Doppelpass-Station", icon:"⤬",
    desc:"A passt zu B, läuft, kriegt zurück, Abschluss",
    cones:[{x:20,y:50},{x:50,y:30}],
    players:[{x:20,y:50,label:"A"},{x:50,y:30,label:"B"}],
    arrows:[{x1:20,y1:50,x2:50,y2:30,type:"pass"},{x1:20,y1:50,x2:70,y2:50,type:"run"},{x1:50,y1:30,x2:70,y2:50,type:"pass"},{x1:70,y1:50,x2:90,y2:50,type:"run"}],
    goal:{x:90,y:50},
  },
  {
    id:"raute", name:"Pass-Raute", icon:"◆",
    desc:"4 Spieler in Rauten-Anordnung, Pass im Uhrzeigersinn",
    cones:[],
    players:[{x:50,y:20,label:"1"},{x:80,y:50,label:"2"},{x:50,y:80,label:"3"},{x:20,y:50,label:"4"}],
    arrows:[{x1:50,y1:20,x2:80,y2:50,type:"pass"},{x1:80,y1:50,x2:50,y2:80,type:"pass"},{x1:50,y1:80,x2:20,y2:50,type:"pass"},{x1:20,y1:50,x2:50,y2:20,type:"pass"}],
  },
  {
    id:"abwehrkette", name:"Abwehrkette 4er", icon:"━",
    desc:"Verschieben der Viererkette in Abhängigkeit vom Angreifer",
    cones:[],
    players:[{x:25,y:40,label:"LV"},{x:40,y:40,label:"IV"},{x:60,y:40,label:"IV"},{x:75,y:40,label:"RV"},{x:50,y:75,label:"A",color:"#dc2626"}],
    arrows:[{x1:50,y1:75,x2:50,y2:50,type:"run"},{x1:40,y1:40,x2:50,y2:35,type:"run"}],
  },
  {
    id:"konter", name:"Konter-Spielzug", icon:"⤴",
    desc:"Schneller Ballgewinn → Pass nach vorne → Lauf in Tiefe",
    cones:[],
    players:[{x:25,y:60,label:"IV"},{x:50,y:50,label:"6er"},{x:75,y:30,label:"ST"}],
    arrows:[{x1:25,y1:60,x2:50,y2:50,type:"pass"},{x1:50,y1:50,x2:75,y2:30,type:"pass"},{x1:75,y1:30,x2:90,y2:50,type:"run"}],
    goal:{x:90,y:50},
  },
  {
    id:"warmup", name:"Aufwärm-Quadrat", icon:"☼",
    desc:"Großes Quadrat, Spieler bewegen sich frei, Pässe in alle Richtungen",
    cones:[{x:15,y:15},{x:85,y:15},{x:85,y:85},{x:15,y:85}],
    players:[{x:30,y:30,label:"A"},{x:70,y:30,label:"B"},{x:70,y:70,label:"C"},{x:30,y:70,label:"D"},{x:50,y:50,label:"E"}],
    arrows:[{x1:30,y1:30,x2:70,y2:30,type:"pass"},{x1:70,y1:30,x2:70,y2:70,type:"pass"}],
  },
  {
    id:"stationen", name:"4 Stationen Rotation", icon:"⊞",
    desc:"4 Stationen mit verschiedenen Übungen, alle 5 Min wechseln",
    cones:[{x:25,y:25},{x:75,y:25},{x:75,y:75},{x:25,y:75}],
    players:[{x:25,y:25,label:"1"},{x:75,y:25,label:"2"},{x:75,y:75,label:"3"},{x:25,y:75,label:"4"}],
    arrows:[{x1:25,y1:25,x2:75,y2:25,type:"run"},{x1:75,y1:25,x2:75,y2:75,type:"run"},{x1:75,y1:75,x2:25,y2:75,type:"run"},{x1:25,y1:75,x2:25,y2:25,type:"run"}],
  },
];

export const canEditTraining = (tr, myTids) => !!tr && myTids.includes(tr.ownerTid);

export const visibleTrainings = (list, myTids) => (list||[]).filter(tr=>canSeeTraining(tr,myTids));

export const VIS_LABEL = { team:"Nur mein Team", club:"Ganzer Verein", teams:"Bestimmte Teams" };

export const TRAIN_PHASES = ["Aufwärmen","Hauptteil","Abschluss","Spielform","Athletik"];

// ---- Taktikboard (mehrere Sportarten) — Phase 1: Feld + Formationen -----
export const TB_FIELDS = {
  football: { vw:68, vh:105, bg:"#16a34a", r:2.6, fs:2.6, counts:[5,7,9,11], draw:(L)=>[
    <rect key="b" x={2} y={2} width={64} height={101} rx={1} fill="none" stroke={L} strokeWidth={0.6}/>,
    <line key="h" x1={2} y1={52.5} x2={66} y2={52.5} stroke={L} strokeWidth={0.5}/>,
    <circle key="c" cx={34} cy={52.5} r={9.15} fill="none" stroke={L} strokeWidth={0.5}/>,
    <circle key="cd" cx={34} cy={52.5} r={0.7} fill={L}/>,
    <rect key="pb" x={13.85} y={86.5} width={40.3} height={16.5} fill="none" stroke={L} strokeWidth={0.5}/>,
    <rect key="pt" x={13.85} y={2} width={40.3} height={16.5} fill="none" stroke={L} strokeWidth={0.5}/>,
    <rect key="ggb" x={24.85} y={97} width={18.3} height={6} fill="none" stroke={L} strokeWidth={0.4}/>,
    <rect key="ggt" x={24.85} y={2} width={18.3} height={6} fill="none" stroke={L} strokeWidth={0.4}/>,
    <rect key="gb" x={30.5} y={103} width={7} height={1.6} fill={L}/>,
    <rect key="gt" x={30.5} y={0.4} width={7} height={1.6} fill={L}/>,
  ]},
  handball: { vw:20, vh:40, bg:"#2f7ed8", r:1.15, fs:1.15, counts:[7], draw:(L)=>[
    <rect key="b" x={1} y={1} width={18} height={38} fill="none" stroke={L} strokeWidth={0.3}/>,
    <line key="h" x1={1} y1={20} x2={19} y2={20} stroke={L} strokeWidth={0.25}/>,
    <path key="d6b" d="M4 39 A6 6 0 0 1 16 39" fill="none" stroke={L} strokeWidth={0.3}/>,
    <path key="d6t" d="M4 1 A6 6 0 0 0 16 1" fill="none" stroke={L} strokeWidth={0.3}/>,
    <path key="d9b" d="M2.5 39 A8.5 8.5 0 0 1 17.5 39" fill="none" stroke={L} strokeWidth={0.22} strokeDasharray="0.6 0.6"/>,
    <path key="d9t" d="M2.5 1 A8.5 8.5 0 0 0 17.5 1" fill="none" stroke={L} strokeWidth={0.22} strokeDasharray="0.6 0.6"/>,
    <rect key="gb" x={8} y={38.8} width={4} height={1} fill={L}/>,
    <rect key="gt" x={8} y={0.2} width={4} height={1} fill={L}/>,
  ]},
  basketball: { vw:15, vh:14, bg:"#c2853f", r:0.75, fs:0.75, counts:[5], half:true, draw:(L)=>[
    <rect key="b" x={0.5} y={0.5} width={14} height={13} fill="none" stroke={L} strokeWidth={0.22}/>,
    <rect key="key" x={5.4} y={0.5} width={4.2} height={5.8} fill="none" stroke={L} strokeWidth={0.22}/>,
    <circle key="ft" cx={7.5} cy={6.3} r={1.8} fill="none" stroke={L} strokeWidth={0.22}/>,
    <circle key="hoop" cx={7.5} cy={1.7} r={0.45} fill="none" stroke={L} strokeWidth={0.3}/>,
    <path key="3" d="M1.6 0.5 L1.6 3.8 A6.6 6.6 0 0 0 13.4 3.8 L13.4 0.5" fill="none" stroke={L} strokeWidth={0.22}/>,
  ]},
  generic: { vw:68, vh:105, bg:"#16a34a", r:2.6, fs:2.6, counts:[5,7,9,11], draw:(L)=>[
    <rect key="b" x={2} y={2} width={64} height={101} rx={1} fill="none" stroke={L} strokeWidth={0.6}/>,
    <line key="h" x1={2} y1={52.5} x2={66} y2={52.5} stroke={L} strokeWidth={0.5}/>,
    <circle key="c" cx={34} cy={52.5} r={8} fill="none" stroke={L} strokeWidth={0.5}/>,
  ]},
};

export const TB_SPORTS = [{id:"football",label:"Fußball"},{id:"handball",label:"Handball"},{id:"basketball",label:"Basketball"},{id:"generic",label:"Allgemein"}];

export function tbForms(sport,count){ return (TB_FORMATIONS[sport]||TB_FORMATIONS.generic)[count] || TB_FORMATIONS.generic[count] || []; }


export const MATERIAL_CATALOG = [
  // Tore
  { id:"goal_small",   cat:"Tore",      label:"Kleines Tor",    icon:"g", col:"#dc2626", unit:"Tor",    canColor:false },
  { id:"goal_medium",  cat:"Tore",      label:"Mittleres Tor",  icon:"G", col:"#d97706", unit:"Tor",    canColor:false },
  { id:"goal_large",   cat:"Tore",      label:"Großes Tor",    icon:"GG",col:"#334155", unit:"Tor",    canColor:false },
  // Markierung
  { id:"huetchen",     cat:"Markierung",label:"Hütchen",       icon:"^", col:"#f59e0b", unit:"Stück", canColor:true  },
  { id:"pylone",       cat:"Markierung",label:"Pylone",         icon:"P", col:"#f97316", unit:"Stück", canColor:true  },
  { id:"stange",       cat:"Markierung",label:"Hüpfstange",    icon:"|", col:"#64748b", unit:"Stück", canColor:true  },
  { id:"koordleiter",  cat:"Markierung",label:"Koordinationsleiter",icon:"=",col:"#7c3aed",unit:"Stück",canColor:false},
  // Leibchen
  { id:"leibchen",     cat:"Leibchen",  label:"Leibchen",       icon:"L", col:"#3b82f6", unit:"Stück", canColor:true  },
  // Bälle
  { id:"ball_fuss",    cat:"Bälle",    label:"Fußball",       icon:"o", col:"#0f172a", unit:"Ball",   canColor:false },
  { id:"ball_hand",    cat:"Bälle",    label:"Handball",       icon:"o", col:"#d97706", unit:"Ball",   canColor:false },
  { id:"ball_tennis",  cat:"Bälle",    label:"Tennisball",     icon:"o", col:"#84cc16", unit:"Ball",   canColor:false },
  // Sonstiges
  { id:"bander",       cat:"Sonstiges", label:"Markierungsband",icon:"-", col:"#ec4899", unit:"Rolle",  canColor:true  },
  { id:"hürden",      cat:"Sonstiges", label:"Hürden",        icon:"H", col:"#64748b", unit:"Stück", canColor:false },
  { id:"medizinball",  cat:"Sonstiges", label:"Medizinball",    icon:"M", col:"#7c3aed", unit:"Stück", canColor:false },
];

export const COLORS_DE = ["rot","blau","gelb","gruen","orange","weiss","schwarz","pink"];

export const COLOR_HEX  = {rot:"#dc2626",blau:"#2563eb",gelb:"#f59e0b",gruen:"#16a34a",
                    orange:"#d97706",weiss:"#e2e8f0",schwarz:"#1e293b",pink:"#ec4899"};

export const EXERCISE_CATS = [
  { id:"warmup",   label:"Aufwärmen",  col:"#f59e0b", bg:"#fef3c7" },
  { id:"technik",  label:"Technik",     col:"#2563eb", bg:"#eff6ff" },
  { id:"taktik",   label:"Taktik",      col:"#7c3aed", bg:"#ede9fe" },
  { id:"spiel",    label:"Spielform",   col:"#16a34a", bg:"#dcfce7" },
  { id:"abkühlen",label:"Abkühlen",   col:"#64748b", bg:"#f1f5f9" },
];

export const FIELD_ZONES = [
  { id:"full",      label:"Ganzes Feld",   pct:100 },
  { id:"half_l",    label:"Linke Hälfte", pct:50  },
  { id:"half_r",    label:"Rechte Hälfte",pct:50  },
  { id:"third_l",   label:"Linkes Drittel",pct:33  },
  { id:"third_m",   label:"Mitteldrittel", pct:33  },
  { id:"third_r",   label:"Rechtes Drittel",pct:33 },
  { id:"quarter_tl",label:"Viertel oben L",pct:25  },
  { id:"quarter_tr",label:"Viertel oben R",pct:25  },
  { id:"quarter_bl",label:"Viertel unten L",pct:25 },
  { id:"quarter_br",label:"Viertel unten R",pct:25 },
  { id:"strafraum", label:"Strafraum",     pct:15  },
  { id:"mittelkreis",label:"Mittelkreis",  pct:20  },
];

/* =================================================================
   INVENTARLISTE BERECHNEN
================================================================= */

export const calcInventory = (exercises) => {
  const totals = {};
  (exercises||[]).forEach(ex => {
    (ex.material||[]).forEach(m => {
      const key = m.id + (m.color ? "_"+m.color : "");
      if(!totals[key]) totals[key] = { ...m, total:0 };
      totals[key].total += (m.qty || 1);
    });
  });
  return Object.values(totals).sort((a,b)=>a.cat?.localeCompare(b.cat));
};

/* =================================================================
   TRAINING PLAN TAB
================================================================= */

// Team-Kategorie -> Altersschlüssel der Übungsbibliothek (TRAINING_TEMPLATES.age).
export const CAT_TO_AGEKEY = {
  "Bambinis":"bambini","G-Jugend":"g","F-Jugend":"f","E-Jugend":"e","D-Jugend":"d",
  "C-Jugend":"c","B-Jugend":"ba","A-Jugend":"ba","Senioren":"senioren","Alt-Herren":"altherren",
  "Damen":"senioren","Frauen":"senioren","Herren":"senioren","Mädchen":"e","Maedchen":"e",
};

// Altersgruppen-Codes
export const AGE_GROUPS = {
  bambini: "Bambini (U6-U8)",
  g: "G-Jugend (U7-U8)",
  f: "F-Jugend (U9-U10)",
  e: "E-Jugend (U10-U11)",
  d: "D-Jugend (U12-U13)",
  c: "C-Jugend (U14-U15)",
  ba: "B/A-Jugend (U16-U19)",
  senioren: "Senioren",
  altherren: "Alt-Herren",
  all: "Alle Altersgruppen",
};





/* =================================================================
   ERWEITERTE TRAINING LIBRARY + VORLAGE BROWSER
================================================================= */

// Skill-Punkte Berechnung eines Plans
export const calcPlanStats = (exercises) => {
  if(!exercises||exercises.length===0) return {skills:{},intensity:0,totalMins:0,load:0};
  const skillTotals = {};
  let totalIntensityMins = 0;
  let totalMins = 0;
  exercises.forEach(ex => {
    const dur = ex.duration||0;
    const intensity = ex.intensity||5;
    totalMins += dur;
    totalIntensityMins += dur * intensity;
    (ex.skills||[]).forEach(skill => {
      skillTotals[skill] = (skillTotals[skill]||0) + dur;
    });
  });
  const avgIntensity = totalMins>0 ? Math.round(totalIntensityMins/totalMins) : 0;
  // Sorted skills by training time
  const sortedSkills = Object.entries(skillTotals)
    .sort(([,a],[,b])=>b-a)
    .slice(0,4);
  // Load: 0-100%
  const load = Math.min(100, Math.round((avgIntensity/10)*100));
  return { skills:skillTotals, topSkills:sortedSkills, intensity:avgIntensity, totalMins, load };
};

// Template Detail-Ansicht
// Explizite Animations-Zuordnung pro Übung (zuverlässig statt Schlagwort-Raten).
// Fällt eine Übung hier raus, greift die Heuristik in DrillAutoAnim als Fallback.
export const DRILL_ANIM = {
  aw_01:"free", aw_02:"tag", aw_03:"ladder", aw_04:"pass",
  tech_01:"relay", tech_02:"dribshot", tech_03:"pass", tech_04:"shot", tech_05:"header", tech_06:"shot",
  takt_01:"press", takt_02:"tactic", takt_03:"corner", takt_04:"defend",
  kond_01:"run", kond_02:"run", kond_03:"run",
  spiel_01:"duel", spiel_02:"game", spiel_03:"pass",
  spez_01:"keeper", spez_02:"dribshot", spez_03:"defend", spez_04:"tactic",
  bam_01:"tag", bam_02:"free", ah_01:"game",
  tky_01:"tactic", tky_02:"tactic", tky_03:"press", tky_04:"defend", tky_05:"tactic", tky_06:"tactic",
  tkm_01:"tactic", tkm_02:"defend",
  // Zusatz-Übungen (MEHR …-Blöcke)
  tch_n1:"dribshot", tch_n2:"pass", tch_n3:"dribshot", tch_n4:"free",
  sf_n1:"game", sf_n2:"game", sf_n3:"game", sf_n4:"game",
  aw_n1:"tag", kon_n1:"dribble",
  // Neue Übungen
  new_01:"pass", new_02:"free", new_03:"pass", new_04:"header", new_05:"pass", new_06:"defend",
  new_07:"tactic", new_08:"run", new_09:"game", new_10:"pass", new_11:"keeper", new_12:"game",
  // Einzeltraining / Ball hochhalten / Teambuilding
  ein_01:"juggle", ein_02:"juggle", ein_03:"dribble", ein_04:"pass", ein_05:"shot", ein_06:"free", ein_07:"run",
  tb_01:"team", tb_02:"team", tb_03:"team", tb_04:"team", tb_05:"run",
  // Bambini/G-Jugend, Torwart, Athletik ohne Ball, Halle, Senioren
  kid_01:"free", kid_02:"tag", kid_03:"shot", kid_04:"free",
  tw_01:"keeper", tw_02:"keeper", tw_03:"keeper", tw_04:"keeper",
  ath_01:"free", ath_02:"free", ath_03:"free", ath_04:"ladder",
  hal_01:"game", hal_02:"dribble", hal_03:"game", sen_01:"pass",
  // 100 weitere Übungen
  m001:"free", m002:"pass", m003:"tag", m004:"free", m005:"pass", m006:"run", m007:"ladder", m008:"pass",
  m009:"pass", m010:"free", m011:"team", m012:"dribble", m013:"pass", m014:"pass", m015:"pass", m016:"pass",
  m017:"dribble", m018:"dribble", m019:"dribshot", m020:"dribble", m021:"shot", m022:"shot", m023:"shot", m024:"header",
  m025:"header", m026:"pass", m027:"pass", m028:"shot", m029:"dribble", m030:"juggle", m031:"juggle", m032:"dribshot",
  m033:"pass", m034:"header", m035:"defend", m036:"press", m037:"press", m038:"tactic", m039:"tactic", m040:"tactic",
  m041:"tactic", m042:"defend", m043:"defend", m044:"tactic", m045:"tactic", m046:"corner", m047:"corner", m048:"defend",
  m049:"press", m050:"defend", m051:"tactic", m052:"tactic", m053:"run", m054:"run", m055:"run", m056:"run",
  m057:"run", m058:"dribble", m059:"run", m060:"free", m061:"free", m062:"free", m063:"ladder", m064:"dribble",
  m065:"game", m066:"game", m067:"game", m068:"game", m069:"game", m070:"game", m071:"pass", m072:"pass",
  m073:"game", m074:"game", m075:"pass", m076:"game", m077:"tactic", m078:"game", m079:"tag", m080:"game",
  m081:"game", m082:"game", m083:"keeper", m084:"keeper", m085:"keeper", m086:"shot", m087:"tactic", m088:"header",
  m089:"header", m090:"pass", m091:"tactic", m092:"duel", m093:"tag", m094:"shot", m095:"dribble", m096:"free",
  m097:"shot", m098:"game", m099:"free", m100:"tag",
  // 200 weitere Übungen
  n001:"pass", n002:"free", n003:"tag", n004:"run", n005:"pass", n006:"dribble", n007:"team", n008:"ladder",
  n009:"pass", n010:"free", n011:"tag", n012:"pass", n013:"dribble", n014:"run", n015:"free", n016:"pass",
  n017:"tag", n018:"ladder", n019:"pass", n020:"free", n021:"run", n022:"pass", n023:"dribble", n024:"team",
  n025:"pass", n026:"pass", n027:"pass", n028:"pass", n029:"pass", n030:"pass", n031:"pass", n032:"pass",
  n033:"dribble", n034:"dribble", n035:"dribble", n036:"dribshot", n037:"duel", n038:"duel", n039:"shot", n040:"shot",
  n041:"shot", n042:"shot", n043:"header", n044:"header", n045:"pass", n046:"pass", n047:"juggle", n048:"juggle",
  n049:"dribble", n050:"dribble", n051:"pass", n052:"pass", n053:"dribshot", n054:"header", n055:"pass", n056:"shot",
  n057:"dribble", n058:"pass", n059:"dribble", n060:"shot", n061:"pass", n062:"dribble", n063:"pass", n064:"dribshot",
  n065:"pass", n066:"header", n067:"shot", n068:"pass", n069:"dribble", n070:"dribshot", n071:"defend", n072:"defend",
  n073:"press", n074:"press", n075:"tactic", n076:"tactic", n077:"tactic", n078:"defend", n079:"defend", n080:"tactic",
  n081:"tactic", n082:"tactic", n083:"corner", n084:"corner", n085:"defend", n086:"press", n087:"tactic", n088:"tactic",
  n089:"defend", n090:"tactic", n091:"tactic", n092:"press", n093:"defend", n094:"defend", n095:"tactic", n096:"tactic",
  n097:"press", n098:"tactic", n099:"tactic", n100:"defend", n101:"tactic", n102:"tactic", n103:"defend", n104:"tactic",
  n105:"run", n106:"run", n107:"run", n108:"run", n109:"run", n110:"dribble", n111:"run", n112:"free",
  n113:"free", n114:"free", n115:"free", n116:"ladder", n117:"run", n118:"run", n119:"run", n120:"dribble",
  n121:"run", n122:"free", n123:"run", n124:"run", n125:"free", n126:"run", n127:"ladder", n128:"dribble",
  n129:"game", n130:"game", n131:"game", n132:"game", n133:"game", n134:"game", n135:"pass", n136:"pass",
  n137:"pass", n138:"game", n139:"game", n140:"game", n141:"game", n142:"game", n143:"game", n144:"tactic",
  n145:"game", n146:"game", n147:"pass", n148:"game", n149:"game", n150:"game", n151:"game", n152:"game",
  n153:"game", n154:"game", n155:"tag", n156:"game", n157:"game", n158:"game", n159:"game", n160:"game",
  n161:"game", n162:"game", n163:"game", n164:"game", n165:"game", n166:"game", n167:"game", n168:"game",
  n169:"keeper", n170:"keeper", n171:"keeper", n172:"keeper", n173:"keeper", n174:"keeper", n175:"shot", n176:"tactic",
  n177:"header", n178:"header", n179:"pass", n180:"tactic", n181:"duel", n182:"keeper", n183:"tactic", n184:"defend",
  n185:"pass", n186:"keeper", n187:"tactic", n188:"duel", n189:"tag", n190:"shot", n191:"dribble", n192:"free",
  n193:"game", n194:"tag", n195:"shot", n196:"free", n197:"dribble", n198:"free", n199:"game", n200:"tag",
};

// App-eigenes Empfehlungs-Siegel (KEINE DFB-Marke): markiert vielseitige,
// breit einsetzbare Grundlagen-Übungen mit geringer/mittlerer Belastung.
export const isTrainerTip = (d) => !!d && (d.tip===true || ((d.age?.length||0)>=3 && (d.intensity||5)<=5));

export const DRILL_FOCUS = [
  { id:"aufwärmen", label:"Aufwärmen",  col:"#f59e0b" },
  { id:"technik",    label:"Technik",    col:"#2563eb" },
  { id:"taktik",     label:"Taktik",     col:"#7c3aed" },
  { id:"torschuss",  label:"Torschuss",  col:"#dc2626" },
  { id:"kondition",  label:"Kondition",  col:"#0891b2" },
  { id:"spielform",  label:"Spielform",  col:"#16a34a" },
];
/* DRILL_LIB -> src/drills.js */

export const drillsForPhase = phase => { const fs=PHASE_DRILL_FOCUS[phase]||["technik","taktik"]; return DRILL_LIB.filter(d=>fs.includes(d.focus)); };

// Dauer eines Termins in Minuten aus time + endTime (oder null wenn nicht bestimmbar)
export function eventDurationMin(ev) {
  if(!ev || !ev.time || !ev.endTime) return null;
  const [h1,m1] = ev.time.split(":").map(Number);
  const [h2,m2] = ev.endTime.split(":").map(Number);
  if([h1,m1,h2,m2].some(x=>Number.isNaN(x))) return null;
  let diff = (h2*60+m2) - (h1*60+m1);
  if(diff <= 0) return null;       // Ende vor Start = ungültig
  if(diff > 240) return null;      // unplausibel lang
  return diff;
}

// Volle Trainingskarte einer Übung (Diagramm, Beschreibung, Coaching, Kinder-
// Erklärung, Skills) – als Overlay, von den Plan-Editoren aus aufrufbar.
// Schematische Tartanbahn (Laufbahn) als SVG – fuer Lauf-/Ausdauer-Uebungen.
// Baut aus den Diagramm-Elementen einer Uebung eine Abspiel-Logik:
// Baelle laufen die Pass-/Dribbelwege (verkettet -> ggf. mehrere Baelle),
// Spieler laufen ihre Laufwege. posAt(k) liefert Positionen fuer Fortschritt k.
export function buildDrillAnim(el, meta){
  el=el||[]; meta=meta||{};
  const players=el.filter(e=>e.type==="player");
  const opps=el.filter(e=>e.type==="opp");
  const segs=el.filter(e=>e.type==="passArrow"||e.type==="dribbleArrow");
  const runs=el.filter(e=>e.type==="runArrow"||e.type==="dribbleArrow");
  const hasBall=el.some(e=>e.type==="ball");
  const near=(ax,ay,bx,by)=>Math.hypot(ax-bx,ay-by)<7;
  const ease=x=>x<.5?2*x*x:1-Math.pow(-2*x+2,2)/2;
  const txt=((meta.title||"")+" "+(meta.focus||"")).toLowerCase();
  const isCatch=/fang|fänger|jäg|jag|hasch|räub|hexe|versteiner|drache|krokodil|schwänz|kette|komm mit/.test(txt);
  // 0) Fangspiele zuerst: Faenger/Hexe (rot) jagt, die anderen laufen weg – KEIN Ball.
  // (Hat Vorrang vor evtl. vorhandenen Lauf-Pfeilen, die hier nur Deko sind.)
  if(isCatch && players.length>=1){
    const c = opps[0] || players[0];                 // Faenger/Hexe (opp bevorzugt)
    const flee = players.filter(p=>p!==c);
    const fleers = flee.length?flee:players;
    const cx0=c.x, cy0=c.y;
    const posAt=(k)=>{
      const moved=new Map();
      // Fluechtende laufen in Schleifen, leicht vom Faenger weggebogen.
      const fp=fleers.map((p,i)=>{
        const a=k*Math.PI*2 + i*(Math.PI*2/fleers.length);
        const dx=p.x-cx0, dy=p.y-cy0, nrm=Math.hypot(dx,dy)||1;
        const bx=p.x+(dx/nrm)*4, by=p.y+(dy/nrm)*4;
        return {p, x:bx+Math.cos(a)*12, y:by+Math.sin(a)*9};
      });
      fp.forEach(o=>moved.set(o.p,{x:o.x,y:o.y}));
      if(!fp.length) return {balls:[],moved};
      // Faenger jagt die aktuell naechste fluechtende Person.
      let tx=fp[0].x, ty=fp[0].y, bd=1e9;
      fp.forEach(o=>{const d=Math.hypot(o.x-cx0,o.y-cy0); if(d<bd){bd=d;tx=o.x;ty=o.y;}});
      const e=ease(k);
      moved.set(c,{x:cx0+(tx-cx0)*e, y:cy0+(ty-cy0)*e});
      return {balls:[],moved};
    };
    return {hasAnim:true,posAt,catcher:c};
  }
  // 1) Explizite Pfeile: Spieler laufen die Laufwege, Ball laeuft die Passwege.
  if(segs.length||runs.length){
    const used=new Set(); const chains=[];
    segs.forEach(p=>{ if(used.has(p))return; const isHead=!segs.some(q=>q!==p&&near(q.x2,q.y2,p.x1,p.y1)); if(!isHead)return; const ch=[]; let cur=p,g=0; while(cur&&!used.has(cur)&&g++<24){ used.add(cur); ch.push(cur); cur=segs.find(q=>!used.has(q)&&near(q.x1,q.y1,cur.x2,cur.y2)); } chains.push(ch); });
    segs.forEach(p=>{ if(!used.has(p)){ used.add(p); chains.push([p]); } });
    const runAssign=runs.map(r=>{ let best=null,bd=10; players.forEach(pl=>{const d=Math.hypot(pl.x-r.x1,pl.y-r.y1); if(d<bd){bd=d;best=pl;}}); return {run:r,player:best}; });
    const posAt=(k)=>{
      const balls=chains.map(ch=>{ const N=ch.length||1; const seg=Math.min(N-1,Math.floor(k*N)); const lp=(k*N)-seg; const a=ch[seg]; return {x:a.x1+(a.x2-a.x1)*lp,y:a.y1+(a.y2-a.y1)*lp}; });
      const moved=new Map();
      runAssign.forEach(({run,player})=>{ if(!player)return; const sf=run.pace===3?2:run.pace===1?0.7:run.pace===2?1.35:1; const e=ease(Math.min(1,k*sf)); moved.set(player,{x:run.x1+(run.x2-run.x1)*e,y:run.y1+(run.y2-run.y1)*e}); });
      return {balls,moved};
    };
    return {hasAnim:true,posAt};
  }
  // 2) Keine Pfeile: kindgerechte Bewegung. Spieler laufen in kleinen Schleifen;
  //    ein Ball wandert nur dann reihum, wenn die Uebung ueberhaupt einen Ball hat.
  if(players.length>=2){
    const posAt=(k)=>{
      const moved=new Map();
      players.forEach((p,i)=>{ const a=k*Math.PI*2+i*1.3; moved.set(p,{x:p.x+Math.cos(a)*6,y:p.y+Math.sin(a)*4}); });
      if(!hasBall) return {balls:[],moved};
      const N=players.length; const seg=Math.min(N-1,Math.floor(k*N)); const lp=(k*N)-seg; const a=players[seg], b=players[(seg+1)%N];
      return {balls:[{x:a.x+(b.x-a.x)*lp,y:a.y+(b.y-a.y)*lp}],moved};
    };
    return {hasAnim:true,posAt};
  }
  return {hasAnim:false,posAt:()=>({balls:[],moved:new Map()})};
}

// Lauf-Tempo einer Uebung aus den Skills ableiten (fuer Kinder verstaendlich).
export function drillPace(drill){
  const ax=((drill?.axes||[]).join(" ")+" "+(drill?.focus||"")).toLowerCase();
  if(ax.includes("schnell")) return {level:3,emoji:"🐆",label:"Sprint",color:"#dc2626",kid:"Vollgas – so schnell du kannst, wie ein Gepard!"};
  if(ax.includes("ausdauer")||ax.includes("kondition")) return {level:1,emoji:"🐢",label:"locker & gleichmäßig",color:"#16a34a",kid:"Ruhig traben – langsam genug, dass du dabei noch reden könntest."};
  return {level:2,emoji:"🐇",label:"zügig",color:"#f59e0b",kid:"Flott unterwegs: schnelles Joggen, aber noch kein Vollsprint."};
}


// Trainings-Übungsbibliothek mit Schwerpunkt-Filter und Diagrammen
export function DrillLibrary({ cl, data, myTids, save, fire }) {
  const t = TH(cl);
  const [focus, setFocus] = useState("all");
  const [cat, setCat] = useState("all");
  const [q, setQ] = useState("");
  const [open, setOpen] = useState(null);
  const [style, setStyle] = useState("grass"); // grass | chalk
  const [kidsOnly, setKidsOnly] = useState(false);
  const [dice, setDice] = useState(0);
  const allCats = CAT_ORDER.filter(c=>DRILL_LIB.some(d=>(d.cats||[]).includes(c)));
  const ql = q.trim().toLowerCase();
  const list = DRILL_LIB.filter(d=>
    (focus==="all" || d.focus===focus) &&
    (cat==="all" || (d.cats||[]).includes(cat)) &&
    (!kidsOnly || !!d.kids) &&
    (!ql || d.title.toLowerCase().includes(ql) || (d.desc||"").toLowerCase().includes(ql))
  );
  const focusOf = id => DRILL_FOCUS.find(f=>f.id===id) || {label:id,col:"#64748b"};

  // Regelmäßiger Vorschlag: kindgerechte Übungen, rotiert wöchentlich (+ Würfeln).
  const kidPool = DRILL_LIB.filter(d=>!!d.kids);
  const weekIdx = Math.floor(Date.now()/(7*864e5));
  const sugg = kidPool.length ? kidPool[(weekIdx+dice)%kidPool.length] : null;
  const today = now();
  const nextTraining = (data?.events||[])
    .filter(e=>(myTids||[]).includes(e.tid) && e.type==="training" && e.date>=today)
    .sort((a,b)=>(a.date+(a.time||"")).localeCompare(b.date+(b.time||"")))[0] || null;
  const drillText = d => `Übung: ${d.title} (${d.min} Min, ${d.players})\n${d.kids||d.desc||""}${d.coach?"\nCoaching: "+d.coach:""}`;
  const adoptDrill = d => {
    if(save && data && nextTraining){
      const block = {phase:(focusOf(d.focus).label||"Übung"), id:d.id, title:d.title, min:d.min};
      const tp = nextTraining.trainingPlan;
      const plan = (tp && tp.sessions?.length)
        ? {...tp, sessions: tp.sessions.map((s,i)=>i===0?{...s,blocks:[...(s.blocks||[]),block]}:s)}
        : {cat:(d.cats||[])[0]||null, createdAt:now(), sessions:[{title:"Übungen", blocks:[block]}]};
      save({...data, events:(data.events||[]).map(e=>e.id===nextTraining.id?{...e,trainingPlan:plan}:e)});
      fire && fire(`„${d.title}" zu ${nextTraining.title} (${fmtD(nextTraining.date)}) hinzugefügt`);
    } else {
      navigator.clipboard?.writeText(drillText(d));
      fire && fire("Übung kopiert");
    }
  };
  return (
    <div>
      {sugg && (
        <div style={{background:`linear-gradient(135deg,${t.s||"#052e16"},${t.p})`,borderRadius:16,padding:"15px 16px",marginBottom:14,color:"#fff"}}>
          <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:6}}>
            <span style={{fontSize:11,fontWeight:800,letterSpacing:.4,opacity:.75}}>🌟 SPIEL-VORSCHLAG FÜR DIE KINDER</span>
            <button onClick={()=>{setDice(x=>x+1);setOpen(null);}} style={{background:"rgba(255,255,255,.18)",border:"none",borderRadius:9,padding:"5px 11px",color:"#fff",fontSize:12,fontWeight:800,cursor:"pointer",fontFamily:"inherit"}}>🎲 Neuer</button>
          </div>
          <div style={{fontWeight:900,fontSize:18,marginBottom:3}}>{sugg.title}</div>
          <div style={{fontSize:12.5,opacity:.85,marginBottom:8}}>{focusOf(sugg.focus).label} · {sugg.min} Min · {sugg.players} · {(sugg.cats||[]).slice(0,3).join(", ")}</div>
          <div style={{fontSize:13,lineHeight:1.55,opacity:.95,marginBottom:11}}>{sugg.kids||sugg.desc}</div>
          <div style={{display:"flex",gap:8,flexWrap:"wrap"}}>
            <button onClick={()=>{setKidsOnly(false);setFocus("all");setCat("all");setQ("");setOpen(sugg.id);setTimeout(()=>document.getElementById("drill-"+sugg.id)?.scrollIntoView({behavior:"smooth",block:"center"}),60);}} style={{background:"rgba(255,255,255,.16)",border:"none",borderRadius:10,padding:"9px 14px",color:"#fff",fontSize:13,fontWeight:800,cursor:"pointer",fontFamily:"inherit"}}>Diagramm ansehen</button>
            <button onClick={()=>adoptDrill(sugg)} style={{background:"#fff",border:"none",borderRadius:10,padding:"9px 16px",color:t.p,fontSize:13,fontWeight:800,cursor:"pointer",fontFamily:"inherit"}}>{nextTraining?"Ins nächste Training übernehmen":"Übernehmen (kopieren)"}</button>
          </div>
          {nextTraining && <div style={{fontSize:11,opacity:.7,marginTop:7}}>Nächstes Training: {fmtD(nextTraining.date)}{nextTraining.time?" · "+nextTraining.time:""}</div>}
        </div>
      )}
      <input value={q} onChange={e=>setQ(e.target.value)} placeholder="Übung suchen (Name oder Inhalt)…"
        autoCapitalize="none" autoCorrect="off"
        style={{width:"100%",padding:"11px 14px",fontSize:14,border:"1.5px solid #e2e8f0",borderRadius:11,outline:"none",marginBottom:10,boxSizing:"border-box"}}/>
      <AffiliateBanner trigger="training" slim style={{marginBottom:10}}/>
      <div style={{display:"flex",gap:6,marginBottom:10,alignItems:"center"}}>
        <span style={{fontSize:11,fontWeight:800,color:"#64748b",letterSpacing:.3}}>DARSTELLUNG:</span>
        <button onClick={()=>setStyle("grass")} style={{padding:"5px 12px",borderRadius:99,border:`1.5px solid ${style==="grass"?t.p:"#e2e8f0"}`,background:style==="grass"?t.p:"#fff",color:style==="grass"?"#fff":"#475569",fontWeight:700,fontSize:12,cursor:"pointer",fontFamily:"inherit"}}>Rasen</button>
        <button onClick={()=>setStyle("chalk")} style={{padding:"5px 12px",borderRadius:99,border:`1.5px solid ${style==="chalk"?"#1c2530":"#e2e8f0"}`,background:style==="chalk"?"#1c2530":"#fff",color:style==="chalk"?"#fff":"#475569",fontWeight:700,fontSize:12,cursor:"pointer",fontFamily:"inherit"}}>Taktiktafel</button>
        <button onClick={()=>setStyle("kids")} style={{padding:"5px 12px",borderRadius:99,border:`1.5px solid ${style==="kids"?"#f59e0b":"#e2e8f0"}`,background:style==="kids"?"#f59e0b":"#fff",color:style==="kids"?"#fff":"#475569",fontWeight:700,fontSize:12,cursor:"pointer",fontFamily:"inherit"}}>Für Kinder</button>
      </div>
      <div style={{display:"flex",gap:6,overflowX:"auto",marginBottom:8,scrollbarWidth:"none"}}>
        <button onClick={()=>setFocus("all")} style={{flex:"0 0 auto",padding:"7px 14px",borderRadius:99,border:`1.5px solid ${focus==="all"?t.p:"#e2e8f0"}`,background:focus==="all"?t.p:"#fff",color:focus==="all"?"#fff":"#475569",fontWeight:700,fontSize:12.5,cursor:"pointer",fontFamily:"inherit",whiteSpace:"nowrap"}}>Alle ({DRILL_LIB.length})</button>
        <button onClick={()=>setKidsOnly(v=>!v)} style={{flex:"0 0 auto",padding:"7px 14px",borderRadius:99,border:`1.5px solid ${kidsOnly?"#f59e0b":"#e2e8f0"}`,background:kidsOnly?"#f59e0b":"#fff",color:kidsOnly?"#fff":"#475569",fontWeight:700,fontSize:12.5,cursor:"pointer",fontFamily:"inherit",whiteSpace:"nowrap"}}>🧒 Kinder ({kidPool.length})</button>
        {DRILL_FOCUS.map(f=>{
          const n=DRILL_LIB.filter(d=>d.focus===f.id).length;
          return (
            <button key={f.id} onClick={()=>setFocus(f.id)} style={{flex:"0 0 auto",padding:"7px 14px",borderRadius:99,border:`1.5px solid ${focus===f.id?f.col:"#e2e8f0"}`,background:focus===f.id?f.col:"#fff",color:focus===f.id?"#fff":"#475569",fontWeight:700,fontSize:12.5,cursor:"pointer",fontFamily:"inherit",whiteSpace:"nowrap"}}>{f.label} ({n})</button>
          );
        })}
      </div>

      <div style={{display:"flex",gap:6,overflowX:"auto",marginBottom:10,scrollbarWidth:"none"}}>
        <button onClick={()=>setCat("all")} style={{flex:"0 0 auto",padding:"6px 12px",borderRadius:99,border:`1.5px solid ${cat==="all"?t.p:"#e2e8f0"}`,background:cat==="all"?"#f0fdf4":"#fff",color:cat==="all"?t.p:"#94a3b8",fontWeight:700,fontSize:12,cursor:"pointer",fontFamily:"inherit",whiteSpace:"nowrap"}}>Alle Klassen</button>
        {allCats.map(c=>(
          <button key={c} onClick={()=>setCat(c)} style={{flex:"0 0 auto",padding:"6px 12px",borderRadius:99,border:`1.5px solid ${cat===c?t.p:"#e2e8f0"}`,background:cat===c?"#f0fdf4":"#fff",color:cat===c?t.p:"#94a3b8",fontWeight:700,fontSize:12,cursor:"pointer",fontFamily:"inherit",whiteSpace:"nowrap"}}>{c}</button>
        ))}
      </div>

      <div style={{fontSize:12,color:"#64748b",fontWeight:700,marginBottom:10}}>{list.length} {list.length===1?"Übung":"Übungen"}</div>

      <div style={{display:"flex",flexDirection:"column",gap:10}}>
        {list.length===0 && <div style={{color:"#64748b",fontSize:14,padding:"20px",textAlign:"center"}}>Keine Übung gefunden. Filter oder Suche anpassen.</div>}
        {list.map(d=>{
          const f=focusOf(d.focus);
          const isOpen=open===d.id;
          return (
            <div key={d.id} id={"drill-"+d.id} style={{background:"#fff",borderRadius:14,border:"1.5px solid #e2e8f0",overflow:"hidden"}}>
              <button onClick={()=>setOpen(isOpen?null:d.id)} style={{width:"100%",textAlign:"left",padding:"13px 15px",background:"none",border:"none",cursor:"pointer",fontFamily:"inherit",display:"flex",alignItems:"center",gap:10}}>
                <span style={{width:9,height:9,borderRadius:"50%",background:f.col,flexShrink:0}}/>
                <span style={{flex:1,minWidth:0}}>
                  <span style={{display:"block",fontWeight:800,fontSize:14.5,color:"#0f172a"}}>{d.title}{d.kids&&<span style={{marginLeft:6,fontSize:11,color:"#f59e0b",fontWeight:800}}>🧒</span>}</span>
                  <span style={{display:"block",fontSize:12,color:"#64748b",marginTop:1}}>{f.label} · {d.min} Min · {d.players} Spieler</span>
                </span>
                <span style={{fontSize:18,color:"#64748b",transform:isOpen?"rotate(90deg)":"none",transition:"transform .2s"}}>›</span>
              </button>
              {isOpen && (
                <div style={{padding:"0 15px 15px"}}>
                  <div style={{display:"flex",justifyContent:"center",marginBottom:12}}>
                    <DrillDiagram field={d.field} elements={d.el} color={t.p||"#16a34a"} width={300} variant={style}/>
                  </div>
                  {style==="kids" ? (
                    d.kids ? (
                      <div style={{background:"#fffbeb",border:"2px solid #fde68a",borderRadius:14,padding:"14px 16px",fontSize:16,color:"#78350f",lineHeight:1.65,fontWeight:600}}>
                        {d.kids}
                      </div>
                    ) : (
                      <div style={{background:"#f1f5f9",borderRadius:12,padding:"12px 14px",fontSize:13.5,color:"#64748b",lineHeight:1.6}}>
                        Diese Übung ist eher für ältere Kinder gedacht. Für die Jüngsten eignen sich z.&nbsp;B. Ballschule, Fangspiel oder Dribbel-Übungen am besten.
                      </div>
                    )
                  ) : (
                    <>
                      <p style={{fontSize:13.5,color:"#334155",lineHeight:1.6,marginBottom:10}}>{d.desc}</p>
                      {d.coach && <div style={{background:"#f0fdf4",border:"1px solid #bbf7d0",borderRadius:10,padding:"9px 12px",fontSize:12.5,color:"#166534",lineHeight:1.5,marginBottom:8}}><strong>Coaching:</strong> {d.coach}</div>}
                    </>
                  )}
                  <div style={{fontSize:11.5,color:"#64748b",marginTop:8}}>Geeignet für: {d.cats.join(", ")}</div>
                  <button onClick={()=>adoptDrill(d)} style={{marginTop:10,width:"100%",padding:"10px",borderRadius:10,border:"none",background:t.p,color:contrast(t.p),fontWeight:800,fontSize:13,cursor:"pointer",fontFamily:"inherit"}}>
                    {nextTraining?`Ins nächste Training übernehmen (${fmtD(nextTraining.date)})`:"Übung kopieren"}
                  </button>
                </div>
              )}
            </div>
          );
        })}
      </div>
      <div style={{marginTop:14,fontSize:11,color:"#64748b",lineHeight:1.5,textAlign:"center"}}>
        {DRILL_LIB.length} Übungen · weitere folgen. Diagramme als Orientierung, an Gruppe und Platz anpassen.
      </div>
    </div>
  );
}

// Bewegungs-/Verhaltens-Empfehlung je Aufstellung (inkl. Hinweis gegen typische Gegnerformation).
export const FORMATION_MOVE={
  "4-4-2":"Als zwei Viererketten ballorientiert verschieben; Stürmer lenken den Aufbau, Außen schieben zum Ball, Abstände eng. Gegen 4-3-3: Zentrum/Sechserraum zustellen, Flügel doppeln.",
  "4-3-3":"Hoch anlaufen, Flügel binden die Außenverteidiger, Achter besetzen die Halbräume. Gegen tiefe Gegner: breit machen, schnell verlagern, Strafraum besetzen.",
  "4-2-3-1":"Doppel-Sechs sichert ab, Zehner stört den gegnerischen Sechser, Außen hinterlaufen. Gegen 4-4-2: zentrale Überzahl (Sechser+Zehner) ausspielen.",
  "4-1-4-1":"Kompakter Block, der Sechser verschiebt vor der Abwehr; bei Ballgewinn schnell über die Mittelfeld-Vier umschalten. Gegen ballbesitzstarke Teams: Mitte dichtmachen.",
  "3-5-2":"Flügelläufer geben Breite, im Zentrum Überzahl; bei Ballverlust kippt ein Achter in die Kette. Gegen 4-4-2: Mittelfeld-Überzahl nutzen, Außenbahnen sind der Schlüssel.",
  "5-3-2":"Tiefer Fünferblock, Außen rücken erst spät heraus; auf schnelles Umschalten mit zwei Spitzen spielen. Gegen Favoriten: kompakt bleiben, Räume eng.",
  "3-4-3":"Maximaler Druck, Flügelstürmer + Wingbacks geben Breite und Tiefe; die Dreierkette muss sehr gut absichern. Gegen schwächere/tiefe Gegner.",
  "4-4-2 Raute":"Zentrale Überzahl, Zehner agiert zwischen den Linien; die Außenverteidiger müssen die fehlende Breite geben. Gegen zentrumsstarke Teams.",
  "4-5-1":"Sehr enges Mittelfeld, kaum zu bespielen; der Einzelstürmer hält Bälle fest, das Mittelfeld rückt nach. Gegen stärkere Gegner / Ergebnis halten.",
};

/* =================================================================
   KINDER-BEREICH: Wochen-Übungen (Eltern-Freigabe) + Bundesliga-Quiz
================================================================= */

// ISO-Kalenderwoche als stabiler Schluessel, z.B. "2026-W29"
export const isoWeek=(d=new Date())=>{ const x=new Date(Date.UTC(d.getFullYear(),d.getMonth(),d.getDate())); const day=x.getUTCDay()||7; x.setUTCDate(x.getUTCDate()+4-day); const y0=new Date(Date.UTC(x.getUTCFullYear(),0,1)); const w=Math.ceil(((x-y0)/864e5+1)/7); return `${x.getUTCFullYear()}-W${String(w).padStart(2,"0")}`; };
// Deterministischer Zufall: gleiche Woche -> gleiche Auswahl (auf jedem Geraet)
const hashStr=s=>{ let h=0; for(let i=0;i<s.length;i++) h=(h*31+s.charCodeAt(i))|0; return h>>>0; };
const mulberry=(seed)=>{ let a=seed>>>0; return ()=>{ a|=0; a=a+0x6D2B79F5|0; let t2=Math.imul(a^a>>>15,1|a); t2=t2+Math.imul(t2^t2>>>7,61|t2)^t2; return ((t2^t2>>>14)>>>0)/4294967296; }; };
const seededPick=(arr,n,seed)=>{ const rnd=mulberry(seed); const a=arr.slice(); for(let i=a.length-1;i>0;i--){ const j=Math.floor(rnd()*(i+1)); [a[i],a[j]]=[a[j],a[i]]; } return a.slice(0,n); };

// Wochen-Übungen fuers Training zuhause – nur sichtbar, wenn die Eltern es
// im Profil freigegeben haben (profile.soloOk). 3 Solo-Übungen pro Woche.
export function WeeklySoloCard({profile,data,save,fire,color="#16a34a"}){
  const weekKey=isoWeek();
  const pool=DRILL_LIB.filter(d=>/^(1|beliebig)/i.test(String(d.players||""))&&d.kids);
  const drills=seededPick(pool,3,hashStr(weekKey+"_"+(profile.id||"")));
  const done=(profile.soloDone&&profile.soloDone[weekKey])||[];
  const [open,setOpen]=useState(null);
  const toggleDone=(id)=>{
    const arr=done.includes(id)?done.filter(x=>x!==id):[...done,id];
    save({...data,playerProfiles:(data.playerProfiles||[]).map(p=>p.id===profile.id?{...p,soloDone:{[weekKey]:arr}}:p)});
    if(!done.includes(id)) fire&&fire(arr.length===drills.length?"Alle Übungen geschafft! 🎉":"Super gemacht! ⭐");
  };
  return (
    <div style={{background:"#fff",border:"1.5px solid #e2e8f0",borderRadius:14,padding:"14px 15px",marginBottom:14}}>
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:4}}>
        <span style={{fontSize:11,fontWeight:800,color:"#64748b",letterSpacing:.4}}>🏠 DEINE ÜBUNGEN DER WOCHE</span>
        <span style={{fontSize:12,fontWeight:800,color:done.length===drills.length?"#16a34a":"#64748b"}}>{done.length}/{drills.length} {done.length===drills.length?"🎉":""}</span>
      </div>
      <div style={{fontSize:12,color:"#64748b",lineHeight:1.5,marginBottom:11}}>Diese 3 Übungen kannst du diese Woche alleine üben – Garten, Hof oder Wohnzimmer reicht!</div>
      <div style={{display:"flex",flexDirection:"column",gap:8}}>
        {drills.map(d=>{
          const isDone=done.includes(d.id), isOpen=open===d.id;
          return (
            <div key={d.id} style={{border:`1.5px solid ${isDone?"#bbf7d0":"#e2e8f0"}`,borderRadius:12,background:isDone?"#f0fdf4":"#fff",overflow:"hidden"}}>
              <div style={{display:"flex",alignItems:"center",gap:8,padding:"10px 12px"}}>
                <button onClick={()=>setOpen(isOpen?null:d.id)} style={{flex:1,textAlign:"left",background:"none",border:"none",cursor:"pointer",fontFamily:"inherit",minWidth:0,padding:0}}>
                  <div style={{fontWeight:800,fontSize:14,color:"#0f172a"}}>{isDone?"✅ ":""}{d.title}</div>
                  <div style={{fontSize:11.5,color:"#64748b"}}>{d.min} Min · tippen für Anleitung</div>
                </button>
                <button onClick={()=>toggleDone(d.id)}
                  style={{flexShrink:0,padding:"8px 12px",borderRadius:10,border:"none",background:isDone?"#16a34a":color+"18",color:isDone?"#fff":color,fontWeight:800,fontSize:12.5,cursor:"pointer",fontFamily:"inherit",whiteSpace:"nowrap"}}>{isDone?"Geschafft!":"✔ Fertig?"}</button>
              </div>
              {isOpen&&(
                <div style={{padding:"0 12px 12px"}}>
                  <div style={{display:"flex",justifyContent:"center",marginBottom:10}}>
                    <DrillDiagram field={d.field} elements={d.el} color={color} width={260} variant="kids"/>
                  </div>
                  <div style={{background:"#fffbeb",border:"1.5px solid #fde68a",borderRadius:11,padding:"11px 13px",fontSize:14,color:"#78350f",lineHeight:1.6,fontWeight:600}}>{d.kids}</div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

// Bundesliga-Fragenbank fuer das Wochen-Quiz (feststehende Fakten, kindgerecht).
// Die "KI" waehlt jede Woche deterministisch 5 neue Fragen fuer alle aus.
export const BL_QUIZ=[
  {q:"Welcher Verein ist Rekordmeister der Bundesliga?",a:["FC Bayern München","Borussia Dortmund","Hamburger SV","1. FC Köln"],c:0,info:"Der FC Bayern hat die meisten Meistertitel geholt."},
  {q:"Wer schoss die meisten Tore in der Bundesliga-Geschichte?",a:["Gerd Müller","Thomas Müller","Robert Lewandowski","Miroslav Klose"],c:0,info:"Gerd Müller traf unglaubliche 365-mal – der 'Bomber der Nation'."},
  {q:"Wer stellte mit 41 Toren in einer Saison den Rekord auf?",a:["Robert Lewandowski","Erling Haaland","Gerd Müller","Harry Kane"],c:0,info:"Lewandowski schaffte 2020/21 sogar mehr als Gerd Müllers 40 Tore."},
  {q:"Wie heißt das Stadion von Borussia Dortmund?",a:["Signal Iduna Park","Allianz Arena","Olympiastadion","Volksparkstadion"],c:0,info:"Mit der berühmten 'Gelben Wand' – der größten Stehtribüne Europas."},
  {q:"Welche Farben trägt Borussia Dortmund?",a:["Schwarz-Gelb","Rot-Weiß","Blau-Weiß","Grün-Weiß"],c:0,info:"Deshalb sagt man auch 'die Schwarz-Gelben'."},
  {q:"Welcher Verein wird 'Die Königsblauen' genannt?",a:["FC Schalke 04","Hertha BSC","VfL Bochum","TSG Hoffenheim"],c:0,info:"Schalke spielt in königsblauen Trikots."},
  {q:"Wie nennen viele die Meisterschale liebevoll?",a:["Salatschüssel","Suppenteller","Goldtopf","Silberpfanne"],c:0,info:"Weil die Schale wie eine große Schüssel aussieht."},
  {q:"Wie viele Vereine spielen in der Bundesliga?",a:["18","16","20","22"],c:0,info:"18 Teams spielen je zweimal gegeneinander – 34 Spieltage."},
  {q:"In welchem Stadion spielt der FC Bayern?",a:["Allianz Arena","Signal Iduna Park","Deutsche Bank Park","Red Bull Arena"],c:0,info:"Die Arena in München leuchtet bei Heimspielen rot."},
  {q:"Wer wurde 2024 Meister – ohne ein einziges Spiel zu verlieren?",a:["Bayer Leverkusen","FC Bayern München","VfB Stuttgart","RB Leipzig"],c:0,info:"Leverkusen blieb die ganze Saison ungeschlagen – das gab es noch nie!"},
  {q:"Wie lange dauert ein Bundesliga-Spiel (ohne Nachspielzeit)?",a:["90 Minuten","60 Minuten","80 Minuten","100 Minuten"],c:0,info:"Zweimal 45 Minuten mit einer Pause dazwischen."},
  {q:"Welche zwei Teams spielen den 'Klassiker'?",a:["Bayern und Dortmund","Schalke und Dortmund","Bayern und 1860","HSV und Bremen"],c:0,info:"Das Duell der zwei erfolgreichsten Teams der letzten Jahre."},
  {q:"Auf welcher Position wurde Manuel Neuer weltberühmt?",a:["Torwart","Stürmer","Verteidiger","Mittelfeld"],c:0,info:"Er erfand den 'mitspielenden Torwart' fast neu."},
  {q:"Wie viele Punkte gibt es für einen Sieg?",a:["3","2","1","5"],c:0,info:"Sieg = 3 Punkte, Unentschieden = 1 Punkt, Niederlage = 0."},
  {q:"Was bekommt der beste Torschütze der Saison?",a:["Die Torjägerkanone","Den Goldenen Schuh","Einen Pokal-Teller","Eine Medaille"],c:0,info:"Die Kanone ist die berühmte Trophäe der Bundesliga."},
  {q:"Welcher Verein wird 'Werkself' genannt?",a:["Bayer Leverkusen","VfL Wolfsburg","RB Leipzig","Mainz 05"],c:0,info:"Der Verein wurde von Mitarbeitern des Bayer-Werks gegründet."},
  {q:"Welcher Verein ist für seine 'Fohlen' bekannt?",a:["Borussia Mönchengladbach","Eintracht Frankfurt","Werder Bremen","1. FC Union Berlin"],c:0,info:"In den 70ern spielte Gladbach so jung und wild, dass man sie Fohlen nannte."},
  {q:"Wie viele Spieler stehen pro Team auf dem Platz?",a:["11","10","12","9"],c:0,info:"10 Feldspieler plus 1 Torwart."},
  {q:"Welche zwei Bundesliga-Klubs trainierte Jürgen Klopp?",a:["Mainz und Dortmund","Bayern und Schalke","Köln und Bremen","Stuttgart und Hertha"],c:0,info:"Mit Dortmund wurde er 2011 und 2012 Deutscher Meister."},
  {q:"Bei welchem Verein war Uwe Seeler die große Legende?",a:["Hamburger SV","Werder Bremen","FC St. Pauli","Hannover 96"],c:0,info:"'Uns Uwe' blieb dem HSV sein Leben lang treu."},
  {q:"Wo spielt Werder Bremen seine Heimspiele?",a:["Weserstadion","Rheinstadion","Ostseestadion","Waldstadion"],c:0,info:"Das Stadion liegt direkt am Fluss Weser."},
  {q:"Was gibt es, wenn ein Spieler im Strafraum gefoult wird?",a:["Elfmeter","Ecke","Einwurf","Abstoß"],c:0,info:"Der Ball kommt auf den Punkt – 11 Meter vor dem Tor."},
  {q:"Wie weit ist der Elfmeterpunkt vom Tor entfernt?",a:["11 Meter","7 Meter","16 Meter","9 Meter"],c:0,info:"Deshalb heißt er auch Elfmeter!"},
  {q:"In welchem Jahr startete die Bundesliga?",a:["1963","1950","1974","1990"],c:0,info:"Über 60 Jahre Bundesliga-Geschichte!"},
  {q:"Wer wurde 1964 allererster Bundesliga-Meister?",a:["1. FC Köln","FC Bayern München","Borussia Dortmund","1860 München"],c:0,info:"Die Kölner gewannen die allererste Saison."},
  {q:"Welcher Verein hat einen echten Geißbock als Maskottchen?",a:["1. FC Köln","VfB Stuttgart","SC Freiburg","FC Augsburg"],c:0,info:"Der Geißbock heißt Hennes – nach Trainer Hennes Weisweiler."},
  {q:"Was zeigt der Schiedsrichter bei einem ganz bösen Foul?",a:["Rote Karte","Gelbe Karte","Grüne Karte","Blaue Karte"],c:0,info:"Rot heißt: sofort runter vom Platz."},
  {q:"Bei welchem Verein spielte Thomas Müller seine ganze Karriere?",a:["FC Bayern München","1860 München","FC Augsburg","Borussia Dortmund"],c:0,info:"Müller kam schon als Kind zum FC Bayern."},
  {q:"Welcher Verein war die große Liebe von Marco Reus?",a:["Borussia Dortmund","FC Bayern München","FC Schalke 04","Bayer Leverkusen"],c:0,info:"Reus ist in Dortmund geboren und wurde dort Kapitän."},
  {q:"Wie heißt der große Pokal-Wettbewerb in Deutschland?",a:["DFB-Pokal","Liga-Cup","Super-Schale","Deutschland-Trophäe"],c:0,info:"Das Finale ist jedes Jahr in Berlin."},
  {q:"Was ist ein 'Hattrick'?",a:["3 Tore eines Spielers in einem Spiel","Ein Trick mit dem Hut","3 gehaltene Elfmeter","3 Ecken hintereinander"],c:0,info:"Drei Tore in einem Spiel – das schaffen nur die Besten!"},
  {q:"Wie nennt man ein Tor ins eigene Netz?",a:["Eigentor","Fehlschuss","Rücktor","Falschtor"],c:0,info:"Passiert auch den Profis manchmal – Kopf hoch!"},
  {q:"Welche Stadt jubelt für den 1. FC Union in der 'Alten Försterei'?",a:["Berlin","Leipzig","Dresden","Rostock"],c:0,info:"Die Union-Fans haben ihr Stadion sogar selbst mitgebaut."},
  {q:"Was passiert mit den zwei letzten Teams der Tabelle?",a:["Sie steigen in die 2. Liga ab","Sie dürfen nochmal spielen","Nichts","Sie bekommen einen Pokal"],c:0,info:"Platz 17 und 18 steigen direkt ab, Platz 16 spielt Relegation."},
  {q:"Welcher Torwart hielt für den FC Bayern jahrelang den Kasten sauber und wurde Weltmeister 2014?",a:["Manuel Neuer","Oliver Kahn","Marc-André ter Stegen","Kevin Trapp"],c:0,info:"2014 in Brasilien stand er im WM-Finale im Tor."},
  {q:"Wie oft spielt jedes Team pro Saison gegen jedes andere?",a:["2-mal","1-mal","3-mal","4-mal"],c:0,info:"Einmal zuhause, einmal auswärts – Hin- und Rückrunde."},
];

// Woechentliches Bundesliga-Quiz: 5 Fragen, alle als Auswahlfelder.
export function WeeklyQuizCard({profile,data,save,fire,color="#7c3aed"}){
  const weekKey=isoWeek();
  const qs=useMemo(()=>{
    // Antworten mischen (richtige Antwort steht in der Bank immer vorne)
    return seededPick(BL_QUIZ,5,hashStr("quiz_"+weekKey)).map((it,qi)=>{
      const order=seededPick(it.a.map((_,i)=>i),it.a.length,hashStr(weekKey+"_"+qi+"_"+it.q.length));
      return {...it,opts:order.map(i=>it.a[i]),correct:order.indexOf(it.c)};
    });
  },[weekKey]);
  const savedScore=profile?.quizScores?.[weekKey];
  const [st,setSt]=useState(null); // null | {idx,score,picked}
  const [doneScore,setDoneScore]=useState(null);
  const start=()=>setSt({idx:0,score:0,picked:null});
  const pick=(i)=>{ if(!st||st.picked!=null) return; setSt({...st,picked:i,score:st.score+(i===qs[st.idx].correct?1:0)}); };
  const next=()=>{
    if(!st) return;
    if(st.idx+1<qs.length){ setSt({idx:st.idx+1,score:st.score,picked:null}); return; }
    const score=st.score; setSt(null); setDoneScore(score);
    if(profile&&(savedScore==null||score>savedScore)){
      save({...data,playerProfiles:(data.playerProfiles||[]).map(p=>p.id===profile.id?{...p,quizScores:{...(p.quizScores||{}),[weekKey]:score}}:p)});
    }
    fire&&fire(score>=4?`${score}/5 – Fußball-Profi! 🏆`:`${score}/5 geschafft!`);
  };
  const cur=st?qs[st.idx]:null;
  return (
    <div style={{background:"linear-gradient(135deg,#faf5ff,#eff6ff)",border:"1.5px solid #ddd6fe",borderRadius:14,padding:"14px 15px",marginBottom:14}}>
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:4}}>
        <span style={{fontSize:11,fontWeight:800,color:color,letterSpacing:.4}}>🧠 BUNDESLIGA-QUIZ DER WOCHE</span>
        {st&&<span style={{fontSize:12,fontWeight:800,color:"#64748b"}}>Frage {st.idx+1}/{qs.length}</span>}
      </div>
      {!st&&(
        <>
          <div style={{fontSize:12.5,color:"#4c1d95",lineHeight:1.55,marginBottom:11}}>
            Jede Woche 5 neue Fragen rund um die Bundesliga – Spieler, Rekorde, Regeln.
            {savedScore!=null&&<b> Dein Rekord diese Woche: {savedScore}/5 ⭐</b>}
            {doneScore!=null&&savedScore==null&&<b> Gerade geschafft: {doneScore}/5 ⭐</b>}
          </div>
          <button onClick={start}
            style={{width:"100%",padding:"13px",borderRadius:11,border:"none",background:color,color:"#fff",fontWeight:900,fontSize:15,cursor:"pointer",fontFamily:"inherit"}}>{savedScore!=null||doneScore!=null?"🔁 Nochmal spielen":"▶ Quiz starten"}</button>
        </>
      )}
      {st&&cur&&(
        <div style={{background:"#fff",borderRadius:12,padding:"13px 14px"}}>
          <div style={{fontWeight:800,fontSize:15,color:"#0f172a",lineHeight:1.5,marginBottom:11}}>{cur.q}</div>
          <div style={{display:"flex",flexDirection:"column",gap:7}}>
            {cur.opts.map((o,i)=>{
              const isPicked=st.picked===i, isCorrect=i===cur.correct, show=st.picked!=null;
              return (
                <button key={i} onClick={()=>pick(i)}
                  style={{padding:"12px 13px",borderRadius:11,textAlign:"left",fontWeight:700,fontSize:14,cursor:show?"default":"pointer",fontFamily:"inherit",
                    border:`2px solid ${show&&isCorrect?"#16a34a":show&&isPicked?"#dc2626":"#e2e8f0"}`,
                    background:show&&isCorrect?"#f0fdf4":show&&isPicked?"#fef2f2":"#fff",
                    color:show&&isCorrect?"#166534":show&&isPicked?"#b91c1c":"#334155"}}>
                  {show&&isCorrect?"✅ ":show&&isPicked?"❌ ":""}{o}
                </button>
              );
            })}
          </div>
          {st.picked!=null&&(
            <>
              <div style={{marginTop:10,background:"#f8fafc",borderRadius:10,padding:"9px 12px",fontSize:12.5,color:"#475569",lineHeight:1.5}}>💡 {cur.info}</div>
              <button onClick={next}
                style={{width:"100%",marginTop:10,padding:"12px",borderRadius:11,border:"none",background:color,color:"#fff",fontWeight:900,fontSize:14,cursor:"pointer",fontFamily:"inherit"}}>{st.idx+1<qs.length?"▶ Nächste Frage":"🏁 Ergebnis"}</button>
            </>
          )}
        </div>
      )}
    </div>
  );
}

// Auswahlzeile fuer die befristete Kinder-Freischaltung (Kind + Dauer + Knopf)
function UnlockPicker({kids,onGrant,t}){
  const [pid,setPid]=useState("");
  const [days,setDays]=useState(3);
  return (
    <div style={{display:"flex",gap:7,flexWrap:"wrap"}}>
      <select value={pid} onChange={e=>setPid(e.target.value)} style={{flex:1,minWidth:130,padding:"9px 10px",borderRadius:10,border:"1.5px solid #e2e8f0",fontSize:13.5,fontFamily:"inherit"}}>
        <option value="">Kind wählen…</option>
        {kids.map(k=><option key={k.id} value={k.id}>{k.name}</option>)}
      </select>
      {[[1,"1 Tag"],[3,"3 Tage"],[7,"1 Woche"]].map(([d,l])=>(
        <button key={d} onClick={()=>setDays(d)} style={{padding:"8px 11px",borderRadius:9,border:`1.5px solid ${days===d?t.p:"#e2e8f0"}`,background:days===d?t.p+"15":"#fff",color:days===d?t.p:"#64748b",fontWeight:700,fontSize:12,cursor:"pointer",fontFamily:"inherit"}}>{l}</button>
      ))}
      <button onClick={()=>pid&&onGrant(pid,days)} disabled={!pid}
        style={{padding:"8px 14px",borderRadius:9,border:"none",background:pid?t.p:"#e2e8f0",color:pid?"#fff":"#94a3b8",fontWeight:800,fontSize:12.5,cursor:pid?"pointer":"default",fontFamily:"inherit"}}>🔓 Freischalten</button>
    </div>
  );
}

export function TacticBoard({ data, myTids, cl, save, fire, eventCtx=null, onAttachBoard=null, playerCtx=null }) {
  const t=TH(cl);
  const sportMap={fussball:"football",handball:"handball",basketball:"basketball"};
  const [sport,setSport]=useState(sportMap[cl?.sport]||"football");
  const F = TB_FIELDS[sport]||TB_FIELDS.generic;
  const [count,setCount]=useState(F.counts.includes(11)?11:F.counts[0]);
  const [formIdx,setFormIdx]=useState(0);
  const forms = tbForms(sport,count);
  const teamCol = cl?.pri || "#16a34a";
  const buildTokens = (sp,cnt,fi)=>{ const FF=TB_FIELDS[sp]||TB_FIELDS.generic; const f=tbForms(sp,cnt)[fi]||tbForms(sp,cnt)[0]; return (f?.p||[]).map((pos,i)=>({id:"tk"+i,x:pos[0]*FF.vw,y:pos[1]*FF.vh,n:i+1})); };
  const [tokens,setTokens]=useState(()=>buildTokens(sport,count,formIdx));
  useEffect(()=>{ if(skipRebuildRef.current) return; setTokens(buildTokens(sport,count,formIdx)); resetAnim();   },[sport,count,formIdx]);
  // Gegner-Team (gespiegelt auf der oberen Haelfte), eigene Aufstellung, verschiebbar.
  const [showOpp,setShowOpp]=useState(false);
  // Freier Ball: ein-/ausblendbar und wie ein Spieler-Token verschiebbar.
  const [ballPos,setBallPos]=useState(null); // null = ausgeblendet
  const toggleBall=()=>setBallPos(b=>b?null:{x:F.vw/2,y:F.vh/2});
  // Einfach-Modus (Kinder): grosse Knoepfe, weniger Optionen – gleiche Technik darunter.
  // Kinder-Sessions (playerCtx) starten immer im Einfach-Modus.
  const [kidMode,setKidMode]=useState(()=>{ if(playerCtx) return true; try{ return localStorage.getItem("va_tb_kid")==="1"; }catch{ return false; } });
  const setKid=(v)=>{ setKidMode(v); try{ localStorage.setItem("va_tb_kid",v?"1":"0"); }catch{} };
  // Fokus-Spotlight: einen Spieler hervorheben, alle anderen abdunkeln.
  const [focusId,setFocusId]=useState(null);
  // Vorfuehr-Modus: Vollbild nur mit Feld + Controller. Aus einem Termin ("Wizard")
  // geoeffnet startet die Tafel direkt im Fokus, inklusive Steuerkreuz.
  const [present,setPresent]=useState(!!eventCtx);
  // "Leben": staendige kleine Bewegung aller Spieler, Gegner orientieren sich zum Ball.
  const [liveOn,setLiveOn]=useState(false);
  const [liveT,setLiveT]=useState(0);
  useEffect(()=>{ if(!liveOn){ setLiveT(0); return; }
    let on=true,id=0,last=0;
    const lo=(t)=>{ if(!on) return; if(t-last>40){ last=t; setLiveT(t); } id=requestAnimationFrame(lo); };
    id=requestAnimationFrame(lo);
    return ()=>{ on=false; cancelAnimationFrame(id); };
  },[liveOn]);
  const [aiHint,setAiHint]=useState("");
  // Auswahl + Steuerkreuz (wie am Gameboy): angetippten Spieler mit Pfeilen steuern.
  const [selTok,setSelTok]=useState(null);   // {side:"own"|"opp", id}
  const [padOn,setPadOn]=useState(!!eventCtx);
  const padHold=useRef(null);
  const padStop=()=>{ if(padHold.current){ clearInterval(padHold.current); padHold.current=null; } };
  useEffect(()=>()=>padStop(),[]);
  const [oppFormIdx,setOppFormIdx]=useState(0);
  const buildOpp=(sp,cnt,fi)=>{ const FF=TB_FIELDS[sp]||TB_FIELDS.generic; const f=tbForms(sp,cnt)[fi]||tbForms(sp,cnt)[0]; return (f?.p||[]).map((pos,i)=>({id:"op"+i,x:pos[0]*FF.vw,y:(1-pos[1])*FF.vh,n:i+1})); };
  const [oppTokens,setOppTokens]=useState(()=>buildOpp(sport,count,oppFormIdx));
  useEffect(()=>{ if(skipRebuildRef.current) return; setOppTokens(buildOpp(sport,count,oppFormIdx));   },[sport,count,oppFormIdx]);
  const dragSetRef=useRef("own");
  // Animation: Spieler entlang der eingezeichneten Laufwege bewegen.
  const [animOwn,setAnimOwn]=useState(null);
  const [animOpp,setAnimOpp]=useState(null);
  const [animBall,setAnimBall]=useState(null);
  const [animTrail,setAnimTrail]=useState([]);   // Ball-Spur (Komet)
  const [animGoal,setAnimGoal]=useState(null);    // Torjubel-Blitz {x,y}
  const [animSpeed,setAnimSpeed]=useState(1);      // 0.6 langsam / 1 normal / 1.6 schnell
  const [loopAnim,setLoopAnim]=useState(false);
  const [reactDef,setReactDef]=useState(true);     // Verteidiger verschieben zum Ball
  const trailRef=useRef([]);
  const [playing,setPlaying]=useState(false);
  const animRef=useRef(null);
  const t0Ref=useRef(0); const elapsedRef=useRef(0); const stepRef=useRef(null);
  const [paused,setPaused]=useState(false);
  const [boardName,setBoardName]=useState("");
  const skipRebuildRef=useRef(false);
  const myBoards=(data.tacticBoards||[]).filter(b=>b.cid===cl.id);
  const saveBoard=()=>{
    const nm=(boardName.trim()||("Board "+(myBoards.length+1)));
    const b={id:uid(),cid:cl.id,name:nm,sport,count,formIdx,oppFormIdx,showOpp,tokens,oppTokens,arrows,ball:ballPos,createdAt:new Date().toISOString()};
    save({...data,tacticBoards:[...(data.tacticBoards||[]),b]});
    setBoardName(""); fire&&fire("Board gespeichert");
  };
  const loadBoard=(b)=>{
    skipRebuildRef.current=true;
    setSport(b.sport||sport); setCount(b.count||count); setFormIdx(b.formIdx||0); setOppFormIdx(b.oppFormIdx||0);
    setShowOpp(!!b.showOpp); setTokens(b.tokens||[]); setOppTokens(b.oppTokens||[]); setArrows(b.arrows||[]); setBallPos(b.ball||null);
    resetAnim();
    setTimeout(()=>{ skipRebuildRef.current=false; },0);
    fire&&fire("Board geladen");
  };
  const delBoard=(id)=>{ if(typeof window!=="undefined"&&window.confirm&&!window.confirm("Board löschen?"))return; save({...data,tacticBoards:(data.tacticBoards||[]).filter(x=>x.id!==id)}); };
  const curBoard=()=>({sport,count,formIdx,oppFormIdx,showOpp,tokens,oppTokens,arrows,ball:ballPos});
  // Falls dieses Board an einem Termin haengt: beim Oeffnen den gespeicherten Stand laden.
  useEffect(()=>{ if(eventCtx?.board){ loadBoard(eventCtx.board); }   },[]);
  const stopAnim=()=>{ if(animRef.current) cancelAnimationFrame(animRef.current); animRef.current=null; };
  const resetAnim=()=>{ stopAnim(); setPlaying(false); setPaused(false); setAnimOwn(null); setAnimOpp(null); setAnimBall(null); setAnimTrail([]); setAnimGoal(null); trailRef.current=[]; };
  const pauseAnim=()=>{ if(!playing||paused) return; elapsedRef.current=(performance.now()-t0Ref.current)*animSpeed; stopAnim(); setPaused(true); };
  const resumeAnim=()=>{ if(!paused||!stepRef.current) return; setPaused(false); t0Ref.current=performance.now()-elapsedRef.current/animSpeed; animRef.current=requestAnimationFrame(stepRef.current); };
  useEffect(()=>()=>stopAnim(),[]);
  // Tor-Erkennung: Endpunkt im mittleren Drittel und nah an Ober-/Unterkante.
  const isGoalShot=(a)=> (a.x2>F.vw*0.28&&a.x2<F.vw*0.72) && (a.y2<F.vh*0.12||a.y2>F.vh*0.88);
  const playAnim=()=>{
    // Reihenfolge = Zeichen-Reihenfolge der Pfeile -> echte Abfolge:
    // Lauf, dann Pass in den Lauf, dann Abschluss usw.
    const seq=arrows.filter(a=>a.type==="run"||a.type==="pass"||a.type==="dribble");
    if(!seq.length){ fire&&fire("Erst Lauf-/Passwege einzeichnen"); return; }
    resetAnim();
    // Dribbling bewegt Spieler UND Ball zusammen -> zaehlt auch als "Lauf" des Spielers.
    const runs=seq.filter(a=>a.type==="run"||a.type==="dribble");
    const thr=F.r*3.6; const usedRun=new Set();
    const withRun=(list)=>list.map(tk=>{
      let best=null,bd=thr,bi=-1;
      runs.forEach((a,idx)=>{ if(usedRun.has(idx))return; const d=Math.hypot(a.x1-tk.x,a.y1-tk.y); if(d<bd){bd=d;best=a;bi=idx;} });
      if(bi>=0) usedRun.add(bi);
      return {...tk,sx:tk.x,sy:tk.y,run:best};
    });
    const ownA=withRun(tokens);
    const oppA=showOpp?withRun(oppTokens):[];
    // Tempo in SVG-Einheiten/Sekunde: Schuss am schnellsten, Pass schnell, Dribbling langsam.
    const spd=a=>{ if(a.type==="pass")return isGoalShot(a)?900:560; if(a.type==="dribble")return 150; return a.pace===3?330:a.pace===1?150:230; };
    const durOf=a=>{ const d=Math.hypot(a.x2-a.x1,a.y2-a.y1); return Math.max(260,Math.min(2800, d/spd(a)*1000)); };
    // Sequenzieller Zeitplan; Pass direkt nach Lauf = Steckpass in den Lauf (überlappt),
    // dazwischen kurze Ballannahme (Settle), damit jede Aktion lesbar bleibt.
    let tEnd=0; const sched=new Map(); let prevPass=null;
    seq.forEach((a,i)=>{ const d=durOf(a); const prev=seq[i-1]; let start=tEnd;
      // Doppelpass (One-Two): Pass kommt von dort, wo der vorige Pass ankam, und geht
      // wieder zum vorigen Passgeber zurück -> schneller Rückpass (kurzer Kontakt).
      const oneTwo = a.type==="pass" && prevPass && Math.hypot(a.x1-prevPass.x2,a.y1-prevPass.y2)<F.r*3.2 && Math.hypot(a.x2-prevPass.x1,a.y2-prevPass.y1)<F.vw*0.24;
      if(a.par&&prev) start=sched.get(prev).start;   // ∥ laeuft gleichzeitig mit dem Schritt davor
      // Pass nach Lauf: "In den Fuss" wartet, bis der Spieler steht; "Steilpass"
      // startet mitten im Lauf, sodass Ball und Spieler sich treffen.
      else if(a.type==="pass"&&prev&&prev.type==="run") start = a.kind==="steil" ? Math.max(0,tEnd-durOf(prev)*0.55) : tEnd+140;
      else if(oneTwo) start=tEnd+60;      // Doppelpass: direkt klatschen lassen
      else if(i>0) start=tEnd+170;         // Ballannahme/Settle
      const ph={start,end:start+d,dur:d,oneTwo}; sched.set(a,ph); tEnd=Math.max(tEnd,ph.end);
      if(a.type==="pass") prevPass=a;
    });
    const TOTAL=tEnd+700;
    const ballEv=seq.filter(a=>a.type==="pass"||a.type==="dribble");
    const clamp=x=>x<0?0:x>1?1:x;
    const ez=x=>x<.5?2*x*x:1-Math.pow(-2*x+2,2)/2;   // Lauf: weich an/aus
    const ezOut=x=>1-Math.pow(1-x,2);                  // Pass: schnell, dann Ballannahme
    const accel=x=>x*x;                                // Sprint: beschleunigt
    // Spieler folgt der (evtl. gebogenen) Laufkurve; Start-Offset, falls Token nicht
    // exakt am Lauf-Start steht, damit es keinen Sprung gibt.
    const tokAt=(tk,T)=>{ const r=tk.run; if(!r) return {...tk,x:tk.sx,y:tk.sy}; const ph=sched.get(r); const raw=clamp((T-ph.start)/ph.dur); const e=(r.pace===3?accel(raw)*0.5+ez(raw)*0.5:ez(raw)); const p=bezPt(r,e); const off=1-e; return {...tk,x:p.x+(tk.sx-r.x1)*off,y:p.y+(tk.sy-r.y1)*off}; };
    const ballAt=(T)=>{ if(!ballEv.length) return null;
      const first=ballEv[0]; if(T<sched.get(first).start) return {x:first.x1,y:first.y1,rot:0,shot:false};
      let cur=null;
      for(const a of ballEv){ const ph=sched.get(a); if(T>=ph.start&&T<=ph.end){ cur={a,ph,live:true}; break; } if(T>ph.end) cur={a,ph,live:false}; }
      if(!cur) return {x:first.x1,y:first.y1,rot:0,shot:false};
      const len=Math.hypot(cur.a.x2-cur.a.x1,cur.a.y2-cur.a.y1);
      // Hoher Ball/Flanke: langer Pass (kein flacher Torschuss) steigt und fällt.
      const lob=cur.a.type==="pass"&&len>F.vw*0.45&&!isGoalShot(cur.a);
      if(cur.live){ const raw=clamp((T-cur.ph.start)/cur.ph.dur); const e=cur.a.type==="pass"?ezOut(raw):raw; const p=bezPt(cur.a,e); const height=lob?Math.sin(Math.PI*raw)*F.r*1.8:0; return {...p,rot:(cur.ph.start+raw*len)*0.7,shot:cur.a.type==="pass"&&isGoalShot(cur.a),height}; }
      return {x:cur.a.x2,y:cur.a.y2,rot:len*0.7,shot:cur.a.type==="pass"&&isGoalShot(cur.a),height:0};
    };
    // letzter Abschluss aufs Tor?
    const lastShot=[...ballEv].reverse().find(a=>a.type==="pass");
    const goalAt = lastShot&&isGoalShot(lastShot) ? {x:lastShot.x2,y:lastShot.y2,t:sched.get(lastShot).end} : null;
    t0Ref.current=performance.now(); elapsedRef.current=0;
    setPlaying(true); setPaused(false); trailRef.current=[];
    if(ballEv.length) setAnimBall(ballAt(0));
    let goalShown=false;
    const step=(t)=>{ const T=Math.min((t-t0Ref.current)*animSpeed,TOTAL);
      const b = ballEv.length ? ballAt(T) : null;
      // Staendige kleine Bewegung: nichts steht wie angewurzelt auf dem Feld.
      const wob=(tk,amp)=>({dx:Math.sin(T/620+tk.n*2.1)*F.r*amp, dy:Math.cos(T/540+tk.n*3.7)*F.r*amp});
      setAnimOwn(ownA.map(tk=>{ const p=tokAt(tk,T); if(tk.run) return p;
        // Mitspieler ohne eigenen Laufweg ruecken leicht zum Ball auf (Anspielstationen anbieten)
        const w=wob(tk,0.16); let sx=0,sy=0;
        if(b&&tk.n!==1){ const dx=b.x-tk.sx,dy=b.y-tk.sy,dist=Math.hypot(dx,dy)||1; const sh=Math.min(F.vw*0.05,dist*0.2)*Math.min(1,T/1200); sx=dx/dist*sh; sy=dy/dist*sh; }
        return {...p,x:p.x+w.dx+sx,y:p.y+w.dy+sy};
      }));
      if(showOpp){
        const pr=Math.min(1,T/(TOTAL*0.35));   // Press-Intensität rampt hoch
        // Jugendfussball: alle orientieren sich zum Ball, die zwei Naechsten gehen
        // richtig drauf – mit kleiner Reaktionszeit (sie laufen dahin, wo der Ball WAR).
        const db=b&&trailRef.current.length>5?trailRef.current[trailRef.current.length-6]:b;
        let order=[];
        if(reactDef&&db) order=oppA.filter(tk=>!tk.run&&tk.n!==1).map(tk=>({id:tk.id,d:Math.hypot(db.x-tk.sx,db.y-tk.sy)})).sort((x,y)=>x.d-y.d).map(x=>x.id);
        setAnimOpp(oppA.map(tk=>{
          if(tk.run) return tokAt(tk,T);
          const w=wob(tk,0.28);
          if(reactDef&&db&&tk.n!==1){
            const rank=order.indexOf(tk.id);
            const press=pr*(rank===0?0.95:rank===1?0.62:0.3);
            const dx=db.x-tk.sx,dy=db.y-tk.sy,dist=Math.hypot(dx,dy)||1;
            const shift=Math.min(F.vw*(rank<=1?0.19:0.12),dist*0.5)*press;
            return {...tk,x:tk.sx+dx/dist*shift+w.dx,y:tk.sy+dy/dist*shift+w.dy};
          }
          return {...tk,x:tk.sx+w.dx,y:tk.sy+w.dy};
        }));
      }
      if(b){ setAnimBall(b); const tr=trailRef.current; tr.push({x:b.x,y:b.y}); if(tr.length>10) tr.shift(); setAnimTrail(tr.slice()); }
      if(goalAt&&!goalShown&&T>=goalAt.t-30){ goalShown=true; setAnimGoal({x:goalAt.x,y:goalAt.y}); }
      if((t-t0Ref.current)*animSpeed<TOTAL){ animRef.current=requestAnimationFrame(step); }
      else { setPlaying(false); animRef.current=null; if(loopAnim) setTimeout(()=>playAnim(),650); }
    };
    stepRef.current=step;
    animRef.current=requestAnimationFrame(step);
  };

  // Gebogene Pfeile/Wege (Pass-Bogen, Bogenlauf) – gerendert UND animiert auf
  // derselben Kurve, damit gezeichneter Weg und Bewegung übereinstimmen.
  const arrCtrl=(a)=>{ const mx=(a.x1+a.x2)/2,my=(a.y1+a.y2)/2,dx=a.x2-a.x1,dy=a.y2-a.y1,len=Math.hypot(dx,dy)||1;
    const minF=a.type==="pass"?0.22:0.34, maxF=a.type==="pass"?0.09:0.05;
    if((a.type!=="pass"&&a.type!=="run")||len<F.vw*minF) return {cx:mx,cy:my};
    const nx=-dy/len,ny=dx/len,sign=(Math.round(a.x1+a.y1)%2===0)?1:-1,amt=Math.min(len*0.13,F.vw*maxF)*sign;
    return {cx:mx+nx*amt,cy:my+ny*amt}; };
  const arrPath=(a)=>{ const c=arrCtrl(a); return `M ${a.x1} ${a.y1} Q ${c.cx} ${c.cy} ${a.x2} ${a.y2}`; };
  const bezPt=(a,e)=>{ const c=arrCtrl(a),u=1-e; return { x:u*u*a.x1+2*u*e*c.cx+e*e*a.x2, y:u*u*a.y1+2*u*e*c.cy+e*e*a.y2 }; };

  const svgRef=useRef(null); const dragRef=useRef(null);
  // Szene als Bild teilen/speichern (Standbild der aktuellen Tafel inkl. Wege).
  // Ein echtes Animations-Video ist im Browser (v.a. iOS) nicht zuverlässig möglich.
  const shareScene=async()=>{
    const svg=svgRef.current; if(!svg) return;
    try{
      const clone=svg.cloneNode(true);
      clone.setAttribute("width",F.vw); clone.setAttribute("height",F.vh);
      clone.setAttribute("xmlns","http://www.w3.org/2000/svg");
      const xml=new XMLSerializer().serializeToString(clone);
      const src="data:image/svg+xml;base64,"+btoa(unescape(encodeURIComponent(xml)));
      const img=new Image();
      img.onload=()=>{
        const sc=2; const c=document.createElement("canvas"); c.width=F.vw*sc; c.height=F.vh*sc;
        const ctx=c.getContext("2d"); ctx.fillStyle="#0b3d20"; ctx.fillRect(0,0,c.width,c.height);
        ctx.drawImage(img,0,0,c.width,c.height);
        c.toBlob(async(blob)=>{ if(!blob){ fire&&fire("Teilen nicht möglich"); return; }
          const file=new File([blob],"taktik.png",{type:"image/png"});
          if(navigator.canShare&&navigator.canShare({files:[file]})){ try{ await navigator.share({files:[file],title:"Taktik-Szene"}); return; }catch{} }
          const url=URL.createObjectURL(blob); const a=document.createElement("a"); a.href=url; a.download="taktik-szene.png"; a.click(); setTimeout(()=>URL.revokeObjectURL(url),4000);
          fire&&fire("Bild gespeichert");
        },"image/png");
      };
      img.onerror=()=>fire&&fire("Teilen nicht möglich");
      img.src=src;
    }catch{ fire&&fire("Teilen nicht möglich"); }
  };
  const [mode,setMode]=useState("move");
  const [runPace,setRunPace]=useState(2);   // Tempo fuer neue Laufwege: 1 locker / 2 zuegig / 3 Sprint
  const [passKind,setPassKind]=useState("fuss");   // "fuss" = in den Fuss, "steil" = Steilpass in den Lauf
  const [arrows,setArrows]=useState([]);
  const [draw,setDraw0]=useState(null); const drawRef=useRef(null);
  const setDraw=(v)=>{ const nv=typeof v==="function"?v(drawRef.current):v; drawRef.current=nv; setDraw0(nv); };
  const PACE_COL={1:"#22c55e",2:"#f59e0b",3:"#ef4444"};
  const runArrowCol=a=>PACE_COL[a.pace]||"#ffffff";
  const ARR_COL={run:"#ffffff",pass:"#fb923c",dribble:"#22d3ee"};
  const toSvg=(e)=>{ const el=svgRef.current; if(!el) return null; const r=el.getBoundingClientRect(); const cx=(e.touches?e.touches[0].clientX:e.clientX); const cy=(e.touches?e.touches[0].clientY:e.clientY); return { x:(cx-r.left)/r.width*F.vw, y:(cy-r.top)/r.height*F.vh }; };
  // Wo liegt der Ball nach den bisher gezeichneten Schritten?
  const curBallSpot=()=>{ const seq=arrows.filter(a=>a.type==="pass"||a.type==="dribble"); if(seq.length){ const l=seq[seq.length-1]; return {x:l.x2,y:l.y2}; } return ballPos; };
  const startDraw=(e)=>{ if(mode==="focus"){ setFocusId(null); return; } if(mode==="move"||mode==="mark") return; resetAnim(); const p=toSvg(e); if(!p) return; if(e.preventDefault)e.preventDefault();
    let x1=p.x,y1=p.y;
    if(mode==="pass"||mode==="dribble"){
      // Pass & Dribbling starten immer am Ball: hat ihn ein Spieler am Fuss, geht es
      // von dort weiter. Gibt es noch keinen Ball, wird er am Startpunkt hingelegt.
      const bp=curBallSpot();
      if(bp){ x1=bp.x; y1=bp.y; } else setBallPos({x:p.x,y:p.y});
    }
    setDraw({type:mode,x1,y1,x2:p.x,y2:p.y,...(mode==="run"?{pace:runPace}:{}),...(mode==="pass"?{kind:passKind}:{})}); };
  const toggleMark=(setT,id)=>{ resetAnim(); setT(ts=>ts.map(x=>x.id===id?{...x,marked:!x.marked}:x)); };
  const onMove=(e)=>{ const p=toSvg(e); if(!p) return; if(mode==="move"){ if(dragRef.current==null) return; if(dragRef.current==="ball"){ const R=F.r*0.6; setBallPos({x:Math.max(R,Math.min(F.vw-R,p.x)),y:Math.max(R,Math.min(F.vh-R,p.y))}); return; } const R=F.r; const setT=dragSetRef.current==="opp"?setOppTokens:setTokens; setT(ts=>ts.map(tk=>tk.id===dragRef.current?{...tk,x:Math.max(R,Math.min(F.vw-R,p.x)),y:Math.max(R,Math.min(F.vh-R,p.y))}:tk)); } else { if(!drawRef.current) return; setDraw(d=>d?{...d,x2:p.x,y2:p.y}:d); } };
  const endDrag=()=>{ if(mode==="move"){ dragRef.current=null; return; } const d=drawRef.current; if(d){ const len=Math.hypot(d.x2-d.x1,d.y2-d.y1); if(len>F.vw*0.04) setArrows(a=>[...a,{...d,par:false,id:"ar"+Date.now()+Math.round(Math.random()*999)}]); } setDraw(null); };

  // ---- Ablauf-Liste: Beschriftung, Loeschen, Umsortieren, Parallel-Schalter ----
  const nearTok=(x,y)=>{ let best=null,bd=1e9;
    tokens.forEach(tk=>{ const d=Math.hypot(tk.x-x,tk.y-y); if(d<bd){bd=d;best={...tk,side:"own"};} });
    if(showOpp) oppTokens.forEach(tk=>{ const d=Math.hypot(tk.x-x,tk.y-y); if(d<bd){bd=d;best={...tk,side:"opp"};} });
    return bd<F.r*3.5?best:null;
  };
  const stepLabel=(a)=>{
    const s=nearTok(a.x1,a.y1), z=nearTok(a.x2,a.y2);
    const nm=tk=>tk?`${tk.side==="opp"?"Gegner ":""}Nr. ${tk.n}`:"";
    if(a.type==="run") return `🏃 Lauf ${nm(s)} ${a.pace===3?"· Sprint":a.pace===1?"· locker":""}`.replace(/\s+/g," ").trim();
    if(a.type==="dribble") return `⚽💨 Dribbling ${nm(s)}`.trim();
    if(isGoalShot(a)) return `🥅 Schuss aufs Tor ${nm(s)}`.trim();
    return `${a.kind==="steil"?"🚀 Steilpass":"🦶 Pass in den Fuß"} ${nm(s)}${z&&z.id!==s?.id?` → ${nm(z)}`:""}`.trim();
  };
  const delStep=(id)=>{ resetAnim(); setArrows(a=>a.filter(x=>x.id!==id)); };
  const moveStep=(i,dir)=>{ resetAnim(); setArrows(a=>{ const j=i+dir; if(j<0||j>=a.length) return a; const n=a.slice(); [n[i],n[j]]=[n[j],n[i]]; return n; }); };
  const togglePar=(id)=>{ resetAnim(); setArrows(a=>a.map(x=>x.id===id?{...x,par:!x.par}:x)); };

  // ---- KI-Assistent (eingebaute Spiellogik, laeuft komplett offline) ----
  // Spielstand nach den bisherigen Schritten: wo ist der Ball, wo steht wer?
  const simState=(arrs)=>{
    const after=(list)=>list.map(tk=>{ let x=tk.x,y=tk.y;
      arrs.forEach(a=>{ if(a.type!=="run"&&a.type!=="dribble") return; if(Math.hypot(a.x1-x,a.y1-y)<F.r*2.2){ x=a.x2; y=a.y2; } });
      return {...tk,x,y}; });
    const own=after(tokens), opp=showOpp?after(oppTokens):[];
    const ballSeq=arrs.filter(a=>a.type==="pass"||a.type==="dribble");
    let bx,by;
    if(ballSeq.length){ const l=ballSeq[ballSeq.length-1]; bx=l.x2; by=l.y2; }
    else if(ballPos){ bx=ballPos.x; by=ballPos.y; }
    else { const deep=own.filter(o=>o.n!==1).sort((a,b)=>b.y-a.y)[0]||own[0]; bx=deep?.x??F.vw/2; by=deep?.y??F.vh/2; }
    return {own,opp,bx,by};
  };
  // Wie frei ist eine Passlinie? (Abstand des naechsten Gegners zur Linie)
  const laneFree=(x1,y1,x2,y2,opp)=>{ if(!opp.length) return 9;
    let m=9; opp.forEach(o=>{ const dx=x2-x1,dy=y2-y1,L=dx*dx+dy*dy||1;
      let u=((o.x-x1)*dx+(o.y-y1)*dy)/L; u=Math.max(0,Math.min(1,u));
      const d=Math.hypot(o.x-(x1+dx*u),o.y-(y1+dy*u)); if(d<m)m=d; });
    return m; };
  const suggestOne=(arrs,wantType)=>{
    const {own,opp,bx,by}=simState(arrs);
    const carrier=own.reduce((b,tk)=>{ const d=Math.hypot(tk.x-bx,tk.y-by); return d<b.d?{d,tk}:b; },{d:1e9,tk:null}).tk;
    const mates=own.filter(tk=>tk.n!==1&&tk.id!==carrier?.id);
    // Nah am Tor -> Abschluss!
    if((!wantType||wantType==="pass")&&by<F.vh*0.32)
      return { a:{type:"pass",x1:bx,y1:by,x2:F.vw/2,y2:F.vh*0.012,par:false}, hint:`Nr. ${carrier?.n??"?"} ist frei vor dem Tor – Schuss! 🥅` };
    if(wantType==="run"||wantType==="dribble"){
      // Lauf/Dribbling in den freiesten Raum Richtung gegnerisches Tor
      const who=wantType==="dribble"?carrier:(mates.sort((a,b)=>a.y-b.y)[0]||carrier);
      if(!who) return null;
      const cands=[]; for(let ang=-60;ang<=60;ang+=30){ const rad=(ang-90)*Math.PI/180; const len=F.vh*0.18;
        const x2=Math.max(F.r,Math.min(F.vw-F.r,who.x+Math.cos(rad)*len)), y2=Math.max(F.r,Math.min(F.vh-F.r,who.y+Math.sin(rad)*len));
        const nearOpp=opp.length?Math.min(...opp.map(o=>Math.hypot(o.x-x2,o.y-y2))):9;
        cands.push({x2,y2,s:nearOpp-(y2/F.vh)*3}); }
      const c=cands.sort((a,b)=>b.s-a.s)[0];
      return { a:{type:wantType,x1:who.x,y1:who.y,x2:c.x2,y2:c.y2,par:false,...(wantType==="run"?{pace:2}:{})},
        hint:wantType==="dribble"?`Nr. ${who.n} dribbelt in den freien Raum! ⚽💨`:`Nr. ${who.n} läuft sich frei – Richtung Tor! 🏃` };
    }
    // Standard: bester Pass = freie Linie + freier Mitspieler + Raumgewinn nach vorn
    const scored=mates.map(tk=>{ const dist=Math.hypot(tk.x-bx,tk.y-by);
      if(dist<F.vw*0.1||dist>F.vh*0.55) return {tk,s:-1e9};
      const free=laneFree(bx,by,tk.x,tk.y,opp);
      const openness=opp.length?Math.min(...opp.map(o=>Math.hypot(o.x-tk.x,o.y-tk.y))):6;
      const forward=(by-tk.y);
      return {tk,s:free*2.2+openness*1.4+forward*0.9}; }).sort((a,b)=>b.s-a.s);
    const best=scored[0]; if(!best||best.s<=-1e9) return null;
    return { a:{type:"pass",kind:"fuss",x1:bx,y1:by,x2:best.tk.x,y2:best.tk.y,par:false},
      hint:`Nr. ${best.tk.n} steht frei – Pass in den Fuß! 🦶` };
  };
  const aiSuggest=()=>{
    const wantType=(mode==="run"||mode==="dribble"||mode==="pass")?mode:undefined;
    const s=suggestOne(arrows,wantType);
    if(!s){ setAiHint("Mir fällt gerade nichts ein – verschiebe die Spieler ein bisschen!"); return; }
    resetAnim(); setArrows(a=>[...a,{...s.a,id:"ar"+Date.now()+Math.round(Math.random()*999)}]); setAiHint(s.hint);
  };
  const aiPlay=()=>{
    // Ganzer Spielzug: Pass-Stationen, parallel dazu Freilaeufe, bis zum Abschluss.
    resetAnim();
    let arrs=arrows.slice(); const added=[]; let guard=0;
    while(guard++<7){
      const s=suggestOne(arrs); if(!s) break;
      const na={...s.a,id:"ar"+Date.now()+guard+Math.round(Math.random()*999)};
      arrs=[...arrs,na]; added.push(na);
      if(na.type==="pass"&&isGoalShot(na)) break;
      if(added.length===1||added.length===3){ const r=suggestOne(arrs,"run");
        if(r){ const ra={...r.a,id:"arp"+Date.now()+guard,par:true}; arrs=[...arrs,ra]; added.push(ra); } }
    }
    if(!added.length){ setAiHint("Kein Vorschlag möglich – stell die Spieler neu auf!"); return; }
    setArrows(arrs); setAiHint(`Fertiger Spielzug mit ${added.length} Schritten – tippe auf ▶ Abspielen!`);
  };

  // Steuerkreuz: gewaehlten Spieler schrittweise bewegen (Halten = Dauerlauf)
  const padMove=(dx,dy)=>{ const s=selTok; if(!s) return;
    const setT=s.side==="opp"?setOppTokens:setTokens; const st=F.vw*0.035;
    setT(ts=>ts.map(tk=>tk.id===s.id?{...tk,x:Math.max(F.r,Math.min(F.vw-F.r,tk.x+dx*st)),y:Math.max(F.r,Math.min(F.vh-F.r,tk.y+dy*st))}:tk)); };
  const padStart=(dx,dy)=>{ resetAnim(); padMove(dx,dy); padStop(); padHold.current=setInterval(()=>padMove(dx,dy),120); };
  const padStar=()=>{ const s=selTok; if(!s) return; toggleMark(s.side==="opp"?setOppTokens:setTokens,s.id); };
  const selInfo=()=>{ const s=selTok; if(!s) return null;
    const tk=(s.side==="opp"?oppTokens:tokens).find(x=>x.id===s.id); return tk?{...tk,side:s.side}:null; };

  // ---- Szenario-Spiel: Situationen lesen, reagieren, Verstaerkung rufen ----
  const [scn,setScn]=useState(null);
  const scnRef=useRef(null); useEffect(()=>{ scnRef.current=scn; },[scn]);
  const tokensRef=useRef(tokens); useEffect(()=>{ tokensRef.current=tokens; },[tokens]);
  const [scnTick,setScnTick]=useState(0);
  const runRef=useRef(null);
  const stopRun=()=>{ if(runRef.current){ cancelAnimationFrame(runRef.current); runRef.current=null; } };
  useEffect(()=>()=>stopRun(),[]);
  const zoneCount=(own,opp,bx,by,R)=>({o:own.filter(t2=>t2.n!==1&&Math.hypot(t2.x-bx,t2.y-by)<R).length, g:opp.filter(t2=>t2.n!==1&&Math.hypot(t2.x-bx,t2.y-by)<R).length});
  const freestOpp=(own,opp)=>{ let best=null,bd=-1; opp.forEach(o=>{ if(o.n===1)return; const d=Math.min(...own.map(t2=>Math.hypot(t2.x-o.x,t2.y-o.y))); if(d>bd){bd=d;best=o;} }); return {opp:best,dist:bd}; };
  const scnResolve=(good,fb,extra)=>{
    setScn(s=>s?{...s,phase:"resolve",feedback:fb,score:s.score+(good?1:0),history:[...s.history,{round:s.round,type:s.type,good,...(extra||{})}]}:s);
  };
  // Naechste Situation: der Gegner spielt den Ball zum freiesten Mann -> daraus
  // entsteht die neue Lage, die Abwehr schiebt nach, dann kommt die Aufgabe.
  const scnNext=(prev)=>{
    stopRun(); resetAnim(); setMode("move");
    const own=tokens, opp=oppTokens;
    const {opp:free}=freestOpp(own,opp);
    const bx=free?Math.max(F.r*2,Math.min(F.vw-F.r*2,free.x+(free.x>F.vw/2?-F.r*1.6:F.r*1.6))):F.vw/2;
    const by=free?free.y:F.vh/2;
    setBallPos({x:bx,y:by});
    setOppTokens(ts=>ts.map(tk=>{ if(tk.n===1) return tk; const dx=bx-tk.x,dy=by-tk.y,d=Math.hypot(dx,dy)||1; const sh=Math.min(F.vw*0.06,d*0.18); return {...tk,x:Math.max(F.r,Math.min(F.vw-F.r,tk.x+dx/d*sh)),y:Math.max(F.r,Math.min(F.vh-F.r,tk.y+dy/d*sh))}; }));
    const round=(prev?.round||0)+1;
    const type=["cover","reinforce","space"][(round-1)%3];
    let actor=null,target=null,text="";
    if(type==="cover"){
      const tgt=free||opp.find(o=>o.n!==1);
      const sorted=own.filter(t2=>t2.n!==1).sort((a,b)=>Math.hypot(a.x-tgt.x,a.y-tgt.y)-Math.hypot(b.x-tgt.x,b.y-tgt.y));
      actor=sorted[1]||sorted[0];
      target={kind:"opp",id:tgt.id};
      text=`🔵 Nr. ${actor.n}: Rüber zu 🔴 Nr. ${tgt.n} – decken! Er steht ganz frei!`;
    } else if(type==="space"){
      const fld=own.filter(t2=>t2.n!==1);
      actor=fld[Math.floor(round*2.7)%fld.length]||fld[0];
      const cands=[]; for(let gx=0.2;gx<=0.8;gx+=0.2) for(let gy=0.15;gy<=0.6;gy+=0.15){ const x=gx*F.vw,y=gy*F.vh; const d=Math.min(...opp.map(o=>Math.hypot(o.x-x,o.y-y))); cands.push({x,y,d}); }
      const c=cands.sort((a,b)=>b.d-a.d)[0];
      target={kind:"pos",x:c.x,y:c.y};
      text=`🔵 Nr. ${actor.n}: Lauf in den gelben Kreis – da ist Platz zum Anspielen!`;
    } else {
      const zc=zoneCount(own,opp,bx,by,F.vw*0.24);
      text=`Der Ball ist bei 🔴 Nr. ${free?.n??"?"}. Am Ball: ${zc.g} Rote gegen ${zc.o} Blaue. Rufst du Verstärkung?`;
    }
    if(actor){ setTokens(ts=>ts.map(t2=>({...t2,marked:t2.id===actor.id}))); setSelTok({side:"own",id:actor.id}); }
    setScn({round,score:prev?.score||0,history:prev?.history||[],phase:"task",type,actorId:actor?.id||null,target,text,deadline:Date.now()+12000,feedback:null});
  };
  // Erfolg pruefen bei jeder Bewegung (Drag oder Steuerkreuz)
  useEffect(()=>{ const s=scn; if(!s||s.phase!=="task") return;
    if(s.type==="cover"){ const a=tokens.find(t2=>t2.id===s.actorId), g=oppTokens.find(o=>o.id===s.target?.id);
      if(a&&g&&Math.hypot(a.x-g.x,a.y-g.y)<F.r*2.6) scnResolve(true,`Super! 🔴 Nr. ${g.n} ist zugestellt – kein freier Passweg mehr. ✅`);
    } else if(s.type==="space"){ const a=tokens.find(t2=>t2.id===s.actorId);
      if(a&&s.target&&Math.hypot(a.x-s.target.x,a.y-s.target.y)<F.r*2.2) scnResolve(true,"Stark! Frei angeboten – jetzt bist du anspielbar. ✅");
    }
  },[tokens,oppTokens]);
  // Zeitlimit (nur fuer Bewegungs-Aufgaben; die Verstaerkungs-Frage darf man in Ruhe ueberlegen)
  useEffect(()=>{ const s=scn; if(!s||s.phase!=="task"||s.type==="reinforce") return;
    const ms=s.deadline-Date.now(); if(ms<=0) return;
    const to=setTimeout(()=>{ const c=scnRef.current; if(c&&c.phase==="task"&&c.round===s.round) scnResolve(false,"⏱ Zeit um! Auf dem Platz musst du sofort reagieren – nächste Chance kommt."); },ms);
    return ()=>clearTimeout(to);
  },[scn?.round,scn?.phase]);
  useEffect(()=>{ if(!scn||scn.phase!=="task") return; const iv=setInterval(()=>setScnTick(t=>t+1),500); return ()=>clearInterval(iv); },[scn?.round,scn?.phase]);
  // Verstaerkungs-Entscheidung: Ja -> naechster freier Spieler sprintet zeitrealistisch hin,
  // danach ehrliche Analyse (Ueberzahl geholt? Wer ist dafuer frei geworden?)
  const scnAnswer=(call)=>{
    const s=scn; if(!s||s.phase!=="task") return;
    const own=tokens, opp=oppTokens, b=ballPos||{x:F.vw/2,y:F.vh/2};
    const R=F.vw*0.24, before=zoneCount(own,opp,b.x,b.y,R);
    const under=before.g>before.o;
    if(!call){
      scnResolve(!under, !under
        ?`Richtig! ${before.o} gegen ${before.g} am Ball – ihr habt es im Griff. Stellung halten spart Kraft. ✅`
        :`Riskant! ${before.g} Rote gegen ${before.o} Blaue – da wäre Verstärkung gut gewesen. ⚠️`, {called:false});
      return;
    }
    const cands=own.filter(t2=>t2.n!==1&&Math.hypot(t2.x-b.x,t2.y-b.y)>R);
    if(!cands.length){ scnResolve(true,"Alle Blauen sind schon am Ball – mehr geht nicht! ✅",{called:true}); return; }
    const helper=cands.sort((a,c)=>Math.hypot(a.x-b.x,a.y-b.y)-Math.hypot(c.x-b.x,c.y-b.y))[0];
    const from={x:helper.x,y:helper.y};
    const to={x:Math.max(F.r,Math.min(F.vw-F.r,b.x+(helper.x>b.x?F.r*2:-F.r*2))), y:Math.max(F.r,Math.min(F.vh-F.r,b.y+F.r*1.5))};
    const dist=Math.hypot(to.x-from.x,to.y-from.y);
    const dur=Math.max(900,Math.min(6000, dist/(F.vh*0.10)*1000));   // Sprint: ~10% Feldlaenge pro Sekunde
    setScn(x=>x?{...x,phase:"running",text:`📣 Nr. ${helper.n} sprintet zur Verstärkung… (${(dur/1000).toFixed(1)} s – so lange dauert das wirklich!)`}:x);
    const t0=performance.now();
    const step=(t)=>{ const e=Math.min(1,(t-t0)/dur); const ease=e<.5?2*e*e:1-Math.pow(-2*e+2,2)/2;
      setTokens(ts=>ts.map(tk=>tk.id===helper.id?{...tk,x:from.x+(to.x-from.x)*ease,y:from.y+(to.y-from.y)*ease}:tk));
      if(e<1){ runRef.current=requestAnimationFrame(step); return; }
      runRef.current=null;
      // Endposition des Helfers fest einrechnen (State-Updates koennen einen Frame nachlaufen)
      const own2=tokensRef.current.map(tk=>tk.id===helper.id?{...tk,x:to.x,y:to.y}:tk);
      const after=zoneCount(own2,opp,b.x,b.y,R);
      const {opp:fo,dist:fd}=freestOpp(own2,opp);
      const good=after.o>=after.g;
      const risk=fo&&fd>F.vw*0.3;
      scnResolve(good,(good
        ?`✅ Jetzt ${after.o} gegen ${after.g} am Ball – Überzahl geholt!`
        :`⚠️ Immer noch ${after.g} gegen ${after.o} – die Verstärkung hat nicht gereicht.`)
        +(risk?` Aber Achtung: 🔴 Nr. ${fo.n} steht jetzt ganz frei – das ist der Preis fürs Verschieben!`:" Und hinten wurde niemand richtig frei – gute Entscheidung!"),
        {called:true,helper:helper.n,freed:risk?fo.n:null});
    };
    runRef.current=requestAnimationFrame(step);
  };
  const scnEnd=()=>{
    const s=scn; stopRun(); setScn(null);
    setTokens(ts=>ts.map(t2=>({...t2,marked:false})));
    if(!s||!s.history.length) return;
    const rec={id:uid(),cid:cl.id,pid:playerCtx?.pid||null,name:playerCtx?.name||"Trainer",ts:new Date().toISOString(),score:s.score,rounds:s.history.length,decisions:s.history};
    save({...data,tacticSessions:[...(data.tacticSessions||[]),rec]});
    fire&&fire(`Szenario beendet: ${s.score} ⭐ – Ergebnis gespeichert`);
  };

  // "Leben": kleine Pendel-Bewegung fuer alle; Gegner ruecken zum freien Ball (der Naechste presst).
  const liveOff=(tk,side)=>{ if(!liveOn||playing||!liveT) return null;
    const amp=side==="opp"?0.3:0.2;
    let dx=Math.sin(liveT/700+tk.n*2.3+(side==="opp"?1.7:0))*F.r*amp;
    let dy=Math.cos(liveT/560+tk.n*3.1)*F.r*amp;
    if(side==="opp"&&ballPos&&tk.n!==1){ const bdx=ballPos.x-tk.x,bdy=ballPos.y-tk.y,d=Math.hypot(bdx,bdy)||1;
      const lean=Math.min(F.vw*0.08,d*0.35); dx+=bdx/d*lean; dy+=bdy/d*lean; }
    return {dx,dy}; };

  const chSport=(sp)=>{ const FF=TB_FIELDS[sp]||TB_FIELDS.generic; const c=FF.counts.includes(11)?11:FF.counts[0]; setSport(sp); setCount(c); setFormIdx(0); setArrows([]); setDraw(null); setBallPos(b=>b?{x:FF.vw/2,y:FF.vh/2}:null); };
  // Werkzeuge – im Board als Kachel-Grid, im Vorfuehr-Modus als Controller-Tasten.
  // Stern-Markierung laeuft ueber die Mitte des Steuerkreuzes (kein eigenes Werkzeug mehr).
  const TOOLS=[
    {id:"move",e:"🖐",l:"Bewegen",c:"#2563eb"},
    {id:"run",e:"🏃",l:"Laufen",c:"#16a34a"},
    {id:"dribble",e:"⚽💨",l:"Dribbeln",c:"#0891b2"},
    {id:"pass",e:"🎯",l:"Pass",c:"#ea580c"},
    {id:"focus",e:"🔦",l:"Fokus",c:"#7c3aed"},
  ];
  // Steuerkreuz-Bedienfeld (Chip mit gewaehltem Spieler + 3x3-Tastenfeld)
  const padUI=(cell=46)=>{ const si=selInfo(); return (
    <div style={{display:"flex",flexDirection:"column",alignItems:"center",gap:5}}>
      <div style={{background:"rgba(15,23,42,.78)",color:"#fff",borderRadius:99,padding:"4px 11px",fontSize:11.5,fontWeight:800,whiteSpace:"nowrap"}}>
        {si?`🎮 ${si.side==="opp"?"🔴":"🔵"} Nr. ${si.n}`:"🎮 Spieler antippen"}
      </div>
      <div style={{display:"grid",gridTemplateColumns:`repeat(3,${cell}px)`,gridTemplateRows:`repeat(3,${cell}px)`,gap:4}}>
        {[null,["▲",0,-1],null,["◀",-1,0],["⭐","star"],["▶",1,0],null,["▼",0,1],null].map((b,i)=>
          b? <button key={i}
               onPointerDown={(e)=>{ e.preventDefault(); b[1]==="star"?padStar():padStart(b[1],b[2]); }}
               onPointerUp={padStop} onPointerLeave={padStop} onPointerCancel={padStop} onTouchEnd={padStop}
               style={{borderRadius:13,border:"none",background:b[1]==="star"?"rgba(202,138,4,.85)":"rgba(15,23,42,.72)",color:"#fff",fontSize:17,fontWeight:900,cursor:"pointer",touchAction:"none",fontFamily:"inherit",opacity:si?1:0.45}}>{b[0]}</button>
           : <span key={i}/>)}
      </div>
    </div>
  ); };
  const Btn=({active,onClick,children})=>(
    <button onClick={onClick} style={{padding:"7px 12px",borderRadius:9,border:active?`1.5px solid ${t.p}`:"1.5px solid #e2e8f0",background:active?t.p:"#fff",color:active?"#fff":"#475569",fontWeight:700,fontSize:12.5,cursor:"pointer",fontFamily:"inherit",whiteSpace:"nowrap"}}>{children}</button>
  );

  return (
    <div style={{display:"flex",flexDirection:"column",gap:12}}>
      <div style={{display:"flex",alignItems:"flex-start",justifyContent:"space-between",gap:10}}>
        <div style={{minWidth:0}}>
          <h3 style={{margin:"0 0 2px",fontSize:17,fontWeight:900,color:"#0f172a"}}>Taktikboard</h3>
          <p style={{fontSize:12.5,color:"#64748b",margin:0}}>{kidMode?"Werkzeug antippen, auf dem Feld ziehen, ▶ drücken – fertig!":"Feld & Aufstellung – Abläufe zeichnen, sortieren und animieren."}</p>
        </div>
        {!playerCtx&&<button onClick={()=>setKid(!kidMode)}
          style={{flexShrink:0,padding:"8px 13px",borderRadius:99,border:`2px solid ${kidMode?"#f59e0b":"#e2e8f0"}`,background:kidMode?"#fffbeb":"#fff",color:kidMode?"#b45309":"#475569",fontWeight:800,fontSize:12.5,cursor:"pointer",fontFamily:"inherit",whiteSpace:"nowrap"}}>
          {kidMode?"🧒 Einfach":"👔 Profi"}
        </button>}
      </div>
      <button onClick={()=>{setPresent(true);setMode("move");}}
        style={{width:"100%",padding:kidMode?"14px":"12px",borderRadius:13,border:"none",background:"#0f172a",color:"#fff",fontWeight:800,fontSize:kidMode?16:14,cursor:"pointer",fontFamily:"inherit"}}>
        🎬 Vorführen – Vollbild nur zum Zeigen
      </button>
      {!kidMode&&<>
      {(()=>{ const clSport=sportMap[cl?.sport]||"football"; const shown=TB_SPORTS.filter(s=>s.id===clSport||s.id==="generic"); return shown.length>1?(
      <div style={{display:"flex",gap:6,flexWrap:"wrap"}}>
        {shown.map(s=><Btn key={s.id} active={sport===s.id} onClick={()=>chSport(s.id)}>{s.label}</Btn>)}
      </div>
      ):null; })()}
      {F.counts.length>1&&(
        <div style={{display:"flex",gap:6,flexWrap:"wrap",alignItems:"center"}}>
          <span style={{fontSize:11,fontWeight:800,color:"#64748b",marginRight:2}}>SPIELER</span>
          {F.counts.map(c=><Btn key={c} active={count===c} onClick={()=>{setCount(c);setFormIdx(0);}}>{c}er</Btn>)}
        </div>
      )}
      <div style={{display:"flex",gap:6,flexWrap:"wrap",alignItems:"center"}}>
        <span style={{fontSize:11,fontWeight:800,color:"#64748b",marginRight:2}}>SYSTEM</span>
        {forms.map((f,i)=><Btn key={f.name} active={formIdx===i} onClick={()=>setFormIdx(i)}>{f.name}</Btn>)}
      </div>
      {forms[formIdx]?.desc&&(
        <div style={{background:"#f8fafc",border:"1px solid #e2e8f0",borderRadius:11,padding:"10px 13px",fontSize:12.5,color:"#475569",lineHeight:1.55}}>
          <b style={{color:"#0f172a"}}>{forms[formIdx].name}</b> – {forms[formIdx].desc}
          {FORMATION_MOVE[forms[formIdx].name]&&<div style={{marginTop:6,paddingTop:6,borderTop:"1px dashed #e2e8f0"}}><b style={{color:"#0f172a"}}>↔ Bewegung:</b> {FORMATION_MOVE[forms[formIdx].name]}</div>}
        </div>
      )}
      </>}
      {/* Auf dem Feld: Gegner, Ball, Leben (staendige Bewegung) */}
      <div style={{display:"flex",gap:8,flexWrap:"wrap"}}>
        {[
          {on:showOpp,click:()=>setShowOpp(s=>!s),e:"🔴",l:"Gegner",c:"#dc2626"},
          {on:!!ballPos,click:toggleBall,e:"⚽",l:"Ball",c:"#0f172a"},
          {on:liveOn,click:()=>setLiveOn(v=>!v),e:"💓",l:"Leben",c:"#16a34a"},
          {on:padOn,click:()=>setPadOn(v=>!v),e:"🎮",l:"Steuerkreuz",c:"#7c3aed"},
        ].map(o=>(
          <button key={o.l} onClick={o.click}
            style={{flex:1,minWidth:90,padding:kidMode?"11px 8px":"9px 8px",borderRadius:12,border:`2px solid ${o.on?o.c:"#e2e8f0"}`,background:o.on?o.c+"14":"#fff",color:o.on?o.c:"#64748b",fontWeight:800,fontSize:kidMode?14.5:12.5,cursor:"pointer",fontFamily:"inherit",whiteSpace:"nowrap"}}>
            {o.e} {o.l} {o.on?"An":"Aus"}
          </button>
        ))}
      </div>
      {!kidMode&&showOpp&&(
        <div style={{display:"flex",gap:6,flexWrap:"wrap",alignItems:"center"}}>
          <span style={{fontSize:11,fontWeight:800,color:"#64748b",marginRight:2}}>GEGNER-SYSTEM</span>
          {forms.map((f,i)=><Btn key={"o"+f.name} active={oppFormIdx===i} onClick={()=>setOppFormIdx(i)}>{f.name}</Btn>)}
        </div>
      )}
      {/* Werkzeuge: ein Tipp = ein Werkzeug, gross und farbig */}
      <div style={{display:"grid",gridTemplateColumns:kidMode?"repeat(3,1fr)":"repeat(5,1fr)",gap:kidMode?8:6}}>
        {TOOLS.map(o=>(
          <button key={o.id} onClick={()=>setMode(o.id)}
            style={{padding:kidMode?"12px 4px":"8px 2px",borderRadius:14,border:`2.5px solid ${mode===o.id?o.c:"#e2e8f0"}`,background:mode===o.id?o.c+"16":"#fff",display:"flex",flexDirection:"column",alignItems:"center",gap:3,cursor:"pointer",fontFamily:"inherit"}}>
            <span style={{fontSize:kidMode?26:17,lineHeight:1.15}}>{o.e}</span>
            <span style={{fontSize:kidMode?13:9.5,fontWeight:800,color:mode===o.id?o.c:"#64748b"}}>{o.l}</span>
          </button>
        ))}
      </div>
      <div style={{fontSize:kidMode?13.5:11.5,color:"#475569",background:"#f8fafc",borderRadius:10,padding:"8px 12px",fontWeight:kidMode?700:500}}>
        {{move:"👉 Spieler und Ball einfach mit dem Finger verschieben.",
          run:"👉 Vom Spieler dorthin ziehen, wo er hinlaufen soll.",
          dribble:"👉 Der Spieler am Ball dribbelt los – einfach ziehen, der Ball klebt am Fuß.",
          pass:"👉 Der Pass startet automatisch am Ball – zieh dahin, wo er ankommen soll. Oder mutig: aufs Tor!",
          focus:"👉 Auf einen Spieler tippen – alle schauen nur auf ihn. Aufs Feld tippen: aus."}[mode]}
      </div>
      {mode==="run"&&(
        <div style={{display:"flex",gap:6,flexWrap:"wrap",alignItems:"center"}}>
          <span style={{fontSize:11,fontWeight:800,color:"#64748b",marginRight:2}}>TEMPO</span>
          {[[1,"🐢","locker"],[2,"🐇","zügig"],[3,"🐆","Sprint"]].map(([p,l,tt])=>(
            <button key={p} onClick={()=>setRunPace(p)} title={tt} style={{padding:kidMode?"9px 16px":"5px 13px",borderRadius:9,border:`1.5px solid ${runPace===p?PACE_COL[p]:"#e2e8f0"}`,background:runPace===p?PACE_COL[p]+"22":"#fff",fontWeight:700,fontSize:kidMode?17:14,cursor:"pointer",fontFamily:"inherit"}}>{l}</button>
          ))}
        </div>
      )}
      {mode==="pass"&&(
        <div style={{display:"flex",gap:6,flexWrap:"wrap",alignItems:"center"}}>
          <span style={{fontSize:11,fontWeight:800,color:"#64748b",marginRight:2}}>PASS</span>
          {[["fuss","🦶 In den Fuß","Ball kommt direkt zum Spieler"],["steil","🚀 Steilpass","Ball kommt in den Lauf – Spieler und Ball treffen sich"]].map(([k,l,tt])=>(
            <button key={k} onClick={()=>setPassKind(k)} title={tt} style={{padding:kidMode?"9px 13px":"5px 11px",borderRadius:9,border:`1.5px solid ${passKind===k?"#ea580c":"#e2e8f0"}`,background:passKind===k?"#ea580c18":"#fff",color:passKind===k?"#9a3412":"#64748b",fontWeight:700,fontSize:kidMode?13.5:12,cursor:"pointer",fontFamily:"inherit"}}>{l}</button>
          ))}
        </div>
      )}
      <div style={{display:"flex",gap:7,flexWrap:"wrap",alignItems:"center"}}>
        <button onClick={playAnim} disabled={playing||!arrows.length}
          style={{flex:1,minWidth:130,padding:kidMode?"14px":"10px 14px",borderRadius:12,border:"none",background:(playing||!arrows.length)?"#e2e8f0":t.p,color:(playing||!arrows.length)?"#94a3b8":"#fff",fontWeight:900,fontSize:kidMode?17:13.5,cursor:(playing||!arrows.length)?"default":"pointer",fontFamily:"inherit",whiteSpace:"nowrap"}}>{playing?"▶ läuft…":"▶ Abspielen"}</button>
        {playing&&<button onClick={paused?resumeAnim:pauseAnim}
          style={{padding:kidMode?"14px 16px":"10px 12px",borderRadius:12,border:"1.5px solid #e2e8f0",background:"#fff",color:"#475569",fontWeight:700,fontSize:kidMode?15:12.5,cursor:"pointer",fontFamily:"inherit",whiteSpace:"nowrap"}}>{paused?"▶":"⏸"}</button>}
        <button onClick={resetAnim} disabled={!animOwn&&!animOpp&&!playing}
          style={{padding:kidMode?"14px 16px":"10px 12px",borderRadius:12,border:"1.5px solid #e2e8f0",background:"#fff",color:(animOwn||animOpp||playing)?"#475569":"#cbd5e1",fontWeight:700,fontSize:kidMode?15:12.5,cursor:(animOwn||animOpp||playing)?"pointer":"default",fontFamily:"inherit",whiteSpace:"nowrap"}}>↺</button>
        {[[0.6,"🐢"],[1,"▶"],[1.6,"⏩"]].map(([s,l])=>(
          <button key={s} onClick={()=>setAnimSpeed(s)} title={s===0.6?"Langsam":s===1?"Normal":"Schnell"}
            style={{padding:kidMode?"12px 13px":"8px 10px",borderRadius:10,border:`1.5px solid ${animSpeed===s?t.p:"#e2e8f0"}`,background:animSpeed===s?t.p+"15":"#fff",color:animSpeed===s?t.p:"#64748b",fontWeight:700,fontSize:kidMode?14:12.5,cursor:"pointer",fontFamily:"inherit"}}>{l}</button>
        ))}
        <button onClick={()=>setLoopAnim(v=>!v)} title="Wiederholen"
          style={{padding:kidMode?"12px 13px":"8px 10px",borderRadius:10,border:`1.5px solid ${loopAnim?t.p:"#e2e8f0"}`,background:loopAnim?t.p+"15":"#fff",color:loopAnim?t.p:"#64748b",fontWeight:700,fontSize:kidMode?14:12.5,cursor:"pointer",fontFamily:"inherit"}}>🔁</button>
        {!kidMode&&showOpp&&<button onClick={()=>setReactDef(v=>!v)} title="Verteidiger verschieben zum Ball"
          style={{padding:"8px 10px",borderRadius:10,border:`1.5px solid ${reactDef?t.p:"#e2e8f0"}`,background:reactDef?t.p+"15":"#fff",color:reactDef?t.p:"#64748b",fontWeight:700,fontSize:12,cursor:"pointer",fontFamily:"inherit",whiteSpace:"nowrap"}}>🛡️ Abwehr</button>}
        {!kidMode&&<button onClick={shareScene} title="Szene als Bild teilen"
          style={{padding:"8px 10px",borderRadius:10,border:"1.5px solid #e2e8f0",background:"#fff",color:"#64748b",fontWeight:700,fontSize:12,cursor:"pointer",fontFamily:"inherit",whiteSpace:"nowrap"}}>📤</button>}
      </div>

      {/* Vorfuehr-Modus: derselbe Feld-Block wandert per CSS in ein Vollbild-Overlay */}
      <div style={present?{position:"fixed",inset:0,zIndex:2000,background:"#07230f",display:"flex",flexDirection:"column",padding:"12px",gap:10,boxSizing:"border-box"}:{display:"contents"}}>
      {present&&(
        <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",gap:8,flexShrink:0}}>
          <span style={{color:"#fff",fontWeight:900,fontSize:17}}>🎬 Taktik zeigen</span>
          <div style={{display:"flex",gap:8}}>
            <button onClick={()=>setPadOn(v=>!v)} title="Steuerkreuz"
              style={{width:40,height:40,borderRadius:12,border:padOn?"2px solid #4ade80":"2px solid transparent",background:padOn?"rgba(74,222,128,.22)":"rgba(255,255,255,.14)",color:"#fff",fontSize:18,cursor:"pointer"}}>🎮</button>
            <button onClick={()=>setPresent(false)} style={{width:40,height:40,borderRadius:12,border:"none",background:"rgba(255,255,255,.14)",color:"#fff",fontWeight:900,fontSize:17,cursor:"pointer"}}>✕</button>
          </div>
        </div>
      )}
      <div style={{background:F.bg,borderRadius:14,padding:8,boxShadow:"inset 0 0 0 1px rgba(255,255,255,.08)",position:"relative",...(present?{flex:1,minHeight:0,display:"flex",alignItems:"center",justifyContent:"center"}:{})}}>
        <svg ref={svgRef} viewBox={`0 0 ${F.vw} ${F.vh}`} preserveAspectRatio="xMidYMid meet"
          style={{width:"100%",maxHeight:present?"100%":kidMode?"62vh":"58vh",...(present?{height:"100%"}:{}),display:"block",touchAction:"none",cursor:mode==="move"?"default":(mode==="focus"||mode==="mark")?"pointer":"crosshair"}}
          onPointerDown={startDraw} onTouchStart={startDraw}
          onPointerMove={onMove} onPointerUp={endDrag} onPointerLeave={endDrag}
          onTouchMove={onMove} onTouchEnd={endDrag}>
          <defs>
            <marker id="tb-ar-run" markerWidth="3.6" markerHeight="3.6" refX="2.7" refY="1.8" orient="auto" markerUnits="strokeWidth"><path d="M0,0 L3.6,1.8 L0,3.6 Z" fill={ARR_COL.run}/></marker>
            <marker id="tb-ar-pass" markerWidth="3.6" markerHeight="3.6" refX="2.7" refY="1.8" orient="auto" markerUnits="strokeWidth"><path d="M0,0 L3.6,1.8 L0,3.6 Z" fill={ARR_COL.pass}/></marker>
            <marker id="tb-ar-dribble" markerWidth="3.6" markerHeight="3.6" refX="2.7" refY="1.8" orient="auto" markerUnits="strokeWidth"><path d="M0,0 L3.6,1.8 L0,3.6 Z" fill={ARR_COL.dribble}/></marker>
          </defs>
          {F.draw("rgba(255,255,255,.85)")}
          {arrows.map(a=>(
            <path key={a.id} d={arrPath(a)} fill="none"
              stroke={a.type==="run"?runArrowCol(a):ARR_COL[a.type]} strokeWidth={F.vw*0.012} strokeLinecap="round"
              strokeDasharray={a.type==="pass"?`${F.vw*0.03} ${F.vw*0.022}`:a.type==="dribble"?`${F.vw*0.008} ${F.vw*0.016}`:undefined}
              markerEnd={`url(#tb-ar-${a.type})`}/>
          ))}
          {draw&&Math.hypot(draw.x2-draw.x1,draw.y2-draw.y1)>0.1&&(
            <line x1={draw.x1} y1={draw.y1} x2={draw.x2} y2={draw.y2} opacity={0.6}
              stroke={draw.type==="run"?runArrowCol(draw):ARR_COL[draw.type]} strokeWidth={F.vw*0.012} strokeLinecap="round"
              strokeDasharray={draw.type==="pass"?`${F.vw*0.03} ${F.vw*0.022}`:draw.type==="dribble"?`${F.vw*0.008} ${F.vw*0.016}`:undefined}/>
          )}
          {scn&&scn.phase==="task"&&scn.type==="space"&&scn.target&&(
            <circle cx={scn.target.x} cy={scn.target.y} r={F.r*2.2} fill="#facc15" opacity={0.3} stroke="#facc15" strokeWidth={F.r*0.15} style={{pointerEvents:"none"}}>
              <animate attributeName="opacity" values="0.15;0.4;0.15" dur="1.4s" repeatCount="indefinite"/>
            </circle>
          )}
          {scn&&scn.phase==="task"&&scn.type==="cover"&&(()=>{ const g=oppTokens.find(o=>o.id===scn.target?.id); return g?(
            <circle cx={g.x} cy={g.y} r={F.r*2} fill="none" stroke="#f97316" strokeWidth={F.r*0.22} strokeDasharray={`${F.r*0.5} ${F.r*0.3}`} style={{pointerEvents:"none"}}>
              <animate attributeName="r" values={`${F.r*1.7};${F.r*2.3};${F.r*1.7}`} dur="1.2s" repeatCount="indefinite"/>
            </circle>
          ):null; })()}
          {showOpp&&(animOpp||oppTokens).map(tk=>{ const lo=liveOff(tk,"opp"); const X=tk.x+(lo?.dx||0), Y=tk.y+(lo?.dy||0);
            return (
            <g key={tk.id} opacity={focusId&&focusId!==tk.id?0.3:1} style={{cursor:mode==="move"?"grab":(mode==="mark"||mode==="focus")?"pointer":"crosshair",transition:"opacity .25s"}}
               onPointerDown={(e)=>{ if(mode==="focus"){ e.preventDefault(); e.stopPropagation(); setFocusId(f=>f===tk.id?null:tk.id); return;} if(mode==="mark"){ e.preventDefault(); toggleMark(setOppTokens,tk.id); return;} if(mode!=="move") return; e.preventDefault(); resetAnim(); setSelTok({side:"opp",id:tk.id}); dragRef.current=tk.id; dragSetRef.current="opp";}}
               onTouchStart={(e)=>{ if(mode==="focus"){ e.stopPropagation(); setFocusId(f=>f===tk.id?null:tk.id); return;} if(mode==="mark"){ toggleMark(setOppTokens,tk.id); return;} if(mode!=="move") return; resetAnim(); setSelTok({side:"opp",id:tk.id}); dragRef.current=tk.id; dragSetRef.current="opp";}}>
              {selTok?.id===tk.id&&<circle cx={X} cy={Y} r={F.r*1.55} fill="none" stroke="#38bdf8" strokeWidth={F.r*0.2} strokeDasharray={`${F.r*0.55} ${F.r*0.3}`}/>}
              {focusId===tk.id&&<circle cx={X} cy={Y} r={F.r*1.9} fill="none" stroke="#fff" strokeWidth={F.r*0.18} opacity={0.9}>
                <animate attributeName="r" values={`${F.r*1.6};${F.r*2.2};${F.r*1.6}`} dur="1.6s" repeatCount="indefinite"/>
              </circle>}
              {tk.marked&&<circle cx={X} cy={Y} r={F.r*1.5} fill="none" stroke="#facc15" strokeWidth={F.r*0.22} strokeDasharray={`${F.r*0.5} ${F.r*0.35}`}/>}
              <circle cx={X} cy={Y} r={F.r} fill={tk.n===1?"#0f172a":"#dc2626"} stroke="#fff" strokeWidth={F.r*0.16}/>
              <text x={X} y={Y+F.fs*0.36} textAnchor="middle" fontSize={F.fs} fontWeight="800"
                    fill="#fff" style={{pointerEvents:"none",userSelect:"none"}}>{tk.n}</text>
              {tk.marked&&<text x={X} y={Y-F.r*1.45} textAnchor="middle" fontSize={F.fs*0.95} style={{pointerEvents:"none"}}>⭐</text>}
            </g>
          );})}
          {(animOwn||tokens).map(tk=>{ const lo=liveOff(tk,"own"); const X=tk.x+(lo?.dx||0), Y=tk.y+(lo?.dy||0);
            return (
            <g key={tk.id} opacity={focusId&&focusId!==tk.id?0.3:1} style={{cursor:mode==="move"?"grab":(mode==="mark"||mode==="focus")?"pointer":"crosshair",transition:"opacity .25s"}}
               onPointerDown={(e)=>{ if(mode==="focus"){ e.preventDefault(); e.stopPropagation(); setFocusId(f=>f===tk.id?null:tk.id); return;} if(mode==="mark"){ e.preventDefault(); toggleMark(setTokens,tk.id); return;} if(mode!=="move") return; e.preventDefault(); resetAnim(); setSelTok({side:"own",id:tk.id}); dragRef.current=tk.id; dragSetRef.current="own";}}
               onTouchStart={(e)=>{ if(mode==="focus"){ e.stopPropagation(); setFocusId(f=>f===tk.id?null:tk.id); return;} if(mode==="mark"){ toggleMark(setTokens,tk.id); return;} if(mode!=="move") return; resetAnim(); setSelTok({side:"own",id:tk.id}); dragRef.current=tk.id; dragSetRef.current="own";}}>
              {selTok?.id===tk.id&&<circle cx={X} cy={Y} r={F.r*1.55} fill="none" stroke="#38bdf8" strokeWidth={F.r*0.2} strokeDasharray={`${F.r*0.55} ${F.r*0.3}`}/>}
              {focusId===tk.id&&<circle cx={X} cy={Y} r={F.r*1.9} fill="none" stroke="#fff" strokeWidth={F.r*0.18} opacity={0.9}>
                <animate attributeName="r" values={`${F.r*1.6};${F.r*2.2};${F.r*1.6}`} dur="1.6s" repeatCount="indefinite"/>
              </circle>}
              {tk.marked&&<circle cx={X} cy={Y} r={F.r*1.5} fill="none" stroke="#facc15" strokeWidth={F.r*0.22} strokeDasharray={`${F.r*0.5} ${F.r*0.35}`}/>}
              <circle cx={X} cy={Y} r={F.r} fill={tk.n===1?"#facc15":teamCol} stroke="#fff" strokeWidth={F.r*0.16}/>
              <text x={X} y={Y+F.fs*0.36} textAnchor="middle" fontSize={F.fs} fontWeight="800"
                    fill={tk.n===1?"#1e293b":contrast(teamCol)} style={{pointerEvents:"none",userSelect:"none"}}>{tk.n}</text>
              {tk.marked&&<text x={X} y={Y-F.r*1.45} textAnchor="middle" fontSize={F.fs*0.95} style={{pointerEvents:"none"}}>⭐</text>}
            </g>
          );})}
          {ballPos&&!animBall&&(
            <g style={{cursor:mode==="move"?"grab":"crosshair"}}
               onPointerDown={(e)=>{ if(mode!=="move") return; e.preventDefault(); resetAnim(); dragRef.current="ball"; }}
               onTouchStart={(e)=>{ if(mode!=="move") return; resetAnim(); dragRef.current="ball"; }}>
              <circle cx={ballPos.x} cy={ballPos.y} r={F.r} fill="transparent"/>
              <circle cx={ballPos.x} cy={ballPos.y} r={F.r*0.55} fill="#fff" stroke="#0f172a" strokeWidth={F.r*0.16}/>
              <circle cx={ballPos.x} cy={ballPos.y} r={F.r*0.17} fill="#0f172a"/>
              <line x1={ballPos.x-F.r*0.5} y1={ballPos.y} x2={ballPos.x+F.r*0.5} y2={ballPos.y} stroke="#0f172a" strokeWidth={F.r*0.07} opacity={0.45}/>
              <line x1={ballPos.x} y1={ballPos.y-F.r*0.5} x2={ballPos.x} y2={ballPos.y+F.r*0.5} stroke="#0f172a" strokeWidth={F.r*0.07} opacity={0.45}/>
            </g>
          )}
          {animTrail.length>1&&<g style={{pointerEvents:"none"}}>
            {animTrail.map((p,i)=>(<circle key={i} cx={p.x} cy={p.y} r={F.r*0.5*((i+1)/animTrail.length)} fill="#fff" opacity={0.05*(i+1)}/>))}
          </g>}
          {animBall&&(animBall.height>0.5)&&<ellipse cx={animBall.x} cy={animBall.y} rx={F.r*0.5} ry={F.r*0.2} fill="rgba(0,0,0,.30)" style={{pointerEvents:"none"}}/>}
          {animBall&&(()=>{ const by=animBall.y-(animBall.height||0); return (
            <g style={{pointerEvents:"none"}} transform={`rotate(${(animBall.rot||0)%360} ${animBall.x} ${by})`}>
              {animBall.shot&&<circle cx={animBall.x} cy={by} r={F.r*0.95} fill="none" stroke="#fde047" strokeWidth={F.r*0.12} opacity={0.7}/>}
              <circle cx={animBall.x} cy={by} r={F.r*0.55} fill="#fff" stroke="#0f172a" strokeWidth={F.r*0.16}/>
              <circle cx={animBall.x} cy={by} r={F.r*0.17} fill="#0f172a"/>
              <line x1={animBall.x-F.r*0.5} y1={by} x2={animBall.x+F.r*0.5} y2={by} stroke="#0f172a" strokeWidth={F.r*0.07} opacity={0.45}/>
              <line x1={animBall.x} y1={by-F.r*0.5} x2={animBall.x} y2={by+F.r*0.5} stroke="#0f172a" strokeWidth={F.r*0.07} opacity={0.45}/>
            </g>
          ); })()}
          {animGoal&&<g style={{pointerEvents:"none"}}>
            <circle cx={animGoal.x} cy={animGoal.y} r={F.r*0.6} fill="none" stroke="#22c55e" strokeWidth={F.r*0.2}>
              <animate attributeName="r" from={F.r*0.6} to={F.r*2.6} dur="0.7s" fill="freeze"/>
              <animate attributeName="opacity" from="0.9" to="0" dur="0.7s" fill="freeze"/>
            </circle>
            <text x={animGoal.x} y={animGoal.y-F.r*2} textAnchor="middle" fontSize={F.fs*1.5} fontWeight="900" fill="#16a34a" stroke="#fff" strokeWidth={F.r*0.05}>TOR!</text>
          </g>}
        </svg>
        {padOn&&!present&&(
          <div style={{position:"absolute",right:10,bottom:10}}>{padUI(46)}</div>
        )}
      </div>
      {present&&(
        <div style={{flexShrink:0,display:"flex",flexDirection:"column",gap:8}}>
          {/* Aktionen als Tasten (wie am Controller) */}
          <div style={{display:"flex",gap:6,justifyContent:"center"}}>
            {TOOLS.map(o=>(
              <button key={o.id} onClick={()=>setMode(o.id)} title={o.l}
                style={{width:48,height:48,borderRadius:13,border:mode===o.id?`2.5px solid ${o.c}`:"2.5px solid rgba(255,255,255,.12)",background:mode===o.id?"#fff":"rgba(255,255,255,.12)",fontSize:19,cursor:"pointer",display:"grid",placeItems:"center",padding:0}}>{o.e}</button>
            ))}
          </div>
          <div style={{color:"#86efac",fontSize:12,textAlign:"center",fontWeight:700}}>
            {TOOLS.find(o=>o.id===mode)?.l}{mode==="move"?" – Spieler & Ball mit dem Finger verschieben":mode==="run"||mode==="pass"||mode==="dribble"?" – auf dem Feld ziehen":" – Spieler antippen"}
          </div>
          {(mode==="run"||mode==="pass")&&(
            <div style={{display:"flex",gap:6,justifyContent:"center"}}>
              {mode==="run"
                ? [[1,"🐢","locker"],[2,"🐇","zügig"],[3,"🐆","Sprint"]].map(([p,l,tt])=>(
                    <button key={p} onClick={()=>setRunPace(p)} title={tt}
                      style={{width:54,height:40,borderRadius:11,border:runPace===p?`2.5px solid ${PACE_COL[p]}`:"2.5px solid rgba(255,255,255,.12)",background:runPace===p?"#fff":"rgba(255,255,255,.12)",fontSize:18,cursor:"pointer",padding:0}}>{l}</button>
                  ))
                : [["fuss","🦶","In den Fuß"],["steil","🚀","Steilpass in den Lauf"]].map(([k,l,tt])=>(
                    <button key={k} onClick={()=>setPassKind(k)} title={tt}
                      style={{width:54,height:40,borderRadius:11,border:passKind===k?"2.5px solid #fb923c":"2.5px solid rgba(255,255,255,.12)",background:passKind===k?"#fff":"rgba(255,255,255,.12)",fontSize:18,cursor:"pointer",padding:0}}>{l}</button>
                  ))}
            </div>
          )}
          {/* Steuerkreuz links, Abspielen rechts – Gameboy-Aufteilung */}
          <div style={{display:"flex",gap:12,alignItems:"center"}}>
            {padOn&&<div style={{flexShrink:0}}>{padUI(44)}</div>}
            <div style={{flex:1,display:"flex",flexDirection:"column",gap:8}}>
              <button onClick={playing?(paused?resumeAnim:pauseAnim):playAnim} disabled={!arrows.length&&!playing}
                style={{width:"100%",padding:padOn?"14px":"16px",borderRadius:14,border:"none",background:arrows.length||playing?"#22c55e":"rgba(255,255,255,.14)",color:"#fff",fontWeight:900,fontSize:padOn?16:19,cursor:"pointer",fontFamily:"inherit"}}>
                {playing?(paused?"▶ Weiter":"⏸ Pause"):"▶ Abspielen"}</button>
              <div style={{display:"flex",gap:8}}>
                <button onClick={resetAnim} style={{flex:1,padding:"11px",borderRadius:12,border:"none",background:"rgba(255,255,255,.14)",color:"#fff",fontWeight:800,fontSize:16,cursor:"pointer"}}>↺</button>
                <button onClick={()=>setLoopAnim(v=>!v)} style={{flex:1,padding:"11px",borderRadius:12,border:"none",background:loopAnim?"#16a34a":"rgba(255,255,255,.14)",color:"#fff",fontWeight:800,fontSize:16,cursor:"pointer"}}>🔁</button>
                {[[0.6,"🐢"],[1.6,"⏩"]].map(([s,l])=>(
                  <button key={s} onClick={()=>setAnimSpeed(animSpeed===s?1:s)} style={{flex:1,padding:"11px",borderRadius:12,border:"none",background:animSpeed===s?"#16a34a":"rgba(255,255,255,.14)",color:"#fff",fontWeight:800,fontSize:16,cursor:"pointer"}}>{l}</button>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
      </div>

      {/* Ablauf-Liste: jeder Schritt einzeln loeschbar, verschiebbar, parallel schaltbar */}
      {arrows.length>0&&(
        <div style={{background:"#fff",border:"1.5px solid #e2e8f0",borderRadius:13,padding:"12px 13px"}}>
          <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:9}}>
            <span style={{fontSize:11,fontWeight:800,color:"#64748b",letterSpacing:.4}}>ABLAUF · {arrows.length} {arrows.length===1?"SCHRITT":"SCHRITTE"}</span>
            <button onClick={()=>{resetAnim();setArrows([]);setDraw(null);}}
              style={{padding:"5px 11px",borderRadius:8,border:"1.5px solid #fecaca",background:"#fff",color:"#dc2626",fontWeight:700,fontSize:11.5,cursor:"pointer",fontFamily:"inherit"}}>🧹 Alle löschen</button>
          </div>
          <div style={{display:"flex",flexDirection:"column",gap:6}}>
            {arrows.map((a,i)=>(
              <div key={a.id} style={{display:"flex",alignItems:"center",gap:6,background:"#f8fafc",borderRadius:10,padding:kidMode?"9px 9px":"7px 9px",border:"1px solid #f1f5f9"}}>
                <span style={{width:22,height:22,borderRadius:"50%",flexShrink:0,background:(a.type==="run"?PACE_COL[a.pace]||"#16a34a":a.type==="dribble"?"#0891b2":"#ea580c")+"26",color:a.type==="run"?"#166534":a.type==="dribble"?"#0e7490":"#c2410c",fontSize:11.5,fontWeight:900,display:"grid",placeItems:"center"}}>{i+1}</span>
                <span style={{flex:1,fontSize:kidMode?14:12.5,fontWeight:700,color:"#0f172a",minWidth:0,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{stepLabel(a)}</span>
                {i>0&&<button onClick={()=>togglePar(a.id)} title="Gleichzeitig mit dem Schritt davor abspielen"
                  style={{flexShrink:0,padding:"5px 8px",borderRadius:8,border:`1.5px solid ${a.par?"#7c3aed":"#e2e8f0"}`,background:a.par?"#f5f3ff":"#fff",color:a.par?"#7c3aed":"#94a3b8",fontWeight:800,fontSize:10.5,cursor:"pointer",fontFamily:"inherit",whiteSpace:"nowrap"}}>{a.par?"∥ zusammen":"→ danach"}</button>}
                <button onClick={()=>moveStep(i,-1)} disabled={i===0} style={{flexShrink:0,width:26,height:26,borderRadius:8,border:"1.5px solid #e2e8f0",background:"#fff",color:i===0?"#e2e8f0":"#475569",fontWeight:800,fontSize:11,cursor:i===0?"default":"pointer"}}>▲</button>
                <button onClick={()=>moveStep(i,1)} disabled={i===arrows.length-1} style={{flexShrink:0,width:26,height:26,borderRadius:8,border:"1.5px solid #e2e8f0",background:"#fff",color:i===arrows.length-1?"#e2e8f0":"#475569",fontWeight:800,fontSize:11,cursor:i===arrows.length-1?"default":"pointer"}}>▼</button>
                <button onClick={()=>delStep(a.id)} style={{flexShrink:0,width:26,height:26,borderRadius:8,border:"1.5px solid #fecaca",background:"#fff",color:"#dc2626",fontWeight:800,fontSize:11,cursor:"pointer"}}>✕</button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Szenario-Spiel: Situationen erkennen, reagieren, Verstaerkung rufen – mit ehrlicher Analyse */}
      <div style={{background:"linear-gradient(135deg,#fff7ed,#fefce8)",border:"1.5px solid #fed7aa",borderRadius:13,padding:"12px 13px"}}>
        <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",gap:8,marginBottom:scn?9:7}}>
          <span style={{fontSize:11,fontWeight:800,color:"#c2410c",letterSpacing:.4}}>🎲 SZENARIO-SPIEL{scn?` · RUNDE ${scn.round} · ${scn.score} ⭐`:""}</span>
          {scn&&<button onClick={scnEnd}
            style={{padding:"6px 12px",borderRadius:9,border:"1.5px solid #fed7aa",background:"#fff",color:"#c2410c",fontWeight:800,fontSize:12,cursor:"pointer",fontFamily:"inherit",whiteSpace:"nowrap"}}>🏁 Fertig</button>}
        </div>
        {!scn&&<>
          <div style={{fontSize:kidMode?13.5:12.5,color:"#7c2d12",lineHeight:1.55,marginBottom:10}}>Die App stellt dir echte Spiel-Situationen: Gegner decken, freilaufen, Verstärkung rufen – und sagt dir danach ehrlich, ob es schlau war. Aus jeder Lösung entsteht die nächste Situation!</div>
          <button onClick={()=>{ setShowOpp(true); if(!ballPos) setBallPos({x:F.vw/2,y:F.vh/2}); scnNext(null); }}
            style={{width:"100%",padding:kidMode?"14px":"11px",borderRadius:11,border:"none",background:"#ea580c",color:"#fff",fontWeight:900,fontSize:kidMode?16:14,cursor:"pointer",fontFamily:"inherit"}}>▶ Los geht's!</button>
        </>}
        {scn&&(
          <div style={{background:"#fff",borderRadius:11,padding:"11px 13px"}}>
            <div style={{fontSize:kidMode?15:13.5,fontWeight:800,color:"#0f172a",lineHeight:1.55}}>{scn.phase==="resolve"?scn.feedback:scn.text}</div>
            {scn.phase==="task"&&scn.type!=="reinforce"&&(
              <div style={{marginTop:8,fontSize:12.5,fontWeight:800,color:(scn.deadline-Date.now())<4000?"#dc2626":"#64748b"}}>
                ⏱ noch {Math.max(0,Math.ceil((scn.deadline-Date.now())/1000))} s – schieb {kidMode?"deinen Spieler":"den markierten Spieler"} mit Finger oder 🎮 hin!
              </div>
            )}
            {scn.phase==="task"&&scn.type==="reinforce"&&(
              <div style={{display:"flex",gap:8,marginTop:10}}>
                <button onClick={()=>scnAnswer(true)}
                  style={{flex:1,padding:kidMode?"13px 8px":"10px 8px",borderRadius:11,border:"none",background:"#dc2626",color:"#fff",fontWeight:900,fontSize:kidMode?15:13,cursor:"pointer",fontFamily:"inherit"}}>📣 Verstärkung!</button>
                <button onClick={()=>scnAnswer(false)}
                  style={{flex:1,padding:kidMode?"13px 8px":"10px 8px",borderRadius:11,border:"2px solid #475569",background:"#fff",color:"#334155",fontWeight:900,fontSize:kidMode?15:13,cursor:"pointer",fontFamily:"inherit"}}>🙅 Halten!</button>
              </div>
            )}
            {scn.phase==="running"&&<div style={{marginTop:8,fontSize:12.5,color:"#64748b",fontWeight:700}}>🏃 Läuft…</div>}
            {scn.phase==="resolve"&&(
              <button onClick={()=>scnNext(scn)}
                style={{width:"100%",marginTop:10,padding:kidMode?"13px":"10px",borderRadius:11,border:"none",background:"#ea580c",color:"#fff",fontWeight:900,fontSize:kidMode?15:13.5,cursor:"pointer",fontFamily:"inherit"}}>▶ Nächste Situation</button>
            )}
          </div>
        )}
      </div>

      {/* KI-Assistent: schlaegt Schritte vor (eingebaute Spiellogik, offline) */}
      <div style={{background:"linear-gradient(135deg,#faf5ff,#eff6ff)",border:"1.5px solid #ddd6fe",borderRadius:13,padding:"12px 13px"}}>
        <div style={{fontSize:11,fontWeight:800,color:"#7c3aed",letterSpacing:.4,marginBottom:9}}>✨ KI-ASSISTENT</div>
        <div style={{display:"flex",gap:8}}>
          <button onClick={aiSuggest}
            style={{flex:1,padding:kidMode?"13px 8px":"10px 8px",borderRadius:11,border:"none",background:"#7c3aed",color:"#fff",fontWeight:800,fontSize:kidMode?14.5:13,cursor:"pointer",fontFamily:"inherit"}}>✨ Nächster Schritt</button>
          <button onClick={aiPlay}
            style={{flex:1,padding:kidMode?"13px 8px":"10px 8px",borderRadius:11,border:"2px solid #7c3aed",background:"#fff",color:"#7c3aed",fontWeight:800,fontSize:kidMode?14.5:13,cursor:"pointer",fontFamily:"inherit"}}>🪄 Ganzer Spielzug</button>
        </div>
        {aiHint&&<div style={{marginTop:9,background:"#fff",borderRadius:10,padding:"9px 12px",fontSize:kidMode?14:12.5,color:"#4c1d95",fontWeight:700,lineHeight:1.5}}>{aiHint}</div>}
        {!kidMode&&<div style={{marginTop:7,fontSize:10.5,color:"#7c7ba8",lineHeight:1.4}}>Die Vorschläge kommen aus einer eingebauten Spiellogik (freie Passwege, offene Räume, Torabschluss) und berücksichtigen das gewählte Werkzeug – komplett offline.</div>}
      </div>

      <div style={{display:"flex",gap:8,alignItems:"center",justifyContent:"space-between"}}>
        <span style={{fontSize:12,color:"#64748b"}}>{kidMode?"Gelb = Torwart":"Eigenes Team "+(showOpp?"(farbig) · Gegner rot":"(gelb = Torwart)")}</span>
        <button onClick={()=>{setTokens(buildTokens(sport,count,formIdx)); setOppTokens(buildOpp(sport,count,oppFormIdx)); setFocusId(null);}}
          style={{padding:"8px 14px",borderRadius:9,border:"1.5px solid #e2e8f0",background:"#fff",color:"#475569",fontWeight:700,fontSize:13,cursor:"pointer",fontFamily:"inherit"}}>
          🔄 Neu aufstellen
        </button>
      </div>
      {!kidMode&&<div style={{display:"flex",gap:14,alignItems:"center",flexWrap:"wrap",fontSize:11.5,color:"#64748b"}}>
        <span><span style={{display:"inline-block",width:22,height:0,borderTop:"3px solid #94a3b8",verticalAlign:"middle",marginRight:5}}/>Laufweg</span>
        <span><span style={{display:"inline-block",width:22,height:0,borderTop:"3px dashed #fb923c",verticalAlign:"middle",marginRight:5}}/>Passweg</span>
        <span><span style={{display:"inline-block",width:22,height:0,borderTop:"3px dotted #22d3ee",verticalAlign:"middle",marginRight:5}}/>Dribbling</span>
      </div>}
      {/* Gespeicherte Boards (vereinsweit, jederzeit aufrufbar) */}
      {eventCtx&&onAttachBoard&&(
        <div style={{background:"#eff6ff",border:"1.5px solid #bfdbfe",borderRadius:13,padding:"12px 14px"}}>
          <div style={{fontSize:12.5,color:"#1e40af",fontWeight:600,lineHeight:1.5,marginBottom:9}}>Dieses Board gehört zu <b>„{eventCtx.title}"</b>. Du kannst die aktuelle Aufstellung direkt an diesen Termin hängen – sie erscheint dann beim Termin.</div>
          <button onClick={()=>onAttachBoard(curBoard())} style={{width:"100%",padding:"11px",borderRadius:11,border:"none",background:t.p,color:contrast(t.p),fontWeight:800,fontSize:14,cursor:"pointer",fontFamily:"inherit"}}>📌 An „{eventCtx.title}" hängen</button>
        </div>
      )}
      {!kidMode&&<>
      {!playerCtx&&(()=>{
        // Befristete Freischaltung: einzelne Kinder duerfen Taktik & Szenarien in ihrer
        // eigenen Ansicht nutzen; Ergebnisse landen unten fuer die gemeinsame Analyse.
        const kids=(data.playerProfiles||[]).filter(p=>myTids.includes(p.mainTid)&&!p.archived).sort((a,b)=>(a.name||"").localeCompare(b.name||""));
        const unlocks=(data.tacticUnlocks||[]).filter(u=>u.cid===cl.id&&new Date(u.until)>new Date());
        const sessions=(data.tacticSessions||[]).filter(s=>s.cid===cl.id).sort((a,b)=>(b.ts||"").localeCompare(a.ts||"")).slice(0,15);
        const restLabel=(until)=>{ const h=Math.max(0,(new Date(until)-Date.now())/36e5); return h>=48?`noch ${Math.round(h/24)} Tage`:h>=1?`noch ${Math.round(h)} Std`:"läuft ab"; };
        const grant=(pid,days)=>{ const p=kids.find(k=>k.id===pid); if(!p) return;
          const u={id:uid(),cid:cl.id,pid,name:p.name,until:new Date(Date.now()+days*864e5).toISOString(),createdAt:new Date().toISOString()};
          save({...data,tacticUnlocks:[...(data.tacticUnlocks||[]).filter(x=>x.pid!==pid),u]});
          fire&&fire(`${p.name} für ${days===1?"1 Tag":days+" Tage"} freigeschaltet`); };
        const revoke=(id)=>save({...data,tacticUnlocks:(data.tacticUnlocks||[]).filter(x=>x.id!==id)});
        const delSession=(id)=>save({...data,tacticSessions:(data.tacticSessions||[]).filter(x=>x.id!==id)});
        const rSum=(d)=>{ const re=(d||[]).filter(x=>x.type==="reinforce"); if(!re.length) return ""; const g=re.filter(x=>x.good).length; return ` · 📣 ${g}/${re.length} gute Verstärkungs-Entscheidungen`; };
        return (<>
        <div style={{background:"#fff",border:"1.5px solid #e2e8f0",borderRadius:13,padding:"13px 14px"}}>
          <div style={{fontSize:11,fontWeight:800,color:"#64748b",letterSpacing:.4,marginBottom:4}}>🔓 KINDER-FREISCHALTUNG</div>
          <div style={{fontSize:12,color:"#64748b",lineHeight:1.5,marginBottom:10}}>Schalte Taktiktafel &amp; Szenario-Spiel für einzelne Kinder befristet frei. Sie sehen es dann in ihrer eigenen App-Ansicht – die Ergebnisse erscheinen unten zum gemeinsamen Besprechen.</div>
          <UnlockPicker kids={kids} onGrant={grant} t={t}/>
          {unlocks.length>0&&<div style={{display:"flex",flexDirection:"column",gap:6,marginTop:10}}>
            {unlocks.map(u=>(
              <div key={u.id} style={{display:"flex",alignItems:"center",gap:8,background:"#f0fdf4",border:"1px solid #bbf7d0",borderRadius:10,padding:"8px 11px"}}>
                <span style={{flex:1,fontWeight:700,fontSize:13,color:"#166534"}}>✅ {u.name}</span>
                <span style={{fontSize:11.5,color:"#16a34a",fontWeight:700}}>{restLabel(u.until)}</span>
                <button onClick={()=>revoke(u.id)} style={{width:26,height:26,borderRadius:8,border:"1.5px solid #fecaca",background:"#fff",color:"#dc2626",fontWeight:800,cursor:"pointer"}}>✕</button>
              </div>
            ))}
          </div>}
        </div>
        {sessions.length>0&&(
        <div style={{background:"#fff",border:"1.5px solid #e2e8f0",borderRadius:13,padding:"13px 14px"}}>
          <div style={{fontSize:11,fontWeight:800,color:"#64748b",letterSpacing:.4,marginBottom:4}}>📊 SZENARIO-ERGEBNISSE</div>
          <div style={{fontSize:12,color:"#64748b",lineHeight:1.5,marginBottom:10}}>Zum gemeinsamen Analysieren: Wie haben die Kinder entschieden?</div>
          <div style={{display:"flex",flexDirection:"column",gap:6}}>
            {sessions.map(s=>(
              <div key={s.id} style={{display:"flex",alignItems:"center",gap:8,background:"#f8fafc",borderRadius:10,padding:"8px 11px",border:"1px solid #f1f5f9"}}>
                <div style={{flex:1,minWidth:0}}>
                  <div style={{fontWeight:700,fontSize:13,color:"#0f172a"}}>{s.name} · {s.score}/{s.rounds} ⭐</div>
                  <div style={{fontSize:11,color:"#64748b"}}>{fmtD(s.ts)}{rSum(s.decisions)}</div>
                </div>
                <button onClick={()=>delSession(s.id)} style={{width:26,height:26,borderRadius:8,border:"1.5px solid #fecaca",background:"#fff",color:"#dc2626",fontWeight:800,cursor:"pointer",flexShrink:0}}>✕</button>
              </div>
            ))}
          </div>
        </div>)}
        </>);
      })()}
      <div style={{background:"#fff",border:"1.5px solid #e2e8f0",borderRadius:13,padding:"13px 14px"}}>
        <div style={{fontSize:11,fontWeight:800,color:"#64748b",letterSpacing:.4,marginBottom:9}}>GESPEICHERTE BOARDS</div>
        <div style={{display:"flex",gap:8,marginBottom:myBoards.length?12:0}}>
          <input value={boardName} onChange={e=>setBoardName(e.target.value)} placeholder="Name, z.B. Pressing 4-4-2"
            style={{flex:1,padding:"10px 12px",fontSize:14,border:"1.5px solid #e2e8f0",borderRadius:10,outline:"none",boxSizing:"border-box",fontFamily:"inherit"}}/>
          <button onClick={saveBoard} style={{padding:"0 16px",borderRadius:10,border:"none",background:t.p,color:contrast(t.p),fontWeight:800,fontSize:13.5,cursor:"pointer",fontFamily:"inherit",whiteSpace:"nowrap"}}>💾 Speichern</button>
        </div>
        {myBoards.length>0
          ? <div style={{display:"flex",flexDirection:"column",gap:7}}>
              {myBoards.map(b=>(
                <div key={b.id} style={{display:"flex",alignItems:"center",gap:8,background:"#f8fafc",borderRadius:10,padding:"8px 11px",border:"1px solid #f1f5f9"}}>
                  <button onClick={()=>loadBoard(b)} style={{flex:1,textAlign:"left",background:"none",border:"none",cursor:"pointer",fontFamily:"inherit",minWidth:0}}>
                    <div style={{fontWeight:700,fontSize:13.5,color:"#0f172a"}}>{b.name}</div>
                    <div style={{fontSize:11,color:"#64748b"}}>{(tbForms(b.sport,b.count)[b.formIdx]||{}).name||""}{b.showOpp?" · mit Gegner":""}{b.ball?" · mit Ball":""}{(b.arrows||[]).length?` · ${b.arrows.length} Pfeile`:""}</div>
                  </button>
                  <button onClick={()=>loadBoard(b)} style={{padding:"6px 11px",borderRadius:8,border:"none",background:t.p+"15",color:t.p,fontWeight:700,fontSize:12,cursor:"pointer",fontFamily:"inherit"}}>Laden</button>
                  <button onClick={()=>delBoard(b.id)} style={{width:28,height:28,borderRadius:8,border:"1.5px solid #fecaca",background:"#fff",color:"#dc2626",fontWeight:800,cursor:"pointer"}}>✕</button>
                </div>
              ))}
            </div>
          : <p style={{fontSize:12.5,color:"#64748b",margin:0}}>Noch keine Boards gespeichert. Aufstellung + Laufwege einrichten und oben einen Namen vergeben.</p>}
      </div>
      <DFBFormatsCard cl={cl}/>
      <div style={{fontSize:12,color:"#64748b",background:"#f8fafc",borderRadius:10,padding:"10px 12px",lineHeight:1.5}}>
        Tipp: Werkzeug wählen, dann auf dem Feld vom Start- zum Zielpunkt ziehen. Schritte lassen sich in der Ablauf-Liste sortieren, löschen oder mit ∥ gleichzeitig abspielen. Gespeicherte Boards sind für alle Trainer des Vereins abrufbar.
      </div>
      </>}
    </div>
  );
}

export function TrainingsLibrary({ data, myTids, cl, save, fire }) {
  const t=TH(cl);
  const cid=cl?.id || (data.teams||[]).find(tm=>myTids.includes(tm.id))?.cid;
  const myTeams=(data.teams||[]).filter(tm=>myTids.includes(tm.id));
  const clubTeams=(data.teams||[]).filter(tm=>tm.cid===cid);
  const all=(data.trainings||[]).filter(tr=>tr.cid===cid);
  const visible=visibleTrainings(all, myTids);
  const teamName=id=>(data.teams||[]).find(tm=>tm.id===id)?.name||"Team";

  const [editing,setEditing]=useState(null); // null | {} (neu) | training (bearbeiten)
  const [sched,setSched]=useState(null);     // Training, das terminiert wird
  const [fullscreenTactic,setFullscreenTactic]=useState(null); // {tactic,title}
  const [infoDrill,setInfoDrill]=useState(null); // Übung, deren Trainingskarte angezeigt wird

  const blank=()=>({ id:"tr_"+uid(), cid, ownerTid:myTeams[0]?.id||myTids[0], title:"", focus:"", blocks:[{phase:"Aufwärmen",title:"",min:10}], vis:"team", sharedTids:[] });

  if(editing){
    const e=editing;
    const set=(patch)=>setEditing(p=>({...p,...patch}));
    const setBlock=(i,patch)=>set({blocks:e.blocks.map((b,j)=>j===i?{...b,...patch}:b)});
    const valid=e.title.trim().length>0;
    const doSave=()=>{
      if(!valid) return;
      const now2=new Date().toISOString();
      const rec={...e, title:e.title.trim(), focus:e.focus.trim(), createdAt:e.createdAt||now2, updatedAt:now2,
        sharedTids: e.vis==="teams"?e.sharedTids:[]};
      const exists=(data.trainings||[]).some(x=>x.id===rec.id);
      const trainings=exists ? (data.trainings||[]).map(x=>x.id===rec.id?rec:x) : [...(data.trainings||[]), rec];
      save({...data, trainings});
      fire&&fire(exists?"Training gespeichert *":"Training angelegt");
      setEditing(null);
    };
    return (
      <div style={{display:"flex",flexDirection:"column",gap:14}}>
        {fullscreenTactic && <TacticFullscreen tactic={fullscreenTactic.tactic} title={fullscreenTactic.title} onClose={()=>setFullscreenTactic(null)}/>}
        {infoDrill && <DrillInfoModal drill={infoDrill} t={t} onClose={()=>setInfoDrill(null)}/>}
        <div style={{display:"flex",alignItems:"center",justifyContent:"space-between"}}>
          <h3 style={{margin:0,fontSize:17,fontWeight:900,color:"#0f172a"}}>{(data.trainings||[]).some(x=>x.id===e.id)?"Training bearbeiten":"Neues Training"}</h3>
          <button onClick={()=>setEditing(null)} style={{background:"none",border:"none",color:"#64748b",fontWeight:700,cursor:"pointer",fontFamily:"inherit"}}>Abbrechen</button>
        </div>
        {myTeams.length>1&&(
          <div style={{background:"#fff",borderRadius:12,padding:"12px 14px",border:"1.5px solid #e2e8f0"}}>
            <div style={{fontSize:11,fontWeight:800,color:"#64748b",marginBottom:8,letterSpacing:.4}}>BESITZER-TEAM</div>
            <select value={e.ownerTid} onChange={ev=>set({ownerTid:ev.target.value})} style={{width:"100%",padding:"10px",borderRadius:10,border:"1.5px solid #e2e8f0",fontSize:14,fontFamily:"inherit"}}>
              {myTeams.map(tm=><option key={tm.id} value={tm.id}>{tm.name}</option>)}
            </select>
          </div>
        )}
        <input value={e.title} onChange={ev=>set({title:ev.target.value})} placeholder="Titel des Trainings (z. B. Passspiel & Abschluss)"
          style={{width:"100%",padding:"12px 14px",fontSize:15,border:"1.5px solid #e2e8f0",borderRadius:12,outline:"none",boxSizing:"border-box"}}/>
        <input value={e.focus} onChange={ev=>set({focus:ev.target.value})} placeholder="Schwerpunkt (optional, z. B. Technik)"
          style={{width:"100%",padding:"11px 14px",fontSize:14,border:"1.5px solid #e2e8f0",borderRadius:12,outline:"none",boxSizing:"border-box"}}/>

        <div style={{background:"#fff",borderRadius:12,padding:"12px 14px",border:"1.5px solid #e2e8f0"}}>
          <div style={{fontSize:11,fontWeight:800,color:"#64748b",marginBottom:8,letterSpacing:.4}}>ABLAUF</div>
          {e.blocks.map((b,i)=>{
            const mode=b.mode||(b.drillId?"lib":"free");
            const pool=drillsForPhase(b.phase);
            const segBtn=(on)=>({flex:1,padding:"6px",borderRadius:8,border:`1.5px solid ${on?"#4f46e5":"#e2e8f0"}`,background:on?"#eef2ff":"#fff",color:on?"#4f46e5":"#64748b",fontWeight:700,fontSize:12,cursor:"pointer",fontFamily:"inherit"});
            return (
            <div key={i} style={{borderBottom:i<e.blocks.length-1?"1px solid #f1f5f9":"none",paddingBottom:8,marginBottom:8}}>
              <div style={{display:"flex",gap:6,alignItems:"center"}}>
                <select value={b.phase} onChange={ev=>setBlock(i,{phase:ev.target.value})} style={{padding:"8px",borderRadius:9,border:"1.5px solid #e2e8f0",fontSize:13,fontFamily:"inherit",flex:1,minWidth:0}}>
                  {TRAIN_PHASES.map(p=><option key={p} value={p}>{p}</option>)}
                </select>
                <input type="number" value={b.min} onChange={ev=>setBlock(i,{min:Number(ev.target.value)||0})} style={{width:52,padding:"8px",fontSize:13,border:"1.5px solid #e2e8f0",borderRadius:9,outline:"none",boxSizing:"border-box"}}/>
                <span style={{fontSize:11,color:"#64748b",flexShrink:0}}>Min</span>
                {e.blocks.length>1&&<button onClick={()=>set({blocks:e.blocks.filter((_,j)=>j!==i)})} style={{background:"none",border:"none",color:"#dc2626",fontWeight:800,fontSize:16,cursor:"pointer",flexShrink:0}}>×</button>}
              </div>
              <div style={{display:"flex",gap:6,margin:"7px 0"}}>
                <button onClick={()=>setBlock(i,{mode:"lib"})} style={segBtn(mode==="lib")}>📋 Vorlage</button>
                <button onClick={()=>setBlock(i,{mode:"free",drillId:"",axes:[]})} style={segBtn(mode==="free")}>✎ Eigene Eingabe</button>
              </div>
              {mode==="lib"
                ? <select value={b.drillId||""} onChange={ev=>{const d=DRILL_LIB.find(x=>x.id===ev.target.value); setBlock(i,{drillId:ev.target.value,title:d?d.title:"",axes:d?(d.axes||[]):[],min:d?d.min:b.min});}}
                    style={{width:"100%",padding:"9px 10px",fontSize:13,border:"1.5px solid #e2e8f0",borderRadius:9,outline:"none",boxSizing:"border-box",fontFamily:"inherit",background:"#fff"}}>
                    <option value="">– Übungs-Vorlage wählen –</option>
                    {pool.map(d=><option key={d.id} value={d.id}>{d.title} · {(d.axes||[]).join("/")}</option>)}
                  </select>
                : <input value={b.title} onChange={ev=>setBlock(i,{title:ev.target.value})} placeholder="Eigene Übung / Inhalt"
                    style={{width:"100%",padding:"9px 10px",fontSize:13,border:"1.5px solid #e2e8f0",borderRadius:9,outline:"none",boxSizing:"border-box",fontFamily:"inherit"}}/>}
              {mode==="lib"&&b.drillId&&<div style={{display:"flex",alignItems:"center",gap:8,flexWrap:"wrap",marginTop:6}}>
                {(b.axes||[]).map(a=><span key={a} style={{fontSize:10.5,fontWeight:800,color:"#4f46e5",background:"#eef2ff",borderRadius:6,padding:"2px 7px"}}>{a}</span>)}
                <button onClick={()=>{const d=DRILL_LIB.find(x=>x.id===b.drillId); if(d)setInfoDrill(d);}} style={{marginLeft:"auto",background:"none",border:"none",color:"#4f46e5",fontWeight:700,fontSize:12,cursor:"pointer",fontFamily:"inherit"}}>ℹ️ Übung ansehen</button>
              </div>}
              <TacticPicker
                value={b.tactic}
                onChange={(tactic)=>setBlock(i,{tactic})}
                onFullscreen={(tpl)=>setFullscreenTactic({tactic:tpl,title:b.title||tpl.name})}/>
            </div>
          );})}
          <button onClick={()=>set({blocks:[...e.blocks,{phase:"Hauptteil",title:"",min:10,mode:"free"}]})} style={{marginTop:4,background:"#f1f5f9",border:"none",borderRadius:9,padding:"8px 12px",fontSize:13,fontWeight:700,color:"#475569",cursor:"pointer",fontFamily:"inherit"}}>+ Block</button>
        </div>

        <div style={{background:"#fff",borderRadius:12,padding:"12px 14px",border:"1.5px solid #e2e8f0"}}>
          <div style={{fontSize:11,fontWeight:800,color:"#64748b",marginBottom:8,letterSpacing:.4}}>WER DARF ES SEHEN?</div>
          {["team","club","teams"].map(v=>(
            <label key={v} style={{display:"flex",alignItems:"center",gap:9,padding:"8px 0",cursor:"pointer"}}>
              <input type="radio" name="vis" checked={e.vis===v} onChange={()=>set({vis:v})} style={{width:18,height:18,accentColor:t.p}}/>
              <span style={{fontSize:14,fontWeight:700,color:"#0f172a"}}>{VIS_LABEL[v]}</span>
            </label>
          ))}
          {e.vis==="teams"&&(
            <div style={{marginTop:6,paddingTop:10,borderTop:"1px solid #e2e8f0"}}>
              <div style={{fontSize:12,color:"#64748b",marginBottom:6}}>Für diese Teams freigeben:</div>
              {clubTeams.filter(tm=>tm.id!==e.ownerTid).map(tm=>{
                const on=(e.sharedTids||[]).includes(tm.id);
                return (
                  <label key={tm.id} style={{display:"flex",alignItems:"center",gap:9,padding:"6px 0",cursor:"pointer"}}>
                    <input type="checkbox" checked={on} onChange={()=>set({sharedTids: on?e.sharedTids.filter(x=>x!==tm.id):[...(e.sharedTids||[]),tm.id]})} style={{width:17,height:17,accentColor:t.p}}/>
                    <span style={{fontSize:13,color:"#334155"}}>{tm.name}</span>
                  </label>
                );
              })}
              {clubTeams.filter(tm=>tm.id!==e.ownerTid).length===0&&<div style={{fontSize:12,color:"#64748b"}}>Keine weiteren Teams im Verein.</div>}
            </div>
          )}
        </div>
        <button onClick={doSave} disabled={!valid} style={{width:"100%",padding:"13px",borderRadius:12,border:"none",background:valid?t.p:"#e2e8f0",color:valid?"#fff":"#64748b",fontWeight:800,fontSize:15,cursor:valid?"pointer":"default",fontFamily:"inherit"}}>Training speichern</button>
      </div>
    );
  }

  return (
    <div style={{display:"flex",flexDirection:"column",gap:12}}>
      {fullscreenTactic && <TacticFullscreen tactic={fullscreenTactic.tactic} title={fullscreenTactic.title} onClose={()=>setFullscreenTactic(null)}/>}
      <div style={{display:"flex",alignItems:"center",justifyContent:"space-between"}}>
        <h3 style={{margin:0,fontSize:17,fontWeight:900,color:"#0f172a"}}>Trainings</h3>
        {myTeams.length>0&&<button onClick={()=>setEditing(blank())} style={{padding:"9px 14px",borderRadius:10,border:"none",background:t.p,color:"#fff",fontWeight:800,fontSize:13,cursor:"pointer",fontFamily:"inherit"}}>+ Neues Training</button>}
      </div>
      {myTeams.length===0&&(
        <div style={{background:"#fffbeb",border:"1.5px solid #fde68a",borderRadius:12,padding:"16px",fontSize:13.5,color:"#92400e",lineHeight:1.5}}>
          <b>Noch keine Mannschaft vorhanden.</b><br/>
          Ein Training gehört immer zu einer Mannschaft. Lege zuerst unter <b>Mehr → Mannschaften</b> mindestens eine Mannschaft an – danach kannst du hier Trainings erstellen, bearbeiten und teilen.
        </div>
      )}
      <p style={{fontSize:12.5,color:"#64748b",margin:"0 0 2px"}}>Eigene Trainings anlegen, bearbeiten, löschen. Standardmäßig nur für dein Team – du kannst sie aber für den Verein oder einzelne Teams freigeben.</p>
      {myTeams.length>0&&visible.length===0&&<div style={{background:"#f8fafc",borderRadius:12,padding:"20px",textAlign:"center",color:"#64748b",fontSize:14}}>Noch keine Trainings. Lege dein erstes an.</div>}
      {visible.map(tr=>{
        const mine=canEditTraining(tr,myTids);
        const totalMin=(tr.blocks||[]).reduce((s,b)=>s+(b.min||0),0);
        return (
          <div key={tr.id} style={{background:"#fff",borderRadius:13,padding:"14px",border:"1.5px solid #e2e8f0"}}>
            <div style={{display:"flex",alignItems:"flex-start",justifyContent:"space-between",gap:8}}>
              <div style={{flex:1}}>
                <div style={{fontWeight:800,fontSize:15,color:"#0f172a"}}>{tr.title}</div>
                {tr.focus&&<div style={{fontSize:12.5,color:"#64748b",marginTop:1}}>Schwerpunkt: {tr.focus}</div>}
                <div style={{fontSize:12,color:"#64748b",marginTop:3}}>{teamName(tr.ownerTid)} · {(tr.blocks||[]).length} Blöcke · {totalMin} Min</div>
              </div>
              <span style={{flexShrink:0,fontSize:10.5,fontWeight:800,padding:"3px 8px",borderRadius:99,background:tr.vis==="club"?"#dcfce7":tr.vis==="teams"?"#dbeafe":"#f1f5f9",color:tr.vis==="club"?"#15803d":tr.vis==="teams"?"#1d4ed8":"#64748b"}}>{VIS_LABEL[tr.vis]}</span>
            </div>
            {(tr.blocks||[]).length>0&&(
              <div style={{marginTop:10,paddingTop:10,borderTop:"1px solid #f1f5f9",display:"flex",flexDirection:"column",gap:6}}>
                {tr.blocks.map((b,i)=>{
                  const tpl = b.tactic?.template ? TACTIC_TEMPLATES.find(x=>x.id===b.tactic.template) : null;
                  return (
                  <div key={i} style={{display:"flex",gap:8,alignItems:"center"}}>
                    {tpl && <button onClick={(ev)=>{ev.stopPropagation();setFullscreenTactic({tactic:tpl,title:b.title||tpl.name});}}
                      title="Taktiktafel auf dem Platz vergrößern"
                      style={{padding:0,background:"none",border:"none",cursor:"pointer",flexShrink:0}}>
                      <TacticField tactic={tpl} size="xs" showLabels={false}/>
                    </button>}
                    <div style={{display:"flex",gap:8,fontSize:12.5,flex:1}}>
                    <span style={{fontWeight:700,color:t.p,minWidth:78,flexShrink:0}}>{b.phase}</span>
                    <span style={{flex:1,color:"#334155"}}>{b.title||"—"}</span>
                    <span style={{color:"#64748b",flexShrink:0}}>{b.min} Min</span>
                    </div>
                  </div>
                  );
                })}
              </div>
            )}
            <div style={{display:"flex",gap:8,marginTop:12}}>
              <button onClick={()=>setSched(tr)} style={{flex:1,padding:"9px",borderRadius:9,border:`1.5px solid ${t.p}`,background:"#fff",color:t.p,fontWeight:700,fontSize:13,cursor:"pointer",fontFamily:"inherit"}}>Als Termin planen</button>
              {mine&&<button onClick={()=>setEditing(tr)} style={{padding:"9px 14px",borderRadius:9,border:"1.5px solid #e2e8f0",background:"#fff",color:"#475569",fontWeight:700,fontSize:13,cursor:"pointer",fontFamily:"inherit"}}>Bearbeiten</button>}
              {mine&&<button onClick={()=>{ if(typeof window!=="undefined"&&window.confirm&&!window.confirm("Dieses Training löschen?"))return; save({...data,trainings:(data.trainings||[]).filter(x=>x.id!==tr.id)}); fire&&fire("Training gelöscht"); }} style={{padding:"9px 12px",borderRadius:9,border:"1.5px solid #fecaca",background:"#fff",color:"#dc2626",fontWeight:700,fontSize:13,cursor:"pointer",fontFamily:"inherit"}}>Löschen</button>}
            </div>
          </div>
        );
      })}

      {sched&&<Drawer onClose={()=>setSched(null)} title="Als Termin planen" ch={
        <ScheduleTraining tr={sched} myTeams={myTeams} data={data} cl={cl} save={save} fire={fire} onDone={()=>setSched(null)}/>
      }/>}
    </div>
  );
}

export function ScheduleTraining({ tr, myTeams, data, cl, save, fire, onDone }){
  const t=TH(cl);
  const [tid,setTid]=useState(myTeams.find(tm=>tm.id===tr.ownerTid)?.id||myTeams[0]?.id||tr.ownerTid);
  const [date,setDate]=useState(addD(now(),1));
  const [time,setTime]=useState("17:00");
  const create=()=>{
    const plan={ focus:tr.focus, sessions:[{ title:tr.title, blocks:(tr.blocks||[]).map(b=>({phase:b.phase,title:b.title,min:b.min})) }] };
    const ev={ id:"e_"+uid(), cid:tr.cid, tid, type:"training", title:tr.title, date, time, loc:"", note:tr.focus?("Schwerpunkt: "+tr.focus):"",
      seasonId:activeSid(data, tr.cid), votes:{}, pt:"att", selType:"multi", li:[], fi:[], sc:[], trainingPlan:plan };
    save({...data, events:[...(data.events||[]), ev]});
    fire&&fire("Termin erstellt");
    onDone&&onDone();
  };
  return (
    <div style={{display:"flex",flexDirection:"column",gap:12}}>
      <p style={{fontSize:13,color:"#475569",margin:0}}>„{tr.title}" als Trainingstermin in den Kalender legen.</p>
      {myTeams.length>1&&(
        <select value={tid} onChange={e=>setTid(e.target.value)} style={{padding:"11px",borderRadius:10,border:"1.5px solid #e2e8f0",fontSize:14,fontFamily:"inherit"}}>
          {myTeams.map(tm=><option key={tm.id} value={tm.id}>{tm.name}</option>)}
        </select>
      )}
      <div style={{display:"flex",gap:10}}>
        <div style={{flex:1}}>
          <div style={{fontSize:11,fontWeight:800,color:"#64748b",marginBottom:5}}>DATUM</div>
          <input type="date" value={date} onChange={e=>setDate(e.target.value)} style={{width:"100%",padding:"11px",borderRadius:10,border:"1.5px solid #e2e8f0",fontSize:14,fontFamily:"inherit",boxSizing:"border-box"}}/>
        </div>
        <div style={{width:120}}>
          <div style={{fontSize:11,fontWeight:800,color:"#64748b",marginBottom:5}}>UHRZEIT</div>
          <input type="time" value={time} onChange={e=>setTime(e.target.value)} style={{width:"100%",padding:"11px",borderRadius:10,border:"1.5px solid #e2e8f0",fontSize:14,fontFamily:"inherit",boxSizing:"border-box"}}/>
        </div>
      </div>
      <button onClick={create} style={{width:"100%",padding:"13px",borderRadius:12,border:"none",background:t.p,color:"#fff",fontWeight:800,fontSize:15,cursor:"pointer",fontFamily:"inherit"}}>Termin erstellen</button>
    </div>
  );
}

// Förder-Assistent: kurzer Wizard – aktueller Skill in Zahlen, Einzelförderung
// bei 2 Trainern und ein passender Übungsvorschlag pro Spieler + Skill.
export function FoerderAssistent({ data, myTids, cl, save, fire }){
  const t=TH(cl); const sport=cl?.sport||"fussball"; const axes=skillAxesFor(sport);
  const teams=(data.teams||[]).filter(tm=>myTids.includes(tm.id));
  const [tid,setTid]=useState(teams[0]?.id||"");
  const team=teams.find(x=>x.id===tid)||teams[0];
  const cid=team?.cid; const cat=team?.cat||team?.name||null;
  const sid=activeSid(data,cid);
  // IMMER aktuelle Saison: Skills werden beim Saisonwechsel uebernommen, aber
  // wir zeigen nur den aktuellen Kader -> keine Vorsaison-Daten vermischt.
  const players=(data.playerProfiles||[]).filter(p=>p.mainTid===tid && !p.archived && (!p.seasonId||p.seasonId===sid));
  const [step,setStep]=useState(1);
  const _today=now();
  const nextTraining=(data.events||[]).filter(e=>e.tid===tid&&e.type==="training"&&e.date>=_today).sort((a,b)=>(a.date+(a.time||"")).localeCompare(b.date+(b.time||"")))[0]||null;
  // Trainer-Anzahl aus den Zusagen ableiten: Trainer-Check-in des nächsten Trainings (wie bei den Helfern).
  const presentTrainerCount=Object.values(nextTraining?.trainerPresence||{}).length;
  const detectedTrainers=Math.max(1,presentTrainerCount);
  const [trainerCount,setTrainerCount]=useState(detectedTrainers);
  const [tcManual,setTcManual]=useState(false);
  useEffect(()=>{ if(!tcManual) setTrainerCount(detectedTrainers); },[detectedTrainers,tcManual]);
  const two = trainerCount>=2;
  const [focusSkill,setFocusSkill]=useState(null);
  const [manualInd,setManualInd]=useState(null);   // Set<id> | null (=auto)
  const [selPid,setSelPid]=useState(null);
  const [selSkills,setSelSkills]=useState([]);       // Mehrfach-Auswahl
  const [openD,setOpenD]=useState(null);
  const [station,setStation]=useState(null);
  const [kidLang,setKidLang]=useState(false);

  const ratedVals=p=>axes.map(a=>p.skills?.[a]).filter(v=>typeof v==="number"&&v>0);
  const avgOf=p=>{const v=ratedVals(p);return v.length?Math.round(v.reduce((a,b)=>a+b,0)/v.length*10)/10:null;};
  const weakOf=p=>{let best=null;axes.forEach(a=>{const v=p.skills?.[a];if(typeof v==="number"&&v>0&&(best===null||v<best.v))best={a,v};});return best;};
  // Förder-Kette: Anwesenheit aus vergangenen Terminen der Mannschaft einbeziehen.
  const _todayStr=now();
  const pastTeamEvs=(data.events||[]).filter(e=>e.tid===tid && (!e.seasonId||e.seasonId===sid) && e.date<_todayStr && (e.pt==="att"||!e.pt));
  const attOf=p=>{ let yes=0,cnt=0; pastTeamEvs.forEach(e=>{const v=(e.votes||{})[p.name];const val=(typeof v==="object"&&v)?v.val:v; if(val==="yes")yes++; if(val==="yes"||val==="no")cnt++;}); return cnt>0?Math.round(yes/cnt*100):null; };
  const teamAxisAvg=a=>{const vs=players.map(p=>p.skills?.[a]).filter(v=>typeof v==="number"&&v>0);return vs.length?vs.reduce((x,y)=>x+y,0)/vs.length:null;};
  const ratedAxes=axes.map(a=>({a,avg:teamAxisAvg(a)})).filter(x=>x.avg!=null).sort((x,y)=>x.avg-y.avg);
  const effFocus=focusSkill||ratedAxes[0]?.a||axes[0];
  // Einzelförderung: faire Rotation – wer Bedarf hat (schwacher Fokus-Skill) UND
  // selten dran war, kommt zuerst; Anwesende werden leicht bevorzugt. Manuell anpassbar.
  const maxFocusCnt=Math.max(0,...players.map(p=>p.focusCount||0));
  const scoreOf=p=>{
    const sk=(typeof p.skills?.[effFocus]==="number"&&p.skills[effFocus]>0)?p.skills[effFocus]:3;
    const need=5-sk;                              // schwächer => mehr Förderbedarf (0..4)
    const fair=maxFocusCnt-(p.focusCount||0);     // selten gefördert => Vorrang (Rotation)
    const att=attOf(p); const attBonus=att!=null?att/100:0.5;
    return need*1.0 + fair*1.3 + attBonus*0.6;
  };
  const ranked=[...players].sort((a,b)=>scoreOf(b)-scoreOf(a));
  // Kapazität für Einzel-/Kleingruppen: jeder Zusatz-Trainer betreut ~3 Spieler.
  const nInd = two
    ? Math.min(Math.max(1,players.length-1), (trainerCount-1)*3)
    : Math.min(4,Math.max(1,Math.round(players.length/3)));
  const autoInd=ranked.slice(0,nInd);
  const indGroup = manualInd ? players.filter(p=>manualInd.has(p.id)) : autoInd;
  // Empfohlene Einzel-Zeit je Spieler (im Wechsel, je nach Trainerzahl & Gruppengröße).
  const perPlayerMin = indGroup.length ? Math.max(5,Math.min(12,Math.round(((trainerCount-1)||1)*18/indGroup.length))) : 0;
  const mainGroup=players.filter(p=>!indGroup.some(x=>x.id===p.id));
  const toggleInd=p=>{ const base=new Set(manualInd?[...manualInd]:autoInd.map(x=>x.id)); base.has(p.id)?base.delete(p.id):base.add(p.id); setManualInd(base); };
  const selPlayer=players.find(p=>p.id===selPid)||indGroup[0]||players[0]||null;
  const effSkills=selSkills.length?selSkills:[(selPlayer&&weakOf(selPlayer)?.a)||effFocus];
  const effSelSkill=effSkills[0];
  const toggleSkill=a=>setSelSkills(cur=>cur.includes(a)?cur.filter(x=>x!==a):[...cur,a]);
  const suggestions=suggestDrillsForSkill(effSelSkill,cat,4);

  // Komplette Förderstation bauen: Aufwärmen + je Schwerpunkt eine Übung + Abschluss-Spiel.
  const buildStation=()=>{
    const inCat=d=>!cat||(d.cats||[]).includes(cat);
    const used=new Set(); const blocks=[];
    const take=(d,phase)=>{ if(d&&!used.has(d.id)){used.add(d.id);blocks.push({phase,d});} };
    take(DRILL_LIB.filter(d=>d.focus==="aufwärmen"&&inCat(d)&&(d.axes||[]).includes(effSkills[0]))[0]||DRILL_LIB.filter(d=>d.focus==="aufwärmen"&&inCat(d))[0],"Aufwärmen");
    effSkills.forEach(s=>take(suggestDrillsForSkill(s,cat,6).map(x=>x.d).find(d=>!used.has(d.id)),"Förderung: "+s));
    take(DRILL_LIB.filter(d=>d.focus==="spielform"&&inCat(d)&&!used.has(d.id))[0],"Abschluss-Spiel");
    setStation(blocks);
  };
  const stationMins=()=>(station||[]).reduce((a,b)=>a+(b.d.min||0),0);
  const stationText=()=>!station?"":["FÖRDERSTATION"+(cat?" – "+cat:"")+" (ca. "+stationMins()+" Min)","Schwerpunkt: "+effSkills.join(", "),"",...station.map(b=>`• [${b.phase}] ${b.d.title} (${b.d.min} Min)\n  ${(kidLang&&b.d.kids)||b.d.desc||""}${b.d.coach?"\n  Coaching: "+b.d.coach:""}`)].join("\n");
  const adoptStation=()=>{
    if(!station) return;
    const ts=now();
    // Fairness-Rotation: geförderte Spieler bekommen +1 Zähler & Datum (persistiert).
    const bumpProfiles = arr => indGroup.length
      ? (arr||[]).map(p=>indGroup.some(x=>x.id===p.id)?{...p,focusCount:(p.focusCount||0)+1,lastFocus:ts}:p)
      : (arr||[]);
    if(save&&nextTraining){
      // Datenschutz: keine Skill-Namen in Titel/Phasen (Plan ist auch für Eltern/Spieler sichtbar).
      const plan={cat,createdAt:ts,sessions:[{title:"Trainingseinheit",blocks:station.map(b=>({phase:String(b.phase).startsWith("Förderung")?"Förderung":b.phase,id:b.d.id,title:b.d.title,min:b.d.min}))}]};
      save({...data,
        events:(data.events||[]).map(e=>e.id===nextTraining.id?{...e,trainingPlan:plan}:e),
        playerProfiles:bumpProfiles(data.playerProfiles)});
      fire&&fire("Förderstation an "+nextTraining.title+" ("+fmtD(nextTraining.date)+") gehängt");
    } else {
      if(save&&indGroup.length) save({...data,playerProfiles:bumpProfiles(data.playerProfiles)});
      navigator.clipboard?.writeText(stationText()); fire&&fire("Förderstation kopiert");
    }
  };

  const Bar=({v})=>(<div style={{display:"flex",gap:2}}>{[1,2,3,4,5].map(i=><div key={i} style={{width:8,height:8,borderRadius:2,background:i<=v?t.p:"#e2e8f0"}}/>)}</div>);
  const StepDot=({n,label})=>(<div style={{display:"flex",flexDirection:"column",alignItems:"center",gap:3,flex:1}}><div style={{width:26,height:26,borderRadius:"50%",background:step>=n?t.p:"#e2e8f0",color:step>=n?"#fff":"#94a3b8",display:"flex",alignItems:"center",justifyContent:"center",fontWeight:800,fontSize:13}}>{n}</div><span style={{fontSize:10,fontWeight:700,color:step===n?t.p:"#94a3b8",textAlign:"center"}}>{label}</span></div>);
  const navBtns=(<div style={{display:"flex",gap:9,marginTop:16}}>
    {step>1&&<button onClick={()=>setStep(s=>s-1)} style={{flex:1,padding:"12px",borderRadius:12,border:"1.5px solid #e2e8f0",background:"#fff",fontWeight:700,cursor:"pointer",fontFamily:"inherit"}}>Zurück</button>}
    {step<3&&<button onClick={()=>setStep(s=>s+1)} disabled={players.length===0} style={{flex:2,padding:"12px",borderRadius:12,border:"none",background:players.length?t.p:"#cbd5e1",color:players.length?contrast(t.p):"#1e293b",fontWeight:800,cursor:players.length?"pointer":"default",fontFamily:"inherit"}}>Weiter</button>}
  </div>);

  return (
    <div>
      {teams.length>1&&(
        <div style={{display:"flex",flexWrap:"wrap",gap:6,marginBottom:12}}>
          {teams.map(tm=>(<button key={tm.id} onClick={()=>{setTid(tm.id);setStep(1);setFocusSkill(null);setSelPid(null);setSelSkills([]);setTcManual(false);setManualInd(null);}} style={{padding:"7px 13px",borderRadius:99,border:`1.5px solid ${tid===tm.id?t.p:"#e2e8f0"}`,background:tid===tm.id?t.p:"#fff",color:tid===tm.id?"#fff":"#475569",fontWeight:700,fontSize:12.5,cursor:"pointer",fontFamily:"inherit"}}>{tm.name}</button>))}
        </div>
      )}
      <div style={{display:"flex",alignItems:"flex-start",marginBottom:16}}>
        <StepDot n={1} label="Skill-Stand"/><div style={{flex:.5,height:2,background:"#e2e8f0",marginTop:13}}/><StepDot n={2} label="Trainer"/><div style={{flex:.5,height:2,background:"#e2e8f0",marginTop:13}}/><StepDot n={3} label="Übung"/>
      </div>

      {players.length===0&&(
        <div style={{background:"#fffbeb",border:"1.5px solid #fde68a",borderRadius:14,padding:"16px",fontSize:13.5,color:"#92400e",lineHeight:1.5}}>
          Für diese Mannschaft sind in der <strong>aktuellen Saison</strong> noch keine Spieler zugeordnet. Nach einem Saisonwechsel müssen Spieler der Mannschaft neu zugewiesen werden (Skill-Bewertungen bleiben erhalten). Ordne sie unter „Spieler" zu, dann funktioniert der Assistent hier.
        </div>
      )}

      {players.length>0&&step===1&&(
        <div>
          <p style={{fontSize:13,color:"#64748b",marginBottom:12,lineHeight:1.5}}>Aktueller Leistungsstand der Mannschaft – Skill in Zahlen (von 5). Schwächster Wert je Spieler ist hervorgehoben.</p>
          {ratedAxes.length>0&&<div style={{background:`${t.p}0c`,border:`1.5px solid ${t.p}30`,borderRadius:12,padding:"11px 13px",marginBottom:12}}>
            <div style={{fontSize:11,fontWeight:800,color:t.p,letterSpacing:.3,marginBottom:4}}>GRÖSSTE FÖRDERLÜCKE IM TEAM</div>
            <div style={{fontSize:14,fontWeight:800,color:"#0f172a"}}>{ratedAxes[0].a} <span style={{color:"#64748b",fontWeight:600,fontSize:12.5}}>· Schnitt {Math.round(ratedAxes[0].avg*10)/10}/5</span></div>
          </div>}
          <div style={{display:"flex",flexDirection:"column",gap:7}}>
            {players.map(p=>{const w=weakOf(p);const a=avgOf(p);const att=attOf(p);return (
              <div key={p.id} style={{display:"flex",alignItems:"center",gap:10,background:"#fff",border:"1.5px solid #e2e8f0",borderRadius:12,padding:"10px 12px"}}>
                <Av name={p.name} sz={30}/>
                <div style={{flex:1,minWidth:0}}>
                  <div style={{fontWeight:800,fontSize:14,color:"#0f172a",overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{p.name}</div>
                  {w?<div style={{fontSize:11.5,color:"#64748b",marginTop:1}}>Schwächster Bereich: <span style={{color:"#dc2626",fontWeight:700}}>{w.a} {w.v}/5</span></div>:<div style={{fontSize:11.5,color:"#64748b",marginTop:1}}>noch nicht bewertet</div>}
                </div>
                {att!=null&&<div title="Anwesenheit vergangener Termine" style={{textAlign:"right",flexShrink:0}}><div style={{fontWeight:800,fontSize:13,color:att>=70?"#16a34a":att>=50?"#d97706":"#dc2626",lineHeight:1}}>{att}%</div><div style={{fontSize:9.5,color:"#64748b"}}>dabei</div></div>}
                <div style={{textAlign:"right",flexShrink:0,minWidth:34}}>{a!=null?<><div style={{fontWeight:900,fontSize:17,color:t.p,lineHeight:1}}>{a}</div><div style={{fontSize:10,color:"#64748b"}}>Ø Skill</div></>:<span style={{fontSize:11,color:"#64748b"}}>–</span>}</div>
              </div>
            );})}
          </div>
          {navBtns}
        </div>
      )}

      {players.length>0&&step===2&&(
        <div>
          <div style={{background:"#f8fafc",border:"1.5px solid #e2e8f0",borderRadius:14,padding:"13px 15px",marginBottom:14}}>
            <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:8}}>
              <div style={{fontSize:14,fontWeight:800,color:"#334155",flex:1}}>Wie viele Trainer sind heute da?</div>
              {tcManual&&<button onClick={()=>setTcManual(false)} style={{background:"#f1f5f9",border:"none",borderRadius:9,padding:"5px 10px",color:"#475569",fontSize:11.5,fontWeight:800,cursor:"pointer",fontFamily:"inherit",flexShrink:0}}>↺ aus Zusagen</button>}
            </div>
            <div style={{display:"flex",gap:7}}>
              {[1,2,3,4].map(n=>(<button key={n} onClick={()=>{setTrainerCount(n);setTcManual(true);setManualInd(null);}} style={{flex:1,padding:"9px 0",borderRadius:11,border:`1.5px solid ${trainerCount===n?t.p:"#e2e8f0"}`,background:trainerCount===n?t.p:"#fff",color:trainerCount===n?"#fff":"#475569",fontWeight:800,fontSize:14,cursor:"pointer",fontFamily:"inherit"}}>{n}</button>))}
            </div>
            <div style={{fontSize:11.5,color:"#64748b",marginTop:7,lineHeight:1.45}}>
              {tcManual
                ? "Manuell gewählt."
                : (presentTrainerCount>0
                    ? `Automatisch aus den Trainer-Zusagen ${nextTraining?`für „${nextTraining.title}" (${fmtD(nextTraining.date)})`:""} erkannt: ${presentTrainerCount} ${presentTrainerCount===1?"Trainer":"Trainer"}.`
                    : "Noch keine Trainer-Zusage zum nächsten Training – Standard 1 (anpassbar).")}
              {" "}{two?`${trainerCount-1} übernehmen parallel die Einzel-/Kleingruppen-Förderung, 1 hält die Hauptgruppe.`:"Einzelner Trainer: ich empfehle, wer gefördert werden soll (faire Rotation)."}
            </div>
          </div>
          <div style={{marginBottom:14}}>
            <div style={{fontSize:11,fontWeight:800,color:"#64748b",letterSpacing:.3,marginBottom:8}}>FÖRDER-SCHWERPUNKT</div>
            <div style={{display:"flex",flexWrap:"wrap",gap:6}}>
              {axes.map(a=>(<button key={a} onClick={()=>setFocusSkill(a)} style={{padding:"7px 12px",borderRadius:99,border:`1.5px solid ${effFocus===a?t.p:"#e2e8f0"}`,background:effFocus===a?t.p:"#fff",color:effFocus===a?"#fff":"#475569",fontWeight:700,fontSize:12.5,cursor:"pointer",fontFamily:"inherit"}}>{a}</button>))}
            </div>
            <p style={{fontSize:11,color:"#64748b",marginTop:6}}>Vorausgewählt: größte Förderlücke des Teams.</p>
          </div>
          {two?(
            <>
              <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:8}}>
                <span style={{fontSize:11.5,color:"#64748b"}}>Tippe einen Spieler, um ihn zwischen den Gruppen zu verschieben.</span>
                {manualInd&&<button onClick={()=>setManualInd(null)} style={{background:"#f1f5f9",border:"none",borderRadius:9,padding:"5px 10px",color:"#475569",fontSize:11.5,fontWeight:800,cursor:"pointer",fontFamily:"inherit",flexShrink:0}}>↺ Auto</button>}
              </div>
              <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10}}>
                <div style={{background:"#fff",border:"2px solid #fca5a5",borderRadius:14,padding:"12px"}}>
                  <div style={{fontWeight:800,color:"#dc2626",fontSize:13,marginBottom:2}}>Einzelförderung <span style={{color:"#64748b",fontWeight:600}}>({indGroup.length})</span></div>
                  {perPlayerMin>0&&<div style={{fontSize:11,color:"#64748b",marginBottom:8}}>≈ {perPlayerMin} Min je Spieler im Wechsel</div>}
                  {indGroup.length===0&&<p style={{fontSize:11.5,color:"#64748b"}}>Niemand – tippe rechts einen Spieler an.</p>}
                  {indGroup.map(p=><button key={p.id} onClick={()=>toggleInd(p)} style={{display:"flex",alignItems:"center",gap:7,marginBottom:6,width:"100%",background:"none",border:"none",padding:0,cursor:"pointer",fontFamily:"inherit",textAlign:"left"}}><Av name={p.name} sz={22}/><span style={{flex:1,minWidth:0,fontSize:12.5,fontWeight:600,color:"#334155",overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{p.name}</span>{(p.focusCount||0)>0&&<span title="schon so oft gefördert" style={{fontSize:10,fontWeight:800,color:"#64748b"}}>{p.focusCount}×</span>}{typeof p.skills?.[effFocus]==="number"&&<span style={{fontSize:11,fontWeight:800,color:"#dc2626"}}>{p.skills[effFocus]}/5</span>}<span style={{color:"#64748b",fontSize:14}}>→</span></button>)}
                </div>
                <div style={{background:"#fff",border:`2px solid ${t.p}`,borderRadius:14,padding:"12px"}}>
                  <div style={{fontWeight:800,color:t.p,fontSize:13,marginBottom:8}}>Hauptgruppe · Trainer A <span style={{color:"#64748b",fontWeight:600}}>({mainGroup.length})</span></div>
                  {mainGroup.map(p=><button key={p.id} onClick={()=>toggleInd(p)} style={{display:"flex",alignItems:"center",gap:7,marginBottom:6,width:"100%",background:"none",border:"none",padding:0,cursor:"pointer",fontFamily:"inherit",textAlign:"left"}}><span style={{color:"#64748b",fontSize:14}}>←</span><Av name={p.name} sz={22}/><span style={{flex:1,minWidth:0,fontSize:12.5,fontWeight:600,color:"#334155",overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{p.name}</span></button>)}
                </div>
              </div>
            </>
          ):(
            <div style={{background:"#fff",border:"2px solid #fca5a5",borderRadius:14,padding:"12px"}}>
              <div style={{fontWeight:800,color:"#dc2626",fontSize:13,marginBottom:2}}>Diese Spieler sind dran <span style={{color:"#64748b",fontWeight:600}}>· faire Rotation</span></div>
              <div style={{fontSize:11,color:"#64748b",marginBottom:8,lineHeight:1.45}}>Förderbedarf im Schwerpunkt + wer selten dran war{perPlayerMin>0?` · ≈ ${perPlayerMin} Min je Spieler`:""}. Über „Übernehmen" (Schritt 3) werden sie als gefördert vermerkt.</div>
              {indGroup.map(p=>(<div key={p.id} style={{display:"flex",alignItems:"center",gap:7,marginBottom:6}}><Av name={p.name} sz={22}/><span style={{flex:1,minWidth:0,fontSize:12.5,fontWeight:600,color:"#334155",overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{p.name}</span>{(p.focusCount||0)>0&&<span title="schon so oft gefördert" style={{fontSize:10,fontWeight:800,color:"#64748b"}}>{p.focusCount}×</span>}{typeof p.skills?.[effFocus]==="number"&&<span style={{fontSize:11,fontWeight:800,color:"#dc2626"}}>{p.skills[effFocus]}/5</span>}</div>))}
            </div>
          )}
          {navBtns}
        </div>
      )}

      {players.length>0&&step===3&&(
        <div>
          <div style={{marginBottom:12}}>
            <div style={{fontSize:11,fontWeight:800,color:"#64748b",letterSpacing:.3,marginBottom:8}}>SPIELER WÄHLEN</div>
            <div style={{display:"flex",gap:7,overflowX:"auto",scrollbarWidth:"none",paddingBottom:2}}>
              {(two&&indGroup.length?indGroup:players).map(p=>(<button key={p.id} onClick={()=>{setSelPid(p.id);setSelSkills([]);setStation(null);}} style={{flexShrink:0,display:"flex",alignItems:"center",gap:6,padding:"7px 12px",borderRadius:99,border:`1.5px solid ${selPlayer?.id===p.id?t.p:"#e2e8f0"}`,background:selPlayer?.id===p.id?t.p+"12":"#fff",color:selPlayer?.id===p.id?t.p:"#475569",fontWeight:700,fontSize:12.5,cursor:"pointer",fontFamily:"inherit",whiteSpace:"nowrap"}}><Av name={p.name} sz={20}/>{p.name.split(" ")[0]}</button>))}
            </div>
          </div>
          {selPlayer&&<div style={{marginBottom:12}}>
            <div style={{fontSize:11,fontWeight:800,color:"#64748b",letterSpacing:.3,marginBottom:8}}>SKILLS FÖRDERN <span style={{color:"#64748b"}}>· {selPlayer.name} · mehrere wählbar</span></div>
            <div style={{display:"flex",flexWrap:"wrap",gap:6}}>
              {axes.map(a=>{const v=selPlayer.skills?.[a];const on=effSkills.includes(a);return (<button key={a} onClick={()=>toggleSkill(a)} style={{display:"flex",alignItems:"center",gap:6,padding:"7px 11px",borderRadius:10,border:`1.5px solid ${on?t.p:"#e2e8f0"}`,background:on?t.p+"12":"#fff",color:on?t.p:"#475569",fontWeight:700,fontSize:12,cursor:"pointer",fontFamily:"inherit"}}>{on?"✓ ":""}{a}{typeof v==="number"&&v>0&&<span style={{fontSize:10.5,color:"#64748b",fontWeight:800}}>{v}/5</span>}</button>);})}
            </div>
          </div>}
          <div style={{background:`${t.p}0c`,border:`1.5px solid ${t.p}30`,borderRadius:12,padding:"11px 13px",marginBottom:12}}>
            <div style={{fontSize:11,fontWeight:800,color:t.p,letterSpacing:.3}}>VORSCHLAG FÜR {effSelSkill.toUpperCase()}</div>
            <div style={{fontSize:12,color:"#64748b",marginTop:2}}>Passende Übungen aus der Bibliothek{cat?` (${cat})`:""}, beste zuerst.{effSkills.length>1?" Weitere Skills fließen in die Förderstation unten ein.":""}</div>
          </div>
          <div style={{display:"flex",flexDirection:"column",gap:9}}>
            {suggestions.length===0&&<div style={{color:"#64748b",fontSize:13,padding:"18px",textAlign:"center"}}>Keine passende Übung für diesen Skill gefunden.</div>}
            {suggestions.map(({d,inCat})=>{const isOpen=openD===d.id;const f=DRILL_FOCUS.find(x=>x.id===d.focus)||{label:d.focus,col:"#64748b"};return (
              <div key={d.id} style={{background:"#fff",borderRadius:14,border:"1.5px solid #e2e8f0",overflow:"hidden"}}>
                <button onClick={()=>setOpenD(isOpen?null:d.id)} style={{width:"100%",textAlign:"left",padding:"12px 14px",background:"none",border:"none",cursor:"pointer",fontFamily:"inherit",display:"flex",alignItems:"center",gap:10}}>
                  <span style={{width:9,height:9,borderRadius:"50%",background:f.col,flexShrink:0}}/>
                  <span style={{flex:1,minWidth:0}}>
                    <span style={{display:"block",fontWeight:800,fontSize:14,color:"#0f172a"}}>{d.title}</span>
                    <span style={{display:"block",fontSize:11.5,color:"#64748b",marginTop:1}}>{f.label} · {d.min} Min · {d.players}{!inCat?" · ⚠ andere Altersklasse":""}</span>
                  </span>
                  <span style={{fontSize:18,color:"#64748b",transform:isOpen?"rotate(90deg)":"none",transition:"transform .2s"}}>›</span>
                </button>
                {isOpen&&<div style={{padding:"0 14px 14px"}}>
                  <div style={{display:"flex",justifyContent:"center",marginBottom:10}}><DrillDiagram field={d.field} elements={d.el} color={t.p||"#16a34a"} width={280} variant="grass"/></div>
                  <p style={{fontSize:13,color:"#334155",lineHeight:1.6,marginBottom:8}}>{d.desc}</p>
                  {d.coach&&<div style={{background:"#f0fdf4",border:"1px solid #bbf7d0",borderRadius:10,padding:"9px 12px",fontSize:12.5,color:"#166534",lineHeight:1.5}}><strong>Coaching:</strong> {d.coach}</div>}
                </div>}
              </div>
            );})}
          </div>

          <div style={{marginTop:14,background:"#fff",border:"1.5px solid #e2e8f0",borderRadius:14,padding:"14px"}}>
            <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",gap:10,marginBottom:8}}>
              <div style={{fontSize:13.5,fontWeight:800,color:"#0f172a"}}>⚡ Komplette Förderstation</div>
              <label style={{display:"flex",alignItems:"center",gap:6,fontSize:11.5,color:"#64748b",fontWeight:700,cursor:"pointer"}}><input type="checkbox" checked={kidLang} onChange={e=>setKidLang(e.target.checked)}/>Kinder-Sprache</label>
            </div>
            <p style={{fontSize:12,color:"#64748b",marginBottom:10,lineHeight:1.5}}>Baut aus den gewählten Skills ({effSkills.join(", ")}) eine fertige Einheit: Aufwärmen + Förderübungen + Abschluss-Spiel.</p>
            <button onClick={buildStation} style={{width:"100%",padding:"11px",borderRadius:11,border:"none",background:t.p,color:contrast(t.p),fontWeight:800,fontSize:13.5,cursor:"pointer",fontFamily:"inherit"}}>Förderstation bauen</button>
            {station&&<div style={{marginTop:12}}>
              <div style={{fontSize:11,fontWeight:800,color:"#64748b",marginBottom:6}}>ca. {stationMins()} Min</div>
              {station.map((b,i)=>(<div key={i} style={{display:"flex",gap:9,padding:"8px 0",borderTop:i?"1px solid #f1f5f9":"none"}}>
                <span style={{flexShrink:0,fontSize:10.5,fontWeight:800,color:t.p,width:82}}>{b.phase}</span>
                <div style={{flex:1,minWidth:0}}><div style={{fontSize:13,fontWeight:700,color:"#0f172a"}}>{b.d.title} <span style={{color:"#64748b",fontWeight:600,fontSize:11.5}}>· {b.d.min} Min</span></div><div style={{fontSize:11.5,color:"#64748b",lineHeight:1.45,marginTop:2}}>{(kidLang&&b.d.kids)||b.d.desc}</div></div>
              </div>))}
              <div style={{display:"flex",gap:8,marginTop:12,flexWrap:"wrap"}}>
                <button onClick={adoptStation} style={{flex:"1 1 auto",padding:"10px 14px",borderRadius:10,border:"none",background:t.p,color:contrast(t.p),fontWeight:800,fontSize:13,cursor:"pointer",fontFamily:"inherit"}}>{nextTraining?`An nächstes Training hängen (${fmtD(nextTraining.date)})`:"Kopieren"}</button>
                <button onClick={()=>{navigator.clipboard?.writeText(stationText());fire&&fire("Förderstation kopiert");}} style={{flexShrink:0,padding:"10px 14px",borderRadius:10,border:"1.5px solid #e2e8f0",background:"#fff",color:"#475569",fontWeight:800,fontSize:13,cursor:"pointer",fontFamily:"inherit"}}>Kopieren</button>
              </div>
            </div>}
          </div>
          {navBtns}
        </div>
      )}
    </div>
  );
}

export function TrainingPlanner({ data, myTids, cl, save, fire }) {
  const t = TH(cl);
  const sport = cl?.sport || "fussball";
  const axes = skillAxesFor(sport);
  const teams = (data.teams||[]).filter(tm=>myTids.includes(tm.id));
  const [tid, setTid] = useState(teams[0]?.id || "");
  const [mode, setMode] = useState("single");     // single | week
  const [planStyle, setPlanStyle] = useState("grass");
  const [focus, setFocus] = useState("technik");  // Schwerpunkt-Id oder "auto"
  const [dur, setDur] = useState(60);              // Zieldauer in Minuten
  const [plan, setPlan] = useState(null);
  const [openDrill, setOpenDrill] = useState(null);
  const [copied, setCopied] = useState(false);
  const [view, setView] = useState("plan");        // plan | foerder
  const ViewTabs = () => (
    <div style={{display:"flex",gap:8,marginBottom:14}}>
      {[["plan","Trainingsplan"],["foerder","Einzelförderung"]].map(([k,l])=>(
        <button key={k} onClick={()=>setView(k)} style={{flex:1,padding:"10px",borderRadius:11,border:`2px solid ${view===k?t.p:"#e2e8f0"}`,background:view===k?t.p:"#fff",color:view===k?"#fff":"#64748b",fontWeight:800,fontSize:13,cursor:"pointer",fontFamily:"inherit"}}>{l}</button>
      ))}
    </div>
  );

  // Plan als formatierten Text aufbauen
  const planToText = () => {
    if(!plan) return "";
    const L = [];
    L.push("TRAININGSPLAN" + (cat?" – "+cat:""));
    if(cl?.name) L.push("Verein: " + cl.name);
    L.push("");
    plan.sessions.forEach(sess=>{
      const total = sess.blocks.reduce((a,b)=>a+(b.drill.min||0),0);
      L.push("=== " + sess.title + " (" + total + " Min) ===");
      sess.blocks.forEach(b=>{
        L.push("• [" + b.phase + "] " + b.drill.title + " (" + b.drill.min + " Min)");
        if(b.drill.desc) L.push("  " + b.drill.desc);
        if(b.drill.coach) L.push("  Coaching: " + b.drill.coach);
      });
      L.push("");
    });
    return L.join("\n").trim();
  };
  const doShare = async () => {
    const text = planToText();
    if(navigator.share){ try { await navigator.share({ title:"Trainingsplan", text }); return; } catch {} }
    navigator.clipboard?.writeText(text).then(()=>{ setCopied(true); setTimeout(()=>setCopied(false),2000); });
  };
  const doCopy = () => {
    navigator.clipboard?.writeText(planToText()).then(()=>{ setCopied(true); setTimeout(()=>setCopied(false),2000); });
  };
  const doDownload = () => {
    const blob = new Blob([planToText()], {type:"text/plain;charset=utf-8"});
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = "trainingsplan-" + (cat||"team").replace(/\s/g,"-").toLowerCase() + "-" + new Date().toISOString().slice(0,10) + ".txt";
    document.body.appendChild(a); a.click(); document.body.removeChild(a);
    setTimeout(()=>URL.revokeObjectURL(a.href), 1000);
  };
  // Plan an einen Termin hängen (im Event speichern)
  const [attachedTo, setAttachedTo] = useState(null);
  const attachToEvent = (ev) => {
    if(!plan || !save) return;
    const compact = {
      cat, createdAt: now(),
      sessions: plan.sessions.map(s=>({
        title:s.title,
        blocks:s.blocks.map(b=>({phase:b.phase, id:b.drill.id, title:b.drill.title, min:b.drill.min})),
      })),
    };
    const events = (data.events||[]).map(e=> e.id===ev.id ? {...e, trainingPlan:compact} : e);
    save({...data, events});
    fire && fire("Plan an Termin gehängt");
    setAttachedTo(ev.id);
    setTimeout(()=>setAttachedTo(null), 2500);
  };
  const removeFromEvent = (ev) => {
    if(!save) return;
    const events = (data.events||[]).map(e=>{ if(e.id!==ev.id) return e; const {trainingPlan, ...rest}=e; return rest; });
    save({...data, events});
    fire && fire("Plan vom Termin entfernt");
  };
  const team = teams.find(x=>x.id===tid) || teams[0];
  const cat = team?.cat || team?.name || null;
  // Kommende Trainings dieser Mannschaft mit hinterlegter Endzeit (Dauer auslesbar)
  const today = now();
  const upcomingTrainings = (data.events||[])
    .filter(e=>e.tid===tid && e.type==="training" && e.date>=today && eventDurationMin(e)!=null)
    .sort((a,b)=>(a.date+a.time).localeCompare(b.date+b.time))
    .slice(0,4);

  // Förderlücken der Mannschaft (für "auto")
  const autoFocus = () => {
    // zentrale Logik (Ziel-Lücken, Ausbau-Modus) – identisch zu Insights & Termin-Zuordnung
    const tf = trainingFocusFor({ data, cl, tid });
    return AXIS_TO_FOCUS[tf.axis] || "technik";
  };

  const generate = () => {
    const realFocus = focus==="auto" ? autoFocus() : focus;
    if(mode==="single"){
      setPlan({ type:"single", sessions:[{ title:"Trainingseinheit", blocks: buildSession({focus:realFocus, cat, targetMin:dur, scores:drillScores(data, team?.cid)}) }] });
    } else {
      const days = ["Einheit 1","Einheit 2","Einheit 3"];
      const used=[]; const sessions=[];
      days.forEach((d,i)=>{
        const f = focus==="auto" ? autoFocus() : (i===1?"taktik":i===2?"torschuss":realFocus);
        const blocks = buildSession({focus:f, cat, used, targetMin:dur, scores:drillScores(data, team?.cid)});
        blocks.forEach(b=>used.push(b.drill.id));
        sessions.push({ title:d, blocks });
      });
      setPlan({ type:"week", sessions });
    }
    setOpenDrill(null);
  };

  const FOCUS_OPTS = [
    {id:"auto",label:"Aus Förderlücken"},
    {id:"technik",label:"Technik"},{id:"taktik",label:"Taktik"},
    {id:"torschuss",label:"Torschuss"},{id:"kondition",label:"Kondition"},
  ];

  if(view==="foerder") return (<div><ViewTabs/><FoerderAssistent data={data} myTids={myTids} cl={cl} save={save} fire={fire}/></div>);

  return (
    <div>
      <PageHead icon="📋" title="Training & Förderung" sub="Auto-Plan · Einzelförderung"/>
      <ViewTabs/>
      {teams.length>1 && (
        <div style={{display:"flex",flexWrap:"wrap",gap:6,marginBottom:12}}>
          {teams.map(tm=>(
            <button key={tm.id} onClick={()=>{setTid(tm.id);setPlan(null);}} style={{padding:"7px 13px",borderRadius:99,border:`1.5px solid ${tid===tm.id?t.p:"#e2e8f0"}`,background:tid===tm.id?t.p:"#fff",color:tid===tm.id?"#fff":"#475569",fontWeight:700,fontSize:12.5,cursor:"pointer",fontFamily:"inherit"}}>{tm.name}</button>
          ))}
        </div>
      )}

      <div style={{background:"#fff",borderRadius:16,border:"1.5px solid #e2e8f0",padding:"16px",marginBottom:14}}>
        <div style={{fontSize:11,fontWeight:800,color:"#64748b",marginBottom:6,letterSpacing:.4}}>UMFANG</div>
        <div style={{display:"flex",gap:8,marginBottom:14}}>
          {[["single","Eine Einheit"],["week","Ganze Woche (3)"]].map(([k,l])=>(
            <button key={k} onClick={()=>{setMode(k);setPlan(null);}} style={{flex:1,padding:"10px",borderRadius:11,border:`2px solid ${mode===k?t.p:"#e2e8f0"}`,background:mode===k?t.p:"#fff",color:mode===k?"#fff":"#64748b",fontWeight:700,fontSize:13,cursor:"pointer",fontFamily:"inherit"}}>{l}</button>
          ))}
        </div>
        <div style={{fontSize:11,fontWeight:800,color:"#64748b",marginBottom:6,letterSpacing:.4}}>SCHWERPUNKT</div>
        <div style={{display:"flex",flexWrap:"wrap",gap:6,marginBottom:16}}>
          {FOCUS_OPTS.map(f=>(
            <button key={f.id} onClick={()=>{setFocus(f.id);}} style={{padding:"7px 13px",borderRadius:99,border:`1.5px solid ${focus===f.id?t.p:"#e2e8f0"}`,background:focus===f.id?t.p:"#fff",color:focus===f.id?"#fff":"#475569",fontWeight:700,fontSize:12.5,cursor:"pointer",fontFamily:"inherit"}}>{f.label}</button>
          ))}
        </div>
        {upcomingTrainings.length>0 && (
          <>
            <div style={{fontSize:11,fontWeight:800,color:"#64748b",marginBottom:6,letterSpacing:.4}}>DAUER AUS TERMIN ÜBERNEHMEN</div>
            <div style={{display:"flex",flexDirection:"column",gap:6,marginBottom:16}}>
              {upcomingTrainings.map(ev=>{
                const m=eventDurationMin(ev);
                return (
                  <button key={ev.id} onClick={()=>setDur(m)} style={{textAlign:"left",padding:"9px 12px",borderRadius:10,border:`1.5px solid ${dur===m?t.p:"#e2e8f0"}`,background:dur===m?t.p+"10":"#fff",cursor:"pointer",fontFamily:"inherit",display:"flex",alignItems:"center",gap:10}}>
                    <span style={{flex:1,fontSize:13,fontWeight:600,color:"#334155"}}>{ev.title||"Training"}<span style={{color:"#64748b",fontWeight:500}}> · {ev.date.slice(8,10)}.{ev.date.slice(5,7)}. {ev.time}–{ev.endTime}</span></span>
                    <span style={{fontSize:12,fontWeight:800,color:dur===m?t.p:"#94a3b8"}}>{m} Min</span>
                  </button>
                );
              })}
            </div>
          </>
        )}
        <div style={{fontSize:11,fontWeight:800,color:"#64748b",marginBottom:6,letterSpacing:.4}}>DAUER</div>
        <div style={{display:"flex",gap:6,marginBottom:16}}>
          {[45,60,75,90,120].map(m=>(
            <button key={m} onClick={()=>setDur(m)} style={{flex:1,padding:"9px 4px",borderRadius:10,border:`1.5px solid ${dur===m?t.p:"#e2e8f0"}`,background:dur===m?t.p:"#fff",color:dur===m?"#fff":"#475569",fontWeight:700,fontSize:12.5,cursor:"pointer",fontFamily:"inherit"}}>{m}'</button>
          ))}
        </div>
        {cat && <div style={{fontSize:12,color:"#64748b",marginBottom:12}}>Übungen passend für: <strong style={{color:"#475569"}}>{cat}</strong></div>}
        <button onClick={generate} style={{width:"100%",padding:"13px",borderRadius:12,border:"none",background:t.p,color:"#fff",fontWeight:800,fontSize:15,cursor:"pointer",fontFamily:"inherit"}}>
          {plan?"Neu generieren":"Trainingsplan erstellen"}
        </button>
      </div>

      {(()=>{
        const withPlan = (data.events||[]).filter(e=>e.tid===tid && e.trainingPlan && e.date>=now())
          .sort((a,b)=>(a.date+(a.time||"")).localeCompare(b.date+(b.time||"")));
        if(withPlan.length===0) return null;
        return (
          <div style={{background:"#fff",borderRadius:14,border:"1.5px solid #e2e8f0",padding:"14px",marginBottom:14}}>
            <div style={{fontSize:11,fontWeight:800,color:"#64748b",marginBottom:8,letterSpacing:.4}}>TERMINE MIT PLAN</div>
            <div style={{display:"flex",flexDirection:"column",gap:6}}>
              {withPlan.map(ev=>{
                const n=(ev.trainingPlan.sessions?.[0]?.blocks||[]).length;
                return (
                  <div key={ev.id} style={{display:"flex",alignItems:"center",gap:6,padding:"9px 12px",borderRadius:10,border:"1.5px solid #e2e8f0",background:"#f8fafc"}}>
                    <span style={{flex:1,fontSize:13,fontWeight:600,color:"#334155"}}>{ev.title||"Training"}<span style={{color:"#64748b",fontWeight:500}}> · {ev.date.slice(8,10)}.{ev.date.slice(5,7)}.{ev.time?" "+ev.time:""} · {n} Übungen</span></span>
                    <button onClick={()=>removeFromEvent(ev)} title="Plan entfernen" style={{flexShrink:0,padding:"6px 11px",borderRadius:9,border:"1.5px solid #fecaca",background:"#fef2f2",color:"#dc2626",fontWeight:700,fontSize:12,cursor:"pointer",fontFamily:"inherit"}}>entfernen</button>
                  </div>
                );
              })}
            </div>
          </div>
        );
      })()}

      {plan && plan.sessions.map((sess,si)=>{
        const total = sess.blocks.reduce((a,b)=>a+(b.drill.min||0),0);
        return (
          <div key={si} style={{background:"#fff",borderRadius:16,border:"1.5px solid #e2e8f0",padding:"16px",marginBottom:12}}>
            <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:12}}>
              <div style={{fontWeight:800,fontSize:15,color:"#0f172a"}}>{sess.title}</div>
              <span style={{fontSize:12,fontWeight:700,color:t.p,background:t.p+"15",borderRadius:7,padding:"3px 9px"}}>{total} Min{dur && total < dur-10 ? " / Ziel "+dur : ""}</span>
            </div>
            {dur && total < dur-10 && <div style={{background:"#fef9c3",border:"1px solid #fde68a",borderRadius:9,padding:"8px 11px",fontSize:11.5,color:"#854d0e",lineHeight:1.45,marginBottom:10}}>Für diese Altersklasse gibt es nicht genug passende Übungen, um {dur} Min zu füllen – das entspricht auch der kürzeren Trainingszeit jüngerer Jahrgänge.</div>}
            <div style={{display:"flex",flexDirection:"column",gap:8}}>
              {sess.blocks.map((b,bi)=>{
                const fo=DRILL_FOCUS.find(f=>f.id===b.drill.focus)||{label:b.drill.focus,col:"#64748b"};
                const key=si+"-"+bi;
                const isOpen=openDrill===key;
                return (
                  <div key={bi} style={{border:"1px solid #e2e8f0",borderRadius:11,overflow:"hidden"}}>
                    <button onClick={()=>setOpenDrill(isOpen?null:key)} style={{width:"100%",textAlign:"left",padding:"10px 12px",background:"#f8fafc",border:"none",cursor:"pointer",fontFamily:"inherit",display:"flex",alignItems:"center",gap:9}}>
                      <span style={{fontSize:10,fontWeight:800,color:"#64748b",width:62,flexShrink:0}}>{b.phase}</span>
                      <span style={{width:8,height:8,borderRadius:"50%",background:fo.col,flexShrink:0}}/>
                      <span style={{flex:1,fontWeight:700,fontSize:13.5,color:"#0f172a"}}>{b.drill.title}</span>
                      <span style={{fontSize:11,color:"#64748b"}}>{b.drill.min} Min</span>
                      <span style={{fontSize:15,color:"#64748b",transform:isOpen?"rotate(90deg)":"none"}}>›</span>
                    </button>
                    {isOpen && (
                      <div style={{padding:"10px 12px"}}>
                        <StyleToggle value={planStyle} onChange={setPlanStyle} t={t}/>
                        <div style={{display:"flex",justifyContent:"center",marginBottom:9}}>
                          <DrillDiagram field={b.drill.field} elements={b.drill.el} color={t.p||"#16a34a"} width={260} variant={planStyle}/>
                        </div>
                        {planStyle==="kids"&&b.drill.kids
                          ? <div style={{background:"#fffbeb",border:"2px solid #fde68a",borderRadius:12,padding:"11px 13px",fontSize:14,color:"#78350f",lineHeight:1.6,fontWeight:600}}>{b.drill.kids}</div>
                          : <>
                        <p style={{fontSize:12.5,color:"#334155",lineHeight:1.55,margin:0}}>{b.drill.desc}</p>
                        {b.drill.coach && <div style={{marginTop:7,background:"#f0fdf4",border:"1px solid #bbf7d0",borderRadius:8,padding:"7px 10px",fontSize:11.5,color:"#166534",lineHeight:1.45}}><strong>Coaching:</strong> {b.drill.coach}</div>}
                            </>}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        );
      })}
      {plan && <div style={{display:"flex",gap:8,marginBottom:10}}>
        <button onClick={doShare} style={{flex:1,padding:"11px",borderRadius:11,border:"none",background:t.p,color:"#fff",fontWeight:700,fontSize:13,cursor:"pointer",fontFamily:"inherit"}}>Teilen</button>
        <button onClick={doCopy} style={{flex:1,padding:"11px",borderRadius:11,border:"1.5px solid #e2e8f0",background:"#fff",color:"#475569",fontWeight:700,fontSize:13,cursor:"pointer",fontFamily:"inherit"}}>{copied?"Kopiert ✓":"Kopieren"}</button>
        <button onClick={doDownload} style={{flex:1,padding:"11px",borderRadius:11,border:"1.5px solid #e2e8f0",background:"#fff",color:"#475569",fontWeight:700,fontSize:13,cursor:"pointer",fontFamily:"inherit"}}>Download</button>
      </div>}
      {plan && plan.type==="single" && (()=>{
        const upcoming = (data.events||[]).filter(e=>e.tid===tid && e.type==="training" && e.date>=now())
          .sort((a,b)=>(a.date+(a.time||"")).localeCompare(b.date+(b.time||""))).slice(0,5);
        if(upcoming.length===0) return null;
        return (
          <div style={{background:"#fff",borderRadius:14,border:"1.5px solid #e2e8f0",padding:"14px",marginBottom:10}}>
            <div style={{fontSize:11,fontWeight:800,color:"#64748b",marginBottom:8,letterSpacing:.4}}>AN TERMIN HÄNGEN</div>
            <div style={{display:"flex",flexDirection:"column",gap:6}}>
              {upcoming.map(ev=>(
                <div key={ev.id} style={{display:"flex",alignItems:"center",gap:6}}>
                  <button onClick={()=>attachToEvent(ev)} style={{flex:1,textAlign:"left",padding:"9px 12px",borderRadius:10,border:`1.5px solid ${attachedTo===ev.id?t.p:"#e2e8f0"}`,background:attachedTo===ev.id?t.p+"10":"#fff",cursor:"pointer",fontFamily:"inherit",display:"flex",alignItems:"center",gap:10}}>
                    <span style={{flex:1,fontSize:13,fontWeight:600,color:"#334155"}}>{ev.title||"Training"}<span style={{color:"#64748b",fontWeight:500}}> · {ev.date.slice(8,10)}.{ev.date.slice(5,7)}.{ev.time?" "+ev.time:""}</span></span>
                    <span style={{fontSize:12,fontWeight:700,color:attachedTo===ev.id?t.p:"#94a3b8"}}>{attachedTo===ev.id?"Gehängt ✓":ev.trainingPlan?"ersetzen":"wählen"}</span>
                  </button>
                  {ev.trainingPlan && attachedTo!==ev.id && (
                    <button onClick={()=>removeFromEvent(ev)} title="Plan entfernen" style={{flexShrink:0,width:38,height:38,borderRadius:10,border:"1.5px solid #fecaca",background:"#fef2f2",color:"#dc2626",fontWeight:800,fontSize:16,cursor:"pointer",fontFamily:"inherit"}}>×</button>
                  )}
                </div>
              ))}
            </div>
          </div>
        );
      })()}
      {plan && <div style={{fontSize:11,color:"#64748b",lineHeight:1.5,textAlign:"center",marginTop:4}}>Vorschlag aus der Übungsbibliothek – „Neu generieren" für andere Auswahl. Lokal erstellt, keine Daten verlassen die App.</div>}
    </div>
  );
}

export function TrainerGuide({ onClose, cl }){
  const t = TH(cl);
  const sections = [
    {icon:"👋", title:"Keine Sorge – du musst nicht alles nutzen", text:"Für den Start reicht es, deine Spieler anzulegen und Termine zu planen. Statistiken, Skills & Auswertungen sind Extras – nützlich, aber freiwillig. Hier die Bereiche kurz erklärt."},
    {icon:"🧒", title:"Spieler / Kader", text:"Lege deine Spieler an (einzeln oder mehrere auf einmal) und ordne sie der Mannschaft zu. Das ist die Grundlage für alles Weitere."},
    {icon:"⭐", title:"Skills (Stärken-Profil)", text:"Optional kannst du je Spieler Fähigkeiten von 1–5 einschätzen (z. B. Technik, Schnelligkeit). Das dient nur DEINER Förderplanung – es ist nicht öffentlich, Eltern und Spieler sehen die Werte nicht. Einmal im Monat kannst du sie kurz aktualisieren (der monatliche Skill-Check)."},
    {icon:"🧠", title:"Insights", text:"Kennzahlen deiner Mannschaft auf einen Blick (z. B. Kaderstärke, Anwesenheit). Nur zum schnellen Überblick – nichts, was du pflegen musst."},
    {icon:"📈", title:"Analyse", text:"Zeigt Stärken und Schwächen des Teams je Fähigkeit – hilfreich, um Trainingsschwerpunkte zu setzen. Basiert auf den Skill-Werten."},
    {icon:"✅", title:"Anwesenheit", text:"Wer war wie oft dabei? Du erkennst verlässliche Spieler und solche, die oft fehlen."},
    {icon:"💡", title:"Mein Tipp zum Start", text:"Fang klein an: Spieler anlegen, Termine planen, abstimmen lassen. Skills & Statistik kannst du dir in Ruhe später ansehen. Diese Erklärung findest du jederzeit über das ❓ oben rechts wieder."},
  ];
  const [step,setStep]=useState(0);
  const last=sections.length-1;
  const sec=sections[step];
  return (
    <Drawer onClose={onClose} title={`Statistiken & Skills (${step+1}/${sections.length})`}>
      <div style={{display:"flex",flexDirection:"column",gap:18,minHeight:300}}>
        {/* Fortschritt */}
        <div style={{display:"flex",gap:5}}>
          {sections.map((_,i)=>(
            <div key={i} style={{flex:1,height:5,borderRadius:99,background:i<=step?t.p:"#e2e8f0",transition:"background .2s"}}/>
          ))}
        </div>
        {/* aktueller Schritt */}
        <div style={{flex:1,textAlign:"center",padding:"10px 6px",display:"flex",flexDirection:"column",justifyContent:"center"}}>
          <div style={{fontSize:48,lineHeight:1,marginBottom:14}}>{sec.icon}</div>
          <div style={{fontWeight:900,fontSize:19,color:"#0f172a",marginBottom:10}}>{sec.title}</div>
          <div style={{fontSize:14.5,color:"#475569",lineHeight:1.6}}>{sec.text}</div>
        </div>
        {/* Navigation */}
        <div style={{display:"flex",gap:9}}>
          {step>0
            ? <button onClick={()=>setStep(x=>x-1)} style={{flex:1,padding:"13px",borderRadius:12,border:"1.5px solid #e2e8f0",background:"#fff",color:"#475569",fontWeight:700,fontSize:14,cursor:"pointer",fontFamily:"inherit"}}>Zurück</button>
            : <button onClick={onClose} style={{flex:1,padding:"13px",borderRadius:12,border:"1.5px solid #e2e8f0",background:"#fff",color:"#64748b",fontWeight:700,fontSize:14,cursor:"pointer",fontFamily:"inherit"}}>Überspringen</button>}
          {step<last
            ? <button onClick={()=>setStep(x=>x+1)} style={{flex:2,padding:"13px",borderRadius:12,border:"none",background:t.p,color:contrast(t.p),fontWeight:800,fontSize:14,cursor:"pointer",fontFamily:"inherit"}}>Weiter</button>
            : <button onClick={onClose} style={{flex:2,padding:"13px",borderRadius:12,border:"none",background:t.p,color:contrast(t.p),fontWeight:800,fontSize:14,cursor:"pointer",fontFamily:"inherit"}}>Alles klar, los geht's</button>}
        </div>
      </div>
    </Drawer>
  );
}

export function TrainingPlanTab({ data, myTids, save, fire, cl, session }) {
  const t = TH(cl);
  const cid = (data.teams||[]).find(tm=>myTids.includes(tm.id))?.cid;
  const plans = (data.trainingPlans||[]).filter(p=>myTids.includes(p.tid)||(p.cid===cid&&!p.tid));
  const [selPlan, setSelPlan] = useState(null);
  const [showNew, setShowNew] = useState(false);
  const [showInventory, setShowInventory] = useState(null);

  // Nächstes Training mit Trainingsplan
  const today = new Date().toISOString().slice(0,10);
  const nextTraining = (data.events||[])
    .filter(e=>myTids.includes(e.tid)&&e.type==="training"&&e.date>=today&&e.planId)
    .sort((a,b)=>a.date.localeCompare(b.date))[0];
  const linkedPlan = nextTraining ? plans.find(p=>p.id===nextTraining.planId) : null;

  return (
    <div>
      {/* Nächstes Training Hint */}
      {linkedPlan&&(
        <div style={{background:`linear-gradient(135deg,${t.s||"#052e16"},${t.p})`,
          borderRadius:16,padding:"14px 16px",marginBottom:14,cursor:"pointer"}}
          onClick={()=>setShowInventory(linkedPlan)}>
          <div style={{color:"rgba(255,255,255,.6)",fontSize:11,fontWeight:700,marginBottom:4}}>
            NÄCHSTES TRAINING - INVENTARLISTE
          </div>
          <div style={{color:"#fff",fontWeight:900,fontSize:16,marginBottom:8}}>
            {linkedPlan.name}
          </div>
          {(() => {
            const inv = calcInventory(linkedPlan.exercises);
            return (
              <div style={{display:"flex",gap:6,flexWrap:"wrap"}}>
                {inv.slice(0,4).map(item=>(
                  <div key={item.id+(item.color||"")} style={{background:"rgba(255,255,255,.15)",
                    borderRadius:99,padding:"4px 10px",fontSize:12,color:"#fff",fontWeight:700}}>
                    {item.total}x {item.label}{item.color?" ("+item.color+")":""}
                  </div>
                ))}
                {inv.length>4&&<div style={{background:"rgba(255,255,255,.1)",borderRadius:99,
                  padding:"4px 10px",fontSize:12,color:"rgba(255,255,255,.7)"}}>
                  +{inv.length-4} weitere
                </div>}
              </div>
            );
          })()}
          <div style={{color:"rgba(255,255,255,.5)",fontSize:11,marginTop:8}}>
            Tippen für vollständige Inventarliste
          </div>
        </div>
      )}

      {/* Pläne Liste */}
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:12}}>
        <div style={{fontWeight:900,fontSize:15,color:"#0f172a"}}>{plans.length} Trainingspläne</div>
        <button onClick={()=>setShowNew(true)}
          style={{padding:"9px 16px",borderRadius:11,border:"none",background:t.p,
            color:"#fff",fontWeight:700,fontSize:13,cursor:"pointer",fontFamily:"inherit"}}>
          + Neuer Plan
        </button>
      </div>

      {plans.length===0&&(
        <div style={{textAlign:"center",padding:"40px 20px",background:"#f8fafc",
          borderRadius:16,border:"1.5px dashed #e2e8f0"}}>
          <div style={{fontWeight:700,fontSize:15,color:"#334155",marginBottom:6}}>
            Noch keine Trainingspläne
          </div>
          <div style={{fontSize:13,color:"#64748b",lineHeight:1.6}}>
            Erstelle Trainingspläne mit Übungen und Material.<br/>
            Die App berechnet automatisch was du benoenigst.
          </div>
        </div>
      )}

      {plans.map(plan=>{
        const inv = calcInventory(plan.exercises);
        const totalMins = (plan.exercises||[]).reduce((s,e)=>s+(e.duration||0),0);
        return (
          <div key={plan.id} style={{background:"#fff",borderRadius:14,border:"1.5px solid #e2e8f0",
            marginBottom:10,overflow:"hidden"}}>
            <div style={{padding:"13px 16px",display:"flex",alignItems:"flex-start",gap:10}}>
              <div style={{flex:1}}>
                <div style={{fontWeight:800,fontSize:15,color:"#0f172a"}}>{plan.name}</div>
                <div style={{fontSize:12,color:"#64748b",marginTop:2}}>
                  {(plan.exercises||[]).length} Übungen  {totalMins} Min.
                </div>
              </div>
              <div style={{display:"flex",gap:7}}>
                <button onClick={()=>setShowInventory(plan)}
                  style={{padding:"6px 12px",borderRadius:9,border:"1.5px solid #e2e8f0",
                    background:"#f8fafc",fontWeight:700,fontSize:12,cursor:"pointer",
                    fontFamily:"inherit",color:"#475569"}}>
                  Inventar
                </button>
                <button onClick={()=>setSelPlan(plan)}
                  style={{padding:"6px 12px",borderRadius:9,border:"none",background:t.p,
                    color:"#fff",fontWeight:700,fontSize:12,cursor:"pointer",fontFamily:"inherit"}}>
                  Bearbeiten
                </button>
              </div>
            </div>
            {/* Plan Stats */}
            {(()=>{
              const stats=calcPlanStats(plan.exercises);
              if(!stats.topSkills||stats.topSkills.length===0) return null;
              return (
                <div style={{padding:"0 14px 10px",display:"flex",gap:12,alignItems:"center"}}>
                  <div style={{display:"flex",gap:3}}>
                    {Array.from({length:5},(_,i)=>(
                      <div key={i} style={{width:8,height:14,borderRadius:3,
                        background:i*2<stats.intensity?(stats.intensity>=8?"#dc2626":stats.intensity>=5?"#d97706":"#16a34a"):"#e2e8f0"}}/>
                    ))}
                  </div>
                  <div style={{display:"flex",gap:4,flexWrap:"wrap"}}>
                    {stats.topSkills.slice(0,2).map(([skill])=>{
                      const sk=SKILLS[skill];
                      return sk?<span key={skill} style={{background:sk.col+"15",color:sk.col,borderRadius:99,padding:"2px 7px",fontSize:10,fontWeight:700}}>{sk.label}</span>:null;
                    })}
                  </div>
                </div>
              );
            })()}
            {/* Übungs-Kacheln */}
            {(plan.exercises||[]).length>0&&(
              <div style={{display:"flex",gap:4,padding:"0 14px 12px",overflowX:"auto",scrollbarWidth:"none"}}>
                {plan.exercises.map((ex,i)=>{
                  const cat = EXERCISE_CATS.find(c=>c.id===ex.cat)||EXERCISE_CATS[0];
                  return (
                    <div key={i} style={{flexShrink:0,padding:"6px 10px",borderRadius:9,
                      background:cat.bg,border:`1px solid ${cat.col}30`,minWidth:80}}>
                      <div style={{fontWeight:700,fontSize:11,color:cat.col}}>{ex.duration||0} Min</div>
                      <div style={{fontWeight:600,fontSize:11,color:"#334155",
                        whiteSpace:"nowrap",overflow:"hidden",textOverflow:"ellipsis",maxWidth:90}}>
                        {ex.name||"Übung"}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        );
      })}

      {/* Inventar Modal */}
      {showInventory&&<InventorySheet plan={showInventory} data={data} onClose={()=>setShowInventory(null)} cl={cl}/>}

      {/* Plan Editor */}
      {(showNew||selPlan)&&(
        <PlanEditor
          plan={selPlan}
          cid={cid}
          myTids={myTids}
          data={data}
          save={save}
          fire={fire}
          cl={cl}
          onClose={()=>{ setShowNew(false); setSelPlan(null); }}
        />
      )}
    </div>
  );
}

/* =================================================================
   INVENTAR SHEET - Vor dem Training
================================================================= */

export function InventorySheet({ plan, data, onClose, cl }) {
  const t = TH(cl);
  const inv = calcInventory(plan.exercises);
  const cats = [...new Set(inv.map(x=>x.cat))];
  const totalMins = (plan.exercises||[]).reduce((s,e)=>s+(e.duration||0),0);

  // Platz-Visualisierung
  const zones = [...new Set((plan.exercises||[]).map(e=>e.zone).filter(Boolean).filter(x=>!x.hidden))];

  const copyList = () => {
    const text = "Inventar für: "+plan.name+"\n\n"+
      cats.map(cat=>
        cat+":\n"+inv.filter(x=>x.cat===cat)
          .map(x=>"  "+x.total+"x "+x.label+(x.color?" ("+x.color+")":""))
          .join("\n")
      ).join("\n\n");
    navigator.clipboard?.writeText(text);
  };

  return (
    <div style={{position:"fixed",inset:0,background:"rgba(0,0,0,.6)",zIndex:900,
      display:"flex",alignItems:"flex-end",justifyContent:"center",backdropFilter:"blur(6px)"}}>
      <div style={{background:"#fff",borderRadius:"22px 22px 0 0",width:"100%",
        maxWidth:520,maxHeight:"90dvh",overflowY:"auto",paddingBottom:40}}>

        <div style={{background:`linear-gradient(135deg,${t.s||"#052e16"},${t.p})`,
          padding:"18px 20px 16px"}}>
          <div style={{color:"rgba(255,255,255,.6)",fontSize:11,fontWeight:700,marginBottom:3}}>
            VOR DEM TRAINING BEREITSTELLEN
          </div>
          <div style={{color:"#fff",fontWeight:900,fontSize:20}}>{plan.name}</div>
          <div style={{color:"rgba(255,255,255,.6)",fontSize:12,marginTop:4}}>
            {(plan.exercises||[]).length} Übungen  {totalMins} Min.
          </div>
        </div>

        <div style={{padding:"18px 20px 0"}}>

          {/* Planskizze */}
          {zones.length>0&&(
            <div style={{marginBottom:16}}>
              <div style={{fontSize:11,fontWeight:800,color:"#64748b",marginBottom:8,letterSpacing:.5}}>
                PLATZBELEGUNG
              </div>
              <FieldPlanView exercises={plan.exercises} cl={cl}/>
            </div>
          )}

          {/* Inventar nach Kategorie */}
          {cats.map(cat=>(
            <div key={cat} style={{marginBottom:14}}>
              <div style={{fontSize:11,fontWeight:800,color:"#64748b",marginBottom:8,
                letterSpacing:.5,textTransform:"uppercase"}}>
                {cat}
              </div>
              <div style={{display:"flex",flexDirection:"column",gap:7}}>
                {inv.filter(x=>x.cat===cat).map(item=>{
                  const matDef = MATERIAL_CATALOG.find(m=>m.id===item.id);
                  const dotCol = item.color ? COLOR_HEX[item.color]||"#64748b" : matDef?.col||"#64748b";
                  return (
                    <div key={item.id+(item.color||"")} style={{display:"flex",alignItems:"center",
                      gap:12,background:"#f8fafc",borderRadius:12,padding:"11px 14px",
                      border:"1.5px solid #e2e8f0"}}>
                      <div style={{width:36,height:36,borderRadius:10,
                        background:dotCol+"20",display:"flex",alignItems:"center",
                        justifyContent:"center",fontWeight:900,fontSize:16,color:dotCol,flexShrink:0}}>
                        {matDef?.icon||"?"}
                      </div>
                      <div style={{flex:1}}>
                        <div style={{fontWeight:700,fontSize:14,color:"#0f172a"}}>
                          {item.label}
                          {item.color&&<span style={{marginLeft:6,background:dotCol+"20",
                            color:dotCol,borderRadius:99,padding:"1px 7px",
                            fontSize:11,fontWeight:700}}>{item.color}</span>}
                        </div>
                        <div style={{fontSize:11,color:"#64748b",marginTop:1}}>
                          {item.unit==="Tor"?"Tore benötigt":
                           item.unit==="Ball"?"Bälle":
                           "Stück"}
                        </div>
                      </div>
                      <div style={{width:44,height:44,borderRadius:12,background:dotCol,
                        display:"flex",alignItems:"center",justifyContent:"center",
                        fontWeight:900,fontSize:22,color:"#fff",flexShrink:0}}>
                        {item.total}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ))}

          {inv.length===0&&(
            <div style={{textAlign:"center",padding:"32px",background:"#f8fafc",
              borderRadius:14,border:"1.5px dashed #e2e8f0"}}>
              <p style={{color:"#64748b",margin:0}}>Keine Materialien eingetragen</p>
            </div>
          )}

          <div style={{display:"flex",gap:9,marginTop:4}}>
            <button onClick={copyList}
              style={{flex:1,padding:"12px",borderRadius:12,border:"1.5px solid #e2e8f0",
                background:"#fff",fontWeight:700,cursor:"pointer",fontFamily:"inherit",
                color:"#475569"}}>
              Liste kopieren
            </button>
            <button onClick={onClose}
              style={{flex:1,padding:"12px",borderRadius:12,border:"none",background:t.p,
                color:"#fff",fontWeight:800,cursor:"pointer",fontFamily:"inherit"}}>
              Schließen
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

/* =================================================================
   FELD PLAN VISUALISIERUNG
================================================================= */

export function FieldPlanView({ exercises, cl }) {
  const t = TH(cl);
  const ZONE_RECTS = {
    full:       {x:0,   y:0,   w:100, h:100},
    half_l:     {x:0,   y:0,   w:50,  h:100},
    half_r:     {x:50,  y:0,   w:50,  h:100},
    third_l:    {x:0,   y:0,   w:33,  h:100},
    third_m:    {x:33,  y:0,   w:34,  h:100},
    third_r:    {x:67,  y:0,   w:33,  h:100},
    quarter_tl: {x:0,   y:0,   w:50,  h:50 },
    quarter_tr: {x:50,  y:0,   w:50,  h:50 },
    quarter_bl: {x:0,   y:50,  w:50,  h:50 },
    quarter_br: {x:50,  y:50,  w:50,  h:50 },
    strafraum:  {x:25,  y:70,  w:50,  h:30 },
    mittelkreis:{x:30,  y:30,  w:40,  h:40 },
  };
  const W = 260, H = 160;

  return (
    <div style={{borderRadius:12,overflow:"hidden",border:"1.5px solid #e2e8f0"}}>
      <svg width="100%" viewBox={`0 0 ${W} ${H}`} style={{display:"block"}}>
        {/* Rasen Hintergrund */}
        <rect width={W} height={H} fill="#16a34a" opacity=".85"/>
        {Array.from({length:6},(_,i)=>(
          <rect key={i} x={0} y={H/6*i} width={W} height={H/12} fill="rgba(0,0,0,.05)"/>
        ))}
        {/* Feldlinien */}
        <rect x={W*.04} y={H*.06} width={W*.92} height={H*.88} rx="2" fill="none" stroke="white" strokeWidth="1.5" opacity=".6"/>
        <line x1={W/2} y1={H*.06} x2={W/2} y2={H*.94} stroke="white" strokeWidth="1" opacity=".4"/>
        <circle cx={W/2} cy={H/2} r={Math.min(W,H)*.1} fill="none" stroke="white" strokeWidth="1" opacity=".4"/>

        {/* Übungs-Zonen */}
        {exercises.filter(ex=>ex.zone&&ZONE_RECTS[ex.zone]).map((ex,i)=>{
          const zr = ZONE_RECTS[ex.zone];
          const cat = EXERCISE_CATS.find(c=>c.id===ex.cat)||EXERCISE_CATS[0];
          const colors = ["#3b82f6","#dc2626","#f59e0b","#7c3aed","#ec4899","#14b8a6"];
          const col = colors[i%colors.length];
          const x = W * zr.x/100;
          const y = H * zr.y/100;
          const w = W * zr.w/100;
          const h = H * zr.h/100;
          return (
            <g key={i}>
              <rect x={x+3} y={y+3} width={w-6} height={h-6} rx="3"
                fill={col} opacity=".4" stroke={col} strokeWidth="1.5" strokeDasharray="4,2"/>
              <text x={x+w/2} y={y+h/2-4} textAnchor="middle"
                fontSize="8" fontWeight="800" fill="white">
                {(ex.name||"").slice(0,12)}
              </text>
              <text x={x+w/2} y={y+h/2+7} textAnchor="middle"
                fontSize="7" fill="white" opacity=".8">
                {ex.duration||0} Min
              </text>
            </g>
          );
        })}
      </svg>
    </div>
  );
}

/* =================================================================
   PLAN EDITOR
================================================================= */

export function PlanEditor({ plan, cid, myTids, data, save, fire, cl, onClose }) {
  const t = TH(cl);
  const [name, setName] = useState(plan?.name||"");
  const [tid, setTid]   = useState(plan?.tid||myTids[0]||"");
  const [exercises, setExercises] = useState(plan?.exercises||[]);
  const [showAddEx, setShowAddEx] = useState(false);
  const [editExIdx, setEditExIdx] = useState(null);
  const [showTplBrowser, setShowTplBrowser] = useState(false);
  const [showGen, setShowGen] = useState(false);
  const [previewEx, setPreviewEx] = useState(null); // Übung read-only ansehen (Ablauf/Details) vor dem Speichern
  // Dauer aus dem verknüpften – sonst dem nächsten – Trainingstermin des Teams ablesen.
  const evMinutes = e => { if(!e?.time||!e?.endTime) return null; const [h1,m1]=String(e.time).split(":").map(Number); const [h2,m2]=String(e.endTime).split(":").map(Number); const d=(h2*60+m2)-(h1*60+m1); return d>0?d:null; };
  const linkedEv = (plan?.id && (data.events||[]).find(e=>e.planId===plan.id))
    || (data.events||[]).filter(e=>e.type==="training"&&e.tid===tid&&e.date>=now())
        .sort((a,b)=>((a.date||"")+(a.time||"")).localeCompare((b.date||"")+(b.time||"")))[0]
    || null;
  const evDur = evMinutes(linkedEv);
  const [genDur, setGenDur] = useState(evDur||90);
  const [genFocus, setGenFocus] = useState("auto");
  const myTeams = (data.teams||[]).filter(tm=>myTids.includes(tm.id));
  const GEN_FOCI = [["auto","Auto (Förderlücken)"],["technik","Technik"],["taktik","Taktik"],["torschuss","Torschuss"],["spielform","Spielformen"],["kondition","Kondition"]];
  const durOpts = Array.from(new Set([...(evDur?[evDur]:[]),60,75,90,105])).sort((a,b)=>a-b);
  const doGenerate = () => {
    const tm = (data.teams||[]).find(x=>x.id===tid);
    const ageKey = CAT_TO_AGEKEY[tm?.cat] || CAT_TO_AGEKEY[tm?.name] || "all";
    const last = (data.trainingPlans||[]).filter(p=>p.tid===tid && p.id!==plan?.id && !p.isTemplate)
      .sort((a,b)=>(b.updatedAt||"").localeCompare(a.updatedAt||""))[0];
    const avoidIds = (last?.exercises||[]).map(e=>e.fromTemplate).filter(Boolean);
    let effFocus=genFocus;
    if(genFocus==="auto"){
      const present=linkedEv?Object.entries(linkedEv.votes||{}).filter(([,v])=>(typeof v==="object"?v.val:v)==="yes").map(([n])=>n):null;
      const tf=trainingFocusFor({ data, cl, tid, present });
      effFocus=AXIS_TO_FOCUS[tf.axis]||"auto";
      fire(`Auto-Schwerpunkt: ${tf.axis}${tf.basis==="anwesend"?` (auf ${tf.usedCount} Zusagen zugeschnitten)`:" (Kader-Basis)"}`);
    }
    const gen = generateTrainingPlan({ ageKey, targetMin:genDur, focus:effFocus, avoidIds, scores:drillScores(data, cid) });
    if(!gen.length){ fire("Keine passenden Übungen gefunden"); return; }
    if(exercises.length && typeof window!=="undefined" && !window.confirm("Bestehende Übungen durch den generierten Plan ersetzen?")) return;
    setExercises(gen);
    if(!name.trim()){ const fl=GEN_FOCI.find(f=>f[0]===genFocus)?.[1]||"Auto"; setName(`Auto-Plan · ${fl} · ${genDur} Min.`); }
    setShowGen(false);
    fire(`Plan generiert: ${gen.length} Übungen · ${gen.reduce((s,e)=>s+(e.duration||0),0)} Min.`);
  };

  const savePlan = () => {
    if(!name.trim()) return;
    const asTemplate = !!(plan?.isTemplate);
    const shareWithAll = !!(plan?.shared);
    const rec = { id:plan?.id||uid(), cid, tid, name:name.trim(), exercises, updatedAt:new Date().toISOString(), isTemplate:asTemplate, shared:shareWithAll };
    const plans = data.trainingPlans||[];
    const next = plan ? plans.map(p=>p.id===plan.id?rec:p) : [...plans,rec];
    save({...data, trainingPlans:next});
    fire(plan?"Plan aktualisiert":"Trainingsplan erstellt");
    onClose();
  };
  const delPlan = () => {
    save({...data, trainingPlans:(data.trainingPlans||[]).filter(p=>p.id!==plan?.id)});
    fire("Plan gelöscht"); onClose();
  };
  const delEx = idx => setExercises(ex=>ex.filter((_,i)=>i!==idx));
  const moveEx = (idx,dir) => {
    const arr=[...exercises]; const to=idx+dir;
    if(to<0||to>=arr.length) return;
    [arr[idx],arr[to]]=[arr[to],arr[idx]]; setExercises(arr);
  };
  const totalMins = exercises.reduce((s,e)=>s+(e.duration||0),0);

  return (
    <div style={{position:"fixed",inset:0,background:"rgba(0,0,0,.6)",zIndex:900,
      display:"flex",alignItems:"flex-end",justifyContent:"center",backdropFilter:"blur(6px)"}}>
      <div style={{background:"#fff",borderRadius:"22px 22px 0 0",width:"100%",
        maxWidth:520,maxHeight:"90dvh",display:"flex",flexDirection:"column"}}>

        <div style={{background:t.p,padding:"16px 20px 14px",flexShrink:0,borderRadius:"22px 22px 0 0"}}>
          <div style={{display:"flex",alignItems:"center",gap:10}}>
            <div style={{flex:1,color:"#fff",fontWeight:900,fontSize:18}}>
              {plan?"Plan bearbeiten":"Neuer Trainingsplan"}
            </div>
            <button onClick={onClose} style={{width:32,height:32,borderRadius:10,
              background:"rgba(255,255,255,.2)",border:"none",color:"#fff",
              cursor:"pointer",fontSize:18,fontWeight:700}}>x</button>
          </div>
        </div>

        <div style={{flex:1,overflowY:"auto",padding:"16px 20px 0"}}>
          <input value={name} onChange={e=>setName(e.target.value)} placeholder="Name des Trainingsplans"
            style={{width:"100%",padding:"12px 14px",fontSize:15,fontWeight:700,
              border:`1.5px solid ${name?"#16a34a":"#e2e8f0"}`,borderRadius:12,
              outline:"none",marginBottom:12,boxSizing:"border-box"}}/>

          {myTeams.length>1&&(
            <select value={tid} onChange={e=>setTid(e.target.value)}
              style={{width:"100%",padding:"11px 14px",fontSize:14,border:"1.5px solid #e2e8f0",
                borderRadius:12,outline:"none",marginBottom:12,boxSizing:"border-box"}}>
              {myTeams.map(tm=><option key={tm.id} value={tm.id}>{tm.name}</option>)}
            </select>
          )}

          {/* Übungen */}
          <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:8}}>
            <div style={{fontWeight:700,fontSize:13,color:"#64748b"}}>
              {exercises.length} Übungen  {totalMins} Min.
            </div>
            <div style={{display:"flex",gap:7}}>
              <button onClick={()=>{ const nx=!showGen; setShowGen(nx); if(nx&&evDur) setGenDur(evDur); }}
                style={{padding:"7px 12px",borderRadius:9,border:`1.5px solid ${t.p}`,background:showGen?t.p:t.p+"12",color:showGen?"#fff":t.p,fontWeight:800,fontSize:12,cursor:"pointer",fontFamily:"inherit"}}>
                ✨ Auto-Plan
              </button>
              <button onClick={()=>setShowTplBrowser(true)}
                style={{padding:"7px 12px",borderRadius:9,border:"1.5px solid #e2e8f0",background:"#f8fafc",color:"#475569",fontWeight:700,fontSize:12,cursor:"pointer",fontFamily:"inherit"}}>
                Bibliothek
              </button>
              <button onClick={()=>{setEditExIdx(null);setShowAddEx(true);}}
                style={{padding:"7px 14px",borderRadius:9,border:"none",background:t.p,
                  color:"#fff",fontWeight:700,fontSize:12,cursor:"pointer",fontFamily:"inherit"}}>
                + Eigene
              </button>
            </div>
          </div>

          {showGen&&(
            <div style={{border:`1.5px solid ${t.p}55`,background:t.p+"08",borderRadius:13,padding:"13px",marginBottom:12}}>
              <div style={{fontWeight:800,fontSize:13.5,color:"#0f172a",marginBottom:9}}>✨ Trainingsplan automatisch erstellen</div>
              {linkedEv&&(evDur
                ? <div style={{fontSize:11.5,color:"#3730a3",background:"#eef2ff",border:"1px solid #c7d2fe",borderRadius:9,padding:"7px 10px",marginBottom:9,fontWeight:600,lineHeight:1.45}}>🗓️ Dauer aus Termin {fmtD(linkedEv.date)}{linkedEv.time?`, ${linkedEv.time}–${linkedEv.endTime}`:""}: <b>{evDur} Min</b> übernommen – unten anpassbar.</div>
                : <div style={{fontSize:11.5,color:"#92400e",background:"#fef3c7",border:"1px solid #fde68a",borderRadius:9,padding:"7px 10px",marginBottom:9,fontWeight:600,lineHeight:1.45}}>🗓️ Termin {fmtD(linkedEv.date)} hat keine Endzeit – bitte Dauer wählen.</div>
              )}
              <div style={{fontSize:11.5,fontWeight:700,color:"#64748b",marginBottom:6}}>Dauer{evDur?" (🗓️ = aus Termin)":""}</div>
              <div style={{display:"flex",gap:6,marginBottom:11,flexWrap:"wrap"}}>
                {durOpts.map(m=>(
                  <button key={m} onClick={()=>setGenDur(m)} style={{flex:"1 0 60px",padding:"8px 0",borderRadius:9,border:`1.5px solid ${genDur===m?t.p:"#e2e8f0"}`,background:genDur===m?t.p:"#fff",color:genDur===m?"#fff":"#475569",fontWeight:700,fontSize:12.5,cursor:"pointer",fontFamily:"inherit"}}>{evDur===m?"🗓️ ":""}{m} Min</button>
                ))}
              </div>
              <div style={{fontSize:11.5,fontWeight:700,color:"#64748b",marginBottom:6}}>Schwerpunkt</div>
              <div style={{display:"flex",gap:6,flexWrap:"wrap",marginBottom:12}}>
                {GEN_FOCI.map(([id,lbl])=>(
                  <button key={id} onClick={()=>setGenFocus(id)} style={{padding:"6px 12px",borderRadius:99,border:`1.5px solid ${genFocus===id?t.p:"#e2e8f0"}`,background:genFocus===id?t.p+"16":"#fff",color:genFocus===id?t.p:"#64748b",fontWeight:700,fontSize:12,cursor:"pointer",fontFamily:"inherit"}}>{lbl}</button>
                ))}
              </div>
              <button onClick={doGenerate} style={{width:"100%",padding:"11px",borderRadius:11,border:"none",background:t.p,color:"#fff",fontWeight:800,fontSize:13.5,cursor:"pointer",fontFamily:"inherit"}}>✨ Plan generieren</button>
              <div style={{fontSize:10.5,color:"#64748b",marginTop:8,lineHeight:1.45}}>Aufwärmen → Hauptteil (Schwerpunkt) → Spielform – passend zum Alter des Teams und mit Belastungsaufbau. Alles bleibt danach frei anpassbar.</div>
            </div>
          )}

          {exercises.length===0&&(
            <div style={{textAlign:"center",padding:"28px",background:"#f8fafc",
              borderRadius:12,border:"1.5px dashed #e2e8f0",marginBottom:12}}>
              <p style={{color:"#64748b",margin:0,fontSize:13}}>Noch keine Übungen</p>
            </div>
          )}

          {exercises.map((ex,i)=>{
            const cat = EXERCISE_CATS.find(c=>c.id===ex.cat)||EXERCISE_CATS[0];
            return (
              <div key={i} style={{background:"#fff",borderRadius:13,border:`1.5px solid ${cat.col}40`,
                padding:"11px 13px",marginBottom:8}}>
                <div style={{display:"flex",alignItems:"center",gap:8}}>
                  <div style={{width:8,height:8,borderRadius:"50%",background:cat.col,flexShrink:0}}/>
                  <div onClick={()=>setPreviewEx(ex)} style={{flex:1,cursor:"pointer"}}>
                    <div style={{fontWeight:700,fontSize:13,color:"#0f172a"}}>{ex.name||"Übung"}</div>
                    <div style={{fontSize:11,color:"#64748b",marginTop:1}}>
                      {cat.label}  {ex.duration||0} Min.
                      {ex.zone&&"  "+FIELD_ZONES.find(z=>z.id===ex.zone)?.label}
                    </div>
                  </div>
                  <div style={{display:"flex",gap:4}}>
                    <button onClick={()=>setPreviewEx(ex)} title="Übung ansehen" style={{width:24,height:24,borderRadius:7,border:"1.5px solid #e2e8f0",background:"#fff",cursor:"pointer",fontSize:12}}>👁</button>
                    <button onClick={()=>moveEx(i,-1)} style={{width:24,height:24,borderRadius:7,border:"1.5px solid #e2e8f0",background:"#fff",cursor:"pointer",fontSize:11,fontWeight:700}}>^</button>
                    <button onClick={()=>moveEx(i,1)}  style={{width:24,height:24,borderRadius:7,border:"1.5px solid #e2e8f0",background:"#fff",cursor:"pointer",fontSize:11,fontWeight:700}}>v</button>
                    <button onClick={()=>{setEditExIdx(i);setShowAddEx(true);}} style={{width:24,height:24,borderRadius:7,background:"#eff6ff",border:"none",color:"#2563eb",cursor:"pointer",fontSize:11,fontWeight:700}}>E</button>
                    <button onClick={()=>delEx(i)} style={{width:24,height:24,borderRadius:7,background:"#fee2e2",border:"none",color:"#dc2626",cursor:"pointer",fontSize:11,fontWeight:800}}>x</button>
                  </div>
                </div>
                {(ex.material||[]).length>0&&(
                  <div style={{display:"flex",gap:5,flexWrap:"wrap",marginTop:7}}>
                    {ex.material.map((m,mi)=>{
                      const matDef=MATERIAL_CATALOG.find(x=>x.id===m.id);
                      const col=m.color?COLOR_HEX[m.color]||"#64748b":matDef?.col||"#64748b";
                      return (
                        <div key={mi} style={{background:col+"15",borderRadius:99,
                          padding:"2px 8px",fontSize:10,fontWeight:700,color:col}}>
                          {m.qty||1}x {m.label||matDef?.label}{m.color?" ("+m.color+")":""}
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })}
        </div>

        <div style={{padding:"12px 20px 32px",borderTop:"1px solid #f1f5f9",flexShrink:0,display:"flex",gap:9}}>
          {plan&&<button onClick={delPlan} style={{padding:"12px",borderRadius:12,border:"none",background:"#fee2e2",color:"#dc2626",fontWeight:700,cursor:"pointer",fontFamily:"inherit"}}>Löschen</button>}
          <button onClick={onClose} style={{flex:1,padding:"12px",borderRadius:12,border:"1.5px solid #e2e8f0",background:"#fff",fontWeight:700,cursor:"pointer",fontFamily:"inherit"}}>Abbrechen</button>
          <button onClick={savePlan} disabled={!name.trim()} style={{flex:2,padding:"12px",borderRadius:12,border:"none",background:name.trim()?t.p:"#e2e8f0",color:name.trim()?"#fff":"#64748b",fontWeight:800,cursor:"pointer",fontFamily:"inherit"}}>Speichern</button>
        </div>
      </div>

      {showTplBrowser&&<TemplateBrowser
        onSelect={tpl=>{
          const ex = {
            name:tpl.name, cat:tpl.cat||"technik",
            duration:tpl.duration||15, zone:tpl.fieldZone||"full",
            intensity:tpl.intensity||5, skills:tpl.skills||[],
            description:tpl.description||"", material:tpl.material||[],
            fromTemplate:tpl.id,
          };
          setExercises(arr=>[...arr,ex]);
          setShowTplBrowser(false);
          fire("Übung aus Bibliothek hinzugefügt: "+tpl.name);
        }}
        cid={cid} myTids={myTids} data={data} cl={cl}
        onClose={()=>setShowTplBrowser(false)}
      />}
      {showAddEx&&<ExerciseEditor
        ex={editExIdx!==null?exercises[editExIdx]:null}
        onSave={ex=>{
          if(editExIdx!==null) setExercises(arr=>arr.map((e,i)=>i===editExIdx?ex:e));
          else setExercises(arr=>[...arr,ex]);
          setShowAddEx(false); setEditExIdx(null);
        }}
        onClose={()=>{setShowAddEx(false);setEditExIdx(null);}}
        cl={cl}
      />}
      {previewEx&&(()=>{
        const tpl = previewEx.fromTemplate ? TRAINING_TEMPLATES.find(x=>x.id===previewEx.fromTemplate) : null;
        const merged = tpl
          ? {...tpl, duration:previewEx.duration||tpl.duration, material:(previewEx.material&&previewEx.material.length?previewEx.material:tpl.material)}
          : { name:previewEx.name||"Übung", cat:previewEx.cat, duration:previewEx.duration, intensity:previewEx.intensity||5, skills:previewEx.skills||[], description:previewEx.description||"Keine Beschreibung hinterlegt.", material:previewEx.material||[], fieldZone:previewEx.zone, age:[], minPlayers:previewEx.minPlayers };
        return <TemplateDetail tpl={merged} onBack={()=>setPreviewEx(null)} cl={cl}/>;
      })()}
    </div>
  );
}

/* =================================================================
   UEBUNG EDITOR
================================================================= */

export function ExerciseEditor({ ex, onSave, onClose, cl }) {
  const t = TH(cl);
  const [f, setF] = useState({
    name:ex?.name||"", cat:ex?.cat||"warmup",
    duration:ex?.duration||10, zone:ex?.zone||"full",
    description:ex?.description||"", material:ex?.material||[],
  });
  const u = p => setF(prev=>({...prev,...p}));
  const [showMat, setShowMat] = useState(false);
  const [matDraft, setMatDraft] = useState({id:"",qty:2,color:""});
  const matCats = [...new Set(MATERIAL_CATALOG.map(m=>m.cat))];

  const addMat = () => {
    if(!matDraft.id) return;
    const def = MATERIAL_CATALOG.find(m=>m.id===matDraft.id);
    const mat = {...matDraft, label:def?.label||matDraft.id, cat:def?.cat||"Sonstiges"};
    u({material:[...f.material,mat]});
    setMatDraft({id:"",qty:2,color:""});
    setShowMat(false);
  };
  const delMat = idx => u({material:f.material.filter((_,i)=>i!==idx)});

  return (
    <div style={{position:"fixed",inset:0,background:"rgba(0,0,0,.7)",zIndex:910,
      display:"flex",alignItems:"flex-end",justifyContent:"center"}}>
      <div style={{background:"#fff",borderRadius:"22px 22px 0 0",width:"100%",
        maxWidth:520,maxHeight:"88dvh",overflowY:"auto",paddingBottom:44}}>
        <div style={{background:t.p,padding:"16px 20px 14px",borderRadius:"22px 22px 0 0"}}>
          <div style={{display:"flex",alignItems:"center",gap:10}}>
            <div style={{flex:1,color:"#fff",fontWeight:900,fontSize:17}}>
              {ex?"Übung bearbeiten":"Neue Übung"}
            </div>
            <button onClick={onClose} style={{width:30,height:30,borderRadius:9,background:"rgba(255,255,255,.2)",border:"none",color:"#fff",cursor:"pointer",fontWeight:700}}>x</button>
          </div>
        </div>
        <div style={{padding:"16px 20px 0"}}>
          <input value={f.name} onChange={e=>u({name:e.target.value})} placeholder="Name der Übung"
            style={{width:"100%",padding:"12px 14px",fontSize:15,fontWeight:700,
              border:"1.5px solid #e2e8f0",borderRadius:12,outline:"none",
              marginBottom:12,boxSizing:"border-box"}}/>

          {/* Kategorie */}
          <div style={{fontSize:11,fontWeight:800,color:"#64748b",marginBottom:8}}>KATEGORIE</div>
          <div style={{display:"flex",gap:6,flexWrap:"wrap",marginBottom:12}}>
            {EXERCISE_CATS.map(cat=>(
              <button key={cat.id} onClick={()=>u({cat:cat.id})}
                style={{padding:"7px 12px",borderRadius:99,border:`2px solid ${f.cat===cat.id?cat.col:"#e2e8f0"}`,
                  background:f.cat===cat.id?cat.bg:"#fff",color:f.cat===cat.id?cat.col:"#64748b",
                  fontWeight:f.cat===cat.id?800:600,fontSize:12,cursor:"pointer",fontFamily:"inherit"}}>
                {cat.label}
              </button>
            ))}
          </div>

          {/* Dauer */}
          <div style={{display:"flex",alignItems:"center",gap:12,marginBottom:12}}>
            <div style={{fontSize:11,fontWeight:800,color:"#64748b"}}>DAUER</div>
            <div style={{display:"flex",alignItems:"center",gap:8,flex:1,justifyContent:"center"}}>
              <button onClick={()=>u({duration:Math.max(5,f.duration-5)})}
                style={{width:34,height:34,borderRadius:10,border:"1.5px solid #e2e8f0",background:"#f8fafc",cursor:"pointer",fontSize:18,fontWeight:800}}>-</button>
              <span style={{fontWeight:900,fontSize:22,color:t.p,minWidth:60,textAlign:"center"}}>{f.duration} Min</span>
              <button onClick={()=>u({duration:Math.min(60,f.duration+5)})}
                style={{width:34,height:34,borderRadius:10,border:"1.5px solid #e2e8f0",background:"#f8fafc",cursor:"pointer",fontSize:18,fontWeight:800}}>+</button>
            </div>
          </div>

          {/* Feldzone */}
          <div style={{fontSize:11,fontWeight:800,color:"#64748b",marginBottom:8}}>BEREICH AUF DEM FELD</div>
          <select value={f.zone} onChange={e=>u({zone:e.target.value})}
            style={{width:"100%",padding:"11px 14px",fontSize:14,border:"1.5px solid #e2e8f0",
              borderRadius:12,outline:"none",marginBottom:12,boxSizing:"border-box"}}>
            {FIELD_ZONES.map(z=><option key={z.id} value={z.id}>{z.label}</option>)}
          </select>

          {/* Material */}
          <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:8}}>
            <div style={{fontSize:11,fontWeight:800,color:"#64748b"}}>MATERIAL</div>
            <button onClick={()=>setShowMat(true)}
              style={{padding:"5px 12px",borderRadius:8,border:"none",background:t.p+"18",
                color:t.p,fontWeight:700,fontSize:12,cursor:"pointer",fontFamily:"inherit"}}>
              + Hinzufügen
            </button>
          </div>
          {f.material.length===0&&(
            <div style={{padding:"12px",background:"#f8fafc",borderRadius:10,
              border:"1.5px dashed #e2e8f0",marginBottom:12,textAlign:"center",
              fontSize:12,color:"#64748b"}}>
              Kein Material eingetragen
            </div>
          )}
          <div style={{display:"flex",flexWrap:"wrap",gap:6,marginBottom:12}}>
            {f.material.map((m,i)=>{
              const def=MATERIAL_CATALOG.find(x=>x.id===m.id);
              const col=m.color?COLOR_HEX[m.color]||"#64748b":def?.col||"#64748b";
              return (
                <div key={i} style={{display:"flex",alignItems:"center",gap:5,
                  background:col+"15",borderRadius:99,padding:"5px 10px"}}>
                  <span style={{fontSize:12,fontWeight:700,color:col}}>
                    {m.qty||1}x {m.label||def?.label}{m.color?" ("+m.color+")":""}
                  </span>
                  <button onClick={()=>delMat(i)}
                    style={{width:16,height:16,borderRadius:"50%",background:col,
                      border:"none",color:"#fff",fontSize:10,cursor:"pointer",
                      display:"flex",alignItems:"center",justifyContent:"center",fontWeight:800}}>
                    x
                  </button>
                </div>
              );
            })}
          </div>

          {/* Material Auswahl */}
          {showMat&&(
            <div style={{background:"#f8fafc",borderRadius:14,padding:"14px",
              border:"1.5px solid #e2e8f0",marginBottom:12}}>
              <div style={{fontSize:11,fontWeight:800,color:"#64748b",marginBottom:8}}>MATERIAL WÄHLEN</div>
              {matCats.map(cat=>(
                <div key={cat} style={{marginBottom:10}}>
                  <div style={{fontSize:10,color:"#64748b",fontWeight:700,marginBottom:5}}>{cat.toUpperCase()}</div>
                  <div style={{display:"flex",flexWrap:"wrap",gap:5}}>
                    {MATERIAL_CATALOG.filter(m=>m.cat===cat).map(m=>(
                      <button key={m.id} onClick={()=>setMatDraft(p=>({...p,id:m.id}))}
                        style={{padding:"5px 10px",borderRadius:8,
                          border:`1.5px solid ${matDraft.id===m.id?m.col:"#e2e8f0"}`,
                          background:matDraft.id===m.id?m.col+"15":"#fff",
                          color:matDraft.id===m.id?m.col:"#475569",
                          fontWeight:matDraft.id===m.id?700:500,fontSize:12,
                          cursor:"pointer",fontFamily:"inherit"}}>
                        {m.icon} {m.label}
                      </button>
                    ))}
                  </div>
                </div>
              ))}
              {matDraft.id&&(()=>{
                const def=MATERIAL_CATALOG.find(m=>m.id===matDraft.id);
                return (
                  <div style={{display:"flex",gap:8,alignItems:"center",marginTop:10,flexWrap:"wrap"}}>
                    <div style={{display:"flex",alignItems:"center",gap:6}}>
                      <button onClick={()=>setMatDraft(p=>({...p,qty:Math.max(1,(p.qty||1)-1)}))}>-</button>
                      <span style={{fontWeight:800,fontSize:16,minWidth:30,textAlign:"center"}}>{matDraft.qty||1}</span>
                      <button onClick={()=>setMatDraft(p=>({...p,qty:(p.qty||1)+1}))}>+</button>
                    </div>
                    {def?.canColor&&(
                      <select value={matDraft.color||""} onChange={e=>setMatDraft(p=>({...p,color:e.target.value}))}
                        style={{padding:"6px 10px",fontSize:13,border:"1.5px solid #e2e8f0",borderRadius:9,outline:"none"}}>
                        <option value="">Farbe (optional)</option>
                        {COLORS_DE.map(col=><option key={col} value={col}>{col}</option>)}
                      </select>
                    )}
                    <button onClick={addMat}
                      style={{padding:"7px 14px",borderRadius:9,border:"none",background:t.p,
                        color:"#fff",fontWeight:700,fontSize:13,cursor:"pointer",fontFamily:"inherit"}}>
                      Hinzufügen
                    </button>
                  </div>
                );
              })()}
            </div>
          )}
        </div>

        <div style={{padding:"12px 20px 0",display:"flex",gap:9}}>
          <button onClick={onClose} style={{flex:1,padding:"12px",borderRadius:12,border:"1.5px solid #e2e8f0",background:"#fff",fontWeight:700,cursor:"pointer",fontFamily:"inherit"}}>Abbrechen</button>
          <button onClick={()=>onSave(f)} disabled={!f.name.trim()}
            style={{flex:2,padding:"12px",borderRadius:12,border:"none",
              background:f.name.trim()?t.p:"#e2e8f0",
              color:f.name.trim()?"#fff":"#64748b",
              fontWeight:800,cursor:"pointer",fontFamily:"inherit"}}>
            Übung speichern
          </button>
        </div>
      </div>
    </div>
  );
}

// Template Browser Komponente
export function TemplateBrowser({ onSelect, cid, myTids, data, cl, onClose }) {
  const t = TH(cl);
  const [filter, setFilter] = useState("all");
  const [ageFilter, setAgeFilter] = useState("all");
  const [search, setSearch] = useState("");
  const [detail, setDetail] = useState(null);

  // Custom Templates dieses Vereins
  const customTemplates = (data.trainingPlans||[])
    .filter(p=>p.isTemplate&&(p.cid===cid||p.shared))
    .map(p=>({...p, isCustom:true}));

  const allTemplates = [...TRAINING_TEMPLATES, ...customTemplates];

  const filtered = allTemplates.filter(tpl => {
    const catOk = filter==="all" || tpl.cat===filter;
    const ageOk = ageFilter==="all" || (tpl.age||[]).includes(ageFilter);
    const searchOk = !search || tpl.name.toLowerCase().includes(search.toLowerCase())
      || tpl.description?.toLowerCase().includes(search.toLowerCase());
    return catOk && ageOk && searchOk;
  });

  const CATS = [
    {id:"all",     label:"Alle",          col:"#334155"},
    {id:"warmup",  label:"Aufwärmen",    col:"#f59e0b"},
    {id:"technik", label:"Technik",       col:"#2563eb"},
    {id:"taktik",  label:"Taktik",        col:"#7c3aed"},
    {id:"kondition",label:"Kondition",    col:"#dc2626"},
    {id:"spielform",label:"Spielformen",  col:"#16a34a"},
    {id:"spezial", label:"Spezial",       col:"#0891b2"},
  ];

  const AGE_OPTS = [
    {id:"all",      label:"Alle Altersgruppen"},
    {id:"bambini",  label:"Bambini"},
    {id:"g",        label:"G-Jugend"},
    {id:"f",        label:"F-Jugend"},
    {id:"e",        label:"E-Jugend"},
    {id:"d",        label:"D-Jugend"},
    {id:"c",        label:"C-Jugend"},
    {id:"ba",       label:"B/A-Jugend"},
    {id:"senioren", label:"Senioren"},
    {id:"altherren",label:"Alt-Herren"},
  ];

  const catConf = (id) => CATS.find(c=>c.id===id)||CATS[0];

  if(detail) return <TemplateDetail tpl={detail} onBack={()=>setDetail(null)}
    onUse={()=>{onSelect(detail);}} cl={cl}/>;

  return (
    <div style={{position:"fixed",inset:0,background:"rgba(0,0,0,.6)",zIndex:920,
      display:"flex",alignItems:"flex-end",justifyContent:"center",backdropFilter:"blur(6px)"}}>
      <div style={{background:"#fff",borderRadius:"22px 22px 0 0",width:"100%",
        maxWidth:520,maxHeight:"90dvh",display:"flex",flexDirection:"column"}}>

        <div style={{background:t.p,padding:"16px 20px 14px",flexShrink:0,borderRadius:"22px 22px 0 0"}}>
          <div style={{display:"flex",alignItems:"center",gap:10,marginBottom:12}}>
            <div style={{flex:1,color:"#fff",fontWeight:900,fontSize:18}}>Vorlagen-Bibliothek</div>
            <button onClick={onClose} style={{width:32,height:32,borderRadius:10,
              background:"rgba(255,255,255,.2)",border:"none",color:"#fff",
              cursor:"pointer",fontSize:18,fontWeight:700}}>x</button>
          </div>
          <input value={search} onChange={e=>setSearch(e.target.value)}
            placeholder="Übung suchen..."
            style={{width:"100%",padding:"9px 14px",borderRadius:11,border:"none",
              fontSize:14,outline:"none",background:"rgba(255,255,255,.15)",
              color:"#fff",boxSizing:"border-box"}}/>
        </div>

        {/* Kategorie-Filter */}
        <div style={{display:"flex",gap:5,padding:"12px 16px 8px",overflowX:"auto",
          scrollbarWidth:"none",flexShrink:0,borderBottom:"1px solid #f1f5f9"}}>
          {CATS.map(cat=>(
            <button key={cat.id} onClick={()=>setFilter(cat.id)}
              style={{padding:"6px 12px",borderRadius:99,border:`2px solid ${filter===cat.id?cat.col:"#e2e8f0"}`,
                background:filter===cat.id?cat.col+"15":"#fff",color:filter===cat.id?cat.col:"#64748b",
                fontWeight:filter===cat.id?800:600,fontSize:12,cursor:"pointer",
                whiteSpace:"nowrap",fontFamily:"inherit",flexShrink:0}}>
              {cat.label}
            </button>
          ))}
        </div>

        {/* Alters-Filter */}
        <div style={{padding:"8px 16px",flexShrink:0,borderBottom:"1px solid #f1f5f9"}}>
          <select value={ageFilter} onChange={e=>setAgeFilter(e.target.value)}
            style={{padding:"7px 12px",fontSize:13,border:"1.5px solid #e2e8f0",
              borderRadius:9,outline:"none",background:"#fff",fontFamily:"inherit",width:"100%"}}>
            {AGE_OPTS.map(a=><option key={a.id} value={a.id}>{a.label}</option>)}
          </select>
        </div>

        {/* Template Liste */}
        <div style={{flex:1,overflowY:"auto",padding:"12px 16px"}}>
          <div style={{fontSize:11,color:"#64748b",fontWeight:600,marginBottom:10}}>
            {filtered.length} Vorlage{filtered.length!==1?"n":""}
          </div>
          {filtered.map(tpl=>{
            const cc = catConf(tpl.cat);
            const stats = calcPlanStats(tpl.exercises||[{duration:tpl.duration,intensity:tpl.intensity,skills:tpl.skills}]);
            const intensityLabel = tpl.intensity<=3?"Gering":tpl.intensity<=6?"Mittel":tpl.intensity<=8?"Hoch":"Maximal";
            return (
              <div key={tpl.id} style={{background:"#fff",borderRadius:14,
                border:"1.5px solid #e2e8f0",marginBottom:10,overflow:"hidden",
                cursor:"pointer"}} onClick={()=>setDetail(tpl)}>
                <div style={{display:"flex",alignItems:"flex-start",gap:10,padding:"12px 14px"}}>
                  <div style={{width:40,height:40,borderRadius:11,background:cc.col+"15",
                    display:"flex",alignItems:"center",justifyContent:"center",
                    fontWeight:900,fontSize:15,color:cc.col,flexShrink:0}}>
                    {cc.label.slice(0,1)}
                  </div>
                  <div style={{flex:1,minWidth:0}}>
                    <div style={{fontWeight:800,fontSize:14,color:"#0f172a"}}>{tpl.name}</div>
                    <div style={{fontSize:11,color:"#64748b",marginTop:2,display:"flex",gap:8,flexWrap:"wrap"}}>
                      <span>{tpl.duration} Min.</span>
                      <span style={{color:tpl.intensity>=8?"#dc2626":tpl.intensity>=5?"#d97706":"#16a34a",fontWeight:700}}>
                        {intensityLabel}
                      </span>
                      {tpl.isCustom&&<span style={{background:"#eff6ff",color:"#2563eb",borderRadius:99,padding:"0 6px",fontWeight:700}}>Eigene</span>}
                    </div>
                    {/* Skill-Tags */}
                    <div style={{display:"flex",gap:4,flexWrap:"wrap",marginTop:6}}>
                      {(tpl.skills||[]).slice(0,3).map(skill=>{
                        const sk = SKILLS[skill];
                        return sk ? (
                          <span key={skill} style={{background:sk.col+"15",color:sk.col,
                            borderRadius:99,padding:"2px 7px",fontSize:10,fontWeight:700}}>
                            {sk.label}
                          </span>
                        ) : null;
                      })}
                    </div>
                  </div>
                  <div style={{textAlign:"right",flexShrink:0}}>
                    {/* Intensitäts-Balken */}
                    <div style={{display:"flex",gap:2,marginBottom:4}}>
                      {Array.from({length:5},(_,i)=>(
                        <div key={i} style={{width:5,height:14,borderRadius:3,
                          background:(i+1)*2<=tpl.intensity
                            ?tpl.intensity>=8?"#dc2626":tpl.intensity>=5?"#d97706":"#16a34a"
                            :"#e2e8f0"}}/>
                      ))}
                    </div>
                    <div style={{fontSize:10,color:"#64748b"}}>
                      {(tpl.age||[]).length>0?(tpl.age||[]).slice(0,2).join(", "):"Alle"}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
          {filtered.length===0&&(
            <div style={{textAlign:"center",padding:"34px 22px",background:"#f8fafc",
              borderRadius:16,border:"1.5px dashed #e2e8f0"}}>
              <div style={{fontSize:34,marginBottom:8}}>🔍</div>
              <p style={{fontWeight:800,color:"#334155",margin:"0 0 4px",fontSize:15}}>Keine Vorlage für diese Auswahl</p>
              <p style={{fontSize:13,color:"#64748b",margin:"0 0 16px",lineHeight:1.5}}>
                {ageFilter!=="all"?`Für „${(AGE_OPTS.find(a=>a.id===ageFilter)||{}).label}" gibt es hier gerade nichts. `:""}Versuch eine andere Alters- oder Kategorie-Auswahl.
              </p>
              {(filter!=="all"||ageFilter!=="all"||search)&&(
                <button onClick={()=>{setFilter("all");setAgeFilter("all");setSearch("");}}
                  style={{padding:"10px 18px",borderRadius:11,border:"none",background:t.p,color:contrast(t.p),fontWeight:800,fontSize:13.5,cursor:"pointer",fontFamily:"inherit"}}>
                  Filter zurücksetzen
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// Automatische Schema-Animation für Übungen ohne gezeichnetes Diagramm.
// Läuft per SVG-SMIL in Endlosschleife (kein Play-Button nötig). Erkennt den
// Übungstyp und zeigt einen sinnvollen Ablauf – Ball nur, wenn die Übung einen nutzt.
export function DrillAutoAnim({ drill, color="#16a34a" }){
  const vw=100, vh=64;
  const s=((drill?.name||"")+" "+((drill?.skills||[]).join(" "))+" "+(drill?.description||"")+" "+(drill?.cat||"")).toLowerCase();
  const mat=((drill?.material||[]).map(m=>(m.label||m.id||"")).join(" ")).toLowerCase();
  const all=s+" "+mat;
  const hasBall=/ball|dribbl|pass|tippen|jonglier|hochhalt|innenseite|ballführ|ballkontrolle|technik|schuss|kombinat|rondo|zuspiel|flanke|finten/.test(s);
  const hasGoal=/\btor\b|tore|minitor|abschluss|schuss|torschuss/.test(all);
  const usePole=/stange|pylon|pilon|slalomstange|stab/.test(all);   // Stangen statt Hütchen
  const isShot=/torschuss|torabschluss|abschluss|abschlüsse|abschluesse|finish|distanzschuss|volley|\bschuss\b|\bschüsse\b|schiess|aufs tor/.test(s);
  const isTactic=(drill?.cat==="taktik") || /raumauf|raum nutzen|breit machen|breite nutzen|verschieb|verlager|umschalt|spielaufbau|spielintelligenz|überzahl|ueberzahl|unterzahl|freilaufen|anbieten|gegenpress|kompakt|staffelung/.test(s);
  const type = DRILL_ANIM[drill?.id] || (
      /fang|abschlag|freilös|freiloes|jäger|jaeger|versteiner|hasche|nachlauf|kettenfang/.test(s) ? "tag"
    : /staffel|positionswechsel|nachrück|nachrueck|rotation|durchlauf|folge deinem|pass.?und.?lauf|laufstaffel/.test(s) ? "relay"
    : (/dribbl|slalom|parcours|hindernis/.test(s) && isShot) ? "dribshot"
    : /\d ?gegen ?\d|kleinfeld|spielform|abschlussspiel|funino/.test(s) ? "game"
    : isTactic ? "tactic"
    : isShot ? "shot"
    : /dribbl|slalom|finten|1 ?gegen ?1|tempodrib|hindernis|parcours/.test(s) ? "dribble"
    : /pass|kombination|ballzirk|rondo|doppelpass|zuspiel/.test(s) ? "pass"
    : /lauf|sprint|ausdauer|intervall|tempolauf|shuttle|pendel|kondition|antritt|wendigkeit/.test(s) ? "run"
    : "free");
  const Pitch=({children})=>(
    <svg viewBox={`0 0 ${vw} ${vh}`} style={{width:"100%",height:"auto",display:"block",borderRadius:12,background:"linear-gradient(#2f8050,#246a42)"}}>
      <defs><marker id="dah" markerUnits="userSpaceOnUse" markerWidth="6" markerHeight="6" refX="3" refY="2.2" orient="auto"><path d="M0,0 L4.5,2.2 L0,4.4 Z" fill="#fde047"/></marker></defs>
      <rect x="1" y="1" width={vw-2} height={vh-2} rx="2" fill="none" stroke="rgba(255,255,255,.45)" strokeWidth="0.5"/>
      <line x1="1" y1={vh/2} x2={vw-1} y2={vh/2} stroke="rgba(255,255,255,.28)" strokeWidth="0.4"/>
      <circle cx={vw/2} cy={vh/2} r="7" fill="none" stroke="rgba(255,255,255,.28)" strokeWidth="0.4"/>
      {children}
    </svg>
  );
  const P=({x,y,n,fill})=>(<g><circle cx={x} cy={y} r="3.2" fill={fill||color} stroke="#fff" strokeWidth="0.6"/>{n!=null&&<text x={x} y={y+1.15} textAnchor="middle" fontSize="3.2" fontWeight="800" fill="#fff">{n}</text>}</g>);
  // Hütchen/Pylone (orange Kegel) bzw. Slalomstange (rote Stange mit Fuß).
  const Cone=({x,y})=>(<polygon points={`${x},${y-2.4} ${x-1.9},${y+1.8} ${x+1.9},${y+1.8}`} fill="#f59e0b" stroke="#b45309" strokeWidth="0.25"/>);
  const Pole=({x,y})=>(<g><ellipse cx={x} cy={y+0.4} rx="1.6" ry="0.7" fill="rgba(0,0,0,.3)"/><line x1={x} y1={y} x2={x} y2={y-6.5} stroke="#dc2626" strokeWidth="1" strokeLinecap="round"/><line x1={x} y1={y-2.2} x2={x} y2={y-3.6} stroke="#fff" strokeWidth="1" strokeLinecap="round"/></g>);
  const Goal=({x=40,w=20,y=2,flip})=>(<g><rect x={x} y={flip?y-3:y} width={w} height="3" fill="none" stroke="#fff" strokeWidth="0.7"/><line x1={x} y1={y} x2={x} y2={flip?y-3:y+3} stroke="#fff" strokeWidth="0.7"/><line x1={x+w} y1={y} x2={x+w} y2={flip?y-3:y+3} stroke="#fff" strokeWidth="0.7"/></g>);
  const Flag=({x,y})=>(<g><line x1={x} y1={y} x2={x} y2={y-5} stroke="#fff" strokeWidth="0.5"/><polygon points={`${x},${y-5} ${x+3},${y-4} ${x},${y-3}`} fill="#ef4444"/></g>);
  const FootBall=({x,y})=>(<g><circle cx={x} cy={y} r="1.9" fill="#fff" stroke="#0f172a" strokeWidth="0.5"/><circle cx={x} cy={y} r="0.7" fill="#0f172a"/></g>);
  const Ball=({path,dur,begin})=>(<g><animateMotion dur={`${dur}s`} repeatCount="indefinite" path={path} calcMode="linear" begin={begin||"0s"}/><circle cx="0" cy="0" r="1.9" fill="#fff" stroke="#0f172a" strokeWidth="0.5"/><circle cx="0" cy="0" r="0.7" fill="#0f172a"/></g>);
  // Bewegte Figur entlang eines Pfads (optional mit Ball am Fuß).
  const Mover=({path,dur,n,fill,ball,begin})=>(<g>
    <animateMotion dur={`${dur}s`} repeatCount="indefinite" path={path} calcMode="linear" begin={begin||"0s"}/>
    <circle cx="0" cy="0" r="3.2" fill={fill||color} stroke="#fff" strokeWidth="0.6"/>
    <text x="0" y="1.15" textAnchor="middle" fontSize="3.2" fontWeight="800" fill="#fff">{n}</text>
    {ball&&<><circle cx="2.6" cy="2.6" r="1.6" fill="#fff" stroke="#0f172a" strokeWidth="0.5"/><circle cx="2.6" cy="2.6" r="0.6" fill="#0f172a"/></>}
  </g>);
  const Gate=usePole?Pole:Cone;          // Slalom-Hindernis je nach Material
  let scene=null;
  if(type==="tag"){            // Fangspiel: Fänger (rot) jagt, andere laufen frei – ohne Ball
    scene=<>
      <Mover path="M25,18 L46,40 L20,50 L40,22 L25,18" dur={4.2} n={1}/>
      <Mover path="M78,20 L56,44 L82,50 L60,22 L78,20" dur={4.8} n={2}/>
      <Mover path="M52,14 L72,34 L46,52 L30,30 L52,14" dur={5.4} n={3}/>
      <Mover path="M50,32 L28,24 L55,46 L78,30 L40,40 L50,32" dur={3.8} n="F" fill="#dc2626"/>
    </>;
  } else if(type==="relay"){   // Passstaffel/Positionswechsel: Pass spielen und dem Pass nachlaufen
    // Wichtig: NICHT alle gleichzeitig. Stationen warten, immer nur EIN Spieler
    // läuft – zeitversetzt seinem Pass hinterher (Ball voraus, Läufer trabt nach).
    const A=[20,49],B=[50,13],C=[80,49];
    const path=`M${A[0]},${A[1]} L${B[0]},${B[1]} L${C[0]},${C[1]} L${A[0]},${A[1]}`;
    scene=<>
      <line x1={A[0]} y1={A[1]} x2={B[0]} y2={B[1]} stroke="#fde047" strokeWidth="0.55" strokeDasharray="2 1.6" opacity="0.5" markerEnd="url(#dah)"/>
      <line x1={B[0]} y1={B[1]} x2={C[0]} y2={C[1]} stroke="#fde047" strokeWidth="0.55" strokeDasharray="2 1.6" opacity="0.5" markerEnd="url(#dah)"/>
      <line x1={C[0]} y1={C[1]} x2={A[0]} y2={A[1]} stroke="#fde047" strokeWidth="0.55" strokeDasharray="2 1.6" opacity="0.5" markerEnd="url(#dah)"/>
      <Cone x={A[0]} y={A[1]+4}/><Cone x={B[0]} y={B[1]-4}/><Cone x={C[0]} y={C[1]+4}/>
      {/* Stationen / Warteschlange – stehen, bis sie an der Reihe sind */}
      <P x={A[0]} y={A[1]} n={1}/><P x={B[0]} y={B[1]} n={2}/><P x={C[0]} y={C[1]} n={3}/>
      {/* genau EIN Läufer, leicht hinter dem Ball (Zeitversatz) */}
      <Mover path={path} dur={6} n="" fill="#0ea5e9" begin="0.5s"/>
      <Ball path={path} dur={6}/>
    </>;
  } else if(type==="tactic"){  // Taktik/Raum nutzen: breit machen & Seitenverlagerung über die Breite
    scene=<>
      <Goal/>
      {/* Pfeile: Außenspieler ziehen in die Breite */}
      <line x1="44" y1="34" x2="22" y2="29" stroke="#fde047" strokeWidth="0.5" strokeDasharray="2 1.6" opacity="0.55" markerEnd="url(#dah)"/>
      <line x1="56" y1="34" x2="78" y2="29" stroke="#fde047" strokeWidth="0.5" strokeDasharray="2 1.6" opacity="0.55" markerEnd="url(#dah)"/>
      <P x={50} y={52} n={6}/>                                   {/* Aufbauspieler */}
      <P x={50} y={20} n={9}/>                                   {/* zentral vorn */}
      <Mover path="M44,34 L22,29 L44,34" dur={5} n={7}/>          {/* macht links breit */}
      <Mover path="M56,34 L78,29 L56,34" dur={5} n={11}/>         {/* macht rechts breit */}
      {/* Ball wird über die Breite verlagert (Seitenwechsel) */}
      <Ball path="M50,52 L22,29 L50,40 L78,29 L50,52" dur={6}/>
    </>;
  } else if(type==="dribshot"){ // Dribbling-Parcours mit Abschluss: Slalom durch Stangen, dann Tor
    scene=<>
      <Goal/>
      <Gate x={40} y={47}/><Gate x={58} y={39}/><Gate x={42} y={31}/><Gate x={54} y={23}/>
      <line x1="54" y1="23" x2="50" y2="6" stroke="#fde047" strokeWidth="0.55" strokeDasharray="2 1.6" opacity="0.6" markerEnd="url(#dah)"/>
      <Mover path="M50,55 L40,47 L58,39 L42,31 L54,23 L54,30 L50,55" dur={6} n={9}/>
      <Ball  path="M50,55 L40,47 L58,39 L42,31 L54,23 L50,5  L50,55" dur={6}/>
    </>;
  } else if(type==="pass"){
    scene=<>
      <Cone x={16} y={50}/><Cone x={50} y={9}/><Cone x={84} y={50}/>
      <P x={18} y={48} n={1}/><P x={50} y={12} n={2}/><P x={82} y={48} n={3}/>
      <P x={50} y={40} n="V" fill="#dc2626"/>
      <Ball path="M18,48 L50,12 L82,48 Z" dur={5}/>
    </>;
  } else if(type==="shot"){
    scene=<>
      <Goal/>
      <Cone x={26} y={54}/>
      <P x={50} y={6} n={1} fill="#0f172a"/>
      <P x={26} y={50} n={7}/>
      <Mover path="M52,46 L52,22 L52,46" dur={4} n={9}/>
      <Ball path="M26,50 L52,24 L50,5 L26,50" dur={4}/>
    </>;
  } else if(type==="dribble"){
    scene=<>
      <Gate x={35} y={16}/><Gate x={50} y={32}/><Gate x={65} y={16}/><Gate x={78} y={32}/>
      <Mover path="M16,48 L35,22 L50,38 L65,22 L78,38 L16,48" dur={5.5} n={1} ball/>
    </>;
  } else if(type==="game"){    // Spielform/Kleinfeldspiel: zwei Teams, zwei Tore
    scene=<>
      <Goal/>
      <Goal y={59} flip/>
      <P x={36} y={40} n={1}/><P x={62} y={34} n={2}/>
      <P x={42} y={26} n={1} fill="#dc2626"/><P x={64} y={44} n={2} fill="#dc2626"/>
      <Ball path="M36,40 L62,34 L50,9 L50,42 L40,52 L36,40" dur={6}/>
    </>;
  } else if(type==="duel"){    // 1 gegen 1: Angreifer dribbelt am Verteidiger vorbei zum Tor
    scene=<>
      <Goal/>
      <Mover path="M50,55 L43,40 L50,29 L58,19 L50,55" dur={5} n={9} ball/>
      <Mover path="M50,31 L44,31 L56,31 L50,31" dur={3} n={4} fill="#dc2626"/>
    </>;
  } else if(type==="press"){   // Pressing: Verteidiger rücken zum Ball (ballorientiert), zeitversetzt
    scene=<>
      <P x={50} y={40} n={10} fill="#dc2626"/><FootBall x={52.6} y={42}/>
      <Mover path="M24,18 L43,36 L24,18" dur={3} n={4}/>
      <Mover path="M76,20 L57,36 L76,20" dur={3.6} n={5}/>
      <Mover path="M50,12 L50,33 L50,12" dur={4.2} n={6}/>
    </>;
  } else if(type==="defend"){  // Verteidigen: Verteidiger bleibt zwischen Ball und Tor (goalside)
    scene=<>
      <Goal/>
      <Mover path="M30,53 L42,28 L30,53" dur={5.2} n={9} ball/>
      <Mover path="M44,40 L46,18 L44,40" dur={5.2} n={4} fill="#dc2626"/>
    </>;
  } else if(type==="header"){  // Kopfball: Flanke von außen, Kopfball aufs Tor
    scene=<>
      <Goal/>
      <P x={18} y={42} n={7}/>
      <Mover path="M54,32 L50,14 L54,32" dur={4} n={9}/>
      <Ball path="M18,42 L50,13 L50,4 L18,42" dur={4}/>
    </>;
  } else if(type==="corner"){  // Standard/Ecke: Flanke von der Eckfahne in den Strafraum
    scene=<>
      <Goal/>
      <Flag x={6} y={9}/>
      <Mover path="M40,32 L47,14 L40,32" dur={4} n={9}/>
      <Mover path="M62,32 L54,15 L62,32" dur={4} n={10}/>
      <Ball path="M7,8 L50,13 L50,4 L7,8" dur={4}/>
    </>;
  } else if(type==="keeper"){  // Torwart: Stellungsspiel/Reflexe – TW bewegt sich auf der Linie zu den Ecken
    scene=<>
      <Goal/>
      <Mover path="M43,5 L57,5 L43,5" dur={2.8} n={1} fill="#0f172a"/>
      <P x={50} y={42} n={9}/>
      <Ball path="M50,42 L43,5 L50,42 L57,5 L50,42" dur={4}/>
    </>;
  } else if(type==="juggle"){  // Ball hochhalten / Jonglieren: Ball auf und ab am Spieler
    scene=<>
      <P x={50} y={45} n={1}/>
      <ellipse cx="50" cy="47" rx="2.2" ry="0.7" fill="rgba(0,0,0,.28)"/>
      <g><animateMotion dur="1.3s" repeatCount="indefinite" path="M50,40 L50,16 L50,40" calcMode="linear"/><circle cx="0" cy="0" r="1.9" fill="#fff" stroke="#0f172a" strokeWidth="0.5"/><circle cx="0" cy="0" r="0.7" fill="#0f172a"/></g>
    </>;
  } else if(type==="team"){    // Teambuilding: Spieler bewegen sich gemeinsam koordiniert (im Kreis)
    {const path="M50,10 A20,20 0 1,1 50,50 A20,20 0 1,1 50,10"; const begins=["0s","-1.4s","-2.8s","-4.2s","-5.6s"];
    scene=<>
      <circle cx="50" cy="30" r="20" fill="none" stroke="rgba(255,255,255,.25)" strokeWidth="0.4" strokeDasharray="2 2"/>
      {begins.map((b,i)=><Mover key={i} path={path} dur={7} n={i+1} begin={b}/>)}
    </>;}
  } else if(type==="ladder"){  // Koordinationsleiter: schnelle Schritte durch die Leiter
    scene=<>
      <g stroke="#fde047" strokeWidth="0.4" opacity="0.8">
        <line x1="45" y1="12" x2="45" y2="52"/><line x1="55" y1="12" x2="55" y2="52"/>
        {[12,18,24,30,36,42,48,52].map(yy=><line key={yy} x1="45" y1={yy} x2="55" y2={yy}/>)}
      </g>
      <Cone x={50} y={9}/><Cone x={50} y={55}/>
      <Mover path="M50,55 L50,12 L50,55" dur={2.6} n={1}/>
    </>;
  } else {                     // freie Bewegung / Koordination – Ball nur wenn ballbasiert
    scene=<>
      <Mover path="M18,20 L45,46 L18,48 L45,18 L18,20" dur={5.4} n={1} ball={hasBall}/>
      <Mover path="M82,22 L55,46 L82,50 L55,18 L82,22" dur={6} n={2} ball={hasBall}/>
      <Mover path="M50,12 L30,34 L50,52 L70,34 L50,12" dur={6.4} n={3} ball={hasBall}/>
      <Mover path="M34,30 L66,30 L50,50 L34,30" dur={4.6} n={4} ball={hasBall}/>
    </>;
  }
  const gw=usePole?"Stangen":"Hütchen";
  const label={
    tag:"Fangspiel – der Fänger (rot) jagt, die anderen laufen frei",
    tactic:"Raum nutzen / breit machen – über die Breite spielen und verlagern",
    relay:"Passstaffel: immer nur EINER läuft – dem eigenen Pass hinterher (Positionswechsel)",
    dribshot:`Dribbling-Parcours durch ${gw} → Abschluss aufs Tor`,
    run:"Lauf/Tempo – Shuttle zwischen den Markierungen",
    pass:"Pass-Zirkulation (Rondo) – Ball läuft, Mitte verteidigt",
    shot:"Lauf → Steckpass → Torabschluss",
    dribble:`Dribbling-Parcours (Slalom durch ${gw})`,
    game:"Spielform: zwei Teams, zwei Tore – frei spielen",
    duel:"1 gegen 1: Angreifer dribbelt am Verteidiger (rot) vorbei zum Tor",
    press:"Pressing: Verteidiger rücken ballorientiert zum Ball",
    defend:"Verteidigen: zwischen Ball und Tor bleiben (goalside)",
    header:"Kopfball: Flanke von außen → Kopfball aufs Tor",
    corner:"Ecke: Flanke von der Eckfahne in den Strafraum",
    keeper:"Torwart: Stellungsspiel/Reflexe – Ecken abdecken",
    juggle:"Ball hochhalten / Jonglieren – Einzeltechnik",
    team:"Teambuilding: als Gruppe gemeinsam koordiniert bewegen",
    ladder:"Koordinationsleiter: schnelle Schritte durch die Leiter",
    free:hasBall?"Freies Bewegen & Dribbeln mit Ball":"Freie Bewegung & Koordination ohne Ball"
  }[type];
  return (
    <div>
      <Pitch>{scene}</Pitch>
      <div style={{fontSize:11,color:"#64748b",marginTop:6,lineHeight:1.4}}>{label}. Vereinfachtes Schema des Ablaufs.</div>
    </div>
  );
}

export function TemplateDetail({ tpl, onBack, onUse, cl }) {
  const t = TH(cl);
  const cc = ["warmup","technik","taktik","kondition","spielform","spezial"].includes(tpl.cat)
    ? {warmup:"#f59e0b",technik:"#2563eb",taktik:"#7c3aed",kondition:"#dc2626",spielform:"#16a34a",spezial:"#0891b2"}[tpl.cat]
    : "#334155";

  const intensityBar = (val) => (
    <div style={{display:"flex",gap:3,alignItems:"center"}}>
      {Array.from({length:10},(_,i)=>(
        <div key={i} style={{width:14,height:8,borderRadius:3,
          background:i<val?(val>=8?"#dc2626":val>=5?"#d97706":"#16a34a"):"#e2e8f0"}}/>
      ))}
      <span style={{marginLeft:4,fontSize:12,fontWeight:700,
        color:tpl.intensity>=8?"#dc2626":tpl.intensity>=5?"#d97706":"#16a34a"}}>
        {tpl.intensity}/10
      </span>
    </div>
  );

  return (
    <div style={{position:"fixed",inset:0,background:"rgba(0,0,0,.6)",zIndex:920,
      display:"flex",alignItems:"flex-end",justifyContent:"center",backdropFilter:"blur(6px)"}}>
      <div style={{background:"#fff",borderRadius:"22px 22px 0 0",width:"100%",
        maxWidth:520,maxHeight:"92dvh",overflowY:"auto",paddingBottom:44}}>

        <div style={{background:`linear-gradient(135deg,#1e293b,${cc})`,
          padding:"18px 20px 16px",borderRadius:"22px 22px 0 0"}}>
          <button onClick={onBack} style={{background:"rgba(255,255,255,.15)",border:"none",
            color:"#fff",borderRadius:9,padding:"6px 12px",fontSize:12,fontWeight:700,
            cursor:"pointer",fontFamily:"inherit",marginBottom:10}}>
            {"<-"} Zurück
          </button>
          <div style={{color:"#fff",fontWeight:900,fontSize:20,marginBottom:4}}>{tpl.name}</div>
          <div style={{display:"flex",gap:10,flexWrap:"wrap"}}>
            {isTrainerTip(tpl) && <TrainerTipBadge/>}
            <span style={{background:"rgba(255,255,255,.15)",color:"#fff",
              borderRadius:99,padding:"3px 10px",fontSize:12,fontWeight:600}}>
              {tpl.duration} Min.
            </span>
            <span style={{background:"rgba(255,255,255,.15)",color:"#fff",
              borderRadius:99,padding:"3px 10px",fontSize:12,fontWeight:600}}>
              Mind. {tpl.minPlayers||4} Spieler
            </span>
          </div>
        </div>

        <div style={{padding:"18px 20px 0"}}>

          {/* Schema-Animation */}
          <div style={{marginBottom:14}}>
            <div style={{fontSize:11,fontWeight:800,color:"#64748b",marginBottom:8,letterSpacing:.5}}>ABLAUF (ANIMATION)</div>
            <DrillAutoAnim drill={tpl} color={cc}/>
          </div>

          {/* Intensität */}
          <div style={{background:"#f8fafc",borderRadius:13,padding:"13px 15px",marginBottom:14}}>
            <div style={{fontSize:11,fontWeight:800,color:"#64748b",marginBottom:8,letterSpacing:.5}}>BELASTUNGSINTENSITÄT</div>
            {intensityBar(tpl.intensity||5)}
            <div style={{fontSize:12,color:"#64748b",marginTop:6,lineHeight:1.5}}>
              {tpl.intensity<=3&&"Geringe Belastung - ideal als Aufwärmen oder nach intensiver Woche"}
              {tpl.intensity>=4&&tpl.intensity<=6&&"Mittlere Belastung - regulaeres Technik- und Taktiktraining"}
              {tpl.intensity>=7&&tpl.intensity<=8&&"Hohe Belastung - konditionelle Schwerpunkte, ausreichend Regeneration planen"}
              {tpl.intensity>=9&&"Maximale Belastung - nur frisch ausgeruhte Spieler, zwingend Abkühlen danach"}
            </div>
          </div>

          {/* Was wird trainiert */}
          <div style={{marginBottom:14}}>
            <div style={{fontSize:11,fontWeight:800,color:"#64748b",marginBottom:8,letterSpacing:.5}}>WAS WIRD TRAINIERT</div>
            <div style={{display:"flex",gap:7,flexWrap:"wrap"}}>
              {(tpl.skills||[]).map(skill=>{
                const sk = SKILLS[skill];
                return sk ? (
                  <div key={skill} style={{background:sk.col+"15",border:`1.5px solid ${sk.col}30`,
                    borderRadius:99,padding:"5px 12px",display:"flex",alignItems:"center",gap:5}}>
                    <div style={{width:8,height:8,borderRadius:"50%",background:sk.col}}/>
                    <span style={{fontSize:13,fontWeight:700,color:sk.col}}>{sk.label}</span>
                    <span style={{fontSize:10,color:"#64748b"}}>({sk.cat})</span>
                  </div>
                ) : null;
              })}
            </div>
          </div>

          {/* Altersgruppen */}
          {(tpl.age||[]).length>0&&(
            <div style={{marginBottom:14}}>
              <div style={{fontSize:11,fontWeight:800,color:"#64748b",marginBottom:8,letterSpacing:.5}}>GEEIGNET FÜR</div>
              <div style={{display:"flex",gap:6,flexWrap:"wrap"}}>
                {(tpl.age||[]).map(ag=>(
                  <span key={ag} style={{background:"#f0fdf4",border:"1.5px solid #bbf7d0",
                    color:"#166534",borderRadius:99,padding:"4px 12px",fontSize:12,fontWeight:700}}>
                    {AGE_GROUPS[ag]||ag}
                  </span>
                ))}
              </div>
              {tpl.ageNote&&(
                <div style={{background:"#eff6ff",borderRadius:10,padding:"10px 13px",
                  marginTop:10,fontSize:12,color:"#1d4ed8",lineHeight:1.6}}>
                  {tpl.ageNote}
                </div>
              )}
            </div>
          )}

          {/* Beschreibung */}
          <div style={{marginBottom:14}}>
            <div style={{fontSize:11,fontWeight:800,color:"#64748b",marginBottom:8,letterSpacing:.5}}>BESCHREIBUNG</div>
            <div style={{fontSize:14,color:"#334155",lineHeight:1.7,background:"#f8fafc",
              borderRadius:12,padding:"13px 15px",border:"1px solid #e2e8f0"}}>
              {tpl.description}
            </div>
          </div>

          {/* Coaching-Hinweise */}
          {tpl.coaching&&(
            <div style={{marginBottom:14}}>
              <div style={{fontSize:11,fontWeight:800,color:"#d97706",marginBottom:8,letterSpacing:.5}}>COACHING-HINWEISE</div>
              <div style={{background:"#fef3c7",borderRadius:12,padding:"13px 15px",
                border:"1px solid #fde68a",fontSize:13,color:"#92400e",lineHeight:1.7}}>
                {tpl.coaching}
              </div>
            </div>
          )}

          {/* Variationen */}
          {tpl.variations&&(
            <div style={{marginBottom:14}}>
              <div style={{fontSize:11,fontWeight:800,color:"#7c3aed",marginBottom:8,letterSpacing:.5}}>VARIATIONEN & STEIGERUNGEN</div>
              <div style={{background:"#ede9fe",borderRadius:12,padding:"13px 15px",
                border:"1px solid #c4b5fd",fontSize:13,color:"#4c1d95",lineHeight:1.7}}>
                {tpl.variations}
              </div>
            </div>
          )}

          {/* Material */}
          {(tpl.material||[]).length>0&&(
            <div style={{marginBottom:14}}>
              <div style={{fontSize:11,fontWeight:800,color:"#64748b",marginBottom:8,letterSpacing:.5}}>BENÖTIGTES MATERIAL</div>
              <div style={{display:"flex",flexWrap:"wrap",gap:7}}>
                {tpl.material.map((m,i)=>{
                  const def=MATERIAL_CATALOG.find(x=>x.id===m.id);
                  const col=m.color?COLOR_HEX[m.color]||"#64748b":def?.col||"#64748b";
                  return (
                    <div key={i} style={{background:col+"15",borderRadius:99,
                      padding:"5px 12px",border:`1.5px solid ${col}30`}}>
                      <span style={{fontWeight:700,fontSize:12,color:col}}>
                        {m.qty||1}x {def?.label||m.label}{m.color?" ("+m.color+")":""}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Als Übung verwenden (nur wenn ein onUse-Handler übergeben wurde – bei reiner Vorschau ausgeblendet) */}
          {onUse&&<button onClick={onUse}
            style={{width:"100%",padding:"14px",borderRadius:14,border:"none",
              background:t.p,color:"#fff",fontWeight:800,fontSize:15,
              cursor:"pointer",fontFamily:"inherit",
              boxShadow:`0 4px 20px ${t.p}44`,marginBottom:8}}>
            Diese Vorlage verwenden
          </button>}
        </div>
      </div>
    </div>
  );
}

export function DrillInfoModal({ drill, t, onClose }){
  const col = t?.p || "#16a34a";
  const [view,setView] = useState(drill?.diagram==="track"?"track":"field");
  const [animK,setAnimK] = useState(null);
  const [pd,setPd] = useState(false);
  const dref = useRef(null);
  const anim = useMemo(()=>buildDrillAnim(drill?.el||[], {title:drill?.title, focus:drill?.focus}),[drill]);
  useEffect(()=>()=>{ if(dref.current) cancelAnimationFrame(dref.current); },[]);
  if(!drill) return null;
  const pace=drillPace(drill);
  const trackOk = drill.diagram==="track" || drill.focus==="kondition" || (drill.axes||[]).includes("Ausdauer") || /lauf|runden|bahn|sprint|tempo|intervall|pyramide|shuttle|kondition/i.test(drill.title||"");
  const segBtn=on=>({flex:1,padding:"7px",borderRadius:9,border:`1.5px solid ${on?col:"#e2e8f0"}`,background:on?col+"12":"#fff",color:on?col:"#64748b",fontWeight:700,fontSize:12.5,cursor:"pointer",fontFamily:"inherit"});
  const playDrill=()=>{
    if(pd){ setPd(false); setAnimK(null); if(dref.current)cancelAnimationFrame(dref.current); return; }
    setPd(true); const DUR= pace.level===3?2000 : pace.level===1?4400 : 3200; const t0=performance.now();
    const loop=(tt)=>{ const k=((tt-t0)/DUR)%1; setAnimK(k); dref.current=requestAnimationFrame(loop); };
    dref.current=requestAnimationFrame(loop);
  };
  const drillEl = (pd&&animK!=null) ? (()=>{ const {balls,moved}=anim.posAt(animK);
    const base=(drill.el||[]).map(e=>{ if(e.type==="ball") return balls.length?null:e; if(moved.has(e)){ const mv=moved.get(e); return {...e, x:mv.x, y:mv.y, ...(anim.catcher===e?{type:"opp"}:{})}; } return e; }).filter(Boolean);
    return [...base, ...balls.map(b=>({type:"ball",x:b.x,y:b.y}))];
  })() : drill.el;
  return (
    <div onClick={onClose} style={{position:"fixed",inset:0,background:"rgba(0,0,0,.6)",zIndex:1300,display:"flex",alignItems:"flex-end",justifyContent:"center",backdropFilter:"blur(6px)"}}>
      <div onClick={e=>e.stopPropagation()} style={{background:"#fff",borderRadius:"22px 22px 0 0",width:"100%",maxWidth:520,maxHeight:"90dvh",display:"flex",flexDirection:"column",animation:"down .22s ease"}}>
        <div style={{flexShrink:0,position:"relative",padding:"10px 0 6px",borderBottom:"1px solid #f1f5f9"}}>
          <div style={{width:36,height:4,borderRadius:99,background:"#e2e8f0",margin:"0 auto"}}/>
          <button onClick={onClose} aria-label="Schließen" style={{position:"absolute",top:8,right:12,width:32,height:32,borderRadius:10,background:"#f1f5f9",border:"none",color:"#475569",fontWeight:800,fontSize:16,cursor:"pointer",fontFamily:"inherit"}}>✕</button>
        </div>
        <div style={{overflowY:"auto",WebkitOverflowScrolling:"touch",padding:"12px 20px calc(28px + env(safe-area-inset-bottom))"}}>
          <div style={{fontWeight:900,fontSize:18,color:"#0f172a",marginBottom:2}}>{drill.title}</div>
          <div style={{fontSize:12.5,color:"#64748b",marginBottom:12}}>{drill.min} Min · {drill.players} Spieler</div>
          {(drill.axes||[]).length>0&&<div style={{display:"flex",gap:5,flexWrap:"wrap",marginBottom:12}}>{drill.axes.map(a=><span key={a} style={{fontSize:11,fontWeight:800,color:"#4f46e5",background:"#eef2ff",borderRadius:6,padding:"2px 8px"}}>{a}</span>)}</div>}
          {trackOk&&<div style={{display:"flex",gap:7,marginBottom:10}}>
            <button onClick={()=>setView("field")} style={segBtn(view==="field")}>⚽ Feld</button>
            <button onClick={()=>setView("track")} style={segBtn(view==="track")}>🏃 Tartanbahn</button>
          </div>}
          <div style={{display:"flex",justifyContent:"center",marginBottom:10}}>
            {view==="track"
              ? <TrackDiagram width={300}/>
              : <DrillDiagram field={drill.field} elements={drillEl} color={col} width={300} variant="grass" runColor={pace.color}/>}
          </div>
          {view==="field"&&(
            <div style={{background:pace.color+"12",border:`1.5px solid ${pace.color}40`,borderRadius:12,padding:"10px 13px",marginBottom:10}}>
              <div style={{fontSize:13,fontWeight:800,color:"#0f172a"}}>⏱ Lauf-Tempo: <span style={{color:pace.color}}>{pace.emoji} {pace.label}</span></div>
              <div style={{fontSize:12.5,color:"#475569",lineHeight:1.5,marginTop:3}}>{pace.kid}</div>
              <div style={{fontSize:11,color:"#64748b",marginTop:6}}>🐢 locker · 🐇 zügig · 🐆 Sprint — die <b>farbigen Laufwege</b> zeigen das Tempo, der Abspiel-Knopf läuft entsprechend schnell.</div>
            </div>
          )}
          {view==="field"&&anim.hasAnim&&(<>
            <button onClick={playDrill} style={{width:"100%",marginBottom:pd&&anim.catcher?6:14,padding:"10px",borderRadius:11,border:"none",background:pd?"#fee2e2":col,color:pd?"#dc2626":contrast(col),fontWeight:800,fontSize:13.5,cursor:"pointer",fontFamily:"inherit"}}>{pd?"■ Stopp":"▶ Ablauf abspielen"}</button>
            {pd&&anim.catcher&&<p style={{fontSize:12,color:"#dc2626",fontWeight:700,textAlign:"center",marginBottom:14}}>🔴 Der Rote ist der Fänger – er jagt die anderen, die laufen weg!</p>}
          </>)}
          {drill.desc&&<p style={{fontSize:13.5,color:"#334155",lineHeight:1.6,marginBottom:10}}>{drill.desc}</p>}
          {drill.coach&&<div style={{background:"#f0fdf4",border:"1px solid #bbf7d0",borderRadius:10,padding:"10px 12px",fontSize:12.5,color:"#166534",lineHeight:1.55,marginBottom:10}}><strong>Coaching:</strong> {drill.coach}</div>}
          {drill.kids&&<div style={{background:"#fffbeb",border:"1px solid #fde68a",borderRadius:10,padding:"10px 12px",fontSize:13,color:"#78350f",lineHeight:1.6,marginBottom:10}}><strong>🧒 Für Kinder erklärt:</strong> {drill.kids}</div>}
          {(drill.cats||[]).length>0&&<div style={{fontSize:11.5,color:"#64748b",marginBottom:14}}>Geeignet für: {drill.cats.join(", ")}</div>}
          <button onClick={onClose} style={{width:"100%",padding:"12px",borderRadius:12,border:"none",background:"#f1f5f9",color:"#475569",fontWeight:800,fontSize:14,cursor:"pointer",fontFamily:"inherit"}}>Schließen</button>
        </div>
      </div>
    </div>
  );
}

