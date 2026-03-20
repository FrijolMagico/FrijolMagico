import {
  createLoader,
  parseAsInteger,
  parseAsString,
  parseAsStringLiteral
} from 'nuqs/server'

import { baseListParsers } from '@/shared/lib/list-parsers'

const participationStatusValues = [
  'seleccionado',
  'confirmado',
  'desistido',
  'cancelado',
  'ausente',
  'completado'
] as const

export const participacionesSearchParams = {
  ...baseListParsers,
  limit: parseAsInteger.withDefault(25),
  edicion: parseAsString,
  edicionId: parseAsString,
  estado: parseAsStringLiteral(participationStatusValues)
}

export const loadParticipacionesSearchParams = createLoader(
  participacionesSearchParams
)
