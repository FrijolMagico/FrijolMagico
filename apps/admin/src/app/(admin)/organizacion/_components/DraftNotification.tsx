'use client'

import { useState } from 'react'
import { AlertCircle, X, RotateCcw } from 'lucide-react'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Button } from '@/components/ui/button'

interface DraftNotificationProps {
  onRestore: () => void
  onDismiss: () => void
}

export function DraftNotification({
  onRestore,
  onDismiss
}: DraftNotificationProps) {
  const [isVisible, setIsVisible] = useState(true)

  if (!isVisible) return null

  return (
    <Alert className='mb-6 border-blue-200 bg-blue-50'>
      <AlertCircle className='h-4 w-4 text-blue-600' />
      <AlertTitle className='text-blue-900'>Borrador guardado</AlertTitle>
      <AlertDescription className='text-blue-800'>
        <div className='flex items-center justify-between gap-4'>
          <p className='flex-1'>
            Tienes cambios sin guardar de una sesión anterior. ¿Deseas
            restaurarlos?
          </p>
          <div className='flex gap-2'>
            <Button
              size='sm'
              variant='outline'
              onClick={() => {
                onRestore()
                setIsVisible(false)
              }}
              className='gap-1'
            >
              <RotateCcw className='h-3 w-3' />
              Restaurar
            </Button>
            <Button
              size='sm'
              variant='ghost'
              onClick={() => {
                onDismiss()
                setIsVisible(false)
              }}
            >
              <X className='h-3 w-3' />
            </Button>
          </div>
        </div>
      </AlertDescription>
    </Alert>
  )
}
