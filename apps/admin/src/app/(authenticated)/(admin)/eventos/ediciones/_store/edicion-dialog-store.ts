import { create } from 'zustand'

interface EdicionDialogStore {
  isDialogOpen: boolean
  selectedEdicionId: string | null

  openDialog: (id: string | null) => void
  closeDialog: () => void
}

export const useEdicionDialog = create<EdicionDialogStore>((set) => ({
  isDialogOpen: false,
  selectedEdicionId: null,

  openDialog: (id) => set({ isDialogOpen: true, selectedEdicionId: id }),
  closeDialog: () => set({ isDialogOpen: false, selectedEdicionId: null })
}))
