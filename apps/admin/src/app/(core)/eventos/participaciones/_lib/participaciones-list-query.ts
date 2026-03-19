import type { ParticipacionesListQueryFilters } from '@/shared/types/admin-list-filters'
import type { ListQueryParams } from '@/shared/types/pagination'
import type { ParticipationStatus } from '../_types'

export interface ParticipacionesListQuery {
  page: number
  pageSize: number
  search: string
  edicionId: string | null
  estado: ParticipationStatus | null
}

export const DEFAULT_PARTICIPACIONES_LIST_PARAMS: ListQueryParams<ParticipacionesListQueryFilters> =
  {
    page: 1,
    pageSize: 25,
    search: '',
    filters: {}
  }

function normalizeNullableString(value: string | undefined): string | null {
  const normalizedValue = value?.trim() ?? ''
  return normalizedValue ? normalizedValue : null
}

function normalizeParticipationStatus(
  value: string | undefined
): ParticipationStatus | null {
  const normalizedValue = normalizeNullableString(value)

  if (!normalizedValue) {
    return null
  }

  switch (normalizedValue) {
    case 'seleccionado':
    case 'confirmado':
    case 'desistido':
    case 'cancelado':
    case 'ausente':
    case 'completado':
      return normalizedValue
    default:
      return null
  }
}

export function normalizeParticipacionesListQuery(
  params: ListQueryParams<ParticipacionesListQueryFilters> = DEFAULT_PARTICIPACIONES_LIST_PARAMS
): ParticipacionesListQuery {
  return {
    page: Math.max(1, params.page),
    pageSize: Math.max(1, params.pageSize),
    search: params.search.trim(),
    edicionId: normalizeNullableString(params.filters.edicionId),
    estado: normalizeParticipationStatus(params.filters.estado)
  }
}
