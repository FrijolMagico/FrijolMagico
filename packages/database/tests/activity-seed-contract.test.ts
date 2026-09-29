import { afterEach, describe, expect, test } from 'bun:test'
import { readFileSync } from 'node:fs'
import { mkdtemp, rm } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { join } from 'node:path'

import { createClient } from '@libsql/client'
import { drizzle } from 'drizzle-orm/libsql'
import { migrate } from 'drizzle-orm/libsql/migrator'

const migrationsFolder = join(import.meta.dir, '../migrations')
const seedPath = join(import.meta.dir, '../seed/seed.sql')
const directories: string[] = []

async function freshSeededDatabase() {
  const directory = await mkdtemp(join(tmpdir(), 'activity-seed-contract-'))
  directories.push(directory)
  const client = createClient({ url: `file:${join(directory, 'test.db')}` })
  await client.execute('PRAGMA foreign_keys = ON')
  await migrate(drizzle(client), { migrationsFolder })

  const statements = readFileSync(seedPath, 'utf8')
    .split('\n')
    .filter((line) => !line.trim().startsWith('--'))
    .join('\n')
    .split(';')
    .map((statement) => statement.trim())
    .filter((statement) => statement.length > 0)

  expect(statements.length).toBeGreaterThan(5)
  await client.execute('PRAGMA foreign_keys = OFF')
  for (const [index, statement] of statements.entries()) {
    try {
      await client.execute(statement)
    } catch (error) {
      throw new Error(
        `Complete seed failed at statement ${index + 1}/${statements.length}`,
        { cause: error }
      )
    }
  }
  await client.execute('PRAGMA foreign_keys = ON')

  return client
}

afterEach(async () => {
  await Promise.all(
    directories
      .splice(0)
      .map((directory) => rm(directory, { recursive: true, force: true }))
  )
})

describe('complete activity seed contract', () => {
  test('every seeded activity has an occurrence on a day in its own edition', async () => {
    const client = await freshSeededDatabase()
    const result = await client.execute(`
      SELECT a.id AS activity_id, occurrence.id AS occurrence_id,
        occurrence.date AS occurrence_date
      FROM actividad a
      LEFT JOIN activity_occurrence occurrence ON occurrence.activity_id = a.id
      LEFT JOIN participacion_actividad pa ON pa.id = a.participacion_actividad_id
      LEFT JOIN participacion_edicion pe ON pe.id = pa.participacion_id
      LEFT JOIN evento_edicion_dia day
        ON day.evento_edicion_id = pe.edicion_id AND day.fecha = occurrence.date
      WHERE occurrence.id IS NULL OR day.id IS NULL
    `)

    expect(result.rows).toEqual([])
  })

  test('legacy activities 5–9 use their edition first day without inferred time or duration', async () => {
    const client = await freshSeededDatabase()
    const result = await client.execute(`
      SELECT a.id AS activity_id, occurrence.date, occurrence.start_time,
        occurrence.duration_minutes, occurrence.url,
        registration.id AS registration_id, (
          SELECT MIN(day.fecha)
          FROM evento_edicion_dia day
          WHERE day.evento_edicion_id = pe.edicion_id
        ) AS first_edition_day
      FROM actividad a
      JOIN activity_occurrence occurrence ON occurrence.activity_id = a.id
      JOIN participacion_actividad pa ON pa.id = a.participacion_actividad_id
      JOIN participacion_edicion pe ON pe.id = pa.participacion_id
      LEFT JOIN activity_registration registration
        ON registration.participation_activity_id = pa.id
      WHERE a.id BETWEEN 5 AND 9
      ORDER BY a.id
    `)

    expect(result.rows).toHaveLength(5)
    expect(result.rows.map((row) => ({
      activity_id: row.activity_id,
      date: row.date,
      start_time: row.start_time,
      duration_minutes: row.duration_minutes,
      url: row.url,
      registration_id: row.registration_id,
      first_edition_day: row.first_edition_day
    }))).toEqual(
      [
        { activity_id: 5, date: '2017-02-25', start_time: null, duration_minutes: null, url: null, registration_id: null, first_edition_day: '2017-02-25' },
        { activity_id: 6, date: '2017-04-22', start_time: null, duration_minutes: null, url: null, registration_id: null, first_edition_day: '2017-04-22' },
        { activity_id: 7, date: '2017-02-25', start_time: null, duration_minutes: null, url: null, registration_id: null, first_edition_day: '2017-02-25' },
        { activity_id: 8, date: '2017-04-22', start_time: null, duration_minutes: null, url: null, registration_id: null, first_edition_day: '2017-04-22' },
        { activity_id: 9, date: '2017-04-22', start_time: null, duration_minutes: null, url: null, registration_id: null, first_edition_day: '2017-04-22' }
      ]
    )
  })

  test('registered activity 3 has two same-day blocks and one next-day block under one global window', async () => {
    const client = await freshSeededDatabase()
    const result = await client.execute(`
      SELECT pa.id AS participation_activity_id,
        occurrence.id AS occurrence_id, occurrence.date, occurrence.start_time,
        occurrence.duration_minutes, occurrence.url,
        registration.start_at, registration.end_at
      FROM actividad a
      JOIN activity_occurrence occurrence ON occurrence.activity_id = a.id
      JOIN participacion_actividad pa ON pa.id = a.participacion_actividad_id
      JOIN activity_registration registration
        ON registration.participation_activity_id = pa.id
      WHERE a.id = 3 AND pa.id = 3
      ORDER BY occurrence.date, occurrence.start_time
    `)

    expect(result.rows.map((row) => ({
      participation_activity_id: row.participation_activity_id,
      occurrence_id: row.occurrence_id,
      date: row.date,
      start_time: row.start_time,
      duration_minutes: row.duration_minutes,
      url: row.url,
      start_at: row.start_at,
      end_at: row.end_at
    }))).toEqual([
      {
        participation_activity_id: 3,
        occurrence_id: 4,
        date: '2017-04-22',
        start_time: '15:00',
        duration_minutes: 90,
        url: 'https://example.org/acuarela-sabado-1500',
        start_at: '2020-01-01T00:00:00.000Z',
        end_at: '2099-12-31T23:59:59.000Z'
      },
      {
        participation_activity_id: 3,
        occurrence_id: 53,
        date: '2017-04-22',
        start_time: '17:00',
        duration_minutes: 60,
        url: 'https://example.org/acuarela-sabado-1700',
        start_at: '2020-01-01T00:00:00.000Z',
        end_at: '2099-12-31T23:59:59.000Z'
      },
      {
        participation_activity_id: 3,
        occurrence_id: 5,
        date: '2017-04-23',
        start_time: '16:30',
        duration_minutes: 90,
        url: 'https://example.org/acuarela-domingo-1630',
        start_at: '2020-01-01T00:00:00.000Z',
        end_at: '2099-12-31T23:59:59.000Z'
      }
    ])

    const blockCounts = await client.execute(`
      SELECT date, COUNT(*) AS block_count
      FROM activity_occurrence
      WHERE activity_id = 3
      GROUP BY date
      ORDER BY date
    `)
    expect(blockCounts.rows.map((row) => ({ date: row.date, block_count: row.block_count }))).toEqual([
      { date: '2017-04-22', block_count: 2 },
      { date: '2017-04-23', block_count: 1 }
    ])
  })

  test('active-edition activity 16 occurrence URL keeps its global registration window through year 3000', async () => {
    const client = await freshSeededDatabase()
    const result = await client.execute(`
      SELECT occurrence.url, registration.start_at, registration.end_at
      FROM actividad a
      JOIN activity_occurrence occurrence ON occurrence.activity_id = a.id
      JOIN participacion_actividad pa ON pa.id = a.participacion_actividad_id
      JOIN activity_registration registration
        ON registration.participation_activity_id = pa.id
      WHERE a.id = 16 AND pa.id = 16
    `)

    expect(result.rows.map((row) => ({
      url: row.url,
      start_at: row.start_at,
      end_at: row.end_at
    }))).toEqual([
      {
        url: 'https://example.org/taller-activo-2026-10-09',
        start_at: '2026-09-01T00:00:00.000Z',
        end_at: '3000-12-31T23:59:59.000Z'
      }
    ])
  })

  test('music has a dated occurrence and no registration', async () => {
    const client = await freshSeededDatabase()
    const result = await client.execute(`
      SELECT a.id AS activity_id, occurrence.date, occurrence.start_time,
        occurrence.duration_minutes, registration.id AS registration_id,
        occurrence.url
      FROM actividad a
      JOIN participacion_actividad pa ON pa.id = a.participacion_actividad_id
      JOIN tipo_actividad type ON type.id = pa.tipo_actividad_id
      JOIN activity_occurrence occurrence ON occurrence.activity_id = a.id
      LEFT JOIN activity_registration registration
        ON registration.participation_activity_id = pa.id
      WHERE type.slug = 'musica'
    `)

    expect(result.rows.map((row) => ({
      activity_id: row.activity_id,
      date: row.date,
      start_time: row.start_time,
      duration_minutes: row.duration_minutes,
      registration_id: row.registration_id,
      url: row.url
    }))).toEqual([
      {
        activity_id: 49,
        date: '2017-02-25',
        start_time: null,
        duration_minutes: null,
        registration_id: null,
        url: null
      }
    ])
  })

  test('complete seed preserves foreign-key integrity', async () => {
    const client = await freshSeededDatabase()
    const violations = await client.execute('PRAGMA foreign_key_check')

    expect(violations.rows).toEqual([])
  })
})
