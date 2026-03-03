import { create } from 'zustand'

interface EventoDialogStore {
  isDialogOpen: boolean
  selectedEventoId: string | null

  openDialog: (id: string | null) => void
  closeDialog: () => void
}

export const useEventoDialog = create<EventoDialogStore>((set) => ({
  isDialogOpen: false,
  selectedEventoId: null,

  openDialog: (id) => set({ isDialogOpen: true, selectedEventoId: id }),
  closeDialog: () => set({ isDialogOpen: false, selectedEventoId: null })
}))
