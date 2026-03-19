import type { RawAdminListSearchParams } from '@/shared/lib/admin-list-params'
import { parseAdminListParams } from '@/shared/lib/admin-list-params'
import {
  EDICION_LIST_FILTER_KEYS,
  type EdicionListQueryFilters
} from '@/shared/types/admin-list-filters'
import { EdicionContainer } from './_components/edicion-container'
import { getEdicionesData, getLugares } from './_lib/get-ediciones-data'

interface EdicionesPageProps {
  searchParams: Promise<RawAdminListSearchParams>
}

export default async function EdicionesPage({
  searchParams
}: EdicionesPageProps) {
  const rawSearchParams = await searchParams
  const query = parseAdminListParams<EdicionListQueryFilters>(rawSearchParams, {
    allowedFilters: [EDICION_LIST_FILTER_KEYS.EVENTO_ID]
  })

  const [result, lugares] = await Promise.all([
    getEdicionesData(query),
    getLugares()
  ])

  return (
    <div className='space-y-6'>
      <div>
        <h1 className='text-foreground text-2xl font-bold'>Ediciones</h1>
        <p className='text-muted-foreground'>
          Gestiona las ediciones de los eventos.
        </p>
      </div>
      <EdicionContainer
        ediciones={result.ediciones.data}
        dias={result.dias}
        lugares={lugares ?? []}
        eventos={result.eventos}
        pagination={result.ediciones}
        query={query}
      />
    </div>
  )
}
