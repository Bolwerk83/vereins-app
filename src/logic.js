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
