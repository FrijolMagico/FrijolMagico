'use server'

import 'server-only'
import { updateTag } from 'next/cache'
import { db } from '@frijolmagico/database/orm'
import { events } from '@frijolmagico/database/schema'
import { eq } from 'drizzle-orm'
import {
  EDITION_CACHE_TAG,
  EVENT_CACHE_TAG,
  FESTIVALES_CACHE_TAG,
  FESTIVAL_CRITICAL_CACHE_TAG
} from '@frijolmagico/cache-tags'
import { requireAuth } from '@/shared/lib/auth/utils'
import { revalidateWebCacheBatch } from '@/shared/lib/web-invalidation'
import type { ActionState } from '@/shared/types/actions'
import {
  editionPublicationSchema,
  type EditionPublicationInput
} from '../_schemas/edition-publication.schema'

const { eventEdition } = events
const LOCAL_CACHE_TAGS = [EDITION_CACHE_TAG, EVENT_CACHE_TAG]
const WEB_CACHE_INVALIDATIONS = [
  { tag: FESTIVAL_CRITICAL_CACHE_TAG, mode: 'immediate' },
  { tag: FESTIVALES_CACHE_TAG, mode: 'swr' }
] as const

async function syncPublicationCaches() {
  for (const tag of LOCAL_CACHE_TAGS) {
    try {
      updateTag(tag)
    } catch {
      console.error('[edition-publication] Local cache sync failed', { tag })
    }
  }

  const webInvalidations = [...WEB_CACHE_INVALIDATIONS]

  return await revalidateWebCacheBatch(
    webInvalidations,
    'update-edition-publication'
  )
}

export async function updateEditionPublicationAction(
  input: EditionPublicationInput
): Promise<ActionState<{ published: boolean }>> {
  try {
    await requireAuth()

    const parsed = editionPublicationSchema.safeParse(input)

    if (!parsed.success) {
      return {
        success: false,
        errors: parsed.error.issues.map((issue) => ({
          entityType: 'edicion',
          message: issue.message
        }))
      }
    }

    await db
      .update(eventEdition)
      .set({ published: parsed.data.published })
      .where(eq(eventEdition.id, parsed.data.id))
      .returning({ id: eventEdition.id })

    const webInvalidation = await syncPublicationCaches()

    return {
      success: true,
      data: { published: parsed.data.published },
      ...webInvalidation
    }
  } catch (error) {
    return {
      success: false,
      errors: [
        {
          entityType: 'edicion',
          message:
            error instanceof Error ? error.message : 'Error al actualizar publicación'
        }
      ]
    }
  }
}
