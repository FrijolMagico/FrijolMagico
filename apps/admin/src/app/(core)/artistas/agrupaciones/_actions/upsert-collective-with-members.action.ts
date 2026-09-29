'use server'

import 'server-only'
import { updateTag } from 'next/cache'
import { db } from '@frijolmagico/database/orm'
import { artist } from '@frijolmagico/database/schema'
import { and, eq, isNull, sql } from 'drizzle-orm'
import { requireAuth } from '@/shared/lib/auth/utils'
import {
  COLLECTIVE_ACTIVE_CACHE_TAG,
  COLLECTIVE_CACHE_TAG,
  COLLECTIVE_DELETED_CACHE_TAG,
  getCollectiveMembersCacheTag
} from '@frijolmagico/cache-tags'
import type { ActionState } from '@/shared/types/actions'
import {
  upsertCollectivePayloadSchema,
  type UpsertCollectivePayloadInput
} from '../_schemas/collective.schema'

const { collective, collectiveArtist, artistPseudonym } = artist

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
      const validatePseudonym = async (
        artistId: number,
        pseudonymId: number | null
      ) => {
        if (pseudonymId === null) {
          throw new Error('El pseudónimo es obligatorio')
        }

        const [activePseudonym] = await transaction
          .select({ id: artistPseudonym.id })
          .from(artistPseudonym)
          .where(
            and(
              eq(artistPseudonym.id, pseudonymId),
              eq(artistPseudonym.artistaId, artistId),
              isNull(artistPseudonym.deletedAt)
            )
          )

        if (!activePseudonym) {
          throw new Error('El pseudónimo seleccionado no pertenece al artista o está inactivo')
        }
      }

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
        await validatePseudonym(pendingAdd.artistId, pendingAdd.pseudonymId)

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
              pseudonimoId: pendingAdd.pseudonymId,
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
          pseudonimoId: pendingAdd.pseudonymId,
          rol: pendingAdd.role,
          activo: true
        })
      }

      for (const pendingUpdate of pendingUpdates) {
        await validatePseudonym(pendingUpdate.artistId, pendingUpdate.pseudonymId)

        await transaction
          .update(collectiveArtist)
          .set({
            pseudonimoId: pendingUpdate.pseudonymId,
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
