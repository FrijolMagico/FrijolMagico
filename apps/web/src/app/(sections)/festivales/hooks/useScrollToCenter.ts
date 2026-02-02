'use client'

import { useCallback, useEffect, useState } from 'react'
import { useScrollStore } from '../store/useScrollStore'

interface UseScrollToCenterOptions {
  smooth?: boolean
  offset?: number
}

interface WindowWithGsap extends Window {
  gsap?: {
    to: (
      target: unknown,
      config: unknown,
    ) => {
      then?: (callback: () => void) => void
    }
  }
}

const SCROLL_DURATION = 0.8

export const useScrollToCenter = (options: UseScrollToCenterOptions = {}) => {
  const { smooth = true, offset = 0 } = options
  const [isGsapLoaded, setIsGsapLoaded] = useState(false)
  const { setScrolling, clearScrolling } = useScrollStore()

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
      // Signal that we're starting programmatic scroll
      setScrolling(festivalId)

      const element = document.querySelector(
        `[data-festival-id="${festivalId}"]`,
      )
      if (!element) {
        console.warn(`Element with id ${festivalId} not found`)
        clearScrolling()
        return
      }

      const scrollOffset =
        window.innerHeight / 2 -
        (element as HTMLElement).clientHeight / 2 +
        offset

      const onScrollComplete = () => {
        clearScrolling()
      }

      if (smooth && isGsapLoaded) {
        // Try to use GSAP if available
        const windowWithGsap = window as WindowWithGsap
        if (windowWithGsap.gsap?.to) {
          const tween = windowWithGsap.gsap.to(window, {
            duration: SCROLL_DURATION,
            scrollTo: {
              y: element,
              offsetY: scrollOffset,
            },
            ease: 'power2.inOut',
          })

          // Clear scroll flag when animation completes
          if (tween && typeof tween.then === 'function') {
            tween.then(onScrollComplete)
          } else {
            // Fallback: use setTimeout if promise not available
            setTimeout(onScrollComplete, SCROLL_DURATION * 1000)
          }
          return
        }
      }

      // Fallback to native scroll
      element.scrollIntoView({
        behavior: smooth ? 'smooth' : 'auto',
        block: 'center',
        inline: 'nearest',
      })

      // For native scroll, estimate completion time
      setTimeout(onScrollComplete, SCROLL_DURATION * 1000)
    },
    [smooth, offset, isGsapLoaded, setScrolling, clearScrolling],
  )

  return scrollToFestival
}
