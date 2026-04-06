import { Button } from '@/shared/components/ui/button'
import { Input } from '@/shared/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger
} from '@/shared/components/ui/select'
import { ParticipationsQueryParams } from '../_schemas/query-params.schema'
import {
  PARTICIPATION_STATUS_LABELS,
  PARTICIPATION_STATUSES
} from '../_constants/participations.constants'

interface ParticipantsFiltersProps {
  filters: ParticipationsQueryParams
  setFilters: (filters: Partial<ParticipationsQueryParams>) => void
}

export function ParticipantsFilters({
  filters,
  setFilters
}: ParticipantsFiltersProps) {
  const hasActiveFilters = filters.search !== '' || filters.estado !== null

  return (
    <div className='flex flex-col gap-4 sm:flex-row sm:items-center'>
      <Input
        value={filters.search}
        onChange={(event) => setFilters({ search: event.target.value })}
        placeholder='Buscar participante...'
        className='max-w-sm'
      />
      <div className='flex items-center gap-2'>
        <Select
          value={filters.estado ?? 'all'}
          onValueChange={(value) =>
            setFilters({
              estado:
                value === 'all'
                  ? null
                  : (value as ParticipationsQueryParams['estado'])
            })
          }
        >
          <SelectTrigger>
            <span className='truncate'>
              {filters.estado
                ? PARTICIPATION_STATUS_LABELS[filters.estado]
                : 'Todos los estados'}
            </span>
          </SelectTrigger>
          <SelectContent>
            <SelectItem value='all'>Todos los estados</SelectItem>
            {PARTICIPATION_STATUSES.map((value) => (
              <SelectItem key={value} value={value}>
                {PARTICIPATION_STATUS_LABELS[value]}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        {hasActiveFilters && (
          <Button
            variant='ghost'
            size='sm'
            onClick={() => setFilters({ search: '', estado: null })}
          >
            Limpiar
          </Button>
        )}
      </div>
    </div>
  )
}
