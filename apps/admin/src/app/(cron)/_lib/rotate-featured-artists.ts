import { eq, and, isNull, sql, inArray } from 'drizzle-orm'
import { artist as artistSchema } from '@frijolmagico/database/schema'

import type { Transaction } from '@frijolmagico/database/orm'

const { catalogArtist } = artistSchema
const artistTable = artistSchema.artist

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export type EligibleArtist = {
  id: number
  destacado: boolean
}

export type RotationResult =
  | { rotated: true; count: number }
  | { rotated: false; reason: string }

// ---------------------------------------------------------------------------
// Pure functions (easily unit-testable, no side effects)
// ---------------------------------------------------------------------------

/**
 * Fisher-Yates shuffle — returns a NEW shuffled copy of the input array.
 * Does NOT mutate the original.
 */
export function fisherYatesShuffle<T>(arr: readonly T[]): T[] {
  const copy = [...arr]
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    const temp = copy[i]!
    copy[i] = copy[j]!
    copy[j] = temp
  }
  return copy
}

/**
 * Select which artists should be featured next.
 *
 * Rules:
 * 1. If total eligible < 3 → return ALL eligible IDs.
 * 2. If non-featured >= 3 → pick 3 from non-featured.
 * 3. If non-featured < 3 → take all non-featured + fill from featured.
 */
export function selectFeaturedArtists(
  candidates: readonly EligibleArtist[]
): number[] {
  if (candidates.length === 0) return []

  const nonFeatured = candidates.filter((c) => !c.destacado)
  const currentlyFeatured = candidates.filter((c) => c.destacado)

  // Not enough total — feature everyone available
  if (candidates.length < 3) {
    return candidates.map((c) => c.id)
  }

  // Enough non-featured to fill all 3 slots
  if (nonFeatured.length >= 3) {
    return fisherYatesShuffle(nonFeatured.map((c) => c.id)).slice(0, 3)
  }

  // Fallback: take all non-featured + fill remaining from currently featured
  const selected = nonFeatured.map((c) => c.id)
  const remaining = 3 - selected.length
  const shuffledFeatured = fisherYatesShuffle(
    currentlyFeatured.map((c) => c.id)
  )
  selected.push(...shuffledFeatured.slice(0, remaining))

  return selected
}

// ---------------------------------------------------------------------------
// Transactional rotation (receives a Drizzle transaction)
// ---------------------------------------------------------------------------

/**
 * Rotate featured artists within a database transaction.
 *
 * 1. SELECT eligible catalog artists (activo=true, not deleted, linked artist not deleted)
 * 2. Use pure selection logic to pick up to 3
 * 3. UPDATE: clear all current featured
 * 4. UPDATE: set selected as featured
 */
export async function rotateFeaturedArtists(
  tx: Transaction
): Promise<RotationResult> {
  // Step 1: Query eligible artists
  const eligible = await tx
    .select({
      id: catalogArtist.id,
      destacado: catalogArtist.destacado,
      artistDeletedAt: artistTable.deletedAt
    })
    .from(catalogArtist)
    .innerJoin(artistTable, eq(catalogArtist.artistaId, artistTable.id))
    .where(
      and(
        eq(catalogArtist.activo, true),
        isNull(catalogArtist.deletedAt),
        isNull(artistTable.deletedAt)
      )
    )

  if (eligible.length === 0) {
    return { rotated: false, reason: 'No eligible artists found' }
  }

  // Step 2: Pure selection logic
  const candidates: EligibleArtist[] = eligible.map((row) => ({
    id: row.id,
    destacado: row.destacado
  }))
  const selectedIds = selectFeaturedArtists(candidates)

  // Step 3: Clear all currently featured
  await tx
    .update(catalogArtist)
    .set({ destacado: false })
    .where(
      and(eq(catalogArtist.destacado, true), isNull(catalogArtist.deletedAt))
    )

  // Step 4: Set selected as featured
  if (selectedIds.length > 0) {
    await tx
      .update(catalogArtist)
      .set({
        destacado: true,
        updatedAt: sql`CURRENT_TIMESTAMP`
      })
      .where(inArray(catalogArtist.id, selectedIds))
  }

  return { rotated: true, count: selectedIds.length }
}
