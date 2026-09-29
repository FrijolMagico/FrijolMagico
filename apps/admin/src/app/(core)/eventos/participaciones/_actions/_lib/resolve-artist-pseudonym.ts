import 'server-only'

import { and, eq, isNull } from 'drizzle-orm'
import { artist } from '@frijolmagico/database/schema'
import type { Transaction } from '@frijolmagico/database/orm'

const { artistPseudonym, artistPrimaryPseudonym } = artist

export async function resolveActiveArtistPseudonym(
  tx: Transaction,
  artistId: number,
  requestedPseudonymId: number | null | undefined,
  existingPseudonymId?: number | null
): Promise<number> {
  const pseudonymId = requestedPseudonymId ?? existingPseudonymId
  if (pseudonymId != null) {
    const [owned] = await tx
      .select({ id: artistPseudonym.id })
      .from(artistPseudonym)
      .where(and(
        eq(artistPseudonym.id, pseudonymId),
        eq(artistPseudonym.artistaId, artistId),
        isNull(artistPseudonym.deletedAt)
      ))
      .limit(1)
    if (owned) return owned.id
    if (requestedPseudonymId != null) {
      throw new Error('El pseudónimo seleccionado no está activo para este artista')
    }
  }

  const [primary] = await tx
    .select({ id: artistPrimaryPseudonym.pseudonimoId })
    .from(artistPrimaryPseudonym)
    .innerJoin(
      artistPseudonym,
      eq(artistPseudonym.id, artistPrimaryPseudonym.pseudonimoId)
    )
    .where(and(
      eq(artistPrimaryPseudonym.artistaId, artistId),
      isNull(artistPseudonym.deletedAt)
    ))
    .limit(1)
  if (primary) return primary.id

  const [firstActive] = await tx
    .select({ id: artistPseudonym.id })
    .from(artistPseudonym)
    .where(and(
      eq(artistPseudonym.artistaId, artistId),
      isNull(artistPseudonym.deletedAt)
    ))
    .limit(1)
  if (firstActive) return firstActive.id

  throw new Error('El artista no tiene pseudónimos activos')
}
