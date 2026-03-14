'use server'

import 'server-only'
import { updateTag } from 'next/cache'
import { db } from '@frijolmagico/database/orm'
import { artist } from '@frijolmagico/database/schema'
import { eq } from 'drizzle-orm'
import { requireAuth } from '@/lib/auth/utils'
import {
  catalogFieldUpdateSchema,
  type CatalogFieldUpdateInput
} from '../_schemas/catalogo.schema'
import type { ActionState } from '@/shared/types/actions'
import { CATALOG_CACHE_TAG } from '../_constants'

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

  await db
    .update(artist.catalogArtist)
    .set(parsed.data)
    .where(eq(artist.catalogArtist.id, id))

  updateTag(CATALOG_CACHE_TAG)

  return { success: true }
}
