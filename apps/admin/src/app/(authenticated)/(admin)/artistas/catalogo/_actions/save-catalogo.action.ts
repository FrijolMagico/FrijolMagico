'use server'

import { updateTag } from 'next/cache'
import { CATALOG_CACHE_TAG } from '../_constants'
import { ARTISTA_CACHE_TAG } from '../../_constants'
import { eq } from 'drizzle-orm'
import { db } from '@frijolmagico/database/orm'
import { artist } from '@frijolmagico/database/schema'
import { requireAuth } from '@/lib/auth/utils'
import {
  PUSH_OPERATION_TYPE,
  type PushOperation,
  type PushResult,
  type IdMapping
} from '@/shared/push/lib/types'
import {
  handleServerActionError,
  logServerError
} from '@/shared/push/lib/error-handler'
import { createIdMapping, isTempId } from '@/shared/push/lib/id-mapper'
import { validateOperationData } from '@/shared/push/lib/validators'
import {
  catalogoArtistaSchema,
  type CatalogoArtistaInput
} from '../_schemas/catalogo.schema'
import { stripUndefined } from '@/shared/lib/utils'

/**
 * Save catalogo section changes to database
 *
 * Receives PushOperation[] and persists them to DB.
 * Handles catalogo_artista table operations.
 * Validates data via Zod schemas internally.
 */
export async function saveCatalogoAction(
  operations: PushOperation[]
): Promise<PushResult> {
  try {
    await requireAuth()

    if (operations.length === 0) {
      return { success: true, idMappings: [] }
    }

    const mappings: IdMapping[] = []

    await db.transaction(async (tx) => {
      for (const op of operations) {
        if (op.type === PUSH_OPERATION_TYPE.RESTORE) {
          continue
        } else if (op.type === PUSH_OPERATION_TYPE.DELETE) {
          if (!isTempId(op.entityId)) {
            await tx
              .delete(artist.catalogoArtista)
              .where(
                eq(artist.catalogoArtista.id, Number.parseInt(op.entityId, 10))
              )
          }
        } else {
          const validated = validateOperationData(
            op.data,
            catalogoArtistaSchema,
            op.type === PUSH_OPERATION_TYPE.UPDATE
          )
          if (!validated.valid || !validated.data) {
            throw new Error(
              validated.errors?.[0]?.message ?? 'Validation failed'
            )
          }
          const input = validated.data

          if (isTempId(op.entityId)) {
            const [inserted] = await tx
              .insert(artist.catalogoArtista)
              .values(input as CatalogoArtistaInput)
              .returning({ id: artist.catalogoArtista.id })

            if (inserted) {
              mappings.push(
                createIdMapping(op.entityId, inserted.id, 'catalogo_artista')
              )
            }
          } else {
            await tx
              .update(artist.catalogoArtista)
              .set(stripUndefined(input))
              .where(
                eq(artist.catalogoArtista.id, Number.parseInt(op.entityId, 10))
              )
          }
        }
      }
    })

    updateTag(CATALOG_CACHE_TAG)
    updateTag(ARTISTA_CACHE_TAG)

    return {
      success: true,
      idMappings: mappings
    }
  } catch (error) {
    logServerError(error, 'saveCatalogoAction')
    const handled = handleServerActionError(error)
    return {
      success: false,
      errors: [
        {
          entityType: 'catalogo_artista',
          entityId: 'unknown',
          message: handled.userMessage
        }
      ]
    }
  }
}
