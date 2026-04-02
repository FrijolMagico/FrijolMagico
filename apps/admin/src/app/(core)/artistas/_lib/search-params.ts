import {
  createLoader,
  parseAsBoolean,
  parseAsInteger,
  parseAsString
} from 'nuqs/server'
import { paginationParsers, searchParser } from '@/shared/lib/list-parsers'

export const artistQueryParams = {
  ...searchParser,
  ...paginationParsers,
  mostrar_eliminados: parseAsBoolean.withDefault(false),
  pais: parseAsString,
  ciudad: parseAsString,
  estado: parseAsInteger
}

export const loadArtistQueryParams = createLoader(artistQueryParams)
