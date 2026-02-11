'use client'

import { useCallback, useRef, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { CatalogFilters as CatalogFiltersComponent } from './catalog-filters'
import { CatalogTable } from './catalog-table'
import { CatalogPagination } from './catalog-pagination'
import { EditCatalogDialog } from './edit-catalog-dialog'
import { EditArtistDialog } from './edit-artist-dialog'
import type { CatalogArtist, PaginatedResult } from '../_types'
import { EmptyState } from '@/shared/components/empty-state'
import { Card } from '@/shared/components/ui/card'
import { useArtistaUI } from '../_hooks/use-artist-ui'
import { useCatalogView } from '../_hooks/use-catalog-view'
import { useArtistaUIStore } from '../_store/artist-ui-store'
import { saveCatalogBatch } from '../_actions/catalog.actions'
import { toast } from 'sonner'
import { GlobalSaveButton } from '@/shared/global-save'

interface CatalogArtistsContainerProps {
  initialData: PaginatedResult<CatalogArtist>
}

export function CatalogArtistsContainer({
  initialData
}: CatalogArtistsContainerProps) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const tableContainerRef = useRef<HTMLDivElement>(null)

  const { setRemoteData, hasUnsavedEdits } = useArtistaUI()
  const {
    setPage,
    setTotalPages,
    setTotalItems,
    setFilters,
    catalogDialogOpen,
    artistaDialogOpen,
    openCatalogDialog
  } = useCatalogView()

  // Initialize data
  useEffect(() => {
    setRemoteData(initialData.data)
    setPage(initialData.page)
    setTotalPages(initialData.totalPages)
    setTotalItems(initialData.total)
  }, [initialData, setRemoteData, setPage, setTotalPages, setTotalItems])

  // Handle URL sync
  const handleFiltersChange = useCallback(
    (newFilters: {
      activo?: boolean
      destacado?: boolean
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

      // Reset page when filtering
      params.delete('page')

      router.push(`?${params.toString()}`, { scroll: false })
    },
    [router, searchParams]
  )

  const handlePageChange = useCallback(
    (newPage: number) => {
      const params = new URLSearchParams(searchParams.toString())
      params.set('page', newPage.toString())
      router.push(`?${params.toString()}`, { scroll: false })
    },
    [router, searchParams]
  )

  const handleSave = useCallback(async () => {
    const currentEdits =
      useArtistaUIStore.getState().currentEdits?.operations || []
    if (currentEdits.length === 0) return

    // Group updates by ID
    const updates: Record<number, Partial<CatalogArtist>> = {}

    for (const op of currentEdits) {
      if (op.type === 'UPDATE' && op.data) {
        const id = Number(op.id)
        updates[id] = { ...updates[id], ...op.data }
      }
    }

    // Call server action
    const result = await saveCatalogBatch(updates)

    if (result.success) {
      toast.success('Cambios guardados correctamente')
      // Clear L3 edits since they are now applied on server
      useArtistaUIStore.getState().clearCurrentEdits()
    } else {
      toast.error(result.error || 'Error al guardar')
    }
  }, [])

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

        {hasUnsavedEdits && (
          <GlobalSaveButton
            hasChanges={hasUnsavedEdits}
            onSave={handleSave}
            isSaving={false} // We could track saving state if we want
          />
        )}
      </div>

      {isEmpty ? (
        <EmptyState
          title='No se encontraron artistas'
          description='No hay artistas que coincidan con los filtros seleccionados.'
          action={{
            label: 'Limpiar filtros',
            onClick: () => {
              setFilters({
                activo: undefined,
                destacado: undefined,
                search: ''
              })
              handleFiltersChange({
                activo: undefined,
                destacado: undefined,
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
      <EditCatalogDialog open={catalogDialogOpen} />

      {/* Dialog Nivel 2: Artista (stacked) */}
      <EditArtistDialog open={artistaDialogOpen} />
    </div>
  )
}
