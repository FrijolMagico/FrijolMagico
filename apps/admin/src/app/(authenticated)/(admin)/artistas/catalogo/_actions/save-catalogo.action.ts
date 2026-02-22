'use server'

import { revalidateTag } from 'next/cache'
import { eq } from 'drizzle-orm'
import { db } from '@frijolmagico/database/orm'
import { artist } from '@frijolmagico/database/schema'
import { requireAuth } from '@/lib/auth/utils'
import { clearSection } from '@/shared/change-journal/change-journal'
import { getLatestEntries } from '@/shared/change-journal/change-journal'
import {
  sortOperations,
  validateOperations
} from '@/shared/commit-system/lib/operation-sorter'
import {
  handleServerActionError,
  logServerError
} from '@/shared/commit-system/lib/error-handler'
import { createIdMapping, isTempId } from '@/shared/commit-system/lib/id-mapper'
import { mapToCatalogoArtistaInput } from '../_mappers/catalogo.mapper'
import { JOURNAL_ENTITIES } from '@/shared/lib/database-entities'
import type { SaveResult, IdMapping } from '@/shared/commit-system/lib/types'

export async function saveCatalogo(
  section: typeof JOURNAL_ENTITIES.CATALOGO_ARTISTA
): Promise<SaveResult> {
  try {
    await requireAuth()

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

    const { deletes, updates, restores } = sortOperations(entries)
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

// --- NEW: CommitOperation[] based action ---

import {
  COMMIT_OPERATION_TYPE,
  type CommitOperation,
  type CommitResult
} from '@/shared/commit-system/lib/types'
import type { JournalEntry } from '@/shared/change-journal/lib/types'
import {
  sortCommitOperations,
  validateCommitOperations
} from '@/shared/commit-system/lib/operation-sorter'

function toJournalEntry(op: CommitOperation): JournalEntry {
  const base = {
    entryId: crypto.randomUUID(),
    schemaVersion: 1,
    section: 'catalogo_artista',
    scopeKey: `${op.entityType}:${op.entityId}`,
    timestampMs: Date.now(),
    clientId: 'commit-system'
  }

  switch (op.type) {
    case COMMIT_OPERATION_TYPE.CREATE:
    case COMMIT_OPERATION_TYPE.UPDATE:
      return { ...base, payload: { op: 'set' as const, value: op.data } }
    case COMMIT_OPERATION_TYPE.DELETE:
      return { ...base, payload: { op: 'unset' as const } }
    case COMMIT_OPERATION_TYPE.RESTORE:
      return { ...base, payload: { op: 'restore' as const } }
  }
}

export async function saveCatalogoAction(
  operations: CommitOperation[]
): Promise<CommitResult> {
  try {
    await requireAuth()

    if (operations.length === 0) {
      return { success: true, idMappings: [] }
    }

    const validation = validateCommitOperations(operations)
    if (!validation.valid) {
      return {
        success: false,
        errors: validation.errors.map((msg, idx) => ({
          entityType: 'catalogo_artista',
          entityId: `error-${idx}`,
          message: msg
        }))
      }
    }

    const sorted = sortCommitOperations(operations)
    const mappings: IdMapping[] = []

    await db.transaction(async (tx) => {
      for (const op of sorted) {
        if (op.type === COMMIT_OPERATION_TYPE.DELETE) {
          if (!isTempId(op.entityId)) {
            await tx
              .delete(artist.catalogoArtista)
              .where(
                eq(
                  artist.catalogoArtista.id,
                  Number.parseInt(op.entityId, 10)
                )
              )
          }
        } else if (op.type === COMMIT_OPERATION_TYPE.RESTORE) {
          continue
        } else {
          const entry = toJournalEntry(op)
          const input = mapToCatalogoArtistaInput(entry)

          if (input.id && !isTempId(op.entityId)) {
            await tx
              .update(artist.catalogoArtista)
              .set(input)
              .where(eq(artist.catalogoArtista.id, input.id))
          } else {
            const [inserted] = await tx
              .insert(artist.catalogoArtista)
              .values(input)
              .returning({ id: artist.catalogoArtista.id })

            if (inserted) {
              mappings.push(
                createIdMapping(
                  op.entityId,
                  inserted.id,
                  JOURNAL_ENTITIES.CATALOGO_ARTISTA
                )
              )
            }
          }
        }
      }
    })

    revalidateTag('catalogo', 'max')
    revalidateTag('artista', 'max')

    return {
      success: true,
      idMappings: mappings
    }
  } catch (error) {
    logServerError(error, 'saveCatalogoAction')
    const handled = handleServerActionError(error)
    return {
      success: false,
      errors: [
        {
          entityType: 'catalogo_artista',
          entityId: 'unknown',
          message: handled.userMessage
        }
      ]
    }
  }
}
