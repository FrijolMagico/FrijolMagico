import { describe, expect, test } from 'bun:test'

import {
  getAvatarHistoryItem,
  orderAvatarHistory
} from '@/core/artistas/catalogo/_lib/artist-avatar-history'

describe('artist avatar history', () => {
  test('orders deleted avatar history newest-first with a stable id tie-breaker', () => {
    const history = orderAvatarHistory([
      {
        id: 3,
        path: 'artistas/legacy/avatar.png',
        version: null,
        deletedAt: '2026-01-02'
      },
      {
        id: 2,
        path: 'artistas/newer/avatar.webp',
        version: 'newer',
        deletedAt: '2026-01-03'
      },
      {
        id: 1,
        path: 'artistas/newest/avatar.webp',
        version: 'newest',
        deletedAt: '2026-01-04'
      }
    ])

    expect(history.map((avatar) => avatar.id)).toEqual([1, 2, 3])
    expect(history[2]).toEqual({
      id: 3,
      path: 'artistas/legacy/avatar.png',
      version: null,
      deletedAt: '2026-01-02'
    })
  })

  test('does not wrap history navigation beyond either boundary', () => {
    const history = orderAvatarHistory([
      {
        id: 3,
        path: 'artistas/older/avatar.webp',
        version: 'older',
        deletedAt: '2026-01-02'
      },
      {
        id: 2,
        path: 'artistas/latest/avatar.webp',
        version: 'latest',
        deletedAt: '2026-01-03'
      }
    ])

    expect(history.map((avatar) => avatar.id)).toEqual([2, 3])
    expect(getAvatarHistoryItem(history, -1)).toBeNull()
    expect(getAvatarHistoryItem(history, 2)).toBeNull()
  })
})
