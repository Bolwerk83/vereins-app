// =========================================================================
//  KPI-FORMEL — eigene, abgeleitete KPIs aus Formeln über bestehende KPIs.
//  SICHERER Ausdrucksparser (kein eval): nur + − * / ( ) Zahlen Bezeichner.
//  Bezeichner werden gegen die Werte (andere KPIs/Rohwerte) aufgelöst.
//  Persistenz der Definitionen in localStorage (er_kpi_custom).
// =========================================================================

// ---- Tokenizer ----------------------------------------------------------
function tokenize(s) {
  const tokens = []
  const re = /\s*([0-9]*\.?[0-9]+|[A-Za-z_][A-Za-z0-9_]*|[()+\-*/])/y
  let i = 0
  while (i < s.length) {
    if (/\s/.test(s[i])) { i++; continue }
    re.lastIndex = i
    const mm = re.exec(s)
    if (!mm || mm.index !== i) throw new Error('Ungültiges Zeichen: „' + s[i] + '"')
    tokens.push(mm[1]); i = re.lastIndex
  }
  return tokens
}

// ---- Parser (recursive descent) → AST -----------------------------------
function parse(formel) {
  const tokens = tokenize(formel)
  if (!tokens.length) throw new Error('Formel ist leer')
  let pos = 0
  const peek = () => tokens[pos]
  const next = () => tokens[pos++]
  const op = (o, a, b) => ({ t: 'op', op: o, a, b })

  function expr() { let v = term(); while (peek() === '+' || peek() === '-') v = op(next(), v, term()); return v }
  function term() { let v = factor(); while (peek() === '*' || peek() === '/') v = op(next(), v, factor()); return v }
  function factor() {
    const t = peek()
    if (t === '(') { next(); const v = expr(); if (next() !== ')') throw new Error('Schließende Klammer fehlt'); return v }
    if (t === '-') { next(); return { t: 'neg', v: factor() } }
    if (t === '+') { next(); return factor() }
    if (t == null) throw new Error('Formel endet unerwartet')
    if (/^[0-9.]/.test(t)) { next(); return { t: 'num', n: parseFloat(t) } }
    if (/^[A-Za-z_]/.test(t)) { next(); return { t: 'id', id: t } }
    throw new Error('Unerwartetes Zeichen: „' + t + '"')
  }
  const ast = expr()
  if (pos < tokens.length) throw new Error('Überzähliges Zeichen: „' + tokens[pos] + '"')
  return ast
}

function evalAst(node, werte) {
  switch (node.t) {
    case 'num': return node.n
    case 'id': {
      const x = werte[node.id]
      if (x == null || Number.isNaN(Number(x))) throw new Error('Wert fehlt für „' + node.id + '"')
      return Number(x)
    }
    case 'neg': return -evalAst(node.v, werte)
    case 'op': {
      const a = evalAst(node.a, werte), b = evalAst(node.b, werte)
      if (node.op === '+') return a + b
      if (node.op === '-') return a - b
      if (node.op === '*') return a * b
      if (b === 0) throw new Error('Division durch 0')
      return a / b
    }
    default: throw new Error('Unbekannter Knoten')
  }
}

function sammleIds(node, set = new Set()) {
  if (node.t === 'id') set.add(node.id)
  else if (node.t === 'neg') sammleIds(node.v, set)
  else if (node.t === 'op') { sammleIds(node.a, set); sammleIds(node.b, set) }
  return set
}

/** Wirft bei Syntaxfehler — sonst nichts. Für Validierung. */
export function pruefeFormel(formel) { parse(formel); return true }
/** Bezeichner (KPI-IDs), die die Formel referenziert. */
export function extractIds(formel) { try { return [...sammleIds(parse(formel))] } catch { return [] } }
/** Formel gegen Werte auswerten (wirft bei Fehler). */
export function evaluate(formel, werte) { return evalAst(parse(formel), werte) }

// ---- Persistenz ---------------------------------------------------------
const KEY = 'er_kpi_custom'
export function ladeCustomKpis() {
  try { const a = JSON.parse(localStorage.getItem(KEY) || '[]'); return Array.isArray(a) ? a : [] } catch { return [] }
}
export function speichereCustomKpis(arr) { localStorage.setItem(KEY, JSON.stringify(arr)); return arr }
export function entferneCustomKpi(id) { return speichereCustomKpis(ladeCustomKpis().filter((d) => d.id !== id)) }
export function speichereCustomKpi(def) {
  const arr = ladeCustomKpis()
  const i = arr.findIndex((d) => d.id === def.id)
  if (i >= 0) arr[i] = def; else arr.push(def)
  return speichereCustomKpis(arr)
}

/** Aus Name eine technische ID ableiten. */
export function slug(name) {
  const s = String(name || '').toLowerCase()
    .replace(/ä/g, 'ae').replace(/ö/g, 'oe').replace(/ü/g, 'ue').replace(/ß/g, 'ss')
    .replace(/[^a-z0-9]+/g, '_').replace(/^_+|_+$/g, '')
  return 'c_' + (s || 'kpi')
}

/**
 * Definition validieren.
 * @param def { id, name, formel, ... }
 * @param vorhandeneIds  Menge gültiger Bezeichner (Basis-KPIs + andere Custom-IDs)
 */
export function validiere(def, vorhandeneIds = new Set()) {
  const fehler = []
  if (!def.name || !def.name.trim()) fehler.push('Name fehlt.')
  if (!def.formel || !def.formel.trim()) fehler.push('Formel fehlt.')
  let ids = []
  if (def.formel) {
    try { parse(def.formel); ids = extractIds(def.formel) }
    catch (e) { fehler.push('Formelfehler: ' + e.message) }
  }
  if (!ids.length && def.formel && !fehler.length) fehler.push('Formel referenziert keine KPI.')
  for (const id of ids) {
    if (id === def.id) fehler.push('Formel darf sich nicht selbst referenzieren.')
    else if (!vorhandeneIds.has(id)) fehler.push('Unbekannte KPI: „' + id + '".')
  }
  return { ok: fehler.length === 0, fehler, ids }
}
