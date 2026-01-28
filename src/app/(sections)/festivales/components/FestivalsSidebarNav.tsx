'use client'

import { useEffect, useRef } from 'react'
import { cn } from '@/utils/utils'
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
        block: 'nearest',
      })
    }
  }, [activeId])

  return (
    <nav className='sticky top-8 flex flex-col gap-2 p-1'>
      {/* "Ahora" indicator - top */}
      <div className='flex flex-col gap-1 rounded-lg px-3 text-left'>
        <div
          className={cn(
            'flex items-center gap-2',
            activeId ? 'text-fm-black' : 'text-fm-orange',
          )}>
          <div className='bg-fm-black/50 size-2 rounded-full' />
          <span className='font-bold'>
            {activeId
              ? items.find((i) => i.id === activeId)?.year
              : new Date().getFullYear()}
          </span>
        </div>
      </div>

      {/* Divider */}
      <div className='bg-fm-black/10 mx-2 h-px' />

      {items.map((item) => {
        const isActive = activeId === item.id
        const isOrangeEvent = item.eventoId === 1

        return (
          <button
            key={item.id}
            ref={isActive ? activeItemRef : null}
            onClick={() => scrollToCenter(item.id)}
            aria-current={isActive ? 'location' : undefined}
            className={cn(
              'group hover:bg-fm-black/5 outline-fm-black/50 relative flex cursor-pointer gap-2 rounded-lg px-3 py-2 text-left outline transition-all duration-300 outline-dashed',
              isActive &&
                (isOrangeEvent
                  ? 'bg-fm-orange/20 outline-fm-orange'
                  : 'bg-fm-green/20 outline-fm-green'),
            )}>
            {/* Active indicator dot */}
            <div
              className={cn(
                'mt-1 size-2 rounded-full transition-all duration-300',
                isActive
                  ? isOrangeEvent
                    ? 'bg-fm-orange scale-100'
                    : 'bg-fm-green scale-100'
                  : 'bg-fm-black/20 scale-75',
              )}
            />

            {/* Edicion info */}
            <div className='flex flex-col gap-0.5'>
              <span
                className={cn(
                  'text-xs font-semibold tracking-wide uppercase transition-colors duration-300',
                  isActive
                    ? isOrangeEvent
                      ? 'text-fm-orange'
                      : 'text-fm-green'
                    : 'text-fm-black/50 group-hover:text-fm-black/70',
                )}>
                {item.nombre} <strong>{item.edicion}</strong>
              </span>
            </div>
          </button>
        )
      })}

      {/* Divider */}
      <div className='bg-fm-black/10 mx-2 h-px' />

      {/* "Inicio" indicator - bottom */}
      <div className='flex flex-col gap-1 rounded-lg px-3 text-left opacity-50'>
        <div className='flex items-center gap-2'>
          <div className='bg-fm-black size-2 rounded-full' />
          <span className='text-fm-black text-xs font-semibold tracking-wide uppercase'>
            Inicio
          </span>
        </div>
      </div>
    </nav>
  )
}
