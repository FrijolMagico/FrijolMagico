'use client'

import { Loader2 } from 'lucide-react'
import { Button } from '@/shared/components/ui/button'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger
} from '@/shared/components/ui/alert-dialog'

interface RouteSaveToolbarProps {
  isDirty: boolean
  onSave: () => void
  onDiscard: () => Promise<void>
  isPending: boolean
}

export function RouteSaveToolbar({
  isDirty,
  onSave,
  onDiscard,
  isPending
}: RouteSaveToolbarProps) {
  if (!isDirty && !isPending) return null

  return (
    <div className='animate-in slide-in-from-bottom-4 fixed bottom-6 left-1/2 z-50 -translate-x-1/2'>
      <div className='flex items-center gap-3 rounded-full border border-zinc-800 bg-zinc-950/90 px-2 py-1.5 pl-5 shadow-2xl backdrop-blur-md'>
        {/* Amber dot + label */}
        <div className='flex items-center gap-2'>
          <span className='h-2 w-2 rounded-full bg-amber-500 shadow-[0_0_6px_rgba(245,158,11,0.6)]' />
          <span className='text-sm font-medium text-zinc-200'>
            Cambios sin guardar
          </span>
        </div>

        {/* Divider */}
        <div className='h-4 w-px bg-zinc-700' />

        {/* Actions */}
        <div className='flex items-center gap-1'>
          <AlertDialog>
            <AlertDialogTrigger
              render={
                <Button
                  variant='ghost'
                  size='sm'
                  disabled={isPending}
                  className='h-8 rounded-full px-3 text-zinc-400 hover:bg-red-950/30 hover:text-red-400'
                >
                  Descartar
                </Button>
              }
            ></AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>¿Descartar cambios?</AlertDialogTitle>
                <AlertDialogDescription>
                  Esta acción eliminará todos los cambios sin guardar de esta
                  sección. No se puede deshacer.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancelar</AlertDialogCancel>
                <AlertDialogAction onClick={onDiscard}>
                  Descartar cambios
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>

          <Button
            variant='default'
            size='sm'
            onClick={onSave}
            disabled={isPending}
            className='h-8 rounded-full bg-zinc-50 px-4 font-semibold text-zinc-950 hover:bg-zinc-200'
          >
            {isPending ? (
              <>
                <Loader2 className='mr-2 h-4 w-4 animate-spin' />
                Guardando...
              </>
            ) : (
              'Guardar'
            )}
          </Button>
        </div>
      </div>
    </div>
  )
}
