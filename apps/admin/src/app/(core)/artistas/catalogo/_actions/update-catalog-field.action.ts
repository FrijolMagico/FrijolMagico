'use server'

import 'server-only'
import { updateTag } from 'next/cache'
import { db } from '@frijolmagico/database/orm'
import { artist } from '@frijolmagico/database/schema'
import { eq } from 'drizzle-orm'
import {
  CATALOG_CACHE_TAG,
  FEATURED_ARTISTS_CACHE_TAG
} from '@frijolmagico/cache-tags'
import { requireAuth } from '@/shared/lib/auth/utils'
import { revalidateWebCache } from '@/shared/lib/web-invalidation'
import {
  catalogFieldUpdateSchema,
  type CatalogFieldUpdateInput
} from '../_schemas/catalog.schema'
import type { ActionState } from '@/shared/types/actions'

export async function updateCatalogFieldAction(
  id: number,
  data: CatalogFieldUpdateInput
): Promise<ActionState> {
  await requireAuth()

  const parsed = catalogFieldUpdateSchema.safeParse(data)

  if (!parsed.success) {
    return {
      success: false,
      errors: parsed.error.issues.map((issue) => ({
        entityType: 'catalogo',
        message: issue.message
      }))
    }
  }

  await db
    .update(artist.catalogArtist)
    .set(parsed.data)
    .where(eq(artist.catalogArtist.id, id))

  updateTag(CATALOG_CACHE_TAG)
  void revalidateWebCache({
    tag: CATALOG_CACHE_TAG,
    path: '/catalogo'
  })

  if ('destacado' in parsed.data) {
    console.log(
      '[updateCatalogFieldAction] Destacado field updated, invalidating featured artists cache'
    )
    void revalidateWebCache({
      tag: FEATURED_ARTISTS_CACHE_TAG,
      path: '/'
    })
  }

  return { success: true }
}
