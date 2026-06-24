import './_setup.mjs'
import test from 'node:test'
import assert from 'node:assert/strict'
import { KPI } from '../src/core/kpiRegistry.js'
import { ladeKpiWerte } from '../src/core/dataProvider.js'
import { beantworte, findeKpis } from '../src/core/localAssistant.js'

// Werte: meiste auf Ziel (grün), zwei bewusst rot.
const werte = {}
for (const k of Object.values(KPI)) {
  if (k.ziel == null) { werte[k.id] = 1; continue }
  werte[k.id] = k.id === 'retourenquote' ? k.ziel * 1.6 : k.id === 'dso' ? k.ziel * 1.3 : k.ziel
}
const ctx = { werte, rolle: null }

test('Entitäts-Erkennung: „Umsatz" -> nettoumsatz', () => {
  assert.equal(findeKpis('wie hoch ist der umsatz', null, 1)[0]?.id, 'nettoumsatz')
})

test('Wert-Frage liefert Wert + Ampel', async () => {
  const a = await beantworte('Wie hoch ist der Umsatz?', ctx)
  assert.equal(a.intent, 'wert')
  assert.match(a.text, /Nettoumsatz/)
  assert.match(a.text, /52,0 Mio/)
})

test('Definition erklärt den Begriff', async () => {
  const a = await beantworte('Was bedeutet DSO?', ctx)
  assert.equal(a.intent, 'definition')
  assert.match(a.text, /Forderungslaufzeit|Days Sales/)
})

test('„Was ist rot" listet die roten Kennzahlen', async () => {
  const a = await beantworte('Was ist gerade rot?', ctx)
  assert.equal(a.intent, 'listeRot')
  assert.match(a.text, /Retourenquote/)
  assert.match(a.text, /DSO/)
})

test('Gesamtlage zählt die Ampeln', async () => {
  const a = await beantworte('Wie ist die Gesamtlage?', ctx)
  assert.equal(a.intent, 'lageGesamt')
  assert.match(a.text, /rot/)
})

test('Empfehlung bei „wie senke ich …"', async () => {
  const a = await beantworte('Wie senke ich die Retourenquote?', ctx)
  assert.equal(a.intent, 'empfehlung')
  assert.ok(a.kpis.includes('retourenquote'))
})

test('Ursache bei „warum"', async () => {
  const a = await beantworte('Warum ist die Retourenquote so hoch?', ctx)
  assert.equal(a.intent, 'ursache')
  assert.match(a.text, /Retourenquote/)
})

test('Vergleich zweier Kennzahlen', async () => {
  const a = await beantworte('Vergleiche Umsatz und Ergebnis', ctx)
  assert.equal(a.intent, 'vergleich')
  assert.ok(a.kpis.length >= 2)
})

test('Trend nutzt übergebene Historie', async () => {
  const hist = async (id) => [{ periode: 'Q1', wert: 5 }, { periode: 'Q2', wert: 6 }]
  const a = await beantworte('Wie hat sich der Lagerbestand entwickelt?', { ...ctx, ladeHistorie: hist })
  assert.equal(a.intent, 'trend')
})

test('Unbekannte Frage führt nicht zu Absturz, gibt Vorschläge', async () => {
  const a = await beantworte('Wie viele Bananen haben wir?', ctx)
  assert.equal(a.intent, 'unbekannt')
  assert.ok(a.vorschlaege.length > 0)
})

test('Was-wäre-wenn: Override schlägt auf abhängige Kennzahlen durch', async () => {
  const echte = await ladeKpiWerte()
  const a = await beantworte('Was wäre, wenn der Wareneinsatz auf 30 Mio € sinkt?', { werte: echte })
  assert.equal(a.intent, 'wenn')
  assert.match(a.text, /30,0 Mio/)
  assert.match(a.text, /EBIT|DB I|Deckungsbeitrag|Wareneinsatzquote|DB-Quote/) // abgeleitete Kennzahl(en) ändern sich
})

test('Was-wäre-wenn: Eingangsgröße ohne Abhängige wird benannt', async () => {
  const echte = await ladeKpiWerte()
  const a = await beantworte('Angenommen die Retourenquote sinkt auf 7 %', { werte: echte })
  assert.equal(a.intent, 'wenn')
  assert.match(a.text, /Eingangsgröße|abhängige/)
})

test('Was-wäre-wenn: relative Änderung (um 10 %)', async () => {
  const echte = await ladeKpiWerte()
  const a = await beantworte('Was wäre, wenn der Umsatz um 10 % steigt?', { werte: echte })
  assert.equal(a.intent, 'wenn')
  assert.match(a.text, /57,2 Mio|57,/) // 52 * 1,1
})

test('Was-wäre-wenn: Kausalkette Retouren -> EBIT greift', async () => {
  const echte = await ladeKpiWerte()
  const a = await beantworte('Was wäre, wenn die Retourenquote auf 7 % sinkt?', { werte: echte })
  assert.equal(a.intent, 'wenn')
  // Retouren -> Erlösschmälerung -> Nettoumsatz -> EBIT muss durchschlagen
  assert.match(a.text, /EBIT/)
  assert.match(a.text, /Kausalmodell/)
})

test('Hilfe erklärt die Fähigkeiten', async () => {
  const a = await beantworte('Was kannst du?', ctx)
  assert.equal(a.intent, 'hilfe')
})

test('RBAC: gesicherte KPI wird ohne Berechtigung nicht zugeordnet', () => {
  // personalkosten ist security-geschützt (GF/HR/FIN).
  const rolleLeer = { id: 'x', bereiche: [], kontext: [], gruppen: [] }
  const ohneRecht = findeKpis('wie hoch sind die personalkosten', rolleLeer, 3)
  assert.ok(!ohneRecht.some((k) => k.id === 'personalkosten'), 'geschützte KPI darf nicht erscheinen')
  // Ohne Rollenkontext (Admin/Demo) ist sie sichtbar.
  const mitRecht = findeKpis('wie hoch sind die personalkosten', null, 3)
  assert.ok(mitRecht.some((k) => k.id === 'personalkosten'))
})
