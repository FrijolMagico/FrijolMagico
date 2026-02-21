import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import type { SectionName, SaveResult } from '../lib/types'
import { saveOrganizacion } from '../actions/save-organizacion.action'
import { saveOrganizacionEquipo } from '../actions/save-organizacion-equipo.action'
import { saveCatalogo } from '../../../app/(authenticated)/(admin)/artistas/catalogo/_actions/save-catalogo.action'
import { saveArtista } from '../actions/save-artista.action'
import { saveEvento } from '../actions/save-evento.action'
import { EntityOperationStore } from '@/shared/ui-state/operation-log/types'

/**
 * Hook to manage UI logic for saving a section.
 * Handles loading state, server action selection, feedback (toasts),
 * and UI state updates (ID mappings).
 *
 * @param section - The section to save
 * @param store - Optional store instance to update IDs and state after save
 */
export function useSectionSave<T>(
  section: SectionName,
  store?: EntityOperationStore<T>
) {
  const [isPending, startTransition] = useTransition()
  const [result, setResult] = useState<SaveResult | null>(null)
  const router = useRouter()

  const save = () => {
    startTransition(async () => {
      let action: ((section: SectionName) => Promise<SaveResult>) | undefined
      switch (section) {
        case 'organizacion':
          action = saveOrganizacion as (
            section: SectionName
          ) => Promise<SaveResult>
          break
        case 'organizacion_equipo':
          action = saveOrganizacionEquipo as (
            section: SectionName
          ) => Promise<SaveResult>
          break
        case 'catalogo_artista':
          action = saveCatalogo as (section: SectionName) => Promise<SaveResult>
          break
        case 'artista':
          action = saveArtista as (section: SectionName) => Promise<SaveResult>
          break
        case 'evento':
          action = saveEvento as (section: SectionName) => Promise<SaveResult>
          break
      }

      if (!action) {
        toast.error(`No save action found for section: ${section}`)
        return
      }

      try {
        const res = await action(section)
        setResult(res)

        if (res.success) {
          toast.success('Guardado correctamente')

          if (store) {
            store.resetStore()
          }

          router.refresh()
        } else {
          toast.error(res.error || 'Error al guardar')
        }
      } catch (error) {
        console.error('Save error:', error)
        toast.error('Error inesperado al guardar')
      }
    })
  }

  return { save, isPending, result }
}
