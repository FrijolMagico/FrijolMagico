import { afterEach, describe, expect, test } from 'bun:test'
import { spawnSync } from 'node:child_process'
import { chmod, copyFile, mkdtemp, mkdir, readFile, rm, writeFile } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { dirname, join } from 'node:path'

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

function childEnvironment(values: NodeJS.ProcessEnv): NodeJS.ProcessEnv {
  const environment: NodeJS.ProcessEnv = { ...values, NODE_ENV: 'test' }
  Reflect.deleteProperty(environment, 'NODE_ENV')
  return environment
}

async function setup() {
  const root = await mkdtemp(join(tmpdir(), 'migrate-target-test-'))
  roots.push(root)
  const bin = join(root, 'node_modules/.bin')
  await mkdir(bin, { recursive: true })
  const fake = join(bin, 'drizzle-kit')
  await writeFile(fake, `#!/bin/sh
printf '%s\\n' "$@" > '${join(root, 'args')}'
/usr/bin/env > '${join(root, 'child-env')}'
`)
  await chmod(fake, 0o700)
  process.env.PATH = '/usr/bin:/bin'
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

describe('target-scoped migrations', () => {
  test('staging runs with only selected destination credentials', async () => {
    const root = await setup()
    process.env.TURSO_PRODUCTION_MIGRATION_CONFIRM = 'migrate:safe-production'
    process.env.TURSO_DATABASE_URL = 'libsql://unrelated-generic.turso.io'
    process.env.TURSO_AUTH_TOKEN = 'unrelated-generic-secret'

    await migrateTarget('staging', root)
    expect(await readFile(join(root, 'args'), 'utf8')).toBe('migrate\n--config\ndrizzle.config.ts\n')
    const env = await readFile(join(root, 'child-env'), 'utf8')
    expect(env).toContain('TURSO_MIGRATION_TARGET=staging\n')
    expect(env).toContain('TURSO_STAGING_DATABASE_NAME=safe-staging\n')
    expect(env).toContain('TURSO_STAGING_DATABASE_URL=libsql://safe-staging-team.turso.io\n')
    expect(env).toContain('TURSO_STAGING_AUTH_TOKEN=staging-secret\n')
    for (const secret of [
      'production-secret', 'TURSO_PRODUCTION_DATABASE_NAME=', 'TURSO_PRODUCTION_DATABASE_URL=',
      'TURSO_PRODUCTION_MIGRATION_CONFIRM=', 'TURSO_DATABASE_URL=', 'TURSO_AUTH_TOKEN='
    ]) expect(env).not.toContain(secret)
  })

  test('production requires its exact confirmation and selected credentials only', async () => {
    const root = await setup()
    await expect(migrateTarget('production', root)).rejects.toThrow('explicit confirmation')
    process.env.TURSO_PRODUCTION_MIGRATION_CONFIRM = 'migrate:safe-staging'
    await expect(migrateTarget('production', root)).rejects.toThrow('explicit confirmation')
    await notRun(root)
    process.env.TURSO_PRODUCTION_MIGRATION_CONFIRM = 'migrate:safe-production'
    await migrateTarget('production', root)
    const env = await readFile(join(root, 'child-env'), 'utf8')
    expect(env).toContain('TURSO_PRODUCTION_AUTH_TOKEN=production-secret\n')
    expect(env).toContain('TURSO_PRODUCTION_MIGRATION_CONFIRM=migrate:safe-production\n')
    expect(env).not.toContain('staging-secret')
    expect(env).not.toContain('TURSO_STAGING_')
  })

  test('requires only selected target name, URL, token, and production confirmation', async () => {
    for (const key of [
      'TURSO_STAGING_DATABASE_NAME', 'TURSO_STAGING_DATABASE_URL', 'TURSO_STAGING_AUTH_TOKEN'
    ] as const) {
      const root = await setup()
      delete process.env[key]
      delete process.env.TURSO_PRODUCTION_DATABASE_NAME
      delete process.env.TURSO_PRODUCTION_DATABASE_URL
      delete process.env.TURSO_PRODUCTION_AUTH_TOKEN
      await expect(migrateTarget('staging', root)).rejects.toThrow()
      await notRun(root)
    }
  })

  test('rejects malformed URL components and a hostname not bound to selected name', async () => {
    for (const url of [
      'libsql://safe-staging-team.turso.io/path',
      'libsql://safe-staging-team.turso.io?auth=leak',
      'libsql://safe-staging-team.turso.io#fragment',
      'libsql://user@safe-staging-team.turso.io',
      'libsql://user:pass@safe-staging-team.turso.io',
      'libsql://safe-staging-team.turso.io:443',
      'http://safe-staging-team.turso.io',
      'file:local.dev.db',
      'libsql://safe-staging-team.evilturso.io',
      'libsql://safe-staging-team.turso.io.evil.example',
      'libsql://safe-production-team.turso.io',
      'libsql://wrong-staging-team.turso.io'
    ]) {
      const root = await setup()
      process.env.TURSO_STAGING_DATABASE_URL = url
      await expect(migrateTarget('staging', root)).rejects.toThrow()
      await notRun(root)
    }
  })

  test('direct drizzle config independently validates target and production confirmation', async () => {
    await setup()
    const configPath = join(import.meta.dir, '../drizzle.config.ts')
    function importConfig(target?: string, confirmation?: string) {
      return spawnSync(process.execPath, ['--no-env-file', '-e',
        'process.argv = [process.execPath, "drizzle-kit", "migrate"]; await import(' + JSON.stringify(configPath) + ')'], {
        cwd: dirname(configPath),
        env: childEnvironment({
          PATH: process.env.PATH,
          TURSO_MIGRATION_TARGET: target,
          TURSO_STAGING_DATABASE_NAME: process.env.TURSO_STAGING_DATABASE_NAME,
          TURSO_STAGING_DATABASE_URL: process.env.TURSO_STAGING_DATABASE_URL,
          TURSO_STAGING_AUTH_TOKEN: process.env.TURSO_STAGING_AUTH_TOKEN,
          TURSO_PRODUCTION_DATABASE_NAME: process.env.TURSO_PRODUCTION_DATABASE_NAME,
          TURSO_PRODUCTION_DATABASE_URL: process.env.TURSO_PRODUCTION_DATABASE_URL,
          TURSO_PRODUCTION_AUTH_TOKEN: process.env.TURSO_PRODUCTION_AUTH_TOKEN,
          TURSO_PRODUCTION_MIGRATION_CONFIRM: confirmation,
          TURSO_DATABASE_URL: 'libsql://unrelated-generic.turso.io',
          TURSO_AUTH_TOKEN: 'unrelated-generic-secret'
        }),
        encoding: 'utf8'
      })
    }
    expect(importConfig(undefined).status).not.toBe(0)
    expect(importConfig('production').status).not.toBe(0)
    expect(importConfig('production', 'migrate:safe-staging').status).not.toBe(0)
    expect(importConfig('production', 'migrate:safe-production').status).toBe(0)
    process.env.TURSO_STAGING_DATABASE_URL = 'libsql://safe-staging-team.evil.example'
    expect(importConfig('staging').status).not.toBe(0)
  })

  test('bare package script loads fixture .env.local and targets only staging', async () => {
    const root = await setup()
    const manifest = JSON.parse(await readFile(join(import.meta.dir, '../package.json'), 'utf8')) as {
      scripts: Record<string, string>
    }
    await mkdir(join(root, 'scripts'))
    await copyFile(join(import.meta.dir, '../scripts/migrate-target.ts'), join(root, 'scripts/migrate-target.ts'))
    await writeFile(join(root, 'package.json'), JSON.stringify({
      name: 'offline-migrate-test',
      scripts: { 'migrate:staging': manifest.scripts['migrate:staging'] }
    }))
    await writeFile(join(root, '.env.local'), [
      'TURSO_STAGING_DATABASE_NAME=safe-staging',
      'TURSO_STAGING_DATABASE_URL=libsql://safe-staging-team.turso.io',
      'TURSO_STAGING_AUTH_TOKEN=staging-secret',
      'TURSO_DATABASE_URL=libsql://unrelated-generic.turso.io',
      'TURSO_AUTH_TOKEN=unrelated-generic-secret'
    ].join('\n'))
    const result = spawnSync(process.execPath, ['run', 'migrate:staging'], {
      cwd: root,
      env: childEnvironment({ PATH: `${process.env.PATH}:${dirname(process.execPath)}:/usr/bin` }),
      encoding: 'utf8'
    })
    if (result.status !== 0) throw new Error(`${result.stdout}\n${result.stderr}`)
    const env = await readFile(join(root, 'child-env'), 'utf8')
    expect(env).toContain('TURSO_STAGING_AUTH_TOKEN=staging-secret\n')
    expect(env).not.toContain('TURSO_PRODUCTION_')
    expect(env).not.toContain('TURSO_DATABASE_URL=')
    expect(env).not.toContain('TURSO_AUTH_TOKEN=')
  })

  test('bare package production command refuses to migrate without its name-bound confirmation', async () => {
    const root = await setup()
    const manifest = JSON.parse(await readFile(join(import.meta.dir, '../package.json'), 'utf8')) as {
      scripts: Record<string, string>
    }
    await mkdir(join(root, 'scripts'))
    await copyFile(join(import.meta.dir, '../scripts/migrate-target.ts'), join(root, 'scripts/migrate-target.ts'))
    await writeFile(join(root, 'package.json'), JSON.stringify({
      name: 'offline-migrate-test',
      scripts: { 'migrate:production': manifest.scripts['migrate:production'] }
    }))
    await writeFile(join(root, '.env.local'), [
      'TURSO_PRODUCTION_DATABASE_NAME=safe-production',
      'TURSO_PRODUCTION_DATABASE_URL=libsql://safe-production-team.turso.io',
      'TURSO_PRODUCTION_AUTH_TOKEN=production-secret'
    ].join('\n'))
    const result = spawnSync(process.execPath, ['run', 'migrate:production'], {
      cwd: root,
      env: childEnvironment({ PATH: `${process.env.PATH}:${dirname(process.execPath)}:/usr/bin` }),
      encoding: 'utf8'
    })
    expect(result.status).toBe(1)
    expect(result.stderr).toContain('Migration refused or failed')
    await notRun(root)
  })
})
