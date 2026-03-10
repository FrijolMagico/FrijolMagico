import { create } from 'zustand'
import { TeamMember } from '../_types'

interface TeamDialogStore {
  isDialogOpen: boolean
  selectedMember: TeamMember | null

  openDialog: (member: TeamMember | null) => void
  closeDialog: () => void
}

export const useTeamDialog = create<TeamDialogStore>((set) => ({
  isDialogOpen: false,
  selectedMember: null,

  openDialog: (member) => set({ isDialogOpen: true, selectedMember: member }),
  closeDialog: () => set({ isDialogOpen: false, selectedMember: null })
}))
