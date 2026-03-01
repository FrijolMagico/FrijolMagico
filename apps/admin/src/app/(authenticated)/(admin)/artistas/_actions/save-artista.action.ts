'use server'

import { updateTag } from 'next/cache'
import { ARTISTA_CACHE_TAG } from '../_constants'
import { db } from '@frijolmagico/database/orm'
import { artist } from '@frijolmagico/database/schema'
import { eq } from 'drizzle-orm'
import { requireAuth } from '@/lib/auth/utils'
import { createIdMapping, isTempId } from '@/shared/push/lib/id-mapper'
import type {
  PushOperation,
  PushResult,
  IdMapping
} from '@/shared/push/lib/types'
import { PUSH_OPERATION_TYPE } from '@/shared/push/lib/types'
import {
  mapToArtistaInput,
  mapToArtistaImagenInput
} from '../_mappers/artista.mapper'
import type {
  ArtistaInput,
  ArtistaImagenInput
} from '../_schemas/artista.schema'
import type { JournalEntry } from '@/shared/change-journal/lib/types'
import { stripUndefined } from '@/shared/lib/utils'
import {
  handleServerActionError,
  logServerError
} from '@/shared/push/lib/error-handler'

const { artista, artistaImagen } = artist

/**
 * Synthesize a JournalEntry from PushOperation for mapper compatibility
 */
function toJournalEntry(op: PushOperation): JournalEntry {
  const base = {
    entryId: crypto.randomUUID(),
    schemaVersion: 1,
    section: 'artista',
    scopeKey: `${op.entityType}:${op.entityId}`,
    timestampMs: Date.now(),
    clientId: 'commit-system'
  }

  switch (op.type) {
    case PUSH_OPERATION_TYPE.CREATE:
    // For CREATE, we want to preserve the full data object for mapping
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

/**
 * Save artista section changes to database
 *
 * Receives PushOperation[] and persists them to DB.
 * Handles both artista and artistaImagen tables in a single transaction.
 * Validates data via Zod schemas internally.
 */
export async function saveArtistaAction(
  operations: PushOperation[]
): Promise<PushResult> {
  try {
    await requireAuth()

    if (operations.length === 0) {
      return { success: true, idMappings: [] }
    }

    if (operations.length > 50) {
      return {
        success: false,
        errors: [
          {
            entityType: 'artista',
            entityId: 'batch',
            message: `Too many operations to process at once (${operations.length}). Maximum is 50.`
          }
        ]
      }
    }

    const artistaOps: PushOperation[] = []
    const artistaImagenOps: PushOperation[] = []

    for (const op of operations) {
      if (op.entityType === 'artista') {
        artistaOps.push(op)
      } else if (op.entityType === 'artistaImagen') {
        artistaImagenOps.push(op)
      }
    }

    const mappings: IdMapping[] = []

    await db.transaction(async (tx) => {
      for (const op of artistaOps) {
        if (op.type === PUSH_OPERATION_TYPE.RESTORE) {
          continue
        } else if (op.type === PUSH_OPERATION_TYPE.DELETE) {
          if (!isTempId(op.entityId)) {
            await tx.delete(artista).where(eq(artista.id, Number(op.entityId)))
          }
        } else {
          const entry = toJournalEntry(op)
          const input = mapToArtistaInput(entry)

          if (isTempId(op.entityId)) {
            const [result] = await tx
              .insert(artista)
              .values({
                ...input,
                id: undefined
              } as ArtistaInput)
              .returning()

            mappings.push(createIdMapping(op.entityId, result.id, 'artista'))
          } else {
            await tx
              .update(artista)
              .set(stripUndefined(input))
              .where(eq(artista.id, Number(op.entityId)))
          }
        }
      }

      for (const op of artistaImagenOps) {
        if (op.type === PUSH_OPERATION_TYPE.RESTORE) {
          continue
        } else if (op.type === PUSH_OPERATION_TYPE.DELETE) {
          if (!isTempId(op.entityId)) {
            await tx
              .delete(artistaImagen)
              .where(eq(artistaImagen.id, Number(op.entityId)))
          }
        } else {
          const entry = toJournalEntry(op)
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

          if (isTempId(op.entityId)) {
            const [result] = await tx
              .insert(artistaImagen)
              .values({
                ...input,
                artistaId: resolvedArtistaId,
                id: undefined
              } as ArtistaImagenInput)
              .returning()

            mappings.push(createIdMapping(op.entityId, result.id, 'artista'))
          } else {
            await tx
              .update(artistaImagen)
              .set(
                stripUndefined({
                  ...input,
                  artistaId: resolvedArtistaId
                })
              )
              .where(eq(artistaImagen.id, Number(op.entityId)))
          }
        }
      }
    })

    updateTag(ARTISTA_CACHE_TAG)

    return {
      success: true,
      idMappings: mappings
    }
  } catch (error) {
    logServerError(error, 'saveArtistaAction')
    const handled = handleServerActionError(error)
    return {
      success: false,
      errors: [
        {
          entityType: 'artista',
          entityId: 'unknown',
          message: handled.userMessage
        }
      ]
    }
  }
}
