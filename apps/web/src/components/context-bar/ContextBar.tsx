'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import Image from 'next/image'
import { ChevronLeft } from 'lucide-react'

import { useScrollHide } from '@/hooks/useScrollHide'
import { cn } from '@/utils/cn'
import { parsePathname, getSections } from '@/utils/paths'

import { ContextBreadcrumb } from './ContextBreadcrumb'
import { ContextDropdown } from './ContextDropdown'
import { paths } from '@/config/paths'

export { parsePathname, getSections }
export type { BreadcrumbSegment, SectionEntry } from '@/utils/paths'

const CONTEXT_BAR_MODE = {
  NORMAL: 'normal',
  MINIMAL: 'minimal'
} as const

type ContextBarMode = (typeof CONTEXT_BAR_MODE)[keyof typeof CONTEXT_BAR_MODE]

interface ContextBarProps {
  mode?: ContextBarMode
}

export function ContextBar({ mode = CONTEXT_BAR_MODE.NORMAL }: ContextBarProps) {
  const rawPathname = usePathname()
  const pathname = rawPathname ?? '/'
  const visible = useScrollHide(100)

  const sections = getSections()
  const segments = parsePathname(pathname)
  const activeSection = sections.find((s) => {
    const href = typeof s.path === 'string' ? s.path : null
    return href && pathname.startsWith(href)
  })?.path as string | undefined
  const isHomepage = pathname === '/'
  const showBreadcrumbControls =
    mode === CONTEXT_BAR_MODE.NORMAL && !isHomepage && segments.length > 0

  const backHref =
    segments.length > 1 ? segments[segments.length - 2].href : '/'

  return (
    <nav
      role='navigation'
      aria-label='Navegacion de contexto'
      aria-hidden={!visible}
      className={cn(
        'bg-background/80 fixed bottom-4 z-30 mx-auto self-center rounded-lg px-4 py-2 shadow-lg backdrop-blur-md transition-all duration-300',
        !visible && 'pointer-events-none translate-y-[200%] opacity-0'
      )}
    >
      <div className='flex items-center gap-2'>
        <Link
          href={paths.home.path}
          aria-label='Inicio'
          className='flex h-8 w-8 items-center justify-center rounded-full transition-transform duration-150 hover:-rotate-8 sm:mr-1'
        >
          <Image
            src='https://cdn.frijolmagico.cl/asoc/logos/icono_color.png'
            loading='eager'
            alt='Logo Frijol Mágico'
            width={40}
            height={40}
          />
        </Link>

        <div className='flex items-center justify-center gap-1'>
          {showBreadcrumbControls && (
            <Link
              href={backHref}
              aria-label='Volver'
              className='text-foreground/80 hover:text-foreground hover:bg-foreground/10 flex h-8 w-8 items-center justify-center rounded-full transition-colors sm:hidden'
            >
              <ChevronLeft className='h-4 w-4' />
            </Link>
          )}

          {showBreadcrumbControls && (
            <ContextBreadcrumb segments={segments} />
          )}
        </div>

        <ContextDropdown sections={sections} activeSection={activeSection} />
      </div>
    </nav>
  )
}
