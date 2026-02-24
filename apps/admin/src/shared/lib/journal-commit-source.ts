/**
 * journal-commit-source.ts - Connector: Change Journal → CommitSource contract
 *
 * Adapts the change-journal module to the CommitSource interface.
 * Lives in shared/lib/ as glue code between decoupled modules.
 *
 * Mapping Rules:
 *   Journal op:'set' + isTempId(entityId) → CREATE
 *   Journal op:'set' + !isTempId(entityId) → UPDATE
 *   Journal op:'patch' + isTempId(entityId) → CREATE
 *   Journal op:'patch' + !isTempId(entityId) → UPDATE
 *   Journal op:'unset' → DELETE
 *   Journal op:'restore' → RESTORE
 *
 *   entityType = scopeKey.split(':')[0]
 *   entityId = scopeKey.split(':')[1]
 */

import {
  getLatestEntries,
  hasEntries,
  clearSection
} from '@/shared/change-journal/change-journal'
import { isTempId } from '@/shared/commit-system/lib/id-mapper'
import {
  COMMIT_OPERATION_TYPE,
  type CommitOperation,
  type CommitSource
} from '@/shared/commit-system/lib/types'
import type { JournalEntry } from '@/shared/change-journal/lib/types'

function mapJournalEntryToCommitOperation(
  entry: JournalEntry
): CommitOperation | null {
  console.log('[DEBUG-MAP] Mapping entry:', { scopeKey: entry.scopeKey, payload: JSON.stringify(entry.payload) })
  const [entityType, entityId] = entry.scopeKey.split(':')


  if (!entityType || !entityId) {
    console.warn(`Invalid scopeKey format: ${entry.scopeKey}`)
    return null
  }

  const { op } = entry.payload

  switch (op) {
    case 'unset':
      return {
        type: COMMIT_OPERATION_TYPE.DELETE,
        entityType,
        entityId
      }
    case 'restore':
      return {
        type: COMMIT_OPERATION_TYPE.RESTORE,
        entityType,
        entityId
      }
    case 'set':
    case 'patch': {
      const data = entry.payload.value as Record<string, unknown>
      const operationType = isTempId(entityId)
        ? COMMIT_OPERATION_TYPE.CREATE
        : COMMIT_OPERATION_TYPE.UPDATE

      return {
        type: operationType,
        entityType,
        entityId,
        data
      }
    }
  }
}

export const journalCommitSource: CommitSource = {
  async read(section: string): Promise<CommitOperation[]> {
    const entries = await getLatestEntries(section)
    const operations: CommitOperation[] = []

    for (const entry of entries) {
      const op = mapJournalEntryToCommitOperation(entry)
      if (op) {
        operations.push(op)
      }
    }

    return operations
  },

  async hasPending(section: string): Promise<boolean> {
    return hasEntries(section)
  },

  async clear(section: string): Promise<void> {
    await clearSection(section)
  }
}