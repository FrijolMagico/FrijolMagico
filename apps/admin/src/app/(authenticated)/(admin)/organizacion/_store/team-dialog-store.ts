import { create } from 'zustand'

import type { TeamMember } from '../_schemas/organizacion.schema'

interface TeamDialogStore {
  isAddOpen: boolean
  editingMember: TeamMember | null

  openAdd: () => void
  openEdit: (member: TeamMember) => void
  close: () => void
}

export const useTeamDialog = create<TeamDialogStore>((set) => ({
  isAddOpen: false,
  editingMember: null,

  openAdd: () => {
    console.log('[DBG:STORE] openAdd called', { stack: new Error().stack })
    set({ isAddOpen: true, editingMember: null })
  },
  openEdit: (member) => {
    console.log('[DBG:STORE] openEdit called', {
      memberId: member.id,
      stack: new Error().stack
    })
    set({ isAddOpen: false, editingMember: member })
  },
  close: () => {
    console.log('[DBG:STORE] close called', { stack: new Error().stack })
    set({ isAddOpen: false, editingMember: null })
  }
}))
