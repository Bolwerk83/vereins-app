// =========================================================================
//  PRODUKTIONSCONTROLLING — strategisch UND operativ.
//  Beantwortet die wichtigen Fragen der Kolleg:innen:
//   - Wie viel sollen wir je Los optimal produzieren? (EPQ)
//   - Welche Linien/Werke sind Engpass? Wie ist die OEE?
//   - Fehlen Teile? Welche Aufträge stehen deshalb? Ab wann wieder lieferbar?
//   - Wie ist die Qualität? (First-Pass-Yield, Ausschuss, Nacharbeit, Sperrbestand)
//   - Halten wir Termine? Wie ist die Auslastung?
//  Mengen in Stück, Beträge in €, sofern nicht anders angegeben.
// =========================================================================

const r0 = (x) => Math.round(x)
const r1 = (x) => Math.round(x * 10) / 10
const r2 = (x) => Math.round(x * 100) / 100
export const HEUTE = '2026-06-22'
const tageBis = (d) => Math.round((new Date(d) - new Date(HEUTE)) / 86400000)
export const ARBEITSTAGE = 250 // Produktionstage/Jahr

// --- Werke / Produktionsstätten -------------------------------------------
export const WERKE = [
  { id: 'w-nbg', name: 'Werk Nürnberg (Hauptwerk)', ort: 'Nürnberg', schichten: 3 },
  { id: 'w-dd',  name: 'Werk Dresden (Montage)',    ort: 'Dresden',   schichten: 2 },
  { id: 'w-ext', name: 'Lohnfertigung (3PL)',        ort: 'Chemnitz',  schichten: 2 }
]

// --- Produktionslinien -----------------------------------------------------
// verf/leist/qual in % (→ OEE = Verfügbarkeit·Leistung·Qualität).
// kapazitaetTag = realistische Tageskapazität (Stück) bei vollem Schichtbetrieb.
// status: 'laeuft' | 'ruestet' | 'stoerung' | 'steht'.
export const LINIEN = [
  { id: 'l-rahmen', werkId: 'w-nbg', name: 'Rahmenfertigung',     produkt: 'Rahmen',       kapazitaetTag: 220, verf: 86, leist: 91, qual: 97, status: 'laeuft',   auftrag: 'PA-3007', stoerungGrund: '' },
  { id: 'l-ebike',  werkId: 'w-nbg', name: 'E-Bike Endmontage',   produkt: 'E-Bikes',      kapazitaetTag: 120, verf: 80, leist: 88, qual: 95, status: 'stoerung', auftrag: 'PA-3001', stoerungGrund: 'Fehlteil: Akkus 625Wh' },
  { id: 'l-akku',   werkId: 'w-nbg', name: 'Akku-Konfektion',     produkt: 'Akkus 625Wh',  kapazitaetTag: 180, verf: 90, leist: 93, qual: 98, status: 'laeuft',   auftrag: 'PA-3003', stoerungGrund: '' },
  { id: 'l-antrieb',werkId: 'w-dd',  name: 'Antriebsmontage',     produkt: 'Antriebsteile',kapazitaetTag: 320, verf: 84, leist: 90, qual: 96, status: 'ruestet',  auftrag: 'PA-3005', stoerungGrund: '' },
  { id: 'l-lacker', werkId: 'w-dd',  name: 'Lackiererei',         produkt: 'Rahmen',       kapazitaetTag: 260, verf: 78, leist: 86, qual: 92, status: 'laeuft',   auftrag: 'PA-3007', stoerungGrund: '' },
  { id: 'l-conf',   werkId: 'w-ext', name: 'Bekleidung Konfektion',produkt: 'Bekleidung',  kapazitaetTag: 400, verf: 88, leist: 89, qual: 94, status: 'steht',    auftrag: '',       stoerungGrund: 'kein Auftrag eingeplant' }
]

// --- Produktionsprogramm (für optimale Losgröße EPQ) ----------------------
// jahresbedarf (Stück), ruestkostenLos (€/Rüstung), stueckkosten (€),
// produktionsrateTag (Stück/Tag wenn Linie läuft), lagersatzPct (% p.a.).
export const PROGRAMM = [
  { id: 'ebike',      name: 'E-Bikes',       linieId: 'l-ebike',  jahresbedarf: 24000, ruestkostenLos: 900, stueckkosten: 980, produktionsrateTag: 120, lagersatzPct: 8 },
  { id: 'akku',       name: 'Akkus 625Wh',   linieId: 'l-akku',   jahresbedarf: 31000, ruestkostenLos: 420, stueckkosten: 210, produktionsrateTag: 180, lagersatzPct: 8 },
  { id: 'rahmen',     name: 'Rahmen',        linieId: 'l-rahmen', jahresbedarf: 26000, ruestkostenLos: 650, stueckkosten: 140, produktionsrateTag: 220, lagersatzPct: 8 },
  { id: 'antrieb',    name: 'Antriebsteile', linieId: 'l-antrieb',jahresbedarf: 60000, ruestkostenLos: 300, stueckkosten: 75,  produktionsrateTag: 320, lagersatzPct: 8 },
  { id: 'bekleidung', name: 'Bekleidung',    linieId: 'l-conf',   jahresbedarf: 40000, ruestkostenLos: 220, stueckkosten: 35,  produktionsrateTag: 400, lagersatzPct: 8 }
]

// --- Material / Stückliste → Fehlteile -------------------------------------
// Je kritischem Teil: Bestand, reservierter Bedarf der nächsten Aufträge,
// Wiederbeschaffung (lieferAb), betroffene Produktionsaufträge.
export const TEILE = [
  { id: 't-akku',   name: 'Akkus 625Wh',       bestand: 140,  bedarf: 520,  lieferAb: '2026-06-26', lieferant: 'DemoPower Cells',     auftraege: ['PA-3001', 'PA-3002'] },
  { id: 't-motor',  name: 'Mittelmotor 90Nm',  bestand: 60,   bedarf: 240,  lieferAb: '2026-06-24', lieferant: 'Antrieb & Teile GmbH',auftraege: ['PA-3001'] },
  { id: 't-rahmen', name: 'Rahmen-Rohling XL',  bestand: 800,  bedarf: 600,  lieferAb: '2026-06-20', lieferant: 'DemoBike Mfg.',       auftraege: ['PA-3007'] },
  { id: 't-display',name: 'Display-Einheit',    bestand: 0,    bedarf: 180,  lieferAb: '2026-07-01', lieferant: 'DemoPower Cells',     auftraege: ['PA-3001', 'PA-3003'] },
  { id: 't-schalt', name: 'Schaltwerk 12-fach', bestand: 1200, bedarf: 900,  lieferAb: '2026-06-19', lieferant: 'Antrieb & Teile GmbH',auftraege: ['PA-3005'] }
]

// --- Produktionsaufträge (operativ) ---------------------------------------
export const AUFTRAEGE = [
  { id: 'PA-3001', produkt: 'E-Bikes',       linieId: 'l-ebike',  menge: 180, ende: '2026-06-24', fortschritt: 35, status: 'blockiert' },
  { id: 'PA-3002', produkt: 'E-Bikes',       linieId: 'l-ebike',  menge: 220, ende: '2026-06-30', fortschritt: 0,  status: 'wartet' },
  { id: 'PA-3003', produkt: 'Akkus 625Wh',   linieId: 'l-akku',   menge: 300, ende: '2026-06-23', fortschritt: 70, status: 'laeuft' },
  { id: 'PA-3005', produkt: 'Antriebsteile', linieId: 'l-antrieb',menge: 640, ende: '2026-06-25', fortschritt: 10, status: 'ruestet' },
  { id: 'PA-3007', produkt: 'Rahmen',        linieId: 'l-rahmen', menge: 440, ende: '2026-06-21', fortschritt: 80, status: 'laeuft' }
]

// --- Qualität je Linie -----------------------------------------------------
// fpy = First-Pass-Yield %, nacharbeitPct, ausschussPct, sperrbestand (Stück).
export const QUALITAET = [
  { linieId: 'l-rahmen',  fpy: 95.2, nacharbeitPct: 3.1, ausschussPct: 1.7, sperrbestand: 120, hauptgrund: 'Schweißnaht' },
  { linieId: 'l-ebike',   fpy: 91.0, nacharbeitPct: 5.4, ausschussPct: 3.6, sperrbestand: 64,  hauptgrund: 'Verkabelung' },
  { linieId: 'l-akku',    fpy: 97.8, nacharbeitPct: 1.4, ausschussPct: 0.8, sperrbestand: 18,  hauptgrund: 'Zelltest' },
  { linieId: 'l-antrieb', fpy: 94.1, nacharbeitPct: 3.8, ausschussPct: 2.1, sperrbestand: 210, hauptgrund: 'Drehmoment' },
  { linieId: 'l-lacker',  fpy: 89.5, nacharbeitPct: 6.9, ausschussPct: 3.6, sperrbestand: 95,  hauptgrund: 'Lacklaeufer' },
  { linieId: 'l-conf',    fpy: 93.0, nacharbeitPct: 4.2, ausschussPct: 2.8, sperrbestand: 30,  hauptgrund: 'Naht' }
]

export const STATUS_LABEL = {
  laeuft: { label: 'läuft', farbe: 'var(--amp-g)' },
  ruestet: { label: 'rüstet', farbe: 'var(--amp-a)' },
  stoerung: { label: 'Störung', farbe: 'var(--amp-r)' },
  steht: { label: 'steht', farbe: 'var(--muted)' }
}

/** OEE einer Linie = Verfügbarkeit · Leistung · Qualität (jeweils %). */
export function oee(linie) {
  const wert = r1(linie.verf * linie.leist * linie.qual / 10000)
  return { verf: linie.verf, leist: linie.leist, qual: linie.qual, oee: wert }
}

/** Economic Production Quantity (Losgröße bei eigener Fertigung).
 *  EPQ = √(2·D·S / (H·(1 − d/p))), H = stueckkosten·lagersatz. */
export function epq({ jahresbedarf: D, ruestkostenLos: S, stueckkosten, lagersatzPct, produktionsrateTag: p }) {
  const d = D / ARBEITSTAGE // Tagesbedarf
  const H = stueckkosten * lagersatzPct / 100
  const faktor = 1 - (p > 0 ? d / p : 0)
  if (H <= 0 || faktor <= 0) return 0
  return Math.sqrt((2 * D * S) / (H * faktor))
}

/** Produktionsprogramm: optimale Losgröße, Lose/Jahr, Kosten, Kapazitätsbedarf. */
export function programm(items = PROGRAMM) {
  const rows = items.map((p) => {
    const losMenge = r0(epq(p))
    const loseProJahr = losMenge ? r1(p.jahresbedarf / losMenge) : 0
    const ruestkostenJahr = r0(loseProJahr * p.ruestkostenLos)
    const H = p.stueckkosten * p.lagersatzPct / 100
    const lagerkostenJahr = r0(losMenge / 2 * H)
    const kapTageBedarf = r0(p.jahresbedarf / p.produktionsrateTag)        // benötigte Produktionstage
    const auslastungPct = r1(p.jahresbedarf / (p.produktionsrateTag * ARBEITSTAGE) * 100)
    return {
      ...p, losMenge, loseProJahr, ruestkostenJahr, lagerkostenJahr,
      gesamtkostenJahr: ruestkostenJahr + lagerkostenJahr,
      kapTageBedarf, auslastungPct, engpass: auslastungPct > 85
    }
  })
  return {
    rows,
    gesamtkosten: r0(rows.reduce((n, r) => n + r.gesamtkostenJahr, 0)),
    engpaesse: rows.filter((r) => r.engpass).length
  }
}

/** Fehlteile: welche Teile fehlen, wie stark, ab wann lieferbar, welche Aufträge stehen. */
export function fehlteile(teile = TEILE) {
  const rows = teile.map((t) => {
    const fehlmenge = Math.max(0, t.bedarf - t.bestand)
    const deckung = t.bedarf ? r1(t.bestand / t.bedarf * 100) : 100
    const tage = tageBis(t.lieferAb)
    const schwere = fehlmenge <= 0 ? 'ok' : (t.bestand === 0 ? 'kritisch' : deckung < 50 ? 'kritisch' : 'warnung')
    return { ...t, fehlmenge, deckung, lieferInTagen: tage, schwere }
  })
  const offen = rows.filter((r) => r.fehlmenge > 0)
  const betroffeneAuftraege = [...new Set(offen.flatMap((r) => r.auftraege))]
  return {
    rows: rows.sort((a, b) => (b.fehlmenge - a.fehlmenge)),
    fehlteileN: offen.length,
    betroffeneAuftraege,
    kritisch: rows.filter((r) => r.schwere === 'kritisch').length
  }
}

/** Linien-Auswertung mit OEE, Auslastung, Status, Engpass-Markierung. */
export function linienAuswertung(linien = LINIEN, prog = programm().rows) {
  const last = Object.fromEntries(prog.map((p) => [p.linieId, p.auslastungPct]))
  const qmap = Object.fromEntries(QUALITAET.map((q) => [q.linieId, q]))
  const rows = linien.map((l) => {
    const o = oee(l)
    return {
      ...l, ...o, auslastungPct: last[l.id] ?? 0, werk: WERKE.find((w) => w.id === l.werkId)?.name,
      fpy: qmap[l.id]?.fpy ?? null, weltklasse: o.oee >= 85
    }
  })
  const maxLast = Math.max(0, ...rows.map((r) => r.auslastungPct))
  return rows.map((r) => ({ ...r, engpass: r.auslastungPct === maxLast && maxLast > 0 }))
}

/** Werke-Auswertung: Anzahl Linien, Ø OEE, Ø Auslastung, Störungen. */
export function werkeAuswertung() {
  const lin = linienAuswertung()
  return WERKE.map((w) => {
    const ls = lin.filter((l) => l.werkId === w.id)
    const m = (sel) => (ls.length ? r1(ls.reduce((n, l) => n + sel(l), 0) / ls.length) : 0)
    return {
      ...w, linienN: ls.length, oee: m((l) => l.oee), auslastung: m((l) => l.auslastungPct),
      stoerungen: ls.filter((l) => l.status === 'stoerung').length,
      laufend: ls.filter((l) => l.status === 'laeuft').length
    }
  })
}

/** Qualitäts-Auswertung gesamt + je Linie (FPY, Ausschuss, Nacharbeit, Sperrbestand). */
export function qualitaetAuswertung() {
  const rows = QUALITAET.map((q) => ({ ...q, linie: LINIEN.find((l) => l.id === q.linieId)?.name }))
  const avg = (sel) => r1(rows.reduce((n, r) => n + sel(r), 0) / rows.length)
  return {
    rows: rows.sort((a, b) => a.fpy - b.fpy),
    fpy: avg((r) => r.fpy), nacharbeitPct: avg((r) => r.nacharbeitPct), ausschussPct: avg((r) => r.ausschussPct),
    sperrbestand: rows.reduce((n, r) => n + r.sperrbestand, 0),
    schlechteste: rows[0]
  }
}

/** Termintreue der offenen Produktionsaufträge (überfällig = Ende < heute). */
export function termintreue(auftraege = AUFTRAEGE) {
  const rows = auftraege.map((a) => ({ ...a, tageBisEnde: tageBis(a.ende), ueberfaellig: tageBis(a.ende) < 0 && a.fortschritt < 100 }))
  const ueberfaellig = rows.filter((r) => r.ueberfaellig).length
  return { rows, ueberfaellig, termintreuePct: rows.length ? r1((rows.length - ueberfaellig) / rows.length * 100) : 100 }
}

// --- Output-Historie + Markt (Lager / offener Auftragsbestand) ------------
export const MONATE = ['Jan', 'Feb', 'Mär', 'Apr', 'Mai', 'Jun']
// Produzierte Menge (Stück) je Produkt über die letzten 6 Monate.
export const OUTPUT_HISTORIE = {
  ebike:      [1800, 1950, 2100, 1850, 2000, 2050],
  akku:       [2400, 2550, 2600, 2500, 2580, 2620],
  rahmen:     [2000, 2100, 2050, 2150, 2200, 2100],
  antrieb:    [4600, 4800, 5000, 4900, 5100, 5050],
  bekleidung: [3000, 3200, 3100, 3300, 3400, 3350]
}
// Lagerbestand (Stück) und offener Auftragsbestand (Stück) je Produkt.
// Werte für E-Bikes/Akkus/Bekleidung sind mit der Lagerverwaltung abgestimmt.
export const MARKT = {
  ebike:      { lager: 980,  auftragsbestand: 1850 },
  akku:       { lager: 900,  auftragsbestand: 700 },
  rahmen:     { lager: 1200, auftragsbestand: 600 },
  antrieb:    { lager: 1300, auftragsbestand: 2400 },
  bekleidung: { lager: 8200, auftragsbestand: 300 }
}
export const BALANCE_STATUS = {
  aufstocken:    { label: 'Aufstocken', farbe: 'var(--amp-r)' },
  drosseln:      { label: 'Drosseln',   farbe: 'var(--amp-a)' },
  ausgeglichen:  { label: 'im Gleichgewicht', farbe: 'var(--amp-g)' }
}

/** Output je Produkt über die letzten `monate` (Reihe, Summe, Schnitt). */
export function outputUebersicht(monate = 6) {
  const rows = PROGRAMM.map((p) => {
    const reihe = (OUTPUT_HISTORIE[p.id] || []).slice(-monate)
    const summe = reihe.reduce((a, b) => a + b, 0)
    return { id: p.id, name: p.name, linieId: p.linieId, reihe, summe, schnitt: reihe.length ? r0(summe / reihe.length) : 0 }
  })
  return { rows, gesamt: rows.reduce((n, r) => n + r.summe, 0), monate }
}

/** Abgleich Produktion ↔ Lagerbestand ↔ offener Auftragsbestand + Empfehlung. */
export function balance(items = PROGRAMM) {
  return items.map((p) => {
    const reihe = OUTPUT_HISTORIE[p.id] || []
    const monatsOutput = reihe.length ? r0(reihe.slice(-3).reduce((a, b) => a + b, 0) / Math.min(3, reihe.length)) : 0
    const m = MARKT[p.id] || { lager: 0, auftragsbestand: 0 }
    const reichweiteMon = monatsOutput ? r1(m.lager / monatsOutput) : 0
    const deckung = m.auftragsbestand ? r1((m.lager + monatsOutput) / m.auftragsbestand * 100) : 999
    let status = 'ausgeglichen'
    let text = 'Lager, Output und Auftragsbestand im Gleichgewicht.'
    if (m.auftragsbestand > m.lager + monatsOutput) {
      status = 'aufstocken'
      text = `Auftragsbestand ${n0s(m.auftragsbestand)} > Lager ${n0s(m.lager)} + Monatsoutput ${n0s(monatsOutput)} — Kapazität hochfahren oder Lose vorziehen, sonst Lieferverzug.`
    } else if (m.lager > 2 * monatsOutput && m.auftragsbestand < 0.5 * monatsOutput) {
      status = 'drosseln'
      text = `Hoher Lagerbestand (${reichweiteMon} Monate Reichweite) bei geringem Auftragsbestand — Produktion drosseln, gebundenes Kapital freisetzen.`
    }
    return { id: p.id, name: p.name, linieId: p.linieId, monatsOutput, lager: m.lager, auftragsbestand: m.auftragsbestand, reichweiteMon, deckung, status, text }
  })
}
const n0s = (v) => Math.round(v).toLocaleString('de-DE')

/** Top-Kennzahlen fürs Produktions-Cockpit. */
export function kennzahlen() {
  const lin = linienAuswertung()
  const q = qualitaetAuswertung()
  const ft = fehlteile()
  const tt = termintreue()
  const prog = programm()
  const oeeAvg = r1(lin.reduce((n, l) => n + l.oee, 0) / lin.length)
  const auslastung = r1(lin.reduce((n, l) => n + l.auslastungPct, 0) / lin.length)
  return {
    oee: oeeAvg, fpy: q.fpy, ausschussPct: q.ausschussPct, sperrbestand: q.sperrbestand,
    auslastung, fehlteile: ft.fehlteileN, blockierteAuftraege: ft.betroffeneAuftraege.length,
    termintreue: tt.termintreuePct, ueberfaellig: tt.ueberfaellig,
    linienN: LINIEN.length, werkeN: WERKE.length, engpaesse: prog.engpaesse,
    stoerungen: lin.filter((l) => l.status === 'stoerung').length
  }
}
