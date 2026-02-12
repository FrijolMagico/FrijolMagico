'use client'

import { Button } from '@/shared/components/ui/button'
import { Loader2 } from 'lucide-react'

interface GlobalSaveButtonProps {
  hasChanges: boolean
  onSave: () => Promise<void> | void
  isSaving?: boolean
}

export function GlobalSaveButton({
  hasChanges,
  onSave,
  isSaving = false
}: GlobalSaveButtonProps) {
  return (
    <Button
      onClick={onSave}
      disabled={!hasChanges || isSaving}
      className='gap-2'
    >
      {isSaving && <Loader2 className='h-4 w-4 animate-spin' />}
      {isSaving ? 'Guardando...' : 'Guardar'}
    </Button>
  )
}
