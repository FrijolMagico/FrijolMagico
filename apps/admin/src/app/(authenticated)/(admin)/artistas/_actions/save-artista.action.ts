'use server'

import { updateTag } from 'next/cache'
import { ARTISTA_CACHE_TAG, ARTISTA_HISTORIAL_CACHE_TAG } from '../_constants'
import { db } from '@frijolmagico/database/orm'
import { artist } from '@frijolmagico/database/schema'
import { and, eq, sql } from 'drizzle-orm'
import { isNotDeleted } from '@frijolmagico/database/filters'
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
const artistHistoryTable = artist.artistHistory

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
              .update(artistTable)
              .set({ deletedAt: sql`CURRENT_TIMESTAMP` })
              .where(
                and(
                  eq(artistTable.id, Number(op.entityId)),
                  isNotDeleted(artistTable.deletedAt)
                )
              )
          }
        } else {
          const isUpdate = op.type === PUSH_OPERATION_TYPE.UPDATE
          const schema = isUpdate ? artistaUpdateSchema : artistaInsertSchema
          const { _historialData, ...operationData } = op.data
          const validated = validateOperationData(
            operationData,
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

            if (
              _historialData &&
              typeof _historialData === 'object' &&
              Object.keys(_historialData as object).length > 0
            ) {
              const historialPayload = _historialData as Record<string, unknown>
              const [maxResult] = await tx
                .select({
                  maxOrden: sql<number>`COALESCE(MAX(${artistHistoryTable.orden}), 0)`
                })
                .from(artistHistoryTable)
                .where(eq(artistHistoryTable.artistaId, Number(op.entityId)))

              await tx.insert(artistHistoryTable).values({
                artistaId: Number(op.entityId),
                orden: (maxResult?.maxOrden ?? 0) + 1,
                pseudonimo:
                  (historialPayload.pseudonimo as string | undefined) ?? null,
                correo: (historialPayload.correo as string | undefined) ?? null,
                rrss:
                  historialPayload.rrss == null
                    ? null
                    : typeof historialPayload.rrss === 'string'
                      ? historialPayload.rrss
                      : JSON.stringify(historialPayload.rrss),
                ciudad: (historialPayload.ciudad as string | undefined) ?? null,
                pais: (historialPayload.pais as string | undefined) ?? null,
                notas: null
              })
            }
          }
        }
      }

      for (const op of artistaImagenOps) {
        if (op.type === PUSH_OPERATION_TYPE.RESTORE) {
          continue
        } else if (op.type === PUSH_OPERATION_TYPE.DELETE) {
          if (!isTempId(op.entityId)) {
            await tx
              .update(artistImageTable)
              .set({ deletedAt: sql`CURRENT_TIMESTAMP` })
              .where(
                and(
                  eq(artistImageTable.id, Number(op.entityId)),
                  isNotDeleted(artistImageTable.deletedAt)
                )
              )
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
    updateTag(ARTISTA_HISTORIAL_CACHE_TAG)

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
