import { afterEach, describe, expect, test } from 'bun:test'
import { spawnSync } from 'node:child_process'
import { chmod, mkdtemp, mkdir, readFile, rm, writeFile } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { join } from 'node:path'

import { migrateTarget } from '../scripts/migrate-target'

const keys = [
  'TURSO_STAGING_DATABASE_NAME', 'TURSO_PRODUCTION_DATABASE_NAME',
  'TURSO_STAGING_DATABASE_URL', 'TURSO_PRODUCTION_DATABASE_URL',
  'TURSO_STAGING_AUTH_TOKEN', 'TURSO_PRODUCTION_AUTH_TOKEN',
  'TURSO_PRODUCTION_MIGRATION_CONFIRM', 'TURSO_DATABASE_URL', 'TURSO_AUTH_TOKEN'
] as const
const original = Object.fromEntries(keys.map((key) => [key, process.env[key]]))
const originalPath = process.env.PATH
const roots: string[] = []

async function setup() {
  const root = await mkdtemp(join(tmpdir(), 'migrate-target-test-'))
  roots.push(root)
  const bin = join(root, 'node_modules/.bin')
  await mkdir(bin, { recursive: true })
  const fake = join(bin, 'drizzle-kit')
  // Fake executable only records arguments and allowed child environment. No remote IO.
  await writeFile(fake, `#!/bin/sh
printf '%s\\n' "$@" > '${join(root, 'args')}'
/usr/bin/env > '${join(root, 'child-env')}'
`)
  await chmod(fake, 0o700)
  const cliBin = join(root, 'bin')
  await mkdir(cliBin)
  const turso = join(cliBin, 'turso')
  await writeFile(turso, `#!/bin/sh
printf '%s\\n' "$@" > '${join(root, 'preflight-args')}'
case "$3" in
  safe-staging) printf '%s\\n' 'libsql://safe-staging-team.turso.io' ;;
  safe-production) printf '%s\\n' 'https://safe-production-team.turso.io' ;;
  *) exit 7 ;;
esac
`)
  await chmod(turso, 0o700)
  process.env.PATH = cliBin
  for (const key of keys) delete process.env[key]
  process.env.TURSO_STAGING_DATABASE_NAME = 'safe-staging'
  process.env.TURSO_PRODUCTION_DATABASE_NAME = 'safe-production'
  process.env.TURSO_STAGING_DATABASE_URL = 'libsql://safe-staging-team.turso.io'
  process.env.TURSO_PRODUCTION_DATABASE_URL = 'libsql://safe-production-team.turso.io'
  process.env.TURSO_STAGING_AUTH_TOKEN = 'staging-secret'
  process.env.TURSO_PRODUCTION_AUTH_TOKEN = 'production-secret'
  return root
}

async function notRun(root: string) {
  await expect(readFile(join(root, 'args'))).rejects.toMatchObject({ code: 'ENOENT' })
}

afterEach(async () => {
  process.env.PATH = originalPath
  for (const key of keys) {
    if (original[key] === undefined) delete process.env[key]
    else process.env[key] = original[key]
  }
  await Promise.all(roots.splice(0).map((root) => rm(root, { recursive: true, force: true })))
})

describe('explicit migration target', () => {
  test('staging runs the common drizzle migrations with only its selected credentials', async () => {
    const root = await setup()
    process.env.TURSO_PRODUCTION_MIGRATION_CONFIRM = 'migrate:safe-production'
    await migrateTarget('staging', root)
    expect(await readFile(join(root, 'preflight-args'), 'utf8')).toBe('db\nshow\nsafe-staging\n--url\n')
    expect(await readFile(join(root, 'args'), 'utf8')).toBe('migrate\n--config\ndrizzle.config.ts\n')
    const env = await readFile(join(root, 'child-env'), 'utf8')
    expect(env).toContain('TURSO_MIGRATION_TARGET=staging\n')
    expect(env).toContain('TURSO_STAGING_DATABASE_URL=libsql://safe-staging-team.turso.io\n')
    expect(env).toContain('TURSO_STAGING_AUTH_TOKEN=staging-secret\n')
    expect(env).not.toContain('TURSO_MIGRATION_VERIFIED=')
    for (const secret of ['production-secret', 'TURSO_PRODUCTION_MIGRATION_CONFIRM=', 'TURSO_DATABASE_URL=', 'TURSO_AUTH_TOKEN=']) {
      expect(env).not.toContain(secret)
    }
  })

  test('production requires independent name-bound confirmation and never sends staging credentials', async () => {
    const root = await setup()
    await expect(migrateTarget('production', root)).rejects.toThrow('explicit confirmation')
    process.env.TURSO_PRODUCTION_MIGRATION_CONFIRM = 'migrate:safe-staging'
    await expect(migrateTarget('production', root)).rejects.toThrow('explicit confirmation')
    await notRun(root)
    process.env.TURSO_PRODUCTION_MIGRATION_CONFIRM = 'migrate:safe-production'
    delete process.env.TURSO_PRODUCTION_AUTH_TOKEN
    await expect(migrateTarget('production', root)).rejects.toThrow('explicit target auth token')
    await notRun(root)
    process.env.TURSO_PRODUCTION_AUTH_TOKEN = 'production-secret'
    await migrateTarget('production', root)
    expect(await readFile(join(root, 'preflight-args'), 'utf8')).toBe('db\nshow\nsafe-production\n--url\n')
    const env = await readFile(join(root, 'child-env'), 'utf8')
    expect(env).toContain('TURSO_MIGRATION_TARGET=production\n')
    expect(env).toContain('TURSO_PRODUCTION_AUTH_TOKEN=production-secret\n')
    expect(env).not.toContain('staging-secret')
    expect(env).toContain('TURSO_PRODUCTION_MIGRATION_CONFIRM=migrate:safe-production\n')
  })

  test('rejects missing names, URLs and selected token before executing', async () => {
    for (const key of [
      'TURSO_STAGING_DATABASE_NAME', 'TURSO_PRODUCTION_DATABASE_NAME',
      'TURSO_STAGING_DATABASE_URL', 'TURSO_PRODUCTION_DATABASE_URL',
      'TURSO_STAGING_AUTH_TOKEN'
    ] as const) {
      const root = await setup()
      delete process.env[key]
      await expect(migrateTarget('staging', root)).rejects.toThrow()
      await notRun(root)
    }
  })

  test('rejects overlapping names, URLs, local URLs and wrong-name destinations', async () => {
    for (const [key, value] of [
      ['TURSO_PRODUCTION_DATABASE_NAME', 'SAFE-STAGING'],
      ['TURSO_PRODUCTION_DATABASE_URL', 'libsql://safe-staging-team.turso.io'],
      ['TURSO_STAGING_DATABASE_NAME', 'safe'],
      ['TURSO_PRODUCTION_DATABASE_URL', 'https://safe-staging-team.turso.io'],
      ['TURSO_STAGING_DATABASE_URL', 'file:local.dev.db'],
      ['TURSO_STAGING_DATABASE_URL', 'http://127.0.0.1:8080'],
      ['TURSO_STAGING_DATABASE_URL', 'libsql://safe-production-other.turso.io'],
      ['TURSO_STAGING_DATABASE_URL', 'libsql://safe-staging-team.turso.io/path'],
      ['TURSO_STAGING_DATABASE_URL', 'libsql://safe-staging-team.turso.io?auth=leak']
    ] as const) {
      const root = await setup()
      process.env[key] = value
      await expect(migrateTarget('staging', root)).rejects.toThrow()
      await notRun(root)
    }
  })

  test('read-only CLI lookup must match the exact selected host before migration', async () => {
    for (const output of [
      'libsql://safe-staging-other.turso.io',
      'file:local.db',
      'libsql://safe-staging-team.turso.io\nlibsql://safe-staging-other.turso.io'
    ]) {
      const root = await setup()
      await writeFile(join(root, 'bin/turso'), `#!/bin/sh\nprintf '%s\\n' '${output}'\n`)
      await expect(migrateTarget('staging', root)).rejects.toThrow()
      await notRun(root)
    }
  })

  test('unavailable or failed Turso preflight fails closed', async () => {
    const root = await setup()
    await chmod(join(root, 'bin/turso'), 0o000)
    await expect(migrateTarget('staging', root)).rejects.toThrow()
    await notRun(root)
    const second = await setup()
    await writeFile(join(second, 'bin/turso'), '#!/bin/sh\necho private-data >&2\nexit 8\n')
    await expect(migrateTarget('staging', second)).rejects.toThrow('preflight failed')
    await notRun(second)
  })

  test('direct config import independently checks CLI identity before exposing credentials', async () => {
    const root = await setup()
    function importConfig(target?: string, command?: string, verified?: string) {
      const result = spawnSync(process.execPath, ['--no-env-file', '-e',
        'process.argv = [process.execPath, "drizzle-kit", ' + JSON.stringify(command) + ']; await import("./drizzle.config.ts")'], {
        cwd: join(import.meta.dir, '..'),
        env: {
          PATH: process.env.PATH,
          TURSO_MIGRATION_TARGET: target,
          TURSO_MIGRATION_VERIFIED: verified,
          TURSO_STAGING_DATABASE_NAME: process.env.TURSO_STAGING_DATABASE_NAME,
          TURSO_PRODUCTION_DATABASE_NAME: process.env.TURSO_PRODUCTION_DATABASE_NAME,
          TURSO_STAGING_DATABASE_URL: process.env.TURSO_STAGING_DATABASE_URL,
          TURSO_PRODUCTION_DATABASE_URL: process.env.TURSO_PRODUCTION_DATABASE_URL,
          TURSO_STAGING_AUTH_TOKEN: process.env.TURSO_STAGING_AUTH_TOKEN,
          TURSO_PRODUCTION_AUTH_TOKEN: process.env.TURSO_PRODUCTION_AUTH_TOKEN,
          TURSO_PRODUCTION_MIGRATION_CONFIRM: process.env.TURSO_PRODUCTION_MIGRATION_CONFIRM
        },
        encoding: 'utf8'
      })
      return result.status
    }
    expect(importConfig(undefined, 'migrate')).not.toBe(0)
    expect(importConfig('production', 'migrate')).not.toBe(0)
    process.env.TURSO_PRODUCTION_MIGRATION_CONFIRM = 'migrate:safe-production'
    process.env.TURSO_PRODUCTION_DATABASE_URL = 'libsql://safe-staging-other.turso.io'
    expect(importConfig('production', 'migrate')).not.toBe(0)
    // Validly shaped URL with selected name, but not the CLI's actual destination.
    process.env.TURSO_PRODUCTION_DATABASE_URL = 'libsql://safe-production-other.turso.io'
    expect(importConfig('production', 'migrate')).not.toBe(0)
    expect(await readFile(join(root, 'preflight-args'), 'utf8')).toBe('db\nshow\nsafe-production\n--url\n')
    process.env.TURSO_PRODUCTION_DATABASE_URL = 'https://safe-production-team.turso.io'
    for (const command of ['push', 'unknown', 'generate', undefined]) {
      expect(importConfig('production', command)).not.toBe(0)
    }
    expect(importConfig('production', 'migrate')).toBe(0)
    // A caller-supplied marker cannot bypass a fresh read-only identity check.
    await writeFile(join(root, 'bin/turso'), '#!/bin/sh\nprintf "%s\\n" libsql://safe-production-other.turso.io\n')
    expect(importConfig('production', 'migrate', 'forged-marker')).not.toBe(0)
  })

  test('offline generate config never exposes remote credentials', async () => {
    const result = spawnSync(process.execPath, ['--no-env-file', '-e',
      'process.argv = [process.execPath, "drizzle-kit", "generate"]; const { default: config } = await import("./drizzle.config.ts"); if ("dbCredentials" in config) process.exit(2)'], {
      cwd: join(import.meta.dir, '..'),
      env: { PATH: process.env.PATH },
      encoding: 'utf8'
    })
    expect(result.status).toBe(0)
  })

  test('rejects ambient URL or token even when empty, without leaking errors', async () => {
    for (const key of ['TURSO_DATABASE_URL', 'TURSO_AUTH_TOKEN'] as const) {
      const root = await setup()
      process.env[key] = ''
      await expect(migrateTarget('staging', root)).rejects.toThrow('Ambient database credentials')
      await notRun(root)
    }
  })

  test('rejects invalid target and child failure without exposing child output', async () => {
    const root = await setup()
    await expect(migrateTarget('both' as 'staging', root)).rejects.toThrow('exactly one')
    await notRun(root)
    await writeFile(join(root, 'node_modules/.bin/drizzle-kit'), '#!/bin/sh\necho "$TURSO_STAGING_AUTH_TOKEN" >&2\nexit 7\n')
    await expect(migrateTarget('staging', root)).rejects.toThrow('Migration failed; verify remote state')
  })
})
