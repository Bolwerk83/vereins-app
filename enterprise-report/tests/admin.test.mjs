import './_setup.mjs'
import test from 'node:test'
import assert from 'node:assert/strict'
import { ladeBranding, speichereBranding, themeById, THEMES, applyBranding, addCustomTheme, alleThemes, loescheCustomTheme } from '../src/core/admin.js'

test('Default-Branding ohne gespeicherte Daten', () => {
  localStorage.removeItem('er_admin_branding')
  const b = ladeBranding()
  assert.equal(b.appName, 'Business Controlling Reports (BCR)')
  assert.equal(b.themeId, 'standard')
  assert.equal(b.logoDataUrl, null)
})

test('Branding speichern und laden (Roundtrip)', () => {
  speichereBranding({ appName: 'VeloWerk Reporting', themeId: 'blackweek' })
  const b = ladeBranding()
  assert.equal(b.appName, 'VeloWerk Reporting')
  assert.equal(b.themeId, 'blackweek')
})

test('themeById liefert Fallback Standard', () => {
  assert.equal(themeById('gibtsnicht').id, 'standard')
  assert.equal(themeById('weihnachten').name, 'Weihnachten')
})

test('Jedes Theme hat Akzentfarbe', () => {
  for (const t of THEMES) assert.match(t.accent, /^#[0-9a-f]{6}$/i)
})

test('applyBranding liefert das aktive Theme zurück', () => {
  const theme = applyBranding({ appName: 'X', themeId: 'ferien' })
  assert.equal(theme.id, 'ferien')
})

test('Eigenes Design anlegen, auswählbar und löschbar', () => {
  localStorage.removeItem('er_custom_themes')
  const t = addCustomTheme({ name: 'Firmenfarben', accent: '#7c3aed', accent2: '#5b21b6' })
  assert.ok(t.id.startsWith('custom_'))
  assert.ok(t.custom)
  assert.ok(alleThemes().some((x) => x.id === t.id))
  assert.equal(themeById(t.id).name, 'Firmenfarben') // über eigene Designs auflösbar
  loescheCustomTheme(t.id)
  assert.ok(!alleThemes().some((x) => x.id === t.id))
})
