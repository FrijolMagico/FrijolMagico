'use server'

import 'server-only'
import { updateTag } from 'next/cache'
import { db } from '@frijolmagico/database/orm'
import { artist } from '@frijolmagico/database/schema'
import { requireAuth } from '@/shared/lib/auth/utils'
import { ARTIST_CACHE_TAG } from '@frijolmagico/cache-tags'
import {
  artistInsertSchema,
  type ArtistInsertInput
} from '../_schemas/artista.schema'
import type { ActionState } from '@/shared/types/actions'

export interface CreateArtistActionData {
  id: number
}

export async function createArtistaAction(
  _prevState: ActionState<CreateArtistActionData>,
  data: ArtistInsertInput & { slug: string }
): Promise<ActionState<CreateArtistActionData>> {
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

    const [createdArtist] = await db
      .insert(artist.artist)
      .values(parsed.data)
      .returning({ id: artist.artist.id })

    if (!createdArtist) {
      throw new Error('No se pudo obtener el ID del artista creado')
    }

    try {
      updateTag(ARTIST_CACHE_TAG)
    } catch {
      // The database mutation has already committed; cache invalidation is best-effort.
    }

    return { success: true, data: { id: createdArtist.id } }
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
