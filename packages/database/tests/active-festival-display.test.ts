import { createClient } from '@libsql/client'
import { drizzle } from 'drizzle-orm/libsql'
import { beforeEach, describe, expect, test } from 'bun:test'
import { compareActiveFestivalDisplay } from '../src/active-festival-display'
import { getActiveFestivalDisplay } from '../src/active-festival-display'
import { core, events } from '../src/db/schema/index'

const schema = { ...core, ...events }
const client = createClient({ url: 'file::memory:' })
const fixtureDb = drizzle(client, { schema })

async function createFixtureTables() {
  await client.batch([
    `CREATE TABLE evento (id INTEGER PRIMARY KEY, nombre TEXT NOT NULL)`,
    `CREATE TABLE evento_edicion (
      id INTEGER PRIMARY KEY,
      evento_id INTEGER,
      numero_edicion TEXT NOT NULL,
      slug TEXT,
      published INTEGER NOT NULL
    )`,
    `CREATE TABLE lugar (id INTEGER PRIMARY KEY, nombre TEXT NOT NULL)`,
    `CREATE TABLE evento_edicion_dia (
      id INTEGER PRIMARY KEY,
      evento_edicion_id INTEGER NOT NULL,
      lugar_id INTEGER,
      fecha TEXT NOT NULL
    )`
  ])
}

async function insertEdition(input: {
  id: number
  eventName: string
  editionNumber: string
  slug: string | null
  published: boolean
  days: Array<{ date: string; place: string | null }>
}) {
  await client.execute({
    sql: 'INSERT INTO evento (id, nombre) VALUES (?, ?)',
    args: [input.id, input.eventName]
  })
  await client.execute({
    sql: 'INSERT INTO evento_edicion (id, evento_id, numero_edicion, slug, published) VALUES (?, ?, ?, ?, ?)',
    args: [input.id, input.id, input.editionNumber, input.slug, input.published ? 1 : 0]
  })

  for (const [index, day] of input.days.entries()) {
    let placeId: number | null = null
    if (day.place !== null) {
      placeId = input.id * 100 + index
      await client.execute({
        sql: 'INSERT INTO lugar (id, nombre) VALUES (?, ?)',
        args: [placeId, day.place]
      })
    }
    await client.execute({
      sql: 'INSERT INTO evento_edicion_dia (evento_edicion_id, lugar_id, fecha) VALUES (?, ?, ?)',
      args: [input.id, placeId, day.date]
    })
  }
}

const today = new Date().toISOString().slice(0, 10)
const tomorrow = new Date(Date.now() + 86_400_000).toISOString().slice(0, 10)

async function resetFixture() {
  await client.batch([
    'DROP TABLE IF EXISTS evento_edicion_dia',
    'DROP TABLE IF EXISTS lugar',
    'DROP TABLE IF EXISTS evento_edicion',
    'DROP TABLE IF EXISTS evento'
  ])
  await createFixtureTables()
}

beforeEach(resetFixture)

describe('active festival display projection', () => {
  test('selects the earliest eligible published edition and returns displayed day places', async () => {
    await insertEdition({
      id: 1,
      eventName: 'Ended',
      editionNumber: 'I',
      slug: 'ended',
      published: true,
      days: [{ date: '2000-01-01', place: null }]
    })
    await insertEdition({
      id: 2,
      eventName: 'Later',
      editionNumber: 'III',
      slug: 'later',
      published: true,
      days: [{ date: tomorrow, place: 'Plaza' }]
    })
    await insertEdition({
      id: 3,
      eventName: 'Selected',
      editionNumber: 'II',
      slug: 'selected',
      published: true,
      days: [
        { date: tomorrow, place: 'Sur' },
        { date: today, place: 'Norte' }
      ]
    })
    await insertEdition({
      id: 4,
      eventName: 'Unpublished',
      editionNumber: 'IV',
      slug: 'unpublished',
      published: false,
      days: [{ date: today, place: null }]
    })
    await insertEdition({
      id: 5,
      eventName: 'No slug',
      editionNumber: 'V',
      slug: '',
      published: true,
      days: [{ date: today, place: null }]
    })

    await expect(getActiveFestivalDisplay(fixtureDb)).resolves.toEqual({
      id: 3,
      slug: 'selected',
      event_name: 'Selected',
      edition_number: 'II',
      start_date: today,
      end_date: tomorrow,
      days: [
        { fecha: today, lugar: 'Norte' },
        { fecha: tomorrow, lugar: 'Sur' }
      ]
    })
  })

  test('returns null when no published edition with a nonempty slug has a current or future day', async () => {
    await insertEdition({
      id: 1,
      eventName: 'Past',
      editionNumber: 'I',
      slug: 'past',
      published: true,
      days: [{ date: '2000-01-01', place: null }]
    })

    await expect(getActiveFestivalDisplay(fixtureDb)).resolves.toBeNull()
  })

  test('propagates database errors instead of treating them as no active edition', async () => {
    await client.execute('DROP TABLE evento_edicion')

    await expect(getActiveFestivalDisplay(fixtureDb)).rejects.toThrow()
  })
})

describe('active festival display comparison', () => {
  const base = {
    id: 3,
    slug: 'selected',
    event_name: 'Selected',
    edition_number: 'II',
    start_date: today,
    end_date: tomorrow,
    days: [
      { fecha: today, lugar: 'Norte' },
      { fecha: tomorrow, lugar: 'Sur' }
    ]
  }

  test('preserves equal-date display order while ignoring reordering across dates', () => {
    const sameDatePlaces = {
      ...base,
      days: [
        { fecha: today, lugar: 'Sur' },
        { fecha: today, lugar: 'Norte' },
        { fecha: tomorrow, lugar: 'Centro' }
      ]
    }

    expect(
      compareActiveFestivalDisplay(sameDatePlaces, {
        ...sameDatePlaces,
        days: [...sameDatePlaces.days].reverse()
      })
    ).toBe(true)
    expect(
      compareActiveFestivalDisplay(base, {
        ...base,
        days: [...base.days].reverse()
      })
    ).toBe(false)
  })

  test('detects every value that changes displayed content or identity', () => {
    expect(compareActiveFestivalDisplay(base, null)).toBe(true)
    expect(compareActiveFestivalDisplay(null, null)).toBe(false)
    expect(
      compareActiveFestivalDisplay(base, {
        ...base,
        days: [...base.days, base.days[0]]
      })
    ).toBe(true)

    for (const [key, value] of [
      ['id', 4],
      ['slug', 'changed'],
      ['event_name', 'Changed'],
      ['edition_number', 'III'],
      ['start_date', tomorrow],
      ['end_date', today]
    ] as const) {
      expect(compareActiveFestivalDisplay(base, { ...base, [key]: value })).toBe(true)
    }

    expect(
      compareActiveFestivalDisplay(base, {
        ...base,
        days: [{ ...base.days[0], lugar: 'Cambio' }, base.days[1]]
      })
    ).toBe(true)
  })
})
