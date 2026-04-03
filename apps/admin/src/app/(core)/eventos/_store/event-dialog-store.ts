import { create } from 'zustand'
import { Event } from '../_schemas/event.schema'

interface EventDialogStore {
  isCreateEventOpen: boolean
  isUpdateEventOpen: boolean
  selectedEvent: Event | null

  toggleCreateEventDialog: (open: boolean) => void
  openUpdateEventDialog: (event: Event) => void
  closeUpdateEventDialog: () => void
}

export const useEventDialog = create<EventDialogStore>((set) => ({
  isCreateEventOpen: false,
  isUpdateEventOpen: false,
  selectedEvent: null,

  toggleCreateEventDialog: (open) =>
    set({ isCreateEventOpen: open, selectedEvent: null }),
  openUpdateEventDialog: (event) => {
    console.log('Opening update dialog for event:', event)

    set({ isUpdateEventOpen: true, selectedEvent: event })
  },
  closeUpdateEventDialog: () =>
    set({ isUpdateEventOpen: false, selectedEvent: null })
}))
