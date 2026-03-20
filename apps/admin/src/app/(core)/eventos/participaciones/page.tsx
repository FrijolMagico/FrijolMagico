import { redirect } from 'next/navigation'

import { ParticipacionesContainer } from './_components/participaciones-container'
import {
  getEdicionIdFromSlugOrLatest,
  getParticipacionesData
} from './_lib/get-participaciones-data'
import { loadParticipacionesSearchParams } from './_lib/search-params'

interface PageSearchParams {
  [key: string]: string | string[] | undefined
}

interface ParticipacionesPageProps {
  searchParams: Promise<PageSearchParams>
}

export default async function ParticipacionesPage({
  searchParams
}: ParticipacionesPageProps) {
  const params = await loadParticipacionesSearchParams(searchParams)
  const edicionSlug = params.edicion ?? undefined
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
    ...params,
    edicionId: String(edicion.id)
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
      />
    </article>
  )
}
