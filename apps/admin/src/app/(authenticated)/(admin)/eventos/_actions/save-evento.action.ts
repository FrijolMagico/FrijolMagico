'use server'

import 'server-only'
import { updateTag } from 'next/cache'
import { EVENTO_CACHE_TAG } from '../_constants'
import { eq } from 'drizzle-orm'
import { db } from '@frijolmagico/database/orm'
import { events } from '@frijolmagico/database/schema'
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
import { eventoSchema, type EventoInput } from '../_schemas/evento.schema'
import { stripUndefined } from '@/shared/lib/utils'
import { generateSlug } from '../_lib/slug-utils'

const { evento } = events

/**
 * Save evento changes to database
 *
 * Receives PushOperation[] and persists them to DB.
 * Handles evento table operations.
 * Validates data via Zod schemas internally.
 * Auto-generates slug from nombre.
 */
export async function saveEventoAction(
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
              .delete(evento)
              .where(eq(evento.id, Number.parseInt(op.entityId, 10)))
          }
        } else {
          const validated = validateOperationData(
            op.data,
            eventoSchema,
            op.type === PUSH_OPERATION_TYPE.UPDATE
          )
          if (!validated.valid || !validated.data) {
            throw new Error(
              validated.errors?.[0]?.message ?? 'Validation failed'
            )
          }
          const input = validated.data

          if (isTempId(op.entityId)) {
            // CREATE: Generate slug from nombre
            const slug = generateSlug(input.nombre as string)
            const [inserted] = await tx
              .insert(evento)
              .values({ ...input, slug } as EventoInput)
              .returning({ id: evento.id })

            if (inserted) {
              mappings.push(createIdMapping(op.entityId, inserted.id, 'evento'))
            }
          } else {
            // UPDATE: Regenerate slug if nombre changed
            const updateData = stripUndefined(input)
            if ('nombre' in updateData && updateData.nombre) {
              updateData.slug = generateSlug(updateData.nombre as string)
            }
            await tx
              .update(evento)
              .set(updateData)
              .where(eq(evento.id, Number.parseInt(op.entityId, 10)))
          }
        }
      }
    })

    updateTag(EVENTO_CACHE_TAG)

    return {
      success: true,
      idMappings: mappings
    }
  } catch (error) {
    logServerError(error, 'saveEventoAction')
    const handled = handleServerActionError(error)
    return {
      success: false,
      errors: [
        {
          entityType: 'evento',
          entityId: 'unknown',
          message: handled.userMessage
        }
      ]
    }
  }
}
