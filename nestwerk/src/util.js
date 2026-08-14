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

export { WD, WD_LONG, MONTHS, COLORS, iso, fromIso, wdIdx, fmtDate, fmtShort, addDays, mins, uid, gebInfo, parseIcs, mapsLink }
