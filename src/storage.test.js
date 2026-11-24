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
globalThis.fetch = async (url, init={}) => {
  if (String(url).includes("/auth/v1/")) return { ok:true, status:200, json:async()=>({access_token:"t", refresh_token:"r", expires_in:3600}) };
  if ((init.method||"GET")==="GET") return { ok:true, status:200, json:async()=>[] };
  geschrieben.push(url);
  return { ok:antwort.ok, status:antwort.status, text:async()=>"abgelehnt", json:async()=>({}) };
};

const { sb, SK, CFG } = await import("./storage.js");

const vorbereiten = () => {
  store.clear(); geschrieben = [];
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
