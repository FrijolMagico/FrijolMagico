'use client'

import { useEffect, useState } from 'react'

import { getArtistAvatarHistoryAction } from '../../_actions/get-artist-avatar-history.action'
import {
  clampAvatarHistoryIndex,
  createAvatarSequence,
  type ArtistAvatarHistoryItem,
  type AvatarSequenceItem
} from '../_lib/artist-avatar-history'

interface UseArtistAvatarHistoryOptions {
  artistId: number
  activeAvatar: AvatarSequenceItem | null
}

export function useArtistAvatarHistory({
  artistId,
  activeAvatar
}: UseArtistAvatarHistoryOptions) {
  const [history, setHistory] = useState<ArtistAvatarHistoryItem[]>([])
  const [selectedIndex, setSelectedIndex] = useState(activeAvatar ? 0 : -1)
  const [error, setError] = useState<string | null>(null)
  const avatars = createAvatarSequence(activeAvatar, history)

  useEffect(() => {
    let cancelled = false

    void getArtistAvatarHistoryAction(artistId)
      .then((nextHistory) => {
        if (cancelled) return
        setHistory(nextHistory)
        setSelectedIndex(activeAvatar ? 0 : -1)
      })
      .catch((reason: unknown) => {
        if (cancelled) return
        setError(
          reason instanceof Error
            ? reason.message
            : 'No se pudo cargar el historial de avatares'
        )
      })

    return () => {
      cancelled = true
    }
  }, [activeAvatar, artistId])

  return {
    avatars,
    selectedIndex,
    selectedAvatar: avatars[selectedIndex] ?? null,
    error,
    selectIndex: (index: number) =>
      setSelectedIndex(
        activeAvatar
          ? clampAvatarHistoryIndex(index, avatars.length)
          : Math.min(Math.max(index, -1), Math.max(avatars.length - 1, -1))
      )
  }
}
