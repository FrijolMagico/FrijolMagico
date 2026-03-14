import { IconFileOff } from '@tabler/icons-react'
import { Button } from '@/shared/components/ui/button'

interface EmptyStateProps {
  title: string
  description: string
  action?: {
    label: string
    onClick?: () => void
    href?: string
  }
}

export function EmptyState({ title, description, action }: EmptyStateProps) {
  return (
    <div className='flex flex-col items-center justify-center py-12 text-center'>
      <div className='bg-muted mb-4 rounded-full p-4'>
        <IconFileOff className='text-muted-foreground h-8 w-8' />
      </div>
      <h3 className='text-foreground mb-2 text-lg font-semibold'>{title}</h3>
      <p className='text-muted-foreground mb-6 max-w-sm'>{description}</p>
      {action && (
        <Button
          onClick={action.onClick}
          {...(action.href ? { asChild: true } : {})}
        >
          {action.href ? (
            <a href={action.href}>{action.label}</a>
          ) : (
            action.label
          )}
        </Button>
      )}
    </div>
  )
}
