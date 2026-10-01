import { spawn, spawnSync } from 'node:child_process'
import { resolve } from 'node:path'

const PACKAGE_ROOT = resolve(import.meta.dir, '..')
const TARGETS = {
  staging: {
    name: 'TURSO_STAGING_DATABASE_NAME',
    url: 'TURSO_STAGING_DATABASE_URL',
    token: 'TURSO_STAGING_AUTH_TOKEN'
  },
  production: {
    name: 'TURSO_PRODUCTION_DATABASE_NAME',
    url: 'TURSO_PRODUCTION_DATABASE_URL',
    token: 'TURSO_PRODUCTION_AUTH_TOKEN'
  }
} as const

type Target = keyof typeof TARGETS
type MigrationErrorCategory = 'auth' | 'permission' | 'network' | 'config' | 'migration' | 'unknown'

const MAX_STDERR_BYTES = 16 * 1024
const GENERIC_MIGRATION_FAILURE = 'Migration failed; verify remote state before retrying'

class MigrationFailure extends Error {
  constructor(category: MigrationErrorCategory) {
    super(category === 'unknown'
      ? GENERIC_MIGRATION_FAILURE
      : `Migration failed (${category}); verify remote state before retrying`)
  }
}

function classifyMigrationError(stderr: string): MigrationErrorCategory {
  if (/unauthori[sz]ed|invalid credentials?|authentication|auth(?:entication)? token/i.test(stderr)) return 'auth'
  if (/permission|forbidden|not allowed|access denied/i.test(stderr)) return 'permission'
  if (/\b(?:econn|enotfound|etimedout|timeout|network|socket|tls|dns)\b|connection (?:refused|reset|timed out)/i.test(stderr)) return 'network'
  if (/configuration|config(?:uration)? file|invalid config|missing .+config/i.test(stderr)) return 'config'
  if (/migration|sql|syntax error|no such table/i.test(stderr)) return 'migration'
  return 'unknown'
}

// Preserve the allow-list despite the admin ambient type requiring a NODE_ENV we must omit.
function filteredEnvironment(values: Omit<NodeJS.ProcessEnv, 'NODE_ENV'>): NodeJS.ProcessEnv {
  const environment: NodeJS.ProcessEnv = { ...values, NODE_ENV: 'test' }
  Reflect.deleteProperty(environment, 'NODE_ENV')
  return environment
}

function name(value: string | undefined): string {
  if (!value || !/^[a-zA-Z][a-zA-Z0-9_-]*$/.test(value)) {
    throw new Error('Missing or invalid explicit database name')
  }
  return value
}

function remoteUrl(value: string | undefined, database: string): string {
  if (!value || value !== value.trim()) throw new Error('Missing or invalid remote database URL')
  let url: URL
  try {
    url = new URL(value)
  } catch {
    throw new Error('Missing or invalid remote database URL')
  }
  // Turso database hostnames are <database>-<organization>[.<region>].turso.io.
  // The name-to-host check prevents a correctly shaped but wrong-target URL.
  if (!['libsql:', 'https:'].includes(url.protocol) ||
    !url.hostname.toLowerCase().startsWith(`${database.toLowerCase()}-`) ||
    !/^[-a-z0-9]+(?:\.[-a-z0-9]+)?\.turso\.io$/i.test(url.hostname) ||
    url.username || url.password || url.port || (url.pathname !== '/' && url.pathname !== '') ||
    url.search || url.hash) {
    throw new Error('Missing or invalid remote database URL or target mismatch')
  }
  return value
}

/** Independently check the destination before the config exposes credentials to drizzle-kit. */
export function migrationCredentials(target: Target, env: NodeJS.ProcessEnv = process.env) {
  if (!(target in TARGETS)) throw new Error('Specify exactly one migration target')
  if (env.TURSO_DATABASE_URL !== undefined || env.TURSO_AUTH_TOKEN !== undefined) {
    throw new Error('Ambient database credentials are not accepted for migrations')
  }
  const stagingName = name(env[TARGETS.staging.name])
  const productionName = name(env[TARGETS.production.name])
  const stagingId = stagingName.toLowerCase()
  const productionId = productionName.toLowerCase()
  if (stagingId === productionId || stagingId.startsWith(`${productionId}-`) ||
    productionId.startsWith(`${stagingId}-`)) {
    throw new Error('Staging and production database names must not overlap')
  }
  const stagingUrl = remoteUrl(env[TARGETS.staging.url], stagingName)
  const productionUrl = remoteUrl(env[TARGETS.production.url], productionName)
  if (new URL(stagingUrl).hostname.toLowerCase() === new URL(productionUrl).hostname.toLowerCase()) {
    throw new Error('Staging and production database hosts must differ')
  }
  const selected = TARGETS[target]
  const selectedName = target === 'staging' ? stagingName : productionName
  const token = env[selected.token]
  if (!token || !token.trim() || token !== token.trim()) throw new Error('Missing explicit target auth token')
  if (target === 'production' && env.TURSO_PRODUCTION_MIGRATION_CONFIRM !== `migrate:${productionName}`) {
    throw new Error('Production migration requires explicit confirmation: migrate:<database-name>')
  }
  return { url: target === 'staging' ? stagingUrl : productionUrl, authToken: token }
}

/** Must run in both wrapper and config: no environment flag can stand in for this lookup. */
export function verifyRemoteName(target: Target, configuredUrl: string, env: NodeJS.ProcessEnv = process.env): void {
  const databaseName = name(env[TARGETS[target].name])
  const result = spawnSync('turso', ['db', 'show', databaseName, '--url'], {
    shell: false,
    encoding: 'utf8',
    timeout: 15000,
    maxBuffer: 2048,
    stdio: ['ignore', 'pipe', 'ignore'],
    env: filteredEnvironment({ PATH: env.PATH || '', HOME: env.HOME || '' })
  })
  // Do not forward CLI output, stderr, or spawn errors: they may contain secrets.
  if (result.error || result.status !== 0 || !result.stdout) {
    throw new Error('Remote database identity preflight failed')
  }
  const returned = remoteUrl(result.stdout.trim(), databaseName)
  if (new URL(returned).hostname.toLowerCase() !== new URL(configuredUrl).hostname.toLowerCase()) {
    throw new Error('Remote database identity mismatch')
  }
}

/** Applies the shared migrations to exactly one explicitly selected remote target. */
export async function migrateTarget(target: Target, root = PACKAGE_ROOT): Promise<void> {
  const credentials = migrationCredentials(target)
  verifyRemoteName(target, credentials.url)
  const child = spawn(resolve(root, 'node_modules/.bin/drizzle-kit'),
    ['migrate', '--config', 'drizzle.config.ts'], {
      cwd: root,
      shell: false,
      stdio: ['ignore', 'ignore', 'pipe'],
      env: filteredEnvironment({
        PATH: process.env.PATH || '',
        HOME: process.env.HOME || '',
        TURSO_MIGRATION_TARGET: target,
        TURSO_STAGING_DATABASE_NAME: process.env.TURSO_STAGING_DATABASE_NAME,
        TURSO_PRODUCTION_DATABASE_NAME: process.env.TURSO_PRODUCTION_DATABASE_NAME,
        TURSO_STAGING_DATABASE_URL: process.env.TURSO_STAGING_DATABASE_URL,
        TURSO_PRODUCTION_DATABASE_URL: process.env.TURSO_PRODUCTION_DATABASE_URL,
        ...(target === 'production' ? {
          TURSO_PRODUCTION_MIGRATION_CONFIRM: process.env.TURSO_PRODUCTION_MIGRATION_CONFIRM
        } : {}),
        [TARGETS[target].token]: credentials.authToken
      })
    })
  const stderr: Buffer[] = []
  let stderrBytes = 0
  let spawnFailed = false
  child.stderr?.on('data', (chunk: Buffer | string) => {
    const remaining = MAX_STDERR_BYTES - stderrBytes
    if (remaining <= 0) return
    const bytes = Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk)
    const bounded = Buffer.from(bytes.subarray(0, remaining))
    stderr.push(bounded)
    stderrBytes += bounded.length
  })
  child.once('error', () => {
    // Do not retain or relay arbitrary spawn errors; they can include command details.
    spawnFailed = true
  })
  const code = await new Promise<number | null>((resolveExit) => {
    child.once('close', resolveExit)
  })
  if (spawnFailed) throw new MigrationFailure('unknown')
  if (code !== 0) throw new MigrationFailure(classifyMigrationError(Buffer.concat(stderr, stderrBytes).toString('utf8')))
}

if (typeof Bun !== 'undefined' && Bun.main === import.meta.path) {
  const [target, ...extra] = process.argv.slice(2)
  if (extra.length || (target !== 'staging' && target !== 'production')) {
    console.error('Specify exactly one migration target: staging or production')
    process.exitCode = 1
  } else {
    migrateTarget(target).catch((error: unknown) => {
      // Only the fixed allow-listed CLI diagnosis is safe to relay; all other errors stay generic.
      if (error instanceof MigrationFailure && error.message !== GENERIC_MIGRATION_FAILURE) {
        console.error(error.message)
      } else {
        console.error('Migration refused or failed; verify target and remote state')
      }
      process.exitCode = 1
    })
  }
}
