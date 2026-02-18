'use client'

import { useCatalogPaginationStore } from '../_store/catalog-pagination-store'
import { usePaginationUrlSync } from '@/shared/ui-state/pagination'

export function useCatalogPaginationUrlSync() {
  usePaginationUrlSync(useCatalogPaginationStore, {
    pageParam: 'page',
    pageSizeParam: 'pageSize',
    defaultPageSize: 20
  })
}
