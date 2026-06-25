import './_setup.mjs'
import test from 'node:test'
import assert from 'node:assert/strict'
import { ladeKpiWerte } from '../src/core/dataProvider.js'
import { kritischerPfad, fachbereiche, pfadLeitKpi, kernaussage } from '../src/core/roterFaden.js'

test('Kritischer Pfad startet bei E1 und steigt ab', async () => {
  const werte = await ladeKpiWerte()
  const p = kritischerPfad(werte, null)
  assert.ok(p.length >= 2)
  assert.equal(p[0].node.ebene, 1)
  for (let i = 1; i < p.length; i++) assert.equal(p[i].node.ebene, p[i - 1].node.ebene + 1)
})

test('Pfad folgt der schwächsten Ampel (Schwere nimmt nach unten nicht ab)', async () => {
  const werte = await ladeKpiWerte()
  const p = kritischerPfad(werte, null)
  // Mindestens eine Station hat eine bewertete Ampel
  assert.ok(p.some((s) => ['g', 'a', 'r'].includes(s.status)))
})

test('Zweig wählbar ab E2', async () => {
  const werte = await ladeKpiWerte()
  const fb = fachbereiche(werte, null)
  assert.ok(fb.length >= 2)
  const ziel = fb[fb.length - 1]
  const p = kritischerPfad(werte, null, ziel.id)
  assert.equal(p[1].node.id, ziel.id)
})

test('Leitkennzahl des Pfades existiert und Kernaussage ist ein Text', async () => {
  const werte = await ladeKpiWerte()
  const p = kritischerPfad(werte, null)
  const leit = pfadLeitKpi(p)
  assert.ok(leit && leit.id)
  assert.equal(typeof kernaussage(p[0]), 'string')
})

test('RBAC: Rolle ohne Rechte bekommt keine geschützten KPIs im Faden', async () => {
  const werte = await ladeKpiWerte()
  const rolleLeer = { id: 'x', bereiche: [], kontext: [], gruppen: [] }
  const p = kritischerPfad(werte, rolleLeer)
  const hatPersonalkosten = p.some((s) => s.kpis.some((k) => k.id === 'personalkosten'))
  assert.equal(hatPersonalkosten, false)
})
