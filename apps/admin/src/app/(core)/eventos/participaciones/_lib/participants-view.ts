import type {
  ComposedActividad,
  ComposedExposicion,
  ParticipacionesFilters,
  ParticipantListRow,
  ParticipantProjectionRow
} from '../_types'

export function getParticipantKey(
  artistaId: number | string | null,
  agrupacionId: number | string | null,
  bandaId?: number | string | null
): string {
  if (artistaId) {
    return `artista:${artistaId}`
  }

  if (agrupacionId) {
    return `agrupacion:${agrupacionId}`
  }

  return `banda:${bandaId}`
}

function createParticipantListRow(
  participant: ParticipantProjectionRow
): ParticipantListRow {
  return {
    id: participant.participationId,
    participationId: participant.participationId,
    edicionId: participant.edicionId,
    key: participant.key,
    displayName: participant.displayName,
    participantType: participant.participantType,
    artistaId: participant.artistaId,
    agrupacionId: participant.agrupacionId,
    bandaId: participant.bandaId,
    artistaNombre: participant.artistaNombre,
    artistaPseudonimo: participant.artistaPseudonimo,
    artistaFoto: participant.artistaFoto,
    artistaEstadoSlug: participant.artistaEstadoSlug,
    agrupacionNombre: participant.agrupacionNombre,
    bandaNombre: participant.bandaNombre,
    exposicion: null,
    actividades: []
  }
}

function getParticipantLabel(row: ParticipantListRow): string {
  return (
    row.artistaPseudonimo ||
    row.artistaNombre ||
    row.agrupacionNombre ||
    row.bandaNombre ||
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
  expositores: ComposedExposicion[],
  actividades: ComposedActividad[]
): ParticipantListRow[] {
  const rows = new Map<string, ParticipantListRow>()

  for (const expositor of expositores) {
    const key = getParticipantKey(
      expositor.artistaId,
      expositor.agrupacionId,
      expositor.bandaId
    )
    const displayName =
      expositor.artistaPseudonimo ||
      expositor.artistaNombre ||
      expositor.agrupacionNombre ||
      expositor.bandaNombre ||
      'Participante sin nombre'

    rows.set(key, {
      id: expositor.participacionId,
      participationId: expositor.participacionId,
      edicionId: expositor.edicionId,
      key,
      displayName,
      participantType: expositor.artistaId
        ? 'artista'
        : expositor.agrupacionId
          ? 'agrupacion'
          : 'banda',
      artistaId: expositor.artistaId,
      agrupacionId: expositor.agrupacionId,
      bandaId: expositor.bandaId,
      artistaNombre: expositor.artistaNombre ?? null,
      artistaPseudonimo: expositor.artistaPseudonimo ?? null,
      artistaFoto: expositor.artistaFoto ?? null,
      artistaEstadoSlug: expositor.artistaEstadoSlug ?? null,
      agrupacionNombre: expositor.agrupacionNombre ?? null,
      bandaNombre: expositor.bandaNombre ?? null,
      exposicion: expositor,
      actividades: []
    })
  }

  for (const actividad of actividades) {
    const key = getParticipantKey(
      actividad.artistaId,
      actividad.agrupacionId,
      actividad.bandaId
    )
    const existingRow = rows.get(key)

    if (existingRow) {
      existingRow.actividades.push(actividad)
      continue
    }

    const displayName =
      actividad.artistaPseudonimo ||
      actividad.artistaNombre ||
      actividad.agrupacionNombre ||
      actividad.bandaNombre ||
      'Participante sin nombre'

    rows.set(key, {
      id: actividad.participacionId,
      participationId: actividad.participacionId,
      edicionId: actividad.edicionId,
      key,
      displayName,
      participantType: actividad.artistaId
        ? 'artista'
        : actividad.agrupacionId
          ? 'agrupacion'
          : 'banda',
      artistaId: actividad.artistaId,
      agrupacionId: actividad.agrupacionId,
      bandaId: actividad.bandaId,
      artistaNombre: actividad.artistaNombre ?? null,
      artistaPseudonimo: actividad.artistaPseudonimo ?? null,
      artistaFoto: actividad.artistaFoto ?? null,
      artistaEstadoSlug: actividad.artistaEstadoSlug ?? null,
      agrupacionNombre: actividad.agrupacionNombre ?? null,
      bandaNombre: actividad.bandaNombre ?? null,
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
  expositores: ComposedExposicion[],
  actividades: ComposedActividad[]
): ParticipantListRow[] {
  const rows = new Map<string, ParticipantListRow>()

  for (const participant of participants) {
    rows.set(participant.key, createParticipantListRow(participant))
  }

  for (const expositor of expositores) {
    const key = getParticipantKey(
      expositor.artistaId,
      expositor.agrupacionId,
      expositor.bandaId
    )
    const existingRow = rows.get(key)

    if (!existingRow) {
      continue
    }

    existingRow.exposicion = expositor
  }

  for (const actividad of actividades) {
    const key = getParticipantKey(
      actividad.artistaId,
      actividad.agrupacionId,
      actividad.bandaId
    )
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
  filters: ParticipacionesFilters
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
      row.bandaNombre,
      row.exposicion?.disciplinaSlug,
      ...row.actividades.map((actividad) => actividad.tipoActividadSlug ?? '')
    ]
      .filter(Boolean)
      .join(' ')
      .toLowerCase()

    return participantText.includes(normalizedSearch)
  })
}
