'use client'

import { useScrollSpy } from '../hooks/useScrollSpy'
import type { FestivalEdicion } from '../types/festival'
import { FestivalesTimelineContent } from './FestivalesTimelineContent'

interface FestivalesTimelineClientProps {
  festivales: FestivalEdicion[]
}

export const FestivalesTimelineClient = ({
  festivales,
}: FestivalesTimelineClientProps) => {
  // Generate IDs for scrollSpy
  const festivalIds = festivales.map(
    (f) => `festival-${f.evento.evento_id}-${f.evento.edicion}`,
  )

  // ScrollSpy hook to detect active festival
  const activeId = useScrollSpy(festivalIds)

  return (
    <FestivalesTimelineContent festivales={festivales} activeId={activeId} />
  )
}
