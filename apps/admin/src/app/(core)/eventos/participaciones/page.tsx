import type { SearchParamsProps } from '@/shared/types/search-params'
import { ParticipationsContainer } from './_components/participations-container'
import { getActivitiesWithDetails } from './_lib/data-access-layer/get-activities-with-details'
import { getEditionsLookup } from './_lib/data-access-layer/get-editions-lookup'
import { getExhibitions } from './_lib/data-access-layer/get-exhibitions'
import { getParticipations } from './_lib/data-access-layer/get-participations'
import { composeParticipations } from './_lib/participation-composer'
import { getCollectivesLookup } from './_lib/data-access-layer/get-collectives-lookup'
import { getArtistsLookup } from './_lib/data-access-layer/get-artists-lookup'
import { getBandsLookup } from './_lib/data-access-layer/get-bands-lookup'
import { loadParticipacionesSearchParams } from './_lib/search-params'
import { ParticipationsViewData } from './_types/participations.types'

export default async function ParticipationsPage({
  searchParams
}: SearchParamsProps) {
  const params = await loadParticipacionesSearchParams(searchParams)
  const editions = await getEditionsLookup()

  const edition = params.edicion
    ? editions.find((e) => e.slug === params.edicion)
    : editions[0]

  if (!edition) {
    return (
      <article className='h-full min-h-full space-y-6'>
        <header>
          <h1 className='text-foreground text-2xl font-bold'>
            Participaciones
          </h1>
        </header>
        <p className='text-muted-foreground'>No hay ediciones disponibles.</p>
      </article>
    )
  }

  const [participations, artists, collectives, bands] = await Promise.all([
    getParticipations(edition.id, params),
    getArtistsLookup(),
    getCollectivesLookup(),
    getBandsLookup()
  ])

  const participationIds = participations.map((p) => p.id)

  const [exhibitions, activities] = await Promise.all([
    getExhibitions(participationIds),
    getActivitiesWithDetails(participationIds)
  ])

  const participants = composeParticipations({
    participations: participations,
    edition,
    exhibitions,
    activities,
    artistsLookup: artists,
    collectivesLookup: collectives,
    bandsLookup: bands
  })

  const data: ParticipationsViewData = {
    edition: {
      participations: participants,
      ...edition
    },
    editions,
    artists: [...artists.values()],
    collectives: [...collectives.values()],
    bands: [...bands.values()]
  }

  return (
    <article className='h-full min-h-full space-y-6'>
      <header>
        <h1 className='text-foreground text-2xl font-bold'>Participaciones</h1>
        <p className='text-muted-foreground'>
          Gestiona los participantes de las ediciones del evento.
        </p>
      </header>
      <ParticipationsContainer data={data} />
    </article>
  )
}
