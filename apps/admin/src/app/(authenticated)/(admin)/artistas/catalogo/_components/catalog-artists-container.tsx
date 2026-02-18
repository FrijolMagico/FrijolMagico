'use client'

import { useEffect } from 'react'
import { useDebouncedCallback } from 'use-debounce'
import { useRouter, useSearchParams } from 'next/navigation'
import { CatalogFilters as CatalogFiltersComponent } from './catalog-filters'
import { EditCatalogDialog } from './edit-catalog-dialog'
import { EditArtistDialog } from './edit-artist-dialog'
import { useSelectedArtist } from '../_hooks/use-selected-artist'
import { useCatalogViewStore } from '../_store/catalog-view-store'
import { useCatalogPaginationStore } from '../_store/catalog-pagination-store'
import { useArtistUIStore } from '../_store/artist-ui-store'
import { CatalogTableContainer } from './catalog-table-container'

import type { CatalogArtist, PaginatedResult } from '../_types'

interface CatalogArtistsContainerProps {
  initialData: PaginatedResult<CatalogArtist>
}

export function CatalogArtistsContainer({
  initialData
}: CatalogArtistsContainerProps) {
  const router = useRouter()
  const searchParams = useSearchParams()

  const setRemoteData = useArtistUIStore((s) => s.setRemoteData)

  const setFilters = useCatalogViewStore((s) => s.setFilters)
  const setPage = useCatalogPaginationStore((s) => s.setPage)
  const pageSize = useCatalogPaginationStore((s) => s.pageSize)
  const setTotalItems = useCatalogPaginationStore((s) => s.setTotalItems)

  const selectedArtist = useSelectedArtist()

  // Initialize data and sync state
  useEffect(() => {
    setRemoteData(initialData.data)
    setTotalItems(initialData.total)

    // Sync filters from URL to Store
    const activoParam = searchParams.get('activo')
    const destacadoParam = searchParams.get('destacado')
    const searchParam = searchParams.get('search')
    const pageParam = searchParams.get('page')

    setFilters({
      activo: activoParam === null ? null : activoParam === 'true',
      destacado: destacadoParam === null ? null : destacadoParam === 'true',
      search: searchParam || ''
    })

    if (pageParam) {
      setPage(Number(pageParam))
    }
  }, [
    initialData,
    setRemoteData,
    setTotalItems,
    pageSize,
    searchParams,
    setFilters,
    setPage
  ])

  // TODO: We need extract this logic to clean query params and also use nuqs
  // Handle URL sync
  const handleFiltersChange = useDebouncedCallback(
    (newFilters: {
      activo?: boolean | null
      destacado?: boolean | null
      search?: string
    }) => {
      const params = new URLSearchParams(searchParams.toString())

      if (newFilters.activo !== undefined) {
        if (newFilters.activo === null) params.delete('activo')
        else params.set('activo', String(newFilters.activo))
      }

      if (newFilters.destacado !== undefined) {
        if (newFilters.destacado === null) params.delete('destacado')
        else params.set('destacado', String(newFilters.destacado))
      }

      if (newFilters.search !== undefined) {
        if (!newFilters.search) params.delete('search')
        else params.set('search', newFilters.search)
      }

      router.push(`?${params.toString()}`, { scroll: false })
    },
    300
  )

  // TODO: Add "Save Changes" button in the UI, enabled when hasAppliedEdits (that means changes are applied to L2 - Journal/Draft persistense) ore something is true
  // const handleSave = useCallback(async () => {
  //   const currentEdits =
  //     useArtistaUIStore.getState().currentEdits?.operations || []
  //   if (currentEdits.length === 0) return
  //
  //   // Group updates by ID
  //   const updates: Record<number, Partial<CatalogArtist>> = {}
  //
  //   for (const op of currentEdits) {
  //     if (op.type === 'UPDATE' && op.data) {
  //       const id = Number(op.id)
  //       updates[id] = { ...updates[id], ...op.data }
  //     }
  //   }
  //
  //   // Call server action
  //   const result = await saveCatalogBatch(updates)
  //
  //   if (result.success) {
  //     toast.success('Cambios guardados correctamente')
  //     // Clear L3 edits since they are now applied on server
  //     useArtistaUIStore.getState().clearCurrentEdits()
  //   } else {
  //     toast.error(result.error || 'Error al guardar')
  //   }
  // }, [])

  return (
    <div className='space-y-4'>
      <div className='flex items-center justify-between'>
        <CatalogFiltersComponent onFiltersChange={handleFiltersChange} />
        {/* Here will be the "save Changes" button, disabled if there are no unsaved edits */}
      </div>

      <CatalogTableContainer handleFilersChange={handleFiltersChange} />

      {/* Dialog Nivel 1: Catálogo */}
      <EditCatalogDialog
        key={selectedArtist?.artistaId ?? 'closed'}
        artist={selectedArtist}
      />

      {/* Dialog Nivel 2: Artista (stacked) */}
      <EditArtistDialog
        key={`artist-${selectedArtist?.artistaId ?? 'closed'}`}
        artist={selectedArtist}
      />
    </div>
  )
}
