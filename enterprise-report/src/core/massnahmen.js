// =========================================================================
//  MASSNAHMEN — Eingabe, KI-Empfehlung (SMART) und Verwaltung.
//
//  - Verwaltung: persistente Liste (LocalStorage; später MSSQL-Tabelle).
//  - Empfehlung: aus den auffälligen KPIs (rot/amber) werden nach SMART
//    formulierte Maßnahmen abgeleitet — wie ein Controller sie vorschlägt.
//    (heuristisch hier; die KI-Variante liefert das Backend, s. biProvider.)
//
//  SMART je Maßnahme:
//    S spezifisch  -> titel
//    M messbar     -> kpi + zielwert (+ einheit)
//    A erreichbar  -> erreichbarkeit (Begründung/Weg)
//    R relevant    -> relevanz (Bezug zum Unternehmensziel)
//    T terminiert  -> frist
//  + Steuergrößen  -> hebel, wirkungErgebnis, wirkungLiquiditaet, aufwand
//  + Verwaltung    -> owner, status, quelle, erstellt
// =========================================================================
import { KPI } from './kpiRegistry.js'
import { ampelStatus } from './ampel.js'
import { darfKpi } from './rbac.js'
import { formatWert } from '../design/theme.js'

const KEY = 'er_massnahmen'
export const STATUS = ['offen', 'in_arbeit', 'erledigt', 'verworfen']

export function ladeMassnahmen() {
  try { return JSON.parse(localStorage.getItem(KEY) || '[]') } catch { return [] }
}
function speichere(arr) { localStorage.setItem(KEY, JSON.stringify(arr)); return arr }

export function addMassnahme(m) {
  const arr = ladeMassnahmen()
  const neu = { id: 'm_' + Date.now().toString(36) + Math.random().toString(36).slice(2, 6),
    status: 'offen', owner: '', quelle: 'manuell', erstellt: new Date().toISOString().slice(0, 10), ...m }
  return speichere([neu, ...arr])
}
export function updateMassnahme(id, patch) {
  return speichere(ladeMassnahmen().map((m) => (m.id === id ? { ...m, ...patch } : m)))
}
export function removeMassnahme(id) {
  return speichere(ladeMassnahmen().filter((m) => m.id !== id))
}

// --- Tracking: Fälligkeit & Alerts ---------------------------------------
const heute = () => new Date().toISOString().slice(0, 10)
export function istUeberfaellig(m) {
  return m.faelligkeit && m.faelligkeit < heute() && m.status !== 'erledigt' && m.status !== 'verworfen'
}
export function trackingZusammenfassung(liste = ladeMassnahmen()) {
  const z = { offen: 0, in_arbeit: 0, erledigt: 0, verworfen: 0, ueberfaellig: 0, fortschrittSchnitt: 0 }
  let n = 0
  for (const m of liste) {
    z[m.status] = (z[m.status] || 0) + 1
    if (istUeberfaellig(m)) z.ueberfaellig++
    if (m.status !== 'verworfen') { z.fortschrittSchnitt += Number(m.fortschritt || 0); n++ }
  }
  z.fortschrittSchnitt = n ? Math.round(z.fortschrittSchnitt / n) : 0
  return z
}

// --- VARIANTEN-ENGINE -----------------------------------------------------
//  Damit Vorschläge NICHT automatisch wirken: pro KPI mehrere innovative
//  Titel + Ansätze (verschiedene Hebel), variable Wirkungs-/Fristangaben.
//  Eine Rotation (Aufruf-Zähler) sorgt dafür, dass dieselbe Kennzahl bei
//  jeder neuen Auswertung anders formuliert wird — wie von einem Controller
//  frisch verfasst. Echte Ist-/Ziel-Zahlen werden in Titel & Relevanz
//  eingewoben, damit jeder Vorschlag konkret und einzigartig klingt.
// ------------------------------------------------------------------------
let aufrufNr = 0 // rotiert die Formulierungen über aufeinanderfolgende Auswertungen
const hash = (s) => { let h = 0; for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) >>> 0; return h }
const idx = (len, seed) => ((seed % len) + len) % len
const pick = (v, seed) => (Array.isArray(v) ? v[idx(v.length, seed)] : v)
// Wie pick, aber meidet schon im selben Lauf vergebene Formulierungen,
// damit zwei Maßnahmen nie denselben Titel/Ansatz tragen.
const pickUnique = (v, seed, used) => {
  if (!Array.isArray(v)) return v
  for (let o = 0; o < v.length; o++) {
    const cand = v[idx(v.length, seed + o)]
    if (!used.has(cand)) { used.add(cand); return cand }
  }
  return v[idx(v.length, seed)]
}

// Verschiedene Controller-Stimmen für die Relevanz-Begründung (mit echten Zahlen).
const RELEVANZ = [
  (g) => `Direkter Ergebnishebel: ${g.kpiName} steht bei ${g.ist} (Ziel ${g.ziel}) — die Lücke von ${g.luecke} kostet uns Monat für Monat Marge.`,
  (g) => `Das zahlt unmittelbar aufs Unternehmensziel ein: mit ${g.ist} liegen wir ${g.ueberunter} dem Zielwert ${g.ziel}; hier liegt echtes Geld auf der Straße.`,
  (g) => `Aus Steuerungssicht prioritär — ${g.kpiName} reißt mit ${g.ist} die Zielmarke ${g.ziel} und schlägt auf EBIT und Liquidität zugleich durch.`,
  (g) => `Wirkung vor Aufwand: schon die halbe Schließung der ${g.luecke}-Lücke (${g.ist} → ${g.ziel}) bringt einen messbaren Ergebnisbeitrag.`,
  (g) => `Roter Faden zum Jahresziel: ${g.kpiName} ist mit ${g.ist} ${g.ueberunter} Plan — ohne Gegensteuern verfehlen wir die Ergebnisplanung.`,
]

// Generische, aber variantenreiche Formulierungen für KPIs ohne Spezialkatalog.
const generischTitel = (k, w, ziel) => [
  `${k.name} gezielt ${w} — Zielkorridor ${ziel}`,
  `Kurs korrigieren: ${k.name} Richtung ${ziel} bringen`,
  `${k.bereich} in die Pflicht nehmen: ${k.name} ${w}`,
  `${k.name} ${w} mit Sofort- und Strukturmaßnahme`,
]
const generischAnsatz = (k) => [
  `Ich würde im ${k.bereich} die zwei größten Treiber isolieren, je eine Sofort- und eine Strukturmaßnahme aufsetzen und im Monatsgespräch nachhalten.`,
  `Erst eine schlanke Ursachenanalyse mit dem ${k.bereich}-Team, dann ein kleiner Pilot, der bei nachgewiesener Wirkung skaliert wird — Aufwand bewusst niedrig halten.`,
  `Benchmark gegen Vorjahr und Wettbewerb, klare Owner im ${k.bereich}, ein knappes Wirkungs-Cockpit statt großem Projekt.`,
  `Hypothesen-gestützt vorgehen: drei plausible Ursachen, drei Gegenmaßnahmen, nach 30 Tagen Wirkung messen und nachsteuern.`,
]

// --- SMART-Katalog: je KPI mehrere innovative Hebel & Formulierungen ------
const KATALOG = {
  wareneinsatzquote: { hebel: 'Marge (Hebel #1)', aufwand: 'mittel', wirkungLiquiditaet: 'neutral',
    frist: ['Q2–Q4', 'in zwei Quartalen', 'rollierend ab sofort'],
    titel: ['Wareneinsatz über Rahmenverträge & Zweitquellen drücken', 'Materialkosten je Rad per Value-Engineering angreifen', 'Einstandspreise mit Index-Preisgleitklauseln stabilisieren', 'Make-or-Buy & Lieferanten-Scorecards für bessere Konditionen'],
    ansatz: ['Ich würde die Top-5-Materialgruppen in Rahmenverträge überführen und beim Antrieb eine belastbare Zweitquelle aufbauen — das nimmt Preisspitzen die Wucht und senkt das Klumpenrisiko.', 'Teardown-/Value-Engineering-Workshop mit Einkauf und Entwicklung: die teuersten Baugruppen konstruktiv vereinfachen und parallel den Fertigungsausschuss unter 1,5 % drücken.', 'Aluminium über eine Index-Preisgleitklausel absichern, Skonti konsequent ziehen statt Spot einzukaufen, und Zahlungsziele als Verhandlungsmasse nutzen.', 'Lieferanten über ein Scorecard-System (Preis, Qualität, Termintreue) in den Wettbewerb stellen und Make-or-Buy für zugekaufte Komponenten neu rechnen.'],
    wirkungErgebnis: ['+0,5–0,8 Mio € DB p. a.', 'je Punkt Quote ≈ 0,5 Mio € EBIT', 'rund 0,6 Mio € Margeneffekt'] },
  retourenquote: { hebel: 'Umsatzqualität', aufwand: 'mittel', wirkungLiquiditaet: 'gebundene Ware ↓',
    frist: ['Q2–Q3', 'bis zur Herbstsaison', 'in zwei Sprints'],
    titel: ['Retourenquote über Größenberatung & bessere Produktdaten senken', 'Retouren-Treiber je Artikel sichtbar machen und abstellen', 'Passgenauigkeit erhöhen: weniger „Zurück", mehr Behalten', 'Retourenkosten an der Wurzel angreifen (PIM + Visualisierung)'],
    ansatz: ['Ich würde eine Retouren-Heatmap je SKU bauen und die 20 schlimmsten Artikel gezielt überarbeiten — bessere Maßtabellen, ehrlichere Bilder, klare Größenhinweise.', 'Größenberater und 360°-/Zoom-Ansichten im Shop ergänzen und das PIM-Projekt vorziehen; Bekleidung mit chronisch hoher Quote aus dem Sortiment nehmen.', 'Retourengründe sauber erfassen und auswerten, danach pro Top-Grund eine konkrete Gegenmaßnahme — und ein kleiner Behalte-Anreiz bei passender Größe.', 'A/B-Test mit Größen-Finder auf den retourenstärksten Kategorien; was die Quote nachweislich senkt, wird ausgerollt.'],
    wirkungErgebnis: ['+0,8 Mio € Netto', 'rund 1,2 Pkt weniger Quote', 'spürbar weniger Handling- & Wertverlust'] },
  lagerbestand: { hebel: 'Bestand (Hebel #2)', aufwand: 'gering', wirkungLiquiditaet: '≈ 3,5 Mio € frei',
    frist: ['sofort–Q3', 'startend ab dieser Woche', 'über zwei Quartale'],
    titel: ['Überbestände abbauen: Bestellmengen an Reichweite koppeln', 'Working Capital aus dem Lager holen', 'ABC-/XYZ-gesteuerte Disposition statt Bauchgefühl', 'Konsignations- & Rückgabevereinbarungen mit Lieferanten'],
    ansatz: ['Ich würde Bestellmengen strikt an eine 40-Tage-Reichweite binden, Langsamdreher über einen Outlet-/B-Ware-Kanal abverkaufen und Lieferantenrückgaben verhandeln.', 'ABC-/XYZ-Klassifizierung einführen: A-Teile knapp und häufig, C-Teile fallweise; das senkt Kapitalbindung ohne Lieferfähigkeit zu riskieren.', 'Mit den größten Lieferanten Konsignationslager und Buy-Back für saisonale Ware vereinbaren — Bestand wandert aus unserer Bilanz.', 'Demand-Sensing aus Abverkaufsdaten statt starrer Planzahlen; überschüssige Sicherheitsbestände gezielt abschmelzen.'],
    wirkungErgebnis: ['Lagerkosten −0,21 Mio €/J', 'einmalig ≈ 3,5 Mio € Liquidität', 'weniger Abschriften auf Altware'] },
  reichweite: { hebel: 'Bestand (Hebel #2)', aufwand: 'gering', wirkungLiquiditaet: 'Liquidität frei',
    frist: ['Q2–Q3', 'in 90 Tagen'],
    titel: ['Bestandsreichweite Richtung 40 Tage bringen', 'Langsamdreher konsequent abbauen', 'Beschaffung enger an den Bedarf koppeln'],
    ansatz: ['Langsamdreher mit gezielten Aktionen abverkaufen und die Nachbestellung an den tatsächlichen Abverkauf koppeln statt an Planmengen.', 'Reichweiten je Warengruppe transparent machen und für die Ausreißer harte Bestellstopps setzen, bis sich der Bestand normalisiert.', 'Mindestbestände neu rechnen und Lieferanten zu kleineren, häufigeren Losen bewegen.'],
    wirkungErgebnis: ['Lagerkosten ↓', 'gebundenes Kapital sinkt spürbar'] },
  dso: { hebel: 'Working Capital', aufwand: 'gering', wirkungLiquiditaet: 'je −1 Tg ≈ 0,14 Mio €',
    frist: ['Q2', 'ab nächstem Mahnlauf', 'sofort'],
    titel: ['DSO senken: Mahnrhythmus & Zahlungsziele schärfen', 'Forderungslaufzeit verkürzen, Liquidität heben', 'Dynamic Discounting & E-Invoicing einführen', 'Außenstände aktiv steuern statt verwalten'],
    ansatz: ['Ich würde einen festen, automatisierten Mahnrhythmus etablieren, Zahlungsziele bei Neukunden kürzen und Skonto-Anreize gezielt setzen — Factoring nur für die kritischsten Posten.', 'E-Invoicing plus ein Kundenportal mit Sofort-Zahlungsoptionen einführen; jeder Tag weniger DSO bringt rund 0,14 Mio € Liquidität.', 'Dynamic Discounting anbieten: kleiner Nachlass gegen frühe Zahlung — rechnet sich gegenüber unseren Finanzierungskosten.', 'Die zehn größten Außenstände persönlich nachfassen (Klärfälle, Reklamationen auflösen) statt nur Standardmahnungen zu verschicken.'],
    wirkungErgebnis: ['je −1 Tag ≈ 0,14 Mio € frei', 'weniger Ausfälle und Klärfälle', 'planbarere Liquidität'] },
  ueberfaelligkeitsquote: { hebel: 'Working Capital', aufwand: 'gering', wirkungLiquiditaet: 'Liquidität ↑',
    frist: ['laufend', 'wöchentlicher Rhythmus'],
    titel: ['Überfällige Forderungen konsequent abbauen', 'Aging-Review zur wöchentlichen Routine machen', 'Eskalationspfad für Altforderungen etablieren'],
    ansatz: ['Wöchentliches Aging-Review mit klaren Eskalationsstufen, Inkasso ab 60 Tagen und verbindlichen Kreditlimits je Kunde.', 'Die überfälligen Posten nach Betrag priorisieren und die Top-Fälle mit Vertrieb gemeinsam klären — oft steckt eine ungelöste Reklamation dahinter.', 'Mahnstufen automatisieren und ab Stufe 3 den Lieferstopp greifen lassen, damit sich Außenstände nicht weiter aufbauen.'],
    wirkungErgebnis: ['Ausfallrisiko ↓', 'Liquidität ↑', 'sauberere Altersstruktur'] },
  forderungsausfall: { hebel: 'Risiko', aufwand: 'mittel', wirkungLiquiditaet: 'positiv',
    frist: ['Q2–Q3', 'vor dem nächsten Großauftrag'],
    titel: ['Forderungsausfall über Bonitätsprüfung reduzieren', 'Kreditrisiko vorne im Prozess abfangen', 'Warenkreditversicherung gezielt einsetzen'],
    ansatz: ['Bonitätsprüfung verbindlich bei Neukunden und B2B-Großaufträgen verankern und Kreditlimits aus der Bonität ableiten.', 'Eine Warenkreditversicherung für das exponierte B2B-Geschäft prüfen und Anzahlungen bei Erstaufträgen einführen.', 'Frühwarnindikatoren (verschleppte Zahlungen, sinkende Bestellfrequenz) auswerten und gefährdete Kunden früh auf Vorkasse stellen.'],
    wirkungErgebnis: ['Ausfall −0,2 Mio €', 'geringeres Klumpen- & Kreditrisiko'] },
  klumpenrisikoTop3: { hebel: 'Risiko', aufwand: 'hoch', wirkungLiquiditaet: 'neutral',
    frist: ['Jahresziel', 'über die nächsten 12 Monate'],
    titel: ['Klumpenrisiko streuen: Kundenbasis verbreitern', 'Abhängigkeit von den Top-3-Kunden senken', 'Umsatz auf mehr Schultern verteilen'],
    ansatz: ['Gezielte B2B-Neukundenakquise in zwei bis drei neuen Segmenten, um die Abhängigkeit von den Top-3 messbar zu senken.', 'Mit den Schlüsselkunden Rahmenverträge mit längerer Bindung schließen und parallel den Mittelstands-Vertrieb ausbauen.', 'Ein Frühwarn-Cockpit für Konzentrationsrisiken aufsetzen und Vertriebsziele explizit auf Diversifikation ausrichten.'],
    wirkungErgebnis: ['stabilere, weniger volatile Umsätze', 'geringeres Ausfallrisiko bei Kundenverlust'] },
  oekostromanteil: { hebel: 'ESG/Energie', aufwand: 'mittel', wirkungLiquiditaet: 'CapEx PV',
    frist: ['Q3', 'bis zum nächsten Liefervertrag'],
    titel: ['Ökostromanteil Richtung 100 % bringen', 'Energiekosten über grüne Lieferverträge planbar machen', 'PV-Eigenerzeugung als Energiehebel prüfen'],
    ansatz: ['Stromliefervertrag auf zertifizierten Grünstrom umstellen und eine PPA-Option mit Preisfixierung verhandeln — das macht Energiekosten planbar.', 'PV-Eigenerzeugung auf Dach- und Logistikflächen rechnen; Eigenverbrauch senkt Bezug und CO₂ zugleich.', 'Lastmanagement und Effizienzmaßnahmen mit dem Grünstrom-Umstieg bündeln, damit ESG-Wirkung und Kostenwirkung zusammenfallen.'],
    wirkungErgebnis: ['planbare Energiekosten', 'ESG-Rating ↑', 'CO₂ im Scope 2 ↓'] },
  co2ProRad: { hebel: 'ESG', aufwand: 'mittel', wirkungLiquiditaet: 'neutral',
    frist: ['Jahresziel', 'mehrstufig über 12 Monate'],
    titel: ['CO₂ je Rad senken: Rezyklat & Logistik', 'Produkt-Fußabdruck strukturell verbessern', 'Scope-3-Emissionen entlang der Lieferkette drücken'],
    ansatz: ['Alu-Rezyklatanteil schrittweise erhöhen und Scope-3-Logistik durch Bündelung und Bahnanteil reduzieren.', 'Mit den größten Vorlieferanten Produkt-Fußabdrücke je Komponente erheben und CO₂ als Vergabekriterium aufnehmen.', 'Verpackung und Transportwege neu denken (Sammelladungen, regionale Quellen) — senkt Kosten und Emissionen gemeinsam.'],
    wirkungErgebnis: ['ESG-Rating ↑', 'geringerer Produkt-Fußabdruck', 'robuster gegen CO₂-Bepreisung'] },
  gemeinkostenquote: { hebel: 'Kostenstruktur', aufwand: 'mittel', wirkungLiquiditaet: 'neutral',
    frist: ['Q3', 'im nächsten Budgetzyklus'],
    titel: ['Gemeinkostenquote über Gemeinkostenwertanalyse senken', 'Overhead hinterfragen: Nutzen je Kostenblock', 'Prozesskosten in Verwaltung & Vertrieb straffen'],
    ansatz: ['Eine Gemeinkostenwertanalyse (GWA) in Verwaltung und Vertrieb fahren: jede Leistung auf Nutzen und Verzichtbarkeit prüfen.', 'Die fünf größten Gemeinkostenblöcke einzeln aufmachen und je Block einen Einsparpfad mit Owner definieren.', 'Wiederkehrende Prozesse automatisieren statt Stellen aufzubauen; Sachkosten über Bündelung und Vertragsreview senken.'],
    wirkungErgebnis: ['Fixkostenquote ↓', 'strukturell schlankerer Overhead'] },
  vertriebskostenquote: { hebel: 'Vertriebseffizienz', aufwand: 'gering', wirkungLiquiditaet: 'neutral',
    frist: ['Q2–Q3', 'ab der nächsten Kampagne'],
    titel: ['Vertriebskostenquote über Kanal-ROI senken', 'Marketingbudget auf die rentablen Kanäle lenken', 'Unrentable Promotions stoppen, Rabatte schärfen'],
    ansatz: ['Kanal- und Kampagnen-ROI sauber messen und Budget konsequent von schwachen auf starke Kanäle umschichten.', 'Rabattfreigaben an Deckungsbeitragsschwellen koppeln, damit Umsatz nicht auf Kosten der Marge gekauft wird.', 'Ein einfaches Vertriebs-Cockpit (Kosten je gewonnenem Auftrag) einführen und die teuersten Promotions auf den Prüfstand stellen.'],
    wirkungErgebnis: ['DB ↑ bei gleichem Umsatz', 'effizienterer Marketing-Euro'] },
  krankenstand: { hebel: 'Personal', aufwand: 'mittel', wirkungLiquiditaet: 'neutral',
    frist: ['Jahresziel', 'startend im nächsten Quartal'],
    titel: ['Krankenstand über BGM im Filialverkauf senken', 'Ausfallzeiten strukturell reduzieren', 'Einsatzplanung & Gesundheit zusammen denken'],
    ansatz: ['Betriebliches Gesundheitsmanagement gezielt in den Filialen mit den höchsten Quoten starten und Rückkehrgespräche etablieren.', 'Einsatz- und Schichtplanung entzerren, Belastungsspitzen glätten und Springer-Pools für die Stoßzeiten aufbauen.', 'Ursachen je Standort analysieren (Belastung, Führung, Ergonomie) und passgenau statt pauschal gegensteuern.'],
    wirkungErgebnis: ['Produktivität ↑', 'weniger teure Ausfallspitzen'] },
  investBudgettreue: { hebel: 'Investitionssteuerung', aufwand: 'gering', wirkungLiquiditaet: 'CapEx-Steuerung',
    frist: ['sofort', 'ab dem laufenden Zyklus'],
    titel: ['CapEx-Budgettreue über klaren Freigabe-Workflow', 'Investitionen monatlich auf Soll/Ist steuern', 'Projekt-Gates für Investitionsdisziplin'],
    ansatz: ['Einen verbindlichen Freigabe-Workflow mit Schwellen einführen und je Projekt monatlich Soll/Ist mit Forecast nachhalten.', 'Stage-Gates definieren: Mittel werden erst je Projektphase freigegeben, nicht en bloc — das verhindert Budgetdrift.', 'Ein schlankes Investitions-Cockpit aufsetzen, das Überschreitungen früh sichtbar macht und Priorisierung erzwingt.'],
    wirkungErgebnis: ['planbarer Mittelabfluss', 'weniger Budgetüberschreitungen'] },
  lagerumschlag: { hebel: 'Bestand (Hebel #2)', aufwand: 'mittel', wirkungLiquiditaet: 'Liquidität frei',
    frist: ['Q2–Q3', 'über zwei Quartale'],
    titel: ['Lagerumschlag erhöhen: Sortiment & Disposition', 'Drehzahl steigern, Kapitalbindung senken', 'JIT bei A-Teilen, Abbau bei Langsamdrehern'],
    ansatz: ['Sortiment straffen, Langsamdreher abbauen und bei A-Teilen Richtung Just-in-Time mit engerer Lieferantentaktung gehen.', 'Die Drehzahl je Warengruppe sichtbar machen und für die untersten 20 % einen klaren Abbauplan mit Aktionen aufsetzen.', 'Mindestbestände und Losgrößen neu rechnen; mit Lieferanten kleinere, häufigere Lieferungen vereinbaren.'],
    wirkungErgebnis: ['Lagerkosten ↓', 'mehr Liquidität bei gleicher Lieferfähigkeit'] },
}

/** Heuristische SMART-Empfehlungen aus den auffälligen KPIs — variantenreich. */
export function empfehleHeuristik(werte, rolle = null, maxAnzahl = 6) {
  aufrufNr++ // jede neue Auswertung rotiert die Formulierungen
  const kandidaten = Object.values(KPI)
    .filter((k) => k.ziel != null && (!rolle || darfKpi(rolle, k)) && werte[k.id] != null)
    .map((k) => ({ k, status: ampelStatus({ wert: werte[k.id], ziel: k.ziel, richtung: k.richtung, warn: k.warn }) }))
    .filter((x) => x.status === 'r' || x.status === 'a')
    .sort((a, b) => (a.status === 'r' ? -1 : 1) - (b.status === 'r' ? -1 : 1)) // rot zuerst

  const usedTitel = new Set(), usedAnsatz = new Set() // keine Doppelung im selben Lauf
  return kandidaten.slice(0, maxAnzahl).map(({ k, status }, i) => {
    const tmpl = KATALOG[k.id]
    const seed = aufrufNr + i * 7 + hash(k.id) // pro Maßnahme & Aufruf anderer Variantenschnitt
    const richtungWort = k.richtung === 'tief_gut' ? 'senken' : 'steigern'
    const ist = formatWert(werte[k.id], k.einheit)
    const ziel = formatWert(k.ziel, k.einheit)
    const luecke = formatWert(Math.abs(werte[k.id] - k.ziel), k.einheit)
    const g = { kpiName: k.name, ist, ziel, luecke, ueberunter: werte[k.id] > k.ziel ? 'über' : 'unter', bereich: k.bereich }
    return {
      titel: pickUnique(tmpl ? tmpl.titel : generischTitel(k, richtungWort, ziel), seed, usedTitel),
      kpi: k.id, zielwert: k.ziel, einheit: k.einheit, bereich: k.bereich,
      istwert: werte[k.id], ampel: status,
      hebel: tmpl?.hebel || k.bereich,
      erreichbarkeit: pickUnique(tmpl ? tmpl.ansatz : generischAnsatz(k), seed, usedAnsatz),
      relevanz: pick(RELEVANZ, seed)(g),
      frist: pick(tmpl?.frist, seed) || 'nächstes Quartal',
      wirkungErgebnis: pick(tmpl?.wirkungErgebnis, seed) || 'Ergebnisverbesserung',
      wirkungLiquiditaet: pick(tmpl?.wirkungLiquiditaet, seed) || 'neutral',
      aufwand: tmpl?.aufwand || 'mittel', quelle: 'ki',
    }
  })
}
