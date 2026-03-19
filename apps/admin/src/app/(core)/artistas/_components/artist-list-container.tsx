'use client'

import { usePathname, useRouter, useSearchParams } from 'next/navigation'
import type { ArtistListQueryFilters } from '@/shared/types/admin-list-filters'
import { buildAdminListUrl } from '@/shared/lib/admin-list-url'
import type {
  ListQueryParams,
  PaginatedResponse
} from '@/shared/types/pagination'
import { ArtistListFilters } from './artist-list-filters'
import { ArtistListPagination } from './artist-list-pagination'
import { ArtistListTable } from './artist-list-table'
import { UpdateArtistDialog } from './update-artist-dialog'
import { CreateArtistDialog } from './create-artist-dialog'
import { ArtistHistoryDialog } from './artist-history-dialog'
import type { Artist } from '../_schemas/artista.schema'
import { ArtistWithHistory } from '../_types/artist'

interface ArtistListContainerProps {
  artists: ArtistWithHistory[]
  countries: string[]
  cities: string[]
  pagination: PaginatedResponse<Artist>
  query: ListQueryParams<ArtistListQueryFilters>
}

export function ArtistListContainer({
  artists,
  countries,
  cities,
  pagination,
  query
}: ArtistListContainerProps) {
  const pathname = usePathname()
  const router = useRouter()
  const searchParams = useSearchParams()

  const filters = {
    search: query.search,
    country: query.filters.country ?? null,
    city: query.filters.city ?? null,
    statusId: query.filters.statusId ? Number(query.filters.statusId) : null
  }

  const replaceListUrl = (nextUrl: string) => {
    router.replace(`${pathname}${nextUrl}`, { scroll: false })
  }

  const handlePageChange = (newPage: number) => {
    replaceListUrl(buildAdminListUrl(searchParams, { page: newPage }))
  }

  const handleSearchChange = (search: string) => {
    replaceListUrl(
      buildAdminListUrl(searchParams, {
        page: 1,
        search
      })
    )
  }

  const handleCountryChange = (country: string | null) => {
    replaceListUrl(
      buildAdminListUrl(searchParams, {
        page: 1,
        filters: { country }
      })
    )
  }

  const handleCityChange = (city: string | null) => {
    replaceListUrl(
      buildAdminListUrl(searchParams, {
        page: 1,
        filters: { city }
      })
    )
  }

  const handleStatusChange = (statusId: number | null) => {
    replaceListUrl(
      buildAdminListUrl(searchParams, {
        page: 1,
        filters: { statusId }
      })
    )
  }

  const handleClearFilters = () => {
    replaceListUrl(
      buildAdminListUrl(searchParams, {
        page: 1,
        search: '',
        filters: {
          country: null,
          city: null,
          statusId: null
        }
      })
    )
  }

  return (
    <div className='grid space-y-4'>
      <div className='flex items-center justify-between gap-4'>
        <ArtistListFilters
          countries={countries}
          cities={cities}
          filters={filters}
          onSearchChange={handleSearchChange}
          onCountryChange={handleCountryChange}
          onCityChange={handleCityChange}
          onStatusChange={handleStatusChange}
          onClearFilters={handleClearFilters}
        />
        <CreateArtistDialog />
      </div>

      <ArtistListPagination
        page={pagination.page}
        pageSize={pagination.pageSize}
        onPageChange={handlePageChange}
        totalItems={pagination.total}
      />

      <ArtistListTable artists={artists} onClearFilters={handleClearFilters} />

      <ArtistListPagination
        page={pagination.page}
        pageSize={pagination.pageSize}
        onPageChange={handlePageChange}
        totalItems={pagination.total}
      />

      <UpdateArtistDialog />
      <ArtistHistoryDialog />
    </div>
  )
}
