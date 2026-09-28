import 'server-only'
import { db } from '@frijolmagico/database/orm'
import { artist as artistTables } from '@frijolmagico/database/schema'
import { and, eq, isNull, sql } from 'drizzle-orm'
import type { ArtistPseudonymDraftInput } from '../_schemas/artist-pseudonym.schema'

type ArtistTransaction = Parameters<Parameters<typeof db.transaction>[0]>[0]

const { artist, artistPseudonym, artistPrimaryPseudonym, artistHistory } = artistTables

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
    .where(and(
      eq(artistPseudonym.id, pseudonymId),
      eq(artistPseudonym.artistaId, artistId),
      isNull(artistPseudonym.deletedAt)
    ))

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

export async function applyArtistPseudonymDrafts(
  transaction: ArtistTransaction,
  artistId: number,
  drafts: ArtistPseudonymDraftInput[]
) {
  await requireActiveArtist(transaction, artistId)
  let historyChanged = false

  for (const draft of drafts) {
    if (draft.operation === 'add') {
      const [added] = await transaction
        .insert(artistPseudonym)
        .values({ artistaId: artistId, pseudonimo: draft.pseudonym })
        .returning({ id: artistPseudonym.id, pseudonimo: artistPseudonym.pseudonimo })
      if (!added) throw new Error('No se pudo crear el pseudónimo')
      if (draft.makePrimary) await setPrimary(transaction, artistId, added.id, added.pseudonimo)
      continue
    }

    let pseudonymId = draft.pseudonymId
    if (pseudonymId === null) {
      const [primary] = await transaction
        .select({ pseudonimoId: artistPrimaryPseudonym.pseudonimoId })
        .from(artistPrimaryPseudonym)
        .where(eq(artistPrimaryPseudonym.artistaId, artistId))
      if (!primary) throw new Error('El artista no tiene un pseudónimo principal')
      pseudonymId = primary.pseudonimoId
    }

    const pseudonym = await requireOwnedActivePseudonym(transaction, artistId, pseudonymId)
    const renamed = draft.pseudonym !== pseudonym.pseudonimo

    if (renamed && draft.preserveHistory) {
      const [maxOrder] = await transaction
        .select({ value: sql<number>`COALESCE(MAX(${artistHistory.orden}), 0)` })
        .from(artistHistory)
        .where(eq(artistHistory.artistaId, artistId))
      await transaction.insert(artistHistory).values({
        artistaId: artistId,
        pseudonimo: pseudonym.pseudonimo,
        notas: null,
        orden: (maxOrder?.value ?? 0) + 1
      })
      historyChanged = true
    }

    if (renamed) {
      await transaction
        .update(artistPseudonym)
        .set({ pseudonimo: draft.pseudonym, updatedAt: sql`CURRENT_TIMESTAMP` })
        .where(eq(artistPseudonym.id, pseudonym.id))

      const [primary] = await transaction
        .select({ pseudonimoId: artistPrimaryPseudonym.pseudonimoId })
        .from(artistPrimaryPseudonym)
        .where(eq(artistPrimaryPseudonym.artistaId, artistId))
      if (primary?.pseudonimoId === pseudonym.id) {
        await transaction.update(artist).set({ pseudonimo: draft.pseudonym }).where(eq(artist.id, artistId))
      }
    }

    if (draft.makePrimary) {
      await setPrimary(transaction, artistId, pseudonym.id, draft.pseudonym)
    }
  }

  return { historyChanged }
}
