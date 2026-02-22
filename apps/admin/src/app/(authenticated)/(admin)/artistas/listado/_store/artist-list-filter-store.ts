import { createFilterStore } from '@/shared/ui-state/filters/filter-factory'
import type { ArtistListFilters } from '../_types'
import { useArtistListPaginationStore } from './artist-list-pagination-store'

export const useArtistListFilterStore = createFilterStore<ArtistListFilters>(
  { search: '', country: null, city: null, statusId: null },
  () => useArtistListPaginationStore.getState().reset()
)
