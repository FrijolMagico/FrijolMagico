'use server'

import 'server-only'
import { updateTag } from 'next/cache'
import { db } from '@frijolmagico/database/orm'
import { artist } from '@frijolmagico/database/schema'
import { and, eq, isNull } from 'drizzle-orm'
import {
  CANONICAL_CATALOG_SLUGS_CACHE_TAG,
  CATALOG_BASE_CACHE_TAG,
  CATALOG_CACHE_TAG,
  CATALOG_PARTICIPATION_CACHE_TAG,
  FEATURED_ARTISTS_CACHE_TAG,
  FESTIVAL_CRITICAL_CACHE_TAG
} from '@frijolmagico/cache-tags'
import { requireAuth } from '@/shared/lib/auth/utils'
import { revalidateWebCacheBatch } from '@/shared/lib/web-invalidation'
import type { RevalidateWebCacheOptions } from '@/shared/lib/web-invalidation'
import {
  catalogFieldUpdateSchema,
  type CatalogFieldUpdateInput
} from '../_schemas/catalog.schema'
import type { ActionState } from '@/shared/types/actions'

export async function updateCatalogFieldAction(
  id: number,
  data: CatalogFieldUpdateInput
): Promise<ActionState> {
  await requireAuth()

  const parsed = catalogFieldUpdateSchema.safeParse(data)

  if (!parsed.success) {
    return {
      success: false,
      errors: parsed.error.issues.map((issue) => ({
        entityType: 'catalogo',
        message: issue.message
      }))
    }
  }

  const existingCatalogRow = 'activo' in parsed.data || 'destacado' in parsed.data
    ? (
        await db
          .select({
            artistaId: artist.catalogArtist.artistaId,
            activo: artist.catalogArtist.activo,
            destacado: artist.catalogArtist.destacado,
            deletedAt: artist.catalogArtist.deletedAt
          })
          .from(artist.catalogArtist)
          .where(eq(artist.catalogArtist.id, id))
          .limit(1)
      )[0]
    : undefined

  // Server-side avatar guard: can't activate a catalog entry without an avatar
  if (parsed.data.activo === true && existingCatalogRow) {
    const [avatar] = await db
      .select({ id: artist.artistImage.id })
      .from(artist.artistImage)
      .where(
        and(
          eq(artist.artistImage.artistaId, existingCatalogRow.artistaId),
          eq(artist.artistImage.tipo, 'avatar'),
          isNull(artist.artistImage.deletedAt)
        )
      )
      .limit(1)

    if (!avatar) {
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
  }

  await db
    .update(artist.catalogArtist)
    .set(parsed.data)
    .where(eq(artist.catalogArtist.id, id))

  const catalogTags = [CATALOG_BASE_CACHE_TAG, CATALOG_CACHE_TAG]
  if ('activo' in parsed.data) catalogTags.push(CATALOG_PARTICIPATION_CACHE_TAG)
  const invalidationRequests: RevalidateWebCacheOptions[] = []
  for (const tag of catalogTags) {
    updateTag(tag)
    invalidationRequests.push({ tag })
  }

  const activeStateChanged =
    'activo' in parsed.data &&
    existingCatalogRow !== undefined &&
    existingCatalogRow.deletedAt === null &&
    existingCatalogRow.activo !== parsed.data.activo

  if (activeStateChanged) {
    invalidationRequests.push(
      {
        tag: CANONICAL_CATALOG_SLUGS_CACHE_TAG,
        mode: 'immediate'
      },
      {
        tag: FESTIVAL_CRITICAL_CACHE_TAG,
        mode: 'immediate',
        path: '/festivales/[slug]',
        pathType: 'page'
      }
    )
  }

  if (activeStateChanged && !('destacado' in parsed.data)) {
    invalidationRequests.push({
      tag: FEATURED_ARTISTS_CACHE_TAG,
      mode: 'swr'
    })
  }

  if ('destacado' in parsed.data) {
    const eligibleBefore =
      existingCatalogRow !== undefined &&
      existingCatalogRow.deletedAt === null &&
      existingCatalogRow.activo
    const eligibleAfter =
      existingCatalogRow !== undefined &&
      existingCatalogRow.deletedAt === null &&
      (parsed.data.activo ?? existingCatalogRow.activo)
    const publicFeaturedStateChanged =
      existingCatalogRow !== undefined &&
      (eligibleBefore && existingCatalogRow.destacado) !==
        (eligibleAfter && parsed.data.destacado)

    if (publicFeaturedStateChanged || activeStateChanged) {
      invalidationRequests.push({ tag: FEATURED_ARTISTS_CACHE_TAG })
    }
  }

  const webInvalidation = await revalidateWebCacheBatch(
    invalidationRequests,
    'update-catalog-field'
  )

  return { success: true, ...webInvalidation }
}
