'use client'

import { useEffect } from 'react'
import type { UseBoundStore, StoreApi } from 'zustand'
import type { UIProjectionState } from '@/shared/ui-state/ui-projection-engine'
import { useSectionDirtyStore } from '@/shared/lib/section-dirty-store'
import type { JournalEntity } from '@/shared/lib/database-entities'

/**
 * Suscribe el projection store de una entidad al dirty read model global.
 * Cuando el estado proyectado cambia, actualiza useSectionDirtyStore con
 * el veredicto net-change (hay cambios pendientes o no).
 *
 * No usar en entidades de solo lectura (e.g. ARTISTA_HISTORIAL).
 */
export function useDirtySync<T extends { id: string }>(
  projectionStore: UseBoundStore<StoreApi<UIProjectionState<T>>>,
  entity: JournalEntity
): void {
  useEffect(() => {
    return projectionStore.subscribe((state) => {
      const hasChanges = Object.values(state.byId).some(
        (e) => e.__meta.isNew || e.__meta.isUpdated || e.__meta.isDeleted
      )
      useSectionDirtyStore.getState().setDirty(entity, hasChanges)
    })
  }, [projectionStore, entity])
}
