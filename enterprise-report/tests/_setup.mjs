// Minimal-Polyfills für die Core-Tests unter Node (kein Browser):
// einige Module nutzen localStorage. Wird als erster Import geladen, damit
// es vor dem Modul-Code existiert.
class LocalStorageStub {
  constructor() { this.m = new Map() }
  getItem(k) { return this.m.has(k) ? this.m.get(k) : null }
  setItem(k, v) { this.m.set(k, String(v)) }
  removeItem(k) { this.m.delete(k) }
  clear() { this.m.clear() }
}
if (!globalThis.localStorage) globalThis.localStorage = new LocalStorageStub()
