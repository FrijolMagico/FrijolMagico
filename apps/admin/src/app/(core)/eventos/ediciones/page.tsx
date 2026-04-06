import type { SearchParamsProps } from '@/shared/types/search-params'
import { EditionsContainer } from './_components/edition-container'
import { getEditionDays } from './_lib/data-access-layer/get-edition-days'
import { getEditions } from './_lib/data-access-layer/get-editions'
import { getEventosLookup } from './_lib/data-access-layer/get-eventos-lookup'
import { getPlaces } from './_lib/data-access-layer/get-places'
import { composeEditions } from './_lib/compose-editions'
import { loadEdicionSearchParams } from './_lib/search-params'

export default async function EdicionesPage({
  searchParams
}: SearchParamsProps) {
  const params = await loadEdicionSearchParams(searchParams)
  const editionsResult = await getEditions(params)
  const editionIds = editionsResult.data.map((edition) => edition.id)

  const [days, places, events] = await Promise.all([
    getEditionDays(editionIds),
    getPlaces(),
    getEventosLookup()
  ])

  const editions = composeEditions(editionsResult.data, days, places, events)

  return (
    <div className='space-y-6'>
      <div>
        <h1 className='text-foreground text-2xl font-bold'>Ediciones</h1>
        <p className='text-muted-foreground'>
          Gestiona las ediciones de los eventos.
        </p>
      </div>
      <EditionsContainer
        editions={editions}
        days={days}
        places={places}
        events={events}
        pagination={{ ...editionsResult, data: editions }}
      />
    </div>
  )
}
