import type { SearchParamsProps } from '@/shared/types/search-params'
import { requireAuth } from '@/shared/lib/auth/utils'
import { AgrupacionListContainer } from './_components/agrupacion-list-container'
import { getActiveAgrupaciones } from './_lib/get-active-agrupaciones'
import { getDeletedAgrupaciones } from './_lib/get-deleted-agrupaciones'
import { loadAgrupacionQueryParams } from './_lib/search-params'
import { agrupacionQueryParamsSchema } from './_schemas/query-params.schema'

export default async function AgrupacionesPage({
  searchParams
}: SearchParamsProps) {
  await requireAuth()

  const rawParams = await loadAgrupacionQueryParams(searchParams)
  const params = agrupacionQueryParamsSchema.parse(rawParams)

  const [activeAgrupaciones, deletedAgrupaciones] = await Promise.all([
    getActiveAgrupaciones(params),
    getDeletedAgrupaciones(params)
  ])

  return (
    <section className='h-full min-h-full space-y-6'>
      <header>
        <h1 className='text-foreground text-2xl font-bold'>Agrupaciones</h1>
        <p className='text-muted-foreground'>
          Gestioná agrupaciones artísticas y administrá sus integrantes desde un
          solo lugar.
        </p>
      </header>

      <AgrupacionListContainer
        activeAgrupaciones={activeAgrupaciones}
        deletedAgrupaciones={deletedAgrupaciones}
      />
    </section>
  )
}
