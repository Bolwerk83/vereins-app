// =========================================================================
//  BERICHTSKONSISTENZ — der berichtsuebergreifende Quercheck. Das wichtigste
//  Vertrauensmerkmal eines Controlling-Tools: dieselbe Groesse ergibt in
//  jedem Bericht denselben Wert. Hier wird der Jahresumsatz aus den einzelnen
//  Berichten unabhaengig berechnet und gegen die gemeinsame Datenbasis
//  (~52 Mio EUR) abgeglichen. Reine Lesefunktionen, keine Seiteneffekte.
// =========================================================================
import * as vk from './verkaufsstatistik.js'
import * as qb from './quartalsbericht.js'
import * as pc from './profitcenter.js'
import * as fk from './finanzkennzahlen.js'

export const ZIEL_UMSATZ = 52e6      // harmonisierter Jahresumsatz (EUR)
const WARN = 0.02                     // > 2 % Abweichung = beobachten
const FEHLER = 0.05                   // > 5 % Abweichung = Abstimmfehler

/** Jahresumsatz, wie ihn jeder Bericht unabhaengig ausweist (in EUR). */
export function umsatzQuellen() {
  return [
    { id: 'verkauf', bericht: 'Verkaufsstatistik', basis: 'Σ Warengruppen', wert: vk.kennzahlen().umsatz },
    { id: 'quartal', bericht: 'Quartalsbericht', basis: 'Σ Monatsplan (gesamt)', wert: qb.SERIEN.gesamt.plan.reduce((a, b) => a + b, 0) },
    { id: 'profitcenter', bericht: 'Profit-Center-Ergebnis', basis: 'Σ Geschäftsbereiche', wert: pc.auswertungNach('geschaeftsbereich').rows.reduce((n, r) => n + r.umsatz, 0) * 1e6 },
    { id: 'guv', bericht: 'Finanz-Cockpit (GuV)', basis: 'Umsatzerlöse', wert: fk.scaleGuv(1).umsatz * 1e6 }
  ]
}

function status(abwPct) {
  const a = Math.abs(abwPct)
  return a > FEHLER * 100 ? 'fehler' : a > WARN * 100 ? 'warnung' : 'ok'
}

/** Konsistenz-Report: je Quelle die Abweichung zur Zielbasis + Gesamtstatus. */
export function konsistenzReport() {
  const quellen = umsatzQuellen()
  const rows = quellen.map((q) => {
    const abwPct = (q.wert - ZIEL_UMSATZ) / ZIEL_UMSATZ * 100
    return { ...q, abwPct: +abwPct.toFixed(2), status: status(abwPct) }
  })
  const maxAbw = Math.max(...rows.map((r) => Math.abs(r.abwPct)))
  // Spannweite ueber alle Berichte (min↔max) als zweite Sicht auf die Streuung
  const werte = rows.map((r) => r.wert)
  const spanne = (Math.max(...werte) - Math.min(...werte)) / ZIEL_UMSATZ * 100
  const gesamt = rows.some((r) => r.status === 'fehler') ? 'fehler' : rows.some((r) => r.status === 'warnung') ? 'warnung' : 'ok'
  return { rows, ziel: ZIEL_UMSATZ, maxAbwPct: +maxAbw.toFixed(2), spannePct: +spanne.toFixed(2), gesamt }
}
