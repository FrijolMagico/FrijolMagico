import { describe, expect, test } from 'bun:test'
import { spawnSync } from 'node:child_process'
import { readFileSync } from 'node:fs'
import { join } from 'node:path'

const packageRoot = join(import.meta.dir, '..')
const drizzleKit = join(packageRoot, 'node_modules/drizzle-kit/bin.cjs')
const stagingValues = {
  TURSO_STAGING_DATABASE_NAME: 'safe-staging',
  TURSO_STAGING_DATABASE_URL: 'libsql://safe-staging-team.us-east-1.turso.io',
  TURSO_STAGING_AUTH_TOKEN: 'fixture-staging-token'
}
const productionValues = {
  TURSO_PRODUCTION_DATABASE_NAME: 'safe-production',
  TURSO_PRODUCTION_DATABASE_URL: 'https://safe-production-team.turso.io',
  TURSO_PRODUCTION_AUTH_TOKEN: 'fixture-production-token',
  TURSO_PRODUCTION_MIGRATION_CONFIRM: 'migrate:safe-production'
}

function childEnvironment(values: Record<string, string | undefined>): NodeJS.ProcessEnv {
  const environment = { ...values, NODE_ENV: 'test' } as NodeJS.ProcessEnv
  Reflect.deleteProperty(environment, 'NODE_ENV')
  return environment
}

function checkConfig(config: string, values: Record<string, string>) {
  return spawnSync('node', [drizzleKit, 'check', `--config=${config}`], {
    cwd: packageRoot,
    env: childEnvironment({ PATH: process.env.PATH, ...values }),
    encoding: 'utf8',
    timeout: 10_000
  })
}

describe('Drizzle target configs', () => {
  test('Node Drizzle config loader accepts offline generation and fixed local CI config', () => {
    expect(checkConfig('drizzle.config.ts', {}).status).toBe(0)
    expect(checkConfig('drizzle-ci.config.ts', {
      TURSO_DATABASE_URL: 'libsql://must-not-be-used.turso.io',
      TURSO_AUTH_TOKEN: 'must-not-be-used'
    }).status).toBe(0)
    expect(readFileSync(join(packageRoot, 'drizzle-ci.config.ts'), 'utf8')).toContain(
      "url: 'file:./mock.local.db'"
    )
    expect(checkConfig('drizzle-staging.config.ts', stagingValues).status).toBe(0)
  }, 60_000)

  test('staging config uses only its selected target variables', () => {
    const result = checkConfig('drizzle-staging.config.ts', stagingValues)
    expect(result.status).toBe(0)
  }, 60_000)

  test('production config loads with its exact confirmation and no staging variables', () => {
    expect(checkConfig('drizzle-production.config.ts', productionValues).status).toBe(0)
    expect(checkConfig('drizzle-production.config.ts', {
      ...productionValues,
      TURSO_PRODUCTION_MIGRATION_CONFIRM: 'migrate:another-database'
    }).status).not.toBe(0)
  }, 60_000)

  test('target configs reject absent tokens and hostnames not bound to the exact database name', () => {
    expect(checkConfig('drizzle-staging.config.ts', {
      ...stagingValues,
      TURSO_STAGING_AUTH_TOKEN: ''
    }).status).not.toBe(0)

    for (const url of [
      'libsql://safe-staging-team.turso.io.evil.example',
      'libsql://wrong-staging-team.turso.io',
      'libsql://team.turso.io/safe-staging',
      'libsql://team.turso.io?database=safe-staging'
    ]) {
      expect(checkConfig('drizzle-staging.config.ts', {
        ...stagingValues,
        TURSO_STAGING_DATABASE_URL: url
      }).status).not.toBe(0)
    }
  }, 90_000)
})
