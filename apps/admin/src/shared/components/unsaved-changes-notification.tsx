'use client'

import { useEffect, useState } from 'react'
import { Alert, AlertDescription, AlertTitle } from './ui/alert'
import { AlertTriangle } from 'lucide-react'
import { Button } from './ui/button'
import Link from 'next/link'

export function UnsavedChangesNotification() {
  const [unsavedSectionsList, setUnsavedSectionList] = useState<Array<string>>(
    []
  )

  const [isVisible, setIsVisible] = useState(false)

  // TODO: Evaluate if we need an effect to check for unsaved changes on focus (e.g. user comes back to tab after some time, reload, etc.)
  useEffect(() => {
    // Get the list of sections with unsaved changes from journal
    const unsavedSectionsList = ['organizacion'] // TODO: replace with actual journal query
    if (unsavedSectionsList.length === 0) {
      return
    }

    // Save list in the state
    setUnsavedSectionList(['organizacion']) // TODO: replace with actual journal query
    setIsVisible(true)
  }, []) // ONLY run on mount

  function onRestore() {
    setIsVisible(true)
  }
  function onDismiss() {}

  if (!isVisible || unsavedSectionsList.length === 0) {
    return null
  }

  return (
    <Alert className='bg-accent'>
      <AlertTriangle />
      <AlertDescription className='flex flex-col gap-2'>
        <div className='flex-1'>
          <AlertTitle>Se encontró un borrador guardado</AlertTitle>
          <AlertDescription>
            Se encontró un borrador guardado de cambios anteriores
          </AlertDescription>
          <div className='py-2'>
            <ul className=''>
              {unsavedSectionsList.map((section) => {
                const sectionPath = `/cambios/preview/${section}`

                return (
                  <li key={section} className='text-sm'>
                    <Link href={sectionPath} className='no-underline'>
                      - {section}
                    </Link>
                  </li>
                )
              })}
            </ul>
          </div>
        </div>
        <div className='flex gap-2'>
          <Button
            size='sm'
            variant='destructive'
            onClick={onDismiss}
            className='h-8'
          >
            Descartar
          </Button>
          <Button size='sm' onClick={onRestore} className='h-8'>
            Restaurar
          </Button>
        </div>
      </AlertDescription>
    </Alert>
  )
}
