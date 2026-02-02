'use client'

import { LogoHomeLink } from '@/components/LogoHomeLink'
import { cn } from '@frijolmagico/ui/cn'

export const SectionHomeButton = () => {
  return (
    <div
      className={cn([
        'fixed right-0 bottom-2 z-100 scale-75 transition-all duration-500 ease-in-out',
        'pointer-events-auto translate-y-0 opacity-100',
      ])}>
      <LogoHomeLink />
    </div>
  )
}
