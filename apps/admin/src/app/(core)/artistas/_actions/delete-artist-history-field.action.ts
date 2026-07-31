'use server'

import 'server-only'
import { updateTag } from 'next/cache'
import { db } from '@frijolmagico/database/orm'
import { artist } from '@frijolmagico/database/schema'
import { eq, sql } from 'drizzle-orm'
import { requireAuth } from '@/shared/lib/auth/utils'
import { ARTIST_HISTORY_CACHE_TAG } from '@frijolmagico/cache-tags'
import { HISTORY_FIELD_NAMES } from '../_lib/aggregate-history'
import type { ActionState } from '@/shared/types/actions'

const VALID_FIELDS: readonly string[] = HISTORY_FIELD_NAMES

/**
 * Count how many data fields are non-null in the row.
 * The CHECK constraint `chk_artista_historial_has_data` enforces that at least
 * one field must be non-null, so we must DELETE instead of UPDATE when clearing
 * the last remaining field.
 */
function nonNullFieldCount(row: {
  pseudonimo: string | null
  correo: string | null
  rrss: string | null
  ciudad: string | null
  pais: string | null
}): number {
  return [row.pseudonimo, row.correo, row.rrss, row.ciudad, row.pais].filter(
    (v) => v !== null
  ).length
}

/**
 * Sets a text field to NULL, or DELETEs the row if this is the last non-null field.
 * This avoids the `chk_artista_historial_has_data` CHECK constraint.
 * Runs inside a transaction to prevent TOCTOU races between the read and write.
 */
async function setFieldToNullOrDelete(
  historyId: number,
  field: string
): Promise<void> {
  await db.transaction(async (tx) => {
    const [row] = await tx
      .select({
        pseudonimo: artist.artistHistory.pseudonimo,
        correo: artist.artistHistory.correo,
        rrss: artist.artistHistory.rrss,
        ciudad: artist.artistHistory.ciudad,
        pais: artist.artistHistory.pais,
      })
      .from(artist.artistHistory)
      .where(eq(artist.artistHistory.id, historyId))

    if (!row) return

    const count = nonNullFieldCount(row)

    if (count <= 1) {
      await tx
        .delete(artist.artistHistory)
        .where(eq(artist.artistHistory.id, historyId))
    } else {
      await tx
        .update(artist.artistHistory)
        .set({ [field]: sql`NULL` } as Record<string, unknown>)
        .where(eq(artist.artistHistory.id, historyId))
    }
  })
}

/**
 * Removes a platform from the rrss JSON, or sets it to NULL.
 * If rrss was the last non-null field, deletes the row instead.
 * Runs inside a transaction to prevent TOCTOU races between the read and write.
 */
async function removeRrssPlatformOrDelete(
  historyId: number,
  platform?: string
): Promise<void> {
  await db.transaction(async (tx) => {
    const [row] = await tx
      .select({
        pseudonimo: artist.artistHistory.pseudonimo,
        correo: artist.artistHistory.correo,
        rrss: artist.artistHistory.rrss,
        ciudad: artist.artistHistory.ciudad,
        pais: artist.artistHistory.pais,
      })
      .from(artist.artistHistory)
      .where(eq(artist.artistHistory.id, historyId))

    if (!row?.rrss) return

    const parsed: Record<string, string> = JSON.parse(row.rrss)

    if (platform) {
      delete parsed[platform]
    }

    const isRrssEmpty = Object.keys(parsed).length === 0

    if (isRrssEmpty) {
      const count = nonNullFieldCount({ ...row, rrss: null })

      if (count <= 0) {
        await tx
          .delete(artist.artistHistory)
          .where(eq(artist.artistHistory.id, historyId))
      } else {
        await tx
          .update(artist.artistHistory)
          .set({ rrss: sql`NULL` as unknown as null })
          .where(eq(artist.artistHistory.id, historyId))
      }
    } else {
      await tx
        .update(artist.artistHistory)
        .set({ rrss: JSON.stringify(parsed) })
        .where(eq(artist.artistHistory.id, historyId))
    }
  })
}

export async function deleteArtistHistoryFieldAction(
  historyId: number,
  field: string,
  rrssPlatform?: string
): Promise<ActionState> {
  await requireAuth()

  if (!VALID_FIELDS.includes(field)) {
    return {
      success: false,
      errors: [
        {
          entityType: 'artista',
          message: `Campo de historial inválido: ${field}`
        }
      ]
    }
  }

  try {
    if (field === 'rrss') {
      await removeRrssPlatformOrDelete(historyId, rrssPlatform)
    } else {
      await setFieldToNullOrDelete(historyId, field)
    }

    updateTag(ARTIST_HISTORY_CACHE_TAG)
    return { success: true }
  } catch (error) {
    console.error('deleteArtistHistoryFieldAction failed:', error)
    return {
      success: false,
      errors: [
        {
          entityType: 'artista',
          message: `Error al eliminar el campo del historial: ${(error as Error).message}`
        }
      ]
    }
  }
}
