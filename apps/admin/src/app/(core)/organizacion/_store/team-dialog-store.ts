import { create } from 'zustand'

import type { TeamMember } from '../_schemas/organizacion.schema'

interface TeamDialogStore {
  isCreateMemberOpen: boolean
  isUpdateMemberOpen: boolean
  selectedMember: TeamMember | null

  toggleCreateMemberDialog: (open: boolean) => void
  openUpdateMemberDialog: (member: TeamMember) => void
  closeUpdateMemberDialog: () => void
}

// TODO: Refactor this store to be more accurate, splitting into Update or Create actions
export const useTeamDialog = create<TeamDialogStore>((set) => ({
  isCreateMemberOpen: false,
  isUpdateMemberOpen: false,
  selectedMember: null,

  toggleCreateMemberDialog: (open) =>
    set({ isCreateMemberOpen: open, selectedMember: null }),
  openUpdateMemberDialog: (member) =>
    set({ isCreateMemberOpen: false, selectedMember: member }),
  closeUpdateMemberDialog: () =>
    set({ isCreateMemberOpen: false, selectedMember: null })
}))
