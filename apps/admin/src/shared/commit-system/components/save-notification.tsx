'use client'

import * as React from 'react'
import {
  CheckCircle,
  XCircle,
  Loader2,
  ChevronDown,
  ChevronUp,
  X
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { type SaveResult } from '../lib/types'

interface SaveNotificationProps {
  /**
   * Current save result state.
   * If null, the component will not render unless isSaving is true.
   */
  result: SaveResult | null

  /**
   * Whether a save operation is currently in progress.
   */
  isSaving: boolean

  /**
   * Callback to dismiss the notification manually.
   */
  onDismiss?: () => void

  /**
   * Optional custom class name.
   */
  className?: string
}

export function SaveNotification({
  result,
  isSaving,
  onDismiss,
  className
}: SaveNotificationProps) {
  const [isExpanded, setIsExpanded] = React.useState(false)

  // Don't render anything if idle (not saving and no result to show)
  if (!isSaving && !result) {
    return null
  }

  const isError = result?.success === false
  const isSuccess = result?.success === true

  return (
    <div
      role='alert'
      className={cn(
        'animate-in slide-in-from-bottom-2 fade-in-0 fixed right-4 bottom-4 z-50 w-full max-w-sm overflow-hidden rounded-lg border shadow-lg transition-all duration-300 ease-in-out',
        isSaving && 'bg-background border-border text-foreground',
        isSuccess &&
          'border-green-200 bg-green-50 text-green-800 dark:border-green-800 dark:bg-green-900/20 dark:text-green-300',
        isError &&
          'border-red-200 bg-red-50 text-red-800 dark:border-red-800 dark:bg-red-900/20 dark:text-red-300',
        className
      )}
    >
      <div className='p-4'>
        <div className='flex items-start gap-3'>
          <div className='mt-0.5 shrink-0'>
            {isSaving ? (
              <Loader2 className='text-muted-foreground h-5 w-5 animate-spin' />
            ) : isSuccess ? (
              <CheckCircle className='h-5 w-5 text-green-600 dark:text-green-400' />
            ) : (
              <XCircle className='h-5 w-5 text-red-600 dark:text-red-400' />
            )}
          </div>

          <div className='flex-1 space-y-1'>
            <h4 className='text-sm leading-none font-semibold tracking-tight'>
              {isSaving
                ? 'Guardando cambios...'
                : isSuccess
                  ? 'Cambios guardados'
                  : 'Error al guardar'}
            </h4>

            {!isSaving && (
              <p className='text-sm opacity-90'>
                {isSuccess
                  ? 'La información se ha actualizado correctamente.'
                  : result?.error || 'Ocurrió un error inesperado.'}
              </p>
            )}

            {isError && result?.error && result.error.length > 50 && (
              <div className='pt-2'>
                <button
                  onClick={() => setIsExpanded(!isExpanded)}
                  className='flex items-center text-xs font-medium hover:underline focus:outline-none'
                >
                  {isExpanded ? 'Ocultar detalles' : 'Ver detalles'}
                  {isExpanded ? (
                    <ChevronUp className='ml-1 h-3 w-3' />
                  ) : (
                    <ChevronDown className='ml-1 h-3 w-3' />
                  )}
                </button>

                {isExpanded && (
                  <div className='bg-background/50 mt-2 rounded border border-black/5 p-2 font-mono text-xs break-words whitespace-pre-wrap dark:border-white/5'>
                    {result.error}
                    {result.errorCode && (
                      <div className='mt-1 opacity-75'>
                        Code: {result.errorCode}
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}
          </div>

          {onDismiss && (
            <button
              onClick={onDismiss}
              className={cn(
                'shrink-0 rounded-md p-1 opacity-70 transition-opacity hover:opacity-100 focus:ring-2 focus:ring-offset-2 focus:outline-none',
                isSuccess
                  ? 'focus:ring-green-500'
                  : isError
                    ? 'focus:ring-red-500'
                    : 'focus:ring-slate-500'
              )}
              aria-label='Close'
            >
              <X className='h-4 w-4' />
            </button>
          )}
        </div>
      </div>
    </div>
  )
}
