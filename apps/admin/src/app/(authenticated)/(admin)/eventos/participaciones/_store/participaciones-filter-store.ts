import { createFilterStore } from '@/shared/ui-state/filters/factory'
import { createPaginationStore } from '@/shared/ui-state/pagination'

import type { ParticipacionesFilters } from '../_types'

export const useParticipacionesPaginationStore = createPaginationStore({
  defaultPageSize: 25
})

export const useParticipacionesFilterStore =
  createFilterStore<ParticipacionesFilters>({ search: '', estado: null }, () =>
    useParticipacionesPaginationStore.getState().reset()
  )
