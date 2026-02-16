import { useEffect, useRef, useState } from 'react'

export interface UseStagedHydrationOptions {
  priority: 'high' | 'medium' | 'low'
  delayMs?: number
}

interface UseStagedHydrationResult {
  shouldRender: boolean
}

const DEFAULT_DELAYS = {
  high: 0,
  medium: 100,
  low: 200
} as const

export function useStagedHydration(
  options: UseStagedHydrationOptions
): UseStagedHydrationResult {
  const { priority, delayMs } = options
  const [shouldRender, setShouldRender] = useState(priority === 'high')
  const scheduledRef = useRef(false)

  useEffect(() => {
    if (priority === 'high') {
      return
    }

    if (scheduledRef.current) {
      return
    }

    scheduledRef.current = true

    const delay = delayMs ?? DEFAULT_DELAYS[priority]
    let idleCallbackId: number | undefined
    let timeoutId: NodeJS.Timeout | undefined

    const scheduleRender = () => {
      timeoutId = setTimeout(() => {
        setShouldRender(true)
      }, delay)
    }

    if (typeof requestIdleCallback !== 'undefined') {
      idleCallbackId = requestIdleCallback(() => {
        scheduleRender()
      })
    } else {
      scheduleRender()
    }

    return () => {
      if (idleCallbackId !== undefined) {
        cancelIdleCallback(idleCallbackId)
      }
      if (timeoutId !== undefined) {
        clearTimeout(timeoutId)
      }
    }
  }, [priority, delayMs])

  return { shouldRender }
}
