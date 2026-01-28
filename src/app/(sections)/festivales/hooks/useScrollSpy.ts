'use client'

import { useEffect, useState } from 'react'

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

      if (closestId !== activeId) {
        setActiveId(closestId)
      }
    }

    window.addEventListener('scroll', handleScroll, { passive: true })
    handleScroll() // Call once on mount

    return () => {
      window.removeEventListener('scroll', handleScroll)
    }
  }, [ids, threshold, offset, activeId])

  return activeId
}
