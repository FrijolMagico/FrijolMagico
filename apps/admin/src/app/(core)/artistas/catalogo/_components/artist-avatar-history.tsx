'use client'

import { useState } from 'react'

import { getArtistAvatarHistoryAction } from '../../_actions/get-artist-avatar-history.action'
import { restoreArtistAvatarAction } from '../../_actions/restore-artist-avatar.action'
import {
  getAvatarHistoryItem,
  type ArtistAvatarHistoryItem
} from '../_lib/artist-avatar-history'
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

interface ArtistAvatarHistoryProps {
  artistId: number
}

export function ArtistAvatarHistory({ artistId }: ArtistAvatarHistoryProps) {
  const [history, setHistory] = useState<ArtistAvatarHistoryItem[] | null>(
    null
  )
  const [selectedIndex, setSelectedIndex] = useState(0)
  const [confirming, setConfirming] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const selected = history
    ? getAvatarHistoryItem(history, selectedIndex)
    : null

  const loadHistory = async () => {
    try {
      const nextHistory = await getArtistAvatarHistoryAction(artistId)
      setHistory(nextHistory)
      setSelectedIndex(0)
      setError(null)
    } catch (error) {
      setError(
        error instanceof Error ? error.message : 'No se pudo cargar el historial'
      )
    }
  }
  const restore = async () => {
    if (!selected || selected.deletedAt === null) return
    const result = await restoreArtistAvatarAction({
      artistaId: artistId,
      avatarId: selected.id
    })
    if (!result.success) {
      setError(result.errors?.[0]?.message ?? 'No se pudo restaurar el avatar')
      return
    }
    setConfirming(false)
    await loadHistory()
  }

  return (
    <div className='flex flex-col gap-2'>
      <Button
        type='button'
        variant='outline'
        size='sm'
        onClick={() => void loadHistory()}
      >
        Ver historial
      </Button>
      {history && selected && (
        <div aria-live='polite' className='flex items-center gap-2'>
          <Button
            type='button'
            variant='ghost'
            size='sm'
            onClick={() => setSelectedIndex(Math.max(0, selectedIndex - 1))}
          >
            Anterior
          </Button>
          <span>{selected.path}</span>
          <Button
            type='button'
            variant='ghost'
            size='sm'
            onClick={() =>
              setSelectedIndex(
                Math.min(history.length - 1, selectedIndex + 1)
              )
            }
          >
            Siguiente
          </Button>
          {selected.deletedAt !== null && (
            <Button
              type='button'
              size='sm'
              onClick={() => setConfirming(true)}
            >
              Restaurar avatar
            </Button>
          )}
        </div>
      )}
      {error && <p role='alert'>{error}</p>}
      <AlertDialog open={confirming} onOpenChange={setConfirming}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Restaurar este avatar?</AlertDialogTitle>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction type='button' onClick={() => void restore()}>
              Restaurar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
