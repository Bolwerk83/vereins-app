import React, { useRef, useState } from 'react'
import { Icon } from './icons.jsx'

function useToast() {
  const [msg, setMsg] = useState(null)
  const timer = useRef()
  const toast = (m) => {
    setMsg(m)
    clearTimeout(timer.current)
    timer.current = setTimeout(() => setMsg(null), 3000)
  }
  const el = <div className={'toast' + (msg ? ' show' : '')} role="status">{msg}</div>
  return [toast, el]
}

function QuickAdd({ placeholder, onAdd, autoFocus }) {
  const [v, setV] = useState('')
  const submit = () => { if (v.trim()) { onAdd(v.trim()); setV('') } }
  return (
    <div className="quickadd">
      <input value={v} autoFocus={autoFocus} onChange={(e) => setV(e.target.value)} placeholder={placeholder}
        onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); submit() } }} />
      <button type="button" className="btn sm" onClick={submit}>+</button>
    </div>
  )
}

/* Auf- und zuklappbarer Bereich. Die Überschrift ist der Knopf: zugeklappt wird
   daraus eine schmale Zeile mit dem Wichtigsten („2 offen · Milch · Brot“),
   aufgeklappt steht der Inhalt darunter wie gewohnt. */
function Fach({ id, hid, title, icon, sub, summary, act, zu, onToggle, children, className }) {
  const line = zu ? (summary ?? sub) : sub
  return (
    <section className={'fach' + (zu ? ' zu' : '') + (className ? ' ' + className : '')} data-fach={id}>
      <h3 className="label" id={hid}>
        <button type="button" className="fach-t" aria-expanded={!zu} onClick={() => onToggle(id)}
          title={zu ? 'Aufklappen' : 'Zuklappen'}>
          {icon && <span className="lico"><Icon name={icon} size={18} /></span>}
          <span className="fach-n">{title}</span>
          {line ? <span className="sub">{line}</span> : null}
          <span className="fach-chev" aria-hidden="true"><Icon name="chevD" size={18} /></span>
        </button>
        {act && !zu ? <span className="lact">{act}</span> : null}
      </h3>
      {!zu && children}
    </section>
  )
}

/* Alle Bereiche eines Bildschirms auf einmal zu- oder aufklappen */
function AlleKlappen({ ids, zu, onSet }) {
  if (!ids.length) return null
  const alleZu = ids.every((id) => zu.includes(id))
  return (
    <button type="button" className="btn ghost sm alle-klappen" onClick={() => onSet(ids, !alleZu)}
      aria-label={alleZu ? 'Alle Bereiche aufklappen' : 'Alle Bereiche zuklappen'}>
      <Icon name={alleZu ? 'unfold' : 'fold'} size={15} />{alleZu ? 'Alle aufklappen' : 'Alle zuklappen'}
    </button>
  )
}

export { useToast, QuickAdd, Fach, AlleKlappen }
