// =========================================================================
//  ANLAGEN-/ASSET-LEBENSZYKLUS — Beschaffung → Nutzung → Instandhaltung →
//  Ersatz. Restnutzungsdauer, Restbuchwert, Wiederbeschaffungswert und die
//  kalkulatorische Abschreibung (Brücke zur Kalkulatorik).
// =========================================================================

export const PHASEN = [
  { id: 'beschaffung',    name: 'Beschaffung/Neu', farbe: '#7c3aed', laie: 'Gerade angeschafft, volle Restnutzung.' },
  { id: 'nutzung',        name: 'Nutzung',         farbe: '#10b981', laie: 'Im produktiven Einsatz, geringe Wartung.' },
  { id: 'instandhaltung', name: 'Instandhaltung',  farbe: '#f59e0b', laie: 'Älter, wartungsintensiv — Ersatz vorbereiten.' },
  { id: 'ersatz',         name: 'Ersatz fällig',   farbe: '#ef4444', laie: 'Nutzungsdauer (fast) erreicht — ersetzen.' }
]
export const phaseInfo = (id) => PHASEN.find((p) => p.id === id)

export function phaseVon(alter, nd) {
  const rest = nd - alter
  if (alter <= 1) return 'beschaffung'
  if (rest <= 1 || alter >= nd) return 'ersatz'
  if (alter >= 0.6 * nd) return 'instandhaltung'
  return 'nutzung'
}

// Anlagen (Mio €): Anschaffung, Nutzungsdauer (Jahre), Alter (Jahre),
// wbwFaktor (Wiederbeschaffung), instand (Instandhaltung €/Jahr, Mio).
export const ANLAGEN = [
  { id: 'lackier',  name: 'Lackieranlage',        anschaffung: 2.0, nd: 10, alter: 7, wbwFaktor: 1.20, instand: 0.08 },
  { id: 'montage',  name: 'Montagelinie E-Bike',  anschaffung: 1.6, nd: 8,  alter: 3, wbwFaktor: 1.15, instand: 0.05 },
  { id: 'lager',    name: 'Lagerautomatik',       anschaffung: 0.9, nd: 12, alter: 11, wbwFaktor: 1.25, instand: 0.06 },
  { id: 'fuhrpark', name: 'Fuhrpark/Flotte',      anschaffung: 0.6, nd: 6,  alter: 6, wbwFaktor: 1.10, instand: 0.04 },
  { id: 'cnc',      name: 'CNC-Fräse',            anschaffung: 0.8, nd: 9,  alter: 1, wbwFaktor: 1.20, instand: 0.03 }
]

const r2 = (x) => Math.round(x * 100) / 100

export function auswertung(anlagen = ANLAGEN) {
  const rows = anlagen.map((a) => {
    const rest = Math.max(0, a.nd - a.alter)
    const bilanzAbschr = r2(a.anschaffung / a.nd)
    const wbw = r2(a.anschaffung * a.wbwFaktor)
    const kalkAbschr = r2(wbw / a.nd)
    const restbuchwert = r2(Math.max(0, a.anschaffung * (1 - a.alter / a.nd)))
    return { ...a, rest, bilanzAbschr, wbw, kalkAbschr, restbuchwert, phase: phaseVon(a.alter, a.nd) }
  })
  return {
    rows,
    summeKalkAbschr: r2(rows.reduce((n, r) => n + r.kalkAbschr, 0)),
    summeBilanzAbschr: r2(rows.reduce((n, r) => n + r.bilanzAbschr, 0)),
    summeInstand: r2(rows.reduce((n, r) => n + r.instand, 0)),
    ersatzFaellig: rows.filter((r) => r.phase === 'ersatz').length
  }
}
