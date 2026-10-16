// Bausteine für „Heute“ und den Kalender: Abreißkalender, Familienplaner, Tagesband, Als-Nächstes, Tageslage
import React, { useEffect, useLayoutEffect, useRef, useState } from 'react'
import { WD, WD_LONG, MONTHS, fromIso, wdIdx, addDays, mins, kw, holidayOn, evDur } from './util.js'
import { Icon } from './icons.jsx'

const pad = (n) => String(n).padStart(2, '0')
const hhmm = (m) => pad(Math.floor(m / 60) % 24) + ':' + pad(m % 60)
const MON_SHORT = ['Jan.', 'Feb.', 'März', 'Apr.', 'Mai', 'Juni', 'Juli', 'Aug.', 'Sept.', 'Okt.', 'Nov.', 'Dez.']

/* ================= Abreißkalender ================= */

function AbSheet({ d, land, cls, mini }) {
  const x = fromIso(d)
  const fei = holidayOn(d, land)
  const red = wdIdx(x) === 6 || !!fei
  if (mini) {
    // Handy: Monat im Farbkopf wie beim echten Abreißblock, darunter Tag und KW
    return (
      <div className={'ab-sheet' + (cls ? ' ' + cls : '')}>
        <div className="ab-mon">{MON_SHORT[x.getMonth()]}</div>
        <div className="ab-wd">{WD[wdIdx(x)]}</div>
        <div className={'ab-num' + (red ? ' red' : '')}>{x.getDate()}</div>
        <div className="ab-foot"><b>KW {kw(d)}</b></div>
      </div>
    )
  }
  return (
    <div className={'ab-sheet' + (cls ? ' ' + cls : '')}>
      <div className="ab-wd">{WD_LONG[wdIdx(x)]}</div>
      <div className={'ab-num' + (red ? ' red' : '')}>{x.getDate()}</div>
      <div className="ab-foot"><span>{MONTHS[x.getMonth()]} {x.getFullYear()}</span><b>KW {kw(d)}</b></div>
      {fei && <div className="ab-fei">{fei}</div>}
    </div>
  )
}

// Jeder Datumswechsel blättert sichtbar – egal ob per Pfeil, Wischen oder von außen:
// vorwärts reißt das Blatt ab, rückwärts fällt ein Blatt herein.
export function Abreiss({ date, today, land, onChange, mini }) {
  const [tear, setTear] = useState(null)
  const [drop, setDrop] = useState(false)
  const startX = useRef(null)
  const prev = useRef(date)
  useLayoutEffect(() => {
    const p = prev.current
    prev.current = date
    if (p === date) return
    if (date > p) { setTear({ d: p, k: Date.now() }); setDrop(false) } else { setTear(null); setDrop(true) }
  }, [date])
  useEffect(() => {
    if (!tear) return undefined
    const t = setTimeout(() => setTear(null), 620)
    return () => clearTimeout(t)
  }, [tear])
  const go = (n) => onChange(addDays(date, n))
  const sheets = (
    <div className="ab-pad" aria-live="polite">
      <AbSheet d={date} land={land} mini={mini} cls={drop ? 'drop' : ''} key={date} />
      {tear && <div className="ab-tear" key={tear.k} aria-hidden="true"><AbSheet d={tear.d} land={land} mini={mini} /></div>}
    </div>
  )
  // Klein (Handy): nur der Block – Blättern und Wischen übernimmt die Kopfzeile drumherum
  if (mini) return <div className="abreiss mini">{sheets}</div>
  return (
    <div className="abreiss"
      onPointerDown={(e) => { startX.current = e.clientX }}
      onPointerUp={(e) => {
        if (startX.current == null) return
        const dx = e.clientX - startX.current
        startX.current = null
        if (Math.abs(dx) > 44) go(dx < 0 ? 1 : -1)
      }}>
      {sheets}
      <div className="ab-nav">
        <button type="button" onClick={() => go(-1)} aria-label="Vorheriger Tag"><Icon name="chevL" size={16} /></button>
        {date === today
          ? <span className="ab-stamp">Heute</span>
          : <button type="button" onClick={() => onChange(today)}>Heute</button>}
        <button type="button" onClick={() => go(1)} aria-label="Nächster Tag – Blatt abreißen"><Icon name="chevR" size={16} /></button>
      </div>
    </div>
  )
}

/* ================= Familienplaner: eine Spalte pro Person ================= */

function layoutColumn(list) {
  const items = list
    .map((e) => ({ e, s: mins(e.at_time), en: mins(e.at_time) + Math.max(evDur(e), 30) }))
    .sort((a, b) => a.s - b.s || b.en - a.en)
  const out = []
  let cluster = []
  let clusterEnd = -1
  const flush = () => {
    const lanes = []
    for (const it of cluster) {
      let li = lanes.findIndex((end) => end <= it.s)
      if (li < 0) { li = lanes.length; lanes.push(0) }
      lanes[li] = it.en
      it.lane = li
    }
    for (const it of cluster) it.lanes = lanes.length
    out.push(...cluster)
    cluster = []
  }
  for (const it of items) {
    if (cluster.length && it.s >= clusterEnd) { flush(); clusterEnd = -1 }
    cluster.push(it)
    clusterEnd = Math.max(clusterEnd, it.en)
  }
  if (cluster.length) flush()
  return out
}

// Sichtbarer Stundenbereich: 7–21 Uhr, erweitert um alles, was an dem Tag früher oder später liegt
function dayRange(dayEvents, columns, careOn, date) {
  let startH = 7
  let endH = 21
  for (const e of dayEvents) {
    startH = Math.min(startH, Math.floor(mins(e.at_time) / 60))
    endH = Math.max(endH, Math.ceil((mins(e.at_time) + evDur(e)) / 60))
  }
  for (const m of columns) {
    for (const b of careOn(m, date)) {
      startH = Math.min(startH, Math.floor(mins(b.from) / 60))
      endH = Math.max(endH, Math.ceil(mins(b.to) / 60))
    }
  }
  startH = Math.max(0, startH)
  return [startH, Math.min(24, Math.max(endH, startH + 6))]
}

export function Planer({ date, columns, events, viewEvent, careOn, nowMin, today, byId, pins = [], onOpen, onCare, onAdd, compact, maxH, foot = true }) {
  const dayEvents = events.filter((e) => e.on_date === date && e.status !== 'declined')
  const [startH, endH] = dayRange(dayEvents, columns, careOn, date)
  const H = compact ? 38 : 46
  const bodyH = (endH - startH) * H
  const y = (m) => ((m - startH * 60) / 60) * H
  const isToday = date === today
  const showNow = isToday && nowMin != null && nowMin >= startH * 60 && nowMin <= endH * 60
  const scrollRef = useRef(null)

  useEffect(() => {
    const el = scrollRef.current
    if (!el) return
    const target = isToday && nowMin != null ? y(nowMin) - 110 : y(Math.min(...dayEvents.map((e) => mins(e.at_time)), 8 * 60)) - 40
    el.scrollTop = Math.max(0, target)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [date])

  const hours = []
  for (let h = startH; h <= endH; h++) hours.push(h)

  return (
    <div className="planer" style={{ '--cols': columns.length, '--h': H + 'px', '--body-h': bodyH + 'px', ...(maxH ? { '--pl-max': maxH + 'px' } : {}) }}>
      <div className="pl-scroll" ref={scrollRef}>
        <div className="pl-row pl-headrow">
          <div className="pl-corner" />
          {columns.map((m) => {
            const n = dayEvents.filter((e) => e.member_id === m.id).length
            return (
              <div className="pl-name" key={m.id} style={{ '--c': m.color }}>
                <span className="pl-av">{m.name[0].toUpperCase()}</span>
                <span>{m.name}</span>
                {n > 0 && <small>{n}</small>}
              </div>
            )
          })}
        </div>
        <div className="pl-row pl-bodyrow">
          <div className="pl-hours" aria-hidden="true">
            {hours.map((h) => <span key={h} style={{ top: (h - startH) * H }}>{pad(h)}:00</span>)}
          </div>
          {columns.map((m) => {
            const mine = dayEvents.filter((e) => e.member_id === m.id)
            const laid = layoutColumn(mine)
            const kid = m.kind === 'kid'
            return (
              <div key={m.id} className={'pl-col' + (kid ? ' kid' : '')} style={{ '--c': m.color }}
                title={onAdd ? `Klicken: Termin für ${m.name} eintragen` : undefined}
                onClick={(ev) => {
                  if (!onAdd || ev.target !== ev.currentTarget) return
                  const r = ev.currentTarget.getBoundingClientRect()
                  const min = startH * 60 + Math.round((((ev.clientY - r.top) / H) * 60) / 15) * 15
                  onAdd(m.id, hhmm(Math.max(0, Math.min(23 * 60 + 45, min))))
                }}>
                {careOn(m, date).map((b) => (
                  <button type="button" key={b.id} className="pl-care" style={{ top: y(mins(b.from)), height: Math.max(22, y(mins(b.to)) - y(mins(b.from))) }}
                    onClick={() => onCare && onCare(m.id)} title={`${b.label} ${b.from}–${b.to}`}>
                    <span className="pl-care-l">{b.label}<small>bis {b.to}</small></span>
                  </button>
                ))}
                {laid.map(({ e, s, en, lane, lanes }) => {
                  const v = viewEvent(e)
                  const top = y(s)
                  const height = Math.max(26, y(en) - y(s) - 2)
                  const past = isToday && nowMin != null && en <= nowMin
                  const running = isToday && nowMin != null && s <= nowMin && nowMin < en
                  const open = kid && !e.zust && !past && e.status === 'fix'
                  const cls = ['pl-ev', height < 40 ? 'short' : '', past ? 'past' : '', running ? 'now' : '', open ? 'open' : '',
                    e.status === 'pending' ? 'pending' : '', v.masked ? 'masked' : '', pins.includes(e.id) ? 'knick' : ''].filter(Boolean).join(' ')
                  return (
                    <button type="button" key={e.id} className={cls}
                      style={{ top, height, left: `calc(${lane} * 100% / ${lanes} + 3px)`, width: `calc(100% / ${lanes} - 6px)` }}
                      onClick={() => onOpen(e)}
                      title={`${e.at_time} ${v.title}${e.zust ? ' · ✋ ' + (byId[e.zust]?.name || '') : ''}`}>
                      <span className="pl-t">{e.at_time}</span>
                      <span className="pl-tt">{v.title}</span>
                      {kid && !v.masked && height >= 58 && <span className="pl-z">{e.zust ? '✋ ' + (byId[e.zust]?.name || '') : '✋ noch offen'}</span>}
                    </button>
                  )
                })}
              </div>
            )
          })}
          {showNow && <div className="pl-past" style={{ height: y(nowMin) }} />}
          {showNow && <div className="pl-now" style={{ top: y(nowMin) }}><span>{hhmm(nowMin)}</span></div>}
        </div>
      </div>
      {foot && (
        <div className="pl-foot">
          <span><i className="k-care" />Betreuung</span>
          <span><i className="k-open" />noch niemand eingeteilt</span>
          <span><i className="k-pend" />Anfrage, noch nicht bestätigt</span>
          {showNow && <span><i className="k-now" />jetzt</span>}
          {onAdd && <span style={{ marginLeft: 'auto' }}>In eine Spalte klicken: Termin eintragen</span>}
        </div>
      )}
    </div>
  )
}

/* ================= Tagesband: der Tag der ganzen Familie, eine Zeile pro Person ================= */

// Die Mini-Ausgabe des Familienplaners fürs Handy: zeigt auf einen Blick, wer wann
// belegt ist, wo Lücken sind und wo „jetzt“ ist. Antippen öffnet den großen Planer.
export function DayBand({ date, columns, events, viewEvent, careOn, nowMin, today }) {
  const dayEvents = events.filter((e) => e.on_date === date && e.status !== 'declined')
  const [startH, endH] = dayRange(dayEvents, columns, careOn, date)
  const span = (endH - startH) * 60
  const pct = (m) => Math.max(0, Math.min(100, ((m - startH * 60) / span) * 100))
  const isToday = date === today
  const showNow = isToday && nowMin != null && nowMin >= startH * 60 && nowMin <= endH * 60
  const ticks = []
  for (let h = Math.ceil((startH + 1) / 2) * 2; h < endH; h += 2) ticks.push(h)
  return (
    <div className="band" aria-hidden="true">
      <div className="band-ticks">{ticks.map((h) => <span key={h} style={{ left: pct(h * 60) + '%' }}>{h}</span>)}</div>
      {columns.map((m) => (
        <div className="band-lane" key={m.id} style={{ '--c': m.color }}>
          <span className="band-av">{m.name[0].toUpperCase()}</span>
          <div className="band-track">
            {careOn(m, date).map((b) => (
              <i key={b.id} className="bs care" style={{ left: pct(mins(b.from)) + '%', width: pct(mins(b.to)) - pct(mins(b.from)) + '%' }} />
            ))}
            {dayEvents.filter((e) => e.member_id === m.id).map((e) => {
              const s = mins(e.at_time)
              const en = s + Math.max(evDur(e), 30)
              const past = isToday && nowMin != null && en <= nowMin
              const open = m.kind === 'kid' && !e.zust && e.status === 'fix' && !past
              const cls = ['bs', e.status === 'pending' ? 'pend' : '', viewEvent(e).masked ? 'masked' : '', past ? 'past' : '', open ? 'open' : ''].filter(Boolean).join(' ')
              return <i key={e.id} className={cls} style={{ left: pct(s) + '%', width: Math.max(2.4, pct(en) - pct(s)) + '%' }} />
            })}
          </div>
        </div>
      ))}
      {showNow && <div className="band-now" style={{ '--p': pct(nowMin) / 100 }} />}
    </div>
  )
}

/* ================= Als Nächstes ================= */

export function NextCard({ ev, viewEvent, byId, nowMin, today, onOpen, onAdd }) {
  if (!ev) {
    return (
      <div className="next calm">
        <div className="eyebrow">Als Nächstes</div>
        <div className="next-title">Heute steht nichts mehr an.</div>
        <div className="next-meta">Der Rest des Tages gehört euch.</div>
        {onAdd && <button type="button" className="next-btn" onClick={onAdd}>Termin eintragen</button>}
      </div>
    )
  }
  const v = viewEvent(ev)
  const diff = ev.on_date === today ? mins(ev.at_time) - nowMin : null
  let when
  if (diff != null && diff <= 0) when = 'Jetzt'
  else if (diff != null && diff < 60) when = `in ${diff} Min.`
  else if (diff != null && diff < 12 * 60) when = `in ${Math.floor(diff / 60)} Std.${diff % 60 ? ' ' + (diff % 60) + ' Min.' : ''}`
  else when = ev.on_date === addDays(today, 1) ? 'morgen' : WD_LONG[wdIdx(fromIso(ev.on_date))]
  const who = byId[ev.member_id]
  return (
    <div className="next">
      <div className="eyebrow">Als Nächstes · {ev.at_time} Uhr</div>
      <div className="next-when">{when}</div>
      <div className="next-title">{v.title}</div>
      <div className="next-meta">{who?.name}{!v.masked && ev.zust ? ' · ✋ ' + (byId[ev.zust]?.name || '') + ' übernimmt' : ''}{!v.masked && ev.meta ? ' · ' + ev.meta : ''}</div>
      <button type="button" className="next-btn" onClick={() => onOpen(ev)}>Ansehen</button>
    </div>
  )
}

/* ================= Tageslage: der Tag in ein paar Sätzen ================= */

const ZAHL = ['keine', 'ein', 'zwei', 'drei', 'vier', 'fünf', 'sechs', 'sieben', 'acht', 'neun', 'zehn', 'elf', 'zwölf']
const zahl = (n) => (n < ZAHL.length ? ZAHL[n] : String(n))
const genitiv = (name) => (/[sßxz]$/i.test(name) ? name + '’' : name + 's')
const careWhere = (label) => {
  const l = label.toLowerCase()
  if (l.includes('schule')) return 'in der Schule'
  if (l.includes('kita') || l.includes('kindergarten') || l.includes('krippe')) return 'in der Kita'
  if (l.includes('hort') || l.includes('ogs')) return 'im Hort'
  if (l.includes('tagesmutter')) return 'bei der Tagesmutter'
  if (l.includes('oma') || l.includes('opa')) return 'bei ' + label
  return 'bei „' + label + '“'
}

export function greeting(nowMin) {
  const h = Math.floor(nowMin / 60)
  if (h < 5) return 'Gute Nacht'
  if (h < 11) return 'Guten Morgen'
  if (h < 17) return 'Hallo'
  if (h < 22) return 'Guten Abend'
  return 'Gute Nacht'
}

// Liefert Sätze aus Text-Stücken; markierte Stücke sind klickbar ({mark, warn, act})
export function buildLage({ day, today, nowMin, kids, careOn, evs, viewEvent, byId, invites, gebSorted, sportToday }) {
  const isToday = day === today
  const isTomorrow = day === addDays(today, 1)
  const dayWord = isToday ? 'Heute' : isTomorrow ? 'Morgen' : 'Am ' + WD_LONG[wdIdx(fromIso(day))]
  const name = (id) => byId[id]?.name || ''
  const fix = evs.filter((e) => e.status === 'fix')
  const n = fix.length
  const S = []

  // 1) Überblick
  let s1
  if (!n) s1 = isToday ? 'Heute ist nichts eingetragen – ein freier Tag.' : `${dayWord} ist nichts eingetragen.`
  else if (n === 1) s1 = `${dayWord} steht ein Termin an.`
  else if (n <= 3) s1 = `${dayWord} ist überschaubar: ${zahl(n)} Termine.`
  else if (n <= 6) s1 = `${dayWord} ist einiges los: ${zahl(n)} Termine.`
  else s1 = `${dayWord} ist voll: ${n} Termine.`
  const pieces = { overview: [{ text: s1 }] }

  // 2) Betreuung
  const careParts = []
  for (const k of kids) {
    const b = careOn(k, day)[0]
    if (!b) continue
    const where = careWhere(b.label)
    let txt
    if (isToday && nowMin >= mins(b.to)) txt = ` war bis ${b.to} ${where}`
    else if (isToday && nowMin >= mins(b.from)) txt = ` ist gerade ${where}, bis ${b.to}`
    else txt = ` ist ${b.from}–${b.to} ${where}`
    careParts.push([{ text: k.name, who: k.color }, { text: txt }])
  }
  if (careParts.length) {
    const seg = []
    careParts.forEach((p, i) => {
      if (i > 0) seg.push({ text: i === careParts.length - 1 ? ' und ' : ', ' })
      seg.push(...p)
    })
    seg.push({ text: '.' })
    pieces.care = seg
  }

  // 3) Als Nächstes
  const upcoming = isToday ? fix.filter((e) => mins(e.at_time) + 15 >= nowMin) : fix
  const nx = upcoming[0]
  if (nx) {
    const v = viewEvent(nx)
    const kid = byId[nx.member_id]?.kind === 'kid'
    const label = `um ${nx.at_time} ${v.title}${kid ? ' mit ' + name(nx.member_id) : ''}`
    pieces.next = [
      { text: isToday ? 'Als Nächstes: ' : 'Los geht es ' },
      { text: label, mark: true, act: { type: 'openEvent', id: nx.id } },
      { text: !v.masked && nx.zust ? ` – ${name(nx.zust)} übernimmt.` : '.' },
    ]
  }

  // 4) Offene Kindertermine
  const open = fix.filter((e) => byId[e.member_id]?.kind === 'kid' && !e.zust && (!isToday || mins(e.at_time) >= nowMin))
  if (open.length === 1) {
    const e = open[0]
    pieces.open = [{ text: `Für ${genitiv(name(e.member_id))} ${viewEvent(e).title} um ${e.at_time} ist ` }, { text: 'noch niemand eingeteilt', mark: true, warn: true, act: { type: 'openEvent', id: e.id } }, { text: '.' }]
  } else if (open.length > 1) {
    pieces.open = [{ text: `Für ${zahl(open.length)} Kindertermine ist ` }, { text: 'noch niemand eingeteilt', mark: true, warn: true, act: { type: 'openEvent', id: open[0].id } }, { text: '.' }]
  }

  // 5) Anfragen
  if (isToday && invites > 0) {
    pieces.inv = [{ text: invites === 1 ? 'Eine Anfrage wartet' : `${zahl(invites).replace(/^./, (c) => c.toUpperCase())} Anfragen warten`, mark: true, act: { type: 'invites' } }, { text: ' auf deine Antwort.' }]
  }

  // 6) Geburtstage
  const g = isToday ? gebSorted.find((x) => x.info && x.info.days <= 2) : gebSorted.find((x) => x.info && x.info.days === Math.round((fromIso(day) - fromIso(today)) / 86400000))
  if (g) {
    const rel = isToday ? (g.info.days === 0 ? 'Heute' : g.info.days === 1 ? 'Morgen' : 'Übermorgen') : dayWord
    pieces.geb = g.info.age != null && g.info.days > 0
      ? [{ text: `${rel} wird ` }, { text: `${g.g.name} ${g.info.age}`, mark: true, act: { type: 'openWa', id: g.g.id } }, { text: '.' }]
      : [{ text: `${rel} hat ` }, { text: g.g.name, mark: true, act: { type: 'openWa', id: g.g.id } }, { text: ' Geburtstag.' }]
  }

  // 7) Eigener Sport
  if (sportToday && !sportToday.done && (!isToday || mins(sportToday.at_time) >= nowMin)) {
    pieces.sport = [{ text: `Und um ${sportToday.at_time} wartet ${sportToday.title} – dein Ausgleich.` }]
  }

  // Höchstens vier Sätze: der Überblick plus die drei wichtigsten
  const prio = ['open', 'inv', 'next', 'geb', 'care', 'sport'].filter((k) => pieces[k]).slice(0, 3)
  for (const k of ['overview', 'care', 'next', 'open', 'inv', 'geb', 'sport']) {
    if (k === 'overview' || prio.includes(k)) S.push(pieces[k])
  }
  return S
}
