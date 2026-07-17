'use client'

import { type ReactNode, useCallback, useEffect, useRef, useState } from 'react'
import { createPortal } from 'react-dom'

interface FollowerState {
  x: number
  y: number
  avatarUrl: string
}

interface CatalogAvatarFollowerProps {
  children: ReactNode
  avatarUrl: string
}

const CIRCLE_SIZE = 40
const GAP = 10

function isSpoilerRevealed(el: HTMLElement): boolean {
  const section = el.closest<HTMLElement>('[data-spoiler-state]')
  if (!section) return true // no spoiler = always revealed

  const state = section.dataset.spoilerState
  if (state === 'revealed') return true
  if (state === 'concealed') return false

  // 'revealing' — check if THIS item's redaction bar completed
  const content = el.querySelector<HTMLElement>('[data-spoiler-content]')
  if (!content) return true
  const bar = content.querySelector<HTMLElement>('[data-spoiler-redaction]')
  if (!bar) return true // no bar = no redaction needed

  return getComputedStyle(bar).opacity === '0'
}

export function CatalogAvatarFollower({
  children,
  avatarUrl
}: CatalogAvatarFollowerProps) {
  const wrapperRef = useRef<HTMLSpanElement>(null)
  const [follower, setFollower] = useState<FollowerState | null>(null)

  const handleMouseEnter = useCallback(() => {
    if (!wrapperRef.current) return
    if (!isSpoilerRevealed(wrapperRef.current)) return
    setFollower({ x: 0, y: 0, avatarUrl })
  }, [avatarUrl])

  const handleMouseMove = useCallback(
    (e: MouseEvent) => {
      if (!wrapperRef.current) return

      setFollower((prev) => {
        if (prev) return { ...prev, x: e.clientX, y: e.clientY }
        // prev is null — maybe we entered during stagger and it's now revealed
        if (isSpoilerRevealed(wrapperRef.current!)) {
          return { x: e.clientX, y: e.clientY, avatarUrl }
        }
        return null
      })
    },
    [avatarUrl]
  )

  const handleMouseLeave = useCallback(() => {
    setFollower(null)
  }, [])

  useEffect(() => {
    const el = wrapperRef.current
    if (!el) return

    el.addEventListener('mouseenter', handleMouseEnter)
    el.addEventListener('mousemove', handleMouseMove)
    el.addEventListener('mouseleave', handleMouseLeave)

    return () => {
      el.removeEventListener('mouseenter', handleMouseEnter)
      el.removeEventListener('mousemove', handleMouseMove)
      el.removeEventListener('mouseleave', handleMouseLeave)
    }
  }, [handleMouseEnter, handleMouseMove, handleMouseLeave])

  return (
    <>
      <span ref={wrapperRef} className='inline-flex w-fit'>
        {children}
      </span>

      {follower &&
        createPortal(
          <span
            aria-hidden='true'
            className='pointer-events-none fixed z-[9999] overflow-hidden rounded-full border-2 border-white/80 bg-white/90 shadow-lg'
            style={{
              width: CIRCLE_SIZE,
              height: CIRCLE_SIZE,
              left: follower.x - CIRCLE_SIZE - GAP,
              top: follower.y + GAP
            }}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={follower.avatarUrl}
              alt=''
              className='size-full object-cover'
              draggable={false}
            />
          </span>,
          document.body
        )}
    </>
  )
}
