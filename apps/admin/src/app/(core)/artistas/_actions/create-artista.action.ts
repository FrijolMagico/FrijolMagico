'use server'

import 'server-only'
import { updateTag } from 'next/cache'
import { db } from '@frijolmagico/database/orm'
import { artist } from '@frijolmagico/database/schema'
import { requireAuth } from '@/shared/lib/auth/utils'
import {
  artistInsertSchema,
  ArtistInsertInput
} from '../_schemas/artista.schema'
import type { ActionState } from '@/shared/types/actions'
import { ARTIST_CACHE_TAG } from '../_constants'

export async function createArtistaAction(
  _prevState: ActionState,
  data: ArtistInsertInput & { slug: string }
): Promise<ActionState> {
  try {
    await requireAuth()

    const parsed = artistInsertSchema.safeParse(data)

    if (!parsed.success) {
      return {
        success: false,
        errors: parsed.error.issues.map((issue) => ({
          entityType: 'artista',
          message: issue.message
        }))
      }
    }

    await db.insert(artist.artist).values(parsed.data)

    updateTag(ARTIST_CACHE_TAG)

    return { success: true }
  } catch (error) {
    return {
      success: false,
      errors: [
        {
          entityType: 'organizacion',
          message: error instanceof Error ? error.message : 'Error desconocido'
        }
      ]
    }
  }
}
