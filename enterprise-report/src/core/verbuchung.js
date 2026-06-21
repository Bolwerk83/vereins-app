// =========================================================================
//  VERBUCHUNG / ÜBERLEITUNG — die konfigurierten kalkulatorischen Kosten
//  ins Betriebsergebnis einrechnen (Zweikreissystem):
//
//    bilanzielles Betriebsergebnis (GuV)
//      − Anderskosten-Mehrbetrag (kalk. − bilanzielles Pendant)
//      − Zusatzkosten (kein Aufwand gegenüber)
//      = kalkulatorisches Betriebsergebnis
//
//  Werte stammen LIVE aus der Kalkulatorik-Konfiguration und der GuV.
// =========================================================================
import { gesamt } from './kalkulatorik.js'
import { ergebnis } from './ergebnis.js'

const r2 = (x) => Math.round(x * 100) / 100

// Bilanzielle Pendants der Anderskosten (Mio €): so viel steckt als echter
// Aufwand bereits in der GuV.
const BILANZIELL = { abschreibung: 0.7, zinsen: 0.0, wagnis: 0.0, miete: 0.0 }

export function ueberleitung(datenart = 'ist') {
  const g = gesamt()
  const wertVon = (id) => g.zeilen.find((z) => z.id === id)?.wert || 0

  const anders = [
    { id: 'abschreibung', name: 'Kalk. Abschreibung', kalk: wertVon('abschreibung'), bilanz: BILANZIELL.abschreibung },
    { id: 'zinsen', name: 'Kalk. Zinsen', kalk: wertVon('zinsen'), bilanz: BILANZIELL.zinsen },
    { id: 'wagnis', name: 'Kalk. Wagnisse', kalk: wertVon('wagnis'), bilanz: BILANZIELL.wagnis },
    { id: 'miete', name: 'Kalk. Miete', kalk: wertVon('miete'), bilanz: BILANZIELL.miete }
  ].map((a) => ({ ...a, mehrbetrag: r2(a.kalk - a.bilanz) }))

  const summeAnders = r2(anders.reduce((n, a) => n + a.mehrbetrag, 0))
  const zusatz = r2(wertVon('unternehmerlohn'))
  const bilanziellesErgebnis = ergebnis(datenart).betriebsergebnis
  const kalkErgebnis = r2(bilanziellesErgebnis - summeAnders - zusatz)
  return { anders, summeAnders, zusatz, bilanziellesErgebnis, kalkErgebnis }
}
