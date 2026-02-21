'use client'

import { useEffect, useState } from 'react'
import { Alert, AlertDescription, AlertTitle } from './ui/alert'
import { AlertTriangle } from 'lucide-react'
import { Button } from './ui/button'
import {
  getSectionsWithChanges,
  clearSection
} from '@/shared/change-journal/change-journal'
import type { JournalEntity } from '@/shared/lib/database-entities'

export function UnsavedChangesNotification() {
  const [unsavedSections, setUnsavedSections] = useState<JournalEntity[]>([])
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    async function checkForUnsavedChanges() {
      const sections = await getSectionsWithChanges()
      const entitySections = sections
        .filter(({ count }) => count > 0)
        .map(({ section }) => section as JournalEntity)

      if (entitySections.length > 0) {
        setUnsavedSections(entitySections)
        setIsVisible(true)
      }
    }

    checkForUnsavedChanges()
  }, [])

  async function handleDismiss() {
    for (const section of unsavedSections) {
      await clearSection(section)
    }
    setUnsavedSections([])
    setIsVisible(false)
  }

  async function handleRestore() {
    // for (const entity of unsavedSections) {
    //   const store = getStoreForEntity(entity)
    //   if (!store) continue
    //
    //   const entries = await getLatestEntries(entity)
    //   const operations = journalEntriesToOperations(entries)
    //
    //   if (operations.length > 0) {
    //     store.setState((state) => ({
    //       appliedChanges: {
    //         operations: [
    //           ...(state.appliedChanges?.operations ?? []),
    //           ...operations
    //         ],
    //         lastApplied: new Date()
    //       } satisfies AppliedChanges<unknown>
    //     }))
    //   }
    // }

    setIsVisible(false)
  }

  if (!isVisible || unsavedSections.length === 0) {
    return null
  }

  return (
    <Alert className='bg-accent mb-6'>
      <AlertTriangle />
      <AlertDescription className='flex flex-col gap-2'>
        <div className='flex-1'>
          <AlertTitle>Se encontró un borrador guardado</AlertTitle>
          <AlertDescription>
            Se encontró un borrador guardado de cambios anteriores
          </AlertDescription>
          <div className='py-2'>
            <ul>
              {unsavedSections.map((section) => (
                <li key={section} className='text-sm'>
                  - {section}
                </li>
              ))}
            </ul>
          </div>
        </div>
        <div className='flex gap-2'>
          <Button
            size='sm'
            variant='destructive'
            onClick={handleDismiss}
            className='h-8'
          >
            Descartar
          </Button>
          <Button size='sm' onClick={handleRestore} className='h-8'>
            Restaurar
          </Button>
        </div>
      </AlertDescription>
    </Alert>
  )
}
