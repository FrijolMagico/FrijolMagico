import { redirect } from 'next/navigation'
import type { RawAdminListSearchParams } from '@/shared/lib/admin-list-params'
import { parseAdminListParams } from '@/shared/lib/admin-list-params'
import {
  PARTICIPACIONES_LIST_FILTER_KEYS,
  type ParticipacionesListQueryFilters
} from '@/shared/types/admin-list-filters'

import {
  getEdicionIdFromSlugOrLatest,
  getParticipacionesData
} from './_lib/get-participaciones-data'
import { ParticipacionesContainer } from './_components/participaciones-container'

interface ParticipacionesPageProps {
  searchParams: Promise<RawAdminListSearchParams>
}

export default async function ParticipacionesPage({
  searchParams
}: ParticipacionesPageProps) {
  const rawSearchParams = await searchParams
  const edicionSlug =
    typeof rawSearchParams.edicion === 'string'
      ? rawSearchParams.edicion
      : Array.isArray(rawSearchParams.edicion)
        ? rawSearchParams.edicion[0]
        : undefined

  const query = parseAdminListParams<ParticipacionesListQueryFilters>(
    rawSearchParams,
    {
      defaultPageSize: 25,
      allowedFilters: [
        PARTICIPACIONES_LIST_FILTER_KEYS.EDICION_ID,
        PARTICIPACIONES_LIST_FILTER_KEYS.ESTADO
      ]
    }
  )

  const edicion = await getEdicionIdFromSlugOrLatest(edicionSlug)

  if (!edicion) {
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

  if (!edicionSlug) {
    redirect(
      `/eventos/participaciones?edicion=${edicion.slug ?? String(edicion.id)}`
    )
  }

  const data = await getParticipacionesData(edicion.id, {
    ...query,
    filters: {
      ...query.filters,
      edicionId: String(edicion.id)
    }
  })

  return (
    <article className='h-full min-h-full space-y-6'>
      <header>
        <h1 className='text-foreground text-2xl font-bold'>Participaciones</h1>
        <p className='text-muted-foreground'>
          Gestiona los participantes de las ediciones del evento.
        </p>
      </header>
      <ParticipacionesContainer
        data={data}
        edicionId={String(edicion.id)}
        query={{
          ...query,
          filters: {
            ...query.filters,
            edicionId: String(edicion.id)
          }
        }}
      />
    </article>
  )
}
