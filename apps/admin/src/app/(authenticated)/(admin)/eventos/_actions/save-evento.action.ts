'use server'

import { eq } from 'drizzle-orm'
import { db } from '@frijolmagico/database/orm'
import { events } from '@frijolmagico/database/schema'
import { requireAuth } from '@/lib/auth/utils'
import { isTempId, createIdMapping } from '@/shared/push/lib/id-mapper'
import {
  sortPushOperations,
  validatePushOperations
} from '@/shared/push/lib/operation-resolver'
import { PUSH_OPERATION_TYPE } from '@/shared/push/lib/types'
import type {
  PushOperation,
  PushResult,
  IdMapping
} from '@/shared/push/lib/types'
import type { JournalEntry } from '@/shared/change-journal/lib/types'
import {
  mapToEventoInput,
  mapToEventoEdicionInput,
  mapToEventoEdicionDiaInput
} from '../_mappers/evento.mapper'
import type {
  EventoInput,
  EventoEdicionInput,
  EventoEdicionDiaInput
} from '../_schemas/evento.schema'
import { stripUndefined } from '@/shared/lib/utils'
import {
  handleServerActionError,
  logServerError
} from '@/shared/push/lib/error-handler'

/**
 * Synthesize a JournalEntry from PushOperation for mapper compatibility
 */
function toJournalEntry(op: PushOperation): JournalEntry {
  const base = {
    entryId: crypto.randomUUID(),
    schemaVersion: 1,
    section: 'evento',
    scopeKey: `${op.entityType}:${op.entityId}`,
    timestampMs: Date.now(),
    clientId: 'commit-system'
  }

  switch (op.type) {
    case PUSH_OPERATION_TYPE.CREATE:
    case PUSH_OPERATION_TYPE.UPDATE:
      return { ...base, payload: { op: 'set' as const, value: op.data } }
    case PUSH_OPERATION_TYPE.DELETE:
      return { ...base, payload: { op: 'unset' as const } }
    case PUSH_OPERATION_TYPE.RESTORE:
      return { ...base, payload: { op: 'restore' as const } }
  }
}

/**
 * Save evento section changes to database
 *
 * Receives PushOperation[] and persists them to DB.
 * Handles evento, eventoEdicion, and eventoEdicionDia tables in a single transaction.
 * Validates data via Zod schemas internally.
 */
export async function saveEventoAction(
  operations: PushOperation[]
): Promise<PushResult> {
  try {
    await requireAuth()

    if (operations.length === 0) {
      return { success: true, idMappings: [] }
    }

    const validation = validatePushOperations(operations)
    if (!validation.valid) {
      return {
        success: false,
        errors: validation.errors.map((msg, idx) => ({
          entityType: 'evento',
          entityId: `error-${idx}`,
          message: msg
        }))
      }
    }

    const sorted = sortPushOperations(operations)

    const eventoOps: PushOperation[] = []
    const edicionOps: PushOperation[] = []
    const diaOps: PushOperation[] = []

    for (const op of sorted) {
      if (op.entityType.includes('evento-edicion-dia')) {
        diaOps.push(op)
      } else if (op.entityType.includes('evento-edicion')) {
        edicionOps.push(op)
      } else if (op.entityType.includes('evento')) {
        eventoOps.push(op)
      }
    }

    const mappings: IdMapping[] = []
    const tempIdMap = new Map<string, number>()

    await db.transaction(async (tx) => {
      for (const op of eventoOps) {
        if (op.type === PUSH_OPERATION_TYPE.DELETE) {
          if (!isTempId(op.entityId)) {
            await tx
              .delete(events.evento)
              .where(eq(events.evento.id, Number.parseInt(op.entityId, 10)))
          }
        } else if (op.type === PUSH_OPERATION_TYPE.RESTORE) {
          continue
        } else {
          const entry = toJournalEntry(op)
          const input = mapToEventoInput(entry)

          if (input.id && !isTempId(op.entityId)) {
            const { id, ...updateData } = input
            await tx
              .update(events.evento)
              .set(stripUndefined(updateData))
              .where(eq(events.evento.id, input.id))
            await tx
              .update(events.evento)
              .set(stripUndefined(input))
              .where(eq(events.evento.id, input.id))
          } else {
            const [inserted] = await tx
              .insert(events.evento)
              .values(input as EventoInput)
              .returning({ id: events.evento.id })

            if (inserted) {
              tempIdMap.set(op.entityId, inserted.id)
              mappings.push(createIdMapping(op.entityId, inserted.id, 'evento'))
            }
          }
        }
      }

      for (const op of edicionOps) {
        if (op.type === PUSH_OPERATION_TYPE.DELETE) {
          if (!isTempId(op.entityId)) {
            await tx
              .delete(events.eventoEdicion)
              .where(
                eq(events.eventoEdicion.id, Number.parseInt(op.entityId, 10))
              )
          }
        } else if (op.type === PUSH_OPERATION_TYPE.RESTORE) {
          continue
        } else {
          const entry = toJournalEntry(op)
          const input = mapToEventoEdicionInput(entry)

          if (input.eventoId && isTempId(String(input.eventoId))) {
            const realEventoId = tempIdMap.get(String(input.eventoId))
            if (realEventoId) {
              input.eventoId = realEventoId
            }
          }

          if (input.id && !isTempId(op.entityId)) {
            const { id, ...updateData } = input
            await tx
              .update(events.eventoEdicion)
              .set(stripUndefined(updateData))
              .where(eq(events.eventoEdicion.id, input.id))
            await tx
              .update(events.eventoEdicion)
              .set(stripUndefined(input))
              .where(eq(events.eventoEdicion.id, input.id))
          } else {
            const [inserted] = await tx
              .insert(events.eventoEdicion)
              .values(input as EventoEdicionInput)
              .returning({ id: events.eventoEdicion.id })

            if (inserted) {
              tempIdMap.set(op.entityId, inserted.id)
              mappings.push(createIdMapping(op.entityId, inserted.id, 'evento'))
            }
          }
        }
      }

      for (const op of diaOps) {
        if (op.type === PUSH_OPERATION_TYPE.DELETE) {
          if (!isTempId(op.entityId)) {
            await tx
              .delete(events.eventoEdicionDia)
              .where(
                eq(events.eventoEdicionDia.id, Number.parseInt(op.entityId, 10))
              )
          }
        } else if (op.type === PUSH_OPERATION_TYPE.RESTORE) {
          continue
        } else {
          const entry = toJournalEntry(op)
          const input = mapToEventoEdicionDiaInput(entry)

          if (isTempId(String(input.eventoEdicionId))) {
            const realEdicionId = tempIdMap.get(String(input.eventoEdicionId))
            if (realEdicionId) {
              input.eventoEdicionId = realEdicionId
            }
          }

          if (input.id && !isTempId(op.entityId)) {
            const { id, ...updateData } = input
            await tx
              .update(events.eventoEdicionDia)
              .set(stripUndefined(updateData))
              .where(eq(events.eventoEdicionDia.id, input.id))
            await tx
              .update(events.eventoEdicionDia)
              .set(stripUndefined(input))
              .where(eq(events.eventoEdicionDia.id, input.id))
          } else {
            const [inserted] = await tx
              .insert(events.eventoEdicionDia)
              .values(input as EventoEdicionDiaInput)
              .returning({ id: events.eventoEdicionDia.id })

            if (inserted) {
              tempIdMap.set(op.entityId, inserted.id)
              mappings.push(createIdMapping(op.entityId, inserted.id, 'evento'))
            }
          }
        }
      }
    })

    // TODO(cache): Add revalidateTag with constants when cached fetchers
    // for the events section are implemented. For now they don't use cacheTag.
    // revalidateTag(<TAG_CONSTANT>, 'max')

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
