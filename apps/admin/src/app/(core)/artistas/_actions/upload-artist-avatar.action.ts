'use server'

import 'server-only'

import { updateTag } from 'next/cache'
import { and, eq, isNull, sql } from 'drizzle-orm'
import { z } from 'zod'

import { db } from '@frijolmagico/database/orm'
import { artist } from '@frijolmagico/database/schema'
import { ARTIST_CACHE_TAG } from '@frijolmagico/cache-tags'
import type { ManagedAssetReference } from '@/shared/assets-manager/managed-asset-reference'
import { requireAuth } from '@/shared/lib/auth/utils'
import type { ActionState } from '@/shared/types/actions'

const uploadArtistAvatarSchema = z.object({
  artistaId: z.number().int().positive(),
  path: z.string().min(1),
  version: z.string().min(1)
})

export type UploadArtistAvatarInput = z.infer<typeof uploadArtistAvatarSchema>

export interface UploadArtistAvatarData {
  id: number
  artistaId: number
  path: string
  version: string | null
  oldAsset: ManagedAssetReference | null
}

export async function uploadArtistAvatarAction(
  input: UploadArtistAvatarInput
): Promise<ActionState<UploadArtistAvatarData>> {
  try {
    await requireAuth()

    const parsed = uploadArtistAvatarSchema.safeParse(input)
    if (!parsed.success) {
      return {
        success: false,
        errors: parsed.error.issues.map((issue) => ({
          entityType: 'artist-avatar',
          message: issue.message
        }))
      }
    }

    const avatar = await db.transaction(async (tx) => {
      const [oldAvatar] = await tx
        .update(artist.artistImage)
        .set({ deletedAt: sql`CURRENT_TIMESTAMP` })
        .where(
          and(
            eq(artist.artistImage.artistaId, parsed.data.artistaId),
            eq(artist.artistImage.tipo, 'avatar'),
            isNull(artist.artistImage.deletedAt)
          )
        )
        .returning({
          path: artist.artistImage.imagenUrl,
          version: artist.artistImage.artistAvatarVersion
        })

      const [insertedAvatar] = await tx
        .insert(artist.artistImage)
        .values({
          artistaId: parsed.data.artistaId,
          imagenUrl: parsed.data.path,
          artistAvatarVersion: parsed.data.version,
          tipo: 'avatar',
          orden: 1
        })
        .returning({
          id: artist.artistImage.id,
          artistaId: artist.artistImage.artistaId,
          path: artist.artistImage.imagenUrl,
          version: artist.artistImage.artistAvatarVersion
        })

      if (!insertedAvatar) {
        throw new Error('No se pudo persistir el avatar del artista')
      }

      return {
        ...insertedAvatar,
        oldAsset: oldAvatar ?? null
      }
    })

    try {
      updateTag(ARTIST_CACHE_TAG)
    } catch {
      // The database mutation has already committed; cache invalidation is best-effort.
    }

    return { success: true, data: avatar }
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
