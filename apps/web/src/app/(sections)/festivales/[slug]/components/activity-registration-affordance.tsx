'use client'

import { Badge } from '@/components/badge'

import { useActivityRegistration } from './use-activity-registration'

import type { ActivityRegistration } from '../../types/festival'

export function ActivityRegistrationBadge({
  registration
}: {
  registration: ActivityRegistration
}) {
  const active = useActivityRegistration(registration)
  if (!active) return null

  return (
    <Badge variant='registration' className='absolute -top-2 -right-2 z-20'>
      Inscríbete
    </Badge>
  )
}
