'use server'

import 'server-only'
import { updateTag } from 'next/cache'
import { eq } from 'drizzle-orm'
import { db } from '@frijolmagico/database/orm'
import { core, events } from '@frijolmagico/database/schema'
import { EVENTO_EDICION_CACHE_TAG, LUGAR_CACHE_TAG } from '../../_constants'
import { generateEdicionSlug } from '../../_lib/slug-utils'
import { requireAuth } from '@/lib/auth/utils'
import {
  PUSH_OPERATION_TYPE,
  type PushOperation,
  type PushResult,
  type IdMapping
} from '@/shared/push/lib/types'
import { createIdMapping, isTempId } from '@/shared/push/lib/id-mapper'
import { validateOperationData } from '@/shared/push/lib/validators'
import { stripUndefined } from '@/shared/lib/utils'
import {
  handleServerActionError,
  logServerError
} from '@/shared/push/lib/error-handler'
import {
  edicionSchema,
  edicionDiaSchema,
  lugarSchema,
  type EdicionInput,
  type EdicionDiaInput,
  type LugarInput
} from '../_schemas/edicion.schema'

const { place } = core
const { eventoEdicion, eventoEdicionDia } = events

function resolveNumberFk(
  value: unknown,
  mappings: IdMapping[],
  fieldName: string,
  allowNull: boolean = false
): number | null | undefined {
  if (value === undefined) {
    return undefined
  }

  if (value === null) {
    return allowNull ? null : undefined
  }

  const valueStr = String(value)

  if (isTempId(valueStr)) {
    const mapped = mappings.find((mapping) => mapping.tempId === valueStr)
    if (!mapped) {
      if (allowNull) return null
      throw new Error(`Could not resolve ${fieldName}`)
    }
    return mapped.realId
  }

  const parsed = Number(value)
  if (!Number.isFinite(parsed)) {
    throw new Error(`Invalid ${fieldName}`)
  }

  return parsed
}

export async function saveEdicionAction(
  operations: PushOperation[]
): Promise<PushResult> {
  try {
    await requireAuth()

    if (operations.length === 0) {
      return { success: true, idMappings: [] }
    }

    const lugarOps = operations.filter((op) => op.entityType === 'lugar')
    const edicionOps = operations.filter(
      (op) => op.entityType === 'evento_edicion'
    )
    const diaOps = operations.filter(
      (op) => op.entityType === 'evento_edicion_dia'
    )

    const mappings: IdMapping[] = []

    await db.transaction(async (tx) => {
      for (const op of lugarOps) {
        if (op.type === PUSH_OPERATION_TYPE.RESTORE) {
          continue
        }

        if (op.type === PUSH_OPERATION_TYPE.DELETE) {
          if (!isTempId(op.entityId)) {
            await tx
              .delete(place)
              .where(eq(place.id, Number.parseInt(op.entityId, 10)))
          }
          continue
        }

        const validated = validateOperationData(
          op.data,
          lugarSchema,
          op.type === PUSH_OPERATION_TYPE.UPDATE
        )

        if (!validated.valid || !validated.data) {
          throw new Error(validated.errors?.[0]?.message ?? 'Validation failed')
        }

        const input = validated.data

        if (isTempId(op.entityId)) {
          const [inserted] = await tx
            .insert(place)
            .values(input as LugarInput)
            .returning({ id: place.id })

          if (inserted) {
            mappings.push(createIdMapping(op.entityId, inserted.id, 'lugar'))
          }
          continue
        }

        await tx
          .update(place)
          .set(stripUndefined(input))
          .where(eq(place.id, Number.parseInt(op.entityId, 10)))
      }

      for (const op of edicionOps) {
        if (op.type === PUSH_OPERATION_TYPE.RESTORE) {
          continue
        }

        if (op.type === PUSH_OPERATION_TYPE.DELETE) {
          if (!isTempId(op.entityId)) {
            await tx
              .delete(eventoEdicion)
              .where(eq(eventoEdicion.id, Number.parseInt(op.entityId, 10)))
          }
          continue
        }

        const eventoIdValue =
          'eventoId' in op.data
            ? resolveNumberFk(op.data.eventoId, mappings, 'eventoId')
            : undefined

        const dataWithResolvedEventoId =
          eventoIdValue === undefined
            ? op.data
            : { ...op.data, eventoId: eventoIdValue }

        const validated = validateOperationData(
          dataWithResolvedEventoId,
          edicionSchema,
          op.type === PUSH_OPERATION_TYPE.UPDATE
        )

        if (!validated.valid || !validated.data) {
          throw new Error(validated.errors?.[0]?.message ?? 'Validation failed')
        }

        const input = validated.data

        if (isTempId(op.entityId)) {
          const slug = generateEdicionSlug(input.numeroEdicion)
          const [inserted] = await tx
            .insert(eventoEdicion)
            .values({ ...input, slug } as EdicionInput)
            .returning({ id: eventoEdicion.id })

          if (inserted) {
            mappings.push(
              createIdMapping(op.entityId, inserted.id, 'evento_edicion')
            )
          }
          continue
        }

        const updateData = stripUndefined(input)
        if (updateData.numeroEdicion) {
          updateData.slug = generateEdicionSlug(updateData.numeroEdicion)
        }

        await tx
          .update(eventoEdicion)
          .set(updateData)
          .where(eq(eventoEdicion.id, Number.parseInt(op.entityId, 10)))
      }

      for (const op of diaOps) {
        if (op.type === PUSH_OPERATION_TYPE.RESTORE) {
          continue
        }

        if (op.type === PUSH_OPERATION_TYPE.DELETE) {
          if (!isTempId(op.entityId)) {
            await tx
              .delete(eventoEdicionDia)
              .where(eq(eventoEdicionDia.id, Number.parseInt(op.entityId, 10)))
          }
          continue
        }

        const resolvedEdicionId =
          'eventoEdicionId' in op.data
            ? resolveNumberFk(
                op.data.eventoEdicionId,
                mappings,
                'eventoEdicionId'
              )
            : undefined

        const resolvedLugarId =
          'lugarId' in op.data
            ? resolveNumberFk(op.data.lugarId, mappings, 'lugarId', true)
            : undefined

        const dataWithResolvedFks = {
          ...op.data,
          ...(resolvedEdicionId === undefined
            ? {}
            : { eventoEdicionId: resolvedEdicionId }),
          ...(resolvedLugarId === undefined ? {} : { lugarId: resolvedLugarId })
        }

        const validated = validateOperationData(
          dataWithResolvedFks,
          edicionDiaSchema,
          op.type === PUSH_OPERATION_TYPE.UPDATE
        )

        if (!validated.valid || !validated.data) {
          throw new Error(validated.errors?.[0]?.message ?? 'Validation failed')
        }

        const input = validated.data

        const diaInsertData: EdicionDiaInput = {
          ...input,
          eventoEdicionId: Number(input.eventoEdicionId),
          lugarId:
            input.lugarId !== undefined ? Number(input.lugarId) : undefined
        }

        if (isTempId(op.entityId)) {
          const [inserted] = await tx
            .insert(eventoEdicionDia)
            .values(diaInsertData)
            .returning({ id: eventoEdicionDia.id })

          if (inserted) {
            mappings.push(
              createIdMapping(op.entityId, inserted.id, 'evento_edicion_dia')
            )
          }
          continue
        }

        await tx
          .update(eventoEdicionDia)
          .set(stripUndefined(diaInsertData))
          .where(eq(eventoEdicionDia.id, Number.parseInt(op.entityId, 10)))
      }
    })

    updateTag(EVENTO_EDICION_CACHE_TAG)
    updateTag(LUGAR_CACHE_TAG)

    return {
      success: true,
      idMappings: mappings
    }
  } catch (error) {
    logServerError(error, 'saveEdicionAction')
    const handled = handleServerActionError(error)

    return {
      success: false,
      errors: [
        {
          entityType: 'evento_edicion',
          entityId: 'unknown',
          message: handled.userMessage
        }
      ]
    }
  }
}
