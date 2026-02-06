import type { StoreApi } from 'zustand'
import type { DraftData, DraftManager } from './types'

/**
 * Creates a draft manager that syncs Zustand store changes to localStorage
 *
 * Features:
 * - Smart change detection (only saves when data actually changes)
 * - Automatic debouncing to reduce write operations
 * - External to React lifecycle (no useEffect loops)
 * - Type-safe with full TypeScript inference
 *
 * @param key - localStorage key for storing the draft
 * @param store - Zustand store instance
 * @param selector - Function to select the data to persist from store
 * @param shouldSave - Function to determine if draft should be saved based on store state
 * @param debounceMs - Milliseconds to debounce save operations (default: 1500)
 *
 * @example
 * ```typescript
 * const draftManager = createDraftManager(
 *   'admin:draft:organizacion',
 *   useOrganizacionForm,
 *   (state) => state.formData,
 *   (state) => state.isDirty && state.shouldPersist
 * )
 *
 * // In component
 * useEffect(() => {
 *   const cleanup = draftManager.start()
 *   return cleanup
 * }, [])
 * ```
 */
export function createDraftManager<TStore, TData>(
  key: string,
  store: StoreApi<TStore>,
  selector: (state: TStore) => TData,
  shouldSave: (state: TStore) => boolean,
  debounceMs: number = 1500
): DraftManager<TData> {
  let timeoutId: NodeJS.Timeout | null = null
  let previousData: string | null = null

  /**
   * Save draft to localStorage with error handling
   */
  const saveDraft = (data: TData, serverUpdatedAt?: string): void => {
    try {
      const draft: DraftData<TData> = {
        data,
        updatedAt: new Date().toISOString(),
        serverUpdatedAt
      }
      localStorage.setItem(key, JSON.stringify(draft))
      previousData = JSON.stringify(data)
    } catch (error) {
      if (error instanceof Error && error.name === 'QuotaExceededError') {
        console.warn('localStorage quota exceeded, cannot save draft')
      } else {
        console.error('Error saving draft to localStorage:', error)
      }
    }
  }

  /**
   * Handle state changes from Zustand store
   */
  const handleStateChange = (state: TStore): void => {
    // Check if we should save based on store state
    if (!shouldSave(state)) {
      return
    }

    const currentData = selector(state)
    const currentSerialized = JSON.stringify(currentData)

    // Only save if data actually changed
    if (currentSerialized === previousData) {
      return
    }

    // Clear existing timeout
    if (timeoutId) {
      clearTimeout(timeoutId)
    }

    // Debounce the save operation
    timeoutId = setTimeout(() => {
      // Get server timestamp if available (for conflict detection)
      const stateWithTimestamp = state as {
        originalData?: { updatedAt?: string }
      }
      const serverUpdatedAt = stateWithTimestamp.originalData?.updatedAt
      saveDraft(currentData, serverUpdatedAt)
    }, debounceMs)
  }

  return {
    /**
     * Start listening to store changes and auto-save drafts
     * Returns a cleanup function to stop listening
     */
    start: (): (() => void) => {
      // Initialize previousData on start
      const initialState = store.getState()
      const initialData = selector(initialState)
      previousData = JSON.stringify(initialData)

      // Subscribe to store changes (outside React lifecycle)
      const unsubscribe = store.subscribe(handleStateChange)

      // Return cleanup function
      return () => {
        unsubscribe()
        if (timeoutId) {
          clearTimeout(timeoutId)
          timeoutId = null
        }
      }
    },

    /**
     * Clear draft from localStorage immediately
     */
    clear: (): void => {
      try {
        localStorage.removeItem(key)
        previousData = null

        // Clear any pending save
        if (timeoutId) {
          clearTimeout(timeoutId)
          timeoutId = null
        }
      } catch (error) {
        console.error('Error clearing draft from localStorage:', error)
      }
    },

    /**
     * Get current draft from localStorage
     * Returns null if no draft exists or if data is corrupted
     */
    getDraft: (): DraftData<TData> | null => {
      try {
        const stored = localStorage.getItem(key)
        if (!stored) {
          return null
        }

        const parsed = JSON.parse(stored) as DraftData<TData>

        // Validate draft structure
        if (!parsed.data || !parsed.updatedAt) {
          console.warn('Invalid draft structure, clearing corrupted data')
          localStorage.removeItem(key)
          return null
        }

        return parsed
      } catch (error) {
        console.error('Error loading draft from localStorage:', error)
        // Clear corrupted data
        try {
          localStorage.removeItem(key)
        } catch {
          // Ignore cleanup errors silently
        }
        return null
      }
    },

    /**
     * Check if a valid draft exists
     */
    hasDraft: (): boolean => {
      const draft = getDraft()
      return draft !== null
    }
  }

  function getDraft(): DraftData<TData> | null {
    try {
      const stored = localStorage.getItem(key)
      if (!stored) {
        return null
      }
      const parsed = JSON.parse(stored) as DraftData<TData>
      if (!parsed.data || !parsed.updatedAt) {
        return null
      }
      return parsed
    } catch {
      return null
    }
  }
}

export type { DraftData, DraftManager }
