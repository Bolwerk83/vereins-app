// =========================================================================
//  TRANSPORT — Bundle über Git in die nächste Instanz heben.
//
//    dev → test : direkter Push in den Ziel-Branch (STAGE_BRANCH_TEST)
//    test → prod: Transport-Branch pushen + Pull-Request-Link liefern
//
//  Technik: Git-Plumbing (hash-object / read-tree / commit-tree). Es wird
//  GENAU die Bundle-Datei auf die Spitze des Ziel-Branches gesetzt — ohne
//  den laufenden Working-Tree zu wechseln und ohne Fremd-Historie zu
//  vermischen. Ohne Git/Remote bleibt das Bundle als Datei liegen
//  (Status 'gespeichert'); der Download/Import-Weg greift weiterhin.
// =========================================================================
import { execFileSync } from 'node:child_process'
import { writeFileSync, mkdirSync, existsSync, rmSync } from 'node:fs'
import { join } from 'node:path'

const REPO = process.cwd()
const BRANCHES = {
  dev: process.env.STAGE_BRANCH_DEV || 'stage/dev',
  test: process.env.STAGE_BRANCH_TEST || 'stage/test',
  prod: process.env.STAGE_BRANCH_PROD || 'stage/prod'
}
export const AKTUELLE_STAGE = process.env.STAGE || 'dev'

const IDENT = {
  GIT_AUTHOR_NAME: 'Transport', GIT_AUTHOR_EMAIL: 'transport@local',
  GIT_COMMITTER_NAME: 'Transport', GIT_COMMITTER_EMAIL: 'transport@local'
}
function git(args, env) {
  return execFileSync('git', args, { cwd: REPO, encoding: 'utf8', stdio: ['ignore', 'pipe', 'pipe'], env: { ...process.env, ...env } }).trim()
}
function repoSlug() {
  try {
    const m = git(['remote', 'get-url', 'origin']).match(/github\.com[:/]+(.+?)(?:\.git)?$/i)
    return m ? m[1] : null
  } catch { return null }
}

function schreibeArtefakt(bundle) {
  const dir = join(REPO, 'transports')
  if (!existsSync(dir)) mkdirSync(dir, { recursive: true })
  const rel = `transports/${bundle.id}.json`
  writeFileSync(join(REPO, rel), JSON.stringify(bundle, null, 2))
  return rel
}

// Commit erzeugen, der base + die eine Bundle-Datei enthält. base optional.
function baueCommit(rel, base, msg) {
  const blob = git(['hash-object', '-w', rel])
  const idx = join(REPO, '.git', `tmp-index-${Date.now()}`)
  try {
    if (base) git(['read-tree', base], { GIT_INDEX_FILE: idx })
    git(['update-index', '--add', '--cacheinfo', `100644,${blob},${rel}`], { GIT_INDEX_FILE: idx })
    const tree = git(['write-tree'], { GIT_INDEX_FILE: idx })
    const args = base ? ['commit-tree', tree, '-p', base, '-m', msg] : ['commit-tree', tree, '-m', msg]
    return git(args, IDENT)
  } finally { try { rmSync(idx) } catch { /* egal */ } }
}

/**
 * Promotion ausführen. Rückgabe: { status, branch?, prUrl?, datei?, grund? }
 * status: 'gepusht' | 'pr' | 'gespeichert' | 'fehler'
 */
export function promote(bundle) {
  const zielBranch = BRANCHES[bundle.nach]
  if (!zielBranch) return { status: 'fehler', grund: `Unbekannte Ziel-Stage: ${bundle.nach}` }

  let rel
  try { rel = schreibeArtefakt(bundle) } catch (e) { return { status: 'fehler', grund: String(e.message || e) } }

  try { git(['rev-parse', '--is-inside-work-tree']) } catch { return { status: 'gespeichert', datei: rel } }

  // Spitze des Ziel-Branches holen (falls vorhanden) -> draufsetzen, sonst neu.
  let base = null
  try { git(['fetch', 'origin', zielBranch]); base = git(['rev-parse', 'FETCH_HEAD']) } catch { base = null }

  const slug = repoSlug()
  const msg = `Transport ${bundle.id}: ${bundle.von} → ${bundle.nach} (${bundle.anzahl} Artefakte)`

  try {
    const commit = baueCommit(rel, base, msg)
    if (bundle.modus === 'pr') {
      const tBranch = `transport/${bundle.id}`
      git(['push', 'origin', `${commit}:refs/heads/${tBranch}`, '--force'])
      const prUrl = slug ? `https://github.com/${slug}/compare/${encodeURIComponent(zielBranch)}...${encodeURIComponent(tBranch)}?expand=1` : null
      return { status: 'pr', branch: tBranch, prUrl }
    }
    git(['push', 'origin', `${commit}:refs/heads/${zielBranch}`])
    return { status: 'gepusht', branch: zielBranch }
  } catch (e) {
    return { status: 'gespeichert', datei: rel, grund: String(e.stderr || e.message || e).slice(0, 300) }
  }
}
