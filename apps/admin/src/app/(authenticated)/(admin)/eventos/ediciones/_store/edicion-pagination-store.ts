import { createPaginationStore } from '@/shared/ui-state/pagination'

export const useEdicionPaginationStore = createPaginationStore({
  defaultPageSize: 20
})
