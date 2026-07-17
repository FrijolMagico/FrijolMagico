import Link from 'next/link'
import { ArrowRightIcon, ExternalLinkIcon } from 'lucide-react'

import { CatalogAvatarFollower } from '@/components/CatalogAvatarFollower'

interface ParticipantItemProps {
  pseudonimo: string
  catalogoSlug: string | null
  rrss?: string | null
  avatarUrl?: string | null
  animationMode?: 'active'
  categoryId?: string
  itemIndex?: number
}

function extractUrl(value: unknown): string | null {
  if (typeof value === 'string' && value.length > 0) return value
  if (Array.isArray(value) && value.length > 0 && typeof value[0] === 'string')
    return value[0]
  return null
}

function getBestRrssUrl(rrss: string | null | undefined): string | null {
  if (!rrss) return null

  try {
    const parsed = JSON.parse(rrss) as Record<string, unknown>

    const instagramUrl = extractUrl(parsed.instagram)
    if (instagramUrl) return instagramUrl

    const firstEntry = Object.entries(parsed).find(
      ([, value]) =>
        (typeof value === 'string' && value.length > 0) ||
        (Array.isArray(value) && value.length > 0)
    )
    return firstEntry ? extractUrl(firstEntry[1]) : null
  } catch {
    return null
  }
}

function RedactionBar() {
  return (
    <span
      data-spoiler-redaction
      aria-hidden='true'
      className='bg-palette-primary pointer-events-none absolute inset-0 z-10 origin-left rounded group-hover:brightness-110'
    />
  )
}

export const ParticipantItem = ({
  pseudonimo,
  catalogoSlug,
  rrss,
  avatarUrl,
  animationMode,
  categoryId,
  itemIndex
}: ParticipantItemProps) => {
  const rrssUrl = getBestRrssUrl(rrss)
  const markers = {
    'data-spoiler-item': '',
    'data-category-id': categoryId,
    'data-item-index': itemIndex
  }
  const visualContent = (
    <span
      data-spoiler-content
      className='relative inline-flex items-center gap-1'
    >
      <span data-spoiler-text>{pseudonimo}</span>
      {catalogoSlug && (
        <ArrowRightIcon
          data-spoiler-icon
          aria-hidden='true'
          className='size-4 opacity-50 duration-200 group-hover:-rotate-45'
        />
      )}
      {!catalogoSlug && rrssUrl && (
        <ExternalLinkIcon
          data-spoiler-icon
          aria-hidden='true'
          className='size-4 opacity-50 duration-200'
        />
      )}
      {animationMode === 'active' && <RedactionBar />}
    </span>
  )

  if (catalogoSlug) {
    if (animationMode !== 'active') {
      if (avatarUrl) {
        return (
          <CatalogAvatarFollower avatarUrl={avatarUrl}>
            <Link
              href={`/catalogo/${catalogoSlug}`}
              className='hover:text-palette-accent text-palette-primary group mx-auto flex w-fit items-center gap-1 duration-200 md:mx-0'
            >
              {pseudonimo}
              <ArrowRightIcon className='size-4 opacity-50 duration-200 group-hover:-rotate-45' />
            </Link>
          </CatalogAvatarFollower>
        )
      }

      return (
        <Link
          href={`/catalogo/${catalogoSlug}`}
          className='hover:text-palette-accent text-palette-primary group mx-auto flex w-fit items-center gap-1 duration-200 md:mx-0'
        >
          {pseudonimo}
          <ArrowRightIcon className='size-4 opacity-50 duration-200 group-hover:-rotate-45' />
        </Link>
      )
    }

    const spoilerItem = (
      <span
        role='button'
        tabIndex={0}
        className='text-palette-primary hover:text-palette-accent group relative mx-auto flex w-fit cursor-pointer items-center md:mx-0'
        {...markers}
      >
        <Link
          href={`/catalogo/${catalogoSlug}`}
          data-spoiler-link
          aria-disabled='true'
          tabIndex={-1}
          className='group pointer-events-none'
        >
          {visualContent}
        </Link>
      </span>
    )

    const content = avatarUrl ? (
      <CatalogAvatarFollower avatarUrl={avatarUrl}>
        {spoilerItem}
      </CatalogAvatarFollower>
    ) : (
      spoilerItem
    )
    return content
  }

  if (animationMode === 'active' && rrssUrl) {
    return (
      <span className='text-palette-foreground/80 group relative' {...markers}>
        <a
          href={rrssUrl}
          data-spoiler-link
          aria-disabled='true'
          tabIndex={-1}
          className='group pointer-events-none'
          target='_blank'
          rel='noopener noreferrer'
        >
          {visualContent}
        </a>
      </span>
    )
  }

  return animationMode === 'active' ? (
    <button
      type='button'
      className='text-palette-foreground/80 group relative'
      {...markers}
    >
      {visualContent}
    </button>
  ) : (
    <span className='text-palette-foreground/80'>{pseudonimo}</span>
  )
}
