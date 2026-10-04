import { afterAll, beforeAll, describe, expect, test } from 'bun:test'
import { createClient } from '../../../../../../packages/database/node_modules/@libsql/client'
import { drizzle } from '../../../../../../packages/database/node_modules/drizzle-orm/libsql'
import { getActiveFestivalDisplay as readWithOrm } from '@frijolmagico/database/active-festival-display'

import { ACTIVE_FESTIVAL_DISPLAY_QUERY } from './active-festival-display-query'

const client = createClient({ url: 'file::memory:' })
const db = drizzle(client)

async function execute(sql: string, args: (string | number | null)[] = []) {
  return client.execute({ sql, args })
}

async function createFixture() {
  await execute(
    'CREATE TABLE evento (id INTEGER PRIMARY KEY, nombre TEXT NOT NULL)'
  )
  await execute(
    'CREATE TABLE evento_edicion (id INTEGER PRIMARY KEY, evento_id INTEGER, numero_edicion TEXT NOT NULL, slug TEXT, published INTEGER NOT NULL)'
  )
  await execute(
    'CREATE TABLE evento_edicion_dia (id INTEGER PRIMARY KEY, evento_edicion_id INTEGER NOT NULL, lugar_id INTEGER, fecha TEXT NOT NULL)'
  )
  await execute(
    'CREATE TABLE lugar (id INTEGER PRIMARY KEY, nombre TEXT NOT NULL)'
  )

  const tomorrow = await execute("SELECT date('now', '+1 day') AS date")
  const dayAfter = await execute("SELECT date('now', '+2 day') AS date")
  const firstDate = tomorrow.rows[0]!.date as string
  const secondDate = dayAfter.rows[0]!.date as string

  await execute('INSERT INTO lugar (id, nombre) VALUES (1, ?), (2, ?)', [
    'Plaza',
    'Teatro'
  ])
  await execute(
    'INSERT INTO evento (id, nombre) VALUES (1, ?), (2, ?), (3, ?), (4, ?), (5, ?), (6, ?), (7, ?)',
    [
      'Expired',
      'Unpublished',
      'Null slug',
      'Empty slug',
      'Selected candidate',
      'Equal-date candidate',
      'No days'
    ]
  )
  await execute(
    'INSERT INTO evento_edicion (id, evento_id, numero_edicion, slug, published) VALUES (1, 1, ?, ?, 1), (2, 2, ?, ?, 0), (3, 3, ?, NULL, 1), (4, 4, ?, ?, 1), (5, 5, ?, ?, 1), (6, 6, ?, ?, 1), (7, 7, ?, ?, 1)',
    [
      'I',
      'expired',
      'I',
      'unpublished',
      'I',
      'null-slug',
      'I',
      'empty-slug',
      'I',
      'candidate',
      'I',
      'equal-date',
      'I',
      'no-days'
    ]
  )
  await execute(
    "INSERT INTO evento_edicion_dia (id, evento_edicion_id, lugar_id, fecha) VALUES (1, 1, 1, date(?, '-2 day')), (2, 2, 1, ?), (3, 5, NULL, ?), (4, 5, 1, ?), (5, 5, 2, ?), (6, 6, 1, ?), (7, 6, NULL, ?), (8, 6, 2, ?)",
    [
      firstDate,
      secondDate,
      firstDate,
      firstDate,
      secondDate,
      firstDate,
      firstDate,
      secondDate
    ]
  )
}

afterAll(async () => {
  await client.close()
})

describe('active festival display SQL projection', () => {
  beforeAll(createFixture)

  test('matches the ORM reader for eligibility, equal start dates, nullable venues, and ordered days', async () => {
    const [raw, ormResult] = await Promise.all([
      execute(ACTIVE_FESTIVAL_DISPLAY_QUERY),
      readWithOrm(db)
    ])
    const rawRows = raw.rows.map((row) =>
      Object.fromEntries(
        raw.columns.map((column, index) => [column, row[index]])
      )
    )

    expect(rawRows.length).toBeGreaterThan(0)
    const rawFirst = rawRows[0]!
    expect([5, 6]).toContain(Number(rawFirst.id))
    if (!ormResult) throw new Error('Expected an eligible festival')
    expect(rawFirst).toMatchObject({
      id: ormResult.id,
      slug: ormResult.slug,
      event_name: ormResult.event_name,
      edition_number: ormResult.edition_number,
      start_date: ormResult.start_date,
      end_date: ormResult.end_date
    })
    const rawDays = rawRows.map(({ fecha, lugar }) => ({ fecha, lugar }))
    const sortDays = (days: typeof rawDays) =>
      [...days].sort((left, right) => {
        const dateOrder = String(left.fecha).localeCompare(String(right.fecha))
        if (dateOrder !== 0) return dateOrder
        return String(left.lugar ?? '').localeCompare(String(right.lugar ?? ''))
      })
    expect(sortDays(rawDays)).toEqual(sortDays(ormResult?.days ?? []))

    const tomorrow = await execute("SELECT date('now', '+1 day') AS date")
    expect(rawFirst.start_date).toBe(tomorrow.rows[0]!.date)
    expect(
      new Set(
        rawDays
          .filter(({ fecha }) => fecha === rawFirst.start_date)
          .map(({ lugar }) => lugar)
      )
    ).toEqual(new Set([null, 'Plaza']))
    expect(rawDays).toContainEqual({
      fecha: rawFirst.end_date,
      lugar: 'Teatro'
    })

    await execute('UPDATE evento_edicion SET published = 0 WHERE id IN (5, 6)')
    const [noRaw, noOrm] = await Promise.all([
      execute(ACTIVE_FESTIVAL_DISPLAY_QUERY),
      readWithOrm(db)
    ])
    expect(noRaw.rows).toEqual([])
    expect(noOrm).toBeNull()
  })
})
