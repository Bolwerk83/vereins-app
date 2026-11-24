// Schreibfehler duerfen keine Daten verschlucken.
// Gemeldet: „Es gab viele Meldungen, dass angeblich abgestimmt wurde, aber
// diese nicht mitgezählt und auch nicht angezeigt wurden." Wenn die Cloud den
// Schreibversuch ablehnt (abgelaufener Zugang, Rechte, Serverfehler), stand die
// Zusage noch auf dem Bildschirm - gespeichert war sie nirgends.
import { test } from "node:test";
import assert from "node:assert/strict";

// Browser-Umgebung nachbauen, bevor storage.js geladen wird.
const store = new Map();
globalThis.localStorage = {
  getItem: k => (store.has(k) ? store.get(k) : null),
  setItem: (k, v) => store.set(k, String(v)),
  removeItem: k => store.delete(k),
  clear: () => store.clear(),
};
globalThis.window = { addEventListener(){}, dispatchEvent(){}, location:{ search:"" } };
let antwort = { ok:true, status:200 };
let geschrieben = [];
let cloudRows = {};                 // key -> value, so tut die nachgebaute Cloud
let zuletztGeschrieben = {};        // key -> value, was wirklich rausging
globalThis.fetch = async (url, init={}) => {
  if (String(url).includes("/auth/v1/")) return { ok:true, status:200, json:async()=>({access_token:"t", refresh_token:"r", expires_in:3600}) };
  if ((init.method||"GET")==="GET") {
    const q = decodeURIComponent(String(url));
    const treffer = Object.keys(cloudRows).filter(k=>q.includes(k));
    return { ok:true, status:200, json:async()=>treffer.map(k=>({key:k,value:cloudRows[k]})) };
  }
  geschrieben.push(url);
  try { JSON.parse(init.body||"[]").forEach(r=>{ if(r&&r.key) zuletztGeschrieben[r.key]=r.value; }); } catch {}
  return { ok:antwort.ok, status:antwort.status, text:async()=>"abgelehnt", json:async()=>({}) };
};

const { sb, SK, CFG } = await import("./storage.js");

const vorbereiten = () => {
  store.clear(); geschrieben = []; cloudRows = {}; zuletztGeschrieben = {};
  sb._snap = {}; if (sb._stage) sb._stage = {};
  localStorage.setItem(CFG, JSON.stringify({ url:"https://example.test", key:"anon" }));
  // Gueltiger Zugang, damit getToken ohne Netz auskommt
  localStorage.setItem("vereinsapp_auth", JSON.stringify({
    access_token:"tok", refresh_token:"ref", expires_at: Math.floor(Date.now()/1000)+99999 }));
};
const daten = () => ({ _v:14, clubs:[{id:"c1",name:"Test"}], events:[{id:"e1",cid:"c1",tid:"t1",votes:{"A Kind":{val:"yes"}}}] });

test("Abgelehnter Schreibversuch: Aenderung bleibt lokal und wird nachgetragen", async () => {
  vorbereiten();
  antwort = { ok:false, status:401 };
  const r = await sb.set(daten(), "c1");
  assert.equal(r.ok, false);
  assert.equal(r.status, 401);
  // Das Entscheidende: nicht verschluckt, sondern vorgemerkt.
  assert.equal(sb.hasPending(), true, "Aenderung muss als nachzutragen markiert sein");
  const lokal = JSON.parse(localStorage.getItem(SK) || "null");
  assert.ok(lokal, "Aenderung muss lokal gesichert sein");
  assert.ok(JSON.stringify(lokal).includes("A Kind"), "Die Zusage muss im lokalen Stand stehen");
});

test("Serverfehler: ebenfalls vorgemerkt statt verloren", async () => {
  vorbereiten();
  antwort = { ok:false, status:500 };
  await sb.set(daten(), "c1");
  assert.equal(sb.hasPending(), true);
});

test("Gelungener Schreibversuch: nichts bleibt offen", async () => {
  vorbereiten();
  antwort = { ok:true, status:201 };
  const r = await sb.set(daten(), "c1");
  assert.equal(r.ok, true);
  assert.equal(sb.hasPending(), false, "nach Erfolg darf nichts mehr offen sein");
  assert.ok(geschrieben.length >= 1, "es wurde wirklich geschrieben");
});

// ---- Vergleichsstand darf dem Bildschirm nicht davonlaufen ----------------
// Gemeldet: „Zusagen waren wieder raus." Der 10-Sekunden-Sync liest den
// frischen Cloud-Stand. Wird der dabei als Vergleichsstand uebernommen, die
// App zeigt aber weiter den alten, dann sieht der naechste Schreibvorgang
// jede zwischenzeitliche Zusage wie ein bewusstes Loeschen - und entfernt sie.
const klubRow = (namen) => ({ _v:14, events:[{ id:"e1", cid:"c1", tid:"t1",
  votes:Object.fromEntries(namen.map(n=>[n,{val:"yes",ts:"2026-11-24T10:00:00.000Z"}])) }] });

test("Fremde Zusage ueberlebt einen Schreibvorgang des alten Standes", async () => {
  vorbereiten();
  antwort = { ok:true, status:200 };
  // Die Cloud kennt A und B, dieses Geraet nur A.
  cloudRows = {
    "vereinsapp_v14__global": { _v:14, clubs:[{id:"c1",name:"Test"}] },
    "vereinsapp_v14__club_c1": klubRow(["A Kind","B Kind"]),
  };
  // Der Hintergrund-Sync liest - die App uebernimmt den Stand NICHT.
  await sb.getClub("c1");
  // Jetzt schreibt das Geraet seinen alten Stand (nur A, dazu eine Eintragung).
  const lokal = { _v:14, clubs:[{id:"c1",name:"Test"}],
    events:[{ id:"e1", cid:"c1", tid:"t1", votes:{
      "A Kind":{val:"yes",ts:"2026-11-24T10:00:00.000Z"},
      "C Kind":{val:"yes",ts:"2026-11-24T11:00:00.000Z"} } }] };
  await sb.set(lokal, "c1");
  const geschriebeneVotes = Object.keys(
    (zuletztGeschrieben["vereinsapp_v14__club_c1"]?.events?.[0]?.votes) || {});
  assert.ok(geschriebeneVotes.includes("B Kind"),
    "Die Zusage des anderen Geraets darf nicht verschwinden, sondern muss im Schreibvorgang erhalten bleiben: "+geschriebeneVotes.join(", "));
  assert.ok(geschriebeneVotes.includes("A Kind"));
  assert.ok(geschriebeneVotes.includes("C Kind"), "die eigene Eintragung bleibt");
});

test("Nach dem Uebernehmen des Standes wirkt ein Entfernen weiterhin", async () => {
  vorbereiten();
  antwort = { ok:true, status:200 };
  cloudRows = {
    "vereinsapp_v14__global": { _v:14, clubs:[{id:"c1",name:"Test"}] },
    "vereinsapp_v14__club_c1": klubRow(["A Kind","B Kind"]),
  };
  const frisch = await sb.getClub("c1");
  sb.commitRead();                     // die App zeigt diesen Stand jetzt an
  // Der Trainer entfernt B bewusst.
  const ohneB = { ...frisch, events:[{ ...frisch.events[0],
    votes:{ "A Kind":{val:"yes",ts:"2026-11-24T10:00:00.000Z"} } }] };
  await sb.set(ohneB, "c1");
  const geschriebeneVotes = Object.keys(
    (zuletztGeschrieben["vereinsapp_v14__club_c1"]?.events?.[0]?.votes) || {});
  assert.deepEqual(geschriebeneVotes, ["A Kind"], "bewusstes Entfernen muss ankommen");
});
