import { redirect } from 'next/navigation'
import { Suspense } from 'react'

import {
  getEdicionIdFromSlugOrLatest,
  getParticipacionesData
} from './_lib/get-participaciones-data'
import { ParticipacionesContainer } from './_components/participaciones-container'

interface ParticipacionesPageProps {
  searchParams: Promise<{ edicion?: string }>
}

export default async function ParticipacionesPage({
  searchParams
}: ParticipacionesPageProps) {
  const { edicion: edicionSlug } = await searchParams

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
    redirect(`/participaciones?edicion=${edicion.slug ?? String(edicion.id)}`)
  }

  const data = await getParticipacionesData(edicion.id)

  return (
    <article className='h-full min-h-full space-y-6'>
      <header>
        <h1 className='text-foreground text-2xl font-bold'>Participaciones</h1>
        <p className='text-muted-foreground'>
          Gestiona los participantes de las ediciones del evento.
        </p>
      </header>
      <Suspense fallback={<div>Cargando...</div>}>
        <ParticipacionesContainer data={data} edicionId={String(edicion.id)} />
      </Suspense>
    </article>
  )
}
