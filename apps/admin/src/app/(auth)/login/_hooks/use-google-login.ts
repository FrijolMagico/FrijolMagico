'use client'

import { authClient } from '@/lib/auth/'
import { useState } from 'react'

export function useGoogleLogin() {
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const login = async () => {
    try {
      setIsLoading(true)
      setError(null)

      await authClient.signIn.social(
        {
          provider: 'google',
          callbackURL: '/dashboard'
        },
        {
          onError: (_ctx) => {
            const message = _ctx.error.message || 'Error al iniciar sesión'
            setError(message)
            setIsLoading(false)
          }
        }
      )
    } catch (err: unknown) {
      const errorMessage =
        err instanceof Error ? err.message : 'Error inesperado'
      setError(errorMessage)
      setIsLoading(false)
    }
  }

  return { login, isLoading, error }
}
