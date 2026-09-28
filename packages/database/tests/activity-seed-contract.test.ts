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
        occurrence.duration_minutes, (
          SELECT MIN(day.fecha)
          FROM evento_edicion_dia day
          WHERE day.evento_edicion_id = pe.edicion_id
        ) AS first_edition_day
      FROM actividad a
      JOIN activity_occurrence occurrence ON occurrence.activity_id = a.id
      JOIN participacion_actividad pa ON pa.id = a.participacion_actividad_id
      JOIN participacion_edicion pe ON pe.id = pa.participacion_id
      WHERE a.id BETWEEN 5 AND 9
      ORDER BY a.id
    `)

    expect(result.rows).toHaveLength(5)
    expect(result.rows).toEqual(
      [
        { activity_id: 5, date: '2017-02-25', start_time: null, duration_minutes: null, first_edition_day: '2017-02-25' },
        { activity_id: 6, date: '2017-04-22', start_time: null, duration_minutes: null, first_edition_day: '2017-04-22' },
        { activity_id: 7, date: '2017-02-25', start_time: null, duration_minutes: null, first_edition_day: '2017-02-25' },
        { activity_id: 8, date: '2017-04-22', start_time: null, duration_minutes: null, first_edition_day: '2017-04-22' },
        { activity_id: 9, date: '2017-04-22', start_time: null, duration_minutes: null, first_edition_day: '2017-04-22' }
      ]
    )
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

    expect(result.rows).toEqual([
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
