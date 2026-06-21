// =========================================================================
//  LIEFERANTEN-LEBENSZYKLUS — Spiegel zum Kunden-Zyklus für den Einkauf:
//    Qualifizierung → Aufbau → Stammlieferant → Risiko → Auslauf
//  Phase aus Beziehungsalter, Volumenwachstum, Liefertreue und Risiko.
// =========================================================================

export const PHASEN = [
  { id: 'qualifizierung', name: 'Qualifizierung', farbe: '#7c3aed', laie: 'Neu, wird geprüft (Audit/Probelieferungen).', empfehlung: 'Audit & Probelieferungen' },
  { id: 'aufbau',         name: 'Aufbau',         farbe: '#2563eb', laie: 'Volumen wächst, Konditionen festigen.', empfehlung: 'Volumen ausbauen, Konditionen sichern' },
  { id: 'stamm',          name: 'Stammlieferant', farbe: '#10b981', laie: 'Stabil und zuverlässig.', empfehlung: 'Pflegen, Rahmenvertrag' },
  { id: 'risiko',         name: 'Risiko',         farbe: '#f59e0b', laie: 'Liefertreue/Qualität schwach oder Klumpenrisiko.', empfehlung: 'Zweitquelle aufbauen, Klumpen reduzieren' },
  { id: 'phaseout',       name: 'Auslauf',        farbe: '#ef4444', laie: 'Volumen bricht weg — ersetzen/auslaufen.', empfehlung: 'Auslaufen / ersetzen' }
]
export const phaseInfo = (id) => PHASEN.find((p) => p.id === id)

export function phaseVon({ alterMonate = 99, volumenWachstum = 0, liefertreue = 100, risiko = 'niedrig' }) {
  if (alterMonate <= 6) return 'qualifizierung'
  if (liefertreue < 85 || risiko === 'hoch') return 'risiko'
  if (volumenWachstum <= -30) return 'phaseout'
  if (volumenWachstum >= 15) return 'aufbau'
  return 'stamm'
}

// Volumen in Mio €, Liefertreue/Qualität in %, Wachstum % YoY.
const ROH = [
  { id: 'antrieb', name: 'Antrieb & Schaltung AG', volumen: 9.8, liefertreue: 91, qualitaet: 96, risiko: 'hoch',    alterMonate: 60, volumenWachstum: 6 },
  { id: 'rahmen',  name: 'RahmenStahl GmbH',       volumen: 6.4, liefertreue: 94, qualitaet: 98, risiko: 'mittel',  alterMonate: 48, volumenWachstum: 4 },
  { id: 'handel',  name: 'Handelsware Süd',        volumen: 7.2, liefertreue: 96, qualitaet: 95, risiko: 'niedrig', alterMonate: 40, volumenWachstum: 18 },
  { id: 'zubehoer', name: 'Zubehör Import',        volumen: 4.8, liefertreue: 89, qualitaet: 91, risiko: 'mittel',  alterMonate: 30, volumenWachstum: -5 },
  { id: 'akku',    name: 'Akku-Zellen Asia',       volumen: 2.1, liefertreue: 88, qualitaet: 90, risiko: 'mittel',  alterMonate: 4,  volumenWachstum: 30 },
  { id: 'alt',     name: 'Alt-Lieferant Y',        volumen: 0.5, liefertreue: 87, qualitaet: 88, risiko: 'niedrig', alterMonate: 70, volumenWachstum: -35 }
]

export function lieferanten() { return ROH.map((o) => ({ ...o, phase: phaseVon(o) })) }

export function phaseVerteilung() {
  const d = lieferanten(); const ges = d.reduce((n, x) => n + x.volumen, 0) || 1
  return PHASEN.map((p) => {
    const grp = d.filter((x) => x.phase === p.id)
    const volumen = +grp.reduce((n, x) => n + x.volumen, 0).toFixed(1)
    return { ...p, anzahl: grp.length, volumen, anteil: +(volumen / ges * 100).toFixed(1) }
  })
}
