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

