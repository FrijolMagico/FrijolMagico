'use client'

import { useRef, useState, useTransition } from 'react'

import { getArtistAvatarAction } from '../../_actions/get-artist-avatar.action'
import type { ActiveAvatar } from '../_lib/avatar-history-contracts'

export function useActiveArtistAvatar() {
  const [avatar, setAvatar] = useState<ActiveAvatar | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [isPending, startTransition] = useTransition()
  const requestId = useRef(0)

  const load = (artistId: number | null) => {
    const currentRequest = ++requestId.current
    setAvatar(null)
    setError(null)
    if (artistId === null) return

    startTransition(async () => {
      try {
        const nextAvatar = await getArtistAvatarAction(artistId)
        if (currentRequest !== requestId.current) return
        setAvatar(nextAvatar)
      } catch (reason: unknown) {
        if (currentRequest !== requestId.current) return
        setError(
          reason instanceof Error
            ? reason.message
            : 'No se pudo cargar el avatar'
        )
      }
    })
  }

  const clear = () => {
    requestId.current += 1
    setAvatar(null)
    setError(null)
  }

  return { avatar, error, isPending, load, clear }
}
