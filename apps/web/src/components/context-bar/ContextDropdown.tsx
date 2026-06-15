'use client'

import { useRef, useState } from 'react'
import Link from 'next/link'
import { Check, ChevronUp } from 'lucide-react'

import { useDropdownClose } from '@/hooks/useDropdownClose'
import { cn } from '@/utils/cn'
import type { SectionEntry } from '@/utils/paths'

export interface ContextDropdownProps {
  sections: SectionEntry[]
  activeSection: string | undefined
}

export function ContextDropdown({
  sections,
  activeSection
}: ContextDropdownProps) {
  const [isOpen, setIsOpen] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)
  const buttonRef = useRef<HTMLButtonElement>(null)
  const itemRefs = useRef<(HTMLAnchorElement | null)[]>([])

  useDropdownClose(dropdownRef, buttonRef, isOpen, () => setIsOpen(false))

  const handleToggle = () => setIsOpen((prev) => !prev)

  const focusItemAt = (index: number) => {
    const items = itemRefs.current
    if (items.length === 0) return
    const target = items[Math.max(0, Math.min(index, items.length - 1))]
    target?.focus()
  }

  const handleTriggerKeyDown = (
    event: React.KeyboardEvent<HTMLButtonElement>
  ) => {
    if (event.key !== 'ArrowDown' && event.key !== 'ArrowUp') return
    event.preventDefault()

    if (!isOpen) {
      setIsOpen(true)
      requestAnimationFrame(() => {
        focusItemAt(event.key === 'ArrowDown' ? 0 : sections.length - 1)
      })
      return
    }

    focusItemAt(event.key === 'ArrowDown' ? 0 : sections.length - 1)
  }

  const handleMenuKeyDown = (event: React.KeyboardEvent<HTMLDivElement>) => {
    if (event.key !== 'ArrowDown' && event.key !== 'ArrowUp') return
    event.preventDefault()

    const items = itemRefs.current
    if (items.length === 0) return

    const activeElement = document.activeElement as HTMLElement | null
    const currentIndex = items.findIndex((item) => item === activeElement)

    if (event.key === 'ArrowDown') {
      const nextIndex =
        currentIndex >= 0 && currentIndex < items.length - 1
          ? currentIndex + 1
          : 0
      items[nextIndex]?.focus()
    } else {
      const prevIndex = currentIndex > 0 ? currentIndex - 1 : items.length - 1
      items[prevIndex]?.focus()
    }
  }

  return (
    <div className='relative'>
      <button
        ref={buttonRef}
        type='button'
        onClick={handleToggle}
        onKeyDown={handleTriggerKeyDown}
        aria-haspopup='true'
        aria-expanded={isOpen}
        aria-controls='context-section-menu'
        className={cn(
          'flex items-center gap-1 rounded-lg py-1 pr-2 pl-3 text-sm font-medium transition-colors',
          'text-foreground/80 hover:bg-foreground/10 hover:text-foreground'
        )}
      >
        <span className='hidden md:inline'>Secciones</span>
        <ChevronUp
          className={cn('h-4 w-4 transition-transform', isOpen && 'rotate-180')}
          aria-hidden='true'
        />
      </button>

      {isOpen && (
        <div
          ref={dropdownRef}
          id='context-section-menu'
          role='menu'
          onKeyDown={handleMenuKeyDown}
          className='bg-background/95 border-foreground/10 absolute -right-4 bottom-full mb-1 min-w-32 rounded-lg border px-1 py-1 shadow-lg backdrop-blur-md'
        >
          {sections.map((section, index) => {
            const href = typeof section.path === 'string' ? section.path : '#'
            const label = typeof section.label === 'string' ? section.label : ''
            const isActive = activeSection === href

            return (
              <Link
                key={href}
                href={href}
                role='menuitem'
                tabIndex={-1}
                ref={(element) => {
                  itemRefs.current[index] = element
                }}
                onClick={() => setIsOpen(false)}
                className={cn(
                  'flex items-center gap-2 rounded-md px-3 py-2 text-sm transition-colors',
                  isActive
                    ? 'text-primary font-bold'
                    : 'text-foreground/80 hover:bg-foreground/10 hover:text-foreground'
                )}
              >
                <span className='flex-1'>{label}</span>
                {isActive && <Check className='h-4 w-4' aria-hidden='true' />}
              </Link>
            )
          })}
        </div>
      )}
    </div>
  )
}
