// =========================================================================
//  GUTSCHRIFTEN- & RETOUREN-COCKPIT (je Kunde)
//  Bündelt ALLE Gutschriften/Retouren je Kunde — auch wenn sie aus mehreren
//  Versendungen/Belegen stammen (heute nicht verknüpft). Frage: „sind wir beim
//  Kunden sauber?".
//  Unterschieden:
//   - Retourengutschrift  → mit Absatzänderung (Ware kommt zurück).
//   - Wertgutschrift       → OHNE Absatzänderung (Preisnachlass/Kulanz).
//  Bezug: tatsächlicher Auftrag (AET) je Kunde → Quoten in EUR und %.
// =========================================================================

const r0 = (x) => Math.round(x)
const r1 = (x) => Math.round(x * 10) / 10

export const RETOURE_SCHWELLE = 55 // Retourengutschriftquote ab hier auffällig (%)

// Tatsächlicher Auftrag (AET) je Kunde in EUR (Bezugsgröße für die Quoten).
export const KUNDEN = [
  { id: 'k-stadtwerke', name: 'Muster Stadtwerke', aet: 320000 },
  { id: 'k-hotel',      name: 'Hotel Beispielsee',  aet: 88000 },
  { id: 'k-b2b',        name: 'Demo B2B Handel',     aet: 145000 },
  { id: 'k-logistik',   name: 'Demo Logistik AG',    aet: 264000 },
  { id: 'k-reha',       name: 'Muster Reha-Zentrum', aet: 41000 }
]

// Einzelne Gutschrift-/Retouren-Belege (aus mehreren Versendungen). typ:
// 'retoure' (mit Absatzänderung) | 'wert' (ohne Absatzänderung).
export const BELEGE = [
  { beleg: 'GS-7001', kunde: 'k-stadtwerke', typ: 'retoure', wert: 4200, datum: '2026-03-12', auftrag: 'AUF-1004', grund: 'Falschlieferung', menge: 6 },
  { beleg: 'GS-7002', kunde: 'k-stadtwerke', typ: 'wert',    wert: 3100, datum: '2026-04-02', auftrag: 'AUF-1004', grund: 'Preisnachlass Kulanz', menge: 0 },
  { beleg: 'GS-7003', kunde: 'k-hotel',      typ: 'retoure', wert: 51000, datum: '2026-02-20', auftrag: 'AUF-1006', grund: 'Defekt Charge', menge: 34 },
  { beleg: 'GS-7004', kunde: 'k-hotel',      typ: 'wert',    wert: 2400, datum: '2026-05-09', auftrag: 'AUF-1006', grund: 'Skonto-Korrektur', menge: 0 },
  { beleg: 'GS-7005', kunde: 'k-b2b',        typ: 'retoure', wert: 12000, datum: '2026-01-18', auftrag: 'AUF-1010', grund: 'Nichtgefallen', menge: 40 },
  { beleg: 'GS-7006', kunde: 'k-b2b',        typ: 'wert',    wert: 18500, datum: '2026-03-30', auftrag: 'AUF-1010', grund: 'Mengenrabatt nachträglich', menge: 0 },
  { beleg: 'GS-7007', kunde: 'k-b2b',        typ: 'wert',    wert: 6400, datum: '2026-05-22', auftrag: 'AUF-1011', grund: 'Werbekostenzuschuss', menge: 0 },
  { beleg: 'GS-7008', kunde: 'k-logistik',   typ: 'retoure', wert: 9800, datum: '2026-04-14', auftrag: 'AUF-1020', grund: 'Transportschaden', menge: 12 },
  { beleg: 'GS-7009', kunde: 'k-reha',       typ: 'wert',    wert: 900,  datum: '2026-06-01', auftrag: 'AUF-1008', grund: 'Gutschein eingelöst', menge: 0 }
]

/** Alle Belege eines Kunden (verknüpft über mehrere Versendungen hinweg). */
export function belegeVon(kundeId) {
  return BELEGE.filter((b) => b.kunde === kundeId).sort((a, b) => a.datum.localeCompare(b.datum))
}

/** Kundenübersicht: Retouren- vs. Wertgutschriften in EUR und % zum AET. */
export function kundenUebersicht() {
  const rows = KUNDEN.map((k) => {
    const belege = belegeVon(k.id)
    const retoureGut = belege.filter((b) => b.typ === 'retoure').reduce((n, b) => n + b.wert, 0)
    const wertGut = belege.filter((b) => b.typ === 'wert').reduce((n, b) => n + b.wert, 0)
    const gesamtGut = retoureGut + wertGut
    const retoureQuote = k.aet ? r1(retoureGut / k.aet * 100) : 0
    const wertQuote = k.aet ? r1(wertGut / k.aet * 100) : 0          // Wertgutschriften zum tatsächlichen Auftrag
    const gesamtQuote = k.aet ? r1(gesamtGut / k.aet * 100) : 0
    // „Sauber?" — Retourengutschriftquote über der Schwelle ist auffällig.
    const auffaellig = retoureQuote > RETOURE_SCHWELLE
    return {
      id: k.id, name: k.name, aet: k.aet, belegeN: belege.length,
      retoureGut, wertGut, gesamtGut, retoureQuote, wertQuote, gesamtQuote, auffaellig,
      status: auffaellig ? 'auffaellig' : gesamtQuote > 20 ? 'beobachten' : 'sauber'
    }
  })
  return rows.sort((a, b) => b.gesamtQuote - a.gesamtQuote)
}

/** Gesamt-Kennzahlen über alle Kunden. */
export function gesamt() {
  const rows = kundenUebersicht()
  const aet = rows.reduce((n, r) => n + r.aet, 0)
  const retoureGut = rows.reduce((n, r) => n + r.retoureGut, 0)
  const wertGut = rows.reduce((n, r) => n + r.wertGut, 0)
  const gesamtGut = retoureGut + wertGut
  return {
    aet, retoureGut, wertGut, gesamtGut,
    retoureQuote: aet ? r1(retoureGut / aet * 100) : 0,
    wertQuote: aet ? r1(wertGut / aet * 100) : 0,
    gesamtQuote: aet ? r1(gesamtGut / aet * 100) : 0,
    auffaellige: rows.filter((r) => r.auffaellig).length
  }
}
