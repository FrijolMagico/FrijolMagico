import type { SearchParamsProps } from '@/shared/types/search-params'
import { requireAuth } from '@/shared/lib/auth/utils'
import { CollectiveListContainer } from './_components/collective-list-container'
import { getActiveCollectives } from './_lib/get-active-collectives'
import { getCollectiveDetail } from './_lib/get-collective-detail'
import { getDeletedCollectives } from './_lib/get-deleted-collectives'
import { loadCollectiveQueryParams } from './_lib/search-params'
import { collectiveQueryParamsSchema } from './_schemas/query-params.schema'

export default async function CollectivesPage({
  searchParams
}: SearchParamsProps) {
  await requireAuth()

  const rawParams = await loadCollectiveQueryParams(searchParams)
  const params = collectiveQueryParamsSchema.parse(rawParams)

  const [activeCollectives, deletedCollectives] = await Promise.all([
    getActiveCollectives(params),
    getDeletedCollectives(params)
  ])

  const collectiveIds = activeCollectives.data.map(
    (collective) => collective.id
  )
  const { membersByCollectiveId, availableArtists } =
    await getCollectiveDetail(collectiveIds)

  return (
    <section className='h-full min-h-full space-y-6'>
      <header>
        <h1 className='text-foreground text-2xl font-bold'>Agrupaciones</h1>
        <p className='text-muted-foreground'>
          Gestioná agrupaciones artísticas y administrá sus integrantes desde un
          solo lugar.
        </p>
      </header>

      <CollectiveListContainer
        activeCollectives={activeCollectives}
        deletedCollectives={deletedCollectives}
        membersByCollectiveId={membersByCollectiveId}
        availableArtists={availableArtists}
      />
    </section>
  )
}
