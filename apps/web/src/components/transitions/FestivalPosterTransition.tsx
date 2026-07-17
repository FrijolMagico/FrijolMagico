'use client'

import * as React from 'react'

interface FestivalPosterTransitionProps {
  slug: string
  children: React.ReactNode
  enabled?: boolean
}

export function FestivalPosterTransition({
  slug,
  children,
  enabled = true
}: FestivalPosterTransitionProps) {
  const ViewTransition = React.ViewTransition

  if (!slug || !enabled || !ViewTransition) return <>{children}</>

  return (
    <ViewTransition name={`festival-poster-${slug}`}>{children}</ViewTransition>
  )
}
