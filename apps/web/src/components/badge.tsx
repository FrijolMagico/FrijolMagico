import { cn } from '@/utils/cn'

import type { ReactNode } from 'react'

type BadgeProps = {
  children: ReactNode
  variant: 'new' | 'registration'
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
          : 'bg-primary border-primary inline-flex rounded-md border-2 px-2 py-0.5 font-bold text-white',
        className
      )}
    >
      {children}
    </span>
  )
}
