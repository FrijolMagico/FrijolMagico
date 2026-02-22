'use server'

import { db } from '@frijolmagico/database/orm'
import { core } from '@frijolmagico/database/schema'
import { eq } from 'drizzle-orm'

const { organizacionEquipo } = core

import { requireAuth } from '@/lib/auth/utils'
import { revalidateTag } from 'next/cache'
import { COMMIT_OPERATION_TYPE } from '@/shared/commit-system/lib/types'
import {
  validateCommitOperations
} from '@/shared/commit-system/lib/operation-sorter'
import { processBatches } from '@/shared/commit-system/lib/batch-processor'
import {
  handleServerActionError,
  logServerError
} from '@/shared/commit-system/lib/error-handler'
import { createIdMapping, isTempId } from '@/shared/commit-system/lib/id-mapper'
import { mapToOrganizacionEquipoInput } from '../_mappers/organizacion.mapper'
import type {
  CommitOperation,
  CommitResult,
  IdMapping
} from '@/shared/commit-system/lib/types'
import type { JournalEntry } from '@/shared/change-journal/lib/types'

function toJournalEntry(op: CommitOperation): JournalEntry {
  const base = {
    entryId: crypto.randomUUID(),
    schemaVersion: 1,
    section: 'organizacion_equipo',
    scopeKey: `${op.entityType}:${op.entityId}`,
    timestampMs: Date.now(),
    clientId: 'commit-system'
  }

  switch (op.type) {
    case COMMIT_OPERATION_TYPE.CREATE:
    case COMMIT_OPERATION_TYPE.UPDATE:
      return { ...base, payload: { op: 'set' as const, value: op.data } }
    case COMMIT_OPERATION_TYPE.DELETE:
      return { ...base, payload: { op: 'unset' as const } }
    case COMMIT_OPERATION_TYPE.RESTORE:
      return { ...base, payload: { op: 'restore' as const } }
  }
}

export async function saveOrganizacionEquipoAction(
  operations: CommitOperation[]
): Promise<CommitResult> {
  try {
    await requireAuth()

    if (operations.length === 0) {
      return { success: true, idMappings: [] }
    }

    const validation = validateCommitOperations(operations)
    if (!validation.valid) {
      logServerError(
        new Error(`Invalid operations: ${validation.errors.join(', ')}`),
        'saveOrganizacionEquipoAction'
      )
      return {
        success: false,
        errors: validation.errors.map((msg, idx) => ({
          entityType: 'organizacion_equipo',
          entityId: `error-${idx}`,
          message: msg
        }))
      }
    }

    const allMappings: IdMapping[] = []

    const batchResult = await processBatches(
      operations,
      async (batch) => {
        return await db.transaction(async (tx) => {
          const batchMappings: IdMapping[] = []

          for (const op of batch) {
            if (op.type === COMMIT_OPERATION_TYPE.DELETE) {
              if (!isTempId(op.entityId)) {
                await tx
                  .delete(organizacionEquipo)
                  .where(eq(organizacionEquipo.id, Number(op.entityId)))
              }
            } else if (op.type === COMMIT_OPERATION_TYPE.RESTORE) {
              continue
            } else {
              const entry = toJournalEntry(op)
              const input = mapToOrganizacionEquipoInput(entry)

              if (!isTempId(op.entityId)) {
                await tx
                  .update(organizacionEquipo)
                  .set({
                    organizacionId: input.organizacionId,
                    nombre: input.nombre,
                    cargo: input.cargo,
                    rrss: input.rrss
                  })
                  .where(eq(organizacionEquipo.id, Number(op.entityId)))
              } else {
                const [inserted] = await tx
                  .insert(organizacionEquipo)
                  .values({
                    organizacionId: input.organizacionId,
                    nombre: input.nombre,
                    cargo: input.cargo,
                    rrss: input.rrss
                  })
                  .returning({ id: organizacionEquipo.id })

                if (inserted) {
                  batchMappings.push(
                    createIdMapping(
                      op.entityId,
                      inserted.id,
                      'organizacion_equipo'
                    )
                  )
                }
              }
            }
          }

          return batchMappings
        })
      },
      { maxBatchSize: 50, maxRetries: 3, timeoutMs: 30000 }
    )

    if (!batchResult.success) {
      const firstError = batchResult.errors[0]
      const handled = handleServerActionError(firstError)
      return {
        success: false,
        errors: [
          {
            entityType: 'organizacion_equipo',
            entityId: 'unknown',
            message: handled.userMessage
          }
        ]
      }
    }

    revalidateTag('default', 'organizacion-equipo')

    return {
      success: true,
      idMappings: allMappings
    }
  } catch (error) {
    logServerError(error, 'saveOrganizacionEquipoAction')
    const handled = handleServerActionError(error)
    return {
      success: false,
      errors: [
        {
          entityType: 'organizacion_equipo',
          entityId: 'unknown',
          message: handled.userMessage
        }
      ]
    }
  }
}
