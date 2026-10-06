'use server'

import 'server-only'
import { updateTag } from 'next/cache'
import { eq } from 'drizzle-orm'
import { db } from '@frijolmagico/database/orm'
import { events } from '@frijolmagico/database/schema'
import { requireAuth } from '@/shared/lib/auth/utils'
import type { ActionState } from '@/shared/types/actions'
import { revalidateWebCacheBatch } from '@/shared/lib/web-invalidation'
import type { RevalidateWebCacheOptions } from '@/shared/lib/web-invalidation'
import {
  CATALOG_CACHE_TAG,
  CATALOG_EDITION_DATES_CACHE_TAG,
  CATALOG_PARTICIPATION_CACHE_TAG,
  EDITION_CACHE_TAG,
  FESTIVALES_CACHE_TAG,
  FESTIVAL_CRITICAL_CACHE_TAG,
  EDITION_DAY_CACHE_TAG
} from '@frijolmagico/cache-tags'

const { eventEdition } = events

export async function deleteEditionAction(
  _prevState: ActionState<void>,
  payload: { id: number }
): Promise<ActionState<void>> {
  await requireAuth()

  const id = payload.id
  if (!id || isNaN(id)) {
    return {
      success: false,
      errors: [{ entityType: 'edicion', message: 'ID inválido' }]
    }
  }

  const deletedEditions = await db
    .delete(eventEdition)
    .where(eq(eventEdition.id, id))
    .returning({
      id: eventEdition.id,
      published: eventEdition.published,
      slug: eventEdition.slug
    })

  if (deletedEditions.length === 0) return { success: true }

  updateTag(EDITION_CACHE_TAG)
  updateTag(EDITION_DAY_CACHE_TAG)
  const invalidationRequests: RevalidateWebCacheOptions[] = [
    { tag: FESTIVAL_CRITICAL_CACHE_TAG, mode: 'immediate' },
    { tag: FESTIVALES_CACHE_TAG, mode: 'swr' }
  ]
  for (const { published, slug } of deletedEditions) {
    if (slug) {
      invalidationRequests.push({
        tag: FESTIVAL_CRITICAL_CACHE_TAG,
        path: `/festivales/${slug}`,
        mode: 'immediate'
      })
    }
    invalidationRequests.push({ tag: FESTIVALES_CACHE_TAG, path: '/festivales' })
    if (published && slug) {
      invalidationRequests.push(
        { path: '/', pathType: 'page' },
        { path: '/', pathType: 'layout' }
      )
    }
  }
  invalidationRequests.push(
    { tag: CATALOG_CACHE_TAG },
    { tag: CATALOG_PARTICIPATION_CACHE_TAG },
    { tag: CATALOG_EDITION_DATES_CACHE_TAG }
  )
  const webInvalidation = await revalidateWebCacheBatch(
    invalidationRequests,
    'delete-edition'
  )

  return {
    success: true,
    ...(webInvalidation.webRevalidation
      ? { webRevalidation: webInvalidation.webRevalidation }
      : {})
  }
}
