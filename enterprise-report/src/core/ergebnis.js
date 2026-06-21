// =========================================================================
//  ERGEBNISRECHNUNG (Gesamtkostenverfahren, GKV) — GuV als Staffel und als
//  Ergebniskonto (T-Konto). Reportingtauglich, bewusst kompakt.
//
//   Erträge  − Aufwendungen = Betriebsergebnis
//   T-Konto:  SOLL = Aufwendungen (+ Saldo Gewinn)  |  HABEN = Erträge
//
//  Datenart (Ist/Tagesreporting/Plan/Forecast) skaliert die Positionen.
// =========================================================================
import { DATENARTEN as PM_DATENARTEN } from './periodenmodell.js'

export const DATENARTEN = PM_DATENARTEN.map((d) => ({ id: d.id, name: d.name }))

// Positionen (Mio €, Ist) mit Plan-/Forecast-Faktor.
export const ERTRAEGE = [
  { id: 'umsatz',    name: 'Umsatzerlöse',              wert: 52.0, pf: 0.96, ff: 1.03 },
  { id: 'bestand',   name: 'Bestandserhöhung',          wert: 0.6,  pf: 1.00, ff: 1.00 },
  { id: 'sonstigeE', name: 'Sonstige betriebl. Erträge', wert: 0.4, pf: 1.00, ff: 1.00 }
]
export const AUFWENDUNGEN = [
  { id: 'material',  name: 'Materialaufwand',              wert: 32.2, pf: 0.95, ff: 1.04 },
  { id: 'personal',  name: 'Personalaufwand',             wert: 10.5, pf: 0.98, ff: 1.01 },
  { id: 'abschr',    name: 'Abschreibungen',              wert: 0.7,  pf: 1.00, ff: 1.00 },
  { id: 'sonstigeA', name: 'Sonstige betriebl. Aufwand',  wert: 7.6,  pf: 0.96, ff: 1.03 }
]

function faktor(p, da) { return da === 'plan' ? p.pf : da === 'forecast' ? p.ff : 1 }
const r2 = (x) => Math.round(x * 100) / 100

/** Skalierte Positionen + Summen + Betriebsergebnis für eine Datenart. */
export function ergebnis(datenart = 'ist') {
  const ertraege = ERTRAEGE.map((p) => ({ ...p, wert: r2(p.wert * faktor(p, datenart)) }))
  const aufwendungen = AUFWENDUNGEN.map((p) => ({ ...p, wert: r2(p.wert * faktor(p, datenart)) }))
  const summeErtrag = r2(ertraege.reduce((n, p) => n + p.wert, 0))
  const summeAufwand = r2(aufwendungen.reduce((n, p) => n + p.wert, 0))
  const betriebsergebnis = r2(summeErtrag - summeAufwand)
  return { datenart, ertraege, aufwendungen, summeErtrag, summeAufwand, betriebsergebnis }
}

/** Ergebniskonto (T-Konto): Soll/Haben inkl. Saldo, Bilanzsumme. */
export function tKonto(datenart = 'ist') {
  const e = ergebnis(datenart)
  const gewinn = e.betriebsergebnis >= 0
  const soll = e.aufwendungen.map((p) => ({ name: p.name, wert: p.wert }))
  const haben = e.ertraege.map((p) => ({ name: p.name, wert: p.wert }))
  // Saldo ausgleichen: Gewinn steht im Soll, Verlust im Haben.
  if (gewinn) soll.push({ name: 'Saldo (Gewinn/Betriebsergebnis)', wert: e.betriebsergebnis, saldo: true })
  else haben.push({ name: 'Saldo (Verlust)', wert: -e.betriebsergebnis, saldo: true })
  const summe = r2(Math.max(e.summeErtrag, e.summeAufwand))
  return { soll, haben, summe, betriebsergebnis: e.betriebsergebnis, gewinn }
}
