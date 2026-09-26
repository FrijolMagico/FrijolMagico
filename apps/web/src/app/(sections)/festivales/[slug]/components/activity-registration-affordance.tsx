'use client'

import { Badge } from '@/components/badge'
import { LinkCta } from '@/components/link-cta'

import { useActivityRegistration } from './use-activity-registration'

import type { ActivityRegistration } from '../../types/festival'

export function ActivityRegistrationCta({
  registration
}: {
  registration: ActivityRegistration
}) {
  const active = useActivityRegistration(registration)
  if (!active) return null

  return (
    <LinkCta
      href={registration.url}
      variant='offset'
      target='_blank'
      rel='noopener noreferrer'
      className='mt-4 inline-block'
    >
      Inscríbete Aquí
    </LinkCta>
  )
}

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
