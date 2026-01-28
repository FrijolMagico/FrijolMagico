'use client'

import { useEffect, useRef, useState } from 'react'
import { useScrollStore } from '../store/useScrollStore'

interface UseScrollSpyOptions {
  threshold?: number
  offset?: number
}

export const useScrollSpy = (
  ids: string[],
  options: UseScrollSpyOptions = {},
) => {
  const { threshold = 0.8, offset = 0 } = options
  const [activeId, setActiveId] = useState<string | null>(null)
  const activeIdRef = useRef<string | null>(null)
  const rafIdRef = useRef<number | null>(null)

  // Get programmatic scroll state from store
  const { isProgrammaticScroll, targetId } = useScrollStore()

  useEffect(() => {
    const elements = ids
      .map((id) => ({
        id,
        element: document.querySelector(`[data-festival-id="${id}"]`),
      }))
      .filter(({ element }) => element !== null) as Array<{
      id: string
      element: Element
    }>

    if (elements.length === 0) return

    const handleScroll = () => {
      // If we're in programmatic scroll mode, don't detect intermediate elements
      if (isProgrammaticScroll) {
        // Only update to target if not already set
        if (activeIdRef.current !== targetId && targetId) {
          activeIdRef.current = targetId
          setActiveId(targetId)
        }
        return
      }

      const viewportCenter = window.innerHeight / 2 + offset
      const thresholdDistance = viewportCenter * threshold

      let closestId: string | null = null
      let closestDistance = Infinity

      elements.forEach(({ id, element }) => {
        const rect = element.getBoundingClientRect()
        const elementCenter = rect.top + rect.height / 2
        const distanceFromCenter = Math.abs(elementCenter - viewportCenter)

        if (distanceFromCenter < closestDistance) {
          closestDistance = distanceFromCenter
          if (distanceFromCenter < thresholdDistance) {
            closestId = id
          }
        }
      })

      // Only update state if changed
      if (closestId !== activeIdRef.current) {
        activeIdRef.current = closestId
        setActiveId(closestId)
      }
    }

    const onWindowScroll = () => {
      // Cancel previous rAF if exists
      if (rafIdRef.current) {
        cancelAnimationFrame(rafIdRef.current)
      }

      // Schedule scroll handler on next animation frame (max 60fps)
      rafIdRef.current = requestAnimationFrame(() => {
        handleScroll()
        rafIdRef.current = null
      })
    }

    window.addEventListener('scroll', onWindowScroll, { passive: true })
    handleScroll() // Call once on mount

    return () => {
      window.removeEventListener('scroll', onWindowScroll)
      if (rafIdRef.current) {
        cancelAnimationFrame(rafIdRef.current)
      }
    }
    // Remove activeId from dependencies - it's managed via ref
  }, [ids, threshold, offset, isProgrammaticScroll, targetId])

  return activeId
}
