'use client'

import { getImageProps } from 'next/image'
import Link from 'next/link'
import { useCallback, useState } from 'react'

const DESKTOP_SRC =
  'https://cdn.frijolmagico.cl/festivales/frijol-magico/xvi/banner-xvi-1920x640.webp?v=2'
const COMPACT_SRC =
  'https://cdn.frijolmagico.cl/festivales/frijol-magico/xvi/banner-xvi-820x820.webp'

interface ActiveFestivalBannerProps {
  festivalSlug: string
}

export function ActiveFestivalBanner({
  festivalSlug
}: ActiveFestivalBannerProps) {
  const [isAtViewportMidpoint, setIsAtViewportMidpoint] = useState(false)

  const href = `/festivales/${festivalSlug}`

  const bannerRef = useCallback((node: HTMLElement | null) => {
    if (node === null || !('IntersectionObserver' in window)) {
      return
    }

    let animationFrameId: number | undefined
    let isTrackingScroll = false

    const updateMidpointState = () => {
      animationFrameId = undefined

      const bounds = node.getBoundingClientRect()
      const bannerMidpoint = bounds.top + bounds.height / 2
      const viewportMidpoint = window.innerHeight / 2

      setIsAtViewportMidpoint(bannerMidpoint <= viewportMidpoint)
    }

    const scheduleMidpointUpdate = () => {
      if (animationFrameId === undefined) {
        animationFrameId = window.requestAnimationFrame(updateMidpointState)
      }
    }

    const startTrackingScroll = () => {
      if (!isTrackingScroll) {
        window.addEventListener('scroll', scheduleMidpointUpdate, {
          passive: true
        })
        isTrackingScroll = true
      }
    }

    const stopTrackingScroll = () => {
      if (isTrackingScroll) {
        window.removeEventListener('scroll', scheduleMidpointUpdate)
        isTrackingScroll = false
      }
    }

    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) {
        startTrackingScroll()
      } else {
        stopTrackingScroll()
      }

      scheduleMidpointUpdate()
    })

    observer.observe(node)
    window.addEventListener('resize', scheduleMidpointUpdate)
    scheduleMidpointUpdate()

    return () => {
      observer.disconnect()
      stopTrackingScroll()
      window.removeEventListener('resize', scheduleMidpointUpdate)

      if (animationFrameId !== undefined) {
        window.cancelAnimationFrame(animationFrameId)
      }
    }
  }, [])

  const common = {
    alt: 'Banner Festival Frijol Mágico XVI',
    sizes: '100vw',
    quality: 100,
    loading: 'eager' as const
  }

  const {
    props: { srcSet: desktopSrcSet }
  } = getImageProps({
    ...common,
    width: 1920,
    height: 640,
    src: DESKTOP_SRC
  })

  const { props: compactImgProps } = getImageProps({
    ...common,
    width: 820,
    height: 820,
    src: COMPACT_SRC
  })

  const mobileActiveClasses = isAtViewportMidpoint
    ? 'max-lg:scale-105 max-lg:blur-sm'
    : ''
  const mobileOverlayClasses = isAtViewportMidpoint ? 'max-lg:opacity-100' : ''

  return (
    <section
      ref={bannerRef}
      data-banner-trigger
      className='group relative h-full px-2 md:w-full'
    >
      <Link href={href} className='block h-full w-full'>
        <picture className='block h-full w-full'>
          <source
            media='(min-width: 821px) and (orientation: landscape)'
            srcSet={desktopSrcSet}
          />
          <img
            {...compactImgProps}
            fetchPriority='high'
            className={`h-full w-full object-cover transition-[scale,filter] duration-500 group-hover:scale-105 group-hover:blur-sm motion-reduce:transition-none ${mobileActiveClasses}`}
          />
        </picture>
      </Link>

      <div
        className={`pointer-events-none absolute inset-0 z-500 flex items-center justify-center opacity-0 transition-opacity duration-500 group-hover:opacity-100 motion-reduce:transition-none ${mobileOverlayClasses}`}
      >
        {/* Outer: pink = border, 10px cuts */}
        <div
          className='flex'
          style={{
            backgroundColor: 'rgb(204, 107, 195)',
            clipPath:
              'polygon(10px 0%, calc(100% - 10px) 0%, 100% 10px, 100% calc(100% - 10px), calc(100% - 10px) 100%, 10px 100%, 0% calc(100% - 10px), 0% 10px)'
          }}
        >
          {/* Inner: blue = fill, 14px cuts (4px inside) */}
          <div
            className='font-canarina max-w-xs px-10 pt-6 pb-5 text-center text-3xl leading-none font-bold tracking-wider text-white uppercase md:max-w-sm md:text-5xl'
            style={{
              backgroundColor: 'rgb(21, 106, 214)',
              clipPath:
                'polygon(16px 6px, calc(100% - 16px) 6px, calc(100% - 6px) 16px, calc(100% - 6px) calc(100% - 16px), calc(100% - 16px) calc(100% - 6px), 16px calc(100% - 6px), 6px calc(100% - 16px), 6px 16px)'
            }}
          >
            Conoce a lxs participantes
          </div>
        </div>
      </div>
    </section>
  )
}
