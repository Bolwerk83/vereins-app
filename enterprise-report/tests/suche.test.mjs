import './_setup.mjs'
import test from 'node:test'
import assert from 'node:assert/strict'
import { baueIndex, suchen, NAV_ZIELE } from '../src/core/suche.js'

const t = (k) => ({ 'nav.tree': 'Berichtsbaum', 'nav.marketing': 'Marketing & Analytics', 'nav.segment': 'Segment- & Konzernbericht' }[k] || k)
const kpis = { roas: { id: 'roas', name: 'ROAS', einheit: 'x' }, ebit: { id: 'ebit', name: 'EBIT', einheit: 'Mio €' } }

test('Index enthält Navigationsziele und KPIs', () => {
  const idx = baueIndex(t, kpis)
  assert.equal(idx.filter((e) => e.typ === 'bericht').length, NAV_ZIELE.length)
  assert.equal(idx.filter((e) => e.typ === 'kpi').length, 2)
})

test('Suche findet Bericht über Label', () => {
  const idx = baueIndex(t, kpis)
  const tr = suchen(idx, 'marketing')
  assert.equal(tr[0].ziel, 'marketing')
  assert.equal(tr[0].typ, 'bericht')
})

test('Suche findet KPI', () => {
  const tr = suchen(baueIndex(t, kpis), 'roas')
  assert.ok(tr.some((r) => r.typ === 'kpi' && r.ziel === 'roas'))
})

test('Leere Eingabe liefert keine Treffer', () => {
  assert.equal(suchen(baueIndex(t, kpis), '   ').length, 0)
})

test('Exakter Treffer rankt vor Teiltreffer', () => {
  const idx = baueIndex(t, { ebit: kpis.ebit, ebitda: { id: 'ebitda', name: 'EBITDA', einheit: 'Mio €' } })
  const tr = suchen(idx, 'ebit')
  assert.equal(tr[0].ziel, 'ebit')
})
