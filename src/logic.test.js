import { test } from "node:test";
import assert from "node:assert/strict";
import {
  eventStart, eventDeadline, isVotingLocked, isDeadlinePassed,
  isEventPast, daysUntil, isUpcoming5, formatCountdown,
  round2, clampSkill, monthKey, skillsMean, blendSkill,
} from "./logic.js";

const isoDaysFromNow = (n) => new Date(Date.now() + n*86400000).toISOString().slice(0,10);

// ---- eventStart ----
test("eventStart: gueltiges Datum+Zeit ergibt Date", () => {
  const d = eventStart({ date:"2026-06-10", time:"17:30" });
  assert.ok(d instanceof Date && !isNaN(d.getTime()));
  assert.equal(d.getFullYear(), 2026);
});
test("eventStart: ohne Datum null, ungueltig null", () => {
  assert.equal(eventStart({}), null);
  assert.equal(eventStart(null), null);
  assert.equal(eventStart({ date:"quatsch" }), null);
});
test("eventStart: ohne Zeit faellt auf 12:00", () => {
  const d = eventStart({ date:"2026-06-10" });
  assert.equal(d.getHours(), 12);
});

// ---- eventDeadline ----
test("eventDeadline: 24h vor Beginn", () => {
  const ev = { date:"2026-06-10", time:"12:00" };
  const diff = eventStart(ev).getTime() - eventDeadline(ev).getTime();
  assert.equal(diff, 24*60*60*1000);
});

// ---- isEventPast ----
test("isEventPast: Vergangenheit true, Zukunft false", () => {
  assert.equal(isEventPast({ date: isoDaysFromNow(-10) }), true);
  assert.equal(isEventPast({ date: isoDaysFromNow(10) }), false);
  assert.equal(isEventPast({}), false);
});

// ---- isVotingLocked (24h-Frist) ----
test("isVotingLocked: >24h entfernt offen, <24h gesperrt, vergangen gesperrt", () => {
  assert.equal(isVotingLocked({ date: isoDaysFromNow(10), time:"12:00" }), false);
  assert.equal(isVotingLocked({ date: isoDaysFromNow(-10), time:"12:00" }), true);
  assert.equal(isVotingLocked({}), false);
});

// ---- daysUntil / isUpcoming5 ----
test("daysUntil: Zukunft positiv, kein Datum Infinity", () => {
  assert.ok(daysUntil({ date: isoDaysFromNow(10), time:"12:00" }) > 5);
  assert.equal(daysUntil({}), Infinity);
});
test("isUpcoming5: in 3 Tagen true, in 10 false, vergangen false", () => {
  assert.equal(isUpcoming5({ date: isoDaysFromNow(3), time:"12:00" }), true);
  assert.equal(isUpcoming5({ date: isoDaysFromNow(10), time:"12:00" }), false);
  assert.equal(isUpcoming5({ date: isoDaysFromNow(-3), time:"12:00" }), false);
});

// ---- isDeadlinePassed (manuelle Frist) ----
test("isDeadlinePassed: vergangen true, zukuenftig false, keine Frist false", () => {
  assert.equal(isDeadlinePassed({ deadline:{ date: isoDaysFromNow(-2) } }), true);
  assert.equal(isDeadlinePassed({ deadline:{ date:"2099-01-01", time:"10:00" } }), false);
  assert.equal(isDeadlinePassed({}), false);
  assert.equal(isDeadlinePassed({ deadline:{} }), false);
});

// ---- formatCountdown ----
test("formatCountdown: Formate Tage/Stunden/Minuten", () => {
  assert.equal(formatCountdown(0), "Jetzt");
  assert.equal(formatCountdown(-5), "Jetzt");
  assert.equal(formatCountdown((2*24+14)*3600*1000), "2 T 14 h");
  assert.equal(formatCountdown((14*3600+7*60)*1000), "14 h 7 m");
  assert.equal(formatCountdown(23*60*1000), "23 m");
});

// ---- Skill-Bewertung ----
test("round2: rundet auf 2 Nachkommastellen", () => {
  assert.equal(round2(3.14159), 3.14);
  assert.equal(round2(3.005), 3.01);
  assert.equal(round2(3), 3);
});
test("clampSkill: begrenzt auf 1..5", () => {
  assert.equal(clampSkill(0.4), 1);
  assert.equal(clampSkill(7), 5);
  assert.equal(clampSkill(3.2), 3.2);
});
test("monthKey: YYYY-MM", () => {
  assert.equal(monthKey(new Date("2026-06-12T10:00:00")), "2026-06");
  assert.equal(monthKey(new Date("2026-01-03")), "2026-01");
});
test("skillsMean: Schnitt der gesetzten Achsen, gerundet", () => {
  const axes = ["A","B","C"];
  assert.equal(skillsMean({A:3,B:4,C:0}, axes), 3.5); // C=0 ignoriert
  assert.equal(skillsMean({}, axes), 0);
  assert.equal(skillsMean({A:2,B:3,C:4}, axes), 3);
});
test("blendSkill: erster Wert direkt, danach gleitend + geclamptt", () => {
  assert.equal(blendSkill(0, 4), 4);            // erstmalig -> direkt
  assert.equal(blendSkill(3, 4, 0.5), 3.5);     // halber Schritt
  assert.equal(blendSkill(3, 3, 0.34), 3);      // keine Aenderung
  assert.ok(blendSkill(4.9, 5, 0.34) <= 5);     // bleibt <=5
  assert.ok(blendSkill(1.1, 1, 0.34) >= 1);     // bleibt >=1
});
