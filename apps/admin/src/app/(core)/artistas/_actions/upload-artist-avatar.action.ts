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
import {
  R2Adapter,
  createR2Config
} from '@/shared/assets-manager/server/r2-adapter'
import type { ActionState } from '@/shared/types/actions'
import type { ExpectedActiveAvatar } from '../catalogo/_lib/avatar-history-contracts'

const uploadArtistAvatarSchema = z
  .object({
    artistaId: z.number().int().positive(),
    blob: z.instanceof(Blob).refine((blob) => blob.type === 'image/webp', {
      message: 'El avatar debe estar en formato WebP'
    }),
    width: z.number().int().positive(),
    height: z.number().int().positive(),
    expectedActive: z
      .object({
        id: z.number().int().positive(),
        path: z.string().min(1),
        version: z.string().nullable()
      })
      .nullable()
      .optional()
  })
  .refine((input) => input.width === 800 && input.height === 800, {
    message: 'El avatar preparado debe medir exactamente 800×800 px'
  })

export type UploadArtistAvatarInput = z.infer<typeof uploadArtistAvatarSchema>

export interface UploadArtistAvatarData {
  id: number
  artistaId: number
  path: string
  version: string | null
  oldAsset: ManagedAssetReference | null
}

function getStore(): R2Adapter {
  return new R2Adapter(createR2Config())
}

async function getArtistSlug(artistaId: number): Promise<string | null> {
  const [artistRecord] = await db
    .select({ slug: artist.artist.slug })
    .from(artist.artist)
    .where(eq(artist.artist.id, artistaId))

  return artistRecord?.slug ?? null
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

    const slug = await getArtistSlug(parsed.data.artistaId)
    if (!slug) throw new Error('No se encontró el artista para el avatar')

    const version = String(Date.now())
    const path = `artistas/${slug}/avatar-${version}.webp`
    const store = getStore()
    await store.putObject(path, parsed.data.blob)

    let avatar: UploadArtistAvatarData
    try {
      avatar = await db.transaction(async (tx) => {
        const [oldAvatar] = await tx
          .update(artist.artistImage)
          .set({ deletedAt: sql`CURRENT_TIMESTAMP` })
          .where(
            activeAvatarWhere(parsed.data.artistaId, parsed.data.expectedActive)
          )
          .returning({
            path: artist.artistImage.imagenUrl,
            version: artist.artistImage.artistAvatarVersion
          })

        if (parsed.data.expectedActive && !oldAvatar) {
          throw new Error('AVATAR_CONFLICT')
        }

        const [insertedAvatar] = await tx
          .insert(artist.artistImage)
          .values({
            artistaId: parsed.data.artistaId,
            imagenUrl: path,
            artistAvatarVersion: version,
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
    } catch (error) {
      try {
        await store.deleteObject(path)
      } catch {
        // The persistence failure remains authoritative when provisional cleanup fails.
      }
      throw error
    }

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

function activeAvatarWhere(
  artistaId: number,
  expectedActive: ExpectedActiveAvatar | null | undefined
) {
  const conditions = [
    eq(artist.artistImage.artistaId, artistaId),
    eq(artist.artistImage.tipo, 'avatar'),
    isNull(artist.artistImage.deletedAt)
  ]

  if (!expectedActive) return and(...conditions)

  const versionCondition =
    expectedActive.version === null
      ? isNull(artist.artistImage.artistAvatarVersion)
      : eq(artist.artistImage.artistAvatarVersion, expectedActive.version)

  return and(
    ...conditions,
    eq(artist.artistImage.id, expectedActive.id),
    eq(artist.artistImage.imagenUrl, expectedActive.path),
    versionCondition
  )
}
