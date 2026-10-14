import type { ReactNode } from 'react'

import { FissureSurface } from '@/components/fissure/fissure-surface'

interface FissureFooterProps {
  children: ReactNode
}

/** Flow-positioned responsive frame with viewport-fixed, moving-mask footer content. */
export function FissureFooter({ children }: FissureFooterProps) {
  return (
    <footer
      className='relative z-20 h-140 w-full overflow-hidden md:h-90'
      data-fissure-footer
    >
      <FissureSurface
        edge='top'
        geometryHeight={400}
        height='100%'
        sizing='fixed-frame'
        surfaceClassName='bg-primary'
      >
        <div className='fixed bottom-0 left-0 h-160 w-full md:h-90'>
          {children}
        </div>
      </FissureSurface>
    </footer>
  )
}
