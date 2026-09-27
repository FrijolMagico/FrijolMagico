'use client'

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
      className='absolute -top-4 -right-4 z-20'
    >
      Inscríbete
    </LinkCta>
  )
}
