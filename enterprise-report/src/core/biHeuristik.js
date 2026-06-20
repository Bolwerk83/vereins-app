// =========================================================================
//  OFFLINE-HEURISTIK für das Self-Service BI.
//  Erzeugt OHNE LLM einen plausiblen, controller-geprägten Bericht aus der
//  Anforderung (Stichwort-Matching), der KPI-Registry und den aktuellen
//  Werten. So ist das Modul sofort testbar; das echte Claude-Backend
//  liefert denselben Vertrag (agentBoard.js -> BI_REPORT_FELDER).
// =========================================================================
import { KPI } from './kpiRegistry.js'
import { ampelStatus } from './ampel.js'
import { formatWert } from '../design/theme.js'
import { CONTROLLER_LEAD, BERATER, relevanteBerater } from './agentBoard.js'
import { darfKpi } from './rbac.js'
import { kpiInsight } from './insights.js'

// Stichwort -> KPI-IDs. Bewusst schlicht; das LLM kann es später semantisch.
const STICHWORTE = [
  [/retour|rückgab|reklam/i, ['retourenquote']],
  [/online|shop|e-?commerce|kanal/i, ['onlineAnteil', 'nettoumsatz']],
  [/umsatz|absatz|verkauf/i, ['nettoumsatz', 'onlineAnteil']],
  [/marge|deckungsbeitrag|\bdb\b/i, ['dbQuote', 'wareneinsatzquote']],
  [/einkauf|lieferant|einstand|beschaffung/i, ['einkaufsvolumen', 'liefertreue', 'wareneinsatzquote']],
  [/produktion|ausschuss|fertigung|qualität|nacharbeit/i, ['ausschuss', 'auslastung', 'wareneinsatzquote']],
  [/lager|bestand|reichweite|vorrat/i, ['lagerbestand', 'reichweite']],
  [/liquidit|cash|working capital|kapitalbindung/i, ['cashConversion', 'lagerbestand']],
  [/personal|mitarbeiter|fluktuation|hr/i, ['personalkosten', 'fluktuation']],
  [/it|shop-?verfügbar|system|pim/i, ['shopVerfuegbarkeit']],
  [/ebit|ergebnis|gewinn|profitab/i, ['ebit', 'dbQuote']],
  [/leasing|restwert|flotte/i, ['nettoumsatz']],
  // Controlling-Bereiche
  [/kostenrechnung|klr|gemeinkost|herstellkost|kostenstelle|kostentr(ä|ae)ger|stückkost|stueckkost/i, ['herstellkostenJeRad', 'gemeinkostenquote', 'gesamtkosten']],
  [/prognose|forecast|absatzprognose|vorhersage|orderbuch|auftragsbestand/i, ['absatzprognose', 'umsatzprognose', 'forecastGenauigkeit']],
  [/planung|budget|plan-?ist|zielerreichung|erfolgsplan|soll-?ist/i, ['umsatzZielerreichung', 'kostendisziplin', 'ergebnisZielerreichung']],
  [/produktionsplan|kapazit(ä|ae)t|schicht|fertigungsprogramm|auslastung/i, ['kapazitaetsauslastung', 'planErfuellungProduktion', 'schichtauslastung']],
  [/lagercontrolling|bestandscontrolling|supply.?chain|lagerumschlag|lieferf(ä|ae)hig|servicegrad|überbestand|ueberbestand|abc/i, ['lagerumschlag', 'lieferfaehigkeit', 'ueberbestand', 'reichweite']],
  [/fibu|finanzbuchhalt|abschluss|bilanz|rückstellung|rueckstellung|eigenkapital|abgrenzung|hgb/i, ['betrieblichesErgebnis', 'eigenkapitalquote', 'abschlussdauer', 'rueckstellungen']],
  [/investition|capex|liquidit|cashflow|cash.?flow|kreditlinie|zahlungsf/i, ['operativerCashflow', 'freieLiquiditaet', 'investBudgettreue']],
  [/vertriebscontrolling|rabatt|kundenprofitab|vertriebskost|kanalprofitab|neukunden/i, ['vertriebskostenquote', 'rabattquote', 'neukundenanteil', 'dbQuote']],
  [/personalcontrolling|produktivit|umsatz je|überstund|ueberstund|krankenstand|fte/i, ['personalkostenquote', 'umsatzJeFTE', 'krankenstand', 'fluktuation']],
  [/risiko|forderung|dso|überfällig|ueberfaellig|ausfall|mahn|klumpen|konzentration|debitor/i, ['dso', 'ueberfaelligkeitsquote', 'forderungsausfall', 'klumpenrisikoTop3']],
  [/nachhaltig|esg|co2|co₂|emission|energie|ökostrom|oekostrom|recycling|klima|kreislauf/i, ['co2ProRad', 'recyclingquote', 'oekostromanteil', 'energieJeRad']],
  [/treasury|zins|verschuldung|leverage|hedge|währung|waehrung|fx|liquidität|finanzierung/i, ['nettoverschuldungEbitda', 'zinsdeckung', 'hedgeQuote', 'durchschnittszins']],
  [/qualität|qualitaet|reklamation|nacharbeit|garantie|fehlerkosten|copq|ausschuss/i, ['reklamationsquote', 'nacharbeitsquote', 'firstPassYield', 'qualitaetskostenquote']],
  [/marketing|kampagne|roas|conversion|werbung|cac|funnel|kundengewinnung/i, ['roas', 'cac', 'conversionRate', 'marketingkostenquote']],
  [/konzern|beteiligung|segment|roce|intercompany|konsolidier|gesellschaft|tochter|ausland/i, ['roce', 'eigenkapitalrendite', 'auslandsanteil', 'intercompanyQuote']]
]

function gematchteKpis(text) {
  const ids = new Set()
  for (const [re, kpis] of STICHWORTE) if (re.test(text)) kpis.forEach((k) => ids.add(k))
  // Controller-Standard: Ergebnis & Liquidität immer mitdenken
  ;['ebit', 'cashConversion'].forEach((k) => ids.add(k))
  return [...ids].filter((id) => KPI[id])
}

export function biHeuristik(anforderung, werte, rolle = null) {
  // Object-Level-Security: geschützte KPIs ohne Berechtigung gar nicht erst aufnehmen.
  const kpiIds = gematchteKpis(anforderung).filter((id) => !rolle || darfKpi(rolle, KPI[id]))
  const bereiche = [...new Set(kpiIds.map((id) => KPI[id].bereich))]
  const berater = relevanteBerater(bereiche)

  const relevanteKpis = kpiIds.map((id) => ({
    id, begruendung: KPI[id].beschreibung
  }))

  const befunde = kpiIds.map((id) => {
    const ins = kpiInsight(id, werte[id])
    return { aussage: `${KPI[id].name}: ${ins.aussage}`, bewertung: ins.status }
  })

  // Maßnahmen aus den bekannten Hebeln ableiten, gefiltert nach Relevanz.
  const alleMassnahmen = [
    { titel: 'Online-Retouren auf 7 % senken (PIM + Größenberatung)', bereich: 'VK', hebel: 'Umsatzqualität', ergebnis: '+0,8 Mio € Netto', liquiditaet: 'gebundene Ware sinkt', aufwand: 'mittel', prioritaet: 1, ids: ['retourenquote', 'onlineAnteil', 'nettoumsatz'] },
    { titel: 'Preisgleitklausel & Zweitquelle Antrieb', bereich: 'EK', hebel: 'Wareneinsatzquote', ergebnis: '+0,5–0,8 Mio € DB', liquiditaet: 'neutral', aufwand: 'mittel', prioritaet: 2, ids: ['einkaufsvolumen', 'liefertreue', 'wareneinsatzquote'] },
    { titel: 'Ausschuss & Nacharbeit auf Ziel (≤1,5 %)', bereich: 'PR', hebel: 'Wareneinsatzquote', ergebnis: '~0,5 Mio €/Pp', liquiditaet: 'neutral', aufwand: 'mittel', prioritaet: 2, ids: ['ausschuss', 'auslastung'] },
    { titel: 'Bestellmengen an Reichweite (40 Tg) koppeln', bereich: 'LOG', hebel: 'Bestandsabbau', ergebnis: 'Lagerkosten −0,21 Mio €/J', liquiditaet: '≈ 3,5 Mio € frei', aufwand: 'gering', prioritaet: 1, ids: ['lagerbestand', 'reichweite', 'cashConversion'] },
    { titel: 'Externes Reservelager Nord kündigen', bereich: 'LOG', hebel: 'Bestandsabbau', ergebnis: '−0,15 Mio €/J', liquiditaet: 'positiv', aufwand: 'gering', prioritaet: 2, ids: ['lagerbestand'] }
  ]
  const massnahmen = alleMassnahmen
    .filter((m) => m.ids.some((id) => kpiIds.includes(id)))
    .sort((a, b) => a.prioritaet - b.prioritaet)

  const beirat = [
    { bot: CONTROLLER_LEAD.name, beitrag: 'Bewertet aus Ergebnis- UND Liquiditätssicht: Symptom von Ursache trennen, die zwei Hebel (Wareneinsatzquote, Bestandsabbau) priorisieren.' },
    ...berater.map((b) => ({ bot: b.name, beitrag: b.mandat }))
  ]

  return {
    titel: `BI-Auswertung: ${anforderung.slice(0, 60)}${anforderung.length > 60 ? '…' : ''}`,
    anforderung,
    controllerSicht: 'Aus Controller-Sicht zählt nicht die Einzelzahl, sondern ihre Doppelwirkung auf Ergebnis (Marge/EBIT) und Liquidität (Working Capital). Die Anforderung wurde auf die relevanten KPIs und die beiden Konzern-Hebel zurückgeführt.',
    relevanteKpis,
    befunde,
    massnahmen: massnahmen.length ? massnahmen : alleMassnahmen.slice(0, 2),
    risiken: [
      'Datenqualität der zugrunde liegenden SQL-Abfragen (Definition je Kanal/Bereich abstimmen).',
      'Maßnahmen mit Doppelwirkung nicht isoliert betrachten — Hebel greifen ineinander.'
    ],
    beirat,
    quelle: 'heuristik'
  }
}
