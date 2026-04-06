import type { Exhibition } from '../_schemas/exhibition.schema'
import type { Participation } from '../_schemas/edition-participation.schema'
import type {
  ArtistLookup,
  BandLookup,
  CollectiveLookup,
  EditionLookup,
  Participant,
  ParticipantEntity
} from '../_types/participations.types'
import { ActivityWithDetail } from '../_types/activity.types'

interface ComposeParticipationsParams {
  participations: Participation[]
  edition: EditionLookup
  exhibitions: Exhibition[]
  activities: ActivityWithDetail[]
  artistsLookup: Map<number, ArtistLookup>
  collectivesLookup: Map<number, CollectiveLookup>
  bandsLookup: Map<number, BandLookup>
}

/**
 * Returns null when the entity referenced by the participation has been
 * soft-deleted. The lookup maps only contain non-deleted entities
 * (getArtistsLookup, getCollectivesLookup, getBandsLookup all filter by
 * deletedAt IS NULL), so a missing entry means the entity was removed after
 * the participation was created.
 */
function getParticipantEntity(
  participation: Participation,
  artistsLookup: Map<number, ArtistLookup>,
  collectivesLookup: Map<number, CollectiveLookup>,
  bandsLookup: Map<number, BandLookup>
): ParticipantEntity | null {
  if (participation.artistaId) {
    const artist = artistsLookup.get(participation.artistaId)
    if (!artist) return null
    return { artist, collective: null, band: null }
  }

  if (participation.agrupacionId) {
    const collective = collectivesLookup.get(participation.agrupacionId)
    if (!collective) return null
    return { artist: null, collective, band: null }
  }

  if (participation.bandaId) {
    const band = bandsLookup.get(participation.bandaId)
    if (!band) return null
    return { artist: null, collective: null, band }
  }

  throw new Error(
    `Participation with ID ${participation.id} has no entity FK set. \n` +
      `This should have been filtered by the DAL`
  )
}

export function composeParticipations({
  participations,
  edition,
  exhibitions,
  activities,
  artistsLookup,
  collectivesLookup,
  bandsLookup
}: ComposeParticipationsParams): Participant[] {
  return participations.flatMap((participation) => {
    const entity = getParticipantEntity(
      participation,
      artistsLookup,
      collectivesLookup,
      bandsLookup
    )

    // Skip participations whose entity was soft-deleted after creation
    if (!entity) return []

    const exhibition =
      exhibitions.find(
        (exhibition) => exhibition.participacionId === participation.id
      ) || null

    const activitiesFromParticipation = activities.filter(
      (activity) => activity.participacionId === participation.id
    )

    return [
      {
        id: participation.id,
        notas: participation.notas,
        edition,
        entity,
        exhibition: exhibition
          ? {
              id: exhibition.id,
              participacionId: exhibition.participacionId,
              disciplinaId: exhibition.disciplinaId,
              modoIngresoId: exhibition.modoIngresoId,
              estado: exhibition.estado,
              puntaje: exhibition.puntaje,
              notas: exhibition.notas
            }
          : null,
        activities: activitiesFromParticipation.map((activity) => ({
          id: activity.id,
          participacionId: activity.participacionId,
          modoIngresoId: activity.modoIngresoId,
          tipoActividadId: activity.tipoActividadId,
          puntaje: activity.puntaje,
          estado: activity.estado,
          notas: activity.notas,
          detail: activity.detail
        }))
      }
    ]
  })
}
