import { create } from 'zustand'
import type { BandRow } from '../_types/band'

interface BandDialogState {
  isCreateBandOpen: boolean
  isUpdateBandOpen: boolean
  selectedBand: BandRow | null
  toggleCreateBandDialog: (open: boolean) => void
  openUpdateBandDialog: (band: BandRow) => void
  closeUpdateBandDialog: () => void
}

export const useBandDialogStore = create<BandDialogState>((set) => ({
  isCreateBandOpen: false,
  isUpdateBandOpen: false,
  selectedBand: null,
  toggleCreateBandDialog: (open) =>
    set({
      isCreateBandOpen: open,
      ...(open ? { isUpdateBandOpen: false, selectedBand: null } : {})
    }),
  openUpdateBandDialog: (band) =>
    set({
      isCreateBandOpen: false,
      isUpdateBandOpen: true,
      selectedBand: band
    }),
  closeUpdateBandDialog: () =>
    set({
      isUpdateBandOpen: false,
      selectedBand: null
    })
}))
