import Link from 'next/link'

import { cn } from '@/utils/cn'

import type { ComponentPropsWithoutRef, ReactNode } from 'react'

type LinkCtaProps = ComponentPropsWithoutRef<typeof Link> & {
  children: ReactNode
  variant: 'solid' | 'offset'
}

export function LinkCta({
  children,
  variant,
  className,
  ...props
}: LinkCtaProps) {
  if (variant === 'solid') {
    return (
      <Link
        {...props}
        className={cn(
          'bg-accent background-size-[150%] text-primary focus-visible:ring-offset-primary rounded-lg bg-linear-to-r px-4 py-0.5 font-bold transition-[background-position] duration-200 hover:bg-right focus-visible:rounded-lg focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:outline-none',
          className
        )}
      >
        {children}
      </Link>
    )
  }

  return (
    <Link
      {...props}
      className={cn(
        'group/btn focus-visible:ring-palette-primary pointer-events-auto relative z-20 focus-visible:rounded-lg focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none',
        className
      )}
    >
      {/* Plain bg effect — same pattern as ArtistCard */}
      <span
        aria-hidden='true'
        className='bg-palette-primary pointer-events-none absolute -z-10 size-full translate-1 rounded-lg transition-transform duration-300 group-hover/btn:translate-x-0 group-hover/btn:translate-y-0 group-focus-visible/btn:translate-x-0 group-focus-visible/btn:translate-y-0'
      />
      <span className='border-palette-primary bg-palette-background text-palette-primary group-hover/btn:bg-palette-primary group-hover/btn:text-palette-background group-focus-visible/btn:bg-palette-primary group-focus-visible/btn:text-palette-background pointer-events-none relative flex items-center justify-center gap-2 rounded-lg border-2 px-4 py-1 font-semibold transition-colors duration-200'>
        {children}
      </span>
    </Link>
  )
}
