import { normalizeString } from '@frijolmagico/utils/string'
import type { CatalogFilterValues } from '../types/filters'
import { FILTER_KEYS } from '../constants/filterConstants'
import { dedupeArray, parseParamArray } from './searchParams'

export function getFiltersFromURL(): CatalogFilterValues {
  if (typeof window === 'undefined') {
    return { category: [], city: [], search: '', country: [] }
  }
  const params = new URLSearchParams(window.location.search)
  return {
    category: parseParamArray(params.get(FILTER_KEYS.category)),
    city: parseParamArray(params.get(FILTER_KEYS.city)),
    country: parseParamArray(params.get(FILTER_KEYS.country)),
    search: params.get(FILTER_KEYS.search) || ''
  }
}

export function urlHasFilters(): boolean {
  if (typeof window === 'undefined') return false
  const params = new URLSearchParams(window.location.search)
  return (
    !!params.get(FILTER_KEYS.category) ||
    !!params.get(FILTER_KEYS.city) ||
    !!params.get(FILTER_KEYS.search) ||
    !!params.get(FILTER_KEYS.country)
  )
}

// Updates the browser URL parameters based on the provided catalog filters
// without reloading the page. It normalizes and deduplicates filter values,
// constructs the query string, and updates the URL using history.replaceState.
export function updateURLParams(filters: CatalogFilterValues) {
  if (typeof window === 'undefined') return
  const uniqueCategory = dedupeArray(filters.category)
  const uniqueCity = dedupeArray(filters.city)
  const uniqueCountry = dedupeArray(filters.country)
  const params = new URLSearchParams()
  if (uniqueCategory.length > 0)
    params.set(FILTER_KEYS.category, uniqueCategory.join(','))
  if (uniqueCity.length > 0) params.set(FILTER_KEYS.city, uniqueCity.join(','))
  if (uniqueCountry.length > 0)
    params.set(FILTER_KEYS.country, uniqueCountry.join(','))
  if (filters.search.trim() !== '')
    params.set(FILTER_KEYS.search, normalizeString(filters.search.trim()))
  const url = `${window.location.pathname}${params.toString() ? '?' + params.toString() : ''}`
  window.history.replaceState(null, '', url)
}

const PAGE_PARAM = 'pagina'

/**
 * Reads the current page number from the URL query string.
 * Returns 1 if no param is present or if the value is invalid.
 */
export function getPageFromURL(): number {
  if (typeof window === 'undefined') return 1
  const params = new URLSearchParams(window.location.search)
  const page = parseInt(params.get(PAGE_PARAM) || '1', 10)
  return page > 0 ? page : 1
}

/**
 * Updates the browser URL with the given page number.
 * Removes the param when on page 1 (default state).
 * Preserves any existing filter/search params.
 */
export function updatePageURL(page: number) {
  if (typeof window === 'undefined') return
  const params = new URLSearchParams(window.location.search)
  if (page <= 1) {
    params.delete(PAGE_PARAM)
  } else {
    params.set(PAGE_PARAM, page.toString())
  }
  const url = `${window.location.pathname}${params.toString() ? '?' + params.toString() : ''}`
  window.history.replaceState(null, '', url)
}
