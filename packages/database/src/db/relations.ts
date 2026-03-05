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
  eventEditionParticipant,
  admissionMode,
  participantActivity,
  participantExhibition,
  activityType
} from './schema/participations'

import {
  collective,
  artist,
  artistStatus,
  artistHistory,
  artistImage,
  catalogArtist
} from './schema/artist'

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
  exposiciones: many(participantExhibition)
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
  participaciones: many(eventEditionParticipant),
  exposiciones: many(participantExhibition),
  actividades: many(participantActivity)
}))

export const artistImageRelations = relations(artistImage, ({ one }) => ({
  artist: one(artist, {
    fields: [artistImage.artistaId],
    references: [artist.id]
  })
}))

export const artistHistoryRelations = relations(
  artistHistory,
  ({ one }) => ({
    artist: one(artist, {
      fields: [artistHistory.artistaId],
      references: [artist.id]
    })
  })
)

export const catalogArtistRelations = relations(
  catalogArtist,
  ({ one }) => ({
    artist: one(artist, {
      fields: [catalogArtist.artistaId],
      references: [artist.id]
    })
  })
)

export const collectiveRelations = relations(collective, ({ many }) => ({
  exposiciones: many(participantExhibition),
  actividades: many(participantActivity)
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
    participantes: many(eventEditionParticipant),
    exposiciones: many(participantExhibition),
    actividades: many(participantActivity)
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
    exposiciones: many(participantExhibition),
    actividades: many(participantActivity)
  })
)

// ============================================
// Participant Relations
// ============================================

export const activityTypeRelations = relations(activityType, ({ many }) => ({
  actividades: many(participantActivity)
}))

export const admissionModeRelations = relations(admissionMode, ({ many }) => ({
  exposiciones: many(participantExhibition),
  actividades: many(participantActivity)
}))

export const eventEditionParticipantRelations = relations(
  eventEditionParticipant,
  ({ one, many }) => ({
    eventoEdicion: one(eventEdition, {
      fields: [eventEditionParticipant.eventoEdicionId],
      references: [eventEdition.id]
    }),
    artist: one(artist, {
      fields: [eventEditionParticipant.artistaId],
      references: [artist.id]
    }),
    exposiciones: many(participantExhibition),
    actividades: many(participantActivity)
  })
)

export const participantExhibitionRelations = relations(
  participantExhibition,
  ({ one }) => ({
    artist: one(artist, {
      fields: [participantExhibition.artistaId],
      references: [artist.id]
    }),
    eventoEdicion: one(eventEdition, {
      fields: [participantExhibition.eventoEdicionId],
      references: [eventEdition.id]
    }),
    postulacion: one(eventEditionApplication, {
      fields: [participantExhibition.postulacionId],
      references: [eventEditionApplication.id]
    }),
    participant: one(eventEditionParticipant, {
      fields: [participantExhibition.participanteId],
      references: [eventEditionParticipant.id]
    }),
    discipline: one(discipline, {
      fields: [participantExhibition.disciplinaId],
      references: [discipline.id]
    }),
    agrupacion: one(collective, {
      fields: [participantExhibition.agrupacionId],
      references: [collective.id]
    }),
    modoIngreso: one(admissionMode, {
      fields: [participantExhibition.modoIngresoId],
      references: [admissionMode.id]
    })
  })
)

export const participantActivityRelations = relations(
  participantActivity,
  ({ one }) => ({
    artist: one(artist, {
      fields: [participantActivity.artistaId],
      references: [artist.id]
    }),
    eventoEdicion: one(eventEdition, {
      fields: [participantActivity.eventoEdicionId],
      references: [eventEdition.id]
    }),
    postulacion: one(eventEditionApplication, {
      fields: [participantActivity.postulacionId],
      references: [eventEditionApplication.id]
    }),
    participant: one(eventEditionParticipant, {
      fields: [participantActivity.participanteId],
      references: [eventEditionParticipant.id]
    }),
    tipoActividad: one(activityType, {
      fields: [participantActivity.tipoActividadId],
      references: [activityType.id]
    }),
    agrupacion: one(collective, {
      fields: [participantActivity.agrupacionId],
      references: [collective.id]
    }),
    modoIngreso: one(admissionMode, {
      fields: [participantActivity.modoIngresoId],
      references: [admissionMode.id]
    }),
    actividad: one(activity, {
      fields: [participantActivity.id],
      references: [activity.participanteActividadId]
    })
  })
)

export const activityRelations = relations(activity, ({ one }) => ({
  participantActivity: one(participantActivity, {
    fields: [activity.participanteActividadId],
    references: [participantActivity.id]
  })
}))

// ============================================
// Auth Relations (Better Auth)
// ============================================

import { user, session, account } from './schema/auth'

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
