'use client'

import { useState } from 'react'
import { Alert, AlertDescription, AlertTitle } from './ui/alert'
import { Button } from './ui/button'
import { FileQuestion } from 'lucide-react'

interface SectionPendingBannerProps {
  sectionLabel: string
  onRestore: () => Promise<void>
  onDiscard: () => Promise<void>
}

export function SectionPendingBanner({
  sectionLabel,
  onRestore,
  onDiscard
}: SectionPendingBannerProps) {
  const [isVisible, setIsVisible] = useState(true)
  const [isLoading, setIsLoading] = useState(false)

  if (!isVisible) return null

  async function handleRestore() {
    setIsLoading(true)
    try {
      await onRestore()
      setIsVisible(false)
    } finally {
      setIsLoading(false)
    }
  }

  async function handleDiscard() {
    setIsLoading(true)
    try {
      await onDiscard()
      setIsVisible(false)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Alert className='mb-6'>
      <FileQuestion className='h-4 w-4' />
      <AlertTitle>Cambios de sesión anterior</AlertTitle>
      <AlertDescription className='flex flex-col gap-2'>
        <p>
          Se encontraron cambios guardados de <strong>{sectionLabel}</strong>.
          ¿Deseas restaurarlos?
        </p>
        <div className='flex gap-2'>
          <Button
            size='sm'
            variant='outline'
            onClick={handleDiscard}
            disabled={isLoading}
            className='h-8'
          >
            Descartar
          </Button>
          <Button
            size='sm'
            onClick={handleRestore}
            disabled={isLoading}
            className='h-8'
          >
            Restaurar
          </Button>
        </div>
      </AlertDescription>
    </Alert>
  )
}
