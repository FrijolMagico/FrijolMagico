'use server'

import 'server-only'
import { updateTag } from 'next/cache'
import { db } from '@frijolmagico/database/orm'
import { artist } from '@frijolmagico/database/schema'
import { and, eq, isNull } from 'drizzle-orm'
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

  // Server-side avatar guard: can't activate a catalog entry without an avatar
  if (parsed.data.activo === true) {
    const [row] = await db
      .select({ artistaId: artist.catalogArtist.artistaId })
      .from(artist.catalogArtist)
      .where(eq(artist.catalogArtist.id, id))
      .limit(1)

    if (row) {
      const [avatar] = await db
        .select({ id: artist.artistImage.id })
        .from(artist.artistImage)
        .where(
          and(
            eq(artist.artistImage.artistaId, row.artistaId),
            eq(artist.artistImage.tipo, 'avatar'),
            isNull(artist.artistImage.deletedAt)
          )
        )
        .limit(1)

      if (!avatar) {
        return {
          success: false,
          errors: [
            {
              entityType: 'catalogo',
              message:
                'No se puede activar una entrada sin avatar. Debe subir un avatar antes de activar la entrada.'
            }
          ]
        }
      }
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
