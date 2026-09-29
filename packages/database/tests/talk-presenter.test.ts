import { afterEach, describe, expect, test } from 'bun:test'
import { readFileSync } from 'node:fs'
import { mkdtemp, rm } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { join } from 'node:path'

import { createClient } from '@libsql/client'
import { getTableColumns, getTableName } from 'drizzle-orm'

import { activity } from '../src/db/schema/participations'

const presenterMigration = readFileSync(
  join(import.meta.dir, '../migrations/0026_talk_presenter.sql'),
  'utf8'
)
const directories: string[] = []

async function setup() {
  const directory = await mkdtemp(join(tmpdir(), 'talk-presenter-'))
  directories.push(directory)
  const db = createClient({ url: `file:${join(directory, 'test.db')}` })
  await db.execute('PRAGMA foreign_keys = ON')
  await db.execute(`CREATE TABLE artista (
    id INTEGER PRIMARY KEY,
    pseudonimo TEXT NOT NULL,
    slug TEXT NOT NULL
  )`)
  await db.execute(`CREATE TABLE artista_pseudonimo (
    id INTEGER PRIMARY KEY,
    artista_id INTEGER NOT NULL REFERENCES artista(id) ON DELETE CASCADE,
    pseudonimo TEXT NOT NULL,
    deleted_at TEXT,
    UNIQUE (id, artista_id)
  )`)
  await db.execute(`CREATE TABLE tipo_actividad (
    id INTEGER PRIMARY KEY,
    slug TEXT NOT NULL UNIQUE
  )`)
  await db.execute(`CREATE TABLE participacion_actividad (
    id INTEGER PRIMARY KEY,
    tipo_actividad_id INTEGER NOT NULL REFERENCES tipo_actividad(id)
  )`)
  await db.execute(`CREATE TABLE actividad (
    id INTEGER PRIMARY KEY,
    participacion_actividad_id INTEGER NOT NULL UNIQUE REFERENCES participacion_actividad(id)
  )`)
  await db.execute("INSERT INTO tipo_actividad VALUES (1, 'charla'), (2, 'taller')")
  await db.execute('INSERT INTO participacion_actividad VALUES (10, 1), (20, 2)')
  await db.execute('INSERT INTO actividad VALUES (100, 10), (200, 20)')
  await db.execute("INSERT INTO artista VALUES (1, 'Sol', 'sol'), (2, 'Luna', 'luna')")
  await db.execute("INSERT INTO artista_pseudonimo VALUES (11, 1, 'Sol', NULL), (12, 1, 'Sol Alterna', NULL), (21, 2, 'Luna', NULL), (22, 2, 'Luna Retirada', '2026-01-01')")

  for (const statement of presenterMigration
    .split('--> statement-breakpoint')
    .map((part) => part.trim())
    .filter(Boolean)) {
    await db.execute(statement)
  }
  return db
}

afterEach(async () => {
  await Promise.all(
    directories.splice(0).map((directory) =>
      rm(directory, { recursive: true, force: true })
    )
  )
})

describe('talk presenter migration', () => {
  test('keeps presenter optional and accepts either a free name or an active artist pseudonym', async () => {
    const db = await setup()

    expect(getTableName(activity)).toBe('actividad')
    expect(Object.keys(getTableColumns(activity))).toEqual(
      expect.arrayContaining([
        'presenterNombre',
        'presenterArtistaId',
        'presenterPseudonimoId'
      ])
    )
    const initialPresenter = (await db.execute('SELECT presenter_nombre, presenter_artista_id, presenter_pseudonimo_id FROM actividad WHERE id = 100')).rows[0]
    expect(initialPresenter?.presenter_nombre).toBeNull()
    expect(initialPresenter?.presenter_artista_id).toBeNull()
    expect(initialPresenter?.presenter_pseudonimo_id).toBeNull()

    await db.execute("UPDATE actividad SET presenter_nombre = 'Invitada sin perfil' WHERE id = 100")
    await db.execute('UPDATE actividad SET presenter_nombre = NULL, presenter_artista_id = 1, presenter_pseudonimo_id = 12 WHERE id = 100')

    const linked = (await db.execute(`SELECT a.presenter_artista_id, p.pseudonimo
      FROM actividad a JOIN artista_pseudonimo p ON p.id = a.presenter_pseudonimo_id
      WHERE a.id = 100`)).rows[0]
    expect(linked?.presenter_artista_id).toBe(1)
    expect(linked?.pseudonimo).toBe('Sol Alterna')
    await db.execute("UPDATE artista_pseudonimo SET pseudonimo = 'Sol Nombre Actualizado' WHERE id = 12")
    expect((await db.execute('SELECT p.pseudonimo FROM actividad a JOIN artista_pseudonimo p ON p.id = a.presenter_pseudonimo_id WHERE a.id = 100')).rows[0]?.pseudonimo).toBe('Sol Nombre Actualizado')

    await db.execute('UPDATE actividad SET presenter_artista_id = NULL, presenter_pseudonimo_id = NULL WHERE id = 100')
    const clearedPresenter = (await db.execute('SELECT presenter_nombre, presenter_artista_id, presenter_pseudonimo_id FROM actividad WHERE id = 100')).rows[0]
    expect(clearedPresenter?.presenter_nombre).toBeNull()
    expect(clearedPresenter?.presenter_artista_id).toBeNull()
    expect(clearedPresenter?.presenter_pseudonimo_id).toBeNull()
  })

  test('rejects incomplete, mismatched, inactive, missing, and non-talk presenters', async () => {
    const db = await setup()

    await expect(db.execute("UPDATE actividad SET presenter_nombre = 'Free', presenter_artista_id = 1 WHERE id = 100")).rejects.toThrow()
    await expect(db.execute("UPDATE actividad SET presenter_nombre = '   ' WHERE id = 100")).rejects.toThrow('presenter must be absent, a free name, or an artist pseudonym')
    await expect(db.execute("UPDATE actividad SET presenter_nombre = 'Free', presenter_artista_id = 1, presenter_pseudonimo_id = 11 WHERE id = 100")).rejects.toThrow('presenter must be absent, a free name, or an artist pseudonym')
    await expect(db.execute('UPDATE actividad SET presenter_artista_id = 1 WHERE id = 100')).rejects.toThrow()
    await expect(db.execute('UPDATE actividad SET presenter_artista_id = 1, presenter_pseudonimo_id = 21 WHERE id = 100')).rejects.toThrow('presenter pseudonym must be active and belong to its artist')
    await expect(db.execute('UPDATE actividad SET presenter_artista_id = 2, presenter_pseudonimo_id = 22 WHERE id = 100')).rejects.toThrow('presenter pseudonym must be active and belong to its artist')
    await expect(db.execute('UPDATE actividad SET presenter_artista_id = 1, presenter_pseudonimo_id = 999 WHERE id = 100')).rejects.toThrow()
    await expect(db.execute("UPDATE actividad SET presenter_nombre = 'Not a talk' WHERE id = 200")).rejects.toThrow('presenter is only allowed for talks')
    await db.execute('UPDATE actividad SET presenter_artista_id = 1, presenter_pseudonimo_id = 12 WHERE id = 100')
    await expect(db.execute('UPDATE participacion_actividad SET tipo_actividad_id = 2 WHERE id = 10')).rejects.toThrow('clear presenter before changing activity from talk')

    await expect(db.execute("UPDATE artista_pseudonimo SET deleted_at = '2026-02-01' WHERE id = 12")).rejects.toThrow('cannot retire a referenced presenter pseudonym')
    await expect(db.execute('DELETE FROM artista_pseudonimo WHERE id = 12')).rejects.toThrow()
  })
})
