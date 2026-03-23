import { redirect } from 'next/navigation'

import type { SearchParamsProps } from '@/shared/types/search-params'
import type {
  EdicionOption,
  ParticipacionesViewData,
  ParticipantListRow,
  ParticipationStatus
} from './_types'
import { ParticipacionesContainer } from './_components/participaciones-container'
import { getActividadDetalles } from './_lib/data-access-layer/get-actividad-detalles'
import { getActividades } from './_lib/data-access-layer/get-actividades'
import { getEditionsLookup } from './_lib/data-access-layer/get-editions-lookup'
import { getExposiciones } from './_lib/data-access-layer/get-exposiciones'
import { getParticipacionesPaginated } from './_lib/data-access-layer/get-participaciones-paginated'
import { composeParticipaciones } from './_lib/compose-participaciones'
import { getEdicionIdFromSlugOrLatest } from './_lib/get-edicion-by-slug'
import { getActivityTypes as getActivityTypesLookup } from './_lib/get-activity-types'
import { getAdmissionModes as getAdmissionModesLookup } from './_lib/get-admission-modes'
import { getAgrupaciones as getAgrupacionesLookup } from './_lib/get-agrupaciones'
import { getArtistasLookup } from './_lib/get-artistas-lookup'
import { getBandsLookup } from './_lib/get-bands-lookup'
import { getDisciplinas as getDisciplinasLookup } from './_lib/get-disciplinas'
import { loadParticipacionesSearchParams } from './_lib/search-params'

export default async function ParticipacionesPage({
  searchParams
}: SearchParamsProps) {
  const params = await loadParticipacionesSearchParams(searchParams)
  const estado: ParticipationStatus | null = params.estado
  const ediciones: EdicionOption[] = await getEditionsLookup()
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

  const [
    participacionesResult,
    artistasLookup,
    agrupacionesLookup,
    bandsLookup
  ] = await Promise.all([
    getParticipacionesPaginated(edicion.id, {
      ...params,
      estado,
      edicionId: params.edicionId
    }),
    getArtistasLookup(),
    getAgrupacionesLookup(),
    getBandsLookup()
  ])

  const [disciplinasLookup, tiposActividadLookup, modosIngresoLookup] =
    await Promise.all([
      getDisciplinasLookup(),
      getActivityTypesLookup(),
      getAdmissionModesLookup()
    ])

  const participationIds = participacionesResult.data.map(
    (participacion) => participacion.id
  )

  const [exposiciones, actividades] =
    participationIds.length > 0
      ? await Promise.all([
          getExposiciones(participationIds),
          getActividades(participationIds)
        ])
      : [[], []]

  const actividadIds = actividades.map((actividad) => actividad.id)
  const detalles =
    actividadIds.length > 0 ? await getActividadDetalles(actividadIds) : []

  const participantes: ParticipantListRow[] = composeParticipaciones({
    participaciones: participacionesResult.data,
    exposiciones,
    actividades,
    detalles,
    artistasLookup,
    agrupacionesLookup,
    bandsLookup,
    disciplinasLookup,
    tiposActividadLookup,
    modosIngresoLookup
  })

  const data: ParticipacionesViewData = {
    ediciones,
    participantes,
    disciplinas: Array.from(disciplinasLookup.entries()).map(([id, slug]) => ({
      id,
      slug
    })),
    tiposActividad: Array.from(tiposActividadLookup.entries()).map(
      ([id, slug]) => ({
        id,
        slug
      })
    ),
    modosIngreso: Array.from(modosIngresoLookup.entries()).map(
      ([id, slug]) => ({
        id,
        slug
      })
    ),
    artistas: Array.from(artistasLookup.values()),
    agrupaciones: Array.from(agrupacionesLookup.values()),
    bandas: Array.from(bandsLookup.values())
  }

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
        edicionId={edicion.id}
        pagination={{
          page: participacionesResult.page,
          pageSize: participacionesResult.pageSize,
          total: participacionesResult.total
        }}
      />
    </article>
  )
}
