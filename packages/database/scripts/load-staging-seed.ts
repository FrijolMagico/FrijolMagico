import { readFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

import { createClient, type Client } from '@libsql/client'

const packageRoot = join(dirname(fileURLToPath(import.meta.url)), '..')
const migrationsFolder = join(packageRoot, 'migrations')
const seedPath = join(packageRoot, 'seed/seed.sql')
const journalPath = join(migrationsFolder, 'meta/_journal.json')
const stagingDatabaseName = 'staging-frijolmagico'
const expectedCounts = {
  artista: 70,
  catalogo_artista: 38,
  temp_edition_participations: 60
} as const

type Journal = { entries: { when: number }[] }
type DatabaseExecutor = Pick<Client, 'execute'>

export function parseSeedStatements(sql: string): string[] {
  return sql
    .split('\n')
    .filter((line) => !line.trim().startsWith('--'))
    .join('\n')
    .split(';')
    .map((statement) => statement.trim())
    .filter((statement) => statement.length > 0)
}

export function validateStagingDatabaseIdentity(databaseName: string, databaseUrl: string): URL {
  if (databaseName !== stagingDatabaseName || databaseUrl !== databaseUrl.trim()) {
    throw new Error('Staging seed target identity is invalid')
  }

  let url: URL
  try {
    url = new URL(databaseUrl)
  } catch {
    throw new Error('Staging seed target URL is invalid')
  }

  if (
    !['libsql:', 'https:'].includes(url.protocol) ||
    !new RegExp(`^${stagingDatabaseName}-[-a-z0-9]+(?:\\.[-a-z0-9]+)?\\.turso\\.io$`, 'i').test(url.hostname) ||
    url.username ||
    url.password ||
    url.port ||
    (url.pathname !== '/' && url.pathname !== '') ||
    url.search ||
    url.hash
  ) {
    throw new Error('Staging seed target URL does not match the selected database')
  }

  return url
}

function quoteIdentifier(identifier: string): string {
  return `"${identifier.replaceAll('"', '""')}"`
}

async function assertForeignKeysEnabled(executor: DatabaseExecutor): Promise<void> {
  const result = await executor.execute('PRAGMA foreign_keys')
  if (Number(result.rows[0]?.foreign_keys) !== 1) {
    throw new Error('Foreign-key enforcement is not enabled')
  }
}

async function assertEmptyApplicationTables(executor: DatabaseExecutor): Promise<void> {
  const result = await executor.execute(`
    SELECT name FROM sqlite_schema
    WHERE type = 'table' AND name NOT LIKE 'sqlite_%'
      AND name <> '__drizzle_migrations'
  `)
  for (const row of result.rows) {
    const table = String(row.name)
    const count = await executor.execute(`SELECT COUNT(*) AS row_count FROM ${quoteIdentifier(table)}`)
    if (Number(count.rows[0]?.row_count) !== 0) {
      throw new Error('Staging database is not empty')
    }
  }
}

async function assertMigrationParity(executor: DatabaseExecutor, localJournal: Journal): Promise<void> {
  const remote = await executor.execute('SELECT created_at FROM __drizzle_migrations ORDER BY created_at')
  const remoteHistory = remote.rows.map((row) => Number(row.created_at))
  const localHistory = localJournal.entries.map((entry) => entry.when)
  if (
    remoteHistory.length !== localHistory.length ||
    remoteHistory.some((createdAt, index) => createdAt !== localHistory[index])
  ) {
    throw new Error('Staging migration history does not match the local journal')
  }
}

async function getExpectedCounts(executor: DatabaseExecutor) {
  const result = await executor.execute(`
    SELECT
      (SELECT COUNT(*) FROM artista) AS artista,
      (SELECT COUNT(*) FROM catalogo_artista) AS catalogo_artista,
      (SELECT COUNT(*) FROM participacion_edicion participation
        JOIN evento_edicion edition ON edition.id = participation.edicion_id
        WHERE edition.slug = 'temp') AS temp_edition_participations
  `)
  return {
    artista: Number(result.rows[0]?.artista),
    catalogo_artista: Number(result.rows[0]?.catalogo_artista),
    temp_edition_participations: Number(result.rows[0]?.temp_edition_participations)
  }
}

async function assertExpectedCounts(executor: DatabaseExecutor): Promise<typeof expectedCounts> {
  const counts = await getExpectedCounts(executor)
  if (JSON.stringify(counts) !== JSON.stringify(expectedCounts)) {
    throw new Error('Staging seed counts do not match the expected fixture')
  }
  return counts
}

async function assertNoForeignKeyViolations(executor: DatabaseExecutor): Promise<void> {
  const violations = await executor.execute('PRAGMA foreign_key_check')
  if (violations.rows.length > 0) {
    throw new Error('Staging seed has foreign-key violations')
  }
}

export async function importStagingSeed(
  client: Client,
  options: { databaseName: string; databaseUrl: string; seedSql: string; localJournal: Journal }
) {
  validateStagingDatabaseIdentity(options.databaseName, options.databaseUrl)
  await assertMigrationParity(client, options.localJournal)
  await assertEmptyApplicationTables(client)
  await assertForeignKeysEnabled(client)

  const statements = parseSeedStatements(options.seedSql)
  const transaction = await client.transaction('write')
  let committed = false
  try {
    await assertForeignKeysEnabled(transaction)
    await assertMigrationParity(transaction, options.localJournal)
    await assertEmptyApplicationTables(transaction)
    for (const [index, statement] of statements.entries()) {
      try {
        await transaction.execute(statement)
      } catch (error) {
        throw new Error(`Seed failed at statement ${index + 1}/${statements.length}`, { cause: error })
      }
    }

    await assertExpectedCounts(transaction)
    await assertNoForeignKeyViolations(transaction)
    await transaction.commit()
    committed = true

    const counts = await assertExpectedCounts(client)
    await assertNoForeignKeyViolations(client)
    await assertForeignKeysEnabled(client)
    return { statements: statements.length, counts, foreignKeyViolations: 0 }
  } catch (error) {
    if (!committed) await transaction.rollback()
    throw error
  }
}

export async function runStagingSeedImport() {
  const databaseName = process.env.TURSO_STAGING_DATABASE_NAME
  const databaseUrl = process.env.TURSO_STAGING_DATABASE_URL
  const authToken = process.env.TURSO_STAGING_AUTH_TOKEN
  if (!databaseName || !databaseUrl || !authToken || !authToken.trim() || authToken !== authToken.trim()) {
    throw new Error('Missing or invalid staging database credentials')
  }

  validateStagingDatabaseIdentity(databaseName, databaseUrl)
  const localJournal = JSON.parse(readFileSync(journalPath, 'utf8')) as Journal
  const seedSql = readFileSync(seedPath, 'utf8')
  const client = createClient({ url: databaseUrl, authToken })
  try {
    return await importStagingSeed(client, { databaseName, databaseUrl, seedSql, localJournal })
  } finally {
    client.close()
  }
}

if (process.argv[1] && fileURLToPath(import.meta.url) === process.argv[1]) {
  if (process.argv.length !== 2) {
    console.error('Staging synthetic seed load: FAIL; command-line arguments are not accepted')
    process.exitCode = 1
  } else {
    try {
      const result = await runStagingSeedImport()
      console.log(`Staging synthetic seed load: PASS (${result.statements} statements; exact fixture counts verified)`)
    } catch {
      console.error('Staging synthetic seed load: FAIL; no automatic retry performed')
      process.exitCode = 1
    }
  }
}
