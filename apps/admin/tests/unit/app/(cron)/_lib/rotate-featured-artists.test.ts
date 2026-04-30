import { describe, expect, test, mock, beforeEach } from 'bun:test'

import {
  fisherYatesShuffle,
  selectFeaturedArtists,
  rotateFeaturedArtists
} from '@/app/(cron)/_lib/rotate-featured-artists'

import type { EligibleArtist } from '@/app/(cron)/_lib/rotate-featured-artists'

// ---------------------------------------------------------------------------
// Pure function: fisherYatesShuffle
// ---------------------------------------------------------------------------

describe('fisherYatesShuffle', () => {
  test('returns a new array with the same elements', () => {
    const input = [1, 2, 3, 4, 5]
    const result = fisherYatesShuffle(input)

    expect(result).toHaveLength(5)
    expect(result.sort()).toEqual([1, 2, 3, 4, 5])
  })

  test('does not mutate the original array', () => {
    const input = [10, 20, 30]
    const copy = [...input]
    fisherYatesShuffle(input)

    expect(input).toEqual(copy)
  })

  test('returns an empty array when given an empty array', () => {
    expect(fisherYatesShuffle([])).toEqual([])
  })

  test('returns a single-element array unchanged', () => {
    expect(fisherYatesShuffle([42])).toEqual([42])
  })
})

// ---------------------------------------------------------------------------
// Pure function: selectFeaturedArtists
// ---------------------------------------------------------------------------

describe('selectFeaturedArtists', () => {
  test('selects exactly 3 from non-featured when >=3 non-featured exist', () => {
    const candidates: EligibleArtist[] = [
      { id: 1, destacado: true },
      { id: 2, destacado: false },
      { id: 3, destacado: false },
      { id: 4, destacado: false },
      { id: 5, destacado: false }
    ]

    const result = selectFeaturedArtists(candidates)
    expect(result).toHaveLength(3)

    // All selected should be from non-featured (ids 2-5)
    const nonFeaturedIds = [2, 3, 4, 5]
    for (const id of result) {
      expect(nonFeaturedIds).toContain(id)
    }

    // No duplicates
    expect(new Set(result).size).toBe(3)
  })

  test('uses fallback when fewer than 3 non-featured exist', () => {
    const candidates: EligibleArtist[] = [
      { id: 10, destacado: true },
      { id: 20, destacado: true },
      { id: 30, destacado: false }
    ]

    const result = selectFeaturedArtists(candidates)
    expect(result).toHaveLength(3)

    // Must include the single non-featured artist
    expect(result).toContain(30)

    // The other 2 must come from currently featured (10 or 20)
    const fromFeatured = result.filter((id) => id === 10 || id === 20)
    expect(fromFeatured).toHaveLength(2)
  })

  test('returns all eligible when fewer than 3 total exist', () => {
    const candidates: EligibleArtist[] = [
      { id: 100, destacado: true },
      { id: 200, destacado: false }
    ]

    const result = selectFeaturedArtists(candidates)
    expect(result).toHaveLength(2)
    expect(result.sort()).toEqual([100, 200])
  })

  test('returns empty array when zero eligible artists exist', () => {
    const result = selectFeaturedArtists([])
    expect(result).toEqual([])
  })

  test('returns single artist when only one eligible exists', () => {
    const candidates: EligibleArtist[] = [{ id: 7, destacado: false }]

    const result = selectFeaturedArtists(candidates)
    expect(result).toEqual([7])
  })

  test('selects exactly 3 when exactly 3 non-featured exist', () => {
    const candidates: EligibleArtist[] = [
      { id: 1, destacado: true },
      { id: 2, destacado: false },
      { id: 3, destacado: false },
      { id: 4, destacado: false }
    ]

    const result = selectFeaturedArtists(candidates)
    expect(result).toHaveLength(3)
    expect(result.sort()).toEqual([2, 3, 4])
  })

  test('fills from featured when only 1 non-featured exists with 4 featured', () => {
    const candidates: EligibleArtist[] = [
      { id: 1, destacado: true },
      { id: 2, destacado: true },
      { id: 3, destacado: true },
      { id: 4, destacado: true },
      { id: 5, destacado: false }
    ]

    const result = selectFeaturedArtists(candidates)
    expect(result).toHaveLength(3)

    // Must include the non-featured one
    expect(result).toContain(5)

    // Other 2 from featured (1, 2, 3, or 4)
    const fromFeatured = result.filter((id) => [1, 2, 3, 4].includes(id))
    expect(fromFeatured).toHaveLength(2)
  })

  test('selects all 3 featured when zero non-featured exist', () => {
    const candidates: EligibleArtist[] = [
      { id: 1, destacado: true },
      { id: 2, destacado: true },
      { id: 3, destacado: true }
    ]

    const result = selectFeaturedArtists(candidates)
    expect(result).toHaveLength(3)
    expect(result.sort()).toEqual([1, 2, 3])
  })
})

// ---------------------------------------------------------------------------
// Transactional: rotateFeaturedArtists (mock tx)
// ---------------------------------------------------------------------------

describe('rotateFeaturedArtists', () => {
  // Helpers to build a mock transaction that mimics Drizzle's fluent API:
  // tx.select({}).from(table).innerJoin(table, cond).where(cond) → rows
  // tx.update(table).set({}).where(cond) → void
  function createMockTx(
    eligibleRows: Array<{
      id: number
      destacado: boolean
      artistDeletedAt: string | null
    }>
  ) {
    let updateCallCount = 0

    // update().set().where() chain
    const mockUpdateWhere = mock(() => Promise.resolve())
    const mockSet = mock(() => ({ where: mockUpdateWhere }))
    const mockUpdate = mock(() => {
      updateCallCount++
      return { set: mockSet }
    })

    // select().from().innerJoin().where() chain
    const mockSelectWhere = mock(() => Promise.resolve(eligibleRows))
    const mockInnerJoin = mock(() => ({ where: mockSelectWhere }))
    const mockFrom = mock(() => ({ innerJoin: mockInnerJoin }))
    const mockSelect = mock(() => ({ from: mockFrom }))

    const tx = { select: mockSelect, update: mockUpdate }

    return {
      tx,
      mockUpdate,
      mockSet,
      mockUpdateWhere,
      mockSelect,
      mockInnerJoin
    }
  }

  test('rotates exactly 3 artists when >=3 non-featured eligible exist', async () => {
    const eligible = [
      { id: 1, destacado: true, artistDeletedAt: null },
      { id: 2, destacado: false, artistDeletedAt: null },
      { id: 3, destacado: false, artistDeletedAt: null },
      { id: 4, destacado: false, artistDeletedAt: null },
      { id: 5, destacado: false, artistDeletedAt: null }
    ]

    const { tx } = createMockTx(eligible)
    const result = await rotateFeaturedArtists(tx as never)

    expect(result.rotated).toBe(true)
    if (result.rotated) {
      expect(result.count).toBe(3)
    }
  })

  test('returns rotated=false with reason when zero eligible artists exist', async () => {
    const { tx } = createMockTx([])
    const result = await rotateFeaturedArtists(tx as never)

    expect(result).toEqual({
      rotated: false,
      reason: 'No eligible artists found'
    })
  })

  test('features all eligible when fewer than 3 total exist', async () => {
    const eligible = [
      { id: 10, destacado: false, artistDeletedAt: null },
      { id: 20, destacado: true, artistDeletedAt: null }
    ]

    const { tx } = createMockTx(eligible)
    const result = await rotateFeaturedArtists(tx as never)

    expect(result.rotated).toBe(true)
    if (result.rotated) {
      expect(result.count).toBe(2)
    }
  })

  test('calls update to clear current featured then set new featured', async () => {
    const eligible = [
      { id: 1, destacado: true, artistDeletedAt: null },
      { id: 2, destacado: false, artistDeletedAt: null },
      { id: 3, destacado: false, artistDeletedAt: null },
      { id: 4, destacado: false, artistDeletedAt: null }
    ]

    const { tx, mockUpdate } = createMockTx(eligible)
    await rotateFeaturedArtists(tx as never)

    // Should call update twice: once to clear, once to set
    expect(mockUpdate).toHaveBeenCalledTimes(2)
  })

  test('uses fallback selection when fewer than 3 non-featured eligible', async () => {
    const eligible = [
      { id: 1, destacado: true, artistDeletedAt: null },
      { id: 2, destacado: true, artistDeletedAt: null },
      { id: 3, destacado: true, artistDeletedAt: null },
      { id: 4, destacado: false, artistDeletedAt: null }
    ]

    const { tx } = createMockTx(eligible)
    const result = await rotateFeaturedArtists(tx as never)

    expect(result.rotated).toBe(true)
    if (result.rotated) {
      expect(result.count).toBe(3)
    }
  })
})
