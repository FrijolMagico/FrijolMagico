
import { createFilterStore } from '@/shared/ui-state/filters/factory'
import type { EdicionFilters } from '../_types'
import { useEdicionPaginationStore } from './edicion-pagination-store'

export const useEdicionFilterStore = createFilterStore<EdicionFilters>(
  { eventoId: null, search: '' },
  () => useEdicionPaginationStore.getState().reset()
)
