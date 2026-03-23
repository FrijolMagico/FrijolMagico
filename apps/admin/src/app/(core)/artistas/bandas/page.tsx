import type { SearchParamsProps } from '@/shared/types/query-params'
import { requireAuth } from '@/shared/lib/auth/utils'
import { BandListContainer } from './_components/band-list-container'
import { getActiveBands } from './_lib/get-active-bands'
import { getDeletedBands } from './_lib/get-deleted-bands'
import { loadBandQueryParams } from './_lib/search-params'
import { bandQueryParamsSchema } from './_schemas/query-params.schema'

export default async function BandasPage({ searchParams }: SearchParamsProps) {
  await requireAuth()

  const rawParams = await loadBandQueryParams(searchParams)
  const params = bandQueryParamsSchema.parse(rawParams)

  const [activeBands, deletedBands] = await Promise.all([
    getActiveBands(params),
    getDeletedBands(params)
  ])

  return (
    <section className='h-full min-h-full space-y-6'>
      <header>
        <h1 className='text-foreground text-2xl font-bold'>Bandas</h1>
        <p className='text-muted-foreground'>
          Administra las bandas registradas, su estado y su historial de
          eliminación.
        </p>
      </header>

      <BandListContainer
        activeBands={activeBands}
        deletedBands={deletedBands}
      />
    </section>
  )
}
