// ----------------------------------------------------------------
// Reine Event-/Frist-Helfer (ohne React/DOM) - isoliert testbar.
// Datum/Zeit eines Termins, 24h-Abstimmungssperre, manuelle Frist,
// Vergangenheits-/Countdown-Logik.
// ----------------------------------------------------------------

// Startzeitpunkt eines Termins (lokal). Null bei fehlendem/ungueltigem Datum.
export const eventStart = (ev) => {
  if (!ev?.date) return null;
  const t = (ev.time || "12:00").padStart(5,"0");
  const d = new Date(ev.date + "T" + t + ":00");
  return isNaN(d.getTime()) ? null : d;
};

// Automatische Abstimmungs-Deadline: 24h vor Beginn.
export const eventDeadline = (ev) => {
  const s = eventStart(ev); if (!s) return null;
  return new Date(s.getTime() - 24 * 60 * 60 * 1000);
};

// Ist die automatische 24h-Frist erreicht?
export const isVotingLocked = (ev) => {
  const dl = eventDeadline(ev); if (!dl) return false;
  return Date.now() >= dl.getTime();
};

// Manuell gesetzte Abstimmungs-Frist ({date,time}). Eine Stelle fuer alle
// Anzeigen, damit Dashboard, Detail-Poll und Vote-Uebersicht denselben
// Frist-Status berechnen (Datum + Uhrzeit korrekt beruecksichtigt).
export const isDeadlinePassed = (ev) => {
  if (!ev?.deadline?.date) return false;
  const dl = new Date(`${ev.deadline.date}T${ev.deadline.time||"23:59"}:00`);
  return !isNaN(dl.getTime()) && Date.now() >= dl.getTime();
};

// Liegt der Termin-Beginn in der Vergangenheit?
export const isEventPast = (ev) => {
  const s = eventStart(ev); if (!s) return false;
  return Date.now() >= s.getTime();
};

// Tage bis zum Termin (negativ = vergangen, Infinity = kein Datum).
export const daysUntil = (ev) => {
  const s = eventStart(ev); if (!s) return Infinity;
  return (s.getTime() - Date.now()) / (1000 * 60 * 60 * 24);
};

// Steht der Termin in den naechsten 5 Tagen an?
export const isUpcoming5 = (ev) => {
  const d = daysUntil(ev);
  return d > 0 && d <= 5;
};

// Millisekunden -> "2 T 14 h" / "14 h 7 m" / "23 m".
export const formatCountdown = (ms) => {
  if (ms <= 0) return "Jetzt";
  const days = Math.floor(ms / (1000*60*60*24));
  const hrs  = Math.floor((ms % (1000*60*60*24)) / (1000*60*60));
  const mins = Math.floor((ms % (1000*60*60)) / (1000*60));
  if (days > 0) return `${days} T ${hrs} h`;
  if (hrs > 0)  return `${hrs} h ${mins} m`;
  return `${mins} m`;
};

// ----------------------------------------------------------------
// Skill-Bewertung (monatlich) – reine Mathematik, isoliert testbar.
// Werte laufen auf der Skala 1..5 mit bis zu 2 Nachkommastellen. Das
// Spinnennetz zeigt sie gerundet (ganzzahlig), die Entwicklung exakt.
// ----------------------------------------------------------------

// Auf 2 Nachkommastellen runden (vermeidet Float-Artefakte wie 3.0000004).
export const round2 = (x) => Math.round((Number(x) || 0) * 100) / 100;

// Auf die Skala 1..5 begrenzen.
export const clampSkill = (x) => Math.max(1, Math.min(5, Number(x) || 0));

// Monatsschlüssel "YYYY-MM" (für Verlauf + "einmal pro Monat fällig").
export const monthKey = (d = new Date()) => {
  const dt = (d instanceof Date) ? d : new Date(d);
  if (isNaN(dt.getTime())) return "";
  return `${dt.getFullYear()}-${String(dt.getMonth() + 1).padStart(2, "0")}`;
};

// Durchschnitt der gesetzten Skills (Werte > 0) über die Achsenliste.
// Leeres Profil -> 0. Auf 2 Nachkommastellen gerundet.
export const skillsMean = (skills, axes) => {
  const vals = (axes || []).map(a => Number(skills?.[a]) || 0).filter(v => v > 0);
  if (!vals.length) return 0;
  return round2(vals.reduce((s, v) => s + v, 0) / vals.length);
};

// Sanfte monatliche Anpassung: gleitender Mittelwert in Richtung der
// Trainer-Einschätzung. alpha steuert, wie stark ein einzelner Monat zieht
// (0.34 ≈ ein Drittel). Erster Wert (alt 0/leer) wird direkt übernommen.
export const blendSkill = (old, assessed, alpha = 0.34) => {
  const a = clampSkill(assessed);
  const o = Number(old) || 0;
  if (o <= 0) return round2(a);
  return round2(clampSkill(o + (a - o) * alpha));
};

// ── Deutsche Feiertage (offline berechnet, je Bundesland) ─────────────
// Ostersonntag nach dem Algorithmus von Gauß/Meeus (in UTC, damit keine
// Zeitzonen-Verschiebungen das Datum kippen).
const easterSundayUTC = (year) => {
  const a = year % 19, b = Math.floor(year / 100), c = year % 100;
  const d = Math.floor(b / 4), e = b % 4, f = Math.floor((b + 8) / 25);
  const g = Math.floor((b - f + 1) / 3), h = (19 * a + b - d - g + 15) % 30;
  const i = Math.floor(c / 4), k = c % 4, l = (32 + 2 * e + 2 * i - h - k) % 7;
  const m = Math.floor((a + 11 * h + 22 * l) / 451);
  const month = Math.floor((h + l - 7 * m + 114) / 31);
  const day = ((h + l - 7 * m + 114) % 31) + 1;
  return new Date(Date.UTC(year, month - 1, day));
};

// Buß- und Bettag: Mittwoch vor dem 23. November.
const bussUndBettag = (year) => {
  const d = new Date(Date.UTC(year, 10, 23));
  do { d.setUTCDate(d.getUTCDate() - 1); } while (d.getUTCDay() !== 3);
  return d.toISOString().slice(0, 10);
};

// Liefert alle gesetzlichen Feiertage eines Jahres für ein Bundesland.
// stateCode darf "BY" oder "DE-BY" sein. Rückgabe: [{date:"YYYY-MM-DD", name}].
export const germanPublicHolidays = (year, stateCode) => {
  const st = String(stateCode || "").split("-").pop().toUpperCase();
  const E = easterSundayUTC(year);
  const iso = (dt) => dt.toISOString().slice(0, 10);
  const off = (n) => { const d = new Date(E); d.setUTCDate(d.getUTCDate() + n); return iso(d); };
  const fix = (mo, da) => `${year}-${String(mo).padStart(2, "0")}-${String(da).padStart(2, "0")}`;
  const has = (...codes) => codes.includes(st);
  const list = [
    { date: fix(1, 1),  name: "Neujahr" },
    { date: off(-2),    name: "Karfreitag" },
    { date: off(1),     name: "Ostermontag" },
    { date: fix(5, 1),  name: "Tag der Arbeit" },
    { date: off(39),    name: "Christi Himmelfahrt" },
    { date: off(50),    name: "Pfingstmontag" },
    { date: fix(10, 3), name: "Tag der Deutschen Einheit" },
    { date: fix(12, 25),name: "1. Weihnachtstag" },
    { date: fix(12, 26),name: "2. Weihnachtstag" },
  ];
  if (has("BW", "BY", "ST")) list.push({ date: fix(1, 6), name: "Heilige Drei Könige" });
  if (has("BE", "MV")) list.push({ date: fix(3, 8), name: "Internationaler Frauentag" });
  if (has("BB")) { list.push({ date: off(0), name: "Ostersonntag" }); list.push({ date: off(49), name: "Pfingstsonntag" }); }
  if (has("BW", "BY", "HE", "NW", "RP", "SL")) list.push({ date: off(60), name: "Fronleichnam" });
  if (has("SL", "BY")) list.push({ date: fix(8, 15), name: "Mariä Himmelfahrt" });
  if (has("TH")) list.push({ date: fix(9, 20), name: "Weltkindertag" });
  if (has("BB", "HB", "HH", "MV", "NI", "SN", "ST", "SH", "TH")) list.push({ date: fix(10, 31), name: "Reformationstag" });
  if (has("BW", "BY", "NW", "RP", "SL")) list.push({ date: fix(11, 1), name: "Allerheiligen" });
  if (has("SN")) list.push({ date: bussUndBettag(year), name: "Buß- und Bettag" });
  return list.sort((a, b) => a.date.localeCompare(b.date));
};

// Name des Feiertags an einem Datum (oder null), für ein Bundesland.
export const publicHolidayName = (dateStr, stateCode) => {
  if (!dateStr || !stateCode) return null;
  const y = parseInt(String(dateStr).slice(0, 4), 10);
  if (!y) return null;
  const h = germanPublicHolidays(y, stateCode).find(x => x.date === dateStr);
  return h ? h.name : null;
};

// Liste der 16 Bundesländer (Code = openHolidaysAPI-Subdivision für späteren
// Ferien-Abruf). "" = kein Kalender.
export const DE_STATES = [
  ["DE-BW", "Baden-Württemberg"], ["DE-BY", "Bayern"], ["DE-BE", "Berlin"],
  ["DE-BB", "Brandenburg"], ["DE-HB", "Bremen"], ["DE-HH", "Hamburg"],
  ["DE-HE", "Hessen"], ["DE-MV", "Mecklenburg-Vorpommern"], ["DE-NI", "Niedersachsen"],
  ["DE-NW", "Nordrhein-Westfalen"], ["DE-RP", "Rheinland-Pfalz"], ["DE-SL", "Saarland"],
  ["DE-SN", "Sachsen"], ["DE-ST", "Sachsen-Anhalt"], ["DE-SH", "Schleswig-Holstein"],
  ["DE-TH", "Thüringen"],
];

// ── Listen-/OCR-Text in Spieler zerlegen ──────────────────────────────
const _GW = /^(w|weiblich|m(ä|ae)dchen|f|female|girl|frau)$/i;
const _GM = /^(m|männlich|maennlich|junge|male|boy|mann)$/i;
const _GD = /^(d|divers|x)$/i;

// Ein Segment (= ein Datensatz) auswerten. Erkennt Jahrgang, Geschlecht,
// entfernt führende Listen-/Trikotnummern. surnameFirst=true dreht
// "Nachname Vorname" zu "Vorname Nachname" für die Anzeige.
const parseRosterEntry = (seg, surnameFirst) => {
  if (!seg) return null;
  const tokens = seg.split(/[,\s]+/).filter(Boolean);
  let by = null, gender = null;
  const nameParts = [];
  for (const t0 of tokens) {
    const tok = t0.replace(/[.,]+$/, "");
    if (!tok) continue;
    if (by == null && /^(19|20)\d{2}$/.test(tok)) { by = parseInt(tok, 10); continue; }
    if (gender == null && _GW.test(tok)) { gender = "w"; continue; }
    if (gender == null && _GM.test(tok)) { gender = "m"; continue; }
    if (gender == null && _GD.test(tok)) { gender = "d"; continue; }
    // Führende reine Zahl (Listen-/Trikotnummer) am Zeilenanfang ignorieren.
    if (nameParts.length === 0 && /^\d{1,3}$/.test(tok)) continue;
    // Tokens ohne Buchstaben überspringen.
    if (!/[A-Za-zÀ-ÿ]/.test(tok)) continue;
    nameParts.push(tok);
  }
  let parts = nameParts;
  if (surnameFirst && nameParts.length >= 2) parts = [...nameParts.slice(1), nameParts[0]];
  const name = parts.join(" ").trim();
  // Rauschen aussortieren: braucht entweder Jahrgang oder ein "echtes" Wort (>=3 Buchstaben).
  const realWord = nameParts.some(w => w.replace(/[^A-Za-zÀ-ÿ]/g, "").length >= 3);
  if (!name || (by == null && !realWord)) return null;
  return { name, by, gender };
};

// Mehrzeiligen Text zerlegen. Trennt mehrere Datensätze pro Zeile (zwei
// Spalten nebeneinander -> mehrere Jahrgänge in einer Zeile).
export const parseRosterText = (raw, opts = {}) => {
  const surnameFirst = !!opts.surnameFirst;
  const out = [];
  for (let line of String(raw || "").split(/\r?\n/)) {
    line = line.replace(/[|;\t]+/g, " ").replace(/\s+/g, " ").trim();
    if (!line) continue;
    const years = [...line.matchAll(/\b(19|20)\d{2}\b/g)];
    let segments;
    if (years.length >= 2) {
      segments = [];
      let start = 0;
      for (const m of years) { const end = m.index + m[0].length; segments.push(line.slice(start, end)); start = end; }
      const tail = line.slice(start).trim();
      if (tail && /[A-Za-zÀ-ÿ]/.test(tail)) segments.push(tail);
    } else {
      segments = [line];
    }
    for (const seg of segments) { const p = parseRosterEntry(seg.trim(), surnameFirst); if (p) out.push(p); }
  }
  return out;
};

