import './_setup.mjs'
import test from 'node:test'
import assert from 'node:assert/strict'
import { ladeHierarchien, hierarchienVon, neueHierarchie, addEbene, removeEbene, verschiebeEbene, loescheHierarchie, setzeZurueck as dimReset } from '../src/core/dimHierarchie.js'
import { ladeMeasures, speichereMeasure, loescheMeasure, toggleAktiv, neueMeasure, ampel, setzeZurueck as mReset } from '../src/core/measures.js'

test('Dim-Hierarchien: Seed mit mehreren Strukturen je Dimension', () => {
  dimReset()
  const pc = hierarchienVon('DimProfitcenter')
  assert.ok(pc.length >= 3, 'Profit-Center hat mehrere parallele Hierarchien')
  assert.ok(hierarchienVon('DimArtikel')[0].ebenen.includes('SKU'))
})

test('Hierarchie anlegen, Ebenen hinzufügen/ordnen/entfernen', () => {
  dimReset()
  let arr = neueHierarchie('DimKunde', 'Regionalstruktur')
  const id = arr[arr.length - 1].id
  addEbene(id, 'Land'); addEbene(id, 'Region'); addEbene(id, 'Name')
  let h = ladeHierarchien().find((x) => x.id === id)
  assert.deepEqual(h.ebenen, ['Land', 'Region', 'Name'])
  addEbene(id, 'Land') // Duplikat ignoriert
  h = ladeHierarchien().find((x) => x.id === id)
  assert.equal(h.ebenen.length, 3)
  verschiebeEbene(id, 2, -1) // Name nach oben
  h = ladeHierarchien().find((x) => x.id === id)
  assert.deepEqual(h.ebenen, ['Land', 'Name', 'Region'])
  removeEbene(id, 0)
  h = ladeHierarchien().find((x) => x.id === id)
  assert.deepEqual(h.ebenen, ['Name', 'Region'])
  loescheHierarchie(id)
  assert.ok(!ladeHierarchien().some((x) => x.id === id))
})

test('Measures: Seed, CRUD, aktiv-Toggle', () => {
  mReset()
  assert.ok(ladeMeasures().length >= 4)
  const m = neueMeasure(); m.name = 'Testquote'; m.zielGut = 50
  speichereMeasure(m)
  assert.ok(ladeMeasures().some((x) => x.id === m.id))
  toggleAktiv(m.id)
  assert.equal(ladeMeasures().find((x) => x.id === m.id).aktiv, false)
  loescheMeasure(m.id)
  assert.ok(!ladeMeasures().some((x) => x.id === m.id))
})

test('Measure-Ampel respektiert Richtung', () => {
  assert.equal(ampel({ richtung: 'hoch', zielGut: 100, zielOk: 80 }, 120), 'g')
  assert.equal(ampel({ richtung: 'hoch', zielGut: 100, zielOk: 80 }, 90), 'a')
  assert.equal(ampel({ richtung: 'hoch', zielGut: 100, zielOk: 80 }, 50), 'r')
  assert.equal(ampel({ richtung: 'tief', zielGut: 3, zielOk: 4 }, 2), 'g')
  assert.equal(ampel({ richtung: 'tief', zielGut: 3, zielOk: 4 }, 5), 'r')
})

import { formatWert as fmtW, SKALEN as SK } from '../src/core/measures.js'
test('Measure-Formatierung: Nachkomma, Währung, Skala, Vorzeichen, Klammern', () => {
  assert.equal(fmtW({ einheit: '€', format: { nachkomma: 1, tausender: true, skala: 'million' } }, 205000000), '205,0 Mio €')
  assert.equal(fmtW({ einheit: '%', format: { nachkomma: 1, tausender: false } }, 5.37), '5,4 %')
  assert.equal(fmtW({ einheit: '€', format: { nachkomma: 2, tausender: true, klammerNegativ: true } }, -1234.5), '(1.234,50 €)')
  assert.equal(fmtW({ einheit: '%', format: { nachkomma: 1, vorzeichen: true } }, 7.7), '+7,7 %')
  assert.equal(fmtW({ einheit: '×', format: { nachkomma: 2 } }, 3.44), '3,44×')
  assert.ok(SK.length >= 3)
})
