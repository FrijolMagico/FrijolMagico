'use client'

import * as React from 'react'

interface FestivalNameTransitionProps {
  slug: string
  children: React.ReactNode
  enabled?: boolean
}

export function FestivalNameTransition({
  slug,
  children,
  enabled = true
}: FestivalNameTransitionProps) {
  const ViewTransition = React.ViewTransition

  if (!slug || !enabled || !ViewTransition) return <>{children}</>

  return (
    <ViewTransition name={`festival-name-${slug}`}>{children}</ViewTransition>
  )
}
