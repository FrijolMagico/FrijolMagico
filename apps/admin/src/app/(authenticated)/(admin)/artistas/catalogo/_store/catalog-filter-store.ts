import { createFilterStore } from '@/shared/ui-state/filters/factory'
import type { CatalogFilters } from '../_types'
import { useCatalogPaginationStore } from './catalog-pagination-store'

export const useCatalogFilterStore = createFilterStore<CatalogFilters>(
  { activo: null, destacado: null, search: '' },
  () => useCatalogPaginationStore.getState().reset()
)
