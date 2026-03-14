import { create } from 'zustand'

import type { TeamMember } from '../_schemas/organizacion.schema'

interface TeamDialogStore {
  isAddOpen: boolean
  editingMember: TeamMember | null

  openAdd: () => void
  openEdit: (member: TeamMember) => void
  close: () => void
}

// TODO: Refactor this store to be more accurate, splitting into Update or Create actions
export const useTeamDialog = create<TeamDialogStore>((set) => ({
  isAddOpen: false,
  editingMember: null,

  openAdd: () => set({ isAddOpen: true, editingMember: null }),
  openEdit: (member) => set({ isAddOpen: false, editingMember: member }),
  close: () => set({ isAddOpen: false, editingMember: null })
}))
