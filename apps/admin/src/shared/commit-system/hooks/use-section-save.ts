mport { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import type { SectionName, SaveResult } from '../lib/types'
import type { EntityUIStateStore } from '@/shared/ui-state/entity-state'
import { saveOrganizacion } from '../actions/save-organizacion.action'
import { saveCatalogo } from '../../../app/(authenticated)/(admin)/catalogo/_actions/save-catalogo.action'
import { saveArtista } from '../actions/save-artista.action'
import { saveEvento } from '../actions/save-evento.action'
import { useState, useTransition } from 'react'

/**
 * Hook to manage UI logic for saving a section.
 * Handles loading state, server action selection, feedback (toasts),
 * and UI state updates (ID mappings).
 *
 * @param section - The section to save
 * @param store - Optional store instance to update IDs and state after save
 */
export function useSectionSave(
  section: SectionName,
  store?: EntityUIStateStore<any>
) {
  const [isPending, startTransition] = useTransition()
  const [result, setResult] = useState()<SaveResult | null>(null)
  const router = useRouter()

  const save = () => {
    startTransition(async () => {
      let action: ((section: any) => Promise<SaveResult>) | undefined
      switch (section) {
        case 'organizacion':
          action = saveOrganizacion
          break
        case 'catalogo':
          action = saveCatalogo
          break
        case 'artista':
          action = saveArtista
          break
        case 'evento':
          action = saveEvento
          break
      }

      if (!action) {
        toast.error(`No save action found for section: ${section}`)
        return
      }

      try {
        const res = await action(section as any)
        setResult(res)

        if (res.success) {
          toast.success('Guardado correctamente')

          if (store) {
            const currentItems = store.selectAll()

            let newItems = currentItems
            if (res.mappings && res.mappings.length > 0) {
              newItems = currentItems.map((item: any) => {
                const mapping = res.mappings!.find(
                  (m) => m.tempId === String(item.id)
                )

                if (mapping) {
                  return { ...item, id: mapping.realId }
                }
                return item
              })
            }

            store.setAll(newItems)
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
