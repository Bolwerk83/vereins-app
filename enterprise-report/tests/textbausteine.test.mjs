import './_setup.mjs'
import test from 'node:test'
import assert from 'node:assert/strict'
import { renderText, referenzierteKpis, snapshot, istVeraltet, ladeText, speichereText, aktualisiereSnapshot, kiVorschlaege, VORLAGEN } from '../src/core/textbausteine.js'

test('@kpiId wird durch den aktuellen Wert ersetzt', () => {
  const out = renderText('Umsatz: @nettoumsatz.', { nettoumsatz: 52 })
  assert.ok(/52/.test(out))
  assert.ok(!out.includes('@nettoumsatz'))
})

test('Bedingter Block schaltet zwischen positiv/negativ um', () => {
  const t = '@ebit[Gewinn von @ebit.|Verlust von @ebit.]'
  assert.ok(renderText(t, { ebit: 5 }).startsWith('Gewinn'))
  assert.ok(renderText(t, { ebit: -3 }).startsWith('Verlust'))
})

test('Dritter Zweig greift, wenn kein Wert vorhanden ist', () => {
  const t = '@ebit[positiv|negativ|kein Wert]'
  assert.equal(renderText(t, {}), 'kein Wert')
})

test('referenzierteKpis findet nur existierende Kennzahlen', () => {
  const ids = referenzierteKpis('@nettoumsatz und @gibtsnicht und @ebit')
  assert.ok(ids.includes('nettoumsatz') && ids.includes('ebit'))
  assert.ok(!ids.includes('gibtsnicht'))
})

test('Veraltet: Vorzeichenwechsel und Periodenwechsel werden erkannt', () => {
  const meta = { text: '@ebit[a|b]', periode: '2025', snapshot: snapshot('@ebit', { ebit: 5 }) }
  assert.equal(istVeraltet(meta, { ebit: 5 }, '2025').veraltet, false)
  assert.equal(istVeraltet(meta, { ebit: -2 }, '2025').veraltet, true) // Vorzeichen gewechselt
  assert.equal(istVeraltet(meta, { ebit: 5 }, '2026').veraltet, true)  // andere Periode
  assert.equal(istVeraltet(meta, { ebit: 5.5 }, '2025').veraltet, true) // +10 %
})

test('Speichern/Laden mit Snapshot', () => {
  localStorage.removeItem('er_textboxen')
  speichereText('knoten:x', { text: 'Umsatz @nettoumsatz', periode: '2025', werte: { nettoumsatz: 52 } })
  const m = ladeText('knoten:x')
  assert.equal(m.periode, '2025')
  assert.equal(m.snapshot.nettoumsatz, 52)
})

test('Veraltet liefert konkreten Diff (damals/heute) je Kennzahl', () => {
  const meta = { text: 'Umsatz @nettoumsatz', periode: '2025', snapshot: snapshot('@nettoumsatz', { nettoumsatz: 50 }) }
  const ver = istVeraltet(meta, { nettoumsatz: 55 }, '2025')
  assert.equal(ver.veraltet, true)
  assert.equal(ver.aenderungen.length, 1)
  assert.equal(ver.aenderungen[0].alt, 50)
  assert.equal(ver.aenderungen[0].neu, 55)
  assert.equal(ver.aenderungen[0].deltaPct, 10)
  // Periodenwechsel wird zusätzlich gemeldet
  const verP = istVeraltet(meta, { nettoumsatz: 50 }, '2026')
  assert.ok(verP.periode && verP.periode.alt === '2025' && verP.periode.neu === '2026')
})

test('aktualisiereSnapshot hebt den Stand und führt Verlauf', () => {
  localStorage.removeItem('er_textboxen')
  speichereText('knoten:y', { text: 'Umsatz @nettoumsatz', periode: '2025', werte: { nettoumsatz: 50 } })
  const m = aktualisiereSnapshot('knoten:y', { werte: { nettoumsatz: 60 }, periode: '2026' })
  assert.equal(m.snapshot.nettoumsatz, 60)
  assert.equal(m.periode, '2026')
  assert.equal(m.verlauf.length, 1)
  assert.equal(m.verlauf[0].snapshot.nettoumsatz, 50)
  // Nach dem Aktualisieren ist der Kommentar nicht mehr „veraltet"
  assert.equal(istVeraltet(ladeText('knoten:y'), { nettoumsatz: 60 }, '2026').veraltet, false)
})

test('KI-Vorschläge: mehrere, mit @-Variablen', () => {
  const v = kiVorschlaege('ebit', { ebit: -3 })
  assert.ok(v.length >= 2)
  assert.ok(v.every((s) => s.includes('@ebit')))
  assert.ok(VORLAGEN.length >= 2)
})
