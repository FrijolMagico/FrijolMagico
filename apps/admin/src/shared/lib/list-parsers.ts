import { parseAsInteger, parseAsString } from 'nuqs/server'

export const paginationParsers = {
  page: parseAsInteger.withDefault(1),
  limit: parseAsInteger.withDefault(20)
}

export const searchParser = {
  search: parseAsString.withDefault('')
}
