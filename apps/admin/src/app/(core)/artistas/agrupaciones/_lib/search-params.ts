import { createLoader, parseAsBoolean } from 'nuqs/server'
import { paginationParsers, searchParser } from '@/shared/lib/list-parsers'

export const collectiveQueryParams = {
  ...searchParser,
  ...paginationParsers,
  showDeleted: parseAsBoolean.withDefault(false)
}

export const loadCollectiveQueryParams = createLoader(collectiveQueryParams)
