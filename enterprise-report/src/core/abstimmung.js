// =========================================================================
//  ABSTIMMBRÜCKEN — Reporting-Ist ↔ Buchhaltung (Hauptbuch) abstimmen.
//
//  Je Position: Reporting-Ist (aus der KPI-Engine) gegen den
//  Buchhaltungswert, mit Differenz (abs/%), Toleranz, Status und Kommentar.
//  So wird vor dem Abschluss sichtbar, wo Reporting und FiBu auseinander-
//  laufen — die Vertrauensbasis für die Freigabe.
//
//  Buchhaltungswert = Reporting-Ist + hinterlegtes Delta (Mock-Hauptbuch);
//  dadurch periodenrobust und mit ein paar bewussten Differenzen.
//  Status/Kommentar werden je Periode in localStorage gehalten.
// =========================================================================

// Positionen: kpiId zieht den Reporting-Ist live aus der Engine.
// delta = Buchhaltung − Reporting (Mio €); toleranz in Mio €.
export const POSITIONEN = [
  { id: 'umsatz',        name: 'Nettoumsatz',          konto: '8400 Erlöse',              kpiId: 'nettoumsatz',      delta: 0.0,  toleranz: 0.10 },
  { id: 'wareneinsatz',  name: 'Wareneinsatz',         konto: '3400 Wareneinsatz',        kpiId: 'wareneinsatz',     delta: 0.35, toleranz: 0.10 },
  { id: 'personal',      name: 'Personalkosten',       konto: '4100 Löhne/Gehälter',      kpiId: 'personalkosten',   delta: -0.04, toleranz: 0.10 },
  { id: 'gesamtkosten',  name: 'Gesamtkosten',         konto: 'Kostenarten gesamt',       kpiId: 'gesamtkosten',     delta: 0.0,  toleranz: 0.15 },
  { id: 'bestaende',     name: 'Vorräte / Bestände',   konto: '1140 Vorräte',             kpiId: 'lagerbestand',     delta: 0.45, toleranz: 0.10 },
  { id: 'rueckstell',    name: 'Rückstellungen',       konto: '3070 Rückstellungen',      kpiId: 'rueckstellungen',  delta: 0.22, toleranz: 0.10 },
  { id: 'eigenkapital',  name: 'Eigenkapital',         konto: '2000 Eigenkapital',        kpiId: 'eigenkapital',     delta: 0.0,  toleranz: 0.10 },
  { id: 'bilanzsumme',   name: 'Bilanzsumme',          konto: 'Bilanz gesamt',            kpiId: 'bilanzsumme',      delta: 0.0,  toleranz: 0.20 },
  { id: 'liquide',       name: 'Liquide Mittel',       konto: '1200 Bank/Kasse',          kpiId: 'liquideMittel',    delta: -0.03, toleranz: 0.05 },
  { id: 'cashflow',      name: 'Operativer Cashflow',  konto: 'Cashflow-Rechnung',        kpiId: 'operativerCashflow', delta: 0.18, toleranz: 0.10 }
]

export const STATUS = [
  { id: 'offen',      name: 'Offen',        ampel: 'n' },
  { id: 'klaerung',   name: 'In Klärung',   ampel: 'a' },
  { id: 'abgestimmt', name: 'Abgestimmt',   ampel: 'g' }
]
export const statusInfo = (id) => STATUS.find((s) => s.id === id) || STATUS[0]

// Abgestimmte Positionen gelten nach so vielen Tagen als „erledigt" und werden
// standardmäßig ausgeblendet (uninteressant) — für Rückfragen einblendbar.
export const FRISCH_TAGE = 7
const heuteIso = () => new Date().toISOString().slice(0, 10)
const tageSeit = (iso) => (iso ? Math.floor((Date.now() - new Date(iso).getTime()) / 86400000) : null)

const KEY = 'er_abstimmung'
function ladeState() { try { return JSON.parse(localStorage.getItem(KEY) || '{}') } catch { return {} } }
function speichere(s) { localStorage.setItem(KEY, JSON.stringify(s)); return s }

/** Gespeicherte Notiz (Status/Kommentar/Zeitstempel) je Periode+Position. */
export function ladeNotiz(periode, posId) {
  return ladeState()[periode]?.[posId] || { status: null, kommentar: '', am: null }
}
export function setNotiz(periode, posId, patch) {
  const s = ladeState()
  s[periode] = s[periode] || {}
  // Bei Statuswechsel den Zeitstempel mitführen (Basis fürs Ausblenden).
  const mitZeit = 'status' in patch ? { ...patch, am: heuteIso() } : patch
  s[periode][posId] = { ...ladeNotiz(periode, posId), ...mitZeit }
  return speichere(s)
}

/** Hauptbuch-Salden vom Backend laden (MSSQL/Mock). null = nicht erreichbar. */
export async function ladeHauptbuch(periode) {
  try {
    const r = await fetch(`/api/hauptbuch/${encodeURIComponent(periode)}`)
    if (!r.ok) return null
    return r.json() // { quelle: 'fibu'|'mock', werte: { posId: saldo } }
  } catch { return null }
}

/**
 * Eine Brückenzeile je Position. hauptbuch (optional, vom Backend) liefert
 * ABSOLUTE FiBu-Salden; fehlt es, wird der Buchhaltungswert lokal aus dem
 * hinterlegten Delta simuliert.
 */
export function bruecken(werte = {}, periode = '', hauptbuch = null) {
  return POSITIONEN.map((p) => {
    const ist = p.kpiId && werte[p.kpiId] != null ? werte[p.kpiId] : null
    const buchhaltung = hauptbuch && hauptbuch[p.id] != null
      ? +(+hauptbuch[p.id]).toFixed(2)
      : (ist != null ? +(ist + (p.delta || 0)).toFixed(2) : null)
    const diff = ist != null && buchhaltung != null ? +(ist - buchhaltung).toFixed(2) : null
    const diffPct = diff != null && buchhaltung ? (diff / Math.abs(buchhaltung)) * 100 : null
    const imRahmen = diff != null && Math.abs(diff) <= (p.toleranz ?? 0)
    const notiz = ladeNotiz(periode, p.id)
    // Effektiver Status: gesetzter Status, sonst aus Toleranz abgeleitet.
    const status = notiz.status || (imRahmen ? 'abgestimmt' : 'klaerung')
    // „erledigt" = abgestimmt und entweder automatisch (Toleranz) oder schon
    // länger als FRISCH_TAGE manuell abgestimmt → standardmäßig ausblenden.
    const tageHer = tageSeit(notiz.am)
    const frisch = status === 'abgestimmt' && notiz.am != null && tageHer < FRISCH_TAGE
    const erledigt = status === 'abgestimmt' && !frisch
    return { ...p, ist, buchhaltung, diff, diffPct, imRahmen, status, kommentar: notiz.kommentar, gesetzt: !!notiz.status, am: notiz.am || null, tageHer, frisch, erledigt }
  })
}

/** Zusammenfassung für Badges und die Abschluss-Kopplung. */
export function abstimmZusammenfassung(werte, periode, hauptbuch = null) {
  const b = bruecken(werte, periode, hauptbuch)
  const offen = b.filter((x) => x.status !== 'abgestimmt').length
  const diffSumme = b.reduce((n, x) => n + Math.abs(x.diff || 0), 0)
  return { gesamt: b.length, offen, abgestimmt: b.length - offen, diffSumme: +diffSumme.toFixed(2) }
}
