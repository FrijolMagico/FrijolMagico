'use client'

import { useEffect } from 'react'
import { Info, X } from 'lucide-react'

interface RestoredChangesNoticeProps {
  visible: boolean
  onDismiss: () => void
}

export function RestoredChangesNotice({
  visible,
  onDismiss
}: RestoredChangesNoticeProps) {
  useEffect(() => {
    if (!visible) return

    const timer = setTimeout(() => {
      onDismiss()
    }, 8000)

    return () => clearTimeout(timer)
  }, [visible, onDismiss])

  if (!visible) return null

  return (
    <div className='animate-in slide-in-from-bottom-2 fade-in fixed right-4 bottom-24 z-40 max-w-xs'>
      <div className='flex items-start gap-3 rounded-xl border border-zinc-800 bg-zinc-900/95 px-4 py-3 shadow-xl backdrop-blur-sm'>
        <Info className='mt-0.5 h-4 w-4 shrink-0 text-amber-500' />
        <p className='text-sm leading-relaxed text-zinc-300'>
          Cambios de una sesión anterior aplicados automáticamente.
        </p>
        <button
          onClick={onDismiss}
          className='shrink-0 text-zinc-500 hover:text-zinc-300'
        >
          <X className='h-4 w-4' />
        </button>
      </div>
    </div>
  )
}
