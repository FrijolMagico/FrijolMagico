import { create } from 'zustand'
import { Event } from '../_schemas/event.schema'

interface EventDialogStore {
  isEventDialogOpen: boolean
  selectedEvent: Event | null

  openEventDialog: (event: Event | null) => void
  closeEventDialog: () => void
}

export const useEventDialog = create<EventDialogStore>((set) => ({
  isEventDialogOpen: false,
  selectedEvent: null,

  openEventDialog: (event) =>
    set({ isEventDialogOpen: true, selectedEvent: event }),
  closeEventDialog: () => set({ isEventDialogOpen: false, selectedEvent: null })
}))
