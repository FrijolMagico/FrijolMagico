import { stat } from 'node:fs/promises'
import { resolve } from 'node:path'
import { spawnSync } from 'node:child_process'
import { pathToFileURL } from 'node:url'

export type BuildSnapshot = 'staging' | 'production'

const snapshotFiles: Record<BuildSnapshot, string> = {
  staging: 'local.dev.db',
  production: 'local.db'
}

export async function getBuildEnvironment(
  snapshot: BuildSnapshot,
  root: string,
  environment: NodeJS.ProcessEnv
): Promise<NodeJS.ProcessEnv> {
  if (environment.VERCEL === '1') return environment

  const databasePath = resolve(root, 'packages/database', snapshotFiles[snapshot])

  try {
    if (!(await stat(databasePath)).isFile()) throw new Error()
  } catch {
    throw new Error(`Required ${snapshot} database snapshot is missing: ${databasePath}`)
  }

  return {
    ...environment,
    DATA_SOURCE: 'local',
    TURSO_DATABASE_URL: pathToFileURL(databasePath).href,
    TURSO_AUTH_TOKEN: ''
  }
}

async function main() {
  const snapshot = process.argv[2]
  if (snapshot !== 'staging' && snapshot !== 'production') {
    console.error('Choose build snapshot "staging" or "production".')
    process.exitCode = 1
    return
  }

  let environment: NodeJS.ProcessEnv
  try {
    environment = await getBuildEnvironment(snapshot, process.cwd(), process.env)
  } catch (error) {
    console.error(error instanceof Error ? error.message : error)
    process.exitCode = 1
    return
  }

  const result = spawnSync(
    'bun',
    ['run', 'turbo', 'run', 'build', ...process.argv.slice(3)],
    { cwd: process.cwd(), env: environment, stdio: 'inherit' }
  )

  if (result.error) {
    console.error(result.error.message)
    process.exitCode = 1
  } else {
    process.exitCode = result.status ?? 1
  }
}

if (import.meta.main) await main()
