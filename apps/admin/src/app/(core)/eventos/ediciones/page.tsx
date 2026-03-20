import type { SearchParamsProps } from '@/shared/types/query-params'
import { EdicionContainer } from './_components/edicion-container'
import { composeEditions } from './_lib/compose-editions'
import { getEditionDays } from './_lib/get-edition-days'
import { getEditions } from './_lib/get-editions'
import { getEventosLookup } from './_lib/get-eventos-lookup'
import { getPlaces } from './_lib/get-places'
import { loadEdicionSearchParams } from './_lib/search-params'

export default async function EdicionesPage({
  searchParams
}: SearchParamsProps) {
  const params = await loadEdicionSearchParams(searchParams)
  const editionsResult = await getEditions(params)
  const editionIds = editionsResult.data.map((edition) => edition.id)

  const [days, places, eventos] = await Promise.all([
    getEditionDays(editionIds),
    getPlaces(),
    getEventosLookup()
  ])

  const ediciones = composeEditions(editionsResult.data, days, places, eventos)

  return (
    <div className='space-y-6'>
      <div>
        <h1 className='text-foreground text-2xl font-bold'>Ediciones</h1>
        <p className='text-muted-foreground'>
          Gestiona las ediciones de los eventos.
        </p>
      </div>
      <EdicionContainer
        ediciones={ediciones}
        dias={days}
        lugares={places}
        eventos={eventos}
        pagination={{ ...editionsResult, data: ediciones }}
      />
    </div>
  )
}
