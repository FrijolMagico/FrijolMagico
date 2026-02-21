'use server'

import { revalidateTag } from 'next/cache'
import { eq } from 'drizzle-orm'
import { db } from '@frijolmagico/database/orm'
import { artist } from '@frijolmagico/database/schema'
import { clearSection } from '@/shared/change-journal/change-journal'
import { getLatestEntries } from '@/shared/commit-system/lib/journal-reader'
import {
  sortOperations,
  validateOperations
} from '@/shared/commit-system/lib/operation-sorter'
import {
  handleServerActionError,
  logServerError
} from '@/shared/commit-system/lib/error-handler'
import { createIdMapping, isTempId } from '@/shared/commit-system/lib/id-mapper'
import { mapToCatalogoArtistaInput } from '@/shared/commit-system/mappers/catalogo.mapper'
import { JOURNAL_ENTITIES } from '@/shared/lib/database-entities'
import type { SaveResult, IdMapping } from '@/shared/commit-system/lib/types'

export async function saveCatalogo(
  section: typeof JOURNAL_ENTITIES.CATALOGO_ARTISTA
): Promise<SaveResult> {
  try {
    const entries = await getLatestEntries(section)

    if (entries.length === 0) {
      return {
        success: true,
        mappings: [],
        processedCount: 0
      }
    }

    const validation = validateOperations(entries)
    if (!validation.valid) {
      return {
        success: false,
        error: `Operation validation failed: ${validation.errors.join(', ')}`,
        errorCode: 'VALIDATION_ERROR'
      }
    }

    const { deletes, updates, restores: _restores } = sortOperations(entries)
    const mappings: IdMapping[] = []

    await db.transaction(async (tx) => {
      for (const entry of deletes) {
        const entityId = entry.scopeKey.split(':')[1]
        if (!entityId || isTempId(entityId)) continue

        await tx
          .delete(artist.catalogoArtista)
          .where(eq(artist.catalogoArtista.id, Number.parseInt(entityId, 10)))
      }

      for (const entry of updates) {
        const input = mapToCatalogoArtistaInput(entry)
        const entityId = entry.scopeKey.split(':')[1]

        if (input.id && !isTempId(entityId || '')) {
          await tx
            .update(artist.catalogoArtista)
            .set(input)
            .where(eq(artist.catalogoArtista.id, input.id))
        } else {
          const [inserted] = await tx
            .insert(artist.catalogoArtista)
            .values(input)
            .returning({ id: artist.catalogoArtista.id })

          if (inserted && entityId) {
            mappings.push(
              createIdMapping(
                entityId,
                inserted.id,
                JOURNAL_ENTITIES.CATALOGO_ARTISTA
              )
            )
          }
        }
      }
    })

    await clearSection(section)

    revalidateTag('catalogo', 'max')
    revalidateTag('artista', 'max')

    return {
      success: true,
      mappings,
      processedCount: entries.length
    }
  } catch (error) {
    logServerError(error, 'saveCatalogo')
    const handled = handleServerActionError(error)
    return {
      success: false,
      error: handled.userMessage,
      errorCode: handled.errorCode as SaveResult['errorCode']
    }
  }
}
