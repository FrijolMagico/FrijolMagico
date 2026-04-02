import { create } from 'zustand'
import {
  ActivityLookup,
  ParticipantEntity,
  ExhibitionLookup
} from '../_types/participations.types'

interface ParticipationsStore {
  isCreateExhibitionDialogOpen: boolean
  isCreateActivityDialogOpen: boolean
  isUpdateExhibitionDialogOpen: boolean
  isUpdateActivityDialogOpen: boolean
  isRemoveExhibitionDialogOpen: boolean

  selectedExhibition: {
    entity: ParticipantEntity | null
    exhibition: ExhibitionLookup | null
  }
  selectedActivity: {
    entity: ParticipantEntity | null
    activity: ActivityLookup | null
  }

  setSelectedParticipant: (participant: {
    entity: ParticipantEntity
    exhibition?: ExhibitionLookup | null
    activity?: ActivityLookup | null
  }) => void
  toggleCreateExhibitionDialogOpen: (open: boolean) => void
  toggleCreateActivityDialogOpen: (open: boolean) => void
  closeUpdateDialogs: () => void
  setRemoveExhibitionDialogOpen: (open: boolean) => void
}

export const useParticipationsStore = create<ParticipationsStore>((set) => ({
  isCreateExhibitionDialogOpen: false,
  isUpdateExhibitionDialogOpen: false,
  isCreateActivityDialogOpen: false,
  isUpdateActivityDialogOpen: false,
  isRemoveExhibitionDialogOpen: false,

  selectedExhibition: {
    entity: null,
    exhibition: null
  },
  selectedActivity: {
    entity: null,
    activity: null
  },

  setSelectedParticipant: (participant) => {
    console.log('Selected participant:', participant)
    const { exhibition, activity, entity } = participant

    const isExhibitionSelected = !!exhibition && !activity

    set({
      selectedExhibition: {
        entity,
        exhibition: participant.exhibition || null
      },
      selectedActivity: {
        entity,
        activity: participant.activity || null
      },
      isRemoveExhibitionDialogOpen: false,
      isUpdateExhibitionDialogOpen: isExhibitionSelected,
      isUpdateActivityDialogOpen: !isExhibitionSelected
    })
  },

  closeUpdateDialogs: () =>
    set({
      selectedActivity: {
        entity: null,
        activity: null
      },
      selectedExhibition: {
        entity: null,
        exhibition: null
      },
      isRemoveExhibitionDialogOpen: false
    }),

  toggleCreateExhibitionDialogOpen: (open) =>
    set({ isCreateExhibitionDialogOpen: open }),

  toggleCreateActivityDialogOpen: (open) =>
    set({ isCreateActivityDialogOpen: open }),

  setRemoveExhibitionDialogOpen: (open) =>
    set({ isRemoveExhibitionDialogOpen: open })
}))
