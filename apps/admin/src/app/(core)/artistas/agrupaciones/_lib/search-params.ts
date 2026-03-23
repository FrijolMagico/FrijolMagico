import { createLoader, parseAsBoolean } from 'nuqs/server'
import { paginationParsers, searchParser } from '@/shared/lib/list-parsers'

export const agrupacionQueryParams = {
  ...searchParser,
  ...paginationParsers,
  mostrar_eliminados: parseAsBoolean.withDefault(false)
}

export const loadAgrupacionQueryParams = createLoader(agrupacionQueryParams)
