'use server'

import 'server-only'
import { updateTag } from 'next/cache'
import { eq } from 'drizzle-orm'
import { db } from '@frijolmagico/database/orm'
import { participations } from '@frijolmagico/database/schema'
import { requireAuth } from '@/shared/lib/auth/utils'
import { ActionState } from '@/shared/types/actions'
import {
  editionParticipationUpdateSchema,
  type ParticipationUpdateInput
} from '../../_schemas/edition-participation.schema'
import {
  ARTIST_DETAIL_CACHE_TAG,
  CATALOG_CACHE_TAG,
  CATALOG_PARTICIPATION_CACHE_TAG,
  FESTIVAL_CRITICAL_CACHE_TAG,
  FESTIVALES_CACHE_TAG,
  getEditionParticipationsCacheTag
} from '@frijolmagico/cache-tags'
import {
  revalidateWebCacheBatch,
  type RevalidateWebCacheOptions
} from '@/shared/lib/web-invalidation'

const { editionParticipation } = participations

export async function updateParticipationAction(
  payload: ParticipationUpdateInput
): Promise<ActionState> {
  try {
    await requireAuth()

    const parsed = editionParticipationUpdateSchema.safeParse(payload)

    if (!parsed.success) {
      return {
        success: false,
        errors: parsed.error.issues.map((issue) => ({
          entityType: 'detalles',
          message: issue.message
        }))
      }
    }

    let oldEditionId: number | null = null
    let changed = false
    let relationshipChanged = false
    let editionChanged = false
    let catalogChanged = false
    await db.transaction(async (tx) => {
      const existing = await tx.query.editionParticipation.findFirst({
        where: (table, operators) => operators.eq(table.id, parsed.data.id),
      })
      if (!existing) throw new Error('No se encontró la participación')

      oldEditionId = existing.edicionId
      changed = Object.entries(parsed.data).some(
        ([key, value]) => existing[key as keyof typeof existing] !== value
      )
      if (!changed) return

      editionChanged = existing.edicionId !== parsed.data.edicionId
      relationshipChanged =
        editionChanged ||
        existing.artistaId !== parsed.data.artistaId ||
        existing.agrupacionId !== parsed.data.agrupacionId
      catalogChanged =
        existing.edicionId !== parsed.data.edicionId ||
        existing.artistaId !== parsed.data.artistaId ||
        existing.agrupacionId !== parsed.data.agrupacionId
      await tx
        .update(editionParticipation)
        .set(parsed.data)
        .where(eq(editionParticipation.id, parsed.data.id))
    })

    if (!changed) return { success: true }
    if (oldEditionId !== null) {
      updateTag(getEditionParticipationsCacheTag(oldEditionId))
    }
    if (oldEditionId !== parsed.data.edicionId) {
      updateTag(getEditionParticipationsCacheTag(parsed.data.edicionId))
    }
    updateTag(ARTIST_DETAIL_CACHE_TAG)
    const webRevalidationRequests: RevalidateWebCacheOptions[] = []
    if (relationshipChanged) {
      webRevalidationRequests.push({
        tag: FESTIVAL_CRITICAL_CACHE_TAG,
        mode: 'immediate',
        path: '/festivales/[slug]',
        pathType: 'page'
      })
    }
    if (editionChanged) {
      webRevalidationRequests.push({ tag: FESTIVALES_CACHE_TAG, mode: 'swr' })
    }
    if (catalogChanged) {
      webRevalidationRequests.push(
        { tag: CATALOG_CACHE_TAG },
        { tag: CATALOG_PARTICIPATION_CACHE_TAG }
      )
    }

    const webRevalidation = webRevalidationRequests.length
      ? await revalidateWebCacheBatch(webRevalidationRequests, 'update-participation')
      : {}

    return { success: true, ...webRevalidation }
  } catch (error) {
    console.error('[updateDetallesAction]', error)
    return {
      success: false,
      errors: [
        {
          entityType: 'detalles',
          message:
            error instanceof Error
              ? error.message
              : 'Error al actualizar los detalles'
        }
      ]
    }
  }
}
