// Die Suche: ein Feld für alles – finden, fragen, eintragen.
import React, { useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react'
import { search, buildVocab, complete, explain, examples, paintTokens, longDate, relDay } from './search.js'
import { Icon } from './icons.jsx'
import { gebInfo } from './util.js'

const RECENT_KEY = 'eselsohr-suche-zuletzt'
function loadRecent() { try { return JSON.parse(localStorage.getItem(RECENT_KEY) || '[]') } catch { return [] } }
function saveRecent(list) { try { localStorage.setItem(RECENT_KEY, JSON.stringify(list.slice(0, 6))) } catch { /* Speicher gesperrt */ } }

const KIND_ICON = { event: 'calendar', care: 'school', geb: 'gift', member: 'user', klient: 'heart', item: 'list', zettel: 'bolt', nav: 'arrow', palace: 'landmark', recent: 'clock', next: 'clock' }
const KIND_LABEL = { event: 'Termin', care: 'Betreuung', geb: 'Geburtstag', member: 'Familie', klient: 'Klientin', item: 'Listenpunkt', zettel: 'Blitzzettel', nav: 'Bereich', action: 'Aktion', palace: 'Gedächtnispalast', answer: 'Antwort' }

function Hl({ text, ranges }) {
  if (!ranges || !ranges.length) return text
  const out = []
  let pos = 0
  ranges.forEach(([s, e], i) => {
    if (s < pos) return
    if (s > pos) out.push(text.slice(pos, s))
    out.push(<mark className="pal-hl" key={i}>{text.slice(s, e)}</mark>)
    pos = e
  })
  out.push(text.slice(pos))
  return out
}

export function Suche({ initial = '', onClose, db, index, ctx, api, palace }) {
  const [q, setQ] = useState(initial)
  const [active, setActive] = useState(0)
  const [recent, setRecent] = useState(loadRecent)
  const [touched, setTouched] = useState(false)
  const inputRef = useRef(null)
  const mirrorRef = useRef(null)
  const listRef = useRef(null)

  const vocab = useMemo(() => buildVocab(index), [index])
  const res = useMemo(() => search(q, index, ctx), [q, index, ctx])
  const ghost = useMemo(() => complete(q, vocab), [q, vocab])
  const chips = useMemo(() => (q.trim() ? explain(res.parse, ctx) : []), [res, ctx, q])
  const segs = useMemo(() => paintTokens(res.parse, ctx), [res, ctx])
  const palaceHits = useMemo(() => (palace && q.trim().length >= 2 ? palace.search(q) : null), [palace, q])
  const ex = useMemo(() => examples(db, ctx), [db, ctx])

  // Alles, was sich mit ↑ ↓ ansteuern lässt, in Anzeigereihenfolge
  const sections = useMemo(() => {
    const out = []
    if (!q.trim()) {
      if (recent.length) out.push({ label: 'Zuletzt gesucht', items: recent.map((t) => ({ key: 'r:' + t, kind: 'recent', title: t, sub: 'Noch einmal suchen', act: { type: 'fill', q: t } })) })
      const soon = (db.events || [])
        .filter((e) => e.status === 'fix' && (e.on_date > ctx.today || (e.on_date === ctx.today && e.at_time.localeCompare(ctx.nowTime) >= 0)))
        .sort((a, b) => a.on_date.localeCompare(b.on_date) || a.at_time.localeCompare(b.at_time))
        .slice(0, 4)
      if (soon.length) out.push({ label: 'Als Nächstes', items: soon.map((e) => { const v = ctx.viewEvent(e); return { key: 'n:' + e.id, kind: 'event', title: v.title, sub: `${relDay(ctx.today, e.on_date)} · ${e.at_time} · ${ctx.byId[e.member_id]?.name || ''}`, color: ctx.byId[e.member_id]?.color, doc: { kind: 'event', ev: e, masked: v.masked, title: v.title, date: e.on_date, time: e.at_time, member_id: e.member_id }, act: { type: 'openEvent', id: e.id } } }) })
      return out
    }
    const acts = res.actions.map((a) => ({ ...a, kind: 'action' }))
    const actFirst = acts.some((a) => a.primary || a.act.type === 'list' || a.act.type === 'blitz')
    if (res.answer) out.push({ label: null, answer: res.answer, items: res.answer.actions?.length ? [{ key: 'answer', kind: 'answer', title: res.answer.text, act: res.answer.actions[0].act }] : [] })
    if (acts.length && actFirst) out.push({ label: 'Erledigen', items: acts })
    for (const g of res.groups.filter((x) => x.kind !== 'nav')) out.push({ label: g.label, total: g.total, items: g.items })
    if (palaceHits && palaceHits.length) out.push({ label: 'Gedächtnispalast', items: palaceHits })
    else if (!palace && ctx.me.kind !== 'kid' && q.trim().length >= 2 && !res.parse.isQuestion && res.parse.intent !== 'create' && res.parse.intent !== 'list' && res.parse.intent !== 'blitz') {
      out.push({ label: 'Gedächtnispalast', items: [{ key: 'palace', kind: 'palace', title: `Im Gedächtnispalast nach „${q.trim()}“ suchen`, sub: 'Verschlüsselt – Eselsohr schaut erst hinein, wenn du ihn öffnest', act: { type: 'palace', q: q.trim() } }] })
    }
    if (acts.length && !actFirst) out.push({ label: 'Erledigen', items: acts })
    const nav = res.groups.find((x) => x.kind === 'nav')
    if (nav) out.push({ label: nav.label, items: nav.items })
    return out
  }, [q, res, recent, palace, palaceHits, db, ctx])
  const rows = useMemo(() => sections.flatMap((s) => s.items), [sections])

  useEffect(() => { setActive(0); setTouched(false) }, [q])
  useEffect(() => { inputRef.current?.focus() }, [])
  useLayoutEffect(() => { if (mirrorRef.current && inputRef.current) mirrorRef.current.scrollLeft = inputRef.current.scrollLeft })
  useEffect(() => {
    const el = listRef.current?.querySelector('[data-on="1"]')
    el?.scrollIntoView({ block: 'nearest' })
  }, [active])

  function remember(text) {
    const t = text.trim()
    if (!t) return
    const next = [t, ...recent.filter((x) => x !== t)].slice(0, 6)
    setRecent(next)
    saveRecent(next)
  }

  function run(item) {
    if (!item || !item.act) return
    const a = item.act
    if (a.type === 'fill') { setQ(a.q); inputRef.current?.focus(); return }
    remember(q)
    const keepOpen = api.run(a, item)
    if (!keepOpen) onClose()
  }

  function onKey(e) {
    if (e.key === 'ArrowDown') { e.preventDefault(); setTouched(true); setActive((i) => (rows.length ? (touched || q.trim() ? (i + 1) % rows.length : 0) : 0)) }
    else if (e.key === 'ArrowUp') { e.preventDefault(); setTouched(true); setActive((i) => (rows.length ? (i - 1 + rows.length) % rows.length : 0)) }
    else if (e.key === 'Enter') { e.preventDefault(); run(rows[active]) }
    else if ((e.key === 'Tab' || (e.key === 'ArrowRight' && inputRef.current.selectionStart === q.length)) && ghost) { e.preventDefault(); setQ(q + ghost) }
    else if (e.key === 'Escape') { e.preventDefault(); if (q) setQ(''); else onClose() }
  }

  const cur = rows[active]
  let idx = -1
  const rowEl = (it) => {
    idx++
    const i = idx
    const on = i === active
    if (it.kind === 'answer') return null
    const icon = it.icon || KIND_ICON[it.kind] || 'arrow'
    return (
      <div key={it.key} id={'pal-' + i} role="option" aria-selected={on} data-on={on ? '1' : '0'}
        className={'pal-row' + (on && (touched || q.trim()) ? ' on' : '')} onMouseMove={() => { setTouched(true); if (!on) setActive(i) }} onClick={() => run(it)}>
        <span className="rowico" style={it.color ? { background: `color-mix(in oklab, ${it.color} 18%, var(--sheet))`, color: `color-mix(in oklab, ${it.color} 75%, var(--ink))` } : undefined}>
          <Icon name={icon} size={17} />
        </span>
        <div className="pr-main">
          <div className="pr-t"><Hl text={it.title} ranges={it.hl?.title} /></div>
          {it.sub && <div className="pr-s"><Hl text={it.sub} ranges={it.hl?.sub} /></div>}
        </div>
        {it.right && <span className="pr-r">{it.right}</span>}
        <span className="pr-enter"><kbd>↵</kbd></span>
      </div>
    )
  }

  const answerIdx = rows.findIndex((r) => r.kind === 'answer')

  return (
    <div className="pal-scrim" onMouseDown={(e) => { if (e.target === e.currentTarget) onClose() }}>
      <div className="pal" role="dialog" aria-modal="true" aria-label="Suchen, fragen, eintragen">
        <div className="pal-in">
          <Icon name="search" size={21} />
          <div className="pal-field">
            <div className="pal-mirror" ref={mirrorRef} aria-hidden="true">
              {segs.map((s, i) => (
                <span key={i} className={s.cls} style={s.color ? { '--c': s.color } : undefined}>{s.text}</span>
              ))}
              {ghost && <span className="ghost">{ghost}</span>}
            </div>
            <input ref={inputRef} className="pal-input" id="suche-eingabe" value={q} autoComplete="off" spellCheck={false}
              placeholder="Suchen, fragen oder eintragen …"
              role="combobox" aria-expanded="true" aria-controls="pal-list" aria-activedescendant={rows.length ? 'pal-' + active : undefined}
              onChange={(e) => setQ(e.target.value)} onKeyDown={onKey}
              onScroll={(e) => { if (mirrorRef.current) mirrorRef.current.scrollLeft = e.currentTarget.scrollLeft }} />
          </div>
          {q && <button type="button" className="pal-clear" onClick={() => { setQ(''); inputRef.current?.focus() }} aria-label="Eingabe leeren"><Icon name="x" size={15} /></button>}
          <kbd>Esc</kbd>
        </div>

        {chips.length > 0 && (
          <div className="pal-chips" aria-live="polite">
            <span>Verstanden:</span>
            {chips.map((c, i) => (
              <span key={i} className={'chip' + (c.type === 'intent' ? '' : ' brand')}>
                {c.color && <i className="dot" style={{ background: c.color }} />}{c.label}
              </span>
            ))}
          </div>
        )}

        <div className="pal-body">
          <div className="pal-list" id="pal-list" role="listbox" ref={listRef}>
            {!q.trim() && (
              <div className="pal-empty">
                <div className="pal-gh">Probier mal</div>
                <div className="pal-ex">
                  {ex.map((t) => <button type="button" key={t} onClick={() => { setQ(t); inputRef.current?.focus() }}>{t}</button>)}
                </div>
              </div>
            )}
            {sections.map((s, si) => {
              if (s.answer) {
                const on = active === answerIdx && answerIdx >= 0
                if (answerIdx >= 0) idx++
                const A = s.answer
                return (
                  <div key="answer" id={answerIdx >= 0 ? 'pal-' + answerIdx : undefined} role="option" aria-selected={on} data-on={on ? '1' : '0'}
                    className={'pal-answer' + (A.calm ? ' calm' : '') + (on ? ' on' : '')}
                    onMouseMove={() => { if (answerIdx >= 0 && !on) setActive(answerIdx) }}>
                    <div className="eyebrow">{A.eyebrow}</div>
                    <div className="pa-text">{A.text}</div>
                    {A.sub && <div className="pa-sub">{A.sub}</div>}
                    {A.lines && (
                      <ul className="pa-lines">
                        {A.lines.map((l, i) => <li key={i}><b>{l.a}</b><span>{l.b}</span></li>)}
                        {A.more > 0 && <li><b>…</b><span>und {A.more} weitere</span></li>}
                      </ul>
                    )}
                    {A.actions?.length > 0 && (
                      <div className="pa-act">
                        {A.actions.map((b, i) => (
                          <button type="button" key={i} className={b.alt ? 'alt' : ''} onClick={() => run({ act: b.act })}>
                            {b.label}{i === 0 && on ? ' ↵' : ''}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                )
              }
              return (
                <div key={si} className="pal-group">
                  {s.label && <div className="pal-gh">{s.label}{s.total > s.items.length && <span>{s.items.length} von {s.total}</span>}</div>}
                  {s.items.map(rowEl)}
                </div>
              )
            })}
            {q.trim() && !rows.length && !res.answer && (
              <div className="pal-empty">
                <p className="pv-s" style={{ marginTop: 6 }}>Nichts gefunden zu „{q.trim()}“. Eselsohr sucht in Terminen, Listen, Geburtstagen, Blitzzetteln und Betreuungszeiten – auch mit Tippfehlern.</p>
                <div className="pal-ex">
                  <button type="button" onClick={() => run({ act: { type: 'form', data: { title: q.trim(), member_id: ctx.meId, on_date: ctx.today, at_time: null } } })}>„{q.trim()}“ als Termin anlegen</button>
                  <button type="button" onClick={() => run({ act: { type: 'blitz', text: q.trim() } })}>Als Blitzzettel festhalten</button>
                </div>
              </div>
            )}
          </div>
          <div className="pal-prev" aria-live="polite">
            <Vorschau item={!q.trim() && !touched ? null : cur} q={q} ctx={ctx} db={db} run={run} ex={ex} chips={chips} answer={res.answer} setQ={(t) => { setQ(t); inputRef.current?.focus() }} />
          </div>
        </div>

        <div className="pal-foot">
          <span><kbd>↑</kbd><kbd>↓</kbd> wählen</span>
          <span><kbd>↵</kbd> ausführen</span>
          <span><kbd>Tab</kbd> ergänzen</span>
          <span className="pf-priv"><Icon name="lock" size={13} /> Durchsucht nur, was du sehen darfst</span>
        </div>
      </div>
    </div>
  )
}

function Fact({ k, children }) {
  return <div className="fact"><b>{k}</b><span>{children}</span></div>
}

function Vorschau({ item, q, ctx, db, run, ex, chips, answer, setQ }) {
  const nm = (id) => ctx.byId[id]?.name || '—'
  if (!q.trim() && (!item || item.kind === 'recent')) {
    return (
      <div>
        <div className="pv-k">Ein Feld für alles</div>
        <div className="pv-t">Frag einfach – wie du es einem Menschen sagen würdest.</div>
        <p className="pv-s">Eselsohr versteht Namen, Tage und Uhrzeiten und verzeiht Tippfehler.</p>
        <div className="pv-facts">
          <Fact k="Fragen">Wo ist {ctx.kids?.[0]?.name || 'Emma'} gerade? · Wer hat Samstag Zeit? · Was ist morgen?</Fact>
          <Fact k="Eintragen">Ben Dienstag 17 Uhr Fußball · jeden Freitag 15:30 Klavier</Fact>
          <Fact k="Listen">Milch auf die Liste · Todo: Steuer</Fact>
          <Fact k="Notieren">Notiz: Reifen wechseln</Fact>
        </div>
        <div className="pv-acts">{ex.slice(0, 2).map((t) => <button key={t} type="button" className="btn ghost sm" onClick={() => setQ(t)}>{t}</button>)}</div>
      </div>
    )
  }
  if (!item) return <div className="pv-s">Wähle einen Treffer, um Details zu sehen.</div>
  const label = KIND_LABEL[item.kind] || 'Treffer'
  const d = item.doc
  if (item.kind === 'answer') {
    return (
      <div>
        <div className="pv-k">So habe ich dich verstanden</div>
        <div className="pv-facts">
          {chips.map((c, i) => (
            <Fact key={i} k={{ person: 'Person', klient: 'Klientin', date: 'Tag', time: 'Uhrzeit', serie: 'Rhythmus', list: 'Ziel', intent: 'Frage', title: 'Titel' }[c.type] || 'Hinweis'}>{c.label}</Fact>
          ))}
          <Fact k="Stand">heute, {ctx.nowTime} Uhr</Fact>
        </div>
        <p className="pv-s">{answer?.lines?.length ? 'Die Details stehen links in der Antwort.' : 'Enter führt die Aktion in der Antwort aus.'} Mit ↓ kommst du zu den einzelnen Einträgen.</p>
      </div>
    )
  }
  if (item.kind === 'event' && d) {
    const e = d.ev
    const v = ctx.viewEvent(e)
    const kidOpen = ctx.byId[e.member_id]?.kind === 'kid' && !e.zust && ctx.me.kind !== 'kid'
    return (
      <div>
        <div className="pv-k">{label}{e.status === 'pending' ? ' · wartet auf Zusage' : ''}</div>
        <div className="pv-t">{v.title}</div>
        <p className="pv-s">{relDay(ctx.today, e.on_date).replace(/^./, (c) => c.toUpperCase())} · {longDate(e.on_date)}</p>
        <div className="pv-facts">
          <Fact k="Uhrzeit">{e.at_time} Uhr</Fact>
          <Fact k="Für">{nm(e.member_id)}</Fact>
          {!v.masked && ctx.byId[e.member_id]?.kind === 'kid' && <Fact k="Übernimmt">{e.zust ? nm(e.zust) : 'noch offen'}</Fact>}
          {!v.masked && e.meta && <Fact k="Notiz">{e.meta}</Fact>}
          {v.masked && <Fact k="Details">privat – nicht mehr Infos als nötig</Fact>}
        </div>
        <div className="pv-acts">
          <button type="button" className="btn sm" onClick={() => run(item)}>Öffnen</button>
          {kidOpen && <button type="button" className="btn ghost sm" onClick={() => run({ act: { type: 'claim', id: e.id } })}>Ich übernehme</button>}
          <button type="button" className="btn ghost sm" onClick={() => run({ act: { type: 'day', date: e.on_date } })}>Im Kalender</button>
        </div>
      </div>
    )
  }
  if (item.kind === 'geb' && d) {
    const info = gebInfo(d.geb.date)
    return (
      <div>
        <div className="pv-k">{label}</div>
        <div className="pv-t">{d.geb.name}</div>
        <p className="pv-s">{info ? (info.days === 0 ? 'Heute!' : info.days === 1 ? 'Morgen' : `In ${info.days} Tagen`) : ''}{info?.age != null ? ` · wird ${info.age}` : ''}</p>
        <div className="pv-facts"><Fact k="Datum">{d.geb.date}</Fact>{d.geb.tel && <Fact k="Handy">{d.geb.tel}</Fact>}</div>
        <div className="pv-acts"><button type="button" className="btn sm" onClick={() => run(item)}>WhatsApp-Glückwunsch</button></div>
      </div>
    )
  }
  if (item.kind === 'care' && d) {
    return (
      <div>
        <div className="pv-k">{label}</div>
        <div className="pv-t">{d.title}</div>
        <p className="pv-s">{d.sub}</p>
        <div className="pv-acts"><button type="button" className="btn sm" onClick={() => run(item)}>Zeiten bearbeiten</button></div>
      </div>
    )
  }
  if (item.kind === 'member' && d) {
    const m = d.member
    const evs = (db.events || []).filter((e) => e.member_id === m.id && e.on_date >= ctx.today && e.status === 'fix').sort((a, b) => a.on_date.localeCompare(b.on_date) || a.at_time.localeCompare(b.at_time))
    return (
      <div>
        <div className="pv-k">{label}</div>
        <div className="pv-t">{m.name}</div>
        <p className="pv-s">{m.kind === 'kid' ? 'Kind' : 'Erwachsen'} · {evs.length} kommende {evs.length === 1 ? 'Termin' : 'Termine'}</p>
        {evs[0] && <div className="pv-facts"><Fact k="Als Nächstes">{relDay(ctx.today, evs[0].on_date)} · {evs[0].at_time} · {ctx.viewEvent(evs[0]).title}</Fact></div>}
        <div className="pv-acts"><button type="button" className="btn sm" onClick={() => run(item)}>{m.name}s Kalender</button></div>
      </div>
    )
  }
  if (item.kind === 'action') {
    const a = item.act
    return (
      <div>
        <div className="pv-k">Erledigen</div>
        <div className="pv-t">{item.title}</div>
        <p className="pv-s">{item.sub}</p>
        {a.type === 'create' && (
          <div className="pv-facts">
            <Fact k="Was">{a.data.title}</Fact>
            <Fact k="Für">{nm(a.data.member_id)}</Fact>
            <Fact k="Wann">{longDate(a.data.on_date)} · {a.data.at_time} Uhr</Fact>
            {a.data.serie && <Fact k="Serie">jede Woche, 8 Wochen</Fact>}
          </div>
        )}
        <p className="hint">Enter führt das aus. Rückgängig geht jederzeit im Kalender oder über den Papierkorb.</p>
      </div>
    )
  }
  return (
    <div>
      <div className="pv-k">{label}</div>
      <div className="pv-t">{item.title}</div>
      {item.sub && <p className="pv-s">{item.sub}</p>}
      <div className="pv-acts"><button type="button" className="btn sm" onClick={() => run(item)}>Öffnen</button></div>
    </div>
  )
}
