import { afterEach, describe, expect, test } from 'bun:test'
import { existsSync, readFileSync } from 'node:fs'
import { mkdtemp, rm } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { join } from 'node:path'

import { createClient } from '@libsql/client'

const migrationsDirectory = join(import.meta.dir, '../migrations')
const migrationTag = '0018_add_edition_publication'
const migrationPath = join(migrationsDirectory, `${migrationTag}.sql`)
const journalPath = join(migrationsDirectory, 'meta/_journal.json')
const originalEventMigrationPath = join(migrationsDirectory, '0002_evento.sql')
const schemaPath = join(import.meta.dir, '../src/db/schema/events.ts')
const temporaryDirectories: string[] = []

async function createIsolatedDatabase() {
  const directory = await mkdtemp(join(tmpdir(), 'frijolmagico-publication-'))
  temporaryDirectories.push(directory)

  return createClient({ url: `file:${join(directory, 'test.db')}` })
}

async function createEventEditionTable(database: ReturnType<typeof createClient>) {
  await database.execute(`
    CREATE TABLE evento_edicion (
      id INTEGER PRIMARY KEY,
      nombre TEXT,
      updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
    );
  `)
  await database.execute(`
    CREATE TRIGGER trg_evento_edicion_updated_at
    AFTER UPDATE ON evento_edicion
    FOR EACH ROW
    WHEN NEW.updated_at = OLD.updated_at
    BEGIN
      UPDATE evento_edicion SET updated_at = CURRENT_TIMESTAMP
      WHERE id = NEW.id AND updated_at = OLD.updated_at;
    END;
  `)
}

async function applyPublicationMigration() {
  const database = await createIsolatedDatabase()
  const migration = readFileSync(migrationPath, 'utf8')

  await createEventEditionTable(database)

  for (const statement of migration
    .split('--> statement-breakpoint')
    .map((value) => value.trim())
    .filter(Boolean)) {
    await database.execute(statement)
  }

  return database
}

afterEach(async () => {
  await Promise.all(
    temporaryDirectories.splice(0).map((directory) => rm(directory, { recursive: true, force: true }))
  )
})

describe('event edition publication rollout', () => {
  test('defines a boolean Drizzle field that defaults to false', () => {
    const schema = readFileSync(schemaPath, 'utf8')

    expect(schema).toContain(
      "published: integer('published', { mode: 'boolean' }).notNull().default(false)"
    )
  })

  test('generates a tracked migration that updates existing editions and defaults new ones to unpublished', () => {
    expect(existsSync(migrationPath)).toBe(true)

    const migration = readFileSync(migrationPath, 'utf8')
    const journal = readFileSync(journalPath, 'utf8')

    expect(migration).toContain(
      'ALTER TABLE evento_edicion ADD COLUMN published INTEGER NOT NULL DEFAULT 0 CHECK (published IN (0, 1));'
    )
    expect(migration).toContain('--> statement-breakpoint')
    expect(migration).toContain('UPDATE evento_edicion SET published = 1;')
    expect(migration).not.toMatch(/CREATE\s+(?:UNIQUE\s+)?INDEX[^;]*published/i)
    expect(journal).toContain(`"tag": "${migrationTag}"`)
  })

  test('updates existing editions, defaults future editions to unpublished, rejects invalid physical values, and refreshes updated_at', async () => {
    const database = await createIsolatedDatabase()
    const migration = readFileSync(migrationPath, 'utf8')

    await createEventEditionTable(database)
    await database.execute(
      "INSERT INTO evento_edicion (id, nombre, updated_at) VALUES (1, 'Existing edition', '2000-01-01 00:00:00')"
    )

    for (const statement of migration
      .split('--> statement-breakpoint')
      .map((value) => value.trim())
      .filter(Boolean)) {
      await database.execute(statement)
    }

    const existing = await database.execute(
      'SELECT published, updated_at FROM evento_edicion WHERE id = 1'
    )
    await database.execute("INSERT INTO evento_edicion (id, nombre) VALUES (2, 'Future edition')")
    const future = await database.execute(
      'SELECT published FROM evento_edicion WHERE id = 2'
    )

    expect(existing.rows[0]?.published).toBe(1)
    expect(existing.rows[0]?.updated_at).not.toContain('2000-01-01')
    expect(future.rows[0]?.published).toBe(0)
    await expect(database.execute('UPDATE evento_edicion SET published = 2 WHERE id = 2')).rejects.toThrow()
  })

  test('applies successfully when no editions exist before the update', async () => {
    const database = await applyPublicationMigration()

    await database.execute("INSERT INTO evento_edicion (id, nombre) VALUES (1, 'Future edition')")
    const result = await database.execute('SELECT published FROM evento_edicion WHERE id = 1')

    expect(result.rows[0]?.published).toBe(0)
  })

  test('leaves the existing updated_at trigger responsible for the accepted existing-row update refresh', () => {
    const originalMigration = readFileSync(originalEventMigrationPath, 'utf8')

    expect(originalMigration).toContain('CREATE TRIGGER trg_evento_edicion_updated_at')
    expect(originalMigration).toContain('AFTER UPDATE ON evento_edicion')
    expect(originalMigration).toContain('UPDATE evento_edicion SET updated_at = CURRENT_TIMESTAMP')
  })
})
