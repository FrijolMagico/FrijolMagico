'use client'

import type { PaginatedResponse } from '@/shared/types/pagination'
import { ArtistListFilters } from './artist-list-filters'
import { ArtistListTable } from './artist-list-table'
import { UpdateArtistDialog } from './update-artist-dialog'
import { CreateArtistDialog } from './create-artist-dialog'
import { ArtistHistoryDialog } from './artist-history-dialog'
import type { Artist } from '../_schemas/artista.schema'
import { ArtistWithHistory } from '../_types/artist'
import { throttle, useQueryStates } from 'nuqs'
import { PaginationControls } from 'src/shared/components/pagination-controls'
import { EmptyState } from 'src/shared/components/empty-state'
import { artistQueryParams } from '../_lib/search-params'

interface ArtistListContainerProps {
  artists: ArtistWithHistory[]
  countries: string[]
  cities: string[]
  pagination: Omit<PaginatedResponse<Artist>, 'data'>
}

export function ArtistListContainer({
  artists,
  countries,
  cities,
  pagination
}: ArtistListContainerProps) {
  const [filters, setFilters] = useQueryStates(artistQueryParams, {
    shallow: false,
    limitUrlUpdates: throttle(500)
  })

  const handleClearFilters = () => {
    setFilters({
      page: 1,
      search: '',
      pais: null,
      ciudad: null,
      estado: null
    })
  }

  return (
    <article className='grid space-y-4'>
      <div className='flex items-center justify-between gap-4'>
        <CreateArtistDialog />
      </div>

      <ArtistListFilters
        countries={countries}
        cities={cities}
        filters={filters}
        setFilters={setFilters}
      />

      <PaginationControls
        {...pagination}
        onPageChange={(newPage) => setFilters({ page: newPage })}
        itemNoun='artistas'
      />

      {artists.length === 0 ? (
        <EmptyState
          title='No se encontraron artistas'
          description='No hay artistas que coincidan con los filtros seleccionados.'
          action={{
            label: 'Limpiar filtros',
            onClick: handleClearFilters
          }}
        />
      ) : (
        <ArtistListTable artists={artists} />
      )}

      <PaginationControls
        {...pagination}
        onPageChange={(newPage) => setFilters({ page: newPage })}
        itemNoun='artistas'
      />

      <UpdateArtistDialog />
      <ArtistHistoryDialog />
    </article>
  )
}
