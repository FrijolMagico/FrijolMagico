'use client'

import { useState } from 'react'
import { type ReactNode } from 'react'
import { toast } from 'sonner'
import { IconCopy, IconCheck } from '@tabler/icons-react'
import { cn } from '@/shared/lib/utils'

interface CopyToClipboardProps {
  children: ReactNode
  className?: string
  successMessage?: string
  duration?: number
}

async function copyToClipboard(text: string): Promise<void> {
  await navigator.clipboard.writeText(text)
}

function getTextContent(children: ReactNode): string {
  if (typeof children === 'string') return children
  if (typeof children === 'number') return String(children)
  if (Array.isArray(children)) {
    return children.map(getTextContent).join('')
  }
  // For React elements, try to extract text from props or children
  if (children && typeof children === 'object' && 'props' in children) {
    const element = children as { props?: { children?: ReactNode } }
    if (element.props?.children) {
      return getTextContent(element.props.children)
    }
  }
  return ''
}

export function CopyToClipboard({
  children,
  successMessage = 'Copiado al portapapeles'
}: CopyToClipboardProps) {
  const [copied, setCopied] = useState(false)

  const handleCopy = async () => {
    const text = getTextContent(children)
    if (!text) return

    await copyToClipboard(text)
    setCopied(true)
    toast.success(successMessage)

    setTimeout(() => {
      setCopied(false)
    }, 4000)
  }

  return (
    <button
      className={cn(
        'mx-0 flex items-center gap-2 px-0',
        copied && 'cursor-default'
      )}
      onClick={handleCopy}
      aria-label={copied ? 'Copiado' : 'Copiar al portapapeles'}
    >
      {children}
      {copied ? (
        <IconCheck className='text-success size-3' />
      ) : (
        <IconCopy className='size-3' />
      )}
    </button>
  )
}
