'use client'

import { authClient } from '@/app/auth/lib/auth-client'
import { useState } from 'react'

export default function LoginPage() {
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleGoogleLogin = async () => {
    try {
      setIsLoading(true)
      setError(null)

      await authClient.signIn.social(
        {
          provider: 'google',
          callbackURL: '/dashboard'
        },
        {
          onError: (ctx) => {
            const message = ctx.error.message || 'Error al iniciar sesión'
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

  return (
    <div className='flex min-h-screen items-center justify-center bg-gray-50'>
      <div className='w-full max-w-md rounded-lg bg-white p-8 shadow-lg'>
        {/* Header */}
        <div className='mb-8 text-center'>
          <h1 className='text-3xl font-bold text-gray-900'>Frijol Mágico</h1>
          <p className='mt-2 text-gray-600'>Panel de Administración</p>
        </div>

        {/* Error message */}
        {error && (
          <div className='mb-6 rounded-md border border-red-200 bg-red-50 p-4'>
            <p className='text-sm text-red-800'>{error}</p>
          </div>
        )}

        {/* Google button */}
        <button
          onClick={handleGoogleLogin}
          disabled={isLoading}
          className='flex w-full items-center justify-center gap-3 rounded-lg border border-gray-300 bg-white px-4 py-3 text-gray-700 shadow-sm transition-colors hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50'
        >
          {isLoading ? (
            <>
              <svg className='h-5 w-5 animate-spin' viewBox='0 0 24 24'>
                <circle
                  className='opacity-25'
                  cx='12'
                  cy='12'
                  r='10'
                  stroke='currentColor'
                  strokeWidth='4'
                  fill='none'
                />
                <path
                  className='opacity-75'
                  fill='currentColor'
                  d='M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z'
                />
              </svg>
              <span>Iniciando sesión...</span>
            </>
          ) : (
            <>
              {/* Google icon SVG */}
              <svg className='h-5 w-5' viewBox='0 0 24 24'>
                <path
                  fill='#4285F4'
                  d='M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z'
                />
                <path
                  fill='#34A853'
                  d='M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z'
                />
                <path
                  fill='#FBBC05'
                  d='M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z'
                />
                <path
                  fill='#EA4335'
                  d='M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z'
                />
              </svg>
              <span>Continuar con Google</span>
            </>
          )}
        </button>

        {/* Footer info */}
        <div className='mt-6 text-center'>
          <p className='text-xs text-gray-500'>
            Solo cuentas <span className='font-semibold'>@frijolmagico.cl</span>{' '}
            pueden acceder
          </p>
        </div>
      </div>
    </div>
  )
}
