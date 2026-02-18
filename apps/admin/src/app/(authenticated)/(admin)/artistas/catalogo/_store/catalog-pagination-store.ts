import { createPaginationStore } from '@/shared/ui-state/pagination'

export const useCatalogPaginationStore = createPaginationStore({
  storeName: 'catalogo',
  defaultPageSize: 20,
  urlSync: true,
  urlParams: { page: 'page', pageSize: 'pageSize' }
})
