'use server'

import 'server-only'
import { updateTag } from 'next/cache'
import { db } from '@frijolmagico/database/orm'
import { artist as artistTables, participations } from '@frijolmagico/database/schema'
import { and, eq, isNull, sql } from 'drizzle-orm'
import { requireAuth } from '@/shared/lib/auth/utils'
import {
  ARTIST_CACHE_TAG,
  ARTIST_HISTORY_CACHE_TAG,
  CATALOG_CACHE_TAG
} from '@frijolmagico/cache-tags'
import { revalidateWebCache } from '@/shared/lib/web-invalidation'
import { allocateCatalogSlug } from '../catalogo/_lib/catalog-slug'
import type { ActionState } from '@/shared/types/actions'
import { artistInsertSchema } from '../_schemas/artista.schema'
import {
  artistPseudonymMutationSchema,
  createArtistWithPseudonymsSchema,
  type ArtistPseudonymMutationInput,
  type CreateArtistWithPseudonymsInput
} from '../_schemas/artist-pseudonym.schema'

const { artist, artistPseudonym, artistPrimaryPseudonym, artistHistory, catalogArtist } = artistTables
const { participationExhibition, participationActivity } = participations

function invalid<T = never>(message: string): ActionState<T> {
  return { success: false, errors: [{ entityType: 'artista', message }] }
}

function validationErrors<T = never>(issues: { message: string }[]): ActionState<T> {
  return {
    success: false,
    errors: issues.map(({ message }) => ({ entityType: 'artista', message }))
  }
}

function errorMessage(error: unknown) {
  return error instanceof Error ? error.message : 'Error desconocido'
}

type ArtistTransaction = Parameters<Parameters<typeof db.transaction>[0]>[0]

async function requireActiveArtist(transaction: ArtistTransaction, artistId: number) {
  const [activeArtist] = await transaction
    .select({ id: artist.id })
    .from(artist)
    .where(and(eq(artist.id, artistId), isNull(artist.deletedAt)))

  if (!activeArtist) throw new Error('El artista no existe o está eliminado')
}

async function requireOwnedActivePseudonym(
  transaction: ArtistTransaction,
  artistId: number,
  pseudonymId: number
) {
  const [pseudonym] = await transaction
    .select({ id: artistPseudonym.id, pseudonimo: artistPseudonym.pseudonimo })
    .from(artistPseudonym)
    .where(
      and(
        eq(artistPseudonym.id, pseudonymId),
        eq(artistPseudonym.artistaId, artistId),
        isNull(artistPseudonym.deletedAt)
      )
    )

  if (!pseudonym) throw new Error('El pseudónimo no existe o no pertenece al artista')
  return pseudonym
}

async function setPrimary(
  transaction: ArtistTransaction,
  artistId: number,
  pseudonymId: number,
  pseudonym: string
) {
  await transaction
    .insert(artistPrimaryPseudonym)
    .values({ artistaId: artistId, pseudonimoId: pseudonymId })
    .onConflictDoUpdate({
      target: artistPrimaryPseudonym.artistaId,
      set: { pseudonimoId: pseudonymId }
    })
  await transaction.update(artist).set({ pseudonimo: pseudonym }).where(eq(artist.id, artistId))
}

export async function createArtistWithPseudonymsAction(
  _previous: ActionState<{ id: number }>,
  data: CreateArtistWithPseudonymsInput
): Promise<ActionState<{ id: number }>> {
  try {
    await requireAuth()
    const parsed = createArtistWithPseudonymsSchema.safeParse(data)
    if (!parsed.success) return validationErrors<{ id: number }>(parsed.error.issues)

    const { artist: inputArtist, pseudonyms, primaryPseudonym } = parsed.data
    const parsedArtist = artistInsertSchema.safeParse({
      ...inputArtist,
      pseudonimo: primaryPseudonym
    })
    if (!parsedArtist.success) return validationErrors<{ id: number }>(parsedArtist.error.issues)

    const result = await db.transaction(async (transaction) => {
      const [created] = await transaction
        .insert(artist)
        .values(parsedArtist.data)
        .returning({ id: artist.id })
      if (!created) throw new Error('No se pudo obtener el ID del artista creado')

      const additionalPseudonyms = pseudonyms.filter((pseudonimo) => pseudonimo !== primaryPseudonym)
      if (additionalPseudonyms.length > 0) {
        await transaction
          .insert(artistPseudonym)
          .values(additionalPseudonyms.map((pseudonimo) => ({ artistaId: created.id, pseudonimo })))
      }
      return created.id
    })

    updateTag(ARTIST_CACHE_TAG)
    return { success: true, data: { id: result } }
  } catch (error) {
    return invalid<{ id: number }>(errorMessage(error))
  }
}

export async function mutateArtistPseudonymAction(
  _previous: ActionState,
  data: ArtistPseudonymMutationInput
): Promise<ActionState> {
  let historyChanged = false
  let catalogSlugChanged = false
  try {
    await requireAuth()
    const parsed = artistPseudonymMutationSchema.safeParse(data)
    if (!parsed.success) return validationErrors(parsed.error.issues)

    await db.transaction(async (transaction) => {
      const mutation = parsed.data
      await requireActiveArtist(transaction, mutation.artistId)

      if (mutation.operation === 'add') {
        const [added] = await transaction
          .insert(artistPseudonym)
          .values({ artistaId: mutation.artistId, pseudonimo: mutation.pseudonym })
          .returning({ id: artistPseudonym.id, pseudonimo: artistPseudonym.pseudonimo })
        if (!added) throw new Error('No se pudo crear el pseudónimo')
        if (mutation.makePrimary) {
          await setPrimary(transaction, mutation.artistId, added.id, added.pseudonimo)
        }
        return
      }

      const pseudonym = await requireOwnedActivePseudonym(
        transaction,
        mutation.artistId,
        mutation.pseudonymId
      )

      if (mutation.operation === 'rename') {
        if (mutation.preserveHistory && mutation.pseudonym !== pseudonym.pseudonimo) {
          const [maxOrder] = await transaction
            .select({ value: sql<number>`COALESCE(MAX(${artistHistory.orden}), 0)` })
            .from(artistHistory)
            .where(eq(artistHistory.artistaId, mutation.artistId))
          await transaction.insert(artistHistory).values({
            artistaId: mutation.artistId,
            pseudonimo: pseudonym.pseudonimo,
            orden: (maxOrder?.value ?? 0) + 1
          })
          historyChanged = true
        }
        await transaction
          .update(artistPseudonym)
          .set({ pseudonimo: mutation.pseudonym, updatedAt: sql`CURRENT_TIMESTAMP` })
          .where(eq(artistPseudonym.id, pseudonym.id))
        const [primary] = await transaction
          .select({ pseudonimoId: artistPrimaryPseudonym.pseudonimoId })
          .from(artistPrimaryPseudonym)
          .where(eq(artistPrimaryPseudonym.artistaId, mutation.artistId))
        if (primary?.pseudonimoId === pseudonym.id) {
          await transaction.update(artist).set({ pseudonimo: mutation.pseudonym }).where(eq(artist.id, mutation.artistId))
        }
        const [catalogSelection] = await transaction
          .select({ pseudonimoId: catalogArtist.pseudonimoId })
          .from(catalogArtist)
          .where(eq(catalogArtist.artistaId, mutation.artistId))
        if (catalogSelection?.pseudonimoId === pseudonym.id) {
          catalogSlugChanged = await allocateCatalogSlug(
            transaction,
            mutation.artistId,
            mutation.pseudonym
          )
        }
        return
      }

      if (mutation.operation === 'set-primary') {
        await setPrimary(transaction, mutation.artistId, pseudonym.id, pseudonym.pseudonimo)
        return
      }

      let replacement: { id: number; pseudonimo: string } | undefined
      if (mutation.reassignToPseudonymId !== undefined) {
        replacement = await requireOwnedActivePseudonym(
          transaction,
          mutation.artistId,
          mutation.reassignToPseudonymId
        )
      }

      const [catalogReference] = await transaction
        .select({ id: catalogArtist.id })
        .from(catalogArtist)
        .where(and(eq(catalogArtist.artistaId, mutation.artistId), eq(catalogArtist.pseudonimoId, pseudonym.id)))
      const [exhibitionReference] = await transaction
        .select({ id: participationExhibition.id })
        .from(participationExhibition)
        .where(and(eq(participationExhibition.artistaId, mutation.artistId), eq(participationExhibition.pseudonimoId, pseudonym.id)))
      const [activityReference] = await transaction
        .select({ id: participationActivity.id })
        .from(participationActivity)
        .where(and(eq(participationActivity.artistaId, mutation.artistId), eq(participationActivity.pseudonimoId, pseudonym.id)))
      const hasReferences = Boolean(catalogReference || exhibitionReference || activityReference)
      const [primary] = await transaction
        .select({ pseudonimoId: artistPrimaryPseudonym.pseudonimoId })
        .from(artistPrimaryPseudonym)
        .where(eq(artistPrimaryPseudonym.artistaId, mutation.artistId))
      if ((hasReferences || primary?.pseudonimoId === pseudonym.id) && !replacement) {
        throw new Error('Se debe reasignar el pseudónimo a otro pseudónimo activo del mismo artista')
      }

      if (replacement) {
        await transaction.update(catalogArtist).set({ pseudonimoId: replacement.id }).where(and(eq(catalogArtist.artistaId, mutation.artistId), eq(catalogArtist.pseudonimoId, pseudonym.id)))
        await transaction.update(participationExhibition).set({ pseudonimoId: replacement.id }).where(and(eq(participationExhibition.artistaId, mutation.artistId), eq(participationExhibition.pseudonimoId, pseudonym.id)))
        await transaction.update(participationActivity).set({ pseudonimoId: replacement.id }).where(and(eq(participationActivity.artistaId, mutation.artistId), eq(participationActivity.pseudonimoId, pseudonym.id)))
        if (catalogReference) {
          catalogSlugChanged = await allocateCatalogSlug(
            transaction,
            mutation.artistId,
            replacement.pseudonimo
          )
        }
        if (primary?.pseudonimoId === pseudonym.id) {
          await setPrimary(transaction, mutation.artistId, replacement.id, replacement.pseudonimo)
        }
      }
      await transaction
        .update(artistPseudonym)
        .set({ deletedAt: sql`CURRENT_TIMESTAMP`, updatedAt: sql`CURRENT_TIMESTAMP` })
        .where(eq(artistPseudonym.id, pseudonym.id))
    })

    updateTag(ARTIST_CACHE_TAG)
    if (historyChanged) updateTag(ARTIST_HISTORY_CACHE_TAG)
    if (catalogSlugChanged) {
      updateTag(CATALOG_CACHE_TAG)
      void revalidateWebCache({ tag: CATALOG_CACHE_TAG, path: '/catalogo' })
    }
    return { success: true }
  } catch (error) {
    return invalid(errorMessage(error))
  }
}
