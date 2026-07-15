'use server'

import 'server-only'
import { updateTag } from 'next/cache'
import { db } from '@frijolmagico/database/orm'
import { events } from '@frijolmagico/database/schema'
import { eq } from 'drizzle-orm'
import { EDITION_CACHE_TAG, EVENT_CACHE_TAG } from '@frijolmagico/cache-tags'
import { requireAuth } from '@/shared/lib/auth/utils'
import { revalidateWebCache } from '@/shared/lib/web-invalidation'
import type { ActionState } from '@/shared/types/actions'
import {
  editionPublicationSchema,
  type EditionPublicationInput
} from '../_schemas/edition-publication.schema'

const { eventEdition } = events
const CACHE_TAGS = [EDITION_CACHE_TAG, EVENT_CACHE_TAG]
async function syncPublicationCaches() {
  for (const tag of CACHE_TAGS) {
    try {
      updateTag(tag)
    } catch {
      console.error('[edition-publication] Local cache sync failed', { tag })
    }
  }

  const results = await Promise.allSettled(
    CACHE_TAGS.map((tag) => Promise.resolve().then(() => revalidateWebCache({ tag })))
  )

  results.forEach((result, index) => {
    if (result.status === 'rejected') {
      console.error('[edition-publication] Web cache sync failed', {
        tag: CACHE_TAGS[index]
      })
    }
  })
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

    await syncPublicationCaches()

    return { success: true, data: { published: parsed.data.published } }
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
