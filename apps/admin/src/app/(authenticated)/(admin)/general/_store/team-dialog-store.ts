import { create } from 'zustand'

interface TeamDialogStore {
  isDialogOpen: boolean
  selectedMemberId: string | null

  openDialog: (id: string | null) => void
  closeDialog: () => void
}

export const useTeamDialog = create<TeamDialogStore>((set) => ({
  isDialogOpen: false,
  selectedMemberId: null,

  openDialog: (id) => set({ isDialogOpen: true, selectedMemberId: id }),
  closeDialog: () => set({ isDialogOpen: false, selectedMemberId: null })
}))
