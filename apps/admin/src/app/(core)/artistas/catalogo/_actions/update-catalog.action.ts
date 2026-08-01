'use server'

import 'server-only'

import { updateTag } from 'next/cache'
import { and, eq, isNotNull, isNull, sql } from 'drizzle-orm'

import { db } from '@frijolmagico/database/orm'
import { artist } from '@frijolmagico/database/schema'
import {
  CATALOG_CACHE_TAG,
  FEATURED_ARTISTS_CACHE_TAG
} from '@frijolmagico/cache-tags'
import { getAvatarUrl } from '@frijolmagico/utils/cdn'
import { requireAuth } from '@/shared/lib/auth/utils'
import { revalidateWebCache } from '@/shared/lib/web-invalidation'
import type { ActionState } from '@/shared/types/actions'
import {
  AVATAR_CONFLICT,
  AVATAR_INTENT,
  isExpectedActiveAvatar,
  isOwnedDeletedAvatar,
  type ActiveAvatar
} from '../_lib/avatar-history-contracts'
import {
  type CatalogUpdateInput,
  catalogUpdateSchema
} from '../_schemas/catalog.schema'

function conflict(): ActionState {
  return {
    success: false,
    errors: [{ entityType: AVATAR_CONFLICT, message: AVATAR_CONFLICT }]
  }
}

const ACTIVO_REQUIRES_AVATAR = Symbol('activo-requires-avatar')

function activoRequiresAvatar(): ActionState {
  return {
    success: false,
    errors: [
      {
        entityType: 'catalogo',
        message:
          'No se puede activar una entrada sin avatar. Debe subir un avatar antes de activar la entrada.'
      }
    ]
  }
}

export async function updateCatalogAction(
  _prevState: ActionState,
  data: CatalogUpdateInput
): Promise<ActionState> {
  await requireAuth()
  const parsed = catalogUpdateSchema.safeParse(data)
  if (!parsed.success) {
    return {
      success: false,
      errors: parsed.error.issues.map((issue) => ({
        entityType: 'catalogo',
        message: issue.message
      }))
    }
  }

  const {
    id,
    artistaId,
    descripcion,
    activo,
    destacado,
    expectedActive,
    intent: requestedIntent,
    avatarId
  } = parsed.data
  const intent = requestedIntent ?? AVATAR_INTENT.UNCHANGED
  if (!artistaId) return conflict()

  try {
    const result = await db.transaction(async (tx) => {
      const [current] = await tx
        .select({
          id: artist.artistImage.id,
          path: artist.artistImage.imagenUrl,
          version: artist.artistImage.artistAvatarVersion
        })
        .from(artist.artistImage)
        .where(
          and(
            eq(artist.artistImage.artistaId, artistaId),
            eq(artist.artistImage.tipo, 'avatar'),
            isNull(artist.artistImage.deletedAt)
          )
        )
        .limit(1)

      // Full-path comparison: the client snapshot carries the public CDN URL
      // (built server-side by getCatalogData); rebuild the same full path
      // from the stored raw key so the guard is a faithful equality.
      const currentAvatar: ActiveAvatar | null = current
        ? {
            id: current.id,
            path: getAvatarUrl(current.path),
            version: current.version
          }
        : null
      // Business rule (mirrors updateCatalogFieldAction): a catalog entry
      // cannot be activated without an active avatar. The row toggle enforces
      // this client-side; the dialog save must enforce it server-side too.
      if (activo === true && currentAvatar === null) {
        return ACTIVO_REQUIRES_AVATAR
      }
      if (
        expectedActive !== undefined &&
        !isExpectedActiveAvatar(expectedActive, currentAvatar)
      ) {
        return null
      }

      if (intent === AVATAR_INTENT.HISTORICAL) {
        if (!avatarId) return null
        const [historical] = await tx
          .select({
            id: artist.artistImage.id,
            artistaId: artist.artistImage.artistaId,
            deletedAt: artist.artistImage.deletedAt
          })
          .from(artist.artistImage)
          .where(
            and(
              eq(artist.artistImage.id, avatarId),
              eq(artist.artistImage.tipo, 'avatar'),
              isNotNull(artist.artistImage.deletedAt)
            )
          )
          .limit(1)
        if (!historical || !isOwnedDeletedAvatar(historical, artistaId))
          return null
      }

      await tx
        .update(artist.catalogArtist)
        .set({ descripcion, activo, destacado })
        .where(eq(artist.catalogArtist.id, id))

      if (intent === AVATAR_INTENT.HISTORICAL && avatarId) {
        if (currentAvatar) {
          await tx
            .update(artist.artistImage)
            .set({ deletedAt: sql`CURRENT_TIMESTAMP` })
            .where(eq(artist.artistImage.id, currentAvatar.id))
        }
        await tx
          .update(artist.artistImage)
          .set({ deletedAt: null })
          .where(eq(artist.artistImage.id, avatarId))
      }
      return true
    })
    if (result === ACTIVO_REQUIRES_AVATAR) return activoRequiresAvatar()
    if (!result) return conflict()
  } catch {
    return conflict()
  }

  try {
    updateTag(CATALOG_CACHE_TAG)
  } catch {
    // DB mutation already committed; cache invalidation is best-effort.
  }
  void revalidateWebCache({ tag: CATALOG_CACHE_TAG, path: '/catalogo' })
  if (destacado !== undefined) {
    void revalidateWebCache({ tag: FEATURED_ARTISTS_CACHE_TAG, path: '/' })
  }
  return { success: true }
}
