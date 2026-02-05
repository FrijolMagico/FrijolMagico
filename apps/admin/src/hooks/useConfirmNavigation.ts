'use client'

import { useEffect } from 'react'

interface UseConfirmNavigationOptions {
  shouldConfirm: boolean
  message?: string
}

export function useConfirmNavigation({
  shouldConfirm,
  message = 'Tienes cambios sin guardar. ¿Estás seguro de que quieres salir?'
}: UseConfirmNavigationOptions): void {
  // Handle beforeunload event (closing tab/browser)
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (shouldConfirm) {
        e.preventDefault()
        e.returnValue = message
        return message
      }
    }

    if (shouldConfirm) {
      window.addEventListener('beforeunload', handleBeforeUnload)
    }

    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload)
    }
  }, [shouldConfirm, message])
}

// Hook for navigation confirmation within the app (using next/router or custom logic)
export function useNavigationBlocker(shouldBlock: boolean): boolean {
  // This is a placeholder for future implementation
  // For now, we rely on beforeunload for basic protection
  return shouldBlock
}
