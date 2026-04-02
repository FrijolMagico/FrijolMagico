import { Button } from '@/shared/components/ui/button'
import { IconChevronDown } from '@tabler/icons-react'
import { EditionLookup } from '../_types/participations.types'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuPortal,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuTrigger
} from '@/shared/components/ui/dropdown-menu'

interface ParticipationsEditionSelectorProps {
  currentEdition: EditionLookup
  editions: EditionLookup[]
  setFilters: (filters: { edicion: string }) => void
}

export function ParticipationsEditionSelector({
  currentEdition,
  editions,
  setFilters
}: ParticipationsEditionSelectorProps) {
  const currentLabel = currentEdition
    ? `${currentEdition.eventName} ${currentEdition.editionNumber}`
    : 'Seleccionar edición'

  const editionsByEvent = editions.reduce(
    (accumulator, edition) => {
      const key = edition.eventName
      if (!accumulator[key]) accumulator[key] = []
      accumulator[key].push(edition)
      return accumulator
    },
    {} as Record<string, typeof editions>
  )

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        render={
          <Button variant='outline'>
            {currentLabel}
            <IconChevronDown className='ml-2 shrink-0' />
          </Button>
        }
      />
      <DropdownMenuContent>
        <DropdownMenuGroup>
          {Object.entries(editionsByEvent).map(([eventName, editions]) => (
            <DropdownMenuSub key={eventName}>
              <DropdownMenuSubTrigger>{eventName}</DropdownMenuSubTrigger>
              <DropdownMenuPortal>
                <DropdownMenuSubContent>
                  {editions.map((edition) => (
                    <DropdownMenuItem
                      key={edition.id}
                      onClick={() =>
                        setFilters({ edicion: edition.slug ?? '' })
                      }
                    >
                      {edition.editionNumber}
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuSubContent>
              </DropdownMenuPortal>
            </DropdownMenuSub>
          ))}
        </DropdownMenuGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
