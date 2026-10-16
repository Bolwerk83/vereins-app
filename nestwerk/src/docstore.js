// Dokumentenablage: Die Dateien selbst liegen einzeln verschlüsselt in der
// Browser-Datenbank (IndexedDB) – dort ist Platz für Hunderte Megabyte.
// Titel, Ordner und Steuer-Angaben stehen im verschlüsselten Gedächtnispalast.
// Ohne das Gedächtnis-Passwort sind beide Teile unlesbar.
import { b64, unb64 } from './crypto.js'

const DB_NAME = 'eselsohr-dokumente'
const STORE = 'dateien'
let opening = null

function open() {
  if (!opening) {
    opening = new Promise((resolve, reject) => {
      let req
      try { req = indexedDB.open(DB_NAME, 1) } catch (e) { reject(e); return }
      req.onupgradeneeded = () => req.result.createObjectStore(STORE)
      req.onsuccess = () => resolve(req.result)
      req.onerror = () => reject(req.error)
      req.onblocked = () => reject(new Error('Datenbank blockiert'))
    }).catch((e) => { opening = null; throw e })
  }
  return opening
}

async function run(mode, fn) {
  const db = await open()
  return new Promise((resolve, reject) => {
    const t = db.transaction(STORE, mode)
    const req = fn(t.objectStore(STORE))
    t.oncomplete = () => resolve(req ? req.result : undefined)
    t.onerror = () => reject(t.error)
    t.onabort = () => reject(t.error || new Error('abgebrochen'))
  })
}

// Klappt die Ablage in diesem Browser? (privates Fenster, gesperrter Speicher …)
export async function filesWork() {
  try { await open(); return true } catch { return false }
}

export const putFile = (id, rec) => run('readwrite', (s) => s.put(rec, id))
export const getFile = (id) => run('readonly', (s) => s.get(id))
export const delFile = (id) => run('readwrite', (s) => s.delete(id))
export const clearFiles = () => run('readwrite', (s) => s.clear())

// Für das Backup: alles bleibt verschlüsselt, nur als Text verpackt
export async function exportFiles() {
  try {
    const db = await open()
    return await new Promise((resolve, reject) => {
      const out = {}
      const t = db.transaction(STORE, 'readonly')
      const req = t.objectStore(STORE).openCursor()
      req.onsuccess = () => {
        const c = req.result
        if (!c) return
        out[c.key] = { iv: b64(c.value.iv), data: b64(c.value.data) }
        c.continue()
      }
      t.oncomplete = () => resolve(out)
      t.onerror = () => reject(t.error)
    })
  } catch {
    return {}
  }
}

export async function importFiles(map) {
  let n = 0
  for (const [id, rec] of Object.entries(map || {})) {
    await putFile(id, { iv: unb64(rec.iv), data: unb64(rec.data).buffer })
    n++
  }
  return n
}

// Den Browser bitten, die Ablage nicht bei Platzmangel aufzuräumen
export async function keepFiles() {
  try { return await navigator.storage?.persist?.() } catch { return false }
}
