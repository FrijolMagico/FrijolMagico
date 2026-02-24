import { sql } from 'drizzle-orm'
import {
  sqliteTable,
  text,
  integer,
  index,
  uniqueIndex
} from 'drizzle-orm/sqlite-core'

import { eventoEdicion, eventoEdicionPostulacion } from './events'
import { agrupacion, artista } from './artist'
import { discipline } from './core'

/**
 * Tipo Actividad - Catálogo de tipos de actividades
 */
export const tipoActividad = sqliteTable('tipo_actividad', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  slug: text('slug').notNull().unique(),
  descripcion: text('descripcion'),
  createdAt: text('created_at')
    .notNull()
    .default(sql`CURRENT_TIMESTAMP`),
  updatedAt: text('updated_at')
    .notNull()
    .default(sql`CURRENT_TIMESTAMP`)
})

/**
 * Modo Ingreso - Catálogo de modos de ingreso de participantes
 */
export const modoIngreso = sqliteTable('modo_ingreso', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  slug: text('slug').notNull().unique(),
  descripcion: text('descripcion'),
  createdAt: text('created_at')
    .notNull()
    .default(sql`CURRENT_TIMESTAMP`),
  updatedAt: text('updated_at')
    .notNull()
    .default(sql`CURRENT_TIMESTAMP`)
})

/**
 * Evento Edicion Participante - Participantes en ediciones de eventos (tabla maestra)
 */
export const eventoEdicionParticipante = sqliteTable(
  'evento_edicion_participante',
  {
    id: integer('id').primaryKey({ autoIncrement: true }),
    eventoEdicionId: integer('evento_edicion_id')
      .notNull()
      .references(() => eventoEdicion.id, { onDelete: 'cascade' }),
    artistaId: integer('artista_id')
      .notNull()
      .references(() => artista.id, { onDelete: 'cascade' }),
    estado: text('estado', {
      enum: ['renuncia', 'expulsado', 'cancelado', 'activo', 'completado']
    })
      .notNull()
      .default('activo'),
    notas: text('notas'),
    createdAt: text('created_at')
      .notNull()
      .default(sql`CURRENT_TIMESTAMP`),
    updatedAt: text('updated_at')
      .notNull()
      .default(sql`CURRENT_TIMESTAMP`)
  },
  (table) => [
    uniqueIndex('uq_participante').on(table.artistaId, table.eventoEdicionId),
    index('idx_participante_evento_edicion').on(table.eventoEdicionId),
    index('idx_participante_artista').on(table.artistaId),
    index('idx_participante_estado').on(table.estado)
  ]
)

/**
 * Participante Exposicion - Participantes en sección de exposición
 */
export const participanteExposicion = sqliteTable(
  'participante_exposicion',
  {
    id: integer('id').primaryKey({ autoIncrement: true }),
    artistaId: integer('artista_id')
      .notNull()
      .references(() => artista.id, { onDelete: 'restrict' }),
    eventoEdicionId: integer('evento_edicion_id')
      .notNull()
      .references(() => eventoEdicion.id, { onDelete: 'restrict' }),
    postulacionId: integer('postulacion_id').references(
      () => eventoEdicionPostulacion.id,
      { onDelete: 'restrict' }
    ),
    participanteId: integer('participante_id').references(
      () => eventoEdicionParticipante.id,
      { onDelete: 'restrict' }
    ),
    disciplinaId: integer('disciplina_id')
      .notNull()
      .references(() => discipline.id),
    agrupacionId: integer('agrupacion_id').references(() => agrupacion.id),
    modoIngresoId: integer('modo_ingreso_id')
      .notNull()
      .default(1)
      .references(() => modoIngreso.id),
    puntaje: integer('puntaje'),
    estado: text('estado', {
      enum: [
        'seleccionado',
        'confirmado',
        'desistido',
        'cancelado',
        'ausente',
        'completado'
      ]
    })
      .notNull()
      .default('seleccionado'),
    notas: text('notas'),
    createdAt: text('created_at')
      .notNull()
      .default(sql`CURRENT_TIMESTAMP`),
    updatedAt: text('updated_at')
      .notNull()
      .default(sql`CURRENT_TIMESTAMP`)
  },
  (table) => [
    uniqueIndex('uq_exposicion_artista_evento').on(
      table.artistaId,
      table.eventoEdicionId
    ),
    index('idx_exposicion_artista').on(table.artistaId),
    index('idx_exposicion_evento_edicion').on(table.eventoEdicionId),
    index('idx_exposicion_postulacion').on(table.postulacionId),
    index('idx_exposicion_participante').on(table.participanteId),
    index('idx_exposicion_estado').on(table.estado),
    index('idx_exposicion_disciplina').on(table.disciplinaId),
    index('idx_exposicion_agrupacion').on(table.agrupacionId),
    index('idx_exposicion_modo_ingreso').on(table.modoIngresoId),
    index('idx_exposicion_puntaje')
      .on(table.puntaje)
      .where(sql`${table.puntaje} IS NOT NULL`)
  ]
)

/**
 * Participante Actividad - Participantes en actividades
 */
export const participanteActividad = sqliteTable(
  'participante_actividad',
  {
    id: integer('id').primaryKey({ autoIncrement: true }),
    artistaId: integer('artista_id')
      .notNull()
      .references(() => artista.id, { onDelete: 'restrict' }),
    eventoEdicionId: integer('evento_edicion_id')
      .notNull()
      .references(() => eventoEdicion.id, { onDelete: 'restrict' }),
    postulacionId: integer('postulacion_id').references(
      () => eventoEdicionPostulacion.id,
      { onDelete: 'restrict' }
    ),
    participanteId: integer('participante_id').references(
      () => eventoEdicionParticipante.id,
      { onDelete: 'restrict' }
    ),
    tipoActividadId: integer('tipo_actividad_id')
      .notNull()
      .references(() => tipoActividad.id),
    agrupacionId: integer('agrupacion_id').references(() => agrupacion.id),
    modoIngresoId: integer('modo_ingreso_id')
      .notNull()
      .default(2)
      .references(() => modoIngreso.id),
    puntaje: integer('puntaje'),
    estado: text('estado', {
      enum: [
        'seleccionado',
        'confirmado',
        'desistido',
        'cancelado',
        'ausente',
        'completado'
      ]
    })
      .notNull()
      .default('seleccionado'),
    notas: text('notas'),
    createdAt: text('created_at')
      .notNull()
      .default(sql`CURRENT_TIMESTAMP`),
    updatedAt: text('updated_at')
      .notNull()
      .default(sql`CURRENT_TIMESTAMP`)
  },
  (table) => [
    index('idx_actividad_artista').on(table.artistaId),
    index('idx_actividad_evento_edicion').on(table.eventoEdicionId),
    index('idx_actividad_postulacion').on(table.postulacionId),
    index('idx_actividad_participante').on(table.participanteId),
    index('idx_actividad_estado').on(table.estado),
    index('idx_actividad_tipo_actividad').on(table.tipoActividadId),
    index('idx_actividad_agrupacion').on(table.agrupacionId),
    index('idx_actividad_modo_ingreso').on(table.modoIngresoId),
    index('idx_actividad_puntaje')
      .on(table.puntaje)
      .where(sql`${table.puntaje} IS NOT NULL`)
  ]
)

/**
 * Actividad - Detalles de actividades programadas
 */
export const actividad = sqliteTable(
  'actividad',
  {
    id: integer('id').primaryKey({ autoIncrement: true }),
    participanteActividadId: integer('participante_actividad_id')
      .unique()
      .notNull()
      .references(() => participanteActividad.id, { onDelete: 'cascade' }),
    titulo: text('titulo'),
    descripcion: text('descripcion'),
    duracionMinutos: integer('duracion_minutos'),
    ubicacion: text('ubicacion'),
    horaInicio: text('hora_inicio'),
    cupos: integer('cupos'),
    createdAt: text('created_at')
      .notNull()
      .default(sql`CURRENT_TIMESTAMP`),
    updatedAt: text('updated_at')
      .notNull()
      .default(sql`CURRENT_TIMESTAMP`)
  },
  (table) => [
    index('idx_actividad_participante_actividad').on(
      table.participanteActividadId
    )
  ]
)
