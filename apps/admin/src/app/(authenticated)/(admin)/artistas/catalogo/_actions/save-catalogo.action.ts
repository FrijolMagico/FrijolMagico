'use server'

import { updateTag } from 'next/cache'
import { CATALOG_CACHE_TAG } from '../_constants'
import { ARTISTA_CACHE_TAG } from '../../_constants'
import { eq } from 'drizzle-orm'
import { db } from '@frijolmagico/database/orm'
import { artist } from '@frijolmagico/database/schema'
import { requireAuth } from '@/lib/auth/utils'
import {
  COMMIT_OPERATION_TYPE,
  type CommitOperation,
  type CommitResult,
  type IdMapping
} from '@/shared/commit-system/lib/types'
import type { JournalEntry } from '@/shared/change-journal/lib/types'
import {
  sortCommitOperations,
  validateCommitOperations
} from '@/shared/commit-system/lib/operation-sorter'
import {
  handleServerActionError,
  logServerError
} from '@/shared/commit-system/lib/error-handler'
import { createIdMapping, isTempId } from '@/shared/commit-system/lib/id-mapper'
import { mapToCatalogoArtistaInput } from '../_mappers/catalogo.mapper'
import type { CatalogoArtistaInput } from '../_schemas/catalogo.schema'
import { JOURNAL_ENTITIES } from '@/shared/lib/database-entities'
import { stripUndefined } from '@/shared/lib/utils'

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
    case COMMIT_OPERATION_TYPE.UPDATE: {
      const { id: _tempId, ...cleanData } = op.data
      return { ...base, payload: { op: 'set' as const, value: cleanData } }
    }
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
                eq(artist.catalogoArtista.id, Number.parseInt(op.entityId, 10))
              )
          }
        } else if (op.type === COMMIT_OPERATION_TYPE.RESTORE) {
          continue
        } else {
          const entry = toJournalEntry(op)
          const input = mapToCatalogoArtistaInput(entry)

          if (!isTempId(op.entityId)) {
            await tx
              .update(artist.catalogoArtista)
              .set(stripUndefined(input))
              .where(eq(artist.catalogoArtista.id, Number.parseInt(op.entityId, 10)))
          } else {
            const [inserted] = await tx
              .insert(artist.catalogoArtista)
              .values(input as CatalogoArtistaInput)
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

    updateTag(CATALOG_CACHE_TAG)
    updateTag(ARTISTA_CACHE_TAG)


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
