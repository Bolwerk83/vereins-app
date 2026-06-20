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

// --- SMART-Katalog: spezifische Vorschläge je problematischer KPI --------
const KATALOG = {
  wareneinsatzquote: { titel: 'Wareneinsatzquote senken (Preisgleitklausel + Ausschuss ↓)', hebel: 'Marge (Hebel #1)', erreichbarkeit: 'Rahmenverträge statt Spot-Einkauf, Zweitquelle Antrieb, Ausschuss ≤1,5 %.', frist: 'Q2–Q4', wirkungErgebnis: '+0,5–0,8 Mio € DB', wirkungLiquiditaet: 'neutral', aufwand: 'mittel' },
  retourenquote: { titel: 'Online-Retourenquote senken (PIM + Größenberatung)', hebel: 'Umsatzqualität', erreichbarkeit: 'PIM-Projekt priorisieren, Größenberater im Shop, Bekleidung straffen.', frist: 'Q2–Q3', wirkungErgebnis: '+0,8 Mio € Netto', wirkungLiquiditaet: 'gebundene Ware ↓', aufwand: 'mittel' },
  lagerbestand: { titel: 'Überbestände abbauen (Bestellmengen an Reichweite koppeln)', hebel: 'Bestand (Hebel #2)', erreichbarkeit: 'Bestellmengen an 40-Tage-Reichweite binden, Outlet, Lieferantenrückgabe.', frist: 'sofort–Q3', wirkungErgebnis: 'Lagerkosten −0,21 Mio €/J', wirkungLiquiditaet: '≈ 3,5 Mio € frei', aufwand: 'gering' },
  reichweite: { titel: 'Bestandsreichweite auf 40 Tage senken', hebel: 'Bestand (Hebel #2)', erreichbarkeit: 'Langsamdreher abverkaufen, Beschaffung an Bedarf koppeln.', frist: 'Q2–Q3', wirkungErgebnis: 'Lagerkosten ↓', wirkungLiquiditaet: 'Liquidität frei', aufwand: 'gering' },
  dso: { titel: 'DSO senken (Mahnwesen & Zahlungsziele)', hebel: 'Working Capital', erreichbarkeit: 'Konsequentes Mahnwesen, kürzere Zahlungsziele, Skonto-Anreize, Factoring prüfen.', frist: 'Q2', wirkungErgebnis: 'weniger Ausfälle', wirkungLiquiditaet: 'je −1 Tg ≈ 0,14 Mio €', aufwand: 'gering' },
  ueberfaelligkeitsquote: { titel: 'Überfällige Forderungen abbauen', hebel: 'Working Capital', erreichbarkeit: 'Aging-Review wöchentlich, Inkasso ab 60 Tagen, Kreditlimits.', frist: 'laufend', wirkungErgebnis: 'Ausfall ↓', wirkungLiquiditaet: 'Liquidität ↑', aufwand: 'gering' },
  forderungsausfall: { titel: 'Forderungsausfall reduzieren (Bonitätsprüfung)', hebel: 'Risiko', erreichbarkeit: 'Bonitätsprüfung bei Neukunden/B2B, Warenkreditversicherung prüfen.', frist: 'Q2–Q3', wirkungErgebnis: 'Ausfall −0,2 Mio €', wirkungLiquiditaet: 'positiv', aufwand: 'mittel' },
  klumpenrisikoTop3: { titel: 'Klumpenrisiko streuen (Kundenbasis verbreitern)', hebel: 'Risiko', erreichbarkeit: 'Neukundenakquise B2B, Abhängigkeit Top-3 senken.', frist: 'Jahresziel', wirkungErgebnis: 'stabilere Umsätze', wirkungLiquiditaet: 'neutral', aufwand: 'hoch' },
  oekostromanteil: { titel: 'Ökostromanteil auf 100 % erhöhen', hebel: 'ESG/Energie', erreichbarkeit: 'Stromliefervertrag umstellen, PV-Eigenerzeugung prüfen.', frist: 'Q3', wirkungErgebnis: 'Energiekosten planbar', wirkungLiquiditaet: 'CapEx PV', aufwand: 'mittel' },
  co2ProRad: { titel: 'CO₂ je Rad senken (Rezyklat + Logistik)', hebel: 'ESG', erreichbarkeit: 'Alu-Rezyklatanteil erhöhen, Scope-3-Logistik bündeln.', frist: 'Jahresziel', wirkungErgebnis: 'ESG-Rating ↑', wirkungLiquiditaet: 'neutral', aufwand: 'mittel' },
  gemeinkostenquote: { titel: 'Gemeinkostenquote senken (Gemeinkostenwertanalyse)', hebel: 'Kostenstruktur', erreichbarkeit: 'GWA in Verwaltung/Vertrieb, Prozesskosten prüfen.', frist: 'Q3', wirkungErgebnis: 'Fixkosten ↓', wirkungLiquiditaet: 'neutral', aufwand: 'mittel' },
  vertriebskostenquote: { titel: 'Vertriebskostenquote senken (Marketing-ROI)', hebel: 'Vertriebseffizienz', erreichbarkeit: 'Kanal-ROI messen, unrentable Promotions stoppen.', frist: 'Q2–Q3', wirkungErgebnis: 'DB ↑', wirkungLiquiditaet: 'neutral', aufwand: 'gering' },
  krankenstand: { titel: 'Krankenstand senken (BGM Filialverkauf)', hebel: 'Personal', erreichbarkeit: 'Betriebliches Gesundheitsmanagement, Einsatzplanung Filialen.', frist: 'Jahresziel', wirkungErgebnis: 'Produktivität ↑', wirkungLiquiditaet: 'neutral', aufwand: 'mittel' },
  investBudgettreue: { titel: 'CapEx-Budgettreue herstellen', hebel: 'Investitionssteuerung', erreichbarkeit: 'Freigabe-Workflow, Soll/Ist je Projekt monatlich.', frist: 'sofort', wirkungErgebnis: 'Planbarkeit', wirkungLiquiditaet: 'CapEx-Steuerung', aufwand: 'gering' },
  lagerumschlag: { titel: 'Lagerumschlag erhöhen', hebel: 'Bestand (Hebel #2)', erreichbarkeit: 'Sortiment straffen, Langsamdreher abbauen, JIT bei A-Teilen.', frist: 'Q2–Q3', wirkungErgebnis: 'Lagerkosten ↓', wirkungLiquiditaet: 'Liquidität frei', aufwand: 'mittel' }
}

/** Heuristische SMART-Empfehlungen aus den auffälligen KPIs. */
export function empfehleHeuristik(werte, rolle = null, maxAnzahl = 6) {
  const kandidaten = Object.values(KPI)
    .filter((k) => k.ziel != null && (!rolle || darfKpi(rolle, k)) && werte[k.id] != null)
    .map((k) => ({ k, status: ampelStatus({ wert: werte[k.id], ziel: k.ziel, richtung: k.richtung, warn: k.warn }) }))
    .filter((x) => x.status === 'r' || x.status === 'a')
    .sort((a, b) => (a.status === 'r' ? -1 : 1) - (b.status === 'r' ? -1 : 1)) // rot zuerst

  return kandidaten.slice(0, maxAnzahl).map(({ k, status }) => {
    const tmpl = KATALOG[k.id] || {}
    const richtungWort = k.richtung === 'tief_gut' ? 'senken' : 'steigern'
    return {
      titel: tmpl.titel || `${k.name} auf Ziel ${formatWert(k.ziel, k.einheit)} ${richtungWort}`,
      kpi: k.id, zielwert: k.ziel, einheit: k.einheit, bereich: k.bereich,
      istwert: werte[k.id], ampel: status,
      hebel: tmpl.hebel || k.bereich,
      erreichbarkeit: tmpl.erreichbarkeit || `Maßnahmen im Bereich ${k.bereich} bündeln und monatlich nachhalten.`,
      relevanz: 'Zahlt auf Ergebnis (Marge/EBIT) und/oder Liquidität ein — Unternehmensziel.',
      frist: tmpl.frist || 'nächstes Quartal',
      wirkungErgebnis: tmpl.wirkungErgebnis || 'Ergebnisverbesserung', wirkungLiquiditaet: tmpl.wirkungLiquiditaet || 'neutral',
      aufwand: tmpl.aufwand || 'mittel', quelle: 'ki'
    }
  })
}
