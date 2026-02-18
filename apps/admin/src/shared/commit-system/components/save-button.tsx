import { Loader2 } from 'lucide-react'
import { Button } from '@/shared/components/ui/button'
import { cn } from '@/lib/utils'
import type { SectionName } from '../lib/types'
import { useJournalDirty } from '../hooks/use-journal-dirty'
import { useSectionSave } from '../hooks/use-section-save'

interface SaveButtonProps {
  section: SectionName
  label?: string
  className?: string
}

export function SaveButton({
  section,
  label = 'Guardar Cambios',
  className
}: SaveButtonProps) {
  const { save, isPending } = useSectionSave(section)
  const isDirty = useJournalDirty(section)

  return (
    <Button
      onClick={save}
      disabled={!isDirty || isPending}
      className={cn('gap-2', className)}
    >
      {isPending && <Loader2 className='h-4 w-4 animate-spin' />}
      {label}
    </Button>
  )
}
