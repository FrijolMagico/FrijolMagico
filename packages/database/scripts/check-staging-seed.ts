import { readFileSync } from 'node:fs'
import { mkdtemp, rm } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

import { createClient } from '@libsql/client'
import { drizzle } from 'drizzle-orm/libsql'
import { migrate } from 'drizzle-orm/libsql/migrator'

const packageRoot = join(dirname(fileURLToPath(import.meta.url)), '..')
const migrationsFolder = join(packageRoot, 'migrations')
const seedPath = join(packageRoot, 'seed/seed.sql')
const expectedCounts = {
  artista: 70,
  catalogo_artista: 38,
  temp_edition_participations: 60
} as const

export async function checkStagingSeedReadiness() {
  const directory = await mkdtemp(join(tmpdir(), 'staging-seed-readiness-'))
  const client = createClient({ url: `file:${join(directory, 'readiness.db')}` })

  try {
    await client.execute('PRAGMA foreign_keys = ON')
    await migrate(drizzle(client), { migrationsFolder })

    const foreignKeys = await client.execute('PRAGMA foreign_keys')
    if (Number(foreignKeys.rows[0]?.foreign_keys) !== 1) {
      throw new Error('Foreign-key enforcement is not enabled')
    }

    const tables = await client.execute(`
      SELECT name FROM sqlite_schema
      WHERE type = 'table' AND name NOT LIKE 'sqlite_%'
        AND name <> '__drizzle_migrations'
    `)
    for (const row of tables.rows) {
      const table = String(row.name)
      const count = await client.execute(`SELECT COUNT(*) AS row_count FROM "${table.replaceAll('"', '""')}"`)
      if (Number(count.rows[0]?.row_count) !== 0) {
        throw new Error(`Fresh migrated table is not empty: ${table}`)
      }
    }

    const statements = readFileSync(seedPath, 'utf8')
      .split('\n')
      .filter((line) => !line.trim().startsWith('--'))
      .join('\n')
      .split(';')
      .map((statement) => statement.trim())
      .filter((statement) => statement.length > 0)

    const transaction = await client.transaction('write')
    try {
      for (const [index, statement] of statements.entries()) {
        try {
          await transaction.execute(statement)
        } catch (error) {
          throw new Error(`Seed failed at statement ${index + 1}/${statements.length}`, { cause: error })
        }
      }

      const counts = await transaction.execute(`
        SELECT
          (SELECT COUNT(*) FROM artista) AS artista,
          (SELECT COUNT(*) FROM catalogo_artista) AS catalogo_artista,
          (SELECT COUNT(*) FROM participacion_edicion participation
            JOIN evento_edicion edition ON edition.id = participation.edicion_id
            WHERE edition.slug = 'temp') AS temp_edition_participations
      `)
      const observed = {
        artista: Number(counts.rows[0]?.artista),
        catalogo_artista: Number(counts.rows[0]?.catalogo_artista),
        temp_edition_participations: Number(counts.rows[0]?.temp_edition_participations)
      }
      if (JSON.stringify(observed) !== JSON.stringify(expectedCounts)) {
        throw new Error(`Fixture counts do not match: ${JSON.stringify(observed)}`)
      }

      const violations = await transaction.execute('PRAGMA foreign_key_check')
      if (violations.rows.length > 0) {
        throw new Error(`Seed has ${violations.rows.length} foreign-key violation(s)`)
      }

      await transaction.commit()
      return { statements: statements.length, counts: observed, foreignKeyViolations: violations.rows.length }
    } catch (error) {
      await transaction.rollback()
      throw error
    }
  } finally {
    client.close()
    await rm(directory, { recursive: true, force: true })
  }
}

if (process.argv[1] && fileURLToPath(import.meta.url) === process.argv[1]) {
  try {
    const result = await checkStagingSeedReadiness()
    console.log(`Offline staging seed readiness: PASS (${result.statements} statements, foreign keys enabled)`)
    console.log(`Exact fixture counts: ${JSON.stringify(result.counts)}`)
  } catch {
    console.error('Offline staging seed readiness: FAIL; inspect the local fixture and migration contract')
    process.exitCode = 1
  }
}
