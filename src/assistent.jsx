// ----------------------------------------------------------------
// "Co" - der Co-Trainer: ein interner Gesprächspartner für das Trainerteam.
// Er antwortet aus der eigenen Wissensbasis (assistent.js) und baut
// Trainings aus der vorhandenen Übungssammlung. Kein fremder Dienst.
// Alles, was hier entsteht, bleibt beim Trainerteam - Eltern und Kinder
// sehen davon nichts.
// ----------------------------------------------------------------
import React, { useState, useRef, useEffect } from "react";
import { THEMEN, TRICKS, antwortAuf, taktText, naechsteFaelligkeit, fragenZu, rechneErgebnis, EINTEILUNG_FRAGEN, rechneEinteilung } from "./assistent.js";
import { generateTrainingPlan, skillAxesFor } from "./domain.js";
import { skillsMean } from "./logic.js";
import { uid, TH, now } from "./ui.jsx";

const catOf = c => ({warmup:"Aufwärmen",technik:"Technik",taktik:"Taktik",kondition:"Athletik",spielform:"Spielform",spezial:"Abschluss"}[c]||"Übung");

// Bewegungsbild eines Tricks: der Ball läuft den Pfad entlang.
function TrickBild({ trick }){
  return (
    <svg viewBox="0 0 100 60" preserveAspectRatio="none"
      style={{width:"100%",height:100,background:"#f0fdf4",borderRadius:10,border:"1px solid #bbf7d0"}}>
      <path d={trick.pfad} stroke="#86efac" strokeWidth="1.6" strokeDasharray="3 3" fill="none"/>
      {trick.gegner&&(
        <g>
          <circle cx={trick.gegner.x} cy={trick.gegner.y} r="4.2" fill="#fee2e2" stroke="#ef4444" strokeWidth="1.2"/>
          <text x={trick.gegner.x} y={trick.gegner.y+1.8} textAnchor="middle" fontSize="4.5" fill="#b91c1c" fontWeight="700">G</text>
        </g>
      )}
      <circle r="3" fill="#0f172a">
        <animateMotion dur="3.4s" repeatCount="indefinite" path={trick.pfad}/>
      </circle>
    </svg>
  );
}

export default function TrainerAssistent({ data, save, fire, cl, session, myTids, intGroups=[], onClose }){
  const t = TH(cl);
  const cid = (data.teams||[]).find(tm=>myTids.includes(tm.id))?.cid;
  const meineId = session?.id || session?.name || "trainer";
  const tid = myTids[0]||"";
  const team = (data.teams||[]).find(tm=>tm.id===tid);
  const ageKey = String(team?.cat||"").toLowerCase().includes("g-") ? "g"
    : String(team?.cat||"").toLowerCase().includes("f-") ? "f"
    : String(team?.cat||"").toLowerCase().includes("bambini") ? "bambini" : "all";

  const [verlauf,setVerlauf] = useState([{ von:"assi", art:"hallo",
    text:"Moin, ich bin Co – euer Co-Trainer. Schreib mir, woran es gerade hakt – zum Beispiel „wir müssen das Zusammenspiel verbessern“, „wir kriegen zu viele Gegentore“ oder „zeig mir Tricks“." }]);
  const [frage,setFrage] = useState("");
  const [tab,setTab] = useState("chat");
  const [eAnt,setEAnt] = useState({});        // Antworten zur Einteilung
  const [eErg,setEErg] = useState(null);      // berechneter Vorschlag
  const [eZuord,setEZuord] = useState({});    // vom Trainer geänderte Zuordnung
  const endeRef = useRef(null);
  useEffect(()=>{ try{ endeRef.current?.scrollIntoView({behavior:"smooth",block:"end"}); }catch{} },[verlauf.length]);

  const aufgaben = (data.trainerTasks||[]).filter(a=>a.cid===cid&&a.by===meineId&&!a.beendet);
  const meineTrainings = (data.trainings||[]).filter(x=>x.cid===cid&&x.privat&&x.by===meineId);

  const fragen = (txt) => {
    const f = String(txt||"").trim(); if(!f) return;
    const a = antwortAuf(f, { ageKey });
    setVerlauf(v=>[...v, { von:"ich", text:f }, { von:"assi", ...a }]);
    setFrage("");
  };

  // Training aus der Übungssammlung bauen - passend zum Schwerpunkt des Themas.
  const trainingBauen = (thema, param=null) => {
    const uebungen = generateTrainingPlan({ ageKey,
      targetMin: param?.targetMin || 75,
      focus: param?.focus || thema.focus || "auto" });
    setVerlauf(v=>[...v, { von:"assi", art:"training", thema, uebungen, param,
      text:`Vorschlag für eine Einheit mit Schwerpunkt „${thema.titel}“ (${uebungen.reduce((s,e)=>s+(e.duration||0),0)} Minuten):` }]);
  };

  // Geführter Teil: Fragen mit Antwortknöpfen, daraus wird gerechnet.
  const starteFragen = (thema) => {
    setVerlauf(v=>[...v, { von:"assi", art:"frage", themaId:thema.id, ix:0, antworten:{} }]);
  };
  const antworte = (idx, frageId, optId) => {
    setVerlauf(v=>{
      const m = v[idx]; if(!m||m.art!=="frage") return v;
      const antworten = {...m.antworten, [frageId]:optId};
      const fragen = fragenZu(m.themaId);
      const naechst = m.ix+1;
      const kopf = v.slice(0,idx);
      const rest = v.slice(idx+1);
      if(naechst < fragen.length)
        return [...kopf, {...m, ix:naechst, antworten}, ...rest];
      const erg = rechneErgebnis(m.themaId, antworten);
      return [...kopf, {...m, ix:naechst, antworten, fertig:true}, ...rest,
        { von:"assi", art:"ergebnis", erg }];
    });
  };

  const nurFuerMich = (thema, uebungen) => {
    const rec = { id:"tr_"+uid(), cid, ownerTid:tid, by:meineId, privat:true,
      title:`${thema.titel} – Vorschlag`, focus:thema.focus||"",
      blocks:uebungen.map((e,i)=>({ phase:i===0?"Aufwärmen":(i===uebungen.length-1?"Abschluss":"Hauptteil"),
        title:e.name, min:e.duration||15, hinweis:e.description||"" })),
      createdAt:new Date().toISOString() };
    save({...data, trainings:[...(data.trainings||[]), rec]});
    fire("Nur für dich gespeichert – unter „Meine Entwürfe“");
  };

  // In den nächsten Trainingstermin einsetzen.
  const naechstesTraining = () => (data.events||[])
    .filter(e=>e.cid===cid&&myTids.includes(e.tid)&&e.type==="training"&&e.date>=now())
    .sort((a,b)=>String(a.date).localeCompare(String(b.date)))[0]||null;

  const insTraining = (thema, uebungen) => {
    const ev = naechstesTraining();
    if(!ev){ fire("Kein kommendes Training gefunden"); return; }
    const plan = { focus:thema.focus||"", createdAt:new Date().toISOString(),
      sessions:[{ title:`${thema.titel} – Vorschlag`,
        blocks:uebungen.map((e,i)=>({ phase:i===0?"Aufwärmen":(i===uebungen.length-1?"Abschluss":"Hauptteil"),
          title:e.name, min:e.duration||15 })) }] };
    save({...data, events:(data.events||[]).map(e=>e.id===ev.id?{...e,trainingPlan:plan}:e)});
    fire(`Eingesetzt im Training am ${ev.date.split("-").reverse().slice(0,2).join(".")}.`);
  };

  const aufgabeAnlegen = (thema) => {
    const a = thema.aufgabe; if(!a) return;
    if(aufgaben.some(x=>x.themaId===thema.id)){ fire("Diese Aufgabe läuft schon"); return; }
    const start = now();
    const bis = new Date(start+"T12:00:00"); bis.setDate(bis.getDate()+7*(a.wochen||6));
    const rec = { id:"ta_"+uid(), cid, tid, by:meineId, themaId:thema.id, titel:a.titel, text:a.text,
      takt:a.takt, anzahl:a.anzahl||1, start, faellig:naechsteFaelligkeit(a.takt,start),
      bis:bis.toISOString().slice(0,10), erledigt:[], beendet:false };
    save({...data, trainerTasks:[...(data.trainerTasks||[]), rec]});
    fire(`Aufgabe übernommen: ${taktText(a)}`);
  };

  const abhaken = (a) => {
    const heute = now();
    const erledigt = [...(a.erledigt||[]), heute];
    const fertig = a.bis && heute >= a.bis;
    save({...data, trainerTasks:(data.trainerTasks||[]).map(x=>x.id===a.id
      ? {...x, erledigt, faellig:naechsteFaelligkeit(x.takt,heute), beendet:fertig} : x)});
    fire(fertig?"Zeitraum abgeschlossen – gut gemacht!":"Abgehakt – nächste Fälligkeit gesetzt");
  };
  const aufgabeWeg = (a) => save({...data, trainerTasks:(data.trainerTasks||[]).filter(x=>x.id!==a.id)});

  // Aus der Unterhaltung einen fertigen Text für die Eltern-Gruppe machen.
  const alsWhatsApp = (thema) => {
    const txt = [
      `⚽ Kurz aus dem Training – ${team?.name||"unsere Mannschaft"}`,
      ``,
      `Wir arbeiten die nächsten Wochen an einem Schwerpunkt: ${thema.titel}.`,
      ``,
      ...(thema.tipps||[]).slice(0,2).map(x=>`• ${String(x).split(/[.:]/)[0]}.`),
      ``,
      `Ihr könnt dabei helfen, indem ihr die Kinder einfach machen lasst und Fehler nicht kommentiert – das Üben übernehmen wir.`,
      ``,
      `Danke euch! 🙌`,
    ].join("\n");
    if(typeof navigator!=="undefined"&&navigator.share){ navigator.share({title:thema.titel,text:txt}).catch(()=>{}); fire("Vorlage geteilt ✓"); }
    else { navigator.clipboard?.writeText(txt); fire("Vorlage kopiert ✓"); }
  };

  // Zahlen je Kind zusammentragen: gepflegte Skills, Entwicklung aus dem
  // Verlauf und die Beteiligung der letzten drei Monate.
  const kinderDaten = () => {
    const axes = skillAxesFor(cl?.sport||"fussball");
    const seit = (()=>{ const d=new Date(); d.setDate(d.getDate()-90); return d.toISOString().slice(0,10); })();
    const evs = (data.events||[]).filter(e=>e.cid===cid&&e.tid===tid&&e.date>=seit&&e.date<=now());
    return (data.playerProfiles||[]).filter(p=>p.mainTid===tid&&!p.archived).map(p=>{
      const schnitt = p.skills&&Object.keys(p.skills).length ? skillsMean(p.skills, axes) : null;
      const hist = (p.skillHistory||[]).slice(-4);
      const trend = hist.length>=2 ? Number((hist[hist.length-1].avg-hist[0].avg).toFixed(2)) : null;
      let ja=0, nein=0;
      evs.forEach(e=>{ const v=(e.votes||{})[p.name]; const val=(typeof v==="object"&&v)?v.val:v;
        if(val==="yes") ja++; else if(val==="no") nein++; });
      const quote = (ja+nein)>0 ? ja/(ja+nein) : null;
      return { id:p.id, name:p.name, schnitt, trend, quote, aktuell:p.intGrp||"" };
    });
  };

  const einteilungRechnen = (ant) => {
    const kinder = kinderDaten();
    if(kinder.length<4){ fire("Dafür braucht es mindestens vier Kinder im Kader"); return; }
    const erg = rechneEinteilung({ kinder, gruppen:intGroups, worauf:ant.worauf, schnitt:ant.schnitt });
    setEErg(erg);
    setEZuord(Object.fromEntries(erg.vorschlag.map(v=>[v.id, v.gruppe?v.gruppe.id:""])));
  };

  const einteilungUebernehmen = () => {
    if(!eErg) return;
    save({...data, playerProfiles:(data.playerProfiles||[]).map(p=>
      (p.id in eZuord) ? {...p, intGrp:eZuord[p.id]} : p)});
    fire("Einteilung übernommen – änderbar bleibt sie jederzeit");
    setEErg(null); setEAnt({});
  };

  const Knopf = ({onClick,children,haupt=false}) => (
    <button onClick={onClick} style={{padding:"8px 11px",minHeight:38,borderRadius:10,
      border:haupt?"none":"1.5px solid #ddd6fe", background:haupt?"#4338ca":"#faf5ff",
      color:haupt?"#fff":"#5b21b6", fontWeight:800, fontSize:12, cursor:"pointer", fontFamily:"inherit"}}>{children}</button>
  );

  return (
    <div style={{position:"fixed",inset:0,background:"rgba(0,0,0,.6)",zIndex:950,display:"flex",alignItems:"flex-end",justifyContent:"center"}}>
      <div style={{background:"#fff",width:"100%",maxWidth:520,maxHeight:"92vh",borderRadius:"20px 20px 0 0",display:"flex",flexDirection:"column",overflow:"hidden"}}>
        <div style={{padding:"14px 16px 10px",borderBottom:"1px solid #f1f5f9",display:"flex",alignItems:"center",gap:10}}>
          <span style={{fontSize:22}}>🧠</span>
          <div style={{flex:1,minWidth:0}}>
            <div style={{fontWeight:900,fontSize:16,color:"#0f172a"}}>Co <span style={{fontWeight:600,fontSize:12,color:"#64748b"}}>· dein Co-Trainer</span></div>
            <div style={{fontSize:11,color:"#64748b"}}>Intern für das Trainerteam · {team?.name||"Mannschaft"}</div>
          </div>
          <button onClick={onClose} aria-label="Schließen" style={{width:36,height:36,borderRadius:10,border:"none",background:"#f1f5f9",color:"#475569",fontSize:16,cursor:"pointer",fontFamily:"inherit"}}>✕</button>
        </div>
        <div style={{display:"flex",gap:6,padding:"8px 14px",borderBottom:"1px solid #f1f5f9",overflowX:"auto"}}>
          {[["chat","💬 Gespräch"],["einteilung","🎯 Einteilung"],["aufgaben",`🔁 Aufgaben${aufgaben.length?` (${aufgaben.length})`:""}`],["entwuerfe",`📋 Meine Entwürfe${meineTrainings.length?` (${meineTrainings.length})`:""}`]].map(([k,l])=>(
            <button key={k} onClick={()=>setTab(k)} style={{flexShrink:0,padding:"7px 12px",borderRadius:99,
              border:`1.5px solid ${tab===k?"#4338ca":"#e2e8f0"}`,background:tab===k?"#eef2ff":"#fff",
              color:tab===k?"#4338ca":"#64748b",fontWeight:800,fontSize:12.5,cursor:"pointer",fontFamily:"inherit"}}>{l}</button>
          ))}
        </div>

        {tab==="chat"&&(
        <>
        <div style={{flex:1,overflowY:"auto",padding:"12px 14px",display:"flex",flexDirection:"column",gap:10}}>
          {verlauf.map((m,i)=>(
            <div key={i} style={{alignSelf:m.von==="ich"?"flex-end":"flex-start",maxWidth:"92%"}}>
              <div style={{background:m.von==="ich"?"#4338ca":"#f8fafc",color:m.von==="ich"?"#fff":"#0f172a",
                border:m.von==="ich"?"none":"1.5px solid #e2e8f0",borderRadius:14,padding:"10px 12px",fontSize:13,lineHeight:1.55}}>
                {m.art==="thema"&&<div style={{fontWeight:900,marginBottom:4}}>{m.thema.icon} {m.thema.titel}</div>}
                <div>{m.text}</div>

                {m.art==="thema"&&(
                  <>
                    <ul style={{margin:"9px 0 0",paddingLeft:18,display:"flex",flexDirection:"column",gap:6}}>
                      {m.thema.tipps.map((x,j)=><li key={j} style={{fontSize:12.5,lineHeight:1.5}}>{x}</li>)}
                    </ul>
                    <div style={{display:"flex",gap:6,flexWrap:"wrap",marginTop:11}}>
                      <Knopf haupt onClick={()=>starteFragen(m.thema)}>🧮 Fragen beantworten</Knopf>
                      {m.thema.focus&&<Knopf onClick={()=>trainingBauen(m.thema)}>⚽ Training vorschlagen</Knopf>}
                      {m.thema.aufgabe&&<Knopf onClick={()=>aufgabeAnlegen(m.thema)}>🔁 {taktText(m.thema.aufgabe)}</Knopf>}
                      <Knopf onClick={()=>alsWhatsApp(m.thema)}>📤 Eltern-Text</Knopf>
                    </div>
                  </>
                )}

                {m.art==="training"&&(
                  <>
                    <div style={{marginTop:9,display:"flex",flexDirection:"column",gap:5}}>
                      {m.uebungen.map((e,j)=>(
                        <div key={j} style={{display:"flex",gap:8,alignItems:"baseline",fontSize:12.5}}>
                          <span style={{flexShrink:0,minWidth:34,fontWeight:800,color:"#4338ca"}}>{e.duration}′</span>
                          <span style={{flex:1,minWidth:0}}>
                            <b>{e.name}</b>
                            <span style={{color:"#64748b"}}> · {catOf(e.cat)}</span>
                            {e.description&&<div style={{color:"#475569",fontSize:11.5,lineHeight:1.45,marginTop:2}}>{e.description}</div>}
                          </span>
                        </div>
                      ))}
                    </div>
                    <div style={{display:"flex",gap:6,flexWrap:"wrap",marginTop:11}}>
                      <Knopf onClick={()=>nurFuerMich(m.thema,m.uebungen)}>📋 Nur für mich speichern</Knopf>
                      <Knopf haupt onClick={()=>insTraining(m.thema,m.uebungen)}>⚽ Ins nächste Training</Knopf>
                      <Knopf onClick={()=>trainingBauen(m.thema)}>🔄 Anderer Vorschlag</Knopf>
                    </div>
                  </>
                )}

                {m.art==="frage"&&(()=>{
                  const fragen=fragenZu(m.themaId);
                  const f=fragen[Math.min(m.ix,fragen.length-1)];
                  if(m.fertig) return (
                    <div style={{marginTop:8,display:"flex",flexDirection:"column",gap:4}}>
                      {fragen.map(q=>{
                        const o=q.opt.find(x=>x.id===m.antworten[q.id]);
                        return o?<div key={q.id} style={{fontSize:12,color:"#475569"}}>✓ {q.text} <b style={{color:"#0f172a"}}>{o.label}</b></div>:null;
                      })}
                    </div>
                  );
                  return (
                    <div style={{marginTop:2}}>
                      <div style={{fontSize:11,fontWeight:800,color:"#64748b",marginBottom:6}}>FRAGE {m.ix+1} VON {fragen.length}</div>
                      <div style={{fontSize:13.5,fontWeight:800,color:"#0f172a",marginBottom:9}}>{f.text}</div>
                      <div style={{display:"flex",flexDirection:"column",gap:6}}>
                        {f.opt.map(o=>(
                          <button key={o.id} onClick={()=>antworte(i,f.id,o.id)}
                            style={{textAlign:"left",padding:"11px 12px",minHeight:44,borderRadius:11,border:"1.5px solid #ddd6fe",
                              background:"#faf5ff",color:"#4c1d95",fontWeight:700,fontSize:13,cursor:"pointer",fontFamily:"inherit"}}>
                            {o.label}
                          </button>
                        ))}
                      </div>
                    </div>
                  );
                })()}

                {m.art==="ergebnis"&&(()=>{ const e=m.erg; return (
                  <div>
                    <div style={{fontWeight:900,fontSize:14,color:"#0f172a",marginBottom:5}}>🧮 Ergebnis</div>
                    <div style={{fontSize:13,lineHeight:1.55,marginBottom:9}}>{e.diagnose}</div>
                    <div style={{background:"#f8fafc",border:"1px solid #e2e8f0",borderRadius:10,padding:"9px 11px",marginBottom:10}}>
                      <div style={{fontSize:10.5,fontWeight:800,color:"#64748b",letterSpacing:.3,marginBottom:5}}>SO KOMMT DAS ZUSTANDE</div>
                      {e.rechenweg.map((r,j)=>(
                        <div key={j} style={{fontSize:11.5,color:"#475569",lineHeight:1.5,marginBottom:3}}>• {r}</div>
                      ))}
                    </div>
                    <div style={{fontSize:11,fontWeight:800,color:"#64748b",letterSpacing:.3,marginBottom:5}}>DAS WÜRDE ICH MACHEN</div>
                    <ol style={{margin:"0 0 10px",paddingLeft:18,display:"flex",flexDirection:"column",gap:6}}>
                      {e.massnahmen.map((x,j)=><li key={j} style={{fontSize:12.5,lineHeight:1.5}}>{x}</li>)}
                    </ol>
                    <div style={{display:"flex",gap:6,flexWrap:"wrap"}}>
                      <Knopf haupt onClick={()=>trainingBauen(e.thema||THEMEN.find(t=>t.id===e.themaId), e.trainingsParam)}>
                        ⚽ Passende Einheit bauen ({e.dauer}′)
                      </Knopf>
                      {(e.thema||{}).aufgabe&&<Knopf onClick={()=>aufgabeAnlegen(e.thema)}>🔁 {taktText(e.thema.aufgabe)}</Knopf>}
                      <Knopf onClick={()=>alsWhatsApp(e.thema||THEMEN.find(t=>t.id===e.themaId))}>📤 Eltern-Text</Knopf>
                    </div>
                  </div>
                ); })()}

                {m.art==="tricks"&&(
                  <div style={{display:"flex",flexDirection:"column",gap:12,marginTop:10}}>
                    {m.tricks.map(tr=>(
                      <div key={tr.id} style={{background:"#fff",border:"1.5px solid #e2e8f0",borderRadius:12,padding:"10px 11px"}}>
                        <div style={{display:"flex",alignItems:"center",gap:7,marginBottom:6}}>
                          <span style={{fontWeight:900,fontSize:13.5,color:"#0f172a",flex:1}}>{tr.name}</span>
                          <span style={{fontSize:10.5,fontWeight:800,color:"#15803d",background:"#dcfce7",borderRadius:6,padding:"2px 7px"}}>{tr.ab}</span>
                          <span title={`Schwierigkeit ${tr.stufe} von 3`} style={{fontSize:11,color:"#d97706"}}>{"★".repeat(tr.stufe)}</span>
                        </div>
                        <TrickBild trick={tr}/>
                        <div style={{fontSize:12,color:"#475569",margin:"7px 0 5px",fontStyle:"italic"}}>{tr.zweck}</div>
                        <ol style={{margin:"0 0 6px",paddingLeft:18,display:"flex",flexDirection:"column",gap:4}}>
                          {tr.schritte.map((sx,j)=><li key={j} style={{fontSize:12.5,lineHeight:1.45}}>{sx}</li>)}
                        </ol>
                        <div style={{fontSize:11.5,color:"#b45309",background:"#fffbeb",border:"1px solid #fde68a",borderRadius:8,padding:"6px 8px"}}>
                          <b>Häufiger Fehler:</b> {tr.fehler}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          ))}
          <div ref={endeRef}/>
        </div>
        <div style={{padding:"10px 14px 14px",borderTop:"1px solid #f1f5f9"}}>
          <div style={{display:"flex",gap:5,overflowX:"auto",paddingBottom:8}}>
            {THEMEN.slice(0,5).map(th=>(
              <button key={th.id} onClick={()=>{ setVerlauf(v=>[...v,{von:"ich",text:th.titel}]); starteFragen(th); }} style={{flexShrink:0,padding:"6px 11px",borderRadius:99,
                border:"1.5px solid #e2e8f0",background:"#fff",color:"#475569",fontWeight:700,fontSize:12,cursor:"pointer",fontFamily:"inherit"}}>
                {th.icon} {th.titel.split(" ")[0].replace("&","")}
              </button>
            ))}
            <button onClick={()=>fragen("zeig mir tricks")} style={{flexShrink:0,padding:"6px 11px",borderRadius:99,
              border:"1.5px solid #e2e8f0",background:"#fff",color:"#475569",fontWeight:700,fontSize:12,cursor:"pointer",fontFamily:"inherit"}}>🎩 Tricks</button>
          </div>
          <div style={{display:"flex",gap:7}}>
            <input value={frage} onChange={e=>setFrage(e.target.value)}
              onKeyDown={e=>{ if(e.key==="Enter"){ e.preventDefault(); fragen(frage); } }}
              placeholder="Woran hakt es gerade?"
              style={{flex:1,padding:"12px 13px",fontSize:14,border:"1.5px solid #e2e8f0",borderRadius:12,outline:"none",fontFamily:"inherit",boxSizing:"border-box"}}/>
            <button onClick={()=>fragen(frage)} disabled={!frage.trim()}
              style={{padding:"0 18px",minHeight:46,borderRadius:12,border:"none",background:frage.trim()?"#4338ca":"#e2e8f0",
                color:frage.trim()?"#fff":"#94a3b8",fontWeight:800,fontSize:14,cursor:frage.trim()?"pointer":"default",fontFamily:"inherit"}}>Fragen</button>
          </div>
        </div>
        </>)}

        {tab==="einteilung"&&(
          <div style={{flex:1,overflowY:"auto",padding:"14px"}}>
            <div style={{fontSize:11.5,color:"#3730a3",background:"#eef2ff",border:"1px solid #c7d2fe",borderRadius:10,padding:"9px 11px",lineHeight:1.55,marginBottom:12}}>
              🔒 Wir überlegen hier gemeinsam, wer in welche Leistungsgruppe passt. Ich rechne einen Vorschlag – <b>entscheiden musst du</b>.
              Jede Zuordnung lässt sich vor dem Übernehmen ändern, und ändern kannst du sie später sowieso jederzeit.
            </div>
            {intGroups.length<2
              ? <p style={{fontSize:13,color:"#64748b",lineHeight:1.6}}>Dafür brauchst du zuerst Leistungsgruppen: Team → Spieler → ganz unten „🎯 Leistungsgruppen“.</p>
              : !eErg ? (
              <>
                {EINTEILUNG_FRAGEN.map(f=>(
                  <div key={f.id} style={{marginBottom:14}}>
                    <div style={{fontSize:13.5,fontWeight:800,color:"#0f172a",marginBottom:8}}>{f.text}</div>
                    <div style={{display:"flex",flexDirection:"column",gap:6}}>
                      {f.opt.map(o=>{ const an=eAnt[f.id]===o.id;
                        return (
                        <button key={o.id} onClick={()=>setEAnt(a=>({...a,[f.id]:o.id}))}
                          style={{textAlign:"left",padding:"11px 12px",minHeight:44,borderRadius:11,
                            border:`1.5px solid ${an?"#4338ca":"#ddd6fe"}`,background:an?"#eef2ff":"#faf5ff",
                            color:"#4c1d95",fontWeight:an?800:700,fontSize:13,cursor:"pointer",fontFamily:"inherit"}}>
                          {an?"● ":"○ "}{o.label}
                        </button>
                        ); })}
                    </div>
                  </div>
                ))}
                <button disabled={!eAnt.worauf||!eAnt.schnitt} onClick={()=>einteilungRechnen(eAnt)}
                  style={{width:"100%",padding:"13px",minHeight:48,borderRadius:12,border:"none",
                    background:(eAnt.worauf&&eAnt.schnitt)?"#4338ca":"#e2e8f0",color:(eAnt.worauf&&eAnt.schnitt)?"#fff":"#94a3b8",
                    fontWeight:800,fontSize:14,cursor:(eAnt.worauf&&eAnt.schnitt)?"pointer":"default",fontFamily:"inherit"}}>
                  🧮 Vorschlag rechnen
                </button>
              </>
            ) : (
              <>
                {eErg.basisDuenn&&(
                  <div style={{fontSize:11.5,color:"#92400e",background:"#fffbeb",border:"1px solid #fde68a",borderRadius:10,padding:"9px 11px",lineHeight:1.5,marginBottom:10}}>
                    Achtung: Nur bei {eErg.mitSkill} von {eErg.gesamt} Kindern sind Stärken gepflegt. Der Vorschlag stützt sich dann vor allem auf die Beteiligung –
                    schau ihn besonders kritisch an.
                  </div>
                )}
                <div style={{background:"#f8fafc",border:"1px solid #e2e8f0",borderRadius:10,padding:"9px 11px",marginBottom:11}}>
                  <div style={{fontSize:10.5,fontWeight:800,color:"#64748b",letterSpacing:.3,marginBottom:5}}>SO KOMMT DAS ZUSTANDE</div>
                  {eErg.rechenweg.map((r,j)=><div key={j} style={{fontSize:11.5,color:"#475569",lineHeight:1.5,marginBottom:3}}>• {r}</div>)}
                </div>
                {eErg.vorschlag.map(v=>(
                  <div key={v.id} style={{background:"#fff",border:"1.5px solid #e2e8f0",borderRadius:12,padding:"9px 11px",marginBottom:7}}>
                    <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:5}}>
                      <span style={{flex:1,minWidth:0,fontWeight:800,fontSize:13.5,color:"#0f172a",overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{v.name}</span>
                      {v.aktuell&&v.aktuell!==eZuord[v.id]&&(
                        <span style={{fontSize:10.5,color:"#94a3b8"}}>bisher {(intGroups.find(g=>g.id===v.aktuell)||{}).name||"–"}</span>
                      )}
                    </div>
                    <div style={{fontSize:11.5,color:"#64748b",marginBottom:7}}>{v.teile.join(" · ")}</div>
                    <div style={{display:"flex",gap:5,flexWrap:"wrap"}}>
                      {intGroups.map(g=>{ const an=eZuord[v.id]===g.id;
                        return (
                        <button key={g.id} onClick={()=>setEZuord(z=>({...z,[v.id]:an?"":g.id}))}
                          style={{padding:"6px 11px",minHeight:34,borderRadius:9,border:`1.5px solid ${an?g.col:"#e2e8f0"}`,
                            background:an?g.col:"#fff",color:an?"#fff":"#94a3b8",fontWeight:800,fontSize:12,cursor:"pointer",fontFamily:"inherit"}}>
                          {g.name}
                        </button>
                        ); })}
                    </div>
                  </div>
                ))}
                <div style={{display:"flex",gap:7,marginTop:12}}>
                  <button onClick={einteilungUebernehmen}
                    style={{flex:1,padding:"13px",minHeight:48,borderRadius:12,border:"none",background:"#4338ca",color:"#fff",fontWeight:800,fontSize:14,cursor:"pointer",fontFamily:"inherit"}}>
                    ✓ So übernehmen
                  </button>
                  <button onClick={()=>{ setEErg(null); }}
                    style={{padding:"13px 16px",minHeight:48,borderRadius:12,border:"1.5px solid #ddd6fe",background:"#fff",color:"#4338ca",fontWeight:800,fontSize:13.5,cursor:"pointer",fontFamily:"inherit"}}>
                    Zurück
                  </button>
                </div>
                <p style={{fontSize:11,color:"#94a3b8",marginTop:9,lineHeight:1.5}}>
                  Nichts wird gespeichert, solange du nicht „So übernehmen“ tippst.
                </p>
              </>
            )}
          </div>
        )}

        {tab==="aufgaben"&&(
          <div style={{flex:1,overflowY:"auto",padding:"14px"}}>
            {aufgaben.length===0
              ? <p style={{fontSize:13,color:"#64748b",lineHeight:1.6}}>Noch keine wiederkehrende Aufgabe. Frag den Assistenten nach einem Thema – er schlägt dir dann eine mit sinnvollem Rhythmus vor, z. B. „2× pro Woche, sechs Wochen“.</p>
              : aufgaben.map(a=>{
                  const ueberfaellig = a.faellig && a.faellig < now();
                  return (
                  <div key={a.id} style={{background:"#fff",border:`1.5px solid ${ueberfaellig?"#fdba74":"#e2e8f0"}`,borderRadius:13,padding:"11px 12px",marginBottom:9}}>
                    <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:4}}>
                      <span style={{fontWeight:900,fontSize:13.5,color:"#0f172a",flex:1}}>{a.titel}</span>
                      <button onClick={()=>aufgabeWeg(a)} title="Aufgabe entfernen" style={{border:"none",background:"transparent",color:"#dc2626",fontSize:13,cursor:"pointer",fontFamily:"inherit"}}>✕</button>
                    </div>
                    <div style={{fontSize:12.5,color:"#475569",lineHeight:1.5,marginBottom:7}}>{a.text}</div>
                    <div style={{display:"flex",alignItems:"center",gap:8,flexWrap:"wrap"}}>
                      <span style={{fontSize:11.5,fontWeight:800,color:ueberfaellig?"#c2410c":"#64748b"}}>
                        {ueberfaellig?"❗ fällig seit":"nächste Fälligkeit:"} {String(a.faellig||"").split("-").reverse().slice(0,2).join(".")}.
                      </span>
                      <span style={{fontSize:11.5,color:"#94a3b8"}}>· {(a.erledigt||[]).length}× erledigt · bis {String(a.bis||"").split("-").reverse().slice(0,2).join(".")}.</span>
                      <button onClick={()=>abhaken(a)} style={{marginLeft:"auto",padding:"7px 12px",minHeight:36,borderRadius:9,border:"none",background:"#16a34a",color:"#fff",fontWeight:800,fontSize:12,cursor:"pointer",fontFamily:"inherit"}}>✓ Gemacht</button>
                    </div>
                  </div>
                  ); })}
          </div>
        )}

        {tab==="entwuerfe"&&(
          <div style={{flex:1,overflowY:"auto",padding:"14px"}}>
            {meineTrainings.length===0
              ? <p style={{fontSize:13,color:"#64748b",lineHeight:1.6}}>Hier landen Trainings, die du dir im Gespräch „nur für mich“ gespeichert hast. Sie sind für niemanden sonst sichtbar, bis du sie in ein Training einsetzt.</p>
              : meineTrainings.slice().reverse().map(x=>(
                  <div key={x.id} style={{background:"#fff",border:"1.5px solid #e2e8f0",borderRadius:13,padding:"11px 12px",marginBottom:9}}>
                    <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:6}}>
                      <span style={{fontWeight:900,fontSize:13.5,color:"#0f172a",flex:1}}>{x.title}</span>
                      <span style={{fontSize:10.5,fontWeight:800,color:"#5b21b6",background:"#f3e8ff",borderRadius:6,padding:"2px 7px"}}>nur für dich</span>
                    </div>
                    {(x.blocks||[]).map((b,j)=>(
                      <div key={j} style={{display:"flex",gap:8,fontSize:12.5,marginBottom:2}}>
                        <span style={{minWidth:32,fontWeight:800,color:"#4338ca"}}>{b.min}′</span>
                        <span style={{flex:1,minWidth:0}}>{b.title}</span>
                      </div>
                    ))}
                    <div style={{display:"flex",gap:6,marginTop:9}}>
                      <Knopf haupt onClick={()=>{
                        const ev=naechstesTraining();
                        if(!ev){ fire("Kein kommendes Training gefunden"); return; }
                        const plan={ focus:x.focus||"", createdAt:new Date().toISOString(),
                          sessions:[{ title:x.title, blocks:(x.blocks||[]).map(b=>({phase:b.phase,title:b.title,min:b.min})) }] };
                        save({...data, events:(data.events||[]).map(e=>e.id===ev.id?{...e,trainingPlan:plan}:e)});
                        fire("Eingesetzt im nächsten Training");
                      }}>⚽ Ins nächste Training</Knopf>
                      <Knopf onClick={()=>{ save({...data, trainings:(data.trainings||[]).filter(y=>y.id!==x.id)}); fire("Entwurf gelöscht"); }}>🗑 Löschen</Knopf>
                    </div>
                  </div>
                ))}
          </div>
        )}
      </div>
    </div>
  );
}
