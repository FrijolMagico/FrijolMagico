import { IconDotsVertical, IconRotateClockwise } from '@tabler/icons-react'
import { Button } from './ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger
} from './ui/dropdown-menu'
import { isValidElement } from 'react'

type ActionsProps =
  | {
      label: string
      onClick: () => void
      hidden?: boolean
      variant?: 'default' | 'destructive'
      className?: string
    }
  | React.ReactNode

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
        <IconRotateClockwise />
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
            <IconDotsVertical />
          </Button>
        }
      />
      <DropdownMenuContent>
        {actions.map((action) => {
          if (!action) return null

          if (isValidElement(action)) {
            return action
          }

          if (
            typeof action === 'object' &&
            'label' in action &&
            'onClick' in action
          ) {
            return (
              <DropdownMenuItem
                key={action.label}
                onClick={action.onClick}
                className={action.className}
                hidden={action.hidden}
                variant={action.variant}
              >
                {action.label}
              </DropdownMenuItem>
            )
          }
        })}
        <DropdownMenuSeparator />
        <DropdownMenuItem variant='destructive' onClick={onDelete}>
          Eliminar
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
