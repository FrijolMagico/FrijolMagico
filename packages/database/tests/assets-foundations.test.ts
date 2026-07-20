import { afterEach, describe, expect, test } from 'bun:test'
import { existsSync, readFileSync } from 'node:fs'
import { mkdtemp, rm } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { join } from 'node:path'

import { createClient } from '@libsql/client'
import { drizzle } from 'drizzle-orm/libsql'
import { migrate } from 'drizzle-orm/libsql/migrator'

const migrationsDirectory = join(import.meta.dir, '../migrations')
const migrationTag = '0019_add_asset_foundations'
const migrationPath = join(migrationsDirectory, `${migrationTag}.sql`)
const journalPath = join(migrationsDirectory, 'meta/_journal.json')
const snapshotPath = join(migrationsDirectory, 'meta/0019_snapshot.json')
const artistSchemaPath = join(import.meta.dir, '../src/db/schema/artist.ts')
const eventSchemaPath = join(import.meta.dir, '../src/db/schema/events.ts')
const temporaryDirectories: string[] = []

async function createIsolatedDatabase() {
  const directory = await mkdtemp(join(tmpdir(), 'frijolmagico-assets-'))
  temporaryDirectories.push(directory)

  return createClient({ url: `file:${join(directory, 'test.db')}` })
}

async function createLegacyTables(database: ReturnType<typeof createClient>) {
  await database.execute(`
    CREATE TABLE artista_imagen (
      id INTEGER PRIMARY KEY,
      imagen_url TEXT NOT NULL,
      tipo TEXT NOT NULL
    );
  `)
  await database.execute(`
    CREATE TABLE evento_edicion (
      id INTEGER PRIMARY KEY,
      poster_url TEXT
    );
  `)
}

async function applyMigration(database: ReturnType<typeof createClient>) {
  const migration = readFileSync(migrationPath, 'utf8')

  for (const statement of migration
    .split('--> statement-breakpoint')
    .map((value) => value.trim())
    .filter(Boolean)) {
    await database.execute(statement)
  }
}

afterEach(async () => {
  await Promise.all(
    temporaryDirectories.splice(0).map((directory) =>
      rm(directory, { recursive: true, force: true })
    )
  )
})

describe('asset foundations migration', () => {
  test('maps nullable English fields to legacy database columns', () => {
    expect(readFileSync(artistSchemaPath, 'utf8')).toContain(
      "artistAvatarVersion: text('imagen_version')"
    )
    expect(readFileSync(eventSchemaPath, 'utf8')).toContain(
      "editionPosterPath: text('poster_path')"
    )
    expect(readFileSync(eventSchemaPath, 'utf8')).toContain(
      "editionPosterVersion: text('poster_version')"
    )
  })

  test('preserves legacy rows and adds nullable managed columns on an isolated database', async () => {
    const database = await createIsolatedDatabase()
    await createLegacyTables(database)
    await database.execute(
      "INSERT INTO artista_imagen (id, imagen_url, tipo) VALUES (1, 'avatars/legacy.webp', 'avatar')"
    )
    await database.execute(
      "INSERT INTO evento_edicion (id, poster_url) VALUES (1, 'https://legacy.example/poster.webp')"
    )

    await applyMigration(database)

    const avatar = await database.execute(
      'SELECT imagen_url, imagen_version FROM artista_imagen WHERE id = 1'
    )
    const edition = await database.execute(
      'SELECT poster_url, poster_path, poster_version FROM evento_edicion WHERE id = 1'
    )

    expect(avatar.rows[0]).toMatchObject({
      imagen_url: 'avatars/legacy.webp',
      imagen_version: null
    })
    expect(edition.rows[0]).toMatchObject({
      poster_url: 'https://legacy.example/poster.webp',
      poster_path: null,
      poster_version: null
    })
  })

  test('keeps SQL, snapshot, and journal metadata in agreement', () => {
    const migration = readFileSync(migrationPath, 'utf8')
    const snapshot = readFileSync(snapshotPath, 'utf8')
    const journal = readFileSync(journalPath, 'utf8')

    expect(migration).toContain('ALTER TABLE artista_imagen ADD COLUMN imagen_version TEXT;')
    expect(migration).toContain('ALTER TABLE evento_edicion ADD COLUMN poster_path TEXT;')
    expect(migration).toContain('ALTER TABLE evento_edicion ADD COLUMN poster_version TEXT;')
    expect(snapshot).toContain('"dialect": "sqlite"')
    expect(journal).toContain(`"tag": "${migrationTag}"`)
  })

  test('fails visibly when the direct migration is applied twice', async () => {
    const database = await createIsolatedDatabase()
    await createLegacyTables(database)
    await applyMigration(database)

    await expect(applyMigration(database)).rejects.toThrow()
  })

  test('uses the repository migrator journal to make the second full migration run a no-op', async () => {
    const database = await createIsolatedDatabase()
    const orm = drizzle(database)

    await migrate(orm, { migrationsFolder: migrationsDirectory })
    const firstJournal = await database.execute(
      'SELECT count(*) AS count FROM __drizzle_migrations'
    )

    await expect(
      migrate(orm, { migrationsFolder: migrationsDirectory })
    ).resolves.toBeUndefined()

    const secondJournal = await database.execute(
      'SELECT count(*) AS count FROM __drizzle_migrations'
    )
    expect(secondJournal.rows[0]?.count).toBe(firstJournal.rows[0]?.count)
  })
})
