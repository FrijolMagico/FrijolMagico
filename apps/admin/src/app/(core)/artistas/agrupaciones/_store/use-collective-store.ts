import { create } from 'zustand'
import type { CollectiveRow } from '../_types/collective.types'

interface CollectiveDialogStore {
  isCreateCollectiveOpen: boolean
  isUpdateCollectiveOpen: boolean
  selectedCollective: CollectiveRow | null

  toggleCreateCollectiveDialog: (open: boolean) => void
  openUpdateCollectiveDialog: (collective: CollectiveRow) => void
  closeUpdateCollectiveDialog: () => void
}

export const useCollectiveStore = create<CollectiveDialogStore>((set) => ({
  isCreateCollectiveOpen: false,
  isUpdateCollectiveOpen: false,
  selectedCollective: null,

  toggleCreateCollectiveDialog: (open) =>
    set({
      isCreateCollectiveOpen: open,
      ...(open ? { isUpdateCollectiveOpen: false, selectedCollective: null } : {})
    }),

  openUpdateCollectiveDialog: (collective) =>
    set({
      isCreateCollectiveOpen: false,
      isUpdateCollectiveOpen: true,
      selectedCollective: collective
    }),

  closeUpdateCollectiveDialog: () =>
    set({
      isUpdateCollectiveOpen: false,
      selectedCollective: null
    })
}))