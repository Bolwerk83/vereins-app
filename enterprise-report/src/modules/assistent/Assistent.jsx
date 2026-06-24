// =========================================================================
//  ASSISTENT — Chat-Oberfläche für die lokale, KI-freie Frage-Antwort-Engine.
//  Beantwortet Fragen zu den Kennzahlen aus den echten Werten (localAssistant),
//  komplett offline. Zeigt Antwort + anklickbare Folgefragen.
// =========================================================================
import React, { useState, useRef, useEffect } from 'react'
import { beantworte, ASSISTENT_TIPPS } from '../../core/localAssistant.js'
import { ladeHistorie } from '../../core/dataProvider.js'
import { KiStatusBadge } from '../../components/KiGate.jsx'

const card = { background: 'var(--panel)', border: '1px solid var(--line)', borderRadius: 'var(--radius)', boxShadow: 'var(--shadow)' }

// Mini-Markdown: **fett**, _kursiv_, Zeilenumbrüche, • Aufzählung.
function inline(line, key) {
  const teile = []
  const re = /(\*\*[^*]+\*\*|_[^_]+_)/g
  let last = 0, m
  while ((m = re.exec(line))) {
    if (m.index > last) teile.push(line.slice(last, m.index))
    const t = m[0]
    if (t.startsWith('**')) teile.push(<b key={teile.length}>{t.slice(2, -2)}</b>)
    else teile.push(<i key={teile.length} style={{ color: 'var(--muted)' }}>{t.slice(1, -1)}</i>)
    last = m.index + t.length
  }
  if (last < line.length) teile.push(line.slice(last))
  return <span key={key}>{teile}</span>
}
function MD({ text }) {
  return <>{text.split('\n').map((l, i) => (l.trim() === '' ? <div key={i} style={{ height: 6 }} /> : <div key={i} style={{ lineHeight: 1.5 }}>{inline(l, i)}</div>))}</>
}

export default function Assistent({ rolle, werte = {} }) {
  const [verlauf, setVerlauf] = useState([
    { von: 'bot', text: 'Hallo! Ich bin dein **lokaler Kennzahlen-Assistent** — komplett offline, ohne KI-Cloud und ohne Datenweitergabe. Frag mich nach Werten, Definitionen, Zielen, Trends, Ursachen oder Maßnahmen.', vorschlaege: ASSISTENT_TIPPS },
  ])
  const [text, setText] = useState('')
  const [denkt, setDenkt] = useState(false)
  const endeRef = useRef(null)
  useEffect(() => { endeRef.current?.scrollIntoView({ behavior: 'smooth' }) }, [verlauf, denkt])

  async function frag(frage) {
    const q = (frage ?? text).trim()
    if (!q || denkt) return
    setText('')
    setVerlauf((v) => [...v, { von: 'user', text: q }])
    setDenkt(true)
    const antwort = await beantworte(q, { werte, rolle, ladeHistorie })
    setVerlauf((v) => [...v, { von: 'bot', text: antwort.text, vorschlaege: antwort.vorschlaege, intent: antwort.intent }])
    setDenkt(false)
  }

  return (
    <div style={{ maxWidth: 860, margin: '0 auto', display: 'flex', flexDirection: 'column', height: 'calc(100vh - 230px)', minHeight: 460 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', gap: 12, flexWrap: 'wrap', marginBottom: 10 }}>
        <div>
          <h2 style={{ margin: 0, display: 'flex', alignItems: 'center', gap: 9 }}>💬 Assistent</h2>
          <div style={{ fontSize: 12.5, color: 'var(--muted)', marginTop: 2 }}>Fragen zu deinen Kennzahlen — in eigenen Worten, beantwortet aus den echten Zahlen.</div>
        </div>
        <KiStatusBadge />
      </div>

      {/* Verlauf */}
      <div style={{ ...card, flex: 1, overflowY: 'auto', padding: 16, display: 'flex', flexDirection: 'column', gap: 12 }}>
        {verlauf.map((m, i) => (
          <div key={i} style={{ display: 'flex', justifyContent: m.von === 'user' ? 'flex-end' : 'flex-start' }}>
            <div style={{ maxWidth: '85%' }}>
              <div style={{
                padding: '10px 13px', borderRadius: 14, fontSize: 13.5,
                background: m.von === 'user' ? 'var(--accent)' : 'var(--bg)',
                color: m.von === 'user' ? '#fff' : 'var(--ink)',
                border: m.von === 'user' ? 'none' : '1px solid var(--line)',
                borderBottomRightRadius: m.von === 'user' ? 4 : 14,
                borderBottomLeftRadius: m.von === 'user' ? 14 : 4,
              }}>
                {m.von === 'user' ? m.text : <MD text={m.text} />}
              </div>
              {m.vorschlaege?.length > 0 && (
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginTop: 7 }}>
                  {m.vorschlaege.map((v) => (
                    <button key={v} onClick={() => frag(v)} style={{ fontSize: 11.5, padding: '4px 10px', border: '1px solid var(--line)', borderRadius: 999, background: 'var(--panel)', color: 'var(--accent)', cursor: 'pointer', fontWeight: 600 }}>{v}</button>
                  ))}
                </div>
              )}
            </div>
          </div>
        ))}
        {denkt && <div style={{ fontSize: 12.5, color: 'var(--muted)', fontStyle: 'italic' }}>… einen Moment, ich rechne lokal nach</div>}
        <div ref={endeRef} />
      </div>

      {/* Eingabe */}
      <div style={{ display: 'flex', gap: 8, marginTop: 10 }}>
        <input value={text} onChange={(e) => setText(e.target.value)} onKeyDown={(e) => { if (e.key === 'Enter') frag() }}
          placeholder={'Frag etwas, z. B. „Wie hoch ist der Umsatz?" oder „Was ist gerade rot?"'}
          style={{ flex: 1, padding: '11px 14px', borderRadius: 'var(--radius-sm)', border: '1px solid var(--line)', font: 'inherit', fontSize: 13.5, background: 'var(--panel)', color: 'var(--ink)' }} />
        <button onClick={() => frag()} disabled={denkt || !text.trim()} style={{ padding: '11px 20px', border: 'none', borderRadius: 'var(--radius-sm)', background: 'var(--accent)', color: '#fff', fontWeight: 600, cursor: 'pointer', opacity: denkt || !text.trim() ? .6 : 1 }}>Senden</button>
      </div>
      <div style={{ fontSize: 11, color: 'var(--muted)', marginTop: 6, textAlign: 'center' }}>🔒 Läuft vollständig lokal · keine KI-Cloud · keine Kosten · Daten bleiben im Haus</div>
    </div>
  )
}
