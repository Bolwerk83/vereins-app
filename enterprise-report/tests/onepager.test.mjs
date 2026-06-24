import './_setup.mjs'
import test from 'node:test'
import assert from 'node:assert/strict'
import { ladeKpiWerte } from '../src/core/dataProvider.js'
import { onepager, findeKnoten, pfadZu, kernaussage, empfehlung, QUALITAET_KPIS } from '../src/core/onepager.js'
import { BERICHTSBAUM } from '../src/core/reportTree.js'

test('Wurzel-OnePager: Ebene 1, KPIs, Qualität, Kinder', async () => {
  const werte = await ladeKpiWerte()
  const op = onepager(BERICHTSBAUM.id, werte, null)
  assert.equal(op.node.ebene, 1)
  assert.ok(op.kpis.length > 0)
  assert.ok(op.qualitaet.length > 0)
  assert.ok(op.kinder.length > 0)
  assert.equal(typeof kernaussage(op), 'string')
  assert.equal(typeof empfehlung(op), 'string')
})

test('findeKnoten & pfadZu liefern konsistenten Pfad', () => {
  const k = findeKnoten(BERICHTSBAUM.kinder[0].id)
  assert.ok(k)
  const pfad = pfadZu(k.id)
  assert.equal(pfad[0].id, BERICHTSBAUM.id)
  assert.equal(pfad[pfad.length - 1].id, k.id)
})

test('Kind-Knoten hat Ebene 2 und einen Status', async () => {
  const werte = await ladeKpiWerte()
  const op = onepager(BERICHTSBAUM.kinder[0].id, werte, null)
  assert.equal(op.node.ebene, 2)
  assert.ok(['g', 'a', 'r', 'n'].includes(op.status))
})

test('Qualitätskennzahlen sind der feste Querschnitt', async () => {
  const werte = await ladeKpiWerte()
  const op = onepager(BERICHTSBAUM.id, werte, null)
  assert.ok(op.qualitaet.every((q) => QUALITAET_KPIS.includes(q.id)))
})

test('RBAC: ohne Rechte keine geschützten KPIs im OnePager', async () => {
  const werte = await ladeKpiWerte()
  const rolleLeer = { id: 'x', bereiche: [], kontext: [], gruppen: [] }
  const op = onepager(BERICHTSBAUM.id, werte, rolleLeer)
  const alle = [...op.kpis, ...op.qualitaet]
  assert.ok(!alle.some((k) => k.id === 'personalkosten'))
})
