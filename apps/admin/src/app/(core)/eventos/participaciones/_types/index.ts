import type {
  Actividad as ActividadSchema,
  ActividadDetalle as ActividadDetalleSchema,
  Exposicion as ExposicionSchema
} from '../_schemas/participaciones.schema'

export const PARTICIPATION_STATUS = {
  SELECCIONADO: 'seleccionado',
  CONFIRMADO: 'confirmado',
  DESISTIDO: 'desistido',
  CANCELADO: 'cancelado',
  AUSENTE: 'ausente',
  COMPLETADO: 'completado'
} as const

export type ParticipationStatus =
  (typeof PARTICIPATION_STATUS)[keyof typeof PARTICIPATION_STATUS]

const PARTICIPATION_STATUSES = Object.values(
  PARTICIPATION_STATUS
) as ParticipationStatus[]

export function isParticipationStatus(
  value: string
): value is ParticipationStatus {
  return PARTICIPATION_STATUSES.includes(value as ParticipationStatus)
}

export const PARTICIPANT_TYPE = {
  ARTISTA: 'artista',
  AGRUPACION: 'agrupacion',
  BANDA: 'banda'
} as const

export type ParticipantType =
  (typeof PARTICIPANT_TYPE)[keyof typeof PARTICIPANT_TYPE]

export interface ParticipacionesFilters {
  search: string
  estado: ParticipationStatus | null
}

export interface ParticipantIdentity {
  artistaId: number | null
  agrupacionId: number | null
  bandaId: number | null
  artistaNombre: string | null
  artistaPseudonimo: string | null
  artistaFoto: string | null
  artistaEstadoSlug: string | null
  agrupacionNombre: string | null
  bandaNombre: string | null
}

export interface ParticipantProjectionRow extends ParticipantIdentity {
  participationId: number
  edicionId: number
  key: string
  displayName: string
  participantType: ParticipantType
}

export interface ComposedExposicion
  extends ExposicionSchema, ParticipantIdentity {
  edicionId: number
  disciplinaSlug: string | null
  modoIngresoSlug: string | null
}

export interface ComposedActividad
  extends ActividadSchema, ParticipantIdentity {
  edicionId: number
  tipoActividadSlug: string | null
  modoIngresoSlug: string | null
  detalle: ActividadDetalleSchema | null
}

export type ExpositorEntry = ComposedExposicion
export type ActividadEntry = ComposedActividad
export type ActividadDetallesEntry = ActividadDetalleSchema

export interface ParticipantListRow extends ParticipantProjectionRow {
  id: number
  exposicion: ComposedExposicion | null
  actividades: ComposedActividad[]
}

export interface EdicionOption {
  id: number
  nombre: string | null
  slug: string | null
  eventoNombre: string
}

export interface ArtistaLookup {
  id: number
  pseudonimo: string
  nombre: string | null
  estadoSlug: string
  fotoUrl: string | null
}

export interface AgrupacionLookup {
  id: number
  nombre: string
}

export interface BandLookup {
  id: number
  name: string
  email: string | null
  phone: string | null
  city: string | null
}

export interface CatalogOption {
  id: number
  slug: string
}

export interface ParticipacionesViewData {
  ediciones: EdicionOption[]
  participantes: ParticipantListRow[]
  disciplinas: CatalogOption[]
  tiposActividad: CatalogOption[]
  modosIngreso: CatalogOption[]
  artistas: ArtistaLookup[]
  agrupaciones: AgrupacionLookup[]
  bandas: BandLookup[]
}
