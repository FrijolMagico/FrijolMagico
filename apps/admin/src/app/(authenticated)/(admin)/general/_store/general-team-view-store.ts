import { create } from 'zustand'

interface GeneralTeamViewState {
  search: string
  setSearch: (search: string) => void
}

export const useGeneralTeamViewStore = create<GeneralTeamViewState>((set) => ({
  search: '',
  setSearch: (search) => set({ search })
}))
