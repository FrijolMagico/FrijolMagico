'use server'

import 'server-only'
import { updateTag } from 'next/cache'
import { max } from 'drizzle-orm'
import { generateKeyBetween } from 'fractional-indexing'
import { db } from '@frijolmagico/database/orm'
import { artist } from '@frijolmagico/database/schema'
import { requireAuth } from '@/shared/lib/auth/utils'
import type { ActionState } from '@/shared/types/actions'
import { CATALOG_CACHE_TAG } from '../_constants'
import {
  type CatalogCreateFormInput,
  catalogInsertSchema,
  type CatalogInsertInput
} from '../_schemas/catalog.schema'
import {
  ArtistImagenInsertInput,
  artistImagenInsertSchema
} from '../../_schemas/image.schema'

export async function createCatalogAction(
  _prevState: ActionState<{ id: number }>,
  data: CatalogCreateFormInput
): Promise<ActionState<{ id: number }>> {
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

    const { avatarUrl, artistaId, ...catalog } = parsed.data

    if (avatarUrl && artistaId) {
      const imagePayload: ArtistImagenInsertInput = {
        tipo: 'avatar',
        imagenUrl: avatarUrl,
        artistaId
      }

      const parsedImagePayload =
        artistImagenInsertSchema.safeParse(imagePayload)

      if (!parsedImagePayload.success) {
        return {
          success: false,
          errors: parsedImagePayload.error.issues.map((issue) => ({
            entityType: 'catalogo_imagen',
            message: issue.message
          }))
        }
      }

      await db.insert(artist.artistImage).values(parsedImagePayload.data)
    }

    await db.insert(artist.catalogArtist).values({
      ...catalog,
      artistaId
    })

    // NOTE: Soft-deleted catalog rows still rely on the current unique `artistaId`
    // constraint. This change does not introduce restore-or-reinsert semantics.

    updateTag(CATALOG_CACHE_TAG)

    return { success: true }
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
