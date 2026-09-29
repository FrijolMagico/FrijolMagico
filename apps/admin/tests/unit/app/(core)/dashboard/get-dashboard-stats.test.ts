import { describe, expect, mock, test } from 'bun:test'
import { artist } from '@frijolmagico/database/schema'

const cacheTag = mock(() => {})
let selectedProjection: Record<string, unknown> | null = null
let joinedTables: unknown[] = []
const query = {
  from: () => query,
  innerJoin: (table: unknown) => {
    joinedTables.push(table)
    return query
  },
  groupBy: () => query,
  orderBy: () => query,
  limit: async () => [{ id: 9, pseudonimo: 'Primary alias', ediciones: 3 }]
}

mock.module('next/cache', () => ({ cacheTag }))
mock.module('@frijolmagico/database/orm', () => ({
  db: {
    select: (projection: Record<string, unknown>) => {
      selectedProjection = projection
      joinedTables = []
      return query
    }
  }
}))

const { getDashboardTopArtists } = await import(
  '@/core/dashboard/_lib/get-dashboard-stats'
)

describe('dashboard top artist pseudonym', () => {
  test('projects the artist primary pseudonym relation for general views', async () => {
    const result = await getDashboardTopArtists()

    expect(result).toEqual([
      { id: '9', pseudonimo: 'Primary alias', ediciones: 3 }
    ])
    expect(selectedProjection?.pseudonimo).toBe(artist.artistPseudonym.pseudonimo)
    expect(joinedTables).toContain(artist.artistPrimaryPseudonym)
    expect(joinedTables).toContain(artist.artistPseudonym)
  })
})
