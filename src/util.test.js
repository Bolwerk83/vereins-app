import { test } from "node:test";
import assert from "node:assert/strict";
import { ACOLORS, acol, inits, contrast, mix } from "./util.js";

test("inits: Initialen aus Namen", () => {
  assert.equal(inits("Max Mustermann"), "MM");
  assert.equal(inits("Anna"), "A");
  assert.equal(inits("lukas berger"), "LB");
  assert.equal(inits(""), "");
  assert.equal(inits(undefined), "");
});

test("acol: stabil + gueltige Palette-Farbe", () => {
  assert.equal(acol("Max"), acol("Max")); // deterministisch
  assert.ok(ACOLORS.includes(acol("Irgendwer")));
  assert.equal(acol(""), ACOLORS[0]);
  assert.equal(acol(undefined), ACOLORS[0]);
});

test("contrast: helle Flaeche -> dunkler Text, dunkle -> heller", () => {
  assert.equal(contrast("#ffffff"), "#111");
  assert.equal(contrast("#000000"), "#fff");
});

test("mix: Richtung Weiss aufhellen", () => {
  assert.equal(mix("#000000", 100), "#ffffff");
  assert.equal(mix("#000000", 0), "#000000");
  assert.equal(mix("#ffffff", 50), "#ffffff");
});
