'use server'

import 'server-only'
import { updateTag } from 'next/cache'
import { db } from '@frijolmagico/database/orm'
import { artist } from '@frijolmagico/database/schema'
import { and, eq, sql } from 'drizzle-orm'
import { isNotDeleted } from '@frijolmagico/database/filters'
import { requireAuth } from '@/shared/lib/auth/utils'
import type { ActionState } from '@/shared/types/actions'
import { ARTIST_CACHE_TAG } from '../_constants'

export async function deleteArtistaAction(id: number): Promise<ActionState> {
  try {
    await requireAuth()

    await db
      .update(artist.artist)
      .set({ deletedAt: sql`CURRENT_TIMESTAMP` })
      .where(
        and(eq(artist.artist.id, id), isNotDeleted(artist.artist.deletedAt))
      )

    updateTag(ARTIST_CACHE_TAG)

    return { success: true }
  } catch (error) {
    return {
      success: false,
      errors: [
        {
          entityType: 'artista',
          message: error instanceof Error ? error.message : 'Error desconocido'
        }
      ]
    }
  }
}
