'use server'

import 'server-only'

import { updateTag } from 'next/cache'
import { and, eq, isNull, sql } from 'drizzle-orm'
import { z } from 'zod'

import { db } from '@frijolmagico/database/orm'
import { artist } from '@frijolmagico/database/schema'
import { ARTIST_CACHE_TAG } from '@frijolmagico/cache-tags'
import { requireAuth } from '@/shared/lib/auth/utils'
import type { ManagedAssetReference } from '@/shared/assets-manager/managed-asset-reference'
import type { ActionState } from '@/shared/types/actions'

const removeArtistAvatarSchema = z.object({
  artistaId: z.number().int().positive(),
  path: z.string().min(1),
  version: z.string().min(1).nullable()
})

export type RemoveArtistAvatarInput = z.infer<typeof removeArtistAvatarSchema>

export interface RemoveArtistAvatarData {
  deleted: boolean
  asset: ManagedAssetReference | null
}

export async function removeArtistAvatarAction(
  input: RemoveArtistAvatarInput
): Promise<ActionState<RemoveArtistAvatarData>> {
  try {
    await requireAuth()

    const parsed = removeArtistAvatarSchema.safeParse(input)
    if (!parsed.success) {
      return {
        success: false,
        errors: parsed.error.issues.map((issue) => ({
          entityType: 'artist-avatar',
          message: issue.message
        }))
      }
    }

    const deletedAvatar = await db.transaction(async (tx) => {
      const versionCondition =
        parsed.data.version === null
          ? isNull(artist.artistImage.artistAvatarVersion)
          : eq(artist.artistImage.artistAvatarVersion, parsed.data.version)

      const [avatar] = await tx
        .update(artist.artistImage)
        .set({ deletedAt: sql`CURRENT_TIMESTAMP` })
        .where(
          and(
            eq(artist.artistImage.artistaId, parsed.data.artistaId),
            eq(artist.artistImage.imagenUrl, parsed.data.path),
            eq(artist.artistImage.tipo, 'avatar'),
            isNull(artist.artistImage.deletedAt),
            versionCondition
          )
        )
        .returning({
          id: artist.artistImage.id,
          artistaId: artist.artistImage.artistaId,
          path: artist.artistImage.imagenUrl,
          version: artist.artistImage.artistAvatarVersion
        })

      return avatar ?? null
    })

    if (!deletedAvatar) {
      return {
        success: false,
        errors: [
          {
            entityType: 'artist-avatar',
            message: 'No se encontró un avatar activo coincidente para eliminar'
          }
        ]
      }
    }

    try {
      updateTag(ARTIST_CACHE_TAG)
    } catch {
      // The database mutation has already committed; cache invalidation is best-effort.
    }

    // The client uses this reference for best-effort DELETE /api/assets after
    // the DB commit; the server action must not make a fragile relative fetch.
    return {
      success: true,
      data: {
        deleted: true,
        asset: { path: deletedAvatar.path, version: deletedAvatar.version }
      }
    }
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
