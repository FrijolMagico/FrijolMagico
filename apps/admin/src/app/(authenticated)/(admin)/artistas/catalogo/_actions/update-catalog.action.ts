'use server'

import 'server-only'
import { updateTag } from 'next/cache'
import { db } from '@frijolmagico/database/orm'
import { artist } from '@frijolmagico/database/schema'
import { eq, max } from 'drizzle-orm'
import { requireAuth } from '@/lib/auth/utils'
import type { ActionState } from '@/shared/types/actions'
import {
  type CatalogoUpdateInput,
  catalogUpdateSchema
} from '../_schemas/catalogo.schema'
import { CATALOG_CACHE_TAG } from '../_constants'
import {
  ArtistImagenInsertInput,
  artistImagenInsertSchema
} from '../../_schemas/image.schema'

export async function updateCatalogAction(
  _prevState: ActionState,
  data: CatalogoUpdateInput
): Promise<ActionState> {
  await requireAuth()

  if (!data.id) {
    return {
      success: false,
      errors: [
        {
          entityType: 'catalogo',
          message: 'El ID del catálogo es obligatorio'
        }
      ]
    }
  }

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

  const { id, descripcion, activo, destacado, avatarUrl, artistaId } =
    parsed.data

  if (avatarUrl && artistaId) {
    const orden = await db
      .select({ maxOrder: max(artist.artistImage.orden) })
      .from(artist.artistImage)
      .where(eq(artist.artistImage.artistaId, artistaId))
      .then((res) => (res[0]?.maxOrder ? res[0].maxOrder + 1 : 1))

    const imagePayload: ArtistImagenInsertInput = {
      tipo: 'avatar',
      imagenUrl: avatarUrl,
      artistaId,
      orden,
      metadata: null
    }

    const parsedImagePayload = artistImagenInsertSchema.safeParse(imagePayload)

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

  await db
    .update(artist.catalogArtist)
    .set({ descripcion, activo, destacado })
    .where(eq(artist.catalogArtist.id, id))

  updateTag(CATALOG_CACHE_TAG)

  return { success: true }
}
