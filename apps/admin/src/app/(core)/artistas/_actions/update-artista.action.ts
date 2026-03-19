'use server'

import 'server-only'
import { updateTag } from 'next/cache'
import { db } from '@frijolmagico/database/orm'
import { artist } from '@frijolmagico/database/schema'
import { eq, sql } from 'drizzle-orm'
import { requireAuth } from '@/shared/lib/auth/utils'
import { artistUpdateSchema } from '../_schemas/artista.schema'
import { artistHistoryInsertSchema } from '../_schemas/history.schema'
import type { ArtistUpdateFormInput, Artist } from '../_schemas/artista.schema'
import type { ActionState } from '@/shared/types/actions'
import { ARTIST_CACHE_TAG, ARTIST_HISTORY_CACHE_TAG } from '../_constants'

const HISTORIAL_FIELDS = [
  'pseudonimo',
  'correo',
  'ciudad',
  'pais',
  'rrss'
] as const

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

  await db.transaction(async (tx) => {
    await tx
      .update(artist.artist)
      .set(parsed.data)
      .where(eq(artist.artist.id, prevData.id))

    if (historialInsert) {
      const [maxResult] = await tx
        .select({
          maxOrden: sql<number>`COALESCE(MAX(${artist.artistHistory.orden}), 0)`
        })
        .from(artist.artistHistory)
        .where(eq(artist.artistHistory.artistaId, prevData.id))

      await tx.insert(artist.artistHistory).values({
        ...historialInsert,
        orden: (maxResult?.maxOrden ?? 0) + 1
      })
    }
  })

  updateTag(ARTIST_CACHE_TAG)
  if (historialInsert) updateTag(ARTIST_HISTORY_CACHE_TAG)

  return { success: true }
}
