'use server'

import 'server-only'

import { updateTag } from 'next/cache'

import { db } from '@frijolmagico/database/orm'
import { artist } from '@frijolmagico/database/schema'
import { and, eq, isNotNull } from 'drizzle-orm'
import { requireAuth } from '@/shared/lib/auth/utils'
import { CATALOG_CACHE_TAG } from '@frijolmagico/cache-tags'
import type { ActionState } from '@/shared/types/actions'

export async function restoreCatalogAction(id: number): Promise<ActionState> {
  try {
    await requireAuth()

    await db
      .update(artist.catalogArtist)
      .set({ deletedAt: null })
      .where(
        and(
          eq(artist.catalogArtist.id, id),
          isNotNull(artist.catalogArtist.deletedAt)
        )
      )

    updateTag(CATALOG_CACHE_TAG)

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
              : 'Error desconocido al restaurar el catálogo'
        }
      ]
    }
  }
}
