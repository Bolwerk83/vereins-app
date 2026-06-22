// =========================================================================
//  VERTEILER — automatischer Berichtsversand.
//
//  Modell „Hybrid" (Standard): gespeichert wird ein reproduzierbarer
//  DATENSTAND-ZEIGER (Bericht + Periode/Datumssicht/Datenart/Filter), NICHT
//  die fertige Datei. Beim Versand werden daraus PDF/Excel als Anhang plus
//  ein Live-Link erzeugt — jeweils mit Datenstand-Stempel.
//
//  Auslösung: Zeitplan (Rhythmus) UND/ODER Ereignis (z. B. Abschluss-Freigabe).
//  Persistenz: localStorage (später DWH/Backend-Scheduler, s. docs/16).
// =========================================================================
import { ladeModell, mixBeschreibung, AKTUELLER_MONAT } from './periodenmodell.js'

export const MODI = [
  { id: 'hybrid',   name: 'Hybrid (Anhang + Live-Link)', hinweis: 'Reproduzierbar + bequem (empfohlen)' },
  { id: 'live',     name: 'Nur Live-Link',               hinweis: 'Immer aktuell, nicht reproduzierbar' },
  { id: 'snapshot', name: 'Voll-Snapshot (Datei)',       hinweis: 'Eingefroren, revisionssicher' }
]
export const FORMATE = [
  { id: 'pdf',   name: 'PDF' }, { id: 'excel', name: 'Excel' }, { id: 'link', name: 'Live-Link' }
]
export const RHYTHMEN = [
  { id: 'taeglich',      name: 'Täglich' }, { id: 'woechentlich', name: 'Wöchentlich' },
  { id: 'monatlich',     name: 'Monatlich' }, { id: 'quartalsweise', name: 'Quartalsweise' }
]
export const EREIGNISSE = [
  { id: 'abschluss_freigabe', name: 'Monatsabschluss freigegeben' },
  { id: 'fc_aktualisiert',    name: 'Forecast aktualisiert' },
  { id: 'alert',              name: 'Neuer kritischer Alert' }
]
export const BERICHT_OPTIONEN = [
  { id: 'management-report', name: 'Management Report' },
  { id: 'versionsvergleich', name: 'Versionsvergleich (Ist/Plan/FC)' },
  { id: 'berichtsbaum',      name: 'Berichtsbaum (gewählter Knoten)' },
  { id: 'alerts',            name: 'Alerts-Übersicht' }
]

/** Reproduzierbarer Datenstand-Stempel (für Anhang + Mailtext). */
export function datenstandStempel(modell = ladeModell()) {
  const d = new Date().toLocaleDateString('de-DE')
  return `Stand ${d} · Bezug ${AKTUELLER_MONAT} · Datumssicht ${modell.datumssicht} · Mix: ${mixBeschreibung(modell)}`
}

const KEY = 'er_verteiler'
export function ladeVerteiler() { try { return JSON.parse(localStorage.getItem(KEY) || '[]') } catch { return [] } }
function speichere(arr) { localStorage.setItem(KEY, JSON.stringify(arr)); return arr }

export function neuerVerteiler() {
  const v = {
    id: 'v_' + Date.now().toString(36),
    name: 'Neuer Verteiler', bericht: 'management-report', reportId: '',
    empfaenger: [], formate: ['pdf', 'link'], modus: 'hybrid',
    rhythmus: 'monatlich', zeit: '07:00', tag: '5. Werktag',
    ereignisse: [], aktiv: true, letzterVersand: null
  }
  return speichere([...ladeVerteiler(), v])
}
export function aktualisiere(id, patch) { return speichere(ladeVerteiler().map((v) => (v.id === id ? { ...v, ...patch } : v))) }
export function loesche(id) { return speichere(ladeVerteiler().filter((v) => v.id !== id)) }

/** Liste ins Backend übernehmen (aktiviert die Zeitpläne). Best-effort.
 *  Optional eine angereicherte Liste (z. B. mit Inhalts-Bundles) übergeben. */
export async function imBackendAktivieren(liste = ladeVerteiler()) {
  const r = await fetch('/api/verteiler', {
    method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(liste)
  })
  if (!r.ok) throw new Error('Backend nicht erreichbar (läuft der Server?)')
  return r.json() // { status, anzahl, mail: 'konfiguriert'|'dry-run' }
}

/** „Versand-Paket" für die Vorschau / den späteren Backend-Versand. */
export function versandPaket(v) {
  return {
    an: v.empfaenger,
    betreff: `${BERICHT_OPTIONEN.find((b) => b.id === v.bericht)?.name || v.bericht} — ${datenstandStempel()}`,
    modus: v.modus,
    anhaenge: v.modus === 'live' ? [] : v.formate.filter((f) => f !== 'link'),
    link: v.formate.includes('link') || v.modus !== 'snapshot',
    stempel: datenstandStempel()
  }
}
