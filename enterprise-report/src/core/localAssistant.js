// =========================================================================
//  LOKALER ASSISTENT — eine regelbasierte "KI", die im Browser läuft.
//
//  Beantwortet natürlichsprachige Fragen zu den Kennzahlen OHNE LLM:
//   1) Intent erkennen (Wert, Definition, Ziel, Trend, Ursache, Vergleich,
//      Ranking, "was ist rot", Empfehlung, Gesamtlage, Hilfe …).
//   2) Entität(en) bestimmen — welche Kennzahl ist gemeint (Synonym-Index).
//   3) Antwort aus den ECHTEN Werten formulieren (kpiInsight/formatWert).
//
//  Komplett offline, keine Kosten, keine Datenweitergabe. Trend-Fragen
//  nutzen optional eine übergebene ladeHistorie-Funktion.
// =========================================================================
import { KPI } from './kpiRegistry.js'
import { ampelStatus } from './ampel.js'
import { kpiInsight } from './insights.js'
import { formatWert } from '../design/theme.js'
import { darfKpi } from './rbac.js'
import { empfehleHeuristik } from './massnahmen.js'
import { STICHWORTE } from './biHeuristik.js'
import { KAUSAL } from './kausalmodell.js'

const norm = (s) => (s || '').toLowerCase().replace(/[’']/g, '').trim()
const AMP_WORT = { g: 'grün (auf Kurs)', a: 'gelb (beobachten)', r: 'rot (Handlungsbedarf)' }

// --- Synonym-Index: Phrase -> KPI-ID (kuratiert, erweiterbar) -------------
const SYN = {
  nettoumsatz: ['umsatz', 'nettoumsatz', 'erlös', 'erloes', 'umsatzerlös', 'revenue', 'sales', 'topline', 'top-line', 'umsätze', 'umsatzentwicklung', 'wie viel verkaufen wir', 'wie viel umsatz', 'geschäftsvolumen'],
  bruttoumsatz: ['bruttoumsatz', 'fakturierter umsatz'],
  erloesschmaelerung: ['erlösschmälerung', 'erloesschmaelerung', 'gutschriften', 'preisnachlässe'],
  ebit: ['ebit', 'betriebsergebnis', 'operatives ergebnis', 'operating profit', 'ergebnis', 'gewinn'],
  ebitda: ['ebitda'],
  betrieblichesErgebnis: ['betriebliches ergebnis'],
  handelsrechtlichesErgebnis: ['jahresüberschuss', 'jahresueberschuss', 'jahresergebnis', 'konzernergebnis', 'nettoergebnis', 'bottomline'],
  dbQuote: ['db-quote', 'dbquote', 'deckungsbeitragsquote', 'marge', 'bruttomarge', 'gewinnmarge', 'rohertragsquote', 'deckungsquote', 'wie hoch ist die marge', 'wie profitabel', 'handelsspanne', 'handelsmarge', 'spanne'],
  db1: ['deckungsbeitrag', 'db1', 'db 1', 'deckungsbeitrag i', 'db i', 'rohertrag', 'rohgewinn', 'bruttoergebnis'],
  wareneinsatzquote: ['wareneinsatzquote', 'materialquote', 'cogs-quote', 'einsatzquote'],
  wareneinsatz: ['wareneinsatz', 'materialaufwand', 'cogs', 'materialkosten'],
  herstellkostenJeRad: ['herstellkosten je rad', 'stückkosten', 'stueckkosten', 'herstellkosten pro rad'],
  herstellkosten: ['herstellkosten', 'herstellungskosten'],
  gemeinkostenquote: ['gemeinkostenquote', 'overhead-quote'],
  gemeinkosten: ['gemeinkosten', 'overhead', 'verwaltungskosten'],
  gesamtkosten: ['gesamtkosten', 'kostenbasis', 'kostenblock'],
  personalkosten: ['personalkosten', 'personalaufwand', 'lohnkosten'],
  personalkostenquote: ['personalkostenquote', 'personalquote'],
  mitarbeiterFTE: ['mitarbeiter', 'fte', 'belegschaft', 'headcount', 'vollzeitäquivalent'],
  fluktuation: ['fluktuation', 'kündigungsquote', 'mitarbeiterabwanderung', 'turnover'],
  krankenstand: ['krankenstand', 'krankheitsquote', 'fehlzeiten', 'fehlzeitenquote', 'wie krank ist die belegschaft', 'ausfallquote personal', 'krankheitstage'],
  ueberstundenquote: ['überstunden', 'ueberstunden', 'überstundenquote', 'mehrarbeit'],
  umsatzJeFTE: ['umsatz je fte', 'umsatz pro kopf', 'produktivität', 'produktivitaet', 'umsatz je mitarbeiter'],
  dso: ['dso', 'debitorenlaufzeit', 'forderungslaufzeit', 'days sales outstanding', 'außenstandsdauer', 'zahlungsdauer kunden', 'wie lange bis kunden zahlen', 'wie schnell zahlen kunden', 'zahlungsziel', 'zahlungsziel der kunden'],
  offeneForderungen: ['offene forderungen', 'außenstände', 'aussenstaende', 'debitoren', 'offene posten'],
  ueberfaelligeForderungen: ['überfällige forderungen', 'ueberfaellige forderungen'],
  ueberfaelligkeitsquote: ['überfälligkeitsquote', 'ueberfaelligkeitsquote', 'überfälligkeit', 'verzugsquote'],
  forderungsausfall: ['forderungsausfall', 'ausfallquote', 'wertberichtigung', 'bad debt'],
  klumpenrisikoTop3: ['klumpenrisiko', 'konzentrationsrisiko', 'abhängigkeit', 'top-3-kunden'],
  retourenquote: ['retourenquote', 'retouren', 'rückgabequote', 'rücksendequote'],
  reklamationsquote: ['reklamationsquote', 'reklamationen', 'beanstandungen'],
  onlineAnteil: ['online-anteil', 'onlineanteil', 'online anteil', 'e-commerce-anteil', 'shop-anteil'],
  conversionRate: ['conversion', 'conversion-rate', 'abschlussquote', 'kaufquote'],
  shopVerfuegbarkeit: ['shop-verfügbarkeit', 'shopverfügbarkeit', 'uptime', 'verfügbarkeit shop'],
  rabattquote: ['rabattquote', 'rabatt', 'nachlassquote', 'discount-quote'],
  neukundenanteil: ['neukundenanteil', 'neukunden', 'neukundenquote'],
  vertriebskostenquote: ['vertriebskostenquote', 'vertriebskostenanteil'],
  vertriebskosten: ['vertriebskosten'],
  marketingkostenquote: ['marketingkostenquote', 'marketingquote', 'werbekostenquote'],
  marketingkosten: ['marketingkosten', 'werbekosten', 'werbebudget', 'marketingbudget', 'marketing', 'marketingausgaben', 'werbeausgaben'],
  roas: ['roas', 'return on ad spend', 'werbe-roi', 'werbeeffizienz', 'was bringt werbung', 'werbe-rendite'],
  cac: ['cac', 'kundengewinnungskosten', 'akquisekosten'],
  lagerbestand: ['lagerbestand', 'bestand', 'bestandswert', 'vorrat', 'inventar', 'warenbestand', 'bestandshöhe', 'wie viel liegt im lager', 'wie viel ware'],
  reichweite: ['reichweite', 'bestandsreichweite', 'days of supply', 'vorratsdauer'],
  lagerumschlag: ['lagerumschlag', 'umschlag', 'umschlagshäufigkeit', 'drehzahl', 'turns'],
  ueberbestand: ['überbestand', 'ueberbestand', 'ladenhüter', 'ladenhueter', 'langsamdreher'],
  lieferfaehigkeit: ['lieferfähigkeit', 'lieferfaehigkeit', 'servicegrad', 'fill rate'],
  liefertermintreue: ['liefertermintreue', 'termintreue', 'on-time-delivery', 'otd', 'pünktlichkeit'],
  liefertreue: ['liefertreue', 'lieferzuverlässigkeit'],
  einkaufsvolumen: ['einkaufsvolumen', 'beschaffungsvolumen', 'einkauf'],
  ausschuss: ['ausschuss', 'ausschussquote', 'scrap', 'schrott', 'wie viel ausschuss', 'fehlproduktion'],
  nacharbeitsquote: ['nacharbeit', 'nacharbeitsquote', 'rework'],
  firstPassYield: ['first pass yield', 'fpy', 'gutausbeute', 'durchlaufquote'],
  qualitaetskostenquote: ['qualitätskosten', 'qualitaetskosten', 'copq', 'fehlerkosten'],
  garantiekosten: ['garantiekosten', 'gewährleistungskosten', 'kulanzkosten'],
  kapazitaetsauslastung: ['kapazitätsauslastung', 'kapazitaetsauslastung', 'auslastung', 'auslastungsgrad', 'wie ausgelastet', 'wie gut ausgelastet'],
  auslastung: ['auslastung'],
  schichtauslastung: ['schichtauslastung', 'schichtnutzung'],
  produktionsmenge: ['produktionsmenge', 'output', 'produktionsoutput', 'stückzahl produktion'],
  planErfuellungProduktion: ['planerfüllung produktion', 'produktionsplanerfüllung'],
  operativerCashflow: ['operativer cashflow', 'cashflow', 'cash flow', 'cash-flow'],
  freieLiquiditaet: ['freie liquidität', 'freie liquiditaet', 'verfügbare liquidität', 'liquiditätspuffer', 'wie viel cash frei', 'finanzpolster'],
  liquideMittel: ['liquide mittel', 'kassenbestand', 'bankguthaben', 'cash', 'geld in der kasse', 'barmittel', 'wie viel geld haben wir'],
  cashConversion: ['cash conversion', 'cash-conversion', 'geldumschlag', 'working capital', 'cash conversion cycle', 'ccc', 'geldumschlagsdauer', 'kapitalbindungsdauer'],
  kreditlinie: ['kreditlinie', 'kreditrahmen', 'kontokorrent', 'kreditfazilität'],
  eigenkapitalquote: ['eigenkapitalquote', 'ek-quote', 'ekquote', 'wie solide', 'kapitalbasis', 'finanzielle stabilität'],
  eigenkapital: ['eigenkapital'],
  nettoverschuldung: ['nettoverschuldung', 'verschuldung', 'fremdkapital', 'schuldenstand', 'schulden', 'wie hoch sind unsere schulden'],
  nettoverschuldungEbitda: ['verschuldungsgrad', 'leverage', 'nettoverschuldung/ebitda', 'gearing'],
  zinsdeckung: ['zinsdeckung', 'zinsdeckungsgrad', 'interest coverage'],
  zinsaufwand: ['zinsaufwand', 'zinskosten', 'finanzierungskosten'],
  durchschnittszins: ['durchschnittszins', 'zinssatz', 'finanzierungszins'],
  hedgeQuote: ['hedge-quote', 'hedgequote', 'absicherungsquote', 'hedge'],
  fxExposureOffen: ['fx-exposure', 'währungsrisiko', 'waehrungsrisiko', 'offenes währungsrisiko', 'devisenrisiko'],
  bilanzsumme: ['bilanzsumme', 'gesamtkapital'],
  rueckstellungen: ['rückstellungen', 'rueckstellungen'],
  abschlussdauer: ['abschlussdauer', 'fast close', 'fast-close', 'abschlussgeschwindigkeit'],
  roce: ['roce', 'return on capital employed', 'kapitalrendite', 'rendite', 'gesamtkapitalrendite'],
  eigenkapitalrendite: ['eigenkapitalrendite', 'roe', 'return on equity'],
  auslandsanteil: ['auslandsanteil', 'exportanteil', 'auslandsumsatz'],
  intercompanyQuote: ['intercompany-quote', 'intercompany', 'konzerninterne quote'],
  intercompanyVolumen: ['intercompany-volumen', 'konzerninternes volumen'],
  investitionsvolumen: ['investitionsvolumen', 'capex', 'investitionen'],
  investBudgettreue: ['investitionsbudgettreue', 'capex-budgettreue', 'budgettreue'],
  co2ProRad: ['co2 je rad', 'co₂ je rad', 'co2 pro rad', 'co2-fußabdruck', 'fußabdruck', 'carbon footprint'],
  co2Gesamt: ['co2 gesamt', 'co₂ gesamt', 'gesamtemissionen', 'emissionen'],
  oekostromanteil: ['ökostromanteil', 'oekostromanteil', 'grünstromanteil', 'erneuerbare energie'],
  energieJeRad: ['energie je rad', 'energieverbrauch je rad', 'energie pro rad'],
  recyclingquote: ['recyclingquote', 'rezyklatquote', 'wiederverwertung'],
  serviceanteil: ['serviceanteil', 'service-anteil'],
  serviceumsatz: ['serviceumsatz', 'werkstattumsatz', 'aftersales-umsatz'],
  ersatzteilverfuegbarkeit: ['ersatzteilverfügbarkeit', 'ersatzteilverfuegbarkeit', 'teileverfügbarkeit'],
  reparaturdurchlaufzeit: ['reparaturdurchlaufzeit', 'durchlaufzeit reparatur', 'werkstattdurchlaufzeit'],
  nps: ['nps', 'net promoter score', 'weiterempfehlung', 'kundenzufriedenheit', 'wie zufrieden sind kunden', 'empfehlungsbereitschaft', 'kundentreue'],
  fueQuote: ['f&e-quote', 'fue-quote', 'forschungsquote', 'f&e-quote'],
  fuekosten: ['f&e-kosten', 'fue-kosten', 'forschungskosten', 'entwicklungskosten'],
  neuproduktumsatzanteil: ['neuproduktumsatzanteil', 'neuproduktanteil', 'innovationsrate'],
  timeToMarket: ['time to market', 'time-to-market', 'entwicklungsdauer'],
  entwicklungsprojekte: ['entwicklungsprojekte', 'f&e-projekte', 'innovationsprojekte'],
  forecastGenauigkeit: ['forecast-genauigkeit', 'prognosegenauigkeit', 'forecast accuracy', 'prognosegüte'],
  absatzprognose: ['absatzprognose', 'absatzforecast', 'mengenprognose'],
  umsatzprognose: ['umsatzprognose', 'umsatzforecast', 'forecast', 'umsatzvorschau'],
  auftragsbestand: ['auftragsbestand', 'orderbuch', 'auftragseingang'],
  umsatzZielerreichung: ['umsatzzielerreichung', 'umsatzziel', 'zielerreichung umsatz'],
  ergebnisZielerreichung: ['ergebniszielerreichung', 'ergebnisziel', 'zielerreichung ergebnis'],
  kostendisziplin: ['kostendisziplin', 'kostentreue', 'budgetdisziplin', 'kostenkontrolle', 'diszipliniert bei den kosten', 'kosten im griff'],
  prognoseWachstum: ['prognostiziertes wachstum', 'wachstumsprognose', 'erwartetes wachstum', 'prognose wachstum'],
  umsatzplan: ['umsatzplan', 'planumsatz', 'umsatzbudget', 'geplanter umsatz'],
  kostenplan: ['kostenplan', 'plankosten', 'kostenbudget', 'geplante kosten'],
  ebitPlan: ['ebit-plan', 'ebitplan', 'ergebnisplan', 'planergebnis', 'geplantes ebit'],
  produktionsplan: ['produktionsplan', 'fertigungsplan', 'produktionsprogramm'],
  kapazitaet: ['kapazität', 'kapazitaet', 'produktionskapazität', 'fertigungskapazität', 'gesamtkapazität'],
  neutralesErgebnis: ['neutrales ergebnis', 'außerordentliches ergebnis', 'ausserordentliches ergebnis', 'a.o. ergebnis'],
  investitionsbudget: ['investitionsbudget', 'capex-budget', 'investbudget', 'geplante investitionen'],
}

// Synonym -> ID (längste Phrasen zuerst, damit "online anteil" vor "anteil" greift)
const SYN_INDEX = Object.entries(SYN)
  .flatMap(([id, phrasen]) => phrasen.map((p) => ({ p: norm(p), id })))
  .sort((a, b) => b.p.length - a.p.length)

/** Findet die wahrscheinlichste(n) Kennzahl(en) zur Frage (RBAC-gefiltert). */
export function findeKpis(frage, rolle = null, max = 3) {
  const f = ' ' + norm(frage).replace(/[?.,;:!]/g, ' ').replace(/\s+/g, ' ') + ' '
  const score = {}
  const add = (id, p) => { if (KPI[id] && (!rolle || darfKpi(rolle, KPI[id]))) score[id] = (score[id] || 0) + p }
  // 1) kuratierte Synonyme (stärkstes Signal)
  for (const { p, id } of SYN_INDEX) {
    if (f.includes(' ' + p)) { add(id, 3 + Math.min(3, Math.floor(p.length / 6))); continue }
    // Mehrwort-Phrase: trifft auch, wenn alle markanten Wörter (>3 Zeichen)
    // vorkommen — robust gegen Füllwörter und andere Reihenfolge.
    if (p.includes(' ')) {
      const markant = p.split(' ').filter((w) => w.length > 3)
      if (markant.length >= 2 && markant.every((w) => f.includes(' ' + w))) add(id, 3)
    }
  }
  // 2) KPI-Name-Tokens
  for (const k of Object.values(KPI)) {
    for (const w of norm(k.name).split(/\s+/)) if (w.length > 3 && f.includes(' ' + w)) add(k.id, 2)
    if (f.includes(' ' + norm(k.id) + ' ')) add(k.id, 2)
  }
  return Object.entries(score).sort((a, b) => b[1] - a[1]).slice(0, max).map(([id]) => KPI[id])
}

// Cluster-Fallback über die große Stichwort-Tabelle (mehrere KPIs je Thema).
function clusterKpis(frage, rolle) {
  const ids = new Set()
  for (const [re, kpis] of STICHWORTE) if (re.test(frage)) kpis.forEach((id) => ids.add(id))
  return [...ids].map((id) => KPI[id]).filter((k) => k && (!rolle || darfKpi(rolle, k)))
}

// --- Was-wäre-wenn: Override propagieren -------------------------------
// Setzt eine Kennzahl fix auf neuerWert und rechnet bis zur Stabilität neu:
//  (a) die KAUSAL-Kanten (Delta-Wirkungsketten zwischen Roh-Kennzahlen,
//      z. B. Retouren -> Erlösschmälerung -> Nettoumsatz -> EBIT) und
//  (b) den strukturellen berechne()-Graph der Registry (Quoten/Ratios).
// Die override-Kennzahl bleibt fix. Liefert zusätzlich, ob Kausal-Kanten
// (= Modellannahmen) gegriffen haben.
function simuliere(werte, overrideId, neuerWert) {
  const basis = werte
  const sim = { ...werte, [overrideId]: neuerWert }
  const struktur = Object.values(KPI).filter((k) => typeof k.berechne === 'function' && k.id !== overrideId)
  const kausal = KAUSAL.filter((e) => e.id !== overrideId)
  let kausalGenutzt = false
  for (let runde = 0; runde < 20; runde++) {
    let geaendert = false
    for (const e of kausal) {
      if (basis[e.id] != null && e.von.every((d) => sim[d] != null && basis[d] != null)) {
        const nv = e.f(sim, basis)
        if (Math.abs(nv - (sim[e.id] ?? 0)) > 1e-9) { sim[e.id] = nv; geaendert = true; kausalGenutzt = true }
      }
    }
    for (const k of struktur) {
      if (k.abhaengig.every((d) => sim[d] != null)) {
        const nv = k.berechne(sim)
        if (Math.abs(nv - (sim[k.id] ?? 0)) > 1e-9) { sim[k.id] = nv; geaendert = true }
      }
    }
    if (!geaendert) break
  }
  return { sim, kausalGenutzt }
}

// Liest aus „… auf X", „… um X %", „… um X", „+/- X %" den Zielwert.
function parseSzenario(frage, current) {
  // Zahl bevorzugt direkt nach dem Trigger-Wort (auf/um/von/plus/minus) lesen —
  // sonst würden Ziffern in KPI-Namen (db1, co2, top3) als Zielwert verwechselt.
  const m = frage.match(/\b(?:auf|um|von|plus|minus)\b\s*(-?\d+(?:[.,]\d+)?)/)
    || frage.match(/(-?\d+(?:[.,]\d+)?)/)
  if (!m) return null
  const num = parseFloat(m[1].replace(',', '.'))
  const neg = /senk|sink|f(ä|ae)ll|reduzier|runter|weniger|minus|verring|niedriger|halbier/.test(frage)
  const prozent = /%|prozent/.test(frage)
  if (/\bauf\b/.test(frage)) return num                                   // absoluter Zielwert
  if (current == null) return null
  if (prozent) return current * (1 + (neg ? -1 : 1) * num / 100)          // relative Änderung
  return current + (neg ? -1 : 1) * num                                   // absolute Differenz
}

const wert = (k, werte) => werte?.[k.id]
const ampelVonKpi = (k, werte) => ampelStatus({ wert: wert(k, werte), ziel: k.ziel, richtung: k.richtung, warn: k.warn })

function wertSatz(k, werte) {
  const v = wert(k, werte)
  if (v == null) return `Für **${k.name}** liegt aktuell kein Wert vor.`
  if (k.ziel == null) return `**${k.name}** liegt bei **${formatWert(v, k.einheit)}** (kein Ziel hinterlegt — rein informativ).`
  const ins = kpiInsight(k.id, v)
  return `**${k.name}** liegt bei **${formatWert(v, k.einheit)}** — Ampel ${AMP_WORT[ins.status]}. Ziel ${formatWert(k.ziel, k.einheit)} (${ins.zielText}).`
}

// --- Intent-Muster --------------------------------------------------------
const I = {
  begruessung: /^(hallo|hi|hey|moin|servus|guten (tag|morgen|abend)|na\b)/i,
  hilfe: /was kannst du|wie funktionierst|womit kannst du helfen|^hilfe|was kann ich fragen|wie nutze/i,
  definition: /was (ist|bedeutet|hei(ß|ss)t|sind|versteht man unter)|definition|erkl(ä|ae)r|begriff|wofür steht/i,
  formel: /wie (wird|errechnet|berechnet|ermittelt)|formel|berechnung|woher (kommt|stammt)|datenquelle|quelle (von|der|für)/i,
  ziel: /\bziel\b|zielwert|soll(wert)?\b|plan(wert)?\b|target|wie hoch sollte|wo wollen wir hin/i,
  wenn: /was w(ä|ae)re|was passiert,? wenn|angenommen|simulier|szenario|wenn\b.{0,40}\b(auf|um)\b.{0,14}\d|halbier|verdoppel/i,
  lageGesamt: /gesamtlage|wie (geht|l(ä|ae)uft) (es|das gesch(ä|ae)ft|der laden)|wie stehen wir|(ü|ue)berblick|gesamtbild|wie ist die lage|status gesamt|wie sieht.?s aus/i,
  listeRot: /\brot\b|kritisch|auff(ä|ae)llig|baustelle|sorgenkind|handlungsbedarf|\brisiken\b|wo (brennt|hakt|stehen wir schlecht|liegt das problem)/i,
  listeGruen: /was l(ä|ae)uft gut|st(ä|ae)rken|welche.*(gr(ü|ue)n|gut)|wo sind wir gut|\bgr(ü|ue)n\b|\bpositiv\b/i,
  trend: /trend|entwicklung|verlauf|(ü|ue)ber zeit|wie hat sich.*(entwickelt|ver(ä|ae)ndert)|steigt|sinkt|w(ä|ae)chst|r(ü|ue)ckl(ä|ae)ufig|historie/i,
  ursache: /warum|wieso|weshalb|ursach|woran liegt|grund (für|dafür)|was treibt|weswegen/i,
  empfehlung: /\b(was (tun|sollen|soll ich|machen|unternehmen)|ma(ß|ss)nahme|handlungsempfehlung|empfehl|gegensteuer)\b|\b(senke|senken|reduzier|verbesser|steiger|erh(ö|oe)h|optimier|abbau)\w*/i,
  vergleich: /vergleich|versus|\bvs\.?\b|im vergleich|unterschied zwischen|gegen(ü|ue)ber/i,
  wert: /wie (hoch|viel|gro(ß|ss)|teuer)|wert von|wie ist (der|die|das)|stand (von|der|des)|aktuell|zeig|wie performt|wie sieht.* aus|h(ö|oe)he (von|der)/i,
}

const TIPPS = [
  'Wie hoch ist der Umsatz?',
  'Was bedeutet DSO?',
  'Was ist gerade rot?',
  'Wie ist die Gesamtlage?',
  'Wie senke ich die Retourenquote?',
  'Was wäre, wenn der Wareneinsatz auf 30 Mio € sinkt?',
]

/**
 * Beantwortet eine Frage lokal.
 * @param {string} frage
 * @param {object} ctx { werte, rolle, ladeHistorie? }
 * @returns {Promise<{intent,text,kpis,vorschlaege,quelle}>}
 */
export async function beantworte(frage, { werte = {}, rolle = null, ladeHistorie = null } = {}) {
  const f = norm(frage)
  const out = (intent, text, kpis = [], vorschlaege = []) => ({ intent, text, kpis: kpis.map((k) => k.id || k), vorschlaege, quelle: 'lokal' })
  if (!f) return out('leer', 'Stell mir einfach eine Frage zu deinen Kennzahlen — z. B. „Wie hoch ist der Umsatz?".', [], TIPPS)

  if (I.begruessung.test(f) && f.length < 25) return out('begruessung', 'Hallo! Ich bin dein lokaler Kennzahlen-Assistent — komplett offline, ohne KI-Cloud. Frag mich nach Werten, Definitionen, Zielen, Trends oder Empfehlungen.', [], TIPPS)
  if (I.hilfe.test(f)) return out('hilfe', 'Ich beantworte Fragen zu deinen Kennzahlen direkt aus den echten Zahlen — ohne KI, ohne Datenweitergabe. Ich kann u. a.: **Werte** abrufen, **Begriffe erklären**, **Ziele** vergleichen, sagen **was rot ist**, **Trends** zeigen, **Ursachen** eingrenzen und **Maßnahmen** vorschlagen.', [], TIPPS)

  const kpis = findeKpis(f, rolle, 3)
  const top = kpis[0]

  // Gesamtlage
  if (I.lageGesamt.test(f)) {
    const bewertbar = Object.values(KPI).filter((k) => k.ziel != null && (!rolle || darfKpi(rolle, k)) && werte[k.id] != null)
    const v = { g: 0, a: 0, r: 0 }
    bewertbar.forEach((k) => { v[ampelVonKpi(k, werte)]++ })
    const rote = bewertbar.filter((k) => ampelVonKpi(k, werte) === 'r').map((k) => k.name).slice(0, 4)
    const lage = v.r > 0 ? 'mit Handlungsbedarf' : v.a > 2 ? 'überwiegend stabil mit Beobachtungspunkten' : 'insgesamt auf Kurs'
    const text = `Gesamtlage ${lage}: von ${bewertbar.length} bewerteten Kennzahlen sind **${v.g} grün**, **${v.a} gelb** und **${v.r} rot**.` + (rote.length ? ` Größte Baustellen: ${rote.join(', ')}.` : '')
    return out('lageGesamt', text, [], ['Was ist gerade rot?', 'Was läuft gut?', 'Was sollen wir tun?'])
  }

  // Was-wäre-wenn — braucht eine konkrete Kennzahl + Zahl, sonst durchfallen
  if (I.wenn.test(f) && top) {
    const cur = werte[top.id]
    let neu = parseSzenario(f, cur)
    if (neu == null && /halbier/.test(f) && cur != null) neu = cur / 2
    if (neu == null && /verdoppel/.test(f) && cur != null) neu = cur * 2
    if (neu == null) return out('wenn', `Sag mir einen Zielwert für **${top.name}** — z. B. „Was wäre, wenn ${top.name} auf … geht?" oder „… um 10 % sinkt?".`, [top], TIPPS)
    const { sim, kausalGenutzt } = simuliere(werte, top.id, neu)
    const amp = (k, w) => ampelStatus({ wert: w, ziel: k.ziel, richtung: k.richtung, warn: k.warn })
    const changes = Object.values(KPI)
      .filter((k) => k.id !== top.id && (!rolle || darfKpi(rolle, k)) && sim[k.id] != null && werte[k.id] != null && Math.abs(sim[k.id] - werte[k.id]) > 1e-9)
      .map((k) => {
        const aAlt = amp(k, werte[k.id]), aNeu = amp(k, sim[k.id])
        const rel = Math.abs((sim[k.id] - werte[k.id]) / (werte[k.id] || 1))
        // Bedeutung: Ampel-Wechsel zuerst, dann relative Änderung (gedeckelt,
        // damit Ratio-Explosionen bei Nenner≈0 nicht die Liste dominieren).
        const score = (aAlt !== aNeu && k.ziel != null ? 1000 : 0) + Math.min(rel, 5) * 100
        return { k, alt: werte[k.id], neu: sim[k.id], aAlt, aNeu, score }
      })
      .sort((a, b) => b.score - a.score)
      .slice(0, 7)
    let text = `**Szenario:** ${top.name} ${cur != null ? `von ${formatWert(cur, top.einheit)} ` : ''}→ **${formatWert(neu, top.einheit)}**.`
    if (!changes.length) text += `\n\n${top.name} ist eine Eingangsgröße — im hinterlegten Modell hängen keine weiteren Kennzahlen direkt davon ab.`
    else {
      text += '\n\nAuswirkung auf abhängige Kennzahlen:' + changes.map((c) => {
        const pfeil = c.neu > c.alt ? '▲' : '▼'
        const flip = c.k.ziel != null && c.aAlt !== c.aNeu ? ` — Ampel ${AMP_WORT[c.aAlt]} → ${AMP_WORT[c.aNeu]}` : ''
        return `\n• **${c.k.name}**: ${formatWert(c.alt, c.k.einheit)} ${pfeil} **${formatWert(c.neu, c.k.einheit)}**${flip}`
      }).join('')
      if (kausalGenutzt) text += '\n\n_Wirkungsketten gemäß hinterlegtem Kausalmodell (teils Annahmen, z. B. Retouren → Erlösschmälerung → Umsatz → EBIT)._'
    }
    return out('wenn', text, [top, ...changes.map((c) => c.k)].slice(0, 4), [`Was tun für ${top.name}?`, `Trend von ${top.name}?`])
  }

  // Ursache (warum) — vor den Rot/Gelb-Listen, damit "warum ... rot" hier landet
  if (I.ursache.test(f)) {
    const ziel = top || clusterKpis(f, rolle)[0]
    if (!ziel) return out('ursache', 'Nenne mir die Kennzahl, deren Ursache dich interessiert — z. B. „Warum sinkt das Ergebnis?".', [], TIPPS)
    const umfeld = [...new Map([...kpis, ...clusterKpis(f, rolle)].map((k) => [k.id, k])).values()].filter((k) => k.id !== ziel.id)
    const auff = umfeld.filter((k) => werte[k.id] != null && ['r', 'a'].includes(ampelVonKpi(k, werte)))
    const zielAmpel = werte[ziel.id] != null ? ampelVonKpi(ziel, werte) : null
    let text = `**${ziel.name}** liegt bei ${werte[ziel.id] != null ? formatWert(werte[ziel.id], ziel.einheit) : '—'}${zielAmpel ? ` (${AMP_WORT[zielAmpel]})` : ''}.`
    if (auff.length) text += ` Mögliche Treiber im Umfeld:` + auff.map((k) => `\n• **${k.name}**: ${formatWert(werte[k.id], k.einheit)} — ${AMP_WORT[ampelVonKpi(k, werte)]}`).join('')
    else text += ` Im direkten Umfeld ist nichts auffällig — der Effekt dürfte eher aus Mengen/Preis oder externen Faktoren kommen.`
    return out('ursache', text, auff.length ? auff : [ziel], [`Was tun für ${ziel.name}?`, `Trend von ${ziel.name}?`])
  }

  // Empfehlung / Maßnahme
  if (I.empfehlung.test(f)) {
    const alle = empfehleHeuristik(werte, rolle, 8)
    const ziel = top
    const passend = ziel ? alle.filter((m) => m.kpi === ziel.id) : alle
    const liste = (passend.length ? passend : alle).slice(0, ziel ? 1 : 3)
    if (!liste.length) return out('empfehlung', ziel ? `Für **${ziel.name}** sehe ich aktuell keinen akuten Handlungsbedarf — die Kennzahl ist nicht auffällig.` : 'Aktuell ist nichts akut auffällig — kein dringender Handlungsbedarf.', ziel ? [ziel] : [], TIPPS)
    const text = liste.map((m) => `**${m.titel}**\n${m.erreichbarkeit}\n_Wirkung: ${m.wirkungErgebnis} · Frist: ${m.frist} · Aufwand: ${m.aufwand}_`).join('\n\n')
    return out('empfehlung', text, liste.map((m) => m.kpi), ['Wie ist die Gesamtlage?', 'Was ist gerade rot?'])
  }

  // Was ist rot / gelb
  if (I.listeRot.test(f)) {
    const bewertbar = Object.values(KPI).filter((k) => k.ziel != null && (!rolle || darfKpi(rolle, k)) && werte[k.id] != null)
    const rote = bewertbar.filter((k) => ampelVonKpi(k, werte) === 'r')
    const gelbe = bewertbar.filter((k) => ampelVonKpi(k, werte) === 'a')
    if (!rote.length && !gelbe.length) return out('listeRot', 'Aktuell ist **nichts rot oder gelb** — alle bewertbaren Kennzahlen liegen im Ziel. 👍', [], TIPPS)
    const z = (arr) => arr.map((k) => `**${k.name}** (${formatWert(werte[k.id], k.einheit)})`).join(', ')
    let text = ''
    if (rote.length) text += `🔴 **Rot (${rote.length}):** ${z(rote.slice(0, 6))}.`
    if (gelbe.length) text += `${rote.length ? '\n\n' : ''}🟡 **Gelb (${gelbe.length}):** ${z(gelbe.slice(0, 6))}.`
    return out('listeRot', text, [...rote, ...gelbe].slice(0, 3), ['Was sollen wir tun?', 'Wie ist die Gesamtlage?'])
  }
  if (I.listeGruen.test(f)) {
    const gruene = Object.values(KPI).filter((k) => k.ziel != null && (!rolle || darfKpi(rolle, k)) && werte[k.id] != null && ampelVonKpi(k, werte) === 'g')
    if (!gruene.length) return out('listeGruen', 'Aktuell liegt **keine** bewertbare Kennzahl im grünen Bereich — Fokus auf die Baustellen.', [], ['Was ist gerade rot?'])
    return out('listeGruen', `🟢 **Auf Kurs (${gruene.length}):** ${gruene.slice(0, 8).map((k) => `**${k.name}** (${formatWert(werte[k.id], k.einheit)})`).join(', ')}.`, [], TIPPS)
  }

  // Vergleich zweier Kennzahlen
  if (I.vergleich.test(f) && kpis.length >= 2) {
    const [a, b] = kpis
    const sa = wertSatz(a, werte), sb = wertSatz(b, werte)
    return out('vergleich', `Vergleich:\n\n• ${sa}\n\n• ${sb}`, [a, b], [`Warum ${a.name}?`, `Was tun für ${b.name}?`])
  }

  // Ab hier brauchen wir eine konkrete Kennzahl
  if (!top) {
    const cl = clusterKpis(f, rolle)
    if (cl.length) {
      const text = cl.slice(0, 4).map((k) => `• ${wertSatz(k, werte)}`).join('\n\n')
      return out('thema', `Dazu passende Kennzahlen:\n\n${text}`, cl, TIPPS)
    }
    const nahe = findeKpis(f, rolle, 4)
    const vor = (nahe.length ? nahe.map((k) => `Wie hoch ist ${k.name}?`) : TIPPS)
    return out('unbekannt', 'Das habe ich nicht sicher einer Kennzahl zugeordnet. Meintest du vielleicht eine davon — oder formuliere es etwas anders:', [], vor)
  }

  // Definition (aber nicht, wenn es eigentlich eine Ziel-Frage ist —
  // „Was ist das Ziel bei X?" matcht beides; das spezifischere ziel gewinnt)
  if (I.definition.test(f) && !I.ziel.test(f)) {
    return out('definition', `**${top.name}** (${top.bereich}): ${top.beschreibung}${top.ziel != null ? ` Zielwert: ${formatWert(top.ziel, top.einheit)}.` : ''}`, [top], [`Wie hoch ist ${top.name}?`, `Ziel von ${top.name}?`])
  }
  // Formel / Quelle
  if (I.formel.test(f)) {
    return out('formel', `**${top.name}** wird aus der Datenquelle \`${top.sqlRef || top.id}\` ermittelt${top.abhaengig?.length ? ` und hängt ab von: ${top.abhaengig.join(', ')}` : ''}. Inhaltlich: ${top.beschreibung}`, [top], [`Wie hoch ist ${top.name}?`])
  }
  // Ziel
  if (I.ziel.test(f)) {
    if (top.ziel == null) return out('ziel', `Für **${top.name}** ist kein Zielwert hinterlegt — die Kennzahl ist rein informativ.`, [top], [`Wie hoch ist ${top.name}?`])
    const ins = kpiInsight(top.id, werte[top.id])
    const v = werte[top.id]
    const lage = v == null ? '' : ` Aktuell: ${formatWert(v, top.einheit)} — ${AMP_WORT[ins.status]} (${ins.zielText}).`
    return out('ziel', `Zielwert für **${top.name}**: **${formatWert(top.ziel, top.einheit)}**.${lage}`, [top], [`Was tun für ${top.name}?`])
  }
  // Trend (optional Historie)
  if (I.trend.test(f)) {
    if (!ladeHistorie) return out('trend', `${wertSatz(top, werte)} (Verlaufsdaten hier nicht geladen — der Trend ist im Kennzahlen-Drilldown sichtbar.)`, [top])
    try {
      const hist = await ladeHistorie(top.id)
      const reihe = (hist || []).map((h) => ({ wert: h.wert }))
      const ins = kpiInsight(top.id, werte[top.id] ?? reihe.at(-1)?.wert, reihe)
      const richtung = ins.trend?.trend === 'flat' ? 'seitwärts' : ins.istGutTrend ? 'positiv' : 'rückläufig/ungünstig'
      const reiheTxt = (hist || []).slice(-4).map((h) => `${h.periode}: ${formatWert(h.wert, top.einheit)}`).join(' → ')
      return out('trend', `Trend **${top.name}**: ${richtung}. ${ins.aussage}\n\n_${reiheTxt}_`, [top], [`Was tun für ${top.name}?`])
    } catch {
      return out('trend', wertSatz(top, werte), [top])
    }
  }

  // Default: Wert
  return out('wert', wertSatz(top, werte), [top], [`Ziel von ${top.name}?`, `Trend von ${top.name}?`, `Was tun für ${top.name}?`])
}

export const ASSISTENT_TIPPS = TIPPS
