import { create } from 'zustand'

export interface FilterStoreState<TFilters> {
  filters: TFilters
  setFilters: (newFilters: Partial<TFilters>) => void
  setFilter: <K extends keyof TFilters>(key: K, value: TFilters[K]) => void
  reset: () => void
}

export function createFilterStore<TFilters>(
  defaultFilters: TFilters,
  onChange?: () => void
) {
  return create<FilterStoreState<TFilters>>((set) => ({
    filters: defaultFilters,

    setFilters: (newFilters) => {
      set((state) => ({
        filters: { ...state.filters, ...newFilters }
      }))
      onChange?.()
    },

    setFilter: (key, value) => {
      set((state) => ({
        filters: { ...state.filters, [key]: value }
      }))
      onChange?.()
    },

    reset: () => {
      set({ filters: defaultFilters })
      onChange?.()
    }
  }))
}
