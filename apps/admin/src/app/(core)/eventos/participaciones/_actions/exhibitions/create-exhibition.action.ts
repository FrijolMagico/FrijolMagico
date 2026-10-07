'use server'

import 'server-only'
import { updateTag } from 'next/cache'
import { db } from '@frijolmagico/database/orm'
import { participations } from '@frijolmagico/database/schema'
import { requireAuth } from '@/shared/lib/auth/utils'
import { ActionState } from '@/shared/types/actions'
import {
  ARTIST_DETAIL_CACHE_TAG,
  CATALOG_CACHE_TAG,
  CATALOG_PARTICIPATION_CACHE_TAG,
  EDITION_CACHE_TAG,
  EVENT_CACHE_TAG,
  FESTIVALES_CACHE_TAG,
  FESTIVAL_CRITICAL_CACHE_TAG,
  getEditionParticipationsCacheTag,
  getParticipationExhibitionsCacheTag
} from '@frijolmagico/cache-tags'
import { findOrCreateEditionParticipation } from '../_lib/find-or-create-edition-participation'
import { revalidateWebCacheBatch } from '@/shared/lib/web-invalidation'
import { resolveActiveArtistPseudonym } from '../_lib/resolve-artist-pseudonym'
import {
  type ExhibitionInsertInput,
  exhibitionInsertSchema
} from '../../_schemas/exhibition.schema'
import {
  editionParticipationInsertSchema,
  ParticipationInsertInput
} from '../../_schemas/edition-participation.schema'

const { participationExhibition } = participations
const PUBLIC_EXHIBITION_TAGS = [FESTIVALES_CACHE_TAG, EVENT_CACHE_TAG, EDITION_CACHE_TAG]

export async function createExhibitionAction(data: {
  participation: ParticipationInsertInput
  exhibition: Omit<ExhibitionInsertInput, 'participacionId'>
}): Promise<ActionState> {
  try {
    await requireAuth()

    const parsed = editionParticipationInsertSchema.safeParse(
      data.participation
    )

    if (!parsed.success) {
      return {
        success: false,
        errors: parsed.error.issues.map((issue) => ({
          entityType: 'participacion',
          message: issue.message
        }))
      }
    }

    let participationId: number | null = null
    let catalogChanged = false

    await db.transaction(async (tx) => {
      const participationRecord = await findOrCreateEditionParticipation(
        tx,
        parsed.data
      )

      participationId = participationRecord.id

      if (!participationId) {
        throw new Error('Error al crear o encontrar la participación')
      }

      const pseudonimoId = parsed.data.artistaId
        ? await resolveActiveArtistPseudonym(
            tx,
            parsed.data.artistaId,
            data.exhibition.pseudonimoId
          )
        : null
      const exhibitionValues = exhibitionInsertSchema.parse({
        ...data.exhibition,
        artistaId: parsed.data.artistaId ?? null,
        pseudonimoId,
        participacionId: participationRecord.id
      })

      await tx.insert(participationExhibition).values(exhibitionValues)
      catalogChanged = ['confirmado', 'completado'].includes(
        exhibitionValues.estado ?? ''
      )
    })

    updateTag(getEditionParticipationsCacheTag(data.participation.edicionId))
    if (participationId !== null) {
      updateTag(getParticipationExhibitionsCacheTag(participationId))
    }
    updateTag(ARTIST_DETAIL_CACHE_TAG)
    for (const tag of PUBLIC_EXHIBITION_TAGS) {
      try {
        updateTag(tag)
      } catch (error) {
        console.error('[createExhibitionAction] Local invalidation failed', { tag, error })
      }
    }
    const webRevalidation = await revalidateWebCacheBatch(
      [
        {
          tag: FESTIVAL_CRITICAL_CACHE_TAG,
          mode: 'immediate'
        },
        {
          tag: FESTIVALES_CACHE_TAG,
          mode: 'swr'
        },
        ...(catalogChanged
          ? [{ tag: CATALOG_CACHE_TAG }, { tag: CATALOG_PARTICIPATION_CACHE_TAG }]
          : [])
      ],
      'create-exhibition'
    )

    return { success: true, ...webRevalidation }
  } catch (error) {
    console.error('[createExhibitionAction]', error)
    return {
      success: false,
      errors: [
        {
          entityType: 'participacion',
          message:
            error instanceof Error
              ? error.message
              : 'Error al guardar el expositor'
        }
      ]
    }
  }
}
