// import type { UseBoundStore, StoreApi } from 'zustand'
// import {
//   JOURNAL_ENTITIES,
//   type JournalEntity
// } from '@/shared/lib/database-entities'
//

/**
 * Zustand store hook type returned by createEntityUIStateStore.
 * This is what create<EntityUIStateStore<T>>() returns.
 */
// type EntityStoreHook<T = unknown> = UseBoundStore<
//   StoreApi<EntityUIStateStore<T>>
// >
//
// const entityRegistry = new Map<JournalEntity, EntityStoreHook>()
//
// export function registerEntity<T>(
//   entity: JournalEntity,
//   store: EntityStoreHook<T>
// ): void {
//   entityRegistry.set(entity, store as EntityStoreHook)
// }
//
// export function getStoreForEntity<T>(
//   entity: JournalEntity
// ): EntityStoreHook<T> | undefined {
//   return entityRegistry.get(entity) as EntityStoreHook<T> | undefined
// }
//
// export function getRegisteredEntities(): JournalEntity[] {
//   return Array.from(entityRegistry.keys())
// }
//
// registerEntity(JOURNAL_ENTITIES.ORGANIZACION, useOrganizationUIStore)
// registerEntity(
//   JOURNAL_ENTITIES.ORGANIZACION_EQUIPO,
//   useOrganizacionEquipoUIStore
// )
// registerEntity(JOURNAL_ENTITIES.ARTISTA, useArtistaUIStore)
// registerEntity(JOURNAL_ENTITIES.CATALOGO_ARTISTA, useCatalogoArtistaUIStore)
