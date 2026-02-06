'use client'

import { useOptimistic, useTransition } from 'react'
import { Save, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { updateOrganizacion } from '../actions/organizacion.actions'
import { useOrganizacionForm } from '../_hooks/useOrganizacionForm'
import { toast } from 'sonner'

interface SaveButtonProps {
  onSave?: () => void
}

export function SaveButton({ onSave }: SaveButtonProps) {
  const formData = useOrganizacionForm((state) => state.formData)
  const isDirty = useOrganizacionForm((state) => state.isDirty)
  const markAsSaving = useOrganizacionForm((state) => state.markAsSaving)
  const markAsSaved = useOrganizacionForm((state) => state.markAsSaved)
  const clearDraft = useOrganizacionForm((state) => state.clearDraft)

  const [isPending, startTransition] = useTransition()
  const [optimisticState, setOptimisticState] = useOptimistic(
    { isSaving: isPending, hasError: false },
    (_, newState: { isSaving: boolean; hasError: boolean }) => newState
  )

  const handleSave = async () => {
    if (!isDirty) {
      toast.info('No hay cambios para guardar')
      return
    }

    markAsSaving()

    startTransition(async () => {
      setOptimisticState({ isSaving: true, hasError: false })

      try {
        const result = await updateOrganizacion(formData)

        if (result.success) {
          markAsSaved()
          clearDraft() // Clear draft from localStorage
          setOptimisticState({ isSaving: false, hasError: false })
          toast.success('Cambios guardados correctamente')
          onSave?.() // Notify parent component
        } else {
          setOptimisticState({ isSaving: false, hasError: true })
          toast.error(result.error || 'Error al guardar los cambios')
        }
      } catch (error) {
        setOptimisticState({ isSaving: false, hasError: true })
        toast.error('Error inesperado al guardar')
        console.error(error)
      }
    })
  }

  const isSaving = optimisticState.isSaving || isPending

  return (
    <Button
      onClick={handleSave}
      disabled={!isDirty || isSaving}
      className='gap-2'
    >
      {isSaving ? (
        <>
          <Loader2 className='h-4 w-4 animate-spin' />
          Guardando...
        </>
      ) : (
        <>
          <Save className='h-4 w-4' />
          Guardar cambios
        </>
      )}
    </Button>
  )
}
