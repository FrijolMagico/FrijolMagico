'use client'

import { useState, type ChangeEvent } from 'react'
import Image from 'next/image'

import { getAvatarUrl } from '@/shared/lib/cdn'
import { Button } from '@/shared/components/ui/button'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle
} from '@/shared/components/ui/alert-dialog'
import type { ManagedAssetReference } from '@/shared/assets-manager/managed-asset-reference'
import type { AvatarControllerState } from '../_hooks/use-avatar-controller'
import type { PreparationResult } from '@/shared/assets-manager/client/preparation'

import { useAvatarController } from '../_hooks/use-avatar-controller'

const ACCEPTED_AVATAR_TYPES = 'image/jpeg,image/png,image/webp'

export interface ExternalAvatarController {
  state: AvatarControllerState
  selectFile: (file: File) => Promise<PreparationResult>
  enqueue: (entityId: string | number) => Promise<void>
  cancel: () => void
  retry: () => Promise<void>
}

export interface ArtistAvatarSectionProps {
  artistId: string | number | null
  currentAvatar?: ManagedAssetReference | null
  onRemove?: (artistId: string | number) => void | Promise<void>
  autoEnqueue?: boolean
  controller?: ExternalAvatarController
}

function progressFor(sentBytes: number, totalBytes: number): number {
  return totalBytes > 0 ? Math.round((sentBytes / totalBytes) * 100) : 0
}

export function ArtistAvatarSection({
  artistId,
  currentAvatar = null,
  onRemove,
  autoEnqueue = true,
  controller: externalController
}: ArtistAvatarSectionProps) {
  const internalController = useAvatarController({
    initialAvatar: currentAvatar
  })
  const controller = externalController ?? internalController
  const [confirmationStep, setConfirmationStep] = useState<1 | 2 | null>(null)
  const previewUrl =
    controller.state.preview?.url ??
    (controller.state.currentAvatar?.path
      ? getAvatarUrl(controller.state.currentAvatar.path)
      : null)
  const isBusy =
    controller.state.phase === 'preparing' ||
    controller.state.phase === 'uploading'
  const progress = controller.state.job
    ? progressFor(
        controller.state.job.sentBytes,
        controller.state.job.totalBytes
      )
    : 0
  const selectFile = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.currentTarget.files?.[0]
    event.currentTarget.value = ''
    if (!file) return
    void controller.selectFile(file).then((result) => {
      if (result.phase === 'ready' && artistId !== null && autoEnqueue)
        void controller.enqueue(artistId)
    })
  }
  const confirmRemoval = () => {
    if (confirmationStep === 1) {
      setConfirmationStep(2)
      return
    }
    if (artistId !== null && onRemove) void onRemove(artistId)
    setConfirmationStep(null)
  }

  return (
    <section
      aria-labelledby='artist-avatar-section-title'
      className='flex flex-col gap-4'
    >
      <h2 id='artist-avatar-section-title' className='text-sm font-medium'>
        Avatar del artista <span className='text-destructive ml-1'>*</span>
      </h2>
      <div className='flex flex-col items-center gap-4'>
        <label
          htmlFor='artist-avatar-file'
          className='bg-muted border-border hover:border-primary focus-within:border-primary flex size-24 shrink-0 cursor-pointer items-center justify-center overflow-hidden rounded-full border border-dashed text-center transition-colors'
        >
          {previewUrl ? (
            <Image
              src={new URL(previewUrl).toString()}
              alt='Vista previa del avatar'
              width={96}
              height={96}
              className='size-full object-cover'
            />
          ) : (
            <span className='text-muted-foreground text-xs'>
              Seleccionar avatar
            </span>
          )}
          <input
            id='artist-avatar-file'
            type='file'
            accept={ACCEPTED_AVATAR_TYPES}
            onChange={selectFile}
            disabled={isBusy}
            className='sr-only'
          />
        </label>
        {!previewUrl && (
          <span className='text-muted-foreground text-xs'>JPG, PNG o WebP</span>
        )}
      </div>
      {(controller.state.phase === 'uploading' ||
        controller.state.phase === 'completed') &&
        controller.state.job && (
          <div role='status' aria-live='polite'>
            <span>{progress}%</span>
            <progress
              value={progress}
              max={100}
              aria-label='Progreso de carga'
            />
          </div>
        )}
      {controller.state.error && (
        <div role='alert' className='text-destructive text-sm'>
          {controller.state.error}
          {controller.state.phase === 'failed' && (
            <Button
              type='button'
              variant='outline'
              size='sm'
              onClick={() => void controller.retry()}
            >
              Reintentar
            </Button>
          )}
        </div>
      )}
      {controller.state.currentAvatar && (
        <>
          <Button
            type='button'
            variant='destructive'
            size='sm'
            onClick={() => setConfirmationStep(1)}
          >
            Eliminar avatar
          </Button>
          <AlertDialog
            open={confirmationStep !== null}
            onOpenChange={(open) => {
              if (!open) setConfirmationStep(null)
            }}
          >
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>
                  {confirmationStep === 1
                    ? '¿Estás seguro de eliminar el avatar?'
                    : 'Confirma la eliminación del avatar'}
                </AlertDialogTitle>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancelar</AlertDialogCancel>
                <AlertDialogAction
                  type='button'
                  variant='destructive'
                  onClick={confirmRemoval}
                >
                  {confirmationStep === 1 ? 'Continuar' : 'Eliminar avatar'}
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
          <span className='sr-only'>¿Estás seguro de eliminar el avatar?</span>
        </>
      )}
    </section>
  )
}
