import { sql } from 'drizzle-orm'
import {
  sqliteTable,
  text,
  integer,
  index,
  uniqueIndex
} from 'drizzle-orm/sqlite-core'

/**
 * Artista Estado - Catálogo de estados de artistas
 */
export const artistaEstado = sqliteTable('artista_estado', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  slug: text('slug').notNull().unique(),
  createdAt: text('created_at')
    .notNull()
    .default(sql`CURRENT_TIMESTAMP`),
  updatedAt: text('updated_at')
    .notNull()
    .default(sql`CURRENT_TIMESTAMP`)
})

/**
 * Artista - Artistas registrados en el sistema
 */
export const artista = sqliteTable(
  'artista',
  {
    id: integer('id').primaryKey({ autoIncrement: true }),
    estadoId: integer('estado_id')
      .notNull()
      .default(1)
      .references(() => artistaEstado.id),
    nombre: text('nombre'),
    pseudonimo: text('pseudonimo').notNull().unique(),
    slug: text('slug').notNull().unique(),
    rut: text('rut').unique(),
    correo: text('correo'),
    rrss: text('rrss'),
    ciudad: text('ciudad'),
    pais: text('pais'),
    createdAt: text('created_at')
      .notNull()
      .default(sql`CURRENT_TIMESTAMP`),
    updatedAt: text('updated_at')
      .notNull()
      .default(sql`CURRENT_TIMESTAMP`)
  },
  (table) => [
    uniqueIndex('idx_artista_slug').on(table.slug),
    uniqueIndex('idx_artista_correo_pseudonimo')
      .on(table.correo, table.pseudonimo)
      .where(sql`${table.correo} IS NOT NULL`),
    index('idx_artista_estado').on(table.estadoId)
  ]
)

/**
 * Artista Imagen - Imágenes asociadas a artistas
 */
export const artistaImagen = sqliteTable(
  'artista_imagen',
  {
    id: integer('id').primaryKey({ autoIncrement: true }),
    artistaId: integer('artista_id')
      .notNull()
      .references(() => artista.id),
    imagenUrl: text('imagen_url').notNull(),
    tipo: text('tipo', { enum: ['avatar', 'galeria'] }).notNull(),
    orden: integer('orden').notNull().default(1),
    metadata: text('metadata'),
    createdAt: text('created_at')
      .notNull()
      .default(sql`CURRENT_TIMESTAMP`),
    updatedAt: text('updated_at')
      .notNull()
      .default(sql`CURRENT_TIMESTAMP`)
  },
  (table) => [
    index('idx_artista_imagen_artista').on(table.artistaId),
    index('idx_artista_imagen_artista_tipo').on(table.artistaId, table.tipo)
  ]
)

/**
 * Artista Historial - Historial de cambios de artistas
 */
export const artistaHistorial = sqliteTable(
  'artista_historial',
  {
    id: integer('id').primaryKey({ autoIncrement: true }),
    artistaId: integer('artista_id')
      .notNull()
      .references(() => artista.id),
    pseudonimo: text('pseudonimo'),
    correo: text('correo'),
    rrss: text('rrss'),
    ciudad: text('ciudad'),
    pais: text('pais'),
    orden: integer('orden').notNull().default(1),
    createdAt: text('created_at')
      .notNull()
      .default(sql`CURRENT_TIMESTAMP`),
    notas: text('notas')
  },
  (table) => [
    uniqueIndex('uq_artista_historial_orden').on(table.artistaId, table.orden),
    index('idx_artista_historial_artista').on(table.artistaId),
    index('idx_artista_historial_pseudonimo').on(table.pseudonimo),
    index('idx_artista_historial_orden').on(table.artistaId, table.orden)
  ]
)

/**
 * Catalogo Artista - Artistas en el catálogo público
 */
export const catalogoArtista = sqliteTable(
  'catalogo_artista',
  {
    id: integer('id').primaryKey({ autoIncrement: true }),
    artistaId: integer('artista_id')
      .notNull()
      .unique()
      .references(() => artista.id),
    orden: text('orden').notNull(),
    destacado: integer('destacado', { mode: 'boolean' })
      .notNull()
      .default(false),
    activo: integer('activo', { mode: 'boolean' }).notNull().default(true),
    descripcion: text('descripcion'),
    createdAt: text('created_at')
      .notNull()
      .default(sql`CURRENT_TIMESTAMP`),
    updatedAt: text('updated_at')
      .notNull()
      .default(sql`CURRENT_TIMESTAMP`)
  },
  (table) => [
    index('idx_catalogo_artista_orden').on(table.orden),
    index('idx_catalogo_artista_activo').on(table.activo),
    index('idx_catalogo_artista_destacado').on(table.destacado)
  ]
)

/**
 * Agrupacion - Agrupaciones de artistas
 */
export const agrupacion = sqliteTable('agrupacion', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  nombre: text('nombre').unique().notNull(),
  descripcion: text('descripcion'),
  correo: text('correo'),
  createdAt: text('created_at')
    .notNull()
    .default(sql`CURRENT_TIMESTAMP`),
  updatedAt: text('updated_at')
    .notNull()
    .default(sql`CURRENT_TIMESTAMP`)
})
