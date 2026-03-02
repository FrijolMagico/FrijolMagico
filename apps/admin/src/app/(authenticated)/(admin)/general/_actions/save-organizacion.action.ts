'use server'

import { db } from '@frijolmagico/database/orm'
import { core } from '@frijolmagico/database/schema'

const { organization } = core
import { eq } from 'drizzle-orm'
import { requireAuth } from '@/lib/auth/utils'
import { updateTag } from 'next/cache'
import { ORGANIZATION_CACHE_TAG } from '../_constants'
import { PUSH_OPERATION_TYPE } from '@/shared/push/lib/types'
import {
  handleServerActionError,
  logServerError
} from '@/shared/push/lib/error-handler'
import { createIdMapping, isTempId } from '@/shared/push/lib/id-mapper'
import { validateOperationData } from '@/shared/push/lib/validators'
import {
  organizacionSchema,
  type OrganizacionInput
} from '../_schemas/organizacion.schema'
import type {
  PushOperation,
  PushResult,
  IdMapping
} from '@/shared/push/lib/types'
import { stripUndefined } from '@/shared/lib/utils'

export async function saveOrganizacionAction(
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
              .delete(organization)
              .where(eq(organization.id, Number(op.entityId)))
          }
        } else if (op.type === PUSH_OPERATION_TYPE.RESTORE) {
          continue
        } else {
          const validated = validateOperationData(
            op.data,
            organizacionSchema,
            op.type === PUSH_OPERATION_TYPE.UPDATE
          )
          if (!validated.valid || !validated.data) {
            throw new Error(
              validated.errors?.[0]?.message ?? 'Validation failed'
            )
          }
          const input = validated.data

          if (!isTempId(op.entityId)) {
            const setData = stripUndefined({
              nombre: input.nombre,
              descripcion: input.descripcion,
              mision: input.mision,
              vision: input.vision
            })

            await tx
              .update(organization)
              .set(setData)
              .where(eq(organization.id, Number(op.entityId)))
          } else {
            const [inserted] = await tx
              .insert(organization)
              .values({
                nombre: input.nombre,
                descripcion: input.descripcion,
                mision: input.mision,
                vision: input.vision
              } as OrganizacionInput)
              .returning({ id: organization.id })

            if (inserted) {
              mappings.push(
                createIdMapping(op.entityId, inserted.id, 'organizacion')
              )
            }
          }
        }
      }
    })

    updateTag(ORGANIZATION_CACHE_TAG)

    return {
      success: true,
      idMappings: mappings
    }
  } catch (error) {
    logServerError(error, 'saveOrganizacionAction')
    const handled = handleServerActionError(error)
    return {
      success: false,
      errors: [
        {
          entityType: 'organizacion',
          entityId: 'unknown',
          message: handled.userMessage
        }
      ]
    }
  }
}
