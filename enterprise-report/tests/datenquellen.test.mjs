import './_setup.mjs'
import test from 'node:test'
import assert from 'node:assert/strict'
import { KATEGORIEN, ladeQuellen, speichereQuelle, loescheQuelle, neueQuelle, setzeZurueck, quellenNachKategorie } from '../src/core/datenquellen.js'

test('Seed enthält echte Quellen je Kategorie', () => {
  setzeZurueck()
  const q = ladeQuellen()
  assert.ok(q.length >= 15)
  for (const k of KATEGORIEN) assert.ok(quellenNachKategorie(k.id).length >= 1, `${k.id} hat Quellen`)
  assert.ok(q.some((x) => x.name.includes('ZIV')))
  assert.ok(q.some((x) => x.name.toLowerCase().includes('postleitzahl')))
  assert.ok(q.every((x) => x.url.startsWith('http')))
})

test('Hinzufügen / Bearbeiten / Löschen', () => {
  setzeZurueck()
  const n = neueQuelle(); n.name = 'Testquelle'; n.url = 'https://example.org'; n.kategorie = 'geo'
  speichereQuelle(n)
  assert.ok(ladeQuellen().some((x) => x.id === n.id))
  speichereQuelle({ ...n, name: 'Testquelle 2' })
  assert.equal(ladeQuellen().find((x) => x.id === n.id).name, 'Testquelle 2')
  loescheQuelle(n.id)
  assert.ok(!ladeQuellen().some((x) => x.id === n.id))
})
