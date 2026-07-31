import { existsSync, rmSync, readFileSync } from 'node:fs'
import { resolve, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'
import { createClient } from '@libsql/client'
import { drizzle } from 'drizzle-orm/libsql'
import { migrate } from 'drizzle-orm/libsql/migrator'

const __dirname = dirname(fileURLToPath(import.meta.url))
const DB_PATH = resolve(__dirname, '..', 'local.dev.db')
const MIGRATIONS_DIR = resolve(__dirname, '..', 'migrations')
const SEED_PATH = resolve(__dirname, '..', 'seed', 'seed.sql')

async function main() {
  // ── Step 1: Clean up any existing local.db ──────────────────────────────
  // Remove the database file and stale WAL/SHM artifacts from previous runs.
  // This ensures a clean slate so seed INSERTs never collide with existing IDs.

  for (const path of [DB_PATH, `${DB_PATH}-wal`, `${DB_PATH}-shm`]) {
    if (existsSync(path)) {
      rmSync(path)
      console.log(`  removed ${path}`)
    }
  }

  // ── Step 2: Create a fresh local.db and apply all migrations ────────────
  // `createClient` with `file:` URL auto-creates the SQLite file.
  // `drizzle-orm/libsql/migrator` reads the journal at migrations/meta/_journal.json
  // and applies every pending migration in order.

  console.log('\n  applying migrations...')
  const client = createClient({ url: `file:${DB_PATH}` })
  const orm = drizzle(client)
  await migrate(orm, { migrationsFolder: MIGRATIONS_DIR })

  // ── Step 3: Seed data ───────────────────────────────────────────────────
  // Read the seed SQL, strip comment lines, split into individual statements,
  // and execute each one. Foreign keys are temporarily disabled so that INSERTs
  // with explicit FK references can be processed in any order; they are
  // re‑enabled after the seed completes.

  console.log('  seeding data...')
  const seedSql = readFileSync(SEED_PATH, 'utf-8')

  const statements = seedSql
    .split('\n')
    .filter((line) => !line.trim().startsWith('--'))  // strip full-line comments
    .join('\n')
    .split(';')
    .map((s) => s.trim())
    .filter((s) => s.length > 0)

  await client.execute('PRAGMA foreign_keys = OFF')

  for (const stmt of statements) {
    try {
      await client.execute(stmt)
    } catch (err) {
      const preview = stmt.length > 120 ? `${stmt.slice(0, 120)}...` : stmt
      console.error(`\n  ✗ Error executing:\n  ${preview}`)
      throw err
    }
  }

  await client.execute('PRAGMA foreign_keys = ON')

  // ── Done ────────────────────────────────────────────────────────────────
  const dbSize = existsSync(DB_PATH)
    ? ` (${(readFileSync(DB_PATH).length / 1024).toFixed(0)} KB)`
    : ''

  console.log(`\n  ✓ local.db ready${dbSize}`)

  client.close()
}

main().catch((err) => {
  console.error('\n  seed failed:', err.message)
  process.exit(1)
})
