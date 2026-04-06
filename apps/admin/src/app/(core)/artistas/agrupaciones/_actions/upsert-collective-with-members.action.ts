'use server'

import 'server-only'
import { updateTag } from 'next/cache'
import { db } from '@frijolmagico/database/orm'
import { artist } from '@frijolmagico/database/schema'
import { and, eq, sql } from 'drizzle-orm'
import { requireAuth } from '@/shared/lib/auth/utils'
import type { ActionState } from '@/shared/types/actions'
import {
  COLLECTIVE_ACTIVE_CACHE_TAG,
  COLLECTIVE_CACHE_TAG,
  COLLECTIVE_DELETED_CACHE_TAG,
  getCollectiveMembersCacheTag
} from '../_constants'
import {
  upsertCollectivePayloadSchema,
  type UpsertCollectivePayloadInput
} from '../_schemas/collective.schema'

const { collective, collectiveArtist } = artist

function normalizeOptionalText(value: string) {
  const trimmedValue = value.trim()
  return trimmedValue.length > 0 ? trimmedValue : null
}

export async function upsertCollectiveWithMembersAction(
  _prevState: ActionState,
  data: UpsertCollectivePayloadInput
): Promise<ActionState> {
  try {
    await requireAuth()

    const parsedPayload = upsertCollectivePayloadSchema.safeParse(data)

    if (!parsedPayload.success) {
      return {
        success: false,
        errors: parsedPayload.error.issues.map((issue) => ({
          entityType: 'collective',
          message: issue.message
        }))
      }
    }

    const {
      collectiveId,
      fields,
      pendingAdds,
      pendingUpdates,
      pendingRemovals
    } = parsedPayload.data

    await db.transaction(async (transaction) => {
      await transaction
        .update(collective)
        .set({
          nombre: fields.nombre.trim(),
          descripcion: normalizeOptionalText(fields.descripcion),
          correo: normalizeOptionalText(fields.correo),
          activo: fields.activo,
          updatedAt: sql`CURRENT_TIMESTAMP`
        })
        .where(eq(collective.id, collectiveId))

      for (const pendingAdd of pendingAdds) {
        const [existingCollectiveMember] = await transaction
          .select({
            collectiveId: collectiveArtist.agrupacionId,
            artistId: collectiveArtist.artistaId
          })
          .from(collectiveArtist)
          .where(
            and(
              eq(collectiveArtist.agrupacionId, collectiveId),
              eq(collectiveArtist.artistaId, pendingAdd.artistId)
            )
          )

        if (existingCollectiveMember) {
          await transaction
            .update(collectiveArtist)
            .set({
              activo: true,
              rol: pendingAdd.role
            })
            .where(
              and(
                eq(collectiveArtist.agrupacionId, collectiveId),
                eq(collectiveArtist.artistaId, pendingAdd.artistId)
              )
            )

          continue
        }

        await transaction.insert(collectiveArtist).values({
          agrupacionId: collectiveId,
          artistaId: pendingAdd.artistId,
          rol: pendingAdd.role,
          activo: true
        })
      }

      for (const pendingUpdate of pendingUpdates) {
        await transaction
          .update(collectiveArtist)
          .set({
            rol: pendingUpdate.role,
            activo: pendingUpdate.active
          })
          .where(
            and(
              eq(collectiveArtist.agrupacionId, collectiveId),
              eq(collectiveArtist.artistaId, pendingUpdate.artistId)
            )
          )
      }

      for (const removedArtistId of pendingRemovals) {
        await transaction
          .update(collectiveArtist)
          .set({ activo: false })
          .where(
            and(
              eq(collectiveArtist.agrupacionId, collectiveId),
              eq(collectiveArtist.artistaId, removedArtistId)
            )
          )
      }
    })

    updateTag(COLLECTIVE_CACHE_TAG)
    updateTag(COLLECTIVE_ACTIVE_CACHE_TAG)
    updateTag(COLLECTIVE_DELETED_CACHE_TAG)
    updateTag(getCollectiveMembersCacheTag(collectiveId))

    return { success: true }
  } catch (error) {
    return {
      success: false,
      errors: [
        {
          entityType: 'collective',
          message: error instanceof Error ? error.message : 'Error desconocido'
        }
      ]
    }
  }
}
