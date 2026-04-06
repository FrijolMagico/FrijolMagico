import { create } from 'zustand'
import type { AgrupacionRow } from '../_types/agrupacion'

interface AgrupacionDialogState {
  isCreateOpen: boolean
  isUpdateOpen: boolean
  isDetailOpen: boolean
  selectedAgrupacion: AgrupacionRow | null
  openCreateDialog: () => void
  closeCreateDialog: () => void
  openUpdateDialog: (agrupacion: AgrupacionRow) => void
  closeUpdateDialog: () => void
  openDetailDialog: (agrupacion: AgrupacionRow) => void
  closeDetailDialog: () => void
}

export const useAgrupacionDialogStore = create<AgrupacionDialogState>(
  (set) => ({
    isCreateOpen: false,
    isUpdateOpen: false,
    isDetailOpen: false,
    selectedAgrupacion: null,
    openCreateDialog: () => set({ isCreateOpen: true }),
    closeCreateDialog: () => set({ isCreateOpen: false }),
    openUpdateDialog: (agrupacion) =>
      set({
        isUpdateOpen: true,
        selectedAgrupacion: agrupacion
      }),
    closeUpdateDialog: () =>
      set({
        isUpdateOpen: false,
        selectedAgrupacion: null
      }),
    openDetailDialog: (agrupacion) =>
      set({
        isDetailOpen: true,
        selectedAgrupacion: agrupacion
      }),
    closeDetailDialog: () =>
      set({
        isDetailOpen: false,
        selectedAgrupacion: null
      })
  })
)
