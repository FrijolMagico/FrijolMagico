import { readFileSync } from 'node:fs'
import { mkdtemp, rm } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

import { createClient } from '@libsql/client'
import { drizzle } from 'drizzle-orm/libsql'
import { migrate } from 'drizzle-orm/libsql/migrator'
import { afterEach, describe, expect, test } from 'bun:test'

import { importStagingSeed, validateStagingDatabaseIdentity } from '../scripts/load-staging-seed'

const packageRoot = join(dirname(fileURLToPath(import.meta.url)), '..')
const migrationsFolder = join(packageRoot, 'migrations')
const seedSql = readFileSync(join(packageRoot, 'seed/seed.sql'), 'utf8')
const localJournal = JSON.parse(readFileSync(join(migrationsFolder, 'meta/_journal.json'), 'utf8'))
const databaseName = 'staging-frijolmagico'
const databaseUrl = 'libsql://staging-frijolmagico-example.turso.io'
const temporaryDirectories: string[] = []

async function createMigratedDatabase() {
  const directory = await mkdtemp(join(tmpdir(), 'staging-seed-import-'))
  temporaryDirectories.push(directory)
  const client = createClient({ url: `file:${join(directory, 'test.db')}` })
  await client.execute('PRAGMA foreign_keys = ON')
  await migrate(drizzle(client), { migrationsFolder })
  return client
}

afterEach(async () => {
  await Promise.all(temporaryDirectories.splice(0).map((directory) => rm(directory, { recursive: true, force: true })))
})

describe('one-time staging seed importer', () => {
  test('loads the complete fixture atomically with exact counts and valid foreign keys', async () => {
    const client = await createMigratedDatabase()
    try {
      const result = await importStagingSeed(client, { databaseName, databaseUrl, seedSql, localJournal })
      expect(result).toEqual({
        statements: 654,
        counts: { artista: 70, catalogo_artista: 38, temp_edition_participations: 60 },
        foreignKeyViolations: 0
      })
    } finally {
      client.close()
    }
  })

  test('rolls back every statement when a fixture statement fails', async () => {
    const client = await createMigratedDatabase()
    try {
      await expect(
        importStagingSeed(client, {
          databaseName,
          databaseUrl,
          seedSql: "INSERT INTO disciplina (slug) VALUES ('temporary');\nINVALID SQL;",
          localJournal
        })
      ).rejects.toThrow('Seed failed at statement 2/2')
      const rows = await client.execute('SELECT COUNT(*) AS row_count FROM disciplina')
      expect(Number(rows.rows[0]?.row_count)).toBe(0)
    } finally {
      client.close()
    }
  })

  test('rechecks emptiness inside the acquired transaction after an intervening write', async () => {
    const client = await createMigratedDatabase()
    let rollbackCalled = false
    const racingClient = new Proxy(client, {
      get(target, property, receiver) {
        if (property === 'transaction') {
          return async (...args: Parameters<typeof client.transaction>) => {
            await target.execute("INSERT INTO disciplina (slug) VALUES ('intervening-write')")
            const transaction = await target.transaction(...args)
            const rollback = transaction.rollback.bind(transaction)
            return new Proxy(transaction, {
              get(transactionTarget, transactionProperty, transactionReceiver) {
                if (transactionProperty === 'rollback') {
                  return async () => {
                    rollbackCalled = true
                    return rollback()
                  }
                }
                const value = Reflect.get(transactionTarget, transactionProperty, transactionReceiver)
                return typeof value === 'function' ? value.bind(transactionTarget) : value
              }
            })
          }
        }
        const value = Reflect.get(target, property, receiver)
        return typeof value === 'function' ? value.bind(target) : value
      }
    })

    try {
      await expect(
        importStagingSeed(racingClient, { databaseName, databaseUrl, seedSql, localJournal })
      ).rejects.toThrow('Staging database is not empty')
      expect(rollbackCalled).toBe(true)
      const interveningWrite = await client.execute(
        "SELECT COUNT(*) AS row_count FROM disciplina WHERE slug = 'intervening-write'"
      )
      const seedRows = await client.execute('SELECT COUNT(*) AS row_count FROM organizacion')
      expect(Number(interveningWrite.rows[0]?.row_count)).toBe(1)
      expect(Number(seedRows.rows[0]?.row_count)).toBe(0)
    } finally {
      client.close()
    }
  })

  test('refuses a nonempty application table before opening a transaction', async () => {
    const client = await createMigratedDatabase()
    try {
      await client.execute("INSERT INTO disciplina (slug) VALUES ('existing')")
      await expect(
        importStagingSeed(client, { databaseName, databaseUrl, seedSql, localJournal })
      ).rejects.toThrow('Staging database is not empty')
    } finally {
      client.close()
    }
  })

  test('refuses a URL whose host belongs to another database or domain', () => {
    expect(() => validateStagingDatabaseIdentity(databaseName, 'libsql://production-example.turso.io')).toThrow(
      'Staging seed target URL does not match the selected database'
    )
    expect(() => validateStagingDatabaseIdentity(databaseName, 'libsql://staging-frijolmagico-example.attacker.io')).toThrow(
      'Staging seed target URL does not match the selected database'
    )
  })
})
