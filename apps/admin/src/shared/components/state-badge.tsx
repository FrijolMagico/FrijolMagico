import { Badge } from './ui/badge'

interface StateBadgeProps {
  isNew?: boolean
  isUpdated?: boolean
  isDeleted?: boolean
}

export function StateBadge({ isNew, isUpdated, isDeleted }: StateBadgeProps) {
  return (
    <div className='flex flex-col items-center gap-1'>
      {isNew && <Badge variant={isDeleted ? 'ghost' : 'default'}>Nuevo</Badge>}
      {isUpdated && (
        <Badge variant={isDeleted ? 'ghost' : 'outline'}>Modificado</Badge>
      )}
      {isDeleted && <Badge variant='destructive'>Eliminado</Badge>}
    </div>
  )
}
