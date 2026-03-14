import { create } from 'zustand'

interface ParticipacionesViewState {
  selectedEditionId: string | null
  selectedParticipantId: string | null
  isAddExpositorDialogOpen: boolean
  isAddActividadDialogOpen: boolean
  setSelectedEditionId: (id: string | null) => void
  setSelectedParticipantId: (id: string | null) => void
  setAddExpositorDialogOpen: (open: boolean) => void
  setAddActividadDialogOpen: (open: boolean) => void
}

export const useParticipacionesViewStore = create<ParticipacionesViewState>(
  (set) => ({
    selectedEditionId: null,
    selectedParticipantId: null,
    isAddExpositorDialogOpen: false,
    isAddActividadDialogOpen: false,
    setSelectedEditionId: (id) => set({ selectedEditionId: id }),
    setSelectedParticipantId: (id) => set({ selectedParticipantId: id }),
    setAddExpositorDialogOpen: (open) =>
      set({ isAddExpositorDialogOpen: open }),
    setAddActividadDialogOpen: (open) => set({ isAddActividadDialogOpen: open })
  })
)
