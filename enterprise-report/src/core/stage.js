// =========================================================================
//  STAGES — dev / test / prod als getrennte Deployments.
//
//  Jede Instanz läuft mit eigener Umgebung (VITE_STAGE) und ist einem
//  Git-Branch zugeordnet. Berichte werden über das Transportwesen
//  (core/transport.js) in die nächste Instanz gehoben:
//    dev → test : direkt (Push in den Ziel-Branch)
//    test → prod: per Pull Request (Vier-Augen-Freigabe)
//
//  Die maßgebliche aktuelle Stage liefert das Backend (/api/stage); ohne
//  Backend gilt VITE_STAGE bzw. 'dev'.
// =========================================================================
export const STAGES = [
  { id: 'dev',  name: 'Entwicklung', kurz: 'DEV',  branch: 'stage/dev',  farbe: '#3b82f6' },
  { id: 'test', name: 'Test / QA',   kurz: 'TEST', branch: 'stage/test', farbe: '#f59e0b' },
  { id: 'prod', name: 'Produktion',  kurz: 'PROD', branch: 'stage/prod', farbe: '#10b981' }
]

export const AKTUELLE_STAGE = import.meta.env?.VITE_STAGE || 'dev'

export const stageInfo = (id) => STAGES.find((s) => s.id === id) || STAGES[0]
export const stageIndex = (id) => STAGES.findIndex((s) => s.id === id)

/** Nächste Stage in der Pipeline (oder null bei prod). */
export function naechsteStage(id) {
  const i = stageIndex(id)
  return i >= 0 && i < STAGES.length - 1 ? STAGES[i + 1] : null
}

/** Freigabe-Modus für einen Transport-Schritt: prod ist PR-pflichtig. */
export function freigabeModus(nachId) {
  return nachId === 'prod' ? 'pr' : 'direkt'
}
