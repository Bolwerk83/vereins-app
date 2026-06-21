import './_setup.mjs'
import test from 'node:test'
import assert from 'node:assert/strict'
import { ladeBranding, speichereBranding, themeById, THEMES, applyBranding } from '../src/core/admin.js'

test('Default-Branding ohne gespeicherte Daten', () => {
  localStorage.removeItem('er_admin_branding')
  const b = ladeBranding()
  assert.equal(b.appName, 'Enterprise Report')
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
