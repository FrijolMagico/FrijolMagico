import { afterEach, describe, expect, test } from 'bun:test'
import { execFileSync, spawnSync } from 'node:child_process'
import { chmod, copyFile, lstat, mkdtemp, mkdir, readFile, rm, symlink, writeFile } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { dirname, join } from 'node:path'

import { pullSnapshot } from '../scripts/pull-snapshot'

const sqlite3 = execFileSync('which', ['sqlite3'], { encoding: 'utf8' }).trim()
const originalPath = process.env.PATH
const originalStaging = process.env.TURSO_STAGING_DATABASE_NAME
const originalProduction = process.env.TURSO_PRODUCTION_DATABASE_NAME
const originalUrl = process.env.TURSO_DATABASE_URL
const originalToken = process.env.TURSO_AUTH_TOKEN
const directories: string[] = []

async function setup(dump: string) {
  const root = await mkdtemp(join(tmpdir(), 'pull-snapshot-test-'))
  directories.push(root)
  const bin = join(root, 'bin')
  await mkdir(bin)
  await symlink(sqlite3, join(bin, 'sqlite3'))
  const turso = join(bin, 'turso')
  await writeFile(turso, `#!/bin/sh
if [ "$#" -ne 4 ] || [ "$1" != db ] || [ "$2" != shell ] || [ "$4" != .dump ]; then exit 42; fi
case "$3" in safe-staging|safe-production) ;; *) exit 42 ;; esac
printf 'called\\n' >> '${join(root, 'calls')}'
printf '%s\\n' '${dump.replaceAll("'", "'\\''")}'
`)
  await chmod(turso, 0o700)
  await mkdir(join(root, 'migrations/meta'), { recursive: true })
  await writeFile(join(root, 'migrations/meta/_journal.json'), JSON.stringify({ entries: [{ when: 42 }] }))
  // Both executables are isolated locally: a missing fake cannot fall through to a real Turso CLI.
  process.env.PATH = bin
  delete process.env.TURSO_DATABASE_URL
  delete process.env.TURSO_AUTH_TOKEN
  process.env.TURSO_STAGING_DATABASE_NAME = 'safe-staging'
  delete process.env.TURSO_PRODUCTION_DATABASE_NAME
  return root
}

const migrationMarker = [
  'CREATE TABLE __drizzle_migrations (id INTEGER PRIMARY KEY, hash TEXT NOT NULL, created_at INTEGER NOT NULL);',
  'INSERT INTO __drizzle_migrations VALUES (1, \'fake\', 42);'
].join('\n')

// Representative empty app schema across catalog, events, participation and auth.
// Keep the column names independent of the implementation's required-schema map.
const appSchema = [
  'CREATE TABLE artista (id INTEGER PRIMARY KEY, estado_id INTEGER, pseudonimo TEXT, slug TEXT);',
  'CREATE TABLE catalogo_artista (id INTEGER PRIMARY KEY, artista_id INTEGER, orden TEXT, activo INTEGER);',
  'CREATE TABLE evento (id INTEGER PRIMARY KEY, nombre TEXT, slug TEXT);',
  'CREATE TABLE evento_edicion (id INTEGER PRIMARY KEY, evento_id INTEGER, numero_edicion TEXT);',
  'CREATE TABLE participacion_edicion (id INTEGER PRIMARY KEY, edicion_id INTEGER, artista_id INTEGER, agrupacion_id INTEGER, banda_id INTEGER);',
  'CREATE TABLE participacion_exposicion (id INTEGER PRIMARY KEY, participacion_id INTEGER, disciplina_id INTEGER);',
  'CREATE TABLE participacion_actividad (id INTEGER PRIMARY KEY, participacion_id INTEGER, tipo_actividad_id INTEGER);',
  'CREATE TABLE activity_occurrence (id INTEGER PRIMARY KEY, activity_id INTEGER, date TEXT, start_time TEXT);',
  'CREATE TABLE user (id TEXT PRIMARY KEY, email TEXT, email_verified INTEGER);',
  'CREATE TABLE session (id TEXT PRIMARY KEY, user_id TEXT, token TEXT, expires_at INTEGER);',
  'CREATE TABLE account (id TEXT PRIMARY KEY, user_id TEXT, provider_id TEXT, account_id TEXT);',
  'CREATE TABLE verification (id TEXT PRIMARY KEY, identifier TEXT, value TEXT, expires_at INTEGER);'
].join('\n')

const validDump = [
  'BEGIN TRANSACTION;',
  migrationMarker,
  appSchema,
  'CREATE TABLE example (id INTEGER PRIMARY KEY);',
  'INSERT INTO example VALUES (7);',
  'COMMIT;'
].join('\n')

afterEach(async () => {
  process.env.PATH = originalPath
  for (const [key, value] of [
    ['TURSO_STAGING_DATABASE_NAME', originalStaging],
    ['TURSO_PRODUCTION_DATABASE_NAME', originalProduction],
    ['TURSO_DATABASE_URL', originalUrl],
    ['TURSO_AUTH_TOKEN', originalToken]
  ] as const) {
    if (value === undefined) delete process.env[key]
    else process.env[key] = value
  }
  await Promise.all(directories.splice(0).map((directory) => rm(directory, { recursive: true, force: true })))
})

describe('explicit snapshot pull', () => {
  test('replaces staging only after import and validation, leaving production untouched', async () => {
    const root = await setup(validDump)
    await writeFile(join(root, 'local.dev.db'), 'old staging')
    await writeFile(join(root, 'local.db'), 'old production')
    await pullSnapshot('staging', root)
    expect((await readFile(join(root, 'local.dev.db'))).subarray(0, 16).toString()).toBe('SQLite format 3\0')
    expect(await readFile(join(root, 'local.db'), 'utf8')).toBe('old production')
    expect((await lstat(join(root, 'local.dev.db'))).mode & 0o077).toBe(0)
  })

  test('refreshes production only when its separate name is supplied', async () => {
    const root = await setup(validDump)
    process.env.TURSO_PRODUCTION_DATABASE_NAME = 'safe-production'
    await writeFile(join(root, 'local.dev.db'), 'old staging')
    await pullSnapshot('production', root)
    expect((await readFile(join(root, 'local.db'))).subarray(0, 16).toString()).toBe('SQLite format 3\0')
    expect(await readFile(join(root, 'local.dev.db'), 'utf8')).toBe('old staging')
  })

  test('rejects invalid SQL and preserves the prior snapshot', async () => {
    const root = await setup('CREATE TABLE x (')
    await writeFile(join(root, 'local.dev.db'), 'old staging')
    await expect(pullSnapshot('staging', root)).rejects.toThrow()
    expect(await readFile(join(root, 'local.dev.db'), 'utf8')).toBe('old staging')
  })

  test('rejects a failed dump even when the SQL itself is valid', async () => {
    const root = await setup(validDump)
    await writeFile(join(root, 'local.dev.db'), 'old staging')
    const turso = join(root, 'bin/turso')
    await writeFile(turso, '#!/bin/sh\nprintf \'%s\\n\' \'BEGIN TRANSACTION; COMMIT;\'\nexit 1\n')
    await expect(pullSnapshot('staging', root)).rejects.toThrow('dump or import failed')
    expect(await readFile(join(root, 'local.dev.db'), 'utf8')).toBe('old staging')
  })

  test('package command rejects Bun-loaded generic credentials but explicit no-env-file command succeeds', async () => {
    const root = await setup(validDump)
    const manifest = JSON.parse(await readFile(join(import.meta.dir, '../package.json'), 'utf8')) as {
      scripts: Record<string, string>
    }
    await mkdir(join(root, 'scripts'))
    await copyFile(join(import.meta.dir, '../scripts/pull-snapshot.ts'), join(root, 'scripts/pull-snapshot.ts'))
    await writeFile(join(root, 'package.json'), JSON.stringify({
      name: 'offline-pull-test',
      scripts: { 'pull:staging': manifest.scripts['pull:staging'] }
    }))
    await writeFile(join(root, '.env.local'), [
      'TURSO_STAGING_DATABASE_NAME=safe-staging',
      'TURSO_DATABASE_URL=libsql://ambient-generic.turso.io',
      'TURSO_AUTH_TOKEN=ambient-placeholder'
    ].join('\n'))

    const path = `${process.env.PATH}:${dirname(process.execPath)}:/usr/bin`
    const defaultCommand = spawnSync(process.execPath, ['run', 'pull:staging'], {
      cwd: root,
      env: { PATH: path, NODE_ENV: 'test' },
      encoding: 'utf8'
    })
    expect(defaultCommand.status).toBe(1)
    expect(defaultCommand.stderr).toContain('Snapshot refresh failed')
    await expect(lstat(join(root, 'calls'))).rejects.toMatchObject({ code: 'ENOENT' })
    await expect(lstat(join(root, 'local.dev.db'))).rejects.toMatchObject({ code: 'ENOENT' })

    const explicitCommand = spawnSync(process.execPath, ['--no-env-file', 'run', 'pull:staging'], {
      cwd: root,
      env: { PATH: path, NODE_ENV: 'test', TURSO_STAGING_DATABASE_NAME: 'safe-staging' },
      encoding: 'utf8'
    })
    expect(explicitCommand.status).toBe(0)
    expect((await readFile(join(root, 'local.dev.db'))).subarray(0, 16).toString()).toBe('SQLite format 3\0')
    expect(await readFile(join(root, 'calls'), 'utf8')).toBe('called\n')
  })

  test('rejects ambient credentials before running the dump', async () => {
    const root = await setup(validDump)
    process.env.TURSO_DATABASE_URL = 'file:unrelated.db'
    await expect(pullSnapshot('staging', root)).rejects.toThrow('Ambient database credentials')
  })

  test('rejects a valid but unrelated SQLite dump containing only the migration marker', async () => {
    const root = await setup(`BEGIN TRANSACTION;\n${migrationMarker}\nCOMMIT;`)
    await writeFile(join(root, 'local.dev.db'), 'prior snapshot')
    await expect(pullSnapshot('staging', root)).rejects.toThrow('application schema mismatch')
    expect(await readFile(join(root, 'local.dev.db'), 'utf8')).toBe('prior snapshot')
  })

  test('rejects incomplete app schema even with a matching migration marker', async () => {
    const root = await setup(validDump.replace(
      'CREATE TABLE account (id TEXT PRIMARY KEY, user_id TEXT, provider_id TEXT, account_id TEXT);',
      'CREATE TABLE account (id TEXT PRIMARY KEY, user_id TEXT, provider_id TEXT);'
    ))
    await writeFile(join(root, 'local.dev.db'), 'prior snapshot')
    await expect(pullSnapshot('staging', root)).rejects.toThrow('application schema mismatch')
    expect(await readFile(join(root, 'local.dev.db'), 'utf8')).toBe('prior snapshot')
  })

  test('rejects stale migration metadata and foreign key violations', async () => {
    const root = await setup(validDump.replace('42);', '41);'))
    await expect(pullSnapshot('staging', root)).rejects.toThrow('metadata mismatch')
    const fkRoot = await setup(validDump.replace('COMMIT;',
      'CREATE TABLE child (parent_id INTEGER REFERENCES example(id));\nINSERT INTO child VALUES (999);\nCOMMIT;'))
    await expect(pullSnapshot('staging', fkRoot)).rejects.toThrow('foreign key check failed')
  })

  test('rejects implicit production, unsafe names, and symlink destinations', async () => {
    const root = await setup(validDump)
    await expect(pullSnapshot('production', root)).rejects.toThrow('explicit database name')
    process.env.TURSO_STAGING_DATABASE_NAME = '--danger'
    await expect(pullSnapshot('staging', root)).rejects.toThrow('explicit database name')
    process.env.TURSO_STAGING_DATABASE_NAME = 'safe-staging'
    await writeFile(join(root, 'outside.db'), 'untouched')
    await symlink(join(root, 'outside.db'), join(root, 'local.dev.db'))
    await expect(pullSnapshot('staging', root)).rejects.toThrow('Unsafe snapshot destination')
    expect(await readFile(join(root, 'outside.db'), 'utf8')).toBe('untouched')
  })

  test('rejects both SQLite sidecars before invoking Turso, preserving either destination', async () => {
    for (const [target, file, sidecar] of [
      ['staging', 'local.dev.db', '-wal'],
      ['production', 'local.db', '-shm']
    ] as const) {
      const root = await setup(validDump)
      process.env.TURSO_PRODUCTION_DATABASE_NAME = 'safe-production'
      await writeFile(join(root, file), 'prior snapshot')
      await writeFile(join(root, `${file}${sidecar}`), 'prior sidecar')
      await expect(pullSnapshot(target, root)).rejects.toThrow('SQLite sidecar')
      expect(await readFile(join(root, file), 'utf8')).toBe('prior snapshot')
      expect(await readFile(join(root, `${file}${sidecar}`), 'utf8')).toBe('prior sidecar')
      await expect(lstat(join(root, 'calls'))).rejects.toMatchObject({ code: 'ENOENT' })
    }
  })

  test('rejects a sidecar appearing during import before replacement', async () => {
    const root = await setup(validDump)
    await writeFile(join(root, 'local.dev.db'), 'prior snapshot')
    const turso = join(root, 'bin/turso')
    const script = await readFile(turso, 'utf8')
    await writeFile(turso, `${script}printf 'sidecar' > '${join(root, 'local.dev.db-wal')}'\n`)
    await expect(pullSnapshot('staging', root)).rejects.toThrow('SQLite sidecar')
    expect(await readFile(join(root, 'local.dev.db'), 'utf8')).toBe('prior snapshot')
  })

  test('rejects identical nonempty target names before invoking Turso', async () => {
    const root = await setup(validDump)
    process.env.TURSO_PRODUCTION_DATABASE_NAME = 'safe-staging'
    await writeFile(join(root, 'local.dev.db'), 'prior staging')
    await writeFile(join(root, 'local.db'), 'prior production')
    for (const target of ['staging', 'production'] as const) {
      await expect(pullSnapshot(target, root)).rejects.toThrow('names must differ')
    }
    expect(await readFile(join(root, 'local.dev.db'), 'utf8')).toBe('prior staging')
    expect(await readFile(join(root, 'local.db'), 'utf8')).toBe('prior production')
    await expect(lstat(join(root, 'calls'))).rejects.toMatchObject({ code: 'ENOENT' })
  })

  test('CLI rejects missing and multiple targets without spawning Turso', async () => {
    const root = await setup(validDump)
    for (const args of [[], ['staging', 'production']]) {
      const result = spawnSync(process.execPath, [join(import.meta.dir, '../scripts/pull-snapshot.ts'), ...args], {
        env: { ...process.env }, encoding: 'utf8'
      })
      expect(result.status).toBe(1)
      expect(result.stderr).toContain('Specify exactly one snapshot target')
    }
    await expect(lstat(join(root, 'calls'))).rejects.toMatchObject({ code: 'ENOENT' })
  })

  test('fails closed when either local executable is unavailable', async () => {
    const root = await setup(validDump)
    await writeFile(join(root, 'local.dev.db'), 'prior snapshot')
    await rm(join(root, 'bin/turso'))
    await expect(pullSnapshot('staging', root)).rejects.toThrow('dump or import failed')
    expect(await readFile(join(root, 'local.dev.db'), 'utf8')).toBe('prior snapshot')
    const second = await setup(validDump)
    await writeFile(join(second, 'local.dev.db'), 'prior snapshot')
    await rm(join(second, 'bin/sqlite3'))
    await expect(pullSnapshot('staging', second)).rejects.toThrow('dump or import failed')
    expect(await readFile(join(second, 'local.dev.db'), 'utf8')).toBe('prior snapshot')
  })
})
