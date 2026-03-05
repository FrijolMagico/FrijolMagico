'use server'

import { updateTag } from 'next/cache'
import { CATALOG_CACHE_TAG } from '../_constants'
import { ARTISTA_CACHE_TAG } from '../../_constants'
import { and, eq } from 'drizzle-orm'
import { db } from '@frijolmagico/database/orm'
import { artist } from '@frijolmagico/database/schema'
import { isNotDeleted } from '@frijolmagico/database/filters'
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
  catalogoArtistaInsertSchema,
  type CatalogoArtistaInsertInput
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
              .update(artist.catalogArtist)
              .set({ deletedAt: new Date().toISOString() })
              .where(
                and(
                  eq(artist.catalogArtist.id, Number.parseInt(op.entityId, 10)),
                  isNotDeleted(artist.catalogArtist.deletedAt)
                )
              )
          }
        } else {
          const validated = validateOperationData(
            op.data,
            catalogoArtistaInsertSchema,
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
              .insert(artist.catalogArtist)
              .values(input as CatalogoArtistaInsertInput)
              .returning({ id: artist.catalogArtist.id })

            if (inserted) {
              mappings.push(
                createIdMapping(op.entityId, inserted.id, 'catalogo_artista')
              )
            }
          } else {
            await tx
              .update(artist.catalogArtist)
              .set(stripUndefined(input))
              .where(
                eq(artist.catalogArtist.id, Number.parseInt(op.entityId, 10))
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
