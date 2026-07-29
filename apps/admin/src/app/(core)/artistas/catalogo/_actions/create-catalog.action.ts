'use server'

import 'server-only'
import { updateTag } from 'next/cache'
import { max } from 'drizzle-orm'
import { generateKeyBetween } from 'fractional-indexing'
import { db } from '@frijolmagico/database/orm'
import { artist } from '@frijolmagico/database/schema'
import {
  CATALOG_CACHE_TAG,
  FEATURED_ARTISTS_CACHE_TAG
} from '@frijolmagico/cache-tags'
import { requireAuth } from '@/shared/lib/auth/utils'
import type { ActionState } from '@/shared/types/actions'
import {
  type CatalogCreateFormInput,
  catalogInsertSchema,
  type CatalogInsertInput
} from '../_schemas/catalog.schema'
import { revalidateWebCache } from '@/shared/lib/web-invalidation'

export async function createCatalogAction(
  _prevState: ActionState<{ id: number }>,
  data: CatalogCreateFormInput
): Promise<ActionState<{ id: number }>> {
  try {
    await requireAuth()

    const lastOrder = await db
      .select({ maxOrden: max(artist.catalogArtist.orden) })
      .from(artist.catalogArtist)
      .then((res) => res[0]?.maxOrden ?? null)

    const newOrden = generateKeyBetween(lastOrder, null)

    const newCatalog: CatalogInsertInput = {
      ...data,
      orden: newOrden
    }

    const parsed = catalogInsertSchema.safeParse(newCatalog)

    if (!parsed.success) {
      return {
        success: false,
        errors: parsed.error.issues.map((issue) => ({
          entityType: 'catalogo',
          message: issue.message
        }))
      }
    }

    const { artistaId, ...catalog } = parsed.data

    await db.insert(artist.catalogArtist).values({
      ...catalog,
      artistaId
    })

    // NOTE: Soft-deleted catalog rows still rely on the current unique `artistaId`
    // constraint. This change does not introduce restore-or-reinsert semantics.

    updateTag(CATALOG_CACHE_TAG)
    revalidateWebCache({
      tag: CATALOG_CACHE_TAG,
      path: '/catalogo'
    })

    if ('destacado' in parsed.data && parsed.data.destacado) {
      void revalidateWebCache({
        tag: FEATURED_ARTISTS_CACHE_TAG,
        path: '/'
      })
    }

    return { success: true }
  } catch (error) {
    return {
      success: false,
      errors: [
        {
          entityType: 'catalogo',
          message:
            error instanceof Error
              ? error.message
              : 'Error desconocido al agregar al catálogo'
        }
      ]
    }
  }
}
