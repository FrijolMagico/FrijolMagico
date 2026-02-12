import type { DraftManager, DraftData } from './types'

export function createDraftManager<T, S = unknown>(
  key: string,
  store: { subscribe: (fn: (state: S) => void) => () => void },
  selector: (state: S) => T,
  shouldPersist: (state: S) => boolean,
  debounceMs: number = 1000
): DraftManager {
  let debounceTimeout: NodeJS.Timeout | null = null
  let unsubscribe: (() => void) | null = null

  const getDraft = (): DraftData | null => {
    if (typeof window === 'undefined') return null
    try {
      const saved = localStorage.getItem(key)
      if (!saved) return null
      return JSON.parse(saved) as DraftData
    } catch {
      return null
    }
  }

  const saveDraft = (data: T): void => {
    if (typeof window === 'undefined') return
    try {
      const draft: DraftData = {
        data,
        updatedAt: new Date().toISOString()
      }
      localStorage.setItem(key, JSON.stringify(draft))
    } catch (error) {
      console.error('Failed to save draft:', error)
    }
  }

  const clear = (): void => {
    if (typeof window === 'undefined') return
    localStorage.removeItem(key)
  }

  const start = (): (() => void) => {
    if (typeof window === 'undefined') return () => {}

    unsubscribe = store.subscribe((state: S) => {
      if (shouldPersist(state)) {
        if (debounceTimeout) clearTimeout(debounceTimeout)
        debounceTimeout = setTimeout(() => {
          const data = selector(state)
          saveDraft(data)
        }, debounceMs)
      }
    })

    return () => {
      if (debounceTimeout) clearTimeout(debounceTimeout)
      if (unsubscribe) unsubscribe()
    }
  }

  return {
    getDraft,
    saveDraft,
    clear,
    start
  }
}
