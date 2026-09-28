import Link from 'next/link'
import { ArrowRightIcon, ExternalLinkIcon, MailIcon } from 'lucide-react'

import { CatalogAvatarFollower } from '@/components/CatalogAvatarFollower'

import { getActivityArtistContact } from './activity-artist-contact'

interface ActivityArtistLinkProps {
  pseudonym: string | null
  catalogSlug?: string | null
  avatarUrl?: string | null
  rrss?: string | null
  email?: string | null
  className?: string
}

export const ActivityArtistLink = ({
  pseudonym,
  catalogSlug,
  avatarUrl,
  rrss,
  email,
  className = 'text-palette-primary/70 text-sm'
}: ActivityArtistLinkProps) => {
  if (!pseudonym) return null

  const safeSlug =
    typeof catalogSlug === 'string' && catalogSlug.trim()
      ? encodeURIComponent(catalogSlug.trim())
      : null

  if (safeSlug) {
    const link = (
      <Link
        href={`/catalogo/${safeSlug}`}
        aria-label={`Ver perfil de ${pseudonym}`}
        className={`${className} group hover:text-palette-accent inline-flex w-fit items-center gap-1 duration-200`}
      >
        {pseudonym}
        <ArrowRightIcon
          data-testid='activity-artist-catalog-icon'
          aria-hidden='true'
          className='size-4 opacity-50 duration-200 group-hover:-rotate-45'
        />
      </Link>
    )

    return avatarUrl ? (
      <CatalogAvatarFollower avatarUrl={avatarUrl}>{link}</CatalogAvatarFollower>
    ) : (
      link
    )
  }

  const contact = getActivityArtistContact(rrss, email)
  if (!contact) return <span className={className}>{pseudonym}</span>

  return (
    <a
      href={contact.href}
      {...(contact.kind === 'social'
        ? { target: '_blank', rel: 'noopener noreferrer' }
        : {})}
      aria-label={`Abrir enlace de contacto de ${pseudonym}`}
      className={`${className} group hover:text-palette-accent inline-flex w-fit items-center gap-1 duration-200`}
    >
      {pseudonym}
      {contact.kind === 'social' ? (
        <ExternalLinkIcon
          data-testid='activity-artist-social-icon'
          aria-hidden='true'
          className='size-4 opacity-50 duration-200'
        />
      ) : (
        <MailIcon
          data-testid='activity-artist-email-icon'
          aria-hidden='true'
          className='size-4 opacity-50 duration-200'
        />
      )}
    </a>
  )
}
