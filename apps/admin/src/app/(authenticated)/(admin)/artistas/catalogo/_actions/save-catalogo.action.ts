'use server'

import { updateTag } from 'next/cache'
import { CATALOG_CACHE_TAG } from '../_constants'
import { ARTISTA_CACHE_TAG } from '../../_constants'
import { eq } from 'drizzle-orm'
import { db } from '@frijolmagico/database/orm'
import { artist } from '@frijolmagico/database/schema'
import { requireAuth } from '@/lib/auth/utils'
import {
  PUSH_OPERATION_TYPE,
  type PushOperation,
  type PushResult,
  type IdMapping
} from '@/shared/push/lib/types'
import type { JournalEntry } from '@/shared/change-journal/lib/types'
import {
  handleServerActionError,
  logServerError
} from '@/shared/push/lib/error-handler'
import { createIdMapping, isTempId } from '@/shared/push/lib/id-mapper'
import { mapToCatalogoArtistaInput } from '../_mappers/catalogo.mapper'
import type { CatalogoArtistaInput } from '../_schemas/catalogo.schema'
import { JOURNAL_ENTITIES } from '@/shared/lib/database-entities'
import { stripUndefined } from '@/shared/lib/utils'

function toJournalEntry(op: PushOperation): JournalEntry {
  const base = {
    entryId: crypto.randomUUID(),
    schemaVersion: 1,
    section: 'catalogo_artista',
    scopeKey: `${op.entityType}:${op.entityId}`,
    timestampMs: Date.now(),
    clientId: 'commit-system'
  }

  switch (op.type) {
    case PUSH_OPERATION_TYPE.CREATE:
    case PUSH_OPERATION_TYPE.UPDATE: {
      const { id: _tempId, ...cleanData } = op.data
      return { ...base, payload: { op: 'set' as const, value: cleanData } }
    }
    case PUSH_OPERATION_TYPE.DELETE:
      return { ...base, payload: { op: 'unset' as const } }
    case PUSH_OPERATION_TYPE.RESTORE:
      return { ...base, payload: { op: 'restore' as const } }
  }
}

export async function saveCatalogoAction(
  operations: PushOperation[]
): Promise<PushResult> {
  try {
    await requireAuth()

    if (operations.length === 0) {
      return { success: true, idMappings: [] }
    }

    const mappings: IdMapping[] = []

    await db.transaction(async (tx) => {
      for (const op of operations) {
        // NOTE: We can filter restore on the usePush?
        if (op.type === PUSH_OPERATION_TYPE.RESTORE) continue

        console.log(
          `Processing operation: ${op.type} on ${op.entityType} with ID ${op.entityId}`
        )
        const entry = toJournalEntry(op)
        console.log('Mapped journal entry:', entry)
        const input = mapToCatalogoArtistaInput(entry)
        console.log('Mapped input for DB operation:', input)

        if (isTempId(op.entityId)) {
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
          continue
        }

        if (op.type === PUSH_OPERATION_TYPE.DELETE) {
          await tx
            .delete(artist.catalogoArtista)
            .where(
              eq(artist.catalogoArtista.id, Number.parseInt(op.entityId, 10))
            )
        } else {
          await tx
            .update(artist.catalogoArtista)
            .set(stripUndefined(input))
            .where(
              eq(artist.catalogoArtista.id, Number.parseInt(op.entityId, 10))
            )
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
