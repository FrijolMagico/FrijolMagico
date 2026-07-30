'use client'

import { useSyncExternalStore } from 'react'
import { useRouter } from 'next/navigation'

import { createCatalogAvatarQueueObserver } from '../_lib/catalog-avatar-queue-state'
import { getSharedAssetQueueStore } from '@/shared/assets-manager/client/shared-asset-queue'

export function useCatalogAvatarCompletionRefresh(
  entityId: string | number
): void {
  const router = useRouter()
  const store = getSharedAssetQueueStore()

  useSyncExternalStore(
    () => {
      const observer = createCatalogAvatarQueueObserver({
        entityId,
        store,
        onConfirmedPersistence: router.refresh
      })
      return observer.destroy
    },
    store.getState,
    store.getState
  )
}
