import type {
  ActividadEntry,
  ExpositorEntry,
  ParticipantListRow,
  ParticipantProjectionRow
} from '../_types'

export interface ParticipantListFilters {
  search: string
  estado: string | null
}

export function getParticipantKey(
  artistaId: string | null,
  agrupacionId: string | null
): string {
  return artistaId ? `artista:${artistaId}` : `agrupacion:${agrupacionId}`
}

function createParticipantListRow(
  participant: ParticipantProjectionRow
): ParticipantListRow {
  return {
    key: participant.key,
    artistaId: participant.artistaId,
    agrupacionId: participant.agrupacionId,
    artistaNombre: participant.artistaNombre,
    artistaPseudonimo: participant.artistaPseudonimo,
    artistaFoto: participant.artistaFoto,
    artistaEstadoSlug: participant.artistaEstadoSlug,
    agrupacionNombre: participant.agrupacionNombre,
    exposicion: null,
    actividades: []
  }
}

function getParticipantLabel(row: ParticipantListRow): string {
  return (
    row.artistaPseudonimo ||
    row.artistaNombre ||
    row.agrupacionNombre ||
    'Participante sin nombre'
  )
}

function getParticipantStatus(row: ParticipantListRow): string | null {
  if (row.exposicion) {
    return row.exposicion.estado
  }

  return row.actividades[0]?.estado ?? null
}

export function buildParticipantRows(
  expositores: ExpositorEntry[],
  actividades: ActividadEntry[]
): ParticipantListRow[] {
  const rows = new Map<string, ParticipantListRow>()

  for (const expositor of expositores) {
    const key = getParticipantKey(expositor.artistaId, expositor.agrupacionId)

    rows.set(key, {
      key,
      artistaId: expositor.artistaId,
      agrupacionId: expositor.agrupacionId,
      artistaNombre: expositor.artistaNombre ?? null,
      artistaPseudonimo: expositor.artistaPseudonimo ?? null,
      artistaFoto: expositor.artistaFoto ?? null,
      artistaEstadoSlug: expositor.artistaEstadoSlug ?? null,
      agrupacionNombre: expositor.agrupacionNombre ?? null,
      exposicion: expositor,
      actividades: []
    })
  }

  for (const actividad of actividades) {
    const key = getParticipantKey(actividad.artistaId, actividad.agrupacionId)
    const existingRow = rows.get(key)

    if (existingRow) {
      existingRow.actividades.push(actividad)
      continue
    }

    rows.set(key, {
      key,
      artistaId: actividad.artistaId,
      agrupacionId: actividad.agrupacionId,
      artistaNombre: actividad.artistaNombre ?? null,
      artistaPseudonimo: actividad.artistaPseudonimo ?? null,
      artistaFoto: actividad.artistaFoto ?? null,
      artistaEstadoSlug: actividad.artistaEstadoSlug ?? null,
      agrupacionNombre: actividad.agrupacionNombre ?? null,
      exposicion: null,
      actividades: [actividad]
    })
  }

  return Array.from(rows.values()).sort((left, right) =>
    getParticipantLabel(left).localeCompare(getParticipantLabel(right))
  )
}

export function buildParticipantRowsFromProjection(
  participants: ParticipantProjectionRow[],
  expositores: ExpositorEntry[],
  actividades: ActividadEntry[]
): ParticipantListRow[] {
  const rows = new Map<string, ParticipantListRow>()

  for (const participant of participants) {
    rows.set(participant.key, createParticipantListRow(participant))
  }

  for (const expositor of expositores) {
    const key = getParticipantKey(expositor.artistaId, expositor.agrupacionId)
    const existingRow = rows.get(key)

    if (!existingRow) {
      continue
    }

    existingRow.exposicion = expositor
  }

  for (const actividad of actividades) {
    const key = getParticipantKey(actividad.artistaId, actividad.agrupacionId)
    const existingRow = rows.get(key)

    if (!existingRow) {
      continue
    }

    existingRow.actividades.push(actividad)
  }

  return participants
    .map((participant) => rows.get(participant.key))
    .filter((row): row is ParticipantListRow => row !== undefined)
}

export function filterParticipantRows(
  rows: ParticipantListRow[],
  filters: ParticipantListFilters
): ParticipantListRow[] {
  const normalizedSearch = filters.search.trim().toLowerCase()

  return rows.filter((row) => {
    if (filters.estado && getParticipantStatus(row) !== filters.estado) {
      return false
    }

    if (!normalizedSearch) {
      return true
    }

    const participantText = [
      row.artistaPseudonimo,
      row.artistaNombre,
      row.agrupacionNombre,
      row.exposicion?.disciplinaSlug,
      ...row.actividades.map((actividad) => actividad.tipoActividadSlug ?? '')
    ]
      .filter(Boolean)
      .join(' ')
      .toLowerCase()

    return participantText.includes(normalizedSearch)
  })
}
