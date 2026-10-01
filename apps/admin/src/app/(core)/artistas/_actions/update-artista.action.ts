'use server'

import 'server-only'
import { updateTag } from 'next/cache'
import { db } from '@frijolmagico/database/orm'
import { artist as artistTables } from '@frijolmagico/database/schema'

import { and, asc, eq, isNull, sql } from 'drizzle-orm'
const { artist, artistPseudonym, artistPrimaryPseudonym } = artistTables
import { requireAuth } from '@/shared/lib/auth/utils'
import {
  ARTIST_CACHE_TAG,
  ARTIST_HISTORY_CACHE_TAG,
  CANONICAL_CATALOG_SLUGS_CACHE_TAG,
  CATALOG_BASE_CACHE_TAG,
  CATALOG_CACHE_TAG
} from '@frijolmagico/cache-tags'
import { revalidateWebCache } from '@/shared/lib/web-invalidation'
import { allocateCatalogSlug } from '../catalogo/_lib/catalog-slug'
import { artistUpdateSchema } from '../_schemas/artista.schema'
import { artistHistoryInsertSchema } from '../_schemas/history.schema'
import type { ArtistUpdateFormInput, Artist } from '../_schemas/artista.schema'
import type { ActionState } from '@/shared/types/actions'
import { applyArtistPseudonymDrafts } from '../_lib/artist-update-transaction'
import {
  artistPseudonymDraftSchema,
  type ArtistPseudonymDraftInput
} from '../_schemas/artist-pseudonym.schema'

export interface ArtistPseudonymOption {
  id: number
  pseudonimo: string
  isPrimary: boolean
}

export async function getArtistPseudonymsAction(
  artistId: number
): Promise<ArtistPseudonymOption[]> {
  await requireAuth()

  const rows = await db
    .select({
      id: artistPseudonym.id,
      pseudonimo: artistPseudonym.pseudonimo,
      primaryId: artistPrimaryPseudonym.pseudonimoId
    })
    .from(artistPseudonym)
    .innerJoin(artist, eq(artist.id, artistPseudonym.artistaId))
    .leftJoin(
      artistPrimaryPseudonym,
      eq(artistPrimaryPseudonym.artistaId, artistPseudonym.artistaId)
    )
    .where(and(
      eq(artistPseudonym.artistaId, artistId),
      isNull(artistPseudonym.deletedAt),
      isNull(artist.deletedAt)
    ))
    .orderBy(asc(artistPseudonym.id))

  return rows.map(({ id, pseudonimo, primaryId }) => ({
    id,
    pseudonimo,
    isPrimary: id === primaryId
  }))
}

const HISTORIAL_FIELDS = [
  'pseudonimo',
  'correo',
  'ciudad',
  'pais',
  'rrss'
] as const

const CATALOG_ARTIST_FIELDS = ['nombre', 'correo', 'rrss', 'ciudad', 'pais'] as const

type CatalogArtistField = typeof CATALOG_ARTIST_FIELDS[number]

type CatalogArtistValues = Partial<Record<CatalogArtistField, unknown>>

function catalogFieldsChanged(previous: Artist, next: CatalogArtistValues) {
  return CATALOG_ARTIST_FIELDS.some((field) =>
    next[field] !== undefined && JSON.stringify(previous[field]) !== JSON.stringify(next[field])
  )
}

export async function updateArtistaWithPseudonymsAction(
  { data: prevData }: ActionState<Artist>,
  input: { data: ArtistUpdateFormInput; pseudonymDrafts: ArtistPseudonymDraftInput[] }
): Promise<ActionState> {
  await requireAuth()

  if (!prevData?.id) {
    return { success: false, errors: [{ entityType: 'artista', message: 'ID de artista inválido' }] }
  }

  const parsedDrafts = input.pseudonymDrafts.map((draft) => artistPseudonymDraftSchema.safeParse(draft))
  const invalidDraft = parsedDrafts.find((parsed) => !parsed.success)
  if (invalidDraft && !invalidDraft.success) {
    return {
      success: false,
      errors: invalidDraft.error.issues.map((issue) => ({ entityType: 'artista', message: issue.message }))
    }
  }

  const { historialFlags, ...updateFields } = input.data
  const { pseudonimo, ...generalFields } = updateFields
  void pseudonimo
  const parsedArtist = artistUpdateSchema.safeParse(generalFields)
  if (!parsedArtist.success) {
    return {
      success: false,
      errors: parsedArtist.error.issues.map((issue) => ({ entityType: 'artista', message: issue.message }))
    }
  }

  let historialInsert = null
  if (historialFlags) {
    const candidate: Record<string, unknown> = { artistaId: prevData.id, notas: null }
    for (const field of HISTORIAL_FIELDS) {
      if (field === 'pseudonimo' || !historialFlags[field]) {
        candidate[field] = null
        continue
      }
      const value = prevData[field]
      candidate[field] = value && typeof value === 'object' ? JSON.stringify(value) : value
    }
    if (HISTORIAL_FIELDS.some((field) => candidate[field] !== null)) {
      const parsedHistory = artistHistoryInsertSchema.safeParse(candidate)
      if (parsedHistory.success) historialInsert = parsedHistory.data
    }
  }

  try {
    const {
      historyChanged,
      catalogSlugChanged,
      canonicalCatalogSlugChanged,
      catalogDataChanged
    } = await db.transaction(async (tx) => {
      const pseudonymResult = await applyArtistPseudonymDrafts(
        tx,
        prevData.id,
        parsedDrafts.flatMap((draft) => draft.success ? [draft.data] : [])
      )
      await tx.update(artist).set(parsedArtist.data).where(eq(artist.id, prevData.id))

      if (historialInsert) {
        const [maxResult] = await tx
          .select({ maxOrden: sql<number>`COALESCE(MAX(${artistTables.artistHistory.orden}), 0)` })
          .from(artistTables.artistHistory)
          .where(eq(artistTables.artistHistory.artistaId, prevData.id))
        await tx.insert(artistTables.artistHistory).values({
          ...historialInsert,
          orden: (maxResult?.maxOrden ?? 0) + 1
        })
      }
      return {
        historyChanged: pseudonymResult.historyChanged,
        catalogSlugChanged: pseudonymResult.catalogSlugChanged,
        canonicalCatalogSlugChanged: pseudonymResult.canonicalCatalogSlugChanged,
        catalogDataChanged: pseudonymResult.catalogDataChanged
      }
    })

    updateTag(ARTIST_CACHE_TAG)
    if (historialInsert || historyChanged) updateTag(ARTIST_HISTORY_CACHE_TAG)
    if (canonicalCatalogSlugChanged) {
      void revalidateWebCache({
        tag: CANONICAL_CATALOG_SLUGS_CACHE_TAG,
        mode: 'immediate'
      })
    }
    if (catalogSlugChanged || catalogDataChanged || catalogFieldsChanged(prevData, parsedArtist.data)) {
      updateTag(CATALOG_BASE_CACHE_TAG)
      updateTag(CATALOG_CACHE_TAG)
      void revalidateWebCache({ tag: CATALOG_BASE_CACHE_TAG })
      void revalidateWebCache({ tag: CATALOG_CACHE_TAG, path: '/catalogo' })
    }
    return { success: true }
  } catch (error) {
    return {
      success: false,
      errors: [{ entityType: 'artista', message: error instanceof Error ? error.message : 'Error desconocido' }]
    }
  }
}

export async function updateArtistaAction(
  { data: prevData }: ActionState<Artist>,
  data: ArtistUpdateFormInput
): Promise<ActionState> {
  await requireAuth()

  if (!prevData?.id) {
    return {
      success: false,
      errors: [{ entityType: 'artista', message: 'ID de artista inválido' }]
    }
  }

  const { historialFlags, ...updateFields } = data
  const parsed = artistUpdateSchema.safeParse(updateFields)

  if (!parsed.success) {
    return {
      success: false,
      errors: parsed.error.issues.map((issue) => ({
        entityType: 'artista',
        message: issue.message
      }))
    }
  }

  // Resolve historial snapshot from flags + previous artist data via schema
  let historialInsert = null
  if (historialFlags) {
    const candidate: Record<string, unknown> = {
      artistaId: prevData.id,
      notas: null
    }

    for (const field of HISTORIAL_FIELDS) {
      if (!historialFlags[field]) {
        candidate[field] = null
        continue
      }
      const value = prevData[field]
      // rrss is stored as Record in memory but as JSON string in DB
      candidate[field] =
        value && typeof value === 'object' ? JSON.stringify(value) : value
    }

    const hasData = HISTORIAL_FIELDS.some((f) => candidate[f] !== null)

    if (hasData) {
      const historialParsed = artistHistoryInsertSchema.safeParse(candidate)

      if (historialParsed.success) {
        historialInsert = historialParsed.data
      }
    }
  }

  const {
    catalogSlugChanged,
    canonicalCatalogSlugChanged,
    catalogDataChanged
  } = await db.transaction(async (tx) => {
    await tx
      .update(artist)
      .set(parsed.data)
      .where(eq(artist.id, prevData.id))

    if (historialInsert) {
      const [maxResult] = await tx
        .select({
          maxOrden: sql<number>`COALESCE(MAX(${artistTables.artistHistory.orden}), 0)`
        })
        .from(artistTables.artistHistory)
        .where(eq(artistTables.artistHistory.artistaId, prevData.id))

      await tx.insert(artistTables.artistHistory).values({
        ...historialInsert,
        orden: (maxResult?.maxOrden ?? 0) + 1
      })
    }

    const [catalogSelection] = await tx
      .select({
        pseudonimoId: artistTables.catalogArtist.pseudonimoId,
        activo: artistTables.catalogArtist.activo,
        deletedAt: artistTables.catalogArtist.deletedAt
      })
      .from(artistTables.catalogArtist)
      .where(eq(artistTables.catalogArtist.artistaId, prevData.id))
    const [primary] = await tx
      .select({ pseudonimoId: artistTables.artistPrimaryPseudonym.pseudonimoId })
      .from(artistTables.artistPrimaryPseudonym)
      .where(eq(artistTables.artistPrimaryPseudonym.artistaId, prevData.id))
    const pseudonymIsDisplayed =
      catalogSelection?.pseudonimoId == null ||
      catalogSelection.pseudonimoId === primary?.pseudonimoId
    const pseudonymChanged =
      pseudonymIsDisplayed && parsed.data.pseudonimo !== undefined &&
      parsed.data.pseudonimo !== prevData.pseudonimo
    const catalogSlugChanged =
      catalogSelection?.pseudonimoId != null &&
      catalogSelection.pseudonimoId === primary?.pseudonimoId &&
      parsed.data.pseudonimo !== undefined
        ? await allocateCatalogSlug(tx, prevData.id, parsed.data.pseudonimo)
        : false
    const canonicalCatalogSlugChanged =
      catalogSlugChanged &&
      catalogSelection?.activo === true &&
      catalogSelection.deletedAt === null
    return {
      catalogSlugChanged,
      canonicalCatalogSlugChanged,
      catalogDataChanged: catalogFieldsChanged(prevData, parsed.data) || pseudonymChanged
    }
  })

  updateTag(ARTIST_CACHE_TAG)
  if (historialInsert) updateTag(ARTIST_HISTORY_CACHE_TAG)
  if (canonicalCatalogSlugChanged) {
    void revalidateWebCache({
      tag: CANONICAL_CATALOG_SLUGS_CACHE_TAG,
      mode: 'immediate'
    })
  }
  if (catalogSlugChanged || catalogDataChanged) {
    updateTag(CATALOG_BASE_CACHE_TAG)
    updateTag(CATALOG_CACHE_TAG)
    void revalidateWebCache({ tag: CATALOG_BASE_CACHE_TAG })
    void revalidateWebCache({ tag: CATALOG_CACHE_TAG, path: '/catalogo' })
  }

  return { success: true }
}
