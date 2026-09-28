import { afterEach, describe, expect, test } from 'bun:test'
import { readFileSync } from 'node:fs'
import { mkdtemp, rm } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { join } from 'node:path'

import { createClient } from '@libsql/client'
import { getTableColumns, getTableName } from 'drizzle-orm'

import {
  artistPseudonym,
  artistPrimaryPseudonym,
  artistSlugAlias,
  catalogArtist
} from '../src/db/schema/artist'
import {
  editionParticipation,
  participationActivity,
  participationExhibition
} from '../src/db/schema/participations'

const pseudonymMigration = readFileSync(
  join(import.meta.dir, '../migrations/0024_artist_pseudonyms.sql'),
  'utf8'
)
const slugAliasMigration = readFileSync(
  join(import.meta.dir, '../migrations/0025_catalog_slug_aliases.sql'),
  'utf8'
)
const directories: string[] = []

async function setup() {
  const directory = await mkdtemp(join(tmpdir(), 'artist-pseudonyms-'))
  directories.push(directory)
  const db = createClient({ url: `file:${join(directory, 'test.db')}` })
  await db.execute('PRAGMA foreign_keys = ON')
  await db.execute(`CREATE TABLE artista (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    pseudonimo TEXT NOT NULL UNIQUE,
    slug TEXT NOT NULL UNIQUE,
    created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
  )`)
  await db.execute('CREATE TABLE catalogo_artista (id INTEGER PRIMARY KEY, artista_id INTEGER NOT NULL UNIQUE REFERENCES artista(id), orden TEXT NOT NULL)')
  await db.execute('CREATE TABLE participacion_edicion (id INTEGER PRIMARY KEY, artista_id INTEGER REFERENCES artista(id))')
  await db.execute('CREATE TABLE participacion_exposicion (id INTEGER PRIMARY KEY, participacion_id INTEGER NOT NULL REFERENCES participacion_edicion(id))')
  await db.execute('CREATE TABLE participacion_actividad (id INTEGER PRIMARY KEY, participacion_id INTEGER NOT NULL REFERENCES participacion_edicion(id))')
  await db.execute("INSERT INTO artista (id, pseudonimo, slug) VALUES (1, 'Sol', 'sol'), (2, 'Luna', 'luna')")
  await db.execute("INSERT INTO catalogo_artista (id, artista_id, orden) VALUES (1, 1, '1')")
  await db.execute('INSERT INTO participacion_edicion (id, artista_id) VALUES (10, 1), (20, 2), (30, NULL)')
  await db.execute('INSERT INTO participacion_exposicion (id, participacion_id) VALUES (100, 10), (200, 20)')
  await db.execute('INSERT INTO participacion_actividad (id, participacion_id) VALUES (1000, 10), (2000, 30)')
  for (const migration of [pseudonymMigration, slugAliasMigration]) {
    for (const statement of migration.split('--> statement-breakpoint').map((part) => part.trim()).filter(Boolean)) {
      await db.execute(statement)
    }
  }
  return db
}

afterEach(async () => {
  await Promise.all(directories.splice(0).map((directory) => rm(directory, { recursive: true, force: true })))
})

describe('artist pseudonym migration', () => {
  test('backfills stable current names and every existing artist association without changing legacy columns', async () => {
    const db = await setup()
    expect(getTableName(artistPseudonym)).toBe('artista_pseudonimo')
    expect(Object.values(getTableColumns(artistPseudonym)).map((column) => column.name)).toEqual([
      'id', 'artista_id', 'pseudonimo', 'deleted_at', 'created_at', 'updated_at'
    ])
    expect(getTableName(artistPrimaryPseudonym)).toBe('artista_pseudonimo_principal')
    expect(getTableName(artistSlugAlias)).toBe('artista_slug_alias')
    expect(Object.keys(getTableColumns(artistSlugAlias))).toEqual(['slug', 'artistaId'])
    expect(Object.keys(getTableColumns(catalogArtist))).toContain('pseudonimoId')
    expect(Object.keys(getTableColumns(editionParticipation))).toContain('artistaId')
    expect(Object.keys(getTableColumns(participationExhibition))).toContain('pseudonimoId')
    expect(Object.keys(getTableColumns(participationActivity))).toContain('pseudonimoId')

    const rows = await db.execute(`SELECT a.id, a.pseudonimo, a.slug, pp.pseudonimo_id
      FROM artista a JOIN artista_pseudonimo_principal pp ON pp.artista_id = a.id ORDER BY a.id`)
    expect(rows.rows.map((row) => [row.id, row.pseudonimo, row.slug, row.pseudonimo_id])).toEqual([
      [1, 'Sol', 'sol', 1],
      [2, 'Luna', 'luna', 2]
    ])
    const associations = await db.execute(`SELECT 'catalog' AS kind, pseudonimo_id FROM catalogo_artista
      UNION ALL SELECT 'exhibition', pseudonimo_id FROM participacion_exposicion
      UNION ALL SELECT 'activity', pseudonimo_id FROM participacion_actividad WHERE id = 1000`)
    expect(associations.rows.map((row) => row.pseudonimo_id)).toEqual([1, 1, 2, 1])
    const unassignedActivity = (await db.execute(
      'SELECT artista_id, pseudonimo_id FROM participacion_actividad WHERE id = 2000'
    )).rows[0]
    expect(unassignedActivity?.artista_id).toBeNull()
    expect(unassignedActivity?.pseudonimo_id).toBeNull()
  })

  test('guards canonical slugs against cross-artist aliases while retaining prior slugs', async () => {
    const db = await setup()
    await db.execute("UPDATE artista SET slug = 'sol-nuevo' WHERE id = 1")
    await db.execute("INSERT INTO artista_slug_alias (slug, artista_id) VALUES ('sol', 1)")

    const aliases = await db.execute('SELECT slug, artista_id FROM artista_slug_alias WHERE artista_id = 1')
    expect(aliases.rows.map((row) => [row.slug, row.artista_id])).toEqual([['sol', 1]])
    await expect(db.execute("INSERT INTO artista_slug_alias (slug, artista_id) VALUES ('luna', 1)")).rejects.toThrow(
      'artist slug alias collides with canonical slug'
    )
    await expect(db.execute("UPDATE artista SET slug = 'sol' WHERE id = 1")).rejects.toThrow(
      'canonical artist slug collides with alias'
    )
    await expect(db.execute("UPDATE artista SET slug = 'sol' WHERE id = 2")).rejects.toThrow(
      'canonical artist slug collides with alias'
    )
    await expect(db.execute("INSERT INTO artista_slug_alias (slug, artista_id) VALUES ('sol', 2)")).rejects.toThrow()
  })

  test('enforces active global uniqueness, ownership, referenced retirement and primary retention', async () => {
    const db = await setup()
    await expect(db.execute("INSERT INTO artista_pseudonimo (artista_id, pseudonimo) VALUES (2, 'Sol')")).rejects.toThrow()
    await db.execute("INSERT INTO artista_pseudonimo (artista_id, pseudonimo) VALUES (1, 'Sol Dos')")
    const replacement = (await db.execute("SELECT id FROM artista_pseudonimo WHERE artista_id = 1 AND pseudonimo = 'Sol Dos'")).rows[0]?.id
    await db.execute('UPDATE artista_pseudonimo_principal SET pseudonimo_id = ? WHERE artista_id = 1', [replacement])
    await expect(db.execute("UPDATE artista_pseudonimo SET deleted_at = CURRENT_TIMESTAMP WHERE id = 1")).rejects.toThrow()
    await db.execute('UPDATE catalogo_artista SET pseudonimo_id = ? WHERE id = 1', [replacement])
    await db.execute('UPDATE participacion_exposicion SET pseudonimo_id = ? WHERE id = 100', [replacement])
    await db.execute('UPDATE participacion_actividad SET pseudonimo_id = ? WHERE id = 1000', [replacement])
    await db.execute("UPDATE artista_pseudonimo SET deleted_at = CURRENT_TIMESTAMP WHERE id = 1")
    const retiredName = await db.execute("INSERT INTO artista_pseudonimo (artista_id, pseudonimo) VALUES (2, 'Sol')")
    expect(retiredName.rowsAffected).toBe(1)
    await expect(db.execute('UPDATE catalogo_artista SET pseudonimo_id = 2 WHERE id = 1')).rejects.toThrow()
    await expect(db.execute('UPDATE participacion_exposicion SET pseudonimo_id = 2 WHERE id = 100')).rejects.toThrow()
    await expect(db.execute('UPDATE participacion_actividad SET pseudonimo_id = 2 WHERE id = 1000')).rejects.toThrow()
    await expect(db.execute('DELETE FROM artista_pseudonimo_principal WHERE artista_id = 2')).rejects.toThrow()
  })

  test('prevents changing a pseudonym owner after associations have been created', async () => {
    const db = await setup()

    await expect(db.execute('UPDATE artista_pseudonimo SET artista_id = 2 WHERE id = 1')).rejects.toThrow(
      'pseudonym ownership is immutable'
    )
    expect((await db.execute('SELECT artista_id FROM artista_pseudonimo WHERE id = 1')).rows[0]?.artista_id).toBe(1)
    expect((await db.execute(`SELECT pseudonimo_id FROM catalogo_artista WHERE id = 1`)).rows[0]?.pseudonimo_id).toBe(1)
    expect((await db.execute('SELECT pseudonimo_id FROM participacion_exposicion WHERE id = 100')).rows[0]?.pseudonimo_id).toBe(1)
    expect((await db.execute('SELECT pseudonimo_id FROM participacion_actividad WHERE id = 1000')).rows[0]?.pseudonimo_id).toBe(1)
  })

  test('keeps the trigger-created primary identity when adding only additional pseudonyms', async () => {
    const db = await setup()
    await db.execute("INSERT INTO artista (id, pseudonimo, slug) VALUES (3, 'Primary Name', 'primary-name')")

    const primaryBefore = (await db.execute(`SELECT pp.pseudonimo_id, p.pseudonimo
      FROM artista_pseudonimo_principal pp
      JOIN artista_pseudonimo p ON p.id = pp.pseudonimo_id
      WHERE pp.artista_id = 3`)).rows[0]
    expect(primaryBefore?.pseudonimo).toBe('Primary Name')

    await db.execute("INSERT INTO artista_pseudonimo (artista_id, pseudonimo) VALUES (3, 'Additional Name')")
    const primaryAfter = (await db.execute(`SELECT pp.pseudonimo_id, p.pseudonimo
      FROM artista_pseudonimo_principal pp
      JOIN artista_pseudonimo p ON p.id = pp.pseudonimo_id
      WHERE pp.artista_id = 3`)).rows[0]
    const pseudonyms = await db.execute('SELECT id, pseudonimo FROM artista_pseudonimo WHERE artista_id = 3 ORDER BY id')

    expect(primaryAfter?.pseudonimo_id).toBe(primaryBefore?.pseudonimo_id)
    expect(primaryAfter?.pseudonimo).toBe('Primary Name')
    expect(pseudonyms.rows).toHaveLength(2)
    expect(pseudonyms.rows.map((row) => row.pseudonimo)).toEqual(['Primary Name', 'Additional Name'])
  })

  test('preserves legacy artist writers and allows primary replacement before retirement', async () => {
    const db = await setup()
    await db.execute("INSERT INTO artista (id, pseudonimo, slug) VALUES (3, 'Cometa', 'cometa')")
    expect((await db.execute('SELECT p.pseudonimo FROM artista_pseudonimo_principal pp JOIN artista_pseudonimo p ON p.id = pp.pseudonimo_id WHERE pp.artista_id = 3')).rows[0]?.pseudonimo).toBe('Cometa')
    await db.execute("UPDATE artista SET pseudonimo = 'Cometa Nova' WHERE id = 3")
    const current = await db.execute(`SELECT p.id, p.pseudonimo FROM artista_pseudonimo_principal pp
      JOIN artista_pseudonimo p ON p.id = pp.pseudonimo_id WHERE pp.artista_id = 3`)
    expect(current.rows[0]?.pseudonimo).toBe('Cometa Nova')
    await db.execute("INSERT INTO artista_pseudonimo (artista_id, pseudonimo) VALUES (3, 'Cometa Uno')")
    const newId = (await db.execute("SELECT id FROM artista_pseudonimo WHERE artista_id = 3 AND pseudonimo = 'Cometa Uno'")).rows[0]?.id
    await db.execute('UPDATE artista_pseudonimo_principal SET pseudonimo_id = ? WHERE artista_id = 3', [newId])
    await db.execute("UPDATE artista_pseudonimo SET deleted_at = CURRENT_TIMESTAMP WHERE id = ?", [current.rows[0]?.id])
    expect((await db.execute('SELECT pseudonimo_id FROM artista_pseudonimo_principal WHERE artista_id = 3')).rows[0]?.pseudonimo_id).toBe(newId)
  })
})
