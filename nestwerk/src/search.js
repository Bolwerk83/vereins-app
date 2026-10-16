// Eselsohr-Suche: versteht Deutsch, verzeiht Tippfehler, beantwortet Fragen und trägt ein.
// Reine Logik ohne Oberfläche – geprüft mit tests/suche.test.mjs (läuft direkt in Node).
import { WD, WD_LONG, MONTHS, fromIso, wdIdx, addDays, mins, gebInfo, evDur } from './util.js'

/* ================= Normalisieren ================= */

// Kleinbuchstaben, ä→ae, ß→ss, Akzente weg – mit Rückweg zu den Originalpositionen (für Markierungen)
export function normMap(s) {
  const src = String(s || '')
  let text = ''
  const map = []
  for (let i = 0; i < src.length; i++) {
    const lo = src[i].toLowerCase()
    const rep = lo === 'ä' ? 'ae' : lo === 'ö' ? 'oe' : lo === 'ü' ? 'ue' : lo === 'ß' ? 'ss'
      : lo.normalize('NFD').replace(/[̀-ͯ]/g, '')
    for (const r of rep) { text += r; map.push(i) }
  }
  return { text, map }
}
export const norm = (s) => normMap(s).text

function wordsOf(text) {
  const out = []
  const re = /[a-z0-9]+/g
  let m
  while ((m = re.exec(text))) out.push({ w: m[0], start: m.index, end: m.index + m[0].length })
  return out
}

/* Tippfehler-Abstand (Damerau-Levenshtein), bricht ab, sobald es zu weit wird */
export function editDistance(a, b, max = 2) {
  if (a === b) return 0
  if (Math.abs(a.length - b.length) > max) return max + 1
  let prev2 = null
  let prev = Array.from({ length: b.length + 1 }, (_, j) => j)
  for (let i = 1; i <= a.length; i++) {
    const cur = [i]
    let rowMin = i
    for (let j = 1; j <= b.length; j++) {
      let v = Math.min(prev[j] + 1, cur[j - 1] + 1, prev[j - 1] + (a[i - 1] === b[j - 1] ? 0 : 1))
      if (i > 1 && j > 1 && a[i - 1] === b[j - 2] && a[i - 2] === b[j - 1]) v = Math.min(v, prev2[j - 2] + 1)
      cur[j] = v
      if (v < rowMin) rowMin = v
    }
    if (rowMin > max) return max + 1
    prev2 = prev
    prev = cur
  }
  return prev[b.length]
}

/* ================= Wortschatz ================= */

const STOP = new Set(('der die das den dem des ein eine einen einem einer und oder am im um an in zu zum zur fuer mit von vom bei beim '
  + 'mal noch schon denn bitte doch ja auch nur gibt es ist sind hat haben habe hast war waren wird werden steht stehen auf aus '
  + 'nach vor termin termine uhr was wann wer wo wie welche welcher welches wieviel wieviele viele etwas was los so da '
  + 'eintragen anlegen planen einplanen neuer neue neues hinzufuegen setzen notieren jetzt gerade grad momentan aktuell').split(' '))
const EDGE_FILL = new Set('am um im an in zu zum zur fuer mit von bei beim den die das der dem termin uhr eintragen anlegen planen einplanen neuer neue neues und'.split(' '))

const SYN = {
  arzt: ['kinderarzt', 'zahnarzt', 'aerztin', 'doktor', 'vorsorge', 'untersuchung', 'praxis'],
  doktor: ['arzt', 'kinderarzt', 'aerztin'],
  zahnarzt: ['zahn', 'zahnaerztin', 'kieferorthopaede'],
  fussball: ['training', 'fussballtraining', 'spiel', 'heimspiel', 'auswaertsspiel', 'turnier', 'verein'],
  training: ['fussballtraining', 'fussball', 'sport', 'schwimmen', 'turnen'],
  sport: ['laufen', 'joggen', 'training', 'fitness', 'schwimmen', 'yoga', 'radfahren', 'kraftraum', 'gym', 'ausgleich'],
  laufen: ['joggen', 'sport'],
  joggen: ['laufen', 'sport'],
  schule: ['unterricht', 'ogs', 'hort', 'klasse', 'elternabend'],
  kita: ['kindergarten', 'krippe', 'tagesmutter'],
  kindergarten: ['kita', 'krippe'],
  geburtstag: ['geb', 'bday', 'birthday', 'wiegenfest'],
  einkauf: ['einkaufen', 'einkaufsliste', 'kaufen', 'supermarkt', 'besorgen'],
  einkaufen: ['einkauf', 'einkaufsliste', 'kaufen'],
  spielen: ['spieltermin', 'verabredung', 'playdate', 'besuch'],
  verabredung: ['spielen', 'treffen', 'besuch'],
  musik: ['klavier', 'gitarre', 'geige', 'musikschule', 'floete'],
  klavier: ['klavierstunde', 'musikschule'],
  schwimmen: ['schwimmkurs', 'hallenbad', 'schwimmbad'],
  oma: ['grossmutter', 'omi'],
  opa: ['grossvater'],
  nachsorge: ['wochenbett', 'hausbesuch', 'wochenbettbesuch'],
  kurs: ['kursstunde', 'geburtsvorbereitung', 'rueckbildung'],
  arbeit: ['buero', 'job', 'meeting', 'dienst'],
  feier: ['party', 'fest', 'geburtstag'],
  party: ['feier', 'fest'],
  friseur: ['frisoer', 'haare'],
  betreuung: ['schule', 'kita', 'hort', 'ogs', 'tagesmutter', 'kindergarten'],
}

const WDAY = { montag: 0, mo: 0, dienstag: 1, di: 1, mittwoch: 2, mi: 2, donnerstag: 3, do: 3, freitag: 4, fr: 4, samstag: 5, sa: 5, sonnabend: 5, sonntag: 6, so: 6 }
const WDAY_S = { montags: 0, dienstags: 1, mittwochs: 2, donnerstags: 3, freitags: 4, samstags: 5, sonntags: 6 }
const MON_FULL = { januar: 0, februar: 1, maerz: 2, april: 3, mai: 4, juni: 5, juli: 6, august: 7, september: 8, oktober: 9, november: 10, dezember: 11 }
const MON_ABBR = { ...MON_FULL, jan: 0, feb: 1, mrz: 2, apr: 3, jun: 5, jul: 6, aug: 7, sep: 8, sept: 8, okt: 9, nov: 10, dez: 11 }
const NUM = { ein: 1, eins: 1, eine: 1, einen: 1, einem: 1, einer: 1, zwei: 2, drei: 3, vier: 4, fuenf: 5, sechs: 6, sieben: 7, acht: 8, neun: 9, zehn: 10, elf: 11, zwoelf: 12 }
const PART = {
  morgens: [5, 10, '08:00'], frueh: [5, 10, '08:00'], vormittags: [8, 12, '10:00'], vormittag: [8, 12, '10:00'],
  mittags: [11, 14, '12:00'], mittag: [11, 14, '12:00'], nachmittags: [12, 18, '15:00'], nachmittag: [12, 18, '15:00'],
  abends: [17, 24, '19:00'], abend: [17, 24, '19:00'], nachts: [21, 24, '21:00'],
}
const QW = new Set(['wann', 'wer', 'was', 'wo', 'wie', 'ist', 'hat', 'haben', 'gibt', 'steht', 'welche', 'welcher', 'welches', 'wieviele', 'wieviel', 'sind', 'kann', 'muss'])
const GEB = new Set(['geburtstag', 'geburtstage', 'geb', 'bday', 'birthday', 'geburtstagskind', 'wiegenfest'])
const PICK = new Set(['holt', 'bringt', 'faehrt', 'uebernimmt', 'betreut', 'kuemmert', 'abholen', 'bringen', 'holen', 'hinbringen', 'abgeholt', 'gebracht', 'zustaendig', 'dran'])
const FREE = new Set(['zeit', 'frei', 'verfuegbar', 'kann', 'koennte'])
const CARE = new Set(['betreuung', 'betreut', 'schule', 'kita', 'hort', 'ogs', 'tagesmutter', 'kindergarten', 'krippe', 'versorgt'])
const ME = new Set(['ich', 'mich', 'mir', 'mein', 'meine', 'meinen', 'meinem', 'meiner', 'meins'])
const KIDS = new Set(['kinder', 'kids', 'kindern'])
const LIST_END_SHOP = new Set(['kaufen', 'besorgen', 'mitbringen', 'einkaufen'])
const LIST_WORDS = { liste: 'einkauf', einkaufsliste: 'einkauf', einkaufszettel: 'einkauf', einkauf: 'einkauf', todo: 'todo', 'to-do': 'todo', todoliste: 'todo', 'to-do-liste': 'todo', aufgaben: 'todo', aufgabe: 'todo', erledigen: 'todo' }

/* ================= Datums-Helfer ================= */

const pad = (n) => String(n).padStart(2, '0')
const hhmm = (h, m) => pad(h) + ':' + pad(m)
const isoOf = (y, m, d) => `${y}-${pad(m + 1)}-${pad(d)}`
export const dayDiff = (a, b) => Math.round((fromIso(b) - fromIso(a)) / 86400000)
const mondayOf = (d) => addDays(d, -wdIdx(fromIso(d)))
const validDate = (y, m, d) => { const t = new Date(y, m, d); return t.getMonth() === m && t.getDate() === d }

function nextWeekday(today, wd, strict) {
  let diff = (wd - wdIdx(fromIso(today)) + 7) % 7
  if (strict && diff === 0) diff = 7
  return addDays(today, diff)
}
export function shortDate(d) { const x = fromIso(d); return `${WD[wdIdx(x)]} ${x.getDate()}.${x.getMonth() + 1}.` }
export function longDate(d) { const x = fromIso(d); return `${WD_LONG[wdIdx(x)]}, ${x.getDate()}.${x.getMonth() + 1}.` }
export function relDay(today, d) {
  const n = dayDiff(today, d)
  if (n === 0) return 'heute'
  if (n === 1) return 'morgen'
  if (n === 2) return 'übermorgen'
  if (n === -1) return 'gestern'
  if (n > 2 && n < 7) return 'am ' + WD_LONG[wdIdx(fromIso(d))]
  return 'am ' + longDate(d)
}
const relShort = (today, d) => {
  const n = dayDiff(today, d)
  if (n === 0) return 'heute'
  if (n === 1) return 'morgen'
  if (n === -1) return 'gestern'
  if (n > 1 && n < 7) return WD[wdIdx(fromIso(d))]
  if (n >= 7 && n < 60) return 'in ' + Math.round(n / 7) + ' Wo.'
  if (n < 0 && n > -60) return 'vor ' + Math.max(1, Math.round(-n / 7)) + ' Wo.'
  return shortDate(d)
}
const dayRange = (d, label) => ({ from: d, to: d, label })
function inferYear(today, m, d) {
  const y = +today.slice(0, 4)
  const cand = isoOf(y, m, d)
  return dayDiff(today, cand) < -60 ? y + 1 : y
}

/* ================= Anfrage zerlegen ================= */

function qTokens(q) {
  const out = []
  const re = /\S+/g
  let m
  while ((m = re.exec(q))) {
    let raw = m[0]
    let start = m.index
    const lead = raw.match(/^[„“"'(\[«»]+/)
    if (lead) { start += lead[0].length; raw = raw.slice(lead[0].length) }
    const trail = raw.match(/[“"')\]»«,;!?]+$/)
    if (trail) raw = raw.slice(0, raw.length - trail[0].length)
    if (!raw) continue
    let n = norm(raw)
    const colon = /:$/.test(n) && !/^\d/.test(n)
    if (colon) n = n.slice(0, -1)
    const dot = /\.$/.test(n)
    if (dot && !/\d/.test(n)) n = n.slice(0, -1)
    if (/^\d+\.$/.test(n) === false && /^[a-z]+'s$/.test(n)) n = n.slice(0, -2)
    out.push({ raw, start, end: start + raw.length, n, colon, dot })
  }
  return out
}

function memberMatch(n, members) {
  if (n.length < 2) return null
  const cands = [n]
  if (n.length > 3 && n.endsWith('s')) cands.push(n.slice(0, -1))
  for (const c of cands) {
    const hit = members.find((m) => norm(m.name) === c)
    if (hit) return { m: hit, exact: true }
  }
  return null
}
function memberFuzzy(n, members, isLast) {
  const c = n.length > 4 && n.endsWith('s') ? n.slice(0, -1) : n
  if (isLast && c.length >= 3) {
    const pre = members.filter((m) => norm(m.name).startsWith(c))
    if (pre.length === 1) return pre[0]
  }
  if (c.length >= 4) {
    const fz = members.filter((m) => editDistance(c, norm(m.name), 1) <= 1)
    if (fz.length === 1) return fz[0]
  }
  return null
}

export function parseQuery(q, ctx) {
  const toks = qTokens(q)
  const today = ctx.today
  const members = ctx.members || []
  const P = {
    raw: q, toks, persons: [], kids: false, me: false, klient: null,
    date: null, time: null, part: null, serie: null,
    intent: null, list: null, blitz: null, question: /\?\s*$/.test(q),
    words: [], titleToks: [],
  }
  const used = toks.map(() => false)
  const T = (i) => (toks[i] ? toks[i].n : undefined)
  const mark = (i, n, type, value) => { for (let k = i; k < i + n; k++) { used[k] = true; toks[k].type = type; if (value !== undefined) toks[k].value = value } }
  const free = (i) => i < toks.length && !used[i]
  const numAt = (i) => { const t = T(i); if (t === undefined) return null; if (/^\d{1,2}$/.test(t)) return +t; return NUM[t] ?? null }

  // Blitzzettel: „!Idee …“ oder „Notiz: …“
  const trimmed = q.trim()
  if (trimmed.startsWith('!') || (toks.length > 1 && ['notiz', 'merken', 'merke', 'blitz', 'gedanke', 'idee', 'blitzzettel'].includes(T(0)) && toks[0].colon)) {
    const text = trimmed.startsWith('!') ? trimmed.slice(1).trim() : trimmed.slice(trimmed.indexOf(':') + 1).trim()
    if (!trimmed.startsWith('!')) mark(0, 1, 'intent')
    if (text) { P.blitz = text; P.intent = 'blitz' }
    return P
  }
  // Einkaufszettel mit „+ Milch“
  if (trimmed.startsWith('+') && trimmed.length > 1) {
    P.list = 'einkauf'
    P.listText = trimmed.slice(1).trim()
    P.intent = 'list'
    return P
  }

  // Fragewort am Anfang
  if (QW.has(T(0)) && !toks[0].colon) { P.intent = 'q:' + T(0); mark(0, 1, 'intent') }
  if (T(0) === 'wie' && T(1) === 'viele') { P.intent = 'q:wieviele'; mark(1, 1, 'intent') }

  // 1) exakte Namen aus der Familie
  toks.forEach((t, i) => {
    if (used[i]) return
    const hit = memberMatch(t.n, members)
    if (hit) { mark(i, 1, 'person', hit.m.id); P.persons.push(hit.m.id) }
  })

  // 2) Datum, Uhrzeit, Wiederholung
  for (let i = 0; i < toks.length; i++) {
    if (used[i]) continue
    const t = T(i)
    // Uhrzeiten
    let mt = t.match(/^(\d{1,2})[:](\d{2})(?:uhr)?$/)
    if (mt && +mt[1] <= 24 && +mt[2] <= 59) { P.time = hhmm(+mt[1] % 24, +mt[2]); mark(i, 1, 'time'); if (T(i + 1) === 'uhr' && free(i + 1)) mark(i + 1, 1, 'time'); if (T(i - 1) === 'um' && free(i - 1)) mark(i - 1, 1, 'time'); continue }
    mt = t.match(/^(\d{1,2})\.(\d{2})$/)
    if (mt && (T(i + 1) === 'uhr' || T(i - 1) === 'um' || +mt[2] > 12) && +mt[1] <= 24 && +mt[2] <= 59) {
      P.time = hhmm(+mt[1] % 24, +mt[2]); mark(i, 1, 'time'); if (T(i + 1) === 'uhr') mark(i + 1, 1, 'time'); if (T(i - 1) === 'um' && free(i - 1)) mark(i - 1, 1, 'time'); continue
    }
    mt = t.match(/^(\d{1,2})(?:uhr|h)$/)
    if (mt && +mt[1] <= 24) { P.time = hhmm(+mt[1] % 24, 0); mark(i, 1, 'time'); continue }
    if (/^\d{1,2}$/.test(t) && T(i + 1) === 'uhr' && +t <= 24) { P.time = hhmm(+t % 24, 0); mark(i, 2, 'time'); if (T(i - 1) === 'um' && free(i - 1)) mark(i - 1, 1, 'time'); continue }
    if (t === 'um' && free(i + 1)) {
      const nn = numAt(i + 1)
      if (nn != null && nn <= 24 && !/^(halb|viertel|dreiviertel)$/.test(T(i + 1))) {
        let h = nn
        if (h > 0 && h < 7) h += 12
        P.time = hhmm(h % 24, 0); mark(i, 2, 'time'); if (T(i + 2) === 'uhr') mark(i + 2, 1, 'time'); continue
      }
    }
    if (t === 'halb' || t === 'dreiviertel') {
      const nn = numAt(i + 1)
      if (nn != null && nn >= 1 && nn <= 24) {
        let h = nn - 1
        if (h < 7) h += 12
        P.time = hhmm(h % 24, t === 'halb' ? 30 : 45); mark(i, 2, 'time')
        if (T(i - 1) === 'um' && free(i - 1)) mark(i - 1, 1, 'time')
        if (T(i + 2) === 'uhr') mark(i + 2, 1, 'time')
        continue
      }
    }
    if (t === 'viertel' && (T(i + 1) === 'nach' || T(i + 1) === 'vor')) {
      const nn = numAt(i + 2)
      if (nn != null && nn >= 1 && nn <= 24) {
        let h = T(i + 1) === 'nach' ? nn : nn - 1
        if (h < 7) h += 12
        P.time = hhmm(h % 24, T(i + 1) === 'nach' ? 15 : 45); mark(i, 3, 'time')
        if (T(i - 1) === 'um' && free(i - 1)) mark(i - 1, 1, 'time')
        continue
      }
    }
    if (PART[t] && !(t === 'morgen')) {
      P.part = t; mark(i, 1, 'time')
      continue
    }
    // Relative Tage
    const rel = { heute: 0, morgen: 1, uebermorgen: 2, gestern: -1, vorgestern: -2 }
    if (t in rel) {
      const d = addDays(today, rel[t])
      P.date = dayRange(d, t === 'uebermorgen' ? 'übermorgen' : t)
      mark(i, 1, 'date')
      const nx = T(i + 1)
      if (t === 'heute' && nx === 'morgen' && free(i + 1)) { P.part = 'morgens'; mark(i + 1, 1, 'time') }
      else if (nx && (PART[nx] || nx === 'frueh') && free(i + 1)) { P.part = nx === 'frueh' ? 'morgens' : nx; mark(i + 1, 1, 'time') }
      continue
    }
    // Wochentage
    if (t in WDAY_S) {
      const d = nextWeekday(today, WDAY_S[t], false)
      P.date = dayRange(d, WD_LONG[WDAY_S[t]] + 's')
      P.serie = { wd: WDAY_S[t] }
      mark(i, 1, 'date')
      if (['jeden', 'jede', 'jeder'].includes(T(i - 1)) && free(i - 1)) mark(i - 1, 1, 'date')
      continue
    }
    if (t in WDAY) {
      const prev = T(i - 1)
      if (t === 'so' && !toks[i].dot && prev !== 'am' && !(toks[i + 1] && /^\d/.test(T(i + 1)))) continue
      const wd = WDAY[t]
      let d
      let lab = WD_LONG[wd]
      if (['jeden', 'jede', 'jeder'].includes(prev) && free(i - 1)) {
        d = nextWeekday(today, wd, false); P.serie = { wd }; mark(i - 1, 1, 'date'); lab = 'jeden ' + WD_LONG[wd]
      } else if (['naechsten', 'naechste', 'naechster', 'kommenden', 'kommende', 'kommender'].includes(prev) && free(i - 1)) {
        d = nextWeekday(today, wd, true); mark(i - 1, 1, 'date')
      } else if (['uebernaechsten', 'uebernaechste'].includes(prev) && free(i - 1)) {
        d = addDays(nextWeekday(today, wd, true), 7); mark(i - 1, 1, 'date')
      } else {
        d = nextWeekday(today, wd, false)
        if (['diesen', 'diesem', 'am'].includes(prev) && free(i - 1)) mark(i - 1, 1, 'date')
      }
      P.date = dayRange(d, lab)
      mark(i, 1, 'date')
      continue
    }
    // Woche, Wochenende
    if (t === 'woche' || t === 'wochenende') {
      const prev = T(i - 1)
      const mon = mondayOf(today)
      if (t === 'woche') {
        if (['naechste', 'kommende', 'naechsten'].includes(prev)) P.date = { from: addDays(mon, 7), to: addDays(mon, 13), label: 'nächste Woche' }
        else if (['uebernaechste'].includes(prev)) P.date = { from: addDays(mon, 14), to: addDays(mon, 20), label: 'übernächste Woche' }
        else if (['letzte', 'vorige', 'letzten'].includes(prev)) P.date = { from: addDays(mon, -7), to: addDays(mon, -1), label: 'letzte Woche' }
        else if (['diese', 'dieser', 'diesen'].includes(prev) || prev === undefined || used[i - 1]) P.date = { from: today, to: addDays(mon, 6), label: 'diese Woche' }
        else continue
      } else {
        const sat = nextWeekday(today, 5, false)
        const satD = wdIdx(fromIso(today)) === 6 ? addDays(today, -1) : sat
        if (['naechstes', 'kommendes'].includes(prev)) P.date = { from: addDays(satD, 7), to: addDays(satD, 8), label: 'nächstes Wochenende' }
        else P.date = { from: satD, to: addDays(satD, 1), label: 'Wochenende' }
      }
      mark(i, 1, 'date')
      if (prev && free(i - 1) && /^(naechste|kommende|naechsten|uebernaechste|letzte|vorige|letzten|diese|dieser|diesen|naechstes|kommendes|dieses|am)$/.test(prev)) mark(i - 1, 1, 'date')
      continue
    }
    // in N Tagen / Wochen
    if (t === 'in' && free(i + 1)) {
      const nn = numAt(i + 1)
      const unit = T(i + 2)
      if (nn != null && unit && /^(tag|tagen|woche|wochen|monat|monaten)$/.test(unit)) {
        const days = unit.startsWith('tag') ? nn : unit.startsWith('woche') ? nn * 7 : nn * 30
        const d = addDays(today, days)
        P.date = dayRange(d, 'in ' + nn + ' ' + toks[i + 2].raw)
        mark(i, 3, 'date')
        continue
      }
    }
    // Daten: 24.10.2026 · 24.10. · 24.10
    mt = t.match(/^(\d{1,2})\.(\d{1,2})\.(\d{2,4})$/)
    if (mt) {
      const y = mt[3].length === 2 ? 2000 + +mt[3] : +mt[3]
      if (validDate(y, +mt[2] - 1, +mt[1])) { const d = isoOf(y, +mt[2] - 1, +mt[1]); P.date = dayRange(d, shortDate(d)); mark(i, 1, 'date'); if (T(i - 1) === 'am' && free(i - 1)) mark(i - 1, 1, 'date'); continue }
    }
    mt = t.match(/^(\d{1,2})\.(\d{1,2})\.?$/)
    if (mt && +mt[2] >= 1 && +mt[2] <= 12) {
      const y = inferYear(today, +mt[2] - 1, +mt[1])
      if (validDate(y, +mt[2] - 1, +mt[1])) { const d = isoOf(y, +mt[2] - 1, +mt[1]); P.date = dayRange(d, shortDate(d)); mark(i, 1, 'date'); if (T(i - 1) === 'am' && free(i - 1)) mark(i - 1, 1, 'date'); continue }
    }
    // 24. Oktober · 24 okt
    mt = t.match(/^(\d{1,2})\.?$/)
    if (mt && T(i + 1) in MON_ABBR && free(i + 1)) {
      const mo = MON_ABBR[T(i + 1)]
      let y = inferYear(today, mo, +mt[1])
      let n = 2
      if (/^\d{4}$/.test(T(i + 2) || '')) { y = +T(i + 2); n = 3 }
      if (validDate(y, mo, +mt[1])) { const d = isoOf(y, mo, +mt[1]); P.date = dayRange(d, shortDate(d)); mark(i, n, 'date'); if (T(i - 1) === 'am' && free(i - 1)) mark(i - 1, 1, 'date'); continue }
    }
    // am 24.
    if (/^\d{1,2}\.$/.test(t) && T(i - 1) === 'am') {
      const day = +t.slice(0, -1)
      const tm = +today.slice(5, 7) - 1
      let y = +today.slice(0, 4)
      let mo = tm
      if (day < +today.slice(8, 10)) { mo = tm + 1; if (mo > 11) { mo = 0; y++ } }
      if (validDate(y, mo, day)) { const d = isoOf(y, mo, day); P.date = dayRange(d, shortDate(d)); mark(i - 1, 2, 'date'); continue }
    }
    // Monat allein: „im November“
    if (t in MON_FULL && !members.some((m) => norm(m.name) === t)) {
      const mo = MON_FULL[t]
      const tm = +today.slice(5, 7) - 1
      const y = +today.slice(0, 4) + (mo < tm ? 1 : 0)
      const last = new Date(y, mo + 1, 0).getDate()
      P.date = { from: isoOf(y, mo, 1), to: isoOf(y, mo, last), label: MONTHS[mo] }
      mark(i, 1, 'date')
      if (T(i - 1) === 'im' && free(i - 1)) mark(i - 1, 1, 'date')
      continue
    }
  }

  // 3) Ich, Kinder, Klientinnen, ungenaue Namen
  toks.forEach((t, i) => {
    if (used[i]) return
    if (ME.has(t.n)) { mark(i, 1, 'person', ctx.meId); P.me = true; if (!P.persons.includes(ctx.meId)) P.persons.push(ctx.meId); return }
    if (KIDS.has(t.n) && (ctx.kids || []).length) { mark(i, 1, 'person', 'kids'); P.kids = true; return }
    const fz = ctx.vocabSet && ctx.vocabSet.has(t.n) ? null : memberFuzzy(t.n, members, i === toks.length - 1)
    if (fz && !STOP.has(t.n) && !(t.n in WDAY) && !(t.n in MON_ABBR)) { mark(i, 1, 'person', fz.id); if (!P.persons.includes(fz.id)) P.persons.push(fz.id); return }
    if (ctx.klienten && t.n.length >= 3) {
      const k = ctx.klienten.find((x) => wordsOf(norm(x.name)).some((w) => w.w === t.n || (t.n.length >= 5 && editDistance(t.n, w.w, 1) <= 1)))
      if (k) { mark(i, 1, 'klient', k.id); P.klient = k.id }
    }
  })
  if (P.kids) for (const k of ctx.kids) if (!P.persons.includes(k.id)) P.persons.push(k.id)

  // 4) Listen-Wünsche: „Milch auf die Liste“, „Brot kaufen“, „Todo: Steuer“
  const last = toks.length - 1
  if (!P.intent || !P.intent.startsWith('q:')) {
    if (toks.length >= 2 && (T(0) === 'todo' || T(0) === 'to-do' || T(0) === 'aufgabe') && (toks[0].colon || toks.length > 1)) { P.list = 'todo'; mark(0, 1, 'list') }
    else if (toks.length >= 2 && (T(0) === 'einkauf' || T(0) === 'kaufen' || T(0) === 'einkaufen') && toks[0].colon) { P.list = 'einkauf'; mark(0, 1, 'list') }
    else {
      for (let i = last; i >= 1; i--) {
        if (used[i]) continue
        const t = T(i)
        if (t in LIST_WORDS && (T(i - 1) === 'die' || T(i - 1) === 'den' || T(i - 1) === 'meine') && T(i - 2) === 'auf') { P.list = LIST_WORDS[t]; mark(i - 2, 3, 'list'); break }
        if (t in LIST_WORDS && T(i - 1) === 'auf') { P.list = LIST_WORDS[t]; mark(i - 1, 2, 'list'); break }
        if (i === last && LIST_END_SHOP.has(t) && !P.time) { P.list = 'einkauf'; mark(i, 1, 'list'); break }
        if (i === last && t === 'erledigen' && !P.time && !P.date) { P.list = 'todo'; mark(i, 1, 'list'); break }
      }
    }
  }

  // 5) Was übrig bleibt, ist Inhalt
  toks.forEach((t, i) => {
    if (used[i]) return
    t.type = STOP.has(t.n) ? 'fill' : 'word'
    if (t.type === 'word') P.words.push(...t.n.split(/[^a-z0-9]+/).filter(Boolean))
    P.titleToks.push(t)
  })
  while (P.titleToks.length && EDGE_FILL.has(P.titleToks[0].n)) P.titleToks.shift()
  while (P.titleToks.length && EDGE_FILL.has(P.titleToks[P.titleToks.length - 1].n)) P.titleToks.pop()
  P.title = P.titleToks.map((t) => t.raw).join(' ').replace(/^./, (c) => c.toUpperCase())
  if (P.list) P.listText = P.title

  // 6) Absicht bestimmen
  const has = (set) => P.words.some((w) => set.has(w)) || toks.some((t) => set.has(t.n))
  const q0 = P.intent && P.intent.startsWith('q:') ? P.intent.slice(2) : null
  const isQ = !!q0 || P.question
  if (P.list) P.intent = 'list'
  else if (has(GEB) && (isQ || P.words.filter((w) => !GEB.has(w)).length <= 2)) P.intent = 'birthday'
  else if (isQ && q0 === 'wo' && P.persons.length) P.intent = 'where'
  else if (isQ && has(PICK)) P.intent = 'who'
  else if (isQ && has(FREE)) P.intent = 'free'
  else if (isQ && has(CARE)) P.intent = 'care'
  else if (isQ && (q0 === 'wieviele' || q0 === 'wieviel')) P.intent = 'count'
  else if (isQ && q0 === 'wann' && P.words.length) P.intent = 'when'
  else if (isQ) P.intent = 'agenda'
  else if (P.title && P.words.length && (P.time || P.serie || P.part)) P.intent = 'create'
  else if (P.persons.length && !P.words.length && !P.date && !P.time) P.intent = 'person'
  else if ((P.date || P.time || P.part) && !P.words.length) P.intent = 'agenda'
  else P.intent = 'search'
  P.isQuestion = isQ
  return P
}

/* ================= Index ================= */

function field(key, text, w) {
  const { text: n, map } = normMap(text)
  return { key, text: String(text || ''), n, map, toks: wordsOf(n), w }
}

// ctx: { me, byId, viewEvent, today, praxis, klienten, kids, navs }
export function buildIndex(db, ctx) {
  const docs = []
  docs.vocabSet = null
  const nm = (id) => ctx.byId[id]?.name || ''
  for (const e of db.events || []) {
    const v = ctx.viewEvent(e)
    const who = nm(e.member_id)
    const zust = e.zust ? nm(e.zust) : ''
    const sub = [shortDate(e.on_date) + ' ' + e.at_time, who, v.masked ? '' : v.meta, zust ? '✋ ' + zust : '', e.status === 'pending' ? 'Anfrage' : ''].filter(Boolean).join(' · ')
    const d = fromIso(e.on_date)
    const extra = [WD_LONG[wdIdx(d)], MONTHS[d.getMonth()], e.serie ? 'serie' : '', e.src === 'verein' ? 'verein fussball' : '', e.sport ? 'sport ausgleich' : '',
      !v.masked && e.src === 'work' ? 'arbeit' : '', !v.masked && e.ptype ? e.ptype + ' praxis' : '', !v.masked && e.klid ? (ctx.klienten || []).find((k) => k.id === e.klid)?.name || '' : '',
      e.status === 'pending' ? 'anfrage' : '', v.masked ? 'belegt' : ''].filter(Boolean).join(' ')
    docs.push({ kind: 'event', id: e.id, title: v.title, sub, date: e.on_date, time: e.at_time, member_id: e.member_id, zust: e.zust, ev: e, masked: !!v.masked,
      fields: [field('title', v.title, 1), field('sub', sub, 0.72), field('extra', extra, 0.55)] })
  }
  for (const k of ctx.kids || []) {
    for (const b of k.care || []) {
      const days = b.days.map((x) => WD[x]).join(' · ')
      const title = `${k.name} · ${b.label}`
      const sub = `${days} · ${b.from}–${b.to} Uhr`
      docs.push({ kind: 'care', id: k.id + b.id, kid: k, block: b, title, sub, member_id: k.id,
        fields: [field('title', title, 1), field('sub', sub, 0.7), field('extra', 'betreuung ' + b.label, 0.6)] })
    }
  }
  for (const it of db.items || []) {
    const sub = (it.list === 'einkauf' ? 'Einkaufen' : 'Zu erledigen') + (it.done ? ' · erledigt' : ' · offen') + ' · von ' + nm(it.created_by)
    docs.push({ kind: 'item', id: it.id, title: it.text, sub, item: it,
      fields: [field('title', it.text, 1), field('sub', sub, 0.6), field('extra', it.list === 'einkauf' ? 'einkauf einkaufen liste kaufen' : 'todo aufgabe erledigen liste', 0.5)] })
  }
  for (const g of db.geburtstage || []) {
    const info = gebInfo(g.date)
    const sub = [g.date, info ? (info.days === 0 ? 'heute!' : info.days === 1 ? 'morgen' : `in ${info.days} Tagen`) : '', info?.age != null ? `wird ${info.age}` : ''].filter(Boolean).join(' · ')
    docs.push({ kind: 'geb', id: g.id, title: g.name, sub, geb: g, info,
      fields: [field('title', g.name, 1), field('sub', sub, 0.6), field('extra', 'geburtstag geb feier', 0.55)] })
  }
  for (const m of db.members || []) {
    const sub = (m.kind === 'kid' ? 'Kind' : 'Erwachsen') + (m.id === ctx.me.id ? ' · du' : '')
    docs.push({ kind: 'member', id: m.id, title: m.name, sub, member: m, member_id: m.id,
      fields: [field('title', m.name, 1), field('sub', sub, 0.5), field('extra', 'familie mitglied ' + (m.kind === 'kid' ? 'kind kinder' : 'eltern'), 0.4)] })
  }
  if (ctx.praxis) {
    for (const k of ctx.klienten || []) {
      const sub = ['Klientin', k.adresse, k.telefon].filter(Boolean).join(' · ')
      docs.push({ kind: 'klient', id: k.id, title: k.name, sub, klient: k,
        fields: [field('title', k.name, 1), field('sub', sub, 0.6), field('extra', (k.notiz || '') + ' klientin praxis', 0.5)] })
    }
  }
  for (const z of (db.inbox || []).filter((i) => i.member_id === ctx.me.id)) {
    const title = z.text.split('\n')[0]
    docs.push({ kind: 'zettel', id: z.id, title, sub: 'Blitzzettel vom ' + z.date, zettel: z,
      fields: [field('title', title, 1), field('sub', z.text, 0.7), field('extra', 'blitzzettel notiz', 0.5)] })
  }
  for (const n of ctx.navs || []) {
    docs.push({ kind: 'nav', id: n.id, title: n.title, sub: n.sub, nav: n,
      fields: [field('title', n.title, 1), field('sub', n.sub, 0.5), field('extra', n.kw || '', 0.75)] })
  }
  const words = new Set()
  for (const d of docs) if (d.kind !== 'member' && d.kind !== 'nav') for (const t of d.fields[0].toks) words.add(t.w)
  docs.vocabSet = words
  return docs
}

/* ================= Treffer bewerten ================= */

function bestTok(qw, toks, strict) {
  let best = null
  for (const t of toks) {
    let s = 0
    let st = t.start
    let en = t.end
    if (t.w === qw) s = 1
    else if (qw.length >= 2 && t.w.startsWith(qw)) { s = 0.88 - Math.min(0.18, (t.w.length - qw.length) * 0.012); en = t.start + qw.length }
    else if (!strict && qw.length >= 3 && t.w.includes(qw)) { s = 0.64; st = t.start + t.w.indexOf(qw); en = st + qw.length }
    else if (!strict && qw.length >= 4 && !/^\d+$/.test(qw)) {
      const max = qw.length >= 8 ? 2 : 1
      const whole = editDistance(qw, t.w, max)
      const head = t.w.length > qw.length ? editDistance(qw, t.w.slice(0, qw.length), max) : max + 1
      if (whole <= max) s = 0.6 - whole * 0.07
      else if (head <= max) { s = 0.5 - head * 0.07; en = t.start + Math.min(t.w.length, qw.length) }
    }
    if (s > 0 && (!best || s > best.score)) best = { score: s, start: st, end: en }
  }
  return best
}

function matchField(qw, f) {
  let best = bestTok(qw, f.toks, false)
  const syn = SYN[qw]
  if (syn) {
    for (const sw of syn) {
      const m = bestTok(sw, f.toks, true)
      if (m && (!best || m.score * 0.78 > best.score)) best = { ...m, score: m.score * 0.78 }
    }
  }
  return best
}

function scoreDoc(doc, qws) {
  let total = 0
  let matched = 0
  const hits = {}
  for (const qw of qws) {
    let best = null
    for (const f of doc.fields) {
      const m = matchField(qw, f)
      if (m && (!best || m.score * f.w > best.s)) best = { s: m.score * f.w, f, m }
    }
    if (best) {
      total += best.s
      matched++
      ;(hits[best.f.key] = hits[best.f.key] || []).push([best.m.start, best.m.end])
    }
  }
  return { score: qws.length ? total / qws.length : 0, all: matched === qws.length, matched, hits }
}

// Markierungsbereiche (normalisiert) → Originaltext
function toOrig(f, ranges) {
  if (!f || !ranges) return []
  return ranges.map(([s, e]) => [f.map[s], (f.map[e - 1] ?? f.map[f.map.length - 1]) + 1]).sort((a, b) => a[0] - b[0])
}

/* ================= Suche ================= */

const KIND_W = { event: 1, care: 0.95, geb: 1, member: 1.05, klient: 1, item: 0.92, zettel: 0.9, nav: 0.85 }

export function search(q, index, ctx) {
  const P = parseQuery(q, { ...ctx, vocabSet: index.vocabSet })
  const res = { parse: P, answer: null, actions: [], groups: [] }
  if (!q.trim()) return res
  const today = ctx.today

  res.answer = buildAnswer(P, index, ctx)
  res.actions = buildActions(P, ctx)

  const drop = new Set([...(P.intent === 'birthday' ? GEB : []), ...(P.intent === 'who' ? PICK : []), ...(P.intent === 'free' ? FREE : [])])
  const qws = P.words.filter((w) => !drop.has(w))
  const personsF = P.persons
  const dateF = P.date
  const partF = P.part ? PART[P.part] : null
  const evOk = (d) => {
    if (dateF && (d.date < dateF.from || d.date > dateF.to)) return false
    if (personsF.length && !personsF.includes(d.member_id) && !personsF.includes(d.zust)) return false
    if (partF) { const h = mins(d.time) / 60; if (h < partF[0] || h >= partF[1]) return false }
    if (P.time && P.intent !== 'create') { if (Math.abs(mins(d.time) - mins(P.time)) > 90) return false }
    return true
  }

  const scored = []
  for (const d of index) {
    if (d.kind === 'event' && !evOk(d)) continue
    if (d.kind === 'care' && personsF.length && !personsF.includes(d.member_id)) continue
    if (d.kind === 'member' && personsF.length && !qws.length) continue
    let sc
    if (qws.length) {
      sc = scoreDoc(d, qws)
      if (!sc.all) continue
    } else {
      // Nur Filter (Person/Datum): Termine passend zum Filter, sonst nichts
      if (d.kind !== 'event' || !(dateF || personsF.length || partF || P.time)) continue
      sc = { score: 0.8, hits: {} }
    }
    let rank = sc.score * (KIND_W[d.kind] || 1)
    if (d.kind === 'event') {
      const n = dayDiff(today, d.date)
      rank *= n >= 0 ? 1 + 0.5 / (1 + n / 7) : 0.72 / (1 + -n / 45)
    }
    if (d.kind === 'item' && d.item.done) rank *= 0.7
    scored.push({ d, rank, sc })
  }

  const group = (kind, label, limit, sorter) => {
    let items = scored.filter((x) => x.d.kind === kind)
    if (!items.length) return
    items.sort(sorter || ((a, b) => b.rank - a.rank))
    const total = items.length
    items = items.slice(0, limit)
    res.groups.push({ kind, label, total, items: items.map((x) => toItem(x, ctx)) })
  }
  const evSort = (a, b) => {
    const qa = Math.round(a.sc.score * 4)
    const qb = Math.round(b.sc.score * 4)
    if (qa !== qb) return qb - qa
    const na = dayDiff(today, a.d.date)
    const nb = dayDiff(today, b.d.date)
    if ((na >= 0) !== (nb >= 0)) return na >= 0 ? -1 : 1
    if (na >= 0) return na - nb || a.d.time.localeCompare(b.d.time)
    return nb - na || a.d.time.localeCompare(b.d.time)
  }
  group('event', dateF ? 'Termine · ' + dateF.label : 'Termine', dateF || personsF.length ? 12 : 8, evSort)
  group('care', 'Betreuung', 4)
  group('geb', 'Geburtstage', 5, (a, b) => b.rank - a.rank || (a.d.info?.days ?? 999) - (b.d.info?.days ?? 999))
  group('member', 'Familie', 4)
  group('klient', 'Klientinnen', 5)
  group('item', 'Listen', 5)
  group('zettel', 'Blitzzettel', 4)
  group('nav', 'Bereiche & Befehle', 5)

  // Termin-Aktionen stehen oben, wenn eine Uhrzeit dabei ist – sonst nach den Treffern
  return res
}

function toItem({ d, sc }, ctx) {
  const tf = d.fields.find((f) => f.key === 'title')
  const sf = d.fields.find((f) => f.key === 'sub')
  const hl = { title: toOrig(tf, sc.hits.title), sub: toOrig(sf, sc.hits.sub) }
  const base = { key: d.kind + ':' + d.id, kind: d.kind, title: d.title, sub: d.sub, hl, doc: d }
  if (d.kind === 'event') return { ...base, right: relShort(ctx.today, d.date), color: ctx.byId[d.member_id]?.color, act: { type: 'openEvent', id: d.id } }
  if (d.kind === 'care') return { ...base, color: d.kid.color, act: { type: 'care', id: d.kid.id } }
  if (d.kind === 'geb') return { ...base, right: d.info ? (d.info.days === 0 ? 'heute' : d.info.days + ' T.') : '', act: { type: 'openWa', id: d.id } }
  if (d.kind === 'member') return { ...base, color: d.member.color, act: { type: 'member', id: d.id } }
  if (d.kind === 'klient') return { ...base, act: { type: 'klient', id: d.id } }
  if (d.kind === 'item') return { ...base, act: { type: 'item', id: d.id } }
  if (d.kind === 'zettel') return { ...base, act: { type: 'zettel', id: d.id } }
  return { ...base, act: { type: 'nav', nav: d.nav } }
}

/* ================= Aktionen: eintragen, auf die Liste, festhalten ================= */

function buildActions(P, ctx) {
  const out = []
  if (P.intent === 'blitz' && P.blitz) out.push({ key: 'a:blitz', kind: 'action', icon: 'bolt', title: 'Als Blitzzettel festhalten', sub: P.blitz, act: { type: 'blitz', text: P.blitz } })
  if (P.intent === 'list' && P.listText) {
    out.push({ key: 'a:list', kind: 'action', icon: 'list', title: (P.list === 'einkauf' ? 'Auf die Einkaufsliste: ' : 'Auf die To-do-Liste: ') + P.listText, sub: 'Für die ganze Familie sichtbar', act: { type: 'list', list: P.list, text: P.listText } })
  }
  if (P.isQuestion || P.intent === 'list' || P.intent === 'blitz') return out
  if (!P.title || !P.words.length) return out
  const kidsOnly = P.kids && !P.persons.some((id) => !(ctx.kids || []).some((k) => k.id === id))
  const memberId = !kidsOnly && P.persons.length ? P.persons[0] : ctx.meId
  let date = P.date && P.date.from === P.date.to ? P.date.from : null
  let time = P.time || (P.part ? PART[P.part][2] : null)
  if (!date && P.serie) date = addDays(ctx.today, (P.serie.wd - wdIdx(fromIso(ctx.today)) + 7) % 7)
  if (!date && time) date = mins(time) >= (ctx.nowMin ?? 0) ? ctx.today : addDays(ctx.today, 1)
  const who = ctx.byId[memberId]?.name || ''
  const data = { title: P.title, member_id: memberId, on_date: date, at_time: time, serie: !!P.serie }
  if (date && time) {
    const target = ctx.byId[memberId]
    let rule = ''
    if (target && memberId !== ctx.meId && target.kind !== 'kid') {
      rule = ctx.me.can_direct && ctx.isFree(memberId, date, time) ? ' · direkt eingetragen' : ` · geht als Anfrage an ${target.name}`
    }
    out.push({ key: 'a:create', kind: 'action', icon: 'plus', title: `Eintragen: ${P.title}`, sub: `${who} · ${longDate(date)} · ${time} Uhr${P.serie ? ' · jede Woche (8×)' : ''}${rule}`, act: { type: 'create', data }, primary: true })
    out.push({ key: 'a:form', kind: 'action', icon: 'pencil', title: 'Im Formular anpassen', sub: 'Mit allen Angaben vorausgefüllt', act: { type: 'form', data } })
  } else if (date) {
    out.push({ key: 'a:form', kind: 'action', icon: 'plus', title: `Termin anlegen: ${P.title}`, sub: `${who} · ${longDate(date)} · Uhrzeit wählst du im Formular`, act: { type: 'form', data: { ...data, at_time: null } } })
  }
  return out
}

/* ================= Antworten ================= */

const careWhere = (label) => {
  const l = norm(label)
  if (l.includes('schule')) return 'in der Schule'
  if (l.includes('kita') || l.includes('kindergarten') || l.includes('krippe')) return 'in der Kita'
  if (l.includes('hort') || l.includes('ogs')) return 'im Hort'
  if (l.includes('tagesmutter')) return 'bei der Tagesmutter'
  if (l.includes('oma') || l.includes('opa')) return 'bei ' + label
  return 'bei „' + label + '“'
}
const plural = (n, one, many) => (n === 1 ? one : many)
const ZAHL = ['keine', 'einen', 'zwei', 'drei', 'vier', 'fünf', 'sechs', 'sieben', 'acht', 'neun', 'zehn', 'elf', 'zwölf']
const zahl = (n) => (n < ZAHL.length ? ZAHL[n] : String(n))
const joinNames = (arr) => (arr.length <= 1 ? arr.join('') : arr.slice(0, -1).join(', ') + ' und ' + arr[arr.length - 1])
const genitiv = (name) => (/[sßxz]$/i.test(name) ? name + '’' : name + 's')

function careOn(kid, d) {
  return (kid.care || []).filter((b) => b.days.includes(wdIdx(fromIso(d)))).sort((a, b) => a.from.localeCompare(b.from))
}

function eventsFor(ctx, { from, to, persons }) {
  return (ctx.events || [])
    .filter((e) => e.status !== 'declined' && e.on_date >= from && e.on_date <= to && (!persons || !persons.length || persons.includes(e.member_id) || persons.includes(e.zust)))
    .sort((a, b) => a.on_date.localeCompare(b.on_date) || a.at_time.localeCompare(b.at_time))
}

function buildAnswer(P, index, ctx) {
  const today = ctx.today
  const nm = (id) => ctx.byId[id]?.name || '?'
  const V = (e) => ctx.viewEvent(e)
  const line = (e, withDate) => ({ a: (withDate ? shortDate(e.on_date) + ' ' : '') + e.at_time, b: `${V(e).title} · ${nm(e.member_id)}${e.zust ? ' · ✋ ' + nm(e.zust) : ''}`, act: { type: 'openEvent', id: e.id } })
  const persons = P.persons
  const kidsAsked = persons.filter((id) => ctx.byId[id]?.kind === 'kid')

  if (P.intent === 'birthday') {
    const nameWords = P.words.filter((w) => !GEB.has(w))
    let list = (index.filter((d) => d.kind === 'geb'))
    if (nameWords.length) list = list.filter((d) => scoreDoc(d, nameWords).all)
    list = list.filter((d) => d.info).sort((a, b) => a.info.days - b.info.days)
    if (!list.length) return nameWords.length ? { kind: 'birthday', calm: true, eyebrow: 'Geburtstage', text: 'Dazu ist kein Geburtstag gemerkt.', sub: 'Unter Listen → Geburtstage trägst du ihn mit einem Handgriff ein.', actions: [{ label: 'Zu den Geburtstagen', act: { type: 'nav', nav: { to: 'listen' } } }] } : null
    const g = list[0]
    const dd = addDays(today, g.info.days)
    const rel = g.info.days === 0 ? 'heute' : g.info.days === 1 ? 'morgen' : g.info.days === 2 ? 'übermorgen' : `in ${g.info.days} Tagen`
    if (nameWords.length || list.length === 1) {
      return {
        kind: 'birthday', eyebrow: 'Geburtstag',
        text: `${g.geb.name} hat ${rel} Geburtstag.`,
        sub: `${longDate(dd)}${g.info.age != null ? ' · wird ' + g.info.age : ''}`,
        actions: [{ label: 'WhatsApp-Glückwunsch', act: { type: 'openWa', id: g.id } }],
      }
    }
    return {
      kind: 'birthday', eyebrow: 'Die nächsten Geburtstage',
      text: `Als Nächstes: ${g.geb.name}, ${rel}.`,
      lines: list.slice(0, 5).map((d) => ({ a: shortDate(addDays(today, d.info.days)), b: d.geb.name + (d.info.age != null ? ' · wird ' + d.info.age : ''), act: { type: 'openWa', id: d.id } })),
      actions: [{ label: `Glückwunsch an ${g.geb.name}`, act: { type: 'openWa', id: g.id } }],
    }
  }

  if (P.intent === 'where') {
    const pid = persons[0]
    const p = ctx.byId[pid]
    if (!p) return null
    const now = ctx.nowMin ?? 0
    const care = p.kind === 'kid' ? careOn(p, today).find((b) => mins(b.from) <= now && now < mins(b.to)) : null
    const evs = eventsFor(ctx, { from: today, to: today, persons: [pid] }).filter((e) => e.member_id === pid && e.status === 'fix')
    const running = evs.find((e) => mins(e.at_time) <= now && now < mins(e.at_time) + evDur(e))
    const nextE = evs.find((e) => mins(e.at_time) > now)
    if (care) {
      return { kind: 'where', eyebrow: 'Gerade', text: `${p.name} ist gerade ${careWhere(care.label)} – bis ${care.to}.`, sub: nextE ? `Danach: ${nextE.at_time} ${V(nextE).title}${nextE.zust ? ' · ✋ ' + nm(nextE.zust) : ''}` : 'Danach steht heute nichts mehr an.', actions: nextE ? [{ label: 'Nächsten Termin öffnen', act: { type: 'openEvent', id: nextE.id } }] : [] }
    }
    if (running) {
      const v = V(running)
      const what = v.masked ? (running.klid ? 'bei einem Praxistermin' : 'bei der Arbeit') : `bei „${v.title}“`
      const end = mins(running.at_time) + evDur(running)
      return { kind: 'where', eyebrow: 'Gerade', text: `${p.name} ist gerade ${what} – seit ${running.at_time}.`, sub: `Voraussichtlich bis ${hhmm(Math.floor(end / 60) % 24, end % 60)}${running.zust ? ' · ✋ ' + nm(running.zust) + ' ist zuständig' : ''}`, actions: [{ label: 'Termin öffnen', act: { type: 'openEvent', id: running.id } }] }
    }
    return { kind: 'where', calm: true, eyebrow: 'Gerade', text: `Für ${p.name} ist gerade nichts eingetragen.`, sub: nextE ? `Als Nächstes: ${nextE.at_time} ${V(nextE).title}` : 'Heute steht für ' + p.name + ' nichts mehr an.', actions: nextE ? [{ label: 'Nächsten Termin öffnen', act: { type: 'openEvent', id: nextE.id } }] : [] }
  }

  if (P.intent === 'who') {
    const range = P.date || { from: today, to: today, label: 'heute' }
    const kids = kidsAsked.length ? kidsAsked : (ctx.kids || []).map((k) => k.id)
    const evs = eventsFor(ctx, { from: range.from, to: range.to, persons: kids }).filter((e) => kids.includes(e.member_id) && e.status === 'fix' && (range.from !== today || mins(e.at_time) + 30 >= (ctx.nowMin ?? 0)))
    if (!evs.length) {
      const names = kids.map(nm)
      return { kind: 'who', calm: true, eyebrow: 'Wer übernimmt', text: `${range.label === 'heute' ? 'Heute' : 'Für ' + range.label} ist für ${joinNames(names)} nichts zum Bringen oder Holen eingetragen.`, sub: kids.map((id) => { const b = careOn(ctx.byId[id], range.from); return b.length ? `${nm(id)}: ${b.map((x) => x.label + ' bis ' + x.to).join(', ')}` : null }).filter(Boolean).join(' · ') || '' }
    }
    const open = evs.filter((e) => !e.zust)
    const first = evs[0]
    const text = first.zust
      ? `${nm(first.zust)} übernimmt ${genitiv(nm(first.member_id))} ${V(first).title} um ${first.at_time}.`
      : `Für ${genitiv(nm(first.member_id))} ${V(first).title} um ${first.at_time} ist noch niemand eingeteilt.`
    return {
      kind: 'who', eyebrow: 'Wer übernimmt · ' + range.label, warn: !first.zust,
      text, sub: open.length > 1 || (open.length === 1 && first.zust) ? `${zahl(open.length).replace(/^einen$/, 'Ein')} ${plural(open.length, 'Termin ist', 'Termine sind')} noch offen.`.replace(/^./, (c) => c.toUpperCase()) : '',
      lines: evs.length > 1 ? evs.slice(0, 6).map((e) => ({ a: (range.from !== range.to ? shortDate(e.on_date) + ' ' : '') + e.at_time, b: `${V(e).title} · ${nm(e.member_id)} · ${e.zust ? '✋ ' + nm(e.zust) : 'noch offen'}`, act: { type: 'openEvent', id: e.id } })) : null,
      actions: open.length && ctx.me.kind !== 'kid' ? [{ label: 'Ich übernehme', act: { type: 'claim', id: open[0].id } }, { label: 'Termin öffnen', alt: true, act: { type: 'openEvent', id: open[0].id } }] : [{ label: 'Termin öffnen', act: { type: 'openEvent', id: first.id } }],
    }
  }

  if (P.intent === 'free') {
    const range = P.date || { from: today, to: today, label: 'heute' }
    const date = range.from
    const adults = (persons.length ? persons.map((id) => ctx.byId[id]).filter(Boolean) : (ctx.members || []).filter((m) => m.kind !== 'kid'))
    const at = P.time || (P.part ? PART[P.part][2] : null)
    if (at) {
      const rows = adults.map((m) => {
        const busy = (ctx.events || []).find((e) => e.member_id === m.id && e.on_date === date && e.status === 'fix' && Math.abs(mins(e.at_time) - mins(at)) < 60)
        return { m, busy }
      })
      const freeN = rows.filter((r) => !r.busy).map((r) => r.m.name)
      const when = `${range.label === 'heute' ? 'Heute' : range.label.replace(/^./, (c) => c.toUpperCase())} um ${at}`
      return {
        kind: 'free', eyebrow: 'Wer hat Zeit', calm: !freeN.length,
        text: freeN.length === rows.length ? `${when} haben alle Zeit.` : freeN.length ? `${when} ${freeN.length === 1 ? 'hat nur' : 'haben'} ${joinNames(freeN)} Zeit.` : `${when} sind alle belegt.`,
        lines: rows.map((r) => ({ a: r.m.name, b: r.busy ? `belegt · ${r.busy.at_time} ${V(r.busy).title}` : 'frei', act: r.busy ? { type: 'openEvent', id: r.busy.id } : null })),
        actions: freeN.length ? [{ label: 'Termin für ' + at + ' anlegen', act: { type: 'form', data: { title: '', member_id: ctx.meId, on_date: date, at_time: at } } }] : [],
      }
    }
    const rows = adults.map((m) => ({ m, evs: (ctx.events || []).filter((e) => e.member_id === m.id && e.on_date === date && e.status === 'fix').sort((a, b) => a.at_time.localeCompare(b.at_time)) }))
    const freeAll = rows.filter((r) => !r.evs.length).map((r) => r.m.name)
    return {
      kind: 'free', eyebrow: 'Wer hat Zeit · ' + range.label, calm: true,
      text: freeAll.length === rows.length ? `${range.label === 'heute' ? 'Heute' : range.label.replace(/^./, (c) => c.toUpperCase())} ist bei allen nichts eingetragen.` : freeAll.length ? `${joinNames(freeAll)} ${freeAll.length === 1 ? 'hat' : 'haben'} ${range.label} nichts vor.` : `${range.label === 'heute' ? 'Heute' : range.label.replace(/^./, (c) => c.toUpperCase())} haben alle etwas vor – hier die freien Lücken:`,
      lines: rows.map((r) => ({ a: r.m.name, b: r.evs.length ? 'belegt: ' + r.evs.map((e) => e.at_time).join(', ') : 'ganzer Tag frei' })),
    }
  }

  if (P.intent === 'care') {
    const kids = kidsAsked.length ? kidsAsked.map((id) => ctx.byId[id]) : (ctx.kids || [])
    if (!kids.length) return null
    const date = P.date ? P.date.from : today
    const label = P.date ? P.date.label : 'heute'
    const parts = kids.map((k) => {
      const b = careOn(k, date)
      if (!(k.care || []).length) return { k, none: true }
      return { k, b }
    })
    const set = parts.filter((x) => !x.none)
    const text = set.length
      ? set.map((x) => x.b.length ? `${x.k.name} ist ${label} ${x.b.map((b) => `${b.from}–${b.to} ${careWhere(b.label)}`).join(', ')}` : `${x.k.name} hat ${label} keine Betreuung`).join('. ') + '.'
      : `Für ${joinNames(kids.map((k) => k.name))} sind noch keine Betreuungszeiten hinterlegt.`
    const week = set.flatMap((x) => (x.k.care || []).map((b) => ({ a: x.k.name, b: `${b.label}: ${b.days.map((d) => WD[d]).join(' · ')} · ${b.from}–${b.to}` })))
    return {
      kind: 'care', eyebrow: 'Betreuung · ' + label, calm: !set.length,
      text, lines: week.length ? week : null,
      actions: [{ label: set.length ? 'Zeiten bearbeiten' : 'Zeiten anlegen', act: { type: 'care', id: (parts.find((x) => x.none) || parts[0]).k.id } }],
    }
  }

  if (P.intent === 'when') {
    const evDocs = index.filter((d) => d.kind === 'event' && (!persons.length || persons.includes(d.member_id) || persons.includes(d.zust)) && scoreDoc(d, P.words).all)
    if (!evDocs.length) return null
    const up = evDocs.filter((d) => d.date >= today).sort((a, b) => a.date.localeCompare(b.date) || a.time.localeCompare(b.time))
    const past = evDocs.filter((d) => d.date < today).sort((a, b) => b.date.localeCompare(a.date))
    const pick = up[0] || past[0]
    const wds = new Set(evDocs.map((d) => wdIdx(fromIso(d.date))))
    const times = new Set(evDocs.map((d) => d.time))
    const rhythm = evDocs.length >= 3 && wds.size === 1 && times.size === 1 ? ` – immer ${WD_LONG[[...wds][0]]}s um ${pick.time}` : ''
    return {
      kind: 'when', eyebrow: up[0] ? 'Nächster Termin' : 'Zuletzt',
      text: `${pick.title}: ${relDay(today, pick.date)} um ${pick.time}${rhythm}.`,
      sub: [nm(pick.member_id), pick.zust ? '✋ ' + nm(pick.zust) : ''].filter(Boolean).join(' · '),
      lines: up.length > 1 ? up.slice(1, 5).map((d) => ({ a: shortDate(d.date) + ' ' + d.time, b: d.title + ' · ' + nm(d.member_id), act: { type: 'openEvent', id: d.id } })) : null,
      actions: [{ label: 'Termin öffnen', act: { type: 'openEvent', id: pick.id } }],
    }
  }

  if (P.intent === 'agenda' || P.intent === 'count' || P.intent === 'person') {
    const range = P.date || { from: today, to: today, label: 'heute' }
    const evs = eventsFor(ctx, { ...range, persons }).filter((e) => e.status === 'fix' && (!P.part || (mins(e.at_time) / 60 >= PART[P.part][0] && mins(e.at_time) / 60 < PART[P.part][1])))
    const multi = range.from !== range.to
    const lab = range.label === 'heute' ? 'Heute' : range.label.replace(/^./, (c) => c.toUpperCase())
    const forWhom = persons.length ? (P.kids && persons.length === (ctx.kids || []).length ? ' für die Kinder' : ' für ' + joinNames(persons.map(nm))) : ''
    let text
    if (!evs.length) text = `${lab} ist${forWhom} nichts eingetragen.`
    else if (P.intent === 'count') text = `${lab}${forWhom}: ${evs.length} ${plural(evs.length, 'Termin', 'Termine')}.`
    else if (evs.length === 1) text = `${lab}${forWhom}: ${V(evs[0]).title} um ${evs[0].at_time}${multi ? ' (' + shortDate(evs[0].on_date) + ')' : ''}.`
    else text = `${lab} stehen${forWhom} ${zahl(evs.length)} Termine an.`
    let sub = ''
    if (P.intent === 'person' && persons.length === 1) {
      const p = ctx.byId[persons[0]]
      if (p?.kind === 'kid') {
        const b = careOn(p, range.from)
        if (b.length) sub = `${b.map((x) => x.label + ' ' + x.from + '–' + x.to).join(', ')}`
      }
    }
    return {
      kind: 'agenda', eyebrow: (P.intent === 'person' ? nm(persons[0]) + ' · ' : '') + range.label, calm: !evs.length,
      text, sub,
      lines: evs.length > (P.intent === 'count' ? 0 : 1) ? evs.slice(0, 7).map((e) => line(e, multi)) : null,
      more: evs.length > 7 ? evs.length - 7 : 0,
      actions: !evs.length && !multi ? [{ label: 'Termin anlegen', act: { type: 'form', data: { title: '', member_id: persons[0] || ctx.meId, on_date: range.from, at_time: null } } }]
        : evs.length === 1 ? [{ label: 'Termin öffnen', act: { type: 'openEvent', id: evs[0].id } }] : [{ label: 'Im Kalender zeigen', act: { type: 'day', date: range.from } }],
    }
  }
  return null
}

/* ================= Erklären, Ergänzen, Beispiele ================= */

// „Verstanden“-Zeile: was die Suche aus der Eingabe gelesen hat
export function explain(P, ctx) {
  const out = []
  for (const id of P.persons) {
    if (P.kids && (ctx.kids || []).some((k) => k.id === id)) continue
    const m = ctx.byId[id]
    if (m) out.push({ type: 'person', label: m.name, color: m.color })
  }
  if (P.kids) out.push({ type: 'person', label: 'die Kinder' })
  if (P.klient) out.push({ type: 'klient', label: (ctx.klienten || []).find((k) => k.id === P.klient)?.name || 'Klientin' })
  if (P.date) out.push({ type: 'date', label: P.date.from === P.date.to && !/^(heute|morgen|übermorgen|gestern)$/.test(P.date.label) ? (P.serie ? 'ab ' : '') + shortDate(P.date.from) : P.date.label + (P.date.from === P.date.to ? ' · ' + shortDate(P.date.from) : '') })
  if (P.serie) out.push({ type: 'serie', label: 'jede Woche' })
  if (P.time) out.push({ type: 'time', label: P.time + ' Uhr' })
  else if (P.part) out.push({ type: 'time', label: P.part })
  if (P.intent === 'list') out.push({ type: 'list', label: P.list === 'einkauf' ? 'Einkaufsliste' : 'To-do-Liste' })
  if (P.intent === 'blitz') out.push({ type: 'list', label: 'Blitzzettel' })
  const iLabel = { birthday: 'Frage nach Geburtstag', where: 'Frage: wo gerade', who: 'Frage: wer übernimmt', free: 'Frage: wer hat Zeit', care: 'Frage nach Betreuung', when: 'Frage: wann', count: 'Frage: wie viele', agenda: P.isQuestion ? 'Frage nach Terminen' : null, create: 'neuer Termin' }[P.intent]
  if (iLabel) out.push({ type: 'intent', label: iLabel })
  if (P.intent === 'create' && P.title) out.push({ type: 'title', label: '„' + P.title + '“' })
  return out
}

// Autovervollständigung als „Geisterschrift“ hinter dem Getippten
export function buildVocab(index) {
  const map = new Map()
  const add = (w, weight) => {
    const n = norm(w)
    if (n.length < 3) return
    const cur = map.get(n)
    if (cur) cur.c += weight
    else map.set(n, { w, n, c: weight })
  }
  for (const d of index) {
    const wt = d.kind === 'member' ? 6 : d.kind === 'nav' ? 2 : d.kind === 'geb' ? 3 : 1
    for (const m of String(d.title).matchAll(/[A-Za-zÄÖÜäöüß0-9-]{3,}/g)) add(m[0], wt)
  }
  for (const w of ['Geburtstag', 'Betreuung', 'morgen', 'übermorgen', 'Wochenende', 'nächste', 'Einkaufsliste', 'gerade', 'heute', 'Samstag', 'Sonntag', 'Montag', 'Dienstag', 'Mittwoch', 'Donnerstag', 'Freitag']) add(w, 2)
  return [...map.values()]
}
export function complete(q, vocab) {
  if (!q || /\s$/.test(q)) return ''
  const m = q.match(/([A-Za-zÄÖÜäöüß0-9-]+)$/)
  if (!m || m[1].length < 2) return ''
  const typed = m[1]
  const pre = norm(typed)
  let best = null
  for (const v of vocab) {
    if (v.n.length <= pre.length || !v.n.startsWith(pre)) continue
    if (!best || v.c > best.c || (v.c === best.c && v.n.length < best.n.length)) best = v
  }
  if (!best) return ''
  const mm = normMap(best.w)
  const cut = mm.map[pre.length]
  return cut == null ? '' : best.w.slice(cut)
}

export function examples(db, ctx) {
  const kids = ctx.kids || []
  const k = kids[0]
  const gebs = (db.geburtstage || []).map((g) => ({ g, info: gebInfo(g.date) })).filter((x) => x.info).sort((a, b) => a.info.days - b.info.days)
  const out = []
  if (k) out.push(`Wo ist ${k.name} gerade?`)
  out.push('Was ist morgen?')
  if (gebs[0]) out.push(`Wann hat ${gebs[0].g.name} Geburtstag?`)
  if (k) out.push(`Wer holt ${k.name} heute?`)
  out.push('Wer hat Samstag um 15 Uhr Zeit?')
  out.push(`${k ? k.name : 'Freitag'} ${k ? 'Freitag ' : ''}16 Uhr Schwimmen`)
  out.push('Milch auf die Liste')
  return out
}

// Tokens für die farbige Darstellung in der Eingabe
export function paintTokens(P, ctx) {
  const segs = []
  let pos = 0
  for (const t of P.toks) {
    if (t.start > pos) segs.push({ text: P.raw.slice(pos, t.start) })
    const text = P.raw.slice(t.start, t.end)
    if (t.type === 'person' && t.value !== 'kids') segs.push({ text, cls: 'tk-person', color: ctx.byId[t.value]?.color })
    else if (t.type === 'person') segs.push({ text, cls: 'tk-person' })
    else if (t.type === 'klient') segs.push({ text, cls: 'tk-person' })
    else if (t.type === 'date') segs.push({ text, cls: 'tk-date' })
    else if (t.type === 'time') segs.push({ text, cls: 'tk-time' })
    else if (t.type === 'intent') segs.push({ text, cls: 'tk-intent' })
    else if (t.type === 'list') segs.push({ text, cls: 'tk-list' })
    else segs.push({ text })
    pos = t.end
  }
  if (pos < P.raw.length) segs.push({ text: P.raw.slice(pos) })
  return segs
}
