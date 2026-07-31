'use server'

import 'server-only'
import { updateTag } from 'next/cache'
import { db } from '@frijolmagico/database/orm'
import { artist } from '@frijolmagico/database/schema'
import { eq, sql } from 'drizzle-orm'
import { requireAuth } from '@/shared/lib/auth/utils'
import { ARTIST_HISTORY_CACHE_TAG } from '@frijolmagico/cache-tags'
import { artistHistoryInsertSchema } from '../_schemas/history.schema'
import type { ActionState } from '@/shared/types/actions'
import z from 'zod'

const insertHistoryFormSchema = z.object({
  artistaId: z.number().int().positive(),
  pseudonimo: z.string().min(1).nullable().optional(),
  correo: z.string().min(1).nullable().optional(),
  ciudad: z.string().min(1).nullable().optional(),
  pais: z.string().min(1).nullable().optional(),
  rrss: z
    .record(z.string().min(1), z.string().url())
    .nullable()
    .optional()
})

export type InsertHistoryFormInput = z.infer<typeof insertHistoryFormSchema>

export async function insertArtistHistoryItemAction(
  data: InsertHistoryFormInput
): Promise<ActionState> {
  await requireAuth()

  try {
    const parsed = insertHistoryFormSchema.safeParse(data)
    if (!parsed.success) {
      return {
        success: false,
        errors: parsed.error.issues.map((issue) => ({
          entityType: 'artista',
          message: issue.message
        }))
      }
    }

    const { rrss, ...textFields } = parsed.data

    const dbInsertData: Record<string, unknown> = {
      artistaId: parsed.data.artistaId,
      notas: null
    }

    // Map text fields
    for (const field of ['pseudonimo', 'correo', 'ciudad', 'pais'] as const) {
      if (textFields[field]) {
        dbInsertData[field] = textFields[field]
      }
    }

    // Handle rrss: stringify object to JSON string for DB
    if (rrss && typeof rrss === 'object' && Object.keys(rrss).length > 0) {
      dbInsertData.rrss = JSON.stringify(rrss)
    }

    const historialParsed = artistHistoryInsertSchema.safeParse(dbInsertData)
    if (!historialParsed.success) {
      return {
        success: false,
        errors: historialParsed.error.issues.map((issue) => ({
          entityType: 'artista',
          message: issue.message
        }))
      }
    }

    let insertedId = 0

    await db.transaction(async (tx) => {
      const [maxResult] = await tx
        .select({
          maxOrden: sql<number>`COALESCE(MAX(${artist.artistHistory.orden}), 0)`
        })
        .from(artist.artistHistory)
        .where(eq(artist.artistHistory.artistaId, parsed.data.artistaId))

      const [inserted] = await tx
        .insert(artist.artistHistory)
        .values({
          ...historialParsed.data,
          orden: (maxResult?.maxOrden ?? 0) + 1
        })
        .returning({ id: artist.artistHistory.id })

      insertedId = inserted!.id
    })

    updateTag(ARTIST_HISTORY_CACHE_TAG)

    return { success: true, data: { historyId: insertedId } }
  } catch (error) {
    console.error('insertArtistHistoryItemAction failed:', error)
    return {
      success: false,
      errors: [
        {
          entityType: 'artista',
          message: `Error al insertar el historial: ${(error as Error).message}`
        }
      ]
    }
  }
}
