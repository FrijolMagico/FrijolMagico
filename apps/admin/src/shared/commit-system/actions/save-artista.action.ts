'use server'

import { revalidateTag } from 'next/cache'
import { db } from '@frijolmagico/database/orm'
import { artist } from '@frijolmagico/database/schema'
import { eq } from 'drizzle-orm'
import { getLatestEntries } from '../lib/journal-reader'
import {
  mapToArtistaInput,
  mapToArtistaImagenInput
} from '../mappers/artista.mapper'
import { clearSection } from '@/shared/change-journal/change-journal'
import type { SaveResult, IdMapping } from '../lib/types'
import type { JournalEntry } from '@/shared/change-journal/lib/types'
import { createIdMapping, isTempId } from '../lib/id-mapper'

const { artista, artistaImagen } = artist

/**
 * Save artista section changes to database
 *
 * Processes journal entries for 'artista' section and persists them to DB.
 * Handles both artista and artistaImagen tables in a single transaction.
 *
 * Flow:
 * 1. Read journal entries (getLatestEntries - read-only)
 * 2. Validate and map entries
 * 3. Sort operations (DELETE → UPDATE → CREATE)
 * 4. Execute in transaction
 * 5. Build ID mappings for temp IDs
 * 6. Clear journal on success
 * 7. Revalidate cache
 *
 * @param section - Must be 'artista'
 * @returns SaveResult with success status, mappings, and errors
 *
 * @example
 * const result = await saveArtista('artista')
 * if (result.success) {
 *   console.log('Saved successfully', result.mappings)
 * } else {
 *   console.error('Save failed', result.error)
 * }
 */
export async function saveArtista(section: 'artista'): Promise<SaveResult> {
  try {
    const entries = await getLatestEntries(section)

    if (entries.length === 0) {
      return {
        success: true,
        processedCount: 0,
        mappings: []
      }
    }

    if (entries.length > 50) {
      return {
        success: false,
        error: `Too many entries to process at once (${entries.length}). Maximum is 50.`,
        errorCode: 'VALIDATION_ERROR'
      }
    }

    const artistaEntries: JournalEntry[] = []
    const artistaImagenEntries: JournalEntry[] = []

    for (const entry of entries) {
      const [table] = entry.scopeKey.split(':')

      if (table === 'artista') {
        artistaEntries.push(entry)
      } else if (table === 'artistaImagen') {
        artistaImagenEntries.push(entry)
      } else {
        console.warn(`Unknown table in scopeKey: ${entry.scopeKey}`)
      }
    }

    const mappings: IdMapping[] = []

    await db.transaction(async (tx) => {
      for (const entry of artistaEntries) {
        const { payload, scopeKey } = entry
        const [, idStr] = scopeKey.split(':')

        if (payload.op === 'restore') {
          // Restores are UI-only compensating events — no DB action needed
          continue
        } else if (payload.op === 'unset') {
          if (idStr && !isTempId(idStr)) {
            await tx.delete(artista).where(eq(artista.id, Number(idStr)))
          }
        } else if (payload.op === 'set' || payload.op === 'patch') {
          const input = mapToArtistaInput(entry)

          if (isTempId(idStr || '')) {
            const [result] = await tx
              .insert(artista)
              .values({
                ...input,
                id: undefined
              })
              .returning()

            mappings.push(createIdMapping(idStr, result.id, 'artista'))
          } else if (idStr) {
            await tx
              .update(artista)
              .set(input)
              .where(eq(artista.id, Number(idStr)))
          }
        }
      }

      for (const entry of artistaImagenEntries) {
        const { payload, scopeKey } = entry
        const [, idStr] = scopeKey.split(':')

        if (payload.op === 'restore') {
          continue
        } else if (payload.op === 'unset') {
          if (idStr && !isTempId(idStr)) {
            await tx
              .delete(artistaImagen)
              .where(eq(artistaImagen.id, Number(idStr)))
          }
        } else if (payload.op === 'set' || payload.op === 'patch') {
          const input = mapToArtistaImagenInput(entry)

          let resolvedArtistaId = input.artistaId
          const artistaIdStr = String(input.artistaId)
          if (isTempId(artistaIdStr)) {
            const mapping = mappings.find((m) => m.tempId === artistaIdStr)
            if (mapping) {
              resolvedArtistaId = mapping.realId
            } else {
              throw new Error(
                `Cannot resolve temp artistaId: ${input.artistaId}`
              )
            }
          }

          if (isTempId(idStr || '')) {
            const [result] = await tx
              .insert(artistaImagen)
              .values({
                ...input,
                artistaId: resolvedArtistaId,
                id: undefined
              })
              .returning()

            mappings.push(createIdMapping(idStr, result.id, 'artista'))
          } else if (idStr) {
            await tx
              .update(artistaImagen)
              .set({
                ...input,
                artistaId: resolvedArtistaId
              })
              .where(eq(artistaImagen.id, Number(idStr)))
          }
        }
      }
    })

    await clearSection(section)

    await revalidateTag('server-action', 'artista')

    return {
      success: true,
      processedCount: entries.length,
      mappings
    }
  } catch (error) {
    console.error('Error saving artista section:', error)

    let errorCode: SaveResult['errorCode'] = 'UNKNOWN'
    if (error instanceof Error) {
      if (error.name === 'ZodError') {
        errorCode = 'VALIDATION_ERROR'
      } else if (error.message.includes('database')) {
        errorCode = 'DB_ERROR'
      } else if (error.message.includes('network')) {
        errorCode = 'NETWORK_ERROR'
      }
    }

    return {
      success: false,
      error:
        error instanceof Error
          ? error.message
          : 'Unknown error saving artista section',
      errorCode
    }
  }
}
