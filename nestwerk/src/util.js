// Gemeinsame Helfer: Datum, Ids, Parser – ohne UI
/* ================= Helfer ================= */

const WD = ['Mo', 'Di', 'Mi', 'Do', 'Fr', 'Sa', 'So']
const WD_LONG = ['Montag', 'Dienstag', 'Mittwoch', 'Donnerstag', 'Freitag', 'Samstag', 'Sonntag']
const MONTHS = ['Januar', 'Februar', 'März', 'April', 'Mai', 'Juni', 'Juli', 'August', 'September', 'Oktober', 'November', 'Dezember']
const COLORS = ['#3D7BFF', '#FF5D73', '#FFB02E', '#2FBF71', '#8B5CF6', '#FF7A3D', '#00B8C4', '#E5484D']

const iso = (d) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
const fromIso = (s) => new Date(+s.slice(0, 4), +s.slice(5, 7) - 1, +s.slice(8, 10))
const wdIdx = (d) => (d.getDay() + 6) % 7
const fmtDate = (s) => { const d = fromIso(s); return `${WD_LONG[wdIdx(d)]}, ${d.getDate()}. ${MONTHS[d.getMonth()]}` }
const fmtShort = (s) => { const d = fromIso(s); return `${WD[wdIdx(d)]} ${d.getDate()}.${d.getMonth() + 1}.` }
const addDays = (s, n) => { const d = fromIso(s); d.setDate(d.getDate() + n); return iso(d) }
const mins = (t) => +t.slice(0, 2) * 60 + +t.slice(3, 5)
const uid = () => (crypto.randomUUID ? crypto.randomUUID() : String(Math.random()).slice(2))

/* Kalenderwoche nach ISO 8601 – so steht sie in jedem deutschen Kalender */
function kw(dateStr) {
  const d = fromIso(dateStr)
  const t = new Date(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate()))
  t.setUTCDate(t.getUTCDate() + 4 - (t.getUTCDay() || 7))
  const y0 = new Date(Date.UTC(t.getUTCFullYear(), 0, 1))
  return Math.ceil(((t - y0) / 86400000 + 1) / 7)
}

/* Ostersonntag (Gaußsche Osterformel, gregorianisch) */
function easter(y) {
  const a = y % 19, b = Math.floor(y / 100), c = y % 100
  const d = Math.floor(b / 4), e = b % 4, f = Math.floor((b + 8) / 25), g = Math.floor((b - f + 1) / 3)
  const h = (19 * a + b - d - g + 15) % 30, i = Math.floor(c / 4), k = c % 4
  const l = (32 + 2 * e + 2 * i - h - k) % 7, m = Math.floor((a + 11 * h + 22 * l) / 451)
  const month = Math.floor((h + l - 7 * m + 114) / 31), day = ((h + l - 7 * m + 114) % 31) + 1
  return iso(new Date(y, month - 1, day))
}

const LAENDER = {
  BW: 'Baden-Württemberg', BY: 'Bayern', BE: 'Berlin', BB: 'Brandenburg', HB: 'Bremen', HH: 'Hamburg',
  HE: 'Hessen', MV: 'Mecklenburg-Vorpommern', NI: 'Niedersachsen', NW: 'Nordrhein-Westfalen', RP: 'Rheinland-Pfalz',
  SL: 'Saarland', SN: 'Sachsen', ST: 'Sachsen-Anhalt', SH: 'Schleswig-Holstein', TH: 'Thüringen',
}

/* Gesetzliche Feiertage je Bundesland (bundesweite + landesweite, ohne rein örtliche) */
const holidayCache = {}
function holidays(year, land = 'NW') {
  const key = year + land
  if (holidayCache[key]) return holidayCache[key]
  const e = easter(year)
  const fix = (m, d) => `${year}-${String(m).padStart(2, '0')}-${String(d).padStart(2, '0')}`
  const h = {
    [fix(1, 1)]: 'Neujahr',
    [addDays(e, -2)]: 'Karfreitag',
    [addDays(e, 1)]: 'Ostermontag',
    [fix(5, 1)]: 'Tag der Arbeit',
    [addDays(e, 39)]: 'Christi Himmelfahrt',
    [addDays(e, 50)]: 'Pfingstmontag',
    [fix(10, 3)]: 'Tag der Deutschen Einheit',
    [fix(12, 25)]: '1. Weihnachtstag',
    [fix(12, 26)]: '2. Weihnachtstag',
  }
  const add = (lands, date, name) => { if (lands.includes(land)) h[date] = name }
  add(['BW', 'BY', 'ST'], fix(1, 6), 'Heilige Drei Könige')
  add(['BE', 'MV'], fix(3, 8), 'Frauentag')
  add(['BW', 'BY', 'HE', 'NW', 'RP', 'SL'], addDays(e, 60), 'Fronleichnam')
  add(['SL'], fix(8, 15), 'Mariä Himmelfahrt')
  add(['TH'], fix(9, 20), 'Weltkindertag')
  add(['BB', 'HB', 'HH', 'MV', 'NI', 'SN', 'ST', 'SH', 'TH'], fix(10, 31), 'Reformationstag')
  add(['BW', 'BY', 'NW', 'RP', 'SL'], fix(11, 1), 'Allerheiligen')
  if (land === 'SN') {
    const d = new Date(year, 10, 22)
    while (d.getDay() !== 3) d.setDate(d.getDate() - 1)
    h[iso(d)] = 'Buß- und Bettag'
  }
  return (holidayCache[key] = h)
}
const holidayOn = (dateStr, land) => holidays(+dateStr.slice(0, 4), land)[dateStr] || null

/* Dauer eines Termins in Minuten: eigene Angabe, Praxis-Soll, „bis 17:00“ aus Arbeitsterminen, sonst 1 Stunde */
function evDur(e) {
  if (e.dur) return +e.dur
  if (e.soll) return +e.soll
  const m = String(e.meta || '').match(/bis (\d{1,2}):(\d{2})/)
  if (m) { const d = +m[1] * 60 + +m[2] - mins(e.at_time); if (d > 0) return d }
  return 60
}

/* Geburtstag: „16.08.1978“ oder „16.08.“ → Alter und Countdown */
function gebInfo(s) {
  const m = String(s || '').trim().match(/^(\d{1,2})\.(\d{1,2})\.?(\d{4})?$/)
  if (!m) return null
  const now = new Date()
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate())
  let next = new Date(now.getFullYear(), +m[2] - 1, +m[1])
  if (next < today) next = new Date(now.getFullYear() + 1, +m[2] - 1, +m[1])
  const days = Math.round((next - today) / 86400000)
  return { days, age: m[3] ? next.getFullYear() - +m[3] : null }
}

// Einfacher ICS-Parser (Outlook/Office365-Export): DTSTART/DTEND/SUMMARY/LOCATION
function parseIcs(text) {
  const unfold = text.replace(/\r/g, '').replace(/\n[ \t]/g, '')
  const out = []
  for (const block of unfold.split('BEGIN:VEVENT').slice(1)) {
    const get = (k) => {
      const m = block.match(new RegExp('(?:^|\\n)' + k + '[^:\\n]*:([^\\n]*)'))
      return m ? m[1].trim().replace(/\\,/g, ',').replace(/\\n/gi, ' · ') : ''
    }
    const ds = get('DTSTART')
    if (!/^\d{8}/.test(ds)) continue
    const toLocal = (v) => {
      if (v.length <= 8) return { d: new Date(+v.slice(0, 4), +v.slice(4, 6) - 1, +v.slice(6, 8)), allday: true }
      const y = +v.slice(0, 4), mo = +v.slice(4, 6) - 1, dd = +v.slice(6, 8), h = +v.slice(9, 11), mi = +v.slice(11, 13)
      return { d: v.endsWith('Z') ? new Date(Date.UTC(y, mo, dd, h, mi)) : new Date(y, mo, dd, h, mi), allday: false }
    }
    const start = toLocal(ds)
    const de = get('DTEND')
    const end = /^\d{8}/.test(de) ? toLocal(de) : null
    const pad = (n) => String(n).padStart(2, '0')
    out.push({
      date: `${start.d.getFullYear()}-${pad(start.d.getMonth() + 1)}-${pad(start.d.getDate())}`,
      time: start.allday ? '09:00' : `${pad(start.d.getHours())}:${pad(start.d.getMinutes())}`,
      end: end && !end.allday ? `${pad(end.d.getHours())}:${pad(end.d.getMinutes())}` : '',
      title: get('SUMMARY') || 'Arbeitstermin',
      loc: get('LOCATION'),
    })
  }
  return out
}

const mapsLink = (adresse) => 'https://www.google.com/maps/search/?api=1&query=' + encodeURIComponent(adresse)

export { WD, WD_LONG, MONTHS, COLORS, iso, fromIso, wdIdx, fmtDate, fmtShort, addDays, mins, uid, gebInfo, parseIcs, mapsLink, kw, easter, holidays, holidayOn, LAENDER, evDur }
