import { create } from 'zustand'
import { hasEntries } from '../change-journal'

interface ChangeJournalUIState {
  // State
  appliedSections: Set<string>

  // Actions
  markSectionApplied: (section: string) => void
  markSectionUnapplied: (section: string) => void
  reset: () => void
  getAppliedSections: () => string[]

  // Queries
  hasUnsavedChanges: (section: string) => Promise<boolean>
}

export const useChangeJournalUIStore = create<ChangeJournalUIState>(
  (set, get) => ({
    appliedSections: new Set(),

    markSectionApplied: (section) => {
      set((state) => {
        const newApplied = new Set(state.appliedSections)
        newApplied.add(section)
        return { appliedSections: newApplied }
      })
    },

    markSectionUnapplied: (section) => {
      set((state) => {
        const newApplied = new Set(state.appliedSections)
        newApplied.delete(section)
        return { appliedSections: newApplied }
      })
    },

    reset: () => {
      set({ appliedSections: new Set() })
    },

    getAppliedSections: () => {
      return Array.from(get().appliedSections)
    },

    hasUnsavedChanges: async (section: string) => {
      // Check journal first: if it has entries, there are unsaved changes
      const journalHasEntries = await hasEntries(section)
      if (journalHasEntries) {
        return true
      }

      // Otherwise, check if section is marked as applied in UI state
      // If not applied, consider it as having unsaved changes
      const isApplied = get().appliedSections.has(section)
      return !isApplied
    }
  })
)
