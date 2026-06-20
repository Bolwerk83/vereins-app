// =========================================================================
//  INSIGHTS — automatische Auswertung "wie ein Controller".
//  Macht aus Zahlen Aussagen: Abweichung zum Ziel, Veränderung ggü.
//  Vorperiode, Trendrichtung (gut/schlecht) und eine Klartext-Bewertung.
//  Pro Knoten zusätzlich eine Lagebewertung + Top-Handlungsbedarf.
// =========================================================================
import { KPI } from './kpiRegistry.js'
import { ampelStatus, trendAusHistorie } from './ampel.js'
import { formatWert } from '../design/theme.js'

const signed = (v, einheit) => (v >= 0 ? '+' : '') + formatWert(v, einheit)
const signedPct = (v) => (v >= 0 ? '+' : '') + v.toFixed(1) + ' %'

/** Insight zu einer KPI: Status, Ziel-/VJ-Abweichung, Trend, Klartext. */
export function kpiInsight(kpiId, wert, reihe = []) {
  const k = KPI[kpiId]
  if (!k) return null
  const status = ampelStatus({ wert, ziel: k.ziel, richtung: k.richtung, warn: k.warn })
  const werteReihe = reihe.map((r) => r.wert).filter((v) => v != null)
  const t = trendAusHistorie(werteReihe, k.richtung)
  const vj = werteReihe.length >= 2 ? werteReihe[werteReihe.length - 2] : null
  const deltaVj = vj != null && wert != null ? wert - vj : null
  const deltaVjPct = vj ? (wert / vj - 1) * 100 : null

  let abwZiel = null, abwZielPct = null
  if (k.ziel != null && wert != null) { abwZiel = wert - k.ziel; abwZielPct = (wert / k.ziel - 1) * 100 }

  // Klartext
  let aussage
  if (k.ziel == null) {
    aussage = 'Kein Ziel hinterlegt — rein informativ.'
  } else {
    const lage = status === 'g' ? 'im Ziel' : status === 'a' ? 'knapp außerhalb des Ziels' : 'deutlich außerhalb des Ziels'
    const seite = k.richtung === 'tief_gut' ? (wert <= k.ziel ? 'unter' : 'über') : (wert >= k.ziel ? 'über' : 'unter')
    aussage = `${formatWert(wert, k.einheit)} — ${lage}, ${seite} Ziel ${formatWert(k.ziel, k.einheit)}.`
    if (deltaVjPct != null) {
      const e = t.trend === 'flat' ? 'stabil ggü. Vorjahr' : (t.istGut ? 'Verbesserung ggü. Vorjahr' : 'Verschlechterung ggü. Vorjahr')
      aussage += ` ${e} (${signedPct(deltaVjPct)}).`
    }
  }

  return {
    id: kpiId, k, wert, status,
    abwZiel, abwZielPct, deltaVj, deltaVjPct, trend: t,
    zielText: k.ziel != null ? `${signed(abwZiel, k.einheit)} (${signedPct(abwZielPct)})` : '—',
    vjText: deltaVj != null ? `${signed(deltaVj, k.einheit)} (${signedPct(deltaVjPct)})` : '—',
    aussage, istGutTrend: t.istGut
  }
}

const SCHWERE = { r: 2, a: 1, g: 0, n: -1 }

/** Lagebewertung eines Knotens: Kernaussage, Ampel-Verteilung, Top-Handlungsbedarf. */
export function knotenBewertung(insights = []) {
  const aktiv = insights.filter(Boolean)
  const verteilung = { g: 0, a: 0, r: 0, n: 0 }
  aktiv.forEach((i) => { verteilung[i.status]++ })

  const auffaellig = aktiv
    .filter((i) => i.status === 'r' || i.status === 'a')
    .sort((a, b) => (SCHWERE[b.status] - SCHWERE[a.status]) || (Math.abs(b.abwZielPct || 0) - Math.abs(a.abwZielPct || 0)))
  const worst = auffaellig[0]

  let kernaussage
  if (verteilung.r > 0) {
    kernaussage = `Handlungsbedarf: ${verteilung.r} Kennzahl${verteilung.r > 1 ? 'en' : ''} deutlich außerhalb des Ziels` +
      (worst ? ` — v. a. ${worst.k.name}.` : '.')
  } else if (verteilung.a > 0) {
    kernaussage = `${verteilung.a} Kennzahl${verteilung.a > 1 ? 'en' : ''} beobachten; keine kritischen Abweichungen.`
  } else if (verteilung.g > 0) {
    kernaussage = 'Alle bewerteten Kennzahlen liegen im Ziel.'
  } else {
    kernaussage = 'Überwiegend informative Kennzahlen ohne Zielvorgabe.'
  }

  return { verteilung, kernaussage, topHandlungsbedarf: auffaellig.slice(0, 3), gesamt: aktiv.length }
}
