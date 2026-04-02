import { useParticipationsStore } from '../_store/use-participations-store'
import {
  isExhibitionLookup,
  type ParticipantItem
} from '../_types/participations.types'
import { ARTIST_STATUS } from '@/core/artistas/_constants'
import { Badge } from '@/shared/components/ui/badge'
import { IconUsersGroup, IconUser, IconMusic } from '@tabler/icons-react'
import {
  Item,
  ItemContent,
  ItemDescription,
  ItemMedia,
  ItemTitle
} from '@/shared/components/ui/item'

export function ParticipantItem({ entity, participation }: ParticipantItem) {
  const selectedExhibition = useParticipationsStore(
    (state) => state.selectedExhibition
  )

  const selectedActivity = useParticipationsStore(
    (state) => state.selectedActivity
  )

  const selectedParticipant =
    selectedExhibition.exhibition || selectedActivity.activity

  const setSelectedParticipant = useParticipationsStore(
    (state) => state.setSelectedParticipant
  )

  return (
    <Item
      size='xs'
      variant='outline'
      className='hover:bg-secondary/50 data-[state=selected]:bg-primary/50 cursor-pointer'
      onClick={() =>
        setSelectedParticipant({
          entity,
          exhibition: isExhibitionLookup(participation) ? participation : null,
          activity: isExhibitionLookup(participation) ? null : participation
        })
      }
      data-state={
        !selectedParticipant
          ? undefined
          : isExhibitionLookup(participation)
            ? isExhibitionLookup(selectedParticipant) &&
              selectedParticipant.id === participation.id
              ? 'selected'
              : undefined
            : !isExhibitionLookup(selectedParticipant) &&
                selectedParticipant.id === participation.id
              ? 'selected'
              : undefined
      }
    >
      <ItemMedia>
        {entity.band ? (
          <IconMusic />
        ) : entity.collective ? (
          <IconUsersGroup />
        ) : (
          <IconUser />
        )}
      </ItemMedia>
      <ItemContent>
        <ItemTitle>
          {entity.artist?.pseudonym ||
            entity.collective?.name ||
            entity.band?.name}
          {entity.artist?.statusId === ARTIST_STATUS.SUSPENDED && (
            <Badge variant='destructive'>Vetado</Badge>
          )}
        </ItemTitle>

        <ItemDescription>
          {entity.band ? 'Banda' : entity.collective ? 'Agrupación' : 'Artista'}
        </ItemDescription>
      </ItemContent>
    </Item>
  )
}
