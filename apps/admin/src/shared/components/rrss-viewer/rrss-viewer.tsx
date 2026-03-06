'use client'

import Link from 'next/link'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger
} from '@/shared/components/ui/dropdown-menu'
import { ButtonWithTooltip } from '@/shared/components/button-with-tooltip'

interface RRSSViewerProps {
  rrss: Record<string, string | string[]> | null
  disabled?: boolean
}

export function RRSSViewer({ rrss, disabled }: RRSSViewerProps) {
  if (!rrss || Object.keys(rrss).length === 0) {
    return <span className='text-muted-foreground'>-</span>
  }

  // Normalize both shapes to flat { platform, url }[] array
  const entries = Object.entries(rrss)
  const flat = entries.flatMap(([platform, value]) =>
    Array.isArray(value)
      ? value.map((url) => ({ platform, url }))
      : [{ platform, url: value }]
  )

  if (flat.length === 0) {
    return <span className='text-muted-foreground'>-</span>
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        render={
          <ButtonWithTooltip
            size='xs'
            variant='outline'
            tooltipContent='Ver RRSS'
            disabled={disabled}
          >
            Ver
          </ButtonWithTooltip>
        }
      />

      <DropdownMenuContent className='w-full min-w-40'>
        {flat.map(({ platform, url }) => (
          <DropdownMenuItem
            key={url + platform}
            render={
              <Link
                href={url}
                target='_blank'
                className='w-full text-nowrap'
              >
                {platform}: @{url.split('/')[3]}
              </Link>
            }
          />
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
