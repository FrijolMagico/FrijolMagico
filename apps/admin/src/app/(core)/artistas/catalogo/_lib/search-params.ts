import { createLoader, parseAsBoolean } from 'nuqs/server'
import { paginationParsers, searchParser } from '@/shared/lib/list-parsers'

export const catalogQueryParams = {
  ...searchParser,
  ...paginationParsers,
  activo: parseAsBoolean,
  destacado: parseAsBoolean
}

export const loadCatalogQueryParams = createLoader(catalogQueryParams)
