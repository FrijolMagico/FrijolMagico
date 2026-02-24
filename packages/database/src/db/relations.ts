import { relations } from 'drizzle-orm'

import {
  discipline,
  place,
  organization,
  organizationMember
} from './schema/core'

import {
  evento,
  eventoEdicion,
  eventoEdicionMetrica,
  eventoEdicionPostulacion,
  eventoEdicionSnapshot
} from './schema/events'

import { eventoEdicionDia } from './schema/events'

import {
  actividad,
  eventoEdicionParticipante,
  modoIngreso,
  participanteActividad,
  participanteExposicion,
  tipoActividad
} from './schema/participations'

import {
  agrupacion,
  artista,
  artistaEstado,
  artistaHistorial,
  artistaImagen,
  catalogoArtista
} from './schema/artist'

// ============================================
// Core Relations
// ============================================

export const organizacionRelations = relations(organization, ({ many }) => ({
  equipo: many(organizationMember),
  eventos: many(evento)
}))

export const organizationMemberRelations = relations(
  organizationMember,
  ({ one }) => ({
    organizacion: one(organization, {
      fields: [organizationMember.organizationId],
      references: [organization.id]
    })
  })
)

export const lugarRelations = relations(place, ({ many }) => ({
  diasEvento: many(eventoEdicionDia)
}))

export const disciplinaRelations = relations(discipline, ({ many }) => ({
  postulaciones: many(eventoEdicionPostulacion),
  exposiciones: many(participanteExposicion)
}))

// ============================================
// Artista Relations
// ============================================

export const artistaEstadoRelations = relations(artistaEstado, ({ many }) => ({
  artistas: many(artista)
}))

export const artistaRelations = relations(artista, ({ one, many }) => ({
  estado: one(artistaEstado, {
    fields: [artista.estadoId],
    references: [artistaEstado.id]
  }),
  imagenes: many(artistaImagen),
  historial: many(artistaHistorial),
  catalogoArtista: one(catalogoArtista, {
    fields: [artista.id],
    references: [catalogoArtista.artistaId]
  }),
  participaciones: many(eventoEdicionParticipante),
  exposiciones: many(participanteExposicion),
  actividades: many(participanteActividad)
}))

export const artistaImagenRelations = relations(artistaImagen, ({ one }) => ({
  artista: one(artista, {
    fields: [artistaImagen.artistaId],
    references: [artista.id]
  })
}))

export const artistaHistorialRelations = relations(
  artistaHistorial,
  ({ one }) => ({
    artista: one(artista, {
      fields: [artistaHistorial.artistaId],
      references: [artista.id]
    })
  })
)

export const catalogoArtistaRelations = relations(
  catalogoArtista,
  ({ one }) => ({
    artista: one(artista, {
      fields: [catalogoArtista.artistaId],
      references: [artista.id]
    })
  })
)

export const agrupacionRelations = relations(agrupacion, ({ many }) => ({
  exposiciones: many(participanteExposicion),
  actividades: many(participanteActividad)
}))

// ============================================
// Evento Relations
// ============================================

export const eventoRelations = relations(evento, ({ one, many }) => ({
  organizacion: one(organization, {
    fields: [evento.organizacionId],
    references: [organization.id]
  }),
  ediciones: many(eventoEdicion)
}))

export const eventoEdicionRelations = relations(
  eventoEdicion,
  ({ one, many }) => ({
    evento: one(evento, {
      fields: [eventoEdicion.eventoId],
      references: [evento.id]
    }),
    dias: many(eventoEdicionDia),
    metricas: many(eventoEdicionMetrica),
    snapshots: many(eventoEdicionSnapshot),
    postulaciones: many(eventoEdicionPostulacion),
    participantes: many(eventoEdicionParticipante),
    exposiciones: many(participanteExposicion),
    actividades: many(participanteActividad)
  })
)

export const eventoEdicionDiaRelations = relations(
  eventoEdicionDia,
  ({ one }) => ({
    eventoEdicion: one(eventoEdicion, {
      fields: [eventoEdicionDia.eventoEdicionId],
      references: [eventoEdicion.id]
    }),
    lugar: one(place, {
      fields: [eventoEdicionDia.lugarId],
      references: [place.id]
    })
  })
)

export const eventoEdicionMetricaRelations = relations(
  eventoEdicionMetrica,
  ({ one }) => ({
    eventoEdicion: one(eventoEdicion, {
      fields: [eventoEdicionMetrica.eventoEdicionId],
      references: [eventoEdicion.id]
    })
  })
)

export const eventoEdicionSnapshotRelations = relations(
  eventoEdicionSnapshot,
  ({ one }) => ({
    eventoEdicion: one(eventoEdicion, {
      fields: [eventoEdicionSnapshot.eventoEdicionId],
      references: [eventoEdicion.id]
    })
  })
)

export const eventoEdicionPostulacionRelations = relations(
  eventoEdicionPostulacion,
  ({ one, many }) => ({
    eventoEdicion: one(eventoEdicion, {
      fields: [eventoEdicionPostulacion.eventoEdicionId],
      references: [eventoEdicion.id]
    }),
    disciplina: one(discipline, {
      fields: [eventoEdicionPostulacion.disciplinaId],
      references: [discipline.id]
    }),
    exposiciones: many(participanteExposicion),
    actividades: many(participanteActividad)
  })
)

// ============================================
// Participante Relations
// ============================================

export const tipoActividadRelations = relations(tipoActividad, ({ many }) => ({
  actividades: many(participanteActividad)
}))

export const modoIngresoRelations = relations(modoIngreso, ({ many }) => ({
  exposiciones: many(participanteExposicion),
  actividades: many(participanteActividad)
}))

export const eventoEdicionParticipanteRelations = relations(
  eventoEdicionParticipante,
  ({ one, many }) => ({
    eventoEdicion: one(eventoEdicion, {
      fields: [eventoEdicionParticipante.eventoEdicionId],
      references: [eventoEdicion.id]
    }),
    artista: one(artista, {
      fields: [eventoEdicionParticipante.artistaId],
      references: [artista.id]
    }),
    exposiciones: many(participanteExposicion),
    actividades: many(participanteActividad)
  })
)

export const participanteExposicionRelations = relations(
  participanteExposicion,
  ({ one }) => ({
    artista: one(artista, {
      fields: [participanteExposicion.artistaId],
      references: [artista.id]
    }),
    eventoEdicion: one(eventoEdicion, {
      fields: [participanteExposicion.eventoEdicionId],
      references: [eventoEdicion.id]
    }),
    postulacion: one(eventoEdicionPostulacion, {
      fields: [participanteExposicion.postulacionId],
      references: [eventoEdicionPostulacion.id]
    }),
    participante: one(eventoEdicionParticipante, {
      fields: [participanteExposicion.participanteId],
      references: [eventoEdicionParticipante.id]
    }),
    disciplina: one(discipline, {
      fields: [participanteExposicion.disciplinaId],
      references: [discipline.id]
    }),
    agrupacion: one(agrupacion, {
      fields: [participanteExposicion.agrupacionId],
      references: [agrupacion.id]
    }),
    modoIngreso: one(modoIngreso, {
      fields: [participanteExposicion.modoIngresoId],
      references: [modoIngreso.id]
    })
  })
)

export const participanteActividadRelations = relations(
  participanteActividad,
  ({ one }) => ({
    artista: one(artista, {
      fields: [participanteActividad.artistaId],
      references: [artista.id]
    }),
    eventoEdicion: one(eventoEdicion, {
      fields: [participanteActividad.eventoEdicionId],
      references: [eventoEdicion.id]
    }),
    postulacion: one(eventoEdicionPostulacion, {
      fields: [participanteActividad.postulacionId],
      references: [eventoEdicionPostulacion.id]
    }),
    participante: one(eventoEdicionParticipante, {
      fields: [participanteActividad.participanteId],
      references: [eventoEdicionParticipante.id]
    }),
    tipoActividad: one(tipoActividad, {
      fields: [participanteActividad.tipoActividadId],
      references: [tipoActividad.id]
    }),
    agrupacion: one(agrupacion, {
      fields: [participanteActividad.agrupacionId],
      references: [agrupacion.id]
    }),
    modoIngreso: one(modoIngreso, {
      fields: [participanteActividad.modoIngresoId],
      references: [modoIngreso.id]
    }),
    actividad: one(actividad, {
      fields: [participanteActividad.id],
      references: [actividad.participanteActividadId]
    })
  })
)

export const actividadRelations = relations(actividad, ({ one }) => ({
  participanteActividad: one(participanteActividad, {
    fields: [actividad.participanteActividadId],
    references: [participanteActividad.id]
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
