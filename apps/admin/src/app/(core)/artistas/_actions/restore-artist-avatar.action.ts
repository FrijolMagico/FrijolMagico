'use server'

import 'server-only'

import { updateTag } from 'next/cache'
import { and, eq, isNotNull, isNull, ne, sql } from 'drizzle-orm'
import { z } from 'zod'

import { db } from '@frijolmagico/database/orm'
import { artist } from '@frijolmagico/database/schema'
import { ARTIST_CACHE_TAG } from '@frijolmagico/cache-tags'
import { requireAuth } from '@/shared/lib/auth/utils'
import type { ActionState } from '@/shared/types/actions'

const restoreArtistAvatarSchema = z.object({
  artistaId: z.number().int().positive(),
  avatarId: z.number().int().positive()
})

export type RestoreArtistAvatarInput = z.infer<typeof restoreArtistAvatarSchema>

export interface RestoredArtistAvatar {
  id: number
  artistaId: number
  path: string
  version: string | null
}

export async function restoreArtistAvatarAction(
  input: RestoreArtistAvatarInput
): Promise<ActionState<RestoredArtistAvatar>> {
  await requireAuth()

  try {
    const parsed = restoreArtistAvatarSchema.safeParse(input)
    if (!parsed.success) {
      return {
        success: false,
        errors: parsed.error.issues.map((issue) => ({
          entityType: 'artist-avatar',
          message: issue.message
        }))
      }
    }

    const restoredAvatar = await db.transaction(async (tx) => {
      const [restored] = await tx
        .update(artist.artistImage)
        .set({ deletedAt: null })
        .where(
          and(
            eq(artist.artistImage.id, parsed.data.avatarId),
            eq(artist.artistImage.artistaId, parsed.data.artistaId),
            eq(artist.artistImage.tipo, 'avatar'),
            isNotNull(artist.artistImage.deletedAt)
          )
        )
        .returning({
          id: artist.artistImage.id,
          artistaId: artist.artistImage.artistaId,
          path: artist.artistImage.imagenUrl,
          version: artist.artistImage.artistAvatarVersion
        })

      if (!restored) return null

      await tx
        .update(artist.artistImage)
        .set({ deletedAt: sql`CURRENT_TIMESTAMP` })
        .where(
          and(
            eq(artist.artistImage.artistaId, parsed.data.artistaId),
            eq(artist.artistImage.tipo, 'avatar'),
            ne(artist.artistImage.id, parsed.data.avatarId),
            isNull(artist.artistImage.deletedAt)
          )
        )

      return restored
    })

    if (!restoredAvatar) {
      return {
        success: false,
        errors: [
          {
            entityType: 'artist-avatar',
            message: 'No se encontró un avatar eliminado para restaurar'
          }
        ]
      }
    }

    updateTag(ARTIST_CACHE_TAG)
    return { success: true, data: restoredAvatar }
  } catch (error) {
    return {
      success: false,
      errors: [
        {
          entityType: 'artist-avatar',
          message: error instanceof Error ? error.message : 'Error desconocido'
        }
      ]
    }
  }
}
