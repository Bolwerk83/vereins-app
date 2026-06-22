// =========================================================================
//  CONTROLLER-RADAR — Ein-Klick-Auswertung über ALLE Berichte.
//  Bündelt Auffälligkeiten aus Detaillisten (Plausi) UND Kennzahlen (Ampel),
//  priorisiert (kritisch zuerst) und erkennt Folgefehler über den
//  KPI-Abhängigkeitsgraphen: abgeleitete Kennzahlen werden der Ursache
//  zugeordnet und ausgeblendet — gemeldet wird nur die Wurzel.
//  "KI": erklärbare, regelbasierte Analyse (echter BI-Agent andockbar).
// =========================================================================
import { KPI } from './kpiRegistry.js'
import { ampelStatus } from './ampel.js'
import { sammelBefunde } from './detailberichte.js'
import { BEREICH_VON_LISTE } from './qualitaet.js'

const W = { fehler: 3, warnung: 2, hinweis: 1 }

// Transitive Abhängigkeiten einer KPI (alle Vorläufer-Kennzahlen).
function abhaengigkeiten(id, seen = new Set()) {
  for (const d of (KPI[id]?.abhaengig || [])) if (!seen.has(d)) { seen.add(d); abhaengigkeiten(d, seen) }
  return seen
}

function bewerteKpis(werte) {
  const flagged = {} // id -> {status, wert}
  for (const id of Object.keys(KPI)) {
    const k = KPI[id]
    if (k.ziel == null) continue
    const wert = werte?.[id]
    if (wert == null) continue
    const status = ampelStatus({ wert, ziel: k.ziel, richtung: k.richtung, warn: k.warn })
    if (status === 'r' || status === 'a') flagged[id] = { status, wert }
  }
  const flaggedSet = new Set(Object.keys(flagged))
  const items = [], roots = {}
  let unterdrueckt = 0
  for (const id of flaggedSet) {
    const deps = abhaengigkeiten(id)
    const flaggedDeps = [...deps].filter((d) => flaggedSet.has(d))
    if (flaggedDeps.length > 0) { unterdrueckt++; for (const r of flaggedDeps) (roots[r] = roots[r] || []).push(id); continue }
  }
  for (const id of flaggedSet) {
    const deps = abhaengigkeiten(id)
    if ([...deps].some((d) => flaggedSet.has(d))) continue // Folgefehler -> ausgeblendet
    const k = KPI[id], f = flagged[id]
    const abwPct = Math.abs((f.wert - k.ziel) / (k.ziel || 1)) * 100
    const wirktAuf = (roots[id] || []).map((x) => KPI[x]?.name || x)
    items.push({
      key: 'kpi:' + id, art: 'KPI', titel: k.name, bereich: k.bereich || 'GF',
      schwere: f.status === 'r' ? 'fehler' : 'warnung',
      text: `${k.name} ${f.status === 'r' ? 'deutlich' : 'knapp'} außerhalb des Ziels (Ist vs. Ziel ${Math.round(abwPct)} % Abweichung).`,
      wirktAuf, prio: W[f.status === 'r' ? 'fehler' : 'warnung'] * 100 + Math.min(80, Math.round(abwPct)) + wirktAuf.length * 6
    })
  }
  return { items, unterdrueckt }
}

function bewerteDetails() {
  const proRecord = {}
  for (const b of sammelBefunde()) {
    const key = b.listId + '::' + b.id
    const r = proRecord[key] = proRecord[key] || { key: 'det:' + key, art: 'Detailliste', listId: b.listId, id: b.id, titel: `${b.listName} · ${b.id}${b.titel ? ' · ' + b.titel : ''}`, bereich: BEREICH_VON_LISTE[b.listId] || 'Sonstige', gruende: [], schwere: 'hinweis' }
    r.gruende.push({ schwere: b.schwere, text: b.text })
    if (W[b.schwere] > W[r.schwere]) r.schwere = b.schwere
  }
  return Object.values(proRecord).map((r) => ({ ...r, prio: W[r.schwere] * 100 + r.gruende.length * 4 }))
}

/** Gesamte Radar-Auswertung. `werte` = aktuelle KPI-Werte (für die Ampel). */
export function radar(werte = {}) {
  const kpi = bewerteKpis(werte)
  const det = bewerteDetails()
  const alle = [...kpi.items, ...det].sort((a, b) => b.prio - a.prio)
  const kritisch = alle.filter((x) => x.schwere === 'fehler')
  const weitere = alle.filter((x) => x.schwere !== 'fehler')

  const jeBereich = {}
  for (const x of alle) jeBereich[x.bereich] = (jeBereich[x.bereich] || 0) + 1
  const top = Object.entries(jeBereich).sort((a, b) => b[1] - a[1])[0]
  const rootKpi = kpi.items.filter((x) => x.wirktAuf?.length).sort((a, b) => b.wirktAuf.length - a.wirktAuf.length)[0]

  const teile = [`KI-Analyse: ${kritisch.length} kritische Punkte und ${weitere.length} weitere Hinweise`]
  if (top) teile.push(`Schwerpunkt „${top[0]}" (${top[1]}).`)
  if (rootKpi) teile.push(`Wurzelursache „${rootKpi.titel}" erklärt ${rootKpi.wirktAuf.length} Folge-Kennzahl(en): ${rootKpi.wirktAuf.join(', ')}.`)
  if (kpi.unterdrueckt > 0) teile.push(`${kpi.unterdrueckt} Folgefehler wurden der Ursache zugeordnet und ausgeblendet.`)

  return {
    kritisch, weitere,
    statistik: { gesamt: alle.length, kritisch: kritisch.length, weitere: weitere.length, unterdrueckt: kpi.unterdrueckt, jeBereich },
    zusammenfassung: teile.join(' '),
    stand: new Date().toISOString().slice(0, 10)
  }
}
