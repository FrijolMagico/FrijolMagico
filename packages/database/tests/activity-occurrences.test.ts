import { afterEach, describe, expect, test } from 'bun:test'
import { readFileSync } from 'node:fs'
import { mkdtemp, rm } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { join } from 'node:path'

import { createClient } from '@libsql/client'
import { getTableColumns, getTableName } from 'drizzle-orm'
import { drizzle } from 'drizzle-orm/libsql'
import { migrate } from 'drizzle-orm/libsql/migrator'

import { activityOccurrence } from '../src/db/schema/participations'

const migration = readFileSync(
  join(import.meta.dir, '../migrations/0022_activity_occurrences.sql'),
  'utf8'
)
const migrationsDirectory = join(import.meta.dir, '../migrations')
const journalPath = join(migrationsDirectory, 'meta/_journal.json')
const directories: string[] = []
type Database = ReturnType<typeof createClient>

async function setup() {
  const directory = await mkdtemp(join(tmpdir(), 'activity-occurrences-'))
  directories.push(directory)
  const db = createClient({ url: `file:${join(directory, 'test.db')}` })
  await db.execute('PRAGMA foreign_keys = ON')
  await db.execute('CREATE TABLE tipo_actividad (id INTEGER PRIMARY KEY, slug TEXT NOT NULL)')
  await db.execute('CREATE TABLE participacion_edicion (id INTEGER PRIMARY KEY, edicion_id INTEGER NOT NULL)')
  await db.execute('CREATE TABLE participacion_actividad (id INTEGER PRIMARY KEY, participacion_id INTEGER NOT NULL REFERENCES participacion_edicion(id), tipo_actividad_id INTEGER NOT NULL REFERENCES tipo_actividad(id))')
  await db.execute('CREATE TABLE actividad (id INTEGER PRIMARY KEY, participacion_actividad_id INTEGER NOT NULL REFERENCES participacion_actividad(id), hora_inicio TEXT, duracion_minutos INTEGER, ubicacion TEXT)')
  await db.execute('CREATE TABLE evento_edicion_dia (id INTEGER PRIMARY KEY, evento_edicion_id INTEGER NOT NULL, fecha TEXT NOT NULL)')
  await db.execute('CREATE TABLE activity_registration (id INTEGER PRIMARY KEY, participation_activity_id INTEGER NOT NULL, url TEXT NOT NULL)')
  await db.execute("INSERT INTO tipo_actividad VALUES (1, 'taller'), (2, 'charla'), (3, 'musica')")
  for (const statement of [
    'INSERT INTO participacion_edicion VALUES (1, 10), (2, 20), (3, 30), (4, 40), (5, 50), (6, 60), (7, 70)',
    'INSERT INTO participacion_actividad VALUES (1, 1, 1), (2, 1, 2), (3, 1, 3), (4, 2, 1), (5, 3, 1), (6, 4, 1), (7, 1, 1), (8, 1, 1), (9, 1, 1), (10, 5, 1), (11, 6, 1), (12, 7, 1)',
    "INSERT INTO actividad VALUES (1, 1, '09:00', 60, 'hall'), (2, 2, '10:00', 60, 'hall'), (3, 3, '11:00', 60, 'hall'), (4, 4, '12:00', 60, 'hall'), (5, 5, '13:00', 60, 'hall'), (6, 6, '14:00', 60, 'hall'), (7, 7, NULL, 60, 'hall'), (8, 8, '23:30', 60, 'hall'), (9, 9, 'invalid', 60, 'hall'), (10, 10, '08:00', 45, 'hall'), (11, 11, '08:00', 45, 'hall'), (12, 12, '08:00', 45, 'hall')",
    "INSERT INTO evento_edicion_dia VALUES (1, 10, '2026-09-05'), (2, 20, '2026-09-05'), (3, 20, '2026-09-06'), (4, 40, '2026-02-30'), (5, 50, '2028-02-29'), (6, 60, '2026-13-01'), (7, 70, '2026-02-29')",
    "INSERT INTO activity_registration VALUES (1, 1, 'https://example.org')"
  ]) await db.execute(statement)
  for (const statement of migration.split('--> statement-breakpoint').map((part) => part.trim()).filter(Boolean)) {
    await db.execute(statement)
  }
  return db
}

async function add(db: Database, activityId: number, date: string, start: string, duration: number) {
  return db.execute({
    sql: 'INSERT INTO activity_occurrence (activity_id, date, start_time, duration_minutes) VALUES (?, ?, ?, ?)',
    args: [activityId, date, start, duration]
  })
}

afterEach(async () => {
  await Promise.all(directories.splice(0).map((directory) => rm(directory, { recursive: true, force: true })))
})

describe('activity occurrences additive migration', () => {
  test('backfills only complete, unambiguous workshops; leaves old data untouched', async () => {
    const db = await setup()
    expect(getTableName(activityOccurrence)).toBe('activity_occurrence')
    expect(Object.values(getTableColumns(activityOccurrence)).map((column) => column.name)).toEqual([
      'id', 'activity_id', 'date', 'start_time', 'duration_minutes', 'created_at', 'updated_at'
    ])
    const rows = await db.execute('SELECT activity_id, date, start_time, duration_minutes FROM activity_occurrence')
    expect(rows.rows.map(({ activity_id, date, start_time, duration_minutes }) => ({ activity_id, date, start_time, duration_minutes }))).toEqual([
      { activity_id: 1, date: '2026-09-05', start_time: '09:00', duration_minutes: 60 },
      { activity_id: 10, date: '2028-02-29', start_time: '08:00', duration_minutes: 45 }
    ])
    expect((await db.execute('SELECT count(*) AS n FROM actividad')).rows[0]?.n).toBe(12)
    const originalActivity = (await db.execute('SELECT hora_inicio, ubicacion FROM actividad WHERE id = 1')).rows[0]
    expect(originalActivity && { hora_inicio: originalActivity.hora_inicio, ubicacion: originalActivity.ubicacion }).toEqual({ hora_inicio: '09:00', ubicacion: 'hall' })
    expect((await db.execute('SELECT url FROM activity_registration')).rows[0]?.url).toBe('https://example.org')
    const fk = await db.execute('PRAGMA foreign_key_list(activity_occurrence)')
    expect(fk.rows[0]?.on_delete).toBe('CASCADE')
    const indexes = await db.execute('PRAGMA index_list(activity_occurrence)')
    expect(indexes.rows.map((row) => row.name)).toContain('uq_activity_occurrence_start')
    expect(indexes.rows.map((row) => row.name)).toContain('idx_activity_occurrence_date')
  })

  test('supports zero, multiple arbitrary dates, adjacent times and talk sessions; cascades', async () => {
    const db = await setup()
    await add(db, 2, '2026-10-10', '08:00', 30)
    await add(db, 2, '2026-10-10', '08:30', 30)
    await add(db, 2, '2026-10-11', '08:00', 60)
    await add(db, 4, '2026-10-11', '08:00', 60)
    await add(db, 2, '2026-10-10', '23:59', 1)
    expect((await db.execute('SELECT count(*) AS n FROM activity_occurrence WHERE activity_id = 5')).rows[0]?.n).toBe(0)
    await db.execute('DELETE FROM actividad WHERE id = 2')
    expect((await db.execute('SELECT count(*) AS n FROM activity_occurrence WHERE activity_id = 2')).rows[0]?.n).toBe(0)
  })

  test('rejects missing, malformed, impossible dates/times, midnight overflow and music', async () => {
    const db = await setup()
    for (const date of ['2026-02-30', '2026-02-29', '2028-02-30', '2026-13-01', '2026-00-01', '2026-9-05', 'not-a-date']) {
      await expect(add(db, 2, date, '09:00', 60)).rejects.toThrow()
    }
    await add(db, 2, '2028-02-29', '09:00', 60)
    for (const start of ['24:00', '09:60', '9:00', '09:00Z', 'invalid']) {
      await expect(add(db, 2, '2026-09-05', start, 60)).rejects.toThrow()
    }
    for (const duration of [0, -1, 61]) {
      await expect(add(db, 2, '2026-09-05', '23:00', duration)).rejects.toThrow()
    }
    await expect(add(db, 3, '2026-09-05', '09:00', 60)).rejects.toThrow()
    await expect(add(db, 999, '2026-09-05', '09:00', 60)).rejects.toThrow()
    // date + start_time without duration is now allowed (nullable)
    await db.execute("INSERT INTO activity_occurrence (activity_id, date, start_time) VALUES (2, '2026-09-05', '09:00')")
    // But duration=0 is still rejected
    await expect(db.execute("UPDATE activity_occurrence SET duration_minutes = 0 WHERE activity_id = 1")).rejects.toThrow()
  })

  test('rejects overlapping inserts and updates, allows independent activities and dates', async () => {
    const db = await setup()
    await add(db, 2, '2026-09-05', '10:00', 60)
    for (const { start, duration } of [{ start: '09:30', duration: 60 }, { start: '10:30', duration: 30 }, { start: '10:00', duration: 60 }]) {
      await expect(add(db, 2, '2026-09-05', start, duration)).rejects.toThrow()
    }
    await add(db, 2, '2026-09-05', '11:00', 60)
    await expect(db.execute("UPDATE activity_occurrence SET start_time = '10:30' WHERE activity_id = 2 AND start_time = '11:00'")).rejects.toThrow()
    await expect(db.execute("UPDATE activity_occurrence SET duration_minutes = 120 WHERE activity_id = 2 AND start_time = '10:00'")).rejects.toThrow()
    await expect(db.execute("UPDATE activity_occurrence SET activity_id = 1, start_time = '09:30' WHERE activity_id = 2 AND start_time = '11:00'")).rejects.toThrow()
    await add(db, 4, '2026-09-05', '10:00', 60)
    await add(db, 2, '2026-09-06', '10:00', 60)
  })

  test('clears sessions when parent type or catalog slug ceases to be schedulable', async () => {
    const db = await setup()
    await add(db, 2, '2026-09-05', '10:00', 60)
    await db.execute('UPDATE participacion_actividad SET tipo_actividad_id = 3 WHERE id = 2')
    expect((await db.execute('SELECT count(*) AS n FROM activity_occurrence WHERE activity_id = 2')).rows[0]?.n).toBe(0)
    await expect(add(db, 2, '2026-09-05', '11:00', 60)).rejects.toThrow()
    await db.execute("UPDATE tipo_actividad SET slug = 'otro' WHERE id = 1")
    expect((await db.execute('SELECT count(*) AS n FROM activity_occurrence')).rows[0]?.n).toBe(0)
    await expect(add(db, 4, '2026-09-05', '11:00', 60)).rejects.toThrow()
  })

  test('retains sessions on schedulable participation reassignment and clears them on music reassignment', async () => {
    const db = await setup()
    await db.execute('UPDATE actividad SET participacion_actividad_id = 2 WHERE id = 1')
    const retained = await db.execute('SELECT activity_id, date, start_time FROM activity_occurrence WHERE activity_id = 1')
    expect(retained.rows.map(({ activity_id, date, start_time }) => ({ activity_id, date, start_time }))).toEqual([
      { activity_id: 1, date: '2026-09-05', start_time: '09:00' }
    ])
    await add(db, 1, '2026-09-06', '10:00', 60)
    await db.execute('UPDATE actividad SET participacion_actividad_id = 3 WHERE id = 1')
    expect((await db.execute('SELECT count(*) AS n FROM activity_occurrence WHERE activity_id = 1')).rows[0]?.n).toBe(0)
    expect((await db.execute('SELECT count(*) AS n FROM activity_occurrence WHERE activity_id = 10')).rows[0]?.n).toBe(1)
    expect((await db.execute('SELECT url FROM activity_registration')).rows[0]?.url).toBe('https://example.org')
    await expect(add(db, 1, '2026-09-07', '10:00', 60)).rejects.toThrow()
  })

  test('journal exposes 0022 and the local Drizzle migrator applies it exactly once', async () => {
    const entries = JSON.parse(readFileSync(journalPath, 'utf8')).entries as {
      idx: number
      version: string
      when: number
      tag: string
      breakpoints: boolean
    }[]
    expect(entries[22]).toEqual({
      idx: 22,
      version: '7',
      when: 1785369600000,
      tag: '0022_activity_occurrences',
      breakpoints: true
    })
    expect(entries.at(-1)).toEqual({
      idx: 23,
      version: '7',
      when: 1785456000000,
      tag: '0023_artist_pseudonyms',
      breakpoints: true
    })
    expect(entries.at(-1)!.when).toBeGreaterThan(entries.at(-2)!.when)

    const directory = await mkdtemp(join(tmpdir(), 'activity-occurrences-migrator-'))
    directories.push(directory)
    const db = createClient({ url: `file:${join(directory, 'test.db')}` })
    const orm = drizzle(db)
    await migrate(orm, { migrationsFolder: migrationsDirectory })
    expect((await db.execute("SELECT name FROM sqlite_master WHERE name = 'activity_occurrence'")).rows[0]?.name).toBe('activity_occurrence')
    const first = await db.execute('SELECT count(*) AS n FROM __drizzle_migrations')
    expect(first.rows[0]?.n).toBe(entries.length)
    await migrate(orm, { migrationsFolder: migrationsDirectory })
    expect((await db.execute('SELECT count(*) AS n FROM __drizzle_migrations')).rows[0]?.n).toBe(first.rows[0]?.n)
  })
})
