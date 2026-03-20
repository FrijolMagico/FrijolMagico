export type ParticipationStatus =
  | 'seleccionado'
  | 'confirmado'
  | 'desistido'
  | 'cancelado'
  | 'ausente'
  | 'completado'

const PARTICIPATION_STATUSES: readonly ParticipationStatus[] = [
  'seleccionado',
  'confirmado',
  'desistido',
  'cancelado',
  'ausente',
  'completado'
] as const

export function isParticipationStatus(
  value: string
): value is ParticipationStatus {
  return (PARTICIPATION_STATUSES as readonly string[]).includes(value)
}

// ExpositorEntry — represents a participante_exposicion row in UI state
export interface ExpositorEntry {
  id: string
  artistaId: string | null
  agrupacionId: string | null
  eventoEdicionId: string
  disciplinaId: string
  modoIngresoId: string
  puntaje: number | null
  estado: ParticipationStatus
  notas: string | null
  postulacionId: string | null
  participanteId: string | null
  createdAt: string
  updatedAt: string
  // Display enrichments (populated from join in _lib)
  artistaNombre?: string | null
  artistaPseudonimo?: string | null
  artistaFoto?: string | null
  artistaEstadoSlug?: string | null
  agrupacionNombre?: string | null
  disciplinaSlug?: string | null
  modoIngresoSlug?: string | null
}

// ActividadEntry — represents a participante_actividad row
export interface ActividadEntry {
  id: string
  artistaId: string | null
  agrupacionId: string | null
  eventoEdicionId: string
  tipoActividadId: string
  modoIngresoId: string
  puntaje: number | null
  estado: ParticipationStatus
  notas: string | null
  postulacionId: string | null
  participanteId: string | null
  createdAt: string
  updatedAt: string
  // Display enrichments
  artistaNombre?: string | null
  artistaPseudonimo?: string | null
  artistaFoto?: string | null
  artistaEstadoSlug?: string | null
  agrupacionNombre?: string | null
  tipoActividadSlug?: string | null
  modoIngresoSlug?: string | null
}

// ActividadDetallesEntry — represents an actividad row
export interface ActividadDetallesEntry {
  id: string
  participanteActividadId: string
  titulo: string | null
  descripcion: string | null
  duracionMinutos: number | null
  ubicacion: string | null
  horaInicio: string | null
  cupos: number | null
  createdAt: string
  updatedAt: string
}

// Lookup types for the UI
export interface EdicionOption {
  id: string
  nombre: string | null
  slug: string | null
  eventoNombre: string
}

export interface ParticipacionesFilters {
  search: string
  estado: ParticipationStatus | null
}

export interface ParticipantListRow {
  key: string
  artistaId: string | null
  agrupacionId: string | null
  artistaNombre: string | null
  artistaPseudonimo: string | null
  artistaFoto: string | null
  artistaEstadoSlug: string | null
  agrupacionNombre: string | null
  exposicion: ExpositorEntry | null
  actividades: ActividadEntry[]
}

export interface ParticipantProjectionRow {
  participationId: string
  key: string
  artistaId: string | null
  agrupacionId: string | null
  artistaNombre: string | null
  artistaPseudonimo: string | null
  artistaFoto: string | null
  artistaEstadoSlug: string | null
  agrupacionNombre: string | null
}
