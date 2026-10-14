import type { ReactNode } from 'react'

interface SiteForegroundProps {
  children: ReactNode
}

/** Transparent content layer above the body pattern and below the fixed footer. */
export function SiteForeground({ children }: SiteForegroundProps) {
  return (
    <div
      className='relative z-10 flex min-h-0 flex-1 flex-col'
      data-site-foreground
    >
      <div className='relative z-10 flex flex-1 flex-col pt-12 [&>main]:flex-1'>
        {children}
      </div>
    </div>
  )
}
