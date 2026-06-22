// =========================================================================
//  VERBUCHUNG / ÜBERLEITUNG — die konfigurierten kalkulatorischen Kosten
//  ins Betriebsergebnis einrechnen (Zweikreissystem). Baut auf der
//  vollständigen Abgrenzungsrechnung auf, damit beide Sichten EINE Wahrheit
//  zeigen:
//
//    bilanzielles Betriebsergebnis (GuV)
//      − neutrales Ergebnis              → Zweckergebnis
//      − Anderskosten-Mehrbetrag (kalk. − bilanzielles Pendant)
//      − Zusatzkosten (kein Aufwand gegenüber)
//      = kalkulatorisches Betriebsergebnis
// =========================================================================
import { abgrenzung, BILANZIELLE_PENDANTS } from './abgrenzung.js'

const r2 = (x) => Math.round(x * 100) / 100

// Rückwärtskompatibel: gleiche Felder wie bisher, plus neutrale Abgrenzung.
const BILANZIELL = BILANZIELLE_PENDANTS

export function ueberleitung(datenart = 'ist') {
  const a = abgrenzung(datenart)

  const anders = a.kalk.filter((z) => z.typ === 'anders').map((z) => ({
    id: z.id, name: z.name.replace(/^Kalkulatorische?\s*/i, 'Kalk. '), kalk: z.kalkWert, bilanz: z.bilanz, mehrbetrag: z.mehrbetrag
  }))
  const summeAnders = a.summeAnders
  const zusatz = a.summeZusatz
  const bilanziellesErgebnis = a.unternehmensergebnis
  const neutralesErgebnis = a.neutralesErgebnis
  const zweckergebnis = a.zweckergebnis
  const kalkErgebnis = a.betriebsergebnis
  return { anders, summeAnders, zusatz, bilanziellesErgebnis, neutralesErgebnis, zweckergebnis, kalkErgebnis }
}

export { BILANZIELL }
