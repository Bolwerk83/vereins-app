import './_setup.mjs'
import test from 'node:test'
import assert from 'node:assert/strict'
import { befundId, setStatus, statusVon, qualitaetUebersicht, qualitaetStats, ampelVon } from '../src/core/qualitaet.js'

test('Status setzen schreibt Log (wer/was/Kommentar)', () => {
  localStorage.removeItem('er_qualitaet')
  const ein = qualitaetUebersicht()[0]
  const id = ein.id
  setStatus(id, 'bearbeitung', { aktor: 'Du', kommentar: 'Prüfe Vorsystem' })
  setStatus(id, 'erledigt', { aktor: 'Du', kommentar: 'Korrekturbuchung erstellt' })
  const st = statusVon(id)
  assert.equal(st.status, 'erledigt')
  assert.equal(st.log.length, 2)
  assert.equal(st.log[1].kommentar, 'Korrekturbuchung erstellt')
  assert.ok(st.erledigtAm)
})

test('Übersicht spiegelt den gesetzten Zustand', () => {
  localStorage.removeItem('er_qualitaet')
  const ein = qualitaetUebersicht()[0]
  setStatus(ein.id, 'bearbeitung', {})
  const nachher = qualitaetUebersicht().find((x) => x.id === ein.id)
  assert.equal(nachher.zustand, 'bearbeitung')
})

test('Stats je Bereich + Ampellogik', () => {
  localStorage.removeItem('er_qualitaet')
  const s = qualitaetStats()
  assert.ok(s.proBereich.length > 0)
  assert.ok(s.proBereich.every((b) => b.bereich && b.gesamt > 0))
  assert.equal(ampelVon({ offenFehler: 1, offenWarnung: 0, bearbeitung: 0, wiedervorlage: 0 }), 'rot')
  assert.equal(ampelVon({ offenFehler: 0, offenWarnung: 2, bearbeitung: 0, wiedervorlage: 0 }), 'gelb')
  assert.equal(ampelVon({ offenFehler: 0, offenWarnung: 0, bearbeitung: 1, wiedervorlage: 0 }), 'blau')
  assert.equal(ampelVon({ offenFehler: 0, offenWarnung: 0, bearbeitung: 0, wiedervorlage: 0 }), 'gruen')
})

test('befundId ist stabil', () => {
  const it = { listId: 'rechnung', id: 'RE-9002', feld: 'bezahlt', text: 'X' }
  assert.equal(befundId(it), befundId({ ...it }))
})
