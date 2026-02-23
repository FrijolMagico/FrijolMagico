'use client'

import { useEffect } from 'react'
import { useDebouncedCallback } from 'use-debounce'
import { useRouter, useSearchParams } from 'next/navigation'
import { useAutoCommit } from '@/shared/ui-state/operation-log/hooks/use-auto-commit'
import { CatalogFilters as CatalogFiltersComponent } from './catalog-filters'
import { EditCatalogDialog } from './edit-catalog-dialog'
import { EditArtistDialog } from './edit-artist-dialog'
import { useCatalogFilterStore } from '../_store/catalog-filter-store'
import { useCatalogPaginationStore } from '../_store/catalog-pagination-store'
import { useCatalogOperationStore } from '../_store/catalog-ui-store'
import { useArtistsOperationStore } from '../../_store/artista-ui-store'
import { CatalogTableContainer } from './catalog-table-container'

export function CatalogArtistsContainer() {
  const router = useRouter()
  const searchParams = useSearchParams()

  const setFilters = useCatalogFilterStore((s) => s.setFilters)
  const setPage = useCatalogPaginationStore((s) => s.setPage)
  const pageSize = useCatalogPaginationStore((s) => s.pageSize)

  useAutoCommit(useCatalogOperationStore)
  useAutoCommit(useArtistsOperationStore)

  useEffect(() => {
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
  }, [pageSize, searchParams, setFilters, setPage])

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

  return (
    <div className='space-y-4'>
      <div className='flex items-center justify-between'>
        <CatalogFiltersComponent onFiltersChange={handleFiltersChange} />
        {/* Here will be the "save Changes" button, disabled if there are no unsaved edits */}
      </div>

      <CatalogTableContainer handleFilersChange={handleFiltersChange} />

      {/* Dialog Nivel 1: Catálogo */}
      <EditCatalogDialog />

      {/* Dialog Nivel 2: Artista (stacked) */}
      <EditArtistDialog />
    </div>
  )
}
