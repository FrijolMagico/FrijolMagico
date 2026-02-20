import { useCallback, useMemo } from 'react'
import { generateKeyBetween } from 'fractional-indexing'
import { useCatalogViewStore } from '../_store/catalog-view-store'
import { useCatalogPaginationStore } from '../_store/catalog-pagination-store'
import type { CatalogArtist, CatalogEntry, CatalogFilters } from '../_types'
import { useShallow } from 'zustand/react/shallow'
import { ArtistEntry } from '../../_types'
import {
  useCatalogOperationStore,
  useCatalogProjectionStore
} from '../_store/catalog-ui-store'

export function mergeToCatalogArtist(
  catalog: CatalogEntry,
  artistEntities: Record<string, ArtistEntry>
): CatalogArtist | null {
  const artista = artistEntities[catalog.artistaId]
  if (!artista) return null

  return {
    ...catalog,
    nombre: artista.nombre,
    pseudonimo: artista.pseudonimo,
    correo: artista.correo,
    rrss: artista.rrss,
    ciudad: artista.ciudad,
    pais: artista.pais,
    participacionesIds: [] // TODO: traer lista de participaciones cuando se implemente el store correspondiente
  }
}

function filterArtists(
  artists: CatalogArtist[],
  filters: CatalogFilters
): CatalogArtist[] {
  return artists.filter((artist) => {
    if (filters.activo !== null && artist.activo !== filters.activo) {
      return false
    }

    if (filters.destacado !== null && artist.destacado !== filters.destacado) {
      return false
    }

    if (filters.search) {
      const term = filters.search.toLowerCase()
      const nombre = (artist.nombre || '').toLowerCase()
      const pseudonimo = (artist.pseudonimo || '').toLowerCase()
      if (!nombre.includes(term) && !pseudonimo.includes(term)) {
        return false
      }
    }

    return true
  })
}

function sortIdsByOrder(ids: string[]): string[] {
  return [...ids].sort((id, nextId) => {
    const currentOrder = useCatalogProjectionStore((s) => s.byId[id].orden)
    const nextOrder = useCatalogProjectionStore((s) => s.byId[nextId].orden)
    if (currentOrder && nextOrder) {
      if (currentOrder < nextOrder) return -1
      if (currentOrder > nextOrder) return 1
    }
    return 0
  })
}

// NOTE: THIS IS AN OLD IMPLEMENTATION, DO NOT CONSIDER

export function useArtistUI(allIds: string[]) {
  const startDrag = useCatalogViewStore((s) => s.startDrag)
  const endDrag = useCatalogViewStore((s) => s.endDrag)

  const update = useCatalogOperationStore((s) => s.update)

  const reorder = useCallback(
    (draggedArtistId: string, dropTargetId: string) => {
      if (!dropTargetId) return

      const sortedIds = sortIdsByOrder(allIds)

      const draggedNewIndex = sortedIds.findIndex(
        (id) => id === draggedArtistId
      )

      const dropTargetIndex = sortedIds.findIndex((id) => id === dropTargetId)

      if (draggedNewIndex === -1 || dropTargetIndex === -1) return

      const movingDown = draggedNewIndex < dropTargetIndex

      let prevItem: string | undefined
      let nextItem: string | undefined

      // NOTE: How we get work this login if we cant call a custom hook inside a callback?
      if (movingDown) {
        prevItem = useCatalogProjectionStore(
          (s) => s.byId[sortedIds[dropTargetIndex]]
        ).orden
        nextItem = sortedIds[dropTargetIndex + 1]
      } else {
        prevItem = sortedIds[dropTargetIndex - 1]
        nextItem = sortedIds[dropTargetIndex]
      }

      const prevOrder = prevItem?.orden ?? null
      const nextOrder = nextItem?.orden ?? null

      if (prevOrder && nextOrder && prevOrder >= nextOrder) {
        console.error('Invalid neighbor orden:', prevOrder, '>=', nextOrder)
        return
      }

      let newOrden: string

      try {
        newOrden = generateKeyBetween(prevOrder, nextOrder)
      } catch (e) {
        console.error('Error generating key', e)
        if (!prevOrder && nextOrder) newOrden = nextOrder + 'Z'
        else if (prevOrder && !nextOrder) newOrden = prevOrder + 'm'
        else newOrden = 'a0'
      }

      const draggedItem = sortedIds[draggedNewIndex]

      if (draggedItem && newOrden !== draggedItem.orden) {
        updateCatalogo(draggedItem.id, { orden: newOrden })
      }
    },
    [updateCatalogo]
  )

  const handleDragStart = useCallback(
    (id: string) => {
      startDrag(Number(id))
    },
    [startDrag]
  )

  const handleDragEnd = useCallback(() => {
    endDrag()
  }, [endDrag])

  return {
    reorder,
    handleDragStart,
    handleDragEnd
  }
}

export function useVisibleArtists(): {
  visibleArtists: CatalogArtist[]
  totalCount: number
} {
  const { entities: catalogoEntities, ids: catalogoIds } =
    useCatalogoArtistaUIStore(
      useShallow((s) => {
        const effective = s.getEffectiveData()
        return {
          entities: effective.entities,
          ids: effective.ids
        }
      })
    )

  const { entities: artistaEntities } = useArtistaUIStore(
    useShallow((s) => {
      const effective = s.getEffectiveData()
      return {
        entities: effective.entities
      }
    })
  )

  const filters = useCatalogViewStore((s) => s.filters)
  const page = useCatalogPaginationStore((s) => s.page)
  const pageSize = useCatalogPaginationStore((s) => s.pageSize)

  const allArtists = useMemo(
    () =>
      catalogoIds
        .map((id) => {
          const catalogo = catalogoEntities[id]
          if (!catalogo) return null
          return mergeToCatalogArtist(catalogo, artistaEntities)
        })
        .filter((a): a is CatalogArtist => a !== null),
    [catalogoEntities, catalogoIds, artistaEntities]
  )

  const filteredArtists = useMemo(
    () => filterArtists(allArtists, filters),
    [allArtists, filters]
  )

  const visibleArtists = useMemo(() => {
    const sorted = sortByOrden(filteredArtists)
    const startIndex = (page - 1) * pageSize
    return sorted.slice(startIndex, startIndex + pageSize)
  }, [filteredArtists, page, pageSize])

  return {
    visibleArtists,
    totalCount: filteredArtists.length
  }
}
