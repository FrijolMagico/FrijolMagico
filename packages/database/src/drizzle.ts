import { drizzle } from 'drizzle-orm/libsql'
import { getTursoClient } from './client'
import { core, artist, events, participations, auth } from './db/schema/index'
import * as relations from './db/relations'

/**
 * Drizzle ORM database client
 *
 * This client provides type-safe database operations using Drizzle ORM.
 * It uses the same underlying libSQL client as the raw client.
 *
 * @example
 * ```typescript
 * import { db } from '@frijolmagico/database/drizzle'
 * import { artista } from '@frijolmagico/database/schema'
 *
 * // Simple query
 * const artistas = await db.select().from(artista)
 *
 * // Query with relations
 * const artistasConImagenes = await db.query.artista.findMany({
 *   with: {
 *     imagenes: true,
 *     estado: true
 *   }
 * })
 * ```
 */
export const db = drizzle(getTursoClient(), {
  schema: {
    ...core,
    ...artist,
    ...events,
    ...participations,
    ...auth,
    ...relations
  }
})

// Re-export schema and types for convenience
export * from './db/schema/index'
export * from './db/types'
export * as relations from './db/relations'
