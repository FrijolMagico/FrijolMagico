'use client'

import Link from 'next/link'
import ReactMarkdown from 'react-markdown'
import siteData from '@/data/site.json'
import { cn } from '@/utils/cn'
import bannerData from '@/data/banner_data.json'
import { useScrollHide } from '@/hooks/useScrollHide'

const { top_bar } = siteData

export const TopBarInfo = () => {
  const visible = useScrollHide(100)

  return (
    <section
      aria-label='Frijol Mágico'
      className={cn(
        'bg-primary fixed top-0 z-40 flex w-full flex-col items-center justify-between space-y-4 px-4 py-4 font-sans transition-transform duration-300 ease-in-out sm:flex-row sm:px-6 sm:py-2 md:top-0 md:space-y-0',
        !visible && '-translate-y-full'
      )}
    >
      <div className='flex flex-nowrap space-x-4'>
        <h2 className='2md:max-w-fit 2md:leading-normal w-full text-center leading-none text-white'>
          <ReactMarkdown
            components={{
              p: ({ children }) => <>{children}</>
            }}
          >
            {top_bar.text}
          </ReactMarkdown>
        </h2>
      </div>
      <Link
        href={top_bar.button.active ? bannerData.right_button.url : '#'}
        className={cn(
          'bg-accent background-size-[150%] rounded-lg bg-linear-to-r px-4 py-0.5 font-bold text-white transition-[background-position] duration-200 hover:bg-right',
          top_bar.button.active
            ? 'cursor-pointer'
            : 'cursor-not-allowed opacity-75'
        )}
      >
        {top_bar.button.text}
      </Link>
    </section>
  )
}
