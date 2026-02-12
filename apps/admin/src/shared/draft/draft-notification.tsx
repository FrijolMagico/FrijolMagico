'use client'

import { Alert, AlertDescription } from '@/shared/components/ui/alert'
import { Button } from '@/shared/components/ui/button'
import { AlertTriangle } from 'lucide-react'

interface DraftNotificationProps {
  onRestore: () => void
  onDismiss: () => void
  title?: string
  message?: string
}

export function DraftNotification({
  onRestore,
  onDismiss,
  title = 'Se encontró un borrador guardado',
  message = 'Se encontró un borrador guardado de cambios anteriores'
}: DraftNotificationProps) {
  return (
    <Alert className='border-amber-200 bg-amber-50'>
      <AlertTriangle className='h-4 w-4 text-amber-600' />
      <AlertDescription className='flex flex-col gap-2'>
        <div className='flex items-start justify-between gap-4'>
          <div className='flex-1'>
            <p className='font-medium text-amber-900'>{title}</p>
            <p className='text-sm text-amber-800'>{message}</p>
          </div>
          <div className='flex gap-2'>
            <Button
              size='sm'
              variant='outline'
              onClick={onDismiss}
              className='h-8'
            >
              Descartar
            </Button>
            <Button size='sm' onClick={onRestore} className='h-8'>
              Restaurar
            </Button>
          </div>
        </div>
      </AlertDescription>
    </Alert>
  )
}
