'use client'

import { useEffect, useState } from 'react'
import { Alert, AlertDescription, AlertTitle } from './ui/alert'
import { Info } from 'lucide-react'
import { getSectionsWithChanges } from '@/shared/change-journal/change-journal'
import {
  JOURNAL_ENTITY_LABELS,
  type JournalEntity
} from '@/shared/lib/database-entities'
import Link from 'next/link'

const ENTITY_TO_ROUTE: Partial<Record<JournalEntity, string>> = {
  organizacion: '/general',
  organizacion_equipo: '/general',
  artista: '/artistas',
  catalogo_artista: '/artistas/catalogo',
  artista_historial: '/artistas/listado'
}

export function UnsavedChangesNotification() {
  const [unsavedSections, setUnsavedSections] = useState<JournalEntity[]>([])
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    async function checkForUnsavedChanges() {
      const sections = await getSectionsWithChanges()
      const entitySections = sections
        .filter(({ count }) => count > 0)
        .map(({ section }) => section as JournalEntity)

      setUnsavedSections(entitySections)
      setIsVisible(entitySections.length > 0)
    }

    checkForUnsavedChanges()

    // Re-check when journal changes (e.g., after discard/restore)
    window.addEventListener('journal-changed', checkForUnsavedChanges)
    return () => window.removeEventListener('journal-changed', checkForUnsavedChanges)
  }, [])

  if (!isVisible || unsavedSections.length === 0) {
    return null
  }

  return (
    <Alert className='mb-6'>
      <Info className='h-4 w-4' />
      <AlertTitle>Cambios pendientes</AlertTitle>
      <AlertDescription>
        <p className='mb-2'>
          Tienes cambios guardados en las siguientes secciones:
        </p>
        <ul className='list-inside list-disc space-y-1'>
          {unsavedSections.map((section) => {
            const label = JOURNAL_ENTITY_LABELS[section]
            const route = ENTITY_TO_ROUTE[section]

            return (
              <li key={section} className='text-sm'>
                {route ? (
                  <Link
                    href={route}
                    className='text-primary font-medium hover:underline'
                  >
                    {label}
                  </Link>
                ) : (
                  <span>{label}</span>
                )}
              </li>
            )
          })}
        </ul>
        <p className='text-muted-foreground mt-2 text-sm'>
          Navega a cada sección para restaurar o descartar los cambios.
        </p>
      </AlertDescription>
    </Alert>
  )
}
