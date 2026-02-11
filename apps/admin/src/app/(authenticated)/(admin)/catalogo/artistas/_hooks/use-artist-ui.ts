import { useCallback, useMemo } from 'react'
import { useShallow } from 'zustand/react/shallow'
import { useArtistaUIStore } from '../_store/artist-ui-store'
import { generateKeyBetween } from 'fractional-indexing'
import { useCatalogViewStore } from '../_store/catalog-view-store'
import { CatalogArtist } from '../_types'

export function useArtistaUI() {
  const startDrag = useCatalogViewStore((s) => s.startDrag)
  const endDrag = useCatalogViewStore((s) => s.endDrag)

  const store = useArtistaUIStore()
  const { remoteData, appliedChanges, currentEdits } = useArtistaUIStore(
    useShallow((s) => ({
      remoteData: s.remoteData,
      appliedChanges: s.appliedChanges,
      currentEdits: s.currentEdits
    }))
  )

  const artistas = useMemo(() => {
    const effectiveData = store.getEffectiveData()
    return effectiveData.ids
      .map((id) => effectiveData.entities[id])
      .filter(Boolean)
      .sort((a, b) => {
        if (a.orden < b.orden) return -1
        if (a.orden > b.orden) return 1
        return 0
      })
  }, [remoteData, appliedChanges, currentEdits, store])

  const reorder = useCallback(
    (newOrder: CatalogArtist[], draggedArtistaId: number) => {
      // Find the dragged item in the new visual order provided by DnD
      const draggedNewIndex = newOrder.findIndex(
        (item) => item.artistaId === draggedArtistaId
      )
      if (draggedNewIndex === -1) return

      // Get neighbors in the new order
      const prevItem = newOrder[draggedNewIndex - 1]
      const nextItem = newOrder[draggedNewIndex + 1]

      const prevOrder = prevItem?.orden ?? null
      const nextOrder = nextItem?.orden ?? null

      // Generate new key
      let newOrden: string
      try {
        newOrden = generateKeyBetween(prevOrder, nextOrder)
      } catch (e) {
        console.error('Error generating key', e)
        // Fallback
        if (!prevOrder && nextOrder) newOrden = nextOrder + 'Z'
        else if (prevOrder && !nextOrder) newOrden = prevOrder + 'm'
        else newOrden = 'a0'
      }

      // Only update if the order actually changed
      // We get the current entity state directly from store to verify
      const currentEntity = useArtistaUIStore
        .getState()
        .selectById(String(draggedArtistaId))

      if (currentEntity && newOrden !== currentEntity.orden) {
        useArtistaUIStore
          .getState()
          .updateOne(String(draggedArtistaId), { orden: newOrden })
      }
    },
    []
  )

  const handleDragStart = useCallback(
    (id: number) => {
      startDrag(id)
    },
    [startDrag]
  )

  const handleDragEnd = useCallback(() => {
    endDrag()
  }, [endDrag])

  return {
    // Selectors
    artistas,
    hasChanges: useArtistaUIStore(useShallow((s) => s.getHasChanges())),
    hasUnsavedEdits: useArtistaUIStore(
      useShallow((s) => s.getHasUnsavedEdits())
    ),

    // Actions
    setRemoteData: useArtistaUIStore.getState().setRemoteData,
    addOne: useArtistaUIStore.getState().addOne,
    updateOne: useArtistaUIStore.getState().updateOne,
    removeOne: useArtistaUIStore.getState().removeOne,
    commitCurrentEdits: useArtistaUIStore.getState().commitCurrentEdits,
    reorder,

    // UI specific
    handleDragStart,
    handleDragEnd
  }
}

export function useVisibleArtists() {
  const page = useCatalogViewStore((s) => s.page)
  const pageSize = useCatalogViewStore((s) => s.pageSize)

  const store = useArtistaUIStore()
  const { remoteData, appliedChanges, currentEdits } = useArtistaUIStore(
    useShallow((s) => ({
      remoteData: s.remoteData,
      appliedChanges: s.appliedChanges,
      currentEdits: s.currentEdits
    }))
  )

  const visibleArtists = useMemo(() => {
    const effectiveData = store.getEffectiveData()
    const sorted = effectiveData.ids
      .map((id) => effectiveData.entities[id])
      .filter(Boolean)
      .sort((a, b) => {
        if (a.orden < b.orden) return -1
        if (a.orden > b.orden) return 1
        return 0
      })

    const startIndex = (page - 1) * pageSize
    const endIndex = startIndex + pageSize
    return sorted.slice(startIndex, endIndex)
  }, [remoteData, appliedChanges, currentEdits, page, pageSize, store])

  return visibleArtists
}

export function useArtistaById(id: number) {
  return useArtistaUIStore(useShallow((state) => state.selectById(String(id))))
}
