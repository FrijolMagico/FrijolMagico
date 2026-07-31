'use server'

import 'server-only'
import { updateTag } from 'next/cache'
import { max } from 'drizzle-orm'
import { generateKeyBetween } from 'fractional-indexing'
import { db } from '@frijolmagico/database/orm'
import { artist } from '@frijolmagico/database/schema'
import {
  CATALOG_CACHE_TAG,
  FEATURED_ARTISTS_CACHE_TAG
} from '@frijolmagico/cache-tags'
import { requireAuth } from '@/shared/lib/auth/utils'
import type { ActionState } from '@/shared/types/actions'
import {
  type CatalogCreateFormInput,
  catalogInsertSchema,
  type CatalogInsertInput
} from '../_schemas/catalog.schema'
import { revalidateWebCacheBestEffort } from '@/shared/lib/web-invalidation'

interface CreatedCatalog {
  catalogId: number
  artistId: number
  requestedActive: boolean
}

interface CreatedCatalogRow {
  id: number
  artistaId: number
}

function isCreatedCatalogRow(value: unknown): value is CreatedCatalogRow {
  return (
    typeof value === 'object' &&
    value !== null &&
    'id' in value &&
    typeof value.id === 'number' &&
    'artistaId' in value &&
    typeof value.artistaId === 'number'
  )
}

export async function createCatalogAction(
  _prevState: ActionState<CreatedCatalog>,
  data: CatalogCreateFormInput
): Promise<ActionState<CreatedCatalog>> {
  try {
    await requireAuth()

    const lastOrder = await db
      .select({ maxOrden: max(artist.catalogArtist.orden) })
      .from(artist.catalogArtist)
      .then((res) => res[0]?.maxOrden ?? null)

    const newOrden = generateKeyBetween(lastOrder, null)

    const newCatalog: CatalogInsertInput = {
      ...data,
      orden: newOrden
    }

    const parsed = catalogInsertSchema.safeParse(newCatalog)

    if (!parsed.success) {
      return {
        success: false,
        errors: parsed.error.issues.map((issue) => ({
          entityType: 'catalogo',
          message: issue.message
        }))
      }
    }

    const { artistaId, ...catalog } = parsed.data

    const [createdCatalog] = await db
      .insert(artist.catalogArtist)
      .values({ ...catalog, artistaId, activo: false })
      .returning({
        id: artist.catalogArtist.id,
        artistaId: artist.catalogArtist.artistaId
      })

    if (!isCreatedCatalogRow(createdCatalog)) {
      return {
        success: false,
        errors: [
          {
            entityType: 'catalogo',
            message: 'No se pudo confirmar la creación del catálogo'
          }
        ]
      }
    }

    // NOTE: Soft-deleted catalog rows still rely on the current unique `artistaId`
    // constraint. This change does not introduce restore-or-reinsert semantics.

    try {
      updateTag(CATALOG_CACHE_TAG)
    } catch (error) {
      console.error('Catalog cache invalidation failed', error)
    }
    void revalidateWebCacheBestEffort({
      tag: CATALOG_CACHE_TAG,
      path: '/catalogo'
    })

    if ('destacado' in parsed.data && parsed.data.destacado) {
      void revalidateWebCacheBestEffort({
        tag: FEATURED_ARTISTS_CACHE_TAG,
        path: '/'
      })
    }

    return {
      success: true,
      data: {
        catalogId: createdCatalog.id,
        artistId: createdCatalog.artistaId,
        requestedActive: parsed.data.activo ?? false
      }
    }
  } catch (error) {
    return {
      success: false,
      errors: [
        {
          entityType: 'catalogo',
          message:
            error instanceof Error
              ? error.message
              : 'Error desconocido al agregar al catálogo'
        }
      ]
    }
  }
}
