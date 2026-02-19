import { create } from 'zustand'

interface GeneralOrgViewState {
  isEditing: boolean
  setIsEditing: (editing: boolean) => void
}

export const useGeneralOrgViewStore = create<GeneralOrgViewState>((set) => ({
  isEditing: false,
  setIsEditing: (editing) => set({ isEditing: editing })
}))
