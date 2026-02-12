'use client'
import { useCallback, useRef, useEffect } from 'react'
import { useDebouncedCallback } from 'use-debounce'
import { useRouter, useSearchParams } from 'next/navigation'
import { CatalogFilters as CatalogFiltersComponent } from './catalog-filters'
import { CatalogTable } from './catalog-table'
import { CatalogPagination } from './catalog-pagination'
import { EditCatalogDialog } from './edit-catalog-dialog'
import { EditArtistDialog } from './edit-artist-dialog'
import type { CatalogArtist, PaginatedResult } from '../_types'
import { EmptyState } from '@/shared/components/empty-state'
import { Card } from '@/shared/components/ui/card'
import { useArtistUI } from '../_hooks/use-artist-ui'
import { useCatalogView } from '../_hooks/use-catalog-view'
import { useSelectedArtist } from '../_hooks/use-selected-artist'
// import { useArtistaUIStore } from '../_store/artist-ui-store'
// import { saveCatalogBatch } from '../_actions/catalog.actions'
// import { toast } from 'sonner'

interface CatalogArtistsContainerProps {
  initialData: PaginatedResult<CatalogArtist>
}

export function CatalogArtistsContainer({
  initialData
}: CatalogArtistsContainerProps) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const tableContainerRef = useRef<HTMLDivElement>(null)

  const { setRemoteData, hasUnsavedEdits } = useArtistUI()
  const {
    setPage,
    setTotalPages,
    setTotalItems,
    setFilters,
    catalogDialogOpen,
    artistDialogOpen,
    openCatalogDialog,
    pageSize
  } = useCatalogView()
  const selectedArtist = useSelectedArtist()

  // Initialize data and sync state
  useEffect(() => {
    setRemoteData(initialData.data)
    setTotalItems(initialData.total)
    // Calculate pages locally based on pageSize
    setTotalPages(Math.ceil(initialData.total / pageSize))

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
    setTotalPages,
    pageSize,
    searchParams,
    setFilters,
    setPage
  ])

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

      setPage(1)
      router.push(`?${params.toString()}`, { scroll: false })
    },
    300
  )

  const handlePageChange = useCallback(
    (newPage: number) => {
      setPage(newPage)
      const params = new URLSearchParams(searchParams.toString())
      if (newPage === 1) {
        params.delete('page')
      } else {
        params.set('page', String(newPage))
      }
      router.push(`?${params.toString()}`, { scroll: false })
    },
    [setPage, router, searchParams]
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

  const handleEdit = useCallback(
    (artista: CatalogArtist) => {
      openCatalogDialog(artista.artistaId)
    },
    [openCatalogDialog]
  )

  const isEmpty = initialData.data.length === 0

  return (
    <div className='space-y-4'>
      <div className='flex items-center justify-between'>
        <CatalogFiltersComponent onFiltersChange={handleFiltersChange} />
        {/* Here will be the "save Changes" button, disabled if there are no unsaved edits */}
      </div>

      {isEmpty ? (
        <EmptyState
          title='No se encontraron artistas'
          description='No hay artistas que coincidan con los filtros seleccionados.'
          action={{
            label: 'Limpiar filtros',
            onClick: () => {
              setFilters({
                activo: null,
                destacado: null,
                search: ''
              })
              handleFiltersChange({
                activo: null,
                destacado: null,
                search: ''
              })
            }
          }}
        />
      ) : (
        <>
          <CatalogPagination onPageChange={handlePageChange} />

          <Card ref={tableContainerRef} className='overflow-x-hidden'>
            <CatalogTable
              onEdit={handleEdit}
              containerRef={tableContainerRef}
              onPageChange={handlePageChange}
            />
          </Card>

          <CatalogPagination onPageChange={handlePageChange} />
        </>
      )}

      {/* Dialog Nivel 1: Catálogo */}
      <EditCatalogDialog
        key={selectedArtist?.artistaId ?? 'closed'}
        open={catalogDialogOpen}
        artist={selectedArtist}
      />

      {/* Dialog Nivel 2: Artista (stacked) */}
      <EditArtistDialog
        key={`artist-${selectedArtist?.artistaId ?? 'closed'}`}
        open={artistDialogOpen}
        artist={selectedArtist}
      />
    </div>
  )
}
