// =========================================================================
//  TABELLEN-/SPALTEN-LAYOUT  (Power-User-Designer)
//
//  Pro Bericht (Perspektiven-Key) ein frei gestaltbares Spalten-Layout:
//   - Reihenfolge ändern, umbenennen, aus-/einblenden
//   - BERECHNETE Spalten (Measures) per Formel mit [Spaltenname]-Bezügen
//   - jederzeit „Standard wiederherstellen"
//
//  Das Layout ist eine PRÄSENTATIONS-Schicht über den Originaldaten:
//  Filtern, Sortieren und Drill-Through arbeiten weiter auf den Originalen,
//  daher bleibt alles kompatibel. In localStorage gespeichert.
// =========================================================================

const KEY = 'er_tabellenlayout'

// Deutsche Zahl parsen ("1.240" / "38 %" / "−0,3") -> Number | null
export function parseNum(v) {
  const s = String(v).replace(/[^\d,.\-−]/g, '').replace(/−/g, '-').replace(/\./g, '').replace(',', '.')
  const n = parseFloat(s)
  return Number.isNaN(n) ? null : n
}

const alle = () => { try { return JSON.parse(localStorage.getItem(KEY) || '{}') } catch { return {} } }
const speichere = (o) => { localStorage.setItem(KEY, JSON.stringify(o)); return o }

/** Standard-Layout aus den Originalspalten. */
export function standardLayout(spalten = []) {
  return { cols: spalten.map((s, i) => ({ src: i, label: s, hidden: false })) }
}

/** Gespeichertes Layout für einen Key (oder null). */
export function ladeLayout(key) {
  const l = alle()[key]
  return l && Array.isArray(l.cols) ? l : null
}
export function speichereLayout(key, layout) { const o = alle(); o[key] = layout; return speichere(o) }
export function setzeLayoutZurueck(key) { const o = alle(); delete o[key]; speichere(o); return null }

/**
 * Layout auf (bereits gefilterte/sortierte) Originalzeilen anwenden.
 * @returns { spalten:[labels], zeilen:[[...]] } für die Anzeige.
 */
export function wendeLayoutAn(layout, originalSpalten, originalZeilen) {
  const cols = (layout?.cols || standardLayout(originalSpalten).cols).filter((c) => !c.hidden)
  // Header-Index-Map für Formelbezüge [Spaltenname]
  const idxVon = {}
  originalSpalten.forEach((s, i) => { idxVon[s.toLowerCase()] = i })

  const zelle = (col, row) => {
    if (col.src != null) return row[col.src]
    if (col.formel) return berechneFormel(col.formel, row, idxVon, col.format)
    return ''
  }
  return {
    spalten: cols.map((c) => c.label),
    zeilen: originalZeilen.map((row) => cols.map((c) => zelle(c, row)))
  }
}

// Formel mit [Spaltenname]-Bezügen sicher auswerten (nur Zahlen + Grundrechenarten).
function berechneFormel(formel, row, idxVon, format) {
  try {
    const expr = formel.replace(/\[([^\]]+)\]/g, (_, name) => {
      const i = idxVon[String(name).trim().toLowerCase()]
      const z = i == null ? null : parseNum(row[i])
      return z == null ? '0' : String(z)
    })
    if (!/^[-+*/().,\d\s]*$/.test(expr)) return '—'   // nur erlaubte Zeichen
    // eslint-disable-next-line no-new-func
    const wert = Function('"use strict"; return (' + expr.replace(/,/g, '.') + ')')()
    if (typeof wert !== 'number' || !isFinite(wert)) return '—'
    if (format === 'prozent') return wert.toLocaleString('de-DE', { maximumFractionDigits: 1 }) + ' %'
    return wert.toLocaleString('de-DE', { maximumFractionDigits: 2 })
  } catch { return '—' }
}
