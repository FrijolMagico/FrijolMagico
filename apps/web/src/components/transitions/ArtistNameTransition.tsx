'use client'

import { ViewTransition } from 'react'

import type { ReactNode } from 'react'

interface ArtistNameTransitionProps {
  slug: string
  children: ReactNode
  className?: string
}

export function ArtistNameTransition({
  slug,
  children
}: ArtistNameTransitionProps) {
  if (!slug) return <>{children}</>

  return (
    <ViewTransition name={`artist-name-${slug}`}>{children}</ViewTransition>
  )
}
