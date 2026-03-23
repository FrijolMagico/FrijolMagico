import type {
  Actividad,
  ActividadDetalle,
  Exposicion,
  Participacion
} from '../_schemas/participaciones.schema'
import type {
  BandLookup,
  ComposedActividad,
  ComposedExposicion,
  ParticipantType,
  ParticipantListRow
} from '../_types'
import type { AgrupacionLookup } from './get-agrupaciones'
import type { ArtistaLookup } from './get-artistas-lookup'
import { getParticipantKey } from './participants-view'

function getParticipantLabel(row: ParticipantListRow): string {
  return (
    row.artistaPseudonimo ||
    row.artistaNombre ||
    row.agrupacionNombre ||
    row.bandaNombre ||
    'Participante sin nombre'
  )
}

function buildExposicionEntry(params: {
  participacion: Participacion
  exposicion: Exposicion
  artista: ArtistaLookup | undefined
  agrupacion: AgrupacionLookup | undefined
  banda: BandLookup | undefined
  disciplinasLookup: Map<number, string>
  modosIngresoLookup: Map<number, string>
}): ComposedExposicion {
  const { participacion, exposicion, artista, agrupacion, banda } = params

  return {
    ...exposicion,
    edicionId: participacion.edicionId,
    artistaId: participacion.artistaId,
    agrupacionId: participacion.agrupacionId,
    bandaId: participacion.bandaId,
    artistaNombre: artista?.nombre ?? null,
    artistaPseudonimo: artista?.pseudonimo ?? null,
    artistaFoto: artista?.fotoUrl ?? null,
    artistaEstadoSlug: artista?.estadoSlug ?? null,
    agrupacionNombre: agrupacion?.nombre ?? null,
    bandaNombre: banda?.name ?? null,
    disciplinaSlug:
      params.disciplinasLookup.get(exposicion.disciplinaId) ?? null,
    modoIngresoSlug:
      params.modosIngresoLookup.get(exposicion.modoIngresoId) ?? null
  }
}

function buildActividadEntry(params: {
  participacion: Participacion
  actividad: Actividad
  detalle: ActividadDetalle | undefined
  artista: ArtistaLookup | undefined
  agrupacion: AgrupacionLookup | undefined
  banda: BandLookup | undefined
  tiposActividadLookup: Map<number, string>
  modosIngresoLookup: Map<number, string>
}): ComposedActividad {
  const { participacion, actividad, detalle, artista, agrupacion, banda } =
    params

  return {
    ...actividad,
    edicionId: participacion.edicionId,
    artistaId: participacion.artistaId,
    agrupacionId: participacion.agrupacionId,
    bandaId: participacion.bandaId,
    artistaNombre: artista?.nombre ?? null,
    artistaPseudonimo: artista?.pseudonimo ?? null,
    artistaFoto: artista?.fotoUrl ?? null,
    artistaEstadoSlug: artista?.estadoSlug ?? null,
    agrupacionNombre: agrupacion?.nombre ?? null,
    bandaNombre: banda?.name ?? null,
    tipoActividadSlug:
      params.tiposActividadLookup.get(actividad.tipoActividadId) ?? null,
    modoIngresoSlug:
      params.modosIngresoLookup.get(actividad.modoIngresoId) ?? null,
    detalle: detalle ?? null
  }
}

export function composeParticipaciones(params: {
  participaciones: Participacion[]
  exposiciones: Exposicion[]
  actividades: Actividad[]
  detalles: ActividadDetalle[]
  artistasLookup: Map<number, ArtistaLookup>
  agrupacionesLookup: Map<number, AgrupacionLookup>
  bandsLookup: Map<number, BandLookup>
  disciplinasLookup: Map<number, string>
  tiposActividadLookup: Map<number, string>
  modosIngresoLookup: Map<number, string>
}): ParticipantListRow[] {
  const exposicionesByParticipationId = new Map<number, Exposicion>()
  const actividadesByParticipationId = new Map<number, Actividad[]>()
  const detallesByActividadId = new Map<number, ActividadDetalle>()

  for (const exposicion of params.exposiciones) {
    exposicionesByParticipationId.set(exposicion.participacionId, exposicion)
  }

  for (const actividad of params.actividades) {
    const actividadList =
      actividadesByParticipationId.get(actividad.participacionId) ?? []

    actividadList.push(actividad)
    actividadesByParticipationId.set(actividad.participacionId, actividadList)
  }

  for (const detalle of params.detalles) {
    detallesByActividadId.set(detalle.participacionActividadId, detalle)
  }

  const rows = params.participaciones.map((participacion) => {
    const artista = participacion.artistaId
      ? params.artistasLookup.get(participacion.artistaId)
      : undefined
    const agrupacion = participacion.agrupacionId
      ? params.agrupacionesLookup.get(participacion.agrupacionId)
      : undefined
    const banda = participacion.bandaId
      ? params.bandsLookup.get(participacion.bandaId)
      : undefined
    const exposicion = exposicionesByParticipationId.get(participacion.id)
    const actividades = actividadesByParticipationId.get(participacion.id) ?? []
    const displayName =
      artista?.pseudonimo ||
      artista?.nombre ||
      agrupacion?.nombre ||
      banda?.name ||
      'Participante sin nombre'
    const participantType: ParticipantType = participacion.artistaId
      ? 'artista'
      : participacion.agrupacionId
        ? 'agrupacion'
        : 'banda'

    return {
      id: participacion.id,
      participationId: participacion.id,
      edicionId: participacion.edicionId,
      key: getParticipantKey(
        participacion.artistaId,
        participacion.agrupacionId,
        participacion.bandaId
      ),
      displayName,
      participantType,
      artistaId: participacion.artistaId,
      agrupacionId: participacion.agrupacionId,
      bandaId: participacion.bandaId,
      artistaNombre: artista?.nombre ?? null,
      artistaPseudonimo: artista?.pseudonimo ?? null,
      artistaFoto: artista?.fotoUrl ?? null,
      artistaEstadoSlug: artista?.estadoSlug ?? null,
      agrupacionNombre: agrupacion?.nombre ?? null,
      bandaNombre: banda?.name ?? null,
      exposicion: exposicion
        ? buildExposicionEntry({
            participacion,
            exposicion,
            artista,
            agrupacion,
            banda,
            disciplinasLookup: params.disciplinasLookup,
            modosIngresoLookup: params.modosIngresoLookup
          })
        : null,
      actividades: actividades.map((actividad) =>
        buildActividadEntry({
          participacion,
          actividad,
          detalle: detallesByActividadId.get(actividad.id),
          artista,
          agrupacion,
          banda,
          tiposActividadLookup: params.tiposActividadLookup,
          modosIngresoLookup: params.modosIngresoLookup
        })
      )
    }
  })

  return rows.sort(
    (left, right) =>
      getParticipantLabel(left).localeCompare(getParticipantLabel(right)) ||
      left.key.localeCompare(right.key)
  )
}
