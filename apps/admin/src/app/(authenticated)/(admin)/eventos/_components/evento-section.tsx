'use client'

import { useEventoProjectionStore } from '../_store/evento-ui-store'
import { useEventoDialog } from '../_store/evento-dialog-store'
import { EventoCard } from './evento-card'
import { EventoDialog } from './evento-dialog'
import { EventoSaveBar } from './evento-save-bar'
import { Button } from '@/shared/components/ui/button'
import { Plus } from 'lucide-react'

export function EventoSection() {
  const allIds = useEventoProjectionStore((s) => s.allIds)
  const openDialog = useEventoDialog((s) => s.openDialog)

  return (
    <div className='space-y-6'>
      <div className='flex justify-end'>
        <Button onClick={() => openDialog(null)} className='gap-2'>
          <Plus className='h-4 w-4' />
          Agregar Evento
        </Button>
      </div>

      {allIds.length === 0 ? (
        <div className='flex h-40 items-center justify-center rounded-lg border border-dashed'>
          <p className='text-muted-foreground text-sm'>
            No hay eventos registrados
          </p>
        </div>
      ) : (
        <div className='grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3'>
          {allIds.map((id) => (
            <EventoCard key={id} id={id} />
          ))}
        </div>
      )}

      <EventoDialog />
      <EventoSaveBar />
    </div>
  )
}
