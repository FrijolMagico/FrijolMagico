'use client'

import { useOptimistic, useTransition } from 'react'
import { Save, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { toast } from 'sonner'

interface SaveButtonProps {
  onSave: () => Promise<void>
  isDirty: boolean
  isSaving?: boolean
  label?: string
  loadingLabel?: string
  successMessage?: string
  errorMessage?: string
  className?: string
}

export function SaveButton({
  onSave,
  isDirty,
  isSaving: externalIsSaving = false,
  label = 'Guardar cambios',
  loadingLabel = 'Guardando...',
  successMessage = 'Cambios guardados correctamente',
  errorMessage = 'Error al guardar los cambios',
  className
}: SaveButtonProps) {
  const [isPending, startTransition] = useTransition()
  const [optimisticState, setOptimisticState] = useOptimistic(
    { isSaving: isPending || externalIsSaving, hasError: false },
    (_, newState: { isSaving: boolean; hasError: boolean }) => newState
  )

  const handleSave = async () => {
    if (!isDirty) {
      toast.info('No hay cambios para guardar')
      return
    }

    startTransition(async () => {
      setOptimisticState({ isSaving: true, hasError: false })

      try {
        await onSave()
        setOptimisticState({ isSaving: false, hasError: false })
        toast.success(successMessage)
      } catch (error) {
        setOptimisticState({ isSaving: false, hasError: true })
        toast.error(
          error instanceof Error ? error.message : errorMessage
        )
      }
    })
  }

  const isSaving = optimisticState.isSaving

  return (
    <Button
      onClick={handleSave}
      disabled={!isDirty || isSaving}
      className={`gap-2 ${className}`}
    >
      {isSaving ? (
        <>
          <Loader2 className="h-4 w-4 animate-spin" />
          {loadingLabel}
        </>
      ) : (
        <>
          <Save className="h-4 w-4" />
          {label}
        </>
      )}
    </Button>
  )
}
