import { createPaginationStore } from '@/shared/ui-state/pagination'

export const useArtistListPaginationStore = createPaginationStore({
  storeName: 'artista_listado',
  defaultPageSize: 20
})
