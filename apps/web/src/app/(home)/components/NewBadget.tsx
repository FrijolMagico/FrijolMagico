import { cn } from '@/utils/cn'

export const NewBadget = ({
  color = 'text-secondary',
  backgroundColor = 'bg-background',
  outlineColor = 'outline-background'
}) => {
  return (
    <span
      className={cn(
        'absolute -top-2 -left-2 z-20 -rotate-6 rounded-md px-2 font-bold outline-2',
        color,
        backgroundColor,
        outlineColor
      )}
    >
      Nuevo!
    </span>
  )
}
