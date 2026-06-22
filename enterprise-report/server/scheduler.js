// =========================================================================
//  SCHEDULER — plant die Verteiler per node-cron (optionalDependency).
//  Fehlt node-cron, bleibt der Zeitplan inaktiv; manueller Versand und
//  Ereignis-Trigger über die API funktionieren trotzdem.
// =========================================================================
import { ladeVerteiler } from './verteiler.store.js'
import { versende } from './versand.js'

let cron = null
let jobs = []

// Rhythmus + Uhrzeit -> Cron-Ausdruck.
function cronAus(v) {
  const [hh, mm] = String(v.zeit || '07:00').split(':')
  const m = Number(mm) || 0, h = Number(hh) || 7
  switch (v.rhythmus) {
    case 'taeglich':      return `${m} ${h} * * *`
    case 'woechentlich':  return `${m} ${h} * * 1`         // Montag
    case 'monatlich':     return `${m} ${h} 5 * *`         // 5. des Monats (≈ 5. Werktag)
    case 'quartalsweise': return `${m} ${h} 5 1,4,7,10 *`
    default: return null
  }
}

export function planeNeu() {
  if (!cron) return 0
  jobs.forEach((j) => j.stop()); jobs = []
  for (const v of ladeVerteiler()) {
    if (!v.aktiv) continue
    const expr = cronAus(v)
    if (!expr || !cron.validate(expr)) continue
    jobs.push(cron.schedule(expr, () => {
      versende(v, 'zeitplan').then((r) => console.log(`Versand „${v.name}" (${r.ergebnis.status})`))
        .catch((e) => console.error('Versand-Fehler:', e.message))
    }))
  }
  console.log(`Scheduler: ${jobs.length} aktive(r) Verteiler geplant.`)
  return jobs.length
}

export async function starteScheduler() {
  try { cron = (await import('node-cron')).default } catch {
    console.log('node-cron nicht installiert — Zeitplan inaktiv (manueller/Ereignis-Versand via API möglich). Im Ordner server: npm install node-cron')
    return
  }
  planeNeu()
}

// Ereignis-Trigger: alle aktiven Verteiler senden, die auf dieses Ereignis horchen.
export async function feuereEreignis(typ) {
  const treffer = ladeVerteiler().filter((v) => v.aktiv && (v.ereignisse || []).includes(typ))
  const ergebnisse = []
  for (const v of treffer) ergebnisse.push({ id: v.id, name: v.name, ...(await versende(v, `ereignis:${typ}`)) })
  return ergebnisse
}
