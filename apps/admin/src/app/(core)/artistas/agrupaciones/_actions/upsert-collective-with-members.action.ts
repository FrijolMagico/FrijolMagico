'use server'

import 'server-only'
import { updateTag } from 'next/cache'
import { db } from '@frijolmagico/database/orm'
import { artist } from '@frijolmagico/database/schema'
import { and, eq, isNull, sql } from 'drizzle-orm'
import { requireAuth } from '@/shared/lib/auth/utils'
import {
  CATALOG_BASE_CACHE_TAG,
  CATALOG_CACHE_TAG,
  CATALOG_PARTICIPATION_CACHE_TAG,
  COLLECTIVE_ACTIVE_CACHE_TAG,
  COLLECTIVE_CACHE_TAG,
  COLLECTIVE_DELETED_CACHE_TAG,
  getCollectiveMembersCacheTag
} from '@frijolmagico/cache-tags'
import { revalidateWebCacheBestEffort } from '@/shared/lib/web-invalidation'
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

    let catalogChanged = false
    await db.transaction(async (transaction) => {
      const [existingCollective] = await transaction
        .select({ nombre: collective.nombre, activo: collective.activo })
        .from(collective)
        .where(eq(collective.id, collectiveId))
      const existingMembers = await transaction
        .select({
          artistId: collectiveArtist.artistaId,
          pseudonymId: collectiveArtist.pseudonimoId,
          role: collectiveArtist.rol,
          active: collectiveArtist.activo
        })
        .from(collectiveArtist)
        .where(eq(collectiveArtist.agrupacionId, collectiveId))
      const memberByArtist = new Map(
        existingMembers.map((member) => [member.artistId, member])
      )
      catalogChanged =
        existingCollective !== undefined &&
        (existingCollective.nombre !== fields.nombre.trim() ||
          existingCollective.activo !== fields.activo)
      for (const add of pendingAdds) {
        const member = memberByArtist.get(add.artistId)
        if (
          !member ||
          member.pseudonymId !== add.pseudonymId ||
          !member.active ||
          member.role !== add.role
        ) {
          catalogChanged = true
        }
      }
      for (const update of pendingUpdates) {
        const member = memberByArtist.get(update.artistId)
        if (
          member &&
          (member.pseudonymId !== update.pseudonymId ||
            member.role !== update.role ||
            member.active !== update.active)
        ) {
          catalogChanged = true
        }
      }
      for (const artistId of pendingRemovals) {
        if (memberByArtist.get(artistId)?.active) catalogChanged = true
      }

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
    if (catalogChanged) {
      void revalidateWebCacheBestEffort({ tag: CATALOG_BASE_CACHE_TAG })
      void revalidateWebCacheBestEffort({ tag: CATALOG_PARTICIPATION_CACHE_TAG })
      void revalidateWebCacheBestEffort({ tag: CATALOG_CACHE_TAG })
    }

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
