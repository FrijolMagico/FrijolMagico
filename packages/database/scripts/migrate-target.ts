import { spawn } from 'node:child_process'
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

type MigrationFailureStage = 'preflight' | 'cli' | 'spawn'
const MAX_OUTPUT_BYTES = 16 * 1024
const ANSI_ESCAPE = /\u001b\[[0-?]*[ -/]*[@-~]/g
const URL_PATTERN = /\b(?:https?|libsql):\/\/[^\s"'<>]+/gi
const JWT_PATTERN = /\b[A-Za-z0-9_-]{8,}\.[A-Za-z0-9_-]{8,}\.[A-Za-z0-9_-]{8,}\b/g
const SENSITIVE_CREDENTIAL_LABEL = /\b(?:token|auth[\s_-]*token|authorization|secret|password|api[\s_-]*key)\s*:/i
const SUSPICIOUS_CREDENTIAL_LINE = /\b(?:access[_ -]?token|auth(?:entication)?[_ -]?token|api[_ -]?key|authorization|bearer|client[_ -]?secret|credential|password|passwd|secret|token)\b["']?\s*[:=]\s*["']?\S+|\b(?:bearer|basic)\s+\S+/i

class MigrationFailure extends Error {
  constructor(readonly stage: MigrationFailureStage) {
    super(stage)
  }
}

function redactOutput(buffer: Buffer, truncated: boolean, secrets: string[]): string[] {
  let output = buffer.toString('utf8')
    .replace(ANSI_ESCAPE, '')
    .replace(/\r(?!\n)/g, '\n')
    .replace(/[\u0000-\u0008\u000b\u000c\u000e-\u001f\u007f]/g, '')
  if (SENSITIVE_CREDENTIAL_LABEL.test(output)) {
    return [
      '[sensitive diagnostic stream omitted]',
      ...(truncated ? ['[diagnostic output truncated]'] : [])
    ]
  }
  for (const secret of secrets) {
    if (secret) output = output.split(secret).join('[REDACTED]')
  }
  output = output.replace(URL_PATTERN, '[URL]').replace(JWT_PATTERN, '[REDACTED]')

  const lines = output.split(/\r?\n/)
  // If the cap split a line, discard it: its unseen suffix could contain a credential.
  if (truncated && !output.endsWith('\n')) lines.pop()
  const safeLines = lines.filter((line) => !SUSPICIOUS_CREDENTIAL_LINE.test(line))
  if (safeLines.length < lines.length) safeLines.push('[sensitive diagnostic line omitted]')
  if (truncated) safeLines.push('[diagnostic output truncated]')
  return safeLines.filter(Boolean)
}

function emitOutput(label: 'stdout' | 'stderr', buffer: Buffer, truncated: boolean, secrets: string[]) {
  for (const line of redactOutput(buffer, truncated, secrets)) {
    console.error(`[drizzle ${label}] ${line}`)
  }
}

// Preserve the allow-list despite the admin ambient type requiring a NODE_ENV we must omit.
function filteredEnvironment(values: NodeJS.ProcessEnv): NodeJS.ProcessEnv {
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

/** Validate only the selected destination before exposing its credentials to drizzle-kit. */
export function migrationCredentials(target: Target, env: NodeJS.ProcessEnv = process.env) {
  if (!(target in TARGETS)) throw new Error('Specify exactly one migration target')
  const selected = TARGETS[target]
  const selectedName = name(env[selected.name])
  const url = remoteUrl(env[selected.url], selectedName)
  const token = env[selected.token]
  if (!token || !token.trim() || token !== token.trim()) throw new Error('Missing explicit target auth token')
  if (target === 'production' && env.TURSO_PRODUCTION_MIGRATION_CONFIRM !== `migrate:${selectedName}`) {
    throw new Error('Production migration requires explicit confirmation: migrate:<database-name>')
  }
  return { url, authToken: token }
}

/** Applies the shared migrations to exactly one explicitly selected remote target. */
export async function migrateTarget(target: Target, root = PACKAGE_ROOT): Promise<void> {
  let credentials: ReturnType<typeof migrationCredentials>
  try {
    credentials = migrationCredentials(target)
  } catch {
    throw new MigrationFailure('preflight')
  }
  const selected = TARGETS[target]
  const child = spawn(resolve(root, 'node_modules/.bin/drizzle-kit'),
    ['migrate', '--config', 'drizzle.config.ts'], {
      cwd: root,
      shell: false,
      stdio: ['ignore', 'pipe', 'pipe'],
      env: filteredEnvironment({
        PATH: process.env.PATH || '',
        HOME: process.env.HOME || '',
        TURSO_MIGRATION_TARGET: target,
        [selected.name]: process.env[selected.name],
        [selected.url]: credentials.url,
        [selected.token]: credentials.authToken,
        ...(target === 'production' ? {
          TURSO_PRODUCTION_MIGRATION_CONFIRM: process.env.TURSO_PRODUCTION_MIGRATION_CONFIRM
        } : {})
      })
    })
  const captures = {
    stdout: { chunks: [] as Buffer[], bytes: 0, truncated: false },
    stderr: { chunks: [] as Buffer[], bytes: 0, truncated: false }
  }
  for (const stream of ['stdout', 'stderr'] as const) {
    child[stream]?.on('data', (chunk: Buffer | string) => {
      const capture = captures[stream]
      const bytes = Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk)
      const remaining = MAX_OUTPUT_BYTES - capture.bytes
      if (remaining <= 0) {
        capture.truncated = true
        return
      }
      const bounded = bytes.subarray(0, remaining)
      capture.chunks.push(Buffer.from(bounded))
      capture.bytes += bounded.length
      if (bounded.length < bytes.length) capture.truncated = true
    })
  }
  let spawnFailed = false
  child.once('error', () => {
    // Do not retain or relay arbitrary spawn errors; they can include command details.
    spawnFailed = true
  })
  const code = await new Promise<number | null>((resolveExit) => {
    child.once('close', resolveExit)
  })
  const secrets = [credentials.url, credentials.authToken]
  for (const stream of ['stdout', 'stderr'] as const) {
    const capture = captures[stream]
    emitOutput(stream, Buffer.concat(capture.chunks, capture.bytes), capture.truncated, secrets)
  }
  if (spawnFailed) throw new MigrationFailure('spawn')
  if (code !== 0) throw new MigrationFailure('cli')
}

if (typeof Bun !== 'undefined' && Bun.main === import.meta.path) {
  const [target, ...extra] = process.argv.slice(2)
  if (extra.length || (target !== 'staging' && target !== 'production')) {
    console.error('Specify exactly one migration target: staging or production')
    process.exitCode = 1
  } else {
    migrateTarget(target).catch((error: unknown) => {
      if (error instanceof MigrationFailure && error.stage === 'preflight') {
        console.error('Migration preflight failed; verify target configuration')
      } else if (error instanceof MigrationFailure && error.stage === 'cli') {
        console.error('Drizzle migration CLI failed; verify remote state before retrying')
      } else {
        console.error('Migration could not start; verify target and remote state')
      }
      process.exitCode = 1
    })
  }
}
