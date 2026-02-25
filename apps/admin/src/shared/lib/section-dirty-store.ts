import { create } from 'zustand'

interface SectionDirtyState {
  dirtyMap: Record<string, boolean>
  setDirty: (section: string, dirty: boolean) => void
  clearSection: (section: string) => void
}

export const useSectionDirtyStore = create<SectionDirtyState>((set) => ({
  dirtyMap: {},
  setDirty: (section, dirty) =>
    set((state) => ({ dirtyMap: { ...state.dirtyMap, [section]: dirty } })),
  clearSection: (section) =>
    set((state) => {
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { [section]: _removed, ...rest } = state.dirtyMap
      return { dirtyMap: rest }
    })
}))
