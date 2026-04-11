'use client'

import { useEffect, useRef } from 'react'
import { cn } from '@/utils/cn'
import { useScrollSpy } from '../hooks/useScrollSpy'
import { useScrollToCenter } from '../hooks/useScrollToCenter'

export interface FestivalsSidebarNavItem {
  id: string
  nombre: string
  edicion: string
  eventoId: number
  year: number
}

interface FestivalsSidebarNavProps {
  items: FestivalsSidebarNavItem[]
}

export const FestivalsSidebarNav = ({ items }: FestivalsSidebarNavProps) => {
  const activeId = useScrollSpy(items.map((item) => item.id))
  const scrollToCenter = useScrollToCenter({ smooth: true, offset: 0 })
  const activeItemRef = useRef<HTMLButtonElement>(null)

  // Scroll active item into view in the sidebar
  useEffect(() => {
    if (activeItemRef.current) {
      activeItemRef.current.scrollIntoView({
        behavior: 'smooth',
        block: 'nearest'
      })
    }
  }, [activeId])

  return (
    <nav
      className='sticky top-8 flex flex-col gap-2 p-1'
      aria-label='Timeline navigation'
    >
      {/* "Ahora" indicator - top */}
      <div className='flex flex-col gap-1 rounded-lg px-3 text-left'>
        <div
          className={cn(
            'flex items-center gap-2',
            activeId ? 'text-foreground' : 'text-secondary'
          )}
        >
          <div
            className={cn(
              'size-2 shrink-0 rounded-full',
              activeId ? 'bg-foreground/50' : 'bg-secondary/50'
            )}
            aria-hidden='true'
          />
          <span className='text-xl font-bold'>
            {activeId ? items.find((i) => i.id === activeId)?.year : 2026}
          </span>
        </div>
      </div>

      {/* Divider */}
      <div className='bg-foreground/10 mx-2 h-px' aria-hidden='true' />

      {items.map((item) => {
        const isActive = activeId === item.id
        const isOrangeEvent = item.eventoId === 1

        return (
          <button
            key={item.id}
            ref={isActive ? activeItemRef : null}
            onClick={() => scrollToCenter(item.id)}
            aria-current={isActive ? 'location' : undefined}
            aria-label={`Navegar a ${item.nombre} - Edición ${item.edicion}`}
            className={cn(
              'group hover:bg-foreground/5 outline-foreground/50 relative flex cursor-pointer gap-2 rounded-lg px-3 py-2 text-left outline transition-all duration-300 outline-dashed',
              isActive &&
                (isOrangeEvent
                  ? 'bg-secondary/20 outline-secondary'
                  : 'bg-primary/20 outline-primary')
            )}
          >
            {/* Active indicator dot */}
            <div
              className={cn(
                'mt-1 size-2 shrink-0 rounded-full transition-all duration-300',
                isActive
                  ? isOrangeEvent
                    ? 'bg-secondary scale-100'
                    : 'bg-primary scale-100'
                  : 'bg-foreground/20 scale-75'
              )}
              aria-hidden='true'
            />

            {/* Edicion info */}
            <div className='flex min-w-0 flex-col gap-0.5'>
              <span
                className={cn(
                  'truncate text-xs font-semibold tracking-wide uppercase transition-colors duration-300',
                  isActive
                    ? isOrangeEvent
                      ? 'text-secondary'
                      : 'text-primary'
                    : 'text-foreground/50 group-hover:text-foreground/70'
                )}
              >
                {item.nombre} <strong>{item.edicion}</strong>
              </span>
            </div>
          </button>
        )
      })}

      {/* Divider */}
      <div className='bg-foreground/10 mx-2 h-px' aria-hidden='true' />
    </nav>
  )
}
