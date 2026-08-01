'use client'

import type { ChangeEvent } from 'react'
import Image from 'next/image'
import { IconChevronLeft, IconChevronRight } from '@tabler/icons-react'

import { Button } from '@/shared/components/ui/button'
import type { ManagedAssetReference } from '@/shared/assets-manager/managed-asset-reference'
import type { AvatarControllerState } from '../_hooks/use-avatar-controller'
import type { PreparationResult } from '@/shared/assets-manager/client/preparation'
import type { AvatarSequenceItem } from '../_lib/artist-avatar-history'

import { useAvatarController } from '../_hooks/use-avatar-controller'
import type { AvatarEnqueueInput } from '../_hooks/use-avatar-controller'
import { cn } from '@/shared/lib/utils'
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger
} from '@/shared/components/ui/tooltip'

const ACCEPTED_AVATAR_TYPES = 'image/jpeg,image/png,image/webp'

export interface ExternalAvatarController {
  state: AvatarControllerState
  selectFile: (file: File) => Promise<PreparationResult>
  enqueue: (
    entityId: string | number,
    input?: AvatarEnqueueInput
  ) => Promise<void>
  cancel: () => void
  retry: () => Promise<void>
}

export interface ArtistAvatarSectionProps {
  artistId: string | number | null
  slug?: string
  currentAvatar?: ManagedAssetReference | null
  autoEnqueue?: boolean
  controller?: ExternalAvatarController
  avatars?: AvatarSequenceItem[]
  selectedIndex?: number
  onSelectIndex?: (index: number) => void
  onPreparedUpload?: () => void
}

function progressFor(sentBytes: number, totalBytes: number): number {
  return totalBytes > 0 ? Math.round((sentBytes / totalBytes) * 100) : 0
}

export function ArtistAvatarSection({
  artistId,
  slug,
  currentAvatar = null,
  autoEnqueue = true,
  controller: externalController,
  avatars = [],
  selectedIndex = 0,
  onSelectIndex,
  onPreparedUpload
}: ArtistAvatarSectionProps) {
  const internalController = useAvatarController({
    initialAvatar: currentAvatar
  })
  const controller = externalController ?? internalController
  const selectedAvatar = avatars[selectedIndex] ?? null
  const selectedPath =
    selectedAvatar?.path ?? controller.state.currentAvatar?.path
  const previewUrl = controller.state.preview?.url ?? selectedPath
  const isBusy =
    controller.state.phase === 'preparing' ||
    controller.state.phase === 'uploading'
  const progress = controller.state.job
    ? progressFor(
        controller.state.job.sentBytes,
        controller.state.job.totalBytes
      )
    : 0
  const showErrorActions =
    controller.state.phase === 'failed' &&
    (controller.state.errorKind === 'unknown' ||
      controller.state.job?.failedStep != null)
  const selectFile = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.currentTarget.files?.[0]
    event.currentTarget.value = ''
    if (!file) return
    void controller.selectFile(file).then((result) => {
      if (result.phase !== 'ready') return
      onPreparedUpload?.()
      if (artistId !== null && autoEnqueue)
        void controller.enqueue(artistId, slug ? { slug } : undefined)
    })
  }
  return (
    <section
      aria-labelledby='artist-avatar-section-title'
      className='flex flex-col gap-4'
    >
      {!previewUrl && (
        <h2 id='artist-avatar-section-title' className='text-sm font-medium'>
          Avatar del artista <span className='text-destructive ml-1'>*</span>
        </h2>
      )}
      <div className='flex flex-col items-center gap-4'>
        <div className='flex items-center'>
          <Button
            type='button'
            variant='ghost'
            size='icon'
            aria-label='Avatar anterior'
            disabled={selectedIndex <= 0}
            onClick={() => onSelectIndex?.(selectedIndex - 1)}
          >
            <IconChevronLeft aria-hidden='true' />
          </Button>

          <label
            htmlFor={`artist-avatar-file-${artistId ?? 'new'}`}
            className={cn(
              'bg-muted flex size-24 shrink-0 cursor-pointer items-center justify-center overflow-hidden rounded-full text-center transition-colors',
              !previewUrl &&
                'border-border hover:border-primary border border-dashed',
              previewUrl && 'transition-transform hover:scale-105'
            )}
          >
            {previewUrl ? (
              <Tooltip>
                <TooltipContent side='top' align='center'>
                  Haz click para seleccionar un nuevo avatar
                </TooltipContent>
                <TooltipTrigger
                  render={
                    <Image
                      src={previewUrl}
                      alt='Vista previa del avatar'
                      width={96}
                      height={96}
                      className='size-full object-cover'
                    />
                  }
                ></TooltipTrigger>
              </Tooltip>
            ) : (
              <span className='text-muted-foreground text-xs'>
                Seleccionar avatar
              </span>
            )}
            <input
              id={`artist-avatar-file-${artistId ?? 'new'}`}
              type='file'
              accept={ACCEPTED_AVATAR_TYPES}
              onChange={selectFile}
              disabled={isBusy}
              className='sr-only'
            />
          </label>
          <Button
            type='button'
            variant='ghost'
            size='icon'
            aria-label='Avatar siguiente'
            disabled={selectedIndex >= avatars.length - 1}
            onClick={() => onSelectIndex?.(selectedIndex + 1)}
          >
            <IconChevronRight aria-hidden='true' />
          </Button>
        </div>
        {!previewUrl && selectedIndex === -1 && avatars.length > 0 && (
          <span className='text-muted-foreground text-xs'>
            Seleccione uno de los avatares antiguos o suba uno nuevo.
          </span>
        )}
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
          {showErrorActions && (
            <>
              <Button
                type='button'
                variant='outline'
                size='sm'
                onClick={() => void controller.retry()}
              >
                Reintentar
              </Button>
              <Button
                type='button'
                variant='ghost'
                size='sm'
                onClick={controller.cancel}
              >
                Descartar
              </Button>
            </>
          )}
        </div>
      )}
    </section>
  )
}
