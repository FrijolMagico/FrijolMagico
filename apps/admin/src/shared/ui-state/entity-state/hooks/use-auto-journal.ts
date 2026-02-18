'use client'

import { useRef, useEffect, useCallback } from 'react'

interface UseAutoJournalOptions<T> {
  // Datos actuales (para dirty check)
  data: T | undefined | null
  // Acciones del store
  actions: {
    update: (data: Partial<T>) => void
    save: () => Promise<void>
  }
  // Config
  debounceMs?: number
}

/**
 * Hook para auto-commit de cambios con debounce y dirty checking.
 *
 * ## Patrón Entity State
 *
 * - L1: Remote Data (server)
 * - L2: Applied Changes (journal/committed)
 * - L3: Current Edits (drafts/memory)
 *
 * Este hook:
 * 1. Actualiza L3 en onChange (inmediato)
 * 2. Debouncea cambios para evitar commits excesivos
 * 3. Compara contra L2 (último committed) para dirty check
 * 4. Limpia timers en unmount y fuerza commit
 *
 * ## Uso
 *
 * ```tsx
 * const { handleChange, handleBlur } = useAutoJournal({
 *   data,
 *   actions: { update, save },
 *   debounceMs: 1000
 * })
 *
 * <input
 *   value={data.nombre}
 *   onChange={(e) => handleChange('nombre', e.target.value)}
 *   onBlur={() => handleBlur('nombre', data.nombre)}
 * />
 * ```
 */
export function useAutoJournal<T extends Record<string, unknown>>({
  data,
  actions,
  debounceMs = 1000
}: UseAutoJournalOptions<T>) {
  // Refs para estado interno
  const pendingEdits = useRef<Record<string, NodeJS.Timeout>>({})
  const lastEditsApplied = useRef<Record<string, unknown>>({})

  // Inicializar lastEditsApplied cuando llega data por primera vez
  useEffect(() => {
    if (data && Object.keys(lastEditsApplied.current).length === 0) {
      // Shallow copy para inicialización
      lastEditsApplied.current = { ...data }
    }
  }, [data])

  // Cleanup: Clear timers y forzar commit en unmount
  useEffect(() => {
    return () => {
      // Limpiar todos los timers pendientes
      Object.values(pendingEdits.current).forEach(clearTimeout)

      // Emergency commit
      actions.save()
    }
  }, [actions])

  const handleChange = useCallback(
    (field: keyof T, value: unknown) => {
      // 1. Actualizar L3 inmediatamente
      actions.update({ [field]: value } as Partial<T>)

      // 2. Lógica de debounce
      const fieldKey = field as string
      if (pendingEdits.current[fieldKey]) {
        clearTimeout(pendingEdits.current[fieldKey])
      }

      pendingEdits.current[fieldKey] = setTimeout(() => {
        // Dirty check contra lo último commiteado
        if (value !== lastEditsApplied.current[fieldKey]) {
          actions.save()
          lastEditsApplied.current[fieldKey] = value
        }
        delete pendingEdits.current[fieldKey]
      }, debounceMs)
    },
    [actions, debounceMs]
  )

  const handleBlur = useCallback(
    (field: keyof T, currentValue: unknown) => {
      const fieldKey = field as string

      // Cancelar debounce pendiente
      if (pendingEdits.current[fieldKey]) {
        clearTimeout(pendingEdits.current[fieldKey])
        delete pendingEdits.current[fieldKey]
      }

      // Forzar commit si hay cambios no commiteados
      if (currentValue !== lastEditsApplied.current[fieldKey]) {
        actions.save()
        lastEditsApplied.current[fieldKey] = currentValue
      }
    },
    [actions]
  )

  return { handleChange, handleBlur }
}
