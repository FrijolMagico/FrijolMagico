import { cn } from '@/utils/cn'
import { cva, type VariantProps } from 'class-variance-authority'
import { ArrowRightIcon } from 'lucide-react'
import Link from 'next/link'

const linkVariants = cva(
  'group relative uppercase flex items-center w-fit gap-1 hover:text-accent duration-200',
  {
    variants: {
      size: {
        default: 'text-sm font-roboto-mono  [&>svg]:size-3',
        xl: 'text-3xl lg:text-4xl font-rubik font-bold [&>svg]:size-8'
      }
    },
    defaultVariants: {
      size: 'default'
    }
  }
)

interface LinkBtnProps extends React.ComponentPropsWithoutRef<typeof Link> {
  children: React.ReactNode
  withArrow?: boolean
}

export function LinkBtn({
  children,
  withArrow,
  size = 'default',
  ...props
}: LinkBtnProps & VariantProps<typeof linkVariants>) {
  return (
    <Link
      {...props}
      className={cn(
        linkVariants({
          size
        }),
        props.className
      )}
    >
      {children}
      {withArrow && (
        <ArrowRightIcon
          className={cn(
            'absolute left-[105%] duration-200 group-hover:-rotate-45'
          )}
        />
      )}
    </Link>
  )
}
