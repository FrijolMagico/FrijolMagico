'use client'

import { useEffect, useState } from 'react'

import { getRegistrationWindow } from './activity-registration-time'

import type { ActivityRegistration } from '../../types/festival'

const MAX_TIMEOUT_DELAY = 2147483647

export function useActivityRegistration(
  registration: ActivityRegistration | null
) {
  const url = registration?.url
  const startAt = registration?.start_at
  const endAt = registration?.end_at
  const [evaluated, setEvaluated] = useState({
    url,
    startAt,
    endAt,
    active: false
  })

  useEffect(() => {
    let timer: ReturnType<typeof setTimeout> | undefined
    const reconcile = () => {
      if (timer !== undefined) clearTimeout(timer)
      const state = getRegistrationWindow(
        url && startAt && endAt
          ? { url, start_at: startAt, end_at: endAt }
          : null,
        Date.now()
      )
      setEvaluated({ url, startAt, endAt, active: state.active })
      if (state.nextAt !== null) {
        timer = setTimeout(
          reconcile,
          Math.min(MAX_TIMEOUT_DELAY, Math.max(1, state.nextAt - Date.now()))
        )
      }
    }

    reconcile()
    window.addEventListener('focus', reconcile)
    document.addEventListener('visibilitychange', reconcile)
    return () => {
      if (timer !== undefined) clearTimeout(timer)
      window.removeEventListener('focus', reconcile)
      document.removeEventListener('visibilitychange', reconcile)
    }
  }, [url, startAt, endAt])

  return (
    evaluated.url === url &&
    evaluated.startAt === startAt &&
    evaluated.endAt === endAt &&
    evaluated.active
  )
}
