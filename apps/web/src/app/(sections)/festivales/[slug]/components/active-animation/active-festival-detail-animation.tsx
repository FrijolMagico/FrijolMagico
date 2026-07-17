'use client'

import { useRef, type ReactNode } from 'react'

import { FestivalSpoilerToggle } from './festival-spoiler-toggle'
import {
  useFestivalDetailAnimations,
  type FestivalAnimationAdapter
} from '../../hooks/use-festival-detail-animations'

interface ActiveFestivalDetailAnimationProps {
  slug: string
  children: ReactNode
  animationAdapter?: FestivalAnimationAdapter
}

export function ActiveFestivalDetailAnimation({
  slug,
  children,
  animationAdapter
}: ActiveFestivalDetailAnimationProps) {
  const root = useRef<HTMLDivElement>(null)

  useFestivalDetailAnimations(root, slug, animationAdapter)

  return (
    <div ref={root} data-festival-animation-root data-festival-slug={slug}>
      {children}
      <FestivalSpoilerToggle />
    </div>
  )
}
