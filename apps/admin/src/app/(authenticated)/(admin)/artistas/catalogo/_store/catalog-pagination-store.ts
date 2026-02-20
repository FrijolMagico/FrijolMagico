import { JOURNAL_ENTITIES } from '@/shared/lib/database-entities'
import { createPaginationStore } from '@/shared/ui-state/pagination'

export const useCatalogPaginationStore = createPaginationStore({
  storeName: JOURNAL_ENTITIES.CATALOGO_ARTISTA,
  defaultPageSize: 20,
  urlSync: true,
  urlParams: { page: 'page', pageSize: 'pageSize' }
})
