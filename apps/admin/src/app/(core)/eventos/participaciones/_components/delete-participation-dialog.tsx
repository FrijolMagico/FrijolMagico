'use client'

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle
} from '@/shared/components/ui/alert-dialog'

interface DeleteParticipationDialogsProps {
  isRemoveExhibitionDialogOpen: boolean
  isRemoveActivityDialogOpen: boolean
  onRemoveExhibitionOpenChange: (open: boolean) => void
  onRemoveActivityOpenChange: (open: boolean) => void
  onConfirmRemoveExhibition: () => void
  onConfirmRemoveActivity: () => void
}

export function DeleteParticipationDialogs({
  isRemoveExhibitionDialogOpen,
  isRemoveActivityDialogOpen,
  onRemoveExhibitionOpenChange,
  onRemoveActivityOpenChange,
  onConfirmRemoveExhibition,
  onConfirmRemoveActivity
}: DeleteParticipationDialogsProps) {
  return (
    <>
      <AlertDialog
        open={isRemoveExhibitionDialogOpen}
        onOpenChange={onRemoveExhibitionOpenChange}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Quitar como expositor?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta acción eliminará la participación de exposición.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={onConfirmRemoveExhibition}>
              Quitar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <AlertDialog
        open={isRemoveActivityDialogOpen}
        onOpenChange={onRemoveActivityOpenChange}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Eliminar actividad?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta acción eliminará la actividad.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={onConfirmRemoveActivity}>
              Eliminar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}
