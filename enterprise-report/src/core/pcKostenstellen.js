// =========================================================================
//  PROFIT-CENTER → EINZELKOSTENSTELLEN
//
//  Bricht jedes Profit-Center bis auf die Einzelkostenstelle herunter (die
//  Ebene gab es bisher nicht) und erlaubt das MANUELLE VERSCHIEBEN einzelner
//  Kostenstellen in ein anderes Profit-Center. Die Zuordnung wird persistent
//  überschrieben; PC-Ergebnisse werden live neu aggregiert.
//
//  Beträge in T€ p. a. PC-Ergebnis = Σ Erlöse − Σ Kosten der zugeordneten
//  Kostenstellen.
// =========================================================================
const KEY = 'er_pc_zuordnung'

export const PROFITCENTER = [
  { id: 'pc-bike',    name: 'PC Fahrräder (Großhandel)', farbe: '#2563eb' },
  { id: 'pc-tbz',     name: 'PC Teile & Zubehör',        farbe: '#10b981' },
  { id: 'pc-ecom',    name: 'PC E-Commerce',             farbe: '#7c3aed' },
  { id: 'pc-store',   name: 'PC Stationär (Filialen)',   farbe: '#f59e0b' },
  { id: 'pc-zentral', name: 'PC Zentrale / Overhead',    farbe: '#64748b' }
]
export const pcInfo = (id) => PROFITCENTER.find((p) => p.id === id)

// Einzelkostenstellen mit Standard-Zuordnung (defaultPc).
const KOSTENSTELLEN = [
  // Fahrräder
  { id: 'ks-we-bike', name: 'Wareneinsatz Fahrräder', gruppe: 'Material', erloes: 0, kosten: 62000, defaultPc: 'pc-bike' },
  { id: 'ks-rahmen',  name: 'Rahmen-/Montagefertigung', gruppe: 'Produktion', erloes: 0, kosten: 14600, defaultPc: 'pc-bike' },
  { id: 'ks-lager-bike', name: 'Lager Fahrräder', gruppe: 'Logistik', erloes: 0, kosten: 2100, defaultPc: 'pc-bike' },
  { id: 'ks-vb-bike', name: 'Vertrieb B2B Fahrräder', gruppe: 'Vertrieb', erloes: 92000, kosten: 3800, defaultPc: 'pc-bike' },
  // Teile & Zubehör
  { id: 'ks-we-tbz', name: 'Wareneinsatz Teile', gruppe: 'Material', erloes: 0, kosten: 18000, defaultPc: 'pc-tbz' },
  { id: 'ks-lager-tbz', name: 'Lager Teile', gruppe: 'Logistik', erloes: 0, kosten: 1500, defaultPc: 'pc-tbz' },
  { id: 'ks-vb-tbz', name: 'Vertrieb Teile', gruppe: 'Vertrieb', erloes: 30000, kosten: 2200, defaultPc: 'pc-tbz' },
  // E-Commerce
  { id: 'ks-we-ecom', name: 'Wareneinsatz Online', gruppe: 'Material', erloes: 0, kosten: 38000, defaultPc: 'pc-ecom' },
  { id: 'ks-shop', name: 'Onlineshop-Betrieb', gruppe: 'IT/Betrieb', erloes: 58000, kosten: 4200, defaultPc: 'pc-ecom' },
  { id: 'ks-perfmkt', name: 'Performance Marketing', gruppe: 'Marketing', erloes: 0, kosten: 5200, defaultPc: 'pc-ecom' },
  { id: 'ks-fulfill', name: 'Fulfillment & Versand', gruppe: 'Logistik', erloes: 0, kosten: 6100, defaultPc: 'pc-ecom' },
  // Stationär
  { id: 'ks-we-store', name: 'Wareneinsatz Filialen', gruppe: 'Material', erloes: 0, kosten: 22000, defaultPc: 'pc-store' },
  { id: 'ks-fil-muc', name: 'Filiale München', gruppe: 'Filiale', erloes: 14000, kosten: 3900, defaultPc: 'pc-store' },
  { id: 'ks-fil-ham', name: 'Filiale Hamburg', gruppe: 'Filiale', erloes: 11000, kosten: 3300, defaultPc: 'pc-store' },
  { id: 'ks-fil-koe', name: 'Filiale Köln', gruppe: 'Filiale', erloes: 9000, kosten: 3000, defaultPc: 'pc-store' },
  // Zentrale / Overhead
  { id: 'ks-gf', name: 'Geschäftsführung', gruppe: 'Verwaltung', erloes: 0, kosten: 2400, defaultPc: 'pc-zentral' },
  { id: 'ks-it', name: 'IT / Infrastruktur', gruppe: 'Verwaltung', erloes: 0, kosten: 3100, defaultPc: 'pc-zentral' },
  { id: 'ks-fibu', name: 'Finanzbuchhaltung', gruppe: 'Verwaltung', erloes: 0, kosten: 1600, defaultPc: 'pc-zentral' },
  { id: 'ks-hr', name: 'Personal / HR', gruppe: 'Verwaltung', erloes: 0, kosten: 1800, defaultPc: 'pc-zentral' }
]
const DEFAULT = Object.fromEntries(KOSTENSTELLEN.map((k) => [k.id, k.defaultPc]))

export function ladeZuordnung() {
  try { return JSON.parse(localStorage.getItem(KEY) || '{}') } catch { return {} }
}
function speichere(z) { localStorage.setItem(KEY, JSON.stringify(z)); return z }

/** Aktuelles Profit-Center einer Kostenstelle (Override oder Default). */
export function pcVon(ksId) { return ladeZuordnung()[ksId] || DEFAULT[ksId] }
export function istVerschoben(ksId) { const z = ladeZuordnung(); return !!z[ksId] && z[ksId] !== DEFAULT[ksId] }

/** Kostenstelle in ein anderes Profit-Center verschieben (persistent). */
export function verschiebe(ksId, pcId) {
  const z = ladeZuordnung()
  if (pcId === DEFAULT[ksId]) delete z[ksId]   // zurück auf Default = kein Override
  else z[ksId] = pcId
  return speichere(z)
}
/** Alle manuellen Verschiebungen zurücksetzen. */
export function setzeZurueck() { localStorage.removeItem(KEY); return {} }
export function anzahlVerschoben() { const z = ladeZuordnung(); return Object.keys(z).filter((k) => z[k] !== DEFAULT[k]).length }

/** Alle Kostenstellen mit aktueller Zuordnung & Ergebnis. */
export function kostenstellen() {
  const z = ladeZuordnung()
  return KOSTENSTELLEN.map((k) => ({ ...k, pc: z[k.id] || k.defaultPc, ergebnis: k.erloes - k.kosten, verschoben: !!z[k.id] && z[k.id] !== k.defaultPc }))
}

/** Profit-Center mit zugeordneten Kostenstellen und Aggregaten. */
export function pcMitKostenstellen() {
  const ks = kostenstellen()
  return PROFITCENTER.map((pc) => {
    const eigene = ks.filter((k) => k.pc === pc.id)
    const erloes = eigene.reduce((n, k) => n + k.erloes, 0)
    const kosten = eigene.reduce((n, k) => n + k.kosten, 0)
    return { ...pc, kostenstellen: eigene, erloes, kosten, ergebnis: erloes - kosten, anzahl: eigene.length }
  })
}

export function gesamt() {
  const ks = kostenstellen()
  const erloes = ks.reduce((n, k) => n + k.erloes, 0)
  const kosten = ks.reduce((n, k) => n + k.kosten, 0)
  return { erloes, kosten, ergebnis: erloes - kosten, anzahl: ks.length }
}
