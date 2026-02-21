import { Button } from './ui/button'
import { TooltipContent, Tooltip, TooltipTrigger } from './ui/tooltip'
import { Tooltip as TooltipPrimitive } from '@base-ui/react/tooltip'
import { Button as ButtonPrimitive } from '@base-ui/react/button'

interface ButtonWithTooltipProps extends ButtonPrimitive.Props {
  size?:
    | 'default'
    | 'xs'
    | 'sm'
    | 'lg'
    | 'icon'
    | 'icon-xs'
    | 'icon-sm'
    | 'icon-lg'
  variant?:
    | 'default'
    | 'outline'
    | 'secondary'
    | 'ghost'
    | 'destructive'
    | 'link'
  tooltipContent: string
  tooltip?: TooltipPrimitive.Popup.Props &
    Pick<
      TooltipPrimitive.Positioner.Props,
      'align' | 'alignOffset' | 'side' | 'sideOffset'
    >
}

export function ButtonWithTooltip({
  size = 'default',
  variant = 'default',
  tooltipContent,
  tooltip,
  children,
  ...props
}: ButtonWithTooltipProps) {
  return (
    <Tooltip>
      <TooltipTrigger
        className='mx-auto flex items-center justify-center'
        render={
          <Button size={size} variant={variant} {...props}>
            {children}
          </Button>
        }
      />
      <TooltipContent {...tooltip}>{tooltipContent}</TooltipContent>
    </Tooltip>
  )
}
