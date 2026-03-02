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
import { validateOperationData } from '@/shared/push/lib/validators'
import {
  organizacionEquipoSchema,
  type OrganizacionEquipoInput
} from '../_schemas/organizacion.schema'
import type {
  PushOperation,
  PushResult,
  IdMapping
} from '@/shared/push/lib/types'
import { stripUndefined } from '@/shared/lib/utils'

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
          const validated = validateOperationData(
            op.data,
            organizacionEquipoSchema,
            op.type === PUSH_OPERATION_TYPE.UPDATE
          )
          if (!validated.valid || !validated.data) {
            throw new Error(
              validated.errors?.[0]?.message ?? 'Validation failed'
            )
          }
          const input = validated.data

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
