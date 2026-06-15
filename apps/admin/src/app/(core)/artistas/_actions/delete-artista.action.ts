'use server'

import 'server-only'
import { updateTag } from 'next/cache'
import { db } from '@frijolmagico/database/orm'
import { artist } from '@frijolmagico/database/schema'
import { and, eq, sql } from 'drizzle-orm'
import { isNotDeleted } from '@frijolmagico/database/filters'
import { requireAuth } from '@/shared/lib/auth/utils'
import { revalidateWebCache } from '@/shared/lib/web-invalidation'
import { deleteCatalogEntry } from '@/shared/lib/catalog-artist-deletion'
import {
  ARTIST_CACHE_TAG,
  CATALOG_CACHE_TAG,
  FEATURED_ARTISTS_CACHE_TAG,
} from '@frijolmagico/cache-tags'
import type { ActionState } from '@/shared/types/actions'

export async function deleteArtistaAction(id: number): Promise<ActionState> {
  try {
    await requireAuth()

    // Find catalog entries for this artist before deletion
    const catalogEntries = await db
      .select({ id: artist.catalogArtist.id })
      .from(artist.catalogArtist)
      .where(
        and(
          eq(artist.catalogArtist.artistaId, id),
          isNotDeleted(artist.catalogArtist.deletedAt),
        ),
      )

    let wasFeatured = false

    await db.transaction(async (tx) => {
      // Delete artist record
      await tx
        .update(artist.artist)
        .set({ deletedAt: sql`CURRENT_TIMESTAMP` })
        .where(
          and(
            eq(artist.artist.id, id),
            isNotDeleted(artist.artist.deletedAt),
          ),
        )

      // Delete catalog entries and handle featured replacement
      for (const entry of catalogEntries) {
        const { wasFeatured: entryWasFeatured } = await deleteCatalogEntry(
          tx,
          entry.id,
        )
        if (entryWasFeatured) wasFeatured = true
      }
    })

    updateTag(ARTIST_CACHE_TAG)
    void revalidateWebCache({ tag: CATALOG_CACHE_TAG, path: '/catalogo' })

    if (wasFeatured) {
      void revalidateWebCache({
        tag: FEATURED_ARTISTS_CACHE_TAG,
        path: '/',
      })
    }

    return { success: true }
  } catch (error) {
    return {
      success: false,
      errors: [
        {
          entityType: 'artista',
          message:
            error instanceof Error ? error.message : 'Error desconocido',
        },
      ],
    }
  }
}
