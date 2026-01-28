'use client'

import { useCallback, useEffect, useState } from 'react'

interface UseScrollToCenterOptions {
  smooth?: boolean
  offset?: number
}

interface WindowWithGsap extends Window {
  gsap?: {
    to: (target: unknown, config: unknown) => void
  }
}

export const useScrollToCenter = (options: UseScrollToCenterOptions = {}) => {
  const { smooth = true, offset = 0 } = options
  const [isGsapLoaded, setIsGsapLoaded] = useState(false)

  useEffect(() => {
    const loadGsap = async () => {
      try {
        const gsap = await import('gsap')
        const { ScrollToPlugin } = await import('gsap/ScrollToPlugin')
        gsap.default.registerPlugin(ScrollToPlugin)
        setIsGsapLoaded(true)
      } catch (error) {
        console.warn(
          'GSAP failed to load, falling back to native scroll',
          error,
        )
        setIsGsapLoaded(true) // Still mark as loaded to allow fallback
      }
    }

    if (typeof window !== 'undefined') {
      loadGsap()
    }
  }, [])

  const scrollToFestival = useCallback(
    (festivalId: string) => {
      const element = document.querySelector(
        `[data-festival-id="${festivalId}"]`,
      )
      if (!element) {
        console.warn(`Element with id ${festivalId} not found`)
        return
      }

      const scrollOffset =
        window.innerHeight / 2 -
        (element as HTMLElement).clientHeight / 2 +
        offset

      if (smooth && isGsapLoaded) {
        // Try to use GSAP if available
        const windowWithGsap = window as WindowWithGsap
        if (windowWithGsap.gsap?.to) {
          windowWithGsap.gsap.to(window, {
            duration: 0.8,
            scrollTo: {
              y: element,
              offsetY: scrollOffset,
            },
            ease: 'power2.inOut',
          })
          return
        }
      }

      // Fallback to native scroll
      element.scrollIntoView({
        behavior: smooth ? 'smooth' : 'auto',
        block: 'center',
        inline: 'nearest',
      })
    },
    [smooth, offset, isGsapLoaded],
  )

  return scrollToFestival
}
