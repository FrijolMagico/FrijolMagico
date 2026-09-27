'use client'

import ReactMarkdown from 'react-markdown'

import { LinkCta } from '@/components/link-cta'
import { cn } from '@/utils/cn'
import { useScrollHide } from '@/hooks/useScrollHide'

export interface TopBarData {
  text: string
  button: {
    active: boolean
    text: string
    href?: string
  }
}

interface TopBarInfoClientProps {
  data: TopBarData
}

export const TopBarInfoClient = ({ data }: TopBarInfoClientProps) => {
  const visible = useScrollHide(100)

  return (
    <section
      aria-label='Frijol Mágico'
      className={cn(
        'bg-primary fixed top-0 z-40 flex w-full flex-col items-center justify-between space-y-4 px-4 py-4 font-sans transition-transform duration-300 ease-in-out sm:flex-row sm:px-6 sm:py-2 md:top-0 md:space-y-0',
        !visible && '-translate-y-full'
      )}
    >
      <div className='flex flex-nowrap space-x-4 py-1.5'>
        <h2 className='2md:max-w-fit 2md:leading-normal w-full text-center leading-none text-white'>
          <ReactMarkdown
            components={{
              p: ({ children }) => <>{children}</>
            }}
          >
            {data.text}
          </ReactMarkdown>
        </h2>
      </div>
      {data.button.active && (
        <LinkCta href={data.button.href ?? '#'} variant='solid'>
          {data.button.text}
        </LinkCta>
      )}
    </section>
  )
}
