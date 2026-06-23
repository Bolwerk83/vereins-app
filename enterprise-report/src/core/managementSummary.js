// =========================================================================
//  MANAGEMENT-SUMMARY (regelbasiert, OHNE KI) — erzeugt aus den echten Zahlen
//  des Quartalsberichts einen Vorstands-Text: Lage, groesster Treiber der
//  Plan-Abweichung, groesste Chance, groesstes Risiko und eine konkrete
//  Empfehlung. Mehrere Vorlagen formulieren je nach Ergebnislage unter-
//  schiedlich (kompakt / ausfuehrlich / Risiko- bzw. Chancen-Fokus / Zahlen).
//  Bewusst deterministisch und ohne LLM — funktioniert auch, wenn KI-Dienste
//  deaktiviert sind. Reine Lesefunktion ohne Seiteneffekte.
// =========================================================================
import { SERIEN_IDS, SERIEN, kennzahlenMonate, kanalSplit, inlandAusland, LAENDER, MARKT } from './quartalsbericht.js'

const mio = (n) => (n / 1e6).toLocaleString('de-DE', { minimumFractionDigits: 1, maximumFractionDigits: 1 }) + ' Mio €'
const pct = (n) => (n >= 0 ? '+' : '') + (+n.toFixed(1)).toLocaleString('de-DE') + ' %'
const status = (abwPct) => (abwPct >= 0 ? 'g' : abwPct >= -5 ? 'a' : 'r')

/** Rohanalyse: alle abgeleiteten Aussagen als strukturierte Daten. */
export function analyse(monate, { faktor = 1, periodeName = 'Berichtszeitraum', pcLabel = '' } = {}) {
  const ges = kennzahlenMonate('gesamt', monate, { faktor })
  const fokus = pcLabel && pcLabel !== 'alle' ? ` (Sicht ${pcLabel})` : ''

  // Groesster Treiber der Plan-Abweichung (ueber die Teilsegmente)
  const segmente = SERIEN_IDS.filter((id) => id !== 'gesamt')
    .map((id) => ({ id, titel: SERIEN[id].kurz, k: kennzahlenMonate(id, monate, { faktor }) }))
    .filter((s) => s.k.istMonate.length > 0)
  const treiber = segmente.slice().sort((a, b) => Math.abs(b.k.abw) - Math.abs(a.k.abw))[0]

  // Chance & Risiko aus Kanal / Internationalisierung / Laendern
  const [online, stationaer] = kanalSplit()
  const ia = inlandAusland()
  const schnellstesLand = LAENDER.slice().sort((a, b) => b.wachstum - a.wachstum)[0]
  const schwaechstesLand = LAENDER.slice().sort((a, b) => a.wachstum - b.wachstum)[0]
  const benchStark = MARKT.benchmark.find((b) => b.kpi === 'Online-Anteil') || MARKT.benchmark[0]

  const chance = [
    { wert: online.abwVjPct, text: `Online wächst ${pct(online.abwVjPct)} ggü. Vorjahr und liegt ${pct(online.abwPct)} über Plan — die Verschiebung ins E-Commerce-Geschäft trägt.` },
    { wert: ia.ausland.wachstum, text: `Das Auslandsgeschäft wächst ${pct(ia.ausland.wachstum)} (Anteil ${ia.ausland.anteil} %), getrieben von ${schnellstesLand.land} (${pct(schnellstesLand.wachstum)}).` },
    { wert: benchStark.wir - benchStark.markt, text: `${benchStark.kpi} liegt mit ${benchStark.wir} % deutlich über dem Markt (${benchStark.markt} %) — als Stärke ausspielen.` }
  ].sort((a, b) => b.wert - a.wert)[0].text

  const risiko = [
    { wert: stationaer.abwPct, text: `Der stationäre Handel liegt ${pct(stationaer.abwPct)} unter Plan (${pct(stationaer.abwVjPct)} ggü. Vorjahr) — Flächenproduktivität und Omnichannel prüfen.` },
    { wert: schwaechstesLand.wachstum, text: `${schwaechstesLand.land} schrumpft (${pct(schwaechstesLand.wachstum)}) — Ursachen analysieren, Vertrieb gegensteuern.` },
    { wert: treiber ? treiber.k.abwPct : 0, text: treiber ? `${treiber.titel} liegt ${pct(treiber.k.abwPct)} ggü. Plan und prägt die Gesamtabweichung am stärksten.` : '' }
  ].filter((r) => r.text).sort((a, b) => a.wert - b.wert)[0].text

  let empfehlung
  if (ges.abwPct < -2) {
    empfehlung = treiber
      ? `Gegensteuern beim Hauptverursacher „${treiber.titel}" (Absatz-/Preishebel), parallel margenstarke E-Bikes und das wachsende Online-/Auslandsgeschäft forcieren.`
      : 'Kostenseite straffen und margenstarke Segmente forcieren, bis der Plan wieder erreichbar ist.'
  } else if (ges.abwPct > 2) {
    empfehlung = 'Plan übererfüllt — Kapazitäten und Lieferfähigkeit sichern, Vorsprung in Online/Ausland ausbauen und in das Forecast-Update einarbeiten.'
  } else {
    empfehlung = 'Plan im Rahmen — Fokus auf die margenstarken Segmente und das stationäre Geschäft halten, Risiken früh adressieren.'
  }

  // Lage-Varianten je nach Plan-Erfüllung (fuer unterschiedliche Vorlagen)
  const richtung = ges.abwPct >= 2 ? 'übertrifft den Plan' : ges.abwPct <= -2 ? 'verfehlt den Plan' : 'liegt im Plan'
  const lage = `Im ${periodeName}${fokus} liegt der Umsatz bei ${mio(ges.ist)} — ${pct(ges.abwPct)} ggü. Plan und ${pct(ges.abwVjPct)} ggü. Vorjahr.`
  const lageKurz = `Der Umsatz ${richtung}: ${mio(ges.ist)} (${pct(ges.abwPct)} ggü. Plan, ${pct(ges.abwVjPct)} ggü. Vorjahr).`

  const punkte = [
    treiber && { typ: 'treiber', kopf: 'Größter Treiber', text: `${treiber.titel}: ${mio(treiber.k.abw)} ggü. Plan (${pct(treiber.k.abwPct)}).` },
    { typ: 'chance', kopf: 'Chance', text: chance },
    { typ: 'risiko', kopf: 'Risiko', text: risiko }
  ].filter(Boolean)

  return { status: status(ges.abwPct), ges, treiber, richtung, lage, lageKurz, chance, risiko, empfehlung, punkte }
}

// --- Vorlagen: reagieren auf die Ergebnislage, ohne KI ---------------------
export const SUMMARY_VORLAGEN = [
  { id: 'ausfuehrlich', name: 'Ausführlich', beschreibung: 'Lage, Treiber, Chance, Risiko und Empfehlung.' },
  { id: 'kompakt', name: 'Vorstand kompakt', beschreibung: 'Zwei Sätze: Lage und Empfehlung.' },
  { id: 'risiko', name: 'Risiko-Fokus', beschreibung: 'Lage, das größte Risiko und die Gegenmaßnahme.' },
  { id: 'chance', name: 'Chancen-Fokus', beschreibung: 'Lage, die größte Chance und der Ausbau.' },
  { id: 'zahlen', name: 'Zahlen-Fokus', beschreibung: 'Knappe, faktenorientierte Aufzählung.' }
]

/** Text einer Vorlage aus der Analyse erzeugen (deterministisch, ohne KI). */
export function summaryNachVorlage(monate, opts = {}, vorlageId = 'ausfuehrlich') {
  const a = analyse(monate, opts)
  switch (vorlageId) {
    case 'kompakt':
      return `${a.lageKurz} Empfehlung: ${a.empfehlung}`
    case 'risiko':
      return `${a.lage} Im Fokus steht das größte Risiko: ${a.risiko} Gegenmaßnahme: ${a.empfehlung}`
    case 'chance':
      return `${a.lage} Größte Chance: ${a.chance} Diese Stärke gezielt ausbauen und in die Planung übernehmen.`
    case 'zahlen': {
      const t = a.treiber ? ` · Treiber ${a.treiber.titel} (${pct(a.treiber.k.abwPct)})` : ''
      return `Umsatz ${mio(a.ges.ist)} | Plan ${pct(a.ges.abwPct)} | Vorjahr ${pct(a.ges.abwVjPct)}${t}. Empfehlung: ${a.empfehlung}`
    }
    case 'ausfuehrlich':
    default:
      return `${a.lage} ${a.punkte.map((p) => `${p.kopf}: ${p.text}`).join(' ')} Empfehlung: ${a.empfehlung}`
  }
}

/**
 * Strukturierte Summary fuer die reichhaltige Darstellung im Bericht.
 * @returns {{status, lage, punkte, empfehlung, fliesstext}}
 */
export function managementSummary(monate, opts = {}) {
  const a = analyse(monate, opts)
  return { status: a.status, lage: a.lage, punkte: a.punkte, empfehlung: a.empfehlung, fliesstext: summaryNachVorlage(monate, opts, 'ausfuehrlich') }
}
