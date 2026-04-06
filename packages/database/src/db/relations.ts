import { relations } from 'drizzle-orm'

import {
  discipline,
  place,
  organization,
  organizationMember
} from './schema/core'

import {
  event,
  eventEdition,
  eventEditionMetric,
  eventEditionApplication,
  eventEditionSnapshot,
  eventEditionDay
} from './schema/events'

import {
  activity,
  editionParticipation,
  admissionMode,
  participationActivity,
  participationExhibition,
  activityType
} from './schema/participations'

import {
  collective,
  artist,
  artistStatus,
  artistHistory,
  artistImage,
  catalogArtist,
  band
} from './schema/artist'

import { user, session, account } from './schema/auth'

// ============================================
// Core Relations
// ============================================

export const organizationRelations = relations(organization, ({ many }) => ({
  equipo: many(organizationMember),
  eventos: many(event)
}))

export const organizationMemberRelations = relations(
  organizationMember,
  ({ one }) => ({
    organization: one(organization, {
      fields: [organizationMember.organizationId],
      references: [organization.id]
    })
  })
)

export const placeRelations = relations(place, ({ many }) => ({
  diasEvento: many(eventEditionDay)
}))

export const disciplineRelations = relations(discipline, ({ many }) => ({
  postulaciones: many(eventEditionApplication),
  participacionesExposicion: many(participationExhibition)
}))

// ============================================
// Artist Relations
// ============================================

export const artistStatusRelations = relations(artistStatus, ({ many }) => ({
  artists: many(artist)
}))

export const artistRelations = relations(artist, ({ one, many }) => ({
  estado: one(artistStatus, {
    fields: [artist.estadoId],
    references: [artistStatus.id]
  }),
  imagenes: many(artistImage),
  historial: many(artistHistory),
  catalogoArtista: one(catalogArtist, {
    fields: [artist.id],
    references: [catalogArtist.artistaId]
  }),
  participaciones: many(editionParticipation)
}))

export const artistImageRelations = relations(artistImage, ({ one }) => ({
  artist: one(artist, {
    fields: [artistImage.artistaId],
    references: [artist.id]
  })
}))

export const artistHistoryRelations = relations(artistHistory, ({ one }) => ({
  artist: one(artist, {
    fields: [artistHistory.artistaId],
    references: [artist.id]
  })
}))

export const catalogArtistRelations = relations(catalogArtist, ({ one }) => ({
  artist: one(artist, {
    fields: [catalogArtist.artistaId],
    references: [artist.id]
  })
}))

export const collectiveRelations = relations(collective, ({ many }) => ({
  participaciones: many(editionParticipation)
}))

// ============================================
// Event Relations
// ============================================

export const eventRelations = relations(event, ({ one, many }) => ({
  organizacion: one(organization, {
    fields: [event.organizacionId],
    references: [organization.id]
  }),
  ediciones: many(eventEdition)
}))

export const eventEditionRelations = relations(
  eventEdition,
  ({ one, many }) => ({
    evento: one(event, {
      fields: [eventEdition.eventoId],
      references: [event.id]
    }),
    dias: many(eventEditionDay),
    metricas: many(eventEditionMetric),
    snapshots: many(eventEditionSnapshot),
    postulaciones: many(eventEditionApplication),
    participaciones: many(editionParticipation)
  })
)

export const eventEditionDayRelations = relations(
  eventEditionDay,
  ({ one }) => ({
    eventoEdicion: one(eventEdition, {
      fields: [eventEditionDay.eventoEdicionId],
      references: [eventEdition.id]
    }),
    lugar: one(place, {
      fields: [eventEditionDay.lugarId],
      references: [place.id]
    })
  })
)

export const eventEditionMetricRelations = relations(
  eventEditionMetric,
  ({ one }) => ({
    eventoEdicion: one(eventEdition, {
      fields: [eventEditionMetric.eventoEdicionId],
      references: [eventEdition.id]
    })
  })
)

export const eventEditionSnapshotRelations = relations(
  eventEditionSnapshot,
  ({ one }) => ({
    eventoEdicion: one(eventEdition, {
      fields: [eventEditionSnapshot.eventoEdicionId],
      references: [eventEdition.id]
    })
  })
)

export const eventEditionApplicationRelations = relations(
  eventEditionApplication,
  ({ one, many }) => ({
    eventoEdicion: one(eventEdition, {
      fields: [eventEditionApplication.eventoEdicionId],
      references: [eventEdition.id]
    }),
    discipline: one(discipline, {
      fields: [eventEditionApplication.disciplinaId],
      references: [discipline.id]
    }),
    participacionesExposicion: many(participationExhibition),
    participacionesActividad: many(participationActivity)
  })
)

// ============================================
// Participant Relations
// ============================================

export const activityTypeRelations = relations(activityType, ({ many }) => ({
  participacionesActividad: many(participationActivity)
}))

export const admissionModeRelations = relations(admissionMode, ({ many }) => ({
  participacionesExposicion: many(participationExhibition),
  participacionesActividad: many(participationActivity)
}))

export const editionParticipationRelations = relations(
  editionParticipation,
  ({ one }) => ({
    edicion: one(eventEdition, {
      fields: [editionParticipation.edicionId],
      references: [eventEdition.id]
    }),
    artista: one(artist, {
      fields: [editionParticipation.artistaId],
      references: [artist.id]
    }),
    agrupacion: one(collective, {
      fields: [editionParticipation.agrupacionId],
      references: [collective.id]
    }),
    banda: one(band, {
      fields: [editionParticipation.bandaId],
      references: [band.id]
    }),
    exposicion: one(participationExhibition, {
      fields: [editionParticipation.id],
      references: [participationExhibition.participacionId]
    }),
    actividad: one(participationActivity, {
      fields: [editionParticipation.id],
      references: [participationActivity.participacionId]
    })
  })
)

export const participationExhibitionRelations = relations(
  participationExhibition,
  ({ one }) => ({
    participacion: one(editionParticipation, {
      fields: [participationExhibition.participacionId],
      references: [editionParticipation.id]
    }),
    disciplina: one(discipline, {
      fields: [participationExhibition.disciplinaId],
      references: [discipline.id]
    }),
    postulacion: one(eventEditionApplication, {
      fields: [participationExhibition.postulacionId],
      references: [eventEditionApplication.id]
    }),
    modoIngreso: one(admissionMode, {
      fields: [participationExhibition.modoIngresoId],
      references: [admissionMode.id]
    })
  })
)

export const participationActivityRelations = relations(
  participationActivity,
  ({ one }) => ({
    participacion: one(editionParticipation, {
      fields: [participationActivity.participacionId],
      references: [editionParticipation.id]
    }),
    tipoActividad: one(activityType, {
      fields: [participationActivity.tipoActividadId],
      references: [activityType.id]
    }),
    postulacion: one(eventEditionApplication, {
      fields: [participationActivity.postulacionId],
      references: [eventEditionApplication.id]
    }),
    modoIngreso: one(admissionMode, {
      fields: [participationActivity.modoIngresoId],
      references: [admissionMode.id]
    }),
    actividad: one(activity, {
      fields: [participationActivity.id],
      references: [activity.participacionActividadId]
    })
  })
)

export const activityRelations = relations(activity, ({ one }) => ({
  participacionActividad: one(participationActivity, {
    fields: [activity.participacionActividadId],
    references: [participationActivity.id]
  })
}))

// ============================================
// Auth Relations (Better Auth)
// ============================================

export const userRelations = relations(user, ({ many }) => ({
  sessions: many(session),
  accounts: many(account)
}))

export const sessionRelations = relations(session, ({ one }) => ({
  user: one(user, {
    fields: [session.userId],
    references: [user.id]
  })
}))

export const accountRelations = relations(account, ({ one }) => ({
  user: one(user, {
    fields: [account.userId],
    references: [user.id]
  })
}))
