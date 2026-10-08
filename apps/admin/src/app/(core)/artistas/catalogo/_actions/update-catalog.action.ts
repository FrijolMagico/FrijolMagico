'use server'

import 'server-only'

import { updateTag } from 'next/cache'
import { and, eq, isNotNull, isNull, sql } from 'drizzle-orm'

import { db } from '@frijolmagico/database/orm'
import { artist } from '@frijolmagico/database/schema'
import {
  ARTIST_DETAIL_CACHE_TAG,
  CANONICAL_CATALOG_SLUGS_CACHE_TAG,
  CATALOG_BASE_CACHE_TAG,
  CATALOG_CACHE_TAG,
  CATALOG_PARTICIPATION_CACHE_TAG,
  FEATURED_ARTISTS_CACHE_TAG,
  FESTIVAL_CRITICAL_CACHE_TAG
} from '@frijolmagico/cache-tags'
import { getAvatarUrl } from '@frijolmagico/utils/cdn'
import { requireAuth } from '@/shared/lib/auth/utils'
import {
  revalidateWebCacheBatch,
  type RevalidateWebCacheOptions
} from '@/shared/lib/web-invalidation'
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
import { allocateCatalogSlug } from '../_lib/catalog-slug'

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
    pseudonimoId,
    descripcion,
    activo,
    destacado,
    expectedActive,
    intent: requestedIntent,
    avatarId
  } = parsed.data
  const intent = requestedIntent ?? AVATAR_INTENT.UNCHANGED
  if (!artistaId) return conflict()

  let activeStateChanged = false
  let festivalDetailChanged = false
  let catalogSlugChanged = false
  let featuredSelectionChanged = false
  let canonicalCatalogSlugChanged = false
  let publicFeaturedStateChanged = false
  try {
    const result = await db.transaction(async (tx) => {
      const [ownedPseudonym] = await tx
        .select({ id: artist.artistPseudonym.id, pseudonimo: artist.artistPseudonym.pseudonimo })
        .from(artist.artistPseudonym)
        .where(
          and(
            eq(artist.artistPseudonym.id, pseudonimoId),
            eq(artist.artistPseudonym.artistaId, artistaId),
            isNull(artist.artistPseudonym.deletedAt)
          )
        )
        .limit(1)
      if (!ownedPseudonym) return null

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

      const [currentCatalog] = await tx
        .select({
          pseudonimoId: artist.catalogArtist.pseudonimoId,
          activo: artist.catalogArtist.activo,
          destacado: artist.catalogArtist.destacado,
          deletedAt: artist.catalogArtist.deletedAt
        })
        .from(artist.catalogArtist)
        .where(eq(artist.catalogArtist.id, id))
        .limit(1)
      if (currentCatalog && currentCatalog.deletedAt === null) {
        activeStateChanged = activo !== undefined && currentCatalog.activo !== activo
        festivalDetailChanged = activeStateChanged
        if (destacado !== undefined) {
          const eligibleAfter = activo ?? currentCatalog.activo
          publicFeaturedStateChanged =
            (currentCatalog.activo && currentCatalog.destacado) !==
            (eligibleAfter && destacado)
        }
      }
      if (
        intent === AVATAR_INTENT.HISTORICAL &&
        currentCatalog &&
        currentCatalog.deletedAt === null &&
        (activo ?? currentCatalog.activo)
      ) {
        festivalDetailChanged = true
        if (destacado ?? currentCatalog.destacado) {
          featuredSelectionChanged = true
        }
      }
      if (currentCatalog && currentCatalog.pseudonimoId !== pseudonimoId) {
        catalogSlugChanged = await allocateCatalogSlug(
          tx,
          artistaId,
          ownedPseudonym.pseudonimo
        )
        const eligibleCatalogRow =
          currentCatalog.deletedAt === null &&
          (activo ?? currentCatalog.activo)
        festivalDetailChanged ||= catalogSlugChanged && eligibleCatalogRow
        featuredSelectionChanged = catalogSlugChanged && eligibleCatalogRow
        canonicalCatalogSlugChanged =
          catalogSlugChanged &&
          currentCatalog.deletedAt === null &&
          (activo ?? currentCatalog.activo)
      }

      await tx
        .update(artist.catalogArtist)
        .set({ descripcion, activo, destacado, pseudonimoId })
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

  if (intent === AVATAR_INTENT.HISTORICAL) {
    try {
      updateTag(ARTIST_DETAIL_CACHE_TAG)
    } catch {
      // The restore committed; cache invalidation is best-effort.
    }
  }
  const invalidationRequests: RevalidateWebCacheOptions[] = []
  if (festivalDetailChanged) {
    invalidationRequests.push({
      tag: FESTIVAL_CRITICAL_CACHE_TAG,
      mode: 'immediate'
    })
  }
  const catalogTags = [CATALOG_BASE_CACHE_TAG, CATALOG_CACHE_TAG]
  if (activeStateChanged) catalogTags.push(CATALOG_PARTICIPATION_CACHE_TAG)
  for (const tag of catalogTags) {
    try {
      updateTag(tag)
    } catch {
      // DB mutation already committed; cache invalidation is best-effort.
    }
    invalidationRequests.push({ tag })
  }
  if (activeStateChanged || canonicalCatalogSlugChanged) {
    invalidationRequests.push({
      tag: CANONICAL_CATALOG_SLUGS_CACHE_TAG,
      mode: 'immediate'
    })
  }
  if (destacado !== undefined) {
    if (
      publicFeaturedStateChanged ||
      activeStateChanged ||
      featuredSelectionChanged
    ) {
      invalidationRequests.push({ tag: FEATURED_ARTISTS_CACHE_TAG })
    }
  } else if (activeStateChanged || featuredSelectionChanged) {
    invalidationRequests.push({
      tag: FEATURED_ARTISTS_CACHE_TAG,
      mode: 'swr'
    })
  }
  const { webRevalidation } = await revalidateWebCacheBatch(invalidationRequests)
  return {
    success: true,
    ...(webRevalidation ? { webRevalidation } : {})
  }
}
