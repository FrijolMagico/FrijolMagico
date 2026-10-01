import { ChevronDown } from 'lucide-react'

import { Badge } from '@/components/badge'

import { ActivityRegistrationCta } from './activity-registration-affordance'
import { ActivityDescription } from './activity-description'
import { formatOccurrenceTimeRange } from '../lib/activity-registration-time'

import type { FestivalActivity } from '../../types/festival'
import { cn } from '@/utils/cn'
import { ActivityItemHeadContent } from './ActivityItemHeadContent'

interface ActivityItemProps {
  activity: FestivalActivity
  isEditionPast?: boolean
  badge?: string
}

const EMPTY_EDITOR_MARKUP =
  /<\/?(?:p|ul|ol|li|strong|em|s|code|a)\b[^>]*>|<br\b[^>]*\/?>/gi
const EMPTY_EDITOR_SPACE = /(?:&nbsp;|&#160;|&#xA0;)/gi

const hasDescription = (description: string | null) =>
  Boolean(
    description
      ?.replace(EMPTY_EDITOR_MARKUP, '')
      .replace(EMPTY_EDITOR_SPACE, '')
      .trim()
  )

const getBadgeClassName = (type: string) => {
  if (type === 'charla') return 'bg-primary text-background'
  if (type === 'musica') return 'bg-secondary text-primary'
  return 'bg-accent text-primary'
}

export const ActivityItem = ({ activity, badge }: ActivityItemProps) => {
  const details = hasDescription(activity.descripcion)
  const occurrence = activity.ocurrencias[0]
  const timeRange = occurrence
    ? formatOccurrenceTimeRange(
        occurrence.hora_inicio,
        occurrence.duracion_minutos
      )
    : null

  return (
    <article className='bg-palette-background border-palette-primary group relative h-full w-full min-w-0 rounded-lg border'>
      <div className='bg-palette-primary absolute -z-10 size-full translate-x-1.5 translate-y-1.5 rounded-lg duration-300 group-hover:translate-0' />

      {badge && (
        <Badge
          className={cn(getBadgeClassName(activity.tipo), '-top-3 left-4')}
        >
          {badge}
        </Badge>
      )}

      {activity.registration && occurrence && (
        <div className='absolute -top-6 right-4 z-30'>
          <ActivityRegistrationCta
            registration={activity.registration}
            url={occurrence.registration_url ?? null}
          />
        </div>
      )}

      {details ? (
        <details className='group/details w-full px-4'>
          <summary className='flex h-full min-h-40 w-full cursor-pointer justify-between gap-4'>
            <ActivityItemHeadContent
              activity={activity}
              timeRange={timeRange}
            />
            <ChevronDown
              className='text-palette-foreground/40 my-auto size-5 shrink-0 transition-transform duration-200 group-open/details:rotate-180'
              aria-hidden='true'
            />
          </summary>
          <div
            data-disclosure-content
            className='border-palette-primary/20 pointer-events-none relative z-20 h-full overflow-hidden border-t py-4 *:pointer-events-auto'
          >
            <ActivityDescription description={activity.descripcion} />
          </div>
        </details>
      ) : (
        <div className='flex h-full min-h-40 w-full px-4'>
          <ActivityItemHeadContent activity={activity} timeRange={timeRange} />
        </div>
      )}
    </article>
  )
}
