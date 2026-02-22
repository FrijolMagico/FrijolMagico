'use client'

import { useProjectionSync } from '@/shared/hooks/use-projection-sync'
import {
  useHistoryOperationStore,
  useHistoryProjectionStore
} from '../_store/history-ui-store'
import type { HistoryEntry } from '../_types'

export function HistoryStoreInitialization({
  initialData
}: {
  initialData: HistoryEntry[]
}) {
  useProjectionSync<HistoryEntry>({
    initialData,
    operationStore: useHistoryOperationStore,
    projectionStore: useHistoryProjectionStore
  })

  return null
}
