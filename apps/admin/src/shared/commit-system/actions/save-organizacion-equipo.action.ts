/**
 * @fileoverview save-organizacion-equipo.action.ts - OrganizacionEquipo Persistence Server Action
 *
 * Orchestrates saving organizacion_equipo section journal entries to database.
 * Handles organizacion_equipo entity CRUD operations.
 *
 * Flow:
 * 1. Authenticate user session
 * 2. Read journal entries for 'organizacion_equipo' section
 * 3. Validate entries with mappers
 * 4. Sort operations (DELETE → UPDATE → CREATE)
 * 5. Execute in atomic transaction per batch
 * 6. Return mappings for temp IDs
 * 7. Clear journal only after complete success
 *
 * @connection mappers/organizacion.mapper.ts - Entry validation and mapping
 * @connection lib/batch-processor.ts - Batching with retry
 * @connection lib/operation-sorter.ts - Operation ordering
 * @connection lib/error-handler.ts - Error formatting for UI
 */

'use server'

import { db } from '@frijolmagico/database/orm'
import { core } from '@frijolmagico/database/schema'
import { eq } from 'drizzle-orm'

const { organizacionEquipo } = core

import { requireAuth } from '@/lib/auth/utils'
import { revalidateTag } from 'next/cache'
import { clearSection } from '@/shared/change-journal/change-journal'
import { JOURNAL_ENTITIES } from '@/shared/lib/database-entities'
import { getLatestEntries } from '../lib/journal-reader'
import { sortOperations, validateOperations } from '../lib/operation-sorter'
import { processBatches } from '../lib/batch-processor'
import { handleServerActionError, logServerError } from '../lib/error-handler'
import { createIdMapping, isTempId } from '../lib/id-mapper'
import { mapToOrganizacionEquipoInput } from '../mappers/organizacion.mapper'
import type { SaveResult, IdMapping } from '../lib/types'
import type { JournalEntry } from '@/shared/change-journal/lib/types'

/**
 * Save organizacion_equipo section changes to database
 *
 * @param section - Must be JOURNAL_ENTITIES.ORGANIZACION_EQUIPO ('organizacion_equipo')
 * @returns SaveResult with success, error info, and ID mappings
 *
 * @example
 * ```typescript
 * const result = await saveOrganizacionEquipo(JOURNAL_ENTITIES.ORGANIZACION_EQUIPO)
 * if (result.success) {
 *   console.log('Saved successfully', result.mappings)
 *   // Update UI State with mappings
 * } else {
 *   console.error(result.error)
 * }
 * ```
 */
export async function saveOrganizacionEquipo(
  section: typeof JOURNAL_ENTITIES.ORGANIZACION_EQUIPO
): Promise<SaveResult> {
  try {
    await requireAuth()

    const entries = await getLatestEntries(section)

    if (entries.length === 0) {
      return {
        success: true,
        processedCount: 0,
        mappings: []
      }
    }

    const validation = validateOperations(entries)
    if (!validation.valid) {
      logServerError(
        new Error(`Invalid operations: ${validation.errors.join(', ')}`),
        'saveOrganizacionEquipo'
      )
      return {
        success: false,
        error: validation.errors[0],
        errorCode: 'VALIDATION_ERROR'
      }
    }

    const { deletes, updates, restores: _restores } = sortOperations(entries)

    const allMappings: IdMapping[] = []

    const batchResult = await processBatches(
      entries,
      async (batch) => {
        return await db.transaction(async (tx) => {
          const batchMappings: IdMapping[] = []

          for (const entry of batch) {
            if (deletes.includes(entry)) {
              const entityId = extractEntityIdFromScopeKey(entry.scopeKey)
              if (entityId && !isTempId(entityId)) {
                await tx
                  .delete(organizacionEquipo)
                  .where(eq(organizacionEquipo.id, Number(entityId)))
              }
            } else if (updates.includes(entry)) {
              try {
                const input = mapToOrganizacionEquipoInput(entry)
                const entityId = extractEntityIdFromScopeKey(entry.scopeKey)

                if (entityId && !isTempId(entityId)) {
                  await tx
                    .update(organizacionEquipo)
                    .set({
                      organizacionId: input.organizacionId,
                      nombre: input.nombre,
                      cargo: input.cargo,
                      rrss: input.rrss
                    })
                    .where(eq(organizacionEquipo.id, Number(entityId)))
                } else {
                  const [inserted] = await tx
                    .insert(organizacionEquipo)
                    .values({
                      organizacionId: input.organizacionId,
                      nombre: input.nombre,
                      cargo: input.cargo,
                      rrss: input.rrss
                    })
                    .returning({ id: organizacionEquipo.id })

                  if (entityId && isTempId(entityId) && inserted) {
                    batchMappings.push(
                      createIdMapping(
                        entityId,
                        inserted.id,
                        'organizacion_equipo'
                      )
                    )
                  }
                }
              } catch (error) {
                logServerError(error, 'saveOrganizacionEquipo - processEquipo')
                throw error
              }
            }
          }

          return batchMappings
        })
      },
      { maxBatchSize: 50, maxRetries: 3, timeoutMs: 30000 }
    )

    if (!batchResult.success) {
      const firstError = batchResult.errors[0]
      const handled = handleServerActionError(firstError)
      return {
        success: false,
        error: handled.userMessage,
        errorCode: handled.errorCode as SaveResult['errorCode']
      }
    }

    await clearSection(section)

    revalidateTag('default', 'organizacion-equipo')

    return {
      success: true,
      mappings: allMappings,
      processedCount: entries.length
    }
  } catch (error) {
    logServerError(error, 'saveOrganizacionEquipo')
    const handled = handleServerActionError(error)
    return {
      success: false,
      error: handled.userMessage,
      errorCode: handled.errorCode as SaveResult['errorCode']
    }
  }
}

/**
 * Extract entity ID from scopeKey
 * Format: "organizacion_equipo:entityId" or "organizacion_equipo:entityId:field"
 */
function extractEntityIdFromScopeKey(scopeKey: string): string | null {
  const parts = scopeKey.split(':')
  return parts[1] || null
}
