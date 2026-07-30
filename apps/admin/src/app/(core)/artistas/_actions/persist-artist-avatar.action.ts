'use server'

import 'server-only'

import { updateTag } from 'next/cache'
import { and, eq, isNull, sql } from 'drizzle-orm'
import { z } from 'zod'

import { db } from '@frijolmagico/database/orm'
import { artist } from '@frijolmagico/database/schema'
import { ARTIST_CACHE_TAG } from '@frijolmagico/cache-tags'
import {
  INVALID_RECEIPT,
  verifyArtistAvatarUploadReceipt
} from '../catalogo/_lib/artist-avatar-upload-receipt'
import {
  AVATAR_CONFLICT,
  type ExpectedActiveAvatar
} from '../catalogo/_lib/avatar-history-contracts'
import type { UploadArtistAvatarData } from './upload-artist-avatar.action'
import { requireAuth } from '@/shared/lib/auth/utils'
import type { ActionState } from '@/shared/types/actions'

const schema = z.object({ receipt: z.string().min(1) })

function receiptSecret(): string {
  const secret = process.env.ASSET_RECEIPT_SECRET
  if (!secret) throw new Error(INVALID_RECEIPT)
  return secret
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
  return and(
    ...conditions,
    eq(artist.artistImage.id, expectedActive.id),
    eq(artist.artistImage.imagenUrl, expectedActive.path),
    expectedActive.version === null
      ? isNull(artist.artistImage.artistAvatarVersion)
      : eq(artist.artistImage.artistAvatarVersion, expectedActive.version)
  )
}

async function findCommitted(
  artistaId: number,
  path: string,
  version: string
): Promise<UploadArtistAvatarData | null> {
  const [existing] = await db
    .select({
      id: artist.artistImage.id,
      artistaId: artist.artistImage.artistaId,
      path: artist.artistImage.imagenUrl,
      version: artist.artistImage.artistAvatarVersion
    })
    .from(artist.artistImage)
    .where(
      and(
        eq(artist.artistImage.artistaId, artistaId),
        eq(artist.artistImage.imagenUrl, path),
        eq(artist.artistImage.artistAvatarVersion, version),
        eq(artist.artistImage.tipo, 'avatar')
      )
    )
    .limit(1)
  return existing ? { ...existing, oldAsset: null } : null
}

export async function persistArtistAvatarAction(
  input: unknown
): Promise<ActionState<UploadArtistAvatarData>> {
  try {
    const session = await requireAuth()
    const parsed = schema.safeParse(input)
    if (!parsed.success) throw new Error(INVALID_RECEIPT)
    const claims = verifyArtistAvatarUploadReceipt(parsed.data.receipt, {
      secret: receiptSecret(),
      subjectId: session.user.id
    })
    const committed = await findCommitted(
      claims.artistaId,
      claims.path,
      claims.version
    )
    if (committed) return { success: true, data: committed }

    let avatar: UploadArtistAvatarData
    try {
      avatar = await db.transaction(async (tx) => {
        if (claims.expectedActive === null) {
          const [current] = await tx
            .select({ id: artist.artistImage.id })
            .from(artist.artistImage)
            .where(activeAvatarWhere(claims.artistaId, undefined))
            .limit(1)
          if (current) throw new Error(AVATAR_CONFLICT)
        }
        const [old] = await tx
          .update(artist.artistImage)
          .set({ deletedAt: sql`CURRENT_TIMESTAMP` })
          .where(activeAvatarWhere(claims.artistaId, claims.expectedActive))
          .returning({
            path: artist.artistImage.imagenUrl,
            version: artist.artistImage.artistAvatarVersion
          })
        if (claims.expectedActive && !old) throw new Error(AVATAR_CONFLICT)
        const [inserted] = await tx
          .insert(artist.artistImage)
          .values({
            artistaId: claims.artistaId,
            imagenUrl: claims.path,
            artistAvatarVersion: claims.version,
            tipo: 'avatar',
            orden: 1
          })
          .returning({
            id: artist.artistImage.id,
            artistaId: artist.artistImage.artistaId,
            path: artist.artistImage.imagenUrl,
            version: artist.artistImage.artistAvatarVersion
          })
        if (!inserted)
          throw new Error('No se pudo persistir el avatar del artista')
        if (claims.requestedActive && claims.catalogId) {
          await tx
            .update(artist.catalogArtist)
            .set({ activo: true })
            .where(
              and(
                eq(artist.catalogArtist.id, claims.catalogId),
                eq(artist.catalogArtist.artistaId, claims.artistaId)
              )
            )
        }
        return { ...inserted, oldAsset: old ?? null }
      })
    } catch (error) {
      const recovered = await findCommitted(
        claims.artistaId,
        claims.path,
        claims.version
      )
      if (!recovered) throw error
      avatar = recovered
    }
    try {
      updateTag(ARTIST_CACHE_TAG)
    } catch {}
    return { success: true, data: avatar }
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Error desconocido'
    return {
      success: false,
      errors: [
        {
          entityType:
            message === AVATAR_CONFLICT
              ? AVATAR_CONFLICT
              : message === INVALID_RECEIPT
                ? INVALID_RECEIPT
                : 'artist-avatar',
          message
        }
      ]
    }
  }
}
