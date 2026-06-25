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

// Stichwort -> KPI-IDs. Bewusst regelbasiert (ohne LLM): viele Synonyme,
// Umgangssprache, englische Begriffe und Abkürzungen, damit die Offline-
// Auswertung möglichst viele Fragen trifft. Reihenfolge egal — es werden
// ALLE passenden Muster vereinigt. Neue Synonyme einfach ergänzen.
export const STICHWORTE = [
  // --- Umsatz / Vertrieb / Kanäle ---------------------------------------
  [/umsatz|absatz|verkauf|erl(ö|oe)s(?!schm)|sales|top.?line|revenue|wachstum|wächst|waechst|geschäftsverlauf|geschaeftsverlauf/i, ['nettoumsatz', 'bruttoumsatz', 'onlineAnteil', 'prognoseWachstum']],
  [/online|shop|e-?commerce|webshop|web-?store|kanal|omni.?channel|d2c|marktplatz|amazon|station(ä|ae)r|filial/i, ['onlineAnteil', 'nettoumsatz', 'shopVerfuegbarkeit', 'conversionRate']],
  [/conversion|abschlussquote|warenkorb|funnel|absprung|bounce|check.?out|kaufabbruch/i, ['conversionRate', 'onlineAnteil', 'retourenquote']],
  [/retour|r(ü|ue)ckgab|reklam|umtausch|widerruf|return|zur(ü|ue)cksend/i, ['retourenquote', 'reklamationsquote']],
  [/rabatt|nachlass|skonto|preisnachlass|discount|aktion|promotion|sonderpreis|rückvergüt|ruckverguet|preisaktion/i, ['rabattquote', 'erloesschmaelerung', 'vertriebskostenquote']],
  [/erl(ö|oe)sschm(ä|ae)ler|gutschrift|gew(ä|ae)hrleistung|boni|bonus|preisminderung/i, ['erloesschmaelerung', 'garantiekosten']],
  [/neukund|kundengewinn|akquise|lead|pipeline|cold.?call|abschluss.?vertrieb/i, ['neukundenanteil', 'cac', 'conversionRate']],
  [/kundenbindung|stammkund|bestandskund|loyal|churn|abwander|wiederkauf|retention.?kund/i, ['nps', 'serviceanteil', 'neukundenanteil']],
  [/vertrieb|au(ß|ss)endienst|sales.?force|provision|kanalprofitab|kundenprofitab/i, ['vertriebskostenquote', 'vertriebskosten', 'dbQuote', 'neukundenanteil']],
  [/leasing|restwert|flotte|fuhrpark|miete.?rad|abo|subscription/i, ['nettoumsatz', 'serviceumsatz']],
  // --- Marge / Ergebnis -------------------------------------------------
  [/marge|deckungsbeitrag|\bdb\b|db.?quote|profitab|contribution|gewinnmarge|bruttomarge/i, ['dbQuote', 'db1', 'wareneinsatzquote']],
  [/ebit\b|betriebsergebnis|operating|operatives ergebnis|ergebnis|gewinn|profit|verdien/i, ['ebit', 'betrieblichesErgebnis', 'dbQuote', 'ergebnisZielerreichung']],
  [/ebitda|cash.?ergebnis/i, ['ebitda', 'ebit']],
  [/jahres(ü|ue)berschuss|nettoergebnis|bottom.?line|konzernergebnis|bilanzgewinn|jahresergebnis|handelsrechtlich/i, ['handelsrechtlichesErgebnis', 'betrieblichesErgebnis', 'neutralesErgebnis']],
  // --- Kosten -----------------------------------------------------------
  [/wareneinsatz|materialaufwand|materialkost|einstand|cogs|herstellaufwand|einkaufspreis|rohstoffkost/i, ['wareneinsatz', 'wareneinsatzquote', 'herstellkostenJeRad']],
  [/herstellkost|st(ü|ue)ckkost|produktkost|herstellungskost|herstellkosten je|cost.?per.?unit/i, ['herstellkosten', 'herstellkostenJeRad', 'gesamtkosten']],
  [/gemeinkost|overhead|verwaltungskost|umlage|gemeinkostenquote/i, ['gemeinkosten', 'gemeinkostenquote']],
  [/gesamtkost|kostenblock|kostenbasis|cost.?base|kostenstruktur|kostentr(ä|ae)ger|kostenstelle|klr|kostenrechnung/i, ['gesamtkosten', 'gemeinkostenquote', 'herstellkostenJeRad', 'personalkostenquote']],
  [/fixkost|fixe kosten|strukturkost|leerkost/i, ['gemeinkostenquote', 'personalkostenquote', 'gesamtkosten']],
  // --- Einkauf / Lieferanten -------------------------------------------
  [/einkauf|lieferant|beschaffung|einstandspreis|supplier|procurement|sourcing|bezug|vorlieferant/i, ['einkaufsvolumen', 'liefertreue', 'wareneinsatzquote', 'liefertermintreue']],
  [/liefertreue|liefertermin|termintreue|otd|on.?time|lieferzuverl(ä|ae)ssig|p(ü|ue)nktlich/i, ['liefertermintreue', 'liefertreue', 'lieferfaehigkeit']],
  [/klumpen|konzentration|abh(ä|ae)ngigkeit|single.?source|lieferantenrisiko|monolieferant/i, ['klumpenrisikoTop3', 'liefertreue']],
  // --- Produktion / Qualität -------------------------------------------
  [/produktion|fertigung|\bwerk\b|manufacturing|montage|assembl|produzier|fertig/i, ['produktionsmenge', 'kapazitaetsauslastung', 'auslastung', 'planErfuellungProduktion']],
  [/ausschuss|scrap|gut-?teil|fehlteil|verschnitt/i, ['ausschuss', 'nacharbeitsquote', 'firstPassYield']],
  [/qualit(ä|ae)t|quality|fpy|first.?pass|copq|fehlerkost|pr(ü|ue)fung|nacharbeit|rework|mangel/i, ['firstPassYield', 'reklamationsquote', 'nacharbeitsquote', 'qualitaetskostenquote']],
  [/garantie|gew(ä|ae)hrleistung|kulanz|warranty|r(ü|ue)ckruf/i, ['garantiekosten', 'reklamationsquote']],
  [/kapazit(ä|ae)t|auslastung|capacity|engpass|bottleneck|schicht|takt|durchsatz/i, ['kapazitaetsauslastung', 'auslastung', 'schichtauslastung', 'kapazitaet']],
  [/produktionsplan|fertigungsprogramm|planerf(ü|ue)llung|produktionssteuer/i, ['planErfuellungProduktion', 'produktionsplan', 'produktionsmenge']],
  // --- Lager / Bestand / SCM -------------------------------------------
  [/lager|bestand|vorrat|inventar|inventory|stock|warehouse|wms/i, ['lagerbestand', 'reichweite', 'lagerumschlag', 'ueberbestand']],
  [/reichweite|days.?of.?supply|\bdos\b|bestandsreichweite|vorratsdauer/i, ['reichweite', 'lagerbestand']],
  [/umschlag|drehzahl|turns|turnover|lagerumschlag|drehung/i, ['lagerumschlag', 'reichweite']],
  [/(ü|ue)berbestand|ladenh(ü|ue)ter|slow.?mover|langsamdreher|abschrift|altware|c-?teil|abc-?analyse/i, ['ueberbestand', 'lagerbestand', 'reichweite']],
  [/lieferf(ä|ae)hig|servicegrad|verf(ü|ue)gbarkeit.?ware|fill.?rate|fehlmenge|out.?of.?stock/i, ['lieferfaehigkeit', 'reichweite']],
  [/supply.?chain|wertsch(ö|oe)pfungskette|logistik|versand|transport|fracht|spedition|distribution/i, ['lagerbestand', 'lieferfaehigkeit', 'liefertermintreue']],
  // --- Working Capital / Forderungen / Liquidität ----------------------
  [/liquidit|cash\b|working capital|kapitalbindung|zahlungsf(ä|ae)hig|cashflow|cash.?flow|zahlungsmittel|fl(ü|ue)ssige mittel/i, ['operativerCashflow', 'freieLiquiditaet', 'cashConversion', 'liquideMittel']],
  [/forderung|debitor|au(ß|ss)enstand|offene posten|\bop\b|receivabl|außenst(ä|ae)nde/i, ['offeneForderungen', 'dso', 'ueberfaelligkeitsquote']],
  [/\bdso\b|zahlungsziel|zahlungseingang|laufzeit.?forderung|mahnung|mahnwesen|inkasso|days.?sales/i, ['dso', 'ueberfaelligkeitsquote', 'ueberfaelligeForderungen']],
  [/(ü|ue)berf(ä|ae)llig|aging|altersstruktur|verzug|overdue/i, ['ueberfaelligkeitsquote', 'ueberfaelligeForderungen', 'forderungsausfall']],
  [/forderungsausfall|wertberichtigung|bad.?debt|delkredere|ausfallrisiko|zahlungsausfall|insolvenz.?kund/i, ['forderungsausfall', 'ueberfaelligkeitsquote']],
  [/kreditlinie|kontokorrent|kreditrahmen|liquidit(ä|ae)tsreserve|kreditfazilit/i, ['kreditlinie', 'freieLiquiditaet', 'liquideMittel']],
  // --- Finanzen / Bilanz / Treasury ------------------------------------
  [/eigenkapital|ek.?quote|equity|bilanzstruktur|kapitalstruktur|solvenz/i, ['eigenkapitalquote', 'eigenkapital', 'nettoverschuldung']],
  [/verschuldung|leverage|nettoverschuldung|fremdkapital|\bdebt\b|gearing/i, ['nettoverschuldung', 'nettoverschuldungEbitda', 'zinsdeckung']],
  [/zins|finanzierungskost|interest|zinsaufwand|zinsdeckung|fremdkapitalkost/i, ['zinsaufwand', 'zinsdeckung', 'durchschnittszins']],
  [/treasury|hedge|absicherung|w(ä|ae)hrung|\bfx\b|devisen|wechselkurs|fremdw(ä|ae)hrung|currency/i, ['hedgeQuote', 'fxExposureOffen', 'durchschnittszins']],
  [/bilanz|bilanzsumme|aktiva|passiva|gesamtkapital|balance.?sheet/i, ['bilanzsumme', 'eigenkapitalquote']],
  [/r(ü|ue)ckstellung|abgrenzung|drohverlust|provision.?accrual/i, ['rueckstellungen', 'handelsrechtlichesErgebnis']],
  [/abschluss|jahresabschluss|monatsabschluss|fast.?close|abschlussdauer|hgb|ifrs|fibu|finanzbuchhalt|buchhaltung|reporting.?frist/i, ['abschlussdauer', 'handelsrechtlichesErgebnis', 'betrieblichesErgebnis', 'rueckstellungen']],
  [/roce|kapitalrendite|return.?on.?capital|kapitaleffizienz|kapitalverzinsung/i, ['roce', 'eigenkapitalrendite', 'ebit']],
  [/eigenkapitalrendite|\broe\b|return.?on.?equity|eigenkapitalverzins/i, ['eigenkapitalrendite', 'roce']],
  // --- Investition / CapEx ---------------------------------------------
  [/investition|capex|anlageverm(ö|oe)gen|\binvest\b|sachanlage|anschaffung|maschinenkauf/i, ['investitionsvolumen', 'investBudgettreue', 'investitionsbudget']],
  [/budgettreue|budgetdisziplin|freigabe.?invest|investitionsdisziplin/i, ['investBudgettreue', 'kostendisziplin']],
  // --- Planung / Forecast / Controlling --------------------------------
  [/planung|budget|plan-?ist|soll-?ist|zielerreichung|erfolgsplan|planabweichung|abweichungsanalyse/i, ['umsatzZielerreichung', 'ergebnisZielerreichung', 'kostendisziplin', 'forecastGenauigkeit']],
  [/prognose|vorhersage|forecast|absatzprognose|umsatzprognose|orderbuch|auftragsbestand|auftragseingang|hochrechnung/i, ['absatzprognose', 'umsatzprognose', 'forecastGenauigkeit', 'auftragsbestand', 'prognoseWachstum']],
  [/umsatzplan|umsatzziel|planumsatz/i, ['umsatzplan', 'umsatzZielerreichung', 'umsatzprognose']],
  [/kostenplan|kostendisziplin|kostenziel|kostenbudget/i, ['kostenplan', 'kostendisziplin']],
  [/ebit.?plan|ergebnisplan|ergebnisziel|planergebnis/i, ['ebitPlan', 'ergebnisZielerreichung', 'ebit']],
  [/forecast.?genauigkeit|prognosequalit(ä|ae)t|prognoseg(ü|ue)te|forecast.?accuracy|treffsicher|planungsg(ü|ue)te/i, ['forecastGenauigkeit', 'absatzprognose']],
  // --- Personal / HR ----------------------------------------------------
  [/personal|mitarbeiter|\bhr\b|belegschaft|headcount|\bfte\b|stellen|lohn|gehalt|entgelt|personalaufwand/i, ['personalkosten', 'personalkostenquote', 'mitarbeiterFTE', 'fluktuation']],
  [/fluktuation|k(ü|ue)ndigung|abwanderung.?personal|turnover.?hr|mitarbeiterbindung|retention.?personal/i, ['fluktuation', 'krankenstand']],
  [/krankenstand|krankheit|fehlzeit|absentismus|\bbgm\b|gesundheit|ausfalltage/i, ['krankenstand', 'fluktuation', 'ueberstundenquote']],
  [/(ü|ue)berstund|mehrarbeit|arbeitszeit|(ü|ue)berlast.?personal/i, ['ueberstundenquote', 'krankenstand']],
  [/produktivit(ä|ae)t|umsatz je|umsatz.?pro.?kopf|umsatzjefte|effizienz.?personal|leistung je mitarbeit/i, ['umsatzJeFTE', 'personalkostenquote', 'mitarbeiterFTE']],
  // --- ESG / Nachhaltigkeit --------------------------------------------
  [/nachhaltig|\besg\b|co2|co₂|emission|klima|carbon|footprint|fu(ß|ss)abdruck|treibhaus/i, ['co2ProRad', 'co2Gesamt', 'oekostromanteil', 'recyclingquote']],
  [/energie|strom|(ö|oe)kostrom|kwh|energiekost|photovoltaik|\bpv\b|stromverbrauch/i, ['oekostromanteil', 'energieJeRad', 'co2Gesamt']],
  [/recycling|kreislauf|rezyklat|circular|wiederverwert|abfall|m(ü|ue)ll/i, ['recyclingquote', 'co2ProRad']],
  // --- Service / Aftersales / F&E --------------------------------------
  [/service|after.?sales|werkstatt|reparatur|ersatzteil|wartung|instandhalt|kundenservice/i, ['serviceanteil', 'serviceumsatz', 'ersatzteilverfuegbarkeit', 'reparaturdurchlaufzeit', 'nps']],
  [/ersatzteil|spare.?part|verf(ü|ue)gbarkeit.?teil|teileverf(ü|ue)gbar/i, ['ersatzteilverfuegbarkeit', 'reparaturdurchlaufzeit']],
  [/\bnps\b|weiterempfehl|kundenzufried|net.?promoter|zufriedenheit/i, ['nps', 'serviceanteil', 'reklamationsquote']],
  [/f\s*&\s*e|forschung|produktentwicklung|entwicklungsabteil|entwicklungsprojekt|innovation|neuprodukt|r\s*&\s*d|time.?to.?market|produktpipeline/i, ['fueQuote', 'fuekosten', 'neuproduktumsatzanteil', 'timeToMarket', 'entwicklungsprojekte']],
  // --- Konzern / Segment / International -------------------------------
  [/konzern|beteiligung|segment|tochter|gesellschaft|konsolidier|holding|group/i, ['roce', 'eigenkapitalrendite', 'auslandsanteil', 'intercompanyQuote', 'intercompanyVolumen']],
  [/auslandsanteil|export|international|auslandsumsatz|ausland|grenz(ü|ue)berschreit/i, ['auslandsanteil', 'nettoumsatz']],
  [/intercompany|verrechnung|konzernintern|transfer.?pricing|verrechnungspreis|\bic\b/i, ['intercompanyQuote', 'intercompanyVolumen']],
  // --- IT / Shop-Technik ------------------------------------------------
  [/\bit\b|system|shop-?verf(ü|ue)gbar|shopverf(ü|ue)gbar|uptime|\bpim\b|ausfallzeit.?system|server|technik.?shop/i, ['shopVerfuegbarkeit', 'onlineAnteil']],
  // --- Risiko (Sammelbegriff) ------------------------------------------
  [/risiko|gefahr|exposure|ausfall|absicher|hedging|risk/i, ['klumpenrisikoTop3', 'forderungsausfall', 'hedgeQuote', 'ueberfaelligkeitsquote']],
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
