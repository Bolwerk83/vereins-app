import './_setup.mjs'
import test from 'node:test'
import assert from 'node:assert/strict'
import { htmlZuPdf } from '../server/pdf.js'

// Ohne puppeteer (CI) liefert htmlZuPdf null; mit puppeteer einen Buffer.
// Beides ist gültig — wichtig ist: kein Wurf, sauberer Fallback.
test('htmlZuPdf wirft nicht und liefert null oder Buffer', async () => {
  const r = await htmlZuPdf('<!doctype html><html><body><h1>Test</h1></body></html>')
  assert.ok(r === null || Buffer.isBuffer(r))
})
