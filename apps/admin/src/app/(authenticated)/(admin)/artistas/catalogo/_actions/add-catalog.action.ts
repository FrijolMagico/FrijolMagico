'use server'

import 'server-only'
import { updateTag } from 'next/cache'
import { db } from '@frijolmagico/database/orm'
import { artist } from '@frijolmagico/database/schema'
import { requireAuth } from '@/lib/auth/utils'
import type { ActionState } from '@/shared/types/actions'
import { CATALOG_CACHE_TAG } from '../_constants'
import {
  CatalogAddFormInput,
  catalogInsertSchema,
  CatalogoInsertInput
} from '../_schemas/catalogo.schema'
import { generateKeyBetween } from 'fractional-indexing'
import { max } from 'drizzle-orm'

export async function addCatalogAction(
  _prevState: ActionState<{ id: number }>,
  data: CatalogAddFormInput
): Promise<ActionState<{ id: number }>> {
  try {
    await requireAuth()

    const lastOrder = await db
      .select({ maxOrden: max(artist.catalogArtist.orden) })
      .from(artist.catalogArtist)
      .then((res) => res[0]?.maxOrden ?? null)

    const newOrden = generateKeyBetween(lastOrder, null)

    const newCatalog: CatalogoInsertInput = {
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

    await db.insert(artist.catalogArtist).values(parsed.data)

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
