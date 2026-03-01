'use server'

import { db } from '@frijolmagico/database/orm'
import { core } from '@frijolmagico/database/schema'
import { eq } from 'drizzle-orm'

const { organizationMember } = core

import { requireAuth } from '@/lib/auth/utils'
import { updateTag } from 'next/cache'
import { TEAM_CACHE_TAG } from '../_constants'
import { PUSH_OPERATION_TYPE } from '@/shared/push/lib/types'
import {
  handleServerActionError,
  logServerError
} from '@/shared/push/lib/error-handler'
import { createIdMapping, isTempId } from '@/shared/push/lib/id-mapper'
import { mapToOrganizacionEquipoInput } from '../_mappers/organizacion.mapper'
import type { OrganizacionEquipoInput } from '../_schemas/organizacion.schema'
import type {
  PushOperation,
  PushResult,
  IdMapping
} from '@/shared/push/lib/types'
import { stripUndefined } from '@/shared/lib/utils'
import type { JournalEntry } from '@/shared/change-journal/lib/types'

function toJournalEntry(op: PushOperation): JournalEntry {
  const base = {
    entryId: crypto.randomUUID(),
    schemaVersion: 1,
    section: 'organizacion_equipo',
    scopeKey: `${op.entityType}:${op.entityId}`,
    timestampMs: Date.now(),
    clientId: 'commit-system'
  }

  switch (op.type) {
    case PUSH_OPERATION_TYPE.CREATE:
    case PUSH_OPERATION_TYPE.UPDATE: {
      const { id: _tempId, ...dataSinId } = op.data
      return {
        ...base,
        payload: { op: 'set' as const, value: dataSinId }
      }
    }
    case PUSH_OPERATION_TYPE.DELETE:
      return { ...base, payload: { op: 'unset' as const } }
    case PUSH_OPERATION_TYPE.RESTORE:
      return { ...base, payload: { op: 'restore' as const } }
  }
}

export async function saveOrganizacionEquipoAction(
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
        if (op.type === PUSH_OPERATION_TYPE.DELETE) {
          if (!isTempId(op.entityId)) {
            await tx
              .delete(organizationMember)
              .where(eq(organizationMember.id, Number(op.entityId)))
          }
        } else if (op.type === PUSH_OPERATION_TYPE.RESTORE) {
          continue
        } else {
          const entry = toJournalEntry(op)
          const input = mapToOrganizacionEquipoInput(entry)

          if (!isTempId(op.entityId)) {
            await tx
              .update(organizationMember)
              .set(
                stripUndefined({
                  organizationId: input.organizationId,
                  name: input.name,
                  position: input.position,
                  rut: input.rut,
                  email: input.email,
                  phone: input.phone,
                  rrss: input.rrss
                })
              )
              .where(eq(organizationMember.id, Number(op.entityId)))
          } else {
            const [inserted] = await tx
              .insert(organizationMember)
              .values({
                organizationId: input.organizationId,
                name: input.name,
                position: input.position,
                rut: input.rut,
                email: input.email,
                phone: input.phone,
                rrss: input.rrss
              } as OrganizacionEquipoInput)
              .returning({ id: organizationMember.id })

            if (inserted) {
              mappings.push(
                createIdMapping(op.entityId, inserted.id, 'organizacion_equipo')
              )
            }
          }
        }
      }
    })

    updateTag(TEAM_CACHE_TAG)

    return {
      success: true,
      idMappings: mappings
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
