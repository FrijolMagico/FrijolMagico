'use client'

import { Eye, EyeOff } from 'lucide-react'

export function FestivalSpoilerToggle() {
  return (
    <button
      type='button'
      data-spoiler-global-toggle
      aria-label='Revelar participantes'
      title='Revelar participantes'
      className='bg-palette-primary text-primary-foreground fixed right-5 bottom-5 z-20 cursor-pointer rounded-full p-3 shadow-lg transition-opacity focus-visible:ring-2 focus-visible:ring-offset-2 disabled:cursor-wait disabled:opacity-60'
    >
      <Eye
        data-spoiler-toggle-icon='reveal'
        className='text-palette-background size-5'
        aria-hidden='true'
      />
      <EyeOff
        data-spoiler-toggle-icon='conceal'
        className='text-palette-background hidden size-5'
        aria-hidden='true'
      />
    </button>
  )
}
