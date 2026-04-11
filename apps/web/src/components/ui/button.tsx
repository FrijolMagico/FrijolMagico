'use client'

import { cn } from '@/utils/cn'
import { ReactNode, ButtonHTMLAttributes } from 'react'

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  children: ReactNode
  variant?: 'default' | 'outline' | 'ghost' | 'link'
  size?: 'default' | 'sm' | 'lg' | 'icon'
  className?: string
  disabled?: boolean
}

export function Button({
  children,
  variant = 'default',
  size = 'default',
  className = '',
  disabled = false,
  ...props
}: ButtonProps) {
  const baseStyles =
    'inline-flex items-center justify-center rounded-md font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none'

  const variants = {
    default: 'bg-secondary text-background hover:bg-secondary/90',
    outline:
      'border border-primary/30 border-dashed text-foreground/90 bg-background hover:bg-foreground/20',
    ghost: 'hover:bg-secondary/50 hover:text-background text-foreground/90',
    link: 'text-primary underline-offset-4 hover:underline'
  }

  const sizes = {
    default: 'h-10 px-4 py-2',
    sm: 'h-9 rounded-md px-3',
    lg: 'h-11 rounded-md px-8',
    icon: 'h-10 w-10'
  }

  return (
    <button
      className={cn(baseStyles, variants[variant], sizes[size], className)}
      disabled={disabled}
      {...props}
    >
      {children}
    </button>
  )
}
