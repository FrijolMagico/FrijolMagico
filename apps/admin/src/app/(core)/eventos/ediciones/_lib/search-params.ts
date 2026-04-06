import { createLoader, parseAsInteger } from 'nuqs/server'

import { paginationParsers, searchParser } from '@/shared/lib/list-parsers'

export const edicionSearchParams = {
  ...searchParser,
  ...paginationParsers,
  evento: parseAsInteger
}

export const loadEdicionSearchParams = createLoader(edicionSearchParams)
