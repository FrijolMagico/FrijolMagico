'use client'

import { useRef, useEffect, useCallback } from 'react'

interface UseAutoJournalOptions<T> {
  // Datos actuales (para dirty check)
  data?: T | null
  actions: {
    update: (data: Partial<T>, id: number | null) => void
    save: (data: Partial<T>, id: number | null) => Promise<void>
  }
  // Config
  debounceMs?: number
}

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
      // NOTE: Este efecto esta impidiendo que se ejecute el debounce porque limpia siempre los pendingEdits, por lo tanto nunca tenemos timeouts
      // Ademas ejecuta el save action cada vez que el usuario escribe, rompiendo todo el propósito del debounce
      // Limpiar todos los timers pendientes
      Object.values(pendingEdits.current).forEach(clearTimeout)

      // Emergency commit
      // actions.save() // Este emergency commit requiere información que no tenemos...
    }
  }, [actions])

  const handleChange = useCallback(
    (field: keyof T, value: unknown, entityId: number | null) => {
      // 1. Actualizar L3 inmediatamente
      actions.update({ [field]: value } as Partial<T>, entityId)

      // 2. Lógica de debounce
      const fieldKey = field as string
      // if (pendingEdits.current[fieldKey]) {
      //   clearTimeout(pendingEdits.current[fieldKey])
      // }

      // Analizar por qué no estamos guardando el timeout en pendingEdits
      // No se está ejecutando el timeout
      pendingEdits.current[fieldKey] = setTimeout(() => {
        console.log('committing called...')
        // Dirty check contra lo último commiteado
        if (value !== lastEditsApplied.current[fieldKey]) {
          actions.save({ [field]: value } as Partial<T>, entityId)
          lastEditsApplied.current[fieldKey] = value
        }
        delete pendingEdits.current[fieldKey]
      }, debounceMs)
    },
    [actions, debounceMs]
  )

  const handleBlur = useCallback(
    (field: keyof T, currentValue: unknown, entityId: number | null) => {
      const fieldKey = field as string

      // Cancelar debounce pendiente
      if (pendingEdits.current[fieldKey]) {
        clearTimeout(pendingEdits.current[fieldKey])
        delete pendingEdits.current[fieldKey]
      }

      // Forzar commit si hay cambios no commiteados
      if (currentValue !== lastEditsApplied.current[fieldKey]) {
        actions.save({ [field]: currentValue } as Partial<T>, entityId)
        lastEditsApplied.current[fieldKey] = currentValue
      }
    },
    [actions]
  )

  return { handleChange, handleBlur }
}
