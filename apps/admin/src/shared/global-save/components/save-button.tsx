import { Loader2 } from 'lucide-react'
import { Button } from '@/shared/components/ui/button'
import { cn } from '@/lib/utils'

export interface SaveButtonProps {
  onSave: () => void
  isPending: boolean
  isDirty: boolean
  label?: string
  className?: string
}

export function SaveButton({
  onSave,
  isPending,
  isDirty,
  label = 'Guardar Cambios',
  className
}: SaveButtonProps) {
  return (
    <Button
      onClick={onSave}
      disabled={!isDirty || isPending}
      className={cn('gap-2', className)}
    >
      {isPending && <Loader2 className='h-4 w-4 animate-spin' />}
      {label}
    </Button>
  )
}
