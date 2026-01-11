'use client'

import Link from 'next/link'
import clsx from 'clsx'

import { Instagram } from '@/components/icons/Instagram'
import { Facebook } from '@/components/icons/Facebook'
import { useAnalytics } from '@/components/analytics/useAnalytics'
import siteData from '@/data/site.json'

const SITE = siteData

export const RRSSCard = ({
  orientation = 'vertical',
}: {
  orientation?: 'vertical' | 'horizontal'
}) => {
  const { trackSocialClick } = useAnalytics()

  return (
    <div
      className={clsx(
        'bg-flexible-orange font-josefin text-flexible-white flex size-full grow items-center justify-center rounded-2xl',
        {
          'flex-col px-2 py-3': orientation === 'vertical',
          'flex-row gap-6 p-3': orientation === 'horizontal',
        },
      )}>
      <p className='text-2xl leading-none font-black uppercase'>Síguenos!</p>
      <div className='flex items-center gap-4'>
        <Link
          href={SITE.social_media.ig}
          target='_blank'
          rel='noopener noreferrer'
          aria-label='Síguenos en Instagram'
          onClick={() =>
            trackSocialClick({ platform: 'instagram', location: 'footer' })
          }
          className='hover:text-flexible-yellow transition duration-150 hover:scale-110 hover:rotate-6'>
          <Instagram size={orientation === 'vertical' ? 42 : 32} />
        </Link>
        <Link
          href={SITE.social_media.fb}
          target='_blank'
          rel='noopener noreferrer'
          aria-label='Síguenos en Facebook'
          onClick={() =>
            trackSocialClick({ platform: 'facebook', location: 'footer' })
          }
          className='hover:text-flexible-yellow transition duration-150 hover:scale-110 hover:rotate-6'>
          <Facebook size={orientation === 'vertical' ? 36 : 28} />
        </Link>
      </div>
    </div>
  )
}
