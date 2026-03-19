'use client'

import { usePathname, useRouter, useSearchParams } from 'next/navigation'
import { buildAdminListUrl } from '@/shared/lib/admin-list-url'
import type { CatalogListQueryFilters } from '@/shared/types/admin-list-filters'
import type {
  ListQueryParams,
  PaginatedResponse
} from '@/shared/types/pagination'
import type {
  CatalogAvailableArtist,
  CatalogListItem
} from '../_types/catalog-list-item'
import { CatalogFilters } from './catalog-filters'
import { CatalogTableContainer } from './catalog-table-container'
import { CreateCatalogDialog } from './create-catalog-dialog'
import { UpdateCatalogDialog } from './update-catalog-dialog'

interface CatalogContainerProps {
  catalog: CatalogListItem[]
  availableArtists: CatalogAvailableArtist[]
  pagination: PaginatedResponse<CatalogListItem>
  query: ListQueryParams<CatalogListQueryFilters>
}

export function CatalogContainer({
  catalog,
  availableArtists,
  pagination,
  query
}: CatalogContainerProps) {
  const pathname = usePathname()
  const router = useRouter()
  const searchParams = useSearchParams()

  const filters = {
    search: query.search,
    activo:
      query.filters.activo === 'true'
        ? true
        : query.filters.activo === 'false'
          ? false
          : null,
    destacado:
      query.filters.destacado === 'true'
        ? true
        : query.filters.destacado === 'false'
          ? false
          : null
  }
  const hasActiveFilters =
    filters.search !== '' ||
    filters.activo !== null ||
    filters.destacado !== null
  const canReorder = !hasActiveFilters && pagination.page === 1

  const replaceListUrl = (nextUrl: string) => {
    router.replace(`${pathname}${nextUrl}`, { scroll: false })
  }

  const handlePageChange = (page: number) => {
    replaceListUrl(buildAdminListUrl(searchParams, { page }))
  }

  const handleSearchChange = (search: string) => {
    replaceListUrl(buildAdminListUrl(searchParams, { page: 1, search }))
  }

  const handleActivoChange = (activo: boolean | null) => {
    replaceListUrl(
      buildAdminListUrl(searchParams, {
        page: 1,
        filters: { activo }
      })
    )
  }

  const handleDestacadoChange = (destacado: boolean | null) => {
    replaceListUrl(
      buildAdminListUrl(searchParams, {
        page: 1,
        filters: { destacado }
      })
    )
  }

  const handleClearFilters = () => {
    replaceListUrl(
      buildAdminListUrl(searchParams, {
        page: 1,
        search: '',
        filters: { activo: null, destacado: null }
      })
    )
  }

  return (
    <div className='grid space-y-4'>
      <div className='flex items-center justify-between'>
        <CatalogFilters
          filters={filters}
          onSearchChange={handleSearchChange}
          onActivoChange={handleActivoChange}
          onDestacadoChange={handleDestacadoChange}
          onClearFilters={handleClearFilters}
        />
        <CreateCatalogDialog availableArtists={availableArtists} />
      </div>

      <CatalogTableContainer
        catalog={catalog}
        pagination={pagination}
        onPageChange={handlePageChange}
        onClearFilters={handleClearFilters}
        canReorder={canReorder}
      />

      <UpdateCatalogDialog />
    </div>
  )
}
