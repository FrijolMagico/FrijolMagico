import type { ParticipantItem as TParticipantItem } from '../_types/participations.types'
import { ParticipantItem } from './participant-item'

interface ParticipantsGroupProps {
  label: string
  items: TParticipantItem[]
}

export function ParticipantsGroup({ label, items }: ParticipantsGroupProps) {
  return (
    <section className='space-y-4'>
      <h3 className=''>
        <span className='text-muted-foreground text-sm font-normal'>
          ({items.length})
        </span>{' '}
        {label}
      </h3>
      <div className='grid grid-cols-[repeat(auto-fit,minmax(200px,1fr))] gap-2'>
        {items.map((item) => (
          <ParticipantItem key={item.participation.id} {...item} />
        ))}
      </div>
    </section>
  )
}
