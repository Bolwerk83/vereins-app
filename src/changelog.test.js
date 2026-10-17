// Der Changelog ist die einzige Datei, in die bei jeder Änderung Prosa
// wandert - und ein gerades Anführungszeichen im Text zerreißt dort den
// String und damit den ganzen Build. Zweimal passiert, deshalb geprüft:
// Diese Datei muss sich laden lassen und sauber aufgebaut sein.
import { test } from "node:test";
import assert from "node:assert/strict";
import { CHANGELOG, CL_TYPES, CL_AREAS } from "./changelog.js";

test("Changelog lädt und hat Einträge", () => {
  assert.ok(Array.isArray(CHANGELOG));
  assert.ok(CHANGELOG.length > 100, "unerwartet wenige Einträge: "+CHANGELOG.length);
});

test("Jeder Eintrag hat Datum, Art, Bereich, Überschrift und Text", () => {
  const arten=new Set(CL_TYPES.map(t=>t.id));
  const bereiche=new Set(CL_AREAS.map(a=>a.id));
  CHANGELOG.forEach((e,i)=>{
    const wo=`Eintrag ${i} (${e.h||"ohne Überschrift"})`;
    assert.match(String(e.d||""), /^\d{4}-\d{2}-\d{2}$/, wo+": Datum fehlt oder falsch");
    assert.ok(arten.has(e.t), wo+": unbekannte Art "+e.t);
    assert.ok(bereiche.has(e.a), wo+": unbekannter Bereich "+e.a);
    assert.ok(String(e.h||"").trim().length>5, wo+": Überschrift zu kurz");
    assert.ok(String(e.x||"").trim().length>20, wo+": Text zu kurz");
  });
});

test("Neueste Einträge stehen oben", () => {
  const daten=CHANGELOG.map(e=>e.d);
  const sortiert=[...daten].sort().reverse();
  assert.equal(daten[0], sortiert[0], "oben steht nicht das jüngste Datum");
});

test("Kein gerades Anführungszeichen im Text", () => {
  // Es käme nur durch einen Tippfehler hinein - und würde den String
  // beenden. Deutsche Anführungszeichen („ “) sind erwünscht.
  CHANGELOG.forEach((e,i)=>{
    assert.ok(!String(e.x||"").includes('"'), `Eintrag ${i} (${e.h}) enthält ein gerades Anführungszeichen`);
    assert.ok(!String(e.h||"").includes('"'), `Überschrift ${i} enthält ein gerades Anführungszeichen`);
  });
});
