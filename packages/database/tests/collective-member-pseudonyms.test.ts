import { describe, expect, test } from 'bun:test'
import { readFileSync } from 'node:fs'
import { join } from 'node:path'

import { createClient } from '@libsql/client'
import { getTableColumns, getTableName } from 'drizzle-orm'

import { collectiveArtist } from '../src/db/schema/artist'

const migrations = [
  '0024_artist_pseudonyms.sql',
  '0025_catalog_slug_aliases.sql',
  '0026_collective_member_pseudonyms.sql'
].map((filename) =>
  readFileSync(join(import.meta.dir, '../migrations', filename), 'utf8')
)

async function setup() {
  const db = createClient({ url: 'file::memory:' })
  await db.execute('PRAGMA foreign_keys = ON')
  await db.execute(`CREATE TABLE artista (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    pseudonimo TEXT NOT NULL UNIQUE,
    slug TEXT NOT NULL UNIQUE,
    created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
  )`)
  await db.execute(`CREATE TABLE catalogo_artista (
    id INTEGER PRIMARY KEY,
    artista_id INTEGER NOT NULL UNIQUE REFERENCES artista(id),
    orden TEXT NOT NULL
  )`)
  await db.execute('CREATE TABLE participacion_edicion (id INTEGER PRIMARY KEY, artista_id INTEGER REFERENCES artista(id))')
  await db.execute('CREATE TABLE participacion_exposicion (id INTEGER PRIMARY KEY, participacion_id INTEGER NOT NULL REFERENCES participacion_edicion(id))')
  await db.execute('CREATE TABLE participacion_actividad (id INTEGER PRIMARY KEY, participacion_id INTEGER NOT NULL REFERENCES participacion_edicion(id))')
  await db.execute('CREATE TABLE agrupacion (id INTEGER PRIMARY KEY)')
  await db.execute(`CREATE TABLE agrupacion_artista (
    agrupacion_id INTEGER NOT NULL,
    artista_id INTEGER NOT NULL,
    rol TEXT,
    activo INTEGER NOT NULL DEFAULT 1,
    created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (agrupacion_id, artista_id)
  )`)
  await db.execute("INSERT INTO artista (id, pseudonimo, slug) VALUES (1, 'Sol', 'sol'), (2, 'Luna', 'luna')")
  await db.execute("INSERT INTO catalogo_artista (id, artista_id, orden) VALUES (1, 1, '1')")
  await db.execute('INSERT INTO agrupacion (id) VALUES (10), (20)')
  await db.execute('INSERT INTO agrupacion_artista (agrupacion_id, artista_id) VALUES (10, 1), (10, 2)')

  for (const migration of migrations) {
    for (const statement of migration
      .split('--> statement-breakpoint')
      .map((part) => part.trim())
      .filter(Boolean)) {
      await db.execute(statement)
    }
  }
  return db
}

describe('collective member pseudonym migration', () => {
  test('backfills each membership from the artist primary and adds a nullable schema column', async () => {
    const db = await setup()
    expect(getTableName(collectiveArtist)).toBe('agrupacion_artista')
    expect(Object.keys(getTableColumns(collectiveArtist))).toContain('pseudonimoId')

    const rows = await db.execute(`SELECT aa.artista_id, aa.pseudonimo_id, pp.pseudonimo_id AS primary_id
      FROM agrupacion_artista aa
      JOIN artista_pseudonimo_principal pp ON pp.artista_id = aa.artista_id
      ORDER BY aa.artista_id`)
    expect(rows.rows.map((row) => [row.artista_id, row.pseudonimo_id, row.primary_id])).toEqual([
      [1, 1, 1],
      [2, 2, 2]
    ])

    await db.execute('INSERT INTO agrupacion_artista (agrupacion_id, artista_id) VALUES (20, 1)')
    const nullable = await db.execute(
      'SELECT pseudonimo_id FROM agrupacion_artista WHERE agrupacion_id = 20 AND artista_id = 1'
    )
    expect(nullable.rows[0]?.pseudonimo_id).toBeNull()
  })

  test('rejects pseudonyms owned by another artist or no longer active on insert and update', async () => {
    const db = await setup()
    await expect(db.execute(
      'INSERT INTO agrupacion_artista (agrupacion_id, artista_id, pseudonimo_id) VALUES (20, 1, 2)'
    )).rejects.toThrow('collective member pseudonym must belong to its artist')

    await db.execute("INSERT INTO artista_pseudonimo (artista_id, pseudonimo) VALUES (1, 'Sol Alternativo')")
    const aliasId = (await db.execute(
      "SELECT id FROM artista_pseudonimo WHERE pseudonimo = 'Sol Alternativo'"
    )).rows[0]?.id
    await db.execute('UPDATE agrupacion_artista SET pseudonimo_id = ? WHERE agrupacion_id = 10 AND artista_id = 1', [aliasId])
    await expect(db.execute(
      'UPDATE agrupacion_artista SET artista_id = 2 WHERE agrupacion_id = 10 AND artista_id = 1'
    )).rejects.toThrow('collective member pseudonym must belong to its artist')
    await db.execute('UPDATE agrupacion_artista SET pseudonimo_id = NULL WHERE agrupacion_id = 10 AND artista_id = 1')
    await db.execute('UPDATE artista_pseudonimo SET deleted_at = CURRENT_TIMESTAMP WHERE id = ?', [aliasId])
    await expect(db.execute(
      'INSERT INTO agrupacion_artista (agrupacion_id, artista_id, pseudonimo_id) VALUES (20, 1, ?)',
      [aliasId]
    )).rejects.toThrow('collective member pseudonym must belong to its artist')
  })

  test('guards retirement and deletion of member pseudonyms while preserving existing reference guards', async () => {
    const db = await setup()
    await db.execute("INSERT INTO artista_pseudonimo (artista_id, pseudonimo) VALUES (1, 'Sol Alternativo')")
    const aliasId = (await db.execute(
      "SELECT id FROM artista_pseudonimo WHERE pseudonimo = 'Sol Alternativo'"
    )).rows[0]?.id
    await db.execute('UPDATE agrupacion_artista SET pseudonimo_id = ? WHERE agrupacion_id = 10 AND artista_id = 1', [aliasId])
    await expect(db.execute('UPDATE artista_pseudonimo SET deleted_at = CURRENT_TIMESTAMP WHERE id = ?', [aliasId]))
      .rejects.toThrow('cannot retire a referenced pseudonym')
    await expect(db.execute('DELETE FROM artista_pseudonimo WHERE id = ?', [aliasId]))
      .rejects.toThrow('cannot delete a referenced pseudonym')

    await db.execute('UPDATE agrupacion_artista SET pseudonimo_id = NULL WHERE agrupacion_id = 10 AND artista_id = 1')
    await db.execute('UPDATE catalogo_artista SET pseudonimo_id = ? WHERE id = 1', [aliasId])
    await expect(db.execute('UPDATE artista_pseudonimo SET deleted_at = CURRENT_TIMESTAMP WHERE id = ?', [aliasId]))
      .rejects.toThrow('cannot retire a referenced pseudonym')
    await expect(db.execute('DELETE FROM artista_pseudonimo WHERE id = ?', [aliasId]))
      .rejects.toThrow('cannot delete a referenced pseudonym')
  })
})
