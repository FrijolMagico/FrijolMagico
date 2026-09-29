'use server'

import 'server-only'
import { updateTag } from 'next/cache'
import { eq } from 'drizzle-orm'
import { db } from '@frijolmagico/database/orm'
import { participations } from '@frijolmagico/database/schema'
import { requireAuth } from '@/shared/lib/auth/utils'
import type { ActionState } from '@/shared/types/actions'
import {
  ARTIST_DETAIL_CACHE_TAG,
  CATALOG_CACHE_TAG,
  CATALOG_PARTICIPATION_CACHE_TAG,
  EDITION_CACHE_TAG,
  EVENT_CACHE_TAG,
  FESTIVALES_CACHE_TAG,
  getEditionParticipationsCacheTag,
  getParticipationExhibitionsCacheTag
} from '@frijolmagico/cache-tags'
import { revalidateWebCacheBestEffort } from '@/shared/lib/web-invalidation'
import { resolveActiveArtistPseudonym } from '../_lib/resolve-artist-pseudonym'
import {
  exhibitionUpdateSchema,
  type ExhibitionUpdateInput
} from '../../_schemas/exhibition.schema'

const { participationExhibition } = participations
const PUBLIC_EXHIBITION_TAGS = [FESTIVALES_CACHE_TAG, EVENT_CACHE_TAG, EDITION_CACHE_TAG]

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

    let catalogChanged = false
    let changed = false
    let oldParticipationId: number | null = null
    let editionId: number | null = null
    await db.transaction(async (tx) => {
      const existing = await tx.query.participationExhibition.findFirst({
        where: (table, operators) =>
          operators.eq(table.id, parsed.data.id),
        with: { participacion: { columns: { edicionId: true } } }
      })
      if (!existing) throw new Error('No se encontró la exhibición')

      const artistId = parsed.data.artistaId ?? existing.artistaId
      oldParticipationId = existing.participacionId
      editionId = existing.participacion?.edicionId ?? null
      const pseudonimoId = artistId
        ? await resolveActiveArtistPseudonym(
            tx,
            artistId,
            parsed.data.pseudonimoId,
            existing.pseudonimoId
          )
        : null
      const values = {
        ...parsed.data,
        artistaId: artistId ?? null,
        pseudonimoId
      }
      const nextEstado = values.estado ?? existing.estado
      const nextDisciplinaId = values.disciplinaId ?? existing.disciplinaId
      const nextParticipationId =
        values.participacionId ?? existing.participacionId
      const publicBefore = ['confirmado', 'completado'].includes(existing.estado ?? '')
      const publicAfter = ['confirmado', 'completado'].includes(nextEstado ?? '')
      changed = Object.entries(values).some(([key, value]) => {
        if (key === 'id') return false
        return existing[key as keyof typeof existing] !== value
      })
      catalogChanged =
        (publicBefore || publicAfter) &&
        (existing.estado !== nextEstado ||
          existing.disciplinaId !== nextDisciplinaId ||
          existing.participacionId !== nextParticipationId ||
          existing.artistaId !== (artistId ?? null) ||
          existing.pseudonimoId !== pseudonimoId)
      if (changed) {
        await tx
          .update(participationExhibition)
          .set(values)
          .where(eq(participationExhibition.id, parsed.data.id))
      }
    })

    if (!changed) return { success: true }
    if (oldParticipationId !== null) {
      updateTag(getParticipationExhibitionsCacheTag(oldParticipationId))
      updateTag(getEditionParticipationsCacheTag(editionId ?? parsed.data.participacionId))
    }
    if (oldParticipationId !== parsed.data.participacionId) {
      updateTag(getParticipationExhibitionsCacheTag(parsed.data.participacionId))
    }
    updateTag(ARTIST_DETAIL_CACHE_TAG)
    for (const tag of PUBLIC_EXHIBITION_TAGS) {
      try {
        updateTag(tag)
      } catch (error) {
        console.error('[updateExhibitionAction] Local invalidation failed', { tag, error })
      }
      void revalidateWebCacheBestEffort({ tag })
    }
    if (catalogChanged) {
      void revalidateWebCacheBestEffort({ tag: CATALOG_CACHE_TAG })
      void revalidateWebCacheBestEffort({ tag: CATALOG_PARTICIPATION_CACHE_TAG })
    }

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
