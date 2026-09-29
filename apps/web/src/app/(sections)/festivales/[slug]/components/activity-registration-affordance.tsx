'use client'

import { LinkCta } from '@/components/link-cta'

import { useActivityRegistration } from './use-activity-registration'

import type { ActivityRegistration } from '../../types/festival'

export function ActivityRegistrationCta({
  registration,
  url
}: {
  registration: Omit<ActivityRegistration, 'url'>
  url: string | null
}) {
  const active = useActivityRegistration(
    url ? { ...registration, url } : null
  )
  if (!active || !url) return null

  return (
    <LinkCta
      href={url}
      variant='offset'
      target='_blank'
      rel='noopener noreferrer'
      className='mt-2 inline-flex'
    >
      Inscríbete
    </LinkCta>
  )
}
