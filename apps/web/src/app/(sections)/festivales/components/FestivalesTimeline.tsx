import type { FestivalEdicion } from '../types/festival'
import { FestivalesTimelineClient } from './FestivalesTimelineClient'

interface FestivalesTimelineProps {
  festivales: FestivalEdicion[]
}

export const FestivalesTimeline = ({ festivales }: FestivalesTimelineProps) => {
  return <FestivalesTimelineClient festivales={festivales} />
}
