import { spawn } from 'node:child_process'
import { constants } from 'node:fs'
import { chmod, lstat, mkdtemp, readFile, realpath, rename, rm, stat } from 'node:fs/promises'
import { join, resolve } from 'node:path'
import { Readable } from 'node:stream'
import { pipeline } from 'node:stream/promises'

const PACKAGE_ROOT = resolve(import.meta.dir, '..')
const TARGETS = {
  staging: { name: 'TURSO_STAGING_DATABASE_NAME', file: 'local.dev.db' },
  production: { name: 'TURSO_PRODUCTION_DATABASE_NAME', file: 'local.db' }
} as const

type Target = keyof typeof TARGETS

// Required tables and distinguishing columns from the versioned migrations.
// This is a minimum schema contract, not proof of the remote database's identity.
const REQUIRED_SCHEMA = {
  artista: ['estado_id', 'pseudonimo', 'slug'],
  catalogo_artista: ['artista_id', 'orden', 'activo'],
  evento: ['nombre', 'slug'],
  evento_edicion: ['evento_id', 'numero_edicion'],
  participacion_edicion: ['edicion_id', 'artista_id', 'agrupacion_id', 'banda_id'],
  participacion_exposicion: ['participacion_id', 'disciplina_id'],
  participacion_actividad: ['participacion_id', 'tipo_actividad_id'],
  activity_occurrence: ['activity_id', 'date', 'start_time'],
  user: ['email', 'email_verified'],
  session: ['user_id', 'token', 'expires_at'],
  account: ['user_id', 'provider_id', 'account_id'],
  verification: ['identifier', 'value', 'expires_at']
} as const

function dbName(value: string | undefined): string {
  // A single Turso database identifier, never a CLI flag, URL, or shell fragment.
  if (!value || !/^[a-zA-Z][a-zA-Z0-9_-]*$/.test(value)) {
    throw new Error('Missing or invalid explicit database name')
  }
  return value
}

async function exitCode(child: ReturnType<typeof spawn>): Promise<void> {
  const code = await new Promise<number | null>((resolveExit, reject) => {
    child.once('error', reject)
    child.once('close', resolveExit)
  })
  if (code !== 0) throw new Error('Snapshot command failed')
}

async function query(file: string, sql: string): Promise<string> {
  const child = spawn('sqlite3', ['-readonly', '-batch', '-noheader', file], {
    stdio: ['pipe', 'pipe', 'ignore']
  })
  let output = ''
  child.stdout!.setEncoding('utf8')
  child.stdout!.on('data', (chunk: string) => { output += chunk })
  const closed = exitCode(child)
  const streamed = pipeline(Readable.from([`.bail on\n${sql}\n`]), child.stdin!)
  const results = await Promise.allSettled([streamed, closed])
  if (results.some((result) => result.status === 'rejected')) throw new Error('Snapshot validation command failed')
  return output.trim()
}

async function validate(file: string, root: string): Promise<void> {
  if (await query(file, 'PRAGMA integrity_check;') !== 'ok') throw new Error('Snapshot integrity check failed')
  if (await query(file, 'PRAGMA foreign_key_check;') !== '') throw new Error('Snapshot foreign key check failed')

  const journal: unknown = JSON.parse(await readFile(join(root, 'migrations/meta/_journal.json'), 'utf8'))
  if (!journal || typeof journal !== 'object' || !('entries' in journal) || !Array.isArray(journal.entries)) {
    throw new Error('Migration journal unavailable')
  }
  const expected = journal.entries.map((entry: unknown) => {
    if (!entry || typeof entry !== 'object' || !('when' in entry) ||
      (typeof entry.when !== 'number' || !Number.isSafeInteger(entry.when))) throw new Error('Invalid migration journal')
    return String(entry.when)
  })
  if (!expected.length) throw new Error('Empty migration journal')
  const actual = await query(file, 'SELECT created_at FROM __drizzle_migrations ORDER BY created_at;')
  if (actual.split('\n').join('|') !== expected.join('|')) {
    throw new Error('Snapshot migration metadata mismatch')
  }
  for (const [table, requiredColumns] of Object.entries(REQUIRED_SCHEMA)) {
    // Identifiers come only from the fixed contract above, never from the dump or environment.
    if (await query(file, `SELECT type FROM sqlite_master WHERE name = '${table}';`) !== 'table') {
      throw new Error('Snapshot application schema mismatch')
    }
    const columns = new Set((await query(file, `SELECT name FROM pragma_table_info('${table}');`)).split('\n'))
    if (requiredColumns.some((column) => !columns.has(column))) {
      throw new Error('Snapshot application schema mismatch')
    }
  }
}

async function assertSafeDestination(destination: string): Promise<void> {
  for (const path of [destination, `${destination}-wal`, `${destination}-shm`]) {
    try {
      const existing = await lstat(path)
      if (path !== destination || !existing.isFile() || existing.nlink !== 1) {
        throw new Error('Unsafe snapshot destination or SQLite sidecar')
      }
    } catch (error) {
      if ((error as NodeJS.ErrnoException).code !== 'ENOENT') throw error
    }
  }
}

/** Only the CLI supplies the fixed package root; the root parameter allows isolated local tests. */
export async function pullSnapshot(target: Target, root = PACKAGE_ROOT): Promise<void> {
  if (!(target in TARGETS)) throw new Error('Explicit snapshot target required')
  const config = TARGETS[target]
  const name = dbName(process.env[config.name])
  const otherName = process.env[TARGETS[target === 'staging' ? 'production' : 'staging'].name]
  if (otherName && dbName(otherName) === name) {
    throw new Error('Staging and production database names must differ')
  }
  if (process.env.TURSO_DATABASE_URL || process.env.TURSO_AUTH_TOKEN) {
    // Existing ambient credentials may point to an unrelated database. Turso CLI uses its own auth.
    throw new Error('Ambient database credentials are not accepted for snapshots')
  }
  if (await realpath(root) !== resolve(root)) throw new Error('Unsafe package path')
  const destination = join(root, config.file)
  await assertSafeDestination(destination)
  const directory = await mkdtemp(join(root, '.snapshot-'))
  try {
    if (await realpath(directory) !== directory) throw new Error('Unsafe temporary directory')
    const metadata = await stat(directory)
    if (!metadata.isDirectory() || (metadata.mode & 0o077) !== 0) throw new Error('Unsafe temporary directory permissions')
    const temp = join(directory, 'snapshot.db')
    const sqlite = spawn('sqlite3', [temp], { stdio: ['pipe', 'ignore', 'ignore'] })
    const turso = spawn('turso', ['db', 'shell', name, '.dump'], { stdio: ['ignore', 'pipe', 'ignore'] })
    const tursoClosed = exitCode(turso)
    const sqliteClosed = exitCode(sqlite)
    async function* dumpInput() {
      yield '.bail on\n'
      for await (const chunk of turso.stdout!) yield chunk
    }
    const streamed = pipeline(Readable.from(dumpInput()), sqlite.stdin!)
    const results = await Promise.allSettled([streamed, tursoClosed, sqliteClosed])
    if (results.some((result) => result.status === 'rejected')) throw new Error('Snapshot dump or import failed')
    await chmod(temp, constants.S_IRUSR | constants.S_IWUSR)
    await validate(temp, root)
    // Check again immediately before replacement; reject links, non-regular targets and sidecars.
    await assertSafeDestination(destination)
    await rename(temp, destination)
    console.warn('Snapshot refreshed; a .dump cannot prove the remote source identity. Verify the selected Turso database independently.')
  } finally {
    await rm(directory, { recursive: true, force: true })
  }
}

if (Bun.main === import.meta.path) {
  const [target, ...extra] = process.argv.slice(2)
  if (extra.length || (target !== 'staging' && target !== 'production')) {
    console.error('Specify exactly one snapshot target: staging or production')
    process.exitCode = 1
  } else {
    pullSnapshot(target).catch(() => {
      // Command stderr and dump contents may contain credentials or private records.
      console.error('Snapshot refresh failed; existing local database preserved')
      process.exitCode = 1
    })
  }
}
