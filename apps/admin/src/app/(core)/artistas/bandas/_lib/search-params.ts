import { createLoader, parseAsBoolean, parseAsInteger } from 'nuqs/server'
import { DEFAULT_PAGE_SIZE } from '../_constants'

export const bandQueryParams = {
  page: parseAsInteger.withDefault(1),
  pageSize: parseAsInteger.withDefault(DEFAULT_PAGE_SIZE),
  mostrar_eliminados: parseAsBoolean.withDefault(false)
}

export const loadBandQueryParams = createLoader(bandQueryParams)
