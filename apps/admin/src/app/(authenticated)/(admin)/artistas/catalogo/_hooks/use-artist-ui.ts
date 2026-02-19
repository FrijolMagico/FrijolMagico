import { useCallback, useMemo } from 'react'
import { useArtistaUIStore } from '../_store/artista-ui-store'
import { useCatalogoArtistaUIStore } from '../_store/catalogo-artista-ui-store'
import { generateKeyBetween } from 'fractional-indexing'
import { useCatalogViewStore } from '../_store/catalog-view-store'
import { useCatalogPaginationStore } from '../_store/catalog-pagination-store'
import type {
  Artista,
  CatalogArtist,
  CatalogFilters,
  CatalogoArtista
} from '../_types'
import { useShallow } from 'zustand/react/shallow'

export function mergeToCatalogArtist(
  catalogo: CatalogoArtista,
  artistaEntities: Record<string, Artista>
): CatalogArtist | null {
  const artista = artistaEntities[catalogo.artistaId]
  if (!artista) return null

  return {
    artistaId: catalogo.artistaId,
    nombre: artista.nombre,
    pseudonimo: artista.pseudonimo,
    slug: artista.slug,
    correo: artista.correo,
    rrss: artista.rrss,
    ciudad: artista.ciudad,
    pais: artista.pais,
    avatarUrl: artista.avatarUrl,
    catalogoId: catalogo.id,
    orden: catalogo.orden,
    destacado: catalogo.destacado,
    activo: catalogo.activo,
    descripcion: catalogo.descripcion,
    catalogoUpdatedAt: catalogo.catalogoUpdatedAt,
    participacionesCount: 0,
    ultimaEdicion: null
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

function sortByOrden(artists: CatalogArtist[]): CatalogArtist[] {
  return [...artists].sort((a, b) => {
    if (a.orden < b.orden) return -1
    if (a.orden > b.orden) return 1
    return 0
  })
}

function sortCatalogoByOrden(items: CatalogoArtista[]): CatalogoArtista[] {
  return [...items].sort((a, b) => {
    if (a.orden < b.orden) return -1
    if (a.orden > b.orden) return 1
    return 0
  })
}

export function useArtistUI() {
  const startDrag = useCatalogViewStore((s) => s.startDrag)
  const endDrag = useCatalogViewStore((s) => s.endDrag)

  const { updateOne: updateCatalogo } = useCatalogoArtistaUIStore.getState()

  const reorder = useCallback(
    (draggedArtistId: number, dropTargetId: number) => {
      if (!dropTargetId) return

      const allCatalogo = useCatalogoArtistaUIStore.getState().selectAll()
      const sorted = sortCatalogoByOrden(allCatalogo)

      const draggedNewIndex = sorted.findIndex(
        (item) => item.artistaId === draggedArtistId
      )
      const dropTargetIndex = sorted.findIndex(
        (item) => item.artistaId === dropTargetId
      )

      if (draggedNewIndex === -1 || dropTargetIndex === -1) return

      const movingDown = draggedNewIndex < dropTargetIndex

      let prevItem: CatalogoArtista | undefined
      let nextItem: CatalogoArtista | undefined

      if (movingDown) {
        prevItem = sorted[dropTargetIndex]
        nextItem = sorted[dropTargetIndex + 1]
      } else {
        prevItem = sorted[dropTargetIndex - 1]
        nextItem = sorted[dropTargetIndex]
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

      const draggedItem = sorted[draggedNewIndex]
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
