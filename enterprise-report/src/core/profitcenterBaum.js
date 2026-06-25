// =========================================================================
//  PROFITCENTER-HIERARCHIE (8 Ebenen) — bricht das Gesamtergebnis vollständig
//  herunter:
//    1 Konzern → 2 Geschäftsbereich (Profit-Center) → 3 Region (Land) →
//    4 Funktion → 5 Kostenstelle → 6 Kostenart → 7 Einzelposten → 8 Beleg.
//  Jeder Knoten rollt Erlös/Kosten/Ergebnis aus seinen Kindern auf (bottom-up,
//  exakt). Ebenen 1–5 stammen aus den echten PC-/Kostenstellen-Daten, die
//  Ebenen 6–8 werden deterministisch (anteilig, summenerhaltend) aufgefächert.
// =========================================================================
import { pcInfo, kostenstellen } from './pcKostenstellen.js'

export const EBENEN = ['Konzern', 'Geschäftsbereich', 'Region', 'Funktion', 'Kostenstelle', 'Kostenart', 'Einzelposten', 'Beleg']
export const MAX_EBENE = EBENEN.length // 8

const LAND_NAME = { DE: 'Deutschland', CH: 'Schweiz', AT: 'Österreich', NL: 'Niederlande', zentral: 'Zentral / Konzern' }
const FUNKTION_NAME = { beschaffung: 'Beschaffung', produktion: 'Produktion', logistik: 'Logistik', vertrieb: 'Vertrieb', marketing: 'Marketing', verwaltung: 'Verwaltung' }

// Kostenarten-Mix je Funktion (Summe = 1). Bestimmt die Aufteilung der KSt-Kosten.
const KOSTENART_MIX = {
  beschaffung: [['Materialkosten', .86], ['Personalkosten', .07], ['Fremdleistungen', .04], ['Sonstige Kosten', .03]],
  produktion: [['Personalkosten', .44], ['Materialkosten', .30], ['Abschreibungen', .16], ['Fremdleistungen', .05], ['Sonstige Kosten', .05]],
  logistik: [['Personalkosten', .46], ['Fremdleistungen', .29], ['Abschreibungen', .10], ['Sonstige Kosten', .15]],
  vertrieb: [['Personalkosten', .55], ['Fremdleistungen', .15], ['Abschreibungen', .10], ['Sonstige Kosten', .20]],
  marketing: [['Fremdleistungen', .60], ['Personalkosten', .25], ['Sonstige Kosten', .15]],
  verwaltung: [['Personalkosten', .60], ['Abschreibungen', .15], ['Fremdleistungen', .10], ['Sonstige Kosten', .15]],
}
// Einzelposten je Kostenart (Summe = 1).
const POSTEN = {
  Personalkosten: [['Löhne & Gehälter', .76], ['Sozialabgaben', .19], ['Sonstige Personalkosten', .05]],
  Materialkosten: [['Wareneinsatz', .88], ['Hilfs-/Betriebsstoffe', .12]],
  Fremdleistungen: [['Dienstleister', .64], ['Agenturen / Externe', .36]],
  Abschreibungen: [['Maschinen & Anlagen', .62], ['Betriebsausstattung', .38]],
  'Sonstige Kosten': [['Raum-/Energiekosten', .55], ['Reise & Sonstiges', .45]],
}
// Belege je Einzelposten (Summe = 1) — Periodensicht.
const BELEGE = [['1. Halbjahr', .53], ['2. Halbjahr', .47]]

let _seq = 0
const knoten = (id, name, ebene, eigenErloes = 0, eigenKosten = 0) =>
  ({ id, name, ebene, ebeneName: EBENEN[ebene - 1], eigenErloes, eigenKosten, erloes: 0, kosten: 0, ergebnis: 0, marge: null, ampel: 'n', kinder: [] })

// Anteilig auffächern: betrag wird gemäß mix ([name, anteil]) auf Kinder verteilt,
// die letzte Position trägt den Rundungsrest (summenerhaltend).
function faechere(betrag, mix, baueKind) {
  let rest = Math.round(betrag * 100) / 100
  mix.forEach(([name, anteil], i) => {
    const teil = i === mix.length - 1 ? rest : Math.round(betrag * anteil * 100) / 100
    rest = Math.round((rest - teil) * 100) / 100
    baueKind(name, teil)
  })
}

/** Baut den vollständigen 8-Ebenen-Baum mit aufgerollten Werten. */
export function baueBaum() {
  _seq = 0
  const root = knoten('konzern', 'VeloWerk Gruppe', 1)
  const ks = kostenstellen()
  const finde = (parent, id, name, ebene) => {
    let k = parent.kinder.find((x) => x.id === id)
    if (!k) { k = knoten(id, name, ebene); parent.kinder.push(k) }
    return k
  }
  for (const k of ks) {
    const pc = finde(root, `pc:${k.pc}`, pcInfo(k.pc)?.name || k.pc, 2)
    const region = finde(pc, `${pc.id}|land:${k.land}`, LAND_NAME[k.land] || k.land, 3)
    const funktion = finde(region, `${region.id}|fn:${k.funktion}`, FUNKTION_NAME[k.funktion] || k.funktion, 4)
    // Ebene 5: die Kostenstelle (trägt den echten Erlös).
    const ksKn = knoten(`ks:${k.id}`, k.name, 5, k.erloes, 0)
    funktion.kinder.push(ksKn)
    // Ebene 6–8: Kosten der KSt deterministisch auffächern.
    const mix = KOSTENART_MIX[k.funktion] || KOSTENART_MIX.vertrieb
    faechere(k.kosten, mix, (artName, artBetrag) => {
      const art = knoten(`${ksKn.id}|art:${artName}`, artName, 6)
      ksKn.kinder.push(art)
      faechere(artBetrag, POSTEN[artName] || [['Posten', 1]], (posName, posBetrag) => {
        const pos = knoten(`${art.id}|pos:${posName}`, posName, 7)
        art.kinder.push(pos)
        faechere(posBetrag, BELEGE, (belName, belBetrag) => {
          pos.kinder.push(knoten(`${pos.id}|bel:${belName}|${_seq++}`, belName, 8, 0, belBetrag))
        })
      })
    })
  }
  rollup(root)
  return root
}

// Bottom-up: Erlös/Kosten = eigen + Summe der Kinder; Ergebnis, Marge, Ampel.
function rollup(n) {
  if (n.kinder.length) {
    n.kinder.forEach(rollup)
    n.erloes = n.eigenErloes + n.kinder.reduce((s, c) => s + c.erloes, 0)
    n.kosten = n.eigenKosten + n.kinder.reduce((s, c) => s + c.kosten, 0)
  } else {
    n.erloes = n.eigenErloes; n.kosten = n.eigenKosten
  }
  n.erloes = Math.round(n.erloes * 100) / 100
  n.kosten = Math.round(n.kosten * 100) / 100
  n.ergebnis = Math.round((n.erloes - n.kosten) * 100) / 100
  n.marge = n.erloes > 0 ? n.ergebnis / n.erloes : null
  // Ampel nur bei Erlös sinnvoll (reine Kostenknoten = neutral).
  n.ampel = n.marge == null ? 'n' : n.marge >= 0.05 ? 'g' : n.marge >= 0 ? 'a' : 'r'
  return n
}

/** Sichtbare Zeilen je nach geöffneten Knoten (Set von IDs) bis maxEbene. */
export function sichtbareZeilen(root, offen, maxEbene = MAX_EBENE) {
  const rows = []
  const lauf = (n, tiefe) => {
    rows.push({ id: n.id, name: n.name, ebene: n.ebene, ebeneName: n.ebeneName, erloes: n.erloes, kosten: n.kosten, ergebnis: n.ergebnis, marge: n.marge, ampel: n.ampel, tiefe, hatKinder: n.kinder.length > 0 && n.ebene < maxEbene, offen: offen.has(n.id) })
    if (n.ebene < maxEbene && offen.has(n.id)) n.kinder.forEach((c) => lauf(c, tiefe + 1))
  }
  root.kinder.forEach((c) => lauf(c, 0)) // Wurzel (Konzern) separat als Kopf
  return rows
}

/** Alle aufklappbaren IDs bis maxEbene (für „alle aufklappen"). */
export function alleIds(root, maxEbene = MAX_EBENE) {
  const ids = []
  const lauf = (n) => { if (n.ebene < maxEbene && n.kinder.length) { ids.push(n.id); n.kinder.forEach(lauf) } }
  lauf(root)
  return ids
}
