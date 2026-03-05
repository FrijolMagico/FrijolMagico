'use server'

import { updateTag } from 'next/cache'
import { ARTISTA_CACHE_TAG } from '../_constants'
import { db } from '@frijolmagico/database/orm'
import { artist } from '@frijolmagico/database/schema'
import { eq } from 'drizzle-orm'
import { requireAuth } from '@/lib/auth/utils'
import { createIdMapping, isTempId } from '@/shared/push/lib/id-mapper'
import type {
  PushOperation,
  PushResult,
  IdMapping
} from '@/shared/push/lib/types'
import { PUSH_OPERATION_TYPE } from '@/shared/push/lib/types'
import type {
  ArtistaInsertInput,
  ArtistaUpdateInput,
  ArtistaImagenInsertInput,
  ArtistaImagenUpdateInput,
  ArtistaInput,
  ArtistaImagenInput
} from '../_schemas/artista.schema'
import {
  artistaInsertSchema,
  artistaUpdateSchema,
  artistaImagenInsertSchema,
  artistaImagenUpdateSchema
} from '../_schemas/artista.schema'
import { validateOperationData } from '@/shared/push/lib/validators'
import { stripUndefined } from '@/shared/lib/utils'
import {
  handleServerActionError,
  logServerError
} from '@/shared/push/lib/error-handler'

const artistTable = artist.artist
const artistImageTable = artist.artistImage

/**
 * Save artista section changes to database
 *
 * Receives PushOperation[] and persists them to DB.
 * Handles both artista and artistaImagen tables in a single transaction.
 * Validates data via Zod schemas internally.
 */
export async function saveArtistaAction(
  operations: PushOperation[]
): Promise<PushResult> {
  try {
    await requireAuth()

    if (operations.length === 0) {
      return { success: true, idMappings: [] }
    }

    if (operations.length > 50) {
      return {
        success: false,
        errors: [
          {
            entityType: 'artista',
            entityId: 'batch',
            message: `Too many operations to process at once (${operations.length}). Maximum is 50.`
          }
        ]
      }
    }

    const artistaOps: PushOperation[] = []
    const artistaImagenOps: PushOperation[] = []

    for (const op of operations) {
      if (op.entityType === 'artista') {
        artistaOps.push(op)
      } else if (op.entityType === 'artistaImagen') {
        artistaImagenOps.push(op)
      }
    }

    const mappings: IdMapping[] = []

    await db.transaction(async (tx) => {
      for (const op of artistaOps) {
        if (op.type === PUSH_OPERATION_TYPE.RESTORE) {
          continue
        } else if (op.type === PUSH_OPERATION_TYPE.DELETE) {
          if (!isTempId(op.entityId)) {
            await tx
              .delete(artistTable)
              .where(eq(artistTable.id, Number(op.entityId)))
          }
        } else {
          const isUpdate = op.type === PUSH_OPERATION_TYPE.UPDATE
          const schema = isUpdate ? artistaUpdateSchema : artistaInsertSchema
          const validated = validateOperationData(
            op.data,
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            schema as any,
            isUpdate
          )
          if (!validated.valid || !validated.data) {
            throw new Error(
              validated.errors?.[0]?.message ?? 'Validation failed'
            )
          }
          const input = validated.data as Record<string, unknown>

          if (isTempId(op.entityId)) {
            const [result] = await tx
              .insert(artistTable)
              .values({
                ...input,
                id: undefined
              } as ArtistaInput)
              .returning()

            mappings.push(createIdMapping(op.entityId, result.id, 'artista'))
          } else {
            await tx
              .update(artistTable)
              .set(stripUndefined(input))
              .where(eq(artistTable.id, Number(op.entityId)))
          }
        }
      }

      for (const op of artistaImagenOps) {
        if (op.type === PUSH_OPERATION_TYPE.RESTORE) {
          continue
        } else if (op.type === PUSH_OPERATION_TYPE.DELETE) {
          if (!isTempId(op.entityId)) {
            await tx
              .delete(artistImageTable)
              .where(eq(artistImageTable.id, Number(op.entityId)))
          }
        } else {
          const isImagenUpdate = op.type === PUSH_OPERATION_TYPE.UPDATE
          const imagenSchema = isImagenUpdate
            ? artistaImagenUpdateSchema
            : artistaImagenInsertSchema
          const validated = validateOperationData<ArtistaImagenInput>(
            op.data,
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            imagenSchema as any,
            isImagenUpdate
          )
          if (!validated.valid || !validated.data) {
            throw new Error(
              validated.errors?.[0]?.message ?? 'Validation failed'
            )
          }
          const input = validated.data

          let resolvedArtistaId = input.artistaId
          const artistaIdStr = String(input.artistaId)
          if (isTempId(artistaIdStr)) {
            const mapping = mappings.find((m) => m.tempId === artistaIdStr)
            if (mapping) {
              resolvedArtistaId = mapping.realId
            } else {
              throw new Error(
                `Cannot resolve temp artistaId: ${input.artistaId}`
              )
            }
          }

          if (isTempId(op.entityId)) {
            const [result] = await tx
              .insert(artistImageTable)
              .values({
                ...input,
                artistaId: resolvedArtistaId,
                id: undefined
              } as ArtistaImagenInput)
              .returning()

            mappings.push(createIdMapping(op.entityId, result.id, 'artista'))
          } else {
            await tx
              .update(artistImageTable)
              .set(
                stripUndefined({
                  ...input,
                  artistaId: resolvedArtistaId
                })
              )
              .where(eq(artistImageTable.id, Number(op.entityId)))
          }
        }
      }
    })

    updateTag(ARTISTA_CACHE_TAG)

    return {
      success: true,
      idMappings: mappings
    }
  } catch (error) {
    logServerError(error, 'saveArtistaAction')
    const handled = handleServerActionError(error)
    return {
      success: false,
      errors: [
        {
          entityType: 'artista',
          entityId: 'unknown',
          message: handled.userMessage
        }
      ]
    }
  }
}
