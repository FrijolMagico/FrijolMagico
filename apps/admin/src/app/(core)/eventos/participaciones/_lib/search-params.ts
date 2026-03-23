import {
  createLoader,
  parseAsInteger,
  parseAsString,
  parseAsStringLiteral
} from 'nuqs/server'

import { paginationParsers, searchParser } from '@/shared/lib/list-parsers'

const participationStatusValues = [
  'seleccionado',
  'confirmado',
  'desistido',
  'cancelado',
  'ausente',
  'completado'
] as const

export const participacionesSearchParams = {
  ...paginationParsers,
  limit: parseAsInteger.withDefault(25),
  ...searchParser,
  edicion: parseAsString,
  edicionId: parseAsString,
  estado: parseAsStringLiteral(participationStatusValues)
}

export const loadParticipacionesSearchParams = createLoader(
  participacionesSearchParams
)
