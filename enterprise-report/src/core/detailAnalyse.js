// =========================================================================
//  DETAILANALYSE — operative Granularansicht für Erfasser:innen.
//  Daten: tägliche Artikelbewegungen (Mini-Zeitreihen), Änderungslog,
//  statistische Anomalien, Erfassungsqualität je Person, Pivot-Kreuztabelle.
// =========================================================================

const ARTIKEL_SEED = [
  { id: 'A001', name: 'Trek Marlin 6 (28")',      kat: 'MTB',      preis: 899,  minBst: 50,  erf: 'Müller K.' },
  { id: 'A002', name: 'Canyon Endurace CF 7',     kat: 'Rennrad',  preis: 1299, minBst: 30,  erf: 'Schmidt A.' },
  { id: 'A003', name: 'Cube Stereo 120',           kat: 'MTB',      preis: 1649, minBst: 20,  erf: 'Bauer M.' },
  { id: 'A004', name: 'Specialized Turbo Como 3',  kat: 'E-Bike',   preis: 3299, minBst: 15,  erf: 'Wagner T.' },
  { id: 'A005', name: 'Ghost Hybride Trekking',    kat: 'E-Bike',   preis: 2199, minBst: 25,  erf: 'Fischer S.' },
  { id: 'A006', name: 'Scott Sub Cross 30',        kat: 'Trekking', preis: 749,  minBst: 40,  erf: 'Müller K.' },
  { id: 'A007', name: 'Shimano Deore XT Gruppe',   kat: 'Teile',    preis: 349,  minBst: 100, erf: 'Schmidt A.' },
  { id: 'A008', name: 'Schwalbe Marathon Plus',    kat: 'Zubehör',  preis: 39,   minBst: 200, erf: 'Bauer M.' },
  { id: 'A009', name: 'Bosch Performance CX 85',   kat: 'E-Bike',   preis: 4299, minBst: 10,  erf: 'Wagner T.' },
  { id: 'A010', name: 'Ortlieb Back-Roller',       kat: 'Zubehör',  preis: 99,   minBst: 80,  erf: 'Fischer S.' },
  { id: 'A011', name: 'Cube Analog (26")',          kat: 'City',     preis: 499,  minBst: 60,  erf: 'Müller K.' },
  { id: 'A012', name: 'Stevens Roubaix (28")',      kat: 'Rennrad',  preis: 1899, minBst: 15,  erf: 'Schmidt A.' },
  { id: 'A013', name: 'KTM Macina Gran 610',        kat: 'E-Bike',   preis: 2899, minBst: 20,  erf: 'Bauer M.' },
  { id: 'A014', name: 'Continental Grand Prix 5000',kat: 'Zubehör',  preis: 44,   minBst: 150, erf: 'Wagner T.' },
  { id: 'A015', name: 'Ergon GP1 Fahrradgriff',    kat: 'Zubehör',  preis: 29,   minBst: 300, erf: 'Fischer S.' },
  { id: 'A016', name: 'Giant Trance X 3',           kat: 'MTB',      preis: 2199, minBst: 18,  erf: 'Müller K.' },
  { id: 'A017', name: 'Rotwild R.X750 Core',        kat: 'E-Bike',   preis: 5499, minBst: 8,   erf: 'Schmidt A.' },
  { id: 'A018', name: 'Bikemate Kettenschloss',     kat: 'Zubehör',  preis: 19,   minBst: 200, erf: 'Bauer M.' },
]

const REIHEN_RAW = {
  A001: [8,12,9,14,15,10,18,11,14,13,16,19,15,22],
  A002: [3,5,4,6,5,8,7,4,6,9,5,7,8,11],
  A003: [4,3,5,4,6,5,7,4,5,6,8,5,9,7],
  A004: [2,3,2,4,3,5,4,3,5,4,6,5,4,8],
  A005: [3,4,3,5,6,4,7,5,6,5,7,6,5,9],
  A006: [5,7,6,8,9,7,10,8,7,9,11,8,10,13],
  A007: [15,20,18,22,19,25,21,18,24,20,26,22,19,30],
  A008: [40,55,48,60,52,65,58,50,62,55,68,60,52,75],
  A009: [1,2,1,2,3,2,3,2,2,3,2,4,3,5],
  A010: [20,25,22,28,26,30,27,24,29,26,32,28,25,35],
  A011: [10,14,12,16,15,18,14,12,17,15,20,16,14,22],
  A012: [2,3,2,4,3,4,3,2,4,3,5,3,4,6],
  A013: [2,3,2,3,4,3,5,4,3,4,5,4,5,7],
  A014: [45,58,52,65,60,70,63,55,68,61,72,65,58,80],
  A015: [80,100,90,110,105,120,108,95,115,102,125,112,98,135],
  A016: [3,4,3,5,4,6,5,4,5,6,7,5,8,6],
  A017: [0,1,0,1,1,2,1,0,1,2,1,2,1,3],
  A018: [60,75,68,82,77,88,80,70,85,78,92,84,74,98],
}

const BESTAENDE = {
  A001:142, A002:38, A003:24, A004:12, A005:31, A006:55,
  A007:187, A008:423, A009:7, A010:156, A011:89, A012:19,
  A013:23, A014:382, A015:641, A016:21, A017:5, A018:512,
}

export function trendDaten() {
  return ARTIKEL_SEED.map((a) => {
    const reihe = REIHEN_RAW[a.id] || []
    const gestern = reihe[reihe.length - 2] ?? 0
    const heute = reihe[reihe.length - 1] ?? 0
    const delta = heute - gestern
    const deltaPct = gestern > 0 ? Math.round(delta / gestern * 100) : 0
    const bst = BESTAENDE[a.id] ?? 0
    const bstAlarm = bst < a.minBst
    const avg = reihe.length ? reihe.reduce((s, v) => s + v, 0) / reihe.length : 0
    const stddev = reihe.length ? Math.sqrt(reihe.reduce((s, v) => s + (v - avg) ** 2, 0) / reihe.length) : 0
    const spike = stddev > 0 && heute > avg + 2 * stddev
    return { ...a, reihe, gestern, heute, delta, deltaPct, bst, bstAlarm, spike, avg: Math.round(avg * 10) / 10 }
  }).sort((a, b) => Math.abs(b.deltaPct) - Math.abs(a.deltaPct))
}

export const AENDERUNGEN = [
  { ts:'06.25 14:37', typ:'Korrekt.', obj:'Auftrag A-2026-4812', detail:'Preis korrigiert: 899 € → 849 € (Sonderrab. Händler)',                  erf:'Müller K.',  s:'a' },
  { ts:'06.25 13:15', typ:'Storno',   obj:'Auftrag A-2026-4809', detail:'Storno auf Kundenwunsch (City Bikes München)',                           erf:'Wagner T.',  s:'r' },
  { ts:'06.25 11:42', typ:'Neueing.', obj:'Auftrag A-2026-4816', detail:'3× Bosch Performance CX 85 + 2× Rotwild R.X750 Core',                   erf:'Schmidt A.', s:'g' },
  { ts:'06.25 10:08', typ:'Bestand',  obj:'Artikel A009 (Bosch CX 85)',    detail:'Bestandskorrektur: 12 → 7 Stk. (Inventurdifferenz)',           erf:'Bauer M.',   s:'a' },
  { ts:'06.25 09:31', typ:'Preis',    obj:'Artikel A018 (Kettenschloss)',   detail:'Preissenkung: 22 € → 19 € (Preisanpassung Lieferant)',         erf:'Fischer S.', s:'g' },
  { ts:'06.24 16:22', typ:'Korrekt.', obj:'Auftrag A-2026-4805', detail:'Lieferdatum verschoben: 27.06. → 02.07. (Lieferverzug Lieferant)',       erf:'Müller K.',  s:'a' },
  { ts:'06.24 15:48', typ:'Neueing.', obj:'Auftrag A-2026-4811', detail:'8× Schwalbe Marathon Plus, 15× Continental Grand Prix 5000',            erf:'Schmidt A.', s:'g' },
  { ts:'06.24 14:10', typ:'Fehler',   obj:'Auftrag A-2026-4806', detail:'Fehlmenge: 2× Trek Marlin 6 fehlt lt. Lieferschein (Rücksprache EK)',   erf:'Bauer M.',   s:'r' },
  { ts:'06.24 11:55', typ:'Bestand',  obj:'Artikel A017 (Rotwild R.X750)', detail:'Zugang: +2 Stk. (Nachlieferung Rotwild) → jetzt 5 Stk.',      erf:'Wagner T.',  s:'g' },
  { ts:'06.24 09:18', typ:'Storno',   obj:'Auftrag A-2026-4798', detail:'Teilstorno: 1× KTM Macina Gran 610 (Lieferzeitproblem)',                erf:'Fischer S.', s:'a' },
  { ts:'06.23 17:05', typ:'Preis',    obj:'Artikel A004 (Turbo Como)',     detail:'Preiserhöhung: 3.199 € → 3.299 € (neue Herstellerpreisliste)', erf:'Müller K.',  s:'a' },
  { ts:'06.23 14:33', typ:'Neueing.', obj:'Auftrag A-2026-4803', detail:'12× Shimano Deore XT Gruppe + 5× Cube Stereo 120',                      erf:'Schmidt A.', s:'g' },
]

export function anomalien() {
  const trend = trendDaten()
  const result = []
  for (const a of trend) {
    if (a.spike)    result.push({ art:'Umsatz-Spike',   schwere:'hoch', text: `${a.name}: Tagesabsatz ${a.heute} Stk. deutlich über Schnitt (⌀ ${a.avg} Stk.) — ungewöhnlicher Anstieg prüfen.`, aktion:'Auftragseingang prüfen', s:'a' })
    if (a.bstAlarm) result.push({ art:'Bestand-Alarm',  schwere:'hoch', text: `${a.name}: Bestand ${a.bst} Stk. unter Minimum (${a.minBst} Stk.) — Nachbestellung auslösen.`, aktion:'Nachbestellung prüfen', s:'r' })
    if (a.deltaPct < -40 && a.gestern > 2) result.push({ art:'Absatz-Einbruch', schwere:'mittel', text: `${a.name}: Absatz heute ${a.heute} Stk. (${a.deltaPct} % vs. gestern) — deutlicher Rückgang, Ursache klären.`, aktion:'Lager/Auftrag prüfen', s:'a' })
  }
  // Static: data gap
  result.push({ art:'Datenlücke', schwere:'gering', text:'Artikel A017 (Rotwild R.X750): 3 von 14 Tagen ohne Buchung (Wochenende?). Vollständigkeit Datenübergabe prüfen.', aktion:'Datenübergabe prüfen', s:'n' })
  result.push({ art:'Preisabweichung', schwere:'mittel', text:'Artikel A002 (Canyon Endurace): Rechnungspreis 1.249 € < Listenpreis 1.299 € in 3 Aufträgen — Rabattfreigabe dokumentiert?', aktion:'Rabattgenehmigung prüfen', s:'a' })
  return result
}

export const QUALITAET_ERFASSER = [
  { name:'Müller K.',  eintr:124, korr: 7, fehler: 3, vollst: 97, avgMin: 4.2, letzt:'06.25 14:37' },
  { name:'Schmidt A.', eintr:108, korr: 4, fehler: 1, vollst: 99, avgMin: 3.8, letzt:'06.25 11:42' },
  { name:'Bauer M.',   eintr: 95, korr:11, fehler: 6, vollst: 93, avgMin: 6.1, letzt:'06.25 10:08' },
  { name:'Wagner T.',  eintr: 87, korr: 3, fehler: 1, vollst: 98, avgMin: 4.5, letzt:'06.24 11:55' },
  { name:'Fischer S.', eintr: 72, korr: 5, fehler: 2, vollst: 96, avgMin: 5.0, letzt:'06.25 09:31' },
]

export function pivotDaten(dim, mass) {
  const trend = trendDaten()
  const gruppen = {}
  for (const a of trend) {
    const key = dim === 'kat' ? a.kat : dim === 'erf' ? a.erf : a.kat
    if (!gruppen[key]) gruppen[key] = { key, anzahl: 0, menge: 0, umsatz: 0, bst: 0 }
    const g = gruppen[key]
    g.anzahl++
    g.menge  += a.heute
    g.umsatz += a.heute * a.preis
    g.bst    += a.bst
  }
  const rows = Object.values(gruppen).sort((a, b) => b.umsatz - a.umsatz)
  const totMenge  = rows.reduce((s, r) => s + r.menge, 0)
  const totUmsatz = rows.reduce((s, r) => s + r.umsatz, 0)
  return rows.map((r) => ({
    ...r,
    wert: mass === 'umsatz' ? r.umsatz : mass === 'menge' ? r.menge : r.bst,
    anteilPct: totUmsatz > 0 ? Math.round(r.umsatz / totUmsatz * 1000) / 10 : 0,
    mengePct:  totMenge  > 0 ? Math.round(r.menge  / totMenge  * 1000) / 10 : 0,
  }))
}
