import { createPaginationStore } from '@/shared/ui-state/pagination'

export const useArtistListPaginationStore = createPaginationStore({
  defaultPageSize: 20
})
