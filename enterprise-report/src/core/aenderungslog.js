// =========================================================================
//  ÄNDERUNGS-/AUDIT-LOG — was wurde wann, wo und von wem gemacht.
//  Speist die Startseite ("was ist neu / was wurde geändert"): neue Berichte,
//  entfernte Berichte, geänderte KPIs/Freigaben, Importe, Systemereignisse.
//  Mock-Seed + laufend ergänzbare Ereignisse (localStorage). Bewusst ohne
//  argloses Date im Modul — Zeitstempel kommen vom Aufrufer (Determinismus).
// =========================================================================
const KEY = 'er_aenderungslog'

// Ereignis-Typen mit Symbol/Label/Farbrolle (für einheitliche Darstellung).
export const AENDERUNGS_TYPEN = {
  neu:       { icon: '🆕', label: 'Neuer Bericht',     farbe: 'g' },
  entfernt:  { icon: '🗑', label: 'Entfernt',          farbe: 'r' },
  geaendert: { icon: '✏️', label: 'Geändert',          farbe: 'a' },
  freigabe:  { icon: '🚦', label: 'Freigabe',          farbe: 'g' },
  import:    { icon: '📥', label: 'Import',            farbe: 'n' },
  system:    { icon: '⚙️', label: 'System',            farbe: 'n' },
  kpi:       { icon: '📈', label: 'Kennzahl',          farbe: 'a' }
}
export const typInfo = (typ) => AENDERUNGS_TYPEN[typ] || { icon: '•', label: typ, farbe: 'n' }

// Fester Demo-Verlauf (neueste zuerst nicht nötig — wird beim Laden sortiert).
// wo = Ziel-View (klickbar), bereich = optionaler Fachbereich, wer = Urheber.
export const SEED_AENDERUNGEN = [
  { ts: '2026-06-24 16:40', typ: 'neu',       titel: 'Break-Even-Analyse mit Diagramm',        detail: 'Neuer Bericht: Gewinnschwelle interaktiv, Filter nach Warengruppe/Artikel/Kunde.', wo: 'deckungsbeitrag', bereich: 'KLR', wer: 'Controlling' },
  { ts: '2026-06-24 09:12', typ: 'freigabe',  titel: 'Service- & Zoll-Cockpit freigegeben',    detail: 'Für Rolle „Logistik" und 2 Kollegen freigeschaltet.',                              wo: 'servicezoll',     bereich: 'SVC', wer: 'Admin' },
  { ts: '2026-06-23 18:05', typ: 'kpi',       titel: 'Zielwert DB-Quote angepasst',            detail: 'Ampelschwelle für die Deckungsbeitragsquote von 38 % auf 40 % erhöht.',            wo: 'kennzahlen',      bereich: 'FIN', wer: 'Controlling' },
  { ts: '2026-06-23 06:22', typ: 'import',    titel: 'Vertrieb / WaWi importiert',             detail: '5.320 Datensätze geladen (Dauer 78 s).',                                           wo: 'startseite',      bereich: null,  wer: 'System' },
  { ts: '2026-06-22 14:30', typ: 'geaendert', titel: 'Budget-Cockpit erweitert',               detail: 'Ziel-Rückwärtsrechnung und Forecast-Spalte ergänzt.',                              wo: 'planung',         bereich: 'FIN', wer: 'Controlling' },
  { ts: '2026-06-20 11:48', typ: 'neu',       titel: 'Artikelkarte (Journey)',                 detail: 'Neuer Bericht: Mini-ERP je Artikel mit Bild, Preis-/Absatz-/Lagerverlauf.',        wo: 'artikelkarte',    bereich: 'VK',  wer: 'Controlling' },
  { ts: '2026-06-18 08:15', typ: 'entfernt',  titel: 'Alt-Report „Umsatz roh" entfernt',       detail: 'Durch Verkaufsstatistik abgelöst; Link aus Verteiler genommen.',                   wo: null,              bereich: 'VK',  wer: 'Admin' }
]

function ladeGespeicherte() {
  try { const a = JSON.parse(localStorage.getItem(KEY) || '[]'); return Array.isArray(a) ? a : [] } catch { return [] }
}

/**
 * Ereignis protokollieren. jetzt = ISO/Zeitstempel-String vom Aufrufer
 * (im Modul bewusst kein argloses Date — Determinismus für Tests).
 */
export function protokolliere(ev, jetzt) {
  if (!ev || !ev.typ) return ladeGespeicherte()
  const eintrag = { ts: jetzt || ev.ts || '', typ: ev.typ, titel: ev.titel || '', detail: ev.detail || '', wo: ev.wo || null, bereich: ev.bereich || null, wer: ev.wer || 'System' }
  const a = [eintrag, ...ladeGespeicherte()].slice(0, 200)
  try { localStorage.setItem(KEY, JSON.stringify(a)) } catch {}
  return a
}

/** Zusammengeführte Liste (Seed + gespeicherte), neueste zuerst. */
export function ladeAenderungen({ limit, typ } = {}) {
  const alle = [...ladeGespeicherte(), ...SEED_AENDERUNGEN]
    .filter((e) => !typ || e.typ === typ)
    .sort((a, b) => String(b.ts).localeCompare(String(a.ts)))
  return limit ? alle.slice(0, limit) : alle
}

/** Kompakte Kennzahlen für die Kopfzeile (neue/entfernte/geänderte zuletzt). */
export function aenderungsStatistik(tageFenster = 7, heute) {
  const alle = ladeAenderungen()
  const grenze = heute ? String(heute) : alle.length ? String(alle[Math.min(alle.length - 1, 12)].ts).slice(0, 10) : ''
  const imFenster = (e) => !grenze || String(e.ts).slice(0, 10) >= grenze
  const z = { neu: 0, entfernt: 0, geaendert: 0, gesamt: 0 }
  for (const e of alle) {
    if (!imFenster(e)) continue
    z.gesamt++
    if (e.typ === 'neu') z.neu++
    else if (e.typ === 'entfernt') z.entfernt++
    else if (e.typ === 'geaendert' || e.typ === 'kpi') z.geaendert++
  }
  return z
}
