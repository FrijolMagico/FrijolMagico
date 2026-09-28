import { describe, expect, mock, test } from 'bun:test'

const cacheTag = mock(() => {})
let rows: Array<Record<string, unknown>> = []
const query = {
  from: () => query,
  leftJoin: () => query,
  where: () => query,
  orderBy: async () => rows
}

mock.module('server-only', () => ({}))
mock.module('next/cache', () => ({ cacheTag }))
mock.module('@frijolmagico/database/orm', () => ({
  db: { select: () => query }
}))

const { getArtistsLookup } = await import(
  '@/core/eventos/participaciones/_lib/data-access-layer/get-artists-lookup'
)

describe('getArtistsLookup primary pseudonym projection', () => {
  test('uses the relational primary name for general participation display', async () => {
    rows = [
      {
        id: 9,
        pseudonym: 'Legacy field value',
        statusId: 1,
        pseudonymId: 90,
        pseudonymName: 'Primary alias',
        primaryId: 90
      },
      {
        id: 9,
        pseudonym: 'Legacy field value',
        statusId: 1,
        pseudonymId: 91,
        pseudonymName: 'Other alias',
        primaryId: 90
      }
    ]

    const lookup = await getArtistsLookup()

    expect(lookup.get(9)).toEqual({
      id: 9,
      pseudonym: 'Primary alias',
      statusId: 1,
      pseudonyms: [
        { id: 90, pseudonym: 'Primary alias', isPrimary: true },
        { id: 91, pseudonym: 'Other alias', isPrimary: false }
      ]
    })
  })
})
