import { describe, expect, mock, test } from 'bun:test'
import { artist, events, participations } from '@frijolmagico/database/schema'
import { getAvatarUrl } from '@frijolmagico/utils/cdn'

const cacheTag = mock((_tag: string) => {})
const fromTables: unknown[] = []
const whereClauses: unknown[] = []
const joins: unknown[] = []
const data = new Map<unknown, Record<string, unknown>[]>()
function makeQuery(table: unknown) {
  const query = {
    innerJoin: (joined: unknown) => {
      joins.push(joined)
      return query
    },
    leftJoin: (joined: unknown) => {
      joins.push(joined)
      return query
    },
    where: (clause: unknown) => {
      whereClauses.push(clause)
      return query
    },
    orderBy: () => query,
    then: (resolve: (value: Record<string, unknown>[]) => unknown) =>
      Promise.resolve(data.get(table) ?? []).then(resolve)
  }
  return query
}

mock.module('server-only', () => ({}))
mock.module('next/cache', () => ({ cacheTag }))
mock.module('@frijolmagico/database/orm', () => ({
  db: {
    select: () => ({
      from: (table: unknown) => {
        fromTables.push(table)
        return makeQuery(table)
      }
    })
  }
}))

const { getArtistDetail } = await import('@/core/artistas/_lib/get-artist-detail')

const activity = {
  id: 11,
  participationId: 31,
  editionId: 3,
  editionName: 'Edición',
  editionNumber: '2',
  editionCreatedAt: '2020-01-01',
  eventId: 8,
  eventName: 'Festival',
  type: 'taller',
  status: 'confirmado',
  notes: 'Activity note',
  participationNotes: 'General note',
  title: 'Workshop'
}
const exhibition = {
  id: 12,
  participationId: 32,
  editionId: 4,
  editionName: null,
  editionNumber: '3',
  editionCreatedAt: '2021-01-01',
  eventId: null,
  eventName: null,
  discipline: 'pintura',
  status: 'completado',
  notes: null,
  participationNotes: null
}

function setData({
  images = [],
  activities = [],
  exhibitions = [],
  days = []
}: {
  images?: Record<string, unknown>[]
  activities?: Record<string, unknown>[]
  exhibitions?: Record<string, unknown>[]
  days?: Record<string, unknown>[]
} = {}) {
  data.set(artist.artistImage, images)
  data.set(participations.participationActivity, activities)
  data.set(participations.participationExhibition, exhibitions)
  data.set(events.eventEditionDay, days)
  fromTables.length = 0
  whereClauses.length = 0
  joins.length = 0
  cacheTag.mockClear()
}

describe('artist detail on-demand DAL', () => {
  test('empty artist has no items or counts and does not query days', async () => {
    setData()
    expect(await getArtistDetail(7)).toEqual({
      images: [],
      activities: [],
      exhibitions: [],
      activityCount: 0,
      exhibitionCount: 0
    })
    expect(fromTables).not.toContain(events.eventEditionDay)
    expect(fromTables).not.toContain(artist.artist)
    expect(fromTables).not.toContain(artist.artistHistory)
  })

  test('returns active images and unique assignment IDs, not session counts, ordered by edition day then ID', async () => {
    setData({
      images: [{ id: 1, type: 'avatar', url: '/avatar', order: 1 }],
      activities: [activity, { ...activity }, { ...activity, id: 13, editionId: 4 }],
      exhibitions: [exhibition, { ...exhibition }],
      days: [
        { editionId: 3, date: '2024-01-01' },
        { editionId: 3, date: '2024-01-03' },
        { editionId: 4, date: '2025-01-01' }
      ]
    })
    const result = await getArtistDetail(7)
    expect(result.images).toEqual([
      { id: 1, type: 'avatar', url: getAvatarUrl('/avatar'), order: 1 }
    ])
    expect(result.activityCount).toBe(2)
    expect(result.exhibitionCount).toBe(1)
    expect(result.activities.map(({ id }) => id)).toEqual([13, 11])
    expect(result.exhibitions[0]).toMatchObject({ ...exhibition, editionDate: '2025-01-01' })
    expect(result.activities[1]).toMatchObject({ ...activity, editionDate: '2024-01-03' })
    expect(joins).toContain(events.event)
    expect(joins).toContain(participations.activityType)
    expect(fromTables).toContain(participations.participationExhibition)
    expect(whereClauses).toHaveLength(4)
  })

  test('undated editions fall back to creation date and ties use stable edition and assignment IDs', async () => {
    setData({
      activities: [
        { ...activity, id: 20, editionId: 5, editionCreatedAt: '2023-01-01' },
        { ...activity, id: 21, editionId: 6, editionCreatedAt: '2023-01-01' },
        { ...activity, id: 22, editionId: 6, editionCreatedAt: '2023-01-01' }
      ]
    })
    const result = await getArtistDetail(7)
    expect(result.activities.map(({ id }) => id)).toEqual([22, 21, 20])
    expect(result.activities[0].editionDate).toBe('2023-01-01')
  })
})
