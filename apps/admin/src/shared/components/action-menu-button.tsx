import { EllipsisVertical, RotateCcw } from 'lucide-react'
import { Button } from './ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger
} from './ui/dropdown-menu'

type ActionsProps = {
  label: string
  onClick: () => void
  hidden?: boolean
  variant?: 'default' | 'destructive'
  className?: string
}

interface ActionMenuButtonProps {
  actions: ActionsProps[]
  isDeleted?: boolean
  onDelete?: () => void
  onRestore?: () => void
}

export const ActionMenuButton = ({
  actions,
  isDeleted,
  onDelete,
  onRestore
}: ActionMenuButtonProps) => {
  if (isDeleted) {
    return (
      <Button
        size='icon'
        variant='ghost'
        onClick={onRestore}
        className='text-green-500 hover:text-green-500/80'
        aria-label='Restaurar'
      >
        <RotateCcw />
      </Button>
    )
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        render={
          <Button
            size='icon'
            variant='ghost'
            aria-label='Abrir menú de acciones'
          >
            <EllipsisVertical />
          </Button>
        }
      />
      <DropdownMenuContent>
        {actions.map(({ label, hidden, ...props }) => {
          if (hidden) return null
          return (
            <DropdownMenuItem key={label} {...props}>
              {label}
            </DropdownMenuItem>
          )
        })}
        <DropdownMenuSeparator />
        <DropdownMenuItem variant='destructive' onClick={onDelete}>
          Eliminar
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
