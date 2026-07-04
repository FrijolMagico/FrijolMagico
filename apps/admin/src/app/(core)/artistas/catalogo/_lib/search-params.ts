import { createLoader, parseAsBoolean } from 'nuqs/server'
import { paginationParsers, searchParser } from '@/shared/lib/list-parsers'

export const catalogQueryParams = {
  ...searchParser,
  ...paginationParsers,
  activo: parseAsBoolean,
  destacado: parseAsBoolean,
  mostrar_eliminados: parseAsBoolean.withDefault(false)
}

export const loadCatalogQueryParams = createLoader(catalogQueryParams)
