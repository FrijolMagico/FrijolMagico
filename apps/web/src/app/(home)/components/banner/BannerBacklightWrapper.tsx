import { type ReactNode } from 'react'
import { createFissureMaskStyle } from '@/components/fissure/mask'

const BANNER_HEIGHT = 640
const MASK_STYLE = createFissureMaskStyle(BANNER_HEIGHT, { bottom: true })

const DROP_SHADOWS = [
  'drop-shadow(0 0 50px rgba(33,205,72,0.7))',
  'drop-shadow(0 0 35px rgba(33,205,72,0.5))',
  'drop-shadow(0 0 50px rgba(33,205,72,0.6))'
].join(' ')

interface BannerBacklightWrapperProps {
  children: ReactNode
}

export function BannerBacklightWrapper({
  children
}: BannerBacklightWrapperProps) {
  return (
    <div className='relative' data-backlight-wrapper>
      <style>{`
        [data-backlight-wrapper]:has([data-banner-trigger]:hover) [data-glow] {
          opacity: 1;
        }
      `}</style>

      {children}

      <div
        className='pointer-events-none absolute inset-0 -z-10 opacity-0 transition-opacity duration-500'
        data-glow
        style={{
          filter: DROP_SHADOWS,
          WebkitFilter: DROP_SHADOWS
        }}
        aria-hidden='true'
      >
        <div
          className='absolute inset-0'
          style={{
            ...MASK_STYLE,
            background: [
              'radial-gradient(ellipse 30% 25% at 18% 15%, rgba(33,205,72,0.5), rgba(33,205,72,0.04))',
              'radial-gradient(ellipse 30% 25% at 52% 85%, rgba(33,205,72,0.4), rgba(33,205,72,0.03))',
              'radial-gradient(ellipse 28% 22% at 82% 18%, rgba(33,205,72,0.45), rgba(33,205,72,0.03))'
            ].join(', ')
          }}
        />
      </div>
    </div>
  )
}
