import { cn } from '@/utils/cn'

import type { ReactNode } from 'react'

type BadgeProps = {
  children: ReactNode
  className?: string
  color?: string
  backgroundColor?: string
  outlineColor?: string
}

export function Badge({
  children,
  className,
  color = 'text-palette-primary',
  backgroundColor = 'bg-palette-background',
  outlineColor = 'outline-palette-background'
}: BadgeProps) {
  return (
    <span
      className={cn(
        'absolute z-50 rounded-md px-2 font-medium outline-2',
        color,
        backgroundColor,
        outlineColor,
        className
      )}
    >
      {children}
    </span>
  )
}
