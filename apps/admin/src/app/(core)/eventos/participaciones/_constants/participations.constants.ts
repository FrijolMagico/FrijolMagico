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

export const PARTICIPATION_STATUS_LABELS: Record<ParticipationStatus, string> =
  {
    seleccionado: 'Seleccionado',
    confirmado: 'Confirmado',
    desistido: 'Desistido',
    cancelado: 'Cancelado',
    ausente: 'Ausente',
    completado: 'Completado'
  }

export const PARTICIPATION_STATUSES = Object.values(
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

export const PARTICIPANT_TYPE_LABELS: Record<ParticipantType, string> = {
  artista: 'Artista',
  agrupacion: 'Agrupación',
  banda: 'Banda'
}

export const DISCIPLINE_IDS = [1, 2, 3, 4] as const

export type DisciplineId = (typeof DISCIPLINE_IDS)[number]

export const DISCIPLINES: Record<string, DisciplineId> = {
  ILLUSTRATION: 1,
  GRAPHIC_NARRATIVE: 2,
  HANDCRAFTS: 3,
  PHOTOGRAPHY: 4
} as const

export const DISCIPLINE_LABELS: Record<DisciplineId, string> = {
  1: 'Ilustración',
  2: 'Narrativa Gráfica',
  3: 'Manualidades',
  4: 'Fotografía'
} as const

export const ACTIVITY_IDS = [1, 2, 3] as const

export type ActivityId = (typeof ACTIVITY_IDS)[number]

export const ACTIVITY_TYPES: Record<string, ActivityId> = {
  TALLER: 1,
  CHARLA: 2,
  MUSICA: 3
} as const

export const ACTIVITY_TYPE_LABELS: Record<ActivityId, string> = {
  1: 'Taller',
  2: 'Charla',
  3: 'Música'
}

export const ENTRY_MODE_IDS = [1, 2, 3] as const

export type EntryModeId = (typeof ENTRY_MODE_IDS)[number]

export const ENTRY_MODE_LABELS: Record<EntryModeId, string> = {
  1: 'Selección',
  2: 'Invitación',
  3: 'Suplencia'
}
