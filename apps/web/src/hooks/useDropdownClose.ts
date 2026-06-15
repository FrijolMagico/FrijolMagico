'use client'

import { useEffect, type RefObject } from 'react'

export function useDropdownClose(
  dropdownRef: RefObject<HTMLElement | null>,
  buttonRef: RefObject<HTMLElement | null>,
  isOpen: boolean,
  onClose: () => void
) {
  useEffect(() => {
    if (!isOpen) return

    function handleClick(event: Event) {
      const dropdown = dropdownRef.current
      const button = buttonRef.current
      if (!dropdown || !button) return

      const target = event.target as Node
      if (!dropdown.contains(target) && !button.contains(target)) {
        onClose()
      }
    }

    function handleKey(event: KeyboardEvent) {
      if (event.key === 'Escape') {
        event.preventDefault()
        onClose()
        buttonRef.current?.focus()
      }
    }

    function handleScroll() {
      onClose()
    }

    document.addEventListener('mousedown', handleClick)
    document.addEventListener('touchstart', handleClick)
    document.addEventListener('keydown', handleKey)
    document.addEventListener('scroll', handleScroll, { passive: true })

    return () => {
      document.removeEventListener('mousedown', handleClick)
      document.removeEventListener('touchstart', handleClick)
      document.removeEventListener('keydown', handleKey)
      document.removeEventListener('scroll', handleScroll)
    }
  }, [isOpen, onClose, dropdownRef, buttonRef])
}
