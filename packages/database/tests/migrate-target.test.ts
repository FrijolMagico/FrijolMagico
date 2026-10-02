import { afterEach, describe, expect, test } from 'bun:test'
import { spawnSync } from 'node:child_process'
import { chmod, mkdtemp, mkdir, readFile, rm, writeFile } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { dirname, join } from 'node:path'

const roots: string[] = []
const originalPath = process.env.PATH

function childEnvironment(values: Record<string, string | undefined>): NodeJS.ProcessEnv {
  const environment = { ...values, NODE_ENV: 'test' } as NodeJS.ProcessEnv
  Reflect.deleteProperty(environment, 'NODE_ENV')
  return environment
}

async function setup() {
  const root = await mkdtemp(join(tmpdir(), 'drizzle-migrate-command-test-'))
  roots.push(root)
  const bin = join(root, 'node_modules/.bin')
  await mkdir(bin, { recursive: true })
  const fakeCli = join(bin, 'drizzle-kit')
  await writeFile(fakeCli, `#!/bin/sh
printf '%s\\n' "$@" > '${join(root, 'args')}'
/usr/bin/env > '${join(root, 'child-env')}'
`)
  await chmod(fakeCli, 0o700)
  await writeFile(join(root, 'package.json'), JSON.stringify({
    name: 'offline-migration-command-test',
    scripts: {
      'migrate:staging': 'bun --env-file=.env.local run drizzle-kit migrate --config=drizzle-staging.config.ts',
      'migrate:production': 'bun --env-file=.env.local run drizzle-kit migrate --config=drizzle-production.config.ts'
    }
  }))
  return root
}

afterEach(async () => {
  process.env.PATH = originalPath
  await Promise.all(roots.splice(0).map((root) => rm(root, { recursive: true, force: true })))
})

describe('direct Drizzle migration commands', () => {
  test('staging command loads package env file and selects its config without embedding credentials', async () => {
    const root = await setup()
    await writeFile(join(root, '.env.local'), [
      'TURSO_STAGING_DATABASE_NAME=safe-staging',
      'TURSO_STAGING_DATABASE_URL=libsql://safe-staging-team.turso.io',
      'TURSO_STAGING_AUTH_TOKEN=staging-secret',
      'TURSO_PRODUCTION_DATABASE_NAME=safe-production',
      'TURSO_PRODUCTION_DATABASE_URL=libsql://safe-production-team.turso.io',
      'TURSO_PRODUCTION_AUTH_TOKEN=production-secret',
      'TURSO_DATABASE_URL=libsql://generic-team.turso.io',
      'TURSO_AUTH_TOKEN=generic-secret'
    ].join('\n'))

    const result = spawnSync(process.execPath, ['run', 'migrate:staging'], {
      cwd: root,
      env: childEnvironment({ PATH: `${dirname(process.execPath)}:/usr/bin:/bin` }),
      encoding: 'utf8'
    })
    expect(result.status).toBe(0)
    expect(await readFile(join(root, 'args'), 'utf8')).toBe(
      'migrate\n--config=drizzle-staging.config.ts\n'
    )
    const env = await readFile(join(root, 'child-env'), 'utf8')
    for (const value of ['safe-staging', 'safe-production', 'staging-secret', 'production-secret', 'generic-secret']) {
      expect(env).toContain(value)
    }

    const manifest = JSON.parse(await readFile(join(import.meta.dir, '../package.json'), 'utf8')) as {
      scripts: Record<string, string>
    }
    expect(manifest.scripts['migrate:staging']).toBe(
      'bun --env-file=.env.local run drizzle-kit migrate --config=drizzle-staging.config.ts'
    )
    expect(manifest.scripts['migrate:staging']).not.toMatch(/(?:https?:|libsql:|token\s*=)/i)
  })

  test('production command selects only the production config', async () => {
    const root = await setup()
    await writeFile(join(root, '.env.local'), [
      'TURSO_PRODUCTION_DATABASE_NAME=safe-production',
      'TURSO_PRODUCTION_DATABASE_URL=libsql://safe-production-team.turso.io',
      'TURSO_PRODUCTION_AUTH_TOKEN=production-secret',
      'TURSO_PRODUCTION_MIGRATION_CONFIRM=migrate:safe-production'
    ].join('\n'))

    const result = spawnSync(process.execPath, ['run', 'migrate:production'], {
      cwd: root,
      env: childEnvironment({ PATH: `${dirname(process.execPath)}:/usr/bin:/bin` }),
      encoding: 'utf8'
    })
    expect(result.status).toBe(0)
    expect(await readFile(join(root, 'args'), 'utf8')).toBe(
      'migrate\n--config=drizzle-production.config.ts\n'
    )
    const manifest = JSON.parse(await readFile(join(import.meta.dir, '../package.json'), 'utf8')) as {
      scripts: Record<string, string>
    }
    expect(manifest.scripts['migrate:production']).toBe(
      'bun --env-file=.env.local run drizzle-kit migrate --config=drizzle-production.config.ts'
    )
    expect(manifest.scripts['migrate:production']).not.toMatch(/(?:https?:|libsql:|token\s*=)/i)
  })
})
