'use client'

import { useState } from 'react'
import type { Dispatch, SetStateAction } from 'react'

/**
 * Manages local form state for dialog forms.
 * Designed to be used inside a component mounted with a stable `key`
 * so state resets via remount, not via effects.
 *
 * @param initialState - Snapshot captured at mount time. Never re-derived from store.
 */
export function useDialogFormState<T extends object>(
  initialState: T
): {
  formState: T
  setFormState: Dispatch<SetStateAction<T>>
  setField: <K extends keyof T>(key: K, value: T[K]) => void
  resetForm: () => void
} {
  const [formState, setFormState] = useState<T>(initialState)

  const setField = <K extends keyof T>(key: K, value: T[K]) => {
    setFormState((prev) => ({ ...prev, [key]: value }))
  }

  const resetForm = () => {
    setFormState(initialState)
  }

  return { formState, setFormState, setField, resetForm }
}
