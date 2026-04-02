import type { Exhibition } from '../_schemas/exhibition.schema'
import type {
  ParticipationStatus,
  ParticipantType
} from '../_constants/participations.constants'
import type { Participation } from '../_schemas/edition-participation.schema'
import { ActivityWithDetail } from './activity.types'
export type { ParticipationStatus, ParticipantType }
export {
  PARTICIPATION_STATUS,
  PARTICIPANT_TYPE,
  isParticipationStatus
} from '../_constants/participations.constants'

export interface EditionLookup {
  id: number
  editionNumber: string
  slug: string | null
  eventName: string
}

export interface ArtistLookup {
  id: number
  pseudonym: string
  statusId: number
}

export interface CollectiveLookup {
  id: number
  name: string
}

export interface BandLookup {
  id: number
  name: string
}

export type ParticipantEntity =
  | {
      artist: ArtistLookup
      collective: null
      band: null
    }
  | {
      artist: null
      collective: CollectiveLookup
      band: null
    }
  | {
      artist: null
      collective: null
      band: BandLookup
    }

export type ExhibitionLookup = Omit<Exhibition, 'postulacionId'> & {
  participacionId: number | null
}

export type ActivityLookup = Omit<ActivityWithDetail, 'postulacionId'> & {
  participacionId: number | null
}

export interface Participant extends Pick<Participation, 'id' | 'notas'> {
  entity: ParticipantEntity
  exhibition: ExhibitionLookup | null
  activities: ActivityLookup[]
}

export interface ParticipationsViewData {
  edition: EditionLookup & {
    participations: Participant[]
  }
  editions: EditionLookup[]
  artists: ArtistLookup[]
  collectives: CollectiveLookup[]
  bands: BandLookup[]
}

export function isExhibitionLookup(
  participation: ExhibitionLookup | ActivityLookup
): participation is ExhibitionLookup {
  return 'disciplinaId' in participation
}

export interface ParticipantItem {
  entity: ParticipantEntity
  participation: ExhibitionLookup | ActivityLookup
}
