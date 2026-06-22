// =========================================================================
//  KOSTENARTENRECHNUNG — „Welche Kosten entstehen?" — mehrdimensional.
//
//  Jede Kostenart trägt mehrere Klassifikationen (Kap. 2.2.4.1):
//    art        : nach verbrauchtem Kostengut (Stoff, Arbeit, Fremd, …)
//    funktion   : betriebliche Funktion (Beschaffung/Fertigung/Verw./Vertrieb)
//    fixvar     : nach Beschäftigung (fix vs. variabel)
//    zurechnung : Zurechenbarkeit (Einzel- vs. Gemeinkosten)
//    herkunft   : primär (von außen) vs. sekundär (innerbetrieblich/kalk.)
//
//  Damit lässt sich die Kostenstruktur aus jedem Blickwinkel auswerten.
// =========================================================================

export const DIMENSIONEN = [
  { id: 'art', name: 'Art (Kostengut)', laie: 'Was wurde verbraucht?',
    labels: { stoff: 'Stoffkosten', arbeit: 'Arbeitskosten', fremd: 'Fremddienste/-rechte', abschr: 'Abschreibungen', wagnis: 'Wagniskosten', zins: 'Zinskosten', kapital: 'Steuern/Gebühren/Beiträge' } },
  { id: 'funktion', name: 'Funktion', laie: 'In welchem Unternehmensbereich?',
    labels: { beschaffung: 'Beschaffung', fertigung: 'Fertigung', verwaltung: 'Verwaltung', vertrieb: 'Vertrieb' } },
  { id: 'fixvar', name: 'Beschäftigung', laie: 'Ändert sich der Betrag mit der Menge?',
    labels: { fix: 'Fixkosten', variabel: 'Variable Kosten' } },
  { id: 'zurechnung', name: 'Zurechenbarkeit', laie: 'Direkt einem Produkt zurechenbar?',
    labels: { einzel: 'Einzelkosten', gemein: 'Gemeinkosten' } },
  { id: 'herkunft', name: 'Herkunft', laie: 'Von außen bezogen oder kalkulatorisch?',
    labels: { primaer: 'Primär', sekundaer: 'Sekundär / kalkulatorisch' } }
]
export const dimension = (id) => DIMENSIONEN.find((d) => d.id === id)

// Kostenarten-Stamm (Mio €) — VeloWerk, inkl. kalkulatorischer Kosten.
export const STAMM = [
  { name: 'Rohstoffe / Material',         betrag: 20.4, art: 'stoff',  funktion: 'fertigung',   fixvar: 'variabel', zurechnung: 'einzel', herkunft: 'primaer' },
  { name: 'Handelsware',                  betrag: 6.4,  art: 'stoff',  funktion: 'beschaffung', fixvar: 'variabel', zurechnung: 'einzel', herkunft: 'primaer' },
  { name: 'Energie / Betriebsstoffe',     betrag: 1.8,  art: 'stoff',  funktion: 'fertigung',   fixvar: 'variabel', zurechnung: 'gemein', herkunft: 'primaer' },
  { name: 'Fertigungslöhne',              betrag: 5.2,  art: 'arbeit', funktion: 'fertigung',   fixvar: 'variabel', zurechnung: 'einzel', herkunft: 'primaer' },
  { name: 'Gehälter Verwaltung',          betrag: 3.3,  art: 'arbeit', funktion: 'verwaltung',  fixvar: 'fix',      zurechnung: 'gemein', herkunft: 'primaer' },
  { name: 'Gehälter Vertrieb',            betrag: 2.0,  art: 'arbeit', funktion: 'vertrieb',    fixvar: 'fix',      zurechnung: 'gemein', herkunft: 'primaer' },
  { name: 'Logistik (Fremd)',             betrag: 2.3,  art: 'fremd',  funktion: 'vertrieb',    fixvar: 'variabel', zurechnung: 'gemein', herkunft: 'primaer' },
  { name: 'Marketing / Agentur',          betrag: 2.9,  art: 'fremd',  funktion: 'vertrieb',    fixvar: 'fix',      zurechnung: 'gemein', herkunft: 'primaer' },
  { name: 'IT / Lizenzen',                betrag: 1.2,  art: 'fremd',  funktion: 'verwaltung',  fixvar: 'fix',      zurechnung: 'gemein', herkunft: 'primaer' },
  { name: 'Raum / Miete',                 betrag: 1.3,  art: 'fremd',  funktion: 'verwaltung',  fixvar: 'fix',      zurechnung: 'gemein', herkunft: 'primaer' },
  { name: 'Bilanzielle Abschreibungen',   betrag: 0.7,  art: 'abschr', funktion: 'fertigung',   fixvar: 'fix',      zurechnung: 'gemein', herkunft: 'primaer' },
  { name: 'Steuern / Gebühren / Beiträge', betrag: 1.0, art: 'kapital', funktion: 'verwaltung', fixvar: 'fix',      zurechnung: 'gemein', herkunft: 'primaer' },
  { name: 'Kalk. Zinsen (EK)',            betrag: 0.6,  art: 'zins',   funktion: 'verwaltung',  fixvar: 'fix',      zurechnung: 'gemein', herkunft: 'sekundaer', kalk: true },
  { name: 'Kalk. Wagnisse',               betrag: 0.5,  art: 'wagnis', funktion: 'fertigung',   fixvar: 'variabel', zurechnung: 'gemein', herkunft: 'sekundaer', kalk: true }
]

export function summe(stamm = STAMM) { return +stamm.reduce((n, p) => n + p.betrag, 0).toFixed(2) }

/** Verteilung über eine Dimension: [{ key, label, betrag, anteil }] (sortiert). */
export function verteilung(dimId, stamm = STAMM) {
  const d = dimension(dimId); const ges = summe(stamm) || 1
  const map = {}
  for (const p of stamm) { const k = p[dimId]; map[k] = (map[k] || 0) + p.betrag }
  return Object.entries(map)
    .map(([key, betrag]) => ({ key, label: d?.labels[key] || key, betrag: +betrag.toFixed(2), anteil: +(betrag / ges * 100).toFixed(1) }))
    .sort((a, b) => b.betrag - a.betrag)
}

/** Kreuztabelle: Zeilen = Dimension A, Spalten = Dimension B (Beträge). */
export function kreuztabelle(zeileDim, spalteDim, stamm = STAMM) {
  const dz = dimension(zeileDim), ds = dimension(spalteDim)
  const spalten = Object.keys(ds.labels)
  const zeilen = Object.keys(dz.labels).map((zk) => {
    const row = { key: zk, label: dz.labels[zk], zellen: {}, summe: 0 }
    for (const sk of spalten) {
      const v = stamm.filter((p) => p[zeileDim] === zk && p[spalteDim] === sk).reduce((n, p) => n + p.betrag, 0)
      row.zellen[sk] = +v.toFixed(2); row.summe += v
    }
    row.summe = +row.summe.toFixed(2)
    return row
  }).filter((r) => r.summe > 0)
  return { spalten: spalten.map((sk) => ({ key: sk, label: ds.labels[sk] })), zeilen }
}

/** Steuerungskennzahlen der Kostenstruktur. */
export function strukturKennzahlen(stamm = STAMM) {
  const ges = summe(stamm) || 1
  const anteil = (pred) => +(stamm.filter(pred).reduce((n, p) => n + p.betrag, 0) / ges * 100).toFixed(1)
  return {
    gesamt: +ges.toFixed(2),
    fixquote: anteil((p) => p.fixvar === 'fix'),
    variabelquote: anteil((p) => p.fixvar === 'variabel'),
    gemeinquote: anteil((p) => p.zurechnung === 'gemein'),
    einzelquote: anteil((p) => p.zurechnung === 'einzel'),
    kalkquote: anteil((p) => p.kalk)
  }
}
