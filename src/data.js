// ----------------------------------------------------------------
// Reine Daten-/Merge-Funktionen (ohne React/DOM) - testbar isoliert.
//
// Speichermodell: Jeder Verein wird in einer eigenen Zeile gespeichert.
// splitData/mergeData sind GENERISCH und verlustfrei: jeder Datensatz wird
// genau einem Verein zugeordnet (ueber cid bzw. Team-Zugehoerigkeit); alles,
// was keinem bekannten Verein zuzuordnen ist, landet in der globalen Zeile.
// ----------------------------------------------------------------
export const splitData = (data) => {
  if(!data) return { global:null, shards:{} };
  const idSet = new Set((data.clubs||[]).map(c=>c&&c.id).filter(Boolean));
  const teamCid = {}; (data.teams||[]).forEach(t=>{ if(t&&t.id) teamCid[t.id]=t.cid; });
  const shards = {}; const ensure = id => (shards[id] ||= {});
  idSet.forEach(id=>ensure(id));
  const global = {};
  for(const [key,val] of Object.entries(data)){
    if(key==="clubs"){
      global.clubs = [ ...(global.clubs||[]), ...(val||[]) ];
    } else if(key==="players" && val && typeof val==="object" && !Array.isArray(val)){
      global.players ||= {};
      for(const [tid,pv] of Object.entries(val)){
        const cid=teamCid[tid];
        if(cid && idSet.has(cid)) (ensure(cid).players ||= {})[tid]=pv;
        else (global.players ||= {})[tid]=pv;
      }
    } else if(Array.isArray(val) && val.length && val.every(r=>r&&typeof r==="object") && val.some(r=>"cid" in r)){
      val.forEach(rec=>{
        const cid=rec.cid;
        if(cid && idSet.has(cid)) (ensure(cid)[key] ||= []).push(rec);
        else (global[key] ||= []).push(rec);
      });
    } else {
      global[key]=val;
    }
  }
  return { global, shards };
};

export const mergeData = (global, shardList) => {
  const out = global ? JSON.parse(JSON.stringify(global)) : {};
  for(const shard of (shardList||[])){
    if(!shard) continue;
    for(const [key,val] of Object.entries(shard)){
      if(key==="players" && val && typeof val==="object" && !Array.isArray(val)){
        out.players = { ...(out.players||{}), ...val };
      } else if(Array.isArray(val)){
        out[key] = [ ...(out[key]||[]), ...val ];
      } else {
        out[key]=val;
      }
    }
  }
  return out;
};

// ----------------------------------------------------------------
// 3-Wege-Merge fuer Schreibzugriffe: base (Stand beim letzten Lesen),
// cloud (frischer Stand jetzt) und local (zu schreibender Stand) werden
// zusammengefuehrt. Verhindert, dass parallele Aenderungen anderer Geraete
// ueberschrieben werden, und respektiert dabei lokale UND entfernte
// Loeschungen. WICHTIG: nur aufrufen, wenn der frische Cloud-Read GELANG -
// bei einem fehlgeschlagenen Read wuerde "cloud leer" faelschlich als
// Loeschung gewertet.
// ----------------------------------------------------------------
const _eq = (a,b) => JSON.stringify(a)===JSON.stringify(b);
const _isRecArr = a => Array.isArray(a) && a.length>0 && a.every(r=>r&&typeof r==="object"&&"id"in r);
// 3-Wege-Merge fuer Key->Wert-Objekte (z. B. votes: Name -> Stimme).
// Lokale Aenderung gewinnt je Schluessel; unveraenderte Schluessel nehmen den
// Cloud-Stand; Cloud-Loeschung (in base, nicht mehr in cloud) wird respektiert.
function _merge3Map(b,c,l){
  b=b||{}; c=c||{}; l=l||{};
  const out={...c};
  for(const k of new Set([...Object.keys(c),...Object.keys(l)])){
    const inB=k in b, inC=k in c, inL=k in l;
    if(inL&&inC) out[k] = !_eq(l[k],b[k]) ? l[k] : c[k];
    else if(inL&&!inC){ if(!inB||!_eq(l[k],b[k])) out[k]=l[k]; else delete out[k]; }
    else if(!inL&&inC){ if(inB&&_eq(c[k],b[k])) delete out[k]; }
  }
  return out;
}
// Unter-Objekte, in die mehrere Nutzer parallel schreiben (Abstimmungen,
// Anwesenheits-Abhaken). Ohne feldweisen Merge wuerde bei gleichzeitiger
// Aenderung desselben Termins die Stimme des anderen Geraets verloren gehen.
const _VOTE_MAPS = ["votes","trainerPresence","present"];
function _mergeRecord(b,c,l,key){
  if(key==="chats"){
    const m=new Map();
    [...(c?.messages||[]),...(l?.messages||[])].forEach(x=>{ if(x&&x.id!=null&&!m.has(x.id)) m.set(x.id,x); });
    return {...l, messages:[...m.values()].sort((x,y)=>String(x.ts||"").localeCompare(String(y.ts||"")))};
  }
  let out=l;
  for(const vk of _VOTE_MAPS){
    const lv=l?.[vk], cv=c?.[vk];
    if((lv&&typeof lv==="object"&&!Array.isArray(lv))||(cv&&typeof cv==="object"&&!Array.isArray(cv))){
      if(out===l) out={...l};
      out[vk]=_merge3Map(b?.[vk], cv, lv);
    }
  }
  if(Array.isArray(l?.extraPolls)&&Array.isArray(c?.extraPolls)){
    const cBy=new Map(c.extraPolls.filter(p=>p&&p.id!=null).map(p=>[p.id,p]));
    const bBy=new Map((b?.extraPolls||[]).filter(p=>p&&p.id!=null).map(p=>[p.id,p]));
    if(out===l) out={...l};
    out.extraPolls=l.extraPolls.map(p=>{
      const cp=p&&p.id!=null?cBy.get(p.id):null;
      if(!cp||(!p.votes&&!cp.votes)) return p;
      return {...p, votes:_merge3Map(bBy.get(p.id)?.votes, cp.votes, p.votes)};
    });
  }
  return out;
}
export function merge3Arr(base, cloud, local, key){
  const bById=new Map((base||[]).filter(r=>r&&r.id!=null).map(r=>[r.id,r]));
  const cById=new Map((cloud||[]).filter(r=>r&&r.id!=null).map(r=>[r.id,r]));
  const lById=new Map((local||[]).filter(r=>r&&r.id!=null).map(r=>[r.id,r]));
  const out=[];
  for(const id of new Set([...cById.keys(),...lById.keys()])){
    const inB=bById.has(id), inC=cById.has(id), inL=lById.has(id);
    const b=bById.get(id), c=cById.get(id), l=lById.get(id);
    if(inL&&inC)      out.push(!_eq(l,b) ? _mergeRecord(b,c,l,key) : c);
    else if(inL&&!inC){ if(!inB||!_eq(l,b)) out.push(l); }
    else if(!inL&&inC){ if(!inB) out.push(c); }
  }
  return out;
}
function merge3Players(base, cloud, local){
  base=base||{}; cloud=cloud||{}; local=local||{};
  const out={...cloud};
  for(const tid of new Set([...Object.keys(cloud),...Object.keys(local)])){
    const inB=tid in base, inC=tid in cloud, inL=tid in local;
    if(inL&&inC){ if(!_eq(local[tid],base[tid])) out[tid]=local[tid]; }
    else if(inL&&!inC){ if(!inB||!_eq(local[tid],base[tid])) out[tid]=local[tid]; }
    else if(!inL&&inC){ if(inB&&_eq(cloud[tid],base[tid])) delete out[tid]; }
  }
  return out;
}
export function merge3Obj(base, cloud, local){
  if(!cloud||typeof cloud!=="object") return local;
  if(!local||typeof local!=="object") return local;
  base = (base&&typeof base==="object")?base:{};
  const out={...cloud};
  for(const k of new Set([...Object.keys(cloud),...Object.keys(local)])){
    const lv=local[k], cv=cloud[k], bv=base[k];
    if(_isRecArr(lv)||_isRecArr(cv)){
      out[k]=merge3Arr(Array.isArray(bv)?bv:[], Array.isArray(cv)?cv:[], Array.isArray(lv)?lv:[], k);
    } else if(k==="players" && lv && typeof lv==="object" && !Array.isArray(lv)){
      out[k]=merge3Players(bv, cv, lv);
    } else if(k in local){
      out[k] = !_eq(lv,bv) ? lv : (k in cloud ? cv : lv);
    }
  }
  return out;
}
