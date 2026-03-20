import { SearchParamsProps } from 'src/shared/types/query-params'
import { ArtistListContainer } from './_components/artist-list-container'
import { agrupateHistory } from './_lib/aggregate-history'
import { getHistoryData } from './_lib/get-artist-history'
import { getArtistFilterOptions, getArtists } from './_lib/get-artists'
import { loadArtistQueryParams } from './_lib/search-params'

export default async function ArtistsListPage({
  searchParams
}: SearchParamsProps) {
  const params = await loadArtistQueryParams(searchParams)

  const [{ data, ...pagination }, history, filterOptions] = await Promise.all([
    getArtists(params),
    getHistoryData(),
    getArtistFilterOptions()
  ])
  const historyData = agrupateHistory(history)

  const enrichedArtist = data.map((artist) => ({
    ...artist,
    history: historyData[artist.id] || null
  }))

  return (
    <section className='h-full min-h-full space-y-6'>
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
        pagination={pagination}
      />
    </section>
  )
}
