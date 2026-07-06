import { test } from "node:test";
import assert from "node:assert/strict";
import { splitData, mergeData, merge3Obj, merge3Arr } from "./data.js";

// ---- splitData / mergeData ----
test("splitData routet Records per cid in Shards, clubs/Skalar global", () => {
  const data = {
    _v: 14,
    clubs: [{ id:"A" }, { id:"B" }],
    teams: [{ id:"t1", cid:"A" }],
    events: [{ id:"e1", cid:"A" }, { id:"e2", cid:"B" }],
    activeSeason: "s1",
  };
  const { global, shards } = splitData(data);
  assert.deepEqual(global.clubs.map(c=>c.id), ["A","B"]);
  assert.equal(global.activeSeason, "s1");
  assert.equal(shards.A.events.length, 1);
  assert.equal(shards.B.events[0].id, "e2");
});

test("mergeData fuehrt global + Shards verlustfrei zusammen", () => {
  const { global, shards } = splitData({
    clubs:[{id:"A"}], teams:[{id:"t1",cid:"A"}], events:[{id:"e1",cid:"A"}], activeSeason:"s1",
  });
  const merged = mergeData(global, [shards.A]);
  assert.equal(merged.clubs.length, 1);
  assert.equal(merged.events.length, 1);
  assert.equal(merged.activeSeason, "s1");
});

// ---- merge3Arr ----
test("merge3Arr: gleichzeitige Hinzufuegungen beider Seiten bleiben erhalten", () => {
  const base  = [{id:1,v:"a"}];
  const cloud = [{id:1,v:"a"}, {id:2,v:"remote"}];   // anderes Geraet hat 2 hinzugefuegt
  const local = [{id:1,v:"a"}, {id:3,v:"mine"}];     // ich habe 3 hinzugefuegt
  const out = merge3Arr(base, cloud, local, "events").map(r=>r.id).sort();
  assert.deepEqual(out, [1,2,3]);
});

test("merge3Arr: lokale Aenderung gewinnt, entfernte bleibt sonst", () => {
  const base  = [{id:1,v:"a"}];
  const cloud = [{id:1,v:"a"}];
  const local = [{id:1,v:"mine"}];
  const out = merge3Arr(base, cloud, local, "events");
  assert.equal(out.find(r=>r.id===1).v, "mine");
});

test("merge3Arr: lokale Loeschung wird respektiert (kein Resurrect)", () => {
  const base  = [{id:1},{id:2}];
  const cloud = [{id:1},{id:2}];   // Cloud hat 2 noch
  const local = [{id:1}];          // lokal 2 geloescht
  const out = merge3Arr(base, cloud, local, "events").map(r=>r.id);
  assert.deepEqual(out, [1]);
});

test("merge3Arr: entfernte Loeschung wird respektiert", () => {
  const base  = [{id:1},{id:2}];
  const cloud = [{id:1}];          // anderes Geraet hat 2 geloescht
  const local = [{id:1},{id:2}];   // lokal unveraendert
  const out = merge3Arr(base, cloud, local, "events").map(r=>r.id);
  assert.deepEqual(out, [1]);
});

test("merge3Arr: lokale Aenderung schlaegt entfernte Loeschung", () => {
  const base  = [{id:1,v:"a"}];
  const cloud = [];                 // remote geloescht
  const local = [{id:1,v:"edit"}];  // lokal geaendert
  const out = merge3Arr(base, cloud, local, "events");
  assert.deepEqual(out.map(r=>r.id), [1]);
});

test("merge3Arr (chats): Nachrichten beider Seiten werden vereint", () => {
  const base  = [{id:"c1", messages:[{id:"m1",ts:"1"}]}];
  const cloud = [{id:"c1", messages:[{id:"m1",ts:"1"},{id:"m2",ts:"2"}]}]; // remote msg
  const local = [{id:"c1", messages:[{id:"m1",ts:"1"},{id:"m3",ts:"3"}]}]; // lokale msg
  const out = merge3Arr(base, cloud, local, "chats");
  const ids = out[0].messages.map(m=>m.id).sort();
  assert.deepEqual(ids, ["m1","m2","m3"]);
});

// ---- merge3Obj ----
test("merge3Obj: zwei Geraete legen verschiedene Vereine an -> beide bleiben", () => {
  const base  = { clubs:[{id:"demo"}] };
  const cloud = { clubs:[{id:"demo"},{id:"A"}] };  // anderes Geraet legte A an
  const local = { clubs:[{id:"demo"},{id:"B"}] };  // ich lege B an
  const out = merge3Obj(base, cloud, local);
  assert.deepEqual(out.clubs.map(c=>c.id).sort(), ["A","B","demo"]);
});

test("merge3Obj: Skalar - lokale Aenderung gewinnt, sonst Cloud", () => {
  assert.equal(merge3Obj({s:"x"}, {s:"x"}, {s:"mine"}).s, "mine"); // lokal geaendert
  assert.equal(merge3Obj({s:"x"}, {s:"remote"}, {s:"x"}).s, "remote"); // nur remote geaendert
});

test("merge3Obj: fehlender Cloud-Wert (null) -> lokal unveraendert (kein Datenverlust bei Read-Fehler)", () => {
  const local = { events:[{id:1}] };
  assert.deepEqual(merge3Obj(undefined, null, local), local);
});

// ---- splitData Edgecases ----
test("splitData: Record mit unbekanntem cid landet global (nicht verloren)", () => {
  const { global, shards } = splitData({ clubs:[{id:"A"}], events:[{id:"e1",cid:"GIBTSNICHT"}] });
  assert.equal((global.events||[]).length, 1);
  assert.ok(!shards.GIBTSNICHT);
});
test("splitData: players-Map wird nach Team-cid in Shards verteilt", () => {
  const { global, shards } = splitData({
    clubs:[{id:"A"}], teams:[{id:"t1",cid:"A"}],
    players:{ t1:[{n:"x"}], tX:[{n:"y"}] },
  });
  assert.deepEqual(shards.A.players.t1, [{n:"x"}]);
  assert.deepEqual(global.players.tX, [{n:"y"}]); // unbekanntes Team bleibt global
});
test("splitData->mergeData: Round-Trip eines Shard-Records ist verlustfrei", () => {
  const data = { clubs:[{id:"A"}], teams:[{id:"t1",cid:"A"}], events:[{id:"e1",cid:"A",x:1}], _v:14 };
  const { global, shards } = splitData(data);
  const merged = mergeData(global, [shards.A]);
  assert.equal(merged.events.find(e=>e.id==="e1").x, 1);
  assert.equal(merged._v, 14);
});

// ---- merge3Obj: players-Map ----
test("merge3Obj: players-Map - lokale Team-Aenderung gewinnt, fremde bleiben", () => {
  const base  = { players:{ t1:["a"] } };
  const cloud = { players:{ t1:["a"], t2:["remote"] } };  // anderes Geraet: t2
  const local = { players:{ t1:["mine"] } };               // ich: t1 geaendert
  const out = merge3Obj(base, cloud, local).players;
  assert.deepEqual(out.t1, ["mine"]);
  assert.deepEqual(out.t2, ["remote"]);
});


// ---- feldweiser Vote-Merge (gleichzeitige Abstimmungen) ----
test("merge3Arr: parallele Stimmen am selben Termin bleiben BEIDE erhalten", () => {
  const base  = [{ id:"ev1", title:"Training", votes:{} }];
  const cloud = [{ id:"ev1", title:"Training", votes:{ Ben:"yes" } }];          // Gerät B hat abgestimmt
  const local = [{ id:"ev1", title:"Training", votes:{ Anna:"yes" } }];         // Gerät A stimmt gleichzeitig ab
  const out = merge3Arr(base, cloud, local, "events");
  assert.deepEqual(out[0].votes, { Ben:"yes", Anna:"yes" });
});

test("merge3Arr: lokale Stimm-Aenderung gewinnt je Schluessel, Rest aus der Cloud", () => {
  const base  = [{ id:"ev1", votes:{ Anna:"yes", Ben:"yes" } }];
  const cloud = [{ id:"ev1", votes:{ Anna:"yes", Ben:"no" } }];                 // Ben hat umgestimmt
  const local = [{ id:"ev1", votes:{ Anna:"no",  Ben:"yes" } }];                // Anna stimmt lokal um
  const out = merge3Arr(base, cloud, local, "events");
  assert.deepEqual(out[0].votes, { Anna:"no", Ben:"no" });
});

test("merge3Arr: trainerPresence und present werden ebenfalls feldweise gemerged", () => {
  const base  = [{ id:"ev1", present:{}, trainerPresence:{} }];
  const cloud = [{ id:"ev1", present:{ Ben:true }, trainerPresence:{ T1:"yes" } }];
  const local = [{ id:"ev1", present:{ Anna:true }, trainerPresence:{ T2:"no" } }];
  const out = merge3Arr(base, cloud, local, "events");
  assert.deepEqual(out[0].present, { Ben:true, Anna:true });
  assert.deepEqual(out[0].trainerPresence, { T1:"yes", T2:"no" });
});

test("merge3Arr: extraPolls-Stimmen werden je Umfrage gemerged", () => {
  const base  = [{ id:"ev1", extraPolls:[{ id:"p1", q:"Grillen?", votes:{} }] }];
  const cloud = [{ id:"ev1", extraPolls:[{ id:"p1", q:"Grillen?", votes:{ Ben:"ja" } }] }];
  const local = [{ id:"ev1", extraPolls:[{ id:"p1", q:"Grillen?", votes:{ Anna:"nein" } }] }];
  const out = merge3Arr(base, cloud, local, "events");
  assert.deepEqual(out[0].extraPolls[0].votes, { Ben:"ja", Anna:"nein" });
});

test("merge3Arr: Cloud-Loeschung einer Stimme wird respektiert (kein Zombie)", () => {
  const base  = [{ id:"ev1", title:"T", votes:{ Ben:"yes" } }];
  const cloud = [{ id:"ev1", title:"T", votes:{} }];                            // Ben hat Stimme zurueckgezogen
  const local = [{ id:"ev1", title:"T2", votes:{ Ben:"yes", Anna:"yes" } }];    // lokal unveraendert Ben + neu Anna
  const out = merge3Arr(base, cloud, local, "events");
  assert.deepEqual(out[0].votes, { Anna:"yes" });
  assert.equal(out[0].title, "T2");
});
