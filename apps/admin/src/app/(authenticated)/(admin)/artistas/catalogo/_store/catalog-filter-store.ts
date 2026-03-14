import { createFilterStore } from '@/shared/ui-state/filters/factory'
import { useCatalogPaginationStore } from './catalog-pagination-store'

interface CatalogFilters {
  activo: boolean | null
  destacado: boolean | null
  search: string
}

export const useCatalogFilterStore = createFilterStore<CatalogFilters>(
  { activo: null, destacado: null, search: '' },
  () => useCatalogPaginationStore.getState().reset()
)
