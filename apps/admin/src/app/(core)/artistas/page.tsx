import { ArtistListContainer } from './_components/artist-list-container'
import type { RawAdminListSearchParams } from '@/shared/lib/admin-list-params'
import { parseAdminListParams } from '@/shared/lib/admin-list-params'
import {
  ARTIST_LIST_FILTER_KEYS,
  type ArtistListQueryFilters
} from '@/shared/types/admin-list-filters'
import { getHistoryData } from './_lib/get-artist-history'
import { getArtistFilterOptions, getArtists } from './_lib/get-artists'
import { agrupateHistory } from './_lib/aggregate-history'

interface ArtistsListPageProps {
  searchParams: Promise<RawAdminListSearchParams>
}

export default async function ArtistsListPage({
  searchParams
}: ArtistsListPageProps) {
  const rawSearchParams = await searchParams
  const query = parseAdminListParams<ArtistListQueryFilters>(rawSearchParams, {
    allowedFilters: [
      ARTIST_LIST_FILTER_KEYS.COUNTRY,
      ARTIST_LIST_FILTER_KEYS.CITY,
      ARTIST_LIST_FILTER_KEYS.STATUS_ID
    ]
  })

  const [artistsResult, history, filterOptions] = await Promise.all([
    getArtists(query),
    getHistoryData(),
    getArtistFilterOptions()
  ])
  const historyData = agrupateHistory(history)

  const enrichedArtist = artistsResult.data.map((artist) => ({
    ...artist,
    history: historyData[artist.id] || null
  }))

  return (
    <article className='h-full min-h-full space-y-6'>
      <header>
        <h1 className='text-foreground text-2xl font-bold'>
          Lista de Artistas
        </h1>
        <p className='text-muted-foreground'>
          Listado completo de artistas registrados en el sistema. Desde aquí
          puedes gestionar la información básica de cada artista.
        </p>
      </header>
      <ArtistListContainer
        artists={enrichedArtist}
        countries={filterOptions.countries}
        cities={filterOptions.cities}
        pagination={artistsResult}
        query={query}
      />
    </article>
  )
}
