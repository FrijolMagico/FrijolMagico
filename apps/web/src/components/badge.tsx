import { cn } from '@/utils/cn'

import type { ReactNode } from 'react'

type BadgeProps = {
  children: ReactNode
  variant: 'new' | 'registration' | 'activity-type'
  className?: string
  color?: string
  backgroundColor?: string
  outlineColor?: string
}

export function Badge({
  children,
  variant,
  className,
  color = 'text-primary',
  backgroundColor = 'bg-background',
  outlineColor = 'outline-background'
}: BadgeProps) {
  return (
    <span
      className={cn(
        variant === 'new'
          ? cn(
              'absolute -top-2 -left-2 z-20 -rotate-6 rounded-md px-2 font-bold outline-2',
              color,
              backgroundColor,
              outlineColor
            )
          : variant === 'registration'
          ? 'bg-primary border-primary inline-flex rounded-md border-2 px-2 py-0.5 font-bold text-white'
          : 'absolute -top-2 -left-2 z-30 inline-flex rounded-full border px-2 py-0.5 text-xs font-semibold text-palette-foreground bg-palette-primary/10 border-palette-primary/40',
        className
      )}
    >
      {children}
    </span>
  )
}
