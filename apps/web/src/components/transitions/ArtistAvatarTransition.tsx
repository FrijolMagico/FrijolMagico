'use client'

import { ViewTransition } from 'react'

import type { ReactNode } from 'react'

interface ArtistAvatarTransitionProps {
  slug: string
  children: ReactNode
  className?: string
}

export function ArtistAvatarTransition({
  slug,
  children
}: ArtistAvatarTransitionProps) {
  if (!slug) return <>{children}</>

  return (
    <ViewTransition name={`artist-avatar-${slug}`}>{children}</ViewTransition>
  )
}
