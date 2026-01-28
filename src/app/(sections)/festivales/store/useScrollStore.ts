'use client'

import { create } from 'zustand'

interface ScrollState {
  isProgrammaticScroll: boolean
  targetId: string | null
  setScrolling: (targetId: string) => void
  clearScrolling: () => void
}

export const useScrollStore = create<ScrollState>((set) => ({
  isProgrammaticScroll: false,
  targetId: null,
  setScrolling: (targetId: string) =>
    set({ isProgrammaticScroll: true, targetId }),
  clearScrolling: () => set({ isProgrammaticScroll: false, targetId: null }),
}))
