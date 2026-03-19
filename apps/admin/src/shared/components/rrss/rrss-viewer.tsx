'use client'

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger
} from '@/shared/components/ui/dropdown-menu'
import { Button } from '../ui/button'

interface RRSSViewerProps {
  rrss: Record<string, string | string[]> | null
  disabled?: boolean
}

function extractHandle(url: string): string {
  try {
    const parsed = new URL(url)
    const segments = parsed.pathname.split('/').filter(Boolean)
    return segments[segments.length - 1] || url
  } catch {
    return url
  }
}

function isValidUrl(url: string): boolean {
  if (!url) return false
  try {
    const parsed = new URL(url)
    return parsed.protocol === 'http:' || parsed.protocol === 'https:'
  } catch {
    return false
  }
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

  const validEntries = flat.filter(({ url }) => isValidUrl(url))

  if (validEntries.length === 0) {
    return <span className='text-muted-foreground'>-</span>
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        render={
          <Button size='xs' variant='outline' disabled={disabled}>
            Ver
          </Button>
        }
      />

      <DropdownMenuContent className='w-full min-w-40'>
        {validEntries.map(({ platform, url }, index) => (
          <DropdownMenuItem key={`${platform}-${url}-${index}`}>
            <a
              href={url}
              target='_blank'
              rel='noopener noreferrer'
              className='w-full text-nowrap'
            >
              {platform}: @{extractHandle(url)}
            </a>
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
