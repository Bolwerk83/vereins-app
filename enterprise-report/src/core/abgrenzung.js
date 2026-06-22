// =========================================================================
//  ABGRENZUNGSRECHNUNG / BETRIEBSÜBERLEITUNGSBOGEN (BÜB) — der vollständige
//  Übergang von der Finanzbuchhaltung (GuV) zur Kosten-/Leistungsrechnung:
//
//    GuV-Aufwand  − neutraler Aufwand          = Zweckaufwand (→ Grundkosten)
//    GuV-Ertrag   − neutraler Ertrag           = Zweckertrag  (→ Leistungen)
//    Grundkosten  − bilanz. Pendant + kalk.    = Kosten der KLR
//
//  Identitäten (alle Beträge Mio €):
//    Unternehmensergebnis (GuV) = neutrales Ergebnis + Zweckergebnis
//    Betriebsergebnis (KLR)     = Zweckergebnis + Verrechnungsdifferenz
//
//  So werden die kalkulatorischen Kosten „echt verbucht": als Kostenart in
//  der KLR und im Betriebsergebnis — nach Abgrenzung der neutralen Posten.
// =========================================================================
import { ergebnis } from './ergebnis.js'
import { gesamt as kalkGesamt } from './kalkulatorik.js'

const r2 = (x) => Math.round(x * 100) / 100

// Bilanzielle Pendants der kalkulatorischen Anderskosten: so viel steckt als
// echter Aufwand bereits in der GuV (wird in der KLR durch den kalk. Wert ersetzt).
export const BILANZIELLE_PENDANTS = { abschreibung: 0.7, zinsen: 0, wagnis: 0, miete: 0, unternehmerlohn: 0 }

// Neutrale (nicht-betriebliche / periodenfremde / außerordentliche) Anteile der
// GuV-Sammelpositionen. quelle = id der GuV-Position; wert in Mio €.
export const NEUTRALE_AUFWENDUNGEN = [
  { quelle: 'sonstigeA', grund: 'betriebsfremd', label: 'Spenden & Sponsoring', wert: 0.3 },
  { quelle: 'sonstigeA', grund: 'periodenfremd', label: 'Steuernachzahlung Vorjahr', wert: 0.2 },
  { quelle: 'sonstigeA', grund: 'ausserordentlich', label: 'Verlust aus Anlagenabgang', wert: 0.4 }
]
export const NEUTRALE_ERTRAEGE = [
  { quelle: 'sonstigeE', grund: 'betriebsfremd', label: 'Zins-/Mieterträge, Buchgewinne', wert: 0.3 }
]

export const GRUND_LABEL = { betriebsfremd: 'betriebsfremd', periodenfremd: 'periodenfremd', ausserordentlich: 'außerordentlich' }

function spalte(positionen, neutralListe) {
  return positionen.map((p) => {
    const details = neutralListe.filter((n) => n.quelle === p.id)
    const neutral = r2(details.reduce((s, n) => s + n.wert, 0))
    return { id: p.id, name: p.name, guv: p.wert, neutral, zweck: r2(Math.max(p.wert - neutral, 0)), details }
  })
}

/**
 * Vollständige Abgrenzungsrechnung für eine Datenart.
 */
export function abgrenzung(datenart = 'ist') {
  const e = ergebnis(datenart)
  const k = kalkGesamt()
  const kalkVon = (id) => k.zeilen.find((z) => z.id === id)?.wert || 0

  const aufwendungen = spalte(e.aufwendungen, NEUTRALE_AUFWENDUNGEN)
  const ertraege = spalte(e.ertraege, NEUTRALE_ERTRAEGE)

  const summeGuvAufwand = r2(aufwendungen.reduce((n, p) => n + p.guv, 0))
  const summeGuvErtrag = r2(ertraege.reduce((n, p) => n + p.guv, 0))
  const unternehmensergebnis = r2(summeGuvErtrag - summeGuvAufwand)

  const summeNeutralAufwand = r2(aufwendungen.reduce((n, p) => n + p.neutral, 0))
  const summeNeutralErtrag = r2(ertraege.reduce((n, p) => n + p.neutral, 0))
  const neutralesErgebnis = r2(summeNeutralErtrag - summeNeutralAufwand)

  const summeZweckaufwand = r2(aufwendungen.reduce((n, p) => n + p.zweck, 0))
  const summeZweckertrag = r2(ertraege.reduce((n, p) => n + p.zweck, 0))
  const zweckergebnis = r2(summeZweckertrag - summeZweckaufwand)

  // Kalkulatorische Kostenarten (aus der Kalkulatorik-Konfiguration).
  const kalk = k.zeilen.map((z) => ({
    id: z.id, name: z.name, typ: z.typ, kalkWert: z.wert,
    bilanz: BILANZIELLE_PENDANTS[z.id] || 0,
    mehrbetrag: r2(z.wert - (BILANZIELLE_PENDANTS[z.id] || 0))
  }))
  const summeKalk = r2(kalk.reduce((n, z) => n + z.kalkWert, 0))
  const summePendants = r2(kalk.reduce((n, z) => n + z.bilanz, 0))
  const summeAnders = r2(kalk.filter((z) => z.typ === 'anders').reduce((n, z) => n + z.mehrbetrag, 0))
  const summeZusatz = r2(kalk.filter((z) => z.typ === 'zusatz').reduce((n, z) => n + z.kalkWert, 0))

  // Grundkosten = Zweckaufwand ohne die bilanziell ersetzten Pendants.
  const grundkosten = r2(summeZweckaufwand - summePendants)
  const kosten = r2(grundkosten + summeKalk)
  const leistungen = summeZweckertrag
  const betriebsergebnis = r2(leistungen - kosten)
  const verrechnungsdifferenz = r2(betriebsergebnis - zweckergebnis)

  return {
    datenart, aufwendungen, ertraege,
    neutraleAufwendungen: NEUTRALE_AUFWENDUNGEN, neutraleErtraege: NEUTRALE_ERTRAEGE,
    kalk,
    summeGuvAufwand, summeGuvErtrag, unternehmensergebnis,
    summeNeutralAufwand, summeNeutralErtrag, neutralesErgebnis,
    summeZweckaufwand, summeZweckertrag, zweckergebnis,
    grundkosten, summeKalk, summePendants, summeAnders, summeZusatz,
    kosten, leistungen, betriebsergebnis, verrechnungsdifferenz
  }
}
