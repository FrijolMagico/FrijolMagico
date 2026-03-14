
'use client'

import { useState } from 'react'
import Image from 'next/image'
import {
  Dialog,
  DialogContent,
  DialogTitle
} from '@/shared/components/ui/dialog'
import { Button } from '@/shared/components/ui/button'
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
import { IconPhotoOff } from '@tabler/icons-react'

interface PosterPreviewProps {
  isOpen: boolean
  posterUrl: string | null
  alt: string
  onClose: () => void
  onUpload?: () => void
  onDelete?: () => void
}

export function PosterPreview({
  isOpen,
  posterUrl,
  alt,
  onClose,
  onUpload,
  onDelete
}: PosterPreviewProps) {
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)

  const confirmDelete = () => {
    onDelete?.()
    setShowDeleteConfirm(false)
    onClose()
  }

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent>
        <DialogTitle className='sr-only'>Vista previa de poster</DialogTitle>

        {posterUrl ? (
          <Image
            src={posterUrl}
            alt={alt}
            width={800}
            height={800}
            className='max-w-full object-contain'
            unoptimized
          />
        ) : (
          <div className='bg-muted mx-auto flex h-64 w-64 flex-col items-center justify-center gap-3 rounded-lg'>
            <IconPhotoOff className='text-muted-foreground h-12 w-12' />
            <span className='text-muted-foreground text-sm'>Sin poster</span>
          </div>
        )}

        <div className='flex justify-center gap-3 pt-4'>
          <Button
            variant='outline'
            onClick={() => onUpload?.()}
            className='gap-2'
          >
            {posterUrl ? 'Cambiar imagen' : 'Agregar imagen'}
          </Button>

          {posterUrl && (
            <AlertDialog
              open={showDeleteConfirm}
              onOpenChange={setShowDeleteConfirm}
            >
              <Button
                variant='destructive'
                onClick={() => setShowDeleteConfirm(true)}
              >
                Eliminar
              </Button>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Eliminar poster</AlertDialogTitle>
                  <AlertDialogDescription>
                    Esta acción no se puede deshacer. ¿Estás seguro de eliminar
                    el poster?
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel
                    variant='outline'
                    onClick={() => setShowDeleteConfirm(false)}
                  >
                    Cancelar
                  </AlertDialogCancel>
                  <AlertDialogAction
                    variant='destructive'
                    onClick={confirmDelete}
                  >
                    Eliminar
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}
