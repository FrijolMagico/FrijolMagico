import Link from 'next/link'
import { ChevronRight } from 'lucide-react'

import { cn } from '@/utils/cn'

import type { BreadcrumbSegment } from '@/utils/paths'

interface ContextBreadcrumbProps {
  segments: BreadcrumbSegment[]
}

export function ContextBreadcrumb({ segments }: ContextBreadcrumbProps) {
  return (
    <ol className='text-foreground/80 flex items-center gap-1 text-sm'>
      {segments.map((segment, index) => {
        const isLast = index === segments.length - 1
        return (
          <li
            key={segment.href}
            className={cn(
              'flex items-center gap-1',
              !isLast && 'hidden md:inline'
            )}
          >
            {isLast ? (
              <span
                className='text-foreground font-medium md:shrink-0'
                aria-current='page'
              >
                {segment.label}
              </span>
            ) : (
              <Link
                href={segment.href}
                className='hover:text-foreground shrink-0 hover:underline'
              >
                {segment.label}
              </Link>
            )}
            {!isLast && (
              <ChevronRight
                className='ml-1 hidden h-3 w-3 shrink-0 md:inline'
                aria-hidden='true'
              />
            )}
          </li>
        )
      })}
    </ol>
  )
}
