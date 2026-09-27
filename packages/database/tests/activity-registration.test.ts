import { afterEach, describe, expect, test } from 'bun:test'
import { readFileSync } from 'node:fs'
import { mkdtemp, rm } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { join } from 'node:path'

import { createClient } from '@libsql/client'
import { getTableColumns, getTableName } from 'drizzle-orm'
import { createTableRelationsHelpers } from 'drizzle-orm/relations'

import { participationActivity } from '../src/db/schema/participations'

import { activityRegistration } from '../src/db/schema/participations'
import {
  activityRegistrationRelations,
  participationActivityRelations
} from '../src/db/relations'

const migrationPath = join(
  import.meta.dir,
  '../migrations/0021_activity_registration.sql'
)
const journalPath = join(import.meta.dir, '../migrations/meta/_journal.json')
const directories: string[] = []
const registration = {
  participation_activity_id: 1,
  url: 'https://example.org/register',
  start_at: '2026-09-05T16:30:00.000Z',
  end_at: '2026-09-05T17:30:00.000Z'
}

type Database = ReturnType<typeof createClient>

async function setup() {
  const directory = await mkdtemp(join(tmpdir(), 'activity-registration-'))
  directories.push(directory)
  const db = createClient({ url: `file:${join(directory, 'test.db')}` })
  await db.execute('PRAGMA foreign_keys = ON')
  await db.execute(
    'CREATE TABLE tipo_actividad (id INTEGER PRIMARY KEY, slug TEXT NOT NULL UNIQUE)'
  )
  await db.execute(
    'CREATE TABLE participacion_actividad (id INTEGER PRIMARY KEY, tipo_actividad_id INTEGER NOT NULL REFERENCES tipo_actividad(id))'
  )
  await db.execute(
    "INSERT INTO tipo_actividad (id, slug) VALUES (1, 'taller'), (2, 'musica'), (3, 'teatro')"
  )
  await db.execute(
    'INSERT INTO participacion_actividad (id, tipo_actividad_id) VALUES (1, 1), (2, 2), (3, 3)'
  )
  for (const statement of readFileSync(migrationPath, 'utf8')
    .split('--> statement-breakpoint')
    .map((part) => part.trim())
    .filter(Boolean)) {
    await db.execute(statement)
  }
  return db
}

async function insert(db: Database, values = registration) {
  return db.execute({
    sql: 'INSERT INTO activity_registration (participation_activity_id, url, start_at, end_at) VALUES (?, ?, ?, ?)',
    args: [
      values.participation_activity_id,
      values.url,
      values.start_at,
      values.end_at
    ]
  })
}

async function count(db: Database) {
  const result = await db.execute(
    'SELECT count(*) AS total FROM activity_registration'
  )
  return result.rows[0]?.total
}

afterEach(async () => {
  await Promise.all(
    directories
      .splice(0)
      .map((directory) => rm(directory, { recursive: true, force: true }))
  )
})

describe('activity registration database contract', () => {
  test('Drizzle columns, one-to-one relations, journal, and SQL match the exact contract', async () => {
    expect(getTableName(activityRegistration)).toBe('activity_registration')
    expect(
      Object.values(getTableColumns(activityRegistration)).map(
        (column) => column.name
      )
    ).toEqual([
      'id',
      'participation_activity_id',
      'url',
      'start_at',
      'end_at',
      'created_at',
      'updated_at'
    ])
    const forward = participationActivityRelations.config(
      createTableRelationsHelpers(participationActivity)
    ).registration
    const reverse = activityRegistrationRelations.config(
      createTableRelationsHelpers(activityRegistration)
    ).participationActivity
    expect(forward.referencedTable).toBe(activityRegistration)
    expect(forward.config?.fields.map((column) => column.name)).toEqual(['id'])
    expect(forward.config?.references.map((column) => column.name)).toEqual([
      'participation_activity_id'
    ])
    expect(reverse.referencedTable).toBe(participationActivity)
    expect(reverse.config?.fields.map((column) => column.name)).toEqual([
      'participation_activity_id'
    ])
    const journal = JSON.parse(readFileSync(journalPath, 'utf8')) as {
      entries: { tag: string }[]
    }
    expect(journal.entries.at(-1)?.tag).toBe('0021_activity_registration')
    const db = await setup()
    const columns = await db.execute('PRAGMA table_info(activity_registration)')
    expect(columns.rows.map((row) => row.name)).toEqual([
      'id',
      'participation_activity_id',
      'url',
      'start_at',
      'end_at',
      'created_at',
      'updated_at'
    ])
    for (const name of [
      'participation_activity_id',
      'url',
      'start_at',
      'end_at',
      'created_at',
      'updated_at'
    ]) {
      expect(columns.rows.find((row) => row.name === name)?.notnull).toBe(1)
    }
    const indexes = await db.execute('PRAGMA index_list(activity_registration)')
    expect(indexes.rows).toHaveLength(1)
    expect(indexes.rows[0]?.unique).toBe(1)
    const indexed = await db.execute(
      `PRAGMA index_info('${indexes.rows[0]?.name}')`
    )
    expect(indexed.rows.map((row) => row.name)).toEqual([
      'participation_activity_id'
    ])
    const fk = await db.execute(
      'PRAGMA foreign_key_list(activity_registration)'
    )
    expect(fk.rows[0]?.table).toBe('participacion_actividad')
    expect(fk.rows[0]?.on_delete).toBe('CASCADE')
  })

  test('accepts a valid complete HTTPS registration, defaults timestamps, and enforces uniqueness and cascade', async () => {
    const db = await setup()
    await insert(db)
    const rows = await db.execute('SELECT * FROM activity_registration')
    expect(rows.rows[0]?.url).toBe(registration.url)
    expect(rows.rows[0]?.start_at).toBe(registration.start_at)
    expect(rows.rows[0]?.created_at).toMatch(/^\d{4}-\d\d-\d\d /)
    expect(rows.rows[0]?.updated_at).toMatch(/^\d{4}-\d\d-\d\d /)
    await expect(insert(db)).rejects.toThrow()
    await db.execute('DELETE FROM participacion_actividad WHERE id = 1')
    expect(await count(db)).toBe(0)
  })

  test('rejects missing required fields and unknown parents', async () => {
    const db = await setup()
    for (const name of ['url', 'start_at', 'end_at'] as const) {
      await expect(
        db.execute({
          sql: `INSERT INTO activity_registration (participation_activity_id, ${name}) VALUES (1, NULL)`
        })
      ).rejects.toThrow()
    }
    await expect(
      insert(db, { ...registration, participation_activity_id: 999 })
    ).rejects.toThrow()
    expect(await count(db)).toBe(0)
  })

  test('rejects non-HTTPS, noncanonical and unordered instants on inserts and updates', async () => {
    const db = await setup()
    for (const url of [
      'http://example.org',
      'https://',
      'HTTPS://example.org',
      ' https://example.org'
    ]) {
      await expect(insert(db, { ...registration, url })).rejects.toThrow()
    }
    for (const start_at of [
      '2026-09-05T16:30:00Z',
      '2026-09-05T16:30:00.000+00:00',
      '2026-09-05T16:30:00.00Z',
      '2026-02-30T16:30:00.000Z',
      '2026-09-05T16:30:00.000z',
      'not a date'
    ]) {
      await expect(insert(db, { ...registration, start_at })).rejects.toThrow()
    }
    for (const end_at of [registration.start_at, '2026-09-05T15:30:00.000Z']) {
      await expect(insert(db, { ...registration, end_at })).rejects.toThrow()
    }
    await insert(db)
    await expect(
      db.execute(
        "UPDATE activity_registration SET url = 'http://example.org' WHERE id = 1"
      )
    ).rejects.toThrow()
    await expect(
      db.execute(
        "UPDATE activity_registration SET end_at = '2026-09-05T16:30:00.000Z' WHERE id = 1"
      )
    ).rejects.toThrow()
    expect(await count(db)).toBe(1)
  })

  test('rejects music on insert and FK update; cleans rows on parent type and catalog slug transitions', async () => {
    const db = await setup()
    await expect(
      insert(db, { ...registration, participation_activity_id: 2 })
    ).rejects.toThrow()
    await insert(db)
    await expect(
      db.execute(
        'UPDATE activity_registration SET participation_activity_id = 2 WHERE id = 1'
      )
    ).rejects.toThrow()
    await db.execute(
      'UPDATE participacion_actividad SET tipo_actividad_id = 2 WHERE id = 1'
    )
    expect(await count(db)).toBe(0)
    await insert(db, { ...registration, participation_activity_id: 3 })
    await db.execute(
      "UPDATE tipo_actividad SET slug = 'former_music' WHERE id = 2"
    )
    await db.execute("UPDATE tipo_actividad SET slug = 'musica' WHERE id = 3")
    expect(await count(db)).toBe(0)
    await expect(
      insert(db, { ...registration, participation_activity_id: 3 })
    ).rejects.toThrow()
  })

  test('refreshes updated_at on ordinary updates while preserving explicit timestamp changes', async () => {
    const db = await setup()
    await insert(db)
    await db.execute(
      "UPDATE activity_registration SET updated_at = '2000-01-01 00:00:00' WHERE id = 1"
    )
    await db.execute(
      "UPDATE activity_registration SET url = 'https://example.org/new' WHERE id = 1"
    )
    const refreshed = await db.execute(
      'SELECT updated_at FROM activity_registration WHERE id = 1'
    )
    expect(refreshed.rows[0]?.updated_at).not.toBe('2000-01-01 00:00:00')
    await db.execute(
      "UPDATE activity_registration SET updated_at = '2001-01-01 00:00:00' WHERE id = 1"
    )
    const explicit = await db.execute(
      'SELECT updated_at FROM activity_registration WHERE id = 1'
    )
    expect(explicit.rows[0]?.updated_at).toBe('2001-01-01 00:00:00')
  })
})
