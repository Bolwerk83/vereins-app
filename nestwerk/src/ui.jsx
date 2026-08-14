import React, { useEffect, useRef, useState } from 'react'

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

export { useToast, QuickAdd }
