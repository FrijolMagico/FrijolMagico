import { create } from 'zustand'
import type { EditionWithDays } from '../_schemas/edition-composite.schema'

interface EditionDialogStore {
  isCreateEditionOpen: boolean
  isUpdateEditionOpen: boolean
  selectedEdition: EditionWithDays | null

  toggleCreateEditionDialog: (open: boolean) => void
  openUpdateEditionDialog: (edition: EditionWithDays) => void
  closeUpdateEditionDialog: () => void
}

export const useEditionDialog = create<EditionDialogStore>((set) => ({
  isCreateEditionOpen: false,
  isUpdateEditionOpen: false,
  selectedEdition: null,

  toggleCreateEditionDialog: (open) =>
    set({ isCreateEditionOpen: open, selectedEdition: null }),
  openUpdateEditionDialog: (edition) =>
    set({ isUpdateEditionOpen: true, selectedEdition: edition }),
  closeUpdateEditionDialog: () =>
    set({ isUpdateEditionOpen: false, selectedEdition: null })
}))
