'use server'

import { revalidateTag } from 'next/cache'
import { db } from '@frijolmagico/database/orm'
import { artist } from '@frijolmagico/database/schema'
import { eq } from 'drizzle-orm'
import { requireAuth } from '@/lib/auth/utils'
import { createIdMapping, isTempId } from '@/shared/commit-system/lib/id-mapper'
import type {
  CommitOperation,
  CommitResult,
  IdMapping
} from '@/shared/commit-system/lib/types'
import { COMMIT_OPERATION_TYPE } from '@/shared/commit-system/lib/types'
import {
  mapToArtistaInput,
  mapToArtistaImagenInput
} from '../_mappers/artista.mapper'
import type { JournalEntry } from '@/shared/change-journal/lib/types'

const { artista, artistaImagen } = artist

/**
 * Synthesize a JournalEntry from CommitOperation for mapper compatibility
 */
function toJournalEntry(op: CommitOperation): JournalEntry {
  const base = {
    entryId: crypto.randomUUID(),
    schemaVersion: 1,
    section: 'artista',
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

/**
 * Save artista section changes to database
 *
 * Receives CommitOperation[] and persists them to DB.
 * Handles both artista and artistaImagen tables in a single transaction.
 * Validates data via Zod schemas internally.
 */
export async function saveArtistaAction(
  operations: CommitOperation[]
): Promise<CommitResult> {
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

    const artistaOps: CommitOperation[] = []
    const artistaImagenOps: CommitOperation[] = []

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
        if (op.type === COMMIT_OPERATION_TYPE.RESTORE) {
          continue
        } else if (op.type === COMMIT_OPERATION_TYPE.DELETE) {
          if (!isTempId(op.entityId)) {
            await tx
              .delete(artista)
              .where(eq(artista.id, Number(op.entityId)))
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
              })
              .returning()

            mappings.push(createIdMapping(op.entityId, result.id, 'artista'))
          } else {
            await tx
              .update(artista)
              .set(input)
              .where(eq(artista.id, Number(op.entityId)))
          }
        }
      }

      for (const op of artistaImagenOps) {
        if (op.type === COMMIT_OPERATION_TYPE.RESTORE) {
          continue
        } else if (op.type === COMMIT_OPERATION_TYPE.DELETE) {
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
              })
              .returning()

            mappings.push(
              createIdMapping(op.entityId, result.id, 'artista')
            )
          } else {
            await tx
              .update(artistaImagen)
              .set({
                ...input,
                artistaId: resolvedArtistaId
              })
              .where(eq(artistaImagen.id, Number(op.entityId)))
          }
        }
      }
    })

    revalidateTag('server-action', 'artista')

    return {
      success: true,
      idMappings: mappings
    }
  } catch (error) {
    console.error('Error saving artista section:', error)

    return {
      success: false,
      errors: [
        {
          entityType: 'artista',
          entityId: 'unknown',
          message:
            error instanceof Error
              ? error.message
              : 'Unknown error saving artista section'
        }
      ]
    }
  }
}