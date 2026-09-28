'use server'

import 'server-only'
import { updateTag } from 'next/cache'
import { eq } from 'drizzle-orm'
import { db } from '@frijolmagico/database/orm'
import { participations } from '@frijolmagico/database/schema'
import { requireAuth } from '@/shared/lib/auth/utils'
import type { ActionState } from '@/shared/types/actions'
import { ARTIST_DETAIL_CACHE_TAG, getParticipationExhibitionsCacheTag } from '@frijolmagico/cache-tags'
import { resolveActiveArtistPseudonym } from '../_lib/resolve-artist-pseudonym'
import {
  exhibitionUpdateSchema,
  type ExhibitionUpdateInput
} from '../../_schemas/exhibition.schema'

const { participationExhibition } = participations

export async function updateExhibitionAction(
  payload: ExhibitionUpdateInput
): Promise<ActionState> {
  try {
    await requireAuth()

    const parsed = exhibitionUpdateSchema.safeParse(payload)

    if (!parsed.success) {
      return {
        success: false,
        errors: parsed.error.issues.map((issue) => ({
          entityType: 'expositor',
          message: issue.message
        }))
      }
    }

    await db.transaction(async (tx) => {
      const existing = await tx.query.participationExhibition.findFirst({
        where: (table, operators) =>
          operators.eq(table.id, parsed.data.id),
        columns: { artistaId: true, pseudonimoId: true }
      })
      if (!existing) throw new Error('No se encontró la exhibición')

      const artistId = parsed.data.artistaId ?? existing.artistaId
      const pseudonimoId = artistId
        ? await resolveActiveArtistPseudonym(
            tx,
            artistId,
            parsed.data.pseudonimoId,
            existing.pseudonimoId
          )
        : null
      await tx
        .update(participationExhibition)
        .set({ ...parsed.data, artistaId: artistId ?? null, pseudonimoId })
        .where(eq(participationExhibition.id, parsed.data.id))
    })

    updateTag(getParticipationExhibitionsCacheTag(parsed.data.participacionId))
    updateTag(ARTIST_DETAIL_CACHE_TAG)

    return { success: true }
  } catch (error) {
    console.error('[updateExhibitionAction]', error)
    return {
      success: false,
      errors: [
        {
          entityType: 'expositor',
          message:
            error instanceof Error
              ? error.message
              : 'Error al actualizar el expositor'
        }
      ]
    }
  }
}
