// =========================================================================
//  VERSIONIERUNG / OPTIMISTISCHES SPERREN — verhindert das stille
//  Überschreiben (Lost Update), wenn zwei Kollegen denselben Datensatz
//  (z. B. Artikel) gleichzeitig bearbeiten.
//
//  Prinzip (optimistic locking):
//   1. Jeder Datensatz trägt eine VERSION + Audit (geaendertVon/-Am) und
//      eine HISTORIE (je Änderung: wer, wann, welche Felder alt→neu).
//   2. Wer speichert, schickt die Version mit, die er beim Öffnen gesehen
//      hat (basisVersion). Stimmt sie noch -> speichern.
//   3. Hat inzwischen jemand anders geändert (aktuelle Version > basis) ->
//      KONFLIKT. Der Aufrufer bekommt: wer/wann/was wurde fremd geändert,
//      was er selbst ändern will, ob die Felder sich überschneiden
//      (mergebar = disjunkt) — und löst per Strategie auf:
//        'abbrechen'    -> nichts schreiben
//        'ueberschreiben'-> eigene Werte gewinnen (force)
//        'mergen'        -> fremde + eigene Felder kombinieren (nur wenn disjunkt)
//
//  Store-agnostisch: lade(id)->datensatz|null und schreibe(id,datensatz).
//  In der App ein localStorage-Adapter (lokal = geteilter Stand pro
//  Browser); im Mehrbenutzerbetrieb dieselbe Logik gegen das Backend/MSSQL
//  (rowversion). Tests nutzen einen In-Memory-Store.
// =========================================================================

const jetztIso = () => new Date().toISOString()

function leererDatensatz() {
  return { version: 0, geaendertVon: null, geaendertAm: null, werte: {}, historie: [] }
}

/** Felder, die patch gegenüber den aktuellen Werten WIRKLICH ändert (alt→neu). */
export function feldDiff(werte, patch) {
  const d = {}
  for (const k of Object.keys(patch)) {
    const alt = werte[k] ?? null, neu = patch[k] ?? null
    if (alt !== neu) d[k] = { alt, neu }
  }
  return d
}

/**
 * Prüft, ob patch auf Basis von basisVersion konfliktfrei gespeichert werden
 * kann. Schreibt NICHTS — reine Analyse.
 * @returns {{status:'unveraendert'|'ok'|'konflikt', diff, ...}}
 */
export function pruefe(aktuell, basisVersion, patch) {
  const ds = aktuell || leererDatensatz()
  const diff = feldDiff(ds.werte, patch)
  if (Object.keys(diff).length === 0) return { status: 'unveraendert', diff, aktuell: ds }
  // Neuer Datensatz (basis null) oder Basis noch aktuell -> kein Konflikt.
  if (basisVersion == null || ds.version === basisVersion) return { status: 'ok', diff, aktuell: ds }
  // Konflikt: fremde Änderungen seit meiner Basis sammeln.
  const fremde = ds.historie.filter((h) => h.version > basisVersion)
  const fremdeFelder = {}
  for (const h of fremde) for (const f of Object.keys(h.felder)) fremdeFelder[f] = { autor: h.autor, am: h.am, ...h.felder[f] }
  const meineFelder = Object.keys(diff)
  const ueberschneidung = meineFelder.filter((f) => f in fremdeFelder)
  return {
    status: 'konflikt',
    diff,                                   // was ich ändern will (feld -> {alt,neu})
    fremde,                                 // [{version,autor,am,felder}]  (chronologisch)
    fremdeFelder,                           // feld -> {autor,am,alt,neu}  (zusammengefasst)
    ueberschneidung,                        // Felder, die beide angefasst haben
    mergebar: ueberschneidung.length === 0, // disjunkt -> automatisch zusammenführbar
    aktuell: ds,
  }
}

/** Wendet patch an und erzeugt den nächsten Datensatz (Version+1, Audit, Historie). */
function anwenden(aktuell, patch, autor, jetzt) {
  const ds = aktuell || leererDatensatz()
  const diff = feldDiff(ds.werte, patch)
  const version = ds.version + 1
  return {
    version,
    geaendertVon: autor || null,
    geaendertAm: jetzt,
    werte: { ...ds.werte, ...patch },
    historie: [...ds.historie, { version, autor: autor || null, am: jetzt, felder: diff }],
  }
}

/**
 * Speichert patch in den Store — mit optimistischem Sperren.
 * @param store    { lade(id)->ds|null, schreibe(id,ds) }
 * @param id       Datensatz-Schlüssel (z. B. Artikel-Id)
 * @param opts     { basisVersion, patch, autor, strategie, jetzt }
 *                 strategie: undefined|'abbrechen'|'ueberschreiben'|'mergen'
 * @returns        { status, datensatz?, konflikt? }
 *                 status: 'gespeichert' | 'unveraendert' | 'konflikt' | 'abgebrochen'
 */
export function speichere(store, id, { basisVersion = null, patch = {}, autor = null, strategie, jetzt } = {}) {
  const stamp = jetzt || jetztIso()
  const aktuell = store.lade(id)
  const p = pruefe(aktuell, basisVersion, patch)

  if (p.status === 'unveraendert') return { status: 'unveraendert', datensatz: aktuell || leererDatensatz() }
  if (p.status === 'ok') {
    const ds = anwenden(aktuell, patch, autor, stamp)
    store.schreibe(id, ds)
    return { status: 'gespeichert', datensatz: ds }
  }

  // --- Konflikt -> Strategie ---------------------------------------------
  if (strategie === 'ueberschreiben') {
    const ds = anwenden(p.aktuell, patch, autor, stamp) // eigene Werte gewinnen
    store.schreibe(id, ds)
    return { status: 'gespeichert', datensatz: ds, aufgeloest: 'ueberschreiben' }
  }
  if (strategie === 'mergen') {
    if (!p.mergebar) return { status: 'konflikt', konflikt: p } // überlappende Felder -> nicht automatisch
    const ds = anwenden(p.aktuell, patch, autor, stamp) // aktuell hat fremde Felder, patch ergänzt disjunkt
    store.schreibe(id, ds)
    return { status: 'gespeichert', datensatz: ds, aufgeloest: 'mergen' }
  }
  if (strategie === 'abbrechen') return { status: 'abgebrochen', konflikt: p }
  // Keine Strategie: Konflikt zurückmelden, damit die UI fragen kann.
  return { status: 'konflikt', konflikt: p }
}

// --- localStorage-Adapter (App): ein Schlüssel hält alle Datensätze ------
export function localStorageStore(key) {
  const alle = () => { try { return JSON.parse(localStorage.getItem(key) || '{}') } catch { return {} } }
  return {
    lade: (id) => alle()[id] || null,
    schreibe: (id, ds) => { const a = alle(); a[id] = ds; try { localStorage.setItem(key, JSON.stringify(a)) } catch {} },
    alle,
  }
}

// --- In-Memory-Adapter (Tests/Vorschau) ---------------------------------
export function memoryStore(initial = {}) {
  const m = new Map(Object.entries(initial))
  return {
    lade: (id) => m.get(id) || null,
    schreibe: (id, ds) => m.set(id, ds),
    alle: () => Object.fromEntries(m),
  }
}
