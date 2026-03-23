'use client'

import { debounce, useQueryStates } from 'nuqs'
import type { PaginationParams } from '@/shared/types/pagination'
import type {
  CatalogAvailableArtist,
  CatalogListItem
} from '../_types/catalog-list-item'
import { CatalogFilters } from './catalog-filters'
import { CreateCatalogDialog } from './create-catalog-dialog'
import { UpdateCatalogDialog } from './update-catalog-dialog'
import { catalogQueryParams } from '../_lib/search-params'
import { CatalogTable } from './catalog-table'
import { PaginationControls } from '@/shared/components/pagination-controls'
import { EmptyState } from '@/shared/components/empty-state'

interface CatalogContainerProps {
  catalog: CatalogListItem[]
  availableArtists: CatalogAvailableArtist[]
  pagination: PaginationParams
}

export function CatalogContainer({
  catalog,
  availableArtists,
  pagination
}: CatalogContainerProps) {
  const [filters, setFilters] = useQueryStates(catalogQueryParams, {
    shallow: false,
    limitUrlUpdates: debounce(300)
  })

  const handleClearFilters = () => {
    void setFilters({
      page: 1,
      search: '',
      activo: null,
      destacado: null
    })
  }

  return (
    <div className='grid space-y-4'>
      <div className='flex items-center justify-between'>
        <CatalogFilters filters={filters} setFilters={setFilters} />
        <CreateCatalogDialog availableArtists={availableArtists} />
      </div>

      <PaginationControls
        {...pagination}
        onPageChange={(newPage) => setFilters({ page: newPage })}
        itemNoun='artistas'
      />

      {catalog.length === 0 ? (
        <EmptyState
          title='No se encontrron artistas en el catálogo'
          description='No hay artistas que coincidan con los filtros aplicados. Intenta ajustar los filtros para encontrar artistas.'
          action={{
            label: 'Limpiar filtros',
            onClick: handleClearFilters
          }}
        />
      ) : (
        <CatalogTable items={catalog} onClearFilters={handleClearFilters} />
      )}

      <PaginationControls
        {...pagination}
        onPageChange={(newPage) => setFilters({ page: newPage })}
        itemNoun='artistas'
      />

      <UpdateCatalogDialog />
    </div>
  )
}
