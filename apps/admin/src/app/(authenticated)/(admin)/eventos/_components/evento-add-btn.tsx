'use client'
import { Button } from '@/shared/components/ui/button'
import { IconPlus } from '@tabler/icons-react'
import { useEventoDialog } from '../_store/evento-dialog-store'

export function EventoAddBtn() {
  const openDialog = useEventoDialog((s) => s.openDialog)
  return (
    <Button onClick={() => openDialog(null)} size='sm' variant='outline'>
      <IconPlus className='h-4 w-4' />
      Agregar Evento
    </Button>
  )
}
