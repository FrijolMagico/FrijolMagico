import { describe, expect, mock, test } from 'bun:test'

const whereCalls: unknown[][] = []

mock.module('server-only', () => ({}))
mock.module('@frijolmagico/database/orm', () => ({
  db: {
    select: () => ({
      from: () => ({
        where: (...conditions: unknown[]) => {
          whereCalls.push(conditions)
          return {
            orderBy: async () => []
          }
        }
      })
    })
  }
}))

const { getArtistAvatarHistory } =
  await import('@/core/artistas/_lib/get-artist-avatar-history')

function primitives(value: unknown, seen = new WeakSet<object>()): string[] {
  if (typeof value === 'string') return [value]
  if (!value || typeof value !== 'object') return []
  if (seen.has(value)) return []
  seen.add(value)
  if (Array.isArray(value))
    return value.flatMap((item) => primitives(item, seen))
  return Object.values(value).flatMap((item) => primitives(item, seen))
}

describe('get artist avatar history', () => {
  test('requests only deleted avatar rows for the requested artist', async () => {
    whereCalls.length = 0

    await expect(getArtistAvatarHistory(7)).resolves.toEqual([])

    const conditions = primitives(whereCalls).join(' ').toLowerCase()
    expect(conditions).toContain('deleted_at')
    expect(conditions).toContain('is not null')
  })
})
